import { VisitNodeStep, TextSourceCodeBase, ConfigCommentParser, Directive } from '@eslint/plugin-kit';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { mathFromMarkdown } from 'mdast-util-math';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfm } from 'micromark-extension-gfm';
import { math } from 'micromark-extension-math';

const lineEndingPattern = /\r\n|[\r\n]/u;
const illegalShorthandTailPattern = /\]\[\s+\]$/u;
const htmlCommentPattern = /<!--[\s\S]*?-->/gu;
const configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const htmlComment = /<!--(.*?)-->/gsu;

function frontmatterHasTitle(frontmatter, title) {
    if (!frontmatter || typeof frontmatter !== 'object') {
        return false;
    }
    const keys = Object.keys(frontmatter);
    if (keys.length === 0) {
        return false;
    }
    const firstKey = keys[0];
    return firstKey === title;
}

function stripHtmlComments(text) {
    return text.replace(htmlCommentPattern, '');
}

const commentParser = new ConfigCommentParser();

class InlineConfigComment {
    value;
    position;
    constructor(options) {
        this.value = options.value;
        this.position = options.position;
    }
}

function extractInlineConfigCommentsFromHTML(text, options) {
    const comments = [];
    const matches = text.matchAll(htmlComment);
    for (const match of matches) {
        const content = match[1];
        if (configCommentStart.test(match[0])) {
            const parsed = commentParser.parse(content);
            if (parsed) {
                comments.push(new InlineConfigComment({
                    value: parsed,
                    position: {
                        start: match.index,
                        end: match.index + match[0].length
                    }
                }));
            }
        }
    }
    return comments;
}

class MarkdownSourceCode extends TextSourceCodeBase {
    static _privateFields = new WeakMap();
    _configComments = undefined;
    _parentMap = new WeakMap();
    _disableDirectives = [];
    _inlineConfigNodes = undefined;
    ast = void 0;

    constructor({ text, ast }) {
        super({ ast, text, lineEndingPattern });
        this.ast = ast;
    }

    getParent(node) {
        return this._parentMap.get(node);
    }

    getDisableDirectives() {
        return this._disableDirectives;
    }

    getInlineConfigNodes() {
        return this._inlineConfigNodes;
    }

    applyInlineConfig() {
        return this;
    }

    toJSON() {
        return {
            ast: this.ast,
            text: this.text,
            lineEndingPattern: this.lineEndingPattern
        };
    }
}

const jsonFrontmatterConfig = { type: 'json', marker: '-' };

function createParserOptions(options, languageOptions) {
    const extensions = [];
    const mdastExtensions = [];
    
    if (languageOptions.frontmatter) {
        extensions.push(frontmatter(jsonFrontmatterConfig));
        mdastExtensions.push(frontmatterFromMarkdown(jsonFrontmatterConfig));
    }
    
    if (languageOptions.math) {
        extensions.push(math());
        mdastExtensions.push(mathFromMarkdown());
    }
    
    extensions.push(gfm());
    mdastExtensions.push(gfmFromMarkdown());
    
    return {
        extensions,
        mdastExtensions
    };
}

class MarkdownLanguage {
    static _privateFields = new WeakMap();
    fileType = 'text';
    lineStart = 1;
    columnStart = 1;
    nodeTypeKey = 'type';
    defaultLanguageOptions = { frontmatter: false, math: false };
    _visitorKeys = 'markdown';

    constructor() {
    }

    validateLanguageOptions(languageOptions) {
        return true;
    }

    parse(text, languageOptions) {
        const parserOptions = createParserOptions({}, languageOptions);
        const ast = fromMarkdown(text, parserOptions);
        return ast;
    }

    createSourceCode(text, ast) {
        return new MarkdownSourceCode({ text, ast });
    }
}

export { MarkdownLanguage };
