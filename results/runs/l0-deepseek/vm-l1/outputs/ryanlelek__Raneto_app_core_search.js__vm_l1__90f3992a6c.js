const path = await import('node:path');
const fs = await import('fs-extra');
const snakeCase = await import('lodash/snakeCase.js');
const kebabCase = await import('lodash/kebabCase.js');
const startCase = await import('lodash/startCase.js');
const trim = await import('lodash/trim.js');
const yaml = await import('js-yaml');
const path2 = await import('node:path');
const fs2 = await import('fs-extra');
const moment = await import('moment');
const sanitizeHtml = await import('sanitize-html');
const path3 = await import('node:path');
const fs3 = await import('fs-extra');
const unescape = await import('lodash/unescape.js');
const sanitizeHtml2 = await import('sanitize-html');
const { marked } = await import('marked');
const lunr = await import('lunr');
const lunr_stemmer = await import('lunr-languages/lunr.stemmer.support.js');
const lunr_multi = await import('lunr-languages/lunr.multi.js');
const lunr_tinyseg = await import('lunr-languages/tinyseg.js');
const lunr_da = await import('lunr-languages/lunr.da.js');
const lunr_de = await import('lunr-languages/lunr.de.js');
const lunr_es = await import('lunr-languages/lunr.es.js');
const lunr_fi = await import('lunr-languages/lunr.fi.js');
const lunr_fr = await import('lunr-languages/lunr.fr.js');
const lunr_hu = await import('lunr-languages/lunr.hu.js');
const lunr_ja = await import('lunr-languages/lunr.ja.js');
const lunr_no = await import('lunr-languages/lunr.no.js');
const lunr_pt = await import('lunr-languages/lunr.pt.js');
const lunr_ro = await import('lunr-languages/lunr.ro.js');
const lunr_ru = await import('lunr-languages/lunr.ru.js');
const lunr_sv = await import('lunr-languages/lunr.sv.js');
const lunr_tr = await import('lunr-languages/lunr.tr.js');
const path4 = await import('node:path');
const { glob } = await import('glob');

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(str) {
  return str;
}

function cleanObjectStrings(obj) {
  return obj;
}

function slugToTitle(slug) {
  return startCase(trim(slug));
}

function stripMeta(content) {
  return content.replace(META_REGEX, '').replace(META_REGEX_YAML, '');
}

function processMeta(content) {
  const meta = {};
  const yamlMatch = content.match(META_REGEX_YAML);
  if (yamlMatch) {
    try {
      Object.assign(meta, yaml.load(yamlMatch[1]));
    } catch (e) {}
  }
  const jsMatch = content.match(META_REGEX);
  if (jsMatch) {
    try {
      Object.assign(meta, JSON.parse(jsMatch[1]));
    } catch (e) {}
  }
  return meta;
}

function processVars(content, vars) {
  return content.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, key) => {
    return vars[key] !== undefined ? vars[key] : match;
  });
}

function extractDocument(filePath, content, options = {}) {
  const meta = processMeta(content);
  const body = stripMeta(content);
  return {
    meta,
    body,
    path: filePath,
  };
}

function normalizeDir(dir) {
  return path.normalize(dir);
}

function getSlug(filePath, baseDir) {
  const relative = path.relative(baseDir, filePath);
  return relative.replace(/\\/g, '/').replace(/\.(md|markdown|html?)$/i, '');
}

function getLastModified(filePath, baseDir, stat) {
  if (stat) return stat.mtime;
  return fs.statSync(filePath).mtime;
}

const allowedTags = sanitizeHtml.defaults.allowedTags.concat(['img', 'input', 'del']);
const allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  img: ['src', 'srcset', 'alt', 'width', 'height', 'loading'],
  input: ['type', 'checked', 'disabled'],
  h1: ['id'],
  h2: ['id'],
  h3: ['id'],
  h4: ['id'],
  h5: ['id'],
  h6: ['id'],
  span: ['class'],
  code: ['class'],
  pre: ['class'],
};

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes,
  });
}

function handler(page, options) {
  const content = fs.readFileSync(page.path, 'utf8');
  const meta = processMeta(content);
  const body = stripMeta(content);
  const html = marked(body);
  return {
    ...page,
    meta,
    body,
    html: sanitizeHtmlOutput(html),
  };
}

const languageLoaders = {
  da: lunr_da,
  de: lunr_de,
  es: lunr_es,
  fi: lunr_fi,
  fr: lunr_fr,
  hu: lunr_hu,
  ja: lunr_ja,
  no: lunr_no,
  pt: lunr_pt,
  ro: lunr_ro,
  ru: lunr_ru,
  sv: lunr_sv,
  tr: lunr_tr,
};

let instance = null;
let stemmers = null;

function getLunr(lang) {
  if (instance) return instance;
  instance = lunr;
  if (lang && languageLoaders[lang]) {
    languageLoaders[lang](lunr);
  }
  return instance;
}

function getStemmers(lang) {
  if (stemmers) return stemmers;
  stemmers = {};
  if (lang && languageLoaders[lang]) {
    languageLoaders[lang](lunr);
  }
  return stemmers;
}

function handler2(query, options) {
  const idx = getLunr(options.lang);
  const results = idx.search(query);
  return results;
}

function processSearchResult(results, query, options, page) {
  return results.map(result => {
    return {
      ...result,
      page,
    };
  });
}

const contentProcessors_default = {
  cleanString,
  cleanObjectStrings,
  extractDocument,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars,
};

const utils_default = {
  normalizeDir,
  getLastModified,
  getSlug,
};

const sanitizeHtmlOutput_default = sanitizeHtmlOutput;
const page_default = handler;
const lunr_default = { getLunr, getStemmers };
const search_default = handler2;

export { search_default as default };
