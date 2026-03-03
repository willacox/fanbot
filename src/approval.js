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
          // TODO: Change to config.chatChannelId when ready to go live
          const chatChannel = await client.channels.fetch(config.controlChannelId);
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
