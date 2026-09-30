// ../work/eslint__markdown/src/util.js
var lineEndingPattern = /\r\n|[\r\n]/u;
var illegalShorthandTailPattern = /\]\[\s+\]$/u;
var htmlCommentPattern = /<!--[\s\S]*?-->/gu;
function frontmatterHasTitle(value, pattern) {
  if (!pattern) {
    return false;
  }
  const lines = value.split(lineEndingPattern);
  for (const line of lines) {
    if (pattern.test(line)) {
      return true;
    }
  }
  return false;
}
function stripHtmlComments(value) {
  return value.replace(
    htmlCommentPattern,
    (match) => (
      /* eslint-disable-next-line require-unicode-regexp
         -- we want to replace each code unit with a space
      */
      match.replace(/[^\r\n]/g, " ")
    )
  );
}

// ../work/eslint__markdown/src/language/markdown-source-code.js
import {
  VisitNodeStep,
  TextSourceCodeBase,
  ConfigCommentParser,
  Directive
} from "@eslint/plugin-kit";
var commentParser = new ConfigCommentParser();
var configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
var htmlComment = /<!--(.*?)-->/gsu;
var InlineConfigComment = class {
  /**
   * The comment text.
   * @type {string}
   */
  value;
  /**
   * The position of the comment in the source code.
   * @type {Position}
   */
  position;
  /**
   * Creates a new instance.
   * @param {Object} options The options for the instance.
   * @param {string} options.value The comment text.
   * @param {Position} options.position The position of the comment in the source code.
   */
  constructor({ value, position }) {
    this.value = value.trim();
    this.position = position;
  }
};
function extractInlineConfigCommentsFromHTML(node, sourceCode) {
  if (!configCommentStart.test(node.value)) {
    return [];
  }
  const comments = [];
  let match;
  while (match = htmlComment.exec(node.value)) {
    if (configCommentStart.test(match[0])) {
      const startOffset = match.index + node.position.start.offset;
      const endOffset = startOffset + match[0].length;
      comments.push(
        new InlineConfigComment({
          value: match[1].trim(),
          position: {
            start: {
              ...sourceCode.getLocFromIndex(startOffset),
              offset: startOffset
            },
            end: {
              ...sourceCode.getLocFromIndex(endOffset),
              offset: endOffset
            }
          }
        })
      );
    }
  }
  return comments;
}
var MarkdownSourceCode = class extends TextSourceCodeBase {
  /**
   * Cached traversal steps.
   * @type {Array<VisitNodeStep>|undefined}
   */
  #steps;
  /**
   * Cache of parent nodes.
   * @type {WeakMap<Node, Parent|undefined>}
   */
  #parents = /* @__PURE__ */ new WeakMap();
  /**
   * Collection of HTML nodes. Used to find directive comments.
   * @type {Array<Html>}
   */
  #htmlNodes = [];
  /**
   * Collection of inline configuration comments.
   * @type {Array<InlineConfigComment>}
   */
  #inlineConfigComments;
  /**
   * The AST of the source code.
   * @type {Root}
   */
  ast = void 0;
  /**
   * Creates a new instance.
   * @param {Object} options The options for the instance.
   * @param {string} options.text The source code text.
   * @param {Root} options.ast The root AST node.
   */
  constructor({ text, ast }) {
    super({ ast, text, lineEndingPattern });
    this.ast = ast;
    this.traverse();
  }
  /**
   * Returns the parent of the given node.
   * @param {Node} node The node to get the parent of.
   * @returns {Parent|undefined} The parent of the node.
   */
  getParent(node) {
    return this.#parents.get(node);
  }
  /**
   * Returns an array of all inline configuration nodes found in the
   * source code.
   * @returns {Array<InlineConfigComment>} An array of all inline configuration nodes.
   */
  getInlineConfigNodes() {
    if (!this.#inlineConfigComments) {
      this.#inlineConfigComments = this.#htmlNodes.flatMap(
        (htmlNode) => extractInlineConfigCommentsFromHTML(htmlNode, this)
      );
    }
    return this.#inlineConfigComments;
  }
  /**
   * Returns an all directive nodes that enable or disable rules along with any problems
   * encountered while parsing the directives.
   * @returns {{problems:Array<FileProblem>,directives:Array<Directive>}} Information
   *      that ESLint needs to further process the directives.
   */
  getDisableDirectives() {
    const problems = [];
    const directives = [];
    this.getInlineConfigNodes().forEach((comment) => {
      const {
        label,
        value,
        justification: justificationPart
      } = commentParser.parseDirective(comment.value);
      if (label === "eslint-disable-line" && comment.position.start.line !== comment.position.end.line) {
        const message = `${label} comment should not span multiple lines.`;
        problems.push({
          ruleId: null,
          message,
          loc: comment.position
        });
        return;
      }
      switch (label) {
        case "eslint-disable":
        case "eslint-enable":
        case "eslint-disable-next-line":
        case "eslint-disable-line": {
          const directiveType = label.slice("eslint-".length);
          directives.push(
            new Directive({
              type: (
                /** @type {DirectiveType} */
                directiveType
              ),
              node: comment,
              value,
              justification: justificationPart
            })
          );
        }
      }
    });
    return { problems, directives };
  }
  /**
   * Returns inline rule configurations along with any problems
   * encountered while parsing the configurations.
   * @returns {{problems:Array<FileProblem>,configs:Array<{config:{rules:RulesConfig},loc:Position}>}} Information
   *      that ESLint needs to further process the rule configurations.
   */
  applyInlineConfig() {
    const problems = [];
    const configs = [];
    this.getInlineConfigNodes().forEach((comment) => {
      const { label, value } = commentParser.parseDirective(
        comment.value
      );
      if (label === "eslint") {
        const parseResult = commentParser.parseJSONLikeConfig(value);
        if (parseResult.ok) {
          configs.push({
            config: {
              rules: parseResult.config
            },
            loc: comment.position
          });
        } else {
          problems.push({
            ruleId: null,
            message: (
              /** @type {{ok: false, error: { message: string }}} */
              parseResult.error.message
            ),
            loc: comment.position
          });
        }
      }
    });
    return {
      configs,
      problems
    };
  }
  /**
   * Traverse the source code and return the steps that were taken.
   * @returns {Iterable<TraversalStep>} The steps that were taken while traversing the source code.
   */
  traverse() {
    if (this.#steps) {
      return this.#steps.values();
    }
    const steps = this.#steps = [];
    const visit = (node, parent) => {
      this.#parents.set(node, parent);
      steps.push(
        new VisitNodeStep({
          target: node,
          phase: 1,
          args: [node, parent]
        })
      );
      if (node.type === "html") {
        this.#htmlNodes.push(
          /** @type {Html} */
          node
        );
      }
      if ("children" in node) {
        const parentNode = (
          /** @type {Parent} */
          node
        );
        parentNode.children.forEach((child) => {
          visit(child, parentNode);
        });
      }
      steps.push(
        new VisitNodeStep({
          target: node,
          phase: 2,
          args: [node, parent]
        })
      );
    };
    visit(this.ast);
    return steps.values();
  }
};

// ../work/eslint__markdown/src/language/markdown-language.js
import { fromMarkdown } from "mdast-util-from-markdown";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown } from "mdast-util-math";
import { frontmatter } from "micromark-extension-frontmatter";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";
var jsonFrontmatterConfig = {
  type: "json",
  marker: "-"
};
function createParserOptions(mode, languageOptions) {
  const extensions = [];
  const mdastExtensions = [];
  if (mode === "gfm") {
    extensions.push(gfm());
    mdastExtensions.push(gfmFromMarkdown());
  }
  const frontmatterOption = languageOptions?.frontmatter;
  if (frontmatterOption !== false) {
    if (frontmatterOption === "yaml") {
      extensions.push(frontmatter(["yaml"]));
      mdastExtensions.push(frontmatterFromMarkdown(["yaml"]));
    } else if (frontmatterOption === "toml") {
      extensions.push(frontmatter(["toml"]));
      mdastExtensions.push(frontmatterFromMarkdown(["toml"]));
    } else if (frontmatterOption === "json") {
      extensions.push(frontmatter(jsonFrontmatterConfig));
      mdastExtensions.push(
        frontmatterFromMarkdown(jsonFrontmatterConfig)
      );
    }
  }
  const mathOption = languageOptions?.math;
  if (mathOption === true) {
    extensions.push(math());
    mdastExtensions.push(mathFromMarkdown());
  }
  return {
    extensions,
    mdastExtensions
  };
}
var MarkdownLanguage = class {
  /**
   * The type of file to read.
   * @type {"text"}
   */
  fileType = "text";
  /**
   * The line number at which the parser starts counting.
   * @type {0|1}
   */
  lineStart = 1;
  /**
   * The column number at which the parser starts counting.
   * @type {0|1}
   */
  columnStart = 1;
  /**
   * The name of the key that holds the type of the node.
   * @type {string}
   */
  nodeTypeKey = "type";
  /**
   * Default language options. User-defined options are merged with this object.
   * @type {MarkdownLanguageOptions}
   */
  defaultLanguageOptions = {
    frontmatter: false,
    math: false
  };
  /**
   * The Markdown parser mode.
   * @type {ParserMode}
   */
  #mode = "commonmark";
  /**
   * Creates a new instance.
   * @param {Object} options The options to use for this instance.
   * @param {ParserMode} [options.mode] The Markdown parser mode to use.
   */
  constructor({ mode } = {}) {
    if (mode) {
      this.#mode = mode;
    }
  }
  /**
   * Validates the language options.
   * @param {MarkdownLanguageOptions} languageOptions The language options to validate.
   * @returns {void}
   * @throws {Error} When the language options are invalid.
   */
  validateLanguageOptions(languageOptions) {
    const frontmatterOption = languageOptions?.frontmatter;
    const validFrontmatterOptions = /* @__PURE__ */ new Set([
      false,
      "yaml",
      "toml",
      "json"
    ]);
    if (frontmatterOption !== void 0 && !validFrontmatterOptions.has(frontmatterOption)) {
      throw new Error(
        `Invalid language option value \`${frontmatterOption}\` for frontmatter. Expected one of \`false\`, \`"yaml"\`, \`"toml"\`, or \`"json"\`.`
      );
    }
    const mathOption = languageOptions?.math;
    if (mathOption !== void 0 && typeof mathOption !== "boolean") {
      throw new Error(
        `Invalid language option value \`${mathOption}\` for math. Expected a boolean.`
      );
    }
  }
  /**
   * Parses the given file into an AST.
   * @param {File} file The virtual file to parse.
   * @param {MarkdownLanguageContext} context The options to use for parsing.
   * @returns {ParseResult<Root>} The result of parsing.
   */
  parse(file, context) {
    const text = (
      /** @type {string} */
      file.body
    );
    try {
      const options = createParserOptions(
        this.#mode,
        context?.languageOptions
      );
      const root = fromMarkdown(text, options);
      return {
        ok: true,
        ast: root
      };
    } catch (ex) {
      return {
        ok: false,
        errors: [ex]
      };
    }
  }
  /**
   * Creates a new `MarkdownSourceCode` object from the given information.
   * @param {File} file The virtual file to create a `MarkdownSourceCode` object from.
   * @param {OkParseResult<Root>} parseResult The result returned from `parse()`.
   * @returns {MarkdownSourceCode} The new `MarkdownSourceCode` object.
   */
  createSourceCode(file, parseResult) {
    return new MarkdownSourceCode({
      text: (
        /** @type {string} */
        file.body
      ),
      ast: parseResult.ast
    });
  }
};
export {
  MarkdownLanguage
};
