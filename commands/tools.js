// Tools command — sticker, toimg, wiki, weather, ai.
// sticker: ffmpeg diye webp banano hoy (kono paid API lage na).
// wiki/weather: free public API, kono key lage na (Node-er built-in fetch use kora hoy).
// ai: Groq key lage (Railway Variables-e GROQ_API_KEY).
const { getMediaBuffer, bufferToWebp } = require('../lib/helpers');

module.exports = [
  {
    name: 'sticker',
    aliases: ['s', 'st'],
    category: 'Tools',
    desc: 'Chobi/video theke sticker banai',
    usage: '.sticker (chobi diye ba chobi-te reply diye)',
    async run(ctx) {
      const media = await getMediaBuffer(ctx.sock, ctx.msg);
      if (!media) return ctx.reply('❌ Ekta chobi ba video dao, ba kono chobi-te reply diye .sticker likho.');
      if (media.type === 'sticker') return ctx.reply('❌ Eita to already sticker! .toimg diye chobi banate parbe.');
      try {
        const webp = await bufferToWebp(media.buffer, media.type === 'video');
        await ctx.sock.sendMessage(ctx.jid, { sticker: webp }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('⚠️ Sticker banano jay nai. Chobi-ta 10MB-er choto hote hobe, ar video 6 second-er vitore.');
      }
    },
  },
  {
    name: 'toimg',
    aliases: ['toimage'],
    category: 'Tools',
    desc: 'Sticker-ke abar chobi banai',
    usage: '.toimg (sticker-e reply diye)',
    async run(ctx) {
      const media = await getMediaBuffer(ctx.sock, ctx.msg);
      if (!media || media.type !== 'sticker') return ctx.reply('❌ Ekta sticker-e reply diye .toimg likho.');
      // Sticker webp — WhatsApp chobi hisebe pathale phone-e chobi hisebe dekhabe
      await ctx.sock.sendMessage(ctx.jid, { image: media.buffer, caption: '🖼️ Sticker theke chobi' }, { quoted: ctx.msg });
    },
  },
  {
    name: 'wiki',
    aliases: ['wikipedia'],
    category: 'Tools',
    desc: 'Wikipedia theke kono bishoy khuje dey',
    usage: '.wiki Bangladesh',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Ki khujbe likho. Jemon: .wiki Bangladesh');
      try {
        const r = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(ctx.text), { signal: AbortSignal.timeout(15000) });
        if (!r.ok) throw new Error('not found');
        const d = await r.json();
        let out = `📚 *${d.title || ctx.text}*\n\n${d.extract || 'Kichu pawa jay nai.'}`;
        if (d.content_urls && d.content_urls.desktop && d.content_urls.desktop.page) {
          out += `\n\n🔗 ${d.content_urls.desktop.page}`;
        }
        await ctx.reply(out);
      } catch (e) {
        await ctx.reply('❌ Wikipedia-te ei bishoy-ta pawa jay nai. Onno naam diye try koro.');
      }
    },
  },
  {
    name: 'weather',
    aliases: ['abohawa', 'weather2', 'weatherinfo'],
    category: 'Tools',
    desc: 'Kono shohor-er abohawa janai',
    usage: '.weather Dhaka',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Shohor-er naam likho. Jemon: .weather Dhaka');
      try {
        const r = await fetch('https://wttr.in/' + encodeURIComponent(ctx.text) + '?format=j1', { signal: AbortSignal.timeout(15000) });
        if (!r.ok) throw new Error('no data');
        const data = await r.json();
        const cur = data.current_condition && data.current_condition[0];
        const area = data.nearest_area && data.nearest_area[0];
        if (!cur) throw new Error('no data');
        const place = area && area.areaName && area.areaName[0] ? area.areaName[0].value : ctx.text;
        const country = area && area.country && area.country[0] ? area.country[0].value : '';
        const desc = cur.weatherDesc && cur.weatherDesc[0] ? cur.weatherDesc[0].value : '';
        await ctx.reply(
          `🌤️ *${place}${country ? ', ' + country : ''}*\n` +
          `Abostha: ${desc}\n` +
          `Tapmatra: ${cur.temp_C}°C (feel ${cur.FeelsLikeC}°C)\n` +
          `Batash: ${cur.windspeedKmph} km/h • Adrota: ${cur.humidity}%\n` +
          `Brishti-r somvabona: ${cur.precipMM}mm`
        );
      } catch (e) {
        await ctx.reply('❌ Abohawa pawa jay nai. Shohor-er naam thik ache kina check koro.');
      }
    },
  }
];
