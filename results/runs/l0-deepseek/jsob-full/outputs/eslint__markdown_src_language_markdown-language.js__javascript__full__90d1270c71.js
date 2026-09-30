import { VisitNodeStep, TextSourceCodeBase, ConfigCommentParser, Directive } from '@eslint/plugin-kit';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { mathFromMarkdown } from 'mdast-util-math';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfm } from 'micromark-extension-gfm';
import { math } from 'micromark-extension-math';

var lineEndingPattern = /\r\n|[\r\n]/u;
var illegalShorthandTailPattern = /\]\[\s+\]$/u;
var htmlCommentPattern = /<!--[\s\S]*?-->/gu;

function frontmatterHasTitle(frontmatterNode, title) {
  if (!title) {
    return false;
  }
  const lines = frontmatterNode.value.split(lineEndingPattern);
  for (const line of lines) {
    if (title.test(line)) {
      return true;
    }
  }
  return false;
}

function stripHtmlComments(text) {
  return text.replace(htmlCommentPattern, comment => comment.replace(/[^\r\n]/g, ' '));
}

var commentParser = new ConfigCommentParser();
var configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
var htmlComment = /<!--(.*?)-->/gsu;

class InlineConfigComment {
  value;
  position;
  constructor({ value, position }) {
    this.value = value.trim();
    this.position = position;
  }
}

function extractInlineConfigCommentsFromHTML(htmlText, sourceCode) {
  if (!configCommentStart.test(htmlText.value)) {
    return [];
  }
  const comments = [];
  let match;
  while ((match = htmlComment.exec(htmlText.value))) {
    if (configCommentStart.test(match[0])) {
      const startOffset = match.index + htmlText.position.start.offset;
      const endOffset = startOffset + match[0].length;
      comments.push(new InlineConfigComment({
        value: match[1].trim(),
        position: {
          start: { ...sourceCode.getLocFromIndex(startOffset), offset: startOffset },
          end: { ...sourceCode.getLocFromIndex(endOffset), offset: endOffset }
        }
      }));
    }
  }
  return comments;
}

class MarkdownSourceCode extends TextSourceCodeBase {
  #steps;
  #parents = new WeakMap();
  #htmlNodes = [];
  #inlineConfigComments;
  ast = undefined;

  constructor({ text, ast }) {
    super({ ast, text, lineEndingPattern });
    this.ast = ast;
    this.#steps = undefined;
  }

  getParent(node) {
    return this.#parents.get(node);
  }

  getInlineConfigComments() {
    if (!this.#inlineConfigComments) {
      this.#inlineConfigComments = this.#htmlNodes.flatMap(node => extractInlineConfigCommentsFromHTML(node, this));
    }
    return this.#inlineConfigComments;
  }

  getDirectiveComments() {
    const problems = [];
    const directives = [];
    this.getInlineConfigComments().forEach(comment => {
      const { label, value, justification } = commentParser.parseDirective(comment.value);
      if (label === 'eslint-disable-next-line' && comment.position.start.line === comment.position.end.line) {
        const problem = label + ' is not allowed on the same line as the directive';
        problems.push({ ruleId: null, message: problem, line: comment.position.start.line });
        return;
      }
      switch (label) {
        case 'eslint-disable':
        case 'eslint-enable':
        case 'eslint-disable-line':
        case 'eslint-disable-next-line': {
          const ruleId = label.slice('eslint-'.length);
          const directive = {
            ruleId,
            node: comment,
            value,
            justification
          };
          directives.push(new Directive(directive));
        }
      }
    });
    return { problems, directives };
  }

  getVisitorKeys() {
    const problems = [];
    const directives = [];
    this.getInlineConfigComments().forEach(comment => {
      const { label, value } = commentParser.parseDirective(comment.value);
      if (label === 'eslint-disable-next-line') {
        const parsed = commentParser.parseListConfig(value);
        if (parsed.ok) {
          const config = { ruleId: parsed.value };
          const problem = { config, line: comment.position.start.line };
          directives.push(problem);
        } else {
          const problem = {
            ruleId: null,
            message: parsed.error.message,
            line: comment.position.start.line
          };
          problems.push(problem);
        }
      }
    });
    return { problems, directives };
  }

  traverse() {
    if (this.#steps) {
      return this.#steps.slice();
    }
    const steps = this.#steps = [];
    const visit = (node, parent) => {
      this.#parents.set(node, parent);
      const step = {
        target: node,
        phase: 1,
        args: [node, parent]
      };
      steps.push(new VisitNodeStep(step));
      if (node.type === 'html') {
        this.#htmlNodes.push(node);
      }
      if (node.children) {
        node.children.forEach(child => {
          visit(child, node);
        });
      }
      const exitStep = {
        target: node,
        phase: 2,
        args: [node, parent]
      };
      steps.push(new VisitNodeStep(exitStep));
    };
    visit(this.ast);
    return steps.slice();
  }
}

var jsonFrontmatterConfig = { type: 'yaml', marker: '-' };

function createParserOptions(mode, options) {
  const extensions = [];
  const mdastExtensions = [];
  if (mode === 'gfm') {
    extensions.push(gfm());
    mdastExtensions.push(gfmFromMarkdown());
  }
  const frontmatterConfig = options?.frontmatter;
  if (frontmatterConfig !== false) {
    if (frontmatterConfig === 'yaml') {
      extensions.push(frontmatter(['yaml']));
      mdastExtensions.push(frontmatterFromMarkdown(['yaml']));
    } else if (frontmatterConfig === 'json') {
      extensions.push(frontmatter(jsonFrontmatterConfig));
      mdastExtensions.push(frontmatterFromMarkdown(jsonFrontmatterConfig));
    }
  }
  const mathConfig = options?.math;
  if (mathConfig === true) {
    extensions.push(math());
    mdastExtensions.push(mathFromMarkdown());
  }
  return { extensions, mdastExtensions };
}

var defaultOptions = {
  frontmatter: false,
  math: false
};

class MarkdownLanguage {
  fileType = 'markdown';
  lineStart = 0;
  columnStart = 0;
  lineEnd = 1;
  columnEnd = 1;
  defaultOptions = defaultOptions;
  #mode = 'commonmark';

  constructor({ mode } = {}) {
    if (mode) {
      this.#mode = mode;
    }
  }

  parse(text, options) {
    const sourceText = text;
    try {
      const parserOptions = createParserOptions(this.#mode, options?.parserOptions);
      const ast = fromMarkdown(sourceText, parserOptions);
      return { ok: true, ast };
    } catch (error) {
      return { ok: false, errors: [error] };
    }
  }

  createSourceCode(text, ast) {
    return new MarkdownSourceCode({ text, ast });
  }
}

export { MarkdownLanguage };
