/**
 * Nostr Profile Fetcher + Cache
 * Busca kind 0 (metadata), verifica NIP-05, busca badges NIP-58
 */

import { nip19 } from "nostr-tools"

const PROFILE_CACHE_KEY = "sofia-nostr-profiles"
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24h

export interface NostrProfile {
  pubkey: string
  npub: string
  name?: string
  display_name?: string
  picture?: string
  banner?: string
  about?: string
  nip05?: string
  nip05_verified: boolean
  lud16?: string
  badges: BadgeInfo[]
  updated_at: number
}

export interface BadgeInfo {
  id: string
  name?: string
  image?: string
  thumb?: string
}

// ============================================================================
// CACHE
// ============================================================================

function getCached(pubkey: string): NostrProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY)
    if (!raw) return null
    const cache = JSON.parse(raw)
    const entry = cache[pubkey]
    if (!entry) return null
    if (Date.now() - entry.updated_at * 1000 > CACHE_TTL) return null
    return entry
  } catch { return null }
}

function setCache(profile: NostrProfile): void {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY)
    const cache = raw ? JSON.parse(raw) : {}
    cache[profile.pubkey] = profile
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cache))
  } catch { /* storage full */ }
}

// ============================================================================
// FETCH KIND 0 via WebSocket
// ============================================================================

function fetchKind0(pubkey: string, relays: string[]): Promise<Record<string, unknown> | null> {
  return new Promise((resolve) => {
    let resolved = false
    const timeout = setTimeout(() => { if (!resolved) { resolved = true; resolve(null) } }, 8000)

    for (const relay of relays) {
      try {
        const ws = new WebSocket(relay)
        ws.onopen = () => {
          ws.send(JSON.stringify(["REQ", "p0", { kinds: [0], authors: [pubkey], limit: 1 }]))
        }
        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data)
            if (msg[0] === "EVENT" && msg[2]) {
              const metadata = JSON.parse(msg[2].content)
              if (!resolved) {
                resolved = true
                clearTimeout(timeout)
                resolve(metadata)
              }
            }
            if (msg[0] === "EOSE") {
              try { ws.send(JSON.stringify(["CLOSE", "p0"])); ws.close() } catch { /* */ }
            }
          } catch { /* */ }
        }
        ws.onerror = () => { try { ws.close() } catch { /* */ } }
        // Auto-close after 8s
        setTimeout(() => { try { ws.close() } catch { /* */ } }, 8000)
      } catch { /* */ }
    }
  })
}

// ============================================================================
// VERIFY NIP-05
// ============================================================================

async function verifyNip05(pubkey: string, nip05: string): Promise<boolean> {
  try {
    const [username, domain] = nip05.split("@")
    if (!username || !domain) return false
    const resp = await fetch(`https://${domain}/.well-known/nostr.json?name=${username}`)
    if (!resp.ok) return false
    const data = await resp.json()
    return data.names?.[username] === pubkey
  } catch {
    return false
  }
}

// ============================================================================
// FETCH BADGES (NIP-58) - kind 8 awards + kind 30009 definitions
// ============================================================================

function fetchBadges(pubkey: string, relay: string): Promise<BadgeInfo[]> {
  return new Promise((resolve) => {
    const badges: BadgeInfo[] = []
    const timeout = setTimeout(() => resolve(badges), 6000)

    try {
      const ws = new WebSocket(relay)
      ws.onopen = () => {
        // Buscar badge awards (kind 8) para este pubkey
        ws.send(JSON.stringify(["REQ", "badges", { kinds: [8], "#p": [pubkey], limit: 20 }]))
      }
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg[0] === "EVENT" && msg[2]) {
            const event = msg[2]
            // Extrair badge definition reference da tag "a"
            const aTag = event.tags?.find((t: string[]) => t[0] === "a")
            if (aTag) {
              badges.push({
                id: aTag[1],
                name: event.tags?.find((t: string[]) => t[0] === "name")?.[1],
                image: event.tags?.find((t: string[]) => t[0] === "image")?.[1],
                thumb: event.tags?.find((t: string[]) => t[0] === "thumb")?.[1],
              })
            }
          }
          if (msg[0] === "EOSE") {
            clearTimeout(timeout)
            try { ws.send(JSON.stringify(["CLOSE", "badges"])); ws.close() } catch { /* */ }
            resolve(badges)
          }
        } catch { /* */ }
      }
      ws.onerror = () => { clearTimeout(timeout); resolve(badges) }
    } catch { resolve(badges) }
  })
}

// ============================================================================
// MAIN: GET PROFILE (cache → relay → backend fallback)
// ============================================================================

const RELAYS = [
  "wss://relay.libernet.app",
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.primal.net",
]

export async function getNostrProfile(pubkey: string): Promise<NostrProfile> {
  const npub = nip19.npubEncode(pubkey)

  // 1. Cache
  const cached = getCached(pubkey)
  if (cached) return cached

  // 2. Buscar kind 0 nos relays
  const metadata = await fetchKind0(pubkey, RELAYS)

  const profile: NostrProfile = {
    pubkey,
    npub,
    name: (metadata?.name as string) || undefined,
    display_name: (metadata?.display_name as string) || undefined,
    picture: (metadata?.picture as string) || undefined,
    banner: (metadata?.banner as string) || undefined,
    about: (metadata?.about as string) || undefined,
    nip05: (metadata?.nip05 as string) || undefined,
    nip05_verified: false,
    lud16: (metadata?.lud16 as string) || undefined,
    badges: [],
    updated_at: Date.now() / 1000,
  }

  // 3. Verificar NIP-05 em paralelo com badges
  const [verified, badges] = await Promise.all([
    profile.nip05 ? verifyNip05(pubkey, profile.nip05) : Promise.resolve(false),
    fetchBadges(pubkey, RELAYS[0]),
  ])

  profile.nip05_verified = verified
  profile.badges = badges

  // 4. Cachear
  setCache(profile)

  return profile
}

export function truncateNpub(npub: string): string {
  if (npub.length <= 20) return npub
  return `${npub.slice(0, 12)}...${npub.slice(-6)}`
}
