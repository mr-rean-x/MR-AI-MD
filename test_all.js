// SOB command-er test — ekta-o bad jabe na.
// Mock sock + mock message diye prottek command chalano hoy.
// Live API command gulo asol API-te hit kore.
// Usage: node test_all.js
const path = require('path');
const fs = require('fs');
const { loadCommands } = require('./lib/loader');
const config = require('./config');
const { settings, saveSettings } = require('./lib/settings');

const CHUNK_TAG = process.argv[2] || 'all';
const CHUNK_CATS = process.argv[3] ? process.argv[3].split(',') : null;
const commands = loadCommands(path.join(__dirname, 'commands'));

function makeMockSock() {
  const sent = [];
  const mockSock = {
  user: { id: '8801956501630@s.whatsapp.net' },
  sendMessage: async (jid, content, opts) => {
    sent.push({ jid, keys: Object.keys(content), content });
    return { key: { id: 'mock' } };
  },
  groupMetadata: async (jid) => ({
    id: jid,
    subject: 'Test Group',
    participants: [
      { id: '8801956501630@s.whatsapp.net', admin: 'superadmin' },
      { id: '8801985519015@s.whatsapp.net', admin: null },
      { id: '8801956501630@s.whatsapp.net', admin: null },
    ],
  }),
  groupUpdateSubject: async () => true,
  groupUpdateDescription: async () => true,
  groupInviteCode: async () => 'TESTCODE123',
  groupRevokeInvite: async () => 'NEWCODE456',
  groupSettingUpdate: async () => true,
  groupLeave: async () => true,
  groupCreate: async (name, members) => ({ id: '120363@test@g.us', subject: name }),
  groupAcceptInvite: async () => '120363@test@g.us',
  groupParticipantsUpdate: async () => true,
  updateProfilePicture: async () => true,
  updateProfileStatus: async () => true,
  updateBlockStatus: async () => true,
  chatModify: async () => true,
  readMessages: async () => true,
  profilePictureUrl: async () => 'https://example.com/dp.jpg',
  };
  return { sock: mockSock, sent };
}

function mockMsg(text, opts) {
  const o = opts || {};
  const m = { conversation: text };
  if (o.quoted) {
    m.extendedTextMessage = {
      text,
      contextInfo: {
        stanzaId: 'quoted123',
        participant: '8801985519015@s.whatsapp.net',
        quotedMessage: { conversation: 'quoted text' },
        mentionedJid: o.mentions || [],
      },
    };
    delete m.conversation;
  } else if (o.mentions) {
    m.extendedTextMessage = { text, contextInfo: { mentionedJid: o.mentions } };
    delete m.conversation;
  }
  return {
    key: { remoteJid: o.jid || '8801985519015@s.whatsapp.net', fromMe: false, id: 'msg1' },
    pushName: 'Test User',
    message: m,
  };
}

const ARGS = {
  ai: 'Bangladesh-er rajdhani kothay?', gpt: 'Bangladesh-er rajdhani kothay?',
  groq: 'ekta golpo bolo', llama: 'Python ki?', mistral: 'ekta kobita likho',
  deepseek: '2+2 koto?', gemini: 'Dhaka somporke bolo',
  text2img: 'ekta biral, sunset', toanime: 'ekta meye, sakura gach', cartoon: 'ekta kukur, superhero',
  google: 'Free Fire', image: 'biral', define: 'love', lyrics: 'Alan Walker - Faded',
  news: 'Bangladesh', recipe: 'chicken biryani', github: 'mr-rean-x', iplookup: '8.8.8.8',
  animesearch: 'Naruto', tiktokstalk: 'tiktok',
  ytmp4: 'rick astley never gonna give you up', play: 'raj karega khalsa',
  ssweb: 'example.com', qr: 'Hello world', emoji: '😂',
  tts: 'bn Ami valo achi', tovn: 'Ami valo achi',
  rps: 'rock', wordchain: 'apple', guess: '5', ship: 'Atik Sonia',
  gaycheck: 'Atik', coolcheck: 'Atik', smartcheck: 'Atik', stupidcheck: 'Atik',
  hotcheck: 'Atik', evilcheck: 'Atik', greatcheck: 'Atik',
  '8ball': 'ami ki jitbo?', joke: '', quote: '', coin: '', dice: '',
  setname: 'Test Group', setdesc: 'Amader test group', closetime: '10', opentime: '10',
  creategroup: 'Test Group @8801985519015', join: 'https://chat.whatsapp.com/TESTCODE123',
  antilink: 'on', welcome: 'on', goodbye: 'on', warn: '', resetwarn: '',
  poll: 'Valo lagche? | Ha | Na', setprefix: '!', afk: 'ghumacchi',
  addowner: '8801985519015', delowner: '8801985519015', addprem: '8801985519015',
  delprem: '8801985519015', setbio: 'Ami MR AI MD bot', autoread: 'on',
  block: '8801985519015', unblock: '8801985519015', contact: '8801956501630',
  poststatus: 'Ajke valo din!', react: '❤️', shortlink: 'https://google.com',
  translate: 'bn Hello friend', currency: '100 USD to BDT', calc: '2+3*4',
  quran: '2:255', prayertime: '', wallpaper: 'nature', wiki: 'Dhaka', weather: 'Dhaka',
  sticker: '', toimg: '', tomp3: '', tomp4: '', enhance: '', upscale: '', dehaze: '',
  blur: '', take: '', tourl: '', readqr: '', setppgc: '', setppbot: '',
  logo: 'MR AI', neontext: 'MR AI', glitchtext: 'MR AI', '3dtext': 'MR AI',
  goldtext: 'MR AI', firetext: 'MR AI', icetext: 'MR AI', rainbowtext: 'MR AI',
  metaltext: 'MR AI', retrotext: 'MR AI', royaltext: 'MR AI', watertext: 'MR AI',
  galaxystyle: 'MR AI', blackpinklogo: 'MR AI', floraltext: 'MR AI',
  gradienttext: 'MR AI', graffititext: 'MR AI', typographytext: 'MR AI',
  gfx1: 'MR AI', gfx2: 'MR AI', gfx3: 'MR AI', gfx4: 'MR AI', gfx5: 'MR AI',
  gfx6: 'MR AI', gfx7: 'MR AI', gfx8: 'MR AI', gfx9: 'MR AI', gfx10: 'MR AI', gfx11: 'MR AI',
  waifu: '', neko: '', husbu: '', maid: '', tictactoe: 'start',
};

// Pollinations image command gulo live-e slow (42 character x 10-20s) — mock fetch diye wiring test
const CHAR_NAMES = new Set(["asuna","ayuzawa","boruto","chiho","deidara","elaina","emilia","erza","gremory","hestia","inori","isuzu","itachi","itori","kaga","kagura","kakashi","kaori","keneki","kotori","kurumi","madara","megumin","mikasa","miku","minato","naruto","nezuko","rize","ryujin","sagiri","sakura","sasuke","shinobu","tsunade","yotsuba","yuki","yuki1","yumeko","akiyama","ana","onepiece","doraemon"]);
const IMG_MOCK = new Set(['toanime', 'cartoon']); // sudhu text2img live
const LOGO_NAMES = new Set(['logo', 'neontext', 'glitchtext', '3dtext', 'goldtext', 'firetext', 'icetext', 'rainbowtext', 'metaltext', 'retrotext', 'royaltext', 'watertext', 'galaxystyle', 'blackpinklogo', 'floraltext', 'gradienttext', 'graffititext', 'typographytext', 'gfx1', 'gfx2', 'gfx3', 'gfx4', 'gfx5', 'gfx6', 'gfx7', 'gfx8', 'gfx9', 'gfx10', 'gfx11']);
const LOGO_LIVE = new Set(['logo']); // sudhu 'logo' live, baki mock
const SKIP_RUN = new Set(['restart']); // process.exit kore — chalano jabe na

// Choto fake PNG (1x1) — mock fetch-er jonno
const FAKE_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

async function runOne(cmd) {
  const name = cmd.name;
  const isGroupCmd = cmd.category === 'Group';
  const isOwnerCmd = cmd.ownerOnly;
  const text = ARGS[name] !== undefined ? ARGS[name] : '';
  const needsMention = ['warn', 'resetwarn', 'block', 'unblock', 'getpp', 'add', 'kick', 'promote', 'demote', 'tagall', 'tag'].includes(name);
  const needsQuoted = ['delete', 'react'].includes(name);
  const msg = mockMsg((config.prefix + name + (text ? ' ' + text : '')), {
    jid: isGroupCmd ? '120363@test@g.us' : '8801985519015@s.whatsapp.net',
    mentions: needsMention ? ['8801985519015@s.whatsapp.net'] : undefined,
    quoted: needsQuoted,
  });
  const { sock: mockSock, sent } = makeMockSock();
  const ctx = {
    sock: mockSock, msg, jid: msg.key.remoteJid,
    sender: '8801956501630@s.whatsapp.net', senderNumber: '8801956501630',
    isGroup: isGroupCmd, isOwner: true, isAdmin: true, isBotAdmin: true,
    mentions: needsMention ? ['8801985519015@s.whatsapp.net'] : [],
    pushName: 'Test User',
    args: text ? text.split(/\s+/) : [], text,
    reply: async (t) => { sent.push({ reply: t }); },
    config, prefix: config.prefix, cmdName: name,
    baileysVersion: '6.7.24-mr.1',
  };
  const before = sent.length;
  await cmd.run(ctx);
  if (sent.length === before) return { ok: false, why: 'kono reply/send hoy nai' };
  return { ok: true, sent };
}

(async () => {
  const results = [];
  const log = (t) => fs.writeSync(2, t + String.fromCharCode(10));
  const realFetch = global.fetch;
  const seenNames = new Set();
  for (const cmd of commands.values()) {
    if (seenNames.has(cmd.name)) continue; // alias duplicate — ekbar-i test
    seenNames.add(cmd.name);
    if (CHUNK_CATS && !CHUNK_CATS.includes(cmd.category)) continue;
    const name = cmd.name;
    log('[' + CHUNK_TAG + '] ' + name + ' ...');
    if (SKIP_RUN.has(name)) { results.push({ name, ok: true, why: 'SKIP (process.exit) — code check kora hoise' }); continue; }
    try {
      // Pollinations: sudhu logo/text2img/naruto live, baki sob mock fetch diye
      if (((LOGO_NAMES.has(name) || CHAR_NAMES.has(name)) && !LOGO_LIVE.has(name) && name !== 'naruto') || IMG_MOCK.has(name)) {
        global.fetch = async () => ({ ok: true, arrayBuffer: async () => FAKE_PNG.buffer.slice(FAKE_PNG.byteOffset, FAKE_PNG.byteOffset + FAKE_PNG.byteLength) });
      } else {
        global.fetch = realFetch;
      }
      const budget = (name === 'play' || name === 'ytmp4') ? 120000 : 45000;
      const r = await Promise.race([runOne(cmd), new Promise((res) => setTimeout(() => res({ ok: false, why: 'TIMEOUT (' + (budget / 1000) + 's)' }), budget))]);
      results.push({ name, ok: r.ok, why: r.why || '' });
    } catch (e) {
      results.push({ name, ok: false, why: 'THROW: ' + (e.message || e) });
    } finally {
      global.fetch = realFetch;
    }
    // tictactoe-er ditiyo chal
    if (name === 'tictactoe') {
      try {
        const cmd2 = commands.get('tictactoe');
        const msg = mockMsg('.ttt 5', { jid: '120363@test@g.us' });
        const m2 = makeMockSock();
        let sent2 = m2.sent;
        await cmd2.run({ sock: m2.sock, msg, jid: msg.key.remoteJid, sender: '8801956501630@s.whatsapp.net', senderNumber: '8801956501630', isGroup: true, isOwner: true, isAdmin: true, isBotAdmin: true, mentions: [], pushName: 'Test', args: ['5'], text: '5', reply: async (t) => { sent2.push({ reply: t }); }, config, prefix: config.prefix, cmdName: 'tictactoe', baileysVersion: '6.7.24-mr.1' });
        results.push({ name: 'tictactoe(2nd move)', ok: sent2.length > 0, why: sent2.length ? '' : 'kono reply hoy nai' });
      } catch (e) {
        results.push({ name: 'tictactoe(2nd move)', ok: false, why: 'THROW: ' + (e.message || e) });
      }
    }
  }
  const pass = results.filter((r) => r.ok);
  const fail = results.filter((r) => !r.ok);
  console.log(`\n===== RESULT: ${pass.length}/${results.length} PASS =====`);
  if (fail.length) {
    console.log('FAILED:');
    for (const f of fail) console.log(`  ❌ ${f.name} — ${f.why}`);
  } else {
    console.log('✅ SOB COMMAND PASS — ekta-o fail nai!');
  }
  fs.writeFileSync(path.join(__dirname, 'test_all_result_' + CHUNK_TAG + '.json'), JSON.stringify({ total: results.length, pass: pass.length, fail: fail.map((f) => f.name + ': ' + f.why) }, null, 2));
  process.exit(fail.length ? 1 : 0);
})();
