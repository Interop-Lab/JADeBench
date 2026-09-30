'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames, __commonJS = (modules, cachedModule) => function requireModule() {
  if (!cachedModule) {
    cachedModule = {
      exports: {}
    };
    (0, modules[__getOwnPropNames(modules)[0]])(cachedModule.exports, cachedModule);
  }
  return cachedModule.exports;
}, require_version = __commonJS({
  '../work/agent-sh__agentsys/lib/binary/version.js'(exports, module) {
    module.exports = {
      ANALYZER_MIN_VERSION: '0.3.0',
      BINARY_NAME: 'agent-analyzer',
      GITHUB_REPO: 'agent-sh/agent-analyzer'
    };
  }
}), require_binary = __commonJS({
  '../work/agent-sh__agentsys/lib/binary/index.js'(exports, module) {
    var fs = require('fs');
    var path = require('path');
    var os = require('os');
    var https = require('https');
    var childProcess = require('child_process');
    var crypto = require('crypto');
    var {promisify} = require('util');
    var execFileAsync = promisify(childProcess.execFile);
    var {ANALYZER_MIN_VERSION, BINARY_NAME, GITHUB_REPO} = require_version();

    var PLATFORM_MAP = {
      'darwin-arm64': 'aarch64-apple-darwin',
      'darwin-x64': 'x86_64-apple-darwin',
      'linux-x64': 'x86_64-unknown-linux-gnu',
      'linux-arm64': 'aarch64-unknown-linux-gnu',
      'win32-x64': 'x86_64-pc-windows-msvc'
    };

    function getBinaryPath() {
      const extension = process.platform === 'win32' ? '.exe' : '';
      return path.join(os.homedir(), '.agent-sh', 'bin', BINARY_NAME + extension);
    }

    function getPlatformKey() {
      const platformKey = process.platform + '-' + process.arch;
      return PLATFORM_MAP[platformKey] || null;
    }

    function meetsMinimumVersion(version, minimumVersion) {
      if (!version) {
        return false;
      }
      const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
      if (!match) {
        return false;
      }
      const current = match.slice(1).map(Number);
      const minimum = minimumVersion.split('.').map(Number);
      return current[0] > minimum[0] || !(current[0] < minimum[0]) &&
        (current[1] > minimum[1] || !(current[1] < minimum[1]) && current[2] >= minimum[2]);
    }

    function getVersion() {
      const binaryPath = getBinaryPath();
      if (!fs.existsSync(binaryPath)) {
        return null;
      }
      try {
        const output = childProcess.execFileSync(binaryPath, [ '--version' ], {
          timeout: 5e3,
          encoding: 'utf8',
          stdio: [ 'pipe', 'pipe', 'pipe' ],
          windowsHide: true
        });
        const match = output.trim().match(/(\d+\.\d+\.\d+)/);
        return match ? match[1] : output.trim();
      } catch (error) {
        return null;
      }
    }

    function isAvailable() {
      const binaryPath = getBinaryPath();
      return fs.existsSync(binaryPath) && meetsMinimumVersion(getVersion(), ANALYZER_MIN_VERSION);
    }

    function buildDownloadUrl(version, platformKey) {
      const extension = process.platform === 'win32' ? '.zip' : '.tar.gz';
      return 'https://github.com/' + GITHUB_REPO + '/releases/download/v' + version + '/' + BINARY_NAME + '-' + platformKey + extension;
    }

    function fetchBuffer(url) {
      return new Promise(function(resolve, reject) {
        const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        function fetchWithRedirects(currentUrl, redirectCount) {
          if (redirectCount > 5) {
            reject(new Error('Too many redirects fetching from ' + url));
            return;
          }
          const headers = {
            'User-Agent': 'agent-core/binary-resolver',
            Accept: 'application/octet-stream'
          };
          if (token) {
            headers.Authorization = 'Bearer ' + token;
          }
          https.get(currentUrl, {headers}, function(response) {
            const statusCode = response.statusCode;
            if (statusCode === 301 || statusCode === 302 || statusCode === 307 || statusCode === 308) {
              response.resume();
              fetchWithRedirects(response.headers.location, redirectCount + 1);
              return;
            }
            if (statusCode !== 200) {
              response.resume();
              reject(new Error('HTTP ' + statusCode + (statusCode === 403 ? ' (rate limited - set GITHUB_TOKEN env var)' : '') + ' fetching ' + currentUrl));
              return;
            }
            const chunks = [];
            response.on('data', function(chunk) {
              chunks.push(chunk);
            });
            response.on('end', function() {
              resolve(Buffer.concat(chunks));
            });
            response.on('error', reject);
          }).on('error', reject);
        }
        fetchWithRedirects(url, 0);
      });
    }

    function parseSha256Sidecar(body) {
      if (typeof body !== 'string') {
        body = String(body || '');
      }
      const match = body.trim().match(/^([A-Fa-f0-9]{64})\b/);
      if (!match) {
        throw new Error('Could not parse SHA-256 digest from sidecar body');
      }
      return match[1].toLowerCase();
    }

    async function fetchSha256Digest(downloadUrl) {
      const sidecarUrl = downloadUrl + '.sha256';
      return parseSha256Sidecar((await fetchBuffer(sidecarUrl)).toString('utf8'));
    }

    function sha256Hex(buffer) {
      return crypto.createHash('sha256').update(buffer).digest('hex');
    }

    function verifySha256(buffer, expectedDigest, filename) {
      const expected = String(expectedDigest || '').toLowerCase();
      const actual = sha256Hex(buffer);
      if (expected !== actual) {
        throw new Error('SHA-256 verification failed for ' + filename + ': expected ' + expected + ', got ' + actual + '. This could indicate a tampered release. Do not extract.');
      }
    }

    function assertSafeArchiveEntry(entryName) {
      if (!entryName || typeof entryName !== 'string') {
        throw new Error('Refusing to extract archive with empty entry name');
      }
      const normalized = entryName.replace(/\\/g, '/').trim();
      if (normalized.length === 0) {
        throw new Error('Refusing to extract archive with empty entry name');
      }
      if (normalized.startsWith('//')) {
        throw new Error('Refusing to extract archive with UNC entry: ' + entryName);
      }
      if (normalized.startsWith('/')) {
        throw new Error('Refusing to extract archive with absolute entry: ' + entryName);
      }
      if (/^[A-Za-z]:[\\/]/.test(entryName)) {
        throw new Error('Refusing to extract archive with Windows absolute entry: ' + entryName);
      }
      const parts = normalized.split('/').filter(function(part) {
        return part.length > 0;
      });
      for (let index = 0; index < parts.length; index++) {
        if (parts[index] === '..') {
          throw new Error('Refusing to extract archive with parent-traversal entry: ' + entryName);
        }
      }
    }

    function listTarEntries(archiveBuffer) {
      return new Promise(function(resolve, reject) {
        const tar = childProcess.spawn('tar', [ '-tz' ], {stdio: [ 'pipe', 'pipe', 'pipe' ]});
        let stdout = '';
        let stderr = '';
        tar.stdout.on('data', function(chunk) {
          stdout += chunk;
        });
        tar.stderr.on('data', function(chunk) {
          stderr += chunk;
        });
        tar.on('error', reject);
        tar.on('close', function(code) {
          if (code !== 0) {
            reject(new Error('tar -tz listing failed (code ' + code + '): ' + stderr));
            return;
          }
          resolve(stdout.split(/\r?\n/).filter(function(entry) {
            return entry.length > 0;
          }));
        });
        tar.stdin.write(archiveBuffer);
        tar.stdin.end();
      });
    }

    function assertInsideRoot(root, candidate) {
      const resolvedRoot = path.resolve(root);
      const rootPrefix = resolvedRoot + path.sep;
      const resolvedCandidate = path.resolve(candidate);
      if (resolvedCandidate !== resolvedRoot && !resolvedCandidate.startsWith(rootPrefix)) {
        throw new Error('Extracted path escapes extract root: ' + candidate);
      }
    }

    function collectRegularFiles(root) {
      const files = [];
      const pending = [ root ];
      while (pending.length > 0) {
        const currentPath = pending.pop();
        const stat = fs.lstatSync(currentPath);
        if (stat.isSymbolicLink()) {
          throw new Error('Refusing to follow symlink produced by extractor: ' + currentPath);
        }
        if (stat.isDirectory()) {
          const entries = fs.readdirSync(currentPath);
          for (let index = 0; index < entries.length; index++) {
            pending.push(path.join(currentPath, entries[index]));
          }
        } else if (stat.isFile()) {
          files.push(currentPath);
        }
      }
      return files;
    }

    function removeTreeQuietly(targetPath) {
      try {
        fs.rmSync(targetPath, {recursive: true, force: true});
      } catch (error) {}
    }

    async function extractTarGzToScratch(archiveBuffer) {
      const entries = await listTarEntries(archiveBuffer);
      for (let index = 0; index < entries.length; index++) {
        assertSafeArchiveEntry(entries[index]);
      }
      const scratchDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-analyzer-tar-'));
      try {
        await new Promise(function(resolve, reject) {
          const tar = childProcess.spawn('tar', [ 'xz', '-C', scratchDir ], {stdio: [ 'pipe', 'pipe', 'pipe' ]});
          let stderr = '';
          tar.stderr.on('data', function(chunk) {
            stderr += chunk;
          });
          tar.on('error', reject);
          tar.on('close', function(code) {
            if (code !== 0) {
              reject(new Error('tar extraction failed (code ' + code + '): ' + stderr));
            } else {
              resolve();
            }
          });
          tar.stdin.write(archiveBuffer);
          tar.stdin.end();
        });
        const files = collectRegularFiles(scratchDir);
        for (let index = 0; index < files.length; index++) {
          assertInsideRoot(scratchDir, files[index]);
        }
      } catch (error) {
        removeTreeQuietly(scratchDir);
        throw error;
      }
      return scratchDir;
    }

    var EXTRACT_ZIP_PS1 = [ '$ErrorActionPreference = "Stop"', '$src  = $env:SRC_ZIP', '$dest = $env:DEST_DIR', 'if ([string]::IsNullOrEmpty($src) -or [string]::IsNullOrEmpty($dest)) {', '  [Console]::Error.WriteLine("SRC_ZIP and DEST_DIR must both be set"); exit 2', '}', 'Add-Type -AssemblyName System.IO.Compression.FileSystem', '$destFull = [System.IO.Path]::GetFullPath($dest)', 'if (-not $destFull.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {', '  $destFull = $destFull + [System.IO.Path]::DirectorySeparatorChar', '}', '$zip = [System.IO.Compression.ZipFile]::OpenRead($src)', 'try {', '  foreach ($entry in $zip.Entries) {', '    $name = $entry.FullName', '    if ([string]::IsNullOrEmpty($name)) { continue }', '    $norm = $name -replace "\\\\","/"', '    if ($norm.StartsWith("/") -or $norm.StartsWith("//")) {', '      [Console]::Error.WriteLine("Refusing absolute/UNC entry: " + $name); exit 3', '    }', '    if ($name -match "^[A-Za-z]:[\\\\/]") {', '      [Console]::Error.WriteLine("Refusing Windows-absolute entry: " + $name); exit 3', '    }', '    foreach ($part in ($norm -split "/")) {', '      if ($part -eq "..") {', '        [Console]::Error.WriteLine("Refusing parent-traversal entry: " + $name); exit 3', '      }', '    }', '    $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($destFull, $norm))', '    if (-not $target.StartsWith($destFull, [System.StringComparison]::OrdinalIgnoreCase)) {', '      [Console]::Error.WriteLine("Entry escapes destination: " + $name); exit 3', '    }', '    if ($entry.FullName.EndsWith("/")) {', '      [System.IO.Directory]::CreateDirectory($target) | Out-Null', '    } else {', '      $parent = [System.IO.Path]::GetDirectoryName($target)', '      if ($parent) { [System.IO.Directory]::CreateDirectory($parent) | Out-Null }', '      [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true)', '    }', '  }', '} finally {', '  $zip.Dispose()', '}' ].join('\r\n');

    async function extractZipToScratch(archiveBuffer) {
      const scratchDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-analyzer-zip-'));
      const archivePath = path.join(scratchDir, '__archive.zip');
      const scriptDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-analyzer-ps-'));
      const scriptPath = path.join(scriptDir, 'extract.ps1');
      try {
        fs.writeFileSync(archivePath, archiveBuffer);
        fs.writeFileSync(scriptPath, EXTRACT_ZIP_PS1, 'utf8');
        await new Promise(function(resolve, reject) {
          const child = childProcess.execFile('powershell.exe', [ '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', scriptPath ], {
            windowsHide: true,
            env: Object.assign({}, process.env, {SRC_ZIP: archivePath, DEST_DIR: scratchDir})
          }, function(error, stdout, stderr) {
            if (error) {
              reject(new Error('zip extraction failed: ' + (stderr || error.message)));
            } else {
              resolve();
            }
          });
          if (child.stdin) {
            child.stdin.end();
          }
        });
        try {
          fs.unlinkSync(archivePath);
        } catch (error) {}
        const files = collectRegularFiles(scratchDir);
        for (let index = 0; index < files.length; index++) {
          assertInsideRoot(scratchDir, files[index]);
        }
      } catch (error) {
        removeTreeQuietly(scratchDir);
        throw error;
      } finally {
        removeTreeQuietly(scriptDir);
      }
      return scratchDir;
    }

    function findFileByBasename(root, basename) {
      const files = collectRegularFiles(root);
      for (let index = 0; index < files.length; index++) {
        if (path.basename(files[index]) === basename) {
          assertInsideRoot(root, files[index]);
          return files[index];
        }
      }
      return null;
    }

    function runGhAttestationVerify(filePath, repo) {
      try {
        const stdout = childProcess.execFileSync('gh', [ 'attestation', 'verify', filePath, '--repo', repo, '--format', 'json' ], {
          encoding: 'utf8',
          stdio: [ 'ignore', 'pipe', 'pipe' ],
          timeout: 6e4,
          windowsHide: true
        });
        return {status: 0, stdout: stdout || '', stderr: ''};
      } catch (error) {
        return {
          status: typeof error.status === 'number' ? error.status : null,
          stdout: error.stdout ? String(error.stdout) : '',
          stderr: error.stderr ? String(error.stderr) : error.message || ''
        };
      }
    }

    function isGhAvailable(probe) {
      if (typeof probe === 'function') {
        try {
          return Boolean(probe());
        } catch (error) {
          return false;
        }
      }
      try {
        childProcess.execFileSync('gh', [ '--version' ], {stdio: 'ignore', timeout: 5e3, windowsHide: true});
        return true;
      } catch (error) {
        return false;
      }
    }

    function verifySlsaAttestation(filePath, options) {
      options = options || {};
      const repo = options.repo || GITHUB_REPO;
      const ghRunner = typeof options.ghRunner === 'function' ? options.ghRunner : runGhAttestationVerify;
      const requireAttestation = typeof options.requireAttestation === 'boolean'
        ? options.requireAttestation
        : process.env.AGENT_ANALYZER_REQUIRE_ATTESTATION === '1';
      if (!isGhAvailable(options.ghProbe)) {
        const reason = '`gh` CLI not found on PATH';
        if (requireAttestation) {
          return {status: 'failed', reason: reason + ' (AGENT_ANALYZER_REQUIRE_ATTESTATION=1)'};
        }
        return {status: 'skipped', reason};
      }
      const result = ghRunner(filePath, repo);
      if (result && result.status === 0) {
        return {status: 'verified'};
      }
      return {
        status: 'failed',
        reason: 'gh attestation verify exited with status ' + (result && result.status !== null ? result.status : 'unknown'),
        stderr: result && result.stderr || ''
      };
    }

    async function downloadBinary(version, options) {
      options = options || {};
      const skipChecksum = options.skipChecksum === true;
      const skipAttestation = options.skipAttestation === true;
      const platformKey = getPlatformKey();
      if (!platformKey) {
        throw new Error('Unsupported platform: ' + process.platform + '-' + process.arch + '. Supported platforms: ' + Object.keys(PLATFORM_MAP).join(', '));
      }
      const downloadUrl = buildDownloadUrl(version, platformKey);
      const archiveName = downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1);
      process.stderr.write('Downloading ' + BINARY_NAME + ' v' + version + ' for ' + platformKey + '...\n');
      const binaryPath = getBinaryPath();
      const binaryDir = path.dirname(binaryPath);
      fs.mkdirSync(binaryDir, {recursive: true});
      let archiveBuffer;
      try {
        archiveBuffer = await fetchBuffer(downloadUrl);
      } catch (error) {
        throw new Error('Failed to download ' + BINARY_NAME + ':\n  URL: ' + downloadUrl + '\n  Error: ' + error.message + '\n\nTo install manually:\n  1. Download: ' + downloadUrl + '\n  2. Extract the binary to: ' + binaryDir + '\n  3. Ensure it is named: ' + path.basename(binaryPath));
      }
      if (skipChecksum) {
        process.stderr.write('[WARN] skipChecksum=true - SHA-256 verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n');
      } else {
        let expectedDigest;
        try {
          expectedDigest = await fetchSha256Digest(downloadUrl);
        } catch (error) {
          throw new Error('Failed to fetch SHA-256 sidecar for ' + archiveName + ':\n  URL: ' + downloadUrl + '.sha256\n  Error: ' + error.message + '\n\nThe release may be missing its checksum file. Refusing to install an unverified binary. If this is a legacy release without sidecars, pass { skipChecksum: true } to downloadBinary() (LOCAL DEV ONLY).');
        }
        verifySha256(archiveBuffer, expectedDigest, archiveName);
      }
      if (skipAttestation) {
        process.stderr.write('[WARN] skipAttestation=true - SLSA verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n');
      } else {
        const attestationDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-analyzer-slsa-'));
        const attestationPath = path.join(attestationDir, archiveName);
        try {
          fs.writeFileSync(attestationPath, archiveBuffer);
          const result = verifySlsaAttestation(attestationPath, {
            repo: GITHUB_REPO,
            requireAttestation: options.requireAttestation,
            ghRunner: options.ghRunner,
            ghProbe: options.ghProbe
          });
          if (result.status === 'verified') {
            process.stderr.write('[OK] SLSA attestation verified for ' + archiveName + '\n');
          } else if (result.status !== 'skipped') {
            throw new Error('SLSA attestation verification failed for ' + archiveName + ': ' + result.reason + '. Refusing to execute binary.' + (result.stderr ? '\n--- gh stderr ---\n' + result.stderr : ''));
          } else {
            process.stderr.write('[WARN] SLSA attestation check skipped: ' + result.reason + '. Install the GitHub CLI (`gh`) to enable provenance verification. Set AGENT_ANALYZER_REQUIRE_ATTESTATION=1 to require it.\n');
          }
        } finally {
          removeTreeQuietly(attestationDir);
        }
      }
      const expectedBasename = path.basename(binaryPath);
      let scratchDir;
      try {
        scratchDir = process.platform === 'win32'
          ? await extractZipToScratch(archiveBuffer)
          : await extractTarGzToScratch(archiveBuffer);
        const extractedBinary = findFileByBasename(scratchDir, expectedBasename);
        if (!extractedBinary) {
          throw new Error('Expected binary "' + expectedBasename + '" not found inside archive ' + archiveName + '. Archive layout may have changed.');
        }
        fs.copyFileSync(extractedBinary, binaryPath);
      } finally {
        if (scratchDir) {
          removeTreeQuietly(scratchDir);
        }
      }
      if (process.platform !== 'win32') {
        fs.chmodSync(binaryPath, 493);
      }
      if (!getVersion()) {
        throw new Error(BINARY_NAME + ' was downloaded to ' + binaryPath + ' but could not be executed. Check the file is a valid binary for this platform.');
      }
      return binaryPath;
    }

    async function ensureBinary(options) {
      options = options || {};
      const version = options.version || ANALYZER_MIN_VERSION;
      const binaryPath = getBinaryPath();
      if (fs.existsSync(binaryPath) && meetsMinimumVersion(getVersion(), ANALYZER_MIN_VERSION)) {
        return binaryPath;
      }
      return downloadBinary(version, {
        skipChecksum: options.skipChecksum === true,
        skipAttestation: options.skipAttestation === true,
        requireAttestation: options.requireAttestation,
        ghRunner: options.ghRunner,
        ghProbe: options.ghProbe
      });
    }

    function ensureBinarySync(options) {
      const binaryPath = getBinaryPath();
      if (fs.existsSync(binaryPath) && meetsMinimumVersion(getVersion(), ANALYZER_MIN_VERSION)) {
        return binaryPath;
      }
      const version = options && options.version || ANALYZER_MIN_VERSION;
      const skipChecksum = Boolean(options && options.skipChecksum);
      const skipAttestation = Boolean(options && options.skipAttestation);
      const requireAttestation = options && typeof options.requireAttestation === 'boolean' ? options.requireAttestation : undefined;
      const childOptions = {version, skipChecksum, skipAttestation};
      if (requireAttestation !== undefined) {
        childOptions.requireAttestation = requireAttestation;
      }
      const script = [
        'var b = require(' + JSON.stringify(__filename) + ');',
        'b.ensureBinary(' + JSON.stringify(childOptions) + ')',
        '  .then(function(p) { process.stdout.write(p); })',
        '  .catch(function(e) { process.stderr.write(e.message); process.exit(1); });'
      ];
      try {
        return childProcess.execFileSync(process.execPath, [ '-e', script.join('\n') ], {
          encoding: 'utf8',
          stdio: [ 'pipe', 'pipe', 'inherit' ],
          timeout: 12e4
        }).trim() || binaryPath;
      } catch (error) {
        throw new Error('Failed to ensure binary (sync): ' + error.message);
      }
    }

    function runAnalyzer(args, options) {
      const binaryPath = ensureBinarySync();
      const execOptions = Object.assign({encoding: 'utf8', windowsHide: true, maxBuffer: 268435456}, options);
      if (!execOptions.stdio) {
        execOptions.stdio = [ 'pipe', 'pipe', 'pipe' ];
      }
      const output = childProcess.execFileSync(binaryPath, args, execOptions);
      return typeof output === 'string' ? output : output.toString('utf8');
    }

    async function runAnalyzerAsync(args, options) {
      const binaryPath = await ensureBinary();
      const execOptions = Object.assign({encoding: 'utf8', windowsHide: true, maxBuffer: 268435456}, options);
      return (await execFileAsync(binaryPath, args, execOptions)).stdout;
    }

    async function isAvailableAsync() {
      return isAvailable();
    }

    const binaryApi = {};
    binaryApi.ensureBinary = ensureBinary;
    binaryApi.ensureBinarySync = ensureBinarySync;
    binaryApi.runAnalyzer = runAnalyzer;
    binaryApi.runAnalyzerAsync = runAnalyzerAsync;
    binaryApi.getBinaryPath = getBinaryPath;
    binaryApi.getVersion = getVersion;
    binaryApi.getPlatformKey = getPlatformKey;
    binaryApi.isAvailable = isAvailable;
    binaryApi.isAvailableAsync = isAvailableAsync;
    binaryApi.meetsMinimumVersion = meetsMinimumVersion;
    binaryApi.buildDownloadUrl = buildDownloadUrl;
    binaryApi.PLATFORM_MAP = PLATFORM_MAP;
    binaryApi.parseSha256Sidecar = parseSha256Sidecar;
    binaryApi.verifySha256 = verifySha256;
    binaryApi.sha256Hex = sha256Hex;
    binaryApi.assertSafeArchiveEntry = assertSafeArchiveEntry;
    binaryApi.assertInsideRoot = assertInsideRoot;
    binaryApi.downloadBinary = downloadBinary;
    binaryApi.verifySlsaAttestation = verifySlsaAttestation;
    binaryApi.isGhAvailable = isGhAvailable;
    binaryApi.extractTarGzToScratch = extractTarGzToScratch;
    binaryApi.extractZipToScratch = extractZipToScratch;
    binaryApi._EXTRACT_ZIP_PS1 = EXTRACT_ZIP_PS1;
    module.exports = binaryApi;
  }
}), 
require_installer = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/installer.js'(exports, module) {
    var binaryManager = require_binary();

    async function checkInstalled() {
      if (binaryManager.isAvailable()) {
        return {found: true, version: binaryManager.getVersion(), tool: 'agent-analyzer'};
      }
      try {
        await binaryManager.ensureBinary();
        return {found: true, version: binaryManager.getVersion(), tool: 'agent-analyzer'};
      } catch (error) {
        return {found: false, error: error.message, tool: 'agent-analyzer'};
      }
    }

    function checkInstalledSync() {
      if (binaryManager.isAvailable()) {
        return {found: true, version: binaryManager.getVersion(), tool: 'agent-analyzer'};
      }
      try {
        binaryManager.ensureBinarySync();
        return {found: true, version: binaryManager.getVersion(), tool: 'agent-analyzer'};
      } catch (error) {
        return {found: false, error: error.message, tool: 'agent-analyzer'};
      }
    }

    function meetsMinimumVersion() {
      return true;
    }

    function getInstallInstructions() {
      return 'agent-analyzer is downloaded automatically on first use from https://github.com/agent-sh/agent-analyzer/releases';
    }

    function getMinimumVersion() {
      return '0.3.0';
    }

    function getCommand() {
      return null;
    }

    module.exports = {checkInstalled, checkInstalledSync, meetsMinimumVersion, getInstallInstructions, getMinimumVersion, getCommand};
  }
}), require_state_dir = __commonJS({
  '../work/agent-sh__agentsys/lib/platform/state-dir.js'(exports, module) {
    var fs = require('fs'), path = require('path'), stateDirCache = new Map;
    function isDirectory(operation423) {
      try {
        return fs.statSync(operation423).isDirectory();
      } catch {
        return !1;
      }
    }
    function getStateDir(operation429 = process.cwd()) {
      const operation853 = {};
      operation853.Yipiq = '--version', operation853.rsVZf = 'utf8';
      operation853.tuywb = 'pipe';
      {
        if (process.env.AI_STATE_DIR) {
          return process.env.AI_STATE_DIR;
        }
        const operation620 = path.resolve(operation429), operation8 = stateDirCache.get(operation620);
        if (operation8) {
          return operation8;
        }
        if (process.env.OPENCODE_CONFIG || process.env.OPENCODE_CONFIG_DIR) {
          return stateDirCache.set(operation620, '.opencode'), '.opencode';
        }
        try {
          if (isDirectory(path.join(operation429, '.opencode'))) {
            return stateDirCache.set(operation620, '.opencode'), '.opencode';
          }
        } catch {}
        if (process.env.CODEX_HOME) {
          return stateDirCache.set(operation620, '.codex'), '.codex';
        }
        try {
          if (isDirectory(path.join(operation429, '.codex'))) {
            return stateDirCache.set(operation620, '.codex'), '.codex';
          }
        } catch {}
        return stateDirCache.set(operation620, '.claude'), '.claude';
      }
    }
    const stateDirApi = {};
    stateDirApi.getStateDir = getStateDir, stateDirApi.getStateDirPath = function getStateDirPath(operation154 = process.cwd()) {
      return path.join(operation154, getStateDir(operation154));
    }, stateDirApi.getPlatformName = function getPlatformName(operation631 = process.cwd()) {
      const operation144 = getStateDir(operation631);
      if (process.env.AI_STATE_DIR) {
        return 'custom';
      }
      switch (operation144) {
       case '.opencode':
        return 'opencode';

       case '.codex':
        return 'codex';

       case '.claude':
        return 'claude';

       default:
        return 'unknown';
      }
    }, stateDirApi.clearCache = function clearCache() {
      stateDirCache.clear();
    }, module.exports = stateDirApi;
  }
}), require_atomic_write = __commonJS({
  '../work/agent-sh__agentsys/lib/utils/atomic-write.js'(exports, module) {
    var fs = require('fs'), path = require('path'), crypto = require('crypto');
    function getTempPath(operation251) {
      const operation107 = path.dirname(operation251), operation558 = path.basename(operation251), operation669 = crypto.randomBytes(6).toString('hex');
      return path.join(operation107, '.' + operation558 + '.' + operation669 + '.tmp');
    }
    function writeFileAtomic(operation329, operation862, operation344 = {}) {
      {
        const {encoding = 'utf8', mode = 420} = operation344, operation31 = path.dirname(operation329);
        if (!fs.existsSync(operation31)) {
          const operation363 = {};
          operation363.recursive = !0, fs.mkdirSync(operation31, operation363);
        }
        const operation205 = getTempPath(operation329);
        try {
          {
            const operation445 = {};
            return operation445.encoding = encoding, operation445.mode = mode, fs.writeFileSync(operation205, operation862, operation445), 
            fs.renameSync(operation205, operation329), !0;
          }
        } catch (operation101) {
          try {
            fs.existsSync(operation205) && fs.unlinkSync(operation205);
          } catch {}
          throw operation101;
        }
      }
    }
    const atomicWriteApi = {};
    atomicWriteApi.writeFileAtomic = writeFileAtomic, atomicWriteApi.writeJsonAtomic = function writeJsonAtomic(operation601, operation756, operation708 = {}) {
      {
        const {indent = 2, ...operation811} = operation708;
        return writeFileAtomic(operation601, JSON.stringify(operation756, null, indent), operation811);
      }
    }, atomicWriteApi.getTempPath = getTempPath, module.exports = atomicWriteApi;
  }
}), require_cache = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/cache.js'(exports, module) {
    var fs = require('fs'), path = require('path'), {getStateDirPath} = require_state_dir(), {writeJsonAtomic, writeFileAtomic} = require_atomic_write();
    function getMapPath(operation471) {
      return path.join(getStateDirPath(operation471), 'repo-map.json');
    }
    function getStaleMarkerPath(operation248) {
      return path.join(getStateDirPath(operation248), 'repo-map.stale');
    }
    function ensureStateDir(operation188) {
      {
        const operation320 = getStateDirPath(operation188);
        if (!fs.existsSync(operation320)) {
          const operation463 = {};
          operation463.recursive = !0, fs.mkdirSync(operation320, operation463);
        }
        return operation320;
      }
    }
    function load(operation827) {
      {
        const operation689 = getMapPath(operation827);
        if (!fs.existsSync(operation689)) {
          return null;
        }
        try {
          {
            const operation871 = fs.readFileSync(operation689, 'utf8');
            return JSON.parse(operation871);
          }
        } catch {
          return null;
        }
      }
    }
    function clearStale(operation828) {
      const operation415 = getStaleMarkerPath(operation828);
      fs.existsSync(operation415) && fs.unlinkSync(operation415);
    }
    const cacheApi = {};
    cacheApi.load = load, cacheApi.save = function save(operation644, operation499) {
      ensureStateDir(operation644);
      const operation547 = getMapPath(operation644), operation530 = {
        ...operation499,
        'updated': (new Date).toISOString()
      };
      writeJsonAtomic(operation547, operation530), clearStale(operation644);
    }, cacheApi.exists = function exists(operation249) {
      return fs.existsSync(getMapPath(operation249));
    };
    cacheApi.getStatus = function getStatus(operation9) {
      {
        const operation770 = load(operation9);
        return operation770 ? {
          'generated': operation770.generated,
          'updated': operation770.updated,
          'commit': operation770.git?.commit,
          'branch': operation770.git?.branch,
          'files': Object.keys(operation770.files || {}).length,
          'symbols': operation770.stats?.totalSymbols || 0,
          'languages': operation770.project?.languages || []
        } : null;
      }
    }, cacheApi.getMapPath = getMapPath, cacheApi.getPath = function getPath(operation723) {
      return path.join(getStateDirPath(operation723), 'repo-intel.json');
    }, cacheApi.getStateDirPath = getStateDirPath, cacheApi.markStale = function markStale(operation572) {
      ensureStateDir(operation572), writeFileAtomic(getStaleMarkerPath(operation572), (new Date).toISOString());
    }, cacheApi.clearStale = clearStale, cacheApi.isMarkedStale = function isMarkedStale(operation197) {
      return fs.existsSync(getStaleMarkerPath(operation197));
    }, module.exports = cacheApi;
  }
}), require_updater = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/updater.js'(exports, module) {
    var {execFileSync} = require('child_process'), cache = require_cache();
    function isValidCommitHash(operation185) {
      return 'string' == typeof operation185 && /^[0-9a-fA-F]{4,40}$/.test(operation185);
    }
    const updaterApi = {};
    updaterApi.checkStaleness = function checkStaleness(operation475, operation464) {
      {
        const operation509 = {};
        operation509.isStale = !1, operation509.reason = null, operation509.commitsBehind = 0, 
        operation509.suggestFullRebuild = !1;
        const operation855 = operation509;
        if (!operation464?.git?.commit) {
          return operation855.isStale = !0, operation855.reason = 'Missing base commit in repo-map', 
          operation855.suggestFullRebuild = !0, operation855;
        }
        cache.isMarkedStale(operation475) && (operation855.isStale = !0, operation855.reason = 'Marked stale by hook');
        if (!function commitExists(operation346, operation591) {
          if (!isValidCommitHash(operation591)) {
            return !1;
          }
          try {
            return execFileSync('git', [ 'cat-file', '-e', operation591 ], {
              'cwd': operation346,
              'stdio': [ 'pipe', 'pipe', 'pipe' ]
            }), !0;
          } catch {
            return !1;
          }
        }(operation475, operation464.git.commit)) {
          return operation855.isStale = !0, operation855.reason = 'Base commit no longer exists (rebased?)', 
          operation855.suggestFullRebuild = !0, operation855;
        }
        const operation141 = function getCurrentBranch(operation438) {
          try {
            return execFileSync('git', [ 'rev-parse', '--abbrev-ref', 'HEAD' ], {
              'cwd': operation438,
              'encoding': 'utf8',
              'stdio': [ 'pipe', 'pipe', 'pipe' ]
            }).trim();
          } catch {
            return null;
          }
        }(operation475);
        operation141 && operation464.git.branch && operation141 !== operation464.git.branch && (operation855.isStale = !0, 
        operation855.reason = 'Branch changed from ' + operation464.git.branch + ' to ' + operation141, 
        operation855.suggestFullRebuild = !0);
        const operation541 = function countCommitsBehindHead(operation129, operation500) {
          if (!(operation343 = isValidCommitHash, operation629 = operation500, operation343(operation629))) {
            return 0;
          }
          try {
            const operation436 = (operation291 = execFileSync, operation69 = [ 'rev-list', operation500 + '..HEAD', '--count' ], 
            operation25 = {
              'cwd': operation129,
              'encoding': 'utf8',
              'stdio': [ 'pipe', 'pipe', 'pipe' ]
            }, operation291('git', operation69, operation25)).trim();
            return Number(operation436) || 0;
          } catch {
            return 0;
          }
          var operation291, operation69, operation25;
          var operation343, operation629;
        }(operation475, operation464.git.commit);
        if (operation541 > 0) {
          operation855.isStale = !0, operation855.commitsBehind = operation541;
          operation855.reason || (operation855.reason = operation541 + ' commits behind HEAD');
        }
        return operation855;
      }
    }, module.exports = updaterApi;
  }
}), require_converter = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/converter.js'(exports, module) {
    var path = require('path');
    const operation286 = {};
    operation286['.js'] = 'javascript', operation286['.jsx'] = 'javascript', operation286['.mjs'] = 'javascript', 
    operation286['.cjs'] = 'javascript', operation286['.ts'] = 'typescript';
    operation286['.tsx'] = 'typescript', operation286['.mts'] = 'typescript', operation286['.cts'] = 'typescript', 
    operation286['.py'] = 'python', operation286['.pyw'] = 'python', operation286['.rs'] = 'rust', 
    operation286['.go'] = 'go', operation286['.java'] = 'java';
    var EXTENSION_LANGUAGES = operation286, CLASS_KINDS = new Set([ 'class', 'struct', 'interface', 'enum', 'impl' ]), TYPE_KINDS = new Set([ 'trait', 'type-alias' ]), FUNCTION_KINDS = new Set([ 'method', 'arrow', 'closure' ]), CONSTANT_KINDS = new Set([ 'constant', 'variable', 'const', 'field', 'property' ]);
    function detectLanguage(operation593) {
      return EXTENSION_LANGUAGES[path.extname(operation593).toLowerCase()] || 'unknown';
    }
    function collectLanguages(operation259) {
      const operation661 = new Set;
      for (const operation546 of operation259) {
        const operation57 = detectLanguage(operation546);
        'unknown' !== operation57 && operation661.add(operation57);
      }
      return Array.from(operation661);
    }
    function convertFile(operation56, operation703) {
      const operation201 = new Set((operation703.exports || []).map((operation146 => operation146.name))), operation533 = (operation703.exports || []).map((operation448 => ({
        'name': operation448.name,
        'kind': operation448.kind,
        'line': operation448.line
      }))), operation454 = [], operation668 = [], operation6 = [], operation29 = [];
      for (const operation841 of operation703.definitions || []) {
        const operation615 = {
          'name': operation841.name,
          'kind': operation841.kind,
          'line': operation841.line,
          'exported': operation201.has(operation841.name)
        };
        'function' === operation841.kind || FUNCTION_KINDS.has(operation841.kind) ? operation454.push(operation615) : CLASS_KINDS.has(operation841.kind) ? operation668.push(operation615) : TYPE_KINDS.has(operation841.kind) ? operation6.push(operation615) : (CONSTANT_KINDS.has(operation841.kind), 
        operation29.push(operation615));
      }
      const operation630 = (operation703.imports || []).map((operation678 => ({
        'source': operation678.from,
        'kind': 'import',
        'names': operation678.names || []
      }))), operation80 = {};
      operation80.exports = operation533, operation80.functions = operation454, operation80.classes = operation668;
      operation80.types = operation6;
      return operation80.constants = operation29, {
        'language': (operation42 = detectLanguage, operation878 = operation56, operation42(operation878)),
        'symbols': operation80,
        'imports': operation630
      };
      var operation42, operation878;
    }
    const converterApi = {};
    converterApi.convertIntelToRepoMap = function convertIntelToRepoMap(operation433) {
      const operation315 = {};
      let operation235 = 0;
      let operation524 = 0;
      for (const [operation506, operation664] of Object.entries(operation433.symbols || {})) {
        operation315[operation506] = convertFile(operation506, operation664);
        const operation424 = operation315[operation506].symbols;
        operation235 += operation424.functions.length + operation424.classes.length + operation424.types.length + operation424.constants.length, 
        operation524 += operation315[operation506].imports.length;
      }
      return {
        'version': '2.0',
        'generated': operation433.generated || (new Date).toISOString(),
        'git': operation433.git ? {
          'commit': operation433.git.analyzedUpTo
        } : void 0,
        'project': {
          'languages': (operation784 = collectLanguages, operation848 = Object.keys(operation315), 
          operation784(operation848))
        },
        'stats': {
          'totalFiles': Object.keys(operation315).length,
          'totalSymbols': operation235,
          'totalImports': operation524,
          'errors': []
        },
        'files': operation315
      };
      var operation784, operation848;
    }, converterApi.convertFile = convertFile, converterApi.detectLanguage = detectLanguage, 
    module.exports = converterApi;
  }
}), require_queries = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/queries.js'(exports, module) {
    var fs = require('fs'), path = require('path'), {getStateDir} = require_state_dir(), binaryManager = require_binary(), RepoIntelMissingError = class extends Error {
      constructor(operation67) {
        super('repo-intel map not found at ' + operation67 + '. Run `agentsys repo-intel update` to generate it first.'), 
        this.name = 'RepoIntelMissingError';
        this.code = 'REPO_INTEL_MISSING', this.mapFile = operation67;
      }
    };
    function requireRepoIntelMap(operation455) {
      {
        const operation271 = function getRepoIntelMapPath(operation64) {
          const operation194 = getStateDir(operation64);
          return path.join(operation64, operation194, 'repo-intel.json');
        }(operation455);
        if (!fs.existsSync(operation271)) {
          throw new RepoIntelMissingError(operation271);
        }
        return operation271;
      }
    }
    function runJsonQuery(operation27, operation252, operation851) {
      const operation598 = [ 'repo-intel', 'query', operation27, ...operation252, '--map-file', requireRepoIntelMap(operation851), operation851 ];
      let operation711;
      try {
        operation711 = binaryManager.runAnalyzer(operation598);
      } catch (operation697) {
        throw new Error('repo-intel query failed [' + operation27 + ']: ' + operation697.message, {
          'cause': operation697
        });
      }
      let operation280;
      try {
        operation280 = JSON.parse(operation711);
      } catch (operation273) {
        const operation352 = operation711.slice(0, 200);
        throw new Error('repo-intel query [' + operation27 + '] returned non-JSON output: ' + operation352);
      }
      return operation280;
    }
    function assertNonEmptyString(operation149, operation140) {
      if ('string' != typeof operation149 || 0 === operation149.length) {
        throw new TypeError(operation140 + ' must be a non-empty string');
      }
    }
    const queriesApi = {};
    queriesApi.RepoIntelMissingError = RepoIntelMissingError, queriesApi.hotspots = function hotspots(operation594, operation715 = {}) {
      {
        const operation307 = [];
        null != operation715.limit && operation307.push('--top', String(operation715.limit));
        return runJsonQuery('hotspots', operation307, operation594);
      }
    }, queriesApi.coupling = function coupling(operation745, operation494, operation626 = {}) {
      assertNonEmptyString(operation494, 'coupling: file');
      const operation430 = [ operation494 ];
      null != operation626.limit && operation430.push('--top', String(operation626.limit));
      return runJsonQuery('coupling', operation430, operation745);
    }, queriesApi.busFactor = function busFactor(operation817, operation539 = {}) {
      const operation649 = [];
      operation539.adjustForAi && operation649.push('--adjust-for-ai');
      null != operation539.limit && operation649.push('--top', String(operation539.limit));
      return runJsonQuery('bus-factor', operation649, operation817);
    }, queriesApi.testGaps = function testGaps(operation39, operation477 = {}) {
      {
        const operation614 = [];
        null != operation477.limit && operation614.push('--top', String(operation477.limit));
        null != operation477.minChanges && operation614.push('--min-changes', String(operation477.minChanges));
        return runJsonQuery('test-gaps', operation614, operation39);
      }
    }, queriesApi.diffRisk = function diffRisk(operation245, operation683) {
      if (!Array.isArray(operation683)) {
        throw new TypeError('diffRisk: files must be an array of strings');
      }
      if (!operation683.every((operation353 => 'string' == typeof operation353))) {
        throw new TypeError('diffRisk: all entries in files must be strings');
      }
      const operation699 = operation683.join(',');
      if (operation699.length > 3e4) {
        throw new RangeError('diffRisk: files argument exceeds 30000 character limit (got ' + operation699.length + ')');
      }
      return runJsonQuery('diff-risk', [ '--files', operation699 ], operation245);
    }, queriesApi.dependents = function dependents(operation162, operation227, operation517) {
      {
        assertNonEmptyString(operation227, 'dependents: symbol');
        const operation208 = [ operation227 ];
        null != operation517 && (assertNonEmptyString(operation517, 'dependents: file'), 
        operation208.push('--file', operation517));
        return runJsonQuery('dependents', operation208, operation162);
      }
    }, queriesApi.bugspots = function bugspots(operation812, operation485 = {}) {
      {
        const operation875 = [];
        null != operation485.limit && operation875.push('--top', String(operation485.limit));
        return runJsonQuery('bugspots', operation875, operation812);
      }
    }, queriesApi.health = function health(operation618) {
      return runJsonQuery('health', [], operation618);
    }, queriesApi.communities = function communities(operation774) {
      return runJsonQuery('communities', [], operation774);
    }, queriesApi.boundaries = function boundaries(operation14, operation647 = {}) {
      {
        const operation867 = [];
        null != operation647.limit && operation867.push('--top', String(operation647.limit));
        return runJsonQuery('boundaries', operation867, operation14);
      }
    }, queriesApi.areaOf = function areaOf(operation749, operation186) {
      return assertNonEmptyString(operation186, 'areaOf: file'), runJsonQuery('area-of', [ operation186 ], operation749);
    }, queriesApi.communityHealth = function communityHealth(operation763, operation469) {
      if ('number' != typeof operation469 || !Number.isInteger(operation469) || operation469 < 0) {
        throw new TypeError('communityHealth: id must be a non-negative integer');
      }
      return runJsonQuery('community-health', [ String(operation469) ], operation763);
    }, queriesApi.coldspots = function coldspots(operation289, operation7 = {}) {
      const operation466 = [];
      null != operation7.limit && operation466.push('--top', String(operation7.limit));
      return runJsonQuery('coldspots', operation466, operation289);
    }, queriesApi.ownership = function ownership(operation667, operation170) {
      return assertNonEmptyString(operation170, 'ownership: file'), runJsonQuery('ownership', [ operation170 ], operation667);
    }, queriesApi.norms = function norms(operation583) {
      return runJsonQuery('norms', [], operation583);
    }, queriesApi.areas = function areas(operation416) {
      return runJsonQuery('areas', [], operation416);
    }, queriesApi.contributors = function contributors(operation60, operation270 = {}) {
      {
        const operation100 = [];
        null != operation270.limit && operation100.push('--top', String(operation270.limit));
        return runJsonQuery('contributors', operation100, operation60);
      }
    }, queriesApi.releaseInfo = function releaseInfo(operation645) {
      return runJsonQuery('release-info', [], operation645);
    }, queriesApi.fileHistory = function fileHistory(operation62, operation244) {
      return assertNonEmptyString(operation244, 'fileHistory: file'), runJsonQuery('file-history', [ operation244 ], operation62);
    };
    queriesApi.conventions = function conventions(operation355) {
      return runJsonQuery('conventions', [], operation355);
    }, queriesApi.docDrift = function docDrift(operation68, operation358 = {}) {
      const operation54 = [];
      null != operation358.limit && operation54.push('--top', String(operation358.limit));
      return runJsonQuery('doc-drift', operation54, operation68);
    }, queriesApi.onboard = function onboard(operation262) {
      return runJsonQuery('onboard', [], operation262);
    }, queriesApi.canIHelp = function canIHelp(operation309) {
      return runJsonQuery('can-i-help', [], operation309);
    }, queriesApi.painspots = function painspots(operation313, operation22 = {}) {
      const operation613 = [];
      null != operation22.limit && operation613.push('--top', String(operation22.limit));
      return runJsonQuery('painspots', operation613, operation313);
    }, queriesApi.entryPoints = function entryPoints(operation81, operation426 = {}) {
      {
        const operation98 = [];
        if (operation426.files) {
          const operation621 = Array.isArray(operation426.files) ? operation426.files.join(',') : String(operation426.files);
          operation98.push('--files', operation621);
        }
        return runJsonQuery('entry-points', operation98, operation81);
      }
    }, queriesApi.projectInfo = function projectInfo(operation507) {
      return runJsonQuery('project-info', [], operation507);
    }, queriesApi.symbols = function symbols(operation651, operation459) {
      return assertNonEmptyString(operation459, 'symbols: file'), runJsonQuery('symbols', [ operation459 ], operation651);
    }, queriesApi.staleDocs = function staleDocs(operation818, operation182 = {}) {
      {
        const operation314 = [];
        null != operation182.limit && operation314.push('--top', String(operation182.limit));
        return runJsonQuery('stale-docs', operation314, operation818);
      }
    }, queriesApi.find = function find(operation548, operation596, operation865 = {}) {
      assertNonEmptyString(operation596, 'find: query');
      const operation412 = [ operation596 ];
      null != operation865.limit && operation412.push('--top', String(operation865.limit));
      return runJsonQuery('find', operation412, operation548);
    }, queriesApi.slopFixes = function slopFixes(operation874) {
      return runJsonQuery('slop-fixes', [], operation874);
    }, queriesApi.slopTargets = function slopTargets(operation826, operation439 = {}) {
      {
        const operation781 = [];
        null != operation439.top && operation781.push('--top', String(operation439.top));
        return runJsonQuery('slop-targets', operation781, operation826);
      }
    }, queriesApi.summary = function summary(operation482, operation106 = {}) {
      {
        const operation136 = requireRepoIntelMap(operation482), operation308 = [];
        null != operation106.depth && operation308.push('--depth', String(operation106.depth));
        const operation348 = [ 'repo-intel', 'query', 'summary', ...operation308, '--map-file', operation136, operation482 ];
        let operation461;
        try {
          operation461 = binaryManager.runAnalyzer(operation348).trim();
        } catch (operation44) {
          throw new Error('repo-intel query failed [summary]: ' + operation44.message, {
            'cause': operation44
          });
        }
        if ('null' === operation461) {
          return null;
        }
        if (null != operation106.depth) {
          return operation461;
        }
        try {
          return JSON.parse(operation461);
        } catch (operation797) {
          throw new Error('repo-intel query [summary] returned non-JSON output: ' + operation461.slice(0, 200));
        }
      }
    }, module.exports = queriesApi;
  }
}), require_preference = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/embed/preference.js'(exports, module) {
    var fs = require('fs'), path = require('path');
    var stateDir = require_cache(), VALID_EMBEDDER = [ 'none', 'small', 'big' ], VALID_DETAIL = [ 'compact', 'balanced', 'maximum' ];
    function preferencePath(operation215) {
      return path.join(stateDir.getStateDirPath(operation215), 'sources', 'preference.json');
    }
    function readPreference(operation431) {
      {
        const operation89 = preferencePath(operation431);
        if (!fs.existsSync(operation89)) {
          return {};
        }
        try {
          {
            const operation529 = JSON.parse(fs.readFileSync(operation89, 'utf8'));
            return operation529 && 'object' == typeof operation529 ? operation529 : {};
          }
        } catch (operation688) {
          return {};
        }
      }
    }
    const preferenceApi = {};
    preferenceApi.read = readPreference, preferenceApi.update = function updatePreference(operation701, operation277) {
      {
        const operation449 = readPreference(operation701), operation492 = Object.assign({}, operation449, operation277 || {}), operation504 = preferencePath(operation701), operation402 = {};
        return operation402.recursive = !0, fs.mkdirSync(path.dirname(operation504), operation402), 
        fs.writeFileSync(operation504, JSON.stringify(operation492, null, 2)), operation492;
      }
    }, preferenceApi.reset = function resetPreference(operation458) {
      const operation175 = readPreference(operation458);
      delete operation175.embedder, delete operation175.embedderDetail;
      const operation58 = preferencePath(operation458), operation158 = {};
      operation158.recursive = !0, fs.mkdirSync(path.dirname(operation58), operation158), 
      fs.writeFileSync(operation58, JSON.stringify(operation175, null, 2));
    }, preferenceApi.hasEmbedderChoice = function hasEmbedderChoice(operation725) {
      {
        const operation807 = readPreference(operation725);
        return VALID_EMBEDDER.includes(operation807.embedder);
      }
    }, preferenceApi.hasDetailChoice = function hasDetailChoice(operation580) {
      {
        const operation226 = readPreference(operation580);
        return VALID_DETAIL.includes(operation226.embedderDetail);
      }
    }, preferenceApi.detailToCliArg = function detailToCliArg(operation559) {
      switch (operation559) {
       case 'compact':
        return 'compact';

       case 'maximum':
        return 'maximum';

       default:
        return 'balanced';
      }
    }, preferenceApi.preferencePath = preferencePath, preferenceApi.VALID_EMBEDDER = VALID_EMBEDDER, 
    preferenceApi.VALID_DETAIL = VALID_DETAIL, module.exports = preferenceApi;
  }
}), require_shared_helpers = __commonJS({
  '../work/agent-sh__agentsys/lib/binary/shared-helpers.js'(exports, module) {
    var fs = require('fs'), path = require('path'), os = require('os'), https = require('https'), childProcess = require('child_process');
    const sharedBinaryHelpers = {};
    sharedBinaryHelpers.downloadToBuffer = function downloadToBuffer(operation767, operation447) {
      {
        const operation729 = operation447 || {}, operation242 = operation729.userAgent || 'agent-sh/binary-resolver', operation451 = operation729.timeoutMs || 3e4;
        return new Promise((function(operation217, operation877) {
          {
            const operation679 = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
            function fetchWithRedirects(operation310, operation97) {
              if (operation97 > 5) {
                operation877(new Error('Too many redirects fetching from ' + operation767));
                return;
              }
              const operation179 = {};
              operation179['User-Agent'] = operation242, operation179.Accept = 'application/octet-stream';
              const operation11 = operation179;
              operation679 && (operation11.Authorization = 'Bearer ' + operation679);
              const operation637 = {};
              operation637.headers = operation11;
              operation637.timeout = operation451;
              const operation538 = https.get(operation310, operation637, (function(operation481) {
                const operation269 = operation481.statusCode;
                if (301 === operation269 || 302 === operation269 || 307 === operation269 || 308 === operation269) {
                  operation481.resume();
                  var operation844 = operation481.headers.location;
                  if (operation844 && !operation844.startsWith('https://')) {
                    operation877(new Error('Refusing non-HTTPS redirect to ' + operation844));
                    return;
                  }
                  fetchWithRedirects(operation844, operation97 + 1);
                  return;
                }
                if (200 !== operation269) {
                  operation481.resume();
                  operation877(new Error('HTTP ' + operation269 + (403 === operation269 ? ' (rate limited - set GITHUB_TOKEN env var)' : '') + ' fetching ' + operation310));
                  return;
                }
                const operation495 = [];
                operation481.on('data', (function(operation754) {
                  operation495.push(operation754);
                }));
                operation481.on('end', (function() {
                  operation217(Buffer.concat(operation495));
                })), operation481.on('error', operation877);
              }));
              operation538.on('error', operation877), operation538.on('timeout', (function() {
                operation538.destroy(), operation877(new Error('Timeout (' + operation451 + 'ms) fetching ' + operation310));
              }));
            }
            fetchWithRedirects(operation767, 0);
          }
        }));
      }
    }, sharedBinaryHelpers.extractTarGz = function extractTarGz(operation625, operation139) {
      return new Promise((function(operation74, operation167) {
        const operation609 = 'win32' === process.platform ? operation139.replace(/\\/g, '/') : operation139, operation406 = childProcess.spawn('tar', [ 'xz', '-C', operation609 ], {
          'stdio': [ 'pipe', 'pipe', 'pipe' ]
        });
        let operation51 = '';
        operation406.stderr.on('data', (function(operation41) {
          operation51 += operation41;
        })), operation406.stdin.write(operation625), operation406.stdin.end();
        operation406.on('close', (function(operation198) {
          0 !== operation198 ? operation167(new Error('tar extraction failed (code ' + operation198 + '): ' + operation51)) : operation74();
        })), operation406.on('error', operation167);
      }));
    }, sharedBinaryHelpers.extractZip = function extractZip(operation650, operation753, operation305) {
      return new Promise((function(operation543, operation134) {
        var operation570 = fs.mkdtempSync(path.join(os.tmpdir(), operation305 + '-')), operation359 = path.join(operation570, 'archive.zip');
        fs.writeFileSync(operation359, operation650);
        var operation858 = childProcess.spawn('powershell', [ '-NoProfile', '-NonInteractive', '-Command', 'Expand-Archive', '-Path', operation359, '-DestinationPath', operation753, '-Force' ], {
          'stdio': [ 'ignore', 'pipe', 'pipe' ]
        }), operation65 = '';
        operation858.stderr.on('data', (function(operation260) {
          operation65 += operation260;
        })), operation858.on('close', (function(operation792) {
          try {
            {
              const operation335 = {};
              operation335.recursive = !0, operation335.force = !0, fs.rmSync(operation570, operation335);
            }
          } catch (operation503) {}
          0 !== operation792 ? operation134(new Error('zip extraction failed (code ' + operation792 + '): ' + operation65)) : operation543();
        })), operation858.on('error', operation134);
      }));
    }, sharedBinaryHelpers.DEFAULT_DOWNLOAD_TIMEOUT_MS = 3e4, module.exports = sharedBinaryHelpers;
  }
}), require_binary2 = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/embed/binary.js'(exports, module) {
    var fs = require('fs'), path = require('path'), os = require('os'), https = require('https'), childProcess = require('child_process'), baseBinary = require_binary(), sharedBinaryHelpers = require_shared_helpers();
    var PLATFORM_MAP = baseBinary.PLATFORM_MAP;
    function getBinaryPath() {
      const operation347 = 'win32' === process.platform ? '.exe' : '';
      return path.join(os.homedir(), '.agent-sh', 'bin', 'agent-analyzer-embed' + operation347);
    }
    function getBundledOrtName() {
      return 'win32' === process.platform ? 'onnxruntime.dll' : 'darwin' === process.platform ? 'libonnxruntime.dylib' : 'libonnxruntime.so';
    }
    function getBundledOrtPath() {
      return path.join(path.dirname(getBinaryPath()), getBundledOrtName());
    }
    function platformBundlesOrt() {
      {
        const operation396 = getPlatformKey();
        return !!operation396 && !operation396.includes('musl');
      }
    }
    function getPlatformKey() {
      const operation401 = process.platform + '-' + process.arch;
      return PLATFORM_MAP[operation401] || null;
    }
    var latestReleaseCache = null;
    async function getLatestReleaseVersion() {
      return latestReleaseCache && Date.now() - latestReleaseCache.fetchedAt < 36e5 ? latestReleaseCache.version : new Promise((function(operation795, operation803) {
        {
          const operation562 = process.env.GITHUB_TOKEN || process.env.GH_TOKEN, operation730 = {};
          operation730['User-Agent'] = 'agent-sh/embed-resolver', operation730.Accept = 'application/vnd.github+json';
          const operation61 = operation730;
          operation562 && (operation61.Authorization = 'Bearer ' + operation562);
          const operation582 = 'https://api.github.com/repos/agent-sh/agent-analyzer/releases/latest', rejectLatestReleaseFetch = function(operation219) {
            operation803(new Error(operation219 + ' fetching ' + operation582));
          }, operation694 = {};
          operation694.headers = operation61, operation694.timeout = 5e3;
          const operation378 = https.get(operation582, operation694, (function(operation508) {
            {
              if (200 !== operation508.statusCode) {
                operation508.resume(), rejectLatestReleaseFetch('HTTP ' + operation508.statusCode);
                return;
              }
              const operation704 = [];
              operation508.on('data', (function(operation799) {
                operation704.push(operation799);
              })), operation508.on('end', (function() {
                try {
                  {
                    const operation840 = JSON.parse(Buffer.concat(operation704).toString('utf8')), operation281 = (operation840 && operation840.tag_name || '').replace(/^v/, '');
                    /^\d+\.\d+\.\d+/.test(operation281) ? (latestReleaseCache = {
                      'version': operation281,
                      'fetchedAt': Date.now()
                    }, operation795(operation281)) : rejectLatestReleaseFetch('No valid release tag');
                  }
                } catch (operation514) {
                  rejectLatestReleaseFetch('Failed to parse release JSON: ' + operation514.message);
                }
              })), operation508.on('error', (function(operation102) {
                rejectLatestReleaseFetch(operation102.message);
              }));
            }
          }));
          operation378.on('error', (function(operation564) {
            rejectLatestReleaseFetch(operation564.message);
          })), operation378.on('timeout', (function() {
            operation378.destroy();
            rejectLatestReleaseFetch('Timeout');
          }));
        }
      }));
    }
    function buildDownloadUrl(operation849, operation859) {
      return 'https://github.com/agent-sh/agent-analyzer/releases/download/v' + operation849 + '/agent-analyzer-embed-' + operation859 + ('win32' === process.platform ? '.zip' : '.tar.gz');
    }
    function downloadReleaseAsset(operation755) {
      {
        const operation717 = {};
        return operation717.userAgent = 'agent-sh/embed-resolver', sharedBinaryHelpers.downloadToBuffer(operation755, operation717);
      }
    }
    var extractTarGz = sharedBinaryHelpers.extractTarGz, extractZip = sharedBinaryHelpers.extractZip;
    async function downloadAndInstall(operation92) {
      const operation327 = getPlatformKey();
      if (!operation327) {
        throw new Error('Unsupported platform: ' + process.platform + '-' + process.arch + '. Supported: ' + Object.keys(PLATFORM_MAP).join(', '));
      }
      const operation603 = buildDownloadUrl(operation92, operation327);
      process.stderr.write('Downloading agent-analyzer-embed v' + operation92 + ' for ' + operation327 + '...\n');
      const operation168 = getBinaryPath(), operation30 = path.dirname(operation168), operation457 = {};
      operation457.recursive = !0, fs.mkdirSync(operation30, operation457);
      let operation202;
      try {
        operation202 = await (operation50 = downloadReleaseAsset, operation512 = operation603, 
        operation50(operation512));
      } catch (operation55) {
        throw new Error('Failed to download agent-analyzer-embed:\n  URL: ' + operation603 + '\n  Error: ' + operation55.message + '\n\nTo install manually:\n  1. Download: ' + operation603 + '\n  2. Extract the binary to: ' + operation30 + '\n  3. Ensure it is named: ' + path.basename(operation168));
      }
      var operation50, operation512;
      'win32' === process.platform ? await (operation595 = extractZip, operation695 = operation202, 
      operation192 = operation30, operation145 = path.basename(operation168), operation595(operation695, operation192, operation145)) : await extractTarGz(operation202, operation30);
      var operation595, operation695, operation192, operation145;
      return 'win32' !== process.platform && fs.chmodSync(operation168, 493), operation168;
    }
    const embedBinaryApi = {};
    embedBinaryApi.EMBED_BINARY_NAME = 'agent-analyzer-embed', embedBinaryApi.getBinaryPath = getBinaryPath, 
    embedBinaryApi.getBundledOrtName = getBundledOrtName, embedBinaryApi.getBundledOrtPath = getBundledOrtPath, 
    embedBinaryApi.platformBundlesOrt = platformBundlesOrt, embedBinaryApi.getVersion = function getInstalledVersion() {
      {
        const operation479 = getBinaryPath();
        if (!fs.existsSync(operation479)) {
          return null;
        }
        try {
          {
            const operation674 = childProcess.execFileSync(operation479, [ '--version' ], {
              'timeout': 5e3,
              'encoding': 'utf8',
              'stdio': [ 'pipe', 'pipe', 'pipe' ],
              'windowsHide': !0
            }), operation510 = operation674.trim().match(/(\d+\.\d+\.\d+)/);
            return operation510 ? operation510[1] : operation674.trim();
          }
        } catch (operation223) {
          return null;
        }
      }
    }, embedBinaryApi.getPlatformKey = getPlatformKey, embedBinaryApi.getLatestReleaseVersion = getLatestReleaseVersion, 
    embedBinaryApi.isAvailable = function isAvailable() {
      return fs.existsSync(getBinaryPath());
    }, embedBinaryApi.ensureBinary = async function ensureBinary(operation550) {
      {
        const operation762 = operation550 || {}, operation735 = getBinaryPath();
        return fs.existsSync(operation735) ? platformBundlesOrt() && !fs.existsSync((operation741 = getBundledOrtPath, 
        operation741())) ? downloadAndInstall(operation762.version || await (operation342 = getLatestReleaseVersion, 
        operation342())) : operation735 : downloadAndInstall(operation762.version || await (operation298 = getLatestReleaseVersion, 
        operation298()));
      }
      var operation298;
      var operation342;
      var operation741;
    }, embedBinaryApi.buildDownloadUrl = buildDownloadUrl, module.exports = embedBinaryApi;
  }
}), require_orchestrator = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/embed/orchestrator.js'(exports, module) {
    var fs = require('fs'), path = require('path'), childProcess = require('child_process'), preference = require_preference(), embedBinary = require_binary2(), analyzerBinary = require_binary(), cache = require_cache();
    function isEnabled(operation552) {
      const operation786 = preference.read(operation552);
      return 'small' === operation786.embedder || 'big' === operation786.embedder;
    }
    function streamEmbedToSetEmbeddings(operation53, operation602, operation243, operation876) {
      return new Promise((function(operation748, operation150) {
        {
          const operation776 = {};
          operation776.stdio = [ 'ignore', 'pipe', 'pipe' ], operation776.windowsHide = !0;
          const operation88 = childProcess.spawn(operation53, operation602, operation776), operation178 = childProcess.spawn(operation243, [ 'repo-intel', 'set-embeddings', '--map-file', operation876, '--input', '-' ], {
            'stdio': [ 'pipe', 'pipe', 'pipe' ],
            'windowsHide': !0
          });
          let operation544 = null, operation850 = null, operation752 = !1, operation33 = '', operation257 = '', operation428 = '';
          function finishOnce(operation880, operation350) {
            if (!operation752) {
              operation752 = !0;
              if (operation880) {
                try {
                  operation88.kill('SIGTERM');
                } catch (operation527) {}
                try {
                  operation178.kill('SIGTERM');
                } catch (operation722) {}
                operation150(operation880);
              } else {
                operation748(operation350);
              }
            }
          }
          function finishWhenBothClosed() {
            if (operation752 || null === operation544 || null === operation850) {
              return;
            }
            if (0 !== operation544) {
              return finishOnce(new Error(embedBinary.EMBED_BINARY_NAME + ' exited ' + operation544 + (operation257.trim() ? ': ' + operation257.trim().slice(0, 500) : '')));
            }
            if (0 !== operation850) {
              return finishOnce(new Error('agent-analyzer set-embeddings exited ' + operation850 + (operation428.trim() ? ': ' + operation428.trim().slice(0, 500) : '')));
            }
            const operation537 = operation33.match(/(\d+)\s+files?/);
            finishOnce(null, {
              'files': operation537 ? (operation157 = parseInt, operation734 = operation537[1], 
              operation157(operation734, 10)) : void 0
            });
            var operation157, operation734;
          }
          operation88.stderr.on('data', (function(operation437) {
            operation257 += operation437.toString('utf8');
          })), operation178.stderr.on('data', (function(operation632) {
            operation428 += operation632.toString('utf8');
          })), operation178.stdout.on('data', (function(operation700) {
            operation33 += operation700.toString('utf8');
          })), operation88.stdout.on('error', (function(operation783) {
            finishOnce(operation783);
          })), operation178.stdin.on('error', (function(operation233) {
            operation233 && 'EPIPE' !== operation233.code && finishOnce(operation233);
          })), operation88.stdout.pipe(operation178.stdin), operation88.on('error', (function(operation833) {
            finishOnce(operation833);
          })), operation178.on('error', (function(operation206) {
            finishOnce(operation206);
          })), operation88.on('close', (function(operation296) {
            operation544 = operation296, finishWhenBothClosed();
          })), operation178.on('close', (function(operation171) {
            operation850 = operation171;
            finishWhenBothClosed();
          }));
        }
      }));
    }
    const orchestratorApi = {};
    orchestratorApi.isEnabled = isEnabled, orchestratorApi.runScan = async function runScan(operation427) {
      {
        if (!isEnabled(operation427)) {
          const operation221 = {};
          return operation221.ran = !1, operation221.reason = 'embedder preference is "none" or unset', 
          operation221;
        }
        const operation490 = preference.read(operation427), operation627 = preference.detailToCliArg(operation490.embedderDetail || 'balanced'), operation19 = cache.getPath(operation427);
        if (!fs.existsSync(operation19)) {
          const operation204 = {};
          return operation204.ran = !1, operation204.reason = 'no repo-intel map found; run `/repo-intel init` first', 
          operation204;
        }
        const operation648 = Date.now(), operation716 = await embedBinary.ensureBinary(), operation256 = await analyzerBinary.ensureBinary(), operation863 = await (operation184 = streamEmbedToSetEmbeddings, 
        operation3 = operation716, operation164 = [ 'scan', operation427, '--variant', operation490.embedder, '--detail', operation627 ], 
        operation766 = operation256, operation718 = operation19, operation184(operation3, operation164, operation766, operation718));
        return Object.assign({
          'ran': !0,
          'durationMs': Date.now() - operation648
        }, operation863);
      }
      var operation184, operation3, operation164, operation766, operation718;
    }, orchestratorApi.runUpdate = async function runUpdate(operation292) {
      {
        if (!isEnabled(operation292)) {
          const operation104 = {};
          return operation104.ran = !1, operation104.reason = 'embedder preference is "none" or unset', 
          operation104;
        }
        const operation569 = preference.read(operation292), operation634 = preference.detailToCliArg(operation569.embedderDetail || 'balanced'), operation48 = cache.getPath(operation292);
        if (!fs.existsSync(operation48)) {
          const operation340 = {};
          return operation340.ran = !1, operation340.reason = 'no repo-intel map; run `/repo-intel init` then `enrich`', 
          operation340;
        }
        const operation71 = Date.now(), operation323 = await embedBinary.ensureBinary(), operation743 = await analyzerBinary.ensureBinary(), operation788 = await (operation879 = streamEmbedToSetEmbeddings, 
        operation117 = operation323, operation434 = [ 'update', operation292, '--map-file', operation48, '--variant', operation569.embedder, '--detail', operation634 ], 
        operation160 = operation743, operation785 = operation48, operation879(operation117, operation434, operation160, operation785));
        return Object.assign({
          'ran': !0,
          'durationMs': Date.now() - operation71
        }, operation788);
      }
      var operation879, operation117, operation434, operation160, operation785;
    }, orchestratorApi.status = function status(operation311) {
      {
        const operation823 = preference.read(operation311), operation207 = function getEmbeddingSidecarPath(operation467) {
          if (!operation467) {
            return '';
          }
          const operation312 = path.dirname(operation467), operation672 = path.basename(operation467, path.extname(operation467));
          return path.join(operation312, operation672 + '.embeddings.bin');
        }(cache.getPath(operation311));
        return {
          'enabled': isEnabled(operation311),
          'embedder': operation823.embedder,
          'embedderDetail': operation823.embedderDetail,
          'binaryInstalled': embedBinary.isAvailable(),
          'ortBundled': !embedBinary.platformBundlesOrt() || fs.existsSync(embedBinary.getBundledOrtPath()),
          'sidecarExists': fs.existsSync(operation207),
          'sidecarPath': operation207
        };
      }
    }, orchestratorApi.streamEmbedToSetEmbeddings = streamEmbedToSetEmbeddings, module.exports = orchestratorApi;
  }
}), require_embed = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/embed/index.js'(exports, module) {
    const preference = require_preference();
    const binary = require_binary2();
    const orchestrator = require_orchestrator();
    module.exports = {
      preference,
      binary,
      orchestrator,
      isEnabled: orchestrator.isEnabled,
      runScan: orchestrator.runScan,
      runUpdate: orchestrator.runUpdate,
      status: orchestrator.status
    };
  }
}), require_repo_intel = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/index.js'(exports, module) {
    var fs = require('fs'), path = require('path'), childProcess = require('child_process'), {execFileSync} = childProcess, installer = require_installer(), cache = require_cache(), updater = require_updater(), converter = require_converter(), queries = require_queries(), binaryManager = require_binary(), {getStateDirPath} = require_state_dir(), {writeJsonAtomic} = require_atomic_write();
    function getRawIntelArtifactPath(operation623) {
      return path.join(getStateDirPath(operation623), 'repo-intel.json');
    }
    async function init(operation860, operation148 = {}) {
      {
        const operation165 = await installer.checkInstalled();
        if (!operation165.found) {
          return {
            'success': !1,
            'error': 'agent-analyzer binary unavailable: ' + (operation165.error || 'unknown error'),
            'installSuggestion': installer.getInstallInstructions()
          };
        }
        if (cache.load(operation860) && !operation148.force) {
          return {
            'success': !1,
            'error': 'Repo map already exists. Use --force to rebuild or update to refresh.',
            'existing': cache.getStatus(operation860)
          };
        }
        const operation72 = Date.now();
        let operation5;
        try {
          operation5 = await binaryManager.runAnalyzerAsync([ 'repo-intel', 'init', operation860 ]);
        } catch (operation332) {
          return {
            'success': !1,
            'error': 'agent-analyzer repo-intel init failed: ' + operation332.message
          };
        }
        let operation775;
        try {
          operation775 = JSON.parse(operation5);
        } catch (operation662) {
          return {
            'success': !1,
            'error': 'Failed to parse repo-intel output: ' + operation662.message
          };
        }
        const operation706 = getRawIntelArtifactPath(operation860);
        try {
          writeJsonAtomic(operation706, operation775);
        } catch {}
        const operation575 = converter.convertIntelToRepoMap(operation775);
        return operation575.stats.scanDurationMs = Date.now() - operation72, cache.save(operation860, operation575), 
        {
          'success': !0,
          'map': operation575,
          'summary': {
            'files': Object.keys(operation575.files).length,
            'symbols': operation575.stats.totalSymbols,
            'languages': operation575.project.languages,
            'duration': operation575.stats.scanDurationMs
          }
        };
      }
    }
    async function runAnalyzerWithInput(operation555, operation825) {
      const operation821 = await binaryManager.ensureBinary();
      return new Promise(((operation328, operation757) => {
        {
          const operation78 = {};
          operation78.stdio = [ 'pipe', 'pipe', 'pipe' ], operation78.windowsHide = !0;
          const operation498 = childProcess.spawn(operation821, operation555, operation78);
          let operation771 = '', operation465 = '';
          operation498.stdout.on('data', (operation856 => {
            operation771 += operation856.toString('utf8');
          })), operation498.stderr.on('data', (operation638 => {
            operation465 += operation638.toString('utf8');
          })), operation498.on('error', operation757), operation498.on('close', (operation789 => {
            if (0 === operation789) {
              const operation460 = {};
              operation460.stdout = operation771, operation460.stderr = operation465, operation328(operation460);
            } else {
              operation757(new Error('agent-analyzer ' + operation555.join(' ') + ' exited ' + operation789 + ': ' + (operation465.trim() || operation771.trim())));
            }
          })), operation498.stdin.write(operation825), operation498.stdin.end();
        }
      }));
    }
    const repoIntelApi = {};
    repoIntelApi.init = init, repoIntelApi.update = async function update(operation801, operation40 = {}) {
      const operation839 = {};
      operation839.pVeEd = 'agent-analyzer', operation839.VZZIs = 'utf8';
      const operation224 = await installer.checkInstalled();
      if (!operation224.found) {
        return {
          'success': !1,
          'error': 'agent-analyzer binary unavailable: ' + (operation224.error || 'unknown error'),
          'installSuggestion': installer.getInstallInstructions()
        };
      }
      if (!cache.exists(operation801)) {
        const operation808 = {};
        return operation808.success = !1, operation808.error = 'No repo map found. Run init first.', 
        operation808;
      }
      if (operation40.full) {
        const operation462 = {};
        return operation462.force = !0, init(operation801, operation462);
      }
      const operation297 = getRawIntelArtifactPath(operation801);
      if (!fs.existsSync(operation297)) {
        const operation835 = {};
        return operation835.force = !0, init(operation801, operation835);
      }
      const operation349 = Date.now();
      let operation864;
      try {
        operation864 = await binaryManager.runAnalyzerAsync([ 'repo-intel', 'update', '--map-file', operation297, operation801 ]);
      } catch (operation26) {
        return {
          'success': !1,
          'error': 'agent-analyzer repo-intel update failed: ' + operation26.message
        };
      }
      let operation394;
      try {
        operation394 = JSON.parse(operation864);
      } catch (operation866) {
        return {
          'success': !1,
          'error': 'Failed to parse repo-intel update output: ' + operation866.message
        };
      }
      try {
        writeJsonAtomic(operation297, operation394);
      } catch {}
      const operation330 = converter.convertIntelToRepoMap(operation394);
      operation330.stats.scanDurationMs = Date.now() - operation349;
      return cache.save(operation801, operation330), {
        'success': !0,
        'map': operation330,
        'summary': {
          'files': Object.keys(operation330.files).length,
          'symbols': operation330.stats.totalSymbols,
          'duration': operation330.stats.scanDurationMs
        }
      };
    }, repoIntelApi.status = function status(operation732) {
      const operation652 = cache.load(operation732);
      if (!operation652) {
        const operation306 = {};
        return operation306.exists = !1, operation306;
      }
      const operation804 = updater.checkStaleness(operation732, operation652);
      let operation450;
      try {
        operation450 = (operation326 = execFileSync, operation209 = [ 'rev-parse', '--abbrev-ref', 'HEAD' ], 
        operation567 = {
          'cwd': operation732,
          'encoding': 'utf8'
        }, operation326('git', operation209, operation567)).trim();
      } catch {}
      var operation326, operation209, operation567;
      return {
        'exists': !0,
        'status': {
          'generated': operation652.generated,
          'updated': operation652.updated,
          'commit': operation652.git?.commit,
          'branch': operation450,
          'files': Object.keys(operation652.files).length,
          'symbols': operation652.stats?.totalSymbols || 0,
          'languages': operation652.project?.languages || [],
          'staleness': operation804
        }
      };
    }, repoIntelApi.load = function load(operation24) {
      return cache.load(operation24);
    }, repoIntelApi.loadRaw = function loadRaw(operation334) {
      {
        const operation246 = getRawIntelArtifactPath(operation334);
        if (!fs.existsSync(operation246)) {
          return null;
        }
        try {
          return JSON.parse(fs.readFileSync(operation246, 'utf8'));
        } catch {
          return null;
        }
      }
    }, repoIntelApi.exists = function exists(operation177) {
      return cache.exists(operation177);
    }, repoIntelApi.applyDescriptors = async function applyDescriptors(operation294, operation231) {
      if (!operation231 || 'object' != typeof operation231) {
        throw new Error('applyDescriptors requires an object {path: descriptor}');
      }
      const operation212 = getRawIntelArtifactPath(operation294);
      if (!fs.existsSync(operation212)) {
        throw new Error('No repo-intel artifact for ' + operation294 + '; run init first.');
      }
      await runAnalyzerWithInput([ 'repo-intel', 'set-descriptors', '--map-file', operation212, '--input', '-' ], JSON.stringify(operation231));
    }, repoIntelApi.applySummary = async function applySummary(operation474, operation536) {
      {
        if (!(operation536 && operation536.depth1 && operation536.depth3 && operation536.depth10)) {
          throw new Error('applySummary requires {depth1, depth3, depth10, inputHash}');
        }
        const operation452 = getRawIntelArtifactPath(operation474);
        if (!fs.existsSync(operation452)) {
          throw new Error('No repo-intel artifact for ' + operation474 + '; run init first.');
        }
        await runAnalyzerWithInput([ 'repo-intel', 'set-summary', '--map-file', operation452, '--input', '-' ], JSON.stringify(operation536));
      }
    }, repoIntelApi.checkAstGrepInstalled = async function checkAstGrepInstalled() {
      return installer.checkInstalled();
    }, repoIntelApi.getInstallInstructions = function getInstallInstructions() {
      return installer.getInstallInstructions();
    }, repoIntelApi.queries = queries, repoIntelApi.installer = installer, repoIntelApi.cache = cache;
    repoIntelApi.updater = updater, repoIntelApi.converter = converter, module.exports = repoIntelApi, 
    Object.defineProperty(module.exports, 'embed', {
      'enumerable': !0,
      'get': () => require_embed()
    });
  }
}), require_repo_map = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-map/index.js'(exports, module) {
    var repoIntel = require_repo_intel();
    const repoMapApi = {};
    repoMapApi.init = repoIntel.init, repoMapApi.update = repoIntel.update, repoMapApi.status = repoIntel.status, 
    repoMapApi.load = repoIntel.load, repoMapApi.exists = repoIntel.exists, repoMapApi.checkAstGrepInstalled = repoIntel.checkAstGrepInstalled, 
    repoMapApi.getInstallInstructions = repoIntel.getInstallInstructions, repoMapApi.installer = repoIntel.installer, 
    repoMapApi.cache = repoIntel.cache;
    repoMapApi.updater = repoIntel.updater, module.exports = repoMapApi;
  }
}), fs = require('fs'), path = require('path'), {execFileSync} = require('child_process'), repoMapModule = null, repoMapLoadError = null;

function getRepoMap() {
  if (!repoMapModule && !repoMapLoadError) {
    try {
      repoMapModule = require_repo_map();
    } catch (error) {
      repoMapLoadError = error.message || 'Failed to load repo-map module', repoMapModule = null;
    }
  }
  return repoMapModule;
}

function getRepoMapLoadError() {
  return repoMapLoadError;
}

var DEFAULT_OPTIONS = {
  'cwd': process.cwd()
}, MAX_SCAN_DEPTH = 5, MAX_DOC_FILES = 200, INTERNAL_DIRS = [ 'internal', 'private', 'utils', 'helpers', '__tests__', 'test', 'tests' ], ENTRY_NAMES = [ 'index', 'main', 'app', 'server', 'cli', 'bin' ], EXPORT_PATTERNS = [ /export\s+(?:function|class|const|let|var)\s+(\w+)/g, /export\s+\{([^}]+)\}/g, /module\.exports\s*=\s*\{([^}]+)\}/ ];

function escapeRegex(value) {
  const operation278 = {};
  operation278.UOvAe = '\\$&';
  const operation584 = operation278;
  return value.replace(/[.*+?^${}()|[\]\\]/g, operation584.UOvAe);
}

function isInternalExport(exportName, filePath) {
  const operation768 = {};
  operation768.HrHsW = 'full-path', operation768.WGRTZ = function(operation659, operation82) {
    return operation659 !== operation82;
  };
  operation768.aPyYN = 'qYEda', operation768.ncPyA = 'mTiPl';
  const operation218 = operation768;
  if (exportName.startsWith('_')) {
    return !0;
  }
  const lowerPath = filePath.toLowerCase();
  for (const internalDir of INTERNAL_DIRS) {
    if (lowerPath.includes('/' + internalDir + '/') || lowerPath.includes('\\' + internalDir + '\\')) {
      if (operation218.WGRTZ(operation218.aPyYN, operation218.ncPyA)) {
        return !0;
      }
      operation531.push(operation218.HrHsW);
    }
  }
  return !!/\.(test|spec)\.[jt]sx?$/.test(filePath);
}

function isEntryPoint(filePath) {
  const baseName = path.basename(filePath).replace(/\.[^.]+$/, '').toLowerCase();
  return ENTRY_NAMES.includes(baseName);
}

async function ensureRepoMap(options = {}) {
  const {cwd = process.cwd(), askUser} = options, repoMap = getRepoMap();
  if (!repoMap) {
    const operation169 = {};
    return operation169.available = !1, operation169.map = null, operation169.fallbackReason = 'repo-map-module-not-found', 
    operation169;
  }
  if (repoMap.exists(cwd)) {
    const loadedMap = repoMap.load(cwd), operation515 = {};
    return operation515.available = !0, operation515.map = loadedMap, operation515.fallbackReason = null, 
    operation515;
  }
  if (!(await repoMap.checkAstGrepInstalled()).found) {
    if (askUser) {
      const answer = await (operation99 = askUser, operation397 = {
        'question': 'ast-grep not found. Install for better doc sync accuracy?',
        'header': 'ast-grep Required',
        'options': [ {
          'label': 'Yes, show instructions',
          'description': 'Better accuracy with AST-based symbol detection'
        }, {
          'label': 'No, use regex fallback',
          'description': 'Less accurate but works without additional install'
        } ]
      }, operation99(operation397));
      if (answer && answer.includes('Yes')) {
        const installInstructions = repoMap.getInstallInstructions(), operation540 = {};
        return operation540.available = !1, operation540.map = null, operation540.fallbackReason = 'ast-grep-install-pending', 
        operation540.installInstructions = installInstructions, operation540;
      }
    }
    const operation793 = {};
    return operation793.available = !1, operation793.map = null, operation793.fallbackReason = 'ast-grep-not-installed', 
    operation793;
  }
  var operation99, operation397;
  try {
    {
      const initOptions = {};
      initOptions.force = !1;
      const initResult = await repoMap.init(cwd, initOptions);
      if (initResult.success) {
        const operation658 = {};
        return operation658.available = !0, operation658.map = initResult.map, operation658.fallbackReason = null, 
        operation658;
      }
      if (initResult.error && initResult.error.includes('already exists')) {
        const reloadedMap = repoMap.load(cwd), operation868 = {};
        return operation868.available = !0, operation868.map = reloadedMap, operation868.fallbackReason = null, 
        operation868;
      }
      const operation636 = {};
      return operation636.available = !1, operation636.map = null, operation636.fallbackReason = initResult.error || 'init-failed', 
      operation636;
    }
  } catch (error) {
    const operation800 = {};
    return operation800.available = !1, operation800.map = null, operation800.fallbackReason = error.message || 'init-error', 
    operation800;
  }
}

function ensureRepoMapSync(options = {}) {
  const {cwd = process.cwd()} = options, repoMap = getRepoMap();
  if (!repoMap) {
    const operation579 = {};
    return operation579.available = !1, operation579.map = null, operation579.fallbackReason = 'repo-map-module-not-found', 
    operation579;
  }
  if (repoMap.exists(cwd)) {
    const loadedMap = repoMap.load(cwd), operation486 = {};
    return operation486.available = !0, operation486.map = loadedMap, operation486.fallbackReason = null, 
    operation486;
  }
  const operation518 = {};
  operation518.available = !1;
  operation518.map = null;
  return operation518.fallbackReason = 'repo-map-not-initialized', operation518;
}

function getExportsFromRepoMap(filePath, repoMap) {
  const operation586 = {};
  operation586.QsGOy = function(operation843, operation220) {
    return operation843 === operation220;
  }, operation586.BVJfR = 'ERXvd', operation586.Foeki = 'iKhSs', operation586.kmnDF = function(operation404, operation75) {
    return operation404 + operation75;
  };
  const operation751 = operation586;
  if (!repoMap || !repoMap.files) {
    return null;
  }
  const normalizedPath = filePath.replace(/\\/g, '/');
  let fileEntry = repoMap.files[normalizedPath];
  !fileEntry && normalizedPath.startsWith('./') && (fileEntry = repoMap.files[normalizedPath.slice(2)]);
  if (!fileEntry && !normalizedPath.startsWith('./')) {
    if (operation751.QsGOy(operation751.BVJfR, operation751.Foeki)) {
      return !0;
    }
    fileEntry = repoMap.files[operation751.kmnDF('./', normalizedPath)];
  }
  return fileEntry && fileEntry.symbols && fileEntry.symbols.exports ? fileEntry.symbols.exports.map((exportSymbol => exportSymbol.name)) : null;
}

function findUndocumentedExports(changedFiles, options = {}) {
  const resolvedOptions = {
    ...DEFAULT_OPTIONS,
    ...options
  }, repoMapStatus = resolvedOptions.repoMapStatus || ensureRepoMapSync(resolvedOptions);
  if (!repoMapStatus.available || !repoMapStatus.map) {
    return [];
  }
  const repoMap = repoMapStatus.map;
  const markdownFiles = findMarkdownFiles(resolvedOptions.cwd);
  let allDocumentation = '';
  for (const markdownFile of markdownFiles) {
    try {
      allDocumentation += fs.readFileSync(path.join(resolvedOptions.cwd, markdownFile), 'utf8') + '\n';
    } catch {}
  }
  const issues = [];
  for (const changedFile of changedFiles) {
    const normalizedPath = changedFile.replace(/\\/g, '/'), fileEntry = repoMap.files[normalizedPath] || repoMap.files[normalizedPath.replace(/^\.\//, '')];
    if (fileEntry && fileEntry.symbols && fileEntry.symbols.exports) {
      for (const exportSymbol of fileEntry.symbols.exports) {
        if (!isInternalExport(exportSymbol.name, normalizedPath) && !isEntryPoint(normalizedPath) && !new RegExp('\\b' + (operation36 = escapeRegex, 
        operation420 = exportSymbol.name, operation36(operation420)) + '\\b').test(allDocumentation)) {
          const issue = {};
          issue.type = 'undocumented-export', issue.severity = 'low', issue.file = normalizedPath, 
          issue.name = exportSymbol.name, issue.line = exportSymbol.line || 0, issue.kind = exportSymbol.kind || 'export', 
          issue.certainty = 'MEDIUM', issue.suggestion = 'Export \'' + exportSymbol.name + '\' in ' + normalizedPath + ' is not mentioned in any documentation', 
          issues.push(issue);
        }
      }
    }
  }
  var operation36, operation420;
  return issues;
}

function findRelatedDocs(changedFiles, options = {}) {
  const cwd = {
    ...DEFAULT_OPTIONS,
    ...options
  }.cwd, relationships = [], markdownFiles = findMarkdownFiles(cwd);
  for (const changedFile of changedFiles) {
    const baseName = path.basename(changedFile).replace(/\.[^.]+$/, ''), pathWithoutExtension = changedFile.replace(/\.[^.]+$/, '');
    path.dirname(changedFile);
    for (const markdownFile of markdownFiles) {
      let content;
      try {
        content = fs.readFileSync(path.join(cwd, markdownFile), 'utf8');
      } catch {
        continue;
      }
      const referenceTypes = [];
      content.includes(baseName) && referenceTypes.push('filename');
      content.includes(changedFile) && referenceTypes.push('full-path');
      (content.includes('from \'' + pathWithoutExtension + '\'') || content.includes('from "' + pathWithoutExtension + '"')) && referenceTypes.push('import');
      (content.includes('require(\'' + pathWithoutExtension + '\')') || content.includes('require("' + pathWithoutExtension + '")')) && referenceTypes.push('require');
      (content.includes('/' + baseName) || content.includes('/' + baseName + '.')) && referenceTypes.push('url-path');
      if (referenceTypes.length > 0) {
        const relationship = {};
        relationship.doc = markdownFile, relationship.referencedFile = changedFile, relationship.referenceTypes = referenceTypes, 
        relationships.push(relationship);
      }
    }
  }
  return relationships;
}

function findMarkdownFiles(rootDir) {
  const markdownFiles = [];
  const excludedDirectories = [ 'node_modules', 'dist', 'build', '.git', 'coverage', 'vendor' ];
  return function walk(currentDir, depth = 0) {
    if (!(depth > MAX_SCAN_DEPTH || markdownFiles.length > MAX_DOC_FILES)) {
      try {
        const operation656 = {};
        operation656.withFileTypes = !0;
        const entries = fs.readdirSync(currentDir, operation656);
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name), relativePath = path.relative(rootDir, fullPath);
          entry.isDirectory() ? excludedDirectories.includes(entry.name) || entry.name.startsWith('.') || walk(fullPath, depth + 1) : entry.isFile() && entry.name.endsWith('.md') && markdownFiles.push(relativePath);
        }
      } catch {}
    }
  }(rootDir), markdownFiles;
}

function analyzeDocIssues(docFile, sourceFile, options = {}) {
  const resolvedOptions = {
    ...DEFAULT_OPTIONS,
    ...options
  }, cwd = resolvedOptions.cwd, issues = [];
  let docContent;
  try {
    docContent = fs.readFileSync(path.join(cwd, docFile), 'utf8');
  } catch {
    return issues;
  }
  docContent.split('\n');
  const codeBlocks = docContent.match(/```[\s\S]*?```/g) || [];
  for (const codeBlock of codeBlocks) {
    const importRegex = /import .* from ['"]([^'"]+)['"]/g;
    let importMatch;
    for (;null !== (importMatch = importRegex.exec(codeBlock)); ) {
      const importPath = importMatch[1], sourcePathWithoutExtension = sourceFile.replace(/\.[^.]+$/, '');
      importPath.includes(path.basename(sourcePathWithoutExtension)) && issues.push({
        'type': 'code-example',
        'severity': 'medium',
        'line': findLineNumber(docContent, importMatch[0]),
        'current': importMatch[0],
        'suggestion': 'Verify import path is still valid'
      });
    }
  }
  const repoMapStatus = ensureRepoMapSync(resolvedOptions);
  let previousExports, currentExports, usedRepoMap = !1;
  if (repoMapStatus.available && repoMapStatus.map) {
    const repoMapExports = getExportsFromRepoMap(sourceFile, repoMapStatus.map);
    repoMapExports && (currentExports = repoMapExports, previousExports = getExportsFromGit(sourceFile, 'HEAD~1', resolvedOptions), 
    usedRepoMap = !0);
  }
  usedRepoMap || (previousExports = getExportsFromGit(sourceFile, 'HEAD~1', resolvedOptions), 
  currentExports = getExportsFromGit(sourceFile, 'HEAD', resolvedOptions));
  const removedExports = previousExports.filter((exportName => !currentExports.includes(exportName)));
  for (const removedExport of removedExports) {
    if (docContent.includes(removedExport)) {
      const issue = {};
      issue.type = 'removed-export', issue.severity = 'high', issue.reference = removedExport, 
      issue.suggestion = '\'' + removedExport + '\' was removed or renamed', issue.detectionMethod = usedRepoMap ? 'repo-map' : 'regex', 
      issues.push(issue);
    }
  }
  try {
    {
      const packageJsonText = fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'), packageVersion = JSON.parse(packageJsonText).version, versionMatches = docContent.matchAll(/version[:\s]+['"]?(\d+\.\d+\.\d+)/gi);
      for (const versionMatch of versionMatches) {
        const documentedVersion = versionMatch[1];
        documentedVersion !== packageVersion && compareVersions(documentedVersion, packageVersion) < 0 && issues.push({
          'type': 'outdated-version',
          'severity': 'low',
          'line': findLineNumber(docContent, versionMatch[0]),
          'current': documentedVersion,
          'expected': packageVersion,
          'suggestion': 'Update version from ' + documentedVersion + ' to ' + packageVersion
        });
      }
    }
  } catch {}
  return issues;
}

function findLineNumber(text, needle) {
  const operation265 = {};
  operation265.LLhRF = function(operation316, operation589) {
    return operation316 === operation589;
  };
  const operation300 = operation265, index = text.indexOf(needle);
  return operation300.LLhRF(index, -1) ? 0 : text.substring(0, index).split('\n').length;
}

function isValidGitRef(gitRef) {
  const operation497 = {};
  operation497.KGDtv = function(operation568, operation325) {
    return operation568 !== operation325;
  }, operation497.lgxKE = 'string';
  const operation183 = operation497;
  return !(operation183.KGDtv(typeof gitRef, operation183.lgxKE) || !gitRef) && /^[a-zA-Z0-9_./-]+(?:[~^][0-9]+)?$/.test(gitRef);
}

function getExportsFromGit(filePath, gitRef, options = {}) {
  const resolvedOptions = {
    ...DEFAULT_OPTIONS,
    ...options
  };
  if (!(operation279 = isValidGitRef, operation526 = gitRef, operation279(operation526))) {
    return [];
  }
  var operation279, operation526;
  try {
    {
      const source = execFileSync('git', [ 'show', gitRef + ':' + filePath ], {
        'cwd': resolvedOptions.cwd,
        'encoding': 'utf8',
        'stdio': [ 'pipe', 'pipe', 'pipe' ]
      }), exportNames = [];
      for (const pattern of EXPORT_PATTERNS) {
        const regex = new RegExp(pattern.source, pattern.flags);
        let match;
        for (;null !== (match = regex.exec(source)); ) {
          if (match[1].includes(',')) {
            const names = match[1].split(',').map((exportSpecifier => exportSpecifier.trim().split(/\s+as\s+/)[0].trim()));
            exportNames.push(...names.filter((name => name && /^\w+$/.test(name))));
          } else {
            exportNames.push(match[1]);
          }
        }
      }
      return [ ...new Set(exportNames) ];
    }
  } catch {
    return [];
  }
}

function compareVersions(leftVersion, rightVersion) {
  const leftParts = leftVersion.split('.').map(Number);
  const rightParts = rightVersion.split('.').map(Number);
  for (let index = 0; index < 3; index++) {
    const leftPart = leftParts[index] || 0, rightPart = rightParts[index] || 0;
    if (leftPart < rightPart) {
      return -1;
    }
    if (leftPart > rightPart) {
      return 1;
    }
  }
  return 0;
}

function checkChangelog(changedFiles, options = {}) {
  const cwd = {
    ...DEFAULT_OPTIONS,
    ...options
  }.cwd, changelogPath = path.join(cwd, 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) {
    const operation511 = {};
    return operation511.exists = !1, operation511;
  }
  let changelogContent;
  try {
    changelogContent = fs.readFileSync(changelogPath, 'utf8');
  } catch {
    {
      const operation675 = {};
      return operation675.exists = !1, operation675.error = 'Could not read CHANGELOG.md', 
      operation675;
    }
  }
  const hasUnreleased = changelogContent.includes('## [Unreleased]');
  let recentCommits = [];
  try {
    recentCommits = (operation321 = execFileSync, operation472 = [ 'log', '--oneline', '-10', 'HEAD' ], 
    operation738 = {
      'cwd': cwd,
      'encoding': 'utf8',
      'stdio': [ 'pipe', 'pipe', 'pipe' ]
    }, operation321('git', operation472, operation738)).trim().split('\n');
  } catch {}
  var operation321, operation472, operation738;
  const documentedCommits = [], undocumentedCommits = [];
  for (const commitLine of recentCommits) {
    if (!commitLine) {
      continue;
    }
    const commitMessage = commitLine.substring(8);
    changelogContent.includes(commitMessage) || changelogContent.includes(commitLine.substring(0, 7)) ? documentedCommits.push(commitMessage) : commitMessage.match(/^(feat|fix|breaking)/i) && undocumentedCommits.push(commitMessage);
  }
  return {
    'exists': !0,
    'hasUnreleased': hasUnreleased,
    'documented': documentedCommits,
    'undocumented': undocumentedCommits,
    'suggestion': (operation345 = undocumentedCommits.length, operation345 > 0 ? undocumentedCommits.length + ' commits may need CHANGELOG entries' : null)
  };
  var operation345;
}

function collect(options = {}) {
  const resolvedOptions = {
    ...DEFAULT_OPTIONS,
    ...options
  }, changedFiles = resolvedOptions.changedFiles || [], repoMapStatus = ensureRepoMapSync(resolvedOptions);
  return {
    'relatedDocs': (operation86 = findRelatedDocs, operation425 = changedFiles, operation364 = resolvedOptions, 
    operation86(operation425, operation364)),
    'changelog': checkChangelog(changedFiles, resolvedOptions),
    'markdownFiles': (operation138 = findMarkdownFiles, operation232 = resolvedOptions.cwd, 
    operation138(operation232)),
    'repoMap': {
      'available': repoMapStatus.available,
      'fallbackReason': repoMapStatus.fallbackReason,
      'stats': repoMapStatus.map ? {
        'files': Object.keys(repoMapStatus.map.files || {}).length,
        'symbols': repoMapStatus.map.stats?.totalSymbols || 0
      } : null
    },
    'undocumentedExports': repoMapStatus.available ? findUndocumentedExports(changedFiles, {
      ...resolvedOptions,
      'repoMapStatus': repoMapStatus
    }) : []
  };
  var operation138, operation232;
  var operation86, operation425, operation364;
}

const api = {};

api.DEFAULT_OPTIONS = DEFAULT_OPTIONS, api.findRelatedDocs = findRelatedDocs, api.findMarkdownFiles = findMarkdownFiles, 
api.analyzeDocIssues = analyzeDocIssues;

api.checkChangelog = checkChangelog, api.getExportsFromGit = getExportsFromGit;

api.compareVersions = compareVersions, api.findLineNumber = findLineNumber, api.collect = collect, 
api.ensureRepoMap = ensureRepoMap, api.ensureRepoMapSync = ensureRepoMapSync, api.getExportsFromRepoMap = getExportsFromRepoMap, 
api.findUndocumentedExports = findUndocumentedExports, api.isInternalExport = isInternalExport, 
api.isEntryPoint = isEntryPoint, api.escapeRegex = escapeRegex, api.getRepoMapLoadError = getRepoMapLoadError, 
module.exports = api;
