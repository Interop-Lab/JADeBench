import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs/promises';

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
let customConfigContent = null;

function getConfigPath() {
  const configFileName = customConfigContent
    ? DEFAULT_CONFIG_FILE_NAME
    : DEFAULT_CONFIG_FILE_NAME;
  return path.join(process.cwd(), configFileName);
}

function getModuleExports(filePath) {
  const fileUrl = pathToFileURL(filePath).href;
  const require = createRequire(import.meta.url);
  return require(filePath);
}

const config_default = {
  DEFAULT_CONFIG_FILE_NAME,
  set(content) {
    customConfigContent = content;
  },
  shouldExist() {
    const configPath = getConfigPath();
    return fs.access(configPath).then(
      () => true,
      () => false
    );
  },
  shouldNotExist() {
    const configPath = getConfigPath();
    return fs.access(configPath).then(
      () => false,
      () => true
    );
  },
  getConfigFilename() {
    return getConfigPath();
  },
  read() {
    const configPath = getConfigPath();
    if (customConfigContent) {
      return Promise.resolve(customConfigContent);
    }
    return Promise.resolve(getModuleExports(configPath));
  }
};

export { config_default as default };
