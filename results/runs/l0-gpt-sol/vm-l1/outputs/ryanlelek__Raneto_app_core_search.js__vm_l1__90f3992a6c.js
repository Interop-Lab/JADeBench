import path from "node:path";
import fs from "fs-extra";
import snakeCase from "lodash/snakeCase.js";
import kebabCase from "lodash/kebabCase.js";
import startCase from "lodash/startCase.js";
import trim from "lodash/trim.js";
import yaml from "js-yaml";
import moment from "moment";
import sanitizeHtml from "sanitize-html";
import unescape from "lodash/unescape.js";
import { marked } from "marked";
import lunr from "lunr";
import stemmerSupport from "lunr-languages/lunr.stemmer.support.js";
import multiLanguage from "lunr-languages/lunr.multi.js";
import tinyseg from "lunr-languages/tinyseg.js";
import lunrDa from "lunr-languages/lunr.da.js";
import lunrDe from "lunr-languages/lunr.de.js";
import lunrEs from "lunr-languages/lunr.es.js";
import lunrFi from "lunr-languages/lunr.fi.js";
import lunrFr from "lunr-languages/lunr.fr.js";
import lunrHu from "lunr-languages/lunr.hu.js";
import lunrJa from "lunr-languages/lunr.ja.js";
import lunrNo from "lunr-languages/lunr.no.js";
import lunrPt from "lunr-languages/lunr.pt.js";
import lunrRo from "lunr-languages/lunr.ro.js";
import lunrRu from "lunr-languages/lunr.ru.js";
import lunrSv from "lunr-languages/lunr.sv.js";
import lunrTr from "lunr-languages/lunr.tr.js";
import { glob } from "glob";

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

const languageLoaders = {
  da: lunrDa,
  de: lunrDe,
  es: lunrEs,
  fi: lunrFi,
  fr: lunrFr,
  hu: lunrHu,
  ja: lunrJa,
  no: lunrNo,
  pt: lunrPt,
  ro: lunrRo,
  ru: lunrRu,
  sv: lunrSv,
  tr: lunrTr
};

let lunrInitialized = false;

function initializeLunr() {
  if (lunrInitialized) return lunr;

  stemmerSupport(lunr);
  multiLanguage(lunr);
  tinyseg(lunr);

  for (const loader of Object.values(languageLoaders)) {
    loader(lunr);
  }

  lunrInitialized = true;
  return lunr;
}

function cleanString(value) {
  if (value == null) return "";
  return trim(unescape(String(value))).replace(/\s+/g, " ");
}

function cleanObjectStrings(value) {
  if (Array.isArray(value)) return value.map(cleanObjectStrings);

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        cleanObjectStrings(child)
      ])
    );
  }

  return typeof value === "string" ? cleanString(value) : value;
}

function slugToTitle(slug) {
  const name = String(slug ?? "")
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .pop()
    ?.replace(/\.[^.]+$/, "") ?? "";

  return startCase(name.replace(/[-_]+/g, " "));
}

function stripMeta(content) {
  return String(content ?? "")
    .replace(META_REGEX, "")
    .replace(META_REGEX_YAML, "")
    .trim();
}

function processMeta(content) {
  const source = String(content ?? "");
  const yamlMatch = source.match(META_REGEX_YAML);

  if (yamlMatch) {
    return yaml.load(yamlMatch[1]) || {};
  }

  const commentMatch = source.match(META_REGEX);
  if (!commentMatch) return {};

  try {
    return yaml.load(commentMatch[1]) || {};
  } catch {
    return {};
  }
}

function processVars(value, variables = {}) {
  if (typeof value !== "string") return value;

  return value.replace(
    /\{\{\s*([\w.-]+)\s*\}\}/g,
    (match, key) => {
      const resolved = key.split(".").reduce(
        (current, part) => current?.[part],
        variables
      );
      return resolved == null ? match : String(resolved);
    }
  );
}

function normalizeDir(directory) {
  return path.resolve(String(directory || "."));
}

function getSlug(file, root = process.cwd()) {
  return kebabCase(
    path.relative(root, file)
      .replace(/\\/g, "/")
      .replace(/\.[^.]+$/, "")
      .replace(/\/index$/i, "")
  ).replace(/^-+|-+$/g, "");
}

async function getLastModified(file) {
  const stat = await fs.stat(file);
  return stat.mtime;
}

function extractDocument(content, filename = "", variables = {}) {
  const metadata = cleanObjectStrings(processMeta(content));
  const markdown = processVars(stripMeta(content), variables);
  const slug = metadata.slug || getSlug(filename || metadata.title || "");
  const title = cleanString(metadata.title || slugToTitle(slug));
  const html = marked.parse(markdown);

  return {
    ...metadata,
    slug,
    title,
    content: cleanString(
      String(html)
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
    ),
    markdown,
    filename,
    lastModified: metadata.lastModified
      ? moment(metadata.lastModified).toISOString()
      : undefined
  };
}

const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
  "input",
  "img",
  "del"
]);

const allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
  input: ["type", "checked", "disabled"],
  h1: ["id"],
  h2: ["id"],
  h3: ["id"],
  h4: ["id"],
  h5: ["id"],
  h6: ["id"],
  span: ["class"],
  code: ["class"],
  pre: ["class"]
};

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(String(html ?? ""), {
    allowedTags,
    allowedAttributes
  });
}

function normalizeLanguages(value) {
  const languages = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[\s,]+/)
      : [];

  return [...new Set(
    languages
      .map(language => String(language).toLowerCase())
      .filter(Boolean)
  )];
}

function configurePipeline(builder, languages) {
  if (!languages.length || languages.includes("en")) return;

  if (languages.length === 1) {
    const plugin = lunr[languages[0]];
    if (typeof plugin === "function") builder.use(plugin);
    return;
  }

  if (typeof lunr.multiLanguage === "function") {
    builder.use(lunr.multiLanguage(...languages));
  }
}

function documentReference(document, index) {
  return String(
    document.ref ??
    document.id ??
    document.slug ??
    document.url ??
    index
  );
}

function buildIndex(documents, options = {}) {
  const library = initializeLunr();
  const languages = normalizeLanguages(
    options.languages ?? options.language
  );

  const fields = Array.isArray(options.fields) && options.fields.length
    ? options.fields
    : ["title", "content"];

  const references = new Map();

  const index = library(function () {
    this.ref("_searchRef");

    for (const field of fields) {
      const fieldName = typeof field === "string" ? field : field.name;
      if (!fieldName) continue;

      const fieldOptions =
        typeof field === "object" && field.boost != null
          ? { boost: Number(field.boost) }
          : fieldName === "title"
            ? { boost: 10 }
            : undefined;

      this.field(fieldName, fieldOptions);
    }

    configurePipeline(this, languages);

    documents.forEach((document, position) => {
      const ref = documentReference(document, position);
      references.set(ref, document);

      const indexedDocument = {
        ...document,
        _searchRef: ref
      };

      for (const field of fields) {
        const fieldName = typeof field === "string" ? field : field.name;
        if (fieldName && indexedDocument[fieldName] != null) {
          indexedDocument[fieldName] = cleanString(indexedDocument[fieldName]);
        }
      }

      this.add(indexedDocument);
    });
  });

  return { index, references };
}

function getMatchTerms(result) {
  return Object.keys(result.matchData?.metadata || {});
}

function createExcerpt(document, terms, length = 240) {
  const content = cleanString(
    document.excerpt ??
    document.description ??
    document.content ??
    document.body ??
    ""
  );

  if (!content) return "";

  const lowerContent = content.toLowerCase();
  let offset = -1;

  for (const term of terms) {
    const position = lowerContent.indexOf(String(term).toLowerCase());
    if (position !== -1 && (offset === -1 || position < offset)) {
      offset = position;
    }
  }

  if (offset === -1) return content.slice(0, length);

  const start = Math.max(0, offset - Math.floor(length / 3));
  const end = Math.min(content.length, start + length);

  return `${start > 0 ? "…" : ""}${content.slice(start, end)}${
    end < content.length ? "…" : ""
  }`;
}

function processSearchResult(result, references, query, options = {}) {
  const document = references.get(String(result.ref)) || {};
  const terms = getMatchTerms(result);

  return {
    ...document,
    ref: result.ref,
    score: result.score,
    matchData: result.matchData,
    query,
    excerpt: createExcerpt(
      document,
      terms,
      Number(options.excerptLength) || 240
    )
  };
}

function requestData(request) {
  if (!request) return {};

  let body = request.body ?? request;

  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = { query: body };
    }
  }

  return {
    ...(request.query && typeof request.query === "object"
      ? request.query
      : {}),
    ...(body && typeof body === "object" ? body : {})
  };
}

function sendResponse(response, status, payload) {
  if (!response) return payload;

  if (typeof response.status === "function") {
    const target = response.status(status);
    if (typeof target.json === "function") return target.json(payload);
    if (typeof target.send === "function") return target.send(payload);
  }

  response.statusCode = status;

  if (typeof response.json === "function") return response.json(payload);
  if (typeof response.send === "function") return response.send(payload);
  if (typeof response.end === "function") {
    response.setHeader?.("content-type", "application/json; charset=utf-8");
    return response.end(JSON.stringify(payload));
  }

  return payload;
}

async function loadDocuments(data) {
  if (Array.isArray(data.documents)) return data.documents;
  if (Array.isArray(data.pages)) return data.pages;
  if (Array.isArray(data.data)) return data.data;

  const pattern = data.glob ?? data.pattern;
  if (!pattern) return [];

  const cwd = normalizeDir(data.cwd || process.cwd());
  const files = await glob(pattern, {
    cwd,
    absolute: true,
    nodir: true
  });

  return Promise.all(
    files.map(async filename => {
      const content = await fs.readFile(filename, "utf8");
      const document = extractDocument(content, filename, data.variables);
      const modified = await getLastModified(filename).catch(() => undefined);

      return {
        ...document,
        lastModified:
          document.lastModified ||
          (modified ? modified.toISOString() : undefined)
      };
    })
  );
}

async function handler(request, response) {
  try {
    const data = requestData(request);
    const documents = await loadDocuments(data);
    const query = cleanString(
      data.query ?? data.q ?? data.term ?? data.searchTerm ?? ""
    );

    if (!query) return sendResponse(response, 200, []);

    const { index, references } = buildIndex(documents, data);
    let results;

    try {
      results = index.search(query);
    } catch {
      const escaped = query
        .split(/\s+/)
        .filter(Boolean)
        .map(term => `${term.replace(/[+\-&|!(){}[\]^"~*?:\\/]/g, "\\$&")}*`)
        .join(" ");

      results = escaped ? index.search(escaped) : [];
    }

    const limit = Math.max(
      0,
      Number(data.limit ?? data.maxResults ?? results.length) || results.length
    );

    const output = results
      .slice(0, limit)
      .map(result =>
        processSearchResult(result, references, query, data)
      );

    return sendResponse(response, 200, output);
  } catch (error) {
    const payload = {
      error: error instanceof Error ? error.message : String(error)
    };

    if (!response) throw error;
    return sendResponse(response, 500, payload);
  }
}

export { handler as default };
