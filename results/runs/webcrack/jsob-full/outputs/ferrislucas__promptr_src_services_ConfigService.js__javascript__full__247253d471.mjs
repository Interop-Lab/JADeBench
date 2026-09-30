import _0x394c11 from "fs";
var FileService = class {
  static async write(_0x5e7206, _0x50b410) {
    await _0x394c11.promises.writeFile(_0x50b410, _0x5e7206);
  }
  static async load(_0x48f633) {
    const _0x919621 = !(await this.fileExists(_0x48f633));
    if (_0x919621) {
      return null;
    }
    try {
      const _0x5002a7 = await _0x394c11.promises.readFile(_0x48f633, "utf-8");
      return _0x5002a7;
    } catch (_0x4531b1) {
      this.log(_0x4531b1);
      return null;
    }
  }
  static async fileExists(_0x1535e9) {
    return _0x394c11.existsSync(_0x1535e9);
  }
  static log(_0x31ce76) {
    console.log(_0x31ce76);
  }
};
import _0x4b684a from "fs";
var ConfigService = class {
  static async retrieveConfig() {
    const _0x4c9015 = {
      api: {
        model: "text-davinci-003",
        temperature: 0.5
      },
      settings: {
        maxTokens: 4097
      }
    };
    const _0x1416d3 = process.env.HOME;
    const _0xd8c13a = _0x1416d3 + "/.promptr.json";
    const _0x521c49 = await FileService.fileExists(_0xd8c13a);
    if (_0x521c49) {
      try {
        const _0x4fb863 = await _0x4b684a.promises.readFile(_0xd8c13a, "utf-8");
        return JSON.parse(_0x4fb863);
      } catch (_0x14a035) {
        console.log(_0x14a035);
        return _0x4c9015;
      }
    }
    return _0x4c9015;
  }
};
export { ConfigService as default };