import type { VmtMatch, Pick } from './types'

const STRENGTH: Record<string, number> = {
  'Argentina': 90, 'Spanien': 89, 'Frankrike': 87, 'England': 86,
  'Brasilien': 85, 'Portugal': 83, 'Tyskland': 82, 'Nederländerna': 80,
  'Belgien': 75, 'Kroatien': 73, 'Uruguay': 71, 'Colombia': 70,
  'Marocko': 69, 'USA': 68, 'Japan': 67, 'Schweiz': 66,
  'Senegal': 65, 'Turkiet': 64, 'Mexiko': 63,
  'Sydkorea': 62, 'Sverige': 60,
  'Österrike': 59, 'Skottland': 58, 'Norge': 58, 'Australien': 58,
  'Tjeckien': 58, 'Ecuador': 57, 'Elfenbenskusten': 56,
  'Kanada': 54, 'Ghana': 53,
  'Bosnien-H.': 52, 'Bosnien-Hercegovina': 52, 'Saudiarabien': 50,
  'Algeriet': 50, 'Paraguay': 49, 'Iran': 48, 'Tunisien': 47,
  'Egypten': 47, 'Kongo DR': 46, 'Kongo-Kinshasa': 46, 'Qatar': 45, 'Sydafrika': 45,
  'Uzbekistan': 44, 'Kap Verde': 43, 'Panama': 42, 'Irak': 42,
  'Jordanien': 38, 'Nya Zeeland': 37,
  'Curaçao': 33, 'Haiti': 30,
}

function teamStrength(name: string): number {
  return STRENGTH[name] ?? 50
}

function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

export function randomMatchPick(homeTeam: string, awayTeam: string): Pick {
  const diff = teamStrength(homeTeam) + 5 - teamStrength(awayTeam)
  const w: [number, number, number] =
    diff >= 20  ? [60, 25, 15] :
    diff >= 10  ? [50, 28, 22] :
    diff >= -9  ? [38, 30, 32] :
    diff >= -19 ? [22, 28, 50] :
                  [15, 25, 60]
  return weightedPick<Pick>(['1', 'X', '2'], w)
}

export function randomizeGroupPicks(matches: VmtMatch[]): Record<number, Pick> {
  const result: Record<number, Pick> = {}
  for (const m of matches) result[m.id] = randomMatchPick(m.home_team, m.away_team)
  return result
}

export const TEAM_SCORERS: Record<string, string[]> = {
  // ── Grupp A ──────────────────────────────────────────────────────────────────
  'Mexiko':              ['Santiago Giménez', 'Raúl Jiménez', 'Roberto Alvarado'],
  'Sydkorea':            ['Son Heung-min', 'Lee Kang-in', 'Cho Gue-sung'],
  'Tjeckien':            ['Patrik Schick', 'Adam Hložek', 'Pavel Šulc'],
  'Sydafrika':           ['Percy Tau', 'Lyle Foster', 'Evidence Makgopa'],

  // ── Grupp B ──────────────────────────────────────────────────────────────────
  'Kanada':              ['Jonathan David', 'Alphonso Davies', 'Cyle Larin'],
  'Schweiz':             ['Breel Embolo', 'Zeki Amdouni', 'Dan Ndoye'],
  'Bosnien-H.':          ['Edin Džeko', 'Ermedin Demirović', 'Esmir Bajraktarević'],
  'Bosnien-Hercegovina': ['Edin Džeko', 'Ermedin Demirović', 'Esmir Bajraktarević'],

  // ── Grupp C ──────────────────────────────────────────────────────────────────
  'Brasilien':           ['Vinícius Jr', 'Raphinha', 'Neymar'],
  'Marocko':             ['Youssef En-Nesyri', 'Ayoub El Kaabi', 'Brahim Diaz'],
  'Skottland':           ['Scott McTominay', 'Che Adams', 'Ross Stewart'],

  // ── Grupp D ──────────────────────────────────────────────────────────────────
  'USA':                 ['Christian Pulisic', 'Folarin Balogun', 'Ricardo Pepi'],
  'Turkiet':             ['Arda Güler', 'Kenan Yıldız', 'Kerem Aktürkoğlu'],
  'Australien':          ['Mathew Leckie', 'Nestory Irankunda', 'Martin Boyle'],
  'Paraguay':            ['Julio Enciso', 'Antonio Sanabria', 'Miguel Almirón'],

  // ── Grupp E ──────────────────────────────────────────────────────────────────
  'Tyskland':            ['Florian Wirtz', 'Jamal Musiala', 'Kai Havertz'],
  'Ecuador':             ['Enner Valencia', 'Kendry Páez', 'Gonzalo Plata'],
  'Elfenbenskusten':     ['Simon Adingra', 'Sébastien Haller', 'Nicolas Pépé'],

  // ── Grupp F ──────────────────────────────────────────────────────────────────
  'Nederländerna':       ['Cody Gakpo', 'Memphis Depay', 'Donyell Malen'],
  'Sverige':             ['Viktor Gyökeres', 'Alexander Isak', 'Lucas Bergvall'],
  'Japan':               ['Takefusa Kubo', 'Ayase Ueda', 'Daizen Maeda'],
  'Tunisien':            ['Hannibal Mejbri', 'Khalil Ayari', 'Elias Saad'],

  // ── Grupp G ──────────────────────────────────────────────────────────────────
  'Belgien':             ['Romelu Lukaku', 'Kevin De Bruyne', 'Jeremy Doku'],
  'Egypten':             ['Mohamed Salah', 'Omar Marmoush', 'Mostafa Mohamed'],
  'Iran':                ['Mehdi Taremi', 'Alireza Jahanbakhsh', 'Saman Ghoddos'],

  // ── Grupp H ──────────────────────────────────────────────────────────────────
  'Spanien':             ['Lamine Yamal', 'Nico Williams', 'Álvaro Morata'],
  'Uruguay':             ['Darwin Núñez', 'Federico Valverde', 'Facundo Torres'],

  // ── Grupp I ──────────────────────────────────────────────────────────────────
  'Frankrike':           ['Kylian Mbappé', 'Ousmane Dembélé', 'Marcus Thuram'],
  'Norge':               ['Erling Haaland', 'Alexander Sørloth', 'Martin Ødegaard'],
  'Senegal':             ['Ismaïla Sarr', 'Boulaye Dia', 'Nicolas Jackson'],

  // ── Grupp J ──────────────────────────────────────────────────────────────────
  'Argentina':           ['Lautaro Martínez', 'Julián Álvarez', 'Lionel Messi'],
  'Österrike':           ['Marko Arnautović', 'Michael Gregoritsch', 'Christoph Baumgartner'],
  'Algeriet':            ['Riyad Mahrez', 'Youcef Atal', 'Andy Delort'],

  // ── Grupp K ──────────────────────────────────────────────────────────────────
  'Portugal':            ['Cristiano Ronaldo', 'Bruno Fernandes', 'Rafael Leão'],
  'Colombia':            ['Luis Díaz', 'Jhon Durán', 'James Rodríguez'],
  'Kongo DR':            ['Yoane Wissa', 'Cédric Bakambu', 'Théo Bongonda'],
  'Kongo-Kinshasa':      ['Yoane Wissa', 'Cédric Bakambu', 'Théo Bongonda'],

  // ── Grupp L ──────────────────────────────────────────────────────────────────
  'England':             ['Harry Kane', 'Jude Bellingham', 'Bukayo Saka'],
  'Kroatien':            ['Andrej Kramarić', 'Ante Budimir', 'Marko Livaja'],
  'Ghana':               ['Mohammed Kudus', 'Inaki Williams', 'Antoine Semenyo'],
}

export function randomGroupScorer(teamNames: string[]): string {
  const candidates: string[] = []
  for (const t of teamNames) candidates.push(...(TEAM_SCORERS[t] ?? []))
  if (candidates.length === 0) return ''
  return candidates[Math.floor(Math.random() * candidates.length)]
}
