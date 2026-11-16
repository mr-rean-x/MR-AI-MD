// Choto helper gulo — sender, owner check, media download, sticker banano.
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const ffmpegPath = require('ffmpeg-static');

// Message ke pathano lok-er number ber kora
function getSender(msg) {
  const raw = msg.key.participant || msg.key.remoteJid || '';
  return String(raw).replace(/@.*$/, '');
}

function isOwnerNumber(sender, ownerNumber) {
  if (!ownerNumber) return false;
  return String(sender) === String(ownerNumber).replace(/[^0-9]/g, '');
}

// Group-e keu admin kina
async function isGroupAdmin(sock, jid, sender) {
  try {
    const meta = await sock.groupMetadata(jid);
    const me = meta.participants.find((p) => p.id.replace(/@.*$/, '') === String(sender));
    return !!(me && (me.admin === 'admin' || me.admin === 'superadmin'));
  } catch (e) {
    return false;
  }
}

// Command-er message ba quoted message theke media (image/video/sticker) namano
async function getMediaBuffer(sock, msg) {
  const m = msg.message || {};
  // 1) ei message-ei media thakle
  if (m.imageMessage || m.videoMessage || m.stickerMessage) {
    const buf = await downloadMediaMessage(msg, 'buffer', {}, { logger: { level: 'silent' } });
    const type = m.imageMessage ? 'image' : m.videoMessage ? 'video' : 'sticker';
    const mime = (m.imageMessage || m.videoMessage || m.stickerMessage || {}).mimetype || '';
    return { buffer: buf, type, mime };
  }
  // 2) quoted (reply kora) message-e media thakle
  const ctx = m.extendedTextMessage && m.extendedTextMessage.contextInfo;
  const quoted = ctx && ctx.quotedMessage;
  if (quoted && (quoted.imageMessage || quoted.videoMessage || quoted.stickerMessage)) {
    const fake = {
      key: { remoteJid: msg.key.remoteJid, id: ctx.stanzaId, fromMe: false },
      message: quoted,
    };
    const buf = await downloadMediaMessage(fake, 'buffer', {}, { logger: { level: 'silent' } });
    const type = quoted.imageMessage ? 'image' : quoted.videoMessage ? 'video' : 'sticker';
    return { buffer: buf, type, mime: '' };
  }
  return null;
}

// Image/video buffer theke WhatsApp sticker (webp) banano — ffmpeg diye
function bufferToWebp(buffer, isVideo) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomBytes(6).toString('hex');
    const tmp = os.tmpdir();
    const inFile = path.join(tmp, `mraimd-in-${id}`);
    const outFile = path.join(tmp, `mraimd-out-${id}.webp`);
    fs.writeFileSync(inFile, buffer);
    const vf = 'scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000';
    const args = ['-y', '-i', inFile];
    if (isVideo) args.push('-t', '6');
    else args.push('-vframes', '1');
    args.push('-vf', vf, '-c:v', 'libwebp', '-lossless', '0', '-q:v', '70', '-preset', 'default', '-an', '-vsync', '0', outFile);
    const ff = spawn(ffmpegPath, args);
    let err = '';
    ff.stderr.on('data', (d) => { err += d.toString(); });
    ff.on('error', (e) => { cleanup(); reject(e); });
    ff.on('close', (code) => {
      if (code === 0 && fs.existsSync(outFile)) {
        const out = fs.readFileSync(outFile);
        cleanup();
        resolve(out);
      } else {
        cleanup();
        reject(new Error('ffmpeg sticker banate pare nai (code ' + code + ')'));
      }
    });
    function cleanup() {
      try { fs.unlinkSync(inFile); } catch (_) {}
      try { fs.unlinkSync(outFile); } catch (_) {}
    }
  });
}

module.exports = { getSender, isOwnerNumber, isGroupAdmin, getMediaBuffer, bufferToWebp };
