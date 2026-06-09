/**
 * bracket-logic.ts
 *
 * FIFA World Cup 2026 — Annex C: Complete 495-combination lookup table.
 * Source: FIFA World Cup 26 Competition Regulations, May 2026, Annex C.
 *
 * Column interpretation:
 * Each row maps a specific combination of 8 advancing third-place teams
 * to the R32 bracket slot assignments. The 8 column keys (m73_1A etc.)
 * correspond to which match/group-winner slot receives which third-place team.
 *
 * Column headers from Annex C:
 *   1A = R32 slot paired with Group A winner (M79)
 *   1B = R32 slot paired with Group B winner (M87)
 *   1D = R32 slot paired with Group D winner (M84)
 *   1E = R32 slot paired with Group E winner (M74)
 *   1G = R32 slot paired with Group G winner (M83)
 *   1I = R32 slot paired with Group I winner (M78)
 *   1K = R32 slot paired with Group K winner (M86)
 *   1L = R32 slot paired with Group L winner (M80)
 *
 * The value "3X" means: third-placed team from group X fills this slot.
 */

export type Group = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

/** Bracket slot assignments for one Annex C option. */
export interface AnnexCRow {
  option: number;
  /** Third-place group assigned to each group-winner match slot. */
  m79_1A: Group;  // Group A winner (M79)
  m87_1B: Group;  // Group B winner (M87)
  m84_1D: Group;  // Group D winner (M84)
  m74_1E: Group;  // Group E winner (M74)
  m83_1G: Group;  // Group G winner (M83)
  m78_1I: Group;  // Group I winner (M78)
  m86_1K: Group;  // Group K winner (M86)
  m80_1L: Group;  // Group L winner (M80)
}

/**
 * All 495 Annex C combinations.
 * Indexed 0-based (option 1 = index 0).
 */
export const ANNEX_C: AnnexCRow[] = [
  { option: 1, m79_1A: 'E', m87_1B: 'J', m84_1D: 'I', m74_1E: 'F', m83_1G: 'H', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 2, m79_1A: 'H', m87_1B: 'G', m84_1D: 'I', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 3, m79_1A: 'E', m87_1B: 'J', m84_1D: 'I', m74_1E: 'D', m83_1G: 'H', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 4, m79_1A: 'E', m87_1B: 'J', m84_1D: 'I', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 5, m79_1A: 'E', m87_1B: 'G', m84_1D: 'I', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 6, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 7, m79_1A: 'E', m87_1B: 'G', m84_1D: 'I', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 8, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 9, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 10, m79_1A: 'H', m87_1B: 'G', m84_1D: 'I', m74_1E: 'C', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 11, m79_1A: 'E', m87_1B: 'J', m84_1D: 'I', m74_1E: 'C', m83_1G: 'H', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 12, m79_1A: 'E', m87_1B: 'J', m84_1D: 'I', m74_1E: 'C', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 13, m79_1A: 'E', m87_1B: 'G', m84_1D: 'I', m74_1E: 'C', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 14, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 15, m79_1A: 'E', m87_1B: 'G', m84_1D: 'I', m74_1E: 'C', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 16, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 17, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'H', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 18, m79_1A: 'H', m87_1B: 'G', m84_1D: 'I', m74_1E: 'C', m83_1G: 'J', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 19, m79_1A: 'C', m87_1B: 'J', m84_1D: 'I', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 20, m79_1A: 'C', m87_1B: 'G', m84_1D: 'I', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 21, m79_1A: 'C', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 22, m79_1A: 'C', m87_1B: 'G', m84_1D: 'I', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 23, m79_1A: 'C', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 24, m79_1A: 'C', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 25, m79_1A: 'E', m87_1B: 'J', m84_1D: 'I', m74_1E: 'C', m83_1G: 'H', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 26, m79_1A: 'E', m87_1B: 'G', m84_1D: 'I', m74_1E: 'C', m83_1G: 'J', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 27, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'H', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 28, m79_1A: 'E', m87_1B: 'G', m84_1D: 'I', m74_1E: 'C', m83_1G: 'H', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 29, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'H', m78_1I: 'D', m86_1K: 'L', m80_1L: 'I' },
  { option: 30, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'H', m78_1I: 'D', m86_1K: 'I', m80_1L: 'K' },
  { option: 31, m79_1A: 'C', m87_1B: 'J', m84_1D: 'E', m74_1E: 'D', m83_1G: 'I', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 32, m79_1A: 'C', m87_1B: 'J', m84_1D: 'E', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 33, m79_1A: 'C', m87_1B: 'E', m84_1D: 'I', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 34, m79_1A: 'C', m87_1B: 'J', m84_1D: 'E', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 35, m79_1A: 'C', m87_1B: 'J', m84_1D: 'E', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 36, m79_1A: 'C', m87_1B: 'G', m84_1D: 'E', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 37, m79_1A: 'C', m87_1B: 'G', m84_1D: 'E', m74_1E: 'D', m83_1G: 'I', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 38, m79_1A: 'C', m87_1B: 'G', m84_1D: 'E', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 39, m79_1A: 'C', m87_1B: 'G', m84_1D: 'E', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 40, m79_1A: 'C', m87_1B: 'G', m84_1D: 'E', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 41, m79_1A: 'C', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'E' },
  { option: 42, m79_1A: 'C', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'E', m80_1L: 'K' },
  { option: 43, m79_1A: 'C', m87_1B: 'G', m84_1D: 'E', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 44, m79_1A: 'C', m87_1B: 'G', m84_1D: 'E', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 45, m79_1A: 'C', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'E', m80_1L: 'I' },
  { option: 46, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'I', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 47, m79_1A: 'E', m87_1B: 'J', m84_1D: 'I', m74_1E: 'B', m83_1G: 'H', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 48, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'I', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 49, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'I', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 50, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'H', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 51, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'F', m83_1G: 'I', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 52, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'H', m78_1I: 'G', m86_1K: 'L', m80_1L: 'I' },
  { option: 53, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'H', m78_1I: 'G', m86_1K: 'I', m80_1L: 'K' },
  { option: 54, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'I', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 55, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'I', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 56, m79_1A: 'I', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 57, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 58, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'I', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 59, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 60, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 61, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'I', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 62, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'I', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 63, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 64, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'I', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 65, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'G', m86_1K: 'L', m80_1L: 'I' },
  { option: 66, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'G', m86_1K: 'I', m80_1L: 'K' },
  { option: 67, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'I', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 68, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 69, m79_1A: 'E', m87_1B: 'I', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 70, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 71, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 72, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 73, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'I', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 74, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 75, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 76, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 77, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'E' },
  { option: 78, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'E', m80_1L: 'K' },
  { option: 79, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 80, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 81, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'E', m80_1L: 'I' },
  { option: 82, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'I', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 83, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'I', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 84, m79_1A: 'I', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 85, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 86, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'I', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 87, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 88, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 89, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'I', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 90, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'I', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 91, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'H', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 92, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'I', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 93, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'H', m78_1I: 'G', m86_1K: 'L', m80_1L: 'I' },
  { option: 94, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'H', m78_1I: 'G', m86_1K: 'I', m80_1L: 'K' },
  { option: 95, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'I', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 96, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 97, m79_1A: 'E', m87_1B: 'I', m84_1D: 'B', m74_1E: 'C', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 98, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 99, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'H', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 100, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 101, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'I', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 102, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 103, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 104, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 105, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'E' },
  { option: 106, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'F', m86_1K: 'E', m80_1L: 'K' },
  { option: 107, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 108, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'H', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 109, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'F', m86_1K: 'E', m80_1L: 'I' },
  { option: 110, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'I', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 111, m79_1A: 'I', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 112, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 113, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'I', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 114, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'D', m86_1K: 'L', m80_1L: 'I' },
  { option: 115, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'D', m86_1K: 'I', m80_1L: 'K' },
  { option: 116, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'I', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 117, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 118, m79_1A: 'C', m87_1B: 'I', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 119, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 120, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 121, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 122, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'I', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 123, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 124, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 125, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 126, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'J' },
  { option: 127, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'F', m86_1K: 'D', m80_1L: 'K' },
  { option: 128, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 129, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 130, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'F', m86_1K: 'D', m80_1L: 'I' },
  { option: 131, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'I', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 132, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'H', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 133, m79_1A: 'E', m87_1B: 'I', m84_1D: 'B', m74_1E: 'C', m83_1G: 'H', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 134, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'H', m78_1I: 'D', m86_1K: 'L', m80_1L: 'I' },
  { option: 135, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'H', m78_1I: 'D', m86_1K: 'I', m80_1L: 'K' },
  { option: 136, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 137, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'I', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 138, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'D', m86_1K: 'L', m80_1L: 'I' },
  { option: 139, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'D', m86_1K: 'I', m80_1L: 'K' },
  { option: 140, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'H', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 141, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'D', m86_1K: 'L', m80_1L: 'E' },
  { option: 142, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'D', m86_1K: 'E', m80_1L: 'K' },
  { option: 143, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'H', m78_1I: 'D', m86_1K: 'L', m80_1L: 'I' },
  { option: 144, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'H', m78_1I: 'D', m86_1K: 'I', m80_1L: 'K' },
  { option: 145, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'D', m86_1K: 'E', m80_1L: 'I' },
  { option: 146, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'E', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 147, m79_1A: 'C', m87_1B: 'E', m84_1D: 'B', m74_1E: 'D', m83_1G: 'I', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 148, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'E', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 149, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'E', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 150, m79_1A: 'C', m87_1B: 'E', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 151, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'E' },
  { option: 152, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'E', m80_1L: 'K' },
  { option: 153, m79_1A: 'C', m87_1B: 'E', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 154, m79_1A: 'C', m87_1B: 'E', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 155, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'E', m80_1L: 'I' },
  { option: 156, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'E', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 157, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'L', m80_1L: 'E' },
  { option: 158, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'E', m80_1L: 'K' },
  { option: 159, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'E', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 160, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'E', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 161, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'J', m78_1I: 'F', m86_1K: 'E', m80_1L: 'I' },
  { option: 162, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'L', m80_1L: 'E' },
  { option: 163, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'E', m80_1L: 'K' },
  { option: 164, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'J', m78_1I: 'F', m86_1K: 'D', m80_1L: 'E' },
  { option: 165, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'H', m78_1I: 'F', m86_1K: 'E', m80_1L: 'I' },
  { option: 166, m79_1A: 'H', m87_1B: 'J', m84_1D: 'I', m74_1E: 'F', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 167, m79_1A: 'E', m87_1B: 'J', m84_1D: 'I', m74_1E: 'A', m83_1G: 'H', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 168, m79_1A: 'E', m87_1B: 'J', m84_1D: 'I', m74_1E: 'F', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 169, m79_1A: 'E', m87_1B: 'J', m84_1D: 'I', m74_1E: 'F', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 170, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'F', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 171, m79_1A: 'E', m87_1B: 'G', m84_1D: 'I', m74_1E: 'F', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 172, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'F', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'I' },
  { option: 173, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'F', m83_1G: 'A', m78_1I: 'H', m86_1K: 'I', m80_1L: 'K' },
  { option: 174, m79_1A: 'H', m87_1B: 'J', m84_1D: 'I', m74_1E: 'D', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 175, m79_1A: 'H', m87_1B: 'J', m84_1D: 'I', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 176, m79_1A: 'I', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 177, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 178, m79_1A: 'H', m87_1B: 'G', m84_1D: 'I', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 179, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 180, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 181, m79_1A: 'E', m87_1B: 'J', m84_1D: 'I', m74_1E: 'D', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 182, m79_1A: 'E', m87_1B: 'J', m84_1D: 'I', m74_1E: 'D', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 183, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 184, m79_1A: 'E', m87_1B: 'G', m84_1D: 'I', m74_1E: 'D', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 185, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'I' },
  { option: 186, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'H', m86_1K: 'I', m80_1L: 'K' },
  { option: 187, m79_1A: 'E', m87_1B: 'J', m84_1D: 'I', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 188, m79_1A: 'H', m87_1B: 'J', m84_1D: 'E', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 189, m79_1A: 'H', m87_1B: 'E', m84_1D: 'I', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 190, m79_1A: 'H', m87_1B: 'J', m84_1D: 'E', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 191, m79_1A: 'H', m87_1B: 'J', m84_1D: 'E', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 192, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 193, m79_1A: 'E', m87_1B: 'G', m84_1D: 'I', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 194, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 195, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 196, m79_1A: 'H', m87_1B: 'G', m84_1D: 'E', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 197, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'E' },
  { option: 198, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'K' },
  { option: 199, m79_1A: 'H', m87_1B: 'G', m84_1D: 'E', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 200, m79_1A: 'H', m87_1B: 'G', m84_1D: 'E', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 201, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'I' },
  { option: 202, m79_1A: 'H', m87_1B: 'J', m84_1D: 'I', m74_1E: 'C', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 203, m79_1A: 'H', m87_1B: 'J', m84_1D: 'I', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 204, m79_1A: 'I', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 205, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 206, m79_1A: 'H', m87_1B: 'G', m84_1D: 'I', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 207, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 208, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 209, m79_1A: 'E', m87_1B: 'J', m84_1D: 'I', m74_1E: 'C', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 210, m79_1A: 'E', m87_1B: 'J', m84_1D: 'I', m74_1E: 'C', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 211, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 212, m79_1A: 'E', m87_1B: 'G', m84_1D: 'I', m74_1E: 'C', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 213, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'I' },
  { option: 214, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'H', m86_1K: 'I', m80_1L: 'K' },
  { option: 215, m79_1A: 'E', m87_1B: 'J', m84_1D: 'I', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 216, m79_1A: 'H', m87_1B: 'J', m84_1D: 'E', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 217, m79_1A: 'H', m87_1B: 'E', m84_1D: 'I', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 218, m79_1A: 'H', m87_1B: 'J', m84_1D: 'E', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 219, m79_1A: 'H', m87_1B: 'J', m84_1D: 'E', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 220, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 221, m79_1A: 'E', m87_1B: 'G', m84_1D: 'I', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 222, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 223, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 224, m79_1A: 'H', m87_1B: 'G', m84_1D: 'E', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 225, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'E' },
  { option: 226, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'K' },
  { option: 227, m79_1A: 'H', m87_1B: 'G', m84_1D: 'E', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 228, m79_1A: 'H', m87_1B: 'G', m84_1D: 'E', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 229, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'I' },
  { option: 230, m79_1A: 'H', m87_1B: 'J', m84_1D: 'I', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 231, m79_1A: 'I', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 232, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 233, m79_1A: 'H', m87_1B: 'G', m84_1D: 'I', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 234, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'I' },
  { option: 235, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'I', m80_1L: 'K' },
  { option: 236, m79_1A: 'C', m87_1B: 'J', m84_1D: 'I', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 237, m79_1A: 'H', m87_1B: 'J', m84_1D: 'F', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 238, m79_1A: 'H', m87_1B: 'F', m84_1D: 'I', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 239, m79_1A: 'H', m87_1B: 'J', m84_1D: 'F', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'I' },
  { option: 240, m79_1A: 'H', m87_1B: 'J', m84_1D: 'F', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'I', m80_1L: 'K' },
  { option: 241, m79_1A: 'C', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 242, m79_1A: 'C', m87_1B: 'G', m84_1D: 'I', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 243, m79_1A: 'C', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 244, m79_1A: 'C', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 245, m79_1A: 'H', m87_1B: 'G', m84_1D: 'F', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 246, m79_1A: 'C', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'H' },
  { option: 247, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'D', m80_1L: 'K' },
  { option: 248, m79_1A: 'H', m87_1B: 'G', m84_1D: 'F', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'I' },
  { option: 249, m79_1A: 'H', m87_1B: 'G', m84_1D: 'F', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'I', m80_1L: 'K' },
  { option: 250, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'D', m80_1L: 'I' },
  { option: 251, m79_1A: 'E', m87_1B: 'J', m84_1D: 'I', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 252, m79_1A: 'H', m87_1B: 'J', m84_1D: 'E', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 253, m79_1A: 'H', m87_1B: 'E', m84_1D: 'I', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 254, m79_1A: 'H', m87_1B: 'J', m84_1D: 'E', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'I' },
  { option: 255, m79_1A: 'H', m87_1B: 'J', m84_1D: 'E', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'I', m80_1L: 'K' },
  { option: 256, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 257, m79_1A: 'E', m87_1B: 'G', m84_1D: 'I', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 258, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'I' },
  { option: 259, m79_1A: 'E', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'I', m80_1L: 'K' },
  { option: 260, m79_1A: 'H', m87_1B: 'G', m84_1D: 'E', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 261, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'E' },
  { option: 262, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'E', m80_1L: 'K' },
  { option: 263, m79_1A: 'H', m87_1B: 'G', m84_1D: 'E', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'I' },
  { option: 264, m79_1A: 'H', m87_1B: 'G', m84_1D: 'E', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'I', m80_1L: 'K' },
  { option: 265, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'E', m80_1L: 'I' },
  { option: 266, m79_1A: 'C', m87_1B: 'J', m84_1D: 'E', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 267, m79_1A: 'C', m87_1B: 'E', m84_1D: 'I', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 268, m79_1A: 'C', m87_1B: 'J', m84_1D: 'E', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 269, m79_1A: 'C', m87_1B: 'J', m84_1D: 'E', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 270, m79_1A: 'H', m87_1B: 'E', m84_1D: 'F', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 271, m79_1A: 'H', m87_1B: 'J', m84_1D: 'F', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'E' },
  { option: 272, m79_1A: 'H', m87_1B: 'J', m84_1D: 'E', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'D', m80_1L: 'K' },
  { option: 273, m79_1A: 'H', m87_1B: 'E', m84_1D: 'F', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'I' },
  { option: 274, m79_1A: 'H', m87_1B: 'E', m84_1D: 'F', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'I', m80_1L: 'K' },
  { option: 275, m79_1A: 'H', m87_1B: 'J', m84_1D: 'E', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'D', m80_1L: 'I' },
  { option: 276, m79_1A: 'C', m87_1B: 'G', m84_1D: 'E', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 277, m79_1A: 'C', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'E' },
  { option: 278, m79_1A: 'C', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'K' },
  { option: 279, m79_1A: 'C', m87_1B: 'G', m84_1D: 'E', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 280, m79_1A: 'C', m87_1B: 'G', m84_1D: 'E', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 281, m79_1A: 'C', m87_1B: 'G', m84_1D: 'J', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'I' },
  { option: 282, m79_1A: 'H', m87_1B: 'G', m84_1D: 'F', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'E' },
  { option: 283, m79_1A: 'H', m87_1B: 'G', m84_1D: 'E', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'D', m80_1L: 'K' },
  { option: 284, m79_1A: 'H', m87_1B: 'G', m84_1D: 'J', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'D', m80_1L: 'E' },
  { option: 285, m79_1A: 'H', m87_1B: 'G', m84_1D: 'E', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'D', m80_1L: 'I' },
  { option: 286, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'A', m83_1G: 'I', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 287, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'A', m83_1G: 'I', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 288, m79_1A: 'I', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 289, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 290, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'A', m83_1G: 'I', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 291, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'I' },
  { option: 292, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'G', m86_1K: 'I', m80_1L: 'K' },
  { option: 293, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'A', m83_1G: 'I', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 294, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'A', m83_1G: 'I', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 295, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'A', m83_1G: 'H', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 296, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'A', m83_1G: 'I', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 297, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'A', m83_1G: 'H', m78_1I: 'G', m86_1K: 'L', m80_1L: 'I' },
  { option: 298, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'A', m83_1G: 'H', m78_1I: 'G', m86_1K: 'I', m80_1L: 'K' },
  { option: 299, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'A', m83_1G: 'I', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 300, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 301, m79_1A: 'E', m87_1B: 'I', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 302, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'I' },
  { option: 303, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'H', m86_1K: 'I', m80_1L: 'K' },
  { option: 304, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 305, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'A', m83_1G: 'I', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 306, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'I' },
  { option: 307, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'G', m86_1K: 'I', m80_1L: 'K' },
  { option: 308, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 309, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'E' },
  { option: 310, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'G', m86_1K: 'E', m80_1L: 'K' },
  { option: 311, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'I' },
  { option: 312, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'H', m86_1K: 'I', m80_1L: 'K' },
  { option: 313, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'G', m86_1K: 'E', m80_1L: 'I' },
  { option: 314, m79_1A: 'I', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 315, m79_1A: 'I', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 316, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 317, m79_1A: 'I', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 318, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'I' },
  { option: 319, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'G', m86_1K: 'I', m80_1L: 'K' },
  { option: 320, m79_1A: 'I', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 321, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 322, m79_1A: 'H', m87_1B: 'I', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 323, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 324, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 325, m79_1A: 'F', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 326, m79_1A: 'I', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 327, m79_1A: 'F', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'I' },
  { option: 328, m79_1A: 'F', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'G', m86_1K: 'I', m80_1L: 'K' },
  { option: 329, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 330, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'J' },
  { option: 331, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'J', m80_1L: 'K' },
  { option: 332, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 333, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 334, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'J' },
  { option: 335, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'A', m83_1G: 'I', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 336, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 337, m79_1A: 'E', m87_1B: 'I', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 338, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'I' },
  { option: 339, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'H', m86_1K: 'I', m80_1L: 'K' },
  { option: 340, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 341, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'A', m83_1G: 'I', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 342, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'I' },
  { option: 343, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'G', m86_1K: 'I', m80_1L: 'K' },
  { option: 344, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 345, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'E' },
  { option: 346, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'G', m86_1K: 'E', m80_1L: 'K' },
  { option: 347, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'I' },
  { option: 348, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'H', m86_1K: 'I', m80_1L: 'K' },
  { option: 349, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'G', m86_1K: 'E', m80_1L: 'I' },
  { option: 350, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 351, m79_1A: 'E', m87_1B: 'I', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 352, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 353, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 354, m79_1A: 'H', m87_1B: 'E', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 355, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'E' },
  { option: 356, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'K' },
  { option: 357, m79_1A: 'H', m87_1B: 'E', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 358, m79_1A: 'H', m87_1B: 'E', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 359, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'I' },
  { option: 360, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 361, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'J' },
  { option: 362, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'J', m80_1L: 'K' },
  { option: 363, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 364, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 365, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'J' },
  { option: 366, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'E' },
  { option: 367, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'K' },
  { option: 368, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'J' },
  { option: 369, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'I' },
  { option: 370, m79_1A: 'I', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 371, m79_1A: 'I', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 372, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 373, m79_1A: 'I', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 374, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'I' },
  { option: 375, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'G', m86_1K: 'I', m80_1L: 'K' },
  { option: 376, m79_1A: 'I', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 377, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 378, m79_1A: 'H', m87_1B: 'I', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 379, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 380, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 381, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 382, m79_1A: 'I', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 383, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'I' },
  { option: 384, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'F', m83_1G: 'A', m78_1I: 'G', m86_1K: 'I', m80_1L: 'K' },
  { option: 385, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 386, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'J' },
  { option: 387, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'J', m80_1L: 'K' },
  { option: 388, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 389, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 390, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'J' },
  { option: 391, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'A', m83_1G: 'I', m78_1I: 'C', m86_1K: 'L', m80_1L: 'K' },
  { option: 392, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 393, m79_1A: 'E', m87_1B: 'I', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 394, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'I' },
  { option: 395, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'H', m86_1K: 'I', m80_1L: 'K' },
  { option: 396, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 397, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'A', m83_1G: 'I', m78_1I: 'C', m86_1K: 'L', m80_1L: 'K' },
  { option: 398, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'I' },
  { option: 399, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'G', m86_1K: 'I', m80_1L: 'K' },
  { option: 400, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'K' },
  { option: 401, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'E' },
  { option: 402, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'G', m86_1K: 'E', m80_1L: 'K' },
  { option: 403, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'H', m86_1K: 'L', m80_1L: 'I' },
  { option: 404, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'H', m86_1K: 'I', m80_1L: 'K' },
  { option: 405, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'G', m86_1K: 'E', m80_1L: 'I' },
  { option: 406, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 407, m79_1A: 'E', m87_1B: 'I', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 408, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 409, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 410, m79_1A: 'H', m87_1B: 'E', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 411, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'E' },
  { option: 412, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'K' },
  { option: 413, m79_1A: 'H', m87_1B: 'E', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 414, m79_1A: 'H', m87_1B: 'E', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 415, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'I' },
  { option: 416, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 417, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'J' },
  { option: 418, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'J', m80_1L: 'K' },
  { option: 419, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 420, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 421, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'J' },
  { option: 422, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'E' },
  { option: 423, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'K' },
  { option: 424, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'J' },
  { option: 425, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'I' },
  { option: 426, m79_1A: 'I', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 427, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 428, m79_1A: 'H', m87_1B: 'I', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 429, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'I' },
  { option: 430, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'I', m80_1L: 'K' },
  { option: 431, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'K' },
  { option: 432, m79_1A: 'I', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 433, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'G', m86_1K: 'L', m80_1L: 'I' },
  { option: 434, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'G', m86_1K: 'I', m80_1L: 'K' },
  { option: 435, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 436, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'J' },
  { option: 437, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'J', m80_1L: 'K' },
  { option: 438, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'I' },
  { option: 439, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'I', m80_1L: 'K' },
  { option: 440, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'I', m80_1L: 'J' },
  { option: 441, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 442, m79_1A: 'C', m87_1B: 'I', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 443, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 444, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 445, m79_1A: 'H', m87_1B: 'F', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 446, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'H' },
  { option: 447, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'D', m80_1L: 'K' },
  { option: 448, m79_1A: 'H', m87_1B: 'F', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'I' },
  { option: 449, m79_1A: 'H', m87_1B: 'F', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'I', m80_1L: 'K' },
  { option: 450, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'D', m80_1L: 'I' },
  { option: 451, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 452, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'J' },
  { option: 453, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'J', m80_1L: 'K' },
  { option: 454, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 455, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 456, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'J' },
  { option: 457, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'H' },
  { option: 458, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'D', m80_1L: 'K' },
  { option: 459, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'D', m80_1L: 'J' },
  { option: 460, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'D', m80_1L: 'I' },
  { option: 461, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 462, m79_1A: 'E', m87_1B: 'I', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 463, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'I' },
  { option: 464, m79_1A: 'E', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'I', m80_1L: 'K' },
  { option: 465, m79_1A: 'H', m87_1B: 'E', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 466, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'E' },
  { option: 467, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'E', m80_1L: 'K' },
  { option: 468, m79_1A: 'H', m87_1B: 'E', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'I' },
  { option: 469, m79_1A: 'H', m87_1B: 'E', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'I', m80_1L: 'K' },
  { option: 470, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'E', m80_1L: 'I' },
  { option: 471, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'K' },
  { option: 472, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'J' },
  { option: 473, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'J', m80_1L: 'K' },
  { option: 474, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'I' },
  { option: 475, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'I', m80_1L: 'K' },
  { option: 476, m79_1A: 'E', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'I', m80_1L: 'J' },
  { option: 477, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'E' },
  { option: 478, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'E', m80_1L: 'K' },
  { option: 479, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'E', m80_1L: 'J' },
  { option: 480, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'E', m80_1L: 'I' },
  { option: 481, m79_1A: 'C', m87_1B: 'E', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'K' },
  { option: 482, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'E' },
  { option: 483, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'K' },
  { option: 484, m79_1A: 'C', m87_1B: 'E', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'I' },
  { option: 485, m79_1A: 'C', m87_1B: 'E', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'I', m80_1L: 'K' },
  { option: 486, m79_1A: 'C', m87_1B: 'J', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'I' },
  { option: 487, m79_1A: 'H', m87_1B: 'F', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'D', m86_1K: 'L', m80_1L: 'E' },
  { option: 488, m79_1A: 'H', m87_1B: 'E', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'D', m80_1L: 'K' },
  { option: 489, m79_1A: 'H', m87_1B: 'J', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'D', m80_1L: 'E' },
  { option: 490, m79_1A: 'H', m87_1B: 'E', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'D', m80_1L: 'I' },
  { option: 491, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'L', m80_1L: 'E' },
  { option: 492, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'K' },
  { option: 493, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'J' },
  { option: 494, m79_1A: 'C', m87_1B: 'G', m84_1D: 'B', m74_1E: 'D', m83_1G: 'A', m78_1I: 'F', m86_1K: 'E', m80_1L: 'I' },
  { option: 495, m79_1A: 'H', m87_1B: 'G', m84_1D: 'B', m74_1E: 'C', m83_1G: 'A', m78_1I: 'F', m86_1K: 'D', m80_1L: 'E' },
];

/**
 * Given a set of 8 advancing third-place groups, find the matching Annex C row.
 * Returns null if no exact match (should never happen for a valid selection).
 */
export function lookupAnnexC(advancingGroups: Group[]): AnnexCRow | null {
  if (advancingGroups.length !== 8) return null;
  const key = [...advancingGroups].sort().join(',');
  for (const row of ANNEX_C) {
    const rowGroups: Group[] = [
      row.m79_1A, row.m87_1B, row.m84_1D, row.m74_1E,
      row.m83_1G, row.m78_1I, row.m86_1K, row.m80_1L,
    ];
    if ([...rowGroups].sort().join(',') === key) return row;
  }
  return null;
}

/**
 * Build the full R32 bracket given group results and advancing third-place teams.
 *
 * groupWinners: map of group -> winning team name
 * groupRunnersUp: map of group -> runner-up team name
 * thirdPlaceTeams: map of group -> team name (for advancing thirds only)
 * advancingThirdGroups: which 8 groups had their third-place team advance
 */
export interface R32Match {
  matchNumber: number;  // M73–M88
  team1: string;
  team2: string;
  team1Type: 'winner' | 'runner_up' | 'third';
  team2Type: 'winner' | 'runner_up' | 'third';
}

/**
 * Validate a full set of bracket picks against the R32 bracket and the
 * winner-chain (M89 feeds from M73/M74 etc). Returns only the picks that are
 * possible — anything keyed to the wrong match number (e.g. drafts corrupted by
 * the repeated-remap bug, fixed June 9 2026) is dropped so it can be re-picked.
 */
export function sanitizeBracketPicks(
  picks: Record<number, string>,
  r32: R32Match[]
): Record<number, string> {
  const cleaned: Record<number, string> = {}

  for (const m of r32) {
    const p = picks[m.matchNumber]
    if (p && (p === m.team1 || p === m.team2)) cleaned[m.matchNumber] = p
  }

  const FEEDERS: Record<number, [number, number]> = {
    89: [73, 74], 90: [75, 76], 91: [77, 78], 92: [79, 80],
    93: [81, 82], 94: [83, 84], 95: [85, 86], 96: [87, 88],
    97: [89, 90], 98: [91, 92], 99: [93, 94], 100: [95, 96],
    101: [97, 98], 102: [99, 100], 104: [101, 102],
  }
  for (const n of [89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 104]) {
    const p = picks[n]
    const [a, b] = FEEDERS[n]
    if (p && (p === cleaned[a] || p === cleaned[b])) cleaned[n] = p
  }

  // Bronze (M103): the two semifinal losers
  const loserOfSf = (sf: number, fa: number, fb: number): string | undefined => {
    const w = cleaned[sf]
    const a = cleaned[fa]
    const b = cleaned[fb]
    if (!w || !a || !b) return undefined
    return w === a ? b : w === b ? a : undefined
  }
  const bronze = picks[103]
  const l1 = loserOfSf(101, 97, 98)
  const l2 = loserOfSf(102, 99, 100)
  if (bronze && (bronze === l1 || bronze === l2)) cleaned[103] = bronze

  return cleaned
}

export function buildR32Bracket(
  groupWinners: Record<Group, string>,
  groupRunnersUp: Record<Group, string>,
  thirdPlaceTeams: Partial<Record<Group, string>>,
  advancingThirdGroups: Group[]
): R32Match[] | null {
  const annexRow = lookupAnnexC(advancingThirdGroups);
  if (!annexRow) return null;

  const t = (g: Group) => thirdPlaceTeams[g] ?? `3rd Place Group ${g}`;
  const w = (g: Group) => groupWinners[g] ?? `Winner Group ${g}`;
  const r = (g: Group) => groupRunnersUp[g] ?? `Runner-up Group ${g}`;

  // Fixed R32 structure from Art. 12.6 + Annex C. Array order determines R16 pairings
  // (consecutive pairs → M89…M96). Internal M73–M88 numbers may differ from official FIFA
  // sequential numbering but must stay consistent with vmt_matches and vmt_bracket_picks.
  return [
    { matchNumber: 73, team1: r('A'), team2: r('B'),           team1Type: 'runner_up', team2Type: 'runner_up' }, // → M89
    { matchNumber: 74, team1: w('E'), team2: t(annexRow.m74_1E), team1Type: 'winner',   team2Type: 'third'    }, // → M89
    { matchNumber: 75, team1: w('C'), team2: r('F'),           team1Type: 'winner',   team2Type: 'runner_up' }, // → M90
    { matchNumber: 76, team1: r('E'), team2: r('I'),           team1Type: 'runner_up', team2Type: 'runner_up' }, // → M90
    { matchNumber: 77, team1: w('F'), team2: r('C'),           team1Type: 'winner',   team2Type: 'runner_up' }, // → M91
    { matchNumber: 78, team1: w('I'), team2: t(annexRow.m78_1I), team1Type: 'winner',   team2Type: 'third'    }, // → M91
    { matchNumber: 79, team1: w('A'), team2: t(annexRow.m79_1A), team1Type: 'winner',   team2Type: 'third'    }, // → M92
    { matchNumber: 80, team1: w('L'), team2: t(annexRow.m80_1L), team1Type: 'winner',   team2Type: 'third'    }, // → M92
    { matchNumber: 81, team1: w('H'), team2: r('J'),           team1Type: 'winner',   team2Type: 'runner_up' }, // → M93
    { matchNumber: 82, team1: r('K'), team2: r('L'),           team1Type: 'runner_up', team2Type: 'runner_up' }, // → M93
    { matchNumber: 83, team1: w('G'), team2: t(annexRow.m83_1G), team1Type: 'winner',   team2Type: 'third'    }, // → M94
    { matchNumber: 84, team1: w('D'), team2: t(annexRow.m84_1D), team1Type: 'winner',   team2Type: 'third'    }, // → M94
    { matchNumber: 85, team1: r('D'), team2: r('G'),           team1Type: 'runner_up', team2Type: 'runner_up' }, // → M95
    { matchNumber: 86, team1: w('K'), team2: t(annexRow.m86_1K), team1Type: 'winner',   team2Type: 'third'    }, // → M95
    { matchNumber: 87, team1: w('B'), team2: t(annexRow.m87_1B), team1Type: 'winner',   team2Type: 'third'    }, // → M96
    { matchNumber: 88, team1: w('J'), team2: r('H'),           team1Type: 'winner',   team2Type: 'runner_up' }, // → M96
  ];
}