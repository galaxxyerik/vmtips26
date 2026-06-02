/**
 * A complete draft fixture used in Playwright tests.
 *
 * bracketPicks[73-88] are set to non-placeholder team names so that
 * the R16 (Åttondelsfinaler) buttons are enabled and clickable.
 * The names don't need to match the real R32 bracket output —
 * the bracket page uses whatever is in bracketPicks as the R16 team labels.
 */
export const TEST_DRAFT = {
  step: 'bracket',
  updatedAt: new Date().toISOString(),
  name: 'Playwright Test',
  email: 'test@ee.se',
  matchPicks: {},
  groupTableOrder: {
    A: ['Mexiko', 'Sydkorea', 'Tjeckien', 'Sydafrika'],
    B: ['Kanada', 'Schweiz', 'Bosnien-H.', 'Saudiarabien'],
    C: ['Brasilien', 'Marocko', 'Skottland', 'Kap Verde'],
    D: ['USA', 'Turkiet', 'Australien', 'Paraguay'],
    E: ['Tyskland', 'Ecuador', 'Elfenbenskusten', 'Uzbekistan'],
    F: ['Nederländerna', 'Sverige', 'Japan', 'Tunisien'],
    G: ['Belgien', 'Egypten', 'Iran', 'Qatar'],
    H: ['Spanien', 'Uruguay', 'Irak', 'Curaçao'],
    I: ['Frankrike', 'Norge', 'Senegal', 'Haiti'],
    J: ['Argentina', 'Österrike', 'Colombia', 'Algeriet'],
    K: ['Portugal', 'Ghana', 'Kongo DR', 'Panama'],
    L: ['England', 'Kroatien', 'Jordanien', 'Nya Zeeland'],
  },
  // 8 third-place teams must be selected for the bracket page to render
  thirdPlaceSelected: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  groupScorers: {},
  // R32 winners pre-filled — these unlock R16 buttons
  bracketPicks: {
    73: 'Brasilien',   74: 'Sverige',
    75: 'Spanien',     76: 'Frankrike',
    77: 'Argentina',   78: 'Portugal',
    79: 'Mexiko',      80: 'England',
    81: 'USA',         82: 'Belgien',
    83: 'Schweiz',     84: 'Uruguay',
    85: 'Kanada',      86: 'Turkiet',
    87: 'Norge',       88: 'Japan',
  },
  tournamentScorer: '',
}
