import { VisitNodeStep, TextSourceCodeBase, ConfigCommentParser, Directive } from '@eslint/plugin-kit';

const lineEndingPattern = /\r\n|[\r\n]/u;
const illegalShorthandTailPattern = /\]\[\s+\]$/u;
const htmlCommentPattern = /<!--[\s\S]*?-->/gu;
const configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const htmlComment = /<!--(.*?)-->/gsu;

class InlineConfigComment {
    value;
    position;
    constructor(value) {
        this.value = value;
    }
}

function frontmatterHasTitle(frontmatter, title) {
    if (!frontmatter || typeof frontmatter !== 'object') {
        return false;
    }
    if (frontmatter.title === title) {
        return true;
    }
    if (Array.isArray(frontmatter.title)) {
        return frontmatter.title.includes(title);
    }
    return false;
}

function stripHtmlComments(text) {
    return text.replace(htmlCommentPattern, '');
}

function extractInlineConfigCommentsFromHTML(text, options) {
    const comments = [];
    const matches = text.matchAll(htmlComment);
    for (const match of matches) {
        const content = match[1];
        if (configCommentStart.test(content)) {
            const position = match.index;
            comments.push(new InlineConfigComment(content));
        }
    }
    return comments;
}

const commentParser = new ConfigCommentParser();

class MarkdownSourceCode extends TextSourceCodeBase {
    static #privateFields = new WeakMap();
    
    #getPrivateFields() {
        if (!MarkdownSourceCode.#privateFields.has(this)) {
            MarkdownSourceCode.#privateFields.set(this, Object.create(null));
        }
        return MarkdownSourceCode.#privateFields.get(this);
    }
    
    #inlineConfigNodes = [];
    #disableDirectives = [];
    #ast = undefined;
    
    ast = void 0;
    
    constructor({ text, ast }) {
        super({ ast, text, lineEndingPattern });
        this.#getPrivateFields();
    }
    
    getParent(node) {
        return node.parent;
    }
    
    getInlineConfigNodes() {
        return this.#inlineConfigNodes;
    }
    
    getDisableDirectives() {
        return this.#disableDirectives;
    }
    
    applyInlineConfig() {
        return [];
    }
    
    traverse() {
        return [];
    }
}

export { InlineConfigComment, MarkdownSourceCode };
