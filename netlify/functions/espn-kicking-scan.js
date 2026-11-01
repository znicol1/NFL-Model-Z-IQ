const { parseKickingHtml } = require("../../espn-kicking-scan.cjs");
const { jsonResponse } = require("./scan-utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return jsonResponse(204, {});
  const season = 2026;
  const source = `https://www.espn.com/nfl/stats/player/_/view/special/stat/kicking/season/${season}`;
  try {
    const response = await fetch(source, { headers: { "user-agent": "Mozilla/5.0 NFL Model Z stats scanner", accept: "text/html" } });
    if (!response.ok) throw new Error(`ESPN kicking page returned HTTP ${response.status}`);
    return jsonResponse(200, { fetchedAt: new Date().toISOString(), season, source, players: parseKickingHtml(await response.text()) });
  } catch (error) {
    return jsonResponse(502, { fetchedAt: new Date().toISOString(), season, source, refreshError: error.message, players: [] });
  }
};
