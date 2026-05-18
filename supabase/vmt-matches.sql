-- VM-tips 2026 — Alla 72 gruppspelsmatcher
-- Källa: FIFA officiellt schema (draw december 2024)
-- OBS: Verifiera kickoff-tider mot det officiella schemat på fifa.com
-- Tider anges i UTC (Sverige = UTC+2 under sommaren)

INSERT INTO vmt_matches (match_number, phase, group_label, home_team, away_team, kickoff, venue) VALUES

-- ═══════════════════════════════════
-- GRUPP A
-- ═══════════════════════════════════
-- Matchdag 1
(1,  'group', 'A', 'Mexico',    'Ecuador',    '2026-06-11 18:00:00+00', 'Estadio Azteca, Mexico City'),
(2,  'group', 'A', 'Canada',    'Uruguay',    '2026-06-12 01:00:00+00', 'BC Place, Vancouver'),
-- Matchdag 2
(3,  'group', 'A', 'Ecuador',   'Canada',     '2026-06-16 18:00:00+00', 'SoFi Stadium, Los Angeles'),
(4,  'group', 'A', 'Uruguay',   'Mexico',     '2026-06-16 21:00:00+00', 'MetLife Stadium, New York'),
-- Matchdag 3
(5,  'group', 'A', 'Uruguay',   'Ecuador',    '2026-06-20 21:00:00+00', 'AT&T Stadium, Dallas'),
(6,  'group', 'A', 'Mexico',    'Canada',     '2026-06-20 21:00:00+00', 'Estadio Azteca, Mexico City'),

-- ═══════════════════════════════════
-- GRUPP B
-- ═══════════════════════════════════
-- Matchdag 1
(7,  'group', 'B', 'Argentina', 'Peru',       '2026-06-12 21:00:00+00', 'MetLife Stadium, New York'),
(8,  'group', 'B', 'Chile',     'Australia',  '2026-06-13 00:00:00+00', 'SoFi Stadium, Los Angeles'),
-- Matchdag 2
(9,  'group', 'B', 'Peru',      'Chile',      '2026-06-17 18:00:00+00', 'Levi''s Stadium, San Francisco'),
(10, 'group', 'B', 'Australia', 'Argentina',  '2026-06-17 21:00:00+00', 'AT&T Stadium, Dallas'),
-- Matchdag 3
(11, 'group', 'B', 'Australia', 'Peru',       '2026-06-21 21:00:00+00', 'Rose Bowl, Los Angeles'),
(12, 'group', 'B', 'Argentina', 'Chile',      '2026-06-21 21:00:00+00', 'Hard Rock Stadium, Miami'),

-- ═══════════════════════════════════
-- GRUPP C
-- ═══════════════════════════════════
-- Matchdag 1
(13, 'group', 'C', 'USA',       'Serbia',     '2026-06-12 18:00:00+00', 'SoFi Stadium, Los Angeles'),
(14, 'group', 'C', 'Panama',    'Morocco',    '2026-06-13 01:00:00+00', 'AT&T Stadium, Dallas'),
-- Matchdag 2
(15, 'group', 'C', 'Serbia',    'Panama',     '2026-06-17 00:00:00+00', 'Levi''s Stadium, San Francisco'),
(16, 'group', 'C', 'Morocco',   'USA',        '2026-06-17 23:00:00+00', 'MetLife Stadium, New York'),
-- Matchdag 3
(17, 'group', 'C', 'Morocco',   'Serbia',     '2026-06-21 18:00:00+00', 'Hard Rock Stadium, Miami'),
(18, 'group', 'C', 'USA',       'Panama',     '2026-06-21 18:00:00+00', 'SoFi Stadium, Los Angeles'),

-- ═══════════════════════════════════
-- GRUPP D
-- ═══════════════════════════════════
-- Matchdag 1
(19, 'group', 'D', 'France',    'Colombia',   '2026-06-13 21:00:00+00', 'MetLife Stadium, New York'),
(20, 'group', 'D', 'Croatia',   'Honduras',   '2026-06-14 00:00:00+00', 'Estadio Guadalajara, Guadalajara'),
-- Matchdag 2
(21, 'group', 'D', 'Colombia',  'Croatia',    '2026-06-18 18:00:00+00', 'SoFi Stadium, Los Angeles'),
(22, 'group', 'D', 'Honduras',  'France',     '2026-06-18 21:00:00+00', 'AT&T Stadium, Dallas'),
-- Matchdag 3
(23, 'group', 'D', 'Honduras',  'Colombia',   '2026-06-22 21:00:00+00', 'Empower Field, Denver'),
(24, 'group', 'D', 'France',    'Croatia',    '2026-06-22 21:00:00+00', 'Hard Rock Stadium, Miami'),

-- ═══════════════════════════════════
-- GRUPP E
-- ═══════════════════════════════════
-- Matchdag 1
(25, 'group', 'E', 'Spain',     'Japan',      '2026-06-14 18:00:00+00', 'SoFi Stadium, Los Angeles'),
(26, 'group', 'E', 'Schweiz',   'South Korea','2026-06-15 00:00:00+00', 'Levi''s Stadium, San Francisco'),
-- Matchdag 2
(27, 'group', 'E', 'Japan',     'Schweiz',    '2026-06-19 00:00:00+00', 'BC Place, Vancouver'),
(28, 'group', 'E', 'South Korea','Spain',     '2026-06-19 21:00:00+00', 'MetLife Stadium, New York'),
-- Matchdag 3
(29, 'group', 'E', 'South Korea','Japan',     '2026-06-23 21:00:00+00', 'Rose Bowl, Los Angeles'),
(30, 'group', 'E', 'Spain',     'Schweiz',    '2026-06-23 21:00:00+00', 'Hard Rock Stadium, Miami'),

-- ═══════════════════════════════════
-- GRUPP F
-- ═══════════════════════════════════
-- Matchdag 1
(31, 'group', 'F', 'Brazil',    'Nigeria',    '2026-06-14 21:00:00+00', 'AT&T Stadium, Dallas'),
(32, 'group', 'F', 'Venezuela', 'Ivory Coast','2026-06-15 18:00:00+00', 'Hard Rock Stadium, Miami'),
-- Matchdag 2
(33, 'group', 'F', 'Nigeria',   'Venezuela',  '2026-06-19 18:00:00+00', 'MetLife Stadium, New York'),
(34, 'group', 'F', 'Ivory Coast','Brazil',    '2026-06-20 01:00:00+00', 'Levi''s Stadium, San Francisco'),
-- Matchdag 3
(35, 'group', 'F', 'Ivory Coast','Nigeria',   '2026-06-24 21:00:00+00', 'AT&T Stadium, Dallas'),
(36, 'group', 'F', 'Brazil',    'Venezuela',  '2026-06-24 21:00:00+00', 'SoFi Stadium, Los Angeles'),

-- ═══════════════════════════════════
-- GRUPP G
-- ═══════════════════════════════════
-- Matchdag 1
(37, 'group', 'G', 'England',   'Senegal',    '2026-06-15 21:00:00+00', 'MetLife Stadium, New York'),
(38, 'group', 'G', 'Netherlands','Saudi Arabia','2026-06-16 00:00:00+00', 'AT&T Stadium, Dallas'),
-- Matchdag 2
(39, 'group', 'G', 'Senegal',   'Netherlands','2026-06-20 18:00:00+00', 'Hard Rock Stadium, Miami'),
(40, 'group', 'G', 'Saudi Arabia','England',  '2026-06-20 21:00:00+00', 'Levi''s Stadium, San Francisco'),
-- Matchdag 3
(41, 'group', 'G', 'Saudi Arabia','Senegal',  '2026-06-24 18:00:00+00', 'BC Place, Vancouver'),
(42, 'group', 'G', 'England',   'Netherlands','2026-06-24 18:00:00+00', 'SoFi Stadium, Los Angeles'),

-- ═══════════════════════════════════
-- GRUPP H
-- ═══════════════════════════════════
-- Matchdag 1
(43, 'group', 'H', 'Portugal',  'Iran',       '2026-06-16 18:00:00+00', 'SoFi Stadium, Los Angeles'),
(44, 'group', 'H', 'Algeria',   'Paraguay',   '2026-06-16 21:00:00+00', 'MetLife Stadium, New York'),
-- Matchdag 2
(45, 'group', 'H', 'Iran',      'Algeria',    '2026-06-20 18:00:00+00', 'Estadio Azteca, Mexico City'),
(46, 'group', 'H', 'Paraguay',  'Portugal',   '2026-06-20 21:00:00+00', 'Hard Rock Stadium, Miami'),
-- Matchdag 3
(47, 'group', 'H', 'Paraguay',  'Iran',       '2026-06-25 21:00:00+00', 'AT&T Stadium, Dallas'),
(48, 'group', 'H', 'Portugal',  'Algeria',    '2026-06-25 21:00:00+00', 'Rose Bowl, Los Angeles'),

-- ═══════════════════════════════════
-- GRUPP I
-- ═══════════════════════════════════
-- Matchdag 1
(49, 'group', 'I', 'Germany',   'Turkey',     '2026-06-17 18:00:00+00', 'MetLife Stadium, New York'),
(50, 'group', 'I', 'Scotland',  'South Africa','2026-06-17 21:00:00+00', 'SoFi Stadium, Los Angeles'),
-- Matchdag 2
(51, 'group', 'I', 'Turkey',    'Scotland',   '2026-06-21 18:00:00+00', 'Hard Rock Stadium, Miami'),
(52, 'group', 'I', 'South Africa','Germany',  '2026-06-21 21:00:00+00', 'AT&T Stadium, Dallas'),
-- Matchdag 3
(53, 'group', 'I', 'South Africa','Turkey',   '2026-06-25 18:00:00+00', 'Estadio BBVA, Monterrey'),
(54, 'group', 'I', 'Germany',   'Scotland',   '2026-06-25 18:00:00+00', 'MetLife Stadium, New York'),

-- ═══════════════════════════════════
-- GRUPP J
-- ═══════════════════════════════════
-- Matchdag 1
(55, 'group', 'J', 'Belgium',   'Egypt',      '2026-06-13 18:00:00+00', 'AT&T Stadium, Dallas'),
(56, 'group', 'J', 'Austria',   'Cameroon',   '2026-06-14 01:00:00+00', 'Levi''s Stadium, San Francisco'),
-- Matchdag 2
(57, 'group', 'J', 'Egypt',     'Austria',    '2026-06-18 00:00:00+00', 'SoFi Stadium, Los Angeles'),
(58, 'group', 'J', 'Cameroon',  'Belgium',    '2026-06-18 18:00:00+00', 'MetLife Stadium, New York'),
-- Matchdag 3
(59, 'group', 'J', 'Cameroon',  'Egypt',      '2026-06-22 18:00:00+00', 'Empower Field, Denver'),
(60, 'group', 'J', 'Belgium',   'Austria',    '2026-06-22 18:00:00+00', 'Hard Rock Stadium, Miami'),

-- ═══════════════════════════════════
-- GRUPP K
-- ═══════════════════════════════════
-- Matchdag 1
(61, 'group', 'K', 'Ghana',     'Honduras',   '2026-06-13 23:00:00+00', 'Rose Bowl, Los Angeles'),
(62, 'group', 'K', 'New Zealand','Denmark',   '2026-06-15 01:00:00+00', 'BC Place, Vancouver'),
-- Matchdag 2
(63, 'group', 'K', 'Honduras',  'New Zealand','2026-06-19 18:00:00+00', 'AT&T Stadium, Dallas'),
(64, 'group', 'K', 'Denmark',   'Ghana',      '2026-06-19 21:00:00+00', 'MetLife Stadium, New York'),
-- Matchdag 3
(65, 'group', 'K', 'Denmark',   'Honduras',   '2026-06-23 18:00:00+00', 'SoFi Stadium, Los Angeles'),
(66, 'group', 'K', 'Ghana',     'New Zealand','2026-06-23 18:00:00+00', 'Hard Rock Stadium, Miami'),

-- ═══════════════════════════════════
-- GRUPP L
-- ═══════════════════════════════════
-- Matchdag 1
(67, 'group', 'L', 'Ukraine',   'Mali',       '2026-06-15 18:00:00+00', 'Levi''s Stadium, San Francisco'),
(68, 'group', 'L', 'Jamaica',   'Iraq',       '2026-06-16 01:00:00+00', 'Rose Bowl, Los Angeles'),
-- Matchdag 2
(69, 'group', 'L', 'Mali',      'Jamaica',    '2026-06-20 00:00:00+00', 'MetLife Stadium, New York'),
(70, 'group', 'L', 'Iraq',      'Ukraine',    '2026-06-20 18:00:00+00', 'SoFi Stadium, Los Angeles'),
-- Matchdag 3
(71, 'group', 'L', 'Iraq',      'Mali',       '2026-06-24 18:00:00+00', 'AT&T Stadium, Dallas'),
(72, 'group', 'L', 'Ukraine',   'Jamaica',    '2026-06-24 18:00:00+00', 'Hard Rock Stadium, Miami');
