import {
    VisitNodeStep,
    TextSourceCodeBase,
    ConfigCommentParser,
    Directive,
} from "@eslint/plugin-kit";

const lineEndingPattern = /\r\n|[\r\n]/u;
const htmlCommentPattern = /<!--[\s\S]*?-->/gu;
const configCommentPattern = /<!--\s*(eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s[\s\S]*?)?)\s*-->/gu;
const commentParser = new ConfigCommentParser();

function stripHtmlComments(text) {
    return text.replace(htmlCommentPattern, comment => " ".repeat(comment.length));
}

function offsetPosition(position, text, offset) {
    let line = position.line;
    let column = position.column;

    const prefix = text.slice(0, offset);
    for (let index = 0; index < prefix.length; index++) {
        const character = prefix[index];
        if (character === "\r") {
            if (prefix[index + 1] === "\n") {
                index++;
            }
            line++;
            column = 1;
        } else if (character === "\n") {
            line++;
            column = 1;
        } else {
            column++;
        }
    }

    return {
        line,
        column,
        offset: position.offset + offset,
    };
}

class InlineConfigComment {
    value;
    position;

    constructor({ value, position }) {
        this.value = value.trim();
        this.position = position;
    }
}

function extractInlineConfigCommentsFromHTML(value, position) {
    const comments = [];

    for (const match of value.matchAll(configCommentPattern)) {
        const startOffset = match.index;
        const endOffset = startOffset + match[0].length;
        comments.push(new InlineConfigComment({
            value: match[1],
            position: position && {
                start: offsetPosition(position.start, value, startOffset),
                end: offsetPosition(position.start, value, endOffset),
            },
        }));
    }

    return comments;
}

function childrenOf(node) {
    return Array.isArray(node.children) ? node.children : [];
}

class MarkdownSourceCode extends TextSourceCodeBase {
    #parents = new WeakMap();
    #inlineConfigNodes;

    constructor({ text, ast }) {
        super({ text, ast, lineEndingPattern });

        const visit = node => {
            for (const child of childrenOf(node)) {
                this.#parents.set(child, node);
                visit(child);
            }
        };
        visit(ast);
    }

    getParent(node) {
        return this.#parents.get(node);
    }

    getInlineConfigNodes() {
        if (!this.#inlineConfigNodes) {
            this.#inlineConfigNodes = [];
            for (const step of this.traverse()) {
                if (step.phase === 1 && step.target.type === "html") {
                    this.#inlineConfigNodes.push(
                        ...extractInlineConfigCommentsFromHTML(
                            step.target.value,
                            step.target.position,
                        ),
                    );
                }
            }
        }

        return this.#inlineConfigNodes;
    }

    getDisableDirectives() {
        const problems = [];
        const directives = [];

        for (const node of this.getInlineConfigNodes()) {
            const parsed = commentParser.parseDirective(node.value);
            if (!parsed) {
                continue;
            }

            const type = parsed.label.slice("eslint-".length);
            if (
                type !== "disable" &&
                type !== "enable" &&
                type !== "disable-line" &&
                type !== "disable-next-line"
            ) {
                continue;
            }

            directives.push(new Directive({
                type,
                node,
                value: parsed.value,
                justification: parsed.justification,
            }));
        }

        return { problems, directives };
    }

    applyInlineConfig() {
        const configs = [];
        const problems = [];

        for (const node of this.getInlineConfigNodes()) {
            if (!/^eslint(?:\s|$)/u.test(node.value)) {
                continue;
            }

            const value = node.value.slice("eslint".length).trim();
            const result = commentParser.parseJSONLikeConfig(value);
            if (result.ok) {
                configs.push({
                    config: { rules: result.config },
                    loc: node.position,
                });
            } else {
                problems.push({
                    ruleId: null,
                    message: result.error.message,
                    loc: node.position,
                });
            }
        }

        return { configs, problems };
    }

    *traverse() {
        const visit = function* (node, parent) {
            yield new VisitNodeStep({
                target: node,
                phase: 1,
                args: [node, parent],
            });

            for (const child of childrenOf(node)) {
                yield* visit(child, node);
            }

            yield new VisitNodeStep({
                target: node,
                phase: 2,
                args: [node, parent],
            });
        };

        yield* visit(this.ast, undefined);
    }
}

export { InlineConfigComment, MarkdownSourceCode };
