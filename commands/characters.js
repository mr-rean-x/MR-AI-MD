// Anime character chobi — Pollinations free image API diye.
// REAN-er character command gulo (asuna, naruto, mikasa...) ekhane
// notun kore banano — prottek-ta ekta anime character-er chobi dey.
async function charImage(ctx, character) {
  await ctx.reply('🎨 Chobi banano hocche...');
  try {
    const prompt = `anime character ${character}, beautiful anime art, detailed, portrait`;
    const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) + '?width=512&height=512&nologo=true&seed=' + Math.floor(Math.random() * 100000);
    const r = await fetch(url, { signal: AbortSignal.timeout(90000) });
    if (!r.ok) throw new Error('http ' + r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1000) throw new Error('empty');
    await ctx.sock.sendMessage(ctx.jid, { image: buf, caption: `🎌 *${character}*` }, { quoted: ctx.msg });
  } catch (e) {
    await ctx.reply('❌ Chobi banano jay nai. Ektu por abar try koro.');
  }
}

function charCmd(name, character) {
  return {
    name,
    aliases: [],
    category: 'Anime',
    desc: `${character}-er anime chobi dao`,
    usage: `.${name}`,
    async run(ctx) { await charImage(ctx, character); },
  };
}

module.exports = [
  charCmd('asuna', 'Asuna Yuuki from Sword Art Online'),
  charCmd('ayuzawa', 'Misaki Ayuzawa from Maid Sama'),
  charCmd('boruto', 'Boruto Uzumaki from Boruto'),
  charCmd('chiho', 'Chiho Sasaki from The Devil is a Part-Timer'),
  charCmd('deidara', 'Deidara from Naruto'),
  charCmd('elaina', 'Elaina from Wandering Witch'),
  charCmd('emilia', 'Emilia from Re:Zero'),
  charCmd('erza', 'Erza Scarlet from Fairy Tail'),
  charCmd('gremory', 'Rias Gremory from High School DxD'),
  charCmd('hestia', 'Hestia from DanMachi'),
  charCmd('inori', 'Inori Yuzuriha from Guilty Crown'),
  charCmd('isuzu', 'Isuzu Sento from Amagi Brilliant Park'),
  charCmd('itachi', 'Itachi Uchiha from Naruto'),
  charCmd('itori', 'Itori from anime'),
  charCmd('kaga', 'Kaga from Kantai Collection'),
  charCmd('kagura', 'Kagura from Gintama'),
  charCmd('kakashi', 'Kakashi Hatake from Naruto'),
  charCmd('kaori', 'Kaori Miyazono from Your Lie in April'),
  charCmd('keneki', 'Ken Kaneki from Tokyo Ghoul'),
  charCmd('kotori', 'Kotori Minami from Love Live'),
  charCmd('kurumi', 'Kurumi Tokisaki from Date A Live'),
  charCmd('madara', 'Madara Uchiha from Naruto'),
  charCmd('megumin', 'Megumin from Konosuba'),
  charCmd('mikasa', 'Mikasa Ackerman from Attack on Titan'),
  charCmd('miku', 'Hatsune Miku, vocaloid'),
  charCmd('minato', 'Minato Namikaze from Naruto'),
  charCmd('naruto', 'Naruto Uzumaki from Naruto'),
  charCmd('nezuko', 'Nezuko Kamado from Demon Slayer'),
  charCmd('rize', 'Rize Kamishiro from Tokyo Ghoul'),
  charCmd('ryujin', 'Ryujin anime girl'),
  charCmd('sagiri', 'Sagiri Izumi from Eromanga Sensei'),
  charCmd('sakura', 'Sakura Haruno from Naruto'),
  charCmd('sasuke', 'Sasuke Uchiha from Naruto'),
  charCmd('shinobu', 'Shinobu Kocho from Demon Slayer'),
  charCmd('tsunade', 'Tsunade from Naruto'),
  charCmd('yotsuba', 'Yotsuba Nakano from Quintessential Quintuplets'),
  charCmd('yuki', 'Yuki Nagato from Haruhi Suzumiya'),
  charCmd('yuki1', 'Yuki anime girl'),
  charCmd('yumeko', 'Yumeko Jabami from Kakegurui'),
  charCmd('akiyama', 'Mio Akiyama from K-On'),
  charCmd('ana', 'Ana anime girl'),
  charCmd('onepiece', 'Monkey D. Luffy from One Piece'),
  charCmd('doraemon', 'Doraemon, blue robotic cat'),
];
