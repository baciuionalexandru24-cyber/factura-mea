const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const contentPath = path.join(rootDir, "src/data/content.json");
const suppliersPath = path.join(rootDir, "src/data/furnizori.json");
const calendarPath = path.join(rootDir, "src/data/editorial-calendar.json");

const allowedTypes = new Set(["article", "news"]);
const allowedStatuses = new Set(["draft", "review", "approved", "published", "archived"]);
const mojibakeMarkers = [
  "\u00c3", "\u00c2", "\u00c4", "\u00c8", "\u00e2\u20ac", "\u00c8\u2122", "\u00c8\u203a", "\u00c4\u0192",
];

const errors = [];
const warnings = [];

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${relative(filePath)} nu este JSON valid: ${error.message}`);
    return null;
  }
}

function relative(filePath) {
  return path.relative(rootDir, filePath).replace(/\\/g, "/");
}

function label(item, index) {
  return `${item.type || "unknown"}:${item.slug || `index-${index}`}`;
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isValidDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
}

function isFutureDate(value) {
  if (!isValidDate(value)) return false;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return new Date(`${value}T00:00:00Z`).getTime() > todayUtc;
}

function hasMojibake(value) {
  if (typeof value === "string") return mojibakeMarkers.some((marker) => value.includes(marker));
  if (Array.isArray(value)) return value.some(hasMojibake);
  if (isPlainObject(value)) return Object.values(value).some(hasMojibake);
  return false;
}

function requireText(item, field, minLength, id) {
  const value = item[field];
  if (typeof value !== "string" || value.trim().length < minLength) {
    errors.push(`${id}: campul ${field} trebuie sa aiba minim ${minLength} caractere.`);
  }
}

function validateSources(item, id) {
  if (!Array.isArray(item.sources) || item.sources.length === 0) {
    errors.push(`${id}: lipseste lista sources.`);
    return;
  }
  item.sources.forEach((source, sourceIndex) => {
    if (!source.name || !source.url) {
      errors.push(`${id}: sources[${sourceIndex}] trebuie sa aiba name si url.`);
      return;
    }
    try {
      const url = new URL(source.url);
      if (!["http:", "https:"].includes(url.protocol)) {
        errors.push(`${id}: sursa ${source.url} trebuie sa foloseasca http/https.`);
      }
    } catch {
      errors.push(`${id}: sursa ${source.url} nu este URL valid.`);
    }
  });
}

function validateFaq(item, id) {
  if (!Array.isArray(item.faq) || item.faq.length < 2) {
    errors.push(`${id}: articolele/stirile publicate trebuie sa aiba cel putin 2 intrebari FAQ.`);
    return;
  }
  item.faq.forEach((entry, entryIndex) => {
    if (!entry.question || !entry.answer) {
      errors.push(`${id}: faq[${entryIndex}] trebuie sa aiba question si answer.`);
    }
  });
}

function validateContent(content) {
  if (!Array.isArray(content)) {
    errors.push("src/data/content.json trebuie sa fie un array.");
    return;
  }

  const slugs = new Set();
  content.forEach((item, index) => {
    const id = label(item, index);

    if (!allowedTypes.has(item.type)) errors.push(`${id}: type trebuie sa fie article sau news.`);
    if (!allowedStatuses.has(item.status)) errors.push(`${id}: status invalid.`);
    if (!item.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) errors.push(`${id}: slug invalid.`);

    const routeKey = `${item.type}:${item.slug}`;
    if (slugs.has(routeKey)) errors.push(`${id}: slug duplicat pentru tipul ${item.type}.`);
    slugs.add(routeKey);

    if (hasMojibake(item)) {
      errors.push(`${id}: textul pare sa contina caractere corupte de encoding.`);
    }

    if (item.status !== "published") return;

    requireText(item, "title", 20, id);
    requireText(item, "excerpt", 50, id);
    requireText(item, "metaDescription", 70, id);
    requireText(item, "intro", 80, id);

    if (!isValidDate(item.publishDate)) errors.push(`${id}: publishDate trebuie sa fie YYYY-MM-DD.`);
    if (!isValidDate(item.lastVerifiedAt)) errors.push(`${id}: lastVerifiedAt trebuie sa fie YYYY-MM-DD.`);
    if (isFutureDate(item.publishDate)) errors.push(`${id}: publishDate este in viitor, dar statusul este published.`);

    if (!isPlainObject(item.author) || !item.author.name) {
      errors.push(`${id}: lipseste author.name.`);
    }

    if (!Array.isArray(item.sections) || item.sections.length < 2) {
      errors.push(`${id}: trebuie sa aiba cel putin 2 sectiuni.`);
    }

    if (item.metaDescription && item.metaDescription.length > 180) {
      warnings.push(`${id}: metaDescription are peste 180 caractere; poate fi taiata in SERP.`);
    }

    validateSources(item, id);
    validateFaq(item, id);
  });
}

function validateSuppliers(suppliers) {
  if (!isPlainObject(suppliers)) {
    errors.push("src/data/furnizori.json trebuie sa fie un obiect.");
    return;
  }

  const slugSet = new Set();
  Object.entries(suppliers).forEach(([name, data]) => {
    const id = `supplier:${name}`;
    if (!name || !isPlainObject(data)) errors.push(`${id}: intrare invalida.`);
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    if (slugSet.has(slug)) errors.push(`${id}: slug duplicat (${slug}).`);
    slugSet.add(slug);

    if (!(Number(data.casnic) > 0)) errors.push(`${id}: casnic trebuie sa fie numar pozitiv.`);
    if (!(Number(data.noncasnic || data.casnic) > 0)) errors.push(`${id}: noncasnic trebuie sa fie numar pozitiv.`);
    if (Number(data.abonament || 0) < 0) errors.push(`${id}: abonament nu poate fi negativ.`);
    if (Number(data.verde || 0) < 0 || Number(data.verde || 0) > 100) errors.push(`${id}: verde trebuie sa fie intre 0 si 100.`);
    if (!data.sursa) errors.push(`${id}: lipseste sursa.`);
    if (!isValidDate(data.actualizatLa)) errors.push(`${id}: actualizatLa trebuie sa fie YYYY-MM-DD.`);
    if (hasMojibake(data)) errors.push(`${id}: textul pare sa contina caractere corupte de encoding.`);
  });
}

function validateEditorialCalendar(calendar) {
  if (!isPlainObject(calendar)) {
    errors.push("src/data/editorial-calendar.json trebuie sa fie un obiect.");
    return;
  }

  if (!isValidDate(calendar.updatedAt)) errors.push("calendar: updatedAt trebuie sa fie YYYY-MM-DD.");
  if (!isPlainObject(calendar.strategy)) errors.push("calendar: lipseste strategy.");

  if (!Array.isArray(calendar.contentPillars) || calendar.contentPillars.length < 3) {
    errors.push("calendar: contentPillars trebuie sa contina cel putin 3 piloni.");
  } else {
    const pillarIds = new Set();
    calendar.contentPillars.forEach((pillar, index) => {
      if (!pillar.id || !pillar.name || !pillar.goal) errors.push(`calendar:pillar[${index}] trebuie sa aiba id, name si goal.`);
      if (pillarIds.has(pillar.id)) errors.push(`calendar:pillar[${index}] are id duplicat (${pillar.id}).`);
      pillarIds.add(pillar.id);
    });
  }

  if (!Array.isArray(calendar.weeklyCadence) || calendar.weeklyCadence.length < 3) {
    errors.push("calendar: weeklyCadence trebuie sa contina cel putin 3 intrari.");
  }

  if (!Array.isArray(calendar.backlog)) {
    errors.push("calendar: backlog trebuie sa fie array.");
  } else {
    const allowedPriorities = new Set(["high", "medium", "low"]);
    const allowedBacklogStatuses = new Set(["idea", "planned", "draft", "review", "published", "archived"]);
    calendar.backlog.forEach((item, index) => {
      const id = item.id || `index-${index}`;
      if (!item.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)) errors.push(`calendar:${id}: id invalid.`);
      if (!allowedPriorities.has(item.priority)) errors.push(`calendar:${id}: priority invalid.`);
      if (!allowedBacklogStatuses.has(item.status)) errors.push(`calendar:${id}: status invalid.`);
      if (!item.pillar || !item.type || !item.primaryKeyword || !item.title) {
        errors.push(`calendar:${id}: lipsesc pillar/type/primaryKeyword/title.`);
      }
    });
  }

  if (hasMojibake(calendar)) errors.push("calendar: textul pare sa contina caractere corupte de encoding.");
}

const content = readJson(contentPath);
const suppliers = readJson(suppliersPath);
const calendar = readJson(calendarPath);

if (content) validateContent(content);
if (suppliers) validateSuppliers(suppliers);
if (calendar) validateEditorialCalendar(calendar);

warnings.forEach((warning) => console.warn(`WARN: ${warning}`));

if (errors.length > 0) {
  console.error("\nValidarea editoriala a esuat:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Editorial validation passed: ${content?.length || 0} content items, ${Object.keys(suppliers || {}).length} suppliers, ${calendar?.backlog?.length || 0} backlog items.`);
