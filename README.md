<div align="center">

# 🎨 Sofia Web React

**Interface Moderna para Sofia AI** • **React + TypeScript + Tailwind**

Frontend moderno e responsivo para a Sofia, a primeira IA nativa do protocolo Nostr.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3+-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)

[Backend Principal](#-stack-tecnol%C3%B3gico) • [Instalação](#-instala%C3%A7%C3%A3o) • [Contribuir](#-como-contribuir)

</div>

---

## 📋 Sobre

**SOFIA** = **S**istema **O**peracional de **F**uncionalidades **I**nteligentes **A**utônomas
*(**S**mart **O**perational **F**ramework for **I**ntelligent **A**ssistance)*

Este é o **frontend React moderno** para a [Sofia AI](https://github.com/lucianocasalunga/sofia-web), oferecendo uma interface limpa e responsiva inspirada em design Apple-style.

### ✨ Características

- 🎨 **Design Moderno** - Interface limpa inspirada em Apple
- 🌓 **Dark/Light Mode** - Tema claro, escuro ou automático
- 📱 **Totalmente Responsivo** - Desktop, tablet e mobile
- ⚡ **Performance** - Vite + React 18 para máxima velocidade
- 🔒 **TypeScript** - Type-safe em todo o código
- 🎯 **Componentizado** - Arquitetura modular e reutilizável

---

## 🚀 Stack Tecnológico

### Frontend
- **React 18** - Biblioteca UI moderna
- **TypeScript 5** - Type safety
- **Tailwind CSS 3** - Utility-first CSS
- **Vite 5** - Build tool ultra-rápido
- **Lucide Icons** - Ícones estilo Apple

### Backend (Separado)
- Veja: [sofia-web](https://github.com/lucianocasalunga/sofia-web)
- Python 3.12 + Flask
- GPT-4o (OpenAI)
- Nostr + Lightning Network

---

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ e npm
- Backend Sofia rodando (veja [sofia-web](https://github.com/lucianocasalunga/sofia-web))

### Passos

```bash
# Clone o repositório
git clone https://github.com/lucianocasalunga/sofia-web-react.git
cd sofia-web-react

# Instale dependências
npm install

# Configure o ambiente (opcional)
cp .env.example .env
# Edite .env se o backend não estiver em localhost:5051

# Rode em desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

---

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento com hot reload
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint do código
npm run lint

# Type check
npm run type-check
```

---

## 📁 Estrutura do Projeto

```
sofia-web-react/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthContext.tsx      # Contexto de autenticação
│   │   ├── chat/
│   │   │   ├── chat-view.tsx        # Área principal de mensagens
│   │   │   ├── chat-input.tsx       # Input com envio
│   │   │   └── message-bubble.tsx   # Bolhas de mensagem
│   │   ├── layout/
│   │   │   ├── left-sidebar.tsx     # Sidebar de conversas
│   │   │   └── right-sidebar.tsx    # Painel de sessão
│   │   └── ui/
│   │       ├── sofia-logo.tsx       # Logo SVG Sofia
│   │       └── theme-switcher.tsx   # Alternador de tema
│   ├── lib/
│   │   └── api.ts                   # Cliente API Flask
│   ├── pages/
│   │   ├── ChatPage.tsx             # Página principal do chat
│   │   └── LoginPage.tsx            # Página de login
│   ├── App.tsx                      # App principal
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Estilos globais
├── public/
│   └── assets/                      # Imagens e ícones
├── package.json
├── vite.config.ts                   # Configuração do Vite
├── tailwind.config.js               # Configuração do Tailwind
└── tsconfig.json                    # Configuração do TypeScript
```

---

## 🎨 Features Implementadas

### ✅ Autenticação
- [x] Login com Nostr (NIP-07)
- [x] Login com nsec (chave privada)
- [x] Gestão de sessão via JWT
- [x] Logout seguro

### ✅ Chat
- [x] Múltiplas conversas
- [x] Mensagens em tempo real
- [x] Upload de arquivos
- [x] Histórico de mensagens
- [x] Busca de conversas

### ✅ Interface
- [x] Dark/Light mode
- [x] Sidebars responsivas
- [x] Animações suaves
- [x] Loading states
- [x] Error handling

---

## 🔗 Integração com Backend

O frontend se comunica com o backend Flask via API REST:

```typescript
// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5051';

// Exemplos de endpoints:
GET    /api/chats                 // Lista conversas
POST   /api/chats                 // Nova conversa
GET    /api/chats/:id/messages    // Mensagens de uma conversa
POST   /api/chats/:id/message     // Envia mensagem
POST   /api/auth/login            // Login
POST   /api/auth/logout           // Logout
```

---

## 🚀 Deploy

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`.

### Servir com Nginx/Caddy

```nginx
# Exemplo Nginx
server {
    listen 80;
    server_name sofia.libernet.app;

    root /path/to/sofia-web-react/dist;
    index index.html;

    # Proxy para API
    location /api {
        proxy_pass http://localhost:5051;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```caddy
# Exemplo Caddy
sofia.libernet.app {
    root * /path/to/sofia-web-react/dist
    file_server

    handle /api/* {
        reverse_proxy localhost:5051
    }

    try_files {path} /index.html
}
```

---

## 🤝 Como Contribuir

Contribuições são bem-vindas!

```bash
# 1. Fork o projeto
# 2. Crie uma branch
git checkout -b feature/MinhaFeature

# 3. Commit suas mudanças
git commit -m 'feat: adiciona MinhaFeature'

# 4. Push para a branch
git push origin feature/MinhaFeature

# 5. Abra um Pull Request
```

### Diretrizes
- Use commits semânticos (feat, fix, docs, style, refactor, test, chore)
- Siga o estilo de código do projeto (ESLint + Prettier)
- Adicione testes quando aplicável
- Atualize a documentação

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🌐 Links

- **Backend Sofia:** https://github.com/lucianocasalunga/sofia-web
- **Demo ao Vivo:** https://sofia.libernet.app
- **LiberNet:** https://libernet.app
- **Nostr:** npub1wap4j2pxu4sa5l2q7yyah0wxdtqmzh40zv63vhw3r4prgnk826fsn0rc6a

---

## 👨‍💻 Autor

<table>
  <tr>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/83137464?v=4" width="100px;" alt="Barak"/><br />
      <sub><b>Barak (Luciano)</b></sub><br />
      <sub>Desenvolvedor Principal</sub>
    </td>
    <td align="center">
      <sub><b>Claude (Sofia)</b></sub><br />
      <sub>IA Engenheira</sub>
    </td>
  </tr>
</table>

---

<div align="center">

**Sofia Web React** - Desenvolvido com 💜 para a comunidade Nostr

*Frontend moderno para a IA mais livre do protocolo*

[![LiberNet](https://img.shields.io/badge/LiberNet-Ecosystem-8B5CF6?style=for-the-badge)](https://libernet.app)

</div>
