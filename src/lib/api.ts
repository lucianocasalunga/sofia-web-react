/**
 * Cliente API para Sofia LiberNet Backend
 * Integração com Flask API (JWT Authentication)
 */

const API_BASE = '/api';
const TOKEN_KEY = 'sofia-auth-token';

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
  email: string;
  role: string;
  plan: string;
  tokens_used: number;
}

/**
 * Helper para obter token do localStorage
 */
function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Helper para salvar token no localStorage
 */
function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Helper para remover token do localStorage
 */
function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Helper para criar headers com JWT
 */
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

/**
 * Login do usuário (JWT)
 */
export async function login(email: string, password: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      // Salvar token no localStorage
      saveToken(data.token);
      // Retornar dados do usuário
      return data.user;
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

/**
 * Logout do usuário (JWT)
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Sempre remover token local
    removeToken();
  }
}

/**
 * Obter usuário atual (JWT)
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = getToken();
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE}/user`, {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      return await response.json();
    }

    // Token inválido - limpar
    if (response.status === 401) {
      removeToken();
    }

    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Listar chats do usuário (JWT)
 */
export async function listChats(): Promise<Chat[]> {
  try {
    const response = await fetch(`${API_BASE}/chats`, {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('List chats error:', error);
    return [];
  }
}

/**
 * Criar novo chat (JWT)
 */
export async function createChat(name: string): Promise<Chat | null> {
  try {
    const response = await fetch(`${API_BASE}/chats`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Create chat error:', error);
    return null;
  }
}

/**
 * Enviar mensagem para Sofia (JWT)
 */
export async function sendMessage(chatId: string, content: string): Promise<ChatMessage | null> {
  try {
    const response = await fetch(`${API_BASE}/chats/${chatId}/message`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message: content }),
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Send message error:', error);
    return null;
  }
}

/**
 * Obter histórico de mensagens de um chat (JWT)
 */
export async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
  try {
    const response = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Get chat messages error:', error);
    return [];
  }
}

/**
 * Verificar health do backend
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch('/health');
    return response.ok;
  } catch (error) {
    console.error('Health check error:', error);
    return false;
  }
}
