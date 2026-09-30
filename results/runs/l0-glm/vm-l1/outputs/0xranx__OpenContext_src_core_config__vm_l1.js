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
  if (!fs.existsSync(BASE_ROOT)) {
    fs.mkdirSync(BASE_ROOT, { recursive: true });
  }
}

function loadConfig() {
  ensureConfigDir();
  let config = {};
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch (e) {
      config = {};
    }
  }
  for (const key of Object.keys(CONFIG_KEYS)) {
    const keyConfig = CONFIG_KEYS[key];
    if (config[key] === undefined) {
      if (process.env[keyConfig.envVar]) {
        config[key] = process.env[keyConfig.envVar];
      } else if (keyConfig.fallbackEnvVar && process.env[keyConfig.fallbackEnvVar]) {
        config[key] = process.env[keyConfig.fallbackEnvVar];
      } else if (keyConfig.default !== undefined) {
        config[key] = keyConfig.default;
      }
    }
  }
  return config;
}

function saveConfig(config) {
  ensureConfigDir();
  const filtered = {};
  for (const key of Object.keys(CONFIG_KEYS)) {
    if (config[key] !== undefined) {
      filtered[key] = config[key];
    }
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(filtered, null, 2), 'utf8');
  return filtered;
}

function get(key) {
  const config = loadConfig();
  return config[key];
}

function set(key, value) {
  const config = loadConfig();
  config[key] = value;
  saveConfig(config);
  return value;
}

function unset(key) {
  const config = loadConfig();
  delete config[key];
  saveConfig(config);
}

function list() {
  return loadConfig();
}

function maskSensitive(config) {
  const masked = {};
  for (const key of Object.keys(config)) {
    const keyConfig = CONFIG_KEYS[key];
    if (keyConfig && keyConfig.sensitive && config[key]) {
      const val = String(config[key]);
      if (val.length <= 8) {
        masked[key] = '****';
      } else {
        masked[key] = val.slice(0, 4) + '****' + val.slice(-4);
      }
    } else {
      masked[key] = config[key];
    }
  }
  return masked;
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
