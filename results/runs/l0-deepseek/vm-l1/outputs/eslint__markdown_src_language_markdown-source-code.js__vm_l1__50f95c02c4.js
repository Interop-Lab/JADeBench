import {
    VisitNodeStep,
    TextSourceCodeBase,
    ConfigCommentParser,
    Directive
} from '@eslint/plugin-kit';

const lineEndingPattern = /\r\n|[\r\n]/u;
const illegalShorthandTailPattern = /\]\[\s+\]$/u;
const htmlCommentPattern = /<!--[\s\S]*?-->/gu;

function frontmatterHasTitle(text, options) {
    const lines = text.split(lineEndingPattern);
    let inFrontmatter = false;
    let hasTitle = false;

    for (const line of lines) {
        if (line.trim() === '---') {
            if (inFrontmatter) {
                break;
            }
            inFrontmatter = true;
            continue;
        }
        if (inFrontmatter) {
            if (/^title\s*:/u.test(line)) {
                hasTitle = true;
                break;
            }
        }
    }

    return hasTitle;
}

function stripHtmlComments(text) {
    return text.replace(htmlCommentPattern, '');
}

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

function extractInlineConfigCommentsFromHTML(text, options = {}) {
    const comments = [];
    const htmlCommentMatches = text.matchAll(htmlComment);

    for (const match of htmlCommentMatches) {
        const commentText = match[1];
        const position = match.index;

        if (configCommentStart.test(match[0])) {
            const parsed = commentParser.parse(commentText);
            comments.push(new InlineConfigComment(parsed, position));
        }
    }

    return comments;
}

class MarkdownSourceCode extends TextSourceCodeBase {
    static #privateFields = new WeakMap();

    #parent = undefined;
    #children = new WeakMap();
    #comments = [];
    #directives = undefined;
    ast = undefined;

    constructor({ text, ast }) {
        super({
            ast,
            text,
            lineEndingPattern
        });
    }

    getParent(node) {
        return this.#parent;
    }

    getInlineConfigNodes() {
        return this.#comments;
    }

    getDisableDirectives() {
        return this.#directives;
    }

    applyInlineConfig() {
        return this.#directives;
    }

    traverse() {
        return this.ast;
    }
}

export {
    InlineConfigComment,
    MarkdownSourceCode
};
