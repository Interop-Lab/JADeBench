'use strict';

const MarkdownIt = require('markdown-it');
const { parseDocument } = require('htmlparser2');
const { decodeHTML } = require('entities');

const VALID_LINK_STYLES = ['smart', 'plain', 'wiki'];
const CALLOUT_MARKERS = ['info', 'warning', 'note'];
const STASH_DELIM = '\uE000';
const PASSTHROUGH_TAG_RE = /<\/?(?:br|u|sub|sup|mark|details|summary)(?=[\s/>])(?:"[^"]*"|'[^']*'|[^>])*>/gi;
const PASSTHROUGH_BLOCK_RE = /<(svg|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi;
const INLINE_CODE_RE = /`[^`\n]+`/g;

function escapeXmlAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function resolveLinkStyle(style, isCloud) {
  if (style == null || style === 'smart') return isCloud ? 'plain' : 'wiki';
  if (!VALID_LINK_STYLES.includes(style)) throw new Error(`Invalid link style: ${style}`);
  return style;
}

const childNodes = node => node.children || [];
const attrs = node => node.attribs || {};

function textContent(node) {
  if (!node) return '';
  if (node.type === 'text') return node.data || '';
  return childNodes(node).map(textContent).join('');
}

function descendants(node, name) {
  const found = [];
  for (const child of childNodes(node)) {
    if (child.type === 'tag' && child.name === name) found.push(child);
    found.push(...descendants(child, name));
  }
  return found;
}

function firstDescendant(node, ...names) {
  for (const name of names) {
    const result = descendants(node, name)[0];
    if (result) return result;
  }
  return null;
}

function macroParameter(node, name) {
  const parameter = descendants(node, 'ac:parameter').find(item => attrs(item)['ac:name'] === name);
  return parameter ? textContent(parameter).trim() : '';
}

function renderTable(node, context) {
  const rows = descendants(node, 'tr').map(row => childNodes(row)
    .filter(cell => cell.name === 'th' || cell.name === 'td')
    .map(cell => renderChildren(cell, context).trim().replace(/\|/g, '\\|')));
  if (!rows.length) return '';
  const width = Math.max(...rows.map(row => row.length));
  const pad = row => row.concat(Array(width - row.length).fill(''));
  return [`| ${pad(rows[0]).join(' | ')} |`, `| ${Array(width).fill('---').join(' | ')} |`,
    ...rows.slice(1).map(row => `| ${pad(row).join(' | ')} |`), ''].join('\n');
}

function renderLink(node) {
  const page = firstDescendant(node, 'ri:page');
  const attachment = firstDescendant(node, 'ri:attachment');
  const url = firstDescendant(node, 'ri:url');
  const body = firstDescendant(node, 'ac:plain-text-link-body', 'ac:link-body');
  const target = page ? attrs(page)['ri:content-title'] : attachment ? attrs(attachment)['ri:filename'] :
    url ? attrs(url)['ri:value'] : '';
  const label = body ? textContent(body).trim() : target;
  return target ? `[${label}](${target})` : label || '';
}

function renderImage(node) {
  const attachment = firstDescendant(node, 'ri:attachment');
  const url = firstDescendant(node, 'ri:url');
  const target = attachment ? attrs(attachment)['ri:filename'] : url ? attrs(url)['ri:value'] : '';
  return `![${attrs(node)['ac:alt'] || ''}](${target || ''})`;
}

function renderMacro(node, context) {
  const name = attrs(node)['ac:name'] || '';
  const body = firstDescendant(node, 'ac:plain-text-body', 'ac:rich-text-body');
  const rendered = body ? renderChildren(body, context).trim() : '';
  if (name === 'code') {
    const language = macroParameter(node, 'language');
    return `\n\`\`\`${language}\n${body ? textContent(body).replace(/^\n|\n$/g, '') : ''}\n\`\`\`\n\n`;
  }
  if (CALLOUT_MARKERS.includes(name)) {
    return `\n> [!${name.toUpperCase()}]\n${rendered.split('\n').map(line => `> ${line}`).join('\n')}\n\n`;
  }
  if (name === 'expand') {
    const title = macroParameter(node, 'title') || context.labels.expandDetails;
    return `<details><summary>${title}</summary>\n\n${rendered}\n\n</details>\n\n`;
  }
  if (name === 'include' || name === 'excerpt-include') {
    const page = firstDescendant(node, 'ri:page');
    return `{{${name}:${page ? attrs(page)['ri:content-title'] || '' : ''}}}`;
  }
  if (name === 'view-file') {
    const attachment = firstDescendant(node, 'ri:attachment');
    const filename = attachment ? attrs(attachment)['ri:filename'] : '';
    return filename ? `[${filename}](${filename})` : '';
  }
  return rendered || `{{${name}}}`;
}

function renderChildren(node, context) {
  return childNodes(node).map(child => renderStorageNode(child, context)).join('');
}

function renderStorageNode(node, context) {
  if (node.type === 'text') return decodeHTML(node.data || '');
  if (node.type !== 'tag' && node.type !== 'root') return '';
  const name = node.name;
  const content = renderChildren(node, context);
  switch (name) {
    case undefined: case 'html': case 'body': return content;
    case 'p': return `${content.trim()}\n\n`;
    case 'br': return '  \n';
    case 'hr': return '\n---\n\n';
    case 'strong': case 'b': return `**${content}**`;
    case 'em': case 'i': return `*${content}*`;
    case 'del': case 's': return `~~${content}~~`;
    case 'code': return `\`${content.replace(/`/g, '\\`')}\``;
    case 'pre': return `\n\`\`\`\n${textContent(node).replace(/\n?$/, '\n')}\`\`\`\n\n`;
    case 'blockquote': return `${content.trim().split('\n').map(line => `> ${line}`).join('\n')}\n\n`;
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
      return `${'#'.repeat(Number(name[1]))} ${content.trim()}\n\n`;
    case 'ul': case 'ol': {
      const items = childNodes(node).filter(child => child.name === 'li');
      return `${items.map((item, index) => {
        const marker = name === 'ol' ? `${index + 1}.` : '-';
        return `${marker} ${renderChildren(item, context).trim().replace(/\n/g, '\n  ')}`;
      }).join('\n')}\n\n`;
    }
    case 'li': return content;
    case 'table': return renderTable(node, context);
    case 'a': {
      const target = attrs(node).href || '';
      return target ? `[${content.trim() || target}](${target})` : content;
    }
    case 'img': return `![${attrs(node).alt || ''}](${attrs(node).src || ''})`;
    case 'ac:link': return renderLink(node);
    case 'ac:image': return renderImage(node);
    case 'ac:structured-macro': return renderMacro(node, context);
    case 'ac:task-list': return `${descendants(node, 'ac:task').map(task => {
      const complete = textContent(firstDescendant(task, 'ac:task-status')).trim() === 'complete';
      const body = firstDescendant(task, 'ac:task-body');
      return `- [${complete ? 'x' : ' '}] ${body ? renderChildren(body, context).trim() : ''}`;
    }).join('\n')}\n\n`;
    case 'ac:task-status': case 'ac:task-id': return '';
    case 'u': case 'sub': case 'sup': case 'mark': return `<${name}>${content}</${name}>`;
    default: return content;
  }
}

function renderHtmlNode(node) {
  if (node.type === 'text') return node.data || '';
  if (node.type !== 'tag') return '';
  const name = node.name;
  const properties = attrs(node);
  const content = childNodes(node).map(renderHtmlNode).join('');
  if (name === 'pre') {
    const code = childNodes(node).find(child => child.name === 'code');
    const language = /(?:^|\s)language-([^\s]+)/.exec(code ? attrs(code).class || '' : '')?.[1] || '';
    const parameter = language ? `<ac:parameter ac:name="language">${escapeXmlAttr(language)}</ac:parameter>` : '';
    const source = textContent(code || node).replace(/]]>/g, ']]]]><![CDATA[>');
    return `<ac:structured-macro ac:name="code">${parameter}<ac:plain-text-body><![CDATA[${source}]]></ac:plain-text-body></ac:structured-macro>`;
  }
  if (name === 'blockquote') {
    const marker = /^\s*\[!(INFO|WARNING|NOTE)\]\s*/i.exec(textContent(node));
    if (marker) {
      const body = content.replace(/^\s*<p>\s*\[![^\]]+\]\s*/i, '<p>');
      return `<ac:structured-macro ac:name="${marker[1].toLowerCase()}"><ac:rich-text-body>${body}</ac:rich-text-body></ac:structured-macro>`;
    }
  }
  if (name === 'input' && properties.type === 'checkbox') return properties.checked != null ? '[x] ' : '[ ] ';
  if (name === 'img') {
    const source = properties.src || '';
    const resource = /^(?:https?:)?\/\//i.test(source) ? `<ri:url ri:value="${escapeXmlAttr(source)}" />` :
      `<ri:attachment ri:filename="${escapeXmlAttr(source)}" />`;
    return `<ac:image${properties.alt ? ` ac:alt="${escapeXmlAttr(properties.alt)}"` : ''}>${resource}</ac:image>`;
  }
  const serialized = Object.entries(properties).map(([key, value]) => ` ${key}="${escapeXmlAttr(value)}"`).join('');
  return name === 'br' || name === 'hr' ? `<${name}${serialized} />` : `<${name}${serialized}>${content}</${name}>`;
}

function htmlToStorage(html) {
  const document = parseDocument(html, { decodeEntities: false });
  return childNodes(document).map(renderHtmlNode).join('');
}

const ENGLISH_LABELS = { includePage: 'Include Page', sharedBlock: 'Shared Block',
  includeSharedBlock: 'Include Shared Block', fromPage: 'from page', expandDetails: 'Expand Details' };
const LOCALIZED_LABELS = [
  [/[\u4e00-\u9fa5]/, ['包含页面', '共享块', '包含共享块', '来自页面', '展开详情']],
  [/[\u3040-\u309f\u30a0-\u30ff]/, ['ページを含む', '共有ブロック', '共有ブロックを含む', 'ページから', '詳細を表示']],
  [/[\uac00-\ud7af]/, ['페이지 포함', '공유 블록', '공유 블록 포함', '페이지에서', '상세 보기']],
  [/[\u0400-\u04ff]/, ['Включить страницу', 'Общий блок', 'Включить общий блок', 'со страницы', 'Подробнее']],
  [/[àâäéèêëïîôùûüÿœæç]/i, ['Inclure la page', 'Bloc partagé', 'Inclure le bloc partagé', 'de la page', 'Détails']],
  [/[äöüß]/i, ['Seite einbinden', 'Gemeinsamer Block', 'Gemeinsamen Block einbinden', 'von Seite', 'Details']],
  [/[áéíóúñ¿¡]/i, ['Incluir página', 'Bloque compartido', 'Incluir bloque compartido', 'de la página', 'Detalles']],
];

class MacroConverter {
  constructor(options = {}) {
    this.webUrlPrefix = options.webUrlPrefix || '';
    this.buildUrl = options.buildUrl;
    this._isCloud = options.isCloud ?? /\.atlassian\.net(?:\/|$)/i.test(this.webUrlPrefix);
    this.linkStyle = resolveLinkStyle(options.linkStyle, this._isCloud);
    this.markdown = new MarkdownIt({ html: true, linkify: true });
    this.setupConfluenceMarkdownExtensions();
  }
  isCloud() { return this._isCloud; }
  setupConfluenceMarkdownExtensions() { this.markdown.enable(['table', 'strikethrough', 'linkify']); }
  markdownToStorage(markdown) { return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(markdown)); }
  markdownToNativeStorage(markdown) { return this.markdownToStorage(markdown); }
  _renderMarkdownToHtml(markdown) {
    const stashed = [];
    const stash = value => `${STASH_DELIM}H${stashed.push(value) - 1}${STASH_DELIM}`;
    const ranges = this._findCodeRanges(markdown);
    let source = '', cursor = 0;
    for (const [start, end] of ranges) {
      source += markdown.slice(cursor, start).replace(PASSTHROUGH_BLOCK_RE, stash).replace(PASSTHROUGH_TAG_RE, stash);
      source += markdown.slice(start, end);
      cursor = end;
    }
    source += markdown.slice(cursor).replace(PASSTHROUGH_BLOCK_RE, stash).replace(PASSTHROUGH_TAG_RE, stash);
    return this.markdown.render(source).replace(new RegExp(`${STASH_DELIM}H(\\d+)${STASH_DELIM}`, 'g'),
      (_, index) => stashed[Number(index)]);
  }
  _findCodeRanges(markdown) {
    const lines = markdown.split('\n'), offsets = [0];
    for (const line of lines) offsets.push(offsets[offsets.length - 1] + line.length + 1);
    const ranges = this.markdown.parse(markdown, {}).filter(token =>
      (token.type === 'code_block' || token.type === 'fence') && token.map
    ).map(token => [offsets[token.map[0]], Math.min(markdown.length, offsets[token.map[1]])]);
    INLINE_CODE_RE.lastIndex = 0;
    let match;
    while ((match = INLINE_CODE_RE.exec(markdown))) ranges.push([match.index, match.index + match[0].length]);
    return ranges.sort((a, b) => a[0] - b[0]).reduce((merged, range) => {
      const previous = merged[merged.length - 1];
      if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]);
      else merged.push(range);
      return merged;
    }, []);
  }
  htmlToConfluenceStorage(html) { return htmlToStorage(html); }
  detectLanguageLabels(value) {
    for (const [pattern, labels] of LOCALIZED_LABELS) {
      if (pattern.test(value)) {
        const [includePage, sharedBlock, includeSharedBlock, fromPage, expandDetails] = labels;
        return { includePage, sharedBlock, includeSharedBlock, fromPage, expandDetails };
      }
    }
    return ENGLISH_LABELS;
  }
  storageToMarkdown(storage, options = {}) {
    const document = parseDocument(storage, { xmlMode: true, decodeEntities: false });
    const markdown = renderStorageNode(document, { labels: this.detectLanguageLabels(storage) })
      .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    if (typeof options.onWarnings === 'function') options.onWarnings([]);
    return markdown;
  }
}

module.exports = MacroConverter;
module.exports.VALID_LINK_STYLES = VALID_LINK_STYLES;
