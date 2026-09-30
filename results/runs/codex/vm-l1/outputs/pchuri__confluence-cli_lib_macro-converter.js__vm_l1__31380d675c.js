'use strict';

const MarkdownIt = require('markdown-it');
const { parseDocument } = require('htmlparser2');
const { decodeHTML } = require('entities');
const { randomUUID } = require('crypto');

const VALID_LINK_STYLES = ['smart', 'plain', 'wiki'];
const CALLOUT_MARKERS = ['info', 'warning', 'note'];
const STASH_DELIMITER = '\uE000';
const PASSTHROUGH_TAG_RE = /<\/?(?:br|u|sub|sup|mark|details|summary)(?=[\s/>])(?:"[^"]*"|'[^']*'|[^>])*>/gi;
const PASSTHROUGH_BLOCK_RE = /<(svg|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi;
const INLINE_CODE_RE = /`[^`\n]+`/g;
const DEFAULT_MAX_DEPTH = 256;

function escapeXmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fenceLength(value) {
  const fences = String(value).match(/`+/g) || [];
  return Math.max(3, ...fences.map(fence => fence.length + 1));
}

function splitOnFences(markdown) {
  const parts = [];
  const fencePattern = /^ {0,3}(`{3,})[^\n]*\n[\s\S]*?\n {0,3}\1[\t ]*$/gm;
  let previousEnd = 0;
  let match;

  while ((match = fencePattern.exec(markdown))) {
    parts.push(markdown.slice(previousEnd, match.index), match[0]);
    previousEnd = match.index + match[0].length;
  }

  parts.push(markdown.slice(previousEnd));
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
    .map((part, index) => index % 2 === 0 ? cleanupOutsideFence(part) : part)
    .join('')
    .trim();
}

function resolveLinkStyle({ isCloud = false, linkStyle } = {}) {
  const resolved = VALID_LINK_STYLES.includes(linkStyle) ? linkStyle : isCloud ? 'smart' : 'plain';
  return resolved === 'smart' && !isCloud ? 'plain' : resolved;
}

class StorageDepthExceededError extends Error {
  constructor(maxDepth) {
    super(`Storage XML nesting exceeds limit of ${maxDepth} levels`);
    this.name = 'StorageDepthExceededError';
    this.maxDepth = maxDepth;
  }
}

class HtmlDepthExceededError extends Error {
  constructor(maxDepth) {
    super(`HTML nesting exceeds limit of ${maxDepth} levels`);
    this.name = 'HtmlDepthExceededError';
    this.maxDepth = maxDepth;
  }
}

function nodeText(node) {
  if (!node) return '';
  if (node.type === 'text' || node.type === 'cdata') return node.data || '';
  return (node.children || []).map(nodeText).join('');
}

function rawNodeText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.data || '';
  if (node.type === 'cdata') return (node.children || []).map(rawNodeText).join('');
  return (node.children || []).map(rawNodeText).join('');
}

function findChild(node, name) {
  return (node.children || []).find(child => child.type === 'tag' && child.name === name);
}

function findDescendants(node, name, result = []) {
  for (const child of node.children || []) {
    if (child.type === 'tag' && child.name === name) result.push(child);
    findDescendants(child, name, result);
  }
  return result;
}

function findParameter(node, name) {
  return (node.children || []).find(child =>
    child.type === 'tag' && child.name === 'ac:parameter' && child.attribs?.['ac:name'] === name
  );
}

function markdownCodeSpan(value) {
  const longest = (value.match(/`+/g) || []).reduce((max, run) => Math.max(max, run.length), 0);
  const fence = '`'.repeat(longest + 1);
  const padding = value.startsWith('`') || value.endsWith('`') ? ' ' : '';
  return `${fence}${padding}${value}${padding}${fence}`;
}

class StorageWalker {
  constructor({ attachmentsDir = 'attachments', labels = {}, buildUrl = value => value, webUrlPrefix = '', maxDepth = DEFAULT_MAX_DEPTH } = {}) {
    this.attachmentsDir = attachmentsDir;
    this.labels = labels;
    this.buildUrl = buildUrl;
    this.webUrlPrefix = webUrlPrefix;
    this.maxDepth = maxDepth;
    this._depth = 0;
    this._markdownLinkLabelDepth = 0;
    this._markdownCodeSpanDepth = 0;
    this.warnings = [];
  }

  walk(storageXml) {
    this._depth = 0;
    this.warnings = [];
    const document = parseDocument(storageXml, { xmlMode: true, decodeEntities: true });
    return this.cleanup(this.walkNodes(document.children));
  }

  walkNodes(nodes = []) {
    return nodes.map(node => this.walkNode(node)).join('');
  }

  walkNode(node) {
    if (!node) return '';
    if (node.type === 'text' || node.type === 'cdata') return this.renderText(node.data || '');
    if (node.type === 'comment' || node.type === 'directive') return '';
    if (node.type === 'tag' || node.type === 'script' || node.type === 'style') return this.walkElement(node);
    return this.walkNodes(node.children);
  }

  walkElement(node) {
    this._depth += 1;
    if (this._depth > this.maxDepth) throw new StorageDepthExceededError(this.maxDepth);
    try {
      return this._dispatchElement(node);
    } finally {
      this._depth -= 1;
    }
  }

  _dispatchElement(node) {
    const children = () => this.walkNodes(node.children || []);
    switch (node.name) {
      case 'p': return `${children().trim()}\n\n`;
      case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
        return `${'#'.repeat(Number(node.name[1]))} ${children().trim()}\n\n`;
      case 'strong': case 'b': return `**${children()}**`;
      case 'em': case 'i': return `*${children()}*`;
      case 's': case 'del': return `~~${children()}~~`;
      case 'code':
        this._markdownCodeSpanDepth += 1;
        try { return this.renderCodeSpan(nodeText(node)); } finally { this._markdownCodeSpanDepth -= 1; }
      case 'br': return '\n';
      case 'hr': return '\n---\n';
      case 'a': {
        const label = children();
        const href = decodeHTML(node.attribs?.href || '');
        this._markdownLinkLabelDepth += 1;
        try { return `[${label}](${href})`; } finally { this._markdownLinkLabelDepth -= 1; }
      }
      case 'time': return node.attribs?.datetime || children();
      case 'ul': return this.handleList(node, false);
      case 'ol': return this.handleList(node, true);
      case 'li': return children();
      case 'table': return this.handleTable(node);
      case 'thead': case 'tbody': case 'tfoot': case 'tr': case 'th': case 'td': return children();
      case 'blockquote': return this.handleBlockquote(node);
      case 'details': return this.handleExpand(node);
      case 'summary': return children();
      case 'u': case 'sub': case 'sup': case 'mark': return `<${node.name}>${children()}</${node.name}>`;
      case 'ac:structured-macro': return this.handleMacro(node);
      case 'ac:image': return this.handleImage(node);
      case 'ac:link': return this.handleAcLink(node);
      case 'ac:task-list': return this.handleTaskList(node);
      case 'ac:layout': case 'ac:layout-section': case 'ac:layout-cell': case 'ac:rich-text-body': case 'ac:link-body':
        return children();
      case 'ri:url': return node.attribs?.['ri:value'] || '';
      case 'ri:page': return node.attribs?.['ri:content-title'] || '';
      case 'ri:attachment': return node.attribs?.['ri:filename'] || '';
      case 'ac:plain-text-body': case 'ac:plain-text-link-body': return this.getRawText(node);
      case 'ac:parameter': return '';
      default: return children();
    }
  }

  handleList(node, ordered) {
    const items = (node.children || []).filter(child => child.type === 'tag' && child.name === 'li');
    return `${items.map((item, index) => {
      const body = this.walkNodes(item.children).replace(/\s+/g, ' ').trim();
      return `${ordered ? `${index + 1}.` : '-'} ${body}`;
    }).join('\n')}\n\n`;
  }

  handleTable(node) {
    const rows = findDescendants(node, 'tr').map(row =>
      (row.children || [])
        .filter(cell => cell.type === 'tag' && (cell.name === 'th' || cell.name === 'td'))
        .map(cell => this.walkNodes(cell.children).replace(/\s+/g, ' ').trim())
    ).filter(row => row.length);
    if (!rows.length) return '';
    const output = [`| ${rows[0].join(' | ')} |`, `| ${rows[0].map(() => '---').join(' | ')} |`];
    for (const row of rows.slice(1)) output.push(`| ${row.join(' | ')} |`);
    return `${output.join('\n')}\n\n`;
  }

  handleBlockquote(node) {
    const content = this.walkNodes(node.children).trim();
    return `${content.split('\n').map(line => line ? `> ${line}` : '>').join('\n')}\n\n`;
  }

  handleMacro(node) {
    const name = node.attribs?.['ac:name'];
    switch (name) {
      case 'toc': case 'floatmenu': return '[[ _TOC_ ]]'.replace(/ /g, '') + '\n\n';
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
      default: return this.walkNodes(this.getMacroBody(node));
    }
  }

  handleExpand(node) {
    const title = this.getTextContent(findParameter(node, 'title')).trim();
    const body = this.walkNodes(this.getMacroBody(node)).trim();
    if (title) return `\n**EXPAND: ${title}**\n\n${body}\n\n**EXPAND_END**\n`;
    return `\n<details>\n<summary>${title || this.labels.expandDetails || 'Expand Details'}</summary>\n\n${body}\n\n</details>\n`;
  }

  handleCode(node) {
    const language = this.getTextContent(findParameter(node, 'language'));
    const body = this.getRawText(findChild(node, 'ac:plain-text-body'));
    const fence = '`'.repeat(fenceLength(body));
    return `${fence}${language}\n${body}\n${fence}\n`;
  }

  handleCallout(node, kind) {
    const body = this.walkNodes(this.getMacroBody(node)).trim();
    if (!body) return '';
    return `> **${kind.toUpperCase()}**\n${body.split('\n').map(line => `> ${line}`).join('\n')}\n\n`;
  }

  handleAnchor(node) {
    const id = this.getTextContent(findParameter(node, '')).trim();
    return id ? `\n**ANCHOR: ${id}**\n` : '';
  }

  handlePanel(node) {
    const title = this.getTextContent(findParameter(node, 'title')).trim();
    const body = this.walkNodes(this.getMacroBody(node)).trim();
    const lines = body.split('\n').map(line => line ? `> ${line}` : '>').join('\n');
    return `\n> **${title}**\n>\n${lines}\n`;
  }

  handleMermaid(node) {
    const body = this.getRawText(findChild(node, 'ac:plain-text-body')).trim();
    const fence = '`'.repeat(fenceLength(body));
    return body ? `${fence}mermaid\n${body}\n${fence}\n` : '';
  }

  handlePlantuml(node) {
    const body = this.getRawText(findChild(node, 'ac:plain-text-body')).trim();
    const fence = '`'.repeat(fenceLength(body));
    return body ? `${fence}plantuml\n${body}\n${fence}\n` : '';
  }

  handleInclude(node) {
    const link = findDescendants(node, 'ac:link')[0];
    const page = link && findDescendants(link, 'ri:page')[0];
    const title = this.escapeMarkdownText(page?.attribs?.['ri:content-title'] || '');
    const space = page?.attribs?.['ri:space-key'] || '';
    const label = this.labels.includePage || 'Include Page';
    if (!title) return '';
    const path = space.startsWith('~') ? `display/${space}/${encodeURIComponent(title)}` : `spaces/${space}/pages/[PAGE_ID_HERE]`;
    return `\n> 📄 **${label}**: [${title}](${this.buildUrl(`${this.webUrlPrefix}/${path}`)})\n`;
  }

  handleSharedBlock(node, kind) {
    const key = this.getTextContent(findParameter(node, 'shared-block-key')).trim();
    if (kind === 'include-shared-block') {
      const label = this.labels.includeSharedBlock || 'Include Shared Block';
      return `\n> 📄 **${label}**${key ? `: ${key}` : ''}\n`;
    }
    const label = this.labels.sharedBlock || 'Shared Block';
    const body = this.walkNodes(this.getMacroBody(node)).trim();
    return `\n> **${label}${key ? `: ${key}` : ''}**\n>\n${body.split('\n').map(line => `> ${line}`).join('\n')}\n`;
  }

  handleViewFile(node) {
    const name = this.getTextContent(findParameter(node, 'name')) || findDescendants(node, 'ri:attachment')[0]?.attribs?.['ri:filename'] || '';
    return name ? `\n📎 [${name}](${this.attachmentsDir}/${name})\n` : '';
  }

  handleImage(node) {
    const attachment = findDescendants(node, 'ri:attachment')[0];
    if (attachment) {
      const name = attachment.attribs?.['ri:filename'] || '';
      return `![${this.renderText(node.attribs?.['ac:alt'] || name)}](${this.attachmentsDir}/${name})`;
    }
    const url = findDescendants(node, 'ri:url')[0]?.attribs?.['ri:value'] || '';
    return url ? `![](${url})` : '';
  }

  handleAcLink(node) {
    const anchor = node.attribs?.['ac:anchor'];
    const plainBody = findChild(node, 'ac:plain-text-link-body');
    const richBody = findChild(node, 'ac:link-body');
    const label = plainBody ? this.getRawText(plainBody) : richBody ? this.walkNodes(richBody.children).trim() : '';
    if (anchor) return `[${label}](#${anchor})`;
    const url = findDescendants(node, 'ri:url')[0]?.attribs?.['ri:value'];
    if (url) return `[${label || url}](${url})`;
    const page = findDescendants(node, 'ri:page')[0];
    return page ? `[${label || this.escapeMarkdownText(page.attribs?.['ri:content-title'] || '')}]` : label;
  }

  handleTaskList(node) {
    const tasks = (node.children || []).filter(child => child.type === 'tag' && child.name === 'ac:task');
    return `${tasks.map(task => {
      const status = this.getTextContent(findChild(task, 'ac:task-status'));
      const bodyNode = findChild(task, 'ac:task-body');
      const body = this.walkNodes(bodyNode?.children).replace(/\s+/g, ' ').trim();
      return `- ${status === 'complete' ? '[x]' : '[ ]'} ${body}`;
    }).join('\n')}\n`;
  }

  findParamByName(node, name) { return findParameter(node, name); }
  findChildByName(node, name) { return findChild(node, name); }
  findAllDescendants(node, name) { return findDescendants(node, name); }
  getMacroBody(node) { return findChild(node, 'ac:rich-text-body')?.children || []; }
  getTextContent(node) { return nodeText(node); }
  escapeMarkdownText(value) { return String(value).replace(/([\\`*_[\]()~|<>])/g, '\\$1'); }
  renderText(value) {
    if (this._markdownLinkLabelDepth || this._markdownCodeSpanDepth) return String(value);
    return this.escapeMarkdownText(value);
  }
  renderCodeSpan(value) { return markdownCodeSpan(value); }
  _collectText(node) { return nodeText(node); }
  getRawText(node) { return rawNodeText(node); }
  _collectRawText(node) { return rawNodeText(node); }
  cleanup(markdown) { return cleanupWithFences(markdown); }
}

const SAFE_INLINE_TAGS = new Set(['a', 'strong', 'em', 'code', 'br', 'img', 'span', 'mark', 'sub', 'sup', 'ins', 'del', 'b', 'i', 'u', 'small', 's', 'abbr', 'kbd', 'q', 'var', 'cite', 'time', 'dfn', 'samp']);
const SELF_CLOSING_TAGS = new Set(['hr', 'br', 'img']);

function renderAttributes(attributes = {}) {
  return Object.entries(attributes).map(([name, value]) => ` ${name}="${escapeXmlAttr(value)}"`).join('');
}

function serializeRawHtml(node) {
  if (!node) return '';
  if (node.type === 'text') return node.data || '';
  if (node.type === 'comment') return `<!--${node.data || ''}-->`;
  if (node.type !== 'tag' && node.type !== 'script' && node.type !== 'style') return (node.children || []).map(serializeRawHtml).join('');
  return `<${node.name}${renderAttributes(node.attribs)}>${(node.children || []).map(serializeRawHtml).join('')}</${node.name}>`;
}

function decodeXmlText(value, preserveDouble = false) {
  let decoded = String(value)
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'");
  if (preserveDouble) decoded = decoded.replace(/"/g, '&quot;');
  return decoded;
}

function htmlToStorage(html, { isCloud = false, linkStyle, maxDepth = DEFAULT_MAX_DEPTH } = {}) {
  const resolvedLinkStyle = resolveLinkStyle({ isCloud, linkStyle });
  const document = parseDocument(html, { decodeEntities: false });

  function render(node, depth = 0) {
    if (depth > maxDepth) throw new HtmlDepthExceededError(maxDepth);
    if (!node) return '';
    if (node.type === 'text') return node.data || '';
    if (node.type === 'comment') {
      const marker = node.data.trim();
      if (/^(?:\[\[)?_TOC_(?:\]\])?$/.test(marker)) return '<ac:structured-macro ac:name="toc" ac:schema-version="1" />';
      if (/^(?:\[\[)?_LISTING_(?:\]\])?$/.test(marker)) return '<ac:structured-macro ac:name="children" ac:schema-version="2" />';
      return '';
    }
    if (node.type !== 'tag' && node.type !== 'script' && node.type !== 'style') return (node.children || []).map(child => render(child, depth)).join('');

    const children = () => (node.children || []).map(child => render(child, depth + 1)).join('');
    const attributes = renderAttributes(node.attribs);
    const name = node.name;

    if (name === 'pre') {
      const code = (node.children || []).find(child => child.type === 'tag' && child.name === 'code');
      if (!code) return `<pre>${children()}</pre>`;
      const language = code.attribs?.class?.match(/language-(\w+)/)?.[1] || '';
      let content = decodeXmlText(nodeText(code)).replace(/\n$/, '').replace(/]]>/g, ']]]]><![CDATA[>');
      if (language === 'plantuml') return `<ac:structured-macro ac:name="plantuml"><ac:plain-text-body><![CDATA[${content}]]></ac:plain-text-body></ac:structured-macro>`;
      return `<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">${escapeXmlAttr(language)}</ac:parameter><ac:plain-text-body><![CDATA[${content}]]></ac:plain-text-body></ac:structured-macro>`;
    }

    if (name === 'details') {
      const summary = (node.children || []).find(child => child.type === 'tag' && child.name === 'summary');
      const title = summary ? nodeText(summary).replace(/<[^>]+>/g, '').trim() : '';
      const body = (node.children || []).filter(child => child !== summary).map(child => render(child, depth + 1)).join('');
      return `<ac:structured-macro ac:name="expand"><ac:parameter ac:name="title">${title}</ac:parameter><ac:rich-text-body>${body}</ac:rich-text-body></ac:structured-macro>`;
    }

    if (name === 'blockquote') {
      const text = nodeText(node).trim();
      const callout = text.match(/^(?:\[!|\*\*)(INFO|WARNING|NOTE)(?:\]|\*\*)\s*/i);
      if (callout) {
        const kind = callout[1].toLowerCase();
        const body = children().replace(/^\s*<p>/, '<p>').replace(new RegExp(`^(<p>)?\\s*(?:\\[!${callout[1]}\\]|\\*\\*${callout[1]}\\*\\*)\\s*`, 'i'), '$1');
        return `<ac:structured-macro ac:name="${kind}">\n          <ac:rich-text-body>${body}</ac:rich-text-body>\n        </ac:structured-macro>`;
      }
      return `<blockquote>${children()}</blockquote>`;
    }

    if (name === 'p') {
      const text = nodeText(node).trim();
      if (text === '[[_TOC_]]' || text === '_TOC_' || text === 'TOC') return '<ac:structured-macro ac:name="toc" ac:schema-version="1" />';
      if (text === '[[_LISTING_]]' || text === '_LISTING_' || text === 'LISTING') return '<ac:structured-macro ac:name="children" ac:schema-version="2" />';
      const anchor = text.match(/^ANCHOR: (.+)$/);
      if (anchor) return `<ac:structured-macro ac:name="anchor"><ac:parameter ac:name="">${anchor[1]}</ac:parameter></ac:structured-macro>`;
      return `<p${attributes}>${children()}</p>`;
    }

    if (name === 'a') {
      const href = node.attribs?.href || '';
      const label = children();
      if (href.startsWith('#')) return `<ac:link ac:anchor="${escapeXmlAttr(href.slice(1))}"><ac:plain-text-link-body><![CDATA[${nodeText(node)}]]></ac:plain-text-link-body></ac:link>`;
      if (resolvedLinkStyle === 'smart') return `<a href="${escapeXmlAttr(href)}" data-card-appearance="inline">${label}</a>`;
      if (resolvedLinkStyle === 'wiki') return `<ac:link><ri:url ri:value="${escapeXmlAttr(href)}" /><ac:plain-text-link-body><![CDATA[${nodeText(node)}]]></ac:plain-text-link-body></ac:link>`;
      return `<a${attributes}>${label}</a>`;
    }

    if (name === 'svg' || name === 'div') {
      const raw = serializeRawHtml(node).replace(/]]>/g, ']]]]><![CDATA[>');
      return `<ac:structured-macro ac:name="html" ac:schema-version="1" ac:macro-id="${randomUUID()}"><ac:plain-text-body><![CDATA[${raw}]]></ac:plain-text-body></ac:structured-macro>`;
    }

    if (name === 'li') {
      const body = children();
      return /^\s*<p[ >]/.test(body) ? `<li${attributes}>${body}</li>` : `<li${attributes}><p>${body}</p></li>`;
    }

    if (SELF_CLOSING_TAGS.has(name)) return `<${name}${attributes} />`;
    if (name === 'th' || name === 'td') {
      const body = children();
      return `<${name}${attributes}>${/^\s*<p[ >]/.test(body) ? body : `<p>${body}</p>`}</${name}>`;
    }
    if (SAFE_INLINE_TAGS.has(name) || ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'code'].includes(name)) {
      return `<${name}${attributes}>${children()}</${name}>`;
    }
    return children();
  }

  return document.children.map(node => render(node)).join('');
}

const LANGUAGE_LABELS = [
  { test: /[\u4e00-\u9fa5]/, values: ['包含页面', '共享块', '包含共享块', '来自页面', '展开详情'] },
  { test: /[\u3040-\u309f\u30a0-\u30ff]/, values: ['ページを含む', '共有ブロック', '共有ブロックを含む', 'ページから', '詳細を表示'] },
  { test: /[\uac00-\ud7af]/, values: ['페이지 포함', '공유 블록', '공유 블록 포함', '페이지에서', '상세 보기'] },
  { test: /[\u0400-\u04ff]/, values: ['Включить страницу', 'Общий блок', 'Включить общий блок', 'со страницы', 'Подробнее'] },
  { test: /[àâäéèêëïîôùûüÿœæç]/gi, minimumMatches: 2, values: ['Inclure la page', 'Bloc partagé', 'Inclure le bloc partagé', 'de la page', 'Détails'] },
  { test: /[äöüß]/gi, minimumMatches: 2, values: ['Seite einbinden', 'Gemeinsamer Block', 'Gemeinsamen Block einbinden', 'von Seite', 'Details'] },
  { test: /[áéíóúñ¿¡]/gi, minimumMatches: 2, values: ['Incluir página', 'Bloque compartido', 'Incluir bloque compartido', 'de la página', 'Detalles'] }
];

class MacroConverter {
  constructor({ isCloud = false, webUrlPrefix = '', buildUrl = value => value, linkStyle } = {}) {
    this._isCloud = isCloud;
    this.webUrlPrefix = webUrlPrefix;
    this.buildUrl = buildUrl;
    this.linkStyle = resolveLinkStyle({ isCloud, linkStyle });
    this.markdown = new MarkdownIt();
    this.setupConfluenceMarkdownExtensions();
  }

  isCloud() { return this._isCloud; }

  setupConfluenceMarkdownExtensions() {
    this.markdown.enable(['table', 'strikethrough', 'linkify']);
  }

  markdownToStorage(markdown) {
    return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(markdown));
  }

  markdownToNativeStorage(markdown) {
    return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(markdown));
  }

  _renderMarkdownToHtml(source) {
    const stashed = [];
    const stash = value => `${STASH_DELIMITER}H${stashed.push(value) - 1}${STASH_DELIMITER}`;
    let markdown = String(source);
    markdown = markdown
      .replace(/<!--\s*(?:\[\[)?_TOC_(?:\]\])?\s*-->/gi, '**TOC**')
      .replace(/<!--\s*(?:\[\[)?_LISTING_(?:\]\])?\s*-->/gi, '**LISTING**')
      .replace(/\[\[_TOC_\]\]/g, '**TOC**')
      .replace(/\[\[_LISTING_\]\]/g, '**LISTING**');
    markdown = markdown.replace(PASSTHROUGH_BLOCK_RE, stash).replace(PASSTHROUGH_TAG_RE, stash);
    const rendered = this.markdown.render(markdown);
    return rendered.replace(new RegExp(`${STASH_DELIMITER}H(\\d+)${STASH_DELIMITER}`, 'g'), (match, index) => stashed[Number(index)]);
  }

  _findCodeRanges(markdown) {
    const lineOffsets = [0];
    for (let index = 0; index < markdown.length; index += 1) if (markdown[index] === '\n') lineOffsets.push(index + 1);
    const ranges = [];
    for (const token of this.markdown.parse(markdown, {})) {
      if ((token.type === 'code_block' || token.type === 'fence') && token.map) {
        ranges.push([lineOffsets[token.map[0]] || 0, lineOffsets[token.map[1]] || markdown.length]);
      }
    }
    INLINE_CODE_RE.lastIndex = 0;
    let match;
    while ((match = INLINE_CODE_RE.exec(markdown))) ranges.push([match.index, match.index + match[0].length]);
    return ranges.sort((left, right) => left[0] - right[0]);
  }

  htmlToConfluenceStorage(html) {
    return htmlToStorage(html, { isCloud: this._isCloud, linkStyle: this.linkStyle });
  }

  detectLanguageLabels(text) {
    const keys = ['includePage', 'sharedBlock', 'includeSharedBlock', 'fromPage', 'expandDetails'];
    const defaults = ['Include Page', 'Shared Block', 'Include Shared Block', 'from page', 'Expand Details'];
    const language = LANGUAGE_LABELS.find(candidate => {
      candidate.test.lastIndex = 0;
      const matches = String(text).match(candidate.test);
      return (matches?.length || 0) >= (candidate.minimumMatches || 1);
    });
    const values = language?.values || defaults;
    return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
  }

  storageToMarkdown(storageXml, options = {}) {
    const attachmentsDir = options.attachmentsDir || 'attachments';
    const labels = this.detectLanguageLabels(storageXml);
    const walker = new StorageWalker({ attachmentsDir, labels, buildUrl: this.buildUrl, webUrlPrefix: this.webUrlPrefix });
    const markdown = walker.walk(storageXml);
    if (typeof options.onWarnings === 'function' && walker.warnings.length) options.onWarnings(walker.warnings);
    return markdown;
  }
}

MacroConverter.VALID_LINK_STYLES = VALID_LINK_STYLES;
module.exports = MacroConverter;
