import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restaura sessão do localStorage
  useEffect(() => {
    const token = localStorage.getItem('sofia-auth-token')
    const cached = localStorage.getItem('sofia-user-cache')
    if (token && cached) {
      try { setUser(JSON.parse(cached)) } catch {}
    }
    setLoading(false)
  }, [])

  const saveSession = useCallback((token, userData) => {
    localStorage.setItem('sofia-auth-token', token)
    localStorage.setItem('sofia-user-cache', JSON.stringify(userData))
    localStorage.setItem('sofia-npub', userData.npub || '')
    setUser(userData)
  }, [])

  const loginExtension = useCallback(async () => {
    if (!window.nostr) throw new Error('Extensão Nostr não encontrada. Instale Alby ou nos2x.')
    const pubkey = await window.nostr.getPublicKey()
    const data = await api.loginExtension(pubkey)
    saveSession(data.token, data.user)
    return data.user
  }, [saveSession])

  const loginNsec = useCallback(async (nsec) => {
    const data = await api.loginNsec(nsec)
    saveSession(data.token, data.user)
    return data.user
  }, [saveSession])

  const logout = useCallback(() => {
    localStorage.removeItem('sofia-auth-token')
    localStorage.removeItem('sofia-user-cache')
    localStorage.removeItem('sofia-npub')
    setUser(null)
    try { api.logout() } catch {}
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, loginExtension, loginNsec, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
