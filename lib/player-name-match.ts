/**
 * Fuzzy player name matching for top scorer picks.
 * Handles diacritics, apostrophes, common misspellings and partial names.
 *
 * Examples that should match "Kylian Mbappe":
 *   mbappe, mbappé, mbape, mbaoppe, kylian, kylian mbappe, Mbappe
 *
 * Examples that should match "Erling Haaland":
 *   haaland, haland, erling, Erling Haaland
 *
 * Examples that should match "Viktor Gyokeres":
 *   gyokeres, gyokeres, viktor, viktor gyokeres, gyökeres
 */

function normalize(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/'/g, '')
    .replace(/[^a-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const curr = [i]
    for (let j = 1; j <= b.length; j++) {
      curr[j] =
        a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1])
    }
    prev.splice(0, prev.length, ...curr)
  }
  return prev[b.length]
}

/**
 * Returns true if `guess` is a reasonable match for `actual`.
 * Matching rules (after normalization):
 *  1. Exact match
 *  2. Full-string edit distance <= 2
 *  3. One-word guess within edit-distance 2 of any name part
 *  4. Multi-word guess: every guess-word matches some actual-word within edit-distance 1
 */
export function playerNamesMatch(guess: string, actual: string): boolean {
  if (!guess || !actual) return false

  const g = normalize(guess)
  const a = normalize(actual)

  if (g === a) return true
  if (levenshtein(g, a) <= 2) return true

  const gParts = g.split(' ').filter(Boolean)
  const aParts = a.split(' ').filter(Boolean)

  if (gParts.length === 1) {
    return aParts.some(part => levenshtein(part, gParts[0]) <= 2)
  }

  return gParts.every(gw => aParts.some(aw => levenshtein(aw, gw) <= 1))
}
