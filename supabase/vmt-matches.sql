-- VM-tips 2026 — Alla 72 gruppspelsmatcher
-- Källa: FIFA officiellt schema (FWC26 Match Schedule_v17_10042026_EN.pdf)
-- Tider i UTC (ET = UTC-4 under sommaren)
-- Dubbelkollad mot: cbssports.com/soccer/news/2026-world-cup-schedule-time-location-groups-bracket-usmnt

-- Rensa gamla matcher
DELETE FROM vmt_matches WHERE phase = 'group';

INSERT INTO vmt_matches (match_number, phase, group_label, home_team, away_team, kickoff, venue) VALUES

-- ═══════════════════════════════════
-- MATCHDAG 1
-- ═══════════════════════════════════

-- Torsdag 11 juni
(1,  'group', 'A', 'Mexiko',              'Sydafrika',      '2026-06-11 19:00:00+00', 'Estadio Azteca, Mexico City'),
(2,  'group', 'A', 'Sydkorea',      'Tjeckien',           '2026-06-12 02:00:00+00', 'Estadio Akron, Guadalajara'),

-- Fredag 12 juni
(3,  'group', 'B', 'Kanada',              'Bosnien-Hercegovina', '2026-06-12 19:00:00+00', 'BMO Field, Toronto'),
(4,  'group', 'D', 'USA',       'Paraguay',          '2026-06-13 01:00:00+00', 'SoFi Stadium, Los Angeles'),

-- Lördag 13 juni
(5,  'group', 'C', 'Haiti',               'Skottland',          '2026-06-14 01:00:00+00', 'Gillette Stadium, Boston'),
(6,  'group', 'D', 'Australien',           'Turkiet',           '2026-06-13 04:00:00+00', 'BC Place, Vancouver'),
(7,  'group', 'C', 'Brasilien',              'Marocko',           '2026-06-13 22:00:00+00', 'MetLife Stadium, New York'),
(8,  'group', 'B', 'Qatar',               'Schweiz',       '2026-06-13 19:00:00+00', 'Levi''s Stadium, San Francisco'),

-- Söndag 14 juni
(9,  'group', 'E', 'Elfenbenskusten',      'Ecuador',           '2026-06-14 23:00:00+00', 'Lincoln Financial Field, Philadelphia'),
(10, 'group', 'E', 'Tyskland',             'Curaçao',           '2026-06-14 17:00:00+00', 'NRG Stadium, Houston'),
(11, 'group', 'F', 'Nederländerna',         'Japan',             '2026-06-14 20:00:00+00', 'AT&T Stadium, Dallas'),
(12, 'group', 'F', 'Sverige',              'Tunisien',           '2026-06-15 02:00:00+00', 'Estadio BBVA, Monterrey'),

-- Måndag 15 juni
(13, 'group', 'H', 'Saudiarabien',        'Uruguay',           '2026-06-15 22:00:00+00', 'Hard Rock Stadium, Miami'),
(14, 'group', 'H', 'Spanien',               'Kap Verde',        '2026-06-15 16:00:00+00', 'Mercedes-Benz Stadium, Atlanta'),
(15, 'group', 'G', 'Iran',             'Nya Zeeland',       '2026-06-16 01:00:00+00', 'SoFi Stadium, Los Angeles'),
(16, 'group', 'G', 'Belgien',             'Egypten',             '2026-06-15 19:00:00+00', 'Lumen Field, Seattle'),

-- Tisdag 16 juni
(17, 'group', 'I', 'Frankrike',              'Senegal',           '2026-06-16 19:00:00+00', 'MetLife Stadium, New York'),
(18, 'group', 'I', 'Irak',                'Norge',            '2026-06-16 22:00:00+00', 'Gillette Stadium, Boston'),
(19, 'group', 'J', 'Argentina',           'Algeriet',           '2026-06-17 01:00:00+00', 'Arrowhead Stadium, Kansas City'),
(20, 'group', 'J', 'Österrike',             'Jordanien',            '2026-06-16 04:00:00+00', 'Levi''s Stadium, San Francisco'),

-- Onsdag 17 juni
(21, 'group', 'L', 'Ghana',               'Panama',            '2026-06-17 23:00:00+00', 'BMO Field, Toronto'),
(22, 'group', 'L', 'England',             'Kroatien',           '2026-06-17 20:00:00+00', 'AT&T Stadium, Dallas'),
(23, 'group', 'K', 'Portugal',            'Kongo-Kinshasa',          '2026-06-17 17:00:00+00', 'NRG Stadium, Houston'),
(24, 'group', 'K', 'Uzbekistan',          'Colombia',          '2026-06-18 02:00:00+00', 'Estadio Azteca, Mexico City'),

-- ═══════════════════════════════════
-- MATCHDAG 2
-- ═══════════════════════════════════

-- Torsdag 18 juni
(25, 'group', 'A', 'Tjeckien',             'Sydafrika',      '2026-06-18 16:00:00+00', 'Mercedes-Benz Stadium, Atlanta'),
(26, 'group', 'B', 'Schweiz',         'Bosnien-Hercegovina', '2026-06-18 19:00:00+00', 'SoFi Stadium, Los Angeles'),
(27, 'group', 'B', 'Kanada',              'Qatar',             '2026-06-18 22:00:00+00', 'BC Place, Vancouver'),
(28, 'group', 'A', 'Mexiko',              'Sydkorea',    '2026-06-19 01:00:00+00', 'Estadio Akron, Guadalajara'),

-- Fredag 19 juni
(29, 'group', 'C', 'Brasilien',              'Haiti',             '2026-06-20 00:30:00+00', 'Lincoln Financial Field, Philadelphia'),
(30, 'group', 'C', 'Skottland',            'Marocko',           '2026-06-19 22:00:00+00', 'Gillette Stadium, Boston'),
(31, 'group', 'D', 'Turkiet',             'Paraguay',          '2026-06-20 03:00:00+00', 'Levi''s Stadium, San Francisco'),
(32, 'group', 'D', 'USA',       'Australien',         '2026-06-19 19:00:00+00', 'Lumen Field, Seattle'),

-- Lördag 20 juni
(33, 'group', 'E', 'Tyskland',             'Elfenbenskusten',    '2026-06-20 20:00:00+00', 'BMO Field, Toronto'),
(34, 'group', 'E', 'Ecuador',             'Curaçao',           '2026-06-21 00:00:00+00', 'Arrowhead Stadium, Kansas City'),
(35, 'group', 'F', 'Nederländerna',         'Sverige',            '2026-06-20 17:00:00+00', 'NRG Stadium, Houston'),
(36, 'group', 'F', 'Tunisien',             'Japan',             '2026-06-20 04:00:00+00', 'Estadio BBVA, Monterrey'),

-- Söndag 21 juni
(37, 'group', 'H', 'Uruguay',             'Kap Verde',        '2026-06-21 22:00:00+00', 'Hard Rock Stadium, Miami'),
(38, 'group', 'H', 'Spanien',               'Saudiarabien',      '2026-06-21 16:00:00+00', 'Mercedes-Benz Stadium, Atlanta'),
(39, 'group', 'G', 'Belgien',             'Iran',           '2026-06-21 19:00:00+00', 'SoFi Stadium, Los Angeles'),
(40, 'group', 'G', 'Nya Zeeland',         'Egypten',             '2026-06-22 01:00:00+00', 'BC Place, Vancouver'),

-- Måndag 22 juni
(41, 'group', 'I', 'Norge',              'Senegal',           '2026-06-23 00:00:00+00', 'MetLife Stadium, New York'),
(42, 'group', 'I', 'Frankrike',              'Irak',              '2026-06-22 21:00:00+00', 'Lincoln Financial Field, Philadelphia'),
(43, 'group', 'J', 'Argentina',           'Österrike',           '2026-06-22 17:00:00+00', 'AT&T Stadium, Dallas'),
(44, 'group', 'J', 'Jordanien',              'Algeriet',           '2026-06-23 03:00:00+00', 'Levi''s Stadium, San Francisco'),

-- Tisdag 23 juni
(45, 'group', 'L', 'England',             'Ghana',             '2026-06-23 20:00:00+00', 'Gillette Stadium, Boston'),
(46, 'group', 'L', 'Panama',              'Kroatien',           '2026-06-23 23:00:00+00', 'BMO Field, Toronto'),
(47, 'group', 'K', 'Portugal',            'Uzbekistan',        '2026-06-23 17:00:00+00', 'NRG Stadium, Houston'),
(48, 'group', 'K', 'Colombia',            'Kongo-Kinshasa',          '2026-06-24 02:00:00+00', 'Estadio Akron, Guadalajara'),

-- ═══════════════════════════════════
-- MATCHDAG 3 (simultana par)
-- ═══════════════════════════════════

-- Onsdag 24 juni — Grupp B + C
(51, 'group', 'B', 'Schweiz',         'Kanada',            '2026-06-24 19:00:00+00', 'BC Place, Vancouver'),
(52, 'group', 'B', 'Bosnien-Hercegovina','Qatar',             '2026-06-24 19:00:00+00', 'Lumen Field, Seattle'),
(49, 'group', 'C', 'Skottland',            'Brasilien',            '2026-06-24 22:00:00+00', 'Hard Rock Stadium, Miami'),
(50, 'group', 'C', 'Marocko',             'Haiti',             '2026-06-24 22:00:00+00', 'Mercedes-Benz Stadium, Atlanta'),
(53, 'group', 'A', 'Tjeckien',             'Mexiko',            '2026-06-25 01:00:00+00', 'Estadio Azteca, Mexico City'),
(54, 'group', 'A', 'Sydafrika',        'Sydkorea',    '2026-06-25 01:00:00+00', 'Estadio BBVA, Monterrey'),

-- Torsdag 25 juni — Grupp D + E + F
(55, 'group', 'E', 'Curaçao',             'Elfenbenskusten',    '2026-06-25 20:00:00+00', 'Lincoln Financial Field, Philadelphia'),
(56, 'group', 'E', 'Ecuador',             'Tyskland',           '2026-06-25 20:00:00+00', 'MetLife Stadium, New York'),
(57, 'group', 'F', 'Japan',               'Sverige',            '2026-06-25 23:00:00+00', 'AT&T Stadium, Dallas'),
(58, 'group', 'F', 'Tunisien',             'Nederländerna',       '2026-06-25 23:00:00+00', 'Arrowhead Stadium, Kansas City'),
(59, 'group', 'D', 'Turkiet',             'USA',     '2026-06-26 02:00:00+00', 'SoFi Stadium, Los Angeles'),
(60, 'group', 'D', 'Paraguay',            'Australien',         '2026-06-26 02:00:00+00', 'Levi''s Stadium, San Francisco'),

-- Fredag 26 juni — Grupp G + H + I
(61, 'group', 'I', 'Norge',              'Frankrike',            '2026-06-26 19:00:00+00', 'Gillette Stadium, Boston'),
(62, 'group', 'I', 'Senegal',             'Irak',              '2026-06-26 19:00:00+00', 'BMO Field, Toronto'),
(65, 'group', 'H', 'Kap Verde',          'Saudiarabien',      '2026-06-27 00:00:00+00', 'NRG Stadium, Houston'),
(66, 'group', 'H', 'Uruguay',             'Spanien',             '2026-06-27 00:00:00+00', 'Estadio Akron, Guadalajara'),
(63, 'group', 'G', 'Egypten',               'Iran',           '2026-06-27 03:00:00+00', 'Lumen Field, Seattle'),
(64, 'group', 'G', 'Nya Zeeland',         'Belgien',           '2026-06-27 03:00:00+00', 'BC Place, Vancouver'),

-- Lördag 27 juni — Grupp J + K + L
(67, 'group', 'L', 'Panama',              'England',           '2026-06-27 21:00:00+00', 'MetLife Stadium, New York'),
(68, 'group', 'L', 'Kroatien',             'Ghana',             '2026-06-27 21:00:00+00', 'Lincoln Financial Field, Philadelphia'),
(71, 'group', 'K', 'Colombia',            'Portugal',          '2026-06-27 23:30:00+00', 'Hard Rock Stadium, Miami'),
(72, 'group', 'K', 'Kongo-Kinshasa',            'Uzbekistan',        '2026-06-27 23:30:00+00', 'Mercedes-Benz Stadium, Atlanta'),
(69, 'group', 'J', 'Algeriet',             'Österrike',           '2026-06-28 02:00:00+00', 'Arrowhead Stadium, Kansas City'),
(70, 'group', 'J', 'Jordanien',              'Argentina',         '2026-06-28 02:00:00+00', 'AT&T Stadium, Dallas');
