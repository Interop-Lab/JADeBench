import path from 'node:path';
import fs from 'fs-extra';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';
import sanitizeHtml from 'sanitize-html';
import unescape from 'lodash/unescape.js';
import { marked } from 'marked';
import lunr from 'lunr';
import stemmerSupport from 'lunr-languages/lunr.stemmer.support.js';
import multiLanguage from 'lunr-languages/lunr.multi.js';
import tinyseg from 'lunr-languages/tinyseg.js';
import danish from 'lunr-languages/lunr.da.js';
import german from 'lunr-languages/lunr.de.js';
import spanish from 'lunr-languages/lunr.es.js';
import finnish from 'lunr-languages/lunr.fi.js';
import french from 'lunr-languages/lunr.fr.js';
import hungarian from 'lunr-languages/lunr.hu.js';
import japanese from 'lunr-languages/lunr.ja.js';
import norwegian from 'lunr-languages/lunr.no.js';
import portuguese from 'lunr-languages/lunr.pt.js';
import romanian from 'lunr-languages/lunr.ro.js';
import russian from 'lunr-languages/lunr.ru.js';
import swedish from 'lunr-languages/lunr.sv.js';
import turkish from 'lunr-languages/lunr.tr.js';
import { glob } from 'glob';

const MARKDOWN_EXTENSION = '.md';
const INDEX_FILENAME = 'index.md';
const COMMENT_META = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const YAML_META = /^\uFEFF?---([\s\S]*?)---/i;

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

const languageLoaders = {
  da: danish,
  de: german,
  es: spanish,
  fi: finnish,
  fr: french,
  hu: hungarian,
  ja: japanese,
  no: norwegian,
  pt: portuguese,
  ro: romanian,
  ru: russian,
  sv: swedish,
  tr: turkish,
};

let lunrInstance;
let stemmers;

function cleanObjectStrings(object) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, trim(String(value))]));
}

function slugToTitle(slug) {
  return startCase(path.basename(slug, path.extname(slug)));
}

function metadataMatch(content) {
  return content.match(YAML_META) || content.match(COMMENT_META);
}

function stripMeta(content) {
  return content.replace(YAML_META, '').replace(COMMENT_META, '').trim();
}

function processMeta(content) {
  const match = metadataMatch(content);
  if (!match) return {};
  const parsed = yaml.load(match[1]) || {};
  return cleanObjectStrings(parsed);
}

function processVars(content, config) {
  const variables = Array.isArray(config.variables) ? config.variables : [];
  for (const variable of variables) {
    content = content.replaceAll(`%${variable.name}%`, variable.value);
  }
  return content
    .replaceAll('%base_url%', config.base_url)
    .replaceAll('%image_url%', config.image_url);
}

function normalizeDir(directory) {
  return directory.replaceAll('\\', '/');
}

function getSlug(filename, contentDirectory) {
  return normalizeDir(filename.replace(contentDirectory, ''));
}

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, { allowedTags, allowedAttributes });
}

async function page(filename, config) {
  try {
    const contentDirectory = normalizeDir(path.normalize(config.content_dir));
    const source = await fs.readFile(filename, 'utf8');
    let slug = getSlug(filename, contentDirectory);
    if (slug.includes(INDEX_FILENAME)) slug = slug.replaceAll(INDEX_FILENAME, '');
    slug = slug.replaceAll(MARKDOWN_EXTENSION, '').trim();

    const metadata = processMeta(source);
    const body = sanitizeHtmlOutput(marked(processVars(stripMeta(source), config)));
    const title = metadata.title || slugToTitle(slug);
    let excerpt = unescape(sanitizeHtml(body, { allowedTags: [], allowedAttributes: {} }));
    const excerptLength = config.excerpt_length || 400;
    if (excerpt.length > excerptLength) {
      excerpt = `${excerpt.slice(0, excerptLength).trimEnd().replace(/\s\S+$/, '')}...`;
    }

    return { slug, title, body, excerpt };
  } catch (error) {
    if (config.debug) console.log(error);
    return null;
  }
}

function installLanguages() {
  stemmerSupport(lunr);
  tinyseg(lunr);
  for (const load of Object.values(languageLoaders)) load(lunr);
  multiLanguage(lunr);
}

function getLunr() {
  if (lunrInstance) return lunrInstance;
  installLanguages();
  lunrInstance = lunr;
  return lunrInstance;
}

function getStemmers(config) {
  if (stemmers) return stemmers;
  getLunr(config);
  const languageNames = ['en'].concat(config.searchExtraLanguages || []);
  stemmers = languageNames.map(language => {
    const stemmer = language === 'en' ? lunr.stemmer : lunr[language]?.stemmer;
    if (!stemmer) return null;
    return word => stemmer(new lunr.Token(word)).toString();
  }).filter(Boolean);
  return stemmers;
}

function highlightExcerpt(excerpt, stem) {
  const escapedStem = stem.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return excerpt.replaceAll(
    new RegExp(`(${escapedStem}\\w*)`, 'gim'),
    '<span class="search-query">$1</span>',
  );
}

async function processSearchResult(config, result, stemmer) {
  const filename = path.join(config.content_dir, result.ref);
  const document = await page(filename, config);
  if (!document) return null;

  const slugParts = document.slug.split('/');
  document.category = slugParts.length > 1 ? slugParts.at(-2) : '';
  document.excerpt = highlightExcerpt(document.excerpt, stemmer);
  return document;
}

async function search(query, config) {
  const contentDirectory = normalizeDir(path.normalize(config.content_dir));
  const filenames = await glob(path.join(contentDirectory, '**', '*.md'));
  const relativeFilenames = filenames.map(filename => getSlug(filename, contentDirectory).replace(/^\//, ''));
  const pages = await Promise.all(relativeFilenames.map(filename => page(path.join(contentDirectory, filename), config)));
  const documents = pages.flatMap((document, index) => document ? [{ ...document, ref: relativeFilenames[index] }] : []);
  const createIndex = getLunr();
  const extraLanguages = config.searchExtraLanguages || [];
  const index = createIndex(function buildIndex() {
    if (extraLanguages.length) this.use(lunr.multiLanguage('en', ...extraLanguages));
    this.ref('ref');
    this.field('title', { boost: 10 });
    this.field('body');
    this.field('excerpt');
    documents.forEach(document => this.add(document));
  });

  const normalizedQuery = query.replaceAll(/[~*+\-^:]/g, ' ').replaceAll(/\s+/g, ' ').trim();
  let results = index.search(normalizedQuery);
  if (results.length === 0 && normalizedQuery.includes(' ')) {
    results = index.search(normalizedQuery.split(' ').join(' OR '));
  }
  if (results.length === 0) results = index.search(`${normalizedQuery}~1`);
  if (results.length === 0) results = index.search(`${normalizedQuery}*`);

  const queryStems = getStemmers(config).map(stemmer => stemmer(normalizedQuery));
  const processedResults = await Promise.all(
    results.map(result => Promise.all(queryStems.map(stem => processSearchResult(config, result, stem)))),
  );
  return processedResults.flat().filter(Boolean);
}

export default search;
