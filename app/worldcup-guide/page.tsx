'use client'

import { useState } from 'react'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import { EditableImage } from '@/components/Editable'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Player {
  name: string; country: string; flag: string; club: string; position: string
  age: number; why: string; style: string; stat: string; statLabel: string; rating: number
}
interface DarkHorse { country: string; flag: string; maxFinish: string; why: string; keyPlayer: string; strength: number }
interface GroupTeam { name: string; flag: string; prediction: 'W' | 'Q' | 'E' }
interface Group { letter: string; teams: GroupTeam[]; analysis: string; hotMatch: string }
interface SwedenPlayer {
  name: string; club: string; position: string; age: number; caps: number
  season: string; role: string; keyStrength: string; rating: number
}

// ── Data ──────────────────────────────────────────────────────────────────────

const FACTS = [
  'VM 2026 är det första med 48 lag — en ökning från 32. Det innebär 104 matcher totalt.',
  'Tre länder arrangerar VM för första gången gemensamt: USA, Kanada och Mexiko.',
  'MetLife Stadium i New Jersey håller finalen den 19 juli 2026 — arenan rymmer 82 500 åskådare.',
  'Mexiko är det land som spelat flest VM utan att nå semifinal: 17 turneringar.',
  'USA arrangerade senast VM 1994 — den turnering som fortfarande slog rekord i totalt publikantal.',
  'Viktor Gyökeres slog hattrick mot Ukraina i playoff och säkrade Sveriges plats i VM.',
  'Sverige är tillbaka i VM för första gången sedan 2018 i Ryssland.',
  'Graham Potter utnämndes till Sveriges förbundskapten i oktober 2025.',
  'Grupp F kallas redan "Dödsgruppen" med Sverige, Nederländerna, Japan och Tunisien.',
  'Victor Lindelöf, nu i Aston Villa, är kapten för det svenska landslaget.',
  'Gyökeres köptes av Arsenal för £64 miljoner från Sporting CP sommaren 2025.',
  'VM 2026 spelas på 16 arenor i USA, Kanada och Mexiko — fler än någonsin tidigare.',
  'Azteca-stadion i Mexiko City är den enda arenan som arrangerat VM-finaler 1970 och 1986.',
  'Canada har aldrig tidigare spelat ett VM på hemmaplan.',
  'Brasil har vunnit VM flest gånger: fem gånger (1958, 1962, 1970, 1994, 2002).',
  'Argentina är regerande världsmästare efter segern i Qatar 2022.',
  'VM 2026 är den första turnering där 12 grupper A–L används istället för åtta.',
  'De åtta bästa treorna i gruppspelet går också vidare — en ny regel för 2026.',
  'Just Fontaine från Frankrike håller fortfarande rekorden: 13 mål i ett enda VM (1958).',
  'Miroslav Klose (Tyskland) är VM:s totala skyttekung med 16 mål.',
  'Sverige gick till tredjeplats i VM 1994 — med Tomas Brolin och Martin Dahlin.',
  'Sverige spelade semifinal i VM 1958 — på hemmaplan, förlorade mot Brasilien 2–5.',
  'Marocko gick till semifinal 2022 och är det enda afrikanska laget att nå den rundan.',
  'Kylian Mbappé var 19 år när han vann VM 2018 med Frankrike.',
  '"Vi vinner VM" av Markoolio (2002) är Sveriges mest kända VM-låt.',
]

const STARS: Player[] = [
  { name: 'Viktor Gyökeres', country: 'Sverige', flag: '🇸🇪', club: 'Arsenal', position: 'Anfallare', age: 28, why: 'Mannen som tog Sverige till VM med hattrick mot Ukraina. Gyökeres bär hela ett lands drömmar — Arsenal-anfallaren är i karriärens absoluta topp och hungrig på att bevisa sin klass på världsscenen. Detta är hans turnering.', style: 'Explosiv, outhållig och tekniskt komplett — kombinerar fysisk råstyrka med ett arsenal av avslutningstekniker.', stat: '37 mål', statLabel: 'Premier League 25/26', rating: 9 },
  { name: 'Kylian Mbappé', country: 'Frankrike', flag: '🇫🇷', club: 'Real Madrid', position: 'Anfallare', age: 27, why: 'Vid 27 år är Mbappé i sin absoluta prime. Frankrike är klar favorit och Mbappé är orsaken. Hans hastighet och avslutning är utan rival på planeten.', style: 'Blixtsnabb, klinisk och med en rörelsefrihet som försvarare inte kan läsa in förrän det är för sent.', stat: '43 mål', statLabel: 'La Liga & CL 25/26', rating: 10 },
  { name: 'Vinicius Jr', country: 'Brasilien', flag: '🇧🇷', club: 'Real Madrid', position: 'Vänsterytter', age: 25, why: 'Brasiliens bäste spelare sedan Neymar — och han är bättre. Vinicius Jr har mognat till en fullständig spelare, fortfarande lekfull men nu med beslutsamhet och klinisk finish.', style: 'Kaotiskt kreativ med fötter som dansar och hjärna som tänker snabbare än motståndarna hinner reagera.', stat: '39 mål', statLabel: 'La Liga & CL 25/26', rating: 10 },
  { name: 'Jude Bellingham', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', club: 'Real Madrid', position: 'Mittfältare', age: 22, why: 'Real Madrids hjärta och Englands framtid — Bellingham är mogen nog att bära ett helt land på sina axlar utan att blinka.', style: 'Komplett: vinner bollar, skapar chanser och dyker upp i straffområdet — allt med skrämmande effektivitet för sin ålder.', stat: '22 mål', statLabel: 'La Liga 25/26', rating: 9 },
  { name: 'Lamine Yamal', country: 'Spanien', flag: '🇪🇸', club: 'FC Barcelona', position: 'Högerytter', age: 18, why: 'Han vann EM 2024 som 17-åring. Yamal är inte ett löfte längre — han är verkligheten. Spanien med honom i laget är skrämmande att möta.', style: 'Oändlig teknik i trång yta, explosiva dueller och förmågan att avgöra med vänsterfoten utan förvarning.', stat: '18 mål · 24 assist', statLabel: 'La Liga 25/26', rating: 9 },
  { name: 'Erling Haaland', country: 'Norge', flag: '🇳🇴', club: 'Manchester City', position: 'Anfallare', age: 25, why: 'Maskinen från Bryne är i sin prime och Norge är med i VM. Haaland har gjort mål i varje liga, varje turnering — nu får han äntligen chansen på världsscenen.', style: 'En målmaskin med perfekt positionsspel, klinisk avslutning och en fysik som gör centralbackar till hinderbana.', stat: '44 mål', statLabel: 'Premier League 25/26', rating: 9 },
  { name: 'Pedri', country: 'Spanien', flag: '🇪🇸', club: 'FC Barcelona', position: 'Mittfältare', age: 23, why: 'Spaniens metronom och Barcelonas hjärna — Pedri är fotbollsintelligens i mänsklig form. Frisk och i toppform kan han vinna VM helt på egen hand.', style: 'Oöverträffad i trång yta, med en passnings- och rörelsekvalitet som får motståndare att tappa orienteringen.', stat: '12 mål · 22 assist', statLabel: 'La Liga 25/26', rating: 9 },
  { name: 'Jamal Musiala', country: 'Tyskland', flag: '🇩🇪', club: 'Bayern München', position: 'Mittfältare', age: 23, why: 'Musiala är det moderna Tysklands bäste spelare på länge — fluid, kreativ och svår att stoppa. Bayern-trollet kan avgöra VM för Tyskland på en sekund av magi.', style: 'Snabb i tanken, snabb i benet — en rörlighetens mästare som dansar sig förbi press och skapar rum ur ingenstans.', stat: '26 mål · 19 assist', statLabel: 'Bundesliga 25/26', rating: 9 },
  { name: 'Bukayo Saka', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', club: 'Arsenal', position: 'Högerytter', age: 24, why: 'Arsenals motor och Englands mest konsekventa spelare. Saka svarar alltid när det gäller — hans prestationer i EM 2024 visade att han är en av världens absolut bästa.', style: 'Oupphörlig energi, klinisk i sista tredjedelen och med en duellstyrka som är sällsynt för hans position.', stat: '23 mål · 20 assist', statLabel: 'Premier League 25/26', rating: 9 },
  { name: 'Achraf Hakimi', country: 'Marocko', flag: '🇲🇦', club: 'Paris Saint-Germain', position: 'Högerback', age: 27, why: 'Afrikas bäste spelare och Marockos motor längs sidlinjen. Hakimi vill ta Marocko till en ny halvfinal. Det är inte orimligt.', style: 'Explosiv i dueller, elegant i övergångar och med ett offensivt bidrag som är sällsynt för en back.', stat: '14 mål · 18 assist', statLabel: 'Ligue 1 25/26', rating: 9 },
  { name: 'Cody Gakpo', country: 'Nederländerna', flag: '🇳🇱', club: 'Liverpool', position: 'Vänsterytter', age: 26, why: 'VM 2022 presenterade Gakpo för världen — nu är han Liverpools stjärna och Hollands bäste anfallare. I Grupp F kan han avgöra om Sverige tar sig vidare.', style: 'Direkt, stark i duell och med en vänsterfot som skapar mål ur halvchansen med yttersida.', stat: '26 mål · 14 assist', statLabel: 'Premier League 25/26', rating: 8 },
  { name: 'Julián Álvarez', country: 'Argentina', flag: '🇦🇷', club: 'Atlético Madrid', position: 'Anfallare', age: 26, why: 'VM 2022:s stora hjälte utanför Messi. Nu utan Messis skugga kan han ta ännu mer plats. Atlético har gjort honom till en ännu kompletttare anfallare.', style: 'Outtröttlig rörlighet, klinisk avslutning och ett kämpande hjärta som aldrig ger upp en boll.', stat: '31 mål', statLabel: 'La Liga 25/26', rating: 9 },
]

const TALENTS: Player[] = [
  { name: 'Endrick', country: 'Brasilien', flag: '🇧🇷', club: 'Real Madrid', position: 'Anfallare', age: 19, why: 'Real Madrid betalade en förmögenhet för en tonåring — och de visste precis vad de köpte. Hans instinkter i straffområdet är sådana man föds med, inte tränar sig till.', style: 'Orolig, hungrig och med en naturlig avslutningsinstinkt som gör defensiver nervösa.', stat: '18 mål', statLabel: 'La Liga 25/26', rating: 8 },
  { name: 'Arda Güler', country: 'Turkiet', flag: '🇹🇷', club: 'Real Madrid', position: 'Mittfältare', age: 20, why: 'Real Madrids hemliga vapen och Turkiets stjärna i vardande. Güler visade på EM 2024 att han kan göra magi på storturnering.', style: 'Teknisk, kreativ och med en skottfot som kan avgöra från vilken vinkel som helst.', stat: '13 mål', statLabel: 'La Liga 25/26', rating: 8 },
  { name: 'Lamine Yamal', country: 'Spanien', flag: '🇪🇸', club: 'FC Barcelona', position: 'Högerytter', age: 18, why: 'Redan en stjärna men fortfarande ett talang-fenomen — 18 år och redan EM-vinnare. Det är omöjligt att inte bli häpen.', style: 'Explosiv, teknisk och oläsbar.', stat: '18 mål · 24 assist', statLabel: 'La Liga 25/26', rating: 9 },
  { name: 'Takefusa Kubo', country: 'Japan', flag: '🇯🇵', club: 'Real Sociedad', position: 'Högerytter', age: 25, why: 'Japans tekniskt mest begåvade spelare sedan Shunsuke Nakamura — bevisat i La Liga, redo att visa hela världen.', style: 'Elektrisk i 1-mot-1, med en teknik och kreativitet som hör hemma bland La Ligas absoluta elit.', stat: '18 mål · 11 assist', statLabel: 'La Liga 25/26', rating: 8 },
  { name: 'Estêvão Willian', country: 'Brasilien', flag: '🇧🇷', club: 'Chelsea', position: 'Högerytter', age: 18, why: 'Nästa brasilianska fenomen. Lämnade Palmeiras för Chelsea och tog Premier League med storm — Ronaldinho-vibbar med modern intelligens.', style: 'Intuitivt och lekfullt — bollar tycks dyka upp på hans fot av sig självt.', stat: '16 mål', statLabel: 'Premier League 25/26', rating: 8 },
  { name: 'Sverre Nypan', country: 'Norge', flag: '🇳🇴', club: 'Manchester City', position: 'Mittfältare', age: 19, why: 'Rosenborgs produkt som nu tränar med Pep Guardiola — Norges unga stjärna. I skuggan av Haaland kan han blomstra.', style: 'Teknisk med en elegans i passningsspelet som påminner om en ung David Silva — med nordisk råstyrka.', stat: '8 mål · 14 assist', statLabel: 'Premier League 25/26', rating: 7 },
  { name: 'Kendry Páez', country: 'Ecuador', flag: '🇪🇨', club: 'Chelsea', position: 'Mittfältare', age: 18, why: 'Chelsea betalade för hans framtid och framtiden är redan nu. Ecuadors kreativa motor — vid 18 år spelar han med veteraners lugn.', style: 'Intelligent i smala utrymmen, med passningsförmåga och avslut som gör honom till matchvinnare.', stat: '7 mål · 10 assist', statLabel: 'Premier League 25/26', rating: 7 },
  { name: 'Warren Zaïre-Emery', country: 'Frankrike', flag: '🇫🇷', club: 'Paris Saint-Germain', position: 'Defensiv mittfältare', age: 20, why: 'PSG-produkten som redan spelar som om han hade 30 år av erfarenhet. Zaïre-Emery är Frankrikes hjärta i mitten.', style: 'Lugn under press, elegant i passningsspelet och defensivt läsande av spelet som är osannolikt för hans ålder.', stat: '8 mål · 12 assist', statLabel: 'Ligue 1 25/26', rating: 8 },
]

const DARK_HORSES: DarkHorse[] = [
  { country: 'Marocko', flag: '', maxFinish: 'Semifinal', why: 'Marocko visade 2022 att de inte är en gissning längre — de är ett faktum. Hakimi i världsklass, ett kompakt defensivsystem och fanatiska fans. Grupp C med Brasilien är hård, men överlever de den är de farliga hela vägen.', keyPlayer: 'Achraf Hakimi', strength: 8 },
  { country: 'Colombia', flag: '', maxFinish: 'Semifinal', why: 'Colombia möter Portugal och Uzbekistan i Grupp K — en grupp de kan vinna. Med James Rodríguez som spelande tränare på planen och Jhon Durán som joker kan de gå längre än vad oddsen visar.', keyPlayer: 'James Rodríguez', strength: 8 },
  { country: 'Uruguay', flag: '', maxFinish: 'Kvartsfinal', why: 'Grupp H med Spanien är hård — men Uruguay spelar aldrig vackert och de vinner matcher de inte borde vinna. Valverde och Núñez är ett av VM:s farligaste anfallspar och defensiven är stenhård.', keyPlayer: 'Federico Valverde', strength: 7 },
  { country: 'Kroatien', flag: '', maxFinish: 'Kvartsfinal', why: 'Modrić säger att detta är hans sista VM och det räcker som motivation. Grupp L med England är möjlig att klara — och Kroatien levererar alltid på storscenen: semifinal 2018, final 2022.', keyPlayer: 'Luka Modrić', strength: 7 },
  { country: 'Skottland', flag: '', maxFinish: 'Åttondel', why: 'Första VM sedan 1998 och de är inte med för att åka hem tidigt. Grupp C med Brasilien och Marocko är brutal — men Robertson och McTominay kan ta poäng mot vem som helst på en bra dag.', keyPlayer: 'Andrew Robertson', strength: 6 },
]

const GROUPS: Group[] = [
  { letter: 'A', teams: [{ name: 'Mexiko', flag: '', prediction: 'W' }, { name: 'Sydkorea', flag: '', prediction: 'Q' }, { name: 'Tjeckien', flag: '', prediction: 'E' }, { name: 'Sydafrika', flag: '', prediction: 'E' }], analysis: 'Mexiko på hemmaplan i Azteca — det är svårt att se dem inte vinna gruppen. Sydkorea är starka men utmanades hårt. Tjeckien och Sydafrika kämpar för att hålla sig kvar.', hotMatch: 'Mexiko vs. Sydkorea' },
  { letter: 'B', teams: [{ name: 'Kanada', flag: '', prediction: 'W' }, { name: 'Schweiz', flag: '', prediction: 'Q' }, { name: 'Bosnien-H.', flag: '', prediction: 'E' }, { name: 'Qatar', flag: '', prediction: 'E' }], analysis: 'Kanada på hemmaplan med Davies och David — svårt att slå i Toronto. Schweiz är alltid solida och tar andraplatsen. Qatar vann VM 2022 men förlorade alla tre matcher.', hotMatch: 'Kanada vs. Schweiz' },
  { letter: 'C', teams: [{ name: 'Brasilien', flag: '', prediction: 'W' }, { name: 'Marocko', flag: '', prediction: 'Q' }, { name: 'Skottland', flag: '', prediction: 'E' }, { name: 'Haiti', flag: '', prediction: 'E' }], analysis: 'Turneringens tuffaste grupp utanför F. Brasilien och Marocko är favoriter — men Skottland kan chockera. Mötet Brasilien–Marocko avgör gruppsegern.', hotMatch: 'Brasilien vs. Marocko' },
  { letter: 'D', teams: [{ name: 'USA', flag: '', prediction: 'W' }, { name: 'Turkiet', flag: '', prediction: 'Q' }, { name: 'Australien', flag: '', prediction: 'E' }, { name: 'Paraguay', flag: '', prediction: 'E' }], analysis: 'USA på hemmaplan i LA och Seattle — supportrarna är med från kick-off. Turkiet med Güler är farliga och tar andraplatsen. Paraguay och Australien brottas om tredjeplatsen.', hotMatch: 'USA vs. Turkiet' },
  { letter: 'E', teams: [{ name: 'Tyskland', flag: '', prediction: 'W' }, { name: 'Ecuador', flag: '', prediction: 'Q' }, { name: 'Elfenbenskusten', flag: '', prediction: 'E' }, { name: 'Curaçao', flag: '', prediction: 'E' }], analysis: 'Tyskland vinner sin grupp men inte utan svettningar — Ecuador med Páez är ett lag som kan ta poäng mot alla. Elfenbenskusten är VM-debutant och kan bli turneringens joker.', hotMatch: 'Tyskland vs. Ecuador' },
  { letter: 'F', teams: [{ name: 'Nederländerna', flag: '', prediction: 'W' }, { name: 'Sverige', flag: '', prediction: 'Q' }, { name: 'Japan', flag: '', prediction: 'E' }, { name: 'Tunisien', flag: '', prediction: 'E' }], analysis: 'Dödsgruppen lever upp till sitt namn. Nederländerna är favoriter men Sverige och Japan är klara utmanare. Tunisien kan ta poäng mot vem som helst.', hotMatch: 'Nederländerna vs. Sverige' },
  { letter: 'G', teams: [{ name: 'Belgien', flag: '', prediction: 'W' }, { name: 'Egypten', flag: '', prediction: 'Q' }, { name: 'Iran', flag: '', prediction: 'E' }, { name: 'Nya Zeeland', flag: '', prediction: 'E' }], analysis: 'Belgien är fortfarande starka trots att de "gyllene generationen" är borta. De Bruyne leder ett nytt gäng. Egypten med Salah (om han är med) kan chockera.', hotMatch: 'Belgien vs. Egypten' },
  { letter: 'H', teams: [{ name: 'Spanien', flag: '', prediction: 'W' }, { name: 'Uruguay', flag: '', prediction: 'Q' }, { name: 'Saudiarabien', flag: '', prediction: 'E' }, { name: 'Kap Verde', flag: '', prediction: 'E' }], analysis: 'Spanien vinner komfortabelt med Yamal och Pedri i toppform. Uruguay med Valverde och Núñez är alltid svåra att slå — de tar andraplatsen på viljestyrka.', hotMatch: 'Spanien vs. Uruguay' },
  { letter: 'I', teams: [{ name: 'Frankrike', flag: '', prediction: 'W' }, { name: 'Norge', flag: '', prediction: 'Q' }, { name: 'Senegal', flag: '', prediction: 'E' }, { name: 'Irak', flag: '', prediction: 'E' }], analysis: 'Frankrike vinner utan drama. Men Norge med Haaland på sitt första VM är den grupp I-sensationen — Haaland mot Frankrike är en match som skriver historia.', hotMatch: 'Frankrike vs. Norge' },
  { letter: 'J', teams: [{ name: 'Argentina', flag: '', prediction: 'W' }, { name: 'Österrike', flag: '', prediction: 'Q' }, { name: 'Algeriet', flag: '', prediction: 'E' }, { name: 'Jordanien', flag: '', prediction: 'E' }], analysis: 'Argentina försvarar sin titel och vinner gruppen. Österrike är ett av turneringens mest underskattade lag. Algeriet kan skrälla men betar av svår uppförsbacke.', hotMatch: 'Argentina vs. Algeriet' },
  { letter: 'K', teams: [{ name: 'Portugal', flag: '', prediction: 'W' }, { name: 'Colombia', flag: '', prediction: 'Q' }, { name: 'Uzbekistan', flag: '', prediction: 'E' }, { name: 'Kongo DR', flag: '', prediction: 'E' }], analysis: 'Portugal vinner enkelt. Colombia med James Rodríguez är farligare än rankingen visar — andraplatsen är deras. Uzbekistan och Kongo DR kämpar för heder.', hotMatch: 'Portugal vs. Colombia' },
  { letter: 'L', teams: [{ name: 'England', flag: '', prediction: 'W' }, { name: 'Kroatien', flag: '', prediction: 'Q' }, { name: 'Ghana', flag: '', prediction: 'E' }, { name: 'Panama', flag: '', prediction: 'E' }], analysis: 'England vinner med Bellingham, Saka och Kane — men trycket på laget är aldrig litet. Kroatien med åldrade Modrić levererar alltid på storscenen och tar andraplatsen.', hotMatch: 'England vs. Kroatien' },
]

interface SwedenMatch {
  date: string; day: string; time: string; opponent: string; opponentFlag: string
  venue: string; city: string; tv: string; note: string
}
const SWEDEN_MATCHES: SwedenMatch[] = [
  { date: '15 juni', day: 'Måndag', time: '04:00', opponent: 'Tunisien', opponentFlag: '🇹🇳', venue: 'Estadio BBVA', city: 'Monterrey, Mexiko', tv: 'SVT', note: 'Måste vinna' },
  { date: '20 juni', day: 'Lördag', time: '19:00', opponent: 'Nederländerna', opponentFlag: '🇳🇱', venue: 'NRG Stadium', city: 'Houston, USA', tv: 'TV4', note: 'Avgörande' },
  { date: '26 juni', day: 'Fredag', time: '01:00', opponent: 'Japan', opponentFlag: '🇯🇵', venue: 'AT&T Stadium', city: 'Dallas, USA', tv: 'SVT', note: 'Sista chansen' },
]

interface FeaturedPlayer {
  name: string; club: string; position: string; age: number
  desc: string; keyStrength: string; rating: number; imageKey: string
}
const FEATURED_PLAYERS: FeaturedPlayer[] = [
  { name: 'Viktor Gyökeres', club: 'Arsenal', position: 'Anfallare', age: 28, desc: 'Mannen som tog Sverige till VM med hattrick mot Ukraina. Arsenal-anfallaren är i karriärens absoluta topp — explosiv, outhållig och klinisk. Detta är hans turnering att ta för sig.', keyStrength: 'Explosiv avslutning med båda fötterna, outhålligt pressingspel och förmåga att avgöra ur ingenstans.', rating: 10, imageKey: 'img.player.gyokeres' },
  { name: 'Alexander Isak', club: 'Liverpool', position: 'Anfallare', age: 26, desc: 'Premier Leagues mest kompletta anfallare. Isak kombinerar exceptionell teknik med klinisk avslutning — hans rörlighet i mellanzonen ger Sverige ett offensivt vapen ingen förväntar sig.', keyStrength: 'Teknisk kontroll i högt tempo, ett vänsterben svårt att förutse och förmågan att skapa ur stillastående.', rating: 9, imageKey: 'img.player.isak' },
  { name: 'Victor Lindelöf', club: 'Aston Villa', position: 'Mittback · Kapten', age: 31, desc: 'Kapten och ryggraden i Potters defensivsystem. Lindelöf har mognat till en av Europas pålitligaste centralbackar — teknisk, lugn och med ett ledarskap som präglar hela laget.', keyStrength: 'Orubblig under press, exceptionellt passningsspel bakifrån och defensivt läsande som skapar trygghet.', rating: 8, imageKey: 'img.player.lindelof' },
  { name: 'Lucas Bergvall', club: 'Tottenham', position: 'Mittfältare', age: 19, desc: 'Turneringens yngsta stjärna i blågult. Bergvall har redan visat att han hör hemma i Premier League — teknisk, modig och med ett spelsinne sällsynt för sin ålder.', keyStrength: 'Teknisk säkerhet under press, förmåga att vända spelet och en mognad i beslutsfattandet som chockar erfarna.', rating: 8, imageKey: 'img.player.bergvall' },
  { name: 'Anthony Elanga', club: 'Newcastle United', position: 'Ytterforward', age: 23, desc: 'Newcastles raketssnabba ytter som kan avgöra matcher på ett ögonblick. Elanga är Sveriges vapen i kontringar — hans sprintkapacitet och direkthet gör backs desperata.', keyStrength: 'Explosiv hastighet i djupled, direkthet i 1-mot-1 och outhållig press som tvingar fram misstag.', rating: 7, imageKey: 'img.player.elanga' },
]

const PLAYER_IMAGE_FALLBACKS: Record<string, string> = {
  'img.player.gyokeres': '/images/gyokeres-portrait.jpg',
  'img.player.isak': '/images/isak-portrait.jpg',
  'img.player.lindelof': '/images/lindelof-action.jpg',
  'img.player.bergvall': '/images/bergvall-action.jpg',
  'img.player.elanga': '/images/elanga-action.jpg',
}

interface SquadPlayer { name: string; club: string; pos: string }
const SQUAD: Record<string, SquadPlayer[]> = {
  'Målvakter': [
    { name: 'Viktor Johansson', club: 'Stoke City', pos: 'MV' },
    { name: 'Kristoffer Nordfeldt', club: 'AIK', pos: 'MV' },
    { name: 'Jacob Widell Zetterström', club: 'Derby County', pos: 'MV' },
  ],
  'Försvar': [
    { name: 'Victor Nilsson Lindelöf', club: 'Aston Villa', pos: 'CB' },
    { name: 'Isak Hien', club: 'Atalanta', pos: 'CB' },
    { name: 'Carl Starfelt', club: 'Celta de Vigo', pos: 'CB' },
    { name: 'Gustaf Lagerbielke', club: 'SC Braga', pos: 'CB' },
    { name: 'Emil Holm', club: 'Juventus', pos: 'RB' },
    { name: 'Hjalmar Ekdal', club: 'Burnley', pos: 'LB' },
    { name: 'Gabriel Gudmundsson', club: 'Leeds United', pos: 'LB' },
    { name: 'Eric Smith', club: 'FC St Pauli', pos: 'CB' },
    { name: 'Elliot Stroud', club: 'Mjällby AIF', pos: 'RB' },
  ],
  'Mittfält': [
    { name: 'Lucas Bergvall', club: 'Tottenham', pos: 'CM' },
    { name: 'Mattias Svanberg', club: 'VfL Wolfsburg', pos: 'CM' },
    { name: 'Yasin Ayari', club: 'Brighton', pos: 'CM' },
    { name: 'Daniel Svensson', club: 'Borussia Dortmund', pos: 'CM' },
    { name: 'Jesper Karlström', club: 'Udinese', pos: 'DM' },
    { name: 'Ken Sema', club: 'Pafos FC', pos: 'WM' },
    { name: 'Taha Abdi Ali', club: 'Malmö FF', pos: 'CM' },
    { name: 'Besfort Zeneli', club: 'Union Saint-Gilloise', pos: 'WM' },
  ],
  'Anfall': [
    { name: 'Viktor Gyökeres', club: 'Arsenal', pos: 'ST' },
    { name: 'Alexander Isak', club: 'Liverpool', pos: 'ST' },
    { name: 'Anthony Elanga', club: 'Newcastle United', pos: 'LW' },
    { name: 'Gustaf Nilsson', club: 'Club Brugge', pos: 'ST' },
    { name: 'Alexander Bernhardsson', club: 'Holstein Kiel', pos: 'RW' },
    { name: 'Benjamin Nygren', club: 'Celtic', pos: 'RW' },
  ],
}

const SWEDEN_PLAYERS: SwedenPlayer[] = []

const FAVORITES = [
  { country: 'Frankrike', flag: '🇫🇷', pct: 19 },
  { country: 'Brasilien', flag: '🇧🇷', pct: 16 },
  { country: 'Spanien', flag: '🇪🇸', pct: 14 },
  { country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', pct: 13 },
  { country: 'Argentina', flag: '🇦🇷', pct: 11 },
  { country: 'Portugal', flag: '🇵🇹', pct: 9 },
  { country: 'Tyskland', flag: '🇩🇪', pct: 8 },
  { country: 'Marocko', flag: '🇲🇦', pct: 6 },
]

// ── Component ──────────────────────────────────────────────────────────────────

type Tab = 'grupper' | 'stjärnor' | 'talanger' | 'sverige' | 'favoriter' | 'mörkhästar' | 'fakta'

const TABS: { id: Tab; label: string }[] = [
  { id: 'grupper', label: 'Grupper' },
  { id: 'stjärnor', label: 'Stjärnor' },
  { id: 'talanger', label: 'Talanger' },
  { id: 'sverige', label: 'Sverige' },
  { id: 'favoriter', label: 'Favoriter' },
  { id: 'mörkhästar', label: 'Skrällchanser' },
  { id: 'fakta', label: 'Fakta' },
]

export default function WorldCupGuidePage() {
  const [tab, setTab] = useState<Tab>('grupper')

  return (
    <div className="min-h-screen bg-navy-950">
      <NavBar userName={null} />

      {/* Page header */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-1 label">VM-Bibel</div>
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-black text-3xl uppercase tracking-wide text-white">VM 2026 — Guiden</h1>
              <p className="text-white/40 text-sm mt-1">
                11 juni – 19 juli 2026 · USA, Kanada &amp; Mexiko · 48 lag · 104 matcher
              </p>
            </div>
            {/* WC2026 trophy image */}
            <img
              src="/images/wc-trophy.jpg"
              alt="FIFA World Cup-trofén"
              className="hidden sm:block h-16 w-16 object-cover object-center flex-shrink-0 opacity-90 rounded-sm"
            />
          </div>

          {/* Tournament facts strip */}
          <div className="mt-5 grid grid-cols-2 gap-px sm:grid-cols-4 border border-white/10">
            {[
              { label: 'Lag', value: '48' },
              { label: 'Grupper', value: '12 (A–L)' },
              { label: 'Matcher', value: '104' },
              { label: 'Final', value: '19 jul · MetLife' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-navy-900 px-3 py-2.5 text-center">
                <div className="font-display font-black text-lg text-swe-yellow">{value}</div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="sticky top-14 z-40 bg-navy-950/95 backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-display font-black uppercase tracking-wider transition-colors whitespace-nowrap border ${
                  tab === t.id
                    ? 'bg-swe-yellow text-navy-950 border-swe-yellow'
                    : 'text-white/40 hover:text-white border-white/10 hover:border-white/30'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {tab === 'grupper' && <GroupsTab />}
        {tab === 'stjärnor' && <PlayersTab players={STARS} title="Världsstjärnor" subtitle="De 12 bästa spelarna i VM 2026" />}
        {tab === 'talanger' && <PlayersTab players={TALENTS} title="Talanger att bevaka" subtitle="Unga spelare som kan chockera världen" />}
        {tab === 'sverige' && <SwedenTab />}
        {tab === 'favoriter' && <FavoritesTab />}
        {tab === 'mörkhästar' && <DarkHorsesTab />}
        {tab === 'fakta' && <FactsTab />}
      </main>

      <Footer />
    </div>
  )
}

const FLAG_MAP: Record<string, string> = {
  'Sverige': '/images/flag-se.svg',
  'Nederländerna': '/images/flag-nl.svg',
  'Japan': '/images/flag-jp.svg',
  'Tunisien': '/images/flag-tn.svg',
  'Brasilien': '/images/flag-br.svg',
  'Frankrike': '/images/flag-fr.svg',
  'Spanien': '/images/flag-es.svg',
  'Argentina': '/images/flag-ar.svg',
  'Portugal': '/images/flag-pt.svg',
  'Tyskland': '/images/flag-de.svg',
  'USA': '/images/flag-us.svg',
  'England': '/images/flag-gb.svg',
}

// ── Tab: Groups ────────────────────────────────────────────────────────────────

function GroupsTab() {
  return (
    <div className="space-y-0">
      <div className="border border-white/10 px-4 py-3 bg-navy-900 mb-4">
        <div className="label mb-1">VM 2026 · Gruppspel</div>
        <p className="text-white/40 text-xs leading-relaxed">
          12 grupper (A–L) · 4 lag vardera · De 2 bästa + 8 bästa tredjeplacerade går vidare
          <span className="mx-2">·</span>
          <span className="text-pitch-400 font-display font-black">W</span> = etta ·{' '}
          <span className="text-swe-yellow font-display font-black">Q</span> = vidare ·{' '}
          <span className="text-white/25 font-display font-black">E</span> = åker hem
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {GROUPS.map(g => (
          <div
            key={g.letter}
            className={`border ${g.letter === 'F' ? 'border-swe-yellow/30' : 'border-white/10'}`}
          >
            {/* Group header */}
            <div className={`px-4 py-2 flex items-center justify-between ${
              g.letter === 'F' ? 'bg-swe-yellow/10' : 'bg-navy-900'
            }`}>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm uppercase tracking-wider text-white">
                  Grupp {g.letter}
                </span>
                {g.letter === 'F' && (
                  <span className="text-[9px] font-display font-black uppercase tracking-wider border border-swe-yellow/40 text-swe-yellow px-1.5 py-0.5">
                    Sverige
                  </span>
                )}
              </div>
              <span className="text-[10px] text-white/30 font-display font-black uppercase truncate ml-2">
                {g.hotMatch}
              </span>
            </div>

            {/* Teams */}
            <div className="divide-y divide-white/5">
              {g.teams.map(team => (
                <div key={team.name} className="flex items-center gap-2 px-4 py-2">
                  {FLAG_MAP[team.name] ? (
                    <img
                      src={FLAG_MAP[team.name]}
                      alt={team.name}
                      className="w-5 h-3.5 object-cover flex-shrink-0 opacity-80"
                    />
                  ) : (
                    <span className="w-5 h-3.5 flex-shrink-0" />
                  )}
                  <span className={`flex-1 text-sm font-medium ${
                    team.name === 'Sverige' ? 'text-swe-yellow' : 'text-white/80'
                  }`}>{team.name}</span>
                  <span className={`text-[10px] font-display font-black px-1.5 py-0.5 border ${
                    team.prediction === 'W'
                      ? 'text-pitch-400 border-pitch-500/30 bg-pitch-900/20'
                      : team.prediction === 'Q'
                      ? 'text-swe-yellow border-swe-yellow/30'
                      : 'text-white/20 border-white/10'
                  }`}>{team.prediction}</span>
                </div>
              ))}
            </div>

            {/* Analysis */}
            <div className="px-4 py-2.5 border-t border-white/5">
              <p className="text-[11px] text-white/40 leading-relaxed">{g.analysis}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab: Players ───────────────────────────────────────────────────────────────

function PlayersTab({ players, title, subtitle }: { players: Player[]; title: string; subtitle: string }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div>
      <div className="border border-white/10 px-4 py-3 bg-navy-900 mb-4">
        <div className="label mb-0.5">{title}</div>
        <p className="text-white/40 text-xs">{subtitle}</p>
      </div>

      <div className="border border-white/10 divide-y divide-white/5">
        {players.map((p, i) => (
          <div key={p.name}>
            <button
              className="w-full flex items-center gap-0 text-left hover:bg-navy-900/40 transition-colors"
              onClick={() => setExpanded(expanded === p.name ? null : p.name)}
            >
              {/* Main info */}
              <div className="flex-1 px-4 py-3 min-w-0">
                <div className="font-display font-black uppercase tracking-wide text-white text-sm leading-tight">
                  {p.name}
                </div>
                <div className="text-[11px] text-white/35 mt-0.5">
                  {p.position} · {p.club} · {p.country} · {p.age} år
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[10px] font-display font-black border border-pitch-500/30 text-pitch-400 px-1.5 py-0.5">
                    {p.stat}
                  </span>
                  <span className="text-[10px] text-white/25">{p.statLabel}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="px-4 text-right flex-shrink-0">
                <div className="font-display font-black text-2xl text-swe-yellow tnum">{p.rating}</div>
                <div className="text-[9px] text-white/25 uppercase tracking-wider">/ 10</div>
              </div>
            </button>

            {expanded === p.name && (
              <div className="px-4 pb-4 pt-3 border-t border-white/5 bg-navy-900/30 space-y-3">
                <p className="text-sm text-white/65 leading-relaxed">{p.why}</p>
                <div className="border border-white/10 px-3 py-2.5">
                  <div className="label text-[9px] mb-1">Spelstil</div>
                  <p className="text-xs text-white/50 leading-relaxed">{p.style}</p>
                </div>
              </div>
            )}

            {expanded !== p.name && (
              <div className="px-4 pb-2.5 -mt-1">
                <p className="text-[11px] text-white/30 line-clamp-1">{p.why}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab: Sweden ────────────────────────────────────────────────────────────────

function SwedenTab() {
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null)

  return (
    <div className="space-y-0">

      {/* ── Hero image ── */}
      <EditableImage
        contentKey="image.sweden.hero"
        fallback="/images/sweden-fans.jpg"
        alt="Svenska VM-fans — blågult mot världen"
        className="w-full object-cover object-center"
        containerClassName="w-full"
        placeholderHeight="h-56"
      />

      {/* ── Title block ── */}
      <div className="border border-white/10 border-t-0 px-5 py-5 bg-navy-900">
        <div className="flex items-center gap-4">
          <div>
            <div className="label text-swe-yellow/70 mb-0.5">Grupp F · VM 2026</div>
            <h2 className="font-display font-black text-2xl uppercase tracking-wide text-white">Sverige</h2>
            <p className="text-white/40 text-xs mt-0.5">Coach: Graham Potter · 26 spelare uttagna</p>
          </div>
          <div className="ml-auto text-right">
            <div className="font-display font-black text-4xl text-swe-yellow">65%</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">chans vidare</div>
          </div>
        </div>
        <p className="text-white/60 text-sm leading-relaxed mt-4 border-t border-white/10 pt-4">
          Blågult är tillbaka. Efter åtta långa år sedan 2018 kliver Sverige in i VM 2026 med en
          generation som vet vad den vill. Graham Potter har byggt ett kompakt, snabbt lag runt
          Viktor Gyökeres — och med den hungern är detta inte ett lag som åker hem tidigt.
        </p>
      </div>

      {/* ── NRG Stadium visual ── */}
      <div className="relative overflow-hidden border border-white/10 border-t-0 h-28">
        <img
          src="/images/nrg-stadium.jpg"
          alt="NRG Stadium i Houston, Texas — Sveriges arenor i VM 2026"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/60 to-navy-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
        <div className="relative h-full flex items-center px-4 gap-3">
          <div>
            <div className="label text-[9px] text-swe-yellow/60 mb-0.5">Arenor — VM 2026</div>
            <div className="font-display font-black text-white uppercase tracking-wide text-sm">Estadio BBVA · NRG Stadium · AT&T Stadium</div>
            <div className="text-[11px] text-white/40 mt-0.5">Monterrey · Houston · Dallas</div>
          </div>
        </div>
      </div>

      {/* ── Match schedule ── */}
      <div className="border border-white/10 border-t-0">
        <div className="px-4 py-2.5 bg-navy-950 border-b border-white/10">
          <div className="label">Matchschema · svenska tider (CEST)</div>
        </div>
        <div className="divide-y divide-white/5">
          {SWEDEN_MATCHES.map((m, i) => (
            <div key={m.opponent} className="flex items-center gap-3 px-4 py-3 hover:bg-navy-900/40 transition-colors">
              <div className="w-7 h-7 flex items-center justify-center border border-white/15 flex-shrink-0">
                <span className="font-display font-black text-xs text-white/40">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <img
                    src="/images/flag-se.svg"
                    alt="Sverige"
                    className="w-5 h-3.5 object-cover flex-shrink-0"
                  />
                  <span className="text-white/30 text-xs">vs</span>
                  <img
                    src={`/images/flag-${m.opponent === 'Tunisien' ? 'tn' : m.opponent === 'Nederländerna' ? 'nl' : 'jp'}.svg`}
                    alt={m.opponent}
                    className="w-5 h-3.5 object-cover flex-shrink-0"
                  />
                  <span className="font-display font-black uppercase tracking-wide text-white text-sm">
                    Sverige vs {m.opponent}
                  </span>
                  <span className="text-[10px] border border-swe-yellow/30 text-swe-yellow/70 px-1.5 py-0.5 font-display font-black uppercase">
                    {m.note}
                  </span>
                </div>
                <div className="text-xs text-white/35 mt-0.5">{m.venue} · {m.city}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-display font-black text-swe-yellow text-base tnum">{m.time}</div>
                <div className="text-[10px] text-white/30 tnum">{m.day} {m.date}</div>
                <div className="text-[10px] text-white/25 mt-0.5">{m.tv}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Djärv spaning ── */}
      <div className="border border-swe-yellow/20 border-t-0 bg-swe-yellow/5 px-5 py-4">
        <div className="label text-swe-yellow/60 mb-1">Djärv spaning</div>
        <p className="text-sm text-white/70 leading-relaxed italic">
          &ldquo;Sverige slår Nederländerna och tar gruppsegern — Gyökeres koras till Grupp F:s bästa spelare
          och Blågult skriver historia i Houston.&rdquo;
        </p>
      </div>

      {/* ── Featured players ── */}
      <div className="border border-white/10 border-t-0">
        <div className="px-4 py-2.5 bg-navy-950 border-b border-white/10">
          <div className="label">Nyckelspelare</div>
        </div>
        <div className="divide-y divide-white/5">
          {FEATURED_PLAYERS.map(p => (
            <div key={p.name}>
              {/* Player row */}
              <button
                className="w-full flex items-stretch text-left hover:bg-navy-900/40 transition-colors"
                onClick={() => setExpandedPlayer(expandedPlayer === p.name ? null : p.name)}
              >
                {/* Photo slot */}
                <div className="w-20 h-20 flex-shrink-0 relative overflow-hidden bg-navy-900 border-r border-white/5">
                  <EditableImage
                    contentKey={p.imageKey}
                    fallback={PLAYER_IMAGE_FALLBACKS[p.imageKey]}
                    alt={`${p.name}, ${p.position}, Sverige`}
                    className="w-full h-full object-cover object-top"
                    placeholderHeight="h-20"
                    containerClassName="w-full h-full"
                  />
                </div>
                {/* Info */}
                <div className="flex-1 px-4 py-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-display font-black uppercase tracking-wide text-white text-sm leading-tight">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-white/40 mt-0.5">{p.position} · {p.club} · {p.age} år</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-display font-black text-2xl text-swe-yellow tnum">{p.rating}</div>
                      <div className="text-[9px] text-white/25 uppercase tracking-wider">/ 10</div>
                    </div>
                  </div>
                </div>
              </button>
              {/* Expanded */}
              {expandedPlayer === p.name && (
                <div className="px-4 pb-4 border-t border-white/5 bg-navy-900/30 space-y-3 pt-3">
                  <p className="text-sm text-white/65 leading-relaxed">{p.desc}</p>
                  <div className="border border-white/10 px-3 py-2.5">
                    <div className="label text-[9px] mb-1">Nyckestyrka</div>
                    <p className="text-xs text-white/55 leading-relaxed">{p.keyStrength}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Full squad ── */}
      <div className="border border-white/10 border-t-0">
        <div className="px-4 py-2.5 bg-navy-950 border-b border-white/10">
          <div className="label">Hela truppen · 26 spelare</div>
        </div>
        {Object.entries(SQUAD).map(([pos, players]) => (
          <div key={pos} className="border-b border-white/5 last:border-0">
            <div className="px-4 py-1.5 bg-navy-900/50">
              <span className="text-[10px] font-display font-black uppercase tracking-widest text-white/30">{pos}</span>
            </div>
            <div className="divide-y divide-white/5">
              {players.map(p => (
                <div key={p.name} className="flex items-center gap-3 px-4 py-2 hover:bg-navy-900/30 transition-colors">
                  <span className="w-7 text-center text-[10px] font-display font-black text-white/20 border border-white/10 py-0.5">{p.pos}</span>
                  <span className="flex-1 text-sm text-white/80 font-medium">{p.name}</span>
                  <span className="text-xs text-white/30">{p.club}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

// ── Tab: Favorites ─────────────────────────────────────────────────────────────

function FavoritesTab() {
  return (
    <div className="space-y-4">
      <div className="border border-white/10 px-4 py-3 bg-navy-900">
        <div className="label mb-0.5">Turneringsfavoriter</div>
        <p className="text-white/40 text-xs">Oddsbaserade vinstchanser för de starkaste lagen.</p>
      </div>

      <div className="border border-white/10 divide-y divide-white/5">
        {FAVORITES.map((f, i) => (
          <div key={f.country} className="flex items-center gap-4 px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-display font-black uppercase tracking-wide text-sm text-white">{f.country}</span>
                <span className="font-display font-black text-swe-yellow tnum">{f.pct}%</span>
              </div>
              <div className="h-0.5 bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-swe-yellow transition-all"
                  style={{ width: `${(f.pct / 19) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Final prediction */}
      <div className="border border-swe-yellow/20 bg-swe-yellow/5">
        <div className="px-4 py-3 border-b border-swe-yellow/15">
          <div className="label text-swe-yellow/60">Vår finaltipp</div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-white/10">
          <div className="px-4 py-5 text-center">
            <div className="font-display font-black uppercase tracking-wide text-swe-yellow text-xl">Frankrike</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Mästare</div>
          </div>
          <div className="px-4 py-5 text-center">
            <div className="font-display font-black uppercase tracking-wide text-white text-xl">Brasilien</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Runners-up</div>
          </div>
        </div>
        <div className="px-4 py-3 border-t border-white/10 space-y-2">
          <p className="text-xs text-white/55 leading-relaxed">
            Frankrike är det enda laget med världsklass på varje position. Mbappé, Dembélé, Griezmann up front —
            Zaïre-Emery och Tchouaméni i mitten — Saliba och Upamecano bak. Det finns inget svar på detta lag.
          </p>
          <div className="pt-2 border-t border-white/10">
            <span className="label text-[9px]">Skyttekung · </span>
            <span className="text-xs text-swe-yellow font-display font-black uppercase">Kylian Mbappé (Frankrike) — 9 mål</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Dark Horses ───────────────────────────────────────────────────────────

function DarkHorsesTab() {
  return (
    <div className="space-y-4">
      <div className="border border-white/10 px-4 py-3 bg-navy-900">
        <div className="label mb-0.5">Skrällchanser</div>
        <p className="text-white/40 text-xs">Lag som kan gå längre än de flesta tror.</p>
      </div>

      <div className="border border-white/10 divide-y divide-white/5">
        {DARK_HORSES.map(d => (
          <div key={d.country} className="px-4 py-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-display font-black uppercase tracking-wide text-white">{d.country}</span>
                  <span className="text-[10px] font-display font-black border border-swe-yellow/30 text-swe-yellow/80 px-1.5 py-0.5">
                    Max: {d.maxFinish}
                  </span>
                </div>
                <div className="text-[11px] text-white/35">Nyckelspelare: {d.keyPlayer}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-display font-black text-xl text-swe-yellow tnum">{d.strength}</div>
                <div className="text-[9px] text-white/25 uppercase tracking-wider">/ 10</div>
              </div>
            </div>

            <div className="h-px bg-white/10 mb-3 overflow-hidden">
              <div className="h-full bg-swe-yellow/60" style={{ width: `${(d.strength / 10) * 100}%` }} />
            </div>

            <p className="text-xs text-white/55 leading-relaxed">{d.why}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab: Facts ─────────────────────────────────────────────────────────────────

function FactsTab() {
  return (
    <div className="space-y-4">
      <div className="border border-white/10 px-4 py-3 bg-navy-900">
        <div className="label mb-0.5">VM-fakta</div>
        <p className="text-white/40 text-xs">{FACTS.length} saker du bör veta inför VM 2026.</p>
      </div>

      <div className="border border-white/10 divide-y divide-white/5">
        {FACTS.map((fact, i) => (
          <div key={i} className="flex gap-0">
            <div className="w-10 flex-shrink-0 flex items-start justify-center pt-3 border-r border-white/5 bg-navy-900/50">
              <span className="font-display font-black text-[11px] text-white/20 tnum">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <p className="flex-1 px-4 py-3 text-sm text-white/60 leading-relaxed">{fact}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
