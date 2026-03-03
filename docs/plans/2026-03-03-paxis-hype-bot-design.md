# Paxis Hype Bot — Design Document

## Overview
A Discord bot that monitors specific channels for messages from a target user, generates celebratory hype messages (mixed Chinese/English) via DeepSeek API, queues them for manual approval, and posts approved messages to a chat channel.

## Stack
- **Runtime:** Node.js
- **Discord library:** discord.js v14 (proper bot account)
- **AI:** DeepSeek API for message generation
- **Hosting:** Railway
- **Database:** None (Discord itself serves as the approval queue)

## Channel & User IDs
| Role | ID |
|------|----|
| Monitor Channel 1 | `914880999496749056` |
| Monitor Channel 2 | `938839067557265428` |
| Target User (trigger) | `1326346496530186241` |
| Chat Channel (output) | `938839311510548520` |
| Control Channel (approval) | `938965977629073419` |

## Architecture

```
Monitor Channels → Detect target user message
  → DeepSeek API generates hype message
  → Post proposal to Control Channel (embed with original + proposed)
  → Owner reacts ✅ to approve, ❌ to reject
  → On ✅: Post to Chat Channel
  → On ❌: Mark as skipped
```

Single process. One discord.js client, one event loop.

## File Structure
| File | Purpose |
|------|---------|
| `src/index.js` | Entry point, bot client setup, event wiring |
| `src/monitor.js` | Listens for messages from target user in target channels |
| `src/generator.js` | Calls DeepSeek API to generate hype messages |
| `src/approval.js` | Posts to control channel, listens for reactions, posts approved messages |
| `src/config.js` | Loads env vars, channel IDs, user IDs |
| `.env` | Secrets (bot token, DeepSeek API key) |
| `package.json` | Dependencies |
| `Procfile` | Railway deployment |

## Message Generation
- Prompt DeepSeek to generate short (under 15 words) enthusiastic reactions
- Mix of Chinese and English
- Examples: "NVDA 赞啊！", "Let's go! 太猛了", "Nice grab 🔥"
- Fallback: hardcoded list of ~15 phrases if API fails

## Approval Flow
1. Bot posts embed in control channel with:
   - Original triggering message
   - Proposed hype response
   - ✅ and ❌ reaction buttons
2. Owner reacts ✅ → bot posts to chat channel
3. Owner reacts ❌ → bot marks as skipped (edits embed)

## Error Handling
- DeepSeek API failure → fallback to random hardcoded phrase
- Bot disconnect → discord.js auto-reconnect
- Duplicate triggers → 30s debounce window per user message

## Environment Variables
```
DISCORD_BOT_TOKEN=
DEEPSEEK_API_KEY=
MONITOR_CHANNELS=914880999496749056,938839067557265428
TARGET_USER_ID=1326346496530186241
CHAT_CHANNEL_ID=938839311510548520
CONTROL_CHANNEL_ID=938965977629073419
```
