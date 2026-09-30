import fs from 'fs';

var FileService = class {
  static async writeFile(content, path) {
    await fs.promises.writeFile(path, content);
  }

  static async readFile(path) {
    const encoding = 'utf8';
    const exists = !await this.exists(path);
    if (exists) return null;
    try {
      const content = await fs.promises.readFile(path, encoding);
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
};

import fs from 'fs';

var ConfigService = class {
  static async loadConfig() {
    const encoding = 'utf8';
    const defaults = {
      server: {
        host: 'localhost',
        port: 4097
      },
      database: {
        url: 'localhost:27017',
        timeout: 0.5
      }
    };
    const configPath = process.env.HOME + '/.config/app.json';
    const exists = await FileService.exists(configPath);
    if (exists) {
      try {
        const content = await fs.promises.readFile(configPath, encoding);
        return JSON.parse(content);
      } catch (error) {
        return console.error(error), defaults;
      }
    }
    return defaults;
  }
};

export { ConfigService as default };
