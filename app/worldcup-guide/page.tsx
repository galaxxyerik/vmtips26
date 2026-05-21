'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import { PLAYER_NAME_ALIASES } from '@/lib/player-registry'
import { VERIFIED_PLAYER_STATS, VERIFIED_PLAYER_STATS_UPDATED_AT } from '@/data/player-stats'
import { PLAYER_STATS_SEASON } from '@/lib/player-stats-config'
import type { PlayerStatRecord } from '@/lib/player-stats-types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Player {
  name: string; country: string; flag: string; club: string; position: string
  age: number; why: string; style: string; stat: string; statLabel: string; rating: number
  imageUrl?: string
}
interface DarkHorse { country: string; flag: string; maxFinish: string; why: string; keyPlayer: string; strength: number; imageUrl?: string }
interface GroupTeam { name: string; flag: string; prediction: 'W' | 'Q' | 'E' }
interface Group { letter: string; teams: GroupTeam[]; analysis: string; hotMatch: string; imageUrl?: string; imageAlt?: string }
interface Favorite { country: string; flag: string; pct: number; imageUrl?: string }
interface SwedenPlayer {
  name: string; club: string; position: string; age: number; caps: number
  season: string; role: string; keyStrength: string; rating: number
}
type PlayerStatRow = PlayerStatRecord

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
  { name: 'Kendry Páez', country: 'Ecuador', flag: '🇪🇨', club: 'Strasbourg', position: 'Mittfältare', age: 18, why: 'Chelsea betalade för hans framtid och framtiden är redan nu. Ecuadors kreativa motor — vid 18 år spelar han med veteraners lugn.', style: 'Intelligent i smala utrymmen, med passningsförmåga och avslut som gör honom till matchvinnare.', stat: '1 mål', statLabel: 'Ligue 1 25/26', rating: 7 },
  { name: 'Warren Zaïre-Emery', country: 'Frankrike', flag: '🇫🇷', club: 'Paris Saint-Germain', position: 'Defensiv mittfältare', age: 20, why: 'PSG-produkten som redan spelar som om han hade 30 år av erfarenhet. Zaïre-Emery är Frankrikes hjärta i mitten.', style: 'Lugn under press, elegant i passningsspelet och defensivt läsande av spelet som är osannolikt för hans ålder.', stat: '8 mål · 12 assist', statLabel: 'Ligue 1 25/26', rating: 8 },
]

const DARK_HORSES: DarkHorse[] = [
  { country: 'Marocko', flag: '🇲🇦', maxFinish: 'Semifinal', why: 'Marocko visade 2022 att de inte är en gissning längre — de är ett faktum. Hakimi i världsklass, ett kompakt defensivsystem och fanatiska fans. Grupp C med Brasilien är hård, men överlever de den är de farliga hela vägen.', keyPlayer: 'Achraf Hakimi', strength: 8 },
  { country: 'Colombia', flag: '🇨🇴', maxFinish: 'Semifinal', why: 'Colombia möter Portugal och Uzbekistan i Grupp K — en grupp de kan vinna. Med James Rodríguez som spelande tränare på planen och Jhon Durán som joker kan de gå längre än vad oddsen visar.', keyPlayer: 'James Rodríguez', strength: 8, imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1400&q=80' },
  { country: 'Uruguay', flag: '🇺🇾', maxFinish: 'Kvartsfinal', why: 'Grupp H med Spanien är hård — men Uruguay spelar aldrig vackert och de vinner matcher de inte borde vinna. Valverde och Núñez är ett av VM:s farligaste anfallspar och defensiven är stenhård.', keyPlayer: 'Federico Valverde', strength: 7, imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1400&q=80' },
  { country: 'Kroatien', flag: '🇭🇷', maxFinish: 'Kvartsfinal', why: 'Modrić säger att detta är hans sista VM och det räcker som motivation. Grupp L med England är möjlig att klara — och Kroatien levererar alltid på storscenen: semifinal 2018, final 2022.', keyPlayer: 'Luka Modrić', strength: 7, imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1400&q=80' },
  { country: 'Skottland', flag: '🏴', maxFinish: 'Åttondel', why: 'Första VM sedan 1998 och de är inte med för att åka hem tidigt. Grupp C med Brasilien och Marocko är brutal — men Robertson och McTominay kan ta poäng mot vem som helst på en bra dag.', keyPlayer: 'Andrew Robertson', strength: 6, imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80' },
]

const GROUPS: Group[] = [
  { letter: 'A', teams: [{ name: 'Mexiko', flag: '', prediction: 'W' }, { name: 'Sydkorea', flag: '', prediction: 'Q' }, { name: 'Tjeckien', flag: '', prediction: 'E' }, { name: 'Sydafrika', flag: '', prediction: 'E' }], analysis: 'Mexiko på hemmaplan i Azteca — det är svårt att se dem inte vinna gruppen. Sydkorea är starka men utmanades hårt. Tjeckien och Sydafrika kämpar för att hålla sig kvar.', hotMatch: 'Mexiko vs. Sydkorea' },
  { letter: 'B', teams: [{ name: 'Kanada', flag: '', prediction: 'W' }, { name: 'Schweiz', flag: '', prediction: 'Q' }, { name: 'Bosnien-H.', flag: '', prediction: 'E' }, { name: 'Qatar', flag: '', prediction: 'E' }], analysis: 'Kanada på hemmaplan med Davies och David — svårt att slå i Toronto. Schweiz är alltid solida och tar andraplatsen. Qatar vann VM 2022 men förlorade alla tre matcher.', hotMatch: 'Kanada vs. Schweiz' },
  { letter: 'C', teams: [{ name: 'Brasilien', flag: '', prediction: 'W' }, { name: 'Marocko', flag: '', prediction: 'Q' }, { name: 'Skottland', flag: '', prediction: 'E' }, { name: 'Haiti', flag: '', prediction: 'E' }], analysis: 'Turneringens tuffaste grupp utanför F. Brasilien och Marocko är favoriter — men Skottland kan chockera. Mötet Brasilien–Marocko avgör gruppsegern.', hotMatch: 'Brasilien vs. Marocko' },
  { letter: 'D', teams: [{ name: 'USA', flag: '', prediction: 'W' }, { name: 'Turkiet', flag: '', prediction: 'Q' }, { name: 'Australien', flag: '', prediction: 'E' }, { name: 'Paraguay', flag: '', prediction: 'E' }], analysis: 'USA på hemmaplan i LA och Seattle — supportrarna är med från kick-off. Turkiet med Güler är farliga och tar andraplatsen. Paraguay och Australien brottas om tredjeplatsen.', hotMatch: 'USA vs. Turkiet' },
  { letter: 'E', teams: [{ name: 'Tyskland', flag: '', prediction: 'W' }, { name: 'Ecuador', flag: '', prediction: 'Q' }, { name: 'Elfenbenskusten', flag: '', prediction: 'E' }, { name: 'Curaçao', flag: '', prediction: 'E' }], analysis: 'Tyskland vinner sin grupp men inte utan svettningar — Ecuador med Páez är ett lag som kan ta poäng mot alla. Elfenbenskusten är VM-debutant och kan bli turneringens joker.', hotMatch: 'Tyskland vs. Ecuador' },
  { letter: 'F', teams: [{ name: 'Nederländerna', flag: '', prediction: 'W' }, { name: 'Sverige', flag: '', prediction: 'Q' }, { name: 'Japan', flag: '', prediction: 'E' }, { name: 'Tunisien', flag: '', prediction: 'E' }], analysis: 'Dödsgruppen lever upp till sitt namn. Nederländerna är favoriter men Sverige och Japan är klara utmanare. Tunisien kan ta poäng mot vem som helst.', hotMatch: 'Nederländerna vs. Sverige', imageUrl: '/images/nrg-stadium-interior.jpg', imageAlt: 'NRG Stadium i Houston, där Sverige möter Nederländerna' },
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
  { name: 'Yasin Ayari', club: 'Brighton', position: 'Mittfältare', age: 22, desc: 'Potters Brighton-koppling gör Ayari extra intressant. Han ger Sverige pressresistens, tempo i passningsspelet och en mittfältsmotor som kan överleva långa perioder utan boll mot starkare lag.', keyStrength: 'Första touch under press, snabba spelvändningar och förmågan att både vinna andrabollar och sätta fart framåt.', rating: 8, imageKey: 'img.player.ayari' },
  { name: 'Anthony Elanga', club: 'Newcastle United', position: 'Ytterforward', age: 23, desc: 'Newcastles raketssnabba ytter som kan avgöra matcher på ett ögonblick. Elanga är Sveriges vapen i kontringar — hans sprintkapacitet och direkthet gör backs desperata.', keyStrength: 'Explosiv hastighet i djupled, direkthet i 1-mot-1 och outhållig press som tvingar fram misstag.', rating: 7, imageKey: 'img.player.elanga' },
]

const PLAYER_IMAGE_FALLBACKS: Record<string, string> = {
  'img.player.gyokeres': 'https://www.svenskfotboll.se/4a8c04/globalassets/svff/bilderblock/arkiv/2025/2510/viktor_gyokeres.jpg',
  'img.player.isak':     '/images/isak-action-lfc.webp',
  'img.player.lindelof': '/images/lindelof-action.jpg',
  'img.player.bergvall': '/images/bergvall-action.jpg',
  'img.player.ayari':    'https://www.svenskfotboll.se/cdn-cgi/image/f=auto/4ae6db/globalassets/svff/bilderblock/arkiv/2024/2405/yasin_ayari2023.jpg',
  'img.player.elanga':   '/images/elanga-action.jpg',
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

const GROUP_F_NOTABLES: Player[] = [
  { name: 'Virgil van Dijk', country: 'Nederländerna', flag: '🇳🇱', club: 'Liverpool', position: 'Mittback', age: 34, why: 'Ledaren i Nederländernas backlinje och fortfarande en av turneringens mest respekterade mittbackar.', style: 'Positionssäker, dominant i luftrummet och lugn i uppspelen.', stat: '', statLabel: '', rating: 8 },
  { name: 'Frenkie de Jong', country: 'Nederländerna', flag: '🇳🇱', club: 'FC Barcelona', position: 'Mittfältare', age: 29, why: 'När Simons saknas blir De Jong ännu mer central. Han är spelaren som kan ta Nederländerna ur svensk press, styra tempot och få Gakpo och Reijnders rättvända.', style: 'Bolltrygg regissör med långa driv, perfekt kroppsvinkel och förmåga att bryta press utan att stressa.', stat: '', statLabel: '', rating: 9 },
  { name: 'Cody Gakpo', country: 'Nederländerna', flag: '🇳🇱', club: 'Liverpool', position: 'Vänsterytter', age: 26, why: 'Direkt hot från kanten och en av Grupp F:s tydligaste målspelare.', style: 'Stark i omställning, bra skott och smarta löpningar in centralt.', stat: '', statLabel: '', rating: 8 },
  { name: 'Tijjani Reijnders', country: 'Nederländerna', flag: '🇳🇱', club: 'Manchester City', position: 'Mittfältare', age: 27, why: 'Tempoväxlare på mitten som kan styra rytmen om Sverige blir passivt.', style: 'Bolltrygg, löpstark och vass i ytan framför backlinjen.', stat: '', statLabel: '', rating: 8 },
  { name: 'Takefusa Kubo', country: 'Japan', flag: '🇯🇵', club: 'Real Sociedad', position: 'Högerytter', age: 25, why: 'Med Mitoma och Minamino borta blir Kubo Japans tydligaste kreativa huvudperson. Han kan bära boll, hota i halvrummet och ge Sverige problem mellan ytterback och mittback.', style: 'Låg tyngdpunkt, vänsterfot med precision och mod att gå på avslut eller sista passningen tidigt.', stat: '', statLabel: '', rating: 8 },
  { name: 'Ritsu Doan', country: 'Japan', flag: '🇯🇵', club: 'Eintracht Frankfurt', position: 'Högermittfältare', age: 27, why: 'Doan är en bevisad turneringsspelare och väntas ta ännu större ansvar när Japan saknar sina stora offensiva namn. Hans vänsterfot och tajming gör honom farlig i varje omställning.', style: 'Direkt, smart i presspelet och vass när han får kliva in från kanten mot sin starka fot.', stat: '', statLabel: '', rating: 8 },
  { name: 'Daichi Kamada', country: 'Japan', flag: '🇯🇵', club: 'Crystal Palace', position: 'Mittfältare', age: 29, why: 'Teknisk mittfältare med internationell rutin och smart positionering.', style: 'Lugn med boll, bra blick och hot från andra våg.', stat: '', statLabel: '', rating: 7 },
  { name: 'Youssef Msakni', country: 'Tunisien', flag: '🇹🇳', club: 'Al Arabi', position: 'Anfallare', age: 35, why: 'Tunisiens stora profil, erfaren nog att straffa varje misstag.', style: 'Fin teknik, bra avslut och naturlig känsla för avgörande lägen.', stat: '', statLabel: '', rating: 7 },
  { name: 'Wahbi Khazri', country: 'Tunisien', flag: '🇹🇳', club: 'Klubblös', position: 'Anfallare', age: 35, why: 'Rutinerad avslutare med fast situationer och distansskott som specialitet.', style: 'Smart, cynisk och farlig så fort han får vända upp.', stat: '', statLabel: '', rating: 7 },
]

const FAVORITES: Favorite[] = [
  { country: 'Frankrike', flag: '🇫🇷', pct: 19, imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1400&q=80' },
  { country: 'Brasilien', flag: '🇧🇷', pct: 16, imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1400&q=80' },
  { country: 'Spanien', flag: '🇪🇸', pct: 14, imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1400&q=80' },
  { country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', pct: 13 },
  { country: 'Argentina', flag: '🇦🇷', pct: 11, imageUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1400&q=80' },
  { country: 'Portugal', flag: '🇵🇹', pct: 9, imageUrl: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=1400&q=80' },
  { country: 'Tyskland', flag: '🇩🇪', pct: 8, imageUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1400&q=80' },
  { country: 'Marocko', flag: '🇲🇦', pct: 6, imageUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1400&q=80' },
]

function getFotMobImageUrl(playerId: number): string {
  return `https://images.fotmob.com/image_resources/playerimages/${playerId}.png`
}

const SWEDISH_SQUAD_FOTMOB_IDS: Record<string, number> = {
  'Viktor Johansson': 546252,
  'Kristoffer Nordfeldt': 73462,
  'Jacob Widell Zetterström': 1014602,
  'Victor Nilsson Lindelöf': 258269,
  'Isak Hien': 939780,
  'Carl Starfelt': 497662,
  'Gustaf Lagerbielke': 919848,
  'Emil Holm': 1014630,
  'Hjalmar Ekdal': 831044,
  'Gabriel Gudmundsson': 744494,
  'Eric Smith': 531327,
  'Elliot Stroud': 1272349,
  'Lucas Bergvall': 1386775,
  'Mattias Svanberg': 647900,
  'Yasin Ayari': 1168311,
  'Daniel Svensson': 1209228,
  'Jesper Karlström': 322003,
  'Ken Sema': 5236,
  'Taha Abdi Ali': 1135782,
  'Besfort Zeneli': 1338361,
  'Viktor Gyökeres': 664500,
  'Alexander Isak': 690107,
  'Anthony Elanga': 1050166,
  'Gustaf Nilsson': 118241,
  'Alexander Bernhardsson': 1014688,
  'Benjamin Nygren': 931605,
}

const TEAM_IMAGE_FALLBACKS: Record<string, string> = {
  England: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80',
}

// ── Player photos ─────────────────────────────────────────────────────────────
// Prioritise official federation/team media for the editorial guide cards.
// FotMob is intentionally reserved for the compact Swedish squad thumbnails.

const PLAYER_PHOTOS: Record<string, string> = {
  // ── Official federation / national-team portraits ────────────────────────
  'Viktor Gyökeres':        'https://www.svenskfotboll.se/4a8c04/globalassets/svff/bilderblock/arkiv/2025/2510/viktor_gyokeres.jpg',
  'Kylian Mbappé':          'https://media.fff.fr/uploads/images/6603fdc34dc59cdc97f993a1260e5432.png',
  'Vinicius Jr':            'https://stcbfsiteprdimgbrs.blob.core.windows.net/img-site/cdn/WhatsApp%20Image%202024-11-19%20at%2008.43.25.jpeg',
  'Jude Bellingham':        'https://cdn.englandfootball.com/-/jssmedia/EnglandFootball/PlayerProfile/MenSenior/2024-25/jude-bellingham-550.png?h=750&iar=0&w=550&rev=0b4d47a21bed497f889215b63e929bc9&hash=7F000E2745A888BB3B7771EDDF564CD7',
  'Lamine Yamal':           'https://rfef.es/sites/default/files/styles/ficha/public/fichas-jugadores/lamine_yamal_390x520.png.webp?itok=lsnSWy-H',
  'Pedri':                  'https://rfef.es/sites/default/files/styles/ficha/public/img-internacionales/pedri.jpg.webp?itok=GR9LGM3J',
  'Bukayo Saka':            'https://cdn.englandfootball.com/-/jssmedia/EnglandFootball/PlayerProfile/MenSenior/2025-26/March-2026/Bukayo-Saka.png?h=750&iar=0&w=550&rev=4433ab9cadb4481aa12df88a9983ef8d&hash=36A119D7B5C6E4A2D43A05D4FD4F59D4',
  'Virgil van Dijk':        'https://sassets.knvb.nl/sites/onsoranje.nl/files/players/b61529d98808eb966fa155298ca81792.png',
  'Cody Gakpo':             'https://sassets.knvb.nl/sites/onsoranje.nl/files/players/3e9a4e8dee2e952749a7cdd047dfa6c0.png',
  'Frenkie de Jong':        'https://sassets.knvb.nl/sites/onsoranje.nl/files/players/cd3807c73b8d246ce326a0e48533e9e0.png',
  'Tijjani Reijnders':      'https://sassets.knvb.nl/sites/onsoranje.nl/files/players/be24e2c2dc9664752b4865432810daf7.png',
  'Takefusa Kubo':          'https://jfa.jp/national_team/inc/member/samuraiblue/kubo_takefusa.jpg',
  'Ritsu Doan':             'https://jfa.jp/national_team/inc/member/samuraiblue/doan_ritsu.jpg',
  'Daichi Kamada':          'https://jfa.jp/national_team/inc/member/samuraiblue/kamada_daichi.jpg',
  'Warren Zaïre-Emery':     'https://fff.twic.pics/https://media.fff.fr/uploads/images/dc56020d1eb06b8a33496793162c4a0f.png?twic=v1/focus=470x207',

  // ── Official club / competition media when federation portraits are weak ──
  'Erling Haaland':         '/images/worldcup-guide/players/erling-haaland.jpg',
  'Jamal Musiala':          'https://res.cloudinary.com/dfb-de/image/fetch/c_fill,g_faces:center,h_576,w_1024/q_auto/f_auto/https://assets.dfb.de/uploads/000/312/393/original_musiala.jpg',
  'Achraf Hakimi':          'https://media.psg.fr/image/upload/c_limit,w_3841/f_avif/q_75/v1/_AM12909_cpdgze?_a=BAVAZGID0',
  'Julián Álvarez':         'https://img-estaticos.atleticodemadrid.com/system/fotos/17851/destacado_300x300/BUSTOS_WEB_900x900_0016_19_J-ALVAREZ.png?1723899633',
  'Endrick':                'https://publish.realmadrid.com/content/dam/portals/realmadrid-com/es-es/sports/football/3kq9cckrnlogidldtdie2fkbl/players/endrick/assets/ENDRICK_EQUIPO_CARITA_380x501_SinParche.png',
  'Arda Güler':             'https://publish.realmadrid.com/content/dam/portals/realmadrid-com/es-es/sports/football/3kq9cckrnlogidldtdie2fkbl/players/arda-guler/assets/ARDA_550x650_SinParche.png',

  // ── Local editorial fallbacks ─────────────────────────────────────────────
  'Kendry Páez':            '/images/worldcup-guide/players/kendry-paez.png',
  'Youssef Msakni':         '/images/worldcup-guide/players/youssef-msakni.png',
  'Wahbi Khazri':           '/images/worldcup-guide/players/wahbi-khazri.png',
}

const COUNTRY_COLORS: Record<string, string> = {
  'Sverige': '#FFCD00',
  'Frankrike': '#0055A4',
  'Brasilien': '#009B3A',
  'England': '#CF081F',
  'Spanien': '#C60B1E',
  'Norge': '#EF2B2D',
  'Argentina': '#75AADB',
  'Portugal': '#006233',
  'Uruguay': '#5EB6E4',
  'Marocko': '#C1272D',
  'Colombia': '#FCD116',
  'Kroatien': '#FF4444',
  'Skottland': '#0065BD',
  'Turkiet': '#E30A17',
  'Ecuador': '#FFD100',
  'Belgien': '#EF3340',
  'Egypten': '#CE1126',
  'Nederländerna': '#FF6200',
  'Japan': '#BC002D',
  'Tunisien': '#E70013',
  'Tyskland': '#888888',
  'Mexiko': '#006847',
  'USA': '#C8102E',
}

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
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerStatRow>>({})
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    setPlayerStats(VERIFIED_PLAYER_STATS)
    setLastUpdated(VERIFIED_PLAYER_STATS_UPDATED_AT)

    // Try to override with live Supabase rows if available
    const supabase = createClient()
    supabase
      .from('player_stats')
      .select('player_id, player_name, season, club, league, goals_club, assists_club, appearances_club, starts_club, minutes_club, clean_sheets, goals_national, caps_national, updated_at, data_source, verified_at, source_note')
      .eq('season', PLAYER_STATS_SEASON)
      .then(({ data }) => {
        const rows = (data ?? []) as PlayerStatRow[]
        if (rows.length === 0) return  // keep static fallback
        setPlayerStats((prev: Record<string, PlayerStatRow>) => ({
          ...prev,
          ...Object.fromEntries(rows.map(row => [row.player_name, row])),
        }))
        const newest = rows
          .map(row => row.updated_at)
          .filter(Boolean)
          .sort()
          .at(-1) ?? null
        if (newest) setLastUpdated(newest)
      })
  }, [])

  return (
    <div className="min-h-screen bg-navy-950">
      <NavBar userName={null} />

      {/* Full-bleed hero — SoFi Stadium, Los Angeles */}
      <div className="relative h-[55vh] min-h-[300px] overflow-hidden">
        <Image
          src="/images/sofi-stadium-aerial.jpg"
          alt="SoFi Stadium i Los Angeles, USA — VM 2026"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-navy-950/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-16 pb-10">
          <div className="label text-swe-yellow/70 mb-2">VM-Bibel · 2026</div>
          <h1 className="font-display font-black uppercase tracking-tight leading-none">
            <span className="block text-white" style={{ fontSize: 'clamp(28px, 4.5vw, 56px)' }}>VM 2026</span>
            <span className="block text-swe-yellow" style={{ fontSize: 'clamp(72px, 14vw, 160px)' }}>GUIDEN</span>
          </h1>
          <p className="text-white/45 text-sm mt-3">11 juni – 19 juli · USA, Kanada &amp; Mexiko · 48 lag · 104 matcher</p>
        </div>
      </div>

      {/* Stat strip — open editorial, no boxes */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl">
          <div className="flex divide-x divide-white/[0.12]">
            {[
              { label: 'Lag', value: '48' },
              { label: 'Grupper', value: '12 · A–L' },
              { label: 'Matcher', value: '104' },
              { label: 'Final', value: '19 jul' },
            ].map(({ label, value }) => (
              <div key={label} className="flex-1 px-5 lg:px-10 py-6 lg:py-8">
                <div
                  className="font-mono font-bold leading-none text-swe-yellow"
                  style={{ fontSize: 'clamp(30px, 4.5vw, 64px)' }}
                >
                  {value}
                </div>
                <div className="text-[11px] text-white/40 uppercase tracking-widest mt-2">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="sticky top-14 z-40 bg-navy-950 border-b border-white/10">
        <div className="mx-auto max-w-7xl">
          <div className="flex overflow-x-auto scrollbar-hide px-4 lg:px-8">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex-shrink-0 px-4 py-3.5 text-xs font-display font-black uppercase tracking-wider transition-colors whitespace-nowrap ${
                  tab === t.id ? 'text-white' : 'text-white/35 hover:text-white/70'
                }`}
              >
                {t.label}
                {tab === t.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-swe-yellow" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 lg:px-8 py-8">
        {tab === 'grupper' && <GroupsTab />}
        {tab === 'stjärnor' && <PlayersTab players={STARS} title="Världsstjärnor" subtitle="De 12 bästa spelarna i VM 2026" stats={playerStats} />}
        {tab === 'talanger' && <PlayersTab players={TALENTS} title="Talanger att bevaka" subtitle="Unga spelare som kan chockera världen" stats={playerStats} />}
        {tab === 'sverige' && <SwedenTab stats={playerStats} />}
        {tab === 'favoriter' && <FavoritesTab />}
        {tab === 'mörkhästar' && <DarkHorsesTab />}
        {tab === 'fakta' && <FactsTab />}
      </main>

      <Footer />
    </div>
  )
}

const F = (code: string) => `https://flagcdn.com/${code}.svg`

const FLAG_MAP: Record<string, string> = {
  // ── Local high-quality SVGs ────────────────────────────────────────────────
  'Sverige':        '/images/flag-se.svg',
  'Nederländerna':  '/images/flag-nl.svg',
  'Japan':          '/images/flag-jp.svg',
  'Tunisien':       '/images/flag-tn.svg',
  'Brasilien':      '/images/flag-br.svg',
  'Frankrike':      '/images/flag-fr.svg',
  'Spanien':        '/images/flag-es.svg',
  'Argentina':      '/images/flag-ar.svg',
  'Portugal':       '/images/flag-pt.svg',
  'Tyskland':       '/images/flag-de.svg',
  'USA':            '/images/flag-us.svg',
  'England':        '/images/flag-gb.svg',

  // ── Grupp A ────────────────────────────────────────────────────────────────
  'Mexiko':         F('mx'),
  'Sydkorea':       F('kr'),
  'Tjeckien':       F('cz'),
  'Sydafrika':      F('za'),

  // ── Grupp B ────────────────────────────────────────────────────────────────
  'Kanada':         F('ca'),
  'Schweiz':        F('ch'),
  'Bosnien-H.':     F('ba'),
  'Qatar':          F('qa'),

  // ── Grupp C ────────────────────────────────────────────────────────────────
  'Marocko':        F('ma'),
  'Skottland':      F('gb-sct'),
  'Haiti':          F('ht'),

  // ── Grupp D ────────────────────────────────────────────────────────────────
  'Turkiet':        F('tr'),
  'Australien':     F('au'),
  'Paraguay':       F('py'),

  // ── Grupp E ────────────────────────────────────────────────────────────────
  'Ecuador':        F('ec'),
  'Elfenbenskusten': F('ci'),
  'Curaçao':        F('cw'),

  // ── Grupp G ────────────────────────────────────────────────────────────────
  'Belgien':        F('be'),
  'Egypten':        F('eg'),
  'Iran':           F('ir'),
  'Nya Zeeland':    F('nz'),

  // ── Grupp H ────────────────────────────────────────────────────────────────
  'Uruguay':        F('uy'),
  'Saudiarabien':   F('sa'),
  'Kap Verde':      F('cv'),

  // ── Grupp I ────────────────────────────────────────────────────────────────
  'Norge':          F('no'),
  'Senegal':        F('sn'),
  'Irak':           F('iq'),

  // ── Grupp J ────────────────────────────────────────────────────────────────
  'Österrike':      F('at'),
  'Algeriet':       F('dz'),
  'Jordanien':      F('jo'),

  // ── Grupp K ────────────────────────────────────────────────────────────────
  'Colombia':       F('co'),
  'Uzbekistan':     F('uz'),
  'Kongo DR':       F('cd'),

  // ── Grupp L ────────────────────────────────────────────────────────────────
  'Kroatien':       F('hr'),
  'Ghana':          F('gh'),
  'Panama':         F('pa'),
}

// ── Tab: Groups ────────────────────────────────────────────────────────────────

function GroupsTab() {
  return (
    <div className="space-y-0">
      {/* Editorial header */}
      <div className="mb-8">
        <h2 className="font-display font-black text-5xl sm:text-7xl uppercase tracking-tight text-white leading-none mb-3">
          Gruppspel
        </h2>
        <div className="h-[3px] w-16 bg-swe-yellow" />
        <p className="text-white/40 text-sm mt-3">
          12 grupper · A–L · De 2 bästa + 8 bästa tredjeplacerade vidare ·{' '}
          <span className="text-swe-yellow font-display font-black">W</span> = etta ·{' '}
          <span className="text-white/60 font-display font-black">Q</span> = vidare ·{' '}
          <span className="text-white/20 font-display font-black">E</span> = åker hem
        </p>
      </div>

      <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3 bg-white/5">
        {GROUPS.map(g => (
          <div
            key={g.letter}
            className={`relative overflow-hidden bg-navy-950 ${
              g.letter === 'F' ? 'border border-swe-yellow/30' : ''
            }`}
          >
            {g.imageUrl && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.imageUrl}
                  alt={g.imageAlt ?? `Grupp ${g.letter}`}
                  className="absolute inset-0 h-full w-full object-cover opacity-45"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/75 to-navy-950/25" />
              </>
            )}
            {/* Giant background letter */}
            <div className="absolute inset-0 flex items-center justify-end pr-4 pointer-events-none overflow-hidden">
              <span
                className="font-display font-black leading-none select-none text-swe-yellow"
                style={{ fontSize: '180px', opacity: g.letter === 'F' ? 0.10 : 0.055 }}
              >
                {g.letter}
              </span>
            </div>

            {/* Group header */}
            <div className={`relative px-4 py-2.5 flex items-center justify-between border-b ${
              g.letter === 'F' ? 'border-swe-yellow/20 bg-swe-yellow/5' : 'border-white/5 bg-navy-900/60'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="font-display font-black text-xl uppercase tracking-widest text-white">
                  {g.letter}
                </span>
                <span className="text-white/20 text-xs">·</span>
                <span className="text-[10px] font-display font-black text-white/35 uppercase tracking-wider">
                  {g.hotMatch}
                </span>
              </div>
              {g.letter === 'F' && (
                <span className="text-[9px] font-display font-black uppercase tracking-wider border border-swe-yellow/40 text-swe-yellow px-1.5 py-0.5">
                  Sverige
                </span>
              )}
            </div>

            {/* Teams */}
            <div className="relative divide-y divide-white/5">
              {g.teams.map(team => (
                <div key={team.name} className={`flex items-center gap-2.5 px-4 py-2 ${
                  team.name === 'Sverige' ? 'bg-swe-yellow/5' : ''
                }`}>
                  {FLAG_MAP[team.name] ? (
                    <img src={FLAG_MAP[team.name]} alt={team.name}
                      className="w-5 h-3.5 object-cover flex-shrink-0 opacity-80" />
                  ) : (
                    <span className="w-5 h-3.5 flex-shrink-0" />
                  )}
                  <span className={`flex-1 font-display font-black uppercase tracking-wide text-sm ${
                    team.name === 'Sverige' ? 'text-swe-yellow' : 'text-white/75'
                  }`}>{team.name}</span>
                  <span className={`text-[10px] font-display font-black px-1.5 py-0.5 border ${
                    team.prediction === 'W'
                      ? 'text-swe-yellow border-swe-yellow/40'
                      : team.prediction === 'Q'
                      ? 'text-white/50 border-white/15'
                      : 'text-white/15 border-white/8'
                  }`}>{team.prediction}</span>
                </div>
              ))}
            </div>

            {/* Analysis */}
            <div className="relative px-4 py-2.5 border-t border-white/5">
              <p className="text-[11px] text-white/35 leading-relaxed">{g.analysis}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab: Players ───────────────────────────────────────────────────────────────

function statFor(stats: Record<string, PlayerStatRow>, name: string) {
  const stat = stats[PLAYER_NAME_ALIASES[name] ?? name] ?? stats[name]
  return stat?.season === PLAYER_STATS_SEASON ? stat : undefined
}

function statSource(stat: PlayerStatRow | undefined, playerName?: string) {
  return stat ?? (playerName ? VERIFIED_PLAYER_STATS[playerName] : undefined)
}

function formatCompactStat(value: number | null | undefined, suffix = '') {
  if (value == null) return '–'
  return `${value}${suffix}`
}

function statSourceLabel(stat?: PlayerStatRow) {
  if (!stat) return null
  if (stat.data_source === 'verified_static+api_football') return 'Verifierad 25/26 + live'
  if (stat.data_source === 'verified_static') return 'Verifierad 25/26'
  if (stat.data_source === 'api_football') return 'Live 25/26'
  return null
}

type PlayerRole = 'goalkeeper' | 'defender' | 'defensive-midfielder' | 'midfielder' | 'forward'

function roleForPosition(position: string, isGoalkeeper = false): PlayerRole {
  if (isGoalkeeper) return 'goalkeeper'
  const normalized = position.toLowerCase()
  if (normalized.includes('målvakt') || normalized.includes('keeper')) return 'goalkeeper'
  if (
    normalized.includes('mittback') ||
    normalized.includes('back') ||
    normalized.includes('försvar') ||
    normalized.includes('cb') ||
    normalized.includes('lb') ||
    normalized.includes('rb')
  ) return 'defender'
  if (
    normalized.includes('defensiv') ||
    normalized.includes('dm') ||
    normalized.includes('holding')
  ) return 'defensive-midfielder'
  if (
    normalized.includes('anfall') ||
    normalized.includes('ytter') ||
    normalized.includes('forward') ||
    normalized.includes('wing') ||
    normalized.includes('st')
  ) return 'forward'
  return 'midfielder'
}

function statHighlightsForPlayer(position: string, stat?: PlayerStatRow, isGoalkeeper = false) {
  const role = roleForPosition(position, isGoalkeeper)
  const goalInvolvements = (stat?.goals_club ?? 0) + (stat?.assists_club ?? 0)
  const startsOrApps = stat?.starts_club ?? stat?.appearances_club

  switch (role) {
    case 'goalkeeper':
      return [
        {
          label: stat?.clean_sheets != null ? 'Hållna nollor' : 'Matcher',
          value: stat?.clean_sheets != null
            ? formatCompactStat(stat?.clean_sheets)
            : formatCompactStat(stat?.appearances_club),
        },
        {
          label: stat?.starts_club != null ? 'Starter' : 'Minuter',
          value: stat?.starts_club != null
            ? formatCompactStat(stat?.starts_club)
            : formatCompactStat(stat?.minutes_club),
        },
      ]
    case 'defender':
      return [
        {
          label: stat?.clean_sheets != null ? 'Hållna nollor' : startsOrApps != null ? 'Starter' : 'Minuter',
          value: stat?.clean_sheets != null
            ? formatCompactStat(stat.clean_sheets)
            : startsOrApps != null
            ? formatCompactStat(startsOrApps)
            : formatCompactStat(stat?.minutes_club),
        },
        {
          label: goalInvolvements > 0 ? 'Målpoäng' : 'Landskamper',
          value: goalInvolvements > 0
            ? formatCompactStat(goalInvolvements)
            : formatCompactStat(stat?.caps_national),
        },
      ]
    case 'defensive-midfielder':
      return [
        {
          label: stat?.starts_club != null ? 'Starter' : stat?.appearances_club != null ? 'Matcher' : 'Minuter',
          value: stat?.starts_club != null
            ? formatCompactStat(stat.starts_club)
            : stat?.appearances_club != null
            ? formatCompactStat(stat.appearances_club)
            : formatCompactStat(stat?.minutes_club),
        },
        {
          label: stat?.caps_national != null && stat.caps_national > 0
            ? 'Landskamper'
            : stat?.assists_club != null && stat.assists_club > 0
            ? 'Assist'
            : 'Målpoäng',
          value: stat?.caps_national != null && stat.caps_national > 0
            ? formatCompactStat(stat.caps_national)
            : stat?.assists_club != null && stat.assists_club > 0
            ? formatCompactStat(stat.assists_club)
            : formatCompactStat(goalInvolvements),
        },
      ]
    case 'midfielder':
      return [
        { label: 'Målpoäng', value: formatCompactStat(goalInvolvements) },
        {
          label: stat?.starts_club != null ? 'Starter' : stat?.appearances_club != null ? 'Matcher' : 'Minuter',
          value: stat?.starts_club != null
            ? formatCompactStat(stat.starts_club)
            : stat?.appearances_club != null
            ? formatCompactStat(stat.appearances_club)
            : formatCompactStat(stat?.minutes_club),
        },
      ]
    case 'forward':
    default:
      return [
        { label: 'Mål', value: formatCompactStat(stat?.goals_club) },
        {
          label: stat?.assists_club != null ? 'Assist' : stat?.appearances_club != null ? 'Matcher' : 'Minuter',
          value: stat?.assists_club != null
            ? formatCompactStat(stat?.assists_club)
            : stat?.appearances_club != null
            ? formatCompactStat(stat.appearances_club)
            : formatCompactStat(stat?.minutes_club),
        },
      ]
  }
}

function PlayerStatHighlights({
  position,
  stat,
  playerName,
  isGoalkeeper = false,
  accentColor,
}: {
  position: string
  stat?: PlayerStatRow
  playerName?: string
  isGoalkeeper?: boolean
  accentColor: string
}) {
  const source = statSource(stat, playerName)
  if (!source) return null
  const highlights = statHighlightsForPlayer(position, source, isGoalkeeper)
  const sourceLabel = statSourceLabel(source)

  return (
    <div className="mt-3">
      <div className="grid grid-cols-2 gap-2">
        {highlights.map(item => (
          <div
            key={item.label}
            className="rounded-sm border bg-black/45 px-2.5 py-2"
            style={{ borderColor: `${accentColor}40` }}
          >
            <div className="text-[9px] uppercase tracking-[0.18em] text-white/45">{item.label}</div>
            <div className="mt-1 font-mono text-[18px] font-bold leading-none" style={{ color: accentColor }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
      {sourceLabel && (
        <div className="mt-2 inline-flex items-center rounded-full border border-white/10 bg-black/35 px-2 py-1 text-[9px] font-display font-black uppercase tracking-[0.18em] text-white/45">
          {sourceLabel}
        </div>
      )}
    </div>
  )
}

function PlayerStatsLine({
  stat,
  isGoalkeeper = false,
  fallbackClub,
  playerName,
}: {
  stat?: PlayerStatRow
  isGoalkeeper?: boolean
  fallbackClub?: string
  playerName?: string
}) {
  if (!stat) {
    const verified = playerName ? VERIFIED_PLAYER_STATS[playerName] : null
    if (verified) {
      const appearancePart = verified.starts_club != null
        ? `${verified.starts_club} starter`
        : verified.appearances_club != null
        ? `${verified.appearances_club} matcher`
        : `${verified.minutes_club ?? '–'} min`
      const clubPart = isGoalkeeper
        ? `${verified.clean_sheets ?? '–'} hållna nollor · ${appearancePart}`
        : `${verified.goals_club ?? '–'} mål · ${verified.assists_club ?? '–'} assist · ${appearancePart}`
      return <span>{clubPart} · Landslag: {verified.caps_national ?? '–'} matcher / {verified.goals_national ?? '–'} mål</span>
    }
    return <span>Klubb: {fallbackClub ?? 'inväntar verifiering'} · 25/26-statistik inväntar verifiering</span>
  }
  const appearancePart = stat.starts_club != null
    ? `${stat.starts_club} starter`
    : stat.appearances_club != null
    ? `${stat.appearances_club} matcher`
    : `${stat.minutes_club ?? '–'} min`
  const clubPart = isGoalkeeper
    ? `${stat.clean_sheets ?? '–'} hållna nollor · ${appearancePart}`
    : `${stat.goals_club ?? '–'} mål · ${stat.assists_club ?? '–'} assist · ${appearancePart}`
  return (
    <span>
      {clubPart} · Landslag: {stat.caps_national ?? '–'} matcher / {stat.goals_national ?? '–'} mål
    </span>
  )
}

function PlayersTab({
  players,
  title,
  subtitle,
  stats = {},
}: {
  players: Player[]
  title: string
  subtitle: string
  stats?: Record<string, PlayerStatRow>
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display font-black text-5xl sm:text-7xl uppercase tracking-tight text-white leading-none mb-3">
          {title}
        </h2>
        <div className="h-[3px] w-16 bg-swe-yellow" />
        <p className="text-white/40 text-sm mt-3">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
        {players.map(p => {
          const isExpanded = expanded === p.name
          const stat = statFor(stats, p.name)
          const accentColor = COUNTRY_COLORS[p.country] ?? '#FFCD00'
          const nameParts = p.name.split(' ')
          const lastName = nameParts.at(-1) ?? p.name
          const firstNames = nameParts.slice(0, -1).join(' ')
          const photo = p.imageUrl ?? PLAYER_PHOTOS[p.name]
          const sourceStat = statSource(stat, p.name)
          return (
            <div
              key={p.name}
              className="relative overflow-hidden cursor-pointer bg-[#070e1c]"
              style={isExpanded ? { minHeight: '520px' } : { aspectRatio: '2/3' }}
              onClick={() => setExpanded(isExpanded ? null : p.name)}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-[#050b16] text-7xl opacity-50">
                {p.flag}
              </div>
              {/* Photo */}
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt={p.name}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none bg-[#050b16]">
                  <span className="text-7xl opacity-55">{p.flag}</span>
                  <span
                    className="absolute bottom-1 right-2 font-display font-black text-white leading-none"
                    style={{ fontSize: '120px', opacity: 0.06, letterSpacing: '-0.04em' }}
                  >
                    {lastName.toUpperCase()}
                  </span>
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

              {/* Left accent stripe */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: accentColor }} />

              {/* Top row: country badge + rating */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between p-4">
                <div className="flex items-center gap-1.5">
                  {p.flag && <span className="text-lg leading-none">{p.flag}</span>}
                  <span
                    className="text-[9px] font-display font-black uppercase tracking-widest border px-1.5 py-0.5 bg-black/50"
                    style={{ color: accentColor, borderColor: `${accentColor}55` }}
                  >
                    {p.country}
                  </span>
                </div>
                <div className="text-right leading-none">
                  <div className="font-mono font-bold text-[44px] leading-none" style={{ color: accentColor }}>
                    {p.rating}
                  </div>
                  <div className="text-white/25 text-[10px] font-mono -mt-1">/10</div>
                </div>
              </div>

              {/* Bottom: name + details */}
              <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
                {firstNames && (
                  <div className="font-display font-black text-base uppercase text-white/55 leading-none tracking-wide">
                    {firstNames}
                  </div>
                )}
                <div
                  className="font-display font-black uppercase leading-none mt-0.5"
                  style={{ fontSize: 'clamp(26px, 3vw, 38px)', color: accentColor, letterSpacing: '-0.02em' }}
                >
                  {lastName}
                </div>
                <div className="text-white/35 text-[11px] uppercase tracking-wider mt-1.5">
                  {p.position} · {p.club} · {p.age} år
                </div>
                <PlayerStatHighlights
                  position={p.position}
                  stat={sourceStat}
                  playerName={p.name}
                  accentColor={accentColor}
                />
                <div className="text-white/30 text-[10px] font-mono mt-2">
                  <PlayerStatsLine stat={stat} fallbackClub={p.club} playerName={p.name} />
                </div>
                {isExpanded && (
                  <div className="border-t border-white/15 mt-3 pt-3 space-y-2">
                    <p className="text-[15px] text-white/80 leading-relaxed">{p.why}</p>
                    {p.style && (
                      <div className="border-l-2 pl-3 mt-2" style={{ borderColor: accentColor }}>
                        <p className="text-sm text-white/45 italic leading-relaxed">{p.style}</p>
                      </div>
                    )}
                  </div>
                )}
                {!isExpanded && (
                  <p className="text-[11px] text-white/30 line-clamp-1 mt-1">{p.why}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Tab: Sweden ────────────────────────────────────────────────────────────────

function SwedenTab({ stats }: { stats: Record<string, PlayerStatRow> }) {
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null)

  return (
    <div className="space-y-0">

      {/* ── Hero image — Sverige vs Polen VM-kval ── */}
      <div className="relative h-[40vh] min-h-[240px] overflow-hidden">
        <Image
          src="/images/sweden-poland-wc-qual-1.jpg"
          alt="Sverige i VM-kvalet 2025 — blågult mot världen"
          fill
          sizes="100vw"
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-navy-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <div className="label text-swe-yellow/60 mb-1">Grupp F · VM 2026</div>
          <h2 className="font-display font-black text-3xl uppercase tracking-wide text-white">Sverige</h2>
        </div>
      </div>

      {/* ── Title block ── */}
      <div className="border border-white/10 border-t-0 px-5 py-5 bg-navy-900">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-white/40 text-xs">Coach: Graham Potter · 26 spelare uttagna</p>
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
        <Image
          src="/images/nrg-stadium.jpg"
          alt="NRG Stadium i Houston, Texas — Sverige möter Nederländerna här 20 juni"
          fill
          sizes="100vw"
          className="object-cover object-center"
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
      <div className="pt-10 pb-2">
        <h2 className="font-display font-black text-5xl sm:text-7xl uppercase tracking-tight text-white leading-none mb-3">
          Nyckelspelare
        </h2>
        <div className="h-[3px] w-16 bg-swe-yellow mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
          {FEATURED_PLAYERS.map(p => {
            const isExpanded = expandedPlayer === p.name
            const photo = PLAYER_IMAGE_FALLBACKS[p.imageKey] ?? null
            return (
              <div
                key={p.name}
                className="relative overflow-hidden cursor-pointer bg-[#0d1d35]"
                style={isExpanded ? { minHeight: '380px' } : { aspectRatio: '3/4' }}
                onClick={() => setExpandedPlayer(isExpanded ? null : p.name)}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-[#07111f] text-7xl opacity-45">🇸🇪</div>
                {/* Photo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt={`${p.name}, Sverige`}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Rating */}
                <div className="absolute top-4 right-4 text-right leading-none">
                  <div className="font-mono font-bold text-[72px] text-swe-yellow leading-none">{p.rating}</div>
                  <div className="text-white/30 text-sm font-mono -mt-2">/10</div>
                </div>

                {/* Sverige chip */}
                <div className="absolute top-4 left-4">
                  <span className="font-display font-black text-[10px] uppercase tracking-widest border border-swe-yellow/30 bg-black/50 text-swe-yellow px-2 py-1">
                    Sverige
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
                  <div className="font-display font-black text-2xl uppercase tracking-wide text-white leading-tight">
                    {p.name}
                  </div>
                  <div className="text-white/40 text-[11px] uppercase tracking-wider">
                    {p.position} · {p.club} · {p.age} år
                  </div>
                  <div className="text-white/25 text-[10px] font-mono">
                    <PlayerStatsLine stat={statFor(stats, p.name)} fallbackClub={p.club} playerName={p.name} />
                  </div>
                  {isExpanded && (
                    <div className="pt-3 space-y-3 border-t border-white/10 mt-3">
                      <p className="text-sm text-white/70 leading-relaxed">{p.desc}</p>
                      <div className="border-l-2 border-swe-yellow pl-3">
                        <p className="text-xs text-white/45 leading-relaxed italic">{p.keyStrength}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Full squad ── */}
      <div className="border border-white/10 border-t-0 bg-navy-950">
        <div className="px-4 py-3 bg-navy-950 border-b border-white/10 flex items-end justify-between gap-4">
          <div>
            <div className="label text-swe-yellow/70">Hela truppen · 26 spelare</div>
            <p className="mt-1 text-xs text-white/35">FotMob-porträtt, klubbform och roll i blågult.</p>
          </div>
          <img src="/images/flag-se.svg" alt="Sverige" className="h-7 w-10 object-cover opacity-80" />
        </div>
        {Object.entries(SQUAD).map(([pos, players]) => (
          <div key={pos} className="border-b border-white/5 last:border-0">
            <div className="px-4 py-2 bg-navy-900/70">
              <span className="text-[11px] font-display font-black uppercase tracking-widest text-swe-yellow/70">{pos}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y divide-white/5 md:divide-y-0 md:gap-px md:bg-white/5">
              {players.map(p => (
                <div key={p.name} className="flex items-center gap-3 bg-navy-950 px-4 py-3 hover:bg-navy-900/55 transition-colors">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-swe-yellow/25 bg-[#07111f]">
                    {SWEDISH_SQUAD_FOTMOB_IDS[p.name] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getFotMobImageUrl(SWEDISH_SQUAD_FOTMOB_IDS[p.name])}
                        alt={p.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-2xl">🇸🇪</span>
                    )}
                  </div>
                  <span className="w-8 text-center text-[10px] font-display font-black text-swe-yellow/75 border border-swe-yellow/20 bg-swe-yellow/5 py-0.5">{p.pos}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-base text-white font-display font-black uppercase tracking-wide leading-tight">{p.name}</div>
                    <div className="text-[10px] text-white/35">
                      <PlayerStatsLine
                        stat={statFor(stats, p.name)}
                        isGoalkeeper={pos === 'Målvakter'}
                        fallbackClub={p.club}
                        playerName={p.name}
                      />
                    </div>
                  </div>
                  <span className="hidden sm:block text-xs text-white/30 text-right">{statFor(stats, p.name)?.club ?? p.club}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <PlayersTab
        players={GROUP_F_NOTABLES}
        title="Grupp F · motståndarprofiler"
        subtitle="Notabla spelare från Nederländerna, Japan och Tunisien"
        stats={stats}
      />

    </div>
  )
}

// ── Tab: Favorites ─────────────────────────────────────────────────────────────

function FavoritesTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display font-black text-5xl sm:text-6xl uppercase tracking-tight text-white leading-none mb-3">
          Favoriter
        </h2>
        <div className="h-[2px] w-14 bg-swe-yellow" />
        <p className="text-white/40 text-sm mt-3">Oddsbaserade vinstchanser för de starkaste lagen.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/5">
        {FAVORITES.map((f, i) => (
          <div key={f.country} className="relative min-h-[230px] overflow-hidden bg-[#07111f]">
            <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-45">{f.flag}</div>
            {(f.imageUrl ?? TEAM_IMAGE_FALLBACKS[f.country]) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={f.imageUrl ?? TEAM_IMAGE_FALLBACKS[f.country]}
                alt={f.country}
                className="absolute inset-0 h-full w-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-swe-yellow" />
            <div className="relative z-10 flex h-full min-h-[230px] flex-col justify-between p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="font-mono text-white/40 text-sm">{String(i + 1).padStart(2, '0')}</div>
                <div className="text-right leading-none">
                  <span className="font-mono font-bold text-5xl text-swe-yellow">{f.pct}</span>
                  <span className="text-white/35 text-lg">%</span>
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">{f.flag}</span>
                  <span className="font-display font-black uppercase tracking-wide text-2xl text-white">{f.country}</span>
                </div>
                <div className="h-[2px] bg-white/20 overflow-hidden">
                  <div className="h-full bg-swe-yellow" style={{ width: `${(f.pct / 19) * 100}%` }} />
                </div>
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
    <div className="space-y-8">
      <div>
        <h2 className="font-display font-black text-5xl sm:text-6xl uppercase tracking-tight text-white leading-none mb-3">
          Skrällchanser
        </h2>
        <div className="h-[2px] w-14 bg-swe-yellow" />
        <p className="text-white/40 text-sm mt-3">Lag som kan gå längre än de flesta tror.</p>
      </div>

      <div className="grid grid-cols-1 gap-px bg-white/5">
        {DARK_HORSES.map(d => (
          <div key={d.country} className="relative min-h-[260px] overflow-hidden bg-[#07111f]">
            <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-45">{d.flag}</div>
            {d.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={d.imageUrl}
                alt={d.country}
                className="absolute inset-0 h-full w-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent" />
            <div className="relative z-10 flex min-h-[260px] flex-col justify-end p-5">
            <div className="flex items-start gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="font-display font-black uppercase tracking-wide text-white text-2xl leading-none mb-1">
                  {d.flag} {d.country}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-display font-black border border-swe-yellow/30 text-swe-yellow px-1.5 py-0.5">
                    Max {d.maxFinish}
                  </span>
                  <span className="text-[11px] text-white/35 font-display font-black uppercase">{d.keyPlayer}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 leading-none">
                <div className="font-mono font-bold text-5xl text-swe-yellow">{d.strength}</div>
                <div className="text-white/25 text-xs font-mono -mt-1">/10</div>
              </div>
            </div>
            <div className="h-[2px] bg-white/8 mb-4 overflow-hidden">
              <div className="h-full bg-swe-yellow" style={{ width: `${(d.strength / 10) * 100}%` }} />
            </div>
            <p className="text-sm text-white/50 leading-relaxed">{d.why}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab: Facts ─────────────────────────────────────────────────────────────────

function FactsTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display font-black text-5xl sm:text-6xl uppercase tracking-tight text-white leading-none mb-3">
          VM-fakta
        </h2>
        <div className="h-[2px] w-14 bg-swe-yellow" />
        <p className="text-white/40 text-sm mt-3">{FACTS.length} saker du bör veta inför VM 2026.</p>
      </div>

      <div className="divide-y divide-white/5">
        {FACTS.map((fact, i) => (
          <div key={i} className="flex gap-0">
            <div className="w-14 flex-shrink-0 flex items-start justify-center pt-4 border-r border-white/5">
              <span className="font-mono text-sm text-white/15 font-bold">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <p className="flex-1 px-5 py-4 text-sm text-white/60 leading-relaxed">{fact}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
