# NFL Model Z App Notes

## Pages Built
- Live Rankings: renamed from `Live Rankings!`; team score board fed by the existing workbook outputs.
- Depth Charts: player/team/position view with rating, depth, stars, thumb, and injury fields.
- Top 30s by Position: position-group boards sourced from Depth Charts ratings.
- Sim Schedule: matchup rows sourced from the sim schedule outputs.
- Sim Standings: standings table sourced from sim schedule rollups.
- Start 'Em, Sit 'Em: first-pass player decision board using core rating/depth data.
- PFF Update: import/delta workflow with old rating, new rating, and rating movement.
- H2H QB Challenge: renamed from `H2H QB Exercise` and placed as low-priority navigation.

## Second Pass Updates
- H2H QB Challenge is now a pairwise comparison tool with user name, selectable position, selectable depth limit, saved boards, and side-by-side comparison with hover highlighting.
- Live Rankings now has three subviews: Overview (`O`, `P`, `Q`, `R`, `U`, `V`, `AC:AN`), View Starters (`BI:BZ`, `CB:CK`, `CN:DO`), and Position Scores (`DP:EW`). Overview columns are sortable.
- Depth Charts now defaults to Team -> Position # -> Depth, supports manual rating edits, applies the thumbs/star math locally, marks rookies, and opens a player detail modal.
- Top 30s now supports position/all-position filtering, top-N selection, team abbreviations, player modal links, conditional rating chips, and tie-aware ranks.
- Sim Schedule now supports season, week, and team views; labels `F` as visitor and `K` as home; exposes `A:N`, `U`, `AL:AO`, and a local official pick control.
- Sim Standings now has Full League, Divisional, Playoff, and Playoff Bracket views.
- Start 'Em, Sit 'Em now extracts roster blocks from the workbook and supports drag-based lineup ordering.
- PFF Import keeps the original rating-delta intent visible and tied to the workbook formula.

## Third Pass Updates
- Live Rankings Overview now uses Excel column IDs for sorting and rendering, which fixes missing values caused by duplicate header names.
- Live Rankings subviews are horizontal, scrollable tables with conditional formatting on numeric cells.
- View Starters now shows every extracted starter slot as its own column with light separators between position groups.
- Position Scores now shows both the numeric score and workbook letter grade.
- Depth Charts now includes injury status and injury week controls, nudge undo, popup nudges, position rank, and PFF import context.
- Top 30s position options follow Position # order and include larger result limits up to 1000.
- Sim Schedule filters use stable values with capitalized labels, numeric week ordering, and conditional formatting for OVR, HFA, and odds.
- Sim Standings adds stronger conditional formatting, cleaner playoff seed display, and a bracket-style playoff view.
- H2H Challenge now hides ratings and uses adaptive repeated pairings based on the current ranked slots.

## Model Flow
1. Depth Charts is the primary source of player talent.
2. PFF Update computes rating deltas against existing Depth Charts ratings.
3. Position Weights rolls player and position scores into team talent areas.
4. Live Rankings converts team talent into offense, defense, overall, and sim-ready numbers.
5. Team #s for Sim, Sim Schedule, and Sim Standings consume Live Rankings outputs.
6. Weekly/Fantasy rank tabs feed Start 'Em, Sit 'Em and should be consolidated in a later pass.

## Next Simplification Pass
- Replace repeated `VLOOKUP`/`COUNTIFS` formulas with named model functions.
- Store players, ratings, PFF imports, teams, schedules, and matchup weights as normalized tables.
- Keep manual film nudges as explicit editable fields instead of hidden spreadsheet side effects.
- Make rating history auditable: original rating, PFF delta, film nudge, injury/manual override, final rating.
