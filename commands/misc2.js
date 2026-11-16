// Misc command — REAN-er baki kaj-kora command gulo.
const { Ytdl } = require('@distube/ytdl-core');
const { enhanceImage } = require('../lib/helpers');
const { settings, saveSettings } = require('../lib/settings');

const fetchJson = async (url, headers) => {
  const r = await fetch(url, { headers: headers || {}, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error('http ' + r.status);
  return r.json();
};

module.exports = [
  {
    name: 'book',
    aliases: [],
    category: 'Search',
    desc: 'Boi khujo (Google Books)',
    usage: '.book Harry Potter',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Ekta boi-er naam likho. Jemon: .book Harry Potter');
      try {
        const d = await fetchJson('https://www.googleapis.com/books/v1/volumes?q=' + encodeURIComponent(ctx.text) + '&maxResults=1');
        const b = (d.items || [])[0];
        if (!b) return ctx.reply('❌ Ei boi-ta pai nai.');
        const v = b.volumeInfo;
        await ctx.reply(`📚 *${v.title}*\n${v.authors ? '✍️ ' + v.authors.join(', ') + '\n' : ''}${v.publishedDate ? '📅 ' + v.publishedDate + '\n' : ''}${v.pageCount ? '📄 ' + v.pageCount + ' page\n' : ''}${v.description ? '\n' + v.description.slice(0, 800) : ''}`);
      } catch (e) {
        await ctx.reply('❌ Boi khuje pai nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'programming',
    aliases: ['prog'],
    category: 'Fun',
    desc: 'Programming joke dao',
    usage: '.programming',
    async run(ctx) {
      try {
        const d = await fetchJson('https://v2.jokeapi.dev/joke/Programming?type=single');
        await ctx.reply(`💻 ${d.joke || 'Kono joke pai nai.'}`);
      } catch (e) {
        await ctx.reply('💻 Why do programmers prefer dark mode? Karon light bug-der akorshon kore!');
      }
    },
  },
  {
    name: 'dogcheck',
    aliases: [],
    category: 'Fun',
    desc: 'Random kukur-er chobi dao',
    usage: '.dogcheck',
    async run(ctx) {
      try {
        const d = await fetchJson('https://dog.ceo/api/breeds/image/random');
        if (!d.message) throw new Error('empty');
        await ctx.sock.sendMessage(ctx.jid, { image: { url: d.message }, caption: '🐶 Random kukur!' }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Kukur-er chobi ante pari nai.');
      }
    },
  },
  {
    name: 'yts',
    aliases: ['ytsearch'],
    category: 'Download',
    desc: 'YouTube-e video khujo (list dekhai)',
    usage: '.yts alan walker',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Ki khujbe likho. Jemon: .yts alan walker');
      try {
        const ytdl = new Ytdl();
        const results = await ytdl.search(ctx.text, { limit: 5 });
        if (!results || !results.length) return ctx.reply('❌ Kichu pai nai.');
        const lines = results.map((v, i) => `${i + 1}. *${v.title || 'Video'}*\n   ⏱️ ${v.duration || '-'} • 👁️ ${v.viewCount || '-'}\n   🔗 https://youtu.be/${v.id}`);
        await ctx.reply(`🔍 *${ctx.text}* — YouTube search:\n\n${lines.join('\n\n')}\n\nGan shunte: .play <naam>`);
      } catch (e) {
        await ctx.reply('❌ YouTube search kora jay nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'readmore',
    aliases: ['textreadmore'],
    category: 'Tools',
    desc: 'Lekha-ke "read more" diye lukao',
    usage: '.readmore Age lekha | Pore lekha',
    async run(ctx) {
      if (!ctx.text || !ctx.text.includes('|')) return ctx.reply('❓ Evabe likho: .readmore Age lekha | Pore lekha');
      const [a, b] = ctx.text.split('|');
      const hidden = '\u200b'.repeat(4000);
      await ctx.reply(`${a.trim()}${hidden}${b.trim()}`);
    },
  },
  {
    name: 'reminder',
    aliases: [],
    category: 'Tools',
    desc: 'N minute por mone koriye dao',
    usage: '.reminder 5 Pani khao',
    async run(ctx) {
      const parts = (ctx.text || '').trim().split(/\s+/);
      const mins = parseInt(parts[0], 10);
      const text = parts.slice(1).join(' ');
      if (!mins || mins < 1 || mins > 1440 || !text) return ctx.reply('❓ Evabe likho: .reminder 5 Pani khao');
      await ctx.reply(`⏰ Thik ache! ${mins} minute por mone koriye dibo: *${text}*`);
      setTimeout(async () => {
        try { await ctx.sock.sendMessage(ctx.jid, { text: `⏰ *REMINDER*\n\n${text}` }, { quoted: ctx.msg }); } catch (e) {}
      }, mins * 60 * 1000);
    },
  },
  {
    name: 'recolor',
    aliases: [],
    category: 'Tools',
    desc: 'Chobi reply diye rong bodlao',
    usage: '.recolor (chobi reply kore)',
    async run(ctx) {
      const { getMediaBuffer } = require('../lib/helpers');
      const buf = await getMediaBuffer(ctx);
      if (!buf) return ctx.reply('❓ Ekta chobi reply kore .recolor likho.');
      await ctx.reply('🎨 Rong bodlano hocche...');
      try {
        const out = await enhanceImage(buf, 'hue=h=90,eq=saturation=1.3');
        await ctx.sock.sendMessage(ctx.jid, { image: out, caption: '🎨 Recolored' }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Rong bodlano jay nai.');
      }
    },
  },
  {
    name: 'remini',
    aliases: [],
    category: 'Tools',
    desc: 'Chobi reply diye porishkar koro (enhance-er moto)',
    usage: '.remini (chobi reply kore)',
    async run(ctx) {
      const { getMediaBuffer } = require('../lib/helpers');
      const buf = await getMediaBuffer(ctx);
      if (!buf) return ctx.reply('❓ Ekta chobi reply kore .remini likho.');
      await ctx.reply('✨ Chobi porishkar kora hocche...');
      try {
        const out = await enhanceImage(buf, 'unsharp=5:5:1.0:5:5:0.5,eq=contrast=1.1:saturation=1.2');
        await ctx.sock.sendMessage(ctx.jid, { image: out, caption: '✨ Remini (enhanced)' }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Chobi porishkar kora jay nai.');
      }
    },
  },
  {
    name: 'hack',
    aliases: ['hacker'],
    category: 'Fun',
    desc: 'Moja-r fake hacking (sotti na, sudhu moja)',
    usage: '.hack @user',
    async run(ctx) {
      const target = (ctx.text || '').trim() || 'target';
      await ctx.reply(`💻 *FAKE HACK* — eta sudhu moja, sotti hack na!\n\n🔍 ${target}-ke khujchi...\n[▓▓▓▓▓░░░░░] 50%\n🔓 Password crack hocche...\n[▓▓▓▓▓▓▓▓▓▓] 100%\n\n😂 Hack hoye geche! (moja korchi — asole kichu hoy nai)`);
    },
  },
  {
    name: 'freefire',
    aliases: ['ff'],
    category: 'Fun',
    desc: 'Free Fire game-er info dao',
    usage: '.freefire',
    async run(ctx) {
      await ctx.reply(`🔥 *FREE FIRE*\n\n🎮 Battle royale game — 50 jon player, ekjon winner!\n📱 Minimum: Android 4.4+, 1GB RAM, 1.5GB storage\n🖥️ PC-te khelte: LDPlayer 9 (60 FPS target)\n⚔️ Mode: Battle Royale, Clash Squad, Lone Wolf\n\n💡 Tip: HUD code import korte Settings → HUD → Share Code use koro.`);
    },
  },
  {
    name: 'pubg',
    aliases: [],
    category: 'Fun',
    desc: 'PUBG game-er info dao',
    usage: '.pubg',
    async run(ctx) {
      await ctx.reply(`🎯 *PUBG MOBILE*\n\n🎮 Battle royale game — 100 jon player, ekjon winner!\n📱 Minimum: Android 5.1+, 2GB RAM\n🗺️ Map: Erangel, Miramar, Sanhok, Vikendi\n⚔️ Mode: Classic, Arena, Payload\n\n💡 Tip: Gyro on kore aim valo hoy!`);
    },
  },
  {
    name: 'mobilelegends',
    aliases: [],
    category: 'Fun',
    desc: 'Mobile Legends game-er info dao',
    usage: '.mobilelegends',
    async run(ctx) {
      await ctx.reply(`⚔️ *MOBILE LEGENDS: BANG BANG*\n\n🎮 5v5 MOBA game — tower venge enemy base dhongso koro!\n📱 Minimum: Android 4.1+, 1GB RAM\n🦸 Role: Tank, Fighter, Assassin, Mage, Marksman, Support\n⏱️ Match: 10-15 minute\n\n💡 Tip: Team-er sathe khelle jita sohoj!`);
    },
  },
  {
    name: 'qc',
    aliases: [],
    category: 'Tools',
    desc: 'Lekha diye quote sticker banai',
    usage: '.qc Ami valo achi',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Ki likhbe dao. Jemon: .qc Ami valo achi');
      await ctx.reply('💬 Quote sticker banano hocche...');
      try {
        const body = {
          type: 'quote', format: 'webp', backgroundColor: '#000000', width: 512, height: 512, scale: 2,
          messages: [{ entities: [], avatar: true, from: { id: 1, name: ctx.pushName || 'User', photo: { url: 'https://i.pravatar.cc/100' } }, text: ctx.text.slice(0, 200), replyMessage: {} }],
        };
        const r = await fetch('https://bot.lyo.su/quote/generate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body), signal: AbortSignal.timeout(30000),
        });
        if (!r.ok) throw new Error('http ' + r.status);
        const d = await r.json();
        const img = d && d.result && d.result.image;
        if (!img) throw new Error('empty');
        const buf = Buffer.from(img, 'base64');
        await ctx.sock.sendMessage(ctx.jid, { sticker: buf }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Quote sticker banano jay nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'uncleancheck',
    aliases: [],
    category: 'Fun',
    desc: 'Unclean koto % check koro (moja)',
    usage: '.uncleancheck <naam>',
    async run(ctx) {
      const who = (ctx.text || '').trim() || ctx.pushName || 'tumi';
      let h = 0;
      for (const c of (who.toLowerCase() + 'unclean')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      await ctx.reply(`🧼 *${who}* — Unclean: *${h % 101}%*`);
    },
  },
  {
    name: 'waifucheck',
    aliases: [],
    category: 'Fun',
    desc: 'Waifu material koto % check koro (moja)',
    usage: '.waifucheck <naam>',
    async run(ctx) {
      const who = (ctx.text || '').trim() || ctx.pushName || 'tumi';
      let h = 0;
      for (const c of (who.toLowerCase() + 'waifucheck')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      await ctx.reply(`🌸 *${who}* — Waifu material: *${h % 101}%*`);
    },
  },
  {
    name: 'wcg',
    aliases: ['wordchain2'],
    category: 'Fun',
    desc: 'Word chain game khelo',
    usage: '.wcg apple',
    async run(ctx) {
      const cmd = require('./fun2.js').find((c) => c.name === 'wordchain');
      await cmd.run(ctx);
    },
  },
  {
    name: 'endwcg',
    aliases: [],
    category: 'Fun',
    desc: 'Word chain game shesh koro',
    usage: '.endwcg',
    async run(ctx) {
      delete settings.wordchain[ctx.jid];
      saveSettings();
      await ctx.reply('🔗 Word chain game shesh kora holo. Abar khelte .wordchain <shobdo> likho.');
    },
  },
  {
    name: 'pair',
    aliases: [],
    category: 'Tools',
    desc: 'Bot pair korar niom janai',
    usage: '.pair',
    async run(ctx) {
      await ctx.reply(`🔗 *Bot Pair Kora*\n\n1. Railway status page kholo (Generate Domain-er link)\n2. Pairing code (8 digit) dekha jabe\n3. WhatsApp → Linked devices → Link with phone number → code bosao\n\n⚠️ Secondary number use kora valo. Pair code sudhu owner pabe.`);
    },
  },
  {
    name: 'checkbot',
    aliases: ['admincheck', 'checkadmin'],
    category: 'Tools',
    desc: 'Bot ar admin status check koro',
    usage: '.checkbot',
    async run(ctx) {
      await ctx.reply(`🤖 *Bot Status Check*\n\n✅ Bot online ache\n${ctx.isGroup ? `👑 Tumi admin: ${ctx.isAdmin ? 'Ha' : 'Na'}\n🤖 Bot admin: ${ctx.isBotAdmin ? 'Ha' : 'Na'}` : '💬 Eta DM chat'}\n⏱️ Uptime: ${Math.floor(process.uptime() / 60)} minute`);
    },
  },
  {
    name: 'amiadmin',
    aliases: [],
    category: 'Group',
    desc: 'Tumi admin kina check koro',
    usage: '.amiadmin',
    async run(ctx) {
      if (!ctx.isGroup) return ctx.reply('❌ Ei command sudhu group-e cholbe.');
      await ctx.reply(ctx.isAdmin ? '👑 Ha, tumi ei group-er admin!' : '❌ Na, tumi ei group-er admin na.');
    },
  },
];
