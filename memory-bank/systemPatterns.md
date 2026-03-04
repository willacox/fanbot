# System Patterns & Design Decisions

## Architectural Style
- Single-process Node.js application
- Event-driven (discord.js messageCreate events)
- No database — stateless except for in-memory debounce map
- **Selfbot** — uses discord.js-selfbot-v13 with user token (not a bot account)

## Key Patterns
- **Config module** — centralized env loading with validation at startup
- **SERVER_CHAT_MAP** — maps server IDs to chat channel IDs for multi-server support
- **TARGET_USER_IDS** — comma-separated list of target user IDs (different bots per server)
- **Generator with fallback** — DeepSeek API for AI messages, hardcoded phrase list as fallback
- **Mo persona** — calm, low-key trading student; context-aware replies (trade alert → mention ticker, recap → comment overall, other → generic)
- **Three-way approval** — ✅ approve, ❌ reject, ✏️ edit (owner types replacement, 5min timeout)
- **Human-like behavior** — random delay (30-90s) + typing indicator (5s) before posting approved messages
- **AI emoji reactions** — 20% chance, 40-70s delay, DeepSeek picks contextually appropriate emoji based on owner's message content; falls back to random emoji on API failure
- **Message age limit** — only responds to messages within 10 minutes (startup check + live)
- **Debounce** — 30s window to prevent duplicate triggers from same message
- **Startup check** — on boot, fetches last 20 messages from each monitored channel (10min age filter)

## Data Flow Rules
1. Target bot posts in monitored channel (different bot ID per server)
2. Monitor detects message if within 10 minutes (live via messageCreate OR on startup via fetch)
3. Generator calls DeepSeek API (or falls back to Chinese phrases)
4. Approval service posts plain-text message to control channel with ✅❌✏️ reactions
5. Owner reacts: approve sends as-is, edit prompts for replacement text (5min), reject cancels
6. After random delay + typing simulation, final message posted to correct chat channel (via SERVER_CHAT_MAP)

## Non-Negotiables
- Owner approval required before any message is posted
- .env file never committed to git
- No spaces between English and Chinese text in Mo's messages

## Key Discoveries
- Target users are **bots** with different IDs per server — use TARGET_USER_IDS (comma-separated)
- Switched from bot account to selfbot (2026-03-03) — embeds replaced with plain text, human simulation added
