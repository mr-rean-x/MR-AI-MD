// Command loader — commands/ folder-er prottek file theke command ney.
// Prottek command file ekta array export kore:
//   { name, aliases, category, desc, usage, ownerOnly, adminOnly, groupOnly, run(ctx) }
const fs = require('fs');
const path = require('path');

let registry = null;

function loadCommands(dir) {
  const map = new Map();
  const absDir = path.resolve(dir);
  if (!fs.existsSync(absDir)) return map;
  for (const file of fs.readdirSync(absDir).filter((f) => f.endsWith('.js'))) {
    const list = require(path.join(absDir, file));
    if (!Array.isArray(list)) continue;
    for (const cmd of list) {
      if (!cmd || !cmd.name || typeof cmd.run !== 'function') continue;
      const names = [cmd.name, ...((cmd.aliases || []))];
      for (const n of names) {
        const key = String(n).toLowerCase();
        if (map.has(key)) {
          console.log(`[loader] Duplicate command naam: ${key} (${file}) — skip kora hoise.`);
          continue;
        }
        map.set(key, cmd);
      }
    }
  }
  registry = map;
  return map;
}

// Menu command-er jonno — sob unique command-er list
function getAllCommands() {
  if (!registry) return [];
  const seen = new Set();
  const out = [];
  for (const cmd of registry.values()) {
    if (seen.has(cmd.name)) continue;
    seen.add(cmd.name);
    out.push(cmd);
  }
  return out;
}

module.exports = { loadCommands, getAllCommands };
