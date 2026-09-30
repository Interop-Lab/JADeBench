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

function stripHtmlComments(value) {
  return value.replace(htmlCommentPattern, comment =>
    comment.replace(/[^\r\n]/gu, " "),
  );
}

function frontmatterHasTitle(value, titlePattern) {
  return titlePattern.test(stripHtmlComments(value));
}

class InlineConfigComment {
  value;
  position;

  constructor({ value, position }) {
    this.value = value;
    this.position = position;
  }
}

function extractInlineConfigCommentsFromHTML(node, sourceCode) {
  if (!configCommentStart.test(node.value)) {
    return [];
  }

  const comments = [];
  for (const match of node.value.matchAll(htmlComment)) {
    if (!/^\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|$)/u.test(match[1])) {
      continue;
    }

    const startOffset = node.position.start.offset + match.index;
    const endOffset = startOffset + match[0].length;
    comments.push(new InlineConfigComment({
      value: match[1].trim(),
      position: {
        start: { ...sourceCode.getLocFromIndex(startOffset), offset: startOffset },
        end: { ...sourceCode.getLocFromIndex(endOffset), offset: endOffset },
      },
    }));
  }
  return comments;
}

class MarkdownSourceCode extends TextSourceCodeBase {
  #parents = new WeakMap();

  constructor({ text, ast }) {
    super({ ast, text, lineEndingPattern });

    const visit = (node, parent) => {
      if (parent) {
        this.#parents.set(node, parent);
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          visit(child, node);
        }
      }
    };
    visit(ast, undefined);
  }

  getParent(node) {
    return this.#parents.get(node);
  }

  getInlineConfigNodes() {
    const comments = [];
    for (const step of this.traverse()) {
      if (step.phase === 1 && step.target.type === "html") {
        comments.push(...extractInlineConfigCommentsFromHTML(step.target, this));
      }
    }
    return comments;
  }

  getDisableDirectives() {
    const problems = [];
    const directives = [];

    for (const node of this.getInlineConfigNodes()) {
      const parsed = commentParser.parseDirective(node.value);
      if (!parsed || parsed.label === "eslint") {
        continue;
      }
      directives.push(new Directive({
        type: parsed.label.slice("eslint-".length),
        node,
        value: parsed.value,
        justification: parsed.justification,
      }));
    }
    return { problems, directives };
  }

  applyInlineConfig() {
    const configs = [];
    const problems = [];

    for (const node of this.getInlineConfigNodes()) {
      const parsed = commentParser.parseDirective(node.value);
      if (!parsed || parsed.label !== "eslint") {
        continue;
      }
      const result = commentParser.parseJSONLikeConfig(parsed.value);
      if (result.ok) {
        configs.push({ config: { rules: result.config }, loc: node.position });
      } else {
        problems.push({ ruleId: null, message: result.error.message, loc: node.position });
      }
    }
    return { configs, problems };
  }

  *traverse() {
    const visit = function* (node, parent) {
      yield new VisitNodeStep({ target: node, phase: 1, args: [node, parent] });
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          yield* visit(child, node);
        }
      }
      yield new VisitNodeStep({ target: node, phase: 2, args: [node, parent] });
    };
    yield* visit(this.ast, undefined);
  }
}

export { InlineConfigComment, MarkdownSourceCode };
