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
const commentParser = new ConfigCommentParser();
const configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const htmlComment = /<!--(.*?)-->/gsu;

function frontmatterHasTitle(node, frontmatter) {
    return frontmatter && typeof frontmatter === 'object' && Object.prototype.hasOwnProperty.call(frontmatter, 'title');
}

function stripHtmlComments(text) {
    return text.replace(htmlCommentPattern, '');
}

class InlineConfigComment {
    constructor(comment) {
        this.comment = comment;
        this.position = comment.position;
    }
}

function extractInlineConfigCommentsFromHTML(text, ast) {
    const comments = [];
    let match;
    while ((match = htmlCommentPattern.exec(text)) !== null) {
        const commentText = match[0];
        if (configCommentStart.test(commentText)) {
            const comment = {
                type: 'html',
                value: commentText,
                position: {
                    start: { line: 0, column: match.index, offset: match.index },
                    end: { line: 0, column: match.index + commentText.length, offset: match.index + commentText.length }
                }
            };
            comments.push(new InlineConfigComment(comment));
        }
    }
    return comments;
}

class MarkdownSourceCode extends TextSourceCodeBase {
    static #cache = new WeakMap();
    #inlineConfigComments = [];
    #disableDirectives = null;
    #inlineConfigNodes = [];
    #comments = [];
    #parentMap = new WeakMap();
    ast = void 0;

    constructor({ text, ast }) {
        super({ ast, text, lineEndingPattern });
        this.ast = ast;
        this.#inlineConfigComments = extractInlineConfigCommentsFromHTML(text, ast);
        this.#disableDirectives = commentParser.parseDisableDirectives(this.#inlineConfigComments.map(c => c.comment));
        this.#inlineConfigNodes = this.#inlineConfigComments;
        this.#comments = this.#inlineConfigComments;
        this.#buildParentMap(ast);
    }

    #buildParentMap(node) {
        if (!node || typeof node !== 'object') return;
        if (node.children) {
            for (const child of node.children) {
                this.#parentMap.set(child, node);
                this.#buildParentMap(child);
            }
        }
    }

    getParent(node) {
        return this.#parentMap.get(node);
    }

    getInlineConfigNodes() {
        return this.#inlineConfigNodes;
    }

    getDisableDirectives() {
        return this.#disableDirectives;
    }

    getComments() {
        return this.#comments;
    }

    applyInlineConfig() {
        commentParser.applyInlineConfig(this.#inlineConfigComments.map(c => c.comment));
    }

    traverse() {
        return this.#traverse(this.ast);
    }

    *#traverse(node) {
        if (!node) return;
        yield new VisitNodeStep(1, node);
        if (node.children) {
            for (const child of node.children) {
                yield* this.#traverse(child);
            }
        }
        yield new VisitNodeStep(2, node);
    }
}

const jsonFrontmatterConfig = { type: 'json', marker: '-' };

function createParserOptions(languageOptions) {
    const isFrontmatter = languageOptions?.frontmatter ?? false;
    const isMath = languageOptions?.math ?? false;
    const mdastExtensions = [];
    const micromarkExtensions = [];
    if (isFrontmatter) {
        mdastExtensions.push(frontmatterFromMarkdown());
        micromarkExtensions.push(frontmatter(jsonFrontmatterConfig));
    }
    if (isMath) {
        mdastExtensions.push(mathFromMarkdown());
        micromarkExtensions.push(math());
    }
    mdastExtensions.push(gfmFromMarkdown());
    micromarkExtensions.push(gfm());
    return { mdastExtensions, micromarkExtensions };
}

class MarkdownLanguage {
    static #cache = new WeakMap();
    fileType = 'text';
    lineStart = 1;
    columnStart = 1;
    nodeTypeKey = 'type';
    defaultLanguageOptions = { frontmatter: false, math: false };
    #languageOptions = null;

    constructor() {}

    validateLanguageOptions(languageOptions) {
        return languageOptions;
    }

    parse(text, languageOptions) {
        this.#languageOptions = languageOptions;
        const { mdastExtensions, micromarkExtensions } = createParserOptions(languageOptions);
        return fromMarkdown(text, { extensions: micromarkExtensions, mdastExtensions });
    }

    createSourceCode(text, parsedAst) {
        return new MarkdownSourceCode({ text, ast: parsedAst });
    }
}

export { MarkdownLanguage };
