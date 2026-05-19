export interface PlayerRegistryEntry {
  name: string
  nationality: string
  category: 'sweden' | 'world' | 'group-f'
  isGoalkeeper?: boolean
  apiFootballId?: number
  nationalTeamId?: number
}

export const PLAYER_REGISTRY: PlayerRegistryEntry[] = [
  { name: 'Viktor Johansson', nationality: 'Sweden', category: 'sweden', isGoalkeeper: true },
  { name: 'Kristoffer Nordfeldt', nationality: 'Sweden', category: 'sweden', isGoalkeeper: true },
  { name: 'Jacob Widell Zetterström', nationality: 'Sweden', category: 'sweden', isGoalkeeper: true },
  { name: 'Hjalmar Ekdal', nationality: 'Sweden', category: 'sweden' },
  { name: 'Gabriel Gudmundsson', nationality: 'Sweden', category: 'sweden' },
  { name: 'Isak Hien', nationality: 'Sweden', category: 'sweden' },
  { name: 'Emil Holm', nationality: 'Sweden', category: 'sweden' },
  { name: 'Gustaf Lagerbielke', nationality: 'Sweden', category: 'sweden' },
  { name: 'Victor Nilsson Lindelöf', nationality: 'Sweden', category: 'sweden' },
  { name: 'Eric Smith', nationality: 'Sweden', category: 'sweden' },
  { name: 'Carl Starfelt', nationality: 'Sweden', category: 'sweden' },
  { name: 'Elliot Stroud', nationality: 'Sweden', category: 'sweden' },
  { name: 'Daniel Svensson', nationality: 'Sweden', category: 'sweden' },
  { name: 'Taha Ali', nationality: 'Sweden', category: 'sweden' },
  { name: 'Yasin Ayari', nationality: 'Sweden', category: 'sweden' },
  { name: 'Lucas Bergvall', nationality: 'Sweden', category: 'sweden' },
  { name: 'Alexander Bernhardsson', nationality: 'Sweden', category: 'sweden' },
  { name: 'Anthony Elanga', nationality: 'Sweden', category: 'sweden' },
  { name: 'Viktor Gyökeres', nationality: 'Sweden', category: 'sweden' },
  { name: 'Alexander Isak', nationality: 'Sweden', category: 'sweden' },
  { name: 'Jesper Karlström', nationality: 'Sweden', category: 'sweden' },
  { name: 'Gustaf Nilsson', nationality: 'Sweden', category: 'sweden' },
  { name: 'Benjamin Nygren', nationality: 'Sweden', category: 'sweden' },
  { name: 'Ken Sema', nationality: 'Sweden', category: 'sweden' },
  { name: 'Mattias Svanberg', nationality: 'Sweden', category: 'sweden' },
  { name: 'Besfort Zeneli', nationality: 'Sweden', category: 'sweden' },
  { name: 'Kylian Mbappé', nationality: 'France', category: 'world' },
  { name: 'Vinicius Jr', nationality: 'Brazil', category: 'world' },
  { name: 'Jude Bellingham', nationality: 'England', category: 'world' },
  { name: 'Pedri', nationality: 'Spain', category: 'world' },
  { name: 'Erling Haaland', nationality: 'Norway', category: 'world' },
  { name: 'Lionel Messi', nationality: 'Argentina', category: 'world' },
  { name: 'Cristiano Ronaldo', nationality: 'Portugal', category: 'world' },
  { name: 'Lamine Yamal', nationality: 'Spain', category: 'world' },
  { name: 'Phil Foden', nationality: 'England', category: 'world' },
  { name: 'Rodri', nationality: 'Spain', category: 'world' },
  { name: 'Mohamed Salah', nationality: 'Egypt', category: 'world' },
  { name: 'Harry Kane', nationality: 'England', category: 'world' },
  { name: 'Bukayo Saka', nationality: 'England', category: 'world' },
  { name: 'Federico Valverde', nationality: 'Uruguay', category: 'world' },
  { name: 'Virgil van Dijk', nationality: 'Netherlands', category: 'group-f' },
  { name: 'Xavi Simons', nationality: 'Netherlands', category: 'group-f' },
  { name: 'Cody Gakpo', nationality: 'Netherlands', category: 'group-f' },
  { name: 'Tijjani Reijnders', nationality: 'Netherlands', category: 'group-f' },
  { name: 'Takumi Minamino', nationality: 'Japan', category: 'group-f' },
  { name: 'Kaoru Mitoma', nationality: 'Japan', category: 'group-f' },
  { name: 'Daichi Kamada', nationality: 'Japan', category: 'group-f' },
  { name: 'Youssef Msakni', nationality: 'Tunisia', category: 'group-f' },
  { name: 'Wahbi Khazri', nationality: 'Tunisia', category: 'group-f' },
]

export const PLAYER_NAME_ALIASES: Record<string, string> = {
  'Taha Abdi Ali': 'Taha Ali',
  'Victor Lindelöf': 'Victor Nilsson Lindelöf',
  'Virgil van Dijk': 'Virgil van Dijk',
}
