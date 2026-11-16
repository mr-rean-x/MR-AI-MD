# MR AI MD 🤖

Ekdom nijer hate lekha WhatsApp bot — **Baileys** library diye banano.
Kono ready-made bot (REAN MD, Shadow MD ba onno kono) er code ekhane nai.
Sob command ei repo-r nijer code.

## Command list (22 ta)

| Category | Command | Kaj |
|---|---|---|
| General | `.menu` | Sob command-er list |
| General | `.ping` | Bot kotota fast |
| General | `.alive` | Bot online ache kina |
| General | `.owner` | Owner-er number |
| General | `.info` | Bot-er bepare |
| Fun | `.joke` | Moja-r joke |
| Fun | `.quote` | Sundor quote |
| Fun | `.8ball <proshno>` | Moja kore uttor dey |
| Fun | `.coin` / `.dice` | Coin toss / dice |
| Tools | `.sticker` | Chobi/video theke sticker |
| Tools | `.toimg` | Sticker theke chobi |
| Tools | `.wiki <bishoy>` | Wikipedia theke khuje dey |
| Tools | `.weather <shohor>` | Abohawa janai |
| Tools | `.ai <proshno>` | AI-er sathe kotha (Groq key lage) |
| Download | `.play <gan>` | YouTube theke gan pathai (audio) |
| Group | `.tagall` | Sobaike tag kore |
| Group | `.kick` / `.add` | Member ber kore / add kore |
| Group | `.promote` / `.demote` | Admin banai / admin pod kate |
| Group | `.groupinfo` | Group-er bepare janai |

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
| `PREFIX` | Command-er chinno (na bosale `.`) |
| `GROQ_API_KEY` | Sudhu `.ai` command-er jonno. [console.groq.com](https://console.groq.com) theke free key neya jay. Na bosale baki sob command cholbe, sudhu `.ai` cholbe na. |

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
```

## Sotorkota
- **Secondary number diye pair koro** — main number diye bot chalale WhatsApp kokhono kokhono number-ta block korte pare.
- Bot-ke group-e admin banale tobei `.kick/.add/.promote` cholbe.
- `.play` gan 10 minute ar 15MB-er vitore hote hobe.
- Kono token/key code-e lekha nai — sob Railway Variables-e thake.

## File structure
```
index.js            — connect + pairing + message handler + status website
config.js           — sob setting (env theke)
lib/loader.js       — command load kore
lib/helpers.js      — media download + sticker banano
commands/general.js — menu, ping, alive, owner, info
commands/fun.js     — joke, quote, 8ball, coin, dice
commands/tools.js   — sticker, toimg, wiki, weather, ai
commands/download.js— play (YouTube audio)
commands/group.js   — tagall, kick, add, promote, demote, groupinfo
```
