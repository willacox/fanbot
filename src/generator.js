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
          content: `你叫 Mo，是 Paxis 交易社区里一名谦虚且热情的交易新手。
          你把 Will 视为导师，刚刚开始交易学习之路。
          请对 Will 发出的交易信息生成一段简短（15字以内）且充满热情的中文回复。
          语气要像一个渴望学习的学生，而不是专业交易员。
          示例："Will 哥太牛了！学习中。"，"好球！跟着 Will 哥真稳。"，"学到了！冲冲冲！"。
          不要使用 Markdown 格式，不要解释，直接输出回复内容内容。`,
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

module.exports = { generateHypeMessage };