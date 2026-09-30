const yaml = require('js-yaml');

const globals = Object.create(null);
globals.headingDivider = (val) => val;
globals.style = (val) => val;
globals.theme = (val, opts) => ({ theme: val, opts });
globals.lang = (val) => val;

const locals = Object.create(null);
locals.backgroundColor = (val) => val;
locals.backgroundImage = (val) => val;
locals.backgroundPosition = (val) => val;
locals.backgroundRepeat = (val) => val;
locals.backgroundSize = (val) => val;
locals.class = (val) => val;
locals.color = (val) => val;
locals.footer = (val) => val;
locals.header = (val) => val;
locals.paginate = (val) => val;

const directives_default = [...Object.keys(globals), ...Object.keys(locals)];

const yamlSpecialChars = '["\'{|>~&*';

function createPatterns(frontMatter) {
  const patterns = [];
  const lines = frontMatter.split('\n');
  let inDirective = false;
  let currentKey = null;
  let currentValue = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!inDirective) {
      if (trimmed.startsWith('---')) {
        inDirective = true;
      }
      continue;
    }
    
    if (trimmed.startsWith('---')) {
      if (currentKey !== null) {
        patterns.push({ key: currentKey, value: currentValue.join('\n') });
      }
      break;
    }
    
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex > 0 && !trimmed.startsWith(' ') && !trimmed.startsWith('\t')) {
      if (currentKey !== null) {
        patterns.push({ key: currentKey, value: currentValue.join('\n') });
      }
      currentKey = trimmed.slice(0, colonIndex).trim();
      currentValue = [trimmed.slice(colonIndex + 1).trim()];
    } else if (currentKey !== null) {
      currentValue.push(line);
    }
  }
  
  return patterns;
}

function parse(input) {
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string');
  }
  
  const frontMatterMatch = input.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!frontMatterMatch) {
    return { data: null, content: input };
  }
  
  const frontMatter = frontMatterMatch[1];
  const content = input.slice(frontMatterMatch[0].length);
  
  let data;
  try {
    data = yaml.load(frontMatter);
  } catch (e) {
    data = null;
  }
  
  return { data, content };
}

function convertLoose(frontMatter, options = {}) {
  if (!frontMatter || typeof frontMatter !== 'string') {
    return {};
  }
  
  const patterns = createPatterns(frontMatter);
  const result = {};
  
  for (const pattern of patterns) {
    const { key, value } = pattern;
    
    if (directives_default.includes(key)) {
      const handler = globals[key] || locals[key];
      if (handler) {
        try {
          const parsed = yaml.load(value);
          result[key] = handler(parsed, options);
        } catch (e) {
          result[key] = handler(value.trim(), options);
        }
      } else {
        result[key] = value.trim();
      }
    } else {
      try {
        result[key] = yaml.load(value);
      } catch (e) {
        result[key] = value.trim();
      }
    }
  }
  
  return result;
}

module.exports = {
  parse,
  convertLoose,
  yaml,
  yaml_default: yaml,
  globals,
  locals,
  directives_default,
  yamlSpecialChars,
  createPatterns,
  __defProp: Object.defineProperty,
  __getOwnPropDesc: Object.getOwnPropertyDescriptor,
  __getOwnPropNames: Object.getOwnPropertyNames,
  __hasOwnProp: Object.prototype.hasOwnProperty,
  __export: (target, all) => {
    for (const name in all) {
      Object.defineProperty(target, name, {
        get: () => all[name],
        enumerable: true
      });
    }
  },
  __copyProps: (to, from, except, desc) => {
    if (from && typeof from === 'object' || typeof from === 'function') {
      for (const key of Object.getOwnPropertyNames(from)) {
        if (!Object.prototype.hasOwnProperty.call(to, key) && key !== except) {
          Object.defineProperty(to, key, {
            get: () => from[key],
            enumerable: !(desc = Object.getOwnPropertyDescriptor(from, key)) || desc.enumerable
          });
        }
      }
    }
    return to;
  },
  __toCommonJS: (mod) => {
    const defaultExport = mod.default;
    const result = { __esModule: true };
    if (defaultExport) {
      Object.defineProperty(result, 'default', { get: () => defaultExport, enumerable: true });
    }
    for (const key in mod) {
      if (key !== 'default') {
        Object.defineProperty(result, key, { get: () => mod[key], enumerable: true });
      }
    }
    return result;
  }
};
