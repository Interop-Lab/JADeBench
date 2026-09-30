import {
    ConfigCommentParser,
    Directive,
    TextSourceCodeBase,
    VisitNodeStep,
} from "@eslint/plugin-kit";

const lineEndingPattern = /\r\n|[\r\n]/u;
const htmlCommentPattern = /<!--[\s\S]*?-->/gu;
const configCommentStart =
    /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const htmlComment = /<!--(.*?)-->/gsu;

const commentParser = new ConfigCommentParser();

/**
 * Determines whether one of the lines in a frontmatter block is a title.
 * @param {string} frontmatter The frontmatter text.
 * @param {RegExp | undefined} titlePattern Pattern identifying title lines.
 * @returns {boolean} Whether a title was found.
 */
function frontmatterHasTitle(frontmatter, titlePattern) {
    if (!titlePattern) {
        return false;
    }

    for (const line of frontmatter.split(lineEndingPattern)) {
        if (titlePattern.test(line)) {
            return true;
        }
    }

    return false;
}

/**
 * Replaces non-newline characters inside HTML comments with spaces. Keeping
 * both offsets and line endings intact allows another parser to consume the
 * resulting Markdown without invalidating source locations.
 * @param {string} text Markdown source text.
 * @returns {string} Source text with HTML comments hidden.
 */
function stripHtmlComments(text) {
    return text.replace(htmlCommentPattern, comment =>
        comment.replace(/[^\r\n]/g, " "),
    );
}

class InlineConfigComment {
    value;
    position;

    constructor({ value, position }) {
        this.value = value.trim();
        this.position = position;
    }
}

/**
 * Extracts ESLint configuration comments from a Markdown HTML AST node.
 * @param {{ value: string, position: { start: { offset: number } } }} node Node.
 * @param {MarkdownSourceCode} sourceCode Source-code location provider.
 * @returns {InlineConfigComment[]} Extracted comments.
 */
function extractInlineConfigCommentsFromHTML(node, sourceCode) {
    if (!configCommentStart.test(node.value)) {
        return [];
    }

    const comments = [];
    htmlComment.lastIndex = 0;

    let match;
    while ((match = htmlComment.exec(node.value))) {
        if (!configCommentStart.test(match[0])) {
            continue;
        }

        const startOffset = node.position.start.offset + match.index;
        const endOffset = startOffset + match[0].length;

        comments.push(new InlineConfigComment({
            value: match[1],
            position: {
                start: {
                    ...sourceCode.getLocFromIndex(startOffset),
                    offset: startOffset,
                },
                end: {
                    ...sourceCode.getLocFromIndex(endOffset),
                    offset: endOffset,
                },
            },
        }));
    }

    return comments;
}

class MarkdownSourceCode extends TextSourceCodeBase {
    #steps;
    #parents = new WeakMap();
    #htmlNodes = [];
    #inlineConfigComments;

    ast;

    constructor({ text, ast }) {
        super({ ast, text, lineEndingPattern });
        this.ast = ast;

        // Traversal also records parent relationships and HTML nodes.
        this.traverse();
    }

    getParent(node) {
        return this.#parents.get(node);
    }

    getInlineConfigNodes() {
        if (!this.#inlineConfigComments) {
            this.#inlineConfigComments = this.#htmlNodes.flatMap(node =>
                extractInlineConfigCommentsFromHTML(node, this),
            );
        }

        return this.#inlineConfigComments;
    }

    getDisableDirectives() {
        const problems = [];
        const directives = [];

        this.getInlineConfigNodes().forEach(comment => {
            const { label, value, justification } =
                commentParser.parseDirective(comment.value);

            if (
                label === "eslint-disable" &&
                comment.position.start.line === comment.position.end.line
            ) {
                problems.push({
                    ruleId: null,
                    message: `${label} directive should be on its own line.`,
                    loc: comment.position,
                });
                return;
            }

            switch (label) {
                case "eslint-disable":
                case "eslint-enable":
                case "eslint-disable-line":
                case "eslint-disable-next-line": {
                    const type = label.slice("eslint-".length);
                    directives.push(new Directive({
                        type,
                        node: comment,
                        value,
                        justification,
                    }));
                }
            }
        });

        return { problems, directives };
    }

    applyInlineConfig() {
        const problems = [];
        const configs = [];

        this.getInlineConfigNodes().forEach(comment => {
            const { label, value } = commentParser.parseDirective(comment.value);

            if (label !== "eslint") {
                return;
            }

            const result = commentParser.parseJSONLikeConfig(value);
            if (result.ok) {
                configs.push({
                    config: { rules: result.config },
                    loc: comment.position,
                });
            } else {
                problems.push({
                    ruleId: null,
                    message: result.error.message,
                    loc: comment.position,
                });
            }
        });

        return { configs, problems };
    }

    traverse() {
        if (this.#steps) {
            return this.#steps.values();
        }

        const steps = (this.#steps = []);

        const visit = (node, parent) => {
            this.#parents.set(node, parent);
            steps.push(new VisitNodeStep({
                target: node,
                phase: 1,
                args: [node, parent],
            }));

            if (node.type === "html") {
                this.#htmlNodes.push(node);
            }

            if ("children" in node) {
                node.children.forEach(child => visit(child, node));
            }

            steps.push(new VisitNodeStep({
                target: node,
                phase: 2,
                args: [node, parent],
            }));
        };

        visit(this.ast);
        return steps.values();
    }
}

export { InlineConfigComment, MarkdownSourceCode };
