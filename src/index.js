const { Client } = require('discord.js-selfbot-v13');
const config = require('./config');
const { setupMonitor } = require('./monitor');

const client = new Client({
  checkUpdate: false, 
});

client.once('ready', () => {
  console.log(`[Paxis] Ghost Account Active: ${client.user.tag}`);
  console.log(`[Paxis] Monitoring: ${config.monitorChannels.join(', ')}`);
});

setupMonitor(client);

// This now logs in using your User Token from .env
client.login(config.botToken);