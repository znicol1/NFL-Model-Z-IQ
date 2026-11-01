const fs = require("fs");
const path = require("path");

const season = Number(process.env.ESPN_KICKING_SEASON || new Date().getFullYear());
const sourceUrl = `https://www.espn.com/nfl/stats/player/_/view/special/stat/kicking/season/${season}`;
const outPath = path.join(__dirname, "espn-kicking-stats.js");

function textFromHtml(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function tableRows(html) {
  const body = html.match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/i)?.[1] || "";
  return [...body.matchAll(/<tr\b[^>]*data-idx="(\d+)"[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((match) => ({ index: Number(match[1]), html: match[2], cells: [...match[2].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => textFromHtml(cell[1])) }));
}

function madeAttempts(value) {
  const match = String(value || "").match(/^(\d+)\s*-\s*(\d+)$/);
  return match ? { made: Number(match[1]), attempts: Number(match[2]) } : null;
}

function parseKickingHtml(html) {
  const tables = [...String(html || "").matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)].map((match) => match[0]);
  const namesTable = tables.find((table) => table.includes("athleteCell__teamAbbrev"));
  const statsTable = tables.find((table) => table.includes("fieldGoalsMade50") && table.includes("extraPointPct"));
  if (!namesTable || !statsTable) throw new Error("ESPN kicking names or statistics table was not found");
  const stats = new Map(tableRows(statsTable).map((row) => [row.index, row.cells]));
  const players = tableRows(namesTable).map((row) => {
    const player = row.html.match(/<a\b[^>]*data-player-uid="[^"]*~a:(\d+)"[^>]*>([^<]+)<\/a>/i);
    const team = row.html.match(/athleteCell__teamAbbrev[^>]*>([^<]+)</i);
    const cells = stats.get(row.index) || [];
    if (!player || !team || cells[0] !== "PK" || cells.length < 14) return null;
    const gamesPlayed = Number(cells[1]);
    const fieldGoalsMade = Number(cells[2]);
    const fieldGoalAttempts = Number(cells[3]);
    const long = madeAttempts(cells[10]);
    const extraPointsMade = Number(cells[11]);
    const extraPointAttempts = Number(cells[12]);
    if (![gamesPlayed, fieldGoalsMade, fieldGoalAttempts, extraPointsMade, extraPointAttempts].every(Number.isFinite) || !long) return null;
    return {
      player: textFromHtml(player[2]), espnId: player[1], teamAbbrev: team[1].trim(), gamesPlayed,
      fieldGoalsMade, fieldGoalAttempts,
      fgmPerGame: gamesPlayed ? Number((fieldGoalsMade / gamesPlayed).toFixed(3)) : null,
      fgaPerGame: gamesPlayed ? Number((fieldGoalAttempts / gamesPlayed).toFixed(3)) : null,
      fieldGoalPct: fieldGoalAttempts ? Number((100 * fieldGoalsMade / fieldGoalAttempts).toFixed(1)) : null,
      longMade: long.made, longAttempts: long.attempts,
      longPct: long.attempts ? Number((100 * long.made / long.attempts).toFixed(1)) : null,
      extraPointsMade, extraPointAttempts,
      xpPct: extraPointAttempts ? Number((100 * extraPointsMade / extraPointAttempts).toFixed(1)) : null,
    };
  }).filter(Boolean);
  if (players.length < 20) throw new Error(`ESPN kicking scan found only ${players.length} kickers; existing cache was preserved`);
  return players;
}

async function refreshKicking() {
  const response = await fetch(sourceUrl, { headers: { "user-agent": "Mozilla/5.0 NFL Model Z local stats scanner", accept: "text/html" } });
  if (!response.ok) throw new Error(`ESPN kicking page returned HTTP ${response.status}`);
  const players = parseKickingHtml(await response.text());
  const payload = { fetchedAt: new Date().toISOString(), season, source: sourceUrl, players };
  fs.writeFileSync(outPath, `window.ESPN_KICKING_STATS = ${JSON.stringify(payload, null, 2)};\n`);
  return payload;
}

if (require.main === module) refreshKicking()
  .then((payload) => console.log(`ESPN kicking ${payload.season}: ${payload.players.length} players`))
  .catch((error) => { console.error(error); process.exitCode = 1; });

module.exports = { parseKickingHtml, refreshKicking, sourceUrl };
