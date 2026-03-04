# Active Context

## Current Objective
Test all features end-to-end across both servers, then redeploy.

## Immediate Next Task
1. Test approval flow: ✅ approve, ❌ reject, ✏️ edit — across both servers
2. Verify AI-powered emoji reactions on owner's messages in chat channels
3. Verify Mo mentions tickers for trade alerts but not for recaps
4. Remove debug logging from monitor.js
5. Redeploy to Railway

## Relevant Files
- `src/index.js` — discord.js-selfbot-v13 with user token auth
- `src/approval.js` — three-way approval (approve/reject/edit with 5min timeout), server-aware routing
- `src/generator.js` — Mo persona + `pickReactionEmoji()` for context-aware emoji reactions
- `src/config.js` — SERVER_CHAT_MAP, chatChannels list, TARGET_USER_IDS (multiple)
- `src/monitor.js` — hype monitoring + AI emoji reactions on owner's messages

## Constraints / Reminders
- Selfbot (user token) — Discord ToS risk
- Two servers: 875099277351858256 → chat 938839311510548520, 1121213949736656966 → chat 1121667438254227506
- Two target user IDs: 1326346496530186241 (PaxisTrading), 1377055114732240946 (second server)
- Mo persona: calm, low-key, no hype stacking, no spaces between English/Chinese
- Emoji reactions: 20% chance, 40-70s delay, AI picks emoji based on message content
- Only responds to messages within 10 minutes
- Debug logging in monitor.js still needs removal
