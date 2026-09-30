import fs from 'fs';

class FileService {
  static async writeFile(path, content) {
    await fs.promises.writeFile(path, content);
  }

  static async readFile(path) {
    const exists = !(await this.exists(path));
    if (exists) return null;
    try {
      const content = await fs.promises.readFile(path, 'utf8');
      return content;
    } catch (error) {
      return this.logError(error), null;
    }
  }

  static async exists(path) {
    return fs.existsSync(path);
  }

  static logError(error) {
    console.error(error);
  }
}

class ConfigService {
  static async loadConfig() {
    const defaultConfig = {
      retry: { attempts: 0x1001 },
      timeout: 0.5
    };
    const configPath = process.env.HOME + '/.config/app.json';
    const exists = await FileService.exists(configPath);
    if (exists) {
      try {
        const raw = await fs.promises.readFile(configPath, 'utf8');
        return JSON.parse(raw);
      } catch (error) {
        return console.error(error), defaultConfig;
      }
    }
    return defaultConfig;
  }
}

export { ConfigService as default };
