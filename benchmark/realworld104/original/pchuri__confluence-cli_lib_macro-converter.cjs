var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/pchuri__confluence-cli/lib/markdown-cleanup.js
var require_markdown_cleanup = __commonJS({
  "../work/pchuri__confluence-cli/lib/markdown-cleanup.js"(exports2, module2) {
    function fenceLength(decodedBody) {
      let max = 0;
      const runs = decodedBody.match(/`+/g);
      if (runs) {
        for (const r of runs) if (r.length > max) max = r.length;
      }
      return Math.max(3, max + 1);
    }
    function splitOnFences(text) {
      const result = [];
      const re = /^ {0,3}(`{3,})[^\n]*\n[\s\S]*?\n {0,3}\1[\t ]*$/gm;
      let lastIdx = 0;
      let m;
      while ((m = re.exec(text)) !== null) {
        result.push(text.slice(lastIdx, m.index));
        result.push(m[0]);
        lastIdx = m.index + m[0].length;
      }
      result.push(text.slice(lastIdx));
      return result;
    }
    function cleanupOutsideFence(text) {
      let out = text;
      out = out.replace(/[ \t]+$/gm, "");
      out = out.replace(/^[ \t]+(?!([`>]|[*+-] |\d+[.)] ))/gm, "");
      out = out.replace(/^(#{1,6}[^\n]+)\n(?!\n)/gm, "$1\n\n");
      out = out.replace(/\n\s*\n\s*\n+/g, "\n\n");
      out = out.replace(/[ \t]+/g, " ");
      return out;
    }
    function cleanupWithFences(text) {
      const segments = splitOnFences(text);
      return segments.map((seg, i) => i % 2 === 1 ? seg : cleanupOutsideFence(seg)).join("").trim();
    }
    module2.exports = {
      fenceLength,
      splitOnFences,
      cleanupOutsideFence,
      cleanupWithFences
    };
  }
});

// ../work/pchuri__confluence-cli/lib/storage-walker.js
var require_storage_walker = __commonJS({
  "../work/pchuri__confluence-cli/lib/storage-walker.js"(exports2, module2) {
    var { Parser, DomHandler } = require("htmlparser2");
    var { decodeHTML } = require("entities");
    var { fenceLength, cleanupWithFences } = require_markdown_cleanup();
    var DEFAULT_MAX_DEPTH = 256;
    var ENTITY_ASCII_MAP = {
      nbsp: " ",
      ldquo: '"',
      rdquo: '"',
      lsquo: "'",
      rsquo: "'",
      hellip: "..."
    };
    function decodeEntities(text) {
      if (!text) return "";
      return text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, body) => {
        if (body[0] === "#") {
          const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
          if (!Number.isFinite(code)) return match;
          try {
            return String.fromCodePoint(code);
          } catch (_) {
            return match;
          }
        }
        if (Object.prototype.hasOwnProperty.call(ENTITY_ASCII_MAP, body)) {
          return ENTITY_ASCII_MAP[body];
        }
        return decodeHTML(`&${body};`);
      });
    }
    var StorageDepthExceededError = class extends Error {
      constructor(maxDepth) {
        super(`Storage XML nesting exceeds limit of ${maxDepth} levels`);
        this.name = "StorageDepthExceededError";
        this.maxDepth = maxDepth;
      }
    };
    var StorageWalker2 = class {
      constructor({
        attachmentsDir = "attachments",
        labels = {},
        buildUrl = (u) => u,
        webUrlPrefix = "",
        maxDepth = DEFAULT_MAX_DEPTH
      } = {}) {
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
        const openStack = [];
        const origOnOpenTag = handler.onopentag.bind(handler);
        const origOnCloseTag = handler.onclosetag.bind(handler);
        handler.onopentag = (...args) => {
          openStack.push({ sIdx: parser.startIndex, eIdx: parser.endIndex });
          origOnOpenTag(...args);
        };
        handler.onclosetag = (...args) => {
          const [name, isImplied] = args;
          const opened = openStack.pop();
          if (isImplied) {
            const selfClosing = opened && opened.sIdx === parser.startIndex && opened.eIdx === parser.endIndex;
            if (!selfClosing) {
              const offset = parser.endIndex;
              this.warnings.push({ type: "implicit-close", tag: name, offset });
              if (process.env.CONFLUENCE_CLI_VERBOSE) {
                process.stderr.write(
                  `StorageWalker: auto-closed <${name}> at offset ${offset}
`
                );
              }
            }
          }
          origOnCloseTag(...args);
        };
        const parser = new Parser(handler, {
          xmlMode: true,
          recognizeSelfClosing: true,
          decodeEntities: true
        });
        parser.write(storage);
        parser.end();
        return this.cleanup(this.walkNodes(handler.dom));
      }
      walkNodes(nodes) {
        if (!nodes) return "";
        return nodes.map((n) => this.walkNode(n)).join("");
      }
      walkNode(node) {
        if (!node) return "";
        switch (node.type) {
          case "text":
            return this.renderText(node.data || "");
          case "cdata":
            return this.walkNodes(node.children);
          case "comment":
          case "directive":
            return "";
          case "tag":
          case "script":
          case "style":
            return this.walkElement(node);
          default:
            return "";
        }
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
        const tag = node.name;
        switch (tag) {
          case "p":
            return "\n" + this.walkNodes(node.children).trim() + "\n";
          case "h1":
          case "h2":
          case "h3":
          case "h4":
          case "h5":
          case "h6": {
            const level = parseInt(tag.charAt(1), 10);
            return "\n" + "#".repeat(level) + " " + this.walkNodes(node.children).trim() + "\n";
          }
          case "strong":
          case "b":
            return "**" + this.walkNodes(node.children) + "**";
          case "em":
          case "i":
            return "*" + this.walkNodes(node.children) + "*";
          case "s":
          case "del":
            return "~~" + this.walkNodes(node.children) + "~~";
          case "code": {
            this._markdownCodeSpanDepth++;
            try {
              return this.renderCodeSpan(this.walkNodes(node.children));
            } finally {
              this._markdownCodeSpanDepth--;
            }
          }
          case "br":
            return "\n";
          case "hr":
            return "\n---\n";
          case "a": {
            const href = decodeEntities(node.attribs && node.attribs.href || "");
            if (!href) return this.walkNodes(node.children);
            this._markdownLinkLabelDepth++;
            let inner;
            try {
              inner = this.walkNodes(node.children);
            } finally {
              this._markdownLinkLabelDepth--;
            }
            return `[${inner}](${href})`;
          }
          case "time":
            return this.renderText(node.attribs && node.attribs.datetime || "") || this.walkNodes(node.children);
          case "ul":
            return this.handleList(node, false);
          case "ol":
            return this.handleList(node, true);
          case "li":
            return this.walkNodes(node.children);
          case "table":
            return this.handleTable(node);
          case "thead":
          case "tbody":
          case "tfoot":
          case "tr":
          case "th":
          case "td":
            return this.walkNodes(node.children);
          case "blockquote":
            return this.handleBlockquote(node);
          case "details":
          case "summary":
          case "u":
          case "sub":
          case "sup":
          case "mark":
            return `<${tag}>` + this.walkNodes(node.children) + `</${tag}>`;
          case "ac:structured-macro":
            return this.handleMacro(node);
          case "ac:image":
            return this.handleImage(node);
          case "ac:link":
            return this.handleAcLink(node);
          case "ac:task-list":
            return this.handleTaskList(node);
          case "ac:layout":
          case "ac:layout-section":
          case "ac:layout-cell":
          case "ac:rich-text-body":
          case "ac:link-body":
            return this.walkNodes(node.children);
          case "ri:url":
          case "ri:page":
          case "ri:attachment":
          case "ac:plain-text-body":
          case "ac:plain-text-link-body":
          case "ac:parameter":
            return "";
          default:
            return this.walkNodes(node.children);
        }
      }
      handleList(node, ordered) {
        const items = (node.children || []).filter((c) => c.type === "tag" && c.name === "li");
        let counter = 1;
        let out = "";
        for (const item of items) {
          const text = this.walkNodes(item.children).replace(/\s+/g, " ").trim();
          if (!text) continue;
          const marker = ordered ? `${counter++}.` : "-";
          out += `${marker} ${text}
`;
        }
        return out ? "\n" + out : "";
      }
      handleTable(node) {
        const rows = [];
        const trs = this.findAllDescendants(node, "tr");
        let isHeader = true;
        for (const tr of trs) {
          const cells = (tr.children || []).filter((c) => c.type === "tag" && (c.name === "th" || c.name === "td"));
          if (cells.length === 0) continue;
          const cellTexts = cells.map(
            (cell) => this.walkNodes(cell.children).replace(/\s+/g, " ").trim() || " "
          );
          rows.push("| " + cellTexts.join(" | ") + " |");
          if (isHeader) {
            rows.push("| " + cellTexts.map(() => "---").join(" | ") + " |");
            isHeader = false;
          }
        }
        return rows.length > 0 ? "\n" + rows.join("\n") + "\n" : "";
      }
      handleBlockquote(node) {
        const inner = this.walkNodes(node.children).trim();
        if (!inner) return "";
        const quoted = inner.split("\n").map((line) => line.length === 0 ? ">" : `> ${line}`).join("\n");
        return "\n" + quoted + "\n";
      }
      handleMacro(node) {
        const name = node.attribs && node.attribs["ac:name"];
        switch (name) {
          case "toc":
          case "floatmenu":
            return "";
          case "expand":
            return this.handleExpand(node);
          case "code":
            return this.handleCode(node);
          case "info":
          case "warning":
          case "note":
            return this.handleCallout(node, name);
          case "anchor":
            return this.handleAnchor(node);
          case "panel":
            return this.handlePanel(node);
          case "mermaid-macro":
            return this.handleMermaid(node);
          case "plantuml":
            return this.handlePlantuml(node);
          case "include":
            return this.handleInclude(node);
          case "shared-block":
          case "include-shared-block":
            return this.handleSharedBlock(node, name);
          case "view-file":
            return this.handleViewFile(node);
          default:
            return "";
        }
      }
      handleExpand(node) {
        const titleParam = this.findParamByName(node, "title");
        const title = (titleParam ? this.getTextContent(titleParam) : "").trim();
        const body = this.getMacroBody(node);
        if (title) {
          return `
**EXPAND: ${title}**

${this.walkNodes(body).trim()}

**EXPAND_END**
`;
        }
        return `
<details>
<summary>${this.labels.expandDetails || "Expand Details"}</summary>

${this.walkNodes(body).trim()}

</details>
`;
      }
      handleCode(node) {
        const langParam = this.findParamByName(node, "language");
        const lang = langParam ? this.getTextContent(langParam) : "";
        const plainBody = this.findChildByName(node, "ac:plain-text-body");
        const code = plainBody ? this.getRawText(plainBody) : "";
        const fence = "`".repeat(fenceLength(code));
        return `
${fence}${lang}
${code}
${fence}
`;
      }
      handleCallout(node, marker) {
        const body = this.getMacroBody(node);
        const inner = this.walkNodes(body).trim();
        const quoted = inner.split("\n").map((line) => line.length === 0 ? ">" : `> ${line}`).join("\n");
        const header = `> **${marker.toUpperCase()}**`;
        const wrapped = inner.length === 0 ? header : `${header}
${quoted}`;
        return `
${wrapped}
`;
      }
      handleAnchor(node) {
        const param = this.findParamByName(node, "");
        const id = (param ? this.getTextContent(param) : "").trim();
        if (!id) return "";
        return `
**ANCHOR: ${id}**
`;
      }
      handlePanel(node) {
        const titleParam = this.findParamByName(node, "title");
        const title = (titleParam ? this.getTextContent(titleParam) : "").trim();
        const body = this.getMacroBody(node);
        const cleanContent = this.walkNodes(body).trim();
        if (!title && !cleanContent) return "";
        const quoted = cleanContent.split("\n").map((line) => line ? `> ${line}` : ">").join("\n");
        if (!title) return `
${quoted}
`;
        if (!cleanContent) return `
> **${title}**
`;
        return `
> **${title}**
>
${quoted}
`;
      }
      handleMermaid(node) {
        const plainBody = this.findChildByName(node, "ac:plain-text-body");
        const code = plainBody ? this.getRawText(plainBody).trim() : "";
        const fence = "`".repeat(fenceLength(code));
        return `
${fence}mermaid
${code}
${fence}
`;
      }
      handlePlantuml(node) {
        const plainBody = this.findChildByName(node, "ac:plain-text-body");
        const code = plainBody ? this.getRawText(plainBody).trim() : "";
        const fence = "`".repeat(fenceLength(code));
        return `
${fence}plantuml
${code}
${fence}
`;
      }
      handleInclude(node) {
        const param = this.findParamByName(node, "");
        if (!param) return "";
        const acLink = this.findChildByName(param, "ac:link");
        if (!acLink) return "";
        const riPage = this.findChildByName(acLink, "ri:page");
        if (!riPage) return "";
        const spaceKey = decodeEntities(riPage.attribs["ri:space-key"] || "");
        const title = decodeEntities(riPage.attribs["ri:content-title"] || "");
        const escapedTitle = this.escapeMarkdownText(title);
        const label = this.labels.includePage || "Include Page";
        if (spaceKey.startsWith("~")) {
          const spacePath = `display/${spaceKey}/${encodeURIComponent(title)}`;
          return `
> \u{1F4C4} **${label}**: [${escapedTitle}](${this.buildUrl(`${this.webUrlPrefix}/${spacePath}`)})
`;
        }
        return `
> \u{1F4C4} **${label}**: [${escapedTitle}](${this.buildUrl(`${this.webUrlPrefix}/spaces/${spaceKey}/pages/[PAGE_ID_HERE]`)}) _(manual link correction required)_
`;
      }
      handleSharedBlock(node, type) {
        const blockKeyParam = this.findParamByName(node, "shared-block-key");
        const blockKey = (blockKeyParam ? this.getTextContent(blockKeyParam) : "").trim();
        const pageParam = this.findParamByName(node, "page");
        if (pageParam && type === "include-shared-block") {
          const acLink = this.findChildByName(pageParam, "ac:link");
          if (acLink) {
            const riPage = this.findChildByName(acLink, "ri:page");
            if (riPage) {
              const pageTitle = this.escapeMarkdownText(decodeEntities(riPage.attribs["ri:content-title"] || ""));
              const includeLabel = this.labels.includeSharedBlock || "Include Shared Block";
              const fromPageLabel = this.labels.fromPage || "from page";
              const keyPart = blockKey ? `: ${blockKey} ` : " ";
              return `
> \u{1F4C4} **${includeLabel}**${keyPart}(${fromPageLabel}: ${pageTitle} [link needs manual correction])
`;
            }
          }
        }
        const body = this.getMacroBody(node);
        const cleanContent = this.walkNodes(body).trim();
        const sharedLabel = this.labels.sharedBlock || "Shared Block";
        if (!blockKey && !cleanContent) return "";
        const header = blockKey ? `**${sharedLabel}: ${blockKey}**` : `**${sharedLabel}**`;
        if (!cleanContent) return `
> ${header}
`;
        const quoted = cleanContent.split("\n").map((line) => line ? `> ${line}` : ">").join("\n");
        return `
> ${header}
>
${quoted}
`;
      }
      handleViewFile(node) {
        const nameParam = this.findParamByName(node, "name");
        if (!nameParam) return "";
        const riAttachment = this.findChildByName(nameParam, "ri:attachment");
        if (!riAttachment) return "";
        const filename = decodeEntities(riAttachment.attribs["ri:filename"] || "");
        return `
\u{1F4CE} [${filename}](${this.attachmentsDir}/${filename})
`;
      }
      handleImage(node) {
        const riAttachment = this.findChildByName(node, "ri:attachment");
        if (riAttachment) {
          const filename = this.renderText(riAttachment.attribs["ri:filename"] || "");
          return `![${filename}](${this.attachmentsDir}/${filename})`;
        }
        const riUrl = this.findChildByName(node, "ri:url");
        if (riUrl) {
          const url = this.renderText(riUrl.attribs["ri:value"] || "");
          if (!url) return "";
          return `![](${url})`;
        }
        return "";
      }
      handleAcLink(node) {
        const attribs = node.attribs || {};
        if (attribs["ac:anchor"]) {
          const linkBody2 = this.findChildByName(node, "ac:plain-text-link-body");
          const text = linkBody2 ? this.getRawText(linkBody2) : "";
          if (!text) return "";
          return `[${text}](#${decodeEntities(attribs["ac:anchor"])})`;
        }
        const riUrl = this.findChildByName(node, "ri:url");
        if (riUrl) {
          const url = decodeEntities(riUrl.attribs["ri:value"] || "");
          const linkBody2 = this.findChildByName(node, "ac:plain-text-link-body");
          const text = linkBody2 ? this.getRawText(linkBody2) : "";
          if (!text) return "";
          return `[${text}](${url})`;
        }
        const linkBody = this.findChildByName(node, "ac:link-body");
        if (linkBody) {
          return this.walkNodes(linkBody.children).trim();
        }
        const riPage = this.findChildByName(node, "ri:page");
        if (riPage) {
          const title = this.escapeMarkdownText(decodeEntities(riPage.attribs["ri:content-title"] || ""));
          return `[${title}]`;
        }
        return "";
      }
      handleTaskList(node) {
        const tasks = (node.children || []).filter((c) => c.type === "tag" && c.name === "ac:task");
        const lines = [];
        for (const task of tasks) {
          const status = this.findChildByName(task, "ac:task-status");
          const body = this.findChildByName(task, "ac:task-body");
          const statusText = status ? this.getTextContent(status) : "";
          const bodyText = body ? this.walkNodes(body.children).replace(/\s+/g, " ").trim() : "";
          const checkbox = statusText === "complete" ? "[x]" : "[ ]";
          if (bodyText) lines.push(`- ${checkbox} ${bodyText}`);
        }
        return lines.length > 0 ? "\n" + lines.join("\n") + "\n" : "";
      }
      findParamByName(node, name) {
        if (!node || !node.children) return null;
        for (const child of node.children) {
          if (child.type === "tag" && child.name === "ac:parameter" && child.attribs["ac:name"] === name) {
            return child;
          }
        }
        return null;
      }
      findChildByName(node, name) {
        if (!node || !node.children) return null;
        for (const child of node.children) {
          if (child.type === "tag" && child.name === name) return child;
        }
        return null;
      }
      findAllDescendants(node, name) {
        const result = [];
        const visit = (n) => {
          if (!n) return;
          if (n.type === "tag" && n.name === name) result.push(n);
          if (n.children) n.children.forEach(visit);
        };
        if (node.children) node.children.forEach(visit);
        return result;
      }
      getMacroBody(node) {
        const body = this.findChildByName(node, "ac:rich-text-body");
        return body ? body.children : [];
      }
      getTextContent(node) {
        return decodeEntities(this._collectText(node));
      }
      // Escape markdown structural characters in text that will be interpolated
      // into link syntax (`[text](url)`). Confluence page titles can legitimately
      // contain `()` / `[]`, and a maliciously-crafted title could otherwise inject
      // a sibling link or break downstream parsers. Backslash is escaped so that
      // an existing `\` in a title isn't reinterpreted as a markdown escape.
      escapeMarkdownText(s) {
        if (!s) return "";
        return s.replace(/([\\`*_[\]()~|<>])/g, "\\$1");
      }
      renderText(text) {
        const decodedText = decodeEntities(text);
        return this._markdownLinkLabelDepth > 0 && this._markdownCodeSpanDepth === 0 ? this.escapeMarkdownText(decodedText) : decodedText;
      }
      renderCodeSpan(content) {
        const backtickRuns = content.match(/`+/g) || [];
        const longestRun = backtickRuns.reduce((max, run) => Math.max(max, run.length), 0);
        const delimiter = "`".repeat(longestRun + 1);
        const padding = content.startsWith("`") || content.endsWith("`") ? " " : "";
        return `${delimiter}${padding}${content}${padding}${delimiter}`;
      }
      _collectText(node) {
        if (!node) return "";
        if (node.type === "text") return node.data || "";
        if (node.children) return node.children.map((c) => this._collectText(c)).join("");
        return "";
      }
      getRawText(node) {
        return decodeEntities(this._collectRawText(node));
      }
      _collectRawText(node) {
        if (!node || !node.children) return "";
        let out = "";
        for (const child of node.children) {
          if (child.type === "text") out += child.data || "";
          else if (child.type === "cdata") out += this._collectRawText(child);
        }
        return out;
      }
      cleanup(text) {
        return cleanupWithFences(text);
      }
    };
    module2.exports = { StorageWalker: StorageWalker2, StorageDepthExceededError, DEFAULT_MAX_DEPTH };
  }
});

// ../work/pchuri__confluence-cli/lib/link-style.js
var require_link_style = __commonJS({
  "../work/pchuri__confluence-cli/lib/link-style.js"(exports2, module2) {
    var VALID_LINK_STYLES2 = ["smart", "plain", "wiki"];
    function resolveLinkStyle2({ isCloud = false, linkStyle = null } = {}) {
      if (VALID_LINK_STYLES2.includes(linkStyle)) {
        return linkStyle;
      }
      return isCloud ? "smart" : "plain";
    }
    module2.exports = { VALID_LINK_STYLES: VALID_LINK_STYLES2, resolveLinkStyle: resolveLinkStyle2 };
  }
});

// ../work/pchuri__confluence-cli/lib/html-to-storage.js
var require_html_to_storage = __commonJS({
  "../work/pchuri__confluence-cli/lib/html-to-storage.js"(exports2, module2) {
    var { parseDocument } = require("htmlparser2");
    var { resolveLinkStyle: resolveLinkStyle2 } = require_link_style();
    var DEFAULT_MAX_DEPTH = 256;
    var HtmlDepthExceededError = class extends Error {
      constructor(maxDepth) {
        super(`HTML nesting exceeds limit of ${maxDepth} levels`);
        this.name = "HtmlDepthExceededError";
        this.maxDepth = maxDepth;
      }
    };
    var VOID_TAGS = /* @__PURE__ */ new Set(["hr"]);
    var CALLOUT_MARKERS2 = ["info", "warning", "note"];
    var HTML_MACRO_TAGS = /* @__PURE__ */ new Set(["svg", "div"]);
    var INLINE_TAGS = /* @__PURE__ */ new Set([
      "a",
      "strong",
      "em",
      "code",
      "br",
      "img",
      "span",
      "mark",
      "sub",
      "sup",
      "ins",
      "del",
      "b",
      "i",
      "u",
      "small",
      "s",
      "abbr",
      "kbd",
      "q",
      "var",
      "cite",
      "time",
      "dfn",
      "samp"
    ]);
    function shouldWrapInP(node) {
      if (!node.children) return true;
      for (const child of node.children) {
        if (child.type === "text" && child.data.includes("\n")) return false;
        if (child.type === "tag" && !INLINE_TAGS.has(child.name)) return false;
      }
      return true;
    }
    function isWhitespaceOnly(node) {
      return node.type === "text" && /^\s*$/.test(node.data);
    }
    function meaningfulChildren(node) {
      return (node.children || []).filter((c) => !isWhitespaceOnly(c));
    }
    function detectMacroMarkerText(text, { allowPlain = false } = {}) {
      const marker = (text || "").trim();
      if (marker === "[[_TOC_]]" || marker === "_TOC_" || allowPlain && marker === "TOC") {
        return { kind: "toc" };
      }
      if (marker === "[[_LISTING_]]" || marker === "_LISTING_" || allowPlain && marker === "LISTING") {
        return { kind: "children" };
      }
      return null;
    }
    function detectParagraphMarker(node) {
      if (node.name !== "p") return null;
      const kids = meaningfulChildren(node);
      if (kids.length !== 1) return null;
      if (kids[0].type === "text") {
        return detectMacroMarkerText(kids[0].data);
      }
      const strong = kids[0];
      if (strong.type !== "tag" || strong.name !== "strong") return null;
      const strongKids = meaningfulChildren(strong);
      if (strongKids.length !== 1) return null;
      const text = strongKids[0];
      if (text.type !== "text") return null;
      const macro = detectMacroMarkerText(text.data, { allowPlain: true });
      if (macro) return macro;
      const anchor = text.data.match(/^ANCHOR: (.+)$/);
      if (anchor) return { kind: "anchor", id: anchor[1] };
      return null;
    }
    function isExpandOpen(node) {
      if (node.type !== "tag" || node.name !== "p") return false;
      const kids = meaningfulChildren(node);
      if (kids.length !== 1) return false;
      const strong = kids[0];
      if (strong.type !== "tag" || strong.name !== "strong") return false;
      if (!strong.children || strong.children.length === 0) return false;
      const first = strong.children[0];
      return first.type === "text" && first.data.startsWith("EXPAND: ");
    }
    function isExpandClose(node) {
      if (node.type !== "tag" || node.name !== "p") return false;
      const kids = meaningfulChildren(node);
      if (kids.length !== 1) return false;
      const strong = kids[0];
      if (strong.type !== "tag" || strong.name !== "strong") return false;
      const strongKids = meaningfulChildren(strong);
      if (strongKids.length !== 1) return false;
      const text = strongKids[0];
      return text.type === "text" && text.data === "EXPAND_END";
    }
    function decodeEntities(text, { preserveDouble = false } = {}) {
      if (preserveDouble) {
        return text.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
      }
      return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    }
    function convertLink(node, ctx) {
      const attribs = node.attribs || {};
      const href = attribs.href || "";
      const inner = walkChildren(node, ctx);
      if (href.startsWith("#")) {
        const anchor = href.slice(1);
        const text = decodeEntities(inner);
        return `<ac:link ac:anchor="${anchor}"><ac:plain-text-link-body><![CDATA[${text}]]></ac:plain-text-link-body></ac:link>`;
      }
      switch (ctx.linkStyle) {
        case "smart": {
          const merged = { ...attribs, "data-card-appearance": "inline" };
          return `<a${renderAttrs(merged)}>${inner}</a>`;
        }
        case "wiki":
          return `<ac:link><ri:url ri:value="${href}" /><ac:plain-text-link-body><![CDATA[${inner}]]></ac:plain-text-link-body></ac:link>`;
        case "plain":
        default:
          return `<a${renderAttrs(attribs)}>${inner}</a>`;
      }
    }
    function detectBlockquoteCallout(node) {
      const kids = meaningfulChildren(node);
      if (kids.length === 0) return null;
      const firstP = kids[0];
      if (firstP.type !== "tag" || firstP.name !== "p") return null;
      const pKids = firstP.children || [];
      const firstIdx = pKids.findIndex((c) => !isWhitespaceOnly(c));
      if (firstIdx < 0) return null;
      const strong = pKids[firstIdx];
      if (strong.type !== "tag" || strong.name !== "strong") return null;
      const strongKids = meaningfulChildren(strong);
      if (strongKids.length !== 1 || strongKids[0].type !== "text") return null;
      const marker = CALLOUT_MARKERS2.find((m) => strongKids[0].data === m.toUpperCase());
      if (!marker) return null;
      const tail = pKids.slice(firstIdx + 1);
      const tailHasContent = tail.some((c) => !isWhitespaceOnly(c));
      if (tailHasContent) {
        if (tail[0].type !== "text" || !/^\s*\n/.test(tail[0].data)) return null;
      }
      return { marker, sameLine: tailHasContent, markerP: firstP, tail };
    }
    function convertBlockquote(node, ctx) {
      const detected = detectBlockquoteCallout(node);
      if (!detected) {
        return `<blockquote>${walkChildren(node, ctx)}</blockquote>`;
      }
      const { marker, sameLine, markerP, tail } = detected;
      const blockquoteKids = node.children || [];
      let body;
      if (sameLine) {
        const firstPBody = tail.map((c) => walkNode(c, ctx)).join("").replace(/^\s*\n/, "");
        const rest = blockquoteKids.filter((c) => c !== markerP).map((c) => walkNode(c, ctx)).join("");
        body = `<p>${firstPBody}</p>${rest}`;
      } else {
        body = blockquoteKids.filter((c) => c !== markerP).map((c) => walkNode(c, ctx)).join("").replace(/^\s+/, "");
      }
      return `<ac:structured-macro ac:name="${marker}">
          <ac:rich-text-body>${body}</ac:rich-text-body>
        </ac:structured-macro>`;
    }
    function convertDetails(node, ctx) {
      const children = node.children || [];
      let summaryNode = null;
      let bodyNodes = [];
      for (const child of children) {
        if (child.type === "tag" && child.name === "summary") {
          summaryNode = child;
        } else if (!isWhitespaceOnly(child)) {
          bodyNodes.push(child);
        }
      }
      if (!summaryNode) {
        return `<details${renderAttrs(node.attribs)}>${walkChildren(node, ctx)}</details>`;
      }
      const titleHtml = walkChildren(summaryNode, ctx);
      const cleanTitle = titleHtml.replace(/<[^>]+>/g, "").trim();
      const bodyHtml = bodyNodes.map((c) => walkNode(c, ctx)).join("").trim();
      return `<ac:structured-macro ac:name="expand"><ac:parameter ac:name="title">${cleanTitle}</ac:parameter><ac:rich-text-body>${bodyHtml}</ac:rich-text-body></ac:structured-macro>`;
    }
    function convertCodeBlock(node, ctx) {
      const children = node.children || [];
      const isCodeBlock = children.length === 1 && children[0].type === "tag" && children[0].name === "code";
      if (!isCodeBlock) {
        return `<pre>${walkChildren(node, ctx)}</pre>`;
      }
      const codeNode = children[0];
      const classAttr = codeNode.attribs.class || "";
      const langMatch = classAttr.match(/language-(\w+)/);
      const language = langMatch ? langMatch[1] : "text";
      let body = "";
      for (const c of codeNode.children || []) {
        if (c.type === "text") body += c.data;
      }
      body = decodeEntities(body.replace(/\n$/, ""), { preserveDouble: true }).replace(/]]>/g, "]]]]><![CDATA[>");
      switch (language) {
        case "plantuml":
          return `<ac:structured-macro ac:name="plantuml"><ac:plain-text-body><![CDATA[${body}]]></ac:plain-text-body></ac:structured-macro>`;
        default:
          return `<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">${language}</ac:parameter><ac:plain-text-body><![CDATA[${body}]]></ac:plain-text-body></ac:structured-macro>`;
      }
    }
    function convertHtmlBlock(node, ctx) {
      const { randomUUID } = require("crypto");
      const inner = walkChildren(node, ctx);
      const attrsStr = renderAttrs(node.attribs);
      const openTag = `<${node.name}${attrsStr}>`;
      const closeTag = `</${node.name}>`;
      const htmlContent = openTag + inner + closeTag;
      const safeContent = htmlContent.replace(/]]>/g, "]]]]><![CDATA[>");
      const macroId = randomUUID();
      return `<ac:structured-macro ac:name="html" ac:schema-version="1" ac:macro-id="${macroId}"><ac:plain-text-body><![CDATA[${safeContent}]]></ac:plain-text-body></ac:structured-macro>`;
    }
    function escapeAttrValue(v) {
      return String(v).replace(/"/g, "&quot;");
    }
    function renderAttrs(attribs) {
      if (!attribs) return "";
      return Object.keys(attribs).map((k) => ` ${k}="${escapeAttrValue(attribs[k])}"`).join("");
    }
    function walkChildren(node, ctx) {
      if (!node.children) return "";
      const children = node.children;
      const out = [];
      let i = 0;
      while (i < children.length) {
        const child = children[i];
        if (isExpandOpen(child)) {
          const endIdx = children.findIndex((c, j) => j > i && isExpandClose(c));
          if (endIdx !== -1) {
            const titleStrong = child.children[0];
            const titleHtml = walkChildren(titleStrong, ctx).replace(/^EXPAND: /, "");
            const cleanTitle = titleHtml.replace(/<[^>]+>/g, "").trim();
            const bodyHtml = children.slice(i + 1, endIdx).map((c) => walkNode(c, ctx)).join("").trim();
            out.push(`<ac:structured-macro ac:name="expand"><ac:parameter ac:name="title">${cleanTitle}</ac:parameter><ac:rich-text-body>${bodyHtml}</ac:rich-text-body></ac:structured-macro>`);
            i = endIdx + 1;
            continue;
          }
        }
        out.push(walkNode(child, ctx));
        i++;
      }
      return out.join("");
    }
    function walkNode(node, ctx) {
      if (node.type === "text") return node.data;
      if (node.type === "comment") {
        const macro = detectMacroMarkerText(node.data);
        if (macro && macro.kind === "toc") return '<ac:structured-macro ac:name="toc" ac:schema-version="1" />';
        if (macro && macro.kind === "children") return '<ac:structured-macro ac:name="children" ac:schema-version="2" />';
        return "";
      }
      if (node.type !== "tag") return "";
      if (++ctx.depth > ctx.maxDepth) {
        ctx.depth--;
        throw new HtmlDepthExceededError(ctx.maxDepth);
      }
      try {
        return dispatchTag(node, ctx);
      } finally {
        ctx.depth--;
      }
    }
    function dispatchTag(node, ctx) {
      switch (node.name) {
        case "p": {
          const marker = detectParagraphMarker(node);
          if (marker && marker.kind === "toc") return '<ac:structured-macro ac:name="toc" ac:schema-version="1" />';
          if (marker && marker.kind === "children") return '<ac:structured-macro ac:name="children" ac:schema-version="2" />';
          if (marker && marker.kind === "anchor") {
            return `<ac:structured-macro ac:name="anchor"><ac:parameter ac:name="">${marker.id}</ac:parameter></ac:structured-macro>`;
          }
          return `<p${renderAttrs(node.attribs)}>${walkChildren(node, ctx)}</p>`;
        }
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
        case "strong":
        case "em":
          return `<${node.name}${renderAttrs(node.attribs)}>${walkChildren(node, ctx)}</${node.name}>`;
        case "hr":
          return "<hr />";
        case "br":
          return "<br />";
        case "img":
          return `<img${renderAttrs(node.attribs)}>`;
        case "ul":
        case "ol":
          return `<${node.name}${renderAttrs(node.attribs)}>${walkChildren(node, ctx)}</${node.name}>`;
        case "li": {
          const inner = walkChildren(node, ctx);
          const open = `<li${renderAttrs(node.attribs)}>`;
          return shouldWrapInP(node) ? `${open}<p>${inner}</p></li>` : `${open}${inner}</li>`;
        }
        case "pre":
          return convertCodeBlock(node, ctx);
        case "code":
          return `<code${renderAttrs(node.attribs)}>${walkChildren(node, ctx)}</code>`;
        case "a":
          return convertLink(node, ctx);
        case "blockquote":
          return convertBlockquote(node, ctx);
        case "details":
          return convertDetails(node, ctx);
        case "table":
        case "thead":
        case "tbody":
        case "tfoot":
        case "tr":
          return `<${node.name}${renderAttrs(node.attribs)}>${walkChildren(node, ctx)}</${node.name}>`;
        case "th":
        case "td": {
          const inner = walkChildren(node, ctx);
          const open = `<${node.name}${renderAttrs(node.attribs)}>`;
          return shouldWrapInP(node) ? `${open}<p>${inner}</p></${node.name}>` : `${open}${inner}</${node.name}>`;
        }
        default:
          if (VOID_TAGS.has(node.name)) {
            return `<${node.name}${renderAttrs(node.attribs)} />`;
          }
          if (HTML_MACRO_TAGS.has(node.name)) {
            return convertHtmlBlock(node, ctx);
          }
          return `<${node.name}${renderAttrs(node.attribs)}>${walkChildren(node, ctx)}</${node.name}>`;
      }
    }
    function htmlToStorage2(html, options = {}) {
      const isCloud = !!options.isCloud;
      const linkStyle = resolveLinkStyle2({ isCloud, linkStyle: options.linkStyle });
      const ctx = {
        linkStyle,
        depth: 0,
        maxDepth: typeof options.maxDepth === "number" ? options.maxDepth : DEFAULT_MAX_DEPTH
      };
      return walkChildren(parseDocument(html, { decodeEntities: false }), ctx);
    }
    module2.exports = { htmlToStorage: htmlToStorage2, HtmlDepthExceededError };
  }
});

// ../work/pchuri__confluence-cli/lib/macro-converter.js
var MarkdownIt = require("markdown-it");
var { StorageWalker } = require_storage_walker();
var { htmlToStorage } = require_html_to_storage();
var { VALID_LINK_STYLES, resolveLinkStyle } = require_link_style();
var CALLOUT_MARKERS = ["info", "warning", "note"];
var STASH_DELIM = "\uE000";
var PASSTHROUGH_TAG_RE = /<\/?(?:br|u|sub|sup|mark|details|summary)(?=[\s/>])(?:"[^"]*"|'[^']*'|[^>])*>/gi;
var PASSTHROUGH_BLOCK_RE = /<(svg|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi;
var INLINE_CODE_RE = /`[^`\n]+`/g;
function escapeXmlAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
var MacroConverter = class {
  constructor({ isCloud = false, webUrlPrefix = "", buildUrl = null, linkStyle = null } = {}) {
    this._isCloud = isCloud;
    this.webUrlPrefix = webUrlPrefix;
    this.buildUrl = buildUrl || ((pathOrUrl) => pathOrUrl);
    this.linkStyle = resolveLinkStyle({ isCloud, linkStyle });
    this.markdown = new MarkdownIt();
    this.setupConfluenceMarkdownExtensions();
  }
  isCloud() {
    return this._isCloud;
  }
  setupConfluenceMarkdownExtensions() {
    this.markdown.enable(["table", "strikethrough", "linkify"]);
    this.markdown.core.ruler.before("normalize", "confluence_macros", (state) => {
      const stash = [];
      state.src = state.src.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`/g, (m) => {
        stash.push(m);
        return `${STASH_DELIM}${stash.length - 1}${STASH_DELIM}`;
      });
      for (const m of CALLOUT_MARKERS) {
        const re = new RegExp(`(^|\\n)\\[!${m}\\]\\s*([\\s\\S]*?)(?=\\n\\s*\\n|\\n\\s*\\[!|$)`, "g");
        state.src = state.src.replace(
          re,
          (_, pre, content) => `${pre}> **${m.toUpperCase()}**
> ${content.trim().replace(/\n/g, "\n> ")}`
        );
      }
      const restoreRe = new RegExp(`${STASH_DELIM}(\\d+)${STASH_DELIM}`, "g");
      state.src = state.src.replace(restoreRe, (m, i) => stash[+i] ?? m);
    });
  }
  markdownToStorage(markdown) {
    return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(markdown));
  }
  markdownToNativeStorage(markdown) {
    return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(markdown));
  }
  // Pre-stashes whitelisted inline HTML so MarkdownIt won't escape it, renders,
  // then restores. Code regions (fenced, indented, and inline) are skipped so a
  // literal `<u>` typed inside a code block survives MarkdownIt's escape and
  // round-trips as text rather than as a real tag — which would otherwise be
  // smuggled past the escape and dropped by `convertCodeBlock`'s text-only
  // child collection in html-to-storage.
  _renderMarkdownToHtml(markdown) {
    const codeRanges = this._findCodeRanges(markdown);
    const htmlStash = [];
    const replaceStandaloneMarker = (text, marker, replacement) => {
      const line = `(^|\\n)([^\\S\\n]*)${marker}[^\\S\\n]*(?=\\n|$)`;
      return text.replace(new RegExp(line, "gi"), (match, prefix, indent) => `${prefix}${indent}${replacement}`);
    };
    const replaceMacroPlaceholders = (text) => {
      let result = replaceStandaloneMarker(text, "<!--\\s*(?:\\[\\[)?_TOC_(?:\\]\\])?\\s*-->", "**TOC**");
      result = replaceStandaloneMarker(result, "<!--\\s*(?:\\[\\[)?_LISTING_(?:\\]\\])?\\s*-->", "**LISTING**");
      result = replaceStandaloneMarker(result, "\\[\\[_TOC_\\]\\]", "**TOC**");
      return replaceStandaloneMarker(result, "\\[\\[_LISTING_\\]\\]", "**LISTING**");
    };
    const stashHtml = (text) => {
      let result = replaceMacroPlaceholders(text).replace(PASSTHROUGH_BLOCK_RE, (m) => {
        htmlStash.push(m);
        return `${STASH_DELIM}H${htmlStash.length - 1}${STASH_DELIM}`;
      });
      result = result.replace(PASSTHROUGH_TAG_RE, (m) => {
        htmlStash.push(m);
        return `${STASH_DELIM}H${htmlStash.length - 1}${STASH_DELIM}`;
      });
      return result;
    };
    let src = "";
    let pos = 0;
    for (const [start, end] of codeRanges) {
      src += stashHtml(markdown.slice(pos, start));
      src += markdown.slice(start, end);
      pos = end;
    }
    src += stashHtml(markdown.slice(pos));
    const html = this.markdown.render(src);
    let contextOffset = 0;
    let isInsideTag = false;
    return html.replace(
      new RegExp(`${STASH_DELIM}H(\\d+)${STASH_DELIM}`, "g"),
      (m, i, offset) => {
        for (; contextOffset < offset; contextOffset++) {
          if (html[contextOffset] === "<") isInsideTag = true;
          else if (html[contextOffset] === ">") isInsideTag = false;
        }
        contextOffset = offset + m.length;
        const raw = htmlStash[+i];
        if (raw == null) return m;
        return isInsideTag ? escapeXmlAttr(raw) : raw;
      }
    );
  }
  // Returns merged, sorted character ranges covering all code regions in the
  // markdown source — fenced and indented blocks via MarkdownIt's tokenizer
  // (which correctly distinguishes them from list-item continuations) and
  // single-backtick inline spans via regex (MarkdownIt parses these into
  // `code_inline` tokens but does not expose source positions for them).
  _findCodeRanges(markdown) {
    const tokens = this.markdown.parse(markdown, {});
    const lineStarts = [0];
    for (let i = 0; i < markdown.length; i++) {
      if (markdown[i] === "\n") lineStarts.push(i + 1);
    }
    const lineToChar = (n) => n < lineStarts.length ? lineStarts[n] : markdown.length;
    const ranges = [];
    for (const tok of tokens) {
      if ((tok.type === "code_block" || tok.type === "fence") && tok.map) {
        ranges.push([lineToChar(tok.map[0]), lineToChar(tok.map[1])]);
      }
    }
    INLINE_CODE_RE.lastIndex = 0;
    let m;
    while ((m = INLINE_CODE_RE.exec(markdown)) !== null) {
      ranges.push([m.index, m.index + m[0].length]);
    }
    ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const merged = [];
    for (const r of ranges) {
      const last = merged[merged.length - 1];
      if (last && r[0] <= last[1]) {
        last[1] = Math.max(last[1], r[1]);
      } else {
        merged.push([r[0], r[1]]);
      }
    }
    return merged;
  }
  htmlToConfluenceStorage(html) {
    return htmlToStorage(html, { isCloud: this._isCloud, linkStyle: this.linkStyle });
  }
  detectLanguageLabels(text) {
    const labels = {
      includePage: "Include Page",
      sharedBlock: "Shared Block",
      includeSharedBlock: "Include Shared Block",
      fromPage: "from page",
      expandDetails: "Expand Details"
    };
    if (/[\u4e00-\u9fa5]/.test(text)) {
      labels.includePage = "\u5305\u542B\u9875\u9762";
      labels.sharedBlock = "\u5171\u4EAB\u5757";
      labels.includeSharedBlock = "\u5305\u542B\u5171\u4EAB\u5757";
      labels.fromPage = "\u6765\u81EA\u9875\u9762";
      labels.expandDetails = "\u5C55\u5F00\u8BE6\u60C5";
    } else if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
      labels.includePage = "\u30DA\u30FC\u30B8\u3092\u542B\u3080";
      labels.sharedBlock = "\u5171\u6709\u30D6\u30ED\u30C3\u30AF";
      labels.includeSharedBlock = "\u5171\u6709\u30D6\u30ED\u30C3\u30AF\u3092\u542B\u3080";
      labels.fromPage = "\u30DA\u30FC\u30B8\u304B\u3089";
      labels.expandDetails = "\u8A73\u7D30\u3092\u8868\u793A";
    } else if (/[\uac00-\ud7af]/.test(text)) {
      labels.includePage = "\uD398\uC774\uC9C0 \uD3EC\uD568";
      labels.sharedBlock = "\uACF5\uC720 \uBE14\uB85D";
      labels.includeSharedBlock = "\uACF5\uC720 \uBE14\uB85D \uD3EC\uD568";
      labels.fromPage = "\uD398\uC774\uC9C0\uC5D0\uC11C";
      labels.expandDetails = "\uC0C1\uC138 \uBCF4\uAE30";
    } else if (/[\u0400-\u04ff]/.test(text)) {
      labels.includePage = "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443";
      labels.sharedBlock = "\u041E\u0431\u0449\u0438\u0439 \u0431\u043B\u043E\u043A";
      labels.includeSharedBlock = "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043E\u0431\u0449\u0438\u0439 \u0431\u043B\u043E\u043A";
      labels.fromPage = "\u0441\u043E \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B";
      labels.expandDetails = "\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435";
    } else if ((text.match(/[àâäéèêëïîôùûüÿœæç]/gi) || []).length >= 2) {
      labels.includePage = "Inclure la page";
      labels.sharedBlock = "Bloc partag\xE9";
      labels.includeSharedBlock = "Inclure le bloc partag\xE9";
      labels.fromPage = "de la page";
      labels.expandDetails = "D\xE9tails";
    } else if ((text.match(/[äöüß]/gi) || []).length >= 2) {
      labels.includePage = "Seite einbinden";
      labels.sharedBlock = "Gemeinsamer Block";
      labels.includeSharedBlock = "Gemeinsamen Block einbinden";
      labels.fromPage = "von Seite";
      labels.expandDetails = "Details";
    } else if ((text.match(/[áéíóúñ¿¡]/gi) || []).length >= 2) {
      labels.includePage = "Incluir p\xE1gina";
      labels.sharedBlock = "Bloque compartido";
      labels.includeSharedBlock = "Incluir bloque compartido";
      labels.fromPage = "de la p\xE1gina";
      labels.expandDetails = "Detalles";
    }
    return labels;
  }
  storageToMarkdown(storage, options = {}) {
    const attachmentsDir = options.attachmentsDir || "attachments";
    const labels = this.detectLanguageLabels(storage);
    const walker = new StorageWalker({
      attachmentsDir,
      labels,
      buildUrl: this.buildUrl,
      webUrlPrefix: this.webUrlPrefix
    });
    const result = walker.walk(storage);
    if (typeof options.onWarnings === "function" && walker.warnings.length > 0) {
      options.onWarnings(walker.warnings);
    }
    return result;
  }
};
module.exports = MacroConverter;
module.exports.VALID_LINK_STYLES = VALID_LINK_STYLES;
