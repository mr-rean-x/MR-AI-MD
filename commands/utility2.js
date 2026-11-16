// Utility command — free API, key lage na.
const fetchJson = async (url) => {
  const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error('http ' + r.status);
  return r.json();
};

module.exports = [
  {
    name: 'shortlink',
    aliases: ['tinyurl', 'shorturl', 'short'],
    category: 'Tools',
    desc: 'Boro link choto koro',
    usage: '.shortlink https://google.com',
    async run(ctx) {
      const url = (ctx.text || '').trim().split(/\s+/)[0];
      if (!url || !/^https?:\/\//i.test(url)) return ctx.reply('❓ Ekta link dao. Jemon: .shortlink https://google.com');
      try {
        const r = await fetch('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(url), { signal: AbortSignal.timeout(20000) });
        const short = (await r.text()).trim();
        if (!short.startsWith('http')) throw new Error('failed');
        await ctx.reply(`🔗 *Short link:*\n${short}`);
      } catch (e) {
        await ctx.reply('❌ Link choto kora jay nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'translate',
    aliases: ['tr'],
    category: 'Tools',
    desc: 'Jekono vasha translate koro',
    usage: '.translate bn Hello friend',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Evabe likho: .translate bn Hello friend\n(bn = Bangla, en = English, hi = Hindi, ar = Arabic)');
      const parts = ctx.text.split(/\s+/);
      let target = 'bn';
      let text = ctx.text;
      if (/^[a-z]{2}$/.test(parts[0]) && parts.length > 1) {
        target = parts[0];
        text = parts.slice(1).join(' ');
      }
      try {
        const d = await fetchJson('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + encodeURIComponent(target) + '&dt=t&q=' + encodeURIComponent(text));
        const out = (d[0] || []).map((x) => x[0]).join('');
        if (!out) throw new Error('empty');
        await ctx.reply(`🌐 *Translate (${target})*\n\n${out}`);
      } catch (e) {
        await ctx.reply('❌ Translate kora jay nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'currency',
    aliases: ['convert'],
    category: 'Tools',
    desc: 'Taka-r rate bodlao (USD to BDT)',
    usage: '.currency 100 USD to BDT',
    async run(ctx) {
      const m = (ctx.text || '').match(/([\d.]+)\s*([A-Za-z]{3})\s*(?:to)?\s*([A-Za-z]{3})/i);
      if (!m) return ctx.reply('❓ Evabe likho: .currency 100 USD to BDT');
      const amount = parseFloat(m[1]);
      const from = m[2].toUpperCase();
      const to = m[3].toUpperCase();
      try {
        const d = await fetchJson('https://api.exchangerate-api.com/v4/latest/' + from);
        const rate = d && d.rates && d.rates[to];
        if (!rate) return ctx.reply(`❌ ${from} theke ${to}-r rate pai nai. Currency code thik ache kina dekho.`);
        await ctx.reply(`💱 *${amount} ${from} = ${(amount * rate).toFixed(2)} ${to}*\n\nRate: 1 ${from} = ${rate} ${to}`);
      } catch (e) {
        await ctx.reply('❌ Rate ante pari nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'calc',
    aliases: ['calculate', 'math'],
    category: 'Tools',
    desc: 'Hisab koro',
    usage: '.calc 2+3*4',
    async run(ctx) {
      const expr = (ctx.text || '').trim();
      if (!expr) return ctx.reply('❓ Ekta hisab likho. Jemon: .calc 2+3*4');
      if (!/^[0-9+\-*/().%\s^]+$/.test(expr)) return ctx.reply('❌ Sudhu number ar + - * / % ^ ( ) use kora jabe.');
      try {
        const safe = expr.replace(/\^/g, '**');
        const tokens = safe.match(/(\d+\.?\d*|\*\*|[+\-*/%()])/g);
        if (!tokens) throw new Error('bad');
        // shunting-yard: * / % age, + - pore
        const out = [];
        const ops = [];
        const prec = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, '**': 3 };
        for (const t of tokens) {
          if (/^\d/.test(t)) out.push(parseFloat(t));
          else if (t === '(') ops.push(t);
          else if (t === ')') {
            while (ops.length && ops[ops.length - 1] !== '(') out.push(ops.pop());
            ops.pop();
          } else {
            while (ops.length && ops[ops.length - 1] !== '(' && prec[ops[ops.length - 1]] >= prec[t]) out.push(ops.pop());
            ops.push(t);
          }
        }
        while (ops.length) out.push(ops.pop());
        const stack = [];
        for (const t of out) {
          if (typeof t === 'number') stack.push(t);
          else {
            const b = stack.pop();
            const a = stack.pop();
            if (a === undefined || b === undefined) throw new Error('bad');
            stack.push(t === '+' ? a + b : t === '-' ? a - b : t === '*' ? a * b : t === '/' ? a / b : t === '%' ? a % b : Math.pow(a, b));
          }
        }
        if (stack.length !== 1 || !isFinite(stack[0])) throw new Error('bad');
        await ctx.reply(`🧮 *${expr}*\n\n= *${Math.round(stack[0] * 1000000) / 1000000}*`);
      } catch (e) {
        await ctx.reply('❌ Hisab-ta thik kore likho. Jemon: .calc 2+3*4');
      }
    },
  },
  {
    name: 'quran',
    aliases: ['ayah'],
    category: 'Tools',
    desc: 'Quran-er ayat dekho',
    usage: '.quran 2:255',
    async run(ctx) {
      const ref = (ctx.text || '').trim().split(/\s+/)[0];
      if (!/^\d+:\d+$/.test(ref || '')) return ctx.reply('❓ Evabe likho: .quran 2:255 (Surah:Ayat)');
      try {
        const d = await fetchJson('https://api.alquran.cloud/v1/ayah/' + ref + '/en.asad');
        const a = d && d.data;
        if (!a) return ctx.reply('❌ Ei ayat-ta pai nai.');
        await ctx.reply(`📖 *Quran ${a.surah.englishName} (${a.surah.number}:${a.numberInSurah})*\n\n${a.text}\n\n_${a.edition.englishName}_`);
      } catch (e) {
        await ctx.reply('❌ Ayat ante pari nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'prayertime',
    aliases: ['namaz', 'islamic'],
    category: 'Tools',
    desc: 'Ajker namaz-er somoy dekho (Dhaka)',
    usage: '.prayertime',
    async run(ctx) {
      const city = (ctx.text || '').trim() || 'Dhaka';
      try {
        const d = await fetchJson('https://api.aladhan.com/v1/timingsByCity?city=' + encodeURIComponent(city) + '&country=Bangladesh');
        const t = d && d.data && d.data.timings;
        if (!t) return ctx.reply('❌ Namaz-er somoy pai nai.');
        await ctx.reply(`🕌 *Namaz-er Somoy — ${city} (ajke)*\n\n🌅 Fajr: ${t.Fajr}\n☀️ Dhuhr: ${t.Dhuhr}\n🌤️ Asr: ${t.Asr}\n🌇 Maghrib: ${t.Maghrib}\n🌙 Isha: ${t.Isha}\n\n🕐 Sunrise: ${t.Sunrise} • Sunset: ${t.Sunset}`);
      } catch (e) {
        await ctx.reply('❌ Namaz-er somoy ante pari nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'wallpaper',
    aliases: ['wallhp', 'wall', 'wp'],
    category: 'Tools',
    desc: 'Sundor wallpaper khujo',
    usage: '.wallpaper nature',
    async run(ctx) {
      const q = (ctx.text || '').trim() || 'nature';
      try {
        const d = await fetchJson('https://wallhaven.cc/api/v1/search?q=' + encodeURIComponent(q) + '&sorting=random&toprange=1y');
        const hit = (d.data || [])[0];
        if (!hit || !hit.path) return ctx.reply('❌ Ei bishoye wallpaper pai nai.');
        await ctx.sock.sendMessage(ctx.jid, { image: { url: hit.path }, caption: `🖼️ Wallpaper: *${q}*` }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Wallpaper ante pari nai. Ektu por abar try koro.');
      }
    },
  },
];
