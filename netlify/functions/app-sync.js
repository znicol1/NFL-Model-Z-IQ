const { getStore } = require("@netlify/blobs");

const ADMIN_PASSWORD = process.env.NFLZ_ADMIN_PASSWORD || process.env.NFLZ_SYNC_TOKEN || "Flagg,cooper32";
const STORE_NAME = "nfl-model-z-sync";
const STATE_KEY = "main";

const headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, OPTIONS",
  "access-control-allow-headers": "content-type, x-nflz-sync-token",
  "cache-control": "no-store",
  "content-type": "application/json",
};

function response(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

function authorized(event) {
  const token = event.headers["x-nflz-sync-token"] || event.headers["X-Nflz-Sync-Token"] || "";
  return String(token) === String(ADMIN_PASSWORD);
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return response(204, {});

  const store = getStore(STORE_NAME);

  if (event.httpMethod === "GET") {
    const saved = await store.get(STATE_KEY, { type: "json" });
    return response(200, saved || {
      version: 1,
      updatedAt: "",
      originId: "",
      data: {},
    });
  }

  if (event.httpMethod !== "POST" && event.httpMethod !== "PUT") {
    return response(405, { error: "Method not allowed" });
  }

  if (!authorized(event)) {
    return response(401, { error: "Admin sync token required" });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return response(400, { error: "Invalid JSON body" });
  }

  if (!payload || typeof payload !== "object" || !payload.data || typeof payload.data !== "object") {
    return response(400, { error: "Sync payload must include a data object" });
  }

  const current = await store.get(STATE_KEY, { type: "json" });
  const next = {
    version: 1,
    updatedAt: payload.updatedAt || new Date().toISOString(),
    originId: payload.originId || "",
    data: payload.data,
    savedAt: new Date().toISOString(),
    previousUpdatedAt: current?.updatedAt || "",
  };

  await store.setJSON(STATE_KEY, next);
  return response(200, next);
};
