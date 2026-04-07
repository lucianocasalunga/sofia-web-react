/**
 * Cliente API para Sofia LiberNet Backend
 * 100% Nostr Authentication (NIP-07 + nsec)
 */

const API_BASE = '/api';
const TOKEN_KEY = 'sofia-auth-token';
const USER_CACHE_KEY = 'sofia-user-cache';
const NPUB_KEY = 'sofia-npub';
const PUBKEY_KEY = 'sofia-pubkey';
const KEEP_LOGGED_KEY = 'sofia-keep-logged';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  tokens_used: number;
  limit: number;
}

export interface User {
  id: string;
  name: string;
  npub: string;
  role: string;
  plan: string;
  tokens_used: number;
  token_balance?: number;
}

// ============================================================================
// TOKEN & CACHE
// ============================================================================

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Cache do perfil do usuário para acesso instantâneo */
function cacheUser(user: User): void {
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
}

function getCachedUser(): User | null {
  try {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch { /* ignore */ }
  return null;
}

function clearUserCache(): void {
  localStorage.removeItem(USER_CACHE_KEY);
  localStorage.removeItem(NPUB_KEY);
  localStorage.removeItem(PUBKEY_KEY);
  localStorage.removeItem(KEEP_LOGGED_KEY);
}

/** Salvar dados Nostr para manter logado */
export function saveNostrSession(npub: string, pubkey: string): void {
  localStorage.setItem(NPUB_KEY, npub);
  localStorage.setItem(PUBKEY_KEY, pubkey);
  localStorage.setItem(KEEP_LOGGED_KEY, 'true');
}

export function getSavedNpub(): string | null {
  return localStorage.getItem(NPUB_KEY);
}

export function getSavedPubkey(): string | null {
  return localStorage.getItem(PUBKEY_KEY);
}

export function isKeepLogged(): boolean {
  return localStorage.getItem(KEEP_LOGGED_KEY) === 'true';
}

// ============================================================================
// AUTH HEADERS
// ============================================================================

function getAuthHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ============================================================================
// NOSTR AUTH
// ============================================================================

/**
 * Login com extensão Nostr (NIP-07: Alby, nos2x, etc.)
 * Chama window.nostr.getPublicKey() e envia ao backend
 */
export async function loginNostrExtension(): Promise<User | null> {
  try {
    if (!window.nostr) {
      throw new Error('Extensão Nostr não encontrada');
    }

    const pubkey = await window.nostr.getPublicKey();

    const response = await fetch(`${API_BASE}/login/nostr-extension`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pubkey }),
    });

    if (response.ok) {
      const data = await response.json();
      saveToken(data.token);
      const user = data.user;
      if (user.token_balance === undefined && user.tokens_limit !== undefined) {
        user.token_balance = user.tokens_limit - (user.tokens_used || 0);
      }
      cacheUser(user);
      if (user.npub) {
        saveNostrSession(user.npub, pubkey);
      }
      return user;
    }
    return null;
  } catch (error) {
    console.error('Nostr extension login error:', error);
    throw error;
  }
}

/**
 * Login com chave privada (nsec)
 * Deriva pubkey no client, envia nsec ao backend, salva pubkey local
 */
export async function loginNostrNsec(nsec: string): Promise<User | null> {
  try {
    // Derivar pubkey do nsec no client para cache local
    let pubkeyHex = '';
    try {
      const { nip19, getPublicKey } = await import('nostr-tools');
      const decoded = nip19.decode(nsec);
      if (decoded.type === 'nsec') {
        pubkeyHex = getPublicKey(decoded.data);
      }
    } catch { /* fallback: backend retorna npub */ }

    const response = await fetch(`${API_BASE}/login/nostr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nsec }),
    });

    if (response.ok) {
      const data = await response.json();
      saveToken(data.token);
      const user = data.user;
      // Calcular token_balance se não vier do backend
      if (user.token_balance === undefined && user.tokens_limit !== undefined) {
        user.token_balance = user.tokens_limit - (user.tokens_used || 0);
      }
      cacheUser(user);
      if (user.npub) {
        saveNostrSession(user.npub, pubkeyHex);
      }
      return user;
    }
    return null;
  } catch (error) {
    console.error('Nostr nsec login error:', error);
    throw error;
  }
}

// ============================================================================
// USER
// ============================================================================

/**
 * Obter usuário atual — usa cache primeiro, valida com backend depois
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = getToken();
    if (!token) {
      return null;
    }

    // Retorna cache imediato se disponível (será atualizado em background)
    const cached = getCachedUser();

    const response = await fetch(`${API_BASE}/user`, {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const user = await response.json();
      if (user.token_balance === undefined && user.tokens_limit !== undefined) {
        user.token_balance = user.tokens_limit - (user.tokens_used || 0);
      }
      cacheUser(user);
      return user;
    }

    if (response.status === 401) {
      removeToken();
      clearUserCache();
      return null;
    }

    // Se backend falhou mas temos cache, usar cache
    return cached;
  } catch (error) {
    console.error('Get current user error:', error);
    // Offline? Usar cache
    return getCachedUser();
  }
}

/**
 * Logout — limpa tudo
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch { /* ignore */ }
  removeToken();
  clearUserCache();
}

// ============================================================================
// CHATS
// ============================================================================

export async function listChats(): Promise<Chat[]> {
  try {
    const response = await fetch(`${API_BASE}/chats`, {
      headers: getAuthHeaders(),
    });
    if (response.ok) return await response.json();
    return [];
  } catch {
    return [];
  }
}

export async function createChat(name: string): Promise<Chat | null> {
  try {
    const response = await fetch(`${API_BASE}/chats`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    if (response.ok) return await response.json();
    return null;
  } catch {
    return null;
  }
}

export async function sendMessage(chatId: string, content: string): Promise<ChatMessage | null> {
  try {
    const response = await fetch(`${API_BASE}/chats/${chatId}/message`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message: content, model: 'gpt-5-internet' }),
    });
    if (response.ok) return await response.json();
    return null;
  } catch {
    return null;
  }
}

export async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
  try {
    const response = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
      headers: getAuthHeaders(),
    });
    if (response.ok) return await response.json();
    return [];
  } catch {
    return [];
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch('/health');
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================================================
// WINDOW.NOSTR TYPE
// ============================================================================

declare global {
  interface Window {
    nostr?: {
      getPublicKey(): Promise<string>;
      signEvent(event: unknown): Promise<unknown>;
      nip04?: {
        encrypt(pubkey: string, plaintext: string): Promise<string>;
        decrypt(pubkey: string, ciphertext: string): Promise<string>;
      };
    };
  }
}
