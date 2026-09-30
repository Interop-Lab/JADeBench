import i18n from 'es2015-i18n-tag';
import { map, list, flat, filter, size, foldl } from 'ferrum';
import { root, paragraph, text, heading, code, table, tableRow, tableCell, link, inlineCode, list, listItem, strong, blockquote } from 'mdast-builder';
import i18n2 from 'es2015-i18n-tag';
import GhSlugger from 'github-slugger';
import yaml from 'js-yaml';

const filename = Symbol('filename');
const fullpath = Symbol('fullpath');
const symbols = {
  pointer: Symbol('pointer'),
  filename,
  fullpath,
  id: Symbol('id'),
  titles: Symbol('titles'),
  resolve: Symbol('resolve'),
  slug: Symbol('slug'),
  meta: Symbol('meta'),
  parent: Symbol('parent')
};
const symbols_default = symbols;
const used = new Set();

function gentitle(entry, parent) {
  const pointer = entry[symbols.pointer];
  const titles = entry[symbols.titles];
  if (titles && titles.length > 0) {
    return titles[0];
  }
  if (pointer && pointer[symbols.meta] && pointer[symbols.meta].title) {
    return pointer[symbols.meta].title;
  }
  return parent && parent[symbols.meta] && parent[symbols.meta].title ? parent[symbols.meta].title : 'Untitled';
}

function gendescription(entry) {
  const pointer = entry[symbols.pointer];
  if (pointer && pointer[symbols.meta] && pointer[symbols.meta].description) {
    return pointer[symbols.meta].description;
  }
  return '';
}

function keyword(entry) {
  const pointer = entry[symbols.pointer];
  if (pointer && pointer[symbols.meta] && pointer[symbols.meta].keyword) {
    return pointer[symbols.meta].keyword;
  }
  return '';
}

function report(entry) {
  const pointer = entry[symbols.pointer];
  const meta = pointer && pointer[symbols.meta];
  if (!meta) return [];
  const results = [];
  if (meta.title) results.push({ type: 'title', value: meta.title });
  if (meta.description) results.push({ type: 'description', value: meta.description });
  if (meta.keyword) results.push({ type: 'keyword', value: meta.keyword });
  return results;
}

function build(entry) {
  const slugger = new GhSlugger();
  const title = gentitle(entry, null);
  const description = gendescription(entry);
  const kw = keyword(entry);
  const rep = report(entry);

  const children = [];
  children.push(heading(1, text(title)));
  if (description) {
    children.push(paragraph(text(description)));
  }
  if (kw) {
    children.push(paragraph(strong(text(`Keyword: ${kw}`))));
  }
  if (rep.length > 0) {
    const rows = [tableRow([tableCell(text('Type')), tableCell(text('Value'))])];
    for (const item of rep) {
      rows.push(tableRow([tableCell(text(item.type)), tableCell(text(item.value))]));
    }
    children.push(table(rows, [null, null]));
  }

  return root(children);
}

export { build as default };
