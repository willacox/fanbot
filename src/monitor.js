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
