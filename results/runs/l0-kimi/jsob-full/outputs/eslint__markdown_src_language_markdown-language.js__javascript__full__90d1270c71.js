import { VisitNodeStep, TextSourceCodeBase, ConfigCommentParser, Directive } from '@eslint/plugin-kit';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { mathFromMarkdown } from 'mdast-util-math';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfm } from 'micromark-extension-gfm';
import { math } from 'micromark-extension-math';

const lineEndingPattern = /\r\n|[\r\n]/u;
const illegalShorthandTailPattern = /\]\[\s+\]$/u;
const htmlCommentPattern = /<!--[\s\S]*?-->/gu;

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

const commentParser = new ConfigCommentParser();
const configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const htmlComment = /<!--(.*?)-->/gsu;

class InlineConfigComment {
    value;
    position;

    constructor({ value, position }) {
        this.value = value.trim();
        this.position = position;
    }
}

function extractInlineConfigCommentsFromHTML(text, locationCalculator) {
    if (!configCommentStart.test(text.value)) {
        return [];
    }
    const comments = [];
    let match;
    while (match = htmlComment.exec(text.value)) {
        if (configCommentStart.test(match[0])) {
            const startOffset = match.index + text.range[0];
            const endOffset = startOffset + match[0].length;
            comments.push(new InlineConfigComment({
                value: match[1].trim(),
                position: {
                    start: { ...locationCalculator.getLocFromIndex(startOffset), offset: startOffset },
                    end: { ...locationCalculator.getLocFromIndex(endOffset), offset: endOffset }
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
    [Symbol.for("eslint.SourceCode")] = void 0;

    constructor({ text, ast }) {
        super({ ast, text, lineEndingPattern });
        this.#steps = void 0;
        this.ast = ast;
        this.getInlineConfigComments();
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
                const message = label + " without -- rule names at line " + comment.position.start.line + ": " + value;
                problems.push({ ruleId: null, message, position: comment.position });
                return;
            }
            switch (label) {
                case "eslint-disable":
                case "eslint-enable":
                case "eslint-disable-next-line":
                case "eslint-disable-line": {
                    const ruleIds = label.slice("eslint-".length).split("-");
                    directives.push(new Directive({ ruleIds, comment, value, justification }));
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
            if (label === "eslint") {
                const result = commentParser.parseJSONLikeConfig(value);
                if (result.ok) {
                    configs.push({ config: result.config, position: comment.position });
                } else {
                    problems.push({ ruleId: null, message: result.error.message, position: comment.position });
                }
            }
        });
        return { configs, problems };
    }

    [Symbol.for("eslint.VisitorKeys")]() {
        if (this.#steps) {
            return this.#steps[Symbol.for("eslint.VisitorKeys")]();
        }
        const steps = [];
        const visit = (node, parent) => {
            this.#parents.set(node, parent);
            const enterStep = { type: node, phase: 1, args: [node, parent] };
            steps.push(new VisitNodeStep(enterStep));
            if (node.type === "html") {
                this.#htmlNodes.push(node);
            }
            if (node.children) {
                node.children.forEach(child => visit(child, node));
            }
            const exitStep = { type: node, phase: 2, args: [node, parent] };
            steps.push(new VisitNodeStep(exitStep));
        };
        visit(this.ast);
        return steps[Symbol.for("eslint.VisitorKeys")]();
    }
}

const jsonFrontmatterConfig = {
    marker: { open: "{", close: "}" },
    type: "-"
};

function createParserOptions(mode, options) {
    const extensions = [];
    const mdastExtensions = [];
    if (mode === "gfm") {
        extensions.push(gfm());
        mdastExtensions.push(gfmFromMarkdown());
    }
    const frontmatterOption = options?.frontmatter;
    if (frontmatterOption !== false) {
        if (frontmatterOption === "yaml") {
            extensions.push(frontmatter(["yaml"]));
            mdastExtensions.push(frontmatterFromMarkdown(["yaml"]));
        } else if (frontmatterOption === "toml") {
            extensions.push(frontmatter(["toml"]));
            mdastExtensions.push(frontmatterFromMarkdown(["toml"]));
        } else {
            extensions.push(frontmatter(jsonFrontmatterConfig));
            mdastExtensions.push(frontmatterFromMarkdown(jsonFrontmatterConfig));
        }
    }
    const mathOption = options?.math;
    if (mathOption === true) {
        extensions.push(math());
        mdastExtensions.push(mathFromMarkdown());
    }
    return { extensions, mdastExtensions };
}

const defaultOptions = {
    frontmatter: false,
    math: false
};

class MarkdownLanguage {
    [Symbol.for("eslint.Language")] = "markdown";
    fileType = 0x639 + 0x1 * 0x1424 + 0x1c * -0xf1;
    lineStartPattern = 0x1533 + 0x1fe8 * 0x1 + 0x1a8d * -0x2;
    [Symbol.for("eslint.LanguageOptions")] = defaultOptions;
    #mode = "commonmark";

    constructor({ mode } = {}) {
        if (mode) {
            this.#mode = mode;
        }
    }

    [Symbol.for("eslint.validateLanguageOptions")](options) {
        const frontmatterOption = options?.frontmatter;
        const validFrontmatter = new Set([false, "yaml", "toml", "json"]);
        if (frontmatterOption !== void 0 && !validFrontmatter.has(frontmatterOption)) {
            throw new Error("Expected frontmatter to be false, \"yaml\", \"toml\", or \"json\", but got " + frontmatterOption + ".");
        }
        const mathOption = options?.math;
        if (mathOption !== void 0 && typeof mathOption !== "boolean") {
            throw new Error("Expected math to be a boolean, but got " + mathOption + ".");
        }
    }

    [Symbol.for("eslint.parse")](code, options) {
        const text = code.text;
        try {
            const parserOptions = createParserOptions(this.#mode, options?.languageOptions);
            const ast = fromMarkdown(text, parserOptions);
            return { ok: true, ast };
        } catch (error) {
            return { ok: false, errors: [error] };
        }
    }

    [Symbol.for("eslint.createSourceCode")](parseResult, context) {
        return new MarkdownSourceCode({
            text: parseResult.ast,
            ast: context.ast
        });
    }
}

export { MarkdownLanguage };
