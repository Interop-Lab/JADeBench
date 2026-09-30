import {
  ConfigCommentParser,
  Directive,
  TextSourceCodeBase,
  VisitNodeStep,
} from "@eslint/plugin-kit";
import { fromMarkdown } from "mdast-util-from-markdown";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown } from "mdast-util-math";
import { frontmatter } from "micromark-extension-frontmatter";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";

const lineEndingPattern = /\r\n|[\r\n]/u;
const htmlCommentPattern = /<!--[\s\S]*?-->/gu;
const configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const commentParser = new ConfigCommentParser();
const jsonFrontmatterConfig = { type: "json", marker: "-" };

function advancePosition(start, text) {
  let line = start.line;
  let column = start.column;

  for (let index = 0; index < text.length; index++) {
    if (text[index] === "\r") {
      if (text[index + 1] === "\n") index++;
      line++;
      column = 1;
    } else if (text[index] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }

  return { line, column, offset: start.offset + text.length };
}

class InlineConfigComment {
  value;
  position;

  constructor({ value, position }) {
    this.value = value;
    this.position = position;
  }
}

function extractInlineConfigCommentsFromHTML(node) {
  const comments = [];

  for (const match of node.value.matchAll(htmlCommentPattern)) {
    if (!configCommentStart.test(match[0])) continue;

    const start = advancePosition(node.position.start, node.value.slice(0, match.index));
    const end = advancePosition(start, match[0]);
    comments.push(
      new InlineConfigComment({
        value: match[0].slice(4, -3).trim(),
        position: { start, end },
      }),
    );
  }

  return comments;
}

class MarkdownSourceCode extends TextSourceCodeBase {
  #parents = new WeakMap();
  #inlineConfigNodes;

  constructor({ text, ast }) {
    super({ ast, text, lineEndingPattern });
    this.ast = ast;
    this.#indexParents(ast, undefined);
  }

  #indexParents(node, parent) {
    if (parent) this.#parents.set(node, parent);
    if (!Array.isArray(node.children)) return;

    for (const child of node.children) {
      this.#indexParents(child, node);
    }
  }

  getParent(node) {
    return this.#parents.get(node);
  }

  getInlineConfigNodes() {
    if (!this.#inlineConfigNodes) {
      this.#inlineConfigNodes = [];
      for (const step of this.traverse()) {
        if (step.phase === 1 && step.target.type === "html") {
          this.#inlineConfigNodes.push(
            ...extractInlineConfigCommentsFromHTML(step.target),
          );
        }
      }
    }

    return this.#inlineConfigNodes;
  }

  getDisableDirectives() {
    const directives = [];

    for (const node of this.getInlineConfigNodes()) {
      const parsed = commentParser.parseDirective(node.value);
      if (!parsed || !parsed.label.startsWith("eslint-")) continue;

      const type = parsed.label.slice("eslint-".length);
      if (
        type === "disable" ||
        type === "enable" ||
        type === "disable-line" ||
        type === "disable-next-line"
      ) {
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

    return { problems: [], directives };
  }

  applyInlineConfig() {
    const configs = [];
    const problems = [];

    for (const node of this.getInlineConfigNodes()) {
      const directive = commentParser.parseDirective(node.value);
      if (!directive || directive.label !== "eslint") continue;

      const result = commentParser.parseJSONLikeConfig(directive.value);
      if (result.ok) {
        configs.push({
          config: { rules: result.config },
          loc: node.position,
        });
      } else {
        problems.push({
          ruleId: null,
          message: result.error.message,
          loc: node.position,
        });
      }
    }

    return { configs, problems };
  }

  *traverse() {
    function* visit(node, parent) {
      yield new VisitNodeStep({ target: node, phase: 1, args: [node, parent] });
      if (Array.isArray(node.children)) {
        for (const child of node.children) yield* visit(child, node);
      }
      yield new VisitNodeStep({ target: node, phase: 2, args: [node, parent] });
    }

    yield* visit(this.ast, undefined);
  }
}

function createParserOptions(mode, languageOptions = {}) {
  const extensions = [];
  const mdastExtensions = [];

  if (mode === "gfm") {
    extensions.push(gfm());
    mdastExtensions.push(gfmFromMarkdown());
  }

  if (languageOptions.frontmatter) {
    const config =
      languageOptions.frontmatter === "json"
        ? jsonFrontmatterConfig
        : languageOptions.frontmatter;
    extensions.push(frontmatter(config));
    mdastExtensions.push(frontmatterFromMarkdown(config));
  }

  if (languageOptions.math) {
    extensions.push(math());
    mdastExtensions.push(mathFromMarkdown());
  }

  return { extensions, mdastExtensions };
}

class MarkdownLanguage {
  #mode = "commonmark";

  fileType = "text";
  lineStart = 1;
  columnStart = 1;
  nodeTypeKey = "type";
  defaultLanguageOptions = { frontmatter: false, math: false };

  constructor(options = {}) {
    if (options && typeof options === "object" && options.mode !== undefined) {
      this.#mode = options.mode;
    }
  }

  validateLanguageOptions(languageOptions) {
    const frontmatterOption = languageOptions?.frontmatter;
    if (
      frontmatterOption !== undefined &&
      frontmatterOption !== false &&
      frontmatterOption !== "yaml" &&
      frontmatterOption !== "toml" &&
      frontmatterOption !== "json"
    ) {
      throw new Error(
        `Invalid language option value \`${frontmatterOption}\` for frontmatter. Expected one of \`false\`, \`"yaml"\`, \`"toml"\`, or \`"json"\`.`,
      );
    }

    const mathOption = languageOptions?.math;
    if (mathOption !== undefined && typeof mathOption !== "boolean") {
      throw new Error(
        `Invalid language option value \`${mathOption}\` for math. Expected a boolean.`,
      );
    }
  }

  parse(file, context) {
    const text = file.body;
    const parserOptions = createParserOptions(
      this.#mode,
      context?.languageOptions,
    );
    const ast = fromMarkdown(text, parserOptions);
    return { ok: true, ast };
  }

  createSourceCode(file, parseResult) {
    return new MarkdownSourceCode({ text: file.body, ast: parseResult.ast });
  }
}

export { MarkdownLanguage };
