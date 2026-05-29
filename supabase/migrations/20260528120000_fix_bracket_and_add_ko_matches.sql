-- Fix 5 group stage kickoff time errors, remap existing R32 bracket picks
-- to corrected match numbers, clear invalidated R16+ picks, and insert
-- all 32 KO matches (M73–M104) into vmt_matches.

-- ══════════════════════════════════════════════════════════════════════
-- 1. GROUP STAGE KICKOFF FIXES
-- ══════════════════════════════════════════════════════════════════════

-- M6: Australien–Turkiet date was one day early
UPDATE vmt_matches SET kickoff = '2026-06-14 04:00:00+00' WHERE match_number = 6;
-- M20: Österrike–Jordanien date was one day early
UPDATE vmt_matches SET kickoff = '2026-06-17 04:00:00+00' WHERE match_number = 20;
-- M29: Brasilien–Haiti was 00:30 instead of 01:00
UPDATE vmt_matches SET kickoff = '2026-06-20 01:00:00+00' WHERE match_number = 29;
-- M31: Turkiet–Paraguay was 03:00 instead of 04:00
UPDATE vmt_matches SET kickoff = '2026-06-20 04:00:00+00' WHERE match_number = 31;
-- M36: Tunisien–Japan date was one day early
UPDATE vmt_matches SET kickoff = '2026-06-21 04:00:00+00' WHERE match_number = 36;

-- ══════════════════════════════════════════════════════════════════════
-- 2. MIGRATE EXISTING R32 BRACKET PICKS
--    bracket-logic.ts reordered the R32 array, so internal match numbers
--    M75–M78 and M81–M88 have been reassigned to different fixtures.
--    Remap picks so each pick stays with its original fixture.
--
--    Mapping (old → new):
--      75→77, 76→75, 77→78, 78→76
--      81→84, 82→83, 83→82, 84→81
--      85→87, 86→88, 87→86, 88→85
--    M73, M74, M79, M80 are unchanged.
--
--    Strategy: shift affected rows to temp numbers (add 1000) first to
--    avoid unique-constraint conflicts, then shift to final numbers.
-- ══════════════════════════════════════════════════════════════════════

-- Step 2a: Move affected R32 picks to temporary numbers
UPDATE vmt_bracket_picks
SET match_number = match_number + 1000
WHERE match_number IN (75, 76, 77, 78, 81, 82, 83, 84, 85, 86, 87, 88)
  AND round = 'r32';

-- Step 2b: Remap to correct new numbers
UPDATE vmt_bracket_picks SET match_number = 77 WHERE match_number = 1075 AND round = 'r32';
UPDATE vmt_bracket_picks SET match_number = 75 WHERE match_number = 1076 AND round = 'r32';
UPDATE vmt_bracket_picks SET match_number = 78 WHERE match_number = 1077 AND round = 'r32';
UPDATE vmt_bracket_picks SET match_number = 76 WHERE match_number = 1078 AND round = 'r32';
UPDATE vmt_bracket_picks SET match_number = 84 WHERE match_number = 1081 AND round = 'r32';
UPDATE vmt_bracket_picks SET match_number = 83 WHERE match_number = 1082 AND round = 'r32';
UPDATE vmt_bracket_picks SET match_number = 82 WHERE match_number = 1083 AND round = 'r32';
UPDATE vmt_bracket_picks SET match_number = 81 WHERE match_number = 1084 AND round = 'r32';
UPDATE vmt_bracket_picks SET match_number = 87 WHERE match_number = 1085 AND round = 'r32';
UPDATE vmt_bracket_picks SET match_number = 88 WHERE match_number = 1086 AND round = 'r32';
UPDATE vmt_bracket_picks SET match_number = 86 WHERE match_number = 1087 AND round = 'r32';
UPDATE vmt_bracket_picks SET match_number = 85 WHERE match_number = 1088 AND round = 'r32';

-- ══════════════════════════════════════════════════════════════════════
-- 3. CLEAR R16+ BRACKET PICKS
--    The R16 bracket structure changed (different R32 pairs feed each
--    R16 slot), so all R16 and later picks are no longer valid.
-- ══════════════════════════════════════════════════════════════════════

DELETE FROM vmt_bracket_picks WHERE match_number >= 89;

-- ══════════════════════════════════════════════════════════════════════
-- 4. INSERT KO MATCHES INTO vmt_matches
--
--    Internal match numbers (M73–M88) reflect bracket-logic.ts ordering,
--    which reorders some official FIFA match slots so consecutive pairs
--    produce the correct R16 pairings.
--
--    Internal → Official FIFA mapping for R32:
--      M73=FIFA73 (2A/2B)   M74=FIFA75 (1E/3rd)  M75=FIFA74 (1C/2F)
--      M76=FIFA77 (2E/2I)   M77=FIFA76 (1F/2C)   M78=FIFA78 (1I/3rd)
--      M79=FIFA79 (1A/3rd)  M80=FIFA80 (1L/3rd)
--      M81=FIFA83 (1H/2J)   M82=FIFA84 (2K/2L)   M83=FIFA81 (1G/3rd)
--      M84=FIFA82 (1D/3rd)  M85=FIFA86 (2D/2G)   M86=FIFA88 (1K/3rd)
--      M87=FIFA85 (1B/3rd)  M88=FIFA87 (1J/2H)
--
--    Kickoff times are UTC (CEST - 2h). home_team/away_team are slot
--    descriptions — admin updates them with actual team names as groups finish.
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO vmt_matches (match_number, phase, home_team, away_team, kickoff) VALUES

-- R32 (Sextondelsfinal) ─────────────────────────────────────────────
-- M73 = internal=official: 2A vs 2B, June 28 21:00 CEST = 19:00 UTC
(73,  'r32', 'Tvåa Grupp A',       'Tvåa Grupp B',       '2026-06-28 19:00:00+00'),
-- M74 = official M75: 1E vs 3rd, June 29 22:30 CEST = 20:30 UTC
(74,  'r32', 'Etta Grupp E',       'Trea (Annex C)',      '2026-06-29 20:30:00+00'),
-- M75 = official M74: 1C vs 2F, June 29 19:00 CEST = 17:00 UTC
(75,  'r32', 'Etta Grupp C',       'Tvåa Grupp F',       '2026-06-29 17:00:00+00'),
-- M76 = official M77: 2E vs 2I, June 30 19:00 CEST = 17:00 UTC
(76,  'r32', 'Tvåa Grupp E',       'Tvåa Grupp I',       '2026-06-30 17:00:00+00'),
-- M77 = official M76: 1F vs 2C, June 30 03:00 CEST = 01:00 UTC
(77,  'r32', 'Etta Grupp F',       'Tvåa Grupp C',       '2026-06-30 01:00:00+00'),
-- M78 = official M78: 1I vs 3rd, June 30 23:00 CEST = 21:00 UTC
(78,  'r32', 'Etta Grupp I',       'Trea (Annex C)',      '2026-06-30 21:00:00+00'),
-- M79 = official M79: 1A vs 3rd, July 1 03:00 CEST = 01:00 UTC
(79,  'r32', 'Etta Grupp A',       'Trea (Annex C)',      '2026-07-01 01:00:00+00'),
-- M80 = official M80: 1L vs 3rd, July 1 18:00 CEST = 16:00 UTC
(80,  'r32', 'Etta Grupp L',       'Trea (Annex C)',      '2026-07-01 16:00:00+00'),
-- M81 = official M83: 1H vs 2J, July 2 21:00 CEST = 19:00 UTC
(81,  'r32', 'Etta Grupp H',       'Tvåa Grupp J',       '2026-07-02 19:00:00+00'),
-- M82 = official M84: 2K vs 2L, July 3 01:00 CEST = 23:00 UTC (July 2)
(82,  'r32', 'Tvåa Grupp K',       'Tvåa Grupp L',       '2026-07-02 23:00:00+00'),
-- M83 = official M81: 1G vs 3rd, July 1 22:00 CEST = 20:00 UTC
(83,  'r32', 'Etta Grupp G',       'Trea (Annex C)',      '2026-07-01 20:00:00+00'),
-- M84 = official M82: 1D vs 3rd, July 2 02:00 CEST = 00:00 UTC (July 2)
(84,  'r32', 'Etta Grupp D',       'Trea (Annex C)',      '2026-07-02 00:00:00+00'),
-- M85 = official M86: 2D vs 2G, July 3 20:00 CEST = 18:00 UTC
(85,  'r32', 'Tvåa Grupp D',       'Tvåa Grupp G',       '2026-07-03 18:00:00+00'),
-- M86 = official M88: 1K vs 3rd, July 4 03:30 CEST = 01:30 UTC
(86,  'r32', 'Etta Grupp K',       'Trea (Annex C)',      '2026-07-04 01:30:00+00'),
-- M87 = official M85: 1B vs 3rd, July 3 05:00 CEST = 03:00 UTC
(87,  'r32', 'Etta Grupp B',       'Trea (Annex C)',      '2026-07-03 03:00:00+00'),
-- M88 = official M87: 1J vs 2H, July 4 00:00 CEST = 22:00 UTC (July 3)
(88,  'r32', 'Etta Grupp J',       'Tvåa Grupp H',       '2026-07-03 22:00:00+00'),

-- R16 (Åttondelsfinal) ──────────────────────────────────────────────
-- Pairings: M89=W73+W74, M90=W75+W76, M91=W77+W78, M92=W79+W80
--           M93=W81+W82, M94=W83+W84, M95=W85+W86, M96=W87+W88
(89,  'r16', 'Vinnare M73',        'Vinnare M74',        '2026-07-04 17:00:00+00'),
(90,  'r16', 'Vinnare M75',        'Vinnare M76',        '2026-07-04 21:00:00+00'),
(91,  'r16', 'Vinnare M77',        'Vinnare M78',        '2026-07-05 20:00:00+00'),
(92,  'r16', 'Vinnare M79',        'Vinnare M80',        '2026-07-06 00:00:00+00'),
(93,  'r16', 'Vinnare M81',        'Vinnare M82',        '2026-07-06 19:00:00+00'),
(94,  'r16', 'Vinnare M83',        'Vinnare M84',        '2026-07-07 00:00:00+00'),
(95,  'r16', 'Vinnare M85',        'Vinnare M86',        '2026-07-07 16:00:00+00'),
(96,  'r16', 'Vinnare M87',        'Vinnare M88',        '2026-07-07 20:00:00+00'),

-- Kvartsfinal ────────────────────────────────────────────────────────
(97,  'qf',  'Vinnare M89',        'Vinnare M90',        '2026-07-09 20:00:00+00'),
(98,  'qf',  'Vinnare M91',        'Vinnare M92',        '2026-07-11 21:00:00+00'),
(99,  'qf',  'Vinnare M93',        'Vinnare M94',        '2026-07-10 19:00:00+00'),
(100, 'qf',  'Vinnare M95',        'Vinnare M96',        '2026-07-12 01:00:00+00'),

-- Semifinal ──────────────────────────────────────────────────────────
(101, 'sf',  'Vinnare M97',        'Vinnare M98',        '2026-07-14 19:00:00+00'),
(102, 'sf',  'Vinnare M99',        'Vinnare M100',       '2026-07-15 19:00:00+00'),

-- Bronsmatch ─────────────────────────────────────────────────────────
(103, 'bronze', 'Förlorare M101',  'Förlorare M102',     '2026-07-18 21:00:00+00'),

-- Final ──────────────────────────────────────────────────────────────
(104, 'final',  'Vinnare M101',    'Vinnare M102',       '2026-07-19 19:00:00+00')

ON CONFLICT (match_number) DO NOTHING;
