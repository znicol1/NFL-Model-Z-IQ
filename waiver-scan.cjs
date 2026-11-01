const SOURCE_URL = "https://www.fantasypros.com/nfl/rankings/waiver-wire-half-point-ppr-overall.php";

async function scanFantasyProsWaivers(week) {
  const selectedWeek = Number(week);
  if (!Number.isInteger(selectedWeek) || selectedWeek < 1 || selectedWeek > 18) throw new Error("Choose a regular-season week from 1 to 18.");
  const url = `${SOURCE_URL}?week=${selectedWeek}`;
  const response = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 NFL Model Z ownership scanner", accept: "text/html,application/xhtml+xml" },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`FantasyPros returned HTTP ${response.status}.`);
  const html = await response.text();
  const match = html.match(/var\s+ecrData\s*=\s*(\{[\s\S]*?\});/);
  if (!match) throw new Error("FantasyPros did not expose its waiver ranking data.");
  const data = JSON.parse(match[1]);
  if (Number(data.week) !== selectedWeek || !Array.isArray(data.players)) throw new Error("FantasyPros returned a different week or no player list.");
  const players = data.players.filter((row) => row.player_owned_avg !== null && row.player_owned_avg !== undefined && row.player_owned_avg !== "" && row.player_owned_avg !== "-").map((row) => ({
    name: String(row.player_name || "").trim(),
    team: String(row.player_team_id || "").trim().toUpperCase(),
    position: String(row.player_position_id || row.player_positions || "").trim().toUpperCase(),
    percent: Number(row.player_owned_avg),
  })).filter((row) => row.name && row.team && Number.isFinite(row.percent) && row.percent >= 0 && row.percent <= 100);
  if (!players.length) throw new Error("FantasyPros returned no usable ownership values.");
  return { source: SOURCE_URL, url, year: Number(data.year), week: selectedWeek, fetchedAt: new Date().toISOString(), players };
}

module.exports = { scanFantasyProsWaivers };
