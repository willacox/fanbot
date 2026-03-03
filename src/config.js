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
