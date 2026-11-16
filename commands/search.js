// Search command — sob free API, key lage na.
const fetchJson = async (url, headers) => {
  const r = await fetch(url, { headers: headers || {}, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error('http ' + r.status);
  return r.json();
};

module.exports = [
  {
    name: 'google',
    aliases: ['search', 'gsearch', 'bing'],
    category: 'Search',
    desc: 'Web-e khujo',
    usage: '.google Free Fire',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Ki khujbe likho. Jemon: .google Free Fire');
      try {
        const r = await fetch('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(ctx.text), {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36' },
          signal: AbortSignal.timeout(20000),
        });
        if (!r.ok) throw new Error('http ' + r.status);
        const html = await r.text();
        const out = [];
        const re = /class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g;
        let m;
        while ((m = re.exec(html)) && out.length < 5) {
          const title = m[2].replace(/<[^>]+>/g, '').trim();
          const link = m[1];
          if (title && link) out.push(`• *${title}*\n  ${link}`);
        }
        if (!out.length) return ctx.reply('❌ Kichu khuje pai nai. Onno kichu likhe try koro.');
        await ctx.reply(`🔍 *${ctx.text}* — search result:\n\n${out.join('\n\n')}`);
      } catch (e) {
        await ctx.reply('❌ Search kora jay nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'image',
    aliases: ['searchimage', 'imgsearch', 'pinterest'],
    category: 'Search',
    desc: 'Chobi khujo (Openverse)',
    usage: '.image biral',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Ki chobi khujbe likho. Jemon: .image biral');
      try {
        const d = await fetchJson('https://api.openverse.org/v1/images/?q=' + encodeURIComponent(ctx.text) + '&page_size=3');
        const hit = (d.results || []).find((x) => x && x.url);
        if (!hit) return ctx.reply('❌ Ei bishoye kono chobi pai nai.');
        await ctx.sock.sendMessage(ctx.jid, { image: { url: hit.url }, caption: `🖼️ *${ctx.text}*\n${hit.title ? hit.title.slice(0, 80) : ''}` }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Chobi khuje pai nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'define',
    aliases: ['dictionary', 'meaning'],
    category: 'Search',
    desc: 'English shobder mane jano',
    usage: '.define love',
    async run(ctx) {
      const word = (ctx.text || '').trim().split(/\s+/)[0];
      if (!word) return ctx.reply('❓ Ekta English shobdo likho. Jemon: .define love');
      try {
        const d = await fetchJson('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word));
        const e = d[0];
        const m = e.meanings && e.meanings[0];
        const def = m && m.definitions && m.definitions[0];
        if (!def) return ctx.reply('❌ Ei shobder mane pai nai.');
        await ctx.reply(`📖 *${e.word}*${e.phonetic ? ' (' + e.phonetic + ')' : ''}\n_${m.partOfSpeech || ''}_\n\n${def.definition}${def.example ? '\n\n📌 Example: ' + def.example : ''}`);
      } catch (e2) {
        await ctx.reply('❌ Ei shobdo-ta dictionary-te pai nai.');
      }
    },
  },
  {
    name: 'lyrics',
    aliases: ['lyric'],
    category: 'Search',
    desc: 'Gaan-er lyrics khujo',
    usage: '.lyrics Alan Walker - Faded',
    async run(ctx) {
      if (!ctx.text || !ctx.text.includes('-')) return ctx.reply('❓ Evabe likho: .lyrics Alan Walker - Faded');
      const [artist, ...rest] = ctx.text.split('-');
      const title = rest.join('-').trim();
      if (!artist.trim() || !title) return ctx.reply('❓ Evabe likho: .lyrics Alan Walker - Faded');
      try {
        const d = await fetchJson('https://api.lyrics.ovh/v1/' + encodeURIComponent(artist.trim()) + '/' + encodeURIComponent(title));
        if (!d.lyrics) return ctx.reply('❌ Ei gaan-er lyrics pai nai.');
        await ctx.reply(`🎵 *${artist.trim()} - ${title}*\n\n${d.lyrics.slice(0, 3000)}`);
      } catch (e) {
        await ctx.reply('❌ Lyrics pai nai. Gaan-er naam thik ache kina check koro.');
      }
    },
  },
  {
    name: 'news',
    aliases: ['technews', 'technology', 'tech'],
    category: 'Search',
    desc: 'Sorboshesh khobor dekho',
    usage: '.news Bangladesh',
    async run(ctx) {
      const q = (ctx.text || '').trim() || 'Bangladesh';
      try {
        const r = await fetch('https://news.google.com/rss/search?q=' + encodeURIComponent(q) + '&hl=en-IN&gl=IN&ceid=IN:en', { signal: AbortSignal.timeout(20000) });
        if (!r.ok) throw new Error('http ' + r.status);
        const xml = await r.text();
        const items = [];
        const re = /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>/g;
        let m;
        while ((m = re.exec(xml)) && items.length < 5) {
          items.push(`• ${m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim()}\n  ${m[2].trim()}`);
        }
        if (!items.length) return ctx.reply('❌ Ei bishoye kono khobor pai nai.');
        await ctx.reply(`📰 *${q}* — sorboshesh khobor:\n\n${items.join('\n\n')}`);
      } catch (e) {
        await ctx.reply('❌ Khobor ante pari nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'recipe',
    aliases: ['food'],
    category: 'Search',
    desc: 'Khawar recipe khujo',
    usage: '.recipe chicken biryani',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Ki khawar recipe chai likho. Jemon: .recipe chicken biryani');
      try {
        const d = await fetchJson('https://www.themealdb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(ctx.text));
        const meal = (d.meals || [])[0];
        if (!meal) return ctx.reply('❌ Ei khawar-er recipe pai nai.');
        const ings = [];
        for (let i = 1; i <= 20; i++) {
          const ing = meal['strIngredient' + i];
          const msr = meal['strMeasure' + i];
          if (ing && ing.trim()) ings.push(`${ing.trim()} — ${msr ? msr.trim() : ''}`);
        }
        await ctx.reply(`🍽️ *${meal.strMeal}*\n_${meal.strCategory || ''} • ${meal.strArea || ''}_\n\n*Upokoron:*\n${ings.slice(0, 10).join('\n')}\n\n*Banano:*\n${(meal.strInstructions || '').slice(0, 1200)}${meal.strYoutube ? `\n\n🎥 ${meal.strYoutube}` : ''}`);
      } catch (e) {
        await ctx.reply('❌ Recipe ante pari nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'github',
    aliases: ['githubstalk', 'ghstalk'],
    category: 'Search',
    desc: 'GitHub profile dekho',
    usage: '.github mr-rean-x',
    async run(ctx) {
      const user = (ctx.text || '').trim().split(/\s+/)[0];
      if (!user) return ctx.reply('❓ Ekta GitHub username likho. Jemon: .github mr-rean-x');
      try {
        const d = await fetchJson('https://api.github.com/users/' + encodeURIComponent(user));
        if (d.message === 'Not Found') return ctx.reply('❌ Ei username-e kono GitHub account nai.');
        await ctx.reply(`🐙 *${d.login}*${d.name ? ' (' + d.name + ')' : ''}\n${d.bio ? d.bio + '\n' : ''}\n👥 Followers: ${d.followers} • Following: ${d.following}\n📦 Public repo: ${d.public_repos}${d.location ? `\n📍 ${d.location}` : ''}${d.blog ? `\n🔗 ${d.blog}` : ''}\n\nhttps://github.com/${d.login}`);
      } catch (e) {
        await ctx.reply('❌ GitHub profile ante pari nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'iplookup',
    aliases: ['ipstalk', 'ip'],
    category: 'Search',
    desc: 'IP address-er jayga dekho',
    usage: '.iplookup 8.8.8.8',
    async run(ctx) {
      const ip = (ctx.text || '').trim().split(/\s+/)[0];
      if (!ip) return ctx.reply('❓ Ekta IP likho. Jemon: .iplookup 8.8.8.8');
      try {
        const d = await fetchJson('http://ip-api.com/json/' + encodeURIComponent(ip));
        if (d.status !== 'success') return ctx.reply('❌ Ei IP-ta thik na.');
        await ctx.reply(`🌐 *IP:* ${d.query}\n📍 ${d.city || '-'}, ${d.regionName || '-'}, ${d.country || '-'}\n🏢 ISP: ${d.isp || '-'}\n🏷️ Org: ${d.org || '-'}\n🕐 Timezone: ${d.timezone || '-'}`);
      } catch (e) {
        await ctx.reply('❌ IP-er info ante pari nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'myip',
    aliases: [],
    category: 'Search',
    desc: 'Bot-er server-er IP dekho',
    usage: '.myip',
    async run(ctx) {
      try {
        const d = await fetchJson('https://api.ipify.org?format=json');
        await ctx.reply(`🌐 Bot-er server IP: *${d.ip}*`);
      } catch (e) {
        await ctx.reply('❌ IP ante pari nai.');
      }
    },
  },
  {
    name: 'animesearch',
    aliases: ['animeinfo', 'anime'],
    category: 'Search',
    desc: 'Anime khujo (MyAnimeList)',
    usage: '.animesearch Naruto',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Ekta anime-r naam likho. Jemon: .animesearch Naruto');
      try {
        const d = await fetchJson('https://api.jikan.moe/v4/anime?q=' + encodeURIComponent(ctx.text) + '&limit=1');
        const a = (d.data || [])[0];
        if (!a) return ctx.reply('❌ Ei anime-ta pai nai.');
        await ctx.reply(`🎌 *${a.title}*\n${a.title_english && a.title_english !== a.title ? a.title_english + '\n' : ''}⭐ Score: ${a.score || '-'} • 📺 Episodes: ${a.episodes || '-'} • 📅 ${a.year || '-'}\n🎭 ${a.genres ? a.genres.map((g) => g.name).join(', ') : ''}\n\n${a.synopsis ? a.synopsis.slice(0, 600) : ''}${a.url ? `\n\n🔗 ${a.url}` : ''}`);
      } catch (e) {
        await ctx.reply('❌ Anime khuje pai nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'tiktokstalk',
    aliases: ['ttstalk', 'ttuser'],
    category: 'Search',
    desc: 'TikTok user-er info dekho',
    usage: '.tiktokstalk tiktok',
    async run(ctx) {
      const user = (ctx.text || '').trim().split(/\s+/)[0].replace(/^@/, '');
      if (!user) return ctx.reply('❓ Ekta TikTok username likho. Jemon: .tiktokstalk tiktok');
      try {
        const d = await fetchJson('https://www.tikwm.com/api/user/info?unique_id=' + encodeURIComponent(user));
        const u = d && d.data && d.data.user;
        if (!u) return ctx.reply('❌ Ei username-e kono TikTok user pai nai.');
        const s = d.data.stats || {};
        await ctx.reply(`🎵 *${u.nickname || u.unique_id}* (@${u.unique_id})\n${u.signature ? u.signature.slice(0, 200) + '\n' : ''}\n👥 Followers: ${s.follower_count || 0}\n➕ Following: ${s.following_count || 0}\n❤️ Likes: ${s.heart_count || 0}\n🎬 Videos: ${s.video_count || 0}`);
      } catch (e) {
        await ctx.reply('❌ TikTok user-er info ante pari nai. Ektu por abar try koro.');
      }
    },
  },
];
