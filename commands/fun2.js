// Fun + game command — sob local, ba free API (key lage na).
const { settings, saveSettings } = require('../lib/settings');

const fetchJson = async (url, headers) => {
  const r = await fetch(url, { headers: headers || { 'User-Agent': 'MR-AI-MD' }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error('http ' + r.status);
  return r.json();
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function hashPct(str) {
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 101;
}

function checkCommand(name, label, emoji) {
  return {
    name,
    aliases: [],
    category: 'Fun',
    desc: `${label} koto % check koro`,
    usage: `.${name} <naam>`,
    async run(ctx) {
      const who = (ctx.text || '').trim() || ctx.pushName || 'tumi';
      const pct = hashPct(who.toLowerCase() + name);
      await ctx.reply(`${emoji} *${who}* — ${label}: *${pct}%*`);
    },
  };
}

const tttGames = {};

module.exports = [
  checkCommand('gaycheck', 'Gay', '🏳️‍🌈'),
  checkCommand('coolcheck', 'Cool', '😎'),
  checkCommand('smartcheck', 'Smart', '🧠'),
  checkCommand('stupidcheck', 'Stupid', '🤪'),
  checkCommand('hotcheck', 'Hot', '🔥'),
  checkCommand('evilcheck', 'Evil', '😈'),
  checkCommand('greatcheck', 'Great', '🌟'),
  {
    name: 'slot',
    aliases: [],
    category: 'Fun',
    desc: 'Slot machine khelo (fun coin)',
    usage: '.slot',
    async run(ctx) {
      const user = ctx.sender;
      const bal = settings.slot[user] == null ? 100 : settings.slot[user];
      if (bal < 10) return ctx.reply('❌ Tomar coin sesh! Balance 0. Abar 100 coin nite .slotrefill likho.');
      const sym = ['🍒', '🍋', '⭐', '💎', '🔔', '🍇'];
      const a = pick(sym), b = pick(sym), c = pick(sym);
      let newBal = bal - 10;
      let msg = `🎰 *SLOT*\n\n| ${a} | ${b} | ${c} |\n\n`;
      if (a === b && b === c) { newBal += 100; msg += `🎉 JACKPOT! +100 coin\n💰 Balance: ${newBal}`; }
      else if (a === b || b === c || a === c) { newBal += 30; msg += `😊 Milse! +30 coin\n💰 Balance: ${newBal}`; }
      else { msg += `😢 Milenai. -10 coin\n💰 Balance: ${newBal}`; }
      settings.slot[user] = newBal;
      saveSettings();
      await ctx.reply(msg);
    },
  },
  {
    name: 'slotrefill',
    aliases: [],
    category: 'Fun',
    desc: 'Slot coin abar 100 koro',
    usage: '.slotrefill',
    async run(ctx) {
      settings.slot[ctx.sender] = 100;
      saveSettings();
      await ctx.reply('💰 Tomar slot coin abar *100* hoye geche!');
    },
  },
  {
    name: 'tictactoe',
    aliases: ['ttt'],
    category: 'Fun',
    desc: 'Tic-tac-toe khelo (tumi X, bot O)',
    usage: '.ttt start | .ttt 5',
    async run(ctx) {
      const chat = ctx.jid;
      const arg = (ctx.text || '').trim().toLowerCase();
      const draw = (board) => `\n${board[0]} | ${board[1]} | ${board[2]}\n---------\n${board[3]} | ${board[4]} | ${board[5]}\n---------\n${board[6]} | ${board[7]} | ${board[8]}`;
      const win = (board, p) => {
        const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        return lines.some(([a, b, c]) => board[a] === p && board[b] === p && board[c] === p);
      };
      if (arg === 'start' || !tttGames[chat]) {
        tttGames[chat] = { board: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] };
        return ctx.reply(`⭕ *TIC-TAC-TOE* shuru!\nTumi ❌, bot ⭕\n${draw(tttGames[chat].board)}\n\nChal dao: .ttt <1-9>`);
      }
      const n = parseInt(arg, 10);
      const g = tttGames[chat];
      if (!n || n < 1 || n > 9 || g.board[n - 1] === '❌' || g.board[n - 1] === '⭕') {
        return ctx.reply('❓ Khali ghor-er number dao (1-9). Jemon: .ttt 5');
      }
      g.board[n - 1] = '❌';
      if (win(g.board, '❌')) { delete tttGames[chat]; return ctx.reply(`🎉 Tumi jitso!\n${draw(g.board)}`); }
      if (g.board.every((x) => x === '❌' || x === '⭕')) { delete tttGames[chat]; return ctx.reply(`🤝 Draw!\n${draw(g.board)}`); }
      const empty = g.board.map((x, i) => (x !== '❌' && x !== '⭕' ? i : -1)).filter((i) => i >= 0);
      g.board[pick(empty)] = '⭕';
      if (win(g.board, '⭕')) { delete tttGames[chat]; return ctx.reply(`😢 Bot jitse!\n${draw(g.board)}\nAbar khelte .ttt start likho.`); }
      if (g.board.every((x) => x === '❌' || x === '⭕')) { delete tttGames[chat]; return ctx.reply(`🤝 Draw!\n${draw(g.board)}`); }
      await ctx.reply(`⭕ *TIC-TAC-TOE*\n${draw(g.board)}\n\nTomar chal: .ttt <1-9>`);
    },
  },
  {
    name: 'rps',
    aliases: ['rockpaperscissors'],
    category: 'Fun',
    desc: 'Rock Paper Scissors khelo',
    usage: '.rps rock',
    async run(ctx) {
      const me = (ctx.text || '').trim().toLowerCase();
      const map = { rock: '🪨 Rock', paper: '📄 Paper', scissors: '✂️ Scissors', r: '🪨 Rock', p: '📄 Paper', s: '✂️ Scissors' };
      const key = { rock: 'rock', r: 'rock', paper: 'paper', p: 'paper', scissors: 'scissors', s: 'scissors' }[me];
      if (!key) return ctx.reply('❓ rock, paper ba scissors likho. Jemon: .rps rock');
      const bot = pick(['rock', 'paper', 'scissors']);
      const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
      const res = key === bot ? '🤝 Draw!' : beats[key] === bot ? '🎉 Tumi jitso!' : '😢 Bot jitse!';
      await ctx.reply(`${map[key]} vs ${map[bot]}\n\n${res}`);
    },
  },
  {
    name: 'wordchain',
    aliases: [],
    category: 'Fun',
    desc: 'Word chain khelo (ager shobder sesh okkhor diye notun shobdo)',
    usage: '.wordchain apple',
    async run(ctx) {
      const word = (ctx.text || '').trim().toLowerCase().replace(/[^a-z]/g, '');
      if (!word) return ctx.reply('❓ Ekta English shobdo likho. Jemon: .wordchain apple');
      const chat = ctx.jid;
      const last = settings.wordchain[chat];
      if (last && word[0] !== last[last.length - 1]) {
        return ctx.reply(`❌ Shobdo-ta *${last[last.length - 1].toUpperCase()}* diye shuru hote hobe (ager shobdo: ${last}).`);
      }
      const words = { a: 'ant', b: 'ball', c: 'cat', d: 'dog', e: 'egg', f: 'fish', g: 'goat', h: 'hen', i: 'ice', j: 'jam', k: 'kite', l: 'lion', m: 'moon', n: 'nest', o: 'owl', p: 'pen', q: 'queen', r: 'rat', s: 'sun', t: 'top', u: 'umbrella', v: 'van', w: 'wolf', x: 'box', y: 'yak', z: 'zoo' };
      const botWord = words[word[word.length - 1]] || 'apple';
      settings.wordchain[chat] = botWord;
      saveSettings();
      await ctx.reply(`🔗 Tomar shobdo: *${word}*\nBot-er shobdo: *${botWord}*\n\nEbar *${botWord[botWord.length - 1].toUpperCase()}* diye shobdo dao: .wordchain <shobdo>`);
    },
  },
  {
    name: 'guess',
    aliases: [],
    category: 'Fun',
    desc: 'Number guessing khelo (1-10)',
    usage: '.guess 5',
    async run(ctx) {
      const n = parseInt((ctx.text || '').trim(), 10);
      const chat = ctx.jid;
      if (!settings.guess[chat]) settings.guess[chat] = Math.floor(Math.random() * 10) + 1;
      if (!n || n < 1 || n > 10) return ctx.reply('❓ 1 theke 10-er moddhe ekta number likho. Jemon: .guess 5');
      if (n === settings.guess[chat]) {
        settings.guess[chat] = Math.floor(Math.random() * 10) + 1;
        saveSettings();
        return ctx.reply(`🎉 Thik dhorecho! Number-ta *${n}*-i chilo!\nNotun number niyechi — abar .guess dao.`);
      }
      await ctx.reply(n < settings.guess[chat] ? '📈 Aro boro number try koro!' : '📉 Aro choto number try koro!');
    },
  },
  {
    name: 'truth',
    aliases: [],
    category: 'Fun',
    desc: 'Truth question dao',
    usage: '.truth',
    async run(ctx) {
      try {
        const d = await fetchJson('https://api.truthordarebot.xyz/v1/truth');
        await ctx.reply(`😇 *TRUTH*\n\n${d.question || 'Kono proshno pai nai.'}`);
      } catch (e) {
        await ctx.reply(`😇 *TRUTH*\n\n${pick(['Tomar sobcheye boro secret ki?', 'Tomar crush ke?', 'Kokhono mittha bolecho?'])}`);
      }
    },
  },
  {
    name: 'dare',
    aliases: [],
    category: 'Fun',
    desc: 'Dare dao',
    usage: '.dare',
    async run(ctx) {
      try {
        const d = await fetchJson('https://api.truthordarebot.xyz/v1/dare');
        await ctx.reply(`😈 *DARE*\n\n${d.question || 'Kono dare pai nai.'}`);
      } catch (e) {
        await ctx.reply(`😈 *DARE*\n\n${pick(['Ekhon ekta selfie pathao!', '10 bar jore haso!', 'Nijer naam ulta kore bolo!'])}`);
      }
    },
  },
  {
    name: 'riddle',
    aliases: [],
    category: 'Fun',
    desc: 'Dhadha dao',
    usage: '.riddle',
    async run(ctx) {
      try {
        const d = await fetchJson('https://riddles-api.vercel.app/random');
        await ctx.reply(`🧩 *DHADHA*\n\n${d.riddle}\n\n💡 Uttor: ||${d.answer}||`);
      } catch (e) {
        await ctx.reply('🧩 *DHADHA*\n\nKi jinis jeta tomar, kintu onno sobai tomar cheye beshi use kore?\n\n💡 Uttor: ||Tomar naam||');
      }
    },
  },
  {
    name: 'trivia',
    aliases: [],
    category: 'Fun',
    desc: 'Quiz question dao',
    usage: '.trivia',
    async run(ctx) {
      try {
        const d = await fetchJson('https://opentdb.com/api.php?amount=1&type=multiple');
        const q = (d.results || [])[0];
        if (!q) throw new Error('empty');
        const opts = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
        const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        await ctx.reply(`🧠 *TRIVIA* (${decode(q.category)})\n\n${decode(q.question)}\n\n${opts.map((o, i) => `${'ABCD'[i]}. ${decode(o)}`).join('\n')}\n\n✅ Uttor: *${decode(q.correct_answer)}*`);
      } catch (e) {
        await ctx.reply('❌ Quiz ante pari nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'ship',
    aliases: [],
    category: 'Fun',
    desc: 'Dui jon-er mil koto % dekho',
    usage: '.ship Atik Sonia',
    async run(ctx) {
      const parts = (ctx.text || '').trim().split(/\s+/);
      if (parts.length < 2) return ctx.reply('❓ Dui ta naam likho. Jemon: .ship Atik Sonia');
      const [a, b] = parts;
      const pct = hashPct((a + b).toLowerCase() + 'ship');
      const bar = '❤️'.repeat(Math.max(1, Math.round(pct / 20))) + '🤍'.repeat(Math.max(0, 5 - Math.round(pct / 20)));
      await ctx.reply(`💘 *SHIP*\n\n*${a}* ❤️ *${b}*\n\n${bar} *${pct}%*\n${pct > 70 ? '💍 Perfect jodi!' : pct > 40 ? '😊 Valo mil ache!' : '😅 Mil kom, try koro!'}`);
    },
  },
  {
    name: 'pickupline',
    aliases: ['flirt'],
    category: 'Fun',
    desc: 'Pick-up line dao',
    usage: '.pickupline',
    async run(ctx) {
      try {
        const d = await fetchJson('https://api.popcat.xyz/pickuplines');
        await ctx.reply(`😘 ${d.pickupline || d.line || 'Kono line pai nai.'}`);
      } catch (e) {
        await ctx.reply(`😘 ${pick(['Tumi ki WiFi? Karon tomar sathe connect hote chai!', 'Tumi ki Google? Karon tomar moddhe sob kichu khuje pai!', 'Tumi ki charger? Karon tomar kache aslei energy pai!'])}`);
      }
    },
  },
  {
    name: 'compliment',
    aliases: ['tareef', 'goodword'],
    category: 'Fun',
    desc: 'Ekta sundor kotha dao',
    usage: '.compliment',
    async run(ctx) {
      try {
        const d = await fetchJson('https://complimentr.com/api');
        await ctx.reply(`🌸 ${d.compliment || 'Tumi onek valo manush!'}`);
      } catch (e) {
        await ctx.reply(`🌸 ${pick(['Tumar hasi-ta onek sundor!', 'Tumi ajke onek smart lagcho!', 'Tomar sathe kotha bole valo lage!'])}`);
      }
    },
  },
  {
    name: 'roast',
    aliases: ['insult'],
    category: 'Fun',
    desc: 'Moja kore roast koro',
    usage: '.roast',
    async run(ctx) {
      try {
        const d = await fetchJson('https://evilinsult.com/generate_insult.php?lang=en&type=json');
        await ctx.reply(`🔥 ${d.insult || 'Tumi eto slow je internet-o tomar jonno wait kore!'}`);
      } catch (e) {
        await ctx.reply(`🔥 ${pick(['Tumi eto slow je internet-o tomar jonno wait kore!', 'Tomar brain WiFi-er moto — majhe majhe disconnect hoy!', 'Tumi eto boring je ghum-o tomar kache aste chay na!'])}`);
      }
    },
  },
  {
    name: 'fact',
    aliases: ['randomfact', 'sciencefact'],
    category: 'Fun',
    desc: 'Ekta moja-r fact dao',
    usage: '.fact',
    async run(ctx) {
      try {
        const d = await fetchJson('https://uselessfacts.jsph.pl/api/v2/facts/random');
        await ctx.reply(`💡 *FACT*\n\n${d.text}`);
      } catch (e) {
        await ctx.reply('💡 *FACT*\n\nModhu kokhono noshto hoy na — 3000 bochor purono modhu-o khawa jay!');
      }
    },
  },
  {
    name: 'catfact',
    aliases: [],
    category: 'Fun',
    desc: 'Biral niye fact dao',
    usage: '.catfact',
    async run(ctx) {
      try {
        const d = await fetchJson('https://catfact.ninja/fact');
        await ctx.reply(`🐱 *CAT FACT*\n\n${d.fact}`);
      } catch (e) {
        await ctx.reply('🐱 *CAT FACT*\n\nBiral dine 16 ghonta ghumay!');
      }
    },
  },
  {
    name: 'dogfact',
    aliases: [],
    category: 'Fun',
    desc: 'Kukur niye fact dao',
    usage: '.dogfact',
    async run(ctx) {
      try {
        const d = await fetchJson('https://dogapi.dog/api/v2/facts');
        const f = d && d.data && d.data[0] && d.data[0].attributes && d.data[0].attributes.body;
        await ctx.reply(`🐶 *DOG FACT*\n\n${f || 'Kukur manusher sobcheye bisshosto bondhu!'}`);
      } catch (e) {
        await ctx.reply('🐶 *DOG FACT*\n\nKukur-er nak-er print manusher anguler chaper moto unique!');
      }
    },
  },
  {
    name: 'dadjoke',
    aliases: ['dadkjoke'],
    category: 'Fun',
    desc: 'Dad joke dao',
    usage: '.dadjoke',
    async run(ctx) {
      try {
        const d = await fetchJson('https://icanhazdadjoke.com/', { Accept: 'application/json', 'User-Agent': 'MR-AI-MD' });
        await ctx.reply(`😂 ${d.joke}`);
      } catch (e) {
        await ctx.reply('😂 Ami computer-ke bolchi... se amake "Ctrl" kore dilo!');
      }
    },
  },
  {
    name: 'advice',
    aliases: [],
    category: 'Fun',
    desc: 'Ekta upodesh dao',
    usage: '.advice',
    async run(ctx) {
      try {
        const d = await fetchJson('https://api.adviceslip.com/advice');
        await ctx.reply(`💡 *ADVICE*\n\n${d.slip.advice}`);
      } catch (e) {
        await ctx.reply('💡 *ADVICE*\n\nChoto choto step-e boro kaj hoy. Ajke ekta choto kaj shesh koro!');
      }
    },
  },
  {
    name: 'meme',
    aliases: [],
    category: 'Fun',
    desc: 'Ekta random meme dao',
    usage: '.meme',
    async run(ctx) {
      try {
        const d = await fetchJson('https://meme-api.com/gimme');
        if (!d.url) throw new Error('empty');
        await ctx.sock.sendMessage(ctx.jid, { image: { url: d.url }, caption: `😂 *${d.title || 'Meme'}*` }, { quoted: ctx.msg });
      } catch (e) {
        await ctx.reply('❌ Meme ante pari nai. Ektu por abar try koro.');
      }
    },
  },
  {
    name: 'poem',
    aliases: [],
    category: 'Fun',
    desc: 'Ekta kobita dao',
    usage: '.poem',
    async run(ctx) {
      try {
        const d = await fetchJson('https://poetrydb.org/random');
        const p = (Array.isArray(d) ? d[0] : d);
        if (!p || !p.lines) throw new Error('empty');
        await ctx.reply(`📜 *${p.title}* — ${p.author}\n\n${p.lines.slice(0, 12).join('\n')}`);
      } catch (e) {
        await ctx.reply('📜 *Kobita*\n\nAlo jole, andhar jay,\nMoner kotha mukhe chay.');
      }
    },
  },
];
