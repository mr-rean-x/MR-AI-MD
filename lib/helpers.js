// Choto helper gulo — sender, owner check, media download, sticker banano.
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { downloadMediaMessage } = require('mr-rean-baileys');
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
  // Dui vabe daka jay: getMediaBuffer(sock, msg) ba getMediaBuffer(ctx)
  if (sock && sock.sock && sock.msg && !msg) { msg = sock.msg; sock = sock.sock; }
  const m = (msg && msg.message) || {};
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

// Bot-er chobi soho message pathano (menu / alive). Chobi set na thakle sudhu text.
async function sendWithPhoto(sock, jid, text, msg, config) {
  const photo = config && config.botPhoto;
  if (!photo) {
    return sock.sendMessage(jid, { text }, { quoted: msg });
  }
  try {
    if (/^https?:\/\//i.test(photo)) {
      return await sock.sendMessage(jid, { image: { url: photo }, caption: text }, { quoted: msg });
    }
    const fs2 = require('fs');
    const path2 = require('path');
    const p = path2.isAbsolute(photo) ? photo : path2.join(process.cwd(), photo);
    if (fs2.existsSync(p)) {
      return await sock.sendMessage(jid, { image: fs2.readFileSync(p), caption: text }, { quoted: msg });
    }
  } catch (e) {
    // chobi pathate na parle text-e pathai
  }
  return sock.sendMessage(jid, { text }, { quoted: msg });
}

// Jekono audio/video buffer theke MP3 banano — ffmpeg diye
function bufferToMp3(buffer, isVideo) {
  return convertWithFfmpeg(buffer, isVideo ? ['-vn'] : [], ['-c:a', 'libmp3lame', '-q:a', '4'], '.mp3');
}

// Webp/image buffer theke 5 second-er MP4 banano (sticker -> video)
function bufferToMp4(buffer) {
  return convertWithFfmpeg(buffer, ['-loop', '1', '-t', '5'], ['-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'], '.mp4');
}

// Chobi-te filter lagano (enhance/upscale/blur/dehaze) — filter = ffmpeg vf string
function enhanceImage(buffer, vf) {
  return convertWithFfmpeg(buffer, [], ['-vf', vf, '-vframes', '1'], '.jpg');
}

function convertWithFfmpeg(buffer, inArgs, outArgs, ext) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomBytes(6).toString('hex');
    const tmp = os.tmpdir();
    const inFile = path.join(tmp, `mraimd-cv-in-${id}`);
    const outFile = path.join(tmp, `mraimd-cv-out-${id}${ext}`);
    fs.writeFileSync(inFile, buffer);
    const args = ['-y', ...inArgs, '-i', inFile, ...outArgs, outFile];
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
        reject(new Error('ffmpeg convert korte pare nai (code ' + code + ')'));
      }
    });
    function cleanup() {
      try { fs.unlinkSync(inFile); } catch (_) {}
      try { fs.unlinkSync(outFile); } catch (_) {}
    }
  });
}

// Audio-te filter lagano (bass/nightcore/slow/fast/reverse...) — ffmpeg -af
function audioEffect(buffer, af) {
  return convertWithFfmpeg(buffer, [], ['-af', af, '-c:a', 'libmp3lame', '-q:a', '4'], '.mp3');
}

module.exports = { getSender, isOwnerNumber, isGroupAdmin, getMediaBuffer, bufferToWebp, sendWithPhoto, bufferToMp3, bufferToMp4, enhanceImage, audioEffect };
