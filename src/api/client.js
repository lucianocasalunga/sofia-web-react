const BASE = '/api'

function getToken() {
  return localStorage.getItem('sofia-auth-token')
}

function headers(extra = {}) {
  const h = { 'Content-Type': 'application/json', ...extra }
  const t = getToken()
  if (t) h['Authorization'] = `Bearer ${t}`
  return h
}

async function req(method, path, body) {
  const opts = { method, headers: headers(), credentials: 'include' }
  if (body) opts.body = JSON.stringify(body)
  const r = await fetch(BASE + path, opts)
  const json = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(json.error || `HTTP ${r.status}`)
  return json
}

export const api = {
  // Auth
  loginExtension: (pubkey) => req('POST', '/login/nostr-extension', { pubkey }),
  loginNsec:      (nsec)   => req('POST', '/login/nostr', { nsec }),
  logout:         ()       => req('POST', '/auth/logout', {}),

  // Chats
  listChats:    ()             => req('GET',    '/chats'),
  createChat:   (name)         => req('POST',   '/chats', { name }),
  getChat:      (id)           => req('GET',    `/chats/${id}`),
  renameChat:   (id, name)     => req('PATCH',  `/chats/${id}`, { name }),
  deleteChat:   (id)           => req('DELETE', `/chats/${id}`),
  sendMessage:  (id, message)  => req('POST',   `/chats/${id}/message`, { message, model: 'deepseek-chat' }),

  // Tokens
  getBalance:      ()       => req('GET',  '/tokens/balance'),
  getTransactions: ()       => req('GET',  '/tokens/transactions'),
  purchaseTokens:  (pkg, custom_tokens) =>
    req('POST', '/tokens/purchase', { package: pkg, ...(custom_tokens ? { custom_tokens } : {}) }),
  checkPayment:    (hash)   => req('GET',  `/tokens/check-payment/${hash}`),
}
