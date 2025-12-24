# Sofia LiberNet - Interface React Moderna

**SOFIA** = **S**istema **O**peracional de **F**uncionalidades **I**nteligentes **A**utônomas
*(**S**mart **O**perational **F**ramework for **I**ntelligent **A**ssistance)*

**Status:** 🟡 Frontend implementado, aguardando correção do backend

---

## 📋 O que foi feito

### ✅ Novo Frontend React + TypeScript
- Interface moderna e responsiva com Tailwind CSS
- Componentes modulares e reutilizáveis
- Sistema de autenticação integrado
- Chat em tempo real com histórico
- Sidebars dinâmicas (conversas + painel de sessão)
- Tema claro/escuro/sistema
- Ícones Lucide (estilo Apple)
- **TODOS OS MOCKS REMOVIDOS** - integração real com API

### 🗂️ Estrutura do projeto

```
sofia-web-react/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthContext.tsx      # Contexto de autenticação
│   │   ├── chat/
│   │   │   ├── chat-view.tsx        # Área de mensagens
│   │   │   ├── chat-input.tsx       # Input com envio
│   │   │   └── message-bubble.tsx   # Bolhas de mensagem
│   │   ├── layout/
│   │   │   ├── left-sidebar.tsx     # Sidebar de chats
│   │   │   └── right-sidebar.tsx    # Painel de sessão
│   │   └── ui/
│   │       ├── sofia-logo.tsx       # Logo SVG Sofia
│   │       └── theme-switcher.tsx   # Alternador de tema
│   ├── lib/
│   │   └── api.ts                   # Cliente API Flask
│   ├── pages/
│   │   ├── ChatPage.tsx             # Página principal
│   │   └── LoginPage.tsx            # Página de login
│   ├── App.tsx                      # App principal
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Estilos globais
├── package.json
├── vite.config.ts                   # Config Vite + proxy
├── tailwind.config.js
└── tsconfig.json
```

---

## 🔴 Por que Sofia não responde - Análise Técnica

### Problema raiz: Backend Flask com erro 401

**Diagnóstico:**
De acordo com a memória compartilhada (`/opt/memoria_sofia.md`), o backend Flask atual em `/mnt/projetos/sofia-web/` tem um problema persistente:

- **Erro:** `401 Unauthorized` nas chamadas de API
- **Causa:** Flask-Login + Docker + Caddy Proxy não enviam cookies corretamente
- **Rotas afetadas:** `/api/chats`, `/api/chats/{id}/message`
- **Histórico:** Múltiplas tentativas de correção falharam (11/11/2025)

**Tentativas anteriores (sem sucesso):**
1. SECRET_KEY fixa no .env
2. Configurações de sessão (PERMANENT_SESSION_LIFETIME, etc)
3. CORS configurado com supports_credentials
4. Decorator @api_login_required customizado
5. credentials: 'include' em todos os fetch()
6. SESSION_COOKIE_SAMESITE, HTTPONLY, DOMAIN configurados

### Backend está funcional (parcialmente)

**✅ O que funciona:**
- Container `sofia-web` está rodando (porta 5051)
- Health check: `/health` retorna OK
- Autenticação via página web funciona
- GPT-4o configurado e operacional
- Sistema de ML implementado

**❌ O que NÃO funciona:**
- APIs REST retornam 401 quando chamadas via AJAX
- Cookies de sessão não sendo enviados corretamente
- Frontend não consegue se comunicar com backend

---

## 💡 Soluções Recomendadas

### Opção 1: Migrar para JWT (RECOMENDADO)
**Por quê:** Flask-Login usa cookies de sessão que são problemáticos com Docker + Caddy + CORS

**Como fazer:**
1. Substituir Flask-Login por Flask-JWT-Extended
2. Login retorna token JWT
3. Frontend armazena token em localStorage
4. Todas as requisições enviam `Authorization: Bearer <token>`
5. Remove complexidade de cookies

**Vantagens:**
- ✅ Resolve problema de cookies
- ✅ Mais moderno e escalável
- ✅ Funciona bem com SPA (Single Page Application)
- ✅ Melhor para APIs REST

### Opção 2: Reimplementar com FastAPI
**Por quê:** FastAPI é mais moderno, performático e tem melhor suporte a async

**Como fazer:**
1. Reescrever backend em FastAPI (Python 3.10+)
2. Usar JWT para autenticação
3. Async/await para chamadas à OpenAI
4. Pydantic para validação de dados

**Vantagens:**
- ✅ Performance superior
- ✅ Documentação automática (OpenAPI)
- ✅ Type hints nativos
- ✅ Async suporte nativo

### Opção 3: Simplificar - Remover autenticação (uso interno)
**Por quê:** Se Sofia é só para uso interno de Barak

**Como fazer:**
1. Remover Flask-Login completamente
2. APIs abertas (sem auth)
3. Proteger com firewall/VPN ao invés de auth

**Vantagens:**
- ✅ Simplicidade máxima
- ✅ Foco no core (IA)
- ⚠️ Menos seguro (só para uso interno)

---

## 🤖 Qual IA usar para Sofia?

### Configuração Atual (RECOMENDADO MANTER)

**Modelo:** `gpt-4o` (OpenAI)
**Motivo:** Já está configurado e funcionando via TUI

De acordo com `/mnt/projetos/sofia-web/app.py`:
```python
MODEL = os.getenv('SOFIA_MODEL', 'gpt-4o')
client = openai.OpenAI(api_key=OPENAI_API_KEY)
```

**Características:**
- ✅ GPT-4o é o modelo mais recente e capaz da OpenAI
- ✅ Multimodal (texto + imagens)
- ✅ 128k tokens de contexto
- ✅ Melhor raciocínio que GPT-3.5
- ✅ Sistema de ML implementado (embeddings + RAG)

### Alternativas (caso queira considerar)

#### 1. Claude (Anthropic) - via AWS Bedrock
**Modelo:** claude-sonnet-4-5-20250929
- Melhor para tarefas técnicas complexas
- Contexto de 200k tokens
- Mais caro que GPT-4o

#### 2. GPT-4o-mini
**Modelo:** gpt-4o-mini
- Mais barato (15x)
- Menor capacidade de raciocínio
- Bom para tarefas simples

#### 3. Modelos Open Source (Llama 3, Mistral)
- Custo zero (roda local)
- Requer GPU potente
- Menor qualidade que GPT-4o

### ⚠️ RECOMENDAÇÃO FINAL

**Manter GPT-4o:**
- Já está configurado e funcionando
- Melhor custo-benefício para uso da Sofia
- Sistema de ML (embeddings) já implementado
- Só precisa corrigir autenticação do backend

---

## 🚀 Como usar este frontend

### Instalação

```bash
cd /mnt/projetos/sofia-web-react

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
# Acessa: http://localhost:3000
```

### Build para produção

```bash
npm run build
# Arquivos gerados em dist/
```

### Integração com Caddy

Servir o build via Caddy reverse proxy:

```caddy
sofia.libernet.app {
    # Frontend React
    root * /mnt/projetos/sofia-web-react/dist
    file_server

    # API proxy para Flask
    handle /api/* {
        reverse_proxy localhost:5051
    }
    handle /health {
        reverse_proxy localhost:5051
    }
    handle /login {
        reverse_proxy localhost:5051
    }
    handle /logout {
        reverse_proxy localhost:5051
    }
}
```

---

## 📝 Próximos Passos

### 1. Corrigir Backend (PRIORIDADE ALTA)
- [ ] Implementar JWT no backend Flask OU
- [ ] Migrar para FastAPI + JWT OU
- [ ] Remover autenticação (uso interno)

### 2. Testar Frontend
- [ ] `cd /mnt/projetos/sofia-web-react`
- [ ] `npm install`
- [ ] `npm run dev`
- [ ] Testar login (backend deve estar funcionando)

### 3. Integração
- [ ] Verificar rotas da API (`/api/chats`, `/api/chats/{id}/message`)
- [ ] Testar envio de mensagens
- [ ] Verificar histórico de chats
- [ ] Confirmar memória compartilhada (`/opt/memoria_sofia.md`)

### 4. Deploy
- [ ] Build: `npm run build`
- [ ] Configurar Caddy
- [ ] Testar em produção

---

## 🛠️ Troubleshooting

### Erro "Cannot connect to backend"
- Verificar se container sofia-web está rodando: `docker ps | grep sofia`
- Testar health check: `curl http://localhost:5051/health`

### Erro 401 nas APIs
- Problema conhecido (descrito acima)
- Precisa implementar solução (JWT recomendado)

### Frontend não carrega
- Verificar porta 3000 não está em uso
- Rodar `npm run dev` com logs

---

## 📄 Arquivos Importantes

- **Backend Flask:** `/mnt/projetos/sofia-web/`
- **Frontend React:** `/mnt/projetos/sofia-web-react/`
- **Memória Sofia:** `/opt/memoria_sofia.md`
- **Logs Sofia:** `docker logs sofia-web`

---

**Desenvolvido por:** Claude (IA Engenheira LiberNet)
**Data:** 2025-11-13
**Status:** Frontend pronto, aguardando correção de backend
