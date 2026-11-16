// Audio effect command — ffmpeg diye audio reply-te effect lagano.
const { getMediaBuffer, audioEffect } = require('../lib/helpers');

function fxCmd(name, aliases, filter, label, desc) {
  return {
    name,
    aliases: aliases || [],
    category: 'Tools',
    desc,
    usage: `.${name} (audio reply kore)`,
    async run(ctx) {
      const buf = await getMediaBuffer(ctx);
      if (!buf) return ctx.reply(`❓ Ekta audio ba video reply kore .${name} likho.`);
      await ctx.reply(`🎵 ${label} hocche...`);
      try {
        const out = await audioEffect(buf, filter);
        await ctx.sock.sendMessage(ctx.jid, { audio: out, mimetype: 'audio/mp4', fileName: name + '.mp3' }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Audio effect lagano jay nai. Onno ekta file diye try koro.');
      }
    },
  };
}

module.exports = [
  fxCmd('bass', [], 'bass=g=12:f=110', 'Bass boost', 'Audio-te bass boost koro'),
  fxCmd('earrape', [], 'volume=8,alimiter=limit=0.8', 'Earrape', 'Audio onek jore koro (moja)'),
  fxCmd('nightcore', [], 'atempo=1.25,asetrate=44100*1.25', 'Nightcore', 'Audio fast + pitch up koro'),
  fxCmd('slow', [], 'atempo=0.8', 'Slow', 'Audio slow koro'),
  fxCmd('fast', [], 'atempo=1.3', 'Fast', 'Audio fast koro'),
  fxCmd('reverse', [], 'areverse', 'Reverse', 'Audio ulta koro'),
  fxCmd('blown', [], 'volume=6,acrusher=level_in=8:level_out=18:bits=8:mode=log', 'Blown', 'Audio blown effect dao'),
];
