import { VisitNodeStep, TextSourceCodeBase, ConfigCommentParser, Directive } from '@eslint/plugin-kit';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { mathFromMarkdown } from 'mdast-util-math';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfm } from 'micromark-extension-gfm';
import { math } from 'micromark-extension-math';

var lineEndingPattern = /\r\n|[\r\n]/u;
var illegalShorthandTailPattern = /\]\[\s+\]$/u;
var htmlCommentPattern = /<!--[\s\S]*?-->/gu;

function frontmatterHasTitle(text, frontmatter) {
    if (!frontmatter) {
        return false;
    }
    const lines = text.split(lineEndingPattern);
    for (const line of lines) {
        if (frontmatter.test(line)) {
            return true;
        }
    }
    return false;
}

function stripHtmlComments(text) {
    return text.replace(htmlCommentPattern, match => match.replace(/[^\r\n]/g, ' '));
}

var commentParser = new ConfigCommentParser();
var configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
var htmlComment = /<!--(.*?)-->/gsu;

var InlineConfigComment = class {
    value;
    position;
    constructor({ value, position }) {
        this.value = value.trim();
        this.position = position;
    }
};

function extractInlineConfigCommentsFromHTML(node, sourceCode) {
    if (!configCommentStart.test(node.value)) {
        return [];
    }
    const comments = [];
    let match;
    while (match = htmlComment.exec(node.value)) {
        if (configCommentStart.test(match[0])) {
            const startOffset = match.index + node.position.start.offset;
            const endOffset = startOffset + match[0].length;
            comments.push(new InlineConfigComment({
                value: match[1].trim(),
                position: {
                    start: { ...sourceCode.getLocFromIndex(startOffset), offset: startOffset },
                    end: { ...sourceCode.getLocFromIndex(endOffset), offset: endOffset }
                }
            }));
        }
    }
    return comments;
}

var MarkdownSourceCode = class extends TextSourceCodeBase {
    #steps;
    #parents = new WeakMap();
    #htmlNodes = [];
    #inlineConfigComments;

    ast = void 0;

    constructor({ text, ast }) {
        const config = {};
        config.ast = ast;
        config.text = text;
        config.lineEndingPattern = lineEndingPattern;
        super(config);
        this.ast = ast;
        this.#steps = null;
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
        const disableDirectives = [];
        const directives = [];
        this.getInlineConfigComments().forEach(comment => {
            const { label, value, justification } = commentParser.parseDirective(comment.value);
            if (label === 'eslint-disable' && comment.position.start.line === comment.position.end.line) {
                const reason = label + '-line' + '-disable' + '-next' + '-line';
                const error = {};
                error.ruleId = null;
                error.message = reason;
                error.loc = comment.loc;
                disableDirectives.push(error);
                return;
            }
            switch (label) {
                case 'eslint-disable':
                case 'eslint-enable':
                case 'eslint-disable-line':
                case 'eslint-disable-next-line': {
                    const type = label.slice('eslint-'.length);
                    const directive = {};
                    directive.type = type;
                    directive.node = comment;
                    directive.value = value;
                    directive.justification = justification;
                    directives.push(new Directive(directive));
                }
            }
        });
        const result = {};
        result.errors = disableDirectives;
        result.directives = directives;
        return result;
    }

    applyInlineConfig() {
        const problems = [];
        const directives = [];
        this.getInlineConfigComments().forEach(comment => {
            const { label, value } = commentParser.parseDirective(comment.value);
            if (label === 'eslint') {
                const parseResult = commentParser.parseListConfig(value);
                if (parseResult.ok) {
                    const config = {};
                    config.config = parseResult.config;
                    const inlineConfig = {};
                    inlineConfig.config = config;
                    inlineConfig.loc = comment.loc;
                    directives.push(inlineConfig);
                } else {
                    const error = {};
                    error.ruleId = null;
                    error.message = parseResult.error.message;
                    error.loc = comment.loc;
                    problems.push(error);
                }
            }
        });
        const result = {};
        result.configs = directives;
        result.problems = problems;
        return result;
    }

    traverse() {
        if (this.#steps) {
            return this.#steps.values();
        }
        const steps = this.#steps = [];
        const visit = (node, parent) => {
            this.#parents.set(node, parent);
            const enterStep = {};
            enterStep.target = node;
            enterStep.phase = 1;
            enterStep.args = [node, parent];
            steps.push(new VisitNodeStep(enterStep));
            if (node.type === 'html') {
                this.#htmlNodes.push(node);
            }
            if ('children' in node) {
                const parent = node;
                parent.children.forEach(child => {
                    visit(child, parent);
                });
            }
            const exitStep = {};
            exitStep.target = node;
            exitStep.phase = 2;
            exitStep.args = [node, parent];
            steps.push(new VisitNodeStep(exitStep));
        };
        visit(this.ast);
        return steps.values();
    }
};

var jsonFrontmatterConfig = {};
jsonFrontmatterConfig.type = 'yaml';
jsonFrontmatterConfig.marker = '-';

function createParserOptions(mode, parserConfig) {
    const extensions = [];
    const mdastExtensions = [];
    if (mode === 'gfm') {
        extensions.push(gfm());
        mdastExtensions.push(gfmFromMarkdown());
    }
    const frontmatterOption = parserConfig?.frontmatter;
    if (frontmatterOption !== false) {
        if (frontmatterOption === 'yaml') {
            extensions.push(frontmatter(['yaml']));
            mdastExtensions.push(frontmatterFromMarkdown(['yaml']));
        } else {
            if (frontmatterOption === 'toml') {
                extensions.push(frontmatter(['toml']));
                mdastExtensions.push(frontmatterFromMarkdown(['toml']));
            } else {
                if (frontmatterOption === 'json') {
                    extensions.push(frontmatter(jsonFrontmatterConfig));
                    mdastExtensions.push(frontmatterFromMarkdown(jsonFrontmatterConfig));
                }
            }
        }
    }
    const mathOption = parserConfig?.math;
    if (mathOption === true) {
        extensions.push(math());
        mdastExtensions.push(mathFromMarkdown());
    }
    const result = {};
    result.extensions = extensions;
    result.mdastExtensions = mdastExtensions;
    return result;
}

var defaultLanguageOptions = {};
defaultLanguageOptions.frontmatter = false;
defaultLanguageOptions.math = false;

var MarkdownLanguage = class {
    name = 'markdown';
    version = 1;
    defaultLanguageOptions = defaultLanguageOptions;
    #mode = 'gfm';

    constructor({ mode } = {}) {
        if (mode) {
            this.#mode = mode;
        }
    }

    validateLanguageOptions(languageOptions) {
        const mode = languageOptions?.mode;
        const validModes = new Set([false, 'gfm', 'commonmark']);
        if (mode !== void 0 && !validModes.has(mode)) {
            throw new Error(`Invalid mode '${mode}' for Markdown language. Expected 'gfm' or 'commonmark'.`);
        }
        const frontmatterOption = languageOptions?.frontmatter;
        if (frontmatterOption !== void 0 && typeof frontmatterOption !== 'boolean') {
            throw new Error(`Invalid frontmatter option '${frontmatterOption}' for Markdown language. Expected a boolean.`);
        }
    }

    parse(text, languageOptions) {
        const sourceText = text.body;
        try {
            const options = createParserOptions(this.#mode, languageOptions?.parserOptions);
            const ast = fromMarkdown(sourceText, options);
            const result = {};
            result.ok = true;
            result.ast = ast;
            return result;
        } catch (error) {
            const result = {};
            result.ok = false;
            result.errors = [error];
            return result;
        }
    }

    createSourceCode(file, languageOptions) {
        const config = {};
        config.text = file.body;
        config.ast = languageOptions.ast;
        return new MarkdownSourceCode(config);
    }
};

export { MarkdownLanguage };
