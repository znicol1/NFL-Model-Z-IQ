const { jsonResponse, parseWindowAssignmentFile } = require("./scan-utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return jsonResponse(204, {});
  try {
    const cached = parseWindowAssignmentFile("espn-injury-check-results.js", "ESPN_INJURY_CHECK");
    return jsonResponse(200, {
      ...cached,
      fromCache: true,
      refreshError: "Live ESPN injury parsing is not available in this static deploy, so the latest bundled injury scan was loaded.",
    });
  } catch (error) {
    return jsonResponse(502, {
      fetchedAt: new Date().toISOString(),
      fromCache: true,
      refreshError: error.message,
      results: [],
    });
  }
};
