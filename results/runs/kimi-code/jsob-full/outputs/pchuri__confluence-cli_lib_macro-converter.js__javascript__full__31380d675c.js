'use strict';

const MarkdownIt = require('markdown-it');
const { parseDocument, DomUtils } = require('htmlparser2');
const { decodeHTML } = require('entities');

const VALID_LINK_STYLES = ['smart', 'plain', 'wiki'];
const CALLOUT_MARKERS = ['info', 'warning', 'note'];
const STASH_DELIMITER = '\uE000';
const PASSTHROUGH_TAG_RE = /<\/?(?:br|u|sub|sup|mark|details|summary)(?=[\s/>])(?:"[^"]*"|'[^']*'|[^>])*>/gi;
const PASSTHROUGH_BLOCK_RE = /<(svg|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi;
const INLINE_CODE_RE = /`[^`\n]+`/g;
const DEFAULT_MAX_DEPTH = 256;

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

function resolveLinkStyle({ isCloud = false, linkStyle = null } = {}) {
  return VALID_LINK_STYLES.includes(linkStyle) ? linkStyle : isCloud ? 'smart' : 'plain';
}

function escapeXmlAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeMarkdownText(value) {
  return decodeHTML(String(value)).replace(/([\\`*_[\]<>])/g, '\\$1');
}

function nodeName(node) {
  return String(node && node.name || '').toLowerCase();
}

function textContent(node) {
  return DomUtils.textContent(node || '').trim();
}

function childElements(node) {
  return (node.children || []).filter(child => child.type === 'tag');
}

function findDescendant(node, name) {
  const wanted = name.toLowerCase();
  const stack = [...(node.children || [])];
  while (stack.length) {
    const child = stack.shift();
    if (nodeName(child) === wanted) return child;
    stack.unshift(...(child.children || []));
  }
  return null;
}

function findParameter(node, name) {
  const parameters = [];
  const stack = [...(node.children || [])];
  while (stack.length) {
    const child = stack.shift();
    if (nodeName(child) === 'ac:parameter') parameters.push(child);
    stack.unshift(...(child.children || []));
  }
  return parameters.find(parameter => (parameter.attribs['ac:name'] || parameter.attribs.name || '') === name);
}

function normalizeMarkdown(value) {
  return value
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

class StorageWalker {
  constructor({ attachmentsDir = 'attachments', labels = {}, buildUrl = url => url, webUrlPrefix = '', maxDepth = DEFAULT_MAX_DEPTH } = {}) {
    this.attachmentsDir = attachmentsDir;
    this.labels = labels;
    this.buildUrl = buildUrl;
    this.webUrlPrefix = webUrlPrefix;
    this.maxDepth = maxDepth;
    this.warnings = [];
    this._depth = 0;
    this._markdownLinkLabelDepth = 0;
    this._markdownCodeSpanDepth = 0;
  }

  walk(storage) {
    const document = parseDocument(storage, { xmlMode: true, recognizeSelfClosing: true, decodeEntities: true });
    return this.cleanup(this.walkNodes(document.children));
  }

  walkNodes(nodes = []) {
    return nodes.map(node => this.walkNode(node)).join('');
  }

  walkNode(node) {
    if (node.type === 'text' || node.type === 'cdata') return this.renderText(node.data || '');
    if (node.type === 'comment') return '';
    if (node.type !== 'tag') return this.walkNodes(node.children);
    return this.walkElement(node);
  }

  walkElement(node) {
    if (++this._depth > this.maxDepth) {
      this._depth--;
      throw new StorageDepthExceededError(this.maxDepth);
    }
    try {
      return this._dispatchElement(node);
    } finally {
      this._depth--;
    }
  }

  _dispatchElement(node) {
    const name = nodeName(node);
    const content = () => this.walkNodes(node.children);
    if (/^h[1-6]$/.test(name)) return `\n${'#'.repeat(Number(name[1]))} ${content().trim()}\n`;
    const handlers = {
      p: () => `\n${content().trim()}\n`,
      strong: () => `**${content()}**`, b: () => `**${content()}**`,
      em: () => `*${content()}*`, i: () => `*${content()}*`,
      del: () => `~~${content()}~~`, s: () => `~~${content()}~~`,
      code: () => this.renderCodeSpan(content()), pre: () => content().trim(),
      br: () => '\n', hr: () => '\n---\n',
      a: () => this.renderLink(node), time: () => this.renderText(node.attribs.datetime || '') || content(),
      ul: () => this.renderList(node, false), ol: () => this.renderList(node, true), li: content,
      table: () => this.renderTable(node),
      blockquote: () => this.handleBlockquote(node),
      sub: () => `<sub>${content()}</sub>`, sup: () => `<sup>${content()}</sup>`,
      u: () => `<u>${content()}</u>`, mark: () => `<mark>${content()}</mark>`,
      details: () => `<details>${content()}</details>`, summary: () => `<summary>${content()}</summary>`,
      'ac:image': () => this.renderImage(node),
      'ac:link': () => this.renderAcLink(node),
      'ac:structured-macro': () => this.renderMacro(node),
      'ac:task-list': () => this.renderTaskList(node),
    };
    if (handlers[name]) return handlers[name]();
    if (['thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'li', 'ac:rich-text-body', 'ac:task', 'ac:task-body'].includes(name)) return content();
    if (['ac:parameter', 'ri:page', 'ri:url', 'ri:attachment', 'ac:plain-text-body', 'ac:plain-text-link-body', 'ac:link-body', 'ac:emoticon', 'img'].includes(name)) return '';
    return content();
  }

  handleBlockquote(node) {
    const body = this.walkNodes(node.children).trim();
    if (!body) return '';
    return `\n${body.split('\n').map(line => line ? `> ${line}` : '>').join('\n')}\n`;
  }

  renderCodeSpan(value) {
    const longestRun = Math.max(0, ...(value.match(/`+/g) || []).map(run => run.length));
    const fence = '`'.repeat(longestRun + 1);
    const padding = value.startsWith('`') || value.endsWith('`') ? ' ' : '';
    return `${fence}${padding}${value}${padding}${fence}`;
  }

  renderList(node, ordered) {
    let index = 1;
    return childElements(node).filter(child => nodeName(child) === 'li').map(item => {
      const marker = ordered ? `${index++}. ` : '- ';
      const body = this.walkNodes(item.children).trim().replace(/\n/g, '\n  ');
      return marker + body;
    }).join('\n') + '\n\n';
  }

  renderTable(node) {
    const rows = [];
    const stack = [...(node.children || [])];
    while (stack.length) {
      const child = stack.shift();
      if (nodeName(child) === 'tr') rows.push(child);
      else stack.unshift(...(child.children || []));
    }
    if (!rows.length) return '';
    const matrix = rows.map(row => childElements(row).filter(cell => ['td', 'th'].includes(nodeName(cell))).map(cell => this.walkNodes(cell.children).trim().replace(/\|/g, '\\|')));
    const width = Math.max(...matrix.map(row => row.length));
    const first = matrix[0];
    const lines = [`| ${Array.from({ length: width }, (_, index) => first[index] || '').join(' | ')} |`, `| ${Array(width).fill('---').join(' | ')} |`];
    for (const row of matrix.slice(1)) lines.push(`| ${Array.from({ length: width }, (_, index) => row[index] || '').join(' | ')} |`);
    return lines.join('\n') + '\n\n';
  }

  renderLink(node) {
    const href = decodeHTML(node.attribs.href || '');
    if (!href) return this.walkNodes(node.children);
    this._markdownLinkLabelDepth++;
    try {
      return `[${this.walkNodes(node.children)}](${href})`;
    } finally {
      this._markdownLinkLabelDepth--;
    }
  }

  renderAcLink(node) {
    const plainBody = findDescendant(node, 'ac:plain-text-link-body');
    const richBody = findDescendant(node, 'ac:link-body');
    if (node.attribs['ac:anchor']) {
      const label = plainBody ? this.getRawText(plainBody) : '';
      return label ? `[${label}](#${decodeHTML(node.attribs['ac:anchor'])})` : '';
    }
    const url = findDescendant(node, 'ri:url');
    if (url) {
      const label = plainBody ? this.getRawText(plainBody) : '';
      return label ? `[${label}](${decodeHTML(url.attribs['ri:value'] || '')})` : '';
    }
    if (richBody) return this.walkNodes(richBody.children).trim();
    const page = findDescendant(node, 'ri:page');
    return page ? `[${this.escapeMarkdownText(decodeHTML(page.attribs['ri:content-title'] || ''))}]` : '';
  }

  renderImage(node) {
    const attachment = findDescendant(node, 'ri:attachment');
    const url = findDescendant(node, 'ri:url');
    const filename = attachment && attachment.attribs['ri:filename'];
    const href = filename ? `${this.attachmentsDir}/${filename}` : url ? url.attribs['ri:value'] : '';
    return `![${filename || node.attribs['ac:alt'] || ''}](${this.buildUrl(href)})`;
  }

  renderMacro(node) {
    const name = node.attribs['ac:name'] || '';
    if (['attachments', 'recently-updated', 'toc', 'children'].includes(name)) return '';
    if (name === 'expand') return this.handleExpand(node);
    if (name === 'code') return this.handleCode(node);
    if (CALLOUT_MARKERS.includes(name)) return this.handleCallout(node, name);
    if (name === 'anchor') return this.handleAnchor(node);
    if (name === 'panel') return this.handlePanel(node);
    if (name === 'mermaid-macro') return this.handleDiagram(node, 'mermaid');
    if (name === 'plantuml') return this.handleDiagram(node, 'plantuml');
    if (name === 'include') return this.handleInclude(node);
    if (name === 'shared-block' || name === 'include-shared-block') return this.handleSharedBlock(node, name);
    if (name === 'view-file') return this.handleViewFile(node);
    return '';
  }

  handleExpand(node) {
    const title = this.getTextContent(this.findParamByName(node, 'title')).trim();
    const body = this.walkNodes(this.getMacroBody(node)).trim();
    if (title) return `\n**EXPAND: ${title}**\n\n${body}\n\n**EXPAND_END**\n`;
    return `\n<details>\n<summary>${this.labels.expandDetails || 'Expand Details'}</summary>\n\n${body}\n\n</details>\n`;
  }

  handleCode(node) {
    const language = this.getTextContent(this.findParamByName(node, 'language'));
    const body = this.getRawText(this.findChildByName(node, 'ac:plain-text-body'));
    const fence = '`'.repeat(Math.max(3, Math.max(0, ...(body.match(/`+/g) || []).map(run => run.length)) + 1));
    return `\n${fence}${language}\n${body}\n${fence}\n`;
  }

  handleCallout(node, name) {
    const body = this.walkNodes(this.getMacroBody(node)).trim();
    const quoted = body.split('\n').map(line => line ? `> ${line}` : '>').join('\n');
    return `\n> **${name.toUpperCase()}**${body ? `\n${quoted}` : ''}\n`;
  }

  handleAnchor(node) {
    const anchor = this.getTextContent(this.findParamByName(node, '')).trim();
    return anchor ? `\n**ANCHOR: ${anchor}**\n` : '';
  }

  handlePanel(node) {
    const title = this.getTextContent(this.findParamByName(node, 'title')).trim();
    const body = this.walkNodes(this.getMacroBody(node)).trim();
    if (!title && !body) return '';
    if (!title) return `\n${body}\n`;
    if (!body) return `\n> **${title}**\n`;
    return `\n> **${title}**\n>\n${body.split('\n').map(line => `> ${line}`).join('\n')}\n`;
  }

  handleDiagram(node, language) {
    const body = this.getRawText(this.findChildByName(node, 'ac:plain-text-body')).trim();
    const fence = '`'.repeat(Math.max(3, Math.max(0, ...(body.match(/`+/g) || []).map(run => run.length)) + 1));
    return `\n${fence}${language}\n${body}\n${fence}\n`;
  }

  handleInclude(node) {
    const parameter = this.findParamByName(node, '');
    const page = parameter && findDescendant(parameter, 'ri:page');
    if (!page) return '';
    const space = decodeHTML(page.attribs['ri:space-key'] || '');
    const title = decodeHTML(page.attribs['ri:content-title'] || '');
    const label = this.escapeMarkdownText(title);
    const path = space.startsWith('~') ? `display/${space}/${encodeURIComponent(title)}` : `spaces/${space}/pages/[PAGE_ID_HERE]`;
    const suffix = space.startsWith('~') ? '' : ' _(manual link correction required)_';
    return `\n> 📄 **${this.labels.includePage || 'Include Page'}**: [${label}](${this.buildUrl(`${this.webUrlPrefix}/${path}`)})${suffix}\n`;
  }

  handleSharedBlock(node, name) {
    const blockName = '';
    const body = this.walkNodes(this.getMacroBody(node)).trim();
    const label = this.labels.sharedBlock || 'Shared Block';
    if (name === 'include-shared-block') return '';
    if (!blockName && !body) return '';
    const heading = blockName ? `**${label}: ${blockName}**` : `**${label}**`;
    return body ? `\n> ${heading}\n>\n${body.split('\n').map(line => `> ${line}`).join('\n')}\n` : `\n> ${heading}\n`;
  }

  handleViewFile(node) {
    const parameter = this.findParamByName(node, 'name');
    const attachment = parameter && findDescendant(parameter, 'ri:attachment');
    const filename = decodeHTML(attachment && attachment.attribs['ri:filename'] || '');
    return filename ? `\n📎 [${filename}](${this.attachmentsDir}/${filename})\n` : '';
  }

  renderTaskList(node) {
    const tasks = childElements(node).filter(child => nodeName(child) === 'ac:task').map(task => {
      const status = this.getTextContent(this.findChildByName(task, 'ac:task-status'));
      const bodyNode = this.findChildByName(task, 'ac:task-body');
      const body = bodyNode ? this.walkNodes(bodyNode.children).replace(/\s+/g, ' ').trim() : '';
      return body ? `- [${status === 'complete' ? 'x' : ' '}] ${body}` : '';
    }).filter(Boolean);
    return tasks.length ? `\n${tasks.join('\n')}\n` : '';
  }

  findParamByName(node, name) {
    return (node && node.children || []).find(child => child.type === 'tag' && nodeName(child) === 'ac:parameter' && child.attribs['ac:name'] === name) || null;
  }

  findChildByName(node, name) {
    return (node && node.children || []).find(child => child.type === 'tag' && nodeName(child) === name) || null;
  }

  findAllDescendants(node, name) {
    const matches = [];
    const visit = current => {
      if (!current) return;
      if (current.type === 'tag' && nodeName(current) === name) matches.push(current);
      (current.children || []).forEach(visit);
    };
    (node && node.children || []).forEach(visit);
    return matches;
  }

  getMacroBody(node) {
    const body = this.findChildByName(node, 'ac:rich-text-body');
    return body ? body.children : [];
  }

  getTextContent(node) { return decodeHTML(this._collectText(node)); }
  _collectText(node) { return node ? node.type === 'text' ? node.data || '' : (node.children || []).map(child => this._collectText(child)).join('') : ''; }
  getRawText(node) { return this._collectRawText(node); }
  _collectRawText(node) { return node ? node.type === 'text' || node.type === 'cdata' ? node.data || '' : (node.children || []).map(child => this._collectRawText(child)).join('') : ''; }
  escapeMarkdownText(value) { return value ? value.replace(/([\\`*_[\]()~|<>])/g, '\\$1') : ''; }
  renderText(value) {
    const decoded = decodeHTML(value || '');
    return this._markdownLinkLabelDepth === 0 && this._markdownCodeSpanDepth === 0 ? this.escapeMarkdownText(decoded) : decoded;
  }
  cleanup(value) { return normalizeMarkdown(value); }
}

function htmlToStorage(html, { isCloud = false, linkStyle = 'smart' } = {}) {
  const document = parseDocument(html, { decodeEntities: false });
  function render(node) {
    if (node.type === 'text') return node.data;
    if (node.type === 'comment') {
      const value = node.data.trim();
      if (/^(?:\[\[)?_TOC_(?:\]\])?$/.test(value)) return '<ac:structured-macro ac:name="toc" ac:schema-version="1" />';
      if (/^(?:\[\[)?_LISTING_(?:\]\])?$/.test(value)) return '<ac:structured-macro ac:name="children" ac:schema-version="2" />';
      if (/^ANCHOR: /.test(value)) return `<ac:structured-macro ac:name="anchor"><ac:parameter ac:name="">${escapeXmlAttribute(value.slice(8))}</ac:parameter></ac:structured-macro>`;
      return '';
    }
    if (node.type !== 'tag') return (node.children || []).map(render).join('');
    const name = nodeName(node);
    const content = (node.children || []).map(render).join('');
    if (name === 'pre' && childElements(node)[0] && nodeName(childElements(node)[0]) === 'code') {
      const code = childElements(node)[0];
      const language = (code.attribs.class || '').replace(/^language-/, '');
      return `<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">${escapeXmlAttribute(language)}</ac:parameter><ac:plain-text-body><![CDATA[${textContent(code).replace(/\]\]>/g, ']]]]><![CDATA[>')}]]></ac:plain-text-body></ac:structured-macro>`;
    }
    if (name === 'blockquote') {
      const plain = textContent(node);
      const match = plain.match(/^(INFO|WARNING|NOTE)\s+([\s\S]*)$/i);
      if (match) {
        const body = content.replace(/^\s*<p><strong>[^<]+<\/strong>\s*/, '<p>');
        return `<ac:structured-macro ac:name="${match[1].toLowerCase()}">\n          <ac:rich-text-body>${body}\n</ac:rich-text-body>\n        </ac:structured-macro>`;
      }
    }
    if (name === 'th' || name === 'td') return `<${name}${Object.entries(node.attribs || {}).map(([key, value]) => ` ${key}="${escapeXmlAttribute(value)}"`).join('')}><p>${content}</p></${name}>`;
    if (name === 'a' && linkStyle === 'wiki') {
      const href = node.attribs.href || '';
      return `<ac:link><ri:url ri:value="${escapeXmlAttribute(href)}" /><ac:plain-text-link-body><![CDATA[${textContent(node).replace(/\]\]>/g, ']]]]><![CDATA[>')}]]></ac:plain-text-link-body></ac:link>`;
    }
    const attributes = Object.entries(node.attribs || {}).map(([key, value]) => ` ${key}="${escapeXmlAttribute(value)}"`).join('');
    const cloudAttribute = name === 'a' && isCloud && linkStyle === 'smart' ? ' data-card-appearance="inline"' : '';
    const voidElement = ['br', 'hr', 'img'].includes(name);
    return `<${name}${attributes}${cloudAttribute}>${voidElement ? '' : content + `</${name}>`}`;
  }
  return document.children.map(render).join('').replace(/<p>(<ac:structured-macro[^\n]*\/>)(?:<\/p>)/g, '$1');
}

class MacroConverter {
  constructor({ isCloud = false, webUrlPrefix = '', buildUrl = null, linkStyle = null } = {}) {
    this._isCloud = isCloud;
    this.webUrlPrefix = webUrlPrefix;
    this.buildUrl = buildUrl || (url => url);
    this.linkStyle = resolveLinkStyle({ isCloud, linkStyle });
    this.markdown = new MarkdownIt();
    this.setupConfluenceMarkdownExtensions();
  }

  isCloud() { return this._isCloud; }

  setupConfluenceMarkdownExtensions() {
    this.markdown.enable(['table', 'strikethrough', 'linkify']);
    this.markdown.core.ruler.before('normalize', 'confluence_macros', state => {
      const stashed = [];
      state.src = state.src.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`/g, value => `${STASH_DELIMITER}${stashed.push(value) - 1}${STASH_DELIMITER}`);
      for (const marker of CALLOUT_MARKERS) {
        const pattern = new RegExp(`(^|\\n)\\[!${marker}\\]\\s*([\\s\\S]*?)(?=\\n\\s*\\n|\\n\\s*\\[!|$)`, 'g');
        state.src = state.src.replace(pattern, (_, prefix, body) => `${prefix}> **${marker.toUpperCase()}**\n> ${body.trim().replace(/\n/g, '\n> ')}`);
      }
      state.src = state.src.replace(new RegExp(`${STASH_DELIMITER}(\\d+)${STASH_DELIMITER}`, 'g'), (value, index) => stashed[+index] ?? value);
    });
  }

  markdownToStorage(markdown) { return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(markdown)); }
  markdownToNativeStorage(markdown) { return this.markdownToStorage(markdown); }

  _renderMarkdownToHtml(markdown) {
    const stashed = [];
    const stash = value => `${STASH_DELIMITER}${stashed.push(value) - 1}${STASH_DELIMITER}`;
    let source = markdown;
    source = source.replace(PASSTHROUGH_BLOCK_RE, stash);
    source = source.replace(PASSTHROUGH_TAG_RE, stash);
    source = source.replace(/<!--\s*(?:\[\[)?_TOC_(?:\]\])?\s*-->/gi, () => stash('<!-- _TOC_ -->'));
    source = source.replace(/<!--\s*(?:\[\[)?_LISTING_(?:\]\])?\s*-->/gi, () => stash('<!-- _LISTING_ -->'));
    let html = this.markdown.render(source);
    html = html.replace(new RegExp(`${STASH_DELIMITER}(\\d+)${STASH_DELIMITER}`, 'g'), (value, index) => stashed[+index] ?? value);
    html = html.replace(/<p>(<ac:structured-macro[^\n]*\/>)(?:<\/p>)/g, '$1');
    return html;
  }

  _findCodeRanges(markdown) {
    const tokens = this.markdown.parse(markdown, {});
    const lineStarts = [0];
    for (let index = 0; index < markdown.length; index += 1) if (markdown[index] === '\n') lineStarts.push(index + 1);
    const lineOffset = line => line < lineStarts.length ? lineStarts[line] : markdown.length;
    const ranges = [];
    for (const token of tokens) if ((token.type === 'code_block' || token.type === 'fence') && token.map) ranges.push([lineOffset(token.map[0]), lineOffset(token.map[1])]);
    INLINE_CODE_RE.lastIndex = 0;
    let match;
    while ((match = INLINE_CODE_RE.exec(markdown)) !== null) ranges.push([match.index, match.index + match[0].length]);
    ranges.sort((left, right) => left[0] - right[0] || left[1] - right[1]);
    const merged = [];
    for (const range of ranges) {
      const previous = merged[merged.length - 1];
      if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]);
      else merged.push([...range]);
    }
    return merged;
  }

  htmlToConfluenceStorage(html) { return htmlToStorage(html, { isCloud: this._isCloud, linkStyle: this.linkStyle }); }

  detectLanguageLabels(storage) {
    const english = { includePage: 'Include Page', sharedBlock: 'Shared Block', includeSharedBlock: 'Include Shared Block', fromPage: 'from page', expandDetails: 'Expand Details' };
    if (/[\u4e00-\u9fa5]/.test(storage)) return { includePage: '包含页面', sharedBlock: '共享块', includeSharedBlock: '包含共享块', fromPage: '来自页面', expandDetails: '展开详情' };
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(storage)) return { includePage: 'ページを含む', sharedBlock: '共有ブロック', includeSharedBlock: '共有ブロックを含む', fromPage: 'ページから', expandDetails: '詳細を表示' };
    if (/[\uac00-\ud7af]/.test(storage)) return { includePage: '페이지 포함', sharedBlock: '공유 블록', includeSharedBlock: '공유 블록 포함', fromPage: '페이지에서', expandDetails: '상세 보기' };
    if (/[\u0400-\u04ff]/.test(storage)) return { includePage: 'Включить страницу', sharedBlock: 'Общий блок', includeSharedBlock: 'Включить общий блок', fromPage: 'со страницы', expandDetails: 'Подробнее' };
    if ((storage.match(/[àâäéèêëïîôùûüÿœæç]/gi) || []).length >= 2) return { includePage: 'Inclure la page', sharedBlock: 'Bloc partagé', includeSharedBlock: 'Inclure le bloc partagé', fromPage: 'de la page', expandDetails: 'Détails' };
    if ((storage.match(/[äöüß]/gi) || []).length >= 2) return { includePage: 'Seite einbinden', sharedBlock: 'Gemeinsamer Block', includeSharedBlock: 'Gemeinsamen Block einbinden', fromPage: 'von Seite', expandDetails: 'Details' };
    if ((storage.match(/[áéíóúñ¿¡]/gi) || []).length >= 2) return { includePage: 'Incluir página', sharedBlock: 'Bloque compartido', includeSharedBlock: 'Incluir bloque compartido', fromPage: 'de la página', expandDetails: 'Detalles' };
    return english;
  }

  storageToMarkdown(storage, options = {}) {
    const walker = new StorageWalker({ attachmentsDir: options.attachmentsDir || 'attachments', labels: this.detectLanguageLabels(storage), buildUrl: this.buildUrl, webUrlPrefix: this.webUrlPrefix });
    const markdown = walker.walk(storage);
    if (typeof options.onWarnings === 'function' && walker.warnings.length) options.onWarnings(walker.warnings);
    return markdown;
  }
}

module.exports = MacroConverter;
module.exports.VALID_LINK_STYLES = VALID_LINK_STYLES;
