// Wallpaper command — Wallhaven free API diye (key lage na).
// REAN-er wallpaper command gulo ekhane notun kore banano.
async function wall(ctx, query, label) {
  try {
    const r = await fetch('https://wallhaven.cc/api/v1/search?q=' + encodeURIComponent(query) + '&sorting=random&toprange=1y', { signal: AbortSignal.timeout(20000) });
    const d = await r.json();
    const hit = (d.data || [])[0];
    if (!hit || !hit.path) throw new Error('empty');
    await ctx.sock.sendMessage(ctx.jid, { image: { url: hit.path }, caption: `🖼️ ${label}` }, { quoted: ctx.msg });
  } catch (e) {
    await ctx.reply('❌ Wallpaper ante pari nai. Ektu por abar try koro.');
  }
}

function wallCmd(name, query, label) {
  return {
    name,
    aliases: [],
    category: 'Tools',
    desc: `${label} wallpaper dao`,
    usage: `.${name}`,
    async run(ctx) { await wall(ctx, query, label); },
  };
}

module.exports = [
  wallCmd('galaxywallpaper', 'galaxy', 'Galaxy Wallpaper'),
  wallCmd('gamewallpaper', 'gaming', 'Gaming Wallpaper'),
  wallCmd('gamewall', 'gaming', 'Gaming Wallpaper'),
  wallCmd('islamicwall', 'islamic', 'Islamic Wallpaper'),
  wallCmd('quranwall', 'quran islamic', 'Quran Wallpaper'),
  wallCmd('phonewallpaper', 'phone wallpaper', 'Phone Wallpaper'),
  wallCmd('pubgwall', 'pubg', 'PUBG Wallpaper'),
  wallCmd('hackerwall', 'hacker', 'Hacker Wallpaper'),
  wallCmd('spacewall', 'space', 'Space Wallpaper'),
  wallCmd('wallml', 'mobile legends', 'Mobile Legends Wallpaper'),
  wallCmd('wallmlnime', 'mobile legends anime', 'Mobile Legends Anime Wallpaper'),
  wallCmd('mountain', 'mountain', 'Mountain Wallpaper'),
  wallCmd('mountains', 'mountains', 'Mountains Wallpaper'),
  wallCmd('moon', 'moon', 'Moon Wallpaper'),
  wallCmd('night', 'night sky', 'Night Wallpaper'),
  wallCmd('rain', 'rain', 'Rain Wallpaper'),
  wallCmd('space', 'space', 'Space Wallpaper'),
  wallCmd('sunset', 'sunset', 'Sunset Wallpaper'),
  wallCmd('summerbeach', 'summer beach', 'Summer Beach Wallpaper'),
  wallCmd('sandsummer', 'beach summer', 'Beach Wallpaper'),
  wallCmd('cyberpunk', 'cyberpunk', 'Cyberpunk Wallpaper'),
  wallCmd('thunder', 'thunder lightning', 'Thunder Wallpaper'),
  wallCmd('cosplay', 'cosplay', 'Cosplay Wallpaper'),
];
