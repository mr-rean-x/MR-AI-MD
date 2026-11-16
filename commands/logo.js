// Logo / text-effect command — Pollinations free image API diye.
// REAN-er gfx1-11 ar logo style gulo ekhane notun kore banano.
async function logoImage(ctx, stylePrompt, text) {
  await ctx.reply('🎨 Logo banano hocche...');
  try {
    const prompt = `logo design, text "${text}", ${stylePrompt}, centered, clean background`;
    const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) + '?width=512&height=512&nologo=true&seed=' + Math.floor(Math.random() * 100000);
    const r = await fetch(url, { signal: AbortSignal.timeout(90000) });
    if (!r.ok) throw new Error('http ' + r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1000) throw new Error('empty');
    await ctx.sock.sendMessage(ctx.jid, { image: buf, caption: `🎨 *${text}*` }, { quoted: ctx.msg });
  } catch (e) {
    await ctx.reply('❌ Logo banano jay nai. Ektu por abar try koro.');
  }
}

function logoCmd(name, aliases, stylePrompt, desc) {
  return {
    name,
    aliases: aliases || [],
    category: 'Logo',
    desc: desc || 'Text-effect logo banai',
    usage: `.${name} <lekha>`,
    async run(ctx) {
      if (!ctx.text) return ctx.reply(`❓ Ki likhbe dao. Jemon: .${name} MR AI`);
      await logoImage(ctx, stylePrompt, ctx.text);
    },
  };
}

module.exports = [
  logoCmd('logo', ['logomaker', 'makelogo', 'logo2', 'makelogo2', 'maketext', 'createlogo'], 'modern minimal logo, professional typography', 'Sundor logo banai'),
  logoCmd('neontext', ['neon', 'neonglitch', 'makingneon', 'multicoloredneon'], 'glowing neon sign, bright neon tubes, dark background', 'Neon style logo'),
  logoCmd('glitchtext', ['glitch', 'pixelglitch'], 'glitch effect text, RGB split, digital distortion', 'Glitch style logo'),
  logoCmd('3dtext', ['text3d', 'flag3dtext'], '3D extruded text, bold, dramatic lighting', '3D style logo'),
  logoCmd('goldtext', ['gold', 'luxurygold'], 'golden metallic text, luxury, shiny gold', 'Golden style logo'),
  logoCmd('firetext', ['fire', 'flame'], 'burning fire text, flames, orange glow', 'Fire style logo'),
  logoCmd('icetext', ['ice', 'frozen'], 'frozen ice text, blue crystal, snow', 'Ice style logo'),
  logoCmd('rainbowtext', ['rainbow'], 'rainbow gradient text, colorful', 'Rainbow style logo'),
  logoCmd('metaltext', ['metal'], 'chrome metal text, reflective steel', 'Metal style logo'),
  logoCmd('retrotext', ['retro'], 'retro vintage 80s text, neon sunset', 'Retro style logo'),
  logoCmd('royaltext', ['royal'], 'royal elegant text, crown, purple gold', 'Royal style logo'),
  logoCmd('watertext', ['water', 'watercolortext'], 'water splash text, blue water effect', 'Water style logo'),
  logoCmd('galaxystyle', ['galaxy'], 'galaxy space text, stars, purple nebula', 'Galaxy style logo'),
  logoCmd('blackpinklogo', ['blackpink', 'blackpinkstyle'], 'black and pink stylish text, kpop style', 'Blackpink style logo'),
  logoCmd('floraltext', ['floral', 'flowers'], 'floral flower text, petals, spring', 'Floral style logo'),
  logoCmd('gradienttext', ['gradient'], 'smooth gradient text, purple blue pink', 'Gradient style logo'),
  logoCmd('graffititext', ['graffiti'], 'graffiti street art text, spray paint', 'Graffiti style logo'),
  logoCmd('typographytext', ['typography', 'teximage', 'writetext'], 'creative typography, artistic letters', 'Typography logo'),
  // gfx1-11 — REAN-er numbered logo style (egulo uporer style-er motoi, number diye)
  logoCmd('gfx1', [], 'glowing neon sign text, dark background', 'GFX style 1 logo'),
  logoCmd('gfx2', [], '3D extruded bold text, dramatic lighting', 'GFX style 2 logo'),
  logoCmd('gfx3', [], 'golden metallic luxury text', 'GFX style 3 logo'),
  logoCmd('gfx4', [], 'burning fire text, orange glow', 'GFX style 4 logo'),
  logoCmd('gfx5', [], 'frozen ice blue crystal text', 'GFX style 5 logo'),
  logoCmd('gfx6', [], 'galaxy space stars text', 'GFX style 6 logo'),
  logoCmd('gfx7', [], 'retro vintage 80s neon text', 'GFX style 7 logo'),
  logoCmd('gfx8', [], 'chrome metal reflective text', 'GFX style 8 logo'),
  logoCmd('gfx9', [], 'rainbow gradient colorful text', 'GFX style 9 logo'),
  logoCmd('gfx10', [], 'water splash blue text', 'GFX style 10 logo'),
  logoCmd('gfx11', [], 'graffiti street art spray text', 'GFX style 11 logo'),
  logoCmd('gfx12', [], 'glowing neon cyberpunk text', 'GFX style 12 logo'),
  logoCmd('glowingtext', ['advancedglow'], 'glowing bright text, neon glow effect', 'Glowing text logo'),
  logoCmd('flagtext', [], 'flag waving text, patriotic', 'Flag text logo'),
  logoCmd('lighteffects', [], 'light rays text, glowing light effect', 'Light effects logo'),
  logoCmd('lightning', [], 'lightning bolt text, electric storm', 'Lightning logo'),
  logoCmd('papercutstyle', [], 'paper cut art text, layered paper', 'Papercut style logo'),
  logoCmd('style1917', [], 'vintage 1917 old poster text', '1917 style logo'),
  logoCmd('underwatertext', [], 'underwater text, bubbles, blue ocean', 'Underwater text logo'),
  logoCmd('gaminglogo', [], 'gaming esports logo text, bold, fire', 'Gaming logo'),
  logoCmd('advancedlogo', [], 'advanced premium logo design, luxury', 'Advanced logo'),
];
