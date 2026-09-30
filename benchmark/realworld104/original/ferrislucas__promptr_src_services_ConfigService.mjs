// ../work/ferrislucas__promptr/src/services/FileService.js
import fs from "fs";
var FileService = class {
  static async write(data, filePath) {
    await fs.promises.writeFile(filePath, data);
  }
  static async load(filePath) {
    const fileDoesNotExist = !await this.fileExists(filePath);
    if (fileDoesNotExist) return null;
    try {
      const data = await fs.promises.readFile(filePath, "utf-8");
      return data;
    } catch (err) {
      this.log(err);
      return null;
    }
  }
  static async fileExists(filePath) {
    return fs.existsSync(filePath);
  }
  static log(message) {
    console.log(message);
  }
};

// ../work/ferrislucas__promptr/src/services/ConfigService.js
import fs2 from "fs";
var ConfigService = class {
  static async retrieveConfig() {
    const config = {
      api: { model: "text-davinci-003", temperature: 0.5 },
      settings: {
        maxTokens: 4097
      }
    };
    const userHomeDir = process.env.HOME;
    const configPath = `${userHomeDir}/.promptr.json`;
    const fileExists = await FileService.fileExists(configPath);
    if (fileExists) {
      try {
        const data = await fs2.promises.readFile(configPath, "utf-8");
        return JSON.parse(data);
      } catch (err) {
        console.log(err);
        return config;
      }
    }
    return config;
  }
};
export {
  ConfigService as default
};
