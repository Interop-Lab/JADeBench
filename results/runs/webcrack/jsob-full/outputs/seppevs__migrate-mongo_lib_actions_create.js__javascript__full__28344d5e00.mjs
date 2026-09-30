var now = (_0x5d1ac2 = Date.now()) => {
  const _0x412c17 = new Date(_0x5d1ac2);
  return new Date(_0x412c17.getUTCFullYear(), _0x412c17.getUTCMonth(), _0x412c17.getUTCDate(), _0x412c17.getUTCHours(), _0x412c17.getUTCMinutes(), _0x412c17.getUTCSeconds(), _0x412c17.getUTCMilliseconds());
};
var nowAsString = () => {
  const _0x44c66f = now();
  const _0x63f9cb = ("0" + (_0x44c66f.getMonth() + 1)).slice(-2);
  const _0x531e2c = ("0" + _0x44c66f.getDate()).slice(-2);
  const _0x214b83 = ("0" + _0x44c66f.getHours()).slice(-2);
  const _0xed7d9b = ("0" + _0x44c66f.getMinutes()).slice(-2);
  const _0x58de39 = ("0" + _0x44c66f.getSeconds()).slice(-2);
  return "" + _0x44c66f.getFullYear() + _0x63f9cb + _0x531e2c + _0x214b83 + _0xed7d9b + _0x58de39;
};
const _0x105af1 = {
  now: now,
  nowAsString: nowAsString
};
var date_default = _0x105af1;
import { createRequire } from "module";
import { pathToFileURL } from "url";
import _0x134077 from "path";
var module_loader_default = {
  require(_0x1bf50e) {
    const _0x13cf99 = createRequire(pathToFileURL(_0x134077.join(process.cwd(), "package.json")));
    return _0x13cf99(_0x1bf50e);
  },
  import(_0x2d940d) {
    return import(_0x2d940d);
  }
};
import _0x8785ba from "fs/promises";
import _0x59df97 from "path";
import _0x1c6c53 from "url";
var DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
var customConfigContent = null;
function getConfigPath() {
  const _0x3fa869 = global.options?.file ?? null;
  if (!_0x3fa869) {
    return _0x59df97.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }
  if (_0x59df97.isAbsolute(_0x3fa869)) {
    return _0x3fa869;
  }
  return _0x59df97.join(process.cwd(), _0x3fa869);
}
function getModuleExports(_0x4115d5) {
  if (_0x4115d5.default) {
    return _0x4115d5.default;
  } else {
    return _0x4115d5;
  }
}
var config_default = {
  DEFAULT_CONFIG_FILE_NAME: DEFAULT_CONFIG_FILE_NAME,
  set(_0x37a190) {
    customConfigContent = _0x37a190;
  },
  async shouldExist() {
    if (!customConfigContent) {
      const _0x3bd9d0 = getConfigPath();
      try {
        await _0x8785ba.stat(_0x3bd9d0);
      } catch (_0x4a38dd) {
        throw new Error("config file does not exist: " + _0x3bd9d0);
      }
    }
  },
  async shouldNotExist() {
    if (!customConfigContent) {
      const _0xbae9a9 = getConfigPath();
      const _0x18f255 = new Error("config file already exists: " + _0xbae9a9);
      try {
        await _0x8785ba.stat(_0xbae9a9);
        throw _0x18f255;
      } catch (_0x153448) {
        if (_0x153448.code !== "ENOENT") {
          throw _0x18f255;
        }
      }
    }
  },
  getConfigFilename() {
    return _0x59df97.basename(getConfigPath());
  },
  async read() {
    if (customConfigContent) {
      return customConfigContent;
    }
    const _0x311b6d = getConfigPath();
    try {
      let _0x176b4b = await module_loader_default.require(_0x311b6d);
      _0x176b4b = getModuleExports(_0x176b4b);
      if (global.options?.migrationsDir) {
        _0x176b4b = {
          ..._0x176b4b,
          migrationsDir: global.options.migrationsDir
        };
      }
      return _0x176b4b;
    } catch (_0x88d1c8) {
      if (_0x88d1c8.code === "ERR_REQUIRE_ESM" || _0x88d1c8.code === "ERR_REQUIRE_ASYNC_MODULE") {
        let _0x2454c9 = await module_loader_default.import(_0x1c6c53.pathToFileURL(_0x311b6d));
        let _0x13f786 = getModuleExports(_0x2454c9);
        if (global.options?.migrationsDir) {
          _0x13f786 = {
            ..._0x13f786,
            migrationsDir: global.options.migrationsDir
          };
        }
        return _0x13f786;
      }
      throw _0x88d1c8;
    }
  }
};
import _0x586cef from "fs/promises";
import _0x118eca from "path";
import _0x5d5062 from "url";
import _0x588474 from "crypto";
var DEFAULT_MIGRATIONS_DIR_NAME = "migrations";
var DEFAULT_MIGRATION_EXT = ".js";
async function resolveMigrationsDirPath() {
  let _0x2f8384;
  try {
    const _0x2aa592 = await config_default.read();
    _0x2f8384 = _0x2aa592.migrationsDir;
    if (!_0x2f8384) {
      _0x2f8384 = DEFAULT_MIGRATIONS_DIR_NAME;
    }
  } catch (_0x39693c) {
    _0x2f8384 = DEFAULT_MIGRATIONS_DIR_NAME;
  }
  if (_0x118eca.isAbsolute(_0x2f8384)) {
    return _0x2f8384;
  }
  return _0x118eca.join(process.cwd(), _0x2f8384);
}
async function resolveMigrationFileExtension() {
  let _0x35cddb;
  try {
    const _0xbddd3b = await config_default.read();
    _0x35cddb = _0xbddd3b.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  } catch (_0x4caae8) {
    _0x35cddb = DEFAULT_MIGRATION_EXT;
  }
  if (_0x35cddb && !_0x35cddb.startsWith(".")) {
    throw new Error("migrationFileExtension must start with dot");
  }
  return _0x35cddb;
}
async function resolveSampleMigrationFileName() {
  const _0x1f1f39 = await resolveMigrationFileExtension();
  return "sample-migration" + _0x1f1f39;
}
async function resolveSampleMigrationPath() {
  const _0x574e2d = await resolveMigrationsDirPath();
  const _0x521747 = await resolveSampleMigrationFileName();
  return _0x118eca.join(_0x574e2d, _0x521747);
}
function getModuleExports2(_0x5eba6b) {
  if (_0x5eba6b.default) {
    return _0x5eba6b.default;
  } else {
    return _0x5eba6b;
  }
}
var migrationsDir_default = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath: resolveSampleMigrationPath,
  resolveMigrationFileExtension: resolveMigrationFileExtension,
  async shouldExist() {
    const _0x447e40 = await resolveMigrationsDirPath();
    try {
      await _0x586cef.stat(_0x447e40);
    } catch (_0x4bda6e) {
      throw new Error("migrations directory does not exist: " + _0x447e40);
    }
  },
  async shouldNotExist() {
    const _0x425b89 = await resolveMigrationsDirPath();
    const _0x3e30d5 = new Error("migrations directory already exists: " + _0x425b89);
    try {
      await _0x586cef.stat(_0x425b89);
      throw _0x3e30d5;
    } catch (_0x6ce046) {
      if (_0x6ce046.code !== "ENOENT") {
        throw _0x3e30d5;
      }
    }
  },
  async getFileNames() {
    const _0x52a700 = await resolveMigrationsDirPath();
    const _0x1fc0e8 = await resolveMigrationFileExtension();
    const _0x33b634 = await _0x586cef.readdir(_0x52a700);
    const _0x59d13d = await resolveSampleMigrationFileName();
    return _0x33b634.filter(_0x32bc66 => _0x118eca.extname(_0x32bc66) === _0x1fc0e8 && _0x118eca.basename(_0x32bc66) !== _0x59d13d).sort();
  },
  async loadMigration(_0x4f7c48) {
    const _0x3c1f5b = await resolveMigrationsDirPath();
    const _0x482e3a = _0x118eca.join(_0x3c1f5b, _0x4f7c48);
    try {
      const _0x1746d3 = module_loader_default.require(_0x482e3a);
      return getModuleExports2(_0x1746d3);
    } catch (_0x1f20eb) {
      if (_0x1f20eb.code === "ERR_REQUIRE_ESM" || _0x1f20eb.code === "ERR_REQUIRE_ASYNC_MODULE") {
        const _0x2d0e95 = await module_loader_default.import(_0x5d5062.pathToFileURL(_0x482e3a));
        return getModuleExports2(_0x2d0e95);
      }
      throw _0x1f20eb;
    }
  },
  async loadFileHash(_0x375431) {
    const _0x2a4f2b = await resolveMigrationsDirPath();
    const _0x1e11f4 = _0x118eca.join(_0x2a4f2b, _0x375431);
    const _0x1b9a4b = _0x588474.createHash("sha256");
    const _0x312844 = await _0x586cef.readFile(_0x1e11f4);
    _0x1b9a4b.update(_0x312844);
    return _0x1b9a4b.digest("hex");
  },
  async doesSampleMigrationExist() {
    const _0x2df72e = await resolveSampleMigrationPath();
    try {
      await _0x586cef.stat(_0x2df72e);
      return true;
    } catch (_0x1b3188) {
      return false;
    }
  }
};
import _0x4e09c2 from "fs/promises";
import _0xaf0cf0 from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = _0xaf0cf0.dirname(__filename);
var create_default = async _0x346981 => {
  if (!_0x346981) {
    throw new Error("Missing parameter: description");
  }
  await migrationsDir_default.shouldExist();
  const _0x3451e3 = await migrationsDir_default.resolve();
  const _0x13958b = await migrationsDir_default.resolveMigrationFileExtension();
  let _0x49f36c;
  if (await migrationsDir_default.doesSampleMigrationExist()) {
    _0x49f36c = await migrationsDir_default.resolveSampleMigrationPath();
  } else {
    const _0x2cd76d = await config_default.read();
    _0x49f36c = _0xaf0cf0.join(__dirname, "../../samples/" + _0x2cd76d.moduleSystem + "/migration.js");
  }
  const _0x219faa = date_default.nowAsString() + "-" + _0x346981.split(" ").join("_") + _0x13958b;
  const _0x1cbd9f = _0xaf0cf0.join(_0x3451e3, _0x219faa);
  await _0x4e09c2.cp(_0x49f36c, _0x1cbd9f);
  return _0x219faa;
};
export { create_default as default };