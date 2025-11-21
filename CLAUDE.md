# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

XGarden is a Chrome extension for AI-powered interactive storytelling. It enables users to create custom story worlds, characters, and chapters with AI-driven conversations.

**Tech Stack:**
- React + TypeScript + Vite
- Chrome Extension (Manifest V3)
- IndexedDB (via `idb`) for local storage
- LangChain for AI integration (Google Gemini, OpenAI compatible)
- TailwindCSS for styling
- React Router (HashRouter)

## Development Commands

```bash
# Install dependencies (use pnpm only, not npm)
pnpm install

# Development mode with HMR
pnpm run dev

# Build for production
pnpm run build

# Type checking and linting
tsc
pnpm run lint

# Preview production build
pnpm run preview
```

### Loading Extension in Chrome

1. Build the extension: `pnpm run build`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` folder

### Development Server

- Dev server runs on port 5174
- HMR is configured for localhost:5174
- Extension popup loads from `dist/index.html`

## Core Architecture

### Data Layer (IndexedDB)

**Location:** `src/services/database.ts`

The app uses IndexedDB with the following stores:
- `characters` - NPCs and player characters
- `groups` - Character groups for multi-character conversations
- `worldbooks` - Keyword-triggered lore entries (RAG)
- `messages` - Chat history with session tracking
- `chapters` - Story chapters with backgrounds, music, and triggers
- `config` - Global settings and world defaults

**Key Interfaces:**
- `Character` - NPC/player with persona, greeting, avatar
- `Group` - Collection of character IDs
- `Worldbook` - Keyword-based context injection
- `Message` - Chat messages with role, character, and session
- `Chapter` - Story progression with triggers (time/keyword/AI judgment)
- `WorldDefaults` - World-level background image/music/description

**Multiple Worlds:**
Each world is a separate IndexedDB database named `xgarden-<worldId>`. Users can create, switch, import/export worlds.

### AI Service

**Location:** `src/services/ai.ts`

**Supported Providers:**
- Google Gemini (via `@langchain/google-genai`)
- OpenAI compatible APIs (via `@langchain/openai`)

**Key Methods:**
- `constructPrompt()` - Builds system prompt with character personas, worldbooks, and history
- `sendMessage()` - Sends message to AI with context
- `chat()` - Streaming chat for real-time responses
- `cleanAIResponse()` - Removes thinking tags, code blocks, and normalizes output

**RAG System:**
- Keyword matching for worldbook entries (comma-separated keywords)
- Vector DB structure exists (`src/services/vector-db.ts`) but not fully integrated yet
- Uses last 15 messages for context window

### Image Generation

**Location:** `src/services/jimeng.ts`

Integrates Volcengine Jimeng API for character avatars and scene illustrations.
- Proxied through background script to bypass CORS
- Supports custom width/height
- Returns image URLs

**Background Script:** `src/background/background.ts`
- Handles `GENERATE_IMAGE` message from content script
- Downloads images and converts to base64 for CORS bypass

### Component Structure

**Main Components:**
- `App.tsx` - HashRouter with routes for WorldSelector and ChatInterface
- `WorldSelector.tsx` - World creation/selection/import/export
- `ChatInterface.tsx` - Main chat UI with background images/music
- `Sidebar.tsx` - Character/group/worldbook management
- `CharacterDialog.tsx` - Character creation/editing
- `GroupDialog.tsx` - Group management
- `WorldbookPanel.tsx` - Worldbook entries and chapter management
- `ChapterDialog.tsx` - Chapter creation with triggers
- `CharacterGenerator.tsx` - AI-powered character generation

### Chapter System

Chapters auto-advance based on triggers:
- **Time-based:** After N dialogues or minutes
- **Keyword-based:** When specific keywords appear in chat
- **AI judgment:** AI decides when to progress story

Each chapter can have:
- Custom background image
- Custom background music
- Order/sequence
- Completion status

### Global Configuration

**Location:** `src/services/globalConfig.ts`

Manages extension-wide settings:
- AI provider (Gemini/OpenAI)
- API keys and endpoints
- Image generation API credentials
- Persisted in Chrome storage API

## Important Patterns

### Database Operations

Always use the `db()` function to get the current world's database:

```typescript
const database = await db();
await database.add('characters', newCharacter);
```

### Message Handling

Messages have a `sessionId` for grouping conversations:
- Group chats: Use group ID as session
- Single character: Use character ID as session

### Worldbook Context Injection

Worldbooks are triggered by keywords in recent chat history (last 15 messages):
```typescript
const keywords = worldbook.keywords.split(/[,，]/).map(k => k.trim().toLowerCase());
const isTriggered = keywords.some(keyword => conversationText.includes(keyword));
```

### Background Music & Images

- World defaults in `worldDefaults` config store
- Chapter-specific overrides in `chapters` store
- Music files expected in `public/assets/music/`
- Images can be URLs or base64 data URIs

## Configuration Files

- `manifest.json` - Chrome extension manifest (base template)
- `vite.config.ts` - Vite build config with @crxjs/vite-plugin
  - Content script injected on `gemini.google.com/*`
  - Permissions: storage, identity, tabs
  - HMR on port 5174
- `tsconfig.json` - Strict TypeScript config with Chrome types

## Common Tasks

### Adding a New Database Store

1. Update `XGardenDB` interface in `database.ts`
2. Increment `DB_VERSION` constant
3. Add store creation in `openDB()` upgrade handler
4. Create CRUD functions for the new store

### Adding a New AI Provider

1. Update `Config` interface in `database.ts` with new provider type
2. Add provider case in `AIService.createChatModel()`
3. Update settings UI to support new provider configuration

### Testing API Integrations

Use Chrome DevTools console in the extension popup:
```javascript
// Test AI service
const db = await openDB(...)
const config = await db.get('config', 'ai-config')
console.log(config)
```

## Chrome Extension Specifics

- Uses Chrome Storage API for global config (`globalConfig.ts`)
- Background service worker handles image generation proxying
- Content script injected only on Google Gemini pages (currently unused)
- Popup runs as standalone React app with HashRouter

## Known Limitations

- Vector search/embeddings not fully implemented (structure exists)
- Music files must be local (in `public/assets/music/`)
- Image generation requires Volcengine Jimeng API (optional)
- No automated tests currently

## Code Style

- Use TypeScript strict mode
- React functional components with hooks
- Async/await for database and API operations
- TailwindCSS for styling (utility-first)
- Chinese language in UI and prompts (with English fallbacks)
