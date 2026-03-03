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
