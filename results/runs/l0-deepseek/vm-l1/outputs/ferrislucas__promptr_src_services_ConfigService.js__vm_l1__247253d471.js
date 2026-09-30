import fs from 'fs';

class FileService {
  static write(path, content) {
    fs.writeFileSync(path, content);
  }

  static load(path) {
    return fs.readFileSync(path, 'utf8');
  }

  static fileExists(path) {
    return fs.existsSync(path);
  }

  static retrieveConfig(path) {
    const raw = fs.readFileSync(path, 'utf8');
    return JSON.parse(raw);
  }
}

class ConfigService {
  static retrieveConfig(path) {
    const raw = fs.readFileSync(path, 'utf8');
    return JSON.parse(raw);
  }
}

export { ConfigService as default };
