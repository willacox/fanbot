# Active Context

## Current Objective
Test the full bot flow end-to-end (trigger → generate → approve → post).

## Immediate Next Task
Have user 1326346496530186241 post in a monitored channel while bot is running, then approve the hype message in the control channel.

## Relevant Files
- `src/index.js` — entry point
- `.env` — all credentials configured and working

## Constraints / Reminders
- Bot successfully logged in as **Test fanbot#8601**
- Token, DeepSeek key, all channel/user IDs are configured
- Bot has been added to the server with correct permissions
- Deprecation warning about `ready` → `clientReady` is harmless (discord.js v15 prep)
- Make sure **Message Content Intent** is enabled in Developer Portal under Bot → Privileged Gateway Intents
