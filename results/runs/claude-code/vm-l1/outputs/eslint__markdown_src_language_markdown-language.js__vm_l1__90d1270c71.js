import { ConfigCommentParser, Directive, TextSourceCodeBase, VisitNodeStep } from "@eslint/plugin-kit";
import { fromMarkdown } from "mdast-util-from-markdown";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown } from "mdast-util-math";
import { frontmatter } from "micromark-extension-frontmatter";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";

const lineEndingPattern = /\r\n|[\n\r]/u;
const htmlCommentPattern = /^<!--[\s\S]*-->$/u;
const configCommentPattern = /^\s*(?:eslint(?:-(?:disable|enable)(?:-(?:line|next-line))?)?|global|exported)\b/u;
const jsonFrontmatterConfig = { type: "json", marker: "-" };
const yamlFrontmatterConfig = { type: "yaml", marker: "-" };
const tomlFrontmatterConfig = { type: "toml", marker: "+" };

function stripHtmlComments(value) {
  return value.replace(/^<!--|-->$/gu, "").trim();
}

class InlineConfigComment {
  constructor(value, position) {
    this.value = value;
    this.position = position;
  }
}

function extractInlineConfigCommentsFromHTML(node, comments) {
  if (node.type !== "html" || !htmlCommentPattern.test(node.value)) return;
  const value = stripHtmlComments(node.value);
  if (configCommentPattern.test(value)) {
    comments.push(new InlineConfigComment(value, node.position));
  }
}

function normalizeFrontmatter(option) {
  if (!option) return [];
  if (option === true || option === "yaml") return [yamlFrontmatterConfig];
  if (option === "toml") return [tomlFrontmatterConfig];
  if (option === "json") return [jsonFrontmatterConfig];
  if (Array.isArray(option)) return option;
  if (typeof option === "object") return [option];
  throw new TypeError("Invalid frontmatter option");
}

function createParserOptions(languageOptions, mode) {
  const extensions = [];
  const mdastExtensions = [];
  if (mode === "gfm") {
    extensions.push(gfm());
    mdastExtensions.push(gfmFromMarkdown());
  }
  const frontmatterOptions = normalizeFrontmatter(languageOptions.frontmatter);
  if (frontmatterOptions.length) {
    extensions.push(frontmatter(frontmatterOptions));
    mdastExtensions.push(frontmatterFromMarkdown(frontmatterOptions));
  }
  if (languageOptions.math) {
    extensions.push(math());
    mdastExtensions.push(mathFromMarkdown());
  }
  return { extensions, mdastExtensions };
}

class MarkdownSourceCode extends TextSourceCodeBase {
  #parents = new WeakMap();
  #children = new WeakMap();
  #inlineConfigNodes;
  #commentParser = new ConfigCommentParser();

  constructor({ text, ast }) {
    super({ ast, text, lineEndingPattern });
    this.#indexTree(ast);
  }

  #indexTree(node, parent) {
    if (parent) this.#parents.set(node, parent);
    const children = [];
    for (const [key, value] of Object.entries(node)) {
      if (key === "position" || key === "data") continue;
      const values = Array.isArray(value) ? value : [value];
      for (const child of values) {
        if (child && typeof child === "object" && typeof child.type === "string") {
          children.push(child);
          this.#indexTree(child, node);
        }
      }
    }
    this.#children.set(node, children);
  }

  getParent(node) {
    return this.#parents.get(node);
  }

  getLoc(node) {
    return node.position;
  }

  getRange(node) {
    return [node.position.start.offset, node.position.end.offset];
  }

  getInlineConfigNodes() {
    if (this.#inlineConfigNodes) return this.#inlineConfigNodes;
    const comments = [];
    for (const step of this.traverse()) {
      if (step.phase === 1) extractInlineConfigCommentsFromHTML(step.target, comments);
    }
    return (this.#inlineConfigNodes = comments);
  }

  getDisableDirectives() {
    const directives = [];
    for (const node of this.getInlineConfigNodes()) {
      const parsed = this.#commentParser.parseDirective(node.value);
      if (!parsed || !parsed.label.startsWith("eslint-")) continue;
      const type = parsed.label.slice(7);
      if (["disable", "enable", "disable-line", "disable-next-line"].includes(type)) {
        directives.push(new Directive({
          type,
          node,
          value: parsed.value,
          justification: parsed.justification,
        }));
      }
    }
    return { directives, problems: [] };
  }

  applyInlineConfig() {
    const configs = [];
    const problems = [];
    for (const node of this.getInlineConfigNodes()) {
      const parsed = this.#commentParser.parseDirective(node.value);
      if (!parsed || parsed.label !== "eslint") continue;
      const result = this.#commentParser.parseJSONLikeConfig(parsed.value);
      if (result.ok) configs.push({ config: { rules: result.config }, loc: node.position });
      else problems.push({ message: result.error.message, loc: node.position });
    }
    return { configs, problems };
  }

  *traverse() {
    const visit = function* (sourceCode, node, parent) {
      yield new VisitNodeStep({ target: node, phase: 1, args: [node, parent] });
      for (const child of sourceCode.#children.get(node) ?? []) {
        yield* visit(sourceCode, child, node);
      }
      yield new VisitNodeStep({ target: node, phase: 2, args: [node, parent] });
    };
    yield* visit(this, this.ast, undefined);
  }
}

class MarkdownLanguage {
  fileType = "text";
  lineStart = 1;
  columnStart = 1;
  nodeTypeKey = "type";
  defaultLanguageOptions = { frontmatter: false, math: false };
  #mode = "commonmark";

  constructor({ mode = "commonmark" } = {}) {
    if (!new Set(["commonmark", "gfm"]).has(mode)) {
      throw new TypeError(`Unsupported Markdown mode: ${mode}`);
    }
    this.#mode = mode;
  }

  validateLanguageOptions(languageOptions = {}) {
    const options = { ...this.defaultLanguageOptions, ...languageOptions };
    normalizeFrontmatter(options.frontmatter);
    if (typeof options.math !== "boolean") throw new TypeError("math must be a boolean");
    return options;
  }

  parse(file, context = {}) {
    const text = typeof file === "string" ? file : file.body;
    const languageOptions = this.validateLanguageOptions(context.languageOptions);
    try {
      return { ok: true, ast: fromMarkdown(text, createParserOptions(languageOptions, this.#mode)) };
    } catch (error) {
      return { ok: false, errors: [{
        message: error instanceof Error ? error.message : String(error),
        line: error.line,
        column: error.column,
      }] };
    }
  }

  createSourceCode(file, parseResult) {
    const text = typeof file === "string" ? file : file.body;
    return new MarkdownSourceCode({ text, ast: parseResult.ast });
  }
}

export { MarkdownLanguage };
