const path = require('path');
const fs = require('fs');
const os = require('os');

const DEFAULT_BASE_ROOT = path.join(os.homedir(), '.opencontext');
const BASE_ROOT = process.env.OPENCONTEXT_ROOT || DEFAULT_BASE_ROOT;
const CONFIG_PATH = path.join(BASE_ROOT, 'config.json');

const CONFIG_KEYS = {
  EMBEDDING_API_KEY: {
    description: 'API Key for embedding generation (OpenAI, DashScope, etc.)',
    sensitive: true,
    envVar: 'EMBEDDING_API_KEY',
    fallbackEnvVar: 'OPENAI_API_KEY',
  },
  EMBEDDING_API_BASE: {
    description: 'API Base URL for embedding service',
    sensitive: false,
    envVar: 'EMBEDDING_API_BASE',
    fallbackEnvVar: 'OPENAI_BASE_URL',
    default: 'https://api.openai.com/v1',
  },
  EMBEDDING_MODEL: {
    description: 'Embedding model name',
    sensitive: false,
    envVar: 'EMBEDDING_MODEL',
    default: 'text-embedding-3-small',
  },
  AI_PROVIDER: {
    description: 'AI provider: openai | ollama',
    sensitive: false,
    envVar: 'AI_PROVIDER',
    default: 'openai',
  },
  AI_API_KEY: {
    description: 'API Key for AI chat (OpenAI compatible)',
    sensitive: true,
    envVar: 'AI_API_KEY',
    fallbackEnvVar: 'OPENAI_API_KEY',
  },
  AI_API_BASE: {
    description: 'API Base URL for AI chat service',
    sensitive: false,
    envVar: 'AI_API_BASE',
    default: 'https://api.openai.com/v1',
  },
  AI_MODEL: {
    description: 'AI chat model name',
    sensitive: false,
    envVar: 'AI_MODEL',
    default: 'gpt-4o',
  },
  AI_PROMPT: {
    description: 'Custom system prompt for AI reflections',
    sensitive: false,
    envVar: 'AI_PROMPT',
    default: 'You are an AI within a journaling app. Your job is to help the user reflect on their thoughts in a thoughtful and kind manner. The user can never directly address you or directly respond to you. Try not to repeat what the user said, instead try to seed new ideas, encourage or debate. Keep your responses concise, but meaningful. Respond in the same language as the user.',
  },
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
    const contents = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(contents);
  } catch (error) {
    console.error(`Warning: Failed to parse config file: ${error.message}`);
    return {};
  }
}

function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

function get(key) {
  const definition = CONFIG_KEYS[key];

  if (definition?.envVar && process.env[definition.envVar]) {
    return process.env[definition.envVar];
  }

  if (definition?.fallbackEnvVar && process.env[definition.fallbackEnvVar]) {
    return process.env[definition.fallbackEnvVar];
  }

  const config = loadConfig();

  if (config[key] !== undefined) {
    return config[key];
  }

  return definition?.default;
}

function set(key, value) {
  if (!CONFIG_KEYS[key]) {
    throw new Error(`Unknown config key: ${key}. Run "oc config list" to see available keys.`);
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

function list(maskSensitiveValues = false) {
  const config = loadConfig();
  const entries = [];

  for (const [key, definition] of Object.entries(CONFIG_KEYS)) {
    let value = null;
    let source = 'not set';

    if (definition.envVar && process.env[definition.envVar]) {
      value = process.env[definition.envVar];
      source = 'env';
    } else if (definition.fallbackEnvVar && process.env[definition.fallbackEnvVar]) {
      value = process.env[definition.fallbackEnvVar];
      source = 'env (legacy)';
    } else if (config[key] !== undefined) {
      value = config[key];
      source = 'config';
    } else if (definition.default) {
      value = definition.default;
      source = 'default';
    }

    let displayedValue = value;
    if (value && definition.sensitive && maskSensitiveValues) {
      displayedValue = maskSensitive(value);
    } else if (value && definition.sensitive) {
      displayedValue = '********';
    }

    entries.push({
      key,
      value: displayedValue,
      source,
      description: definition.description,
      isSet: value !== null && value !== undefined,
    });
  }

  return entries;
}

function maskSensitive(value) {
  if (!value || value.length < 8) {
    return '********';
  }

  const prefix = value.substring(0, 4);
  const suffix = value.substring(value.length - 4);
  return `${prefix}••••••••${suffix}`;
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
  BASE_ROOT,
};
