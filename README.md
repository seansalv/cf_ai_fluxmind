# FluxMind - AI Study Assistant

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)](https://developers.cloudflare.com/workers/)
[![Workers AI](https://img.shields.io/badge/Workers-AI-F38020?logo=cloudflare)](https://developers.cloudflare.com/workers-ai/)
[![Llama 3.3](https://img.shields.io/badge/Llama-3.3-blue)](https://ai.meta.com/llama/)

FluxMind is an AI-powered personal study assistant built entirely on Cloudflare's platform. It leverages **Llama 3.3** running on **Workers AI** for intelligent responses, **Durable Objects** for persistent state and real-time communication, and a modern React frontend.

## 🎯 Features

- **💬 Real-time Chat**: WebSocket-based chat interface with streaming AI responses
- **🧠 Powered by Llama 3.3**: Uses `@cf/meta/llama-3.3-70b-instruct-fp8-fast` on Workers AI
- **📚 Study Tools**: Create flashcards, get study tips, generate quiz questions
- **📅 Scheduling**: Schedule study sessions and reminders
- **💾 Persistent State**: Conversation history persists across sessions via Durable Objects
- **🌙 Dark/Light Mode**: Toggle between themes

## 🏗️ Architecture

This project demonstrates all required components for a Cloudflare AI application:

| Component | Implementation |
|-----------|----------------|
| **LLM** | Llama 3.3 via Workers AI (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`) |
| **Workflow/Coordination** | Cloudflare Agents SDK (Durable Objects) |
| **User Input** | Real-time chat via WebSockets |
| **Memory/State** | Durable Objects with SQLite storage |

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐    WebSocket    ┌──────────────────────┐ │
│   │   React UI  │◄──────────────►│   Chat Agent         │ │
│   │   (Vite)    │                │   (Durable Object)   │ │
│   │             │                │                      │ │
│   │ - Chat      │                │ - State Management   │ │
│   │ - Tools     │                │ - Message History    │ │
│   │ - Themes    │                │ - Scheduling         │ │
│   └─────────────┘                └──────────┬───────────┘ │
│                                             │              │
│                                             ▼              │
│                                  ┌──────────────────────┐ │
│                                  │   Workers AI         │ │
│                                  │   (Llama 3.3)        │ │
│                                  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/seansalv/cf_ai_fluxmind.git
   cd cf_ai_fluxmind
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Login to Cloudflare** (if not already)
   ```bash
   npx wrangler login
   ```

### Running Locally

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Deploying to Cloudflare

Deploy to production:

```bash
npm run deploy
```

This will:
1. Build the frontend with Vite
2. Deploy the Worker and Durable Object to Cloudflare
3. Provide you with a live URL

## 📖 Usage

### Chat Interface

Simply type your message and press Enter or click the send button. FluxMind will respond using Llama 3.3.

**Example prompts:**
- "Explain the concept of machine learning"
- "Create a flashcard about photosynthesis"
- "Give me a study tip for learning programming"
- "Schedule a study session for tomorrow at 3pm"

### Available Tools

The AI has access to these tools:

| Tool | Description |
|------|-------------|
| `createFlashcard` | Creates study flashcards with questions and answers |
| `getStudyTip` | Provides study tips for specific subjects |
| `generateQuizQuestion` | Creates practice questions at varying difficulties |
| `scheduleStudySession` | Schedules study reminders |
| `getScheduledSessions` | Lists all scheduled sessions |
| `cancelStudySession` | Cancels a scheduled session |

## 🛠️ Tech Stack

- **Runtime**: [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- **AI**: [Workers AI](https://developers.cloudflare.com/workers-ai/) with Llama 3.3
- **State**: [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- **Agent SDK**: [Cloudflare Agents](https://developers.cloudflare.com/agents/)
- **Frontend**: React 19, Vite, TailwindCSS
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai/)

## 📁 Project Structure

```
cf-ai-fluxmind/
├── src/
│   ├── server.ts      # Main Agent class with Llama 3.3 integration
│   ├── tools.ts       # AI tool definitions (flashcards, tips, etc.)
│   ├── app.tsx        # React chat interface
│   ├── client.tsx     # React entry point
│   └── components/    # UI components
├── wrangler.jsonc     # Cloudflare configuration
├── package.json
├── PROMPTS.md         # AI prompts used in development
└── README.md
```

## 📝 Configuration

The `wrangler.jsonc` file contains the Cloudflare configuration:

```jsonc
{
  "name": "cf-ai-fluxmind",
  "main": "src/server.ts",
  "ai": {
    "binding": "AI"  // Workers AI binding
  },
  "durable_objects": {
    "bindings": [{
      "name": "Chat",
      "class_name": "Chat"
    }]
  }
}
```

## 🔗 Links

- [Cloudflare Agents Documentation](https://developers.cloudflare.com/agents/)
- [Workers AI Models](https://developers.cloudflare.com/workers-ai/models/)
- [Llama 3.3 on Cloudflare](https://developers.cloudflare.com/workers-ai/models/llama-3.3-70b-instruct-fp8-fast/)

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ on Cloudflare
