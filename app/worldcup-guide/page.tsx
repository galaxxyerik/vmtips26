'use client'

import { useState } from 'react'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'

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
  { country: 'Marocko', flag: '🇲🇦', maxFinish: 'Semifinal', why: 'Marocko visade 2022 att de inte är en gissning längre — de är ett faktum. Hakimi i världsklass, ett kompakt defensivsystem och fanatiska fans. En halvfinal är inte orimlig, det är det troliga scenariot om gruppen klaras av.', keyPlayer: 'Achraf Hakimi', strength: 8 },
  { country: 'Colombia', flag: '🇨🇴', maxFinish: 'Semifinal', why: 'Colombia har en av turneringens bästa offensiva kedjor — yngre, hungrigare och snabbare. Med James Rodríguez som spelande tränare på planen och Jhon Durán som joker kan de gå längre än vad oddsen visar.', keyPlayer: 'James Rodríguez', strength: 8 },
  { country: 'Uruguay', flag: '🇺🇾', maxFinish: 'Kvartsfinal', why: 'Uruguay spelar aldrig vackert men de vinner matcher de inte borde vinna. Valverde och Núñez är ett av VM:s farligaste anfallspar och defensiven är stenhård.', keyPlayer: 'Federico Valverde', strength: 7 },
  { country: 'Kroatien', flag: '🇭🇷', maxFinish: 'Kvartsfinal', why: 'Modrić säger att detta är hans sista VM och det räcker som motivation. Kroatien levererar alltid på storscenen — semifinal 2018, final 2022.', keyPlayer: 'Luka Modrić', strength: 7 },
  { country: 'Skottland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', maxFinish: 'Kvartsfinal', why: 'Första VM sedan 1998 och de är inte med för att åka hem tidigt. Robertson, McTominay och en passionerad trupp — Skottland är det laget ingen vill möta i slutspelet.', keyPlayer: 'Andrew Robertson', strength: 7 },
]

const GROUPS: Group[] = [
  { letter: 'A', teams: [{ name: 'USA', flag: '🇺🇸', prediction: 'W' }, { name: 'Uruguay', flag: '🇺🇾', prediction: 'Q' }, { name: 'Egypten', flag: '🇪🇬', prediction: 'E' }, { name: 'Australien', flag: '🇦🇺', prediction: 'E' }], analysis: 'USA på hemmaplan med 90 000 rasande fans — detta är inte ett vanligt grupp A. Uruguay är klasslagert och säkrar andraplatsen, medan Egypten och Australien kämpar i motvind.', hotMatch: 'USA vs. Uruguay' },
  { letter: 'B', teams: [{ name: 'Mexico', flag: '🇲🇽', prediction: 'W' }, { name: 'Colombia', flag: '🇨🇴', prediction: 'Q' }, { name: 'Ghana', flag: '🇬🇭', prediction: 'E' }, { name: 'Sydkorea', flag: '🇰🇷', prediction: 'E' }], analysis: 'Mexiko på hemmaplan i Azteca — ett scenario som gynnar El Tri. Colombia med Durán är farligare än oddsen visar.', hotMatch: 'Mexico vs. Colombia' },
  { letter: 'C', teams: [{ name: 'Kanada', flag: '🇨🇦', prediction: 'W' }, { name: 'Ecuador', flag: '🇪🇨', prediction: 'Q' }, { name: 'Kamerun', flag: '🇨🇲', prediction: 'E' }, { name: 'Irak', flag: '🇮🇶', prediction: 'E' }], analysis: 'Kanada på hemmaplan för första gången — med Davies och David i laget är de klara vinnare. Ecuador med unge Páez tar andraplatsen.', hotMatch: 'Kanada vs. Ecuador' },
  { letter: 'D', teams: [{ name: 'Frankrike', flag: '🇫🇷', prediction: 'W' }, { name: 'Marocko', flag: '🇲🇦', prediction: 'Q' }, { name: 'Iran', flag: '🇮🇷', prediction: 'E' }, { name: 'Panama', flag: '🇵🇦', prediction: 'E' }], analysis: 'Frankrike vinner utan svettningar och Marocko visar återigen att de är Afrikas bästa. Den verkliga matchen är mötet dem emellan.', hotMatch: 'Frankrike vs. Marocko' },
  { letter: 'E', teams: [{ name: 'Spanien', flag: '🇪🇸', prediction: 'W' }, { name: 'Senegal', flag: '🇸🇳', prediction: 'Q' }, { name: 'Saudiarabien', flag: '🇸🇦', prediction: 'E' }, { name: 'Jamaica', flag: '🇯🇲', prediction: 'E' }], analysis: 'Spanien vinner enkelt med Yamal och Pedri i toppform. Senegals generation tar andraplatsen.', hotMatch: 'Spanien vs. Senegal' },
  { letter: 'F', teams: [{ name: 'Sverige', flag: '🇸🇪', prediction: 'Q' }, { name: 'Nederländerna', flag: '🇳🇱', prediction: 'W' }, { name: 'Japan', flag: '🇯🇵', prediction: 'Q' }, { name: 'Tunisien', flag: '🇹🇳', prediction: 'E' }], analysis: 'Dödsgruppen lever upp till sitt namn. Nederländerna är favoriter men Sverige och Japan är klara utmanare. Tunisien kan ta poäng mot vem som helst.', hotMatch: 'Sverige vs. Japan 🇸🇪' },
  { letter: 'G', teams: [{ name: 'Brasilien', flag: '🇧🇷', prediction: 'W' }, { name: 'Nigeria', flag: '🇳🇬', prediction: 'Q' }, { name: 'Honduras', flag: '🇭🇳', prediction: 'E' }, { name: 'Jordanien', flag: '🇯🇴', prediction: 'E' }], analysis: 'Brasilien vinner utan svettningar. Nigeria är Afrikas andra bästa lag och tar andraplatsen med ett generationsskifte i truppen.', hotMatch: 'Brasilien vs. Nigeria' },
  { letter: 'H', teams: [{ name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prediction: 'W' }, { name: 'Venezuela', flag: '🇻🇪', prediction: 'Q' }, { name: 'Mali', flag: '🇲🇱', prediction: 'E' }, { name: 'Uzbekistan', flag: '🇺🇿', prediction: 'E' }], analysis: 'England kör hem gruppen med Bellingham och Kane i form. Venezuela är turneringens verkliga joker — ungt, expansivt och ingen vet hur man stoppar dem.', hotMatch: 'England vs. Venezuela' },
  { letter: 'I', teams: [{ name: 'Portugal', flag: '🇵🇹', prediction: 'W' }, { name: 'Argentina', flag: '🇦🇷', prediction: 'Q' }, { name: 'Guinea', flag: '🇬🇳', prediction: 'E' }, { name: 'Nya Zeeland', flag: '🇳🇿', prediction: 'E' }], analysis: 'Turneringens mest explosiva grupp. Portugal vs. Argentina avgör förstaplatsen — en match som hela världen ser.', hotMatch: 'Portugal vs. Argentina' },
  { letter: 'J', teams: [{ name: 'Tyskland', flag: '🇩🇪', prediction: 'W' }, { name: 'Skottland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', prediction: 'Q' }, { name: 'Paraguay', flag: '🇵🇾', prediction: 'E' }, { name: 'Georgien', flag: '🇬🇪', prediction: 'E' }], analysis: 'Tyskland med Musiala är klara favoriter men Skottland är turneringens chocknation. Robertson och McTominay bär hoppet.', hotMatch: 'Skottland vs. Paraguay' },
  { letter: 'K', teams: [{ name: 'Belgien', flag: '🇧🇪', prediction: 'W' }, { name: 'Kroatien', flag: '🇭🇷', prediction: 'Q' }, { name: 'Turkiet', flag: '🇹🇷', prediction: 'E' }, { name: 'Costa Rica', flag: '🇨🇷', prediction: 'E' }], analysis: 'De Bruynes sista VM och Modrićs sista VM i samma grupp — historien skriver sig själv. Belgien vinner, Kroatien visar att ålder bara är en siffra.', hotMatch: 'Belgien vs. Kroatien' },
  { letter: 'L', teams: [{ name: 'Norge', flag: '🇳🇴', prediction: 'W' }, { name: 'Serbien', flag: '🇷🇸', prediction: 'Q' }, { name: 'Schweiz', flag: '🇨🇭', prediction: 'E' }, { name: 'Österrike', flag: '🇦🇹', prediction: 'E' }], analysis: 'Haaland på sitt första VM — det räcker som rubrik. Norge vinner klart med Haaland och Nypan i ett ungt, hungert lag.', hotMatch: 'Norge vs. Serbien' },
]

const SWEDEN_PLAYERS: SwedenPlayer[] = [
  { name: 'Viktor Gyökeres', club: 'Arsenal', position: 'Anfallare', age: 28, caps: 55, season: 'En säsong som bekräftar att han är en av världens absolut bästa anfallare. 37 Premier League-mål och Champions League med Arsenal — Gyökeres är i karriärens topp vid perfekt tidpunkt för VM.', role: 'Lagets motor och nationens hopp. Allt offensivt rör sig runt och genom honom.', keyStrength: 'Explosiv avslutning med båda fötterna och ett outhålligt pressingspel som skapar kaos i uppspel.', rating: 10 },
  { name: 'Victor Lindelöf', club: 'Aston Villa', position: 'Mittback (kapten)', age: 31, caps: 95, season: 'Kapten och klippa för Aston Villa. Lindelöf har mognat till en av Europas pålitligaste centralbackar — teknisk, lugn och med ett ledarskap som präglar hela laget.', role: 'Lagets kapten och defensiva ankare. Kommunikation och positionering är nyckeln till Potters kompakthet.', keyStrength: 'Orubblig under press med ett passningsspel från baklinjen som startar Sveriges kontringar.', rating: 8 },
  { name: 'Dejan Kulusevski', club: 'Tottenham', position: 'Mittfältare', age: 25, caps: 48, season: 'En fullt blomstrad säsong för Tottenham med mål och assist i toppklass. Kombinerar fart och teknik med arbetskapacitet som gör honom till en av Premier Leagues mest kompletta mittfältare.', role: 'Lagets kreativa gnista och offensiva frihet. Hans rörlighet och dribbling i press ger Sverige ett unikt redskap.', keyStrength: 'Outhållig löpkapacitet kombinerat med teknisk säkerhet i trång yta och ett oväntat avslut.', rating: 8 },
  { name: 'Alexander Isak', club: 'Newcastle United', position: 'Anfallare', age: 26, caps: 42, season: 'En säsong som befäste hans status som Premier Leagues bästa "second striker" — Isak kombinerar teknik med klinisk avslutning och rörlighet som ger centralbackar mardrömmar.', role: 'Gyökeres partner och alternativ. Förmågan att falla ned i mellanzonen och kombinera ger Gyökeres frihet bakom defensiven.', keyStrength: 'Exceptionell teknisk kontroll med hög löpfart och ett vänsterben som är svårt att förutse.', rating: 8 },
  { name: 'Emil Forsberg', club: 'New York Red Bulls', position: 'Anfallsmittfältare', age: 34, caps: 107, season: 'MLS-karriären håller honom fräsch och motiverad — fortfarande en av landslaget mest kreativa spelare.', role: 'Erfarne kuggen som binder ihop Gyökeres och mittfältet. Spelsinne och förmåga att dra in spelet från höger.', keyStrength: 'VM-erfarenhet, spelsinne och förmågan att avgöra från set-piece-situationer.', rating: 7 },
  { name: 'Anthony Elanga', club: 'Nottingham Forest', position: 'Vänsterytter', age: 23, caps: 18, season: 'En av Premier Leagues bästa individuella säsonger med Nottingham Forest — snabb, direkt och klinisk. Hans energi på kanten tvingar fram defensiva misstag.', role: 'Vänsterytterspetsens dynamik och extra hastighet i kontrings-lägen.', keyStrength: 'Explosiv sprintkapacitet och direkthet som gör honom till en mardröm för backs.', rating: 7 },
  { name: 'Robin Olsen', club: 'Feyenoord', position: 'Målvakt', age: 36, caps: 65, season: 'En solid säsong i Eredivisie. Olsen är fortfarande en av Europas stabilaste målvakter med ett fotspel som passar Potters upplägg.', role: 'Förstaval i mål och lagets siste försvarare. Hans kommunikation med backlinjen är central.', keyStrength: 'Exceptionellt bra i en-mot-en-situationer och med lugn under press som smittar av sig.', rating: 7 },
  { name: 'Isak Hien', club: 'Atalanta', position: 'Mittback', age: 25, caps: 25, season: 'Etablerat sig som en av Serie A:s pålitligaste centralbackar. Teknisk säkerhet och förmågan att spela ut press bakifrån matchar Potters krav perfekt.', role: 'Tredjeman i defensiven med flexibilitet för trepacks vid behov.', keyStrength: 'Snabb i täckningarna med ett passningstänkande som aktiverar pressingsystemet.', rating: 7 },
]

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
  { id: 'grupper', label: '🏟 Grupper' },
  { id: 'stjärnor', label: '⭐ Stjärnor' },
  { id: 'talanger', label: '🚀 Talanger' },
  { id: 'sverige', label: '🇸🇪 Sverige' },
  { id: 'favoriter', label: '📊 Favoriter' },
  { id: 'mörkhästar', label: '💥 Skrällchanser' },
  { id: 'fakta', label: '💡 Fakta' },
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
            <div>
              <h1 className="font-display font-black text-3xl uppercase tracking-wide text-white">VM 2026 — Guiden</h1>
              <p className="text-white/40 text-sm mt-1">
                11 juni – 19 juli 2026 · USA, Kanada &amp; Mexiko · 48 lag · 104 matcher
              </p>
            </div>
          </div>

          {/* Tournament facts strip */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Lag', value: '48' },
              { label: 'Grupper', value: '12 (A–L)' },
              { label: 'Matcher', value: '104' },
              { label: 'Final', value: '19 jul · MetLife' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface-800 rounded-lg px-3 py-2.5 text-center">
                <div className="text-lg font-bold text-pitch-400">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
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

// ── Tab: Groups ────────────────────────────────────────────────────────────────

function GroupsTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Gruppspelet</h2>
        <p className="text-gray-400 text-sm">
          12 grupper (A–L) med 4 lag vardera. De 2 bästa plus 8 bästa tredjeplacerade går vidare.
          <br /><span className="text-pitch-400">W</span> = förutspådd etta · <span className="text-yellow-400">Q</span> = vidare · <span className="text-gray-500">E</span> = åker hem
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {GROUPS.map(g => (
          <div
            key={g.letter}
            className={`card ${g.letter === 'F' ? 'border-pitch-700 bg-pitch-900/10' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base">
                Grupp {g.letter}
                {g.letter === 'F' && <span className="ml-2 badge-green text-xs">Sverige</span>}
              </h3>
              <span className="text-xs text-gray-500">🔥 {g.hotMatch}</span>
            </div>

            <div className="space-y-1.5 mb-3">
              {g.teams.map(team => (
                <div key={team.name} className="flex items-center gap-2">
                  <span className="text-lg w-7">{team.flag}</span>
                  <span className={`flex-1 text-sm font-medium ${
                    team.name === 'Sverige' ? 'text-pitch-300' : 'text-gray-200'
                  }`}>{team.name}</span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    team.prediction === 'W' ? 'text-pitch-400 bg-pitch-900/40' :
                    team.prediction === 'Q' ? 'text-yellow-400 bg-yellow-900/30' :
                    'text-gray-600 bg-surface-700'
                  }`}>{team.prediction}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 leading-relaxed border-t border-surface-700 pt-3">
              {g.analysis}
            </p>
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
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">{title}</h2>
        <p className="text-gray-400 text-sm">{subtitle}</p>
      </div>

      <div className="space-y-3">
        {players.map(p => (
          <div
            key={p.name}
            className="card cursor-pointer hover:border-surface-500 transition-colors"
            onClick={() => setExpanded(expanded === p.name ? null : p.name)}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl flex-shrink-0">{p.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-100">{p.name}</span>
                  <span className="badge-gray text-xs">{p.position}</span>
                  <span className="text-xs text-gray-500">{p.country}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{p.club} · {p.age} år</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xl font-bold text-pitch-400">{p.rating}</div>
                <div className="text-xs text-gray-600">/ 10</div>
              </div>
            </div>

            {/* Stat badge */}
            <div className="mt-2 flex items-center gap-2">
              <span className="badge-green text-xs">{p.stat}</span>
              <span className="text-xs text-gray-500">{p.statLabel}</span>
            </div>

            {/* Expanded detail */}
            {expanded === p.name && (
              <div className="mt-4 pt-4 border-t border-surface-700 space-y-3">
                <p className="text-sm text-gray-300 leading-relaxed">{p.why}</p>
                <div className="bg-surface-700/50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-400 mb-1">Spelstil</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{p.style}</p>
                </div>
              </div>
            )}

            {expanded !== p.name && (
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">{p.why}</p>
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
    <div className="space-y-6">
      {/* Hero */}
      <div className="card border-pitch-700 bg-pitch-900/20">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🇸🇪</span>
          <div>
            <h2 className="text-xl font-bold text-pitch-300">Sverige i VM 2026</h2>
            <p className="text-sm text-gray-400">Grupp F · Coach: Graham Potter</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          Blågult är tillbaka. Efter åtta långa år sedan 2018 i Ryssland kliver Sverige in i VM 2026
          med en generation som vet vad den vill. Graham Potter har byggt ett lag runt Viktor Gyökeres —
          en anfallare i världsklass — och med den hungern är detta inte ett lag som kommer för att
          åka hem tidigt.
        </p>

        {/* Group prediction */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { flag: '🇳🇱', opp: 'Nederländerna', res: '1–2 Förlust', note: 'Svår match' },
            { flag: '🇯🇵', opp: 'Japan', res: '2–1 Vinst', note: 'Avgörande' },
            { flag: '🇹🇳', opp: 'Tunisien', res: '1–0 Vinst', note: 'Måste vinna' },
          ].map(({ flag, opp, res, note }) => (
            <div key={opp} className="bg-surface-700 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">{flag}</div>
              <div className="text-xs text-gray-400 mb-1">{opp}</div>
              <div className="text-xs font-bold text-gray-200">{res}</div>
              <div className="text-xs text-gray-500 mt-0.5">{note}</div>
            </div>
          ))}
        </div>

        {/* Advance probability */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Chans att gå vidare från grupp</span>
            <span className="font-bold text-pitch-400">65%</span>
          </div>
          <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
            <div className="h-full bg-pitch-600 rounded-full" style={{ width: '65%' }} />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <div className="card py-3 flex-1 text-center bg-surface-700/50 border-0">
            <div className="text-sm font-bold text-pitch-400">Åttondelsfinal</div>
            <div className="text-xs text-gray-500">Max-finish-prognos</div>
          </div>
          <div className="card py-3 flex-1 text-center bg-yellow-900/20 border-yellow-800">
            <div className="text-sm font-bold text-yellow-300">29 juni</div>
            <div className="text-xs text-gray-500">Sverige i Houston</div>
          </div>
        </div>
      </div>

      {/* Bold prediction */}
      <div className="card border-yellow-800 bg-yellow-900/10">
        <p className="text-xs font-semibold text-yellow-400 mb-1 uppercase tracking-wider">Djärv spaning</p>
        <p className="text-sm text-yellow-100 leading-relaxed italic">
          "Sverige slår Brasilien i åttondelsfinalen på straffar och Gyökeres koras till matchens
          bäste spelare — Blågult skriver historia i Houston."
        </p>
      </div>

      {/* Swedish squad */}
      <div>
        <h3 className="text-lg font-bold mb-4">Truppen</h3>
        <div className="space-y-3">
          {SWEDEN_PLAYERS.map(p => (
            <div
              key={p.name}
              className="card cursor-pointer hover:border-surface-500 transition-colors"
              onClick={() => setExpandedPlayer(expandedPlayer === p.name ? null : p.name)}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-100">{p.name}</span>
                    <span className="badge-gray text-xs">{p.position}</span>
                    <span className="text-xs text-gray-500">{p.caps} A-landslagsmatcher</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{p.club} · {p.age} år</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-pitch-400">{p.rating}</div>
                  <div className="text-xs text-gray-600">/ 10</div>
                </div>
              </div>

              {expandedPlayer === p.name && (
                <div className="mt-4 pt-4 border-t border-surface-700 space-y-3">
                  <p className="text-sm text-gray-300 leading-relaxed">{p.season}</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="bg-surface-700/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-400 mb-1">Roll i laget</p>
                      <p className="text-xs text-gray-300 leading-relaxed">{p.role}</p>
                    </div>
                    <div className="bg-surface-700/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-400 mb-1">Styrka</p>
                      <p className="text-xs text-gray-300 leading-relaxed">{p.keyStrength}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Tab: Favorites ─────────────────────────────────────────────────────────────

function FavoritesTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Turneringsfavoriter</h2>
        <p className="text-gray-400 text-sm">Oddsbaserade vinstchanser för de starkaste lagen.</p>
      </div>

      <div className="space-y-3 mb-8">
        {FAVORITES.map((f, i) => (
          <div key={f.country} className="flex items-center gap-4">
            <div className="w-6 text-sm text-gray-600 text-right">{i + 1}</div>
            <span className="text-2xl">{f.flag}</span>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm text-gray-200">{f.country}</span>
                <span className="text-sm font-bold text-pitch-400">{f.pct}%</span>
              </div>
              <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    i === 0 ? 'bg-pitch-500' :
                    i === 1 ? 'bg-pitch-600' :
                    i === 2 ? 'bg-pitch-700' : 'bg-surface-500'
                  }`}
                  style={{ width: `${(f.pct / 19) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Final prediction */}
      <div className="card border-pitch-700 bg-pitch-900/15 space-y-4">
        <h3 className="font-bold text-pitch-300">🏆 Vår finaltipp</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-4xl mb-2">🇫🇷</div>
            <div className="font-bold text-yellow-300">Frankrike</div>
            <div className="text-xs text-gray-500">Mästare</div>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🇧🇷</div>
            <div className="font-bold text-gray-300">Brasilien</div>
            <div className="text-xs text-gray-500">Runners-up</div>
          </div>
        </div>

        <div className="bg-surface-700/50 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-gray-400">Motivering</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Frankrike är det enda laget med världsklass på varje position och en anfallare i absolut prime.
            Mbappé, Dembélé, Griezmann up front — Zaïre-Emery och Tchouaméni i mitten — Saliba och
            Upamecano bak. Det finns inget svar på detta lag.
          </p>
          <div className="pt-2 border-t border-surface-600">
            <p className="text-xs text-gray-400 font-semibold">Skyttekung</p>
            <p className="text-sm text-pitch-300 font-bold">Kylian Mbappé (Frankrike) — 9 mål</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Dark Horses ───────────────────────────────────────────────────────────

function DarkHorsesTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Skrällchanser</h2>
        <p className="text-gray-400 text-sm">Lag som kan gå längre än de flesta tror.</p>
      </div>

      <div className="space-y-4">
        {DARK_HORSES.map(d => (
          <div key={d.country} className="card">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{d.flag}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-100">{d.country}</span>
                  <span className="badge-yellow text-xs">Max: {d.maxFinish}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Nyckelspelare: {d.keyPlayer}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-yellow-400">{d.strength}/10</div>
                <div className="text-xs text-gray-600">styrka</div>
              </div>
            </div>

            {/* Strength bar */}
            <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-yellow-600 rounded-full"
                style={{ width: `${(d.strength / 10) * 100}%` }}
              />
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">{d.why}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab: Facts ─────────────────────────────────────────────────────────────────

function FactsTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">VM-fakta</h2>
        <p className="text-gray-400 text-sm">25 saker du bör veta inför VM 2026.</p>
      </div>

      <div className="space-y-2">
        {FACTS.map((fact, i) => (
          <div key={i} className="card py-3 flex gap-3">
            <span className="text-pitch-600 font-bold text-sm w-5 flex-shrink-0 text-right">{i + 1}</span>
            <p className="text-sm text-gray-300 leading-relaxed">{fact}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
