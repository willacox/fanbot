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
- **Startup check** — on boot, fetches last 20 messages from each monitored channel to catch anything missed while offline

## Data Flow Rules
1. Target bot (Will the ROCKET 机器人, ID 1326346496530186241) posts in monitored channel
2. Monitor detects message (live via messageCreate OR on startup via fetch)
3. Generator calls DeepSeek API (or falls back to phrases)
4. Approval service posts embed to control channel
5. Owner reacts to approve/reject
6. Approved message posted to target channel

## Non-Negotiables
- Owner approval required before any message is posted
- Bot uses a proper bot account (not a self-bot)
- .env file never committed to git

## Key Discovery
- Target user 1326346496530186241 is a **bot** ("Will the ROCKET 机器人"), not a human user — do NOT filter out bot messages from target user
