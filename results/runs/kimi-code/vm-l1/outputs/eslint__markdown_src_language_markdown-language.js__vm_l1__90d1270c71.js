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
const configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const htmlComment = /<!--(.*?)-->/gsu;
const commentParser = new ConfigCommentParser();
const jsonFrontmatterConfig = { type: "json", marker: "-" };

class InlineConfigComment {
    value;
    position;

    constructor(value, position) {
        this.value = value;
        this.position = position;
    }
}

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
        comments.push(new InlineConfigComment(match[1].trim(), {
            start: {
                ...sourceCode.getLocFromIndex(startOffset),
                offset: startOffset,
            },
            end: {
                ...sourceCode.getLocFromIndex(endOffset),
                offset: endOffset,
            },
        }));
    }

    return comments;
}

class MarkdownSourceCode extends TextSourceCodeBase {
    #parents = new WeakMap();
    #inlineConfigNodes;
    #disableDirectives;
    ast;

    constructor({ text, ast }) {
        super({ ast, text, lineEndingPattern });
        this.ast = ast;
    }

    getParent(node) {
        return this.#parents.get(node);
    }

    getInlineConfigNodes() {
        if (this.#inlineConfigNodes) {
            return this.#inlineConfigNodes;
        }

        this.#inlineConfigNodes = [...this.traverse()]
            .filter(step => step.phase === 1 && step.target.type === "html")
            .flatMap(step => extractInlineConfigCommentsFromHTML(step.target, this));
        return this.#inlineConfigNodes;
    }

    getDisableDirectives() {
        if (this.#disableDirectives) {
            return this.#disableDirectives;
        }

        const directives = [];
        const problems = [];

        for (const node of this.getInlineConfigNodes()) {
            const parsed = commentParser.parseDirective(node.value);
            if (!parsed) {
                continue;
            }

            if (parsed.label === "eslint-disable-line" && node.position.start.line !== node.position.end.line) {
                problems.push({
                    ruleId: null,
                    message: `${parsed.label} comment should not span multiple lines.`,
                    loc: node.position,
                });
                continue;
            }

            if (!["eslint-disable", "eslint-enable", "eslint-disable-next-line", "eslint-disable-line"].includes(parsed.label)) {
                continue;
            }

            directives.push(new Directive({
                type: parsed.label.slice("eslint-".length),
                node,
                value: parsed.value,
                justification: parsed.justification,
            }));
        }

        this.#disableDirectives = { directives, problems };
        return this.#disableDirectives;
    }

    applyInlineConfig() {
        const configs = [];
        const problems = [];

        for (const node of this.getInlineConfigNodes()) {
            const parsed = commentParser.parseDirective(node.value);
            if (!parsed || parsed.label !== "eslint") {
                continue;
            }

            const result = commentParser.parseJSONLikeConfig(parsed.value);
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

    *traverse() {
        const visit = function* (node, parent) {
            this.#parents.set(node, parent);
            yield new VisitNodeStep({ target: node, phase: 1, args: [node, parent] });
            if (Array.isArray(node.children)) {
                for (const child of node.children) {
                    yield* visit.call(this, child, node);
                }
            }
            yield new VisitNodeStep({ target: node, phase: 2, args: [node, parent] });
        };

        yield* visit.call(this, this.ast, undefined);
    }
}

function createParserOptions(languageOptions, mode) {
    const extensions = [];
    const mdastExtensions = [];

    if (mode === "gfm") {
        extensions.push(gfm());
        mdastExtensions.push(gfmFromMarkdown());
    }

    if (languageOptions.frontmatter !== false) {
        if (languageOptions.frontmatter === "yaml") {
            extensions.push(frontmatter("yaml"));
            mdastExtensions.push(frontmatterFromMarkdown("yaml"));
        } else if (languageOptions.frontmatter === "toml") {
            extensions.push(frontmatter("toml"));
            mdastExtensions.push(frontmatterFromMarkdown("toml"));
        } else if (languageOptions.frontmatter === "json") {
            extensions.push(frontmatter(jsonFrontmatterConfig));
            mdastExtensions.push(frontmatterFromMarkdown(jsonFrontmatterConfig));
        }
    }

    if (languageOptions.math === true) {
        extensions.push(math());
        mdastExtensions.push(mathFromMarkdown());
    }

    return { extensions, mdastExtensions };
}

class MarkdownLanguage {
    fileType = "text";
    lineStart = 1;
    columnStart = 1;
    nodeTypeKey = "type";
    defaultLanguageOptions = { frontmatter: false, math: false };
    #mode;

    constructor({ mode }) {
        this.#mode = mode;
    }

    validateLanguageOptions(languageOptions) {
        if (languageOptions.frontmatter !== undefined) {
            const allowedFrontmatter = new Set([false, "yaml", "toml", "json"]);
            if (!allowedFrontmatter.has(languageOptions.frontmatter)) {
                throw new Error(
                    `Invalid language option value \`${languageOptions.frontmatter}\` for frontmatter. `
                    + 'Expected one of `false`, `"yaml"`, `"toml"`, or `"json"`.',
                );
            }
        }

        if (languageOptions.math !== undefined && typeof languageOptions.math !== "boolean") {
            throw new Error(
                `Invalid language option value \`${languageOptions.math}\` for math. Expected a boolean.`,
            );
        }
    }

    parse(file, context) {
        try {
            const parserOptions = createParserOptions(context.languageOptions, this.#mode);
            const ast = fromMarkdown(file.body, parserOptions);
            return { ok: true, ast };
        } catch (error) {
            return { ok: false, errors: [error] };
        }
    }

    createSourceCode(file, parseResult) {
        return new MarkdownSourceCode({ text: file.body, ast: parseResult.ast });
    }
}

export { MarkdownLanguage };
