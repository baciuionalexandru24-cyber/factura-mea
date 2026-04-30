import React, { useEffect, useMemo, useState } from "react";
import content from "./data/content.json";

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
  // Top 10 — cele mai ieftine oferte
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

  // 11-20
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

  // 21-30
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

  // 31-40
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

  // 41-45 — cele mai scumpe
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

const supplierOffers = Object.entries(furnizoriRaw).map(([name, prices]) => ({
  id: slugify(name),
  name,
  offerName: prices.oferta || "",
  prices: { household: Number(prices.casnic || 0), nonhousehold: Number(prices.noncasnic || prices.casnic || 0) },
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

/* Costuri reglementate — actualizate conform facturilor reale ANRE 2026
   Pentru a modifica: editează valorile de mai jos */
const regulatedCosts = {
  transportTG: 0.00363,      // Tarif introducere în rețea (TG)
  transportTL: 0.03645,      // Tarif extragere din rețea (TL)
  systemServices: 0.0147,    // Servicii de sistem
  greenCertificates: 0.0740, // Certificate verzi
  cogeneration: 0.0136,      // Contribuție cogenerare
  cfd: 0.000144,             // Componentă CFD
  excise: 0.00768,           // Acciză
  vat: 0.21,                 // TVA 21%
  actualizatLa: "2026-04-28",
};

const articles = content
  .filter((item) => item.type === "article" && item.status === "published")
  .sort((a, b) => new Date(b.publishDate || 0) - new Date(a.publishDate || 0));

const newsFeed = content
  .filter((item) => item.type === "news" && item.status === "published")
  .sort((a, b) => new Date(b.publishDate || 0) - new Date(a.publishDate || 0));

const legalPages = [
  { path: "/confidentialitate", title: "Politică de confidențialitate", metaDescription: "Politica de confidențialitate pentru Verifică Factura.", intro: "Această pagină explică modul în care sunt colectate și folosite datele transmise prin formularul de analiză.", sections: [{ heading: "1. Date colectate", body: "Prin formular putem colecta nume, email, telefon, informații despre consum, furnizor, zonă de distribuție, valoarea facturii și mesajul transmis voluntar." }, { heading: "2. Scopul prelucrării", body: "Datele sunt folosite pentru a răspunde solicitării de verificare orientativă a facturii." }, { heading: "3. Transmiterea datelor", body: "Datele sunt transmise și stocate securizat prin Google Sheets, accesibil doar administratorului site-ului." }, { heading: "4. Păstrarea datelor", body: "Datele sunt păstrate doar atât timp cât este necesar pentru gestionarea solicitării." }, { heading: "5. Drepturile utilizatorului", body: "Utilizatorul poate solicita accesul, rectificarea sau ștergerea datelor transmise." }] },
  { path: "/termeni", title: "Termeni și condiții", metaDescription: "Termeni și condiții pentru utilizarea site-ului Verifică Factura.", intro: "Prin utilizarea site-ului, utilizatorul acceptă că informațiile afișate au caracter general și orientativ.", sections: [{ heading: "1. Scopul site-ului", body: "Site-ul oferă informații generale și un calculator orientativ. Nu furnizează oferte comerciale ferme, consultanță juridică sau servicii reglementate." }, { heading: "2. Caracter orientativ", body: "Rezultatele calculatorului sunt estimări bazate pe datele introduse și pe valori orientative." }, { heading: "3. Responsabilitatea utilizatorului", body: "Utilizatorul trebuie să verifice informațiile înainte de a lua decizii contractuale, comerciale sau financiare." }, { heading: "4. Limitarea răspunderii", body: "Administratorul site-ului nu răspunde pentru pierderi, costuri, decizii comerciale sau diferențe de facturare rezultate din folosirea informațiilor afișate." }] },
  { path: "/disclaimer", title: "Disclaimer", metaDescription: "Disclaimer privind caracterul orientativ al informațiilor și estimărilor de pe Verifică Factura.", intro: "Informațiile de pe site sunt furnizate exclusiv cu scop informativ și orientativ.", sections: [{ heading: "1. Nu este ofertă comercială", body: "Calculatorul și articolele nu reprezintă ofertă comercială, promisiune de economisire sau recomandare contractuală finală." }, { heading: "2. Estimări, nu valori oficiale", body: "Valorile afișate sunt estimative și pot diferi de factura reală." }, { heading: "3. Surse și verificare", body: "Utilizatorul trebuie să verifice informațiile în contract, factură și instrumentele oficiale." }, { heading: "4. Fără răspundere pentru decizii", body: "Orice decizie luată pe baza informațiilor de pe site aparține exclusiv utilizatorului." }] },
  { path: "/cookies", title: "Politică cookies", metaDescription: "Politica de cookies pentru Verifică Factura.", intro: "Această pagină descrie utilizarea cookie-urilor și a tehnologiilor similare.", sections: [{ heading: "1. Cookie-uri esențiale", body: "Site-ul poate utiliza cookie-uri necesare pentru funcționarea tehnică." }, { heading: "2. Analytics și marketing", body: "Dacă vor fi adăugate instrumente de analytics sau marketing, utilizatorii trebuie informați și, unde este necesar, trebuie cerut consimțământul." }, { heading: "3. Gestionarea cookie-urilor", body: "Utilizatorul poate controla cookie-urile din setările browserului." }] },
];

/* =====================================================
   ROUTING
   ===================================================== */
function getCurrentPath() {
  return window.location.pathname === "/" ? "/" : window.location.pathname.replace(/\/$/, "");
}

function setMeta(title, description) {
  document.title = title;
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
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
  const newsMatch = path.startsWith("/stiri/") ? newsFeed.find((n) => `/stiri/${n.slug}` === path) : null;
  const legalMatch = legalPages.find((p) => p.path === path);
  const supplierMatch = path.startsWith("/furnizori/")
    ? supplierOffers.find((s) => `/furnizori/${s.id}` === path)
    : null;

  useEffect(() => {
    if (articleMatch) {
      setMeta(`${articleMatch.title} | Verifică Factura`, articleMatch.metaDescription);
    } else if (newsMatch) {
      setMeta(`${newsMatch.title} | Verifică Factura`, newsMatch.metaDescription);
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
  }, [articleMatch, newsMatch, supplierMatch, legalMatch]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header navigate={navigate} />
      {articleMatch ? (
        <ArticlePage article={articleMatch} navigate={navigate} />
      ) : newsMatch ? (
        <ArticlePage article={newsMatch} navigate={navigate} />
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

/* =====================================================
   HEADER
   ===================================================== */
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

/* =====================================================
   HOME PAGE
   ===================================================== */
function HomePage({ calculation, setCalculation, navigate }) {
  useEffect(() => {
    if (window.location.hash) {
      setTimeout(() => document.querySelector(window.location.hash)?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, []);

  return (
    <main>
      {/* HERO */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
              <SparkIcon /> Energie • Economii • Comparator
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Verifică dacă factura ta de energie poate fi optimizată
            </h2>
            <p className="mt-5 text-lg text-slate-200 max-w-xl">
              Introdu consumul, furnizorul actual, zona de distribuție și costul facturii. Primești o estimare orientativă și poți cere o analiză personalizată.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a href="#calculator" className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 shadow-lg hover:bg-emerald-400 transition text-center">
                Verifică factura acum
              </a>
              <a href="#contact" className="rounded-2xl border border-white/20 px-6 py-3 font-semibold hover:bg-white/10 transition text-center">
                Cere analiză gratuită
              </a>
            </div>
            <div className="mt-8 hidden sm:grid gap-3 sm:grid-cols-3 max-w-xl">
              <HeroBadge icon="leaf" title="Energie verde" />
              <HeroBadge icon="chart" title="Estimare rapidă" />
              <HeroBadge icon="shield" title="Date protejate" />
            </div>
          </div>

          {/* Card hero - static exemplu */}
          <div className="relative overflow-hidden rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-100 opacity-60" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-sky-100 opacity-60" />
            <div className="relative mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Exemplu analiză</p>
                <h3 className="text-2xl font-bold">Economii potențiale</h3>
              </div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">orientativ</div>
            </div>
            <div className="relative grid gap-3">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Consum lunar</p><p className="text-2xl font-bold">285 kWh</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Factură introdusă</p><p className="text-2xl font-bold">330 RON</p></div>
              <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
                <p className="text-sm font-semibold text-emerald-700">Rezultat posibil</p>
                <p className="mt-1 text-sm text-slate-700">Estimarea comparativă indică o diferență de +50 RON/lună față de oferta orientativă.</p>
              </div>
            </div>
            {/* Săgeată spre calculator */}
            <div className="relative mt-4 text-center">
              <a href="#calculator" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-500 transition">
                Completează calculatorul pentru rezultatul tău real
                <span className="text-lg">↓</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="calculator" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-2 items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Calculator factură energie</p>
            <h3 className="mt-3 text-3xl font-bold">Compară costul actual cu o estimare orientativă</h3>
            <p className="mt-4 text-slate-600 max-w-xl">Completează câmpurile de mai jos. Rezultatul apare automat după ce introduci consumul și valoarea facturii.</p>
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <AdvancedCalculator onCalculationChange={setCalculation} />
            </div>
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

      {/* GHIDURI */}
      <section id="ghiduri" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Ghiduri utile</p>
            <h3 className="mt-3 text-3xl font-bold">Învață să verifici factura de energie</h3>
          </div>
          <a href="/rss.xml" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border-2 border-amber-400 bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-700 hover:bg-amber-100 transition shadow-sm">
            <RssIcon /> Abonează-te via RSS
          </a>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <article key={article.slug} className="flex flex-col rounded-3xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-lg transition">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">ghid</span>
                <span className="text-xs text-slate-500">{article.readTime}</span>
              </div>
              <h4 className="text-xl font-bold leading-snug flex-1">{article.title}</h4>
              <p className="mt-3 text-slate-600 text-sm flex-1">{article.excerpt}</p>
              <button onClick={() => navigate(`/articole/${article.slug}`)}
                className="mt-5 inline-block rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition self-start">
                Citește ghidul →
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* FURNIZORI */}
      <section id="furnizori" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Furnizori energie
          </p>
          <h3 className="mt-3 text-3xl font-bold">
            Compară furnizorii de energie electrică
          </h3>
          <p className="mt-2 text-slate-600">
            Vezi pagini dedicate pentru furnizori, cu preț orientativ, ofertă și estimare de factură.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {supplierOffers.slice(0, 18).map((supplier) => (
            <button
              key={supplier.id}
              onClick={() => navigate(`/furnizori/${supplier.id}`)}
              className="rounded-2xl bg-white p-5 text-left border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition"
            >
              <p className="font-bold text-slate-900">{supplier.name}</p>
              <p className="mt-1 text-sm text-slate-600">{supplier.offerName}</p>
              <p className="mt-3 text-sm font-semibold text-emerald-700">
                {money(supplier.prices.household)} RON/kWh
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* ȘTIRI & NOUTĂȚI */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-slate-900">Știri & Noutăți</h3>
          <p className="mt-2 text-slate-600">Ultimele actualizări din domeniul energiei electrice în România.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {newsFeed.map((item, i) => (
            <button key={i} onClick={() => navigate(`/stiri/${item.slug}`)}
              className="block rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition text-left">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                  item.category === "TARIFE" ? "bg-blue-100 text-blue-700" :
                  item.category === "LEGISLAȚIE" ? "bg-purple-100 text-purple-700" :
                  item.category === "E-FACTURA" ? "bg-red-100 text-red-700" :
                  item.category === "GHID" ? "bg-emerald-100 text-emerald-700" :
                  item.category === "ANRE" ? "bg-sky-100 text-sky-700" :
                  item.category === "FURNIZORI" ? "bg-amber-100 text-amber-700" :
                  "bg-slate-100 text-slate-700"
                }`}>{item.category}</span>
                <span className="text-sm text-slate-500">{item.date}</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 leading-snug">{item.title}</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.excerpt}</p>
              <p className="mt-3 text-xs text-emerald-600 font-semibold">Sursa: {item.source} →</p>
            </button>
          ))}
        </div>
      </section>

      <ContactSection calculation={calculation} />
    </main>
  );
}

/* =====================================================
   CONTACT
   ===================================================== */
function ContactSection({ calculation }) {
  return (
    <section id="contact" className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.28),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(34,197,94,0.18),transparent_30%),linear-gradient(135deg,#020617,#0f172a_45%,#064e3b)]" />
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">Asistență clienți</p>
            <h3 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">Cere verificarea facturii tale de energie</h3>
            <p className="mt-5 text-slate-300 leading-7 max-w-xl">Completează formularul, iar solicitarea va include automat și estimarea calculată. Nu introduce date sensibile precum CNP, serie act, IBAN sau parole.</p>
            <div className="mt-8 grid gap-4 max-w-xl">
              <div className="rounded-3xl bg-white/10 p-5 border border-white/10 backdrop-blur">
                <p className="font-semibold text-white">Ce poți solicita?</p>
                <ul className="mt-3 list-disc pl-5 text-sm text-slate-300 space-y-1">
                  <li>verificarea orientativă a unei facturi;</li>
                  <li>explicații despre diferențele față de estimare;</li>
                  <li>clarificări privind consum, abonament sau regularizare;</li>
                  <li>pași recomandați pentru comparația ofertelor.</li>
                </ul>
              </div>
              <div className="rounded-3xl bg-emerald-400/10 p-5 border border-emerald-300/20 backdrop-blur">
                <p className="font-semibold text-white">Contact oficial</p>
                <p className="mt-2 text-sm text-slate-300">Email: <a href="mailto:contact@verificafactura.ro" className="font-semibold text-emerald-200 underline underline-offset-4 hover:text-white">contact@verificafactura.ro</a></p>
              </div>
            </div>
          </div>
          <div className="rounded-[2rem] bg-white/95 p-4 md:p-6 shadow-2xl shadow-emerald-950/30 ring-1 ring-white/20">
            <LeadForm calculation={calculation} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   CALCULATOR
   ===================================================== */
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

    const recommendation = monthlyDifference > 50
      ? "Factura ta pare semnificativ peste estimarea orientativă. Merită verificată oferta, abonamentul, perioada facturată și eventualele regularizări."
      : monthlyDifference > 20
      ? "Factura este peste estimare. Ar putea exista spațiu de optimizare prin ofertă, abonament sau consum."
      : monthlyDifference < -15
      ? "Factura introdusă este sub estimarea orientativă. Verifică dacă ai plafonări, compensări, regularizări negative sau o ofertă foarte bună."
      : "Factura pare apropiată de estimarea orientativă. Poți verifica în continuare abonamentul, oferta și istoricul consumului.";

    return { kwh, clientType, locationType, invoiceType, hasSubscription, changedSupplier, supplierName: selectedSupplier.name, zoneName: selectedZone.name, selectedEnergyPrice, selectedEnergySource: selectedSupplier.source, selectedUpdatedAt: selectedSupplier.updatedAt, cheapestOffer, currentBill: bill, activeEnergy, distribution, transportTG, transportTL, systemServices, greenCertificates, cogeneration, cfd, excise, subscription, vat, estimatedMonthly, monthlyDifference, annualDifference, recommendation, warnings };
  }, [consumption, currentBill, clientType, locationType, invoiceType, hasSubscription, changedSupplier, supplierId, zoneId, validationErrors]);

  useEffect(() => { onCalculationChange(result); }, [result, onCalculationChange]);

  const estimateByProfile = (profile) => {
    const profiles = { smallApartment: 150, apartment: 300, house: 600, commercial: 900 };
    setConsumption(profiles[profile] || 250);
    if (profile === "house") setLocationType("house");
    if (profile === "commercial") { setLocationType("commercial"); setClientType("nonhousehold"); }
  };

  return (
    <div>
      {/* Profile rapide */}
      <div className="mb-6 rounded-2xl bg-slate-50 p-4 border border-slate-200">
        <p className="text-sm font-semibold text-slate-800">Nu știi consumul?</p>
        <p className="mt-1 text-sm text-slate-600">Alege un profil orientativ și ajustează după aceea.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <QuickButton onClick={() => estimateByProfile("smallApartment")}>Apartament mic ~150 kWh</QuickButton>
          <QuickButton onClick={() => estimateByProfile("apartment")}>Apartament 2-3 camere ~300 kWh</QuickButton>
          <QuickButton onClick={() => estimateByProfile("house")}>Casă ~600 kWh</QuickButton>
          <QuickButton onClick={() => estimateByProfile("commercial")}>Spațiu comercial ~900 kWh</QuickButton>
        </div>
      </div>

      {/* Câmpuri principale */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Consum lunar estimat (kWh)" hint="Îl găsești pe factură. Poți începe cu o estimare.">
          <input type="number" value={consumption} onChange={(e) => setConsumption(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" placeholder="Ex: 300" />
        </Field>
        <Field label="Furnizor / ofertă orientativă" hint="Selectează oferta față de care vrei comparația.">
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
            {supplierOffers.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.offerName}{s.green > 0 ? ` (${s.green}% verde)` : ""}</option>)}
          </select>
        </Field>
        <Field label="Zonă distribuție" hint="Afectează componenta de distribuție a facturii.">
          <select value={zoneId} onChange={(e) => setZoneId(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
            {distributionZones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
        </Field>
        <Field label="Valoare factură actuală (RON)" hint="Introdu totalul de plată, nu doar energia activă.">
          <input type="number" value={currentBill} onChange={(e) => setCurrentBill(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" placeholder="Ex: 300" />
        </Field>
      </div>

      {/* Opțiuni avansate */}
      <button type="button" onClick={() => setShowAdvanced(v => !v)}
        className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition">
        <span className={`transition-transform ${showAdvanced ? "rotate-90" : ""}`}>▶</span>
        {showAdvanced ? "Ascunde opțiunile avansate" : "Opțiuni avansate (tip client, factură, abonament)"}
      </button>

      {showAdvanced && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 rounded-2xl bg-slate-50 p-4 border border-slate-200">
          <Field label="Tip client" hint="Alege categoria de consum aplicabilă facturii.">
            <select value={clientType} onChange={(e) => setClientType(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500">
              <option value="household">Casnic</option>
              <option value="nonhousehold">Noncasnic</option>
            </select>
          </Field>
          <Field label="Tip loc de consum" hint="Ajută la interpretarea consumului.">
            <select value={locationType} onChange={(e) => setLocationType(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500">
              <option value="apartment">Apartament</option>
              <option value="house">Casă</option>
              <option value="commercial">Spațiu comercial</option>
            </select>
          </Field>
          <Field label="Tip factură" hint="Facturile estimate sau regularizările pot explica diferențe mari.">
            <select value={invoiceType} onChange={(e) => setInvoiceType(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500">
              <option value="unknown">Nu știu</option>
              <option value="real">Consum real</option>
              <option value="estimated">Estimată</option>
              <option value="regularization">Regularizare</option>
            </select>
          </Field>
          <Field label="Oferta include abonament?" hint="Abonamentul poate crește factura, mai ales la consum mic.">
            <select value={hasSubscription} onChange={(e) => setHasSubscription(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500">
              <option value="unknown">Nu știu</option>
              <option value="yes">Da</option>
              <option value="no">Nu</option>
            </select>
          </Field>
          <Field label="Ai schimbat furnizorul în ultimele 6 luni?" hint="Poate indica regularizări sau perioade de tranziție.">
            <select value={changedSupplier} onChange={(e) => setChangedSupplier(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500">
              <option value="no">Nu</option>
              <option value="yes">Da</option>
            </select>
          </Field>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700 border border-red-100">
          <p className="font-semibold">Verifică datele introduse:</p>
          <ul className="mt-2 list-disc pl-5">{validationErrors.map((err) => <li key={err}>{err}</li>)}</ul>
        </div>
      )}

      {result && <CalculatorResult result={result} />}
    </div>
  );
}

/* =====================================================
   REZULTATE CALCULATOR
   ===================================================== */
function CalculatorResult({ result }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="mt-6 grid gap-4">
      {/* Estimare lunară */}
      <div className="rounded-2xl bg-emerald-50 p-5 border border-emerald-100">
        <p className="text-sm font-medium text-emerald-700">Estimare lunară</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">{money(result.estimatedMonthly)} RON</p>
        <p className="mt-2 text-sm text-slate-600">Furnizor: {result.supplierName} • Zonă: {result.zoneName}</p>
        <p className="mt-1 text-xs text-slate-500">Preț energie activă: {money(result.selectedEnergyPrice)} RON/kWh • Sursă: {result.selectedEnergySource} • {result.selectedUpdatedAt}</p>
      </div>

      {/* Diferență */}
      <div className={result.monthlyDifference > 0 ? "rounded-2xl bg-amber-50 p-5 border border-amber-100" : "rounded-2xl bg-slate-50 p-5 border border-slate-200"}>
        <p className="text-sm font-medium text-slate-700">Diferență față de factura introdusă</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{result.monthlyDifference >= 0 ? "+" : ""}{money(result.monthlyDifference)} RON / lună</p>
        <p className="mt-1 text-lg font-semibold text-slate-800">{result.annualDifference >= 0 ? "+" : ""}{money(result.annualDifference)} RON / an</p>
        <p className="mt-3 text-sm text-slate-700">{result.recommendation}</p>
      </div>

      {/* Cel mai ieftin furnizor */}
      {result.cheapestOffer && (
        <div className="rounded-2xl bg-lime-50 p-5 border border-lime-100">
          <p className="text-sm font-medium text-lime-700">Cel mai ieftin furnizor din lista orientativă</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{result.cheapestOffer.name}</p>
          <p className="mt-2 text-sm text-slate-700">Estimare lunară: <strong>{money(result.cheapestOffer.monthlyTotal)} RON</strong></p>
          <p className="mt-1 text-xs text-slate-500">Sursă: {result.cheapestOffer.source} • {result.cheapestOffer.updatedAt}</p>
        </div>
      )}

      {/* Avertizări */}
      {result.warnings.length > 0 && (
        <div className="rounded-2xl bg-sky-50 p-5 border border-sky-100">
          <p className="font-semibold text-slate-900">Aspecte de verificat</p>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-1">
            {result.warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Structură cost — acordeon */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <button type="button" onClick={() => setShowDetails(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition">
          <span className="font-semibold text-slate-900">Structură estimativă cost</span>
          <span className="text-slate-500 text-sm">{showDetails ? "▲ Ascunde" : "▼ Vezi detalii calcul"}</span>
        </button>
        {showDetails && (
          <div className="px-5 pb-5 grid gap-2 text-sm text-slate-600 border-t border-slate-100">
            <div className="pt-3" />
            <CostRow label="Energie activă" value={result.activeEnergy} />
            <CostRow label="Distribuție" value={result.distribution} />
            <CostRow label="Transport — introducere rețea (TG)" value={result.transportTG} />
            <CostRow label="Transport — extragere rețea (TL)" value={result.transportTL} />
            <CostRow label="Servicii sistem" value={result.systemServices} />
            <CostRow label="Certificate verzi" value={result.greenCertificates} />
            <CostRow label="Cogenerare" value={result.cogeneration} />
            <CostRow label="Componentă CFD" value={result.cfd} />
            <CostRow label="Acciză" value={result.excise} />
            <CostRow label="Abonament" value={result.subscription} />
            <CostRow label="TVA (21%)" value={result.vat} />
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Estimările afișate sunt orientative și nu reprezintă ofertă comercială. Prețurile pot varia în funcție de ofertă, locație, perioadă și condițiile contractuale. Pentru comparații oficiale, consultă comparatorul ANRE/POSF și oferta contractuală a furnizorului.
      </p>
    </div>
  );
}

/* =====================================================
   FORMULAR LEAD
   ===================================================== */
function LeadForm({ calculation }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); setSending(true); setError("");

    const payload = {
      nume: e.target.nume.value,
      email: e.target.email.value,
      telefon: e.target.telefon?.value || "",
      mesaj: e.target.mesaj.value,
    };

    if (calculation) {
      payload.consum_kwh = calculation.kwh;
      payload.tip_client = calculation.clientType === "nonhousehold" ? "Noncasnic" : "Casnic";
      payload.tip_loc_consum = formatLocationType(calculation.locationType);
      payload.tip_factura = formatInvoiceType(calculation.invoiceType);
      payload.abonament = formatYesNoUnknown(calculation.hasSubscription);
      payload.schimbat_recent_furnizor = calculation.changedSupplier === "yes" ? "Da" : "Nu";
      payload.furnizor_oferta = calculation.supplierName;
      payload.zona_distributie = calculation.zoneName;
      payload.factura_actuala_ron = money(calculation.currentBill);
      payload.estimare_lunara_ron = money(calculation.estimatedMonthly);
      payload.diferenta_lunara_ron = money(calculation.monthlyDifference);
      payload.diferenta_anuala_ron = money(calculation.annualDifference);
      payload.recomandare = calculation.recommendation;
      payload.aspecte_de_verificat = calculation.warnings.join(" | ") || "N/A";
    }

    try {
      await fetch("https://script.google.com/macros/s/AKfycbx7dwfSTNQuIByxmUWw0Srx80Yhc7Hu97kqY-A82j2KbxWdMJ-xADyLt9cqn296_f3wpg/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSent(true);
    } catch { setError("Cererea nu a putut fi trimisă. Verifică conexiunea și încearcă din nou."); }
    finally { setSending(false); }
  };

  if (sent) return (
    <div className="rounded-3xl bg-white p-8 text-slate-900">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">✔</div>
      <p className="mt-5 text-green-700 text-xl font-bold">Cererea a fost trimisă cu succes!</p>
      <p className="mt-2 text-slate-600">Am primit datele și estimarea calculată. Revenim cu o analiză în cel mai scurt timp.</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-[1.5rem] bg-white p-6 md:p-8 text-slate-900">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Formular analiză</p>
        <h4 className="mt-2 text-2xl md:text-3xl font-bold">Trimite datele pentru verificare</h4>
        <p className="mt-2 text-sm text-slate-500">Câmpurile marcate cu <span className="text-red-500 font-bold">*</span> sunt obligatorii.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Nume" required>
          <input name="nume" required className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition" placeholder="Numele tău" />
        </FormField>
        <FormField label="Email" required>
          <input type="email" name="email" required className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition" placeholder="email@exemplu.ro" />
        </FormField>
        {/* TELEFON - opțional */}
        <FormField label="Telefon" required={false}>
          <input name="telefon" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition" placeholder="07xx xxx xxx (opțional)" />
        </FormField>
        <div className="md:col-span-2">
          <FormField label="Mesaj" required>
            <textarea name="mesaj" required className="min-h-[130px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition" placeholder="Scrie aici câteva detalii despre factura sau consumul tău" />
          </FormField>
        </div>

        {calculation && (
          <div className="md:col-span-2 rounded-3xl bg-gradient-to-br from-slate-50 to-emerald-50 p-5 text-sm text-slate-700 border border-emerald-100">
            <p className="font-bold text-slate-900">Se va transmite și estimarea calculată:</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <p>Consum: <strong>{calculation.kwh} kWh</strong></p>
              <p>Tip client: <strong>{calculation.clientType === "nonhousehold" ? "Noncasnic" : "Casnic"}</strong></p>
              <p>Tip loc consum: <strong>{formatLocationType(calculation.locationType)}</strong></p>
              <p>Tip factură: <strong>{formatInvoiceType(calculation.invoiceType)}</strong></p>
              <p>Furnizor: <strong>{calculation.supplierName}</strong></p>
              <p>Zonă: <strong>{calculation.zoneName}</strong></p>
              <p>Preț energie activă: <strong>{money(calculation.selectedEnergyPrice)} RON/kWh</strong></p>
              <p>Factură actuală: <strong>{money(calculation.currentBill)} RON</strong></p>
              <p>Estimare: <strong>{money(calculation.estimatedMonthly)} RON / lună</strong></p>
              <p>Diferență: <strong>{money(calculation.monthlyDifference)} RON / lună</strong></p>
            </div>
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-800">GDPR <span className="text-red-500">*</span></label>
          <label className="mt-2 flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 border border-slate-200 hover:border-emerald-200 transition cursor-pointer">
            <input type="checkbox" name="gdpr" required value="acceptat" className="mt-1 h-4 w-4 rounded border-slate-300 accent-emerald-500" />
            <span>Sunt de acord cu prelucrarea datelor transmise prin formular pentru analizarea solicitării mele. Am înțeles că estimarea este orientativă și că pot solicita ștergerea datelor.</span>
          </label>
        </div>

        {error && <div className="md:col-span-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700 border border-red-100">{error}</div>}

        <button type="submit" disabled={sending}
          className="md:col-span-2 rounded-2xl bg-emerald-500 px-6 py-4 font-bold text-slate-950 hover:bg-emerald-400 transition disabled:opacity-60 shadow-lg shadow-emerald-500/20">
          {sending ? "Se trimite..." : "Trimite cererea"}
        </button>
      </div>
    </form>
  );
}

/* =====================================================
   PAGINI FURNIZORI
   ===================================================== */
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

  const subtotal =
    activeEnergy +
    distribution +
    transportTG +
    transportTL +
    systemServices +
    greenCertificates +
    cogeneration +
    cfd +
    excise +
    supplier.subscription;

  const total = subtotal + subtotal * regulatedCosts.vat;

  return (
    <main className="bg-white">
      <section className="bg-gradient-to-br from-slate-900 to-emerald-900 text-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <button
            onClick={() => navigate("/")}
            className="mb-8 rounded-2xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition"
          >
            ← Înapoi la calculator
          </button>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Furnizor energie electrică
          </p>

          <h2 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">
            {supplier.name} - preț energie și estimare factură 2026
          </h2>

          <p className="mt-6 text-lg text-slate-200 max-w-3xl">
            Pagina prezintă o estimare orientativă pentru oferta {supplier.offerName || "selectată"}.
            Valorile sunt informative și trebuie verificate în comparatorul oficial POSF/ANRE și în oferta contractuală.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-emerald-50 p-6 border border-emerald-100">
            <p className="text-sm font-semibold text-emerald-700">Preț energie activă</p>
            <p className="mt-2 text-3xl font-bold">{money(supplier.prices.household)} RON/kWh</p>
            <p className="mt-2 text-xs text-slate-500">Client casnic</p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200">
            <p className="text-sm font-semibold text-slate-700">Ofertă</p>
            <p className="mt-2 text-xl font-bold">{supplier.offerName || "Ofertă orientativă"}</p>
            <p className="mt-2 text-xs text-slate-500">Sursă: {supplier.source}</p>
          </div>

          <div className="rounded-3xl bg-lime-50 p-6 border border-lime-100">
            <p className="text-sm font-semibold text-lime-700">Energie verde</p>
            <p className="mt-2 text-3xl font-bold">{supplier.green}%</p>
            <p className="mt-2 text-xs text-slate-500">Conform datelor introduse</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 border border-slate-200 shadow-sm">
          <h3 className="text-2xl font-bold">Estimare factură pentru 250 kWh/lună</h3>
          <p className="mt-2 text-slate-600">
            Exemplu calculat pentru zona Muntenia / București-Ilfov, client casnic, consum lunar de 250 kWh.
          </p>

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

          <div className="mt-6 rounded-2xl bg-emerald-50 p-5 border border-emerald-100">
            <p className="text-sm font-semibold text-emerald-700">Total estimat</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{money(total)} RON/lună</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-slate-900 p-6 text-white">
          <h3 className="text-2xl font-bold">Merită {supplier.name}?</h3>
          <p className="mt-3 text-slate-300 leading-7">
            {supplier.name} poate fi o opțiune de analizat dacă prețul energiei active și condițiile contractuale
            sunt potrivite pentru consumul tău. Compară întotdeauna costul total, nu doar prețul pe kWh.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/#calculator")}
              className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 hover:bg-emerald-400 transition"
            >
              Calculează factura ta
            </button>

            <a
              href="https://posf.ro/comparator?comparatorType=electric"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/20 px-6 py-3 font-semibold text-center hover:bg-white/10 transition"
            >
              Verifică în POSF/ANRE
            </a>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Estimarea este orientativă. Prețurile, tarifele și condițiile contractuale pot varia. Pentru informații oficiale,
          consultă oferta furnizorului și comparatorul POSF/ANRE. Actualizat la: {supplier.updatedAt}.
        </p>
      </section>
    </main>
  );
}

/* =====================================================
   PAGINI ARTICOLE / LEGALE
   ===================================================== */
function ArticlePage({ article, navigate }) {
  return (
    <main className="bg-white">
      <section className="bg-gradient-to-br from-slate-900 to-emerald-900 text-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <button onClick={() => navigate("/#ghiduri")} className="mb-8 rounded-2xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition">← Înapoi la ghiduri</button>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">Ghid energie • {article.readTime}</p>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">{article.title}</h2>
          <p className="mt-6 text-lg text-slate-200">{article.intro}</p>
        </div>
      </section>
      <article className="mx-auto max-w-4xl px-6 py-14">
        <div className="space-y-8 text-slate-700 leading-8">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h3 className="text-2xl font-bold text-slate-900">{section.heading}</h3>
              <p className="mt-3">{section.body}</p>
            </section>
          ))}
        </div>
        <div className="mt-12 rounded-3xl bg-emerald-50 p-6 border border-emerald-100">
          <p className="font-semibold text-slate-900">Vrei să vezi dacă factura ta poate fi optimizată?</p>
          <p className="mt-2 text-sm text-slate-600">Folosește calculatorul și cere o analiză gratuită.</p>
          <button onClick={() => navigate("/#calculator")} className="mt-5 rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 hover:bg-emerald-400 transition">Verifică factura cu calculatorul</button>
        </div>
      </article>
    </main>
  );
}

function LegalPage({ page, navigate }) {
  return (
    <main className="bg-white">
      <section className="bg-gradient-to-br from-slate-900 to-emerald-900 text-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <button onClick={() => navigate("/")} className="mb-8 rounded-2xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition">← Înapoi la site</button>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">Informații legale</p>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">{page.title}</h2>
          <p className="mt-6 text-lg text-slate-200">{page.intro}</p>
        </div>
      </section>
      <article className="mx-auto max-w-4xl px-6 py-14">
        <div className="rounded-3xl bg-amber-50 border border-amber-100 p-6 mb-10">
          <p className="font-semibold text-amber-900">Notă importantă</p>
          <p className="mt-2 text-sm text-amber-900/80">Aceste texte sunt un model de lucru. Înainte de lansarea oficială, este recomandată verificarea de către un specialist juridic/GDPR.</p>
        </div>
        <div className="space-y-8 text-slate-700 leading-8">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h3 className="text-2xl font-bold text-slate-900">{section.heading}</h3>
              <p className="mt-3">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}

/* =====================================================
   FOOTER
   ===================================================== */
function Footer({ navigate }) {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Verifică Factura</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">Platformă informativă pentru verificarea orientativă a facturilor de energie. Estimările nu reprezintă ofertă comercială, recomandare contractuală finală sau garanție de economie.</p>
        </div>
        <div>
          <p className="font-semibold text-white">Informații legale</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <button onClick={() => navigate("/confidentialitate")} className="text-left hover:text-white transition">Confidențialitate</button>
            <button onClick={() => navigate("/termeni")} className="text-left hover:text-white transition">Termeni</button>
            <button onClick={() => navigate("/disclaimer")} className="text-left hover:text-white transition">Disclaimer</button>
            <button onClick={() => navigate("/cookies")} className="text-left hover:text-white transition">Cookies</button>
          </div>
        </div>
        <div className="md:text-right">
          <p className="font-semibold text-white">Resurse</p>
          <div className="mt-3 flex flex-col gap-2 text-sm md:items-end">
            <a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white transition">
              <RssIcon /> RSS Feed
            </a>
            <a href="https://posf.ro/comparator?comparatorType=electric" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Comparator POSF/ANRE</a>
            <a href="https://anre.ro" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">ANRE</a>
          </div>
          <p className="mt-4 text-xs text-slate-500">© {new Date().getFullYear()} Verifică Factura. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
}

/* =====================================================
   COMPONENTE MICI
   ===================================================== */
function QuickButton({ children, onClick }) {
  return <button type="button" onClick={onClick} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-100 transition">{children}</button>;
}
function Field({ label, hint, children }) {
  return <div><label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>{children}{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}</div>;
}
function CostRow({ label, value }) {
  return <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2"><span>{label}</span><strong className="text-slate-900">{money(value)} RON</strong></div>;
}
function FormField({ label, required, children }) {
  return <div><RequiredLabel required={required}>{label}</RequiredLabel><div className="mt-2">{children}</div></div>;
}
function RequiredLabel({ children, required = true }) {
  return <label className="block text-sm font-semibold text-slate-800">{children} {required && <span className="text-red-500">*</span>}</label>;
}
function InfoCard({ title, text }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200"><SparkIcon /></div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-slate-300">{text}</p>
    </div>
  );
}
function HeroBadge({ icon, title }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 backdrop-blur">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-200">
        {icon === "leaf" ? <LeafIcon /> : icon === "shield" ? <ShieldIcon /> : <ChartIcon />}
      </span>
      <span>{title}</span>
    </div>
  );
}

/* SVG Icons */
function SparkIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" /></svg>; }
function LeafIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 4c-7 0-12 5-12 12 0 2 1 4 3 4 7 0 9-9 9-16Z" /><path d="M4 20c4-6 8-9 16-16" /></svg>; }
function ChartIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 15 4-4 3 3 5-7" /></svg>; }
function ShieldIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-5" /></svg>; }
function RssIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" /></svg>; }

/* Newsletter Form */
function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    try {
      await fetch("https://script.google.com/macros/s/AKfycbx7dwfSTNQuIByxmUWw0Srx80Yhc7Hu97kqY-A82j2KbxWdMJ-xADyLt9cqn296_f3wpg/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nume: "Newsletter", email: email, mesaj: "Abonare newsletter", tip_client: "Newsletter" }),
      });
      setSent(true);
    } catch { }
    finally { setSending(false); }
  };

  if (sent) return <p className="mt-6 text-emerald-700 font-semibold">✔ Te-ai abonat cu succes! Vei primi notificări când apar noutăți.</p>;

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-900"
        placeholder="Adresa ta de email" />
      <button type="submit" disabled={sending}
        className="rounded-2xl bg-emerald-500 px-6 py-3 font-bold text-slate-950 hover:bg-emerald-400 transition disabled:opacity-60 shadow-lg shadow-emerald-500/20 whitespace-nowrap">
        {sending ? "Se trimite..." : "Abonează-mă"}
      </button>
    </form>
  );
}

/* Helpers */
function money(value) { return Number(value || 0).toFixed(2); }
function formatLocationType(value) { if (value === "house") return "Casă"; if (value === "commercial") return "Spațiu comercial"; return "Apartament"; }
function formatInvoiceType(value) { if (value === "real") return "Consum real"; if (value === "estimated") return "Estimată"; if (value === "regularization") return "Regularizare"; return "Nu știu"; }
function formatYesNoUnknown(value) { if (value === "yes") return "Da"; if (value === "no") return "Nu"; return "Nu știu"; }
