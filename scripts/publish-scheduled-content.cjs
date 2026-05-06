const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const contentPath = path.join(rootDir, "src/data/content.json");
const timezone = process.env.EDITORIAL_TIMEZONE || "Europe/Bucharest";

function todayInTimezone() {
  if (process.env.EDITORIAL_TODAY) return process.env.EDITORIAL_TODAY;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isPublishable(item, today) {
  return item.status === "scheduled" && typeof item.publishDate === "string" && item.publishDate <= today;
}

const today = todayInTimezone();
const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));
let publishedCount = 0;

content.forEach((item) => {
  if (!isPublishable(item, today)) return;

  item.status = "published";
  item.lastVerifiedAt = item.lastVerifiedAt || item.publishDate;
  item.publishedByAutomationAt = new Date().toISOString();
  publishedCount += 1;
});

if (publishedCount > 0) {
  fs.writeFileSync(contentPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
}

console.log(`Scheduled publishing checked for ${today} (${timezone}). Published ${publishedCount} item(s).`);
