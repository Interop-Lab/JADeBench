'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0xc66418, _0x5a5017) => function _0x4a8622() {
  if (!_0x5a5017) {
    (0, _0xc66418[__getOwnPropNames(_0xc66418)[0]])((_0x5a5017 = {
      exports: {}
    }).exports, _0x5a5017);
  }
  return _0x5a5017.exports;
};
var require_version = __commonJS({
  "../work/agent-sh__agentsys/lib/binary/version.js"(_0x52a50c, _0x489548) {
    'use strict';

    "use strict";
    var _0x599cbc = "0.3.0";
    var _0x3caa2c = "agent-analyzer";
    var _0xd995ef = "agent-sh/agent-analyzer";
    const _0x29546f = {
      ANALYZER_MIN_VERSION: _0x599cbc,
      BINARY_NAME: _0x3caa2c,
      GITHUB_REPO: _0xd995ef
    };
    _0x489548.exports = _0x29546f;
  }
});
var require_binary = __commonJS({
  "../work/agent-sh__agentsys/lib/binary/index.js"(_0x2e3cce, _0x1101d5) {
    'use strict';

    var _0x100d5c = require("fs");
    var _0x5f5280 = require("path");
    var _0x1337df = require("os");
    var _0x4c379e = require("https");
    var _0x18147c = require("child_process");
    var _0x26db1f = require("crypto");
    var {
      promisify: _0x13efd6
    } = require("util");
    var _0x1cce33 = _0x13efd6(_0x18147c.execFile);
    var _0x4589b5 = 268435456;
    var {
      ANALYZER_MIN_VERSION: _0x47f482,
      BINARY_NAME: _0x4f915e,
      GITHUB_REPO: _0x3d517b
    } = require_version();
    var _0x5cc875 = {
      "darwin-arm64": "aarch64-apple-darwin",
      "darwin-x64": "x86_64-apple-darwin",
      "linux-x64": "x86_64-unknown-linux-gnu",
      "linux-arm64": "aarch64-unknown-linux-gnu",
      "win32-x64": "x86_64-pc-windows-msvc"
    };
    function _0x502e76() {
      const _0x233aa3 = process.platform === "win32" ? ".exe" : "";
      return _0x5f5280.join(_0x1337df.homedir(), ".agent-sh", "bin", _0x4f915e + _0x233aa3);
    }
    function _0x5553e4() {
      const _0x210425 = process.platform + "-" + process.arch;
      return _0x5cc875[_0x210425] || null;
    }
    function _0x4941af(_0xc1baa5, _0x244f2e) {
      if (!_0xc1baa5) {
        return false;
      }
      const _0x185ff0 = _0xc1baa5.match(/^(\d+)\.(\d+)\.(\d+)/);
      if (!_0x185ff0) {
        return false;
      }
      const _0x40722d = _0x185ff0.slice(1).map(Number);
      const _0x3d5716 = _0x244f2e.split(".").map(Number);
      if (_0x40722d[0] > _0x3d5716[0]) {
        return true;
      }
      if (_0x40722d[0] < _0x3d5716[0]) {
        return false;
      }
      if (_0x40722d[1] > _0x3d5716[1]) {
        return true;
      }
      if (_0x40722d[1] < _0x3d5716[1]) {
        return false;
      }
      return _0x40722d[2] >= _0x3d5716[2];
    }
    function _0x2c31b3() {
      const _0x4c8b6f = _0x502e76();
      if (!_0x100d5c.existsSync(_0x4c8b6f)) {
        return null;
      }
      try {
        const _0x4c2396 = _0x18147c.execFileSync(_0x4c8b6f, ["--version"], {
          timeout: 5000,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true
        });
        const _0x59c1ae = _0x4c2396.trim().match(/(\d+\.\d+\.\d+)/);
        if (_0x59c1ae) {
          return _0x59c1ae[1];
        } else {
          return _0x4c2396.trim();
        }
      } catch (_0x2a7c65) {
        return null;
      }
    }
    function _0x52224b() {
      const _0x1c7c66 = _0x502e76();
      if (!_0x100d5c.existsSync(_0x1c7c66)) {
        return false;
      }
      const _0x102110 = _0x2c31b3();
      return _0x4941af(_0x102110, _0x47f482);
    }
    async function _0x42b9c1() {
      return _0x52224b();
    }
    function _0x3493ae(_0xdaba7f, _0xe26bcf) {
      const _0x3d6c8e = process.platform === "win32" ? ".zip" : ".tar.gz";
      return "https://github.com/" + _0x3d517b + "/releases/download/v" + _0xdaba7f + "/" + _0x4f915e + "-" + _0xe26bcf + _0x3d6c8e;
    }
    function _0x7742ba(_0x352e23) {
      return new Promise(function (_0x495182, _0x4dab1c) {
        const _0x4bb6d3 = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        function _0x47af55(_0x325957, _0x2641f1) {
          if (_0x2641f1 > 5) {
            _0x4dab1c(new Error("Too many redirects fetching from " + _0x352e23));
            return;
          }
          const _0x53a3ba = {
            "User-Agent": "agent-core/binary-resolver",
            Accept: "application/octet-stream"
          };
          if (_0x4bb6d3) {
            _0x53a3ba.Authorization = "Bearer " + _0x4bb6d3;
          }
          const _0x475c75 = {
            headers: _0x53a3ba
          };
          _0x4c379e.get(_0x325957, _0x475c75, function (_0xb44bc0) {
            const _0x58b82a = _0xb44bc0.statusCode;
            if (_0x58b82a === 301 || _0x58b82a === 302 || _0x58b82a === 307 || _0x58b82a === 308) {
              _0xb44bc0.resume();
              _0x47af55(_0xb44bc0.headers.location, _0x2641f1 + 1);
              return;
            }
            if (_0x58b82a !== 200) {
              _0xb44bc0.resume();
              const _0x3979a1 = _0x58b82a === 403 ? " (rate limited - set GITHUB_TOKEN env var)" : "";
              _0x4dab1c(new Error("HTTP " + _0x58b82a + _0x3979a1 + " fetching " + _0x325957));
              return;
            }
            const _0x2d412d = [];
            _0xb44bc0.on("data", function (_0x1a9383) {
              _0x2d412d.push(_0x1a9383);
            });
            _0xb44bc0.on("end", function () {
              _0x495182(Buffer.concat(_0x2d412d));
            });
            _0xb44bc0.on("error", _0x4dab1c);
          }).on("error", _0x4dab1c);
        }
        _0x47af55(_0x352e23, 0);
      });
    }
    function _0x478c36(_0x46ef9d) {
      if (typeof _0x46ef9d !== "string") {
        _0x46ef9d = String(_0x46ef9d || "");
      }
      const _0x43864c = _0x46ef9d.trim().match(/^([A-Fa-f0-9]{64})\b/);
      if (!_0x43864c) {
        throw new Error("Could not parse SHA-256 digest from sidecar body");
      }
      return _0x43864c[1].toLowerCase();
    }
    async function _0x165c34(_0x4ebe71) {
      const _0x479ccc = _0x4ebe71 + ".sha256";
      const _0x47f88d = await _0x7742ba(_0x479ccc);
      return _0x478c36(_0x47f88d.toString("utf8"));
    }
    function _0x4f06c9(_0x4c012b) {
      return _0x26db1f.createHash("sha256").update(_0x4c012b).digest("hex");
    }
    function _0x1b0b18(_0xa52c3e, _0x575e9e, _0x43e47a) {
      const _0x4aa66c = String(_0x575e9e || "").toLowerCase();
      const _0x50249e = _0x4f06c9(_0xa52c3e);
      if (_0x4aa66c !== _0x50249e) {
        throw new Error("SHA-256 verification failed for " + _0x43e47a + ": expected " + _0x4aa66c + ", got " + _0x50249e + ". This could indicate a tampered release. Do not extract.");
      }
    }
    function _0x59d897(_0x3589b9) {
      if (!_0x3589b9 || typeof _0x3589b9 !== "string") {
        throw new Error("Refusing to extract archive with empty entry name");
      }
      const _0x5ae03d = _0x3589b9.replace(/\\/g, "/").trim();
      if (_0x5ae03d.length === 0) {
        throw new Error("Refusing to extract archive with empty entry name");
      }
      if (_0x5ae03d.startsWith("//")) {
        throw new Error("Refusing to extract archive with UNC entry: " + _0x3589b9);
      }
      if (_0x5ae03d.startsWith("/")) {
        throw new Error("Refusing to extract archive with absolute entry: " + _0x3589b9);
      }
      if (/^[A-Za-z]:[\\/]/.test(_0x3589b9)) {
        throw new Error("Refusing to extract archive with Windows absolute entry: " + _0x3589b9);
      }
      const _0x5ee78c = _0x5ae03d.split("/").filter(function (_0x248baa) {
        return _0x248baa.length > 0;
      });
      for (let _0x4261a6 = 0; _0x4261a6 < _0x5ee78c.length; _0x4261a6++) {
        if (_0x5ee78c[_0x4261a6] === "..") {
          throw new Error("Refusing to extract archive with parent-traversal entry: " + _0x3589b9);
        }
      }
    }
    function _0x2285e7(_0x3463de) {
      return new Promise(function (_0xa7de36, _0x383270) {
        const _0x2ad4d4 = _0x18147c.spawn("tar", ["-tz"], {
          stdio: ["pipe", "pipe", "pipe"]
        });
        let _0xb1459 = "";
        let _0x59c5c9 = "";
        _0x2ad4d4.stdout.on("data", function (_0x50d069) {
          _0xb1459 += _0x50d069;
        });
        _0x2ad4d4.stderr.on("data", function (_0x39e8c4) {
          _0x59c5c9 += _0x39e8c4;
        });
        _0x2ad4d4.on("error", _0x383270);
        _0x2ad4d4.on("close", function (_0x24881e) {
          if (_0x24881e !== 0) {
            _0x383270(new Error("tar -tz listing failed (code " + _0x24881e + "): " + _0x59c5c9));
            return;
          }
          const _0x1d6a39 = _0xb1459.split(/\r?\n/).filter(function (_0x13abed) {
            return _0x13abed.length > 0;
          });
          _0xa7de36(_0x1d6a39);
        });
        _0x2ad4d4.stdin.write(_0x3463de);
        _0x2ad4d4.stdin.end();
      });
    }
    function _0x4243fc(_0x29a0ef, _0xdc1e5) {
      const _0x35ed4f = _0x5f5280.resolve(_0x29a0ef) + _0x5f5280.sep;
      const _0x2fa0ff = _0x5f5280.resolve(_0xdc1e5);
      if (_0x2fa0ff !== _0x5f5280.resolve(_0x29a0ef) && !_0x2fa0ff.startsWith(_0x35ed4f)) {
        throw new Error("Extracted path escapes extract root: " + _0xdc1e5);
      }
    }
    function _0x1e4595(_0x11cc20) {
      const _0x1df722 = [];
      const _0x41b5a9 = [_0x11cc20];
      while (_0x41b5a9.length > 0) {
        const _0x2de91d = _0x41b5a9.pop();
        const _0x222554 = _0x100d5c.lstatSync(_0x2de91d);
        if (_0x222554.isSymbolicLink()) {
          throw new Error("Refusing to follow symlink produced by extractor: " + _0x2de91d);
        }
        if (_0x222554.isDirectory()) {
          const _0x50334e = _0x100d5c.readdirSync(_0x2de91d);
          for (let _0x568c83 = 0; _0x568c83 < _0x50334e.length; _0x568c83++) {
            _0x41b5a9.push(_0x5f5280.join(_0x2de91d, _0x50334e[_0x568c83]));
          }
        } else if (_0x222554.isFile()) {
          _0x1df722.push(_0x2de91d);
        }
      }
      return _0x1df722;
    }
    function _0x3c411a(_0x29eafe) {
      try {
        _0x100d5c.rmSync(_0x29eafe, {
          recursive: true,
          force: true
        });
      } catch (_0x267272) {}
    }
    async function _0x2bb6b1(_0x53b5c0) {
      const _0x2aaddd = await _0x2285e7(_0x53b5c0);
      for (let _0x3d3995 = 0; _0x3d3995 < _0x2aaddd.length; _0x3d3995++) {
        _0x59d897(_0x2aaddd[_0x3d3995]);
      }
      const _0x196b15 = _0x100d5c.mkdtempSync(_0x5f5280.join(_0x1337df.tmpdir(), "agent-analyzer-tar-"));
      try {
        await new Promise(function (_0x90bd58, _0x2721d2) {
          const _0x3f0185 = _0x18147c.spawn("tar", ["xz", "-C", _0x196b15], {
            stdio: ["pipe", "pipe", "pipe"]
          });
          let _0x46e34b = "";
          _0x3f0185.stderr.on("data", function (_0x123bdb) {
            _0x46e34b += _0x123bdb;
          });
          _0x3f0185.on("error", _0x2721d2);
          _0x3f0185.on("close", function (_0x42eeb1) {
            if (_0x42eeb1 !== 0) {
              _0x2721d2(new Error("tar extraction failed (code " + _0x42eeb1 + "): " + _0x46e34b));
            } else {
              _0x90bd58();
            }
          });
          _0x3f0185.stdin.write(_0x53b5c0);
          _0x3f0185.stdin.end();
        });
        const _0x363ece = _0x1e4595(_0x196b15);
        for (let _0x3b3c82 = 0; _0x3b3c82 < _0x363ece.length; _0x3b3c82++) {
          _0x4243fc(_0x196b15, _0x363ece[_0x3b3c82]);
        }
      } catch (_0x5da500) {
        _0x3c411a(_0x196b15);
        throw _0x5da500;
      }
      return _0x196b15;
    }
    var _0x435aae = ["$ErrorActionPreference = \"Stop\"", "$src  = $env:SRC_ZIP", "$dest = $env:DEST_DIR", "if ([string]::IsNullOrEmpty($src) -or [string]::IsNullOrEmpty($dest)) {", "  [Console]::Error.WriteLine(\"SRC_ZIP and DEST_DIR must both be set\"); exit 2", "}", "Add-Type -AssemblyName System.IO.Compression.FileSystem", "$destFull = [System.IO.Path]::GetFullPath($dest)", "if (-not $destFull.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {", "  $destFull = $destFull + [System.IO.Path]::DirectorySeparatorChar", "}", "$zip = [System.IO.Compression.ZipFile]::OpenRead($src)", "try {", "  foreach ($entry in $zip.Entries) {", "    $name = $entry.FullName", "    if ([string]::IsNullOrEmpty($name)) { continue }", "    $norm = $name -replace \"\\\\\",\"/\"", "    if ($norm.StartsWith(\"/\") -or $norm.StartsWith(\"//\")) {", "      [Console]::Error.WriteLine(\"Refusing absolute/UNC entry: \" + $name); exit 3", "    }", "    if ($name -match \"^[A-Za-z]:[\\\\/]\") {", "      [Console]::Error.WriteLine(\"Refusing Windows-absolute entry: \" + $name); exit 3", "    }", "    foreach ($part in ($norm -split \"/\")) {", "      if ($part -eq \"..\") {", "        [Console]::Error.WriteLine(\"Refusing parent-traversal entry: \" + $name); exit 3", "      }", "    }", "    $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($destFull, $norm))", "    if (-not $target.StartsWith($destFull, [System.StringComparison]::OrdinalIgnoreCase)) {", "      [Console]::Error.WriteLine(\"Entry escapes destination: \" + $name); exit 3", "    }", "    if ($entry.FullName.EndsWith(\"/\")) {", "      [System.IO.Directory]::CreateDirectory($target) | Out-Null", "    } else {", "      $parent = [System.IO.Path]::GetDirectoryName($target)", "      if ($parent) { [System.IO.Directory]::CreateDirectory($parent) | Out-Null }", "      [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true)", "    }", "  }", "} finally {", "  $zip.Dispose()", "}"].join("\r\n");
    async function _0x11577e(_0x2bd180) {
      const _0x583fa8 = _0x100d5c.mkdtempSync(_0x5f5280.join(_0x1337df.tmpdir(), "agent-analyzer-zip-"));
      const _0x336120 = _0x5f5280.join(_0x583fa8, "__archive.zip");
      const _0x4e2635 = _0x100d5c.mkdtempSync(_0x5f5280.join(_0x1337df.tmpdir(), "agent-analyzer-ps-"));
      const _0x689868 = _0x5f5280.join(_0x4e2635, "extract.ps1");
      try {
        _0x100d5c.writeFileSync(_0x336120, _0x2bd180);
        _0x100d5c.writeFileSync(_0x689868, _0x435aae, "utf8");
        await new Promise(function (_0x384388, _0x5074a9) {
          const _0x2bfae4 = {
            SRC_ZIP: _0x336120,
            DEST_DIR: _0x583fa8
          };
          const _0x4ce283 = _0x18147c.execFile("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", _0x689868], {
            windowsHide: true,
            env: Object.assign({}, process.env, _0x2bfae4)
          }, function (_0x17ddb0, _0x545a6e, _0x370c51) {
            if (_0x17ddb0) {
              _0x5074a9(new Error("zip extraction failed: " + (_0x370c51 || _0x17ddb0.message)));
            } else {
              _0x384388();
            }
          });
          if (_0x4ce283.stdin) {
            _0x4ce283.stdin.end();
          }
        });
        try {
          _0x100d5c.unlinkSync(_0x336120);
        } catch (_0x3c9fd6) {}
        const _0x49908a = _0x1e4595(_0x583fa8);
        for (let _0x26a660 = 0; _0x26a660 < _0x49908a.length; _0x26a660++) {
          _0x4243fc(_0x583fa8, _0x49908a[_0x26a660]);
        }
      } catch (_0x5e8c6c) {
        _0x3c411a(_0x583fa8);
        throw _0x5e8c6c;
      } finally {
        _0x3c411a(_0x4e2635);
      }
      return _0x583fa8;
    }
    function _0x183902(_0x5195e8, _0x4c6bd4) {
      const _0x4bc66c = _0x1e4595(_0x5195e8);
      for (let _0x54a590 = 0; _0x54a590 < _0x4bc66c.length; _0x54a590++) {
        if (_0x5f5280.basename(_0x4bc66c[_0x54a590]) === _0x4c6bd4) {
          _0x4243fc(_0x5195e8, _0x4bc66c[_0x54a590]);
          return _0x4bc66c[_0x54a590];
        }
      }
      return null;
    }
    function _0x4fff31(_0x4261ae, _0x5041d6) {
      try {
        const _0x19ea02 = _0x18147c.execFileSync("gh", ["attestation", "verify", _0x4261ae, "--repo", _0x5041d6, "--format", "json"], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
          timeout: 60000,
          windowsHide: true
        });
        return {
          status: 0,
          stdout: _0x19ea02 || "",
          stderr: ""
        };
      } catch (_0x5acf95) {
        return {
          status: typeof _0x5acf95.status === "number" ? _0x5acf95.status : null,
          stdout: _0x5acf95.stdout ? String(_0x5acf95.stdout) : "",
          stderr: _0x5acf95.stderr ? String(_0x5acf95.stderr) : _0x5acf95.message || ""
        };
      }
    }
    function _0x50fb44(_0xd4989d) {
      if (typeof _0xd4989d === "function") {
        try {
          return !!_0xd4989d();
        } catch (_0x75d96a) {
          return false;
        }
      }
      try {
        _0x18147c.execFileSync("gh", ["--version"], {
          stdio: "ignore",
          timeout: 5000,
          windowsHide: true
        });
        return true;
      } catch (_0x54c912) {
        return false;
      }
    }
    function _0x211272(_0x465285, _0x3680c3) {
      const _0x5b1300 = _0x3680c3 || {};
      const _0x6bf5e = _0x5b1300.repo || _0x3d517b;
      const _0x32c0ce = typeof _0x5b1300.ghRunner === "function" ? _0x5b1300.ghRunner : _0x4fff31;
      const _0x463e43 = typeof _0x5b1300.requireAttestation === "boolean" ? _0x5b1300.requireAttestation : process.env.AGENT_ANALYZER_REQUIRE_ATTESTATION === "1";
      const _0x25ac2e = _0x50fb44(_0x5b1300.ghProbe);
      if (!_0x25ac2e) {
        const _0x37a91f = "`gh` CLI not found on PATH";
        if (_0x463e43) {
          return {
            status: "failed",
            reason: _0x37a91f + " (AGENT_ANALYZER_REQUIRE_ATTESTATION=1)"
          };
        }
        const _0x169129 = {
          status: "skipped",
          reason: _0x37a91f
        };
        return _0x169129;
      }
      const _0x1f12ff = _0x32c0ce(_0x465285, _0x6bf5e);
      if (_0x1f12ff && _0x1f12ff.status === 0) {
        return {
          status: "verified"
        };
      }
      return {
        status: "failed",
        reason: "gh attestation verify exited with status " + (_0x1f12ff && _0x1f12ff.status !== null ? _0x1f12ff.status : "unknown"),
        stderr: _0x1f12ff && _0x1f12ff.stderr || ""
      };
    }
    async function _0x1bb484(_0x335eb6, _0x204af9) {
      const _0x462892 = _0x204af9 || {};
      const _0x1af3a5 = _0x462892.skipChecksum === true;
      const _0x4402cb = _0x462892.skipAttestation === true;
      const _0x381308 = _0x5553e4();
      if (!_0x381308) {
        throw new Error("Unsupported platform: " + process.platform + "-" + process.arch + ". Supported platforms: " + Object.keys(_0x5cc875).join(", "));
      }
      const _0x558323 = _0x3493ae(_0x335eb6, _0x381308);
      const _0x1c2c23 = _0x558323.substring(_0x558323.lastIndexOf("/") + 1);
      process.stderr.write("Downloading " + _0x4f915e + " v" + _0x335eb6 + " for " + _0x381308 + "...\n");
      const _0xcff3e6 = _0x502e76();
      const _0x5b4acf = _0x5f5280.dirname(_0xcff3e6);
      _0x100d5c.mkdirSync(_0x5b4acf, {
        recursive: true
      });
      let _0x56c5ba;
      try {
        _0x56c5ba = await _0x7742ba(_0x558323);
      } catch (_0x18f540) {
        throw new Error("Failed to download " + _0x4f915e + ":\n  URL: " + _0x558323 + "\n  Error: " + _0x18f540.message + "\n\nTo install manually:\n  1. Download: " + _0x558323 + "\n  2. Extract the binary to: " + _0x5b4acf + "\n  3. Ensure it is named: " + _0x5f5280.basename(_0xcff3e6));
      }
      if (_0x1af3a5) {
        process.stderr.write("[WARN] skipChecksum=true - SHA-256 verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n");
      } else {
        let _0x5c0e40;
        try {
          _0x5c0e40 = await _0x165c34(_0x558323);
        } catch (_0x362e00) {
          throw new Error("Failed to fetch SHA-256 sidecar for " + _0x1c2c23 + ":\n  URL: " + _0x558323 + ".sha256\n  Error: " + _0x362e00.message + "\n\nThe release may be missing its checksum file. Refusing to install an unverified binary. If this is a legacy release without sidecars, pass { skipChecksum: true } to downloadBinary() (LOCAL DEV ONLY).");
        }
        _0x1b0b18(_0x56c5ba, _0x5c0e40, _0x1c2c23);
      }
      if (_0x4402cb) {
        process.stderr.write("[WARN] skipAttestation=true - SLSA verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n");
      } else {
        const _0x32dcbc = _0x100d5c.mkdtempSync(_0x5f5280.join(_0x1337df.tmpdir(), "agent-analyzer-slsa-"));
        const _0x1d2df8 = _0x5f5280.join(_0x32dcbc, _0x1c2c23);
        try {
          _0x100d5c.writeFileSync(_0x1d2df8, _0x56c5ba);
          const _0x3370a8 = {
            repo: _0x3d517b,
            requireAttestation: _0x462892.requireAttestation,
            ghRunner: _0x462892.ghRunner,
            ghProbe: _0x462892.ghProbe
          };
          const _0x42de49 = _0x211272(_0x1d2df8, _0x3370a8);
          if (_0x42de49.status === "verified") {
            process.stderr.write("[OK] SLSA attestation verified for " + _0x1c2c23 + "\n");
          } else if (_0x42de49.status === "skipped") {
            process.stderr.write("[WARN] SLSA attestation check skipped: " + _0x42de49.reason + ". Install the GitHub CLI (`gh`) to enable provenance verification. Set AGENT_ANALYZER_REQUIRE_ATTESTATION=1 to require it.\n");
          } else {
            throw new Error("SLSA attestation verification failed for " + _0x1c2c23 + ": " + _0x42de49.reason + ". Refusing to execute binary." + (_0x42de49.stderr ? "\n--- gh stderr ---\n" + _0x42de49.stderr : ""));
          }
        } finally {
          _0x3c411a(_0x32dcbc);
        }
      }
      const _0x8b38ae = _0x5f5280.basename(_0xcff3e6);
      let _0x1feee0;
      try {
        if (process.platform === "win32") {
          _0x1feee0 = await _0x11577e(_0x56c5ba);
        } else {
          _0x1feee0 = await _0x2bb6b1(_0x56c5ba);
        }
        const _0x5cb4b8 = _0x183902(_0x1feee0, _0x8b38ae);
        if (!_0x5cb4b8) {
          throw new Error("Expected binary \"" + _0x8b38ae + "\" not found inside archive " + _0x1c2c23 + ". Archive layout may have changed.");
        }
        _0x100d5c.copyFileSync(_0x5cb4b8, _0xcff3e6);
      } finally {
        if (_0x1feee0) {
          _0x3c411a(_0x1feee0);
        }
      }
      if (process.platform !== "win32") {
        _0x100d5c.chmodSync(_0xcff3e6, 493);
      }
      const _0x3389c4 = _0x2c31b3();
      if (!_0x3389c4) {
        throw new Error(_0x4f915e + " was downloaded to " + _0xcff3e6 + " but could not be executed. Check the file is a valid binary for this platform.");
      }
      return _0xcff3e6;
    }
    async function _0x59845e(_0x480bbf) {
      const _0x585961 = _0x480bbf || {};
      const _0x4e85d0 = _0x585961.version || _0x47f482;
      const _0x4a6bd6 = _0x502e76();
      if (_0x100d5c.existsSync(_0x4a6bd6)) {
        const _0x11a4f4 = _0x2c31b3();
        if (_0x4941af(_0x11a4f4, _0x47f482)) {
          return _0x4a6bd6;
        }
      }
      return _0x1bb484(_0x4e85d0, {
        skipChecksum: _0x585961.skipChecksum === true,
        skipAttestation: _0x585961.skipAttestation === true,
        requireAttestation: _0x585961.requireAttestation,
        ghRunner: _0x585961.ghRunner,
        ghProbe: _0x585961.ghProbe
      });
    }
    function _0xad0b33(_0x21a3ed) {
      const _0x1ef637 = _0x502e76();
      if (_0x100d5c.existsSync(_0x1ef637)) {
        const _0x52210b = _0x2c31b3();
        if (_0x4941af(_0x52210b, _0x47f482)) {
          return _0x1ef637;
        }
      }
      const _0x237335 = _0x21a3ed && _0x21a3ed.version || _0x47f482;
      const _0x1db60d = !!_0x21a3ed && !!_0x21a3ed.skipChecksum;
      const _0x1e94ee = !!_0x21a3ed && !!_0x21a3ed.skipAttestation;
      const _0x28dc38 = _0x21a3ed && typeof _0x21a3ed.requireAttestation === "boolean" ? _0x21a3ed.requireAttestation : undefined;
      const _0x374af5 = __filename;
      const _0x53e983 = {
        version: _0x237335,
        skipChecksum: _0x1db60d,
        skipAttestation: _0x1e94ee
      };
      const _0x2b8583 = _0x53e983;
      if (_0x28dc38 !== undefined) {
        _0x2b8583.requireAttestation = _0x28dc38;
      }
      const _0x28a468 = ["var b = require(" + JSON.stringify(_0x374af5) + ");", "b.ensureBinary(" + JSON.stringify(_0x2b8583) + ")", "  .then(function(p) { process.stdout.write(p); })", "  .catch(function(e) { process.stderr.write(e.message); process.exit(1); });"];
      try {
        const _0x8e50c = _0x18147c.execFileSync(process.execPath, ["-e", _0x28a468.join("\n")], {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "inherit"],
          timeout: 120000
        });
        return _0x8e50c.trim() || _0x1ef637;
      } catch (_0xb4f916) {
        throw new Error("Failed to ensure binary (sync): " + _0xb4f916.message);
      }
    }
    function _0x31ca17(_0x1fb135, _0xa10f21) {
      const _0x2cd71d = _0xad0b33();
      const _0x1d44b5 = {
        encoding: "utf8",
        windowsHide: true,
        maxBuffer: _0x4589b5
      };
      const _0x1fa8db = Object.assign(_0x1d44b5, _0xa10f21);
      if (!_0x1fa8db.stdio) {
        _0x1fa8db.stdio = ["pipe", "pipe", "pipe"];
      }
      const _0x15adb7 = _0x18147c.execFileSync(_0x2cd71d, _0x1fb135, _0x1fa8db);
      if (typeof _0x15adb7 === "string") {
        return _0x15adb7;
      } else {
        return _0x15adb7.toString("utf8");
      }
    }
    async function _0x400f1a(_0x4bef40, _0x1d537b) {
      const _0x5ca246 = await _0x59845e();
      const _0x1ae3d7 = {
        encoding: "utf8",
        windowsHide: true,
        maxBuffer: _0x4589b5
      };
      const _0x2f9c69 = Object.assign(_0x1ae3d7, _0x1d537b);
      const _0x2372bf = await _0x1cce33(_0x5ca246, _0x4bef40, _0x2f9c69);
      return _0x2372bf.stdout;
    }
    const _0x34a1be = {
      ensureBinary: _0x59845e,
      ensureBinarySync: _0xad0b33,
      runAnalyzer: _0x31ca17,
      runAnalyzerAsync: _0x400f1a,
      getBinaryPath: _0x502e76,
      getVersion: _0x2c31b3,
      getPlatformKey: _0x5553e4,
      isAvailable: _0x52224b,
      isAvailableAsync: _0x42b9c1,
      meetsMinimumVersion: _0x4941af,
      buildDownloadUrl: _0x3493ae,
      PLATFORM_MAP: _0x5cc875,
      parseSha256Sidecar: _0x478c36,
      verifySha256: _0x1b0b18,
      sha256Hex: _0x4f06c9,
      assertSafeArchiveEntry: _0x59d897,
      assertInsideRoot: _0x4243fc,
      downloadBinary: _0x1bb484,
      verifySlsaAttestation: _0x211272,
      isGhAvailable: _0x50fb44,
      extractTarGzToScratch: _0x2bb6b1,
      extractZipToScratch: _0x11577e,
      _EXTRACT_ZIP_PS1: _0x435aae
    };
    _0x1101d5.exports = _0x34a1be;
  }
});
var require_installer = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/installer.js"(_0x1e0368, _0x630873) {
    'use strict';

    var _0xd339ff = require_binary();
    async function _0xf836da() {
      if (_0xd339ff.isAvailable()) {
        return {
          found: true,
          version: _0xd339ff.getVersion(),
          tool: "agent-analyzer"
        };
      }
      try {
        await _0xd339ff.ensureBinary();
        return {
          found: true,
          version: _0xd339ff.getVersion(),
          tool: "agent-analyzer"
        };
      } catch (_0x5603f5) {
        const _0x1aa673 = {
          found: false,
          error: _0x5603f5.message,
          tool: "agent-analyzer"
        };
        return _0x1aa673;
      }
    }
    function _0x19e89e() {
      if (_0xd339ff.isAvailable()) {
        return {
          found: true,
          version: _0xd339ff.getVersion(),
          tool: "agent-analyzer"
        };
      }
      try {
        _0xd339ff.ensureBinarySync();
        return {
          found: true,
          version: _0xd339ff.getVersion(),
          tool: "agent-analyzer"
        };
      } catch (_0x57994a) {
        const _0x5b026d = {
          found: false,
          error: _0x57994a.message,
          tool: "agent-analyzer"
        };
        return _0x5b026d;
      }
    }
    function _0x309a3f() {
      return true;
    }
    function _0x3f17a7() {
      return "agent-analyzer is downloaded automatically on first use from https://github.com/agent-sh/agent-analyzer/releases";
    }
    function _0xc00998() {
      return "0.3.0";
    }
    const _0x4653d6 = {
      checkInstalled: _0xf836da,
      checkInstalledSync: _0x19e89e,
      meetsMinimumVersion: _0x309a3f,
      getInstallInstructions: _0x3f17a7,
      getMinimumVersion: _0xc00998,
      getCommand: () => null
    };
    _0x630873.exports = _0x4653d6;
  }
});
var require_state_dir = __commonJS({
  "../work/agent-sh__agentsys/lib/platform/state-dir.js"(_0x56515a, _0x391a34) {
    var _0x1ad021 = require("fs");
    var _0x254a21 = require("path");
    var _0x5612f0 = new Map();
    function _0x4371e6(_0x38462e) {
      try {
        return _0x1ad021.statSync(_0x38462e).isDirectory();
      } catch {
        return false;
      }
    }
    function _0x4b779a(_0x3892b4 = process.cwd()) {
      if (process.env.AI_STATE_DIR) {
        return process.env.AI_STATE_DIR;
      }
      const _0x4c2954 = _0x254a21.resolve(_0x3892b4);
      const _0x115939 = _0x5612f0.get(_0x4c2954);
      if (_0x115939) {
        return _0x115939;
      }
      if (process.env.OPENCODE_CONFIG || process.env.OPENCODE_CONFIG_DIR) {
        _0x5612f0.set(_0x4c2954, ".opencode");
        return ".opencode";
      }
      try {
        const _0x2c1103 = _0x254a21.join(_0x3892b4, ".opencode");
        if (_0x4371e6(_0x2c1103)) {
          _0x5612f0.set(_0x4c2954, ".opencode");
          return ".opencode";
        }
      } catch {}
      if (process.env.CODEX_HOME) {
        _0x5612f0.set(_0x4c2954, ".codex");
        return ".codex";
      }
      try {
        const _0x44b07b = _0x254a21.join(_0x3892b4, ".codex");
        if (_0x4371e6(_0x44b07b)) {
          _0x5612f0.set(_0x4c2954, ".codex");
          return ".codex";
        }
      } catch {}
      _0x5612f0.set(_0x4c2954, ".claude");
      return ".claude";
    }
    function _0x4bb3db(_0x1fa5e7 = process.cwd()) {
      return _0x254a21.join(_0x1fa5e7, _0x4b779a(_0x1fa5e7));
    }
    function _0x3a932d(_0x4d3ed3 = process.cwd()) {
      const _0x1e5508 = _0x4b779a(_0x4d3ed3);
      if (process.env.AI_STATE_DIR) {
        return "custom";
      }
      switch (_0x1e5508) {
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
    function _0xae97f8() {
      _0x5612f0.clear();
    }
    const _0x5c41a6 = {
      getStateDir: _0x4b779a,
      getStateDirPath: _0x4bb3db,
      getPlatformName: _0x3a932d,
      clearCache: _0xae97f8
    };
    _0x391a34.exports = _0x5c41a6;
  }
});
var require_atomic_write = __commonJS({
  "../work/agent-sh__agentsys/lib/utils/atomic-write.js"(_0x56a29a, _0x17c1e1) {
    var _0x284e52 = require("fs");
    var _0x5e5f5c = require("path");
    var _0xf2b6c0 = require("crypto");
    function _0x1a7703(_0x2a0850) {
      const _0x1c050d = _0x5e5f5c.dirname(_0x2a0850);
      const _0x4669aa = _0x5e5f5c.basename(_0x2a0850);
      const _0x51fce2 = _0xf2b6c0.randomBytes(6).toString("hex");
      return _0x5e5f5c.join(_0x1c050d, "." + _0x4669aa + "." + _0x51fce2 + ".tmp");
    }
    function _0x148c21(_0x32967a, _0xe535c1, _0x33dfa0 = {}) {
      const {
        encoding = "utf8",
        mode = 420
      } = _0x33dfa0;
      const _0x1398a = _0x5e5f5c.dirname(_0x32967a);
      if (!_0x284e52.existsSync(_0x1398a)) {
        _0x284e52.mkdirSync(_0x1398a, {
          recursive: true
        });
      }
      const _0x251665 = _0x1a7703(_0x32967a);
      try {
        const _0x39fbad = {
          encoding: encoding,
          mode: mode
        };
        _0x284e52.writeFileSync(_0x251665, _0xe535c1, _0x39fbad);
        _0x284e52.renameSync(_0x251665, _0x32967a);
        return true;
      } catch (_0x1b6295) {
        try {
          if (_0x284e52.existsSync(_0x251665)) {
            _0x284e52.unlinkSync(_0x251665);
          }
        } catch {}
        throw _0x1b6295;
      }
    }
    function _0x7f6b56(_0x4abed3, _0x5ba2b8, _0x560367 = {}) {
      const {
        indent = 2,
        ..._0x8bf703
      } = _0x560367;
      const _0x364316 = JSON.stringify(_0x5ba2b8, null, indent);
      return _0x148c21(_0x4abed3, _0x364316, _0x8bf703);
    }
    const _0x156de6 = {
      writeFileAtomic: _0x148c21,
      writeJsonAtomic: _0x7f6b56,
      getTempPath: _0x1a7703
    };
    _0x17c1e1.exports = _0x156de6;
  }
});
var require_cache = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/cache.js"(_0x43c39a, _0x118574) {
    'use strict';

    var _0x36c794 = require("fs");
    var _0x2528b4 = require("path");
    var {
      getStateDirPath: _0x341636
    } = require_state_dir();
    var {
      writeJsonAtomic: _0x3ad5fc,
      writeFileAtomic: _0x3b6bf3
    } = require_atomic_write();
    var _0x120bdf = "repo-map.json";
    var _0x26f43a = "repo-map.stale";
    var _0x602cb1 = "repo-intel.json";
    function _0x20d0da(_0x3d1372) {
      return _0x2528b4.join(_0x341636(_0x3d1372), _0x120bdf);
    }
    function _0x2c7c1f(_0x578483) {
      return _0x2528b4.join(_0x341636(_0x578483), _0x602cb1);
    }
    function _0x4ebf12(_0x29b4a0) {
      return _0x2528b4.join(_0x341636(_0x29b4a0), _0x26f43a);
    }
    function _0xf6692f(_0x23544a) {
      const _0x31ecac = _0x341636(_0x23544a);
      if (!_0x36c794.existsSync(_0x31ecac)) {
        _0x36c794.mkdirSync(_0x31ecac, {
          recursive: true
        });
      }
      return _0x31ecac;
    }
    function _0x6c6b3b(_0xaf63ff) {
      const _0x5446e5 = _0x20d0da(_0xaf63ff);
      if (!_0x36c794.existsSync(_0x5446e5)) {
        return null;
      }
      try {
        const _0xf0adca = _0x36c794.readFileSync(_0x5446e5, "utf8");
        return JSON.parse(_0xf0adca);
      } catch {
        return null;
      }
    }
    function _0x5940b4(_0x4ee1cc, _0x3ffb9c) {
      _0xf6692f(_0x4ee1cc);
      const _0x45728c = _0x20d0da(_0x4ee1cc);
      const _0x43706a = {
        ..._0x3ffb9c,
        updated: new Date().toISOString()
      };
      _0x3ad5fc(_0x45728c, _0x43706a);
      _0x23c600(_0x4ee1cc);
    }
    function _0x26859a(_0x29c58a) {
      return _0x36c794.existsSync(_0x20d0da(_0x29c58a));
    }
    function _0x2bcede(_0x478816) {
      _0xf6692f(_0x478816);
      _0x3b6bf3(_0x4ebf12(_0x478816), new Date().toISOString());
    }
    function _0x23c600(_0xafcea4) {
      const _0x37db4c = _0x4ebf12(_0xafcea4);
      if (_0x36c794.existsSync(_0x37db4c)) {
        _0x36c794.unlinkSync(_0x37db4c);
      }
    }
    function _0xe10ab8(_0x246579) {
      return _0x36c794.existsSync(_0x4ebf12(_0x246579));
    }
    function _0x18b5ef(_0x115973) {
      const _0x5d5285 = _0x6c6b3b(_0x115973);
      if (!_0x5d5285) {
        return null;
      }
      return {
        generated: _0x5d5285.generated,
        updated: _0x5d5285.updated,
        commit: _0x5d5285.git?.commit,
        branch: _0x5d5285.git?.branch,
        files: Object.keys(_0x5d5285.files || {}).length,
        symbols: _0x5d5285.stats?.totalSymbols || 0,
        languages: _0x5d5285.project?.languages || []
      };
    }
    const _0x37d291 = {
      load: _0x6c6b3b,
      save: _0x5940b4,
      exists: _0x26859a,
      getStatus: _0x18b5ef,
      getMapPath: _0x20d0da,
      getPath: _0x2c7c1f,
      getStateDirPath: _0x341636,
      markStale: _0x2bcede,
      clearStale: _0x23c600,
      isMarkedStale: _0xe10ab8
    };
    _0x118574.exports = _0x37d291;
  }
});
var require_updater = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/updater.js"(_0x272ccc, _0x2b0ad3) {
    'use strict';

    var {
      execFileSync: _0xc10ea3
    } = require("child_process");
    var _0x30bad3 = require_cache();
    function _0x20a651(_0x3d49de, _0x3c47d4) {
      const _0xdbad70 = {
        isStale: false,
        reason: null,
        commitsBehind: 0,
        suggestFullRebuild: false
      };
      if (!_0x3c47d4?.git?.commit) {
        _0xdbad70.isStale = true;
        _0xdbad70.reason = "Missing base commit in repo-map";
        _0xdbad70.suggestFullRebuild = true;
        return _0xdbad70;
      }
      if (_0x30bad3.isMarkedStale(_0x3d49de)) {
        _0xdbad70.isStale = true;
        _0xdbad70.reason = "Marked stale by hook";
      }
      if (!_0x1dd713(_0x3d49de, _0x3c47d4.git.commit)) {
        _0xdbad70.isStale = true;
        _0xdbad70.reason = "Base commit no longer exists (rebased?)";
        _0xdbad70.suggestFullRebuild = true;
        return _0xdbad70;
      }
      const _0x1e266f = _0x43db77(_0x3d49de);
      if (_0x1e266f && _0x3c47d4.git.branch && _0x1e266f !== _0x3c47d4.git.branch) {
        _0xdbad70.isStale = true;
        _0xdbad70.reason = "Branch changed from " + _0x3c47d4.git.branch + " to " + _0x1e266f;
        _0xdbad70.suggestFullRebuild = true;
      }
      const _0x44da7b = _0x1f9d26(_0x3d49de, _0x3c47d4.git.commit);
      if (_0x44da7b > 0) {
        _0xdbad70.isStale = true;
        _0xdbad70.commitsBehind = _0x44da7b;
        if (!_0xdbad70.reason) {
          _0xdbad70.reason = _0x44da7b + " commits behind HEAD";
        }
      }
      return _0xdbad70;
    }
    function _0x29a32c(_0x22e830) {
      return typeof _0x22e830 === "string" && /^[0-9a-fA-F]{4,40}$/.test(_0x22e830);
    }
    function _0x1dd713(_0x342034, _0x49be36) {
      if (!_0x29a32c(_0x49be36)) {
        return false;
      }
      try {
        _0xc10ea3("git", ["cat-file", "-e", _0x49be36], {
          cwd: _0x342034,
          stdio: ["pipe", "pipe", "pipe"]
        });
        return true;
      } catch {
        return false;
      }
    }
    function _0x43db77(_0x396931) {
      try {
        return _0xc10ea3("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
          cwd: _0x396931,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"]
        }).trim();
      } catch {
        return null;
      }
    }
    function _0x1f9d26(_0x1d8a7b, _0x402083) {
      if (!_0x29a32c(_0x402083)) {
        return 0;
      }
      try {
        const _0x39287a = _0xc10ea3("git", ["rev-list", _0x402083 + "..HEAD", "--count"], {
          cwd: _0x1d8a7b,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"]
        }).trim();
        return Number(_0x39287a) || 0;
      } catch {
        return 0;
      }
    }
    const _0x24530c = {
      checkStaleness: _0x20a651
    };
    _0x2b0ad3.exports = _0x24530c;
  }
});
var require_converter = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/converter.js"(_0x4008d3, _0x55a93c) {
    'use strict';

    var _0x489875 = require("path");
    var _0x4c0479 = {
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
    var _0x3c4bde = new Set(["class", "struct", "interface", "enum", "impl"]);
    var _0x1454e9 = new Set(["trait", "type-alias"]);
    var _0x3b34bf = new Set(["method", "arrow", "closure"]);
    var _0x7fceaa = new Set(["constant", "variable", "const", "field", "property"]);
    function _0x44f276(_0x49e421) {
      return _0x4c0479[_0x489875.extname(_0x49e421).toLowerCase()] || "unknown";
    }
    function _0x61c8f7(_0x2b4dd0) {
      const _0x514299 = new Set();
      for (const _0x454c53 of _0x2b4dd0) {
        const _0x165530 = _0x44f276(_0x454c53);
        if (_0x165530 !== "unknown") {
          _0x514299.add(_0x165530);
        }
      }
      return Array.from(_0x514299);
    }
    function _0x279b94(_0x1641ab, _0x5597d4) {
      const _0x24f111 = new Set((_0x5597d4.exports || []).map(_0x1e947e => _0x1e947e.name));
      const _0x43a04f = (_0x5597d4.exports || []).map(_0x3a607d => ({
        name: _0x3a607d.name,
        kind: _0x3a607d.kind,
        line: _0x3a607d.line
      }));
      const _0x3ae55e = [];
      const _0x51de50 = [];
      const _0x112dc1 = [];
      const _0x1374d6 = [];
      for (const _0xcf94a7 of _0x5597d4.definitions || []) {
        const _0x4bd787 = {
          name: _0xcf94a7.name,
          kind: _0xcf94a7.kind,
          line: _0xcf94a7.line,
          exported: _0x24f111.has(_0xcf94a7.name)
        };
        if (_0xcf94a7.kind === "function" || _0x3b34bf.has(_0xcf94a7.kind)) {
          _0x3ae55e.push(_0x4bd787);
        } else if (_0x3c4bde.has(_0xcf94a7.kind)) {
          _0x51de50.push(_0x4bd787);
        } else if (_0x1454e9.has(_0xcf94a7.kind)) {
          _0x112dc1.push(_0x4bd787);
        } else if (_0x7fceaa.has(_0xcf94a7.kind)) {
          _0x1374d6.push(_0x4bd787);
        } else {
          _0x1374d6.push(_0x4bd787);
        }
      }
      const _0x4d3b5e = (_0x5597d4.imports || []).map(_0x530aed => ({
        source: _0x530aed.from,
        kind: "import",
        names: _0x530aed.names || []
      }));
      const _0x1904c0 = {
        exports: _0x43a04f,
        functions: _0x3ae55e,
        classes: _0x51de50,
        types: _0x112dc1,
        constants: _0x1374d6
      };
      return {
        language: _0x44f276(_0x1641ab),
        symbols: _0x1904c0,
        imports: _0x4d3b5e
      };
    }
    function _0x4a9d10(_0x390e1a) {
      const _0x310df0 = {};
      let _0x2895ca = 0;
      let _0x42df64 = 0;
      for (const [_0x40cf61, _0x517c76] of Object.entries(_0x390e1a.symbols || {})) {
        _0x310df0[_0x40cf61] = _0x279b94(_0x40cf61, _0x517c76);
        const _0x385619 = _0x310df0[_0x40cf61].symbols;
        _0x2895ca += _0x385619.functions.length + _0x385619.classes.length + _0x385619.types.length + _0x385619.constants.length;
        _0x42df64 += _0x310df0[_0x40cf61].imports.length;
      }
      return {
        version: "2.0",
        generated: _0x390e1a.generated || new Date().toISOString(),
        git: _0x390e1a.git ? {
          commit: _0x390e1a.git.analyzedUpTo
        } : undefined,
        project: {
          languages: _0x61c8f7(Object.keys(_0x310df0))
        },
        stats: {
          totalFiles: Object.keys(_0x310df0).length,
          totalSymbols: _0x2895ca,
          totalImports: _0x42df64,
          errors: []
        },
        files: _0x310df0
      };
    }
    const _0x489c3d = {
      convertIntelToRepoMap: _0x4a9d10,
      convertFile: _0x279b94,
      detectLanguage: _0x44f276
    };
    _0x55a93c.exports = _0x489c3d;
  }
});
var require_queries = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/queries.js"(_0x3df25e, _0x3b09f5) {
    'use strict';

    var _0x371cc0 = require("fs");
    var _0x37d740 = require("path");
    var {
      getStateDir: _0x1d8d19
    } = require_state_dir();
    var _0x30e922 = require_binary();
    var _0x2cb684 = class extends Error {
      constructor(_0x1755cb) {
        super("repo-intel map not found at " + _0x1755cb + ". Run `agentsys repo-intel update` to generate it first.");
        this.name = "RepoIntelMissingError";
        this.code = "REPO_INTEL_MISSING";
        this.mapFile = _0x1755cb;
      }
    };
    var _0x4f2dee = "repo-intel.json";
    function _0x1c1728(_0x16f8bc) {
      const _0x23b72b = _0x1d8d19(_0x16f8bc);
      return _0x37d740.join(_0x16f8bc, _0x23b72b, _0x4f2dee);
    }
    function _0x1ee41d(_0x3b071a) {
      const _0x2ca985 = _0x1c1728(_0x3b071a);
      if (!_0x371cc0.existsSync(_0x2ca985)) {
        throw new _0x2cb684(_0x2ca985);
      }
      return _0x2ca985;
    }
    function _0x3c970b(_0x134182, _0x2a7a44, _0xd8496) {
      const _0x3fee71 = _0x1ee41d(_0xd8496);
      const _0x4a85ad = ["repo-intel", "query", _0x134182, ..._0x2a7a44, "--map-file", _0x3fee71, _0xd8496];
      let _0x568c2e;
      try {
        _0x568c2e = _0x30e922.runAnalyzer(_0x4a85ad);
      } catch (_0x54a5f1) {
        throw new Error("repo-intel query failed [" + _0x134182 + "]: " + _0x54a5f1.message, {
          cause: _0x54a5f1
        });
      }
      let _0x2d9d5a;
      try {
        _0x2d9d5a = JSON.parse(_0x568c2e);
      } catch (_0x2d0fc2) {
        const _0x3468fa = _0x568c2e.slice(0, 200);
        throw new Error("repo-intel query [" + _0x134182 + "] returned non-JSON output: " + _0x3468fa);
      }
      return _0x2d9d5a;
    }
    function _0x32ff6d(_0x1ec43f, _0x1e1306) {
      if (typeof _0x1ec43f !== "string" || _0x1ec43f.length === 0) {
        throw new TypeError(_0x1e1306 + " must be a non-empty string");
      }
    }
    function _0x15af2f(_0x49f8c8, _0x56cf4f = {}) {
      const _0x307124 = [];
      if (_0x56cf4f.limit != null) {
        _0x307124.push("--top", String(_0x56cf4f.limit));
      }
      return _0x3c970b("hotspots", _0x307124, _0x49f8c8);
    }
    function _0x5505fc(_0x5afd9c, _0x3f9a22, _0x4cb0b4 = {}) {
      _0x32ff6d(_0x3f9a22, "coupling: file");
      const _0x38a6c0 = [_0x3f9a22];
      if (_0x4cb0b4.limit != null) {
        _0x38a6c0.push("--top", String(_0x4cb0b4.limit));
      }
      return _0x3c970b("coupling", _0x38a6c0, _0x5afd9c);
    }
    function _0x2670f4(_0x9aa918, _0x44b34a = {}) {
      const _0x4f9d91 = [];
      if (_0x44b34a.adjustForAi) {
        _0x4f9d91.push("--adjust-for-ai");
      }
      if (_0x44b34a.limit != null) {
        _0x4f9d91.push("--top", String(_0x44b34a.limit));
      }
      return _0x3c970b("bus-factor", _0x4f9d91, _0x9aa918);
    }
    function _0xfea657(_0x146145, _0x3d5cb8 = {}) {
      const _0x4bd268 = [];
      if (_0x3d5cb8.limit != null) {
        _0x4bd268.push("--top", String(_0x3d5cb8.limit));
      }
      if (_0x3d5cb8.minChanges != null) {
        _0x4bd268.push("--min-changes", String(_0x3d5cb8.minChanges));
      }
      return _0x3c970b("test-gaps", _0x4bd268, _0x146145);
    }
    function _0x21f4f1(_0x2990c7, _0x537920) {
      if (!Array.isArray(_0x537920)) {
        throw new TypeError("diffRisk: files must be an array of strings");
      }
      if (!_0x537920.every(_0x346fb6 => typeof _0x346fb6 === "string")) {
        throw new TypeError("diffRisk: all entries in files must be strings");
      }
      const _0x5529ab = _0x537920.join(",");
      if (_0x5529ab.length > 30000) {
        throw new RangeError("diffRisk: files argument exceeds 30000 character limit (got " + _0x5529ab.length + ")");
      }
      const _0x95b821 = ["--files", _0x5529ab];
      return _0x3c970b("diff-risk", _0x95b821, _0x2990c7);
    }
    function _0x3ad9d0(_0x204caa, _0x27f600, _0x41dca0) {
      _0x32ff6d(_0x27f600, "dependents: symbol");
      const _0x255f29 = [_0x27f600];
      if (_0x41dca0 != null) {
        _0x32ff6d(_0x41dca0, "dependents: file");
        _0x255f29.push("--file", _0x41dca0);
      }
      return _0x3c970b("dependents", _0x255f29, _0x204caa);
    }
    function _0x188c24(_0x90a28d, _0x3e34ae = {}) {
      const _0xf4bf5f = [];
      if (_0x3e34ae.limit != null) {
        _0xf4bf5f.push("--top", String(_0x3e34ae.limit));
      }
      return _0x3c970b("bugspots", _0xf4bf5f, _0x90a28d);
    }
    function _0x5572ed(_0x4c02ab) {
      return _0x3c970b("health", [], _0x4c02ab);
    }
    function _0x1b04cc(_0x5da803) {
      return _0x3c970b("communities", [], _0x5da803);
    }
    function _0x81db3b(_0x11b8d8, _0x4f3a5c = {}) {
      const _0xeb090a = [];
      if (_0x4f3a5c.limit != null) {
        _0xeb090a.push("--top", String(_0x4f3a5c.limit));
      }
      return _0x3c970b("boundaries", _0xeb090a, _0x11b8d8);
    }
    function _0x3c5045(_0x5b48b6, _0x2333c1) {
      _0x32ff6d(_0x2333c1, "areaOf: file");
      return _0x3c970b("area-of", [_0x2333c1], _0x5b48b6);
    }
    function _0x2abdd5(_0x5c870c, _0x3cbaec) {
      if (typeof _0x3cbaec !== "number" || !Number.isInteger(_0x3cbaec) || _0x3cbaec < 0) {
        throw new TypeError("communityHealth: id must be a non-negative integer");
      }
      return _0x3c970b("community-health", [String(_0x3cbaec)], _0x5c870c);
    }
    function _0x58a70e(_0x2e32bb, _0x113731 = {}) {
      const _0x3c7ba3 = [];
      if (_0x113731.limit != null) {
        _0x3c7ba3.push("--top", String(_0x113731.limit));
      }
      return _0x3c970b("coldspots", _0x3c7ba3, _0x2e32bb);
    }
    function _0x35a42f(_0x51cefa, _0x214899) {
      _0x32ff6d(_0x214899, "ownership: file");
      return _0x3c970b("ownership", [_0x214899], _0x51cefa);
    }
    function _0x495e5f(_0x48cf9c) {
      return _0x3c970b("norms", [], _0x48cf9c);
    }
    function _0x46602d(_0x37e636) {
      return _0x3c970b("areas", [], _0x37e636);
    }
    function _0x25f2ac(_0x16a81e, _0x2c7339 = {}) {
      const _0x1b5ff2 = [];
      if (_0x2c7339.limit != null) {
        _0x1b5ff2.push("--top", String(_0x2c7339.limit));
      }
      return _0x3c970b("contributors", _0x1b5ff2, _0x16a81e);
    }
    function _0x4b02a6(_0x4eed52) {
      return _0x3c970b("release-info", [], _0x4eed52);
    }
    function _0x153f06(_0x16d225, _0x2965a4) {
      _0x32ff6d(_0x2965a4, "fileHistory: file");
      return _0x3c970b("file-history", [_0x2965a4], _0x16d225);
    }
    function _0x11a9f2(_0x34ad55) {
      return _0x3c970b("conventions", [], _0x34ad55);
    }
    function _0x3560f9(_0x178046, _0x350109 = {}) {
      const _0x15f072 = [];
      if (_0x350109.limit != null) {
        _0x15f072.push("--top", String(_0x350109.limit));
      }
      return _0x3c970b("doc-drift", _0x15f072, _0x178046);
    }
    function _0xcde0ee(_0x2b983b) {
      return _0x3c970b("onboard", [], _0x2b983b);
    }
    function _0x51feb0(_0x30bd8b) {
      return _0x3c970b("can-i-help", [], _0x30bd8b);
    }
    function _0x5da6d7(_0x30ebcc, _0x125872 = {}) {
      const _0x4bca24 = [];
      if (_0x125872.limit != null) {
        _0x4bca24.push("--top", String(_0x125872.limit));
      }
      return _0x3c970b("painspots", _0x4bca24, _0x30ebcc);
    }
    function _0xe4a763(_0x1910af, _0x3881fe = {}) {
      const _0x1b3613 = [];
      if (_0x3881fe.files) {
        const _0x4c419f = Array.isArray(_0x3881fe.files) ? _0x3881fe.files.join(",") : String(_0x3881fe.files);
        _0x1b3613.push("--files", _0x4c419f);
      }
      return _0x3c970b("entry-points", _0x1b3613, _0x1910af);
    }
    function _0x1b3359(_0x40e09c) {
      return _0x3c970b("project-info", [], _0x40e09c);
    }
    function _0x37e996(_0x4fc950, _0x3b8a90) {
      _0x32ff6d(_0x3b8a90, "symbols: file");
      return _0x3c970b("symbols", [_0x3b8a90], _0x4fc950);
    }
    function _0x38afb4(_0x9b0ee0, _0x22a6d0 = {}) {
      const _0x30f0da = [];
      if (_0x22a6d0.limit != null) {
        _0x30f0da.push("--top", String(_0x22a6d0.limit));
      }
      return _0x3c970b("stale-docs", _0x30f0da, _0x9b0ee0);
    }
    function _0x121ba0(_0x457468, _0x4a66c7, _0xe7137d = {}) {
      _0x32ff6d(_0x4a66c7, "find: query");
      const _0x37a3f0 = [_0x4a66c7];
      if (_0xe7137d.limit != null) {
        _0x37a3f0.push("--top", String(_0xe7137d.limit));
      }
      return _0x3c970b("find", _0x37a3f0, _0x457468);
    }
    function _0x57c3ca(_0xf31168) {
      return _0x3c970b("slop-fixes", [], _0xf31168);
    }
    function _0x2ab75d(_0xacedb8, _0x39e7ed = {}) {
      const _0x5ec5d6 = [];
      if (_0x39e7ed.top != null) {
        _0x5ec5d6.push("--top", String(_0x39e7ed.top));
      }
      return _0x3c970b("slop-targets", _0x5ec5d6, _0xacedb8);
    }
    function _0x95511b(_0x3dcc18, _0x1c0304 = {}) {
      const _0x1dcd08 = _0x1ee41d(_0x3dcc18);
      const _0x307fc0 = [];
      if (_0x1c0304.depth != null) {
        _0x307fc0.push("--depth", String(_0x1c0304.depth));
      }
      const _0x34404a = ["repo-intel", "query", "summary", ..._0x307fc0, "--map-file", _0x1dcd08, _0x3dcc18];
      let _0x3bff8a;
      try {
        _0x3bff8a = _0x30e922.runAnalyzer(_0x34404a).trim();
      } catch (_0x14eaf1) {
        throw new Error("repo-intel query failed [summary]: " + _0x14eaf1.message, {
          cause: _0x14eaf1
        });
      }
      if (_0x3bff8a === "null") {
        return null;
      }
      if (_0x1c0304.depth != null) {
        return _0x3bff8a;
      }
      try {
        return JSON.parse(_0x3bff8a);
      } catch (_0x74d780) {
        throw new Error("repo-intel query [summary] returned non-JSON output: " + _0x3bff8a.slice(0, 200));
      }
    }
    const _0x2c4bf7 = {
      RepoIntelMissingError: _0x2cb684,
      hotspots: _0x15af2f,
      coupling: _0x5505fc,
      busFactor: _0x2670f4,
      testGaps: _0xfea657,
      diffRisk: _0x21f4f1,
      dependents: _0x3ad9d0,
      bugspots: _0x188c24,
      health: _0x5572ed,
      communities: _0x1b04cc,
      boundaries: _0x81db3b,
      areaOf: _0x3c5045,
      communityHealth: _0x2abdd5,
      coldspots: _0x58a70e,
      ownership: _0x35a42f,
      norms: _0x495e5f,
      areas: _0x46602d,
      contributors: _0x25f2ac,
      releaseInfo: _0x4b02a6,
      fileHistory: _0x153f06,
      conventions: _0x11a9f2,
      docDrift: _0x3560f9,
      onboard: _0xcde0ee,
      canIHelp: _0x51feb0,
      painspots: _0x5da6d7,
      entryPoints: _0xe4a763,
      projectInfo: _0x1b3359,
      symbols: _0x37e996,
      staleDocs: _0x38afb4,
      find: _0x121ba0,
      slopFixes: _0x57c3ca,
      slopTargets: _0x2ab75d,
      summary: _0x95511b
    };
    _0x3b09f5.exports = _0x2c4bf7;
  }
});
var require_preference = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/preference.js"(_0x56d923, _0x4cd966) {
    'use strict';

    var _0x1f5d31 = require("fs");
    var _0x306329 = require("path");
    var _0x2c66f6 = require_cache();
    var _0x4cf0ac = ["none", "small", "big"];
    var _0x3fab78 = ["compact", "balanced", "maximum"];
    function _0x47fa3c(_0x2678dd) {
      return _0x306329.join(_0x2c66f6.getStateDirPath(_0x2678dd), "sources", "preference.json");
    }
    function _0x457df8(_0x38c795) {
      const _0x1a58a6 = _0x47fa3c(_0x38c795);
      if (!_0x1f5d31.existsSync(_0x1a58a6)) {
        return {};
      }
      try {
        const _0x436c7d = JSON.parse(_0x1f5d31.readFileSync(_0x1a58a6, "utf8"));
        if (_0x436c7d && typeof _0x436c7d === "object") {
          return _0x436c7d;
        } else {
          return {};
        }
      } catch (_0x53eecf) {
        return {};
      }
    }
    function _0x19b774(_0x557100, _0x2d6b9b) {
      const _0x3a763a = _0x457df8(_0x557100);
      const _0x3f6dda = Object.assign({}, _0x3a763a, _0x2d6b9b || {});
      const _0x407eda = _0x47fa3c(_0x557100);
      _0x1f5d31.mkdirSync(_0x306329.dirname(_0x407eda), {
        recursive: true
      });
      _0x1f5d31.writeFileSync(_0x407eda, JSON.stringify(_0x3f6dda, null, 2));
      return _0x3f6dda;
    }
    function _0x3c8fd7(_0x3b67eb) {
      const _0x22214a = _0x457df8(_0x3b67eb);
      delete _0x22214a.embedder;
      delete _0x22214a.embedderDetail;
      const _0x167617 = _0x47fa3c(_0x3b67eb);
      _0x1f5d31.mkdirSync(_0x306329.dirname(_0x167617), {
        recursive: true
      });
      _0x1f5d31.writeFileSync(_0x167617, JSON.stringify(_0x22214a, null, 2));
    }
    function _0x25bf84(_0x581c49) {
      const _0x85dd73 = _0x457df8(_0x581c49);
      return _0x4cf0ac.includes(_0x85dd73.embedder);
    }
    function _0x1bc9a3(_0x485bd9) {
      const _0x27d706 = _0x457df8(_0x485bd9);
      return _0x3fab78.includes(_0x27d706.embedderDetail);
    }
    function _0x552f77(_0x467bcc) {
      switch (_0x467bcc) {
        case "compact":
          return "compact";
        case "maximum":
          return "maximum";
        case "balanced":
        default:
          return "balanced";
      }
    }
    const _0xb2dbe = {
      read: _0x457df8,
      update: _0x19b774,
      reset: _0x3c8fd7,
      hasEmbedderChoice: _0x25bf84,
      hasDetailChoice: _0x1bc9a3,
      detailToCliArg: _0x552f77,
      preferencePath: _0x47fa3c,
      VALID_EMBEDDER: _0x4cf0ac,
      VALID_DETAIL: _0x3fab78
    };
    _0x4cd966.exports = _0xb2dbe;
  }
});
var require_shared_helpers = __commonJS({
  "../work/agent-sh__agentsys/lib/binary/shared-helpers.js"(_0x257cbc, _0x43c51a) {
    'use strict';

    var _0x29a2ff = require("fs");
    var _0x41b1ee = require("path");
    var _0x3bb202 = require("os");
    var _0x47d473 = require("https");
    var _0x2ed7ec = require("child_process");
    var _0x507cda = 30000;
    var _0x491fc6 = 5;
    function _0x41bd37(_0x5d039a, _0x3a4349) {
      const _0x58a0f5 = _0x3a4349 || {};
      const _0x2955ba = _0x58a0f5.userAgent || "agent-sh/binary-resolver";
      const _0x3aabad = _0x58a0f5.timeoutMs || _0x507cda;
      return new Promise(function (_0x26b274, _0xfb5d57) {
        const _0x531559 = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        function _0x44c2dc(_0x30c638, _0x1b0b10) {
          if (_0x1b0b10 > _0x491fc6) {
            _0xfb5d57(new Error("Too many redirects fetching from " + _0x5d039a));
            return;
          }
          const _0x225e78 = {
            "User-Agent": _0x2955ba,
            Accept: "application/octet-stream"
          };
          const _0x11a112 = _0x225e78;
          if (_0x531559) {
            _0x11a112.Authorization = "Bearer " + _0x531559;
          }
          const _0x4e5af9 = {
            headers: _0x11a112,
            timeout: _0x3aabad
          };
          const _0x4476df = _0x47d473.get(_0x30c638, _0x4e5af9, function (_0x3daafd) {
            const _0x2c602b = _0x3daafd.statusCode;
            if (_0x2c602b === 301 || _0x2c602b === 302 || _0x2c602b === 307 || _0x2c602b === 308) {
              _0x3daafd.resume();
              var _0xd04b27 = _0x3daafd.headers.location;
              if (_0xd04b27 && !_0xd04b27.startsWith("https://")) {
                _0xfb5d57(new Error("Refusing non-HTTPS redirect to " + _0xd04b27));
                return;
              }
              _0x44c2dc(_0xd04b27, _0x1b0b10 + 1);
              return;
            }
            if (_0x2c602b !== 200) {
              _0x3daafd.resume();
              const _0x1e4b13 = _0x2c602b === 403 ? " (rate limited - set GITHUB_TOKEN env var)" : "";
              _0xfb5d57(new Error("HTTP " + _0x2c602b + _0x1e4b13 + " fetching " + _0x30c638));
              return;
            }
            const _0x3f9ee9 = [];
            _0x3daafd.on("data", function (_0x5b82b4) {
              _0x3f9ee9.push(_0x5b82b4);
            });
            _0x3daafd.on("end", function () {
              _0x26b274(Buffer.concat(_0x3f9ee9));
            });
            _0x3daafd.on("error", _0xfb5d57);
          });
          _0x4476df.on("error", _0xfb5d57);
          _0x4476df.on("timeout", function () {
            _0x4476df.destroy();
            _0xfb5d57(new Error("Timeout (" + _0x3aabad + "ms) fetching " + _0x30c638));
          });
        }
        _0x44c2dc(_0x5d039a, 0);
      });
    }
    function _0x3fb603(_0x4ca85c, _0x1e0e20) {
      return new Promise(function (_0x1871e5, _0x21053e) {
        const _0x4b8228 = process.platform === "win32" ? _0x1e0e20.replace(/\\/g, "/") : _0x1e0e20;
        const _0x371207 = _0x2ed7ec.spawn("tar", ["xz", "-C", _0x4b8228], {
          stdio: ["pipe", "pipe", "pipe"]
        });
        let _0x158c38 = "";
        _0x371207.stderr.on("data", function (_0x147d67) {
          _0x158c38 += _0x147d67;
        });
        _0x371207.stdin.write(_0x4ca85c);
        _0x371207.stdin.end();
        _0x371207.on("close", function (_0x2474f0) {
          if (_0x2474f0 !== 0) {
            _0x21053e(new Error("tar extraction failed (code " + _0x2474f0 + "): " + _0x158c38));
          } else {
            _0x1871e5();
          }
        });
        _0x371207.on("error", _0x21053e);
      });
    }
    function _0x52e878(_0x4fbd55, _0x5b720e, _0x2fe9ce) {
      return new Promise(function (_0x44fe1a, _0x1dac37) {
        var _0x473f50 = _0x29a2ff.mkdtempSync(_0x41b1ee.join(_0x3bb202.tmpdir(), _0x2fe9ce + "-"));
        var _0x3525e5 = _0x41b1ee.join(_0x473f50, "archive.zip");
        _0x29a2ff.writeFileSync(_0x3525e5, _0x4fbd55);
        var _0xde43a4 = _0x2ed7ec.spawn("powershell", ["-NoProfile", "-NonInteractive", "-Command", "Expand-Archive", "-Path", _0x3525e5, "-DestinationPath", _0x5b720e, "-Force"], {
          stdio: ["ignore", "pipe", "pipe"]
        });
        var _0x1725a1 = "";
        _0xde43a4.stderr.on("data", function (_0x2b7131) {
          _0x1725a1 += _0x2b7131;
        });
        _0xde43a4.on("close", function (_0x6af778) {
          try {
            _0x29a2ff.rmSync(_0x473f50, {
              recursive: true,
              force: true
            });
          } catch (_0x4076af) {}
          if (_0x6af778 !== 0) {
            _0x1dac37(new Error("zip extraction failed (code " + _0x6af778 + "): " + _0x1725a1));
          } else {
            _0x44fe1a();
          }
        });
        _0xde43a4.on("error", _0x1dac37);
      });
    }
    const _0x5b16a2 = {
      downloadToBuffer: _0x41bd37,
      extractTarGz: _0x3fb603,
      extractZip: _0x52e878,
      DEFAULT_DOWNLOAD_TIMEOUT_MS: _0x507cda
    };
    _0x43c51a.exports = _0x5b16a2;
  }
});
var require_binary2 = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/binary.js"(_0x382d52, _0x14c6d3) {
    'use strict';

    var _0x1460ad = require("fs");
    var _0x572550 = require("path");
    var _0x5461f0 = require("os");
    var _0x1ba4be = require("https");
    var _0x2711c3 = require("child_process");
    var _0x25bd55 = require_binary();
    var _0x2f12f4 = require_shared_helpers();
    var _0x5bd197 = "agent-analyzer-embed";
    var _0x3ba2bf = "agent-sh/agent-analyzer";
    var _0x385a29 = 3600000;
    var _0x380aca = _0x25bd55.PLATFORM_MAP;
    function _0x417587() {
      const _0x343c18 = process.platform === "win32" ? ".exe" : "";
      return _0x572550.join(_0x5461f0.homedir(), ".agent-sh", "bin", _0x5bd197 + _0x343c18);
    }
    function _0x2882f9() {
      if (process.platform === "win32") {
        return "onnxruntime.dll";
      }
      if (process.platform === "darwin") {
        return "libonnxruntime.dylib";
      }
      return "libonnxruntime.so";
    }
    function _0x51c938() {
      return _0x572550.join(_0x572550.dirname(_0x417587()), _0x2882f9());
    }
    function _0x2701b4() {
      const _0x364cac = _0x1d887b();
      return !!_0x364cac && !_0x364cac.includes("musl");
    }
    function _0x1d887b() {
      const _0x3683ce = process.platform + "-" + process.arch;
      return _0x380aca[_0x3683ce] || null;
    }
    function _0xbcdf5d() {
      const _0x3d7b24 = _0x417587();
      if (!_0x1460ad.existsSync(_0x3d7b24)) {
        return null;
      }
      try {
        const _0x52a1cc = _0x2711c3.execFileSync(_0x3d7b24, ["--version"], {
          timeout: 5000,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true
        });
        const _0x40f68e = _0x52a1cc.trim().match(/(\d+\.\d+\.\d+)/);
        if (_0x40f68e) {
          return _0x40f68e[1];
        } else {
          return _0x52a1cc.trim();
        }
      } catch (_0x2745a4) {
        return null;
      }
    }
    function _0x14a0c3() {
      return _0x1460ad.existsSync(_0x417587());
    }
    var _0x5e2cd7 = null;
    async function _0x3f3b90() {
      if (_0x5e2cd7 && Date.now() - _0x5e2cd7.fetchedAt < _0x385a29) {
        return _0x5e2cd7.version;
      }
      return new Promise(function (_0x6e1774, _0x7b038c) {
        const _0x4691cd = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        const _0x16cfde = {
          "User-Agent": "agent-sh/embed-resolver",
          Accept: "application/vnd.github+json"
        };
        if (_0x4691cd) {
          _0x16cfde.Authorization = "Bearer " + _0x4691cd;
        }
        const _0x48b1f8 = "https://api.github.com/repos/" + _0x3ba2bf + "/releases/latest";
        const _0x298432 = function (_0x26c377) {
          _0x7b038c(new Error(_0x26c377 + " fetching " + _0x48b1f8));
        };
        const _0x547b03 = {
          headers: _0x16cfde,
          timeout: 5000
        };
        const _0x35ae18 = _0x1ba4be.get(_0x48b1f8, _0x547b03, function (_0x40eaeb) {
          if (_0x40eaeb.statusCode !== 200) {
            _0x40eaeb.resume();
            _0x298432("HTTP " + _0x40eaeb.statusCode);
            return;
          }
          const _0x55b6ed = [];
          _0x40eaeb.on("data", function (_0x773c83) {
            _0x55b6ed.push(_0x773c83);
          });
          _0x40eaeb.on("end", function () {
            try {
              const _0xcc0db5 = JSON.parse(Buffer.concat(_0x55b6ed).toString("utf8"));
              const _0x33ae47 = _0xcc0db5 && _0xcc0db5.tag_name || "";
              const _0x2da495 = _0x33ae47.replace(/^v/, "");
              if (/^\d+\.\d+\.\d+/.test(_0x2da495)) {
                _0x5e2cd7 = {
                  version: _0x2da495,
                  fetchedAt: Date.now()
                };
                _0x6e1774(_0x2da495);
              } else {
                _0x298432("No valid release tag");
              }
            } catch (_0x4166c6) {
              _0x298432("Failed to parse release JSON: " + _0x4166c6.message);
            }
          });
          _0x40eaeb.on("error", function (_0x1b7c7e) {
            _0x298432(_0x1b7c7e.message);
          });
        });
        _0x35ae18.on("error", function (_0x46d725) {
          _0x298432(_0x46d725.message);
        });
        _0x35ae18.on("timeout", function () {
          _0x35ae18.destroy();
          _0x298432("Timeout");
        });
      });
    }
    function _0x2bb5c5(_0xd721ff, _0xdff2d0) {
      const _0x4688a0 = process.platform === "win32" ? ".zip" : ".tar.gz";
      return "https://github.com/" + _0x3ba2bf + "/releases/download/v" + _0xd721ff + "/" + _0x5bd197 + "-" + _0xdff2d0 + _0x4688a0;
    }
    function _0x581626(_0x5b899c) {
      return _0x2f12f4.downloadToBuffer(_0x5b899c, {
        userAgent: "agent-sh/embed-resolver"
      });
    }
    var _0x238c6f = _0x2f12f4.extractTarGz;
    var _0x205956 = _0x2f12f4.extractZip;
    async function _0x366db2(_0x1aa0ba) {
      const _0x326010 = _0x1d887b();
      if (!_0x326010) {
        throw new Error("Unsupported platform: " + process.platform + "-" + process.arch + ". Supported: " + Object.keys(_0x380aca).join(", "));
      }
      const _0x4af79b = _0x2bb5c5(_0x1aa0ba, _0x326010);
      process.stderr.write("Downloading " + _0x5bd197 + " v" + _0x1aa0ba + " for " + _0x326010 + "...\n");
      const _0x212803 = _0x417587();
      const _0x13968f = _0x572550.dirname(_0x212803);
      _0x1460ad.mkdirSync(_0x13968f, {
        recursive: true
      });
      let _0x24f9df;
      try {
        _0x24f9df = await _0x581626(_0x4af79b);
      } catch (_0x1604cf) {
        throw new Error("Failed to download " + _0x5bd197 + ":\n  URL: " + _0x4af79b + "\n  Error: " + _0x1604cf.message + "\n\nTo install manually:\n  1. Download: " + _0x4af79b + "\n  2. Extract the binary to: " + _0x13968f + "\n  3. Ensure it is named: " + _0x572550.basename(_0x212803));
      }
      if (process.platform === "win32") {
        await _0x205956(_0x24f9df, _0x13968f, _0x572550.basename(_0x212803));
      } else {
        await _0x238c6f(_0x24f9df, _0x13968f);
      }
      if (process.platform !== "win32") {
        _0x1460ad.chmodSync(_0x212803, 493);
      }
      return _0x212803;
    }
    async function _0x5b4288(_0x45bba3) {
      const _0x5c33f1 = _0x45bba3 || {};
      const _0x5943a4 = _0x417587();
      if (_0x1460ad.existsSync(_0x5943a4)) {
        if (_0x2701b4() && !_0x1460ad.existsSync(_0x51c938())) {
          const _0x2b934d = _0x5c33f1.version || (await _0x3f3b90());
          return _0x366db2(_0x2b934d);
        }
        return _0x5943a4;
      }
      const _0x39282c = _0x5c33f1.version || (await _0x3f3b90());
      return _0x366db2(_0x39282c);
    }
    const _0x4b5016 = {
      EMBED_BINARY_NAME: _0x5bd197,
      getBinaryPath: _0x417587,
      getBundledOrtName: _0x2882f9,
      getBundledOrtPath: _0x51c938,
      platformBundlesOrt: _0x2701b4,
      getVersion: _0xbcdf5d,
      getPlatformKey: _0x1d887b,
      getLatestReleaseVersion: _0x3f3b90,
      isAvailable: _0x14a0c3,
      ensureBinary: _0x5b4288,
      buildDownloadUrl: _0x2bb5c5
    };
    _0x14c6d3.exports = _0x4b5016;
  }
});
var require_orchestrator = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/orchestrator.js"(_0xb871fe, _0x341dab) {
    'use strict';

    var _0x4395a9 = require("fs");
    var _0x36a367 = require("path");
    var _0x2d99ff = require("child_process");
    var _0x203871 = require_preference();
    var _0x4ae921 = require_binary2();
    var _0x5183ac = require_binary();
    var _0x43b65e = require_cache();
    function _0x1d72e3(_0x45d9bb) {
      const _0x5f3377 = _0x203871.read(_0x45d9bb);
      return _0x5f3377.embedder === "small" || _0x5f3377.embedder === "big";
    }
    async function _0x2a2119(_0x388adb) {
      if (!_0x1d72e3(_0x388adb)) {
        return {
          ran: false,
          reason: "embedder preference is \"none\" or unset"
        };
      }
      const _0x3ed934 = _0x203871.read(_0x388adb);
      const _0x4ce0dc = _0x203871.detailToCliArg(_0x3ed934.embedderDetail || "balanced");
      const _0x1207f8 = _0x43b65e.getPath(_0x388adb);
      if (!_0x4395a9.existsSync(_0x1207f8)) {
        return {
          ran: false,
          reason: "no repo-intel map found; run `/repo-intel init` first"
        };
      }
      const _0x4f646a = Date.now();
      const _0x56ecb8 = await _0x4ae921.ensureBinary();
      const _0x2ad6d5 = await _0x5183ac.ensureBinary();
      const _0xe53c78 = await _0x12e7a(_0x56ecb8, ["scan", _0x388adb, "--variant", _0x3ed934.embedder, "--detail", _0x4ce0dc], _0x2ad6d5, _0x1207f8);
      return Object.assign({
        ran: true,
        durationMs: Date.now() - _0x4f646a
      }, _0xe53c78);
    }
    async function _0x16e18d(_0x2e92e1) {
      if (!_0x1d72e3(_0x2e92e1)) {
        return {
          ran: false,
          reason: "embedder preference is \"none\" or unset"
        };
      }
      const _0x472fd5 = _0x203871.read(_0x2e92e1);
      const _0x4de302 = _0x203871.detailToCliArg(_0x472fd5.embedderDetail || "balanced");
      const _0x151061 = _0x43b65e.getPath(_0x2e92e1);
      if (!_0x4395a9.existsSync(_0x151061)) {
        return {
          ran: false,
          reason: "no repo-intel map; run `/repo-intel init` then `enrich`"
        };
      }
      const _0x17ed0e = Date.now();
      const _0x322ed1 = await _0x4ae921.ensureBinary();
      const _0x5add1 = await _0x5183ac.ensureBinary();
      const _0x6324cc = await _0x12e7a(_0x322ed1, ["update", _0x2e92e1, "--map-file", _0x151061, "--variant", _0x472fd5.embedder, "--detail", _0x4de302], _0x5add1, _0x151061);
      return Object.assign({
        ran: true,
        durationMs: Date.now() - _0x17ed0e
      }, _0x6324cc);
    }
    function _0x156a79(_0x30d49e) {
      const _0xa57f78 = _0x203871.read(_0x30d49e);
      const _0x1bd294 = _0x43b65e.getPath(_0x30d49e);
      const _0x2538ca = _0x41de62(_0x1bd294);
      return {
        enabled: _0x1d72e3(_0x30d49e),
        embedder: _0xa57f78.embedder,
        embedderDetail: _0xa57f78.embedderDetail,
        binaryInstalled: _0x4ae921.isAvailable(),
        ortBundled: !_0x4ae921.platformBundlesOrt() || _0x4395a9.existsSync(_0x4ae921.getBundledOrtPath()),
        sidecarExists: _0x4395a9.existsSync(_0x2538ca),
        sidecarPath: _0x2538ca
      };
    }
    function _0x12e7a(_0x15c9ae, _0x4acbca, _0x296560, _0xf93be) {
      return new Promise(function (_0x5b3ce3, _0x1eceed) {
        const _0x1a011c = _0x2d99ff.spawn(_0x15c9ae, _0x4acbca, {
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true
        });
        const _0x2258bf = _0x2d99ff.spawn(_0x296560, ["repo-intel", "set-embeddings", "--map-file", _0xf93be, "--input", "-"], {
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true
        });
        let _0x4537e7 = null;
        let _0xd7bff6 = null;
        let _0x5b676a = false;
        let _0x13a249 = "";
        let _0x2afd52 = "";
        let _0x388b93 = "";
        function _0x29f9ef(_0xfe333, _0x345b26) {
          if (_0x5b676a) {
            return;
          }
          _0x5b676a = true;
          if (_0xfe333) {
            try {
              _0x1a011c.kill("SIGTERM");
            } catch (_0x4347e2) {}
            try {
              _0x2258bf.kill("SIGTERM");
            } catch (_0x575ee1) {}
            _0x1eceed(_0xfe333);
          } else {
            _0x5b3ce3(_0x345b26);
          }
        }
        function _0x54cbb1() {
          if (_0x5b676a || _0x4537e7 === null || _0xd7bff6 === null) {
            return;
          }
          if (_0x4537e7 !== 0) {
            return _0x29f9ef(new Error(_0x4ae921.EMBED_BINARY_NAME + " exited " + _0x4537e7 + (_0x2afd52.trim() ? ": " + _0x2afd52.trim().slice(0, 500) : "")));
          }
          if (_0xd7bff6 !== 0) {
            return _0x29f9ef(new Error("agent-analyzer set-embeddings exited " + _0xd7bff6 + (_0x388b93.trim() ? ": " + _0x388b93.trim().slice(0, 500) : "")));
          }
          const _0x4462b6 = _0x13a249.match(/(\d+)\s+files?/);
          _0x29f9ef(null, {
            files: _0x4462b6 ? parseInt(_0x4462b6[1], 10) : undefined
          });
        }
        _0x1a011c.stderr.on("data", function (_0x3949ee) {
          _0x2afd52 += _0x3949ee.toString("utf8");
        });
        _0x2258bf.stderr.on("data", function (_0x4d7579) {
          _0x388b93 += _0x4d7579.toString("utf8");
        });
        _0x2258bf.stdout.on("data", function (_0x5532c1) {
          _0x13a249 += _0x5532c1.toString("utf8");
        });
        _0x1a011c.stdout.on("error", function (_0x5ee81e) {
          _0x29f9ef(_0x5ee81e);
        });
        _0x2258bf.stdin.on("error", function (_0x2886c5) {
          if (_0x2886c5 && _0x2886c5.code !== "EPIPE") {
            _0x29f9ef(_0x2886c5);
          }
        });
        _0x1a011c.stdout.pipe(_0x2258bf.stdin);
        _0x1a011c.on("error", function (_0xba43df) {
          _0x29f9ef(_0xba43df);
        });
        _0x2258bf.on("error", function (_0x252ead) {
          _0x29f9ef(_0x252ead);
        });
        _0x1a011c.on("close", function (_0x2ee0d6) {
          _0x4537e7 = _0x2ee0d6;
          _0x54cbb1();
        });
        _0x2258bf.on("close", function (_0x215ef5) {
          _0xd7bff6 = _0x215ef5;
          _0x54cbb1();
        });
      });
    }
    function _0x41de62(_0x3c96a6) {
      if (!_0x3c96a6) {
        return "";
      }
      const _0x30df4d = _0x36a367.dirname(_0x3c96a6);
      const _0x524ffd = _0x36a367.basename(_0x3c96a6, _0x36a367.extname(_0x3c96a6));
      return _0x36a367.join(_0x30df4d, _0x524ffd + ".embeddings.bin");
    }
    const _0x53f93d = {
      isEnabled: _0x1d72e3,
      runScan: _0x2a2119,
      runUpdate: _0x16e18d,
      status: _0x156a79,
      streamEmbedToSetEmbeddings: _0x12e7a
    };
    _0x341dab.exports = _0x53f93d;
  }
});
var require_embed = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/index.js"(_0x23d851, _0x2649e5) {
    'use strict';

    "use strict";
    var _0x4976f2 = require_preference();
    var _0x3ca05d = require_binary2();
    var _0x6347f8 = require_orchestrator();
    const _0x323e8f = {
      preference: _0x4976f2,
      binary: _0x3ca05d,
      orchestrator: _0x6347f8,
      isEnabled: _0x6347f8.isEnabled,
      runScan: _0x6347f8.runScan,
      runUpdate: _0x6347f8.runUpdate,
      status: _0x6347f8.status
    };
    _0x2649e5.exports = _0x323e8f;
  }
});
var require_repo_intel = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/index.js"(_0x4a8521, _0x484ff1) {
    'use strict';

    var _0x4bc605 = require("fs");
    var _0x18a00b = require("path");
    var _0x5e4bb7 = require("child_process");
    var {
      execFileSync: _0x36698d
    } = _0x5e4bb7;
    var _0x564352 = require_installer();
    var _0x1d1803 = require_cache();
    var _0x24b010 = require_updater();
    var _0x17dadb = require_converter();
    var _0x24c6e8 = require_queries();
    var _0x273ae0 = require_binary();
    var {
      getStateDirPath: _0x1bb23c
    } = require_state_dir();
    var {
      writeJsonAtomic: _0x36e3ad
    } = require_atomic_write();
    var _0x2cf467 = "repo-intel.json";
    function _0x4e3897(_0x4c7bf3) {
      return _0x18a00b.join(_0x1bb23c(_0x4c7bf3), _0x2cf467);
    }
    async function _0x26aba2(_0xe20780, _0x1eaae7 = {}) {
      const _0x20eeba = await _0x564352.checkInstalled();
      if (!_0x20eeba.found) {
        return {
          success: false,
          error: "agent-analyzer binary unavailable: " + (_0x20eeba.error || "unknown error"),
          installSuggestion: _0x564352.getInstallInstructions()
        };
      }
      const _0x2dc26d = _0x1d1803.load(_0xe20780);
      if (_0x2dc26d && !_0x1eaae7.force) {
        return {
          success: false,
          error: "Repo map already exists. Use --force to rebuild or update to refresh.",
          existing: _0x1d1803.getStatus(_0xe20780)
        };
      }
      const _0x183b5e = Date.now();
      let _0x10f818;
      try {
        _0x10f818 = await _0x273ae0.runAnalyzerAsync(["repo-intel", "init", _0xe20780]);
      } catch (_0x32d6b5) {
        return {
          success: false,
          error: "agent-analyzer repo-intel init failed: " + _0x32d6b5.message
        };
      }
      let _0x5dc9ee;
      try {
        _0x5dc9ee = JSON.parse(_0x10f818);
      } catch (_0x515966) {
        return {
          success: false,
          error: "Failed to parse repo-intel output: " + _0x515966.message
        };
      }
      const _0x55d7b5 = _0x4e3897(_0xe20780);
      try {
        _0x36e3ad(_0x55d7b5, _0x5dc9ee);
      } catch {}
      const _0x47adac = _0x17dadb.convertIntelToRepoMap(_0x5dc9ee);
      _0x47adac.stats.scanDurationMs = Date.now() - _0x183b5e;
      _0x1d1803.save(_0xe20780, _0x47adac);
      return {
        success: true,
        map: _0x47adac,
        summary: {
          files: Object.keys(_0x47adac.files).length,
          symbols: _0x47adac.stats.totalSymbols,
          languages: _0x47adac.project.languages,
          duration: _0x47adac.stats.scanDurationMs
        }
      };
    }
    async function _0x417eac(_0x7a0544, _0x14758e = {}) {
      const _0x274cae = await _0x564352.checkInstalled();
      if (!_0x274cae.found) {
        return {
          success: false,
          error: "agent-analyzer binary unavailable: " + (_0x274cae.error || "unknown error"),
          installSuggestion: _0x564352.getInstallInstructions()
        };
      }
      if (!_0x1d1803.exists(_0x7a0544)) {
        return {
          success: false,
          error: "No repo map found. Run init first."
        };
      }
      if (_0x14758e.full) {
        return _0x26aba2(_0x7a0544, {
          force: true
        });
      }
      const _0x2f031f = _0x4e3897(_0x7a0544);
      if (!_0x4bc605.existsSync(_0x2f031f)) {
        return _0x26aba2(_0x7a0544, {
          force: true
        });
      }
      const _0x3442b0 = Date.now();
      let _0xe562ec;
      try {
        _0xe562ec = await _0x273ae0.runAnalyzerAsync(["repo-intel", "update", "--map-file", _0x2f031f, _0x7a0544]);
      } catch (_0x13331a) {
        return {
          success: false,
          error: "agent-analyzer repo-intel update failed: " + _0x13331a.message
        };
      }
      let _0x363c48;
      try {
        _0x363c48 = JSON.parse(_0xe562ec);
      } catch (_0xe9f0c1) {
        return {
          success: false,
          error: "Failed to parse repo-intel update output: " + _0xe9f0c1.message
        };
      }
      try {
        _0x36e3ad(_0x2f031f, _0x363c48);
      } catch {}
      const _0x32a219 = _0x17dadb.convertIntelToRepoMap(_0x363c48);
      _0x32a219.stats.scanDurationMs = Date.now() - _0x3442b0;
      _0x1d1803.save(_0x7a0544, _0x32a219);
      return {
        success: true,
        map: _0x32a219,
        summary: {
          files: Object.keys(_0x32a219.files).length,
          symbols: _0x32a219.stats.totalSymbols,
          duration: _0x32a219.stats.scanDurationMs
        }
      };
    }
    function _0x50d71e(_0x590c18) {
      const _0x500871 = _0x1d1803.load(_0x590c18);
      if (!_0x500871) {
        return {
          exists: false
        };
      }
      const _0x7cebf8 = _0x24b010.checkStaleness(_0x590c18, _0x500871);
      let _0x3a86e8;
      try {
        _0x3a86e8 = _0x36698d("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
          cwd: _0x590c18,
          encoding: "utf8"
        }).trim();
      } catch {}
      return {
        exists: true,
        status: {
          generated: _0x500871.generated,
          updated: _0x500871.updated,
          commit: _0x500871.git?.commit,
          branch: _0x3a86e8,
          files: Object.keys(_0x500871.files).length,
          symbols: _0x500871.stats?.totalSymbols || 0,
          languages: _0x500871.project?.languages || [],
          staleness: _0x7cebf8
        }
      };
    }
    function _0x4bdb9f(_0x12f389) {
      return _0x1d1803.load(_0x12f389);
    }
    function _0x376514(_0x2233cb) {
      return _0x1d1803.exists(_0x2233cb);
    }
    function _0x109d23(_0x32dcf7) {
      const _0x299877 = _0x4e3897(_0x32dcf7);
      if (!_0x4bc605.existsSync(_0x299877)) {
        return null;
      }
      try {
        return JSON.parse(_0x4bc605.readFileSync(_0x299877, "utf8"));
      } catch {
        return null;
      }
    }
    async function _0x26f742(_0x4631f6, _0xa8ac1a) {
      const _0xa190ef = await _0x273ae0.ensureBinary();
      return new Promise((_0x3289d8, _0x5bdcad) => {
        const _0x3ff1e7 = _0x5e4bb7.spawn(_0xa190ef, _0x4631f6, {
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true
        });
        let _0x5d7ef0 = "";
        let _0x3c4ef7 = "";
        _0x3ff1e7.stdout.on("data", _0xdc0cd0 => {
          _0x5d7ef0 += _0xdc0cd0.toString("utf8");
        });
        _0x3ff1e7.stderr.on("data", _0x4e69e1 => {
          _0x3c4ef7 += _0x4e69e1.toString("utf8");
        });
        _0x3ff1e7.on("error", _0x5bdcad);
        _0x3ff1e7.on("close", _0x67359f => {
          if (_0x67359f === 0) {
            const _0x3bab91 = {
              stdout: _0x5d7ef0,
              stderr: _0x3c4ef7
            };
            _0x3289d8(_0x3bab91);
          } else {
            _0x5bdcad(new Error("agent-analyzer " + _0x4631f6.join(" ") + " exited " + _0x67359f + ": " + (_0x3c4ef7.trim() || _0x5d7ef0.trim())));
          }
        });
        _0x3ff1e7.stdin.write(_0xa8ac1a);
        _0x3ff1e7.stdin.end();
      });
    }
    async function _0x43e04f(_0x2ed39f, _0x287cd9) {
      if (!_0x287cd9 || typeof _0x287cd9 !== "object") {
        throw new Error("applyDescriptors requires an object {path: descriptor}");
      }
      const _0x265505 = _0x4e3897(_0x2ed39f);
      if (!_0x4bc605.existsSync(_0x265505)) {
        throw new Error("No repo-intel artifact for " + _0x2ed39f + "; run init first.");
      }
      await _0x26f742(["repo-intel", "set-descriptors", "--map-file", _0x265505, "--input", "-"], JSON.stringify(_0x287cd9));
    }
    async function _0x330d36(_0x3d4779, _0x445e22) {
      if (!_0x445e22 || !_0x445e22.depth1 || !_0x445e22.depth3 || !_0x445e22.depth10) {
        throw new Error("applySummary requires {depth1, depth3, depth10, inputHash}");
      }
      const _0x3ab8ec = _0x4e3897(_0x3d4779);
      if (!_0x4bc605.existsSync(_0x3ab8ec)) {
        throw new Error("No repo-intel artifact for " + _0x3d4779 + "; run init first.");
      }
      await _0x26f742(["repo-intel", "set-summary", "--map-file", _0x3ab8ec, "--input", "-"], JSON.stringify(_0x445e22));
    }
    async function _0x544b0d() {
      return _0x564352.checkInstalled();
    }
    function _0x25ee7d() {
      return _0x564352.getInstallInstructions();
    }
    const _0x162573 = {
      init: _0x26aba2,
      update: _0x417eac,
      status: _0x50d71e,
      load: _0x4bdb9f,
      loadRaw: _0x109d23,
      exists: _0x376514,
      applyDescriptors: _0x43e04f,
      applySummary: _0x330d36,
      checkAstGrepInstalled: _0x544b0d,
      getInstallInstructions: _0x25ee7d,
      queries: _0x24c6e8,
      installer: _0x564352,
      cache: _0x1d1803,
      updater: _0x24b010,
      converter: _0x17dadb
    };
    _0x484ff1.exports = _0x162573;
    Object.defineProperty(_0x484ff1.exports, "embed", {
      enumerable: true,
      get() {
        return require_embed();
      }
    });
  }
});
var require_repo_map = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-map/index.js"(_0x23ca09, _0x3246db) {
    'use strict';

    var _0xde2362 = require_repo_intel();
    const _0x4f873f = {
      init: _0xde2362.init,
      update: _0xde2362.update,
      status: _0xde2362.status,
      load: _0xde2362.load,
      exists: _0xde2362.exists,
      checkAstGrepInstalled: _0xde2362.checkAstGrepInstalled,
      getInstallInstructions: _0xde2362.getInstallInstructions,
      installer: _0xde2362.installer,
      cache: _0xde2362.cache,
      updater: _0xde2362.updater
    };
    _0x3246db.exports = _0x4f873f;
  }
});
var fs = require("fs");
var path = require("path");
var {
  execFileSync
} = require("child_process");
var repoMapModule = null;
var repoMapLoadError = null;
function getRepoMap() {
  if (!repoMapModule && !repoMapLoadError) {
    try {
      repoMapModule = require_repo_map();
    } catch (_0x5601d0) {
      repoMapLoadError = _0x5601d0.message || "Failed to load repo-map module";
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
var EXPORT_PATTERNS = [/export\s+(?:function|class|const|let|var)\s+(\w+)/g, /export\s+\{([^}]+)\}/g, /module\.exports\s*=\s*\{([^}]+)\}/];
function escapeRegex(_0x28e766) {
  return _0x28e766.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function isInternalExport(_0x3cc200, _0x335019) {
  if (_0x3cc200.startsWith("_")) {
    return true;
  }
  const _0x2ea461 = _0x335019.toLowerCase();
  for (const _0x586878 of INTERNAL_DIRS) {
    if (_0x2ea461.includes("/" + _0x586878 + "/") || _0x2ea461.includes("\\" + _0x586878 + "\\")) {
      return true;
    }
  }
  if (/\.(test|spec)\.[jt]sx?$/.test(_0x335019)) {
    return true;
  }
  return false;
}
function isEntryPoint(_0x4d722c) {
  const _0x1e173c = path.basename(_0x4d722c);
  const _0x476e2e = _0x1e173c.replace(/\.[^.]+$/, "").toLowerCase();
  return ENTRY_NAMES.includes(_0x476e2e);
}
async function ensureRepoMap(_0x2d5061 = {}) {
  const {
    cwd = process.cwd(),
    askUser: _0x193bee
  } = _0x2d5061;
  const _0x4ae769 = getRepoMap();
  if (!_0x4ae769) {
    return {
      available: false,
      map: null,
      fallbackReason: "repo-map-module-not-found"
    };
  }
  if (_0x4ae769.exists(cwd)) {
    const _0x2670cf = _0x4ae769.load(cwd);
    const _0x417b6b = {
      available: true,
      map: _0x2670cf,
      fallbackReason: null
    };
    return _0x417b6b;
  }
  const _0x111a17 = await _0x4ae769.checkAstGrepInstalled();
  if (!_0x111a17.found) {
    if (_0x193bee) {
      const _0x377b1f = await _0x193bee({
        question: "ast-grep not found. Install for better doc sync accuracy?",
        header: "ast-grep Required",
        options: [{
          label: "Yes, show instructions",
          description: "Better accuracy with AST-based symbol detection"
        }, {
          label: "No, use regex fallback",
          description: "Less accurate but works without additional install"
        }]
      });
      if (_0x377b1f && _0x377b1f.includes("Yes")) {
        const _0x175a80 = _0x4ae769.getInstallInstructions();
        const _0x44d71e = {
          available: false,
          map: null,
          fallbackReason: "ast-grep-install-pending",
          installInstructions: _0x175a80
        };
        return _0x44d71e;
      }
    }
    return {
      available: false,
      map: null,
      fallbackReason: "ast-grep-not-installed"
    };
  }
  try {
    const _0x3dd643 = await _0x4ae769.init(cwd, {
      force: false
    });
    if (_0x3dd643.success) {
      const _0x508454 = {
        available: true,
        map: _0x3dd643.map,
        fallbackReason: null
      };
      return _0x508454;
    }
    if (_0x3dd643.error && _0x3dd643.error.includes("already exists")) {
      const _0x4011ac = _0x4ae769.load(cwd);
      const _0xebb0de = {
        available: true,
        map: _0x4011ac,
        fallbackReason: null
      };
      return _0xebb0de;
    }
    const _0x4e30f6 = {
      available: false,
      map: null,
      fallbackReason: _0x3dd643.error || "init-failed"
    };
    return _0x4e30f6;
  } catch (_0x160b95) {
    const _0x789f13 = {
      available: false,
      map: null,
      fallbackReason: _0x160b95.message || "init-error"
    };
    return _0x789f13;
  }
}
function ensureRepoMapSync(_0x240d15 = {}) {
  const {
    cwd = process.cwd()
  } = _0x240d15;
  const _0x16075b = getRepoMap();
  if (!_0x16075b) {
    return {
      available: false,
      map: null,
      fallbackReason: "repo-map-module-not-found"
    };
  }
  if (_0x16075b.exists(cwd)) {
    const _0x2a5e7d = _0x16075b.load(cwd);
    const _0x3e3b28 = {
      available: true,
      map: _0x2a5e7d,
      fallbackReason: null
    };
    return _0x3e3b28;
  }
  return {
    available: false,
    map: null,
    fallbackReason: "repo-map-not-initialized"
  };
}
function getExportsFromRepoMap(_0x2fea5b, _0x335d06) {
  if (!_0x335d06 || !_0x335d06.files) {
    return null;
  }
  const _0xac0dbb = _0x2fea5b.replace(/\\/g, "/");
  let _0x280132 = _0x335d06.files[_0xac0dbb];
  if (!_0x280132 && _0xac0dbb.startsWith("./")) {
    _0x280132 = _0x335d06.files[_0xac0dbb.slice(2)];
  }
  if (!_0x280132 && !_0xac0dbb.startsWith("./")) {
    _0x280132 = _0x335d06.files["./" + _0xac0dbb];
  }
  if (!_0x280132 || !_0x280132.symbols || !_0x280132.symbols.exports) {
    return null;
  }
  return _0x280132.symbols.exports.map(_0xe76ff4 => _0xe76ff4.name);
}
function findUndocumentedExports(_0x5ae5cb, _0x436584 = {}) {
  const _0x1d926a = {
    ...DEFAULT_OPTIONS,
    ..._0x436584
  };
  const _0x18f290 = _0x1d926a;
  const _0x7fc4b4 = _0x18f290.repoMapStatus || ensureRepoMapSync(_0x18f290);
  if (!_0x7fc4b4.available || !_0x7fc4b4.map) {
    return [];
  }
  const _0x413058 = _0x7fc4b4.map;
  const _0x4e9b44 = findMarkdownFiles(_0x18f290.cwd);
  let _0x257251 = "";
  for (const _0x125039 of _0x4e9b44) {
    try {
      _0x257251 += fs.readFileSync(path.join(_0x18f290.cwd, _0x125039), "utf8") + "\n";
    } catch {}
  }
  const _0x1fb17f = [];
  for (const _0x37f7b0 of _0x5ae5cb) {
    const _0x52d4d0 = _0x37f7b0.replace(/\\/g, "/");
    const _0x36ffc1 = _0x413058.files[_0x52d4d0] || _0x413058.files[_0x52d4d0.replace(/^\.\//, "")];
    if (!_0x36ffc1 || !_0x36ffc1.symbols || !_0x36ffc1.symbols.exports) {
      continue;
    }
    for (const _0x47e359 of _0x36ffc1.symbols.exports) {
      if (isInternalExport(_0x47e359.name, _0x52d4d0)) {
        continue;
      }
      if (isEntryPoint(_0x52d4d0)) {
        continue;
      }
      const _0x3b01be = new RegExp("\\b" + escapeRegex(_0x47e359.name) + "\\b");
      if (!_0x3b01be.test(_0x257251)) {
        const _0x11c153 = {
          type: "undocumented-export",
          severity: "low",
          file: _0x52d4d0,
          name: _0x47e359.name,
          line: _0x47e359.line || 0,
          kind: _0x47e359.kind || "export",
          certainty: "MEDIUM",
          suggestion: "Export '" + _0x47e359.name + "' in " + _0x52d4d0 + " is not mentioned in any documentation"
        };
        _0x1fb17f.push(_0x11c153);
      }
    }
  }
  return _0x1fb17f;
}
function findRelatedDocs(_0x4999f6, _0x42f6b8 = {}) {
  const _0x521f18 = {
    ...DEFAULT_OPTIONS,
    ..._0x42f6b8
  };
  const _0xe0f2bd = _0x521f18;
  const _0x4475dc = _0xe0f2bd.cwd;
  const _0x460bc0 = [];
  const _0x20be24 = findMarkdownFiles(_0x4475dc);
  for (const _0x430e04 of _0x4999f6) {
    const _0x42b80d = path.basename(_0x430e04).replace(/\.[^.]+$/, "");
    const _0x6dd29d = _0x430e04.replace(/\.[^.]+$/, "");
    const _0xb859d8 = path.dirname(_0x430e04);
    for (const _0x594213 of _0x20be24) {
      let _0x48cc49;
      try {
        _0x48cc49 = fs.readFileSync(path.join(_0x4475dc, _0x594213), "utf8");
      } catch {
        continue;
      }
      const _0x1f97c9 = [];
      if (_0x48cc49.includes(_0x42b80d)) {
        _0x1f97c9.push("filename");
      }
      if (_0x48cc49.includes(_0x430e04)) {
        _0x1f97c9.push("full-path");
      }
      if (_0x48cc49.includes("from '" + _0x6dd29d + "'") || _0x48cc49.includes("from \"" + _0x6dd29d + "\"")) {
        _0x1f97c9.push("import");
      }
      if (_0x48cc49.includes("require('" + _0x6dd29d + "')") || _0x48cc49.includes("require(\"" + _0x6dd29d + "\")")) {
        _0x1f97c9.push("require");
      }
      if (_0x48cc49.includes("/" + _0x42b80d) || _0x48cc49.includes("/" + _0x42b80d + ".")) {
        _0x1f97c9.push("url-path");
      }
      if (_0x1f97c9.length > 0) {
        const _0xeb3a2d = {
          doc: _0x594213,
          referencedFile: _0x430e04,
          referenceTypes: _0x1f97c9
        };
        _0x460bc0.push(_0xeb3a2d);
      }
    }
  }
  return _0x460bc0;
}
function findMarkdownFiles(_0x5e550f) {
  const _0x34572d = [];
  const _0x24929f = ["node_modules", "dist", "build", ".git", "coverage", "vendor"];
  function _0x60e2af(_0x5e7372, _0x401b41 = 0) {
    if (_0x401b41 > MAX_SCAN_DEPTH || _0x34572d.length > MAX_DOC_FILES) {
      return;
    }
    try {
      const _0x32aa9c = fs.readdirSync(_0x5e7372, {
        withFileTypes: true
      });
      for (const _0x54f0df of _0x32aa9c) {
        const _0x33a3f7 = path.join(_0x5e7372, _0x54f0df.name);
        const _0x1e87f8 = path.relative(_0x5e550f, _0x33a3f7);
        if (_0x54f0df.isDirectory()) {
          if (!_0x24929f.includes(_0x54f0df.name) && !_0x54f0df.name.startsWith(".")) {
            _0x60e2af(_0x33a3f7, _0x401b41 + 1);
          }
        } else if (_0x54f0df.isFile() && _0x54f0df.name.endsWith(".md")) {
          _0x34572d.push(_0x1e87f8);
        }
      }
    } catch {}
  }
  _0x60e2af(_0x5e550f);
  return _0x34572d;
}
function analyzeDocIssues(_0x42f921, _0x5edcbb, _0x473be8 = {}) {
  const _0x496179 = {
    ...DEFAULT_OPTIONS,
    ..._0x473be8
  };
  const _0x3a7f50 = _0x496179;
  const _0x2bbb6e = _0x3a7f50.cwd;
  const _0x504e17 = [];
  let _0x577424;
  try {
    _0x577424 = fs.readFileSync(path.join(_0x2bbb6e, _0x42f921), "utf8");
  } catch {
    return _0x504e17;
  }
  const _0x4d1bf8 = _0x577424.split("\n");
  const _0x315a5b = /```[\s\S]*?```/g;
  const _0x239486 = _0x577424.match(_0x315a5b) || [];
  for (const _0x4368ad of _0x239486) {
    const _0x8d3286 = /import .* from ['"]([^'"]+)['"]/g;
    let _0x560303;
    while ((_0x560303 = _0x8d3286.exec(_0x4368ad)) !== null) {
      const _0x1a8b5b = _0x560303[1];
      const _0x32f8eb = _0x5edcbb.replace(/\.[^.]+$/, "");
      if (_0x1a8b5b.includes(path.basename(_0x32f8eb))) {
        _0x504e17.push({
          type: "code-example",
          severity: "medium",
          line: findLineNumber(_0x577424, _0x560303[0]),
          current: _0x560303[0],
          suggestion: "Verify import path is still valid"
        });
      }
    }
  }
  const _0x358bda = ensureRepoMapSync(_0x3a7f50);
  let _0x2404a2;
  let _0x4f6d5e;
  let _0x1ba111 = false;
  if (_0x358bda.available && _0x358bda.map) {
    const _0x2fee0a = getExportsFromRepoMap(_0x5edcbb, _0x358bda.map);
    if (_0x2fee0a) {
      _0x4f6d5e = _0x2fee0a;
      _0x2404a2 = getExportsFromGit(_0x5edcbb, "HEAD~1", _0x3a7f50);
      _0x1ba111 = true;
    }
  }
  if (!_0x1ba111) {
    _0x2404a2 = getExportsFromGit(_0x5edcbb, "HEAD~1", _0x3a7f50);
    _0x4f6d5e = getExportsFromGit(_0x5edcbb, "HEAD", _0x3a7f50);
  }
  const _0x422676 = _0x2404a2.filter(_0x5df875 => !_0x4f6d5e.includes(_0x5df875));
  for (const _0x2909de of _0x422676) {
    if (_0x577424.includes(_0x2909de)) {
      const _0x401576 = {
        type: "removed-export",
        severity: "high",
        reference: _0x2909de,
        suggestion: "'" + _0x2909de + "' was removed or renamed",
        detectionMethod: _0x1ba111 ? "repo-map" : "regex"
      };
      _0x504e17.push(_0x401576);
    }
  }
  try {
    const _0x3716b8 = fs.readFileSync(path.join(_0x2bbb6e, "package.json"), "utf8");
    const _0x1e6f51 = JSON.parse(_0x3716b8);
    const _0x48e400 = _0x1e6f51.version;
    const _0x1a36b1 = _0x577424.matchAll(/version[:\s]+['"]?(\d+\.\d+\.\d+)/gi);
    for (const _0xb717e0 of _0x1a36b1) {
      const _0x19fda7 = _0xb717e0[1];
      if (_0x19fda7 !== _0x48e400 && compareVersions(_0x19fda7, _0x48e400) < 0) {
        _0x504e17.push({
          type: "outdated-version",
          severity: "low",
          line: findLineNumber(_0x577424, _0xb717e0[0]),
          current: _0x19fda7,
          expected: _0x48e400,
          suggestion: "Update version from " + _0x19fda7 + " to " + _0x48e400
        });
      }
    }
  } catch {}
  return _0x504e17;
}
function findLineNumber(_0x4b1427, _0x2f17a1) {
  const _0x18ceab = _0x4b1427.indexOf(_0x2f17a1);
  if (_0x18ceab === -1) {
    return 0;
  }
  return _0x4b1427.substring(0, _0x18ceab).split("\n").length;
}
function isValidGitRef(_0x2afb79) {
  if (typeof _0x2afb79 !== "string" || !_0x2afb79) {
    return false;
  }
  return /^[a-zA-Z0-9_./-]+(?:[~^][0-9]+)?$/.test(_0x2afb79);
}
function getExportsFromGit(_0x220b92, _0xa9623a, _0xff0e5d = {}) {
  const _0x4e21de = {
    ...DEFAULT_OPTIONS,
    ..._0xff0e5d
  };
  const _0x48fe78 = _0x4e21de;
  if (!isValidGitRef(_0xa9623a)) {
    return [];
  }
  try {
    const _0x50cdfd = execFileSync("git", ["show", _0xa9623a + ":" + _0x220b92], {
      cwd: _0x48fe78.cwd,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    });
    const _0x15132d = [];
    for (const _0x1618bd of EXPORT_PATTERNS) {
      const _0xad9d27 = new RegExp(_0x1618bd.source, _0x1618bd.flags);
      let _0x2c41b9;
      while ((_0x2c41b9 = _0xad9d27.exec(_0x50cdfd)) !== null) {
        if (_0x2c41b9[1].includes(",")) {
          const _0x125aac = _0x2c41b9[1].split(",").map(_0x1cd551 => _0x1cd551.trim().split(/\s+as\s+/)[0].trim());
          _0x15132d.push(..._0x125aac.filter(_0x3fedeb => _0x3fedeb && /^\w+$/.test(_0x3fedeb)));
        } else {
          _0x15132d.push(_0x2c41b9[1]);
        }
      }
    }
    return [...new Set(_0x15132d)];
  } catch {
    return [];
  }
}
function compareVersions(_0x2e56b7, _0x21087f) {
  const _0x25f83a = _0x2e56b7.split(".").map(Number);
  const _0x213d4b = _0x21087f.split(".").map(Number);
  for (let _0x58ec40 = 0; _0x58ec40 < 3; _0x58ec40++) {
    const _0x30b8fc = _0x25f83a[_0x58ec40] || 0;
    const _0x1938ab = _0x213d4b[_0x58ec40] || 0;
    if (_0x30b8fc < _0x1938ab) {
      return -1;
    }
    if (_0x30b8fc > _0x1938ab) {
      return 1;
    }
  }
  return 0;
}
function checkChangelog(_0x2138d8, _0x270796 = {}) {
  const _0xa1a77f = {
    ...DEFAULT_OPTIONS,
    ..._0x270796
  };
  const _0x12ce32 = _0xa1a77f;
  const _0x322477 = _0x12ce32.cwd;
  const _0x4ed874 = path.join(_0x322477, "CHANGELOG.md");
  if (!fs.existsSync(_0x4ed874)) {
    return {
      exists: false
    };
  }
  let _0x38c687;
  try {
    _0x38c687 = fs.readFileSync(_0x4ed874, "utf8");
  } catch {
    return {
      exists: false,
      error: "Could not read CHANGELOG.md"
    };
  }
  const _0x1b023d = _0x38c687.includes("## [Unreleased]");
  let _0x155a07 = [];
  try {
    const _0x112d43 = execFileSync("git", ["log", "--oneline", "-10", "HEAD"], {
      cwd: _0x322477,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    });
    _0x155a07 = _0x112d43.trim().split("\n");
  } catch {}
  const _0x3536b9 = [];
  const _0x254700 = [];
  for (const _0xda4939 of _0x155a07) {
    if (!_0xda4939) {
      continue;
    }
    const _0x595a05 = _0xda4939.substring(8);
    if (_0x38c687.includes(_0x595a05) || _0x38c687.includes(_0xda4939.substring(0, 7))) {
      _0x3536b9.push(_0x595a05);
    } else if (_0x595a05.match(/^(feat|fix|breaking)/i)) {
      _0x254700.push(_0x595a05);
    }
  }
  return {
    exists: true,
    hasUnreleased: _0x1b023d,
    documented: _0x3536b9,
    undocumented: _0x254700,
    suggestion: _0x254700.length > 0 ? _0x254700.length + " commits may need CHANGELOG entries" : null
  };
}
function collect(_0x14efc6 = {}) {
  const _0x58c9eb = {
    ...DEFAULT_OPTIONS,
    ..._0x14efc6
  };
  const _0x349fff = _0x58c9eb;
  const _0x4d0425 = _0x349fff.changedFiles || [];
  const _0x285410 = ensureRepoMapSync(_0x349fff);
  return {
    relatedDocs: findRelatedDocs(_0x4d0425, _0x349fff),
    changelog: checkChangelog(_0x4d0425, _0x349fff),
    markdownFiles: findMarkdownFiles(_0x349fff.cwd),
    repoMap: {
      available: _0x285410.available,
      fallbackReason: _0x285410.fallbackReason,
      stats: _0x285410.map ? {
        files: Object.keys(_0x285410.map.files || {}).length,
        symbols: _0x285410.map.stats?.totalSymbols || 0
      } : null
    },
    undocumentedExports: _0x285410.available ? findUndocumentedExports(_0x4d0425, {
      ..._0x349fff,
      repoMapStatus: _0x285410
    }) : []
  };
}
const _0x48d57e = {
  DEFAULT_OPTIONS: DEFAULT_OPTIONS,
  findRelatedDocs: findRelatedDocs,
  findMarkdownFiles: findMarkdownFiles,
  analyzeDocIssues: analyzeDocIssues,
  checkChangelog: checkChangelog,
  getExportsFromGit: getExportsFromGit,
  compareVersions: compareVersions,
  findLineNumber: findLineNumber,
  collect: collect,
  ensureRepoMap: ensureRepoMap,
  ensureRepoMapSync: ensureRepoMapSync,
  getExportsFromRepoMap: getExportsFromRepoMap,
  findUndocumentedExports: findUndocumentedExports,
  isInternalExport: isInternalExport,
  isEntryPoint: isEntryPoint,
  escapeRegex: escapeRegex,
  getRepoMapLoadError: getRepoMapLoadError
};
module.exports = _0x48d57e;