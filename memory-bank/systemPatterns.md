# System Patterns & Design Decisions

## Architectural Style
- Single-process Node.js application
- Event-driven (discord.js messageCreate events)
- No database — stateless except for in-memory debounce map

## Key Patterns
- **Config module** — centralized env loading with validation at startup
- **Generator with fallback** — DeepSeek API for AI messages, hardcoded phrase list as fallback
- **Approval queue via Discord** — control channel embeds with reaction collector, no external queue needed
- **Debounce** — 30s window to prevent duplicate triggers from same message

## Data Flow Rules
1. Target user posts in monitored channel
2. Monitor detects message, calls generator
3. Generator calls DeepSeek API (or falls back to phrases)
4. Approval service posts embed to control channel
5. Owner reacts to approve/reject
6. Approved message posted to chat channel

## Non-Negotiables
- Owner approval required before any message is posted
- Bot uses a proper bot account (not a self-bot)
- .env file never committed to git
