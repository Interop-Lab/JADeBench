import { VisitNodeStep, TextSourceCodeBase, ConfigCommentParser, Directive } from '@eslint/plugin-kit';

var commentParser = new ConfigCommentParser(),
    configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u,
    htmlComment = /<!--(.*?)-->/gsu;

class InlineConfigComment {
    value;
    position;
    constructor({ value, position }) {
        this.value = value.trim();
        this.position = position;
    }
}

var lineEndingPattern = /\r\n|[\r\n]/u,
    illegalShorthandTailPattern = /\]\[\s+\]$/u,
    htmlCommentPattern = /<!--[\s\S]*?-->/gu;

function frontmatterHasTitle(text, title) {
    if (!title) return false;
    const lines = text.split(lineEndingPattern);
    for (const line of lines) {
        if (title.test(line)) return true;
    }
    return false;
}

function stripHtmlComments(text) {
    return text.replace(htmlCommentPattern, comment => comment.replace(/[^\r\n]/g, ' '));
}

function extractInlineConfigCommentsFromHTML(text, sourceCode) {
    if (!configCommentStart.test(text.trim())) {
        return [];
    }

    const comments = [];
    let match;
    while ((match = htmlComment.exec(text.trim()))) {
        if (configCommentStart.test(match[1])) {
            const startOffset = match.index + text.trim().indexOf(match[1]);
            const endOffset = startOffset + match[1].length;
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
    ast = void 0;

    constructor({ text, ast }) {
        super({ ast, text, lineEndingPattern });
        this.ast = ast;
        this.#buildTraversalSteps();
    }

    getParent(node) {
        return this.#parents.get(node);
    }

    getInlineConfigComments() {
        if (!this.#inlineConfigComments) {
            this.#inlineConfigComments = this.#htmlNodes.flatMap(node =>
                extractInlineConfigCommentsFromHTML(node, this)
            );
        }
        return this.#inlineConfigComments;
    }

    getDirectives() {
        const problems = [];
        const directives = [];

        this.getInlineConfigComments().forEach(comment => {
            const { label, value, justification } = commentParser.parseDirective(comment.value);

            if (label === 'eslint-disable-next-line' &&
                comment.position.start.line === comment.position.end.line) {
                const problem = {
                    ruleId: null,
                    message: label,
                    line: comment.position.start.line
                };
                problems.push(problem);
                return;
            }

            switch (label) {
                case 'eslint-disable':
                case 'eslint-enable':
                case 'eslint-disable-next-line':
                case 'eslint-disable-line': {
                    const directiveText = label.slice('eslint-'.length);
                    const directive = {
                        label: directiveText,
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

    #buildTraversalSteps() {
        if (this.#steps) {
            return this.#steps.slice();
        }

        const steps = (this.#steps = []);
        const visit = (node, parent) => {
            this.#parents.set(node, parent);

            const enterStep = {
                target: node,
                phase: 1,
                args: [node, parent]
            };
            steps.push(new VisitNodeStep(enterStep));

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

export { InlineConfigComment, MarkdownSourceCode };
