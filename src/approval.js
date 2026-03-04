const config = require('./config');

const APPROVE_EMOJI = '✅';
const REJECT_EMOJI = '❌';
const EDIT_EMOJI = '✏️';

/**
 * 辅助函数：实现延迟
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function requestApproval(client, originalMsg, hypeMessage) {
  const controlChannel = await client.channels.fetch(config.controlChannelId);

  // 获取触发消息所在的服务器名称，方便在审批时区分
  const serverName = originalMsg.guild ? originalMsg.guild.name : '未知服务器';

  // 自用账号（Ghost Account）使用纯文本发送内部审批指令
  const approvalMsg = await controlChannel.send(
    `**[待审批消息 - Mo]**\n` +
    `**来自服务器:** ${serverName}\n` +
    `**Will 哥的原帖:** ${originalMsg.content || '[图片/附件]'}\n` +
    `**监控频道:** <#${originalMsg.channel.id}>\n` +
    `**Mo 的拟回覆:** ${hypeMessage}\n\n` +
    `${APPROVE_EMOJI} 批准 | ${REJECT_EMOJI} 拒绝 | ${EDIT_EMOJI} 编辑后发送`
  );

  await approvalMsg.react(APPROVE_EMOJI);
  await approvalMsg.react(REJECT_EMOJI);
  await approvalMsg.react(EDIT_EMOJI);

  return new Promise((resolve) => {
    const filter = (reaction, user) =>
      [APPROVE_EMOJI, REJECT_EMOJI, EDIT_EMOJI].includes(reaction.emoji.name) &&
      user.id === config.ownerUserId;

    const collector = approvalMsg.createReactionCollector({
      filter,
      max: 1,
      time: 24 * 60 * 60 * 1000, // 24小时有效
    });

    collector.on('collect', async (reaction) => {
      if (reaction.emoji.name === REJECT_EMOJI) {
        await approvalMsg.edit(`~~${approvalMsg.content}~~ \n\n**状态: 已拒绝 ❌**`);
        return resolve(false);
      }

      // For edit: ask owner to type new message, then send that instead
      let finalMessage = hypeMessage;
      if (reaction.emoji.name === EDIT_EMOJI) {
        await controlChannel.send('请输入修改后的回复内容（5分钟内发送）：');
        try {
          const msgFilter = (m) => m.author.id === config.ownerUserId;
          const collected = await controlChannel.awaitMessages({
            filter: msgFilter,
            max: 1,
            time: 5 * 60_000,
            errors: ['time'],
          });
          finalMessage = collected.first().content;
          console.log(`[Mo] 消息已编辑为: “${finalMessage}”`);
        } catch {
          await controlChannel.send('超时未收到编辑内容，已取消。');
          await approvalMsg.edit(`~~${approvalMsg.content}~~ \n\n**状态: 编辑超时，已取消 ⏰**`);
          return resolve(false);
        }
      }

      try {
        // 1. 更新审批频道的状态
        const statusLabel = reaction.emoji.name === EDIT_EMOJI ? '已编辑并批准 ✏️✅' : '已批准 ✅';
        await approvalMsg.edit(`~~${approvalMsg.content}~~ \n\n**状态: ${statusLabel}**\n**最终发送:** ${finalMessage}`);

        // 2. 模拟真人行为：随机延迟 30-90 秒
        const delay = Math.floor(Math.random() * (90000 - 30000 + 1) + 30000);
        console.log(`[Mo] 审批通过。将在 ${Math.round(delay/1000)} 秒后发送至服务器 “${serverName}”...`);
        await sleep(delay);

        // 3. 动态确定目标聊天频道
        const guildId = originalMsg.guild?.id;
        const chatChannelId = config.serverChatMap.get(guildId) || config.chatChannelId;
        const chatChannel = await client.channels.fetch(chatChannelId).catch(() => null);

        if (!chatChannel) {
          console.error(`[Mo] 错误：无法在服务器 “${serverName}” 找到合适的聊天频道进行回复。`);
          return resolve(false);
        }

        // 4. 模拟真人行为：显示”正在输入...”状态
        await chatChannel.sendTyping();
        console.log(`[Mo] 正在服务器 “${serverName}” 的 #${chatChannel.name} 频道模拟输入中 (5秒)...`);
        await sleep(5000);

        // 5. 正式发送消息
        await chatChannel.send(finalMessage);
        console.log(`[Mo] 消息已成功发送至 ${serverName} 的 #${chatChannel.name} 频道。`);

        resolve(true);
      } catch (err) {
        console.error('[Mo] 发送失败:', err.message);
        resolve(false);
      }
    });

    collector.on('end', (collected) => {
      if (collected.size === 0) {
        approvalMsg.edit(`~~${approvalMsg.content}~~ \n\n**状态: 已过期 ⏰**`).catch(() => {});
        resolve(false);
      }
    });
  });
}

module.exports = { requestApproval };