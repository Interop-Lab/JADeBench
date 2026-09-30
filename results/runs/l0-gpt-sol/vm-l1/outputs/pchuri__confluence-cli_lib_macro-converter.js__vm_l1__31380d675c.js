"use strict";

const MarkdownIt = require("markdown-it");
const { htmlToStorage } = require("../work/pchuri__confluence-cli/lib/html-to-storage.js");
const { StorageWalker } = require("../work/pchuri__confluence-cli/lib/storage-walker.js");
const {
  VALID_LINK_STYLES,
  resolveLinkStyle
} = require("../work/pchuri__confluence-cli/lib/link-style.js");
const markdownCleanup = require("../work/pchuri__confluence-cli/lib/markdown-cleanup.js");

const CALLOUT_MARKERS = ["info", "warning", "note"];
const STASH_DELIM = "\uE000";
const PASSTHROUGH_TAG_RE =
  /<\/?(?:br|u|sub|sup|mark|details|summary)(?=[\s/>])(?:"[^"]*"|'[^']*'|[^>])*>/gi;
const PASSTHROUGH_BLOCK_RE = /<(svg|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi;
const INLINE_CODE_RE = /`[^`\n]+`/g;

function escapeXmlAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function callFirst(target, names, args) {
  if (!target) return undefined;

  for (const name of names) {
    if (typeof target[name] === "function") {
      return target[name](...args);
    }
  }

  return undefined;
}

function cleanMarkdown(markdown) {
  if (typeof markdownCleanup === "function") {
    return markdownCleanup(markdown);
  }

  return (
    callFirst(
      markdownCleanup,
      ["cleanupMarkdown", "cleanup", "markdownCleanup"],
      [markdown]
    ) ?? markdown
  );
}

class MacroConverter {
  constructor(options = {}) {
    this.options = options || {};
    this.linkStyle = resolveLinkStyle(
      this.options.linkStyle || this.options.links || this.options.link_style
    );

    this.markdown = new MarkdownIt({
      html: true,
      linkify: true,
      breaks: false,
      typographer: false,
      ...(this.options.markdownIt || this.options.markdown || {})
    });

    this.setupConfluenceMarkdownExtensions(this.markdown);
  }

  isCloud() {
    const value =
      this.options.cloud ??
      this.options.isCloud ??
      this.options.deploymentType ??
      this.options.deployment;

    if (typeof value === "string") {
      return value.toLowerCase() === "cloud";
    }

    return Boolean(value);
  }

  setupConfluenceMarkdownExtensions(markdown = this.markdown) {
    if (!markdown || !markdown.renderer || !markdown.renderer.rules) {
      return markdown;
    }

    const defaultFence =
      markdown.renderer.rules.fence ||
      ((tokens, index, options, env, renderer) =>
        renderer.renderToken(tokens, index, options));

    markdown.renderer.rules.fence = (tokens, index, options, env, renderer) => {
      const token = tokens[index];
      const language = this.detectLanguageLabels(token.info || "");
      const content = token.content || "";

      if (!language.language) {
        return defaultFence(tokens, index, options, env, renderer);
      }

      let parameters =
        `<ac:parameter ac:name="language">` +
        `${escapeXmlAttr(language.language)}</ac:parameter>`;

      if (language.title) {
        parameters +=
          `<ac:parameter ac:name="title">` +
          `${escapeXmlAttr(language.title)}</ac:parameter>`;
      }

      if (language.collapse) {
        parameters +=
          '<ac:parameter ac:name="collapse">true</ac:parameter>';
      }

      if (language.lineNumbers === false) {
        parameters +=
          '<ac:parameter ac:name="linenumbers">false</ac:parameter>';
      }

      return (
        '<ac:structured-macro ac:name="code">' +
        parameters +
        "<ac:plain-text-body><![CDATA[" +
        content.replace(/]]>/g, "]]]]><![CDATA[>") +
        "]]></ac:plain-text-body>" +
        "</ac:structured-macro>\n"
      );
    };

    return markdown;
  }

  detectLanguageLabels(info = "") {
    const source = String(info).trim();
    const result = {
      language: "",
      title: undefined,
      collapse: false,
      lineNumbers: undefined
    };

    if (!source) return result;

    const parts = source.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    result.language = (parts.shift() || "")
      .replace(/^\{?\.?/, "")
      .replace(/\}?$/, "");

    for (const part of parts) {
      const separator = part.indexOf("=");
      const rawKey = separator < 0 ? part : part.slice(0, separator);
      const rawValue = separator < 0 ? "" : part.slice(separator + 1);
      const key = rawKey.replace(/^[-{.]|[}]$/g, "").toLowerCase();
      const value = rawValue.replace(/^(['"])([\s\S]*)\1$/, "$2");

      if (key === "title" || key === "label" || key === "filename") {
        result.title = value;
      } else if (key === "collapse" || key === "collapsed") {
        result.collapse = value === "" || !/^(?:false|no|0)$/i.test(value);
      } else if (
        key === "linenumbers" ||
        key === "line-numbers" ||
        key === "numberlines"
      ) {
        result.lineNumbers = !/^(?:false|no|0)$/i.test(value);
      } else if (key === "nolinenumbers" || key === "no-line-numbers") {
        result.lineNumbers = false;
      }
    }

    return result;
  }

  _findCodeRanges(markdown) {
    const ranges = [];
    const source = String(markdown);

    const fencedCode = /(^|\n)(`{3,}|~{3,})[^\n]*\n[\s\S]*?(?:\n\2(?=\n|$)|$)/g;
    let match;

    while ((match = fencedCode.exec(source))) {
      const offset = match[1] ? match[1].length : 0;
      ranges.push([match.index + offset, fencedCode.lastIndex]);
    }

    INLINE_CODE_RE.lastIndex = 0;
    while ((match = INLINE_CODE_RE.exec(source))) {
      ranges.push([match.index, INLINE_CODE_RE.lastIndex]);
    }

    ranges.sort((left, right) => left[0] - right[0]);
    return ranges;
  }

  _renderMarkdownToHtml(markdown) {
    const source = String(markdown ?? "");
    const ranges = this._findCodeRanges(source);
    const stashed = [];

    const insideCode = index =>
      ranges.some(([start, end]) => index >= start && index < end);

    const stash = (match, _group, offset) => {
      if (insideCode(offset)) return match;
      const index = stashed.push(match) - 1;
      return `${STASH_DELIM}${index}${STASH_DELIM}`;
    };

    let prepared = source.replace(PASSTHROUGH_BLOCK_RE, stash);
    prepared = prepared.replace(PASSTHROUGH_TAG_RE, stash);

    let html = this.markdown.render(prepared);

    html = html.replace(
      new RegExp(`${STASH_DELIM}(\\d+)${STASH_DELIM}`, "g"),
      (_match, index) => stashed[Number(index)] || ""
    );

    return html;
  }

  htmlToConfluenceStorage(html) {
    return htmlToStorage(String(html ?? ""), {
      ...this.options,
      linkStyle: this.linkStyle
    });
  }

  markdownToNativeStorage(markdown) {
    return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(markdown));
  }

  markdownToStorage(markdown) {
    if (this.options.native || this.options.nativeStorage || this.isCloud()) {
      return this.markdownToNativeStorage(markdown);
    }

    const source = String(markdown ?? "");
    return (
      '<ac:structured-macro ac:name="markdown">' +
      "<ac:plain-text-body><![CDATA[" +
      source.replace(/]]>/g, "]]]]><![CDATA[>") +
      "]]></ac:plain-text-body>" +
      "</ac:structured-macro>"
    );
  }

  storageToMarkdown(storage) {
    const source = String(storage ?? "");

    const direct = callFirst(
      markdownCleanup,
      ["storageToMarkdown", "fromStorage"],
      [source, this.options]
    );
    if (direct !== undefined) return cleanMarkdown(direct);

    if (typeof StorageWalker === "function") {
      const walker = new StorageWalker({
        ...this.options,
        linkStyle: this.linkStyle
      });

      const converted = callFirst(
        walker,
        ["storageToMarkdown", "toMarkdown", "walk", "convert"],
        [source]
      );

      if (converted !== undefined) return cleanMarkdown(converted);
    }

    return cleanMarkdown(source);
  }
}

module.exports = MacroConverter;
module.exports.VALID_LINK_STYLES = VALID_LINK_STYLES;
