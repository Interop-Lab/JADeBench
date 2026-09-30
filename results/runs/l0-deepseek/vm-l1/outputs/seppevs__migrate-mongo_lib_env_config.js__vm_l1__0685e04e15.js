import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs/promises';
import path2 from 'path';
import url from 'url';

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
let customConfigContent = null;

function getConfigPath() {
  return path2.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
}

function getModuleExports(modulePath) {
  const require = createRequire(import.meta.url);
  const resolvedPath = pathToFileURL(modulePath).href;
  return require(resolvedPath);
}

const config_default = {
  DEFAULT_CONFIG_FILE_NAME,
  set(content) {
    customConfigContent = content;
  },
  shouldExist() {
    if (customConfigContent !== null) return true;
    return fs.access(getConfigPath()).then(() => true).catch(() => false);
  },
  shouldNotExist() {
    if (customConfigContent !== null) return false;
    return fs.access(getConfigPath()).then(() => false).catch(() => true);
  },
  getConfigFilename() {
    return getConfigPath();
  },
  read() {
    if (customConfigContent !== null) return Promise.resolve(customConfigContent);
    return fs.readFile(getConfigPath(), 'utf8');
  }
};

export { config_default as default };
