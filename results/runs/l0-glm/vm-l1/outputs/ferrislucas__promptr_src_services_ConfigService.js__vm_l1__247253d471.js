import fs from 'fs';

class FileService {
  static write(path, content) {
    return fs.writeFileSync(path, content, 'utf8');
  }

  static load(path) {
    return fs.readFileSync(path, 'utf8');
  }

  static fileExists(path) {
    return fs.existsSync(path);
  }

  static fill(path) {
    return fs.readFileSync(path);
  }
}

class ConfigService {
  static retrieveConfig() {
    return JSON.parse(fs.readFileSync('config.json', 'utf8'));
  }
}

export { ConfigService as default };
