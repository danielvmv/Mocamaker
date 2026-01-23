# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mocamaker is a conversational mockup generator for WhatsApp Business and RCS (Rich Communication Services). It allows users to create realistic message exchange mockups through manual building or AI-powered generation.

## Development Commands

```bash
# Install dependencies
npm install

# Run local development server (port 3000)
npm start

# The app will be available at http://localhost:3000
```

For Vercel deployment, push to the repository - it auto-deploys.

## Architecture

### Frontend (Vanilla JS Modules)

The frontend uses IIFE modules that expose global objects:

- **`MessageTypes`** (`scripts/message-types.js`) - Catalog of all message types for WhatsApp and RCS platforms. Contains field definitions, validation rules, and category organization.

- **`Constructor`** (`scripts/constructor.js`) - Handles manual mode UI. Manages form state, renders dynamic fields based on selected message type, and emits `message:add` events.

- **`Renderer`** (`scripts/renderer.js`) - Converts message objects into visual mockups. Has separate render paths for WhatsApp (`renderWhatsApp*`) and RCS (`renderRCS*`). Also generates standalone HTML for export.

- **`AIGenerator`** (`scripts/ai-generator.js`) - Handles AI mode. Sends prompts to Anthropic API via `/api/generate` proxy. Includes demo mode fallback when no API key is configured.

- **`Mocamaker`** (`scripts/app.js`) - Main orchestrator. Manages global state (platform, mode, messages), coordinates between modules, handles localStorage persistence.

### Backend

- **`server.js`** - Express server for local development. Serves static files and proxies Anthropic API calls.

- **`api/generate.js`** - Vercel serverless function. Proxies requests to Anthropic API to avoid CORS issues.

### Data Flow

1. User selects platform (WhatsApp/RCS) → `Constructor.updatePlatform()` updates available message types
2. User builds message → `Constructor` collects form data and dispatches `message:add` event
3. `Mocamaker` receives event → adds to `state.messages` array → calls `Renderer.renderFull()`
4. For AI mode: description → `AIGenerator.generate()` → `/api/generate` → Claude → parsed JSON → messages added to state

### Message Object Structure

```javascript
{
  id: "msg_123",
  type: "text" | "buttons" | "rich_card" | ...,
  sender: "brand" | "user",
  platform: "whatsapp" | "rcs",
  content: { /* type-specific fields */ },
  timestamp: "12:30",
  createdBy: "manual" | "ai"
}
```

### Platform Differences

- **WhatsApp**: buttons (max 3), list menus, flows, products, location
- **RCS**: suggestion chips (max 11), rich cards, carousels, CTAs (URL, dial, location, calendar)

Both platforms share: text, image, video, audio, document, user responses.
