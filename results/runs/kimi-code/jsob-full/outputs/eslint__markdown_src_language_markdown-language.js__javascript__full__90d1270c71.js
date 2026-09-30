import {
    ConfigCommentParser,
    Directive,
    TextSourceCodeBase,
    VisitNodeStep,
} from "@eslint/plugin-kit";
import { fromMarkdown } from "mdast-util-from-markdown";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown } from "mdast-util-math";
import { frontmatter } from "micromark-extension-frontmatter";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";

const lineEndingPattern = /\r\n|[\r\n]/u;
const configCommentParser = new ConfigCommentParser();
const configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const htmlCommentPattern = /<!--(.*?)-->/gsu;

const jsonFrontmatterConfig = {
    type: "json",
    marker: "-",
};

class InlineConfigComment {
    value;
    position;

    constructor({ value, position }) {
        this.value = value.trim();
        this.position = position;
    }
}

function createParserOptions(mode, languageOptions) {
    const extensions = [];
    const mdastExtensions = [];

    if (mode === "gfm") {
        extensions.push(gfm());
        mdastExtensions.push(gfmFromMarkdown());
    }

    const frontmatterType = languageOptions?.frontmatter;
    if (frontmatterType === "yaml") {
        extensions.push(frontmatter(["yaml"]));
        mdastExtensions.push(frontmatterFromMarkdown(["yaml"]));
    } else if (frontmatterType === "toml") {
        extensions.push(frontmatter(["toml"]));
        mdastExtensions.push(frontmatterFromMarkdown(["toml"]));
    } else if (frontmatterType === "json") {
        extensions.push(frontmatter(jsonFrontmatterConfig));
        mdastExtensions.push(frontmatterFromMarkdown(jsonFrontmatterConfig));
    }

    if (languageOptions?.math === true) {
        extensions.push(math());
        mdastExtensions.push(mathFromMarkdown());
    }

    return { extensions, mdastExtensions };
}

function walk(node, parent, enter, leave) {
    enter(node, parent);
    if (Array.isArray(node.children)) {
        for (const child of node.children) {
            walk(child, node, enter, leave);
        }
    }
    leave(node, parent);
}

function extractInlineConfigComments(htmlNode, sourceCode) {
    if (!configCommentStart.test(htmlNode.value)) {
        return [];
    }

    const comments = [];
    let match;
    htmlCommentPattern.lastIndex = 0;

    while ((match = htmlCommentPattern.exec(htmlNode.value))) {
        if (!configCommentStart.test(match[0])) {
            continue;
        }

        const startOffset = match.index + htmlNode.position.start.offset;
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
    #steps;
    #parents = new WeakMap();
    #htmlNodes = [];
    #inlineConfigComments;

    constructor({ text, ast }) {
        super({ text, ast, lineEndingPattern });
        this.#buildTraversal();
    }

    getParent(node) {
        return this.#parents.get(node);
    }

    getInlineConfigNodes() {
        if (!this.#inlineConfigComments) {
            this.#inlineConfigComments = this.#htmlNodes.flatMap(node =>
                extractInlineConfigComments(node, this),
            );
        }
        return this.#inlineConfigComments;
    }

    getDisableDirectives() {
        const problems = [];
        const directives = [];

        for (const comment of this.getInlineConfigNodes()) {
            const { label, value, justification } = configCommentParser.parseDirective(comment.value);
            if (!label) {
                continue;
            }

            if (label === "eslint-disable" && comment.position.start.line !== comment.position.end.line) {
                problems.push({
                    ruleId: null,
                    message: "eslint-disable directives must not span multiple lines.",
                    loc: comment.position,
                });
                continue;
            }

            if (["eslint-disable", "eslint-enable", "eslint-disable-next-line", "eslint-disable-line"].includes(label)) {
                directives.push(new Directive({
                    type: label.slice("eslint-".length),
                    node: comment,
                    value,
                    justification,
                }));
            }
        }

        return { problems, directives };
    }

    applyInlineConfig() {
        const problems = [];
        const configs = [];

        for (const comment of this.getInlineConfigNodes()) {
            const { label, value } = configCommentParser.parseDirective(comment.value);
            if (label !== "eslint") {
                continue;
            }

            const result = configCommentParser.parseJSONLikeConfig(value);
            if (result.ok) {
                configs.push({ config: { rules: result.config }, loc: comment.position });
            } else {
                problems.push({ ruleId: null, message: result.error.message, loc: comment.position });
            }
        }

        return { problems, configs };
    }

    #buildTraversal() {
        const steps = [];
        walk(
            this.ast,
            null,
            (node, parent) => {
                if (parent) {
                    this.#parents.set(node, parent);
                }
                if (node.type === "html") {
                    this.#htmlNodes.push(node);
                }
                steps.push(new VisitNodeStep({ target: node, phase: 1, args: [node] }));
            },
            node => steps.push(new VisitNodeStep({ target: node, phase: 2, args: [node] })),
        );
        this.#steps = steps;
    }

    traverse() {
        return this.#steps.values();
    }
}

class MarkdownLanguage {
    fileType = "text";
    lineStart = 1;
    columnStart = 1;
    nodeTypeKey = "type";
    defaultLanguageOptions = {
        frontmatter: false,
        math: false,
    };

    #mode = "commonmark";

    constructor({ mode } = {}) {
        if (mode) {
            this.#mode = mode;
        }
    }

    validateLanguageOptions(languageOptions) {
        const frontmatterType = languageOptions?.frontmatter;
        const validFrontmatterTypes = new Set([false, "yaml", "toml", "json"]);
        if (frontmatterType !== undefined && !validFrontmatterTypes.has(frontmatterType)) {
            throw new Error(`Invalid frontmatter value ${JSON.stringify(frontmatterType)}. Expected false, "yaml", "toml", or "json".`);
        }

        const mathEnabled = languageOptions?.math;
        if (mathEnabled !== undefined && typeof mathEnabled !== "boolean") {
            throw new Error(`Invalid math value ${JSON.stringify(mathEnabled)}. Expected a boolean.`);
        }
    }

    parse(file, { languageOptions } = {}) {
        try {
            const parserOptions = createParserOptions(this.#mode, languageOptions);
            return {
                ok: true,
                ast: fromMarkdown(file.body, parserOptions),
            };
        } catch (error) {
            return { ok: false, errors: [error] };
        }
    }

    createSourceCode(file, parseResult) {
        return new MarkdownSourceCode({
            text: file.body,
            ast: parseResult.ast,
        });
    }
}

export { MarkdownLanguage };
