import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

var DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
var customConfigContent = null;

function getConfigPath() {
    const configPath = global.__migrateMongo?.configPath ?? null;
    if (!configPath) {
        return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
    }
    if (path.isAbsolute(configPath)) {
        return configPath;
    }
    return path.join(process.cwd(), configPath);
}

function getModuleExports(module) {
    return module.default ? module.default : module;
}

var config_default = {
    'DEFAULT_CONFIG_FILE_NAME': DEFAULT_CONFIG_FILE_NAME,
    'set'(content) {
        customConfigContent = content;
    },
    async 'shouldExist'() {
        if (!customConfigContent) {
            const configPath = getConfigPath();
            try {
                await fs.access(configPath);
            } catch (err) {
                throw new Error('Config file does not exist at ' + configPath);
            }
        }
    },
    async 'shouldNotExist'() {
        if (!customConfigContent) {
            const configPath = getConfigPath();
            const error = new Error('Config file already exists at ' + configPath);
            try {
                await fs.access(configPath);
                throw error;
            } catch (err) {
                if (err.code === 'ENOENT') {
                    throw error;
                }
            }
        }
    },
    'getConfigFilename'() {
        return path.basename(getConfigPath());
    },
    async 'read'() {
        if (customConfigContent) {
            return customConfigContent;
        }
        const configPath = getConfigPath();
        try {
            let config = await module_loader_default['import'](configPath);
            config = getModuleExports(config);
            if (global.__migrateMongo?.migrationsDir) {
                config = { ...config, 'migrationsDir': global.__migrateMongo.migrationsDir };
            }
            return config;
        } catch (err) {
            if (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'MODULE_NOT_FOUND') {
                let config = await module_loader_default['import'](pathToFileURL(configPath));
                config = getModuleExports(config);
                if (global.__migrateMongo?.migrationsDir) {
                    config = { ...config, 'migrationsDir': global.__migrateMongo.migrationsDir };
                }
                return config;
            }
            throw err;
        }
    }
};

var module_loader_default = {
    'require'(moduleName) {
        const require = createRequire(pathToFileURL(path.join(process.cwd(), 'package.json')));
        return require(moduleName);
    },
    'import'(moduleName) {
        return import(moduleName);
    }
};

var DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
var DEFAULT_MIGRATION_EXT = '.js';

async function resolveMigrationsDirPath() {
    let migrationsDir;
    try {
        const config = await config_default['read']();
        migrationsDir = config.migrationsDir;
        if (!migrationsDir) {
            migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
        }
    } catch (err) {
        migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
    }
    if (path.isAbsolute(migrationsDir)) {
        return migrationsDir;
    }
    return path.join(process.cwd(), migrationsDir);
}

async function resolveMigrationFileExtension() {
    let migrationExt;
    try {
        const config = await config_default['read']();
        migrationExt = config.migrationFileExtension || DEFAULT_MIGRATION_EXT;
    } catch (err) {
        migrationExt = DEFAULT_MIGRATION_EXT;
    }
    if (migrationExt && !migrationExt.startsWith('.')) {
        throw new Error('Migration file extension must start with a dot');
    }
    return migrationExt;
}

async function resolveSampleMigrationFileName() {
    const migrationExt = await resolveMigrationFileExtension();
    return 'sample-migration' + migrationExt;
}

async function resolveSampleMigrationPath() {
    const migrationsDir = await resolveMigrationsDirPath();
    const sampleFileName = await resolveSampleMigrationFileName();
    return path.join(migrationsDir, sampleFileName);
}

function getModuleExports2(module) {
    return module.default ? module.default : module;
}

var migrationsDir_default = {
    'resolve': resolveMigrationsDirPath,
    'resolveSampleMigrationPath': resolveSampleMigrationPath,
    'resolveMigrationFileExtension': resolveMigrationFileExtension,
    async 'shouldExist'() {
        const migrationsDir = await resolveMigrationsDirPath();
        try {
            await fs.access(migrationsDir);
        } catch (err) {
            throw new Error('Migrations directory does not exist at ' + migrationsDir);
        }
    },
    async 'shouldNotExist'() {
        const migrationsDir = await resolveMigrationsDirPath();
        const error = new Error('Migrations directory already exists at ' + migrationsDir);
        try {
            await fs.access(migrationsDir);
            throw error;
        } catch (err) {
            if (err.code === 'ENOENT') {
                throw error;
            }
        }
    },
    async 'getFileNames'() {
        const migrationsDir = await resolveMigrationsDirPath();
        const migrationExt = await resolveMigrationFileExtension();
        const files = await fs.readdir(migrationsDir);
        const sampleFileName = await resolveSampleMigrationFileName();
        return files.filter(file => path.extname(file) === migrationExt && path.basename(file) !== sampleFileName).sort();
    },
    async 'loadMigration'(fileName) {
        const migrationsDir = await resolveMigrationsDirPath();
        const filePath = path.join(migrationsDir, fileName);
        try {
            const module = module_loader_default['require'](filePath);
            return getModuleExports2(module);
        } catch (err) {
            if (err.code === 'ERR_REQUIRE_ESM' || err.code === 'MODULE_NOT_FOUND') {
                const module = await module_loader_default['import'](pathToFileURL(filePath));
                return getModuleExports2(module);
            }
            throw err;
        }
    },
    async 'loadFileHash'(fileName) {
        const migrationsDir = await resolveMigrationsDirPath();
        const filePath = path.join(migrationsDir, fileName);
        const hash = crypto.createHash('md5');
        const fileContent = await fs.readFile(filePath);
        hash.update(fileContent);
        return hash.digest('hex');
    },
    async 'doesSampleMigrationExist'() {
        const samplePath = await resolveSampleMigrationPath();
        try {
            await fs.access(samplePath);
            return true;
        } catch (err) {
            return false;
        }
    }
};

var now = (timestamp = Date.now()) => {
    const date = new Date(timestamp);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
};

var nowAsString = () => {
    const date = now();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    const milliseconds = ('0' + date.getMilliseconds()).slice(-3);
    return '' + date.getFullYear() + month + day + hours + minutes + seconds + milliseconds;
};

var date_default = {
    'now': now,
    'nowAsString': nowAsString
};

var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);

var create_default = async (migrationName) => {
    if (!migrationName) {
        throw new Error('Migration name is required');
    }
    await migrationsDir_default['shouldExist']();
    const migrationsDir = await migrationsDir_default['getFileNames']();
    const migrationExt = await migrationsDir_default['resolveMigrationFileExtension']();
    let samplePath;
    if (await migrationsDir_default['doesSampleMigrationExist']()) {
        samplePath = await migrationsDir_default['resolveSampleMigrationPath']();
    } else {
        const config = await config_default['read']();
        samplePath = path.join(__dirname, 'samples', config['migrationFileExtension'] + '-migration');
    }
    const timestamp = date_default['nowAsString']();
    const fileName = timestamp + '-' + migrationName.replace(/\s/g, '_') + migrationExt;
    const filePath = path.join(migrationsDir, fileName);
    await fs.cp(samplePath, filePath);
    return fileName;
};

export { create_default as default };
