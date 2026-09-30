import {
    VisitNodeStep,
    TextSourceCodeBase,
    ConfigCommentParser,
    Directive
} from "@eslint/plugin-kit";
import { fromMarkdown } from "mdast-util-from-markdown";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown } from "mdast-util-math";
import { frontmatter } from "micromark-extension-frontmatter";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";

const lineEndingPattern = /\r\n|[\r\n]/u;
const commentParser = new ConfigCommentParser();
const configCommentStart =
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

function extractInlineConfigCommentsFromHTML(node, sourceCode) {
    if (!configCommentStart.test(node.value)) {
        return [];
    }

    const comments = [];
    let match;

    while ((match = htmlCommentPattern.exec(node.value))) {
        if (!configCommentStart.test(match[0])) {
            continue;
        }

        const startOffset = match.index + node.position.start.offset;
        const endOffset = startOffset + match[0].length;

        comments.push(
            new InlineConfigComment({
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
            })
        );
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

    getInlineConfigNodes() {
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

        this.getInlineConfigNodes().forEach(comment => {
            const { label, value, justification } =
                commentParser.parseDirective(comment.value);

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
                case "eslint-disable-next-line": {
                    const type = label.slice("eslint-".length);

                    directives.push(
                        new Directive({
                            type,
                            node: comment,
                            value,
                            justification
                        })
                    );
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
                    args: [node, parent]
                })
            );

            if (node.type === "html") {
                this.#htmlNodes.push(node);
            }

            if ("children" in node) {
                node.children.forEach(child => {
                    visit(child, node);
                });
            }

            steps.push(
                new VisitNodeStep({
                    target: node,
                    phase: 2,
                    args: [node, parent]
                })
            );
        };

        visit(this.ast);

        return steps.values();
    }
}

const jsonFrontmatterConfig = {
    type: "json",
    marker: "-"
};

function createParserOptions(mode, languageOptions) {
    const extensions = [];
    const mdastExtensions = [];

    if (mode === "gfm") {
        extensions.push(gfm());
        mdastExtensions.push(gfmFromMarkdown());
    }

    const frontmatterType = languageOptions?.frontmatter;

    if (frontmatterType !== false) {
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
    }

    if (languageOptions?.math === true) {
        extensions.push(math());
        mdastExtensions.push(mathFromMarkdown());
    }

    return {
        extensions,
        mdastExtensions
    };
}

const defaultLanguageOptions = {
    frontmatter: false,
    math: false
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
        const frontmatterType = languageOptions?.frontmatter;
        const validFrontmatterTypes = new Set([
            false,
            "yaml",
            "toml",
            "json"
        ]);

        if (
            frontmatterType !== undefined &&
            !validFrontmatterTypes.has(frontmatterType)
        ) {
            throw new Error(
                `Invalid frontmatter value "${frontmatterType}". Expected one of: false, "yaml", "toml", or "json".`
            );
        }

        const mathEnabled = languageOptions?.math;

        if (
            mathEnabled !== undefined &&
            typeof mathEnabled !== "boolean"
        ) {
            throw new Error(
                `Invalid math value "${mathEnabled}". Expected a boolean.`
            );
        }
    }

    parse(file, context) {
        const text = file.body;

        try {
            const parserOptions = createParserOptions(
                this.#mode,
                context?.languageOptions
            );
            const ast = fromMarkdown(text, parserOptions);

            return {
                ok: true,
                ast
            };
        } catch (error) {
            return {
                ok: false,
                errors: [error]
            };
        }
    }

    createSourceCode(file, parseResult) {
        return new MarkdownSourceCode({
            text: file.body,
            ast: parseResult.ast
        });
    }
}

export { MarkdownLanguage };
