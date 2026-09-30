import { VisitNodeStep, TextSourceCodeBase, ConfigCommentParser, Directive } from '@eslint/plugin-kit';

var lineEndingPattern = /\r\n|[\r\n]/u,
    illegalShorthandTailPattern = /\]\[\s+\]$/u,
    htmlCommentPattern = /<!--[\s\S]*?-->/gu;

var commentParser = new ConfigCommentParser(),
    configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;

function stripHtmlComments(text) {
    return text.replace(htmlCommentPattern, comment => comment.replace(/[^\r\n]/g, ' '));
}

function frontmatterHasTitle(text, frontmatter) {
    if (!frontmatter) {
        return false;
    }
    const lines = text.split(lineEndingPattern);
    for (const line of lines) {
        if (frontmatter.test(line)) {
            return true;
        }
    }
    return false;
}

var htmlComment = /<!--(.*?)-->/gsu;

var InlineConfigComment = class {
    value;
    position;
    constructor({ value, position }) {
        this.value = value.trim();
        this.position = position;
    }
};

function extractInlineConfigCommentsFromHTML(node, sourceCode) {
    if (!configCommentStart.test(node.value)) {
        return [];
    }
    const comments = [];
    let match;
    while (match = htmlComment.exec(node.value)) {
        if (configCommentStart.test(match[0])) {
            const startOffset = match.index + node.position.start.offset;
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

var MarkdownSourceCode = class extends TextSourceCodeBase {
    #steps;
    #parents = new WeakMap();
    #htmlNodes = [];
    #inlineConfigComments;
    #ast = void 0;

    constructor({ text, ast }) {
        super({ ast, text, lineEndingPattern });
        this.#ast = ast;
        this.#steps = this.#traverse();
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

    getInlineConfig() {
        const problems = [];
        const directives = [];
        this.getInlineConfigComments().forEach(comment => {
            const { label, value, justification } = commentParser.parseDirective(comment.value);
            if (label === 'eslint') {
                const parseResult = commentParser.parseListConfig(value);
                if (parseResult.ok) {
                    const config = {};
                    config.config = parseResult.config;
                    const problem = {};
                    problem.config = config;
                    problem.comment = comment;
                    problems.push(problem);
                } else {
                    const problem = {};
                    problem.config = null;
                    problem.message = parseResult.error.message;
                    problem.comment = comment;
                    problems.push(problem);
                }
            } else {
                switch (label) {
                    case 'eslint-disable':
                    case 'eslint-enable':
                    case 'eslint-disable-line':
                    case 'eslint-disable-next-line': {
                        const normalizedLabel = label.slice('eslint-'.length);
                        const directive = {};
                        directive.type = normalizedLabel;
                        directive.node = comment;
                        directive.value = value;
                        directive.justification = justification;
                        directives.push(new Directive(directive));
                    }
                }
            }
        });
        const result = {};
        result.problems = problems;
        result.directives = directives;
        return result;
    }

    applyInlineConfig() {
        const problems = [];
        const directives = [];
        this.getInlineConfigComments().forEach(comment => {
            const { label, value } = commentParser.parseDirective(comment.value);
            if (label === 'eslint') {
                const parseResult = commentParser.parseListConfig(value);
                if (parseResult.ok) {
                    const config = {};
                    config.config = parseResult.config;
                    const problem = {};
                    problem.config = config;
                    problem.comment = comment;
                    problems.push(problem);
                } else {
                    const problem = {};
                    problem.config = null;
                    problem.message = parseResult.error.message;
                    problem.comment = comment;
                    problems.push(problem);
                }
            } else {
                switch (label) {
                    case 'eslint-disable':
                    case 'eslint-enable':
                    case 'eslint-disable-line':
                    case 'eslint-disable-next-line': {
                        const normalizedLabel = label.slice('eslint-'.length);
                        const directive = {};
                        directive.type = normalizedLabel;
                        directive.node = comment;
                        directive.value = value;
                        directives.push(new Directive(directive));
                    }
                }
            }
        });
        const result = {};
        result.problems = problems;
        result.directives = directives;
        return result;
    }

    traverse() {
        if (this.#steps) {
            return this.#steps.slice();
        }
        const steps = this.#steps = [];
        const visit = (node, parent) => {
            this.#parents.set(node, parent);
            const enterStep = {};
            enterStep.target = node;
            enterStep.phase = 1;
            enterStep.args = [node, parent];
            steps.push(new VisitNodeStep(enterStep));
            if (node.type === 'html') {
                this.#htmlNodes.push(node);
            }
            if ('children' in node) {
                const childParent = node;
                childParent.children.forEach(child => {
                    visit(child, childParent);
                });
            }
            const exitStep = {};
            exitStep.target = node;
            exitStep.phase = 2;
            exitStep.args = [node, parent];
            steps.push(new VisitNodeStep(exitStep));
        };
        visit(this.#ast, null);
        return steps.slice();
    }
};

export { InlineConfigComment, MarkdownSourceCode };
