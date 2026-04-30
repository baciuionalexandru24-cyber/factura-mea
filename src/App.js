import React, { useEffect, useMemo, useState } from "react";

/* =====================================================
   DATE FURNIZORI (din furnizori.json)
   ===================================================== */
/* Furnizori — cea mai bună ofertă per furnizor de pe POSF/ANRE
   Zona: Muntenia Sud JT | Client casnic | Actualizat: 29.04.2026
   Valoare unitară = preț total factură per kWh (include toate componentele)
   Preț energie activă (casnic) = extras din valoarea unitară
   Pentru a actualiza: verifică posf.ro/comparator, ia "Valoare unitară factură"
   și recalculează prețul energiei active = valoare_unitară - 0.60 (componentele reglementate)
   ────────────────────────────────────────────────────────────── */
const furnizoriRaw = {
  "Hidroelectrica": { casnic: 0.45, noncasnic: 0.62, abonament: 0, verde: 98.71, oferta: "Viitor Hidro", valoareUnitara: 1.05, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Nova Power & Gas": { casnic: 0.57, noncasnic: 0.70, abonament: 0, verde: 100, oferta: "Casnic preț fix o lună", valoareUnitara: 1.17, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Premier Energy": { casnic: 0.63, noncasnic: 0.75, abonament: 0, verde: 0, oferta: "PE Rezidențial Online Promo", valoareUnitara: 1.23, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Energy Tech Entera": { casnic: 0.63, noncasnic: 0.75, abonament: 0, verde: 100, oferta: "entera SWITCH Casnic", valoareUnitara: 1.23, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Grenerg": { casnic: 0.64, noncasnic: 0.76, abonament: 0, verde: 24.3, oferta: "FIX 24+", valoareUnitara: 1.24, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "E.ON Energie": { casnic: 0.64, noncasnic: 0.76, abonament: 0, verde: 39.93, oferta: "E.ON Duo Assist PRO", valoareUnitara: 1.24, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "PPC Energie (ex Enel)": { casnic: 0.65, noncasnic: 0.77, abonament: 0, verde: 0, oferta: "ppc energie easy", valoareUnitara: 1.25, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "ENGIE România": { casnic: 0.69, noncasnic: 0.81, abonament: 0, verde: 100, oferta: "Ampero Verde Online", valoareUnitara: 1.29, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "MVM Future Energy": { casnic: 0.78, noncasnic: 0.90, abonament: 0, verde: 53.73, oferta: "Oferta EE tip casnic general", valoareUnitara: 1.38, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Energy Core Development": { casnic: 0.82, noncasnic: 0.94, abonament: 0, verde: 0, oferta: "CORE Residential", valoareUnitara: 1.42, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Luxten Lighting": { casnic: 0.83, noncasnic: 0.95, abonament: 0, verde: 100, oferta: "Luxten casnic JT", valoareUnitara: 1.43, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "EM Power": { casnic: 0.85, noncasnic: 0.97, abonament: 0, verde: 52.57, oferta: "Oferta casnic jt 1 an", valoareUnitara: 1.45, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Alive Capital": { casnic: 0.85, noncasnic: 0.97, abonament: 0, verde: 100, oferta: "Rezidențial Energie Verde", valoareUnitara: 1.45, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Electrica Furnizare": { casnic: 0.88, noncasnic: 1.00, abonament: 0, verde: 0, oferta: "Oferta casnici Serviciu Universal", valoareUnitara: 1.48, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "OMV Petrom": { casnic: 0.88, noncasnic: 1.00, abonament: 0, verde: 33.55, oferta: "Oferta serviciu universal", valoareUnitara: 1.48, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Next Energy Partners": { casnic: 0.87, noncasnic: 0.99, abonament: 0, verde: 0, oferta: "Clienți finali casnic concurențial", valoareUnitara: 1.47, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Dacia Energy Solutions": { casnic: 0.93, noncasnic: 1.05, abonament: 0, verde: 43.6, oferta: "Oferta Tip Client Casnic", valoareUnitara: 1.53, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Tinmar Green Energy": { casnic: 0.93, noncasnic: 1.05, abonament: 0, verde: 0, oferta: "Oferta casnic Rețele Electrice JT", valoareUnitara: 1.53, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "M.D.A. Energy": { casnic: 0.93, noncasnic: 1.05, abonament: 0, verde: 0, oferta: "Oferta casnic Rețele Electrice JT", valoareUnitara: 1.53, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Mar-Tin Solar Energy": { casnic: 0.93, noncasnic: 1.05, abonament: 0, verde: 0, oferta: "Oferta casnic Rețele Electrice JT", valoareUnitara: 1.53, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Ingka Investments (IKEA)": { casnic: 0.93, noncasnic: 1.05, abonament: 0, verde: 100, oferta: "Oferta Standard casnici JT", valoareUnitara: 1.53, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Termo Ploiești": { casnic: 0.93, noncasnic: 1.05, abonament: 0, verde: 0, oferta: "Oferta furnizare clienți casnici", valoareUnitara: 1.53, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Lord Energy": { casnic: 0.96, noncasnic: 1.08, abonament: 0, verde: 0, oferta: "Oferta casnic Rețele Electrice JT 2025", valoareUnitara: 1.56, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Photovoltaic Green Project": { casnic: 0.96, noncasnic: 1.08, abonament: 0, verde: 45.65, oferta: "Oferta furnizare energie electrică", valoareUnitara: 1.56, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Solprim": { casnic: 0.92, noncasnic: 1.04, abonament: 0, verde: 0, oferta: "Oferta casnic Rețele Electrice JT", valoareUnitara: 1.52, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "AMV Solar": { casnic: 0.92, noncasnic: 1.04, abonament: 0, verde: 0, oferta: "Oferta casnic Rețele Electrice JT", valoareUnitara: 1.52, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Eye Mall": { casnic: 0.92, noncasnic: 1.04, abonament: 0, verde: 0, oferta: "Oferta casnic Rețele Electrice JT", valoareUnitara: 1.52, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Tinmar Energy": { casnic: 0.92, noncasnic: 1.04, abonament: 0, verde: 0, oferta: "Oferta casnic Rețele Electrice JT", valoareUnitara: 1.52, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Monsson Trading": { casnic: 0.99, noncasnic: 1.11, abonament: 0, verde: 0, oferta: "Oferta-tip furnizare energie electrică", valoareUnitara: 1.59, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Getica 95 COM": { casnic: 0.99, noncasnic: 1.11, abonament: 0, verde: 0, oferta: "Casnic JT Rețele Electrice Muntenia", valoareUnitara: 1.59, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Cotroceni Park": { casnic: 0.99, noncasnic: 1.11, abonament: 0, verde: 39.87, oferta: "Casnic Muntenia Sud", valoareUnitara: 1.59, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "DIGI România": { casnic: 1.00, noncasnic: 1.12, abonament: 0, verde: 20.5, oferta: "CASNIC01", valoareUnitara: 1.60, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Energy Distribution Services": { casnic: 1.05, noncasnic: 1.17, abonament: 0, verde: 0, oferta: "Oferta consumatori casnici", valoareUnitara: 1.65, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Renovatio Trading": { casnic: 1.05, noncasnic: 1.17, abonament: 0, verde: 54.05, oferta: "Oferta Casnic RT JT Muntenia Sud", valoareUnitara: 1.65, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Ges Furnizare": { casnic: 1.05, noncasnic: 1.17, abonament: 0, verde: 0, oferta: "GES Ofertă Rezidențial Rețele România JT", valoareUnitara: 1.65, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Enevo Power": { casnic: 1.05, noncasnic: 1.17, abonament: 0, verde: 0, oferta: "Oferta Casnic Muntenia Sud Feb 2026", valoareUnitara: 1.65, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "MET Romania Energy": { casnic: 1.07, noncasnic: 1.19, abonament: 0, verde: 46.76, oferta: "Met Casnici Rețele Electrice Muntenia", valoareUnitara: 1.67, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Transenergo Microhidro": { casnic: 1.08, noncasnic: 1.20, abonament: 0, verde: 50, oferta: "Oferta furnizare energie electrică", valoareUnitara: 1.68, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Veolia România Soluții Integrate": { casnic: 1.09, noncasnic: 1.21, abonament: 0, verde: 17.96, oferta: "VRSI Casnic Muntenia Sud JT", valoareUnitara: 1.69, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Verbund Wind Power": { casnic: 1.11, noncasnic: 1.23, abonament: 0, verde: 74.77, oferta: "Oferta standard casnic", valoareUnitara: 1.71, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Fundpole Capital": { casnic: 1.12, noncasnic: 1.24, abonament: 0, verde: 17, oferta: "Oferta TIP furnizare energie electrică client casnic", valoareUnitara: 1.72, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Electricom": { casnic: 1.14, noncasnic: 1.26, abonament: 0, verde: 88.04, oferta: "Oferta casnic Muntenia Sud JT", valoareUnitara: 1.74, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "EFT Power / EFT Furnizare": { casnic: 1.17, noncasnic: 1.29, abonament: 0, verde: 24.54, oferta: "Oferta pentru clienții casnici", valoareUnitara: 1.77, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Vimetco Management": { casnic: 1.17, noncasnic: 1.29, abonament: 0, verde: 22.89, oferta: "Oferta consumatori casnici MS JT", valoareUnitara: 1.77, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "ISPH (Inst. Studii Hidroenergetice)": { casnic: 1.23, noncasnic: 1.35, abonament: 0, verde: 80, oferta: "Oferta casnic Muntenia", valoareUnitara: 1.83, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Alro": { casnic: 1.23, noncasnic: 1.35, abonament: 0, verde: 36.73, oferta: "Oferta consumatori casnici JT Muntenia Sud", valoareUnitara: 1.83, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Cooperativa de Energie": { casnic: 1.28, noncasnic: 1.40, abonament: 0, verde: 100, oferta: "Flexi consumator casnic", valoareUnitara: 1.88, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Auchan Renewable Energy": { casnic: 1.31, noncasnic: 1.43, abonament: 0, verde: 46.84, oferta: "Oferta-tip C Muntenia Sud JT", valoareUnitara: 1.91, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Werk Energy": { casnic: 1.32, noncasnic: 1.44, abonament: 0, verde: 58.3, oferta: "Oferta Casnic Muntenia Sud JT", valoareUnitara: 1.92, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Entrex Services": { casnic: 1.34, noncasnic: 1.46, abonament: 0, verde: 41.87, oferta: "Oferta energie electrică Muntenia Sud casnic JT", valoareUnitara: 1.94, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Plenerg": { casnic: 1.35, noncasnic: 1.47, abonament: 0, verde: 54.62, oferta: "PEG027 Oferta-tip PLENERG Muntenia Sud JT", valoareUnitara: 1.95, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
  "Transenergo COM": { casnic: 1.41, noncasnic: 1.53, abonament: 0, verde: 40, oferta: "Oferta furnizare energie electrică client casnic", valoareUnitara: 2.01, sursa: "POSF/ANRE", actualizatLa: "2026-04-29" },
};

function getCurrentPath() {
  return window.location.pathname === "/" ? "/" : window.location.pathname.replace(/\/$/, "");
}

function setMeta(title, description) {
  document.title = title;
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", description);
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const supplierOffers = Object.entries(furnizoriRaw).map(([name, prices]) => ({
  id: slugify(name),
  name,
  offerName: prices.oferta || "",
  prices: {
    household: Number(prices.casnic || 0),
    nonhousehold: Number(prices.noncasnic || prices.casnic || 0),
  },
  subscription: Number(prices.abonament || 0),
  green: Number(prices.verde || 0),
  source: prices.sursa || "estimare internă",
  updatedAt: prices.actualizatLa || "necunoscut",
}));

const distributionZones = [
  { id: "muntenia", name: "Muntenia / București-Ilfov", distributionTariff: 0.3174 },
  { id: "transilvania-nord", name: "Transilvania Nord", distributionTariff: 0.3295 },
  { id: "transilvania-sud", name: "Transilvania Sud", distributionTariff: 0.3180 },
  { id: "moldova", name: "Moldova (Delgaz Grid)", distributionTariff: 0.3390 },
  { id: "oltenia", name: "Oltenia", distributionTariff: 0.3050 },
  { id: "banat", name: "Banat", distributionTariff: 0.3174 },
  { id: "dobrogea", name: "Dobrogea", distributionTariff: 0.3174 },
  { id: "muntenia-nord", name: "Muntenia Nord", distributionTariff: 0.3295 },
];

const regulatedCosts = {
  transportTG: 0.00363,
  transportTL: 0.03645,
  systemServices: 0.0147,
  greenCertificates: 0.0740,
  cogeneration: 0.0136,
  cfd: 0.000144,
  excise: 0.00768,
  vat: 0.21,
  actualizatLa: "2026-04-28",
};

const articles = [
  {
    slug: "cum-reduci-factura-energie-2026",
    title: "Cum să îți reduci factura la energie în 2026 — ghid complet",
    excerpt: "Pași practici pentru a plăti mai puțin pe energie: verifică consumul, compară furnizori, optimizează abonamentul și redu consumul aparatelor mari.",
    readTime: "10 min",
    metaDescription: "Ghid complet 2026 pentru reducerea facturii la energie electrică: verifică consumul, compară oferte, optimizează abonamentul și redu consumul aparatelor mari.",
    intro: "Reducerea facturii la energie nu înseamnă doar să stingi lumina. În 2026, cu prețuri între 0.45 și 0.67 RON/kWh în funcție de furnizor, diferența dintre o ofertă bună și una slabă poate ajunge la 50–100 RON pe lună pentru un consum mediu de apartament. Acest ghid îți arată exact ce poți face, pas cu pas.",
    sections: [
      { heading: "1. Verifică mai întâi consumul în kWh, nu suma în RON", body: "Cel mai frecvent motiv pentru o factură mai mare este consumul crescut, nu prețul. Uită-te pe factură la kWh, nu la RON. Compară consumul cu aceeași lună din anul trecut — variațiile sezoniere sunt normale. Un apartament de 2 camere consumă în medie 200–300 kWh/lună, o casă 400–700 kWh. Dacă ai mult peste aceste valori, cauza este probabil un aparat mare (boiler, aer condiționat, uscător) sau o scurgere de consum (aparat vechi, frigider cu garnitura defectă)." },
      { heading: "2. Compară prețul tău cu ofertele disponibile pe POSF", body: "Platforma Oficială de Schimbare a Furnizorului (posf.ro) și comparatorul ANRE îți arată toate ofertele disponibile în zona ta. În aprilie 2026, prețurile pentru clienți casnici variază de la 0.45 RON/kWh (Hidroelectrica) la 0.67 RON/kWh (PPC/Enel). La un consum de 250 kWh/lună, diferența între cel mai ieftin și cel mai scump furnizor poate fi de 55–70 RON pe lună, adică 660–840 RON pe an. Merită verificat cel puțin o dată pe an." },
      { heading: "3. Analizează abonamentul lunar — poate anula economia", body: "Unele oferte par ieftine la prețul pe kWh dar includ un abonament lunar de 3–5 RON. Pentru un consum mic (sub 150 kWh/lună), abonamentul de 5 RON reprezintă echivalentul a 0.033 RON/kWh în plus. Asta poate transforma o ofertă aparent bună în una mediocră. Calculează întotdeauna costul total: (consum × preț) + abonament + taxe. Furnizorii fără abonament (Hidroelectrica, Electrica Furnizare, Nova Power & Gas) sunt avantajoși mai ales la consumuri mici." },
      { heading: "4. Verifică perioada facturată și tipul facturii", body: "O factură care acoperă 35 de zile în loc de 30 va fi automat mai mare cu ~17%, fără ca prețul să se fi schimbat. Verifică întotdeauna datele de pe factură. De asemenea, dacă factura este estimată (nu pe consum real), totalul poate fi mai mare sau mai mic decât consumul efectiv. Regularizările corectează aceste diferențe — o factură de regularizare mare nu înseamnă neapărat că plătești mai mult, ci că ai plătit mai puțin anterior." },
      { heading: "5. Redu consumul aparatelor mari — impact imediat", body: "Aerul condiționat setat la 18°C consumă cu 30–40% mai mult decât la 24°C. Boilerul electric de 80L consumă 3–5 kWh pe zi — un termostat și programarea pe noapte pot reduce costul cu 20–30%. Uscătorul de rufe consumă de 3–5 ori mai mult decât mașina de spălat. Frigiderul vechi (clasa A sau mai jos) poate consuma 400–500 kWh/an, față de 150–200 kWh/an pentru unul nou clasa A+++. Înlocuirea unui singur aparat vechi poate economisi 100–200 RON pe an." },
      { heading: "6. Transmite indexul lunar și evită estimările", body: "Dacă nu transmiți indexul contorului, furnizorul estimează consumul pe baza istoricului. Această estimare poate fi mai mare decât consumul real, ceea ce înseamnă că plătești mai mult acum și primești o regularizare mai târziu. Transmiterea lunară a indexului (prin aplicația furnizorului, SMS sau telefon) te ajută să plătești exact cât consumi și să ai control real asupra facturii." },
    ],
  },
  {
    slug: "cum-se-calculeaza-factura-energie",
    title: "Cum se calculează factura la energie electrică — toate componentele explicate",
    excerpt: "Explicație completă cu cifre reale: energie activă, distribuție, transport TG și TL, servicii sistem, certificate verzi, cogenerare, CFD, acciză și TVA 21%.",
    readTime: "12 min",
    metaDescription: "Cum se calculează factura la energie electrică în 2026: energie activă, distribuție, transport TG/TL, servicii sistem, certificate verzi, cogenerare, CFD, acciză, TVA 21%.",
    intro: "Factura de energie electrică include mult mai mult decât prețul energiei. Din totalul pe care îl plătești, energia activă (prețul furnizorului) reprezintă doar circa 40–50% din factură. Restul sunt componente reglementate, taxe și TVA. Iată fiecare componentă, cu valorile reale din 2026.",
    sections: [
      { heading: "1. Energia activă — singura componentă comercială", body: "Energia activă este consumul tău în kWh înmulțit cu prețul din contract. Aceasta este singura componentă care diferă între furnizori. În 2026, prețurile variază de la 0.45 RON/kWh (Hidroelectrica) la 0.67 RON/kWh (PPC). Pentru un consum de 118 kWh, energia activă la Hidroelectrica costă 53.10 RON. La PPC, același consum ar costa 79.06 RON — o diferență de 25.96 RON doar pe această componentă." },
      { heading: "2. Distribuția — tarif reglementat pe zone", body: "Distribuția reprezintă costul utilizării rețelei locale de joasă și medie tensiune. Tariful este reglementat de ANRE și variază pe zone: 0.3174 RON/kWh în Muntenia/București, 0.3390 RON/kWh în Moldova (Delgaz Grid), 0.3050 RON/kWh în Oltenia. Nu poți alege operatorul de distribuție — depinde de adresa locului de consum. Pentru 118 kWh în Muntenia, distribuția costă 37.45 RON." },
      { heading: "3. Transportul — TG (introducere) și TL (extragere)", body: "Transportul acoperă utilizarea rețelei naționale de înaltă tensiune și se împarte în două componente: tariful de introducere în rețea (TG) de 0.00363 RON/kWh și tariful de extragere din rețea (TL) de 0.03645 RON/kWh. Pentru 118 kWh, TG costă 0.43 RON iar TL costă 4.30 RON. Aceste tarife sunt stabilite de ANRE și sunt identice în toată țara." },
      { heading: "4. Servicii de sistem — stabilitatea rețelei", body: "Serviciile de sistem susțin funcționarea sigură a sistemului energetic național. Tariful este de 0.0147 RON/kWh, ceea ce înseamnă 1.73 RON pentru un consum de 118 kWh. Această componentă a scăzut semnificativ față de anii anteriori." },
      { heading: "5. Certificate verzi — sprijin pentru energia regenerabilă", body: "Certificatele verzi finanțează producția de energie din surse regenerabile (eolian, solar, biomasă). Tariful este de 0.0740 RON/kWh, adică 8.73 RON pentru 118 kWh. Valoarea se modifică anual prin ordine ANRE." },
      { heading: "6. Cogenerare și CFD — componente mai mici", body: "Contribuția pentru cogenerare de înaltă eficiență este 0.0136 RON/kWh (1.60 RON la 118 kWh). Componenta CFD (Contract for Difference) este nouă și foarte mică: 0.000144 RON/kWh (0.02 RON la 118 kWh). Ambele sunt reglementate de ANRE." },
      { heading: "7. Acciză și TVA — componentele fiscale", body: "Acciza pe energia electrică este 0.00768 RON/kWh (0.91 RON la 118 kWh). TVA-ul de 21% se aplică la suma tuturor componentelor de mai sus. Pentru un consum de 118 kWh la Hidroelectrica în zona Muntenia, TVA-ul este 22.74 RON, iar totalul facturii ajunge la 131.02 RON." },
      { heading: "8. Exemplu complet de calcul — 118 kWh Hidroelectrica Muntenia", body: "Energie activă: 53.10 RON + Distribuție: 37.45 RON + Transport TG: 0.43 RON + Transport TL: 4.30 RON + Servicii sistem: 1.73 RON + Certificate verzi: 8.73 RON + Cogenerare: 1.60 RON + CFD: 0.02 RON + Acciză: 0.91 RON = Subtotal: 108.28 RON + TVA 21%: 22.74 RON = Total: 131.02 RON. Acest calcul corespunde aproape exact cu o factură reală Hidroelectrica din aprilie 2026." },
    ],
  },
  {
    slug: "ce-aparate-consuma-cel-mai-mult-curent",
    title: "Ce aparate consumă cel mai mult curent în casă — cifre reale și sfaturi",
    excerpt: "Aerul condiționat, boilerul, uscătorul, cuptorul și frigiderul: cât consumă fiecare pe lună și cum reduci factura fără investiții mari.",
    readTime: "9 min",
    metaDescription: "Ce aparate consumă cel mai mult curent: aer condiționat, boiler, uscător, cuptor, frigider. Cifre reale de consum lunar și sfaturi practice de reducere.",
    intro: "Într-o locuință tipică, 5–6 aparate mari sunt responsabile pentru 60–80% din consumul de energie. Restul — becuri, televizor, încărcătoare — consumă relativ puțin. Dacă vrei să reduci factura, trebuie să te concentrezi pe consumatorii mari.",
    sections: [
      { heading: "1. Aerul condiționat — cel mai mare consumator vara", body: "Un aparat de aer condiționat de 12.000 BTU consumă între 0.8 și 1.5 kWh pe oră, în funcție de clasa energetică și temperatura setată. La 8 ore de funcționare pe zi, consumul lunar poate ajunge la 200–360 kWh, adică 90–160 RON doar pentru aer condiționat (la 0.45 RON/kWh). Setarea la 24–25°C în loc de 18–20°C poate reduce consumul cu 30–40%. Un aparat inverter clasa A+++ consumă cu 40–50% mai puțin decât unul vechi clasa B." },
      { heading: "2. Boilerul electric — consumă constant, chiar și când nu folosești apă", body: "Un boiler de 80 litri consumă 3–5 kWh pe zi pentru a menține apa caldă, adică 90–150 kWh pe lună (40–70 RON). Pierderea de căldură prin izolație defectuoasă crește consumul. Soluții: setează temperatura la 55–60°C (nu 70–80°C), folosește un timer pentru a încălzi apa doar noaptea sau dimineața, și verifică izolația boilerului. Alternativa ideală pe termen lung este un boiler cu pompă de căldură, care consumă de 3 ori mai puțin." },
      { heading: "3. Cuptorul electric și plita electrică — puteri mari, perioade scurte", body: "Cuptorul electric consumă 1.5–2.5 kWh pe oră de funcționare. Plita electrică (cu rezistență) consumă 1–2 kWh per arzător. La gătit zilnic, consumul poate ajunge la 60–100 kWh/lună (25–45 RON). Plita cu inducție este cu 30–40% mai eficientă decât cea clasică. Folosirea capacului pe oale reduce timpul de gătit cu 20–30%." },
      { heading: "4. Uscătorul de rufe — surpriza din factură", body: "Uscătorul cu rezistență consumă 3–5 kWh per ciclu, adică de 3–5 ori mai mult decât mașina de spălat. La 3–4 cicluri pe săptămână, consumul lunar este 40–80 kWh (18–36 RON). Uscătorul cu pompă de căldură consumă de 2 ori mai puțin. Alternativa gratuită: uscatul natural pe sârmă, cel puțin vara." },
      { heading: "5. Mașina de spălat — programele eco chiar funcționează", body: "Mașina de spălat consumă 0.5–1.5 kWh per ciclu, în funcție de temperatură și program. Programul la 30°C consumă cu 50–60% mai puțin decât cel la 60°C. Încărcarea completă e importantă — o mașină pe jumătate consumă aproape la fel de mult, dar speli de două ori mai des. Consumul lunar tipic: 15–30 kWh (7–14 RON)." },
      { heading: "6. Frigiderul și congelatorul — funcționează non-stop", body: "Frigiderul funcționează 24/7, deci și un consum orar mic se adună. Un frigider vechi (clasa A sau mai jos) consumă 350–500 kWh/an, adică 30–42 kWh/lună (13–19 RON). Unul nou clasa A+++ consumă 100–150 kWh/an. Verifică garniturile, nu bloca ventilatorul cu alimente, setează temperatura la 4–5°C (frigider) și -18°C (congelator), și lasă spațiu în spate pentru ventilație." },
      { heading: "7. Consumatori mici care se adună — standby, becuri, electronice", body: "Televizorul, routerul, consolele, încărcătoarele și becurile consumă individual puțin (5–50W), dar împreună pot ajunge la 30–60 kWh/lună. Aparatele în standby consumă 5–10% din factura totală. Becurile LED consumă de 5–8 ori mai puțin decât cele incandescente. Un bec LED de 10W dă aceeași lumină ca unul incandescent de 60W." },
    ],
  },
  {
    slug: "merita-sa-schimbi-furnizorul-de-energie",
    title: "Merită să schimbi furnizorul de energie în 2026? Ghid complet de analiză",
    excerpt: "Comparație reală între furnizori, ce verifici înainte de schimbare, cât economisești și când nu merită efortul.",
    readTime: "10 min",
    metaDescription: "Merită să schimbi furnizorul de energie în 2026? Comparație reală între furnizori, economii calculate, pași de schimbare și capcane de evitat.",
    intro: "Schimbarea furnizorului de energie este gratuită și se poate face online prin platforma POSF. Dar nu orice schimbare aduce economii reale. Acest ghid îți arată exact când merită, cât poți economisi și ce capcane să eviți.",
    sections: [
      { heading: "1. Cât poți economisi real — calcul cu cifre din 2026", body: "La un consum de 250 kWh/lună, diferența între Hidroelectrica (0.45 RON/kWh) și PPC (0.67 RON/kWh) este de 55 RON/lună doar pe energia activă, adică 660 RON/an. Chiar și între furnizori mai apropiați (Hidroelectrica vs Nova Power 0.499 RON/kWh), diferența este de 12.25 RON/lună, adică 147 RON/an. Aceste diferențe sunt semnificative și justifică schimbarea." },
      { heading: "2. Nu compara doar prețul pe kWh — costul total contează", body: "Un furnizor cu preț de 0.50 RON/kWh și abonament de 5 RON poate fi mai scump decât unul cu 0.52 RON/kWh fără abonament, la consumuri mici. Formula corectă: (consum × preț) + abonament + toate componentele reglementate + TVA. Folosește un calculator de factură (ca cel de pe acest site) pentru comparație realistă." },
      { heading: "3. Verifică durata ofertei și ce se întâmplă la expirare", body: "Multe oferte au preț fix doar 6 sau 12 luni. După expirare, prețul poate reveni la tariful standard, care este adesea mai mare. Verifică în contract: durata ofertei, prețul după expirare, și dacă există penalități de reziliere anticipată. O ofertă bună pe 3 luni urmată de un preț mare pe 9 luni poate fi mai scumpă per total decât o ofertă mediocră pe 12 luni." },
      { heading: "4. Procesul de schimbare — gratuit și online", body: "Schimbarea se face prin platforma POSF (posf.ro) sau direct pe site-ul noului furnizor. Procesul durează de obicei 21 de zile calendaristice. Nu ai întrerupere de curent. Nu plătești nicio taxă. Ai nevoie de: cod NLC/POD (de pe factură), act de identitate, și ultima factură. Furnizorul vechi emite factura finală, iar noul furnizor începe facturarea din ziua schimbării." },
      { heading: "5. Când NU merită să schimbi", body: "Dacă diferența estimată este sub 15–20 RON/lună, efortul administrativ și riscul unei oferte cu condiții ascunse nu se justifică. Dacă ai un contract cu preț fix bun care nu a expirat, schimbarea poate atrage penalități. Dacă furnizorul actual are aplicație bună, facturare corectă și suport decent, o economie mică nu compensează riscul de a ajunge la un furnizor cu servicii slabe." },
      { heading: "6. Calitatea serviciului contează — nu doar prețul", body: "Un furnizor ieftin cu facturare greșită, aplicație nefuncțională sau suport inexistent poate genera mai multe probleme decât economia realizată. Verifică recenziile altor clienți, funcționalitatea aplicației mobile, ușurința transmiterii indexului și timpul de răspuns al suportului clienți. Hidroelectrica, de exemplu, are prețul cel mai mic DAR și un portal online funcțional și aplicația iHidro." },
    ],
  },
  {
    slug: "de-ce-a-crescut-factura-la-energie",
    title: "De ce a crescut factura la energie? 7 cauze frecvente și ce verifici imediat",
    excerpt: "Factura mai mare nu înseamnă neapărat preț mai mare. Verifică consumul, regularizarea, perioada facturată, prețul și abonamentele.",
    readTime: "8 min",
    metaDescription: "De ce a crescut factura la energie electrică? 7 cauze frecvente: consum crescut, regularizare, perioadă mai lungă, preț modificat, abonament, TVA 21%.",
    intro: "Ai primit o factură mai mare decât de obicei și nu înțelegi de ce? Cele mai frecvente cauze nu au legătură cu prețul energiei. Iată ce trebuie să verifici, în ordinea probabilității.",
    sections: [
      { heading: "1. Consumul a crescut — verifică kWh, nu RON", body: "Cea mai frecventă cauză. Uită-te la consumul în kWh, nu la suma totală. Dacă kWh sunt mai mulți, cauza este consumul, nu prețul. Compară cu aceeași lună din anul trecut, nu cu luna precedentă — consumul variază sezonier (iarna crește din cauza iluminatului și a încălzirii electrice, vara din cauza aerului condiționat)." },
      { heading: "2. Factura include o regularizare", body: "Dacă în lunile anterioare furnizorul a estimat consumul și acum a citit contorul real, factura poate include diferența acumulată. O factură de regularizare poate fi de 2–3 ori mai mare decât una normală, fără ca tu să fi consumat mai mult în luna respectivă. Verifică pe factură dacă apare mențiunea 'regularizare' sau 'consum estimat vs. real'." },
      { heading: "3. Perioada facturată este mai lungă", body: "O factură care acoperă 40 de zile în loc de 30 va fi mai mare cu ~33%. Verifică datele de început și sfârșit ale perioadei de facturare. Compară consumul mediu zilnic (kWh total ÷ număr de zile), nu totalul — acesta este singurul mod corect de comparare între perioade diferite." },
      { heading: "4. TVA-ul a crescut la 21%", body: "Din 2025, TVA-ul pe energie electrică a crescut de la 19% la 21%. Pentru o factură cu un subtotal de 108 RON, diferența este de 2.16 RON (22.74 RON TVA la 21% vs. 20.57 RON la 19%). Nu e o diferență uriașă, dar contribuie la totalul mai mare." },
      { heading: "5. Prețul contractual s-a modificat", body: "Oferta ta poate fi expirat. Verifică pe factură prețul pe kWh și compară-l cu contractul. Dacă prețul a crescut de la 0.45 la 0.55 RON/kWh, pentru 250 kWh diferența este de 25 RON/lună. Când oferta expiră, furnizorul aplică de obicei un tarif standard mai mare. Verifică data de valabilitate a ofertei în contract." },
      { heading: "6. Au apărut servicii sau abonamente suplimentare", body: "Unele contracte includ servicii adiționale cu cost lunar: protecție echipamente, asigurare, servicii de urgență. Acestea pot apărea ca linii separate pe factură sau pot fi incluse în abonament. Verifică toate liniile din factură, nu doar energia activă." },
      { heading: "7. Tarifele reglementate s-au modificat", body: "Distribuția, transportul, serviciile de sistem, certificatele verzi și cogenerarea sunt componente reglementate care se modifică periodic prin ordine ANRE. Aceste modificări sunt mici individual, dar împreună pot adăuga 5–10 RON pe lună. Nu poți influența aceste tarife, dar poți verifica dacă sunt aplicate corect." },
    ],
  },
  {
    slug: "cum-citesti-corect-factura-de-energie",
    title: "Cum citești corect o factură de energie electrică — ghid pas cu pas",
    excerpt: "Unde găsești codul NLC, consumul real, prețul pe kWh, perioada facturată, fiecare componentă de cost și totalul de plată.",
    readTime: "9 min",
    metaDescription: "Cum citești factura de energie electrică: cod NLC/POD, consum kWh, preț energie activă, distribuție, transport, taxe, TVA, sold și scadență.",
    intro: "Factura de energie pare complicată, dar dacă știi unde să te uiți, devine simplă. Acest ghid îți arată exact ce înseamnă fiecare element, folosind ca exemplu o factură reală Hidroelectrica din 2026.",
    sections: [
      { heading: "1. Datele tale și codul NLC/POD — identitatea locului de consum", body: "În antetul facturii găsești datele clientului, adresa locului de consum, codul client și codul NLC (Număr Loc Consum) sau POD. Codul POD (de exemplu RO001E103551959) este unic pentru locul tău de consum și este esențial pentru: schimbarea furnizorului, contestații, verificări cu operatorul de distribuție. Notează-l — îl vei folosi des." },
      { heading: "2. Perioada de facturare și tipul citirii", body: "Factura specifică perioada (ex: 28.02.2026 – 27.03.2026 = 28 de zile). Verifică întotdeauna dacă este citire reală sau estimare. Pe factură apare 'autocitire', 'citire reală' sau 'estimat'. Consumul mediu zilnic (kWh ÷ zile) este mai relevant decât totalul — compară acest indicator între luni." },
      { heading: "3. Consumul în kWh — baza facturii", body: "Secțiunea de măsurări arată indexul vechi, indexul nou și diferența (consumul). Pe o factură Hidroelectrica, exemplu: index vechi 49402 (autocitire), index nou 49520 (autocitire), diferență 118 kWh. Dacă nu ai transmis indexul, furnizorul estimează pe baza istoricului. Estimarea poate fi mai mare sau mai mică decât consumul real." },
      { heading: "4. Prețul energiei active și oferta contractuală", body: "Pe factură apare prețul final contractual (ex: 1.11 lei/kWh). Atenție: acest preț include toate componentele, nu doar energia activă! Prețul energiei active pure (ex: 0.45 RON/kWh) apare în detaliile facturii. Verifică dacă se potrivește cu oferta din contract. Dacă a crescut, posibil oferta a expirat." },
      { heading: "5. Detaliile facturii — fiecare componentă de cost", body: "Pagina 2 a facturii listează toate componentele: Energia activă (0.45 RON/kWh), Tarif distribuție (0.3174 RON/kWh), Servicii sistem (0.0147 RON/kWh), Transport TG (0.00363 RON/kWh), Transport TL (0.03645 RON/kWh), Cogenerare (0.0136 RON/kWh), CFD (0.000144 RON/kWh), Certificate verzi (0.0740 RON/kWh), Acciză (0.00768 RON/kWh). Suma lor + TVA 21% = totalul facturii." },
      { heading: "6. Soldul anterior, scadența și modalități de plată", body: "Totalul de plată poate include sume restante din facturi anterioare. Verifică linia 'Sold Cont Contract la data emiterii'. Data scadenței este importantă — întârzierea atrage penalități contractuale. Plata se poate face prin aplicația furnizorului, internet banking (șablon de plată), direct debit, scanare cod de bare sau la Poșta Română." },
    ],
  },
  {
    slug: "cat-consuma-un-aer-conditionat-pe-luna",
    title: "Cât consumă un aer condiționat pe lună în lei — calcul real 2026",
    excerpt: "Consum real per oră, pe zi și pe lună pentru aparate de 9.000, 12.000 și 18.000 BTU, cu costuri calculate la prețurile din 2026.",
    readTime: "7 min",
    metaDescription: "Cât consumă un aer condiționat pe lună în lei în 2026: calcul real pentru 9.000, 12.000 și 18.000 BTU, cu sfaturi de reducere a consumului.",
    intro: "Aerul condiționat este cel mai mare consumator de energie vara. Un aparat folosit 8 ore pe zi poate adăuga 80–200 RON pe lună la factură. Iată cifrele exacte și ce poți face pentru a reduce costul.",
    sections: [
      { heading: "1. Consum per oră în funcție de capacitate", body: "Un aparat de 9.000 BTU (2.6 kW) consumă 0.6–1.0 kWh pe oră. Unul de 12.000 BTU (3.5 kW) consumă 0.8–1.5 kWh pe oră. Unul de 18.000 BTU (5.3 kW) consumă 1.5–2.5 kWh pe oră. Consumul exact depinde de clasa energetică: un inverter A+++ consumă cu 40–50% mai puțin decât un aparat fix clasa B." },
      { heading: "2. Calcul lunar la 8 ore pe zi — 12.000 BTU", body: "Inverter A+++: 0.8 kWh/h × 8 ore × 30 zile = 192 kWh/lună → 86 RON (la 0.45 RON/kWh Hidroelectrica) sau 129 RON (la 0.67 RON/kWh PPC). Aparat vechi clasa B: 1.4 kWh/h × 8 ore × 30 zile = 336 kWh/lună → 151 RON sau 225 RON. Diferența între un aparat eficient și unul vechi: 65–96 RON pe lună." },
      { heading: "3. Temperatura setată — cel mai mare factor de control", body: "Fiecare grad în minus crește consumul cu 6–8%. La 18°C, aparatul funcționează aproape continuu și consumă maxim. La 24–25°C, consumul scade cu 30–40%. La 26–27°C, consumul este minimal dar confortul scade. Recomandarea optimă: 24°C vara, cu ventilator pe tavan pentru o senzație de 2–3°C mai răcoare." },
      { heading: "4. Sfaturi concrete pentru reducerea consumului", body: "Închide ușile și ferestrele când funcționează aerul condiționat. Folosește perdele sau jaluzele pentru a bloca soarele direct. Curăță filtrele la fiecare 2–4 săptămâni — filtrele murdare cresc consumul cu 10–15%. Nu seta temperatura cu 10°C sub cea exterioară — 5–7°C diferență e optim. Folosește modul 'eco' sau 'sleep' noaptea. Un aparat inverter se amortizează în 2–3 ani față de unul fix, doar din economia de energie." },
    ],
  },
  {
    slug: "hidroelectrica-vs-electrica-comparatie-2026",
    title: "Hidroelectrica vs Electrica Furnizare — comparație completă 2026",
    excerpt: "Preț per kWh, abonament, cost total calculat, calitatea serviciului și când merită fiecare furnizor.",
    readTime: "8 min",
    metaDescription: "Comparație Hidroelectrica vs Electrica Furnizare 2026: preț kWh, abonament, cost total, calitate serviciu. Calculat pe consumuri reale.",
    intro: "Hidroelectrica și Electrica Furnizare sunt doi dintre cei mai mari furnizori de energie din România. Prețurile lor diferă semnificativ. Iată o comparație obiectivă, cu cifre reale din aprilie 2026.",
    sections: [
      { heading: "1. Prețul energiei active — diferența de bază", body: "Hidroelectrica: 0.45 RON/kWh (casnic), sursă POSF/ANRE. Electrica Furnizare: 0.62 RON/kWh (casnic), sursă POSF/ANRE. Diferența: 0.17 RON/kWh. La un consum de 250 kWh/lună, doar pe energia activă diferența este de 42.50 RON/lună sau 510 RON/an. Ambii furnizori nu percep abonament lunar." },
      { heading: "2. Cost total calculat — 3 scenarii de consum", body: "Apartament mic (150 kWh): Hidroelectrica ~167 RON, Electrica ~198 RON — diferență 31 RON/lună. Apartament 2-3 camere (250 kWh): Hidroelectrica ~280 RON, Electrica ~331 RON — diferență 51 RON/lună. Casă (500 kWh): Hidroelectrica ~559 RON, Electrica ~662 RON — diferență 103 RON/lună. Toate calculele includ distribuție Muntenia, transport, taxe și TVA 21%." },
      { heading: "3. Calitatea serviciului și aplicații", body: "Hidroelectrica are aplicația iHidro (Android, iOS, web) pentru autocitire, plăți și vizualizare facturi. Portalul online funcționează bine. Suport prin call center (021.9834) luni-vineri 08-20. Electrica Furnizare are portalul MyElectrica pentru facturi și plăți online. Suport prin call center și email. Ambii furnizori permit transmiterea indexului online." },
      { heading: "4. Disponibilitate și zonă de acoperire", body: "Ambii furnizori sunt disponibili în toată țara — nu depinzi de zona de distribuție. Poți avea Hidroelectrica în Moldova sau Electrica în Banat. Operatorul de distribuție (rețeaua fizică) rămâne același indiferent de furnizor." },
      { heading: "5. Verdictul — când merită fiecare", body: "La prețurile din aprilie 2026, Hidroelectrica este clar mai avantajoasă financiar pentru orice nivel de consum. Diferența de 510 RON/an la un consum mediu este substanțială. Electrica Furnizare poate fi preferată de clienții care au deja un contract bun cu preț fix pe perioadă lungă sau care preferă experiența lor de client. Dacă ești la Electrica și vrei să schimbi, procesul este gratuit prin POSF și durează ~21 de zile." },
    ],
  },
  {
    slug: "ce-inseamna-regularizare-factura-energie",
    title: "Ce înseamnă regularizare pe factura de energie și de ce e factura mai mare",
    excerpt: "Explicație simplă: ce este regularizarea, de ce apare, cum o verifici și ce faci dacă nu ești de acord cu suma.",
    readTime: "7 min",
    metaDescription: "Ce înseamnă regularizare pe factura de energie electrică: de ce apare, cum se calculează, cum o verifici și ce faci dacă suma e prea mare.",
    intro: "Ai primit o factură mult mai mare decât de obicei și scrie 'regularizare'? Nu intră în panică — regularizarea nu înseamnă că plătești mai mult per total, ci că plătești acum ce ai consumat în lunile anterioare dar nu a fost facturat corect.",
    sections: [
      { heading: "1. Ce este regularizarea — explicație simplă", body: "Regularizarea apare când furnizorul a estimat consumul în lunile anterioare (pentru că nu a avut indexul real) și acum, după citirea contorului, corectează diferența. Dacă ai consumat mai mult decât s-a estimat, plătești diferența acum. Dacă ai consumat mai puțin, primești un credit pe factura următoare." },
      { heading: "2. De ce apare regularizarea", body: "Cauzele frecvente: nu ai transmis indexul lunar, operatorul de distribuție nu a citit contorul (citirea se face la maximum 3 luni), sau s-a schimbat tariful între estimare și citirea reală. Regularizarea este normală și legală — nu este o greșeală și nu este o taxă suplimentară." },
      { heading: "3. Cum verifici dacă regularizarea e corectă", body: "Compară indexul vechi și cel nou de pe factură cu cifrele de pe contorul tău. Verifică dacă consumul total (diferența între indecși) este corect. Înmulțește consumul cu prețul pe kWh și adaugă componentele reglementate și TVA. Dacă cifrele se potrivesc, regularizarea este corectă." },
      { heading: "4. Ce faci dacă nu ești de acord", body: "Contactează furnizorul și solicită verificarea facturii. Poți cere și verificarea metrologică a contorului (contra cost, dar dacă se dovedește defect, costul e suportat de operatorul de distribuție). Dacă furnizorul nu rezolvă, te poți adresa ANRE prin telefon (021.9782) sau email (anre@anre.ro). Poți solicita și eșalonarea plății dacă suma este mare." },
      { heading: "5. Cum eviți regularizările pe viitor", body: "Transmite indexul lunar în perioada indicată pe factură (de obicei între 22 și 26 ale lunii). Folosește aplicația furnizorului, SMS-ul sau formularul online. Dacă transmiți indexul constant, facturile vor fi pe consum real și nu vor mai apărea regularizări." },
    ],
  },
  {
    slug: "cat-consuma-un-boiler-electric-pe-luna",
    title: "Cât consumă un boiler electric pe lună în lei — calcul real 2026",
    excerpt: "Consum real pentru boilere de 50L, 80L și 120L, cu costuri calculate și sfaturi de reducere a consumului.",
    readTime: "7 min",
    metaDescription: "Cât consumă un boiler electric pe lună: calcul real 2026 pentru 50L, 80L și 120L. Costuri în RON și sfaturi practice de reducere.",
    intro: "Boilerul electric este unul dintre cei mai mari consumatori de energie dintr-o locuință, dar funcționează 'invizibil' — nu îl vezi, nu îl auzi, dar consumă constant. Iată cât te costă real și ce poți face.",
    sections: [
      { heading: "1. Consum zilnic în funcție de capacitate", body: "Boiler 50L (1.5 kW): 2–3 kWh/zi, suficient pentru 1–2 persoane. Boiler 80L (2.0 kW): 3–5 kWh/zi, pentru 2–3 persoane. Boiler 120L (2.5 kW): 5–7 kWh/zi, pentru 3–5 persoane. Consumul depinde de: temperatura setată, cantitatea de apă caldă folosită, izolația boilerului și temperatura apei reci de la rețea (mai scăzută iarna)." },
      { heading: "2. Cost lunar calculat — la prețuri 2026", body: "Boiler 80L, consum mediu 4 kWh/zi × 30 zile = 120 kWh/lună. La Hidroelectrica (0.45 RON/kWh): ~54 RON/lună doar boilerul. La Electrica (0.62 RON/kWh): ~74 RON/lună. La PPC (0.67 RON/kWh): ~80 RON/lună. Iarna consumul crește cu 20–30% din cauza temperaturii mai scăzute a apei reci." },
      { heading: "3. Temperatura setată — cheia economisirii", body: "La 70–80°C, boilerul consumă maximum și pierde mult mai multă căldură prin izolație. La 55–60°C, consumul scade cu 15–20% și apa este suficient de caldă pentru toate utilizările casnice. Sub 55°C nu este recomandat din motive sanitare (risc de Legionella). Fiecare 10°C în minus economisește aproximativ 10% din consum." },
      { heading: "4. Timer și programare — economie fără efort", body: "Un timer simplu (50–100 RON) poate reduce consumul cu 20–30%. Programează boilerul să funcționeze: dimineața 05:00–07:00 (înainte de dușuri) și seara 21:00–23:00 (pregătire pentru dimineață). În rest, rezistența stă oprită și nu consumă. Alternativ, unele boilere moderne au programare integrată." },
      { heading: "5. Alternativa pe termen lung — boiler cu pompă de căldură", body: "Un boiler cu pompă de căldură consumă de 3 ori mai puțin decât unul cu rezistență: ~1.3 kWh/zi în loc de 4 kWh/zi pentru 80L. Economia: ~80 kWh/lună × 0.45 RON = 36 RON/lună, adică 432 RON/an. Prețul unui boiler cu pompă de căldură: 3.000–5.000 RON. Se amortizează în 7–12 ani, dar și mai rapid dacă prețul energiei crește." },
    ],
  },
];

const newsFeed = [
  { date: "25 aprilie 2026", category: "E-FACTURA", title: "ANAF actualizează sistemul e-Factura cu noi validări", description: "Începând cu 1 mai 2026, ANAF introduce validări suplimentare pentru facturile electronice transmise prin sistemul RO e-Factura.", link: "https://www.anaf.ro/anaf/internet/ANAF/despre_ANAF/informatii_publice/comunicate/", sursa: "anaf.ro" },
  { date: "20 aprilie 2026", category: "TARIFE", title: "ANRE publică noile tarife de distribuție pentru 2026", description: "Tarifele de distribuție au fost actualizate prin ordine ANRE. Modificările variază între +2% și +5% în funcție de zona de distribuție.", link: "https://anre.ro/energie-electrica/legislatie/tarife-reglementate/", sursa: "anre.ro" },
  { date: "15 aprilie 2026", category: "LEGISLAȚIE", title: "TVA energia electrică rămâne la 21% în 2026", description: "Parlamentul a confirmat menținerea cotei TVA de 21% pentru energia electrică, aplicabilă tuturor consumatorilor casnici și noncasnici.", link: "https://www.cdep.ro/", sursa: "cdep.ro" },
  { date: "10 aprilie 2026", category: "FURNIZORI", title: "Hidroelectrica rămâne cel mai ieftin furnizor pe piața concurențială", description: "Conform comparatorului POSF/ANRE, Hidroelectrica oferă cel mai mic preț pentru clienții casnici: 0.45 RON/kWh, cu energie 98.71% regenerabilă.", link: "https://posf.ro/comparator?comparatorType=electric", sursa: "posf.ro" },
  { date: "5 aprilie 2026", category: "ANRE", title: "ANRE actualizează componenta CFD în facturile de energie", description: "Componenta CFD (Contract for Difference) a fost recalculată la 0.000144 RON/kWh, conform Ordinului ANRE nr. 10/2025.", link: "https://anre.ro/energie-electrica/legislatie/", sursa: "anre.ro" },
];

const legalPages = [
  { path: "/confidentialitate", title: "Politică de confidențialitate", metaDescription: "Politica de confidențialitate pentru Verifică Factura.", intro: "Această pagină explică modul în care sunt colectate și folosite datele transmise prin formularul de analiză.", sections: [{ heading: "1. Date colectate", body: "Prin formular putem colecta nume, email, telefon, informații despre consum, furnizor, zonă de distribuție, valoarea facturii și mesajul transmis voluntar." }, { heading: "2. Scopul prelucrării", body: "Datele sunt folosite pentru a răspunde solicitării de verificare orientativă a facturii." }, { heading: "3. Transmiterea datelor", body: "Datele sunt transmise și stocate securizat prin Google Sheets, accesibil doar administratorului site-ului." }, { heading: "4. Păstrarea datelor", body: "Datele sunt păstrate doar atât timp cât este necesar pentru gestionarea solicitării." }, { heading: "5. Drepturile utilizatorului", body: "Utilizatorul poate solicita accesul, rectificarea sau ștergerea datelor transmise." }] },
  { path: "/termeni", title: "Termeni și condiții", metaDescription: "Termeni și condiții pentru utilizarea site-ului Verifică Factura.", intro: "Prin utilizarea site-ului, utilizatorul acceptă că informațiile afișate au caracter general și orientativ.", sections: [{ heading: "1. Scopul site-ului", body: "Site-ul oferă informații generale și un calculator orientativ. Nu furnizează oferte comerciale ferme, consultanță juridică sau servicii reglementate." }, { heading: "2. Caracter orientativ", body: "Rezultatele calculatorului sunt estimări bazate pe datele introduse și pe valori orientative." }, { heading: "3. Responsabilitatea utilizatorului", body: "Utilizatorul trebuie să verifice informațiile înainte de a lua decizii contractuale, comerciale sau financiare." }, { heading: "4. Limitarea răspunderii", body: "Administratorul site-ului nu răspunde pentru pierderi, costuri, decizii comerciale sau diferențe de facturare rezultate din folosirea informațiilor afișate." }] },
  { path: "/disclaimer", title: "Disclaimer", metaDescription: "Disclaimer privind caracterul orientativ al informațiilor și estimărilor de pe Verifică Factura.", intro: "Informațiile de pe site sunt furnizate exclusiv cu scop informativ și orientativ.", sections: [{ heading: "1. Nu este ofertă comercială", body: "Calculatorul și articolele nu reprezintă ofertă comercială, promisiune de economisire sau recomandare contractuală finală." }, { heading: "2. Estimări, nu valori oficiale", body: "Valorile afișate sunt estimative și pot diferi de factura reală." }, { heading: "3. Surse și verificare", body: "Utilizatorul trebuie să verifice informațiile în contract, factură și instrumentele oficiale." }, { heading: "4. Fără răspundere pentru decizii", body: "Orice decizie luată pe baza informațiilor de pe site aparține exclusiv utilizatorului." }] },
  { path: "/cookies", title: "Politică cookies", metaDescription: "Politica de cookies pentru Verifică Factura.", intro: "Această pagină descrie utilizarea cookie-urilor și a tehnologiilor similare.", sections: [{ heading: "1. Cookie-uri esențiale", body: "Site-ul poate utiliza cookie-uri necesare pentru funcționarea tehnică." }, { heading: "2. Analytics și marketing", body: "Dacă vor fi adăugate instrumente de analytics sau marketing, utilizatorii trebuie informați și, unde este necesar, trebuie cerut consimțământul." }, { heading: "3. Gestionarea cookie-urilor", body: "Utilizatorul poate controla cookie-urile din setările browserului." }] },
];

export default function EnergyLeadSite() {
  const [path, setPath] = useState(getCurrentPath());
  const [calculation, setCalculation] = useState(null);

  useEffect(() => {
    const handlePopState = () => setPath(getCurrentPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (to) => {
    window.history.pushState({}, "", to);
    setPath(getCurrentPath());
    setTimeout(() => {
      if (to.includes("#")) {
        const hash = to.split("#")[1];
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 50);
  };

  const articleMatch = path.startsWith("/articole/") ? articles.find((a) => `/articole/${a.slug}` === path) : null;
  const legalMatch = legalPages.find((p) => p.path === path);
  const supplierMatch = path.startsWith("/furnizori/")
    ? supplierOffers.find((s) => `/furnizori/${s.id}` === path)
    : null;

  useEffect(() => {
    if (articleMatch) {
      setMeta(`${articleMatch.title} | Verifică Factura`, articleMatch.metaDescription);
    } else if (supplierMatch) {
      setMeta(
        `${supplierMatch.name} - preț energie 2026 | Verifică Factura`,
        `Vezi prețul orientativ pentru ${supplierMatch.name}, oferta ${supplierMatch.offerName}, procent energie verde și estimare factură.`
      );
    } else if (legalMatch) {
      setMeta(`${legalMatch.title} | Verifică Factura`, legalMatch.metaDescription);
    } else {
      setMeta(
        "Verifică Factura - Calculator factură energie",
        "Verifică orientativ factura de energie, compară costul actual cu o estimare și cere o analiză gratuită."
      );
    }
  }, [articleMatch, supplierMatch, legalMatch]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header navigate={navigate} />
      {articleMatch ? (
        <ArticlePage article={articleMatch} navigate={navigate} />
      ) : supplierMatch ? (
        <SupplierPage supplier={supplierMatch} navigate={navigate} />
      ) : legalMatch ? (
        <LegalPage page={legalMatch} navigate={navigate} />
      ) : (
        <HomePage calculation={calculation} setCalculation={setCalculation} navigate={navigate} />
      )}
      <Footer navigate={navigate} />
    </div>
  );
}

function Header({ navigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const goTo = (to) => { setMobileOpen(false); navigate(to); };

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg shadow-slate-900/10">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <button onClick={() => goTo("/")} className="text-left">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Analiză factură energie</p>
          <h1 className="text-xl font-bold">Verifică Factura</h1>
        </button>
        <nav className="hidden md:flex gap-6 text-sm text-slate-200">
          <button onClick={() => goTo("/#calculator")} className="hover:text-white transition">Calculator</button>
          <button onClick={() => goTo("/#ghiduri")} className="hover:text-white transition">Ghiduri</button>
          <button onClick={() => goTo("/#furnizori")} className="hover:text-white transition">Furnizori</button>
          <button onClick={() => goTo("/#contact")} className="hover:text-white transition">Contact</button>
        </nav>
        <button type="button" onClick={() => setMobileOpen(v => !v)}
          className="md:hidden rounded-xl border border-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/10 transition"
          aria-label="Deschide meniul">
          {mobileOpen ? "✕ Închide" : "☰ Meniu"}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950 px-6 pb-5">
          <div className="mx-auto grid max-w-6xl gap-2 pt-4 text-sm">
            <button onClick={() => goTo("/#calculator")} className="rounded-xl bg-white/5 px-4 py-3 text-left hover:bg-white/10 transition">⚡ Calculator</button>
            <button onClick={() => goTo("/#ghiduri")} className="rounded-xl bg-white/5 px-4 py-3 text-left hover:bg-white/10 transition">📖 Ghiduri</button>
            <button onClick={() => goTo("/#furnizori")} className="rounded-xl bg-white/5 px-4 py-3 text-left hover:bg-white/10 transition">🔌 Furnizori</button>
            <button onClick={() => goTo("/#contact")} className="rounded-xl bg-emerald-500 px-4 py-3 text-left font-semibold text-slate-950 hover:bg-emerald-400 transition">✉ Cere analiză gratuită</button>
          </div>
        </div>
      )}
    </header>
  );
}

function HomePage({ calculation, setCalculation, navigate }) {
  useEffect(() => {
    if (window.location.hash) {
      setTimeout(() => document.querySelector(window.location.hash)?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, []);

  return (
    <main>
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
              <SparkIcon /> Energie • Economii • Comparator
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">Verifică dacă factura ta de energie poate fi optimizată</h2>
            <p className="mt-5 text-lg text-slate-200 max-w-xl">Introdu consumul, furnizorul actual, zona de distribuție și costul facturii. Primești o estimare orientativă și poți cere o analiză personalizată.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a href="#calculator" className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 shadow-lg hover:bg-emerald-400 transition text-center">Verifică factura acum</a>
              <a href="#contact" className="rounded-2xl border border-white/20 px-6 py-3 font-semibold hover:bg-white/10 transition text-center">Cere analiză gratuită</a>
            </div>
            <div className="mt-8 hidden sm:grid gap-3 sm:grid-cols-3 max-w-xl">
              <HeroBadge icon="leaf" title="Energie verde" />
              <HeroBadge icon="chart" title="Estimare rapidă" />
              <HeroBadge icon="shield" title="Date protejate" />
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-100 opacity-60" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-sky-100 opacity-60" />
            <div className="relative mb-4 flex items-center justify-between">
              <div><p className="text-sm font-medium text-emerald-700">Exemplu analiză</p><h3 className="text-2xl font-bold">Economii potențiale</h3></div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">orientativ</div>
            </div>
            <div className="relative grid gap-3">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Consum lunar</p><p className="text-2xl font-bold">285 kWh</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Factură introdusă</p><p className="text-2xl font-bold">330 RON</p></div>
              <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100"><p className="text-sm font-semibold text-emerald-700">Rezultat posibil</p><p className="mt-1 text-sm text-slate-700">Estimarea comparativă indică o diferență de +50 RON/lună față de oferta orientativă.</p></div>
            </div>
            <div className="relative mt-4 text-center"><a href="#calculator" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-500 transition">Completează calculatorul pentru rezultatul tău real <span className="text-lg">↓</span></a></div>
          </div>
        </div>
      </section>

      <section id="calculator" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-2 items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Calculator factură energie</p>
            <h3 className="mt-3 text-3xl font-bold">Compară costul actual cu o estimare orientativă</h3>
            <p className="mt-4 text-slate-600 max-w-xl">Completează câmpurile de mai jos. Rezultatul apare automat după ce introduci consumul și valoarea facturii.</p>
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><AdvancedCalculator onCalculationChange={setCalculation} /></div>
          </div>
          <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Ce verificăm</p>
            <h4 className="mt-3 text-2xl font-bold">Elemente care pot schimba factura</h4>
            <div className="mt-6 grid gap-4">
              <InfoCard title="1. Prețul energiei active" text="Componenta comercială diferă între furnizori și oferte." />
              <InfoCard title="2. Zona de distribuție" text="Tarifele de distribuție pot varia în funcție de zona locului de consum." />
              <InfoCard title="3. Tipul facturii" text="Factura estimată sau regularizarea pot explica diferențe mari de cost." />
              <InfoCard title="4. Abonamente și servicii" text="Unele oferte pot include abonamente lunare sau servicii suplimentare." />
            </div>
          </div>
        </div>
      </section>

      <section id="ghiduri" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Ghiduri utile</p><h3 className="mt-3 text-3xl font-bold">Învață să verifici factura de energie</h3></div>
          <a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border-2 border-amber-400 bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-700 hover:bg-amber-100 transition shadow-sm"><RssIcon /> Abonează-te via RSS</a>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <article key={article.slug} className="flex flex-col rounded-3xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-lg transition">
              <div className="mb-4 flex items-center justify-between gap-3"><span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">ghid</span><span className="text-xs text-slate-500">{article.readTime}</span></div>
              <h4 className="text-xl font-bold leading-snug flex-1">{article.title}</h4>
              <p className="mt-3 text-slate-600 text-sm flex-1">{article.excerpt}</p>
              <button onClick={() => navigate(`/articole/${article.slug}`)} className="mt-5 inline-block rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition self-start">Citește ghidul →</button>
            </article>
          ))}
        </div>
      </section>

      <section id="furnizori" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Furnizori energie</p>
          <h3 className="mt-3 text-3xl font-bold">Compară furnizorii de energie electrică</h3>
          <p className="mt-2 text-slate-600">Vezi pagini dedicate pentru furnizori, cu preț orientativ, ofertă și estimare de factură.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {supplierOffers.slice(0, 18).map((supplier) => (
            <button key={supplier.id} onClick={() => navigate(`/furnizori/${supplier.id}`)} className="rounded-2xl bg-white p-5 text-left border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition">
              <p className="font-bold text-slate-900">{supplier.name}</p>
              <p className="mt-1 text-sm text-slate-600">{supplier.offerName}</p>
              <p className="mt-3 text-sm font-semibold text-emerald-700">{money(supplier.prices.household)} RON/kWh</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8"><h3 className="text-3xl font-bold text-slate-900">Știri & Noutăți</h3><p className="mt-2 text-slate-600">Ultimele actualizări din domeniul energiei electrice în România.</p></div>
        <div className="grid gap-5 md:grid-cols-2">
          {newsFeed.map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="block rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition">
              <div className="flex items-center justify-between gap-3 mb-3"><span className="inline-block rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">{item.category}</span><span className="text-sm text-slate-500">{item.date}</span></div>
              <h4 className="text-lg font-bold text-slate-900 leading-snug">{item.title}</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
              <p className="mt-3 text-xs text-emerald-600 font-semibold">Sursa: {item.sursa} →</p>
            </a>
          ))}
        </div>
      </section>

      <ContactSection calculation={calculation} />
    </main>
  );
}

function SupplierPage({ supplier, navigate }) {
  const exampleKwh = 250;
  const zone = distributionZones[0];

  const activeEnergy = exampleKwh * supplier.prices.household;
  const distribution = exampleKwh * zone.distributionTariff;
  const transportTG = exampleKwh * regulatedCosts.transportTG;
  const transportTL = exampleKwh * regulatedCosts.transportTL;
  const systemServices = exampleKwh * regulatedCosts.systemServices;
  const greenCertificates = exampleKwh * regulatedCosts.greenCertificates;
  const cogeneration = exampleKwh * regulatedCosts.cogeneration;
  const cfd = exampleKwh * regulatedCosts.cfd;
  const excise = exampleKwh * regulatedCosts.excise;
  const subtotal = activeEnergy + distribution + transportTG + transportTL + systemServices + greenCertificates + cogeneration + cfd + excise + supplier.subscription;
  const total = subtotal + subtotal * regulatedCosts.vat;

  return (
    <main className="bg-white">
      <section className="bg-gradient-to-br from-slate-900 to-emerald-900 text-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <button onClick={() => navigate("/")} className="mb-8 rounded-2xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition">← Înapoi la calculator</button>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">Furnizor energie electrică</p>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">{supplier.name} - preț energie și estimare factură 2026</h2>
          <p className="mt-6 text-lg text-slate-200 max-w-3xl">Pagina prezintă o estimare orientativă pentru oferta {supplier.offerName || "selectată"}. Valorile sunt informative și trebuie verificate în comparatorul oficial POSF/ANRE și în oferta contractuală.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-emerald-50 p-6 border border-emerald-100"><p className="text-sm font-semibold text-emerald-700">Preț energie activă</p><p className="mt-2 text-3xl font-bold">{money(supplier.prices.household)} RON/kWh</p><p className="mt-2 text-xs text-slate-500">Client casnic</p></div>
          <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200"><p className="text-sm font-semibold text-slate-700">Ofertă</p><p className="mt-2 text-xl font-bold">{supplier.offerName || "Ofertă orientativă"}</p><p className="mt-2 text-xs text-slate-500">Sursă: {supplier.source}</p></div>
          <div className="rounded-3xl bg-lime-50 p-6 border border-lime-100"><p className="text-sm font-semibold text-lime-700">Energie verde</p><p className="mt-2 text-3xl font-bold">{supplier.green}%</p><p className="mt-2 text-xs text-slate-500">Conform datelor introduse</p></div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 border border-slate-200 shadow-sm">
          <h3 className="text-2xl font-bold">Estimare factură pentru 250 kWh/lună</h3>
          <p className="mt-2 text-slate-600">Exemplu calculat pentru zona Muntenia / București-Ilfov, client casnic, consum lunar de 250 kWh.</p>
          <div className="mt-6 grid gap-3 text-sm text-slate-700">
            <CostRow label="Energie activă" value={activeEnergy} />
            <CostRow label="Distribuție" value={distribution} />
            <CostRow label="Transport TG" value={transportTG} />
            <CostRow label="Transport TL" value={transportTL} />
            <CostRow label="Servicii sistem" value={systemServices} />
            <CostRow label="Certificate verzi" value={greenCertificates} />
            <CostRow label="Cogenerare" value={cogeneration} />
            <CostRow label="Componentă CFD" value={cfd} />
            <CostRow label="Acciză" value={excise} />
            <CostRow label="Abonament" value={supplier.subscription} />
            <CostRow label="TVA 21%" value={subtotal * regulatedCosts.vat} />
          </div>
          <div className="mt-6 rounded-2xl bg-emerald-50 p-5 border border-emerald-100"><p className="text-sm font-semibold text-emerald-700">Total estimat</p><p className="mt-1 text-3xl font-bold text-slate-900">{money(total)} RON/lună</p></div>
        </div>

        <div className="mt-8 rounded-3xl bg-slate-900 p-6 text-white">
          <h3 className="text-2xl font-bold">Merită {supplier.name}?</h3>
          <p className="mt-3 text-slate-300 leading-7">{supplier.name} poate fi o opțiune de analizat dacă prețul energiei active și condițiile contractuale sunt potrivite pentru consumul tău. Compară întotdeauna costul total, nu doar prețul pe kWh.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate("/#calculator")} className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 hover:bg-emerald-400 transition">Calculează factura ta</button>
            <a href="https://posf.ro/comparator?comparatorType=electric" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-white/20 px-6 py-3 font-semibold text-center hover:bg-white/10 transition">Verifică în POSF/ANRE</a>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-500">Estimarea este orientativă. Prețurile, tarifele și condițiile contractuale pot varia. Pentru informații oficiale, consultă oferta furnizorului și comparatorul POSF/ANRE. Actualizat la: {supplier.updatedAt}.</p>
      </section>
    </main>
  );
}

function ContactSection({ calculation }) {
  return <section id="contact" className="relative overflow-hidden bg-slate-950 text-white"><div className="relative mx-auto max-w-7xl px-6 py-20"><div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] items-start"><div><p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">Asistență clienți</p><h3 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">Cere verificarea facturii tale de energie</h3><p className="mt-5 text-slate-300 leading-7 max-w-xl">Completează formularul, iar solicitarea va include automat și estimarea calculată.</p></div><div className="rounded-[2rem] bg-white/95 p-4 md:p-6 shadow-2xl"><LeadForm calculation={calculation} /></div></div></div></section>;
}

function AdvancedCalculator({ onCalculationChange }) {
  const [consumption, setConsumption] = useState(250);
  const [currentBill, setCurrentBill] = useState(300);
  const [clientType, setClientType] = useState("household");
  const [locationType, setLocationType] = useState("apartment");
  const [invoiceType, setInvoiceType] = useState("unknown");
  const [hasSubscription, setHasSubscription] = useState("unknown");
  const [changedSupplier, setChangedSupplier] = useState("no");
  const [supplierId, setSupplierId] = useState("hidroelectrica");
  const [zoneId, setZoneId] = useState("muntenia");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const validationErrors = useMemo(() => {
    const errors = [];
    if (!Number(consumption) || Number(consumption) <= 0) errors.push("Introdu un consum mai mare de 0 kWh.");
    if (currentBill === "" || Number(currentBill) < 0) errors.push("Introdu valoarea facturii actuale în RON.");
    return errors;
  }, [consumption, currentBill]);

  const result = useMemo(() => {
    if (validationErrors.length > 0) return null;
    const selectedSupplier = supplierOffers.find((item) => item.id === supplierId);
    const selectedZone = distributionZones.find((item) => item.id === zoneId);
    const kwh = Number(consumption || 0);
    const bill = Number(currentBill || 0);
    if (!selectedSupplier || !selectedZone || kwh <= 0) return null;
    const businessMultiplier = clientType === "nonhousehold" ? 1.08 : 1;
    const locationMultiplier = locationType === "house" ? 1.04 : locationType === "commercial" ? 1.1 : 1;
    const invoiceAdjustment = invoiceType === "estimated" ? 0.96 : invoiceType === "regularization" ? 1.04 : 1;
    const selectedEnergyPrice = clientType === "nonhousehold" ? selectedSupplier.prices.nonhousehold : selectedSupplier.prices.household;
    const activeEnergy = kwh * selectedEnergyPrice * businessMultiplier * locationMultiplier;
    const distribution = kwh * selectedZone.distributionTariff;
    const transportTG = kwh * regulatedCosts.transportTG;
    const transportTL = kwh * regulatedCosts.transportTL;
    const systemServices = kwh * regulatedCosts.systemServices;
    const greenCertificates = kwh * regulatedCosts.greenCertificates;
    const cogeneration = kwh * regulatedCosts.cogeneration;
    const cfd = kwh * regulatedCosts.cfd;
    const excise = kwh * regulatedCosts.excise;
    const subscription = hasSubscription === "yes" ? Math.max(selectedSupplier.subscription, 5) : hasSubscription === "no" ? 0 : selectedSupplier.subscription;
    const calcTotal = (supplier) => {
      const price = clientType === "nonhousehold" ? supplier.prices.nonhousehold : supplier.prices.household;
      const ae = kwh * price * businessMultiplier * locationMultiplier;
      const sub = hasSubscription === "yes" ? Math.max(supplier.subscription, 5) : hasSubscription === "no" ? 0 : supplier.subscription;
      const st = (ae + distribution + transportTG + transportTL + systemServices + greenCertificates + cogeneration + cfd + excise + sub) * invoiceAdjustment;
      return st + st * regulatedCosts.vat;
    };
    const cheapestOffer = supplierOffers.map(s => ({ name: s.name, monthlyTotal: calcTotal(s), source: s.source, updatedAt: s.updatedAt })).sort((a, b) => a.monthlyTotal - b.monthlyTotal)[0];
    const subtotal = (activeEnergy + distribution + transportTG + transportTL + systemServices + greenCertificates + cogeneration + cfd + excise + subscription) * invoiceAdjustment;
    const vat = subtotal * regulatedCosts.vat;
    const estimatedMonthly = subtotal + vat;
    const monthlyDifference = bill - estimatedMonthly;
    const annualDifference = monthlyDifference * 12;
    const warnings = [];
    if (invoiceType === "estimated") warnings.push("Factura este estimată: verifică indexul real și eventualele regularizări viitoare.");
    if (invoiceType === "regularization") warnings.push("Factura include regularizare: diferența poate veni din consum estimat anterior.");
    if (hasSubscription === "yes") warnings.push("Ai indicat abonament: verifică dacă acesta merită raportat la consumul tău.");
    if (changedSupplier === "yes") warnings.push("Ai schimbat recent furnizorul: verifică dacă factura include perioade de tranziție sau regularizări.");
    if (locationType === "commercial") warnings.push("Pentru spații comerciale, profilul de consum poate varia puternic în funcție de program și echipamente.");
    const recommendation = monthlyDifference > 50 ? "Factura ta pare semnificativ peste estimarea orientativă. Merită verificată oferta, abonamentul, perioada facturată și eventualele regularizări." : monthlyDifference > 20 ? "Factura este peste estimare. Ar putea exista spațiu de optimizare prin ofertă, abonament sau consum." : monthlyDifference < -15 ? "Factura introdusă este sub estimarea orientativă. Verifică dacă ai plafonări, compensări, regularizări negative sau o ofertă foarte bună." : "Factura pare apropiată de estimarea orientativă. Poți verifica în continuare abonamentul, oferta și istoricul consumului.";
    return { kwh, clientType, locationType, invoiceType, hasSubscription, changedSupplier, supplierName: selectedSupplier.name, zoneName: selectedZone.name, selectedEnergyPrice, selectedEnergySource: selectedSupplier.source, selectedUpdatedAt: selectedSupplier.updatedAt, cheapestOffer, currentBill: bill, activeEnergy, distribution, transportTG, transportTL, systemServices, greenCertificates, cogeneration, cfd, excise, subscription, vat, estimatedMonthly, monthlyDifference, annualDifference, recommendation, warnings };
  }, [consumption, currentBill, clientType, locationType, invoiceType, hasSubscription, changedSupplier, supplierId, zoneId, validationErrors]);

  useEffect(() => { onCalculationChange(result); }, [result, onCalculationChange]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Consum lunar estimat (kWh)" hint="Îl găsești pe factură. Poți începe cu o estimare."><input type="number" value={consumption} onChange={(e) => setConsumption(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" /></Field>
        <Field label="Furnizor / ofertă orientativă" hint="Selectează oferta față de care vrei comparația."><select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500">{supplierOffers.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.offerName}</option>)}</select></Field>
        <Field label="Zonă distribuție" hint="Afectează componenta de distribuție a facturii."><select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500">{distributionZones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}</select></Field>
        <Field label="Valoare factură actuală (RON)" hint="Introdu totalul de plată, nu doar energia activă."><input type="number" value={currentBill} onChange={(e) => setCurrentBill(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" /></Field>
      </div>
      <button type="button" onClick={() => setShowAdvanced(v => !v)} className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition">{showAdvanced ? "Ascunde opțiunile avansate" : "Opțiuni avansate"}</button>
      {showAdvanced && <div className="mt-4 grid gap-4 sm:grid-cols-2 rounded-2xl bg-slate-50 p-4 border border-slate-200"><Field label="Tip client"><select value={clientType} onChange={(e) => setClientType(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3"><option value="household">Casnic</option><option value="nonhousehold">Noncasnic</option></select></Field><Field label="Tip loc de consum"><select value={locationType} onChange={(e) => setLocationType(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3"><option value="apartment">Apartament</option><option value="house">Casă</option><option value="commercial">Spațiu comercial</option></select></Field><Field label="Tip factură"><select value={invoiceType} onChange={(e) => setInvoiceType(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3"><option value="unknown">Nu știu</option><option value="real">Consum real</option><option value="estimated">Estimată</option><option value="regularization">Regularizare</option></select></Field><Field label="Oferta include abonament?"><select value={hasSubscription} onChange={(e) => setHasSubscription(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3"><option value="unknown">Nu știu</option><option value="yes">Da</option><option value="no">Nu</option></select></Field><Field label="Ai schimbat furnizorul în ultimele 6 luni?"><select value={changedSupplier} onChange={(e) => setChangedSupplier(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3"><option value="no">Nu</option><option value="yes">Da</option></select></Field></div>}
      {validationErrors.length > 0 && <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700 border border-red-100"><p className="font-semibold">Verifică datele introduse:</p><ul className="mt-2 list-disc pl-5">{validationErrors.map((err) => <li key={err}>{err}</li>)}</ul></div>}
      {result && <CalculatorResult result={result} />}
    </div>
  );
}

function CalculatorResult({ result }) {
  const [showDetails, setShowDetails] = useState(false);
  return <div className="mt-6 grid gap-4"><div className="rounded-2xl bg-emerald-50 p-5 border border-emerald-100"><p className="text-sm font-medium text-emerald-700">Estimare lunară</p><p className="mt-1 text-3xl font-bold text-slate-900">{money(result.estimatedMonthly)} RON</p><p className="mt-2 text-sm text-slate-600">Furnizor: {result.supplierName} • Zonă: {result.zoneName}</p></div><div className="rounded-2xl bg-amber-50 p-5 border border-amber-100"><p className="text-sm font-medium text-slate-700">Diferență față de factura introdusă</p><p className="mt-1 text-2xl font-bold text-slate-900">{result.monthlyDifference >= 0 ? "+" : ""}{money(result.monthlyDifference)} RON / lună</p><p className="mt-3 text-sm text-slate-700">{result.recommendation}</p></div>{result.cheapestOffer && <div className="rounded-2xl bg-lime-50 p-5 border border-lime-100"><p className="text-sm font-medium text-lime-700">Cel mai ieftin furnizor din lista orientativă</p><p className="mt-1 text-2xl font-bold text-slate-900">{result.cheapestOffer.name}</p><p className="mt-2 text-sm text-slate-700">Estimare lunară: <strong>{money(result.cheapestOffer.monthlyTotal)} RON</strong></p></div>}<div className="rounded-2xl bg-white border border-slate-200 overflow-hidden"><button type="button" onClick={() => setShowDetails(v => !v)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition"><span className="font-semibold text-slate-900">Structură estimativă cost</span><span className="text-slate-500 text-sm">{showDetails ? "▲ Ascunde" : "▼ Vezi detalii calcul"}</span></button>{showDetails && <div className="px-5 pb-5 grid gap-2 text-sm text-slate-600 border-t border-slate-100"><div className="pt-3" /><CostRow label="Energie activă" value={result.activeEnergy} /><CostRow label="Distribuție" value={result.distribution} /><CostRow label="Transport TG" value={result.transportTG} /><CostRow label="Transport TL" value={result.transportTL} /><CostRow label="Servicii sistem" value={result.systemServices} /><CostRow label="Certificate verzi" value={result.greenCertificates} /><CostRow label="Cogenerare" value={result.cogeneration} /><CostRow label="Componentă CFD" value={result.cfd} /><CostRow label="Acciză" value={result.excise} /><CostRow label="Abonament" value={result.subscription} /><CostRow label="TVA (21%)" value={result.vat} /></div>}</div><p className="text-xs text-slate-500">Estimările afișate sunt orientative și nu reprezintă ofertă comercială.</p></div>;
}

function LeadForm({ calculation }) {
  return <form className="rounded-[1.5rem] bg-white p-6 md:p-8 text-slate-900"><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Formular analiză</p><h4 className="mt-2 text-2xl md:text-3xl font-bold">Trimite datele pentru verificare</h4></div><div className="grid gap-5 md:grid-cols-2"><FormField label="Nume"><input name="nume" required className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3" /></FormField><FormField label="Email"><input type="email" name="email" required className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3" /></FormField><div className="md:col-span-2"><FormField label="Mesaj"><textarea name="mesaj" required className="min-h-[130px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3" /></FormField></div><button type="submit" className="md:col-span-2 rounded-2xl bg-emerald-500 px-6 py-4 font-bold text-slate-950 hover:bg-emerald-400 transition">Trimite cererea</button></div></form>;
}

function ArticlePage({ article, navigate }) {
  return <main className="bg-white"><section className="bg-gradient-to-br from-slate-900 to-emerald-900 text-white"><div className="mx-auto max-w-4xl px-6 py-16"><button onClick={() => navigate("/#ghiduri")} className="mb-8 rounded-2xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition">← Înapoi la ghiduri</button><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">Ghid energie • {article.readTime}</p><h2 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">{article.title}</h2><p className="mt-6 text-lg text-slate-200">{article.intro}</p></div></section><article className="mx-auto max-w-4xl px-6 py-14"><div className="space-y-8 text-slate-700 leading-8">{article.sections.map((section) => <section key={section.heading}><h3 className="text-2xl font-bold text-slate-900">{section.heading}</h3><p className="mt-3">{section.body}</p></section>)}</div></article></main>;
}

function LegalPage({ page, navigate }) {
  return <main className="bg-white"><section className="bg-gradient-to-br from-slate-900 to-emerald-900 text-white"><div className="mx-auto max-w-4xl px-6 py-16"><button onClick={() => navigate("/")} className="mb-8 rounded-2xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition">← Înapoi la site</button><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">Informații legale</p><h2 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">{page.title}</h2><p className="mt-6 text-lg text-slate-200">{page.intro}</p></div></section><article className="mx-auto max-w-4xl px-6 py-14"><div className="rounded-3xl bg-amber-50 border border-amber-100 p-6 mb-10"><p className="font-semibold text-amber-900">Notă importantă</p><p className="mt-2 text-sm text-amber-900/80">Aceste texte sunt un model de lucru. Înainte de lansarea oficială, este recomandată verificarea de către un specialist juridic/GDPR.</p></div><div className="space-y-8 text-slate-700 leading-8">{page.sections.map((section) => <section key={section.heading}><h3 className="text-2xl font-bold text-slate-900">{section.heading}</h3><p className="mt-3">{section.body}</p></section>)}</div></article></main>;
}

function Footer({ navigate }) {
  return <footer className="bg-slate-950 text-slate-300 border-t border-white/10"><div className="mx-auto max-w-6xl px-6 py-10 grid gap-8 md:grid-cols-3"><div><p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Verifică Factura</p><p className="mt-3 text-sm leading-6 text-slate-400">Platformă informativă pentru verificarea orientativă a facturilor de energie.</p></div><div><p className="font-semibold text-white">Informații legale</p><div className="mt-3 flex flex-col gap-2 text-sm"><button onClick={() => navigate("/confidentialitate")} className="text-left hover:text-white transition">Confidențialitate</button><button onClick={() => navigate("/termeni")} className="text-left hover:text-white transition">Termeni</button><button onClick={() => navigate("/disclaimer")} className="text-left hover:text-white transition">Disclaimer</button><button onClick={() => navigate("/cookies")} className="text-left hover:text-white transition">Cookies</button></div></div><div className="md:text-right"><p className="font-semibold text-white">Resurse</p><div className="mt-3 flex flex-col gap-2 text-sm md:items-end"><a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white transition"><RssIcon /> RSS Feed</a><a href="https://posf.ro/comparator?comparatorType=electric" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Comparator POSF/ANRE</a></div></div></div></footer>;
}

function Field({ label, hint, children }) { return <div><label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>{children}{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}</div>; }
function CostRow({ label, value }) { return <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2"><span>{label}</span><strong className="text-slate-900">{money(value)} RON</strong></div>; }
function FormField({ label, required = true, children }) { return <div><label className="block text-sm font-semibold text-slate-800">{label} {required && <span className="text-red-500">*</span>}</label><div className="mt-2">{children}</div></div>; }
function InfoCard({ title, text }) { return <div className="rounded-2xl bg-white/5 p-4 border border-white/10"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200"><SparkIcon /></div><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-slate-300">{text}</p></div>; }
function HeroBadge({ icon, title }) { return <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 backdrop-blur"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-200">{icon === "leaf" ? <LeafIcon /> : icon === "shield" ? <ShieldIcon /> : <ChartIcon />}</span><span>{title}</span></div>; }

function SparkIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" /></svg>; }
function LeafIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 4c-7 0-12 5-12 12 0 2 1 4 3 4 7 0 9-9 9-16Z" /><path d="M4 20c4-6 8-9 16-16" /></svg>; }
function ChartIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 15 4-4 3 3 5-7" /></svg>; }
function ShieldIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-5" /></svg>; }
function RssIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" /></svg>; }

function money(value) { return Number(value || 0).toFixed(2); }
