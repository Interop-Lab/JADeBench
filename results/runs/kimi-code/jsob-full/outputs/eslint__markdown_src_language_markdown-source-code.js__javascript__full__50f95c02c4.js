import {
  ConfigCommentParser,
  Directive,
  TextSourceCodeBase,
  VisitNodeStep,
} from "@eslint/plugin-kit";

const lineEndingPattern = /\r\n|[\r\n]/u;
const configCommentStart =
  /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const htmlComment = /<!--(.*?)-->/gsu;
const commentParser = new ConfigCommentParser();

class InlineConfigComment {
  value;
  position;

  constructor({ value, position }) {
    this.value = value.trim();
    this.position = position;
  }
}

function extractInlineConfigCommentsFromHTML(node, sourceCode) {
  if (!configCommentStart.test(node.value)) {
    return [];
  }

  const comments = [];
  htmlComment.lastIndex = 0;

  let match;
  while ((match = htmlComment.exec(node.value))) {
    if (!configCommentStart.test(match[0])) {
      continue;
    }

    const startOffset = match.index + node.position.start.offset;
    const endOffset = startOffset + match[0].length;

    comments.push(
      new InlineConfigComment({
        value: match[1].trim(),
        position: {
          start: {
            ...sourceCode.getLocFromIndex(startOffset),
            offset: startOffset,
          },
          end: {
            ...sourceCode.getLocFromIndex(endOffset),
            offset: endOffset,
          },
        },
      }),
    );
  }

  return comments;
}

class MarkdownSourceCode extends TextSourceCodeBase {
  #steps;
  #parents = new WeakMap();
  #htmlNodes = [];
  #inlineConfigComments;

  constructor({ text, ast }) {
    super({ ast, text, lineEndingPattern });
    this.ast = ast;
    this.traverse();
  }

  getParent(node) {
    return this.#parents.get(node);
  }

  getInlineConfigNodes() {
    if (!this.#inlineConfigComments) {
      this.#inlineConfigComments = this.#htmlNodes.flatMap(node =>
        extractInlineConfigCommentsFromHTML(node, this),
      );
    }

    return this.#inlineConfigComments;
  }

  getDisableDirectives() {
    const problems = [];
    const directives = [];

    for (const node of this.getInlineConfigNodes()) {
      const directive = commentParser.parseDirective(node.value);
      if (!directive) {
        continue;
      }

      const { label, value, justification } = directive;
      if (
        label === "eslint-disable" &&
        node.position.start.line !== node.position.end.line
      ) {
        problems.push({
          ruleId: null,
          message: `${label} comment should not span multiple lines.`,
          loc: node.position,
        });
        continue;
      }

      switch (label) {
        case "eslint-disable":
        case "eslint-enable":
        case "eslint-disable-next-line":
        case "eslint-disable-line":
          directives.push(
            new Directive({
              type: label.slice("eslint-".length),
              node,
              value,
              justification,
            }),
          );
      }
    }

    return { problems, directives };
  }

  applyInlineConfig() {
    const problems = [];
    const configs = [];

    for (const node of this.getInlineConfigNodes()) {
      const directive = commentParser.parseDirective(node.value);
      if (!directive || directive.label !== "eslint") {
        continue;
      }

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

  traverse() {
    if (this.#steps) {
      return this.#steps.values();
    }

    const steps = (this.#steps = []);

    const visit = (node, parent) => {
      this.#parents.set(node, parent);
      steps.push(
        new VisitNodeStep({
          target: node,
          phase: 1,
          args: [node, parent],
        }),
      );

      if (node.type === "html") {
        this.#htmlNodes.push(node);
      }

      if ("children" in node) {
        for (const child of node.children) {
          visit(child, node);
        }
      }

      steps.push(
        new VisitNodeStep({
          target: node,
          phase: 2,
          args: [node, parent],
        }),
      );
    };

    visit(this.ast);
    return steps.values();
  }
}

export { InlineConfigComment, MarkdownSourceCode };
