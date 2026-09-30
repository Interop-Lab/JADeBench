'use strict';

const MarkdownIt = require('markdown-it');
const { Parser, DomHandler, parseDocument } = require('htmlparser2');
const { decodeHTML } = require('entities');
const { randomUUID } = require('crypto');

const VALID_LINK_STYLES = ['smart', 'plain', 'wiki'];
const CALLOUTS = ['info', 'warning', 'note'];
const INLINE_TAGS = new Set(['a', 'strong', 'em', 'code', 'br', 'img', 'span', 'mark', 'sub', 'sup', 'ins', 'del', 'b', 'i', 'u', 'small', 's', 'abbr', 'kbd', 'q', 'var', 'cite', 'time', 'dfn', 'samp']);
const STASH = '\uE000';
const PASSTHROUGH_TAG = /<\/?(?:br|u|sub|sup|mark|details|summary)(?=[\s/>])(?:"[^"]*"|'[^']*'|[^>])*>/gi;
const PASSTHROUGH_BLOCK = /<(svg|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi;

function resolveLinkStyle({ isCloud = false, linkStyle = null } = {}) {
  return VALID_LINK_STYLES.includes(linkStyle) ? linkStyle : isCloud ? 'smart' : 'plain';
}

function fenceLength(text) {
  return Math.max(3, ...(text.match(/`+/g) || []).map(run => run.length + 1));
}

function cleanupMarkdown(markdown) {
  const fence = /^ {0,3}(`{3,})[^\n]*\n[\s\S]*?\n {0,3}\1[\t ]*$/gm;
  const parts = [];
  let cursor = 0;
  for (let match; (match = fence.exec(markdown));) {
    parts.push(markdown.slice(cursor, match.index), match[0]);
    cursor = match.index + match[0].length;
  }
  parts.push(markdown.slice(cursor));
  return parts.map((part, index) => index % 2 ? part : part
    .replace(/[ \t]+$/gm, '')
    .replace(/^[ \t]+(?!([`>]|[*+-] |\d+[.)] ))/gm, '')
    .replace(/^(#{1,6}[^\n]+)\n(?!\n)/gm, '$1\n\n')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .replace(/[ \t]+/g, ' ')).join('').trim();
}

const SIMPLE_ENTITIES = { nbsp: ' ', ldquo: '"', rdquo: '"', lsquo: "'", rsquo: "'", hellip: '...' };
function decodeEntities(text) {
  if (!text) return '';
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z][a-z\d]*);/gi, (entity, name) => {
    if (name[0] === '#') {
      const hex = name[1].toLowerCase() === 'x';
      const value = parseInt(name.slice(hex ? 2 : 1), hex ? 16 : 10);
      try { return Number.isFinite(value) ? String.fromCodePoint(value) : entity; } catch { return entity; }
    }
    return Object.prototype.hasOwnProperty.call(SIMPLE_ENTITIES, name) ? SIMPLE_ENTITIES[name] : decodeHTML(entity);
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
  constructor({ attachmentsDir = 'attachments', labels = {}, buildUrl = value => value, webUrlPrefix = '', maxDepth = 256 } = {}) {
    Object.assign(this, { attachmentsDir, labels, buildUrl, webUrlPrefix, maxDepth });
  }

  walk(xml) {
    this.depth = this.linkLabelDepth = this.codeSpanDepth = 0;
    this.warnings = [];
    const handler = new DomHandler(null, { xmlMode: true });
    const openTags = [];
    const open = handler.onopentag.bind(handler);
    const close = handler.onclosetag.bind(handler);
    let parser;
    handler.onopentag = (...args) => {
      openTags.push({ start: parser.startIndex, end: parser.endIndex });
      open(...args);
    };
    handler.onclosetag = (...args) => {
      const [tag, implicit] = args;
      const opened = openTags.pop();
      if (implicit && !(opened && opened.start === parser.startIndex && opened.end === parser.endIndex)) {
        const warning = { type: 'implicit-close', tag, offset: parser.endIndex };
        this.warnings.push(warning);
        if (process.env.CONFLUENCE_CLI_VERBOSE) process.stderr.write(`StorageWalker: auto-closed <${tag}> at offset ${warning.offset}\n`);
      }
      close(...args);
    };
    parser = new Parser(handler, { xmlMode: true, recognizeSelfClosing: true, decodeEntities: true });
    parser.end(xml);
    return cleanupMarkdown(this.walkNodes(handler.dom));
  }

  walkNodes(nodes) { return (nodes || []).map(node => this.walkNode(node)).join(''); }
  walkNode(node) {
    if (!node) return '';
    if (node.type === 'text') return this.renderText(node.data || '');
    if (node.type === 'cdata') return this.walkNodes(node.children);
    if (node.type === 'tag' || node.type === 'script' || node.type === 'style') return this.walkElement(node);
    return '';
  }

  walkElement(element) {
    if (++this.depth > this.maxDepth) {
      this.depth--;
      throw new StorageDepthExceededError(this.maxDepth);
    }
    try { return this.dispatch(element); } finally { this.depth--; }
  }

  dispatch(element) {
    const name = element.name;
    const body = () => this.walkNodes(element.children);
    if (name === 'p') return `\n${body().trim()}\n`;
    if (/^h[1-6]$/.test(name)) return `\n${'#'.repeat(Number(name[1]))} ${body().trim()}\n`;
    if (name === 'strong' || name === 'b') return `**${body()}**`;
    if (name === 'em' || name === 'i') return `*${body()}*`;
    if (name === 's' || name === 'del') return `~~${body()}~~`;
    if (name === 'code') {
      this.codeSpanDepth++;
      try { return this.renderCodeSpan(body()); } finally { this.codeSpanDepth--; }
    }
    if (name === 'br') return '\n';
    if (name === 'hr') return '\n---\n';
    if (name === 'a') return this.htmlLink(element);
    if (name === 'time') return this.renderText(element.attribs.datetime || '') || body();
    if (name === 'ul' || name === 'ol') return this.list(element, name === 'ol');
    if (name === 'li') return body();
    if (name === 'table') return this.table(element);
    if (['thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'ac:layout', 'ac:layout-section', 'ac:layout-cell', 'ac:rich-text-body', 'ac:link-body'].includes(name)) return body();
    if (name === 'blockquote') return this.blockquote(element);
    if (['details', 'summary', 'u', 'sub', 'sup', 'mark'].includes(name)) return `<${name}>${body()}</${name}>`;
    if (name === 'ac:structured-macro') return this.macro(element);
    if (name === 'ac:image') return this.image(element);
    if (name === 'ac:link') return this.confluenceLink(element);
    if (name === 'ac:task-list') return this.taskList(element);
    if (['ri:url', 'ri:page', 'ri:attachment', 'ac:plain-text-body', 'ac:plain-text-link-body', 'ac:parameter'].includes(name)) return '';
    return body();
  }

  htmlLink(element) {
    const href = decodeEntities(element.attribs.href || '');
    if (!href) return this.walkNodes(element.children);
    this.linkLabelDepth++;
    let label;
    try { label = this.walkNodes(element.children); } finally { this.linkLabelDepth--; }
    return `[${label}](${href})`;
  }

  list(element, ordered) {
    let number = 1;
    const lines = (element.children || []).filter(node => node.type === 'tag' && node.name === 'li').map(item => {
      const text = this.walkNodes(item.children).replace(/\s+/g, ' ').trim();
      return text ? `${ordered ? `${number++}.` : '-'} ${text}` : '';
    }).filter(Boolean);
    return lines.length ? `\n${lines.join('\n')}\n` : '';
  }

  table(element) {
    const lines = [];
    for (const row of this.descendants(element, 'tr')) {
      const cells = (row.children || []).filter(node => node.type === 'tag' && ['th', 'td'].includes(node.name));
      if (!cells.length) continue;
      const values = cells.map(cell => this.walkNodes(cell.children).replace(/\s+/g, ' ').trim() || ' ');
      lines.push(`| ${values.join(' | ')} |`);
      if (lines.length === 1) lines.push(`| ${values.map(() => '---').join(' | ')} |`);
    }
    return lines.length ? `\n${lines.join('\n')}\n` : '';
  }

  blockquote(element) {
    const text = this.walkNodes(element.children).trim();
    return text ? `\n${text.split('\n').map(line => line ? `> ${line}` : '>').join('\n')}\n` : '';
  }

  macro(element) {
    const name = element.attribs['ac:name'];
    if (name === 'toc' || name === 'floatmenu') return '';
    if (name === 'expand') return this.expand(element);
    if (name === 'code') return this.codeBlock(element, '');
    if (CALLOUTS.includes(name)) return this.callout(element, name);
    if (name === 'anchor') {
      const parameter = this.parameter(element, '');
      const anchor = (parameter ? this.text(parameter) : '').trim();
      return anchor ? `\n**ANCHOR: ${anchor}**\n` : '';
    }
    if (name === 'panel') return this.panel(element);
    if (name === 'mermaid-macro' || name === 'plantuml') return this.codeBlock(element, name === 'mermaid-macro' ? 'mermaid' : 'plantuml');
    if (name === 'include') return this.includePage(element);
    if (name === 'shared-block' || name === 'include-shared-block') return this.sharedBlock(element, name);
    if (name === 'view-file') return this.viewFile(element);
    return '';
  }

  expand(element) {
    const parameter = this.parameter(element, 'title');
    const title = (parameter ? this.text(parameter) : '').trim();
    const body = this.walkNodes(this.macroBody(element)).trim();
    return title ? `\n**EXPAND: ${title}**\n\n${body}\n\n**EXPAND_END**\n` : `\n<details>\n<summary>${this.labels.expandDetails || 'Expand Details'}</summary>\n\n${body}\n\n</details>\n`;
  }

  codeBlock(element, forcedLanguage) {
    const languageNode = this.parameter(element, 'language');
    const language = forcedLanguage || (languageNode ? this.text(languageNode) : '');
    const bodyNode = this.child(element, 'ac:plain-text-body');
    const body = bodyNode ? this.rawText(bodyNode).trim() : '';
    const fence = '`'.repeat(fenceLength(body));
    return `\n${fence}${language}\n${body}\n${fence}\n`;
  }

  callout(element, kind) {
    const text = this.walkNodes(this.macroBody(element)).trim();
    const heading = `> **${kind.toUpperCase()}**`;
    return `\n${text ? `${heading}\n${text.split('\n').map(line => line ? `> ${line}` : '>').join('\n')}` : heading}\n`;
  }

  panel(element) {
    const titleNode = this.parameter(element, 'title');
    const title = (titleNode ? this.text(titleNode) : '').trim();
    const body = this.walkNodes(this.macroBody(element)).trim();
    if (!title && !body) return '';
    const quoted = body.split('\n').map(line => line ? `> ${line}` : '>').join('\n');
    if (title && body) return `\n> **${title}**\n>\n${quoted}\n`;
    return title ? `\n> **${title}**\n` : `\n${quoted}\n`;
  }

  includePage(element) {
    const parameter = this.parameter(element, '');
    const link = parameter && this.child(parameter, 'ac:link');
    const page = link && this.child(link, 'ri:page');
    if (!page) return '';
    const space = decodeEntities(page.attribs['ri:space-key'] || '');
    const title = decodeEntities(page.attribs['ri:content-title'] || '');
    const label = this.escapeMarkdown(title);
    const heading = this.labels.includePage || 'Include Page';
    if (space.startsWith('~')) {
      const url = this.buildUrl(`${this.webUrlPrefix}/display/${space}/${encodeURIComponent(title)}`);
      return `\n> 📄 **${heading}**: [${label}](${url})\n`;
    }
    const url = this.buildUrl(`${this.webUrlPrefix}/spaces/${space}/pages/[PAGE_ID_HERE]`);
    return `\n> 📄 **${heading}**: [${label}](${url}) _(manual link correction required)_\n`;
  }

  sharedBlock(element, name) {
    const keyNode = this.parameter(element, 'shared-block-key');
    const key = (keyNode ? this.text(keyNode) : '').trim();
    const pageParameter = this.parameter(element, 'page');
    const link = pageParameter && this.child(pageParameter, 'ac:link');
    const page = link && this.child(link, 'ri:page');
    if (page && name === 'include-shared-block') {
      const title = this.escapeMarkdown(decodeEntities(page.attribs['ri:content-title'] || ''));
      return `\n> 📄 **${this.labels.includeSharedBlock || 'Include Shared Block'}**${key ? `: ${key} ` : ' '}(${this.labels.fromPage || 'from page'}: ${title} [link needs manual correction])\n`;
    }
    const body = this.walkNodes(this.macroBody(element)).trim();
    if (!key && !body) return '';
    const label = this.labels.sharedBlock || 'Shared Block';
    const heading = key ? `**${label}: ${key}**` : `**${label}**`;
    return body ? `\n> ${heading}\n>\n${body.split('\n').map(line => line ? `> ${line}` : '>').join('\n')}\n` : `\n> ${heading}\n`;
  }

  viewFile(element) {
    const parameter = this.parameter(element, 'name');
    const attachment = parameter && this.child(parameter, 'ri:attachment');
    if (!attachment) return '';
    const filename = decodeEntities(attachment.attribs['ri:filename'] || '');
    return `\n📎 [${filename}](${this.attachmentsDir}/${filename})\n`;
  }

  image(element) {
    const attachment = this.child(element, 'ri:attachment');
    if (attachment) {
      const filename = this.renderText(attachment.attribs['ri:filename'] || '');
      return `![${filename}](${this.attachmentsDir}/${filename})`;
    }
    const url = this.child(element, 'ri:url');
    const value = url && this.renderText(url.attribs['ri:value'] || '');
    return value ? `![](${value})` : '';
  }

  confluenceLink(element) {
    const anchor = element.attribs['ac:anchor'];
    const plainBody = this.child(element, 'ac:plain-text-link-body');
    const label = plainBody ? this.rawText(plainBody) : '';
    if (anchor) return label ? `[${label}](#${decodeEntities(anchor)})` : '';
    const url = this.child(element, 'ri:url');
    if (url) return label ? `[${label}](${decodeEntities(url.attribs['ri:value'] || '')})` : '';
    const richBody = this.child(element, 'ac:link-body');
    if (richBody) return this.walkNodes(richBody.children).trim();
    const page = this.child(element, 'ri:page');
    return page ? `[${this.escapeMarkdown(decodeEntities(page.attribs['ri:content-title'] || ''))}]` : '';
  }

  taskList(element) {
    const lines = (element.children || []).filter(node => node.type === 'tag' && node.name === 'ac:task').map(task => {
      const status = this.child(task, 'ac:task-status');
      const body = this.child(task, 'ac:task-body');
      const text = body ? this.walkNodes(body.children).replace(/\s+/g, ' ').trim() : '';
      return text ? `- ${status && this.text(status) === 'complete' ? '[x]' : '[ ]'} ${text}` : '';
    }).filter(Boolean);
    return lines.length ? `\n${lines.join('\n')}\n` : '';
  }

  parameter(element, name) { return (element.children || []).find(node => node.type === 'tag' && node.name === 'ac:parameter' && node.attribs['ac:name'] === name) || null; }
  child(element, name) { return (element.children || []).find(node => node.type === 'tag' && node.name === name) || null; }
  descendants(element, name) {
    const result = [];
    const visit = node => {
      if (node.type === 'tag' && node.name === name) result.push(node);
      for (const child of node.children || []) visit(child);
    };
    for (const child of element.children || []) visit(child);
    return result;
  }
  macroBody(element) { const body = this.child(element, 'ac:rich-text-body'); return body ? body.children : []; }
  collectText(node) { return node.type === 'text' ? node.data || '' : (node.children || []).map(child => this.collectText(child)).join(''); }
  collectRaw(node) { return (node.children || []).map(child => child.type === 'text' ? child.data || '' : child.type === 'cdata' ? this.collectRaw(child) : '').join(''); }
  text(node) { return decodeEntities(this.collectText(node)); }
  rawText(node) { return decodeEntities(this.collectRaw(node)); }
  escapeMarkdown(text) { return text ? text.replace(/([\\`*_[\]()~|<>])/g, '\\$1') : ''; }
  renderText(text) { const value = decodeEntities(text); return this.linkLabelDepth > 0 && this.codeSpanDepth === 0 ? this.escapeMarkdown(value) : value; }
  renderCodeSpan(text) { const delimiter = '`'.repeat(Math.max(1, ...(text.match(/`+/g) || []).map(run => run.length + 1))); const pad = text.startsWith('`') || text.endsWith('`') ? ' ' : ''; return `${delimiter}${pad}${text}${pad}${delimiter}`; }
}

class HtmlDepthExceededError extends Error {
  constructor(maxDepth) {
    super(`HTML nesting exceeds limit of ${maxDepth} levels`);
    this.name = 'HtmlDepthExceededError';
    this.maxDepth = maxDepth;
  }
}

function escapeAttribute(value) { return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function attributes(values) { return Object.entries(values || {}).map(([name, value]) => ` ${name}="${escapeAttribute(value)}"`).join(''); }
function whitespace(node) { return node.type === 'text' && /^\s*$/.test(node.data); }
function meaningfulChildren(node) { return (node.children || []).filter(child => !whitespace(child)); }
function marker(text, allowPlain = false) {
  text = (text || '').trim();
  if (text === '[[_TOC_]]' || text === '_TOC_' || allowPlain && text === 'TOC') return { kind: 'toc' };
  if (text === '[[_LISTING_]]' || text === '_LISTING_' || allowPlain && text === 'LISTING') return { kind: 'children' };
  return null;
}
function paragraphMacro(element) {
  const children = meaningfulChildren(element);
  if (children.length !== 1) return null;
  if (children[0].type === 'text') return marker(children[0].data);
  const strong = children[0];
  if (strong.type !== 'tag' || strong.name !== 'strong') return null;
  const content = meaningfulChildren(strong);
  if (content.length !== 1 || content[0].type !== 'text') return null;
  const result = marker(content[0].data, true);
  const anchor = content[0].data.match(/^ANCHOR: (.+)$/);
  return result || (anchor ? { kind: 'anchor', id: anchor[1] } : null);
}
function expandMarker(node, expected) {
  if (node.type !== 'tag' || node.name !== 'p') return false;
  const outer = meaningfulChildren(node);
  if (outer.length !== 1 || outer[0].type !== 'tag' || outer[0].name !== 'strong') return false;
  const inner = meaningfulChildren(outer[0]);
  return inner.length === 1 && inner[0].type === 'text' && (expected === 'start' ? inner[0].data.startsWith('EXPAND: ') : inner[0].data === 'EXPAND_END');
}
function decodeHtml(text, preserveDouble = false) {
  if (preserveDouble) return text.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function htmlToStorage(html, options = {}) {
  const context = { linkStyle: resolveLinkStyle(options), depth: 0, maxDepth: typeof options.maxDepth === 'number' ? options.maxDepth : 256 };
  return renderChildren(parseDocument(html, { decodeEntities: false }), context);
}
function renderChildren(element, context) {
  const children = element.children || [];
  const output = [];
  for (let index = 0; index < children.length;) {
    if (expandMarker(children[index], 'start')) {
      const end = children.findIndex((node, candidate) => candidate > index && expandMarker(node, 'end'));
      if (end !== -1) {
        const title = renderChildren(children[index].children[0], context).replace(/^EXPAND: /, '').replace(/<[^>]+>/g, '').trim();
        const body = children.slice(index + 1, end).map(node => renderNode(node, context)).join('').trim();
        output.push(`<ac:structured-macro ac:name="expand"><ac:parameter ac:name="title">${title}</ac:parameter><ac:rich-text-body>${body}</ac:rich-text-body></ac:structured-macro>`);
        index = end + 1;
        continue;
      }
    }
    output.push(renderNode(children[index++], context));
  }
  return output.join('');
}
function renderNode(node, context) {
  if (node.type === 'text') return node.data;
  if (node.type === 'comment') {
    const parsed = marker(node.data);
    return parsed ? `<ac:structured-macro ac:name="${parsed.kind}" ac:schema-version="${parsed.kind === 'toc' ? 1 : 2}" />` : '';
  }
  if (node.type !== 'tag') return '';
  if (++context.depth > context.maxDepth) { context.depth--; throw new HtmlDepthExceededError(context.maxDepth); }
  try { return renderElement(node, context); } finally { context.depth--; }
}
function inlineChildren(element) {
  return (element.children || []).every(child => !(child.type === 'text' && child.data.includes('\n')) && !(child.type === 'tag' && !INLINE_TAGS.has(child.name)));
}
function renderLink(element, context) {
  const values = element.attribs || {};
  const href = values.href || '';
  const body = renderChildren(element, context);
  if (href.startsWith('#')) return `<ac:link ac:anchor="${href.slice(1)}"><ac:plain-text-link-body><![CDATA[${decodeHtml(body)}]]></ac:plain-text-link-body></ac:link>`;
  if (context.linkStyle === 'smart') return `<a${attributes({ ...values, 'data-card-appearance': 'inline' })}>${body}</a>`;
  if (context.linkStyle === 'wiki') return `<ac:link><ri:url ri:value="${href}" /><ac:plain-text-link-body><![CDATA[${body}]]></ac:plain-text-link-body></ac:link>`;
  return `<a${attributes(values)}>${body}</a>`;
}
function renderPre(element, context) {
  const children = element.children || [];
  if (!(children.length === 1 && children[0].type === 'tag' && children[0].name === 'code')) return `<pre>${renderChildren(element, context)}</pre>`;
  const code = children[0];
  const match = (code.attribs.class || '').match(/language-(\w+)/);
  const language = match ? match[1] : 'text';
  let body = (code.children || []).filter(node => node.type === 'text').map(node => node.data).join('').replace(/\n$/, '');
  body = decodeHtml(body, true).replace(/]]>/g, ']]]]><![CDATA[>');
  const macro = language === 'plantuml' ? 'plantuml' : 'code';
  const parameter = language === 'plantuml' ? '' : `<ac:parameter ac:name="language">${language}</ac:parameter>`;
  return `<ac:structured-macro ac:name="${macro}">${parameter}<ac:plain-text-body><![CDATA[${body}]]></ac:plain-text-body></ac:structured-macro>`;
}
function callout(element, context) {
  const blocks = meaningfulChildren(element);
  const paragraph = blocks[0];
  if (!paragraph || paragraph.type !== 'tag' || paragraph.name !== 'p') return null;
  const children = paragraph.children || [];
  const index = children.findIndex(node => !whitespace(node));
  const strong = children[index];
  const content = strong && strong.type === 'tag' && strong.name === 'strong' ? meaningfulChildren(strong) : [];
  const kind = content.length === 1 && content[0].type === 'text' && CALLOUTS.find(value => content[0].data === value.toUpperCase());
  if (!kind) return null;
  const rest = children.slice(index + 1);
  const sameLine = rest.some(node => !whitespace(node));
  if (sameLine && (rest[0].type !== 'text' || !/^\s*\n/.test(rest[0].data))) return null;
  const all = element.children || [];
  const body = sameLine ? `<p>${rest.map(node => renderNode(node, context)).join('').replace(/^\s*\n/, '')}</p>${all.filter(node => node !== paragraph).map(node => renderNode(node, context)).join('')}` : all.filter(node => node !== paragraph).map(node => renderNode(node, context)).join('').replace(/^\s+/, '');
  return `<ac:structured-macro ac:name="${kind}">\n          <ac:rich-text-body>${body}</ac:rich-text-body>\n        </ac:structured-macro>`;
}
function renderElement(element, context) {
  const name = element.name;
  if (name === 'p') {
    const parsed = paragraphMacro(element);
    if (parsed) {
      if (parsed.kind === 'anchor') return `<ac:structured-macro ac:name="anchor"><ac:parameter ac:name="">${parsed.id}</ac:parameter></ac:structured-macro>`;
      return `<ac:structured-macro ac:name="${parsed.kind}" ac:schema-version="${parsed.kind === 'toc' ? 1 : 2}" />`;
    }
  }
  if (name === 'p' || /^h[1-6]$/.test(name) || ['strong', 'em', 'ul', 'ol', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'code'].includes(name)) return `<${name}${attributes(element.attribs)}>${renderChildren(element, context)}</${name}>`;
  if (name === 'hr') return '<hr />';
  if (name === 'br') return '<br />';
  if (name === 'img') return `<img${attributes(element.attribs)}>`;
  if (name === 'li' || name === 'th' || name === 'td') {
    const body = renderChildren(element, context);
    return `<${name}${attributes(element.attribs)}>${inlineChildren(element) ? `<p>${body}</p>` : body}</${name}>`;
  }
  if (name === 'pre') return renderPre(element, context);
  if (name === 'a') return renderLink(element, context);
  if (name === 'blockquote') return callout(element, context) || `<blockquote>${renderChildren(element, context)}</blockquote>`;
  if (name === 'details') {
    const summary = (element.children || []).find(node => node.type === 'tag' && node.name === 'summary');
    if (!summary) return `<details${attributes(element.attribs)}>${renderChildren(element, context)}</details>`;
    const title = renderChildren(summary, context).replace(/<[^>]+>/g, '').trim();
    const body = (element.children || []).filter(node => node !== summary && !whitespace(node)).map(node => renderNode(node, context)).join('').trim();
    return `<ac:structured-macro ac:name="expand"><ac:parameter ac:name="title">${title}</ac:parameter><ac:rich-text-body>${body}</ac:rich-text-body></ac:structured-macro>`;
  }
  if (name === 'svg' || name === 'div') {
    const raw = `<${name}${attributes(element.attribs)}>${renderChildren(element, context)}</${name}>`.replace(/]]>/g, ']]]]><![CDATA[>');
    return `<ac:structured-macro ac:name="html" ac:schema-version="1" ac:macro-id="${randomUUID()}"><ac:plain-text-body><![CDATA[${raw}]]></ac:plain-text-body></ac:structured-macro>`;
  }
  return `<${name}${attributes(element.attribs)}>${renderChildren(element, context)}</${name}>`;
}

class MacroConverter {
  constructor({ isCloud = false, webUrlPrefix = '', buildUrl = null, linkStyle = null } = {}) {
    this._isCloud = isCloud;
    this.webUrlPrefix = webUrlPrefix;
    this.buildUrl = buildUrl || (url => url);
    this.linkStyle = resolveLinkStyle({ isCloud, linkStyle });
    this.markdown = new MarkdownIt();
    this.setupMarkdownExtensions();
  }
  isCloud() { return this._isCloud; }
  setupMarkdownExtensions() {
    this.markdown.enable(['table', 'strikethrough', 'linkify']);
    this.markdown.core.ruler.before('normalize', 'confluence_macros', state => {
      const code = [];
      state.src = state.src.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`/g, match => { code.push(match); return `${STASH}${code.length - 1}${STASH}`; });
      for (const kind of CALLOUTS) {
        const pattern = new RegExp(`(^|\\n)\\[!${kind}\\]\\s*([\\s\\S]*?)(?=\\n\\s*\\n|\\n\\s*\\[!|$)`, 'g');
        state.src = state.src.replace(pattern, (_, prefix, body) => `${prefix}> **${kind.toUpperCase()}**\n> ${body.trim().replace(/\n/g, '\n> ')}`);
      }
      state.src = state.src.replace(new RegExp(`${STASH}(\\d+)${STASH}`, 'g'), (match, index) => code[Number(index)] ?? match);
    });
  }
  markdownToStorage(markdown) { return this.htmlToConfluenceStorage(this.renderMarkdown(markdown)); }
  markdownToNativeStorage(markdown) { return this.markdownToStorage(markdown); }
  renderMarkdown(markdown) {
    const passthrough = [];
    const prepare = text => text
      .replace(/<!--\s*(?:\[\[)?_TOC_(?:\]\])?\s*-->/gi, '**TOC**')
      .replace(/<!--\s*(?:\[\[)?_LISTING_(?:\]\])?\s*-->/gi, '**LISTING**')
      .replace(/\[\[_TOC_\]\]/gi, '**TOC**').replace(/\[\[_LISTING_\]\]/gi, '**LISTING**')
      .replace(PASSTHROUGH_BLOCK, match => { passthrough.push(match); return `${STASH}H${passthrough.length - 1}${STASH}`; })
      .replace(PASSTHROUGH_TAG, match => { passthrough.push(match); return `${STASH}H${passthrough.length - 1}${STASH}`; });
    const ranges = this.codeRanges(markdown);
    let prepared = '', cursor = 0;
    for (const [start, end] of ranges) { prepared += prepare(markdown.slice(cursor, start)) + markdown.slice(start, end); cursor = end; }
    prepared += prepare(markdown.slice(cursor));
    const html = this.markdown.render(prepared);
    let scan = 0, insideTag = false;
    return html.replace(new RegExp(`${STASH}H(\\d+)${STASH}`, 'g'), (match, index, offset) => {
      while (scan < offset) { if (html[scan] === '<') insideTag = true; if (html[scan] === '>') insideTag = false; scan++; }
      scan = offset + match.length;
      const original = passthrough[Number(index)];
      return original == null ? match : insideTag ? escapeAttribute(original) : original;
    });
  }
  codeRanges(markdown) {
    const offsets = [0];
    for (let index = 0; index < markdown.length; index++) if (markdown[index] === '\n') offsets.push(index + 1);
    const ranges = this.markdown.parse(markdown, {}).filter(token => ['code_block', 'fence'].includes(token.type) && token.map).map(token => [offsets[token.map[0]] ?? markdown.length, offsets[token.map[1]] ?? markdown.length]);
    const inline = /`[^`\n]+`/g;
    for (let match; (match = inline.exec(markdown));) ranges.push([match.index, match.index + match[0].length]);
    ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const merged = [];
    for (const range of ranges) { const previous = merged[merged.length - 1]; if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]); else merged.push([...range]); }
    return merged;
  }
  htmlToConfluenceStorage(html) { return htmlToStorage(html, { isCloud: this._isCloud, linkStyle: this.linkStyle }); }
  detectLanguageLabels(xml) {
    const labels = { includePage: 'Include Page', sharedBlock: 'Shared Block', includeSharedBlock: 'Include Shared Block', fromPage: 'from page', expandDetails: 'Expand Details' };
    const localized = /[\u4e00-\u9fa5]/.test(xml) ? ['包含页面', '共享块', '包含共享块', '来自页面', '展开详情']
      : /[\u3040-\u30ff]/.test(xml) ? ['ページを含む', '共有ブロック', '共有ブロックを含む', 'ページから', '詳細を表示']
      : /[\uac00-\ud7af]/.test(xml) ? ['페이지 포함', '공유 블록', '공유 블록 포함', '페이지에서', '상세 보기']
      : /[\u0400-\u04ff]/.test(xml) ? ['Включить страницу', 'Общий блок', 'Включить общий блок', 'со страницы', 'Подробнее']
      : (xml.match(/[àâäéèêëïîôùûüÿœæç]/gi) || []).length >= 2 ? ['Inclure la page', 'Bloc partagé', 'Inclure le bloc partagé', 'de la page', 'Détails']
      : (xml.match(/[äöüß]/gi) || []).length >= 2 ? ['Seite einbinden', 'Gemeinsamer Block', 'Gemeinsamen Block einbinden', 'von Seite', 'Details']
      : (xml.match(/[áéíóúñ¿¡]/gi) || []).length >= 2 ? ['Incluir página', 'Bloque compartido', 'Incluir bloque compartido', 'de la página', 'Detalles'] : null;
    if (localized) [labels.includePage, labels.sharedBlock, labels.includeSharedBlock, labels.fromPage, labels.expandDetails] = localized;
    return labels;
  }
  storageToMarkdown(xml, options = {}) {
    const walker = new StorageWalker({ attachmentsDir: options.attachmentsDir || 'attachments', labels: this.detectLanguageLabels(xml), buildUrl: this.buildUrl, webUrlPrefix: this.webUrlPrefix });
    const markdown = walker.walk(xml);
    if (typeof options.onWarnings === 'function' && walker.warnings.length) options.onWarnings(walker.warnings);
    return markdown;
  }
}

module.exports = MacroConverter;
module.exports.VALID_LINK_STYLES = VALID_LINK_STYLES;
