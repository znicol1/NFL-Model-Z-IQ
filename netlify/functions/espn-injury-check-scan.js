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
  const weeks = new Map();
  (schedule || []).forEach((game) => {
    const gameDate = excelDateToDate(game.date);
    if (Number.isNaN(gameDate.valueOf())) return;
    const key = String(game.week);
    if (!weeks.has(key) || gameDate > weeks.get(key)) weeks.set(key, gameDate);
  });
  const ordered = [...weeks.entries()].sort((a, b) => a[1] - b[1]);
  return String((ordered.find(([, lastGameDate]) => date <= lastGameDate) || ordered[ordered.length - 1] || [""])[0]);
}

function currentInjuryReviewWeek(schedule) {
  const week = weekForDate(new Date(), schedule);
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
  return /out\s+for\s+season|season-ending|season ending|will miss (?:the )?2026 (?:campaign|season)|miss (?:the )?(?:entire|rest of)(?: the)? (?:2026 )?(?:campaign|season)|expected to miss (?:the )?entire (?:2026 )?(?:campaign|season)|\b(?:tore|ruptured|torn)\s+(?:his|her|their|the|an?)?\s*achilles\b/i.test(text || "");
}

function injuryTextMeansActivePupNfi(text) {
  return /active\/pup|active-pup|active pup|active\/physically unable|active physically unable|active\/nfi|active-nfi|active nfi|active\/non-football|active non-football/i.test(text || "");
}

function injuryTextMeansDesignatedIrReturn(text) {
  return /\bdesignated\b.{0,90}\b(?:to|for) return from (?:the )?(?:injured reserve|ir|reserve\/(?:pup|nfi))\b|\b21-day (?:practice|evaluation) window (?:was |has been |had been )?opened\b/i.test(text || "");
}

function injuryTextMeansIrPracticeReturn(row) {
  const status = String(row.statusDesc || "").toLowerCase();
  const comment = String(row.description || "").toLowerCase();
  const returned = /\breturn(?:ed|s|ing)? to practice\b|\bback at practice\b|\bresum(?:ed|es|ing) practice\b/.test(comment);
  return /\bactivated\b.{0,90}\bfrom (?:the )?(?:injured reserve|ir)\b|\bremoved\b.{0,90}\bfrom (?:the )?(?:injured reserve|ir)\b/.test(comment)
    || (returned && (/\bir\b|injured reserve/.test(status) || /\bfrom (?:the )?(?:injured reserve|ir)\b/.test(comment)));
}

function commentDecision(row, schedule) {
  const comment = String(row.description || "").toLowerCase();
  const tag = String(row.statusDesc || "").toLowerCase();
  const taggedIr = /injured reserve|\bir\b|reserve\/(?:pup|nfi)/.test(tag);
  const reportWeek = weekForDate(parseMonthDay(commentDate(row.description)), schedule);
  const currentWeek = currentInjuryReviewWeek(schedule);
  const stillIr = /\bremains? on (?:the )?(?:injured reserve|ir)\b|\bstays? on (?:the )?(?:injured reserve|ir)\b|\bwon't return to practice this week\b|\bwill not return to practice this week\b|\b(?:will|most likely|likely) not\b.{0,35}\bpractice window opened\b/.test(comment);
  if (stillIr && taggedIr) return { status: "IR Thru Week ___", week: "" };
  if (injuryTextMeansDesignatedIrReturn(comment) || injuryTextMeansIrPracticeReturn(row)) {
    if (/\b(?:will not|won't) play\b|\bruled out for\b|\binactive for\b/.test(comment)) return { status: "OUT", week: reportWeek || currentWeek };
    return { status: "Questionable for Week ___", week: currentWeek };
  }
  const target = comment.match(/\btargeting a return for week\s+(\d{1,2})\b/);
  if (target) return { status: "OUT", week: String(Math.max(1, Number(target[1]) - 1)) };
  if (injuryTextMeansInGameExit(comment) || /\bdoubtful to return to (?:thursday|sunday|monday|saturday|tonight|today|the|this)\b/.test(comment)) {
    return { status: /\bconcussion\b|\bbroken rib\b/.test(comment) ? "Doubtful for Week ___" : "Questionable for Week ___", week: String(Number(reportWeek || currentWeek) + 1) };
  }
  if (/\bbroken rib\b/.test(comment)) return { status: "Doubtful for Week ___", week: String(Number(currentWeek) + 1) };
  if (/\b(?:is|listed as|officially) questionable for\b/.test(comment)) return { status: "Questionable for Week ___", week: reportWeek || currentWeek };
  if (/\b(?:is|listed as|officially) doubtful for\b/.test(comment)) return { status: "Doubtful for Week ___", week: reportWeek || currentWeek };
  if (/\bruled out for\b|\binactive for\b/.test(comment)) return taggedIr
    ? { status: "IR Thru Week ___", week: "" }
    : { status: "OUT", week: reportWeek || currentWeek };
  return null;
}

function injuryTextMeansMultiWeekAbsence(text) {
  return /(?:expected to|will|set to|likely to) miss (?:multiple|several) weeks|(?:out|sidelined) for (?:multiple|several) weeks|likely to avoid .*injured reserve.*expected to miss time/i.test(text || "");
}

function injuryTextMeansUncertainGameAvailability(text) {
  return /up in the air.*(?:available|play)|(?:availability|playing).*up in the air/i.test(text || "");
}

function injuryTextMeansFullPractice(text) {
  return /full participant|practic(?:ed|es|ing) in full/i.test(text || "");
}

function injuryTextMeansLongTermUncertain(text) {
  return /(?:hopeful|hoping|optimistic).*\b(?:play|return)\b.*\b(?:at some point|this season|during the .*season)\b/i.test(text || "");
}

function injuryTextMeansInGameExit(text) {
  return /(?:ruled|declared) out for (?:the )?(?:rest|remainder) of (?:sunday'?s|monday'?s|thursday'?s|saturday'?s|today'?s|tonight'?s|the|this) game/i.test(text || "");
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
  if (/(?:avoid|avoiding|avoided) (?:a stint on |being placed on |placement on )?(?:injured reserve|\bir\b)|(?:won't|will not|isn't expected to) (?:go on|be placed on) (?:injured reserve|\bir\b)/i.test(text || "")) return false;
  if (/\bnfi-r\b/i.test(text || "")) return false;
  if (injuryTextMeansActivePupNfi(text)) return false;
  return /\bir\b|injured reserve|reserve\/pup|reserve-pup|reserve pup|reserve\/physically unable|reserve physically unable|reserve\/nfi|reserve-nfi|reserve nfi|reserve\/non-football|reserve non-football/i.test(text || "");
}

function suggestStatus(row, schedule) {
  const status = String(row.statusDesc || "").toLowerCase();
  const comment = String(row.description || "").toLowerCase();
  const text = `${status} ${comment}`;
  if (injuryTextMeansSeasonEnding(text)) return "OUT for Season";
  const decision = commentDecision(row, schedule);
  if (decision) return decision.status;
  if (injuryTextMeansUncertainGameAvailability(comment)) return "Questionable for Week ___";
  if (/injured reserve|\bir\b/.test(status) && injuryTextMeansFullPractice(comment)) return "Questionable for Week ___";
  if (injuryTextMeansDesignatedIrReturn(comment) && !/\bruled out for (?:sunday|monday|thursday|saturday|the next)\b/.test(comment)) return "Questionable for Week ___";
  if (injuryTextMeansIrPracticeReturn(row)) return "Questionable for Week ___";
  if (injuryTextMeansInGameExit(comment)) return /concussion/.test(comment) ? "Doubtful for Week ___" : "Questionable for Week ___";
  if (injuryTextMeansMultiWeekAbsence(comment)) {
    const reportWeek = Number(weekForDate(parseMonthDay(commentDate(row.description)), schedule));
    const currentWeek = Number(currentInjuryReviewWeek(schedule));
    return Number.isFinite(reportWeek) && Number.isFinite(currentWeek) && currentWeek > reportWeek + 1 ? "Questionable for Week ___" : "OUT";
  }
  if (injuryTextMeansLongTermUncertain(comment) || /\bnfi-r\b/.test(text)) return "OUT";
  if (injuryTextMeansHealthy(text)) return "Healthy";
  if (/questionable/.test(status) && !comment.trim()) return "Questionable for Week ___";
  if (/doubtful/.test(status) && !comment.trim()) return "Doubtful for Week ___";
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
  const decision = commentDecision(row, schedule);
  if (decision) return decision.week;
  if (injuryTextMeansUncertainGameAvailability(row.description) || (/injured reserve|\bir\b/i.test(row.statusDesc || "") && injuryTextMeansFullPractice(row.description))) return currentInjuryReviewWeek(schedule);
  if (injuryTextMeansInGameExit(row.description)) {
    const reportWeek = weekForDate(parseMonthDay(commentDate(row.description)), schedule);
    return reportWeek ? String(Number(reportWeek) + 1) : currentInjuryReviewWeek(schedule);
  }
  if (injuryTextMeansMultiWeekAbsence(row.description)) {
    const reportWeek = weekForDate(parseMonthDay(commentDate(row.description)), schedule);
    return reportWeek ? String(Number(reportWeek) + 1) : currentInjuryReviewWeek(schedule);
  }
  if (injuryTextMeansLongTermUncertain(row.description)) return String(Math.min(18, Number(currentInjuryReviewWeek(schedule) || 1) + 2));
  if (/\bnfi-r\b/i.test(text)) return currentInjuryReviewWeek(schedule);
  if (/^out$/i.test(status || "") || /^(?:questionable|doubtful)\s+for\s+week/i.test(status || "")) return currentInjuryReviewWeek(schedule);
  if ((injuryTextMeansDesignatedIrReturn(row.description) || injuryTextMeansIrPracticeReturn(row)) && /^(?:questionable|doubtful)\s+for\s+week|^out\s+thru/i.test(status || "")) return currentInjuryReviewWeek(schedule);
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
      const name = item.athlete?.name || "";
      if (!name) return;
      const cleanName = cleanPlayerName(name);
      const matched = players.find((player) => cleanPlayerName(player.player) === cleanName && normalizeTeamName(player.team) === teamName)
        || players.find((player) => cleanPlayerName(player.player) === cleanName);
      const suggestedStatus = suggestStatus(item, data.schedule || []);
      const returnDate = item.date || "";
      results.push({
        playerKey: matched ? playerKey(matched) : "",
        player: matched?.player || name,
        team: matched?.team || teamName,
        position: matched?.position || "",
        espnTeam: teamName,
        espnTag: item.statusDesc || item.type?.description || "",
        espnReturnDate: returnDate,
        espnCommentDate: commentDate(item.description),
        espnComment: item.description || "",
        suggestedStatus,
        suggestedWeek: effectiveSuggestedWeek(suggestedStatus, item, data.schedule || [], returnDate),
        confidence: !matched ? "ESPN name awaiting active roster match" : normalizeTeamName(matched.team) === teamName ? "team/name match" : "name match, team differs",
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

exports.suggestStatus = suggestStatus;
exports.effectiveSuggestedWeek = effectiveSuggestedWeek;
exports.weekForDate = weekForDate;
