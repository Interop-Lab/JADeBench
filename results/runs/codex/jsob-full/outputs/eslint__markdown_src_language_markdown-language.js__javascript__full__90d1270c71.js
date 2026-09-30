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
const configCommentStartPattern =
    /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const htmlCommentPattern = /<!--(.*?)-->/gsu;

class InlineConfigComment {
    value;
    position;

    constructor({ value, position }) {
        this.value = value.trim();
        this.position = position;
    }
}

function extractInlineConfigCommentsFromHTML(htmlNode, sourceCode) {
    if (!configCommentStartPattern.test(htmlNode.value)) {
        return [];
    }

    const comments = [];
    let match;

    while ((match = htmlCommentPattern.exec(htmlNode.value))) {
        if (configCommentStartPattern.test(match[0])) {
            const startOffset = match.index + htmlNode.position.start.offset;
            const endOffset = startOffset + match[0].length;

            comments.push(
                new InlineConfigComment({
                    value: match[1].trim(),
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
                }),
            );
        }
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
        super({ ast, text, lineEndingPattern });
        this.ast = ast;
        this.traverse();
    }

    getParent(node) {
        return this.#parents.get(node);
    }

    getInlineConfigNodes() {
        if (!this.#inlineConfigComments) {
            this.#inlineConfigComments = this.#htmlNodes.flatMap(htmlNode =>
                extractInlineConfigCommentsFromHTML(htmlNode, this),
            );
        }

        return this.#inlineConfigComments;
    }

    getDisableDirectives() {
        const problems = [];
        const directives = [];

        this.getInlineConfigNodes().forEach(node => {
            const { label, value, justification } =
                configCommentParser.parseDirective(node.value);

            if (
                label === "eslint-disable-line" &&
                node.position.start.line !== node.position.end.line
            ) {
                problems.push({
                    ruleId: null,
                    message: `${label} comment should not span multiple lines.`,
                    loc: node.position,
                });
                return;
            }

            switch (label) {
                case "eslint-disable":
                case "eslint-enable":
                case "eslint-disable-next-line":
                case "eslint-disable-line":
                    directives.push(
                        new Directive({
                            type: label.slice("eslint-".length),
                            node,
                            value,
                            justification,
                        }),
                    );
            }
        });

        return { problems, directives };
    }

    applyInlineConfig() {
        const problems = [];
        const configs = [];

        this.getInlineConfigNodes().forEach(node => {
            const { label, value } = configCommentParser.parseDirective(node.value);

            if (label === "eslint") {
                const parseResult = configCommentParser.parseJSONLikeConfig(value);

                if (parseResult.ok) {
                    configs.push({
                        config: { rules: parseResult.config },
                        loc: node.position,
                    });
                } else {
                    problems.push({
                        ruleId: null,
                        message: parseResult.error.message,
                        loc: node.position,
                    });
                }
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
            steps.push(
                new VisitNodeStep({
                    target: node,
                    phase: 1,
                    args: [node, parent],
                }),
            );

            if (node.type === "html") {
                this.#htmlNodes.push(node);
            }

            if ("children" in node) {
                node.children.forEach(child => visit(child, node));
            }

            steps.push(
                new VisitNodeStep({
                    target: node,
                    phase: 2,
                    args: [node, parent],
                }),
            );
        };

        visit(this.ast);
        return steps.values();
    }
}

const jsonFrontmatterConfig = {
    type: "json",
    marker: "-",
};

function createParserOptions(mode, languageOptions) {
    const extensions = [];
    const mdastExtensions = [];

    if (mode === "gfm") {
        extensions.push(gfm());
        mdastExtensions.push(gfmFromMarkdown());
    }

    const frontmatterOption = languageOptions?.frontmatter;

    if (frontmatterOption !== false) {
        if (frontmatterOption === "yaml") {
            extensions.push(frontmatter(["yaml"]));
            mdastExtensions.push(frontmatterFromMarkdown(["yaml"]));
        } else if (frontmatterOption === "toml") {
            extensions.push(frontmatter(["toml"]));
            mdastExtensions.push(frontmatterFromMarkdown(["toml"]));
        } else if (frontmatterOption === "json") {
            extensions.push(frontmatter(jsonFrontmatterConfig));
            mdastExtensions.push(frontmatterFromMarkdown(jsonFrontmatterConfig));
        }
    }

    if (languageOptions?.math === true) {
        extensions.push(math());
        mdastExtensions.push(mathFromMarkdown());
    }

    return { extensions, mdastExtensions };
}

const defaultLanguageOptions = {
    frontmatter: false,
    math: false,
};

class MarkdownLanguage {
    fileType = "text";
    lineStart = 1;
    columnStart = 1;
    nodeTypeKey = "type";
    defaultLanguageOptions = defaultLanguageOptions;

    #mode = "commonmark";

    constructor({ mode } = {}) {
        if (mode) {
            this.#mode = mode;
        }
    }

    validateLanguageOptions(languageOptions) {
        const frontmatterOption = languageOptions?.frontmatter;
        const validFrontmatterOptions = new Set([false, "yaml", "toml", "json"]);

        if (
            frontmatterOption !== undefined &&
            !validFrontmatterOptions.has(frontmatterOption)
        ) {
            throw new Error(
                `Invalid language option value \`${frontmatterOption}\` for frontmatter. Expected one of \`false\`, \`"yaml"\`, \`"toml"\`, or \`"json"\`.`,
            );
        }

        const mathOption = languageOptions?.math;

        if (mathOption !== undefined && typeof mathOption !== "boolean") {
            throw new Error(
                `Invalid language option value \`${mathOption}\` for math. Expected a boolean.`,
            );
        }
    }

    parse(file, context) {
        try {
            const parserOptions = createParserOptions(
                this.#mode,
                context?.languageOptions,
            );
            const ast = fromMarkdown(file.body, parserOptions);

            return { ok: true, ast };
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
