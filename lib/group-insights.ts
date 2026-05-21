export interface GroupInsight {
  rubrik: string
  prognos: string
  storstjarna: string
  varning: string
}

export const GROUP_INSIGHTS: Record<string, GroupInsight> = {
  A: {
    rubrik: 'Värdnationens grupp',
    prognos: 'Mexiko spelar inför hemmapublik och är storfavoriter att toppa. Sydkorea med Son Heung-min ses som den starkaste motståndaren om andraplats.',
    storstjarna: 'Son Heung-min (Sydkorea) — kan avgöra matcher helt på egen hand.',
    varning: 'Tjeckien med Patrik Schick är farligare än rangordningen antyder.',
  },
  B: {
    rubrik: 'Schweiz och Kanada favoriter',
    prognos: 'Schweiz är ett av Europas mest stabila landslag och bör gå vidare. Kanada med Jonathan David och Alphonso Davies är en spännande tvåa.',
    storstjarna: 'Jonathan David (Kanada) — en av världens bästa målgörare just nu.',
    varning: 'Bosnien-Hercegovina med Ermedin Demirović kan överraska och ta poäng mot vem som helst.',
  },
  C: {
    rubrik: 'Brasilien möter Afrikas bästa',
    prognos: 'Brasilien är nästan klara att toppa gruppen. Marocko, VM-semifinalister 2022, är starka tvåor och vill bevisa att 2022 inte var en slump.',
    storstjarna: 'Vinícius Jr (Brasilien) — snabb, teknisk och med ett mål i varje stor turnering.',
    varning: 'Marocko är ett av världens bästa försvarslag — Brasilien kan få kämpa hårt.',
  },
  D: {
    rubrik: 'Värdnation USA och Turkiet',
    prognos: 'USA spelar hemma och räknar med att gå vidare. Turkiet med unge Arda Güler har byggt ett lag som kan nå långt.',
    storstjarna: 'Arda Güler (Turkiet) — Real Madrid-spelaren, 20 år, kan bli turneringens stora genombrott.',
    varning: 'Australien och Paraguay är tuffare än man tror och kan störa favoriterna.',
  },
  E: {
    rubrik: 'Tyskland klara favoriter',
    prognos: 'Tyskland bör toppa tryggt. Ecuador med unge Kendry Páez och en stark kollektiv organisation utmanar om andraplats.',
    storstjarna: 'Florian Wirtz (Tyskland) — Europas bästa spelare i sin generation just nu.',
    varning: 'Elfenbenskusten med Adingra och Haller kan skapa problem mot alla lag.',
  },
  F: {
    rubrik: 'Sverige och Nederländerna gör upp',
    prognos: 'Det är tätt om gruppettan mellan Nederländerna och Sverige. Japan är farligare än de verkar och vinner gärna mot europeiska lag. Tunisien spelar för att störa.',
    storstjarna: 'Viktor Gyökeres (Sverige) — en av Europas mest effektiva anfallare.',
    varning: 'Japan har slagit ut Spanien och Tyskland — de kan slå ut vem som helst.',
  },
  G: {
    rubrik: 'Belgiens sista chans med de stora',
    prognos: 'Belgien är favoriter men laget är på väg ned. Egypten med Mohamed Salah och Omar Marmoush är starka tvåor och kan toppa om Belgien dippat.',
    storstjarna: 'Mohamed Salah (Egypten) — spelar sannolikt sitt sista VM och vill lämna avtryck.',
    varning: 'Belgien saknar djup bakom de stora namnen — Iran kan skapa problem.',
  },
  H: {
    rubrik: 'Spanien och Uruguay',
    prognos: 'Spanien med sin unga generation är storfavoriter att toppa gruppen. Uruguay är ett farligt lag med erfarenhet och en vass anfallare i Darwin Núñez.',
    storstjarna: 'Lamine Yamal (Spanien) — 18 år och redan en av världens bästa.',
    varning: 'Uruguay förlorar sällan enkelt — de är tuffare än man förväntar sig.',
  },
  I: {
    rubrik: 'Mbappé möter Haaland',
    prognos: 'Frankrike och Norge har gruppens klart bästa lag. Direktmötet dem emellan kan bli en av turneringens bästa matcher och avgöra vem som toppar.',
    storstjarna: 'Erling Haaland (Norge) — 60+ mål i klubblaget varje säsong, hungrig på VM-framgång.',
    varning: 'Senegal är ett komplett afrikanskt lag som kan ta poäng mot Frankrike.',
  },
  J: {
    rubrik: 'Argentina försvarar titeln',
    prognos: 'Argentina är storfavoriter och laget är byggt kring titeln 2022. Österrike är ett välorganiserat europeiskt lag som bör ta andraplats.',
    storstjarna: 'Lionel Messi (Argentina) — spelar förmodligen sitt sista VM, 38 år.',
    varning: 'Algeriet med Riyad Mahrez kan skapa problem om de hittar formen tidigt.',
  },
  K: {
    rubrik: 'Ronaldo kontra Colombia',
    prognos: 'Portugal och Colombia ses som klara favoriter. Mötet dem emellan avgör troligen vem som toppar.',
    storstjarna: 'Luis Díaz (Colombia) — explosiv, kreativ och en av Liverpools bästa spelare.',
    varning: 'Kongo DR har bra individuella spelare och är aldrig enkla att slå.',
  },
  L: {
    rubrik: 'England söker sin första titel',
    prognos: 'England är storfavoriter att toppa gruppen med råa kvaliteten i truppen. Kroatien, med sin VM-erfarenhet från 2018, utmanar om andraplats.',
    storstjarna: 'Jude Bellingham (England) — Real Madrid-spelaren är Englands hopp om en första VM-titel.',
    varning: 'Ghana med Kudus och Inaki Williams kan skapa rubriker om de startar bra.',
  },
}
