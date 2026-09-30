import {
  VisitNodeStep,
  TextSourceCodeBase,
  ConfigCommentParser,
  Directive,
} from "@eslint/plugin-kit";

const lineEndingPattern = /\r\n|[\r\n]/u;
const htmlCommentPattern = /<!--[\s\S]*?-->/gu;
const configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const htmlComment = /<!--(.*?)-->/gsu;
const commentParser = new ConfigCommentParser();

function frontmatterHasTitle(frontmatter, titlePattern) {
  return frontmatter.split(lineEndingPattern).some(line => titlePattern.test(line));
}

function stripHtmlComments(text) {
  return text.replace(htmlCommentPattern, comment =>
    comment.replace(/[^\r\n]/gu, " "),
  );
}

class InlineConfigComment {
  value;
  position;

  constructor({ value, position }) {
    this.value = value.trim();
    this.position = position;
  }
}

function extractInlineConfigCommentsFromHTML(node, sourceCode) {
  const comments = [];
  let match;

  htmlComment.lastIndex = 0;
  while ((match = htmlComment.exec(node.value))) {
    if (!configCommentStart.test(match[0])) {
      continue;
    }

    const startOffset = node.position.start.offset + match.index;
    const endOffset = startOffset + match[0].length;
    const start =
      match.index === 0
        ? node.position.start
        : { ...sourceCode.getLocFromIndex(startOffset), offset: startOffset };
    const end =
      match.index + match[0].length === node.value.length
        ? node.position.end
        : { ...sourceCode.getLocFromIndex(endOffset), offset: endOffset };
    comments.push(
      new InlineConfigComment({
        value: match[1].trim(),
        position: { start, end },
      }),
    );
  }

  return comments;
}

class MarkdownSourceCode extends TextSourceCodeBase {
  #steps = [];
  #parents = new WeakMap();
  #htmlNodes = [];
  #inlineConfigNodes;

  ast;

  constructor({ text, ast }) {
    super({ ast, text, lineEndingPattern });
    this.ast = ast;

    const visit = (node, parent) => {
      this.#parents.set(node, parent);
      if (node.type === "html") {
        this.#htmlNodes.push(node);
      }

      const args = [node, parent];
      this.#steps.push(new VisitNodeStep({ target: node, phase: 1, args }));
      if (node.children) {
        node.children.forEach(child => visit(child, node));
      }
      this.#steps.push(new VisitNodeStep({ target: node, phase: 2, args }));
    };

    visit(ast, null);
  }

  getParent(node) {
    return this.#parents.get(node);
  }

  getInlineConfigNodes() {
    if (!this.#inlineConfigNodes) {
      this.#inlineConfigNodes = this.#htmlNodes.flatMap(node =>
        extractInlineConfigCommentsFromHTML(node, this),
      );
    }
    return this.#inlineConfigNodes;
  }

  getDisableDirectives() {
    const problems = [];
    const directives = [];

    this.getInlineConfigNodes().forEach(node => {
      const { label, value, justification } = commentParser.parseDirective(
        node.value,
      );
      if (label.startsWith("eslint-")) {
        directives.push(
          new Directive({
            type: label.slice("eslint-".length),
            node,
            value,
            justification,
          }),
        );
      }
    });

    return { problems, directives };
  }

  applyInlineConfig() {
    const problems = [];
    const configs = [];

    this.getInlineConfigNodes().forEach(node => {
      const { label, value } = commentParser.parseDirective(node.value);
      if (label !== "eslint") {
        return;
      }

      const result = commentParser.parseJSONLikeConfig(value);
      if (result.ok) {
        configs.push({ config: { rules: result.config }, loc: node.position });
      } else {
        problems.push({
          ruleId: null,
          message: result.error.message,
          loc: node.position,
        });
      }
    });

    return { configs, problems };
  }

  traverse() {
    return this.#steps.values();
  }
}

export { InlineConfigComment, MarkdownSourceCode };
