const config = require('./config');

const APPROVE_EMOJI = '✅';
const REJECT_EMOJI = '❌';

/**
 * 辅助函数：实现延迟
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function requestApproval(client, originalMsg, hypeMessage) {
  const controlChannel = await client.channels.fetch(config.controlChannelId);

  // 自用账号（Ghost Account）使用纯文本发送内部审批指令
  const approvalMsg = await controlChannel.send(
    `**[待审批消息 - Mo]**\n` +
    `**Will 哥的原帖:** ${originalMsg.content || '[图片/附件]'}\n` +
    `**所在频道:** <#${originalMsg.channel.id}>\n` +
    `**Mo 的拟回覆:** ${hypeMessage}\n\n` +
    `点击 ${APPROVE_EMOJI} 批准发送 | 点击 ${REJECT_EMOJI} 拒绝`
  );

  await approvalMsg.react(APPROVE_EMOJI);
  await approvalMsg.react(REJECT_EMOJI);

  return new Promise((resolve) => {
    const filter = (reaction, user) =>
      [APPROVE_EMOJI, REJECT_EMOJI].includes(reaction.emoji.name) &&
      user.id === config.ownerUserId;

    const collector = approvalMsg.createReactionCollector({
      filter,
      max: 1,
      time: 24 * 60 * 60 * 1000, // 24小时有效
    });

    collector.on('collect', async (reaction) => {
      if (reaction.emoji.name === APPROVE_EMOJI) {
        try {
          // 1. 立即更新审批频道的状态
          await approvalMsg.edit(`~~${approvalMsg.content}~~ \n\n**状态: 已批准 ✅**`);

          // 2. 模拟真人行为：随机延迟 30-90 秒
          const delay = Math.floor(Math.random() * (90000 - 30000 + 1) + 30000);
          console.log(`[Mo] 审批通过。将在 ${Math.round(delay/1000)} 秒后发送...`);
          await sleep(delay);

          // 3. 模拟真人行为：显示“正在输入...”状态
          const chatChannel = await client.channels.fetch(config.chatChannelId);
          await chatChannel.sendTyping();
          console.log(`[Mo] 正在模拟输入中 (5秒)...`);
          await sleep(5000); // 模拟打字 5 秒

          // 4. 正式发送消息
          await chatChannel.send(hypeMessage);
          console.log(`[Mo] 消息已成功发送至公共频道。`);

          resolve(true);
        } catch (err) {
          console.error('[Mo] 发送失败:', err.message);
          resolve(false);
        }
      } else {
        await approvalMsg.edit(`~~${approvalMsg.content}~~ \n\n**状态: 已拒绝 ❌**`);
        resolve(false);
      }
    });

    collector.on('collect', (reaction) => {
      // 这里的逻辑已在上方 if/else 处理
    });
  });
}

module.exports = { requestApproval };