# Weekly QB Ranks Formula Audit

Source workbook: `C:\Users\znicol\Downloads\2026 NFL Model Z.xlsx`

## Big Picture

- Row 2 has 47 formula columns out of 130 columns.
- Manual/history input zone detected as `AZ:DO` (68 columns). These are previous-game performance fields and should become an app-hosted input/import table later.
- Everything outside that zone is either formula-driven, static/imported identity fields, or lookup output.

## External Workbook Dependencies

- `Position Matchups`: referenced by 4 row-2 formulas
- `Weekly Matchups`: referenced by 3 row-2 formulas
- `Sim Position Matchups`: referenced by 1 row-2 formulas

## Manual History Input Columns

- `AZ`: Pass Yards Game 1
- `BA`: Pass Yards Game 2
- `BB`: Pass Yards Game 3
- `BC`: Pass Yards Game 4
- `BD`: Pass Yards Game 5
- `BE`: Pass Yards Game 6
- `BF`: Pass Yards Game 7
- `BG`: Pass Yards Game 8
- `BH`: Pass Yards Game 9
- `BI`: Pass Yards Game 10
- `BJ`: Pass Yards Game 11
- `BK`: Pass Yards Game 12
- `BL`: Pass Yards Game 13
- `BM`: Pass Yards Game 14
- `BN`: Pass Yards Game 15
- `BO`: Pass Yards Game 16
- `BP`: Pass Yards Game 17
- `BQ`: Pass TDS Game 1
- `BR`: Pass TDs Game 2
- `BS`: Pass TDS Game 3
- `BT`: Pass TDS Game 4
- `BU`: Pass TDs Game 5
- `BV`: Pass TDS Game 6
- `BW`: Pass TDS Game 7
- `BX`: Pass TDs Game 8
- `BY`: Pass TDS Game 9
- `BZ`: Pass TDs Game 10
- `CA`: Pass TDS Game 11
- `CB`: Pass TDs Game 12
- `CC`: Pass TDS Game 13
- `CD`: Pass TDs Game 14
- `CE`: Pass TDS Game 15
- `CF`: Pass TDs Game 16
- `CG`: Pass TDS Game 17
- `CH`: Rush Attempts Game 1
- `CI`: Rush Attempts Game 2
- `CJ`: Rush Attempts Game 3
- `CK`: Rush Attempts Game 4
- `CL`: Rush Attempts Game 5
- `CM`: Rush Attempts Game 6
- `CN`: Rush Attempts Game 7
- `CO`: Rush Attempts Game 8
- `CP`: Rush Attempts Game 9
- `CQ`: Rush Attempts Game 10
- `CR`: Rush Attempts Game 11
- `CS`: Rush Attempts Game 12
- `CT`: Rush Attempts Game 13
- `CU`: Rush Attempts Game 14
- `CV`: Rush Attempts Game 15
- `CW`: Rush Attempts Game 16
- `CX`: Rush Attempts Game 17
- `CY`: Rush TD Game 1
- `CZ`: Rush TD Game 2
- `DA`: Rush TD Game 3
- `DB`: Rush TD Game 4
- `DC`: Rush TD Game 5
- `DD`: Rush TD Game 6
- `DE`: Rush TD Game 7
- `DF`: Rush TD Game 8
- `DG`: Rush TD Game 9
- `DH`: Rush TD Game 10
- `DI`: Rush TD Game 11
- `DJ`: Rush TD Game 12
- `DK`: Rush TD Game 13
- `DL`: Rush TD Game 14
- `DM`: Rush TD Game 15
- `DN`: Rush TD Game 16
- `DO`: Rush TD Game 17

## Row 2 Formula Map

| Col | Header | Kind | Source Sheets | Local Refs | Formula Preview |
|---|---|---|---|---|---|
| `A` | ='Weekly Matchups'!B1 | formula |  | `F2`, `$F$2:$F$300` | `=RANK(F2,$F$2:$F$300)` |
| `B` | Position | static-or-imported |  |  | `` |
| `C` | Player | static-or-imported |  |  | `` |
| `D` | Team | static-or-imported |  |  | `` |
| `E` | Opponent | formula | `Weekly Matchups` | `D2` | `=vlookup(D2,'Weekly Matchups'!$A$4:$B$500,2,false)` |
| `F` | SCORE | formula |  | `$R2`, `$K2`, `$L2`, `$T2`, `$W2`, `$U2`, `$AV2` | `=IFERROR( LET( depth,$R2, matchup,$K2, base, IFERROR((($L2-($R2*10)-($T2/6)-($W2/8)-($U2/10)-($K2/2)+$AV2 - 38.9)/(93-38.9))*(100-65)+65,65), fp, ((base-65)/(100-65))*20+8, fp_trim, IF(fp>26, 26+(fp-26)*0.8, fp), capped, IF(depth=1, fp_trim, MIN(fp_trim,3)), I` |
| `G` | SCORE RANK | formula |  | `F2`, `$F$2:$F$500` | `=IFERROR(IFERROR(RANK(F2, FILTER($F$2:$F$500, ISNUMBER($F$2:$F$500))), """")"),1.0)` |
| `H` | SCORE | formula |  |  | `=IFERROR(LET( rowN, ROW(), hdr, $1:$1, colDepth, MATCH(""Depth"", hdr, 0), colMatch, MATCH(""Matchup Rating (Low is good)"", hdr, 0), colRating, MATCH(""Player Rating"", hdr, 0), colOL, MATCH(""OL Rank"", hdr, 0), colWR, MATCH(""WR Group Rank"", hdr, 0), colPP` |
| `I` | SCORE RANK | formula |  | `H2`, `$H$2:$H$500` | `=RANK(H2,$H$2:$H$500)` |
| `J` | Opp vQB Rating | formula | `Weekly Matchups` | `D2` | `=vlookup(D2,'Weekly Matchups'!$A$4:$I$500,3,false)` |
| `K` | Matchup Rating (Low is good) | formula | `Weekly Matchups` | `D2` | `=vlookup(D2,'Weekly Matchups'!$A$4:$J$500,4,false)` |
| `L` | Player Rating | formula |  | `C2` | `=vlookup(C2,'Depth Charts'!F:H,2,false)` |
| `M` | Player Rating Rank | formula |  | `L2`, `$L$2:$L$500` | `=RANK(L2,$L$2:$L$500,false)` |
| `N` | Value (Sort by Avg) | formula |  | `F2`, `Q2` | `=F2/Q2` |
| `O` | Value Rank | formula |  | `N2`, `$N$2:$N$500` | `=RANK(N2,$N$2:$N$500)` |
| `P` | FPros Name | static-or-imported |  |  | `` |
| `Q` | Salary | formula |  | `P2`, `$BT$2:$BX$500` | `=vlookup(P2,$BT$2:$BX$500,5,false)` |
| `R` | Depth | formula |  | `C2` | `=vlookup(C2,'Depth Charts'!F:H,3,false)` |
| `S` | OL Rating | formula | `Position Matchups` | `D2` | `=vlookup(D2,'Position Matchups'!$A$2:$AA523,10,false)` |
| `T` | OL Rank | formula | `Position Matchups` | `D2` | `=VLOOKUP(D2, 'Position Matchups'!$A$2:$AA$33, 11, FALSE)` |
| `U` | PPG Rank | formula | `Sim Position Matchups` | `D2` | `=vlookup(D2,'Sim Position Matchups'!$B$3:$I$34,8,false)` |
| `V` | WR Group Rating | formula | `Position Matchups` | `D2` | `=vlookup(D2,'Position Matchups'!$A$2:$AA$33,6,false)` |
| `W` | WR Group Rank | formula | `Position Matchups` | `D2` | `=VLOOKUP(D2, 'Position Matchups'!$A$2:$AA$33, 7, FALSE)` |
| `X` | Typical Pass Yards | formula |  | `AZ2:BP2` | `=IFERROR(AVERAGE(AZ2:BP2), "")` |
| `Y` | Typical Pass Yards Rounded Down | formula |  | `X2` | `=IFERROR(FLOOR(X2,10), "")` |
| `Z` | Pass Yards Bonus Score | formula |  | `X2` | `=IFERROR((X2/100)*2, "")` |
| `AA` | !!LAST 5!! / Typical Pass Yards | formula |  | `$A$1`, `AZ2:BD2`, `BA2:BE2`, `BB2:BF2`, `BC2:BG2`, `BD2:BH2`, `BE2:BI2`, `BF2:BJ2` | `=IFERROR( IFS( $A$1=6, SUMPRODUCT(N(AZ2:BD2), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(AZ2:BD2))), $A$1=7, SUMPRODUCT(N(BA2:BE2), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(BA2:BE2))), $A$1=8, SUMPRODUCT(N(BB2:BF2), {1,2,3,4,5}) / SUMPRODUCT({1` |
| `AB` | !!LAST 5!! / Typical Pass Yards Rounded Down | formula |  | `AA2` | `=IFERROR(FLOOR(AA2,10), "")` |
| `AC` | !!LAST 5!! / Pass Yards Bonus Score | formula |  | `AA2` | `=IFNA((AA2/100)*2, "")` |
| `AD` | Typical Pass TDs | formula |  | `BQ2:CG2` | `=IFERROR(AVERAGE(BQ2:CG2), "")` |
| `AE` | Typical Pass TDs Rounded Down | formula |  | `AD2` | `=IFERROR(FLOOR(AD2,0.25), "")` |
| `AF` | Pass TDs Bonus Score | formula |  | `AD2` | `=IFERROR(AD2*1.5, "")` |
| `AG` | !!LAST 5!! / Typical Pass TDs | formula |  | `$A$1`, `BQ2:BU2`, `BR2:BV2`, `BS2:BW2`, `BT2:BX2`, `BU2:BY2`, `BV2:BZ2`, `BW2:CA2` | `=IFERROR( IFS( $A$1=6, SUMPRODUCT(N(BQ2:BU2), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(BQ2:BU2))), $A$1=7, SUMPRODUCT(N(BR2:BV2), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(BR2:BV2))), $A$1=8, SUMPRODUCT(N(BS2:BW2), {1,2,3,4,5}) / SUMPRODUCT({1` |
| `AH` | !!LAST 5!! / Typical Pass TDs Rounded Down | formula |  | `AG2` | `=IFERROR(FLOOR(AG2,0.5), "")` |
| `AI` | !!LAST 5!! / Typical Pass TDs Bonus Score | formula |  | `AG2` | `=IFERROR(AG2*1.5, "")` |
| `AJ` | Typical Rush Attempts | formula |  | `CH2:CX2` | `=IFERROR(AVERAGE(CH2:CX2), "")` |
| `AK` | Typical Rush Attempts Rounded Down | formula |  | `AJ2` | `=IFERROR(FLOOR(AJ2,0.25), "")` |
| `AL` | Typical Rush Attempts Bonus Score | formula |  | `AJ2` | `=IFERROR(AJ2/3, "")` |
| `AM` | !!LAST 5!! / Typical Rush Attempts | formula |  | `$A$1`, `CH2:CL2`, `CI2:CM2`, `CJ2:CN2`, `CK2:CO2`, `CL2:CP2`, `CM2:CQ2`, `CN2:CR2` | `=IFERROR( IFS( $A$1=6, SUMPRODUCT(N(CH2:CL2), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(CH2:CL2))), $A$1=7, SUMPRODUCT(N(CI2:CM2), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(CI2:CM2))), $A$1=8, SUMPRODUCT(N(CJ2:CN2), {1,2,3,4,5}) / SUMPRODUCT({1` |
| `AN` | !!LAST 5!! / Typical Rush Attempts Rounded Down | formula |  | `AM2` | `=IFERROR(FLOOR(AM2,1), "")` |
| `AO` | !!LAST 5!! / Typical Rush Attempts Bonus Score | formula |  | `AM2` | `=IFERROR(AM2/3, "")` |
| `AP` | Typical Rush TDs | formula |  | `CY2:DO2` | `=IFERROR(AVERAGE(CY2:DO2), "")` |
| `AQ` | Typical Rush TDs Rounded Down | formula |  | `AP2` | `=IFERROR(FLOOR(AP2,0.25), "")` |
| `AR` | Typical Rush TDs Bonus Score | formula |  | `AP2` | `=IFERROR(AP2*4, "")` |
| `AS` | !!LAST 5!! / Typical Rush TDs | formula |  | `$A$1`, `CY2:DC2`, `CZ2:DD2`, `DA2:DE2`, `DB2:DF2`, `DC2:DG2`, `DD2:DH2`, `DE2:DI2` | `=IFERROR( IFS( $A$1=6, SUMPRODUCT(N(CY2:DC2), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(CY2:DC2))), $A$1=7, SUMPRODUCT(N(CZ2:DD2), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(CZ2:DD2))), $A$1=8, SUMPRODUCT(N(DA2:DE2), {1,2,3,4,5}) / SUMPRODUCT({1` |
| `AT` | !!LAST 5!! / Typical Rush TDs Rounded Down | formula |  | `AS2` | `=IFERROR(FLOOR(AS2,0.1), "")` |
| `AU` | !!LAST 5!! / Typical Rush TDs Bonus Score | formula |  | `AS2` | `=IFERROR(AS2*4, "")` |
| `AV` | Total Bonuses / =sum(AC2,AI2,AO2,AU2) | formula |  | `Z2`, `AF2`, `AL2`, `AR2` | `=IFERROR(SUM(Z2,AF2,AL2,AR2), "")` |
| `AW` | Total Bonuses RANK | formula |  | `AV2`, `$AV$2:$AV$120` | `=(RANK(AV2,$AV$2:$AV$120) )` |
| `AX` | !!LAST 5!! / Total Bonuses | formula |  | `AC2`, `AI2`, `AO2`, `AU2` | `=IFERROR(SUM(AC2,AI2,AO2,AU2), "")` |
| `AY` | !!LAST 5!! / Total Bonuses RANK | formula |  | `AX2`, `$AX$2:$AX$120` | `=(RANK(AX2,$AX$2:$AX$120) )` |
| `AZ` | Pass Yards Game 1 | manual-history-input |  |  | `` |
| `BA` | Pass Yards Game 2 | manual-history-input |  |  | `` |
| `BB` | Pass Yards Game 3 | manual-history-input |  |  | `` |
| `BC` | Pass Yards Game 4 | manual-history-input |  |  | `` |
| `BD` | Pass Yards Game 5 | manual-history-input |  |  | `` |
| `BE` | Pass Yards Game 6 | manual-history-input |  |  | `` |
| `BF` | Pass Yards Game 7 | manual-history-input |  |  | `` |
| `BG` | Pass Yards Game 8 | manual-history-input |  |  | `` |
| `BH` | Pass Yards Game 9 | manual-history-input |  |  | `` |
| `BI` | Pass Yards Game 10 | manual-history-input |  |  | `` |
| `BJ` | Pass Yards Game 11 | manual-history-input |  |  | `` |
| `BK` | Pass Yards Game 12 | manual-history-input |  |  | `` |
| `BL` | Pass Yards Game 13 | manual-history-input |  |  | `` |
| `BM` | Pass Yards Game 14 | manual-history-input |  |  | `` |
| `BN` | Pass Yards Game 15 | manual-history-input |  |  | `` |
| `BO` | Pass Yards Game 16 | manual-history-input |  |  | `` |
| `BP` | Pass Yards Game 17 | manual-history-input |  |  | `` |
| `BQ` | Pass TDS Game 1 | manual-history-input |  |  | `` |
| `BR` | Pass TDs Game 2 | manual-history-input |  |  | `` |
| `BS` | Pass TDS Game 3 | manual-history-input |  |  | `` |
| `BT` | Pass TDS Game 4 | manual-history-input |  |  | `` |
| `BU` | Pass TDs Game 5 | manual-history-input |  |  | `` |
| `BV` | Pass TDS Game 6 | manual-history-input |  |  | `` |
| `BW` | Pass TDS Game 7 | manual-history-input |  |  | `` |
| `BX` | Pass TDs Game 8 | manual-history-input |  |  | `` |
| `BY` | Pass TDS Game 9 | manual-history-input |  |  | `` |
| `BZ` | Pass TDs Game 10 | manual-history-input |  |  | `` |
| `CA` | Pass TDS Game 11 | manual-history-input |  |  | `` |
| `CB` | Pass TDs Game 12 | manual-history-input |  |  | `` |
| `CC` | Pass TDS Game 13 | manual-history-input |  |  | `` |
| `CD` | Pass TDs Game 14 | manual-history-input |  |  | `` |
| `CE` | Pass TDS Game 15 | manual-history-input |  |  | `` |
| `CF` | Pass TDs Game 16 | manual-history-input |  |  | `` |
| `CG` | Pass TDS Game 17 | manual-history-input |  |  | `` |
| `CH` | Rush Attempts Game 1 | manual-history-input |  |  | `` |
| `CI` | Rush Attempts Game 2 | manual-history-input |  |  | `` |
| `CJ` | Rush Attempts Game 3 | manual-history-input |  |  | `` |
| `CK` | Rush Attempts Game 4 | manual-history-input |  |  | `` |
| `CL` | Rush Attempts Game 5 | manual-history-input |  |  | `` |
| `CM` | Rush Attempts Game 6 | manual-history-input |  |  | `` |
| `CN` | Rush Attempts Game 7 | manual-history-input |  |  | `` |
| `CO` | Rush Attempts Game 8 | manual-history-input |  |  | `` |
| `CP` | Rush Attempts Game 9 | manual-history-input |  |  | `` |
| `CQ` | Rush Attempts Game 10 | manual-history-input |  |  | `` |
| `CR` | Rush Attempts Game 11 | manual-history-input |  |  | `` |
| `CS` | Rush Attempts Game 12 | manual-history-input |  |  | `` |
| `CT` | Rush Attempts Game 13 | manual-history-input |  |  | `` |
| `CU` | Rush Attempts Game 14 | manual-history-input |  |  | `` |
| `CV` | Rush Attempts Game 15 | manual-history-input |  |  | `` |
| `CW` | Rush Attempts Game 16 | manual-history-input |  |  | `` |
| `CX` | Rush Attempts Game 17 | manual-history-input |  |  | `` |
| `CY` | Rush TD Game 1 | manual-history-input |  |  | `` |
| `CZ` | Rush TD Game 2 | manual-history-input |  |  | `` |
| `DA` | Rush TD Game 3 | manual-history-input |  |  | `` |
| `DB` | Rush TD Game 4 | manual-history-input |  |  | `` |
| `DC` | Rush TD Game 5 | manual-history-input |  |  | `` |
| `DD` | Rush TD Game 6 | manual-history-input |  |  | `` |
| `DE` | Rush TD Game 7 | manual-history-input |  |  | `` |
| `DF` | Rush TD Game 8 | manual-history-input |  |  | `` |
| `DG` | Rush TD Game 9 | manual-history-input |  |  | `` |
| `DH` | Rush TD Game 10 | manual-history-input |  |  | `` |
| `DI` | Rush TD Game 11 | manual-history-input |  |  | `` |
| `DJ` | Rush TD Game 12 | manual-history-input |  |  | `` |
| `DK` | Rush TD Game 13 | manual-history-input |  |  | `` |
| `DL` | Rush TD Game 14 | manual-history-input |  |  | `` |
| `DM` | Rush TD Game 15 | manual-history-input |  |  | `` |
| `DN` | Rush TD Game 16 | manual-history-input |  |  | `` |
| `DO` | Rush TD Game 17 | manual-history-input |  |  | `` |
| `DP` |  | static-or-imported |  |  | `` |
| `DQ` |  | static-or-imported |  |  | `` |
| `DR` |  | static-or-imported |  |  | `` |
| `DS` |  | static-or-imported |  |  | `` |
| `DT` |  | static-or-imported |  |  | `` |
| `DU` |  | static-or-imported |  |  | `` |
| `DV` |  | static-or-imported |  |  | `` |
| `DW` |  | static-or-imported |  |  | `` |
| `DX` |  | static-or-imported |  |  | `` |
| `DY` |  | static-or-imported |  |  | `` |
| `DZ` |  | static-or-imported |  |  | `` |