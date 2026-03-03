const OpenAI = require('openai');
const config = require('./config');

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: config.deepseekApiKey,
});

const FALLBACK_PHRASES = [
  'LFG! 🔥',
  '太猛了！',
  'Nice grab! 赞啊',
  'Let\'s go! 牛逼',
  '🔥🔥🔥',
  'Will is on fire today 太强了',
  'Following this one! 赞',
  'Great call! 厉害',
  'Massive W! 太赞了',
  '冲冲冲! Let\'s ride!',
  'Another W! 太猛了吧',
  'Sheesh 🔥 赞啊',
  'Love this play! 太棒了',
  'Will cooking again 🔥',
  'Big moves! 牛',
];

async function generateHypeMessage(originalMessage) {
  try {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are a hype-man in a trading Discord. Generate a SHORT (under 15 words) enthusiastic reaction to a trade post. Mix Chinese and English naturally. Be varied — never use the same phrasing twice. Examples: "NVDA 赞啊！", "Let's go! 太猛了", "Nice grab 🔥 太强了", "冲冲冲！". Do NOT use markdown. Do NOT explain. Just output the hype message.`,
        },
        {
          role: 'user',
          content: `React to this trade post: "${originalMessage}"`,
        },
      ],
      max_tokens: 60,
      temperature: 1.0,
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty response');
    return text;
  } catch (err) {
    console.error('DeepSeek API error, using fallback:', err.message);
    return FALLBACK_PHRASES[Math.floor(Math.random() * FALLBACK_PHRASES.length)];
  }
}

module.exports = { generateHypeMessage };
