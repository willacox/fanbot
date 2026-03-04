require('dotenv').config();

/** Collect all unique chat channel IDs from SERVER_CHAT_MAP and fallback */
function getChatChannelIds(mapRaw, fallback) {
  const ids = new Set();
  if (mapRaw) {
    for (const entry of mapRaw.split(',')) {
      const channelId = entry.trim().split(':')[1];
      if (channelId) ids.add(channelId);
    }
  }
  if (fallback) ids.add(fallback);
  return [...ids];
}

/** Parse SERVER_CHAT_MAP env var: "serverId1:channelId1,serverId2:channelId2" */
function parseServerChatMap(raw) {
  const map = new Map();
  if (!raw) return map;
  for (const entry of raw.split(',')) {
    const [serverId, channelId] = entry.trim().split(':');
    if (serverId && channelId) map.set(serverId, channelId);
  }
  return map;
}

const config = {
  botToken: process.env.DISCORD_BOT_TOKEN,
  deepseekApiKey: process.env.DEEPSEEK_API_KEY,
  monitorChannels: process.env.MONITOR_CHANNELS?.split(',') || [],
  targetUserId: process.env.TARGET_USER_ID,
  chatChannelId: process.env.CHAT_CHANNEL_ID,
  controlChannelId: process.env.CONTROL_CHANNEL_ID,
  ownerUserId: process.env.OWNER_USER_ID,
  serverChatMap: parseServerChatMap(process.env.SERVER_CHAT_MAP),
  chatChannels: getChatChannelIds(process.env.SERVER_CHAT_MAP, process.env.CHAT_CHANNEL_ID),
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
