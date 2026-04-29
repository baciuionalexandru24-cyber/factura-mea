import React, { useEffect, useMemo, useState } from "react";
import furnizori from "./data/furnizori.json";

/* =====================================================
   DATA - ulterior se pot muta în src/data/*.js
   ===================================================== */

const supplierOffers = Object.entries(furnizori).map(([name, prices]) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, ""),
  name,
  prices: {
    household: Number(prices.casnic || 0),
    nonhousehold: Number(prices.noncasnic || prices.casnic || 0),
  },
  subscription: Number(prices.abonament || 0),
  source: prices.sursa || "estimare internă",
  updatedAt: prices.actualizatLa || "necunoscut",
  description: prices.descriere || "Ofertă orientativă pentru comparație rapidă.",
}));

const distributionZones = [
  { id: "muntenia", name: "Muntenia / București-Ilfov", distributionTariff: 0.28 },
  { id: "transilvania", name: "Transilvania", distributionTariff: 0.31 },
  { id: "moldova", name: "Moldova", distributionTariff: 0.33 },
  { id: "oltenia", name: "Oltenia", distributionTariff: 0.3 },
  { id: "banat", name: "Banat", distributionTariff: 0.29 },
  { id: "dobrogea", name: "Dobrogea", distributionTariff: 0.32 },
];

const regulatedCosts = {
  transport: 0.07,
  systemServices: 0.02,
  greenCertificates: 0.08,
  cogeneration: 0.03,
  excise: 0.01,
  vat: 0.19,
};

const articles = [
  {
    slug: "cum-reduci-factura-energie-2026",
    title: "Cum să îți reduci factura la energie în 2026",
    excerpt: "Pași practici pentru consum, oferte, contract și verificarea costurilor care pot fi optimizate.",
    readTime: "6 min",
    metaDescription: "Ghid practic pentru reducerea facturii la energie: consum, oferte, abonamente, regularizări și verificarea costurilor.",
    intro: "Reducerea facturii începe cu înțelegerea consumului și a contractului. Nu este suficient să te uiți doar la totalul de plată.",
    sections: [
      { heading: "1. Verifică mai întâi consumul în kWh", body: "Compară consumul lunar în kWh cu lunile anterioare și cu aceeași lună din anul trecut." },
      { heading: "2. Compară oferta actuală cu ofertele disponibile", body: "Prețul energiei active este componenta unde furnizorii pot avea oferte diferite. Uită-te la costul final estimat, nu doar la prețul energiei active." },
      { heading: "3. Uită-te la abonamentul lunar", body: "Unele oferte par bune la prețul pe kWh, dar includ abonament lunar. Pentru consumuri mici, abonamentul poate conta mult." },
      { heading: "4. Verifică perioada facturată", body: "Factura poate părea mai mare dacă acoperă o perioadă mai lungă sau include regularizări." },
      { heading: "5. Redu consumul aparatelor mari", body: "Aerul condiționat, boilerul electric, uscătorul, cuptorul electric și frigiderul pot influența mult factura." },
    ],
  },
  {
    slug: "cum-se-calculeaza-factura-energie",
    title: "Cum se calculează factura la energie electrică",
    excerpt: "Explicație simplă despre energie activă, distribuție, transport, taxe, contribuții și TVA.",
    readTime: "7 min",
    metaDescription: "Află cum se calculează factura la energie electrică: energie activă, distribuție, transport, certificate verzi, cogenerare, acciză și TVA.",
    intro: "Factura de energie electrică nu este formată doar din prețul energiei. Totalul include mai multe componente.",
    sections: [
      { heading: "1. Energia activă", body: "Energia activă este componenta comercială a facturii: energia consumată înmulțită cu prețul din ofertă sau contract." },
      { heading: "2. Distribuția", body: "Distribuția reprezintă costul utilizării rețelei locale prin care energia ajunge la locul de consum." },
      { heading: "3. Transportul și serviciile de sistem", body: "Transportul acoperă utilizarea rețelei naționale, iar serviciile de sistem susțin funcționarea sigură a sistemului energetic." },
      { heading: "4. Certificate verzi și cogenerare", body: "Factura poate include componente aferente schemelor de sprijin." },
      { heading: "5. Acciză, abonament și TVA", body: "Acciza și TVA-ul sunt elemente fiscale, iar unele oferte includ abonament lunar." },
    ],
  },
  {
    slug: "ce-aparate-consuma-cel-mai-mult-curent",
    title: "Ce aparate consumă cel mai mult curent în casă",
    excerpt: "Ghid practic despre marii consumatori din locuință și cum reduci consumul fără investiții mari.",
    readTime: "5 min",
    metaDescription: "Vezi ce aparate consumă cel mai mult curent în casă și cum poți reduce consumul fără investiții mari.",
    intro: "Unele echipamente au impact mult mai mare asupra facturii, mai ales dacă sunt folosite des.",
    sections: [
      { heading: "1. Aerul condiționat", body: "Poate consuma mult dacă este setat la temperaturi foarte joase sau funcționează multe ore." },
      { heading: "2. Boilerul electric", body: "Este unul dintre cei mai mari consumatori dintr-o locuință." },
      { heading: "3. Cuptorul electric și plita electrică", body: "Au putere mare și pot genera consum semnificativ." },
      { heading: "4. Uscătorul și mașina de spălat", body: "Programele eco și încărcarea completă pot reduce consumul." },
      { heading: "5. Frigiderul și congelatorul", body: "Funcționează permanent, iar aparatele vechi pot consuma mult." },
    ],
  },
  {
    slug: "merita-sa-schimbi-furnizorul-de-energie",
    title: "Merită să schimbi furnizorul de energie?",
    excerpt: "Ce verifici înainte să schimbi furnizorul: preț, abonament, durată și condiții contractuale.",
    readTime: "6 min",
    metaDescription: "Află când merită să schimbi furnizorul de energie și ce trebuie să verifici înainte: preț, abonament, durată și condiții contractuale.",
    intro: "Schimbarea furnizorului poate aduce economii, dar trebuie făcută informat.",
    sections: [
      { heading: "1. Compară costul final", body: "Nu compara doar prețul pe kWh. Verifică totalul estimat pentru consumul tău." },
      { heading: "2. Verifică durata ofertei", body: "Unele oferte au preț valabil doar o perioadă." },
      { heading: "3. Analizează abonamentul", body: "Pentru consum mic, abonamentul lunar poate anula avantajul unui preț bun." },
      { heading: "4. Nu ignora calitatea serviciului", body: "Contează aplicația, facturarea, transmiterea indexului și suportul." },
      { heading: "5. Când merită să schimbi", body: "Dacă factura este constant mai mare decât estimările comparabile, merită analizată schimbarea." },
    ],
  },
  {
    slug: "de-ce-a-crescut-factura-la-energie",
    title: "De ce a crescut factura și ce poți verifica imediat",
    excerpt: "Cele mai frecvente cauze: consum, regularizare, modificare de preț sau abonament.",
    readTime: "5 min",
    metaDescription: "Factura la energie a crescut? Verifică rapid consumul, regularizările, perioada facturată, prețul și abonamentele.",
    intro: "O factură mai mare nu înseamnă întotdeauna că prețul energiei a crescut.",
    sections: [
      { heading: "1. Consum mai mare", body: "Verifică întâi consumul în kWh." },
      { heading: "2. Regularizare sau estimare", body: "Factura poate corecta diferența dintre consumul estimat și cel real." },
      { heading: "3. Perioadă facturată diferită", body: "Dacă perioada facturată este mai lungă, totalul poate părea mai mare." },
      { heading: "4. Schimbarea prețului", body: "Oferta poate expira sau prețul contractual se poate modifica." },
      { heading: "5. Abonamente și servicii", body: "Costurile suplimentare pot influența totalul anual." },
    ],
  },
  {
    slug: "cum-citesti-corect-factura-de-energie",
    title: "Cum citești corect o factură de energie electrică",
    excerpt: "Unde găsești consumul, prețul, perioada facturată și totalul de plată.",
    readTime: "6 min",
    metaDescription: "Ghid simplu pentru citirea facturii de energie: consum, preț, perioadă facturată, cod loc consum și total de plată.",
    intro: "Factura devine mai simplă dacă știi unde să te uiți.",
    sections: [
      { heading: "1. Identifică locul de consum", body: "Codurile de identificare sunt importante pentru verificări și schimbarea furnizorului." },
      { heading: "2. Verifică perioada facturată", body: "Compară consumul mediu zilnic, nu doar totalul." },
      { heading: "3. Uită-te la consumul în kWh", body: "Consumul este baza facturii." },
      { heading: "4. Separă prețul energiei de restul costurilor", body: "Factura include și distribuție, transport, taxe, contribuții și TVA." },
      { heading: "5. Verifică soldul anterior", body: "Totalul poate include sume restante sau regularizări." },
    ],
  },
];

const legalPages = [
  { path: "/confidentialitate", title: "Politică de confidențialitate", intro: "Această pagină explică modul în care sunt colectate și folosite datele transmise prin formularul de analiză.", metaDescription: "Politica de confidențialitate pentru Verifică Factura.", sections: [
    { heading: "1. Date colectate", body: "Prin formular putem colecta nume, email, telefon, informații despre consum, furnizor, zonă de distribuție, valoarea facturii și mesajul transmis voluntar." },
    { heading: "2. Scopul prelucrării", body: "Datele sunt folosite pentru a răspunde solicitării de verificare orientativă a facturii." },
    { heading: "3. Transmiterea datelor", body: "Datele sunt transmise prin serviciul Formspree către adresa de email asociată formularului." },
    { heading: "4. Păstrarea datelor", body: "Datele sunt păstrate doar atât timp cât este necesar pentru gestionarea solicitării." },
    { heading: "5. Drepturile utilizatorului", body: "Utilizatorul poate solicita accesul, rectificarea sau ștergerea datelor transmise." },
  ]},
  { path: "/termeni", title: "Termeni și condiții", intro: "Prin utilizarea site-ului, utilizatorul acceptă că informațiile afișate au caracter general și orientativ.", metaDescription: "Termeni și condiții pentru utilizarea site-ului Verifică Factura.", sections: [
    { heading: "1. Scopul site-ului", body: "Site-ul oferă informații generale și un calculator orientativ. Nu furnizează oferte comerciale ferme, consultanță juridică sau servicii reglementate." },
    { heading: "2. Caracter orientativ", body: "Rezultatele calculatorului sunt estimări bazate pe datele introduse și pe valori orientative." },
    { heading: "3. Responsabilitatea utilizatorului", body: "Utilizatorul trebuie să verifice informațiile înainte de a lua decizii contractuale, comerciale sau financiare." },
    { heading: "4. Limitarea răspunderii", body: "Administratorul site-ului nu răspunde pentru pierderi, costuri, decizii comerciale sau diferențe de facturare rezultate din folosirea informațiilor afișate." },
  ]},
  { path: "/disclaimer", title: "Disclaimer", intro: "Informațiile de pe site sunt furnizate exclusiv cu scop informativ și orientativ.", metaDescription: "Disclaimer privind caracterul orientativ al informațiilor și estimărilor de pe Verifică Factura.", sections: [
    { heading: "1. Nu este ofertă comercială", body: "Calculatorul și articolele nu reprezintă ofertă comercială, promisiune de economisire sau recomandare contractuală finală." },
    { heading: "2. Estimări, nu valori oficiale", body: "Valorile afișate sunt estimative și pot diferi de factura reală." },
    { heading: "3. Surse și verificare", body: "Utilizatorul trebuie să verifice informațiile în contract, factură și instrumentele oficiale." },
    { heading: "4. Fără răspundere pentru decizii", body: "Orice decizie luată pe baza informațiilor de pe site aparține exclusiv utilizatorului." },
  ]},
  { path: "/cookies", title: "Politică cookies", intro: "Această pagină descrie utilizarea cookie-urilor și a tehnologiilor similare.", metaDescription: "Politica de cookies pentru Verifică Factura.", sections: [
    { heading: "1. Cookie-uri esențiale", body: "Site-ul poate utiliza cookie-uri necesare pentru funcționarea tehnică." },
    { heading: "2. Analytics și marketing", body: "Dacă vor fi adăugate instrumente de analytics sau marketing, utilizatorii trebuie informați și, unde este necesar, trebuie cerut consimțământul." },
    { heading: "3. Gestionarea cookie-urilor", body: "Utilizatorul poate controla cookie-urile din setările browserului." },
  ]},
];

/* =====================================================
   APP + ROUTING SIMPLU
   ===================================================== */

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

  const articleMatch = path.startsWith("/articole/")
    ? articles.find((article) => `/articole/${article.slug}` === path)
    : null;
  const legalMatch = legalPages.find((page) => page.path === path);

  useEffect(() => {
    if (articleMatch) {
      setMeta(`${articleMatch.title} | Verifică Factura`, articleMatch.metaDescription);
    } else if (legalMatch) {
      setMeta(`${legalMatch.title} | Verifică Factura`, legalMatch.metaDescription);
    } else {
      setMeta(
        "Verifică Factura - Calculator factură energie",
        "Verifică orientativ factura de energie, compară costul actual cu o estimare și cere o analiză gratuită."
      );
    }
  }, [articleMatch, legalMatch]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header navigate={navigate} />
      {articleMatch ? (
        <ArticlePage article={articleMatch} navigate={navigate} />
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

  const goTo = (to) => {
    setMobileOpen(false);
    navigate(to);
  };

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg shadow-slate-900/10">
      <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
        <button onClick={() => goTo("/")} className="text-left">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Analiză factură energie</p>
          <h1 className="text-2xl font-bold">Verifică Factura</h1>
        </button>

        <nav className="hidden md:flex gap-6 text-sm text-slate-200">
          <button onClick={() => goTo("/#calculator")} className="hover:text-white">Calculator</button>
          <button onClick={() => goTo("/#ghiduri")} className="hover:text-white">Ghiduri</button>
          <button onClick={() => goTo("/#contact")} className="hover:text-white">Contact</button>
        </nav>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="md:hidden rounded-2xl border border-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/10 transition"
          aria-label="Deschide meniul"
        >
          {mobileOpen ? "Închide" : "Meniu"}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950 px-6 pb-5">
          <div className="mx-auto grid max-w-6xl gap-2 pt-4 text-sm">
            <button onClick={() => goTo("/#calculator")} className="rounded-2xl bg-white/5 px-4 py-3 text-left hover:bg-white/10 transition">Calculator</button>
            <button onClick={() => goTo("/#ghiduri")} className="rounded-2xl bg-white/5 px-4 py-3 text-left hover:bg-white/10 transition">Ghiduri</button>
            <button onClick={() => goTo("/#contact")} className="rounded-2xl bg-emerald-500 px-4 py-3 text-left font-semibold text-slate-950 hover:bg-emerald-400 transition">Cere analiză gratuită</button>
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
        <div className="mx-auto max-w-6xl px-6 py-20 grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
              <SparkIcon /> Energie • Economii • Comparator orientativ
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">Verifică dacă factura ta de energie poate fi optimizată</h2>
            <p className="mt-5 text-lg text-slate-200 max-w-xl">Introdu consumul, furnizorul actual, zona de distribuție și costul facturii. Primești o estimare orientativă și poți cere o analiză personalizată.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a href="#calculator" className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 shadow-lg hover:bg-emerald-400 transition">Verifică factura acum</a>
              <a href="#contact" className="rounded-2xl border border-white/20 px-6 py-3 font-semibold hover:bg-white/10 transition">Cere analiză gratuită</a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3 max-w-xl">
              <HeroBadge icon="leaf" title="Energie verde" />
              <HeroBadge icon="chart" title="Estimare rapidă" />
              <HeroBadge icon="shield" title="Date protejate" />
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-100" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-sky-100" />
            <div className="relative mb-4 flex items-center justify-between">
              <div><p className="text-sm font-medium text-emerald-700">Exemplu analiză</p><h3 className="text-2xl font-bold">Economii potențiale</h3></div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">orientativ</div>
            </div>
            <div className="relative grid gap-4">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Consum lunar</p><p className="text-2xl font-bold">285 kWh</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Factură introdusă</p><p className="text-2xl font-bold">330 RON</p></div>
              <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100"><p className="text-sm font-semibold text-emerald-700">Rezultat posibil</p><p className="mt-1 text-sm text-slate-700">Dacă estimarea comparativă este sub factura actuală, merită verificată oferta, zona de distribuție și condițiile contractuale.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="calculator" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-2 items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Calculator factură energie</p>
            <h3 className="mt-3 text-3xl font-bold">Compară costul actual cu o estimare orientativă</h3>
            <p className="mt-4 text-slate-600 max-w-xl">Calculatorul este personalizat după consum, tip client, tip loc de consum, furnizor, zonă, abonament și tipul facturii.</p>
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

      <section id="ghiduri" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Ghiduri utile</p>
            <h3 className="mt-3 text-3xl font-bold">Învață să verifici factura de energie</h3>
          </div>
          <div className="text-sm text-slate-500">Fiecare ghid are URL separat, potrivit pentru indexare.</div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <article key={article.slug} className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-lg transition">
              <div className="mb-4 flex items-center justify-between gap-3"><span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">ghid</span><span className="text-xs text-slate-500">{article.readTime}</span></div>
              <h4 className="text-xl font-bold leading-snug">{article.title}</h4>
              <p className="mt-3 text-slate-600 text-sm">{article.excerpt}</p>
              <button onClick={() => navigate(`/articole/${article.slug}`)} className="mt-5 inline-block rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition">Citește ghidul</button>
            </article>
          ))}
        </div>
      </section>

      <ContactSection calculation={calculation} />
    </main>
  );
}

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
              <div className="rounded-3xl bg-white/10 p-5 border border-white/10 backdrop-blur"><p className="font-semibold text-white">Ce poți solicita?</p><ul className="mt-3 list-disc pl-5 text-sm text-slate-300 space-y-1"><li>verificarea orientativă a unei facturi;</li><li>explicații despre diferențele față de estimare;</li><li>clarificări privind consum, abonament sau regularizare;</li><li>pași recomandați pentru comparația ofertelor.</li></ul></div>
              <div className="rounded-3xl bg-emerald-400/10 p-5 border border-emerald-300/20 backdrop-blur"><p className="font-semibold text-white">Contact oficial</p><p className="mt-2 text-sm text-slate-300">
                  Email: <a href="mailto:contact@verificafactura.ro" className="font-semibold text-emerald-200 underline underline-offset-4 hover:text-white">contact@verificafactura.ro</a>
                </p></div>
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
    const selectedEnergyPrice = clientType === "nonhousehold"
      ? selectedSupplier.prices.nonhousehold
      : selectedSupplier.prices.household;

    const activeEnergy = kwh * selectedEnergyPrice * businessMultiplier * locationMultiplier;
    const distribution = kwh * selectedZone.distributionTariff;
    const transport = kwh * regulatedCosts.transport;
    const systemServices = kwh * regulatedCosts.systemServices;
    const greenCertificates = kwh * regulatedCosts.greenCertificates;
    const cogeneration = kwh * regulatedCosts.cogeneration;
    const excise = kwh * regulatedCosts.excise;
    const subscription = hasSubscription === "yes" ? Math.max(selectedSupplier.subscription, 5) : hasSubscription === "no" ? 0 : selectedSupplier.subscription;

    const calculateOfferTotal = (supplier) => {
      const price = clientType === "nonhousehold" ? supplier.prices.nonhousehold : supplier.prices.household;
      const offerActiveEnergy = kwh * price * businessMultiplier * locationMultiplier;
      const offerSubscription = hasSubscription === "yes" ? Math.max(supplier.subscription, 5) : hasSubscription === "no" ? 0 : supplier.subscription;
      const offerSubtotal = (offerActiveEnergy + distribution + transport + systemServices + greenCertificates + cogeneration + excise + offerSubscription) * invoiceAdjustment;
      return offerSubtotal + offerSubtotal * regulatedCosts.vat;
    };

    const cheapestOffer = supplierOffers
      .map((supplier) => ({
        name: supplier.name,
        monthlyTotal: calculateOfferTotal(supplier),
        source: supplier.source,
        updatedAt: supplier.updatedAt,
      }))
      .sort((a, b) => a.monthlyTotal - b.monthlyTotal)[0];
    const subtotal = (activeEnergy + distribution + transport + systemServices + greenCertificates + cogeneration + excise + subscription) * invoiceAdjustment;
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

    return { kwh, clientType, locationType, invoiceType, hasSubscription, changedSupplier, supplierName: selectedSupplier.name, zoneName: selectedZone.name, selectedEnergyPrice, selectedEnergySource: selectedSupplier.source, selectedUpdatedAt: selectedSupplier.updatedAt, cheapestOffer, currentBill: bill, activeEnergy, distribution, transport, systemServices, greenCertificates, cogeneration, excise, subscription, vat, estimatedMonthly, monthlyDifference, annualDifference, recommendation, warnings };
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
      <div className="mb-6 rounded-2xl bg-slate-50 p-4 border border-slate-200"><p className="text-sm font-semibold text-slate-800">Nu știi consumul?</p><p className="mt-1 text-sm text-slate-600">Alege un profil orientativ și poți ajusta valoarea după aceea.</p><div className="mt-3 flex flex-wrap gap-2"><QuickButton onClick={() => estimateByProfile("smallApartment")}>Apartament mic ~150 kWh</QuickButton><QuickButton onClick={() => estimateByProfile("apartment")}>Apartament 2-3 camere ~300 kWh</QuickButton><QuickButton onClick={() => estimateByProfile("house")}>Casă ~600 kWh</QuickButton><QuickButton onClick={() => estimateByProfile("commercial")}>Spațiu comercial ~900 kWh</QuickButton></div></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Consum lunar estimat (kWh)" hint="Îl găsești pe factură. Poți începe cu o estimare."><input type="number" value={consumption} onChange={(e) => setConsumption(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" placeholder="Ex: 300" /></Field>
        <Field label="Valoare factură actuală (RON)" hint="Introdu totalul de plată, nu doar energia activă."><input type="number" value={currentBill} onChange={(e) => setCurrentBill(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" placeholder="Ex: 300" /></Field>
        <Field label="Tip client" hint="Alege categoria de consum aplicabilă facturii."><select value={clientType} onChange={(e) => setClientType(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"><option value="household">Casnic</option><option value="nonhousehold">Noncasnic</option></select></Field>
        <Field label="Tip loc de consum" hint="Ajută la interpretarea consumului."><select value={locationType} onChange={(e) => setLocationType(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"><option value="apartment">Apartament</option><option value="house">Casă</option><option value="commercial">Spațiu comercial</option></select></Field>
        <Field label="Tip factură" hint="Facturile estimate sau regularizările pot explica diferențe mari."><select value={invoiceType} onChange={(e) => setInvoiceType(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"><option value="unknown">Nu știu</option><option value="real">Consum real</option><option value="estimated">Estimată</option><option value="regularization">Regularizare</option></select></Field>
        <Field label="Oferta include abonament?" hint="Abonamentul poate crește factura, mai ales la consum mic."><select value={hasSubscription} onChange={(e) => setHasSubscription(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"><option value="unknown">Nu știu</option><option value="yes">Da</option><option value="no">Nu</option></select></Field>
        <Field label="Ai schimbat furnizorul în ultimele 6 luni?" hint="Poate indica regularizări sau perioade de tranziție."><select value={changedSupplier} onChange={(e) => setChangedSupplier(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"><option value="no">Nu</option><option value="yes">Da</option></select></Field>
        <Field label="Furnizor / ofertă orientativă" hint="Selectează oferta față de care vrei comparația."><select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500">{supplierOffers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></Field>
        <Field label="Zonă distribuție" hint="Afectează componenta de distribuție."><select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500">{distributionZones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}</select></Field>
      </div>
      {validationErrors.length > 0 && <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700 border border-red-100"><p className="font-semibold">Verifică datele introduse:</p><ul className="mt-2 list-disc pl-5">{validationErrors.map((err) => <li key={err}>{err}</li>)}</ul></div>}
      {result && <CalculatorResult result={result} />}
    </div>
  );
}

function CalculatorResult({ result }) {
  return <div className="mt-6 grid gap-4"><div className="rounded-2xl bg-emerald-50 p-5 border border-emerald-100"><p className="text-sm font-medium text-emerald-700">Estimare lunară</p><p className="mt-1 text-3xl font-bold text-slate-900">{money(result.estimatedMonthly)} RON</p><p className="mt-2 text-sm text-slate-600">Furnizor/ofertă: {result.supplierName}. Zonă: {result.zoneName}.</p><p className="mt-1 text-xs text-slate-500">Preț energie activă folosit în estimare: {money(result.selectedEnergyPrice)} RON/kWh.</p><p className="mt-1 text-xs text-slate-500">Sursă: {result.selectedEnergySource} • Actualizat la: {result.selectedUpdatedAt}</p></div><div className={result.monthlyDifference > 0 ? "rounded-2xl bg-amber-50 p-5 border border-amber-100" : "rounded-2xl bg-slate-50 p-5 border border-slate-200"}><p className="text-sm font-medium text-slate-700">Diferență față de factura introdusă</p><p className="mt-1 text-2xl font-bold text-slate-900">{result.monthlyDifference >= 0 ? "+" : ""}{money(result.monthlyDifference)} RON / lună</p><p className="mt-1 text-lg font-semibold text-slate-800">{result.annualDifference >= 0 ? "+" : ""}{money(result.annualDifference)} RON / an</p><p className="mt-3 text-sm text-slate-700">{result.recommendation}</p></div>{result.cheapestOffer && <div className="rounded-2xl bg-lime-50 p-5 border border-lime-100"><p className="text-sm font-medium text-lime-700">Cel mai ieftin furnizor din lista orientativă</p><p className="mt-1 text-2xl font-bold text-slate-900">{result.cheapestOffer.name}</p><p className="mt-2 text-sm text-slate-700">Estimare lunară: <strong>{money(result.cheapestOffer.monthlyTotal)} RON</strong></p><p className="mt-1 text-xs text-slate-500">Sursă: {result.cheapestOffer.source} • Actualizat la: {result.cheapestOffer.updatedAt}</p></div>}{result.warnings.length > 0 && <div className="rounded-2xl bg-sky-50 p-5 border border-sky-100"><p className="font-semibold text-slate-900">Aspecte de verificat</p><ul className="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-1">{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div>}<div className="rounded-2xl bg-white p-5 border border-slate-200"><p className="font-semibold">Structură estimativă cost</p><div className="mt-3 grid gap-2 text-sm text-slate-600"><CostRow label="Energie activă" value={result.activeEnergy} /><CostRow label="Distribuție" value={result.distribution} /><CostRow label="Transport" value={result.transport} /><CostRow label="Servicii sistem" value={result.systemServices} /><CostRow label="Certificate verzi" value={result.greenCertificates} /><CostRow label="Cogenerare" value={result.cogeneration} /><CostRow label="Acciză" value={result.excise} /><CostRow label="Abonament" value={result.subscription} /><CostRow label="TVA" value={result.vat} /></div></div><p className="text-xs text-slate-500">Estimările afișate sunt orientative și nu reprezintă ofertă comercială. Prețurile pot varia în funcție de ofertă, locație, perioadă, taxe aplicabile și condițiile contractuale. Pentru comparații oficiale, consultă comparatorul ANRE/POSF și oferta contractuală a furnizorului.</p></div>;
}

function LeadForm({ calculation }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault(); setSending(true); setError("");
    const formData = new FormData(e.target); formData.append("_subject", "Lead nou - Verifică Factura");
    if (calculation) {
      formData.append("consum_kwh", calculation.kwh); formData.append("tip_client", calculation.clientType === "nonhousehold" ? "Noncasnic" : "Casnic"); formData.append("tip_loc_consum", formatLocationType(calculation.locationType)); formData.append("tip_factura", formatInvoiceType(calculation.invoiceType)); formData.append("abonament", formatYesNoUnknown(calculation.hasSubscription)); formData.append("schimbat_recent_furnizor", calculation.changedSupplier === "yes" ? "Da" : "Nu"); formData.append("furnizor_oferta", calculation.supplierName); formData.append("zona_distributie", calculation.zoneName); formData.append("pret_energie_activa_ron_kwh", money(calculation.selectedEnergyPrice)); formData.append("factura_actuala_ron", money(calculation.currentBill)); formData.append("estimare_lunara_ron", money(calculation.estimatedMonthly)); formData.append("diferenta_lunara_ron", money(calculation.monthlyDifference)); formData.append("diferenta_anuala_ron", money(calculation.annualDifference)); formData.append("energie_activa_ron", money(calculation.activeEnergy)); formData.append("distributie_ron", money(calculation.distribution)); formData.append("transport_ron", money(calculation.transport)); formData.append("servicii_sistem_ron", money(calculation.systemServices)); formData.append("certificate_verzi_ron", money(calculation.greenCertificates)); formData.append("cogenerare_ron", money(calculation.cogeneration)); formData.append("acciza_ron", money(calculation.excise)); formData.append("abonament_ron", money(calculation.subscription)); formData.append("tva_ron", money(calculation.vat)); formData.append("recomandare", calculation.recommendation); formData.append("aspecte_de_verificat", calculation.warnings.join(" | ") || "N/A");
    }
    try {
      const response = await fetch("https://formspree.io/f/mvzdjvrd", { method: "POST", body: formData, headers: { Accept: "application/json" } });
      const result = await response.json().catch(() => null);
      if (!response.ok) { setError(result?.errors?.[0]?.message || `Formularul nu a putut fi trimis. Cod eroare: ${response.status}`); return; }
      setSent(true);
    } catch { setError("Cererea nu a putut fi trimisă. Verifică conexiunea și încearcă din nou."); } finally { setSending(false); }
  };
  if (sent) return <div className="rounded-3xl bg-white p-8 text-slate-900 shadow-xl border border-emerald-100"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">✔</div><p className="mt-5 text-green-700 text-xl font-bold">Cererea a fost trimisă cu succes!</p><p className="mt-2 text-slate-600">Am primit datele și estimarea calculată. Revenim cu o analiză în cel mai scurt timp.</p></div>;
  return <form onSubmit={handleSubmit} className="rounded-[1.5rem] bg-white p-6 md:p-8 text-slate-900"><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Formular analiză</p><h4 className="mt-2 text-2xl md:text-3xl font-bold">Trimite datele pentru verificare</h4><p className="mt-2 text-sm text-slate-500">Câmpurile marcate cu <span className="text-red-500 font-bold">*</span> sunt obligatorii.</p></div><div className="grid gap-5 md:grid-cols-2"><FormField label="Nume" required><input name="nume" required className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition" placeholder="Numele tău" /></FormField><FormField label="Email" required><input type="email" name="email" required className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition" placeholder="email@exemplu.ro" /></FormField><FormField label="Telefon" required><input name="telefon" required className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition" placeholder="07xx xxx xxx" /></FormField><div className="md:col-span-2"><FormField label="Mesaj" required><textarea name="mesaj" required className="min-h-[130px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition" placeholder="Scrie aici câteva detalii despre factura sau consumul tău" /></FormField></div>{calculation && <div className="md:col-span-2 rounded-3xl bg-gradient-to-br from-slate-50 to-emerald-50 p-5 text-sm text-slate-700 border border-emerald-100"><p className="font-bold text-slate-900">Se va transmite și estimarea calculată:</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><p>Consum: <strong>{calculation.kwh} kWh</strong></p><p>Tip client: <strong>{calculation.clientType === "nonhousehold" ? "Noncasnic" : "Casnic"}</strong></p><p>Tip loc consum: <strong>{formatLocationType(calculation.locationType)}</strong></p><p>Tip factură: <strong>{formatInvoiceType(calculation.invoiceType)}</strong></p><p>Abonament: <strong>{formatYesNoUnknown(calculation.hasSubscription)}</strong></p><p>Furnizor: <strong>{calculation.supplierName}</strong></p><p>Zonă: <strong>{calculation.zoneName}</strong></p><p>Preț energie activă: <strong>{money(calculation.selectedEnergyPrice)} RON/kWh</strong></p><p>Factură actuală: <strong>{money(calculation.currentBill)} RON</strong></p><p>Estimare: <strong>{money(calculation.estimatedMonthly)} RON / lună</strong></p><p>Diferență: <strong>{money(calculation.monthlyDifference)} RON / lună</strong></p></div></div>}<div className="md:col-span-2"><RequiredLabel>GDPR</RequiredLabel><label className="mt-2 flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 border border-slate-200 hover:border-emerald-200 transition"><input type="checkbox" name="gdpr" required value="acceptat" className="mt-1 h-4 w-4 rounded border-slate-300 accent-emerald-500" /><span>Sunt de acord cu prelucrarea datelor transmise prin formular pentru analizarea solicitării mele. Am înțeles că estimarea este orientativă și că pot solicita ștergerea datelor.</span></label></div>{error && <div className="md:col-span-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700 border border-red-100">{error}</div>}<button type="submit" disabled={sending} className="md:col-span-2 rounded-2xl bg-emerald-500 px-6 py-4 font-bold text-slate-950 hover:bg-emerald-400 transition disabled:opacity-60 shadow-lg shadow-emerald-500/20">{sending ? "Se trimite..." : "Trimite cererea"}</button></div></form>;
}

function ArticlePage({ article, navigate }) { return <main className="bg-white"><section className="bg-gradient-to-br from-slate-900 to-emerald-900 text-white"><div className="mx-auto max-w-4xl px-6 py-16"><button onClick={() => navigate("/#ghiduri")} className="mb-8 rounded-2xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition">← Înapoi la ghiduri</button><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">Ghid energie • {article.readTime}</p><h2 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">{article.title}</h2><p className="mt-6 text-lg text-slate-200">{article.intro}</p></div></section><article className="mx-auto max-w-4xl px-6 py-14"><div className="space-y-8 text-slate-700 leading-8">{article.sections.map((section) => <section key={section.heading}><h3 className="text-2xl font-bold text-slate-900">{section.heading}</h3><p className="mt-3">{section.body}</p></section>)}</div><div className="mt-12 rounded-3xl bg-emerald-50 p-6 border border-emerald-100"><p className="font-semibold text-slate-900">Vrei să vezi dacă factura ta poate fi optimizată?</p><p className="mt-2 text-sm text-slate-600">Folosește calculatorul și cere o analiză gratuită.</p><button onClick={() => navigate("/#calculator")} className="mt-5 rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 hover:bg-emerald-400 transition">Verifică factura cu calculatorul</button></div></article></main>; }
function LegalPage({ page, navigate }) { return <main className="bg-white"><section className="bg-gradient-to-br from-slate-900 to-emerald-900 text-white"><div className="mx-auto max-w-4xl px-6 py-16"><button onClick={() => navigate("/")} className="mb-8 rounded-2xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition">← Înapoi la site</button><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">Informații legale</p><h2 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">{page.title}</h2><p className="mt-6 text-lg text-slate-200">{page.intro}</p></div></section><article className="mx-auto max-w-4xl px-6 py-14"><div className="rounded-3xl bg-amber-50 border border-amber-100 p-6 mb-10"><p className="font-semibold text-amber-900">Notă importantă</p><p className="mt-2 text-sm text-amber-900/80">Aceste texte sunt un model de lucru. Înainte de lansarea oficială, este recomandată verificarea de către un specialist juridic/GDPR.</p></div><div className="space-y-8 text-slate-700 leading-8">{page.sections.map((section) => <section key={section.heading}><h3 className="text-2xl font-bold text-slate-900">{section.heading}</h3><p className="mt-3">{section.body}</p></section>)}</div></article></main>; }
function Footer({ navigate }) { return <footer className="bg-slate-950 text-slate-300 border-t border-white/10"><div className="mx-auto max-w-6xl px-6 py-10 grid gap-8 md:grid-cols-2"><div><p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Verifică Factura</p><p className="mt-3 text-sm leading-6 text-slate-400">Platformă informativă pentru verificarea orientativă a facturilor de energie. Estimările nu reprezintă ofertă comercială, recomandare contractuală finală sau garanție de economie.</p></div><div className="md:text-right"><p className="font-semibold text-white">Informații legale</p><div className="mt-3 flex flex-wrap gap-4 md:justify-end text-sm"><button onClick={() => navigate("/confidentialitate")} className="hover:text-white">Confidențialitate</button><button onClick={() => navigate("/termeni")} className="hover:text-white">Termeni</button><button onClick={() => navigate("/disclaimer")} className="hover:text-white">Disclaimer</button><button onClick={() => navigate("/cookies")} className="hover:text-white">Cookies</button></div><p className="mt-4 text-xs text-slate-500">© {new Date().getFullYear()} Verifică Factura. Toate drepturile rezervate.</p></div></div></footer>; }
function QuickButton({ children, onClick }) { return <button type="button" onClick={onClick} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-100 transition">{children}</button>; }
function Field({ label, hint, children }) { return <div><label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>{children}{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}</div>; }
function CostRow({ label, value }) { return <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2"><span>{label}</span><strong className="text-slate-900">{money(value)} RON</strong></div>; }
function FormField({ label, required, children }) { return <div><RequiredLabel required={required}>{label}</RequiredLabel><div className="mt-2">{children}</div></div>; }
function RequiredLabel({ children, required = true }) { return <label className="block text-sm font-semibold text-slate-800">{children} {required && <span className="text-red-500">*</span>}</label>; }
function InfoCard({ title, text }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200">
        <SparkIcon />
      </div>
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

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 4c-7 0-12 5-12 12 0 2 1 4 3 4 7 0 9-9 9-16Z" />
      <path d="M4 20c4-6 8-9 16-16" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 4-4 3 3 5-7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  );
}
function money(value) { return Number(value || 0).toFixed(2); }
function formatLocationType(value) { if (value === "house") return "Casă"; if (value === "commercial") return "Spațiu comercial"; return "Apartament"; }
function formatInvoiceType(value) { if (value === "real") return "Consum real"; if (value === "estimated") return "Estimată"; if (value === "regularization") return "Regularizare"; return "Nu știu"; }
function formatYesNoUnknown(value) { if (value === "yes") return "Da"; if (value === "no") return "Nu"; return "Nu știu"; }
