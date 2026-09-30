import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import { promises as fs } from 'fs';

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
let customConfigContent = null;

function getConfigPath() {
  if (customConfigContent) {
    return Promise.resolve(null);
  }
  return Promise.resolve(path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME));
}

function getModuleExports(modulePath) {
  const require = createRequire(pathToFileURL(modulePath));
  return require(modulePath);
}

const config_default = {
  DEFAULT_CONFIG_FILE_NAME,
  
  set(configContent) {
    customConfigContent = configContent;
  },
  
  shouldExist() {
    return customConfigContent === null;
  },
  
  shouldNotExist() {
    return customConfigContent !== null;
  },
  
  getConfigFilename() {
    return DEFAULT_CONFIG_FILE_NAME;
  },
  
  async read() {
    if (customConfigContent) {
      return customConfigContent;
    }
    const configPath = await getConfigPath();
    if (!configPath) {
      throw new Error(`Config file not found: ${DEFAULT_CONFIG_FILE_NAME}`);
    }
    const moduleExports = await getModuleExports(configPath);
    return moduleExports;
  }
};

export { config_default as default };
