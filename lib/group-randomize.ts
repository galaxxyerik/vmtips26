import type { VmtMatch, Pick } from './types'

const STRENGTH: Record<string, number> = {
  'Argentina': 90, 'Spanien': 89, 'Frankrike': 87, 'England': 86,
  'Brasilien': 85, 'Portugal': 83, 'Tyskland': 82, 'Nederländerna': 80,
  'Belgien': 75, 'Kroatien': 73, 'Uruguay': 71, 'Colombia': 70,
  'Marocko': 69, 'USA': 68, 'Japan': 67, 'Schweiz': 66,
  'Senegal': 65, 'Danmark': 65, 'Turkiet': 64, 'Mexiko': 63,
  'Sydkorea': 62, 'Serbien': 61, 'Polen': 60, 'Sverige': 60,
  'Österrike': 59, 'Skottland': 58, 'Norge': 58, 'Australien': 58,
  'Tjeckien': 58, 'Ecuador': 57, 'Elfenbenskusten': 56, 'Nigeria': 56,
  'Chile': 55, 'Peru': 55, 'Kanada': 54, 'Ghana': 53,
  'Kamerun': 52, 'Bosnien-Hercegovina': 52, 'Saudiarabien': 50,
  'Algeriet': 50, 'Paraguay': 49, 'Iran': 48, 'Tunisien': 47,
  'Egypten': 47, 'Kongo-Kinshasa': 46, 'Qatar': 45, 'Sydafrika': 45,
  'Uzbekistan': 44, 'Kap Verde': 43, 'Panama': 42, 'Irak': 42,
  'Jordanien': 38, 'Bolivia': 38, 'Honduras': 37, 'Nya Zeeland': 37,
  'Jamaica': 35, 'Curaçao': 33, 'Haiti': 30,
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
  'Argentina':        ['Lionel Messi', 'Lautaro Martínez', 'Julián Álvarez'],
  'Spanien':          ['Lamine Yamal', 'Álvaro Morata', 'Pedri'],
  'Frankrike':        ['Kylian Mbappé', 'Antoine Griezmann', 'Ousmane Dembélé'],
  'England':          ['Harry Kane', 'Jude Bellingham', 'Bukayo Saka'],
  'Brasilien':        ['Vinicius Jr', 'Rodrygo', 'Endrick'],
  'Portugal':         ['Cristiano Ronaldo', 'João Félix', 'Rafael Leão'],
  'Tyskland':         ['Kai Havertz', 'Florian Wirtz', 'Leroy Sané'],
  'Nederländerna':    ['Cody Gakpo', 'Memphis Depay', 'Donyell Malen'],
  'Belgien':          ['Kevin De Bruyne', 'Romelu Lukaku', 'Dodi Lukebakio'],
  'Kroatien':         ['Luka Modrić', 'Andrej Kramarić', 'Bruno Petković'],
  'Uruguay':          ['Federico Valverde', 'Darwin Núñez', 'Rodrigo Bentancur'],
  'Colombia':         ['James Rodríguez', 'Luis Díaz', 'Jhon Jáder Durán'],
  'Marocko':          ['Youssef En-Nesyri', 'Hakim Ziyech', 'Azzedine Ounahi'],
  'USA':              ['Christian Pulisic', 'Gio Reyna', 'Timothy Weah'],
  'Japan':            ['Takefusa Kubo', 'Kaoru Mitoma', 'Ritsu Doan'],
  'Schweiz':          ['Granit Xhaka', 'Breel Embolo', 'Ruben Vargas'],
  'Senegal':          ['Sadio Mané', 'Ismaïla Sarr', 'Boulaye Dia'],
  'Turkiet':          ['Hakan Çalhanoğlu', 'Enes Ünal', 'Kerem Aktürkoğlu'],
  'Mexiko':           ['Hirving Lozano', 'Raúl Jiménez', 'Alexis Vega'],
  'Sydkorea':         ['Son Heung-min', 'Lee Kang-in', 'Cho Gue-sung'],
  'Australien':       ['Mathew Leckie', 'Mitch Duke', 'Martin Boyle'],
  'Ecuador':          ['Moisés Caicedo', 'Enner Valencia', 'Jeremy Sarmiento'],
  'Ghana':            ['Mohammed Kudus', 'Thomas Partey', 'Jordan Ayew'],
  'Kanada':           ['Alphonso Davies', 'Jonathan David', 'Tajon Buchanan'],
  'Serbien':          ['Aleksandar Mitrović', 'Dušan Vlahović', 'Dušan Tadić'],
  'Polen':            ['Robert Lewandowski', 'Piotr Zieliński', 'Arkadiusz Milik'],
  'Elfenbenskusten':  ['Sébastien Haller', 'Franck Kessié', 'Nicolas Pépé'],
  'Kamerun':          ['Vincent Aboubakar', 'Eric Maxim Choupo-Moting', 'Bryan Mbeumo'],
  'Nigeria':          ['Victor Osimhen', 'Ademola Lookman', 'Samuel Chukwueze'],
  'Saudiarabien':     ['Salem Al-Dawsari', 'Firas Al-Buraikan', 'Mohammed Al-Shehri'],
  'Iran':             ['Sardar Azmoun', 'Mehdi Taremi', 'Alireza Jahanbakhsh'],
  'Tunisien':         ['Youssef Msakni', 'Wahbi Khazri', 'Seifeddine Jaziri'],
  'Panama':           ['Rolando Blackburn', 'Alfredo Stephens', 'Ismael Díaz'],
  'Paraguay':         ['Miguel Almirón', 'Julio Enciso', 'Gustavo Gómez'],
  'Bolivia':          ['Ramiro Vaca', 'Boris Sagredo', 'Marcelo Moreno Martins'],
  'Qatar':            ['Akram Afif', 'Hassan Al-Haydos', 'Almoez Ali'],
  'Honduras':         ['Romell Quioto', 'Alberth Elis', 'Bryan Moya'],
  'Jamaica':          ['Leon Bailey', 'Michail Antonio', 'Bobby Decordova-Reid'],
  'Sverige':          ['Alexander Isak', 'Dejan Kulusevski', 'Emil Forsberg'],
  'Österrike':        ['Marko Arnautović', 'Marcel Sabitzer', 'Christoph Baumgartner'],
  'Skottland':        ['Che Adams', 'Billy Gilmour', 'Ryan Christie'],
  'Norge':            ['Erling Haaland', 'Martin Ødegaard', 'Alexander Sørloth'],
  'Danmark':          ['Christian Eriksen', 'Rasmus Højlund', 'Jonas Wind'],
  'Tjeckien':         ['Patrik Schick', 'Tomáš Souček', 'Vladimír Coufal'],
  'Kongo-Kinshasa':   ['Chancel Mbemba', 'Yoane Wissa', 'Cédric Bakambu'],
  'Sydafrika':        ['Percy Tau', 'Themba Zwane', 'Bongani Zungu'],
  'Algeriet':         ['Riyad Mahrez', 'Islam Slimani', 'Youcef Atal'],
  'Egypten':          ['Mohamed Salah', 'Omar Marmoush', 'Mostafa Mohamed'],
  'Irak':             ['Mohanad Ali', 'Amjad Attwan', 'Alaa Abbas'],
  'Uzbekistan':       ['Eldor Shomurodov', 'Abbosbek Fayzullaev', 'Otabek Shukurov'],
  'Kap Verde':        ['Garry Rodrigues', 'Ryan Mendes', 'Stopira'],
  'Curaçao':          ['Leandro Bacuna', 'Rangelo Janga', 'Cuco Martina'],
  'Jordan':           ['Ahmad Al-Ali', 'Moussa Al-Tamari', 'Baha Faisal'],
  'Jordanien':        ['Ahmad Al-Ali', 'Moussa Al-Tamari', 'Baha Faisal'],
  'Haiti':            ['Duckens Nazon', 'Frantzdy Pierrot', 'Derrick Etienne'],
}

export function randomGroupScorer(teamNames: string[]): string {
  const candidates: string[] = []
  for (const t of teamNames) candidates.push(...(TEAM_SCORERS[t] ?? []))
  if (candidates.length === 0) return ''
  return candidates[Math.floor(Math.random() * candidates.length)]
}
