const OpenAI = require('openai');
const config = require('./config');

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: config.deepseekApiKey,
});

// 全中文的备用回复库
const FALLBACK_PHRASES = [
  '跟着 Will 哥真稳！学习到了。🔥',
  '太牛了！谢谢大佬带飞！',
  '好球！还在努力学习中，太强了。',
  '冲冲冲！跟着大佬有肉吃。',
  '🔥🔥🔥 赞啊！',
  'Will 哥今天状态火热！学到了。',
  '这波我也跟了！谢谢 Will 哥。',
  '神预判！厉害了我的 Will。',
  '大肉！太赞了。',
  '冲啊！准备好学习了。',
  '跟着 Will 哥准没错，太稳了。',
  '太强了 🔥 赞啊！',
  '这波操作太棒了！',
  'Will 哥又开始秀了 🔥',
  '大动作！跟着 Will 哥慢慢进步。',
];

async function generateHypeMessage(originalMessage) {
  try {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `你叫Mo，是Paxis交易社区里一名安静、低调的交易新手。
          你把Will视为导师，平时话不多，偶尔冒泡表达感谢或认同。
          请对Will发出的交易信息生成一段简短（20字以内）的中文回复。
          语气要平和、真诚、不夸张，像一个内向但认真学习的学生。不要用感叹号堆叠，不要过度吹捧。

          根据消息类型调整回复：
          1. 如果是"日内短线盈利提醒"（单个交易提醒，包含Ticker、Trigger Price等），提到具体的股票代码。
             示例："今天的CRWD真稳啊，谢谢Will哥"，"TSLA这波不错，学习了"
          2. 如果是"DT交易回顾"或"交易统计"（包含多个Ticker、胜率等汇总数据），不要挑单个股票，评论整体表现。
             示例："Will哥今天日内做得真好"，"又是稳稳的一天，慢慢学"，"今天成绩不错啊，继续跟着学"
          3. 其他消息类型，用简单的认同回复。
             示例："谢谢Will哥分享"，"学习了"，"记下来了，慢慢消化"

          绝对不要编造或猜测原帖中没有的股票代码。
          不要在英文和中文之间加空格。
          不要使用Markdown格式，不要解释，直接输出回复内容。`,
        },
        {
          role: 'user',
          content: `对这段交易信息做出回应: "${originalMessage}"`,
        },
      ],
      max_tokens: 60,
      temperature: 1.0,
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty response');
    return text;
  } catch (err) {
    console.error('DeepSeek API 错误，使用备用回复:', err.message);
    return FALLBACK_PHRASES[Math.floor(Math.random() * FALLBACK_PHRASES.length)];
  }
}

const FALLBACK_EMOJIS = ['❤️', '💕', '🚀', '👍', '🔥', '😍'];

async function pickReactionEmoji(messageContent) {
  try {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `你是一个Discord用户，需要对一条消息选择一个合适的emoji表情作为reaction。
          只输出一个emoji，不要输出任何其他内容。
          根据消息内容选择最合适的emoji：
          - 开心/庆祝的内容：🎉 🥳 😄
          - 感谢/温暖的内容：❤️ 💕 🥰
          - 赚钱/盈利的内容：🚀 💰 🔥
          - 加油/鼓励的内容：💪 👊 ✊
          - 学习/知识的内容：📚 🧠 👍
          - 搞笑/有趣的内容：😂 🤣 😆
          - 一般认同：👍 ❤️ 🙌
          只输出一个emoji。`,
        },
        {
          role: 'user',
          content: messageContent || '👍',
        },
      ],
      max_tokens: 10,
      temperature: 1.0,
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty response');
    return text;
  } catch (err) {
    console.error('[Mo] Emoji选择失败，使用随机:', err.message);
    return FALLBACK_EMOJIS[Math.floor(Math.random() * FALLBACK_EMOJIS.length)];
  }
}

module.exports = { generateHypeMessage, pickReactionEmoji };