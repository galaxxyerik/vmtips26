export interface PlayerRegistryEntry {
  name: string
  nationality: string
  category: 'sweden' | 'world' | 'group-f'
  isGoalkeeper?: boolean
  apiFootballId?: number
  nationalTeamId?: number
}

export const PLAYER_REGISTRY: PlayerRegistryEntry[] = [
  { name: 'Viktor Johansson',          nationality: 'Sweden',      category: 'sweden',  isGoalkeeper: true,  apiFootballId: 158700, nationalTeamId: 5 },
  { name: 'Kristoffer Nordfeldt',      nationality: 'Sweden',      category: 'sweden',  isGoalkeeper: true,  apiFootballId: 2851,   nationalTeamId: 5 },
  { name: 'Jacob Widell Zetterström',  nationality: 'Sweden',      category: 'sweden',  isGoalkeeper: true,  apiFootballId: 48033,  nationalTeamId: 5 },
  { name: 'Hjalmar Ekdal',             nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 47903,  nationalTeamId: 5 },
  { name: 'Gabriel Gudmundsson',       nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 47969,  nationalTeamId: 5 },
  { name: 'Isak Hien',                 nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 137976, nationalTeamId: 5 },
  { name: 'Emil Holm',                 nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 47985,  nationalTeamId: 5 },
  { name: 'Gustaf Lagerbielke',        nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 137721, nationalTeamId: 5 },
  { name: 'Victor Nilsson Lindelöf',   nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 889,    nationalTeamId: 5 },
  { name: 'Eric Smith',                nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 8486,   nationalTeamId: 5 },
  { name: 'Carl Starfelt',             nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 47988,  nationalTeamId: 5 },
  { name: 'Elliot Stroud',             nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 226765, nationalTeamId: 5 },
  { name: 'Daniel Svensson',           nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 198654, nationalTeamId: 5 },
  { name: 'Taha Ali',                  nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 160925, nationalTeamId: 5 },
  { name: 'Yasin Ayari',               nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 265820, nationalTeamId: 5 },
  { name: 'Lucas Bergvall',            nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 347316, nationalTeamId: 5 },
  { name: 'Alexander Bernhardsson',    nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 47696,  nationalTeamId: 5 },
  { name: 'Anthony Elanga',            nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 153430, nationalTeamId: 5 },
  { name: 'Viktor Gyökeres',           nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 18979,  nationalTeamId: 5 },
  { name: 'Alexander Isak',            nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 2864,   nationalTeamId: 5 },
  { name: 'Jesper Karlström',          nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 48047,  nationalTeamId: 5 },
  { name: 'Gustaf Nilsson',            nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 15683,  nationalTeamId: 5 },
  { name: 'Benjamin Nygren',           nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 48002,  nationalTeamId: 5 },
  { name: 'Ken Sema',                  nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 2860,   nationalTeamId: 5 },
  { name: 'Mattias Svanberg',          nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 30484,  nationalTeamId: 5 },
  { name: 'Besfort Zeneli',            nationality: 'Sweden',      category: 'sweden',                       apiFootballId: 350850, nationalTeamId: 5 },
  { name: 'Kylian Mbappé',             nationality: 'France',      category: 'world',                        apiFootballId: 278,    nationalTeamId: 2 },
  { name: 'Vinicius Jr',               nationality: 'Brazil',      category: 'world',                        apiFootballId: 762,    nationalTeamId: 6 },
  { name: 'Jude Bellingham',           nationality: 'England',     category: 'world',                        apiFootballId: 129718, nationalTeamId: 10 },
  { name: 'Pedri',                     nationality: 'Spain',       category: 'world',                        apiFootballId: 133609, nationalTeamId: 9 },
  { name: 'Erling Haaland',            nationality: 'Norway',      category: 'world',                        apiFootballId: 1100,   nationalTeamId: 1090 },
  { name: 'Lionel Messi',              nationality: 'Argentina',   category: 'world',                        apiFootballId: 154,    nationalTeamId: 26 },
  { name: 'Cristiano Ronaldo',         nationality: 'Portugal',    category: 'world',                        apiFootballId: 874,    nationalTeamId: 27 },
  { name: 'Lamine Yamal',              nationality: 'Spain',       category: 'world',                        apiFootballId: 386828, nationalTeamId: 9 },
  { name: 'Phil Foden',                nationality: 'England',     category: 'world',                        apiFootballId: 631,    nationalTeamId: 10 },
  { name: 'Rodri',                     nationality: 'Spain',       category: 'world',                        apiFootballId: 44,     nationalTeamId: 9 },
  { name: 'Mohamed Salah',             nationality: 'Egypt',       category: 'world',                        apiFootballId: 306,    nationalTeamId: 32 },
  { name: 'Harry Kane',                nationality: 'England',     category: 'world',                        apiFootballId: 184,    nationalTeamId: 10 },
  { name: 'Bukayo Saka',               nationality: 'England',     category: 'world',                        apiFootballId: 1460,   nationalTeamId: 10 },
  { name: 'Federico Valverde',         nationality: 'Uruguay',     category: 'world',                        apiFootballId: 756,    nationalTeamId: 7 },
  { name: 'Virgil van Dijk',           nationality: 'Netherlands', category: 'group-f',                      apiFootballId: 290,    nationalTeamId: 1118 },
  { name: 'Frenkie de Jong',           nationality: 'Netherlands', category: 'group-f',                                             nationalTeamId: 1118 },
  { name: 'Cody Gakpo',                nationality: 'Netherlands', category: 'group-f',                      apiFootballId: 247,    nationalTeamId: 1118 },
  { name: 'Tijjani Reijnders',         nationality: 'Netherlands', category: 'group-f',                      apiFootballId: 36902,  nationalTeamId: 1118 },
  { name: 'Takefusa Kubo',             nationality: 'Japan',       category: 'group-f',                      apiFootballId: 32862,  nationalTeamId: 12 },
  { name: 'Ritsu Doan',                nationality: 'Japan',       category: 'group-f',                      apiFootballId: 2598,   nationalTeamId: 12 },
  { name: 'Daichi Kamada',             nationality: 'Japan',       category: 'group-f',                      apiFootballId: 2601,   nationalTeamId: 12 },
  { name: 'Youssef Msakni',            nationality: 'Tunisia',     category: 'group-f',                                             nationalTeamId: 28 },
  { name: 'Wahbi Khazri',              nationality: 'Tunisia',     category: 'group-f',                      apiFootballId: 22102,  nationalTeamId: 28 },
]

export const PLAYER_NAME_ALIASES: Record<string, string> = {
  'Taha Abdi Ali': 'Taha Ali',
  'Victor Lindelöf': 'Victor Nilsson Lindelöf',
  'Virgil van Dijk': 'Virgil van Dijk',
}
