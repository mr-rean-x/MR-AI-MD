// AI command — Groq (free key) diye onek model, Gemini (free key),
// ar Pollinations (key lage na) diye chobi banano.
const { settings } = require('../lib/settings');

async function groqChat(key, model, text) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'Tumi ekta helpful WhatsApp assistant. Choto ar sohoj vashay uttor dao. User Banglish-e likhle Banglish-e uttor dao.' },
        { role: 'user', content: text },
      ],
      max_tokens: 800,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (r.status === 401) throw new Error('KEY_VUL');
  if (!r.ok) throw new Error('groq error ' + r.status);
  const d = await r.json();
  const ans = d && d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content;
  if (!ans) throw new Error('no answer');
  return ans.trim();
}

function groqNeeded(ctx) {
  const key = ctx.config.groqApiKey;
  if (!key) {
    ctx.reply('⚠️ AI chalate GROQ_API_KEY lage.\nRailway Variables-e GROQ_API_KEY bosao (console.groq.com theke free key neya jay), tarpor bot restart koro.');
    return null;
  }
  return key;
}

async function aiRun(ctx, model, label) {
  if (!ctx.text) return ctx.reply(`❓ Kichu jiggesh koro. Jemon: .${ctx.cmdName} Bangladesh-er rajdhani kothay?`);
  const key = groqNeeded(ctx);
  if (!key) return;
  try {
    const ans = await groqChat(key, model, ctx.text);
    await ctx.reply(`🤖 ${ans}`);
  } catch (e) {
    await ctx.reply(e.message === 'KEY_VUL'
      ? '❌ GROQ_API_KEY-ta vul mone hocche. Railway Variables-e notun key bosao.'
      : '❌ AI-er sathe connect kora jay nai. Ektu por abar try koro.');
  }
}

async function pollinationsImage(prompt, seed) {
  const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) + '?width=512&height=512&nologo=true&seed=' + (seed || Math.floor(Math.random() * 100000));
  const r = await fetch(url, { signal: AbortSignal.timeout(90000) });
  if (!r.ok) throw new Error('image gen failed ' + r.status);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 1000) throw new Error('image gen empty');
  return buf;
}

module.exports = [
  {
    name: 'gpt',
    aliases: ['chatgpt', 'chatbot', 'ai', 'askai', 'warmgpt', 'aitext'],
    category: 'AI',
    desc: 'AI-er sathe kotha bolo (Groq)',
    usage: '.gpt Bangladesh-er rajdhani kothay?',
    async run(ctx) { await aiRun(ctx, 'llama-3.1-8b-instant', 'GPT'); },
  },
  {
    name: 'groq',
    aliases: [],
    category: 'AI',
    desc: 'Groq AI-er sathe kotha bolo',
    usage: '.groq ekta golpo bolo',
    async run(ctx) { await aiRun(ctx, 'llama-3.1-8b-instant', 'Groq'); },
  },
  {
    name: 'llama',
    aliases: [],
    category: 'AI',
    desc: 'Llama 70B AI-er sathe kotha bolo',
    usage: '.llama Python ki?',
    async run(ctx) { await aiRun(ctx, 'llama-3.3-70b-versatile', 'Llama'); },
  },
  {
    name: 'mistral',
    aliases: [],
    category: 'AI',
    desc: 'Mistral AI-er sathe kotha bolo',
    usage: '.mistral ekta kobita likho',
    async run(ctx) { await aiRun(ctx, 'mixtral-8x7b-32768', 'Mistral'); },
  },
  {
    name: 'deepseek',
    aliases: ['deep'],
    category: 'AI',
    desc: 'DeepSeek AI-er sathe kotha bolo',
    usage: '.deepseek 2+2 koto?',
    async run(ctx) { await aiRun(ctx, 'deepseek-r1-distill-llama-70b', 'DeepSeek'); },
  },
  {
    name: 'gemini',
    aliases: [],
    category: 'AI',
    desc: 'Google Gemini AI-er sathe kotha bolo',
    usage: '.gemini Dhaka somporke bolo',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Kichu jiggesh koro. Jemon: .gemini Dhaka somporke bolo');
      const key = ctx.config.geminiApiKey;
      if (!key) return ctx.reply('⚠️ Gemini chalate GEMINI_API_KEY lage.\nRailway Variables-e GEMINI_API_KEY bosao (aistudio.google.com theke free key neya jay), tarpor bot restart koro.');
      try {
        const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + encodeURIComponent(key), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: ctx.text }] }] }),
          signal: AbortSignal.timeout(30000),
        });
        if (r.status === 400 || r.status === 403) return ctx.reply('❌ GEMINI_API_KEY-ta vul mone hocche. Railway Variables-e notun key bosao.');
        if (!r.ok) throw new Error('gemini error ' + r.status);
        const d = await r.json();
        const ans = d && d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts && d.candidates[0].content.parts[0] && d.candidates[0].content.parts[0].text;
        await ctx.reply(ans ? `✨ ${ans.trim()}` : '❌ Gemini kono uttor dey nai. Abar try koro.');
      } catch (e) {
        await ctx.reply('❌ Gemini-r sathe connect kora jay nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'text2img',
    aliases: ['img', 'txt2img', 'textimg', 'teximg', 'imagegen', 'animagine', 'pixart', 'pollinations', 'art', 'animagen'],
    category: 'AI',
    desc: 'Lekha theke chobi banai (free, key lage na)',
    usage: '.text2img ekta biral, sunset',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Ki chobi banabe likho. Jemon: .text2img ekta biral, sunset');
      await ctx.reply('🎨 Chobi banano hocche...');
      try {
        const buf = await pollinationsImage(ctx.text);
        await ctx.sock.sendMessage(ctx.jid, { image: buf, caption: `🎨 *${ctx.text}*` }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Chobi banano jay nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'toanime',
    aliases: ['animegen'],
    category: 'AI',
    desc: 'Lekha theke anime-style chobi banai',
    usage: '.toanime ekta meye, sakura gach',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Ki anime chobi banabe likho. Jemon: .toanime ekta meye, sakura gach');
      await ctx.reply('🎨 Anime chobi banano hocche...');
      try {
        const buf = await pollinationsImage(`anime style illustration, ${ctx.text}, beautiful anime art`);
        await ctx.sock.sendMessage(ctx.jid, { image: buf, caption: `🎨 Anime: *${ctx.text}*` }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Chobi banano jay nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'cartoon',
    aliases: ['cartoonstyle'],
    category: 'AI',
    desc: 'Lekha theke cartoon-style chobi banai',
    usage: '.cartoon ekta kukur, superhero',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Ki cartoon chobi banabe likho. Jemon: .cartoon ekta kukur, superhero');
      await ctx.reply('🎨 Cartoon chobi banano hocche...');
      try {
        const buf = await pollinationsImage(`cartoon style illustration, ${ctx.text}, colorful cartoon art`);
        await ctx.sock.sendMessage(ctx.jid, { image: buf, caption: `🎨 Cartoon: *${ctx.text}*` }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Chobi banano jay nai. Ektu por abar try koro.');
      }
    },
  },
];
