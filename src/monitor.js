const config = require('./config');
const { generateHypeMessage } = require('./generator');
const { requestApproval } = require('./approval');

// Debounce: ignore duplicate triggers within 30s
const recentTriggers = new Map();
const DEBOUNCE_MS = 30_000;
const MAX_AGE_MS = 10 * 60_000; // Only respond to messages within 10 minutes

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

async function checkLastMessages(client) {
  console.log('[Monitor] Checking last messages in monitored channels...');
  for (const channelId of config.monitorChannels) {
    try {
      const channel = await client.channels.fetch(channelId);
      const messages = await channel.messages.fetch({ limit: 20 });
      console.log(`[Monitor] Fetched ${messages.size} messages from #${channel.name || channelId}`);
      messages.forEach((m) => {
        console.log(`[Monitor]   - ${m.author.tag} (${m.author.id}) bot=${m.author.bot}: "${m.content?.slice(0, 50)}"`);
      });
      const now = Date.now();
      const targetMsg = messages.find(
        (m) => config.targetUserIds.includes(m.author.id) &&
               (now - m.createdTimestamp) < MAX_AGE_MS
      );
      if (targetMsg) {
        console.log(`[Monitor] Found message from target user in #${channel.name || channelId}`);
        const hypeMessage = await generateHypeMessage(
          targetMsg.content || '[image/attachment post]'
        );
        console.log(`[Monitor] Generated hype: "${hypeMessage}"`);
        await requestApproval(client, targetMsg, hypeMessage);
      }
    } catch (err) {
      console.error(`[Monitor] Error checking channel ${channelId}:`, err.message);
    }
  }
}

const HEART_CHANCE = 0.5;
const HEART_EMOJIS = ['❤️', '💕', '😍', '🥰', '💗'];

function setupMonitor(client) {
  // Check last messages on startup
  client.once('ready', () => checkLastMessages(client));

  // Randomly react with heart to owner's messages in chat channels
  client.on('messageCreate', async (message) => {
    if (
      message.author.id === config.ownerUserId &&
      config.chatChannels.includes(message.channel.id) &&
      Math.random() < HEART_CHANCE
    ) {
      try {
        const delay = Math.floor(Math.random() * (70000 - 40000 + 1) + 40000);
        setTimeout(async () => {
          try {
            const emoji = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
            await message.react(emoji);
            console.log(`[Mo] Reacted ${emoji} to owner's message in #${message.channel.name}`);
          } catch (err) {
            console.error('[Mo] Failed to react:', err.message);
          }
        }, delay);
      } catch (err) {
        console.error('[Mo] Heart reaction error:', err.message);
      }
    }
  });

  client.on('messageCreate', async (message) => {
    // Only react to target user in monitored channels
    if (!config.targetUserIds.includes(message.author.id)) return;
    if (!config.monitorChannels.includes(message.channel.id)) return;

    // Ignore messages older than 10 minutes
    if ((Date.now() - message.createdTimestamp) > MAX_AGE_MS) return;

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
