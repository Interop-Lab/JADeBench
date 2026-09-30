import fs from 'fs';

class FileService {
  static async fileExists(path) {
    return fs.existsSync(path);
  }
}

class ConfigService {
  static async retrieveConfig() {
    const defaultConfig = {
      settings: {
        model: 'text-davinci-003',
        temperature: 0.5,
      },
      api: {
        maxTokens: 4097,
      },
    };

    const configPath = `${process.env.HOME}/.prompter.json`;
    if (await FileService.fileExists(configPath)) {
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
