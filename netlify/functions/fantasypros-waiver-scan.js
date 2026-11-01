const { scanFantasyProsWaivers } = require("../../waiver-scan.cjs");
const { jsonResponse } = require("./scan-utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return jsonResponse(204, {});
  try {
    const payload = await scanFantasyProsWaivers(event.queryStringParameters?.week);
    return jsonResponse(200, payload);
  } catch (error) {
    return jsonResponse(502, { error: error.message });
  }
};
