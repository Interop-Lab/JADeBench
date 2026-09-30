import {
  VisitNodeStep,
  TextSourceCodeBase,
  ConfigCommentParser,
  Directive,
} from "@eslint/plugin-kit";
import { fromMarkdown } from "mdast-util-from-markdown";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown } from "mdast-util-math";
import { frontmatter } from "micromark-extension-frontmatter";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";

const lineEndingPattern = /\r\n|[\r\n]/u;
const illegalShorthandTailPattern = /\]\[\s+\]$/u;
const htmlCommentPattern = /<!--[\s\S]*?-->/gu;
const configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const htmlComment = /<!--(.*?)-->/gsu;
const commentParser = new ConfigCommentParser();
const jsonFrontmatterConfig = { type: "json", marker: "-" };

function stripHtmlComments(value) {
  return value.replace(htmlCommentPattern, "");
}

function frontmatterHasTitle(value, type) {
  const text = stripHtmlComments(value);

  if (type === "json") {
    try {
      const data = JSON.parse(text);
      return data !== null && typeof data === "object" && "title" in data;
    } catch {
      return false;
    }
  }

  if (type === "toml") {
    return /^\s*title\s*=/mu.test(text);
  }

  return /^\s*title\s*:/mu.test(text);
}

class InlineConfigComment {
  value;
  position;

  constructor({ value, position }) {
    this.value = value;
    this.position = position;
  }
}

function extractInlineConfigCommentsFromHTML(value, position) {
  const comments = [];

  for (const match of value.matchAll(htmlComment)) {
    const commentText = match[0];
    if (!configCommentStart.test(commentText)) continue;

    const offset = position.start.offset + match.index;
    comments.push(
      new InlineConfigComment({
        value: match[1].trim(),
        position: {
          start: { ...position.start, offset },
          end: { ...position.end, offset: offset + commentText.length },
        },
      }),
    );
  }

  return comments;
}

function getChildren(node) {
  return Array.isArray(node.children) ? node.children : [];
}

class MarkdownSourceCode extends TextSourceCodeBase {
  #parents = new WeakMap();
  #inlineConfigNodes;

  constructor({ text, ast }) {
    super({ ast, text, lineEndingPattern });
    this.#indexParents(ast);
  }

  #indexParents(node) {
    for (const child of getChildren(node)) {
      this.#parents.set(child, node);
      this.#indexParents(child);
    }
  }

  getParent(node) {
    return this.#parents.get(node);
  }

  getInlineConfigNodes() {
    if (this.#inlineConfigNodes) return this.#inlineConfigNodes;

    const comments = [];
    for (const step of this.traverse()) {
      const node = step.target;
      if (step.phase === 1 && node.type === "html" && node.position) {
        comments.push(...extractInlineConfigCommentsFromHTML(node.value, node.position));
      }
    }
    this.#inlineConfigNodes = comments;
    return comments;
  }

  getDisableDirectives() {
    const directives = [];
    const problems = [];

    for (const node of this.getInlineConfigNodes()) {
      const parsed = commentParser.parseDirective(node.value);
      if (!parsed || !parsed.label.startsWith("eslint-")) continue;

      const type = parsed.label.slice("eslint-".length);
      if (["disable", "enable", "disable-line", "disable-next-line"].includes(type)) {
        directives.push(
          new Directive({
            type,
            node,
            value: parsed.value,
            justification: parsed.justification,
          }),
        );
      }
    }

    return { directives, problems };
  }

  applyInlineConfig() {
    const configs = [];
    const problems = [];

    for (const node of this.getInlineConfigNodes()) {
      const parsed = commentParser.parseDirective(node.value);
      if (!parsed || parsed.label !== "eslint") continue;

      const result = commentParser.parseJSONLikeConfig(
        parsed.value.replace(illegalShorthandTailPattern, "]"),
      );
      if (result.ok) {
        configs.push({ config: { rules: result.config }, loc: node.position.start });
      } else {
        problems.push({ message: result.error.message, loc: node.position.start });
      }
    }

    return { configs, problems };
  }

  *traverse() {
    const visit = function* (node, parent) {
      yield new VisitNodeStep({ target: node, phase: 1, args: [node, parent] });
      for (const child of getChildren(node)) yield* visit(child, node);
      yield new VisitNodeStep({ target: node, phase: 2, args: [node, parent] });
    };

    yield* visit(this.ast, undefined);
  }
}

function normalizeFrontmatter(option) {
  if (!option) return [];
  if (option === true) return ["yaml"];
  const values = Array.isArray(option) ? option : [option];
  return values.map(value => (value === "json" ? jsonFrontmatterConfig : value));
}

function createParserOptions(mode, languageOptions) {
  const extensions = [];
  const mdastExtensions = [];

  if (mode === "gfm") {
    extensions.push(gfm());
    mdastExtensions.push(gfmFromMarkdown());
  }
  if (languageOptions.math) {
    extensions.push(math());
    mdastExtensions.push(mathFromMarkdown());
  }

  const frontmatterTypes = normalizeFrontmatter(languageOptions.frontmatter);
  if (frontmatterTypes.length) {
    extensions.push(frontmatter(frontmatterTypes));
    mdastExtensions.push(frontmatterFromMarkdown(frontmatterTypes));
  }

  return { extensions, mdastExtensions };
}

class MarkdownLanguage {
  fileType = "text";
  lineStart = 1;
  columnStart = 1;
  nodeTypeKey = "type";
  defaultLanguageOptions = { frontmatter: false, math: false };
  #mode = "commonmark";

  constructor({ mode = "commonmark" } = {}) {
    if (mode !== "commonmark" && mode !== "gfm") {
      throw new TypeError(`Unknown Markdown mode: ${mode}`);
    }
    this.#mode = mode;
  }

  validateLanguageOptions(languageOptions) {
    const options = { ...this.defaultLanguageOptions, ...languageOptions };
    if (typeof options.math !== "boolean") {
      throw new TypeError("The math language option must be a boolean.");
    }
    if (
      typeof options.frontmatter !== "boolean" &&
      typeof options.frontmatter !== "string" &&
      !Array.isArray(options.frontmatter)
    ) {
      throw new TypeError("The frontmatter language option is invalid.");
    }
    return options;
  }

  parse(file, { languageOptions = {} } = {}) {
    const text = typeof file === "string" ? file : file.body;
    const options = this.validateLanguageOptions(languageOptions);
    const ast = fromMarkdown(text, createParserOptions(this.#mode, options));

    if (ast.children[0]?.type === "yaml" && frontmatterHasTitle(ast.children[0].value, "yaml")) {
      ast.children.shift();
    }

    return { ok: true, ast };
  }

  createSourceCode(file, parseResult) {
    const text = typeof file === "string" ? file : file.body;
    const ast = parseResult.ast ?? parseResult;
    return new MarkdownSourceCode({ text, ast });
  }
}

export { MarkdownLanguage };
