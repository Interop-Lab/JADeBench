import {
  VisitNodeStep,
  TextSourceCodeBase,
  ConfigCommentParser,
  Directive,
} from "@eslint/plugin-kit";

const lineEndingPattern = /\r\n|[\r\n]/u;
const illegalShorthandTailPattern = /\]\[\s+\]$/u;
const htmlCommentPattern = /<!--[\s\S]*?-->/gu;
const configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const htmlComment = /<!--(.*?)-->/gsu;
const commentParser = new ConfigCommentParser();

function stripHtmlComments(text) {
  return text.replace(htmlCommentPattern, comment =>
    comment.replace(/[^\r\n]/gu, " "),
  );
}

function frontmatterHasTitle(text, titlePattern) {
  return text
    .split(lineEndingPattern)
    .some(line => titlePattern.test(stripHtmlComments(line)));
}

class InlineConfigComment {
  value;
  position;

  constructor({ value, position }) {
    this.value = value;
    this.position = position;
  }
}

function getPosition(sourceCode, node, relativeStart, relativeEnd) {
  const nodeStart = node.position.start.offset;
  const startOffset = nodeStart + relativeStart;
  const endOffset = nodeStart + relativeEnd;

  if (relativeStart === 0 && relativeEnd === node.value.length) {
    return node.position;
  }

  return {
    start: { ...sourceCode.getLocFromIndex(startOffset), offset: startOffset },
    end: { ...sourceCode.getLocFromIndex(endOffset), offset: endOffset },
  };
}

function extractInlineConfigCommentsFromHTML(node, sourceCode) {
  if (!node.value.includes("<!--")) {
    return [];
  }

  return [...node.value.matchAll(htmlComment)]
    .filter(match => configCommentStart.test(match[0]))
    .map(match => {
      const start = match.index;
      const end = start + match[0].length;
      return new InlineConfigComment({
        value: match[1].trim(),
        position: getPosition(sourceCode, node, start, end),
      });
    });
}

function childNodes(node) {
  return Array.isArray(node.children) ? node.children : [];
}

class MarkdownSourceCode extends TextSourceCodeBase {
  #parents = new WeakMap();
  #inlineConfigNodes = [];

  constructor({ text, ast }) {
    super({ ast, text, lineEndingPattern });

    const visit = (node, parent) => {
      if (parent) {
        this.#parents.set(node, parent);
      }
      if (node.type === "html" && typeof node.value === "string") {
        this.#inlineConfigNodes.push(
          ...extractInlineConfigCommentsFromHTML(node, this),
        );
      }
      for (const child of childNodes(node)) {
        visit(child, node);
      }
    };
    visit(ast);
  }

  getParent(node) {
    return this.#parents.get(node);
  }

  getInlineConfigNodes() {
    return this.#inlineConfigNodes;
  }

  getDisableDirectives() {
    const problems = [];
    const directives = [];

    for (const node of this.#inlineConfigNodes) {
      const parsed = commentParser.parseDirective(node.value);
      if (!parsed || parsed.label === "eslint") {
        continue;
      }
      const type = parsed.label.slice("eslint-".length);
      if (!["disable", "enable", "disable-next-line", "disable-line"].includes(type)) {
        continue;
      }
      directives.push(new Directive({
        type,
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

    for (const node of this.#inlineConfigNodes) {
      const parsedDirective = commentParser.parseDirective(node.value);
      if (!parsedDirective || parsedDirective.label !== "eslint") {
        continue;
      }

      let value = parsedDirective.value;
      if (illegalShorthandTailPattern.test(value)) {
        value = value.replace(illegalShorthandTailPattern, "]");
      }
      const result = commentParser.parseJSONLikeConfig(value);
      if (result.ok) {
        configs.push({ config: { rules: result.config }, loc: node.position });
      } else {
        problems.push({ ruleId: null, message: result.error.message, loc: node.position });
      }
    }

    return { configs, problems };
  }

  traverse() {
    const steps = [];
    const visit = (node, parent) => {
      steps.push(new VisitNodeStep({ target: node, phase: 1, args: [node, parent] }));
      for (const child of childNodes(node)) {
        visit(child, node);
      }
      steps.push(new VisitNodeStep({ target: node, phase: 2, args: [node, parent] }));
    };
    visit(this.ast);
    return steps.values();
  }
}

export { InlineConfigComment, MarkdownSourceCode };
