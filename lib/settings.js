// Bot-er setting save kora — setting.json file-e thake, restart-er poro thake.
// Prefix, mode, owner/premium list, antilink, welcome, warn, afk — sob ekhane.
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'setting.json');

const defaults = {
  prefix: null,          // null mane config.js-er prefix use hobe
  mode: 'public',        // public (sobai) / self (sudhu owner)
  autoread: false,       // asle message auto-read
  owners: [],            // extra owner number (OWNER_NUMBER-er sathe)
  premium: [],           // premium user number
  antilink: {},          // { groupJid: true }
  welcome: {},           // { groupJid: true }
  goodbye: {},           // { groupJid: true }
  warns: {},             // { groupJid: { userNumber: count } }
  afk: {},               // { userNumber: { reason, since } }
  ttt: {},               // { chatJid: { board, turn } }
  slot: {},              // { userNumber: balance }
  wordchain: {},         // { chatJid: lastWord }
  guess: {},             // { chatJid: number }
};

let data = Object.assign({}, defaults);
try {
  if (fs.existsSync(FILE)) {
    const saved = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    data = Object.assign({}, defaults, saved);
  }
} catch (e) {
  console.log('[settings] setting.json pora jay nai, default use hocche.');
}

function save() {
  try {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('[settings] save korte pari nai:', e.message);
  }
}

module.exports = { settings: data, saveSettings: save };
