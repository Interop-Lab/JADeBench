import fs from "fs";

class FileService {
  static async writeFile(data, path) {
    await fs.promises.writeFile(path, data);
  }

  static async readFile(path) {
    if (!(await this.exists(path))) {
      return null;
    }

    try {
      return await fs.promises.readFile(path, "utf8");
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  static async exists(path) {
    return fs.existsSync(path);
  }

  static handleError(error) {
    console.error(error);
  }
}

class ConfigService {
  static async getConfig() {
    const defaultConfig = {
      openai: {
        model: "gpt-3.5-turbo",
        temperature: 0.5
      },
      context: {
        maxTokens: 4097
      }
    };

    const configPath = process.env.HOME + "/.chatgpt/config.json";

    if (await FileService.exists(configPath)) {
      try {
        const contents = await fs.promises.readFile(configPath, "utf8");
        return JSON.parse(contents);
      } catch (error) {
        console.error(error);
        return defaultConfig;
      }
    }

    return defaultConfig;
  }
}

export { ConfigService as default };
