import { VisitNodeStep, TextSourceCodeBase, ConfigCommentParser, Directive } from '@eslint/plugin-kit';

var lineEndingPattern = /\r\n|[\r\n]/u;
var illegalShorthandTailPattern = /\]\[\s+\]$/u;
var htmlCommentPattern = /<!--[\s\S]*?-->/gu;

function frontmatterHasTitle(frontmatter) {
    if (!frontmatter) {
        return false;
    }
    const lines = frontmatter.split(lineEndingPattern);
    if (lines.length === 0) {
        return false;
    }
    const firstLine = lines[0].trim();
    if (firstLine === '') {
        return false;
    }
    return /title\s*[:=]/i.test(firstLine);
}

function stripHtmlComments(text) {
    return text.replace(htmlCommentPattern, '');
}

var commentParser = new ConfigCommentParser();
var configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
var htmlComment = /<!--(.*?)-->/gsu;

class InlineConfigComment {
    constructor(comment) {
        this.value = comment;
        this.position = null;
    }
}

function extractInlineConfigCommentsFromHTML(text, ast) {
    const comments = [];
    let match;
    while ((match = htmlComment.exec(text)) !== null) {
        const commentText = match[0];
        const innerText = match[1];
        if (configCommentStart.test(commentText)) {
            const directive = commentParser.parseDirective(innerText.trim());
            if (directive) {
                const inlineConfigComment = new InlineConfigComment(directive);
                inlineConfigComment.position = {
                    start: match.index,
                    end: match.index + commentText.length
                };
                comments.push(inlineConfigComment);
            }
        }
    }
    return comments;
}

class MarkdownSourceCode extends TextSourceCodeBase {
    static #private = new WeakMap();

    #inlineConfigComments = undefined;
    #inlineConfigNodes = new WeakMap();
    #disableDirectives = [];
    #comments = undefined;
    ast = void 0;

    constructor({ text, ast }) {
        super({ ast, text, lineEndingPattern });
        this.ast = ast;
    }

    applyInlineConfig() {
        const inlineConfigComments = this.getInlineConfigComments();
        for (const comment of inlineConfigComments) {
            this.applyInlineConfigComment(comment);
        }
    }

    getInlineConfigNodes() {
        if (!this.#inlineConfigNodes.has(this)) {
            this.#inlineConfigNodes.set(this, extractInlineConfigCommentsFromHTML(this.text, this.ast));
        }
        return this.#inlineConfigNodes.get(this);
    }

    getDisableDirectives() {
        if (!this.#disableDirectives) {
            this.#disableDirectives = [];
            const inlineConfigNodes = this.getInlineConfigNodes();
            for (const node of inlineConfigNodes) {
                if (node.value.kind === 'disable' || node.value.kind === 'disable-line' || node.value.kind === 'disable-next-line') {
                    this.#disableDirectives.push(new Directive(node.value.kind, node.value.value, node.position));
                }
            }
        }
        return this.#disableDirectives;
    }

    applyInlineConfigComment(comment) {
        const directive = comment.value;
        if (directive.kind === 'disable') {
            this.disableDirectives.push(new Directive(directive.kind, directive.value, comment.position));
        }
    }

    traverse() {
        const visitorKeys = this.visitorKeys;
        const ast = this.ast;
        const steps = [];
        const visit = (node, parent) => {
            if (!node || typeof node.type !== 'string') {
                return;
            }
            steps.push(new VisitNodeStep({
                node,
                parent,
                phase: 'enter',
                args: { node, parent }
            }));
            if (visitorKeys[node.type]) {
                for (const child of visitorKeys[node.type]) {
                    if (node[child]) {
                        if (Array.isArray(node[child])) {
                            for (const item of node[child]) {
                                visit(item, node);
                            }
                        } else {
                            visit(node[child], node);
                        }
                    }
                }
            }
            steps.push(new VisitNodeStep({
                node,
                parent,
                phase: 'exit',
                args: { node, parent }
            }));
        };
        visit(ast, null);
        return steps;
    }
}

export { InlineConfigComment, MarkdownSourceCode };
