// Download command — YouTube theke gan (audio) namiye pathai.
// @distube/ytdl-core v5 diye khuje + namano hoy (search built-in). Kono key lage na.
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { Ytdl, chooseFormat } = require('@distube/ytdl-core');

const ytdl = new Ytdl();
const MAX_BYTES = 15 * 1024 * 1024; // 15MB — er beshi hole WhatsApp-e pathano kothin

function fmtDuration(sec) {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

module.exports = [
  {
    name: 'play',
    aliases: ['song', 'music'],
    category: 'Download',
    desc: 'YouTube theke gan khuje audio pathai',
    usage: '.play rajkarega khalsa',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Gan-er naam likho. Jemon: .play rajkarega khalsa');
      await ctx.reply('🔍 Gan khujchi...');
      let file = null;
      try {
        const results = await ytdl.search(ctx.text, { limit: 5 });
        const video = results && results[0];
        if (!video) return ctx.reply('❌ Ei naam-e kono gan pawa jay nai.');
        if (video.lengthSeconds && video.lengthSeconds > 600) {
          return ctx.reply('❌ Gan-ta 10 minute-er beshi boro — choto gan khujo.');
        }

        const info = await ytdl.getInfo(video.id);
        // MP4 audio age khuji (WhatsApp-e sobcheye valo chole); na pele jekono audio
        let format = null;
        try {
          format = chooseFormat(info.formats, { quality: 'highestaudio', filter: (f) => f.container === 'mp4' && f.hasAudio });
        } catch (_) { format = null; }
        if (!format) {
          format = chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
        }
        if (!format) return ctx.reply('❌ Ei gan-er audio format pawa jay nai. Onno gan try koro.');

        file = path.join(os.tmpdir(), `mraimd-song-${crypto.randomBytes(6).toString('hex')}.m4a`);
        const stream = ytdl.download(info, { format });
        let size = 0;
        let tooBig = false;
        await new Promise((resolve, reject) => {
          const ws = fs.createWriteStream(file);
          stream.on('data', (chunk) => {
            size += chunk.length;
            if (size > MAX_BYTES) { tooBig = true; stream.destroy(); ws.destroy(); }
          });
          stream.on('error', reject);
          ws.on('error', reject);
          ws.on('finish', resolve);
          stream.pipe(ws);
        });
        if (tooBig) {
          try { fs.unlinkSync(file); } catch (_) {}
          return ctx.reply('❌ Gan-er file 15MB-er beshi — pathano jabe na. Onno gan try koro.');
        }
        const buf = fs.readFileSync(file);
        const title = (info.videoDetails && info.videoDetails.title) || video.title;
        const dur = fmtDuration((info.videoDetails && info.videoDetails.lengthSeconds) || video.lengthSeconds);
        await ctx.sock.sendMessage(ctx.jid, {
          audio: buf,
          mimetype: 'audio/mp4',
          fileName: `${title}.m4a`,
        }, { quoted: ctx.msg });
        await ctx.reply(`🎵 *${title}*${dur ? `\n⏱️ ${dur}` : ''}`);
      } catch (e) {
        await ctx.reply('❌ Gan download kora jay nai. Ektu por abar try koro, ba onno naam likho.');
      } finally {
        if (file) { try { fs.unlinkSync(file); } catch (_) {} }
      }
    },
  },
];
