var path = require('path'), fs = require('fs'), os = require('os');
var DEFAULT_BASE_ROOT = path.join(os.homedir(), '.opencontext');
var BASE_ROOT = process.env.OPENCONTEXT_ROOT || DEFAULT_BASE_ROOT;
var CONFIG_PATH = path.join(BASE_ROOT, 'config.json');

const CONFIG_KEYS = {
  OPENAI_API_KEY: {
    description: 'OpenAI API key (starts with sk-...)',
    sensitive: true,
    envVar: 'OPENAI_API_KEY',
    fallbackEnvVar: 'OPENAI_KEY'
  },
  ANTHROPIC_API_KEY: {
    description: 'Anthropic API key',
    sensitive: false,
    envVar: 'ANTHROPIC_API_KEY',
    fallbackEnvVar: 'ANTHROPIC_KEY',
    default: 'your-api-key-here-1'
  },
  GOOGLE_API_KEY: {
    description: 'Google API key',
    sensitive: false,
    envVar: 'GOOGLE_API_KEY',
    fallbackEnvVar: 'GOOGLE_KEY'
  },
  AZURE_OPENAI_KEY: {
    description: 'Azure OpenAI key',
    sensitive: false,
    envVar: 'AZURE_OPENAI_KEY',
    fallbackEnvVar: 'AZURE_KEY'
  },
  COHERE_API_KEY: {
    description: 'Cohere API key',
    sensitive: false,
    envVar: 'COHERE_API_KEY',
    fallbackEnvVar: 'COHERE_KEY'
  },
  HUGGINGFACE_KEY: {
    description: 'Hugging Face API key',
    sensitive: false,
    envVar: 'HUGGINGFACE_KEY',
    fallbackEnvVar: 'HF_KEY'
  },
  DEFAULT_MODEL: {
    description: 'Default model name',
    sensitive: false,
    envVar: 'DEFAULT_MODEL',
    default: 'gpt-4'
  },
  DEFAULT_TEMPERATURE: {
    description: 'Default temperature for completions (0.0-1.0)',
    sensitive: false,
    envVar: 'DEFAULT_TEMPERATURE',
    default: '0.7'
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
    const data = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading config:', err);
    return {};
  }
}

function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

function get(key) {
  const keyConfig = CONFIG_KEYS[key];
  
  if (keyConfig?.envVar && process.env[keyConfig.envVar]) {
    return process.env[keyConfig.envVar];
  }
  
  if (keyConfig?.fallbackEnvVar && process.env[keyConfig.fallbackEnvVar]) {
    return process.env[keyConfig.fallbackEnvVar];
  }
  
  const config = loadConfig();
  
  if (config[key] !== undefined) {
    return config[key];
  }
  
  if (key === 'DEFAULT_MODEL' && config['defaultModel'] !== undefined) {
    return config['defaultModel'];
  }
  
  if (key === 'DEFAULT_TEMPERATURE' && config['defaultTemperature'] !== undefined) {
    return config['defaultTemperature'];
  }
  
  return keyConfig?.default;
}

function set(key, value) {
  if (!CONFIG_KEYS[key]) {
    throw new Error('Unknown configuration key: ' + key + '. Use list() to see available keys.');
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

function list(maskSensitive = false) {
  const config = loadConfig();
  const result = [];
  
  for (const [key, keyConfig] of Object.entries(CONFIG_KEYS)) {
    let value = null;
    let source = 'default';
    
    if (keyConfig.envVar && process.env[keyConfig.envVar]) {
      value = process.env[keyConfig.envVar];
      source = 'env';
    } else if (keyConfig.fallbackEnvVar && process.env[keyConfig.fallbackEnvVar]) {
      value = process.env[keyConfig.fallbackEnvVar];
      source = 'env-fallback';
    } else if (config[key] !== undefined) {
      value = config[key];
      source = 'file';
    } else if (keyConfig.default) {
      value = keyConfig.default;
      source = 'default';
    }
    
    let displayValue = value;
    if (value && keyConfig.sensitive && maskSensitive) {
      displayValue = maskSensitiveValue(value);
    } else if (value && keyConfig.sensitive) {
      displayValue = '[REDACTED]';
    }
    
    result.push({
      key: key,
      value: displayValue,
      source: source,
      description: keyConfig.description,
      isSet: value !== null && value !== undefined
    });
  }
  
  return result;
}

function maskSensitiveValue(value) {
  if (!value || value.length < 8) {
    return '[REDACTED]';
  }
  const prefix = value.substring(0, 4);
  const suffix = value.substring(value.length - 4);
  return prefix + '****' + suffix;
}

function getConfigPath() {
  return CONFIG_PATH;
}

function getAvailableKeys() {
  return Object.keys(CONFIG_KEYS);
}

module.exports = {
  get: get,
  set: set,
  unset: unset,
  list: list,
  loadConfig: loadConfig,
  saveConfig: saveConfig,
  getConfigPath: getConfigPath,
  getAvailableKeys: getAvailableKeys,
  CONFIG_KEYS: CONFIG_KEYS,
  BASE_ROOT: BASE_ROOT
};
