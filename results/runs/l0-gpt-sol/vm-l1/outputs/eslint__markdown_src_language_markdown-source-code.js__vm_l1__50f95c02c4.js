import {
    VisitNodeStep,
    TextSourceCodeBase,
    ConfigCommentParser,
    Directive
} from "@eslint/plugin-kit";

const lineEndingPattern = /\r\n|[\r\n]/u;
const illegalShorthandTailPattern = /\]\[\s+\]$/u;
const htmlCommentPattern = /<!--[\s\S]*?-->/gu;
const configCommentStart =
    /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const htmlComment = /<!--(.*?)-->/gsu;
const commentParser = new ConfigCommentParser();

function stripHtmlComments(text) {
    return text.replace(htmlCommentPattern, "");
}

function frontmatterHasTitle(frontmatter, language) {
    const text = stripHtmlComments(frontmatter);

    if (language === "yaml") {
        return /^\s*title\s*:/mu.test(text);
    }

    if (language === "toml") {
        return /^\s*title\s*=/mu.test(text);
    }

    return /^\s*title\s*(?::|=)/mu.test(text);
}

function createLineStarts(text) {
    const starts = [0];

    lineEndingPattern.lastIndex = 0;

    let match;
    while ((match = lineEndingPattern.exec(text)) !== null) {
        starts.push(match.index + match[0].length);
    }

    return starts;
}

function getLocationFromOffset(lineStarts, offset) {
    let low = 0;
    let high = lineStarts.length;

    while (low + 1 < high) {
        const middle = (low + high) >> 1;

        if (lineStarts[middle] <= offset) {
            low = middle;
        } else {
            high = middle;
        }
    }

    return {
        line: low + 1,
        column: offset - lineStarts[low]
    };
}

class InlineConfigComment {
    value;
    loc;

    constructor({ value, loc }) {
        this.value = value;
        this.loc = loc;
    }
}

function extractInlineConfigCommentsFromHTML(node, sourceText) {
    const comments = [];
    const nodeText = typeof node.value === "string" ? node.value : "";
    const nodeOffset = node.position?.start?.offset ?? 0;
    const lineStarts = createLineStarts(sourceText);

    htmlComment.lastIndex = 0;

    let match;
    while ((match = htmlComment.exec(nodeText)) !== null) {
        if (!configCommentStart.test(match[0])) {
            continue;
        }

        const startOffset = nodeOffset + match.index;
        const endOffset = startOffset + match[0].length;

        comments.push(new InlineConfigComment({
            value: match[1],
            loc: {
                start: getLocationFromOffset(lineStarts, startOffset),
                end: getLocationFromOffset(lineStarts, endOffset)
            }
        }));
    }

    return comments;
}

function normalizeProblem(error, node) {
    return {
        ruleId: null,
        message: error?.message ?? String(error),
        loc: error?.loc ?? node.loc
    };
}

class MarkdownSourceCode extends TextSourceCodeBase {
    #inlineConfigNodes;
    #parents = new WeakMap();
    #htmlNodes = [];
    #disableDirectives;

    ast;

    constructor({ text, ast }) {
        super({
            ast,
            text,
            lineEndingPattern
        });

        this.ast = ast;
    }

    *traverse() {
        const visit = function* (sourceCode, node, parent) {
            if (parent !== null && node && typeof node === "object") {
                sourceCode.#parents.set(node, parent);
            }

            if (node?.type === "html") {
                sourceCode.#htmlNodes.push(node);
            }

            yield new VisitNodeStep({
                target: node,
                phase: 1,
                args: [node, parent]
            });

            if (Array.isArray(node?.children)) {
                for (const child of node.children) {
                    yield* visit(sourceCode, child, node);
                }
            }

            yield new VisitNodeStep({
                target: node,
                phase: 2,
                args: [node, parent]
            });
        };

        this.#htmlNodes = [];
        yield* visit(this, this.ast, null);
    }

    getInlineConfigNodes() {
        if (this.#inlineConfigNodes === undefined) {
            const htmlNodes = this.#htmlNodes.length
                ? this.#htmlNodes
                : this.#collectHTMLNodes();

            this.#inlineConfigNodes = htmlNodes.flatMap(node =>
                extractInlineConfigCommentsFromHTML(node, this.text)
            );
        }

        return this.#inlineConfigNodes;
    }

    getDisableDirectives() {
        if (this.#disableDirectives !== undefined) {
            return this.#disableDirectives;
        }

        const directives = [];
        const problems = [];

        for (const node of this.getInlineConfigNodes()) {
            const parsed = commentParser.parseDirective(node.value);
            const { label, value, justification } = parsed;

            if (
                label !== "eslint-disable" &&
                label !== "eslint-enable" &&
                label !== "eslint-disable-line" &&
                label !== "eslint-disable-next-line"
            ) {
                continue;
            }

            if (
                typeof value === "string" &&
                illegalShorthandTailPattern.test(value)
            ) {
                problems.push({
                    ruleId: null,
                    message: "Unexpected whitespace between brackets in directive.",
                    loc: node.loc
                });
                continue;
            }

            directives.push(new Directive({
                type: label,
                node,
                value,
                justification
            }));
        }

        this.#disableDirectives = { directives, problems };
        return this.#disableDirectives;
    }

    applyInlineConfig() {
        const configs = [];
        const problems = [];

        for (const node of this.getInlineConfigNodes()) {
            const { label, value } = commentParser.parseDirective(node.value);

            if (label !== "eslint") {
                continue;
            }

            const result = commentParser.parseJSONLikeConfig(value);

            if (result.ok) {
                configs.push({
                    config: result.config,
                    loc: node.loc
                });
                continue;
            }

            if (Array.isArray(result.errors)) {
                for (const error of result.errors) {
                    problems.push(normalizeProblem(error, node));
                }
            } else {
                problems.push(normalizeProblem(result.error, node));
            }
        }

        return { configs, problems };
    }

    getParent(node) {
        return this.#parents.get(node);
    }

    #collectHTMLNodes() {
        const nodes = [];
        const stack = [this.ast];

        while (stack.length > 0) {
            const node = stack.pop();

            if (!node || typeof node !== "object") {
                continue;
            }

            if (node.type === "html") {
                nodes.push(node);
            }

            if (Array.isArray(node.children)) {
                for (let index = node.children.length - 1; index >= 0; index--) {
                    const child = node.children[index];
                    this.#parents.set(child, node);
                    stack.push(child);
                }
            }
        }

        this.#htmlNodes = nodes;
        return nodes;
    }
}

export {
    InlineConfigComment,
    MarkdownSourceCode
};
