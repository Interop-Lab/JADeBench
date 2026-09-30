import fs from 'fs';

class FileService {
  static async write(data, path) {
    await fs.promises.writeFile(path, data);
  }

  static async load(path) {
    try {
      if (await this.fileExists(path)) {
        return await fs.promises.readFile(path, 'utf8');
      }
    } catch (error) {
      this.log(error);
    }
    return null;
  }

  static async fileExists(path) {
    return fs.existsSync(path);
  }

  static log(message) {
    console.log(message);
  }
}

globalThis.FileService = FileService;

class ConfigService {
  static async retrieveConfig() {
    const defaults = {
      api: {
        model: 'text-davinci-003',
        temperature: 0.5,
      },
      settings: {
        maxTokens: 4097,
      },
    };

    try {
      const config = await FileService.load(`${process.env.HOME}/.promptr.json`);
      if (config) {
        return JSON.parse(config);
      }
    } catch (error) {
      FileService.log(error);
    }

    return defaults;
  }
}

globalThis.ConfigService = ConfigService;

export { ConfigService as default };
