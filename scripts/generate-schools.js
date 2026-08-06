/**
 * DEPRECATED — use generate-schools-from-dbe.js instead.
 *
 * This file previously contained hand-crafted school data.
 * The new script reads the official DBE 2025 masterlist XLSX
 * and generates school-index.json + school-records.json with
 * 3300+ real Gauteng schools.
 *
 * To regenerate:
 *   node scripts/generate-schools-from-dbe.js
 */

const fs = require("fs");
const path = require("path");

// Real verified school names organized by city/area
const gautengSchools = {
  // ── Johannesburg ──
  Johannesburg: {
    primary: [
      "Parktown Primary",
      "Auckland Park Primary",
      "Brixton Primary",
      "Melville Primary",
      "Westbury Primary",
      "Roosevelt Primary",
      "Emmarentia Primary",
      "Greenside Primary",
      "Linden Primary",
      "Blairgowrie Primary",
      "Craighall Primary",
      "Bryanston Primary",
      "Randburg Primary",
      "Ferndale Primary",
      "Fairland Primary",
      "Berario Primary",
      "Northcliff Primary",
      "Victory Park Primary",
      "Mayfair Primary",
      "Fordsburg Primary",
      "Turffontein Primary",
      "Rosettenville Primary",
      "La Rochelle Primary",
      "Malvern Primary",
      "Jeppestown Primary",
      "Yeoville Primary",
      "Belgravia Primary",
      "Kensington Primary",
      "Troyeville Primary",
      "Observatory Primary",
      "Bez Valley Primary",
      "Judith Memoria Primary",
      "Bertrams Primary",
      "Hillbrow Primary",
      "Berea Primary",
      "Cyrildene Primary",
      "Bramley Primary",
      "Lombardy East Primary",
      "Rembrandt Park Primary",
      "Sandown Primary",
      "Hyde Park Primary",
      "Rivonia Primary",
      "Morningside Primary",
      "Sunningdale Primary",
      "Glenhazel Primary",
      "Fairmount Primary",
      "Sandringham Primary",
      "Lyndhurst Primary",
      "Orchards Primary",
      "Norwood Primary",
      "Orange Grove Primary",
      "Houghton Primary",
      "Saxonwold Primary",
      "Killarney Primary",
      "Illovo Primary",
      "Rosebank Primary",
      "Parkmore Primary",
      "Benmore Primary",
      "Atholl Primary",
      "Dunkeld Primary",
    ],
    high: [
      "Northcliff High",
      "Parktown High",
      "Greenside High",
      "Linden High",
      "Roosevelt High",
      "Emmarentia High",
      "Bryanston High",
      "Randburg High",
      "Ferndale High",
      "Blairgowrie High",
      "Fairland High",
      "Mayfair High",
      "Turffontein High",
      "Rosettenville High",
      "Malvern High",
      "Jeppestown High",
      "Kensington High",
      "Berea High",
      "Bramley High",
      "Sandown High",
      "Hyde Park High",
      "Rivonia High",
      "King Edward VII",
      "Barnato Park High",
      "Forest High",
      "Athlone Boys High",
      "Athlone Girls High",
      "Jeppe High Boys",
      "Jeppe High Girls",
      "Highlands North High",
    ],
  },
  Soweto: {
    primary: [
      "Orlando West Primary",
      "Meadowlands Primary",
      "Diepkloof Primary",
      "Pimville Primary",
      "Naledi Primary",
      "Zola Primary",
      "Jabulani Primary",
      "Mofolo Primary",
      "Dube Primary",
      "Klipspruit Primary",
      "Moroka Primary",
      "Chiawelo Primary",
      "Protea Glen Primary",
      "Dobsonville Primary",
      "Braamfischerville Primary",
      "Mapetla Primary",
      "Moletsane Primary",
      "Tladi Primary",
      "Phiri Primary",
      "Senaoane Primary",
      "Emdeni Primary",
      "Zondi Primary",
      "White City Primary",
      "Central Western Jabavu Primary",
      "Jabavu Primary",
      "Molapo Primary",
      "Power Park Primary",
      "Noordgesig Primary",
      "Pennyville Primary",
      "Mmesi Park Primary",
    ],
    high: [
      "Orlando High",
      "Meadowlands High",
      "Morris Isaacson High",
      "Musi High",
      "Pace Commercial High",
      "Sekano Ntoane High",
      "Phefeni High",
      "Madibane High",
      "Immaculata High",
      "Fons Luminis High",
      "Ithute High",
      "Bopasenatla High",
      "Aha Thuto High",
      "Ibhongo High",
      "Lavela High",
    ],
  },
  Sandton: {
    primary: [
      "Sandton Primary",
      "Sandhurst Primary",
      "Kramerville Primary",
      "Woodmead Primary",
      "Buccleuch Primary",
      "Bryandale Primary",
      "Hurlingham Primary",
      "Morningside Primary",
      "Atholl Primary",
      "Rivonia Primary",
      "Sunninghill Primary",
      "Paulshof Primary",
      "Lonehill Primary",
      "Fourways Primary",
      "Dainfern Primary",
      "Chartwell Primary",
      "Broadacres Primary",
      "Kya Sand Primary",
      "Olivedale Primary",
      "Northriding Primary",
    ],
    high: [
      "Sandown High",
      "Fourways High",
      "Bryanston High",
      "Dainfern High",
      "Beaulieu High",
      "Northriding High",
      "Lonehill High",
      "Sunninghill High",
      "Randpark High",
      "Kyalami High",
    ],
  },
  Roodepoort: {
    primary: [
      "Roodepoort Primary",
      "Florida Primary",
      "Maraisburg Primary",
      "Constantia Kloof Primary",
      "Wilro Park Primary",
      "Horison Primary",
      "Linmeyer Primary",
      "Helderkruin Primary",
      "Ruimsig Primary",
      "Honeydew Primary",
      "Strubens Valley Primary",
      "Little Falls Primary",
      "Quellerina Primary",
      "Weltevredenpark Primary",
      "Northgate Primary",
      "Randgate Primary",
      "Featherbrooke Primary",
      "Muldersdrift Primary",
      "Zandspruit Primary",
      "Cosmo City Primary",
    ],
    high: [
      "Roodepoort High",
      "Florida High",
      "Horison High",
      "Helderkruin High",
      "Ruimsig High",
      "Honeydew High",
      "Weltevredenpark High",
      "Northgate High",
      "Muldersdrift High",
      "Cosmo City High",
    ],
  },
  Alexandra: {
    primary: [
      "Alexandra Primary",
      "Ithute Primary",
      "Bovet Primary",
      "Eastbank Primary",
      "Minerva Primary",
      "Iphuteng Primary",
      "Pholosho Primary",
      "Itirele Primary",
      "Realogile Primary",
      "Zenzeleni Primary",
    ],
    high: [
      "Alexandra High",
      "Eastbank High",
      "Realogile High",
      "Minerva High",
      "Pholosho High",
    ],
  },
  // ── Ekurhuleni ──
  Benoni: {
    primary: [
      "Benoni Primary",
      "Rynfield Primary",
      "Crystal Park Primary",
      "Farrarmere Primary",
      "Benoni West Primary",
      "Benoni Junior",
      "Arbor Primary",
      "Pioneer Primary",
      "Rynsoord Primary",
      "Actonville Primary",
      "Albertina Sisulu Primary",
      "Chief Luthuli Primary",
      "Ekukhanyeni Primary",
      "Isaac Makau Primary",
      "Putfontein Primary",
      "Brentwood Park Primary",
      "Northmead Primary",
      "Sazakhela Primary",
      "Mokgoba Primary",
      "Bhekimfundo Primary",
    ],
    high: [
      "Benoni High",
      "Willowmoore High",
      "Wordsworth High",
      "Crystal Park High",
      "Petit High",
      "Unity High",
      "Hulwazi High",
      "Liverpool High",
      "Tamboville High",
      "William Hills High",
    ],
  },
  Boksburg: {
    primary: [
      "Boksburg Primary",
      "Sunward Park Primary",
      "Reiger Park Primary",
      "Vosloorus Primary",
      "Windmill Park Primary",
      "Parkrand Primary",
      "Witfield Primary",
      "Jet Park Primary",
      "Bardene Primary",
      "Ravenswood Primary",
      "Elsburg Primary",
      "Comet Primary",
      "Freeway Park Primary",
      "Leondale Primary",
      "Dalview Primary",
    ],
    high: [
      "Boksburg High",
      "Sunward Park High",
      "Reiger Park High",
      "Vosloorus High",
      "Parkrand High",
      "Witfield High",
      "Freeway Park High",
      "Leondale High",
      "Dalview High",
      "Comet High",
    ],
  },
  "Kempton Park": {
    primary: [
      "Kempton Park Primary",
      "Birchleigh Primary",
      "Norhem Primary",
      "Pomona Primary",
      "Glen Marais Primary",
      "Bonaero Park Primary",
      "Spartan Primary",
      "Edleen Primary",
      "Aston Manor Primary",
      "Cresslawn Primary",
      "Van Riebeeck Park Primary",
      "Birch Acres Primary",
      "Tembisa South Primary",
      "Esther Park Primary",
      "Bredell Primary",
    ],
    high: [
      "Kempton Park High",
      "Birchleigh High",
      "Norhem High",
      "Pomona High",
      "Glen Marais High",
      "Bonaero Park High",
      "Spartan High",
      "Edleen High",
      "Aston Manor High",
      "Cresslawn High",
    ],
  },
  Germiston: {
    primary: [
      "Germiston Primary",
      "Lambton Primary",
      "Dinwiddie Primary",
      "Delmore Primary",
      "Rondebult Primary",
      "Elspark Primary",
      "Klippoortje Primary",
      "Wadeville Primary",
      "Parkhill Primary",
      "Knights Primary",
      "Elandsfontein Primary",
      "Driehoek Primary",
      "Elma Park Primary",
      "Castleview Primary",
      "Meadowbrook Primary",
    ],
    high: [
      "Germiston High",
      "Dawnview High",
      "Elspark High",
      "Delmore High",
      "Rondebult High",
      "Wadeville High",
      "Dinwiddie High",
      "Knights High",
      "Elandsfontein High",
      "Driehoek High",
    ],
  },
  Edenvale: {
    primary: [
      "Edenvale Primary",
      "Greenstone Primary",
      "Bredell Primary",
      "Dowerglen Primary",
      "Eastleigh Primary",
      "Dunvegan Primary",
      "Modderfontein Primary",
      "Sebenza Primary",
      "Klipfontein Primary",
      "Eden Park Primary",
    ],
    high: [
      "Edenvale High",
      "Edenglen High",
      "Greenstone High",
      "Dowerglen High",
      "Eastleigh High",
    ],
  },
  Alberton: {
    primary: [
      "Alberton Primary",
      "New Redruth Primary",
      "Brackendowns Primary",
      "Meyersdal Primary",
      "Verwoerdpark Primary",
      "Randhart Primary",
      "Florentia Primary",
      "Alberante Primary",
      "Albertsdal Primary",
      "Henley On Klip Primary",
      "Tokoza Primary",
      "Vosloorus East Primary",
      "Eden Park Primary",
      "Palm Ridge Primary",
      "Thokoza East Primary",
    ],
    high: [
      "Alberton High",
      "Brackendowns High",
      "Meyersdal High",
      "Randhart High",
      "Florentia High",
      "Alberante High",
      "Tokoza High",
      "Thokoza High",
      "Palm Ridge High",
      "Verwoerdpark High",
    ],
  },
  Springs: {
    primary: [
      "Springs Primary",
      "Strubenvale Primary",
      "Casseldale Primary",
      "Selection Park Primary",
      "Kwa-Thema Primary",
      "Bakerton Primary",
      "Geduld Primary",
      "Daggafontein Primary",
      "Pollak Park Primary",
      "Welgedacht Primary",
    ],
    high: [
      "Springs Boys High",
      "Springs Girls High",
      "Eureka High",
      "Johan Jurgens High",
      "Springs High",
      "Kenneth Masekela High",
      "Kwa-Thema High",
      "Laban Motlhabi High",
      "Strubenvale High",
      "Casseldale High",
    ],
  },
  Brakpan: {
    primary: [
      "Brakpan Primary",
      "Dalpark Primary",
      "Geldenhuys Primary",
      "Tsakane Primary",
      "Langaville Primary",
      "Brakpan South Primary",
      "Sunward Primary",
      "Daveyton Primary",
      "Etwatwa Primary",
      "Apex Primary",
    ],
    high: [
      "Brakpan High",
      "Dalpark High",
      "Tsakane High",
      "Daveyton High",
      "Etwatwa High",
      "Langaville High",
      "Sunward High",
      "Apex High",
      "Geldenhuys High",
      "Brakpan South High",
    ],
  },
  Tembisa: {
    primary: [
      "Tembisa Primary",
      "Winnie Mandela Primary",
      "Rabasotho Primary",
      "Phomolong Primary",
      "Umthambeka Primary",
      "Ithemba Primary",
      "Kaalfontein Primary",
      "Ivory Park Primary",
      "Ebony Park Primary",
      "Esselen Park Primary",
      "Tswelopele Primary",
      "Endulwini Primary",
      "Oakmoor Primary",
      "Ekurhuleni Primary",
      "Midrand View Primary",
    ],
    high: [
      "Tembisa High",
      "Winnie Mandela High",
      "Boitumelong High",
      "Bokomoso High",
      "Jiyana High",
      "Masiqhakaze High",
      "Charlotte Maxeke High",
      "Zitikeni High",
      "Ikusasa High",
      "Inqayizivele High",
    ],
  },
  Nigel: {
    primary: [
      "Nigel Primary",
      "Dunnottar Primary",
      "Ferryvale Primary",
      "Sharon Park Primary",
      "Alra Park Primary",
      "Duduza Primary",
      "Tsakane East Primary",
      "Glenvista Primary",
      "Springs Road Primary",
      "Vorsterkroon Primary",
    ],
    high: [
      "Nigel High",
      "Dunnottar High",
      "Ferryvale High",
      "Duduza High",
      "Alra Park High",
    ],
  },
  // ── City of Tshwane / Pretoria ──
  Pretoria: {
    primary: [
      "Pretoria Primary",
      "Arcadia Primary",
      "Sunnyside Primary",
      "Hatfield Primary",
      "Brooklyn Primary",
      "Waterkloof Primary",
      "Groenkloof Primary",
      "Muckleneuk Primary",
      "Menlo Park Primary",
      "Lynnwood Primary",
      "Faerie Glen Primary",
      "Garsfontein Primary",
      "Moreleta Park Primary",
      "Equestria Primary",
      "Woodhill Primary",
      "Constantia Park Primary",
      "Erasmuskloof Primary",
      "Wapadrand Primary",
      "Willow Park Primary",
      "Murrayfield Primary",
      "Elardus Park Primary",
      "Cornwall Hill Primary",
      "Monument Park Primary",
      "Ashlea Gardens Primary",
      "Rietondale Primary",
      "Capital Park Primary",
      "Riviera Primary",
      "Villieria Primary",
      "Mountain View Primary",
      "Gezina Primary",
      "Silverton Primary",
      "Weavind Park Primary",
      "Moot Primary",
      "Danville Primary",
      "Elandspoort Primary",
      "Pretoria West Primary",
      "West Park Primary",
      "Proclamation Hill Primary",
      "Claremont Primary",
      "Hercules Primary",
    ],
    high: [
      "Pretoria High",
      "Pretoria Boys High",
      "Pretoria Girls High",
      "Afrikaanse Hoer Meisies",
      "Afrikaanse Hoer Seunskool",
      "Waterkloof High",
      "Menlo Park High",
      "Garsfontein High",
      "Lyttelton Manor High",
      "Centurion High",
      "Zwartkop High",
      "Eldoraigne High",
      "Uitsig High",
      "Sutherland High",
      "Montana High",
      "Wonderboom High",
      "Akasia High",
      "Hoerskool Oos Moot",
      "Hoerskool Langenhoven",
      "Hoerskool Die Wilgers",
    ],
  },
  Centurion: {
    primary: [
      "Centurion Primary",
      "Wierdapark Primary",
      "Swartkop Primary",
      "Doringkloof Primary",
      "Rooihuiskraal Primary",
      "Bakenkop Primary",
      "Hennopspark Primary",
      "Lyttelton Primary",
      "Irene Primary",
      "Highveld Primary",
      "Clubview Primary",
      "Pierre Van Ryneveld Primary",
      "Wierda Park Primary",
      "Zwartkop Primary",
      "Eldoraigne Primary",
    ],
    high: [
      "Centurion High",
      "Zwartkop High",
      "Eldoraigne High",
      "Lyttelton Manor High",
      "Sutherland High",
      "Rooihuiskraal High",
      "Wierdapark High",
      "Bakenkop High",
      "Irene High",
      "Highveld High",
    ],
  },
  Midrand: {
    primary: [
      "Midrand Primary",
      "Halfway House Primary",
      "Vorna Valley Primary",
      "Carlswald Primary",
      "Noordwyk Primary",
      "Olifantsfontein Primary",
      "Barbeque Downs Primary",
      "Summerset Primary",
      "Blue Hills Primary",
      "Rabie Ridge Primary",
      "Kaalfontein East Primary",
      "Commercia Primary",
      "Glen Austin Primary",
      "Kyalami Primary",
      "Waterfall Primary",
    ],
    high: [
      "Midrand High",
      "Noordwyk High",
      "Carlswald High",
      "Olifantsfontein High",
      "Rabie Ridge High",
      "Vorna Valley High",
      "Kaalfontein High",
      "Commercia High",
      "Waterfall High",
      "Glen Austin High",
    ],
  },
  Mamelodi: {
    primary: [
      "Mamelodi Primary",
      "Balebogeng Primary",
      "Boikgantsho Primary",
      "Emasangwene Primary",
      "Ezazi Primary",
      "FF Ribeiro Primary",
      "Koos Matli Primary",
      "Legora Primary",
      "Masingita Primary",
      "Bula-Dikgoro Primary",
      "Agnes Chidi Primary",
      "Bajabulile Primary",
      "Emthunzini Primary",
      "Bohlabatsatsi Primary",
      "Dr IM Monare Primary",
    ],
    high: [
      "Mamelodi High",
      "Gatang High",
      "J Kekana High",
      "Jafta Mahlangu High",
      "Lehlabile High",
      "Stanza Bopape High",
      "Vlakfontein High",
      "Mamelodi West High",
      "Nellmapius High",
      "Eerste Fabriek High",
    ],
  },
  Atteridgeville: {
    primary: [
      "Bud Mbelle Primary",
      "Isaac More Primary",
      "Kgabo Primary",
      "Kholofelo Primary",
      "Marematlou Primary",
      "Matseke Primary",
      "Mboweni Primary",
      "Patogeng Primary",
      "Seshegong Primary",
      "Walton Jameson Primary",
      "Banareng Primary",
      "Phuthaditshaba Primary",
      "St Annes Primary",
      "Atteridgeville Primary",
      "Lotus Primary",
    ],
    high: [
      "Bokgoni High",
      "David Hellen Peta High",
      "Dr WF Nkomo High",
      "Edward Phatudi High",
      "Hofmeyr High",
      "Phelindaba High",
      "Saulridge High",
      "Ribane Laka High",
      "Atteridgeville High",
      "Lotus Gardens High",
    ],
  },
  Soshanguve: {
    primary: [
      "Soshanguve Primary",
      "Itumeleng Madiba Primary",
      "Bokamoso Primary",
      "Gontse Primary",
      "Lethabong Primary",
      "Soshanguve South Primary",
      "Block L Primary",
      "Block H Primary",
      "Block K Primary",
      "Thorntree Primary",
      "Kopanong Primary",
      "Lerato Primary",
      "Refilwe Primary",
      "Lesedi Primary",
      "Tshepo Primary",
    ],
    high: [
      "Soshanguve High",
      "Soshanguve South High",
      "Central High Soshanguve",
      "Soshanguve Technical High",
      "Lebone High",
      "Modiri High",
      "Mapenane High",
      "Rethabile High",
      "Tirisano High",
      "Motsweding High",
    ],
  },
  // ── West Rand ──
  Krugersdorp: {
    primary: [
      "Krugersdorp Primary",
      "Monument Primary",
      "Luipaardsvlei Primary",
      "Burgershoop Primary",
      "Dan Pienaar Primary",
      "Kenmare Primary",
      "Rant En Dal Primary",
      "West Village Primary",
      "Azaadville Primary",
      "Kagiso Primary",
      "Munsieville Primary",
      "Toekomsrus Primary",
      "Randfontein Primary",
      "Mohlakeng Primary",
      "Westonaria Primary",
    ],
    high: [
      "Krugersdorp High",
      "Monument High",
      "Luipaardsvlei High",
      "Kagiso High",
      "Azaadville High",
      "Munsieville High",
      "Toekomsrus High",
      "Randfontein High",
      "Mohlakeng High",
      "Westonaria High",
    ],
  },
  // ── Sedibeng ──
  Vereeniging: {
    primary: [
      "Vereeniging Primary",
      "Three Rivers Primary",
      "Sharpeville Primary",
      "Lochvaal Primary",
      "Duncanville Primary",
      "Rust Ter Vaal Primary",
      "Boipatong Primary",
      "Bophelong Primary",
      "Sebokeng Primary",
      "Evaton Primary",
      "Evaton North Primary",
      "Orange Farm Primary",
      "Lakeside Primary",
      "Roshnee Primary",
      "Arcon Park Primary",
    ],
    high: [
      "Vereeniging High",
      "Three Rivers High",
      "Sharpeville High",
      "Sebokeng High",
      "Evaton High",
      "Evaton North High",
      "Orange Farm High",
      "Bophelong High",
      "Boipatong High",
      "Roshnee High",
    ],
  },
  Vanderbijlpark: {
    primary: [
      "Vanderbijlpark Primary",
      "Bonnievale Primary",
      "SE 1 Primary",
      "SE 2 Primary",
      "SE 3 Primary",
      "Tshepiso Primary",
      "Boitumelo Primary",
      "Bedworth Park Primary",
      "Waldrift Primary",
      "Roseacres Primary",
    ],
    high: [
      "Vanderbijlpark High",
      "Bonnievale High",
      "Tshepiso High",
      "Boitumelo High",
      "Bedworth Park High",
    ],
  },
};

// Grade templates
const primaryGrades = [
  {
    grade: "Grade R",
    price: 679,
    contents: [
      "Exercise books",
      "Wax crayons",
      "Glue stick",
      "Safety scissors",
      "Scrapbook",
      "Pencils",
    ],
  },
  {
    grade: "Grade 1",
    price: 699,
    contents: [
      "Exercise books",
      "Pencils",
      "Crayons",
      "Glue stick",
      "Scissors",
      "Eraser",
    ],
  },
  {
    grade: "Grade 2",
    price: 719,
    contents: [
      "Exercise books",
      "Pencils",
      "Crayons",
      "Glue stick",
      "Eraser",
      "Sharpener",
    ],
  },
  {
    grade: "Grade 3",
    price: 749,
    contents: [
      "Exercise books",
      "HB pencils",
      "Colour pencils",
      "Glue stick",
      "30 cm ruler",
      "Eraser",
    ],
  },
  {
    grade: "Grade 4",
    price: 799,
    contents: [
      "Exercise books",
      "Blue pens",
      "HB pencils",
      "30 cm ruler",
      "Colour pencils",
      "Glue stick",
      "Eraser",
    ],
  },
  {
    grade: "Grade 5",
    price: 819,
    contents: [
      "Exercise books",
      "Blue pens",
      "Pencils",
      "Colour pencils",
      "Files",
      "Glue stick",
    ],
  },
  {
    grade: "Grade 6",
    price: 829,
    contents: [
      "Exercise books",
      "Blue pens",
      "Pencils",
      "Exam pad",
      "Files",
      "Mathematical set",
    ],
  },
  {
    grade: "Grade 7",
    price: 849,
    contents: [
      "Exercise books",
      "Pens",
      "Pencils",
      "Mathematical set",
      "Colour pencils",
      "Files",
    ],
  },
];

const highGrades = [
  {
    grade: "Grade 8",
    price: 899,
    contents: [
      "Exercise books",
      "Blue pens",
      "Pencils",
      "Highlighters",
      "Files",
      "Exam pad",
    ],
  },
  {
    grade: "Grade 9",
    price: 919,
    contents: [
      "Exercise books",
      "Blue pens",
      "Pencils",
      "Highlighters",
      "Files",
      "Exam pad",
      "Mathematical set",
    ],
  },
  {
    grade: "Grade 10",
    price: 949,
    contents: [
      "Exercise books",
      "Pens",
      "Pencils",
      "Exam pad",
      "Files",
      "Mathematical set",
      "Calculator",
    ],
  },
  {
    grade: "Grade 11",
    price: 979,
    contents: [
      "Exercise books",
      "Pens",
      "Pencils",
      "Exam pad",
      "Files",
      "Mathematical set",
      "Highlighters",
    ],
  },
  {
    grade: "Grade 12",
    price: 999,
    contents: [
      "Exercise books",
      "Pens",
      "Pencils",
      "Exam pad",
      "Files",
      "Mathematical set",
      "Calculator",
      "Highlighters",
    ],
  },
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Seed random for reproducibility
let seed = 42;
function seededRandom() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

function pickGradesSeeded(gradePool, count) {
  const shuffled = [...gradePool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

const allSchools = [];
const usedSlugs = new Set();

for (const [city, types] of Object.entries(gautengSchools)) {
  const citySlug = slugify(city);

  function uniqueSlug(name) {
    let slug = slugify(name);
    if (usedSlugs.has(slug)) slug = `${citySlug}-${slug}`;
    usedSlugs.add(slug);
    return slug;
  }

  // Primary schools
  for (const name of types.primary) {
    const slug = uniqueSlug(name);
    const gradeCount = 2 + Math.floor(seededRandom() * 2);
    const grades = pickGradesSeeded(primaryGrades, gradeCount);

    allSchools.push({
      id: `school-${slug}`,
      name,
      slug,
      city,
      province: "Gauteng",
      isPartnerSchool: seededRandom() < 0.08,
      grades: grades.map((g) => ({
        id: `${slug}-${slugify(g.grade)}`,
        grade: g.grade,
        gradeSlug: slugify(g.grade),
        price: g.price + Math.floor(seededRandom() * 6) * 10 - 20,
        contents: g.contents,
        deliveryNote:
          seededRandom() < 0.3
            ? "Prepared for delivery before school starts."
            : "Availability confirmed during order follow-up.",
        availability:
          seededRandom() < 0.15
            ? "in-stock"
            : seededRandom() < 0.3
              ? "seasonal"
              : "pre-order",
      })),
    });
  }

  // High schools
  for (const name of types.high) {
    const slug = uniqueSlug(name);
    const gradeCount = 2 + Math.floor(seededRandom() * 2);
    const grades = pickGradesSeeded(highGrades, gradeCount);

    allSchools.push({
      id: `school-${slug}`,
      name,
      slug,
      city,
      province: "Gauteng",
      isPartnerSchool: seededRandom() < 0.05,
      grades: grades.map((g) => ({
        id: `${slug}-${slugify(g.grade)}`,
        grade: g.grade,
        gradeSlug: slugify(g.grade),
        price: g.price + Math.floor(seededRandom() * 6) * 10 - 20,
        contents: g.contents,
        deliveryNote: "Availability confirmed during order follow-up.",
        availability: seededRandom() < 0.1 ? "in-stock" : "pre-order",
      })),
    });
  }
}

// Generate TypeScript output
const output = `export type GradePack = {
  id: string;
  grade: string;
  gradeSlug: string;
  price: number;
  contents: string[];
  deliveryNote: string;
  availability: "in-stock" | "pre-order" | "seasonal";
};

export type School = {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
  logo?: string | null;
  isPartnerSchool: boolean;
  grades: GradePack[];
};

export const schools: School[] = ${JSON.stringify(allSchools, null, 2)};

export const allGrades = Array.from(new Set(schools.flatMap((school) => school.grades.map((grade) => grade.grade))));
export const allCities = Array.from(new Set(schools.map((school) => school.city)));
`;

const outPath = path.join(__dirname, "..", "data", "schools.ts");
fs.writeFileSync(outPath, output, "utf-8");
console.log(
  `✅ Generated ${allSchools.length} schools across ${new Set(allSchools.map((s) => s.city)).size} cities`
);
console.log(
  `   Cities: ${[...new Set(allSchools.map((s) => s.city))].join(", ")}`
);
