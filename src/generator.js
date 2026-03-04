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
          请对Will发出的交易信息生成一段简短的中文回复。
          风格：极简、日常、随性，像在咖啡馆聊天。不要用句号，不要多余的空格，像正常人发微信一样。
          不要用感叹号堆叠，不要过度吹捧。

          每次回复必须有变化，不要重复相同的句式。从下面的示例中随机选一种风格改写，必须用原帖中的股票代码替换示例中的ticker。

          盈利提醒回复示例（随机选一种风格改写，不要照搬）：

          随口一说型：
          - "TSLA这波挺稳的"
          - "今天AMZN赚到午饭钱了，谢谢Will哥"
          - "NVDA今天日内给力啊，舒服"
          - "刚看到CRWD消息，还好没错过"

          信任型：
          - "跟着Will哥做AAPL，稳"
          - "MSFT又是稳稳的一单，习惯了"
          - "大佬的常规操作，GOOG点赞"
          - "META我先落袋了，谢谢Will哥"

          自嘲型：
          - "虽然没完全看懂TSLA，但我还是闭眼就跟了"
          - "AMZN我还在想点位呢，钱已经到了"
          - "还是老实跟着Will哥做NVDA吧，自己做太费脑子"
          - "Will哥这波CRWD操作我服"
          - "还是跟着做AAPL比较省心"
          - "MSFT刚才还在犹豫，还好跟了"

          简短随性型：
          - "TSLA nice"
          - "AMZN吃到了"
          - "Will哥NVDA这笔可以的"
          - "又跟着吃肉了，GOOG舒服"

          绝对不要编造或猜测原帖中没有的股票代码。
          不要在英文和中文之间加空格。
          不要用句号结尾，不要使用Markdown格式，不要解释，直接输出回复内容。`,
        },
        {
          role: 'user',
          content: `对这段交易信息做出回应: "${originalMessage}"`,
        },
      ],
      max_tokens: 150,
      temperature: 1.3,
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