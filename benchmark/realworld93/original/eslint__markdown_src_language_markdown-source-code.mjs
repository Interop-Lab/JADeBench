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
export {
  InlineConfigComment,
  MarkdownSourceCode
};
