"use strict";

const MarkdownIt = require("markdown-it");
const { parseDocument } = require("htmlparser2");

const VALID_LINK_STYLES = ["smart", "plain", "wiki"];
const CALLOUT_MARKERS = ["info", "warning", "note"];
const STASH_DELIM = "\uE000";
const PASSTHROUGH_TAG_RE = /<\/?(?:br|u|sub|sup|mark|details|summary)(?=[\s/>])(?:"[^"]*"|'[^']*'|[^>])*>/gi;
const PASSTHROUGH_BLOCK_RE = /<(svg|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi;
const INLINE_CODE_RE = /`[^`\n]+`/g;

function escapeXmlAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeXmlText(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function resolveLinkStyle(options = {}) {
  const requested = options && typeof options === "object" ? options.linkStyle : undefined;
  if (VALID_LINK_STYLES.includes(requested)) return requested;
  return options && options.isCloud ? "smart" : "plain";
}

function randomUuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    return (character === "x" ? random : (random & 3) | 8).toString(16);
  });
}

function renderAttributes(attributes = {}) {
  return Object.entries(attributes)
    .map(([name, value]) => ` ${name}="${escapeXmlAttr(value)}"`)
    .join("");
}

function serializeHtml(node) {
  if (!node) return "";
  if (node.type === "text") return node.data || "";
  if (node.type === "comment") return `<!--${node.data || ""}-->`;
  if (node.type === "root") return (node.children || []).map(serializeHtml).join("");
  const children = (node.children || []).map(serializeHtml).join("");
  const name = node.name || "";
  const attributes = renderAttributes(node.attribs);
  return `<${name}${attributes}>${children}</${name}>`;
}

function textContent(node) {
  if (!node) return "";
  if (node.type === "text") return node.data || "";
  return (node.children || []).map(textContent).join("");
}

function findChildren(node, name) {
  return (node.children || []).filter((child) => child.name === name);
}

function firstDescendant(node, predicate) {
  for (const child of node.children || []) {
    if (predicate(child)) return child;
    const nested = firstDescendant(child, predicate);
    if (nested) return nested;
  }
  return null;
}

function normalizeMarkdown(markdown) {
  return String(markdown)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function createMarkdownRenderer() {
  const markdown = new MarkdownIt({ html: false });

  markdown.renderer.rules.fence = (tokens, index) => {
    const token = tokens[index];
    const language = token.info.trim().split(/\s+/, 1)[0];
    const languageParameter = language
      ? `<ac:parameter ac:name="language">${escapeXmlAttr(language)}</ac:parameter>`
      : "";
    return `<ac:structured-macro ac:name="code">${languageParameter}<ac:plain-text-body><![CDATA[${token.content.replace(/\n$/, "")}]]></ac:plain-text-body></ac:structured-macro>\n`;
  };

  markdown.renderer.rules.code_block = (tokens, index) => {
    const content = tokens[index].content.replace(/\n$/, "");
    return `<ac:structured-macro ac:name="code"><ac:plain-text-body><![CDATA[${content}]]></ac:plain-text-body></ac:structured-macro>\n`;
  };

  markdown.renderer.rules.html_inline = (tokens, index) => tokens[index].content;
  markdown.renderer.rules.html_block = (tokens, index) => tokens[index].content;
  return markdown;
}

function stashPassthroughHtml(markdown) {
  const stashed = [];
  const stash = (html) => {
    stashed.push(html);
    return `${STASH_DELIM}${stashed.length - 1}${STASH_DELIM}`;
  };
  let source = markdown.replace(PASSTHROUGH_BLOCK_RE, stash).replace(PASSTHROUGH_TAG_RE, stash);
  return {
    source,
    restore(output) {
      return output.replace(new RegExp(`${STASH_DELIM}(\\d+)${STASH_DELIM}`, "g"), (_, index) => stashed[index]);
    },
  };
}

function convertSpecialHtml(html) {
  return html
    .replace(/<details(?:\s[^>]*)?>\s*<summary(?:\s[^>]*)?>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi, (_, title, body) =>
      `<ac:structured-macro ac:name="expand"><ac:parameter ac:name="title">${title}</ac:parameter><ac:rich-text-body>${body}</ac:rich-text-body></ac:structured-macro>`,
    )
    .replace(/<(svg|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi, (raw) =>
      `<ac:structured-macro ac:name="html" ac:schema-version="1" ac:macro-id="${randomUuid()}"><ac:plain-text-body><![CDATA[${raw}]]></ac:plain-text-body></ac:structured-macro>`,
    );
}

class MacroConverter {
  constructor(options = {}) {
    if (!options || typeof options !== "object" || Array.isArray(options)) options = {};
    this._isCloud = Boolean(options.isCloud);
    this.webUrlPrefix = options.webUrlPrefix || "";
    this.buildUrl = typeof options.buildUrl === "function" ? options.buildUrl : (...parts) => parts.join("");
    this.linkStyle = resolveLinkStyle(options);
    this.markdown = createMarkdownRenderer();
    this.setupConfluenceMarkdownExtensions();
  }

  isCloud() {
    return this._isCloud;
  }

  setupConfluenceMarkdownExtensions() {
    const defaultLinkOpen = this.markdown.renderer.rules.link_open || ((tokens, index, options, environment, renderer) => renderer.renderToken(tokens, index, options));
    this.markdown.renderer.rules.link_open = (tokens, index, options, environment, renderer) => {
      const token = tokens[index];
      const href = token.attrGet("href") || "";
      if (this.linkStyle === "smart" && /^https?:\/\//i.test(href)) token.attrSet("data-card-appearance", "inline");
      if (this.linkStyle === "wiki" && /^https?:\/\//i.test(href)) {
        const label = tokens[index + 1]?.content || "";
        token.meta = { wikiReplacement: `<ac:link><ri:url ri:value="${escapeXmlAttr(href)}" /><ac:plain-text-link-body><![CDATA[${label}]]></ac:plain-text-link-body></ac:link>` };
        return token.meta.wikiReplacement;
      }
      return defaultLinkOpen(tokens, index, options, environment, renderer);
    };
    const defaultLinkClose = this.markdown.renderer.rules.link_close || ((tokens, index, options, environment, renderer) => renderer.renderToken(tokens, index, options));
    this.markdown.renderer.rules.link_close = (tokens, index, options, environment, renderer) => {
      const opening = [...tokens.slice(0, index)].reverse().find((token) => token.type === "link_open");
      return opening?.meta?.wikiReplacement ? "" : defaultLinkClose(tokens, index, options, environment, renderer);
    };
    this.markdown.renderer.rules.text = (tokens, index) => {
      const previous = tokens[index - 1];
      return previous?.type === "link_open" && previous.meta?.wikiReplacement ? "" : escapeXmlText(tokens[index].content);
    };
    return this.markdown;
  }

  markdownToStorage(markdown) {
    return this.markdownToNativeStorage(markdown);
  }

  markdownToNativeStorage(markdown) {
    return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(markdown));
  }

  _renderMarkdownToHtml(markdown) {
    const passthrough = stashPassthroughHtml(String(markdown));
    return passthrough.restore(this.markdown.render(passthrough.source));
  }

  _findCodeRanges(markdown) {
    const source = String(markdown);
    const ranges = [];
    const fencedCode = /(^|\n)(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\2(?=\n|$)/g;
    for (const match of source.matchAll(fencedCode)) {
      const start = match.index + match[1].length;
      ranges.push([start, start + match[0].length - match[1].length]);
    }
    for (const match of source.matchAll(INLINE_CODE_RE)) ranges.push([match.index, match.index + match[0].length]);
    return ranges.sort((left, right) => left[0] - right[0]);
  }

  htmlToConfluenceStorage(html) {
    return convertSpecialHtml(String(html))
      .replace(/<br>/gi, "<br />")
      .replace(/<hr>/gi, "<hr />")
      .replace(/<(th|td)(?=[\s>])([^>]*)>(?!\s*<p>)([\s\S]*?)<\/\1>/gi, "<$1$2><p>$3</p></$1>")
      .replace(/<li>(?!\s*<(?:p|ul|ol)\b)([\s\S]*?)<\/li>/gi, "<li><p>$1</p></li>");
  }

  detectLanguageLabels() {
    return {
      includePage: "Include Page",
      sharedBlock: "Shared Block",
      includeSharedBlock: "Include Shared Block",
      fromPage: "from page",
      expandDetails: "Expand Details",
    };
  }

  storageToMarkdown(storage) {
    const document = parseDocument(String(storage), { xmlMode: true, decodeEntities: true });
    const rendered = (document.children || []).map((node) => renderStorageNode(node, { listDepth: 0 })).join("");
    return normalizeMarkdown(rendered);
  }
}

function renderStorageNode(node, state) {
  if (node.type === "text") return node.data || "";
  if (!node.name) return (node.children || []).map((child) => renderStorageNode(child, state)).join("");

  const children = () => (node.children || []).map((child) => renderStorageNode(child, state)).join("");
  switch (node.name.toLowerCase()) {
    case "h1": case "h2": case "h3": case "h4": case "h5": case "h6":
      return `${"#".repeat(Number(node.name[1]))} ${children()}\n\n`;
    case "p": return `${children()}\n\n`;
    case "strong": case "b": return `**${children()}**`;
    case "em": case "i": return `*${children()}*`;
    case "s": case "strike": case "del": return `~~${children()}~~`;
    case "code": return `\`${children()}\``;
    case "br": return "\n";
    case "hr": return "\n---\n\n";
    case "blockquote": return children().trim().split("\n").map((line) => `> ${line}`).join("\n") + "\n\n";
    case "a": {
      const label = children();
      const href = node.attribs?.href;
      return href ? `[${label}](${href})` : label;
    }
    case "img": {
      const alt = node.attribs?.alt || "";
      const src = node.attribs?.src || "";
      const title = node.attribs?.title ? ` \"${node.attribs.title}\"` : "";
      return `![${alt}](${src}${title})`;
    }
    case "ul": case "ol": return renderStorageList(node, state);
    case "table": return renderStorageTable(node, state);
    case "ac:structured-macro": return renderStorageMacro(node, state);
    default: return children();
  }
}

function renderStorageList(node, state) {
  const ordered = node.name.toLowerCase() === "ol";
  return findChildren(node, "li").map((item, index) => {
    const marker = ordered ? `${index + 1}. ` : "- ";
    const content = (item.children || []).map((child) => renderStorageNode(child, { ...state, listDepth: state.listDepth + 1 })).join("").trim();
    const indent = "  ".repeat(state.listDepth);
    return `${indent}${marker}${content.replace(/\n/g, `\n${indent}  `)}\n`;
  }).join("") + (state.listDepth ? "" : "\n");
}

function renderStorageTable(table, state) {
  const rows = [];
  const visit = (node) => {
    if (node.name === "tr") {
      rows.push((node.children || []).filter((cell) => cell.name === "th" || cell.name === "td")
        .map((cell) => renderStorageNode(cell, state).trim().replace(/\|/g, "\\|")));
    } else for (const child of node.children || []) visit(child);
  };
  visit(table);
  if (!rows.length) return "";
  const width = Math.max(...rows.map((row) => row.length));
  const format = (row) => `| ${Array.from({ length: width }, (_, index) => row[index] || "").join(" | ")} |\n`;
  return format(rows[0]) + format(Array(width).fill("---")) + rows.slice(1).map(format).join("") + "\n";
}

function renderStorageMacro(macro, state) {
  const name = macro.attribs?.["ac:name"] || "";
  const parameters = new Map(findChildren(macro, "ac:parameter").map((parameter) => [parameter.attribs?.["ac:name"], textContent(parameter)]));
  const plainBody = firstDescendant(macro, (node) => node.name === "ac:plain-text-body");
  const richBody = firstDescendant(macro, (node) => node.name === "ac:rich-text-body");
  const body = plainBody ? textContent(plainBody) : richBody ? (richBody.children || []).map((child) => renderStorageNode(child, state)).join("").trim() : "";

  if (name === "code") {
    const language = parameters.get("language") || "";
    return `\n\`\`\`${language}\n${body}\n\`\`\`\n\n`;
  }
  if (CALLOUT_MARKERS.includes(name)) {
    const heading = `**${name.toUpperCase()}**`;
    return `${heading}\n${body}`.split("\n").map((line) => `> ${line}`).join("\n") + "\n\n";
  }
  if (name === "expand") {
    const title = parameters.get("title") || "";
    return `**EXPAND${title ? `: ${title}` : ""}**\n\n${body}\n\n**EXPAND_END**\n\n`;
  }
  return "";
}

module.exports = MacroConverter;
module.exports.VALID_LINK_STYLES = VALID_LINK_STYLES;
