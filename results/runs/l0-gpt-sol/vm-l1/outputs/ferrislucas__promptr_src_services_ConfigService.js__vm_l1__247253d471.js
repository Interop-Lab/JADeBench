import fs from "fs";
import fs2 from "fs";

class FileService {
  static write(filePath, data) {
    fs.writeFileSync(
      FileService.resolve(filePath),
      JSON.stringify(data, null, 2),
      "utf8"
    );
  }

  static load(filePath) {
    const resolvedPath = FileService.resolve(filePath);
    const contents = fs2.readFileSync(resolvedPath, "utf8");
    return JSON.parse(contents);
  }

  static resolve(filePath) {
    return filePath.replace("~", process.env.HOME);
  }

  static fileExists(filePath) {
    return fs.existsSync(FileService.resolve(filePath));
  }
}

globalThis.FileService = FileService;

class ConfigService {
  static retrieveConfig() {
    const configPath = FileService.resolve("~/.config/config.json");

    if (!FileService.fileExists(configPath)) {
      return {};
    }

    try {
      return FileService.load(configPath);
    } catch (error) {
      console.log(error);
      return {};
    }
  }
}

globalThis.ConfigService = ConfigService;

export { ConfigService as default };
