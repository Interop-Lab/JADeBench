import { VisitNodeStep, TextSourceCodeBase, ConfigCommentParser, Directive } from '@eslint/plugin-kit';

var lineEndingPattern = /\r\n|[\r\n]/u;
var illegalShorthandTailPattern = /\]\[\s+\]$/u;
var htmlCommentPattern = /<!--[\s\S]*?-->/gu;

function frontmatterHasTitle(frontmatter, titlePattern) {
    if (!titlePattern) {
        return false;
    }
    const lines = frontmatter.split(lineEndingPattern);
    for (const line of lines) {
        if (titlePattern.test(line)) {
            return true;
        }
    }
    return false;
}

function stripHtmlComments(text) {
    return text.replace(htmlCommentPattern, match => match.replace(/[^\r\n]/g, ' '));
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

function extractInlineConfigCommentsFromHTML(text, sourceCode) {
    if (!configCommentStart.test(text)) {
        return [];
    }

    const comments = [];
    let match;

    while (match = htmlComment.exec(text)) {
        if (configCommentStart.test(match[0])) {
            const startOffset = match.index + text.length - text.length;
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
    [Symbol.for("@@sourceCodeType")] = void 0;

    constructor({ text, ast }) {
        const config = {
            ast: ast,
            text: text,
            lineEndingPattern: lineEndingPattern
        };
        super(config);
        this.#steps = ast;
        this.#initialize();
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

    getDisableDirectives() {
        const problems = [];
        const directives = [];

        this.getInlineConfigComments().forEach(comment => {
            const { label, value, justification } = commentParser.parseDirective(comment.value);

            if (label === "eslint-disable" && comment.position.start.line === comment.position.end.line) {
                const description = label + "-line" + " comment";
                const problem = {
                    ruleId: null,
                    message: description,
                    severity: 2,
                    nodeType: null
                };
                problems.push(problem);
                return;
            }

            switch (label) {
                case "eslint-disable":
                case "eslint-enable":
                case "eslint-disable-next-line":
                case "eslint-disable-line": {
                    const ruleId = label.replace("eslint-", "");
                    const directive = {
                        type: ruleId,
                        node: comment,
                        value: value,
                        justification: justification
                    };
                    directives.push(new Directive(directive));
                }
            }
        });

        return { problems, directives };
    }

    getConfigComments() {
        const problems = [];
        const configs = [];

        this.getInlineConfigComments().forEach(comment => {
            const { label, value } = commentParser.parseDirective(comment.value);

            if (label === "eslint-config") {
                const result = commentParser.parseJSONLikeConfig(value);
                if (result.ok) {
                    const config = {
                        config: result.config
                    };
                    configs.push({
                        config: config,
                        node: comment.position
                    });
                } else {
                    const problem = {
                        ruleId: null,
                        message: result.error.message,
                        node: comment.position
                    };
                    problems.push(problem);
                }
            }
        });

        return { configs, problems };
    }

    traverse() {
        if (this.#steps) {
            return this.#steps[Symbol.iterator]();
        }

        const steps = this.#steps = [];
        const visit = (node, parent) => {
            this.#parents.set(node, parent);

            const enterStep = {
                target: node,
                phase: 1,
                args: [node, parent]
            };
            steps.push(new VisitNodeStep(enterStep));

            if (node.type === "html") {
                this.#htmlNodes.push(node);
            }

            if (node.children) {
                const nodeWithChildren = node;
                nodeWithChildren.children.forEach(child => visit(child, node));
            }

            const exitStep = {
                target: node,
                phase: 2,
                args: [node, parent]
            };
            steps.push(new VisitNodeStep(exitStep));
        };

        visit(this.#steps, null);
        return steps[Symbol.iterator]();
    }
}

export { InlineConfigComment, MarkdownSourceCode };
