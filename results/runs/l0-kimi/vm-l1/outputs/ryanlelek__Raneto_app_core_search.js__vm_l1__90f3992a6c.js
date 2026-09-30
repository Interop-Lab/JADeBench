import path from 'node:path';
import fs from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';
import path2 from 'node:path';
import fs2 from 'fs-extra';
import moment from 'moment';
import sanitizeHtml from 'sanitize-html';
import path3 from 'node:path';
import fs3 from 'fs-extra';
import unescape from 'lodash/unescape.js';
import sanitizeHtml2 from 'sanitize-html';
import { marked } from 'marked';
import lunr from 'lunr';
import lunrStemmerSupport from 'lunr-languages/lunr.stemmer.support.js';
import lunrMulti from 'lunr-languages/lunr.multi.js';
import tinyseg from 'lunr-languages/tinyseg.js';
import lunrDa from 'lunr-languages/lunr.da.js';
import lunrDe from 'lunr-languages/lunr.de.js';
import lunrEs from 'lunr-languages/lunr.es.js';
import lunrFi from 'lunr-languages/lunr.fi.js';
import lunrFr from 'lunr-languages/lunr.fr.js';
import lunrHu from 'lunr-languages/lunr.hu.js';
import lunrJa from 'lunr-languages/lunr.ja.js';
import lunrNo from 'lunr-languages/lunr.no.js';
import lunrPt from 'lunr-languages/lunr.pt.js';
import lunrRo from 'lunr-languages/lunr.ro.js';
import lunrRu from 'lunr-languages/lunr.ru.js';
import lunrSv from 'lunr-languages/lunr.sv.js';
import lunrTr from 'lunr-languages/lunr.tr.js';
import path4 from 'node:path';
import { glob } from 'glob';

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(str) {
  if (!str) return str;
  return str.replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ').trim();
}

function cleanObjectStrings(obj) {
  if (!obj) return obj;
  const result = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      result[key] = cleanString(obj[key]);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}

function slugToTitle(slug) {
  if (!slug) return '';
  const base = path.basename(slug, path.extname(slug));
  return startCase(kebabCase(base).replace(/-/g, ' '));
}

function stripMeta(content) {
  if (!content) return content;
  return content.replace(META_REGEX, '').replace(META_REGEX_YAML, '').trim();
}

function processMeta(content, filePath) {
  if (!content) return {};
  
  const meta = {};
  const yamlMatch = content.match(META_REGEX_YAML);
  const jsdocMatch = content.match(META_REGEX);
  
  if (yamlMatch) {
    try {
      const parsed = yaml.load(yamlMatch[1]);
      if (parsed) Object.assign(meta, parsed);
    } catch (e) {
      // ignore yaml parse errors
    }
  } else if (jsdocMatch) {
    const lines = jsdocMatch[1].split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*\*\s*@(\w+)\s*(.*)$/);
      if (match) {
        const [, key, value] = match;
        meta[key] = value.trim();
      }
    }
  }
  
  meta.title = meta.title || slugToTitle(filePath);
  meta.lastModified = meta.lastModified || new Date().toISOString();
  
  return cleanObjectStrings(meta);
}

function processVars(content, vars) {
  if (!content || !vars) return content;
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value);
  }
  return result;
}

function extractDocument(filePath, content, basePath) {
  const meta = processMeta(content, filePath);
  const body = stripMeta(content);
  const relativePath = path.relative(basePath, filePath);
  
  return {
    id: relativePath,
    path: relativePath,
    title: meta.title || slugToTitle(filePath),
    body: cleanString(body),
    meta: meta
  };
}

function normalizeDir(dir) {
  return path.normalize(dir).replace(/\\/g, '/');
}

function getSlug(filePath, basePath) {
  const relative = path.relative(basePath, filePath);
  const ext = path.extname(relative);
  return relative.slice(0, -ext.length).replace(/\\/g, '/');
}

function getLastModified(filePath, stat, fallback) {
  try {
    const stats = stat || fs.statSync(filePath);
    return stats.mtime.toISOString();
  } catch (e) {
    return fallback || new Date().toISOString();
  }
}

const allowedTags = sanitizeHtml.defaults.allowedTags.concat(['img', 'input', 'del']);

const allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  'img': ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
  'input': ['type', 'checked', 'disabled'],
  'h1': ['id'],
  'h2': ['id'],
  'h3': ['id'],
  'h4': ['id'],
  'h5': ['id'],
  'h6': ['id'],
  'span': ['class'],
  'code': ['class'],
  'pre': ['class']
};

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes
  });
}

function handler(event, context) {
  const { filePath, basePath, content } = event;
  
  if (!filePath || !content) {
    return { statusCode: 400, body: 'Missing required fields' };
  }
  
  try {
    const doc = extractDocument(filePath, content, basePath || process.cwd());
    const sanitized = sanitizeHtmlOutput(marked.parse(doc.body));
    
    return {
      statusCode: 200,
      body: {
        document: doc,
        html: sanitized,
        meta: doc.meta
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}

const contentProcessors_default = {
  cleanString,
  cleanObjectStrings,
  extractDocument,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars
};

const utils_default = {
  normalizeDir,
  getLastModified,
  getSlug
};

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

let instance = null;
let stemmers = null;

function getLunr(languages) {
  if (!instance) {
    lunrStemmerSupport(lunr);
    
    if (languages && languages.length > 0) {
      const multiBuilder = new lunr.MultiLanguageBuilder();
      
      for (const lang of languages) {
        if (languageLoaders[lang]) {
          languageLoaders[lang](lunr);
          multiBuilder.addLanguage(lang);
        }
      }
      
      instance = multiBuilder.build();
    } else {
      instance = lunr;
    }
  }
  
  return instance;
}

function getStemmers(languages) {
  if (!stemmers) {
    stemmers = {};
    lunrStemmerSupport(lunr);
    
    for (const lang of languages || ['en']) {
      if (languageLoaders[lang]) {
        languageLoaders[lang](lunr);
        stemmers[lang] = lunr[lang];
      }
    }
  }
  
  return stemmers;
}

const lunr_default = {
  getLunr,
  getStemmers
};

function handler2(event, context) {
  const { query, documents, languages } = event;
  
  if (!query || !documents) {
    return { statusCode: 400, body: 'Missing required fields' };
  }
  
  try {
    const idx = lunr(function() {
      this.ref('id');
      this.field('title');
      this.field('body');
      
      for (const doc of documents) {
        this.add(doc);
      }
    });
    
    const results = idx.search(query);
    const processed = processSearchResult(results, documents, query, languages);
    
    return {
      statusCode: 200,
      body: processed
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}

function processSearchResult(results, documents, query, languages) {
  const docMap = new Map(documents.map(d => [d.id, d]));
  
  return results.map(result => {
    const doc = docMap.get(result.ref);
    return {
      ...result,
      document: doc,
      title: doc?.title || result.ref,
      excerpt: doc?.body?.slice(0, 200) + '...' || ''
    };
  });
}

const search_default = handler2;

export {
  search_default as default,
  handler,
  handler2,
  processSearchResult,
  getLunr,
  getStemmers,
  sanitizeHtmlOutput,
  getLastModified,
  extractDocument,
  processVars,
  processMeta,
  stripMeta,
  slugToTitle,
  cleanObjectStrings,
  cleanString,
  normalizeDir,
  getSlug,
  contentProcessors_default,
  utils_default,
  lunr_default,
  languageLoaders,
  allowedTags,
  allowedAttributes,
  META_REGEX,
  META_REGEX_YAML
};
