// Owner command — sudhu owner use korte parbe.
const { settings, saveSettings } = require('../lib/settings');
const { getMediaBuffer, getSender } = require('../lib/helpers');
const os = require('os');
const fs = require('fs');
const path = require('path');

function fmtUptime(s) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

module.exports = [
  {
    name: 'addowner',
    aliases: ['addown', 'setowner'],
    category: 'Owner',
    desc: 'Notun owner jog koro',
    usage: '.addowner 8801XXXXXXXXX',
    ownerOnly: true,
    async run(ctx) {
      const num = (ctx.text || '').replace(/[^0-9]/g, '');
      if (!num) return ctx.reply('❓ Ekta number dao. Jemon: .addowner 8801956501630');
      if (!settings.owners.includes(num)) { settings.owners.push(num); saveSettings(); }
      await ctx.reply(`✅ *${num}*-ke owner banano holo.`);
    },
  },
  {
    name: 'delowner',
    aliases: ['delown'],
    category: 'Owner',
    desc: 'Owner list theke sorau',
    usage: '.delowner 8801XXXXXXXXX',
    ownerOnly: true,
    async run(ctx) {
      const num = (ctx.text || '').replace(/[^0-9]/g, '');
      if (!num) return ctx.reply('❓ Ekta number dao. Jemon: .delowner 8801956501630');
      settings.owners = settings.owners.filter((n) => n !== num);
      saveSettings();
      await ctx.reply(`✅ *${num}*-ke owner list theke sorano holo.`);
    },
  },
  {
    name: 'addprem',
    aliases: ['addpremium'],
    category: 'Owner',
    desc: 'Premium user jog koro',
    usage: '.addprem 8801XXXXXXXXX',
    ownerOnly: true,
    async run(ctx) {
      const num = (ctx.text || '').replace(/[^0-9]/g, '');
      if (!num) return ctx.reply('❓ Ekta number dao. Jemon: .addprem 8801956501630');
      if (!settings.premium.includes(num)) { settings.premium.push(num); saveSettings(); }
      await ctx.reply(`✅ *${num}*-ke premium user banano holo.`);
    },
  },
  {
    name: 'delprem',
    aliases: ['delpremium'],
    category: 'Owner',
    desc: 'Premium list theke sorau',
    usage: '.delprem 8801XXXXXXXXX',
    ownerOnly: true,
    async run(ctx) {
      const num = (ctx.text || '').replace(/[^0-9]/g, '');
      if (!num) return ctx.reply('❓ Ekta number dao. Jemon: .delprem 8801956501630');
      settings.premium = settings.premium.filter((n) => n !== num);
      saveSettings();
      await ctx.reply(`✅ *${num}*-ke premium list theke sorano holo.`);
    },
  },
  {
    name: 'listprem',
    aliases: [],
    category: 'Owner',
    desc: 'Premium user-der list dekho',
    usage: '.listprem',
    ownerOnly: true,
    async run(ctx) {
      const list = settings.premium || [];
      await ctx.reply(list.length ? `⭐ *Premium User (${list.length})*\n\n${list.map((n) => '• ' + n).join('\n')}` : '❌ Kono premium user nai. .addprem diye jog koro.');
    },
  },
  {
    name: 'setppbot',
    aliases: ['setprofile'],
    category: 'Owner',
    desc: 'Bot-er profile picture bodlao (chobi reply kore)',
    usage: '.setppbot (chobi reply kore)',
    ownerOnly: true,
    async run(ctx) {
      const buf = await getMediaBuffer(ctx);
      if (!buf) return ctx.reply('❓ Ekta chobi reply kore .setppbot likho.');
      try {
        await ctx.sock.updateProfilePicture(ctx.sock.user.id, buf);
        await ctx.reply('✅ Bot-er profile picture bodle deya holo.');
      } catch (e) {
        await ctx.reply('❌ Profile picture bodlano jay nai.');
      }
    },
  },
  {
    name: 'setbio',
    aliases: ['setmood', 'autobio', 'mymood'],
    category: 'Owner',
    desc: 'Bot-er bio/status bodlao',
    usage: '.setbio Ami MR AI MD bot',
    ownerOnly: true,
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Notun bio likho. Jemon: .setbio Ami MR AI MD bot');
      try {
        await ctx.sock.updateProfileStatus(ctx.text.slice(0, 140));
        await ctx.reply(`✅ Bot-er bio bodle deya holo:\n_${ctx.text.slice(0, 140)}_`);
      } catch (e) {
        await ctx.reply('❌ Bio bodlano jay nai.');
      }
    },
  },
  {
    name: 'restart',
    aliases: [],
    category: 'Owner',
    desc: 'Bot restart dao (Railway nije abar chalu korbe)',
    usage: '.restart',
    ownerOnly: true,
    async run(ctx) {
      await ctx.reply('🔄 Bot restart hocche... 10-20 second por abar online asbe.');
      setTimeout(() => process.exit(1), 1500);
    },
  },
  {
    name: 'public',
    aliases: [],
    category: 'Owner',
    desc: 'Bot-ke public mode-e dao (sobai command use korte parbe)',
    usage: '.public',
    ownerOnly: true,
    async run(ctx) {
      settings.mode = 'public';
      saveSettings();
      await ctx.reply('🌍 Bot ekhon *PUBLIC* mode-e. Sobai command use korte parbe.');
    },
  },
  {
    name: 'self',
    aliases: ['private'],
    category: 'Owner',
    desc: 'Bot-ke self mode-e dao (sudhu owner command use korte parbe)',
    usage: '.self',
    ownerOnly: true,
    async run(ctx) {
      settings.mode = 'self';
      saveSettings();
      await ctx.reply('🔒 Bot ekhon *SELF* mode-e. Sudhu owner command use korte parbe.');
    },
  },
  {
    name: 'autoread',
    aliases: [],
    category: 'Owner',
    desc: 'Auto-read on/off koro',
    usage: '.autoread on | .autoread off',
    ownerOnly: true,
    async run(ctx) {
      const arg = (ctx.text || '').trim().toLowerCase();
      if (arg === 'on') { settings.autoread = true; saveSettings(); await ctx.reply('👀 Auto-read *ON* kora holo.'); }
      else if (arg === 'off') { settings.autoread = false; saveSettings(); await ctx.reply('👀 Auto-read *OFF* kora holo.'); }
      else await ctx.reply(`👀 Auto-read ekhon: *${settings.autoread ? 'ON' : 'OFF'}*`);
    },
  },
  {
    name: 'setprefix',
    aliases: ['prefix'],
    category: 'Owner',
    desc: 'Command-er prefix bodlao',
    usage: '.setprefix !',
    ownerOnly: true,
    async run(ctx) {
      const p = (ctx.text || '').trim().split(/\s+/)[0];
      if (!p || p.length > 2) return ctx.reply('❓ Ekta choto chinno dao. Jemon: .setprefix !');
      settings.prefix = p;
      saveSettings();
      await ctx.reply(`✅ Prefix bodle *${p}* kora holo. Ekhon command likho ${p}menu evabe.`);
    },
  },
  {
    name: 'afk',
    aliases: [],
    category: 'Owner',
    desc: 'AFK mode on koro (keu tag korle bot janabe)',
    usage: '.afk ghumacchi',
    async run(ctx) {
      const reason = (ctx.text || '').trim() || 'kono karon dey nai';
      settings.afk[ctx.senderNumber] = { reason, since: Date.now() };
      saveSettings();
      await ctx.reply(`💤 Tumi AFK hoye gecho. Karon: *${reason}*\nTumi message likhlei AFK off hoye jabe.`);
    },
  },
  {
    name: 'block',
    aliases: ['ban'],
    category: 'Owner',
    desc: 'Kauke block koro',
    usage: '.block @user',
    ownerOnly: true,
    async run(ctx) {
      const target = (ctx.mentions && ctx.mentions[0]) || (ctx.text ? ctx.text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : '');
      if (!target || target === '@s.whatsapp.net') return ctx.reply('❓ Kauke block korte mention koro ba number dao. Jemon: .block @user');
      try {
        await ctx.sock.updateBlockStatus(target, 'block');
        await ctx.reply(`🚫 *${target.split('@')[0]}*-ke block kora holo.`);
      } catch (e) {
        await ctx.reply('❌ Block kora jay nai.');
      }
    },
  },
  {
    name: 'unblock',
    aliases: ['unban'],
    category: 'Owner',
    desc: 'Kauke unblock koro',
    usage: '.unblock @user',
    ownerOnly: true,
    async run(ctx) {
      const target = (ctx.mentions && ctx.mentions[0]) || (ctx.text ? ctx.text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : '');
      if (!target || target === '@s.whatsapp.net') return ctx.reply('❓ Kauke unblock korte mention koro ba number dao.');
      try {
        await ctx.sock.updateBlockStatus(target, 'unblock');
        await ctx.reply(`✅ *${target.split('@')[0]}*-ke unblock kora holo.`);
      } catch (e) {
        await ctx.reply('❌ Unblock kora jay nai.');
      }
    },
  },
  {
    name: 'debug',
    aliases: [],
    category: 'Owner',
    desc: 'Bot-er debug info dekho',
    usage: '.debug',
    ownerOnly: true,
    async run(ctx) {
      const { getAllCommands } = require('../lib/loader');
      let total = 0;
      try { total = getAllCommands().size; } catch (e) {}
      await ctx.reply(`🛠️ *DEBUG*\n\n🤖 Bot: ${ctx.config.botName}\n📦 Baileys: ${ctx.baileysVersion || 'mr-rean-baileys'}\n🟢 Node: ${process.version}\n⏱️ Uptime: ${fmtUptime(process.uptime())}\n💾 RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB\n📜 Command: ${total}\n🔧 Mode: ${settings.mode} • Prefix: ${settings.prefix || ctx.config.prefix}\n👀 Auto-read: ${settings.autoread ? 'ON' : 'OFF'}`);
    },
  },
  {
    name: 'test',
    aliases: ['testadmin', 'checkstatus'],
    category: 'Owner',
    desc: 'Bot thik ache kina test koro',
    usage: '.test',
    async run(ctx) {
      await ctx.reply(`✅ *Bot thik ache!*\n\n🤖 ${ctx.config.botName}\n⏱️ Uptime: ${fmtUptime(process.uptime())}\n📶 Ping: thik ache`);
    },
  },
  {
    name: 'cleartmp',
    aliases: [],
    category: 'Owner',
    desc: 'Bot-er temp file muche dao',
    usage: '.cleartmp',
    ownerOnly: true,
    async run(ctx) {
      let n = 0;
      try {
        for (const f of fs.readdirSync(os.tmpdir())) {
          if (f.startsWith('mraimd-')) { fs.unlinkSync(path.join(os.tmpdir(), f)); n++; }
        }
      } catch (e) {}
      await ctx.reply(`🧹 Temp file clean kora holo. *${n}* ta file mucha hoyeche.`);
    },
  },
  {
    name: 'poststatus',
    aliases: [],
    category: 'Owner',
    desc: 'WhatsApp status-e post dao',
    usage: '.poststatus Ajke onek valo din!',
    ownerOnly: true,
    async run(ctx) {
      if (!ctx.text && !ctx.msg.message.imageMessage && !ctx.msg.message.videoMessage) {
        return ctx.reply('❓ Status-e ki dibe likho. Jemon: .poststatus Ajke onek valo din!');
      }
      try {
        const buf = await getMediaBuffer(ctx);
        if (buf) {
          await ctx.sock.sendMessage('status@broadcast', { image: buf, caption: ctx.text || '' });
        } else {
          await ctx.sock.sendMessage('status@broadcast', { text: ctx.text });
        }
        await ctx.reply('✅ Status-e post kora holo.');
      } catch (e) {
        await ctx.reply('❌ Status-e post kora jay nai.');
      }
    },
  },
  {
    name: 'react',
    aliases: ['freact'],
    category: 'Owner',
    desc: 'Reply kora message-e react dao',
    usage: '.react ❤️ (message reply kore)',
    async run(ctx) {
      const em = (ctx.text || '').trim().split(/\s+/)[0];
      if (!em) return ctx.reply('❓ Ekta emoji dao. Jemon: .react ❤️');
      const qKey = ctx.msg.message && ctx.msg.message.extendedTextMessage && ctx.msg.message.extendedTextMessage.contextInfo && ctx.msg.message.extendedTextMessage.contextInfo.stanzaId;
      const qJid = ctx.msg.message && ctx.msg.message.extendedTextMessage && ctx.msg.message.extendedTextMessage.contextInfo && ctx.msg.message.extendedTextMessage.contextInfo.participant;
      if (!qKey) return ctx.reply('❓ Je message-e react dibe, seta reply kore .react likho.');
      try {
        await ctx.sock.sendMessage(ctx.jid, { react: { text: em, key: { remoteJid: ctx.jid, fromMe: qJid === ctx.sock.user.id, id: qKey, participant: qJid } } });
      } catch (e) {
        await ctx.reply('❌ React deya jay nai.');
      }
    },
  },
  {
    name: 'contact',
    aliases: [],
    category: 'Tools',
    desc: 'Kauke contact card pathao',
    usage: '.contact 8801XXXXXXXXX',
    async run(ctx) {
      const num = (ctx.text || '').replace(/[^0-9]/g, '');
      if (!num) return ctx.reply('❓ Ekta number dao. Jemon: .contact 8801956501630');
      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${num}\nTEL;type=CELL;type=VOICE;waid=${num}:+${num}\nEND:VCARD`;
      await ctx.sock.sendMessage(ctx.jid, { contacts: { displayName: num, contacts: [{ vcard }] } }, { quoted: ctx.msg });
    },
  },
  {
    name: 'runtime',
    aliases: ['uptime'],
    category: 'Owner',
    desc: 'Bot kotokkhon dhore cholche dekho',
    usage: '.runtime',
    async run(ctx) {
      await ctx.reply(`⏱️ *Bot Runtime*\n\n🤖 ${ctx.config.botName} ek tana *${fmtUptime(process.uptime())}* dhore cholche.\n💾 RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`);
    },
  },
  {
    name: 'script',
    aliases: ['repo', 'sc'],
    category: 'Owner',
    desc: 'Bot-er source code-er link dao',
    usage: '.script',
    async run(ctx) {
      await ctx.reply(`📦 *${ctx.config.botName} — Source Code*\n\n🔗 https://github.com/mr-rean-x/MR-AI-MD\n\nNijer Baileys fork:\n🔗 https://github.com/mr-rean-x/Baileys`);
    },
  },
  {
    name: 'whoami',
    aliases: [],
    category: 'Tools',
    desc: 'Tomar nijer info dekho',
    usage: '.whoami',
    async run(ctx) {
      await ctx.reply(`🪪 *Tumi*\n\n📱 Number: +${ctx.senderNumber}\n👤 Naam: ${ctx.pushName || '-'}\n${ctx.isGroup ? '👥 Eta ekta group\n' : '💬 Eta DM\n'}${ctx.isOwner ? '👑 Tumi bot-er owner' : ''}`);
    },
  },
  {
    name: 'read',
    aliases: [],
    category: 'Tools',
    desc: 'Ei chat-er message read kore dao',
    usage: '.read',
    async run(ctx) {
      try {
        await ctx.sock.readMessages([ctx.msg.key]);
        await ctx.reply('👀 Message read kore deya holo.');
      } catch (e) {
        await ctx.reply('❌ Read kora jay nai.');
      }
    },
  },
  {
    name: 'jid',
    aliases: ['groupjid'],
    category: 'Tools',
    desc: 'Ei chat-er JID dekho',
    usage: '.jid',
    async run(ctx) {
      await ctx.reply(`🆔 Chat JID:\n${ctx.jid}`);
    },
  },
];
