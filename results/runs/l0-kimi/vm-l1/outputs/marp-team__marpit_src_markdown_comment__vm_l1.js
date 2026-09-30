const vm_0x4abedd = {};
const vm_0x30c82d = {};

let vm_0x39134c = typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : void 0;
let vm_0x4acef7_5f544b = vm_0x39134c['vm_0x4acef7_5f544b'] || (vm_0x39134c['vm_0x4acef7_5f544b'] = {});

(function() {
    if (!vm_0x4acef7_5f544b['module']) try { vm_0x4acef7_5f544b['module'] = module; } catch(e) {}
    if (!vm_0x4acef7_5f544b['exports']) try { vm_0x4acef7_5f544b['exports'] = exports; } catch(e) {}
    if (!vm_0x4acef7_5f544b['require']) try { vm_0x4acef7_5f544b['require'] = require; } catch(e) {}
    if (!vm_0x4acef7_5f544b['__dirname']) try { vm_0x4acef7_5f544b['__dirname'] = __dirname; } catch(e) {}
    if (!vm_0x4acef7_5f544b['__filename']) try { vm_0x4acef7_5f544b['__filename'] = __filename; } catch(e) {}
})();

const commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
const commentMatcherOpening = /^<!--/;
const commentMatcherClosing = /-->/;
const magicCommentMatchers = [
    /^prettier-ignore(-(start|end))?$/,
    /^markdownlint-((disable|enable).*|capture|restore)$/,
    /^lint (disable|enable|ignore).*$/
];

const yamlSpecialChars = '["\'{|>~&*';

function parse(content) {
    const parsed = [];
    const lines = content.split('\n');
    let inComment = false;
    let commentContent = '';
    let lineNumber = 0;
    
    for (const line of lines) {
        lineNumber++;
        const trimmed = line.trim();
        
        if (!inComment) {
            const match = trimmed.match(commentMatcherOpening);
            if (match) {
                inComment = true;
                commentContent = line;
                if (trimmed.match(commentMatcherClosing)) {
                    inComment = false;
                    const fullMatch = commentContent.match(commentMatcher);
                    if (fullMatch) {
                        parsed.push({
                            type: 'comment',
                            content: fullMatch[1].trim(),
                            line: lineNumber,
                            raw: commentContent
                        });
                    }
                    commentContent = '';
                }
            }
        } else {
            commentContent += '\n' + line;
            if (trimmed.match(commentMatcherClosing)) {
                inComment = false;
                const fullMatch = commentContent.match(commentMatcher);
                if (fullMatch) {
                    parsed.push({
                        type: 'comment',
                        content: fullMatch[1].trim(),
                        line: lineNumber,
                        raw: commentContent
                    });
                }
                commentContent = '';
            }
        }
    }
    
    return parsed;
}

function convertLoose(content, options = {}) {
    const comments = parse(content);
    const result = [];
    
    for (const comment of comments) {
        const lines = comment.content.split('\n');
        const directives = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            const colonIndex = trimmed.indexOf(':');
            if (colonIndex > 0) {
                const key = trimmed.slice(0, colonIndex).trim();
                const value = trimmed.slice(colonIndex + 1).trim();
                directives.push({ key, value, raw: line });
            }
        }
        
        result.push({
            ...comment,
            directives,
            isMagic: magicCommentMatchers.some(m => m.test(comment.content))
        });
    }
    
    return result;
}

function markAsParsed(node, parsed) {
    if (node && typeof node === 'object') {
        node._marpitParsed = true;
        node._marpitDirectives = parsed.directives || [];
    }
    return node;
}

function _comment(content) {
    if (!content) return null;
    
    const match = content.match(commentMatcher);
    if (!match) return null;
    
    const inner = match[1].trim();
    const lines = inner.split('\n');
    const directives = {};
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        if (trimmed.includes(':')) {
            const [key, ...rest] = trimmed.split(':');
            const value = rest.join(':').trim();
            directives[key.trim()] = value;
        }
    }
    
    return {
        content: inner,
        directives,
        isMagic: magicCommentMatchers.some(m => m.test(inner))
    };
}

const globals = {
    headingDivider: (value) => ({ headingDivider: value }),
    style: (value) => ({ style: value }),
    theme: (name, opts) => ({ theme: name, themeOpts: opts }),
    lang: (value) => ({ lang: value })
};

const locals = {
    backgroundColor: (value) => ({ backgroundColor: value }),
    backgroundImage: (value) => ({ backgroundImage: value }),
    backgroundPosition: (value) => ({ backgroundPosition: value }),
    backgroundRepeat: (value) => ({ backgroundRepeat: value }),
    backgroundSize: (value) => ({ backgroundSize: value }),
    class: (value) => ({ class: value }),
    color: (value) => ({ color: value }),
    footer: (value) => ({ footer: value }),
    header: (value) => ({ header: value }),
    paginate: (value) => ({ paginate: value })
};

const directives_default = [...Object.keys(globals), ...Object.keys(locals)];

function createPatterns(directives) {
    return directives.map(d => ({
        name: d,
        pattern: new RegExp(`^${d}\\s*:\\s*(.+)$`, 'm')
    }));
}

function yaml(content, options = {}) {
    const result = {};
    const lines = content.split('\n');
    let currentKey = null;
    let currentValue = [];
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        const indent = line.length - line.trimStart().length;
        
        if (trimmed.includes(':')) {
            if (currentKey) {
                result[currentKey] = currentValue.join('\n').trim();
            }
            const [key, ...rest] = trimmed.split(':');
            currentKey = key.trim();
            currentValue = [rest.join(':').trim()];
        } else if (currentKey && indent > 0) {
            currentValue.push(line);
        }
    }
    
    if (currentKey) {
        result[currentKey] = currentValue.join('\n').trim();
    }
    
    return result;
}

const yaml_default = yaml;

vm_0x4acef7_5f544b['commentMatcher'] = commentMatcher;
vm_0x4acef7_5f544b['commentMatcherOpening'] = commentMatcherOpening;
vm_0x4acef7_5f544b['commentMatcherClosing'] = commentMatcherClosing;
vm_0x4acef7_5f544b['magicCommentMatchers'] = magicCommentMatchers;
vm_0x4acef7_5f544b['yamlSpecialChars'] = yamlSpecialChars;
vm_0x4acef7_5f544b['parse'] = parse;
vm_0x4acef7_5f544b['convertLoose'] = convertLoose;
vm_0x4acef7_5f544b['markAsParsed'] = markAsParsed;
vm_0x4acef7_5f544b['_comment'] = _comment;
vm_0x4acef7_5f544b['globals'] = globals;
vm_0x4acef7_5f544b['locals'] = locals;
vm_0x4acef7_5f544b['directives_default'] = directives_default;
vm_0x4acef7_5f544b['createPatterns'] = createPatterns;
vm_0x4acef7_5f544b['yaml'] = yaml;
vm_0x4acef7_5f544b['yaml_default'] = yaml_default;

globalThis['commentMatcher'] = commentMatcher;
globalThis['commentMatcherOpening'] = commentMatcherOpening;
globalThis['commentMatcherClosing'] = commentMatcherClosing;
globalThis['magicCommentMatchers'] = magicCommentMatchers;
globalThis['yamlSpecialChars'] = yamlSpecialChars;
globalThis['parse'] = parse;
globalThis['convertLoose'] = convertLoose;
globalThis['markAsParsed'] = markAsParsed;
globalThis['_comment'] = _comment;
globalThis['globals'] = globals;
globalThis['locals'] = locals;
globalThis['directives_default'] = directives_default;
globalThis['createPatterns'] = createPatterns;
globalThis['yaml'] = yaml;
globalThis['yaml_default'] = yaml_default;

const comment = _comment;
const comment_default = comment;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        comment,
        markAsParsed,
        parse,
        convertLoose,
        globals,
        locals,
        directives_default,
        createPatterns,
        yaml,
        yaml_default,
        commentMatcher,
        commentMatcherOpening,
        commentMatcherClosing,
        magicCommentMatchers,
        yamlSpecialChars
    };
}
