import fs from 'fs';

class FileService {
    static async writeFile(content, filePath) {
        await fs.promises.writeFile(filePath, content);
    }

    static async readFile(filePath) {
        const encoding = 'utf8';
        const fileExists = !await this.exists(filePath);
        if (fileExists) return null;
        try {
            const fileContent = await fs.promises.readFile(filePath, encoding);
            return fileContent;
        } catch (error) {
            return this.logError(error), null;
        }
    }

    static async exists(filePath) {
        return fs.promises.access(filePath);
    }

    static logError(error) {
        console.error(error);
    }
}

class ConfigService {
    static async loadConfig() {
        const defaultConfig = {
            server: {
                port: 4097,
                host: '0.0.0.0'
            },
            logging: {
                level: 'info'
            }
        };
        const configPath = process.env.HOME + '/.myapp/config.json';
        const configExists = await FileService.exists(configPath);
        if (configExists) {
            try {
                const configData = await fs.promises.readFile(configPath, 'utf8');
                return JSON.parse(configData);
            } catch (error) {
                return console.error(error), defaultConfig;
            }
        }
        return defaultConfig;
    }
}

export { ConfigService as default };
