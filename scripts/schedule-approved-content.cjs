const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const contentPath = path.join(rootDir, "src/data/content.json");
const calendar = require(path.join(rootDir, "src/data/editorial-calendar.json"));
const timezone = process.env.EDITORIAL_TIMEZONE || calendar.automation?.timezone || "Europe/Bucharest";

const weekdays = {
  duminica: 0,
  luni: 1,
  marti: 2,
  miercuri: 3,
  joi: 4,
  vineri: 5,
  sambata: 6,
};

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

function toDate(dateString) {
  return new Date(`${dateString}T00:00:00Z`);
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function nextWeekdayOnOrAfter(startDateString, weekdayName) {
  const targetDay = weekdays[weekdayName] ?? 1;
  const date = toDate(startDateString);
  const diff = (targetDay - date.getUTCDay() + 7) % 7;
  date.setUTCDate(date.getUTCDate() + diff);
  return formatDate(date);
}

function addDays(dateString, days) {
  const date = toDate(dateString);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDate(date);
}

function cadenceFor(item) {
  if (item.type === "news") {
    return {
      weekday: calendar.automation?.defaultNewsWeekday || "joi",
      minGap: Number(calendar.automation?.minDaysBetweenNews || 2),
    };
  }
  return {
    weekday: calendar.automation?.defaultArticleWeekday || "luni",
    minGap: Number(calendar.automation?.minDaysBetweenArticles || 7),
  };
}

function takenDates(content, type) {
  return new Set(
    content
      .filter((item) => item.type === type && ["scheduled", "published"].includes(item.status) && item.publishDate)
      .map((item) => item.publishDate)
  );
}

function findNextSlot(content, item, today) {
  const { weekday, minGap } = cadenceFor(item);
  const occupied = takenDates(content, item.type);
  let candidate = nextWeekdayOnOrAfter(today, weekday);

  while (occupied.has(candidate)) {
    candidate = nextWeekdayOnOrAfter(addDays(candidate, minGap), weekday);
  }

  occupied.add(candidate);
  return candidate;
}

const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));
const today = todayInTimezone();
let scheduledCount = 0;

content
  .filter((item) => item.status === "approved")
  .sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
  })
  .forEach((item) => {
    if (!item.publishDate || item.publishDate < today) {
      item.publishDate = findNextSlot(content, item, today);
    }
    item.status = "scheduled";
    item.scheduledByAutomationAt = new Date().toISOString();
    scheduledCount += 1;
  });

if (scheduledCount > 0) {
  fs.writeFileSync(contentPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
}

console.log(`Auto-scheduler checked ${today} (${timezone}). Scheduled ${scheduledCount} approved item(s).`);
