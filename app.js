const navSections = [
  { title: "", pages: [["home", "Quick Actions"]] },
  { title: "Player Database", pages: [["live", "Live Rankings"], ["depth", "Depth Charts"], ["top30", "Top 30s by Position"]] },
  { title: "Picks Center", pages: [["schedule", "Season Schedule"], ["picks", "Picks Tracker"]] },
  { title: "Season Projector", pages: [["standings", "Season Projector"]] },
  { title: "Fantasy Hub", pages: [["start", "My Fantasy Teams"], ["weeklyFantasy", "Weekly Fantasy Rankings"], ["seasonFantasy", "Season Long Fantasy Rankings"]] },
  { title: "Data", pages: [["weeklyMatchups", "Weekly Matchups"], ["pff", "PFF Update"], ["statRanks", "Stat Ranks"], ["data", "Data Diagnostics"]] },
  { title: "Interactive", pages: [["gameSim", "Game Simulator"], ["qb", "H2H QB Challenge", "low"]] },
];

const pages = navSections.flatMap((section) => section.pages);

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
  injuryResolved: "nflz-injury-resolved-results",
  fantasyFavorites: "nflz-fantasy-favorites",
  fantasyTeams: "nflz-my-fantasy-teams",
  pffManualRanks: "nflz-pff-manual-ranks",
  pffRecentAdjustments: "nflz-pff-recent-adjustments",
  addedPlayers: "nflz-added-players",
  maddenMatchOverrides: "nflz-madden-match-overrides",
  maddenRecentAdjustments: "nflz-madden-recent-adjustments",
  ratingHistoryStartAt: "nflz-rating-history-start-at",
};

const defaultWeeklyQbOptions = {
  useStatRanks: true,
  useLast5: true,
  useProduction: true,
};

const defaultWeeklyQbWeights = {
  statRanks: 100,
  last5: 68,
  production2025: 100,
  production2026: 100,
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

const defaultWeeklySkillWeights = {
  statRanks: 100,
  last5: 68,
  production2025: 100,
  production2026: 100,
  depth: 100,
  matchup: 100,
  talent: 100,
  oline: 100,
  ppg: 100,
  qb: 100,
  usage: 100,
  redZone: 100,
  gameScript: 0,
  teamTotal: 0,
  opponentTd: 0,
};

const defaultWeeklySkillOptions = {
  useStatRanks: true,
  useLast5: true,
  useProduction: true,
  extraFactors: [],
};

const defaultWeeklyMatchupWeights = {
  vQB_IDL1: 100, vQB_IDL2: 100, vQB_IDL3: 100, vQB_IDL4: 0, vQB_IDL5: 0,
  vQB_EDGE1: 100, vQB_EDGE2: 100, vQB_EDGE3: 100, vQB_EDGE4: 0, vQB_EDGE5: 0,
  vQB_LB1: 50, vQB_LB2: 50, vQB_LB3: 50, vQB_LB4: 0, vQB_LB5: 0,
  vQB_CB1: 100, vQB_CB2: 100, vQB_CB3: 100, vQB_CB4: 0, vQB_CB5: 0,
  vQB_S1: 100, vQB_S2: 100, vQB_S3: 0, vQB_S4: 0, vQB_S5: 0,
  vRB_IDL1: 100, vRB_IDL2: 100, vRB_IDL3: 100, vRB_IDL4: 0, vRB_IDL5: 0,
  vRB_EDGE1: 100, vRB_EDGE2: 100, vRB_EDGE3: 100, vRB_EDGE4: 0, vRB_EDGE5: 0,
  vRB_LB1: 100, vRB_LB2: 100, vRB_LB3: 100, vRB_LB4: 0, vRB_LB5: 0,
  vWR_CB1: 101, vWR_CB2: 100, vWR_CB3: 100, vWR_CB4: 0, vWR_CB5: 0,
  vWR_S1: 100, vWR_S2: 100, vWR_S3: 0, vWR_S4: 0, vWR_S5: 0,
  vTE_EDGE1: 100, vTE_EDGE2: 0, vTE_EDGE3: 0, vTE_EDGE4: 0, vTE_EDGE5: 0,
  vTE_LB1: 100, vTE_LB2: 100, vTE_LB3: 100, vTE_LB4: 0, vTE_LB5: 0,
  vTE_S1: 100, vTE_S2: 100, vTE_S3: 0, vTE_S4: 0, vTE_S5: 0,
  vTE_CB1: 80, vTE_CB2: 80, vTE_CB3: 0, vTE_CB4: 0, vTE_CB5: 0,
};

function weeklyQbDefaultOptions() {
  return { ...defaultWeeklyQbOptions, ...storage.get("nflz-weekly-qb-default-options", {}) };
}

function weeklyQbDefaultWeights() {
  return { ...defaultWeeklyQbWeights, ...storage.get("nflz-weekly-qb-default-weights", {}) };
}

function weeklySkillDefaultWeights() {
  return { ...defaultWeeklySkillWeights, ...storage.get("nflz-weekly-skill-default-weights", {}) };
}

function weeklySkillDefaultOptions() {
  return { ...defaultWeeklySkillOptions, ...storage.get("nflz-weekly-skill-default-options", {}) };
}

const defaultSchedulePositionWeights = {
  QB: 5,
  RB: 6,
  WR: 10,
  TE: 3,
  OL: 4,
  IDL: 6,
  EDGE: 6,
  LB: 6,
  CB: 8,
  S: 6,
};

const legacySchedulePositionWeights = {
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

const defaultRegularDepthMultipliers = {
  QB: [100],
  RB: [100, 50],
  WR: [100, 75, 50, 25],
  TE: [100, 0],
  OL: [100],
  IDL: [100, 67, 33],
  EDGE: [100, 67, 33],
  LB: [100, 67, 33],
  CB: [100, 100, 67],
  S: [100, 100],
};

const legacyRegularDepthMultipliers = {
  QB: [100],
  RB: [100, 100],
  WR: [100, 100, 100, 100],
  TE: [100, 100],
  OL: [100],
  IDL: [100, 100, 100],
  EDGE: [100, 100, 100],
  LB: [100, 100, 100],
  CB: [100, 100, 100],
  S: [100, 100],
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

const scheduleScoreTuning = {
  offenseBase: 26.2,
  defenseAllowedBase: 17.2,
  offenseScale: 1.75,
  defenseScale: 1.25,
  preseasonTotalScale: 0.84,
  preseasonTotalMin: 32,
  preseasonTotalMax: 40.5,
};

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
  depthWeek: "auto",
  depthCheckActivity: "All Activities",
  depthCheckVisibleLimit: 250,
  depthCheckVersion: 0,
  depthCheckNotice: "",
  depthCheck: { status: "idle", results: [], error: "", source: "" },
  depthLockEditor: null,
  injuryCheck: { status: "idle", results: [], error: "", source: "" },
  injuryCheckActivity: "All Categories",
  selectedPlayerKey: null,
  topPosition: "All Positions",
  topLimit: 30,
  scheduleView: "week",
  scheduleWeek: "Current Week",
  scheduleTeam: "All Teams",
  scheduleVisibleLimit: 80,
  scheduleSimMode: storage.get("nflz-schedule-sim-mode", "auto"),
  scheduleControlsOpen: storage.get("nflz-schedule-controls-open", false),
  schedulePositionWeights: { ...defaultSchedulePositionWeights, ...storage.get("nflz-schedule-position-weights", {}) },
  preseasonDepthMultipliers: { ...defaultPreseasonDepthMultipliers, ...storage.get("nflz-preseason-depth-multipliers", {}) },
  regularDepthMultipliers: { ...defaultRegularDepthMultipliers, ...storage.get("nflz-regular-depth-multipliers", {}) },
  homeFieldAdvantages: { ...defaultHomeFieldAdvantages, ...storage.get("nflz-home-field-advantages", {}) },
  siteWeek: storage.get("nflz-site-week", "auto"),
  selectedScheduleKey: "",
  selectedPlayoffGame: null,
  selectedTeamBreakdown: "",
  gameSimWeek: "auto",
  gameSimGameKey: "",
  gameSimSpeed: "medium",
  standingView: "league",
  weeklyFantasyPosition: "QB",
  weeklyFantasyView: "regular",
  weeklyFantasySort: "score",
  weeklyFantasySortDirection: "desc",
  weeklyFantasyCompareKeys: storage.get("nflz-weekly-compare-keys", []),
  weeklyFantasyCompareOnly: false,
  weeklyFantasyDepthFilter: "All Depths",
  weeklyFantasyTeamFilter: "All Teams",
  weeklyQbOptions: { ...weeklyQbDefaultOptions(), ...storage.get("nflz-weekly-qb-options", {}) },
  weeklyQbWeights: { ...weeklyQbDefaultWeights(), ...storage.get("nflz-weekly-qb-weights", {}) },
  weeklyQbControlsOpen: storage.get("nflz-weekly-qb-controls-open", true),
  weeklyQbDefaultMessage: "",
  weeklySkillWeights: { ...weeklySkillDefaultWeights(), ...storage.get("nflz-weekly-skill-weights", {}) },
  weeklySkillOptions: { ...weeklySkillDefaultOptions(), ...storage.get("nflz-weekly-skill-options", {}) },
  weeklySkillControlsOpen: storage.get("nflz-weekly-skill-controls-open", true),
  weeklySkillDefaultMessage: "",
  weeklyMatchupWeights: { ...defaultWeeklyMatchupWeights, ...storage.get("nflz-weekly-matchup-weights", {}) },
  weeklyMatchupSort: "team",
  weeklyMatchupWeek: storage.get("nflz-weekly-matchup-week", "auto"),
  weeklyMatchupWeightView: storage.get("nflz-weekly-matchup-weight-view", "vQB"),
  selectedMatchupDetail: null,
  weeklyFantasyLimit: 150,
  seasonFantasyPosition: "QB",
  seasonFantasyView: "regular",
  seasonFantasySort: "rank",
  seasonFantasySortDirection: "asc",
  seasonFantasyLimit: 150,
  seasonFantasyDepthFilter: "All Depths",
  seasonFantasyTeamFilter: "All Teams",
  fantasyFavorites: storage.get("nflz-fantasy-favorites", []),
  fantasyScheduleDetail: null,
  fantasyProsAdpScanStatus: "idle",
  fantasyProsAdpScanMessage: "",
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
  myFantasyWeek: storage.get("nflz-my-fantasy-week", "auto"),
  myFantasyLeagueView: storage.get("nflz-my-fantasy-league-view", "all"),
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
  quickDepthTeam: "Arizona Cardinals",
  quickDepthScope: "Starters",
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
let savedFantasyTeams = storage.get("nflz-my-fantasy-teams", null);
const depthCandidateRemovals = storage.get("nflz-depth-candidate-removals", {});
const depthIgnoredResults = storage.get("nflz-depth-ignored-results", {});
const depthResolvedResults = storage.get("nflz-depth-resolved-results", {});
const injuryResolvedResults = storage.get("nflz-injury-resolved-results", {});
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
let scheduleProjectionCache = new Map();

function sameJson(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function migrateScheduleDefaults() {
  const weightKey = "nflz-schedule-position-weights";
  const depthKey = "nflz-regular-depth-multipliers";
  const storedWeights = storage.get(weightKey, null);
  const storedDepths = storage.get(depthKey, null);
  if (!storedWeights || sameJson(storedWeights, legacySchedulePositionWeights)) {
    state.schedulePositionWeights = { ...defaultSchedulePositionWeights };
    storage.set(weightKey, state.schedulePositionWeights);
  }
  if (!storedDepths || sameJson(storedDepths, legacyRegularDepthMultipliers)) {
    state.regularDepthMultipliers = JSON.parse(JSON.stringify(defaultRegularDepthMultipliers));
    storage.set(depthKey, state.regularDepthMultipliers);
  }
}

migrateScheduleDefaults();

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

function autosaveGameAction(gameKey, patch) {
  if (!gameKey) return;
  saveGameAction(gameKey, patch);
  state.picksLastSaved = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
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
      storage.set(backupKeys.fantasyTeams, data.fantasyTeams || []);
      storage.set(backupKeys.depthCandidateRemovals, data.depthCandidateRemovals || {});
      storage.set(backupKeys.depthIgnored, data.depthIgnored || {});
      storage.set(backupKeys.depthResolved, data.depthResolved || {});
      storage.set(backupKeys.pffManualRanks, data.pffManualRanks || {});
      storage.set(backupKeys.pffRecentAdjustments, data.pffRecentAdjustments || {});
      storage.set(backupKeys.addedPlayers, data.addedPlayers || []);
      storage.set(backupKeys.maddenMatchOverrides, data.maddenMatchOverrides || {});
      storage.set(backupKeys.maddenRecentAdjustments, data.maddenRecentAdjustments || {});
      storage.set(backupKeys.ratingHistoryStartAt, data.ratingHistoryStartAt || "");
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
const allowedModelPositions = new Set(["QB", "RB", "WR", "TE", "OT", "OG", "C", "IDL", "EDGE", "LB", "CB", "S"]);
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
  LAR: "LA Rams",
  LAC: "LA Chargers",
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
  if (["NT", "DT", "DI", "LDT", "RDT"].includes(pos)) return "IDL";
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
  const pasted = Object.values(pffManualRanks || {}).find((row) => (
    cleanPlayerName(row.name || row.player) === name
    && (!teamCode || String(row.team || "").toUpperCase() === teamCode)
  ));
  return (pasted ? groupPosition(pasted.modelPosition || pasted.pffPosition) : "")
    || pffPositionCache.byNameTeam?.[`${name}__${teamCode}`]
    || pffPositionCache.byName?.[name]
    || "";
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
  const useRatingAnchors = min >= 60 && max <= 115 && max >= 95;
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

function uid(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sourceKey(player) {
  return player?._sourceKey || playerKey(player);
}

function applyOverrides(players) {
  const merged = [...(players || []), ...addedPlayers].filter((p) => !overrides[playerKey(p)]?.deleted).filter(isIncludedPlayer).map((p) => {
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
  return assignDepthSlots(merged);
}

function saveAddedPlayers() {
  storage.set("nflz-added-players", addedPlayers);
}

function persistPlayer(player, patch, options = {}) {
  const key = sourceKey(player);
  const { ratingChangeType, ratingChangeNote, ...cleanPatch } = patch || {};
  const before = { ...player, ...(overrides[key] || {}) };
  const normalized = normalizeStarProgress({ ...before, ...cleanPatch });
  const oldRating = num(before.rating);
  const newRating = num(normalized.rating);
  if (Number.isFinite(oldRating) && Number.isFinite(newRating) && oldRating !== newRating) {
    recordRatingHistory(key, before, oldRating, newRating, ratingChangeType || inferRatingChangeType(cleanPatch), ratingChangeNote);
  }
  overrides[key] = { ...(overrides[key] || {}), ...cleanPatch, rating: normalized.rating, stars: normalized.stars, newRating: normalized.newRating, newStars: normalized.newStars };
  if (!options.deferRefresh) {
    storage.set("nflz-player-overrides", overrides);
    state.players = applyOverrides(state.data.players);
    pffPlayerMatchIndexCache = null;
  }
}

function renamePlayer(player, newName) {
  const key = sourceKey(player);
  const cleanName = String(newName || "").replace(/\s+/g, " ").trim();
  if (!player || !cleanName || cleanName === player.player) return false;
  persistPlayer(player, { player: cleanName });
  state.selectedPlayerKey = key;
  return true;
}

function resetPlayerName(player) {
  const key = sourceKey(player);
  if (!player || !overrides[key] || !Object.prototype.hasOwnProperty.call(overrides[key], "player")) return false;
  delete overrides[key].player;
  storage.set("nflz-player-overrides", overrides);
  state.players = applyOverrides(state.data.players);
  pffPlayerMatchIndexCache = null;
  state.selectedPlayerKey = key;
  return true;
}

function deletePlayer(player) {
  const key = sourceKey(player);
  const addedIndex = addedPlayers.findIndex((entry) => playerKey(entry) === key || sourceKey(entry) === key);
  if (addedIndex >= 0) {
    addedPlayers.splice(addedIndex, 1);
    saveAddedPlayers();
  }
  overrides[key] = { ...(overrides[key] || {}), deleted: true };
  storage.set("nflz-player-overrides", overrides);
  delete maddenRecentAdjustments[key];
  delete pffRecentAdjustments[key];
  storage.set("nflz-madden-recent-adjustments", maddenRecentAdjustments);
  storage.set("nflz-pff-recent-adjustments", pffRecentAdjustments);
  state.selectedPlayerKey = null;
  state.players = applyOverrides(state.data.players);
  pffPlayerMatchIndexCache = null;
}

function depthLockWeekKey(week = selectedSiteWeek()) {
  return String(week || selectedSiteWeek() || "").trim();
}

function depthViewWeek() {
  return state.depthWeek === "auto" ? selectedSiteWeek() : state.depthWeek;
}

function playerDepthLock(player, week = selectedSiteWeek()) {
  const weeklyLocks = player?.weeklyDepthLocks || {};
  const weekValue = Number(weeklyLocks[depthLockWeekKey(week)]);
  if (Number.isFinite(weekValue) && weekValue > 0) return Math.max(1, Math.floor(weekValue));
  const value = Number(player?.depthLock);
  return Number.isFinite(value) && value > 0 ? Math.max(1, Math.floor(value)) : 0;
}

function assignDepthSlots(players = []) {
  const nextPlayers = players.map((player) => ({ ...player }));
  const groups = new Map();
  nextPlayers.forEach((player) => {
    if (!player) return;
    if (normalizeTeamName(player.team) === "Free Agent") {
      player.depth = 0;
      return;
    }
    if (!isPlayerAvailable(player)) return;
    if (!Number.isFinite(Number(player.rating))) return;
    const key = `${normalizeTeamName(player.team)}__${String(player.position || "").toUpperCase()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(player);
  });
  groups.forEach((group) => {
    const occupied = new Set();
    const sortByRating = (a, b) => num(b.rating) - num(a.rating) || String(a.player).localeCompare(b.player);
    const locked = group.filter((player) => playerDepthLock(player)).sort((a, b) => playerDepthLock(a) - playerDepthLock(b) || sortByRating(a, b));
    const unlocked = group.filter((player) => !playerDepthLock(player)).sort(sortByRating);
    locked.forEach((player) => {
      let slot = playerDepthLock(player);
      while (occupied.has(slot)) slot += 1;
      player.depth = slot;
      occupied.add(slot);
    });
    let slot = 1;
    unlocked.forEach((player) => {
      while (occupied.has(slot)) slot += 1;
      player.depth = slot;
      occupied.add(slot);
    });
  });
  return nextPlayers;
}

function depthOrderedPlayers(players = [], week = depthViewWeek()) {
  const group = [...players].filter(Boolean);
  const occupied = new Set();
  const placed = [];
  const sortByRating = (a, b) => num(b.rating) - num(a.rating) || String(a.player).localeCompare(b.player);
  const locked = group.filter((player) => playerDepthLock(player, week)).sort((a, b) => playerDepthLock(a, week) - playerDepthLock(b, week) || sortByRating(a, b));
  const unlocked = group.filter((player) => !playerDepthLock(player, week)).sort(sortByRating);
  locked.forEach((player) => {
    let slot = playerDepthLock(player, week);
    while (occupied.has(slot)) slot += 1;
    occupied.add(slot);
    placed.push({ player, slot });
  });
  let slot = 1;
  unlocked.forEach((player) => {
    while (occupied.has(slot)) slot += 1;
    occupied.add(slot);
    placed.push({ player, slot });
  });
  return placed.sort((a, b) => a.slot - b.slot || sortByRating(a.player, b.player)).map((item) => item.player);
}

function depthOrderedByPosition(players = [], week = depthViewWeek()) {
  const groups = new Map();
  players.forEach((player) => {
    const key = String(player?.position || "");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(player);
  });
  return [...groups.entries()]
    .sort(([a], [b]) => depthPositionRank(a) - depthPositionRank(b) || a.localeCompare(b))
    .flatMap(([, group]) => depthOrderedPlayers(group, week));
}

function saveDepthLockOverride(player, patch) {
  const key = sourceKey(player);
  overrides[key] = { ...(overrides[key] || {}), ...patch };
  storage.set("nflz-player-overrides", overrides);
  state.players = applyOverrides(state.data.players);
  pffPlayerMatchIndexCache = null;
}

function lockPlayerDepth(player, depth, scope = "keep", week = depthViewWeek()) {
  const slot = Math.max(1, Math.min(15, Math.floor(num(depth, 0))));
  if (!player || !slot) return false;
  const key = sourceKey(player);
  const current = overrides[key] || {};
  if (scope === "week") {
    saveDepthLockOverride(player, { weeklyDepthLocks: { ...(current.weeklyDepthLocks || {}), [depthLockWeekKey(week)]: slot } });
  } else {
    const weeklyDepthLocks = { ...(current.weeklyDepthLocks || {}) };
    delete weeklyDepthLocks[depthLockWeekKey(week)];
    saveDepthLockOverride(player, { depthLock: slot, depth: slot, weeklyDepthLocks });
  }
  return true;
}

function unlockPlayerDepth(player, scope = "all", week = depthViewWeek()) {
  if (!player) return false;
  const key = sourceKey(player);
  if (!overrides[key]) return false;
  if (scope === "week") {
    const weeklyDepthLocks = { ...(overrides[key].weeklyDepthLocks || {}) };
    delete weeklyDepthLocks[depthLockWeekKey(week)];
    overrides[key].weeklyDepthLocks = weeklyDepthLocks;
  } else {
    delete overrides[key].depthLock;
    delete overrides[key].weeklyDepthLocks;
  }
  storage.set("nflz-player-overrides", overrides);
  state.players = applyOverrides(state.data.players);
  pffPlayerMatchIndexCache = null;
  return true;
}

function promptDepthLock(key) {
  const player = findPlayer(key);
  if (!player || normalizeTeamName(player.team) === "Free Agent" || playerUnavailableLabel(player)) return;
  state.depthLockEditor = {
    playerKey: sourceKey(player),
    week: depthViewWeek(),
    depth: Math.max(1, Math.min(15, playerDepthLock(player, depthViewWeek()) || num(player.depth, 1))),
    scope: "week",
  };
  render();
}

function inferRatingChangeType(patch = {}) {
  if (patch.thumb) return "Nudge";
  return "Manual adjustment";
}

function recordRatingHistory(key, player, oldRating, newRating, type = "Manual adjustment", note = "") {
  overrides.__ratingHistory = overrides.__ratingHistory || {};
  const entry = {
    type,
    note,
    player: player.player,
    team: player.team,
    position: player.position,
    oldRating,
    newRating,
    delta: newRating - oldRating,
    at: new Date().toISOString(),
  };
  overrides.__ratingHistory[key] = [entry, ...(overrides.__ratingHistory[key] || [])].slice(0, 40);
}

function setRatingHistoryStart(at = new Date().toISOString()) {
  storage.set("nflz-rating-history-start-at", at);
}

function isAfterRatingHistoryStart(item) {
  const startAt = storage.get("nflz-rating-history-start-at", "");
  if (!startAt || !item?.at) return true;
  return String(item.at) >= String(startAt);
}

function ratingHistoryFor(player) {
  const key = sourceKey(player);
  const saved = overrides.__ratingHistory?.[key] || [];
  const recent = [];
  if (maddenRecentAdjustments[key]) {
    const item = maddenRecentAdjustments[key];
    recent.push({
      type: "Manual adjustment",
      note: item.maddenPlayer ? `Madden ${item.maddenPlayer} ${item.maddenOvr || ""}`.trim() : "Madden comparison",
      oldRating: item.oldRating,
      newRating: item.newRating,
      delta: num(item.newRating) - num(item.oldRating),
      at: item.adjustedAt,
    });
  }
  if (pffRecentAdjustments[key]) {
    const item = pffRecentAdjustments[key];
    recent.push({
      type: "PFF import",
      note: item.pffRank ? `PFF #${item.pffRank}${item.pffTotal ? `/${item.pffTotal}` : ""}` : "PFF suggestion",
      oldRating: item.oldRating,
      newRating: item.newRating,
      delta: num(item.newRating) - num(item.oldRating),
      at: item.adjustedAt,
    });
  }
  const seen = new Set();
  return [...saved, ...recent]
    .filter(isAfterRatingHistoryStart)
    .filter((item) => {
      const id = `${item.type}|${item.oldRating}|${item.newRating}|${item.at}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
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
  persistPlayer(player, { ...previous, thumb: "", ratingChangeType: "Nudge undo" });
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

function injuryWeekSortValue(week) {
  const text = String(week || "").trim();
  if (!text) return Infinity;
  if (/^Pre\d+$/i.test(text)) return Number(text.replace(/Pre/i, "")) - 10;
  const playoffOrder = { WC: 19, DIV: 20, ACC: 21, NCC: 21, SB: 22 };
  const upper = text.toUpperCase();
  return playoffOrder[upper] ?? num(text, Infinity);
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
  nav.innerHTML = navSections.map((section) => `
    <div class="nav-section ${section.title ? "" : "primary"} nav-section-${esc((section.title || "quick").toLowerCase().replace(/[^a-z0-9]+/g, "-"))}">
      ${section.title ? `<h4>${esc(section.title)}</h4>` : ""}
      ${section.pages.map(([id, label, low]) => `
        <button class="nav-btn ${state.page === id ? "active" : ""} ${low || ""}" data-page="${id}">
          <span>${label}</span><span>${state.page === id ? "*" : ""}</span>
        </button>
      `).join("")}
    </div>
  `).join("");
  document.querySelector("#week-status")?.remove();
  document.querySelector(".brand")?.insertAdjacentHTML("afterend", `
    <section id="week-status" class="week-status">
      <span>Current View</span>
      <strong>${esc(siteWeekLabel())}</strong>
      ${optionSelect("site-week", state.siteWeek, weekOptions)}
    </section>
  `);
  const mobileToggle = document.querySelector("#mobile-nav-toggle");
  mobileToggle?.setAttribute("aria-expanded", document.body.classList.contains("mobile-nav-open") ? "true" : "false");
  if (mobileToggle) {
    mobileToggle.onclick = () => {
      document.body.classList.toggle("mobile-nav-open");
      mobileToggle.setAttribute("aria-expanded", document.body.classList.contains("mobile-nav-open") ? "true" : "false");
    };
  }
  document.querySelector("#site-week")?.addEventListener("change", (event) => {
    state.siteWeek = event.target.value;
    storage.set("nflz-site-week", state.siteWeek);
    state.scheduleWeek = state.siteWeek === "auto" ? selectedSiteWeek() : state.siteWeek;
    if (state.scheduleView === "season") state.scheduleView = "week";
    render();
  });
  nav.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
    state.page = button.dataset.page;
    document.body.classList.remove("mobile-nav-open");
    document.querySelector("#mobile-nav-toggle")?.setAttribute("aria-expanded", "false");
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

function teamAbbrevFor(name, fallback = name || "") {
  const team = teamByName(name);
  const canonical = normalizeTeamName(name);
  return team?.teamAbbrev
    || state.data?.meta?.teamAbbrevs?.[canonical]
    || state.data?.meta?.teamAbbrevs?.[name]
    || pffTeamAbbrevMap[canonical]
    || pffTeamAbbrevMap[name]
    || fallback;
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

const depthPositionOrder = ["QB", "HB", "RB", "WR", "SWR", "TE", "LT", "LG", "C", "RG", "RT", "OT", "OG", "IDL", "DT", "LDT", "RDT", "EDGE", "LEDG", "REDG", "DE", "LB", "MIKE", "MLB", "WILL", "SAM", "CB", "S", "FS", "SS"];
const depthOffensePositions = new Set(["QB", "HB", "RB", "WR", "SWR", "TE", "LT", "LG", "C", "RG", "RT", "OT", "OG"]);

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

function pffPositionSlug(pos) {
  const group = groupPosition(pos);
  const map = { QB: "qb", RB: "hb", WR: "wr", TE: "te", OT: "t", OG: "g", C: "c", IDL: "di", EDGE: "ed", LB: "lb", CB: "cb", S: "s" };
  return map[group] || String(group || "").toLowerCase();
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

function depthLockControl(player, displayDepth, week = depthViewWeek()) {
  const unavailable = playerUnavailableLabel(player, week);
  if (unavailable || normalizeTeamName(player?.team) === "Free Agent") return depthBadge(displayDepth);
  const locked = playerDepthLock(player, week);
  const weeklyLocked = Boolean(player?.weeklyDepthLocks?.[depthLockWeekKey(week)]);
  return `<button class="depth-lock-button ${locked ? "locked" : ""} ${weeklyLocked ? "weekly" : ""}" data-depth-lock-key="${esc(sourceKey(player))}" title="${locked ? `Locked into ${player.position}${locked}${weeklyLocked ? ` for ${weekOptionLabel(week)}` : ""}. Click to edit or unlock.` : "Click to lock this depth spot."}">${depthBadge(displayDepth)}${locked ? `<span class="depth-lock-glyph" aria-label="Locked"></span>` : ""}</button>`;
}

function injuryStatusText(player) {
  return String(player?.injury || "Healthy").trim();
}

function playerUnavailableLabel(player, week = selectedSiteWeek()) {
  const status = injuryStatusText(player);
  if (!status || /^healthy$/i.test(status)) return "";
  const label = /suspended/i.test(status) ? "SUS" : "INJ";
  if (/out\s+for\s+season/i.test(status)) return label;
  if (/ir\s+thru|out\s+thru|\*?likely\*?\s+out\s+thru|suspended\s+thru/i.test(status)) {
    const current = injuryWeekSortValue(week);
    const thru = injuryWeekSortValue(player?.week);
    if (!Number.isFinite(thru)) return label;
    return Number.isFinite(current) && current <= thru ? label : "";
  }
  return label;
}

function isPlayerAvailable(player, week = selectedSiteWeek()) {
  return !playerUnavailableLabel(player, week);
}

function injuryStatusNeedsReturnReview(player) {
  const status = injuryStatusText(player);
  if (!/ir\s+thru|out\s+thru|\*?likely\*?\s+out\s+thru/i.test(status)) return false;
  const current = injuryWeekSortValue(selectedSiteWeek());
  const returnThrough = injuryWeekSortValue(player?.week);
  return Number.isFinite(current) && Number.isFinite(returnThrough) && current > returnThrough;
}

function injuryReviewDuePlayers() {
  return state.players
    .filter((player) => normalizeTeamName(player.team) !== "Free Agent")
    .filter(injuryStatusNeedsReturnReview)
    .sort((a, b) => injuryWeekSortValue(a.week) - injuryWeekSortValue(b.week) || String(a.team).localeCompare(b.team) || String(a.player).localeCompare(b.player));
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
const ourladsCheckScanUrl = location.protocol === "file:" ? "http://127.0.0.1:8787/api/ourlads-check-scan" : "/api/ourlads-check-scan";
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

function markDepthCheckResolved(item, shouldSave = true) {
  const key = depthCheckResolvedKey(item);
  if (!key) return;
  depthResolvedResults[key] = true;
  if (shouldSave) storage.set("nflz-depth-resolved-results", depthResolvedResults);
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

function repairStaleOurLadsFreeAgentOverrides(data) {
  if (!data?.players?.length) return 0;
  let ourladsPlayers = new Map();
  if (window.OURLADS_DEPTH_HTML) try {
    ourladsPlayers = parseOurladsDepthChart(window.OURLADS_DEPTH_HTML);
  } catch {}
  const generatedRows = window.OURLADS_DEPTH_CHECK?.results || [];
  const hasGeneratedRows = generatedRows.length > 100;
  let fixed = 0;
  (data.players || []).forEach((basePlayer) => {
    const key = playerKey(basePlayer);
    const patch = overrides[key];
    if (!patch || normalizeTeamName(patch.team) !== "Free Agent") return;
    if (!isIncludedPlayer(basePlayer)) return;
    const currentTeams = [...(ourladsPlayers.get(cleanPlayerName(basePlayer.player)) || [])].map(normalizeTeamName);
    const parsedSaysOriginalTeam = currentTeams.includes(normalizeTeamName(basePlayer.team));
    const generatedStillFlagsPlayer = hasGeneratedRows && generatedRows.some((row) => (
      ["free-agent", "move", "duplicate"].includes(row.kind)
      && cleanPlayerName(row.player) === cleanPlayerName(basePlayer.player)
      && normalizeTeamName(row.fromTeam) === normalizeTeamName(basePlayer.team)
    ));
    if (!parsedSaysOriginalTeam && (!hasGeneratedRows || generatedStillFlagsPlayer)) return;
    delete patch.team;
    delete patch.teamAbbrev;
    fixed += 1;
    if (!Object.keys(patch).length) delete overrides[key];
  });
  if (fixed) storage.set("nflz-player-overrides", overrides);
  return fixed;
}

function repairKnownRosterExceptions(data) {
  const known = [
    { player: "Nate Landman", team: "LA Rams", teamAbbrev: "LAR", position: "LB" },
    { player: "Omar Speights", team: "LA Rams", teamAbbrev: "LAR", position: "LB" },
    { player: "Grant Stuard", team: "LA Rams", teamAbbrev: "LAR", position: "LB" },
    { player: "Shaun Dolac", team: "LA Rams", teamAbbrev: "LAR", position: "LB" },
  ];
  let fixed = 0;
  known.forEach((expected) => {
    const base = (data?.players || []).find((player) => (
      cleanPlayerName(player.player) === cleanPlayerName(expected.player)
      && normalizeTeamName(player.team) === normalizeTeamName(expected.team)
    ));
    if (!base) return;
    const key = playerKey(base);
    const patch = overrides[key];
    if (!patch) return;
    const wronglyDeleted = patch.deleted === true;
    const wrongTeam = Object.prototype.hasOwnProperty.call(patch, "team") && normalizeTeamName(patch.team) !== normalizeTeamName(expected.team);
    const wrongPosition = Object.prototype.hasOwnProperty.call(patch, "position") && String(patch.position || "").toUpperCase() !== expected.position;
    if (!wronglyDeleted && !wrongTeam && !wrongPosition) return;
    delete patch.deleted;
    delete patch.team;
    delete patch.teamAbbrev;
    delete patch.position;
    delete patch.rawPosition;
    delete patch.depth;
    delete patch.depthLock;
    fixed += 1;
    if (!Object.keys(patch).length) delete overrides[key];
  });
  if (fixed) storage.set("nflz-player-overrides", overrides);
  return fixed;
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
    if (location.protocol !== "file:") {
      state.depthCheck = { status: "checking", results: [], error: "Running local OurLads scan helper", source: "live" };
      render();
      const scanResponse = await fetch(ourladsCheckScanUrl, { cache: "no-store" });
      if (scanResponse.ok) {
        const payload = await scanResponse.json();
        window.OURLADS_DEPTH_CHECK = payload;
        state.depthCheck = {
          status: "review",
          results: unresolvedDepthCheckResults(payload.results || []),
          error: "",
          source: "live",
          fetchedAt: payload.fetchedAt,
        };
        state.depthCheckNotice = `Updated live OurLads scan from ${payload.fetchedAt || "the local scan helper"}.`;
        bumpDepthCheckVersion();
        render();
        return;
      }
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
    if (window.OURLADS_DEPTH_CHECK?.results?.length) {
      state.depthCheck = {
        status: "review",
        results: unresolvedDepthCheckResults(window.OURLADS_DEPTH_CHECK.results),
        error: "",
        source: "codex",
        fetchedAt: window.OURLADS_DEPTH_CHECK.fetchedAt,
      };
      state.depthCheckNotice = `Live OurLads scan was blocked, so I loaded the generated scan from ${window.OURLADS_DEPTH_CHECK.fetchedAt || "the bundled file"}. Run refresh-ourlads-check.bat to update it.`;
      bumpDepthCheckVersion();
      render();
      return;
    }
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

function applyDepthCheckResult(index, overrideTeam = "", shouldRender = true, options = {}) {
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
  if (toTeam === "Free Agent") Object.assign(patch, applyThumbMath(player, "down", 2), { ratingChangeType: "Nudge", ratingChangeNote: "Moved to Free Agent" });
  const deferRefresh = Boolean(options.deferRefresh);
  persistPlayer(player, patch, { deferRefresh });
  item.applied = true;
  item.appliedTo = toTeam;
  markDepthCheckResolved(item, !deferRefresh);
  if (!deferRefresh) state.players = applyOverrides(state.data.players);
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

function safeDepthCheckRows(rows = pendingDepthActivityRows("All Activities")) {
  return rows.filter(({ item }) => item.kind === "move" || (item.kind === "free-agent" && !freeAgentNameMatchCandidates(item).length));
}

const yieldToBrowser = () => new Promise((resolve) => setTimeout(resolve, 0));

async function applyDepthCheckActivity(activity = state.depthCheckActivity) {
  const rows = pendingDepthActivityRows(activity);
  const applyBatch = async (workRows, worker, label) => {
    let applied = 0;
    const total = workRows.length;
    const chunkSize = 20;
    if (!total) {
      state.depthCheckNotice = `${label}: nothing automatically applicable in this view.`;
      render();
      return;
    }
    state.depthCheckNotice = `${label}: 0 of ${total}`;
    render();
    for (let start = 0; start < workRows.length; start += chunkSize) {
      workRows.slice(start, start + chunkSize).forEach(({ item, index }) => {
        if (worker(item, index)) applied += 1;
      });
      storage.set("nflz-player-overrides", overrides);
      storage.set("nflz-depth-resolved-results", depthResolvedResults);
      state.players = applyOverrides(state.data.players);
      pffPlayerMatchIndexCache = null;
      state.depthCheckNotice = `${label}: ${Math.min(start + chunkSize, total)} of ${total}`;
      render();
      await yieldToBrowser();
    }
    state.depthCheck.results = unresolvedDepthCheckResults(state.depthCheck.results);
    state.depthCheckNotice = `${label}: applied ${applied} change${applied === 1 ? "" : "s"}.`;
    bumpDepthCheckVersion();
    render();
  };
  if (activity === "All Activities") {
    await applyBatch(safeDepthCheckRows(rows), (item, index) => {
      applyDepthCheckResult(index, "", false, { deferRefresh: true });
      return true;
    }, "Applying safe depth chart changes");
    return;
  }
  if (activity === "Missing Player") {
    addAllMissingDepthCheckPlayers();
    return;
  }
  await applyBatch(rows, (item, index) => {
    if (activity === "Team Changed" && item.kind === "move") {
      applyDepthCheckResult(index, "", false, { deferRefresh: true });
      return true;
    }
    if (activity === "Free Agent" && item.kind === "free-agent" && !freeAgentNameMatchCandidates(item).length) {
      applyDepthCheckResult(index, "", false, { deferRefresh: true });
      return true;
    }
    if (activity === "Name Match Suggested" && item.kind === "free-agent") {
      const matches = freeAgentNameMatchCandidates(item);
      if (matches.length === 1) {
        applyDepthCheckNameMatch(index, matches[0].player, matches[0].toTeam || "", false, { deferRefresh: true });
        return true;
      }
    }
    return false;
  }, `Applying ${activity}`);
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

function applyDepthCheckNameMatch(freeAgentIndex, matchName, matchTeam, shouldRender = true, options = {}) {
  const item = state.depthCheck.results[freeAgentIndex];
  if (!item || item.kind !== "free-agent" || !matchName) return;
  const deferRefresh = Boolean(options.deferRefresh);
  const player = findDepthCheckPlayer(item);
  if (!player) {
    const existingMatch = state.players.find((entry) => {
      if (cleanPlayerName(entry.player) !== cleanPlayerName(matchName)) return false;
      return !matchTeam || matchTeam === "Free Agent" || entry.team === matchTeam;
    });
    if (existingMatch) {
      item.applied = true;
      item.appliedTo = `already renamed to ${matchName}`;
      markDepthCheckResolved(item, !deferRefresh);
      (state.depthCheck.results || []).forEach((candidate) => {
        if (candidate.kind === "missing-player" && cleanPlayerName(candidate.player) === cleanPlayerName(matchName) && (!matchTeam || candidate.toTeam === matchTeam)) {
          candidate.applied = true;
          candidate.appliedTo = "matched existing player";
          markDepthCheckResolved(candidate, !deferRefresh);
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
  persistPlayer(player, patch, { deferRefresh });
  item.applied = true;
  item.appliedTo = `renamed to ${matchName}`;
  markDepthCheckResolved(item, !deferRefresh);
  state.depthCheckNotice = `Applied name change for ${baseReviewPlayerName(matchName)}.`;
  (state.depthCheck.results || []).forEach((candidate) => {
    if (candidate.kind === "missing-player" && cleanPlayerName(candidate.player) === cleanPlayerName(matchName) && candidate.toTeam === matchTeam) {
      candidate.applied = true;
      candidate.appliedTo = "matched existing player";
      markDepthCheckResolved(candidate, !deferRefresh);
    }
  });
  if (!deferRefresh) state.players = applyOverrides(state.data.players);
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

function injuryCheckResolvedKey(item) {
  const parts = [
    item?.playerKey || cleanPlayerName(item?.player || ""),
    normalizeTeamName(item?.team || ""),
    String(item?.espnTag || "").trim().toLowerCase(),
    String(item?.espnCommentDate || "").trim().toLowerCase(),
    String(item?.espnReturnDate || "").trim().toLowerCase(),
    String(item?.espnComment || "").replace(/\s+/g, " ").trim().toLowerCase(),
  ];
  return parts.join("|");
}

function markInjuryCheckResolved(item, shouldSave = true) {
  const key = injuryCheckResolvedKey(item);
  if (!key.trim()) return;
  injuryResolvedResults[key] = {
    appliedAt: new Date().toISOString(),
    player: item?.player || "",
    team: item?.team || "",
  };
  if (shouldSave) storage.set("nflz-injury-resolved-results", injuryResolvedResults);
}

function unresolvedInjuryCheckResults(results) {
  return (results || []).filter((item) => !injuryResolvedResults[injuryCheckResolvedKey(item)]);
}

function runInjuryCheck() {
  if (!window.ESPN_INJURY_CHECK?.results) {
    state.injuryCheck = { status: "empty", results: [], error: "No ESPN injury scan file is loaded. Run refresh-espn-injury-check.bat, reload the app, then scan again.", source: "codex" };
    render();
    return;
  }
  state.injuryCheck = {
    status: "review",
    results: unresolvedInjuryCheckResults(window.ESPN_INJURY_CHECK.results).map((item) => ({ ...item })),
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

function injuryCheckCategory(item) {
  if (injuryCheckAlreadyPlaced(item)) return "Already Placed";
  if (injuryCheckIsIdle(item)) return "Idle Injury Status Alerts";
  const status = String(effectiveInjurySuggestedStatus(item) || item?.espnTag || "").toLowerCase();
  const comment = String(item?.espnComment || "").toLowerCase();
  const text = `${status} ${comment}`;
  if (injuryTextMeansSeasonEnding(text)) return "Out for Season";
  if (injuryTextMeansReserveList(text)) return "Injured Reserve";
  if (/likely/.test(text) && /out/.test(text)) return "Likely Out";
  if (/out\s+thru|out\s+through|\bout\b/.test(text)) return "Out Thru";
  if (/suspend/.test(text)) return "Suspended";
  return "Other";
}

function injuryCheckSuggestedAction(item) {
  if (injuryCheckAlreadyPlaced(item)) return "Already placed";
  if (injuryCheckIsIdle(item)) return "Keep as is";
  const status = effectiveInjurySuggestedStatus(item);
  const week = effectiveInjurySuggestedWeek(item);
  if (/^healthy$/i.test(status)) return "Mark Healthy";
  if (/out\s+for\s+season/i.test(status)) return "Out for Season";
  if (/ir\s+thru/i.test(status)) return `IR thru ${week || "review"}`;
  if (/likely.*out\s+thru/i.test(status)) return `Likely out thru ${week || "review"}`;
  if (/out\s+thru/i.test(status)) return `Out thru ${week || "review"}`;
  if (/suspended/i.test(status)) return `Suspended thru ${week || "review"}`;
  return status || "Review";
}

function injuryCheckIsIdle(item) {
  const player = findInjuryCheckPlayer(item);
  const suggestedStatus = effectiveInjurySuggestedStatus(item);
  const suggestedWeek = effectiveInjurySuggestedWeek(item);
  if (!player) return /^healthy$/i.test(suggestedStatus);
  const currentStatus = injuryStatusText(player);
  const currentWeek = String(player.week || "");
  if (/^healthy$/i.test(suggestedStatus) && /^healthy$/i.test(currentStatus)) return true;
  const patch = injuryPatchForStatus(suggestedStatus, suggestedWeek);
  return String(patch.injury || "Healthy") === String(currentStatus || "Healthy")
    && String(patch.week || "") === currentWeek;
}

function injuryCheckCategoryOptions() {
  const counts = {};
  (state.injuryCheck.results || []).forEach((item) => {
    if (item.applied || item.ignored) return;
    const category = injuryCheckCategory(item);
    counts[category] = (counts[category] || 0) + 1;
  });
  const hiddenCategories = new Set(["Already Placed", "Idle Injury Status Alerts"]);
  const visibleTotal = Object.entries(counts).reduce((sum, [category, value]) => sum + (hiddenCategories.has(category) ? 0 : value), 0);
  const ordered = ["All Categories", "Injured Reserve", "Likely Out", "Out Thru", "Out for Season", "Suspended", "Other", "Already Placed", "Idle Injury Status Alerts"];
  return ordered
    .filter((category) => category === "All Categories" || counts[category])
    .map((category) => [category, category === "All Categories" ? `All Categories (${visibleTotal})` : `${category} (${counts[category]})`]);
}

function filteredInjuryCheckRows() {
  return (state.injuryCheck.results || [])
    .map((item, index) => ({ item, index, category: injuryCheckCategory(item) }))
    .filter((row) => ["Already Placed", "Idle Injury Status Alerts"].includes(state.injuryCheckActivity) || !["Already Placed", "Idle Injury Status Alerts"].includes(row.category))
    .filter((row) => state.injuryCheckActivity === "All Categories" || row.category === state.injuryCheckActivity);
}

function injuryCheckAlreadyPlaced(item) {
  const player = findInjuryCheckPlayer(item);
  if (!player) return false;
  const status = injuryStatusText(player);
  if (!status || /^healthy$/i.test(status)) return false;
  return !injuryStatusNeedsReturnReview(player);
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
  const value = String(text || "");
  if (injuryTextMeansActivePupNfi(value)) return false;
  return /\bir\b|injured reserve|reserve\/pup|reserve-pup|reserve pup|reserve\/physically unable|reserve physically unable|reserve\/nfi|reserve-nfi|reserve nfi|reserve\/non-football|reserve non-football/.test(value);
}

function effectiveInjurySuggestedStatus(item) {
  const status = String(item?.suggestedStatus || "").trim();
  const tag = String(item?.espnTag || "").toLowerCase();
  const comment = String(item?.espnComment || "").toLowerCase();
  const text = `${tag} ${comment}`;
  if (injuryTextMeansHealthy(text)) return "Healthy";
  if (/questionable|doubtful/.test(tag) && !comment.trim()) return "Healthy";
  if (injuryTextMeansSeasonEnding(text)) return "OUT for Season";
  if (injuryTextMeansActivePupNfi(text)) return "OUT thru Week ___";
  if (injuryTextMeansReserveList(text)) return "IR Thru Week ___";
  return status || "Healthy";
}

function effectiveInjurySuggestedWeek(item) {
  const status = effectiveInjurySuggestedStatus(item);
  const tag = String(item?.espnTag || "").toLowerCase();
  const comment = String(item?.espnComment || "").toLowerCase();
  const text = `${tag} ${comment}`;
  if (/^healthy$|out\s+for\s+season/i.test(status)) return "";
  if (injuryTextMeansActivePupNfi(text)) return "Pre3";
  if (injuryTextMeansCampRampUp(text) && String(selectedSiteWeek()).startsWith("Pre")) return "Pre3";
  if (/out\s+thru|likely.*out\s+thru|suspended\s+thru/i.test(status) && String(selectedSiteWeek()).startsWith("Pre")) return currentInjuryReviewWeek();
  return item?.suggestedWeek || defaultInjuryWeekForStatus(status);
}

function applyInjuryCheckResult(index, options = {}) {
  const item = state.injuryCheck.results[index];
  if (!item || item.ignored) return;
  const player = findInjuryCheckPlayer(item);
  if (!player) return;
  const status = document.querySelector(`[data-injury-status-index="${index}"]`)?.value || effectiveInjurySuggestedStatus(item) || "Healthy";
  const week = document.querySelector(`[data-injury-week-index="${index}"]`)?.value || effectiveInjurySuggestedWeek(item) || "";
  const patch = injuryPatchForStatus(status, week);
  persistPlayer(player, patch, { deferRefresh: options.skipRender });
  item.applied = true;
  item.appliedTo = `${status}${patch.week ? ` / ${patch.week}` : ""}`;
  markInjuryCheckResolved(item, !options.skipRender);
  if (!options.skipRender) render();
}

function ignoreInjuryCheckResult(index) {
  const item = state.injuryCheck.results[index];
  if (!item) return;
  item.ignored = true;
  render();
}

function resolveIdleInjuryCheckResult(index, options = {}) {
  const item = state.injuryCheck.results[index];
  if (!item) return;
  item.applied = true;
  item.appliedTo = "kept as is";
  markInjuryCheckResolved(item, !options.skipRender);
  if (!options.skipRender) {
    state.injuryCheck.results = unresolvedInjuryCheckResults(state.injuryCheck.results);
    render();
  }
}

async function applyShownInjuryCheckResults() {
  const rows = filteredInjuryCheckRows()
    .filter(({ item, category }) => category !== "Already Placed" && !item.applied && !item.ignored);
  for (let i = 0; i < rows.length; i += 25) {
    rows.slice(i, i + 25).forEach(({ index, category }) => {
      if (category === "Idle Injury Status Alerts") resolveIdleInjuryCheckResult(index, { skipRender: true });
      else applyInjuryCheckResult(index, { skipRender: true });
    });
    await yieldToBrowser();
  }
  storage.set("nflz-player-overrides", overrides);
  storage.set("nflz-injury-resolved-results", injuryResolvedResults);
  state.players = applyOverrides(state.data.players);
  state.injuryCheck.results = unresolvedInjuryCheckResults(state.injuryCheck.results);
  pffPlayerMatchIndexCache = null;
  render();
}

function clearInjuryReviewDue(playerKeyValue) {
  const player = findPlayer(playerKeyValue);
  if (!player) return;
  persistPlayer(player, { injury: "Healthy", week: "" });
  render();
}

function keepInjuryReviewDue(playerKeyValue) {
  const player = findPlayer(playerKeyValue);
  if (!player) return;
  const week = selectedSiteWeek();
  persistPlayer(player, { week });
  render();
}

function renderInjuryReviewDuePanel() {
  const duePlayers = injuryReviewDuePlayers();
  if (!duePlayers.length) return "";
  const rows = duePlayers.map((player) => `
    <tr>
      <td>${playerNameButton(player)}</td>
      <td>${teamCellByName(player.team)}</td>
      <td><span class="review-chip">${esc(player.injury)}</span></td>
      <td>${esc(player.week ? weekDisplay(player.week) : "-")}</td>
      <td><span class="depth-review-actions"><button class="mini-action injury-review-clear primary" data-player-key="${esc(sourceKey(player))}">Mark Healthy</button><button class="mini-action injury-review-keep" data-player-key="${esc(sourceKey(player))}">Keep Injured</button></span></td>
    </tr>
  `).join("");
  return `
    <div class="injury-due-box">
      <div>
        <strong>${duePlayers.length} injury statuses need review</strong>
        <span>Current site week is ${esc(siteWeekLabel())}. These players were marked through an earlier week.</span>
      </div>
      <div class="table-scroll review-scroll injury-review-scroll"><table class="review-table injury-review-table"><thead><tr><th>Player</th><th>Team</th><th>Status</th><th>Thru</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table></div>
    </div>
  `;
}

function indexedInjuryStatusSelect(index, value) {
  return `<select class="injury-review-status" data-injury-status-index="${index}">${injuryStatuses.map((item) => `<option ${String(value || "Healthy") === item ? "selected" : ""}>${item}</option>`).join("")}</select>`;
}

function indexedInjuryWeekSelect(index, value, status = "") {
  const selected = value || defaultInjuryWeekForStatus(status);
  return `<select class="injury-review-week" data-injury-week-index="${index}">${injuryWeeks.map((item) => `<option ${String(selected || "") === item ? "selected" : ""}>${item}</option>`).join("")}</select>`;
}

function renderInjuryCheckPanel() {
  const check = state.injuryCheck;
  const categoryOptions = injuryCheckCategoryOptions();
  if (!categoryOptions.some((option) => option[0] === state.injuryCheckActivity)) state.injuryCheckActivity = "All Categories";
  const rowItems = filteredInjuryCheckRows();
  const pendingShown = rowItems.filter(({ item, category }) => category !== "Already Placed" && !item.applied && !item.ignored).length;
  const rows = rowItems.map(({ item, index, category }) => {
    const commentText = item.espnComment || "No ESPN comment.";
    const commentDate = item.espnCommentDate || "";
    const cleanedComment = commentDate
      ? String(commentText).replace(new RegExp(`^\\s*${commentDate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:?\\s*`, "i"), "")
      : commentText;
    const tagTitle = [item.espnTag, item.espnReturnDate ? `Return: ${item.espnReturnDate}` : ""].filter(Boolean).join(" / ");
    return `
      <tr class="${item.applied ? "applied" : ""} ${item.ignored ? "ignored" : ""}">
        <td>${playerNameButton(findInjuryCheckPlayer(item) || { player: item.player, team: item.team, position: item.position, _sourceKey: item.playerKey })}</td>
        <td>${teamCellByName(item.team)}</td>
        <td><span class="review-chip">${esc(category)}</span></td>
        <td><span class="review-chip injury-action-chip ${category === "Idle Injury Status Alerts" ? "idle" : ""}">${esc(injuryCheckSuggestedAction(item))}</span></td>
        <td title="${esc(tagTitle)}"><span class="review-chip injury-tag-chip">${esc(item.espnTag)}</span>${item.espnReturnDate ? `<small>${esc(item.espnReturnDate)}</small>` : ""}</td>
        <td class="injury-comment-cell" title="${esc(commentText)}">${commentDate ? `<b>${esc(commentDate)}</b>` : ""}<span>${esc(cleanedComment)}</span></td>
        <td><span class="injury-review-controls">${indexedInjuryStatusSelect(index, effectiveInjurySuggestedStatus(item))}${indexedInjuryWeekSelect(index, effectiveInjurySuggestedWeek(item), effectiveInjurySuggestedStatus(item))}</span></td>
        <td>${category === "Already Placed" ? `<span class="applied-chip">Already placed</span>` : item.applied ? `<span class="applied-chip">Applied: ${esc(item.appliedTo || "")}</span>` : item.ignored ? "<span class='ignored-chip'>Ignored</span>" : category === "Idle Injury Status Alerts" ? `<span class="depth-review-actions"><button class="mini-action injury-idle-resolve" data-injury-check-index="${index}">Mark Reviewed</button><button class="mini-action injury-ignore-one" data-injury-check-index="${index}">Ignore</button></span>` : `<span class="depth-review-actions"><button class="mini-action injury-apply-one" data-injury-check-index="${index}">Apply Revised</button><button class="mini-action injury-ignore-one" data-injury-check-index="${index}">Ignore</button></span>`}</td>
      </tr>
    `;
  }).join("");
  return `
    <section class="depth-check injury-check">
      <div class="depth-check-head">
        <div>
          <h3>Injury Check</h3>
          <p>Reviews ESPN injury tags and comments, then suggests your injury status and return week. Adjust the dropdowns before applying if needed.</p>
        </div>
      </div>
      ${renderInjuryReviewDuePanel()}
      ${check.status === "checking" ? `<div class="depth-scan-progress"><div class="depth-scan-bar"><span></span></div><p>${esc(check.error || "Loading ESPN injury check")}</p></div>` : ""}
      ${check.status === "empty" ? `<p class="depth-check-note">${esc(check.error)}</p>` : ""}
      ${check.status === "review" ? `<p class="depth-check-note">Showing ESPN injury scan from ${esc(check.fetchedAt || "latest refresh")}. Idle alerts and already placed statuses are hidden from All Categories so you can focus on real changes.</p><div class="depth-check-controls">${optionSelect("injury-check-activity", state.injuryCheckActivity, categoryOptions)}${pendingShown ? `<button id="injury-check-apply-shown" class="mini-action primary">${state.injuryCheckActivity === "Idle Injury Status Alerts" ? "Mark Idle Reviewed" : `Apply ${state.injuryCheckActivity === "All Categories" ? "Shown Injuries" : esc(state.injuryCheckActivity)}`} (${pendingShown})</button>` : `<span class="depth-check-note">No pending injuries in this category.</span>`}</div><div class="table-scroll review-scroll injury-review-scroll"><table class="review-table injury-review-table"><thead><tr><th>Player</th><th>Team</th><th>Category</th><th>Suggested Action</th><th>ESPN Tag</th><th>ESPN Comment</th><th>Suggested / Revise</th><th>Action</th></tr></thead><tbody>${rows || '<tr><td colspan="8">No ESPN injury matches found.</td></tr>'}</tbody></table></div>` : ""}
    </section>
  `;
}

function renderDepthCheckPanel() {
  const check = state.depthCheck;
  const activityOptions = depthCheckActivityOptions();
  if (!activityOptions.some((option) => Array.isArray(option) ? option[0] === state.depthCheckActivity : option === state.depthCheckActivity)) state.depthCheckActivity = "All Activities";
  const selectedActivityRows = pendingDepthActivityRows(state.depthCheckActivity);
  const bulkCount = state.depthCheckActivity === "All Activities"
    ? safeDepthCheckRows(selectedActivityRows).length
    : selectedActivityRows.filter(({ item, activity }) =>
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
      ${check.status === "review" ? `<div class="depth-check-controls">${optionSelect("depth-check-activity", state.depthCheckActivity, activityOptions)}${bulkCount ? `<button id="depth-check-apply-all" class="mini-action primary">Apply ${state.depthCheckActivity === "All Activities" ? "Safe Changes" : esc(state.depthCheckActivity)} (${bulkCount})</button>` : `<span class="depth-check-note">No automatic apply actions in this view.</span>`}</div>` : ""}
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

function schedulePlayersFor(teamName, group, week = selectedSiteWeek()) {
  const exactPositions = new Set(["LT", "LG", "C", "RG", "RT"]);
  const wantedTeam = normalizeScheduleTeam(teamName);
  const filtered = state.players
    .filter((player) => {
      if (normalizeScheduleTeam(player.team) !== wantedTeam || !isPlayerAvailable(player, week) || !Number.isFinite(Number(player.rating))) return false;
      if (exactPositions.has(group)) return player.position === group;
      return playerGroupForSchedule(player) === group;
    });
  return depthOrderedPlayers(filtered, week);
}

function weightedAverage(values) {
  const rows = values.filter((item) => Number.isFinite(Number(item.value)) && Number.isFinite(Number(item.weight)) && Number(item.weight) > 0);
  const totalWeight = rows.reduce((sum, item) => sum + Number(item.weight), 0);
  return totalWeight ? rows.reduce((sum, item) => sum + (Number(item.value) * Number(item.weight)), 0) / totalWeight : "";
}

function preseasonPositionScore(teamName, group, week = selectedSiteWeek()) {
  const multipliers = state.preseasonDepthMultipliers[group] || defaultPreseasonDepthMultipliers[group] || [100];
  if (group === "OL") {
    const linePositions = ["LT", "LG", "C", "RG", "RT"];
    const values = linePositions.flatMap((position) => {
      const players = schedulePlayersFor(teamName, position, week).slice(0, multipliers.length);
      return players.map((player, index) => ({ value: player.rating, weight: num(multipliers[index], 100) / 100 }));
    });
    return weightedAverage(values);
  }
  const players = schedulePlayersFor(teamName, group, week).slice(0, multipliers.length);
  return weightedAverage(players.map((player, index) => ({ value: player.rating, weight: num(multipliers[index], 100) / 100 })));
}

function depthMultiplierPositionScore(teamName, group, multipliersByGroup, defaultByGroup, week = selectedSiteWeek()) {
  const multipliers = multipliersByGroup[group] || defaultByGroup[group] || [100];
  if (group === "OL") {
    const linePositions = ["LT", "LG", "C", "RG", "RT"];
    const values = linePositions.flatMap((position) => {
      const players = schedulePlayersFor(teamName, position, week).slice(0, multipliers.length);
      return players.map((player, index) => ({ value: player.rating, weight: num(multipliers[index], 100) / 100 }));
    });
    return weightedAverage(values);
  }
  const players = schedulePlayersFor(teamName, group, week).slice(0, multipliers.length);
  return weightedAverage(players.map((player, index) => ({ value: player.rating, weight: num(multipliers[index], 100) / 100 })));
}

function regularPositionScore(team, group, week = selectedSiteWeek()) {
  return depthMultiplierPositionScore(team.team, group, state.regularDepthMultipliers, defaultRegularDepthMultipliers, week);
}

function schedulePositionScore(team, group, mode, week = selectedSiteWeek()) {
  if (!team) return "";
  const key = `pos|${mode}|${week}|${team.team}|${group}`;
  if (scheduleProjectionCache.has(key)) return scheduleProjectionCache.get(key);
  const value = mode === "preseason" ? preseasonPositionScore(team.team, group, week) : regularPositionScore(team, group, week);
  scheduleProjectionCache.set(key, value);
  return value;
}

function scheduleComposite(team, mode, week = selectedSiteWeek()) {
  if (!team) return "";
  const key = `comp|${mode}|${week}|${team.team}`;
  if (scheduleProjectionCache.has(key)) return scheduleProjectionCache.get(key);
  const rows = Object.keys(defaultSchedulePositionWeights).map((group) => ({
    value: schedulePositionScore(team, group, mode, week),
    weight: num(state.schedulePositionWeights[group], defaultSchedulePositionWeights[group]),
  }));
  const value = weightedAverage(rows);
  scheduleProjectionCache.set(key, value);
  return value;
}

function scheduleSideComposite(team, side, mode, week = selectedSiteWeek()) {
  if (!team) return "";
  const key = `side|${mode}|${week}|${team.team}|${side}`;
  if (scheduleProjectionCache.has(key)) return scheduleProjectionCache.get(key);
  const groups = side === "defense" ? ["IDL", "EDGE", "LB", "CB", "S"] : ["QB", "RB", "WR", "TE", "OL"];
  const value = weightedAverage(groups.map((group) => ({
    value: schedulePositionScore(team, group, mode, week),
    weight: num(state.schedulePositionWeights[group], defaultSchedulePositionWeights[group]),
  })));
  scheduleProjectionCache.set(key, value);
  return value;
}

function scheduleLeagueSideAverage(side, mode, week = selectedSiteWeek()) {
  const key = `league-side|${mode}|${week}|${side}`;
  if (scheduleProjectionCache.has(key)) return scheduleProjectionCache.get(key);
  const value = weightedAverage((state.data?.teams || []).map((team) => ({
    value: scheduleSideComposite(team, side, mode, week),
    weight: 1,
  })));
  scheduleProjectionCache.set(key, value);
  return value;
}

function scheduleOffensePoints(team, mode, week = selectedSiteWeek()) {
  const teamOffense = scheduleSideComposite(team, "offense", mode, week);
  const leagueOffense = scheduleLeagueSideAverage("offense", mode, week);
  return scheduleScoreTuning.offenseBase + ((num(teamOffense, leagueOffense) - num(leagueOffense, 84)) * scheduleScoreTuning.offenseScale);
}

function scheduleDefensePointsAllowed(team, mode, week = selectedSiteWeek()) {
  const teamDefense = scheduleSideComposite(team, "defense", mode, week);
  const leagueDefense = scheduleLeagueSideAverage("defense", mode, week);
  return scheduleScoreTuning.defenseAllowedBase - ((num(teamDefense, leagueDefense) - num(leagueDefense, 84)) * scheduleScoreTuning.defenseScale);
}

function scheduleHomeAdvantage(game, mode) {
  if (isNeutralSiteGame(game)) return 0;
  if (String(game.week) === "Playoff" && Number.isFinite(Number(game.homeAdvantage))) return num(game.homeAdvantage);
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

function scheduleTeamProjectionScore(team, opponent, mode, homeAdvantage = 0, week = selectedSiteWeek()) {
  return ((scheduleOffensePoints(team, mode, week) + scheduleDefensePointsAllowed(opponent, mode, week)) / 2) + num(homeAdvantage, 0);
}

function scheduleProjection(game) {
  const mode = scheduleActiveMode(game);
  const visitorTeam = teamByName(game.visitor);
  const homeTeam = teamByName(game.home);
  if (visitorTeam && homeTeam) {
    let visitorRaw = scheduleTeamProjectionScore(visitorTeam, homeTeam, mode, 0, game.week);
    let homeRaw = scheduleTeamProjectionScore(homeTeam, visitorTeam, mode, scheduleHomeAdvantage(game, mode), game.week);
    if (mode === "preseason") {
      const rawTotal = Math.max(1, visitorRaw + homeRaw);
      const targetTotal = Math.max(
        scheduleScoreTuning.preseasonTotalMin,
        Math.min(scheduleScoreTuning.preseasonTotalMax, rawTotal * scheduleScoreTuning.preseasonTotalScale)
      );
      const totalScale = targetTotal / rawTotal;
      visitorRaw *= totalScale;
      homeRaw *= totalScale;
    }
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

function draftKingsOddsKey(game) {
  return [
    String(game?.eventId || ""),
    String(game?.date || ""),
    normalizeTeamName(normalizeScheduleTeam(game?.visitor || "")),
    normalizeTeamName(normalizeScheduleTeam(game?.home || "")),
  ].join("|");
}

function isPastScheduleDate(dateText) {
  if (!dateText) return false;
  const gameDate = new Date(`${dateText}T23:59:59`);
  return Number.isFinite(gameDate.getTime()) && gameDate < new Date();
}

function mergeDraftKingsOddsScan(freshScan, existingScan = window.DRAFTKINGS_ODDS) {
  const freshGames = freshScan?.games || [];
  const existingGames = existingScan?.games || [];
  const byKey = new Map(freshGames.map((game) => [draftKingsOddsKey(game), game]));
  existingGames.forEach((game) => {
    if (isPastScheduleDate(game.date) && !byKey.has(draftKingsOddsKey(game))) {
      byKey.set(draftKingsOddsKey(game), { ...game, preservedPastGame: true });
    }
  });
  const games = [...byKey.values()].sort((a, b) => `${a.date || ""} ${a.visitor || ""}`.localeCompare(`${b.date || ""} ${b.visitor || ""}`));
  return {
    ...(freshScan || {}),
    games,
    freshGames: freshGames.length,
    preservedPastGames: games.filter((game) => game.preservedPastGame).length,
  };
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

function scheduleStarterFor(teamName, slot, week = selectedSiteWeek()) {
  const { group, depth } = starterSlotParts(slot);
  return schedulePlayersFor(teamName, group, week)[depth - 1] || null;
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

function starterListPlayerCell(player) {
  if (!player) return `<span class="starter-empty">-</span>`;
  return `<span class="starter-player">${playerAvatar(player)}<span><b>${esc(player.player)}</b><em>${esc(player.teamAbbrev || teamAbbrevFor(player.team, player.team))}</em></span></span>`;
}

function scheduleStarterComparison(game) {
  const mode = scheduleActiveMode(game);
  const slots = mode === "preseason" ? schedulePlayerComparisonSlots() : scheduleStarterSlots;
  const rows = slots.map((slot) => {
    const away = scheduleStarterFor(game.visitor, slot, game.week);
    const home = scheduleStarterFor(game.home, slot, game.week);
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

function scheduleTeamStartersList(teamName, week = selectedSiteWeek()) {
  const mode = scheduleActiveMode({ visitor: teamName, home: teamName, week });
  const slots = mode === "preseason" ? schedulePlayerComparisonSlots() : scheduleStarterSlots;
  const rows = slots.map((slot) => {
    const player = scheduleStarterFor(teamName, slot, week);
    return `<tr>
      <td><span class="starter-slot">${esc(slot)}</span></td>
      <td>${starterListPlayerCell(player)}</td>
      <td>${player ? esc(player.position || starterSlotParts(slot).group) : "-"}</td>
      <td class="num">${player ? ratingBadge(player.rating) : "-"}</td>
    </tr>`;
  });
  return `
    <section class="starter-compare-card starter-list-card">
      <h3>${mode === "preseason" ? "Players List" : "Starting Lineup"}</h3>
      <div class="table-scroll starter-compare-scroll">
        ${table([{ label: "Slot" }, { label: "Player" }, { label: "Pos" }, { label: "Rating", cls: "num" }], rows)}
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

function isScheduleInteractiveTarget(target) {
  return Boolean(target?.closest?.("select, input, button, label, textarea, a"));
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

function renderScheduleProjectionMath() {
  return `
    <div class="schedule-control-block projection-math-card">
      <h3>Projection Math</h3>
      <div class="projection-math-grid">
        <div>
          <b>Team points</b>
          <span>Blend that team's offense points with the opponent's defensive points allowed, then add HFA.</span>
        </div>
        <div>
          <b>Total</b>
          <span>Away projected points plus home projected points after both scores are rounded.</span>
        </div>
        <div>
          <b>Spread</b>
          <span>Difference between projected scores. Higher projected score becomes the favorite.</span>
        </div>
        <div>
          <b>Win odds</b>
          <span>The spread is rounded to the nearest half point, then mapped through your spread-to-win table.</span>
        </div>
      </div>
      <p>Current score formula: team score = average(offense points, opponent defense allowed points) + HFA. Offense points use ${fmt(scheduleScoreTuning.offenseBase, 1)} plus roster edge x ${fmt(scheduleScoreTuning.offenseScale, 2)}. Defense allowed uses ${fmt(scheduleScoreTuning.defenseAllowedBase, 1)} minus defense edge x ${fmt(scheduleScoreTuning.defenseScale, 2)}. Preseason totals scale to ${fmt(scheduleScoreTuning.preseasonTotalScale * 100, 0)}% and stay between ${fmt(scheduleScoreTuning.preseasonTotalMin, 0)}-${fmt(scheduleScoreTuning.preseasonTotalMax, 1)}.</p>
    </div>
  `;
}

function renderScheduleControls() {
  if (!state.scheduleControlsOpen) return "";
  const depthMode = state.scheduleSimMode === "auto" ? scheduleActiveMode({ week: selectedSiteWeek(), preseason: String(selectedSiteWeek()).startsWith("Pre") }) : state.scheduleSimMode;
  const depthDefaults = depthMode === "regular" ? defaultRegularDepthMultipliers : defaultPreseasonDepthMultipliers;
  const depthState = depthMode === "regular" ? state.regularDepthMultipliers : state.preseasonDepthMultipliers;
  const depthTitle = depthMode === "regular" ? "Regular Season Depth Multipliers" : "Preseason Depth Multipliers";
  const depthCopy = depthMode === "regular"
    ? "These are rating multipliers for the depth spots included in regular-season mode."
    : "These are rating multipliers for the depth spots included in preseason mode.";
  const positionSliders = Object.keys(defaultSchedulePositionWeights).map((key) =>
    scheduleSlider(key, key, num(state.schedulePositionWeights[key], defaultSchedulePositionWeights[key]), 0, 30, "schedule-weight", 1, " pts")
  ).join("");
  const depthRows = (groups) => groups.map((group) => {
    const values = depthState[group] || depthDefaults[group];
    const labels = group === "OL" ? values.map((_, index) => `OL${index + 1}`) : values.map((_, index) => `${group}${index + 1}`);
    return `
      <div class="depth-slider-row">
        <strong>${esc(group)}</strong>
        <div>${values.map((value, index) => scheduleSlider(labels[index], `${depthMode}|${group}|${index}`, num(value, 100), 0, 150, "schedule-depth")).join("")}</div>
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
        <h3>${depthTitle}</h3>
        <p>${depthCopy}</p>
        <div class="depth-control-columns">
          <div><h4>Offense</h4><div class="depth-slider-grid">${depthRows(["QB", "RB", "WR", "TE", "OL"])}</div></div>
          <div><h4>Defense</h4><div class="depth-slider-grid">${depthRows(["IDL", "EDGE", "LB", "CB", "S"])}</div></div>
        </div>
      </div>
      <div class="schedule-control-block">
        <h3>Home Field Advantage</h3>
        <p>HFA points by home team for any non-neutral game. Neutral-site games override this to 0.</p>
        <div class="hfa-control-grid">${hfaRows}</div>
      </div>
      ${renderScheduleProjectionMath()}
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
    state.regularDepthMultipliers = JSON.parse(JSON.stringify(defaultRegularDepthMultipliers));
    state.homeFieldAdvantages = { ...defaultHomeFieldAdvantages };
    storage.set("nflz-schedule-position-weights", state.schedulePositionWeights);
    storage.set("nflz-preseason-depth-multipliers", state.preseasonDepthMultipliers);
    storage.set("nflz-regular-depth-multipliers", state.regularDepthMultipliers);
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
  document.querySelectorAll("[data-schedule-depth]").forEach((input) => {
    input.addEventListener("input", () => {
      input.closest(".schedule-slider")?.querySelector("b")?.replaceChildren(`${input.value}${input.dataset.suffix || ""}`);
    });
    input.addEventListener("change", () => {
      const [mode, group, indexText] = input.dataset.scheduleDepth.split("|");
      const isRegular = mode === "regular";
      const stateKey = isRegular ? "regularDepthMultipliers" : "preseasonDepthMultipliers";
      const storageKey = isRegular ? "nflz-regular-depth-multipliers" : "nflz-preseason-depth-multipliers";
      const defaults = isRegular ? defaultRegularDepthMultipliers : defaultPreseasonDepthMultipliers;
      const next = { ...state[stateKey] };
      next[group] = [...(next[group] || defaults[group])];
      next[group][Number(indexText)] = Number(input.value);
      state[stateKey] = next;
      storage.set(storageKey, state[stateKey]);
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

function quickDepthOptions() {
  const positions = liveBasePositions();
  return ["Starters", "All", "Offense", "Defense", ...positions];
}

function quickDepthGroupConfig(scope) {
  const offense = [["QB", 1], ["RB", 2], ["WR", 4], ["TE", 2], ["LT", 1], ["LG", 1], ["C", 1], ["RG", 1], ["RT", 1]];
  const defense = [["IDL", 3], ["EDGE", 3], ["LB", 3], ["CB", 3], ["S", 2]];
  if (scope === "Starters") return [...offense, ...defense];
  if (scope === "Offense") return offense.map(([group]) => [group, 99]);
  if (scope === "Defense") return defense.map(([group]) => [group, 99]);
  if (scope === "All") return [...offense, ...defense].map(([group]) => [group, 99]);
  return [[scope, 99]];
}

function quickDepthPlayers() {
  const teamName = state.quickDepthTeam || "Arizona Cardinals";
  const scope = state.quickDepthScope || "Starters";
  const seen = new Set();
  return quickDepthGroupConfig(scope).flatMap(([group, limit]) => {
    const players = schedulePlayersFor(teamName, group).slice(0, limit);
    return players.map((player, index) => ({ player, group, groupDepth: index + 1 }));
  }).filter(({ player }) => {
    const key = sourceKey(player);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderQuickDepthChart() {
  const teamOptions = (state.data?.teams || []).map((team) => team.team);
  if (!teamOptions.includes(state.quickDepthTeam)) state.quickDepthTeam = "Arizona Cardinals";
  const rows = quickDepthPlayers();
  return `
    <div class="quick-three">${select("quick-depth-team", state.quickDepthTeam, teamOptions)}${select("quick-depth-scope", state.quickDepthScope, quickDepthOptions())}<button class="quick-bubble" data-page="depth">Open Full Depth</button></div>
    <div class="quick-depth-list">
      ${rows.map(({ player, group, groupDepth }) => `
        <button class="quick-rank-row quick-depth-row player-open" data-player-key="${esc(sourceKey(player))}">
          <b>${esc(group)}${esc(groupDepth)}</b>
          <span class="quick-rank-player">${playerAvatar(player)}<span>${esc(player.player)}</span></span>
          <em>${teamCell(player)}</em>
          ${ratingBadge(player.rating)}
        </button>
      `).join("") || "<p class='note'>No players found for this depth filter.</p>"}
    </div>
  `;
}

function renderQuickPlayerPicker(player) {
  const matches = quickPlayerMatches(24);
  const resultText = state.quickPlayerQuery.trim()
    ? `${matches.length} leaguewide matches`
    : "Start typing to search every roster and free agent";
  return `
    <div class="quick-search-row">
      <input id="quick-player-query" placeholder="Search any NFL player, team, abbreviation, or position" value="${esc(state.quickPlayerQuery)}" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" />
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
    persistPlayer(player, { rating, newRating: rating, ratingChangeType: "Manual adjustment" });
    render();
  });
  document.querySelectorAll(".quick-thumb").forEach((button) => button.addEventListener("click", () => {
    const player = selectedQuickPlayer();
    if (player) applyThumb(player, button.dataset.dir);
    render();
  }));
  document.querySelector("#quick-injury")?.addEventListener("change", (event) => {
    const player = selectedQuickPlayer();
    if (player) persistPlayer(player, injuryPatchForStatus(event.target.value, /^ir\s+thru/i.test(event.target.value) ? "" : player.week));
    render();
  });
  document.querySelector("#quick-week")?.addEventListener("change", (event) => {
    const player = selectedQuickPlayer();
    if (player) persistPlayer(player, { week: event.target.value });
    render();
  });
  document.querySelector("#quick-depth-team")?.addEventListener("change", (event) => { state.quickDepthTeam = event.target.value; render(); });
  document.querySelector("#quick-depth-scope")?.addEventListener("change", (event) => { state.quickDepthScope = event.target.value; render(); });
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
              <div class="quick-card-title"><span>02</span><h3>Adjust Rating</h3></div>
              <div class="quick-search-row"><input id="quick-rating" type="number" min="50" max="105" value="${player ? fmt(player.rating, 0) : ""}" ${playerDisabled} /><button id="quick-rating-save" class="quick-bubble" ${playerDisabled}>Save</button></div>
              <div class="quick-two"><button class="quick-bubble quick-thumb" data-dir="up" ${playerDisabled}>Nudge Up</button><button class="quick-bubble quick-thumb" data-dir="down" ${playerDisabled}>Nudge Down</button></div>
            </article>
            <article class="quick-card action-card">
              <div class="quick-card-title"><span>03</span><h3>Apply Injury</h3></div>
              <div class="quick-two">${injurySelect("quick", player?.injury).replace("class=\"injury-status\"", "id=\"quick-injury\" class=\"injury-status\"")} ${weekSelect("quick", player?.week).replace("class=\"injury-week\"", "id=\"quick-week\" class=\"injury-week\"")}</div>
            </article>
            <article class="quick-card action-card">
              <div class="quick-card-title"><span>04</span><h3>Move Player</h3></div>
              ${select("quick-move-team", state.quickMoveTeam, teams)}
              <button id="quick-apply-move" class="quick-bubble" ${playerDisabled}>Assign Team / FA</button>
            </article>
            <article class="quick-card action-card">
              <div class="quick-card-title"><span>05</span><h3>View Details</h3></div>
              <button id="quick-open-details" class="quick-bubble" ${playerDisabled}>Open Player Details</button>
            </article>
          </div>
        </section>
      <article class="quick-card quick-card-third">
          <div class="quick-card-title"><span>06</span><h3>Quick Depth Chart</h3></div>
          ${renderQuickDepthChart()}
        </article>
        <article class="quick-card quick-card-third">
          <div class="quick-card-title"><span>07</span><h3>Positional Rankings</h3></div>
          <div class="quick-three">${select("quick-rank-scope", state.quickRankScope, rankScopes)}${select("quick-rank-limit", state.quickRankLimit, [10, 20, 30, 50, 100])}<button class="quick-bubble" data-page="top30">Open Top 30s</button></div>
          <div class="quick-rank-list">${ranked.map((p, index) => `<button class="quick-rank-row player-open" data-player-key="${esc(sourceKey(p))}"><b>${index + 1}</b><span class="quick-rank-player">${playerAvatar(p)}<span>${esc(p.player)}</span></span><em>${teamCell(p)}</em><strong>${fmt(p.rating, 0)}</strong></button>`).join("")}</div>
        </article>
        <article class="quick-card quick-card-third">
          <div class="quick-card-title"><span>08</span><h3>Team Rankings</h3></div>
          <div class="quick-three">${select("quick-team-rank-scope", state.quickTeamRankScope, teamRankScopes)}${select("quick-team-rank-limit", state.quickTeamRankLimit, [10, 20, 32])}<button class="quick-bubble" data-page="live">Open Live Rankings</button></div>
          <div class="quick-rank-list">${teamRanked.map((row, index) => `<div class="quick-rank-row quick-team-row"><b>${index + 1}</b><span>${teamCellByName(row.team.team)}</span><em>${esc(state.quickTeamRankScope)}</em><strong>${fmt(row.score, 1)}</strong></div>`).join("")}</div>
        </article>
      </div>
    </section>
    ${renderPlayerModal()}
  `;
}

function renderDepthLockEditor() {
  const editor = state.depthLockEditor;
  if (!editor) return "";
  const player = findPlayer(editor.playerKey);
  if (!player) return "";
  const week = editor.week || depthViewWeek();
  const currentPermanent = playerDepthLock({ ...player, weeklyDepthLocks: {} });
  const currentWeekly = player?.weeklyDepthLocks?.[depthLockWeekKey(week)];
  const depthOptions = Array.from({ length: 15 }, (_, index) => String(index + 1));
  return `<div class="modal depth-lock-modal" role="dialog" aria-modal="true">
    <section class="modal-card depth-lock-card">
      <button id="depth-lock-close" class="modal-close" title="Close">x</button>
      <div class="modal-section-head">
        <div>
          <h3>Lock Depth Spot</h3>
          <span>${esc(player.player)} / ${esc(player.position)} / ${esc(teamByName(player.team)?.teamAbbrev || player.teamAbbrev || player.team)}</span>
        </div>
      </div>
      <div class="depth-lock-summary">
        ${playerAvatar(player)}
        <div><b>${esc(player.player)}</b><span>Current displayed spot: ${esc(player.position)}${esc(playerDepthLock(player, week) || player.depth || "-")}</span></div>
        ${ratingBadge(player.rating)}
      </div>
      <label class="depth-lock-field">Depth spot
        ${optionSelect("depth-lock-value", String(editor.depth || playerDepthLock(player, week) || player.depth || 1), depthOptions)}
      </label>
      <div class="depth-lock-choice-grid">
        <button class="depth-lock-choice ${editor.scope === "week" ? "active" : ""}" data-scope="week" type="button">
          <b>This Week Only</b>
          <span>${esc(weekOptionLabel(week))}. Good for injuries, preseason rotations, or one-week lineup notes.</span>
          ${currentWeekly ? `<em>Currently ${player.position}${esc(currentWeekly)} this week</em>` : ""}
        </button>
        <button class="depth-lock-choice ${editor.scope === "keep" ? "active" : ""}" data-scope="keep" type="button">
          <b>Keep Set</b>
          <span>Locks this player until you unlock them, even when ratings change.</span>
          ${currentPermanent ? `<em>Currently kept at ${player.position}${esc(currentPermanent)}</em>` : ""}
        </button>
      </div>
      <div class="depth-lock-actions">
        <button id="depth-lock-unlock-week" class="mini-action">Unlock This Week</button>
        <button id="depth-lock-unlock-all" class="mini-action danger">Unlock All</button>
        <button id="depth-lock-save" class="mini-action primary">Apply Depth Lock</button>
      </div>
    </section>
  </div>`;
}

function closeDepthLockEditor() {
  state.depthLockEditor = null;
  render();
}

function wireDepthLockEditor() {
  if (!state.depthLockEditor) return;
  document.querySelector("#depth-lock-close")?.addEventListener("click", closeDepthLockEditor);
  document.querySelector(".depth-lock-modal")?.addEventListener("click", (event) => {
    if (event.target.classList.contains("depth-lock-modal")) closeDepthLockEditor();
  });
  document.querySelector("#depth-lock-value")?.addEventListener("change", (event) => {
    state.depthLockEditor = { ...state.depthLockEditor, depth: Number(event.target.value) };
  });
  document.querySelectorAll(".depth-lock-choice").forEach((button) => button.addEventListener("click", () => {
    state.depthLockEditor = { ...state.depthLockEditor, scope: button.dataset.scope || "week" };
    render();
  }));
  document.querySelector("#depth-lock-save")?.addEventListener("click", () => {
    const player = findPlayer(state.depthLockEditor?.playerKey);
    if (!player) return closeDepthLockEditor();
    const depth = Number(document.querySelector("#depth-lock-value")?.value || state.depthLockEditor.depth || 1);
    const scope = state.depthLockEditor.scope || "week";
    const week = state.depthLockEditor.week || depthViewWeek();
    lockPlayerDepth(player, depth, scope, week);
    state.depthLockEditor = null;
    render();
  });
  document.querySelector("#depth-lock-unlock-week")?.addEventListener("click", () => {
    const player = findPlayer(state.depthLockEditor?.playerKey);
    if (player) unlockPlayerDepth(player, "week", state.depthLockEditor.week || depthViewWeek());
    state.depthLockEditor = null;
    render();
  });
  document.querySelector("#depth-lock-unlock-all")?.addEventListener("click", () => {
    const player = findPlayer(state.depthLockEditor?.playerKey);
    if (player) unlockPlayerDepth(player, "all", state.depthLockEditor.week || depthViewWeek());
    state.depthLockEditor = null;
    render();
  });
}

function renderDepth() {
  const teams = ["All Teams", ...unique(state.players.map((p) => p.team))];
  const positions = ["All Positions", ...unique(state.players.map((p) => p.position)).sort((a, b) => depthPositionRank(a) - depthPositionRank(b) || String(a).localeCompare(String(b)))];
  const sides = ["All Sides", "Offense", "Defense"];
  const depthWeek = state.depthWeek === "auto" ? selectedSiteWeek() : state.depthWeek;
  const depthWeekOptions = [["auto", `Auto: ${siteWeekLabel()}`], ...scheduleWeekOptions(false)];
  let players = state.players.filter(matches);
  if (state.depthTeam !== "All Teams") players = players.filter((p) => normalizeTeamName(p.team) === normalizeTeamName(state.depthTeam));
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
  const depthTableRow = (p, includeTeam = true, extraClass = "", displayDepth = playerUnavailableLabel(p, depthWeek) || p.depth) => `
    <tr class="${String(p.player).includes("(R)") ? "rookie" : ""} ${playerUnavailableLabel(p, depthWeek) ? "unavailable-player" : ""} ${playerDepthLock(p, depthWeek) ? "depth-locked-player" : ""} ${extraClass}" data-player-key="${esc(sourceKey(p))}">
      ${includeTeam ? `<td class="team-col">${teamCell(p)}</td>` : ""}
      <td class="pos-col"><span class="pos-chip ${positionChipClass(p.position)}">${esc(p.position)}</span></td>
      <td class="player-col">${playerNameButton(p)}</td>
      <td class="num rating-col">${ratingBadge(p.rating)}</td>
      <td class="num depth-col">${depthLockControl(p, displayDepth, depthWeek)}</td>
      <td class="stars-col">${starsMeter(p)}</td>
      <td class="nudge-col">${nudgeControls(p)}</td>
      <td class="injury-col"><span class="injury-stack">${injurySelect(sourceKey(p), p.injury)}${weekSelect(sourceKey(p), p.week)}</span></td>
    </tr>
  `;
  const depthRowsForSide = (sidePlayers) => {
    const positionCounts = {};
    const available = depthOrderedByPosition(sidePlayers.filter((player) => !playerUnavailableLabel(player, depthWeek)), depthWeek);
    const unavailable = [...sidePlayers].filter((player) => playerUnavailableLabel(player, depthWeek)).sort((a, b) => depthPositionRank(a.position) - depthPositionRank(b.position) || num(b.rating) - num(a.rating) || String(a.player).localeCompare(b.player));
    const ordered = [...available, ...unavailable];
    return ordered.map((p, index) => {
      const unavailable = playerUnavailableLabel(p, depthWeek);
      if (!unavailable) positionCounts[p.position] = (positionCounts[p.position] || 0) + 1;
      const next = ordered[index + 1];
      const isPositionEnd = !next || String(next.position) !== String(p.position);
      return depthTableRow(p, false, isPositionEnd ? "position-end" : "", unavailable || positionCounts[p.position]);
    }).join("");
  };
  const displayTeams = state.depthTeam !== "All Teams"
    ? [state.depthTeam]
    : state.depthPosition !== "All Positions"
      ? (state.data?.teams || []).map((team) => team.team)
      : unique(players.map((p) => p.team));
  const groupedTeams = reviewIsActive ? "" : displayTeams.map((team) => {
    const teamPlayers = players.filter((p) => normalizeTeamName(p.team) === normalizeTeamName(team));
    const teamInfo = teamByName(team) || { team, teamAbbrev: state.data?.meta?.teamAbbrevs?.[team] || team };
    const sample = teamPlayers[0] || teamInfo;
    const sideTable = (title, sidePlayers) => `
      <div class="depth-side ${title.toLowerCase()}">
        <div class="depth-side-title"><span>${title}</span><b>${sidePlayers.filter((player) => isPlayerAvailable(player, depthWeek)).length}</b></div>
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
        <h3>${teamLogo(teamInfo.team, sample.teamAbbrev || teamInfo.teamAbbrev)}<span>${esc(teamInfo.team)}</span></h3>
        <em>${teamPlayers.length ? `${teamPlayers.length} players` : "missing in this filter"}</em>
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
    wireSelect("depth-week", "depthWeek");
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
    document.querySelector("#injury-check-activity")?.addEventListener("change", (event) => {
      state.injuryCheckActivity = event.target.value;
      render();
    });
    document.querySelector("#injury-check-apply-shown")?.addEventListener("click", applyShownInjuryCheckResults);
    document.querySelectorAll(".injury-review-clear").forEach((button) => button.addEventListener("click", () => clearInjuryReviewDue(button.dataset.playerKey)));
    document.querySelectorAll(".injury-review-keep").forEach((button) => button.addEventListener("click", () => keepInjuryReviewDue(button.dataset.playerKey)));
    document.querySelectorAll(".injury-apply-one").forEach((button) => button.addEventListener("click", () => applyInjuryCheckResult(Number(button.dataset.injuryCheckIndex))));
    document.querySelectorAll(".injury-idle-resolve").forEach((button) => button.addEventListener("click", () => resolveIdleInjuryCheckResult(Number(button.dataset.injuryCheckIndex))));
    document.querySelectorAll(".injury-ignore-one").forEach((button) => button.addEventListener("click", () => ignoreInjuryCheckResult(Number(button.dataset.injuryCheckIndex))));
    document.querySelectorAll(".depth-lock-button").forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      promptDepthLock(button.dataset.depthLockKey);
    }));
    wireDepthLockEditor();
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
          ${optionSelect("depth-week", state.depthWeek, depthWeekOptions)}
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
    ${renderDepthLockEditor()}
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
const injuryWeeks = ["", "Pre1", "Pre2", "Pre3", ...Array.from({ length: 18 }, (_, i) => String(i + 1)), "WC", "DIV", "ACC", "NCC", "SB"];

function irAutoThruWeek() {
  const current = selectedSiteWeek();
  if (String(current).startsWith("Pre")) return "4";
  const week = Number(current);
  if (!Number.isFinite(week)) return "4";
  const target = week + 4;
  if (target <= 18) return String(target);
  return ({ 19: "WC", 20: "DIV", 21: "ACC", 22: "SB" })[target] || "SB";
}

function currentInjuryReviewWeek() {
  const week = selectedSiteWeek();
  return week === "Pre0" ? "Pre1" : week;
}

function defaultInjuryWeekForStatus(status, currentWeek = "") {
  const injury = status || "Healthy";
  if (/^healthy$|out\s+for\s+season/i.test(injury)) return "";
  if (/^ir\s+thru/i.test(injury)) return irAutoThruWeek();
  if (/out\s+thru|likely.*out\s+thru|suspended\s+thru/i.test(injury)) return currentWeek || currentInjuryReviewWeek();
  return currentWeek || "";
}

function injuryPatchForStatus(status, currentWeek = "") {
  const injury = status || "Healthy";
  if (/^healthy$/i.test(injury)) return { injury, week: "" };
  return { injury, week: currentWeek || defaultInjuryWeekForStatus(injury) };
}

function injurySelect(key, value) {
  return `<select class="injury-status" data-player-key="${esc(key)}">${injuryStatuses.map((item) => `<option ${String(value || "Healthy") === item ? "selected" : ""}>${item}</option>`).join("")}</select>`;
}

function weekSelect(key, value) {
  return `<select class="injury-week" data-player-key="${esc(key)}">${injuryWeeks.map((item) => `<option ${String(value || "") === item ? "selected" : ""}>${item}</option>`).join("")}</select>`;
}

function historyDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" });
}

function renderRatingHistory(player) {
  const rows = ratingHistoryFor(player).slice(0, 12);
  if (!rows.length) {
    return `<section class="rating-history"><div class="modal-section-head"><h3>Rating Change History</h3><span>No rating changes tracked yet</span></div></section>`;
  }
  return `
    <section class="rating-history">
      <div class="modal-section-head">
        <h3>Rating Change History</h3>
        <span>${rows.length} recent change${rows.length === 1 ? "" : "s"}</span>
      </div>
      <div class="rating-history-list">
        ${rows.map((item) => {
          const delta = num(item.delta, num(item.newRating) - num(item.oldRating));
          return `<div class="rating-history-row">
            <span class="rating-history-type">${esc(item.type || "Manual adjustment")}</span>
            <span class="rating-history-date">${esc(historyDate(item.at))}</span>
            <span class="rating-history-values"><b>${fmt(item.oldRating, 0)}</b><em>to</em><b>${fmt(item.newRating, 0)}</b></span>
            <span class="rating-history-delta ${delta >= 0 ? "plus" : "minus"}">${delta > 0 ? "+" : ""}${fmt(delta, 0)}</span>
            ${item.note ? `<span class="rating-history-note">${esc(item.note)}</span>` : ""}
          </div>`;
        }).join("")}
      </div>
    </section>
  `;
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
    if (p) persistPlayer(p, injuryPatchForStatus(sel.value, /^ir\s+thru/i.test(sel.value) ? "" : p.week));
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
    if (p) persistPlayer(p, { rating: Math.max(50, Math.min(105, Math.floor(rating))), newRating: Math.floor(rating), ratingChangeType: "Manual adjustment" });
    state.selectedPlayerKey = null;
    render();
  });
  document.querySelector("#player-name-save")?.addEventListener("click", () => {
    const p = findPlayer(state.selectedPlayerKey);
    const newName = document.querySelector("#manual-player-name")?.value;
    if (p) renamePlayer(p, newName);
    render();
  });
  document.querySelector("#player-name-reset")?.addEventListener("click", () => {
    const p = findPlayer(state.selectedPlayerKey);
    if (p) resetPlayerName(p);
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
    if (p) persistPlayer(p, injuryPatchForStatus(event.target.value, /^ir\s+thru/i.test(event.target.value) ? "" : p.week));
    render();
  });
  document.querySelector("#modal-week")?.addEventListener("change", (event) => {
    const p = findPlayer(state.selectedPlayerKey);
    if (p) persistPlayer(p, { week: event.target.value });
    render();
  });
  document.querySelector("#delete-player")?.addEventListener("click", () => {
    const p = findPlayer(state.selectedPlayerKey);
    if (!p) return;
    if (!confirm(`Delete ${p.player} from NFL Model Z IQ? This removes them from depth charts, rankings, and comparisons on this device.`)) return;
    deletePlayer(p);
    render();
  });
}

function renderPlayerModal() {
  const p = findPlayer(state.selectedPlayerKey);
  if (!p) return "";
  const rank = positionRank(p);
  const pff = state.data.pff.find((row) => row.player === p.player);
  const team = teamByName(p.team) || { team: p.team, teamAbbrev: p.teamAbbrev };
  const source = sourceKey(p);
  const hasRenamedPlayer = Boolean(overrides[source]?.player);
  return `
    <div class="modal">
      <div class="modal-card">
        <button id="modal-close" class="modal-close" title="Close">x</button>
        <div class="player-hero enhanced">
          <div class="player-team-watermark">${teamLogo(team.team, team.teamAbbrev)}</div>
          ${playerAvatar(p, "lg")}
          <div class="player-hero-copy">
            <h2>${p.player}</h2>
            <p>${teamLogo(team.team, team.teamAbbrev)}<span>${esc(p.team)} - ${esc(p.position)}${String(p.player).includes("(R)") ? " - Rookie" : ""}</span></p>
          </div>
          <div class="player-hero-rating player-hero-rating-large">${ratingBadge(p.rating)}<span>Current Rating</span><em>${esc(playerDepthLabel(p))}</em></div>
        </div>
        <div class="player-card-grid">
          ${playerRanksPanel(p)}
          ${playerReferencePanel(p)}
          ${playerFantasyPanel(p)}
          ${playerUsagePanel(p)}
        </div>
        <div class="editor-row player-name-editor">
          <label>Player name <input id="manual-player-name" type="text" value="${esc(p.player)}" /></label>
          <button id="player-name-save">Save Name</button>
          ${hasRenamedPlayer ? `<button id="player-name-reset" class="mini-action">Reset Name</button>` : ""}
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
          <button id="delete-player" class="danger">Delete Player</button>
        </div>
        ${renderRatingHistory(p)}
        ${renderPlayerQbGameLogs(p)}
        ${playerTeamResultsPanel(p)}
      </div>
    </div>
  `;
}

function renderPlayerQbGameLogs(player) {
  const log = footballguysLogFor(player);
  const logYear = window.FOOTBALLGUYS_GAME_LOGS?.year || "2025";
  if (!log?.weeks?.length) {
    if (groupPosition(player.position) !== "QB" && player.position !== "QB") return "";
    return `
      <section class="modal-game-log">
        <div class="modal-section-head">
          <h3>${esc(logYear)} QB Game Logs</h3>
          <span>No scanned Footballguys row found</span>
        </div>
      </section>
    `;
  }
  const statValues = (key) => log.weeks.map((week) => Number(week[key])).filter(Number.isFinite);
  const rows = log.weeks.map((week) => `
    <tr class="${week.played ? "" : "muted-row"}">
      <td class="num rank-col">${fantasyDisplay(week.week, 0)}</td>
      <td>${esc(week.opponent || "-")}</td>
      <td>${esc(week.result || "-")}</td>
      <td>${week.played ? "Yes" : "No"}</td>
      <td class="num cf" ${cfStyle(week.passYards, Math.min(...statValues("passYards"), 0), Math.max(...statValues("passYards"), 1))}>${fantasyDisplay(week.passYards, 0)}</td>
      <td class="num cf" ${cfStyle(week.passTds, 0, Math.max(...statValues("passTds"), 1))}>${fantasyDisplay(week.passTds, 0)}</td>
      <td class="num cf" ${cfStyle(week.interceptions, 0, Math.max(...statValues("interceptions"), 1), true)}>${fantasyDisplay(week.interceptions, 0)}</td>
      <td class="num cf" ${cfStyle(week.rushAttempts, 0, Math.max(...statValues("rushAttempts"), 1))}>${fantasyDisplay(week.rushAttempts, 0)}</td>
      <td class="num cf" ${cfStyle(week.rushYards, Math.min(...statValues("rushYards"), 0), Math.max(...statValues("rushYards"), 1))}>${fantasyDisplay(week.rushYards, 0)}</td>
      <td class="num cf" ${cfStyle(week.rushTds, 0, Math.max(...statValues("rushTds"), 1))}>${fantasyDisplay(week.rushTds, 0)}</td>
    </tr>
  `);
  return `
    <section class="modal-game-log">
      <div class="modal-section-head">
        <h3>${esc(logYear)} QB Game Logs</h3>
        <span>${esc(log.teamAbbrev || log.team || "")} - ${fantasyDisplay(log.gamesPlayed, 0)} games counted</span>
      </div>
      <div class="table-scroll modal-game-log-scroll">
        ${table([
          { label: "Wk", cls: "num rank-col" },
          { label: "Opp" },
          { label: "Result" },
          { label: "Played" },
          { label: "Pass Yds", cls: "num" },
          { label: "Pass TDs", cls: "num" },
          { label: "INTs", cls: "num" },
          { label: "Rush Att", cls: "num" },
          { label: "Rush Yds", cls: "num" },
          { label: "Rush TDs", cls: "num" },
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
    if (p) persistPlayer(p, { rating: Math.max(50, Math.min(105, Math.floor(rating))), newRating: Math.floor(rating), ratingChangeType: "Manual adjustment" });
    state.selectedPlayerKey = null;
    render();
  });
  document.querySelector("#player-name-save")?.addEventListener("click", () => {
    const p = findPlayer(state.selectedPlayerKey);
    const newName = document.querySelector("#manual-player-name")?.value;
    if (p) renamePlayer(p, newName);
    render();
  });
  document.querySelector("#player-name-reset")?.addEventListener("click", () => {
    const p = findPlayer(state.selectedPlayerKey);
    if (p) resetPlayerName(p);
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
    if (p) persistPlayer(p, injuryPatchForStatus(event.target.value, /^ir\s+thru/i.test(event.target.value) ? "" : p.week));
    render();
  });
  document.querySelector("#modal-week")?.addEventListener("change", (event) => {
    const p = findPlayer(state.selectedPlayerKey);
    if (p) persistPlayer(p, { week: event.target.value });
    render();
  });
  document.querySelector("#delete-player")?.addEventListener("click", () => {
    const p = findPlayer(state.selectedPlayerKey);
    if (!p) return;
    if (!confirm(`Delete ${p.player} from NFL Model Z IQ? This removes them from depth charts, rankings, and comparisons on this device.`)) return;
    deletePlayer(p);
    render();
  });
}

function positionRank(player) {
  const group = groupPosition(player.position);
  const ranked = buildRankedPlayers(group, 5000);
  return ranked.find((p) => playerKey(p) === playerKey(player))?.rank;
}

function positionRankInfo(player) {
  const group = groupPosition(player.position);
  const ranked = buildRankedPlayers(group, 5000);
  const found = ranked.find((p) => playerKey(p) === playerKey(player));
  return { rank: found?.rank || "", total: ranked.length, label: group };
}

function playerSideRank(player) {
  const side = depthSideFor(player);
  const ranked = state.players
    .filter((item) => depthSideFor(item) === side && isPlayerAvailable(item))
    .sort((a, b) => num(b.rating) - num(a.rating) || String(a.player).localeCompare(String(b.player)));
  const index = ranked.findIndex((item) => sourceKey(item) === sourceKey(player));
  return index >= 0 ? index + 1 : "";
}

function playerSideRankInfo(player) {
  const side = depthSideFor(player);
  const ranked = state.players
    .filter((item) => depthSideFor(item) === side && isPlayerAvailable(item))
    .sort((a, b) => num(b.rating) - num(a.rating) || String(a.player).localeCompare(String(b.player)));
  const index = ranked.findIndex((item) => sourceKey(item) === sourceKey(player));
  return { rank: index >= 0 ? index + 1 : "", total: ranked.length, label: side };
}

function playerLeagueRank(player) {
  const ranked = state.players
    .filter(isPlayerAvailable)
    .sort((a, b) => num(b.rating) - num(a.rating) || String(a.player).localeCompare(String(b.player)));
  const index = ranked.findIndex((item) => sourceKey(item) === sourceKey(player));
  return index >= 0 ? index + 1 : "";
}

function playerLeagueRankInfo(player) {
  const ranked = state.players
    .filter(isPlayerAvailable)
    .sort((a, b) => num(b.rating) - num(a.rating) || String(a.player).localeCompare(String(b.player)));
  const index = ranked.findIndex((item) => sourceKey(item) === sourceKey(player));
  return { rank: index >= 0 ? index + 1 : "", total: ranked.length, label: "League" };
}

function playerDepthLabel(player) {
  const unavailable = playerUnavailableLabel(player);
  if (unavailable) return unavailable;
  if (normalizeTeamName(player.team) === "Free Agent") return "FA";
  const depth = num(player.depth, 0);
  return depth ? `${groupPosition(player.position)}${depth}` : groupPosition(player.position);
}

function maddenReferenceForPlayer(player) {
  const name = normalizeName(player.player);
  const team = normalizeTeamName(player.team);
  const pos = groupPosition(player.position);
  return maddenRows.find((row) => normalizeName(row.player) === name && normalizeTeamName(row.team) === team && groupPosition(maddenPosition(row.pos)) === pos)
    || maddenRows.find((row) => normalizeName(row.player) === name && groupPosition(maddenPosition(row.pos)) === pos)
    || maddenRows.find((row) => normalizeName(row.player) === name)
    || null;
}

function playerRanksPanel(player) {
  const pos = positionRankInfo(player);
  const side = playerSideRankInfo(player);
  const league = playerLeagueRankInfo(player);
  return `
    <section class="player-card-panel player-rank-panel">
      <div class="modal-section-head"><h3>Ranks</h3><span>Current available player pool</span></div>
      <div class="player-rank-grid">
        ${metric("Position", pos.rank ? `#${pos.rank}` : "-", `of ${pos.total} ${pos.label}`)}
        ${metric(side.label, side.rank ? `#${side.rank}` : "-", `of ${side.total}`)}
        ${metric("League", league.rank ? `#${league.rank}` : "-", `of ${league.total}`)}
      </div>
    </section>
  `;
}

function playerReferencePanel(player) {
  const pff = pffRankInfo(player);
  const madden = maddenReferenceForPlayer(player);
  const pffUrl = `https://www.pff.com/nfl/grades/position/${pffPositionSlug(player.position)}`;
  const pffRank = pff?.rank ? `#${pff.rank}${pff.total ? ` / ${pff.total}` : ""}` : "No rank";
  const pffGrade = pffHasGrade(pff) ? fmt(pff.grade, 1) : "No grade";
  return `
    <section class="player-card-panel player-reference-panel">
      <div class="modal-section-head">
        <h3>Reference Ratings</h3>
        <a class="mini-action" href="${esc(pffUrl)}" target="_blank" rel="noreferrer">PFF ${esc(groupPosition(player.position))}</a>
      </div>
      <div class="player-reference-grid">
        <div>${madden ? ratingBadge(madden.ovr) : "<b>-</b>"}<span>Madden</span><em>${madden ? "last imported" : "No match"}</em></div>
        <div class="pff-reference-tile">${renderMaddenPffCell(pff)}<span>PFF</span><em>${esc(pffRank)} / ${esc(pffGrade)}</em></div>
        <div>${player.school ? `<b>${esc(player.school)}</b>` : "<b>-</b>"}<span>College</span><em>${player.school ? "last school before NFL" : "not loaded yet"}</em></div>
      </div>
    </section>
  `;
}

function playerFantasyPanel(player) {
  const position = groupPosition(player.position);
  const weeklyRows = fantasyBoardRows("weekly", position, fantasyRankItem("weekly", position)?.rows || []);
  const row = weeklyRows.find((item) => fantasyMergeKey(item.player) === fantasyMergeKey(player.player));
  const seasonRows = fantasyBoardRows("season", position, fantasyRankItem("season", position)?.rows || []);
  const season = seasonRows.find((item) => fantasyMergeKey(item.player) === fantasyMergeKey(player.player));
  const bars = [["Weekly", row?.score], ["Last 5", row?.last5Score], ["Season", season?.score || row?.seasonScore]];
  const max = Math.max(1, ...bars.map(([, value]) => num(value, 0)));
  return `
    <section class="player-card-panel player-fantasy-panel">
      <div class="modal-section-head"><h3>Fantasy</h3><span>${row?.opponent ? `Week ${esc(siteWeekLabel())} vs ${esc(row.opponent)}` : "projections building out"}</span></div>
      <div class="player-fantasy-bars">
        ${bars.map(([label, value]) => `<div><span>${esc(label)}</span><b>${fantasyDisplay(value, 1)}</b><em style="width:${Math.max(4, Math.round((num(value, 0) / max) * 100))}%"></em></div>`).join("")}
      </div>
    </section>
  `;
}

function playerUsagePanel(player) {
  const position = groupPosition(player.position);
  if (!["RB", "WR", "TE"].includes(position)) return "";
  const rows = fantasyBoardRows("weekly", position, fantasyRankItem("weekly", position)?.rows || []);
  const row = rows.find((item) => fantasyMergeKey(item.player) === fantasyMergeKey(player.player));
  const snap = fantasyDetailValue(row || {}, "Typical Snap %");
  const targets = fantasyDetailValue(row || {}, "Typical Targets");
  const rz = fantasyDetailValue(row || {}, "Typical Red Zone Opportunities");
  const l5Snap = fantasyDetailValue(row || {}, "!!LAST 5!!\nTypical Snap %");
  const l5Targets = fantasyDetailValue(row || {}, "!!LAST 5!!\nTypical Targets");
  const l5Rz = fantasyDetailValue(row || {}, "!!LAST 5!!\nTypical Red Zone Opportunities");
  return `
    <section class="player-card-panel player-usage-panel">
      <div class="modal-section-head"><h3>Fantasy Usage</h3><span>Season / Last 5</span></div>
      <div class="player-usage-grid">
        ${metric("Snap %", fantasyDisplay(snap, 1), fantasyDisplay(l5Snap, 1))}
        ${metric("Targets", fantasyDisplay(targets, 1), fantasyDisplay(l5Targets, 1))}
        ${metric("RZone", fantasyDisplay(rz, 1), fantasyDisplay(l5Rz, 1))}
      </div>
    </section>
  `;
}

function playerTeamResultsPanel(player) {
  const teamKey = normalizeScheduleTeam(player.team);
  const rows = scheduleGames().map((game, index) => {
    const key = scheduleGameKey(game, game.calendarIndex ?? index);
    return { game, key, action: gameAction(key) };
  })
    .filter(({ game, action }) => (normalizeScheduleTeam(game.visitor) === teamKey || normalizeScheduleTeam(game.home) === teamKey) && action.awayScore !== "" && action.homeScore !== "")
    .slice(-8)
    .map(({ game, action }) => {
      const isHome = normalizeScheduleTeam(game.home) === teamKey;
      const opp = isHome ? game.visitor : game.home;
      const teamScore = isHome ? action.homeScore : action.awayScore;
      const oppScore = isHome ? action.awayScore : action.homeScore;
      const result = num(teamScore) > num(oppScore) ? "W" : num(teamScore) < num(oppScore) ? "L" : "T";
      return `<tr><td>${esc(weekDisplay(game.week || ""))}</td><td>${esc(excelDate(game.date))}</td><td>${teamCellFull(opp)}</td><td class="num">${esc(teamScore)}-${esc(oppScore)}</td><td class="num ${result === "W" ? "plus" : result === "L" ? "minus" : ""}">${result}</td></tr>`;
    });
  return `
    <section class="player-card-panel player-results-panel">
      <div class="modal-section-head"><h3>Team Game Results</h3><span>Filled from added scores</span></div>
      <div class="table-scroll modal-game-log-scroll">
        ${table([{ label: "Wk" }, { label: "Date" }, { label: "Opp" }, { label: "Score", cls: "num" }, { label: "Res", cls: "num" }], rows.length ? rows : [`<tr><td colspan="5" class="empty-cell">No game results added for ${esc(player.team)} yet.</td></tr>`])}
      </div>
    </section>
  `;
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
  const clean = String(pos || "").split(",")[0].trim();
  pos = clean;
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

function maddenBaselineKey(row) {
  return `${normalizeName(row.player)}__${maddenPosition(row.pos)}__${normalizeTeamName(row.team)}`;
}

const maddenReviewBaseline = Array.isArray(window.MADDEN_REVIEW_BASELINE) ? window.MADDEN_REVIEW_BASELINE : [];
const maddenReviewBaselineMap = new Map(maddenReviewBaseline.map((row) => [maddenBaselineKey(row), row]));

function maddenBaselineFor(row) {
  if (!row?.madden) return null;
  return maddenReviewBaselineMap.get(maddenBaselineKey(row.madden)) || null;
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
  const matchPff = row.match ? pffRankInfo(row.match) : null;
  const maddenPff = pffRankInfo({ player: row.madden.player, team: row.madden.team, teamAbbrev: pffTeamAbbrevMap[normalizeTeamName(row.madden.team)], position: mPos });
  const baseline = maddenBaselineFor(row);
  const baselinePff = baseline ? {
    pffPosition: mPos,
    modelPosition: mPos,
    rank: "",
    total: "",
    grade: null,
    snapPercentile: baseline.pffSnapPercent,
    baseline: true,
    pffLabel: baseline.pffLabel,
    pffGradeText: baseline.pffGradeText,
  } : null;
  const hasUsablePff = (pff) => Boolean(pff && (pff.rank || usefulPffGrade(pff.grade) !== null || Number.isFinite(Number(pff.snapPercentile))));
  row._pff = hasUsablePff(matchPff) ? matchPff : hasUsablePff(maddenPff) ? maddenPff : baselinePff;
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

function cleanPffPosition(value) {
  return groupPosition(String(value || "EDGE").split(",")[0].trim() || "EDGE");
}

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
    const modelPosition = groupPosition(row.modelPosition || row.pffPosition || cached?.modelPosition || cached?.pffPosition);
    const rowSnaps = Number(row.snaps);
    const cachedSnaps = Number(cached?.snaps);
    return {
      ...row,
      modelPosition,
      pffPosition: row.pffPosition || cached?.pffPosition || modelPosition,
      team: row.team || cached?.team,
      grade: usefulPffGrade(row.grade) ?? usefulPffGrade(cached?.grade),
      snaps: Number.isFinite(rowSnaps) && rowSnaps >= 20 ? rowSnaps : Number.isFinite(cachedSnaps) && cachedSnaps >= 20 ? cachedSnaps : null,
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
  if (pos === "QB") return 10;
  if (["RB", "WR", "TE"].includes(pos)) return 10;
  if (["OT", "OG", "C"].includes(pos)) return 7;
  if (pos === "LB") return 9;
  return 8;
}

function pffSnapFromValues(values, fallbackIndex = null) {
  const cleaned = values.map((value) => String(value || "").replace(/,/g, "").trim());
  if (fallbackIndex !== null) {
    const fallback = Number(cleaned[fallbackIndex]);
    if (Number.isFinite(fallback) && fallback >= 20) return fallback;
  }
  const start = fallbackIndex !== null ? Math.max(4, Math.min(cleaned.length - 1, fallbackIndex - 2)) : 4;
  const snapText = cleaned.slice(start).find((value) => /^\d{2,4}$/.test(value) && Number(value) >= 20);
  return Number.isFinite(Number(snapText)) ? Number(snapText) : null;
}

function parsePffPaste(text, modelPosition = "EDGE") {
  const lines = String(text || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const rows = [];
  const seen = new Set();
  const snapOffset = pffPasteSnapOffset(modelPosition);
  for (let index = 0; index < lines.length - 4; index += 1) {
    const parts = lines[index].split("\t").map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 8 && /^\d{1,4}$/.test(parts[0].replace(/,/g, "")) && /^[A-Z]{2,4}$/.test(parts[2] || "")) {
      const row = {
        name: parts[1].replace(/\s+/g, " ").trim(),
        player: parts[1].replace(/\s+/g, " ").trim(),
        team: parts[2].toUpperCase(),
        pffPosition: modelPosition,
        modelPosition,
        rank: Number(parts[0].replace(/,/g, "")),
        ranked: null,
        total: null,
        grade: Number(String(parts[4] || "").replace(/,/g, "")),
        snaps: pffSnapFromValues(parts, snapOffset),
        snapPercentile: null,
        source: "paste",
        importedAt: new Date().toISOString(),
      };
      if (row.name && Number.isFinite(row.grade)) {
        const key = pffManualKey(row);
        if (!seen.has(key)) {
          seen.add(key);
          rows.push(row);
        }
      }
      continue;
    }
    const rankText = lines[index].replace(/,/g, "");
    if (!/^\d{1,4}$/.test(rankText)) continue;
    const name = lines[index + 1]?.replace(/\s+/g, " ").trim();
    const team = lines[index + 2]?.toUpperCase();
    const jersey = lines[index + 3] || "";
    const grade = Number(String(lines[index + 4] || "").replace(/,/g, ""));
    const snaps = pffSnapFromValues(lines.slice(index, index + 18), snapOffset);
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
  const positions = new Set(rows.map((row) => groupPosition(row.modelPosition || row.pffPosition)));
  Object.keys(pffManualRanks).forEach((key) => {
    const row = pffManualRanks[key] || {};
    const keyPosition = groupPosition(row.modelPosition || row.pffPosition || String(key).split("__")[0]);
    if (positions.has(keyPosition)) delete pffManualRanks[key];
  });
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
  const selectedPosition = cleanPffPosition(document.querySelector("#pff-paste-position")?.value || state.pffPastePosition || "EDGE");
  const detectedPosition = detectPffPastePosition(text);
  const position = cleanPffPosition(detectedPosition || selectedPosition);
  state.pffPastePosition = position;
  const rows = parsePffPaste(text, position);
  if (!rows.length) {
    state.pffManualNotice = `No ${position} PFF rows found. Make sure ${position} is selected, then copy the full PFF table including Rank, Name, Team, PFF Grade, and Snaps.`;
    render();
    return;
  }
  savePffManualRows(rows);
  state.pffView = "review";
  state.pffManualNotice = `Imported ${rows.length} ${position} PFF rank rows${detectedPosition ? " after detecting the pasted page type" : ""}. Review rows below; Madden Comparison is using them now too.`;
  render();
}

function clearPffImports() {
  Object.keys(pffManualRanks).forEach((key) => delete pffManualRanks[key]);
  Object.keys(pffRecentAdjustments).forEach((key) => delete pffRecentAdjustments[key]);
  storage.set("nflz-pff-manual-ranks", pffManualRanks);
  storage.set("nflz-pff-recent-adjustments", pffRecentAdjustments);
  invalidatePffIndexes();
  state.pffManualNotice = "Cleared all pasted PFF imports. Start fresh by selecting a position, pasting that PFF table, and importing.";
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
    const manualSnaps = Number(manual.snaps);
    const cachedSnaps = Number(cachedExact?.snaps);
    const enriched = {
      ...manual,
      grade: usefulPffGrade(manual.grade) ?? usefulPffGrade(cachedExact?.grade),
      snaps: Number.isFinite(manualSnaps) && manualSnaps >= 20 ? manualSnaps : Number.isFinite(cachedSnaps) && cachedSnaps >= 20 ? cachedSnaps : null,
      snapPercentile: Number.isFinite(manualSnaps) && manualSnaps >= 20 && Number.isFinite(Number(manual.snapPercentile)) ? manual.snapPercentile : cachedExact ? pffSnapPercentile(cachedExact, positionRows) : pffSnapPercentile(manual, manualPositionRows),
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
  const source = pff.manual ? "paste" : pff.baseline ? "baseline" : "cache";
  const position = pff.pffPosition || pff.modelPosition || "PFF";
  const gradeText = hasGrade ? fmt(pff.grade, 1) : (pff.pffGradeText || "No grade");
  const rankText = pff.rank ? `#${esc(pff.rank)} / ${esc(pff.total || "")}` : (pff.pffLabel || (hasGrade ? "PFF" : "Rank only"));
  const snapText = pff.snaps ? ` over ${fmt(pff.snaps, 0)} snaps` : "";
  const pffPct = pffRankPercentile(pff);
  const shadePct = pffPct === null ? (Number.isFinite(Number(pff.snapPercentile)) ? Number(pff.snapPercentile) : null) : pffPct * 100;
  const title = hasGrade
    ? `${source} ${position} PFF grade ${gradeText}${snapText}`
    : `${source} ${position} PFF rank/snaps found, but grade was not available. Paste this PFF position table to fill the grade.`;
  return `<span class="madden-pff-rank ${hasGrade ? "" : "missing"}" ${shadePct === null ? "" : pffSnapStyle(shadePct)} title="${esc(title)}">${rankText}<small>${esc(gradeText)}</small></span>`;
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
  const baseline = maddenBaselineFor(row);
  const madden = num(row.madden.ovr, mine);
  const gap = madden - mine;
  if (!gap) return mine;
  const pffPct = pffRankPercentile(pff);
  const snapPct = Number.isFinite(Number(pff?.snapPercentile)) ? Math.max(0.25, Math.min(1, Number(pff.snapPercentile) / 100)) : 0.5;
  const hasPff = pffPct !== null;
  if (!hasPff && baseline && mine === num(baseline.mine) && Number.isFinite(Number(baseline.suggested))) {
    return Math.max(68, Math.min(110, num(baseline.suggested)));
  }
  const trust = hasPff ? Math.max(0.35, Math.min(1, 0.35 + (snapPct * 0.65))) : 0.45;
  let closePct;
  if (!hasPff) {
    closePct = gap > 0 ? 0.1 : 0.14;
  } else if (gap > 0) {
    closePct = pffPct >= 0.9
      ? 0.82 + (0.16 * trust)
      : pffPct >= 0.75
        ? 0.68 + (0.22 * trust)
        : pffPct >= 0.55
          ? 0.42 + (0.26 * trust)
          : pffPct >= 0.35
            ? 0.18 + (0.18 * trust)
            : 0.04 + (0.12 * trust);
  } else {
    closePct = pffPct >= 0.85
      ? 0.08 + (0.08 * (1 - trust))
      : pffPct >= 0.65
        ? 0.16 + (0.16 * (1 - trust))
        : pffPct >= 0.4
          ? 0.34 + (0.24 * trust)
          : 0.7 + (0.22 * trust);
  }
  closePct = Math.max(0.05, Math.min(0.92, closePct));
  let suggested = Math.round(mine + (gap * closePct));
  if (!hasPff && Math.abs(suggested - mine) > 2) suggested = mine + (gap > 0 ? 2 : -2);
  if (gap > 0 && hasPff && pffPct >= 0.88 && snapPct >= 0.65 && Math.abs(gap) >= 8) suggested = Math.max(suggested, madden - 1);
  if (gap > 0 && hasPff && pffPct >= 0.8 && snapPct >= 0.55 && Math.abs(gap) >= 7) suggested = Math.max(suggested, madden - 2);
  if (gap > 0 && hasPff && pffPct >= 0.7 && snapPct >= 0.45 && Math.abs(gap) >= 6) suggested = Math.max(suggested, mine + Math.min(Math.abs(gap), 5));
  if (gap > 0 && hasPff && pffPct < 0.35 && Math.abs(suggested - mine) > 2) suggested = mine + 2;
  if (gap > 0 && hasPff && pffPct >= 0.75 && snapPct >= 0.35 && Math.abs(gap) >= 3) suggested = Math.max(suggested, mine + Math.min(Math.abs(gap), 3));
  if (gap > 0 && hasPff && pffPct >= 0.55 && snapPct >= 0.4 && Math.abs(gap) >= 4) suggested = Math.max(suggested, mine + 2);
  if (gap < 0 && hasPff && pffPct >= 0.8) suggested = Math.max(suggested, mine - 1);
  if (gap < 0 && hasPff && pffPct <= 0.25 && Math.abs(gap) >= 4) suggested = Math.min(suggested, mine - 3);
  if (Math.abs(gap) >= 5 && suggested !== mine && Math.abs(suggested - mine) === 1 && hasPff && pffPct > 0.25 && pffPct < 0.8) {
    suggested = mine + (gap > 0 ? 2 : -2);
  }
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
      if (key === "suggestedDelta") return row.match ? num(maddenSuggestedRating(row), num(row.match.rating)) - num(row.match.rating) : -999;
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
  persistPlayer(player, { rating: safeRating, newRating: safeRating, ratingChangeType: "Manual adjustment", ratingChangeNote: meta.maddenPlayer ? `Madden ${meta.maddenPlayer} ${meta.maddenOvr || ""}`.trim() : "Madden comparison" });
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
    maddenSortHeader("diff", "Diff V", "num"),
    maddenSortHeader("pff", "PFF", "num"),
    maddenSortHeader("pffSnaps", "PFF Snaps", "num"),
    maddenSortHeader("suggested", "Suggested", "num"),
    maddenSortHeader("suggestedDelta", "Sug Diff", "num"),
    maddenSortHeader("pending", "Pending", "num"),
    "<th>Matched To</th>",
    "<th>Adjust</th>",
  ].join("");
  const body = rows.map((row) => {
    const pff = maddenRowPff(row);
    const key = esc(row.key);
    const diff = num(row.diff);
    const suggested = row.match ? maddenSuggestedRating(row, pff) : null;
    const suggestedDelta = row.match && suggested != null ? suggested - num(row.match.rating) : "";
    const baseline = maddenBaselineFor(row);
    const targetRating = row.match ? Math.max(50, Math.min(110, state.maddenSetTo[row.key] ?? (num(row.match.rating) + num(row.pending)))) : "";
    return `<tr>
      <td>${renderMaddenPlayer(row)}</td>
      <td><span class="pos-chip">${esc(maddenPosition(row.madden.pos))}</span></td>
      <td>${esc(row.madden.team)}</td>
      <td class="num">${ratingBadge(row.madden.ovr)}</td>
      <td class="num">${row.match ? ratingBadge(row.match.rating) : "-"}</td>
      <td class="num delta ${diff >= 0 ? "plus" : "minus"}">${row.match ? `${diff > 0 ? "+" : ""}${fmt(diff, 0)}` : "-"}</td>
      <td class="num">${renderMaddenPffCell(pff)}</td>
      <td class="num">${pff && Number.isFinite(Number(pff.snaps)) && Number(pff.snaps) >= 20 ? `<span class="madden-snap-pct" ${pffSnapStyle(pff.snapPercentile)} title="${esc(`${fmt(pff.snaps, 0)} snaps, ${pffTrustLabel(pff)} for this PFF position.`)}">${fmt(pff.snaps, 0)}<small>${Number.isFinite(Number(pff.snapPercentile)) ? `${fmt(pff.snapPercentile, 0)}%` : "no pct"}</small></span>` : "-"}</td>
      <td class="num">${renderMaddenSuggestion(row, pff)}</td>
      <td class="num delta ${num(suggestedDelta) >= 0 ? "plus" : "minus"}">${suggestedDelta !== "" ? `${suggestedDelta > 0 ? "+" : ""}${fmt(suggestedDelta, 0)}` : "-"}</td>
      <td class="num madden-pending-cell">${row.match ? `${row.pending > 0 ? "+" : ""}${fmt(row.pending, 0)}` : "-"}</td>
      <td>${renderMaddenMatchCell(row)}</td>
      <td>${row.match ? `<span class="madden-adjust"><button data-madden-nudge="-1" data-player-key="${key}">-1</button><button data-madden-nudge="1" data-player-key="${key}">+1</button><label>Set to <input class="madden-manual-rating" data-madden-target="${key}" type="number" min="68" max="110" value="${fmt(targetRating, 0)}" /></label><button class="primary" data-madden-apply="${key}">Apply</button>${baseline && num(row.match.rating) !== num(baseline.mine) ? `<button data-madden-baseline-one="${key}" data-madden-baseline-value="${esc(baseline.mine)}" title="Restore this row to the good Madden baseline Mine rating.">Restore ${fmt(baseline.mine, 0)}</button>` : ""}</span>` : ""}</td>
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
      const pendingCell = input.closest("tr")?.querySelector?.(".madden-pending-cell");
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
      setRatingHistoryStart(new Date(Date.now() - 1000).toISOString());
      filteredRows.forEach((row) => {
        if (!row.match || !row.key) return;
        if (maddenRecentAdjustments[row.key]) return;
        const suggested = maddenSuggestedRating(row);
        if (suggested == null || suggested === num(row.match.rating)) return;
        applyMaddenRating(row.key, suggested, { maddenPlayer: row.madden?.player, maddenOvr: row.madden?.ovr });
      });
      render();
    });
    document.querySelectorAll("[data-madden-baseline-one]").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.maddenBaselineOne;
      const player = findPlayer(key);
      if (!player) return;
      const rating = Math.max(68, Math.min(110, num(button.dataset.maddenBaselineValue, player.rating)));
      persistPlayer(player, { rating, newRating: rating, ratingChangeType: "Manual adjustment", ratingChangeNote: "Madden baseline restore" });
      delete maddenRecentAdjustments[key];
      storage.set("nflz-madden-recent-adjustments", maddenRecentAdjustments);
      render();
    }));
    document.querySelector("#madden-restore-baseline")?.addEventListener("click", () => {
      const toRestore = filteredRows.filter((row) => row.match && row.key && maddenBaselineFor(row) && num(row.match.rating) !== num(maddenBaselineFor(row).mine));
      if (!toRestore.length) return;
      if (!confirm(`Restore ${toRestore.length} Madden rows to the pasted good Mine ratings?`)) return;
      toRestore.forEach((row) => {
        const baseline = maddenBaselineFor(row);
        const rating = Math.max(68, Math.min(110, num(baseline.mine, row.match.rating)));
        persistPlayer(row.match, { rating, newRating: rating, ratingChangeType: "Manual adjustment", ratingChangeNote: "Madden baseline restore" });
        delete maddenRecentAdjustments[row.key];
      });
      storage.set("nflz-madden-recent-adjustments", maddenRecentAdjustments);
      state.maddenPending = {};
      state.maddenSetTo = {};
      render();
    });
    document.querySelector("#madden-clear-recent")?.addEventListener("click", () => {
      Object.keys(maddenRecentAdjustments).forEach((key) => delete maddenRecentAdjustments[key]);
      storage.set("nflz-madden-recent-adjustments", maddenRecentAdjustments);
      if (state.maddenView === "adjusted") state.maddenView = "matched";
      render();
    });
    document.querySelector("#madden-undo-recent")?.addEventListener("click", () => {
      const entries = Object.entries(maddenRecentAdjustments);
      if (!entries.length) return;
      if (!confirm(`Undo ${entries.length} recent Madden rating adjustment${entries.length === 1 ? "" : "s"}?`)) return;
      entries.forEach(([key, recent]) => {
        const player = findPlayer(key);
        if (!player || !Number.isFinite(Number(recent.oldRating))) return;
        persistPlayer(player, { rating: Number(recent.oldRating), newRating: Number(recent.oldRating), ratingChangeType: "Manual adjustment", ratingChangeNote: "Undo Madden adjustment" });
      });
      Object.keys(maddenRecentAdjustments).forEach((key) => delete maddenRecentAdjustments[key]);
      storage.set("nflz-madden-recent-adjustments", maddenRecentAdjustments);
      state.maddenPending = {};
      state.maddenSetTo = {};
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
  const suggestedCount = filteredRows.filter((row) => row.match && row.key && !maddenRecentAdjustments[row.key] && maddenSuggestedRating(row) !== num(row.match.rating)).length;
  const baselineRestoreCount = filteredRows.filter((row) => row.match && maddenBaselineFor(row) && num(row.match.rating) !== num(maddenBaselineFor(row).mine)).length;
  return `<section class="panel madden-panel">
    <div class="toolbar madden-toolbar">
      <div><h2>Madden Rating Comparison</h2><p>${maddenRows.length} EA Madden 27 non-specialist rows loaded. ${matched.length} exact matches, ${review.length} review matches, ${unmatched.length} need review/add.</p></div>
      <div class="filters">
        <button id="madden-set-adjusted" class="mini-action primary">Set Adjusted${setToCount ? ` ${setToCount}` : ""}</button>
        ${suggestedCount ? `<button id="madden-approve-suggested" class="mini-action primary" title="Skips rows already marked recently adjusted.">Approve All Suggested (${suggestedCount})</button>` : ""}
        ${baselineRestoreCount ? `<button id="madden-restore-baseline" class="mini-action danger" title="Restores rows in this filtered Madden view to the pasted good Mine ratings.">Restore Good Mine Ratings (${baselineRestoreCount})</button>` : ""}
        ${pendingCount ? `<button id="madden-apply-all" class="mini-action">Apply ${pendingCount} Pending</button>` : ""}
        ${recentCount ? `<button id="madden-undo-recent" class="mini-action danger" title="Restores recently adjusted Madden players to their previous ratings.">Undo Recent Madden (${recentCount})</button>` : ""}
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
    <div class="table-scroll madden-scroll"><table class="madden-table"><thead><tr>${headers}</tr></thead><tbody>${body || "<tr><td colspan='13'>No Madden rows in this view.</td></tr>"}</tbody></table></div>
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
  const winAbbrev = projection.favorite ? teamAbbrevFor(projection.favorite) : "PK";
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
      ${scheduleBubble("ODDS", oddsText, "", relativeMetricStyle(winProfile.favoriteChance * 100, 55, 22))}
      ${scheduleBubble("Total", fmt(projection.total, 1), "", relativeMetricStyle(projection.total, averages.total, 16))}
      ${scheduleBubble("HFA", `+${fmt(hfa, 1)}`, "", relativeMetricStyle(hfa, 1.5, 3))}
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
        ${metric("Win Odds", `${fmt(winProfile.favoriteChance * 100, 1)}%`, winProfile.favorite ? `${teamAbbrevFor(winProfile.favorite)} win` : "Pick'em")}
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
  if (state.scheduleWeek === "Current Week") state.scheduleWeek = selectedSiteWeek() || "All Weeks";
  const validScheduleWeeks = new Set(weeks.map(([value]) => value));
  if (!validScheduleWeeks.has(state.scheduleWeek)) state.scheduleWeek = selectedSiteWeek() || "All Weeks";
  let games = scheduleGames().filter(matches);
  if (state.scheduleView === "week" && state.scheduleWeek !== "All Weeks") games = games.filter((g) => scheduleWeekMatches(g, state.scheduleWeek));
  if (state.scheduleTeam !== "All Teams") games = games.filter((g) => normalizeTeamName(g.visitor) === normalizeTeamName(state.scheduleTeam) || normalizeTeamName(g.home) === normalizeTeamName(state.scheduleTeam));
  const totalGames = games.length;
  const visibleLimit = Number.isFinite(Number(state.scheduleVisibleLimit)) ? Number(state.scheduleVisibleLimit) : 80;
  const visibleGames = games.slice(0, Math.max(1, visibleLimit));
  const hiddenGameCount = Math.max(0, totalGames - visibleGames.length);
  const gameCountText = hiddenGameCount ? `${visibleGames.length} of ${totalGames} games shown` : `${totalGames} games shown`;
  const cardsByWeek = visibleGames.reduce((groups, game) => {
    const key = game.week ? scheduleWeekGroupKey(game.week) : "Unscheduled";
    groups[key] = groups[key] || [];
    groups[key].push(game);
    return groups;
  }, {});
  const weekGroups = Object.entries(cardsByWeek).sort(([a], [b]) => weekSortValue(a) - weekSortValue(b));
  setTimeout(() => {
    document.querySelector("#schedule-view")?.addEventListener("change", (event) => {
      state.scheduleView = event.target.value;
      state.scheduleVisibleLimit = 80;
      render();
    });
    wireScheduleControls();
    document.querySelector("#scan-draftkings-odds")?.addEventListener("click", scanDraftKingsOdds);
    document.querySelectorAll(".scan-espn-scores").forEach((button) => button.addEventListener("click", scanEspnScores));
    document.querySelector("#schedule-week")?.addEventListener("change", (event) => {
      state.scheduleWeek = event.target.value;
      state.scheduleVisibleLimit = 80;
      if (event.target.value !== "All Weeks") {
        state.siteWeek = event.target.value;
        storage.set("nflz-site-week", state.siteWeek);
      }
      render();
    });
    document.querySelector("#schedule-team")?.addEventListener("change", (event) => {
      state.scheduleTeam = event.target.value;
      state.scheduleVisibleLimit = 80;
      render();
    });
    document.querySelector("#schedule-show-more")?.addEventListener("click", () => {
      state.scheduleVisibleLimit = visibleLimit + 80;
      render();
    });
    document.querySelector("#schedule-show-all")?.addEventListener("click", () => {
      state.scheduleVisibleLimit = Number.MAX_SAFE_INTEGER;
      render();
    });
    document.querySelectorAll(".game-pick-select").forEach((sel) => sel.addEventListener("change", () => {
      autosaveGameAction(sel.dataset.game, { [sel.dataset.field]: sel.value });
    }));
    const persistScoreInput = (input, rerender = false) => {
      const patch = { [input.dataset.field]: input.value };
      const action = { ...gameAction(input.dataset.game), ...patch };
      if (Number.isFinite(Number(action.awayScore)) && Number.isFinite(Number(action.homeScore)) && action.awayScore !== "" && action.homeScore !== "") {
        const item = scheduleGames().map((game, index) => ({ game, key: scheduleGameKey(game, game.calendarIndex ?? index) })).find((row) => row.key === input.dataset.game);
        if (item) patch.resultWinner = num(action.awayScore) > num(action.homeScore) ? item.game.visitor : num(action.homeScore) > num(action.awayScore) ? item.game.home : "";
      }
      autosaveGameAction(input.dataset.game, patch);
      if (rerender) render();
    };
    document.querySelectorAll(".game-score-input").forEach((input) => {
      input.addEventListener("input", () => persistScoreInput(input, false));
      input.addEventListener("change", () => persistScoreInput(input, true));
    });
    document.querySelector(".schedule-groups")?.addEventListener("click", (event) => {
      if (isScheduleInteractiveTarget(event.target)) return;
      const card = event.target.closest(".schedule-card");
      if (!card) return;
      state.selectedScheduleKey = card.dataset.scheduleKey;
      render();
    });
    document.querySelectorAll(".schedule-card").forEach((card) => card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (isScheduleInteractiveTarget(event.target)) return;
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
        <div><h2>Season Schedule</h2><p class="schedule-count-line"><span>${gameCountText}. Cards wrap to the page width; each game still keeps rating, favorite, odds, HFA, and pick controls.</span><button class="mini-action scan-espn-scores" ${state.scoreScanStatus === "checking" ? "disabled" : ""}>Scan Scores</button></p></div>
        <div class="filters">
          ${optionSelect("schedule-view", state.scheduleView, [["season", "Season"], ["week", "Week"], ["team", "Team"]])}
          ${optionSelect("schedule-week", state.scheduleWeek, weeks)}
          ${select("schedule-team", state.scheduleTeam, teams)}
          ${optionSelect("schedule-sim-mode", state.scheduleSimMode, [["auto", `Auto (${scheduleActiveMode({ week: selectedSiteWeek(), preseason: String(selectedSiteWeek()).startsWith("Pre") })})`], ["preseason", "Preseason Mode"], ["regular", "Regular Mode"]])}
          <button id="scan-draftkings-odds" class="mini-action primary" ${state.draftKingsScanStatus === "checking" ? "disabled" : ""}>Scan DraftKings Odds</button>
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
      ${hiddenGameCount ? `<div class="schedule-show-more"><button id="schedule-show-more" class="mini-action">Show ${Math.min(80, hiddenGameCount)} More Games</button><button id="schedule-show-all" class="mini-action">Show All ${totalGames}</button></div>` : ""}
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
    visitor.sosTotal += num(scheduleComposite(teamByName(game.home), "regular", game.week), 84);
    home.sosTotal += num(scheduleComposite(teamByName(game.visitor), "regular", game.week), 84);
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

function standingMiniTable(rows, showSeed = false, scaleRows = rows) {
  const winValues = scaleRows.map((row) => row.wins);
  const lossValues = scaleRows.map((row) => row.losses);
  const favValues = scaleRows.map((row) => row.favored);
  const sosRanks = scaleRows.map((row) => row.sosRank);
  return table([
    ...(showSeed ? [{ label: "#", cls: "num" }] : []),
    { label: "Team" },
    { label: "W", cls: "num" },
    { label: "L", cls: "num" },
    { label: "Fav", cls: "num" },
    { label: "SOS Rk", cls: "num", title: "Strength of schedule rank. 1 is easiest." },
  ], rows.map((row, index) => `<tr>
    ${showSeed ? `<td class="num"><span class="rank mini-rank">${index + 1}</span></td>` : ""}
    <td><button class="standings-team-link" data-standings-team="${esc(row.team)}">${teamCellByName(row.team)}</button></td>
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
  return { home, away, projection, winner, homeAdvantage: game.homeAdvantage };
}

function playoffGameCard(game, label = "") {
  if (!game) return `<div class="sim-game-card empty">TBD</div>`;
  const awayAbbrev = teamByName(game.away.team)?.teamAbbrev || game.away.team;
  const homeAbbrev = teamByName(game.home.team)?.teamAbbrev || game.home.team;
  const awayWins = game.winner.team === game.away.team;
  const homeWins = game.winner.team === game.home.team;
  const gamePayload = btoa(unescape(encodeURIComponent(JSON.stringify({
    visitor: game.away.team,
    home: game.home.team,
    week: "Playoff",
    date: "",
    homeAdvantage: game.homeAdvantage ?? 0,
  }))));
  return `<button class="sim-game-card" data-playoff-game="${esc(gamePayload)}" title="Open game details">
    <span>${esc(label || "Projected")}</span>
    <div class="${awayWins ? "winner" : ""}">${teamLogo(game.away.team, awayAbbrev)}<b>${game.away.seed} ${esc(awayAbbrev)}</b><strong>${fmt(game.projection.visitor, 0)}</strong></div>
    <div class="${homeWins ? "winner" : ""}">${teamLogo(game.home.team, homeAbbrev)}<b>${game.home.seed} ${esc(homeAbbrev)}</b><strong>${fmt(game.projection.home, 0)}</strong></div>
  </button>`;
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
      <div class="sim-round"><h4>AFC Wild Card</h4>${afcBracket.wc.map((game) => playoffGameCard(game, "Final")).join("")}</div>
      <div class="sim-round"><h4>AFC Divisional</h4>${afcBracket.divisional.map((game) => playoffGameCard(game, "Final")).join("")}</div>
      <div class="sim-round"><h4>AFC Conference</h4>${playoffGameCard(afcBracket.championship, "AFC Final")}</div>
      <div class="sim-bracket-center"><span>Super Bowl</span><strong>${champion ? esc(teamByName(champion.team)?.teamAbbrev || champion.team) : "TBD"}</strong>${champion ? teamLogo(champion.team, teamByName(champion.team)?.teamAbbrev) : ""}${playoffGameCard(superBowl, "Neutral")}</div>
      <div class="sim-round"><h4>NFC Conference</h4>${playoffGameCard(nfcBracket.championship, "NFC Final")}</div>
      <div class="sim-round"><h4>NFC Divisional</h4>${nfcBracket.divisional.map((game) => playoffGameCard(game, "Final")).join("")}</div>
      <div class="sim-round"><h4>NFC Wild Card</h4>${nfcBracket.wc.map((game) => playoffGameCard(game, "Final")).join("")}</div>
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
  const divisionBubble = (division) => `<div class="division-bubble"><h4>${esc(division)}</h4>${standingMiniTable(rows.filter((row) => row.division === division).sort(standingSort), false, rows)}</div>`;
  setTimeout(() => {
    document.querySelectorAll("[data-playoff-game]").forEach((button) => button.addEventListener("click", () => {
      try {
        state.selectedPlayoffGame = JSON.parse(decodeURIComponent(escape(atob(button.dataset.playoffGame))));
        render();
      } catch {}
    }));
    document.querySelectorAll("[data-standings-team]").forEach((button) => button.addEventListener("click", () => {
      state.selectedTeamBreakdown = button.dataset.standingsTeam;
      render();
    }));
    document.querySelectorAll(".standings-panel .player-open").forEach((button) => button.addEventListener("click", () => {
      state.selectedPlayerKey = button.dataset.playerKey;
      render();
    }));
    wirePlayerModalControls();
    document.querySelectorAll(".projector-modal-close").forEach((button) => button.addEventListener("click", () => {
      state.selectedPlayoffGame = null;
      state.selectedTeamBreakdown = "";
      render();
    }));
    document.querySelectorAll(".projector-game-backdrop, .team-season-backdrop").forEach((backdrop) => backdrop.addEventListener("click", (event) => {
      if (event.target !== backdrop) return;
      state.selectedPlayoffGame = null;
      state.selectedTeamBreakdown = "";
      render();
    }));
  });
  return `<section class="panel standings-panel">
    <div class="toolbar"><div><h2>Season Projector</h2><p>Expected wins are built from current game win probabilities. Losses are 17 minus expected wins. SOS is average opponent projection strength.</p></div></div>
    <div class="standings-dashboard">
      <section class="standings-card league"><h3>Full League</h3><div class="table-scroll standings-mini-scroll">${standingMiniTable(rows, true, rows)}</div></section>
      <section class="standings-card playoff"><h3>Playoff View</h3>
        <div class="playoff-seed-columns">
          <div><h4>AFC</h4>${standingMiniTable(afcSeeds, true, rows)}</div>
          <div><h4>NFC</h4>${standingMiniTable(nfcSeeds, true, rows)}</div>
        </div>
      </section>
      <section class="standings-card divisions"><h3>Divisions</h3>
        <div class="division-conference-band"><h4>AFC</h4><div class="division-bubble-grid">${afcDivisions.map(divisionBubble).join("")}</div></div>
        <div class="division-conference-band"><h4>NFC</h4><div class="division-bubble-grid">${nfcDivisions.map(divisionBubble).join("")}</div></div>
      </section>
    </div>
    ${simBracket(rows)}
    ${renderPlayoffGameModal()}
    ${renderTeamSeasonBreakdownModal(rows)}
    ${renderPlayerModal()}
  </section>`;
}

function renderPlayoffGameModal() {
  const game = state.selectedPlayoffGame;
  if (!game) return "";
  const projection = scheduleProjection(game);
  const winProfile = projectionWinProfile(game, projection);
  const visitor = teamByName(game.visitor);
  const home = teamByName(game.home);
  const visitorAbbrev = visitor?.teamAbbrev || teamAbbrevFor(game.visitor);
  const homeAbbrev = home?.teamAbbrev || teamAbbrevFor(game.home);
  const rows = ["QB", "RB", "WR", "TE", "OL", "IDL", "EDGE", "LB", "CB", "S"].map((label) => {
    const away = visitor ? schedulePositionScore(visitor, label, "regular") : "";
    const homeScore = home ? schedulePositionScore(home, label, "regular") : "";
    return `<tr><td>${esc(label)}</td><td class="num cf" ${cfStyle(away, 68, 102)}>${fmt(away, 1)}</td><td class="num cf" ${cfStyle(homeScore, 68, 102)}>${fmt(homeScore, 1)}</td></tr>`;
  });
  return `<div class="schedule-detail-backdrop projector-game-backdrop">
    <section class="schedule-detail">
      <button class="modal-close projector-modal-close" title="Close">x</button>
      <div class="schedule-detail-head">
        <div><p class="eyebrow">Projected Playoff Game</p><h2>${esc(game.visitor)} at ${esc(game.home)}</h2><span>Neutral only for Super Bowl; otherwise lower seed hosts.</span></div>
        <div class="projected-score">${scheduleScorePill(game.visitor, projection.visitor)}<em>at</em>${scheduleScorePill(game.home, projection.home)}</div>
      </div>
      <div class="schedule-detail-metrics">
        ${metric("Spread", spreadLabel(game), "Model line")}
        ${metric("Total", fmt(projection.total, 1), "Projected points")}
        ${metric("Win Odds", `${fmt(winProfile.favoriteChance * 100, 1)}%`, winProfile.favorite ? `${teamAbbrevFor(winProfile.favorite)} win` : "Pick'em")}
      </div>
      <div class="schedule-detail-grid"><section><h3>Position Comparison</h3>${table([{ label: "Group" }, { label: visitorAbbrev, cls: "num" }, { label: homeAbbrev, cls: "num" }], rows)}</section></div>
      ${scheduleStarterComparison(game)}
    </section>
  </div>`;
}

function renderTeamSeasonBreakdownModal(rows) {
  const teamName = state.selectedTeamBreakdown;
  if (!teamName) return "";
  const team = teamByName(teamName);
  const row = rows.find((item) => normalizeTeamName(item.team) === normalizeTeamName(teamName));
  const games = scheduleGames().filter((game) => normalizeTeamName(game.visitor) === normalizeTeamName(teamName) || normalizeTeamName(game.home) === normalizeTeamName(teamName));
  const topPlayers = (side) => state.players
    .filter((player) => normalizeTeamName(player.team) === normalizeTeamName(teamName) && depthSideFor(player) === side && isPlayerAvailable(player))
    .sort((a, b) => num(b.rating) - num(a.rating))
    .slice(0, 5);
  const gameRows = games.map((game) => {
    const projection = scheduleProjection(game);
    const winProfile = projectionWinProfile(game, projection);
    const isHome = normalizeTeamName(game.home) === normalizeTeamName(teamName);
    const score = isHome ? projection.home : projection.visitor;
    const oppScore = isHome ? projection.visitor : projection.home;
    const winPct = winProfile.favorite === teamName ? winProfile.favoriteChance : 1 - winProfile.favoriteChance;
    const opp = isHome ? game.visitor : game.home;
    return `<tr><td>${esc(weekDisplay(game.week))}</td><td>${teamCellByName(opp)}</td><td class="num">${fmt(score, 0)}-${fmt(oppScore, 0)}</td><td class="num cf" ${cfStyle(winPct * 100, 0, 100)}>${fmt(winPct * 100, 1)}%</td></tr>`;
  });
  const playerList = (players) => players.map((player) => `<button class="season-top-player player-open" data-player-key="${esc(sourceKey(player))}">${playerAvatar(player)}<span>${esc(player.player)}</span>${ratingBadge(player.rating)}</button>`).join("");
  return `<div class="schedule-detail-backdrop team-season-backdrop">
    <section class="schedule-detail team-season-detail">
      <button class="modal-close projector-modal-close" title="Close">x</button>
      <div class="schedule-detail-head">
        <div><p class="eyebrow">Team Season Breakdown</p><h2>${teamLogo(team?.team || teamName, team?.teamAbbrev)}${esc(teamName)}</h2><span>${esc(row?.division || "")} / ${esc(row?.conference || "")}</span></div>
      </div>
      <div class="schedule-detail-metrics">
        ${metric("Expected Wins", fmt(row?.wins, 2), `${fmt(row?.losses, 2)} losses`)}
        ${metric("Favored", fmt(row?.favored, 0), "Games")}
        ${metric("SOS Rank", fmt(row?.sosRank, 0), "1 is easiest")}
        ${metric("Off / Def", `${fmt(team?.offenseAverage, 1)} / ${fmt(team?.defenseAverage, 1)}`, "Model ratings")}
      </div>
      <div class="schedule-detail-grid">
        <section><h3>Season Games</h3><div class="table-scroll mini-scroll">${table([{ label: "Wk" }, { label: "Opp" }, { label: "Score", cls: "num" }, { label: "Win %", cls: "num" }], gameRows)}</div></section>
        <section><h3>Top Offense</h3><div class="season-top-list">${playerList(topPlayers("Offense"))}</div><h3>Top Defense</h3><div class="season-top-list">${playerList(topPlayers("Defense"))}</div></section>
        <section>${scheduleTeamStartersList(teamName, selectedSiteWeek())}</section>
      </div>
    </section>
  </div>`;
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

function spreadTeamTokenMatches(teamToken, teamName) {
  const compact = (value) => String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const token = compact(teamToken);
  if (!token) return false;
  const abbrev = teamAbbrevFor(teamName, teamName);
  const aliases = new Set([
    compact(teamName),
    compact(normalizeTeamName(teamName)),
    compact(abbrev),
  ]);
  if (aliases.has("ARI")) aliases.add("ARZ");
  if (aliases.has("ARZ")) aliases.add("ARI");
  if (aliases.has("LAR")) aliases.add("LA");
  if (aliases.has("LAC")) aliases.add("LA");
  return aliases.has(token);
}

function spreadPickContext(pick, game, action) {
  if (!pick || action.awayScore === "" || action.homeScore === "") return null;
  const match = String(pick).trim().match(/^(.+?)\s+([+-])\s*([\d.]+)/);
  if (!match) return null;
  const teamToken = match[1].trim();
  const sign = match[2];
  const line = num(match[3]);
  const team = spreadTeamTokenMatches(teamToken, game.visitor) ? game.visitor : spreadTeamTokenMatches(teamToken, game.home) ? game.home : "";
  if (!team || !Number.isFinite(line)) return null;
  const teamScore = team === game.visitor ? num(action.awayScore) : num(action.homeScore);
  const oppScore = team === game.visitor ? num(action.homeScore) : num(action.awayScore);
  const adjusted = teamScore - oppScore + (sign === "+" ? line : -line);
  return { team, sign, line, adjusted };
}

function gradeSpreadPick(pick, game, action) {
  const context = spreadPickContext(pick, game, action);
  if (!context) return "";
  if (context.adjusted > 0) return "Win";
  if (context.adjusted < 0) return "Loss";
  return "Push";
}

function spreadCoverMargin(pick, game, action) {
  return spreadPickContext(pick, game, action)?.adjusted ?? null;
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

function pickChoiceWithContext(label, context) {
  return `<span class="pick-choice"><b>${esc(label || "-")}</b>${context ? `<em>${esc(context)}</em>` : ""}</span>`;
}

function spreadPickDisplay(pick, game, action) {
  if (!pick) return "-";
  const margin = spreadCoverMargin(pick, game, action);
  return pickChoiceWithContext(pick, margin === null ? "" : `Cover ${margin > 0 ? "+" : ""}${fmt(margin, 1)}`);
}

function totalPickDisplay(pick, action) {
  if (!pick) return "-";
  const total = action.awayScore !== "" && action.homeScore !== "" ? num(action.awayScore) + num(action.homeScore) : null;
  return pickChoiceWithContext(pick, total === null ? "" : `Total ${fmt(total, 0)}`);
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
    <div class="toolbar"><div><h2>Picks Tracker</h2><p>Tracks Model Z picks from Season Schedule. Picks grade once the result winner and final score are entered or scanned.</p></div></div>
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
          <td>${spreadPickDisplay(action.spread, game, action)}</td>
          <td>${pickResultBadge(spreadResult)}</td>
          <td>${totalPickDisplay(action.total, action)}</td>
          <td>${pickResultBadge(totalResult)}</td>
          <td>${action.awayScore !== "" && action.homeScore !== "" ? `${esc(action.awayScore)}-${esc(action.homeScore)}` : "-"}</td>
        </tr>`))}</div>
      </section>`;
    }).join("")}
  </section>`;
}

const gameSimSpeedMs = { slow: 1200, medium: 650, fast: 250, super: 80 };
let activeGameSims = [];
let gameSimTimers = {};

function gameSimHash(text) {
  let hash = 2166136261;
  String(text || "").split("").forEach((char) => {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  });
  return hash >>> 0;
}

function gameSimRandom(sim) {
  sim.seed = (Math.imul(sim.seed || 1, 1664525) + 1013904223) >>> 0;
  return sim.seed / 4294967296;
}

function gameSimWeekValue() {
  return state.gameSimWeek === "auto" ? selectedSiteWeek() : state.gameSimWeek;
}

function gameSimGameRows() {
  const week = gameSimWeekValue();
  return scheduleGames()
    .map((game, index) => ({ game, key: scheduleGameKey(game, game.calendarIndex ?? index) }))
    .filter(({ game }) => scheduleWeekMatches(game, week));
}

function gameSimTeamPlayers(teamName, week) {
  const qb = schedulePlayersFor(teamName, "QB", week)[0];
  const rb = schedulePlayersFor(teamName, "RB", week)[0];
  const wrs = schedulePlayersFor(teamName, "WR", week).slice(0, 4);
  const te = schedulePlayersFor(teamName, "TE", week)[0];
  const defense = [
    ...schedulePlayersFor(teamName, "EDGE", week).slice(0, 2),
    ...schedulePlayersFor(teamName, "LB", week).slice(0, 2),
    ...schedulePlayersFor(teamName, "CB", week).slice(0, 2),
  ];
  return { qb, rb, wrs, te, defense };
}

function gameSimNew(game, key) {
  const projection = scheduleProjection(game);
  const week = scheduleWeekGroupKey(game.week);
  const id = `sim-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const visitorAbbrev = teamAbbrevFor(game.visitor, game.visitor);
  const homeAbbrev = teamAbbrevFor(game.home, game.home);
  return {
    id,
    key,
    game,
    seed: gameSimHash(`${key}|${projection.visitor}|${projection.home}`),
    week,
    projection,
    clock: 15 * 60,
    quarter: 1,
    possession: gameSimHash(key) % 2 ? game.visitor : game.home,
    fieldPos: 25,
    down: 1,
    distance: 10,
    visitorScore: 0,
    homeScore: 0,
    playCount: 0,
    status: "live",
    log: ["Kickoff. Model Z simulation is live."],
    stats: {
      [game.visitor]: { plays: 0, passYds: 0, rushYds: 0, passTd: 0, rushTd: 0, turnovers: 0, possession: 0 },
      [game.home]: { plays: 0, passYds: 0, rushYds: 0, passTd: 0, rushTd: 0, turnovers: 0, possession: 0 },
    },
    playerStats: { [game.visitor]: {}, [game.home]: {} },
    rosters: {
      [game.visitor]: gameSimTeamPlayers(game.visitor, week),
      [game.home]: gameSimTeamPlayers(game.home, week),
    },
  };
}

function gameSimOffenseRating(sim, teamName) {
  const team = teamByName(teamName);
  return num(scheduleSideComposite(team, "offense", scheduleActiveMode(sim.game), sim.week), 84);
}

function gameSimDefenseRating(sim, teamName) {
  const team = teamByName(teamName);
  return num(scheduleSideComposite(team, "defense", scheduleActiveMode(sim.game), sim.week), 84);
}

function gameSimOpponent(sim, teamName) {
  return normalizeTeamName(teamName) === normalizeTeamName(sim.game.visitor) ? sim.game.home : sim.game.visitor;
}

function gameSimScore(sim, teamName, points) {
  if (normalizeTeamName(teamName) === normalizeTeamName(sim.game.visitor)) sim.visitorScore += points;
  else sim.homeScore += points;
}

function gameSimPlayerName(player, fallback) {
  return player?.player || fallback;
}

function gameSimStatName(player, fallback) {
  return cleanPlayerName(gameSimPlayerName(player, fallback)).replace(/\s+\((WR|CB)\)$/i, "");
}

function gameSimEnsurePlayerStat(sim, teamName, group, player, fallback) {
  const name = gameSimStatName(player, fallback);
  sim.playerStats[teamName] ||= {};
  sim.playerStats[teamName][group] ||= {};
  if (!sim.playerStats[teamName][group][name]) sim.playerStats[teamName][group][name] = {};
  return sim.playerStats[teamName][group][name];
}

function advanceGameSim(sim) {
  if (!sim || sim.status === "final") return;
  const offense = sim.possession;
  const defense = gameSimOpponent(sim, offense);
  const offRating = gameSimOffenseRating(sim, offense);
  const defRating = gameSimDefenseRating(sim, defense);
  const edge = (offRating - defRating) / 26;
  const rosters = sim.rosters[offense] || {};
  const isPass = gameSimRandom(sim) < Math.max(0.42, Math.min(0.68, 0.55 + edge * 0.08));
  const boom = gameSimRandom(sim);
  let yards = isPass
    ? Math.round(4 + (gameSimRandom(sim) * 14) + edge * 5)
    : Math.round(2 + (gameSimRandom(sim) * 8) + edge * 3);
  if (boom > 0.94) yards += Math.round(18 + gameSimRandom(sim) * 34);
  if (boom < 0.08) yards = -Math.round(gameSimRandom(sim) * 5);
  yards = Math.max(-8, Math.min(68, yards));
  const turnover = gameSimRandom(sim) < Math.max(0.015, 0.045 - edge * 0.01);
  const player = isPass
    ? (gameSimRandom(sim) < 0.18 ? rosters.te : rosters.wrs?.[Math.floor(gameSimRandom(sim) * Math.max(1, rosters.wrs.length))])
    : rosters.rb;
  const defender = (sim.rosters[defense]?.defense || [])[Math.floor(gameSimRandom(sim) * Math.max(1, (sim.rosters[defense]?.defense || []).length))];
  const completed = !isPass || gameSimRandom(sim) > Math.max(0.16, Math.min(0.34, 0.24 - edge * 0.035));
  if (isPass && !completed) yards = 0;
  const elapsed = Math.round(22 + gameSimRandom(sim) * 23);
  sim.clock -= elapsed;
  sim.stats[offense].possession += elapsed;
  while (sim.clock <= 0 && sim.quarter < 4) {
    sim.quarter += 1;
    sim.clock += 15 * 60;
    sim.log.unshift(`Start of Q${sim.quarter}.`);
  }
  if (sim.clock <= 0 && sim.quarter >= 4) {
    sim.clock = 0;
    sim.status = "final";
  }
  sim.playCount += 1;
  sim.stats[offense].plays += 1;
  if (isPass) {
    const qbStat = gameSimEnsurePlayerStat(sim, offense, "qb", rosters.qb, "QB");
    qbStat.att = num(qbStat.att) + 1;
    if (completed) qbStat.comp = num(qbStat.comp) + 1;
    qbStat.yds = num(qbStat.yds) + Math.max(0, yards);
    sim.stats[offense].passYds += Math.max(0, yards);
    if (completed && player) {
      const recStat = gameSimEnsurePlayerStat(sim, offense, "receiving", player, "Receiver");
      recStat.rec = num(recStat.rec) + 1;
      recStat.yds = num(recStat.yds) + Math.max(0, yards);
    }
  } else {
    const rushStat = gameSimEnsurePlayerStat(sim, offense, "rushing", player, "Runner");
    rushStat.car = num(rushStat.car) + 1;
    rushStat.yds = num(rushStat.yds) + Math.max(0, yards);
    sim.stats[offense].rushYds += Math.max(0, yards);
  }
  if (yards < 0 && defender) {
    const defStat = gameSimEnsurePlayerStat(sim, defense, "defense", defender, "Defender");
    defStat.stops = num(defStat.stops) + 1;
    if (isPass) defStat.sacks = num(defStat.sacks) + 1;
  }
  if (turnover) {
    sim.stats[offense].turnovers += 1;
    const defStat = gameSimEnsurePlayerStat(sim, defense, "defense", defender, "Defender");
    defStat.to = num(defStat.to) + 1;
    sim.log.unshift(`${teamAbbrevFor(defense)} takeaway. ${teamAbbrevFor(offense)} drive ends.`);
    sim.possession = defense;
    sim.fieldPos = Math.max(20, 100 - sim.fieldPos + Math.round(gameSimRandom(sim) * 15));
    sim.down = 1;
    sim.distance = 10;
  } else {
    sim.fieldPos += yards;
    const touchdown = sim.fieldPos >= 100;
    if (touchdown) {
      gameSimScore(sim, offense, 7);
      if (isPass) {
        sim.stats[offense].passTd += 1;
        const qbStat = gameSimEnsurePlayerStat(sim, offense, "qb", rosters.qb, "QB");
        qbStat.td = num(qbStat.td) + 1;
        if (player) {
          const recStat = gameSimEnsurePlayerStat(sim, offense, "receiving", player, "Receiver");
          recStat.td = num(recStat.td) + 1;
        }
      } else {
        sim.stats[offense].rushTd += 1;
        const rushStat = gameSimEnsurePlayerStat(sim, offense, "rushing", player, "Runner");
        rushStat.td = num(rushStat.td) + 1;
      }
      sim.log.unshift(`${teamAbbrevFor(offense)} TD: ${isPass ? gameSimPlayerName(rosters.qb, "QB") + " to " : ""}${gameSimPlayerName(player, isPass ? "receiver" : "runner")} for ${Math.max(1, yards)}.`);
      sim.possession = defense;
      sim.fieldPos = 25;
      sim.down = 1;
      sim.distance = 10;
    } else if (sim.fieldPos >= 82 && sim.down >= 3 && gameSimRandom(sim) < 0.38) {
      gameSimScore(sim, offense, 3);
      sim.log.unshift(`${teamAbbrevFor(offense)} field goal. Drive stalls in scoring range.`);
      sim.possession = defense;
      sim.fieldPos = 25;
      sim.down = 1;
      sim.distance = 10;
    } else {
      sim.distance -= yards;
      if (sim.distance <= 0) {
        sim.down = 1;
        sim.distance = Math.min(10, Math.max(1, 100 - sim.fieldPos));
        sim.log.unshift(`${teamAbbrevFor(offense)} first down: ${gameSimPlayerName(player, isPass ? "receiver" : "runner")} gains ${yards}.`);
      } else if (sim.down >= 4) {
        sim.log.unshift(`${teamAbbrevFor(offense)} punts after ${isPass ? "pass" : "run"} for ${yards}.`);
        sim.possession = defense;
        sim.fieldPos = Math.max(18, 100 - sim.fieldPos + Math.round(gameSimRandom(sim) * 20));
        sim.down = 1;
        sim.distance = 10;
      } else {
        sim.down += 1;
        sim.log.unshift(isPass && !completed
          ? `${teamAbbrevFor(offense)} incomplete. ${gameSimPlayerName(rosters.qb, "QB")} looking for ${gameSimPlayerName(player, "receiver")}.`
          : `${teamAbbrevFor(offense)} ${isPass ? "pass" : "run"}: ${gameSimPlayerName(player, isPass ? "receiver" : "runner")} ${yards >= 0 ? "+" : ""}${yards}.`);
      }
    }
  }
  if (sim.status === "final") sim.log.unshift(`Final: ${teamAbbrevFor(sim.game.visitor)} ${sim.visitorScore}, ${teamAbbrevFor(sim.game.home)} ${sim.homeScore}.`);
  sim.log = sim.log.slice(0, 6);
}

function gameSimClock(sim) {
  return `${sim.status === "final" ? "Final" : `Q${sim.quarter}`} ${String(Math.floor(sim.clock / 60)).padStart(2, "0")}:${String(Math.max(0, sim.clock % 60)).padStart(2, "0")}`;
}

function gameSimPossessionTime(seconds) {
  const safe = Math.max(0, Math.floor(num(seconds, 0)));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function gameSimFieldMarks(homeName) {
  const marks = [10, 20, 30, 40, 50, 40, 30, 20, 10];
  return `
    <div class="game-sim-endzone left"><span>${esc(teamAbbrevFor(homeName))}</span></div>
    <div class="game-sim-endzone right"><span>${esc(teamAbbrevFor(homeName))}</span></div>
    ${marks.map((mark, index) => `<span class="game-sim-yard-number top" style="left:${10 + index * 10}%">${mark}</span><span class="game-sim-yard-number bottom" style="left:${10 + index * 10}%">${mark}</span>`).join("")}
    ${Array.from({ length: 19 }, (_, index) => `<span class="game-sim-yard-stripe ${index % 2 ? "minor" : ""}" style="left:${5 + index * 5}%"></span>`).join("")}
  `;
}

function gameSimMiniName(name) {
  const parts = String(name || "").split(/\s+/).filter(Boolean);
  return parts.length > 1 ? `${parts[0][0]}. ${parts.slice(1).join(" ")}` : name;
}

function gameSimPlayerRows(sim, teamName, group, columns, limit = 4) {
  const rows = Object.entries(sim.playerStats?.[teamName]?.[group] || {})
    .sort((a, b) => Object.values(b[1]).reduce((sum, value) => sum + num(value), 0) - Object.values(a[1]).reduce((sum, value) => sum + num(value), 0))
    .slice(0, limit);
  if (!rows.length) return `<tr><td colspan="${columns.length + 1}" class="muted">No stats yet</td></tr>`;
  return rows.map(([name, stats]) => `<tr><td>${esc(gameSimMiniName(name))}</td>${columns.map(([key]) => `<td class="num">${fmt(stats[key] || 0, 0)}</td>`).join("")}</tr>`).join("");
}

function gameSimPlayerStatsPanel(sim, teamName) {
  const abbrev = teamAbbrevFor(teamName);
  const tableBlock = (title, group, columns) => `
    <section>
      <h4>${esc(title)}</h4>
      <table><thead><tr><th>${esc(abbrev)}</th>${columns.map(([, label]) => `<th class="num">${esc(label)}</th>`).join("")}</tr></thead><tbody>${gameSimPlayerRows(sim, teamName, group, columns)}</tbody></table>
    </section>
  `;
  return `<div class="game-sim-player-panel">
    <div class="game-sim-player-panel-head">${teamLogo(teamName, abbrev)}<b>${esc(abbrev)} Player Stats</b></div>
    ${tableBlock("QB Stats", "qb", [["comp", "C"], ["att", "A"], ["yds", "Yds"], ["td", "TD"]])}
    ${tableBlock("Rushing", "rushing", [["car", "Car"], ["yds", "Yds"], ["td", "TD"]])}
    ${tableBlock("Receiving", "receiving", [["rec", "Rec"], ["yds", "Yds"], ["td", "TD"]])}
    ${tableBlock("Defense", "defense", [["stops", "Stp"], ["sacks", "Sck"], ["to", "TO"]])}
  </div>`;
}

function gameSimCardHtml(sim) {
  const game = sim.game;
  const visitor = teamByName(game.visitor);
  const home = teamByName(game.home);
  const ballPct = normalizeTeamName(sim.possession) === normalizeTeamName(game.visitor) ? sim.fieldPos : 100 - sim.fieldPos;
  const statRows = [game.visitor, game.home].map((teamName) => {
    const stats = sim.stats[teamName];
    return `<tr><td>${teamLogo(teamName, teamAbbrevFor(teamName))}${esc(teamAbbrevFor(teamName))}</td><td class="num">${stats.passYds}</td><td class="num">${stats.rushYds}</td><td class="num">${stats.turnovers}</td><td class="num">${gameSimPossessionTime(stats.possession)}</td></tr>`;
  }).join("");
  const statTeam = sim.playCount % 2 ? game.home : game.visitor;
  return `<article class="game-sim-card" id="${esc(sim.id)}">
    <div class="game-sim-head">
      <div><span>${esc(weekDisplay(game.week))}</span><strong>${esc(teamAbbrevFor(game.visitor))} at ${esc(teamAbbrevFor(game.home))}</strong></div>
      <button class="mini-action game-sim-close" data-sim-id="${esc(sim.id)}">Stop</button>
    </div>
    <div class="game-sim-scoreboard">
      <div>${teamLogo(game.visitor, visitor?.teamAbbrev)}<b>${esc(teamAbbrevFor(game.visitor))}</b><strong>${sim.visitorScore}</strong><em>Proj ${sim.projection.visitor}</em></div>
      <span>${esc(gameSimClock(sim))}</span>
      <div>${teamLogo(game.home, home?.teamAbbrev)}<b>${esc(teamAbbrevFor(game.home))}</b><strong>${sim.homeScore}</strong><em>Proj ${sim.projection.home}</em></div>
    </div>
    <div class="game-sim-body">
      <div class="game-sim-field">
        <div class="game-sim-yardlines">${gameSimFieldMarks(game.home)}</div>
        <div class="game-sim-drive" style="left:${Math.max(4, Math.min(96, ballPct))}%"></div>
        <div class="game-sim-player away" style="left:${Math.max(5, Math.min(88, ballPct - 10))}%; top:${26 + (sim.playCount % 3) * 12}%">${esc(teamAbbrevFor(game.visitor))}</div>
        <div class="game-sim-player home" style="left:${Math.max(8, Math.min(92, ballPct + 7))}%; top:${58 - (sim.playCount % 3) * 10}%">${esc(teamAbbrevFor(game.home))}</div>
        <span class="game-sim-possession">${esc(teamAbbrevFor(sim.possession))} ${sim.down}&${sim.distance}</span>
      </div>
      <aside class="game-sim-boxscore">
        <h3>Box Score</h3>
        <table><thead><tr><th>Team</th><th>Pass Yds</th><th>Run Yds</th><th>TO</th><th>Poss</th></tr></thead><tbody>${statRows}</tbody></table>
        <div class="game-sim-log">${sim.log.map((line) => `<span>${esc(line)}</span>`).join("")}</div>
      </aside>
      ${gameSimPlayerStatsPanel(sim, statTeam)}
    </div>
  </article>`;
}

function drawGameSimCard(sim) {
  const node = document.getElementById(sim.id);
  if (node) node.outerHTML = gameSimCardHtml(sim);
  document.getElementById(sim.id)?.querySelector(".game-sim-close")?.addEventListener("click", () => stopGameSim(sim.id));
}

function stopGameSim(id) {
  if (gameSimTimers[id]) clearInterval(gameSimTimers[id]);
  delete gameSimTimers[id];
  activeGameSims = activeGameSims.filter((sim) => sim.id !== id);
}

function wireGameSimCloseButtons() {
  document.querySelectorAll(".game-sim-close").forEach((button) => {
    button.onclick = () => {
      stopGameSim(button.dataset.simId);
      render();
    };
  });
}

function startGameSimTicker(sim) {
  if (gameSimTimers[sim.id]) clearInterval(gameSimTimers[sim.id]);
  gameSimTimers[sim.id] = setInterval(() => {
    advanceGameSim(sim);
    drawGameSimCard(sim);
    if (sim.status === "final") {
      clearInterval(gameSimTimers[sim.id]);
      delete gameSimTimers[sim.id];
    }
  }, gameSimSpeedMs[state.gameSimSpeed] || gameSimSpeedMs.medium);
}

function refreshGameSimTickers() {
  activeGameSims.forEach(startGameSimTicker);
}

function startSelectedGameSim() {
  const rows = gameSimGameRows();
  const selected = rows.find((row) => row.key === state.gameSimGameKey) || rows[0];
  if (!selected) return;
  if (activeGameSims.length >= 4) return alert("You can run up to 4 simulations at a time.");
  const sim = gameSimNew(selected.game, selected.key);
  activeGameSims.push(sim);
  render();
  startGameSimTicker(sim);
}

function startVisibleGameSims() {
  const existing = new Set(activeGameSims.map((sim) => sim.key));
  const openSlots = Math.max(0, 4 - activeGameSims.length);
  gameSimGameRows().filter((row) => !existing.has(row.key)).slice(0, openSlots).forEach((row) => activeGameSims.push(gameSimNew(row.game, row.key)));
  render();
  refreshGameSimTickers();
}

function renderGameSimulator() {
  const weekOptions = [["auto", `Auto: ${siteWeekLabel()}`], ...scheduleWeekOptions(false)];
  const rows = gameSimGameRows();
  if (!rows.some((row) => row.key === state.gameSimGameKey)) state.gameSimGameKey = rows[0]?.key || "";
  const gameOptions = rows.map(({ game, key }) => [key, `${teamAbbrevFor(game.visitor)} at ${teamAbbrevFor(game.home)}${game.date ? ` / ${game.date}` : ""}`]);
  setTimeout(() => {
    document.querySelector("#game-sim-week")?.addEventListener("change", (event) => { state.gameSimWeek = event.target.value; state.gameSimGameKey = ""; render(); });
    document.querySelector("#game-sim-game")?.addEventListener("change", (event) => { state.gameSimGameKey = event.target.value; });
    document.querySelector("#game-sim-speed")?.addEventListener("change", (event) => { state.gameSimSpeed = event.target.value; refreshGameSimTickers(); });
    document.querySelector("#game-sim-start")?.addEventListener("click", startSelectedGameSim);
    document.querySelector("#game-sim-start-four")?.addEventListener("click", startVisibleGameSims);
    document.querySelector("#game-sim-clear")?.addEventListener("click", () => { activeGameSims.forEach((sim) => stopGameSim(sim.id)); activeGameSims = []; render(); });
    wireGameSimCloseButtons();
  });
  return `<section class="panel game-sim-panel">
    <div class="toolbar">
      <div><h2>Game Simulator</h2><p>Watch a Tecmo-style Model Z game roll out with projected score logic, depth-chart players, live clock, and box stats.</p></div>
      <div class="filters game-sim-controls">
        ${optionSelect("game-sim-week", state.gameSimWeek, weekOptions)}
        ${optionSelect("game-sim-game", state.gameSimGameKey, gameOptions.length ? gameOptions : [["", "No games found"]])}
        ${optionSelect("game-sim-speed", state.gameSimSpeed, [["slow", "Slow"], ["medium", "Medium"], ["fast", "Fast"], ["super", "Super Fast"]])}
        <button id="game-sim-start" class="mini-action primary">Start Game</button>
        <button id="game-sim-start-four" class="mini-action">Start Up To 4</button>
        <button id="game-sim-clear" class="mini-action danger">Clear Sims</button>
      </div>
    </div>
    <div class="game-sim-grid">${activeGameSims.map(gameSimCardHtml).join("") || "<p class='note'>Choose a game and start the broadcast. Up to 4 games can run at once.</p>"}</div>
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

async function scanFantasyProsAdp() {
  state.fantasyProsAdpScanStatus = "checking";
  state.fantasyProsAdpScanMessage = "Scanning FantasyPros ADP";
  render();
  try {
    const apiUrl = location.protocol === "file:" ? "http://127.0.0.1:8787/api/fantasypros-adp-scan" : "/api/fantasypros-adp-scan";
    const response = await fetch(apiUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Scan failed with HTTP ${response.status}`);
    window.FANTASYPROS_ADP = await response.json();
    const total = Object.values(window.FANTASYPROS_ADP.players || {}).reduce((sum, rows) => sum + (rows?.length || 0), 0);
    state.fantasyProsAdpScanStatus = "review";
    state.fantasyProsAdpScanMessage = `Updated ${total} FantasyPros ADP rows across FullPPR, .5PPR, and NoPPR.`;
  } catch (error) {
    const cached = window.FANTASYPROS_ADP;
    const total = Object.values(cached?.players || {}).reduce((sum, rows) => sum + (rows?.length || 0), 0);
    if (total) {
      state.fantasyProsAdpScanStatus = "review";
      state.fantasyProsAdpScanMessage = `Using cached FantasyPros ADP for ${total} rows because the local scan server is not running. Open the local server URL or run refresh-fantasypros-adp.bat to refresh live.`;
      render();
      return;
    }
    state.fantasyProsAdpScanStatus = "error";
    state.fantasyProsAdpScanMessage = error.message;
  }
  render();
}

function snapsStatsStatusNote() {
  const scan = window.FOOTBALLGUYS_GAME_LOGS;
  const status = state.snapsStatsScanStatus;
  const message = state.snapsStatsScanMessage || (scan?.fetchedAt ? `Footballguys cached ${new Date(scan.fetchedAt).toLocaleString()} for ${scan.players?.length || 0} QB rows.` : "No Footballguys snaps/stats scan loaded yet.");
  return `<span class="scan-status ${status}">${esc(message)}</span>`;
}

function fantasyProsAdpStatusNote() {
  const scan = window.FANTASYPROS_ADP;
  const total = Object.values(scan?.players || {}).reduce((sum, rows) => sum + (rows?.length || 0), 0);
  const status = state.fantasyProsAdpScanStatus;
  const message = state.fantasyProsAdpScanMessage || (scan?.fetchedAt ? `FantasyPros ADP cached ${new Date(scan.fetchedAt).toLocaleString()} for ${total} rows.` : "No FantasyPros ADP scan loaded yet.");
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
    window.DRAFTKINGS_ODDS = mergeDraftKingsOddsScan(await response.json(), window.DRAFTKINGS_ODDS);
    state.draftKingsScanStatus = "review";
    state.draftKingsScanMessage = `Updated ${window.DRAFTKINGS_ODDS.freshGames || 0} DraftKings odds rows from ESPN; preserved ${window.DRAFTKINGS_ODDS.preservedPastGames || 0} past-game rows.`;
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
  const scannedTeam = (value) => normalizeTeamName(normalizeScheduleTeam(value));
  const dateDistanceDays = (a, b) => {
    if (!a || !b) return Infinity;
    const left = dateOnly(a);
    const right = dateOnly(b);
    return Math.abs(left.getTime() - right.getTime()) / 86400000;
  };
  (payload?.games || []).filter((game) => game.completed && game.winner).forEach((result) => {
    const resultVisitor = result.visitor || result.away || result.awayTeam;
    const resultHome = result.home || result.homeTeam;
    const match = scheduleGames()
      .map((game, index) => ({ game, key: scheduleGameKey(game, game.calendarIndex ?? index) }))
      .find((row) => {
        const sameTeams = scannedTeam(row.game.visitor) === scannedTeam(resultVisitor) && scannedTeam(row.game.home) === scannedTeam(resultHome);
        if (!sameTeams) return false;
        if (row.game.date === result.date) return true;
        if (result.week && String(row.game.week) === String(result.week)) return true;
        return dateDistanceDays(row.game.date, result.date) <= 1;
      });
    if (!match) return;
    const winnerKey = scannedTeam(result.winner);
    const resultWinner = winnerKey === scannedTeam(match.game.visitor)
      ? match.game.visitor
      : winnerKey === scannedTeam(match.game.home)
        ? match.game.home
        : result.winner;
    saveGameAction(match.key, {
      resultWinner,
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
    ["vQB Rank", "matchRank", 0],
    ["OL Rank", "olRank", 0],
    ["PPG Rank", "ppgRank", 0],
    ["WR Rank", "wrRank", 0],
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

function weeklyQbSlider(key, label, min = 0, max = 200, readOnly = false) {
  const rawValue = num(state.weeklyQbWeights[key], defaultWeeklyQbWeights[key] ?? 100);
  const value = Math.max(min, Math.min(max, Math.round(rawValue / 10) * 10));
  const productionKeys = ["passYards", "passTds", "rushAttempts", "rushTds"];
  const productionWeight = weeklyQbProductionWeight();
  const disabled = readOnly || (productionKeys.includes(key) && productionWeight <= 0);
  return `
    <label class="formula-slider ${disabled ? "disabled" : ""}">
      <span>${esc(label)}</span>
      <input type="range" min="${min}" max="${max}" step="10" value="${esc(value)}" data-qb-weight="${esc(key)}" ${disabled ? "disabled" : ""} />
      <b>${esc(value)}%</b>
    </label>
  `;
}

function renderWeeklyQbFormulaControls(readOnly = false) {
  const open = Boolean(state.weeklyQbControlsOpen);
  return `
    <section class="formula-control-panel ${open ? "" : "collapsed"} ${readOnly ? "read-only" : ""}">
      <div class="formula-control-head">
        <h3>${readOnly ? "Weekly Score Controls Used Here" : "Score Controls"}</h3>
        <div class="formula-control-actions">
          ${state.weeklyQbDefaultMessage ? `<span class="formula-save-note">${esc(state.weeklyQbDefaultMessage)}</span>` : ""}
          ${readOnly ? `<button class="mini-action primary" data-page="weeklyFantasy">Weekly Fantasy Rankings Screen</button>` : `<button id="weekly-qb-toggle-controls" class="mini-action">${open ? "Hide" : "Show"}</button>`}
          ${open && !readOnly ? `<button id="weekly-qb-set-default" class="mini-action">Set Default</button>` : ""}
          ${open && !readOnly ? `<button id="weekly-qb-reset-formula" class="mini-action">Reset Formula</button>` : ""}
        </div>
      </div>
      ${open ? `
      <div class="formula-slider-grid">
        ${weeklyQbSlider("statRanks", "StatRanks", 0, 100, readOnly)}
        ${weeklyQbSlider("last5", "Last 5 Blend", 0, 100, readOnly)}
        ${weeklyQbSlider("production2025", "2025 Production", 0, 100, readOnly)}
        ${weeklyQbSlider("production2026", "2026 Production", 0, 100, readOnly)}
        ${weeklyQbSlider("talent", "Talent", 0, 200, readOnly)}
        ${weeklyQbSlider("matchup", "Matchup", 0, 200, readOnly)}
        ${weeklyQbSlider("depth", "Depth", 0, 200, readOnly)}
        ${weeklyQbSlider("oline", "O-Line", 0, 200, readOnly)}
        ${weeklyQbSlider("ppg", "PPG", 0, 200, readOnly)}
        ${weeklyQbSlider("wr", "WR Group", 0, 200, readOnly)}
        ${weeklyQbSlider("passYards", "Pass Yards", 0, 200, readOnly)}
        ${weeklyQbSlider("passTds", "Pass TDs", 0, 200, readOnly)}
        ${weeklyQbSlider("rushAttempts", "Rush Attempts", 0, 200, readOnly)}
        ${weeklyQbSlider("rushTds", "Rush TDs", 0, 200, readOnly)}
      </div>
      ` : ""}
    </section>
  `;
}

function normalizeFantasyPositionLabel(label) {
  const text = String(label || "").trim();
  const upper = text.toUpperCase();
  if (["QB", "RB", "WR", "TE"].includes(upper)) return upper;
  if (upper === "HB") return "RB";
  if (upper === "DST" || upper === "DEF" || upper.includes("DEFENSE")) return "Defense";
  if (upper === "K" || upper.includes("KICK")) return "Kicker";
  return text;
}

function fantasyRankPositions(kind) {
  const imported = Object.keys(fantasyRankBundle(kind)).map(normalizeFantasyPositionLabel);
  const core = ["QB", "RB", "WR", "TE", "Defense", "Kicker"];
  return [...new Set([...core, ...imported].filter(Boolean))];
}

function fantasyRankItem(kind, position) {
  const bundle = fantasyRankBundle(kind);
  const normalized = normalizeFantasyPositionLabel(position);
  return bundle[position]
    || bundle[normalized]
    || Object.entries(bundle).find(([key]) => normalizeFantasyPositionLabel(key) === normalized)?.[1]
    || { rows: [], sheet: normalized };
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

function clayProjectionFor(player, position = "") {
  const rows = window.CLAY_PROJECTIONS?.players || [];
  const playerKey = fantasyMergeKey(player.player || player);
  const wantedPosition = normalizeFantasyPositionLabel(position || groupPosition(player.position) || player.position || "");
  const wantedTeam = normalizeTeamName(teamAbbrevFor(player.team, player.team));
  return rows.find((row) => fantasyMergeKey(row.player) === playerKey && normalizeFantasyPositionLabel(row.position) === wantedPosition && normalizeTeamName(row.team) === wantedTeam)
    || rows.find((row) => fantasyMergeKey(row.player) === playerKey && normalizeFantasyPositionLabel(row.position) === wantedPosition)
    || rows.find((row) => fantasyMergeKey(row.player) === playerKey)
    || null;
}

function clayPerGame(row, key, fallback = "") {
  const games = Math.max(1, num(row?.games, 17));
  const value = Number(row?.[key]);
  return Number.isFinite(value) ? value / games : fallback;
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

function teamDepthRating(team, group, depth = 1, fallback = "") {
  const teamName = typeof team === "string" ? team : team?.team;
  const player = schedulePlayersFor(teamName, group)[depth - 1];
  const value = player?.rating;
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function weightedRatingAverage(parts, fallback = "") {
  const score = weightedAverage(parts.map(([value, weight = 1]) => ({ value, weight })));
  return Number.isFinite(Number(score)) ? score : fallback;
}

function matchupWeight(key) {
  const saved = state.weeklyMatchupWeights || {};
  if (saved[key] !== undefined || defaultWeeklyMatchupWeights[key] !== undefined) {
    return num(saved[key], defaultWeeklyMatchupWeights[key] ?? 100) / 100;
  }
  const fallbackKey = key.replace(/\d+$/, "");
  if (saved[fallbackKey] !== undefined) return num(saved[fallbackKey], 100) / 100;
  return 0;
}

function qbDefenseRatingForTeam(team) {
  if (!team) return "";
  return weightedRatingAverage([
    ...["IDL", "EDGE", "LB", "CB", "S"].flatMap((group) => [1, 2, 3, 4, 5].map((depth) => [teamDepthRating(team, group, depth), matchupWeight(`vQB_${group}${depth}`)])),
  ], teamPositionScore(team, "Defense") || 84);
}

function rbDefenseRatingForTeam(team) {
  if (!team) return "";
  return weightedRatingAverage([
    ...["IDL", "EDGE", "LB"].flatMap((group) => [1, 2, 3, 4, 5].map((depth) => [teamDepthRating(team, group, depth), matchupWeight(`vRB_${group}${depth}`)])),
  ], teamPositionScore(team, "Defense") || 84);
}

function wrDefenseRatingForTeam(team) {
  if (!team) return "";
  return weightedRatingAverage([
    ...["CB", "S"].flatMap((group) => [1, 2, 3, 4, 5].map((depth) => [teamDepthRating(team, group, depth), matchupWeight(`vWR_${group}${depth}`)])),
  ], teamPositionScore(team, "Defensive Backs") || teamPositionScore(team, "Defense") || 84);
}

function teDefenseRatingForTeam(team) {
  if (!team) return "";
  return weightedRatingAverage([
    ...["EDGE", "LB", "S", "CB"].flatMap((group) => [1, 2, 3, 4, 5].map((depth) => [teamDepthRating(team, group, depth), matchupWeight(`vTE_${group}${depth}`)])),
  ], teamPositionScore(team, "Defense") || 84);
}

function receiverMatchupRating(player, opponentTeam) {
  const group = groupPosition(player.position);
  if (group !== "WR" || !opponentTeam) return "";
  const depth = Math.max(1, Math.min(3, num(player.depth, 3)));
  return teamDepthRating(opponentTeam, "CB", depth, wrDefenseRatingForTeam(opponentTeam));
}

function weeklyQbStatPack(player, workbookRow) {
  const log = footballguysLogFor(player);
  const useClay = !log || num(log.gamesPlayed, 0) < 8;
  const clay = useClay ? clayProjectionFor(player, "QB") : null;
  const wb = (label) => fantasyDetailValue(workbookRow || {}, label);
  const fallbackPassYards = Number(wb("Typical Pass Yards"));
  const fallbackPassTds = Number(wb("Typical Pass TDs"));
  const fallbackRushAttempts = Number(wb("Typical Rush Attempts"));
  const fallbackRushTds = Number(wb("Typical Rush TDs"));
  const season = {
    passYards: Number.isFinite(log?.averages?.passYards) && !useClay ? log.averages.passYards : clayPerGame(clay, "passYards", Number.isFinite(fallbackPassYards) ? fallbackPassYards : 205 + Math.max(0, num(player.rating, 75) - 75) * 2.2),
    passTds: Number.isFinite(log?.averages?.passTds) && !useClay ? log.averages.passTds : clayPerGame(clay, "passTds", Number.isFinite(fallbackPassTds) ? fallbackPassTds : 1.15 + Math.max(0, num(player.rating, 75) - 75) * 0.035),
    rushAttempts: Number.isFinite(log?.averages?.rushAttempts) && !useClay ? log.averages.rushAttempts : clayPerGame(clay, "rushAttempts", Number.isFinite(fallbackRushAttempts) ? fallbackRushAttempts : 2.2),
    rushYards: Number.isFinite(log?.averages?.rushYards) && !useClay ? log.averages.rushYards : clayPerGame(clay, "rushYards", 0),
    rushTds: Number.isFinite(log?.averages?.rushTds) && !useClay ? log.averages.rushTds : clayPerGame(clay, "rushTds", Number.isFinite(fallbackRushTds) ? fallbackRushTds : 0.12),
  };
  const last5 = {
    passYards: Number.isFinite(log?.last5Averages?.passYards) && !useClay ? log.last5Averages.passYards : season.passYards,
    passTds: Number.isFinite(log?.last5Averages?.passTds) && !useClay ? log.last5Averages.passTds : season.passTds,
    rushAttempts: Number.isFinite(log?.last5Averages?.rushAttempts) && !useClay ? log.last5Averages.rushAttempts : season.rushAttempts,
    rushYards: Number.isFinite(log?.last5Averages?.rushYards) && !useClay ? log.last5Averages.rushYards : season.rushYards,
    rushTds: Number.isFinite(log?.last5Averages?.rushTds) && !useClay ? log.last5Averages.rushTds : season.rushTds,
  };
  return { log, clay, usedClay: Boolean(clay), gamesPlayed: log?.gamesPlayed || (clay ? clay.games : 0), season, last5 };
}

function weeklyQbScore(row) {
  return weeklyQbScoreBreakdown(row, "blend").score;
}

function weeklyQbStatRankWeight() {
  const weights = { ...defaultWeeklyQbWeights, ...state.weeklyQbWeights };
  const options = { ...defaultWeeklyQbOptions, ...state.weeklyQbOptions };
  const stored = state.weeklyQbWeights?.statRanks;
  return Math.max(0, Math.min(1, num(stored, options.useStatRanks ? weights.statRanks : 0) / 100));
}

function hasActual2026Production() {
  const logs = window.FOOTBALLGUYS_GAME_LOGS;
  return Number(logs?.year) >= 2026 && Array.isArray(logs?.players) && logs.players.some((player) => Number(player?.gamesPlayed) > 0);
}

function weeklyQbProductionWeight() {
  const weights = { ...defaultWeeklyQbWeights, ...state.weeklyQbWeights };
  const options = { ...defaultWeeklyQbOptions, ...state.weeklyQbOptions };
  if (!options.useProduction && state.weeklyQbWeights?.production2025 === undefined && state.weeklyQbWeights?.production2026 === undefined) return 0;
  const active2026Weight = hasActual2026Production() ? num(weights.production2026, 100) : 0;
  return Math.max(0, Math.min(1, Math.max(num(weights.production2025, 100), active2026Weight) / 100));
}

function weightedStatRankScore(statRank, ratingFallback, statWeight) {
  const ratingScore = num(ratingFallback, 84);
  const statScore = Number.isFinite(Number(statRank)) ? 33 - Number(statRank) : ratingScore;
  return ratingScore * (1 - statWeight) + statScore * statWeight;
}

function weeklyQbScoreBreakdown(row, mode = "blend") {
  const weights = { ...defaultWeeklyQbWeights, ...state.weeklyQbWeights };
  const scaleFactor = (factor, weight) => 1 + ((factor - 1) * (num(weight, 100) / 100));
  const termWeight = (key) => num(weights[key], 100) / 100;
  const productionWeight = weeklyQbProductionWeight();
  const depthRaw = row.depth;
  const depthNum = Number.isFinite(Number(depthRaw)) ? Number(depthRaw) : 100;
  const depthBucket = Math.max(1, Math.min(4, depthNum || 1));
  const depthFactor = [1, 0.6, 0.42, 0.28][depthBucket - 1];
  const matchRank = num(row.extras["Matchup Rating (Low is good)"], 16.5);
  const rateP = num(row.rating, 75);
  const olRank = num(row.extras["OL Rank"], 16.5);
  const wrRank = num(row.extras["WR Group Rank"], 16.5);
  const ppgRank = num(row.extras["PPG Rank"], 16.5);
  const blendProduction = (value, fallback) => fallback + ((num(value, fallback) - fallback) * productionWeight);
  const seaPY = blendProduction(row.extras["Typical Pass Yards"], 225);
  const seaPTD = blendProduction(row.extras["Typical Pass TDs"], 1.6);
  const seaRA = blendProduction(row.extras["Typical Rush Attempts"], 3);
  const seaRTD = blendProduction(row.extras["Typical Rush TDs"], 0.2);
  const lfivePY = blendProduction(row.extras["!!LAST 5!!\nTypical Pass Yards"], seaPY);
  const lfivePTD = blendProduction(row.extras["!!LAST 5!!\nTypical Pass TDs"], seaPTD);
  const lfiveRA = blendProduction(row.extras["!!LAST 5!!\nTypical Rush Attempts"], seaRA);
  const lfiveRTD = blendProduction(row.extras["!!LAST 5!!\nTypical Rush TDs"], seaRTD);
  const wLast5 = productionWeight <= 0 || mode === "season" ? 0 : mode === "last5" ? 1 : num(weights.last5, 68) / 100;
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

function buildWeeklyQbRows(workbookRows, weekOverride = null) {
  const week = weekOverride || selectedSiteWeek() || fantasyRankBundle("weekly")?.QB?.week || window.FANTASY_RANKINGS?.weeklyWeek || 1;
  const teams = state.data?.teams || [];
  const allQbs = state.players.filter((player) => player.team !== "Free Agent" && (groupPosition(player.position) === "QB" || player.position === "QB"));
  const rankedTeamsByOl = teams.map((team) => ({ team, score: teamPositionScore(team, "OL") })).filter((row) => Number.isFinite(Number(row.score)));
  const rankedTeamsByWr = teams.map((team) => ({ team, score: teamPositionScore(team, "WR") })).filter((row) => Number.isFinite(Number(row.score)));
  const rankedTeamsByVqb = teams.map((team) => ({ team, score: qbDefenseRatingForTeam(team) })).filter((row) => Number.isFinite(Number(row.score)));
  const rankedTeamsByStatVqb = teams.map((team) => ({ team, score: teamRankingsByTeam(team.team)?.passAllowedStatAvg })).filter((row) => Number.isFinite(Number(row.score)));
  const statRankWeight = weeklyQbStatRankWeight();
  const rankedByPpg = teams.map((team) => {
    const ranks = teamRankingsByTeam(team.team);
    return { team, score: weightedStatRankScore(ranks?.offPointsRank, team.offenseRating, statRankWeight) };
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
    const ppgRow = { team, score: weightedStatRankScore(teamRankingsByTeam(player.team)?.offPointsRank, num(team?.offenseRating, 16), statRankWeight) };
    const oppVqbRating = qbDefenseRatingForTeam(opponentTeam);
    const opponentVqbRow = { team: opponentTeam, score: oppVqbRating };
    const opponentStatVqbRow = { team: opponentTeam, score: opponentRanks?.passAllowedStatAvg };
    const matchupRating = rankNumber(rankedTeamsByVqb, (item) => item.score, opponentVqbRow, false) || 16.5;
    const statVqbRank = rankNumber(rankedTeamsByStatVqb, (item) => item.score, opponentStatVqbRow) || "";
    const salary = Number(workbookRow?.extras?.Salary);
    const extras = {
      "Opp vQB Rating": Number.isFinite(Number(oppVqbRating)) && Number(oppVqbRating) > 0 ? Number(Number(oppVqbRating).toFixed(1)) : "",
      "Matchup Rating (Low is good)": Number.isFinite(Number(matchupRating)) ? matchupRating : 16.5,
      "Stat vQB Rank": statVqbRank,
      "Player Rating Rank": "",
      "Value Rank": "",
      "FPros Name": workbookRow?.extras?.["FPros Name"] || "",
      "Salary": Number.isFinite(salary) && salary > 0 ? salary : "",
      "OL Rating": Number.isFinite(Number(olRating)) ? Number(Number(olRating).toFixed(3)) : "",
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
      "Stat Source": statPack.usedClay ? "Clay projection*" : (statPack.log ? "Footballguys" : "Fallback"),
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
    row.seasonRank = rankNumber(rows, (item) => item.seasonScore, row);
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

function weeklyRbStatPack(player, workbook = {}) {
  const wb = (label) => fantasyDetailValue(workbook || {}, label);
  const depth = Math.max(1, Math.min(4, num(player.depth, 3)));
  const snapBase = 70 - (2 * (depth - 1));
  const targetBase = 3.8 - (0.3 * (depth - 1));
  const rzBase = 1.3 - (0.1 * (depth - 1));
  const clay = clayProjectionFor(player, "RB");
  const clayTargets = clayPerGame(clay, "targets", "");
  const clayTouchdowns = clay ? clayPerGame(clay, "rushTds", 0) + clayPerGame(clay, "recTds", 0) : "";
  const clayRz = Number.isFinite(Number(clayTouchdowns)) ? Math.max(rzBase, Math.min(2.4, Number(clayTouchdowns) * 1.2)) : "";
  const season = {
    snapPct: num(wb("Typical Snap %"), snapBase),
    targets: num(wb("Typical Targets"), Number.isFinite(Number(clayTargets)) ? clayTargets : targetBase),
    rz: num(wb("Typical Red Zone Opportunities"), Number.isFinite(Number(clayRz)) ? clayRz : rzBase),
  };
  const last5 = {
    snapPct: num(wb("!!LAST 5!!\nTypical Snap %") || wb("!!Last 5!!\nTypical Snap %"), season.snapPct),
    targets: num(wb("!!LAST 5!!\nTypical Targets") || wb("!!Last 5!!\nTypical Targets"), season.targets),
    rz: num(wb("!!LAST 5!!\nTypical Red Zone Opportunities") || wb("!!Last 5!!\nTypical Red Zone Opportunities"), season.rz),
  };
  return { season, last5, clay, usedClay: Boolean(clay && (!Number.isFinite(Number(wb("Typical Targets"))) || !Number.isFinite(Number(wb("Typical Red Zone Opportunities"))))) };
}

function weeklySkillOptions() {
  return { ...defaultWeeklySkillOptions, ...state.weeklySkillOptions };
}

function weeklySkillStatRankWeight() {
  const weights = { ...defaultWeeklySkillWeights, ...state.weeklySkillWeights };
  const options = weeklySkillOptions();
  const stored = state.weeklySkillWeights?.statRanks;
  return Math.max(0, Math.min(1, num(stored, options.useStatRanks ? weights.statRanks : 0) / 100));
}

function weeklySkillProductionWeight() {
  const weights = { ...defaultWeeklySkillWeights, ...state.weeklySkillWeights };
  const options = weeklySkillOptions();
  if (!options.useProduction && state.weeklySkillWeights?.production2025 === undefined && state.weeklySkillWeights?.production2026 === undefined) return 0;
  const active2026Weight = hasActual2026Production() ? num(weights.production2026, 100) : 0;
  return Math.max(0, Math.min(1, Math.max(num(weights.production2025, 100), active2026Weight) / 100));
}

function weeklySkillLast5Blend(mode = "blend") {
  const weights = { ...defaultWeeklySkillWeights, ...state.weeklySkillWeights };
  if (weeklySkillProductionWeight() <= 0 || mode === "season") return 0;
  if (mode === "last5") return 1;
  return num(weights.last5, 68) / 100;
}

function weeklySkillProductionValue(value, fallback) {
  const productionWeight = weeklySkillProductionWeight();
  return fallback + ((num(value, fallback) - fallback) * productionWeight);
}

function weeklyGameForTeam(teamName, week = selectedSiteWeek()) {
  const teamKey = normalizeScheduleTeam(teamName);
  return scheduleGames().find((item) => scheduleWeekMatches(item, week) && (normalizeScheduleTeam(item.visitor) === teamKey || normalizeScheduleTeam(item.home) === teamKey)) || null;
}

function weeklyTeamImpliedTotal(teamName, opponent = "", week = selectedSiteWeek()) {
  const game = weeklyGameForTeam(teamName, week);
  if (!game) return "";
  const projection = scheduleProjection(game);
  const teamKey = normalizeScheduleTeam(teamName);
  const isHome = normalizeScheduleTeam(game.home) === teamKey;
  const value = isHome ? projection.home : projection.visitor;
  return Number.isFinite(Number(value)) ? Number(Number(value).toFixed(1)) : "";
}

function weeklyGameScriptValue(teamName, week = selectedSiteWeek()) {
  const game = weeklyGameForTeam(teamName, week);
  if (!game) return "";
  const teamKey = normalizeScheduleTeam(teamName);
  const isHome = normalizeScheduleTeam(game.home) === teamKey;
  const projection = scheduleProjection(game);
  const margin = isHome ? projection.home - projection.visitor : projection.visitor - projection.home;
  return Number(margin.toFixed(1));
}

function weeklySkillExtraFactorMultiplier(row, position) {
  const options = weeklySkillOptions();
  const weights = { ...defaultWeeklySkillWeights, ...state.weeklySkillWeights };
  const active = (options.extraFactors || []).filter((key) => num(weights[key], 0) !== 0);
  if (!active.length) return 1;
  return active.reduce((factor, key) => {
    const weight = num(weights[key], 0) / 100;
    if (key === "gameScript") {
      const margin = num(row.extras["Game Script"], 0);
      const positionLean = position === "RB" ? margin : -margin * 0.35;
      return factor * Math.max(0.92, Math.min(1.08, 1 + (positionLean / 80) * weight));
    }
    if (key === "teamTotal") {
      return factor * Math.max(0.92, Math.min(1.1, 1 + ((num(row.extras["Team Total"], 22) - 22) / 100) * weight));
    }
    if (key === "opponentTd") {
      if (weeklySkillStatRankWeight() <= 0) return factor;
      const rank = num(row.extras[position === "RB" ? "Rush TDs Allowed Rank" : "Pass TDs Allowed Rank"], 16.5);
      return factor * Math.max(0.92, Math.min(1.08, 1 + ((16.5 - rank) / 170) * weight));
    }
    return factor;
  }, 1);
}

function weeklyRbScoreBreakdown(row, mode = "blend") {
  const weights = { ...defaultWeeklySkillWeights, ...state.weeklySkillWeights };
  const scaleExp = (exp, key) => exp * (num(weights[key], 100) / 100);
  const scaleTerm = (value, key) => value * (num(weights[key], 100) / 100);
  const depthRaw = row.depth;
  const depthN = Number.isFinite(Number(depthRaw)) ? Number(depthRaw) : 100;
  const dBkt = Math.max(1, Math.min(4, depthN || 3));
  const depthStep = dBkt - 1;
  const injFlag = /inj|ir|out/i.test(String(row.injury || ""));
  const oppRank = num(row.extras["Opp vRB Rank"], 16.5);
  const olRank = num(row.extras["OL Rank"], 16.5);
  const rating = num(row.rating, 75);
  const ypgRank = num(row.extras["Team YPG Rank"], 16.5);
  const ppgRank = num(row.extras["PPG Rank"], 16.5);
  const wLast5 = weeklySkillLast5Blend(mode);
  const snapPct = ((1 - wLast5) * weeklySkillProductionValue(row.extras["Typical Snap %"], 70)) + (wLast5 * weeklySkillProductionValue(row.extras["!!LAST 5!!\nTypical Snap %"], weeklySkillProductionValue(row.extras["Typical Snap %"], 70)));
  const targetsEffBase = ((1 - wLast5) * weeklySkillProductionValue(row.extras["Typical Targets"], 3.8)) + (wLast5 * weeklySkillProductionValue(row.extras["!!LAST 5!!\nTypical Targets"], weeklySkillProductionValue(row.extras["Typical Targets"], 3.8)));
  const rzEffBase = ((1 - wLast5) * weeklySkillProductionValue(row.extras["Typical Red Zone Opportunities"], 1.3)) + (wLast5 * weeklySkillProductionValue(row.extras["!!LAST 5!!\nTypical Red Zone Opportunities"], weeklySkillProductionValue(row.extras["Typical Red Zone Opportunities"], 1.3)));
  const playOK = (row.team === "Free Agent" || depthN <= 0 || depthN === 100 || injFlag || oppRank === 100) ? 0 : 1;
  const depthF = Math.max(0.55, 1 - scaleTerm(0.08 * depthStep, "depth"));
  const jF = Math.max(0.75, Math.min(1.25, 0.9 + scaleTerm(0.3 * (rating - 75) / 25, "talent")));
  const matchF = Math.max(0.82, Math.min(1.18, 1 + scaleTerm((16.5 - oppRank) / 95, "matchup")));
  const olF = Math.max(0.9, Math.min(1.1, 1 + scaleTerm((16.5 - olRank) / 180, "oline")));
  const ypgF = Math.max(0.93, Math.min(1.07, 1 + (16.5 - ypgRank) / 220));
  const ppgF = Math.max(0.9, Math.min(1.1, 1 + scaleTerm((16.5 - ppgRank) / 180, "ppg")));
  const snapF = Math.max(0.45, Math.min(1.15, 1 + scaleTerm((snapPct / 70) - 1, "usage")));
  const targetsEff = scaleTerm(targetsEffBase, "usage") * (jF ** 0.25) * (ypgF ** 0.2);
  const rzEff = scaleTerm(rzEffBase, "redZone") * (ppgF ** 0.3);
  const carries = (15 * depthF * snapF * (jF ** scaleExp(0.35, "talent")) * (matchF ** scaleExp(0.38, "matchup")) * (ypgF ** 0.14)) ** 0.98;
  const ypc = 4.25 * (jF ** scaleExp(0.35, "talent")) * (matchF ** scaleExp(0.3, "matchup")) * (olF ** scaleExp(0.38, "oline")) * (ypgF ** 0.28);
  const rushYds = carries * ypc;
  const rec = (targetsEff * 0.72) ** 0.98;
  const recYds = rec * (7.3 * (jF ** scaleExp(0.2, "talent")) * (matchF ** scaleExp(0.22, "matchup")) * (ypgF ** 0.19));
  const tds = (rzEff * 0.17 * (jF ** scaleExp(1.2, "talent")) * (matchF ** scaleExp(0.88, "matchup")) * olF * (ppgF ** scaleExp(0.55, "ppg"))) ** 0.95;
  const extraF = weeklySkillExtraFactorMultiplier(row, "RB");
  const standardBase = Math.max(0, 0.1 * rushYds + 0.1 * recYds + 6 * tds);
  const standard = playOK * standardBase * extraF;
  const half = playOK * Math.max(0, standardBase + 0.5 * rec) * extraF;
  const full = playOK * Math.max(0, standardBase + rec) * extraF;
  return {
    mode,
    snapPct,
    targets: targetsEffBase,
    rz: rzEffBase,
    carries,
    rushYds,
    rec,
    recYds,
    tds,
    extraF,
    standard: Number(standard.toFixed(1)),
    half: Number(half.toFixed(1)),
    full: Number(full.toFixed(1)),
  };
}

function buildWeeklyRbRows(workbookRows, weekOverride = null) {
  const week = weekOverride || selectedSiteWeek() || 1;
  const teams = state.data?.teams || [];
  const players = state.players.filter((player) => groupPosition(player.position) === "RB" || player.position === "RB");
  const rankedTeamsByOl = teams.map((team) => ({ team, score: teamPositionScore(team, "OL") })).filter((row) => Number.isFinite(Number(row.score)));
  const rankedTeamsByVrb = teams.map((team) => ({ team, score: rbDefenseRatingForTeam(team) })).filter((row) => Number.isFinite(Number(row.score)));
  const statRankWeight = weeklySkillStatRankWeight();
  const rankedTeamYpg = teams.map((team) => ({ team, score: weightedStatRankScore(teamRankingsByTeam(team.team)?.offYardsRank, team.offenseAverage, statRankWeight) })).filter((row) => Number.isFinite(Number(row.score)));
  const rankedTeamPpg = teams.map((team) => ({ team, score: weightedStatRankScore(teamRankingsByTeam(team.team)?.offPointsRank, team.offenseRating, statRankWeight) })).filter((row) => Number.isFinite(Number(row.score)));
  const rows = players.filter((player) => player.team !== "Free Agent").map((player) => {
    const workbook = workbookRowByName(workbookRows, player.player) || {};
    const team = teamByName(player.team);
    const opponent = scheduleOpponent(player.team, week);
    const opponentTeam = teamByName(opponent);
    const stats = weeklyRbStatPack(player, workbook);
    const olRating = team ? teamPositionScore(team, "OL") : 84;
    const vrbRating = rbDefenseRatingForTeam(opponentTeam);
    const extras = {
      ...(workbook.extras || {}),
      "Opp vRB Rating": Number.isFinite(Number(vrbRating)) ? Number(Number(vrbRating).toFixed(1)) : "",
      "Opp vRB Rank": rankNumber(rankedTeamsByVrb, (item) => item.score, { team: opponentTeam, score: vrbRating }, false) || 16.5,
      "OL Rating": Number.isFinite(Number(olRating)) ? Number(Number(olRating).toFixed(1)) : "",
      "OL Rank": rankNumber(rankedTeamsByOl, (item) => item.score, { team, score: olRating }) || 16.5,
      "Team YPG Rank": rankNumber(rankedTeamYpg, (item) => item.score, { team, score: weightedStatRankScore(teamRankingsByTeam(player.team)?.offYardsRank, team?.offenseAverage, statRankWeight) }) || 16.5,
      "PPG Rank": rankNumber(rankedTeamPpg, (item) => item.score, { team, score: weightedStatRankScore(teamRankingsByTeam(player.team)?.offPointsRank, team?.offenseRating, statRankWeight) }) || 16.5,
      "Game Script": weeklyGameScriptValue(player.team, week),
      "Team Total": weeklyTeamImpliedTotal(player.team, opponent, week),
      "Rush TDs Allowed Rank": teamRankingsByTeam(opponent)?.rushTdAllowedRank || "",
      "Typical Snap %": Number(stats.season.snapPct.toFixed(1)),
      "Typical Targets": Number(stats.season.targets.toFixed(2)),
      "Typical Red Zone Opportunities": Number(stats.season.rz.toFixed(2)),
      "!!LAST 5!!\nTypical Snap %": Number(stats.last5.snapPct.toFixed(1)),
      "!!LAST 5!!\nTypical Targets": Number(stats.last5.targets.toFixed(2)),
      "!!LAST 5!!\nTypical Red Zone Opportunities": Number(stats.last5.rz.toFixed(2)),
      "Stat Source": stats.usedClay ? "Clay projection*" : "Depth/rating formula; RB Footballguys scan pending",
    };
    const row = {
      ...workbook,
      player: player.player,
      position: "RB",
      team: player.team,
      opponent,
      rating: num(player.rating, 68),
      depth: player.depth,
      injury: player.injury,
      _playerKey: sourceKey(player),
      extras,
    };
    const blend = weeklyRbScoreBreakdown(row, "blend");
    const season = weeklyRbScoreBreakdown(row, "season");
    const last5 = weeklyRbScoreBreakdown(row, "last5");
    row.score = blend.full;
    row.standardScore = blend.standard;
    row.halfPprScore = blend.half;
    row.fullPprScore = blend.full;
    row.seasonScore = season.full;
    row.last5Score = last5.full;
    row.value = row.score;
    row.extras["Std"] = blend.standard;
    row.extras["NoPPR"] = blend.standard;
    row.extras["Half PPR"] = blend.half;
    row.extras[".5PPR"] = blend.half;
    row.extras["Full PPR"] = blend.full;
    row.extras["FullPPR"] = blend.full;
    row.extras["Carries"] = Number(blend.carries.toFixed(1));
    row.extras["Rush Yds"] = Number(blend.rushYds.toFixed(1));
    row.extras["Receptions"] = Number(blend.rec.toFixed(1));
    row.extras["Rec Yds"] = Number(blend.recYds.toFixed(1));
    row.extras["TDs"] = Number(blend.tds.toFixed(2));
    return row;
  });
  rows.forEach((row) => {
    row.rank = rankNumber(rows, (item) => item.score, row);
    row.scoreRank = row.rank;
    row.seasonRank = rankNumber(rows, (item) => item.seasonScore, row);
    row.last5Rank = rankNumber(rows, (item) => item.last5Score, row);
    row.extras["Player Rating Rank"] = rankNumber(rows, (item) => item.rating, row);
    row.extras["Std Rank"] = rankNumber(rows, (item) => item.standardScore, row);
    row.extras["NoPPR Rank"] = row.extras["Std Rank"];
    row.extras["Half PPR Rank"] = rankNumber(rows, (item) => item.halfPprScore, row);
    row.extras[".5PPR Rank"] = row.extras["Half PPR Rank"];
    row.extras["Full PPR Rank"] = rankNumber(rows, (item) => item.fullPprScore, row);
    row.extras["FullPPR Rank"] = row.extras["Full PPR Rank"];
  });
  return rows;
}

function receiverBaseUsage(position, depth) {
  const d = Math.max(1, Math.min(4, num(depth, 3)));
  if (position === "TE") {
    return {
      targets: [6.4, 4.2, 2.4, 1.2][d - 1],
      snapPct: [80, 60, 35, 20][d - 1],
      rz: [0.9, 0.6, 0.35, 0.2][d - 1],
    };
  }
  return {
    targets: [8, 6.5, 5, 2.5][d - 1],
    snapPct: [90, 82, 68, 40][d - 1],
    rz: [1.2, 0.9, 0.6, 0.3][d - 1],
  };
}

function weeklyReceiverStatPack(player, position, workbook = {}) {
  const wb = (label) => fantasyDetailValue(workbook || {}, label);
  const base = receiverBaseUsage(position, player.depth);
  const clay = clayProjectionFor(player, position);
  const clayTargets = clayPerGame(clay, "targets", "");
  const clayTouchdowns = clay ? clayPerGame(clay, "rushTds", 0) + clayPerGame(clay, "recTds", 0) : "";
  const clayRz = Number.isFinite(Number(clayTouchdowns)) ? Math.max(base.rz, Math.min(2.1, Number(clayTouchdowns) * 1.25)) : "";
  const season = {
    targets: num(wb("Typical Targets"), Number.isFinite(Number(clayTargets)) ? clayTargets : base.targets),
    snapPct: num(wb("Typical Snap %"), base.snapPct),
    rz: num(wb("Typical Red Zone Opportunities"), Number.isFinite(Number(clayRz)) ? clayRz : base.rz),
  };
  const last5 = {
    targets: num(wb("!!LAST 5!!\nTypical Targets") || wb("!!Last 5!!\nTypical Targets"), season.targets),
    snapPct: num(wb("!!LAST 5!!\nTypical Snap %") || wb("!!Last 5!!\nTypical Snap %"), season.snapPct),
    rz: num(wb("!!LAST 5!!\nTypical Red Zone Opportunities") || wb("!!Last 5!!\nTypical Red Zone Opportunities"), season.rz),
  };
  return { season, last5, base, clay, usedClay: Boolean(clay && (!Number.isFinite(Number(wb("Typical Targets"))) || !Number.isFinite(Number(wb("Typical Red Zone Opportunities"))))) };
}

function weeklyWrScoreBreakdown(row, mode = "blend") {
  const weights = { ...defaultWeeklySkillWeights, ...state.weeklySkillWeights };
  const scaleExp = (exp, key) => exp * (num(weights[key], 100) / 100);
  const scaleTerm = (value, key) => value * (num(weights[key], 100) / 100);
  const depthN = Number.isFinite(Number(row.depth)) ? Number(row.depth) : 100;
  const dBkt = Math.max(1, Math.min(4, depthN || 3));
  const injFlag = /inj|ir|out/i.test(String(row.injury || ""));
  const oppWr = num(row.extras["Opp vWR Rank"], 16.5);
  const matchVal = num(row.extras["CB Matchup Rating"], num(row.extras["Opp vWR Rating"], 84));
  const wrRate = num(row.rating, 75);
  const ppgRank = num(row.extras["PPG Rank"], 16.5);
  const simPpg = num(row.extras["Team PPG"], 50);
  const qbRat = num(row.extras["QB Rating"], 75);
  const qbRank = num(row.extras["QB Rank"], 16.5);
  const cbDepthRate = num(row.extras["CB Matchup Rating"], matchVal);
  const passTDRank = num(row.extras["Pass TDs Allowed Rank"], 16.5);
  const wRec = weeklySkillLast5Blend(mode);
  const targets = ((1 - wRec) * weeklySkillProductionValue(row.extras["Typical Targets"], 8)) + (wRec * weeklySkillProductionValue(row.extras["!!LAST 5!!\nTypical Targets"], weeklySkillProductionValue(row.extras["Typical Targets"], 8)));
  const snapPct = ((1 - wRec) * weeklySkillProductionValue(row.extras["Typical Snap %"], 90)) + (wRec * weeklySkillProductionValue(row.extras["!!LAST 5!!\nTypical Snap %"], weeklySkillProductionValue(row.extras["Typical Snap %"], 90)));
  const rzBase = ((1 - wRec) * weeklySkillProductionValue(row.extras["Typical Red Zone Opportunities"], 1.2)) + (wRec * weeklySkillProductionValue(row.extras["!!LAST 5!!\nTypical Red Zone Opportunities"], weeklySkillProductionValue(row.extras["Typical Red Zone Opportunities"], 1.2)));
  const playOK = (row.team === "Free Agent" || depthN <= 0 || depthN === 100 || injFlag || oppWr === 100 || matchVal === 100) ? 0 : 1;
  const depthF = Math.max(0.45, 1 - scaleTerm(0.1 * (dBkt - 1), "depth"));
  const qbF = (Math.max(0.85, Math.min(1.15, 1 + scaleTerm((qbRat - 75) / 180, "qb"))) * Math.max(0.9, Math.min(1.1, 1 + scaleTerm((16.5 - qbRank) / 170, "qb")))) ** 0.5;
  const matchF = Math.max(0.72, Math.min(1.38, 1 + scaleTerm((50 - matchVal) / 70, "matchup")));
  const cbF = Math.max(0.9, Math.min(1.1, 1 + (50 - cbDepthRate) / 300));
  const mF = matchF * cbF;
  const ypgF = Math.max(0.93, Math.min(1.07, 1 + (16.5 - num(row.extras["Team YPG Rank"], 16.5)) / 220));
  const ppgF = Math.max(0.9, Math.min(1.1, 1 + scaleTerm((16.5 - ppgRank) / 180, "ppg")));
  const passTDF = Math.max(0.92, Math.min(1.07, 1 + (16.5 - passTDRank) / 200));
  const wrF = Math.max(0.78, Math.min(1.28, 0.9 + scaleTerm(0.38 * (wrRate - 75) / 25, "talent")));
  const usageF = Math.max(0.45, Math.min(1.2, 1 + scaleTerm((snapPct / 75) - 1, "usage")));
  const targetEff = scaleTerm(targets, "usage") * depthF * usageF * (mF ** scaleExp(0.72, "matchup")) * (qbF ** scaleExp(0.2, "qb")) * (wrF ** scaleExp(0.35, "talent")) * (ypgF ** 0.15);
  const rz = scaleTerm(rzBase, "redZone") * depthF * (mF ** scaleExp(0.82, "matchup")) * (ppgF ** 0.25);
  const rec = targetEff * 0.64;
  const recYds = rec * (11.7 * (mF ** scaleExp(0.55, "matchup")) * (wrF ** scaleExp(0.32, "talent")) * (qbF ** scaleExp(0.18, "qb")));
  const tds = (rz * 0.125 * (mF ** scaleExp(1.08, "matchup")) * (wrF ** scaleExp(0.55, "talent")) * qbF * ppgF * passTDF * ((snapPct / 75) ** scaleExp(0.12, "usage"))) ** 0.95;
  const extraF = weeklySkillExtraFactorMultiplier(row, "WR");
  const standard = playOK * Math.max(0, 0.1 * recYds + 6 * tds) * extraF;
  const half = playOK * Math.max(0, 0.1 * recYds + 6 * tds + 0.5 * rec) * extraF;
  const full = playOK * Math.max(0, 0.1 * recYds + 6 * tds + rec) * extraF;
  return { mode, targets: targetEff, snapPct, rz, rec, recYds, tds, standard: Number(Math.max(0, standard).toFixed(1)), half: Number(Math.max(0, half).toFixed(1)), full: Number(Math.max(0, full).toFixed(1)) };
}

function weeklyTeScoreBreakdown(row, mode = "blend") {
  const weights = { ...defaultWeeklySkillWeights, ...state.weeklySkillWeights };
  const scaleExp = (exp, key) => exp * (num(weights[key], 100) / 100);
  const scaleTerm = (value, key) => value * (num(weights[key], 100) / 100);
  const depthN = Number.isFinite(Number(row.depth)) ? Number(row.depth) : 100;
  const dBkt = Math.max(1, Math.min(4, depthN || 3));
  const injFlag = /inj|ir|out/i.test(String(row.injury || ""));
  const qbRat = num(row.extras["QB Rating"], 75);
  const qbRank = num(row.extras["QB Rank"], 16.5);
  const oppTE = num(row.extras["Opp vTE Rank"], 16.5);
  const matchVal = num(row.extras["Opp vTE Rating"], 84);
  const pRating = num(row.rating, 75);
  const olRank = num(row.extras["OL Rank"], 16.5);
  const ppgRank = num(row.extras["PPG Rank"], 16.5);
  const wRec = weeklySkillLast5Blend(mode);
  const targets = ((1 - wRec) * weeklySkillProductionValue(row.extras["Typical Targets"], receiverBaseUsage("TE", dBkt).targets)) + (wRec * weeklySkillProductionValue(row.extras["!!LAST 5!!\nTypical Targets"], weeklySkillProductionValue(row.extras["Typical Targets"], receiverBaseUsage("TE", dBkt).targets)));
  const snapPct = ((1 - wRec) * weeklySkillProductionValue(row.extras["Typical Snap %"], receiverBaseUsage("TE", dBkt).snapPct)) + (wRec * weeklySkillProductionValue(row.extras["!!LAST 5!!\nTypical Snap %"], weeklySkillProductionValue(row.extras["Typical Snap %"], receiverBaseUsage("TE", dBkt).snapPct)));
  const rzBase = ((1 - wRec) * weeklySkillProductionValue(row.extras["Typical Red Zone Opportunities"], receiverBaseUsage("TE", dBkt).rz)) + (wRec * weeklySkillProductionValue(row.extras["!!LAST 5!!\nTypical Red Zone Opportunities"], weeklySkillProductionValue(row.extras["Typical Red Zone Opportunities"], receiverBaseUsage("TE", dBkt).rz)));
  const playOK = row.team === "Free Agent" || depthN <= 0 || depthN === 100 || injFlag ? 0 : 1;
  const depthF = Math.max(0.5, 1 - scaleTerm(0.12 * (dBkt - 1), "depth"));
  const qbF = (Math.max(0.85, Math.min(1.15, 1 + scaleTerm((qbRat - 75) / 190, "qb"))) * Math.max(0.9, Math.min(1.1, 1 + scaleTerm((16.5 - qbRank) / 180, "qb")))) ** 0.5;
  const posF = (Math.max(0.86, Math.min(1.14, 1 + scaleTerm((16.5 - oppTE) / 140, "matchup"))) * Math.max(0.88, Math.min(1.12, 1 + scaleTerm((84 - matchVal) / 260, "matchup")))) ** 0.5;
  const olF = Math.max(0.9, Math.min(1.1, 1 + scaleTerm((16.5 - olRank) / 180, "oline")));
  const ppgF = Math.max(0.9, Math.min(1.1, 1 + scaleTerm((16.5 - ppgRank) / 180, "ppg")));
  const usageF = Math.max(0.45, Math.min(1.18, 1 + scaleTerm((snapPct / 70) - 1, "usage")));
  const targetEff = scaleTerm(targets, "usage") * depthF * usageF * (qbF ** scaleExp(0.2, "qb")) * (ppgF ** 0.15);
  const rz = scaleTerm(rzBase, "redZone") * depthF * (ppgF ** 0.25);
  const rec = targetEff * 0.67;
  const recYds = rec * (10.4 * (qbF ** scaleExp(0.2, "qb")) * (posF ** scaleExp(0.32, "matchup")) * (olF ** scaleExp(0.12, "oline")) * Math.max(0.92, Math.min(1.08, 1 + scaleTerm((pRating - 75) / 350, "talent"))));
  const tds = (rz * 0.12 * qbF * posF * ppgF * ((snapPct / 75) ** scaleExp(0.12, "usage"))) ** 0.95;
  const extraF = weeklySkillExtraFactorMultiplier(row, "TE");
  const standardBase = Math.max(0, 0.1 * recYds + 6 * tds);
  const standard = playOK * standardBase * extraF;
  const half = playOK * Math.max(0, standardBase + 0.5 * rec) * extraF;
  const full = playOK * Math.max(0, standardBase + rec) * extraF;
  return { mode, targets: targetEff, snapPct, rz, rec, recYds, tds, standard: Number(standard.toFixed(1)), half: Number(half.toFixed(1)), full: Number(full.toFixed(1)) };
}

function buildWeeklyReceiverRows(position, workbookRows, weekOverride = null) {
  const week = weekOverride || selectedSiteWeek() || 1;
  const teams = state.data?.teams || [];
  const players = state.players.filter((player) => groupPosition(player.position) === position || player.position === position);
  const rankedTeamsByVwr = teams.map((team) => ({ team, score: wrDefenseRatingForTeam(team) })).filter((row) => Number.isFinite(Number(row.score)));
  const rankedTeamsByVte = teams.map((team) => ({ team, score: teDefenseRatingForTeam(team) })).filter((row) => Number.isFinite(Number(row.score)));
  const rankedTeamsByQb = teams.map((team) => ({ team, score: teamPositionScore(team, "QB") })).filter((row) => Number.isFinite(Number(row.score)));
  const rankedTeamsByOl = teams.map((team) => ({ team, score: teamPositionScore(team, "OL") })).filter((row) => Number.isFinite(Number(row.score)));
  const statRankWeight = weeklySkillStatRankWeight();
  const rankedTeamYpg = teams.map((team) => ({ team, score: weightedStatRankScore(teamRankingsByTeam(team.team)?.offYardsRank, team.offenseAverage, statRankWeight) })).filter((row) => Number.isFinite(Number(row.score)));
  const rankedTeamPpg = teams.map((team) => ({ team, score: weightedStatRankScore(teamRankingsByTeam(team.team)?.offPointsRank, team.offenseRating, statRankWeight) })).filter((row) => Number.isFinite(Number(row.score)));
  const rankedPassTdAllowed = teams.map((team) => ({ team, score: teamRankingsByTeam(team.team)?.passTdAllowedRank })).filter((row) => Number.isFinite(Number(row.score)));
  const rows = players.filter((player) => player.team !== "Free Agent").map((player) => {
    const workbook = workbookRowByName(workbookRows, player.player) || {};
    const team = teamByName(player.team);
    const opponent = scheduleOpponent(player.team, week);
    const opponentTeam = teamByName(opponent);
    const stats = weeklyReceiverStatPack(player, position, workbook);
    const qbRating = teamPositionScore(team, "QB");
    const olRating = teamPositionScore(team, "OL");
    const matchupRating = position === "WR" ? wrDefenseRatingForTeam(opponentTeam) : teDefenseRatingForTeam(opponentTeam);
    const matchupRows = position === "WR" ? rankedTeamsByVwr : rankedTeamsByVte;
    const matchupRankLabel = position === "WR" ? "Opp vWR Rank" : "Opp vTE Rank";
    const matchupRatingLabel = position === "WR" ? "Opp vWR Rating" : "Opp vTE Rating";
    const extras = {
      ...(workbook.extras || {}),
      [matchupRatingLabel]: Number.isFinite(Number(matchupRating)) ? Number(Number(matchupRating).toFixed(1)) : "",
      [matchupRankLabel]: rankNumber(matchupRows, (item) => item.score, { team: opponentTeam, score: matchupRating }, false) || 16.5,
      "CB Matchup Rating": position === "WR" ? Number(num(receiverMatchupRating(player, opponentTeam), matchupRating).toFixed(1)) : "",
      "QB Rating": Number.isFinite(Number(qbRating)) ? Number(Number(qbRating).toFixed(1)) : "",
      "QB Rank": rankNumber(rankedTeamsByQb, (item) => item.score, { team, score: qbRating }) || 16.5,
      "OL Rating": Number.isFinite(Number(olRating)) ? Number(Number(olRating).toFixed(1)) : "",
      "OL Rank": rankNumber(rankedTeamsByOl, (item) => item.score, { team, score: olRating }) || 16.5,
      "Team YPG Rank": rankNumber(rankedTeamYpg, (item) => item.score, { team, score: weightedStatRankScore(teamRankingsByTeam(player.team)?.offYardsRank, team?.offenseAverage, statRankWeight) }) || 16.5,
      "PPG Rank": rankNumber(rankedTeamPpg, (item) => item.score, { team, score: weightedStatRankScore(teamRankingsByTeam(player.team)?.offPointsRank, team?.offenseRating, statRankWeight) }) || 16.5,
      "Pass TDs Allowed Rank": rankNumber(rankedPassTdAllowed, (item) => item.score, { team: opponentTeam, score: teamRankingsByTeam(opponent)?.passTdAllowedRank }, true) || 16.5,
      "Game Script": weeklyGameScriptValue(player.team, week),
      "Team Total": weeklyTeamImpliedTotal(player.team, opponent, week),
      "Team PPG": Number(num(team?.offenseRating, 84).toFixed(1)),
      "Typical Snap %": Number(stats.season.snapPct.toFixed(1)),
      "Typical Targets": Number(stats.season.targets.toFixed(2)),
      "Typical Red Zone Opportunities": Number(stats.season.rz.toFixed(2)),
      "!!LAST 5!!\nTypical Snap %": Number(stats.last5.snapPct.toFixed(1)),
      "!!LAST 5!!\nTypical Targets": Number(stats.last5.targets.toFixed(2)),
      "!!LAST 5!!\nTypical Red Zone Opportunities": Number(stats.last5.rz.toFixed(2)),
      "Stat Source": stats.usedClay ? "Clay projection*" : "Depth/rating formula; Footballguys usage scan pending",
    };
    const row = {
      ...workbook,
      player: player.player,
      position,
      team: player.team,
      opponent,
      rating: num(player.rating, 68),
      depth: player.depth,
      injury: player.injury,
      _playerKey: sourceKey(player),
      extras,
    };
    const scorer = position === "WR" ? weeklyWrScoreBreakdown : weeklyTeScoreBreakdown;
    const blend = scorer(row, "blend");
    const season = scorer(row, "season");
    const last5 = scorer(row, "last5");
    row.score = blend.full;
    row.standardScore = blend.standard;
    row.halfPprScore = blend.half;
    row.fullPprScore = blend.full;
    row.seasonScore = season.full;
    row.last5Score = last5.full;
    row.value = row.score;
    row.extras["Std"] = blend.standard;
    row.extras["NoPPR"] = blend.standard;
    row.extras["Half PPR"] = blend.half;
    row.extras[".5PPR"] = blend.half;
    row.extras["Full PPR"] = blend.full;
    row.extras["FullPPR"] = blend.full;
    row.extras["Targets"] = Number(blend.targets.toFixed(1));
    row.extras["Snap %"] = Number(blend.snapPct.toFixed(1));
    row.extras["RZone"] = Number(blend.rz.toFixed(2));
    row.extras["Receptions"] = Number(blend.rec.toFixed(1));
    row.extras["Rec Yds"] = Number(blend.recYds.toFixed(1));
    row.extras["TDs"] = Number(blend.tds.toFixed(2));
    return row;
  });
  rows.forEach((row) => {
    row.rank = rankNumber(rows, (item) => item.score, row);
    row.scoreRank = row.rank;
    row.seasonRank = rankNumber(rows, (item) => item.seasonScore, row);
    row.last5Rank = rankNumber(rows, (item) => item.last5Score, row);
    row.extras["Player Rating Rank"] = rankNumber(rows, (item) => item.rating, row);
    row.extras["Std Rank"] = rankNumber(rows, (item) => item.standardScore, row);
    row.extras["NoPPR Rank"] = row.extras["Std Rank"];
    row.extras["Half PPR Rank"] = rankNumber(rows, (item) => item.halfPprScore, row);
    row.extras[".5PPR Rank"] = row.extras["Half PPR Rank"];
    row.extras["Full PPR Rank"] = rankNumber(rows, (item) => item.fullPprScore, row);
    row.extras["FullPPR Rank"] = row.extras["Full PPR Rank"];
  });
  return rows;
}

function buildWeeklySkillRows(position, workbookRows, weekOverride = null) {
  if (position === "RB") return buildWeeklyRbRows(workbookRows, weekOverride);
  if (position === "WR" || position === "TE") return buildWeeklyReceiverRows(position, workbookRows, weekOverride);
  const week = weekOverride || selectedSiteWeek() || 1;
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
    row.seasonRank = rankNumber(rows, (item) => item.seasonScore, row);
    row.last5Rank = rankNumber(rows, (item) => item.last5Score, row);
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

function buildWeeklyDefenseRows(workbookRows, weekOverride = null) {
  const week = weekOverride || selectedSiteWeek() || 1;
  const teamRows = state.data?.teams || [];
  const rankedDefense = teamRows.map((team) => ({ team, score: team.defenseAverage })).filter((row) => Number.isFinite(Number(row.score)));
  const rankedOppOff = teamRows.map((team) => ({ team, score: team.offenseAverage })).filter((row) => Number.isFinite(Number(row.score)));
  const rankedOppQb = teamRows.map((team) => ({ team, score: teamPositionScore(team, "QB") })).filter((row) => Number.isFinite(Number(row.score)));
  const rows = (state.data?.teams || []).map((team) => {
    const workbook = workbookRows.find((row) => normalizeTeamName(row.team || row.player) === normalizeTeamName(team.team)) || {};
    const opponent = scheduleOpponent(team.team, week);
    const opponentTeam = teamByName(opponent);
    const ranks = teamRankingsByTeam(team.team);
    const opponentRanks = teamRankingsByTeam(opponent);
    const rushPressure = averageFinite([teamPositionScore(team, "EDGE Def"), teamPositionScore(team, "IDL")], team.defenseAverage);
    const sacksRank = num(ranks?.sacksRank, 16.5);
    const takeawaysRank = num(ranks?.takeawaysRank, 16.5);
    const oppOffRating = num(opponentTeam?.offenseAverage, 84);
    const oppQbRating = num(teamPositionScore(opponentTeam, "QB"), 84);
    const oppPpgRank = num(opponentRanks?.offPointsRank, 16.5);
    const score = 6
      + ((num(team.defenseAverage, 84) - 84) * 0.16)
      + ((num(rushPressure, 84) - 84) * 0.08)
      + ((84 - oppOffRating) * 0.12)
      + ((84 - oppQbRating) * 0.08)
      + ((16.5 - sacksRank) * 0.08)
      + ((16.5 - takeawaysRank) * 0.08)
      + ((oppPpgRank - 16.5) * 0.05);
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
        "Defense Rank": rankNumber(rankedDefense, (item) => item.score, { team, score: team.defenseAverage }) || "",
        "Opponent Off Rating": Number(oppOffRating.toFixed(1)),
        "Opponent Off Rank": rankNumber(rankedOppOff, (item) => item.score, { team: opponentTeam, score: oppOffRating }) || "",
        "Opp QB Rating": Number(oppQbRating.toFixed(1)),
        "Opp QB Rank": rankNumber(rankedOppQb, (item) => item.score, { team: opponentTeam, score: oppQbRating }) || "",
        "Sacks Rank": Number.isFinite(Number(ranks?.sacksRank)) ? ranks.sacksRank : "",
        "Takeaways Rank": Number.isFinite(Number(ranks?.takeawaysRank)) ? ranks.takeawaysRank : "",
        "Opp PPG Rank": Number.isFinite(Number(opponentRanks?.offPointsRank)) ? opponentRanks.offPointsRank : "",
        "Stat Source": ranks?.sacksRank || ranks?.takeawaysRank ? "TeamRankings + ratings" : "Ratings fallback",
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
    row.seasonRank = rankNumber(rows, (item) => item.seasonScore, row);
    row.last5Rank = rankNumber(rows, (item) => item.last5Score, row);
  });
  return rows;
}

function buildWeeklyKickerRows(workbookRows, weekOverride = null) {
  const week = weekOverride || selectedSiteWeek() || 1;
  const teams = state.data?.teams || [];
  const rankedOffense = teams.map((team) => ({ team, score: team.offenseAverage })).filter((row) => Number.isFinite(Number(row.score)));
  const rows = (state.data?.teams || []).map((team) => {
    const madden = maddenKickerForTeam(team.team);
    const workbook = workbookRows.find((row) => normalizeTeamName(row.team) === normalizeTeamName(team.team)) || {};
    const opponent = scheduleOpponent(team.team, week);
    const tier = kickerStadiumTiers[team.team] ?? 0;
    const rating = Number.isFinite(Number(madden?.ovr)) ? Number(madden.ovr) : num(workbook.rating, 68);
    const goForItPenalty = num(fantasyDetailValue(workbook, "Go For It Penalty"), 2);
    const longFg = num(fantasyDetailValue(workbook, "50+ FGs"), Math.max(0, (rating - 70) / 6));
    const fgVolume = Math.max(1, 4 + ((num(team.offenseAverage, 84) - 84) / 10));
    const score = (rating / 10) + goForItPenalty + (longFg / 4) + (fgVolume * 1.5) + (tier * 2);
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
        "Team Offense Rank": rankNumber(rankedOffense, (item) => item.score, { team, score: team.offenseAverage }) || "",
        "Go For It Penalty": Number(goForItPenalty.toFixed(1)),
        "50+ FGs": Number(longFg.toFixed(1)),
        "FG Volume": Number(fgVolume.toFixed(1)),
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

function weeklyFantasyPlayerPool(position, workbookRows, weekOverride = null) {
  if (position === "QB") return buildWeeklyQbRows(workbookRows, weekOverride);
  if (["RB", "WR", "TE"].includes(position)) return buildWeeklySkillRows(position, workbookRows, weekOverride);
  if (position === "Defense") return buildWeeklyDefenseRows(workbookRows, weekOverride);
  if (position === "Kicker") return buildWeeklyKickerRows(workbookRows, weekOverride);
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

function fantasyAdpTeamMatches(adpRow, teamName) {
  if (!teamName) return true;
  const wanted = teamAbbrevFor(teamName, teamName);
  return normalizeTeamName(adpRow.team) === normalizeTeamName(wanted)
    || normalizeTeamName(adpRow.team) === normalizeTeamName(teamName);
}

function fantasyProsAdpRows(scoringKey) {
  return window.FANTASYPROS_ADP?.players?.[scoringKey] || [];
}

function fantasyProsAdpFor(row, scoringKey) {
  const rows = fantasyProsAdpRows(scoringKey);
  const playerKey = fantasyMergeKey(row.player || row.team);
  const position = row.position === "Kicker" ? "K" : row.position;
  if (row.position === "Defense") {
    const abbrev = teamAbbrevFor(row.team, row.team);
    return rows.find((item) => item.position === "Defense" && (normalizeTeamName(item.team) === normalizeTeamName(abbrev) || fantasyMergeKey(item.player) === fantasyMergeKey(row.team)))
      || rows.find((item) => item.position === "Defense" && normalizeTeamName(item.team) === normalizeTeamName(row.team))
      || null;
  }
  return rows.find((item) => fantasyMergeKey(item.player) === playerKey && fantasyAdpTeamMatches(item, row.team))
    || rows.find((item) => fantasyMergeKey(item.player) === playerKey && (!position || String(item.position || "").toUpperCase() === String(position || "").toUpperCase()))
    || rows.find((item) => fantasyMergeKey(item.player) === playerKey)
    || null;
}

function seasonDifficultyRankFor(row, position) {
  const label = position === "QB"
    ? "Matchup Rating (Low is good)"
    : position === "RB"
      ? "Opp vRB Rank"
      : position === "WR"
        ? "Opp vWR Rank"
        : position === "TE"
          ? "Opp vTE Rank"
          : position === "Defense"
            ? "Opponent Off Rank"
            : "Team Offense Rank";
  return num(fantasyDetailValue(row, label), 16.5);
}

function seasonProductionValueFor(row, position) {
  if (!row) return "";
  if (position === "QB") return averageFinite([
    fantasyDetailValue(row, "Typical Pass Yards"),
    fantasyDetailValue(row, "Typical Pass TDs"),
    fantasyDetailValue(row, "Typical Rush Attempts"),
    fantasyDetailValue(row, "Typical Rush TDs"),
  ], "");
  if (["RB", "WR", "TE"].includes(position)) return averageFinite([
    fantasyDetailValue(row, "Typical Snap %"),
    fantasyDetailValue(row, "Typical Targets"),
    fantasyDetailValue(row, "Typical Red Zone Opportunities"),
  ], "");
  if (position === "Defense") return averageFinite([
    fantasyDetailValue(row, "Pass Rush"),
    fantasyDetailValue(row, "Sacks Rank"),
    fantasyDetailValue(row, "Takeaways Rank"),
  ], "");
  return averageFinite([
    fantasyDetailValue(row, "50+ FGs"),
    fantasyDetailValue(row, "FG Volume"),
  ], "");
}

function seasonBonusValueFor(row, position) {
  if (!row) return "";
  if (position === "QB") return fantasyDetailValue(row, "Total Bonuses\n=sum(AC2,AI2,AO2,AU2)");
  if (["RB", "WR", "TE"].includes(position)) return averageFinite([
    fantasyDetailValue(row, "Receptions"),
    fantasyDetailValue(row, "Rec Yds"),
    fantasyDetailValue(row, "TDs"),
  ], "");
  if (position === "Defense") return averageFinite([
    fantasyDetailValue(row, "Sacks Rank"),
    fantasyDetailValue(row, "Takeaways Rank"),
  ], "");
  return fantasyDetailValue(row, "Kicker Stadium Tier");
}

function seasonTeamContextValueFor(row, position) {
  if (!row) return "";
  if (position === "QB") return averageFinite([
    fantasyDetailValue(row, "OL Rank"),
    fantasyDetailValue(row, "PPG Rank"),
    fantasyDetailValue(row, "WR Group Rank"),
  ], "");
  if (position === "RB") return averageFinite([
    fantasyDetailValue(row, "OL Rank"),
    fantasyDetailValue(row, "PPG Rank"),
    fantasyDetailValue(row, "Team YPG Rank"),
  ], "");
  if (["WR", "TE"].includes(position)) return averageFinite([
    fantasyDetailValue(row, "QB Rank"),
    fantasyDetailValue(row, "PPG Rank"),
    fantasyDetailValue(row, "Team YPG Rank"),
  ], "");
  if (position === "Defense") return averageFinite([
    fantasyDetailValue(row, "Defense Rank"),
    fantasyDetailValue(row, "Opp PPG Rank"),
  ], "");
  return fantasyDetailValue(row, "Team Offense Rank");
}

function fantasyFavoriteKey(row) {
  return [row.position || "", fantasyMergeKey(row.player || row.team), normalizeTeamName(row.team || row.player || "")].join("|");
}

function fantasyStarCell(row) {
  const key = fantasyFavoriteKey(row);
  const active = state.fantasyFavorites.includes(key);
  return `<button class="fantasy-star ${active ? "active" : ""}" data-fantasy-favorite="${esc(key)}" title="${active ? "Remove fantasy favorite" : "Mark fantasy favorite"}">${active ? "★" : "☆"}</button>`;
}

function purpleScaleStyle(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || !Number.isFinite(Number(min)) || !Number.isFinite(Number(max)) || Number(max) === Number(min)) {
    return "";
  }
  const pct = Math.max(0, Math.min(1, (numeric - Number(min)) / (Number(max) - Number(min))));
  const saturation = 26 + pct * 48;
  const lightness = 98 - pct * 30;
  return `style="background:hsl(270 ${saturation}% ${lightness}%);color:${pct > 0.72 ? "#fff" : "#071532"}"`;
}

function seasonScheduleChip(row, week, allRows = []) {
  const opp = fantasyDetailValue(row, `W${week} Opp`);
  const score = fantasyDetailValue(row, `W${week} Score`);
  const vpos = fantasyDetailValue(row, `W${week} vPOS`);
  if (!opp && !Number.isFinite(Number(score))) return "";
  const vposStyle = Number.isFinite(Number(vpos)) ? cfStyle(vpos, 1, 32, true) : "";
  const team = teamByName(opp);
  const detail = [
    row.player || row.team || "",
    `Week ${week}`,
    opp ? `vs ${teamAbbrevFor(opp, opp)}` : "",
    Number.isFinite(Number(vpos)) ? `vPOS ${fantasyDisplay(vpos, 1)}` : "",
    Number.isFinite(Number(score)) ? `Score ${fantasyDisplay(score, 1)}` : "",
  ].filter(Boolean).join(" | ");
  return `<button class="season-week-chip" data-fantasy-schedule-detail="${esc(fantasyCompareKey(row))}" data-week="${week}" ${vposStyle} title="${esc(detail)}"><span class="season-week-number">W${week}</span><b>${teamLogo(team?.team || opp, team?.teamAbbrev || opp)}<span>${esc(teamAbbrevFor(opp, opp) || `W${week}`)}</span></b><em>${esc(fantasyDisplay(score, 1))}</em></button>`;
}

function seasonFantasyAdpRow(position, playerName, teamName, seasonRows = []) {
  const key = fantasyMergeKey(playerName || teamName);
  return seasonRows.find((row) => fantasyMergeKey(row.player || row.team) === key)
    || seasonRows.find((row) => normalizeTeamName(row.team) === normalizeTeamName(teamName))
    || {};
}

function buildSeasonFantasyRows(position, seasonRows = []) {
  const weeklyRows = fantasyRankItem("weekly", position)?.rows || [];
  const weeks = Array.from({ length: 17 }, (_, index) => index + 1);
  const byKey = new Map();
  weeks.forEach((week) => {
    weeklyFantasyPlayerPool(position, weeklyRows, week).forEach((row) => {
      if (!row.opponent) return;
      const key = fantasyCompareKey(row);
      const current = byKey.get(key) || {
        ...row,
        opponent: "",
        score: 0,
        seasonScore: 0,
        last5Score: 0,
        standardScore: 0,
        halfPprScore: 0,
        fullPprScore: 0,
        value: 0,
        weeksPlayed: 0,
        difficultyRanks: [],
        playoffDifficultyRanks: [],
        easyWeeks: 0,
        hardWeeks: 0,
        productionValues: [],
        bonusValues: [],
        contextValues: [],
        extras: { ...(row.extras || {}) },
      };
      const score = num(row.score, 0);
      current.score += score;
      current.seasonScore += num(row.seasonScore, score);
      current.last5Score += num(row.last5Score, score);
      current.standardScore += num(row.standardScore, score);
      current.halfPprScore += num(row.halfPprScore, score);
      current.fullPprScore += num(row.fullPprScore, score);
      current.weeksPlayed += 1;
      const difficulty = seasonDifficultyRankFor(row, position);
      const productionValue = seasonProductionValueFor(row, position);
      const bonusValue = seasonBonusValueFor(row, position);
      const contextValue = seasonTeamContextValueFor(row, position);
      if (Number.isFinite(Number(difficulty))) {
        current.difficultyRanks.push(Number(difficulty));
        if (week >= 15) current.playoffDifficultyRanks.push(Number(difficulty));
        if (Number(difficulty) <= 10) current.easyWeeks += 1;
        if (Number(difficulty) >= 23) current.hardWeeks += 1;
      }
      if (Number.isFinite(Number(productionValue))) current.productionValues.push(Number(productionValue));
      if (Number.isFinite(Number(bonusValue))) current.bonusValues.push(Number(bonusValue));
      if (Number.isFinite(Number(contextValue))) current.contextValues.push(Number(contextValue));
      current.extras[`W${week}`] = row.opponent ? `${teamAbbrevFor(row.opponent)} ${fantasyDisplay(score, 1)}` : "";
      current.extras[`W${week} Opp`] = row.opponent ? teamAbbrevFor(row.opponent, row.opponent) : "";
      current.extras[`W${week} Score`] = Number.isFinite(Number(score)) ? Number(Number(score).toFixed(1)) : "";
      current.extras[`W${week} vPOS`] = Number.isFinite(Number(difficulty)) ? Number(Number(difficulty).toFixed(1)) : "";
      byKey.set(key, current);
    });
  });
  const rows = [...byKey.values()].map((row) => {
    const adpRow = seasonFantasyAdpRow(position, row.player, row.team, seasonRows);
    const fullAdp = fantasyProsAdpFor(row, "full");
    const halfAdp = fantasyProsAdpFor(row, "half");
    const standardAdp = fantasyProsAdpFor(row, "standard");
    const fallbackAdp = Number.isFinite(Number(adpRow.adp)) ? Number(adpRow.adp) : "";
    const adp = Number.isFinite(Number(halfAdp?.adp)) ? Number(halfAdp.adp) : fallbackAdp;
    const rounded = (value) => Number(num(value, 0).toFixed(1));
    row.score = rounded(row.score);
    row.seasonScore = rounded(row.seasonScore);
    row.last5Score = rounded(row.last5Score);
    row.standardScore = rounded(row.standardScore);
    row.halfPprScore = rounded(row.halfPprScore);
    row.fullPprScore = rounded(row.fullPprScore);
    row.adp = adp;
    row.avgScore = row.weeksPlayed ? Number((row.score / row.weeksPlayed).toFixed(1)) : "";
    row.standardAvg = row.weeksPlayed ? Number((row.standardScore / row.weeksPlayed).toFixed(1)) : "";
    row.halfPprAvg = row.weeksPlayed ? Number((row.halfPprScore / row.weeksPlayed).toFixed(1)) : "";
    row.fullPprAvg = row.weeksPlayed ? Number((row.fullPprScore / row.weeksPlayed).toFixed(1)) : "";
    const seasonDifficulty = averageFinite(row.difficultyRanks, "");
    const playoffDifficulty = averageFinite(row.playoffDifficultyRanks, "");
    const avgProduction = averageFinite(row.productionValues, "");
    const avgBonuses = averageFinite(row.bonusValues, "");
    const avgContext = averageFinite(row.contextValues, "");
    row.extras = {
      ...(adpRow.extras || {}),
      ...(row.extras || {}),
      "Weeks Counted": row.weeksPlayed,
      "Season Difficulty": Number.isFinite(Number(seasonDifficulty)) ? Number(Number(seasonDifficulty).toFixed(1)) : "",
      "Easy Weeks": row.easyWeeks,
      "Hard Weeks": row.hardWeeks,
      "Playoff Diff": Number.isFinite(Number(playoffDifficulty)) ? Number(Number(playoffDifficulty).toFixed(1)) : "",
      "Avg Production": Number.isFinite(Number(avgProduction)) ? Number(Number(avgProduction).toFixed(1)) : "",
      "Avg Bonuses": Number.isFinite(Number(avgBonuses)) ? Number(Number(avgBonuses).toFixed(1)) : "",
      "Avg Team Context": Number.isFinite(Number(avgContext)) ? Number(Number(avgContext).toFixed(1)) : "",
      "FullPPR Total": row.fullPprScore,
      "FullPPR Avg": row.fullPprAvg,
      "FullPPR ADP": Number.isFinite(Number(fullAdp?.adp)) ? Number(fullAdp.adp) : "",
      "FullPPR ADP Rank": Number.isFinite(Number(fullAdp?.rank)) ? Number(fullAdp.rank) : "",
      ".5PPR Total": row.halfPprScore,
      ".5PPR Avg": row.halfPprAvg,
      ".5PPR ADP": Number.isFinite(Number(halfAdp?.adp)) ? Number(halfAdp.adp) : adp,
      ".5PPR ADP Rank": Number.isFinite(Number(halfAdp?.rank)) ? Number(halfAdp.rank) : "",
      "NoPPR Total": row.standardScore,
      "NoPPR Avg": row.standardAvg,
      "NoPPR ADP": Number.isFinite(Number(standardAdp?.adp)) ? Number(standardAdp.adp) : "",
      "NoPPR ADP Rank": Number.isFinite(Number(standardAdp?.rank)) ? Number(standardAdp.rank) : "",
      "ADP": adp,
      "ADP Source": fullAdp || halfAdp || standardAdp ? "FantasyPros real-time ADP" : (adp === "" ? "" : "Workbook fallback"),
      "Source": "Sum of weekly projections",
    };
    return row;
  });
  rows.forEach((row) => {
    row.rank = rankNumber(rows, (item) => item.score, row);
    row.scoreRank = row.rank;
    row.extras["FullPPR Rank"] = rankNumber(rows, (item) => item.fullPprScore, row);
    row.extras[".5PPR Rank"] = rankNumber(rows, (item) => item.halfPprScore, row);
    row.extras["NoPPR Rank"] = rankNumber(rows, (item) => item.standardScore, row);
    row.extras["FullPPR Value"] = Number.isFinite(Number(row.extras["FullPPR ADP Rank"])) ? Number((row.extras["FullPPR ADP Rank"] - row.extras["FullPPR Rank"]).toFixed(1)) : "";
    row.extras[".5PPR Value"] = Number.isFinite(Number(row.extras[".5PPR ADP Rank"])) ? Number((row.extras[".5PPR ADP Rank"] - row.extras[".5PPR Rank"]).toFixed(1)) : "";
    row.extras["NoPPR Value"] = Number.isFinite(Number(row.extras["NoPPR ADP Rank"])) ? Number((row.extras["NoPPR ADP Rank"] - row.extras["NoPPR Rank"]).toFixed(1)) : "";
    row.extras["ADP Value"] = Number.isFinite(Number(row.extras[".5PPR Value"])) ? row.extras[".5PPR Value"] : "";
    row.value = Number.isFinite(Number(row.extras[".5PPR Value"])) ? row.extras[".5PPR Value"] : row.score;
  });
  return rows;
}

function fantasyBoardRows(kind, position, workbookRows) {
  return kind === "weekly" ? weeklyFantasyPlayerPool(position, workbookRows) : buildSeasonFantasyRows(position, workbookRows);
}

function fantasySortValue(row, key) {
  if (key === "name") return String(row.player || row.team || "");
  if (key === "team") return String(row.team || "");
  if (key === "opponent") return String(row.opponent || "");
  if (key === "fantasyStar") return state.fantasyFavorites.includes(fantasyFavoriteKey(row)) ? 1 : 0;
  if (String(key || "").startsWith("extra:")) return fantasyDetailValue(row, String(key).slice(6));
  if (key === "rank") return num(row.rank, 9999);
  if (key === "scoreRank") return num(row.scoreRank, 9999);
  if (key === "seasonRank") return num(row.seasonRank, 9999);
  if (key === "last5Rank") return num(row.last5Rank, 9999);
  if (key === "adp") return num(row.adp, 9999);
  if (key === "value") return num(row.value, -9999);
  if (key === "rating") return num(row.rating, -9999);
  if (key === "depth") return num(row.depth, 9999);
  if (key === "seasonScore") return num(row.seasonScore, -9999);
  if (key === "last5Score") return num(row.last5Score, -9999);
  if (key === "fullPprScore") return num(row.fullPprScore, -9999);
  if (key === "halfPprScore") return num(row.halfPprScore, -9999);
  if (key === "standardScore") return num(row.standardScore, -9999);
  if (key === "avgScore") return num(row.avgScore, -9999);
  if (key === "fullPprAvg") return num(row.fullPprAvg, -9999);
  if (key === "halfPprAvg") return num(row.halfPprAvg, -9999);
  if (key === "standardAvg") return num(row.standardAvg, -9999);
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

function fantasyCell(value, values, reverse = false, digits = 1, marker = "") {
  const numeric = values.filter((item) => Number.isFinite(Number(item)));
  if (!Number.isFinite(Number(value)) || !numeric.length) {
    return `<td class="num ${fantasyIsIssue(value) ? "formula-issue" : ""}">${esc(fantasyDisplay(value, digits))}${marker}</td>`;
  }
  const min = Math.min(...numeric);
  const max = Math.max(...numeric);
  return `<td class="num cf" ${cfStyle(value, min, max, reverse)}>${esc(fantasyDisplay(value, digits))}${marker}</td>`;
}

function fantasyCellWithClass(value, values, reverse = false, digits = 1, cls = "", marker = "") {
  const numeric = values.filter((item) => Number.isFinite(Number(item)));
  if (!Number.isFinite(Number(value)) || !numeric.length) {
    return `<td class="num ${cls} ${fantasyIsIssue(value) ? "formula-issue" : ""}">${esc(fantasyDisplay(value, digits))}${marker}</td>`;
  }
  const min = Math.min(...numeric);
  const max = Math.max(...numeric);
  return `<td class="num cf ${cls}" ${cfStyle(value, min, max, reverse)}>${esc(fantasyDisplay(value, digits))}${marker}</td>`;
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
    fantasyStar: "Save this as a fantasy favorite.",
    scoreRank: "Rank of the projected weekly score among this position.",
    score: "Projected fantasy points from rating, depth, matchup, team context, and QB stat history.",
    avgScore: "Projected season points divided by scheduled games.",
    fullPprScore: "FullPPR score: fantasy points with one point per reception.",
    halfPprScore: ".5PPR score: fantasy points with half point per reception.",
    standardScore: "NoPPR score: yards and TDs without reception points.",
    fullPprAvg: "FullPPR season total divided by games.",
    halfPprAvg: ".5PPR season total divided by games.",
    standardAvg: "NoPPR season total divided by games.",
    seasonScore: "Same formula using season production only.",
    last5Score: "Same formula using last-five-games-played production only.",
    name: "Player from the current app depth chart pool.",
    team: "Current team from the app depth chart.",
    opponent: "Opponent from the selected Season Schedule week.",
    rating: "Current app player rating from Depth Charts.",
    depth: "Current depth-chart spot; injured players fall out of normal depth.",
    last5Score: "Projected score using last-five-games-played stat inputs.",
    value: "Projected score divided by salary when salary exists; otherwise score.",
  };
  const extraTips = {
    "extra:FullPPR": "FullPPR score: yards, TDs, receptions, depth, matchup, talent, usage, red zone, and team context.",
    "extra:.5PPR": ".5PPR score: yards, TDs, half receptions, depth, matchup, talent, usage, red zone, and team context.",
    "extra:NoPPR": "NoPPR score: yards and TDs with no reception bonus.",
    "extra:FullPPR Rank": "Rank of FullPPR score among this position.",
    "extra:.5PPR Rank": "Rank of .5PPR score among this position.",
    "extra:NoPPR Rank": "Rank of NoPPR score among this position.",
    "extra:Weeks Counted": "Regular-season weeks with a scheduled opponent.",
    "extra:Season Difficulty": "Average vPOS matchup rank across the season; lower is easier.",
    "extra:Easy Weeks": "Games with a vPOS matchup rank of 10 or better.",
    "extra:Hard Weeks": "Games with a vPOS matchup rank of 23 or worse.",
    "extra:Playoff Diff": "Average vPOS matchup for Weeks 15-17; lower is easier.",
    "extra:FullPPR Total": "FullPPR projected total over scheduled games.",
    "extra:FullPPR Avg": "FullPPR projected points per scheduled game.",
    "extra:FullPPR ADP": "FantasyPros real-time FullPPR average draft position.",
    "extra:FullPPR ADP Rank": "FantasyPros FullPPR ADP rank.",
    "extra:FullPPR Value": "FantasyPros FullPPR ADP rank minus projected rank.",
    "extra:.5PPR Total": ".5PPR projected total over scheduled games.",
    "extra:.5PPR Avg": ".5PPR projected points per scheduled game.",
    "extra:.5PPR ADP": "FantasyPros real-time .5PPR average draft position.",
    "extra:.5PPR ADP Rank": "FantasyPros .5PPR ADP rank.",
    "extra:.5PPR Value": "FantasyPros .5PPR ADP rank minus projected rank.",
    "extra:NoPPR Total": "NoPPR projected total over scheduled games.",
    "extra:NoPPR Avg": "NoPPR projected points per scheduled game.",
    "extra:NoPPR ADP": "FantasyPros real-time NoPPR average draft position.",
    "extra:NoPPR ADP Rank": "FantasyPros NoPPR ADP rank.",
    "extra:NoPPR Value": "FantasyPros NoPPR ADP rank minus projected rank.",
    "extra:Avg Team Context": "Season average of OL, scoring, QB/WR help, defense, or stadium context.",
    "extra:Avg Production": "Average usage/stat inputs: QB logs, snaps, targets, red zone, or kicking volume.",
    "extra:Avg Bonuses": "Average extra edges from yards, TDs, rushing, usage, pressure, or kicking range.",
    "extra:Team Context": "Team support: OL, scoring, game script, QB/WR help, or defense/stadium context.",
    "extra:Team Context Rank": "Rank of team-support context against the rest of this position.",
    "extra:Game Script": "Projected game margin; positive usually helps RB rushing volume.",
    "extra:Team Total": "Model projected points for this player's team.",
    "extra:Team YPG Rank": "Team offensive yards-per-game rank; lower is better context.",
    "extra:ADP Source": "Where the draft data came from.",
    "extra:ADP Value": "ADP minus projected rank; higher means better draft value.",
    "extra:W1": "Week 1 opponent abbreviation and projected score.",
    "extra:W2": "Week 2 opponent abbreviation and projected score.",
    "extra:W3": "Week 3 opponent abbreviation and projected score.",
    "extra:W4": "Week 4 opponent abbreviation and projected score.",
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
    "extra:Opp vRB Rank": "Opponent run-defense matchup rank; lower is easier for RBs.",
    "extra:Opp vWR Rank": "Opponent WR-defense matchup rank; lower is easier for WRs.",
    "extra:Opp vTE Rank": "Opponent TE-defense matchup rank; lower is easier for TEs.",
    "extra:Game Script": "Projected margin; positive favors rushing volume.",
    "extra:Team Total": "Model projected points for this player's team.",
    "extra:Rush TDs Allowed Rank": "Opponent rushing TD allowance rank; lower is better.",
    "extra:Pass TDs Allowed Rank": "Opponent passing TD allowance rank; lower is better.",
    "extra:Typical Snap %": "Expected playing-time share from depth or scanned usage.",
    "extra:Typical Targets": "Expected targets from depth or scanned usage.",
    "extra:Typical Red Zone Opportunities": "Expected red-zone chances from depth or scanned usage.",
    "extra:Carries": "Projected carries from depth, usage, matchup, talent, and OL.",
    "extra:Rush Yds": "Projected rushing yards from carries, talent, matchup, and OL.",
    "extra:Receptions": "Projected catches from targets and catch-rate assumptions.",
    "extra:Rec Yds": "Projected receiving yards from catches, matchup, QB, and talent.",
    "extra:TDs": "Projected touchdowns from red-zone role and scoring context.",
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
    const usesPpr = ["RB", "WR", "TE"].includes(position);
    const playerLabel = position === "Defense" ? "Team" : "Player";
    const base = [
      fantasyColumn("", "fantasyStar", "compare-col", { group: "Player", noSort: true }),
      fantasyColumn("Rk", "rank", "rank-col cf", { group: "Player", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn(playerLabel, "name", "sticky-name", { group: "Player", sortDir: "asc" }),
      fantasyColumn("Team", "team", "", { group: "Player", sortDir: "asc", positions: position === "Defense" ? [] : undefined }),
    ].filter((col) => !col.positions || col.positions.includes(position));
    const scoreColumns = usesPpr ? [
      fantasyColumn("Full Total", "fullPprScore", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Full/G", "fullPprAvg", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Full Rank", "extra:FullPPR Rank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc", boundaryAfter: true }),
      fantasyColumn(".5 Total", "halfPprScore", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn(".5/G", "halfPprAvg", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn(".5 Rank", "extra:.5PPR Rank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc", boundaryAfter: true }),
      fantasyColumn("No Total", "standardScore", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("No/G", "standardAvg", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("No Rank", "extra:NoPPR Rank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
    ] : [
      fantasyColumn("Total", "score", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Avg/G", "avgScore", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Score Rank", "rank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc", boundaryAfter: true }),
    ];
    const adpColumns = [
      fantasyColumn("Full ADP", "extra:FullPPR ADP", "num cf", { group: "Draft", heat: true, reverse: true, sortDir: "asc" }),
      fantasyColumn("Full ADP Rank", "extra:FullPPR ADP Rank", "num cf rank-col", { group: "Draft", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Full Value", "extra:FullPPR Value", "num cf", { group: "Draft", heat: true, sortDir: "desc", boundaryAfter: true }),
      fantasyColumn(".5 ADP", "extra:.5PPR ADP", "num cf", { group: "Draft", heat: true, reverse: true, sortDir: "asc" }),
      fantasyColumn(".5 ADP Rank", "extra:.5PPR ADP Rank", "num cf rank-col", { group: "Draft", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn(".5 Value", "extra:.5PPR Value", "num cf", { group: "Draft", heat: true, sortDir: "desc", boundaryAfter: true }),
      fantasyColumn("No ADP", "extra:NoPPR ADP", "num cf", { group: "Draft", heat: true, reverse: true, sortDir: "asc" }),
      fantasyColumn("No ADP Rank", "extra:NoPPR ADP Rank", "num cf rank-col", { group: "Draft", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("No Value", "extra:NoPPR Value", "num cf", { group: "Draft", heat: true, sortDir: "desc" }),
    ];
    return [
      ...base,
      ...scoreColumns,
      fantasyColumn("Avg vPOS", "extra:Season Difficulty", "num cf", { group: "Season Difficulty", heat: true, reverse: true, sortDir: "asc" }),
      fantasyColumn("Easy Games", "extra:Easy Weeks", "num cf rank-col", { group: "Season Difficulty", heat: true, digits: 0, sortDir: "desc" }),
      fantasyColumn("Hard Games", "extra:Hard Weeks", "num cf rank-col", { group: "Season Difficulty", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Playoff vPOS", "extra:Playoff Diff", "num cf", { group: "Season Difficulty", heat: true, reverse: true, sortDir: "asc" }),
      ...adpColumns,
      fantasyColumn("Rating", "rating", "num cf", { group: "Talent", heat: true, digits: 0, sortDir: "desc", positions: position === "Defense" ? [] : undefined }),
      fantasyColumn("Depth", "depth", "num cf rank-col", { group: "Talent", heat: true, digits: 0, reverse: true, sortDir: "asc", positions: position === "Defense" ? [] : undefined }),
      fantasyColumn("Team Context", "extra:Avg Team Context", "num cf", { group: "Team Context", heat: true, reverse: true, sortDir: "asc" }),
      fantasyColumn("Avg Production", "extra:Avg Production", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("Avg Bonus", "extra:Avg Bonuses", "num cf", { group: "Bonuses", heat: true, sortDir: "desc" }),
      fantasyColumn("Weeks", "extra:Weeks Counted", "num rank-col", { group: "Schedule", digits: 0, sortDir: "desc" }),
      fantasyColumn("Schedule", "seasonSchedule", "season-schedule-cell", { group: "Schedule", noSort: true }),
    ].filter((col) => !col.positions || col.positions.includes(position));
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
      fantasyColumn("Last 5 Production", "last5Score", "num cf", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("FullPPR", "extra:FullPPR", "num cf score-col", { group: "Score", heat: true, positions: ["RB", "WR", "TE"], sortDir: "desc" }),
      fantasyColumn(".5PPR", "extra:.5PPR", "num cf score-col", { group: "Score", heat: true, positions: ["RB", "WR", "TE"], sortDir: "desc" }),
      fantasyColumn("NoPPR", "extra:NoPPR", "num cf score-col", { group: "Score", heat: true, positions: ["RB", "WR", "TE"], sortDir: "desc" }),
      fantasyColumn("Season Production", "seasonScore", "num cf", { group: "Score", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("Week Score", "score", "num cf", { group: "Score", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("Last 5 Rank", "last5Rank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc", boundaryAfter: true }),
      fantasyColumn("vQB", "extra:Opp vQB Rating", "num cf", { group: "Matchup", heat: true, reverse: true, positions: ["QB"], sortDir: "asc" }),
      fantasyColumn("vQB Rank", "extra:Matchup Rating (Low is good)", "num cf rank-col", { group: "Matchup", heat: true, digits: 0, reverse: true, positions: ["QB"], sortDir: "asc" }),
      fantasyColumn("Stat vQB Rank", "extra:Stat vQB Rank", "num cf rank-col", { group: "Matchup", heat: true, digits: 0, reverse: true, positions: ["QB"], sortDir: "asc" }),
      fantasyColumn("vRB Rank", "extra:Opp vRB Rank", "num cf rank-col", { group: "Matchup", heat: true, digits: 0, reverse: true, positions: ["RB"], sortDir: "asc" }),
      fantasyColumn("vWR Rank", "extra:Opp vWR Rank", "num cf rank-col", { group: "Matchup", heat: true, digits: 0, reverse: true, positions: ["WR"], sortDir: "asc" }),
      fantasyColumn("vTE Rank", "extra:Opp vTE Rank", "num cf rank-col", { group: "Matchup", heat: true, digits: 0, reverse: true, positions: ["TE"], sortDir: "asc" }),
      fantasyColumn("Games", "extra:Games Played", "num rank-col", { group: "Production", digits: 0, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("Snap %", "extra:!!LAST 5!!\nTypical Snap %", "num cf", { group: "Production", heat: true, positions: ["RB", "WR", "TE"], sortDir: "desc" }),
      fantasyColumn("Targets", "extra:!!LAST 5!!\nTypical Targets", "num cf", { group: "Production", heat: true, positions: ["RB", "WR", "TE"], sortDir: "desc" }),
      fantasyColumn("RZone", "extra:!!LAST 5!!\nTypical Red Zone Opportunities", "num cf", { group: "Production", heat: true, positions: ["RB", "WR", "TE"], sortDir: "desc" }),
      fantasyColumn("PYds", "extra:!!LAST 5!! Typical Pass Yards", "num cf", { group: "Production", heat: true, digits: 0, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("PYds Bonus", "extra:!!LAST 5!! Pass Yards Bonus Score", "num cf", { group: "Bonuses", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("PTD", "extra:!!LAST 5!! Typical Pass TDs", "num cf", { group: "Production", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("PTD Bonus", "extra:!!LAST 5!! Typical Pass TDs Bonus Score", "num cf", { group: "Bonuses", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("Rush Att", "extra:!!LAST 5!! Typical Rush Attempts", "num cf", { group: "Production", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("Rush Bonus", "extra:!!LAST 5!! Typical Rush Attempts Bonus Score", "num cf", { group: "Bonuses", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("Rush TD", "extra:!!LAST 5!! Typical Rush TDs", "num cf", { group: "Production", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("Rush TD Bonus", "extra:!!LAST 5!! Typical Rush TDs Bonus Score", "num cf", { group: "Bonuses", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("Bonus", "extra:!!LAST 5!!\nTotal Bonuses", "num cf", { group: "Bonuses", heat: true, positions: ["QB"], sortDir: "desc" }),
      fantasyColumn("Bonus Rank", "extra:!!LAST 5!!\nTotal Bonuses RANK", "num cf rank-col", { group: "Bonuses", heat: true, digits: 0, reverse: true, positions: ["QB"], sortDir: "asc" }),
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
      fantasyColumn("Week Score", "score", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Week Rank", "scoreRank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc", boundaryAfter: true }),
      fantasyColumn("Season Production", "seasonScore", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Season Rank", "seasonRank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc", boundaryAfter: true }),
      fantasyColumn("Last 5 Production", "last5Score", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Last 5 Rank", "last5Rank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("vQB", "extra:Opp vQB Rating", "num cf", { group: "Matchup", heat: true, reverse: true, sortDir: "asc" }),
      fantasyColumn("vQB Rank", "extra:Matchup Rating (Low is good)", "num cf rank-col", { group: "Matchup", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Stat vQB Rank", "extra:Stat vQB Rank", "num cf rank-col", { group: "Matchup", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Player Rt", "rating", "num cf", { group: "Talent", heat: true, digits: 0, sortDir: "desc" }),
      fantasyColumn("Player Rank", "extra:Player Rating Rank", "num cf rank-col", { group: "Talent", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Depth", "depth", "num cf rank-col", { group: "Talent", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("OL Rank", "extra:OL Rank", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("PPG Rank", "extra:PPG Rank", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("WR Rank", "extra:WR Group Rank", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
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
      fantasyColumn("Bonus Rank", "extra:Total Bonuses RANK", "num cf rank-col", { group: "Bonuses", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Source", "extra:Stat Source", "", { group: "Source", sortDir: "asc" }),
    ];
    return base;
  }
  if (position === "RB") {
    return [
      fantasyColumn("", "compareSelect", "compare-col", { group: "Player", noSort: true }),
      fantasyColumn("Rk", "scoreRank", "rank-col cf", { group: "Player", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Player", "name", "sticky-name", { group: "Player", sortDir: "asc" }),
      fantasyColumn("Team", "team", "", { group: "Player", sortDir: "asc" }),
      fantasyColumn("Opp", "opponent", "", { group: "Player", sortDir: "asc" }),
      fantasyColumn("FullPPR", "fullPprScore", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Full Rank", "extra:FullPPR Rank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc", boundaryAfter: true }),
      fantasyColumn(".5PPR", "halfPprScore", "num cf score-col", { group: "Score", heat: true, sortDir: "desc", tip: "Default RB score: rush yards, receiving yards, TDs, half receptions, depth, talent, matchup, OL, usage, red zone, and team context." }),
      fantasyColumn(".5 Rank", "extra:.5PPR Rank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc", boundaryAfter: true }),
      fantasyColumn("NoPPR", "standardScore", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("No Rank", "extra:NoPPR Rank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Season Production", "seasonScore", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Season Rank", "seasonRank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc", boundaryAfter: true }),
      fantasyColumn("Last 5 Production", "last5Score", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Last 5 Rank", "last5Rank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("vRB", "extra:Opp vRB Rating", "num cf", { group: "Matchup", heat: true, reverse: true, sortDir: "asc" }),
      fantasyColumn("vRB Rank", "extra:Opp vRB Rank", "num cf rank-col", { group: "Matchup", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Player Rt", "rating", "num cf", { group: "Talent", heat: true, digits: 0, sortDir: "desc" }),
      fantasyColumn("Player Rank", "extra:Player Rating Rank", "num cf rank-col", { group: "Talent", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Depth", "depth", "num cf rank-col", { group: "Talent", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("OL Rank", "extra:OL Rank", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("YPG Rank", "extra:Team YPG Rank", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("PPG Rank", "extra:PPG Rank", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Game Script", "extra:Game Script", "num cf", { group: "Team Context", heat: true, sortDir: "desc" }),
      fantasyColumn("Team Total", "extra:Team Total", "num cf", { group: "Team Context", heat: true, sortDir: "desc" }),
      fantasyColumn("Rush TD Rank", "extra:Rush TDs Allowed Rank", "num cf rank-col", { group: "Matchup", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Snap %", "extra:Typical Snap %", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("Targets", "extra:Typical Targets", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("RZone", "extra:Typical Red Zone Opportunities", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("Carries", "extra:Carries", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("Rush Yds", "extra:Rush Yds", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("Rec", "extra:Receptions", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("Rec Yds", "extra:Rec Yds", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("TDs", "extra:TDs", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("Source", "extra:Stat Source", "", { group: "Source", sortDir: "asc" }),
    ];
  }
  if (position === "WR" || position === "TE") {
    const posLabel = position === "WR" ? "vWR" : "vTE";
    const matchupRank = position === "WR" ? "Opp vWR Rank" : "Opp vTE Rank";
    const matchupRating = position === "WR" ? "Opp vWR Rating" : "Opp vTE Rating";
    return [
      fantasyColumn("", "compareSelect", "compare-col", { group: "Player", noSort: true }),
      fantasyColumn("Rk", "scoreRank", "rank-col cf", { group: "Player", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Player", "name", "sticky-name", { group: "Player", sortDir: "asc" }),
      fantasyColumn("Team", "team", "", { group: "Player", sortDir: "asc" }),
      fantasyColumn("Opp", "opponent", "", { group: "Player", sortDir: "asc" }),
      fantasyColumn("FullPPR", "fullPprScore", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Full Rank", "extra:FullPPR Rank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc", boundaryAfter: true }),
      fantasyColumn(".5PPR", "halfPprScore", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn(".5 Rank", "extra:.5PPR Rank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc", boundaryAfter: true }),
      fantasyColumn("NoPPR", "standardScore", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("No Rank", "extra:NoPPR Rank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Season Production", "seasonScore", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Season Rank", "seasonRank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc", boundaryAfter: true }),
      fantasyColumn("Last 5 Production", "last5Score", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Last 5 Rank", "last5Rank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc", boundaryAfter: true }),
      fantasyColumn(posLabel, `extra:${matchupRating}`, "num cf", { group: "Matchup", heat: true, reverse: true, sortDir: "asc" }),
      fantasyColumn(`${posLabel} Rank`, `extra:${matchupRank}`, "num cf rank-col", { group: "Matchup", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("CB Match", "extra:CB Matchup Rating", "num cf", { group: "Matchup", heat: true, reverse: true, positions: ["WR"], sortDir: "asc" }),
      fantasyColumn("Player Rt", "rating", "num cf", { group: "Talent", heat: true, digits: 0, sortDir: "desc" }),
      fantasyColumn("Player Rank", "extra:Player Rating Rank", "num cf rank-col", { group: "Talent", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Depth", "depth", "num cf rank-col", { group: "Talent", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("QB Rt", "extra:QB Rating", "num cf", { group: "Team Context", heat: true, digits: 0, sortDir: "desc" }),
      fantasyColumn("QB Rank", "extra:QB Rank", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("OL Rank", "extra:OL Rank", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, reverse: true, positions: ["TE"], sortDir: "asc" }),
      fantasyColumn("YPG Rank", "extra:Team YPG Rank", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("PPG Rank", "extra:PPG Rank", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Pass TD Rank", "extra:Pass TDs Allowed Rank", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, reverse: true, positions: ["WR"], sortDir: "asc" }),
      fantasyColumn("Game Script", "extra:Game Script", "num cf", { group: "Team Context", heat: true, sortDir: "desc" }),
      fantasyColumn("Team Total", "extra:Team Total", "num cf", { group: "Team Context", heat: true, sortDir: "desc" }),
      fantasyColumn("Snap %", "extra:Typical Snap %", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("Targets", "extra:Typical Targets", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("RZone", "extra:Typical Red Zone Opportunities", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("Rec", "extra:Receptions", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("Rec Yds", "extra:Rec Yds", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("TDs", "extra:TDs", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("Source", "extra:Stat Source", "", { group: "Source", sortDir: "asc" }),
    ].filter((col) => !col.positions || col.positions.includes(position));
  }
  if (position === "Defense") {
    return [
      fantasyColumn("Rank", "scoreRank", "rank-col cf", { group: "Team", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Team", "name", "sticky-name", { group: "Team", sortDir: "asc" }),
      fantasyColumn("Opp", "opponent", "", { group: "Team", sortDir: "asc" }),
      fantasyColumn("Week Score", "score", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Defense", "rating", "num cf", { group: "Defense", heat: true, digits: 1, sortDir: "desc" }),
      fantasyColumn("Def Rank", "extra:Defense Rank", "num cf rank-col", { group: "Defense", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Pass Rush", "extra:Pass Rush", "num cf", { group: "Defense", heat: true, sortDir: "desc" }),
      fantasyColumn("Sacks Rank", "extra:Sacks Rank", "num cf rank-col", { group: "Defense", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Take Rank", "extra:Takeaways Rank", "num cf rank-col", { group: "Defense", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Opp QB", "extra:Opp QB Rating", "num cf", { group: "Opponent", heat: true, reverse: true, sortDir: "asc" }),
      fantasyColumn("Opp QB Rank", "extra:Opp QB Rank", "num cf rank-col", { group: "Opponent", heat: true, digits: 0, sortDir: "desc" }),
      fantasyColumn("Opp Off", "extra:Opponent Off Rating", "num cf", { group: "Opponent", heat: true, reverse: true, sortDir: "asc" }),
      fantasyColumn("Opp PPG Rank", "extra:Opp PPG Rank", "num cf rank-col", { group: "Opponent", heat: true, digits: 0, sortDir: "desc" }),
      fantasyColumn("Source", "extra:Stat Source", "", { group: "Source", sortDir: "asc" }),
    ];
  }
  if (position === "Kicker") {
    return [
      fantasyColumn("Rank", "scoreRank", "rank-col cf", { group: "Player", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Player", "name", "sticky-name", { group: "Player", sortDir: "asc" }),
      fantasyColumn("Team", "team", "", { group: "Player", sortDir: "asc" }),
      fantasyColumn("Opp", "opponent", "", { group: "Player", sortDir: "asc" }),
      fantasyColumn("Week Score", "score", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
      fantasyColumn("Madden K", "extra:Madden K Rating", "num cf", { group: "Talent", heat: true, digits: 0, sortDir: "desc" }),
      fantasyColumn("Off Rank", "extra:Team Offense Rank", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
      fantasyColumn("Go 4th", "extra:Go For It Penalty", "num cf", { group: "Team Context", heat: true, reverse: true, sortDir: "asc" }),
      fantasyColumn("50+ FGs", "extra:50+ FGs", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("FG Vol", "extra:FG Volume", "num cf", { group: "Production", heat: true, sortDir: "desc" }),
      fantasyColumn("Stadium", "extra:Kicker Stadium Tier", "num cf rank-col", { group: "Environment", heat: true, digits: 0, sortDir: "desc" }),
      fantasyColumn("Source", "extra:Stat Source", "", { group: "Source", sortDir: "asc" }),
    ];
  }
  return [
    fantasyColumn("", "compareSelect", "compare-col", { group: "Player", noSort: true }),
    fantasyColumn("Rk", "scoreRank", "rank-col cf", { group: "Player", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
    fantasyColumn(position === "Defense" ? "Team" : "Player", "name", "sticky-name", { group: "Player", sortDir: "asc" }),
    fantasyColumn("Team", "team", "", { group: "Player", sortDir: "asc" }),
    fantasyColumn("Opp", "opponent", "", { group: "Player", sortDir: "asc" }),
    fantasyColumn("Week Score", "score", "num cf score-col", { group: "Score", heat: true, sortDir: "desc" }),
    fantasyColumn("Score Rank", "scoreRank", "num cf rank-col", { group: "Score", heat: true, digits: 0, reverse: true, sortDir: "asc" }),
    fantasyColumn("Rating", "rating", "num cf", { group: "Talent", heat: true, digits: 0, sortDir: "desc" }),
    fantasyColumn("Rating Rank", "extra:Player Rating Rank", "num cf rank-col", { group: "Talent", heat: true, digits: 0, reverse: true, sortDir: "asc", positions: ["RB", "WR", "TE"] }),
    fantasyColumn("Depth", "depth", "num cf rank-col", { group: "Talent", heat: true, digits: 0, reverse: true, sortDir: "asc", positions: ["RB", "WR", "TE"] }),
    fantasyColumn("Matchup", "extra:Matchup Rating", "num cf", { group: "Matchup", heat: true, reverse: true, positions: ["RB", "WR", "TE"], sortDir: "asc" }),
    fantasyColumn("Match Rank", "extra:Matchup Rank", "num cf rank-col", { group: "Matchup", heat: true, digits: 0, reverse: true, positions: ["RB", "WR", "TE"], sortDir: "asc" }),
    fantasyColumn("Team Context", "extra:Team Context", "num cf", { group: "Team Context", heat: true, positions: ["RB", "WR", "TE"], sortDir: "desc" }),
    fantasyColumn("Context Rank", "extra:Team Context Rank", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, reverse: true, positions: ["RB", "WR", "TE"], sortDir: "asc" }),
    fantasyColumn("Source", "extra:Stat Source", "", { group: "Source", positions: ["Kicker"], sortDir: "asc" }),
    fantasyColumn("Stadium", "extra:Kicker Stadium Tier", "num cf rank-col", { group: "Team Context", heat: true, digits: 0, positions: ["Kicker"], sortDir: "desc" }),
    fantasyColumn("Details", "compactDetails", "", { group: "Details", noSort: true }),
  ].filter((col) => !col.positions || col.positions.includes(position));
}

function fantasyValue(row, key, position) {
  if (key === "compareSelect") return fantasyCompareCell(row);
  if (key === "fantasyStar") return fantasyStarCell(row);
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
  if (key === "seasonSchedule") {
    return `<div class="season-week-chip-grid">${Array.from({ length: 17 }, (_, index) => seasonScheduleChip(row, index + 1, state._activeFantasyRows || [])).join("")}</div>`;
  }
  if (key === "compactDetails") return `<div class="fantasy-extra-chips compact">${fantasyExtras(row)}</div>`;
  if (key.startsWith("extra:")) return fantasyDetailValue(row, key.slice(6));
  return row[key];
}

function renderFantasyScheduleDetailModal() {
  const detail = state.fantasyScheduleDetail;
  if (!detail) return "";
  const rows = state._activeFantasyRows || [];
  const row = rows.find((item) => fantasyCompareKey(item) === detail.key);
  if (!row) return "";
  const week = Number(detail.week);
  const opp = fantasyDetailValue(row, `W${week} Opp`);
  const score = fantasyDetailValue(row, `W${week} Score`);
  const vpos = fantasyDetailValue(row, `W${week} vPOS`);
  const title = row.player || row.team || "Fantasy Projection";
  const context = [
    ["Team Context", fantasyDetailValue(row, "Avg Team Context") || seasonTeamContextValueFor(row, row.position)],
    ["Production", fantasyDetailValue(row, "Avg Production") || seasonProductionValueFor(row, row.position)],
    ["Bonuses", fantasyDetailValue(row, "Avg Bonuses") || seasonBonusValueFor(row, row.position)],
    ["Season Avg vPOS", fantasyDetailValue(row, "Season Difficulty")],
  ];
  return `
    <div class="modal-backdrop" data-close-fantasy-detail="1">
      <section class="player-modal fantasy-detail-modal" role="dialog" aria-modal="true">
        <button class="modal-close" data-close-fantasy-detail="1">X</button>
        <div class="player-modal-hero compact">
          <div>
            <p class="eyebrow">Week ${esc(week)} Projection</p>
            <h2>${esc(title)}</h2>
            <p>${row.team ? teamCellFull(row.team) : ""} ${opp ? `vs ${teamCellFull(opp)}` : ""}</p>
          </div>
          <div class="player-current-rating"><strong>${esc(fantasyDisplay(score, 1))}</strong><span>Week Score</span></div>
        </div>
        <div class="fantasy-detail-grid">
          <div><b>Opponent vPOS</b><strong>${esc(fantasyDisplay(vpos, 1))}</strong><span>Lower is easier</span></div>
          ${context.map(([label, value]) => `<div><b>${esc(label)}</b><strong>${esc(fantasyDisplay(value, 1))}</strong><span>${esc(fantasyColumnTip(label, `extra:${label}`))}</span></div>`).join("")}
        </div>
      </section>
    </div>
  `;
}

function fantasyPlainValue(row, column, position) {
  if (column.key === "compareSelect" || column.key === "fantasyStar") return "";
  if (column.key === "name") return position === "Defense" ? (row.team || "") : (row.player || "");
  if (column.key === "team") return row.team || "";
  if (column.key === "opponent") return row.opponent || "";
  if (column.key === "seasonSchedule") return Array.from({ length: 17 }, (_, index) => fantasyDetailValue(row, `W${index + 1}`)).join(" ");
  if (column.key.startsWith("extra:")) return fantasyDetailValue(row, column.key.slice(6));
  return row[column.key];
}

function fantasyClayMarker(row, key) {
  const source = String(fantasyDetailValue(row, "Stat Source") || "");
  if (!source.includes("Clay")) return "";
  const cleanKey = String(key || "").replace(/^extra:/, "").replace(/\s+/g, " ").trim();
  const productionLabels = new Set([
    "Typical Pass Yards",
    "Typical Pass TDs",
    "Typical Rush Attempts",
    "Typical Rush TDs",
    "Typical Snap %",
    "Typical Targets",
    "Typical Red Zone Opportunities",
    "Rush Yds",
    "Receptions",
    "Rec Yds",
    "TDs",
    "Carries",
    "seasonScore",
    "last5Score",
  ]);
  return productionLabels.has(cleanKey) ? `<sup class="projection-marker" title="Filled from Mike Clay projection">*</sup>` : "";
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
  if (column.key === "seasonSchedule") return 960;
  if (column.key === "compareSelect" || column.key === "fantasyStar") return 36;
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
        <tr>${columns.map((column, index) => `<th class="${column.cls || ""} ${fantasyGroupClass(column.group)} ${groupStarts.has(index) ? "group-start" : ""} ${column.boundaryAfter ? "pair-end" : ""} ${index === 0 ? "frozen-compare" : ""} ${index === 1 ? "frozen-rank" : ""} ${index === 2 && column.key === "name" ? "frozen-name" : ""}">
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
  const marker = fantasyClayMarker(row, column.key);
  const freezeClass = `${index === 0 ? " frozen-compare" : ""}${index === 1 ? " frozen-rank" : ""}${index === 2 && column.key === "name" ? " frozen-name" : ""}`;
  const groupClass = ` ${fantasyGroupClass(column.group)}${groupStart ? " group-start" : ""}${column.boundaryAfter ? " pair-end" : ""}`;
  if (column.key === "compareSelect" || column.key === "fantasyStar" || column.key === "name" || column.key === "team" || column.key === "opponent" || column.key === "seasonContext" || column.key === "seasonWeeks" || column.key === "seasonSchedule" || column.key === "compactDetails") {
    return `<td class="${column.cls || ""}${freezeClass}${groupClass}">${value || "-"}</td>`;
  }
  const values = allRows.map((item) => fantasyValue(item, column.key, position));
  if (column.heat) return fantasyCellWithClass(value, values, Boolean(column.reverse), column.digits ?? 1, `${column.cls || ""}${freezeClass}${groupClass}`, marker);
  return `<td class="${column.cls || ""}${freezeClass}${groupClass} ${fantasyIsIssue(value) ? "formula-issue" : ""}">${esc(fantasyDisplay(value, column.digits ?? 1))}${marker}</td>`;
}

function wireFantasyScroll() {
  document.querySelectorAll(".fantasy-rank-scroll, .my-fantasy-scroll").forEach((el) => {
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

function wireFantasyFavorites() {
  document.querySelectorAll("[data-fantasy-favorite]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.fantasyFavorite;
      if (!key) return;
      const set = new Set(state.fantasyFavorites || []);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      state.fantasyFavorites = [...set];
      storage.set("nflz-fantasy-favorites", state.fantasyFavorites);
      render();
    });
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

const weeklySkillSliderTips = {
  depth: "Depth chart role and availability.",
  matchup: "Opponent position strength.",
  talent: "Your player rating.",
  oline: "Blocking help from line.",
  ppg: "Team scoring environment.",
  qb: "Quarterback support for catchers.",
  usage: "Snaps, carries, targets.",
  redZone: "High-value touchdown chances.",
  gameScript: "Projected lead or trail.",
  teamTotal: "Projected team points.",
  opponentTd: "Opponent touchdown weakness.",
};

const weeklySkillFactorOptions = [
  ["gameScript", "Game Script"],
  ["teamTotal", "Team Total"],
  ["opponentTd", "Opponent TD Allowed"],
];

function weeklySkillToggleButton(key, label) {
  const active = Boolean(state.weeklySkillOptions[key]);
  const disabled = key === "useLast5" && !state.weeklySkillOptions.useProduction;
  return `<button class="formula-toggle ${active ? "active" : ""}" data-skill-option="${esc(key)}" ${disabled ? "disabled" : ""}><span>${esc(label)}</span></button>`;
}

function weeklySkillSlider(key, label, min = 0, max = 200, readOnly = false) {
  const rawValue = num(state.weeklySkillWeights[key], defaultWeeklySkillWeights[key] ?? 100);
  const value = Math.max(min, Math.min(max, Math.round(rawValue / 10) * 10));
  const productionKeys = ["usage", "redZone"];
  const disabled = readOnly || (productionKeys.includes(key) && weeklySkillProductionWeight() <= 0);
  return `
    <label class="formula-slider ${disabled ? "disabled" : ""}" title="${esc(weeklySkillSliderTips[key] || "Adjusts this score factor.")}">
      <span>${esc(label)}</span>
      <input type="range" min="${min}" max="${max}" step="10" value="${esc(value)}" data-skill-weight="${esc(key)}" ${disabled ? "disabled" : ""} />
      <b>${esc(value)}%</b>
    </label>
  `;
}

function renderWeeklySkillFormulaControls(position, readOnly = false) {
  if (!["RB", "WR", "TE"].includes(position)) return "";
  const open = Boolean(state.weeklySkillControlsOpen);
  const extraFactors = state.weeklySkillOptions.extraFactors || [];
  const baseSliders = [
    ["depth", "Depth"],
    ["matchup", "Opponent"],
    ["talent", "Talent"],
    ["oline", "O-Line"],
    ["ppg", "PPG"],
    ...(position === "RB" ? [] : [["qb", "QB Context"]]),
    ["usage", "Usage"],
    ["redZone", "Red Zone"],
  ];
  const availableFactors = weeklySkillFactorOptions.filter(([key]) => !extraFactors.includes(key));
  return `
    <section class="formula-control-panel ${open ? "" : "collapsed"} ${readOnly ? "read-only" : ""}">
      <div class="formula-control-head">
        <h3>${readOnly ? `${esc(position)} Weekly Controls Used Here` : `${esc(position)} Score Controls`}</h3>
        <div class="formula-control-actions">
          ${state.weeklySkillDefaultMessage ? `<span class="formula-save-note">${esc(state.weeklySkillDefaultMessage)}</span>` : ""}
          ${readOnly ? `<button class="mini-action primary" data-page="weeklyFantasy">Weekly Fantasy Rankings Screen</button>` : `<button id="weekly-skill-toggle-controls" class="mini-action">${open ? "Hide" : "Show"}</button>`}
          ${open && !readOnly ? `<button id="weekly-skill-set-default" class="mini-action">Set Default</button>` : ""}
          ${open && !readOnly ? `<button id="weekly-skill-reset-formula" class="mini-action">Reset Formula</button>` : ""}
        </div>
      </div>
      ${open ? `
      <div class="formula-slider-grid skill-formula-grid primary-source-grid">
        ${weeklySkillSlider("statRanks", "StatRanks", 0, 100, readOnly)}
        ${weeklySkillSlider("last5", "Last 5 Blend", 0, 100, readOnly)}
        ${weeklySkillSlider("production2025", "2025 Production", 0, 100, readOnly)}
        ${weeklySkillSlider("production2026", "2026 Production", 0, 100, readOnly)}
      </div>
      <p class="formula-help">Hover a slider for its meaning. Add optional factors only when you want them active.</p>
      <div class="formula-slider-grid skill-formula-grid">
        ${baseSliders.map(([key, label]) => weeklySkillSlider(key, label, 0, 200, readOnly)).join("")}
        ${extraFactors.map((key) => weeklySkillSlider(key, weeklySkillFactorOptions.find(([id]) => id === key)?.[1] || key, 0, 200, readOnly)).join("")}
      </div>
      ${readOnly ? "" : `
      <div class="factor-add-row">
        <button id="weekly-skill-add-factor" class="mini-action" ${availableFactors.length ? "" : "disabled"}>+</button>
        ${optionSelect("weekly-skill-factor-select", availableFactors[0]?.[0] || "", availableFactors.length ? availableFactors : [["", "No more suggested factors"]])}
        <span>Suggested factors: game script, team total, opponent TD weakness.</span>
      </div>
      `}
      ` : ""}
    </section>
  `;
}

function wireWeeklySkillFormulaControls() {
  document.querySelector("#weekly-skill-toggle-controls")?.addEventListener("click", () => {
    state.weeklySkillControlsOpen = !state.weeklySkillControlsOpen;
    storage.set("nflz-weekly-skill-controls-open", state.weeklySkillControlsOpen);
    render();
  });
  document.querySelectorAll("[data-skill-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.skillOption;
      if (key === "useLast5" && !state.weeklySkillOptions.useProduction) return;
      state.weeklySkillOptions[key] = !state.weeklySkillOptions[key];
      if (key === "useProduction" && !state.weeklySkillOptions.useProduction) {
        state.weeklySkillOptions.useLast5 = false;
      }
      state.weeklySkillDefaultMessage = "";
      storage.set("nflz-weekly-skill-options", state.weeklySkillOptions);
      render();
    });
  });
  document.querySelectorAll("[data-skill-weight]").forEach((input) => {
    input.addEventListener("input", () => {
      state.weeklySkillWeights[input.dataset.skillWeight] = Number(input.value);
      state.weeklySkillDefaultMessage = "";
      storage.set("nflz-weekly-skill-weights", state.weeklySkillWeights);
      const valueLabel = input.closest(".formula-slider")?.querySelector("b");
      if (valueLabel) valueLabel.textContent = `${input.value}%`;
    });
    input.addEventListener("change", () => {
      state.weeklySkillWeights[input.dataset.skillWeight] = Number(input.value);
      state.weeklySkillDefaultMessage = "";
      storage.set("nflz-weekly-skill-weights", state.weeklySkillWeights);
      render();
    });
  });
  document.querySelector("#weekly-skill-set-default")?.addEventListener("click", () => {
    const weights = { ...defaultWeeklySkillWeights, ...state.weeklySkillWeights };
    const options = { ...defaultWeeklySkillOptions, ...state.weeklySkillOptions };
    storage.set("nflz-weekly-skill-default-weights", weights);
    storage.set("nflz-weekly-skill-default-options", options);
    state.weeklySkillWeights = { ...weights };
    state.weeklySkillOptions = { ...options };
    state.weeklySkillDefaultMessage = "Default saved";
    storage.set("nflz-weekly-skill-weights", state.weeklySkillWeights);
    storage.set("nflz-weekly-skill-options", state.weeklySkillOptions);
    render();
  });
  document.querySelector("#weekly-skill-reset-formula")?.addEventListener("click", () => {
    state.weeklySkillWeights = weeklySkillDefaultWeights();
    state.weeklySkillOptions = weeklySkillDefaultOptions();
    state.weeklySkillDefaultMessage = "Reset to default";
    storage.set("nflz-weekly-skill-weights", state.weeklySkillWeights);
    storage.set("nflz-weekly-skill-options", state.weeklySkillOptions);
    render();
  });
  document.querySelector("#weekly-skill-add-factor")?.addEventListener("click", () => {
    const key = document.querySelector("#weekly-skill-factor-select")?.value;
    if (!key) return;
    const next = new Set(state.weeklySkillOptions.extraFactors || []);
    next.add(key);
    state.weeklySkillOptions.extraFactors = [...next];
    state.weeklySkillWeights[key] = state.weeklySkillWeights[key] ?? 100;
    storage.set("nflz-weekly-skill-options", state.weeklySkillOptions);
    storage.set("nflz-weekly-skill-weights", state.weeklySkillWeights);
    render();
  });
}

function matchupRows() {
  const teams = state.data?.teams || [];
  const week = state.weeklyMatchupWeek === "auto" ? selectedSiteWeek() : state.weeklyMatchupWeek;
  const vqbRows = teams.map((team) => ({ team, score: qbDefenseRatingForTeam(team) })).filter((row) => Number.isFinite(Number(row.score)));
  const vrbRows = teams.map((team) => ({ team, score: rbDefenseRatingForTeam(team) })).filter((row) => Number.isFinite(Number(row.score)));
  const vwrRows = teams.map((team) => ({ team, score: wrDefenseRatingForTeam(team) })).filter((row) => Number.isFinite(Number(row.score)));
  const vteRows = teams.map((team) => ({ team, score: teDefenseRatingForTeam(team) })).filter((row) => Number.isFinite(Number(row.score)));
  return teams.map((team) => {
    const stat = teamRankingsByTeam(team.team);
    const opponent = scheduleOpponent(team.team, week);
    const row = {
      team: team.team,
      opponent,
      vQB: qbDefenseRatingForTeam(team),
      vRB: rbDefenseRatingForTeam(team),
      vWR: wrDefenseRatingForTeam(team),
      vTE: teDefenseRatingForTeam(team),
      statVQB: stat?.passAllowedStatAvg || "",
      rushAllowed: stat?.rushAllowedStatAvg || "",
      passAllowed: stat?.passAllowedStatAvg || "",
      passTdAllowedRank: stat?.passTdAllowedRank || "",
      rushTdAllowedRank: stat?.rushTdAllowedRank || "",
    };
    row.vQBRank = rankNumber(vqbRows, (item) => item.score, { team, score: row.vQB }, false);
    row.vRBRank = rankNumber(vrbRows, (item) => item.score, { team, score: row.vRB }, false);
    row.vWRRank = rankNumber(vwrRows, (item) => item.score, { team, score: row.vWR }, false);
    row.vTERank = rankNumber(vteRows, (item) => item.score, { team, score: row.vTE }, false);
    return row;
  });
}

function matchupSortValue(row, key) {
  if (key === "team" || key === "opponent") return row[key] || "";
  return num(row[key], 9999);
}

function matchupWeightGroupsForKind(kind) {
  const groups = {
    vQB: ["IDL", "EDGE", "LB", "CB", "S"],
    vRB: ["IDL", "EDGE", "LB"],
    vWR: ["CB", "S"],
    vTE: ["EDGE", "LB", "S", "CB"],
  };
  return groups[kind] || [];
}

function weeklyMatchupDepthSlider(kind, group, depth) {
  const key = `${kind}_${group}${depth}`;
  const value = Math.round(num(state.weeklyMatchupWeights[key], defaultWeeklyMatchupWeights[key] ?? 0));
  return `
    <label class="formula-slider matchup-depth-slider ${value === 0 ? "disabled zero-weight" : ""} ${positionChipClass(group)}" title="${esc(group)}${esc(depth)} weight for ${esc(kind)}">
      <span>${esc(group)}${esc(depth)}</span>
      <b>${esc(value)}%</b>
      <input type="range" min="0" max="200" step="5" value="${esc(value)}" data-matchup-weight="${esc(key)}" />
    </label>
  `;
}

function matchupGroups(kind) {
  return matchupWeightGroupsForKind(kind).map((group) => ({ group, include: 5 }));
}

function renderWeeklyMatchupWeightControls() {
  const kind = state.weeklyMatchupWeightView || "vQB";
  const groups = matchupWeightGroupsForKind(kind);
  return `
    <section class="formula-control-panel matchup-weight-panel">
      <div class="formula-control-head">
        <div>
          <h3>Matchup Weights</h3>
          <span>Depth-specific inputs. Set a slot to 0% to exclude it.</span>
        </div>
        <select id="weekly-matchup-weight-view">
          ${["vQB", "vRB", "vWR", "vTE"].map((item) => `<option value="${item}" ${item === kind ? "selected" : ""}>${item} formula</option>`).join("")}
        </select>
      </div>
      <div class="matchup-weight-groups">
        ${groups.map((group) => `
          <div class="matchup-weight-row ${positionChipClass(group)}">
            <strong>${esc(group)}</strong>
            <div>${[1, 2, 3, 4, 5].map((depth) => weeklyMatchupDepthSlider(kind, group, depth)).join("")}</div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function matchupScoreForKind(team, kind) {
  if (kind === "vQB") return qbDefenseRatingForTeam(team);
  if (kind === "vRB") return rbDefenseRatingForTeam(team);
  if (kind === "vWR") return wrDefenseRatingForTeam(team);
  if (kind === "vTE") return teDefenseRatingForTeam(team);
  return "";
}

function matchupRankForKind(team, kind) {
  const teams = state.data?.teams || [];
  const rows = teams.map((item) => ({ team: item, score: matchupScoreForKind(item, kind) })).filter((row) => Number.isFinite(Number(row.score)));
  return rankNumber(rows, (item) => item.score, { team, score: matchupScoreForKind(team, kind) }, false);
}

function matchupDetailButton(value, kind, teamName, label = "") {
  return `<button class="matchup-detail-button" data-matchup-detail-team="${esc(teamName)}" data-matchup-detail-kind="${esc(kind)}" title="Show players used in ${esc(kind)}">${esc(label || fantasyDisplay(value, Number.isInteger(Number(value)) ? 0 : 1))}</button>`;
}

function matchupCell(row, key, kind, allRows, digits = 1) {
  const value = row[key];
  const values = allRows.map((item) => item[key]);
  const numeric = values.map(Number).filter(Number.isFinite);
  const style = numeric.length ? cfStyle(value, Math.min(...numeric), Math.max(...numeric), true) : "";
  return `<td class="num cf" ${style}>${matchupDetailButton(value, kind, row.team)}</td>`;
}

function matchupDetailRows(teamName, kind) {
  const team = teamByName(teamName);
  if (!team) return [];
  return matchupGroups(kind).map((config) => {
    const players = schedulePlayersFor(team.team, config.group).slice(0, 7);
    return {
      ...config,
      players: players.map((player, index) => ({
        player,
        included: index < config.include && matchupWeight(`${kind}_${config.group}${index + 1}`) > 0,
        weight: index < config.include ? matchupWeight(`${kind}_${config.group}${index + 1}`) : 0,
      })),
    };
  });
}

function renderMatchupDetailModal() {
  const detail = state.selectedMatchupDetail;
  if (!detail) return "";
  const team = teamByName(detail.team);
  if (!team) return "";
  const kind = detail.kind;
  const score = matchupScoreForKind(team, kind);
  const rank = matchupRankForKind(team, kind);
  const groups = matchupDetailRows(team.team, kind);
  const groupCards = groups.map((group) => `
    <section class="matchup-detail-group">
      <h3><span class="pos-chip ${positionChipClass(group.group)}">${esc(group.group)}</span> <span>${group.players.filter((item) => item.included).length} weighted</span></h3>
      <div class="matchup-player-list">
        ${group.players.map((item, index) => {
          const p = item.player;
          return `<div class="matchup-player-row ${item.included ? "" : "not-counted"}">
            <b>${esc(group.group)}${index + 1}</b>
            <span>${playerAvatar(p)} ${esc(p.player)}</span>
            <em>${ratingBadge(p.rating)}</em>
            <small>${item.included ? `${Math.round(item.weight * 100)}% weight` : "reference only"}</small>
          </div>`;
        }).join("") || "<p class='note'>No available players found for this group.</p>"}
      </div>
    </section>
  `).join("");
  return `
    <div class="modal matchup-detail-modal">
      <div class="modal-card matchup-detail-card">
        <button id="matchup-detail-close" class="modal-close" title="Close">x</button>
        <div class="player-hero enhanced">
          <div class="player-team-watermark">${teamLogo(team.team, team.teamAbbrev)}</div>
          ${teamLogo(team.team, team.teamAbbrev)}
          <div class="player-hero-copy">
            <h2>${esc(team.team)} ${esc(kind)}</h2>
            <p><span>Players counted in the matchup rating</span></p>
          </div>
          <div class="player-hero-rating">${ratingBadge(score)}<span>#${esc(rank || "-")} easiest</span></div>
        </div>
        <div class="metrics compact">
          ${metric("Rating", fantasyDisplay(score, 1), kind)}
          ${metric("Rank", rank ? `#${rank}` : "-", "lower is easier")}
          ${metric("Week", state.weeklyMatchupWeek === "auto" ? siteWeekLabel() : weekOptionLabel(state.weeklyMatchupWeek), "view")}
        </div>
        <div class="matchup-detail-grid">${groupCards}</div>
      </div>
    </div>
  `;
}

function renderWeeklyMatchups() {
  const allRows = matchupRows().filter((row) => matches(row));
  const sortKey = state.weeklyMatchupSort || "team";
  const rows = [...allRows].sort((a, b) => {
    const av = matchupSortValue(a, sortKey);
    const bv = matchupSortValue(b, sortKey);
    return Number.isFinite(Number(av)) && Number.isFinite(Number(bv))
      ? Number(av) - Number(bv)
      : String(av).localeCompare(String(bv));
  });
  const dataRows = rows.map((row) => `
    <tr>
      <td class="sticky-name">${teamCellFull(row.team)}</td>
      <td>${row.opponent ? teamCellFull(row.opponent) : "-"}</td>
      ${matchupCell(row, "vQB", "vQB", allRows, 1)}
      ${matchupCell(row, "vQBRank", "vQB", allRows, 0)}
      ${matchupCell(row, "vRB", "vRB", allRows, 1)}
      ${matchupCell(row, "vRBRank", "vRB", allRows, 0)}
      ${matchupCell(row, "vWR", "vWR", allRows, 1)}
      ${matchupCell(row, "vWRRank", "vWR", allRows, 0)}
      ${matchupCell(row, "vTE", "vTE", allRows, 1)}
      ${matchupCell(row, "vTERank", "vTE", allRows, 0)}
      ${fantasyCellWithClass(row.passAllowed, allRows.map((item) => item.passAllowed), true, 1)}
      ${fantasyCellWithClass(row.rushAllowed, allRows.map((item) => item.rushAllowed), true, 1)}
      ${fantasyCellWithClass(row.passTdAllowedRank, allRows.map((item) => item.passTdAllowedRank), true, 0, "rank-col")}
      ${fantasyCellWithClass(row.rushTdAllowedRank, allRows.map((item) => item.rushTdAllowedRank), true, 0, "rank-col")}
    </tr>
  `);
  setTimeout(() => {
    document.querySelector("#scan-team-rankings")?.addEventListener("click", scanTeamRankings);
    document.querySelector("#weekly-matchup-week")?.addEventListener("change", (event) => {
      state.weeklyMatchupWeek = event.target.value;
      storage.set("nflz-weekly-matchup-week", state.weeklyMatchupWeek);
      render();
    });
    document.querySelector("#weekly-matchup-weight-view")?.addEventListener("change", (event) => {
      state.weeklyMatchupWeightView = event.target.value;
      storage.set("nflz-weekly-matchup-weight-view", state.weeklyMatchupWeightView);
      render();
    });
    document.querySelectorAll("[data-matchup-detail-team]").forEach((button) => button.addEventListener("click", () => {
      state.selectedMatchupDetail = { team: button.dataset.matchupDetailTeam, kind: button.dataset.matchupDetailKind };
      render();
    }));
    document.querySelector("#matchup-detail-close")?.addEventListener("click", () => {
      state.selectedMatchupDetail = null;
      render();
    });
    document.querySelector(".matchup-detail-modal")?.addEventListener("click", (event) => {
      if (event.target.classList.contains("matchup-detail-modal")) {
        state.selectedMatchupDetail = null;
        render();
      }
    });
    if (state.selectedMatchupDetail) {
      document.onkeydown = (event) => {
        if (event.key === "Escape") {
          state.selectedMatchupDetail = null;
          render();
        }
      };
    }
    document.querySelectorAll("[data-matchup-sort]").forEach((button) => button.addEventListener("click", () => {
      state.weeklyMatchupSort = button.dataset.matchupSort;
      render();
    }));
    document.querySelectorAll("[data-matchup-weight]").forEach((input) => {
      input.addEventListener("input", () => {
        state.weeklyMatchupWeights[input.dataset.matchupWeight] = Number(input.value);
        storage.set("nflz-weekly-matchup-weights", state.weeklyMatchupWeights);
        const valueLabel = input.closest(".formula-slider")?.querySelector("b");
        if (valueLabel) valueLabel.textContent = `${input.value}%`;
        input.closest(".formula-slider")?.classList.toggle("disabled", Number(input.value) === 0);
        input.closest(".formula-slider")?.classList.toggle("zero-weight", Number(input.value) === 0);
      });
      input.addEventListener("change", () => {
        storage.set("nflz-weekly-matchup-weights", state.weeklyMatchupWeights);
        render();
      });
    });
    document.querySelector("#matchup-reset")?.addEventListener("click", () => {
      state.weeklyMatchupWeights = { ...defaultWeeklyMatchupWeights };
      storage.set("nflz-weekly-matchup-weights", state.weeklyMatchupWeights);
      render();
    });
    wireFantasyScroll();
  });
  const header = (label, key) => `<button class="fantasy-sort-header" data-matchup-sort="${esc(key)}" title="Click to sort ${esc(label)}. Lower rank means easier fantasy matchup."><span>${esc(label)}</span></button>`;
  return `
    <section class="panel fantasy-rank-panel weekly-matchups-panel">
      <div class="toolbar fantasy-rank-toolbar">
        <div>
          <h2>Weekly Matchups</h2>
          <p>Review the matchup ratings feeding weekly fantasy ranks. Lower matchup rating/rank is better for the offensive player facing that defense.</p>
        </div>
        <div class="filters">
          ${optionSelect("weekly-matchup-week", state.weeklyMatchupWeek, [["auto", `Auto: ${siteWeekLabel()}`], ...scheduleWeekOptions(false)])}
          <button id="matchup-reset" class="mini-action">Reset Weights</button>
          <button id="scan-team-rankings" class="mini-action primary" ${state.teamRankingsScanStatus === "checking" ? "disabled" : ""}>Scan Team Rankings</button>
        </div>
      </div>
      <div class="scan-strip">${teamRankingsStatusNote()}</div>
      ${renderWeeklyMatchupWeightControls()}
      <div class="table-scroll fantasy-rank-scroll">
        ${table([
          { label: header("Team", "team") },
          { label: header("Opp", "opponent") },
          { label: header("vQB", "vQB"), cls: "num" },
          { label: header("vQB Rank", "vQBRank"), cls: "num" },
          { label: header("vRB", "vRB"), cls: "num" },
          { label: header("vRB Rank", "vRBRank"), cls: "num" },
          { label: header("vWR", "vWR"), cls: "num" },
          { label: header("vWR Rank", "vWRRank"), cls: "num" },
          { label: header("vTE", "vTE"), cls: "num" },
          { label: header("vTE Rank", "vTERank"), cls: "num" },
          { label: header("Pass Allowed", "passAllowed"), cls: "num" },
          { label: header("Rush Allowed", "rushAllowed"), cls: "num" },
          { label: header("Pass TD Rank", "passTdAllowedRank"), cls: "num" },
          { label: header("Rush TD Rank", "rushTdAllowedRank"), cls: "num" },
        ], dataRows)}
      </div>
      ${renderMatchupDetailModal()}
    </section>
  `;
}

function fantasyTeamFilterOptions(rows) {
  const teams = [...new Set(rows.map((row) => row.team).filter(Boolean))]
    .sort((a, b) => teamAbbrevFor(a).localeCompare(teamAbbrevFor(b)));
  return [["All Teams", "All Teams"], ...teams.map((team) => [team, teamAbbrevFor(team)])];
}

function fantasyDepthFilterOptions(position) {
  if (position === "Defense" || position === "Kicker") return [["All Depths", "All Depths"]];
  return [
    ["All Depths", "All Depths"],
    ["Starters", "Starters"],
    ["Depth 1", "Depth 1"],
    ["Depth 1-2", "Depth 1-2"],
    ["Depth 1-3", "Depth 1-3"],
    ["Depth 1-4", "Depth 1-4"],
  ];
}

function fantasyRowPassesDepth(row, filter) {
  if (!filter || filter === "All Depths") return true;
  const depth = num(row.depth, 999);
  if (filter === "Starters" || filter === "Depth 1") return depth === 1;
  const match = String(filter).match(/Depth 1-(\d+)/);
  return match ? depth >= 1 && depth <= Number(match[1]) : true;
}

function fantasyApplyFilters(rows, position, teamFilter, depthFilter) {
  return rows.filter((row) => {
    const teamOk = !teamFilter || teamFilter === "All Teams" || normalizeTeamName(row.team) === normalizeTeamName(teamFilter);
    const depthOk = fantasyRowPassesDepth(row, depthFilter) || position === "Defense" || position === "Kicker";
    return teamOk && depthOk;
  });
}

function renderFantasyRanks(kind) {
  const isWeekly = kind === "weekly";
  const positionKey = isWeekly ? "weeklyFantasyPosition" : "seasonFantasyPosition";
  const viewKey = isWeekly ? "weeklyFantasyView" : "seasonFantasyView";
  const sortKey = isWeekly ? "weeklyFantasySort" : "seasonFantasySort";
  const directionKey = isWeekly ? "weeklyFantasySortDirection" : "seasonFantasySortDirection";
  const limitKey = isWeekly ? "weeklyFantasyLimit" : "seasonFantasyLimit";
  const depthFilterKey = isWeekly ? "weeklyFantasyDepthFilter" : "seasonFantasyDepthFilter";
  const teamFilterKey = isWeekly ? "weeklyFantasyTeamFilter" : "seasonFantasyTeamFilter";
  const titleText = isWeekly ? "Weekly Fantasy Rankings" : "Season Long Fantasy Rankings";
  const positions = fantasyRankPositions(kind);
  const normalizedPosition = normalizeFantasyPositionLabel(state[positionKey]);
  state[positionKey] = positions.includes(normalizedPosition) ? normalizedPosition : positions[0] || "QB";
  const isWeeklyQb = isWeekly && state[positionKey] === "QB";
  const item = fantasyRankItem(kind, state[positionKey]);
  const usesPpr = ["RB", "WR", "TE"].includes(state[positionKey]);
  const sortOptions = isWeekly
    ? [["score", usesPpr ? "FullPPR" : "Week Score"], ...(usesPpr ? [["halfPprScore", ".5PPR"], ["standardScore", "NoPPR"]] : []), ["scoreRank", "Week Rank"], ["seasonScore", "Season Production"], ["seasonRank", "Season Rank"], ["last5Score", "Last 5 Production"], ["last5Rank", "Last 5 Rank"], ["rating", "Player Rating"], ["depth", "Depth"]]
    : [["rank", "Rank"], ["score", usesPpr ? "Full Total" : "Total"], ["avgScore", "Avg/G"], ...(usesPpr ? [["fullPprScore", "Full Total"], ["fullPprAvg", "Full/G"], ["halfPprScore", ".5 Total"], ["halfPprAvg", ".5/G"], ["standardScore", "No Total"], ["standardAvg", "No/G"]] : []), ["extra:Season Difficulty", "Avg vPOS"], ["value", usesPpr ? "ADP Value" : "Value"], ["adp", "ADP"], ["rating", "Player Rating"], ["depth", "Depth"]];
  if (!sortOptions.some(([value]) => value === state[sortKey])) {
    state[sortKey] = isWeekly ? "score" : "rank";
    state[directionKey] = isWeekly ? "desc" : "asc";
  }
  const limits = [50, 75, 100, 150, 250, 500];
  const sourceRows = fantasyBoardRows(kind, state[positionKey], item.rows || []);
  const teamOptions = fantasyTeamFilterOptions(sourceRows);
  if (!teamOptions.some(([value]) => value === state[teamFilterKey])) state[teamFilterKey] = "All Teams";
  const depthOptions = fantasyDepthFilterOptions(state[positionKey]);
  if (!depthOptions.some(([value]) => value === state[depthFilterKey])) state[depthFilterKey] = "All Depths";
  const compareSet = new Set(state.weeklyFantasyCompareKeys);
  const comparedRows = isWeekly && state.weeklyFantasyCompareOnly ? sourceRows.filter((row) => compareSet.has(fantasyCompareKey(row))) : sourceRows;
  const filteredByControls = fantasyApplyFilters(comparedRows, state[positionKey], state[teamFilterKey], state[depthFilterKey]);
  const filtered = filteredByControls.filter((row) => !state.query || [row.player, row.team, row.opponent, row.position, Object.values(row.extras || {}).join(" ")].join(" ").toLowerCase().includes(state.query));
  const rows = fantasySortedRows(filtered, state[sortKey], state[directionKey]).slice(0, Number(state[limitKey]));
  const activeView = isWeeklyQb ? "regular" : isWeekly ? state[viewKey] : "regular";
  const columns = fantasyColumns(kind, state[positionKey], activeView);
  state._activeFantasyRows = filtered;
  const weekLabel = isWeekly ? esc(siteWeekLabel()) : "";
  const formulaNote = item.scoreFormulaSample ? item.scoreFormulaSample : "No score formula was stored in the exported sample for this sheet.";
  setTimeout(() => {
    wireSelect(`${kind}-fantasy-position`, positionKey);
    wireSelect(`${kind}-fantasy-view`, viewKey);
    wireSelect(`${kind}-fantasy-sort`, sortKey);
    wireSelect(`${kind}-fantasy-limit`, limitKey);
    wireSelect(`${kind}-fantasy-team`, teamFilterKey);
    wireSelect(`${kind}-fantasy-depth`, depthFilterKey);
    wireFantasyColumnSort(sortKey, directionKey, columns);
    document.querySelectorAll(".player-open").forEach((button) => button.addEventListener("click", () => {
      state.selectedPlayerKey = button.dataset.playerKey;
      render();
    }));
    wirePlayerModalControls();
    document.querySelector("#scan-team-rankings")?.addEventListener("click", scanTeamRankings);
    document.querySelector("#scan-snaps-stats")?.addEventListener("click", scanSnapsStats);
    document.querySelector("#scan-weekly-sources")?.addEventListener("click", scanWeeklyFantasySources);
    document.querySelector("#scan-fantasypros-adp")?.addEventListener("click", scanFantasyProsAdp);
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
    wireFantasyFavorites();
    document.querySelectorAll("[data-fantasy-schedule-detail]").forEach((button) => button.addEventListener("click", () => {
      state.fantasyScheduleDetail = { key: button.dataset.fantasyScheduleDetail, week: button.dataset.week };
      render();
    }));
  document.querySelectorAll("[data-close-fantasy-detail]").forEach((button) => button.addEventListener("click", (event) => {
    if (event.currentTarget.classList.contains("modal-backdrop") && event.target !== event.currentTarget) return;
    state.fantasyScheduleDetail = null;
    render();
  }));
    if (isWeeklyQb) wireWeeklyQbFormulaControls();
    if (isWeekly && ["RB", "WR", "TE"].includes(state[positionKey])) wireWeeklySkillFormulaControls();
    wireFantasyScroll();
  });
  return `
    <section class="panel fantasy-rank-panel">
      <div class="toolbar fantasy-rank-toolbar">
        <div>
          <h2>${titleText}${weekLabel ? ` <span>${weekLabel}</span>` : ""}</h2>
          <p>${esc(isWeekly ? `${item.sheet || ""} using current depth charts and selected week.` : "Generated from Weeks 1-17 weekly projections with season difficulty, total points, points per game, and FantasyPros ADP.")}</p>
        </div>
        <div class="filters">
          ${isWeekly ? `<button id="scan-team-rankings" class="mini-action primary" ${state.teamRankingsScanStatus === "checking" ? "disabled" : ""}>Scan Team Rankings</button>` : ""}
          ${isWeekly ? `<button id="scan-snaps-stats" class="mini-action" ${state.snapsStatsScanStatus === "checking" ? "disabled" : ""}>Scan Snaps & Stats</button>` : ""}
          ${isWeekly ? `<button id="scan-weekly-sources" class="mini-action" ${state.teamRankingsScanStatus === "checking" || state.snapsStatsScanStatus === "checking" ? "disabled" : ""}>Run Both Scans</button>` : ""}
          ${!isWeekly ? `<button id="scan-fantasypros-adp" class="mini-action primary" ${state.fantasyProsAdpScanStatus === "checking" ? "disabled" : ""}>Scan ADP</button>` : ""}
          ${isWeekly ? `<button id="weekly-compare-only" class="mini-action ${state.weeklyFantasyCompareOnly ? "primary" : ""}" ${state.weeklyFantasyCompareKeys.length ? "" : "disabled"}>${state.weeklyFantasyCompareOnly ? "Show All" : `Selected Only (${state.weeklyFantasyCompareKeys.length})`}</button>` : ""}
          ${isWeekly ? `<button id="weekly-compare-clear" class="mini-action" ${state.weeklyFantasyCompareKeys.length ? "" : "disabled"}>Clear Compare</button>` : ""}
          ${optionSelect(`${kind}-fantasy-position`, state[positionKey], positions)}
          ${optionSelect(`${kind}-fantasy-team`, state[teamFilterKey], teamOptions)}
          ${optionSelect(`${kind}-fantasy-depth`, state[depthFilterKey], depthOptions)}
          ${isWeekly && !isWeeklyQb ? optionSelect(`${kind}-fantasy-view`, state[viewKey], [["regular", "Regular"], ["last5", "Last 5"]]) : ""}
          ${!isWeeklyQb ? optionSelect(`${kind}-fantasy-sort`, state[sortKey], sortOptions) : ""}
          ${select(`${kind}-fantasy-limit`, state[limitKey], limits)}
        </div>
      </div>
      ${isWeekly ? `<div class="scan-strip">${teamRankingsStatusNote()}${snapsStatsStatusNote()}</div>` : `<div class="scan-strip">${fantasyProsAdpStatusNote()}</div>`}
      ${isWeeklyQb ? renderWeeklyQbFormulaControls(false) : ""}
      ${isWeekly ? renderWeeklySkillFormulaControls(state[positionKey], false) : ""}
      ${!isWeekly && state[positionKey] === "QB" ? renderWeeklyQbFormulaControls(true) : ""}
      ${!isWeekly && ["RB", "WR", "TE"].includes(state[positionKey]) ? renderWeeklySkillFormulaControls(state[positionKey], true) : ""}
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
    ${renderFantasyScheduleDetailModal()}
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

const fantasyTeamPositions = ["QB", "RB", "WR", "TE", "DST", "K"];
const fantasyTeamDepthTags = ["Starter", "Flex", "Bench", "IR", "Prospect"];
const fantasyTeamColors = ["#e8f3ff", "#edf8ee", "#fff4df", "#f2edff", "#ffecef", "#eef3f8"];

function fantasyLeagueDefaultRows() {
  const counts = { QB: 2, RB: 4, WR: 4, TE: 2, DST: 2, K: 2 };
  return fantasyTeamPositions.flatMap((position) => Array.from({ length: counts[position] }, (_, index) => ({
    id: uid("fantasy-row"),
    position,
    slot: `${position}${index + 1}`,
    tag: index === 0 ? "Starter" : "Bench",
    playerKey: "",
    playerName: "",
  })));
}

function fantasyLineupDefaultRows() {
  return ["QB", "RB", "RB", "WR", "WR", "TE", "FLEX", "DST", "K", "Bench", "Bench", "Bench", "Bench", "Bench", "Bench", "IR", "IR"].map((slot, index) => ({
    id: uid("lineup-row"),
    position: slot === "FLEX" ? "FLEX" : slot === "Bench" || slot === "IR" ? "Any" : slot,
    slot: slot === "FLEX" ? "FLEX" : slot,
    tag: slot === "IR" ? "IR" : slot === "Bench" ? "Bench" : slot === "FLEX" ? "Flex" : "Starter",
    playerKey: "",
    playerName: "",
    order: index,
  }));
}

function defaultFantasyTeams() {
  return [{
    id: uid("league"),
    name: "Fantasy Team 1",
    site: "Site",
    league: "League Name",
    color: fantasyTeamColors[0],
    activeView: "team",
    teamRows: fantasyLeagueDefaultRows(),
    lineupRows: fantasyLineupDefaultRows(),
  }];
}

function ensureFantasyTeams() {
  if (!savedFantasyTeams?.leagues?.length) {
    savedFantasyTeams = { leagues: defaultFantasyTeams() };
    storage.set("nflz-my-fantasy-teams", savedFantasyTeams);
  }
  savedFantasyTeams.leagues.forEach((league, index) => {
    league.id ||= uid("league");
    league.name ||= `Fantasy Team ${index + 1}`;
    league.site ||= "Site";
    league.league ||= "League Name";
    league.color ||= fantasyTeamColors[index % fantasyTeamColors.length];
    league.activeView ||= "team";
    league.teamRows ||= fantasyLeagueDefaultRows();
    league.lineupRows ||= fantasyLineupDefaultRows();
  });
  return savedFantasyTeams.leagues;
}

function saveFantasyTeams() {
  storage.set("nflz-my-fantasy-teams", savedFantasyTeams);
}

function fantasyTeamWeek() {
  return state.myFantasyWeek === "auto" ? selectedSiteWeek() : state.myFantasyWeek;
}

function fantasyRowDisplayPosition(row, player = null) {
  if (!row) return "";
  if (row.position === "Any" && player) return fantasyPositionForPlayer(player);
  if (row.position === "FLEX") return "FLEX";
  return row.position || "";
}

function fantasyPositionClass(position) {
  return `pos-${String(position || "any").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function fantasyPositionForPlayer(player) {
  if (!player) return "";
  const group = groupPosition(player.position);
  if (group === "Defense") return "DST";
  if (group === "Kicker") return "K";
  return group || player.position;
}

function fantasyPlayersForSlot(position) {
  const wanted = normalizeFantasyPositionLabel(position);
  if (position === "Any" || position === "FLEX") {
    return state.players.filter((player) => ["RB", "WR", "TE"].includes(groupPosition(player.position)) || position === "Any");
  }
  if (position === "DST") {
    return (state.data?.teams || []).map((team) => ({ player: `${team.teamAbbrev || teamAbbrevFor(team.team)} DST`, team: team.team, position: "Defense", teamAbbrev: team.teamAbbrev || teamAbbrevFor(team.team), rating: team.defenseAverage, depth: 1, _fantasyDefense: true }));
  }
  if (position === "K") return state.players.filter((player) => normalizeFantasyPositionLabel(player.position) === "Kicker");
  return state.players.filter((player) => normalizeFantasyPositionLabel(groupPosition(player.position) || player.position) === wanted);
}

function findFantasyTeamPlayer(row) {
  if (row.playerKey) return findPlayer(row.playerKey);
  if (!row.playerName) return null;
  if (row.position === "DST") {
    const team = teamByName(row.playerName.replace(/\s+DST$/i, "")) || teamByName(row.team);
    return team ? { player: `${team.teamAbbrev || teamAbbrevFor(team.team)} DST`, team: team.team, position: "Defense", teamAbbrev: team.teamAbbrev || teamAbbrevFor(team.team), rating: team.defenseAverage, depth: 1, _fantasyDefense: true } : null;
  }
  return findPlayerByName(row.playerName);
}

function fantasyWeeklyRowsFor(position) {
  const normalized = position === "DST" ? "Defense" : position === "K" ? "Kicker" : normalizeFantasyPositionLabel(position);
  return weeklyFantasyPlayerPool(normalized, fantasyRankItem("weekly", normalized)?.rows || [], fantasyTeamWeek());
}

function fantasyProjectionForPlayer(player, position) {
  if (!player) return null;
  const normalized = position === "DST" || player._fantasyDefense ? "Defense" : position === "K" ? "Kicker" : normalizeFantasyPositionLabel(groupPosition(player.position) || position);
  const rows = fantasyWeeklyRowsFor(normalized);
  if (normalized === "Defense") return rows.find((row) => normalizeTeamName(row.team) === normalizeTeamName(player.team)) || null;
  return rows.find((row) => row._playerKey === sourceKey(player) || fantasyMergeKey(row.player) === fantasyMergeKey(player.player)) || null;
}

function fantasyUsageRank(row) {
  if (!row) return "";
  return fantasyDetailValue(row, "Total Bonuses RANK")
    || fantasyDetailValue(row, "!!LAST 5!!\nTotal Bonuses RANK")
    || fantasyDetailValue(row, "FullPPR Rank")
    || row.scoreRank
    || "";
}

function fantasySourceValues(position, key) {
  const normalized = position === "DST" ? "Defense" : position === "K" ? "Kicker" : normalizeFantasyPositionLabel(position);
  return fantasyWeeklyRowsFor(normalized).map((item) => {
    if (key === "scoreRank") return item.scoreRank;
    if (key === "score") return item.score;
    if (key === "usage") return fantasyUsageRank(item);
    if (String(key || "").startsWith("extra:")) return fantasyDetailValue(item, key.slice(6));
    return item[key];
  }).filter((value) => Number.isFinite(Number(value)));
}

function fantasySourceStyle(position, key, value, reverse = false) {
  const values = fantasySourceValues(position, key);
  if (!Number.isFinite(Number(value)) || !values.length) return "";
  return cfStyle(value, Math.min(...values), Math.max(...values), reverse);
}

function fantasyContextChips(row, position) {
  if (!row) return "";
  const labels = position === "QB"
    ? ["OL Rank", "PPG Rank", "WR Group Rank"]
    : position === "RB"
      ? ["OL Rank", "YPG Rank", "PPG Rank", "Game Script", "Team Total"]
      : position === "DST"
        ? ["Defense Rank", "Sacks Rank", "Takeaways Rank", "Opp PPG Rank"]
        : position === "K"
          ? ["Team Offense Rank", "Go For It Penalty", "Kicker Stadium Tier"]
          : ["QB Rank", "PPG Rank", "YPG Rank", "Game Script", "Team Total"];
  return labels.map((label) => {
    const fixed = label === "YPG Rank" ? "Team YPG Rank" : label;
    const value = fantasyDetailValue(row, fixed);
    const reverse = /rank/i.test(label) || ["Go For It Penalty"].includes(label);
    const style = fantasySourceStyle(position, `extra:${fixed}`, value, reverse);
    const shortLabel = {
      "OL Rank": "OL",
      "PPG Rank": "PPG",
      "WR Group Rank": "WRs",
      "YPG Rank": "YPG",
      "QB Rank": "QB",
      "Defense Rank": "DEF",
      "Sacks Rank": "Sacks",
      "Takeaways Rank": "Take",
      "Opp PPG Rank": "Opp PPG",
      "Team Offense Rank": "Off",
      "Go For It Penalty": "4th",
      "Kicker Stadium Tier": "Stadium",
    }[label] || label;
    return value === "" || value === undefined ? "" : `<span ${style}><b>${esc(shortLabel)}</b>${esc(fantasyDisplay(value, Number.isFinite(Number(value)) && Math.abs(Number(value)) < 10 ? 1 : 0))}</span>`;
  }).join("");
}

function fantasyRowDatalistId(leagueId, view, rowId) {
  return `fantasy-list-${leagueId}-${view}-${rowId}`.replace(/[^a-zA-Z0-9_-]/g, "");
}

function fantasyCompatibleRowForPlayer(row, player) {
  if (!player) return false;
  const playerPos = fantasyPositionForPlayer(player);
  if (row.position === "Any") return true;
  if (row.position === "FLEX") return ["RB", "WR", "TE"].includes(playerPos);
  return normalizeFantasyPositionLabel(row.position) === normalizeFantasyPositionLabel(playerPos);
}

function fantasyCounterpartRows(league, view) {
  return view === "lineup" ? league.teamRows : league.lineupRows;
}

function fantasyFindCounterpartRow(league, view, row, player) {
  const rows = fantasyCounterpartRows(league, view);
  if (!rows) return null;
  if (row.linkedRowId) {
    const linked = rows.find((item) => item.id === row.linkedRowId);
    if (linked) return linked;
  }
  if (row.playerKey) {
    const byPlayer = rows.find((item) => item.playerKey === row.playerKey);
    if (byPlayer) return byPlayer;
  }
  return rows.find((item) => !item.playerKey && !item.playerName && fantasyCompatibleRowForPlayer(item, player)) || null;
}

function fantasyCreateCounterpartRow(league, view, row, player) {
  const rows = fantasyCounterpartRows(league, view);
  const playerPos = fantasyPositionForPlayer(player);
  if (view === "lineup") {
    const count = league.teamRows.filter((item) => item.position === playerPos).length + 1;
    const next = { id: uid("fantasy-row"), position: playerPos, slot: `${playerPos}${count}`, tag: row.tag || "Bench", playerKey: "", playerName: "" };
    rows.push(next);
    return next;
  }
  const next = { id: uid("lineup-row"), position: playerPos, slot: "Bench", tag: "Bench", playerKey: "", playerName: "", order: rows.length };
  rows.push(next);
  return next;
}

function syncFantasyRowToOtherView(league, view, row) {
  const player = findFantasyTeamPlayer(row);
  if (!league || !row || !player || !row.playerKey) return;
  const counterpart = fantasyFindCounterpartRow(league, view, row, player) || fantasyCreateCounterpartRow(league, view, row, player);
  row.linkedRowId = counterpart.id;
  counterpart.linkedRowId = row.id;
  counterpart.playerKey = row.playerKey;
  counterpart.playerName = row.playerName || player.player;
  if (row.tag && counterpart.tag !== "IR") counterpart.tag = row.tag;
}

function fantasyPositionSpans(rows) {
  const spans = new Map();
  let start = 0;
  while (start < rows.length) {
    const player = findFantasyTeamPlayer(rows[start]);
    const pos = fantasyRowDisplayPosition(rows[start], player);
    let end = start + 1;
    while (end < rows.length) {
      const nextPlayer = findFantasyTeamPlayer(rows[end]);
      if (fantasyRowDisplayPosition(rows[end], nextPlayer) !== pos) break;
      end += 1;
    }
    spans.set(rows[start].id, { label: pos, span: end - start });
    for (let i = start + 1; i < end; i += 1) spans.set(rows[i].id, null);
    start = end;
  }
  return spans;
}

function fantasyTeamRow(league, view, row, index, visibleRows, spanInfo = undefined) {
  const player = findFantasyTeamPlayer(row);
  const position = fantasyRowDisplayPosition(row, player);
  const projection = fantasyProjectionForPlayer(player, position);
  const opponent = projection?.opponent ? teamAbbrevFor(projection.opponent, projection.opponent) : "";
  const team = player?.team ? teamAbbrevFor(player.team, player.teamAbbrev || player.team) : "";
  const vposLabel = position === "QB" ? "Matchup Rating (Low is good)" : position === "RB" ? "Opp vRB Rank" : position === "WR" ? "Opp vWR Rank" : position === "TE" ? "Opp vTE Rank" : position === "DST" ? "Opponent Off Rank" : "Team Offense Rank";
  const vpos = projection ? fantasyDetailValue(projection, vposLabel) : "";
  const datalistId = fantasyRowDatalistId(league.id, view, row.id);
  const options = fantasyPlayersForSlot(row.position).slice(0, 700);
  const rowClass = row.tag === "Flex" ? "flex" : String(row.tag || "").toLowerCase();
  const scoreStyle = projection ? fantasySourceStyle(position, "score", projection.score, false) : "";
  const rankStyle = projection ? fantasySourceStyle(position, "scoreRank", projection.scoreRank, true) : "";
  const vposStyle = projection ? fantasySourceStyle(position, `extra:${vposLabel}`, vpos, true) : "";
  const usage = fantasyUsageRank(projection);
  const usageStyle = projection ? fantasySourceStyle(position, "usage", usage, true) : "";
  const posCell = spanInfo === undefined
    ? `<td class="pos-rail ${fantasyPositionClass(position)}">${index === 0 || visibleRows[index - 1]?.position !== row.position ? esc(position) : ""}</td>`
    : spanInfo ? `<td class="pos-rail ${fantasyPositionClass(position)}" rowspan="${spanInfo.span}">${esc(spanInfo.label)}</td>` : "";
  return `
    <tr class="my-team-row tag-${rowClass}">
      ${posCell}
      <td><input class="slot-input" data-fantasy-field="slot" data-league-id="${esc(league.id)}" data-view="${esc(view)}" data-row-id="${esc(row.id)}" value="${esc(row.slot || "")}" /></td>
      <td>${optionSelect(`tag-${league.id}-${view}-${row.id}`, row.tag || "Bench", fantasyTeamDepthTags.map((item) => [item, item])).replace("<select", `<select class="fantasy-tag tag-${rowClass}" data-fantasy-field="tag" data-league-id="${esc(league.id)}" data-view="${esc(view)}" data-row-id="${esc(row.id)}"`)}
      </td>
      <td class="fantasy-roster-player">
        <div class="fantasy-player-input-wrap">
          ${player ? playerAvatar(player) : playerAvatar({ player: "?" })}
          <input list="${datalistId}" data-fantasy-field="playerName" data-league-id="${esc(league.id)}" data-view="${esc(view)}" data-row-id="${esc(row.id)}" value="${esc(row.playerName || player?.player || "")}" placeholder="Type player name" />
          ${player ? `<button class="fantasy-player-card-open player-open" data-player-key="${esc(sourceKey(player))}" title="Open player card">Card</button>` : ""}
          <datalist id="${datalistId}">${options.map((item) => `<option value="${esc(item.player)}">${esc(`${item.player} - ${teamAbbrevFor(item.team, item.teamAbbrev || item.team)} ${fantasyPositionForPlayer(item)}`)}</option>`).join("")}</datalist>
        </div>
      </td>
      <td>${esc(team || "-")}</td>
      <td>${esc(opponent || "-")}</td>
      <td class="num" ${rankStyle}>${esc(fantasyDisplay(projection?.scoreRank, 0))}</td>
      <td class="num" ${vposStyle}>${esc(fantasyDisplay(vpos, 0))}</td>
      <td class="num" ${usageStyle}>${esc(fantasyDisplay(usage, 0))}</td>
      <td class="num score-pill" ${scoreStyle}>${esc(fantasyDisplay(projection?.score, 1))}</td>
      <td><div class="fantasy-extra-chips compact">${fantasyContextChips(projection, position)}</div></td>
      <td class="my-fantasy-delete-cell"><button class="mini-action danger my-fantasy-delete" data-fantasy-delete-row="${esc(row.id)}" data-league-id="${esc(league.id)}" data-view="${esc(view)}" title="Remove row">x</button></td>
    </tr>
  `;
}

function renderFantasyLeagueCard(league) {
  const view = league.activeView || "team";
  const rows = view === "lineup" ? league.lineupRows : league.teamRows;
  const grouped = view === "team" ? [...rows].sort((a, b) => fantasyTeamPositions.indexOf(a.position) - fantasyTeamPositions.indexOf(b.position) || String(a.slot).localeCompare(String(b.slot))) : rows;
  const spans = fantasyPositionSpans(grouped);
  return `
    <article class="my-fantasy-card" style="--league-bg:${esc(league.color || "#e8f3ff")}">
      <div class="depth-team-head my-fantasy-head">
        <h3><input data-fantasy-league-field="name" data-league-id="${esc(league.id)}" value="${esc(league.name)}" /></h3>
        <div class="league-meta">
          <input data-fantasy-league-field="league" data-league-id="${esc(league.id)}" value="${esc(league.league)}" />
          <input data-fantasy-league-field="site" data-league-id="${esc(league.id)}" value="${esc(league.site)}" />
          <input type="color" data-fantasy-league-field="color" data-league-id="${esc(league.id)}" value="${esc(league.color || "#e8f3ff")}" />
        </div>
      </div>
      <div class="my-fantasy-view-tabs">
        <button class="${view === "team" ? "active" : ""}" data-fantasy-view="team" data-league-id="${esc(league.id)}">Team View</button>
        <button class="${view === "lineup" ? "active" : ""}" data-fantasy-view="lineup" data-league-id="${esc(league.id)}">Lineup View</button>
        ${optionSelect(`add-position-${league.id}`, "RB", [["QB", "QB"], ["RB", "RB"], ["WR", "WR"], ["TE", "TE"], ["DST", "DST"], ["K", "K"], ["Bench", "Bench"], ["IR", "IR"], ...(view === "lineup" ? [["FLEX", "FLEX"]] : [])]).replace("<select", `<select class="fantasy-add-position" data-league-id="${esc(league.id)}" data-view="${esc(view)}"`)}
        <button class="mini-action" data-fantasy-add-row="${esc(league.id)}" data-view="${esc(view)}">Add Row</button>
      </div>
      <div class="table-scroll my-fantasy-scroll">
        <table class="my-fantasy-table">
          <thead><tr><th>Pos</th><th>Slot</th><th>Tag</th><th>Player</th><th>Team</th><th>Opp</th><th>Score Rank</th><th>vPOS</th><th>Usage Rank</th><th>Week Score</th><th>Team Context</th><th></th></tr></thead>
          <tbody>${grouped.map((row, index) => fantasyTeamRow(league, view, row, index, grouped, spans.get(row.id))).join("")}</tbody>
        </table>
      </div>
    </article>
  `;
}

function wireMyFantasyTeams() {
  document.querySelector("#my-fantasy-week")?.addEventListener("change", (event) => {
    state.myFantasyWeek = event.target.value;
    storage.set("nflz-my-fantasy-week", state.myFantasyWeek);
    render();
  });
  document.querySelector("#my-fantasy-league-view")?.addEventListener("change", (event) => {
    state.myFantasyLeagueView = event.target.value;
    storage.set("nflz-my-fantasy-league-view", state.myFantasyLeagueView);
    render();
  });
  document.querySelector("#my-fantasy-add-league")?.addEventListener("click", () => {
    const leagues = ensureFantasyTeams();
    leagues.push({ ...defaultFantasyTeams()[0], id: uid("league"), name: `Fantasy Team ${leagues.length + 1}`, color: fantasyTeamColors[leagues.length % fantasyTeamColors.length] });
    saveFantasyTeams();
    render();
  });
  document.querySelectorAll("[data-fantasy-league-field]").forEach((input) => {
    input.addEventListener("change", () => {
      const league = ensureFantasyTeams().find((item) => item.id === input.dataset.leagueId);
      if (!league) return;
      league[input.dataset.fantasyLeagueField] = input.value;
      saveFantasyTeams();
      render();
    });
  });
  document.querySelectorAll("[data-fantasy-view]").forEach((button) => button.addEventListener("click", () => {
    const league = ensureFantasyTeams().find((item) => item.id === button.dataset.leagueId);
    if (!league) return;
    league.activeView = button.dataset.fantasyView;
    saveFantasyTeams();
    render();
  }));
  document.querySelectorAll("[data-fantasy-field]").forEach((input) => {
    input.addEventListener("change", () => {
      const league = ensureFantasyTeams().find((item) => item.id === input.dataset.leagueId);
      const rows = input.dataset.view === "lineup" ? league?.lineupRows : league?.teamRows;
      const row = rows?.find((item) => item.id === input.dataset.rowId);
      if (!row) return;
      row[input.dataset.fantasyField] = input.value;
      if (input.dataset.fantasyField === "playerName") {
        const player = findPlayerByName(input.value);
        row.playerKey = player ? sourceKey(player) : "";
        row.playerName = player?.player || input.value;
        if (row.position === "Any" && player) row.position = fantasyPositionForPlayer(player);
      }
      syncFantasyRowToOtherView(league, input.dataset.view, row);
      saveFantasyTeams();
      render();
    });
  });
  document.querySelectorAll("[data-fantasy-add-row]").forEach((button) => button.addEventListener("click", () => {
    const league = ensureFantasyTeams().find((item) => item.id === button.dataset.fantasyAddRow);
    const view = button.dataset.view;
    const position = document.querySelector(`.fantasy-add-position[data-league-id="${CSS.escape(league.id)}"][data-view="${CSS.escape(view)}"]`)?.value || "RB";
    const rows = view === "lineup" ? league.lineupRows : league.teamRows;
    const basePosition = position === "Bench" || position === "IR" ? "Any" : position;
    const row = { id: uid(view === "lineup" ? "lineup-row" : "fantasy-row"), position: basePosition, slot: position, tag: position === "IR" ? "IR" : position === "FLEX" ? "Flex" : position === "Bench" ? "Bench" : "Starter", playerKey: "", playerName: "", order: rows.length };
    rows.push(row);
    const otherRows = fantasyCounterpartRows(league, view);
    const other = view === "lineup"
      ? { id: uid("fantasy-row"), position: basePosition === "Any" ? "RB" : basePosition === "FLEX" ? "RB" : basePosition, slot: basePosition === "Any" || basePosition === "FLEX" ? "Bench" : `${basePosition}${otherRows.filter((item) => item.position === basePosition).length + 1}`, tag: row.tag, playerKey: "", playerName: "", linkedRowId: row.id }
      : { id: uid("lineup-row"), position: basePosition, slot: position === "IR" ? "IR" : "Bench", tag: position === "IR" ? "IR" : "Bench", playerKey: "", playerName: "", order: otherRows.length, linkedRowId: row.id };
    row.linkedRowId = other.id;
    otherRows.push(other);
    saveFantasyTeams();
    render();
  }));
  document.querySelectorAll("[data-fantasy-delete-row]").forEach((button) => button.addEventListener("click", () => {
    const league = ensureFantasyTeams().find((item) => item.id === button.dataset.leagueId);
    const key = button.dataset.fantasyDeleteRow;
    if (!league) return;
    const prop = button.dataset.view === "lineup" ? "lineupRows" : "teamRows";
    league[prop] = league[prop].filter((row) => row.id !== key);
    saveFantasyTeams();
    render();
  }));
  document.querySelectorAll(".my-fantasy-panel .player-open").forEach((button) => button.addEventListener("click", () => {
    state.selectedPlayerKey = button.dataset.playerKey;
    render();
  }));
}

function renderStartSit() {
  const leagues = ensureFantasyTeams();
  const weekOptions = [["auto", `Auto: ${siteWeekLabel()}`], ...scheduleWeekOptions(false)];
  const leagueOptions = [["all", "All Leagues"], ...leagues.map((league) => [league.id, league.name])];
  const visible = state.myFantasyLeagueView === "all" ? leagues : leagues.filter((league) => league.id === state.myFantasyLeagueView);
  if (!visible.length) state.myFantasyLeagueView = "all";
  setTimeout(() => {
    wireMyFantasyTeams();
    wireFantasyScroll();
  });
  return `
    <section class="panel my-fantasy-panel">
      <div class="toolbar">
        <div>
          <h2>My Fantasy Teams <span>${esc(weekOptionLabel(fantasyTeamWeek()))}</span></h2>
          <p>Build your fantasy rosters, then pull the weekly Model Z context into every slot.</p>
        </div>
        <div class="filters">
          ${optionSelect("my-fantasy-week", state.myFantasyWeek, weekOptions)}
          ${optionSelect("my-fantasy-league-view", state.myFantasyLeagueView, leagueOptions)}
          <button id="my-fantasy-add-league" class="mini-action primary">Add Fantasy Team</button>
        </div>
      </div>
      <div class="my-fantasy-grid">${visible.map(renderFantasyLeagueCard).join("")}</div>
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
    if (key === "suggestedDelta") return num(item.suggestedDelta, -999);
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
  persistPlayer(item.player, { rating: item.suggested, newRating: item.suggested, ratingChangeType: "PFF import", ratingChangeNote: item.row?.rank ? `PFF #${item.row.rank}${item.row.total ? `/${item.row.total}` : ""}` : "PFF suggestion" });
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

function renderPffImportPanel() {
  const position = cleanPffPosition(state.pffPastePosition || "EDGE");
  const importedRows = pffManualRows()
    .filter((row) => groupPosition(row.modelPosition || row.pffPosition) === position)
    .sort((a, b) => num(a.rank, 999) - num(b.rank, 999));
  const previewRows = importedRows.slice(0, 12).map((row) => `<tr>
    <td class="num">#${esc(row.rank)}</td>
    <td>${esc(row.name || row.player)}</td>
    <td>${esc(row.team)}</td>
    <td class="num">${fmt(row.grade, 1)}</td>
    <td class="num">${row.snaps ? fmt(row.snaps, 0) : "-"}</td>
    <td class="num">${Number.isFinite(Number(row.snapPercentile)) ? `${fmt(row.snapPercentile, 0)}%` : "-"}</td>
  </tr>`).join("");
  return `<section class="formula-card pff-import-panel">
    <div class="toolbar"><h3>PFF Rank Paste</h3>${optionSelect("pff-paste-position", position, pffPastePositions)}</div>
    <textarea id="pff-paste-text" class="pff-paste-box compact" placeholder="Paste the full PFF position table here. It can be the copied page text or tab-separated table."></textarea>
    <div class="depth-top-actions"><button id="pff-import-paste" class="mini-action primary">Import PFF Ranks</button><button id="pff-clear-imports" class="mini-action danger">Clear All PFF Imports</button><a class="mini-action" href="https://www.pff.com/nfl/grades/position/ed" target="_blank" rel="noreferrer">Open PFF</a></div>
    ${state.pffManualNotice ? `<p class="depth-check-note depth-check-success">${esc(state.pffManualNotice)}</p>` : ""}
    <div class="pff-import-summary">
      <strong>${importedRows.length ? `${importedRows.length} ${esc(position)} rows currently imported` : `No ${esc(position)} PFF rows imported yet`}</strong>
      <span>${importedRows.length ? "These rows feed PFF Review and Madden Comparison immediately." : "Paste a PFF position table above, then click Import PFF Ranks."}</span>
      ${importedRows.length ? `<div class="table-scroll pff-import-summary-scroll"><table><thead><tr><th>Rank</th><th>Player</th><th>Team</th><th>Grade</th><th>Snaps</th><th>Snap Pct</th></tr></thead><tbody>${previewRows}</tbody></table></div>` : ""}
    </div>
  </section>`;
}

function renderPff() {
  const reviewAll = buildPffReviewRows().filter((item) => matches({ ...item.row, matched: item.player?.player || "" }));
  const selectedPffPosition = cleanPffPosition(state.pffPastePosition || "EDGE");
  const selectedReviewAll = reviewAll.filter((item) => groupPosition(item.row.modelPosition || item.row.pffPosition) === selectedPffPosition);
  const oldRows = state.data.pff.filter(matches).sort((a, b) => Math.abs(num(b.delta)) - Math.abs(num(a.delta))).slice(0, 160).map((p) => {
    const delta = num(p.delta);
    return `<tr><td>${p.position}</td><td>${p.player}</td><td class="num">${fmt(p.pff, 0)}</td><td class="num">${fmt(p.oldRating, 0)}</td><td class="num">${fmt(p.newRating, 0)}</td><td class="num delta ${delta >= 0 ? "plus" : "minus"}">${delta > 0 ? "+" : ""}${fmt(delta, 0)}</td></tr>`;
  });
  if (state.pffView === "madden") {
    setTimeout(() => {
      document.querySelector("#pff-paste-position")?.addEventListener("change", (event) => { state.pffPastePosition = cleanPffPosition(event.target.value); render(); });
      document.querySelector("#pff-import-paste")?.addEventListener("click", importPffPaste);
      document.querySelector("#pff-clear-imports")?.addEventListener("click", clearPffImports);
      document.querySelectorAll("[data-pff-view]").forEach((button) => button.addEventListener("click", () => { state.pffView = button.dataset.pffView; state.pffLimit = 500; render(); }));
    });
    return `<section class="panel pff-review-panel">
      <div class="toolbar fantasy-rank-toolbar">
        <div><h2>PFF Update</h2><p>PFF is the main weekly ratings review. Madden comparison is kept here as a secondary check.</p></div>
      </div>
      <div class="live-tabs pff-tabs">
        ${[["review", `PFF Review ${reviewAll.length}`], ["recent", `Recently Adjusted ${Object.keys(pffRecentAdjustments).length}`], ["madden", "Madden Comparison"], ["workbook", "Workbook Import"]].map(([id, label]) => `<button class="${state.pffView === id ? "active" : ""}" data-pff-view="${id}">${esc(label)}</button>`).join("")}
      </div>
      ${renderPffImportPanel()}
      <div class="pff-secondary-view">${renderMadden()}</div>
    </section>`;
  }
  const viewRows = state.pffView === "workbook" ? [] : state.pffView === "recent" ? reviewAll.filter((item) => item.key && pffRecentAdjustments[item.key]) : selectedReviewAll;
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
    document.querySelector("#pff-paste-position")?.addEventListener("change", (event) => { state.pffPastePosition = cleanPffPosition(event.target.value); render(); });
    document.querySelector("#pff-import-paste")?.addEventListener("click", importPffPaste);
    document.querySelector("#pff-clear-imports")?.addEventListener("click", clearPffImports);
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
      <div><h2>PFF Update</h2><p>PFF-only suggested rating review for ${esc(selectedPffPosition)}, weighted by percentile, snaps, position profile, and current rating range.</p></div>
      <div class="filters">
        ${actionableCount ? `<button id="pff-approve-suggested" class="mini-action primary">Approve Visible Suggested (${actionableCount})</button>` : ""}
        ${Object.keys(pffRecentAdjustments).length ? `<button id="pff-clear-recent" class="mini-action">Clear Recent (${Object.keys(pffRecentAdjustments).length})</button>` : ""}
      </div>
    </div>
    <div class="live-tabs pff-tabs">
      ${[["review", `PFF Review ${reviewAll.length}`], ["recent", `Recently Adjusted ${Object.keys(pffRecentAdjustments).length}`], ["madden", "Madden Comparison"], ["workbook", "Workbook Import"]].map(([id, label]) => `<button class="${state.pffView === id ? "active" : ""}" data-pff-view="${id}">${esc(label)}</button>`).join("")}
    </div>
    ${state.pffView !== "workbook" ? `
      ${renderPffImportPanel()}
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
    "nflz-injury-resolved-results": "Injury check resolved history",
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
  const stringFallbacks = ["ratingHistoryStartAt"];
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    source: "Browser local storage backup",
    data: Object.fromEntries(Object.entries(backupKeys).map(([name, key]) => [name, storage.get(key, stringFallbacks.includes(name) ? "" : objectFallbacks.includes(name) ? {} : [])])),
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

function disableMobileTextAssist(root = document) {
  root.querySelectorAll("input, textarea").forEach((field) => {
    const hint = `${field.id || ""} ${field.name || ""} ${field.placeholder || ""}`.toLowerCase();
    if (field.type === "search" || hint.includes("player") || hint.includes("search")) {
      field.setAttribute("autocomplete", "off");
      field.setAttribute("autocorrect", "off");
      field.setAttribute("autocapitalize", "none");
      field.setAttribute("spellcheck", "false");
    }
  });
}

function render() {
  scheduleProjectionCache = new Map();
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
    weeklyMatchups: renderWeeklyMatchups,
    weeklyFantasy: () => renderFantasyRanks("weekly"),
    seasonFantasy: () => renderFantasyRanks("season"),
    statRanks: renderStatRanks,
    madden: renderMadden,
    data: renderDataSettings,
    start: renderStartSit,
    pff: renderPff,
    gameSim: renderGameSimulator,
    qb: renderQb,
  };
  content.innerHTML = views[state.page]();
  disableMobileTextAssist(content);
  disableMobileTextAssist(document.querySelector(".topbar") || document);
  content.querySelectorAll("[data-page]").forEach((button) => button.addEventListener("click", () => {
    state.page = button.dataset.page;
    render();
  }));
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
  if (isScheduleInteractiveTarget(event.target)) return;
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
  if (isScheduleInteractiveTarget(event.target)) return;
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
  const staleFreeAgentFixes = repairStaleOurLadsFreeAgentOverrides(data);
  const knownRosterFixes = repairKnownRosterExceptions(data);
  state.players = applyOverrides(data.players);
  const repairNotes = [];
  if (staleFreeAgentFixes) repairNotes.push(`${staleFreeAgentFixes} stale OurLads Free Agent override${staleFreeAgentFixes === 1 ? "" : "s"}`);
  if (knownRosterFixes) repairNotes.push(`${knownRosterFixes} known roster exception${knownRosterFixes === 1 ? "" : "s"}`);
  if (repairNotes.length) state.depthCheckNotice = `Repaired ${repairNotes.join(" and ")} from saved depth chart data.`;
  render();
}).catch(() => {
  content.innerHTML = `<section class="panel"><h2>Data did not load</h2><p class="note">Serve this folder locally so the browser can read data.json.</p></section>`;
});


