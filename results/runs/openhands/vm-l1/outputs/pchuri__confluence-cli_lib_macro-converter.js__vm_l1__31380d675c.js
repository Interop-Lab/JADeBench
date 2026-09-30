'use strict';

const { decodeHTML } = require('entities');
const { DomHandler, Parser, parseDocument } = require('htmlparser2');
const MarkdownIt = require('markdown-it');

// markdown-cleanup
function fenceLength(text) {
  const runs = text.match(/`+/g);
  let longest = 0;
  if (runs) for (const run of runs) longest = Math.max(longest, run.length);
  return Math.max(3, longest + 1);
}

function splitOnFences(markdown) {
  const parts = [];
  const pattern = /^ {0,3}(`{3,})[^\n]*\n[\s\S]*?\n {0,3}\1[\t ]*$/gm;
  let position = 0;
  let match;
  while ((match = pattern.exec(markdown)) !== null) {
    parts.push(markdown.slice(position, match.index), match[0]);
    position = match.index + match[0].length;
  }
  parts.push(markdown.slice(position));
  return parts;
}

function cleanupOutsideFence(markdown) {
  return markdown
    .replace(/[ \t]+$/gm, '')
    .replace(/^[ \t]+(?!([`>]|[*+-] |\d+[.)] ))/gm, '')
    .replace(/^(#{1,6}[^\n]+)\n(?!\n)/gm, '$1\n\n')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .replace(/[ \t]+/g, ' ');
}

function cleanupWithFences(markdown) {
  return splitOnFences(markdown)
    .map((part, index) => index % 2 === 1 ? part : cleanupOutsideFence(part))
    .join('').trim();
}

// link-style
const VALID_LINK_STYLES = ['smart', 'plain', 'wiki'];
function resolveLinkStyle({ isCloud = false, linkStyle = null } = {}) {
  return VALID_LINK_STYLES.includes(linkStyle) ? linkStyle : isCloud ? 'smart' : 'plain';
}

// storage-walker
const DEFAULT_MAX_DEPTH = 256;
const SIMPLE_ENTITIES = {
  nbsp: ' ', ldquo: '"', rdquo: '"', lsquo: "'", rsquo: "'", hellip: '...'
};

function decodeStorageEntities(value) {
  if (!value) return '';
  return value.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (whole, entity) => {
    if (entity[0] === '#') {
      const hexadecimal = entity[1] === 'x' || entity[1] === 'X';
      const codePoint = parseInt(entity.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
      if (!Number.isFinite(codePoint)) return whole;
      try { return String.fromCodePoint(codePoint); } catch { return whole; }
    }
    if (Object.prototype.hasOwnProperty.call(SIMPLE_ENTITIES, entity)) return SIMPLE_ENTITIES[entity];
    return decodeHTML(`&${entity};`);
  });
}

class StorageDepthExceededError extends Error {
  constructor(maxDepth) {
    super(`Storage XML nesting exceeds limit of ${maxDepth} levels`);
    this.name = 'StorageDepthExceededError';
    this.maxDepth = maxDepth;
  }
}

class StorageWalker {
  constructor({ attachmentsDir = 'attachments', labels = {}, buildUrl = (url) => url,
    webUrlPrefix = '', maxDepth = DEFAULT_MAX_DEPTH } = {}) {
    this.attachmentsDir = attachmentsDir;
    this.labels = labels;
    this.buildUrl = buildUrl;
    this.webUrlPrefix = webUrlPrefix;
    this.maxDepth = maxDepth;
  }

  walk(storage) {
    this._depth = 0;
    this._markdownLinkLabelDepth = 0;
    this._markdownCodeSpanDepth = 0;
    this.warnings = [];
    const handler = new DomHandler(null, { xmlMode: true });
    const openElements = [];
    const originalOpenTag = handler.onopentag.bind(handler);
    const originalCloseTag = handler.onclosetag.bind(handler);
    let parser;
    handler.onopentag = (...args) => {
      openElements.push({ sIdx: parser.startIndex, eIdx: parser.endIndex });
      originalOpenTag(...args);
    };
    handler.onclosetag = (...args) => {
      const [tag, implied] = args;
      const opened = openElements.pop();
      if (implied && opened && (opened.sIdx !== parser.startIndex || opened.eIdx !== parser.endIndex)) {
        const offset = parser.endIndex;
        this.warnings.push({ type: 'implicit-close', tag, offset });
        if (process.env.CONFLUENCE_CLI_VERBOSE) {
          process.stderr.write(`StorageWalker: auto-closed <${tag}> at offset ${offset}\n`);
        }
      }
      originalCloseTag(...args);
    };
    parser = new Parser(handler, { xmlMode: true, recognizeSelfClosing: true, decodeEntities: true });
    parser.write(storage);
    parser.end();
    return this.cleanup(this.walkNodes(handler.dom));
  }

  walkNodes(nodes) { return nodes ? nodes.map((node) => this.walkNode(node)).join('') : ''; }

  walkNode(node) {
    if (!node) return '';
    switch (node.type) {
      case 'text': return this.renderText(node.data || '');
      case 'cdata': return this.walkNodes(node.children);
      case 'comment':
      case 'directive': return '';
      case 'tag':
      case 'script':
      case 'style': return this.walkElement(node);
      default: return '';
    }
  }

  walkElement(node) {
    this._depth += 1;
    if (this._depth > this.maxDepth) {
      this._depth -= 1;
      throw new StorageDepthExceededError(this.maxDepth);
    }
    try { return this._dispatchElement(node); }
    finally { this._depth -= 1; }
  }

  _dispatchElement(node) {
    const name = node.name;
    switch (name) {
      case 'p': return `\n${this.walkNodes(node.children).trim()}\n`;
      case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
        return `\n${'#'.repeat(parseInt(name.charAt(1), 10))} ${this.walkNodes(node.children).trim()}\n`;
      case 'strong': case 'b': return `**${this.walkNodes(node.children)}**`;
      case 'em': case 'i': return `*${this.walkNodes(node.children)}*`;
      case 's': case 'del': return `~~${this.walkNodes(node.children)}~~`;
      case 'code':
        this._markdownCodeSpanDepth += 1;
        try { return this.renderCodeSpan(this.walkNodes(node.children)); }
        finally { this._markdownCodeSpanDepth -= 1; }
      case 'br': return '\n';
      case 'hr': return '\n---\n';
      case 'a': {
        const href = decodeStorageEntities((node.attribs && node.attribs.href) || '');
        if (!href) return this.walkNodes(node.children);
        this._markdownLinkLabelDepth += 1;
        let label;
        try { label = this.walkNodes(node.children); }
        finally { this._markdownLinkLabelDepth -= 1; }
        return `[${label}](${href})`;
      }
      case 'time': return this.renderText((node.attribs && node.attribs.datetime) || '') || this.walkNodes(node.children);
      case 'ul': return this.handleList(node, false);
      case 'ol': return this.handleList(node, true);
      case 'li': return this.walkNodes(node.children);
      case 'table': return this.handleTable(node);
      case 'thead': case 'tbody': case 'tfoot': case 'tr': case 'th': case 'td':
        return this.walkNodes(node.children);
      case 'blockquote': return this.handleBlockquote(node);
      case 'details': case 'summary': case 'u': case 'sub': case 'sup': case 'mark':
        return `<${name}>${this.walkNodes(node.children)}</${name}>`;
      case 'ac:structured-macro': return this.handleMacro(node);
      case 'ac:image': return this.handleImage(node);
      case 'ac:link': return this.handleAcLink(node);
      case 'ac:task-list': return this.handleTaskList(node);
      case 'ac:layout': case 'ac:layout-section': case 'ac:layout-cell':
      case 'ac:rich-text-body': case 'ac:link-body': return this.walkNodes(node.children);
      case 'ri:url': case 'ri:page': case 'ri:attachment': case 'ac:plain-text-body':
      case 'ac:plain-text-link-body': case 'ac:parameter': return '';
      default: return this.walkNodes(node.children);
    }
  }

  handleList(node, ordered) {
    const items = (node.children || []).filter((child) => child.type === 'tag' && child.name === 'li');
    let number = 1;
    let output = '';
    for (const item of items) {
      const text = this.walkNodes(item.children).replace(/\s+/g, ' ').trim();
      if (!text) continue;
      output += `${ordered ? `${number++}.` : '-'} ${text}\n`;
    }
    return output ? `\n${output}` : '';
  }

  handleTable(node) {
    const output = [];
    const rows = this.findAllDescendants(node, 'tr');
    let firstRow = true;
    for (const row of rows) {
      const cells = (row.children || []).filter((child) =>
        child.type === 'tag' && (child.name === 'th' || child.name === 'td'));
      if (cells.length === 0) continue;
      const values = cells.map((cell) => this.walkNodes(cell.children).replace(/\s+/g, ' ').trim() || ' ');
      output.push(`| ${values.join(' | ')} |`);
      if (firstRow) {
        output.push(`| ${values.map(() => '---').join(' | ')} |`);
        firstRow = false;
      }
    }
    return output.length > 0 ? `\n${output.join('\n')}\n` : '';
  }

  handleBlockquote(node) {
    const text = this.walkNodes(node.children).trim();
    if (!text) return '';
    const quoted = text.split('\n').map((line) => line.length === 0 ? '>' : `> ${line}`).join('\n');
    return `\n${quoted}\n`;
  }

  handleMacro(node) {
    const name = (node.attribs && node.attribs['ac:name']) || '';
    switch (name) {
      case 'toc': case 'floatmenu': return '';
      case 'expand': return this.handleExpand(node);
      case 'code': return this.handleCode(node);
      case 'info': case 'warning': case 'note': return this.handleCallout(node, name);
      case 'anchor': return this.handleAnchor(node);
      case 'panel': return this.handlePanel(node);
      case 'mermaid-macro': return this.handleMermaid(node);
      case 'plantuml': return this.handlePlantuml(node);
      case 'include': return this.handleInclude(node);
      case 'shared-block': case 'include-shared-block': return this.handleSharedBlock(node, name);
      case 'view-file': return this.handleViewFile(node);
      default: return '';
    }
  }

  handleExpand(node) {
    const parameter = this.findParamByName(node, 'title');
    const title = (parameter ? this.getTextContent(parameter) : '').trim();
    const body = this.getMacroBody(node);
    if (title) return `\n**EXPAND: ${title}**\n\n${this.walkNodes(body).trim()}\n\n**EXPAND_END**\n`;
    const defaultTitle = this.labels.expandDetails || 'Expand Details';
    return `\n<details>\n<summary>${defaultTitle}</summary>\n\n${this.walkNodes(body).trim()}\n\n</details>\n`;
  }

  handleCode(node) {
    const parameter = this.findParamByName(node, 'language');
    const language = parameter ? this.getTextContent(parameter) : '';
    const bodyNode = this.findChildByName(node, 'ac:plain-text-body');
    const body = bodyNode ? this.getRawText(bodyNode) : '';
    const fence = '`'.repeat(fenceLength(body));
    return `\n${fence}${language}\n${body}\n${fence}\n`;
  }

  handleCallout(node, type) {
    const text = this.walkNodes(this.getMacroBody(node)).trim();
    const quoted = text.split('\n').map((line) => line.length === 0 ? '>' : `> ${line}`).join('\n');
    const heading = `> **${type.toUpperCase()}**`;
    return `\n${text.length === 0 ? heading : `${heading}\n${quoted}`}\n`;
  }

  handleAnchor(node) {
    const parameter = this.findParamByName(node, '');
    const anchor = (parameter ? this.getTextContent(parameter) : '').trim();
    return anchor ? `\n**ANCHOR: ${anchor}**\n` : '';
  }

  handlePanel(node) {
    const parameter = this.findParamByName(node, 'title');
    const title = (parameter ? this.getTextContent(parameter) : '').trim();
    const content = this.walkNodes(this.getMacroBody(node)).trim();
    if (!title && !content) return '';
    const quoted = content.split('\n').map((line) => line ? `> ${line}` : '>').join('\n');
    if (!title) return `\n${quoted}\n`;
    if (!content) return `\n> **${title}**\n`;
    return `\n> **${title}**\n>\n${quoted}\n`;
  }

  handleMermaid(node) {
    const bodyNode = this.findChildByName(node, 'ac:plain-text-body');
    const body = (bodyNode ? this.getRawText(bodyNode) : '').trim();
    const fence = '`'.repeat(fenceLength(body));
    return `\n${fence}mermaid\n${body}\n${fence}\n`;
  }

  handlePlantuml(node) {
    const bodyNode = this.findChildByName(node, 'ac:plain-text-body');
    const body = (bodyNode ? this.getRawText(bodyNode) : '').trim();
    const fence = '`'.repeat(fenceLength(body));
    return `\n${fence}plantuml\n${body}\n${fence}\n`;
  }

  handleInclude(node) {
    const parameter = this.findParamByName(node, '');
    if (!parameter) return '';
    const link = this.findChildByName(parameter, 'ac:link');
    const page = link && this.findChildByName(link, 'ri:page');
    if (!page) return '';
    const spaceKey = decodeStorageEntities(page.attribs['ri:space-key'] || '');
    const pageTitle = decodeStorageEntities(page.attribs['ri:content-title'] || '');
    const escapedTitle = this.escapeMarkdownText(pageTitle);
    const label = this.labels.includePage || 'Include Page';
    if (spaceKey.startsWith('~')) {
      const path = `display/${spaceKey}/${encodeURIComponent(pageTitle)}`;
      return `\n> ������ **${label}**: [${escapedTitle}](${this.buildUrl(`${this.webUrlPrefix}/${path}`)})\n`;
    }
    const path = `${this.webUrlPrefix}/spaces/${spaceKey}/pages/[PAGE_ID_HERE]`;
    return `\n> ������ **${label}**: [${escapedTitle}](${this.buildUrl(path)}) _(manual link correction required)_\n`;
  }

  handleSharedBlock(node, macroName) {
    const keyParameter = this.findParamByName(node, 'shared-block-key');
    const key = (keyParameter ? this.getTextContent(keyParameter) : '').trim();
    const pageParameter = this.findParamByName(node, 'page');
    if (pageParameter || macroName === 'include-shared-block') {
      const link = pageParameter && this.findChildByName(pageParameter, 'ac:link');
      const page = link && this.findChildByName(link, 'ri:page');
      if (page) {
        const pageTitle = this.escapeMarkdownText(decodeStorageEntities(page.attribs['ri:content-title'] || ''));
        const label = this.labels.includeSharedBlock || 'Include Shared Block';
        const fromPage = this.labels.fromPage || 'from page';
        const keyText = key ? `: ${key} ` : ' ';
        return `\n> ������ **${label}**${keyText}(${fromPage}: ${pageTitle} [link needs manual correction])\n`;
      }
    }
    const content = this.walkNodes(this.getMacroBody(node)).trim();
    const label = this.labels.sharedBlock || 'Shared Block';
    if (!key && !content) return '';
    const heading = key ? `**${label}: ${key}**` : `**${label}**`;
    if (!content) return `\n> ${heading}\n`;
    const quoted = content.split('\n').map((line) => line ? `> ${line}` : '>').join('\n');
    return `\n> ${heading}\n>\n${quoted}\n`;
  }

  handleViewFile(node) {
    const parameter = this.findParamByName(node, 'name');
    const attachment = parameter && this.findChildByName(parameter, 'ri:attachment');
    if (!attachment) return '';
    const filename = decodeStorageEntities(attachment.attribs['ri:filename'] || '');
    return `\n������ [${filename}](${this.attachmentsDir}/${filename})\n`;
  }

  handleImage(node) {
    const attachment = this.findChildByName(node, 'ri:attachment');
    if (attachment) {
      const filename = this.renderText(attachment.attribs['ri:filename'] || '');
      return filename ? `![${filename}](${this.attachmentsDir}/${filename})` : '';
    }
    const urlNode = this.findChildByName(node, 'ri:url');
    if (urlNode) {
      const url = this.renderText(urlNode.attribs['ri:value'] || '');
      return url ? `![](${url})` : '';
    }
    return '';
  }

  handleAcLink(node) {
    const attributes = node.attribs || {};
    if (attributes['ac:anchor']) {
      const body = this.findChildByName(node, 'ac:plain-text-link-body');
      const label = body ? this.getRawText(body) : '';
      return label ? `[${label}](#${decodeStorageEntities(attributes['ac:anchor'])})` : '';
    }
    const urlNode = this.findChildByName(node, 'ri:url');
    if (urlNode) {
      const url = decodeStorageEntities(urlNode.attribs['ri:value'] || '');
      const body = this.findChildByName(node, 'ac:plain-text-link-body');
      const label = body ? this.getRawText(body) : '';
      return label ? `[${label}](${url})` : '';
    }
    const richBody = this.findChildByName(node, 'ac:link-body');
    if (richBody) return this.walkNodes(richBody.children).trim();
    const page = this.findChildByName(node, 'ri:page');
    if (page) {
      const title = this.escapeMarkdownText(decodeStorageEntities(page.attribs['ri:content-title'] || ''));
      return `[${title}]`;
    }
    return '';
  }

  handleTaskList(node) {
    const tasks = (node.children || []).filter((child) => child.type === 'tag' && child.name === 'ac:task');
    const lines = [];
    for (const task of tasks) {
      const statusNode = this.findChildByName(task, 'ac:task-status');
      const bodyNode = this.findChildByName(task, 'ac:task-body');
      const status = statusNode ? this.getTextContent(statusNode) : '';
      const body = bodyNode ? this.walkNodes(bodyNode.children).replace(/\s+/g, ' ').trim() : '';
      if (body) lines.push(`- ${status === 'complete' ? '[x]' : '[ ]'} ${body}`);
    }
    return lines.length > 0 ? `\n${lines.join('\n')}\n` : '';
  }

  findParamByName(node, name) {
    if (!node || !node.children) return null;
    for (const child of node.children) {
      if (child.type === 'tag' && child.name === 'ac:parameter' && child.attribs['ac:name'] === name) return child;
    }
    return null;
  }

  findChildByName(node, name) {
    if (!node || !node.children) return null;
    for (const child of node.children) if (child.type === 'tag' && child.name === name) return child;
    return null;
  }

  findAllDescendants(node, name) {
    const matches = [];
    const visit = (child) => {
      if (!child) return;
      if (child.type === 'tag' && child.name === name) matches.push(child);
      if (child.children) child.children.forEach(visit);
    };
    (node.children || []).forEach(visit);
    return matches;
  }

  getMacroBody(node) {
    const body = this.findChildByName(node, 'ac:rich-text-body');
    return body ? body.children : [];
  }
  getTextContent(node) { return decodeStorageEntities(this._collectText(node)); }
  escapeMarkdownText(text) { return text ? text.replace(/([\\`*_[\]()~|<>])/g, '\\$1') : ''; }

  renderText(text) {
    const decoded = decodeStorageEntities(text);
    return this._markdownLinkLabelDepth > 0 && this._markdownCodeSpanDepth === 0
      ? this.escapeMarkdownText(decoded) : decoded;
  }

  renderCodeSpan(text) {
    const longest = (text.match(/`+/g) || []).reduce((maximum, run) => Math.max(maximum, run.length), 0);
    const delimiter = '`'.repeat(longest + 1);
    const padding = text.startsWith('`') || text.endsWith('`') ? ' ' : '';
    return `${delimiter}${padding}${text}${padding}${delimiter}`;
  }

  _collectText(node) {
    if (!node) return '';
    if (node.type === 'text') return node.data || '';
    return node.children ? node.children.map((child) => this._collectText(child)).join('') : '';
  }
  getRawText(node) { return decodeStorageEntities(this._collectRawText(node)); }
  _collectRawText(node) {
    if (!node || !node.children) return '';
    let output = '';
    for (const child of node.children) {
      if (child.type === 'text') output += child.data || '';
      else if (child.type === 'cdata') output += this._collectRawText(child);
    }
    return output;
  }
  cleanup(markdown) { return cleanupWithFences(markdown); }
}

// html-to-storage
const HTML_MAX_DEPTH = 256;
const VOID_TAGS = new Set(['hr']);
const CALLOUT_MARKERS = ['info', 'warning', 'note'];
const PASSTHROUGH_BLOCK_TAGS = new Set(['svg', 'div']);
const INLINE_TAGS = new Set([
  'a', 'strong', 'em', 'code', 'br', 'img', 'span', 'mark', 'sub', 'sup',
  'ins', 'del', 'b', 'i', 'u', 'small', 's', 'abbr', 'kbd', 'q', 'var',
  'cite', 'time', 'dfn', 'samp'
]);

class HtmlDepthExceededError extends Error {
  constructor(maxDepth) {
    super(`HTML nesting exceeds limit of ${maxDepth} levels`);
    this.name = 'HtmlDepthExceededError';
    this.maxDepth = maxDepth;
  }
}

function hasOnlyInlineChildren(node) {
  if (!node.children) return true;
  for (const child of node.children) {
    if (child.type === 'text' && child.data.includes('\n')) return false;
    if (child.type === 'tag' && !INLINE_TAGS.has(child.name)) return false;
  }
  return true;
}
function isWhitespaceText(node) { return node.type === 'text' && /^\s*$/.test(node.data); }
function meaningfulChildren(node) { return (node.children || []).filter((child) => !isWhitespaceText(child)); }

function parseMacroMarker(text, { allowPlain = false } = {}) {
  const marker = (text || '').trim();
  if (marker === '[[_TOC_]]' || marker === '_TOC_' || (allowPlain && marker === 'TOC')) {
    return { kind: 'toc' };
  }
  if (marker === '[[_LISTING_]]' || marker === '_LISTING_' || (allowPlain && marker === 'LISTING')) {
    return { kind: 'children' };
  }
  return null;
}

function parseAnchorParagraph(node) {
  if (node.name !== 'p') return null;
  const children = meaningfulChildren(node);
  if (children.length !== 1) return null;
  if (children[0].type === 'text') return parseMacroMarker(children[0].data);
  const strong = children[0];
  if (strong.type !== 'tag' || strong.name !== 'strong') return null;
  const strongChildren = meaningfulChildren(strong);
  if (strongChildren.length !== 1 || strongChildren[0].type !== 'text') return null;
  const marker = parseMacroMarker(strongChildren[0].data, { allowPlain: true });
  if (marker) return marker;
  const anchor = strongChildren[0].data.match(/^ANCHOR: (.+)$/);
  return anchor ? { kind: 'anchor', id: anchor[1] } : null;
}

function isExpandStart(node) {
  if (node.type !== 'tag' || node.name !== 'p') return false;
  const children = meaningfulChildren(node);
  if (children.length !== 1) return false;
  const strong = children[0];
  if (strong.type !== 'tag' || strong.name !== 'strong' || !strong.children || strong.children.length === 0) return false;
  const text = strong.children[0];
  return text.type === 'text' && text.data.startsWith('EXPAND: ');
}

function isExpandEnd(node) {
  if (node.type !== 'tag' || node.name !== 'p') return false;
  const children = meaningfulChildren(node);
  if (children.length !== 1) return false;
  const strong = children[0];
  if (strong.type !== 'tag' || strong.name !== 'strong') return false;
  const strongChildren = meaningfulChildren(strong);
  return strongChildren.length === 1 && strongChildren[0].type === 'text' && strongChildren[0].data === 'EXPAND_END';
}

function decodeHtmlText(text, { preserveDouble = false } = {}) {
  if (preserveDouble) {
    return text.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  }
  return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
function escapeHtmlAttribute(value) { return String(value).replace(/"/g, '&quot;'); }
function attributesToHtml(attributes) {
  return attributes ? Object.keys(attributes)
    .map((name) => ` ${name}="${escapeHtmlAttribute(attributes[name])}"`).join('') : '';
}

function renderLink(node, context) {
  const attributes = node.attribs || {};
  const href = attributes.href || '';
  const body = renderExpandGroups(node, context);
  if (href.startsWith('#')) {
    return `<ac:link ac:anchor="${href.slice(1)}"><ac:plain-text-link-body><![CDATA[${decodeHtmlText(body)}]]></ac:plain-text-link-body></ac:link>`;
  }
  if (context.linkStyle === 'smart') {
    return `<a${attributesToHtml({ ...attributes, 'data-card-appearance': 'inline' })}>${body}</a>`;
  }
  if (context.linkStyle === 'wiki') {
    return `<ac:link><ri:url ri:value="${href}" /><ac:plain-text-link-body><![CDATA[${body}]]></ac:plain-text-link-body></ac:link>`;
  }
  return `<a${attributesToHtml(attributes)}>${body}</a>`;
}

function detectCallout(node) {
  const children = meaningfulChildren(node);
  if (children.length === 0) return null;
  const markerParagraph = children[0];
  if (markerParagraph.type !== 'tag' || markerParagraph.name !== 'p') return null;
  const paragraphChildren = markerParagraph.children || [];
  const markerIndex = paragraphChildren.findIndex((child) => !isWhitespaceText(child));
  if (markerIndex < 0) return null;
  const strong = paragraphChildren[markerIndex];
  if (strong.type !== 'tag' || strong.name !== 'strong') return null;
  const markerChildren = meaningfulChildren(strong);
  if (markerChildren.length !== 1 || markerChildren[0].type !== 'text') return null;
  const marker = CALLOUT_MARKERS.find((candidate) => markerChildren[0].data === candidate.toUpperCase());
  if (!marker) return null;
  const tail = paragraphChildren.slice(markerIndex + 1);
  const sameLine = tail.some((child) => !isWhitespaceText(child));
  if (sameLine && (tail[0].type !== 'text' || !/^\s*\n/.test(tail[0].data))) return null;
  return { marker, sameLine, markerP: markerParagraph, tail };
}

function renderBlockquote(node, context) {
  const callout = detectCallout(node);
  if (!callout) return `<blockquote>${renderExpandGroups(node, context)}</blockquote>`;
  const { marker, sameLine, markerP, tail } = callout;
  const children = node.children || [];
  let body;
  if (sameLine) {
    const firstLine = tail.map((child) => renderNode(child, context)).join('').replace(/^\s*\n/, '');
    const remainder = children.filter((child) => child !== markerP)
      .map((child) => renderNode(child, context)).join('');
    body = `<p>${firstLine}</p>${remainder}`;
  } else {
    body = children.filter((child) => child !== markerP)
      .map((child) => renderNode(child, context)).join('').replace(/^\s+/, '');
  }
  return `<ac:structured-macro ac:name="${marker}">
          <ac:rich-text-body>${body}</ac:rich-text-body>
        </ac:structured-macro>`;
}

function renderDetails(node, context) {
  const children = node.children || [];
  let summary = null;
  const body = [];
  for (const child of children) {
    if (child.type === 'tag' && child.name === 'summary') summary = child;
    else if (!isWhitespaceText(child)) body.push(child);
  }
  if (!summary) return `<details${attributesToHtml(node.attribs)}>${renderExpandGroups(node, context)}</details>`;
  const title = renderExpandGroups(summary, context).replace(/<[^>]+>/g, '').trim();
  const content = body.map((child) => renderNode(child, context)).join('').trim();
  return `<ac:structured-macro ac:name="expand"><ac:parameter ac:name="title">${title}</ac:parameter><ac:rich-text-body>${content}</ac:rich-text-body></ac:structured-macro>`;
}

function renderPre(node, context) {
  const children = node.children || [];
  const singleCode = children.length === 1 && children[0].type === 'tag' && children[0].name === 'code';
  if (!singleCode) return `<pre>${renderExpandGroups(node, context)}</pre>`;
  const code = children[0];
  const languageMatch = (code.attribs.class || '').match(/language-(\w+)/);
  const language = languageMatch ? languageMatch[1] : 'text';
  let source = '';
  for (const child of code.children || []) if (child.type === 'text') source += child.data;
  source = decodeHtmlText(source.replace(/\n$/, ''), { preserveDouble: true }).replace(/]]>/g, ']]]]><![CDATA[>');
  if (language === 'plantuml') {
    return `<ac:structured-macro ac:name="plantuml"><ac:plain-text-body><![CDATA[${source}]]></ac:plain-text-body></ac:structured-macro>`;
  }
  return `<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">${language}</ac:parameter><ac:plain-text-body><![CDATA[${source}]]></ac:plain-text-body></ac:structured-macro>`;
}

function renderPassthroughBlock(node, context) {
  const { randomUUID } = require('crypto');
  const source = `<${node.name}${attributesToHtml(node.attribs)}>${renderExpandGroups(node, context)}</${node.name}>`
    .replace(/]]>/g, ']]]]><![CDATA[>');
  return `<ac:structured-macro ac:name="html" ac:schema-version="1" ac:macro-id="${randomUUID()}"><ac:plain-text-body><![CDATA[${source}]]></ac:plain-text-body></ac:structured-macro>`;
}

function renderExpandGroups(node, context) {
  if (!node.children) return '';
  const children = node.children;
  const output = [];
  let index = 0;
  while (index < children.length) {
    const child = children[index];
    if (isExpandStart(child)) {
      const endIndex = children.findIndex(isExpandEnd);
      if (endIndex !== -1) {
        const title = renderExpandGroups(child.children[0], context)
          .replace(/^EXPAND: /, '').replace(/<[^>]+>/g, '').trim();
        const content = children.slice(index + 1, endIndex)
          .map((item) => renderNode(item, context)).join('').trim();
        output.push(`<ac:structured-macro ac:name="expand"><ac:parameter ac:name="title">${title}</ac:parameter><ac:rich-text-body>${content}</ac:rich-text-body></ac:structured-macro>`);
        index = endIndex + 1;
        continue;
      }
    }
    output.push(renderNode(child, context));
    index += 1;
  }
  return output.join('');
}

function renderNode(node, context) {
  if (node.type === 'text') return node.data;
  if (node.type === 'comment') {
    const marker = parseMacroMarker(node.data);
    if (marker && marker.kind === 'toc') return '<ac:structured-macro ac:name="toc" ac:schema-version="1" />';
    if (marker && marker.kind === 'children') return '<ac:structured-macro ac:name="children" ac:schema-version="2" />';
    return '';
  }
  if (node.type !== 'tag') return '';
  context.depth += 1;
  if (context.depth > context.maxDepth) {
    context.depth -= 1;
    throw new HtmlDepthExceededError(context.maxDepth);
  }
  try { return renderElement(node, context); }
  finally { context.depth -= 1; }
}

function renderElement(node, context) {
  const name = node.name;
  switch (name) {
    case 'p': {
      const marker = parseAnchorParagraph(node);
      if (marker && marker.kind === 'toc') return '<ac:structured-macro ac:name="toc" ac:schema-version="1" />';
      if (marker && marker.kind === 'children') return '<ac:structured-macro ac:name="children" ac:schema-version="2" />';
      if (marker && marker.kind === 'anchor') {
        return `<ac:structured-macro ac:name="anchor"><ac:parameter ac:name="">${marker.id}</ac:parameter></ac:structured-macro>`;
      }
      return `<p${attributesToHtml(node.attribs)}>${renderExpandGroups(node, context)}</p>`;
    }
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
    case 'strong': case 'em':
      return `<${name}${attributesToHtml(node.attribs)}>${renderExpandGroups(node, context)}</${name}>`;
    case 'hr': return '<hr />';
    case 'br': return '<br />';
    case 'img': return `<img${attributesToHtml(node.attribs)}>`;
    case 'ul': case 'ol':
      return `<${name}${attributesToHtml(node.attribs)}>${renderExpandGroups(node, context)}</${name}>`;
    case 'li': {
      const content = renderExpandGroups(node, context);
      const opening = `<li${attributesToHtml(node.attribs)}>`;
      return hasOnlyInlineChildren(node) ? `${opening}<p>${content}</p></li>` : `${opening}${content}</li>`;
    }
    case 'pre': return renderPre(node, context);
    case 'code': return `<code${attributesToHtml(node.attribs)}>${renderExpandGroups(node, context)}</code>`;
    case 'a': return renderLink(node, context);
    case 'blockquote': return renderBlockquote(node, context);
    case 'details': return renderDetails(node, context);
    case 'table': case 'thead': case 'tbody': case 'tfoot': case 'tr':
      return `<${name}${attributesToHtml(node.attribs)}>${renderExpandGroups(node, context)}</${name}>`;
    case 'th': case 'td': {
      const content = renderExpandGroups(node, context);
      const opening = `<${name}${attributesToHtml(node.attribs)}>`;
      return hasOnlyInlineChildren(node)
        ? `${opening}<p>${content}</p></${name}>` : `${opening}${content}</${name}>`;
    }
    default:
      if (VOID_TAGS.has(name)) return `<${name}${attributesToHtml(node.attribs)} />`;
      if (PASSTHROUGH_BLOCK_TAGS.has(name)) return renderPassthroughBlock(node, context);
      return `<${name}${attributesToHtml(node.attribs)}>${renderExpandGroups(node, context)}</${name}>`;
  }
}

function htmlToStorage(html, options = {}) {
  const isCloud = Boolean(options.isCloud);
  const context = {
    linkStyle: resolveLinkStyle({ isCloud, linkStyle: options.linkStyle }),
    depth: 0,
    maxDepth: typeof options.maxDepth === 'number' ? options.maxDepth : HTML_MAX_DEPTH
  };
  const document = parseDocument(html, { decodeEntities: false });
  return renderExpandGroups(document, context);
}

// MacroConverter
const STASH_DELIM = '\uE000';
const PASSTHROUGH_TAG_RE = /<\/?(?:br|u|sub|sup|mark|details|summary)(?=[\s/>])(?:"[^"]*"|'[^']*'|[^>])*>/gi;
const PASSTHROUGH_BLOCK_RE = /<(svg|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi;
const INLINE_CODE_RE = /`[^`\n]+`/g;
function escapeXmlAttr(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

class MacroConverter {
  constructor({ isCloud = false, webUrlPrefix = '', buildUrl = null, linkStyle = null } = {}) {
    this._isCloud = isCloud;
    this.webUrlPrefix = webUrlPrefix;
    this.buildUrl = buildUrl || ((url) => url);
    this.linkStyle = resolveLinkStyle({ isCloud, linkStyle });
    this.markdown = new MarkdownIt();
    this.setupConfluenceMarkdownExtensions();
  }
  isCloud() { return this._isCloud; }

  setupConfluenceMarkdownExtensions() {
    this.markdown.enable(['table', 'strikethrough', 'linkify']);
    this.markdown.core.ruler.before('normalize', 'confluence_macros', (state) => {
      const protectedCode = [];
      const stashCode = (text) => {
        protectedCode.push(text);
        return `${STASH_DELIM}${protectedCode.length - 1}${STASH_DELIM}`;
      };
      state.src = state.src.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`/g, stashCode);
      for (const marker of CALLOUT_MARKERS) {
        const pattern = new RegExp(`(^|\\n)\\[!${marker}\\]\\s*([\\s\\S]*?)(?=\\n\\s*\\n|\\n\\s*\\[!|$)`, 'g');
        state.src = state.src.replace(pattern, (whole, prefix, body) =>
          `${prefix}> **${marker.toUpperCase()}**\n> ${body.trim().replace(/\n/g, '\n> ')}`);
      }
      state.src = state.src.replace(new RegExp(`${STASH_DELIM}(\\d+)${STASH_DELIM}`, 'g'),
        (whole, index) => protectedCode[+index] ?? whole);
    });
  }

  markdownToStorage(markdown) { return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(markdown)); }
  markdownToNativeStorage(markdown) { return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(markdown)); }

  _renderMarkdownToHtml(markdown) {
    const codeRanges = this._findCodeRanges(markdown);
    const stashedHtml = [];
    const normalizeLineMarker = (text, pattern, replacement) => {
      const source = `(^|\\n)([^\\S\\n]*)${pattern}[^\\S\\n]*(?=\\n|$)`;
      return text.replace(new RegExp(source, 'gi'),
        (whole, prefix, indentation) => `${prefix}${indentation}${replacement}`);
    };
    const normalizeMarkers = (text) => {
      let output = normalizeLineMarker(text, '<!--\\s*(?:\\[\\[)?_TOC_(?:\\]\\])?\\s*-->', '**TOC**');
      output = normalizeLineMarker(output, '<!--\\s*(?:\\[\\[)?_LISTING_(?:\\]\\])?\\s*-->', '**LISTING**');
      output = normalizeLineMarker(output, '\\[\\[_TOC_\\]\\]', '**TOC**');
      return normalizeLineMarker(output, '\\[\\[_LISTING_\\]\\]', '**LISTING**');
    };
    const stashHtml = (text) => {
      const stash = (html) => {
        stashedHtml.push(html);
        return `${STASH_DELIM}H${stashedHtml.length - 1}${STASH_DELIM}`;
      };
      return normalizeMarkers(text).replace(PASSTHROUGH_BLOCK_RE, stash).replace(PASSTHROUGH_TAG_RE, stash);
    };

    let protectedMarkdown = '';
    let position = 0;
    for (const [start, end] of codeRanges) {
      protectedMarkdown += stashHtml(markdown.slice(position, start));
      protectedMarkdown += markdown.slice(start, end);
      position = end;
    }
    protectedMarkdown += stashHtml(markdown.slice(position));

    const rendered = this.markdown.render(protectedMarkdown);
    let scanPosition = 0;
    let insideTag = false;
    return rendered.replace(new RegExp(`${STASH_DELIM}H(\\d+)${STASH_DELIM}`, 'g'),
      (whole, index, offset) => {
        while (scanPosition < offset) {
          if (rendered[scanPosition] === '<') insideTag = true;
          else if (rendered[scanPosition] === '>') insideTag = false;
          scanPosition += 1;
        }
        scanPosition = offset + whole.length;
        const value = stashedHtml[+index];
        if (value === null) return whole;
        return insideTag ? escapeXmlAttr(value) : value;
      });
  }

  _findCodeRanges(markdown) {
    const tokens = this.markdown.parse(markdown, {});
    const lineOffsets = [0];
    for (let index = 0; index < markdown.length; index += 1) {
      if (markdown[index] === '\n') lineOffsets.push(index + 1);
    }
    const lineOffset = (line) => line < lineOffsets.length ? lineOffsets[line] : markdown.length;
    const ranges = [];
    for (const token of tokens) {
      if ((token.type === 'code_block' || token.type === 'fence') && token.map) {
        ranges.push([lineOffset(token.map[0]), lineOffset(token.map[1])]);
      }
    }
    INLINE_CODE_RE.lastIndex = 0;
    let match;
    while ((match = INLINE_CODE_RE.exec(markdown)) !== null) {
      ranges.push([match.index, match.index + match[0].length]);
    }
    ranges.sort((left, right) => left[0] - right[0] || left[1] - right[1]);
    const merged = [];
    for (const range of ranges) {
      const previous = merged[merged.length - 1];
      if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]);
      else merged.push([range[0], range[1]]);
    }
    return merged;
  }

  htmlToConfluenceStorage(html) {
    return htmlToStorage(html, { isCloud: this._isCloud, linkStyle: this.linkStyle });
  }

  detectLanguageLabels(text) {
    const labels = {
      includePage: 'Include Page', sharedBlock: 'Shared Block',
      includeSharedBlock: 'Include Shared Block', fromPage: 'from page', expandDetails: 'Expand Details'
    };
    if (/[\u4e00-\u9fa5]/.test(text)) {
      Object.assign(labels, { includePage: '包含页面', sharedBlock: '共享块', includeSharedBlock: '包含共享块', fromPage: '来自页面', expandDetails: '展开详情' });
    } else if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
      Object.assign(labels, { includePage: 'ページを含む', sharedBlock: '共有ブロック', includeSharedBlock: '共有ブロックを含む', fromPage: 'ページから', expandDetails: '詳細を表示' });
    } else if (/[\uac00-\ud7af]/.test(text)) {
      Object.assign(labels, { includePage: '페이지 포함', sharedBlock: '공유 블록', includeSharedBlock: '공유 블록 포함', fromPage: '페이지에서', expandDetails: '상세 보기' });
    } else if (/[\u0400-\u04ff]/.test(text)) {
      Object.assign(labels, { includePage: 'Включить страницу', sharedBlock: 'Общий блок', includeSharedBlock: 'Включить общий блок', fromPage: 'со страницы', expandDetails: 'Подробнее' });
    } else if ((text.match(/[àâäéèêëïîôùûüÿœæç]/gi) || []).length >= 2) {
      Object.assign(labels, { includePage: 'Inclure la page', sharedBlock: 'Bloc partagé', includeSharedBlock: 'Inclure le bloc partagé', fromPage: 'de la page', expandDetails: 'Détails' });
    } else if ((text.match(/[äöüß]/gi) || []).length >= 2) {
      Object.assign(labels, { includePage: 'Seite einbinden', sharedBlock: 'Gemeinsamer Block', includeSharedBlock: 'Gemeinsamen Block einbinden', fromPage: 'von Seite', expandDetails: 'Details' });
    } else if ((text.match(/[áéíóúñ¿¡]/gi) || []).length >= 2) {
      Object.assign(labels, { includePage: 'Incluir página', sharedBlock: 'Bloque compartido', includeSharedBlock: 'Incluir bloque compartido', fromPage: 'de la página', expandDetails: 'Detalles' });
    }
    return labels;
  }

  storageToMarkdown(storage, options = {}) {
    const walker = new StorageWalker({
      attachmentsDir: options.attachmentsDir || 'attachments',
      labels: this.detectLanguageLabels(storage),
      buildUrl: this.buildUrl,
      webUrlPrefix: this.webUrlPrefix
    });
    const markdown = walker.walk(storage);
    if (typeof options.onWarnings === 'function' && walker.warnings.length > 0) options.onWarnings(walker.warnings);
    return markdown;
  }
}

module.exports = MacroConverter;
module.exports.VALID_LINK_STYLES = VALID_LINK_STYLES;
