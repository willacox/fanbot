# Active Context

## Current Objective
Test multi-server support and heart reaction feature, then redeploy.

## Immediate Next Task
1. Test approval flow across both servers — verify correct chat channel routing via SERVER_CHAT_MAP
2. Verify heart reactions appear on owner's messages in chat channels (~50% chance, 5-30s delay)
3. Remove debug logging from monitor.js
4. Redeploy to Railway with final changes

## Relevant Files
- `src/index.js` — uses discord.js-selfbot-v13 with user token auth
- `src/approval.js` — plain-text approvals, human-like delays, server-aware chat channel routing
- `src/generator.js` — Mo persona (Chinese), updated fallback phrases
- `src/config.js` — parses SERVER_CHAT_MAP and derives chatChannels list
- `src/monitor.js` — hype monitoring + random heart reactions on owner's messages

## Constraints / Reminders
- Now running as a selfbot (user token)
- Two servers: 875099277351858256 → chat 938839311510548520, 1121213949736656966 → chat 1121667438254227506
- SERVER_CHAT_MAP in .env drives chat channel routing per server
- Heart reactions: 50% chance, random emoji from ❤️💕😍🥰💗, 5-30s delay
- Debug logging in monitor.js still needs removal before production
- Railway needs redeployment after latest code changes
