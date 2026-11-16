// Fun command — joke, quote, 8ball, coin, dice.
// Sob joke/quote ekhanei lekha (local list), kono API lage na.
const JOKES = [
  'Teacher: "Tumi homework koro nai keno?"\nStudent: "Sir, WiFi chilo na."\nTeacher: "Homework-er sathe WiFi-r ki somporko?"\nStudent: "Google-e khujchilam, net chilo na!"',
  'Ekdin ekta computer dokane gelo... karon or "mouse" kharap chilo! 🐭',
  'Ami ekbar gym-e gelam... tarpor theke ar jai nai. Gym-tao amake miss kore na.',
  'Bondhu: "Tor phone-er battery koto?"\nAmi: "1%."\nBondhu: "Charger dao?"\nAmi: "Na, eita ekhon amar personality."',
  'Math teacher: "X-er maan koto?"\nAmi: "Sir, X to amar ex — or maan ami ar ber korte chai na."',
  'Ami diet-e achi — sudhu sei khabar khai jeta amar pocket-er budget-e ashe. 😅',
  'WiFi password chailei manusher asol roop ber hoye jay!',
  'Ami sokale 5-tay uthi... tarpor abar ghumai. Discipline bole ekta jinish ache!',
  'Phone-er storage full? Tension nio na — memory full holeo manusher mon khali thake.',
  'Exam-er ager raat: "Eibar porashona korboi." Exam-er porer din: "Abaro same kotha."',
];

const QUOTES = [
  '"Choto choto step-ei boro sopno puron hoy."',
  '"Tumi jeta khujcho, seta tomar vitorei ache."',
  '"Haar manle cholbe na — ekbar na parle arekbar try koro."',
  '"Ajker kosto kalker sokti."',
  '"Sopno dekho, kintu sopno puron-er kaj-tao koro."',
  '"Somoy sobar jonno soman — je use korte jane, sei jite."',
  '"Bhalo kajer kono shortcut nai."',
  '"Tumi nijei tomar sobcheye boro competition."',
];

const EIGHT_BALL = [
  'Ha, nischit! ✅', 'Mone hoy ha 🙂', 'Ekdom thik!', 'Hote pare... 🤔',
  'Akhon bola muskil.', 'Na, mone hoy na. ❌', 'Ekdomi na!', 'Abar jiggesh koro pore.',
  'Taqdeer tomar sathe ache! 🍀', 'Eita niye vabte hobe...',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

module.exports = [
  {
    name: 'joke',
    aliases: ['funny'],
    category: 'Fun',
    desc: 'Ekta moja-r joke sunai',
    usage: '.joke',
    async run(ctx) { await ctx.reply('😂 ' + pick(JOKES)); },
  },
  {
    name: 'quote',
    aliases: ['motivation'],
    category: 'Fun',
    desc: 'Ekta sundor quote dey',
    usage: '.quote',
    async run(ctx) { await ctx.reply('💭 ' + pick(QUOTES)); },
  },
  {
    name: '8ball',
    aliases: ['ask'],
    category: 'Fun',
    desc: 'Tomar proshner uttor dey (moja kore)',
    usage: '.8ball ami ki exam-e pass korbo?',
    async run(ctx) {
      if (!ctx.text) return ctx.reply('❓ Ekta proshno likho. Jemon: .8ball ami ki ajke lucky?');
      await ctx.reply(`🎱 Proshno: ${ctx.text}\nUttor: *${pick(EIGHT_BALL)}*`);
    },
  },
  {
    name: 'coin',
    aliases: ['flip'],
    category: 'Fun',
    desc: 'Coin toss kore — Head na Tail',
    usage: '.coin',
    async run(ctx) {
      const r = Math.random() < 0.5 ? 'Head 👑' : 'Tail 🪙';
      await ctx.reply(`🪙 Coin toss: *${r}*`);
    },
  },
  {
    name: 'dice',
    aliases: ['roll'],
    category: 'Fun',
    desc: 'Dice roll kore (1-6)',
    usage: '.dice',
    async run(ctx) {
      const n = Math.floor(Math.random() * 6) + 1;
      await ctx.reply(`🎲 Dice: *${n}*`);
    },
  },
];
