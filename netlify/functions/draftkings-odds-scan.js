const {
  draftKingsOddsForEvent,
  draftKingsRow,
  espnSchedule,
  flattenScheduleGames,
  jsonResponse,
  parseWindowAssignmentFile,
} = require("./scan-utils");

async function mapLimit(items, limit, worker) {
  const results = [];
  let index = 0;
  async function run() {
    while (index < items.length) {
      const current = items[index++];
      results.push(await worker(current));
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return jsonResponse(204, {});
  try {
    const payload = await espnSchedule();
    const scheduleGames = flattenScheduleGames(payload).filter((game) => game.eventId);
    const rows = await mapLimit(scheduleGames, 12, async (game) => {
      try {
        const odds = await draftKingsOddsForEvent(game.eventId);
        return draftKingsRow(game, odds);
      } catch {
        return null;
      }
    });
    const games = rows.filter(Boolean);
    return jsonResponse(200, {
      fetchedAt: new Date().toISOString(),
      source: "ESPN core DraftKings odds",
      sourceUrl: "https://www.espn.com/nfl/odds",
      games,
    });
  } catch (error) {
    try {
      const cached = parseWindowAssignmentFile("draftkings-odds.js", "DRAFTKINGS_ODDS");
      return jsonResponse(200, {
        ...cached,
        fetchedAt: cached.fetchedAt || new Date().toISOString(),
        fromCache: true,
        refreshError: error.message,
      });
    } catch (cacheError) {
      return jsonResponse(502, {
        fetchedAt: new Date().toISOString(),
        fromCache: true,
        refreshError: `${error.message}; cache unavailable: ${cacheError.message}`,
        games: [],
      });
    }
  }
};
