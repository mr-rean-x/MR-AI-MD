// Group command — group manage kora.
// Admin command gulo sudhu group admin-ra use korte parbe.
const { settings, saveSettings } = require('../lib/settings');
const { getMediaBuffer, getSender } = require('../lib/helpers');

function needGroup(ctx) {
  if (!ctx.isGroup) { ctx.reply('❌ Ei command sudhu group-e kaj kore.'); return false; }
  return true;
}

async function needAdmin(ctx) {
  if (!needGroup(ctx)) return false;
  if (!ctx.isAdmin) { await ctx.reply('❌ Sudhu group admin-ra ei command use korte parbe.'); return false; }
  return true;
}

async function needBotAdmin(ctx) {
  if (!ctx.isBotAdmin) { await ctx.reply('❌ Bot-ke group admin banate hobe ei command-er jonno.'); return false; }
  return true;
}

module.exports = [
  {
    name: 'hidetag',
    aliases: ['htag'],
    category: 'Group',
    desc: 'Sobai-ke tag koro (lekha dekha jabe na)',
    usage: '.hidetag Hello sobai',
    adminOnly: true,
    async run(ctx) {
      if (!await needAdmin(ctx)) return;
      const meta = await ctx.sock.groupMetadata(ctx.jid);
      const mentions = meta.participants.map((p) => p.id);
      const text = (ctx.text || '').trim() || 'Hello sobai!';
      await ctx.sock.sendMessage(ctx.jid, { text, mentions }, { quoted: ctx.msg });
    },
  },
  {
    name: 'setname',
    aliases: [],
    category: 'Group',
    desc: 'Group-er naam bodlao',
    usage: '.setname Notun Naam',
    adminOnly: true,
    async run(ctx) {
      if (!await needAdmin(ctx)) return;
      if (!ctx.text) return ctx.reply('❓ Notun naam likho. Jemon: .setname TEEM HUNTERS');
      await ctx.sock.groupUpdateSubject(ctx.jid, ctx.text.slice(0, 100));
      await ctx.reply(`✅ Group-er naam bodle *${ctx.text.slice(0, 100)}* kora holo.`);
    },
  },
  {
    name: 'setdesc',
    aliases: [],
    category: 'Group',
    desc: 'Group-er description bodlao',
    usage: '.setdesc Amader group',
    adminOnly: true,
    async run(ctx) {
      if (!await needAdmin(ctx)) return;
      if (!ctx.text) return ctx.reply('❓ Notun description likho. Jemon: .setdesc Amader group');
      await ctx.sock.groupUpdateDescription(ctx.jid, ctx.text.slice(0, 500));
      await ctx.reply('✅ Group-er description bodle deya holo.');
    },
  },
  {
    name: 'setppgc',
    aliases: [],
    category: 'Group',
    desc: 'Group-er chobi bodlao (chobi reply kore)',
    usage: '.setppgc (chobi reply kore)',
    adminOnly: true,
    async run(ctx) {
      if (!await needAdmin(ctx)) return;
      const buf = await getMediaBuffer(ctx);
      if (!buf) return ctx.reply('❓ Ekta chobi reply kore .setppgc likho.');
      try {
        await ctx.sock.updateProfilePicture(ctx.jid, buf);
        await ctx.reply('✅ Group-er chobi bodle deya holo.');
      } catch (e) {
        await ctx.reply('❌ Group-er chobi bodlano jay nai.');
      }
    },
  },
  {
    name: 'linkgc',
    aliases: ['linkgroup'],
    category: 'Group',
    desc: 'Group-er invite link dao',
    usage: '.linkgc',
    adminOnly: true,
    async run(ctx) {
      if (!await needAdmin(ctx)) return;
      try {
        const code = await ctx.sock.groupInviteCode(ctx.jid);
        await ctx.reply(`🔗 Group invite link:\nhttps://chat.whatsapp.com/${code}`);
      } catch (e) {
        await ctx.reply('❌ Invite link ante pari nai.');
      }
    },
  },
  {
    name: 'resetlink',
    aliases: ['resetlinkgc'],
    category: 'Group',
    desc: 'Group-er invite link bodle notun link dao',
    usage: '.resetlink',
    adminOnly: true,
    async run(ctx) {
      if (!await needAdmin(ctx)) return;
      try {
        const code = await ctx.sock.groupRevokeInvite(ctx.jid);
        await ctx.reply(`🔗 Notun invite link:\nhttps://chat.whatsapp.com/${code}`);
      } catch (e) {
        await ctx.reply('❌ Link reset kora jay nai.');
      }
    },
  },
  {
    name: 'listadmin',
    aliases: ['admins'],
    category: 'Group',
    desc: 'Group-er admin-der list dekho',
    usage: '.listadmin',
    async run(ctx) {
      if (!needGroup(ctx)) return;
      const meta = await ctx.sock.groupMetadata(ctx.jid);
      const admins = meta.participants.filter((p) => p.admin);
      if (!admins.length) return ctx.reply('❌ Ei group-e kono admin nai.');
      const mentions = admins.map((a) => a.id);
      await ctx.sock.sendMessage(ctx.jid, { text: `👑 *Group Admin (${admins.length})*\n\n${admins.map((a) => '• @' + a.id.split('@')[0]).join('\n')}`, mentions }, { quoted: ctx.msg });
    },
  },
  {
    name: 'close',
    aliases: ['mute'],
    category: 'Group',
    desc: 'Group bondho koro (sudhu admin likhte parbe)',
    usage: '.close',
    adminOnly: true,
    async run(ctx) {
      if (!await needAdmin(ctx)) return;
      await ctx.sock.groupSettingUpdate(ctx.jid, 'announcement');
      await ctx.reply('🔒 Group bondho kora holo. Ekhon sudhu admin-ra likhte parbe.');
    },
  },
  {
    name: 'open',
    aliases: ['unmute'],
    category: 'Group',
    desc: 'Group khulo (sobai likhte parbe)',
    usage: '.open',
    adminOnly: true,
    async run(ctx) {
      if (!await needAdmin(ctx)) return;
      await ctx.sock.groupSettingUpdate(ctx.jid, 'not_announcement');
      await ctx.reply('🔓 Group khule deya holo. Sobai likhte parbe.');
    },
  },
  {
    name: 'closetime',
    aliases: ['closegroup'],
    category: 'Group',
    desc: 'Group bondho koro, N minute por nije khulbe',
    usage: '.closetime 10',
    adminOnly: true,
    async run(ctx) {
      if (!await needAdmin(ctx)) return;
      const mins = parseInt((ctx.text || '').trim(), 10);
      if (!mins || mins < 1 || mins > 1440) return ctx.reply('❓ Koy minute likho (1-1440). Jemon: .closetime 10');
      await ctx.sock.groupSettingUpdate(ctx.jid, 'announcement');
      await ctx.reply(`🔒 Group ${mins} minute-er jonno bondho kora holo.`);
      setTimeout(async () => {
        try { await ctx.sock.groupSettingUpdate(ctx.jid, 'not_announcement'); } catch (e) {}
      }, mins * 60 * 1000);
    },
  },
  {
    name: 'opentime',
    aliases: ['opengroup'],
    category: 'Group',
    desc: 'Group khulo, N minute por nije bondho hobe',
    usage: '.opentime 10',
    adminOnly: true,
    async run(ctx) {
      if (!await needAdmin(ctx)) return;
      const mins = parseInt((ctx.text || '').trim(), 10);
      if (!mins || mins < 1 || mins > 1440) return ctx.reply('❓ Koy minute likho (1-1440). Jemon: .opentime 10');
      await ctx.sock.groupSettingUpdate(ctx.jid, 'not_announcement');
      await ctx.reply(`🔓 Group ${mins} minute-er jonno khola holo.`);
      setTimeout(async () => {
        try { await ctx.sock.groupSettingUpdate(ctx.jid, 'announcement'); } catch (e) {}
      }, mins * 60 * 1000);
    },
  },
  {
    name: 'leave',
    aliases: [],
    category: 'Group',
    desc: 'Bot group theke ber hoye jabe',
    usage: '.leave',
    adminOnly: true,
    async run(ctx) {
      if (!await needAdmin(ctx)) return;
      await ctx.reply('👋 Ami group theke ber hocchi. Bye!');
      await ctx.sock.groupLeave(ctx.jid);
    },
  },
  {
    name: 'creategroup',
    aliases: ['creategc'],
    category: 'Group',
    desc: 'Notun group banao',
    usage: '.creategroup Naam @user @user',
    ownerOnly: true,
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Group-er naam ar member dao. Jemon: .creategroup Amar Group @8801XXXXXXXXX');
      const name = ctx.text.split(/\s+/).filter((w) => !w.startsWith('@')).join(' ');
      const members = (ctx.mentions || []).filter((m) => m.endsWith('@s.whatsapp.net'));
      try {
        const g = await ctx.sock.groupCreate(name || 'MR AI Group', members);
        await ctx.reply(`✅ Group banano holo: *${name || 'MR AI Group'}*\nID: ${g.id}`);
      } catch (e) {
        await ctx.reply('❌ Group banano jay nai. Member-der number thik ache kina dekho.');
      }
    },
  },
  {
    name: 'join',
    aliases: [],
    category: 'Group',
    desc: 'Invite link diye group-e join koro',
    usage: '.join https://chat.whatsapp.com/xxxx',
    ownerOnly: true,
    async run(ctx) {
      const link = (ctx.text || '').trim().split(/\s+/)[0];
      const code = link && link.split('chat.whatsapp.com/')[1];
      if (!code) return ctx.reply('❓ Ekta group invite link dao. Jemon: .join https://chat.whatsapp.com/xxxx');
      try {
        const id = await ctx.sock.groupAcceptInvite(code.trim());
        await ctx.reply(`✅ Group-e join korsi! Group ID: ${id}`);
      } catch (e) {
        await ctx.reply('❌ Join kora jay nai. Link-ta thik ache kina dekho.');
      }
    },
  },
  {
    name: 'antilink',
    aliases: [],
    category: 'Group',
    desc: 'Group-e link pathano bondho/kholo koro',
    usage: '.antilink on | .antilink off',
    adminOnly: true,
    async run(ctx) {
      if (!await needAdmin(ctx)) return;
      const arg = (ctx.text || '').trim().toLowerCase();
      if (arg === 'on') {
        settings.antilink[ctx.jid] = true;
        saveSettings();
        await ctx.reply('🔗 Antilink *ON* — ekhon keu link pathale bot seta delete korbe (admin chara).');
      } else if (arg === 'off') {
        delete settings.antilink[ctx.jid];
        saveSettings();
        await ctx.reply('🔗 Antilink *OFF* kora holo.');
      } else {
        await ctx.reply(`🔗 Antilink ekhon: *${settings.antilink[ctx.jid] ? 'ON' : 'OFF'}*\nChalu korte: .antilink on\nBondho korte: .antilink off`);
      }
    },
  },
  {
    name: 'welcome',
    aliases: [],
    category: 'Group',
    desc: 'Notun member-ke welcome message on/off koro',
    usage: '.welcome on | .welcome off',
    adminOnly: true,
    async run(ctx) {
      if (!await needAdmin(ctx)) return;
      const arg = (ctx.text || '').trim().toLowerCase();
      if (arg === 'on') {
        settings.welcome[ctx.jid] = true;
        saveSettings();
        await ctx.reply('👋 Welcome message *ON* kora holo.');
      } else if (arg === 'off') {
        delete settings.welcome[ctx.jid];
        saveSettings();
        await ctx.reply('👋 Welcome message *OFF* kora holo.');
      } else {
        await ctx.reply(`👋 Welcome ekhon: *${settings.welcome[ctx.jid] ? 'ON' : 'OFF'}*`);
      }
    },
  },
  {
    name: 'goodbye',
    aliases: [],
    category: 'Group',
    desc: 'Member ber hole goodbye message on/off koro',
    usage: '.goodbye on | .goodbye off',
    adminOnly: true,
    async run(ctx) {
      if (!await needAdmin(ctx)) return;
      const arg = (ctx.text || '').trim().toLowerCase();
      if (arg === 'on') {
        settings.goodbye[ctx.jid] = true;
        saveSettings();
        await ctx.reply('👋 Goodbye message *ON* kora holo.');
      } else if (arg === 'off') {
        delete settings.goodbye[ctx.jid];
        saveSettings();
        await ctx.reply('👋 Goodbye message *OFF* kora holo.');
      } else {
        await ctx.reply(`👋 Goodbye ekhon: *${settings.goodbye[ctx.jid] ? 'ON' : 'OFF'}*`);
      }
    },
  },
  {
    name: 'warn',
    aliases: [],
    category: 'Group',
    desc: 'Member-ke warn dao (3 warn-e kick)',
    usage: '.warn @user',
    adminOnly: true,
    async run(ctx) {
      if (!await needAdmin(ctx)) return;
      if (!await needBotAdmin(ctx)) return;
      const target = ctx.mentions && ctx.mentions[0];
      if (!target) return ctx.reply('❓ Kauke warn dite mention koro. Jemon: .warn @user');
      const num = target.split('@')[0];
      if (!settings.warns[ctx.jid]) settings.warns[ctx.jid] = {};
      settings.warns[ctx.jid][num] = (settings.warns[ctx.jid][num] || 0) + 1;
      saveSettings();
      const count = settings.warns[ctx.jid][num];
      if (count >= 3) {
        delete settings.warns[ctx.jid][num];
        saveSettings();
        await ctx.reply(`⚠️ @${num} — 3 ta warn hoye geche, kick kora hocche!`);
        try { await ctx.sock.groupParticipantsUpdate(ctx.jid, [target], 'remove'); } catch (e) {}
      } else {
        await ctx.reply(`⚠️ @${num}-ke warn deya holo. Warn: *${count}/3*`);
      }
    },
  },
  {
    name: 'resetwarn',
    aliases: ['delwarn'],
    category: 'Group',
    desc: 'Member-er warn muche dao',
    usage: '.resetwarn @user',
    adminOnly: true,
    async run(ctx) {
      if (!await needAdmin(ctx)) return;
      const target = ctx.mentions && ctx.mentions[0];
      if (!target) return ctx.reply('❓ Kaar warn muchbe mention koro. Jemon: .resetwarn @user');
      const num = target.split('@')[0];
      if (settings.warns[ctx.jid]) delete settings.warns[ctx.jid][num];
      saveSettings();
      await ctx.reply(`✅ @${num}-er warn muche deya holo.`);
    },
  },
  {
    name: 'poll',
    aliases: [],
    category: 'Group',
    desc: 'Group-e poll banao',
    usage: '.poll Proshno? | Option 1 | Option 2',
    adminOnly: true,
    async run(ctx) {
      if (!await needAdmin(ctx)) return;
      const parts = (ctx.text || '').split('|').map((s) => s.trim()).filter(Boolean);
      if (parts.length < 3) return ctx.reply('❓ Evabe likho: .poll Proshno? | Option 1 | Option 2');
      const [q, ...opts] = parts;
      await ctx.sock.sendMessage(ctx.jid, { poll: { name: q, values: opts.slice(0, 12), selectableCount: 1 } }, { quoted: ctx.msg });
    },
  },
  {
    name: 'delete',
    aliases: ['del'],
    category: 'Group',
    desc: 'Reply kora message-ta delete koro',
    usage: '.delete (message reply kore)',
    adminOnly: true,
    async run(ctx) {
      if (!await needAdmin(ctx)) return;
      const q = ctx.msg.message && ctx.msg.message.extendedTextMessage && ctx.msg.message.extendedTextMessage.contextInfo && ctx.msg.message.extendedTextMessage.contextInfo.quotedMessage;
      const qKey = ctx.msg.message && ctx.msg.message.extendedTextMessage && ctx.msg.message.extendedTextMessage.contextInfo && ctx.msg.message.extendedTextMessage.contextInfo.stanzaId;
      const qJid = ctx.msg.message && ctx.msg.message.extendedTextMessage && ctx.msg.message.extendedTextMessage.contextInfo && ctx.msg.message.extendedTextMessage.contextInfo.participant;
      if (!q || !qKey) return ctx.reply('❓ Je message delete korbe, seta reply kore .delete likho.');
      try {
        await ctx.sock.sendMessage(ctx.jid, { delete: { remoteJid: ctx.jid, fromMe: qJid === ctx.sock.user.id, id: qKey, participant: qJid } });
      } catch (e) {
        await ctx.reply('❌ Message delete kora jay nai. Bot-ke admin banate hobe.');
      }
    },
  },
  {
    name: 'pin',
    aliases: [],
    category: 'Group',
    desc: 'Ei chat-ta pin koro (bot-er list-e)',
    usage: '.pin',
    async run(ctx) {
      try {
        await ctx.sock.chatModify({ pin: true }, ctx.jid);
        await ctx.reply('📌 Chat pin kora holo.');
      } catch (e) {
        await ctx.reply('❌ Pin kora jay nai.');
      }
    },
  },
  {
    name: 'getpp',
    aliases: [],
    category: 'Tools',
    desc: 'Karor profile picture dekho',
    usage: '.getpp @user',
    async run(ctx) {
      const target = (ctx.mentions && ctx.mentions[0]) || ctx.sender;
      try {
        const url = await ctx.sock.profilePictureUrl(target, 'image');
        await ctx.sock.sendMessage(ctx.jid, { image: { url }, caption: `🖼️ @${target.split('@')[0]}-er profile picture` }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Profile picture pai nai. Hoyto user-er DP nai.');
      }
    },
  },
];
