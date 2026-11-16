// K-pop chobi — Openverse free image API diye (key lage na).
// REAN-er k-pop command gulo (bts, exo, jennie...) ekhane notun kore banano.
async function kpopImage(ctx, query, label) {
  try {
    const r = await fetch('https://api.openverse.org/v1/images/?q=' + encodeURIComponent(query) + '&page_size=3', { signal: AbortSignal.timeout(20000) });
    const d = await r.json();
    const hit = (d.results || []).find((x) => x && x.url);
    if (!hit) throw new Error('empty');
    await ctx.sock.sendMessage(ctx.jid, { image: { url: hit.url }, caption: `🎤 ${label}` }, { quoted: ctx.msg });
  } catch (e) {
    await ctx.reply('❌ Chobi ante pari nai. Ektu por abar try koro.');
  }
}

function kpopCmd(name, query, label) {
  return {
    name,
    aliases: [],
    category: 'Fun',
    desc: `${label} chobi dao`,
    usage: `.${name}`,
    async run(ctx) { await kpopImage(ctx, query, label); },
  };
}

module.exports = [
  kpopCmd('bts', 'BTS kpop', 'BTS'),
  kpopCmd('exo', 'EXO kpop', 'EXO'),
  kpopCmd('svt', 'Seventeen kpop', 'SEVENTEEN'),
  kpopCmd('jennie', 'Jennie Blackpink', 'Jennie'),
  kpopCmd('jennie1', 'Jennie Kim Blackpink', 'Jennie'),
  kpopCmd('jisoo', 'Jisoo Blackpink', 'Jisoo'),
  kpopCmd('randblackpink', 'Blackpink kpop', 'Blackpink'),
];
