import {
    VisitNodeStep,
    TextSourceCodeBase,
    ConfigCommentParser,
    Directive
} from "@eslint/plugin-kit";

const lineEndingPattern = /\r\n|[\r\n]/u;
const illegalShorthandTailPattern = /\]\[\s+\]$/u;
const htmlCommentPattern = /<!--[\s\S]*?-->/gu;

function frontmatterHasTitle(text, titlePattern) {
    if (!titlePattern) {
        return false;
    }

    for (const line of text.split(lineEndingPattern)) {
        if (titlePattern.test(line)) {
            return true;
        }
    }

    return false;
}

function stripHtmlComments(text) {
    return text.replace(
        htmlCommentPattern,
        comment => comment.replace(/[^\r\n]/g, " ")
    );
}

const commentParser = new ConfigCommentParser();

const configCommentStart =
    /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const htmlComment = /<!--(.*?)-->/gsu;

class InlineConfigComment {
    value;
    position;

    constructor({ value, position }) {
        this.value = value.trim();
        this.position = position;
    }
}

function extractInlineConfigCommentsFromHTML(node, sourceCode) {
    if (!configCommentStart.test(node.value)) {
        return [];
    }

    const comments = [];
    let match;

    while ((match = htmlComment.exec(node.value))) {
        if (!configCommentStart.test(match[0])) {
            continue;
        }

        const startOffset = match.index + node.position.start.offset;
        const endOffset = startOffset + match[0].length;

        comments.push(new InlineConfigComment({
            value: match[1].trim(),
            position: {
                start: {
                    ...sourceCode.getLocFromIndex(startOffset),
                    offset: startOffset
                },
                end: {
                    ...sourceCode.getLocFromIndex(endOffset),
                    offset: endOffset
                }
            }
        }));
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
        super({
            ast,
            text,
            lineEndingPattern
        });

        this.ast = ast;
        this.traverse();
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

    getDisableDirectives() {
        const problems = [];
        const directives = [];

        this.getInlineConfigComments().forEach(comment => {
            const {
                label,
                value,
                justification
            } = commentParser.parseDirective(comment.value);

            if (
                label === "eslint-disable-line" &&
                comment.position.start.line !== comment.position.end.line
            ) {
                problems.push({
                    ruleId: null,
                    message: `${label} comment should not span multiple lines.`,
                    loc: comment.position
                });
                return;
            }

            switch (label) {
                case "eslint-disable":
                case "eslint-enable":
                case "eslint-disable-line":
                case "eslint-disable-next-line":
                    directives.push(new Directive({
                        type: label.slice("eslint-".length),
                        node: comment,
                        value,
                        justification
                    }));
                    break;
            }
        });

        return {
            problems,
            directives
        };
    }

    applyInlineConfig() {
        const problems = [];
        const configs = [];

        this.getInlineConfigComments().forEach(comment => {
            const { label, value } = commentParser.parseDirective(comment.value);

            if (label !== "eslint") {
                return;
            }

            const result = commentParser.parseJSONLikeConfig(value);

            if (result.ok) {
                configs.push({
                    config: {
                        rules: result.config
                    },
                    loc: comment.position
                });
            } else {
                problems.push({
                    ruleId: null,
                    message: result.error.message,
                    loc: comment.position
                });
            }
        });

        return {
            configs,
            problems
        };
    }

    traverse() {
        if (this.#steps) {
            return this.#steps.values();
        }

        const steps = this.#steps = [];

        const visit = (node, parent) => {
            this.#parents.set(node, parent);

            steps.push(new VisitNodeStep({
                target: node,
                phase: 1,
                args: [node, parent]
            }));

            if (node.type === "html") {
                this.#htmlNodes.push(node);
            }

            if ("children" in node) {
                node.children.forEach(child => {
                    visit(child, node);
                });
            }

            steps.push(new VisitNodeStep({
                target: node,
                phase: 2,
                args: [node, parent]
            }));
        };

        visit(this.ast);
        return steps.values();
    }
}

export {
    InlineConfigComment,
    MarkdownSourceCode
};
