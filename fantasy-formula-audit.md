# Fantasy Formula Audit

Source workbook: `C:\Users\znicol\Downloads\2026 NFL Model Z.xlsx`

This audits one representative player/team row per fantasy rank sheet. For most sheets the first data row is row 2; weekly RB/WR/TE/Defense use row 3 because row 2 is the header row.

## Sheet Summary

| Sheet | Sample Row | Formula Cols | Manual/Input Cols | Static/Imported Cols | Main External Sources |
|---|---:|---:|---:|---:|---|
| Weekly QB Ranks | 2 | 47 | 68 | 15 | `Position Matchups` (4), `Weekly Matchups` (3), `Sim Position Matchups` (1) |
| Weekly RB Ranks | 3 | 43 | 0 | 98 | `Weekly Matchups` (3), `Position Matchups` (2), `Live Rankings` (1) |
| Weekly WR Ranks | 3 | 56 | 0 | 95 | `Live Rankings!` (7), `Weekly Matchups` (3), `Position Matchups` (2), `Live Rankings` (1), `Sim Position Matchups` (1) |
| Weekly TE Ranks | 3 | 42 | 0 | 84 | `Weekly Matchups` (3), `Position Matchups` (2), `Sim Position Matchups` (1) |
| Weekly Defense Ranks | 3 | 16 | 0 | 43 | `Live Rankings!` (2), `Weekly Matchups` (2) |
| Weekly Kicker Ranks | 2 | 4 | 0 | 7 | `Team #s for Sim` (1), `Weekly Matchups` (1) |
| Fantasy QB Ranks | 2 | 22 | 0 | 41 | `Position Matchups` (5), `Sim Position Matchups` (2), `ADP` (1), `OLine Boosts` (1) |
| Fantasy RB Ranks | 2 | 17 | 0 | 54 | `Position Matchups` (2), `Sim Position Matchups` (2), `ADP` (1), `OLine Boosts` (1) |
| Fantasy WR Ranks | 2 | 16 | 0 | 44 | `Position Matchups` (3), `Sim Position Matchups` (2), `ADP` (1), `OLine Boosts` (1) |
| Fantasy TE Ranks | 2 | 11 | 0 | 38 | `Position Matchups` (3), `Sim Position Matchups` (2) |
| Fantasy Defense Ranks | 3 | 10 | 0 | 6 | `Live Rankings!` (5), `Sim Schedule` (1) |
| Fantasy Kicker Ranks | 2 | 3 | 0 | 8 | `Sim Position Matchups` (1) |

## Weekly QB Ranks Manual Zone

- `AZ:DO` is the previous-game performance input band. The row-2 score formula reads those fields directly/indirectly, so the app should eventually host that as a structured game-log table per QB rather than hardcoding it into ranking rows.

## Detailed Formula Maps

### Weekly QB Ranks

| Col | Header | Kind | Sources | Formula Preview |
|---|---|---|---|---|
| `A` | ='Weekly Matchups'!B1 | formula |  | `=RANK(F2,$F$2:$F$300)` |
| `B` | Position | static-or-imported |  | `` |
| `C` | Player | static-or-imported |  | `` |
| `D` | Team | static-or-imported |  | `` |
| `E` | Opponent | formula | `Weekly Matchups` | `=vlookup(D2,'Weekly Matchups'!$A$4:$B$500,2,false)` |
| `F` | SCORE | formula |  | `=IFERROR( LET( depth,$R2, matchup,$K2, base, IFERROR((($L2-($R2*10)-($T2/6)-($W2/8)-($U2/10)-($K2/2)+$AV2 - 38.9)/(93-38.9))*(100-65)+65,65), fp, ((base-65)/(100-65))*20+8, fp_trim, IF(fp>26, 26+(fp-26)*0.8, fp), capped,` |
| `G` | SCORE RANK | formula |  | `=IFERROR(IFERROR(RANK(F2, FILTER($F$2:$F$500, ISNUMBER($F$2:$F$500))), """")"),1.0)` |
| `H` | SCORE | formula |  | `=IFERROR(LET( rowN, ROW(), hdr, $1:$1, colDepth, MATCH(""Depth"", hdr, 0), colMatch, MATCH(""Matchup Rating (Low is good)"", hdr, 0), colRating, MATCH(""Player Rating"", hdr, 0), colOL, MATCH(""OL Rank"", hdr, 0), colWR,` |
| `I` | SCORE RANK | formula |  | `=RANK(H2,$H$2:$H$500)` |
| `J` | Opp vQB Rating | formula | `Weekly Matchups` | `=vlookup(D2,'Weekly Matchups'!$A$4:$I$500,3,false)` |
| `K` | Matchup Rating (Low is good) | formula | `Weekly Matchups` | `=vlookup(D2,'Weekly Matchups'!$A$4:$J$500,4,false)` |
| `L` | Player Rating | formula |  | `=vlookup(C2,'Depth Charts'!F:H,2,false)` |
| `M` | Player Rating Rank | formula |  | `=RANK(L2,$L$2:$L$500,false)` |
| `N` | Value (Sort by Avg) | formula |  | `=F2/Q2` |
| `O` | Value Rank | formula |  | `=RANK(N2,$N$2:$N$500)` |
| `P` | FPros Name | static-or-imported |  | `` |
| `Q` | Salary | formula |  | `=vlookup(P2,$BT$2:$BX$500,5,false)` |
| `R` | Depth | formula |  | `=vlookup(C2,'Depth Charts'!F:H,3,false)` |
| `S` | OL Rating | formula | `Position Matchups` | `=vlookup(D2,'Position Matchups'!$A$2:$AA523,10,false)` |
| `T` | OL Rank | formula | `Position Matchups` | `=VLOOKUP(D2, 'Position Matchups'!$A$2:$AA$33, 11, FALSE)` |
| `U` | PPG Rank | formula | `Sim Position Matchups` | `=vlookup(D2,'Sim Position Matchups'!$B$3:$I$34,8,false)` |
| `V` | WR Group Rating | formula | `Position Matchups` | `=vlookup(D2,'Position Matchups'!$A$2:$AA$33,6,false)` |
| `W` | WR Group Rank | formula | `Position Matchups` | `=VLOOKUP(D2, 'Position Matchups'!$A$2:$AA$33, 7, FALSE)` |
| `X` | Typical Pass Yards | formula |  | `=IFERROR(AVERAGE(AZ2:BP2), "")` |
| `Y` | Typical Pass Yards Rounded Down | formula |  | `=IFERROR(FLOOR(X2,10), "")` |
| `Z` | Pass Yards Bonus Score | formula |  | `=IFERROR((X2/100)*2, "")` |
| `AA` | !!LAST 5!! / Typical Pass Yards | formula |  | `=IFERROR( IFS( $A$1=6, SUMPRODUCT(N(AZ2:BD2), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(AZ2:BD2))), $A$1=7, SUMPRODUCT(N(BA2:BE2), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(BA2:BE2))), $A$1=8, SUMPRODUCT(` |
| `AB` | !!LAST 5!! / Typical Pass Yards Rounded Down | formula |  | `=IFERROR(FLOOR(AA2,10), "")` |
| `AC` | !!LAST 5!! / Pass Yards Bonus Score | formula |  | `=IFNA((AA2/100)*2, "")` |
| `AD` | Typical Pass TDs | formula |  | `=IFERROR(AVERAGE(BQ2:CG2), "")` |
| `AE` | Typical Pass TDs Rounded Down | formula |  | `=IFERROR(FLOOR(AD2,0.25), "")` |
| `AF` | Pass TDs Bonus Score | formula |  | `=IFERROR(AD2*1.5, "")` |
| `AG` | !!LAST 5!! / Typical Pass TDs | formula |  | `=IFERROR( IFS( $A$1=6, SUMPRODUCT(N(BQ2:BU2), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(BQ2:BU2))), $A$1=7, SUMPRODUCT(N(BR2:BV2), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(BR2:BV2))), $A$1=8, SUMPRODUCT(` |
| `AH` | !!LAST 5!! / Typical Pass TDs Rounded Down | formula |  | `=IFERROR(FLOOR(AG2,0.5), "")` |
| `AI` | !!LAST 5!! / Typical Pass TDs Bonus Score | formula |  | `=IFERROR(AG2*1.5, "")` |
| `AJ` | Typical Rush Attempts | formula |  | `=IFERROR(AVERAGE(CH2:CX2), "")` |
| `AK` | Typical Rush Attempts Rounded Down | formula |  | `=IFERROR(FLOOR(AJ2,0.25), "")` |
| `AL` | Typical Rush Attempts Bonus Score | formula |  | `=IFERROR(AJ2/3, "")` |
| `AM` | !!LAST 5!! / Typical Rush Attempts | formula |  | `=IFERROR( IFS( $A$1=6, SUMPRODUCT(N(CH2:CL2), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(CH2:CL2))), $A$1=7, SUMPRODUCT(N(CI2:CM2), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(CI2:CM2))), $A$1=8, SUMPRODUCT(` |
| `AN` | !!LAST 5!! / Typical Rush Attempts Rounded Down | formula |  | `=IFERROR(FLOOR(AM2,1), "")` |
| `AO` | !!LAST 5!! / Typical Rush Attempts Bonus Score | formula |  | `=IFERROR(AM2/3, "")` |
| `AP` | Typical Rush TDs | formula |  | `=IFERROR(AVERAGE(CY2:DO2), "")` |
| `AQ` | Typical Rush TDs Rounded Down | formula |  | `=IFERROR(FLOOR(AP2,0.25), "")` |
| `AR` | Typical Rush TDs Bonus Score | formula |  | `=IFERROR(AP2*4, "")` |
| `AS` | !!LAST 5!! / Typical Rush TDs | formula |  | `=IFERROR( IFS( $A$1=6, SUMPRODUCT(N(CY2:DC2), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(CY2:DC2))), $A$1=7, SUMPRODUCT(N(CZ2:DD2), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(CZ2:DD2))), $A$1=8, SUMPRODUCT(` |
| `AT` | !!LAST 5!! / Typical Rush TDs Rounded Down | formula |  | `=IFERROR(FLOOR(AS2,0.1), "")` |
| `AU` | !!LAST 5!! / Typical Rush TDs Bonus Score | formula |  | `=IFERROR(AS2*4, "")` |
| `AV` | Total Bonuses / =sum(AC2,AI2,AO2,AU2) | formula |  | `=IFERROR(SUM(Z2,AF2,AL2,AR2), "")` |
| `AW` | Total Bonuses RANK | formula |  | `=(RANK(AV2,$AV$2:$AV$120) )` |
| `AX` | !!LAST 5!! / Total Bonuses | formula |  | `=IFERROR(SUM(AC2,AI2,AO2,AU2), "")` |
| `AY` | !!LAST 5!! / Total Bonuses RANK | formula |  | `=(RANK(AX2,$AX$2:$AX$120) )` |
| `AZ` | Pass Yards Game 1 | manual-input |  | `Previous game performance input AZ:DO` |
| `BA` | Pass Yards Game 2 | manual-input |  | `Previous game performance input AZ:DO` |
| `BB` | Pass Yards Game 3 | manual-input |  | `Previous game performance input AZ:DO` |
| `BC` | Pass Yards Game 4 | manual-input |  | `Previous game performance input AZ:DO` |
| `BD` | Pass Yards Game 5 | manual-input |  | `Previous game performance input AZ:DO` |
| `BE` | Pass Yards Game 6 | manual-input |  | `Previous game performance input AZ:DO` |
| `BF` | Pass Yards Game 7 | manual-input |  | `Previous game performance input AZ:DO` |
| `BG` | Pass Yards Game 8 | manual-input |  | `Previous game performance input AZ:DO` |
| `BH` | Pass Yards Game 9 | manual-input |  | `Previous game performance input AZ:DO` |
| `BI` | Pass Yards Game 10 | manual-input |  | `Previous game performance input AZ:DO` |
| `BJ` | Pass Yards Game 11 | manual-input |  | `Previous game performance input AZ:DO` |
| `BK` | Pass Yards Game 12 | manual-input |  | `Previous game performance input AZ:DO` |
| `BL` | Pass Yards Game 13 | manual-input |  | `Previous game performance input AZ:DO` |
| `BM` | Pass Yards Game 14 | manual-input |  | `Previous game performance input AZ:DO` |
| `BN` | Pass Yards Game 15 | manual-input |  | `Previous game performance input AZ:DO` |
| `BO` | Pass Yards Game 16 | manual-input |  | `Previous game performance input AZ:DO` |
| `BP` | Pass Yards Game 17 | manual-input |  | `Previous game performance input AZ:DO` |
| `BQ` | Pass TDS Game 1 | manual-input |  | `Previous game performance input AZ:DO` |
| `BR` | Pass TDs Game 2 | manual-input |  | `Previous game performance input AZ:DO` |
| `BS` | Pass TDS Game 3 | manual-input |  | `Previous game performance input AZ:DO` |
| `BT` | Pass TDS Game 4 | manual-input |  | `Previous game performance input AZ:DO` |
| `BU` | Pass TDs Game 5 | manual-input |  | `Previous game performance input AZ:DO` |
| `BV` | Pass TDS Game 6 | manual-input |  | `Previous game performance input AZ:DO` |
| `BW` | Pass TDS Game 7 | manual-input |  | `Previous game performance input AZ:DO` |
| `BX` | Pass TDs Game 8 | manual-input |  | `Previous game performance input AZ:DO` |
| `BY` | Pass TDS Game 9 | manual-input |  | `Previous game performance input AZ:DO` |
| `BZ` | Pass TDs Game 10 | manual-input |  | `Previous game performance input AZ:DO` |
| `CA` | Pass TDS Game 11 | manual-input |  | `Previous game performance input AZ:DO` |
| `CB` | Pass TDs Game 12 | manual-input |  | `Previous game performance input AZ:DO` |
| `CC` | Pass TDS Game 13 | manual-input |  | `Previous game performance input AZ:DO` |
| `CD` | Pass TDs Game 14 | manual-input |  | `Previous game performance input AZ:DO` |
| `CE` | Pass TDS Game 15 | manual-input |  | `Previous game performance input AZ:DO` |
| `CF` | Pass TDs Game 16 | manual-input |  | `Previous game performance input AZ:DO` |
| `CG` | Pass TDS Game 17 | manual-input |  | `Previous game performance input AZ:DO` |
| `CH` | Rush Attempts Game 1 | manual-input |  | `Previous game performance input AZ:DO` |
| `CI` | Rush Attempts Game 2 | manual-input |  | `Previous game performance input AZ:DO` |
| `CJ` | Rush Attempts Game 3 | manual-input |  | `Previous game performance input AZ:DO` |
| `CK` | Rush Attempts Game 4 | manual-input |  | `Previous game performance input AZ:DO` |
| `CL` | Rush Attempts Game 5 | manual-input |  | `Previous game performance input AZ:DO` |
| `CM` | Rush Attempts Game 6 | manual-input |  | `Previous game performance input AZ:DO` |
| `CN` | Rush Attempts Game 7 | manual-input |  | `Previous game performance input AZ:DO` |
| `CO` | Rush Attempts Game 8 | manual-input |  | `Previous game performance input AZ:DO` |
| `CP` | Rush Attempts Game 9 | manual-input |  | `Previous game performance input AZ:DO` |
| `CQ` | Rush Attempts Game 10 | manual-input |  | `Previous game performance input AZ:DO` |
| `CR` | Rush Attempts Game 11 | manual-input |  | `Previous game performance input AZ:DO` |
| `CS` | Rush Attempts Game 12 | manual-input |  | `Previous game performance input AZ:DO` |
| `CT` | Rush Attempts Game 13 | manual-input |  | `Previous game performance input AZ:DO` |
| `CU` | Rush Attempts Game 14 | manual-input |  | `Previous game performance input AZ:DO` |
| `CV` | Rush Attempts Game 15 | manual-input |  | `Previous game performance input AZ:DO` |
| `CW` | Rush Attempts Game 16 | manual-input |  | `Previous game performance input AZ:DO` |
| `CX` | Rush Attempts Game 17 | manual-input |  | `Previous game performance input AZ:DO` |
| `CY` | Rush TD Game 1 | manual-input |  | `Previous game performance input AZ:DO` |
| `CZ` | Rush TD Game 2 | manual-input |  | `Previous game performance input AZ:DO` |
| `DA` | Rush TD Game 3 | manual-input |  | `Previous game performance input AZ:DO` |
| `DB` | Rush TD Game 4 | manual-input |  | `Previous game performance input AZ:DO` |
| `DC` | Rush TD Game 5 | manual-input |  | `Previous game performance input AZ:DO` |
| `DD` | Rush TD Game 6 | manual-input |  | `Previous game performance input AZ:DO` |
| `DE` | Rush TD Game 7 | manual-input |  | `Previous game performance input AZ:DO` |
| `DF` | Rush TD Game 8 | manual-input |  | `Previous game performance input AZ:DO` |
| `DG` | Rush TD Game 9 | manual-input |  | `Previous game performance input AZ:DO` |
| `DH` | Rush TD Game 10 | manual-input |  | `Previous game performance input AZ:DO` |
| `DI` | Rush TD Game 11 | manual-input |  | `Previous game performance input AZ:DO` |
| `DJ` | Rush TD Game 12 | manual-input |  | `Previous game performance input AZ:DO` |
| `DK` | Rush TD Game 13 | manual-input |  | `Previous game performance input AZ:DO` |
| `DL` | Rush TD Game 14 | manual-input |  | `Previous game performance input AZ:DO` |
| `DM` | Rush TD Game 15 | manual-input |  | `Previous game performance input AZ:DO` |
| `DN` | Rush TD Game 16 | manual-input |  | `Previous game performance input AZ:DO` |
| `DO` | Rush TD Game 17 | manual-input |  | `Previous game performance input AZ:DO` |

### Weekly RB Ranks

| Col | Header | Kind | Sources | Formula Preview |
|---|---|---|---|---|
| `A` | ='Weekly Matchups'!B1 | formula |  | `=RANK(F3,$F$3:$F$501)` |
| `B` | Position | static-or-imported |  | `` |
| `C` | Player | static-or-imported |  | `` |
| `D` | Team | static-or-imported |  | `` |
| `E` | Opponent | formula | `Weekly Matchups` | `=vlookup(D3,'Weekly Matchups'!$A$4:$B$107,2,false)` |
| `F` | SCORE | formula |  | `=IF(OR(R3=100, W3=100), 0, IFERROR(((P3-(W3*5)-(Y3/4)-(R3/2.5)+AB3+AH3+AN3 - 38.9) / (93 - 38.9)) * (95 - 65) + 65, 0))` |
| `G` | !!LAST 5!! / SCORE | formula |  | `=IF(OR(R3=100, W3=100), 0, IFERROR(((P3-(W3*5)-(Y3/4)-(R3/2.5)+AE3+AK3+AQ3 - 38.9) / (93 - 38.9)) * (95 - 65) + 65, 0))` |
| `H` | SCORE RANK | formula |  | `=RANK(F3,$F$3:$F$202)` |
| `I` | !!LAST 5!! / SCORE RANK | formula |  | `=RANK(G3,$G$3:$G$502)` |
| `J` | Standard | formula | `Live Rankings` | `=IFERROR(LET( team,$C3, depthRaw,IFERROR($W3,""""), injFlag,IF(ISTEXT(depthRaw),REGEXMATCH(LOWER(depthRaw),""inj\|ir""),FALSE), depthN,IFERROR(VALUE(depthRaw),IF(LEN(depthRaw)=0,3,100)), dBkt,MAX(1,MIN(4,depthN)), depthSt` |
| `K` | .5 PPR | formula |  | `=IFERROR(""COMPUTED_VALUE"""),"#DIV/0!")` |
| `L` | Full PPR | formula |  | `=IFERROR(""COMPUTED_VALUE"""),"#DIV/0!")` |
| `M` | Standard Rank | formula |  | `=IFERROR(IFERROR(RANK(J3, FILTER($J$3:$J$501, ISNUMBER($J$3:$J$501))), """")` |
| `N` | .5 PPR Rank | formula |  | `=IFERROR(IFERROR(RANK(K3, FILTER($K$3:$K$501, ISNUMBER($K$3:$K$501))), """")` |
| `O` | Full PPR Rank | formula |  | `=IFERROR(IFERROR(RANK(L3, FILTER($L$3:$L$501, ISNUMBER($L$3:$L$501))), """")` |
| `P` | Player Rating | formula |  | `=vlookup(C3,'Depth Charts'!F:H,2,false)` |
| `Q` | Opp vRB Rating | formula | `Weekly Matchups` | `=vlookup(D3,'Weekly Matchups'!$A$4:$J$500,5,false)` |
| `R` | Matchup Rating (Low is good) / CHANGE CONDITIONAL FORMATTING IN REGULAR SEASON | formula | `Weekly Matchups` | `=vlookup(D3,'Weekly Matchups'!$A$4:$J$500,6,false)` |
| `S` | Value | formula |  | `=F3/V3` |
| `T` | Value Rank | formula |  | `=RANK(S3,$S$3:$S$502)` |
| `U` | FPros Name | static-or-imported |  | `` |
| `V` | Salary | formula |  | `=vlookup(U3,$J$3:$J$502,5,false)` |
| `W` | Depth | formula |  | `=vlookup(C3,'Depth Charts'!F:H,3,false)` |
| `X` | OL Rating | formula | `Position Matchups` | `=vlookup(D3,'Position Matchups'!$A$2:$AA$33,10,false)` |
| `Y` | OL Rank | formula | `Position Matchups` | `=VLOOKUP(D3, 'Position Matchups'!$A$2:$AA$33, 11, FALSE)` |
| `Z` | Typical Red Zone Opportunities | formula |  | `=IFERROR(AVERAGE(BM3:CC3), "")` |
| `AA` | Typical Red Zone Opportunities Rounded Down | formula |  | `=IF(Z3="","",FLOOR(Z3,0.25))` |
| `AB` | RB Red Zone Bonus Score | formula |  | `=Z3/1.5` |
| `AC` | !!LAST 5!! / RB Red Zone Opportunities | formula |  | `=IFERROR( IFS( $A$2=6, SUMPRODUCT(N(BM3:BQ3), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(BM3:BQ3))), $A$2=7, SUMPRODUCT(N(BN3:BR3), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(BN3:BR3))), $A$2=8, SUMPRODUCT(` |
| `AD` | !!LAST 5!! / RB Red Zone Opportunities Rounded Down | formula |  | `=IF(AC3="","",FLOOR(AC3,0.25))` |
| `AE` | !!LAST 5!! / RB Red Zone Opportunities Bonus Score | formula |  | `=AC3/1.5` |
| `AF` | Typical Targets | formula |  | `=IFERROR(AVERAGE(CD3:CT3), "")` |
| `AG` | Typical Targets Rounded Down | formula |  | `=IF(AF3="","",FLOOR(AF3,0.5))` |
| `AH` | RB PPR Bonus Score | formula |  | `=AF3/1.5` |
| `AI` | !!LAST 5!! / Typical Targets | formula |  | `=IFERROR( IFS( $A$2=6, SUMPRODUCT(N(CD3:CH3), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(CD3:CH3))), $A$2=7, SUMPRODUCT(N(CE3:CI3), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(CE3:CI3))), $A$2=8, SUMPRODUCT(` |
| `AJ` | !!LAST 5!! / Typical Targets Rounded Down | formula |  | `=IF(AI3="","",FLOOR(AI3,0.5))` |
| `AK` | !!LAST 5!! / RB Targets Bonus Score | formula |  | `=AI3/1.5` |
| `AL` | Typical Snap % | formula |  | `=IF(COUNT(AV3:BL3)>0, AVERAGE(AV3:BL3), "")` |
| `AM` | Typical Snap % Rounded Down | formula |  | `=IF(AL3="","",FLOOR(AL3,0.5))` |
| `AN` | Snap Score | formula |  | `=IF(LEN(AL3)=0, 0, (AL3-40)/10)` |
| `AO` | !!LAST 5!! / Typical Snap % | formula |  | `=IFERROR( IFS( $A$2=6, SUMPRODUCT(N(AV3:AZ3), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(AV3:AZ3))), $A$2=7, SUMPRODUCT(N(AW3:BA3), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(AW3:BA3))), $A$2=8, SUMPRODUCT(` |
| `AP` | !!LAST 5!! / Typical Snap % Rounded Down | formula |  | `=IF(AO3="","",FLOOR(AO3,5))` |
| `AQ` | !!LAST 5!! / Snap Score | formula |  | `=IF(LEN(AO3)=0, 0, (AO3-40)/10)` |
| `AR` | TD, PPR, SNAP | formula |  | `=AVERAGE(AB3,AH3,AN3)` |
| `AS` | USAGE RANK | formula |  | `=RANK(AR3,$AR$2:$AR$141)` |
| `AT` | !!LAST 5!! / TD,PPR,SNAP | formula |  | `=AVERAGE(AE3,AK3,AQ3)` |
| `AU` | !!LAST 5!! / USAGE RANK | formula |  | `=RANK(AT3,$AT$2:$AT$141)` |
| `AV` | Snap % Game 1 | static-or-imported |  | `` |
| `AW` | Snap % Game 2 | static-or-imported |  | `` |
| `AX` | Snap % Game 3 | static-or-imported |  | `` |
| `AY` | Snap % Game 4 | static-or-imported |  | `` |
| `AZ` | Snap % Game 5 | static-or-imported |  | `` |
| `BA` | Snap % Game 6 | static-or-imported |  | `` |
| `BB` | Snap % Game 7 | static-or-imported |  | `` |
| `BC` | Snap % Game 8 | static-or-imported |  | `` |
| `BD` | Snap % Game 9 | static-or-imported |  | `` |
| `BE` | Snap % Game 10 | static-or-imported |  | `` |
| `BF` | Snap % Game 11 | static-or-imported |  | `` |
| `BG` | Snap % Game 12 | static-or-imported |  | `` |
| `BH` | Snap % Game 13 | static-or-imported |  | `` |
| `BI` | Snap % Game 14 | static-or-imported |  | `` |
| `BJ` | Snap % Game 15 | static-or-imported |  | `` |
| `BK` | Snap % Game 16 | static-or-imported |  | `` |
| `BL` | Snap % Game 17 | static-or-imported |  | `` |
| `BM` | Red Zone Game 1 | static-or-imported |  | `` |
| `BN` | Red Zone Game 2 | static-or-imported |  | `` |
| `BO` | Red Zone Game 3 | static-or-imported |  | `` |
| `BP` | Red Zone Game 4 | static-or-imported |  | `` |
| `BQ` | Red Zone Game 5 | static-or-imported |  | `` |
| `BR` | Red Zone Game 6 | static-or-imported |  | `` |
| `BS` | Red Zone Game 7 | static-or-imported |  | `` |
| `BT` | Red Zone Game 8 | static-or-imported |  | `` |
| `BU` | Red Zone Game 9 | static-or-imported |  | `` |
| `BV` | Red Zone Game 10 | static-or-imported |  | `` |
| `BW` | Red Zone Game 11 | static-or-imported |  | `` |
| `BX` | Red Zone Game 12 | static-or-imported |  | `` |
| `BY` | Red Zone Game 13 | static-or-imported |  | `` |
| `BZ` | Red Zone Game 14 | static-or-imported |  | `` |
| `CA` | Red Zone Game 15 | static-or-imported |  | `` |
| `CB` | Red Zone Game 16 | static-or-imported |  | `` |
| `CC` | Red Zone Game 17 | static-or-imported |  | `` |
| `CD` | Targets Game 1 | static-or-imported |  | `` |
| `CE` | Targets Game 2 | static-or-imported |  | `` |
| `CF` | Targets Game 3 | static-or-imported |  | `` |
| `CG` | Targets Game 4 | static-or-imported |  | `` |
| `CH` | Targets Game 5 | static-or-imported |  | `` |
| `CI` | Targets Game 6 | static-or-imported |  | `` |
| `CJ` | Targets Game 7 | static-or-imported |  | `` |
| `CK` | Targets Game 8 | static-or-imported |  | `` |
| `CL` | Targets Game 9 | static-or-imported |  | `` |
| `CM` | Targets Game 10 | static-or-imported |  | `` |
| `CN` | Targets Game 11 | static-or-imported |  | `` |
| `CO` | Targets Game 12 | static-or-imported |  | `` |
| `CP` | Targets Game 13 | static-or-imported |  | `` |
| `CQ` | Targets Game 14 | static-or-imported |  | `` |
| `CR` | Targets Game 15 | static-or-imported |  | `` |
| `CS` | Targets Game 16 | static-or-imported |  | `` |
| `CT` | Targets Game 17 | static-or-imported |  | `` |
| `CU` | DK Team | static-or-imported |  | `` |

### Weekly WR Ranks

| Col | Header | Kind | Sources | Formula Preview |
|---|---|---|---|---|
| `A` | ='Weekly Matchups'!B1 | formula |  | `=RANK(F3,$F$3:$F$507)` |
| `B` | Position | static-or-imported |  | `` |
| `C` | Player | static-or-imported |  | `` |
| `D` | Team | static-or-imported |  | `` |
| `E` | Opponent | formula | `Weekly Matchups` | `=IFNA(VLOOKUP(D3,'Weekly Matchups'!$A$4:$B$500,2,FALSE)," ")` |
| `F` | SCORE | formula |  | `=IF(OR(UPPER(T3)="INJ", ISNA(R3)), 0, ((Q3*1.1)-20-(T3*4)-(AM3/5)-(V3/5)-(S3/2)+AP3+AV3+BB3-11)/(84.2-11)*(100-65)+65 )` |
| `G` | !!LAST 5!! / SCORE | formula |  | `=IF(OR(S3=100, T3=100, UPPER(T3)="INJ"), 0, ((Q3*1.1)-20-(T3*4)-(AM3/5)-(V3/5)-(S3/2)+AS3+AY3+BE3-11)/(84.2-11)*(100-65)+65)` |
| `H` | SCORE RANK | formula |  | `=IFERROR(IFERROR(RANK(F3, FILTER($F$3:$F$508, ISNUMBER($F$3:$F$508))), """")` |
| `I` | !!LAST 5!! / SCORE Rank | formula |  | `=RANK(G3,$G$3:$G$508)` |
| `J` | Standard | formula | `Live Rankings` | `=IFERROR(LET( r,ROW(), h,$1:$1, team,$D3, depthTxt,IFERROR($T3,""""), injFlag,IF(ISTEXT(depthTxt),REGEXMATCH(LOWER(depthTxt),""inj""),FALSE), depthNum,IFERROR(VALUE(depthTxt),IF(LEN(depthTxt)=0,3,100)), dBkt,MAX(1,MIN(4,` |
| `K` | .5 PPR | static-or-imported |  | `` |
| `L` | Full PPR | static-or-imported |  | `` |
| `M` | Standard Rank | formula |  | `=IFERROR(IFERROR(RANK(J3, FILTER($J$3:$J$507, ISNUMBER($J$3:$J$507))), """")` |
| `N` | .5 PPR Rank | formula |  | `=IFERROR(IFERROR(RANK(K3, FILTER($K$3:$K$507, ISNUMBER($K$3:$K$507))), """")` |
| `O` | Full PPR Rank | formula |  | `=IFERROR(IFERROR(RANK(L3, FILTER($L$3:$L$507, ISNUMBER($L$3:$L$507))), """")` |
| `P` | No History Score | formula |  | `=(Q3*1.1)-20-(T3*4)-(AM3/5)-(U3/5)-(S3/2)` |
| `Q` | Player Rating | formula |  | `=vlookup(C3,'Depth Charts'!F:H,2,false)` |
| `R` | Opp vWR Rating | formula | `Weekly Matchups` | `=vlookup(D3,'Weekly Matchups'!$A$4:$J$500,7,false)` |
| `S` | Matchup Rating (Low is good) / CHANGE CONDITIONAL FORMATTING IN REGULAR SEASON | formula | `Weekly Matchups` | `=vlookup(D3,'Weekly Matchups'!$A$4:$J$500,8,false)` |
| `T` | Depth | formula |  | `=vlookup(C3,'Depth Charts'!F:H,3,false)` |
| `U` | Team PPG | formula | `Sim Position Matchups` | `=VLOOKUP(D3,'Sim Position Matchups'!$B$3:$I$500,8,FALSE)` |
| `V` | Sim PPG and Real PPG | formula | `Live Rankings!` | `=AVERAGE(VLOOKUP(D3, 'Live Rankings!'!$K$5:$AE$36, 20, FALSE), U3)` |
| `W` | Value | formula |  | `=F3/AK3` |
| `X` | Value Rank | formula |  | `=RANK(W3,$W$3:$W$201)` |
| `Y` | !!LAST 5!! / Value | formula |  | `=G3/AK3` |
| `Z` | !!LAST 5!! / Value Rank | formula |  | `=RANK(Y3,$Y$3:$Y$201)` |
| `AA` | Opp CB1 | formula | `Live Rankings!` | `=vlookup(E3,'Live Rankings!'!$K$4:$DK$36,100,false)` |
| `AB` | Opp CB1 Rating | formula | `Live Rankings!` | `=vlookup(E3,'Live Rankings!'!$K$4:$DK$36,101,false)` |
| `AC` | Opp CB2 | formula | `Live Rankings!` | `=vlookup(E3,'Live Rankings!'!$K$4:$DK$36,102,false)` |
| `AD` | Opp CB2 Rating | formula | `Live Rankings!` | `=vlookup(E3,'Live Rankings!'!$K$4:$DK$36,103,false)` |
| `AE` | Opp CB3 | formula | `Live Rankings!` | `=vlookup(E3,'Live Rankings!'!$K$4:$DK$36,104,false)` |
| `AF` | Opp CB3 Rating | formula | `Live Rankings!` | `=vlookup(E3,'Live Rankings!'!$K$4:$DK$36,105,false)` |
| `AG` | Projected CB Matchup by Depth | formula |  | `=IFS(T3=1,AA3,T3=2,AC3,T3=3,AE3,T3>3,AE3)` |
| `AH` | Projected CB Matchup Rating by Depth | formula |  | `=IFS(T3=1,AB3,T3=2,AD3,T3=3,AF3,T3>3,AF3)` |
| `AI` |  | formula |  | `=AG3 & " - " & AH3` |
| `AJ` | Fpros Name | static-or-imported |  | `` |
| `AK` | Salary | formula |  | `=vlookup(AJ3,#REF!,5,false)` |
| `AL` | QB Rating | formula | `Position Matchups` | `=vlookup(D3,'Position Matchups'!$A$2:$AA$33,2,false)` |
| `AM` | QB Rank | formula | `Position Matchups` | `=vlookup(D3,'Position Matchups'!$A$2:$AA$33,3,false)` |
| `AN` | Typical Red Zone Opportunities | formula |  | `=IFERROR(AVERAGE(CE3:CV3), "")` |
| `AO` | Typical Red Zone Opportunities Rounded Down | formula |  | `=floor(AN3,0.25)` |
| `AP` | WR Red Zone Bonus | formula |  | `=AN3*1.2` |
| `AQ` | !!Last 5!! / Typical Red Zone Opportunities | formula |  | `=IFERROR( IFS( $A$2=6, SUMPRODUCT(N(CE3:CI3), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(CE3:CI3))), $A$2=7, SUMPRODUCT(N(CF3:CJ3), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(CF3:CJ3))), $A$2=8, SUMPRODUCT(` |
| `AR` | !!Last 5!! / Typical Red Zone Opportunities Rounded Down | formula |  | `=IFERROR(FLOOR(AQ3,0.25),"")` |
| `AS` | !!Last 5!! / WR Red Zone Bonus | formula |  | `=IFERROR(AQ3*1.2,"")` |
| `AT` | Typical Targets | formula |  | `=IFERROR(AVERAGE(CW3:DN3), "")` |
| `AU` | Typical Targets Rounded Down | formula |  | `=floor(AT3,1)` |
| `AV` | WR PPR Bonus | formula |  | `=AT3/3.5` |
| `AW` | !!Last 5!! /  Typical Targets | formula |  | `=IFERROR( IFS( $A$2=6, SUMPRODUCT(N(CW3:DA3), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(CW3:DA3))), $A$2=7, SUMPRODUCT(N(CX3:DB3), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(CX3:DB3))), $A$2=8, SUMPRODUCT(` |
| `AX` | !!Last 5!! /  Typical Targets Rounded Down | formula |  | `=IFERROR(FLOOR(AW3,1),"")` |
| `AY` | !!Last 5!! /  WR PPR Bonus | formula |  | `=IFERROR(AW3/3.5,"")` |
| `AZ` | Typical Snap % | formula |  | `=IFERROR(AVERAGE(BM3:CD3), "")` |
| `BA` | Typical Snap % Rounded Down | formula |  | `=floor(AZ3,5)` |
| `BB` | Snap Score | formula |  | `=(AZ3-60)/12` |
| `BC` | !!Last 5!! / Typical Snap % | formula |  | `=IFERROR( IFS( $A$2=6, SUMPRODUCT(N(BM3:BQ3), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(BM3:BQ3))), $A$2=7, SUMPRODUCT(N(BN3:BR3), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(BN3:BR3))), $A$2=8, SUMPRODUCT(` |
| `BD` | !!Last 5!! /  Typical Snap % Rounded Down | formula |  | `=IFERROR(FLOOR(BC3,5),"")` |
| `BE` | !!Last 5!! /  Snap Score | formula |  | `=IFERROR((BC3-60)/12,"")` |
| `BF` | Usage Score | formula |  | `=average(AP3,AV3,BB3)` |
| `BG` | Usage Score Rank | formula |  | `=IFERROR(RANK(BF3,$BF$3:$BF$258,FALSE),"")` |
| `BH` | !!Last 5!! / Usage Score | formula |  | `=IFERROR(AVERAGE(AS3,AY3,BE3),"")` |
| `BI` | !!Last 5!! / Usage Score Rank | formula |  | `=IFERROR(RANK(BH3,$BH$3:$BH$258,FALSE),"")` |
| `BJ` | Opp Pass TDs Allowed Rank | static-or-imported |  | `` |
| `BK` | Opp Pass TDs Allowed Score | static-or-imported |  | `` |
| `BL` | TD POWER COMBO | formula |  | `=IFERROR(IFERROR(AVERAGE(FILTER({BB3,AV3,AP3}, ISNUMBER({BB3,AV3,AP3}))), """")"),2.6731859410430836)` |
| `BM` | Snap % Game 1 | static-or-imported |  | `` |
| `BN` | Snap % Game 2 | static-or-imported |  | `` |
| `BO` | Snap % Game 3 | static-or-imported |  | `` |
| `BP` | Snap % Game 4 | static-or-imported |  | `` |
| `BQ` | Snap % Game 5 | static-or-imported |  | `` |
| `BR` | Snap % Game 6 | static-or-imported |  | `` |
| `BS` | Snap % Game 7 | static-or-imported |  | `` |
| `BT` | Snap % Game 8 | static-or-imported |  | `` |
| `BU` | Snap % Game 9 | static-or-imported |  | `` |
| `BV` | Snap % Game 10 | static-or-imported |  | `` |
| `BW` | Snap % Game 11 | static-or-imported |  | `` |
| `BX` | Snap % Game 12 | static-or-imported |  | `` |
| `BY` | Snap % Game 13 | static-or-imported |  | `` |
| `BZ` | Snap % Game 14 | static-or-imported |  | `` |
| `CA` | Snap % Game 15 | static-or-imported |  | `` |
| `CB` | Snap % Game 16 | static-or-imported |  | `` |
| `CC` | Snap % Game 17 | static-or-imported |  | `` |
| `CD` | Snap % Game 18 | static-or-imported |  | `` |
| `CE` | Red Zone Game 1 | static-or-imported |  | `` |
| `CF` | Red Zone Game 2 | static-or-imported |  | `` |
| `CG` | Red Zone Game 3 | static-or-imported |  | `` |
| `CH` | Red Zone Game 4 | static-or-imported |  | `` |
| `CI` | Red Zone Game 5 | static-or-imported |  | `` |
| `CJ` | Red Zone Game 6 | static-or-imported |  | `` |
| `CK` | Red Zone Game 7 | static-or-imported |  | `` |
| `CL` | Red Zone Game 8 | static-or-imported |  | `` |
| `CM` | Red Zone Game 9 | static-or-imported |  | `` |
| `CN` | Red Zone Game 10 | static-or-imported |  | `` |
| `CO` | Red Zone Game 11 | static-or-imported |  | `` |
| `CP` | Red Zone Game 12 | static-or-imported |  | `` |
| `CQ` | Red Zone Game 13 | static-or-imported |  | `` |
| `CR` | Red Zone Game 14 | static-or-imported |  | `` |
| `CS` | Red Zone Game 15 | static-or-imported |  | `` |
| `CT` | Red Zone Game 16 | static-or-imported |  | `` |
| `CU` | Red Zone Game 17 | static-or-imported |  | `` |
| `CV` | Red Zone Game 18 | static-or-imported |  | `` |
| `CW` | Targets Game 1 | static-or-imported |  | `` |
| `CX` | Targets Game 2 | static-or-imported |  | `` |
| `CY` | Targets Game 3 | static-or-imported |  | `` |
| `CZ` | Targets Game 4 | static-or-imported |  | `` |
| `DA` | Targets Game 5 | static-or-imported |  | `` |
| `DB` | Targets Game 6 | static-or-imported |  | `` |
| `DC` | Targets Game 7 | static-or-imported |  | `` |
| `DD` | Targets Game 8 | static-or-imported |  | `` |
| `DE` | Targets Game 9 | static-or-imported |  | `` |
| `DF` | Targets Game 10 | static-or-imported |  | `` |
| `DG` | Targets Game 11 | static-or-imported |  | `` |
| `DH` | Targets Game 12 | static-or-imported |  | `` |
| `DI` | Targets Game 13 | static-or-imported |  | `` |
| `DJ` | Targets Game 14 | static-or-imported |  | `` |
| `DK` | Targets Game 15 | static-or-imported |  | `` |
| `DL` | Targets Game 16 | static-or-imported |  | `` |
| `DM` | Targets Game 17 | static-or-imported |  | `` |
| `DN` | Targets Game 18 | static-or-imported |  | `` |
| `DO` | DK Team | static-or-imported |  | `` |

### Weekly TE Ranks

| Col | Header | Kind | Sources | Formula Preview |
|---|---|---|---|---|
| `A` | ='Weekly Matchups'!B1 | static-or-imported |  | `` |
| `B` | Position | static-or-imported |  | `` |
| `C` | Player | static-or-imported |  | `` |
| `D` | Team | static-or-imported |  | `` |
| `E` | Opponent | formula | `Weekly Matchups` | `=vlookup(D3,'Weekly Matchups'!$A$4:$B$500,2,false)` |
| `F` | SCORE | formula |  | `=IFERROR(((U3-5-(Y3*5)-(AD3/8)-(AB3/8)-(T3/4)+AH3+AN3+AT3 - 38.9) / (93 - 38.9)) * (100 - 65) + 65, 0)` |
| `G` | RANK | formula |  | `=IF(S3=100, 100, RANK(F3, $F$3:$F$504))` |
| `H` | Standard | formula |  | `=IFERROR(IF($T3=100,0, LET( r,ROW(), h,$1:$1, team,$D3, depthTxt,IFERROR($Y3,""""), injFlag,IF(ISTEXT(depthTxt),REGEXMATCH(LOWER(depthTxt),""inj\|ir""),FALSE), depthN,IFERROR(VALUE(depthTxt),IF(LEN(depthTxt)=0,3,100)), dB` |
| `I` | .5 PPR | static-or-imported |  | `` |
| `J` | Full PPR | static-or-imported |  | `` |
| `K` | Standard Rank | formula |  | `=RANK(H3,$H$3:$H$504)` |
| `L` | .5 PPR Rank | formula |  | `=RANK(I3,$I$3:$I$504)` |
| `M` | Full PPR Rank | formula |  | `=RANK(J3,$J$3:$J$504)` |
| `N` | !!LAST 5!! / SCORE | formula |  | `=IFERROR(((U3-(Y3*4)-(AD3/8)-(AB3/8)-(T3/5)+AK3+AQ3+AW3 - 38.9) / (93 - 38.9)) * (100 - 65) + 65, 0)` |
| `O` | !!LAST 5!! / RANK | formula |  | `=RANK(N3,$N$3:$N$504)` |
| `P` | No History Score | formula |  | `=U3-5-(Y3*5)-(AD3/8)-(AB3/8)-(T3/4)` |
| `Q` | VALUE RANK | formula |  | `=RANK(V3,$V$3:$V$504)` |
| `R` | !!LAST 5!! / VALUE RANK | formula |  | `=RANK(#REF!,#REF!)` |
| `S` | Opp vTE Rating | formula | `Weekly Matchups` | `=vlookup(D3,'Weekly Matchups'!$A$4:$J$500,9,false)` |
| `T` | Matchup Rating (Low is good) | formula | `Weekly Matchups` | `=vlookup(D3,'Weekly Matchups'!$A$4:$J$500,10,false)` |
| `U` | Player Rating | formula |  | `=vlookup(C3,'Depth Charts'!F:H,2,false)` |
| `V` | Value | formula |  | `=F3/X3` |
| `W` | Fpros Name | static-or-imported |  | `` |
| `X` | Salary | formula |  | `=vlookup(W3,#REF!,5,false)` |
| `Y` | Depth | formula |  | `=vlookup(C3,'Depth Charts'!F:H,3,false)` |
| `Z` | OL Rating | static-or-imported |  | `` |
| `AA` | OL Rank | static-or-imported |  | `` |
| `AB` | PPG Rank | formula | `Sim Position Matchups` | `=VLOOKUP(D3,'Sim Position Matchups'!$B$3:$H$34,7,false)` |
| `AC` | QB Rating | formula | `Position Matchups` | `=vlookup(D3,'Position Matchups'!$A$2:$AA$33,10,false)` |
| `AD` | QB Rank | formula | `Position Matchups` | `=vlookup(D3,'Position Matchups'!$A$2:$C$33,3,false)` |
| `AE` | Player Rank | formula |  | `=RANK(U3,$U$3:$U$504)` |
| `AF` | Typical Red Zone Opportunities | formula |  | `=IFERROR(AVERAGE(BR3:CI3),"")` |
| `AG` | Typical Red Zone Opportunities Rounded Down | formula |  | `=IFERROR(FLOOR(AF3,0.25),"")` |
| `AH` | TE Red Zone Bonus | formula |  | `=AF3*1.5` |
| `AI` | LAST 5 Typical Red Zone Opportunities | formula |  | `=IFERROR( IFS( $A$2=6, SUMPRODUCT(N(BR3:BW3), {1,2,3,4,5,6}) / SUMPRODUCT({1,2,3,4,5,6}, N(ISNUMBER(BR3:BW3))), $A$2=7, SUMPRODUCT(N(BS3:BX3), {1,2,3,4,5,6}) / SUMPRODUCT({1,2,3,4,5,6}, N(ISNUMBER(BS3:BX3))), $A$2=8, SUM` |
| `AJ` | LAST 5 Typical Red Zone Opportunities Rounded Down | formula |  | `=IFERROR(FLOOR(AI3,0.25),"")` |
| `AK` | LAST 5 Red Zone Bonus | formula |  | `=IFERROR(AH3*1.5,"")` |
| `AL` | Typical Targets | formula |  | `=IFERROR(AVERAGE(CJ3:DA3),0)` |
| `AM` | Typical Targets Rounded Down | formula |  | `=IFERROR(FLOOR(AL3,1),"")` |
| `AN` | TE PPR Bonus | formula |  | `=IFERROR(AL3/1.8,"")` |
| `AO` | LAST 5 Typical Targets | formula |  | `=IFERROR( IFS( $A$2=6, SUMPRODUCT(N(CJ3:CN3), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(CJ3:CN3))), $A$2=7, SUMPRODUCT(N(CK3:CO3), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(CK3:CO3))), $A$2=8, SUMPRODUCT(` |
| `AP` | LAST 5 Typical Targets Rounded Down | formula |  | `=IFERROR(FLOOR(AO3,1),"")` |
| `AQ` | LAST 5 PPR Bonus | formula |  | `=IFERROR(AO3/1.8,"")` |
| `AR` | Typical Snap % | formula |  | `=IFERROR(AVERAGE(AZ3:BQ3),0)` |
| `AS` | Typical Snap % Rounded Down | formula |  | `=IFERROR(FLOOR(AR3,5),"")` |
| `AT` | Snap Score | formula |  | `=IFERROR((AR3-50)/8,"")` |
| `AU` | LAST 5 Typical Snap % | formula |  | `=IFERROR( IFS( $A$2=6, SUMPRODUCT(N(AZ3:BD3), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(AZ3:BD3))), $A$2=7, SUMPRODUCT(N(BA3:BE3), {1,2,3,4,5}) / SUMPRODUCT({1,2,3,4,5}, N(ISNUMBER(BA3:BE3))), $A$2=8, SUMPRODUCT(` |
| `AV` | LAST 5 Typical Snap % Rounded Down | formula |  | `=IFERROR(FLOOR(AU3,5),"")` |
| `AW` | LAST 5 Snap Score | formula |  | `=IFERROR(AU3/8,"")` |
| `AX` | Usage Score | formula |  | `=IFERROR(AVERAGE(AH3,AN3,AT3),"")` |
| `AY` | LAST 5 Usage Score | formula |  | `=IFERROR(AVERAGE(AK3,AQ3,AW3),"")` |
| `AZ` | Snap % Game 1 | static-or-imported |  | `` |
| `BA` | Snap % Game 2 | static-or-imported |  | `` |
| `BB` | Snap % Game 3 | static-or-imported |  | `` |
| `BC` | Snap % Game 4 | static-or-imported |  | `` |
| `BD` | Snap % Game 5 | static-or-imported |  | `` |
| `BE` | Snap % Game 6 | static-or-imported |  | `` |
| `BF` | Snap % Game 7 | static-or-imported |  | `` |
| `BG` | Snap % Game 8 | static-or-imported |  | `` |
| `BH` | Snap % Game 9 | static-or-imported |  | `` |
| `BI` | Snap % Game 10 | static-or-imported |  | `` |
| `BJ` | Snap % Game 11 | static-or-imported |  | `` |
| `BK` | Snap % Game 12 | static-or-imported |  | `` |
| `BL` | Snap % Game 13 | static-or-imported |  | `` |
| `BM` | Snap % Game 14 | static-or-imported |  | `` |
| `BN` | Snap % Game 15 | static-or-imported |  | `` |
| `BO` | Snap % Game 16 | static-or-imported |  | `` |
| `BP` | Snap % Game 17 | static-or-imported |  | `` |
| `BQ` | Snap % Game 18 | static-or-imported |  | `` |
| `BR` | Red Zone Game 1 | static-or-imported |  | `` |
| `BS` | Red Zone Game 2 | static-or-imported |  | `` |
| `BT` | Red Zone Game 3 | static-or-imported |  | `` |
| `BU` | Red Zone Game 4 | static-or-imported |  | `` |
| `BV` | Red Zone Game 5 | static-or-imported |  | `` |
| `BW` | Red Zone Game 6 | static-or-imported |  | `` |
| `BX` | Red Zone Game 7 | static-or-imported |  | `` |
| `BY` | Red Zone Game 8 | static-or-imported |  | `` |
| `BZ` | Red Zone Game 9 | static-or-imported |  | `` |
| `CA` | Red Zone Game 10 | static-or-imported |  | `` |
| `CB` | Red Zone Game 11 | static-or-imported |  | `` |
| `CC` | Red Zone Game 12 | static-or-imported |  | `` |
| `CD` | Red Zone Game 13 | static-or-imported |  | `` |
| `CE` | Red Zone Game 14 | static-or-imported |  | `` |
| `CF` | Red Zone Game 15 | static-or-imported |  | `` |
| `CG` | Red Zone Game 16 | static-or-imported |  | `` |
| `CH` | Red Zone Game 17 | static-or-imported |  | `` |
| `CI` | Red Zone Game 18 | static-or-imported |  | `` |
| `CJ` | Targets Game 1 | static-or-imported |  | `` |
| `CK` | Targets Game 2 | static-or-imported |  | `` |
| `CL` | Targets Game 3 | static-or-imported |  | `` |
| `CM` | Targets Game 4 | static-or-imported |  | `` |
| `CN` | Targets Game 5 | static-or-imported |  | `` |
| `CO` | Targets Game 6 | static-or-imported |  | `` |
| `CP` | Targets Game 7 | static-or-imported |  | `` |
| `CQ` | Targets Game 8 | static-or-imported |  | `` |
| `CR` | Targets Game 9 | static-or-imported |  | `` |
| `CS` | Targets Game 10 | static-or-imported |  | `` |
| `CT` | Targets Game 11 | static-or-imported |  | `` |
| `CU` | Targets Game 12 | static-or-imported |  | `` |
| `CV` | Targets Game 13 | static-or-imported |  | `` |
| `CW` | Targets Game 14 | static-or-imported |  | `` |
| `CX` | Targets Game 15 | static-or-imported |  | `` |
| `CY` | Targets Game 16 | static-or-imported |  | `` |
| `CZ` | Targets Game 17 | static-or-imported |  | `` |
| `DA` | Targets Game 18 | static-or-imported |  | `` |
| `DB` | DK Team | static-or-imported |  | `` |

### Weekly Defense Ranks

| Col | Header | Kind | Sources | Formula Preview |
|---|---|---|---|---|
| `B` | Team | static-or-imported |  | `` |
| `C` | Opponent | formula | `Weekly Matchups` | `=vlookup(B3,'Weekly Matchups'!$A$4:$B$107,2,false)` |
| `D` | Defense Rating | formula | `Live Rankings!` | `=VLOOKUP(B3, 'Live Rankings!'!$K$5:$T$100, 10, FALSE)` |
| `E` | DEF Rating Rank | formula |  | `=RANK(D3,$D$3:$D$39,true)` |
| `F` | Opponent Off Rating | formula | `Weekly Matchups` | `=(vlookup(B3,'Weekly Matchups'!$A$4:$K$107,11,false))*1.5` |
| `G` | Opp Off Rating Rank | formula |  | `=RANK(F3,$F$3:$F$39,true)` |
| `H` | Opp QB Rating | formula | `Live Rankings!` | `=vlookup(C3,'Live Rankings!'!$K$5:$BJ$36,52,false)` |
| `I` | OFF & Def Avg + Bad QB Bonus | formula |  | `=average(E3,G3)-((80-H3)/10)` |
| `J` | Rating | formula |  | `=IF(F3>100, 0, 100-I3+R3+(S3*3)+(T3/8))` |
| `K` | Rating Rank | formula |  | `=RANK(J3,$J$3:$J$34)` |
| `L` | Defense Rank | formula |  | `=IF(D3="","",RANK(D3,$D$3:$D$34,1))` |
| `M` | Value Rank | formula |  | `=RANK(N3,$N$3:$N$34)` |
| `N` | Value | formula |  | `=J3/P3` |
| `O` | FPros Name | static-or-imported |  | `` |
| `P` | Salary | static-or-imported |  | `` |
| `Q` | Salary Order | formula |  | `=RANK(P3,$P$3:$P$34)` |
| `R` | Sacks Per Game | formula |  | `=vlookup(B3,$AI$36:$AJ$67,2,false)` |
| `S` | Takeaways Per Game | formula |  | `=vlookup(B3,$AR$36:$AS$67,2,false)` |
| `T` | Opponent PPG Rank | formula |  | `=vlookup(B3,$AZ$36:$BA$67,2,false)` |
| `U` | Bonus Total | static-or-imported |  | `` |
| `V` | Bonus Rank | static-or-imported |  | `` |
| `W` | DK Team | static-or-imported |  | `` |
| `AH` | SACKS PASTE | static-or-imported |  | `` |
| `AJ` | Copy this to O | static-or-imported |  | `` |
| `AQ` | TAKEAWAYS | static-or-imported |  | `` |
| `AS` | Copy this to P | static-or-imported |  | `` |
| `AY` | OPPONENT PPG | static-or-imported |  | `` |

### Weekly Kicker Ranks

| Col | Header | Kind | Sources | Formula Preview |
|---|---|---|---|---|
| `B` | Player | static-or-imported |  | `` |
| `C` | Team | static-or-imported |  | `` |
| `D` | Opponent | formula | `Weekly Matchups` | `=VLOOKUP(C2, 'Weekly Matchups'!$A$4:$B$35, 2, FALSE)` |
| `E` | Player Rating | static-or-imported |  | `` |
| `F` | Player Rating /3 | formula |  | `=E2/3` |
| `G` | Off Avg | formula | `Team #s for Sim` | `=vlookup(C2,'Team #s for Sim'!$G$3:$K$34,5,false)` |
| `H` | Go % | static-or-imported |  | `` |
| `I` | 50+ | static-or-imported |  | `` |
| `J` | Dome | static-or-imported |  | `` |
| `K` | Score | formula |  | `=F2+G2+(H2/4)+(I2*1.5)+(J2*2)` |

### Fantasy QB Ranks

| Col | Header | Kind | Sources | Formula Preview |
|---|---|---|---|---|
| `A` |  | formula |  | `=RANK(F2,$F$2:$F$75)` |
| `B` | Position | static-or-imported |  | `` |
| `C` | Player | static-or-imported |  | `` |
| `D` | Team | static-or-imported |  | `` |
| `E` | Player Rating | formula |  | `=vlookup(C2,'Depth Charts'!F:H,4,false)` |
| `F` | SCORE | formula |  | `=E2-(I2*8)-(K2/6)-(K2/10)-(Q2/8)-(M2/10)-(S2/5)+(L2*3)+(sum(Z2:AC2)/2)` |
| `G` | Value | formula |  | `=H2-A2` |
| `H` | ADP | formula | `ADP` | `=vlookup(C2,ADP!$B$23:$F$700,5,false)` |
| `I` | Depth | formula |  | `=vlookup(C2,'Depth Charts'!F:H,5,false)` |
| `J` | OL Rating | formula | `Position Matchups` | `=vlookup(D2,'Position Matchups'!$A$2:$AA$33,10,false)` |
| `K` | OL Rank | formula | `Position Matchups` | `=VLOOKUP(D2, 'Position Matchups'!$A$2:$AA$33, 11, FALSE)` |
| `L` | OL Pass Block Bonus | formula | `OLine Boosts` | `=vlookup(D2,'OLine Boosts'!$I$2:$K$33,2,false)` |
| `M` | PPG Rank | formula | `Position Matchups` | `=VLOOKUP(D2, 'Position Matchups'!$A$2:$AA$33, 7, FALSE)` |
| `N` | QB Rating | static-or-imported |  | `` |
| `O` | QB Rank | static-or-imported |  | `` |
| `P` | WR Group Rating | formula | `Position Matchups` | `=vlookup(D2,'Position Matchups'!$A$2:$AA$33,6,false)` |
| `Q` | WR Group Rank | formula | `Position Matchups` | `=VLOOKUP(D2, 'Position Matchups'!$A$2:$AA$33, 7, FALSE)` |
| `R` | Opp vQB Rating | formula | `Sim Position Matchups` | `=vlookup(D2,'Sim Position Matchups'!$B$3:$AB$34,18,false)` |
| `S` | Opp vQB Schedule Rank (1 is easy) | formula | `Sim Position Matchups` | `=vlookup(D2,'Sim Position Matchups'!$B$3:$AF$34,30,false)` |
| `T` | Opp vRB Rating | static-or-imported |  | `` |
| `U` | Opp vRB Schedule Rank (1 is easy) | static-or-imported |  | `` |
| `V` | Opp vWR Rating | static-or-imported |  | `` |
| `W` | Opp vWR Rank (1 is easy) | static-or-imported |  | `` |
| `X` | Opp vTE Rating | static-or-imported |  | `` |
| `Y` | Opp vTE Schedule Rank | static-or-imported |  | `` |
| `Z` | QB Attempt Bonus | formula |  | `=vlookup(C2,$AM$2:$AN$74,2,false)` |
| `AA` | QB Pass TD Bonus | formula |  | `=vlookup(C2,$AS$2:$AT$952,2,false)` |
| `AB` | QB Rush Attempt Bonus | formula |  | `=vlookup(C2,$AX$2:$AY$148,2,false)` |
| `AC` | QB Rush TD Bonus | formula |  | `=IFNA(VLOOKUP(C2,$BC$2:$BD$200,2,FALSE), 0)` |
| `AD` | RB TD Bonus | static-or-imported |  | `` |
| `AE` | RB Receiving Bonus | static-or-imported |  | `` |
| `AF` | WR Red Zone Bonus | static-or-imported |  | `` |
| `AG` | WR PPR Bonus | static-or-imported |  | `` |
| `AH` | TE Red Zone Bonus | static-or-imported |  | `` |
| `AI` | TE PPR Bonus | static-or-imported |  | `` |
| `AM` | Pass Attempts | static-or-imported |  | `` |
| `AN` | Average weighted | formula |  | `=IF(AO2=0, AP2-1, IF(AP2=0, AO2, (AO2*0.8 + AP2*0.2)))` |
| `AO` | 2024.0 | static-or-imported |  | `` |
| `AP` | 2023.0 | static-or-imported |  | `` |
| `AS` | Pass TDs | static-or-imported |  | `` |
| `AT` | Average weighted | formula |  | `=IF(AU2=0, AV2-1, IF(AV2=0, AU2, (AU2*0.8 + AV2*0.2)))` |
| `AU` | 2024.0 | static-or-imported |  | `` |
| `AV` | 2023.0 | static-or-imported |  | `` |
| `AX` | Rush Attempts | static-or-imported |  | `` |
| `AY` | Average weighted | formula |  | `=IF(AZ2=0, BA2-1, IF(BA2=0, AZ2, (AZ2*0.8 + BA2*0.2)))` |
| `AZ` | 2024.0 | static-or-imported |  | `` |
| `BA` | 2023.0 | static-or-imported |  | `` |
| `BC` | Rush TDs | static-or-imported |  | `` |
| `BD` | Average weighted | formula |  | `=average((BE2*1.2),(BF2*0.8))` |
| `BE` | 2024.0 | static-or-imported |  | `` |
| `BF` | 2023.0 | static-or-imported |  | `` |

### Fantasy RB Ranks

| Col | Header | Kind | Sources | Formula Preview |
|---|---|---|---|---|
| `A` |  | formula |  | `=RANK(F2,$F$2:$F$150)` |
| `B` | Position | static-or-imported |  | `` |
| `C` | Player | static-or-imported |  | `` |
| `D` | Team | formula |  | `=vlookup(C2,'Depth Charts'!F:H,6,false)` |
| `E` | Player Rating | formula |  | `=vlookup(C2,'Depth Charts'!F:H,4,false)` |
| `F` | SCORE | formula |  | `=E2-(I2*8)-(K2/5)-(U2/7)+AA2+AB2+(L2*1.5)` |
| `G` | Value (Sort by Avg) | formula |  | `=H2-A2` |
| `H` | ADP | formula | `ADP` | `=vlookup(C2,ADP!$B$4:$F$999,5,false)` |
| `I` | Depth | formula |  | `=vlookup(C2,'Depth Charts'!F:H,5,false)` |
| `J` | OL Rating | formula | `Position Matchups` | `=vlookup(D2,'Position Matchups'!$A$2:$AA$33,10,false)` |
| `K` | OL Rank | formula | `Position Matchups` | `=VLOOKUP(D2, 'Position Matchups'!$A$2:$AA$33, 11, FALSE)` |
| `L` | OL Run Block Bonus | formula | `OLine Boosts` | `=vlookup(D2,'OLine Boosts'!$I$2:$K$332,3,false)` |
| `M` | PPG Rank | static-or-imported |  | `` |
| `N` | QB Rating | static-or-imported |  | `` |
| `O` | QB Rank | static-or-imported |  | `` |
| `P` | WR Group Rating | static-or-imported |  | `` |
| `Q` | WR Group Rank | static-or-imported |  | `` |
| `R` | Opp vQB Rating | static-or-imported |  | `` |
| `S` | Opp vQB Schedule Rank (1 is easy) | static-or-imported |  | `` |
| `T` | Opp vRB Rating | formula | `Sim Position Matchups` | `=vlookup(D2,'Sim Position Matchups'!$B$3:$AB$34,16,false)` |
| `U` | Opp vRB Schedule Rank (1 is easy) | formula | `Sim Position Matchups` | `=vlookup(D2,'Sim Position Matchups'!$B$3:$AF$34,28,false)` |
| `V` | Opp vWR Rating | static-or-imported |  | `` |
| `W` | Opp vWR Rank (1 is easy) | static-or-imported |  | `` |
| `X` | Opp vTE Rating | static-or-imported |  | `` |
| `Y` | Opp vTE Schedule Rank | static-or-imported |  | `` |
| `Z` | QB Rush Bonus | static-or-imported |  | `` |
| `AA` | RB TD Bonus (1-5) | formula |  | `=vlookup(C2,$AV$2:$AX$200,2,false)` |
| `AB` | RB Receiving Bonus (1-5) | formula |  | `=vlookup(C2,$AL$2:$AM$200,2,false)` |
| `AD` | WR Red Zone Bonus | static-or-imported |  | `` |
| `AE` | WR PPR Bonus | static-or-imported |  | `` |
| `AF` | TE Red Zone Bonus | static-or-imported |  | `` |
| `AG` | TE PPR Bonus | static-or-imported |  | `` |
| `AM` | Targets 2024/2023 Weighted | static-or-imported |  | `` |
| `AN` | 2024 Targets | static-or-imported |  | `` |
| `AO` | 2023 Targets | formula |  | `=vlookup(AL2,$AR$2:$AS$103,2,false)` |
| `AR` | 2023 Targets | static-or-imported |  | `` |
| `AV` | 2024 TDS | static-or-imported |  | `` |
| `AW` | Average Weighted | formula |  | `=(AX2 * 0.8) + (AX3 * 0.2)` |
| `AX` | 2024.0 | static-or-imported |  | `` |
| `AY` | 2023.0 | formula |  | `=vlookup(AV2,$BA$2:$BB$105,2,false)` |
| `BA` | 2023 TDs | static-or-imported |  | `` |

### Fantasy WR Ranks

| Col | Header | Kind | Sources | Formula Preview |
|---|---|---|---|---|
| `A` |  | formula |  | `=RANK(F2,$F$2:$F$179)` |
| `B` | Position | static-or-imported |  | `` |
| `C` | Player | static-or-imported |  | `` |
| `D` | Team | static-or-imported |  | `` |
| `E` | Player Rating | formula |  | `=vlookup(C2,'Depth Charts'!F:H,4,false)` |
| `F` | AVG | formula |  | `=E2-(I2*3)-(N2/8)-(L2/8)-(W2/7)+(AC2*2)+(AD2*2)+(AC2*2)+O2` |
| `G` | Value (Sort by Avg) | formula |  | `=H2-A2` |
| `H` | ADP | formula | `ADP` | `=vlookup(C2,ADP!$B$3:$F$999,5,false)` |
| `I` | Depth | formula |  | `=vlookup(C2,'Depth Charts'!F:H,5,false)` |
| `J` | OL Rating | static-or-imported |  | `` |
| `K` | OL Rank | static-or-imported |  | `` |
| `L` | PPG Rank | formula | `Position Matchups` | `=VLOOKUP(D2, 'Position Matchups'!$A$2:$AA$33, 11, FALSE)` |
| `M` | QB Rating | formula | `Position Matchups` | `=vlookup(D2,'Position Matchups'!$A$2:$AA$33,10,false)` |
| `N` | QB Rank | formula | `Position Matchups` | `=vlookup(D2,'Position Matchups'!$A$2:$C$33,3,false)` |
| `O` | Oline Pass Block Boost | formula | `OLine Boosts` | `=vlookup(D2,'OLine Boosts'!$I$2:$J$33,2,false)` |
| `P` | WR Group Rating | static-or-imported |  | `` |
| `Q` | WR Group Rank | static-or-imported |  | `` |
| `R` | Opp vQB Rating | static-or-imported |  | `` |
| `S` | Opp vQB Schedule Rank (1 is easy) | static-or-imported |  | `` |
| `T` | Opp vRB Rating | static-or-imported |  | `` |
| `U` | Opp vRB Schedule Rank (1 is easy) | static-or-imported |  | `` |
| `V` | Opp vWR Rating | formula | `Sim Position Matchups` | `=vlookup(D2,'Sim Position Matchups'!$B$3:$AB$34,18,false)` |
| `W` | Opp vWR Rank (1 is easy) | formula | `Sim Position Matchups` | `=vlookup(D2,'Sim Position Matchups'!$B$3:$AF$34,29,false)` |
| `X` | Opp vTE Rating | static-or-imported |  | `` |
| `Y` | Opp vTE Schedule Rank | static-or-imported |  | `` |
| `Z` | QB Rush Bonus | static-or-imported |  | `` |
| `AA` | RB TD Bonus | static-or-imported |  | `` |
| `AB` | RB Receiving Bonus | static-or-imported |  | `` |
| `AC` | WR Target Bonus | formula |  | `=vlookup(C2,$AJ$2:$AK$350,2,false)` |
| `AD` | WR TD Bonus | formula |  | `=vlookup(C2,$AP$2:$AQ$350,2,false)` |
| `AE` | TE Red Zone Bonus | static-or-imported |  | `` |
| `AF` | TE PPR Bonus | static-or-imported |  | `` |
| `AJ` | Targets | static-or-imported |  | `` |
| `AK` | Average Weighted | formula |  | `=IF(AL2=0, AM2-1, IF(AM2=0, AL2, (AL2*0.8 + AM2*0.2)))` |
| `AL` | 2024.0 | static-or-imported |  | `` |
| `AM` | 2023.0 | static-or-imported |  | `` |
| `AP` | TDs | static-or-imported |  | `` |
| `AQ` | Average Weighted | formula |  | `=IF(AR2=0, AS2-1, IF(AS2=0, AR2, (AR2*0.8 + AS2*0.2)))` |
| `AR` | 2024.0 | static-or-imported |  | `` |
| `AS` | 2023.0 | static-or-imported |  | `` |

### Fantasy TE Ranks

| Col | Header | Kind | Sources | Formula Preview |
|---|---|---|---|---|
| `B` | Position | static-or-imported |  | `` |
| `C` | Player | static-or-imported |  | `` |
| `D` | Team | static-or-imported |  | `` |
| `E` | Player Rating | formula |  | `=vlookup(C2,'Depth Charts'!F:H,4,false)` |
| `F` | SCORE | formula |  | `=E2-(I2*3)-(N2/8)-(L2/8)-(X2/7)+(AD2*2)+(AE2*2)` |
| `G` | Value | formula |  | `=H2-A2` |
| `H` | ESPN ADP POS Rank 9/5 | static-or-imported |  | `` |
| `I` | Depth | formula |  | `=vlookup(C2,'Depth Charts'!F:H,5,false)` |
| `J` | OL Rating | static-or-imported |  | `` |
| `K` | OL Rank | static-or-imported |  | `` |
| `L` | PPG Rank | formula | `Position Matchups` | `=VLOOKUP(D2, 'Position Matchups'!$A$2:$AA$33, 7, FALSE)` |
| `M` | QB Rating | formula | `Position Matchups` | `=vlookup(D2,'Position Matchups'!$A$2:$AA$33,10,false)` |
| `N` | QB Rank | formula | `Position Matchups` | `=vlookup(D2,'Position Matchups'!$A$2:$C$33,3,false)` |
| `O` | WR Group Rating | static-or-imported |  | `` |
| `P` | WR Group Rank | static-or-imported |  | `` |
| `Q` | Opp vQB Rating | static-or-imported |  | `` |
| `R` | Opp vQB Schedule Rank (1 is easy) | static-or-imported |  | `` |
| `S` | Opp vRB Rating | static-or-imported |  | `` |
| `T` | Opp vRB Schedule Rank (1 is easy) | static-or-imported |  | `` |
| `U` | Opp vWR Rating | static-or-imported |  | `` |
| `V` | Opp vWR Rank (1 is easy) | static-or-imported |  | `` |
| `W` | Opp vTE Rating | formula | `Sim Position Matchups` | `=vlookup(D2,'Sim Position Matchups'!$B$3:$AB$34,17,false)` |
| `X` | Opp vTE Schedule Rank | formula | `Sim Position Matchups` | `=vlookup(D2,'Sim Position Matchups'!$B$3:$AF$34,29,false)` |
| `Y` | QB Rush Bonus | static-or-imported |  | `` |
| `Z` | RB TD Bonus | static-or-imported |  | `` |
| `AA` | RB Receiving Bonus | static-or-imported |  | `` |
| `AB` | WR Red Zone Bonus | static-or-imported |  | `` |
| `AC` | WR PPR Bonus | static-or-imported |  | `` |
| `AD` | TE Red Zone Bonus (1-5) | formula |  | `=vlookup(C2,$AI$2:$AK$300,2,false)` |
| `AE` | TE PPR Bonus (1-3) | formula |  | `=vlookup(C2,$AI$2:$AK$300,3,false)` |

### Fantasy Defense Ranks

| Col | Header | Kind | Sources | Formula Preview |
|---|---|---|---|---|
| `C` | Defense Rating | formula | `Live Rankings!` | `=VLOOKUP(B3, 'Live Rankings!'!$K$5:$T$36, 10, FALSE)` |
| `D` | Opp Offenses | formula | `Sim Schedule` | `=(SUMIFS('Sim Schedule'!$M$3:$M$291,'Sim Schedule'!$F$3:$F$291,B3)+SUMIFS('Sim Schedule'!$H$3:$H$291,'Sim Schedule'!$K$3:$K$291,B3))/17` |
| `E` | Rating & Opp Avg | formula |  | `=average(C3,D3,F3)` |
| `F` | 4 Week Opponents | formula |  | `=average((I3*2),K3,M3,O3)` |
| `G` | Rating & Week 1 Only | formula |  | `=average(C3,I3)` |
| `H` | Week 1 | static-or-imported |  | `` |
| `I` |  | formula | `Live Rankings!` | `=vlookup(H3,'Live Rankings!'!$K$5:$T$36,9,false)` |
| `J` | Week 2 | static-or-imported |  | `` |
| `K` |  | formula | `Live Rankings!` | `=vlookup(J3,'Live Rankings!'!$K$5:$T$36,9,false)` |
| `L` | Week 3 | static-or-imported |  | `` |
| `M` |  | formula | `Live Rankings!` | `=vlookup(L3,'Live Rankings!'!$K$5:$T$36,9,false)` |
| `N` | Week 4 | static-or-imported |  | `` |
| `O` |  | formula | `Live Rankings!` | `=vlookup(N3,'Live Rankings!'!$K$5:$T$36,9,false)` |
| `P` | Defense Rank | formula |  | `=IF(C3="","",RANK(C3,$C$3:$C$34,1))` |

### Fantasy Kicker Ranks

| Col | Header | Kind | Sources | Formula Preview |
|---|---|---|---|---|
| `B` | Player | static-or-imported |  | `` |
| `C` | Team | static-or-imported |  | `` |
| `D` | ADP Rank | static-or-imported |  | `` |
| `E` | Player Rating | static-or-imported |  | `` |
| `F` | Player Rating /3 | formula |  | `=E2/3` |
| `G` | PPG | formula | `Sim Position Matchups` | `=vlookup(C2,'Sim Position Matchups'!$B$3:$H$34,7)` |
| `H` | Go % | static-or-imported |  | `` |
| `I` | 50+ | static-or-imported |  | `` |
| `J` | Dome | static-or-imported |  | `` |
| `K` | Score | formula |  | `=F2+G2+(H2/4)+(I2*1.5)+(J2*2)` |