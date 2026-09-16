const { espnFullSeasonSchedule, jsonResponse } = require("./scan-utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return jsonResponse(204, {});
  try {
    const scan = await espnFullSeasonSchedule();
    return jsonResponse(200, {
      fetchedAt: new Date().toISOString(),
      source: "ESPN schedule results",
      sourceUrl: "https://www.espn.com/nfl/schedule",
      games: scan.games,
      requestedWeeks: scan.requestedWeeks,
      loadedWeeks: scan.loadedWeeks,
      failedWeeks: scan.failedWeeks,
    });
  } catch (error) {
    return jsonResponse(502, {
      fetchedAt: new Date().toISOString(),
      fromCache: true,
      refreshError: error.message,
      source: "ESPN schedule results",
      games: [],
    });
  }
};
