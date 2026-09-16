const fs = require("fs");
const path = require("path");

const ESPN_SCHEDULE_URL = "https://cdn.espn.com/core/nfl/schedule?xhr=1&year=2026";
const ESPN_CORE_BASE = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl";

const headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type",
  "cache-control": "no-store",
  "content-type": "application/json",
};

function jsonResponse(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json,text/plain,*/*",
      "user-agent": "Mozilla/5.0 NFL-Model-Z-IQ/1.0",
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

async function espnSchedule() {
  return getJson(ESPN_SCHEDULE_URL);
}

async function espnScheduleForWeek(seasonType, week) {
  return getJson(`${ESPN_SCHEDULE_URL}&seasontype=${seasonType}&week=${week}`);
}

async function espnFullSeasonSchedule() {
  const requests = [
    ...Array.from({ length: 4 }, (_, index) => ({ seasonType: 1, week: index + 1 })),
    ...Array.from({ length: 18 }, (_, index) => ({ seasonType: 2, week: index + 1 })),
    ...Array.from({ length: 5 }, (_, index) => ({ seasonType: 3, week: index + 1 })),
  ];
  const settled = await Promise.allSettled(requests.map(({ seasonType, week }) => espnScheduleForWeek(seasonType, week)));
  const gamesById = new Map();
  const failedWeeks = [];
  settled.forEach((result, index) => {
    const request = requests[index];
    if (result.status === "rejected") {
      failedWeeks.push(`${request.seasonType}:${request.week}`);
      return;
    }
    flattenScheduleGames(result.value).forEach((game) => {
      game.weekKey = request.seasonType === 1
        ? `Pre${request.week - 1}`
        : request.seasonType === 2
          ? String(request.week)
          : `Post${request.week}`;
      const key = game.eventId || [game.date, game.visitor, game.home].join("|");
      gamesById.set(key, game);
    });
  });
  if (!gamesById.size) throw new Error("ESPN did not return any schedule weeks");
  return {
    games: [...gamesById.values()].sort((a, b) => String(a.date).localeCompare(String(b.date))),
    failedWeeks,
    requestedWeeks: requests.length,
    loadedWeeks: requests.length - failedWeeks.length,
  };
}

function dateKeyToIso(dateKey) {
  const text = String(dateKey || "");
  if (!/^\d{8}$/.test(text)) return "";
  return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
}

function flattenScheduleGames(schedulePayload) {
  const schedule = schedulePayload?.content?.schedule || {};
  return Object.entries(schedule).flatMap(([dateKey, bucket]) => {
    return (bucket?.games || []).map((game) => {
      const competition = game.competitions?.[0] || {};
      const competitors = competition.competitors || [];
      const away = competitors.find((team) => team.homeAway === "away") || competitors[1] || {};
      const home = competitors.find((team) => team.homeAway === "home") || competitors[0] || {};
      const awayScore = Number(away.score);
      const homeScore = Number(home.score);
      const completed = Boolean(game.status?.type?.completed || competition.status?.type?.completed);
      const tied = completed && Number.isFinite(awayScore) && Number.isFinite(homeScore) && awayScore === homeScore;
      const winner = tied ? "" : away.winner ? away.team?.displayName : home.winner ? home.team?.displayName : "";
      return {
        eventId: String(game.id || competition.id || ""),
        date: dateKeyToIso(dateKey) || String(game.date || competition.date || "").slice(0, 10),
        week: game.week?.number ? String(game.week.number) : "",
        visitor: away.team?.displayName || "",
        visitorAbbrev: away.team?.abbreviation || "",
        home: home.team?.displayName || "",
        homeAbbrev: home.team?.abbreviation || "",
        awayScore: Number.isFinite(awayScore) ? awayScore : "",
        homeScore: Number.isFinite(homeScore) ? homeScore : "",
        completed,
        status: game.status?.type?.description || competition.status?.type?.description || "",
        winner,
        neutralSite: Boolean(game.neutralSite || competition.neutralSite),
        venue: competition.venue?.fullName || "",
        sourceUrl: "https://www.espn.com/nfl/schedule",
      };
    });
  });
}

function normalizeOddsNumber(value) {
  if (value === null || value === undefined || value === "") return "";
  const number = Number(value);
  return Number.isFinite(number) ? number : "";
}

function oddsPrice(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return number > 0 ? `+${Math.round(number)}` : String(Math.round(number));
}

async function draftKingsOddsForEvent(eventId) {
  if (!eventId) return null;
  const list = await getJson(`${ESPN_CORE_BASE}/events/${eventId}/competitions/${eventId}/odds?lang=en&region=us`);
  const refs = list?.items || [];
  const dkRef = refs.find((item) => /draftkings/i.test(item?.provider?.name || "")) || refs[0];
  if (!dkRef?.$ref) return null;
  return getJson(String(dkRef.$ref).replace(/^http:/, "https:"));
}

function draftKingsRow(game, odds) {
  if (!odds) return null;
  const details = odds.details || "";
  const spread = normalizeOddsNumber(odds.spread);
  const awayFavorite = Boolean(odds.awayTeamOdds?.favorite);
  const homeFavorite = Boolean(odds.homeTeamOdds?.favorite);
  const favorite = awayFavorite ? game.visitor : homeFavorite ? game.home : "";
  return {
    eventId: game.eventId,
    date: game.date,
    week: game.week ? `Week ${game.week}` : "",
    visitor: game.visitor,
    visitorAbbrev: game.visitorAbbrev,
    home: game.home,
    homeAbbrev: game.homeAbbrev,
    provider: odds.provider?.name || "DraftKings",
    providerLogo: "https://a.espncdn.com/i/betting/Draftkings_Light.svg",
    spreadDetails: details,
    spreadLine: spread,
    spreadFavoriteTeam: favorite,
    totalLine: normalizeOddsNumber(odds.overUnder),
    overLine: odds.overUnder ? `o${odds.overUnder}` : "",
    overOdds: oddsPrice(odds.overOdds),
    underLine: odds.overUnder ? `u${odds.overUnder}` : "",
    underOdds: oddsPrice(odds.underOdds),
    awayMoneyline: oddsPrice(odds.awayTeamOdds?.moneyLine),
    homeMoneyline: oddsPrice(odds.homeTeamOdds?.moneyLine),
    mlFavorite: favorite,
    sourceUrl: "https://www.espn.com/nfl/odds",
  };
}

function parseWindowAssignmentFile(relativePath, windowName) {
  const candidates = [
    path.join(process.cwd(), relativePath),
    path.join(__dirname, "..", "..", relativePath),
    path.join(__dirname, relativePath),
    path.join(__dirname, path.basename(relativePath)),
  ];
  const filePath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!filePath) throw new Error(`${relativePath} not found in function bundle`);
  const text = fs.readFileSync(filePath, "utf8");
  const prefix = `window.${windowName} =`;
  const start = text.indexOf(prefix);
  if (start < 0) throw new Error(`${windowName} assignment not found`);
  const jsonStart = text.indexOf("{", start);
  const jsonEnd = text.lastIndexOf("};");
  if (jsonStart < 0 || jsonEnd < jsonStart) throw new Error(`${windowName} JSON block not found`);
  return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
}

module.exports = {
  draftKingsOddsForEvent,
  draftKingsRow,
  espnFullSeasonSchedule,
  espnSchedule,
  espnScheduleForWeek,
  flattenScheduleGames,
  headers,
  jsonResponse,
  parseWindowAssignmentFile,
};
