// Group command — tagall, kick, add, promote, demote, groupinfo.
// Sudhu group admin (ba owner) use korte parbe. Bot-keo group-e admin hote hobe.
const { isGroupAdmin } = require('../lib/helpers');

function cleanNumber(raw) {
  return String(raw || '').replace(/[^0-9]/g, '');
}

function targetFrom(ctx) {
  // 1) reply kora message-er lok, 2) likha number, 3) tag kora lok
  const m = ctx.msg.message || {};
  const ctxInfo = m.extendedTextMessage && m.extendedTextMessage.contextInfo;
  if (ctxInfo && ctxInfo.participant) return cleanNumber(ctxInfo.participant);
  if (ctxInfo && ctxInfo.mentionedJid && ctxInfo.mentionedJid[0]) return cleanNumber(ctxInfo.mentionedJid[0]);
  if (ctx.args[0]) return cleanNumber(ctx.args[0]);
  return null;
}

module.exports = [
  {
    name: 'tagall',
    aliases: ['tag', 'everyone'],
    category: 'Group',
    desc: 'Group-er sobaike tag kore',
    usage: '.tagall (ba .tagall hello sobai)',
    groupOnly: true,
    adminOnly: true,
    async run(ctx) {
      const meta = await ctx.sock.groupMetadata(ctx.jid);
      const members = meta.participants.map((p) => p.id);
      const note = ctx.text ? `\n${ctx.text}` : '';
      await ctx.sock.sendMessage(ctx.jid, {
        text: `📣 *${meta.subject} — sobaike tag kora hoise*${note}\n\n${members.map((id) => '@' + id.replace(/@.*$/, '')).join(' ')}`,
        mentions: members,
      }, { quoted: ctx.msg });
    },
  },
  {
    name: 'kick',
    aliases: ['remove'],
    category: 'Group',
    desc: 'Group theke ekjon-ke ber kore dey',
    usage: '.kick (reply diye ba number likhe)',
    groupOnly: true,
    adminOnly: true,
    async run(ctx) {
      const target = targetFrom(ctx);
      if (!target) return ctx.reply('❌ Kaake kick korbe? Tar message-e reply diye .kick likho, ba number dao: .kick 8801XXXXXXXXX');
      if (target === ctx.config.ownerNumber) return ctx.reply('❌ Owner-ke kick kora jabe na.');
      try {
        await ctx.sock.groupParticipantsUpdate(ctx.jid, [`${target}@s.whatsapp.net`], 'remove');
        await ctx.reply(`✅ ${target}-ke group theke ber kore deya hoise.`);
      } catch (e) {
        await ctx.reply('❌ Kick kora jay nai — bot-ta group-e admin kina check koro.');
      }
    },
  },
  {
    name: 'add',
    aliases: ['invite'],
    category: 'Group',
    desc: 'Group-e ekjon-ke add kore',
    usage: '.add 8801XXXXXXXXX',
    groupOnly: true,
    adminOnly: true,
    async run(ctx) {
      const target = targetFrom(ctx);
      if (!target) return ctx.reply('❌ Number dao: .add 8801XXXXXXXXX');
      try {
        const r = await ctx.sock.groupParticipantsUpdate(ctx.jid, [`${target}@s.whatsapp.net`], 'add');
        const st = r && r[0] && r[0].status;
        if (st === '200') await ctx.reply(`✅ ${target}-ke group-e add kora hoise.`);
        else await ctx.reply(`⚠️ Add kora jay nai (status: ${st}). Hoito tar privacy setting add korte dicche na — invite link pathate hobe.`);
      } catch (e) {
        await ctx.reply('❌ Add kora jay nai — bot-ta group-e admin kina check koro.');
      }
    },
  },
  {
    name: 'promote',
    aliases: ['makeadmin'],
    category: 'Group',
    desc: 'Ekjon-ke group admin banai',
    usage: '.promote (reply diye ba number likhe)',
    groupOnly: true,
    adminOnly: true,
    async run(ctx) {
      const target = targetFrom(ctx);
      if (!target) return ctx.reply('❌ Kaake admin banabe? Reply diye .promote likho, ba number dao.');
      try {
        await ctx.sock.groupParticipantsUpdate(ctx.jid, [`${target}@s.whatsapp.net`], 'promote');
        await ctx.reply(`✅ ${target} ekhon group admin. 👑`);
      } catch (e) {
        await ctx.reply('❌ Promote kora jay nai — bot-ta group-e admin kina check koro.');
      }
    },
  },
  {
    name: 'demote',
    aliases: ['removeadmin'],
    category: 'Group',
    desc: 'Ekjon-er admin pod kede ney',
    usage: '.demote (reply diye ba number likhe)',
    groupOnly: true,
    adminOnly: true,
    async run(ctx) {
      const target = targetFrom(ctx);
      if (!target) return ctx.reply('❌ Kaar admin pod kete nibe? Reply diye .demote likho, ba number dao.');
      try {
        await ctx.sock.groupParticipantsUpdate(ctx.jid, [`${target}@s.whatsapp.net`], 'demote');
        await ctx.reply(`✅ ${target}-er admin pod kete neya hoise.`);
      } catch (e) {
        await ctx.reply('❌ Demote kora jay nai — bot-ta group-e admin kina check koro.');
      }
    },
  },
  {
    name: 'groupinfo',
    aliases: ['ginfo'],
    category: 'Group',
    desc: 'Group-er bepare janai',
    usage: '.groupinfo',
    groupOnly: true,
    async run(ctx) {
      const meta = await ctx.sock.groupMetadata(ctx.jid);
      const admins = meta.participants.filter((p) => p.admin).length;
      await ctx.reply(
        `👥 *${meta.subject}*\n` +
        `ID: ${meta.id}\n` +
        `Member: ${meta.participants.length} jon\n` +
        `Admin: ${admins} jon\n` +
        `Banano hoise: ${meta.creation ? new Date(meta.creation * 1000).toLocaleDateString() : 'jana jay nai'}\n` +
        `Bio: ${meta.desc || '—'}`
      );
    },
  },
];
