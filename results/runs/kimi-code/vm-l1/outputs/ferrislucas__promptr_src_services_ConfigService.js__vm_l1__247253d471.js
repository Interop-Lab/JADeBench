import fs from 'fs';

class FileService {
  static async write(content, path) {
    await fs.promises.writeFile(path, content);
  }

  static async load(path) {
    if (!this.fileExists(path)) {
      return null;
    }

    try {
      return await fs.promises.readFile(path, 'utf-8');
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  static fileExists(path) {
    return fs.existsSync(path);
  }

  static log(message) {
    console.log(message);
  }
}

globalThis.FileService = FileService;

class ConfigService {
  static async retrieveConfig() {
    const configPath = `${process.env.HOME}/.promptr.json`;

    if (FileService.fileExists(configPath)) {
      const config = await FileService.load(configPath);
      if (config) {
        return JSON.parse(config);
      }
    }

    return {
      api: {
        model: 'text-davinci-003',
        temperature: 0.5,
      },
      settings: {
        maxTokens: 4097,
      },
    };
  }
}

globalThis.ConfigService = ConfigService;

export { ConfigService as default };
