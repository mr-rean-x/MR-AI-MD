// General command — menu, ping, alive, owner, info.
// Sob text ekhanei lekha; kono onno bot-er menu copy kora hoy nai.
const { getAllCommands } = require('../lib/loader');

function uptimeText(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

module.exports = [
  {
    name: 'menu',
    aliases: ['help', 'commands'],
    category: 'General',
    desc: 'Sob command-er list dekhai',
    usage: '.menu',
    async run(ctx) {
      const { config, prefix, reply } = ctx;
      const all = getAllCommands();
      const groups = {};
      for (const c of all) {
        const cat = c.category || 'Other';
        groups[cat] = groups[cat] || [];
        groups[cat].push(c);
      }
      let out = `╭─── *${config.botName}* ───╮\n`;
      out += `│ Owner: ${config.ownerName}\n`;
      out += `│ Prefix: ${prefix}\n`;
      out += `│ Commands: ${all.length} ta\n`;
      out += `╰─────────────────╯\n`;
      for (const cat of Object.keys(groups)) {
        out += `\n*${cat}*\n`;
        for (const c of groups[cat]) {
          out += `  ${prefix}${c.name} — ${c.desc || ''}\n`;
        }
      }
      out += `\nJemon: ${prefix}ping, ${prefix}sticker, ${prefix}ai hi`;
      await reply(out);
    },
  },
  {
    name: 'ping',
    aliases: ['speed'],
    category: 'General',
    desc: 'Bot kotota fast dekhai',
    usage: '.ping',
    async run(ctx) {
      const t0 = Date.now();
      await ctx.reply('Pinging...');
      const ms = Date.now() - t0;
      await ctx.reply(`🏓 Pong! Reply time: ${ms}ms\nBot online ache ✅`);
    },
  },
  {
    name: 'alive',
    aliases: ['online'],
    category: 'General',
    desc: 'Bot beche ache kina janai',
    usage: '.alive',
    async run(ctx) {
      const s = Math.floor(process.uptime());
      await ctx.reply(`🤖 *${ctx.config.botName}* online ache!\nUptime: ${uptimeText(s * 1000)}\nPrefix: ${ctx.prefix} • ${ctx.prefix}menu likhe sob command dekho.`);
    },
  },
  {
    name: 'owner',
    aliases: ['creator'],
    category: 'General',
    desc: 'Bot-er owner-er number dey',
    usage: '.owner',
    async run(ctx) {
      const n = ctx.config.ownerNumber;
      await ctx.reply(n
        ? `👑 Owner: ${ctx.config.ownerName}\nNumber: wa.me/${n}`
        : `👑 Owner: ${ctx.config.ownerName}\n(OWNER_NUMBER set kora hoy nai — Railway Variables-e bosao.)`);
    },
  },
  {
    name: 'info',
    aliases: ['about'],
    category: 'General',
    desc: 'Bot-er bepare janai',
    usage: '.info',
    async run(ctx) {
      await ctx.reply(
        `🤖 *${ctx.config.botName}*\n` +
        `Version: 1.0.0\n` +
        `Library: Baileys (WhatsApp Web API)\n` +
        `Owner: ${ctx.config.ownerName}\n` +
        `Commands: ${getAllCommands().length} ta\n` +
        `Prefix: ${ctx.prefix}\n\n` +
        `Eta ekdom nijer hate lekha bot — kono ready-made bot-er code use kora hoy nai.`
      );
    },
  },
];
