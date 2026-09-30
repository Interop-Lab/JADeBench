'use strict';

const MarkdownIt = require('markdown-it');
const { parseDocument } = require('htmlparser2');
const { decode } = require('entities');

const VALID_LINK_STYLES = ['smart', 'plain', 'wiki'];
const CALLOUT_MARKERS = ['info', 'warning', 'note'];
const STASH_DELIM = '\uE000';
const PASSTHROUGH_TAG_RE = /<\/?(?:br|u|sub|sup|mark|details|summary)(?=[\s/>])(?:"[^"]*"|'[^']*'|[^>])*>/gi;
const PASSTHROUGH_BLOCK_RE = /<(svg|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi;
const INLINE_CODE_RE = /`[^`\n]+`/g;

function escapeXmlAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeCdata(value) {
  return value.replace(/]]>/g, ']]]]><![CDATA[>');
}

function resolveLinkStyle(options = {}) {
  const { isCloud = false, linkStyle } = options;
  return VALID_LINK_STYLES.includes(linkStyle) ? linkStyle : isCloud ? 'smart' : 'plain';
}

function codeMacro(code, language) {
  const languageParameter = language
    ? `<ac:parameter ac:name="language">${escapeXmlAttr(language)}</ac:parameter>`
    : '';
  return `<ac:structured-macro ac:name="code">${languageParameter}<ac:plain-text-body><![CDATA[${escapeCdata(code.replace(/\n$/, ''))}]]></ac:plain-text-body></ac:structured-macro>`;
}

function htmlToStorage(html) {
  return html.replace(
    /<pre><code(?:\s+class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/gi,
    (_, language, body) => codeMacro(decode(body), language),
  );
}

function textContent(node) {
  if (!node) return '';
  if (node.type === 'text') return node.data || '';
  return (node.children || []).map(textContent).join('');
}

function attr(node, name) {
  return node?.attribs?.[name] ?? node?.attribs?.[name.toLowerCase()];
}

function childrenNamed(node, name) {
  return (node.children || []).filter(child => child.name?.toLowerCase() === name);
}

function firstNamed(node, name) {
  return childrenNamed(node, name)[0];
}

function normalizeMarkdown(value) {
  return value
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function inlineChildren(node, context) {
  return (node.children || []).map(child => renderStorageNode(child, { ...context, inline: true })).join('');
}

function renderList(node, context, ordered) {
  let index = 1;
  return childrenNamed(node, 'li')
    .map(item => {
      const marker = ordered ? `${index++}. ` : '- ';
      const body = normalizeMarkdown(inlineChildren(item, context));
      return marker + body.replace(/\n/g, '\n  ');
    })
    .join('\n');
}

function renderTable(node, context) {
  const rows = [];
  const visit = current => {
    if (current.name?.toLowerCase() === 'tr') {
      rows.push((current.children || [])
        .filter(cell => ['th', 'td'].includes(cell.name?.toLowerCase()))
        .map(cell => normalizeMarkdown(inlineChildren(cell, context)).replace(/\|/g, '\\|')));
      return;
    }
    for (const child of current.children || []) visit(child);
  };
  visit(node);
  if (!rows.length) return '';
  const width = Math.max(...rows.map(row => row.length));
  for (const row of rows) while (row.length < width) row.push('');
  if (!rows.some((_, rowIndex) => rowIndex === 0)) return '';
  return [rows[0], Array(width).fill('---'), ...rows.slice(1)]
    .map(row => `| ${row.join(' | ')} |`)
    .join('\n');
}

function renderMacro(node, context) {
  const name = attr(node, 'ac:name') || '';
  const parameters = Object.fromEntries(childrenNamed(node, 'ac:parameter').map(parameter => [attr(parameter, 'ac:name'), textContent(parameter)]));
  const richBody = firstNamed(node, 'ac:rich-text-body');
  const plainBody = firstNamed(node, 'ac:plain-text-body');
  const body = normalizeMarkdown(richBody ? inlineChildren(richBody, context) : textContent(plainBody));

  if (name === 'code') {
    const fence = body.includes('```') ? '````' : '```';
    return `${fence}${parameters.language || ''}\n${body}\n${fence}`;
  }
  if (CALLOUT_MARKERS.includes(name)) {
    return `> **${name.toUpperCase()}**${body ? `\n> ${body.replace(/\n/g, '\n> ')}` : ''}`;
  }
  if (name === 'panel') {
    const heading = parameters.title ? `**${parameters.title}**\n>\n> ` : '';
    return `> ${heading}${body.replace(/\n/g, '\n> ')}`;
  }
  if (name === 'expand') {
    return `**EXPAND${parameters.title ? `: ${parameters.title}` : ''}**\n\n${body}\n\n**EXPAND_END**`;
  }
  if (name === 'include' || name === 'excerpt-include') {
    const page = parameters[''] || parameters.page || body;
    return page ? `**${context.labels.includePage}: ${page}**` : '';
  }
  return body;
}

function renderStorageLink(node, context) {
  const page = firstNamed(node, 'ri:page');
  const url = firstNamed(node, 'ri:url');
  const attachment = firstNamed(node, 'ri:attachment');
  const body = firstNamed(node, 'ac:plain-text-link-body') || firstNamed(node, 'ac:link-body');
  const label = normalizeMarkdown(body ? textContent(body) : attr(page, 'ri:content-title') || attr(url, 'ri:value') || '');
  const target = attr(url, 'ri:value') || attr(page, 'ri:content-title') || attr(attachment, 'ri:filename') || '';
  if (!target) return label;
  return label && label !== target ? `[${label}](${target})` : `[${target}]`;
}

function renderStorageNode(node, context) {
  if (node.type === 'text') return decode(node.data || '');
  if (node.type === 'comment') return '';
  const name = node.name?.toLowerCase();
  if (!name) return inlineChildren(node, context);
  const content = () => inlineChildren(node, context);

  if (/^h[1-6]$/.test(name)) return `${'#'.repeat(Number(name[1]))} ${normalizeMarkdown(content())}\n\n`;
  if (name === 'p') return `${normalizeMarkdown(content())}\n\n`;
  if (name === 'br') return '\n';
  if (name === 'hr') return '---\n\n';
  if (name === 'strong' || name === 'b') return `**${content()}**`;
  if (name === 'em' || name === 'i') return `*${content()}*`;
  if (name === 's' || name === 'del' || name === 'strike') return `~~${content()}~~`;
  if (name === 'code') return `\`${content().replace(/`/g, '\\`')}\``;
  if (name === 'pre') return `\`\`\`\n${textContent(node).replace(/\n$/, '')}\n\`\`\`\n\n`;
  if (name === 'a') {
    const label = content();
    const href = attr(node, 'href');
    return href ? `[${label}](${href}${attr(node, 'title') ? ` "${attr(node, 'title')}"` : ''})` : label;
  }
  if (name === 'img') {
    const source = attr(node, 'src');
    return source ? `![${attr(node, 'alt') || ''}](${source}${attr(node, 'title') ? ` "${attr(node, 'title')}"` : ''})` : '';
  }
  if (name === 'ul') return `${renderList(node, context, false)}\n\n`;
  if (name === 'ol') return `${renderList(node, context, true)}\n\n`;
  if (name === 'li') return content();
  if (name === 'blockquote') return `> ${normalizeMarkdown(content()).replace(/\n/g, '\n> ')}\n\n`;
  if (name === 'table') return `${renderTable(node, context)}\n\n`;
  if (name === 'ac:structured-macro' || name === 'ac:macro') return `${renderMacro(node, context)}\n\n`;
  if (name === 'ac:link') return renderStorageLink(node, context);
  if (name === 'ri:user') return attr(node, 'ri:display-name') || attr(node, 'ri:username') || attr(node, 'ri:account-id') || '';
  if (name === 'ac:emoticon') return attr(node, 'ac:name') ? `:${attr(node, 'ac:name')}:` : '';
  if (name === 'details') return `<details>${content()}</details>`;
  if (name === 'summary') return `<summary>${content()}</summary>\n`;
  if (['u', 'sub', 'sup', 'mark'].includes(name)) return `<${name}>${content()}</${name}>`;
  return content();
}

class MacroConverter {
  constructor(options = {}) {
    const {
      isCloud = false,
      webUrlPrefix = '',
      buildUrl = (...parts) => parts.filter(Boolean).join('/'),
      linkStyle,
    } = options;
    this._isCloud = isCloud;
    this.webUrlPrefix = webUrlPrefix;
    this.buildUrl = buildUrl;
    this.linkStyle = resolveLinkStyle({ isCloud, linkStyle });
    this.markdown = new MarkdownIt();
    this.setupConfluenceMarkdownExtensions();
  }

  isCloud() {
    return this._isCloud;
  }

  setupConfluenceMarkdownExtensions() {
    const defaultFence = this.markdown.renderer.rules.fence?.bind(this.markdown.renderer.rules);
    this.markdown.renderer.rules.fence = (tokens, index, options, environment, renderer) => {
      const token = tokens[index];
      if (!token) return defaultFence ? defaultFence(tokens, index, options, environment, renderer) : '';
      return `${codeMacro(token.content, token.info.trim())}\n`;
    };
    this.markdown.renderer.rules.link_open = (tokens, index, options, environment, renderer) => {
      const token = tokens[index];
      const hrefIndex = token.attrIndex('href');
      const href = hrefIndex >= 0 ? token.attrs[hrefIndex][1] : '';
      if (this.linkStyle === 'smart') token.attrSet('data-card-appearance', 'inline');
      if (this.linkStyle !== 'wiki') return renderer.renderToken(tokens, index, options);
      token.meta = { wikiHref: href };
      return `<ac:link><ri:url ri:value="${escapeXmlAttr(href)}" /><ac:plain-text-link-body><![CDATA[`;
    };
    this.markdown.renderer.rules.link_close = (tokens, index, options, environment, renderer) => {
      if (this.linkStyle !== 'wiki') return renderer.renderToken(tokens, index, options);
      return ']]></ac:plain-text-link-body></ac:link>';
    };
    for (const type of ['table_open', 'thead_open', 'tbody_open', 'tr_open']) {
      this.markdown.renderer.rules[type] = (tokens, index, options, environment, renderer) => renderer.renderToken(tokens, index, options);
    }
    this.markdown.renderer.rules.th_open = () => '<th><p>';
    this.markdown.renderer.rules.th_close = () => '</p></th>\n';
    this.markdown.renderer.rules.td_open = () => '<td><p>';
    this.markdown.renderer.rules.td_close = () => '</p></td>\n';
  }

  markdownToStorage(markdown) {
    return this.markdownToNativeStorage(markdown);
  }

  markdownToNativeStorage(markdown) {
    return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(markdown));
  }

  _renderMarkdownToHtml(markdown) {
    const stashed = [];
    const stash = value => `${STASH_DELIM}H${stashed.push(value) - 1}${STASH_DELIM}`;
    const protectHtml = value => value
      .replace(PASSTHROUGH_BLOCK_RE, stash)
      .replace(PASSTHROUGH_TAG_RE, stash);
    const ranges = this._findCodeRanges(markdown);
    let protectedMarkdown = '';
    let offset = 0;

    for (const [start, end] of ranges) {
      protectedMarkdown += protectHtml(markdown.slice(offset, start));
      protectedMarkdown += markdown.slice(start, end);
      offset = end;
    }
    protectedMarkdown += protectHtml(markdown.slice(offset));

    return this.markdown.render(protectedMarkdown).replace(
      new RegExp(`${STASH_DELIM}H(\\d+)${STASH_DELIM}`, 'g'),
      (_, index) => stashed[Number(index)],
    );
  }

  _findCodeRanges(markdown) {
    const lineOffsets = [0];
    for (let index = 0; index < markdown.length; index++) {
      if (markdown[index] === '\n') lineOffsets.push(index + 1);
    }

    const ranges = this.markdown.parse(markdown, {})
      .filter(token => (token.type === 'code_block' || token.type === 'fence') && token.map)
      .map(token => [
        lineOffsets[token.map[0]],
        lineOffsets[token.map[1]] ?? markdown.length,
      ]);

    INLINE_CODE_RE.lastIndex = 0;
    let match;
    while ((match = INLINE_CODE_RE.exec(markdown))) {
      if (!ranges.some(([start, end]) => match.index >= start && match.index < end)) {
        ranges.push([match.index, match.index + match[0].length]);
      }
    }
    return ranges.sort((left, right) => left[0] - right[0]);
  }

  htmlToConfluenceStorage(html) {
    return htmlToStorage(html);
  }

  detectLanguageLabels() {
    return {
      includePage: 'Include Page',
      sharedBlock: 'Shared Block',
      includeSharedBlock: 'Include Shared Block',
      fromPage: 'from page',
      expandDetails: 'Expand Details',
    };
  }

  storageToMarkdown(storage) {
    const document = parseDocument(storage, { xmlMode: true, decodeEntities: false });
    const context = { labels: this.detectLanguageLabels(), inline: false };
    return normalizeMarkdown((document.children || []).map(node => renderStorageNode(node, context)).join(''));
  }
}

module.exports = MacroConverter;
module.exports.VALID_LINK_STYLES = VALID_LINK_STYLES;
