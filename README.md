# MR AI MD 🤖

Ekdom nijer hate lekha WhatsApp bot — **nijer Baileys fork** (MR REAN Baileys, v6.7.24-mr.1) diye banano.
Kono ready-made bot (REAN MD, Shadow MD ba onno kono) er code ekhane nai.
Sob command ei repo-r nijer code.

## Nijer Baileys fork 🔧

Bot-ta chole **mr-rean-baileys** diye — Baileys-er nijer fork:
- 🔗 Repo: https://github.com/mr-rean-x/Baileys
- 📦 Package: `mr-rean-baileys` v6.7.24-mr.1 (v6.7.24 base)
- 🏷️ Default browser label: `MR AI MD`
- Install: `npm install github:mr-rean-x/Baileys`

## Command list (316 ta unique, 546 ta naam+alias, 10 category)

| Category | Command-er dhoron | Koyta |
|---|---|---|
| General | `.menu` `.ping` `.alive` `.owner` `.info` | 5 |
| AI | `.ai` `.gpt` `.groq` `.llama` `.mistral` `.deepseek` `.gemini` `.text2img` `.toanime` `.cartoon` | 10 |
| Search | `.google` `.image` `.define` `.lyrics` `.news` `.recipe` `.github` `.iplookup` `.myip` `.animesearch` `.tiktokstalk` | 11 |
| Download | `.play` `.ytmp4` `.tiktok` | 3 |
| Tools | `.sticker` `.toimg` `.wiki` `.weather` `.ssweb` `.qr` `.readqr` `.tourl` `.tomp3` `.tomp4` `.tts` `.tovn` `.enhance` `.upscale` `.dehaze` `.blur` `.take` `.emoji` `.shortlink` `.translate` `.currency` `.calc` `.quran` `.prayertime` `.wallpaper` `.getpp` `.contact` `.whoami` `.read` `.jid` | 30 |
| Fun | `.joke` `.quote` `.8ball` `.coin` `.dice` `.slot` `.tictactoe` `.rps` `.wordchain` `.guess` `.truth` `.dare` `.riddle` `.trivia` `.ship` `.pickupline` `.compliment` `.roast` `.fact` `.catfact` `.dogfact` `.dadjoke` `.advice` `.meme` `.poem` + 7 ta fun check (`.gaycheck` `.coolcheck` ...) | 32 |
| Anime | `.waifu` `.neko` `.husbu` `.maid` + 30 ta reaction gif (`.hug` `.kiss` `.slap` `.pat` ...) | 34 |
| Logo | `.logo` + 17 ta style (`.neontext` `.glitchtext` `.3dtext` `.goldtext` ...) + `.gfx1`–`.gfx11` | 29 |
| Group | `.tagall` `.hidetag` `.kick` `.add` `.promote` `.demote` `.groupinfo` `.setname` `.setdesc` `.setppgc` `.linkgc` `.resetlink` `.listadmin` `.close` `.open` `.closetime` `.opentime` `.leave` `.creategroup` `.join` `.antilink` `.welcome` `.goodbye` `.warn` `.resetwarn` `.poll` `.delete` `.pin` | 28 |
| Owner | `.addowner` `.delowner` `.addprem` `.delprem` `.listprem` `.setppbot` `.setbio` `.restart` `.public` `.self` `.autoread` `.setprefix` `.afk` `.block` `.unblock` `.debug` `.test` `.cleartmp` `.poststatus` `.react` `.runtime` `.script` | 23 |

Sob command VM-e test kora hoyeche (live API soho). Prottek command-er usage dekhte `.menu` likho.

### REAN MD-er command niye ekta sotyi kotha
REAN MD-te 608 ta command chilo — sobgulo ekhane ana hoy nai, karon:
- **Kichu command khotikor:** `ccgen` (fake card banano), `cnicinfo` / `siminfo` (onner personal info), `broadcast` (mass message spam), `kickall` / `promoteall` (ekbare sobai-ke kick) — egulo banano hoy nai.
- **Kichu command-er API more geche:** logo/text API, FB/IG downloader — egulor bodle kaj-kora free API diye notun kore banano hoyeche (Pollinations, tikwm, Wallhaven...).
- **Duplicate:** `menu2` / `allmenu` / `listmenu` / `mymenu` — sob `.menu`-er alias hisebe ache.

## Bot-er vitore ki ki bosano jay (config.js)

| Jinish | Kothay bosabe |
|---|---|
| Owner number | Railway Variable `OWNER_NUMBER` (jemon: `8801956501630`) — ar `.addowner` diye aro owner jog kora jay |
| Bot-er chobi | Railway Variable `BOT_PHOTO` — image URL ba `./assets/bot.jpg`. Menu ar `.alive`-e asbe |
| Bot-er naam | `BOT_NAME` |
| Prefix | `PREFIX` (ba `.setprefix` diye chat thekei bodlano jay) |
| AI key | `GROQ_API_KEY` (.ai/.gpt/.llama/.mistral/.deepseek) ar `GEMINI_API_KEY` (.gemini) |
| Pair number | `PAIR_NUMBER` (secondary number use kora valo) |

Aro setting (chat thekei): `.antilink on/off`, `.welcome on/off`, `.goodbye on/off`, `.public` / `.self`, `.autoread on/off`, `.afk <karon>` — egulo `setting.json`-e save thake.

## Railway-te deploy (A to Z)

### 1. Repo banano
- GitHub-e repo-ta fork koro, ba zip theke notun repo baniye push koro.
- Repo-r naam jekono hote pare, jemon `MR-AI-MD`.

### 2. Railway project
1. [railway.com](https://railway.com) khule **New Project → Deploy from GitHub repo** → repo-ta select koro.
2. Deploy sesh hole **Service → Variables**-e jao, ar nicher gulo bosao:

| Variable | Ki bosabe |
|---|---|
| `OWNER_NUMBER` | Tomar number, country code soho, + chara. Jemon: `8801956501630` |
| `PAIR_NUMBER` | Je number diye bot pair hobe (secondary number use kora valo). Jemon: `8801XXXXXXXXX` |
| `BOT_NAME` | Bot-er naam (na bosale `MR AI MD`) |
| `BOT_PHOTO` | Bot-er chobi-r image URL (na bosale menu sudhu text-e asbe) |
| `PREFIX` | Command-er chinno (na bosale `.`) |
| `GROQ_API_KEY` | `.ai` / `.gpt` / `.llama` / `.mistral` / `.deepseek` command-er jonno. [console.groq.com](https://console.groq.com) theke free key neya jay. Na bosale baki sob command cholbe, sudhu AI command gulo cholbe na. |
| `GEMINI_API_KEY` | Sudhu `.gemini` command-er jonno. [aistudio.google.com](https://aistudio.google.com) theke free key neya jay. |

3. **Deploy / Redeploy** dao.

### 3. Pair kora (prothombar)
1. Railway **Service → Settings → Networking → Generate Domain** — ekta public link pabe.
2. Oi link-ta browser-e kholo. Status page-e **pairing code** dekhabe (8 digit).
3. Phone-er WhatsApp khule: **Linked devices → Link a device → Link with phone number instead** → number ar code bosao.
4. Pair hoye gele page-e **"Bot connected"** dekhabe. Tarpor theke bot oi number diye cholbe.
5. `PAIR_NUMBER` khali rakhle pairing code asbe na — tokhon Railway **Logs**-e QR code asbe, seta scan korte hobe.

### 4. Session bachiye rakha (jaruri!)
Railway redeploy korle session muche jete pare. Tai:
- **Service → Settings → Volumes → Add Volume**, Mount Path: `/app/session`
- Eita korle ekbar pair korle ar pair korte hobe na (redeploy-er poro session thakbe).

## PC-te chalano (test korar jonno)
```bash
npm install
cp .env.example .env
# .env-e OWNER_NUMBER ar PAIR_NUMBER bosao
node index.js
# Sob command test korte:
node test_all.js
```

## Sotorkota
- **Secondary number diye pair koro** — main number diye bot chalale WhatsApp kokhono kokhono number-ta block korte pare.
- Bot-ke group-e admin banale tobei `.kick/.add/.promote` cholbe.
- `.play` gan 10 minute ar 15MB-er vitore hote hobe.
- Kono token/key code-e lekha nai — sob Railway Variables-e thake.

## File structure
```
index.js            — connect + pairing + message handler + status website
config.js           — sob setting (env theke) — owner number, bot photo ekhane
lib/loader.js       — command load kore
lib/helpers.js      — media download + sticker + ffmpeg convert
lib/settings.js     — setting.json save kore (prefix, antilink, welcome, warn, afk...)
commands/general.js — menu, ping, alive, owner, info
commands/ai.js      — gpt, groq, llama, mistral, deepseek, gemini, text2img...
commands/search.js  — google, image, define, lyrics, news, recipe, github...
commands/download.js— play (YouTube audio)
commands/media.js   — ytmp4, tiktok, ssweb, qr, tourl, tomp3, tts, enhance...
commands/fun.js     — joke, quote, 8ball, coin, dice
commands/fun2.js    — slot, tictactoe, rps, truth, dare, ship, meme, poem...
commands/anime.js   — waifu, neko + 30 ta reaction gif
commands/logo.js    — logo + style + gfx1-11
commands/tools.js   — sticker, toimg, wiki, weather
commands/group.js   — tagall, kick, add, promote, demote, groupinfo
commands/group2.js  — hidetag, setname, antilink, welcome, warn, poll...
commands/owner.js   — addowner, setppbot, restart, public, self, setprefix...
commands/utility2.js— shortlink, translate, currency, calc, quran, wallpaper
test_all.js         — sob command-er test (VM-e chalano jay)
```
