import path from 'node:path';
import fs from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';
import moment from 'moment';
import sanitizeHtml from 'sanitize-html';
import unescape from 'lodash/unescape.js';
import { marked } from 'marked';
import lunr from 'lunr';
import addStemmerSupport from 'lunr-languages/lunr.stemmer.support.js';
import addMultiLanguageSupport from 'lunr-languages/lunr.multi.js';
import addJapaneseSupport from 'lunr-languages/tinyseg.js';
import addDanishSupport from 'lunr-languages/lunr.da.js';
import addGermanSupport from 'lunr-languages/lunr.de.js';
import addSpanishSupport from 'lunr-languages/lunr.es.js';
import addFinnishSupport from 'lunr-languages/lunr.fi.js';
import addFrenchSupport from 'lunr-languages/lunr.fr.js';
import addHungarianSupport from 'lunr-languages/lunr.hu.js';
import addJapaneseLanguage from 'lunr-languages/lunr.ja.js';
import addNorwegianSupport from 'lunr-languages/lunr.no.js';
import addPortugueseSupport from 'lunr-languages/lunr.pt.js';
import addRomanianSupport from 'lunr-languages/lunr.ro.js';
import addRussianSupport from 'lunr-languages/lunr.ru.js';
import addSwedishSupport from 'lunr-languages/lunr.sv.js';
import addTurkishSupport from 'lunr-languages/lunr.tr.js';
import { glob } from 'glob';

const COMMENT_META_PATTERN = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const YAML_META_PATTERN = /^\uFEFF?---([\s\S]*?)---/i;

const languageLoaders = {
  da: addDanishSupport,
  de: addGermanSupport,
  es: addSpanishSupport,
  fi: addFinnishSupport,
  fr: addFrenchSupport,
  hu: addHungarianSupport,
  ja: addJapaneseLanguage,
  no: addNorwegianSupport,
  pt: addPortugueseSupport,
  ro: addRomanianSupport,
  ru: addRussianSupport,
  sv: addSwedishSupport,
  tr: addTurkishSupport,
};

let searchIndex = null;
let languageStemmers = null;

function cleanString(value) {
  return kebabCase(value.replaceAll('/', ' '));
}

function cleanObjectStrings(value) {
  return Object.entries(value || {}).reduce((result, [key, item]) => {
    result[key] = trim(String(item));
    return result;
  }, {});
}

function slugToTitle(slug) {
  return startCase(path.basename(slug));
}

function findMetadata(source) {
  return source.match(YAML_META_PATTERN) || source.match(COMMENT_META_PATTERN);
}

function stripMeta(source) {
  const match = typeof source === 'string' && findMetadata(source);
  return trim(match ? source.replace(match[0], '') : source);
}

function processMeta(source) {
  if (typeof source !== 'string') return {};

  try {
    const yamlMatch = source.match(YAML_META_PATTERN);
    if (yamlMatch) return cleanObjectStrings(yaml.load(yamlMatch[1]));

    const commentMatch = source.match(COMMENT_META_PATTERN);
    if (!commentMatch) return {};

    return cleanObjectStrings(
      commentMatch[1].split('\n').reduce((metadata, line) => {
        const separator = line.indexOf(':');
        if (separator !== -1) {
          metadata[line.slice(0, separator)] = line.slice(separator + 1);
        }
        return metadata;
      }, {}),
    );
  } catch {
    return {};
  }
}

function processVars(source, settings) {
  let result = source;
  settings?.variables?.forEach(({ name, content }) => {
    result = result.replaceAll('%' + name + '%', content);
  });
  if (settings?.base_url !== undefined) {
    result = result.replaceAll('%base_url%', settings.base_url);
  }
  if (settings?.image_url !== undefined) {
    result = result.replaceAll('%image_url%', settings.image_url);
  }
  return result;
}

function normalizeDir(directory) {
  return directory.replaceAll('\\', '/');
}

function getSlug(filePath, contentDirectory) {
  return normalizeDir(filePath).replace(normalizeDir(contentDirectory), '');
}

async function getLastModified(settings, metadata, filePath) {
  if (metadata.modified !== undefined) return moment(metadata.modified).format();
  const stats = await fs.stat(path.join(settings.content_dir, filePath));
  return moment(stats.mtime).format();
}

async function extractDocument(contentDirectory, filePath) {
  try {
    const source = await fs.readFile(filePath, 'utf8');
    const metadata = processMeta(source);
    const id = getSlug(filePath, contentDirectory);
    return {
      id,
      title: metadata.title || slugToTitle(path.parse(id).name),
      body: source,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

const allowedTags = sanitizeHtml.defaults.allowedTags.concat(['img', 'input', 'del']);
const allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
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
  return sanitizeHtml(html, { allowedTags, allowedAttributes });
}

function truncateExcerpt(excerpt, maximumLength) {
  if (!maximumLength || excerpt.length <= maximumLength) return excerpt;
  return excerpt.slice(0, maximumLength).replace(/\s+\S*$/, '') + '...';
}

async function renderPage(filePath, settings) {
  try {
    const contentDirectory = normalizeDir(settings.content_dir);
    const slug = getSlug(filePath, contentDirectory).replace(/\.md$/i, '');
    const source = await fs.readFile(filePath, 'utf8');
    const metadata = processMeta(source);
    const markdown = processVars(stripMeta(source), settings);
    const body = sanitizeHtmlOutput(await marked(markdown));
    const plainText = unescape(
      sanitizeHtml(body, { allowedTags: [], allowedAttributes: {} }),
    );

    return {
      slug,
      title: metadata.title || slugToTitle(slug),
      body,
      excerpt: truncateExcerpt(plainText, settings.excerpt_length),
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

function getLunr(settings) {
  addStemmerSupport(lunr);
  addMultiLanguageSupport(lunr);
  addJapaneseSupport(lunr);
  settings.searchExtraLanguages.forEach((language) => {
    languageLoaders[language]?.(lunr);
  });
  return lunr;
}

function getStemmers(settings) {
  return lunr.multiLanguage('en', ...settings.searchExtraLanguages);
}

function searchWithFallbacks(index, query) {
  const normalizedQuery = trim(query);
  const words = normalizedQuery.split(/\s+/);
  const attempts = [normalizedQuery];
  if (words.length > 1) attempts.push(words.join(' OR '));
  attempts.push(normalizedQuery + '~1');
  attempts.push(normalizedQuery + '*');
  attempts.push(words.map((word) => word + '~1').join(' OR '));

  for (const attempt of attempts) {
    try {
      const results = index.search(attempt);
      if (results.length) return results;
    } catch {
      // Lunr rejects some punctuation combinations; the next strategy may work.
    }
  }
  return [];
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&');
}

function highlightMatches(excerpt, query) {
  const pattern = new RegExp(escapeRegExp(trim(query)), 'gi');
  return excerpt.replace(pattern, (match) =>
    '<span class="search-query">' + match + '</span>',
  );
}

async function processSearchResult(contentDirectory, settings, query, searchResult) {
  const filePath = path.join(contentDirectory, searchResult.ref);
  const page = await renderPage(filePath, settings);
  if (!page) return null;
  return {
    ...page,
    excerpt: highlightMatches(page.excerpt, query),
    category: '',
  };
}

async function search(query, settings) {
  const contentDirectory = normalizeDir(settings.content_dir);

  if (!searchIndex) {
    if (settings.debug) console.log('Building search index');
    const files = await glob(contentDirectory + '/**/*.md');
    const documents = (
      await Promise.all(files.map((file) => extractDocument(contentDirectory, file)))
    ).filter(Boolean);
    const lunrInstance = getLunr(settings);
    languageStemmers = getStemmers(settings);
    searchIndex = lunrInstance(function buildIndex() {
      this.use(languageStemmers);
      this.field('title', { boost: 10 });
      this.field('body');
      this.ref('id');
      documents.forEach((document) => this.add(document));
    });
  }

  const results = searchWithFallbacks(searchIndex, query);
  return (
    await Promise.all(
      results.map((result) =>
        processSearchResult(contentDirectory, settings, query, result),
      ),
    )
  ).filter(Boolean);
}

export { search as default };
