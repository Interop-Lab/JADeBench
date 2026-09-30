import { createRequire } from "module";
import { pathToFileURL } from "url";
import _0xa8c7ca from "path";
var module_loader_default = {
  require(_0x511cd0) {
    const _0x4d1c66 = createRequire(pathToFileURL(_0xa8c7ca.join(process.cwd(), "package.json")));
    return _0x4d1c66(_0x511cd0);
  },
  import(_0x369a54) {
    return import(_0x369a54);
  }
};
import _0x565d86 from "fs/promises";
import _0x10c1d8 from "path";
import _0x3d94d1 from "url";
var DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
var customConfigContent = null;
function getConfigPath() {
  const _0x3ea6d8 = global.options?.file ?? null;
  if (!_0x3ea6d8) {
    return _0x10c1d8.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }
  if (_0x10c1d8.isAbsolute(_0x3ea6d8)) {
    return _0x3ea6d8;
  }
  return _0x10c1d8.join(process.cwd(), _0x3ea6d8);
}
function getModuleExports(_0x2117c1) {
  if (_0x2117c1.default) {
    return _0x2117c1.default;
  } else {
    return _0x2117c1;
  }
}
var config_default = {
  DEFAULT_CONFIG_FILE_NAME: DEFAULT_CONFIG_FILE_NAME,
  set(_0x312e79) {
    customConfigContent = _0x312e79;
  },
  async shouldExist() {
    if (!customConfigContent) {
      const _0x5be9b8 = getConfigPath();
      try {
        await _0x565d86.stat(_0x5be9b8);
      } catch (_0x3af58a) {
        throw new Error("config file does not exist: " + _0x5be9b8);
      }
    }
  },
  async shouldNotExist() {
    if (!customConfigContent) {
      const _0x5994f1 = getConfigPath();
      const _0x103988 = new Error("config file already exists: " + _0x5994f1);
      try {
        await _0x565d86.stat(_0x5994f1);
        throw _0x103988;
      } catch (_0x2567a2) {
        if (_0x2567a2.code !== "ENOENT") {
          throw _0x103988;
        }
      }
    }
  },
  getConfigFilename() {
    return _0x10c1d8.basename(getConfigPath());
  },
  async read() {
    if (customConfigContent) {
      return customConfigContent;
    }
    const _0x419428 = getConfigPath();
    try {
      let _0x5115a6 = await module_loader_default.require(_0x419428);
      _0x5115a6 = getModuleExports(_0x5115a6);
      if (global.options?.migrationsDir) {
        _0x5115a6 = {
          ..._0x5115a6,
          migrationsDir: global.options.migrationsDir
        };
      }
      return _0x5115a6;
    } catch (_0xf65deb) {
      if (_0xf65deb.code === "ERR_REQUIRE_ESM" || _0xf65deb.code === "ERR_REQUIRE_ASYNC_MODULE") {
        let _0x359d7a = await module_loader_default.import(_0x3d94d1.pathToFileURL(_0x419428));
        let _0xd07d9e = getModuleExports(_0x359d7a);
        if (global.options?.migrationsDir) {
          _0xd07d9e = {
            ..._0xd07d9e,
            migrationsDir: global.options.migrationsDir
          };
        }
        return _0xd07d9e;
      }
      throw _0xf65deb;
    }
  }
};
export { config_default as default };