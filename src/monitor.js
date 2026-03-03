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
      const targetMsg = messages.find(
        (m) => m.author.id === config.targetUserId
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

function setupMonitor(client) {
  // Check last messages on startup
  client.once('ready', () => checkLastMessages(client));

  client.on('messageCreate', async (message) => {
    // Only react to target user in monitored channels
    if (message.author.id !== config.targetUserId) return;
    if (!config.monitorChannels.includes(message.channel.id)) return;

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
