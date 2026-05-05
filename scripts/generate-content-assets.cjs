const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const siteUrl = "https://verificafactura.ro";
const content = require(path.join(rootDir, "src/data/content.json"));
const suppliers = require(path.join(rootDir, "src/data/furnizori.json"));

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function page(pathname, lastmod, priority = "0.7", changefreq = "weekly") {
  return {
    loc: `${siteUrl}${pathname === "/" ? "" : pathname}`,
    lastmod: lastmod || new Date().toISOString().slice(0, 10),
    priority,
    changefreq,
  };
}

function normalizeSources(item) {
  if (Array.isArray(item.sources) && item.sources.length > 0) return item.sources;
  if (item.sourceUrl || item.source) return [{ name: item.source || "Sursa oficiala", url: item.sourceUrl || siteUrl }];
  return [
    { name: "ANRE", url: "https://anre.ro" },
    { name: "POSF", url: "https://posf.ro/comparator?comparatorType=electric" },
  ];
}

function normalizeFaq(item) {
  if (Array.isArray(item.faq) && item.faq.length > 0) return item.faq;
  return (item.sections || []).slice(0, 3).map((section) => ({
    question: String(section.heading || "").replace(/^\d+\.\s*/, ""),
    answer: section.body || "",
  }));
}

function normalizeAuthor(item) {
  if (item.author && typeof item.author === "object") return item.author;
  return { name: item.author || "Echipa Verifica Factura", url: siteUrl };
}

function normalizeItem(item) {
  return {
    ...item,
    publishDate: item.publishDate || "2026-04-29",
    lastVerifiedAt: item.lastVerifiedAt || item.publishDate || "2026-04-29",
    metaTitle: item.metaTitle || item.title,
    metaDescription: item.metaDescription || item.excerpt || item.intro || "Ghid Verifica Factura pentru consumatori.",
    author: normalizeAuthor(item),
    sources: normalizeSources(item),
    faq: normalizeFaq(item),
  };
}

function supplierEntries() {
  return Object.entries(suppliers).map(([name, data]) => ({
    id: slugify(name),
    name,
    offerName: data.oferta || "",
    householdPrice: Number(data.casnic || 0),
    nonhouseholdPrice: Number(data.noncasnic || data.casnic || 0),
    subscription: Number(data.abonament || 0),
    green: Number(data.verde || 0),
    source: data.sursa || "estimare interna",
    updatedAt: data.actualizatLa || "necunoscut",
  }));
}

function jsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function articleJsonLd(item) {
  const pathname = item.type === "news" ? `/stiri/${item.slug}` : `/articole/${item.slug}`;
  const url = `${siteUrl}${pathname}`;
  return {
    "@context": "https://schema.org",
    "@type": item.type === "news" ? "NewsArticle" : "Article",
    headline: item.title,
    description: item.metaDescription,
    datePublished: item.publishDate,
    dateModified: item.lastVerifiedAt,
    author: { "@type": "Organization", name: item.author.name, url: item.author.url || siteUrl },
    publisher: { "@type": "Organization", name: "Verifica Factura", url: siteUrl },
    mainEntityOfPage: url,
    url,
    citation: item.sources.map((source) => source.url),
    mainEntity: item.faq.length > 0 ? {
      "@type": "FAQPage",
      mainEntity: item.faq.map((entry) => ({
        "@type": "Question",
        name: entry.question,
        acceptedAnswer: { "@type": "Answer", text: entry.answer },
      })),
    } : undefined,
  };
}

function supplierJsonLd(supplier) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: supplier.name,
    url: `${siteUrl}/furnizori/${supplier.id}`,
    description: `Pagina informativa pentru oferta ${supplier.offerName || supplier.name}.`,
    knowsAbout: ["energie electrica", "factura energie", "furnizori energie"],
  };
}

function layout({ title, description, pathname, type = "website", body, schema }) {
  const canonical = `${siteUrl}${pathname === "/" ? "" : pathname}`;
  return `<!DOCTYPE html>
<html lang="ro">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <link rel="alternate" type="application/rss+xml" title="Verifica Factura - Ghiduri" href="/rss.xml" />
    <meta property="og:type" content="${escapeHtml(type)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:locale" content="ro_RO" />
    <script type="application/ld+json">${jsonLd(schema)}</script>
    <style>
      :root{color-scheme:light;--ink:#0f172a;--muted:#475569;--line:#e2e8f0;--soft:#f8fafc;--brand:#059669;--dark:#020617}
      *{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:white;line-height:1.65}
      a{color:inherit}.top{background:var(--dark);color:white}.nav{max-width:1120px;margin:0 auto;padding:18px 24px;display:flex;justify-content:space-between;gap:18px;align-items:center}.nav a{text-decoration:none}.nav-links{display:flex;gap:18px;font-size:14px;color:#cbd5e1}
      .hero{background:linear-gradient(135deg,#020617,#0f172a 55%,#065f46);color:white}.wrap{max-width:960px;margin:0 auto;padding:56px 24px}.wide{max-width:1120px}.eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.18em;color:#a7f3d0;font-weight:800}.hero h1{font-size:clamp(34px,5vw,56px);line-height:1.05;margin:14px 0}.hero p{font-size:18px;color:#dbeafe;max-width:760px}
      main h2{font-size:28px;line-height:1.25;margin:36px 0 10px}.content{max-width:860px;margin:0 auto;padding:48px 24px}.content p{color:var(--muted)}.meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}.pill{border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:5px 12px;font-size:12px;color:#e2e8f0}
      .card{border:1px solid var(--line);border-radius:18px;background:white;padding:20px;box-shadow:0 8px 24px rgba(15,23,42,.05)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}.cta{margin-top:40px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:22px;padding:24px}.btn{display:inline-block;margin-top:14px;background:#10b981;color:#022c22;text-decoration:none;font-weight:800;padding:12px 18px;border-radius:14px}
      .source-list{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.source-list a{text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:8px 12px;font-size:14px;color:var(--muted)}
      .supplier-row{display:block;text-decoration:none}.price{font-size:24px;font-weight:900;color:var(--brand)}footer{border-top:1px solid var(--line);background:var(--soft);padding:28px 24px;color:var(--muted);font-size:14px}.footer-inner{max-width:1120px;margin:0 auto}
    </style>
  </head>
  <body>
    <header class="top">
      <nav class="nav">
        <a href="/"><strong>Verifica Factura</strong></a>
        <div class="nav-links">
          <a href="/#calculator">Calculator</a>
          <a href="/furnizori">Furnizori</a>
          <a href="/stiri">Stiri</a>
          <a href="/rss.xml">RSS</a>
        </div>
      </nav>
    </header>
    ${body}
    <footer><div class="footer-inner">Estimari orientative. Verifica intotdeauna contractul, factura si sursele oficiale ANRE/POSF inainte de o decizie.</div></footer>
  </body>
</html>
`;
}

function renderArticle(item) {
  const isNews = item.type === "news";
  const pathname = isNews ? `/stiri/${item.slug}` : `/articole/${item.slug}`;
  const sections = (item.sections || []).map((section) => `
        <section>
          <h2>${escapeHtml(section.heading)}</h2>
          <p>${escapeHtml(section.body)}</p>
        </section>`).join("");
  const faq = item.faq.length > 0 ? `
        <section class="card" style="margin-top:36px">
          <h2>Intrebari frecvente</h2>
          ${item.faq.map((entry) => `<h3>${escapeHtml(entry.question)}</h3><p>${escapeHtml(entry.answer)}</p>`).join("")}
        </section>` : "";
  const sources = item.sources.map((source) => `<a href="${escapeHtml(source.url)}" rel="noopener noreferrer">${escapeHtml(source.name)}</a>`).join("");
  return layout({
    title: `${item.metaTitle} | Verifica Factura`,
    description: item.metaDescription,
    pathname,
    type: isNews ? "article" : "website",
    schema: articleJsonLd(item),
    body: `
      <main>
        <section class="hero">
          <div class="wrap">
            <div class="eyebrow">${escapeHtml(isNews ? item.category || "Stire" : "Ghid energie")} · ${escapeHtml(item.readTime || "")}</div>
            <h1>${escapeHtml(item.title)}</h1>
            <p>${escapeHtml(item.intro || item.excerpt)}</p>
            <div class="meta">
              <span class="pill">Publicat: ${escapeHtml(item.publishDate)}</span>
              <span class="pill">Verificat: ${escapeHtml(item.lastVerifiedAt)}</span>
              <span class="pill">Autor: ${escapeHtml(item.author.name)}</span>
            </div>
          </div>
        </section>
        <article class="content">
          ${sections}
          ${faq}
          <section class="cta">
            <strong>Verifica factura ta</strong>
            <p>Foloseste calculatorul pentru o estimare orientativa si cere o analiza gratuita daca ceva nu pare corect.</p>
            <a class="btn" href="/#calculator">Verifica factura ta</a>
          </section>
          <section class="card" style="margin-top:28px">
            <strong>Surse si verificare</strong>
            <div class="source-list">${sources}</div>
          </section>
        </article>
      </main>`,
  });
}

function renderNewsIndex(news) {
  const cards = news.map((item) => `
        <a class="card" href="/stiri/${escapeHtml(item.slug)}" style="text-decoration:none">
          <div class="eyebrow">${escapeHtml(item.category || "Stire")}</div>
          <h2>${escapeHtml(item.title)}</h2>
          <p>${escapeHtml(item.excerpt || item.metaDescription)}</p>
        </a>`).join("");
  return layout({
    title: "Stiri energie si facturi | Verifica Factura",
    description: "Stiri si actualizari despre energie, facturi, ANRE, POSF si legislatie, cu surse oficiale de verificare.",
    pathname: "/stiri",
    schema: { "@context": "https://schema.org", "@type": "CollectionPage", name: "Stiri energie si facturi", url: `${siteUrl}/stiri` },
    body: `
      <main>
        <section class="hero"><div class="wrap wide"><div class="eyebrow">Actualizari verificate</div><h1>Stiri despre energie, facturi si legislatie</h1><p>Monitorizam subiectele utile pentru consumatori si legam fiecare actualizare de surse care pot fi verificate.</p></div></section>
        <section class="wrap wide"><div class="grid">${cards}</div></section>
      </main>`,
  });
}

function renderSuppliersIndex(list) {
  const cards = list.map((supplier) => `
        <a class="card supplier-row" href="/furnizori/${escapeHtml(supplier.id)}">
          <h2>${escapeHtml(supplier.name)}</h2>
          <p>${escapeHtml(supplier.offerName || "Oferta orientativa")}</p>
          <div class="price">${supplier.householdPrice.toFixed(2)} RON/kWh</div>
          <p>${supplier.green}% energie verde · Sursa: ${escapeHtml(supplier.source)}</p>
        </a>`).join("");
  return layout({
    title: "Furnizori energie electrica | Verifica Factura",
    description: "Lista completa de furnizori energie electrica, cu pret orientativ, energie verde si surse de verificare.",
    pathname: "/furnizori",
    schema: { "@context": "https://schema.org", "@type": "CollectionPage", name: "Furnizori energie electrica", url: `${siteUrl}/furnizori` },
    body: `
      <main>
        <section class="hero"><div class="wrap wide"><div class="eyebrow">Comparator orientativ</div><h1>Furnizori energie electrica</h1><p>Compara pretul energiei active si verifica sursa inainte de orice decizie contractuala.</p></div></section>
        <section class="wrap wide"><div class="grid">${cards}</div></section>
      </main>`,
  });
}

function renderSupplier(supplier) {
  return layout({
    title: `${supplier.name} - pret energie 2026 | Verifica Factura`,
    description: `Vezi pretul orientativ pentru ${supplier.name}, oferta ${supplier.offerName}, procent energie verde si sursa de verificare.`,
    pathname: `/furnizori/${supplier.id}`,
    schema: supplierJsonLd(supplier),
    body: `
      <main>
        <section class="hero"><div class="wrap"><div class="eyebrow">Furnizor energie electrica</div><h1>${escapeHtml(supplier.name)}</h1><p>Pagina informativa pentru oferta ${escapeHtml(supplier.offerName || "selectata")}. Valorile trebuie verificate in POSF/ANRE si in oferta contractuala.</p></div></section>
        <section class="content">
          <div class="grid">
            <div class="card"><strong>Pret energie activa</strong><div class="price">${supplier.householdPrice.toFixed(2)} RON/kWh</div><p>Client casnic</p></div>
            <div class="card"><strong>Oferta</strong><p>${escapeHtml(supplier.offerName || "Oferta orientativa")}</p><p>Sursa: ${escapeHtml(supplier.source)}</p></div>
            <div class="card"><strong>Energie verde</strong><div class="price">${supplier.green}%</div><p>Actualizat: ${escapeHtml(supplier.updatedAt)}</p></div>
          </div>
          <section class="cta">
            <strong>Merita ${escapeHtml(supplier.name)}?</strong>
            <p>Compara intotdeauna costul total, nu doar pretul pe kWh. Foloseste calculatorul pentru consumul tau.</p>
            <a class="btn" href="/#calculator">Calculeaza factura ta</a>
          </section>
        </section>
      </main>`,
  });
}

function writeStaticPage(pathname, html) {
  const targetDir = path.join(publicDir, pathname.replace(/^\//, ""), "index.html");
  fs.mkdirSync(path.dirname(targetDir), { recursive: true });
  fs.writeFileSync(targetDir, html, "utf8");
}

const publishedContent = content.filter((item) => item.status === "published").map(normalizeItem);
const articles = publishedContent.filter((item) => item.type === "article");
const news = publishedContent.filter((item) => item.type === "news");
const supplierList = supplierEntries();

const urls = [
  page("/", new Date().toISOString().slice(0, 10), "1.0", "daily"),
  page("/furnizori", new Date().toISOString().slice(0, 10), "0.9", "daily"),
  page("/stiri", news[0]?.publishDate, "0.8", "daily"),
  page("/confidentialitate", "2026-04-29", "0.3", "monthly"),
  page("/termeni", "2026-04-29", "0.3", "monthly"),
  page("/disclaimer", "2026-04-29", "0.3", "monthly"),
  page("/cookies", "2026-04-29", "0.3", "monthly"),
  ...articles.map((item) => page(`/articole/${item.slug}`, item.lastVerifiedAt || item.publishDate, "0.8", "weekly")),
  ...news.map((item) => page(`/stiri/${item.slug}`, item.lastVerifiedAt || item.publishDate, "0.7", "daily")),
  ...supplierList.map((supplier) => page(`/furnizori/${supplier.id}`, supplier.updatedAt, "0.7", "weekly")),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${escapeXml(url.lastmod)}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;

const rssItems = [...news, ...articles]
  .sort((a, b) => new Date(b.publishDate || 0) - new Date(a.publishDate || 0))
  .slice(0, 30)
  .map((item) => {
    const pathname = item.type === "news" ? `/stiri/${item.slug}` : `/articole/${item.slug}`;
    const link = `${siteUrl}${pathname}`;
    return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      <pubDate>${new Date(item.publishDate).toUTCString()}</pubDate>
      <description>${escapeXml(item.excerpt || item.metaDescription || item.intro)}</description>
    </item>`;
  })
  .join("\n");

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Verifica Factura - Ghiduri si stiri</title>
    <link>${siteUrl}</link>
    <description>Actualizari, ghiduri si informatii verificate despre facturi de energie.</description>
    <language>ro-RO</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${rssItems}
  </channel>
</rss>
`;

fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap, "utf8");
fs.writeFileSync(path.join(publicDir, "rss.xml"), rss, "utf8");

writeStaticPage("/furnizori", renderSuppliersIndex(supplierList));
writeStaticPage("/stiri", renderNewsIndex(news));
articles.forEach((item) => writeStaticPage(`/articole/${item.slug}`, renderArticle(item)));
news.forEach((item) => writeStaticPage(`/stiri/${item.slug}`, renderArticle(item)));
supplierList.forEach((supplier) => writeStaticPage(`/furnizori/${supplier.id}`, renderSupplier(supplier)));

console.log(`Generated ${urls.length} sitemap URLs, ${Math.min(30, publishedContent.length)} RSS items and ${articles.length + news.length + supplierList.length + 2} static SEO pages.`);
