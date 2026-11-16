// Anime command — waifu.pics free API (key lage na).
// Ekta generic handler diye onek command banano.
const fetchJson = async (url) => {
  const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error('http ' + r.status);
  return r.json();
};

async function waifuGif(ctx, category, label) {
  try {
    const d = await fetchJson('https://api.waifu.pics/sfw/' + category);
    if (!d.url) throw new Error('empty');
    await ctx.sock.sendMessage(ctx.jid, { video: { url: d.url }, gifPlayback: true, caption: `${label || ''}`.trim() || undefined }, { quoted: ctx.msg });
  } catch (e) {
    await ctx.reply('❌ Anime gif ante pari nai. Ektu por abar try koro.');
  }
}

function gifCmd(name, category, emoji, label, alias) {
  return {
    name,
    aliases: alias ? [alias] : [],
    category: 'Anime',
    desc: `${label} anime gif`,
    usage: `.${name} [@user]`,
    async run(ctx) {
      const target = ctx.mentions && ctx.mentions.length ? ' @' + ctx.mentions[0].split('@')[0] : '';
      await waifuGif(ctx, category, `${emoji} ${ctx.pushName || 'Tumi'}${target ? ' ->' + target : ''} ${label}`);
    },
  };
}

module.exports = [
  // Random anime chobi
  {
    name: 'waifu',
    aliases: ['rwaifu'],
    category: 'Anime',
    desc: 'Random waifu chobi dao',
    usage: '.waifu',
    async run(ctx) {
      try {
        const d = await fetchJson('https://api.waifu.pics/sfw/waifu');
        await ctx.sock.sendMessage(ctx.jid, { image: { url: d.url }, caption: '🌸 Waifu' }, { quoted: ctx.msg });
      } catch (e) { await ctx.reply('❌ Waifu chobi ante pari nai.'); }
    },
  },
  {
    name: 'neko',
    aliases: ['neko2', 'nekonime'],
    category: 'Anime',
    desc: 'Random neko chobi dao',
    usage: '.neko',
    async run(ctx) {
      try {
        const d = await fetchJson('https://api.waifu.pics/sfw/neko');
        await ctx.sock.sendMessage(ctx.jid, { image: { url: d.url }, caption: '🐱 Neko' }, { quoted: ctx.msg });
      } catch (e) { await ctx.reply('❌ Neko chobi ante pari nai.'); }
    },
  },
  {
    name: 'husbu',
    aliases: [],
    category: 'Anime',
    desc: 'Random husbu chobi dao',
    usage: '.husbu',
    async run(ctx) {
      try {
        const d = await fetchJson('https://api.waifu.pics/sfw/shinobu');
        await ctx.sock.sendMessage(ctx.jid, { image: { url: d.url }, caption: '💙 Husbu' }, { quoted: ctx.msg });
      } catch (e) { await ctx.reply('❌ Husbu chobi ante pari nai.'); }
    },
  },
  {
    name: 'maid',
    aliases: ['maid-pic'],
    category: 'Anime',
    desc: 'Random maid chobi dao',
    usage: '.maid',
    async run(ctx) {
      try {
        const d = await fetchJson('https://api.waifu.pics/sfw/megumin');
        await ctx.sock.sendMessage(ctx.jid, { image: { url: d.url }, caption: '🎀 Maid' }, { quoted: ctx.msg });
      } catch (e) { await ctx.reply('❌ Maid chobi ante pari nai.'); }
    },
  },
  // Reaction gif — sob waifu.pics theke
  gifCmd('bite', 'bite', '😬', 'bite korlo!', 'animebite'),
  gifCmd('blush', 'blush', '😊', 'lojja pelo!', 'animeblush'),
  gifCmd('bonk', 'bonk', '🔨', 'bonk korlo!', 'animebonk'),
  gifCmd('bully', 'bully', '😤', 'bully korlo!', 'animebully'),
  gifCmd('cringe', 'cringe', '😬', 'cringe khailo!', 'animecringe'),
  gifCmd('cuddle', 'cuddle', '🤗', 'japute dhorlo!'),
  gifCmd('dance', 'dance', '💃', 'nachche!', 'animedance'),
  gifCmd('glomp', 'glomp', '🤗', 'glomp korlo!', 'animeglomp'),
  gifCmd('happy', 'happy', '😄', 'khushi holo!', 'animehappy'),
  gifCmd('highfive', 'highfive', '✋', 'high-five dilo!', 'animehighfive'),
  gifCmd('hug', 'hug', '🤗', 'japute dhorlo!'),
  gifCmd('kiss', 'kiss', '😘', 'kiss korlo!'),
  gifCmd('kill', 'kill', '🔪', 'marlo!', 'animekill'),
  gifCmd('lick', 'lick', '👅', 'chatlo!', 'animelick'),
  gifCmd('pat', 'pat', '👋', 'mathay hat dilo!'),
  gifCmd('poke', 'poke', '👉', 'poke korlo!', 'animepoke'),
  gifCmd('slap', 'slap', '👋', 'thappor marlo!'),
  gifCmd('smile', 'smile', '😊', 'haslo!', 'animesmile'),
  gifCmd('smug', 'smug', '😏', 'smug holo!', 'animesmug'),
  gifCmd('wave', 'wave', '👋', 'hate wave korlo!', 'animewave'),
  gifCmd('wink', 'wink', '😉', 'chokh marlo!', 'animewink'),
  gifCmd('yeet', 'yeet', '🚀', 'yeet korlo!', 'animeyeet'),
  gifCmd('handhold', 'handhold', '🤝', 'hat dhorlo!'),
  gifCmd('cry', 'cry', '😭', 'kadche!'),
  gifCmd('laugh', 'laugh', '😂', 'hasche!'),
  gifCmd('awoo', 'awoo', '🐺', 'awoo korlo!'),
  gifCmd('nom', 'nom', '😋', 'khaitece!'),
  gifCmd('sad', 'cry', '😢', 'mon kharap!'),
  gifCmd('shy', 'blush', '🙈', 'lojja pailo!'),
  gifCmd('angry', 'bonk', '😠', 'raag korlo!', 'anger'),
  gifCmd('confused', 'cringe', '😕', 'confused holo!'),
  gifCmd('thumbsup', 'happy', '👍', 'thumbs up dilo!'),
];
