"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/agent-sh__agentsys/lib/binary/version.js
var require_version = __commonJS({
  "../work/agent-sh__agentsys/lib/binary/version.js"(exports2, module2) {
    "use strict";
    var ANALYZER_MIN_VERSION = "0.3.0";
    var BINARY_NAME = "agent-analyzer";
    var GITHUB_REPO = "agent-sh/agent-analyzer";
    module2.exports = {
      ANALYZER_MIN_VERSION,
      BINARY_NAME,
      GITHUB_REPO
    };
  }
});

// ../work/agent-sh__agentsys/lib/binary/index.js
var require_binary = __commonJS({
  "../work/agent-sh__agentsys/lib/binary/index.js"(exports2, module2) {
    "use strict";
    var fs2 = require("fs");
    var path2 = require("path");
    var os = require("os");
    var https = require("https");
    var cp = require("child_process");
    var crypto = require("crypto");
    var { promisify } = require("util");
    var execFileAsync = promisify(cp.execFile);
    var ANALYZER_MAX_BUFFER = 256 * 1024 * 1024;
    var { ANALYZER_MIN_VERSION, BINARY_NAME, GITHUB_REPO } = require_version();
    var PLATFORM_MAP = {
      "darwin-arm64": "aarch64-apple-darwin",
      "darwin-x64": "x86_64-apple-darwin",
      "linux-x64": "x86_64-unknown-linux-gnu",
      "linux-arm64": "aarch64-unknown-linux-gnu",
      "win32-x64": "x86_64-pc-windows-msvc"
    };
    function getBinaryPath() {
      const ext = process.platform === "win32" ? ".exe" : "";
      return path2.join(os.homedir(), ".agent-sh", "bin", BINARY_NAME + ext);
    }
    function getPlatformKey() {
      const key = process.platform + "-" + process.arch;
      return PLATFORM_MAP[key] || null;
    }
    function meetsMinimumVersion(version, minVersion) {
      if (!version) return false;
      const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
      if (!match) return false;
      const parts = match.slice(1).map(Number);
      const req = minVersion.split(".").map(Number);
      if (parts[0] > req[0]) return true;
      if (parts[0] < req[0]) return false;
      if (parts[1] > req[1]) return true;
      if (parts[1] < req[1]) return false;
      return parts[2] >= req[2];
    }
    function getVersion() {
      const binPath = getBinaryPath();
      if (!fs2.existsSync(binPath)) return null;
      try {
        const out = cp.execFileSync(binPath, ["--version"], {
          timeout: 5e3,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true
        });
        const match = out.trim().match(/(\d+\.\d+\.\d+)/);
        return match ? match[1] : out.trim();
      } catch (e) {
        return null;
      }
    }
    function isAvailable() {
      const binPath = getBinaryPath();
      if (!fs2.existsSync(binPath)) return false;
      const ver = getVersion();
      return meetsMinimumVersion(ver, ANALYZER_MIN_VERSION);
    }
    async function isAvailableAsync() {
      return isAvailable();
    }
    function buildDownloadUrl(ver, platformKey) {
      const ext = process.platform === "win32" ? ".zip" : ".tar.gz";
      return "https://github.com/" + GITHUB_REPO + "/releases/download/v" + ver + "/" + BINARY_NAME + "-" + platformKey + ext;
    }
    function downloadToBuffer(url) {
      return new Promise(function(resolve, reject) {
        const ghToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        function request(reqUrl, redirectCount) {
          if (redirectCount > 5) {
            reject(new Error("Too many redirects fetching from " + url));
            return;
          }
          const headers = {
            "User-Agent": "agent-core/binary-resolver",
            "Accept": "application/octet-stream"
          };
          if (ghToken) headers["Authorization"] = "Bearer " + ghToken;
          https.get(reqUrl, { headers }, function(res) {
            const sc = res.statusCode;
            if (sc === 301 || sc === 302 || sc === 307 || sc === 308) {
              res.resume();
              request(res.headers.location, redirectCount + 1);
              return;
            }
            if (sc !== 200) {
              res.resume();
              const hint = sc === 403 ? " (rate limited - set GITHUB_TOKEN env var)" : "";
              reject(new Error("HTTP " + sc + hint + " fetching " + reqUrl));
              return;
            }
            const chunks = [];
            res.on("data", function(chunk) {
              chunks.push(chunk);
            });
            res.on("end", function() {
              resolve(Buffer.concat(chunks));
            });
            res.on("error", reject);
          }).on("error", reject);
        }
        request(url, 0);
      });
    }
    function parseSha256Sidecar(body) {
      if (typeof body !== "string") body = String(body || "");
      const match = body.trim().match(/^([A-Fa-f0-9]{64})\b/);
      if (!match) {
        throw new Error("Could not parse SHA-256 digest from sidecar body");
      }
      return match[1].toLowerCase();
    }
    async function downloadSha256(assetUrl) {
      const sidecarUrl = assetUrl + ".sha256";
      const buf = await downloadToBuffer(sidecarUrl);
      return parseSha256Sidecar(buf.toString("utf8"));
    }
    function sha256Hex(buf) {
      return crypto.createHash("sha256").update(buf).digest("hex");
    }
    function verifySha256(buf, expectedHex, filename) {
      const expected = String(expectedHex || "").toLowerCase();
      const actual = sha256Hex(buf);
      if (expected !== actual) {
        throw new Error(
          "SHA-256 verification failed for " + filename + ": expected " + expected + ", got " + actual + ". This could indicate a tampered release. Do not extract."
        );
      }
    }
    function assertSafeArchiveEntry(entry) {
      if (!entry || typeof entry !== "string") {
        throw new Error("Refusing to extract archive with empty entry name");
      }
      const name = entry.replace(/\\/g, "/").trim();
      if (name.length === 0) {
        throw new Error("Refusing to extract archive with empty entry name");
      }
      if (name.startsWith("//")) {
        throw new Error("Refusing to extract archive with UNC entry: " + entry);
      }
      if (name.startsWith("/")) {
        throw new Error("Refusing to extract archive with absolute entry: " + entry);
      }
      if (/^[A-Za-z]:[\\/]/.test(entry)) {
        throw new Error("Refusing to extract archive with Windows absolute entry: " + entry);
      }
      const parts = name.split("/").filter(function(p) {
        return p.length > 0;
      });
      for (let i = 0; i < parts.length; i++) {
        if (parts[i] === "..") {
          throw new Error("Refusing to extract archive with parent-traversal entry: " + entry);
        }
      }
    }
    function listTarGzEntries(buf) {
      return new Promise(function(resolve, reject) {
        const tar = cp.spawn("tar", ["-tz"], { stdio: ["pipe", "pipe", "pipe"] });
        let stdout = "";
        let stderr = "";
        tar.stdout.on("data", function(d) {
          stdout += d;
        });
        tar.stderr.on("data", function(d) {
          stderr += d;
        });
        tar.on("error", reject);
        tar.on("close", function(code) {
          if (code !== 0) {
            reject(new Error("tar -tz listing failed (code " + code + "): " + stderr));
            return;
          }
          const entries = stdout.split(/\r?\n/).filter(function(l) {
            return l.length > 0;
          });
          resolve(entries);
        });
        tar.stdin.write(buf);
        tar.stdin.end();
      });
    }
    function assertInsideRoot(root, candidate) {
      const rootResolved = path2.resolve(root) + path2.sep;
      const candResolved = path2.resolve(candidate);
      if (candResolved !== path2.resolve(root) && !candResolved.startsWith(rootResolved)) {
        throw new Error("Extracted path escapes extract root: " + candidate);
      }
    }
    function walkFiles(dir) {
      const out = [];
      const stack = [dir];
      while (stack.length > 0) {
        const cur = stack.pop();
        const st = fs2.lstatSync(cur);
        if (st.isSymbolicLink()) {
          throw new Error("Refusing to follow symlink produced by extractor: " + cur);
        }
        if (st.isDirectory()) {
          const names = fs2.readdirSync(cur);
          for (let i = 0; i < names.length; i++) {
            stack.push(path2.join(cur, names[i]));
          }
        } else if (st.isFile()) {
          out.push(cur);
        }
      }
      return out;
    }
    function rmrf(dir) {
      try {
        fs2.rmSync(dir, { recursive: true, force: true });
      } catch (e) {
      }
    }
    async function extractTarGzToScratch(buf) {
      const entries = await listTarGzEntries(buf);
      for (let i = 0; i < entries.length; i++) {
        assertSafeArchiveEntry(entries[i]);
      }
      const scratch = fs2.mkdtempSync(path2.join(os.tmpdir(), "agent-analyzer-tar-"));
      try {
        await new Promise(function(resolve, reject) {
          const tar = cp.spawn("tar", ["xz", "-C", scratch], { stdio: ["pipe", "pipe", "pipe"] });
          let stderr = "";
          tar.stderr.on("data", function(d) {
            stderr += d;
          });
          tar.on("error", reject);
          tar.on("close", function(code) {
            if (code !== 0) {
              reject(new Error("tar extraction failed (code " + code + "): " + stderr));
            } else {
              resolve();
            }
          });
          tar.stdin.write(buf);
          tar.stdin.end();
        });
        const files = walkFiles(scratch);
        for (let i = 0; i < files.length; i++) {
          assertInsideRoot(scratch, files[i]);
        }
      } catch (err) {
        rmrf(scratch);
        throw err;
      }
      return scratch;
    }
    var EXTRACT_ZIP_PS1 = [
      '$ErrorActionPreference = "Stop"',
      "$src  = $env:SRC_ZIP",
      "$dest = $env:DEST_DIR",
      "if ([string]::IsNullOrEmpty($src) -or [string]::IsNullOrEmpty($dest)) {",
      '  [Console]::Error.WriteLine("SRC_ZIP and DEST_DIR must both be set"); exit 2',
      "}",
      "Add-Type -AssemblyName System.IO.Compression.FileSystem",
      "$destFull = [System.IO.Path]::GetFullPath($dest)",
      "if (-not $destFull.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {",
      "  $destFull = $destFull + [System.IO.Path]::DirectorySeparatorChar",
      "}",
      "$zip = [System.IO.Compression.ZipFile]::OpenRead($src)",
      "try {",
      "  foreach ($entry in $zip.Entries) {",
      "    $name = $entry.FullName",
      "    if ([string]::IsNullOrEmpty($name)) { continue }",
      '    $norm = $name -replace "\\\\","/"',
      '    if ($norm.StartsWith("/") -or $norm.StartsWith("//")) {',
      '      [Console]::Error.WriteLine("Refusing absolute/UNC entry: " + $name); exit 3',
      "    }",
      '    if ($name -match "^[A-Za-z]:[\\\\/]") {',
      '      [Console]::Error.WriteLine("Refusing Windows-absolute entry: " + $name); exit 3',
      "    }",
      '    foreach ($part in ($norm -split "/")) {',
      '      if ($part -eq "..") {',
      '        [Console]::Error.WriteLine("Refusing parent-traversal entry: " + $name); exit 3',
      "      }",
      "    }",
      "    $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($destFull, $norm))",
      "    if (-not $target.StartsWith($destFull, [System.StringComparison]::OrdinalIgnoreCase)) {",
      '      [Console]::Error.WriteLine("Entry escapes destination: " + $name); exit 3',
      "    }",
      '    if ($entry.FullName.EndsWith("/")) {',
      "      [System.IO.Directory]::CreateDirectory($target) | Out-Null",
      "    } else {",
      "      $parent = [System.IO.Path]::GetDirectoryName($target)",
      "      if ($parent) { [System.IO.Directory]::CreateDirectory($parent) | Out-Null }",
      "      [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true)",
      "    }",
      "  }",
      "} finally {",
      "  $zip.Dispose()",
      "}"
    ].join("\r\n");
    async function extractZipToScratch(buf) {
      const scratch = fs2.mkdtempSync(path2.join(os.tmpdir(), "agent-analyzer-zip-"));
      const tmpZip = path2.join(scratch, "__archive.zip");
      const scriptDir = fs2.mkdtempSync(path2.join(os.tmpdir(), "agent-analyzer-ps-"));
      const scriptPath = path2.join(scriptDir, "extract.ps1");
      try {
        fs2.writeFileSync(tmpZip, buf);
        fs2.writeFileSync(scriptPath, EXTRACT_ZIP_PS1, "utf8");
        await new Promise(function(resolve, reject) {
          const child = cp.execFile(
            "powershell.exe",
            [
              "-NoProfile",
              "-NonInteractive",
              "-ExecutionPolicy",
              "Bypass",
              "-File",
              scriptPath
            ],
            {
              windowsHide: true,
              env: Object.assign({}, process.env, {
                SRC_ZIP: tmpZip,
                DEST_DIR: scratch
              })
            },
            function(err, _stdout, stderr) {
              if (err) {
                reject(new Error("zip extraction failed: " + (stderr || err.message)));
              } else {
                resolve();
              }
            }
          );
          if (child.stdin) child.stdin.end();
        });
        try {
          fs2.unlinkSync(tmpZip);
        } catch (e) {
        }
        const files = walkFiles(scratch);
        for (let i = 0; i < files.length; i++) {
          assertInsideRoot(scratch, files[i]);
        }
      } catch (err) {
        rmrf(scratch);
        throw err;
      } finally {
        rmrf(scriptDir);
      }
      return scratch;
    }
    function findBinaryInScratch(scratch, binaryBaseName) {
      const files = walkFiles(scratch);
      for (let i = 0; i < files.length; i++) {
        if (path2.basename(files[i]) === binaryBaseName) {
          assertInsideRoot(scratch, files[i]);
          return files[i];
        }
      }
      return null;
    }
    function defaultGhRunner(filePath, repo) {
      try {
        const stdout = cp.execFileSync(
          "gh",
          ["attestation", "verify", filePath, "--repo", repo, "--format", "json"],
          {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
            timeout: 6e4,
            windowsHide: true
          }
        );
        return { status: 0, stdout: stdout || "", stderr: "" };
      } catch (err) {
        return {
          status: typeof err.status === "number" ? err.status : null,
          stdout: err.stdout ? String(err.stdout) : "",
          stderr: err.stderr ? String(err.stderr) : err.message || ""
        };
      }
    }
    function isGhAvailable(runner) {
      if (typeof runner === "function") {
        try {
          return !!runner();
        } catch (e) {
          return false;
        }
      }
      try {
        cp.execFileSync("gh", ["--version"], {
          stdio: "ignore",
          timeout: 5e3,
          windowsHide: true
        });
        return true;
      } catch (e) {
        return false;
      }
    }
    function verifySlsaAttestation(filePath, options) {
      const opts = options || {};
      const repo = opts.repo || GITHUB_REPO;
      const runner = typeof opts.ghRunner === "function" ? opts.ghRunner : defaultGhRunner;
      const require_ = typeof opts.requireAttestation === "boolean" ? opts.requireAttestation : process.env.AGENT_ANALYZER_REQUIRE_ATTESTATION === "1";
      const ghPresent = isGhAvailable(opts.ghProbe);
      if (!ghPresent) {
        const reason = "`gh` CLI not found on PATH";
        if (require_) {
          return { status: "failed", reason: reason + " (AGENT_ANALYZER_REQUIRE_ATTESTATION=1)" };
        }
        return { status: "skipped", reason };
      }
      const result = runner(filePath, repo);
      if (result && result.status === 0) {
        return { status: "verified" };
      }
      return {
        status: "failed",
        reason: "gh attestation verify exited with status " + (result && result.status !== null ? result.status : "unknown"),
        stderr: result && result.stderr || ""
      };
    }
    async function downloadBinary(ver, options) {
      const opts = options || {};
      const skipChecksum = opts.skipChecksum === true;
      const skipAttestation = opts.skipAttestation === true;
      const platformKey = getPlatformKey();
      if (!platformKey) {
        throw new Error(
          "Unsupported platform: " + process.platform + "-" + process.arch + ". Supported platforms: " + Object.keys(PLATFORM_MAP).join(", ")
        );
      }
      const url = buildDownloadUrl(ver, platformKey);
      const filename = url.substring(url.lastIndexOf("/") + 1);
      process.stderr.write("Downloading " + BINARY_NAME + " v" + ver + " for " + platformKey + "...\n");
      const binPath = getBinaryPath();
      const binDir = path2.dirname(binPath);
      fs2.mkdirSync(binDir, { recursive: true });
      let buf;
      try {
        buf = await downloadToBuffer(url);
      } catch (err) {
        throw new Error(
          "Failed to download " + BINARY_NAME + ":\n  URL: " + url + "\n  Error: " + err.message + "\n\nTo install manually:\n  1. Download: " + url + "\n  2. Extract the binary to: " + binDir + "\n  3. Ensure it is named: " + path2.basename(binPath)
        );
      }
      if (skipChecksum) {
        process.stderr.write(
          "[WARN] skipChecksum=true - SHA-256 verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n"
        );
      } else {
        let expected;
        try {
          expected = await downloadSha256(url);
        } catch (err) {
          throw new Error(
            "Failed to fetch SHA-256 sidecar for " + filename + ":\n  URL: " + url + ".sha256\n  Error: " + err.message + "\n\nThe release may be missing its checksum file. Refusing to install an unverified binary. If this is a legacy release without sidecars, pass { skipChecksum: true } to downloadBinary() (LOCAL DEV ONLY)."
          );
        }
        verifySha256(buf, expected, filename);
      }
      if (skipAttestation) {
        process.stderr.write(
          "[WARN] skipAttestation=true - SLSA verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n"
        );
      } else {
        const attestDir = fs2.mkdtempSync(path2.join(os.tmpdir(), "agent-analyzer-slsa-"));
        const attestFile = path2.join(attestDir, filename);
        try {
          fs2.writeFileSync(attestFile, buf);
          const result = verifySlsaAttestation(attestFile, {
            repo: GITHUB_REPO,
            requireAttestation: opts.requireAttestation,
            ghRunner: opts.ghRunner,
            ghProbe: opts.ghProbe
          });
          if (result.status === "verified") {
            process.stderr.write("[OK] SLSA attestation verified for " + filename + "\n");
          } else if (result.status === "skipped") {
            process.stderr.write(
              "[WARN] SLSA attestation check skipped: " + result.reason + ". Install the GitHub CLI (`gh`) to enable provenance verification. Set AGENT_ANALYZER_REQUIRE_ATTESTATION=1 to require it.\n"
            );
          } else {
            throw new Error(
              "SLSA attestation verification failed for " + filename + ": " + result.reason + ". Refusing to execute binary." + (result.stderr ? "\n--- gh stderr ---\n" + result.stderr : "")
            );
          }
        } finally {
          rmrf(attestDir);
        }
      }
      const binaryBaseName = path2.basename(binPath);
      let scratch;
      try {
        if (process.platform === "win32") {
          scratch = await extractZipToScratch(buf);
        } else {
          scratch = await extractTarGzToScratch(buf);
        }
        const extractedBin = findBinaryInScratch(scratch, binaryBaseName);
        if (!extractedBin) {
          throw new Error(
            'Expected binary "' + binaryBaseName + '" not found inside archive ' + filename + ". Archive layout may have changed."
          );
        }
        fs2.copyFileSync(extractedBin, binPath);
      } finally {
        if (scratch) rmrf(scratch);
      }
      if (process.platform !== "win32") {
        fs2.chmodSync(binPath, 493);
      }
      const installedVer = getVersion();
      if (!installedVer) {
        throw new Error(
          BINARY_NAME + " was downloaded to " + binPath + " but could not be executed. Check the file is a valid binary for this platform."
        );
      }
      return binPath;
    }
    async function ensureBinary(options) {
      const opts = options || {};
      const targetVer = opts.version || ANALYZER_MIN_VERSION;
      const binPath = getBinaryPath();
      if (fs2.existsSync(binPath)) {
        const ver = getVersion();
        if (meetsMinimumVersion(ver, ANALYZER_MIN_VERSION)) {
          return binPath;
        }
      }
      return downloadBinary(targetVer, {
        skipChecksum: opts.skipChecksum === true,
        skipAttestation: opts.skipAttestation === true,
        requireAttestation: opts.requireAttestation,
        ghRunner: opts.ghRunner,
        ghProbe: opts.ghProbe
      });
    }
    function ensureBinarySync(options) {
      const binPath = getBinaryPath();
      if (fs2.existsSync(binPath)) {
        const ver = getVersion();
        if (meetsMinimumVersion(ver, ANALYZER_MIN_VERSION)) {
          return binPath;
        }
      }
      const targetVer = options && options.version || ANALYZER_MIN_VERSION;
      const skipChecksum = !!(options && options.skipChecksum);
      const skipAttestation = !!(options && options.skipAttestation);
      const requireAttestation = options && typeof options.requireAttestation === "boolean" ? options.requireAttestation : void 0;
      const selfPath = __filename;
      const ensureOpts = {
        version: targetVer,
        skipChecksum,
        skipAttestation
      };
      if (requireAttestation !== void 0) {
        ensureOpts.requireAttestation = requireAttestation;
      }
      const helperLines = [
        "var b = require(" + JSON.stringify(selfPath) + ");",
        "b.ensureBinary(" + JSON.stringify(ensureOpts) + ")",
        "  .then(function(p) { process.stdout.write(p); })",
        "  .catch(function(e) { process.stderr.write(e.message); process.exit(1); });"
      ];
      try {
        const result = cp.execFileSync(process.execPath, ["-e", helperLines.join("\n")], {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "inherit"],
          timeout: 12e4
        });
        return result.trim() || binPath;
      } catch (err) {
        throw new Error("Failed to ensure binary (sync): " + err.message);
      }
    }
    function runAnalyzer(args, options) {
      const binPath = ensureBinarySync();
      const opts = Object.assign({ encoding: "utf8", windowsHide: true, maxBuffer: ANALYZER_MAX_BUFFER }, options);
      if (!opts.stdio) opts.stdio = ["pipe", "pipe", "pipe"];
      const result = cp.execFileSync(binPath, args, opts);
      return typeof result === "string" ? result : result.toString("utf8");
    }
    async function runAnalyzerAsync(args, options) {
      const binPath = await ensureBinary();
      const opts = Object.assign({ encoding: "utf8", windowsHide: true, maxBuffer: ANALYZER_MAX_BUFFER }, options);
      const result = await execFileAsync(binPath, args, opts);
      return result.stdout;
    }
    module2.exports = {
      ensureBinary,
      ensureBinarySync,
      runAnalyzer,
      runAnalyzerAsync,
      getBinaryPath,
      getVersion,
      getPlatformKey,
      isAvailable,
      isAvailableAsync,
      meetsMinimumVersion,
      buildDownloadUrl,
      PLATFORM_MAP,
      // Exported for tests + advanced consumers
      parseSha256Sidecar,
      verifySha256,
      sha256Hex,
      assertSafeArchiveEntry,
      assertInsideRoot,
      downloadBinary,
      verifySlsaAttestation,
      isGhAvailable,
      // Exported for tests only
      extractTarGzToScratch,
      extractZipToScratch,
      _EXTRACT_ZIP_PS1: EXTRACT_ZIP_PS1
    };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/installer.js
var require_installer = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/installer.js"(exports2, module2) {
    "use strict";
    var binary = require_binary();
    async function checkInstalled() {
      if (binary.isAvailable()) {
        return { found: true, version: binary.getVersion(), tool: "agent-analyzer" };
      }
      try {
        await binary.ensureBinary();
        return { found: true, version: binary.getVersion(), tool: "agent-analyzer" };
      } catch (e) {
        return { found: false, error: e.message, tool: "agent-analyzer" };
      }
    }
    function checkInstalledSync() {
      if (binary.isAvailable()) {
        return { found: true, version: binary.getVersion(), tool: "agent-analyzer" };
      }
      try {
        binary.ensureBinarySync();
        return { found: true, version: binary.getVersion(), tool: "agent-analyzer" };
      } catch (e) {
        return { found: false, error: e.message, tool: "agent-analyzer" };
      }
    }
    function meetsMinimumVersion() {
      return true;
    }
    function getInstallInstructions() {
      return "agent-analyzer is downloaded automatically on first use from https://github.com/agent-sh/agent-analyzer/releases";
    }
    function getMinimumVersion() {
      return "0.3.0";
    }
    module2.exports = {
      checkInstalled,
      checkInstalledSync,
      meetsMinimumVersion,
      getInstallInstructions,
      getMinimumVersion,
      // Stub: runner.js references this but is no longer the scan path
      getCommand: () => null
    };
  }
});

// ../work/agent-sh__agentsys/lib/platform/state-dir.js
var require_state_dir = __commonJS({
  "../work/agent-sh__agentsys/lib/platform/state-dir.js"(exports2, module2) {
    var fs2 = require("fs");
    var path2 = require("path");
    var _cachedStateDirs = /* @__PURE__ */ new Map();
    function isDirectory(targetPath) {
      try {
        return fs2.statSync(targetPath).isDirectory();
      } catch {
        return false;
      }
    }
    function getStateDir(basePath = process.cwd()) {
      if (process.env.AI_STATE_DIR) {
        return process.env.AI_STATE_DIR;
      }
      const cacheKey = path2.resolve(basePath);
      const cached = _cachedStateDirs.get(cacheKey);
      if (cached) {
        return cached;
      }
      if (process.env.OPENCODE_CONFIG || process.env.OPENCODE_CONFIG_DIR) {
        _cachedStateDirs.set(cacheKey, ".opencode");
        return ".opencode";
      }
      try {
        const opencodePath = path2.join(basePath, ".opencode");
        if (isDirectory(opencodePath)) {
          _cachedStateDirs.set(cacheKey, ".opencode");
          return ".opencode";
        }
      } catch {
      }
      if (process.env.CODEX_HOME) {
        _cachedStateDirs.set(cacheKey, ".codex");
        return ".codex";
      }
      try {
        const codexPath = path2.join(basePath, ".codex");
        if (isDirectory(codexPath)) {
          _cachedStateDirs.set(cacheKey, ".codex");
          return ".codex";
        }
      } catch {
      }
      _cachedStateDirs.set(cacheKey, ".claude");
      return ".claude";
    }
    function getStateDirPath(basePath = process.cwd()) {
      return path2.join(basePath, getStateDir(basePath));
    }
    function getPlatformName(basePath = process.cwd()) {
      const stateDir = getStateDir(basePath);
      if (process.env.AI_STATE_DIR) {
        return "custom";
      }
      switch (stateDir) {
        case ".opencode":
          return "opencode";
        case ".codex":
          return "codex";
        case ".claude":
          return "claude";
        default:
          return "unknown";
      }
    }
    function clearCache() {
      _cachedStateDirs.clear();
    }
    module2.exports = {
      getStateDir,
      getStateDirPath,
      getPlatformName,
      clearCache
    };
  }
});

// ../work/agent-sh__agentsys/lib/utils/atomic-write.js
var require_atomic_write = __commonJS({
  "../work/agent-sh__agentsys/lib/utils/atomic-write.js"(exports2, module2) {
    var fs2 = require("fs");
    var path2 = require("path");
    var crypto = require("crypto");
    function getTempPath(targetPath) {
      const dir = path2.dirname(targetPath);
      const basename = path2.basename(targetPath);
      const randomSuffix = crypto.randomBytes(6).toString("hex");
      return path2.join(dir, `.${basename}.${randomSuffix}.tmp`);
    }
    function writeFileAtomic(filePath, content, options = {}) {
      const { encoding = "utf8", mode = 420 } = options;
      const dir = path2.dirname(filePath);
      if (!fs2.existsSync(dir)) {
        fs2.mkdirSync(dir, { recursive: true });
      }
      const tempPath = getTempPath(filePath);
      try {
        fs2.writeFileSync(tempPath, content, { encoding, mode });
        fs2.renameSync(tempPath, filePath);
        return true;
      } catch (error) {
        try {
          if (fs2.existsSync(tempPath)) {
            fs2.unlinkSync(tempPath);
          }
        } catch {
        }
        throw error;
      }
    }
    function writeJsonAtomic(filePath, data, options = {}) {
      const { indent = 2, ...writeOptions } = options;
      const content = JSON.stringify(data, null, indent);
      return writeFileAtomic(filePath, content, writeOptions);
    }
    module2.exports = {
      writeFileAtomic,
      writeJsonAtomic,
      getTempPath
    };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/cache.js
var require_cache = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/cache.js"(exports2, module2) {
    "use strict";
    var fs2 = require("fs");
    var path2 = require("path");
    var { getStateDirPath } = require_state_dir();
    var { writeJsonAtomic, writeFileAtomic } = require_atomic_write();
    var MAP_FILENAME = "repo-map.json";
    var STALE_FILENAME = "repo-map.stale";
    var INTEL_FILENAME = "repo-intel.json";
    function getMapPath(basePath) {
      return path2.join(getStateDirPath(basePath), MAP_FILENAME);
    }
    function getPath(basePath) {
      return path2.join(getStateDirPath(basePath), INTEL_FILENAME);
    }
    function getStalePath(basePath) {
      return path2.join(getStateDirPath(basePath), STALE_FILENAME);
    }
    function ensureStateDir(basePath) {
      const stateDir = getStateDirPath(basePath);
      if (!fs2.existsSync(stateDir)) {
        fs2.mkdirSync(stateDir, { recursive: true });
      }
      return stateDir;
    }
    function load(basePath) {
      const mapPath = getMapPath(basePath);
      if (!fs2.existsSync(mapPath)) return null;
      try {
        const raw = fs2.readFileSync(mapPath, "utf8");
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    function save(basePath, map) {
      ensureStateDir(basePath);
      const mapPath = getMapPath(basePath);
      const output = {
        ...map,
        updated: (/* @__PURE__ */ new Date()).toISOString()
      };
      writeJsonAtomic(mapPath, output);
      clearStale(basePath);
    }
    function exists(basePath) {
      return fs2.existsSync(getMapPath(basePath));
    }
    function markStale(basePath) {
      ensureStateDir(basePath);
      writeFileAtomic(getStalePath(basePath), (/* @__PURE__ */ new Date()).toISOString());
    }
    function clearStale(basePath) {
      const stalePath = getStalePath(basePath);
      if (fs2.existsSync(stalePath)) {
        fs2.unlinkSync(stalePath);
      }
    }
    function isMarkedStale(basePath) {
      return fs2.existsSync(getStalePath(basePath));
    }
    function getStatus(basePath) {
      const map = load(basePath);
      if (!map) return null;
      return {
        generated: map.generated,
        updated: map.updated,
        commit: map.git?.commit,
        branch: map.git?.branch,
        files: Object.keys(map.files || {}).length,
        symbols: map.stats?.totalSymbols || 0,
        languages: map.project?.languages || []
      };
    }
    module2.exports = {
      load,
      save,
      exists,
      getStatus,
      getMapPath,
      // getPath -> raw repo-intel.json (embed orchestrator); getStateDirPath
      // re-exported for embed/preference.js. Both delegate to platform/state-dir
      // and match the names the standalone cache exposed.
      getPath,
      getStateDirPath,
      markStale,
      clearStale,
      isMarkedStale
    };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/updater.js
var require_updater = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/updater.js"(exports2, module2) {
    "use strict";
    var { execFileSync: execFileSync2 } = require("child_process");
    var cache = require_cache();
    function checkStaleness(basePath, map) {
      const result = {
        isStale: false,
        reason: null,
        commitsBehind: 0,
        suggestFullRebuild: false
      };
      if (!map?.git?.commit) {
        result.isStale = true;
        result.reason = "Missing base commit in repo-map";
        result.suggestFullRebuild = true;
        return result;
      }
      if (cache.isMarkedStale(basePath)) {
        result.isStale = true;
        result.reason = "Marked stale by hook";
      }
      if (!commitExists(basePath, map.git.commit)) {
        result.isStale = true;
        result.reason = "Base commit no longer exists (rebased?)";
        result.suggestFullRebuild = true;
        return result;
      }
      const currentBranch = getCurrentBranch(basePath);
      if (currentBranch && map.git.branch && currentBranch !== map.git.branch) {
        result.isStale = true;
        result.reason = `Branch changed from ${map.git.branch} to ${currentBranch}`;
        result.suggestFullRebuild = true;
      }
      const commitsBehind = getCommitsBehind(basePath, map.git.commit);
      if (commitsBehind > 0) {
        result.isStale = true;
        result.commitsBehind = commitsBehind;
        if (!result.reason) {
          result.reason = `${commitsBehind} commits behind HEAD`;
        }
      }
      return result;
    }
    function isValidCommitHash(commit) {
      return typeof commit === "string" && /^[0-9a-fA-F]{4,40}$/.test(commit);
    }
    function commitExists(basePath, commit) {
      if (!isValidCommitHash(commit)) return false;
      try {
        execFileSync2("git", ["cat-file", "-e", commit], { cwd: basePath, stdio: ["pipe", "pipe", "pipe"] });
        return true;
      } catch {
        return false;
      }
    }
    function getCurrentBranch(basePath) {
      try {
        return execFileSync2("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
          cwd: basePath,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"]
        }).trim();
      } catch {
        return null;
      }
    }
    function getCommitsBehind(basePath, commit) {
      if (!isValidCommitHash(commit)) return 0;
      try {
        const out = execFileSync2("git", ["rev-list", `${commit}..HEAD`, "--count"], {
          cwd: basePath,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"]
        }).trim();
        return Number(out) || 0;
      } catch {
        return 0;
      }
    }
    module2.exports = { checkStaleness };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/converter.js
var require_converter = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/converter.js"(exports2, module2) {
    "use strict";
    var path2 = require("path");
    var LANGUAGE_BY_EXTENSION = {
      ".js": "javascript",
      ".jsx": "javascript",
      ".mjs": "javascript",
      ".cjs": "javascript",
      ".ts": "typescript",
      ".tsx": "typescript",
      ".mts": "typescript",
      ".cts": "typescript",
      ".py": "python",
      ".pyw": "python",
      ".rs": "rust",
      ".go": "go",
      ".java": "java"
    };
    var CLASS_KINDS = /* @__PURE__ */ new Set(["class", "struct", "interface", "enum", "impl"]);
    var TYPE_KINDS = /* @__PURE__ */ new Set(["trait", "type-alias"]);
    var FUNCTION_LIKE_KINDS = /* @__PURE__ */ new Set(["method", "arrow", "closure"]);
    var CONSTANT_KINDS = /* @__PURE__ */ new Set(["constant", "variable", "const", "field", "property"]);
    function detectLanguage(filePath) {
      return LANGUAGE_BY_EXTENSION[path2.extname(filePath).toLowerCase()] || "unknown";
    }
    function detectLanguagesFromFiles(filePaths) {
      const langs = /* @__PURE__ */ new Set();
      for (const fp of filePaths) {
        const lang = detectLanguage(fp);
        if (lang !== "unknown") langs.add(lang);
      }
      return Array.from(langs);
    }
    function convertFile(filePath, fileSym) {
      const exportNames = new Set((fileSym.exports || []).map((e) => e.name));
      const exports3 = (fileSym.exports || []).map((e) => ({
        name: e.name,
        kind: e.kind,
        line: e.line
      }));
      const functions = [];
      const classes = [];
      const types = [];
      const constants = [];
      for (const def of fileSym.definitions || []) {
        const entry = {
          name: def.name,
          kind: def.kind,
          line: def.line,
          exported: exportNames.has(def.name)
        };
        if (def.kind === "function" || FUNCTION_LIKE_KINDS.has(def.kind)) {
          functions.push(entry);
        } else if (CLASS_KINDS.has(def.kind)) {
          classes.push(entry);
        } else if (TYPE_KINDS.has(def.kind)) {
          types.push(entry);
        } else if (CONSTANT_KINDS.has(def.kind)) {
          constants.push(entry);
        } else {
          constants.push(entry);
        }
      }
      const imports = (fileSym.imports || []).map((imp) => ({
        source: imp.from,
        kind: "import",
        names: imp.names || []
      }));
      return {
        language: detectLanguage(filePath),
        symbols: { exports: exports3, functions, classes, types, constants },
        imports
      };
    }
    function convertIntelToRepoMap(intel) {
      const files = {};
      let totalSymbols = 0;
      let totalImports = 0;
      for (const [filePath, fileSym] of Object.entries(intel.symbols || {})) {
        files[filePath] = convertFile(filePath, fileSym);
        const s = files[filePath].symbols;
        totalSymbols += s.functions.length + s.classes.length + s.types.length + s.constants.length;
        totalImports += files[filePath].imports.length;
      }
      return {
        version: "2.0",
        generated: intel.generated || (/* @__PURE__ */ new Date()).toISOString(),
        git: intel.git ? { commit: intel.git.analyzedUpTo } : void 0,
        project: { languages: detectLanguagesFromFiles(Object.keys(files)) },
        stats: {
          totalFiles: Object.keys(files).length,
          totalSymbols,
          totalImports,
          errors: []
        },
        files
      };
    }
    module2.exports = { convertIntelToRepoMap, convertFile, detectLanguage };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/queries.js
var require_queries = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/queries.js"(exports2, module2) {
    "use strict";
    var fs2 = require("fs");
    var path2 = require("path");
    var { getStateDir } = require_state_dir();
    var binary = require_binary();
    var RepoIntelMissingError = class extends Error {
      /**
       * @param {string} mapFile - Expected path to the map file
       */
      constructor(mapFile) {
        super(
          `repo-intel map not found at ${mapFile}. Run \`agentsys repo-intel update\` to generate it first.`
        );
        this.name = "RepoIntelMissingError";
        this.code = "REPO_INTEL_MISSING";
        this.mapFile = mapFile;
      }
    };
    var MAP_FILE_NAME = "repo-intel.json";
    function resolveMapFile(cwd) {
      const stateDir = getStateDir(cwd);
      return path2.join(cwd, stateDir, MAP_FILE_NAME);
    }
    function requireMapFile(cwd) {
      const mapFile = resolveMapFile(cwd);
      if (!fs2.existsSync(mapFile)) {
        throw new RepoIntelMissingError(mapFile);
      }
      return mapFile;
    }
    function runQuery(queryName, extraArgs, cwd) {
      const mapFile = requireMapFile(cwd);
      const args = ["repo-intel", "query", queryName, ...extraArgs, "--map-file", mapFile, cwd];
      let raw;
      try {
        raw = binary.runAnalyzer(args);
      } catch (err) {
        throw new Error(
          `repo-intel query failed [${queryName}]: ${err.message}`,
          { cause: err }
        );
      }
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (_parseErr) {
        const preview = raw.slice(0, 200);
        throw new Error(
          `repo-intel query [${queryName}] returned non-JSON output: ${preview}`
        );
      }
      return parsed;
    }
    function assertString(val, label) {
      if (typeof val !== "string" || val.length === 0) {
        throw new TypeError(`${label} must be a non-empty string`);
      }
    }
    function hotspots(cwd, opts = {}) {
      const extra = [];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("hotspots", extra, cwd);
    }
    function coupling(cwd, file, opts = {}) {
      assertString(file, "coupling: file");
      const extra = [file];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("coupling", extra, cwd);
    }
    function busFactor(cwd, opts = {}) {
      const extra = [];
      if (opts.adjustForAi) extra.push("--adjust-for-ai");
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("bus-factor", extra, cwd);
    }
    function testGaps(cwd, opts = {}) {
      const extra = [];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      if (opts.minChanges != null) extra.push("--min-changes", String(opts.minChanges));
      return runQuery("test-gaps", extra, cwd);
    }
    function diffRisk(cwd, files) {
      if (!Array.isArray(files)) {
        throw new TypeError("diffRisk: files must be an array of strings");
      }
      if (!files.every((f) => typeof f === "string")) {
        throw new TypeError("diffRisk: all entries in files must be strings");
      }
      const joined = files.join(",");
      if (joined.length > 3e4) {
        throw new RangeError(
          `diffRisk: files argument exceeds 30000 character limit (got ${joined.length})`
        );
      }
      const extra = ["--files", joined];
      return runQuery("diff-risk", extra, cwd);
    }
    function dependents(cwd, symbol, file) {
      assertString(symbol, "dependents: symbol");
      const extra = [symbol];
      if (file != null) {
        assertString(file, "dependents: file");
        extra.push("--file", file);
      }
      return runQuery("dependents", extra, cwd);
    }
    function bugspots(cwd, opts = {}) {
      const extra = [];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("bugspots", extra, cwd);
    }
    function health(cwd) {
      return runQuery("health", [], cwd);
    }
    function communities(cwd) {
      return runQuery("communities", [], cwd);
    }
    function boundaries(cwd, opts = {}) {
      const extra = [];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("boundaries", extra, cwd);
    }
    function areaOf(cwd, file) {
      assertString(file, "areaOf: file");
      return runQuery("area-of", [file], cwd);
    }
    function communityHealth(cwd, id) {
      if (typeof id !== "number" || !Number.isInteger(id) || id < 0) {
        throw new TypeError(
          "communityHealth: id must be a non-negative integer"
        );
      }
      return runQuery("community-health", [String(id)], cwd);
    }
    function coldspots(cwd, opts = {}) {
      const extra = [];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("coldspots", extra, cwd);
    }
    function ownership(cwd, file) {
      assertString(file, "ownership: file");
      return runQuery("ownership", [file], cwd);
    }
    function norms(cwd) {
      return runQuery("norms", [], cwd);
    }
    function areas(cwd) {
      return runQuery("areas", [], cwd);
    }
    function contributors(cwd, opts = {}) {
      const extra = [];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("contributors", extra, cwd);
    }
    function releaseInfo(cwd) {
      return runQuery("release-info", [], cwd);
    }
    function fileHistory(cwd, file) {
      assertString(file, "fileHistory: file");
      return runQuery("file-history", [file], cwd);
    }
    function conventions(cwd) {
      return runQuery("conventions", [], cwd);
    }
    function docDrift(cwd, opts = {}) {
      const extra = [];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("doc-drift", extra, cwd);
    }
    function onboard(cwd) {
      return runQuery("onboard", [], cwd);
    }
    function canIHelp(cwd) {
      return runQuery("can-i-help", [], cwd);
    }
    function painspots(cwd, opts = {}) {
      const extra = [];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("painspots", extra, cwd);
    }
    function entryPoints(cwd, opts = {}) {
      const extra = [];
      if (opts.files) {
        const list = Array.isArray(opts.files) ? opts.files.join(",") : String(opts.files);
        extra.push("--files", list);
      }
      return runQuery("entry-points", extra, cwd);
    }
    function projectInfo(cwd) {
      return runQuery("project-info", [], cwd);
    }
    function symbols(cwd, file) {
      assertString(file, "symbols: file");
      return runQuery("symbols", [file], cwd);
    }
    function staleDocs(cwd, opts = {}) {
      const extra = [];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("stale-docs", extra, cwd);
    }
    function find(cwd, query, opts = {}) {
      assertString(query, "find: query");
      const extra = [query];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("find", extra, cwd);
    }
    function slopFixes(cwd) {
      return runQuery("slop-fixes", [], cwd);
    }
    function slopTargets(cwd, opts = {}) {
      const extra = [];
      if (opts.top != null) extra.push("--top", String(opts.top));
      return runQuery("slop-targets", extra, cwd);
    }
    function summary(cwd, opts = {}) {
      const mapFile = requireMapFile(cwd);
      const extra = [];
      if (opts.depth != null) extra.push("--depth", String(opts.depth));
      const args = ["repo-intel", "query", "summary", ...extra, "--map-file", mapFile, cwd];
      let raw;
      try {
        raw = binary.runAnalyzer(args).trim();
      } catch (err) {
        throw new Error(`repo-intel query failed [summary]: ${err.message}`, { cause: err });
      }
      if (raw === "null") return null;
      if (opts.depth != null) return raw;
      try {
        return JSON.parse(raw);
      } catch (_parseErr) {
        throw new Error(
          `repo-intel query [summary] returned non-JSON output: ${raw.slice(0, 200)}`
        );
      }
    }
    module2.exports = {
      // Error class
      RepoIntelMissingError,
      // Core queries
      hotspots,
      coupling,
      busFactor,
      testGaps,
      diffRisk,
      dependents,
      bugspots,
      health,
      // Graph queries
      communities,
      boundaries,
      areaOf,
      communityHealth,
      // Activity / git queries
      coldspots,
      ownership,
      norms,
      areas,
      contributors,
      releaseInfo,
      fileHistory,
      conventions,
      docDrift,
      // Narrative / guidance queries
      onboard,
      canIHelp,
      painspots,
      entryPoints,
      projectInfo,
      // AST / symbol queries
      symbols,
      staleDocs,
      find,
      // Deslop-agent queries
      slopFixes,
      slopTargets,
      summary
    };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/embed/preference.js
var require_preference = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/preference.js"(exports2, module2) {
    "use strict";
    var fs2 = require("fs");
    var path2 = require("path");
    var cache = require_cache();
    var VALID_EMBEDDER = ["none", "small", "big"];
    var VALID_DETAIL = ["compact", "balanced", "maximum"];
    function preferencePath(cwd) {
      return path2.join(cache.getStateDirPath(cwd), "sources", "preference.json");
    }
    function read(cwd) {
      const p = preferencePath(cwd);
      if (!fs2.existsSync(p)) return {};
      try {
        const raw = JSON.parse(fs2.readFileSync(p, "utf8"));
        return raw && typeof raw === "object" ? raw : {};
      } catch (e) {
        return {};
      }
    }
    function update(cwd, patch) {
      const current = read(cwd);
      const next = Object.assign({}, current, patch || {});
      const p = preferencePath(cwd);
      fs2.mkdirSync(path2.dirname(p), { recursive: true });
      fs2.writeFileSync(p, JSON.stringify(next, null, 2));
      return next;
    }
    function reset(cwd) {
      const current = read(cwd);
      delete current.embedder;
      delete current.embedderDetail;
      const p = preferencePath(cwd);
      fs2.mkdirSync(path2.dirname(p), { recursive: true });
      fs2.writeFileSync(p, JSON.stringify(current, null, 2));
    }
    function hasEmbedderChoice(cwd) {
      const pref = read(cwd);
      return VALID_EMBEDDER.includes(pref.embedder);
    }
    function hasDetailChoice(cwd) {
      const pref = read(cwd);
      return VALID_DETAIL.includes(pref.embedderDetail);
    }
    function detailToCliArg(detail) {
      switch (detail) {
        case "compact":
          return "compact";
        case "maximum":
          return "maximum";
        case "balanced":
        default:
          return "balanced";
      }
    }
    module2.exports = {
      read,
      update,
      reset,
      hasEmbedderChoice,
      hasDetailChoice,
      detailToCliArg,
      preferencePath,
      VALID_EMBEDDER,
      VALID_DETAIL
    };
  }
});

// ../work/agent-sh__agentsys/lib/binary/shared-helpers.js
var require_shared_helpers = __commonJS({
  "../work/agent-sh__agentsys/lib/binary/shared-helpers.js"(exports2, module2) {
    "use strict";
    var fs2 = require("fs");
    var path2 = require("path");
    var os = require("os");
    var https = require("https");
    var cp = require("child_process");
    var DEFAULT_DOWNLOAD_TIMEOUT_MS = 3e4;
    var MAX_REDIRECTS = 5;
    function downloadToBuffer(url, options) {
      const opts = options || {};
      const userAgent = opts.userAgent || "agent-sh/binary-resolver";
      const timeoutMs = opts.timeoutMs || DEFAULT_DOWNLOAD_TIMEOUT_MS;
      return new Promise(function(resolve, reject) {
        const ghToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        function request(reqUrl, redirectCount) {
          if (redirectCount > MAX_REDIRECTS) {
            reject(new Error("Too many redirects fetching from " + url));
            return;
          }
          const headers = {
            "User-Agent": userAgent,
            "Accept": "application/octet-stream"
          };
          if (ghToken) headers["Authorization"] = "Bearer " + ghToken;
          const req = https.get(reqUrl, { headers, timeout: timeoutMs }, function(res) {
            const sc = res.statusCode;
            if (sc === 301 || sc === 302 || sc === 307 || sc === 308) {
              res.resume();
              var loc = res.headers.location;
              if (loc && !loc.startsWith("https://")) {
                reject(new Error("Refusing non-HTTPS redirect to " + loc));
                return;
              }
              request(loc, redirectCount + 1);
              return;
            }
            if (sc !== 200) {
              res.resume();
              const hint = sc === 403 ? " (rate limited - set GITHUB_TOKEN env var)" : "";
              reject(new Error("HTTP " + sc + hint + " fetching " + reqUrl));
              return;
            }
            const chunks = [];
            res.on("data", function(chunk) {
              chunks.push(chunk);
            });
            res.on("end", function() {
              resolve(Buffer.concat(chunks));
            });
            res.on("error", reject);
          });
          req.on("error", reject);
          req.on("timeout", function() {
            req.destroy();
            reject(new Error("Timeout (" + timeoutMs + "ms) fetching " + reqUrl));
          });
        }
        request(url, 0);
      });
    }
    function extractTarGz(buf, destDir) {
      return new Promise(function(resolve, reject) {
        const tarDest = process.platform === "win32" ? destDir.replace(/\\/g, "/") : destDir;
        const tar = cp.spawn("tar", ["xz", "-C", tarDest], {
          stdio: ["pipe", "pipe", "pipe"]
        });
        let stderr = "";
        tar.stderr.on("data", function(d) {
          stderr += d;
        });
        tar.stdin.write(buf);
        tar.stdin.end();
        tar.on("close", function(code) {
          if (code !== 0) {
            reject(new Error("tar extraction failed (code " + code + "): " + stderr));
          } else {
            resolve();
          }
        });
        tar.on("error", reject);
      });
    }
    function extractZip(buf, destDir, binaryName) {
      return new Promise(function(resolve, reject) {
        var tmpDir = fs2.mkdtempSync(path2.join(os.tmpdir(), binaryName + "-"));
        var tmpZip = path2.join(tmpDir, "archive.zip");
        fs2.writeFileSync(tmpZip, buf);
        var ps = cp.spawn(
          "powershell",
          [
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            "Expand-Archive",
            "-Path",
            tmpZip,
            "-DestinationPath",
            destDir,
            "-Force"
          ],
          { stdio: ["ignore", "pipe", "pipe"] }
        );
        var stderr = "";
        ps.stderr.on("data", function(d) {
          stderr += d;
        });
        ps.on("close", function(code) {
          try {
            fs2.rmSync(tmpDir, { recursive: true, force: true });
          } catch (e) {
          }
          if (code !== 0) {
            reject(new Error("zip extraction failed (code " + code + "): " + stderr));
          } else {
            resolve();
          }
        });
        ps.on("error", reject);
      });
    }
    module2.exports = {
      downloadToBuffer,
      extractTarGz,
      extractZip,
      DEFAULT_DOWNLOAD_TIMEOUT_MS
    };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/embed/binary.js
var require_binary2 = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/binary.js"(exports2, module2) {
    "use strict";
    var fs2 = require("fs");
    var path2 = require("path");
    var os = require("os");
    var https = require("https");
    var cp = require("child_process");
    var mainBinary = require_binary();
    var sharedHelpers = require_shared_helpers();
    var EMBED_BINARY_NAME = "agent-analyzer-embed";
    var EMBED_GITHUB_REPO = "agent-sh/agent-analyzer";
    var LATEST_VERSION_TTL_MS = 60 * 60 * 1e3;
    var PLATFORM_MAP = mainBinary.PLATFORM_MAP;
    function getBinaryPath() {
      const ext = process.platform === "win32" ? ".exe" : "";
      return path2.join(os.homedir(), ".agent-sh", "bin", EMBED_BINARY_NAME + ext);
    }
    function getBundledOrtName() {
      if (process.platform === "win32") return "onnxruntime.dll";
      if (process.platform === "darwin") return "libonnxruntime.dylib";
      return "libonnxruntime.so";
    }
    function getBundledOrtPath() {
      return path2.join(path2.dirname(getBinaryPath()), getBundledOrtName());
    }
    function platformBundlesOrt() {
      const key = getPlatformKey();
      return !!key && !key.includes("musl");
    }
    function getPlatformKey() {
      const key = process.platform + "-" + process.arch;
      return PLATFORM_MAP[key] || null;
    }
    function getVersion() {
      const binPath = getBinaryPath();
      if (!fs2.existsSync(binPath)) return null;
      try {
        const out = cp.execFileSync(binPath, ["--version"], {
          timeout: 5e3,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true
        });
        const match = out.trim().match(/(\d+\.\d+\.\d+)/);
        return match ? match[1] : out.trim();
      } catch (e) {
        return null;
      }
    }
    function isAvailable() {
      return fs2.existsSync(getBinaryPath());
    }
    var _latestVersionCache = null;
    async function getLatestReleaseVersion() {
      if (_latestVersionCache && Date.now() - _latestVersionCache.fetchedAt < LATEST_VERSION_TTL_MS) {
        return _latestVersionCache.version;
      }
      return new Promise(function(resolve, reject) {
        const ghToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        const headers = {
          "User-Agent": "agent-sh/embed-resolver",
          "Accept": "application/vnd.github+json"
        };
        if (ghToken) headers["Authorization"] = "Bearer " + ghToken;
        const url = "https://api.github.com/repos/" + EMBED_GITHUB_REPO + "/releases/latest";
        const fail = function(msg) {
          reject(new Error(msg + " fetching " + url));
        };
        const req = https.get(url, { headers, timeout: 5e3 }, function(res) {
          if (res.statusCode !== 200) {
            res.resume();
            fail("HTTP " + res.statusCode);
            return;
          }
          const chunks = [];
          res.on("data", function(chunk) {
            chunks.push(chunk);
          });
          res.on("end", function() {
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
              const tag = body && body.tag_name || "";
              const version = tag.replace(/^v/, "");
              if (/^\d+\.\d+\.\d+/.test(version)) {
                _latestVersionCache = { version, fetchedAt: Date.now() };
                resolve(version);
              } else {
                fail("No valid release tag");
              }
            } catch (e) {
              fail("Failed to parse release JSON: " + e.message);
            }
          });
          res.on("error", function(e) {
            fail(e.message);
          });
        });
        req.on("error", function(e) {
          fail(e.message);
        });
        req.on("timeout", function() {
          req.destroy();
          fail("Timeout");
        });
      });
    }
    function buildDownloadUrl(ver, platformKey) {
      const ext = process.platform === "win32" ? ".zip" : ".tar.gz";
      return "https://github.com/" + EMBED_GITHUB_REPO + "/releases/download/v" + ver + "/" + EMBED_BINARY_NAME + "-" + platformKey + ext;
    }
    function downloadToBuffer(url) {
      return sharedHelpers.downloadToBuffer(url, { userAgent: "agent-sh/embed-resolver" });
    }
    var extractTarGz = sharedHelpers.extractTarGz;
    var extractZip = sharedHelpers.extractZip;
    async function downloadBinary(ver) {
      const platformKey = getPlatformKey();
      if (!platformKey) {
        throw new Error(
          "Unsupported platform: " + process.platform + "-" + process.arch + ". Supported: " + Object.keys(PLATFORM_MAP).join(", ")
        );
      }
      const url = buildDownloadUrl(ver, platformKey);
      process.stderr.write("Downloading " + EMBED_BINARY_NAME + " v" + ver + " for " + platformKey + "...\n");
      const binPath = getBinaryPath();
      const binDir = path2.dirname(binPath);
      fs2.mkdirSync(binDir, { recursive: true });
      let buf;
      try {
        buf = await downloadToBuffer(url);
      } catch (err) {
        throw new Error(
          "Failed to download " + EMBED_BINARY_NAME + ":\n  URL: " + url + "\n  Error: " + err.message + "\n\nTo install manually:\n  1. Download: " + url + "\n  2. Extract the binary to: " + binDir + "\n  3. Ensure it is named: " + path2.basename(binPath)
        );
      }
      if (process.platform === "win32") {
        await extractZip(buf, binDir, path2.basename(binPath));
      } else {
        await extractTarGz(buf, binDir);
      }
      if (process.platform !== "win32") {
        fs2.chmodSync(binPath, 493);
      }
      return binPath;
    }
    async function ensureBinary(options) {
      const opts = options || {};
      const binPath = getBinaryPath();
      if (fs2.existsSync(binPath)) {
        if (platformBundlesOrt() && !fs2.existsSync(getBundledOrtPath())) {
          const targetVer2 = opts.version || await getLatestReleaseVersion();
          return downloadBinary(targetVer2);
        }
        return binPath;
      }
      const targetVer = opts.version || await getLatestReleaseVersion();
      return downloadBinary(targetVer);
    }
    module2.exports = {
      EMBED_BINARY_NAME,
      getBinaryPath,
      getBundledOrtName,
      getBundledOrtPath,
      platformBundlesOrt,
      getVersion,
      getPlatformKey,
      getLatestReleaseVersion,
      isAvailable,
      ensureBinary,
      buildDownloadUrl
    };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/embed/orchestrator.js
var require_orchestrator = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/orchestrator.js"(exports2, module2) {
    "use strict";
    var fs2 = require("fs");
    var path2 = require("path");
    var cp = require("child_process");
    var preference = require_preference();
    var embedBinary = require_binary2();
    var mainBinary = require_binary();
    var cache = require_cache();
    function isEnabled(cwd) {
      const pref = preference.read(cwd);
      return pref.embedder === "small" || pref.embedder === "big";
    }
    async function runScan(cwd) {
      if (!isEnabled(cwd)) {
        return { ran: false, reason: 'embedder preference is "none" or unset' };
      }
      const pref = preference.read(cwd);
      const detail = preference.detailToCliArg(pref.embedderDetail || "balanced");
      const mapFile = cache.getPath(cwd);
      if (!fs2.existsSync(mapFile)) {
        return { ran: false, reason: "no repo-intel map found; run `/repo-intel init` first" };
      }
      const start = Date.now();
      const embedBin = await embedBinary.ensureBinary();
      const mainBin = await mainBinary.ensureBinary();
      const result = await streamEmbedToSetEmbeddings(
        embedBin,
        ["scan", cwd, "--variant", pref.embedder, "--detail", detail],
        mainBin,
        mapFile
      );
      return Object.assign({ ran: true, durationMs: Date.now() - start }, result);
    }
    async function runUpdate(cwd) {
      if (!isEnabled(cwd)) {
        return { ran: false, reason: 'embedder preference is "none" or unset' };
      }
      const pref = preference.read(cwd);
      const detail = preference.detailToCliArg(pref.embedderDetail || "balanced");
      const mapFile = cache.getPath(cwd);
      if (!fs2.existsSync(mapFile)) {
        return { ran: false, reason: "no repo-intel map; run `/repo-intel init` then `enrich`" };
      }
      const start = Date.now();
      const embedBin = await embedBinary.ensureBinary();
      const mainBin = await mainBinary.ensureBinary();
      const result = await streamEmbedToSetEmbeddings(
        embedBin,
        ["update", cwd, "--map-file", mapFile, "--variant", pref.embedder, "--detail", detail],
        mainBin,
        mapFile
      );
      return Object.assign({ ran: true, durationMs: Date.now() - start }, result);
    }
    function status(cwd) {
      const pref = preference.read(cwd);
      const mapFile = cache.getPath(cwd);
      const sidecarPath = deriveSidecarPath(mapFile);
      return {
        enabled: isEnabled(cwd),
        embedder: pref.embedder,
        embedderDetail: pref.embedderDetail,
        binaryInstalled: embedBinary.isAvailable(),
        ortBundled: !embedBinary.platformBundlesOrt() || fs2.existsSync(embedBinary.getBundledOrtPath()),
        sidecarExists: fs2.existsSync(sidecarPath),
        sidecarPath
      };
    }
    function streamEmbedToSetEmbeddings(embedBinPath, embedArgs, mainBinPath, mapFile) {
      return new Promise(function(resolve, reject) {
        const embedChild = cp.spawn(embedBinPath, embedArgs, {
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true
        });
        const setChild = cp.spawn(
          mainBinPath,
          ["repo-intel", "set-embeddings", "--map-file", mapFile, "--input", "-"],
          { stdio: ["pipe", "pipe", "pipe"], windowsHide: true }
        );
        let embedExit = null;
        let setExit = null;
        let settled = false;
        let setStdout = "";
        let embedStderr = "";
        let setStderr = "";
        function done(err, value) {
          if (settled) return;
          settled = true;
          if (err) {
            try {
              embedChild.kill("SIGTERM");
            } catch (e) {
            }
            try {
              setChild.kill("SIGTERM");
            } catch (e) {
            }
            reject(err);
          } else {
            resolve(value);
          }
        }
        function maybeFinish() {
          if (settled || embedExit === null || setExit === null) return;
          if (embedExit !== 0) {
            return done(new Error(
              embedBinary.EMBED_BINARY_NAME + " exited " + embedExit + (embedStderr.trim() ? ": " + embedStderr.trim().slice(0, 500) : "")
            ));
          }
          if (setExit !== 0) {
            return done(new Error(
              "agent-analyzer set-embeddings exited " + setExit + (setStderr.trim() ? ": " + setStderr.trim().slice(0, 500) : "")
            ));
          }
          const m = setStdout.match(/(\d+)\s+files?/);
          done(null, { files: m ? parseInt(m[1], 10) : void 0 });
        }
        embedChild.stderr.on("data", function(d) {
          embedStderr += d.toString("utf8");
        });
        setChild.stderr.on("data", function(d) {
          setStderr += d.toString("utf8");
        });
        setChild.stdout.on("data", function(d) {
          setStdout += d.toString("utf8");
        });
        embedChild.stdout.on("error", function(e) {
          done(e);
        });
        setChild.stdin.on("error", function(e) {
          if (e && e.code !== "EPIPE") done(e);
        });
        embedChild.stdout.pipe(setChild.stdin);
        embedChild.on("error", function(e) {
          done(e);
        });
        setChild.on("error", function(e) {
          done(e);
        });
        embedChild.on("close", function(code) {
          embedExit = code;
          maybeFinish();
        });
        setChild.on("close", function(code) {
          setExit = code;
          maybeFinish();
        });
      });
    }
    function deriveSidecarPath(mapFile) {
      if (!mapFile) return "";
      const dir = path2.dirname(mapFile);
      const stem = path2.basename(mapFile, path2.extname(mapFile));
      return path2.join(dir, stem + ".embeddings.bin");
    }
    module2.exports = {
      isEnabled,
      runScan,
      runUpdate,
      status,
      // exported for testing the dual-process pipe in isolation
      streamEmbedToSetEmbeddings
    };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/embed/index.js
var require_embed = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/index.js"(exports2, module2) {
    "use strict";
    var preference = require_preference();
    var binary = require_binary2();
    var orchestrator = require_orchestrator();
    module2.exports = {
      preference,
      binary,
      orchestrator,
      // Convenience re-exports for the common cases.
      isEnabled: orchestrator.isEnabled,
      runScan: orchestrator.runScan,
      runUpdate: orchestrator.runUpdate,
      status: orchestrator.status
    };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/index.js
var require_repo_intel = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/index.js"(exports2, module2) {
    "use strict";
    var fs2 = require("fs");
    var path2 = require("path");
    var cp = require("child_process");
    var { execFileSync: execFileSync2 } = cp;
    var installer = require_installer();
    var cache = require_cache();
    var updater = require_updater();
    var converter = require_converter();
    var queries = require_queries();
    var binary = require_binary();
    var { getStateDirPath } = require_state_dir();
    var { writeJsonAtomic } = require_atomic_write();
    var REPO_INTEL_FILENAME = "repo-intel.json";
    function getIntelMapPath(basePath) {
      return path2.join(getStateDirPath(basePath), REPO_INTEL_FILENAME);
    }
    async function init(basePath, options = {}) {
      const installed = await installer.checkInstalled();
      if (!installed.found) {
        return {
          success: false,
          error: "agent-analyzer binary unavailable: " + (installed.error || "unknown error"),
          installSuggestion: installer.getInstallInstructions()
        };
      }
      const existing = cache.load(basePath);
      if (existing && !options.force) {
        return {
          success: false,
          error: "Repo map already exists. Use --force to rebuild or update to refresh.",
          existing: cache.getStatus(basePath)
        };
      }
      const startTime = Date.now();
      let intelJson;
      try {
        intelJson = await binary.runAnalyzerAsync(["repo-intel", "init", basePath]);
      } catch (e) {
        return { success: false, error: "agent-analyzer repo-intel init failed: " + e.message };
      }
      let intel;
      try {
        intel = JSON.parse(intelJson);
      } catch (e) {
        return { success: false, error: "Failed to parse repo-intel output: " + e.message };
      }
      const intelPath = getIntelMapPath(basePath);
      try {
        writeJsonAtomic(intelPath, intel);
      } catch {
      }
      const map = converter.convertIntelToRepoMap(intel);
      map.stats.scanDurationMs = Date.now() - startTime;
      cache.save(basePath, map);
      return {
        success: true,
        map,
        summary: {
          files: Object.keys(map.files).length,
          symbols: map.stats.totalSymbols,
          languages: map.project.languages,
          duration: map.stats.scanDurationMs
        }
      };
    }
    async function update(basePath, options = {}) {
      const installed = await installer.checkInstalled();
      if (!installed.found) {
        return {
          success: false,
          error: "agent-analyzer binary unavailable: " + (installed.error || "unknown error"),
          installSuggestion: installer.getInstallInstructions()
        };
      }
      if (!cache.exists(basePath)) {
        return { success: false, error: "No repo map found. Run init first." };
      }
      if (options.full) {
        return init(basePath, { force: true });
      }
      const intelPath = getIntelMapPath(basePath);
      if (!fs2.existsSync(intelPath)) {
        return init(basePath, { force: true });
      }
      const startTime = Date.now();
      let intelJson;
      try {
        intelJson = await binary.runAnalyzerAsync([
          "repo-intel",
          "update",
          "--map-file",
          intelPath,
          basePath
        ]);
      } catch (e) {
        return { success: false, error: "agent-analyzer repo-intel update failed: " + e.message };
      }
      let intel;
      try {
        intel = JSON.parse(intelJson);
      } catch (e) {
        return { success: false, error: "Failed to parse repo-intel update output: " + e.message };
      }
      try {
        writeJsonAtomic(intelPath, intel);
      } catch {
      }
      const map = converter.convertIntelToRepoMap(intel);
      map.stats.scanDurationMs = Date.now() - startTime;
      cache.save(basePath, map);
      return {
        success: true,
        map,
        summary: {
          files: Object.keys(map.files).length,
          symbols: map.stats.totalSymbols,
          duration: map.stats.scanDurationMs
        }
      };
    }
    function status(basePath) {
      const map = cache.load(basePath);
      if (!map) {
        return { exists: false };
      }
      const staleness = updater.checkStaleness(basePath, map);
      let branch;
      try {
        branch = execFileSync2("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: basePath, encoding: "utf8" }).trim();
      } catch {
      }
      return {
        exists: true,
        status: {
          generated: map.generated,
          updated: map.updated,
          commit: map.git?.commit,
          branch,
          files: Object.keys(map.files).length,
          symbols: map.stats?.totalSymbols || 0,
          languages: map.project?.languages || [],
          staleness
        }
      };
    }
    function load(basePath) {
      return cache.load(basePath);
    }
    function exists(basePath) {
      return cache.exists(basePath);
    }
    function loadRaw(basePath) {
      const p = getIntelMapPath(basePath);
      if (!fs2.existsSync(p)) return null;
      try {
        return JSON.parse(fs2.readFileSync(p, "utf8"));
      } catch {
        return null;
      }
    }
    async function runAnalyzerWithStdin(args, stdinJson) {
      const binPath = await binary.ensureBinary();
      return new Promise((resolve, reject) => {
        const proc = cp.spawn(binPath, args, {
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true
        });
        let stdout = "";
        let stderr = "";
        proc.stdout.on("data", (chunk) => {
          stdout += chunk.toString("utf8");
        });
        proc.stderr.on("data", (chunk) => {
          stderr += chunk.toString("utf8");
        });
        proc.on("error", reject);
        proc.on("close", (code) => {
          if (code === 0) {
            resolve({ stdout, stderr });
          } else {
            reject(new Error(
              `agent-analyzer ${args.join(" ")} exited ${code}: ${stderr.trim() || stdout.trim()}`
            ));
          }
        });
        proc.stdin.write(stdinJson);
        proc.stdin.end();
      });
    }
    async function applyDescriptors(basePath, descriptors) {
      if (!descriptors || typeof descriptors !== "object") {
        throw new Error("applyDescriptors requires an object {path: descriptor}");
      }
      const mapFile = getIntelMapPath(basePath);
      if (!fs2.existsSync(mapFile)) {
        throw new Error("No repo-intel artifact for " + basePath + "; run init first.");
      }
      await runAnalyzerWithStdin(
        ["repo-intel", "set-descriptors", "--map-file", mapFile, "--input", "-"],
        JSON.stringify(descriptors)
      );
    }
    async function applySummary(basePath, summary) {
      if (!summary || !summary.depth1 || !summary.depth3 || !summary.depth10) {
        throw new Error("applySummary requires {depth1, depth3, depth10, inputHash}");
      }
      const mapFile = getIntelMapPath(basePath);
      if (!fs2.existsSync(mapFile)) {
        throw new Error("No repo-intel artifact for " + basePath + "; run init first.");
      }
      await runAnalyzerWithStdin(
        ["repo-intel", "set-summary", "--map-file", mapFile, "--input", "-"],
        JSON.stringify(summary)
      );
    }
    async function checkAstGrepInstalled() {
      return installer.checkInstalled();
    }
    function getInstallInstructions() {
      return installer.getInstallInstructions();
    }
    module2.exports = {
      // Lifecycle (was lib/repo-map)
      init,
      update,
      status,
      load,
      loadRaw,
      exists,
      applyDescriptors,
      applySummary,
      checkAstGrepInstalled,
      getInstallInstructions,
      // Typed query wrappers (read the cached repo-intel.json)
      queries,
      // Submodules for advanced use
      installer,
      cache,
      updater,
      converter
    };
    Object.defineProperty(module2.exports, "embed", {
      enumerable: true,
      get() {
        return require_embed();
      }
    });
  }
});

// ../work/agent-sh__agentsys/lib/repo-map/index.js
var require_repo_map = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-map/index.js"(exports2, module2) {
    "use strict";
    var repoIntel = require_repo_intel();
    module2.exports = {
      init: repoIntel.init,
      update: repoIntel.update,
      status: repoIntel.status,
      load: repoIntel.load,
      exists: repoIntel.exists,
      checkAstGrepInstalled: repoIntel.checkAstGrepInstalled,
      getInstallInstructions: repoIntel.getInstallInstructions,
      installer: repoIntel.installer,
      cache: repoIntel.cache,
      updater: repoIntel.updater
    };
  }
});

// ../work/agent-sh__agentsys/lib/collectors/docs-patterns.js
var fs = require("fs");
var path = require("path");
var { execFileSync } = require("child_process");
var repoMapModule = null;
var repoMapLoadError = null;
function getRepoMap() {
  if (!repoMapModule && !repoMapLoadError) {
    try {
      repoMapModule = require_repo_map();
    } catch (err) {
      repoMapLoadError = err.message || "Failed to load repo-map module";
      repoMapModule = null;
    }
  }
  return repoMapModule;
}
function getRepoMapLoadError() {
  return repoMapLoadError;
}
var DEFAULT_OPTIONS = {
  cwd: process.cwd()
};
var MAX_SCAN_DEPTH = 5;
var MAX_DOC_FILES = 200;
var INTERNAL_DIRS = ["internal", "private", "utils", "helpers", "__tests__", "test", "tests"];
var ENTRY_NAMES = ["index", "main", "app", "server", "cli", "bin"];
var EXPORT_PATTERNS = [
  /export\s+(?:function|class|const|let|var)\s+(\w+)/g,
  /export\s+\{([^}]+)\}/g,
  /module\.exports\s*=\s*\{([^}]+)\}/
];
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function isInternalExport(name, filePath) {
  if (name.startsWith("_")) return true;
  const pathLower = filePath.toLowerCase();
  for (const dir of INTERNAL_DIRS) {
    if (pathLower.includes(`/${dir}/`) || pathLower.includes(`\\${dir}\\`)) {
      return true;
    }
  }
  if (/\.(test|spec)\.[jt]sx?$/.test(filePath)) return true;
  return false;
}
function isEntryPoint(filePath) {
  const basename = path.basename(filePath);
  const nameWithoutExt = basename.replace(/\.[^.]+$/, "").toLowerCase();
  return ENTRY_NAMES.includes(nameWithoutExt);
}
async function ensureRepoMap(options = {}) {
  const { cwd = process.cwd(), askUser } = options;
  const repoMap = getRepoMap();
  if (!repoMap) {
    return { available: false, map: null, fallbackReason: "repo-map-module-not-found" };
  }
  if (repoMap.exists(cwd)) {
    const map = repoMap.load(cwd);
    return { available: true, map, fallbackReason: null };
  }
  const installed = await repoMap.checkAstGrepInstalled();
  if (!installed.found) {
    if (askUser) {
      const answer = await askUser({
        question: "ast-grep not found. Install for better doc sync accuracy?",
        header: "ast-grep Required",
        options: [
          { label: "Yes, show instructions", description: "Better accuracy with AST-based symbol detection" },
          { label: "No, use regex fallback", description: "Less accurate but works without additional install" }
        ]
      });
      if (answer && answer.includes("Yes")) {
        const instructions = repoMap.getInstallInstructions();
        return {
          available: false,
          map: null,
          fallbackReason: "ast-grep-install-pending",
          installInstructions: instructions
        };
      }
    }
    return { available: false, map: null, fallbackReason: "ast-grep-not-installed" };
  }
  try {
    const initResult = await repoMap.init(cwd, { force: false });
    if (initResult.success) {
      return { available: true, map: initResult.map, fallbackReason: null };
    }
    if (initResult.error && initResult.error.includes("already exists")) {
      const map = repoMap.load(cwd);
      return { available: true, map, fallbackReason: null };
    }
    return { available: false, map: null, fallbackReason: initResult.error || "init-failed" };
  } catch (err) {
    return { available: false, map: null, fallbackReason: err.message || "init-error" };
  }
}
function ensureRepoMapSync(options = {}) {
  const { cwd = process.cwd() } = options;
  const repoMap = getRepoMap();
  if (!repoMap) {
    return { available: false, map: null, fallbackReason: "repo-map-module-not-found" };
  }
  if (repoMap.exists(cwd)) {
    const map = repoMap.load(cwd);
    return { available: true, map, fallbackReason: null };
  }
  return { available: false, map: null, fallbackReason: "repo-map-not-initialized" };
}
function getExportsFromRepoMap(filePath, map) {
  if (!map || !map.files) return null;
  const normalizedPath = filePath.replace(/\\/g, "/");
  let fileData = map.files[normalizedPath];
  if (!fileData && normalizedPath.startsWith("./")) {
    fileData = map.files[normalizedPath.slice(2)];
  }
  if (!fileData && !normalizedPath.startsWith("./")) {
    fileData = map.files["./" + normalizedPath];
  }
  if (!fileData || !fileData.symbols || !fileData.symbols.exports) {
    return null;
  }
  return fileData.symbols.exports.map((e) => e.name);
}
function findUndocumentedExports(changedFiles, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const repoMapStatus = opts.repoMapStatus || ensureRepoMapSync(opts);
  if (!repoMapStatus.available || !repoMapStatus.map) {
    return [];
  }
  const map = repoMapStatus.map;
  const allDocs = findMarkdownFiles(opts.cwd);
  let allDocContent = "";
  for (const doc of allDocs) {
    try {
      allDocContent += fs.readFileSync(path.join(opts.cwd, doc), "utf8") + "\n";
    } catch {
    }
  }
  const issues = [];
  for (const file of changedFiles) {
    const normalizedFile = file.replace(/\\/g, "/");
    const fileData = map.files[normalizedFile] || map.files[normalizedFile.replace(/^\.\//, "")];
    if (!fileData || !fileData.symbols || !fileData.symbols.exports) {
      continue;
    }
    for (const exp of fileData.symbols.exports) {
      if (isInternalExport(exp.name, normalizedFile)) continue;
      if (isEntryPoint(normalizedFile)) continue;
      const namePattern = new RegExp(`\\b${escapeRegex(exp.name)}\\b`);
      if (!namePattern.test(allDocContent)) {
        issues.push({
          type: "undocumented-export",
          severity: "low",
          file: normalizedFile,
          name: exp.name,
          line: exp.line || 0,
          kind: exp.kind || "export",
          certainty: "MEDIUM",
          suggestion: `Export '${exp.name}' in ${normalizedFile} is not mentioned in any documentation`
        });
      }
    }
  }
  return issues;
}
function findRelatedDocs(changedFiles, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const basePath = opts.cwd;
  const results = [];
  const docFiles = findMarkdownFiles(basePath);
  for (const file of changedFiles) {
    const basename = path.basename(file).replace(/\.[^.]+$/, "");
    const modulePath = file.replace(/\.[^.]+$/, "");
    const dirName = path.dirname(file);
    for (const doc of docFiles) {
      let content;
      try {
        content = fs.readFileSync(path.join(basePath, doc), "utf8");
      } catch {
        continue;
      }
      const references = [];
      if (content.includes(basename)) {
        references.push("filename");
      }
      if (content.includes(file)) {
        references.push("full-path");
      }
      if (content.includes(`from '${modulePath}'`) || content.includes(`from "${modulePath}"`)) {
        references.push("import");
      }
      if (content.includes(`require('${modulePath}')`) || content.includes(`require("${modulePath}")`)) {
        references.push("require");
      }
      if (content.includes(`/${basename}`) || content.includes(`/${basename}.`)) {
        references.push("url-path");
      }
      if (references.length > 0) {
        results.push({
          doc,
          referencedFile: file,
          referenceTypes: references
        });
      }
    }
  }
  return results;
}
function findMarkdownFiles(basePath) {
  const files = [];
  const excludeDirs = ["node_modules", "dist", "build", ".git", "coverage", "vendor"];
  function scan(dir, depth = 0) {
    if (depth > MAX_SCAN_DEPTH || files.length > MAX_DOC_FILES) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(basePath, fullPath);
        if (entry.isDirectory()) {
          if (!excludeDirs.includes(entry.name) && !entry.name.startsWith(".")) {
            scan(fullPath, depth + 1);
          }
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          files.push(relativePath);
        }
      }
    } catch {
    }
  }
  scan(basePath);
  return files;
}
function analyzeDocIssues(docPath, changedFile, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const basePath = opts.cwd;
  const issues = [];
  let content;
  try {
    content = fs.readFileSync(path.join(basePath, docPath), "utf8");
  } catch {
    return issues;
  }
  const lines = content.split("\n");
  const codeBlockRegex = /```[\s\S]*?```/g;
  const codeBlocks = content.match(codeBlockRegex) || [];
  for (const block of codeBlocks) {
    const importRegex = /import .* from ['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(block)) !== null) {
      const importPath = match[1];
      const changedModulePath = changedFile.replace(/\.[^.]+$/, "");
      if (importPath.includes(path.basename(changedModulePath))) {
        issues.push({
          type: "code-example",
          severity: "medium",
          line: findLineNumber(content, match[0]),
          current: match[0],
          suggestion: "Verify import path is still valid"
        });
      }
    }
  }
  const repoMapStatus = ensureRepoMapSync(opts);
  let oldExports, newExports;
  let usingRepoMap = false;
  if (repoMapStatus.available && repoMapStatus.map) {
    const repoMapExports = getExportsFromRepoMap(changedFile, repoMapStatus.map);
    if (repoMapExports) {
      newExports = repoMapExports;
      oldExports = getExportsFromGit(changedFile, "HEAD~1", opts);
      usingRepoMap = true;
    }
  }
  if (!usingRepoMap) {
    oldExports = getExportsFromGit(changedFile, "HEAD~1", opts);
    newExports = getExportsFromGit(changedFile, "HEAD", opts);
  }
  const removed = oldExports.filter((e) => !newExports.includes(e));
  for (const fn of removed) {
    if (content.includes(fn)) {
      issues.push({
        type: "removed-export",
        severity: "high",
        reference: fn,
        suggestion: `'${fn}' was removed or renamed`,
        detectionMethod: usingRepoMap ? "repo-map" : "regex"
      });
    }
  }
  try {
    const pkgContent = fs.readFileSync(path.join(basePath, "package.json"), "utf8");
    const pkg = JSON.parse(pkgContent);
    const currentVersion = pkg.version;
    const versionMatches = content.matchAll(/version[:\s]+['"]?(\d+\.\d+\.\d+)/gi);
    for (const match of versionMatches) {
      const docVersion = match[1];
      if (docVersion !== currentVersion && compareVersions(docVersion, currentVersion) < 0) {
        issues.push({
          type: "outdated-version",
          severity: "low",
          line: findLineNumber(content, match[0]),
          current: docVersion,
          expected: currentVersion,
          suggestion: `Update version from ${docVersion} to ${currentVersion}`
        });
      }
    }
  } catch {
  }
  return issues;
}
function findLineNumber(content, search) {
  const index = content.indexOf(search);
  if (index === -1) return 0;
  return content.substring(0, index).split("\n").length;
}
function isValidGitRef(ref) {
  if (typeof ref !== "string" || !ref) return false;
  return /^[a-zA-Z0-9_./-]+(?:[~^][0-9]+)?$/.test(ref);
}
function getExportsFromGit(filePath, ref, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  if (!isValidGitRef(ref)) {
    return [];
  }
  try {
    const content = execFileSync("git", ["show", `${ref}:${filePath}`], {
      cwd: opts.cwd,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    });
    const exports2 = [];
    for (const pattern of EXPORT_PATTERNS) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(content)) !== null) {
        if (match[1].includes(",")) {
          const names = match[1].split(",").map((s) => s.trim().split(/\s+as\s+/)[0].trim());
          exports2.push(...names.filter((n) => n && /^\w+$/.test(n)));
        } else {
          exports2.push(match[1]);
        }
      }
    }
    return [...new Set(exports2)];
  } catch {
    return [];
  }
}
function compareVersions(v1, v2) {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  return 0;
}
function checkChangelog(changedFiles, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const basePath = opts.cwd;
  const changelogPath = path.join(basePath, "CHANGELOG.md");
  if (!fs.existsSync(changelogPath)) {
    return { exists: false };
  }
  let changelog;
  try {
    changelog = fs.readFileSync(changelogPath, "utf8");
  } catch {
    return { exists: false, error: "Could not read CHANGELOG.md" };
  }
  const hasUnreleased = changelog.includes("## [Unreleased]");
  let recentCommits = [];
  try {
    const output = execFileSync("git", ["log", "--oneline", "-10", "HEAD"], {
      cwd: basePath,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    });
    recentCommits = output.trim().split("\n");
  } catch {
  }
  const documented = [];
  const undocumented = [];
  for (const commit of recentCommits) {
    if (!commit) continue;
    const msg = commit.substring(8);
    if (changelog.includes(msg) || changelog.includes(commit.substring(0, 7))) {
      documented.push(msg);
    } else if (msg.match(/^(feat|fix|breaking)/i)) {
      undocumented.push(msg);
    }
  }
  return {
    exists: true,
    hasUnreleased,
    documented,
    undocumented,
    suggestion: undocumented.length > 0 ? `${undocumented.length} commits may need CHANGELOG entries` : null
  };
}
function collect(options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const changedFiles = opts.changedFiles || [];
  const repoMapStatus = ensureRepoMapSync(opts);
  return {
    relatedDocs: findRelatedDocs(changedFiles, opts),
    changelog: checkChangelog(changedFiles, opts),
    markdownFiles: findMarkdownFiles(opts.cwd),
    // New: repo-map integration
    repoMap: {
      available: repoMapStatus.available,
      fallbackReason: repoMapStatus.fallbackReason,
      stats: repoMapStatus.map ? {
        files: Object.keys(repoMapStatus.map.files || {}).length,
        symbols: repoMapStatus.map.stats?.totalSymbols || 0
      } : null
    },
    // New: undocumented exports detection (pass repoMapStatus to avoid redundant call)
    undocumentedExports: repoMapStatus.available ? findUndocumentedExports(changedFiles, { ...opts, repoMapStatus }) : []
  };
}
module.exports = {
  DEFAULT_OPTIONS,
  findRelatedDocs,
  findMarkdownFiles,
  analyzeDocIssues,
  checkChangelog,
  getExportsFromGit,
  compareVersions,
  findLineNumber,
  collect,
  // New: repo-map integration
  ensureRepoMap,
  ensureRepoMapSync,
  getExportsFromRepoMap,
  findUndocumentedExports,
  isInternalExport,
  isEntryPoint,
  // Utilities
  escapeRegex,
  // Diagnostic
  getRepoMapLoadError
};
