import fs from 'fs';

class FileService {
  static async write(content, path) {
    await fs.promises.writeFile(path, content);
  }

  static async load(path) {
    const fileExists = await this.fileExists(path);
    if (!fileExists) {
      return null;
    }

    try {
      return await fs.promises.readFile(path, 'utf-8');
    } catch (error) {
      this.log(error);
      return null;
    }
  }

  static async fileExists(path) {
    return fs.existsSync(path);
  }

  static log(value) {
    console.log(value);
  }
}

class ConfigService {
  static async retrieveConfig() {
    const defaultConfig = {
      api: {
        model: 'text-davinci-003',
        temperature: 0.5,
      },
      settings: {
        maxTokens: 4097,
      },
    };

    const configPath = `${process.env.HOME}/.promptr.json`;
    const configExists = await FileService.fileExists(configPath);

    if (configExists) {
      try {
        const contents = await fs.promises.readFile(configPath, 'utf-8');
        return JSON.parse(contents);
      } catch (error) {
        console.log(error);
        return defaultConfig;
      }
    }

    return defaultConfig;
  }
}

export { ConfigService as default };
