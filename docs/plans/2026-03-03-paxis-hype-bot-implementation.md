# Paxis Hype Bot Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Discord bot that monitors channels for a target user's messages, generates hype responses via DeepSeek, queues them for owner approval, and posts approved messages to a chat channel.

**Architecture:** Single Node.js process using discord.js v14. DeepSeek API (OpenAI-compatible) generates varied hype messages. Approval flow uses Discord reactions in a private control channel — no database needed.

**Tech Stack:** Node.js, discord.js v14, openai npm package (pointed at DeepSeek), dotenv

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `.env`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `Procfile`

**Step 1: Initialize the project**

Run:
```bash
cd /c/Users/willa/Documents/Projects/fanbot
npm init -y
```

**Step 2: Install dependencies**

Run:
```bash
npm install discord.js openai dotenv
```

**Step 3: Create .env.example**

```
DISCORD_BOT_TOKEN=
DEEPSEEK_API_KEY=
MONITOR_CHANNELS=914880999496749056,938839067557265428
TARGET_USER_ID=1326346496530186241
CHAT_CHANNEL_ID=938839311510548520
CONTROL_CHANNEL_ID=938965977629073419
OWNER_USER_ID=
```

**Step 4: Create .env with the same content**

Copy `.env.example` to `.env`. User fills in secrets later.

**Step 5: Create .gitignore**

```
node_modules/
.env
```

**Step 6: Create Procfile**

```
worker: node src/index.js
```

**Step 7: Set package.json start script**

Add to `package.json` scripts:
```json
"start": "node src/index.js"
```

**Step 8: Commit**

```bash
git init
git add package.json package-lock.json .env.example .gitignore Procfile
git commit -m "chore: scaffold project with dependencies"
```

---

### Task 2: Config Module

**Files:**
- Create: `src/config.js`

**Step 1: Create src/config.js**

```js
require('dotenv').config();

const config = {
  botToken: process.env.DISCORD_BOT_TOKEN,
  deepseekApiKey: process.env.DEEPSEEK_API_KEY,
  monitorChannels: process.env.MONITOR_CHANNELS?.split(',') || [],
  targetUserId: process.env.TARGET_USER_ID,
  chatChannelId: process.env.CHAT_CHANNEL_ID,
  controlChannelId: process.env.CONTROL_CHANNEL_ID,
  ownerUserId: process.env.OWNER_USER_ID,
};

// Validate required fields
const required = ['botToken', 'deepseekApiKey', 'targetUserId', 'chatChannelId', 'controlChannelId', 'ownerUserId'];
for (const key of required) {
  if (!config[key]) {
    console.error(`Missing required env var for: ${key}`);
    process.exit(1);
  }
}

module.exports = config;
```

**Step 2: Commit**

```bash
git add src/config.js
git commit -m "feat: add config module with env validation"
```

---

### Task 3: DeepSeek Message Generator

**Files:**
- Create: `src/generator.js`

**Step 1: Create src/generator.js**

```js
const OpenAI = require('openai');
const config = require('./config');

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: config.deepseekApiKey,
});

const FALLBACK_PHRASES = [
  'LFG! 🔥',
  '太猛了！',
  'Nice grab! 赞啊',
  'Let\'s go! 牛逼',
  '🔥🔥🔥',
  'Will is on fire today 太强了',
  'Following this one! 赞',
  'Great call! 厉害',
  'Massive W! 太赞了',
  '冲冲冲! Let\'s ride!',
  'Another W! 太猛了吧',
  'Sheesh 🔥 赞啊',
  'Love this play! 太棒了',
  'Will cooking again 🔥',
  'Big moves! 牛',
];

async function generateHypeMessage(originalMessage) {
  try {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are a hype-man in a trading Discord. Generate a SHORT (under 15 words) enthusiastic reaction to a trade post. Mix Chinese and English naturally. Be varied — never use the same phrasing twice. Examples: "NVDA 赞啊！", "Let's go! 太猛了", "Nice grab 🔥 太强了", "冲冲冲！". Do NOT use markdown. Do NOT explain. Just output the hype message.`,
        },
        {
          role: 'user',
          content: `React to this trade post: "${originalMessage}"`,
        },
      ],
      max_tokens: 60,
      temperature: 1.0,
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty response');
    return text;
  } catch (err) {
    console.error('DeepSeek API error, using fallback:', err.message);
    return FALLBACK_PHRASES[Math.floor(Math.random() * FALLBACK_PHRASES.length)];
  }
}

module.exports = { generateHypeMessage };
```

**Step 2: Commit**

```bash
git add src/generator.js
git commit -m "feat: add DeepSeek hype message generator with fallback"
```

---

### Task 4: Approval Service

**Files:**
- Create: `src/approval.js`

**Step 1: Create src/approval.js**

This module posts a proposed message to the control channel and listens for the owner's reaction.

```js
const { EmbedBuilder } = require('discord.js');
const config = require('./config');

const APPROVE_EMOJI = '✅';
const REJECT_EMOJI = '❌';

async function requestApproval(client, originalMsg, hypeMessage) {
  const controlChannel = await client.channels.fetch(config.controlChannelId);

  const embed = new EmbedBuilder()
    .setTitle('Pending Hype Message')
    .addFields(
      { name: 'Triggered by', value: originalMsg.content?.slice(0, 1024) || '[attachment/embed]', inline: false },
      { name: 'Channel', value: `<#${originalMsg.channel.id}>`, inline: true },
      { name: 'Proposed response', value: hypeMessage, inline: false },
    )
    .setColor(0xffa500)
    .setTimestamp();

  const approvalMsg = await controlChannel.send({ embeds: [embed] });
  await approvalMsg.react(APPROVE_EMOJI);
  await approvalMsg.react(REJECT_EMOJI);

  return new Promise((resolve) => {
    const filter = (reaction, user) =>
      [APPROVE_EMOJI, REJECT_EMOJI].includes(reaction.emoji.name) &&
      user.id === config.ownerUserId;

    const collector = approvalMsg.createReactionCollector({
      filter,
      max: 1,
      time: 24 * 60 * 60 * 1000, // 24 hour timeout
    });

    collector.on('collect', async (reaction) => {
      if (reaction.emoji.name === APPROVE_EMOJI) {
        try {
          const chatChannel = await client.channels.fetch(config.chatChannelId);
          await chatChannel.send(hypeMessage);

          const approvedEmbed = EmbedBuilder.from(embed)
            .setColor(0x00ff00)
            .setTitle('Approved ✅');
          await approvalMsg.edit({ embeds: [approvedEmbed] });

          resolve(true);
        } catch (err) {
          console.error('Failed to send approved message:', err.message);
          resolve(false);
        }
      } else {
        const rejectedEmbed = EmbedBuilder.from(embed)
          .setColor(0xff0000)
          .setTitle('Rejected ❌');
        await approvalMsg.edit({ embeds: [rejectedEmbed] });
        resolve(false);
      }
    });

    collector.on('end', (collected) => {
      if (collected.size === 0) {
        const expiredEmbed = EmbedBuilder.from(embed)
          .setColor(0x808080)
          .setTitle('Expired ⏰');
        approvalMsg.edit({ embeds: [expiredEmbed] }).catch(() => {});
        resolve(false);
      }
    });
  });
}

module.exports = { requestApproval };
```

**Step 2: Commit**

```bash
git add src/approval.js
git commit -m "feat: add approval service with reaction-based flow"
```

---

### Task 5: Monitor Service

**Files:**
- Create: `src/monitor.js`

**Step 1: Create src/monitor.js**

```js
const config = require('./config');
const { generateHypeMessage } = require('./generator');
const { requestApproval } = require('./approval');

// Debounce: ignore duplicate triggers within 30s
const recentTriggers = new Map();
const DEBOUNCE_MS = 30_000;

function isDuplicate(messageId) {
  const now = Date.now();
  // Clean old entries
  for (const [id, timestamp] of recentTriggers) {
    if (now - timestamp > DEBOUNCE_MS) recentTriggers.delete(id);
  }
  if (recentTriggers.has(messageId)) return true;
  recentTriggers.set(messageId, now);
  return false;
}

function setupMonitor(client) {
  client.on('messageCreate', async (message) => {
    // Only react to target user in monitored channels
    if (message.author.id !== config.targetUserId) return;
    if (!config.monitorChannels.includes(message.channel.id)) return;

    // Skip bot messages
    if (message.author.bot) return;

    // Debounce
    if (isDuplicate(message.id)) return;

    console.log(`[Monitor] Detected message from target user in #${message.channel.name || message.channel.id}`);

    try {
      const hypeMessage = await generateHypeMessage(
        message.content || '[image/attachment post]'
      );
      console.log(`[Monitor] Generated hype: "${hypeMessage}"`);

      await requestApproval(client, message, hypeMessage);
    } catch (err) {
      console.error('[Monitor] Error processing message:', err.message);
    }
  });
}

module.exports = { setupMonitor };
```

**Step 2: Commit**

```bash
git add src/monitor.js
git commit -m "feat: add message monitor with debounce"
```

---

### Task 6: Bot Entry Point

**Files:**
- Create: `src/index.js`

**Step 1: Create src/index.js**

```js
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config');
const { setupMonitor } = require('./monitor');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Message,
    Partials.Reaction,
  ],
});

client.once('ready', () => {
  console.log(`[Paxis] Logged in as ${client.user.tag}`);
  console.log(`[Paxis] Monitoring channels: ${config.monitorChannels.join(', ')}`);
  console.log(`[Paxis] Target user: ${config.targetUserId}`);
  console.log(`[Paxis] Chat channel: ${config.chatChannelId}`);
  console.log(`[Paxis] Control channel: ${config.controlChannelId}`);
});

setupMonitor(client);

client.login(config.botToken);
```

**Step 2: Verify it runs (needs .env filled in)**

Run:
```bash
node src/index.js
```
Expected: Bot logs in and prints startup info. Ctrl+C to stop.

**Step 3: Commit**

```bash
git add src/index.js
git commit -m "feat: add bot entry point"
```

---

### Task 7: Manual Integration Test

**Step 1: Fill in .env with real credentials**

User must:
1. Create a Discord bot at https://discord.com/developers/applications
2. Enable MESSAGE CONTENT intent in the bot settings
3. Invite the bot to the server with permissions: Send Messages, Read Messages, Add Reactions, Embed Links
4. Add bot token and DeepSeek API key to `.env`
5. Set `OWNER_USER_ID` to your main Discord user ID

**Step 2: Run the bot**

```bash
node src/index.js
```

**Step 3: Test the flow**

1. Have user `1326346496530186241` post a message in one of the monitored channels
2. Verify: bot posts an embed in the control channel with proposed hype message
3. React ✅ on the embed
4. Verify: bot posts the hype message in the chat channel
5. Test ❌ rejection — verify embed updates to "Rejected"

**Step 4: Commit any fixes**

---

### Task 8: Railway Deployment

**Step 1: Ensure Procfile exists**

Already created in Task 1: `worker: node src/index.js`

**Step 2: Push to GitHub**

```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

**Step 3: Deploy on Railway**

1. Go to https://railway.app
2. Create new project → Deploy from GitHub repo
3. Add environment variables from `.env` in Railway dashboard
4. Verify the bot comes online in Discord

**Step 4: Verify production**

Repeat the manual test from Task 7 to confirm it works on Railway.
