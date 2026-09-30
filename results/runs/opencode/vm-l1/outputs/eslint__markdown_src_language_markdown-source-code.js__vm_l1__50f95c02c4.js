import {
    VisitNodeStep,
    TextSourceCodeBase,
    ConfigCommentParser,
    Directive,
} from "@eslint/plugin-kit";

const lineEndingPattern = /\r\n|[\r\n]/u;
const illegalShorthandTailPattern = /\]\[\s+\]$/u;
const htmlCommentPattern = /<!--[\s\S]*?-->/gu;
const configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const htmlComment = /<!--(.*?)-->/gsu;
const commentParser = new ConfigCommentParser();

/** Checks frontmatter after replacing HTML comments with whitespace. */
function frontmatterHasTitle(frontmatter, titlePattern) {
    return titlePattern.test(stripHtmlComments(frontmatter));
}

/** Preserves offsets and line breaks while hiding HTML comment contents. */
function stripHtmlComments(text) {
    return text.replace(htmlCommentPattern, match => match.replace(/[^\r\n]/gu, " "));
}

class InlineConfigComment {
    value;
    position;

    constructor({ value, position }) {
        this.value = value.trim();
        this.position = position;
    }
}

function extractInlineConfigCommentsFromHTML(node, sourceCode) {
    const comments = [];

    for (const match of node.value.matchAll(htmlComment)) {
        if (!configCommentStart.test(match[0])) {
            continue;
        }

        const startOffset = node.position.start.offset + match.index;
        const endOffset = startOffset + match[0].length;
        comments.push(new InlineConfigComment({
            value: match[1],
            position: {
                start: { ...sourceCode.getLocFromIndex(startOffset), offset: startOffset },
                end: { ...sourceCode.getLocFromIndex(endOffset), offset: endOffset },
            },
        }));
    }

    return comments;
}

class MarkdownSourceCode extends TextSourceCodeBase {
    #parents = new WeakMap();
    #inlineConfigNodes;
    #disableDirectives;

    constructor({ text, ast }) {
        super({ ast, text, lineEndingPattern });
    }

    getParent(node) {
        return this.#parents.get(node);
    }

    getInlineConfigNodes() {
        if (!this.#inlineConfigNodes) {
            const comments = [];
            const visit = node => {
                if (node.type === "html") {
                    comments.push(...extractInlineConfigCommentsFromHTML(node, this));
                }
                node.children?.forEach(visit);
            };
            visit(this.ast);
            this.#inlineConfigNodes = comments;
        }
        return this.#inlineConfigNodes;
    }

    getDisableDirectives() {
        if (this.#disableDirectives) {
            return this.#disableDirectives;
        }

        const problems = [];
        const directives = [];

        for (const node of this.getInlineConfigNodes()) {
            const parsed = commentParser.parseDirective(node.value);
            if (!parsed || !/^eslint-(?:enable|disable(?:-next-line|-line)?)$/u.test(parsed.label)) {
                continue;
            }

            directives.push(new Directive({
                type: parsed.label.slice("eslint-".length),
                node,
                value: parsed.value,
                justification: parsed.justification,
            }));
        }

        return (this.#disableDirectives = { problems, directives });
    }

    applyInlineConfig() {
        const configs = [];
        const problems = [];

        for (const node of this.getInlineConfigNodes()) {
            if (!node.value.startsWith("eslint ")) {
                continue;
            }

            const rawConfig = node.value.slice("eslint ".length).trim();
            const normalized = illegalShorthandTailPattern.test(rawConfig)
                ? rawConfig.slice(0, -1)
                : rawConfig;
            const result = commentParser.parseJSONLikeConfig(normalized);

            if (result.ok) {
                configs.push({ config: { rules: result.config }, loc: node.position });
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

    traverse() {
        const steps = [];
        const visit = (node, parent) => {
            if (parent) {
                this.#parents.set(node, parent);
            }
            steps.push(new VisitNodeStep({ target: node, phase: 1, args: [node, parent] }));
            node.children?.forEach(child => visit(child, node));
            steps.push(new VisitNodeStep({ target: node, phase: 2, args: [node, parent] }));
        };
        visit(this.ast, undefined);
        return steps.values();
    }
}

export { InlineConfigComment, MarkdownSourceCode };
