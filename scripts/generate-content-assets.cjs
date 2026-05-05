const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
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

const publishedContent = content.filter((item) => item.status === "published");
const articles = publishedContent.filter((item) => item.type === "article");
const news = publishedContent.filter((item) => item.type === "news");

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
  ...Object.keys(suppliers).map((name) => page(`/furnizori/${slugify(name)}`, suppliers[name].actualizatLa, "0.7", "weekly")),
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

fs.writeFileSync(path.join(rootDir, "public/sitemap.xml"), sitemap, "utf8");
fs.writeFileSync(path.join(rootDir, "public/rss.xml"), rss, "utf8");

console.log(`Generated ${urls.length} sitemap URLs and ${Math.min(30, publishedContent.length)} RSS items.`);
