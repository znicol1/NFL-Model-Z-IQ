const pages = [
  ["home", "Quick Actions"],
  ["live", "Live Rankings"],
  ["depth", "Depth Charts"],
  ["top30", "Top 30s by Position"],
  ["schedule", "Sim Schedule"],
  ["picks", "Picks Tracker"],
  ["standings", "Sim Standings"],
  ["weeklyFantasy", "Weekly Fantasy Rankings"],
  ["seasonFantasy", "Season Long Fantasy Ranks"],
  ["statRanks", "Stat Ranks"],
  ["data", "Data"],
  ["start", "Start 'Em, Sit 'Em"],
  ["pff", "PFF Update"],
  ["qb", "H2H QB Challenge", "low"],
];

const storage = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

const BACKUP_VERSION = "nfl-iq-backup-v1";
const backupKeys = {
  overrides: "nflz-player-overrides",
  challenges: "nflz-challenges",
  picks: "nflz-picks",
  fantasyOrder: "nflz-fantasy-order",
  depthCandidateRemovals: "nflz-depth-candidate-removals",
  depthIgnored: "nflz-depth-ignored-results",
  depthResolved: "nflz-depth-resolved-results",
  pffManualRanks: "nflz-pff-manual-ranks",
  pffRecentAdjustments: "nflz-pff-recent-adjustments",
  addedPlayers: "nflz-added-players",
  maddenMatchOverrides: "nflz-madden-match-overrides",
  maddenRecentAdjustments: "nflz-madden-recent-adjustments",
};

const defaultWeeklyQbOptions = {
  useStatRanks: true,
  useLast5: true,
  useProduction: true,
};

const defaultWeeklyQbWeights = {
  last5: 68,
  matchup: 100,
  talent: 100,
  depth: 100,
  oline: 100,
  ppg: 100,
  wr: 100,
  passYards: 100,
  passTds: 100,
  rushAttempts: 100,
  rushTds: 100,
};

function weeklyQbDefaultOptions() {
  return { ...defaultWeeklyQbOptions, ...storage.get("nflz-weekly-qb-default-options", {}) };
}

function weeklyQbDefaultWeights() {
  return { ...defaultWeeklyQbWeights, ...storage.get("nflz-weekly-qb-default-weights", {}) };
}

const defaultSchedulePositionWeights = {
  QB: 18,
  RB: 8,
  WR: 14,
  TE: 7,
  OL: 15,
  IDL: 8,
  EDGE: 10,
  LB: 6,
  CB: 10,
  S: 4,
};

const defaultPreseasonDepthMultipliers = {
  QB: [100, 120, 120],
  RB: [100, 120, 120, 120],
  WR: [100, 110, 120, 120, 120],
  TE: [100, 110, 110, 110],
  OL: [100, 100, 100],
  IDL: [100, 110, 110, 110, 110],
  EDGE: [100, 110, 110, 110, 110],
  LB: [100, 110, 110, 110, 110],
  CB: [100, 100, 110, 110, 110, 110],
  S: [100, 100, 110, 110],
};

const defaultHomeFieldAdvantages = {
  "Arizona Cardinals": 1,
  "Atlanta Falcons": 1.5,
  "Baltimore Ravens": 1.5,
  "Buffalo Bills": 1.5,
  "Carolina Panthers": 0.5,
  "Chicago Bears": 1,
  "Cincinnati Bengals": 1.5,
  "Cleveland Browns": 1.5,
  "Dallas Cowboys": 1.5,
  "Denver Broncos": 2,
  "Detroit Lions": 1.5,
  "Green Bay Packers": 2,
  "Houston Texans": 1,
  "Indianapolis Colts": 1.5,
  "Jacksonville Jaguars": 0.5,
  "Kansas City Chiefs": 2,
  "Las Vegas Raiders": 0.5,
  "LA Chargers": 0.5,
  "LA Rams": 1,
  "Miami Dolphins": 2,
  "Minnesota Vikings": 2,
  "New England Patriots": 1.5,
  "New Orleans Saints": 1.5,
  "New York Giants": 1,
  "New York Jets": 0.5,
  "Philadelphia Eagles": 2,
  "Pittsburgh Steelers": 2,
  "San Francisco 49ers": 1.5,
  "Seattle Seahawks": 2,
  "Tampa Bay Buccaneers": 1,
  "Tennessee Titans": 1,
  "Washington Commanders": 0.5,
};

const kickerStadiumTiers = {
  "Arizona Cardinals": 2, "Atlanta Falcons": 2, "Dallas Cowboys": 2, "Denver Broncos": 2, "Detroit Lions": 2, "Houston Texans": 2,
  "Indianapolis Colts": 2, "Las Vegas Raiders": 2, "LA Chargers": 2, "LA Rams": 2, "Minnesota Vikings": 2, "New Orleans Saints": 2,
  "Baltimore Ravens": 1, "Carolina Panthers": 1, "Cincinnati Bengals": 1, "Green Bay Packers": 1, "Jacksonville Jaguars": 1,
  "Miami Dolphins": 1, "San Francisco 49ers": 1, "Tampa Bay Buccaneers": 1, "Tennessee Titans": 1,
  "Buffalo Bills": 0, "Chicago Bears": 0, "Cleveland Browns": 0, "Kansas City Chiefs": 0, "New England Patriots": 0,
  "New York Giants": 0, "New York Jets": 0, "Philadelphia Eagles": 0, "Pittsburgh Steelers": 0, "Washington Commanders": 0,
};

const neutralSiteGames = [
  ["1", "San Francisco 49ers", "LA Rams"],
  ["3", "Baltimore Ravens", "Dallas Cowboys"],
  ["4", "Indianapolis Colts", "Washington Commanders"],
  ["5", "Philadelphia Eagles", "Jacksonville Jaguars"],
  ["6", "Houston Texans", "Jacksonville Jaguars"],
  ["7", "Pittsburgh Steelers", "New Orleans Saints"],
  ["9", "Cincinnati Bengals", "Atlanta Falcons"],
  ["10", "New England Patriots", "Detroit Lions"],
  ["11", "Minnesota Vikings", "San Francisco 49ers"],
];

const spreadWinChanceTable = [
  [0, 0.5], [0.5, 0.5], [1, 0.513], [1.5, 0.525], [2, 0.535], [2.5, 0.545],
  [3, 0.594], [3.5, 0.643], [4, 0.658], [4.5, 0.673], [5, 0.681], [5.5, 0.69],
  [6, 0.707], [6.5, 0.724], [7, 0.752], [7.5, 0.781], [8, 0.791], [8.5, 0.802],
  [9, 0.807], [9.5, 0.811], [10, 0.836], [10.5, 0.86], [11, 0.871], [11.5, 0.882],
  [12, 0.885], [12.5, 0.887], [13, 0.893], [13.5, 0.9], [14, 0.924], [14.5, 0.949],
  [15, 0.956], [15.5, 0.963], [16, 0.981], [16.5, 0.998], [17, 1],
];

const state = {
  page: "home",
  query: "",
  data: null,
  players: [],
  liveView: "starters",
  liveSort: { key: "Overall Rating", direction: "desc" },
  liveRosterPositions: ["QB", "RB", "WR", "TE", "LT", "LG", "C", "RG", "RT"],
  liveDepthMode: "starters",
  liveRatingMode: "base",
  depthTeam: "All Teams",
  depthPosition: "All Positions",
  depthSide: "All Sides",
  depthCheckActivity: "All Activities",
  depthCheckVisibleLimit: 250,
  depthCheckVersion: 0,
  depthCheckNotice: "",
  depthCheck: { status: "idle", results: [], error: "", source: "" },
  injuryCheck: { status: "idle", results: [], error: "", source: "" },
  selectedPlayerKey: null,
  topPosition: "All Positions",
  topLimit: 30,
  scheduleView: "week",
  scheduleWeek: "All Weeks",
  scheduleTeam: "All Teams",
  scheduleSimMode: storage.get("nflz-schedule-sim-mode", "auto"),
  scheduleControlsOpen: storage.get("nflz-schedule-controls-open", false),
  schedulePositionWeights: { ...defaultSchedulePositionWeights, ...storage.get("nflz-schedule-position-weights", {}) },
  preseasonDepthMultipliers: { ...defaultPreseasonDepthMultipliers, ...storage.get("nflz-preseason-depth-multipliers", {}) },
  homeFieldAdvantages: { ...defaultHomeFieldAdvantages, ...storage.get("nflz-home-field-advantages", {}) },
  siteWeek: storage.get("nflz-site-week", "auto"),
  selectedScheduleKey: "",
  standingView: "league",
  weeklyFantasyPosition: "QB",
  weeklyFantasyView: "regular",
  weeklyFantasySort: "score",
  weeklyFantasySortDirection: "desc",
  weeklyFantasyCompareKeys: storage.get("nflz-weekly-compare-keys", []),
  weeklyFantasyCompareOnly: false,
  weeklyQbOptions: { ...weeklyQbDefaultOptions(), ...storage.get("nflz-weekly-qb-options", {}) },
  weeklyQbWeights: { ...weeklyQbDefaultWeights(), ...storage.get("nflz-weekly-qb-weights", {}) },
  weeklyQbControlsOpen: storage.get("nflz-weekly-qb-controls-open", true),
  weeklyQbDefaultMessage: "",
  weeklyFantasyLimit: 150,
  seasonFantasyPosition: "QB",
  seasonFantasyView: "regular",
  seasonFantasySort: "rank",
  seasonFantasySortDirection: "asc",
  seasonFantasyLimit: 150,
  teamRankingsScanStatus: "idle",
  teamRankingsScanMessage: "",
  statRanksSort: { key: "team", direction: "asc" },
  snapsStatsScanStatus: "idle",
  snapsStatsScanMessage: "",
  snapsStatsQuery: "",
  draftKingsScanStatus: "idle",
  draftKingsScanMessage: "",
  scoreScanStatus: "idle",
  scoreScanMessage: "",
  pffPastePosition: "EDGE",
  pffManualNotice: "",
  pffView: "review",
  pffSort: { key: "suggestedDelta", direction: "desc" },
  pffLimit: 500,
  maddenView: "matched",
  maddenSort: { key: "diff", direction: "desc" },
  maddenPending: {},
  maddenSetTo: {},
  maddenLimit: 500,
  fantasyLeague: 0,
  qbPosition: "QB",
  qbDepth: 1,
  qbUser: "",
  challenge: null,
  comparePosition: "QB",
  quickPlayerQuery: "",
  quickPlayerKey: "",
  quickMoveTeam: "Free Agent",
  quickRankScope: "QB",
  quickRankLimit: 20,
  quickTeamRankScope: "Whole Team",
  quickTeamRankLimit: 20,
  quickGameWeek: "All Weeks",
  quickGameKey: "",
  quickWinner: "",
};

const nav = document.querySelector("#nav");
const content = document.querySelector("#content");
const title = document.querySelector("#page-title");
const search = document.querySelector("#search");
const exportBackupButton = document.querySelector("#export-backup");
const importBackupButton = document.querySelector("#import-backup");
const importBackupFile = document.querySelector("#import-backup-file");

const overrides = storage.get("nflz-player-overrides", {});
const savedChallenges = storage.get("nflz-challenges", []);
const savedPicks = storage.get("nflz-picks", {});
const savedFantasy = storage.get("nflz-fantasy-order", {});
const depthCandidateRemovals = storage.get("nflz-depth-candidate-removals", {});
const depthIgnoredResults = storage.get("nflz-depth-ignored-results", {});
const depthResolvedResults = storage.get("nflz-depth-resolved-results", {});
const pffManualRanks = storage.get("nflz-pff-manual-ranks", {});
const pffRecentAdjustments = storage.get("nflz-pff-recent-adjustments", {});
const maddenMatchOverrides = storage.get("nflz-madden-match-overrides", {});
const maddenRecentAdjustments = storage.get("nflz-madden-recent-adjustments", {});
let depthNameMatchCache = { signature: "", map: new Map(), missingByLast: new Map() };
let pffManualRowsCache = null;
let pffIndexCache = null;
let pffPlayerMatchIndexCache = null;
const addedPlayers = storage.get("nflz-added-players", []);
let globalSearchTimer = null;
let quickPlayerSearchTimer = null;

function gameAction(gameKey) {
  const saved = savedPicks[gameKey];
  if (saved && typeof saved === "object") {
    return { ml: "", spread: "", total: "", resultWinner: "", awayScore: "", homeScore: "", ...saved };
  }
  return { ml: saved || "", spread: "", total: "", resultWinner: "", awayScore: "", homeScore: "" };
}

function saveGameAction(gameKey, patch) {
  savedPicks[gameKey] = { ...gameAction(gameKey), ...patch };
  storage.set("nflz-picks", savedPicks);
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportFullBackup() {
  const payload = {
    type: BACKUP_VERSION,
    app: "NFL Model Z",
    ...backupPayload(),
    ui: {
      page: state.page,
      liveView: state.liveView,
      depthTeam: state.depthTeam,
      depthPosition: state.depthPosition,
      topPosition: state.topPosition,
      topLimit: state.topLimit,
      scheduleView: state.scheduleView,
      scheduleWeek: state.scheduleWeek,
      scheduleTeam: state.scheduleTeam,
      standingView: state.standingView,
      fantasyLeague: state.fantasyLeague,
      qbPosition: state.qbPosition,
      qbDepth: state.qbDepth,
      comparePosition: state.comparePosition,
    },
  };
  downloadJson(`nfl-iq-full-backup-${new Date().toISOString().slice(0, 10)}.json`, payload);
}

function importFullBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      const data = payload.data || payload;
      storage.set(backupKeys.overrides, data.overrides || {});
      storage.set(backupKeys.challenges, data.challenges || []);
      storage.set(backupKeys.picks, data.picks || {});
      storage.set(backupKeys.fantasyOrder, data.fantasyOrder || {});
      storage.set(backupKeys.depthCandidateRemovals, data.depthCandidateRemovals || {});
      storage.set(backupKeys.depthIgnored, data.depthIgnored || {});
      storage.set(backupKeys.depthResolved, data.depthResolved || {});
      storage.set(backupKeys.pffManualRanks, data.pffManualRanks || {});
      storage.set(backupKeys.pffRecentAdjustments, data.pffRecentAdjustments || {});
      storage.set(backupKeys.addedPlayers, data.addedPlayers || []);
      storage.set(backupKeys.maddenMatchOverrides, data.maddenMatchOverrides || {});
      storage.set(backupKeys.maddenRecentAdjustments, data.maddenRecentAdjustments || {});
      alert("NFL IQ backup imported. The app will reload with your saved ratings, picks, challenges, and fantasy order.");
      window.location.reload();
    } catch (error) {
      alert("That backup file could not be imported. Please choose a valid NFL IQ backup JSON file.");
    }
  };
  reader.readAsText(file);
}

const fmt = (value, digits = 1) => {
  if (value === null || value === undefined || value === "" || String(value).startsWith("#")) return "";
  return Number.isFinite(Number(value)) ? Number(value).toFixed(digits) : value;
};

const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
const excelDate = (value) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return shortDate(value);
  if (!Number.isFinite(Number(value))) return value || "";
  const date = new Date((Number(value) - 25569) * 86400 * 1000);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
const excelTime = (value) => {
  if (!Number.isFinite(Number(value))) return value || "";
  const totalMinutes = Math.round(Number(value) * 24 * 60);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};
const unique = (items) => [...new Set(items.filter(Boolean))].sort();
const playerKey = (p) => `${p.team}|${p.position}|${p.player}`;
const allowedModelPositions = new Set(["QB", "RB", "WR", "TE", "LT", "LG", "C", "RG", "RT", "IDL", "EDGE", "LB", "CB", "S"]);
const excludedPlayerPositions = new Set(["FB", "K", "P", "PK", "LS", "PT", "PR", "KR", "H", "KO", "KICKER", "PUNTER", "FULLBACK", "LONG SNAPPER", "SPECIAL TEAMS"]);
const depthNameNoiseTokens = new Set(["OLB", "ILB", "MLB", "LOLB", "ROLB", "WLB", "SLB", "RILB", "LILB", "NB", "NCB", "NT", "LDT", "RDT", "DT", "LDE", "RDE", "LEDG", "REDG", "IDL", "EDGE"]);
const ourladsPositionTokens = new Set([
  "QB", "RB", "HB", "FB", "WR", "LWR", "RWR", "SWR", "TE", "LT", "LG", "C", "RG", "RT", "OT", "G",
  "DT", "NT", "IDL", "DE", "LDE", "RDE", "EDGE", "ED", "LEDG", "REDG",
  "LB", "ILB", "OLB", "MLB", "MIKE", "WLB", "WILL", "SLB", "SAM", "LOLB", "ROLB",
  "CB", "LCB", "RCB", "NCB", "NB", "DB", "FS", "SS", "S",
]);
const pffTeamAbbrevMap = {
  "Arizona Cardinals": "ARI", "Atlanta Falcons": "ATL", "Baltimore Ravens": "BAL", "Buffalo Bills": "BUF", "Carolina Panthers": "CAR", "Chicago Bears": "CHI",
  "Cincinnati Bengals": "CIN", "Cleveland Browns": "CLE", "Dallas Cowboys": "DAL", "Denver Broncos": "DEN", "Detroit Lions": "DET", "Green Bay Packers": "GB",
  "Houston Texans": "HOU", "Indianapolis Colts": "IND", "Jacksonville Jaguars": "JAX", "Kansas City Chiefs": "KC", "Las Vegas Raiders": "LV", "LA Chargers": "LAC",
  "LA Rams": "LAR", "Miami Dolphins": "MIA", "Minnesota Vikings": "MIN", "New England Patriots": "NE", "New Orleans Saints": "NO", "New York Giants": "NYG",
  "New York Jets": "NYJ", "Philadelphia Eagles": "PHI", "Pittsburgh Steelers": "PIT", "San Francisco 49ers": "SF", "Seattle Seahawks": "SEA",
  "Tampa Bay Buccaneers": "TB", "Tennessee Titans": "TEN", "Washington Commanders": "WAS", "Free Agent": "FA", "Z - FREE AGENT": "FA",
};
const teamNameAliases = {
  "Los Angeles Rams": "LA Rams",
  "Los Angeles Chargers": "LA Chargers",
  "NY Giants": "New York Giants",
  "NY Jets": "New York Jets",
};
const pffPositionCache = window.PFF_POSITION_OVERRIDES || { byName: {}, byNameTeam: {} };
function fallbackModelPosition(position) {
  const pos = String(position || "").trim().toUpperCase();
  if (excludedPlayerPositions.has(pos)) return "";
  if (allowedModelPositions.has(pos)) return pos;
  if (["HB"].includes(pos)) return "RB";
  if (["LWR", "RWR", "SWR"].includes(pos)) return "WR";
  if (["LDE", "RDE", "DE", "LEDG", "REDG", "ED", "OLB", "LOLB", "ROLB"].includes(pos)) return "EDGE";
  if (["NT", "DT", "DI"].includes(pos)) return "IDL";
  if (["MLB", "MIKE", "WLB", "WILL", "SLB", "SAM", "ILB"].includes(pos)) return "LB";
  if (["LCB", "RCB", "NCB", "NB", "DB"].includes(pos)) return "CB";
  if (["FS", "SS"].includes(pos)) return "S";
  if (["T", "OT"].includes(pos)) return "LT";
  if (["G", "OG"].includes(pos)) return "LG";
  return "";
}
function pffModelPosition(player) {
  const name = cleanPlayerName(player?.player || player?.name);
  const teamCode = String(player?.teamAbbrev || pffTeamAbbrevMap[player?.team] || "").toUpperCase();
  return pffPositionCache.byNameTeam?.[`${name}__${teamCode}`] || "";
}
function modelPosition(player) {
  const raw = String(player?.position || "").trim().toUpperCase();
  if (excludedPlayerPositions.has(raw)) return "";
  if (["LT", "LG", "C", "RG", "RT"].includes(raw)) return raw;
  return pffModelPosition(player) || fallbackModelPosition(player?.position);
}
const isIncludedPlayer = (player) => Boolean(modelPosition(player));
const matches = (item) => !state.query || Object.values(item).join(" ").toLowerCase().includes(state.query);
const mix = (a, b, pct) => Math.round(a + ((b - a) * pct));
const ratingScaleColor = (value, min = 68, max = 100, reverse = false) => {
  const red = [248, 207, 207];
  const yellow = [255, 244, 194];
  const green = [207, 242, 214];
  const useRatingAnchors = max >= 95;
  const low = useRatingAnchors ? 68 : min;
  const mid = useRatingAnchors ? 84 : (min + max) / 2;
  const high = useRatingAnchors ? 100 : max;
  let n = Math.max(low, Math.min(high, num(value, low)));
  if (reverse) n = high - (n - low);
  const from = n <= mid ? red : yellow;
  const to = n <= mid ? yellow : green;
  const pct = n <= mid ? (n - low) / Math.max(1, mid - low) : (n - mid) / Math.max(1, high - mid);
  return `rgb(${mix(from[0], to[0], pct)}, ${mix(from[1], to[1], pct)}, ${mix(from[2], to[2], pct)})`;
};
const cfStyle = (value, min = 68, max = 105, reverse = false) => {
  return `style="background:${ratingScaleColor(value, min, max, reverse)}; color:#102033;"`;
};
const ratingColor = (rating) => cfStyle(rating, 68, 105);
const byNumber = (field, direction = "desc") => (a, b) => direction === "desc" ? num(b[field], -999) - num(a[field], -999) : num(a[field], 999) - num(b[field], 999);
const maddenRows = (window.MADDEN_27_RATINGS || []).filter((row) => isIncludedPlayer({ position: row.pos }));
const gradeFromScore = (value) => {
  const n = num(value, 0);
  if (n >= 95) return "A+";
  if (n >= 90) return "A";
  if (n >= 86) return "B+";
  if (n >= 82) return "B";
  if (n >= 78) return "C+";
  if (n >= 74) return "C";
  if (n >= 70) return "D";
  return "F";
};

function sourceKey(player) {
  return player?._sourceKey || playerKey(player);
}

function applyOverrides(players) {
  return [...(players || []), ...addedPlayers].filter(isIncludedPlayer).map((p) => {
    const key = playerKey(p);
    const patch = overrides[key] || {};
    const normalizedPosition = modelPosition({ ...p, ...patch });
    const base = { ...p, rawPosition: p.rawPosition || p.position, position: normalizedPosition, _sourceKey: key, ...patch };
    const cleaned = cleanPlayerName(baseReviewPlayerName(base.player)).replace(/\b(wr|cb)$/i, "").trim();
    if (cleaned === "travis hunter" && ["WR", "CB"].includes(normalizedPosition)) {
      base.player = `Travis Hunter (${normalizedPosition})`;
      if (!Object.prototype.hasOwnProperty.call(patch, "rating")) {
        base.rating = normalizedPosition === "WR" ? 79 : 72;
        base.newRating = base.rating;
      }
    }
    return normalizeStarProgress(base);
  });
}

function saveAddedPlayers() {
  storage.set("nflz-added-players", addedPlayers);
}

function persistPlayer(player, patch) {
  const key = sourceKey(player);
  const normalized = normalizeStarProgress({ ...player, ...(overrides[key] || {}), ...patch });
  overrides[key] = { ...(overrides[key] || {}), ...patch, rating: normalized.rating, stars: normalized.stars, newRating: normalized.newRating, newStars: normalized.newStars };
  storage.set("nflz-player-overrides", overrides);
  state.players = applyOverrides(state.data.players);
  pffPlayerMatchIndexCache = null;
}

function rememberPlayer(player) {
  const key = sourceKey(player);
  overrides.__history = overrides.__history || {};
  overrides.__history[key] = { rating: player.rating, stars: player.stars, newRating: player.newRating, newStars: player.newStars };
}

function starCostFor(r) {
  if (r <= 72) return 0.5;
  if (r <= 78) return 1.0;
  if (r <= 84) return 1.5;
  if (r <= 90) return 2.0;
  if (r <= 94) return 3.0;
  if (r <= 98) return 4.0;
  return 5.0;
}

function negStarFor(r) {
  if (r <= 78) return 0.5;
  if (r <= 84) return 1.0;
  if (r <= 90) return 2.0;
  if (r <= 94) return 4.0;
  if (r <= 98) return 6.0;
  return 8.0;
}

function normalizeStarProgress(player) {
  let rating = Math.max(68, Math.min(105, Math.floor(num(player.rating, 68))));
  let stars = Math.max(0, num(player.stars, 0));
  while (rating < 105 && stars >= starCostFor(rating)) {
    stars -= starCostFor(rating);
    rating += 1;
  }
  if (rating >= 105) stars = Math.min(stars, starCostFor(105) - 0.1);
  stars = Math.round(stars * 10) / 10;
  return { ...player, rating, stars, newRating: rating, newStars: stars };
}

function applyOneUp(r, filled) {
  let rem = (num(filled) || 0) + 1;
  let curr = num(r, 68);
  while (rem >= starCostFor(curr)) {
    rem -= starCostFor(curr);
    curr += 1;
  }
  return { rating: curr, stars: Math.round(rem * 10) / 10 };
}

function applyOneDown(r, filled) {
  let curr = num(r, 68);
  let stars = num(filled);
  let debt = negStarFor(curr);
  if (stars >= debt) return { rating: curr, stars: Math.round((stars - debt) * 10) / 10 };
  debt -= stars;
  stars = 0;
  while (debt > 0 && curr > 50) {
    curr -= 1;
    const tier = starCostFor(curr);
    if (debt <= tier) {
      stars = tier - debt;
      debt = 0;
    } else {
      debt -= tier;
    }
  }
  return { rating: curr, stars: Math.round(stars * 10) / 10 };
}

function applyThumb(player, direction) {
  rememberPlayer(player);
  const result = direction === "up" ? applyOneUp(player.rating, player.stars) : applyOneDown(player.rating, player.stars);
  let rating = Math.max(68, Math.min(105, Math.floor(result.rating)));
  let stars = result.stars;
  if (rating >= 105 && stars >= starCostFor(105)) stars = starCostFor(105) - 0.1;
  persistPlayer(player, { rating, stars, newRating: rating, newStars: stars, thumb: direction === "up" ? "+1" : "-1" });
}

function applyThumbMath(player, direction, count = 1) {
  let rating = num(player.rating, 68);
  let stars = num(player.stars, 0);
  for (let i = 0; i < count; i += 1) {
    const result = direction === "up" ? applyOneUp(rating, stars) : applyOneDown(rating, stars);
    rating = Math.max(68, Math.min(105, Math.floor(result.rating)));
    stars = result.stars;
  }
  if (rating >= 105 && stars >= starCostFor(105)) stars = starCostFor(105) - 0.1;
  return { rating, stars, newRating: rating, newStars: stars, thumb: direction === "up" ? "+1" : "-1" };
}

function undoNudge(player) {
  const key = sourceKey(player);
  const previous = overrides.__history?.[key];
  if (!previous) return;
  persistPlayer(player, { ...previous, thumb: "" });
  delete overrides.__history[key];
  storage.set("nflz-player-overrides", overrides);
}

function table(headers, rows) {
  return `
    <table>
      <thead><tr>${headers.map((h) => `<th class="${h.cls || ""}" ${h.sort ? `data-sort="${h.sort}"` : ""} ${h.title ? `title="${esc(h.title)}"` : ""}>${h.label}</th>`).join("")}</tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table>
  `;
}

function metric(label, value, sub = "") {
  return `<div class="metric"><span>${label}</span><strong>${value}</strong><em>${sub}</em></div>`;
}

function select(id, value, options) {
  return `<select id="${id}">${options.map((option) => `<option ${String(option) === String(value) ? "selected" : ""}>${option}</option>`).join("")}</select>`;
}

function optionSelect(id, value, options) {
  return `<select id="${id}">${options.map((option) => {
    const item = Array.isArray(option) ? { value: option[0], label: option[1] } : { value: option, label: option };
    return `<option value="${esc(item.value)}" ${String(item.value) === String(value) ? "selected" : ""}>${esc(item.label)}</option>`;
  }).join("")}</select>`;
}

function dateOnly(value) {
  const date = value instanceof Date ? value : new Date(`${value}T12:00:00`);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function shortDate(value) {
  if (!value) return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function weekSortValue(week) {
  const text = String(week || "");
  if (text.startsWith("Pre")) return Number(text.replace("Pre", "")) - 10;
  return num(text, 999);
}

function scheduleWeekGroupKey(week) {
  const text = String(week || "");
  return text;
}

function weekDisplay(week) {
  const text = scheduleWeekGroupKey(week);
  if (text === "Pre0") return "Pre-Season Week 0";
  if (text.startsWith("Pre")) return `Pre-Season Week ${num(text.replace("Pre", ""), 0)}`;
  return `Week ${text}`;
}

function weekRange(week) {
  const key = scheduleWeekGroupKey(week);
  const games = calendarGames().filter((game) => scheduleWeekGroupKey(game.week) === key);
  if (!games.length) return "";
  const dates = games.map((game) => game.date).filter(Boolean).sort();
  const first = dates[0];
  const last = dates[dates.length - 1];
  return first === last ? shortDate(first) : `${shortDate(first)} - ${shortDate(last)}`;
}

function weekOptionLabel(week) {
  const range = weekRange(week);
  return `${weekDisplay(week)}${range ? ` (${range})` : ""}`;
}

function calendarGames() {
  return window.NFL_2026_CALENDAR?.games || [];
}

function scheduleGames() {
  const regular = state.data?.schedule || [];
  const calendar = calendarGames();
  if (!calendar.length) return regular;
  return calendar.map((game, index) => {
    const canonicalGame = { ...game, visitor: normalizeTeamName(game.visitor), home: normalizeTeamName(game.home) };
    const matched = regular.find((item) => String(item.week) === String(game.week) && normalizeTeamName(item.visitor) === canonicalGame.visitor && normalizeTeamName(item.home) === canonicalGame.home);
    return { ...(matched || {}), ...canonicalGame, calendarIndex: index, preseason: String(game.week).startsWith("Pre") };
  });
}

function scheduleWeekOptions(includeAll = true) {
  const weeks = unique(scheduleGames().map((game) => scheduleWeekGroupKey(game.week)).filter(Boolean)).sort((a, b) => weekSortValue(a) - weekSortValue(b));
  const options = weeks.map((week) => [week, weekOptionLabel(week)]);
  return includeAll ? [["All Weeks", "All Weeks"], ...options] : options;
}

function scheduleWeekMatches(game, selectedWeek) {
  return selectedWeek === "All Weeks" || scheduleWeekGroupKey(game.week) === scheduleWeekGroupKey(selectedWeek);
}

function autoSiteWeek(today = new Date()) {
  const groups = scheduleWeekOptions(false).map(([week]) => {
    const games = calendarGames().filter((game) => scheduleWeekGroupKey(game.week) === String(week));
    const dates = games.map((game) => game.date).filter(Boolean).sort();
    return { week, first: dates[0], last: dates[dates.length - 1] };
  }).filter((item) => item.first && item.last);
  if (!groups.length) return "";
  const current = dateOnly(today);
  const found = groups.find((item) => {
    const end = dateOnly(item.last);
    return current <= end;
  });
  return found?.week || groups[groups.length - 1].week;
}

function selectedSiteWeek() {
  return scheduleWeekGroupKey(state.siteWeek === "auto" ? autoSiteWeek() : state.siteWeek);
}

function siteWeekLabel() {
  const week = selectedSiteWeek();
  return week ? weekOptionLabel(week) : "Week not set";
}

function pill(value, cls = "") {
  return `<span class="pill ${cls}">${value}</span>`;
}

function renderNav() {
  const weekOptions = [["auto", `Auto: ${siteWeekLabel()}`], ...scheduleWeekOptions(false)];
  nav.innerHTML = pages.map(([id, label, low]) => `
    <button class="nav-btn ${state.page === id ? "active" : ""} ${low || ""}" data-page="${id}">
      <span>${label}</span><span>${state.page === id ? "*" : ""}</span>
    </button>
  `).join("");
  document.querySelector("#week-status")?.remove();
  document.querySelector(".brand")?.insertAdjacentHTML("afterend", `
    <section id="week-status" class="week-status">
      <span>Current View</span>
      <strong>${esc(siteWeekLabel())}</strong>
      ${optionSelect("site-week", state.siteWeek, weekOptions)}
    </section>
  `);
  document.querySelector("#site-week")?.addEventListener("change", (event) => {
    state.siteWeek = event.target.value;
    storage.set("nflz-site-week", state.siteWeek);
    state.scheduleWeek = state.siteWeek === "auto" ? selectedSiteWeek() : state.siteWeek;
    if (state.scheduleView === "season") state.scheduleView = "week";
    render();
  });
  nav.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
    state.page = button.dataset.page;
    render();
  }));
}

function wireSelect(id, key) {
  document.querySelector(`#${id}`)?.addEventListener("change", (event) => {
    state[key] = event.target.value;
    render();
  });
}

function liveBasePositions() {
  return ["QB", "RB", "WR", "TE", "LT", "LG", "C", "RG", "RT", "IDL", "EDGE", "LB", "CB", "S"];
}

function livePositionPreset(name) {
  if (name === "offense") return ["QB", "RB", "WR", "TE", "LT", "LG", "C", "RG", "RT"];
  if (name === "defense") return ["IDL", "EDGE", "LB", "CB", "S"];
  return liveBasePositions();
}

function livePositionMatches(slot, base) {
  if (!slot) return false;
  if (["RB", "WR", "TE", "IDL", "EDGE", "LB", "CB", "S", "QB"].includes(base)) return slot.startsWith(base);
  return slot === base;
}

function liveRosterColumns() {
  const selected = state.liveRosterPositions?.length ? state.liveRosterPositions : livePositionPreset("offense");
  if (state.liveDepthMode === "starters") {
    const starterSlots = state.data.teams[0]?.starters.map((s) => s.position) || [];
    return starterSlots.filter((slot) => selected.some((base) => livePositionMatches(slot, base)));
  }
  const depth = Number(state.liveDepthMode) || 1;
  return selected.flatMap((base) => Array.from({ length: depth }, (_, index) => ({ base, depth: index + 1, label: depth === 1 ? base : `${base}${index + 1}` })));
}

function liveRosterPlayer(team, column) {
  if (typeof column === "string") {
    const starter = team.starters.find((s) => s.position === column);
    if (!starter) return null;
    return findPlayerByName(starter.player) || { ...starter, team: team.team, teamAbbrev: state.data.meta.teamAbbrevs[team.team], depth: "", player: starter.player };
  }
  const rows = state.players
    .filter((p) => p.team === team.team && isPlayerAvailable(p) && livePositionMatches(groupPosition(p.position), column.base))
    .sort((a, b) => num(b.rating) - num(a.rating) || num(a.depth, 999) - num(b.depth, 999) || String(a.player).localeCompare(b.player));
  return rows[column.depth - 1] || null;
}

function livePlayerCell(player) {
  if (!player || !player.player) return "<span class='live-empty'>-</span>";
  const key = sourceKey(player);
  const depthLabel = player.depth ? `${player.position}${player.depth}` : player.position || "";
  return `<div class="live-player-cell">
    <span class="live-pos">${esc(depthLabel)}</span>
    ${playerNameButton(player)}
    ${ratingBadge(player.rating)}
  </div>`;
}

function liveColumnWidth(label, players) {
  const longest = Math.max(String(label || "").length, ...players.map((p) => String(p?.player || "").length));
  return Math.max(112, Math.min(235, Math.round((longest * 7.2) + 48)));
}

function liveRosterTable(headers, rows, widths) {
  return `
    <table class="live-dynamic-table" style="min-width:${widths.reduce((sum, width) => sum + width, 0)}px">
      <colgroup>${widths.map((width) => `<col style="width:${width}px" />`).join("")}</colgroup>
      <thead><tr>${headers.map((h) => `<th class="${h.cls || ""}">${h.label}</th>`).join("")}</tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table>
  `;
}

function overviewValue(team, col) {
  const ranks = teamStatRanksByName(team.team);
  if (ranks) {
    const mapped = {
      AC: ranks.offYardsRank,
      AD: ranks.offPointsRank,
      AE: ranks.offStatAvg,
      AF: ranks.defYardsAllowedRank,
      AG: ranks.defPointsAllowedRank,
      AH: ranks.defStatAvg,
      AI: ranks.rushYardsAllowedRank,
      AJ: ranks.rushTdAllowedRank,
      AK: ranks.rushAllowedStatAvg,
      AL: ranks.passYardsAllowedRank,
      AM: ranks.passTdAllowedRank,
      AN: ranks.passAllowedStatAvg,
    };
    if (mapped[col] !== undefined && mapped[col] !== null) return mapped[col];
    if (col === "U") {
      const offPenalty = Number.isFinite(Number(ranks.offStatAvg)) ? ranks.offStatAvg : "";
      return Number.isFinite(Number(offPenalty)) ? num(team.offenseAverage) - offPenalty : team.overview.find((x) => x.col === col)?.value;
    }
    if (col === "V") {
      const defPenalty = Number.isFinite(Number(ranks.defStatAvg)) ? ranks.defStatAvg : "";
      return Number.isFinite(Number(defPenalty)) ? num(team.defenseAverage) - defPenalty : team.overview.find((x) => x.col === col)?.value;
    }
    if (col === "P") {
      const u = overviewValue(team, "U");
      const v = overviewValue(team, "V");
      return Number.isFinite(Number(u)) && Number.isFinite(Number(v)) ? (num(u) + num(v)) / 2 : team.overview.find((x) => x.col === col)?.value;
    }
  }
  return team.overview.find((x) => x.col === col)?.value;
}

function liveMetricRows(team) {
  const statMode = state.liveRatingMode === "statrank";
  const offAverage = statMode ? overviewValue(team, "U") : team.offenseAverage;
  const defAverage = statMode ? overviewValue(team, "V") : team.defenseAverage;
  const overall = statMode ? overviewValue(team, "P") : team.overall;
  const offRating = Number.isFinite(Number(offAverage)) ? (num(offAverage) * 1.75) - 124 : "";
  const defRating = Number.isFinite(Number(defAverage)) ? (((num(defAverage) * 1.25) - 100) * -1) + 25 : "";
  return [
    ["Overall", overall, 80, 96],
    ["Off Avg", offAverage, 68, 102],
    ["Def Avg", defAverage, 68, 102],
    ["Off Rating", statMode ? offRating : team.offenseRating, 0, 36],
    ["Def Rating", statMode ? defRating : team.defenseRating, 0, 36],
  ];
}

function livePositionScore(team, label) {
  if (label === "OLine") return teamPositionScore(team, "OL");
  if (label === "Def Backs") return teamPositionScore(team, "Defensive Backs");
  return team.positionScores.find((s) => s.position === label)?.score;
}

function liveRatingCell(value, min = 68, max = 105, digits = 1) {
  return `<td class="num cf" ${cfStyle(value, min, max)}>${fmt(value, digits)}</td>`;
}

function renderLive() {
  if (!["starters", "ratings", "positions"].includes(state.liveView)) state.liveView = "starters";
  const subnav = `
    <div class="live-tabs">
      ${[["starters", "Starter Board"], ["ratings", "Rating Board"], ["positions", "Group Scores"]].map(([id, label]) => `<button class="${state.liveView === id ? "active" : ""}" data-live="${id}">${label}</button>`).join("")}
    </div>
  `;

  if (state.liveView === "starters") {
    const columns = liveRosterColumns();
    const columnLabels = columns.map((column) => typeof column === "string" ? column : column.label);
    const rowTeams = state.data.teams.filter(matches);
    const columnPlayers = columns.map((column) => rowTeams.map((team) => liveRosterPlayer(team, column)));
    const widths = [172, ...columnLabels.map((label, index) => liveColumnWidth(label, columnPlayers[index]))];
    const rows = state.data.teams.filter(matches).map((team) => `
      <tr>
        <td>${teamCellByName(team.team)}</td>
        ${columns.map((column) => `<td class="starter-cell group-${starterGroup(typeof column === "string" ? column : column.base)}">${livePlayerCell(liveRosterPlayer(team, column))}</td>`).join("")}
      </tr>
    `);
    setTimeout(() => {
      wireLiveControls();
      wirePlayerActions();
    });
    return `
      <section class="panel live-panel"><div class="live-shell">${subnav}${renderLiveRosterControls()}
        <div class="table-scroll live-roster-scroll">${liveRosterTable([{ label: "Team" }, ...columnLabels.map((label) => ({ label, cls: `group-${starterGroup(label)}` }))], rows, widths)}</div>
      </div>
      </section>${renderPlayerModal()}
    `;
  }

  if (state.liveView === "ratings") {
    const positionLabels = ["QB", "RB", "WR", "TE", "OLine", "IOL", "DL\n(DT + EDGE)", "LB + EDGE", "CB", "S", "Def Backs"];
    const rows = state.data.teams.filter(matches).sort((a, b) => num(b.overall) - num(a.overall)).map((team) => `
      <tr>
        <td>${teamCellByName(team.team)}</td>
        ${liveMetricRows(team).map(([, value, min, max]) => liveRatingCell(value, min, max, 1)).join("")}
        ${positionLabels.map((label) => liveRatingCell(livePositionScore(team, label), 68, 102, 1)).join("")}
      </tr>
    `);
    setTimeout(wireLiveControls);
    return `
      <section class="panel live-panel"><div class="live-shell">${subnav}
        <div class="toolbar live-rating-toolbar"><div><h2>Rating Board</h2><p>Team, unit, and position group scores ranked by overall rating.</p></div><div class="filters">${optionSelect("live-rating-mode", state.liveRatingMode, [["base", "Base Ratings"], ["statrank", "StatRanks Version"]])}</div></div>
        <div class="table-scroll live-rating-scroll">${table([{ label: "Team" }, ...liveMetricRows(state.data.teams[0]).map(([label]) => ({ label, cls: "num" })), ...positionLabels.map((label) => ({ label, cls: "num" }))], rows)}</div>
      </div>
      </section>
    `;
  }

  const scorePositions = state.data.teams[0]?.positionScores.map((s) => s.position) || [];
  const rows = state.data.teams.filter(matches).map((team) => `
    <tr>
      <td>${teamCellByName(team.team)}</td>
      ${team.positionScores.map((s) => `<td class="num cf" ${cfStyle(s.score, 68, 102)}><b>${fmt(s.score, 1)}</b><span class="letter">${s.letter || gradeFromScore(s.score)}</span></td>`).join("")}
    </tr>
  `);
  return `<section class="panel live-panel"><div class="live-shell">${subnav}<div class="table-scroll wide-live live-rating-scroll">${table([{ label: "Team" }, ...scorePositions.map((p) => ({ label: p, cls: "num" }))], rows)}</div></div></section>`;
}

function renderLiveRosterControls() {
  const selected = new Set(state.liveRosterPositions || []);
  const positionButtons = liveBasePositions().map((position) => `
    <label class="position-toggle ${selected.has(position) ? "active" : ""}">
      <input type="checkbox" class="live-position-check" value="${esc(position)}" ${selected.has(position) ? "checked" : ""} />
      <span>${esc(position)}</span>
    </label>
  `).join("");
  return `
    <div class="live-controls">
      <div class="live-control-head">
        <div>
          <h2>League Starter Board</h2>
          <p>Default offense view. Add defensive groups or expand each depth chart slot when needed.</p>
        </div>
        <div class="live-presets">
          <button class="mini-action live-preset" data-live-preset="offense">Offense</button>
          <button class="mini-action live-preset" data-live-preset="defense">Defense</button>
          <button class="mini-action live-preset" data-live-preset="all">All</button>
        </div>
      </div>
      <div class="live-control-row">
        <div class="position-toggle-grid">${positionButtons}</div>
        <div class="filters">${optionSelect("live-depth-mode", state.liveDepthMode, [["starters", "Starters"], ["1", "Depth 1"], ["2", "Depth 2"], ["3", "Depth 3"], ["4", "Depth 4"], ["5", "Depth 5"]])}</div>
      </div>
    </div>
  `;
}

function wireLiveControls() {
  document.querySelectorAll(".live-preset").forEach((button) => button.addEventListener("click", () => {
    state.liveRosterPositions = livePositionPreset(button.dataset.livePreset);
    render();
  }));
  document.querySelectorAll(".live-position-check").forEach((input) => input.addEventListener("change", () => {
    const selected = [...document.querySelectorAll(".live-position-check:checked")].map((item) => item.value);
    state.liveRosterPositions = selected.length ? selected : livePositionPreset("offense");
    render();
  }));
  document.querySelector("#live-depth-mode")?.addEventListener("change", (event) => {
    state.liveDepthMode = event.target.value;
    render();
  });
  document.querySelector("#live-rating-mode")?.addEventListener("change", (event) => {
    state.liveRatingMode = event.target.value;
    render();
  });
}


function starterGroup(position) {
  if (position?.startsWith("QB")) return "qb";
  if (position?.startsWith("RB")) return "rb";
  if (position?.startsWith("WR")) return "wr";
  if (position?.startsWith("TE")) return "te";
  if (["LT", "LG", "C", "RG", "RT"].includes(position)) return "ol";
  if (["IDL", "EDGE"].includes(position)) return "dl";
  if (position?.startsWith("LB")) return "lb";
  if (position?.startsWith("CB")) return "cb";
  if (position?.startsWith("S")) return "s";
  return "other";
}

const teamLogoMap = {
  "Arizona Cardinals": "ari", "Atlanta Falcons": "atl", "Baltimore Ravens": "bal", "Buffalo Bills": "buf",
  "Carolina Panthers": "car", "Chicago Bears": "chi", "Cincinnati Bengals": "cin", "Cleveland Browns": "cle",
  "Dallas Cowboys": "dal", "Denver Broncos": "den", "Detroit Lions": "det", "Green Bay Packers": "gb",
  "Houston Texans": "hou", "Indianapolis Colts": "ind", "Jacksonville Jaguars": "jax", "Kansas City Chiefs": "kc",
  "LA Chargers": "lac", "LA Rams": "lar", "Las Vegas Raiders": "lv", "Miami Dolphins": "mia",
  "Minnesota Vikings": "min", "New England Patriots": "ne", "New Orleans Saints": "no", "New York Giants": "nyg",
  "New York Jets": "nyj", "Philadelphia Eagles": "phi", "Pittsburgh Steelers": "pit", "San Francisco 49ers": "sf",
  "Seattle Seahawks": "sea", "Tampa Bay Buccaneers": "tb", "Tennessee Titans": "ten", "Washington Commanders": "wsh"
};

function teamLogo(team, abbrev) {
  const canonical = normalizeTeamName(team);
  const code = teamLogoMap[canonical] || teamLogoMap[team] || String(abbrev || "").toLowerCase();
  if (!code) return "";
  return `<img class="team-logo" src="https://a.espncdn.com/i/teamlogos/nfl/500/${code}.png" alt="" loading="lazy" onerror="this.style.display='none'" />`;
}

function teamCell(player) {
  const label = player.teamAbbrev || player.team || "";
  return `<span class="team-cell">${teamLogo(player.team, player.teamAbbrev)}<span title="${esc(player.team)}">${esc(label)}</span></span>`;
}

function teamByName(name) {
  const canonical = normalizeTeamName(name);
  return state.data?.teams?.find((team) => normalizeTeamName(team.team) === canonical)
    || Object.entries(state.data?.meta?.teamAbbrevs || {}).map(([team, abbrev]) => ({ team, teamAbbrev: abbrev })).find((team) => normalizeTeamName(team.team) === canonical)
    || null;
}

function teamCellByName(name) {
  const team = teamByName(name) || { team: name, teamAbbrev: name };
  return teamCell(team);
}

function teamCellFull(name) {
  const team = teamByName(name) || { team: name, teamAbbrev: name };
  return `<span class="team-cell team-cell-full">${teamLogo(team.team, team.teamAbbrev)}<span>${esc(team.team || name || "-")}</span></span>`;
}

function teamStatRanksByName(name) {
  const canonical = normalizeTeamName(name);
  return (window.TEAM_RANKINGS_SCAN?.teams || []).find((team) => normalizeTeamName(team.team) === canonical) || null;
}

const depthPositionOrder = ["QB", "HB", "RB", "WR", "SWR", "TE", "LT", "LG", "C", "RG", "RT", "IDL", "DT", "EDGE", "LEDG", "REDG", "DE", "LB", "MIKE", "MLB", "WILL", "SAM", "CB", "S", "FS", "SS"];
const depthOffensePositions = new Set(["QB", "HB", "RB", "WR", "SWR", "TE", "LT", "LG", "C", "RG", "RT"]);

function depthPositionRank(pos) {
  const normalized = String(pos || "").toUpperCase();
  const index = depthPositionOrder.indexOf(normalized);
  return index === -1 ? 999 : index;
}

function depthSideFor(player) {
  return depthOffensePositions.has(String(player?.position || "").toUpperCase()) ? "Offense" : "Defense";
}

function positionChipClass(pos) {
  return `pos-${String(pos || "UNK").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function fillPct(value, min = 68, max = 105) {
  const n = Math.max(min, Math.min(max, num(value, min)));
  return Math.round(((n - min) / (max - min)) * 100);
}

function ratingBadge(value) {
  const pct = fillPct(value);
  return `<span class="rating-fill" style="--pct:${pct}%; --rating-bg:${ratingScaleColor(value, 68, 100)}"><span>${fmt(value, 0)}</span></span>`;
}

function depthBadge(value) {
  if (String(value || "").toUpperCase() === "INJ" || String(value || "").toUpperCase() === "SUS") {
    const label = String(value).toUpperCase();
    return `<span class="depth-badge unavailable ${label.toLowerCase()}">${label}</span>`;
  }
  const n = num(value, 0);
  const cls = n <= 1 ? "starter" : n <= 3 ? "rotation" : "reserve";
  return `<span class="depth-badge ${cls}">${fmt(value, 0)}</span>`;
}

function injuryStatusText(player) {
  return String(player?.injury || "Healthy").trim();
}

function playerUnavailableLabel(player) {
  const status = injuryStatusText(player);
  if (!status || /^healthy$/i.test(status)) return "";
  return /suspended/i.test(status) ? "SUS" : "INJ";
}

function isPlayerAvailable(player) {
  return !playerUnavailableLabel(player);
}

function starsMeter(player) {
  const stars = Math.max(0, num(player?.stars, 0));
  const cost = starCostFor(num(player?.rating, 68));
  const pct = Math.max(0, Math.min(100, Math.round((stars / Math.max(cost, 0.1)) * 100)));
  return `<span class="stars-meter" title="${fmt(stars, 1)} of ${fmt(cost, 1)} stars needed for next rating"><span style="width:${pct}%"></span><b>${fmt(stars, 1)}/${fmt(cost, 1)}</b></span>`;
}

function nudgeControls(player) {
  const key = esc(playerKey(player));
  return `<span class="nudge-controls"><button class="icon thumb up" title="Nudge up" data-dir="up" data-player-key="${key}">+1</button><button class="icon thumb down" title="Nudge down" data-dir="down" data-player-key="${key}">-1</button><button class="icon undo" title="Undo last nudge" data-player-key="${key}">Undo</button></span>`;
}


const ourladsUrl = "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx";
const ourladsProxyUrl = "/api/ourlads-depth";
const externalTeamNames = {
  "Los Angeles Chargers": "LA Chargers",
  "Los Angeles Rams": "LA Rams",
  "Arizona Cardinals": "Arizona Cardinals",
  "Atlanta Falcons": "Atlanta Falcons",
  "Baltimore Ravens": "Baltimore Ravens",
  "Buffalo Bills": "Buffalo Bills",
  "Carolina Panthers": "Carolina Panthers",
  "Chicago Bears": "Chicago Bears",
  "Cincinnati Bengals": "Cincinnati Bengals",
  "Cleveland Browns": "Cleveland Browns",
  "Dallas Cowboys": "Dallas Cowboys",
  "Denver Broncos": "Denver Broncos",
  "Detroit Lions": "Detroit Lions",
  "Green Bay Packers": "Green Bay Packers",
  "Houston Texans": "Houston Texans",
  "Indianapolis Colts": "Indianapolis Colts",
  "Jacksonville Jaguars": "Jacksonville Jaguars",
  "Kansas City Chiefs": "Kansas City Chiefs",
  "Las Vegas Raiders": "Las Vegas Raiders",
  "Miami Dolphins": "Miami Dolphins",
  "Minnesota Vikings": "Minnesota Vikings",
  "New England Patriots": "New England Patriots",
  "New Orleans Saints": "New Orleans Saints",
  "New York Giants": "New York Giants",
  "New York Jets": "New York Jets",
  "Philadelphia Eagles": "Philadelphia Eagles",
  "Pittsburgh Steelers": "Pittsburgh Steelers",
  "San Francisco 49ers": "San Francisco 49ers",
  "Seattle Seahawks": "Seattle Seahawks",
  "Tampa Bay Buccaneers": "Tampa Bay Buccaneers",
  "Tennessee Titans": "Tennessee Titans",
  "Washington Commanders": "Washington Commanders",
};

function normalizeScheduleTeam(teamName) {
  return externalTeamNames[teamName] || teamName || "";
}

function normalizeTeamName(name) {
  return externalTeamNames[String(name || "").trim()] || String(name || "").trim();
}

function stripDepthPositionNoiseName(name) {
  return String(name || "")
    .split(/\s+/)
    .filter((part) => {
      const token = part.replace(/[^A-Za-z]/g, "");
      return !(token.length > 1 && token === token.toUpperCase() && depthNameNoiseTokens.has(token));
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanPlayerName(name) {
  return stripDepthPositionNoiseName(name)
    .replace(/\b([A-Za-z])\.\s*([A-Za-z])\.\s*([A-Za-z])\.\s*/g, "$1$2$3 ")
    .replace(/\b([A-Za-z])\.\s*([A-Za-z])\.\s*/g, "$1$2 ")
    .replace(/\s*\(R\)\s*/g, " ")
    .replace(/\s*\((?:\d{2}\/\d|UD)\)\s*/gi, " ")
    .replace(/\s*\((?!R\))[^()]+\)\s*$/gi, " ")
    .replace(/\b(Jr\.?|Sr\.?|II|III|IV|V)\b/gi, "")
    .replace(/[^a-zA-Z' -]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function compactPlayerName(name) {
  return cleanPlayerName(name).replace(/\s+/g, "");
}

function baseReviewPlayerName(name) {
  const value = stripDepthPositionNoiseName(name);
  const suffix = value.match(/\s*\(([^()]+)\)\s*$/);
  if (!suffix || /^R$/i.test(suffix[1])) return value;
  return value.slice(0, suffix.index).trim();
}

function hasReviewIdentityTag(name) {
  const suffix = String(name || "").trim().match(/\(([^()]+)\)\s*$/);
  return Boolean(suffix && !/^R$/i.test(suffix[1]));
}

function candidateIdentityTag(candidate) {
  return candidate?.school || candidate?.draftTag || "School needed";
}

function depthCandidateRemovalKey(item, candidate) {
  return [
    cleanPlayerName(baseReviewPlayerName(item?.player)),
    normalizeTeamName(candidate?.team),
    candidateIdentityTag(candidate),
  ].join("__");
}

function activeDepthCheckCandidates(item) {
  return (item?.candidates || []).filter((candidate) => !depthCandidateRemovals[depthCandidateRemovalKey(item, candidate)]);
}

function depthCheckIgnoreKey(item) {
  if (!item) return "";
  return [
    item.kind || "",
    cleanPlayerName(item.player || ""),
    normalizeTeamName(item.fromTeam || ""),
    normalizeTeamName(item.toTeam || ""),
    cleanPlayerName(String(item.candidates?.map((candidate) => `${candidate.player || ""}:${candidate.team || ""}:${candidateIdentityTag(candidate)}`).join("|") || "")),
  ].join("__");
}

function depthCheckResolvedKey(item) {
  if (!item) return "";
  return [
    item.kind || "",
    item.playerKey || "",
    cleanPlayerName(item.player || ""),
    normalizeTeamName(item.fromTeam || ""),
    normalizeTeamName(item.toTeam || ""),
    cleanPlayerName(String(item.candidates?.map((candidate) => `${candidate.player || ""}:${candidate.team || ""}:${candidateIdentityTag(candidate)}`).join("|") || "")),
  ].join("__");
}

function markDepthCheckResolved(item) {
  const key = depthCheckResolvedKey(item);
  if (!key) return;
  depthResolvedResults[key] = true;
  storage.set("nflz-depth-resolved-results", depthResolvedResults);
}

function resetDepthNameMatchCache() {
  depthNameMatchCache = { signature: "", map: new Map(), missingByLast: new Map() };
}

function bumpDepthCheckVersion() {
  state.depthCheckVersion += 1;
  resetDepthNameMatchCache();
}

function depthNameMatchSignature() {
  return `${state.depthCheckVersion}:${state.depthCheck?.results?.length || 0}:${window.OURLADS_DEPTH_CHECK?.fetchedAt || ""}`;
}

function depthMissingCandidatesByLastName() {
  if (depthNameMatchCache.missingByLast.size) return depthNameMatchCache.missingByLast;
  const rawMissing = (window.OURLADS_DEPTH_CHECK?.results || []).filter((candidate) => candidate.kind === "missing-player");
  const visibleMissing = (state.depthCheck.results || []).filter((candidate) => candidate.kind === "missing-player");
  const seen = new Set();
  [...visibleMissing, ...rawMissing].map(sanitizeDepthCheckItem).forEach((candidate) => {
    const key = `${cleanPlayerName(candidate.player)}__${candidate.toTeam}`;
    if (seen.has(key)) return;
    seen.add(key);
    const last = lastNameKey(candidate.player);
    if (!last) return;
    if (!depthNameMatchCache.missingByLast.has(last)) depthNameMatchCache.missingByLast.set(last, []);
    depthNameMatchCache.missingByLast.get(last).push(candidate);
  });
  return depthNameMatchCache.missingByLast;
}

function sanitizeDepthCheckItem(rawItem) {
  if (!rawItem) return rawItem;
  return {
    ...rawItem,
    player: stripDepthPositionNoiseName(rawItem.player),
    candidates: (rawItem.candidates || []).map((candidate) => ({
      ...candidate,
      player: stripDepthPositionNoiseName(candidate.player || rawItem.player),
    })),
  };
}

let playerAvatarIndex = null;

function buildPlayerAvatarIndex() {
  const byName = new Map();
  const byNameTeam = new Map();
  const byCompact = new Map();
  const byCompactTeam = new Map();
  maddenRows.forEach((row) => {
    if (!row.avatarUrl) return;
    const name = cleanPlayerName(row.player);
    const compact = compactPlayerName(row.player);
    const team = normalizeTeamName(row.team);
    if (!byName.has(name)) byName.set(name, row.avatarUrl);
    if (!byCompact.has(compact)) byCompact.set(compact, row.avatarUrl);
    byNameTeam.set(`${name}__${team}`, row.avatarUrl);
    byCompactTeam.set(`${compact}__${team}`, row.avatarUrl);
  });
  return { byName, byNameTeam, byCompact, byCompactTeam };
}

function playerAvatarUrl(player) {
  if (!player) return "";
  playerAvatarIndex = playerAvatarIndex || buildPlayerAvatarIndex();
  const name = cleanPlayerName(player.player);
  const compact = compactPlayerName(player.player);
  const team = normalizeTeamName(player.team);
  return playerAvatarIndex.byNameTeam.get(`${name}__${team}`)
    || playerAvatarIndex.byCompactTeam.get(`${compact}__${team}`)
    || playerAvatarIndex.byName.get(name)
    || playerAvatarIndex.byCompact.get(compact)
    || "";
}

function playerAvatar(player, size = "sm") {
  const url = playerAvatarUrl(player);
  const fallback = esc(String(player?.player || "?").trim().slice(0, 1) || "?");
  return url
    ? `<img class="player-avatar ${size}" src="${esc(url)}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'player-avatar ${size} empty',textContent:'${fallback}'}))" />`
    : `<span class="player-avatar ${size} empty">${fallback}</span>`;
}

function playerNameButton(player, className = "link player-open") {
  return `<button class="${className}" data-player-key="${esc(sourceKey(player))}">${playerAvatar(player)}<span>${esc(player.player)}</span></button>`;
}

function ourladsPlayerName(raw) {
  let value = String(raw || "").replace(/\s+/g, " ").trim();
  value = value.replace(/\s+(?:\d{2}\/\d|[A-Z]{1,2}\/[A-Za-z]+|[A-Z]{1,3}\d{2}\*?|[A-Z]{1,3})$/i, "").trim();
  if (!value.includes(",")) return "";
  const stripPositionEdges = (part) => {
    const pieces = String(part || "").split(/\s+/).filter(Boolean);
    while (pieces.length > 1 && ourladsPositionTokens.has(pieces[0].toUpperCase())) pieces.shift();
    while (pieces.length > 1 && ourladsPositionTokens.has(pieces.at(-1).toUpperCase())) pieces.pop();
    return pieces.join(" ");
  };
  const [last, first] = value.split(",", 2).map((part) => stripPositionEdges(part.trim()));
  if (!first || !last) return "";
  return `${first} ${last}`.replace(/\s+/g, " ").trim();
}

function parseOurladsDepthChart(text) {
  const teamNames = Object.keys(externalTeamNames);
  let readable = text;
  try {
    const doc = new DOMParser().parseFromString(text, "text/html");
    readable = doc.body?.innerText || text;
  } catch {}
  const lines = readable.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const players = new Map();
  let currentTeam = "";
  lines.forEach((line) => {
    const updatedTeam = teamNames.find((team) => line.includes(team) && /Updated:/i.test(line));
    if (updatedTeam) {
      currentTeam = normalizeTeamName(updatedTeam);
      return;
    }
    const sectionTeam = line.match(/^(?:Offense|Defense|Special Teams|Reserves)\s+-\s+(.+)$/i);
    if (sectionTeam) currentTeam = normalizeTeamName(sectionTeam[1]);
    if (!currentTeam) return;
    line.split(/\t|\s{2,}|\|/).forEach((cell) => {
      const parsed = ourladsPlayerName(cell);
      if (!parsed) return;
      const key = cleanPlayerName(parsed);
      if (!key) return;
      if (!players.has(key)) players.set(key, new Set());
      players.get(key).add(currentTeam);
    });
  });
  return players;
}

function buildDepthCheckResults(ourladsPlayers) {
  return state.players.map((player) => {
    const teams = [...(ourladsPlayers.get(cleanPlayerName(player.player)) || [])];
    if (!teams.length) return { kind: "free-agent", playerKey: sourceKey(player), player: player.player, fromTeam: player.team, toTeam: "Free Agent", confidence: "not found" };
    if (teams.length > 1) return { kind: "duplicate", playerKey: sourceKey(player), player: player.player, fromTeam: player.team, toTeam: teams.join(", "), confidence: "duplicate name" };
    const toTeam = teams[0];
    if (toTeam === player.team) return null;
    return { kind: "move", playerKey: sourceKey(player), player: player.player, fromTeam: player.team, toTeam, confidence: "name match" };
  }).filter(Boolean);
}

function unresolvedDepthCheckResults(results) {
  const playerByKey = new Map();
  const playerByNameTeamPos = new Map();
  const playerByNameTeam = new Map();
  const playerByName = new Map();
  const duplicatePlayersByBaseName = new Map();
  state.players.forEach((player) => {
    const source = sourceKey(player);
    const key = playerKey(player);
    const name = cleanPlayerName(player.player);
    const base = cleanPlayerName(baseReviewPlayerName(player.player));
    playerByKey.set(source, player);
    playerByKey.set(key, player);
    playerByNameTeamPos.set(`${name}__${player.team}__${player.position}`, player);
    playerByNameTeam.set(`${name}__${player.team}`, player);
    if (!playerByName.has(name)) playerByName.set(name, player);
    if (!duplicatePlayersByBaseName.has(base)) duplicatePlayersByBaseName.set(base, []);
    duplicatePlayersByBaseName.get(base).push(player);
  });
  const findIndexedPlayer = (item) => {
    if (!item) return null;
    const keyParts = String(item.playerKey || "").split("__");
    const keyPlayer = keyParts[0] || item.player;
    const keyTeam = keyParts[1] || item.fromTeam;
    const keyPos = keyParts[2] || "";
    const itemName = cleanPlayerName(item.player);
    const keyName = cleanPlayerName(keyPlayer);
    return playerByKey.get(item.playerKey)
      || playerByNameTeamPos.get(`${itemName}__${item.fromTeam}__${keyPos}`)
      || playerByNameTeamPos.get(`${keyName}__${keyTeam}__${keyPos}`)
      || playerByNameTeam.get(`${itemName}__${item.fromTeam}`)
      || playerByName.get(itemName)
      || null;
  };
  return (results || []).map((rawItem) => {
    const item = sanitizeDepthCheckItem(rawItem);
    if (item.applied || item.ignored) return null;
    if (depthIgnoredResults[depthCheckIgnoreKey(item)]) return null;
    if (depthResolvedResults[depthCheckResolvedKey(item)]) return null;
    if (item.kind !== "duplicate") return item;
    const candidates = activeDepthCheckCandidates(item);
    if (!candidates.length) return null;
    if (candidates.length === 1) {
      const candidate = candidates[0];
      return {
        ...item,
        kind: "move",
        toTeam: candidate.team,
        confidence: "team changed after duplicate review",
        candidates,
      };
    }
    return {
      ...item,
      candidates,
      toTeam: candidates.map((candidate) => candidate.label || `${candidate.team} (${candidate.draftTag || "UD"})`).join(", "),
    };
  }).filter(Boolean).filter((item) => !depthIgnoredResults[depthCheckIgnoreKey(item)] && !depthResolvedResults[depthCheckResolvedKey(item)]).filter((item) => {
    const player = findIndexedPlayer(item);
    if (item.kind === "missing-player") {
      const exists = playerByNameTeam.has(`${cleanPlayerName(item.player)}__${item.toTeam}`);
      return !exists;
    }
    if (!player) return true;
    if (item.kind === "free-agent" && cleanPlayerName(player.player) !== cleanPlayerName(item.player)) return false;
    if ((item.kind === "move" || item.kind === "free-agent") && player.team === item.toTeam) return false;
    if (item.kind === "duplicate") {
      const sameNamePlayers = duplicatePlayersByBaseName.get(cleanPlayerName(baseReviewPlayerName(item.player))) || [];
      if (sameNamePlayers.length && sameNamePlayers.every((entry) => hasReviewIdentityTag(entry.player))) return false;
    }
    return true;
  });
}

async function runDepthChartCheck() {
  state.depthCheckVisibleLimit = 250;
  state.depthCheckNotice = "";
  state.depthCheck = { status: "checking", results: [], error: "Connecting to OurLads", source: "live" };
  render();
  try {
    if (window.OURLADS_DEPTH_CHECK?.results?.length) {
      state.depthCheck = {
        status: "review",
        results: unresolvedDepthCheckResults(window.OURLADS_DEPTH_CHECK.results),
        error: "",
        source: "codex",
        fetchedAt: window.OURLADS_DEPTH_CHECK.fetchedAt,
      };
      bumpDepthCheckVersion();
      render();
      return;
    }
    let text = "";
    if (location.protocol === "file:" && window.OURLADS_DEPTH_HTML) {
      text = window.OURLADS_DEPTH_HTML;
      state.depthCheck = { status: "checking", results: [], error: `Using cached OurLads page from ${window.OURLADS_DEPTH_FETCHED_AT || "local file"}`, source: "cache" };
      render();
    } else {
      const proxyResponse = await fetch(ourladsProxyUrl, { cache: "no-store" });
      const response = proxyResponse.ok ? proxyResponse : await fetch(ourladsUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`OurLads returned ${response.status}`);
      text = await response.text();
    }
    state.depthCheck = { status: "checking", results: [], error: "Comparing OurLads roster names against your depth charts", source: "live" };
    render();
    const parsed = parseOurladsDepthChart(text);
    if (parsed.size < 500) throw new Error(`Only found ${parsed.size} players in the OurLads page`);
    state.depthCheck = { status: "review", results: unresolvedDepthCheckResults(buildDepthCheckResults(parsed)), error: "", source: location.protocol === "file:" ? "cache" : "live" };
    bumpDepthCheckVersion();
  } catch (error) {
    const fileHint = location.protocol === "file:" ? " File-opened pages cannot scan the internet directly; use the cached OurLads file, refresh it with refresh-ourlads-cache.bat, or open the local server URL." : "";
    state.depthCheck = { status: "paste", results: [], error: `The browser blocked the live scan.${fileHint} Open OurLads, select the page, copy it, then paste it here.`, source: "paste" };
  }
  render();
}

function runDepthChartPasteCheck() {
  state.depthCheckVisibleLimit = 250;
  state.depthCheckNotice = "";
  const value = document.querySelector("#depth-check-paste")?.value || "";
  if (!value.trim()) return;
  const parsed = parseOurladsDepthChart(value);
  if (parsed.size < 500) {
    state.depthCheck = { status: "paste", results: [], error: `Paste the full OurLads all-teams chart before reviewing. I only found ${parsed.size} players.`, source: "paste" };
    render();
    return;
  }
  state.depthCheck = { status: "review", results: unresolvedDepthCheckResults(buildDepthCheckResults(parsed)), error: "", source: "paste" };
  bumpDepthCheckVersion();
  render();
}

function findDepthCheckPlayer(item) {
  if (!item) return null;
  const keyParts = String(item.playerKey || "").split("__");
  const keyPlayer = keyParts[0] || item.player;
  const keyTeam = keyParts[1] || item.fromTeam;
  const keyPos = keyParts[2] || "";
  return findPlayer(item.playerKey)
    || state.players.find((p) => cleanPlayerName(p.player) === cleanPlayerName(item.player) && p.team === item.fromTeam && (!keyPos || p.position === keyPos))
    || state.players.find((p) => cleanPlayerName(p.player) === cleanPlayerName(keyPlayer) && p.team === keyTeam && (!keyPos || p.position === keyPos))
    || state.players.find((p) => cleanPlayerName(p.player) === cleanPlayerName(item.player) && p.team === item.fromTeam)
    || state.players.find((p) => cleanPlayerName(p.player) === cleanPlayerName(item.player));
}

function findDuplicateDepthCheckPlayers(item) {
  if (!item) return [];
  const baseName = cleanPlayerName(baseReviewPlayerName(item.player));
  if (!baseName) return [];
  return state.players.filter((player) => cleanPlayerName(baseReviewPlayerName(player.player)) === baseName);
}

function applyDepthCheckResult(index, overrideTeam = "", shouldRender = true) {
  const item = state.depthCheck.results[index];
  if (!item || item.ignored) return;
  const toTeam = overrideTeam || item.toTeam;
  if (item.kind === "duplicate" && !overrideTeam) return;
  const player = findDepthCheckPlayer(item);
  if (!player) {
    state.depthCheckNotice = `Could not find ${item.player} in your current players. Refresh the scan and try again.`;
    if (shouldRender) render();
    return;
  }
  const patch = toTeam === "Free Agent"
    ? { team: "Free Agent", teamAbbrev: "FA" }
    : { team: toTeam, teamAbbrev: state.data.meta.teamAbbrevs[toTeam] || toTeam };
  if (toTeam === "Free Agent") Object.assign(patch, applyThumbMath(player, "down", 2));
  persistPlayer(player, patch);
  item.applied = true;
  item.appliedTo = toTeam;
  markDepthCheckResolved(item);
  state.players = applyOverrides(state.data.players);
  if (shouldRender) {
    bumpDepthCheckVersion();
    render();
  }
}

function applyAllDepthCheckResults() {
  applyDepthCheckActivity(state.depthCheckActivity);
}

function depthCheckActivityLabel(item) {
  if (!item) return "";
  if (item.kind === "move") return "Team Changed";
  if (item.kind === "free-agent") return freeAgentNameMatchCandidates(item).length ? "Name Match Suggested" : "Free Agent";
  if (item.kind === "missing-player") return "Missing Player";
  if (item.kind === "duplicate") return "Duplicate Name";
  return item.confidence || item.kind || "Review";
}

function depthCheckActivityOptions() {
  const pending = (state.depthCheck.results || []).filter((item) => !item.applied && !item.ignored);
  const counts = pending.reduce((map, item) => {
    const label = depthCheckActivityLabel(item);
    map[label] = (map[label] || 0) + 1;
    return map;
  }, {});
  const labels = unique(pending.map(depthCheckActivityLabel));
  const order = ["Team Changed", "Name Match Suggested", "Free Agent", "Duplicate Name", "Missing Player"];
  const sorted = labels.sort((a, b) => (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b)) || a.localeCompare(b));
  return [["All Activities", `All Activities (${pending.length})`], ...sorted.map((label) => [label, `${label} (${counts[label] || 0})`])];
}

function pendingDepthActivityRows(activity = state.depthCheckActivity) {
  return (state.depthCheck.results || [])
    .map((item, index) => ({ item, index, activity: depthCheckActivityLabel(item) }))
    .filter((row) => !row.item.applied && !row.item.ignored)
    .filter((row) => activity === "All Activities" || row.activity === activity);
}

function applyDepthCheckActivity(activity = state.depthCheckActivity) {
  const rows = pendingDepthActivityRows(activity);
  if (activity === "All Activities") {
    rows.forEach(({ item, index }) => {
      if (item.kind === "move" || (item.kind === "free-agent" && !freeAgentNameMatchCandidates(item).length)) applyDepthCheckResult(index, "", false);
    });
    state.depthCheck.results = unresolvedDepthCheckResults(state.depthCheck.results);
    bumpDepthCheckVersion();
    render();
    return;
  }
  if (activity === "Missing Player") {
    addAllMissingDepthCheckPlayers();
    return;
  }
  rows.forEach(({ item, index }) => {
    if (activity === "Team Changed" && item.kind === "move") applyDepthCheckResult(index, "", false);
    if (activity === "Free Agent" && item.kind === "free-agent" && !freeAgentNameMatchCandidates(item).length) applyDepthCheckResult(index, "", false);
    if (activity === "Name Match Suggested" && item.kind === "free-agent") {
      const matches = freeAgentNameMatchCandidates(item);
      if (matches.length === 1) applyDepthCheckNameMatch(index, matches[0].player, matches[0].toTeam || "", false);
    }
  });
  state.depthCheck.results = unresolvedDepthCheckResults(state.depthCheck.results);
  bumpDepthCheckVersion();
  render();
}

function depthCheckRowKey(item, index) {
  return `${item?.playerKey || index}__${depthCheckIgnoreKey(item)}`;
}

function depthCheckIndexFromKey(key) {
  return (state.depthCheck.results || []).findIndex((item, index) => depthCheckRowKey(item, index) === key);
}

function depthCheckSelectableAction(item, activity = depthCheckActivityLabel(item)) {
  if (!item || item.applied || item.ignored) return null;
  if (item.kind === "move") return { type: "apply" };
  if (item.kind === "missing-player") return { type: "add" };
  if (item.kind === "free-agent") {
    const matches = freeAgentNameMatchCandidates(item);
    if (matches.length === 1) return { type: "name", match: matches[0] };
    if (activity === "Free Agent" && !matches.length) return { type: "apply" };
  }
  return null;
}

function depthCheckNameAction(item) {
  if (!item || item.kind !== "free-agent" || item.applied || item.ignored) return null;
  const matches = freeAgentNameMatchCandidates(item);
  return matches.length ? { type: "name", match: matches[0] } : null;
}

function applyDepthCheckSelectable(index, action) {
  if (!action) return;
  if (action.type === "apply") applyDepthCheckResult(index, action.toTeam || "", false);
  if (action.type === "add") addMissingDepthCheckPlayer(index, false);
  if (action.type === "name") applyDepthCheckNameMatch(index, action.match?.player, action.match?.toTeam || "", false);
}

function lastNameKey(name) {
  const parts = cleanPlayerName(baseReviewPlayerName(name)).split(/\s+/).filter(Boolean);
  while (parts.length > 1 && /^(jr|sr|ii|iii|iv|v)$/.test(parts.at(-1))) parts.pop();
  return parts.at(-1) || "";
}

function nameTokens(name) {
  const parts = cleanPlayerName(baseReviewPlayerName(name)).split(/\s+/).filter(Boolean);
  if (parts.length > 2 && parts[0].length === 1 && parts[1].length === 1) {
    return [`${parts[0]}${parts[1]}`, ...parts.slice(2)].filter((part) => part.length > 1);
  }
  return parts.filter((part) => part.length > 1);
}

function nameVariantScore(sourceName, candidateName) {
  const source = nameTokens(sourceName);
  const candidate = nameTokens(candidateName);
  if (!source.length || !candidate.length) return 0;
  const sourceLast = lastNameKey(sourceName);
  const candidateLast = lastNameKey(candidateName);
  let score = 0;
  if (sourceLast === candidateLast) score += 6;
  const shared = candidate.filter((part) => source.includes(part)).length;
  score += shared * 2;
  if (source[0] && candidate[0] && (source[0] === candidate[0] || source[0].startsWith(candidate[0]) || candidate[0].startsWith(source[0]))) score += 3;
  return score;
}

function freeAgentNameMatchCandidates(item) {
  if (!item || item.kind !== "free-agent") return [];
  const signature = depthNameMatchSignature();
  if (depthNameMatchCache.signature !== signature) depthNameMatchCache = { signature, map: new Map(), missingByLast: new Map() };
  const cacheKey = depthCheckIgnoreKey(item);
  if (depthNameMatchCache.map.has(cacheKey)) return depthNameMatchCache.map.get(cacheKey);
  const player = findDepthCheckPlayer(item);
  const itemLast = lastNameKey(item.player);
  const itemPosition = groupPosition(player?.position || "");
  const candidates = depthMissingCandidatesByLastName().get(itemLast) || [];
  const matches = candidates
    .map((candidate) => {
      const candidateInfo = candidate.candidates?.[0] || {};
      const nameScore = nameVariantScore(item.player, candidate.player);
      let score = 0;
      if (candidate.toTeam === item.fromTeam) score += 5;
      if (candidate.toTeam !== "Free Agent" && candidate.toTeam !== item.fromTeam) score -= 2;
      if (lastNameKey(candidate.player) === itemLast) score += 5;
      if (itemPosition && groupPosition(candidateInfo.position || "") === itemPosition) score += 2;
      score += nameScore;
      return { ...candidate, score, nameScore };
    })
    .filter((candidate) => candidate.nameScore >= 10 && candidate.score >= 12)
    .sort((a, b) => b.score - a.score || String(a.player).localeCompare(b.player))
    .slice(0, 3);
  depthNameMatchCache.map.set(cacheKey, matches);
  return matches;
}

function applyDepthCheckNameMatch(freeAgentIndex, matchName, matchTeam, shouldRender = true) {
  const item = state.depthCheck.results[freeAgentIndex];
  if (!item || item.kind !== "free-agent" || !matchName) return;
  const player = findDepthCheckPlayer(item);
  if (!player) {
    const existingMatch = state.players.find((entry) => {
      if (cleanPlayerName(entry.player) !== cleanPlayerName(matchName)) return false;
      return !matchTeam || matchTeam === "Free Agent" || entry.team === matchTeam;
    });
    if (existingMatch) {
      item.applied = true;
      item.appliedTo = `already renamed to ${matchName}`;
      markDepthCheckResolved(item);
      (state.depthCheck.results || []).forEach((candidate) => {
        if (candidate.kind === "missing-player" && cleanPlayerName(candidate.player) === cleanPlayerName(matchName) && (!matchTeam || candidate.toTeam === matchTeam)) {
          candidate.applied = true;
          candidate.appliedTo = "matched existing player";
          markDepthCheckResolved(candidate);
        }
      });
      state.depthCheckNotice = `${baseReviewPlayerName(matchName)} is already in your players, so I marked that scan item resolved.`;
      if (shouldRender) {
        state.depthCheck.results = unresolvedDepthCheckResults(state.depthCheck.results);
        bumpDepthCheckVersion();
        render();
      }
      return;
    }
    state.depthCheckNotice = `Could not find ${item.player} in your current players. It may already be renamed, but I could not confirm the suggested OurLads player.`;
    if (shouldRender) render();
    return;
  }
  const patch = { player: baseReviewPlayerName(matchName) };
  if (matchTeam && matchTeam !== "Free Agent") {
    patch.team = matchTeam;
    patch.teamAbbrev = state.data.meta.teamAbbrevs[matchTeam] || matchTeam;
  }
  persistPlayer(player, patch);
  item.applied = true;
  item.appliedTo = `renamed to ${matchName}`;
  markDepthCheckResolved(item);
  state.depthCheckNotice = `Applied name change for ${baseReviewPlayerName(matchName)}.`;
  (state.depthCheck.results || []).forEach((candidate) => {
    if (candidate.kind === "missing-player" && cleanPlayerName(candidate.player) === cleanPlayerName(matchName) && candidate.toTeam === matchTeam) {
      candidate.applied = true;
      candidate.appliedTo = "matched existing player";
      markDepthCheckResolved(candidate);
    }
  });
  state.players = applyOverrides(state.data.players);
  if (shouldRender) {
    state.depthCheck.results = unresolvedDepthCheckResults(state.depthCheck.results);
    bumpDepthCheckVersion();
    render();
  }
}

function missingDepthCheckDefaultRating(candidate = {}) {
  const school = String(candidate.school || "").trim().toLowerCase();
  const draft = String(candidate.draftTag || "").trim();
  const match = draft.match(/^(\d{2})\/(\d{1,2})$/);
  if (school === "lsu") return 69;
  if (!match) return 68;
  const year = Number(match[1]);
  const round = Number(match[2]);
  if (year === 26) return 69;
  if (year >= 24 && year <= 26 && round >= 1 && round <= 4) return 69;
  return 68;
}

function missingPlayerFromDepthCheck(item) {
  const candidate = item?.candidates?.[0] || {};
  const team = item.toTeam || candidate.team || "Free Agent";
  const rawPosition = candidate.position || "WR";
  const position = modelPosition({ player: item.player, team, teamAbbrev: state.data.meta.teamAbbrevs[team] || team, position: rawPosition }) || fallbackModelPosition(rawPosition);
  if (!position) return null;
  const defaultRating = missingDepthCheckDefaultRating(candidate);
  return normalizeStarProgress({
    player: baseReviewPlayerName(item.player),
    team,
    teamAbbrev: team === "Free Agent" ? "FA" : state.data.meta.teamAbbrevs[team] || team,
    position,
    rawPosition,
    positionNumber: 99,
    depth: 99,
    rating: defaultRating,
    newRating: defaultRating,
    stars: 0,
    newStars: 0,
    injury: "Healthy",
    week: "",
    thumb: "",
  });
}

function addMissingDepthCheckPlayer(index, shouldRender = true) {
  const item = state.depthCheck.results[index];
  if (!item || item.kind !== "missing-player" || item.ignored) return;
  const player = missingPlayerFromDepthCheck(item);
  if (!player) return;
  const key = playerKey(player);
  const alreadyExists = state.players.some((entry) => sourceKey(entry) === key || playerKey(entry) === key);
  if (!alreadyExists) {
    addedPlayers.push(player);
    saveAddedPlayers();
  }
  item.applied = true;
  item.appliedTo = `${player.team} ${player.position}`;
  markDepthCheckResolved(item);
  state.players = applyOverrides(state.data.players);
  if (shouldRender) {
    state.depthCheck.results = unresolvedDepthCheckResults(state.depthCheck.results);
    bumpDepthCheckVersion();
    render();
  }
}

function addAllMissingDepthCheckPlayers() {
  let added = 0;
  state.depthCheck.results.forEach((item) => {
    if (item.kind !== "missing-player" || item.applied || item.ignored) return;
    const player = missingPlayerFromDepthCheck(item);
    if (!player) return;
    const key = playerKey(player);
    const alreadyExists = state.players.some((entry) => sourceKey(entry) === key || playerKey(entry) === key)
      || addedPlayers.some((entry) => playerKey(entry) === key);
    if (alreadyExists) return;
    addedPlayers.push(player);
    item.applied = true;
    item.appliedTo = `${player.team} ${player.position}`;
    markDepthCheckResolved(item);
    added += 1;
  });
  if (added) saveAddedPlayers();
  state.players = applyOverrides(state.data.players);
  state.depthCheck.results = unresolvedDepthCheckResults(state.depthCheck.results);
  bumpDepthCheckVersion();
  render();
}

function ignoreDepthCheckResult(index) {
  const item = state.depthCheck.results[index];
  if (!item) return;
  depthIgnoredResults[depthCheckIgnoreKey(item)] = true;
  storage.set("nflz-depth-ignored-results", depthIgnoredResults);
  item.ignored = true;
  state.depthCheckNotice = `Ignored ${item.player}.`;
  bumpDepthCheckVersion();
  render();
}

function removeDepthCheckCandidate(index, team, tag) {
  const item = state.depthCheck.results[index];
  if (!item) return;
  const candidate = (item.candidates || []).find((entry) => entry.team === team && String(candidateIdentityTag(entry)) === String(tag));
  if (!candidate) return;
  depthCandidateRemovals[depthCandidateRemovalKey(item, candidate)] = true;
  storage.set("nflz-depth-candidate-removals", depthCandidateRemovals);
  state.depthCheck.results = unresolvedDepthCheckResults(state.depthCheck.results);
  bumpDepthCheckVersion();
  render();
}

function alterDepthCheckName(index) {
  const item = state.depthCheck.results[index];
  if (!item) return;
  const candidates = activeDepthCheckCandidates(item).filter((entry) => candidateIdentityTag(entry));
  const duplicatePlayers = findDuplicateDepthCheckPlayers(item);
  if (!candidates.length || !duplicatePlayers.length) return;
  const usedTags = new Set();
  const playerSnapshots = duplicatePlayers.map((player) => ({
    key: sourceKey(player),
    team: player.team,
    name: player.player,
  }));
  playerSnapshots.forEach((snapshot, indexInGroup) => {
    const player = findPlayer(snapshot.key);
    if (!player || hasReviewIdentityTag(player.player)) return;
    const candidate = candidates.find((entry) => entry.team === snapshot.team && !usedTags.has(candidateIdentityTag(entry)))
      || candidates.find((entry) => !usedTags.has(candidateIdentityTag(entry)))
      || candidates[indexInGroup % candidates.length];
    const tag = candidateIdentityTag(candidate);
    if (!tag) return;
    usedTags.add(tag);
    persistPlayer(player, { player: `${baseReviewPlayerName(player.player)} (${tag})` });
  });
  item.applied = true;
  item.appliedTo = "names altered";
  markDepthCheckResolved(item);
  state.players = applyOverrides(state.data.players);
  state.depthCheck.results = unresolvedDepthCheckResults(state.depthCheck.results);
  bumpDepthCheckVersion();
  render();
}

function findInjuryCheckPlayer(item) {
  if (!item) return null;
  return findPlayer(item.playerKey)
    || state.players.find((p) => cleanPlayerName(p.player) === cleanPlayerName(item.player) && p.team === item.team)
    || state.players.find((p) => cleanPlayerName(p.player) === cleanPlayerName(item.player));
}

function runInjuryCheck() {
  if (!window.ESPN_INJURY_CHECK?.results) {
    state.injuryCheck = { status: "empty", results: [], error: "No ESPN injury scan file is loaded. Run refresh-espn-injury-check.bat, reload the app, then scan again.", source: "codex" };
    render();
    return;
  }
  state.injuryCheck = {
    status: "review",
    results: window.ESPN_INJURY_CHECK.results.map((item) => ({ ...item })),
    error: "",
    source: "codex",
    fetchedAt: window.ESPN_INJURY_CHECK.fetchedAt,
  };
  render();
}

async function runDepthAndInjuryChecks() {
  state.injuryCheck = { ...state.injuryCheck, status: "checking", error: "Loading ESPN injury check" };
  render();
  await runDepthChartCheck();
  runInjuryCheck();
}

function applyInjuryCheckResult(index) {
  const item = state.injuryCheck.results[index];
  if (!item || item.ignored) return;
  const player = findInjuryCheckPlayer(item);
  if (!player) return;
  const status = document.querySelector(`[data-injury-status-index="${index}"]`)?.value || item.suggestedStatus || "Healthy";
  const week = document.querySelector(`[data-injury-week-index="${index}"]`)?.value || item.suggestedWeek || "";
  persistPlayer(player, { injury: status, week });
  item.applied = true;
  item.appliedTo = `${status}${week ? ` / ${week}` : ""}`;
  render();
}

function ignoreInjuryCheckResult(index) {
  const item = state.injuryCheck.results[index];
  if (!item) return;
  item.ignored = true;
  render();
}

function indexedInjuryStatusSelect(index, value) {
  return `<select class="injury-review-status" data-injury-status-index="${index}">${injuryStatuses.map((item) => `<option ${String(value || "Healthy") === item ? "selected" : ""}>${item}</option>`).join("")}</select>`;
}

function indexedInjuryWeekSelect(index, value) {
  return `<select class="injury-review-week" data-injury-week-index="${index}">${injuryWeeks.map((item) => `<option ${String(value || "") === item ? "selected" : ""}>${item}</option>`).join("")}</select>`;
}

function renderInjuryCheckPanel() {
  const check = state.injuryCheck;
  const rows = check.results.map((item, index) => `
    <tr class="${item.applied ? "applied" : ""} ${item.ignored ? "ignored" : ""}">
      <td>${playerNameButton(findInjuryCheckPlayer(item) || { player: item.player, team: item.team, position: item.position, _sourceKey: item.playerKey })}</td>
      <td>${teamCellByName(item.team)}</td>
      <td><span class="review-chip">${esc(item.espnTag)}</span><small>${esc(item.espnReturnDate || "")}</small></td>
      <td><b>${esc(item.espnCommentDate || "No date")}</b><span>${esc(item.espnComment || "No ESPN comment.")}</span></td>
      <td><span class="injury-review-controls">${indexedInjuryStatusSelect(index, item.suggestedStatus)}${indexedInjuryWeekSelect(index, item.suggestedWeek)}</span></td>
      <td>${item.applied ? `<span class="applied-chip">Applied: ${esc(item.appliedTo || "")}</span>` : item.ignored ? "<span class='ignored-chip'>Ignored</span>" : `<span class="depth-review-actions"><button class="mini-action injury-apply-one" data-injury-check-index="${index}">Apply Revised</button><button class="mini-action injury-ignore-one" data-injury-check-index="${index}">Ignore</button></span>`}</td>
    </tr>
  `).join("");
  return `
    <section class="depth-check injury-check">
      <div class="depth-check-head">
        <div>
          <h3>Injury Check</h3>
          <p>Reviews ESPN injury tags and comments, then suggests your injury status and return week. Adjust the dropdowns before applying if needed.</p>
        </div>
      </div>
      ${check.status === "checking" ? `<div class="depth-scan-progress"><div class="depth-scan-bar"><span></span></div><p>${esc(check.error || "Loading ESPN injury check")}</p></div>` : ""}
      ${check.status === "empty" ? `<p class="depth-check-note">${esc(check.error)}</p>` : ""}
      ${check.status === "review" ? `<p class="depth-check-note">Showing ESPN injury scan from ${esc(check.fetchedAt || "latest refresh")}.</p><div class="table-scroll review-scroll injury-review-scroll"><table class="review-table injury-review-table"><thead><tr><th>Player</th><th>Team</th><th>ESPN Tag</th><th>ESPN Comment</th><th>Suggested / Revise</th><th>Action</th></tr></thead><tbody>${rows || '<tr><td colspan="6">No ESPN injury matches found.</td></tr>'}</tbody></table></div>` : ""}
    </section>
  `;
}

function renderDepthCheckPanel() {
  const check = state.depthCheck;
  const activityOptions = depthCheckActivityOptions();
  if (!activityOptions.some((option) => Array.isArray(option) ? option[0] === state.depthCheckActivity : option === state.depthCheckActivity)) state.depthCheckActivity = "All Activities";
  const selectedActivityRows = pendingDepthActivityRows(state.depthCheckActivity);
  const bulkCount = selectedActivityRows.filter(({ item, activity }) =>
    activity === "Team Changed"
    || activity === "Missing Player"
    || (activity === "Name Match Suggested" && item.kind === "free-agent" && freeAgentNameMatchCandidates(item).length === 1)
    || (activity === "Free Agent" && item.kind === "free-agent" && !freeAgentNameMatchCandidates(item).length)
  ).length;
  const pendingMissing = (check.results || []).filter((item) => item.kind === "missing-player" && !item.applied && !item.ignored);
  const pendingMissingRoster = pendingMissing.filter((item) => item.toTeam !== "Free Agent").length;
  const pendingMissingFa = pendingMissing.length - pendingMissingRoster;
  const missingPreviewRows = pendingMissing.map((item) => {
    const candidate = item.candidates?.[0] || {};
    const positionText = candidate.rawPosition && candidate.rawPosition !== candidate.position ? `${candidate.rawPosition}->${candidate.position}` : candidate.position;
    return `
      <li>
        <span>${esc(item.player)}</span>
        <em>${esc(item.toTeam)}${positionText ? ` / ${esc(positionText)}` : ""}${candidate.depth ? ` ${esc(candidate.depth)}` : ""}${candidate.school ? ` / ${esc(candidate.school)}` : ""}</em>
      </li>
    `;
  }).join("");
  const missingPreview = pendingMissing.length ? `
    <div class="missing-add-preview">
      <div>
        <strong>${pendingMissing.length} missing players ready to add</strong>
        <span>${pendingMissingRoster} to teams, ${pendingMissingFa} to Free Agent from reserves/practice-style rows.</span>
      </div>
      <ol>${missingPreviewRows}</ol>
    </div>
  ` : "";
  const actionCell = (item, index) => {
    const rowKey = depthCheckRowKey(item, index);
    if (item.applied) return `<span class='applied-chip'>Applied${item.appliedTo ? `: ${esc(item.appliedTo)}` : ""}</span>`;
    if (item.ignored) return "<span class='ignored-chip'>Ignored</span>";
    const baseAttrs = `data-depth-check-index="${index}" data-depth-check-key="${esc(rowKey)}"`;
    const ignore = `<button class="mini-action depth-ignore-one" ${baseAttrs}>Ignore</button>`;
    if (item.kind === "missing-player") return `<span class="depth-review-actions"><button class="mini-action depth-add-missing" ${baseAttrs}>Add</button>${ignore}</span>`;
    if (item.kind === "duplicate") {
      const choices = (item.candidates || []).map((candidate) => `
        <span class="depth-candidate-actions">
          <span class="depth-candidate-chip">${esc(candidate.label || candidate.team)}</span>
          <button class="mini-action depth-remove-candidate" ${baseAttrs} data-depth-check-team="${esc(candidate.team)}" data-depth-check-tag="${esc(candidateIdentityTag(candidate))}">Remove</button>
        </span>
      `).join("");
      const canAlter = (item.candidates || []).some((candidate) => candidateIdentityTag(candidate));
      return `<span class="depth-review-actions">${choices || "<span class='review-chip'>Review</span>"}${canAlter ? `<button class="mini-action depth-alter-name primary" ${baseAttrs}>Apply School Tags to All</button>` : ""}${ignore}</span>`;
    }
    if (item.kind === "free-agent") {
      const matches = freeAgentNameMatchCandidates(item).map((match) => `
        <span class="depth-name-suggestion">
          <span>Suggested OurLads name: <b>${esc(match.player)}</b>${match.toTeam && match.toTeam !== item.fromTeam ? ` / ${esc(match.toTeam)}` : ""}</span>
          <button class="mini-action depth-use-match primary" ${baseAttrs} data-depth-match-name="${esc(match.player)}" data-depth-match-team="${esc(match.toTeam || "")}">Apply Name</button>
        </span>
      `).join("");
      return `<span class="depth-review-actions">${matches}<button class="mini-action depth-apply-one" ${baseAttrs}>Apply FA</button>${ignore}</span>`;
    }
    return `<span class="depth-review-actions"><button class="mini-action depth-apply-one" ${baseAttrs}>Apply</button>${ignore}</span>`;
  };
  const activityOrder = ["Team Changed", "Name Match Suggested", "Free Agent", "Duplicate Name", "Missing Player"];
  const rowItems = (check.results || [])
    .map((item, index) => ({ item, index, activity: depthCheckActivityLabel(item) }))
    .filter((row) => !row.item.applied && !row.item.ignored)
    .filter((row) => state.depthCheckActivity === "All Activities" || row.activity === state.depthCheckActivity)
    .sort((a, b) => (activityOrder.indexOf(a.activity) === -1 ? 99 : activityOrder.indexOf(a.activity)) - (activityOrder.indexOf(b.activity) === -1 ? 99 : activityOrder.indexOf(b.activity)) || String(a.item.player).localeCompare(b.item.player));
  const visibleRows = rowItems.slice(0, state.depthCheckVisibleLimit);
  const hasMoreRows = rowItems.length > visibleRows.length;
  const rows = visibleRows.map(({ item, index, activity }) => `
    <tr class="${item.kind} ${item.applied ? "applied" : ""} ${item.ignored ? "ignored" : ""}" data-depth-check-key="${esc(depthCheckRowKey(item, index))}">
      <td>${esc(item.player)}</td>
      <td>${teamCellByName(item.fromTeam)}</td>
      <td>${item.toTeam === "Free Agent" ? "<span class='free-agent-chip'>Free Agent</span>" : esc(item.toTeam)}</td>
      <td>${esc(activity)}</td>
      <td>${actionCell(item, index)}</td>
    </tr>
  `).join("");
  return `
    <section class="depth-check">
      <div class="depth-check-head">
        <div>
          <h3>Depth Chart Check</h3>
          <p>Checks OurLads team placement by player name only. If the browser blocks the live scan, a paste box appears here for reviewing copied OurLads page text.</p>
        </div>
      </div>
      ${check.status === "checking" ? `<div class="depth-scan-progress"><div class="depth-scan-bar"><span></span></div><p>${esc(check.error || "Scanning OurLads")}</p></div>` : ""}
      ${check.status === "review" && check.source === "codex" ? `<p class="depth-check-note">Showing Codex-generated OurLads scan from ${esc(check.fetchedAt || window.OURLADS_DEPTH_CHECK?.fetchedAt || "latest refresh")}.</p>` : ""}
      ${check.status === "review" && state.depthCheckNotice ? `<p class="depth-check-note depth-check-success">${esc(state.depthCheckNotice)}</p>` : ""}
      ${check.status === "paste" ? `<div class="paste-check"><p>${esc(check.error)}</p><textarea id="depth-check-paste" placeholder="Paste copied OurLads all-teams depth chart text or HTML here"></textarea><button id="depth-check-paste-run" class="mini-action primary">Review Pasted Chart</button></div>` : ""}
      ${check.status === "review" ? `<div class="depth-check-controls">${optionSelect("depth-check-activity", state.depthCheckActivity, activityOptions)}${bulkCount ? `<button id="depth-check-apply-all" class="mini-action primary">Apply ${state.depthCheckActivity === "All Activities" ? "Safe Changes" : esc(state.depthCheckActivity)} (${bulkCount})</button>` : ""}</div>` : ""}
      ${check.status === "review" && (state.depthCheckActivity === "All Activities" || state.depthCheckActivity === "Missing Player") ? missingPreview : ""}
      ${check.status === "review" ? `<div class="table-scroll review-scroll"><table class="review-table depth-review-table"><thead><tr><th>Player</th><th>Current</th><th>OurLads</th><th>Activity</th><th>Action</th></tr></thead><tbody>${rows || '<tr><td colspan="5">No team-placement changes found.</td></tr>'}</tbody></table></div>${hasMoreRows ? `<div class="depth-check-more"><span>Showing ${visibleRows.length} of ${rowItems.length}</span><button id="depth-check-show-more" class="mini-action">Show More</button></div>` : ""}` : ""}
    </section>
  `;
}

function pendingMissingDepthCheckCount() {
  return (state.depthCheck.results || []).filter((item) => item.kind === "missing-player" && !item.applied && !item.ignored).length;
}

function handleDepthCheckActionClick(event) {
  const button = event.target.closest(".depth-apply-one, .depth-use-match, .depth-add-missing, .depth-remove-candidate, .depth-ignore-one, .depth-alter-name");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  if (button.disabled) return;
  const key = button.dataset.depthCheckKey || button.closest("tr")?.dataset.depthCheckKey || "";
  let index = Number(button.dataset.depthCheckIndex);
  if (!Number.isInteger(index) || index < 0 || depthCheckRowKey(state.depthCheck.results[index], index) !== key) {
    index = depthCheckIndexFromKey(key);
  }
  if (index < 0) {
    state.depthCheckNotice = "That review row could not be found. Refresh the scan and try again.";
    render();
    return;
  }
  button.disabled = true;
  button.classList.add("is-working");
  button.dataset.originalText = button.textContent || "";
  button.textContent = "Working";
  requestAnimationFrame(() => {
    try {
      if (button.classList.contains("depth-apply-one")) applyDepthCheckResult(index);
      else if (button.classList.contains("depth-use-match")) applyDepthCheckNameMatch(index, button.dataset.depthMatchName, button.dataset.depthMatchTeam);
      else if (button.classList.contains("depth-add-missing")) addMissingDepthCheckPlayer(index);
      else if (button.classList.contains("depth-remove-candidate")) removeDepthCheckCandidate(index, button.dataset.depthCheckTeam, button.dataset.depthCheckTag);
      else if (button.classList.contains("depth-ignore-one")) ignoreDepthCheckResult(index);
      else if (button.classList.contains("depth-alter-name")) alterDepthCheckName(index);
    } finally {
      if (button.isConnected) {
        button.disabled = false;
        button.classList.remove("is-working");
        button.textContent = button.dataset.originalText || "Apply";
      }
    }
  });
}


function scheduleGameKey(game, index = 0) {
  return [game.week || "", game.visitor || "", game.home || "", game.date || "", index].join("|");
}

function scheduleActiveMode(game = null) {
  if (state.scheduleSimMode !== "auto") return state.scheduleSimMode;
  return game?.preseason || String(game?.week || selectedSiteWeek()).startsWith("Pre") ? "preseason" : "regular";
}

function playerGroupForSchedule(player) {
  const pos = groupPosition(player.position);
  if (["LT", "LG", "C", "RG", "RT", "OT", "OG"].includes(pos) || ["LT", "LG", "C", "RG", "RT"].includes(player.position)) return "OL";
  if (pos === "EDGE Def") return "EDGE";
  if (pos === "LB Only") return "LB";
  return pos;
}

function schedulePlayersFor(teamName, group) {
  const exactPositions = new Set(["LT", "LG", "C", "RG", "RT"]);
  return state.players
    .filter((player) => {
      if (player.team !== teamName || !isPlayerAvailable(player) || !Number.isFinite(Number(player.rating))) return false;
      if (exactPositions.has(group)) return player.position === group;
      return playerGroupForSchedule(player) === group;
    })
    .sort((a, b) => num(a.depth, 999) - num(b.depth, 999) || num(b.rating) - num(a.rating) || String(a.player).localeCompare(b.player));
}

function weightedAverage(values) {
  const rows = values.filter((item) => Number.isFinite(Number(item.value)) && Number.isFinite(Number(item.weight)) && Number(item.weight) > 0);
  const totalWeight = rows.reduce((sum, item) => sum + Number(item.weight), 0);
  return totalWeight ? rows.reduce((sum, item) => sum + (Number(item.value) * Number(item.weight)), 0) / totalWeight : "";
}

function preseasonPositionScore(teamName, group) {
  const multipliers = state.preseasonDepthMultipliers[group] || defaultPreseasonDepthMultipliers[group] || [100];
  if (group === "OL") {
    const linePositions = ["LT", "LG", "C", "RG", "RT"];
    const values = linePositions.flatMap((position) => {
      const players = schedulePlayersFor(teamName, position).slice(0, multipliers.length);
      return players.map((player, index) => ({ value: player.rating, weight: num(multipliers[index], 100) / 100 }));
    });
    return weightedAverage(values);
  }
  const players = schedulePlayersFor(teamName, group).slice(0, multipliers.length);
  return weightedAverage(players.map((player, index) => ({ value: player.rating, weight: num(multipliers[index], 100) / 100 })));
}

function regularPositionScore(team, group) {
  const map = {
    QB: "QB",
    RB: "RB",
    WR: "WR",
    TE: "TE",
    OL: "OL",
    IDL: "IDL",
    EDGE: "EDGE Def",
    LB: "LB Only",
    CB: "CB",
    S: "S",
  };
  return teamPositionScore(team, map[group] || group);
}

function schedulePositionScore(team, group, mode) {
  if (!team) return "";
  return mode === "preseason" ? preseasonPositionScore(team.team, group) : regularPositionScore(team, group);
}

function scheduleComposite(team, mode) {
  if (!team) return "";
  const rows = Object.keys(defaultSchedulePositionWeights).map((group) => ({
    value: schedulePositionScore(team, group, mode),
    weight: num(state.schedulePositionWeights[group], defaultSchedulePositionWeights[group]),
  }));
  return weightedAverage(rows);
}

function scheduleSideComposite(team, side, mode) {
  const groups = side === "defense" ? ["IDL", "EDGE", "LB", "CB", "S"] : ["QB", "RB", "WR", "TE", "OL"];
  return weightedAverage(groups.map((group) => ({
    value: schedulePositionScore(team, group, mode),
    weight: num(state.schedulePositionWeights[group], defaultSchedulePositionWeights[group]),
  })));
}

function scheduleHomeAdvantage(game, mode) {
  if (isNeutralSiteGame(game)) return 0;
  if (Number.isFinite(Number(game.homeAdvantage))) return num(game.homeAdvantage);
  if (mode === "preseason") return 0.8;
  return num(state.homeFieldAdvantages?.[game.home], defaultHomeFieldAdvantages[game.home] ?? 1.5);
}

function isNeutralSiteGame(game) {
  return neutralSiteGames.some(([week, visitor, home]) => String(game.week) === String(week) && normalizeTeamName(normalizeScheduleTeam(game.visitor)) === normalizeTeamName(normalizeScheduleTeam(visitor)) && normalizeTeamName(normalizeScheduleTeam(game.home)) === normalizeTeamName(normalizeScheduleTeam(home)));
}

function winChanceFromSpread(spread) {
  const value = Math.max(0, Math.min(17, Math.round(num(spread, 0) * 2) / 2));
  const exact = spreadWinChanceTable.find(([line]) => line === value);
  if (exact) return exact[1];
  const lower = [...spreadWinChanceTable].reverse().find(([line]) => line < value) || spreadWinChanceTable[0];
  const upper = spreadWinChanceTable.find(([line]) => line > value) || spreadWinChanceTable[spreadWinChanceTable.length - 1];
  const pct = (value - lower[0]) / Math.max(0.5, upper[0] - lower[0]);
  return lower[1] + ((upper[1] - lower[1]) * pct);
}

function americanOddsFromProbability(probability) {
  const p = Math.max(0.01, Math.min(0.99, num(probability, 0.5)));
  const odds = p >= 0.5 ? -Math.round((p / (1 - p)) * 100) : Math.round(((1 - p) / p) * 100);
  return odds > 0 ? `+${odds}` : String(odds);
}

function projectionWinProfile(game, projection = scheduleProjection(game)) {
  const favoriteChance = winChanceFromSpread(projection.spread);
  const underdogChance = 1 - favoriteChance;
  const favorite = projection.favorite || "";
  const visitorChance = !favorite ? 0.5 : favorite === game.visitor ? favoriteChance : underdogChance;
  const homeChance = !favorite ? 0.5 : favorite === game.home ? favoriteChance : underdogChance;
  return {
    favorite,
    favoriteChance,
    underdogChance,
    visitorChance,
    homeChance,
    visitorMl: americanOddsFromProbability(visitorChance),
    homeMl: americanOddsFromProbability(homeChance),
  };
}

function scheduleTeamProjectionScore(team, opponent, mode, homeAdvantage = 0) {
  const teamOverall = scheduleComposite(team, mode);
  const teamOff = scheduleSideComposite(team, "offense", mode);
  const opponentDef = scheduleSideComposite(opponent, "defense", mode);
  return 20 + ((num(teamOverall, 84) - 84) * 0.34) + ((num(teamOff, 84) - num(opponentDef, 84)) * 0.16) + num(homeAdvantage, 0);
}

function scheduleProjection(game) {
  const mode = scheduleActiveMode(game);
  const visitorTeam = teamByName(game.visitor);
  const homeTeam = teamByName(game.home);
  if (visitorTeam && homeTeam) {
    const visitorRaw = scheduleTeamProjectionScore(visitorTeam, homeTeam, mode, 0);
    const homeRaw = scheduleTeamProjectionScore(homeTeam, visitorTeam, mode, scheduleHomeAdvantage(game, mode));
    const visitor = Math.max(6, Math.round(visitorRaw));
    const home = Math.max(6, Math.round(homeRaw));
    const favorite = visitor === home ? "" : visitor > home ? game.visitor : game.home;
    return {
      visitor,
      home,
      total: visitor + home,
      spread: Math.abs(visitor - home),
      favorite,
      mode,
    };
  }
  const total = num(game.zTotal || game.matchupScore, 44);
  const spread = Math.abs(num(game.spreadRounded, 0));
  const favorite = game.favorite || "";
  let visitor = total / 2;
  let home = total / 2;
  if (favorite === game.visitor) {
    visitor += spread / 2;
    home -= spread / 2;
  } else if (favorite === game.home) {
    home += spread / 2;
    visitor -= spread / 2;
  }
  return {
    visitor: Math.max(0, Math.round(visitor)),
    home: Math.max(0, Math.round(home)),
    total,
    spread,
    favorite,
    mode,
  };
}

function spreadLabel(game) {
  const projection = scheduleProjection(game);
  if (!projection.favorite || !projection.spread) return "Pick'em";
  const team = teamByName(projection.favorite);
  const abbrev = team?.teamAbbrev || state.data?.meta?.teamAbbrevs?.[projection.favorite] || projection.favorite;
  return `${abbrev} -${fmt(projection.spread, 0)}`;
}

function dkLogo() {
  return `<img class="dk-logo" src="https://a.espncdn.com/i/betting/Draftkings_Light.svg" alt="DraftKings" loading="lazy" onerror="this.style.display='none'" />`;
}

function draftKingsOddsFor(game) {
  const games = window.DRAFTKINGS_ODDS?.games || [];
  return games.find((odds) => odds.visitor === game.visitor && odds.home === game.home && (!game.date || odds.date === game.date))
    || games.find((odds) => odds.visitor === game.visitor && odds.home === game.home && String(odds.week) === String(game.week))
    || games.find((odds) => odds.visitor === game.visitor && odds.home === game.home)
    || null;
}

function dkMoneylineLabel(game, odds) {
  if (!odds) return "-";
  const favorite = odds.mlFavorite || odds.spreadFavoriteTeam || "";
  const abbrev = favorite === game.visitor ? odds.visitorAbbrev : favorite === game.home ? odds.homeAbbrev : "";
  const ml = favorite === game.visitor ? odds.awayMoneyline : favorite === game.home ? odds.homeMoneyline : "";
  return abbrev && ml ? `${abbrev} ${ml}` : odds.awayMoneyline || odds.homeMoneyline || "-";
}

function spreadPickOptions(game, odds) {
  if (!odds?.spreadDetails || !Number.isFinite(Number(odds.spreadLine))) return [];
  const favorite = odds.spreadFavoriteTeam || "";
  const dog = favorite === game.visitor ? game.home : game.visitor;
  const dogAbbrev = dog === game.visitor ? odds.visitorAbbrev : odds.homeAbbrev;
  return [
    odds.spreadDetails,
    `${dogAbbrev || dog} +${fmt(Math.abs(num(odds.spreadLine)), 1)}`,
  ];
}

function totalPickOptions(odds) {
  if (!odds || !Number.isFinite(Number(odds.totalLine))) return [];
  return [odds.overLine || `o${fmt(odds.totalLine, 1)}`, odds.underLine || `u${fmt(odds.totalLine, 1)}`];
}

function scheduleMarketCards(game, projection) {
  const odds = draftKingsOddsFor(game);
  const myFavorite = projection.favorite === game.visitor ? (odds?.visitorAbbrev || teamByName(game.visitor)?.teamAbbrev || game.visitor) : projection.favorite === game.home ? (odds?.homeAbbrev || teamByName(game.home)?.teamAbbrev || game.home) : "PK";
  const mySpread = projection.favorite ? `${myFavorite} -${fmt(projection.spread, 0)}` : "PK";
  const profile = projectionWinProfile(game, projection);
  const modelMl = projection.favorite === game.visitor ? `${myFavorite} ${profile.visitorMl}` : projection.favorite === game.home ? `${myFavorite} ${profile.homeMl}` : "PK";
  return `
    <div class="schedule-market-grid">
      <section class="market-card model">
        <span>Model Z</span>
        <strong>${esc(mySpread)}</strong>
        <em>Total ${esc(fmt(projection.total, 1))} / ML ${esc(modelMl)}</em>
      </section>
      <section class="market-card dk">
        <span>${dkLogo()}DraftKings</span>
        <strong>${esc(odds?.spreadDetails || "-")}</strong>
        <em>${esc(odds ? `${odds.overLine || `o${fmt(odds.totalLine, 1)}`} / ML ${dkMoneylineLabel(game, odds)}` : "No DK line")}</em>
      </section>
    </div>
  `;
}

function schedulePickPanel(game, gameKey, projection) {
  const action = gameAction(gameKey);
  const odds = draftKingsOddsFor(game);
  const mlOptions = ["", game.visitor, game.home].map((team) => [team, team ? `${teamByName(team)?.teamAbbrev || team} ML` : "ML Pick"]);
  const spreadOptions = [["", "Spread Pick"], ...spreadPickOptions(game, odds).map((option) => [option, option])];
  const totalOptions = [["", "Total Pick"], ...totalPickOptions(odds).map((option) => [option, option])];
  const resultOptions = ["", game.visitor, game.home].map((team) => [team, team ? `${teamByName(team)?.teamAbbrev || team} Win` : "Winner"]);
  return `
    <div class="schedule-action-panel">
      <div class="schedule-pick-grid">
        <label><span>ML</span>${optionSelect(`pick-ml-${gameKey}`, action.ml, mlOptions).replace("<select", `<select class="game-pick-select" data-game="${esc(gameKey)}" data-field="ml"`)}</label>
        <label><span>Spread</span>${optionSelect(`pick-spread-${gameKey}`, action.spread, spreadOptions).replace("<select", `<select class="game-pick-select" data-game="${esc(gameKey)}" data-field="spread"`)}</label>
        <label><span>Total</span>${optionSelect(`pick-total-${gameKey}`, action.total, totalOptions).replace("<select", `<select class="game-pick-select" data-game="${esc(gameKey)}" data-field="total"`)}</label>
      </div>
      <div class="schedule-result-grid">
        <label><span>Result</span>${optionSelect(`result-winner-${gameKey}`, action.resultWinner, resultOptions).replace("<select", `<select class="game-pick-select" data-game="${esc(gameKey)}" data-field="resultWinner"`)}</label>
        <label><span>Away Pts</span><input class="game-score-input" data-game="${esc(gameKey)}" data-field="awayScore" inputmode="numeric" value="${esc(action.awayScore)}" placeholder="${esc(teamByName(game.visitor)?.teamAbbrev || "Away")}" /></label>
        <label><span>Home Pts</span><input class="game-score-input" data-game="${esc(gameKey)}" data-field="homeScore" inputmode="numeric" value="${esc(action.homeScore)}" placeholder="${esc(teamByName(game.home)?.teamAbbrev || "Home")}" /></label>
      </div>
    </div>
  `;
}

function signedEdge(value, digits = 1) {
  if (!Number.isFinite(Number(value))) return "-";
  return `${value > 0 ? "+" : ""}${fmt(value, digits)}`;
}

function draftKingsBreakdown(game, projection) {
  const odds = draftKingsOddsFor(game);
  if (!odds) {
    return `<section class="dk-detail-card"><h3>${dkLogo()}DraftKings Odds</h3><p class="note">No DraftKings line is cached for this game yet. Run Scan DraftKings Odds.</p></section>`;
  }
  const dkFavorite = odds.spreadFavoriteTeam || "";
  const myFavorite = projection.favorite || "";
  const dkSpreadEdge = dkFavorite && myFavorite && dkFavorite === myFavorite
    ? projection.spread - num(odds.spreadLine)
    : NaN;
  const totalEdge = Number.isFinite(Number(odds.totalLine)) ? projection.total - num(odds.totalLine) : NaN;
  return `
    <section class="dk-detail-card">
      <h3>${dkLogo()}DraftKings Odds</h3>
      <div class="dk-compare-grid">
        ${metric("My Spread", spreadLabel(game), myFavorite || "Pick'em")}
        ${metric("DK Spread", odds.spreadDetails || "-", dkFavorite || "Market")}
        ${metric("Spread Edge", Number.isFinite(dkSpreadEdge) ? signedEdge(dkSpreadEdge) : "Opposite side", "My minus DK")}
        ${metric("My Total", fmt(projection.total, 1), "Projected points")}
        ${metric("DK Total", odds.overLine || `o${fmt(odds.totalLine, 1)}`, `${odds.overOdds || ""} / ${odds.underOdds || ""}`)}
        ${metric("Total Edge", signedEdge(totalEdge), totalEdge > 0 ? "Over lean" : totalEdge < 0 ? "Under lean" : "Flat")}
        ${metric("Moneyline", dkMoneylineLabel(game, odds), `${odds.visitorAbbrev} ${odds.awayMoneyline || "-"} / ${odds.homeAbbrev} ${odds.homeMoneyline || "-"}`)}
      </div>
    </section>
  `;
}

const scheduleStarterSlots = [
  "QB1", "RB1", "RB2", "WR1", "WR2", "WR3", "WR4", "TE1", "TE2",
  "LT1", "LG1", "C1", "RG1", "RT1",
  "IDL1", "IDL2", "IDL3", "EDGE1", "EDGE2", "EDGE3", "LB1", "LB2", "LB3", "CB1", "CB2", "CB3", "S1", "S2",
];

function starterSlotParts(slot) {
  const match = String(slot).match(/^([A-Z]+)(\d+)$/);
  return match ? { group: match[1], depth: Number(match[2]) } : { group: slot, depth: 1 };
}

function scheduleStarterFor(teamName, slot) {
  const { group, depth } = starterSlotParts(slot);
  return schedulePlayersFor(teamName, group)[depth - 1] || null;
}

function starterCompareCell(player) {
  if (!player) return `<span class="starter-empty">-</span>`;
  return `
    <span class="starter-player">
      ${playerAvatar(player)}
      <span><b>${esc(player.player)}</b><em>${esc(player.position)}${player.depth ? `${esc(player.depth)}` : ""}</em></span>
      ${ratingBadge(player.rating)}
    </span>
  `;
}

function scheduleStarterComparison(game) {
  const mode = scheduleActiveMode(game);
  const slots = mode === "preseason" ? schedulePlayerComparisonSlots() : scheduleStarterSlots;
  const rows = slots.map((slot) => {
    const away = scheduleStarterFor(game.visitor, slot);
    const home = scheduleStarterFor(game.home, slot);
    const edge = away && home ? num(home.rating) - num(away.rating) : NaN;
    return `<tr>
      <td><span class="starter-slot">${esc(slot)}</span></td>
      <td>${starterCompareCell(away)}</td>
      <td>${starterCompareCell(home)}</td>
      <td class="num ${edge >= 0 ? "plus" : "minus"}">${Number.isFinite(edge) ? `${edge > 0 ? "+" : ""}${fmt(edge, 0)}` : "-"}</td>
    </tr>`;
  });
  const visitorAbbrev = teamByName(game.visitor)?.teamAbbrev || state.data?.meta?.teamAbbrevs?.[game.visitor] || "Away";
  const homeAbbrev = teamByName(game.home)?.teamAbbrev || state.data?.meta?.teamAbbrevs?.[game.home] || "Home";
  return `
    <section class="starter-compare-card">
      <h3>${mode === "preseason" ? "Players Comparison" : "Starters Comparison"}</h3>
      <div class="table-scroll starter-compare-scroll">
        ${table([{ label: "Slot" }, { label: visitorAbbrev }, { label: homeAbbrev }, { label: "Home Edge", cls: "num" }], rows)}
      </div>
    </section>
  `;
}

function schedulePlayerComparisonSlots() {
  const order = ["QB", "RB", "WR", "TE", "OL", "IDL", "EDGE", "LB", "CB", "S"];
  return order.flatMap((group) => {
    const multipliers = state.preseasonDepthMultipliers[group] || defaultPreseasonDepthMultipliers[group] || [100];
    if (group === "OL") {
      return ["LT", "LG", "C", "RG", "RT"].flatMap((position) => multipliers.map((_, index) => `${position}${index + 1}`));
    }
    return multipliers.map((_, index) => `${group}${index + 1}`);
  });
}

function scheduleMetricAverages(games = scheduleGames()) {
  const rows = games.map((game) => {
    const projection = scheduleProjection(game);
    return {
      total: num(projection.total, NaN),
      spread: num(projection.spread, NaN),
      odds: Number.isFinite(Number(game.oddsToWin)) ? Math.max(num(game.oddsToWin), 1 - num(game.oddsToWin)) * 100 : NaN,
    };
  });
  const avg = (field, fallback) => {
    const values = rows.map((row) => row[field]).filter(Number.isFinite);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;
  };
  return {
    total: avg("total", 44),
    spread: avg("spread", 3),
    odds: avg("odds", 55),
  };
}

function relativeMetricStyle(value, average, range = 12, reverse = false) {
  if (!Number.isFinite(Number(value))) return "";
  const min = average - range;
  const max = average + range;
  return cfStyle(value, min, max, reverse);
}

function scheduleBubble(label, value, subValue, style = "") {
  return `<span class="schedule-heat-pill" ${style}><b>${esc(label)}</b>${esc(value)}${subValue ? `<em>${esc(subValue)}</em>` : ""}</span>`;
}

function scheduleSlider(label, key, value, min = 0, max = 200, attr = "schedule-weight", step = 5, suffix = "%") {
  return `
    <label class="schedule-slider">
      <span>${esc(label)}</span>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${esc(value)}" data-${attr}="${esc(key)}" data-suffix="${esc(suffix)}" />
      <b>${esc(value)}${esc(suffix)}</b>
    </label>
  `;
}

function renderScheduleControls() {
  if (!state.scheduleControlsOpen) return "";
  const positionSliders = Object.keys(defaultSchedulePositionWeights).map((key) =>
    scheduleSlider(key, key, num(state.schedulePositionWeights[key], defaultSchedulePositionWeights[key]), 0, 30, "schedule-weight", 1, " pts")
  ).join("");
  const depthRows = (groups) => groups.map((group) => {
    const values = state.preseasonDepthMultipliers[group] || defaultPreseasonDepthMultipliers[group];
    const labels = group === "OL" ? values.map((_, index) => `OL${index + 1}`) : values.map((_, index) => `${group}${index + 1}`);
    return `
      <div class="depth-slider-row">
        <strong>${esc(group)}</strong>
        <div>${values.map((value, index) => scheduleSlider(labels[index], `${group}|${index}`, num(value, 100), 60, 150, "preseason-depth")).join("")}</div>
      </div>
    `;
  }).join("");
  const hfaRows = Object.keys(defaultHomeFieldAdvantages).map((team) => `
    <label class="hfa-control">${teamCellByName(team)}<input type="number" step="0.5" min="0" max="4" value="${esc(num(state.homeFieldAdvantages[team], defaultHomeFieldAdvantages[team]))}" data-hfa-team="${esc(team)}" /></label>
  `).join("");
  return `
    <section class="schedule-control-panel">
      <div class="schedule-control-block">
        <h3>Position Weights</h3>
        <p>These are relative points in the team projection mix. Higher points make that position group matter more.</p>
        <div class="schedule-slider-grid">${positionSliders}</div>
      </div>
      <div class="schedule-control-block">
        <h3>Preseason Depth Multipliers</h3>
        <p>These are rating multipliers for the depth spots included in preseason mode.</p>
        <div class="depth-control-columns">
          <div><h4>Offense</h4><div class="depth-slider-grid">${depthRows(["QB", "RB", "WR", "TE", "OL"])}</div></div>
          <div><h4>Defense</h4><div class="depth-slider-grid">${depthRows(["IDL", "EDGE", "LB", "CB", "S"])}</div></div>
        </div>
      </div>
      <div class="schedule-control-block">
        <h3>Home Field Advantage</h3>
        <p>Regular-season HFA points by home team. Neutral-site games override this to 0.</p>
        <div class="hfa-control-grid">${hfaRows}</div>
      </div>
    </section>
  `;
}

function wireScheduleControls() {
  document.querySelector("#schedule-sim-mode")?.addEventListener("change", (event) => {
    state.scheduleSimMode = event.target.value;
    storage.set("nflz-schedule-sim-mode", state.scheduleSimMode);
    render();
  });
  document.querySelector("#schedule-controls-toggle")?.addEventListener("click", () => {
    state.scheduleControlsOpen = !state.scheduleControlsOpen;
    storage.set("nflz-schedule-controls-open", state.scheduleControlsOpen);
    render();
  });
  document.querySelector("#schedule-reset-controls")?.addEventListener("click", () => {
    state.schedulePositionWeights = { ...defaultSchedulePositionWeights };
    state.preseasonDepthMultipliers = JSON.parse(JSON.stringify(defaultPreseasonDepthMultipliers));
    state.homeFieldAdvantages = { ...defaultHomeFieldAdvantages };
    storage.set("nflz-schedule-position-weights", state.schedulePositionWeights);
    storage.set("nflz-preseason-depth-multipliers", state.preseasonDepthMultipliers);
    storage.set("nflz-home-field-advantages", state.homeFieldAdvantages);
    render();
  });
  document.querySelectorAll("[data-schedule-weight]").forEach((input) => {
    input.addEventListener("input", () => {
      state.schedulePositionWeights[input.dataset.scheduleWeight] = Number(input.value);
      input.closest(".schedule-slider")?.querySelector("b")?.replaceChildren(`${input.value}${input.dataset.suffix || ""}`);
    });
    input.addEventListener("change", () => {
      state.schedulePositionWeights[input.dataset.scheduleWeight] = Number(input.value);
      storage.set("nflz-schedule-position-weights", state.schedulePositionWeights);
      render();
    });
  });
  document.querySelectorAll("[data-preseason-depth]").forEach((input) => {
    input.addEventListener("input", () => {
      input.closest(".schedule-slider")?.querySelector("b")?.replaceChildren(`${input.value}${input.dataset.suffix || ""}`);
    });
    input.addEventListener("change", () => {
      const [group, indexText] = input.dataset.preseasonDepth.split("|");
      const next = { ...state.preseasonDepthMultipliers };
      next[group] = [...(next[group] || defaultPreseasonDepthMultipliers[group])];
      next[group][Number(indexText)] = Number(input.value);
      state.preseasonDepthMultipliers = next;
      storage.set("nflz-preseason-depth-multipliers", state.preseasonDepthMultipliers);
      render();
    });
  });
  document.querySelectorAll("[data-hfa-team]").forEach((input) => {
    input.addEventListener("change", () => {
      state.homeFieldAdvantages[input.dataset.hfaTeam] = Number(input.value);
      storage.set("nflz-home-field-advantages", state.homeFieldAdvantages);
      render();
    });
  });
}

function quickPlayerMatches(limit = 18) {
  const raw = state.quickPlayerQuery.trim().toLowerCase();
  const tokens = raw.split(/\s+/).filter(Boolean);
  const rows = state.players.map((p) => {
    const haystack = [p.player, p.team, p.teamAbbrev, p.position, groupPosition(p.position)].join(" ").toLowerCase();
    const exactName = String(p.player).toLowerCase() === raw;
    const startsName = String(p.player).toLowerCase().startsWith(raw);
    const allTokens = tokens.every((token) => haystack.includes(token));
    const score = (exactName ? 1000 : 0)
      + (startsName ? 300 : 0)
      + (allTokens ? 120 : 0)
      + (haystack.includes(raw) ? 80 : 0)
      + num(p.rating);
    return { player: p, score, matched: !tokens.length || allTokens || haystack.includes(raw) };
  }).filter((item) => item.matched);
  return rows
    .sort((a, b) => b.score - a.score || num(b.player.rating) - num(a.player.rating) || String(a.player.player).localeCompare(b.player.player))
    .slice(0, limit)
    .map((item) => item.player);
}

function selectedQuickPlayer() {
  if (state.quickPlayerKey) return findPlayer(state.quickPlayerKey);
  return state.quickPlayerQuery.trim() ? quickPlayerMatches()[0] || null : null;
}

function quickRankPlayers(scope, limit) {
  const offensive = new Set(["QB", "RB", "WR", "TE", "LT", "LG", "C", "RG", "RT", "OT", "OG"]);
  const defensive = new Set(["IDL", "EDGE", "LB", "ILB", "OLB", "CB", "S", "FS", "SS"]);
  const oline = new Set(["LT", "LG", "C", "RG", "RT", "OT", "OG"]);
  let rows = state.players.filter((p) => Number.isFinite(Number(p.rating)));
  if (scope === "Offense") rows = rows.filter((p) => offensive.has(groupPosition(p.position)) || offensive.has(p.position));
  else if (scope === "Defense") rows = rows.filter((p) => defensive.has(groupPosition(p.position)) || defensive.has(p.position));
  else if (scope === "OLINE") rows = rows.filter((p) => oline.has(groupPosition(p.position)) || oline.has(p.position));
  else if (scope !== "All Players" && !scope.startsWith("Team: ")) rows = rows.filter((p) => groupPosition(p.position) === scope || p.position === scope);
  else if (scope.startsWith("Team: ")) rows = rows.filter((p) => p.team === scope.replace("Team: ", ""));
  return rows.sort((a, b) => num(b.rating) - num(a.rating) || num(a.depth, 99) - num(b.depth, 99) || String(a.player).localeCompare(b.player)).slice(0, limit);
}

function dynamicTeamPositionScore(team, scope) {
  if (!team) return "";
  const avg = (groups) => weightedAverage(groups.map(([group, weight]) => ({ value: dynamicTeamPositionScore(team, group), weight })));
  const topAverage = (group, count = 1) => {
    const rows = schedulePlayersFor(team.team, group).slice(0, count);
    return rows.length ? weightedAverage(rows.map((player) => ({ value: player.rating, weight: 1 }))) : "";
  };
  if (scope === "Whole Team") return avg([["Offense", 1], ["Defense", 1]]);
  if (scope === "Offense") return avg([["QB", 18], ["RB", 8], ["WR", 14], ["TE", 7], ["OL", 15]]);
  if (scope === "Defense") return avg([["IDL", 8], ["EDGE Def", 10], ["LB Only", 6], ["CB", 10], ["S", 4]]);
  if (scope === "OL" || scope === "OLINE") return avg([["LT", 1], ["LG", 1], ["C", 1], ["RG", 1], ["RT", 1]]);
  if (scope === "OT") return avg([["LT", 1], ["RT", 1]]);
  if (scope === "OG") return avg([["LG", 1], ["RG", 1]]);
  if (scope === "IOL") return avg([["LG", 1], ["C", 1], ["RG", 1]]);
  if (scope === "EDGE Def") return topAverage("EDGE", 3);
  if (scope === "LB Only") return topAverage("LB", 3);
  if (scope === "Defensive Backs") return avg([["CB", 3], ["S", 2]]);
  if (scope === "DL\n(DT + EDGE)") return avg([["IDL", 3], ["EDGE Def", 3]]);
  if (scope === "LB + EDGE") return avg([["LB Only", 3], ["EDGE Def", 3]]);
  const counts = { QB: 1, RB: 2, WR: 4, TE: 2, LT: 1, LG: 1, C: 1, RG: 1, RT: 1, IDL: 3, EDGE: 3, LB: 3, CB: 3, S: 2 };
  return topAverage(scope, counts[scope] || 1);
}

function teamPositionScore(team, scope) {
  if (!team) return "";
  const dynamic = dynamicTeamPositionScore(team, scope);
  if (Number.isFinite(Number(dynamic))) return dynamic;
  if (scope === "Whole Team") return team.overall;
  if (scope === "Offense") return team.offenseAverage;
  if (scope === "Defense") return team.defenseAverage;
  if (scope === "Defensive Backs") {
    const cb = team.positionScores.find((s) => s.position === "CB")?.score;
    const safety = team.positionScores.find((s) => s.position === "S")?.score;
    return [cb, safety].filter((value) => Number.isFinite(Number(value))).reduce((sum, value, _, arr) => sum + num(value) / arr.length, 0);
  }
  return team.positionScores.find((s) => s.position === scope)?.score;
}

function quickTeamRankRows(scope, limit) {
  return state.data.teams
    .map((team) => ({ team, score: teamPositionScore(team, scope) }))
    .filter((row) => Number.isFinite(Number(row.score)))
    .sort((a, b) => num(b.score) - num(a.score) || a.team.team.localeCompare(b.team.team))
    .slice(0, limit);
}

function renderQuickPlayerPicker(player) {
  const matches = quickPlayerMatches(24);
  const resultText = state.quickPlayerQuery.trim()
    ? `${matches.length} leaguewide matches`
    : "Start typing to search every roster and free agent";
  return `
    <div class="quick-search-row">
      <input id="quick-player-query" placeholder="Search any NFL player, team, abbreviation, or position" value="${esc(state.quickPlayerQuery)}" />
      <button id="quick-player-set" class="mini-action primary">Load Best</button>
    </div>
    <div class="quick-search-meta">${esc(resultText)}</div>
    ${state.quickPlayerQuery.trim() ? `<div class="quick-player-results">${matches.map((p) => `
      <button class="quick-player-result" data-quick-player-key="${esc(sourceKey(p))}">
        <span class="quick-player-main">${playerAvatar(p)}<span><b>${esc(p.player)}</b><em>${esc(p.position)}${p.depth ? ` - ${esc(p.position)}${esc(p.depth)}` : ""}</em></span></span>
        <span>${teamCell(p)}</span>
        ${ratingBadge(p.rating)}
      </button>
    `).join("") || "<p class='note'>No leaguewide player matches found.</p>"}</div>` : ""}
    ${player ? `<div class="quick-player-current">${playerNameButton(player)}<span>${teamCell(player)}</span><span class="pos-chip ${positionChipClass(player.position)}">${esc(player.position)}</span>${ratingBadge(player.rating)}</div>` : "<p class='note'>Search for a player to unlock the player quick actions.</p>"}
  `;
}

function wireQuickActions() {
  const query = document.querySelector("#quick-player-query");
  query?.addEventListener("input", (event) => {
    state.quickPlayerQuery = event.target.value;
    state.quickPlayerKey = "";
    clearTimeout(quickPlayerSearchTimer);
    quickPlayerSearchTimer = setTimeout(() => {
      render();
      const nextInput = document.querySelector("#quick-player-query");
      if (nextInput) {
        nextInput.focus();
        nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
      }
    }, 140);
  });
  query?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const next = quickPlayerMatches()[0];
    state.quickPlayerKey = next ? sourceKey(next) : "";
    if (next) state.quickMoveTeam = next.team || "Free Agent";
    render();
  });
  document.querySelector("#quick-player-set")?.addEventListener("click", () => {
    const typed = state.quickPlayerQuery.trim();
    const exact = state.players.find((p) => p.player.toLowerCase() === typed.toLowerCase());
    const next = exact || quickPlayerMatches(1)[0];
    state.quickPlayerKey = next ? sourceKey(next) : "";
    if (next) state.quickMoveTeam = next.team || "Free Agent";
    render();
  });
  document.querySelectorAll("[data-quick-player-key]").forEach((button) => button.addEventListener("click", () => {
    const next = findPlayer(button.dataset.quickPlayerKey);
    if (!next) return;
    state.quickPlayerKey = sourceKey(next);
    state.quickPlayerQuery = next.player;
    state.quickMoveTeam = next.team || "Free Agent";
    render();
  }));
  document.querySelector("#quick-open-details")?.addEventListener("click", () => {
    const player = selectedQuickPlayer();
    if (player) state.selectedPlayerKey = sourceKey(player);
    render();
  });
  document.querySelector("#quick-move-team")?.addEventListener("change", (event) => { state.quickMoveTeam = event.target.value; });
  document.querySelector("#quick-apply-move")?.addEventListener("click", () => {
    const player = selectedQuickPlayer();
    if (!player) return;
    const team = state.quickMoveTeam;
    persistPlayer(player, team === "Free Agent" ? { team, teamAbbrev: "FA" } : { team, teamAbbrev: state.data.meta.teamAbbrevs[team] || team });
    state.quickPlayerKey = sourceKey(selectedQuickPlayer() || player);
    render();
  });
  document.querySelector("#quick-rating-save")?.addEventListener("click", () => {
    const player = selectedQuickPlayer();
    if (!player) return;
    const rating = Math.max(50, Math.min(105, Math.floor(num(document.querySelector("#quick-rating")?.value, player.rating))));
    persistPlayer(player, { rating, newRating: rating });
    render();
  });
  document.querySelectorAll(".quick-thumb").forEach((button) => button.addEventListener("click", () => {
    const player = selectedQuickPlayer();
    if (player) applyThumb(player, button.dataset.dir);
    render();
  }));
  document.querySelector("#quick-injury")?.addEventListener("change", (event) => {
    const player = selectedQuickPlayer();
    if (player) persistPlayer(player, { injury: event.target.value });
    render();
  });
  document.querySelector("#quick-week")?.addEventListener("change", (event) => {
    const player = selectedQuickPlayer();
    if (player) persistPlayer(player, { week: event.target.value });
    render();
  });
  document.querySelector("#quick-game-week")?.addEventListener("change", (event) => {
    state.quickGameWeek = event.target.value;
    state.quickGameKey = "";
    state.quickWinner = "";
    render();
  });
  document.querySelector("#quick-game")?.addEventListener("change", (event) => {
    state.quickGameKey = event.target.value;
    state.quickWinner = "";
    render();
  });
  document.querySelector("#quick-winner")?.addEventListener("change", (event) => { state.quickWinner = event.target.value; });
  document.querySelector("#quick-save-result")?.addEventListener("click", () => {
    if (!state.quickGameKey || !state.quickWinner) return;
    saveGameAction(state.quickGameKey, { resultWinner: state.quickWinner, ml: gameAction(state.quickGameKey).ml || state.quickWinner });
    render();
  });
  document.querySelector("#quick-rank-scope")?.addEventListener("change", (event) => { state.quickRankScope = event.target.value; render(); });
  document.querySelector("#quick-rank-limit")?.addEventListener("change", (event) => { state.quickRankLimit = Number(event.target.value); render(); });
  document.querySelector("#quick-team-rank-scope")?.addEventListener("change", (event) => { state.quickTeamRankScope = event.target.value; render(); });
  document.querySelector("#quick-team-rank-limit")?.addEventListener("change", (event) => { state.quickTeamRankLimit = Number(event.target.value); render(); });
  wirePlayerActions();
}

function renderHome() {
  const player = selectedQuickPlayer();
  const teams = ["Free Agent", ...unique(state.players.map((p) => p.team).filter((team) => team !== "Free Agent"))];
  const rankScopes = ["QB", "RB", "WR", "TE", "OLINE", "Offense", "Defense", "All Players", ...unique(state.players.map((p) => `Team: ${p.team}`))];
  const ranked = quickRankPlayers(state.quickRankScope, state.quickRankLimit);
  const teamRankScopes = ["Whole Team", "Offense", "Defense", "QB", "RB", "WR", "TE", "OT", "OG", "C", "IOL", "OL", "OLINE", "IDL", "EDGE Def", "DL\n(DT + EDGE)", "LB Only", "LB + EDGE", "CB", "S", "Defensive Backs"];
  const normalizedTeamScope = state.quickTeamRankScope === "OLINE" ? "OL" : state.quickTeamRankScope;
  const teamRanked = quickTeamRankRows(normalizedTeamScope, state.quickTeamRankLimit);
  const weeks = scheduleWeekOptions(true);
  const games = scheduleGames()
    .map((game, index) => ({ game, key: scheduleGameKey(game, index) }))
    .filter(({ game }) => scheduleWeekMatches(game, state.quickGameWeek));
  if (!state.quickGameKey && games[0]) state.quickGameKey = games[0].key;
  const selectedGame = games.find((item) => item.key === state.quickGameKey)?.game || games[0]?.game;
  const selectedGameKey = games.find((item) => item.game === selectedGame)?.key || state.quickGameKey;
  const currentPick = gameAction(selectedGameKey).ml || selectedGame?.officialPick || "";
  const playerDisabled = player ? "" : "disabled";
  setTimeout(wireQuickActions);
  return `
    <section class="home-quick">
      <div class="home-quick-head">
        <div>
          <p class="eyebrow">NFL Model Z IQ</p>
          <h2>Quick Actions</h2>
        </div>
        <button class="mini-action" data-page="depth">Open Depth Charts</button>
      </div>
      <div class="quick-grid">
        <section class="quick-player-suite">
          <div class="quick-suite-head">
            <div class="quick-card-title"><span>01</span><h3>Player Actions</h3></div>
            <p>Search once, then use the actions below on the selected player.</p>
          </div>
          <div class="quick-player-search-panel">
            ${renderQuickPlayerPicker(player)}
          </div>
          <div class="quick-player-action-grid">
            <article class="quick-card action-card">
              <div class="quick-card-title"><span>02</span><h3>View Details</h3></div>
              <button id="quick-open-details" class="quick-bubble" ${playerDisabled}>Open Player Details</button>
            </article>
            <article class="quick-card action-card">
              <div class="quick-card-title"><span>03</span><h3>Move Player</h3></div>
              ${select("quick-move-team", state.quickMoveTeam, teams)}
              <button id="quick-apply-move" class="quick-bubble" ${playerDisabled}>Assign Team / FA</button>
            </article>
            <article class="quick-card action-card">
              <div class="quick-card-title"><span>04</span><h3>Apply Injury</h3></div>
              <div class="quick-two">${injurySelect("quick", player?.injury).replace("class=\"injury-status\"", "id=\"quick-injury\" class=\"injury-status\"")} ${weekSelect("quick", player?.week).replace("class=\"injury-week\"", "id=\"quick-week\" class=\"injury-week\"")}</div>
            </article>
            <article class="quick-card action-card">
              <div class="quick-card-title"><span>05</span><h3>Adjust Rating</h3></div>
              <div class="quick-search-row"><input id="quick-rating" type="number" min="50" max="105" value="${player ? fmt(player.rating, 0) : ""}" ${playerDisabled} /><button id="quick-rating-save" class="quick-bubble" ${playerDisabled}>Save</button></div>
            </article>
            <article class="quick-card action-card">
              <div class="quick-card-title"><span>06</span><h3>Nudge</h3></div>
              <div class="quick-two"><button class="quick-bubble quick-thumb" data-dir="up" ${playerDisabled}>Thumbs Up</button><button class="quick-bubble quick-thumb" data-dir="down" ${playerDisabled}>Thumbs Down</button></div>
            </article>
          </div>
        </section>
        <article class="quick-card span-2">
          <div class="quick-card-title"><span>07</span><h3>Add Game Result</h3></div>
          <div class="quick-three">${optionSelect("quick-game-week", state.quickGameWeek, weeks)}<select id="quick-game">${games.map(({ game, key }) => `<option value="${esc(key)}" ${key === selectedGameKey ? "selected" : ""}>${esc(weekDisplay(game.week))} - ${esc(game.visitor)} at ${esc(game.home)}</option>`).join("")}</select><select id="quick-winner"><option value="">Winner</option>${selectedGame ? [selectedGame.visitor, selectedGame.home].map((team) => `<option ${(state.quickWinner || currentPick) === team ? "selected" : ""}>${esc(team)}</option>`).join("") : ""}</select></div>
          <button id="quick-save-result" class="quick-bubble">Save Result</button>
        </article>
        <article class="quick-card span-2">
          <div class="quick-card-title"><span>08</span><h3>Positional Rankings</h3></div>
          <div class="quick-three">${select("quick-rank-scope", state.quickRankScope, rankScopes)}${select("quick-rank-limit", state.quickRankLimit, [10, 20, 30, 50, 100])}<button class="quick-bubble" data-page="top30">Open Top 30s</button></div>
          <div class="quick-rank-list">${ranked.map((p, index) => `<button class="quick-rank-row player-open" data-player-key="${esc(sourceKey(p))}"><b>${index + 1}</b><span class="quick-rank-player">${playerAvatar(p)}<span>${esc(p.player)}</span></span><em>${teamCell(p)}</em><strong>${fmt(p.rating, 0)}</strong></button>`).join("")}</div>
        </article>
        <article class="quick-card span-2">
          <div class="quick-card-title"><span>09</span><h3>Team Rankings</h3></div>
          <div class="quick-three">${select("quick-team-rank-scope", state.quickTeamRankScope, teamRankScopes)}${select("quick-team-rank-limit", state.quickTeamRankLimit, [10, 20, 32])}<button class="quick-bubble" data-page="live">Open Live Rankings</button></div>
          <div class="quick-rank-list">${teamRanked.map((row, index) => `<div class="quick-rank-row quick-team-row"><b>${index + 1}</b><span>${teamCellByName(row.team.team)}</span><em>${esc(state.quickTeamRankScope)}</em><strong>${fmt(row.score, 1)}</strong></div>`).join("")}</div>
        </article>
      </div>
    </section>
    ${renderPlayerModal()}
  `;
}

function renderDepth() {
  const teams = ["All Teams", ...unique(state.players.map((p) => p.team))];
  const positions = ["All Positions", ...unique(state.players.map((p) => p.position)).sort((a, b) => depthPositionRank(a) - depthPositionRank(b) || String(a).localeCompare(String(b)))];
  const sides = ["All Sides", "Offense", "Defense"];
  let players = state.players.filter(matches);
  if (state.depthTeam !== "All Teams") players = players.filter((p) => p.team === state.depthTeam);
  if (state.depthSide !== "All Sides") players = players.filter((p) => depthSideFor(p) === state.depthSide);
  if (state.depthPosition !== "All Positions") players = players.filter((p) => p.position === state.depthPosition);
  players = players.sort((a, b) => a.team.localeCompare(b.team) || depthPositionRank(a.position) - depthPositionRank(b.position) || num(b.rating) - num(a.rating) || num(a.depth, 999) - num(b.depth, 999) || String(a.player).localeCompare(b.player));
  const rookies = players.filter((p) => String(p.player).includes("(R)")).length;
  const activeSides = state.depthSide === "Offense"
    ? ["Offense"]
    : state.depthSide === "Defense"
      ? ["Defense"]
      : ["Offense", "Defense"].filter((side) => players.some((p) => depthSideFor(p) === side));
  const reviewIsActive = state.depthCheck.status === "review" && (state.depthCheck.results || []).some((item) => !item.applied && !item.ignored);
  const depthTableRow = (p, includeTeam = true, extraClass = "", displayDepth = playerUnavailableLabel(p) || p.depth) => `
    <tr class="${String(p.player).includes("(R)") ? "rookie" : ""} ${playerUnavailableLabel(p) ? "unavailable-player" : ""} ${extraClass}" data-player-key="${esc(playerKey(p))}">
      ${includeTeam ? `<td class="team-col">${teamCell(p)}</td>` : ""}
      <td class="pos-col"><span class="pos-chip ${positionChipClass(p.position)}">${esc(p.position)}</span></td>
      <td class="player-col">${playerNameButton(p)}</td>
      <td class="num rating-col">${ratingBadge(p.rating)}</td>
      <td class="num depth-col">${depthBadge(displayDepth)}</td>
      <td class="stars-col">${starsMeter(p)}</td>
      <td class="nudge-col">${nudgeControls(p)}</td>
      <td class="injury-col"><span class="injury-stack">${injurySelect(sourceKey(p), p.injury)}${weekSelect(sourceKey(p), p.week)}</span></td>
    </tr>
  `;
  const depthRowsForSide = (sidePlayers) => {
    const positionCounts = {};
    const ordered = [...sidePlayers].sort((a, b) => depthPositionRank(a.position) - depthPositionRank(b.position) || Number(Boolean(playerUnavailableLabel(a))) - Number(Boolean(playerUnavailableLabel(b))) || num(a.depth, 999) - num(b.depth, 999) || num(b.rating) - num(a.rating) || String(a.player).localeCompare(b.player));
    return ordered.map((p, index) => {
      const unavailable = playerUnavailableLabel(p);
      if (!unavailable) positionCounts[p.position] = (positionCounts[p.position] || 0) + 1;
      const next = ordered[index + 1];
      const isPositionEnd = !next || String(next.position) !== String(p.position);
      return depthTableRow(p, false, isPositionEnd ? "position-end" : "", unavailable || positionCounts[p.position]);
    }).join("");
  };
  const groupedTeams = reviewIsActive ? "" : unique(players.map((p) => p.team)).map((team) => {
    const teamPlayers = players.filter((p) => p.team === team);
    const sample = teamPlayers[0] || {};
    const sideTable = (title, sidePlayers) => `
      <div class="depth-side ${title.toLowerCase()}">
        <div class="depth-side-title"><span>${title}</span><b>${sidePlayers.filter(isPlayerAvailable).length}</b></div>
        <div class="table-scroll depth-side-scroll">
          <table class="depth-table depth-team-table">
            <colgroup>
              <col class="c-pos" /><col class="c-player" /><col class="c-rating" /><col class="c-depth" /><col class="c-stars" /><col class="c-nudge" /><col class="c-injury" />
            </colgroup>
            <thead><tr><th>Pos</th><th>Player</th><th class="num">Rating</th><th class="num">Depth</th><th>Stars</th><th>Nudge</th><th>Injury</th></tr></thead>
            <tbody>${depthRowsForSide(sidePlayers) || '<tr><td colspan="7" class="empty-cell">No players in this filter.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    `;
    return `<article class="depth-team-bubble">
      <div class="depth-team-head">
        <h3>${teamLogo(team, sample.teamAbbrev)}<span>${esc(team)}</span></h3>
        <em>${teamPlayers.length} players</em>
      </div>
      <div class="depth-team-sides ${activeSides.length === 1 ? "single" : ""}">
        ${activeSides.map((side) => sideTable(side, teamPlayers.filter((p) => depthSideFor(p) === side))).join("")}
      </div>
    </article>`;
  }).join("");
  setTimeout(() => {
    wireSelect("depth-team", "depthTeam");
    wireSelect("depth-side", "depthSide");
    wireSelect("depth-position", "depthPosition");
    wirePlayerActions();
    document.querySelector("#depth-check-run")?.addEventListener("click", runDepthChartCheck);
    document.querySelector("#depth-check-run-both")?.addEventListener("click", runDepthAndInjuryChecks);
    document.querySelector("#depth-check-paste-run")?.addEventListener("click", runDepthChartPasteCheck);
    document.querySelector("#depth-check-activity")?.addEventListener("change", (event) => {
      state.depthCheckActivity = event.target.value;
      state.depthCheckVisibleLimit = 250;
      state.depthCheckNotice = "";
      render();
    });
    document.querySelector("#depth-check-show-more")?.addEventListener("click", () => {
      state.depthCheckVisibleLimit += 250;
      render();
    });
    document.querySelector("#depth-check-apply-all")?.addEventListener("click", applyAllDepthCheckResults);
    document.querySelector("#depth-check-add-missing")?.addEventListener("click", addAllMissingDepthCheckPlayers);
    document.querySelector("#injury-check-run")?.addEventListener("click", runInjuryCheck);
    document.querySelectorAll(".injury-apply-one").forEach((button) => button.addEventListener("click", () => applyInjuryCheckResult(Number(button.dataset.injuryCheckIndex))));
    document.querySelectorAll(".injury-ignore-one").forEach((button) => button.addEventListener("click", () => ignoreInjuryCheckResult(Number(button.dataset.injuryCheckIndex))));
  });
  return `
    <section class="panel depth-panel">
      <div class="toolbar depth-toolbar">
        <div>
          <h2>Depth Charts</h2>
          <p class="depth-meta">${players.length} shown / ${state.players.length} players. Default sort: team, position number, depth. ${rookies} rookies in view.</p>
        </div>
        <div class="filters depth-top-actions">
          ${select("depth-team", state.depthTeam, teams)}
          ${select("depth-side", state.depthSide, sides)}
          ${select("depth-position", state.depthPosition, positions)}
          <button id="depth-check-run-both" class="mini-action primary">Run Both Checks</button>
          <button id="depth-check-run" class="mini-action primary">Scan OurLads</button>
          <button id="injury-check-run" class="mini-action primary">Scan ESPN Injuries</button>
          ${pendingMissingDepthCheckCount() ? `<button id="depth-check-add-missing" class="mini-action primary">Add Missing Players (${pendingMissingDepthCheckCount()})</button>` : ""}
        </div>
      </div>
      ${renderDepthCheckPanel()}
      ${renderInjuryCheckPanel()}
      ${reviewIsActive ? "<p class='depth-check-note depth-review-focus'>Team depth bubbles are paused while scan results are open so review actions stay quick.</p>" : `<div class="depth-bubble-list">${groupedTeams || "<p class='note'>No players match this view.</p>"}</div>`}
    </section>
    ${renderPlayerModal()}
  `;
}

function findPlayer(key) {
  return state.players.find((p) => sourceKey(p) === key || playerKey(p) === key);
}

function findPlayerByName(name) {
  if (!name) return null;
  return state.players.find((p) => p.player === name) || state.players.find((p) => String(p.player).toLowerCase() === String(name).toLowerCase());
}

const injuryStatuses = ["Healthy", "OUT for Season", "OUT thru Week ___", "IR Thru Week ___", "Suspended thru Week ___", "*Likely* Out thru Week ___"];
const injuryWeeks = ["", ...Array.from({ length: 18 }, (_, i) => String(i + 1)), "WC", "DIV", "ACC", "NCC", "SB"];

function injurySelect(key, value) {
  return `<select class="injury-status" data-player-key="${esc(key)}">${injuryStatuses.map((item) => `<option ${String(value || "Healthy") === item ? "selected" : ""}>${item}</option>`).join("")}</select>`;
}

function weekSelect(key, value) {
  return `<select class="injury-week" data-player-key="${esc(key)}">${injuryWeeks.map((item) => `<option ${String(value || "") === item ? "selected" : ""}>${item}</option>`).join("")}</select>`;
}

function wirePlayerActions() {
  document.querySelectorAll(".player-open[data-player-name]").forEach((button) => button.addEventListener("click", () => {
    const p = findPlayerByName(button.dataset.playerName);
    if (p) state.selectedPlayerKey = playerKey(p);
    render();
  }));
  document.querySelectorAll(".player-open").forEach((button) => button.addEventListener("click", () => {
    if (!button.dataset.playerKey) return;
    state.selectedPlayerKey = button.dataset.playerKey;
    render();
  }));
  document.querySelectorAll(".thumb").forEach((button) => button.addEventListener("click", () => {
    const p = findPlayer(button.dataset.playerKey);
    if (p) applyThumb(p, button.dataset.dir);
    render();
  }));
  document.querySelectorAll(".undo").forEach((button) => button.addEventListener("click", () => {
    const p = findPlayer(button.dataset.playerKey);
    if (p) undoNudge(p);
    render();
  }));
  document.querySelectorAll(".injury-status").forEach((sel) => sel.addEventListener("change", () => {
    const p = findPlayer(sel.dataset.playerKey);
    if (p) persistPlayer(p, { injury: sel.value });
    render();
  }));
  document.querySelectorAll(".injury-week").forEach((sel) => sel.addEventListener("change", () => {
    const p = findPlayer(sel.dataset.playerKey);
    if (p) persistPlayer(p, { week: sel.value });
    render();
  }));
  document.querySelector("#modal-close")?.addEventListener("click", () => {
    state.selectedPlayerKey = null;
    render();
  });
  document.querySelector(".modal")?.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) {
      state.selectedPlayerKey = null;
      render();
    }
  });
  document.onkeydown = (event) => {
    if (event.key === "Escape" && state.selectedPlayerKey) {
      state.selectedPlayerKey = null;
      render();
    }
  };
  document.querySelector("#rating-save")?.addEventListener("click", () => {
    const p = findPlayer(state.selectedPlayerKey);
    const rating = num(document.querySelector("#manual-rating")?.value, p?.rating);
    if (p) persistPlayer(p, { rating: Math.max(50, Math.min(105, Math.floor(rating))), newRating: Math.floor(rating) });
    state.selectedPlayerKey = null;
    render();
  });
  document.querySelectorAll(".modal-thumb").forEach((button) => button.addEventListener("click", () => {
    const p = findPlayer(state.selectedPlayerKey);
    if (p) applyThumb(p, button.dataset.dir);
    render();
  }));
  document.querySelector("#modal-undo")?.addEventListener("click", () => {
    const p = findPlayer(state.selectedPlayerKey);
    if (p) undoNudge(p);
    render();
  });
  document.querySelector("#modal-injury")?.addEventListener("change", (event) => {
    const p = findPlayer(state.selectedPlayerKey);
    if (p) persistPlayer(p, { injury: event.target.value });
    render();
  });
  document.querySelector("#modal-week")?.addEventListener("change", (event) => {
    const p = findPlayer(state.selectedPlayerKey);
    if (p) persistPlayer(p, { week: event.target.value });
    render();
  });
}

function renderPlayerModal() {
  const p = findPlayer(state.selectedPlayerKey);
  if (!p) return "";
  const rank = positionRank(p);
  const pff = state.data.pff.find((row) => row.player === p.player);
  return `
    <div class="modal">
      <div class="modal-card">
        <button id="modal-close" class="modal-close" title="Close">x</button>
        <div class="player-hero">${playerAvatar(p, "lg")}<div><h2>${p.player}</h2><p>${p.team} - ${p.position}${String(p.player).includes("(R)") ? " - Rookie" : ""}</p></div></div>
        <div class="metrics compact">
          ${metric("Rating", fmt(p.rating, 0), "G")}
          ${metric("Depth", fmt(p.depth, 0), "H")}
          ${metric("Stars", fmt(p.stars, 1), "I")}
          ${metric("Pos Rank", rank ? `#${rank}` : "", groupPosition(p.position))}
          ${metric("PFF", pff ? fmt(pff.pff, 0) : "No row", pff ? `New ${fmt(pff.newRating, 0)} / ${pff.delta > 0 ? "+" : ""}${fmt(pff.delta, 0)}` : "PFF Import")}
        </div>
        <div class="editor-row">
          <label>Manual rating <input id="manual-rating" type="number" min="50" max="105" value="${fmt(p.rating, 0)}" /></label>
          <button id="rating-save">Save Rating</button>
          <button class="modal-thumb" data-dir="up">Nudge Up</button>
          <button class="modal-thumb" data-dir="down">Nudge Down</button>
          <button id="modal-undo">Undo Nudge</button>
        </div>
        <div class="editor-row">
          <label>Injury status ${injurySelect("modal", p.injury).replace("class=\"injury-status\"", "id=\"modal-injury\" class=\"injury-status\"")}</label>
          <label>Week ${weekSelect("modal", p.week).replace("class=\"injury-week\"", "id=\"modal-week\" class=\"injury-week\"")}</label>
        </div>
        ${renderPlayerQbGameLogs(p)}
        <p class="note">Player photos can plug into this page later. For now this is the rating, depth, stars, injury, rookie, and nudge control center.</p>
      </div>
    </div>
  `;
}

function renderPlayerQbGameLogs(player) {
  const log = footballguysLogFor(player);
  if (!log?.weeks?.length) {
    if (groupPosition(player.position) !== "QB" && player.position !== "QB") return "";
    return `
      <section class="modal-game-log">
        <div class="modal-section-head">
          <h3>QB Game Logs</h3>
          <span>No scanned Footballguys row found</span>
        </div>
      </section>
    `;
  }
  const rows = log.weeks.map((week) => `
    <tr class="${week.played ? "" : "muted-row"}">
      <td class="num rank-col">${fantasyDisplay(week.week, 0)}</td>
      <td>${esc(week.opponent || "-")}</td>
      <td>${esc(week.result || "-")}</td>
      <td>${week.played ? "Yes" : "No"}</td>
      <td class="num">${fantasyDisplay(week.passYards, 0)}</td>
      <td class="num">${fantasyDisplay(week.passTds, 0)}</td>
      <td class="num">${fantasyDisplay(week.interceptions, 0)}</td>
      <td class="num">${fantasyDisplay(week.rushAttempts, 0)}</td>
      <td class="num">${fantasyDisplay(week.rushYards, 0)}</td>
      <td class="num">${fantasyDisplay(week.rushTds, 0)}</td>
    </tr>
  `);
  return `
    <section class="modal-game-log">
      <div class="modal-section-head">
        <h3>QB Game Logs</h3>
        <span>${esc(log.teamAbbrev || log.team || "")} ${esc(window.FOOTBALLGUYS_GAME_LOGS?.year || "")} - ${fantasyDisplay(log.gamesPlayed, 0)} games counted</span>
      </div>
      <div class="table-scroll modal-game-log-scroll">
        ${table([
          { label: "Wk", cls: "num rank-col" },
          { label: "Opp" },
          { label: "Result" },
          { label: "Played" },
          { label: "PYds", cls: "num" },
          { label: "PTD", cls: "num" },
          { label: "INT", cls: "num" },
          { label: "RA", cls: "num" },
          { label: "RYds", cls: "num" },
          { label: "RTD", cls: "num" },
        ], rows)}
      </div>
    </section>
  `;
}

function wirePlayerModalControls() {
  document.querySelector("#modal-close")?.addEventListener("click", () => {
    state.selectedPlayerKey = null;
    render();
  });
  document.querySelector(".modal")?.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) {
      state.selectedPlayerKey = null;
      render();
    }
  });
  document.onkeydown = (event) => {
    if (event.key === "Escape" && state.selectedPlayerKey) {
      state.selectedPlayerKey = null;
      render();
    }
  };
  document.querySelector("#rating-save")?.addEventListener("click", () => {
    const p = findPlayer(state.selectedPlayerKey);
    const rating = num(document.querySelector("#manual-rating")?.value, p?.rating);
    if (p) persistPlayer(p, { rating: Math.max(50, Math.min(105, Math.floor(rating))), newRating: Math.floor(rating) });
    state.selectedPlayerKey = null;
    render();
  });
  document.querySelectorAll(".modal-thumb").forEach((button) => button.addEventListener("click", () => {
    const p = findPlayer(state.selectedPlayerKey);
    if (p) applyThumb(p, button.dataset.dir);
    render();
  }));
  document.querySelector("#modal-undo")?.addEventListener("click", () => {
    const p = findPlayer(state.selectedPlayerKey);
    if (p) undoNudge(p);
    render();
  });
  document.querySelector("#modal-injury")?.addEventListener("change", (event) => {
    const p = findPlayer(state.selectedPlayerKey);
    if (p) persistPlayer(p, { injury: event.target.value });
    render();
  });
  document.querySelector("#modal-week")?.addEventListener("change", (event) => {
    const p = findPlayer(state.selectedPlayerKey);
    if (p) persistPlayer(p, { week: event.target.value });
    render();
  });
}

function positionRank(player) {
  const group = groupPosition(player.position);
  const ranked = buildRankedPlayers(group, 5000);
  return ranked.find((p) => playerKey(p) === playerKey(player))?.rank;
}

function buildRankedPlayers(position, limit) {
  let players = state.players.filter((p) => Number.isFinite(Number(p.rating)));
  if (position !== "All Positions") {
    players = players.filter((p) => groupPosition(p.position) === position);
  }
  players.sort((a, b) => num(b.rating) - num(a.rating) || String(a.player).localeCompare(b.player));
  let lastRating = null;
  let currentRank = 0;
  return players.slice(0, limit).map((p, index) => {
    if (num(p.rating) !== lastRating) currentRank = index + 1;
    lastRating = num(p.rating);
    return { ...p, rank: currentRank };
  });
}

function groupPosition(pos) {
  if (pos === "LT" || pos === "RT") return "OT";
  if (pos === "LG" || pos === "RG") return "OG";
  return pos;
}

function normalizeName(value) {
  return String(value || "")
    .replace(/\(R\)/gi, "")
    .replace(/\((WR|CB)\)/gi, "")
    .replace(/\b(jr|sr|ii|iii|iv|v)\b\.?/gi, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

function compactName(value) {
  return normalizeName(value).replace(/\s+/g, "");
}

function initialsExpandedName(value) {
  return String(value || "").replace(/\b([A-Z])\.?\s*([A-Z])\.?\b/g, "$1 $2");
}

function normalizeTeamName(value) {
  return teamNameAliases[value] || value || "";
}

function maddenPosition(pos) {
  if (pos === "HB") return "RB";
  if (pos === "FB") return "";
  if (["LEDG", "REDG", "LE", "RE"].includes(pos)) return "EDGE";
  if (pos === "DT") return "IDL";
  if (["FS", "SS"].includes(pos)) return "S";
  if (["MIKE", "WILL", "SAM", "MLB", "LOLB", "ROLB"].includes(pos)) return "LB";
  return groupPosition(pos);
}

function maddenRowKey(row) {
  return `${normalizeName(row.player)}__${maddenPosition(row.pos)}__${normalizeTeamName(row.team)}`;
}

function maddenNameScore(sourceName, candidateName) {
  const source = normalizeName(initialsExpandedName(sourceName));
  const candidate = normalizeName(initialsExpandedName(candidateName));
  if (!source || !candidate) return 0;
  if (source === candidate) return 100;
  if (compactName(source) === compactName(candidate)) return 98;
  const sourceTokens = source.split(" ").filter(Boolean);
  const candidateTokens = candidate.split(" ").filter(Boolean);
  const sourceLast = sourceTokens.at(-1);
  const candidateLast = candidateTokens.at(-1);
  const shared = sourceTokens.filter((token) => candidateTokens.includes(token)).length;
  let score = shared * 18;
  if (sourceLast && candidateLast && sourceLast === candidateLast) score += 28;
  if (sourceTokens[0] && candidateTokens[0]) {
    if (sourceTokens[0] === candidateTokens[0]) score += 20;
    else if (sourceTokens[0][0] === candidateTokens[0][0]) score += 8;
    if (compactName(sourceTokens.slice(0, -1).join("")) === compactName(candidateTokens.slice(0, -1).join(""))) score += 14;
  }
  if (compactName(source).includes(compactName(candidate)) || compactName(candidate).includes(compactName(source))) score += 12;
  return Math.min(99, score);
}

function maddenCandidateMatches(madden, players) {
  const mTeam = normalizeTeamName(madden.team);
  const mPos = maddenPosition(madden.pos);
  return players.map((player) => {
    const nameScore = maddenNameScore(madden.player, player.player);
    const sameTeam = normalizeTeamName(player.team) === mTeam;
    const positionScore = mPos && (groupPosition(player.position) === mPos || player.position === mPos) ? 12 : 0;
    const teamScore = sameTeam ? 18 : -4;
    return { player, nameScore, sameTeam, score: nameScore + positionScore + teamScore };
  })
    .filter((item) => item.nameScore >= 62 || (item.sameTeam && item.nameScore >= 48))
    .sort((a, b) => b.score - a.score || b.nameScore - a.nameScore || num(b.player.rating) - num(a.player.rating))
    .slice(0, 6);
}

function maddenPlayerPools(players) {
  return players.reduce((map, player) => {
    const pos = groupPosition(player.position);
    if (!map.has(pos)) map.set(pos, []);
    map.get(pos).push(player);
    return map;
  }, new Map());
}

function maddenRowPff(row) {
  if (row._pff !== undefined) return row._pff;
  const mPos = maddenPosition(row.madden.pos);
  row._pff = row.match ? pffRankInfo(row.match) : pffRankInfo({ player: row.madden.player, team: row.madden.team, teamAbbrev: pffTeamAbbrevMap[row.madden.team], position: mPos });
  return row._pff;
}

function buildMaddenMatches() {
  const players = state.players.filter(isIncludedPlayer);
  const pools = maddenPlayerPools(players);
  return maddenRows.map((madden) => {
    const rowKey = maddenRowKey(madden);
    const mPos = maddenPosition(madden.pos);
    const candidates = maddenCandidateMatches(madden, pools.get(groupPosition(mPos)) || players);
    const overrideKey = maddenMatchOverrides[rowKey];
    const override = overrideKey ? findPlayer(overrideKey) : null;
    const match = override || candidates[0]?.player || null;
    const exactCount = candidates.filter((item) => item.nameScore >= 98).length;
    const confidence = !match ? "unmatched"
      : override ? "selected"
        : candidates.length > 1 && (exactCount > 1 || candidates[1].score >= candidates[0].score - 8) ? "duplicate"
          : candidates[0]?.nameScore >= 98 && candidates[0]?.sameTeam ? "exact"
            : candidates[0]?.sameTeam ? "name variant" : "team mismatch";
    const key = match ? sourceKey(match) : "";
    const pending = key ? num(state.maddenPending[key], 0) : 0;
    const mine = match ? num(match.rating) : "";
    return {
      madden,
      rowKey,
      match,
      candidates,
      key,
      pending,
      projected: match ? mine + pending : "",
      diff: match ? num(madden.ovr) - mine : "",
      confidence,
      review: !match || confidence !== "exact",
    };
  });
}

function pffTeamCodeFor(teamName) {
  const abbrev = String(pffTeamAbbrevMap[normalizeTeamName(teamName)] || teamName || "").toUpperCase();
  return {
    ARI: "ARZ",
    BAL: "BLT",
    CLE: "CLV",
    HOU: "HST",
    LAR: "LA",
    LAC: "LAC",
  }[abbrev] || abbrev;
}

const pffPastePositions = [
  ["QB", "QB"],
  ["RB", "RB"],
  ["WR", "WR"],
  ["TE", "TE"],
  ["OT", "OT"],
  ["OG", "OG"],
  ["C", "C"],
  ["IDL", "IDL"],
  ["EDGE", "EDGE"],
  ["LB", "LB"],
  ["CB", "CB"],
  ["S", "S"],
];

function pffManualKey(row) {
  return `${groupPosition(row.modelPosition || row.position || "")}__${normalizeName(row.name || row.player)}__${String(row.team || "").toUpperCase()}`;
}

function usefulPffGrade(value) {
  const grade = Number(value);
  return Number.isFinite(grade) && grade > 0 ? grade : null;
}

function pffCachedRowFor(row) {
  const name = normalizeName(row.name || row.player);
  const team = String(row.team || "").toUpperCase();
  const rows = pffPositionCache.rows || [];
  return rows.find((entry) => normalizeName(entry.name || entry.player) === name && String(entry.team || "").toUpperCase() === team)
    || rows.find((entry) => normalizeName(entry.name || entry.player) === name);
}

function pffManualRows() {
  if (pffManualRowsCache) return pffManualRowsCache;
  const savedRows = Object.values(pffManualRanks || {});
  const usingSavedRows = savedRows.length > 0;
  const sourceRows = (usingSavedRows ? savedRows : (pffPositionCache.rows || []))
    .filter((row) => allowedModelPositions.has(groupPosition(row.modelPosition || row.pffPosition || row.position)));
  pffManualRowsCache = sourceRows.map((row) => {
    const cached = usingSavedRows ? pffCachedRowFor(row) : row;
    const modelPosition = groupPosition(cached?.modelPosition || cached?.pffPosition || row.modelPosition || row.pffPosition);
    return {
      ...row,
      modelPosition,
      pffPosition: cached?.pffPosition || row.pffPosition || modelPosition,
      team: row.team || cached?.team,
      grade: usefulPffGrade(row.grade) ?? usefulPffGrade(cached?.grade),
      snaps: Number.isFinite(Number(row.snaps)) ? Number(row.snaps) : cached?.snaps,
      source: row.source || (usingSavedRows ? "paste" : "static-cache"),
    };
  });
  return pffManualRowsCache;
}

function pffIndex() {
  if (pffIndexCache) return pffIndexCache;
  const build = (rows) => rows.reduce((map, row) => {
    const pos = groupPosition(row.modelPosition || row.pffPosition);
    if (!map.has(pos)) map.set(pos, []);
    map.get(pos).push(row);
    return map;
  }, new Map());
  pffIndexCache = {
    rowsByPos: build(pffPositionCache.rows || []),
    manualByPos: build(pffManualRows()),
  };
  return pffIndexCache;
}

function invalidatePffIndexes() {
  pffManualRowsCache = null;
  pffIndexCache = null;
}

function pffPlayerMatchIndex() {
  if (pffPlayerMatchIndexCache) return pffPlayerMatchIndexCache;
  const byPosName = new Map();
  state.players.forEach((player) => {
    const pos = groupPosition(player.position);
    const name = normalizeName(player.player);
    const key = `${pos}__${name}`;
    if (!byPosName.has(key)) byPosName.set(key, []);
    byPosName.get(key).push(player);
  });
  pffPlayerMatchIndexCache = byPosName;
  return pffPlayerMatchIndexCache;
}

function pffPasteSnapOffset(modelPosition) {
  const pos = groupPosition(modelPosition);
  if (pos === "QB") return 7;
  if (["RB", "WR", "TE"].includes(pos)) return 10;
  if (["OT", "OG", "C"].includes(pos)) return 9;
  if (pos === "LB") return 9;
  return 8;
}

function parsePffPaste(text, modelPosition = "EDGE") {
  const lines = String(text || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const rows = [];
  const seen = new Set();
  const snapOffset = pffPasteSnapOffset(modelPosition);
  for (let index = 0; index < lines.length - 4; index += 1) {
    const rankText = lines[index].replace(/,/g, "");
    if (!/^\d{1,4}$/.test(rankText)) continue;
    const name = lines[index + 1]?.replace(/\s+/g, " ").trim();
    const team = lines[index + 2]?.toUpperCase();
    const jersey = lines[index + 3] || "";
    const grade = Number(String(lines[index + 4] || "").replace(/,/g, ""));
    const snaps = Number(String(lines[index + snapOffset] || "").replace(/,/g, ""));
    if (!name || !/^[A-Z]{2,4}$/.test(team || "") || !/^#\s*\d+/.test(jersey) || !Number.isFinite(grade)) continue;
    const row = {
      name,
      player: name,
      team,
      pffPosition: modelPosition,
      modelPosition,
      rank: Number(rankText),
      ranked: null,
      total: null,
      grade,
      snaps: Number.isFinite(snaps) ? snaps : null,
      snapPercentile: null,
      source: "paste",
      importedAt: new Date().toISOString(),
    };
    const key = pffManualKey(row);
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(row);
  }
  const total = rows.reduce((max, row) => Math.max(max, num(row.rank, 0)), rows.length);
  rows.forEach((row) => {
    row.ranked = total;
    row.total = total;
    const snapRows = rows.filter((entry) => Number.isFinite(Number(entry.snaps))).sort((a, b) => num(a.snaps) - num(b.snaps));
    const snapIndex = snapRows.findIndex((entry) => entry === row);
    row.snapPercentile = snapIndex >= 0 && snapRows.length > 1 ? Number(((snapIndex / (snapRows.length - 1)) * 100).toFixed(0)) : null;
  });
  return rows.sort((a, b) => num(a.rank, 999) - num(b.rank, 999));
}

function detectPffPastePosition(text) {
  const sample = String(text || "").slice(0, 500).toLowerCase();
  const checks = [
    [/quarterbacks|nfl qb\b|\bqb player grades/, "QB"],
    [/running backs|nfl hb\b|nfl rb\b|\bhb player grades|\brb player grades/, "RB"],
    [/wide receivers|nfl wr\b|\bwr player grades/, "WR"],
    [/tight ends|nfl te\b|\bte player grades/, "TE"],
    [/tackles|nfl t\b|\bt player grades/, "OT"],
    [/guards|nfl g\b|\bg player grades/, "OG"],
    [/centers|nfl c\b|\bc player grades/, "C"],
    [/interior defenders|nfl di\b|\bdi player grades/, "IDL"],
    [/edge defenders|nfl ed\b|\bed player grades/, "EDGE"],
    [/linebackers|nfl lb\b|\blb player grades/, "LB"],
    [/cornerbacks|nfl cb\b|\bcb player grades/, "CB"],
    [/safeties|nfl s\b|\bs player grades/, "S"],
  ];
  return checks.find(([pattern]) => pattern.test(sample))?.[1] || "";
}

function savePffManualRows(rows) {
  rows.forEach((row) => {
    pffManualRanks[pffManualKey(row)] = row;
  });
  invalidatePffIndexes();
  storage.set("nflz-pff-manual-ranks", pffManualRanks);
}

function pffSnapPercentile(row, positionRows) {
  if (!row || !Number.isFinite(Number(row.snaps))) return null;
  if (Number.isFinite(Number(row.snapPercentile))) return Number(row.snapPercentile);
  const snapRows = (positionRows || []).filter((entry) => Number.isFinite(Number(entry.snaps))).sort((a, b) => num(a.snaps) - num(b.snaps));
  const index = snapRows.findIndex((entry) => entry === row || pffManualKey(entry) === pffManualKey(row));
  if (index < 0 || snapRows.length <= 1) return null;
  return Number(((index / (snapRows.length - 1)) * 100).toFixed(0));
}

function pffTrustLabel(pff) {
  if (!pff) return "";
  const snapPct = Number(pff.snapPercentile);
  if (!Number.isFinite(snapPct)) return "No snap percentile";
  if (snapPct >= 75) return "strong sample";
  if (snapPct >= 45) return "solid sample";
  if (snapPct >= 20) return "light sample";
  return "thin sample";
}

function importPffPaste() {
  const text = document.querySelector("#pff-paste-text")?.value || "";
  const selectedPosition = document.querySelector("#pff-paste-position")?.value || state.pffPastePosition || "EDGE";
  const detectedPosition = detectPffPastePosition(text);
  const position = detectedPosition || selectedPosition;
  state.pffPastePosition = position;
  const rows = parsePffPaste(text, position);
  if (!rows.length) {
    state.pffManualNotice = "No PFF rows found. Copy the full position table and paste it here.";
    render();
    return;
  }
  savePffManualRows(rows);
  state.pffManualNotice = `Imported ${rows.length} ${position} PFF rank rows${detectedPosition ? " after detecting the pasted page type" : ""}. Madden comparison will use these first.`;
  render();
}

function pffRankInfo(player) {
  const pos = groupPosition(player.position || "");
  const name = normalizeName(player.player || player.name);
  const teamCode = pffTeamCodeFor(player.team || player.teamAbbrev);
  const indexes = pffIndex();
  const positionRows = indexes.rowsByPos.get(pos) || [];
  const cachedExact = positionRows.find((row) => normalizeName(row.name) === name && String(row.team || "").toUpperCase() === teamCode)
    || positionRows.find((row) => normalizeName(row.name) === name);
  const manualPositionRows = indexes.manualByPos.get(pos) || [];
  const manual = manualPositionRows.find((row) => normalizeName(row.name || row.player) === name && String(row.team || "").toUpperCase() === teamCode)
    || manualPositionRows.find((row) => normalizeName(row.name || row.player) === name);
  if (manual) {
    const enriched = {
      ...manual,
      grade: usefulPffGrade(manual.grade) ?? usefulPffGrade(cachedExact?.grade),
      snaps: Number.isFinite(Number(manual.snaps)) ? manual.snaps : cachedExact?.snaps,
      snapPercentile: Number.isFinite(Number(manual.snapPercentile)) ? manual.snapPercentile : cachedExact ? pffSnapPercentile(cachedExact, positionRows) : pffSnapPercentile(manual, manualPositionRows),
    };
    return { ...enriched, total: manual.total || manual.ranked || manualPositionRows.length, manual: true };
  }
  const exact = cachedExact;
  if (!exact) return null;
  const rank = Number.isFinite(Number(exact.rank)) && Number(exact.rank) > 0 ? Number(exact.rank) : "";
  const total = Number.isFinite(Number(exact.ranked)) ? Number(exact.ranked) : positionRows.filter((row) => Number.isFinite(Number(row.rank))).length || positionRows.length;
  const snapPercentile = pffSnapPercentile(exact, positionRows);
  return { ...exact, rank, total, grade: usefulPffGrade(exact.grade), snapPercentile };
}

function pffHasGrade(pff) {
  return usefulPffGrade(pff?.grade) !== null;
}

function renderMaddenPffCell(pff) {
  if (!pff) return "-";
  const hasGrade = pffHasGrade(pff);
  const source = pff.manual ? "paste" : "cache";
  const position = pff.pffPosition || pff.modelPosition || "PFF";
  const gradeText = hasGrade ? fmt(pff.grade, 1) : "No grade";
  const rankText = pff.rank ? `#${esc(pff.rank)} / ${esc(pff.total || "")}` : (hasGrade ? "PFF" : "Rank only");
  const snapText = pff.snaps ? ` over ${fmt(pff.snaps, 0)} snaps` : "";
  const title = hasGrade
    ? `${source} ${position} PFF grade ${gradeText}${snapText}`
    : `${source} ${position} PFF rank/snaps found, but grade was not available. Paste this PFF position table to fill the grade.`;
  return `<span class="madden-pff-rank ${hasGrade ? "" : "missing"}" title="${esc(title)}">${rankText}<small>${esc(gradeText)}</small></span>`;
}

function pffRankPercentile(pff) {
  const rank = Number(pff?.rank);
  const total = Number(pff?.total || pff?.ranked);
  if (!Number.isFinite(rank) || !Number.isFinite(total) || total <= 1 || rank <= 0) return null;
  return Math.max(0, Math.min(1, (total - rank) / (total - 1)));
}

function maddenSuggestedRating(row, pff = maddenRowPff(row)) {
  if (!row.match) return null;
  const mine = num(row.match.rating);
  const madden = num(row.madden.ovr, mine);
  const gap = madden - mine;
  if (!gap) return mine;
  const pffPct = pffRankPercentile(pff);
  const snapPct = Number.isFinite(Number(pff?.snapPercentile)) ? Math.max(0.25, Math.min(1, Number(pff.snapPercentile) / 100)) : 0.45;
  const hasPff = pffPct !== null;
  let closePct;
  if (!hasPff) {
    closePct = gap > 0 ? 0.18 : 0.34;
  } else if (gap > 0) {
    closePct = 0.12 + (0.68 * pffPct * snapPct);
  } else {
    closePct = 0.18 + (0.58 * (1 - pffPct) * snapPct);
  }
  closePct = Math.max(0.08, Math.min(0.85, closePct));
  let suggested = Math.round(mine + (gap * closePct));
  if (mine <= 70 && suggested < mine) suggested = mine;
  if (suggested < 68) suggested = 68;
  if (mine >= 71 && suggested < 71) suggested = 71;
  return Math.max(68, Math.min(110, suggested));
}

function renderMaddenSuggestion(row, pff) {
  const suggested = maddenSuggestedRating(row, pff);
  if (!row.match || suggested == null) return "";
  const current = num(row.match.rating);
  const delta = suggested - current;
  const pffPct = pffRankPercentile(pff);
  const pffText = pffPct === null ? "No PFF: cautious negative" : `PFF ${fmt(pffPct * 100, 0)}th pct`;
  const snapText = Number.isFinite(Number(pff?.snapPercentile)) ? `, snaps ${fmt(pff.snapPercentile, 0)}th pct` : "";
  return `<span class="madden-suggest" title="${esc(`${pffText}${snapText}. Moves toward Madden when PFF and snap sample support it.`)}">
    <button data-madden-suggest="${esc(row.key)}" data-madden-suggest-value="${esc(suggested)}">Suggest ${fmt(suggested, 0)}</button>
    <small class="${delta >= 0 ? "plus" : "minus"}">${delta > 0 ? "+" : ""}${fmt(delta, 0)}</small>
  </span>`;
}

function sortMaddenRows(rows) {
  const { key, direction } = state.maddenSort;
  const dir = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const pick = (row) => {
      if (key === "player") return row.madden.player;
      if (key === "team") return row.madden.team;
      if (key === "pos") return maddenPosition(row.madden.pos);
      if (key === "madden") return num(row.madden.ovr);
      if (key === "mine") return num(row.match?.rating, -999);
      if (key === "diff") return num(row.diff, -999);
      if (key === "pff") return maddenRowPff(row)?.rank === "" ? 999 : num(maddenRowPff(row)?.rank, 999);
      if (key === "pffSnaps") return num(maddenRowPff(row)?.snapPercentile, -1);
      if (key === "suggested") return num(maddenSuggestedRating(row), -999);
      if (key === "pending") return num(row.pending, 0);
      return row.confidence;
    };
    const av = pick(a);
    const bv = pick(b);
    return typeof av === "number" && typeof bv === "number" ? (av - bv) * dir : String(av).localeCompare(String(bv)) * dir;
  });
}

function maddenSortHeader(key, label, cls = "") {
  const active = state.maddenSort.key === key ? (state.maddenSort.direction === "asc" ? " up" : " down") : "";
  return `<th class="${cls}"><button class="madden-sort${active}" data-madden-sort="${esc(key)}">${esc(label)}</button></th>`;
}

function renderMaddenPlayer(row) {
  const recent = row.key ? maddenRecentAdjustments[row.key] : null;
  return `<span class="madden-player">
    ${row.madden.avatarUrl ? `<img src="${esc(row.madden.avatarUrl)}" alt="" loading="lazy" onerror="this.style.display='none'" />` : "<span class='madden-avatar-empty'></span>"}
    <span><b>${esc(row.madden.player)}</b>${recent ? `<em class="madden-recent-note">Adjusted ${fmt(recent.oldRating, 0)} -> ${fmt(recent.newRating, 0)}</em>` : ""}</span>
  </span>`;
}

function renderMaddenMatchCell(row) {
  if (!row.match) return "<span class='madden-confidence warn'>Needs review/add</span>";
  const choices = (row.candidates || []).filter((item) => item.player).map((item) => {
    const player = item.player;
    const key = sourceKey(player);
    const label = `${player.player} - ${pffTeamAbbrevMap[normalizeTeamName(player.team)] || normalizeTeamName(player.team)} ${player.position} ${fmt(player.rating, 0)}`;
    return `<option value="${esc(key)}" ${key === row.key ? "selected" : ""}>${esc(label)}</option>`;
  }).join("");
  if ((row.candidates || []).length > 1 || row.confidence !== "exact") {
    return `<div class="madden-match-pick">
      <select data-madden-match="${esc(row.rowKey)}">${choices}</select>
      <span class="madden-confidence">${esc(row.confidence)}</span>
    </div>`;
  }
  return playerNameButton(row.match);
}

function markMaddenRecentAdjustment(key, player, rating, meta = {}) {
  maddenRecentAdjustments[key] = {
    player: player.player,
    team: player.team,
    position: player.position,
    oldRating: num(player.rating),
    newRating: num(rating),
    maddenPlayer: meta.maddenPlayer || "",
    maddenOvr: meta.maddenOvr || "",
    adjustedAt: new Date().toISOString(),
  };
  const entries = Object.entries(maddenRecentAdjustments)
    .sort((a, b) => String(b[1].adjustedAt || "").localeCompare(String(a[1].adjustedAt || "")))
    .slice(0, 300);
  Object.keys(maddenRecentAdjustments).forEach((entryKey) => delete maddenRecentAdjustments[entryKey]);
  entries.forEach(([entryKey, value]) => {
    maddenRecentAdjustments[entryKey] = value;
  });
  storage.set("nflz-madden-recent-adjustments", maddenRecentAdjustments);
}

function applyMaddenRating(key, rating, meta = {}) {
  const player = findPlayer(key);
  if (!player) return false;
  const safeRating = Math.max(68, Math.min(110, num(rating, player.rating)));
  if (safeRating === num(player.rating)) {
    delete state.maddenPending[key];
    delete state.maddenSetTo[key];
    return false;
  }
  markMaddenRecentAdjustment(key, player, safeRating, meta);
  persistPlayer(player, { rating: safeRating, newRating: safeRating });
  delete state.maddenPending[key];
  delete state.maddenSetTo[key];
  return true;
}

function pffSnapStyle(percentile) {
  const pct = Math.max(0, Math.min(100, num(percentile, 0)));
  const red = [248, 207, 207];
  const yellow = [255, 244, 194];
  const green = [207, 242, 214];
  const from = pct <= 50 ? red : yellow;
  const to = pct <= 50 ? yellow : green;
  const ratio = pct <= 50 ? pct / 50 : (pct - 50) / 50;
  return `style="background:rgb(${mix(from[0], to[0], ratio)}, ${mix(from[1], to[1], ratio)}, ${mix(from[2], to[2], ratio)}); color:#102033;"`;
}

function renderMadden() {
  const all = buildMaddenMatches();
  const matched = all.filter((row) => row.match && !row.review);
  const review = all.filter((row) => row.review && row.match);
  const unmatched = all.filter((row) => !row.match);
  const adjusted = all.filter((row) => row.key && maddenRecentAdjustments[row.key]);
  const viewRows = state.maddenView === "all" ? all : state.maddenView === "review" ? review : state.maddenView === "unmatched" ? unmatched : state.maddenView === "adjusted" ? adjusted : matched;
  const filteredRows = sortMaddenRows(viewRows).filter((row) => matches({ ...row.madden, matched: row.match?.player || "" }));
  const rows = filteredRows.slice(0, state.maddenLimit);
  const headers = [
    maddenSortHeader("player", "Madden Player"),
    maddenSortHeader("pos", "Pos"),
    maddenSortHeader("team", "Madden Team"),
    maddenSortHeader("madden", "Madden", "num"),
    maddenSortHeader("mine", "Mine", "num"),
    maddenSortHeader("diff", "Diff", "num"),
    maddenSortHeader("pff", "PFF", "num"),
    maddenSortHeader("pffSnaps", "PFF Snaps", "num"),
    maddenSortHeader("suggested", "Suggested", "num"),
    maddenSortHeader("pending", "Pending", "num"),
    "<th>Matched To</th>",
    "<th>Adjust</th>",
  ].join("");
  const body = rows.map((row) => {
    const pff = maddenRowPff(row);
    const key = esc(row.key);
    const diff = num(row.diff);
    const targetRating = row.match ? Math.max(50, Math.min(110, state.maddenSetTo[row.key] ?? (num(row.match.rating) + num(row.pending)))) : "";
    return `<tr>
      <td>${renderMaddenPlayer(row)}</td>
      <td><span class="pos-chip">${esc(maddenPosition(row.madden.pos))}</span></td>
      <td>${esc(row.madden.team)}</td>
      <td class="num">${ratingBadge(row.madden.ovr)}</td>
      <td class="num">${row.match ? ratingBadge(row.match.rating) : "-"}</td>
      <td class="num delta ${diff >= 0 ? "plus" : "minus"}">${row.match ? `${diff > 0 ? "+" : ""}${fmt(diff, 0)}` : "-"}</td>
      <td class="num">${renderMaddenPffCell(pff)}</td>
      <td class="num">${pff && Number.isFinite(Number(pff.snapPercentile)) ? `<span class="madden-snap-pct" ${pffSnapStyle(pff.snapPercentile)} title="${esc(`${fmt(pff.snaps, 0)} snaps, ${pffTrustLabel(pff)} for this PFF position.`)}">${fmt(pff.snapPercentile, 0)}%<small>${fmt(pff.snaps, 0)}</small></span>` : "-"}</td>
      <td class="num">${renderMaddenSuggestion(row, pff)}</td>
      <td class="num">${row.match ? `${row.pending > 0 ? "+" : ""}${fmt(row.pending, 0)}` : "-"}</td>
      <td>${renderMaddenMatchCell(row)}</td>
      <td>${row.match ? `<span class="madden-adjust"><button data-madden-nudge="-1" data-player-key="${key}">-1</button><button data-madden-nudge="1" data-player-key="${key}">+1</button><label>Set to <input class="madden-manual-rating" data-madden-target="${key}" type="number" min="68" max="110" value="${fmt(targetRating, 0)}" /></label><button class="primary" data-madden-apply="${key}">Apply</button></span>` : ""}</td>
    </tr>`;
  }).join("");
  setTimeout(() => {
    document.querySelectorAll("[data-madden-view]").forEach((button) => button.addEventListener("click", () => { state.maddenView = button.dataset.maddenView; state.maddenLimit = 500; render(); }));
    document.querySelectorAll("[data-madden-sort]").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.maddenSort;
      state.maddenSort = { key, direction: state.maddenSort.key === key && state.maddenSort.direction === "desc" ? "asc" : "desc" };
      render();
    }));
    document.querySelectorAll("[data-madden-nudge]").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.playerKey;
      state.maddenPending[key] = num(state.maddenPending[key], 0) + num(button.dataset.maddenNudge);
      delete state.maddenSetTo[key];
      render();
    }));
    document.querySelectorAll("[data-madden-suggest]").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.maddenSuggest;
      const player = findPlayer(key);
      if (!player) return;
      const suggested = Math.max(68, Math.min(110, num(button.dataset.maddenSuggestValue, player.rating)));
      const row = all.find((entry) => entry.key === key);
      applyMaddenRating(key, suggested, { maddenPlayer: row?.madden?.player, maddenOvr: row?.madden?.ovr });
      render();
    }));
    document.querySelectorAll("[data-madden-target]").forEach((input) => input.addEventListener("input", () => {
      const key = input.dataset.maddenTarget;
      const player = findPlayer(key);
      if (!player) return;
      const rating = Math.max(68, Math.min(110, num(input.value, player.rating)));
      if (rating === num(player.rating)) {
        delete state.maddenSetTo[key];
        delete state.maddenPending[key];
      } else {
        state.maddenSetTo[key] = rating;
        state.maddenPending[key] = rating - num(player.rating);
      }
      const pendingCell = input.closest("tr")?.children?.[8];
      if (pendingCell) pendingCell.textContent = `${state.maddenPending[key] > 0 ? "+" : ""}${fmt(state.maddenPending[key], 0)}`;
    }));
    document.querySelectorAll("[data-madden-match]").forEach((select) => select.addEventListener("change", () => {
      maddenMatchOverrides[select.dataset.maddenMatch] = select.value;
      storage.set("nflz-madden-match-overrides", maddenMatchOverrides);
      render();
    }));
    document.querySelectorAll("[data-madden-apply]").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.maddenApply;
      const player = findPlayer(key);
      if (!player) return;
      const target = [...document.querySelectorAll("[data-madden-target]")].find((input) => input.dataset.maddenTarget === key)?.value;
      const delta = num(state.maddenPending[key], 0);
      const rating = target !== "" && target != null ? Math.max(68, Math.min(110, num(target, player.rating))) : Math.max(68, Math.min(110, num(player.rating) + delta));
      const row = all.find((entry) => entry.key === key);
      applyMaddenRating(key, rating, { maddenPlayer: row?.madden?.player, maddenOvr: row?.madden?.ovr });
      render();
    }));
    document.querySelector("#madden-apply-all")?.addEventListener("click", () => {
      Object.entries(state.maddenPending).forEach(([key, delta]) => {
        const player = findPlayer(key);
        if (player && num(delta)) {
          const rating = Math.max(68, Math.min(110, num(player.rating) + num(delta)));
          const row = all.find((entry) => entry.key === key);
          applyMaddenRating(key, rating, { maddenPlayer: row?.madden?.player, maddenOvr: row?.madden?.ovr });
        }
      });
      state.maddenPending = {};
      state.maddenSetTo = {};
      render();
    });
    document.querySelector("#madden-set-adjusted")?.addEventListener("click", () => {
      Object.entries(state.maddenSetTo).forEach(([key, rating]) => {
        const row = all.find((entry) => entry.key === key);
        applyMaddenRating(key, rating, { maddenPlayer: row?.madden?.player, maddenOvr: row?.madden?.ovr });
      });
      render();
    });
    document.querySelector("#madden-approve-suggested")?.addEventListener("click", () => {
      rows.forEach((row) => {
        if (!row.match || !row.key) return;
        const suggested = maddenSuggestedRating(row);
        if (suggested == null || suggested === num(row.match.rating)) return;
        applyMaddenRating(row.key, suggested, { maddenPlayer: row.madden?.player, maddenOvr: row.madden?.ovr });
      });
      render();
    });
    document.querySelector("#madden-clear-recent")?.addEventListener("click", () => {
      Object.keys(maddenRecentAdjustments).forEach((key) => delete maddenRecentAdjustments[key]);
      storage.set("nflz-madden-recent-adjustments", maddenRecentAdjustments);
      if (state.maddenView === "adjusted") state.maddenView = "matched";
      render();
    });
    document.querySelector("#madden-show-more")?.addEventListener("click", () => {
      state.maddenLimit += 500;
      render();
    });
    document.querySelector("#madden-show-all")?.addEventListener("click", () => {
      state.maddenLimit = filteredRows.length;
      render();
    });
    wirePlayerActions();
  });
  const pendingCount = Object.values(state.maddenPending).filter((value) => num(value) !== 0).length;
  const setToCount = Object.keys(state.maddenSetTo).filter((key) => findPlayer(key) && num(state.maddenSetTo[key]) !== num(findPlayer(key)?.rating)).length;
  const recentCount = Object.keys(maddenRecentAdjustments).length;
  const suggestedCount = rows.filter((row) => row.match && row.key && maddenSuggestedRating(row) !== num(row.match.rating)).length;
  return `<section class="panel madden-panel">
    <div class="toolbar madden-toolbar">
      <div><h2>Madden Rating Comparison</h2><p>${maddenRows.length} EA Madden 27 non-specialist rows loaded. ${matched.length} exact matches, ${review.length} review matches, ${unmatched.length} need review/add.</p></div>
      <div class="filters">
        <button id="madden-set-adjusted" class="mini-action primary">Set Adjusted${setToCount ? ` ${setToCount}` : ""}</button>
        ${suggestedCount ? `<button id="madden-approve-suggested" class="mini-action primary">Approve All Suggested (${suggestedCount})</button>` : ""}
        ${pendingCount ? `<button id="madden-apply-all" class="mini-action">Apply ${pendingCount} Pending</button>` : ""}
        ${recentCount ? `<button id="madden-clear-recent" class="mini-action">Clear Recent (${recentCount})</button>` : ""}
        <a class="mini-action" href="https://www.ea.com/games/madden-nfl/ratings" target="_blank" rel="noreferrer">EA Ratings</a>
      </div>
    </div>
    <div class="live-tabs madden-tabs">
      ${[["matched", `Matched ${matched.length}`], ["all", `All ${all.length}`], ["review", `Review ${review.length}`], ["unmatched", `Needs Add ${unmatched.length}`], ["adjusted", `Recently Adjusted ${adjusted.length}`]].map(([id, label]) => `<button class="${state.maddenView === id ? "active" : ""}" data-madden-view="${id}">${esc(label)}</button>`).join("")}
    </div>
    <div class="madden-list-control">
      <span>Showing ${rows.length} of ${filteredRows.length}</span>
      ${rows.length < filteredRows.length ? `<button id="madden-show-more" class="mini-action">Show 500 More</button><button id="madden-show-all" class="mini-action">Show All</button>` : ""}
    </div>
    <div class="table-scroll madden-scroll"><table class="madden-table"><thead><tr>${headers}</tr></thead><tbody>${body || "<tr><td colspan='12'>No Madden rows in this view.</td></tr>"}</tbody></table></div>
    ${renderPlayerModal()}
  </section>`;
}

function renderTop30() {
  const positionOrder = [...new Map(state.players.sort((a, b) => num(a.positionNumber, 99) - num(b.positionNumber, 99)).map((p) => [groupPosition(p.position), p.positionNumber])).keys()];
  const positions = ["All Positions", ...positionOrder];
  const limits = [10, 20, 30, 50, 100, 150, 250, 500, 1000];
  const shownPositions = state.topPosition === "All Positions" ? positionOrder.slice(0, 8) : [state.topPosition];
  setTimeout(() => {
    wireSelect("top-position", "topPosition");
    document.querySelector("#top-limit")?.addEventListener("change", (event) => {
      state.topLimit = Number(event.target.value);
      render();
    });
    wirePlayerActions();
  });
  const cards = shownPositions.map((position) => {
    const ranked = buildRankedPlayers(position, Number(state.topLimit)).filter(matches);
    return `<section class="position-card"><div class="position-card-head"><h3>${esc(position)}</h3><span>${ranked.length}</span></div>
      ${table([{ label: "#" }, { label: "Player" }, { label: "Tm" }, { label: "Rt", cls: "num" }], ranked.map((p) => `
        <tr class="${String(p.player).includes("(R)") ? "rookie" : ""}">
          <td><span class="rank mini-rank">${p.rank}</span></td>
          <td>${playerNameButton(p)}</td>
          <td>${teamCell(p)}</td>
          <td class="num">${ratingBadge(p.rating)}</td>
        </tr>`))}
    </section>`;
  }).join("");
  return `
    <section class="panel list-panel">
      <div class="toolbar"><h2>Top 30s by Position</h2><div class="filters">${select("top-position", state.topPosition, positions)}${select("top-limit", state.topLimit, limits)}</div></div>
      <div class="position-card-grid">${cards}</div>
    </section>${renderPlayerModal()}
  `;
}

function scheduleTeamLine(teamName, score, side, winner = false) {
  const team = teamByName(teamName) || { team: teamName, teamAbbrev: teamName };
  const abbrev = team.teamAbbrev || state.data?.meta?.teamAbbrevs?.[teamName] || teamName;
  return `<div class="schedule-team ${side} ${winner ? "projected-winner" : "projected-loser"}">
    <span class="schedule-team-main">${teamLogo(team.team, abbrev)}<span><b>${esc(abbrev)}</b><em>${esc(teamName)}</em></span></span>
    <span class="schedule-score">${fmt(score, 0)}</span>
  </div>`;
}

function scheduleGameCard(game, gameKey) {
  const projection = scheduleProjection(game);
  const winProfile = projectionWinProfile(game, projection);
  const winAbbrev = projection.favorite ? teamByName(projection.favorite)?.teamAbbrev || projection.favorite : "PK";
  const oddsText = projection.favorite ? `${fmt(winProfile.favoriteChance * 100, 1)}% ${winAbbrev} Win` : "50.0% Pick'em";
  const averages = scheduleMetricAverages();
  const hfa = scheduleHomeAdvantage(game, projection.mode);
  const visitorWins = projection.visitor > projection.home;
  const homeWins = projection.home > projection.visitor;
  const modeLabel = projection.mode === "preseason" ? "Preseason" : "Regular";
  return `<article class="schedule-card" data-schedule-key="${esc(gameKey)}" tabindex="0" role="button" aria-label="Open ${esc(game.visitor)} at ${esc(game.home)} breakdown">
    <div class="schedule-card-top">
      <span class="schedule-week-chip">${esc(weekDisplay(game.week || ""))}</span>
      <span>${esc(game.day || "")} ${esc(excelDate(game.date))} ${esc(excelTime(game.time))} / ${esc(modeLabel)}</span>
    </div>
    <div class="schedule-matchup">
      ${scheduleTeamLine(game.visitor, projection.visitor, "visitor", visitorWins)}
      <div class="schedule-at">at</div>
      ${scheduleTeamLine(game.home, projection.home, "home", homeWins)}
    </div>
    <div class="schedule-bubbles">
      ${scheduleBubble("My Spread", spreadLabel(game), "", relativeMetricStyle(projection.spread, averages.spread, 8))}
      ${scheduleBubble("Odds", oddsText, "", relativeMetricStyle(winProfile.favoriteChance * 100, 55, 22))}
      ${scheduleBubble("Total", fmt(projection.total, 1), "", relativeMetricStyle(projection.total, averages.total, 16))}
      ${scheduleBubble("HFA", `+${fmt(hfa, 1)}`, "", relativeMetricStyle(hfa, projection.mode === "preseason" ? 0.8 : 1.5, 3))}
    </div>
    ${scheduleMarketCards(game, projection)}
    ${schedulePickPanel(game, gameKey, projection)}
  </article>`;
}

function scheduleScorePill(teamName, score) {
  const team = teamByName(teamName) || { team: teamName, teamAbbrev: teamName };
  const abbrev = team.teamAbbrev || state.data?.meta?.teamAbbrevs?.[teamName] || teamName;
  return `<span>${teamLogo(team.team, abbrev)}<strong>${esc(abbrev)}</strong><b>${fmt(score, 0)}</b></span>`;
}

function scheduleBreakdown() {
  if (!state.selectedScheduleKey) return "";
  const indexed = scheduleGames().map((game, index) => ({ game, key: scheduleGameKey(game, index) }));
  const item = indexed.find((row) => row.key === state.selectedScheduleKey);
  if (!item) return "";
  const game = item.game;
  const projection = scheduleProjection(game);
  const winProfile = projectionWinProfile(game, projection);
  const visitor = teamByName(game.visitor);
  const home = teamByName(game.home);
  const mode = scheduleActiveMode(game);
  const hfa = scheduleHomeAdvantage(game, mode);
  const visitorOverall = scheduleComposite(visitor, mode);
  const homeOverall = scheduleComposite(home, mode);
  const visitorOffense = scheduleSideComposite(visitor, "offense", mode);
  const homeOffense = scheduleSideComposite(home, "offense", mode);
  const visitorDefense = scheduleSideComposite(visitor, "defense", mode);
  const homeDefense = scheduleSideComposite(home, "defense", mode);
  const visitorAbbrev = visitor?.teamAbbrev || state.data?.meta?.teamAbbrevs?.[game.visitor] || "Away";
  const homeAbbrev = home?.teamAbbrev || state.data?.meta?.teamAbbrevs?.[game.home] || "Home";
  const positionLabels = ["QB", "RB", "WR", "TE", "OL", "IDL", "EDGE", "LB", "CB", "S"];
  const compareRows = positionLabels.map((label) => {
    const visitorScore = visitor ? schedulePositionScore(visitor, label, mode) : "";
    const homeScore = home ? schedulePositionScore(home, label, mode) : "";
    const edge = num(homeScore) - num(visitorScore);
    return `<tr>
      <td>${esc(label.replace("\n", " "))}</td>
      <td class="num cf" ${cfStyle(visitorScore, 68, 102)}>${fmt(visitorScore, 1)}</td>
      <td class="num cf" ${cfStyle(homeScore, 68, 102)}>${fmt(homeScore, 1)}</td>
      <td class="num ${edge >= 0 ? "plus" : "minus"}">${edge > 0 ? "+" : ""}${fmt(edge, 1)}</td>
    </tr>`;
  });
  return `<div class="schedule-detail-backdrop">
    <section class="schedule-detail">
      <button class="modal-close schedule-detail-close" title="Close">x</button>
      <div class="schedule-detail-head">
        <div>
          <p class="eyebrow">Game Breakdown</p>
          <h2>${esc(game.visitor)} at ${esc(game.home)}</h2>
          <span>${esc(game.day || "")} ${esc(excelDate(game.date))} ${esc(excelTime(game.time))} / ${esc(mode === "preseason" ? "Preseason Mode" : "Regular Mode")}</span>
        </div>
        <div class="projected-score">
          ${scheduleScorePill(game.visitor, projection.visitor)}
          <em>at</em>
          ${scheduleScorePill(game.home, projection.home)}
        </div>
      </div>
      <div class="schedule-detail-metrics">
        ${metric("My Spread", spreadLabel(game), game.favorite || "Pick'em")}
        ${metric("Total", fmt(projection.total, 1), "Projected points")}
        ${metric("Win Odds", `${fmt(winProfile.favoriteChance * 100, 1)}%`, winProfile.favorite ? `${teamByName(winProfile.favorite)?.teamAbbrev || winProfile.favorite} win` : "Pick'em")}
        ${metric("Model ML", winProfile.favorite === game.visitor ? `${visitorAbbrev} ${winProfile.visitorMl}` : winProfile.favorite === game.home ? `${homeAbbrev} ${winProfile.homeMl}` : "PK", `${visitorAbbrev} ${winProfile.visitorMl} / ${homeAbbrev} ${winProfile.homeMl}`)}
        ${metric("HFA", `+${fmt(hfa, 1)}`, "Home adjustment")}
      </div>
      ${draftKingsBreakdown(game, projection)}
      <div class="schedule-detail-grid">
        <section>
          <h3>Team Ratings</h3>
          ${table([{ label: "" }, { label: "Visitor", cls: "num" }, { label: "Home", cls: "num" }], [
            `<tr><td>Overall</td><td class="num cf" ${cfStyle(visitorOverall, 68, 102)}>${fmt(visitorOverall, 1)}</td><td class="num cf" ${cfStyle(homeOverall, 68, 102)}>${fmt(homeOverall, 1)}</td></tr>`,
            `<tr><td>Offense</td><td class="num cf" ${cfStyle(visitorOffense, 68, 102)}>${fmt(visitorOffense, 1)}</td><td class="num cf" ${cfStyle(homeOffense, 68, 102)}>${fmt(homeOffense, 1)}</td></tr>`,
            `<tr><td>Defense</td><td class="num cf" ${cfStyle(visitorDefense, 68, 102)}>${fmt(visitorDefense, 1)}</td><td class="num cf" ${cfStyle(homeDefense, 68, 102)}>${fmt(homeDefense, 1)}</td></tr>`,
          ])}
        </section>
        <section>
          <h3>Position Comparison</h3>
          <div class="table-scroll mini-scroll">${table([{ label: "Group" }, { label: visitorAbbrev, cls: "num" }, { label: homeAbbrev, cls: "num" }, { label: "Home Edge", cls: "num" }], compareRows)}</div>
        </section>
      </div>
      ${scheduleStarterComparison(game)}
    </section>
  </div>`;
}

function renderSchedule() {
  const weeks = scheduleWeekOptions(true);
  const teams = ["All Teams", ...unique(scheduleGames().flatMap((g) => [g.visitor, g.home]))];
  if (state.scheduleView === "week" && state.scheduleWeek === "All Weeks") state.scheduleWeek = selectedSiteWeek() || "All Weeks";
  let games = scheduleGames().filter(matches);
  if (state.scheduleView === "week" && state.scheduleWeek !== "All Weeks") games = games.filter((g) => scheduleWeekMatches(g, state.scheduleWeek));
  if (state.scheduleTeam !== "All Teams") games = games.filter((g) => normalizeTeamName(g.visitor) === normalizeTeamName(state.scheduleTeam) || normalizeTeamName(g.home) === normalizeTeamName(state.scheduleTeam));
  const cardsByWeek = games.reduce((groups, game) => {
    const key = game.week ? scheduleWeekGroupKey(game.week) : "Unscheduled";
    groups[key] = groups[key] || [];
    groups[key].push(game);
    return groups;
  }, {});
  const weekGroups = Object.entries(cardsByWeek).sort(([a], [b]) => weekSortValue(a) - weekSortValue(b));
  setTimeout(() => {
    wireSelect("schedule-view", "scheduleView");
    wireScheduleControls();
    document.querySelector("#scan-draftkings-odds")?.addEventListener("click", scanDraftKingsOdds);
    document.querySelector("#scan-espn-scores")?.addEventListener("click", scanEspnScores);
    document.querySelector("#schedule-week")?.addEventListener("change", (event) => {
      state.scheduleWeek = event.target.value;
      if (event.target.value !== "All Weeks") {
        state.siteWeek = event.target.value;
        storage.set("nflz-site-week", state.siteWeek);
      }
      render();
    });
    wireSelect("schedule-team", "scheduleTeam");
    document.querySelectorAll(".game-pick-select").forEach((sel) => sel.addEventListener("change", () => {
      saveGameAction(sel.dataset.game, { [sel.dataset.field]: sel.value });
      render();
    }));
    document.querySelectorAll(".game-score-input").forEach((input) => input.addEventListener("change", () => {
      const patch = { [input.dataset.field]: input.value };
      const action = { ...gameAction(input.dataset.game), ...patch };
      if (Number.isFinite(Number(action.awayScore)) && Number.isFinite(Number(action.homeScore)) && action.awayScore !== "" && action.homeScore !== "") {
        const item = scheduleGames().map((game, index) => ({ game, key: scheduleGameKey(game, game.calendarIndex ?? index) })).find((row) => row.key === input.dataset.game);
        if (item) patch.resultWinner = num(action.awayScore) > num(action.homeScore) ? item.game.visitor : num(action.homeScore) > num(action.awayScore) ? item.game.home : "";
      }
      saveGameAction(input.dataset.game, patch);
      render();
    }));
    document.querySelector(".schedule-groups")?.addEventListener("click", (event) => {
      if (event.target.closest("select, input, button, label")) return;
      const card = event.target.closest(".schedule-card");
      if (!card) return;
      state.selectedScheduleKey = card.dataset.scheduleKey;
      render();
    });
    document.querySelectorAll(".schedule-card").forEach((card) => card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      state.selectedScheduleKey = card.dataset.scheduleKey;
      render();
    }));
    document.querySelector(".schedule-detail-close")?.addEventListener("click", () => { state.selectedScheduleKey = ""; render(); });
    document.querySelector(".schedule-detail-backdrop")?.addEventListener("click", (event) => {
      if (event.target.classList.contains("schedule-detail-backdrop")) {
        state.selectedScheduleKey = "";
        render();
      }
    });
  });
  return `
    <section class="panel schedule-panel">
      <div class="toolbar schedule-toolbar">
        <div><h2>Sim Schedule</h2><p>${games.length} games shown. Cards wrap to the page width; each game still keeps rating, favorite, odds, HFA, and pick controls.</p></div>
        <div class="filters">
          ${optionSelect("schedule-view", state.scheduleView, [["season", "Season"], ["week", "Week"], ["team", "Team"]])}
          ${optionSelect("schedule-week", state.scheduleWeek, weeks)}
          ${select("schedule-team", state.scheduleTeam, teams)}
          ${optionSelect("schedule-sim-mode", state.scheduleSimMode, [["auto", `Auto (${scheduleActiveMode({ week: selectedSiteWeek(), preseason: String(selectedSiteWeek()).startsWith("Pre") })})`], ["preseason", "Preseason Mode"], ["regular", "Regular Mode"]])}
          <button id="scan-draftkings-odds" class="mini-action primary" ${state.draftKingsScanStatus === "checking" ? "disabled" : ""}>Scan DraftKings Odds</button>
          <button id="scan-espn-scores" class="mini-action" ${state.scoreScanStatus === "checking" ? "disabled" : ""}>Scan ESPN Scores</button>
          <button id="schedule-controls-toggle" class="mini-action">${state.scheduleControlsOpen ? "Hide Sliders" : "Show Sliders"}</button>
          <button id="schedule-reset-controls" class="mini-action">Reset Sliders</button>
        </div>
      </div>
      ${draftKingsStatusNote()}
      ${scoreScanStatusNote()}
      ${renderScheduleControls()}
      <div class="schedule-groups">
        ${weekGroups.map(([week, weekGames]) => `<section class="schedule-week-group">
          <div class="schedule-week-head"><h3>${esc(week === "Unscheduled" ? week : weekDisplay(week))}</h3><span>${weekGames.length} games</span></div>
          <div class="schedule-card-grid">${weekGames.map((game) => scheduleGameCard(game, scheduleGameKey(game, game.calendarIndex ?? state.data.schedule.indexOf(game)))).join("")}</div>
        </section>`).join("") || "<p class='note'>No games match the current filters.</p>"}
      </div>
      ${scheduleBreakdown()}
    </section>
  `;
}

function divisionMap() {
  const map = {};
  let current = "";
  (state.data.standings?.divisions || []).forEach((row) => {
    const name = String(row.team || "").trim();
    if (!name) return;
    if (!Number.isFinite(Number(row.wins))) {
      current = name;
      return;
    }
    map[name] = { division: current, conference: current.startsWith("NFC") ? "NFC" : "AFC" };
  });
  return map;
}

function projectionWinProbability(game) {
  const key = scheduleGameKey(game, game.calendarIndex ?? state.data.schedule.indexOf(game));
  const action = gameAction(key);
  if (Number.isFinite(Number(action.awayScore)) && Number.isFinite(Number(action.homeScore)) && action.awayScore !== "" && action.homeScore !== "") {
    if (num(action.awayScore) > num(action.homeScore)) return { visitor: 1, home: 0, favorite: game.visitor };
    if (num(action.homeScore) > num(action.awayScore)) return { visitor: 0, home: 1, favorite: game.home };
    return { visitor: 0.5, home: 0.5, favorite: "" };
  }
  const projection = scheduleProjection(game);
  const profile = projectionWinProfile(game, projection);
  return { visitor: profile.visitorChance, home: profile.homeChance, favorite: projection.favorite };
}

function simStandingRows() {
  const divisions = divisionMap();
  const rows = Object.fromEntries((state.data.teams || []).map((team) => [team.team, {
    team: team.team,
    wins: 0,
    losses: 0,
    favored: 0,
    games: 0,
    sosTotal: 0,
    division: divisions[team.team]?.division || "",
    conference: divisions[team.team]?.conference || "",
  }]));
  scheduleGames().filter((game) => !game.preseason).forEach((game) => {
    const visitor = rows[game.visitor];
    const home = rows[game.home];
    if (!visitor || !home) return;
    const probs = projectionWinProbability(game);
    visitor.wins += probs.visitor;
    home.wins += probs.home;
    visitor.losses += 1 - probs.visitor;
    home.losses += 1 - probs.home;
    visitor.games += 1;
    home.games += 1;
    if (probs.favorite === game.visitor) visitor.favored += 1;
    if (probs.favorite === game.home) home.favored += 1;
    visitor.sosTotal += num(scheduleComposite(teamByName(game.home), "regular"), 84);
    home.sosTotal += num(scheduleComposite(teamByName(game.visitor), "regular"), 84);
  });
  const finalRows = Object.values(rows).map((row) => ({ ...row, losses: 17 - row.wins, sos: row.games ? row.sosTotal / row.games : 0 }));
  finalRows.forEach((row) => {
    row.sosRank = rankNumber(finalRows, (item) => item.sos, row, false);
  });
  return finalRows.sort(standingSort);
}

function standingSort(a, b) {
  return b.wins - a.wins || b.favored - a.favored || b.sos - a.sos || a.team.localeCompare(b.team);
}

function standingMiniTable(rows, showSeed = false) {
  const winValues = rows.map((row) => row.wins);
  const lossValues = rows.map((row) => row.losses);
  const favValues = rows.map((row) => row.favored);
  const sosRanks = rows.map((row) => row.sosRank);
  return table([
    ...(showSeed ? [{ label: "#", cls: "num" }] : []),
    { label: "Team" },
    { label: "W", cls: "num" },
    { label: "L", cls: "num" },
    { label: "Fav", cls: "num" },
    { label: "SOS Rk", cls: "num", title: "Strength of schedule rank. 1 is easiest." },
  ], rows.map((row, index) => `<tr>
    ${showSeed ? `<td class="num"><span class="rank mini-rank">${index + 1}</span></td>` : ""}
    <td>${teamCellByName(row.team)}</td>
    <td class="num standings-num strong cf" ${cfStyle(row.wins, Math.min(...winValues), Math.max(...winValues))}>${fmt(row.wins, 2)}</td>
    <td class="num standings-num cf" ${cfStyle(row.losses, Math.min(...lossValues), Math.max(...lossValues), true)}>${fmt(row.losses, 2)}</td>
    <td class="num cf" ${cfStyle(row.favored, Math.min(...favValues), Math.max(...favValues))}>${fmt(row.favored, 0)}</td>
    <td class="num standings-num muted cf" title="Strength of schedule rank. 1 is easiest." ${cfStyle(row.sosRank, Math.min(...sosRanks), Math.max(...sosRanks), true)}>${fmt(row.sosRank, 0)}</td>
  </tr>`));
}

function playoffSeeds(rows, conference) {
  const conf = rows.filter((row) => row.conference === conference);
  const divisions = unique(conf.map((row) => row.division));
  const winners = divisions.map((division) => conf.filter((row) => row.division === division).sort(standingSort)[0]).filter(Boolean)
    .sort(standingSort);
  const wildcards = conf.filter((row) => !winners.includes(row)).sort(standingSort).slice(0, 3);
  return [...winners, ...wildcards].slice(0, 7);
}

function bracketTeamCard(seed, row, bye = false) {
  return `<div class="sim-bracket-team">${teamLogo(row.team, teamByName(row.team)?.teamAbbrev)}<span><b>${seed} ${esc(teamByName(row.team)?.teamAbbrev || row.team)}</b><em>${bye ? "BYE" : `${fmt(row.wins, 1)} wins`}</em></span></div>`;
}

function playoffGame(seedA, seedB, neutral = false) {
  if (!seedA || !seedB) return null;
  const home = neutral ? seedA : seedA.seed < seedB.seed ? seedA : seedB;
  const away = neutral ? seedB : seedA.seed < seedB.seed ? seedB : seedA;
  const game = { week: "Playoff", visitor: away.team, home: home.team, date: "", homeAdvantage: neutral ? 0 : num(state.homeFieldAdvantages?.[home.team], defaultHomeFieldAdvantages[home.team] ?? 1.5) };
  const projection = scheduleProjection(game);
  const winner = projection.visitor > projection.home ? away : home;
  return { home, away, projection, winner };
}

function playoffGameCard(game, label = "") {
  if (!game) return `<div class="sim-game-card empty">TBD</div>`;
  const awayAbbrev = teamByName(game.away.team)?.teamAbbrev || game.away.team;
  const homeAbbrev = teamByName(game.home.team)?.teamAbbrev || game.home.team;
  const awayWins = game.winner.team === game.away.team;
  const homeWins = game.winner.team === game.home.team;
  return `<div class="sim-game-card">
    <span>${esc(label || "Projected")}</span>
    <div class="${awayWins ? "winner" : ""}">${teamLogo(game.away.team, awayAbbrev)}<b>${game.away.seed} ${esc(awayAbbrev)}</b><strong>${fmt(game.projection.visitor, 0)}</strong></div>
    <div class="${homeWins ? "winner" : ""}">${teamLogo(game.home.team, homeAbbrev)}<b>${game.home.seed} ${esc(homeAbbrev)}</b><strong>${fmt(game.projection.home, 0)}</strong></div>
  </div>`;
}

function conferenceBracket(seeds) {
  const seeded = seeds.map((row, index) => ({ ...row, seed: index + 1 }));
  const wc = [[seeded[1], seeded[6]], [seeded[2], seeded[5]], [seeded[3], seeded[4]]].map(([a, b]) => playoffGame(a, b));
  const wcWinners = wc.map((game) => game?.winner).filter(Boolean);
  const oneSeed = seeded[0];
  const lowestRemaining = [...wcWinners].sort((a, b) => b.seed - a.seed)[0];
  const otherWinners = wcWinners.filter((team) => team !== lowestRemaining).sort((a, b) => a.seed - b.seed);
  const divisional = [playoffGame(oneSeed, lowestRemaining), playoffGame(otherWinners[0], otherWinners[1])];
  const championship = playoffGame(divisional[0]?.winner, divisional[1]?.winner);
  return { seeded, wc, divisional, championship, champion: championship?.winner };
}

function simBracket(rows) {
  const afc = playoffSeeds(rows, "AFC");
  const nfc = playoffSeeds(rows, "NFC");
  const afcBracket = conferenceBracket(afc);
  const nfcBracket = conferenceBracket(nfc);
  const superBowl = playoffGame(afcBracket.champion, nfcBracket.champion, true);
  const champion = superBowl?.winner;
  return `<section class="standings-bracket-card">
    <div class="standings-bracket-head"><h3>NFL Playoff Bracket 2026</h3><span>Projected</span></div>
    <div class="sim-bracket full">
      <div class="sim-conf"><h4>AFC Seeds</h4>${afcBracket.seeded.map((row) => bracketTeamCard(row.seed, row, row.seed === 1)).join("")}</div>
      <div class="sim-round"><h4>AFC Wild Card</h4>${afcBracket.wc.map((game) => playoffGameCard(game, "Final")).join("")}</div>
      <div class="sim-round"><h4>AFC Divisional</h4>${afcBracket.divisional.map((game) => playoffGameCard(game, "Final")).join("")}</div>
      <div class="sim-round"><h4>Conference</h4>${playoffGameCard(afcBracket.championship, "AFC Final")}${playoffGameCard(nfcBracket.championship, "NFC Final")}</div>
      <div class="sim-bracket-center"><span>Super Bowl</span><strong>${champion ? esc(teamByName(champion.team)?.teamAbbrev || champion.team) : "TBD"}</strong>${champion ? teamLogo(champion.team, teamByName(champion.team)?.teamAbbrev) : ""}${playoffGameCard(superBowl, "Neutral")}</div>
      <div class="sim-round"><h4>NFC Divisional</h4>${nfcBracket.divisional.map((game) => playoffGameCard(game, "Final")).join("")}</div>
      <div class="sim-round"><h4>NFC Wild Card</h4>${nfcBracket.wc.map((game) => playoffGameCard(game, "Final")).join("")}</div>
      <div class="sim-conf"><h4>NFC Seeds</h4>${nfcBracket.seeded.map((row) => bracketTeamCard(row.seed, row, row.seed === 1)).join("")}</div>
    </div>
  </section>`;
}

function renderStandings() {
  const rows = simStandingRows().filter(matches);
  const divisions = unique(rows.map((row) => row.division)).sort();
  const afcDivisions = divisions.filter((division) => division.startsWith("AFC"));
  const nfcDivisions = divisions.filter((division) => division.startsWith("NFC"));
  const afcSeeds = playoffSeeds(rows, "AFC");
  const nfcSeeds = playoffSeeds(rows, "NFC");
  const divisionBubble = (division) => `<div class="division-bubble"><h4>${esc(division)}</h4>${standingMiniTable(rows.filter((row) => row.division === division).sort(standingSort), false)}</div>`;
  return `<section class="panel standings-panel">
    <div class="toolbar"><div><h2>Sim Standings</h2><p>Expected wins are built from current game win probabilities. Losses are 17 minus expected wins. SOS is average opponent projection strength.</p></div></div>
    <div class="standings-dashboard">
      <section class="standings-card league"><h3>Full League</h3><div class="table-scroll standings-mini-scroll">${standingMiniTable(rows, true)}</div></section>
      <section class="standings-card playoff"><h3>Playoff View</h3>
        <div class="playoff-seed-columns">
          <div><h4>AFC</h4>${standingMiniTable(afcSeeds, true)}</div>
          <div><h4>NFC</h4>${standingMiniTable(nfcSeeds, true)}</div>
        </div>
      </section>
      <section class="standings-card divisions"><h3>Divisions</h3>
        <div class="division-conference-band"><h4>AFC</h4><div class="division-bubble-grid">${afcDivisions.map(divisionBubble).join("")}</div></div>
        <div class="division-conference-band"><h4>NFC</h4><div class="division-bubble-grid">${nfcDivisions.map(divisionBubble).join("")}</div></div>
      </section>
    </div>
    ${simBracket(rows)}
  </section>`;
}

function gameSeasonType(game) {
  if (String(game.week).startsWith("Pre")) return "Preseason";
  if (Number(game.week) >= 19 || String(game.week).toLowerCase().includes("playoff")) return "Post Season";
  return "Regular Season";
}

function pickResultBadge(result) {
  if (!result) return `<span class="pick-grade pending">Pending</span>`;
  return `<span class="pick-grade ${result.toLowerCase()}">${esc(result)}</span>`;
}

function gradeSpreadPick(pick, game, action) {
  if (!pick || action.awayScore === "" || action.homeScore === "") return "";
  const match = pick.match(/^(.+?)\s+([+-])([\d.]+)$/);
  if (!match) return "";
  const teamToken = match[1].trim();
  const sign = match[2];
  const line = num(match[3]);
  const awayAbbrev = teamByName(game.visitor)?.teamAbbrev || game.visitor;
  const homeAbbrev = teamByName(game.home)?.teamAbbrev || game.home;
  const team = teamToken === awayAbbrev || teamToken === game.visitor ? game.visitor : teamToken === homeAbbrev || teamToken === game.home ? game.home : "";
  if (!team) return "";
  const teamScore = team === game.visitor ? num(action.awayScore) : num(action.homeScore);
  const oppScore = team === game.visitor ? num(action.homeScore) : num(action.awayScore);
  const adjusted = teamScore - oppScore + (sign === "+" ? line : -line);
  if (adjusted > 0) return "Win";
  if (adjusted < 0) return "Loss";
  return "Push";
}

function gradeTotalPick(pick, action) {
  if (!pick || action.awayScore === "" || action.homeScore === "") return "";
  const match = pick.match(/^([ou])([\d.]+)/i);
  if (!match) return "";
  const total = num(action.awayScore) + num(action.homeScore);
  const line = num(match[2]);
  if (total === line) return "Push";
  return match[1].toLowerCase() === "o" ? (total > line ? "Win" : "Loss") : (total < line ? "Win" : "Loss");
}

function gradeMlPick(pick, action) {
  if (!pick || !action.resultWinner) return "";
  return pick === action.resultWinner ? "Win" : "Loss";
}

function pickStats(rows, field) {
  const graded = rows.map((row) => row[`${field}Result`]).filter(Boolean);
  const wins = graded.filter((item) => item === "Win").length;
  const losses = graded.filter((item) => item === "Loss").length;
  const pushes = graded.filter((item) => item === "Push").length;
  const decisions = wins + losses;
  return { wins, losses, pushes, pct: decisions ? wins / decisions : 0 };
}

function renderPicksTracker() {
  const rows = scheduleGames().map((game, index) => {
    const key = scheduleGameKey(game, game.calendarIndex ?? index);
    const action = gameAction(key);
    return {
      game,
      key,
      action,
      type: gameSeasonType(game),
      mlResult: gradeMlPick(action.ml, action),
      spreadResult: gradeSpreadPick(action.spread, game, action),
      totalResult: gradeTotalPick(action.total, action),
    };
  }).filter((row) => row.action.ml || row.action.spread || row.action.total || row.action.resultWinner || row.action.awayScore !== "" || row.action.homeScore !== "");
  const groups = ["Preseason", "Regular Season", "Post Season"];
  const allStats = ["ml", "spread", "total"].map((field) => ({ field, ...pickStats(rows, field) }));
  const statCard = (label, stat) => `<div class="pick-stat"><span>${esc(label)}</span><strong>${fmt(stat.pct * 100, 1)}%</strong><em>${stat.wins}-${stat.losses}${stat.pushes ? `-${stat.pushes}` : ""}</em></div>`;
  return `<section class="panel picks-panel">
    <div class="toolbar"><div><h2>Picks Tracker</h2><p>Tracks Model Z picks from Sim Schedule. Picks grade once the result winner and final score are entered or scanned.</p></div></div>
    <div class="pick-stats-row">${statCard("ML", allStats[0])}${statCard("Spread", allStats[1])}${statCard("Total", allStats[2])}</div>
    ${groups.map((group) => {
      const groupRows = rows.filter((row) => row.type === group);
      const groupStats = ["ml", "spread", "total"].map((field) => ({ field, ...pickStats(groupRows, field) }));
      return `<section class="picks-group">
        <div class="picks-group-head"><h3>${esc(group)}</h3><span>${groupRows.length} tracked games</span>${statCard("ML", groupStats[0])}${statCard("Spread", groupStats[1])}${statCard("Total", groupStats[2])}</div>
        <div class="table-scroll picks-scroll">${table([
          { label: "Week" }, { label: "Game" }, { label: "ML" }, { label: "ML Result" }, { label: "Spread" }, { label: "Spread Result" }, { label: "Total" }, { label: "Total Result" }, { label: "Final" },
        ], groupRows.map(({ game, action, mlResult, spreadResult, totalResult }) => `<tr>
          <td>${esc(weekDisplay(game.week))}</td>
          <td>${teamCellByName(game.visitor)} at ${teamCellByName(game.home)}</td>
          <td>${esc(action.ml ? teamByName(action.ml)?.teamAbbrev || action.ml : "-")}</td>
          <td>${pickResultBadge(mlResult)}</td>
          <td>${esc(action.spread || "-")}</td>
          <td>${pickResultBadge(spreadResult)}</td>
          <td>${esc(action.total || "-")}</td>
          <td>${pickResultBadge(totalResult)}</td>
          <td>${action.awayScore !== "" && action.homeScore !== "" ? `${esc(action.awayScore)}-${esc(action.homeScore)}` : "-"}</td>
        </tr>`))}</div>
      </section>`;
    }).join("")}
  </section>`;
}

function fantasyRankBundle(kind) {
  return (window.FANTASY_RANKINGS || {})[kind] || {};
}

async function scanTeamRankings() {
  state.teamRankingsScanStatus = "checking";
  state.teamRankingsScanMessage = "Scanning TeamRankings";
  render();
  try {
    const apiUrl = location.protocol === "file:" ? "http://127.0.0.1:8787/api/team-rankings-scan" : "/api/team-rankings-scan";
    const response = await fetch(apiUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Scan failed with HTTP ${response.status}`);
    window.TEAM_RANKINGS_SCAN = await response.json();
    state.teamRankingsScanStatus = "review";
    state.teamRankingsScanMessage = `Updated ${window.TEAM_RANKINGS_SCAN.teams?.length || 0} teams from TeamRankings.`;
  } catch (error) {
    if (location.protocol === "file:" && window.TEAM_RANKINGS_SCAN?.teams?.length) {
      state.teamRankingsScanStatus = "review";
      state.teamRankingsScanMessage = `Using cached TeamRankings data for ${window.TEAM_RANKINGS_SCAN.teams.length} teams because the local scan server is not running. Open the local server URL or run refresh-team-rankings.bat to refresh live.`;
      render();
      return;
    }
    state.teamRankingsScanStatus = "error";
    state.teamRankingsScanMessage = error.message;
  }
  render();
}

function teamRankingsStatusNote() {
  const scan = window.TEAM_RANKINGS_SCAN;
  const status = state.teamRankingsScanStatus;
  const message = state.teamRankingsScanMessage || (scan?.fetchedAt ? `TeamRankings cached ${new Date(scan.fetchedAt).toLocaleString()} for ${scan.teams?.length || 0} teams.` : "No TeamRankings scan loaded yet.");
  return `<span class="scan-status ${status}">${esc(message)}</span>`;
}

async function scanSnapsStats() {
  state.snapsStatsScanStatus = "checking";
  state.snapsStatsScanMessage = "Scanning Footballguys QB game logs";
  render();
  try {
    const apiUrl = location.protocol === "file:" ? "http://127.0.0.1:8787/api/footballguys-game-logs-scan" : "/api/footballguys-game-logs-scan";
    const response = await fetch(apiUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Scan failed with HTTP ${response.status}`);
    window.FOOTBALLGUYS_GAME_LOGS = await response.json();
    state.snapsStatsScanStatus = "review";
    state.snapsStatsScanMessage = `Updated ${window.FOOTBALLGUYS_GAME_LOGS.players?.length || 0} QB game-log rows from Footballguys.`;
  } catch (error) {
    if (location.protocol === "file:" && window.FOOTBALLGUYS_GAME_LOGS?.players?.length) {
      state.snapsStatsScanStatus = "review";
      state.snapsStatsScanMessage = `Using cached Footballguys game logs for ${window.FOOTBALLGUYS_GAME_LOGS.players.length} QB rows because the local scan server is not running. Open the local server URL or run refresh-footballguys-game-logs.bat to refresh live.`;
      render();
      return;
    }
    state.snapsStatsScanStatus = "error";
    state.snapsStatsScanMessage = error.message;
  }
  render();
}

async function scanWeeklyFantasySources() {
  await Promise.all([scanTeamRankings(), scanSnapsStats()]);
}

function snapsStatsStatusNote() {
  const scan = window.FOOTBALLGUYS_GAME_LOGS;
  const status = state.snapsStatsScanStatus;
  const message = state.snapsStatsScanMessage || (scan?.fetchedAt ? `Footballguys cached ${new Date(scan.fetchedAt).toLocaleString()} for ${scan.players?.length || 0} QB rows.` : "No Footballguys snaps/stats scan loaded yet.");
  return `<span class="scan-status ${status}">${esc(message)}</span>`;
}

async function scanDraftKingsOdds() {
  state.draftKingsScanStatus = "checking";
  state.draftKingsScanMessage = "Scanning ESPN DraftKings odds";
  render();
  try {
    const apiUrl = location.protocol === "file:" ? "http://127.0.0.1:8787/api/draftkings-odds-scan" : "/api/draftkings-odds-scan";
    const response = await fetch(apiUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Scan failed with HTTP ${response.status}`);
    window.DRAFTKINGS_ODDS = await response.json();
    state.draftKingsScanStatus = "review";
    state.draftKingsScanMessage = `Updated ${window.DRAFTKINGS_ODDS.games?.length || 0} DraftKings odds rows from ESPN.`;
  } catch (error) {
    if (window.DRAFTKINGS_ODDS?.games?.length) {
      state.draftKingsScanStatus = "review";
      state.draftKingsScanMessage = `Using cached DraftKings odds for ${window.DRAFTKINGS_ODDS.games.length} games because the local scan server is not running. Open the local server URL or run refresh-draftkings-odds.bat to refresh live.`;
      render();
      return;
    }
    state.draftKingsScanStatus = "error";
    state.draftKingsScanMessage = error.message;
  }
  render();
}

function draftKingsStatusNote() {
  const scan = window.DRAFTKINGS_ODDS;
  const status = state.draftKingsScanStatus;
  const message = state.draftKingsScanMessage || (scan?.fetchedAt ? `DraftKings odds cached ${new Date(scan.fetchedAt).toLocaleString()} for ${scan.games?.length || 0} games.` : "No DraftKings odds scan loaded yet.");
  return `<span class="scan-status ${status}">${esc(message)}</span>`;
}

function applyScannedScores(payload) {
  let applied = 0;
  (payload?.games || []).filter((game) => game.completed && game.winner).forEach((result) => {
    const match = scheduleGames()
      .map((game, index) => ({ game, key: scheduleGameKey(game, game.calendarIndex ?? index) }))
      .find((row) => row.game.visitor === result.visitor && row.game.home === result.home && row.game.date === result.date);
    if (!match) return;
    saveGameAction(match.key, {
      resultWinner: result.winner,
      awayScore: Number.isFinite(Number(result.awayScore)) ? String(result.awayScore) : "",
      homeScore: Number.isFinite(Number(result.homeScore)) ? String(result.homeScore) : "",
    });
    applied += 1;
  });
  return applied;
}

async function scanEspnScores() {
  state.scoreScanStatus = "checking";
  state.scoreScanMessage = "Scanning ESPN scoreboard results";
  render();
  try {
    const apiUrl = location.protocol === "file:" ? "http://127.0.0.1:8787/api/espn-scores-scan" : "/api/espn-scores-scan";
    const response = await fetch(apiUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Scan failed with HTTP ${response.status}`);
    window.ESPN_GAME_RESULTS = await response.json();
    const applied = applyScannedScores(window.ESPN_GAME_RESULTS);
    state.scoreScanStatus = "review";
    state.scoreScanMessage = `Scanned ${window.ESPN_GAME_RESULTS.games?.length || 0} ESPN games and applied ${applied} completed results.`;
  } catch (error) {
    if (window.ESPN_GAME_RESULTS?.games?.length) {
      const applied = applyScannedScores(window.ESPN_GAME_RESULTS);
      state.scoreScanStatus = "review";
      state.scoreScanMessage = `Using cached ESPN scores and applied ${applied} completed results. Restart the local server or run refresh-espn-scores.bat to refresh live.`;
      render();
      return;
    }
    state.scoreScanStatus = "error";
    state.scoreScanMessage = error.message;
  }
  render();
}

function scoreScanStatusNote() {
  const scan = window.ESPN_GAME_RESULTS;
  const status = state.scoreScanStatus;
  const message = state.scoreScanMessage || (scan?.fetchedAt ? `ESPN scores cached ${new Date(scan.fetchedAt).toLocaleString()} for ${scan.games?.length || 0} games.` : "No ESPN score scan loaded yet.");
  return `<span class="scan-status ${status}">${esc(message)}</span>`;
}

function renderSnapsStatsPreview() {
  const scan = window.FOOTBALLGUYS_GAME_LOGS;
  if (!scan?.players?.length) return "";
  const query = state.snapsStatsQuery.trim().toLowerCase();
  const rows = scan.players
    .filter((player) => {
      const haystack = [player.player, player.team, player.teamAbbrev, player.position, player.gamesPlayed].join(" ").toLowerCase();
      return (!query || haystack.includes(query)) && matches(player);
    })
    .sort((a, b) => String(a.team || "").localeCompare(String(b.team || "")) || String(a.player || "").localeCompare(String(b.player || "")))
    .slice(0, 90)
    .map((player) => `
      <tr>
        <td>${fantasyRowName({ player: player.player }, "QB")}</td>
        <td>${teamCellFull(player.team)}</td>
        <td class="num rank-col">${fantasyDisplay(player.gamesPlayed, 0)}</td>
        <td class="num">${fantasyDisplay(player.averages?.passYards, 1)}</td>
        <td class="num">${fantasyDisplay(player.averages?.passTds, 2)}</td>
        <td class="num">${fantasyDisplay(player.averages?.rushAttempts, 1)}</td>
        <td class="num">${fantasyDisplay(player.averages?.rushYards, 1)}</td>
        <td class="num">${fantasyDisplay(player.averages?.rushTds, 2)}</td>
        <td class="num">${fantasyDisplay(player.last5Averages?.passYards, 1)}</td>
        <td class="num">${fantasyDisplay(player.last5Averages?.passTds, 2)}</td>
        <td class="num">${fantasyDisplay(player.last5Averages?.rushAttempts, 1)}</td>
        <td class="num">${fantasyDisplay(player.last5Averages?.rushYards, 1)}</td>
        <td class="num">${fantasyDisplay(player.last5Averages?.rushTds, 2)}</td>
      </tr>
    `);
  return `
    <section class="formula-card snaps-preview">
      <div class="formula-card-head">
        <div>
          <h3>Scanned QB Game Logs</h3>
          <p>Footballguys ${esc(scan.year || "")}. Averages skip zero-only weeks where the QB did not play.</p>
        </div>
        <label class="compact-search">Search <input id="snaps-stats-search" placeholder="Player, team, abbrev" value="${esc(state.snapsStatsQuery)}" /></label>
      </div>
      <div class="table-scroll fantasy-rank-scroll stat-ranks-scroll">
        ${table([
          { label: "Player" },
          { label: "Team" },
          { label: "Games", cls: "num rank-col" },
          { label: "Avg Pass Yards", cls: "num" },
          { label: "Avg Pass TDs", cls: "num" },
          { label: "Avg Rush Attempts", cls: "num" },
          { label: "Avg Rush Yards", cls: "num" },
          { label: "Avg Rush TDs", cls: "num" },
          { label: "Last 5 Pass Yards", cls: "num" },
          { label: "Last 5 Pass TDs", cls: "num" },
          { label: "Last 5 Rush Attempts", cls: "num" },
          { label: "Last 5 Rush Yards", cls: "num" },
          { label: "Last 5 Rush TDs", cls: "num" },
        ], rows.length ? rows : [`<tr><td colspan="13" class="empty-cell">No scanned QB logs match that search.</td></tr>`])}
      </div>
    </section>
  `;
}

function weeklyQbFormulaText() {
  const weights = { ...defaultWeeklyQbWeights, ...state.weeklyQbWeights };
  return `Score =
PassYardsTerm + PassTDTerm + RushAttemptsTerm + RushTDTerm

Blended Score uses: productionStat = ${num(weights.last5, 68)}% Last5 + ${100 - num(weights.last5, 68)}% Season
Season Score uses: productionStat = Season
Last 5 Score uses: productionStat = Last5

Sliders scale factor influence or production terms. 100% equals the workbook formula.
Turning Production off keeps the rating/context formula live with neutral QB baselines: 225 PY, 1.6 PTD, 3 rush attempts, 0.2 rush TD.

matchFactor = clamp(0.86, 1.14, 1 + (16.5 - vQBRank) / 100)
ratingFactor = clamp(0.8, 1.2, 0.9 + 0.4 * (rating - 75) / 25)
olFactor = clamp(0.94, 1.06, 1 + (16.5 - OLRank) / 240)
wrFactor = clamp(0.94, 1.06, 1 + (16.5 - WRRank) / 240)
ppgFactor = clamp(0.92, 1.08, 1 + (16.5 - PPGRank) / 200)

PassYardsTerm = 0.04 * usePassYards * depth^0.7 * rating^0.28 * matchup^0.48 * OL^0.2 * WR^0.28 * PPG^0.2
PassTDTerm = 4 * usePassTDs * depth^0.7 * rating^0.48 * matchup^0.55 * WR^0.3 * PPG^0.22
RushAttemptsTerm = 0.1 * useRushAttempts * 4.8 * rating^0.25 * matchup^0.26 * PPG^0.15
RushTDTerm = 6 * useRushTDs * rating^0.4 * matchup^0.35`;
}

function renderWeeklyQbScoreAudit(rows) {
  const top = rows[0];
  const allen = rows.find((row) => normalizeName(row.player) === normalizeName("Josh Allen"));
  if (!top && !allen) return "";
  const shown = [top, allen].filter(Boolean).filter((row, index, arr) => arr.findIndex((item) => item.player === row.player) === index);
  const metrics = [
    ["Blended Score", "score", 1, "blend"],
    ["Season Score", "score", 1, "season"],
    ["Last 5 Score", "score", 1, "last5"],
    ["Rating", "rateP", 0],
    ["vQB Rk", "matchRank", 0],
    ["OL Rk", "olRank", 0],
    ["PPG Rk", "ppgRank", 0],
    ["WR Rk", "wrRank", 0],
    ["Season PYds", "seaPY", 1],
    ["Last 5 PYds", "lfivePY", 1],
    ["Blended PYds", "usePY", 1],
    ["Season PTD", "seaPTD", 2],
    ["Last 5 PTD", "lfivePTD", 2],
    ["Blended PTD", "usePTD", 2],
    ["Season Rush Att", "seaRA", 2],
    ["Last 5 Rush Att", "lfiveRA", 2],
    ["Blended Rush Att", "useRA", 2],
    ["Season Rush TD", "seaRTD", 2],
    ["Last 5 Rush TD", "lfiveRTD", 2],
    ["Blended Rush TD", "useRTD", 2],
    ["Rating Factor", "jF", 3],
    ["Matchup Factor", "mF", 3],
    ["OL Factor", "oF", 3],
    ["WR Factor", "wF", 3],
    ["PPG Factor", "pF", 3],
    ["Pass Yards Term", "passYardsTerm", 2],
    ["Pass TD Term", "passTdsTerm", 2],
    ["Rush Attempts Term", "rushAttemptsTerm", 2],
    ["Rush TD Term", "rushTdsTerm", 2],
  ];
  const breakdowns = shown.map((row) => ({
    row,
    blend: weeklyQbScoreBreakdown(row, "blend"),
    season: weeklyQbScoreBreakdown(row, "season"),
    last5: weeklyQbScoreBreakdown(row, "last5"),
  }));
  const rowsHtml = metrics.map(([label, key, digits]) => `
    <tr>
      <td>${esc(label)}</td>
      ${breakdowns.map((item) => {
        const calc = item[label.startsWith("Season") ? "season" : label.startsWith("Last 5") ? "last5" : "blend"];
        return `<td class="num">${esc(fantasyDisplay(calc[key], digits))}</td>`;
      }).join("")}
    </tr>
  `);
  return `
    <section class="formula-card weekly-qb-audit">
      <h3>Weekly QB Score Audit</h3>
      <p>The score is the workbook formula rebuilt in the app. Last 5 uses the last five games actually played and currently carries 68% of the stat blend.</p>
      <div class="table-scroll audit-scroll">
        ${table([{ label: "Driver" }, ...breakdowns.map(({ row }) => ({ label: row.player, cls: "num" }))], rowsHtml)}
      </div>
      <pre class="formula">${esc(weeklyQbFormulaText())}</pre>
    </section>
  `;
}

function weeklyQbToggleButton(key, label) {
  const active = Boolean(state.weeklyQbOptions[key]);
  const disabled = key === "useLast5" && !state.weeklyQbOptions.useProduction;
  return `<button class="formula-toggle ${active ? "active" : ""}" data-qb-option="${esc(key)}" ${disabled ? "disabled" : ""}><span>${esc(label)}</span></button>`;
}

function weeklyQbSlider(key, label, min = 0, max = 200) {
  const rawValue = num(state.weeklyQbWeights[key], defaultWeeklyQbWeights[key] ?? 100);
  const value = Math.max(min, Math.min(max, Math.round(rawValue / 10) * 10));
  const productionKeys = ["passYards", "passTds", "rushAttempts", "rushTds"];
  const disabled = productionKeys.includes(key) && !state.weeklyQbOptions.useProduction;
  return `
    <label class="formula-slider ${disabled ? "disabled" : ""}">
      <span>${esc(label)}</span>
      <input type="range" min="${min}" max="${max}" step="10" value="${esc(value)}" data-qb-weight="${esc(key)}" ${disabled ? "disabled" : ""} />
      <b>${esc(value)}%</b>
    </label>
  `;
}

function renderWeeklyQbFormulaControls() {
  const open = Boolean(state.weeklyQbControlsOpen);
  return `
    <section class="formula-control-panel ${open ? "" : "collapsed"}">
      <div class="formula-control-head">
        <h3>Score Controls</h3>
        <div class="formula-control-actions">
          ${state.weeklyQbDefaultMessage ? `<span class="formula-save-note">${esc(state.weeklyQbDefaultMessage)}</span>` : ""}
          <button id="weekly-qb-toggle-controls" class="mini-action">${open ? "Hide" : "Show"}</button>
          ${open ? `<button id="weekly-qb-set-default" class="mini-action">Set Default</button>` : ""}
          ${open ? `<button id="weekly-qb-reset-formula" class="mini-action">Reset Formula</button>` : ""}
        </div>
      </div>
      ${open ? `
      <div class="formula-toggle-row">
        ${weeklyQbToggleButton("useStatRanks", "Use StatRanks")}
        ${weeklyQbToggleButton("useLast5", "Use Last 5")}
        ${weeklyQbToggleButton("useProduction", "Use Production")}
      </div>
      <div class="formula-slider-grid">
        ${weeklyQbSlider("last5", "Last 5 Blend", 0, 100)}
        ${weeklyQbSlider("talent", "Talent")}
        ${weeklyQbSlider("matchup", "Matchup")}
        ${weeklyQbSlider("depth", "Depth")}
        ${weeklyQbSlider("oline", "O-Line")}
        ${weeklyQbSlider("ppg", "PPG")}
        ${weeklyQbSlider("wr", "WR Group")}
        ${weeklyQbSlider("passYards", "Pass Yards")}
        ${weeklyQbSlider("passTds", "Pass TDs")}
        ${weeklyQbSlider("rushAttempts", "Rush Attempts")}
        ${weeklyQbSlider("rushTds", "Rush TDs")}
      </div>
      ` : ""}
    </section>
  `;
}

function fantasyRankPositions(kind) {
  return Object.keys(fantasyRankBundle(kind));
}

function fantasyDisplay(value, digits = 1) {
  if (value === null || value === undefined || value === "") return "-";
  const text = String(value);
  if (text.startsWith("#")) return text;
  return Number.isFinite(Number(value)) ? fmt(value, digits) : text;
}

function fantasyIsIssue(value) {
  return String(value ?? "").startsWith("#");
}

function fantasyRowName(row, position) {
  if (position === "Defense") return teamCellByName(row.team || row.player || "");
  const player = findPlayerByName(row.player || "");
  const source = player || { player: row.player };
  const name = String(row.player || "");
  const shrink = name.length > 20 ? Math.max(9.2, 12 - ((name.length - 20) * 0.22)) : 12;
  const style = `style="--name-size:${shrink.toFixed(1)}px"`;
  return player
    ? `<button class="link player-open fantasy-player" data-player-key="${esc(sourceKey(player))}" ${style}>${playerAvatar(player)}<span>${esc(name)}</span></button>`
    : `<span class="fantasy-player-static" ${style}>${playerAvatar(source)}<b>${esc(name || "-")}</b></span>`;
}

function fantasyMergeKey(name) {
  return cleanPlayerName(String(name || "").replace(/\s+\([A-Z]{2,3}\)$/i, ""));
}

function rankNumber(rows, getter, row, descending = true) {
  const values = rows.map((item) => Number(getter(item))).filter(Number.isFinite).sort((a, b) => descending ? b - a : a - b);
  const value = Number(getter(row));
  if (!Number.isFinite(value)) return "";
  return values.findIndex((item) => item === value) + 1;
}

function scheduleOpponent(teamName, week) {
  const teamKey = normalizeScheduleTeam(teamName);
  const game = scheduleGames().find((item) => scheduleWeekMatches(item, week) && (normalizeScheduleTeam(item.visitor) === teamKey || normalizeScheduleTeam(item.home) === teamKey));
  if (!game) return "";
  return normalizeScheduleTeam(game.visitor) === teamKey ? game.home : game.visitor;
}

function footballguysLogFor(player) {
  const rows = window.FOOTBALLGUYS_GAME_LOGS?.players || [];
  const playerKey = normalizeName(player.player);
  const teamKey = normalizeTeamName(player.team);
  return rows.find((row) => normalizeName(row.player) === playerKey && normalizeTeamName(row.team) === teamKey)
    || rows.find((row) => normalizeName(row.player) === playerKey)
    || null;
}

function workbookRowByName(rows, playerName) {
  const key = fantasyMergeKey(playerName);
  return rows.find((row) => fantasyMergeKey(row.player) === key) || null;
}

function averageFinite(values, fallback = null) {
  const nums = values.filter((value) => Number.isFinite(Number(value))).map(Number);
  return nums.length ? nums.reduce((sum, value) => sum + value, 0) / nums.length : fallback;
}

function floorTo(value, step) {
  const number = Number(value);
  return Number.isFinite(number) && step ? Math.floor(number / step) * step : "";
}

function teamRankingsByTeam(teamName) {
  const normalized = normalizeTeamName(teamName);
  return (window.TEAM_RANKINGS_SCAN?.teams || []).find((team) => normalizeTeamName(team.team) === normalized) || null;
}

function qbDefenseRatingForTeam(team) {
  if (!team) return "";
  const parts = [
    [teamPositionScore(team, "CB"), 0.38],
    [teamPositionScore(team, "S"), 0.28],
    [teamPositionScore(team, "EDGE Def"), 0.18],
    [teamPositionScore(team, "LB Only"), 0.08],
    [teamPositionScore(team, "DL\n(DT + EDGE)"), 0.08],
  ];
  const score = parts.reduce((sum, [value, weight]) => Number.isFinite(Number(value)) ? sum + Number(value) * weight : sum, 0);
  return score > 0 ? score : "";
}

function weeklyQbStatPack(player, workbookRow) {
  const log = footballguysLogFor(player);
  const wb = (label) => fantasyDetailValue(workbookRow || {}, label);
  const fallbackPassYards = Number(wb("Typical Pass Yards"));
  const fallbackPassTds = Number(wb("Typical Pass TDs"));
  const fallbackRushAttempts = Number(wb("Typical Rush Attempts"));
  const fallbackRushTds = Number(wb("Typical Rush TDs"));
  const season = {
    passYards: Number.isFinite(log?.averages?.passYards) ? log.averages.passYards : (Number.isFinite(fallbackPassYards) ? fallbackPassYards : 205 + Math.max(0, num(player.rating, 75) - 75) * 2.2),
    passTds: Number.isFinite(log?.averages?.passTds) ? log.averages.passTds : (Number.isFinite(fallbackPassTds) ? fallbackPassTds : 1.15 + Math.max(0, num(player.rating, 75) - 75) * 0.035),
    rushAttempts: Number.isFinite(log?.averages?.rushAttempts) ? log.averages.rushAttempts : (Number.isFinite(fallbackRushAttempts) ? fallbackRushAttempts : 2.2),
    rushYards: Number.isFinite(log?.averages?.rushYards) ? log.averages.rushYards : 0,
    rushTds: Number.isFinite(log?.averages?.rushTds) ? log.averages.rushTds : (Number.isFinite(fallbackRushTds) ? fallbackRushTds : 0.12),
  };
  const last5 = {
    passYards: Number.isFinite(log?.last5Averages?.passYards) ? log.last5Averages.passYards : season.passYards,
    passTds: Number.isFinite(log?.last5Averages?.passTds) ? log.last5Averages.passTds : season.passTds,
    rushAttempts: Number.isFinite(log?.last5Averages?.rushAttempts) ? log.last5Averages.rushAttempts : season.rushAttempts,
    rushYards: Number.isFinite(log?.last5Averages?.rushYards) ? log.last5Averages.rushYards : season.rushYards,
    rushTds: Number.isFinite(log?.last5Averages?.rushTds) ? log.last5Averages.rushTds : season.rushTds,
  };
  return { log, gamesPlayed: log?.gamesPlayed || 0, season, last5 };
}

function weeklyQbScore(row) {
  return weeklyQbScoreBreakdown(row, "blend").score;
}

function weeklyQbScoreBreakdown(row, mode = "blend") {
  const weights = { ...defaultWeeklyQbWeights, ...state.weeklyQbWeights };
  const options = { ...defaultWeeklyQbOptions, ...state.weeklyQbOptions };
  const scaleFactor = (factor, weight) => 1 + ((factor - 1) * (num(weight, 100) / 100));
  const termWeight = (key) => num(weights[key], 100) / 100;
  const depthRaw = row.depth;
  const depthNum = Number.isFinite(Number(depthRaw)) ? Number(depthRaw) : 100;
  const depthBucket = Math.max(1, Math.min(4, depthNum || 1));
  const depthFactor = [1, 0.6, 0.42, 0.28][depthBucket - 1];
  const matchRank = num(row.extras["Matchup Rating (Low is good)"], 16.5);
  const rateP = num(row.rating, 75);
  const olRank = num(row.extras["OL Rank"], 16.5);
  const wrRank = num(row.extras["WR Group Rank"], 16.5);
  const ppgRank = num(row.extras["PPG Rank"], 16.5);
  const neutralProduction = !options.useProduction;
  const seaPY = neutralProduction ? 225 : num(row.extras["Typical Pass Yards"], 225);
  const seaPTD = neutralProduction ? 1.6 : num(row.extras["Typical Pass TDs"], 1.6);
  const seaRA = neutralProduction ? 3 : num(row.extras["Typical Rush Attempts"], 3);
  const seaRTD = neutralProduction ? 0.2 : num(row.extras["Typical Rush TDs"], 0.2);
  const lfivePY = neutralProduction ? seaPY : num(row.extras["!!LAST 5!!\nTypical Pass Yards"], seaPY);
  const lfivePTD = neutralProduction ? seaPTD : num(row.extras["!!LAST 5!!\nTypical Pass TDs"], seaPTD);
  const lfiveRA = neutralProduction ? seaRA : num(row.extras["!!LAST 5!!\nTypical Rush Attempts"], seaRA);
  const lfiveRTD = neutralProduction ? seaRTD : num(row.extras["!!LAST 5!!\nTypical Rush TDs"], seaRTD);
  const wLast5 = mode === "season" || !options.useLast5 ? 0 : mode === "last5" ? 1 : num(weights.last5, 68) / 100;
  const usePY = wLast5 * lfivePY + (1 - wLast5) * seaPY;
  const usePTD = wLast5 * lfivePTD + (1 - wLast5) * seaPTD;
  const useRA = wLast5 * lfiveRA + (1 - wLast5) * seaRA;
  const useRTD = wLast5 * lfiveRTD + (1 - wLast5) * seaRTD;
  const injuryText = String(row.injury || "");
  const injured = /inj|ir|out/i.test(injuryText);
  const playOK = depthNum === 100 || injured || matchRank === 100 ? 0 : 1;
  const depthF = scaleFactor(depthFactor, weights.depth);
  const jF = scaleFactor(Math.max(0.8, Math.min(1.2, 0.9 + 0.4 * (rateP - 75) / 25)), weights.talent);
  const mF = scaleFactor(Math.max(0.86, Math.min(1.14, 1 + (16.5 - matchRank) / 100)), weights.matchup);
  const oF = scaleFactor(Math.max(0.94, Math.min(1.06, 1 + (16.5 - olRank) / 240)), weights.oline);
  const wF = scaleFactor(Math.max(0.94, Math.min(1.06, 1 + (16.5 - wrRank) / 240)), weights.wr);
  const pF = scaleFactor(Math.max(0.92, Math.min(1.08, 1 + (16.5 - ppgRank) / 200)), weights.ppg);
  const passYardsTerm = termWeight("passYards") * 0.04 * usePY * (depthF ** 0.7) * (jF ** 0.28) * (mF ** 0.48) * (oF ** 0.2) * (wF ** 0.28) * (pF ** 0.2);
  const passTdsTerm = termWeight("passTds") * 4 * usePTD * (depthF ** 0.7) * (jF ** 0.48) * (mF ** 0.55) * (wF ** 0.3) * (pF ** 0.22);
  const rushAttemptsTerm = termWeight("rushAttempts") * 0.1 * useRA * 4.8 * (jF ** 0.25) * (mF ** 0.26) * (pF ** 0.15);
  const rushTdsTerm = termWeight("rushTds") * 6 * useRTD * (jF ** 0.4) * (mF ** 0.35);
  const raw = playOK * (passYardsTerm + passTdsTerm + rushAttemptsTerm + rushTdsTerm);
  return { mode, statWeightLast5: wLast5, depthNum, depthFactor: depthF, matchRank, rateP, olRank, wrRank, ppgRank, seaPY, seaPTD, seaRA, seaRTD, lfivePY, lfivePTD, lfiveRA, lfiveRTD, usePY, usePTD, useRA, useRTD, jF, mF, oF, wF, pF, passYardsTerm, passTdsTerm, rushAttemptsTerm, rushTdsTerm, raw, score: Number(Math.max(0, raw).toFixed(1)) };
}

function buildWeeklyQbRows(workbookRows) {
  const week = selectedSiteWeek() || fantasyRankBundle("weekly")?.QB?.week || window.FANTASY_RANKINGS?.weeklyWeek || 1;
  const teams = state.data?.teams || [];
  const allQbs = state.players.filter((player) => groupPosition(player.position) === "QB" || player.position === "QB");
  const rankedTeamsByOl = teams.map((team) => ({ team, score: teamPositionScore(team, "OL") })).filter((row) => Number.isFinite(Number(row.score)));
  const rankedTeamsByWr = teams.map((team) => ({ team, score: teamPositionScore(team, "WR") })).filter((row) => Number.isFinite(Number(row.score)));
  const rankedTeamsByVqb = teams.map((team) => ({ team, score: qbDefenseRatingForTeam(team) })).filter((row) => Number.isFinite(Number(row.score)));
  const rankedTeamsByStatVqb = teams.map((team) => ({ team, score: teamRankingsByTeam(team.team)?.passAllowedStatAvg })).filter((row) => Number.isFinite(Number(row.score)));
  const rankedByPpg = teams.map((team) => {
    const ranks = teamRankingsByTeam(team.team);
    return { team, score: state.weeklyQbOptions.useStatRanks && ranks?.offPointsRank ? 33 - Number(ranks.offPointsRank) : team.offenseRating };
  }).filter((row) => Number.isFinite(Number(row.score)));
  const rows = allQbs.map((player) => {
    const workbookRow = workbookRowByName(workbookRows, player.player);
    const team = teamByName(player.team);
    const opponent = scheduleOpponent(player.team, week);
    const opponentTeam = teamByName(opponent);
    const opponentRanks = teamRankingsByTeam(opponent);
    const statPack = weeklyQbStatPack(player, workbookRow);
    const olRating = team ? teamPositionScore(team, "OL") : averageFinite(teams.map((item) => teamPositionScore(item, "OL")), 82);
    const wrRating = team ? teamPositionScore(team, "WR") : averageFinite(teams.map((item) => teamPositionScore(item, "WR")), 84);
    const olRow = { team, score: olRating };
    const wrRow = { team, score: wrRating };
    const ppgRow = { team, score: state.weeklyQbOptions.useStatRanks && teamRankingsByTeam(player.team)?.offPointsRank ? 33 - Number(teamRankingsByTeam(player.team).offPointsRank) : num(team?.offenseRating, 16) };
    const oppVqbRating = qbDefenseRatingForTeam(opponentTeam);
    const opponentVqbRow = { team: opponentTeam, score: oppVqbRating };
    const opponentStatVqbRow = { team: opponentTeam, score: opponentRanks?.passAllowedStatAvg };
    const matchupRating = rankNumber(rankedTeamsByVqb, (item) => item.score, opponentVqbRow, false) || 16.5;
    const statVqbRank = rankNumber(rankedTeamsByStatVqb, (item) => item.score, opponentStatVqbRow) || "";
    const salary = Number(workbookRow?.extras?.Salary);
    const extras = {
      "Opp vQB Rating": Number.isFinite(Number(oppVqbRating)) && oppVqbRating > 0 ? Number(oppVqbRating.toFixed(1)) : "",
      "Matchup Rating (Low is good)": Number.isFinite(Number(matchupRating)) ? matchupRating : 16.5,
      "Stat vQB Rank": statVqbRank,
      "Player Rating Rank": "",
      "Value Rank": "",
      "FPros Name": workbookRow?.extras?.["FPros Name"] || "",
      "Salary": Number.isFinite(salary) && salary > 0 ? salary : "",
      "OL Rating": Number.isFinite(Number(olRating)) ? Number(olRating.toFixed(3)) : "",
      "OL Rank": rankNumber(rankedTeamsByOl, (item) => item.score, olRow),
      "PPG Rank": rankNumber(rankedByPpg, (item) => item.score, ppgRow),
      "WR Group Rating": Number.isFinite(Number(wrRating)) ? Number(wrRating.toFixed(3)) : "",
      "WR Group Rank": rankNumber(rankedTeamsByWr, (item) => item.score, wrRow),
      "Typical Pass Yards": Number(statPack.season.passYards.toFixed(1)),
      "Typical Pass Yards Rounded Down": floorTo(statPack.season.passYards, 10),
      "Pass Yards Bonus Score": Number(((statPack.season.passYards / 100) * 2).toFixed(3)),
      "!!LAST 5!!\nTypical Pass Yards": Number(statPack.last5.passYards.toFixed(1)),
      "!!LAST 5!!\nTypical Pass Yards Rounded Down": floorTo(statPack.last5.passYards, 10),
      "!!LAST 5!!\nPass Yards Bonus Score": Number(((statPack.last5.passYards / 100) * 2).toFixed(3)),
      "Typical Pass TDs": Number(statPack.season.passTds.toFixed(3)),
      "Typical Pass TDs Rounded Down": floorTo(statPack.season.passTds, 0.25),
      "Pass TDs Bonus Score": Number((statPack.season.passTds * 1.5).toFixed(3)),
      "!!LAST 5!!\nTypical Pass TDs": Number(statPack.last5.passTds.toFixed(3)),
      "!!LAST 5!!\nTypical Pass TDs Rounded Down": floorTo(statPack.last5.passTds, 0.5),
      "!!LAST 5!!\nTypical Pass TDs Bonus Score": Number((statPack.last5.passTds * 1.5).toFixed(3)),
      "Typical Rush Attempts": Number(statPack.season.rushAttempts.toFixed(3)),
      "Typical Rush Attempts Rounded Down": floorTo(statPack.season.rushAttempts, 0.25),
      "Typical Rush Attempts Bonus Score": Number((statPack.season.rushAttempts / 3).toFixed(3)),
      "!!LAST 5!!\nTypical Rush Attempts": Number(statPack.last5.rushAttempts.toFixed(3)),
      "!!LAST 5!!\nTypical Rush Attempts Rounded Down": floorTo(statPack.last5.rushAttempts, 1),
      "!!LAST 5!!\nTypical Rush Attempts Bonus Score": Number((statPack.last5.rushAttempts / 3).toFixed(3)),
      "Typical Rush TDs": Number(statPack.season.rushTds.toFixed(3)),
      "Typical Rush TDs Rounded Down": floorTo(statPack.season.rushTds, 0.25),
      "Typical Rush TDs Bonus Score": Number((statPack.season.rushTds * 4).toFixed(3)),
      "!!LAST 5!!\nTypical Rush TDs": Number(statPack.last5.rushTds.toFixed(3)),
      "!!LAST 5!!\nTypical Rush TDs Rounded Down": floorTo(statPack.last5.rushTds, 0.1),
      "!!LAST 5!!\nTypical Rush TDs Bonus Score": Number((statPack.last5.rushTds * 4).toFixed(3)),
      "Games Played": statPack.gamesPlayed,
      "Stat Source": statPack.log ? "Footballguys" : "Fallback",
    };
    extras["Total Bonuses\n=sum(AC2,AI2,AO2,AU2)"] = Number((extras["Pass Yards Bonus Score"] + extras["Pass TDs Bonus Score"] + extras["Typical Rush Attempts Bonus Score"] + extras["Typical Rush TDs Bonus Score"]).toFixed(3));
    extras["!!LAST 5!!\nTotal Bonuses"] = Number((extras["!!LAST 5!!\nPass Yards Bonus Score"] + extras["!!LAST 5!!\nTypical Pass TDs Bonus Score"] + extras["!!LAST 5!!\nTypical Rush Attempts Bonus Score"] + extras["!!LAST 5!!\nTypical Rush TDs Bonus Score"]).toFixed(3));
    const row = {
      position: "QB",
      player: player.player,
      team: player.team,
      opponent,
      rating: player.rating,
      depth: player.depth,
      injury: player.injury,
      adp: workbookRow?.adp ?? null,
      extras,
      _playerKey: sourceKey(player),
    };
    row.score = weeklyQbScoreBreakdown(row, "blend").score;
    row.seasonScore = weeklyQbScoreBreakdown(row, "season").score;
    row.last5Score = weeklyQbScoreBreakdown(row, "last5").score;
    row.value = Number.isFinite(Number(extras.Salary)) && Number(extras.Salary) > 0 ? Number((row.score / Number(extras.Salary)).toFixed(3)) : row.score;
    return row;
  });
  rows.forEach((row) => {
    row.rank = rankNumber(rows, (item) => item.score, row);
    row.scoreRank = row.rank;
    row.last5Rank = rankNumber(rows, (item) => item.last5Score, row);
    row.extras["Player Rating Rank"] = rankNumber(rows, (item) => item.rating, row);
    row.extras["Value Rank"] = rankNumber(rows, (item) => item.value, row);
    row.extras["Total Bonuses RANK"] = rankNumber(rows, (item) => item.extras["Total Bonuses\n=sum(AC2,AI2,AO2,AU2)"], row);
    row.extras["!!LAST 5!!\nTotal Bonuses RANK"] = rankNumber(rows, (item) => item.extras["!!LAST 5!!\nTotal Bonuses"], row);
  });
  return rows;
}

function positionDepthFactor(depth, position) {
  const d = Math.max(1, Number.isFinite(Number(depth)) ? Number(depth) : 8);
  const curves = {
    RB: [1, 0.72, 0.48, 0.28],
    WR: [1, 0.86, 0.72, 0.52, 0.32],
    TE: [1, 0.68, 0.38],
  };
  const curve = curves[position] || [1, 0.62, 0.38, 0.22];
  return curve[d - 1] ?? 0.12;
}

function weeklySkillMatchupScore(position, opponentTeam) {
  if (!opponentTeam) return 84;
  if (position === "RB") return averageFinite([teamPositionScore(opponentTeam, "IDL"), teamPositionScore(opponentTeam, "LB Only")], 84);
  if (position === "WR") return averageFinite([teamPositionScore(opponentTeam, "CB"), teamPositionScore(opponentTeam, "S")], 84);
  if (position === "TE") return averageFinite([teamPositionScore(opponentTeam, "LB Only"), teamPositionScore(opponentTeam, "S")], 84);
  return teamPositionScore(opponentTeam, "Defense") || 84;
}

function weeklySkillTeamContext(position, team) {
  if (!team) return 84;
  if (position === "RB") return averageFinite([teamPositionScore(team, "OL"), team.offenseAverage], 84);
  if (position === "WR") return averageFinite([teamPositionScore(team, "WR"), team.offenseAverage, teamPositionScore(team, "QB")], 84);
  if (position === "TE") return averageFinite([teamPositionScore(team, "TE"), team.offenseAverage, teamPositionScore(team, "QB")], 84);
  return team.offenseAverage || 84;
}

function buildWeeklySkillRows(position, workbookRows) {
  const week = selectedSiteWeek() || 1;
  const players = state.players.filter((player) => groupPosition(player.position) === position || player.position === position);
  const rows = players.map((player) => {
    const workbook = workbookRowByName(workbookRows, player.player) || {};
    const team = teamByName(player.team);
    const opponent = scheduleOpponent(player.team, week);
    const opponentTeam = teamByName(opponent);
    const matchup = weeklySkillMatchupScore(position, opponentTeam);
    const teamContext = weeklySkillTeamContext(position, team);
    const depthFactor = positionDepthFactor(player.depth, position);
    const rating = num(player.rating, 68);
    const matchupFactor = Math.max(0.84, Math.min(1.16, 1 + ((84 - num(matchup, 84)) / 120)));
    const contextFactor = Math.max(0.9, Math.min(1.12, 1 + ((num(teamContext, 84) - 84) / 160)));
    const baseByPosition = { RB: 8.8, WR: 8.2, TE: 6.4 };
    const ceilingByPosition = { RB: 10.2, WR: 10.5, TE: 8.2 };
    const score = (baseByPosition[position] || 7)
      + ((rating - 68) * 0.26)
      + (depthFactor * (ceilingByPosition[position] || 8))
      + ((num(team?.offenseAverage, 84) - 84) * 0.06);
    const row = {
      ...workbook,
      player: player.player,
      position,
      team: player.team,
      opponent,
      rating,
      depth: player.depth,
      _playerKey: sourceKey(player),
      extras: {
        ...(workbook.extras || {}),
        "Depth Factor": Number(depthFactor.toFixed(2)),
        "Matchup Rating": Number(num(matchup, 84).toFixed(1)),
        "Team Context": Number(num(teamContext, 84).toFixed(1)),
        "Opponent Defense": Number(num(opponentTeam?.defenseAverage, 84).toFixed(1)),
      },
    };
    const generatedScore = Number(Math.max(0, score * matchupFactor * contextFactor).toFixed(1));
    row.score = Number.isFinite(Number(workbook.score)) ? Number(workbook.score) : generatedScore;
    row.seasonScore = Number.isFinite(Number(workbook.seasonScore)) ? Number(workbook.seasonScore) : row.score;
    row.last5Score = Number.isFinite(Number(workbook.last5Score)) ? Number(workbook.last5Score) : row.score;
    row.value = Number.isFinite(Number(workbook.value)) ? Number(workbook.value) : row.score;
    return row;
  });
  rows.forEach((row) => {
    row.rank = rankNumber(rows, (item) => item.score, row);
    row.scoreRank = row.rank;
    row.extras["Player Rating Rank"] = rankNumber(rows, (item) => item.rating, row);
    row.extras["Matchup Rank"] = rankNumber(rows, (item) => item.extras["Matchup Rating"], row, false);
    row.extras["Team Context Rank"] = rankNumber(rows, (item) => item.extras["Team Context"], row);
  });
  return rows;
}

function maddenKickerForTeam(teamName) {
  const normalized = normalizeTeamName(teamName);
  return (window.MADDEN_27_RATINGS || []).filter((row) => ["K", "PK"].includes(String(row.pos || "").toUpperCase()))
    .find((row) => normalizeTeamName(row.team) === normalized) || null;
}

function buildWeeklyDefenseRows(workbookRows) {
  const week = selectedSiteWeek() || 1;
  const rows = (state.data?.teams || []).map((team) => {
    const workbook = workbookRows.find((row) => normalizeTeamName(row.team || row.player) === normalizeTeamName(team.team)) || {};
    const opponent = scheduleOpponent(team.team, week);
    const opponentTeam = teamByName(opponent);
    const matchupFactor = Math.max(0.82, Math.min(1.18, 1 + ((84 - num(opponentTeam?.offenseAverage, 84)) / 115)));
    const rushPressure = averageFinite([teamPositionScore(team, "EDGE Def"), teamPositionScore(team, "IDL")], team.defenseAverage);
    const score = 5.2 + ((num(team.defenseAverage, 84) - 76) * 0.18) + ((num(rushPressure, 84) - 84) * 0.06);
    const row = {
      ...workbook,
      position: "Defense",
      player: team.team,
      team: team.team,
      opponent,
      rating: team.defenseAverage,
      extras: {
        ...(workbook.extras || {}),
        "Defense Rating": Number(num(team.defenseAverage, 84).toFixed(1)),
        "Pass Rush": Number(num(rushPressure, 84).toFixed(1)),
        "Opponent Off Rating": Number(num(opponentTeam?.offenseAverage, 84).toFixed(1)),
        "Opp QB Rating": Number(num(teamPositionScore(opponentTeam, "QB"), 84).toFixed(1)),
      },
    };
    const generatedScore = Number(Math.max(0, score * matchupFactor).toFixed(1));
    row.score = Number.isFinite(Number(workbook.score)) ? Number(workbook.score) : generatedScore;
    row.seasonScore = Number.isFinite(Number(workbook.seasonScore)) ? Number(workbook.seasonScore) : row.score;
    row.last5Score = Number.isFinite(Number(workbook.last5Score)) ? Number(workbook.last5Score) : row.score;
    row.value = Number.isFinite(Number(workbook.value)) ? Number(workbook.value) : row.score;
    return row;
  });
  rows.forEach((row) => {
    row.rank = rankNumber(rows, (item) => item.score, row);
    row.scoreRank = row.rank;
  });
  return rows;
}

function buildWeeklyKickerRows(workbookRows) {
  const week = selectedSiteWeek() || 1;
  const rows = (state.data?.teams || []).map((team) => {
    const madden = maddenKickerForTeam(team.team);
    const workbook = workbookRows.find((row) => normalizeTeamName(row.team) === normalizeTeamName(team.team)) || {};
    const opponent = scheduleOpponent(team.team, week);
    const tier = kickerStadiumTiers[team.team] ?? 0;
    const rating = Number.isFinite(Number(madden?.ovr)) ? Number(madden.ovr) : num(workbook.rating, 68);
    const score = 5.6 + ((rating - 68) * 0.08) + ((num(team.offenseAverage, 84) - 84) * 0.05) + (tier * 0.75);
    const row = {
      ...workbook,
      position: "Kicker",
      player: madden?.player || `${team.teamAbbrev || team.team} Kicker`,
      team: team.team,
      opponent,
      rating,
      extras: {
        ...(workbook.extras || {}),
        "Madden K Rating": rating,
        "Kicker Stadium Tier": tier,
        "Team Offense": Number(num(team.offenseAverage, 84).toFixed(1)),
        "Stat Source": madden ? "Madden + stadium tier" : "Fallback + stadium tier",
      },
    };
    const generatedScore = Number(Math.max(0, score).toFixed(1));
    row.score = Number.isFinite(Number(workbook.score)) ? Number(workbook.score) : generatedScore;
    row.seasonScore = Number.isFinite(Number(workbook.seasonScore)) ? Number(workbook.seasonScore) : row.score;
    row.last5Score = Number.isFinite(Number(workbook.last5Score)) ? Number(workbook.last5Score) : row.score;
    row.value = Number.isFinite(Number(workbook.value)) ? Number(workbook.value) : row.score;
    return row;
  });
  rows.forEach((row) => {
    row.rank = rankNumber(rows, (item) => item.score, row);
    row.scoreRank = row.rank;
  });
  return rows;
}

function weeklyFantasyPlayerPool(position, workbookRows) {
  if (position === "QB") return buildWeeklyQbRows(workbookRows);
  if (["RB", "WR", "TE"].includes(position)) return buildWeeklySkillRows(position, workbookRows);
  if (position === "Defense") return buildWeeklyDefenseRows(workbookRows);
  if (position === "Kicker") return buildWeeklyKickerRows(workbookRows);
  const workbookByName = new Map(workbookRows.map((row) => [fantasyMergeKey(row.player), row]));
  return state.players
    .filter((player) => groupPosition(player.position) === position || player.position === position)
    .map((player) => {
      const workbook = workbookByName.get(fantasyMergeKey(player.player)) || {};
      return {
        ...workbook,
        player: player.player,
        position,
        team: player.team,
        opponent: workbook.opponent || "",
        rating: Number.isFinite(Number(workbook.rating)) ? workbook.rating : player.rating,
        depth: player.depth,
        _playerKey: sourceKey(player),
      };
    });
}

function fantasyBoardRows(kind, position, workbookRows) {
  return kind === "weekly" ? weeklyFantasyPlayerPool(position, workbookRows) : workbookRows;
}

function fantasySortValue(row, key) {
  if (key === "name") return String(row.player || row.team || "");
  if (key === "team") return String(row.team || "");
  if (key === "opponent") return String(row.opponent || "");
  if (String(key || "").startsWith("extra:")) return fantasyDetailValue(row, String(key).slice(6));
  if (key === "rank") return num(row.rank, 9999);
  if (key === "scoreRank") return num(row.scoreRank, 9999);
  if (key === "adp") return num(row.adp, 9999);
  if (key === "value") return num(row.value, -9999);
  if (key === "rating") return num(row.rating, -9999);
  if (key === "depth") return num(row.depth, 9999);
  if (key === "seasonScore") return num(row.seasonScore, -9999);
  if (key === "last5Score") return num(row.last5Score, -9999);
  return num(row.score, -9999);
}

function fantasySortedRows(rows, sortKey, direction = "") {
  const ascending = direction ? direction === "asc" : ["rank", "scoreRank", "adp"].includes(sortKey);
  return [...rows].sort((a, b) => {
    const aValue = fantasySortValue(a, sortKey);
    const bValue = fantasySortValue(b, sortKey);
    const aNumber = Number(aValue);
    const bNumber = Number(bValue);
    const delta = Number.isFinite(aNumber) && Number.isFinite(bNumber)
      ? aNumber - bNumber
      : String(aValue ?? "").localeCompare(String(bValue ?? ""));
    if (delta) return ascending ? delta : -delta;
    return String(a.player || a.team || "").localeCompare(String(b.player || b.team || ""));
  });
}

function fantasyCell(value, values, reverse = false, digits = 1) {
  const numeric = values.filter((item) => Number.isFinite(Number(item)));
  if (!Number.isFinite(Number(value)) || !numeric.length) {
    return `<td class="num ${fantasyIsIssue(value) ? "formula-issue" : ""}">${esc(fantasyDisplay(value, digits))}</td>`;
  }
  const min = Math.min(...numeric);
  const max = Math.max(...numeric);
  return `<td class="num cf" ${cfStyle(value, min, max, reverse)}>${esc(fantasyDisplay(value, digits))}</td>`;
}

function fantasyCellWithClass(value, values, reverse = false, digits = 1, cls = "") {
  const numeric = values.filter((item) => Number.isFinite(Number(item)));
  if (!Number.isFinite(Number(value)) || !numeric.length) {
    return `<td class="num ${cls} ${fantasyIsIssue(value) ? "formula-issue" : ""}">${esc(fantasyDisplay(value, digits))}</td>`;
  }
  const min = Math.min(...numeric);
  const max = Math.max(...numeric);
  return `<td class="num cf ${cls}" ${cfStyle(value, min, max, reverse)}>${esc(fantasyDisplay(value, digits))}</td>`;
}

function fantasyExtras(row) {
  return Object.entries(row.extras || {})
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .slice(0, 7)
    .map(([label, value]) => `<span><b>${esc(label)}</b>${esc(fantasyDisplay(value, Number.isFinite(Number(value)) && Math.abs(Number(value)) < 10 ? 1 : 0))}</span>`)
    .join("");
}

function fantasyDetailValue(row, label) {
  const direct = row.extras?.[label];
  if (direct !== undefined) return direct;
  const wanted = String(label || "").replace(/\s+/g, " ").trim().toLowerCase();
  const found = Object.entries(row.extras || {}).find(([key]) => String(key || "").replace(/\s+/g, " ").trim().toLowerCase() === wanted);
  return found?.[1];
}

function fantasyColumnTip(label, key) {
  const normalized = String(key || label || "").replace(/\s+/g, " ").trim();
  const tips = {
    compareSelect: "Mark this row for player comparison.",
    scoreRank: "Rank of the projected weekly score among this position.",
    score: "Projected fantasy points from rating, depth, matchup, team context, and QB stat history.",
    seasonScore: "Same formula using season production only.",
    last5Score: "Same formula using last-five-games-played production only.",
    name: "Player from the current app depth chart pool.",
    team: "Current team from the app depth chart.",
    opponent: "Opponent from the selected Sim Schedule week.",
    rating: "Current app player rating from Depth Charts.",
    depth: "Current depth-chart spot; injured players fall out of normal depth.",
    last5Score: "Projected score using last-five-games-played stat inputs.",
    value: "Projected score divided by salary when salary exists; otherwise score.",
  };
  const extraTips = {
    "extra:Opp vQB Rating": "Opponent vQB rating from defensive position groups.",
    "extra:Matchup Rating (Low is good)": "League rank of opponent vQB rating; 1 is the easiest QB matchup.",
    "extra:Stat vQB Rank": "TeamRankings pass-defense rank; 1 is the easiest QB matchup.",
    "extra:Player Rating Rank": "Rank of this QB rating among all QBs in this view.",
    "extra:OL Rank": "Rank of this QB team's O-line rating against the league.",
    "extra:PPG Rank": "Rank of this QB team's scoring offense from TeamRankings/offense rating.",
    "extra:WR Group Rank": "Rank of this QB team's WR group rating against the league.",
    "extra:Games Played": "Footballguys games with non-zero QB stat lines.",
    "extra:Typical Pass Yards": "Average pass yards from Footballguys, skipping games not played.",
    "extra:Pass Yards Bonus Score": "Pass-yard average divided by 100, then multiplied by 2.",
    "extra:Typical Pass TDs": "Average passing TDs from Footballguys, skipping games not played.",
    "extra:Pass TDs Bonus Score": "Passing TD average multiplied by 1.5.",
    "extra:Typical Rush Attempts": "Average QB rush attempts from Footballguys games played.",
    "extra:Typical Rush Attempts Bonus Score": "Rush-attempt average divided by 3.",
    "extra:Typical Rush TDs": "Average QB rush TDs from Footballguys games played.",
    "extra:Typical Rush TDs Bonus Score": "Rush TD average multiplied by 4.",
    "extra:Total Bonuses\n=sum(AC2,AI2,AO2,AU2)": "Sum of the passing and rushing bonus score columns.",
    "extra:Total Bonuses RANK": "League rank of total QB bonus score.",
    "extra:Value Rank": "Rank of value among QBs in this view.",
    "extra:Stat Source": "Footballguys when scanned game logs exist; fallback otherwise.",
    "extra:!!LAST 5!! Typical Pass Yards": "Average pass yards over the last five games actually played.",
    "extra:!!LAST 5!! Pass Yards Bonus Score": "Last-five pass-yard average divided by 100, then multiplied by 2.",
    "extra:!!LAST 5!! Typical Pass TDs": "Average pass TDs over the last five games actually played.",
    "extra:!!LAST 5!! Typical Pass TDs Bonus Score": "Last-five pass TD average multiplied by 1.5.",
    "extra:!!LAST 5!! Typical Rush Attempts": "Average rush attempts over the last five games actually played.",
    "extra:!!LAST 5!! Typical Rush Attempts Bonus Score": "Last-five rush-attempt average divided by 3.",
    "extra:!!LAST 5!! Typical Rush TDs": "Average rush TDs over the last five games actually played.",
    "extra:!!LAST 5!! Typical Rush TDs Bonus Score": "Last-five rush TD average multiplied by 4.",
    "extra:!!LAST 5!!\nTotal Bonuses": "Sum of the last-five passing and rushing bonus score columns.",
    "extra:!!LAST 5!!\nTotal Bonuses RANK": "League rank of last-five total bonus score.",
  };
  return extraTips[normalized] || tips[normalized] || "Click to sort this column.";
}

function fantasyColumn(label, key, cls = "", opts = {}) {
  return { label, key, cls, tip: opts.tip || fantasyColumnTip(label, key), group: opts.group || "", sortDir: opts.sortDir || "", ...opts };
}

function fantasyCompareKey(row) {
  return row._playerKey || `${row.position || ""}|${row.team || ""}|${row.player || row.team || ""}`;
}

function fantasyCompareCell(row) {
  const key = fantasyCompareKey(row);
  const active = state.weeklyFantasyCompareKeys.includes(key);
  return `<button class="compare-toggle ${active ? "active" : ""}" data-compare-key="${esc(key)}" title="${active ? "Remove from comparison" : "Add to comparison"}">${active ? "-" : "+"}</button>`;
}

function fantasyColumns(kind, position, view) {
  if (kind === "season") {
    if (position === "Defense") {
      return [
        fantasyColumn("Rank", "rank", "num", { digits: 0, reverse: true }),
        fantasyColumn("Team", "name", "sticky-name"),
        fantasyColumn("Score", "score", "num cf", { heat: true }),
        fantasyColumn("Value", "value", "num cf", { heat: true }),
        fantasyColumn("Defense", "extra:Defense Rating", "num cf", { heat: true, reverse: true }),
        fantasyColumn("Opp Avg", "extra:Opp Offenses", "num cf", { heat: true }),
        fantasyColumn("Weeks", "seasonWeeks"),
      ];
    }
    return [
      fantasyColumn("Rank", "rank", "num", { digits: 0, reverse: true }),
      fantasyColumn("Player", "name", "sticky-name"),
      fantasyColumn("Team", "team"),
      fantasyColumn("Score", "score", "num cf", { heat: true }),
      fantasyColumn("Value", "value", "num cf", { heat: true }),
      fantasyColumn("ADP", "adp", "num", { digits: 0, reverse: true }),
      fantasyColumn("Rating", "rating", "num cf", { heat: true, digits: 0 }),
      fantasyColumn("Depth", "depth", "num", { digits: 0, reverse: true }),
      fantasyColumn("Context", "seasonContext"),
    ];
  }
  if (view === "last5") {
    if (position === "Defense") {
      return [
        fantasyColumn("Rank", "scoreRank", "num", { digits: 0, reverse: true }),
        fantasyColumn("Team", "name", "sticky-name"),
        fantasyColumn("Opp", "opponent"),
        fantasyColumn("Score", "score", "num cf", { heat: true }),
        fantasyColumn("Defense", "rating", "num cf", { heat: true, reverse: true }),
        fantasyColumn("Opp QB", "extra:Opp QB Rating", "num cf", { heat: true, reverse: true }),
        fantasyColumn("Opp Off", "extra:Opponent Off Rating", "num cf", { heat: true }),
        fantasyColumn("Value", "value", "num cf", { heat: true }),
      ];
    }
    return [
      fantasyColumn("", "compareSelect", "compare-col", { group: "Player", noSort: true }),
      fantasyColumn("Rk", "scoreRank", "rank-col cf", { group: "Player", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn(position === "Defense" ? "Team" : "Player", "name", "sticky-name", { group: "Player", sortDir: "asc" }),
      fantasyColumn("Team", "team", "", { group: "Player", sortDir: "asc" }),
      fantasyColumn("Opp", "opponent", "", { group: "Player", sortDir: "asc" }),
      fantasyColumn("Last 5", "last5Score", "num cf", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Season", "seasonScore", "num cf", { group: "Score", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("Blend", "score", "num cf", { group: "Score", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("Last 5 Rk", "last5Rank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("vQB", "extra:Opp vQB Rating", "num cf", { group: "Matchup", heat: true, reverse: true, positions: ["QB"], sortDir: "asc" }),
      fantasyColumn("vQB Rk", "extra:Matchup Rating (Low is good)", "num cf rank-col", { group: "Matchup", heat: true, digits: 0, reverse: true, positions: ["QB"], sortDir: "asc" }),
      fantasyColumn("Stat vQB Rk", "extra:Stat vQB Rank", "num cf rank-col", { group: "Matchup", heat: true, digits: 0, reverse: true, positions: ["QB"], sortDir: "asc" }),
      fantasyColumn("Games", "extra:Games Played", "num rank-col", { group: "Production", digits: 0, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("PYds", "extra:!!LAST 5!! Typical Pass Yards", "num cf", { group: "Production", heat: true, digits: 0, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("PYds Bonus", "extra:!!LAST 5!! Pass Yards Bonus Score", "num cf", { group: "Bonuses", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("PTD", "extra:!!LAST 5!! Typical Pass TDs", "num cf", { group: "Production", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("PTD Bonus", "extra:!!LAST 5!! Typical Pass TDs Bonus Score", "num cf", { group: "Bonuses", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("Rush Att", "extra:!!LAST 5!! Typical Rush Attempts", "num cf", { group: "Production", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("Rush Bonus", "extra:!!LAST 5!! Typical Rush Attempts Bonus Score", "num cf", { group: "Bonuses", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("Rush TD", "extra:!!LAST 5!! Typical Rush TDs", "num cf", { group: "Production", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("Rush TD Bonus", "extra:!!LAST 5!! Typical Rush TDs Bonus Score", "num cf", { group: "Bonuses", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("Bonus", "extra:!!LAST 5!!\nTotal Bonuses", "num cf", { group: "Bonuses", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("Bonus Rk", "extra:!!LAST 5!!\nTotal Bonuses RANK", "num cf rank-col", { group: "Bonuses", heat: true, digits: 0, reverse: true, positions: ["QB"], sortDir: "asc" }),
      fantasyColumn("Source", "extra:Stat Source", "", { group: "Source", positions: ["QB"], sortDir: "asc" }),
    ].filter((col) => !col.positions || col.positions.includes(position));
  }
  if (position === "QB") {
    const base = [
      fantasyColumn("", "compareSelect", "compare-col", { group: "Player", noSort: true }),
      fantasyColumn("Rk", "scoreRank", "rank-col cf", { group: "Player", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Player", "name", "sticky-name", { group: "Player", sortDir: "asc" }),
      fantasyColumn("Team", "team", "", { group: "Player", sortDir: "asc" }),
      fantasyColumn("Opp", "opponent", "", { group: "Player", sortDir: "asc" }),
      fantasyColumn("Score", "score", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Season", "seasonScore", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Last 5", "last5Score", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Score Rk", "scoreRank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("vQB", "extra:Opp vQB Rating", "num cf", { group: "Matchup", heat: true, reverse: true, sortDir: "asc" }),
      fantasyColumn("vQB Rk", "extra:Matchup Rating (Low is good)", "num cf rank-col", { group: "Matchup", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Stat vQB Rk", "extra:Stat vQB Rank", "num cf rank-col", { group: "Matchup", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Player Rt", "rating", "num cf", { group: "Talent", heat: true, digits: 0, sortDir: "desc" }),
      fantasyColumn("Player Rk", "extra:Player Rating Rank", "num cf rank-col", { group: "Talent", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Depth", "depth", "num cf rank-col", { group: "Talent", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("OL Rk", "extra:OL Rank", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("PPG Rk", "extra:PPG Rank", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("WR Rk", "extra:WR Group Rank", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Games", "extra:Games Played", "num rank-col", { group: "Production", digits: 0, sortDir: "desc" }),
      fantasyColumn("PYds", "extra:Typical Pass Yards", "num cf", { group: "Production", heat: true, digits: 0, sortDir: "desc" }),
      fantasyColumn("PTD", "extra:Typical Pass TDs", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("Rush Att", "extra:Typical Rush Attempts", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("Rush TD", "extra:Typical Rush TDs", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("PYds Bonus", "extra:Pass Yards Bonus Score", "num cf", { group: "Bonuses", heat: true, sortDir: "desc" }),
      fantasyColumn("PTD Bonus", "extra:Pass TDs Bonus Score", "num cf", { group: "Bonuses", heat: true, sortDir: "desc" }),
      fantasyColumn("Rush Bonus", "extra:Typical Rush Attempts Bonus Score", "num cf", { group: "Bonuses", heat: true, sortDir: "desc" }),
      fantasyColumn("Rush TD Bonus", "extra:Typical Rush TDs Bonus Score", "num cf", { group: "Bonuses", heat: true, sortDir: "desc" }),
      fantasyColumn("Bonus", "extra:Total Bonuses\n=sum(AC2,AI2,AO2,AU2)", "num cf", { group: "Bonuses", heat: true, sortDir: "desc" }),
      fantasyColumn("Bonus Rk", "extra:Total Bonuses RANK", "num cf rank-col", { group: "Bonuses", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Source", "extra:Stat Source", "", { group: "Source", sortDir: "asc" }),
    ];
    return base;
  }
  if (position === "Defense") {
    return [
      fantasyColumn("Rank", "scoreRank", "num", { digits: 0, reverse: true }),
      fantasyColumn("Team", "name", "sticky-name"),
      fantasyColumn("Opp", "opponent"),
      fantasyColumn("Score", "score", "num cf", { heat: true }),
      fantasyColumn("Defense", "rating", "num cf", { heat: true, reverse: true }),
      fantasyColumn("Opp QB", "extra:Opp QB Rating", "num cf", { heat: true, reverse: true }),
      fantasyColumn("Opp Off", "extra:Opponent Off Rating", "num cf", { heat: true }),
      fantasyColumn("Value", "value", "num cf", { heat: true }),
    ];
  }
  return [
    fantasyColumn("", "compareSelect", "compare-col", { group: "Player", noSort: true }),
    fantasyColumn("Rk", "scoreRank", "rank-col cf", { group: "Player", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
    fantasyColumn(position === "Defense" ? "Team" : "Player", "name", "sticky-name", { group: "Player", sortDir: "asc" }),
    fantasyColumn("Team", "team", "", { group: "Player", sortDir: "asc" }),
    fantasyColumn("Opp", "opponent", "", { group: "Player", sortDir: "asc" }),
    fantasyColumn("Score", "score", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
    fantasyColumn("Score Rk", "scoreRank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
    fantasyColumn("Rating", "rating", "num cf", { group: "Talent", heat: true, digits: 0, sortDir: "desc" }),
    fantasyColumn("Rating Rk", "extra:Player Rating Rank", "num cf rank-col", { group: "Talent", heat: true, digits: 0, reverse: true, sortDir: "asc", positions: ["RB", "WR", "TE"] }),
    fantasyColumn("Depth", "depth", "num cf rank-col", { group: "Talent", heat: true, digits: 0, reverse: true, sortDir: "asc", positions: ["RB", "WR", "TE"] }),
    fantasyColumn("Matchup", "extra:Matchup Rating", "num cf", { group: "Matchup", heat: true, reverse: true, positions: ["RB", "WR", "TE"], sortDir: "asc" }),
    fantasyColumn("Match Rk", "extra:Matchup Rank", "num cf rank-col", { group: "Matchup", heat: true, digits: 0, reverse: true, positions: ["RB", "WR", "TE"], sortDir: "asc" }),
    fantasyColumn("Team Ctx", "extra:Team Context", "num cf", { group: "Team Context", heat: true, positions: ["RB", "WR", "TE"], sortDir: "desc" }),
    fantasyColumn("Ctx Rk", "extra:Team Context Rank", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, reverse: true, positions: ["RB", "WR", "TE"], sortDir: "asc" }),
    fantasyColumn("Source", "extra:Stat Source", "", { group: "Source", positions: ["Kicker"], sortDir: "asc" }),
    fantasyColumn("Stadium", "extra:Kicker Stadium Tier", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, positions: ["Kicker"], sortDir: "desc" }),
    fantasyColumn("Details", "compactDetails", "", { group: "Details", noSort: true }),
  ].filter((col) => !col.positions || col.positions.includes(position));
}

function fantasyValue(row, key, position) {
  if (key === "compareSelect") return fantasyCompareCell(row);
  if (key === "name") return fantasyRowName(row, position);
  if (key === "team") return row.team ? teamCellFull(row.team) : "-";
  if (key === "opponent") return row.opponent ? teamCellFull(row.opponent) : "-";
  if (key === "seasonContext") {
    return `<div class="fantasy-extra-chips compact">${["OL Rank", "PPG Rank", "QB Rating", "QB Rank", "WR Group Rank"].map((label) => {
      const value = fantasyDetailValue(row, label);
      return value === null || value === undefined || value === "" ? "" : `<span><b>${esc(label)}</b>${esc(fantasyDisplay(value, 1))}</span>`;
    }).join("")}</div>`;
  }
  if (key === "seasonWeeks") {
    return `<div class="fantasy-extra-chips compact">${["Week 1", "Week 2", "Week 3", "Week 4"].map((label) => {
      const value = fantasyDetailValue(row, label);
      return value ? `<span><b>${esc(label)}</b>${esc(value)}</span>` : "";
    }).join("")}</div>`;
  }
  if (key === "compactDetails") return `<div class="fantasy-extra-chips compact">${fantasyExtras(row)}</div>`;
  if (key.startsWith("extra:")) return fantasyDetailValue(row, key.slice(6));
  return row[key];
}

function fantasyPlainValue(row, column, position) {
  if (column.key === "compareSelect") return "";
  if (column.key === "name") return position === "Defense" ? (row.team || "") : (row.player || "");
  if (column.key === "team") return row.team || "";
  if (column.key === "opponent") return row.opponent || "";
  if (column.key.startsWith("extra:")) return fantasyDetailValue(row, column.key.slice(6));
  return row[column.key];
}

function fantasyGroupClass(group) {
  const slug = String(group || "ungrouped").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ungrouped";
  return `group-${slug}`;
}

function fantasyColumnWidth(column, rows, position) {
  const longest = Math.max(
    String(column.label || "").length,
    ...rows.map((row) => String(fantasyPlainValue(row, column, position) ?? "").length)
  );
  if (column.key === "name") return 178;
  if (column.key === "compareSelect") return 36;
  if (column.key === "team" || column.key === "opponent") return Math.max(142, Math.min(190, Math.round(longest * 5.8) + 32));
  if (column.cls?.includes("rank-col")) return 42;
  if (column.cls?.includes("score-col")) return 68;
  if (column.cls?.includes("num")) return Math.max(50, Math.min(84, Math.round(longest * 6.4) + 14));
  return Math.max(90, Math.min(220, Math.round(longest * 6.2) + 28));
}

function fantasyHeaderGroups(columns) {
  const groups = [];
  columns.forEach((column, index) => {
    const label = column.group || "";
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.span += 1;
    else groups.push({ label, span: 1, start: index });
  });
  return groups.map((group, index) => `<th class="fantasy-group-head ${fantasyGroupClass(group.label)} ${index > 0 ? "group-start" : ""}" colspan="${group.span}">${esc(group.label)}</th>`).join("");
}

function fantasyGroupStartClasses(columns) {
  const starts = new Set();
  let previous = "";
  columns.forEach((column, index) => {
    const group = column.group || "";
    if (index > 0 && group !== previous) starts.add(index);
    previous = group;
  });
  return starts;
}

function fantasySortIndicator(column, activeSort, direction) {
  if (column.key !== activeSort) return "";
  return `<span class="sort-mark">${direction === "asc" ? "^" : "v"}</span>`;
}

function fantasyRankTable(columns, rows, allRows, position, activeSort = "", direction = "") {
  const widths = columns.map((column) => fantasyColumnWidth(column, rows.length ? rows : allRows, position));
  const groupStarts = fantasyGroupStartClasses(columns);
  return `
    <table class="fantasy-board-table" style="min-width:${widths.reduce((sum, width) => sum + width, 0)}px">
      <colgroup>${widths.map((width) => `<col style="width:${width}px" />`).join("")}</colgroup>
      <thead>
        <tr class="fantasy-group-row">${fantasyHeaderGroups(columns)}</tr>
        <tr>${columns.map((column, index) => `<th class="${column.cls || ""} ${fantasyGroupClass(column.group)} ${groupStarts.has(index) ? "group-start" : ""} ${index === 0 ? "frozen-compare" : ""} ${index === 1 ? "frozen-rank" : ""} ${index === 2 && column.key === "name" ? "frozen-name" : ""}">
          ${column.noSort ? `<span class="fantasy-sort-header static" title="${esc(column.tip || "")}">${esc(column.label)}</span>` : `<button class="fantasy-sort-header" data-sort-key="${esc(column.key)}" data-sort-dir="${esc(column.sortDir || "")}" title="${esc(column.tip || "Click to sort this column.")}">
            <span>${esc(column.label)}</span>${fantasySortIndicator(column, activeSort, direction)}
          </button>`}
        </th>`).join("")}</tr>
      </thead>
      <tbody>${rows.map((row) => `<tr>${columns.map((column, index) => fantasyTd(row, column, allRows, position, index, groupStarts.has(index))).join("")}</tr>`).join("")}</tbody>
    </table>
  `;
}

function fantasyTd(row, column, allRows, position, index = -1, groupStart = false) {
  const value = fantasyValue(row, column.key, position);
  const freezeClass = `${index === 0 ? " frozen-compare" : ""}${index === 1 ? " frozen-rank" : ""}${index === 2 && column.key === "name" ? " frozen-name" : ""}`;
  const groupClass = ` ${fantasyGroupClass(column.group)}${groupStart ? " group-start" : ""}`;
  if (column.key === "compareSelect" || column.key === "name" || column.key === "team" || column.key === "opponent" || column.key === "seasonContext" || column.key === "seasonWeeks" || column.key === "compactDetails") {
    return `<td class="${column.cls || ""}${freezeClass}${groupClass}">${value || "-"}</td>`;
  }
  const values = allRows.map((item) => fantasyValue(item, column.key, position));
  if (column.heat) return fantasyCellWithClass(value, values, Boolean(column.reverse), column.digits ?? 1, `${column.cls || ""}${freezeClass}${groupClass}`);
  return `<td class="${column.cls || ""}${freezeClass}${groupClass} ${fantasyIsIssue(value) ? "formula-issue" : ""}">${esc(fantasyDisplay(value, column.digits ?? 1))}</td>`;
}

function wireFantasyScroll() {
  document.querySelectorAll(".fantasy-rank-scroll").forEach((el) => {
    el.addEventListener("wheel", (event) => {
      const canScrollX = el.scrollWidth > el.clientWidth;
      if (!canScrollX) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        el.scrollLeft += event.deltaX;
        event.preventDefault();
      } else if (event.shiftKey) {
        el.scrollLeft += event.deltaY;
        event.preventDefault();
      }
    }, { passive: false });
    let dragging = false;
    let startX = 0;
    let startLeft = 0;
    el.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest("button,select,input,a")) return;
      dragging = true;
      startX = event.clientX;
      startLeft = el.scrollLeft;
      el.classList.add("dragging");
      el.setPointerCapture?.(event.pointerId);
    });
    el.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      el.scrollLeft = startLeft - (event.clientX - startX);
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach((name) => el.addEventListener(name, () => {
      dragging = false;
      el.classList.remove("dragging");
    }));
  });
}

function wireFantasyColumnSort(sortKey, directionKey, columns) {
  const byKey = new Map(columns.map((column) => [column.key, column]));
  document.querySelectorAll(".fantasy-sort-header").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.sortKey;
      const column = byKey.get(key);
      if (!key) return;
      if (state[sortKey] === key) {
        state[directionKey] = state[directionKey] === "asc" ? "desc" : "asc";
      } else {
        state[sortKey] = key;
        state[directionKey] = column?.sortDir || (column?.reverse ? "asc" : "desc");
      }
      render();
    });
  });
}

function wireFantasyCompare() {
  document.querySelectorAll(".compare-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.compareKey;
      if (!key) return;
      const set = new Set(state.weeklyFantasyCompareKeys);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      state.weeklyFantasyCompareKeys = [...set];
      storage.set("nflz-weekly-compare-keys", state.weeklyFantasyCompareKeys);
      render();
    });
  });
  document.querySelector("#weekly-compare-only")?.addEventListener("click", () => {
    state.weeklyFantasyCompareOnly = !state.weeklyFantasyCompareOnly;
    render();
  });
  document.querySelector("#weekly-compare-clear")?.addEventListener("click", () => {
    state.weeklyFantasyCompareKeys = [];
    state.weeklyFantasyCompareOnly = false;
    storage.set("nflz-weekly-compare-keys", state.weeklyFantasyCompareKeys);
    render();
  });
}

function wireWeeklyQbFormulaControls() {
  document.querySelector("#weekly-qb-toggle-controls")?.addEventListener("click", () => {
    state.weeklyQbControlsOpen = !state.weeklyQbControlsOpen;
    storage.set("nflz-weekly-qb-controls-open", state.weeklyQbControlsOpen);
    render();
  });
  document.querySelectorAll("[data-qb-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.qbOption;
      if (key === "useLast5" && !state.weeklyQbOptions.useProduction) return;
      state.weeklyQbOptions[key] = !state.weeklyQbOptions[key];
      if (key === "useProduction" && !state.weeklyQbOptions.useProduction) {
        state.weeklyQbOptions.useLast5 = false;
      }
      state.weeklyQbDefaultMessage = "";
      storage.set("nflz-weekly-qb-options", state.weeklyQbOptions);
      render();
    });
  });
  document.querySelectorAll("[data-qb-weight]").forEach((input) => {
    input.addEventListener("input", () => {
      state.weeklyQbWeights[input.dataset.qbWeight] = Number(input.value);
      state.weeklyQbDefaultMessage = "";
      storage.set("nflz-weekly-qb-weights", state.weeklyQbWeights);
      const valueLabel = input.closest(".formula-slider")?.querySelector("b");
      if (valueLabel) valueLabel.textContent = `${input.value}%`;
    });
    input.addEventListener("change", () => {
      state.weeklyQbWeights[input.dataset.qbWeight] = Number(input.value);
      state.weeklyQbDefaultMessage = "";
      storage.set("nflz-weekly-qb-weights", state.weeklyQbWeights);
      render();
    });
  });
  document.querySelector("#weekly-qb-set-default")?.addEventListener("click", () => {
    const options = { ...defaultWeeklyQbOptions, ...state.weeklyQbOptions };
    const weights = { ...defaultWeeklyQbWeights, ...state.weeklyQbWeights };
    storage.set("nflz-weekly-qb-default-options", options);
    storage.set("nflz-weekly-qb-default-weights", weights);
    state.weeklyQbOptions = { ...options };
    state.weeklyQbWeights = { ...weights };
    state.weeklyQbDefaultMessage = "Default saved";
    storage.set("nflz-weekly-qb-options", state.weeklyQbOptions);
    storage.set("nflz-weekly-qb-weights", state.weeklyQbWeights);
    render();
  });
  document.querySelector("#weekly-qb-reset-formula")?.addEventListener("click", () => {
    state.weeklyQbOptions = weeklyQbDefaultOptions();
    state.weeklyQbWeights = weeklyQbDefaultWeights();
    state.weeklyQbDefaultMessage = "Reset to default";
    storage.set("nflz-weekly-qb-options", state.weeklyQbOptions);
    storage.set("nflz-weekly-qb-weights", state.weeklyQbWeights);
    render();
  });
}

function renderFantasyRanks(kind) {
  const isWeekly = kind === "weekly";
  const positionKey = isWeekly ? "weeklyFantasyPosition" : "seasonFantasyPosition";
  const viewKey = isWeekly ? "weeklyFantasyView" : "seasonFantasyView";
  const sortKey = isWeekly ? "weeklyFantasySort" : "seasonFantasySort";
  const directionKey = isWeekly ? "weeklyFantasySortDirection" : "seasonFantasySortDirection";
  const limitKey = isWeekly ? "weeklyFantasyLimit" : "seasonFantasyLimit";
  const titleText = isWeekly ? "Weekly Fantasy Rankings" : "Season Long Fantasy Ranks";
  const positions = fantasyRankPositions(kind);
  if (!positions.includes(state[positionKey])) state[positionKey] = positions[0] || "QB";
  const isWeeklyQb = isWeekly && state[positionKey] === "QB";
  const item = fantasyRankBundle(kind)[state[positionKey]] || { rows: [] };
  const sortOptions = isWeekly
    ? [["score", "Score"], ["scoreRank", "Score Rank"], ["last5Score", "Last 5 Score"], ["value", "Value"], ["rating", "Player Rating"], ["depth", "Depth"]]
    : [["rank", "Rank"], ["score", "Score"], ["value", "Value"], ["adp", "ADP"], ["rating", "Player Rating"], ["depth", "Depth"]];
  const limits = [50, 75, 100, 150, 250, 500];
  const sourceRows = fantasyBoardRows(kind, state[positionKey], item.rows || []);
  const compareSet = new Set(state.weeklyFantasyCompareKeys);
  const comparedRows = isWeekly && state.weeklyFantasyCompareOnly ? sourceRows.filter((row) => compareSet.has(fantasyCompareKey(row))) : sourceRows;
  const filtered = comparedRows.filter((row) => !state.query || [row.player, row.team, row.opponent, row.position, Object.values(row.extras || {}).join(" ")].join(" ").toLowerCase().includes(state.query));
  const rows = fantasySortedRows(filtered, state[sortKey], state[directionKey]).slice(0, Number(state[limitKey]));
  const activeView = isWeeklyQb ? "regular" : isWeekly ? state[viewKey] : "regular";
  const columns = fantasyColumns(kind, state[positionKey], activeView);
  const weekLabel = isWeekly ? esc(siteWeekLabel()) : "";
  const formulaNote = item.scoreFormulaSample ? item.scoreFormulaSample : "No score formula was stored in the exported sample for this sheet.";
  setTimeout(() => {
    wireSelect(`${kind}-fantasy-position`, positionKey);
    wireSelect(`${kind}-fantasy-view`, viewKey);
    wireSelect(`${kind}-fantasy-sort`, sortKey);
    wireSelect(`${kind}-fantasy-limit`, limitKey);
    wireFantasyColumnSort(sortKey, directionKey, columns);
    document.querySelectorAll(".player-open").forEach((button) => button.addEventListener("click", () => {
      state.selectedPlayerKey = button.dataset.playerKey;
      render();
    }));
    wirePlayerModalControls();
    document.querySelector("#scan-team-rankings")?.addEventListener("click", scanTeamRankings);
    document.querySelector("#scan-snaps-stats")?.addEventListener("click", scanSnapsStats);
    document.querySelector("#scan-weekly-sources")?.addEventListener("click", scanWeeklyFantasySources);
    document.querySelector("#snaps-stats-search")?.addEventListener("input", (event) => {
      state.snapsStatsQuery = event.target.value;
      render();
      setTimeout(() => {
        const input = document.querySelector("#snaps-stats-search");
        input?.focus();
        input?.setSelectionRange(input.value.length, input.value.length);
      });
    });
    wireFantasyCompare();
    if (isWeeklyQb) wireWeeklyQbFormulaControls();
    wireFantasyScroll();
  });
  return `
    <section class="panel fantasy-rank-panel">
      <div class="toolbar fantasy-rank-toolbar">
        <div>
          <h2>${titleText}${weekLabel ? ` <span>${weekLabel}</span>` : ""}</h2>
          <p>${esc(item.sheet || "")} from ${esc(window.FANTASY_RANKINGS?.source || "2026 NFL Model Z.xlsx")}.</p>
        </div>
        <div class="filters">
          ${isWeekly ? `<button id="scan-team-rankings" class="mini-action primary" ${state.teamRankingsScanStatus === "checking" ? "disabled" : ""}>Scan Team Rankings</button>` : ""}
          ${isWeekly ? `<button id="scan-snaps-stats" class="mini-action" ${state.snapsStatsScanStatus === "checking" ? "disabled" : ""}>Scan Snaps & Stats</button>` : ""}
          ${isWeekly ? `<button id="scan-weekly-sources" class="mini-action" ${state.teamRankingsScanStatus === "checking" || state.snapsStatsScanStatus === "checking" ? "disabled" : ""}>Run Both Scans</button>` : ""}
          ${isWeekly ? `<button id="weekly-compare-only" class="mini-action ${state.weeklyFantasyCompareOnly ? "primary" : ""}" ${state.weeklyFantasyCompareKeys.length ? "" : "disabled"}>${state.weeklyFantasyCompareOnly ? "Show All" : `Selected Only (${state.weeklyFantasyCompareKeys.length})`}</button>` : ""}
          ${isWeekly ? `<button id="weekly-compare-clear" class="mini-action" ${state.weeklyFantasyCompareKeys.length ? "" : "disabled"}>Clear Compare</button>` : ""}
          ${optionSelect(`${kind}-fantasy-position`, state[positionKey], positions)}
          ${isWeekly && !isWeeklyQb ? optionSelect(`${kind}-fantasy-view`, state[viewKey], [["regular", "Regular"], ["last5", "Last 5"]]) : ""}
          ${!isWeeklyQb ? optionSelect(`${kind}-fantasy-sort`, state[sortKey], sortOptions) : ""}
          ${select(`${kind}-fantasy-limit`, state[limitKey], limits)}
        </div>
      </div>
      ${isWeekly ? `<div class="scan-strip">${teamRankingsStatusNote()}${snapsStatsStatusNote()}</div>` : ""}
      ${isWeeklyQb ? renderWeeklyQbFormulaControls() : ""}
      <div class="table-scroll fantasy-rank-scroll">
        ${fantasyRankTable(columns, rows, filtered, state[positionKey], state[sortKey], state[directionKey])}
      </div>
      ${isWeeklyQb ? renderSnapsStatsPreview() : ""}
      <section class="formula-card hidden-workbook-logic">
        <h3>Workbook Logic</h3>
        <p>${esc(isWeekly ? window.FANTASY_RANKINGS?.notes?.weekly : window.FANTASY_RANKINGS?.notes?.season)}</p>
        <pre class="formula">${esc(formulaNote)}</pre>
      </section>
    </section>
    ${renderPlayerModal()}
  `;
}

function statRankValue(team, key) {
  if (key === "team") return String(team.team || "");
  return num(team[key], key.endsWith("Rank") ? 999 : 0);
}

function statRankHeader(label, key, group, title = "") {
  const active = state.statRanksSort.key === key;
  const mark = active ? `<span class="sort-mark">${state.statRanksSort.direction === "asc" ? "^" : "v"}</span>` : "";
  return { label: `<button class="stat-sort-header" data-stat-sort="${esc(key)}" title="${esc(title || "Click to sort this StatRanks column.")}"><span>${esc(label)}</span>${mark}</button>`, cls: `num ${group}` };
}

function statRankCell(team, key, allRows, reverse = true, digits = 0) {
  const values = allRows.map((row) => row[key]);
  return fantasyCellWithClass(team[key], values, reverse, digits, "stat-rank-cell");
}

function renderStatRanks() {
  const scan = window.TEAM_RANKINGS_SCAN;
  const allRows = (scan?.teams || []).filter((team) => matches(team));
  const sortKey = state.statRanksSort.key || "team";
  const direction = state.statRanksSort.direction || "asc";
  const rows = [...allRows].sort((a, b) => {
    const aValue = statRankValue(a, sortKey);
    const bValue = statRankValue(b, sortKey);
    const delta = Number.isFinite(Number(aValue)) && Number.isFinite(Number(bValue)) ? Number(aValue) - Number(bValue) : String(aValue).localeCompare(String(bValue));
    return direction === "asc" ? delta : -delta;
  }).map((team) => `
    <tr>
      <td class="stat-team">${teamCellFull(team.team)}</td>
      ${statRankCell(team, "offYardsRank", allRows)}
      ${statRankCell(team, "offPointsRank", allRows)}
      ${statRankCell(team, "offStatAvg", allRows, true, 2)}
      ${statRankCell(team, "defYardsAllowedRank", allRows)}
      ${statRankCell(team, "defPointsAllowedRank", allRows)}
      ${statRankCell(team, "defStatAvg", allRows, true, 2)}
      ${statRankCell(team, "rushYardsAllowedRank", allRows)}
      ${statRankCell(team, "rushTdAllowedRank", allRows)}
      ${statRankCell(team, "rushAllowedStatAvg", allRows, true, 2)}
      ${statRankCell(team, "passYardsAllowedRank", allRows)}
      ${statRankCell(team, "passTdAllowedRank", allRows)}
      ${statRankCell(team, "passAllowedStatAvg", allRows, true, 2)}
    </tr>
  `);
  setTimeout(() => {
    document.querySelector("#scan-team-rankings")?.addEventListener("click", scanTeamRankings);
    document.querySelectorAll("[data-stat-sort]").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.statSort;
      state.statRanksSort = {
        key,
        direction: state.statRanksSort.key === key && state.statRanksSort.direction === "asc" ? "desc" : "asc",
      };
      render();
    }));
    wireFantasyScroll();
  });
  return `
    <section class="panel fantasy-rank-panel stat-ranks-panel">
      <div class="toolbar fantasy-rank-toolbar">
        <div>
          <h2>Stat Ranks</h2>
          <p>TeamRankings scan feeding offensive, defensive, rushing-allowed, and passing-allowed rank inputs. Lower ranks are better.</p>
        </div>
        <div class="filters">
          <button id="scan-team-rankings" class="mini-action primary" ${state.teamRankingsScanStatus === "checking" ? "disabled" : ""}>Scan Team Rankings</button>
        </div>
      </div>
      <div class="scan-strip">${teamRankingsStatusNote()}</div>
      <div class="table-scroll fantasy-rank-scroll stat-ranks-scroll">
        ${table([
          { label: `<button class="stat-sort-header text" data-stat-sort="team"><span>Team</span>${state.statRanksSort.key === "team" ? `<span class="sort-mark">${state.statRanksSort.direction === "asc" ? "^" : "v"}</span>` : ""}</button>` },
          statRankHeader("Off Yds", "offYardsRank", "stat-off", "TeamRankings yards per game rank."),
          statRankHeader("Off Pts", "offPointsRank", "stat-off", "TeamRankings points per game rank."),
          statRankHeader("Off Avg", "offStatAvg", "stat-off", "Average of offensive yards and points ranks."),
          statRankHeader("Def Yds", "defYardsAllowedRank", "stat-def", "Opponent yards per game rank."),
          statRankHeader("Def Pts", "defPointsAllowedRank", "stat-def", "Opponent points per game rank."),
          statRankHeader("Def Avg", "defStatAvg", "stat-def", "Average of defensive yards and points ranks."),
          statRankHeader("Rush Yds", "rushYardsAllowedRank", "stat-rush", "Opponent rushing yards per game rank."),
          statRankHeader("Rush TD", "rushTdAllowedRank", "stat-rush", "Opponent rushing touchdowns per game rank."),
          statRankHeader("Rush Avg", "rushAllowedStatAvg", "stat-rush", "Average of rushing yards and touchdowns allowed ranks."),
          statRankHeader("Pass Yds", "passYardsAllowedRank", "stat-pass", "Opponent passing yards per game rank."),
          statRankHeader("Pass TD", "passTdAllowedRank", "stat-pass", "Opponent passing touchdowns per game rank."),
          statRankHeader("Pass Avg", "passAllowedStatAvg", "stat-pass", "Average of passing yards and touchdowns allowed ranks."),
        ], rows)}
      </div>
    </section>
  `;
}

function renderStartSit() {
  const league = state.data.fantasyLeagues[state.fantasyLeague] || state.data.fantasyLeagues[0];
  const orderKey = `league-${state.fantasyLeague}`;
  const rows = savedFantasy[orderKey] || league.rows;
  setTimeout(() => {
    document.querySelector("#fantasy-league")?.addEventListener("change", (event) => {
      state.fantasyLeague = Number(event.target.value);
      render();
    });
    document.querySelectorAll("tr[draggable='true']").forEach((row) => {
      row.addEventListener("dragstart", (event) => event.dataTransfer.setData("text/plain", row.dataset.index));
      row.addEventListener("dragover", (event) => event.preventDefault());
      row.addEventListener("drop", (event) => {
        const from = Number(event.dataTransfer.getData("text/plain"));
        const to = Number(row.dataset.index);
        const next = [...rows];
        next.splice(to, 0, next.splice(from, 1)[0]);
        savedFantasy[orderKey] = next;
        storage.set("nflz-fantasy-order", savedFantasy);
        render();
      });
    });
  });
  return `
    <section class="panel">
      <div class="toolbar"><h2>Start 'Em, Sit 'Em</h2><select id="fantasy-league">${state.data.fantasyLeagues.map((item, i) => `<option value="${i}" ${i === state.fantasyLeague ? "selected" : ""}>${item.name || `League ${i + 1}`}</option>`).join("")}</select></div>
      ${table(league.headers.map((h) => ({ label: h || "" })), rows.map((row, i) => `<tr draggable="true" data-index="${i}">${row.map((cell) => `<td>${cell || ""}</td>`).join("")}</tr>`))}
    </section>
  `;
}

const pffPositionProfiles = {
  QB: { profile: 1, min: 292, med: 775, max: 1143 },
  RB: { profile: 2, min: 250, med: 479, max: 931 },
  WR: { profile: 2, min: 250, med: 553, max: 993 },
  TE: { profile: 2, min: 263, med: 517, max: 1033 },
  OT: { profile: 5, min: 291, med: 778, max: 1163 },
  OG: { profile: 5, min: 324, med: 835, max: 1151 },
  C: { profile: 5, min: 309, med: 917, max: 1154 },
  EDGE: { profile: 4, min: 263, med: 529, max: 1005 },
  IDL: { profile: 5, min: 206, med: 487, max: 822 },
  LB: { profile: 5, min: 295, med: 781, max: 1132 },
  CB: { profile: 5, min: 275, med: 689, max: 1089 },
  S: { profile: 5, min: 281, med: 797, max: 1112 },
};

const pffProfilePulls = {
  1: { maxUp: 5, maxDown: 4, pull: 0.2 },
  2: { maxUp: 6, maxDown: 5, pull: 0.35 },
  3: { maxUp: 7, maxDown: 6, pull: 0.5 },
  4: { maxUp: 8, maxDown: 7, pull: 0.65 },
  5: { maxUp: 9, maxDown: 8, pull: 0.8 },
};

function ratingRangePull(rating) {
  const n = num(rating, 68);
  if (n <= 79) return 1;
  if (n <= 84) return 0.9;
  if (n <= 89) return 0.8;
  if (n <= 94) return 0.7;
  if (n <= 99) return 0.6;
  return 0.5;
}

function pffSnapConfidence(row) {
  const pos = groupPosition(row.modelPosition || row.pffPosition);
  const profile = pffPositionProfiles[pos];
  const snaps = Number(row.snaps);
  if (!Number.isFinite(snaps)) return 0.45;
  if (!profile) return Math.max(0.3, Math.min(1, num(row.snapPercentile, 45) / 100));
  if (snaps <= profile.min) return Math.max(0.25, 0.35 * (snaps / Math.max(1, profile.min)));
  if (snaps <= profile.med) return 0.35 + ((snaps - profile.min) / Math.max(1, profile.med - profile.min)) * 0.35;
  return Math.min(1, 0.7 + ((snaps - profile.med) / Math.max(1, profile.max - profile.med)) * 0.3);
}

function pffSuggestedRating(player, pffRow) {
  if (!player || !pffRow) return null;
  const pos = groupPosition(player.position || pffRow.modelPosition || pffRow.pffPosition);
  const positionProfile = pffPositionProfiles[pos] || { profile: 3 };
  const profile = pffProfilePulls[positionProfile.profile] || pffProfilePulls[3];
  const percentile = pffRankPercentile(pffRow);
  if (percentile == null) return null;
  const current = num(player.rating, 68);
  const target = 68 + (percentile * 32);
  const gap = target - current;
  const snapConfidence = pffSnapConfidence(pffRow);
  const rangePull = ratingRangePull(current);
  const pull = profile.pull * rangePull * snapConfidence;
  let rawDelta = gap * pull;
  const badExtreme = Math.max(0, current - 85) * Math.max(0, 0.35 - percentile);
  const upCap = profile.maxUp * (0.55 + (snapConfidence * 0.45));
  const downCap = (profile.maxDown + badExtreme) * (0.5 + (snapConfidence * 0.5));
  rawDelta = Math.max(-downCap, Math.min(upCap, rawDelta));
  let suggested = Math.round(current + rawDelta);
  if (suggested < 68) suggested = 68;
  if (current <= 70 && suggested < current) suggested = current;
  return Math.max(68, Math.min(110, suggested));
}

function pffMatchPlayer(row) {
  const name = normalizeName(row.name || row.player);
  const team = String(row.team || "").toUpperCase();
  const pos = groupPosition(row.modelPosition || row.pffPosition);
  const candidates = pffPlayerMatchIndex().get(`${pos}__${name}`) || [];
  return candidates.find((player) => pffTeamCodeFor(player.team || player.teamAbbrev) === team) || candidates[0] || null;
}

function buildPffReviewRows() {
  return pffManualRows().map((row) => {
    const player = pffMatchPlayer(row);
    const suggested = player ? pffSuggestedRating(player, row) : null;
    return {
      row,
      player,
      key: player ? sourceKey(player) : "",
      current: player ? num(player.rating) : "",
      suggested,
      suggestedDelta: player && suggested != null ? suggested - num(player.rating) : "",
      percentile: pffRankPercentile(row),
      confidence: pffSnapConfidence(row),
      recent: player ? pffRecentAdjustments[sourceKey(player)] : null,
    };
  });
}

function pffSortHeader(key, label, cls = "") {
  const active = state.pffSort.key === key ? (state.pffSort.direction === "asc" ? " up" : " down") : "";
  return `<th class="${cls}"><button class="madden-sort${active}" data-pff-sort="${esc(key)}">${esc(label)}</button></th>`;
}

function sortPffRows(rows) {
  const { key, direction } = state.pffSort;
  const dir = direction === "asc" ? 1 : -1;
  const pick = (item) => {
    if (key === "player") return item.row.name;
    if (key === "pos") return item.row.modelPosition;
    if (key === "rank") return num(item.row.rank, 999);
    if (key === "grade") return num(item.row.grade, -999);
    if (key === "snaps") return num(item.row.snaps, -999);
    if (key === "percentile") return num(item.percentile, -1);
    if (key === "confidence") return num(item.confidence, -1);
    if (key === "current") return num(item.current, -999);
    if (key === "suggested") return num(item.suggested, -999);
    if (key === "suggestedDelta") return Math.abs(num(item.suggestedDelta, 0));
    return item.row.team;
  };
  return [...rows].sort((a, b) => {
    const av = pick(a);
    const bv = pick(b);
    return typeof av === "number" && typeof bv === "number" ? (av - bv) * dir : String(av).localeCompare(String(bv)) * dir;
  });
}

function markPffRecentAdjustment(key, player, rating, pffRow) {
  pffRecentAdjustments[key] = {
    player: player.player,
    team: player.team,
    position: player.position,
    oldRating: num(player.rating),
    newRating: num(rating),
    pffRank: pffRow.rank,
    pffTotal: pffRow.total || pffRow.ranked,
    pffGrade: pffRow.grade,
    snaps: pffRow.snaps,
    adjustedAt: new Date().toISOString(),
  };
  const entries = Object.entries(pffRecentAdjustments)
    .sort((a, b) => String(b[1].adjustedAt || "").localeCompare(String(a[1].adjustedAt || "")))
    .slice(0, 300);
  Object.keys(pffRecentAdjustments).forEach((entryKey) => delete pffRecentAdjustments[entryKey]);
  entries.forEach(([entryKey, value]) => { pffRecentAdjustments[entryKey] = value; });
  storage.set("nflz-pff-recent-adjustments", pffRecentAdjustments);
}

function applyPffSuggestion(item) {
  if (!item?.player || item.suggested == null || item.suggested === num(item.player.rating)) return false;
  markPffRecentAdjustment(item.key, item.player, item.suggested, item.row);
  persistPlayer(item.player, { rating: item.suggested, newRating: item.suggested });
  return true;
}

function renderPffSuggestionCell(item) {
  if (!item.player || item.suggested == null) return "-";
  const delta = num(item.suggestedDelta);
  return `<span class="madden-suggest" title="${esc(`Target is 68-100 by PFF percentile, weighted by ${fmt(item.confidence * 100, 0)}% snap confidence and ${item.row.modelPosition} profile.`)}">
    <button data-pff-apply="${esc(item.key)}">Suggest ${fmt(item.suggested, 0)}</button>
    <small class="${delta >= 0 ? "plus" : "minus"}">${delta > 0 ? "+" : ""}${fmt(delta, 0)}</small>
  </span>`;
}

function renderPff() {
  const reviewAll = buildPffReviewRows().filter((item) => matches({ ...item.row, matched: item.player?.player || "" }));
  const oldRows = state.data.pff.filter(matches).sort((a, b) => Math.abs(num(b.delta)) - Math.abs(num(a.delta))).slice(0, 160).map((p) => {
    const delta = num(p.delta);
    return `<tr><td>${p.position}</td><td>${p.player}</td><td class="num">${fmt(p.pff, 0)}</td><td class="num">${fmt(p.oldRating, 0)}</td><td class="num">${fmt(p.newRating, 0)}</td><td class="num delta ${delta >= 0 ? "plus" : "minus"}">${delta > 0 ? "+" : ""}${fmt(delta, 0)}</td></tr>`;
  });
  if (state.pffView === "madden") {
    setTimeout(() => {
      document.querySelectorAll("[data-pff-view]").forEach((button) => button.addEventListener("click", () => { state.pffView = button.dataset.pffView; state.pffLimit = 500; render(); }));
    });
    return `<section class="panel pff-review-panel">
      <div class="toolbar fantasy-rank-toolbar">
        <div><h2>PFF Update</h2><p>PFF is the main weekly ratings review. Madden comparison is kept here as a secondary check.</p></div>
      </div>
      <div class="live-tabs pff-tabs">
        ${[["review", `PFF Review ${reviewAll.length}`], ["recent", `Recently Adjusted ${Object.keys(pffRecentAdjustments).length}`], ["madden", "Madden Comparison"], ["workbook", "Workbook Import"]].map(([id, label]) => `<button class="${state.pffView === id ? "active" : ""}" data-pff-view="${id}">${esc(label)}</button>`).join("")}
      </div>
      <div class="pff-secondary-view">${renderMadden()}</div>
    </section>`;
  }
  const viewRows = state.pffView === "workbook" ? [] : state.pffView === "recent" ? reviewAll.filter((item) => item.key && pffRecentAdjustments[item.key]) : reviewAll;
  const sortedRows = sortPffRows(viewRows);
  const visibleRows = sortedRows.slice(0, state.pffLimit);
  const actionableCount = visibleRows.filter((item) => item.player && item.suggested != null && item.suggested !== num(item.player.rating)).length;
  const reviewRows = visibleRows.map((item) => {
    const recent = item.key ? pffRecentAdjustments[item.key] : null;
    const pct = item.percentile == null ? "" : `${fmt(item.percentile * 100, 0)}%`;
    return `<tr>
      <td><span class="pos-chip">${esc(item.row.modelPosition)}</span></td>
      <td>${item.player ? playerNameButton(item.player) : esc(item.row.name)}</td>
      <td>${esc(item.row.team)}</td>
      <td class="num">#${esc(item.row.rank)} / ${esc(item.row.total || item.row.ranked || "")}</td>
      <td class="num">${pct}</td>
      <td class="num">${fmt(item.row.grade, 1)}</td>
      <td class="num">${item.row.snaps ? fmt(item.row.snaps, 0) : "-"}</td>
      <td class="num">${fmt(item.confidence * 100, 0)}%</td>
      <td class="num">${item.player ? ratingBadge(item.current) : "-"}</td>
      <td class="num">${renderPffSuggestionCell(item)}</td>
      <td>${recent ? `<span class="madden-recent-note">Adjusted ${fmt(recent.oldRating, 0)} -> ${fmt(recent.newRating, 0)}</span>` : ""}</td>
    </tr>`;
  }).join("");
  setTimeout(() => {
    document.querySelector("#pff-paste-position")?.addEventListener("change", (event) => { state.pffPastePosition = event.target.value; });
    document.querySelector("#pff-import-paste")?.addEventListener("click", importPffPaste);
    document.querySelectorAll("[data-pff-view]").forEach((button) => button.addEventListener("click", () => { state.pffView = button.dataset.pffView; state.pffLimit = 500; render(); }));
    document.querySelectorAll("[data-pff-sort]").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.pffSort;
      state.pffSort = { key, direction: state.pffSort.key === key && state.pffSort.direction === "desc" ? "asc" : "desc" };
      render();
    }));
    document.querySelectorAll("[data-pff-apply]").forEach((button) => button.addEventListener("click", () => {
      const item = reviewAll.find((entry) => entry.key === button.dataset.pffApply);
      applyPffSuggestion(item);
      render();
    }));
    document.querySelector("#pff-approve-suggested")?.addEventListener("click", () => {
      visibleRows.forEach(applyPffSuggestion);
      render();
    });
    document.querySelector("#pff-show-more")?.addEventListener("click", () => { state.pffLimit += 500; render(); });
    document.querySelector("#pff-show-all")?.addEventListener("click", () => { state.pffLimit = sortedRows.length; render(); });
    document.querySelector("#pff-clear-recent")?.addEventListener("click", () => {
      Object.keys(pffRecentAdjustments).forEach((key) => delete pffRecentAdjustments[key]);
      storage.set("nflz-pff-recent-adjustments", pffRecentAdjustments);
      if (state.pffView === "recent") state.pffView = "review";
      render();
    });
    wirePlayerActions();
  });
  return `<section class="panel pff-review-panel">
    <div class="toolbar fantasy-rank-toolbar">
      <div><h2>PFF Update</h2><p>PFF-only suggested rating review from pasted position ranks, weighted by percentile, snaps, position profile, and current rating range.</p></div>
      <div class="filters">
        ${actionableCount ? `<button id="pff-approve-suggested" class="mini-action primary">Approve Visible Suggested (${actionableCount})</button>` : ""}
        ${Object.keys(pffRecentAdjustments).length ? `<button id="pff-clear-recent" class="mini-action">Clear Recent (${Object.keys(pffRecentAdjustments).length})</button>` : ""}
      </div>
    </div>
    <div class="live-tabs pff-tabs">
      ${[["review", `PFF Review ${reviewAll.length}`], ["recent", `Recently Adjusted ${Object.keys(pffRecentAdjustments).length}`], ["madden", "Madden Comparison"], ["workbook", "Workbook Import"]].map(([id, label]) => `<button class="${state.pffView === id ? "active" : ""}" data-pff-view="${id}">${esc(label)}</button>`).join("")}
    </div>
    ${state.pffView !== "workbook" ? `
      <section class="formula-card pff-import-panel">
        <div class="toolbar"><h3>PFF Rank Paste</h3>${select("pff-paste-position", state.pffPastePosition, pffPastePositions)}</div>
        <textarea id="pff-paste-text" class="pff-paste-box compact" placeholder="Paste PFF position table here"></textarea>
        <div class="depth-top-actions"><button id="pff-import-paste" class="mini-action primary">Import PFF Ranks</button><a class="mini-action" href="https://www.pff.com/nfl/grades/position/ed" target="_blank" rel="noreferrer">Open PFF</a></div>
        ${state.pffManualNotice ? `<p class="depth-check-note depth-check-success">${esc(state.pffManualNotice)}</p>` : ""}
      </section>
      <div class="madden-list-control"><span>Showing ${visibleRows.length} of ${sortedRows.length}</span>${visibleRows.length < sortedRows.length ? `<button id="pff-show-more" class="mini-action">Show 500 More</button><button id="pff-show-all" class="mini-action">Show All</button>` : ""}</div>
      <div class="table-scroll fantasy-rank-scroll pff-review-scroll">
        <table class="pff-review-table"><thead><tr>
          ${pffSortHeader("pos", "Pos")}
          ${pffSortHeader("player", "Player")}
          ${pffSortHeader("team", "Team")}
          ${pffSortHeader("rank", "PFF Rank", "num")}
          ${pffSortHeader("percentile", "Pct", "num")}
          ${pffSortHeader("grade", "Grade", "num")}
          ${pffSortHeader("snaps", "Snaps", "num")}
          ${pffSortHeader("confidence", "Trust", "num")}
          ${pffSortHeader("current", "Mine", "num")}
          ${pffSortHeader("suggested", "Suggested", "num")}
          <th>Recent</th>
        </tr></thead><tbody>${reviewRows || "<tr><td colspan='11'>No pasted PFF ranks yet. Paste a PFF position table above.</td></tr>"}</tbody></table>
      </div>
    ` : `
      <section class="grid pff-grid">
        <div class="panel">
          <h2>Workbook PFF Update</h2>
          ${table([{ label: "Pos" }, { label: "Player" }, { label: "PFF", cls: "num" }, { label: "Old", cls: "num" }, { label: "New", cls: "num" }, { label: "Delta", cls: "num" }], oldRows)}
        </div>
        <div class="panel">
          <h2>Workbook Logic</h2>
          <p class="note">Original spreadsheet rating-adjustment logic, kept here as a hidden reference view.</p>
          <pre class="formula">${state.data.modelNotes.pff.newRating}</pre>
        </div>
      </section>
    `}
    ${renderPlayerModal()}
  </section>`;
}

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
  if (value >= 1024) return `${(value / 1024).toFixed(0)} KB`;
  return `${value} B`;
}

function localStorageBytes(value) {
  return new Blob([String(value || "")]).size;
}

function localStorageRows() {
  const rows = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    const value = localStorage.getItem(key) || "";
    rows.push({ key, bytes: localStorageBytes(value), value });
  }
  return rows.sort((a, b) => b.bytes - a.bytes);
}

function storageBucketLabel(key) {
  return {
    "nflz-player-overrides": "Player edits",
    "nflz-added-players": "Added players",
    "nflz-pff-manual-ranks": "PFF pasted ranks",
    "nflz-pff-recent-adjustments": "PFF recent adjustments",
    "nflz-depth-resolved-results": "Depth check resolved history",
    "nflz-depth-ignored-results": "Depth check ignored history",
    "nflz-depth-candidate-removals": "Depth duplicate removals",
    "nflz-madden-match-overrides": "Madden match choices",
    "nflz-madden-recent-adjustments": "Madden recent adjustments",
    "nflz-picks": "Picks and game results",
    "nflz-challenges": "H2H challenges",
    "nflz-fantasy-order": "Fantasy manual order",
    "nflz-weekly-qb-weights": "Weekly QB sliders",
    "nflz-weekly-qb-options": "Weekly QB options",
    "nflz-schedule-position-weights": "Sim position weights",
    "nflz-preseason-depth-multipliers": "Preseason depth multipliers",
    "nflz-home-field-advantages": "Home field values",
  }[key] || key.replace(/^nflz-/, "").replace(/-/g, " ");
}

function backupPayload() {
  const objectFallbacks = ["overrides", "picks", "fantasyOrder", "depthCandidateRemovals", "depthIgnored", "depthResolved", "pffManualRanks", "pffRecentAdjustments", "maddenMatchOverrides", "maddenRecentAdjustments"];
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    source: "Browser local storage backup",
    data: Object.fromEntries(Object.entries(backupKeys).map(([name, key]) => [name, storage.get(key, objectFallbacks.includes(name) ? {} : [])])),
  };
}

function compactPffManualRanks() {
  Object.entries(pffManualRanks).forEach(([key, row]) => {
    pffManualRanks[key] = {
      name: row.name || row.player,
      player: row.player || row.name,
      team: row.team,
      pffPosition: row.pffPosition,
      modelPosition: row.modelPosition,
      rank: row.rank,
      ranked: row.ranked,
      total: row.total,
      grade: row.grade,
      snaps: row.snaps,
      snapPercentile: row.snapPercentile,
      source: row.source || "paste",
    };
  });
  invalidatePffIndexes();
  storage.set("nflz-pff-manual-ranks", pffManualRanks);
}

function wireDataSettings() {
  navigator.storage?.estimate?.().then((estimate) => {
    const node = document.querySelector("#data-quota-note");
    if (!node) return;
    node.textContent = `${formatBytes(estimate.usage || 0)} of ${formatBytes(estimate.quota || 0)} browser storage used`;
  }).catch(() => {});
  document.querySelector("#data-refresh")?.addEventListener("click", render);
  document.querySelector("#data-export")?.addEventListener("click", exportFullBackup);
  document.querySelector("#data-copy")?.addEventListener("click", () => {
    navigator.clipboard?.writeText(JSON.stringify(backupPayload(), null, 2));
    alert("Backup copied to clipboard.");
  });
  document.querySelector("#data-compact-pff")?.addEventListener("click", () => {
    compactPffManualRanks();
    render();
  });
  document.querySelector("#data-clear-madden-matches")?.addEventListener("click", () => {
    if (!confirm("Clear saved Madden match dropdown choices? Ratings and players will stay untouched.")) return;
    localStorage.removeItem("nflz-madden-match-overrides");
    Object.keys(maddenMatchOverrides).forEach((key) => delete maddenMatchOverrides[key]);
    render();
  });
  document.querySelector("#data-clear-madden-recent")?.addEventListener("click", () => {
    if (!confirm("Clear recently adjusted Madden notes? Ratings will stay untouched.")) return;
    localStorage.removeItem("nflz-madden-recent-adjustments");
    Object.keys(maddenRecentAdjustments).forEach((key) => delete maddenRecentAdjustments[key]);
    render();
  });
  document.querySelector("#data-clear-pff")?.addEventListener("click", () => {
    if (!confirm("Clear pasted PFF ranks from this browser? You can re-import them from PFF later.")) return;
    localStorage.removeItem("nflz-pff-manual-ranks");
    Object.keys(pffManualRanks).forEach((key) => delete pffManualRanks[key]);
    invalidatePffIndexes();
    render();
  });
  document.querySelector("#data-clear-pff-recent")?.addEventListener("click", () => {
    if (!confirm("Clear recently adjusted PFF notes? Ratings will stay untouched.")) return;
    localStorage.removeItem("nflz-pff-recent-adjustments");
    Object.keys(pffRecentAdjustments).forEach((key) => delete pffRecentAdjustments[key]);
    render();
  });
}

function renderDataSettings() {
  const rows = localStorageRows();
  const nflRows = rows.filter((row) => row.key.startsWith("nflz-"));
  const total = rows.reduce((sum, row) => sum + row.bytes, 0);
  const nflTotal = nflRows.reduce((sum, row) => sum + row.bytes, 0);
  const biggest = rows.slice(0, 16).map((row) => {
    let keyCount = "";
    try {
      const parsed = JSON.parse(row.value);
      keyCount = parsed && typeof parsed === "object" ? Object.keys(parsed).length : "";
    } catch {}
    return `<tr><td><b>${esc(storageBucketLabel(row.key))}</b><small>${esc(row.key)}</small></td><td class="num">${formatBytes(row.bytes)}</td><td class="num">${esc(keyCount)}</td></tr>`;
  }).join("");
  const fileRows = [
    ["Base app data", "data.json", window.NFL_MODEL_Z_DATA],
    ["Madden ratings", "madden-ratings.js", window.MADDEN_27_RATINGS],
    ["PFF position cache", "pff-position-overrides.js", window.PFF_POSITION_OVERRIDES?.rows],
    ["OurLads cached page", "ourlads-cache.js", window.OURLADS_DEPTH_TEXT],
    ["OurLads check results", "ourlads-check-results.js", window.OURLADS_DEPTH_CHECK?.results],
    ["Footballguys game logs", "footballguys-game-logs.js", window.FOOTBALLGUYS_GAME_LOGS?.players],
    ["Fantasy formula import", "fantasy-rankings.js", window.FANTASY_RANKING_IMPORT],
  ].map(([label, file, value]) => {
    const count = Array.isArray(value) ? value.length : value && typeof value === "object" ? Object.keys(value).length : value ? 1 : 0;
    return `<tr><td><b>${esc(label)}</b><small>${esc(file)}</small></td><td class="num">${esc(count)}</td></tr>`;
  }).join("");
  setTimeout(wireDataSettings);
  return `<section class="panel data-panel">
    <div class="toolbar">
      <div><h2>Data Diagnostics</h2><p>Browser storage, imported scan data, and cleanup tools for performance checks.</p></div>
      <div class="filters"><button id="data-refresh" class="mini-action">Refresh</button><button id="data-export" class="mini-action primary">Export Backup</button></div>
    </div>
    <div class="data-metrics">
      <div class="metric-card"><span>LocalStorage Used</span><b>${formatBytes(total)}</b><em>${formatBytes(nflTotal)} NFL IQ data</em></div>
      <div class="metric-card"><span>Player Edits</span><b>${formatBytes(localStorageBytes(localStorage.getItem("nflz-player-overrides") || ""))}</b><em>${Object.keys(overrides).length} edited players</em></div>
      <div class="metric-card"><span>Added Players</span><b>${formatBytes(localStorageBytes(localStorage.getItem("nflz-added-players") || ""))}</b><em>${addedPlayers.length} added players</em></div>
      <div class="metric-card"><span>PFF Import</span><b>${formatBytes(localStorageBytes(localStorage.getItem("nflz-pff-manual-ranks") || ""))}</b><em>${Object.keys(pffManualRanks).length} pasted rows</em></div>
    </div>
    <p id="data-quota-note" class="note">Checking browser storage quota...</p>
    <div class="data-grid">
      <section class="formula-card">
        <h3>Biggest LocalStorage Items</h3>
        <table class="data-table"><thead><tr><th>Bucket</th><th class="num">Size</th><th class="num">Rows</th></tr></thead><tbody>${biggest || "<tr><td colspan='3'>No local storage found.</td></tr>"}</tbody></table>
      </section>
      <section class="formula-card">
        <h3>Loaded Data Files</h3>
        <table class="data-table"><thead><tr><th>File</th><th class="num">Rows</th></tr></thead><tbody>${fileRows}</tbody></table>
      </section>
    </div>
    <section class="formula-card data-actions">
      <h3>Backup & Cleanup</h3>
      <p class="note">Export before clearing anything important. Ratings, added players, ignored depth checks, PFF imports, and Madden match choices live in this browser right now.</p>
      <div class="filters">
        <button id="data-copy" class="mini-action">Copy Backup</button>
        <button id="data-compact-pff" class="mini-action">Compact PFF Import</button>
        <button id="data-clear-madden-matches" class="mini-action">Clear Madden Match Choices</button>
        <button id="data-clear-madden-recent" class="mini-action">Clear Madden Recent Notes</button>
        <button id="data-clear-pff-recent" class="mini-action">Clear PFF Recent Notes</button>
        <button id="data-clear-pff" class="mini-action danger">Clear PFF Import</button>
      </div>
    </section>
  </section>`;
}

function challengeMinTarget(count) {
  return Math.max(8, Math.ceil(count * 0.4));
}

function challengeMaxTarget(count) {
  return Math.min(36, Math.max(12, Math.ceil(count * 0.9)));
}

function challengeIsSettled(challenge) {
  const count = challenge.candidates.length;
  if (challenge.index < challengeMinTarget(count)) return false;
  const ranked = [...challenge.candidates].sort((a, b) => (challenge.scores[b] || 0) - (challenge.scores[a] || 0));
  const unseen = ranked.filter((key) => ((challenge.wins[key] || 0) + (challenge.losses[key] || 0)) === 0).length;
  const closeEdges = ranked.slice(0, -1).filter((key, index) => Math.abs((challenge.scores[key] || 0) - (challenge.scores[ranked[index + 1]] || 0)) <= 1).length;
  return unseen <= Math.ceil(count * 0.1) && closeEdges <= Math.ceil(count * 0.35);
}

function challengeRemaining(challenge) {
  if (challengeIsSettled(challenge)) return 0;
  return Math.max(0, challenge.target - challenge.index);
}

function startChallenge() {
  const candidates = state.players.filter((p) => groupPosition(p.position) === state.qbPosition && num(p.depth, 999) <= Number(state.qbDepth));
  const rankedSeeds = [...candidates].sort((a, b) => num(b.rating) - num(a.rating) || num(a.depth, 99) - num(b.depth, 99) || String(a.player).localeCompare(b.player));
  const keys = rankedSeeds.map(sourceKey);
  const scores = {};
  keys.forEach((key, index) => {
    scores[key] = Math.round((keys.length - index) * 2);
  });
  state.challenge = {
    user: state.qbUser || "Anonymous",
    position: state.qbPosition,
    depth: state.qbDepth,
    index: 0,
    target: challengeMaxTarget(keys.length),
    seeded: true,
    scores,
    wins: {},
    losses: {},
    usedPairs: {},
    candidates: keys,
    currentPair: null,
  };
  state.challenge.currentPair = chooseNextPair(state.challenge);
  render();
}

function voteChallenge(winnerKey) {
  const c = state.challenge;
  const pair = c.currentPair || [];
  const loserKey = pair.find((key) => key !== winnerKey);
  c.wins[winnerKey] = (c.wins[winnerKey] || 0) + 1;
  c.losses[loserKey] = (c.losses[loserKey] || 0) + 1;
  c.scores[winnerKey] = (c.scores[winnerKey] || 0) + 1;
  c.scores[loserKey] = (c.scores[loserKey] || 0) - 1;
  c.usedPairs[pairKey(pair[0], pair[1])] = true;
  c.index += 1;
  if (challengeRemaining(c) <= 0) {
    const rankings = c.candidates.map((key) => ({ playerKey: key, score: c.scores[key] || 0, wins: c.wins[key] || 0, losses: c.losses[key] || 0, player: findPlayer(key) })).sort((a, b) => b.score - a.score || b.wins - a.wins || num(b.player?.rating) - num(a.player?.rating)).map((x, i) => ({ rank: i + 1, player: x.player?.player, team: x.player?.teamAbbrev, wins: x.wins, losses: x.losses, score: x.score }));
    savedChallenges.push({ user: c.user, position: c.position, depth: c.depth, date: new Date().toLocaleDateString(), rankings });
    storage.set("nflz-challenges", savedChallenges);
    state.challenge = null;
  } else {
    c.currentPair = chooseNextPair(c);
  }
  render();
}

function pairKey(a, b) {
  return [a, b].sort().join("~~");
}

function chooseNextPair(challenge) {
  const ranked = [...challenge.candidates].sort((a, b) => (challenge.scores[b] || 0) - (challenge.scores[a] || 0));
  const leastSeen = [...challenge.candidates].sort((a, b) => ((challenge.wins[a] || 0) + (challenge.losses[a] || 0)) - ((challenge.wins[b] || 0) + (challenge.losses[b] || 0)));
  for (const anchor of leastSeen.slice(0, 12)) {
    const idx = ranked.indexOf(anchor);
    const neighbors = [ranked[idx - 2], ranked[idx - 1], ranked[idx + 1], ranked[idx + 2]].filter(Boolean);
    const next = neighbors.find((other) => !challenge.usedPairs[pairKey(anchor, other)]);
    if (next) return [anchor, next].sort(() => Math.random() - 0.5);
  }
  for (let i = 0; i < ranked.length - 1; i++) {
    for (let j = i + 1; j < Math.min(ranked.length, i + 5); j++) {
      if (!challenge.usedPairs[pairKey(ranked[i], ranked[j])]) return [ranked[i], ranked[j]].sort(() => Math.random() - 0.5);
    }
  }
  const a = ranked[Math.floor(Math.random() * ranked.length)];
  let b = ranked[Math.floor(Math.random() * ranked.length)];
  while (b === a) b = ranked[Math.floor(Math.random() * ranked.length)];
  return [a, b];
}

function renderQb() {
  const positions = unique(state.players.map((p) => groupPosition(p.position)));
  const depthOptions = [1, 2, 3, 4, 5];
  if (state.challenge) {
    const pair = state.challenge.currentPair || [];
    const left = findPlayer(pair[0]);
    const right = findPlayer(pair[1]);
    setTimeout(() => document.querySelectorAll(".choice-card").forEach((card) => card.addEventListener("click", () => voteChallenge(card.dataset.playerKey))));
    return `<section class="challenge-status"><span>${challengeRemaining(state.challenge)} left</span><b>${state.challenge.index} picked</b><em>Seeded from workbook ratings; picks tighten the close calls.</em></section><section class="challenge">${choiceCard(left)}<div class="versus">VS</div>${choiceCard(right)}</section>`;
  }
  const baseline = state.comparePosition === "QB"
    ? [{ user: "Workbook Baseline", position: "QB", rankings: state.data.qbChallenge.map((q) => ({ rank: q.rank, player: q.player, team: "" })) }]
    : [];
  const relevantChallenges = [...baseline, ...savedChallenges.filter((c) => c.position === state.comparePosition)];
  const players = unique(relevantChallenges.flatMap((c) => c.rankings.map((r) => r.player)));
  setTimeout(() => {
    wireSelect("challenge-position", "qbPosition");
    wireSelect("challenge-depth", "qbDepth");
    wireSelect("compare-position", "comparePosition");
    document.querySelector("#qb-user")?.addEventListener("input", (event) => { state.qbUser = event.target.value; });
    document.querySelector("#challenge-start")?.addEventListener("click", startChallenge);
    document.querySelectorAll("[data-compare-player]").forEach((el) => {
      el.addEventListener("mouseenter", () => document.querySelectorAll(`[data-compare-player="${CSS.escape(el.dataset.comparePlayer)}"]`).forEach((x) => x.classList.add("hover-match")));
      el.addEventListener("mouseleave", () => document.querySelectorAll(".hover-match").forEach((x) => x.classList.remove("hover-match")));
    });
  });
  return `
    <section class="grid">
      <div class="panel">
        <h2>Run Challenge</h2>
        <div class="form-stack">
          <input id="qb-user" placeholder="User name" value="${state.qbUser}" />
          ${select("challenge-position", state.qbPosition, positions)}
          ${select("challenge-depth", state.qbDepth, depthOptions)}
          <button id="challenge-start">Start Pairwise Challenge</button>
        </div>
      </div>
      <div class="panel">
        <div class="toolbar"><h2>Compare Rankings</h2>${select("compare-position", state.comparePosition, positions)}</div>
        <div class="compare-board">
          ${relevantChallenges.length ? relevantChallenges.map((c) => `<div class="compare-list"><h3>${c.user}</h3>${c.rankings.map((r) => `<div data-compare-player="${r.player}"><b>${r.rank}</b> ${r.player} <em>${r.team || ""}</em></div>`).join("")}</div>`).join("") : "<p class='note'>No saved challenge boards yet. Run one to create the first side-by-side list.</p>"}
        </div>
      </div>
    </section>
  `;
}

function choiceCard(p) {
  if (!p) return "<div class='choice-card empty'></div>";
  return `<button class="choice-card" data-player-key="${playerKey(p)}"><div class="headshot">${p.player.slice(0, 1)}</div><strong>${p.player}</strong><span>${p.teamAbbrev} · ${p.position}${p.depth ? ` · ${p.position}${p.depth}` : ""}</span><em>${fmt(p.rating, 0)}</em></button>`;
}

function choiceCardClean(p) {
  if (!p) return "<div class='choice-card empty'></div>";
  const depthLabel = p.depth ? ` - ${p.position}${p.depth}` : "";
  return `<button class="choice-card" data-player-key="${playerKey(p)}">${playerAvatar(p, "lg")}<strong>${p.player}</strong><span>${p.teamAbbrev} - ${p.position}${depthLabel}</span></button>`;
}

choiceCard = choiceCardClean;

function render() {
  const page = pages.find(([id]) => id === state.page);
  title.textContent = page[1];
  renderNav();
  const views = {
    home: renderHome,
    live: renderLive,
    depth: renderDepth,
    top30: renderTop30,
    schedule: renderSchedule,
    picks: renderPicksTracker,
    standings: renderStandings,
    weeklyFantasy: () => renderFantasyRanks("weekly"),
    seasonFantasy: () => renderFantasyRanks("season"),
    statRanks: renderStatRanks,
    madden: renderMadden,
    data: renderDataSettings,
    start: renderStartSit,
    pff: renderPff,
    qb: renderQb,
  };
  content.innerHTML = views[state.page]();
  document.querySelectorAll("[data-live]").forEach((button) => button.addEventListener("click", () => {
    state.liveView = button.dataset.live;
    render();
  }));
}

search.addEventListener("input", (event) => {
  state.query = event.target.value.trim().toLowerCase();
  clearTimeout(globalSearchTimer);
  globalSearchTimer = setTimeout(render, 90);
});

document.addEventListener?.("click", (event) => {
  const depthActionButton = event.target.closest?.(".depth-apply-one, .depth-use-match, .depth-add-missing, .depth-remove-candidate, .depth-ignore-one, .depth-alter-name");
  if (depthActionButton) {
    handleDepthCheckActionClick(event);
    return;
  }
  if (event.target.closest("select")) return;
  const card = event.target.closest(".schedule-card");
  if (card) {
    state.selectedScheduleKey = card.dataset.scheduleKey;
    render();
    return;
  }
  if (event.target.closest(".schedule-detail-close") || event.target.classList.contains("schedule-detail-backdrop")) {
    state.selectedScheduleKey = "";
    render();
  }
});

document.addEventListener?.("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest(".schedule-card");
  if (!card) return;
  event.preventDefault();
  state.selectedScheduleKey = card.dataset.scheduleKey;
  render();
});

exportBackupButton?.addEventListener("click", exportFullBackup);
importBackupButton?.addEventListener("click", () => importBackupFile?.click());
importBackupFile?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) importFullBackup(file);
  event.target.value = "";
});

const load = window.NFL_MODEL_Z_DATA ? Promise.resolve(window.NFL_MODEL_Z_DATA) : fetch("data.json").then((response) => response.json());
load.then((data) => {
  state.data = data;
  state.players = applyOverrides(data.players);
  render();
}).catch(() => {
  content.innerHTML = `<section class="panel"><h2>Data did not load</h2><p class="note">Serve this folder locally so the browser can read data.json.</p></section>`;
});


