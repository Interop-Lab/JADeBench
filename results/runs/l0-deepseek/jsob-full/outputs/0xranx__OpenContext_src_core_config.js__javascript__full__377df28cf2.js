const path = require('path');
const fs = require('fs');
const os = require('os');

const DEFAULT_BASE_ROOT = path.join(os.homedir(), '.opencontext');
const BASE_ROOT = process.env.OPENCONTEXT_ROOT || DEFAULT_BASE_ROOT;
const CONFIG_PATH = path.join(BASE_ROOT, 'config.json');

const CONFIG_KEYS = {
  OPENAI_API_KEY: {
    description: 'OpenAI API key for LLM features.',
    sensitive: true,
    envVar: 'OPENAI_API_KEY',
    fallbackEnvVar: 'OPENAI_API_KEY'
  },
  ANTHROPIC_API_KEY: {
    description: 'Anthropic API key for Claude features.',
    sensitive: true,
    envVar: 'ANTHROPIC_API_KEY',
    fallbackEnvVar: 'ANTHROPIC_API_KEY'
  },
  GEMINI_API_KEY: {
    description: 'Gemini API key.',
    sensitive: true,
    envVar: 'GEMINI_API_KEY',
    fallbackEnvVar: 'GEMINI_API_KEY'
  },
  OPENROUTER_API_KEY: {
    description: 'OpenRouter API key.',
    sensitive: true,
    envVar: 'OPENROUTER_API_KEY',
    fallbackEnvVar: 'OPENROUTER_API_KEY'
  },
  DEEPSEEK_API_KEY: {
    description: 'DeepSeek API key.',
    sensitive: true,
    envVar: 'DEEPSEEK_API_KEY',
    fallbackEnvVar: 'DEEPSEEK_API_KEY'
  },
  GROQ_API_KEY: {
    description: 'Groq API key.',
    sensitive: true,
    envVar: 'GROQ_API_KEY',
    fallbackEnvVar: 'GROQ_API_KEY'
  },
  MISTRAL_API_KEY: {
    description: 'Mistral API key.',
    sensitive: true,
    envVar: 'MISTRAL_API_KEY',
    fallbackEnvVar: 'MISTRAL_API_KEY'
  },
  OPENAI_BASE_URL: {
    description: 'Base URL for OpenAI-compatible APIs.',
    sensitive: false,
    envVar: 'OPENAI_BASE_URL',
    fallbackEnvVar: 'OPENAI_BASE_URL'
  }
};

function ensureConfigDir() {
  if (!fs.existsSync(BASE_ROOT)) {
    fs.mkdirSync(BASE_ROOT, { recursive: true });
  }
}

function loadConfig() {
  ensureConfigDir();
  if (!fs.existsSync(CONFIG_PATH)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading config:', err.message);
    return {};
  }
}

function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

function get(key) {
  const entry = CONFIG_KEYS[key];
  if (entry?.envVar && process.env[entry.envVar]) {
    return process.env[entry.envVar];
  }
  if (entry?.fallbackEnvVar && process.env[entry.fallbackEnvVar]) {
    return process.env[entry.fallbackEnvVar];
  }
  const config = loadConfig();
  if (config[key] !== undefined) {
    return config[key];
  }
  if (key === 'OPENAI_API_KEY' && config['OPENAI_API_KEY'] !== undefined) {
    return config['OPENAI_API_KEY'];
  }
  if (key === 'ANTHROPIC_API_KEY' && config['ANTHROPIC_API_KEY'] !== undefined) {
    return config['ANTHROPIC_API_KEY'];
  }
  return entry?.default;
}

function set(key, value) {
  if (!CONFIG_KEYS[key]) {
    throw new Error('Unknown config key: ' + key);
  }
  const config = loadConfig();
  config[key] = value;
  saveConfig(config);
}

function unset(key) {
  const config = loadConfig();
  delete config[key];
  saveConfig(config);
}

function maskSensitive(value) {
  if (!value || value.length <= 8) {
    return '****';
  }
  const first = value.slice(0, 4);
  const last = value.slice(-4);
  return first + '****' + last;
}

function list(mask = false) {
  const config = loadConfig();
  const result = [];
  for (const [key, entry] of Object.entries(CONFIG_KEYS)) {
    let value = null;
    let source = 'default';
    if (entry.envVar && process.env[entry.envVar]) {
      value = process.env[entry.envVar];
      source = 'env';
    } else if (entry.fallbackEnvVar && process.env[entry.fallbackEnvVar]) {
      value = process.env[entry.fallbackEnvVar];
      source = 'env';
    } else if (config[key] !== undefined) {
      value = config[key];
      source = 'config';
    } else if (entry.default) {
      value = entry.default;
      source = 'default';
    }
    let displayValue = value;
    if (value && entry.sensitive && mask) {
      displayValue = maskSensitive(value);
    } else if (value && entry.sensitive) {
      displayValue = '****';
    }
    result.push({
      key: key,
      value: displayValue,
      source: source,
      description: entry.description,
      isSet: value !== null && value !== undefined
    });
  }
  return result;
}

function getConfigPath() {
  return CONFIG_PATH;
}

function getAvailableKeys() {
  return Object.keys(CONFIG_KEYS);
}

module.exports = {
  get,
  set,
  unset,
  list,
  loadConfig,
  saveConfig,
  getConfigPath,
  getAvailableKeys,
  CONFIG_KEYS,
  BASE_ROOT
};
