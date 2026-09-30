import path from "path";
import fs from "fs/promises";
import { writeFile, unlink } from "node:fs/promises";
// Don't auto-mock config, we'll use the real implementation
import config from "../../lib/env/config.js";

// The original suite spied on lib/utils/module-loader.js. Corpus subjects
// inline that helper, so the spy never intercepts read() and seven cases
// fail against every bundled/obfuscated candidate. These cases drive read()
// through real config files instead, which is the public behavior both the
// unbundled source and the inlined bundle implement.

describe("config", () => {
  const written = [];

  async function writeConfig(name, body) {
    const filePath = path.join(process.cwd(), name);
    await writeFile(filePath, body);
    written.push(filePath);
    return filePath;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset config state between tests
    delete global.options;
    config.set(null);
    // Restore any spies
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    const leftover = written.splice(0);
    await Promise.all(leftover.map(async (filePath) => {
      try {
        await unlink(filePath);
      } catch {
        // already gone
      }
    }));
  });

  describe("shouldExist()", () => {

    it('should not yield an error when the config was set manually', async () => {
      vi.spyOn(fs, 'stat').mockRejectedValue(new Error("Not found"));
      config.set({ my: 'config'})
      await config.shouldExist();
    });

    it("should not yield an error if the config exists", async () => {
      vi.spyOn(fs, 'stat').mockResolvedValue({});
      await config.shouldExist();
    });

    it("should yield an error if the config does not exist", async () => {
      const configPath = path.join(process.cwd(), "migrate-mongo-config.js");
      vi.spyOn(fs, 'stat').mockRejectedValue(new Error("It does not exist"));
      await expect(config.shouldExist()).rejects.toThrow(
        `config file does not exist: ${configPath}`
      );
    });
  });

  describe("shouldNotExist()", () => {

    it('should not yield an error when the config was set manually', async () => {
      vi.spyOn(fs, 'stat').mockRejectedValue(new Error("Not found"));
      config.set({ my: 'config'})
      await config.shouldNotExist();
    });

    it("should not yield an error if the config does not exist", async () => {
      const error = new Error("File does not exist");
      error.code = "ENOENT";
      vi.spyOn(fs, 'stat').mockRejectedValue(error);
      await config.shouldNotExist();
    });

    it("should yield an error if the config exists", async () => {
      const configPath = path.join(process.cwd(), "migrate-mongo-config.js");
      vi.spyOn(fs, 'stat').mockResolvedValue({});
      await expect(config.shouldNotExist()).rejects.toThrow(
        `config file already exists: ${configPath}`
      );
    });
  });

  describe("getConfigFilename()", () => {
    it("should return the config file name", () => {
      expect(config.getConfigFilename()).toBe("migrate-mongo-config.js");
    });
  });

  describe("read()", () => {

    it('should resolve with the custom config content when config content was set manually', async () => {
      const expected = { my: 'custom-config'};
      config.set(expected);
      const actual = await config.read();
      expect(actual).toEqual(expected);
    });

    it("should attempt to read the config file", async () => {
      const configPath = path.join(process.cwd(), "migrate-mongo-config.js");
      await expect(config.read()).rejects.toThrow(`Cannot find module '${configPath}'`);
    });

    it("should be possible to read a custom, absolute config file path", async () => {
      global.options = { file: "/some/absolute/path/to/a-config-file.js" };
      await expect(config.read()).rejects.toThrow(`Cannot find module '${global.options.file}'`);
    });

    it("should be possible to read a custom, relative config file path", async () => {
      global.options = { file: "./a/relative/path/to/a-config-file.js" };
      const configPath = path.join(process.cwd(), global.options.file);
      await expect(config.read()).rejects.toThrow(`Cannot find module '${configPath}'`);
    });

    it("should fall back to using 'import' if Node requires the use of ESM", async () => {
      const expected = {
        mongodb: {
          url: 'mongodb://localhost:27017',
          databaseName: 'test'
        }
      };
      global.options = { file: "./cfg-esm-fallback.js" };
      await writeConfig("cfg-esm-fallback.js", `export default ${JSON.stringify(expected)};\n`);
      const actual = await config.read();
      expect(actual).toEqual(expected);
    });

    it("should fall back to using 'import' if Node requires the use of ESM (top-level await)", async () => {
      const expected = {
        mongodb: {
          url: 'mongodb://localhost:27017',
          databaseName: 'test'
        }
      };
      global.options = { file: "./cfg-esm-tla.js" };
      await writeConfig(
        "cfg-esm-tla.js",
        `const cfg = await Promise.resolve(${JSON.stringify(expected)});\nexport default cfg;\n`
      );
      const actual = await config.read();
      expect(actual).toEqual(expected);
    });

    it("should handle ESM modules with default export", async () => {
      const expectedConfig = {
        mongodb: {
          url: 'mongodb://localhost:27017',
          databaseName: 'test'
        }
      };
      global.options = { file: "./cfg-esm-default.js" };
      await writeConfig("cfg-esm-default.js", `export default ${JSON.stringify(expectedConfig)};\n`);
      const actual = await config.read();
      expect(actual).toEqual(expectedConfig);
    });

    it("should handle regular CommonJS modules", async () => {
      const expectedConfig = {
        mongodb: {
          url: 'mongodb://localhost:27017',
          databaseName: 'test'
        }
      };
      global.options = { file: "./cfg-cjs.cjs" };
      await writeConfig("cfg-cjs.cjs", `module.exports = ${JSON.stringify(expectedConfig)};\n`);
      const actual = await config.read();
      expect(actual).toEqual(expectedConfig);
    });

    it("should override migrationsDir when -md option is provided", async () => {
      const originalConfig = {
        mongodb: { url: 'mongodb://localhost:27017' },
        migrationsDir: './migrations'
      };
      const customMigrationsDir = './custom-migrations';
      global.options = { file: "./cfg-md-override.js", migrationsDir: customMigrationsDir };
      await writeConfig("cfg-md-override.js", `export default ${JSON.stringify(originalConfig)};\n`);
      const actual = await config.read();
      expect(actual.migrationsDir).toBe(customMigrationsDir);
    });

    it("should use config file migrationsDir when -md option is not provided", async () => {
      const originalConfig = {
        mongodb: { url: 'mongodb://localhost:27017' },
        migrationsDir: './migrations'
      };
      global.options = { file: "./cfg-md-default.js" };
      await writeConfig("cfg-md-default.js", `export default ${JSON.stringify(originalConfig)};\n`);
      const actual = await config.read();
      expect(actual.migrationsDir).toBe('./migrations');
    });

    it("should override migrationsDir in ESM modules when -md option is provided", async () => {
      const originalConfig = {
        mongodb: { url: 'mongodb://localhost:27017' },
        migrationsDir: './migrations'
      };
      const customMigrationsDir = './custom-esm-migrations';
      global.options = { file: "./cfg-md-esm.js", migrationsDir: customMigrationsDir };
      await writeConfig("cfg-md-esm.js", `export default ${JSON.stringify(originalConfig)};\n`);
      const actual = await config.read();
      expect(actual.migrationsDir).toBe(customMigrationsDir);
    });
  });
});
