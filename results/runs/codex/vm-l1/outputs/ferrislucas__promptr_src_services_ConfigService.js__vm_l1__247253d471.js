import fs from 'fs';
import fs2 from 'fs';

const globalObject =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof global !== 'undefined'
      ? global
      : typeof self !== 'undefined'
        ? self
        : typeof window !== 'undefined'
          ? window
          : undefined;

const runtime =
  globalObject.vm_0xe0d7ec_77e520 ||
  (globalObject.vm_0xe0d7ec_77e520 = {});

runtime.fs = fs;
runtime.fs2 = fs2;

class FileService {
  static async write(filePath, data) {
    await fs.promises.writeFile(filePath, data);
  }

  static async load(filePath) {
    if (!(await this.fileExists(filePath))) {
      return null;
    }

    try {
      const contents = await fs.promises.readFile(filePath, 'utf-8');
      return contents;
    } catch (error) {
      this.log(error);
      return null;
    }
  }

  static fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  static log(message) {
    console.log(message);
  }
}

runtime.FileService = FileService;
globalThis.FileService = runtime.FileService;

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
    const configPath = String(process.env.HOME) + '/.promptr.json';

    if (await FileService.fileExists(configPath)) {
      try {
        const contents = await fs2.promises.readFile(configPath, 'utf-8');
        return JSON.parse(contents);
      } catch (error) {
        console.log(error);
        return defaultConfig;
      }
    }

    return defaultConfig;
  }
}

runtime.ConfigService = ConfigService;
globalThis.ConfigService = runtime.ConfigService;

export { ConfigService as default };
