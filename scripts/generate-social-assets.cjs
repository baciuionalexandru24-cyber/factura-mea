const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "editorial");
const siteUrl = "https://verificafactura.ro";
const content = require(path.join(rootDir, "src/data/content.json"));
const calendar = require(path.join(rootDir, "src/data/editorial-calendar.json"));

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function slugPath(item) {
  return item.type === "news" ? `/stiri/${item.slug}` : `/articole/${item.slug}`;
}

function trimText(value, max = 240) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function stripNumber(value) {
  return String(value || "").replace(/^\d+\.\s*/, "");
}

function firstSections(item, count = 4) {
  return (item.sections || []).slice(0, count);
}

function makeShortVideo(item) {
  const sections = firstSections(item, 3);
  return {
    channel: "TikTok/Reels/Shorts",
    format: "short_video_60s",
    hook: item.type === "news"
      ? `S-a schimbat ceva important: ${item.title}`
      : `Factura ta poate ascunde asta: ${stripNumber(sections[0]?.heading || item.title)}`,
    script: [
      trimText(item.intro || item.excerpt, 210),
      ...sections.map((section) => `- ${stripNumber(section.heading)}: ${trimText(section.body, 150)}`),
      "CTA: Intra pe verificafactura.ro si verifica factura ta cu calculatorul orientativ.",
    ],
    hashtags: ["#facturaenergie", "#energieelectrica", "#romania", "#economisire", "#verificafactura"],
  };
}

function makeFacebookPost(item) {
  const link = `${siteUrl}${slugPath(item)}`;
  return {
    channel: "Facebook",
    format: "facebook_summary",
    text: [
      item.title,
      "",
      trimText(item.excerpt || item.metaDescription || item.intro, 280),
      "",
      `Citeste ghidul complet: ${link}`,
      "Tu ai verificat consumul in kWh sau doar totalul de plata?",
    ].join("\n"),
  };
}

function makeCarousel(item) {
  const slides = [
    { title: item.title, body: "Salveaza postarea si verifica factura pas cu pas." },
    ...firstSections(item, 5).map((section) => ({
      title: stripNumber(section.heading),
      body: trimText(section.body, 180),
    })),
    { title: "Verifica factura ta", body: "Foloseste calculatorul de pe verificafactura.ro pentru o estimare orientativa." },
  ];
  return {
    channel: "Facebook/Instagram/LinkedIn",
    format: "carousel",
    slides,
  };
}

function makeNewsletter(item) {
  return {
    channel: "Email",
    format: "newsletter",
    subject: `Nou pe Verifica Factura: ${item.title}`,
    previewText: trimText(item.excerpt || item.metaDescription, 120),
    body: [
      trimText(item.intro || item.excerpt, 320),
      "",
      `Citeste aici: ${siteUrl}${slugPath(item)}`,
      "Daca factura pare prea mare, foloseste calculatorul si cere o analiza gratuita.",
    ].join("\n"),
  };
}

function makeAssets(item) {
  return {
    sourceSlug: item.slug,
    sourceType: item.type,
    title: item.title,
    url: `${siteUrl}${slugPath(item)}`,
    publishDate: item.publishDate,
    pillarSuggestion: item.type === "news" ? "legislatie-stiri" : "factura-explicata",
    assets: [
      makeShortVideo(item),
      makeFacebookPost(item),
      makeCarousel(item),
      makeNewsletter(item),
    ],
  };
}

function toMarkdown(plan) {
  const lines = [
    "# Calendar editorial si social media",
    "",
    `Generat automat: ${new Date().toISOString().slice(0, 10)}`,
    "",
    "## Cadenta saptamanala",
    "",
    ...calendar.weeklyCadence.map((item) => `- ${item.weekday}: ${item.target} (${item.channel})`),
    "",
    "## Backlog prioritar",
    "",
    ...calendar.backlog.map((item) => `- [${item.priority}] ${item.title} - ${item.status} - ${item.primaryKeyword}`),
    "",
    "## Asset-uri generate din continut publicat",
    "",
  ];

  plan.generatedFromPublishedContent.forEach((entry) => {
    lines.push(`### ${entry.title}`);
    lines.push("");
    lines.push(`URL: ${entry.url}`);
    lines.push("");
    entry.assets.forEach((asset) => {
      lines.push(`#### ${asset.format} - ${asset.channel}`);
      if (asset.text) lines.push(asset.text);
      if (asset.subject) {
        lines.push(`Subiect: ${asset.subject}`);
        lines.push(`Preview: ${asset.previewText}`);
        lines.push(asset.body);
      }
      if (asset.hook) {
        lines.push(`Hook: ${asset.hook}`);
        lines.push(...asset.script);
        lines.push(`Hashtag-uri: ${asset.hashtags.join(" ")}`);
      }
      if (asset.slides) {
        asset.slides.forEach((slide, index) => {
          lines.push(`${index + 1}. ${slide.title} - ${slide.body}`);
        });
      }
      lines.push("");
    });
  });

  return `${lines.join("\n")}\n`;
}

const published = content
  .filter((item) => item.status === "published")
  .sort((a, b) => new Date(b.publishDate || 0) - new Date(a.publishDate || 0));

const plan = {
  generatedAt: new Date().toISOString(),
  strategy: calendar.strategy,
  contentPillars: calendar.contentPillars,
  weeklyCadence: calendar.weeklyCadence,
  backlog: calendar.backlog,
  generatedFromPublishedContent: published.map(makeAssets),
};

ensureDir(outputDir);
fs.writeFileSync(path.join(outputDir, "social-calendar.json"), JSON.stringify(plan, null, 2) + "\n", "utf8");
fs.writeFileSync(path.join(outputDir, "social-calendar.md"), toMarkdown(plan), "utf8");

console.log(`Generated social assets for ${published.length} published content items.`);
