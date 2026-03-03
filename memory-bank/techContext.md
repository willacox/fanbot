# Technical Context

## Languages
- JavaScript (Node.js, CommonJS modules)

## Frameworks / Libraries
- discord.js v14 — Discord bot framework
- openai npm package — used with DeepSeek API (OpenAI-compatible endpoint)
- dotenv — environment variable loading

## Tooling
- npm — package manager
- No linter or test framework configured yet

## Runtime / Environment
- Node.js v25.2.1 (local)
- Railway for production deployment
- Windows 11 (development)

## Constraints
- DeepSeek API at https://api.deepseek.com (model: deepseek-chat)
- Requires Discord bot with Message Content privileged intent
- No database — Discord itself serves as the approval queue
