# Active Context

## Current Objective
Get the Paxis Hype Bot running and connected to Discord.

## Immediate Next Task
Fix the invalid Discord bot token — get a fresh token from the Developer Portal and update .env.

## Relevant Files
- `src/index.js` — entry point
- `.env` — credentials (bot token is currently invalid)

## Constraints / Reminders
- Bot token in .env is invalid — needs to be reset at https://discord.com/developers/applications
- Must enable **Message Content Intent** under Bot → Privileged Gateway Intents
- DeepSeek API key and all channel/user IDs are already configured
- Owner user ID: 852744102684131329
