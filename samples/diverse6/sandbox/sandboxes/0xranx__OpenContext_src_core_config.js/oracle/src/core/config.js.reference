// ../work/0xranx__OpenContext/src/core/config.js
var path = require("path");
var fs = require("fs");
var os = require("os");
var DEFAULT_BASE_ROOT = path.join(os.homedir(), ".opencontext");
var BASE_ROOT = process.env.OPENCONTEXT_ROOT || DEFAULT_BASE_ROOT;
var CONFIG_PATH = path.join(BASE_ROOT, "config.json");
var CONFIG_KEYS = {
  EMBEDDING_API_KEY: {
    description: "API Key for embedding generation (OpenAI, DashScope, etc.)",
    sensitive: true,
    envVar: "EMBEDDING_API_KEY",
    // Backward compatibility: also check old env var name
    fallbackEnvVar: "OPENAI_API_KEY"
  },
  EMBEDDING_API_BASE: {
    description: "API Base URL for embedding service",
    sensitive: false,
    envVar: "EMBEDDING_API_BASE",
    fallbackEnvVar: "OPENAI_BASE_URL",
    default: "https://api.openai.com/v1"
  },
  EMBEDDING_MODEL: {
    description: "Embedding model name",
    sensitive: false,
    envVar: "EMBEDDING_MODEL",
    default: "text-embedding-3-small"
  },
  // AI Chat Configuration
  AI_PROVIDER: {
    description: "AI provider: openai | ollama",
    sensitive: false,
    envVar: "AI_PROVIDER",
    default: "openai"
  },
  AI_API_KEY: {
    description: "API Key for AI chat (OpenAI compatible)",
    sensitive: true,
    envVar: "AI_API_KEY",
    fallbackEnvVar: "OPENAI_API_KEY"
  },
  AI_API_BASE: {
    description: "API Base URL for AI chat service",
    sensitive: false,
    envVar: "AI_API_BASE",
    default: "https://api.openai.com/v1"
  },
  AI_MODEL: {
    description: "AI chat model name",
    sensitive: false,
    envVar: "AI_MODEL",
    default: "gpt-4o"
  },
  AI_PROMPT: {
    description: "Custom system prompt for AI reflections",
    sensitive: false,
    envVar: "AI_PROMPT",
    default: "You are an AI within a journaling app. Your job is to help the user reflect on their thoughts in a thoughtful and kind manner. The user can never directly address you or directly respond to you. Try not to repeat what the user said, instead try to seed new ideas, encourage or debate. Keep your responses concise, but meaningful. Respond in the same language as the user."
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
    const content = fs.readFileSync(CONFIG_PATH, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    console.error(`Warning: Failed to parse config file: ${e.message}`);
    return {};
  }
}
function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}
function get(key) {
  const keyInfo = CONFIG_KEYS[key];
  if (keyInfo?.envVar && process.env[keyInfo.envVar]) {
    return process.env[keyInfo.envVar];
  }
  if (keyInfo?.fallbackEnvVar && process.env[keyInfo.fallbackEnvVar]) {
    return process.env[keyInfo.fallbackEnvVar];
  }
  const config = loadConfig();
  if (config[key] !== void 0) {
    return config[key];
  }
  if (key === "EMBEDDING_API_KEY" && config["OPENAI_API_KEY"] !== void 0) {
    return config["OPENAI_API_KEY"];
  }
  if (key === "EMBEDDING_API_BASE" && config["OPENAI_BASE_URL"] !== void 0) {
    return config["OPENAI_BASE_URL"];
  }
  return keyInfo?.default;
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
function list(showValues = false) {
  const config = loadConfig();
  const result = [];
  for (const [key, info] of Object.entries(CONFIG_KEYS)) {
    let value = null;
    let source = "default";
    if (info.envVar && process.env[info.envVar]) {
      value = process.env[info.envVar];
      source = "env";
    } else if (info.fallbackEnvVar && process.env[info.fallbackEnvVar]) {
      value = process.env[info.fallbackEnvVar];
      source = "env (legacy)";
    } else if (config[key] !== void 0) {
      value = config[key];
      source = "config";
    } else if (info.default) {
      value = info.default;
      source = "default";
    }
    let displayValue = value;
    if (value && info.sensitive && showValues) {
      displayValue = maskSensitive(value);
    } else if (value && info.sensitive) {
      displayValue = "********";
    }
    result.push({
      key,
      value: displayValue,
      source,
      description: info.description,
      isSet: value !== null && value !== void 0
    });
  }
  return result;
}
function maskSensitive(value) {
  if (!value || value.length < 8) {
    return "********";
  }
  const prefix = value.substring(0, 4);
  const suffix = value.substring(value.length - 4);
  return `${prefix}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${suffix}`;
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
