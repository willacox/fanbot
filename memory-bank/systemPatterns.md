# System Patterns & Design Decisions

## Architectural Style
- Single-process Node.js application
- Event-driven (discord.js messageCreate events)
- No database — stateless except for in-memory debounce map
- **Selfbot** — uses discord.js-selfbot-v13 with user token (not a bot account)

## Key Patterns
- **Config module** — centralized env loading with validation at startup
- **SERVER_CHAT_MAP** — maps server IDs to chat channel IDs for multi-server support (env var format: `serverId:channelId,serverId:channelId`)
- **Generator with fallback** — DeepSeek API for AI messages, hardcoded phrase list as fallback
- **Mo persona** — bot responds as "Mo", a humble trading student, in Chinese
- **Approval queue via Discord** — control channel plain-text messages with reaction collector
- **Human-like behavior** — random delay (30-90s) + typing indicator (5s) before posting approved messages
- **Heart reactions** — 50% chance to react with random heart emoji (5-30s delay) on owner's messages in chat channels
- **Debounce** — 30s window to prevent duplicate triggers from same message
- **Startup check** — on boot, fetches last 20 messages from each monitored channel to catch anything missed while offline

## Data Flow Rules
1. Target bot (Will the ROCKET 机器人, ID 1326346496530186241) posts in monitored channel
2. Monitor detects message (live via messageCreate OR on startup via fetch)
3. Generator calls DeepSeek API (or falls back to Chinese phrases)
4. Approval service posts plain-text message to control channel
5. Owner reacts to approve/reject
6. After random delay + typing simulation, approved message posted to correct chat channel (via SERVER_CHAT_MAP)

## Non-Negotiables
- Owner approval required before any message is posted
- .env file never committed to git

## Key Discoveries
- Target user 1326346496530186241 is a **bot** ("Will the ROCKET 机器人"), not a human user — do NOT filter out bot messages from target user
- Switched from bot account to selfbot (2026-03-03) — embeds replaced with plain text, human simulation added
