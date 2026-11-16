// Media command — download, convert, chobi edit.
// YT video/audio: @distube/ytdl-core v5. TikTok: tikwm free API.
const { Ytdl, chooseFormat } = require('@distube/ytdl-core');
const { getMediaBuffer, bufferToMp3, bufferToMp4, enhanceImage } = require('../lib/helpers');

const MAX_MB = 15;

async function fetchBuffer(url, timeoutMs) {
  const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs || 60000) });
  if (!r.ok) throw new Error('http ' + r.status);
  return Buffer.from(await r.arrayBuffer());
}

module.exports = [
  {
    name: 'ytmp4',
    aliases: ['video', 'ytvideo'],
    category: 'Download',
    desc: 'YouTube video download koro (15MB-er vitore)',
    usage: '.ytmp4 alan walker faded',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Gaan ba video-r naam likho. Jemon: .ytmp4 alan walker faded');
      await ctx.reply('📥 Video khujchi...');
      try {
        const ytdl = new Ytdl();
        const results = await ytdl.search(ctx.text, { limit: 1 });
        const v = results && results[0];
        if (!v) return ctx.reply('❌ Video pai nai.');
        const info = await ytdl.getInfo(v.id);
        const formats = info && info.formats;
        const format = chooseFormat(formats, { quality: 'lowest', filter: (f) => f.hasVideo && f.hasAudio && f.container === 'mp4' })
          || chooseFormat(formats, { quality: 'lowest', filter: 'audioandvideo' });
        if (!format) return ctx.reply('❌ Ei video-r download format pai nai.');
        if (format.contentLength && parseInt(format.contentLength, 10) > MAX_MB * 1024 * 1024) {
          return ctx.reply(`❌ Video-ta ${MAX_MB}MB-er beshi, WhatsApp-e pathano jabe na. Choto video try koro.`);
        }
        const stream = ytdl.download(info, { format });
        const chunks = [];
        let size = 0;
        for await (const c of stream) {
          size += c.length;
          if (size > MAX_MB * 1024 * 1024) { stream.destroy(); return ctx.reply(`❌ Video-ta ${MAX_MB}MB-er beshi, pathano jabe na.`); }
          chunks.push(c);
        }
        const buf = Buffer.concat(chunks);
        const title = info.videoDetails && info.videoDetails.title;
        await ctx.sock.sendMessage(ctx.jid, { video: buf, mimetype: 'video/mp4', caption: `🎬 *${title || ctx.text}*` }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Video download kora jay nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'tiktok',
    aliases: ['tiktokdl', 'ttdl'],
    category: 'Download',
    desc: 'TikTok video download koro',
    usage: '.tiktok <tiktok video link>',
    async run(ctx) {
      const url = (ctx.text || '').trim().split(/\s+/)[0];
      if (!url || !url.includes('tiktok.com')) return ctx.reply('❓ Ekta TikTok video link dao. Jemon: .tiktok https://www.tiktok.com/@user/video/123...');
      await ctx.reply('📥 TikTok video anchi...');
      try {
        const r = await fetch('https://www.tikwm.com/api/?url=' + encodeURIComponent(url), { signal: AbortSignal.timeout(30000) });
        const d = await r.json();
        const v = d && d.data;
        const play = v && (v.play || v.wmplay);
        if (!play) return ctx.reply('❌ Ei TikTok video-ta download kora jay nai. Link-ta thik ache kina dekho.');
        const buf = await fetchBuffer(play, 60000);
        if (buf.length > MAX_MB * 1024 * 1024) return ctx.reply(`❌ Video-ta ${MAX_MB}MB-er beshi, pathano jabe na.`);
        await ctx.sock.sendMessage(ctx.jid, { video: buf, mimetype: 'video/mp4', caption: `🎵 TikTok: *${(v.title || '').slice(0, 100)}*` }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ TikTok video download kora jay nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'ssweb',
    aliases: ['ss', 'screenshot'],
    category: 'Tools',
    desc: 'Jekono website-er screenshot nao',
    usage: '.ssweb google.com',
    async run(ctx) {
      const site = (ctx.text || '').trim().split(/\s+/)[0];
      if (!site) return ctx.reply('❓ Ekta website likho. Jemon: .ssweb google.com');
      const url = /^https?:\/\//i.test(site) ? site : 'https://' + site;
      await ctx.reply('📸 Screenshot neya hocche...');
      try {
        const buf = await fetchBuffer('https://image.thum.io/get/width/800/' + encodeURIComponent(url), 60000);
        await ctx.sock.sendMessage(ctx.jid, { image: buf, caption: `📸 *${url}*` }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Screenshot neya jay nai. Website-ta thik ache kina dekho.');
      }
    },
  },
  {
    name: 'qr',
    aliases: ['qrcode'],
    category: 'Tools',
    desc: 'Lekha theke QR code banai',
    usage: '.qr Hello world',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ QR-er jonno kichu likho. Jemon: .qr Hello world');
      try {
        const buf = await fetchBuffer('https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=' + encodeURIComponent(ctx.text), 30000);
        await ctx.sock.sendMessage(ctx.jid, { image: buf, caption: `🔳 QR: *${ctx.text}*` }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ QR code banano jay nai.');
      }
    },
  },
  {
    name: 'readqr',
    aliases: ['qrread'],
    category: 'Tools',
    desc: 'QR code-er chobi reply diye poro',
    usage: '.readqr (QR chobi reply kore)',
    async run(ctx) {
      const buf = await getMediaBuffer(ctx);
      if (!buf) return ctx.reply('❓ Ekta QR code-er chobi reply kore .readqr likho.');
      await ctx.reply('🔍 QR porchi...');
      try {
        // chobi-ta age catbox-e upload, tarpor QR read API
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', new Blob([buf], { type: 'image/png' }), 'qr.png');
        const up = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form, signal: AbortSignal.timeout(30000) });
        const imgUrl = (await up.text()).trim();
        if (!imgUrl.startsWith('http')) throw new Error('upload failed');
        const r = await fetch('https://api.qrserver.com/v1/read-qr-code/?fileurl=' + encodeURIComponent(imgUrl), { signal: AbortSignal.timeout(30000) });
        const d = await r.json();
        const sym = d && d[0] && d[0].symbol && d[0].symbol[0];
        if (!sym || !sym.data) return ctx.reply('❌ Ei chobi-te kono QR code pai nai.');
        await ctx.reply(`🔳 QR-er vitore:\n\n${sym.data}`);
      } catch (e) {
        await ctx.reply('❌ QR pora jay nai. Chobi-ta thik ache kina dekho.');
      }
    },
  },
  {
    name: 'tourl',
    aliases: ['url'],
    category: 'Tools',
    desc: 'Chobi/video upload kore link dao',
    usage: '.tourl (chobi reply kore)',
    async run(ctx) {
      const buf = await getMediaBuffer(ctx);
      if (!buf) return ctx.reply('❓ Ekta chobi ba video reply kore .tourl likho.');
      await ctx.reply('⬆️ Upload hocche...');
      try {
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', new Blob([buf]), 'file.jpg');
        const r = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form, signal: AbortSignal.timeout(60000) });
        const url = (await r.text()).trim();
        if (!url.startsWith('http')) throw new Error('upload failed');
        await ctx.reply(`🔗 Tomar file-er link:\n${url}`);
      } catch (e) {
        await ctx.reply('❌ Upload kora jay nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'tomp3',
    aliases: ['tomp3dl'],
    category: 'Tools',
    desc: 'Video/audio reply diye MP3 banai',
    usage: '.tomp3 (video reply kore)',
    async run(ctx) {
      const buf = await getMediaBuffer(ctx);
      if (!buf) return ctx.reply('❓ Ekta video ba audio reply kore .tomp3 likho.');
      await ctx.reply('🎵 MP3 banano hocche...');
      try {
        const mp3 = await bufferToMp3(buf, true);
        await ctx.sock.sendMessage(ctx.jid, { audio: mp3, mimetype: 'audio/mp4', fileName: 'audio.mp3' }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ MP3 banano jay nai. Onno ekta file diye try koro.');
      }
    },
  },
  {
    name: 'tomp4',
    aliases: [],
    category: 'Tools',
    desc: 'Sticker/chobi reply diye MP4 video banai',
    usage: '.tomp4 (sticker reply kore)',
    async run(ctx) {
      const buf = await getMediaBuffer(ctx);
      if (!buf) return ctx.reply('❓ Ekta sticker ba chobi reply kore .tomp4 likho.');
      await ctx.reply('🎬 MP4 banano hocche...');
      try {
        const mp4 = await bufferToMp4(buf);
        await ctx.sock.sendMessage(ctx.jid, { video: mp4, mimetype: 'video/mp4', caption: '🎬 MP4 video' }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ MP4 banano jay nai. Onno ekta file diye try koro.');
      }
    },
  },
  {
    name: 'tts',
    aliases: ['gtts', 'say'],
    category: 'Tools',
    desc: 'Lekha ke voice banai (Bangla/English)',
    usage: '.tts bn Ami valo achi',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Ki bolbe likho. Jemon: .tts bn Ami valo achi\nBa: .tts Hello friend');
      let lang = 'en';
      let text = ctx.text;
      const first = ctx.text.split(/\s+/)[0];
      if (/^[a-z]{2}(-[A-Z]{2})?$/.test(first) && ctx.text.split(/\s+/).length > 1) {
        lang = first;
        text = ctx.text.split(/\s+/).slice(1).join(' ');
      }
      try {
        const url = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=' + encodeURIComponent(lang) + '&q=' + encodeURIComponent(text.slice(0, 200));
        const buf = await fetchBuffer(url, 30000);
        await ctx.sock.sendMessage(ctx.jid, { audio: buf, mimetype: 'audio/mp4', fileName: 'voice.mp3' }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Voice banano jay nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'tovn',
    aliases: ['voicenote'],
    category: 'Tools',
    desc: 'Lekha ba audio ke voice note banai',
    usage: '.tovn Ami valo achi',
    async run(ctx) {
      if (ctx.text) {
        try {
          const url = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=bn&q=' + encodeURIComponent(ctx.text.slice(0, 200));
          const buf = await fetchBuffer(url, 30000);
          await ctx.sock.sendMessage(ctx.jid, { audio: buf, mimetype: 'audio/mp4', ptt: true }, { quoted: ctx.msg });
        } catch (e) {
          await ctx.reply('❌ Voice note banano jay nai.');
        }
        return;
      }
      const buf = await getMediaBuffer(ctx);
      if (!buf) return ctx.reply('❓ Lekha dao, ba ekta audio reply kore .tovn likho.');
      try {
        const mp3 = await bufferToMp3(buf, false);
        await ctx.sock.sendMessage(ctx.jid, { audio: mp3, mimetype: 'audio/mp4', ptt: true }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Voice note banano jay nai.');
      }
    },
  },
  {
    name: 'enhance',
    aliases: ['hdr'],
    category: 'Tools',
    desc: 'Chobi reply diye porishkar koro',
    usage: '.enhance (chobi reply kore)',
    async run(ctx) {
      const buf = await getMediaBuffer(ctx);
      if (!buf) return ctx.reply('❓ Ekta chobi reply kore .enhance likho.');
      await ctx.reply('✨ Chobi porishkar kora hocche...');
      try {
        const out = await enhanceImage(buf, 'unsharp=5:5:0.8:5:5:0.4,eq=contrast=1.08:saturation=1.15');
        await ctx.sock.sendMessage(ctx.jid, { image: out, caption: '✨ Enhanced' }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Chobi enhance kora jay nai.');
      }
    },
  },
  {
    name: 'upscale',
    aliases: [],
    category: 'Tools',
    desc: 'Chobi reply diye 2x boro koro',
    usage: '.upscale (chobi reply kore)',
    async run(ctx) {
      const buf = await getMediaBuffer(ctx);
      if (!buf) return ctx.reply('❓ Ekta chobi reply kore .upscale likho.');
      await ctx.reply('🔍 Chobi boro kora hocche...');
      try {
        const out = await enhanceImage(buf, 'scale=iw*2:ih*2:flags=lanczos,unsharp=5:5:0.6');
        await ctx.sock.sendMessage(ctx.jid, { image: out, caption: '🔍 2x Upscaled' }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Chobi boro kora jay nai.');
      }
    },
  },
  {
    name: 'dehaze',
    aliases: [],
    category: 'Tools',
    desc: 'Ghola chobi reply diye porishkar koro',
    usage: '.dehaze (chobi reply kore)',
    async run(ctx) {
      const buf = await getMediaBuffer(ctx);
      if (!buf) return ctx.reply('❓ Ekta chobi reply kore .dehaze likho.');
      await ctx.reply('🌫️ Dehaze kora hocche...');
      try {
        const out = await enhanceImage(buf, 'eq=contrast=1.2:brightness=0.02:saturation=1.25,unsharp=5:5:0.5');
        await ctx.sock.sendMessage(ctx.jid, { image: out, caption: '🌫️ Dehazed' }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Dehaze kora jay nai.');
      }
    },
  },
  {
    name: 'blur',
    aliases: [],
    category: 'Tools',
    desc: 'Chobi reply diye blur koro',
    usage: '.blur (chobi reply kore)',
    async run(ctx) {
      const buf = await getMediaBuffer(ctx);
      if (!buf) return ctx.reply('❓ Ekta chobi reply kore .blur likho.');
      await ctx.reply('🌀 Blur kora hocche...');
      try {
        const out = await enhanceImage(buf, 'gblur=sigma=8');
        await ctx.sock.sendMessage(ctx.jid, { image: out, caption: '🌀 Blurred' }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Blur kora jay nai.');
      }
    },
  },
  {
    name: 'take',
    aliases: ['steal', 'wm', 'takefull'],
    category: 'Tools',
    desc: 'Sticker reply diye nijer sticker banai',
    usage: '.take (sticker reply kore)',
    async run(ctx) {
      const buf = await getMediaBuffer(ctx);
      if (!buf) return ctx.reply('❓ Ekta sticker reply kore .take likho.');
      await ctx.sock.sendMessage(ctx.jid, { sticker: buf }, { quoted: ctx.msg });
    },
  },
  {
    name: 'emoji',
    aliases: ['emojisticker', 'emojimenu'],
    category: 'Tools',
    desc: 'Emoji theke sticker banai',
    usage: '.emoji 😂',
    async run(ctx) {
      const em = (ctx.text || '').trim().split(/\s+/)[0];
      if (!em) return ctx.reply('❓ Ekta emoji dao. Jemon: .emoji 😂');
      const code = [...em].map((c) => c.codePointAt(0).toString(16)).join('-');
      try {
        const buf = await fetchBuffer('https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/' + code + '.png', 30000);
        const { bufferToWebp } = require('../lib/helpers');
        const webp = await bufferToWebp(buf);
        await ctx.sock.sendMessage(ctx.jid, { sticker: webp }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Ei emoji-r sticker banano jay nai. Onno emoji try koro.');
      }
    },
  },
];
