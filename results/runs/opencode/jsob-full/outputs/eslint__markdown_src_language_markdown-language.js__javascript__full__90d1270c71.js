import { fromMarkdown } from "mdast-util-from-markdown";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown } from "mdast-util-math";
import { frontmatter } from "micromark-extension-frontmatter";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";
import {
  ConfigCommentParser,
  Directive,
  TextSourceCodeBase,
  VisitNodeStep,
} from "@eslint/plugin-kit";

const lineEndingPattern = /\r\n|[\r\n]/u;
const htmlCommentPattern = /<!--([\s\S]*?)-->/gu;
const configCommentStart = /^\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|$)/u;
const commentParser = new ConfigCommentParser();

function createParserOptions(mode, languageOptions = {}) {
  const extensions = [];
  const mdastExtensions = [];

  if (mode === "gfm") {
    extensions.push(gfm());
    mdastExtensions.push(gfmFromMarkdown());
  }

  if (languageOptions.frontmatter) {
    const type = languageOptions.frontmatter;
    const marker = type === "toml" ? "+" : type === "json" ? "{" : "-";
    const fence = type === "json"
      ? { open: "{", close: "}" }
      : marker;
    extensions.push(frontmatter([{ type, marker: fence }]));
    mdastExtensions.push(frontmatterFromMarkdown([type]));
  }

  if (languageOptions.math) {
    extensions.push(math());
    mdastExtensions.push(mathFromMarkdown());
  }

  return { extensions, mdastExtensions };
}

class InlineConfigComment {
  constructor({ value, position }) {
    this.value = value.trim();
    this.position = position;
  }
}

function extractInlineConfigComments(ast) {
  const comments = [];
  const visit = node => {
    if (node.type === "html" && typeof node.value === "string") {
      for (const match of node.value.matchAll(htmlCommentPattern)) {
        if (!configCommentStart.test(match[1])) continue;
        const startOffset = node.position.start.offset + match.index;
        comments.push(new InlineConfigComment({
          value: match[1],
          position: {
            start: { ...node.position.start, offset: startOffset },
            end: { ...node.position.end, offset: startOffset + match[0].length },
          },
        }));
      }
    }
    node.children?.forEach(visit);
  };
  visit(ast);
  return comments;
}

class MarkdownSourceCode extends TextSourceCodeBase {
  #parents = new WeakMap();

  constructor({ text, ast }) {
    super({ text, ast, lineEndingPattern });
    const record = (node, parent) => {
      if (parent) this.#parents.set(node, parent);
      node.children?.forEach(child => record(child, node));
    };
    record(ast);
  }

  getParent(node) {
    return this.#parents.get(node);
  }

  getInlineConfigNodes() {
    return extractInlineConfigComments(this.ast);
  }

  getDisableDirectives() {
    const problems = [];
    const directives = [];

    for (const node of this.getInlineConfigNodes()) {
      const parsed = commentParser.parseDirective(node.value);
      if (!parsed) continue;
      const { label, value, justification } = parsed;
      if (["eslint-disable", "eslint-enable", "eslint-disable-line", "eslint-disable-next-line"].includes(label)) {
        directives.push(new Directive({
          type: label.slice("eslint-".length),
          node,
          value,
          justification,
        }));
      }
    }

    return { problems, directives };
  }

  applyInlineConfig() {
    return { configs: [], problems: [] };
  }

  *traverse() {
    const visit = function* (node, parent) {
      const args = [node, parent];
      yield new VisitNodeStep({ target: node, phase: 1, args });
      for (const child of node.children ?? []) yield* visit(child, node);
      yield new VisitNodeStep({ target: node, phase: 2, args });
    };
    yield* visit(this.ast, undefined);
  }
}

class MarkdownLanguage {
  fileType = "text";
  lineStart = 1;
  columnStart = 1;
  nodeTypeKey = "type";
  defaultLanguageOptions = { frontmatter: false, math: false };
  #mode = "commonmark";

  constructor({ mode } = {}) {
    this.#mode = mode ?? "commonmark";
  }

  validateLanguageOptions(options) {
    const frontmatterOption = options?.frontmatter;
    const allowedFrontmatter = new Set([false, "yaml", "toml", "json"]);
    if (frontmatterOption !== undefined && !allowedFrontmatter.has(frontmatterOption)) {
      throw new Error(
        `Invalid language option value \`${frontmatterOption}\` for frontmatter. Expected one of \`false\`, \`"yaml"\`, \`"toml"\`, or \`"json"\`.`,
      );
    }

    const mathOption = options?.math;
    if (mathOption !== undefined && typeof mathOption !== "boolean") {
      throw new Error(
        `Invalid language option value \`${mathOption}\` for math. Expected a boolean.`,
      );
    }
  }

  parse(file, context) {
    const text = file.body;
    try {
      const parserOptions = createParserOptions(
        this.#mode,
        context?.languageOptions,
      );
      return { ok: true, ast: fromMarkdown(text, parserOptions) };
    } catch (error) {
      return { ok: false, errors: [error] };
    }
  }

  createSourceCode(file, parseResult) {
    return new MarkdownSourceCode({ text: file.body, ast: parseResult.ast });
  }
}

export { MarkdownLanguage };
