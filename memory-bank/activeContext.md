# Active Context

## Current Objective
Test all features end-to-end across both servers, then redeploy.

## Immediate Next Task
1. Test approval flow: ✅ approve, ❌ reject, ✏️ edit — across both servers
2. Verify heart reactions on owner's messages in chat channels
3. Verify Mo mentions tickers for trade alerts but not for recaps
4. Remove debug logging from monitor.js
5. Redeploy to Railway

## Relevant Files
- `src/index.js` — discord.js-selfbot-v13 with user token auth
- `src/approval.js` — three-way approval (approve/reject/edit with 5min timeout), server-aware routing
- `src/generator.js` — Mo persona: calm, mellow, context-aware (trade alert vs recap vs other)
- `src/config.js` — SERVER_CHAT_MAP and chatChannels list
- `src/monitor.js` — hype monitoring + heart reactions on owner's messages

## Constraints / Reminders
- Selfbot (user token) — Discord ToS risk
- Two servers: 875099277351858256 → chat 938839311510548520, 1121213949736656966 → chat 1121667438254227506
- Mo persona: calm, low-key, no hype stacking, no spaces between English/Chinese
- Generator distinguishes: trade alert (mention ticker) vs recap (comment on overall) vs other (generic)
- Edit flow: ✏️ reaction → Mo asks for edited text → 5min timeout → sends edited version
- Heart reaction delay: 40-70 seconds (updated from 5-30s)
- Debug logging in monitor.js still needs removal
