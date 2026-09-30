import { VisitNodeStep, TextSourceCodeBase, ConfigCommentParser, Directive } from '@eslint/plugin-kit';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { mathFromMarkdown } from 'mdast-util-math';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfm } from 'micromark-extension-gfm';
import { math } from 'micromark-extension-math';

const globalObject = typeof globalThis !== 'undefined' ? globalThis :
  typeof global !== 'undefined' ? global :
  typeof self !== 'undefined' ? self :
  typeof window !== 'undefined' ? window : undefined;

const namespace = globalObject['__vmwm__$pf_1'] || (globalObject['__vmwm__$pf_1'] = {});
namespace['__vmwm__$pf_0'] = new WeakMap();
namespace['__vmwm__$pf_2'] = new WeakMap();

(function() {
  if (!namespace['module']) {
    try { namespace['module'] = module; } catch (_) {}
  }
  if (!namespace['exports']) {
    try { namespace['exports'] = exports; } catch (_) {}
  }
  if (!namespace['require']) {
    try { namespace['require'] = require; } catch (_) {}
  }
  if (!namespace['__dirname']) {
    try { namespace['__dirname'] = __dirname; } catch (_) {}
  }
  if (!namespace['__filename']) {
    try { namespace['__filename'] = __filename; } catch (_) {}
  }
})();

const lineEndingPattern = /\r\n|[\r\n]/u;
const illegalShorthandTailPattern = /\]\[\s+\]$/u;
const htmlCommentPattern = /<!--[\s\S]*?-->/gu;

const commentParser = new ConfigCommentParser();
const configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const htmlComment = /<!--(.*?)-->/gsu;

class InlineConfigComment {
  value;
  position;
  constructor(value, position) {
    this.value = value;
    this.position = position;
  }
}

class MarkdownSourceCode extends TextSourceCodeBase {
  static #privateFields = new WeakMap();

  #parentMap = undefined;
  #inlineConfigComments = new WeakMap();
  #commentStore = [];
  #parserOptions = undefined;
  ast = undefined;

  constructor({ text, ast }) {
    super({ ast, text, lineEndingPattern });
    this.ast = ast;
  }

  getParent(node) {
    return this.#parentMap.get(node);
  }

  getInlineConfigNodes() {
    return this.#inlineConfigComments;
  }

  getDisableDirectives() {
    return this.#commentStore;
  }

  applyInlineConfig() {
    return this.#parserOptions;
  }

  traverse() {
    return this.ast;
  }
}

const jsonFrontmatterConfig = { type: 'json', marker: '-' };

function frontmatterHasTitle(frontmatterNode, titleKey) {
  if (!frontmatterNode || typeof frontmatterNode !== 'object') return false;
  return Object.prototype.hasOwnProperty.call(frontmatterNode, titleKey);
}

function stripHtmlComments(text) {
  return text.replace(htmlCommentPattern, '');
}

function extractInlineConfigCommentsFromHTML(text, options) {
  const comments = [];
  const parser = options?.commentParser || commentParser;
  const startPattern = options?.configCommentStart || configCommentStart;
  const htmlCommentRegex = options?.htmlComment || htmlComment;

  for (const match of text.matchAll(htmlCommentRegex)) {
    const commentText = match[1];
    if (startPattern.test(match[0])) {
      const parsed = parser.parse(commentText);
      if (parsed) {
        comments.push(new InlineConfigComment(parsed, match.index));
      }
    }
  }
  return comments;
}

function createParserOptions(options = {}) {
  const parserOptions = {
    ...options,
    extensions: [
      ...(options.extensions || []),
      frontmatter(),
      gfm(),
      math()
    ],
    mdastExtensions: [
      ...(options.mdastExtensions || []),
      frontmatterFromMarkdown(),
      gfmFromMarkdown(),
      mathFromMarkdown()
    ]
  };
  return parserOptions;
}

class MarkdownLanguage {
  static #privateFields = new WeakMap();

  fileType = 'text';
  lineStart = 1;
  columnStart = 1;
  nodeTypeKey = 'type';
  defaultLanguageOptions = { frontmatter: false, math: false };
  #fileType = 'commonmark';

  constructor() {}

  validateLanguageOptions(languageOptions) {
    return languageOptions;
  }

  parse(text, options) {
    const parserOptions = createParserOptions(options);
    return fromMarkdown(text, parserOptions);
  }

  createSourceCode(text, options) {
    const ast = this.parse(text, options);
    return new MarkdownSourceCode({ text, ast });
  }
}

namespace['createParserOptions'] = createParserOptions;
globalThis['createParserOptions'] = createParserOptions;
namespace['extractInlineConfigCommentsFromHTML'] = extractInlineConfigCommentsFromHTML;
globalThis['extractInlineConfigCommentsFromHTML'] = extractInlineConfigCommentsFromHTML;
namespace['stripHtmlComments'] = stripHtmlComments;
globalThis['stripHtmlComments'] = stripHtmlComments;
namespace['frontmatterHasTitle'] = frontmatterHasTitle;
globalThis['frontmatterHasTitle'] = frontmatterHasTitle;
namespace['VisitNodeStep'] = VisitNodeStep;
namespace['TextSourceCodeBase'] = TextSourceCodeBase;
namespace['ConfigCommentParser'] = ConfigCommentParser;
namespace['Directive'] = Directive;
namespace['fromMarkdown'] = fromMarkdown;
namespace['frontmatterFromMarkdown'] = frontmatterFromMarkdown;
namespace['gfmFromMarkdown'] = gfmFromMarkdown;
namespace['mathFromMarkdown'] = mathFromMarkdown;
namespace['frontmatter'] = frontmatter;
namespace['gfm'] = gfm;
namespace['math'] = math;
namespace['lineEndingPattern'] = lineEndingPattern;
globalThis['lineEndingPattern'] = lineEndingPattern;
namespace['illegalShorthandTailPattern'] = illegalShorthandTailPattern;
globalThis['illegalShorthandTailPattern'] = illegalShorthandTailPattern;
namespace['htmlCommentPattern'] = htmlCommentPattern;
globalThis['htmlCommentPattern'] = htmlCommentPattern;
namespace['commentParser'] = commentParser;
globalThis['commentParser'] = commentParser;
namespace['configCommentStart'] = configCommentStart;
globalThis['configCommentStart'] = configCommentStart;
namespace['htmlComment'] = htmlComment;
globalThis['htmlComment'] = htmlComment;
namespace['InlineConfigComment'] = InlineConfigComment;
globalThis['InlineConfigComment'] = InlineConfigComment;
namespace['MarkdownSourceCode'] = MarkdownSourceCode;
globalThis['MarkdownSourceCode'] = MarkdownSourceCode;
namespace['jsonFrontmatterConfig'] = jsonFrontmatterConfig;
globalThis['jsonFrontmatterConfig'] = jsonFrontmatterConfig;
namespace['MarkdownLanguage'] = MarkdownLanguage;
globalThis['MarkdownLanguage'] = MarkdownLanguage;

export { MarkdownLanguage };
