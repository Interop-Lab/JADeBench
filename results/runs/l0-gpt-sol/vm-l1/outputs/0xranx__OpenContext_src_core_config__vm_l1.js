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
    fallbackEnvVar: 'OPENAI_API_KEY'
  },
  EMBEDDING_API_BASE: {
    description: 'API Base URL for embedding service',
    sensitive: false,
    envVar: 'EMBEDDING_API_BASE',
    fallbackEnvVar: 'OPENAI_BASE_URL',
    default: 'https://api.openai.com/v1'
  },
  EMBEDDING_MODEL: {
    description: 'Embedding model name',
    sensitive: false,
    envVar: 'EMBEDDING_MODEL',
    default: 'text-embedding-3-small'
  },
  AI_PROVIDER: {
    description: 'AI provider: openai | ollama',
    sensitive: false,
    envVar: 'AI_PROVIDER',
    default: 'openai'
  },
  AI_API_KEY: {
    description: 'API Key for AI chat (OpenAI compatible)',
    sensitive: true,
    envVar: 'AI_API_KEY',
    fallbackEnvVar: 'OPENAI_API_KEY'
  },
  AI_API_BASE: {
    description: 'API Base URL for AI chat service',
    sensitive: false,
    envVar: 'AI_API_BASE',
    default: 'https://api.openai.com/v1'
  },
  AI_MODEL: {
    description: 'AI chat model name',
    sensitive: false,
    envVar: 'AI_MODEL',
    default: 'gpt-4o'
  },
  AI_PROMPT: {
    description: 'Custom system prompt for AI reflections',
    sensitive: false,
    envVar: 'AI_PROMPT',
    default: 'You are an AI within a journaling app. Your job is to help the user reflect on their thoughts in a thoughtful and kind manner. The user can never directly address you or directly respond to you. Try not to repeat what the user said, instead try to seed new ideas, encourage or debate. Keep your responses concise, but meaningful. Respond in the same language as the user.'
  }
};

function ensureConfigDir() {
  fs.mkdirSync(BASE_ROOT, { recursive: true });
}

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return {};
  }

  try {
    const contents = fs.readFileSync(CONFIG_PATH, 'utf8');
    return contents.trim() ? JSON.parse(contents) : {};
  } catch {
    return {};
  }
}

function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf8');
  return config;
}

function get(key) {
  const definition = CONFIG_KEYS[key];

  if (!definition) {
    return undefined;
  }

  const config = loadConfig();

  if (process.env[definition.envVar] !== undefined) {
    return process.env[definition.envVar];
  }

  if (
    definition.fallbackEnvVar &&
    process.env[definition.fallbackEnvVar] !== undefined
  ) {
    return process.env[definition.fallbackEnvVar];
  }

  if (config[key] !== undefined) {
    return config[key];
  }

  return definition.default;
}

function set(key, value) {
  if (!CONFIG_KEYS[key]) {
    throw new Error(`Unknown configuration key: ${key}`);
  }

  const config = loadConfig();
  config[key] = value;
  saveConfig(config);
  return value;
}

function unset(key) {
  if (!CONFIG_KEYS[key]) {
    throw new Error(`Unknown configuration key: ${key}`);
  }

  const config = loadConfig();
  delete config[key];
  saveConfig(config);
}

function list() {
  const values = {};

  for (const key of Object.keys(CONFIG_KEYS)) {
    const value = get(key);
    values[key] = CONFIG_KEYS[key].sensitive
      ? maskSensitive(value)
      : value;
  }

  return values;
}

function maskSensitive(value) {
  if (value === undefined || value === null || value === '') {
    return value;
  }

  const stringValue = String(value);

  if (stringValue.length <= 8) {
    return '********';
  }

  return `${stringValue.slice(0, 4)}...${stringValue.slice(-4)}`;
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
