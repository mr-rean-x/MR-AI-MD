// MR AI MD — main file.
// Nijer hate lekha Baileys bot. Kono onno bot-er code copy kora hoy nai.
// Kaj: WhatsApp-e connect hoy, pairing code / QR dey, command chalai,
// ar Railway-r jonno ekta choto status website chalai (PORT-e).
const fs = require('fs');
const path = require('path');
const express = require('express');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  MR_REAN_BAILEYS_VERSION,
} = require('mr-rean-baileys');
const config = require('./config');
const { loadCommands, getAllCommands } = require('./lib/loader');
const { getSender, isOwnerNumber } = require('./lib/helpers');
const { settings, saveSettings } = require('./lib/settings');

// Nijer Baileys fork-er version (mr-rean-x/Baileys)
console.log(`[MR AI MD] Baileys: MR REAN custom v${MR_REAN_BAILEYS_VERSION || '6.7.24-mr.1'}`);

function effectivePrefix() {
  return settings.prefix || config.prefix;
}

function isOwner(sender, senderNumber) {
  return isOwnerNumber(sender, config.ownerNumber)
    || (settings.owners || []).includes(senderNumber);
}

const startedAt = Date.now();
const commands = loadCommands(path.join(__dirname, 'commands'));
const totalCommands = getAllCommands().length;
console.log(`[MR AI MD] ${totalCommands} ta command load hoise.`);

// Pairing code web page-e dekhano-r jonno
let pairState = { code: null, number: null };
let connState = 'starting';

function uptimeText() {
  const s = Math.floor((Date.now() - startedAt) / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

// ---- choto status website (Railway PORT-e chole) ----
const app = express();
app.get('/health', (req, res) => {
  res.json({ ok: true, bot: config.botName, status: connState, uptime: uptimeText(), commands: totalCommands });
});
app.get('/', (req, res) => {
  const codeHtml = pairState.code
    ? `<p style="font-size:28px;letter-spacing:6px;font-weight:bold;">${pairState.code}</p>
       <p>WhatsApp khule: <b>Linked devices → Link a device → Link with phone number</b> → ei code-ta bosao.<br>Number: ${pairState.number}</p>`
    : (connState === 'open'
      ? '<p style="color:#16a34a;font-weight:bold;">✅ Bot connected — WhatsApp-e online ache.</p>'
      : '<p>Bot connect hocche... ektu wait koro, pairing code ekhanei asbe.</p>');
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${config.botName}</title></head>
<body style="background:#000;color:#eee;font-family:sans-serif;text-align:center;padding:40px 16px;">
<h1>${config.botName}</h1>
<p>Status: <b>${connState}</b> • Uptime: ${uptimeText()} • Commands: ${totalCommands}</p>
${codeHtml}
<p style="color:#888;font-size:13px;margin-top:30px;">Prefix: <b>${config.prefix}</b> • WhatsApp-e <b>${config.prefix}menu</b> likhe sob command dekhte parbe.</p>
</body></html>`);
});
app.listen(config.port, () => console.log(`[web] Status page cholche port ${config.port}-e`));

// ---- WhatsApp connection ----
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'session'));
  const { version } = await fetchLatestBaileysVersion();
  const pairNumber = (config.pairNumber || '').replace(/[^0-9]/g, '');

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: [config.botName, 'Chrome', '120.0.0'],
  });

  // Pairing code: number thakle code chawa hobe, na thakle QR asbe
  if (!state.creds.registered && pairNumber) {
    pairState.number = pairNumber;
    const askCode = async (tries) => {
      try {
        const code = await sock.requestPairingCode(pairNumber);
        pairState.code = code;
        console.log(`[pair] Pairing code: ${code}  (number: ${pairNumber})`);
        console.log('[pair] Code-ta website-eo dekhabe: / (status page)');
      } catch (e) {
        if (tries > 0) {
          console.log(`[pair] Code chawa jay nai, abar try hocche... (${e.message || e})`);
          setTimeout(() => askCode(tries - 1), 4000);
        } else {
          console.log('[pair] Pairing code pawa jay nai. Number-ta thik ache kina check koro, ba QR diye pair koro (PAIR_NUMBER khali rakho).');
        }
      }
    };
    setTimeout(() => askCode(2), 2500);
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (u) => {
    const { connection, lastDisconnect, qr } = u;
    if (qr && !pairNumber) {
      console.log('[qr] QR code terminal-e asche — WhatsApp diye scan koro.');
      qrcode.generate(qr, { small: true });
    }
    if (connection) {
      connState = connection;
      console.log(`[conn] ${connection}`);
      if (connection === 'open') {
        pairState.code = null;
        console.log(`[MR AI MD] ✅ Connected! Prefix "${config.prefix}" — ${config.prefix}menu likhe dekho.`);
      }
      if (connection === 'close') {
        const err = lastDisconnect && lastDisconnect.error;
        const code = err && err.output ? err.output.statusCode : null;
        if (code === DisconnectReason.loggedOut) {
          console.log('[conn] Logged out hoye gese. session folder delete kore abar pair korte hobe.');
        } else {
          console.log(`[conn] Connection gelo (${err && err.message ? err.message : 'karon jana jay nai'}) — 5 second por abar connect hocche...`);
          setTimeout(startBot, 5000);
        }
      }
    }
  });

  // ---- message asle command chalano ----
  sock.ev.on('messages.upsert', async ({ type, messages }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      try {
        if (!msg.message || msg.key.fromMe) continue;
        const m = msg.message;
        const text = m.conversation
          || (m.extendedTextMessage && m.extendedTextMessage.text)
          || (m.imageMessage && m.imageMessage.caption)
          || (m.videoMessage && m.videoMessage.caption)
          || '';
        const jid = msg.key.remoteJid;
        const sender = getSender(msg);
        const senderNumber = sender.split('@')[0];
        const isGroup = jid.endsWith('@g.us');
        const pushName = msg.pushName || '';
        const ctxInfo = (m.extendedTextMessage && m.extendedTextMessage.contextInfo)
          || (m.imageMessage && m.imageMessage.contextInfo)
          || (m.videoMessage && m.videoMessage.contextInfo)
          || {};
        const mentions = ctxInfo.mentionedJid || [];
        const owner = isOwner(sender, senderNumber);
        const reply = (t) => sock.sendMessage(jid, { text: t }, { quoted: msg });

        // Auto-read (on thakle)
        if (settings.autoread) {
          try { await sock.readMessages([msg.key]); } catch (_) {}
        }

        // AFK: nije message likhle AFK off
        if (settings.afk && settings.afk[senderNumber]) {
          delete settings.afk[senderNumber];
          saveSettings();
          await reply(`👋 Welcome back, ${pushName || 'bondhu'}! AFK off hoye geche.`);
        }
        // AFK: keu AFK user-ke mention korle janano
        for (const men of mentions) {
          const menNum = men.split('@')[0];
          if (settings.afk && settings.afk[menNum]) {
            await reply(`💤 @${menNum} ekhon AFK. Karon: ${settings.afk[menNum].reason}`);
            break;
          }
        }

        // Group admin info (admin command + antilink-er jonno)
        let isAdmin = false;
        let isBotAdmin = false;
        if (isGroup) {
          try {
            const meta = await sock.groupMetadata(jid);
            const me = meta.participants.find((p) => p.id === sender);
            isAdmin = !!(me && (me.admin === 'admin' || me.admin === 'superadmin'));
            const bot = meta.participants.find((p) => p.id === sock.user.id);
            isBotAdmin = !!(bot && (bot.admin === 'admin' || bot.admin === 'superadmin'));
          } catch (_) {}
        }

        // Antilink: group-e link pathale delete (admin chara)
        if (isGroup && settings.antilink && settings.antilink[jid] && !isAdmin && !owner) {
          if (/https?:\/\/|www\./i.test(text)) {
            try {
              await sock.sendMessage(jid, { delete: { remoteJid: jid, fromMe: false, id: msg.key.id, participant: sender } });
              await sock.sendMessage(jid, { text: `⚠️ @${senderNumber}, ei group-e link pathano bondho ache!`, mentions: [sender] });
            } catch (_) {}
            continue;
          }
        }

        const prefix = effectivePrefix();
        if (!text.startsWith(prefix)) continue;

        const body = text.slice(prefix.length).trim();
        if (!body) continue;
        const parts = body.split(/\s+/);
        const name = parts[0].toLowerCase();
        const args = parts.slice(1);
        const cmd = commands.get(name);
        if (!cmd) continue;

        // Self mode: sudhu owner command chalate parbe
        if (settings.mode === 'self' && !owner) continue;

        if (cmd.ownerOnly && !owner) {
          await reply('❌ Ei command sudhu bot-er owner use korte parbe.');
          continue;
        }
        if (cmd.groupOnly && !isGroup) {
          await reply('❌ Ei command sudhu group-e cholbe.');
          continue;
        }
        if (cmd.adminOnly && isGroup) {
          if (!isAdmin && !owner) {
            await reply('❌ Ei command sudhu group admin use korte parbe.');
            continue;
          }
        }

        console.log(`[cmd] ${name} — from ${sender} (${isGroup ? 'group' : 'chat'})`);
        await cmd.run({
          sock, msg, jid, sender, senderNumber, isGroup, isOwner: owner,
          isAdmin, isBotAdmin, mentions, pushName,
          args, text: args.join(' '), reply, config, prefix, cmdName: name,
          baileysVersion: MR_REAN_BAILEYS_VERSION || '6.7.24-mr.1',
        });
      } catch (e) {
        console.log(`[cmd-error] ${e && e.message ? e.message : e}`);
        try {
          await sock.sendMessage(msg.key.remoteJid, { text: '⚠️ Command chalaite giye ekta problem hoise. Abar try koro.' }, { quoted: msg });
        } catch (_) { /* ignore */ }
      }
    }
  });

  // ---- group-e keu dhukle / ber hole welcome / goodbye ----
  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    try {
      const meta = await sock.groupMetadata(id);
      const gname = meta.subject || 'group';
      for (const p of participants) {
        const num = p.split('@')[0];
        if (action === 'add' && settings.welcome && settings.welcome[id]) {
          await sock.sendMessage(id, { text: `👋 Welcome @${num}! *${gname}*-e asar jonno dhonnobad! 🎉\nCommand dekhte ${effectivePrefix()}menu likho.`, mentions: [p] });
        } else if (action === 'remove' && settings.goodbye && settings.goodbye[id]) {
          await sock.sendMessage(id, { text: `👋 @${num} group theke ber hoye geche. Bye!`, mentions: [p] });
        }
      }
    } catch (_) {}
  });
}

startBot().catch((e) => {
  console.log('[fatal] Bot start hoy nai:', e && e.message ? e.message : e);
  setTimeout(startBot, 5000);
});
