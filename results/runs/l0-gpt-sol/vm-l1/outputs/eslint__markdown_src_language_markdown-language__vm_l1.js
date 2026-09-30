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

function frontmatterHasTitle(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof value.title === "string" &&
      value.title.length > 0,
  );
}

function stripHtmlComments(text) {
  return text.replace(htmlCommentPattern, (comment) =>
    comment.replace(/[^\r\n]/gu, " "),
  );
}

class InlineConfigComment {
  value;
  position;

  constructor({ value, position }) {
    this.value = value;
    this.position = position;
  }
}

const commentParser = new ConfigCommentParser();
const configCommentStart =
  /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const htmlComment = /<!--(.*?)-->/gsu;

function extractInlineConfigCommentsFromHTML(text) {
  const comments = [];

  for (const match of text.matchAll(htmlComment)) {
    const comment = match[0];
    if (!configCommentStart.test(comment)) {
      continue;
    }

    const value = comment
      .replace(/^<!--\s*/u, "")
      .replace(/\s*-->$/u, "");

    comments.push(
      new InlineConfigComment({
        value,
        position: {
          start: match.index,
          end: match.index + comment.length,
        },
      }),
    );
  }

  return comments;
}

class MarkdownSourceCode extends TextSourceCodeBase {
  static parserServices = new WeakMap();

  constructor({ text, ast }) {
    super({
      text,
      ast,
      lineEndingPattern,
    });

    MarkdownSourceCode.parserServices.set(this, {
      parents: new WeakMap(),
      inlineConfigComments: [],
      directives: [],
      htmlComments: [],
    });
  }

  getParent(node) {
    return MarkdownSourceCode.parserServices.get(this).parents.get(node);
  }

  traverse() {
    const sourceCode = this;
    const steps = [];

    function visit(node, parent) {
      if (!node || typeof node !== "object") {
        return;
      }

      if (parent) {
        MarkdownSourceCode.parserServices.get(sourceCode).parents.set(
          node,
          parent,
        );
      }

      steps.push(new VisitNodeStep({ target: node, phase: 1 }));

      for (const key of Object.keys(node)) {
        if (
          key === "position" ||
          key === "data" ||
          key === "children" ||
          key === "type"
        ) {
          continue;
        }

        const value = node[key];
        if (value && typeof value === "object" && value.type) {
          visit(value, node);
        } else if (Array.isArray(value)) {
          for (const child of value) {
            if (child && typeof child === "object" && child.type) {
              visit(child, node);
            }
          }
        }
      }

      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          visit(child, node);
        }
      }

      steps.push(new VisitNodeStep({ target: node, phase: 2 }));
    }

    visit(this.ast, null);
    return steps;
  }

  getLocFromIndex(index) {
    const text = this.text.slice(0, index);
    const lines = text.split(lineEndingPattern);
    return {
      line: lines.length,
      column: lines[lines.length - 1].length,
    };
  }

  getIndexFromLoc(location) {
    const lines = this.text.split(lineEndingPattern);
    let index = 0;

    for (let line = 0; line < location.line - 1; line++) {
      index += lines[line].length;
      index += 1;
    }

    return index + location.column;
  }

  getText(node) {
    if (!node || !node.position) {
      return this.text;
    }

    return this.text.slice(
      this.getIndexFromLoc(node.position.start),
      this.getIndexFromLoc(node.position.end),
    );
  }

  getLines() {
    return this.text.split(lineEndingPattern);
  }
}

const jsonFrontmatterConfig = {
  type: "json",
  marker: "-",
};

function createParserOptions(options = {}) {
  const extensions = [gfm()];
  const mdastExtensions = [gfmFromMarkdown()];

  if (options.frontmatter) {
    extensions.push(frontmatter(jsonFrontmatterConfig));
    mdastExtensions.push(frontmatterFromMarkdown(jsonFrontmatterConfig));
  }

  if (options.math) {
    extensions.push(math());
    mdastExtensions.push(mathFromMarkdown());
  }

  return {
    extensions,
    mdastExtensions,
  };
}

class MarkdownLanguage {
  static parserServices = new WeakMap();

  fileType = "text";
  lineStart = 1;
  columnStart = 1;
  nodeTypeKey = "type";
  defaultLanguageOptions = {
    frontmatter: false,
    math: false,
  };

  validateLanguageOptions(options) {
    if (options == null || typeof options !== "object") {
      throw new TypeError("Language options must be an object.");
    }

    for (const key of ["frontmatter", "math"]) {
      if (key in options && typeof options[key] !== "boolean") {
        throw new TypeError(`Expected "${key}" to be a boolean.`);
      }
    }
  }

  parse(text, options = {}) {
    this.validateLanguageOptions(options);

    const parserOptions = createParserOptions(options);
    const ast = fromMarkdown(text, parserOptions);

    return {
      ast,
      visitorKeys: {},
      services: {
        isMarkdown: true,
      },
    };
  }

  createSourceCode(text, parseResult) {
    const ast = parseResult && parseResult.ast ? parseResult.ast : parseResult;
    const sourceCode = new MarkdownSourceCode({ text, ast });

    const services = MarkdownSourceCode.parserServices.get(sourceCode);
    services.inlineConfigComments =
      extractInlineConfigCommentsFromHTML(text);

    return sourceCode;
  }

  getLocFromIndex(sourceCode, index) {
    return sourceCode.getLocFromIndex(index);
  }

  getIndexFromLoc(sourceCode, location) {
    return sourceCode.getIndexFromLoc(location);
  }
}

export { MarkdownLanguage };
