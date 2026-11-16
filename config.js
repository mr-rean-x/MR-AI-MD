// MR AI MD — settings.
// Sob kichu Railway Variables / .env theke ase. Code-e kono token, key ba
// password lekha nai — key gulo sudhu Railway dashboard-e bosbe.
require('dotenv').config();

module.exports = {
  // Bot-er naam (Railway-e BOT_NAME diye bodlano jabe)
  botName: process.env.BOT_NAME || 'MR AI MD',
  // Owner-er naam
  ownerName: process.env.OWNER_NAME || 'MR AI',
  // Owner-er WhatsApp number — country code soho, + chara.
  // Jemon: 8801956501630
  ownerNumber: process.env.OWNER_NUMBER || '',
  // Command-er age je chinno bosbe ( .menu, .ping ... )
  prefix: process.env.PREFIX || '.',
  // Je number diye bot pair hobe (secondary number use kora valo).
  // Khali rakhle terminal-e QR code asbe.
  pairNumber: process.env.PAIR_NUMBER || '',
  // Groq AI key — sudhu .ai command-er jonno lage.
  groqApiKey: process.env.GROQ_API_KEY || '',
  // Railway nije PORT dey; local-e 3000.
  port: parseInt(process.env.PORT || '3000', 10),
};
