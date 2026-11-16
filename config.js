// MR AI MD — settings.
// Sob kichu Railway Variables / .env theke ase. Code-e kono token, key ba
// password lekha nai — key gulo sudhu Railway dashboard-e bosbe.
//
// *** TOMAR JINIS GULO EK HANE BOSAO ***
// OWNER_NUMBER: tomar WhatsApp number (country code soho, + chara)
// BOT_PHOTO: bot-er chobi — ekta image URL, ba bot-er folder-er vitore
//   ekta file-er naam (jemon: ./assets/bot.jpg). Menu ar alive-e ei chobi asbe.
// GROQ_API_KEY: .ai / .gpt command-er jonno (console.groq.com theke free)
// GEMINI_API_KEY: .gemini command-er jonno (aistudio.google.com theke free)
require('dotenv').config();

module.exports = {
  // Bot-er naam (Railway-e BOT_NAME diye bodlano jabe)
  botName: process.env.BOT_NAME || 'MR AI MD',
  // Owner-er naam
  ownerName: process.env.OWNER_NAME || 'MR AI',
  // Owner-er WhatsApp number — country code soho, + chara.
  // Jemon: 8801956501630
  ownerNumber: process.env.OWNER_NUMBER || '',
  // Bot-er chobi — image URL (https://...) ba local file (./assets/bot.jpg).
  // Khali rakhle menu sudhu text-e asbe.
  botPhoto: process.env.BOT_PHOTO || '',
  // Command-er age je chinno bosbe ( .menu, .ping ... )
  prefix: process.env.PREFIX || '.',
  // Je number diye bot pair hobe (secondary number use kora valo).
  // Khali rakhle terminal-e QR code asbe.
  pairNumber: process.env.PAIR_NUMBER || '',
  // Groq AI key — .ai / .gpt / .llama / .mistral / .deepseek command-er jonno.
  groqApiKey: process.env.GROQ_API_KEY || '',
  // Gemini key — sudhu .gemini command-er jonno.
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  // Railway nije PORT dey; local-e 3000.
  port: parseInt(process.env.PORT || '3000', 10),
};
