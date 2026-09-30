import fs from 'fs';
import configFs from 'fs';

const homeDirectory = process.env.HOME;

class FileService {
  static write(filePath, contents) {
    return fs.writeFileSync(filePath, contents, 'utf8');
  }

  static load(filePath) {
    return fs.readFileSync(filePath, 'utf8');
  }

  static fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  static log(message) {
    return console.log(message);
  }
}

globalThis.FileService = FileService;

class ConfigService {
  static retrieveConfig() {
    const config = configFs.readFileSync(
      `${homeDirectory}/.promptr/config.json`,
      'utf8',
    );
    return JSON.parse(config);
  }
}

globalThis.ConfigService = ConfigService;

export { ConfigService as default };
