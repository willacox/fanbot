# Project Brief

## Purpose
Paxis Hype Bot — a Discord bot that monitors specific trading channels for messages from a target user, generates celebratory hype messages (mixed Chinese/English) via DeepSeek AI, queues them for owner approval in a private control channel, and posts approved messages to a chat channel.

## Scope
- Monitors channels 914880999496749056 and 938839067557265428 for user 1326346496530186241
- Generates hype via DeepSeek API (OpenAI-compatible), falls back to hardcoded phrases
- Approval flow: embed in control channel 938965977629073419 with reaction buttons
- Approved messages posted to chat channel 938839311510548520
- Does NOT include: self-bot functionality, proactive scheduled messages, database logging
