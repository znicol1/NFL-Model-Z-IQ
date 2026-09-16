const fs = require("fs");
const path = require("path");
const { jsonResponse, parseWindowAssignmentFile } = require("./scan-utils");

const ESPN_INJURIES_URL = "https://www.espn.com/nfl/injuries";
const excludedPlayerPositions = new Set(["K", "P", "PK", "LS", "KICKER", "PUNTER", "LONG SNAPPER"]);
const teamAliases = {
  "Los Angeles Chargers": "LA Chargers",
  "Los Angeles Rams": "LA Rams",
};

function normalizeTeamName(name) {
  const value = String(name || "").trim();
  return teamAliases[value] || value;
}

function cleanPlayerName(name) {
  return String(name || "")
    .replace(/\s*\(R\)\s*/g, " ")
    .replace(/\b(Jr\.?|Sr\.?|II|III|IV|V)\b/gi, "")
    .replace(/[^a-zA-Z' -]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function playerKey(player) {
  return `${player.player}__${player.team}__${player.position}`;
}

function readAppData() {
  const candidates = [
    path.join(process.cwd(), "data.json"),
    path.join(__dirname, "..", "..", "data.json"),
    path.join(__dirname, "data.json"),
  ];
  const filePath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!filePath) throw new Error("data.json not found in function bundle");
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function excelDateToDate(serial) {
  return new Date(Math.round((Number(serial) - 25569) * 86400 * 1000));
}

function parseMonthDay(value, seasonYear = 2026) {
  const match = String(value || "").match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+(\d{1,2})\b/i);
  if (!match) return null;
  const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(match[1].slice(0, 3).toLowerCase());
  const year = month <= 2 ? seasonYear + 1 : seasonYear;
  return new Date(Date.UTC(year, month, Number(match[2])));
}

function weekForDate(date, schedule) {
  if (!date) return "";
  const weeks = [...new Map((schedule || []).map((game) => [game.week, excelDateToDate(game.date)])).entries()]
    .filter(([, weekDate]) => weekDate instanceof Date && !Number.isNaN(weekDate.valueOf()))
    .sort((a, b) => a[1] - b[1]);
  const found = weeks.find(([, weekDate]) => date <= new Date(weekDate.getTime() + 6 * 86400 * 1000));
  return found ? String(found[0]) : "";
}

function currentInjuryReviewWeek(schedule) {
  const now = new Date();
  const weeks = [...new Map((schedule || []).map((game) => [game.week, excelDateToDate(game.date)])).entries()]
    .filter(([, weekDate]) => weekDate instanceof Date && !Number.isNaN(weekDate.valueOf()))
    .sort((a, b) => a[1] - b[1]);
  const found = weeks.find(([, weekDate]) => now <= new Date(weekDate.getTime() + 6 * 86400 * 1000));
  const week = found ? String(found[0]) : "";
  return week === "Pre0" ? "Pre1" : week;
}

function extractJsonArray(html, key) {
  const marker = `"${key}":[`;
  const start = html.indexOf(marker);
  if (start < 0) return [];
  const arrayStart = start + marker.length - 1;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let index = arrayStart; index < html.length; index += 1) {
    const char = html[index];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === "\"") {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) return JSON.parse(html.slice(arrayStart, index + 1));
    }
  }
  return [];
}

function commentDate(description) {
  return String(description || "").match(/^\s*([A-Z][a-z]{2}\s+\d{1,2}):/)?.[1] || "";
}

function injuryTextMeansSeasonEnding(text) {
  return /out\s+for\s+season|season-ending|season ending|will miss (?:the )?2026 (?:campaign|season)|miss (?:the )?(?:entire|rest of)(?: the)? (?:2026 )?(?:campaign|season)|expected to miss (?:the )?entire (?:2026 )?(?:campaign|season)/i.test(text || "");
}

function injuryTextMeansActivePupNfi(text) {
  return /active\/pup|active-pup|active pup|active\/physically unable|active physically unable|active\/nfi|active-nfi|active nfi|active\/non-football|active non-football/i.test(text || "");
}

function injuryTextMeansHealthy(text) {
  const value = String(text || "").toLowerCase();
  if (/returned|return(ed)? to practice|full participant|cleared/.test(value)) return true;
  if (/did not practice|not practicing|won't practice|will not practice|miss(?:ed|es|ing)? practice|held out|unable to practice|limited participant|limited practice/.test(value)) return false;
  return /participat(?:ed|es|ing)? in (?:training camp|practice)|practic(?:ed|es|ing) (?:today|this week|during camp|at camp|in training camp)/.test(value);
}

function injuryTextMeansCampRampUp(text) {
  return /not (?:yet )?(?:doing|participating in) full-team drills|isn'?t (?:yet )?doing full-team drills|no full-team drills|individual drills|ramp(?:ing)? up|working (?:his|her|their) way back/i.test(text || "");
}

function injuryTextMeansReserveList(text) {
  if (injuryTextMeansActivePupNfi(text)) return false;
  return /\bir\b|injured reserve|reserve\/pup|reserve-pup|reserve pup|reserve\/physically unable|reserve physically unable|reserve\/nfi|reserve-nfi|reserve nfi|reserve\/non-football|reserve non-football/i.test(text || "");
}

function suggestStatus(row) {
  const status = String(row.statusDesc || "").toLowerCase();
  const comment = String(row.description || "").toLowerCase();
  const text = `${status} ${comment}`;
  if (injuryTextMeansHealthy(text)) return "Healthy";
  if (/questionable|doubtful/.test(status) && !comment.trim()) return "Healthy";
  if (injuryTextMeansSeasonEnding(text)) return "OUT for Season";
  if (injuryTextMeansActivePupNfi(text)) return "OUT thru Week ___";
  if (injuryTextMeansReserveList(text) || /reverted to .*ir|placed .*ir/.test(comment)) return "IR Thru Week ___";
  if (/suspended/.test(comment)) return "Suspended thru Week ___";
  if (/out/.test(status)) return "OUT thru Week ___";
  if (/questionable|doubtful/.test(status)) return "*Likely* Out thru Week ___";
  return "Healthy";
}

function defaultSuggestedWeek(status, schedule) {
  if (/^healthy$|out\s+for\s+season/i.test(status || "")) return "";
  if (/^ir\s+thru/i.test(status || "")) return "";
  if (/out\s+thru|likely.*out\s+thru|suspended\s+thru/i.test(status || "")) return currentInjuryReviewWeek(schedule);
  return "";
}

function effectiveSuggestedWeek(status, row, schedule, returnDate) {
  const text = `${String(row.statusDesc || "").toLowerCase()} ${String(row.description || "").toLowerCase()}`;
  if (/^healthy$|out\s+for\s+season/i.test(status || "")) return "";
  if (/^ir\s+thru/i.test(status || "")) return "";
  if (injuryTextMeansActivePupNfi(text)) return "Pre3";
  const current = currentInjuryReviewWeek(schedule);
  if (injuryTextMeansCampRampUp(text) && String(current).startsWith("Pre")) return "Pre3";
  if (/out\s+thru|likely.*out\s+thru|suspended\s+thru/i.test(status || "") && String(current).startsWith("Pre")) return current;
  return weekForDate(parseMonthDay(returnDate), schedule) || defaultSuggestedWeek(status, schedule);
}

function buildResults(data, injuries) {
  const players = (data.players || []).filter((player) => !excludedPlayerPositions.has(String(player?.position || "").trim().toUpperCase()));
  const results = [];
  injuries.forEach((team) => {
    const teamName = normalizeTeamName(team.displayName);
    (team.items || []).forEach((item) => {
      const cleanName = cleanPlayerName(item.athlete?.name || "");
      const matched = players.find((player) => cleanPlayerName(player.player) === cleanName && normalizeTeamName(player.team) === teamName)
        || players.find((player) => cleanPlayerName(player.player) === cleanName);
      if (!matched) return;
      const suggestedStatus = suggestStatus(item);
      const returnDate = item.date || "";
      results.push({
        playerKey: playerKey(matched),
        player: matched.player,
        team: matched.team,
        position: matched.position,
        espnTeam: teamName,
        espnTag: item.statusDesc || item.type?.description || "",
        espnReturnDate: returnDate,
        espnCommentDate: commentDate(item.description),
        espnComment: item.description || "",
        suggestedStatus,
        suggestedWeek: effectiveSuggestedWeek(suggestedStatus, item, data.schedule || [], returnDate),
        confidence: normalizeTeamName(matched.team) === teamName ? "team/name match" : "name match, team differs",
      });
    });
  });
  return results;
}

async function liveInjuryScan() {
  const response = await fetch(ESPN_INJURIES_URL, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "user-agent": "Mozilla/5.0 NFL Model Z injury checker",
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`ESPN returned HTTP ${response.status}`);
  const html = await response.text();
  const injuries = extractJsonArray(html, "injuries");
  if (!injuries.length) throw new Error("ESPN returned no injury rows");
  const data = readAppData();
  return {
    fetchedAt: new Date().toISOString(),
    sourceUrl: ESPN_INJURIES_URL,
    espnRows: injuries.reduce((sum, team) => sum + (team.items || []).length, 0),
    results: buildResults(data, injuries),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return jsonResponse(204, {});
  try {
    return jsonResponse(200, await liveInjuryScan());
  } catch (error) {
    try {
      const cached = parseWindowAssignmentFile("espn-injury-check-results.js", "ESPN_INJURY_CHECK");
      return jsonResponse(200, {
        ...cached,
        fromCache: true,
        refreshError: error.message,
      });
    } catch (cacheError) {
      return jsonResponse(502, {
        fetchedAt: new Date().toISOString(),
        fromCache: true,
        refreshError: `${error.message}; cache unavailable: ${cacheError.message}`,
        results: [],
      });
    }
  }
};
