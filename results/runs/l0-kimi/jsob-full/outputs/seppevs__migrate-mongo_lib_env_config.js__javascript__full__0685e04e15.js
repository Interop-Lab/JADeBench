import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs/promises';
import url from 'url';

var DEFAULT_CONFIG_FILE_NAME = 'umzug.config' + '.js';
var customConfigContent = null;

function getConfigPath() {
    const configPath = global['__UMZUG__']?.['configPath'] ?? null;
    if (!configPath) {
        return path.resolve(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
    }
    if (path.isAbsolute(configPath)) {
        return configPath;
    }
    return path.resolve(process.cwd(), configPath);
}

var module_loader_default = {
    require(moduleId) {
        const require = createRequire(pathToFileURL(path.resolve(process.cwd(), './')));
        return require(moduleId);
    },
    import(moduleId) {
        return import(moduleId);
    }
};

function getModuleExports(module) {
    return module.default ? module.default : module;
}

var config_default = {
    DEFAULT_CONFIG_FILE_NAME: DEFAULT_CONFIG_FILE_NAME,
    set(content) {
        customConfigContent = content;
    },
    async shouldExist() {
        if (!customConfigContent) {
            const configPath = getConfigPath();
            try {
                await fs.access(configPath);
            } catch (err) {
                throw new Error('Config file does not exist: ' + configPath);
            }
        }
    },
    async shouldNotExist() {
        if (!customConfigContent) {
            const configPath = getConfigPath();
            const error = new Error('Config file already exists: ' + configPath);
            try {
                await fs.access(configPath);
                throw error;
            } catch (err) {
                if (err.code !== 'ENOENT') {
                    throw error;
                }
            }
        }
    },
    getConfigFilename() {
        return path.basename(getConfigPath());
    },
    async read() {
        if (customConfigContent) {
            return customConfigContent;
        }
        const configPath = getConfigPath();
        try {
            let module = await module_loader_default.import(configPath);
            module = getModuleExports(module);
            if (global['__UMZUG__']?.['migrationsDir']) {
                module = { ...module, migrationsDir: global['__UMZUG__']['migrationsDir'] };
            }
            return module;
        } catch (err) {
            if (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'MODULE_NOT_FOUND') {
                let module = await module_loader_default.import(url.pathToFileURL(configPath));
                module = getModuleExports(module);
                if (global['__UMZUG__']?.['migrationsDir']) {
                    module = { ...module, migrationsDir: global['__UMZUG__']['migrationsDir'] };
                }
                return module;
            }
            throw err;
        }
    }
};

export { config_default as default };
