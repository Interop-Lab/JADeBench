import i18n from 'es2015-i18n-tag';
import { map, list as flist, flat, filter, size, foldl } from 'ferrum';
import { root, paragraph, text, heading, code, table, tableRow, tableCell, link, inlineCode, list, listItem, strong, blockquote } from 'mdast-builder';
import i18n2 from 'es2015-i18n-tag';
import GhSlugger from 'github-slugger';
import yaml from 'js-yaml';

const symbols = {
  pointer: Symbol('pointer'),
  filename: Symbol('filename'),
  fullpath: Symbol('fullpath'),
  id: Symbol('id'),
  titles: Symbol('titles'),
  resolve: Symbol('resolve'),
  slug: Symbol('slug'),
  meta: Symbol('meta'),
  parent: Symbol('parent')
};

const used = new Set();

function gentitle(title, meta) {
  const slugger = new GhSlugger();
  const slug = slugger.slug(title);
  const id = meta[symbols.id];
  const resolve = meta[symbols.resolve];
  const pointer = meta[symbols.pointer];
  
  if (pointer) {
    return link(resolve(id, slug), title, [text(title)]);
  }
  return text(title);
}

function gendescription(meta) {
  const description = meta[symbols.meta]?.description;
  if (!description) {
    return null;
  }
  return paragraph([text(description)]);
}

function keyword(key) {
  return inlineCode(key);
}

function report() {
  return paragraph([text('Report generated')]);
}

function build(data) {
  const rootNode = root([]);
  const meta = data[symbols.meta] || {};
  const title = meta.title || 'Untitled';
  
  rootNode.children.push(heading(1, [gentitle(title, meta)]));
  
  const description = gendescription(meta);
  if (description) {
    rootNode.children.push(description);
  }
  
  if (data.children && size(data.children) > 0) {
    const items = map(data.children, (child) => {
      const childMeta = child[symbols.meta] || {};
      const childTitle = childMeta.title || 'Untitled';
      const childSlug = new GhSlugger().slug(childTitle);
      const childId = child[symbols.id];
      const childResolve = child[symbols.resolve];
      const childPointer = child[symbols.pointer];
      
      let content;
      if (childPointer) {
        content = link(childResolve(childId, childSlug), childTitle, [text(childTitle)]);
      } else {
        content = text(childTitle);
      }
      
      return listItem([paragraph([content])]);
    });
    
    rootNode.children.push(list(false, items));
  }
  
  return rootNode;
}

export { build as default };
