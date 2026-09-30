import { createRequire } from "module";
import { pathToFileURL } from "url";
import _0x5cb93f from "path";
var module_loader_default = {
  require(_0x52ce44) {
    const _0x3a36de = createRequire(pathToFileURL(_0x5cb93f.join(process.cwd(), "package.json")));
    return _0x3a36de(_0x52ce44);
  },
  import(_0x2d671c) {
    return import(_0x2d671c);
  }
};
import _0x2957a5 from "fs/promises";
import _0x39826 from "path";
import _0x5deea0 from "url";
var DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
var customConfigContent = null;
function getConfigPath() {
  const _0x23a44b = global.options?.file ?? null;
  if (!_0x23a44b) {
    return _0x39826.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }
  if (_0x39826.isAbsolute(_0x23a44b)) {
    return _0x23a44b;
  }
  return _0x39826.join(process.cwd(), _0x23a44b);
}
function getModuleExports(_0x272320) {
  if (_0x272320.default) {
    return _0x272320.default;
  } else {
    return _0x272320;
  }
}
var config_default = {
  DEFAULT_CONFIG_FILE_NAME: DEFAULT_CONFIG_FILE_NAME,
  set(_0x2f6635) {
    customConfigContent = _0x2f6635;
  },
  async shouldExist() {
    if (!customConfigContent) {
      const _0x162a26 = getConfigPath();
      try {
        await _0x2957a5.stat(_0x162a26);
      } catch (_0x44ccb1) {
        throw new Error("config file does not exist: " + _0x162a26);
      }
    }
  },
  async shouldNotExist() {
    if (!customConfigContent) {
      const _0x1694e6 = getConfigPath();
      const _0x45c1b6 = new Error("config file already exists: " + _0x1694e6);
      try {
        await _0x2957a5.stat(_0x1694e6);
        throw _0x45c1b6;
      } catch (_0x522933) {
        if (_0x522933.code !== "ENOENT") {
          throw _0x45c1b6;
        }
      }
    }
  },
  getConfigFilename() {
    return _0x39826.basename(getConfigPath());
  },
  async read() {
    if (customConfigContent) {
      return customConfigContent;
    }
    const _0x5088ac = getConfigPath();
    try {
      let _0x391d47 = await module_loader_default.require(_0x5088ac);
      _0x391d47 = getModuleExports(_0x391d47);
      if (global.options?.migrationsDir) {
        _0x391d47 = {
          ..._0x391d47,
          migrationsDir: global.options.migrationsDir
        };
      }
      return _0x391d47;
    } catch (_0x3b7118) {
      if (_0x3b7118.code === "ERR_REQUIRE_ESM" || _0x3b7118.code === "ERR_REQUIRE_ASYNC_MODULE") {
        let _0x51de72 = await module_loader_default.import(_0x5deea0.pathToFileURL(_0x5088ac));
        let _0x117dbf = getModuleExports(_0x51de72);
        if (global.options?.migrationsDir) {
          _0x117dbf = {
            ..._0x117dbf,
            migrationsDir: global.options.migrationsDir
          };
        }
        return _0x117dbf;
      }
      throw _0x3b7118;
    }
  }
};
import _0x5cb29d from "fs/promises";
import _0x3b6cf9 from "path";
import _0x18bf77 from "url";
import _0x4be3f1 from "crypto";
var DEFAULT_MIGRATIONS_DIR_NAME = "migrations";
var DEFAULT_MIGRATION_EXT = ".js";
async function resolveMigrationsDirPath() {
  let _0x326ff9;
  try {
    const _0x6a722a = await config_default.read();
    _0x326ff9 = _0x6a722a.migrationsDir;
    if (!_0x326ff9) {
      _0x326ff9 = DEFAULT_MIGRATIONS_DIR_NAME;
    }
  } catch (_0x11881f) {
    _0x326ff9 = DEFAULT_MIGRATIONS_DIR_NAME;
  }
  if (_0x3b6cf9.isAbsolute(_0x326ff9)) {
    return _0x326ff9;
  }
  return _0x3b6cf9.join(process.cwd(), _0x326ff9);
}
async function resolveMigrationFileExtension() {
  let _0x131509;
  try {
    const _0x19ca4b = await config_default.read();
    _0x131509 = _0x19ca4b.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  } catch (_0x455b3d) {
    _0x131509 = DEFAULT_MIGRATION_EXT;
  }
  if (_0x131509 && !_0x131509.startsWith(".")) {
    throw new Error("migrationFileExtension must start with dot");
  }
  return _0x131509;
}
async function resolveSampleMigrationFileName() {
  const _0x44096d = await resolveMigrationFileExtension();
  return "sample-migration" + _0x44096d;
}
async function resolveSampleMigrationPath() {
  const _0x41eaf7 = await resolveMigrationsDirPath();
  const _0x5815ca = await resolveSampleMigrationFileName();
  return _0x3b6cf9.join(_0x41eaf7, _0x5815ca);
}
function getModuleExports2(_0x9346a0) {
  if (_0x9346a0.default) {
    return _0x9346a0.default;
  } else {
    return _0x9346a0;
  }
}
var migrationsDir_default = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath: resolveSampleMigrationPath,
  resolveMigrationFileExtension: resolveMigrationFileExtension,
  async shouldExist() {
    const _0x57f92d = await resolveMigrationsDirPath();
    try {
      await _0x5cb29d.stat(_0x57f92d);
    } catch (_0x256e63) {
      throw new Error("migrations directory does not exist: " + _0x57f92d);
    }
  },
  async shouldNotExist() {
    const _0x3357de = await resolveMigrationsDirPath();
    const _0x2116e4 = new Error("migrations directory already exists: " + _0x3357de);
    try {
      await _0x5cb29d.stat(_0x3357de);
      throw _0x2116e4;
    } catch (_0x4d9641) {
      if (_0x4d9641.code !== "ENOENT") {
        throw _0x2116e4;
      }
    }
  },
  async getFileNames() {
    const _0x203f17 = await resolveMigrationsDirPath();
    const _0x305389 = await resolveMigrationFileExtension();
    const _0x243eb3 = await _0x5cb29d.readdir(_0x203f17);
    const _0x427fb0 = await resolveSampleMigrationFileName();
    return _0x243eb3.filter(_0x15f633 => _0x3b6cf9.extname(_0x15f633) === _0x305389 && _0x3b6cf9.basename(_0x15f633) !== _0x427fb0).sort();
  },
  async loadMigration(_0x2ae1be) {
    const _0x4cb4db = await resolveMigrationsDirPath();
    const _0x4a8a7c = _0x3b6cf9.join(_0x4cb4db, _0x2ae1be);
    try {
      const _0x17c2a7 = module_loader_default.require(_0x4a8a7c);
      return getModuleExports2(_0x17c2a7);
    } catch (_0xde8eb2) {
      if (_0xde8eb2.code === "ERR_REQUIRE_ESM" || _0xde8eb2.code === "ERR_REQUIRE_ASYNC_MODULE") {
        const _0x27b460 = await module_loader_default.import(_0x18bf77.pathToFileURL(_0x4a8a7c));
        return getModuleExports2(_0x27b460);
      }
      throw _0xde8eb2;
    }
  },
  async loadFileHash(_0x24e70d) {
    const _0x1db5e8 = await resolveMigrationsDirPath();
    const _0x5c1bd = _0x3b6cf9.join(_0x1db5e8, _0x24e70d);
    const _0x13d950 = _0x4be3f1.createHash("sha256");
    const _0x5104e8 = await _0x5cb29d.readFile(_0x5c1bd);
    _0x13d950.update(_0x5104e8);
    return _0x13d950.digest("hex");
  },
  async doesSampleMigrationExist() {
    const _0x254169 = await resolveSampleMigrationPath();
    try {
      await _0x5cb29d.stat(_0x254169);
      return true;
    } catch (_0x5f48d9) {
      return false;
    }
  }
};
var status_default = async _0x656758 => {
  await migrationsDir_default.shouldExist();
  await config_default.shouldExist();
  const _0x44c1c8 = await migrationsDir_default.getFileNames();
  const {
    changelogCollectionName: _0x4241e9,
    useFileHash: _0x217cdf
  } = await config_default.read();
  const _0xb519bc = _0x656758.collection(_0x4241e9);
  const _0x3b3cb5 = await _0xb519bc.find({}).toArray();
  const _0x39af6e = _0x217cdf === true;
  const _0x454dd7 = await Promise.all(_0x44c1c8.map(async _0x58ae17 => {
    let _0xaa406e;
    const _0xb5883d = {
      fileName: _0x58ae17
    };
    let _0x2769e8 = _0xb5883d;
    if (_0x39af6e) {
      _0xaa406e = await migrationsDir_default.loadFileHash(_0x58ae17);
      const _0x333b84 = {
        fileName: _0x58ae17,
        fileHash: _0xaa406e
      };
      _0x2769e8 = _0x333b84;
    }
    const _0x5009e8 = _0x3b3cb5.find(_0x31f590 => _0x31f590.fileName === _0x2769e8.fileName && (!_0x2769e8.fileHash || _0x31f590.fileHash === _0x2769e8.fileHash));
    const _0x2729c0 = _0x5009e8 ? _0x5009e8.appliedAt.toJSON() : "PENDING";
    const _0x58d042 = _0x5009e8 ? _0x5009e8.migrationBlock : undefined;
    const _0x14fbe3 = {
      fileName: _0x58ae17,
      fileHash: _0xaa406e,
      appliedAt: _0x2729c0,
      migrationBlock: _0x58d042
    };
    const _0x28d335 = {
      fileName: _0x58ae17,
      appliedAt: _0x2729c0,
      migrationBlock: _0x58d042
    };
    if (_0x217cdf) {
      return _0x14fbe3;
    } else {
      return _0x28d335;
    }
  }));
  return _0x454dd7;
};
async function getLockCollection(_0x2a4a9b) {
  const {
    lockCollectionName: _0x532e85,
    lockTtl: _0x127a7b
  } = await config_default.read();
  if (!_0x532e85 || _0x127a7b <= 0) {
    return null;
  }
  const _0x13015f = _0x2a4a9b.collection(_0x532e85);
  const _0x152c9d = {
    expireAfterSeconds: _0x127a7b
  };
  _0x13015f.createIndex({
    createdAt: 1
  }, _0x152c9d);
  return _0x13015f;
}
async function exist(_0x5323c7) {
  const _0x72d471 = await getLockCollection(_0x5323c7);
  if (!_0x72d471) {
    return false;
  }
  const _0x1a2197 = await _0x72d471.find({}).toArray();
  return _0x1a2197.length > 0;
}
async function activate(_0x19f109) {
  const _0x28baf7 = await getLockCollection(_0x19f109);
  if (_0x28baf7) {
    await _0x28baf7.insertOne({
      createdAt: new Date()
    });
  }
}
async function clear(_0x2ef69f) {
  const _0x438ad3 = await getLockCollection(_0x2ef69f);
  if (_0x438ad3) {
    await _0x438ad3.deleteMany({});
  }
}
const _0x1ac8fd = {
  exist: exist,
  activate: activate,
  clear: clear
};
var lock_default = _0x1ac8fd;
var up_default = async (_0x5be0ec, _0x504aaf) => {
  const _0x576a58 = await status_default(_0x5be0ec);
  const _0x495228 = _0x576a58.filter(_0x2dbaef => _0x2dbaef.appliedAt === "PENDING");
  const _0x45ec05 = [];
  const _0x250110 = Date.now();
  if (await lock_default.exist(_0x5be0ec)) {
    throw new Error("Could not migrate up, a lock is in place.");
  }
  try {
    await lock_default.activate(_0x5be0ec);
  } catch (_0x32a2ec) {
    throw new Error("Could not create a lock: " + _0x32a2ec.message);
  }
  const _0x6e83e8 = async _0x3555fc => {
    try {
      const _0x1551f8 = await migrationsDir_default.loadMigration(_0x3555fc.fileName);
      await _0x1551f8.up(_0x5be0ec, _0x504aaf);
    } catch (_0x2beca0) {
      const _0x4925ce = new Error("Could not migrate up " + _0x3555fc.fileName + ": " + _0x2beca0.message);
      _0x4925ce.stack = _0x2beca0.stack;
      _0x4925ce.migrated = _0x45ec05;
      if (_0x2beca0.errInfo) {
        _0x4925ce.additionalInfo = _0x2beca0.errInfo;
      }
      await lock_default.clear(_0x5be0ec);
      throw _0x4925ce;
    }
    const {
      changelogCollectionName: _0x8cf2cf,
      useFileHash: _0x3b6892
    } = await config_default.read();
    const _0x55c7dc = _0x5be0ec.collection(_0x8cf2cf);
    const {
      fileName: _0x1a09ab,
      fileHash: _0x3eb793
    } = _0x3555fc;
    const _0x49dc57 = new Date();
    try {
      const _0x227c68 = {
        fileName: _0x1a09ab,
        fileHash: _0x3eb793,
        appliedAt: _0x49dc57,
        migrationBlock: _0x250110
      };
      const _0x31b7a3 = {
        fileName: _0x1a09ab,
        appliedAt: _0x49dc57,
        migrationBlock: _0x250110
      };
      await _0x55c7dc.insertOne(_0x3b6892 === true ? _0x227c68 : _0x31b7a3);
    } catch (_0x5abd33) {
      throw new Error("Could not update changelog: " + _0x5abd33.message);
    }
    _0x45ec05.push(_0x3555fc.fileName);
  };
  for (const _0x3d36c7 of _0x495228) {
    await _0x6e83e8(_0x3d36c7);
  }
  await lock_default.clear(_0x5be0ec);
  return _0x45ec05;
};
export { up_default as default };