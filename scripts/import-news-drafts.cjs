const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const contentPath = path.join(rootDir, "src/data/content.json");
const sourcesPath = path.join(rootDir, "src/data/news-sources.json");
const calendar = require(path.join(rootDir, "src/data/editorial-calendar.json"));
const sourceConfig = require(sourcesPath);

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteUrl(url, base) {
  try {
    return new URL(url, base).toString();
  } catch {
    return base;
  }
}

function isRelevant(text, keywords = []) {
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(String(keyword).toLowerCase()));
}

function extractRssItems(xml, source) {
  const items = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const titleRegex = /<title[^>]*>([\s\S]*?)<\/title>/i;
  const linkRegex = /<link[^>]*>([\s\S]*?)<\/link>/i;
  const descriptionRegex = /<description[^>]*>([\s\S]*?)<\/description>/i;

  for (const match of xml.matchAll(itemRegex)) {
    const block = match[0];
    const title = decodeHtml(block.match(titleRegex)?.[1]);
    const link = decodeHtml(block.match(linkRegex)?.[1]);
    const description = decodeHtml(block.match(descriptionRegex)?.[1] || title);
    if (title && isRelevant(`${title} ${description}`, source.keywords)) {
      items.push({ title, link: absoluteUrl(link, source.url), description });
    }
  }

  return items;
}

function extractHtmlItems(html, source) {
  const items = [];
  const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const seen = new Set();

  for (const match of html.matchAll(anchorRegex)) {
    const link = absoluteUrl(match[1], source.url);
    const title = decodeHtml(match[2]);
    if (!title || title.length < 18 || seen.has(link)) continue;
    if (!isRelevant(title, source.keywords)) continue;
    seen.add(link);
    items.push({ title, link, description: title });
    if (items.length >= 8) break;
  }

  return items;
}

function makeNewsDraft(source, item, existingSlugs) {
  let slug = slugify(item.title);
  if (!slug) slug = `${source.id}-${today()}`;
  let uniqueSlug = slug;
  let suffix = 2;
  while (existingSlugs.has(`news:${uniqueSlug}`)) {
    uniqueSlug = `${slug}-${suffix}`;
    suffix += 1;
  }
  existingSlugs.add(`news:${uniqueSlug}`);

  const excerpt = item.description || item.title;
  return {
    type: "news",
    status: sourceConfig.defaults?.status || "review",
    slug: uniqueSlug,
    title: item.title,
    excerpt,
    readTime: sourceConfig.defaults?.readTime || "3 min",
    metaDescription: excerpt.slice(0, 170),
    intro: excerpt,
    category: source.category || "STIRI",
    date: today(),
    source: source.name,
    sourceUrl: item.link || source.url,
    publishDate: today(),
    lastVerifiedAt: today(),
    author: sourceConfig.defaults?.author || { name: "Echipa Verifica Factura", url: "https://verificafactura.ro" },
    sources: [{ name: source.name, url: item.link || source.url }],
    faq: [
      {
        question: "Ce s-a anuntat?",
        answer: excerpt,
      },
      {
        question: "Ce trebuie verificat?",
        answer: "Verifica sursa oficiala, contractul si factura inainte de a lua o decizie.",
      },
    ],
    sections: [
      {
        heading: "Ce s-a anuntat?",
        body: excerpt,
      },
      {
        heading: "Ce inseamna pentru consumatori?",
        body: "Impactul exact depinde de consum, zona de distributie si conditiile contractuale. Acest draft trebuie revizuit inainte de publicare.",
      },
      {
        heading: "Ce poti face mai departe?",
        body: "Foloseste calculatorul de factura pentru o estimare orientativa si verifica informatia in sursa oficiala.",
      },
    ],
    importedByAutomationAt: new Date().toISOString(),
  };
}

async function fetchSource(source) {
  const response = await fetch(source.url, {
    headers: {
      "user-agent": "VerificaFacturaBot/1.0 (+https://verificafactura.ro)",
      "accept": "text/html,application/rss+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const body = await response.text();
  return source.sourceType === "rss" ? extractRssItems(body, source) : extractHtmlItems(body, source);
}

async function main() {
  const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));
  const existingSlugs = new Set(content.map((item) => `${item.type}:${item.slug}`));
  const existingSourceUrls = new Set(content.map((item) => item.sourceUrl).filter(Boolean));
  const maxDrafts = Number(calendar.automation?.maxImportedNewsDraftsPerRun || 5);
  let importedCount = 0;

  for (const source of sourceConfig.sources.filter((item) => item.enabled)) {
    if (importedCount >= maxDrafts) break;
    try {
      const items = await fetchSource(source);
      for (const item of items) {
        if (importedCount >= maxDrafts) break;
        if (!item.link || existingSourceUrls.has(item.link)) continue;
        const draft = makeNewsDraft(source, item, existingSlugs);
        content.unshift(draft);
        existingSourceUrls.add(item.link);
        importedCount += 1;
      }
    } catch (error) {
      console.warn(`WARN: nu am putut importa din ${source.id}: ${error.message}`);
    }
  }

  if (importedCount > 0) {
    fs.writeFileSync(contentPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  }

  console.log(`Imported ${importedCount} monitored news draft(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
