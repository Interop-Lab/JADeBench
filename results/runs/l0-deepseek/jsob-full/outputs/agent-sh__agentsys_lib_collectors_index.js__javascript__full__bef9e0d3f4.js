/g) || []).length / 2),
      wordCount: content.split(/\s+/).length
    };
  }

  function analyzeChecklists(result, content) {
    const checked = (content.match(/^[-*]\s+\[x\]/gim) || []).length;
    const unchecked = (content.match(/^[-*]\s+\[\s\]/gim) || []).length;
    result.checklists.completed += checked;
    result.checklists.pending += unchecked;
    result.checklists.total += checked + unchecked;
  }

  function analyzeBulletPoints(result, content) {
    const bulletRegex = /^[-*]\s{1,100}\*{0,2}([^\n]{1,2000}?)\*{0,2}(?:\s{0,100}[-–]\s{0,100}([^\n]{1,2000}))?$/gm;
    let match;
    while ((match = bulletRegex.exec(content)) !== null && result.bulletPoints.length < 100) {
      const text = match[1].trim();
      if (text.length > 3 && text.length < 200) {
        result.bulletPoints.push(text);
      }
    }
    result.bulletPoints = [...new Set(result.bulletPoints)].slice(0, 50);
  }

  function analyzeTodos(result, content) {
    const todoRegexes = [
      /(?:TODO|FIXME|PLAN):\s*(.+)/gi,
      /^##\s+(?:Roadmap|Future|Planned|Coming Soon)/gim
    ];
    for (const regex of todoRegexes) {
      let match;
      while ((match = regex.exec(content)) !== null && result.todos.length < 50) {
        const text = (match[1] || match[0]).slice(0, 200);
        result.todos.push(text);
      }
    }
  }

  function analyzeDocumentation(result) {
    const readme = result.files['README.md'];
    if (!readme) {
      result.missingDocs.push({ type: 'readme', severity: 'high', message: 'No README.md found' });
    }
    if (!readme?.hasInstallation) {
      result.missingDocs.push({ type: 'installation', severity: 'medium', message: 'No installation section found' });
    }
    if (!readme?.hasUsage) {
      result.missingDocs.push({ type: 'usage', severity: 'medium', message: 'No usage section found' });
    }
    if (!readme?.hasApi) {
      result.missingDocs.push({ type: 'api', severity: 'low', message: 'No API documentation found' });
    }
  }

  function collectDocumentation(options = {}) {
    const config = { ...DEFAULTS, ...options };
    const opts = config;
    const basePath = opts.cwd;
    const result = {
      files: {},
      fileCount: 0,
      totalSections: 0,
      checklists: { completed: 0, pending: 0, total: 0 },
      bulletPoints: [],
      todos: [],
      missingDocs: []
    };

    const docFiles = ['README.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'LICENSE', 'docs/README.md', 'docs/INSTALL.md', 'docs/USAGE.md', 'docs/API.md'];
    for (const file of docFiles) {
      const content = readMarkdown(file, basePath);
      if (content) {
        const analysis = analyzeMarkdown(content, file);
        result.files[file] = analysis;
        result.totalSections += analysis.sectionCount;
        analyzeChecklists(result, content);
        analyzeBulletPoints(result, content);
        analyzeTodos(result, content);
      }
    }

    if (opts.includeDocsFolder) {
      const docsDir = path.join(basePath, 'docs');
      if (fs.existsSync(docsDir)) {
        try {
          const files = fs.readdirSync(docsDir).filter(file => file.endsWith('.md') && !docFiles.includes('docs/' + file));
          for (const file of files.slice(0, 20)) {
            const filePath = 'docs/' + file;
            const content = readMarkdown(filePath, basePath);
            if (content) {
              const analysis = analyzeMarkdown(content, filePath);
              result.files[filePath] = analysis;
              result.totalSections += analysis.sectionCount;
            }
          }
        } catch {}
      }
    }

    result.fileCount = Object.keys(result.files).length;
    analyzeDocumentation(result);
    return result;
  }

  const api = {
    defaults: DEFAULTS,
    collect: collectDocumentation,
    analyzeMarkdown,
    readMarkdown,
    safeJoin,
    analyzeChecklists,
    analyzeBulletPoints,
    analyzeTodos,
    analyzeDocumentation
  };
  module.exports = api;
});

const require_fs_safe = __commonJS(function (require, module, exports) {
  'use strict';
  const fs = require('fs');

  function readFileWithLimit(filePath, maxSize, encoding = 'utf8') {
    const fd = fs.openSync(filePath, 'r');
    try {
      const stats = fs.fstatSync(fd);
      if (!stats.isFile()) {
        const error = new Error('Not a regular file: ' + filePath);
        error.code = 'EISDIR';
        throw error;
      }
      if (typeof maxSize === 'number' && stats.size > maxSize) {
        const error = new Error('File too large: ' + stats.size + ' bytes (max ' + maxSize + ')');
        error.code = 'EFBIG';
        throw error;
      }
      return fs.readFileSync(fd, encoding);
    } finally {
      fs.closeSync(fd);
    }
  }

  const api = {
    readFileWithLimit
  };
  module.exports = api;
});

const require_codebase = __commonJS(function (require, module, exports) {
  'use strict';
  const fs = require('fs');
  const path = require('path');
  const { readFileWithLimit } = require_fs_safe();
  const DEFAULTS = {
    depth: 5,
    cwd: process.cwd()
  };
  const MAX_FILE_SIZE = 100000;
  const IGNORED_DIRS = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'vendor', 'target', 'out', '.cache', 'tmp', 'temp', '.idea', '.vscode', '.DS_Store'];
  const EXTENSIONS = {
    js: ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx'],
    py: ['.py'],
    go: ['.go'],
    rs: ['.rs'],
    java: ['.java']
  };

  function isIgnoredDir(dirName) {
    return IGNORED_DIRS.includes(dirName);
  }

  function isIgnoredPath(filePath) {
    const parts = filePath.split(/[\\/]/);
    return parts.some(part => IGNORED_DIRS.includes(part));
  }

  function applyLanguageOverrides(result, config) {
    const overrides = { ...config.languageOverrides, ...config.languageWeights };
    for (const [lang, weight] of Object.entries(overrides)) {
      if (weight) {
        result.languageWeights[lang] = weight;
      }
    }
  }

  function applyProjectType(result, config) {
    const typeFlags = ['web', 'mobile', 'cli', 'library', 'api', 'desktop'];
    for (const flag of typeFlags) {
      if (config[flag]) {
        result.projectType = flag;
        result.projectTypeConfidence = true;
        break;
      }
    }
  }

  function extractSymbols(content) {
    const symbols = { functions: [], classes: [], exports: [] };
    const functionRegex = /(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      symbols.functions.push(match[1]);
    }
    const arrowRegex = /(?:const|let)\s{1,1000}([a-zA-Z_$][a-zA-Z0-9_$]*)\s{0,1000}=\s{0,1000}(?:async\s{0,1000})?\([^)]{0,2000}\)\s{0,1000}=>/g;
    while ((match = arrowRegex.exec(content)) !== null) {
      symbols.functions.push(match[1]);
    }
    const classRegex = /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = classRegex.exec(content)) !== null) {
      symbols.classes.push(match[1]);
    }
    const exportRegex = /export\s+(?:(?:async\s+)?function|class|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = exportRegex.exec(content)) !== null) {
      symbols.exports.push(match[1]);
    }
    const moduleExportsRegex = /module\.exports\s{0,1000}=\s{0,1000}\{([^}]{1,100000})\}/;
    const moduleMatch = content.match(moduleExportsRegex);
    if (moduleMatch) {
      const names = moduleMatch[1].split(',').map(name => name.trim().split(':')[0].trim());
      symbols.exports.push(...names.filter(name => name && /^[a-zA-Z_$]/.test(name)));
    }
    symbols.functions = [...new Set(symbols.functions)];
    symbols.classes = [...new Set(symbols.classes)];
    symbols.exports = [...new Set(symbols.exports)];
    return symbols;
  }

  function walkDirectory(dir, baseDir, depth = 0) {
    const results = {};
    const ignoredDirs = IGNORED_DIRS;
    const extensions = Object.keys(EXTENSIONS);
    let fileCount = 0;
    const maxFiles = 500;

    function walk(currentDir, relativePath, currentDepth = 0) {
      if (fileCount >= maxFiles || currentDepth > depth) return;
      if (!fs.existsSync(currentDir)) return;
      try {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          if (fileCount >= maxFiles) break;
          const fullPath = path.join(currentDir, entry.name);
          const relPath = relativePath ? relativePath + '/' + entry.name : entry.name;
          if (entry.isDirectory()) {
            if (ignoredDirs.includes(entry.name)) continue;
            walk(fullPath, relPath, currentDepth + 1);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (!extensions.includes(ext)) continue;
            if (entry.name.startsWith('.') || entry.name.includes('.test.') || entry.name.includes('.spec.')) continue;
            try {
              const content = readFileWithLimit(fullPath, MAX_FILE_SIZE);
              const symbols = extractSymbols(content);
              if (symbols.functions.length || symbols.classes.length || symbols.exports.length) {
                results[relPath] = symbols;
                fileCount++;
              }
            } catch {}
          }
        }
      } catch {}
    }

    for (const dir of [baseDir]) {
      walk(dir, '');
    }
    return results;
  }

  function collectCodebase(options = {}) {
    const config = { ...DEFAULTS, ...options };
    const opts = config;
    const basePath = opts.cwd;
    const result = {
      files: {},
      fileCount: 0,
      totalSymbols: 0,
      totalImports: 0,
      languageWeights: {},
      projectType: null,
      projectTypeConfidence: false,
      errors: []
    };

    const packageJsonPath = path.join(basePath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        applyLanguageOverrides(result, packageJson);
        applyProjectType(result, packageJson);
      } catch {}
    }

    result.packageJsonExists = fs.existsSync(packageJsonPath);
    const fileResults = {};
    walkDirectory(basePath, basePath, opts.depth);
    result.files = fileResults;
    result.fileCount = Object.keys(fileResults).length;
    result.totalSymbols = Object.values(fileResults).reduce((sum, file) => sum + file.functions.length + file.classes.length + file.exports.length, 0);
    result.totalImports = Object.values(fileResults).reduce((sum, file) => sum + file.imports.length, 0);
    return result;
  }

  const api = {
    defaults: DEFAULTS,
    ignoredDirs: IGNORED_DIRS,
    extensions: EXTENSIONS,
    collect: collectCodebase,
    applyLanguageOverrides,
    applyProjectType,
    extractSymbols,
    walkDirectory,
    isIgnoredDir,
    isIgnoredPath
  };
  module.exports = api;
});

const require_version = __commonJS(function (require, module, exports) {
  'use strict';
  const versionInfo = {
    ANALYZER_MIN_VERSION: '1.0.0',
    BINARY_NAME: 'agent-analyzer',
    GITHUB_REPO: 'agent-sh/agentsys'
  };
  module.exports = versionInfo;
});

const require_binary = __commonJS(function (require, module, exports) {
  'use strict';
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  const { execFileSync } = require('child_process');
  const { promisify } = require('util');
  const execFileAsync = promisify(execFileSync);
  const { ANALYZER_MIN_VERSION, BINARY_NAME, GITHUB_REPO } = require_version();

  const PLATFORM_BINARIES = {
    'darwin-arm64': 'agent-analyzer-darwin-arm64',
    'darwin-x64': 'agent-analyzer-darwin-x64',
    'linux-arm64': 'agent-analyzer-linux-arm64',
    'linux-x64': 'agent-analyzer-linux-x64'
  };

  function getBinaryPath() {
    const platform = process.platform === 'win32' ? 'windows' : process.platform;
    return path.join(os.homedir(), '.agent-analyzer', 'bin', BINARY_NAME + (platform === 'windows' ? '.exe' : ''));
  }

  function getPlatformKey() {
    const platform = process.platform === 'win32' ? 'windows' : process.platform;
    const arch = process.arch === 'x64' ? 'x64' : process.arch === 'arm64' ? 'arm64' : 'unknown';
    return platform + '-' + arch;
  }

  function getBinaryName() {
    const key = getPlatformKey();
    return PLATFORM_BINARIES[key] || null;
  }

  function getVersion() {
    const binaryPath = getBinaryPath();
    if (!fs.existsSync(binaryPath)) return null;
    try {
      const stdout = execFileSync(binaryPath, ['--version'], {
        timeout: 5000,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true
      });
      const match = stdout.trim().match(/(\d+\.\d+\.\d+)/);
      return match ? match[1] : stdout.trim();
    } catch {
      return null;
    }
  }

  function isCompatibleVersion(version, minVersion) {
    if (!version) return false;
    const parts = version.match(/^(\d+)\.(\d+)\.(\d+)/);
    if (!parts) return false;
    const current = parts.slice(1).map(Number);
    const minimum = minVersion.split('.').map(Number);
    if (current[0] > minimum[0]) return true;
    if (current[0] < minimum[0]) return false;
    if (current[1] > minimum[1]) return true;
    if (current[1] < minimum[1]) return false;
    return current[2] >= minimum[2];
  }

  function isBinaryAvailable() {
    const binaryPath = getBinaryPath();
    if (!fs.existsSync(binaryPath)) return false;
    const version = getVersion();
    return isCompatibleVersion(version, ANALYZER_MIN_VERSION);
  }

  async function ensureBinary() {
    return isBinaryAvailable();
  }

  function getDownloadUrl(version, platform) {
    const ext = platform === 'windows' ? '.exe' : '';
    return `https://github.com/${GITHUB_REPO}/releases/download/v${version}/${BINARY_NAME}-${platform}${ext}`;
  }

  function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
      const headers = {
        'User-Agent': 'agent-analyzer',
        'Accept': 'application/octet-stream'
      };
      if (token) headers['Authorization'] = 'token ' + token;

      const request = https.get(url, { headers }, (response) => {
        const statusCode = response.statusCode;
        if (statusCode === 301 || statusCode === 302 || statusCode === 307 || statusCode === 308) {
          response.resume();
          downloadFile(response.headers.location, destPath, redirects + 1);
          return;
        }
        if (statusCode !== 200) {
          response.resume();
          const message = statusCode === 404 ? 'Binary not found' : '';
          reject(new Error('Download failed with status ' + statusCode + ' ' + message + ' for ' + url));
          return;
        }
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
      });
      request.on('error', reject);
    });
  }

  function extractCommitHash(input) {
    if (typeof input !== 'string') input = String(input || '');
    const match = input.trim().match(/^([A-Fa-f0-9]{64})\b/);
    if (!match) throw new Error('Invalid commit hash');
    return match[1].toLowerCase();
  }

  async function fetchCommitHash(url) {
    const commitUrl = url.replace(/\/+$/, '') + '/commits/main';
    const response = await downloadFile(commitUrl);
    return extractCommitHash(response.toString('utf8'));
  }

  function runGit(args) {
    try {
      return execFileSync('git', args, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } catch {
      return null;
    }
  }

  function validatePath(input) {
    if (!input || typeof input !== 'string') throw new Error('Invalid path');
    const normalized = input.replace(/\\/g, '/').trim();
    if (normalized.length === 0) throw new Error('Empty path');
    if (normalized.startsWith('//')) throw new Error('Invalid path: ' + input);
    if (normalized.startsWith('/')) throw new Error('Invalid path: ' + input);
    if (/^[A-Za-z]:[\\/]/.test(input)) throw new Error('Invalid path: ' + input);
    const parts = normalized.split('/').filter(part => part.length > 0);
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '..') throw new Error('Invalid path: ' + input);
    }
  }

  function runCommand(command) {
    return new Promise((resolve, reject) => {
      const child = execFileSync(command, [], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });
      child.on('error', reject);
      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('Command failed with exit code ' + code + (stderr.trim() ? ': ' + stderr.trim().slice(0, 500) : '')));
          return;
        }
        const lines = stdout.split(/\r?\n/).filter(line => line.trim().length > 0);
        resolve(lines);
      });
      child.stdin.end();
    });
  }

  function isSubPath(parent, child) {
    const parentResolved = path.resolve(parent);
    const childResolved = path.resolve(child);
    return childResolved === parentResolved || childResolved.startsWith(parentResolved + path.sep);
  }

  function listFiles(dir) {
    const files = [];
    const stack = [dir];
    while (stack.length > 0) {
      const current = stack.pop();
      const entries = fs.readdirSync(current);
      if (entries.isDirectory()) {
        const children = fs.readdirSync(current);
        for (let i = 0; i < children.length; i++) {
          stack.push(path.join(current, children[i]));
        }
      } else if (entries.isFile()) {
        files.push(current);
      }
    }
    return files;
  }

  function cleanupDir(dir) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {}
  }

  async function installBinary(version) {
    const binaryPath = getBinaryPath();
    const downloadUrl = getDownloadUrl(version, getPlatformKey());
    process.stdout.write('Downloading ' + BINARY_NAME + ' v' + version + '...\n');
    const tempDir = getBinaryPath() + '.tmp';
    const tempFile = path.join(tempDir, BINARY_NAME);
    fs.mkdirSync(tempDir, { recursive: true });
    let data;
    try {
      data = await downloadFile(downloadUrl);
    } catch (error) {
      throw new Error('Failed to download binary: ' + error.message);
    }
    if (process.platform !== 'win32') {
      await runCommand(['chmod', '+x', tempFile]);
    }
    fs.writeFileSync(tempFile, data);
    fs.renameSync(tempFile, binaryPath);
    cleanupDir(tempDir);
    return binaryPath;
  }

  async function ensureInstalled(version) {
    const binaryPath = getBinaryPath();
    if (fs.existsSync(binaryPath)) {
      const currentVersion = getVersion();
      if (isCompatibleVersion(currentVersion, ANALYZER_MIN_VERSION)) {
        return binaryPath;
      }
    }
    return installBinary(version);
  }

  const api = {
    BINARY_NAME,
    getBinaryPath,
    getPlatformKey,
    getBinaryName,
    getVersion,
    isCompatibleVersion,
    isBinaryAvailable,
    ensureBinary,
    getDownloadUrl,
    downloadFile,
    extractCommitHash,
    fetchCommitHash,
    runGit,
    validatePath,
    runCommand,
    isSubPath,
    listFiles,
    cleanupDir,
    installBinary,
    ensureInstalled
  };
  module.exports = api;
});

const require_installer = __commonJS(function (require, module, exports) {
  'use strict';
  const binary = require_binary();

  async function checkInstalled() {
    if (binary.isBinaryAvailable()) {
      return { found: true, version: binary.getVersion(), tool: 'agent-analyzer' };
    }
    try {
      await binary.ensureBinary();
      return { found: true, version: binary.getVersion(), tool: 'agent-analyzer' };
    } catch (error) {
      return { found: false, error: error.message, tool: 'agent-analyzer' };
    }
  }

  function checkBinaryAvailable() {
    if (binary.isBinaryAvailable()) {
      return { found: true, version: binary.getVersion(), tool: 'agent-analyzer' };
    }
    try {
      binary.ensureBinary();
      return { found: true, version: binary.getVersion(), tool: 'agent-analyzer' };
    } catch (error) {
      return { found: false, error: error.message, tool: 'agent-analyzer' };
    }
  }

  function getInstallSuggestion() {
    return true;
  }

  function getInstallCommand() {
    return 'npm install -g agent-analyzer';
  }

  function getInstallInstructions() {
    return 'Run: npm install -g agent-analyzer';
  }

  const api = {
    checkInstalled,
    checkBinaryAvailable,
    getInstallSuggestion,
    getInstallCommand,
    getInstallInstructions,
    install: () => null
  };
  module.exports = api;
});

const require_state_dir = __commonJS(function (require, module, exports) {
  const fs = require('fs');
  const path = require('path');
  const cache = new Map();

  function isDirectory(dir) {
    try {
      return fs.statSync(dir).isDirectory();
    } catch {
      return false;
    }
  }

  function getStateDir(cwd = process.cwd()) {
    if (process.env.AI_STATE_DIR) {
      return process.env.AI_STATE_DIR;
    }
    const resolvedCwd = path.resolve(cwd);
    const cached = cache.get(resolvedCwd);
    if (cached) return cached;
    if (process.env.OPENCODE_CONFIG || process.env.OPENCODE_CONFIG_DIR) {
      return cache.set(resolvedCwd, '.opencode'), '.opencode';
    }
    try {
      const gitDir = path.join(cwd, '.git');
      if (isDirectory(gitDir)) {
        return cache.set(resolvedCwd, '.git'), '.git';
      }
    } catch {}
    if (process.env.CODEX_HOME) {
      return cache.set(resolvedCwd, '.codex'), '.codex';
    }
    try {
      const claudeDir = path.join(cwd, '.claude');
      if (isDirectory(claudeDir)) {
        return cache.set(resolvedCwd, '.claude'), '.claude';
      }
    } catch {}
    return cache.set(resolvedCwd, '.agent'), '.agent';
  }

  function getStateDirPath(cwd = process.cwd()) {
    return path.join(cwd, getStateDir(cwd));
  }

  function getStateFilePath(cwd = process.cwd()) {
    const stateDir = getStateDir(cwd);
    if (process.env.AI_STATE_DIR) return process.env.AI_STATE_DIR;
    switch (stateDir) {
      case '.git': return '.git';
      case '.claude': return '.claude';
      case '.codex': return '.codex';
      default: return '.agent';
    }
  }

  function clearCache() {
    cache.clear();
  }

  const api = {
    getStateDir,
    getStateDirPath,
    getStateFilePath,
    clearCache
  };
  module.exports = api;
});

const require_atomic_write = __commonJS(function (require, module, exports) {
  const fs = require('fs');
  const path = require('path');
  const crypto = require('crypto');

  function tempPathFor(filePath) {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const random = crypto.randomBytes(6).toString('hex');
    return path.join(dir, '.' + path.basename(filePath, ext) + '.' + random + ext);
  }

  function writeFileAtomic(filePath, data, options = {}) {
    const { encoding = 'utf8', mode = 0o666 } = options;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = tempPathFor(filePath);
    try {
      fs.writeFileSync(tempPath, data, { encoding, mode });
      fs.renameSync(tempPath, filePath);
      return true;
    } catch (error) {
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch {}
      throw error;
    }
  }

  function writeJsonAtomic(filePath, data, options = {}) {
    const { indent = 2, ...rest } = options;
    const json = JSON.stringify(data, null, indent);
    return writeFileAtomic(filePath, json, rest);
  }

  const api = {
    writeFileAtomic,
    writeJsonAtomic,
    tempPathFor
  };
  module.exports = api;
});

const require_cache = __commonJS(function (require, module, exports) {
  'use strict';
  const fs = require('fs');
  const path = require('path');
  const { getStateDirPath } = require_state_dir();
  const { writeJsonAtomic, writeFileAtomic } = require_atomic_write();
  const CACHE_DIR = '.cache';
  const MAP_FILE = 'repo-map.json';
  const META_FILE = 'repo-meta.json';

  function getCacheDir(repoPath) {
    return path.join(getStateDirPath(repoPath), CACHE_DIR);
  }

  function getMapPath(repoPath) {
    return path.join(getStateDirPath(repoPath), MAP_FILE);
  }

  function getMetaPath(repoPath) {
    return path.join(getStateDirPath(repoPath), META_FILE);
  }

  function ensureCacheDir(repoPath) {
    const dir = getStateDirPath(repoPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  function readMap(repoPath) {
    const filePath = getMapPath(repoPath);
    if (!fs.existsSync(filePath)) return null;
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  function writeMap(repoPath, data) {
    ensureCacheDir(repoPath);
    const filePath = getMapPath(repoPath);
    const payload = { ...data, updated: new Date().toISOString() };
    writeJsonAtomic(filePath, payload);
    touchMeta(repoPath);
  }

  function hasMap(repoPath) {
    return fs.existsSync(getMapPath(repoPath));
  }

  function touchMeta(repoPath) {
    ensureCacheDir(repoPath);
    writeFileAtomic(getMetaPath(repoPath), new Date().toISOString());
  }

  function deleteMap(repoPath) {
    const filePath = getMapPath(repoPath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  function hasMeta(repoPath) {
    return fs.existsSync(getMetaPath(repoPath));
  }

  function getMapSummary(repoPath) {
    const data = readMap(repoPath);
    if (!data) return null;
    return {
      generated: data.generated,
      updated: data.updated,
      commit: data.git?.commit,
      branch: data.git?.branch,
      files: Object.keys(data.files || {}).length,
      symbols: data.stats?.totalSymbols || 0,
      languages: data.project?.languages || []
    };
  }

  const api = {
    readMap,
    writeMap,
    hasMap,
    getMapSummary,
    getMapPath,
    getMetaPath,
    getStateDirPath,
    touchMeta,
    deleteMap,
    hasMeta
  };
  module.exports = api;
});

const require_updater = __commonJS(function (require, module, exports) {
  'use strict';
  const { execFileSync } = require('child_process');
  const cache = require_cache();

  function checkForUpdates(repoPath, currentMap) {
    const result = {
      needsUpdate: false,
      reason: null,
      newCommit: null,
      shouldRebuild: false
    };
    if (!currentMap?.git?.commit) {
      result.needsUpdate = true;
      result.reason = 'No cached commit';
      result.shouldRebuild = true;
      return result;
    }
    if (cache.hasMap(repoPath)) {
      result.needsUpdate = true;
      result.reason = 'Cache exists';
    }
    if (!isValidCommit(repoPath, currentMap.git.commit)) {
      result.needsUpdate = true;
      result.reason = 'Invalid cached commit';
      result.shouldRebuild = true;
    }
    const currentCommit = getCurrentCommit(repoPath);
    if (currentCommit && currentMap.git.commit && currentCommit !== currentMap.git.commit) {
      result.needsUpdate = true;
      result.reason = 'Commit changed: ' + currentMap.git.commit + ' -> ' + currentCommit;
      result.shouldRebuild = true;
    }
    const lastCommitTime = getLastCommitTime(repoPath, currentMap.git.commit);
    if (lastCommitTime > 0) {
      result.needsUpdate = true;
      result.lastCommitAge = lastCommitTime;
      if (!result.reason) result.reason = 'Commit age: ' + lastCommitTime + ' days';
    }
    return result;
  }

  function isValidCommit(repoPath, commit) {
    if (!isValidHash(commit)) return false;
    try {
      execFileSync('git', ['cat-file', '-e', commit], {
        cwd: repoPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      return true;
    } catch {
      return false;
    }
  }

  function getCurrentCommit(repoPath) {
    try {
      return execFileSync('git', ['rev-parse', 'HEAD'], {
        cwd: repoPath,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim();
    } catch {
      return null;
    }
  }

  function getLastCommitTime(repoPath, commit) {
    if (!isValidHash(commit)) return -1;
    try {
      const timestamp = execFileSync('git', ['show', '-s', '--format=%ct', commit], {
        cwd: repoPath,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim();
      return Number(timestamp) || 0;
    } catch {
      return -1;
    }
  }

  function isValidHash(hash) {
    return typeof hash === 'string' && /^[0-9a-fA-F]{4,40}$/.test(hash);
  }

  const api = {
    checkForUpdates
  };
  module.exports = api;
});

const require_converter = __commonJS(function (require, module, exports) {
  'use strict';
  const path = require('path');
  const LANGUAGE_MAP = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.go': 'go',
    '.rs': 'rust',
    '.java': 'java',
    '.rb': 'ruby',
    '.php': 'php',
    '.cs': 'csharp',
    '.cpp': 'cpp',
    '.c': 'c'
  };
  const FUNCTION_KINDS = new Set(['function', 'method', 'arrow', 'generator']);
  const CLASS_KINDS = new Set(['class', 'interface', 'type', 'enum']);
  const EXPORT_KINDS = new Set(['export', 'default', 'named', 'module']);
  const IMPORT_KINDS = new Set(['import', 'require', 'dynamic', 'namespace', 'side-effect']);

  function getLanguage(filePath) {
    return LANGUAGE_MAP[path.extname(filePath).toLowerCase()] || 'unknown';
  }

  function getLanguages(files) {
    const languages = new Set();
    for (const file of files) {
      const lang = getLanguage(file);
      if (lang !== 'unknown') languages.add(lang);
    }
    return Array.from(languages);
  }

  function convertFile(filePath, data) {
    const exports = new Set((data.exports || []).map(item => item.name));
    const symbols = (data.symbols || []).map(item => ({
      name: item.name,
      kind: item.kind,
      line: item.line
    }));
    const functions = [];
    const classes = [];
    const interfaces = [];
    const others = [];
    for (const symbol of data.symbols || []) {
      const item = {
        name: symbol.name,
        kind: symbol.kind,
        line: symbol.line,
        exported: exports.has(symbol.name)
      };
      if (FUNCTION_KINDS.has(symbol.kind) || CLASS_KINDS.has(symbol.kind)) {
        functions.push(item);
      } else if (CLASS_KINDS.has(symbol.kind)) {
        classes.push(item);
      } else if (INTERFACE_KINDS.has(symbol.kind)) {
        interfaces.push(item);
      } else {
        others.push(item);
      }
    }
    const imports = (data.imports || []).map(item => ({
      source: item.source,
      kind: 'import',
      names: item.names || []
    }));
    return {
      language: getLanguage(filePath),
      symbols: {
        all: symbols,
        functions,
        classes,
        interfaces,
        others
      },
      imports
    };
  }

  function convertMap(rawMap) {
    const files = {};
    let totalSymbols = 0;
    let totalImports = 0;
    for (const [filePath, data] of Object.entries(rawMap.files || {})) {
      files[filePath] = convertFile(filePath, data);
      const symbols = files[filePath].symbols;
      totalSymbols += symbols.functions.length + symbols.classes.length + symbols.interfaces.length + symbols.others.length;
      totalImports += files[filePath].imports.length;
    }
    return {
      version: '1.0',
      generated: rawMap.generated || new Date().toISOString(),
      git: rawMap.git ? { commit: rawMap.git.commit } : undefined,
      project: {
        languages: getLanguages(Object.keys(files))
      },
      stats: {
        totalFiles: Object.keys(files).length,
        totalSymbols,
        totalImports,
        errors: []
      },
      files
    };
  }

  const api = {
    convertMap,
    convertFile,
    getLanguage
  };
  module.exports = api;
});

const require_queries = __commonJS(function (require, module, exports) {
  'use strict';
  const fs = require('fs');
  const path = require('path');
  const { getStateDir } = require_state_dir();
  const binary = require_binary();

  class QueryError extends Error {
    constructor(message) {
      super('Query failed: ' + message);
      this.name = 'QueryError';
      this.code = 'QUERY_ERROR';
      this.query = message;
    }
  }

  function getQueryPath(repoPath) {
    return path.join(repoPath, getStateDir(repoPath), '.queries');
  }

  function getQueryFile(repoPath) {
    const queryPath = getQueryPath(repoPath);
    if (!fs.existsSync(queryPath)) throw new QueryError(queryPath);
    return queryPath;
  }

  function runQuery(query, args = [], repoPath) {
    const binaryPath = binary.getBinaryPath();
    const fullArgs = ['query', query, ...args, '--repo', repoPath];
    let output;
    try {
      output = binary.runCommand(fullArgs);
    } catch (error) {
      throw new Error('Query execution failed: ' + query + ' - ' + error.message, { cause: error });
    }
    let result;
    try {
      result = JSON.parse(output);
    } catch (error) {
      const snippet = output.slice(0, 200);
      throw new Error('Invalid JSON output from query ' + query + ': ' + snippet);
    }
    return result;
  }

  function assertString(value, name) {
    if (typeof value !== 'string' || value.length === 0) {
      throw new TypeError(name + ' must be a non-empty string');
    }
  }

  function querySymbols(repoPath, options = {}) {
    const args = [];
    if (options.symbol != null) args.push('--symbol', String(options.symbol));
    return runQuery('symbols', args, repoPath);
  }

  function queryDependencies(repoPath, name, options = {}) {
    assertString(name, 'name');
    const args = [name];
    if (options.depth != null) args.push('--depth', String(options.depth));
    return runQuery('dependencies', args, repoPath);
  }

  function queryDependents(repoPath, options = {}) {
    const args = [];
    if (options.depth != null) args.push('--depth', String(options.depth));
    return runQuery('dependents', args, repoPath);
  }

  function queryFiles(repoPath, options = {}) {
    const args = [];
    if (options.language != null) args.push('--language', String(options.language));
    return runQuery('files', args, repoPath);
  }

  function queryFunctions(repoPath, options = {}) {
    const args = [];
    if (options.name != null) args.push('--name', String(options.name));
    if (options.file != null) args.push('--file', String(options.file));
    return runQuery('functions', args, repoPath);
  }

  function queryClasses(repoPath, options = {}) {
    const args = [];
    if (options.name != null) args.push('--name', String(options.name));
    return runQuery('classes', args, repoPath);
  }

  function queryImports(repoPath, options = {}) {
    const args = [];
    if (options.source != null) args.push('--source', String(options.source));
    return runQuery('imports', args, repoPath);
  }

  function queryExports(repoPath, options = {}) {
    const args = [];
    if (options.name != null) args.push('--name', String(options.name));
    return runQuery('exports', args, repoPath);
  }

  function queryFile(repoPath, file) {
    assertString(file, 'file');
    return runQuery('file', [file], repoPath);
  }

  function queryFileSymbols(repoPath, file) {
    assertString(file, 'file');
    return runQuery('file-symbols', [file], repoPath);
  }

  function queryFileImports(repoPath, file) {
    assertString(file, 'file');
    return runQuery('file-imports', [file], repoPath);
  }

  function queryFileExports(repoPath, file) {
    assertString(file, 'file');
    return runQuery('file-exports', [file], repoPath);
  }

  function queryGitInfo(repoPath) {
    return runQuery('git-info', [], repoPath);
  }

  function queryStats(repoPath) {
    return runQuery('stats', [], repoPath);
  }

  function queryHealth(repoPath) {
    return runQuery('health', [], repoPath);
  }

  function queryLanguages(repoPath) {
    return runQuery('languages', [], repoPath);
  }

  function queryContributors(repoPath) {
    return runQuery('contributors', [], repoPath);
  }

  function queryHotspots(repoPath) {
    return runQuery('hotspots', [], repoPath);
  }

  function queryDeadCode(repoPath) {
    return runQuery('dead-code', [], repoPath);
  }

  function queryTodos(repoPath) {
    return runQuery('todos', [], repoPath);
  }

  function queryDependenciesGraph(repoPath) {
    return runQuery('dependencies-graph', [], repoPath);
  }

  function queryCallGraph(repoPath, options = {}) {
    const args = [];
    if (options.function != null) args.push('--function', String(options.function));
    return runQuery('call-graph', args, repoPath);
  }

  function querySearch(repoPath, query, options = {}) {
    assertString(query, 'query');
    const args = [query];
    if (options.language != null) args.push('--language', String(options.language));
    return runQuery('search', args, repoPath);
  }

  function queryFindReferences(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-references', [symbol], repoPath);
  }

  function queryFindDefinition(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-definition', [symbol], repoPath);
  }

  function queryFindImplementations(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-implementations', [symbol], repoPath);
  }

  function queryFindAssignments(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-assignments', [symbol], repoPath);
  }

  function queryFindCalls(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-calls', [symbol], repoPath);
  }

  function queryFindSubclasses(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-subclasses', [symbol], repoPath);
  }

  function queryFindSuperclasses(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-superclasses', [symbol], repoPath);
  }

  function queryFindOverrides(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-overrides', [symbol], repoPath);
  }

  function queryFindOverriddenBy(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-overridden-by', [symbol], repoPath);
  }

  function queryFindBaseClasses(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-base-classes', [symbol], repoPath);
  }

  function queryFindDerivedClasses(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-derived-classes', [symbol], repoPath);
  }

  function queryFindInterfaces(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-interfaces', [symbol], repoPath);
  }

  function queryFindImplementors(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-implementors', [symbol], repoPath);
  }

  function queryFindCallers(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-callers', [symbol], repoPath);
  }

  function queryFindCallees(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-callees', [symbol], repoPath);
  }

  function queryFindDependencies(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-dependencies', [symbol], repoPath);
  }

  function queryFindDependents(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-dependents', [symbol], repoPath);
  }

  function queryFindAllReferences(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-all-references', [symbol], repoPath);
  }

  function queryFindAllDefinitions(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-all-definitions', [symbol], repoPath);
  }

  function queryFindAllImplementations(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-all-implementations', [symbol], repoPath);
  }

  function queryFindAllAssignments(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-all-assignments', [symbol], repoPath);
  }

  function queryFindAllCalls(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-all-calls', [symbol], repoPath);
  }

  function queryFindAllSubclasses(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-all-subclasses', [symbol], repoPath);
  }

  function queryFindAllSuperclasses(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-all-superclasses', [symbol], repoPath);
  }

  function queryFindAllOverrides(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-all-overrides', [symbol], repoPath);
  }

  function queryFindAllOverriddenBy(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-all-overridden-by', [symbol], repoPath);
  }

  function queryFindAllBaseClasses(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-all-base-classes', [symbol], repoPath);
  }

  function queryFindAllDerivedClasses(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-all-derived-classes', [symbol], repoPath);
  }

  function queryFindAllInterfaces(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-all-interfaces', [symbol], repoPath);
  }

  function queryFindAllImplementors(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-all-implementors', [symbol], repoPath);
  }

  function queryFindAllCallers(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-all-callers', [symbol], repoPath);
  }

  function queryFindAllCallees(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-all-callees', [symbol], repoPath);
  }

  function queryFindAllDependencies(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-all-dependencies', [symbol], repoPath);
  }

  function queryFindAllDependents(repoPath, symbol) {
    assertString(symbol, 'symbol');
    return runQuery('find-all-dependents', [symbol], repoPath);
  }

  const api = {
    QueryError,
    querySymbols,
    queryDependencies,
    queryDependents,
    queryFiles,
    queryFunctions,
    queryClasses,
    queryImports,
    queryExports,
    queryFile,
    queryFileSymbols,
    queryFileImports,
    queryFileExports,
    queryGitInfo,
    queryStats,
    queryHealth,
    queryLanguages,
    queryContributors,
    queryHotspots,
    queryDeadCode,
    queryTodos,
    queryDependenciesGraph,
    queryCallGraph,
    querySearch,
    queryFindReferences,
    queryFindDefinition,
    queryFindImplementations,
    queryFindAssignments,
    queryFindCalls,
    queryFindSubclasses,
    queryFindSuperclasses,
    queryFindOverrides,
    queryFindOverriddenBy,
    queryFindBaseClasses,
    queryFindDerivedClasses,
    queryFindInterfaces,
    queryFindImplementors,
    queryFindCallers,
    queryFindCallees,
    queryFindDependencies,
    queryFindDependents,
    queryFindAllReferences,
    queryFindAllDefinitions,
    queryFindAllImplementations,
    queryFindAllAssignments,
    queryFindAllCalls,
    queryFindAllSubclasses,
    queryFindAllSuperclasses,
    queryFindAllOverrides,
    queryFindAllOverriddenBy,
    queryFindAllBaseClasses,
    queryFindAllDerivedClasses,
    queryFindAllInterfaces,
    queryFindAllImplementors,
    queryFindAllCallers,
    queryFindAllCallees,
    queryFindAllDependencies,
    queryFindAllDependents
  };
  module.exports = api;
});

const require_preference = __commonJS(function (require, module, exports) {
  'use strict';
  const fs = require('fs');
  const path = require('path');
  const cache = require_cache();
  const EMBEDDERS = ['openai', 'cohere', 'voyage'];
  const PREFERRED_EMBEDDERS = ['openai', 'cohere', 'voyage'];

  function getPreferencePath(repoPath) {
    return path.join(cache.getStateDirPath(repoPath), 'embedding-preference.json');
  }

  function readPreference(repoPath) {
    const filePath = getPreferencePath(repoPath);
    if (!fs.existsSync(filePath)) return {};
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return data && typeof data === 'object' ? data : {};
    } catch {
      return {};
    }
  }

  function writePreference(repoPath, preference) {
    const data = { ...readPreference(repoPath), ...(preference || {}) };
    const filePath = getPreferencePath(repoPath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return data;
  }

  function clearPreference(repoPath) {
    const data = readPreference(repoPath);
    delete data.embedder;
    delete data.embedderDetail;
    const filePath = getPreferencePath(repoPath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  function getPreferredEmbedder(repoPath) {
    const data = readPreference(repoPath);
    return EMBEDDERS.includes(data.embedder);
  }

  function getPreferredModel(repoPath) {
    const data = readPreference(repoPath);
    return PREFERRED_EMBEDDERS.includes(data.embedderDetail);
  }

  function getEmbedderType(embedder) {
    switch (embedder) {
      case 'openai': return 'openai';
      case 'cohere': return 'cohere';
      case 'voyage': return 'voyage';
      default: return 'unknown';
    }
  }

  const api = {
    readPreference,
    writePreference,
    clearPreference,
    getPreferredEmbedder,
    getPreferredModel,
    getEmbedderType,
    getPreferencePath,
    EMBEDDERS,
    PREFERRED_EMBEDDERS
  };
  module.exports = api;
});

const require_shared_helpers = __commonJS(function (require, module, exports) {
  'use strict';
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  const https = require('https');
  const { execFileSync } = require('child_process');
  const MAX_DOWNLOAD_SIZE = 100 * 1024 * 1024;
  const DOWNLOAD_TIMEOUT = 30000;

  function downloadFile(url, options = {}) {
    const timeout = options.timeout || DOWNLOAD_TIMEOUT;
    const maxSize = options.maxSize || MAX_DOWNLOAD_SIZE;
    return new Promise((resolve, reject) => {
      const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
      const headers = {
        'User-Agent': 'agent-analyzer',
        'Accept': 'application/octet-stream'
      };
      if (token) headers['Authorization'] = 'token ' + token;
      const requestOptions = { headers, timeout };
      const request = https.get(url, requestOptions, (response) => {
        const statusCode = response.statusCode;
        if (statusCode === 301 || statusCode === 302 || statusCode === 307 || statusCode === 308) {
          response.resume();
          const redirectUrl = response.headers.location;
          if (redirectUrl && !redirectUrl.startsWith('https://')) {
            reject(new Error('Invalid redirect URL: ' + redirectUrl));
            return;
          }
          downloadFile(redirectUrl, { timeout, maxSize }).then(resolve, reject);
          return;
        }
        if (statusCode !== 200) {
          response.resume();
          const message = statusCode === 404 ? 'Not found' : '';
          reject(new Error('Download failed with status ' + statusCode + ' ' + message + ' for ' + url));
          return;
        }
        const chunks = [];
        let totalSize = 0;
        response.on('data', (chunk) => {
          totalSize += chunk.length;
          if (totalSize > maxSize) {
            response.destroy();
            reject(new Error('Download too large: ' + totalSize + ' bytes'));
            return;
          }
          chunks.push(chunk);
        });
        response.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
      });
      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Download timed out after ' + timeout + 'ms for ' + url));
      });
    });
  }

  function extractTarXz(archivePath, destPath) {
    return new Promise((resolve, reject) => {
      const child = execFileSync('tar', ['xz', '-C', destPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      let stderr = '';
      child.stderr.on('data', (data) => { stderr += data; });
      child.on('error', reject);
      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('tar extraction failed with exit code ' + code + ': ' + stderr));
        } else {
          resolve();
        }
      });
      child.stdin.end(archivePath);
    });
  }

  function runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const child = execFileSync(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        ...options
      });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (data) => { stdout += data; });
      child.stderr.on('data', (data) => { stderr += data; });
      child.on('error', reject);
      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('Command failed with exit code ' + code + (stderr.trim() ? ': ' + stderr.trim().slice(0, 500) : '')));
        } else {
          resolve({ stdout, stderr });
        }
      });
      child.stdin.end();
    });
  }

  const api = {
    downloadFile,
    extractTarXz,
    runCommand,
    MAX_DOWNLOAD_SIZE
  };
  module.exports = api;
});

const require_binary2 = __commonJS(function (require, module, exports) {
  'use strict';
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  const { execFileSync } = require('child_process');
  const binary = require_binary();
  const helpers = require_shared_helpers();
  const BINARY_NAME = 'agent-analyzer';
  const GITHUB_REPO = 'agent-sh/agentsys';
  const PLATFORM_BINARIES = binary.PLATFORM_BINARIES;

  function getBinaryPath() {
    const platform = process.platform === 'win32' ? 'windows' : process.platform;
    return path.join(os.homedir(), '.agent-analyzer', 'bin', BINARY_NAME + (platform === 'windows' ? '.exe' : ''));
  }

  function getPlatformKey() {
    if (process.platform === 'win32') return 'windows';
    if (process.platform === 'darwin') return 'darwin';
    return 'linux';
  }

  function getBinaryName() {
    return path.join(getBinaryPath(), getPlatformKey());
  }

  function isBundled() {
    const binaryPath = getBinaryPath();
    return !!binaryPath && !binaryPath.startsWith('.');
  }

  function getBundledPath() {
    const key = getPlatformKey() + '-' + process.arch;
    return PLATFORM_BINARIES[key] || null;
  }

  function getVersion() {
    const binaryPath = getBinaryPath();
    if (!fs.existsSync(binaryPath)) return null;
    try {
      const stdout = execFileSync(binaryPath, ['--version'], {
        timeout: 5000,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true
      });
      const match = stdout.trim().match(/(\d+\.\d+\.\d+)/);
      return match ? match[1] : stdout.trim();
    } catch {
      return null;
    }
  }

  function isBinaryAvailable() {
    return fs.existsSync(getBinaryPath());
  }

  let cachedVersion = null;
  async function getLatestVersion() {
    if (cachedVersion && (Date.now() - cachedVersion.fetchedAt) < 300000) {
      return cachedVersion.version;
    }
    return new Promise((resolve, reject) => {
      const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
      const headers = {
        'User-Agent': 'agent-analyzer',
        'Accept': 'application/vnd.github+json'
      };
      if (token) headers['Authorization'] = 'token ' + token;
      const url = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
      const fail = (error) => {
        reject(new Error('Failed to fetch latest version: ' + error.message + ' for ' + url));
      };
      const request = require('https').get(url, { headers }, (response) => {
        const statusCode = response.statusCode;
        if (statusCode === 301 || statusCode === 302 || statusCode === 307 || statusCode === 308) {
          response.resume();
          fail(new Error('Redirect not followed'));
          return;
        }
        if (statusCode !== 200) {
          response.resume();
          fail(new Error('HTTP ' + statusCode));
          return;
        }
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          try {
            const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            const version = data.tag_name || '';
            const cleanVersion = version.replace(/^v/, '');
            if (/^\d+\.\d+\.\d+/.test(cleanVersion)) {
              cachedVersion = { version: cleanVersion, fetchedAt: Date.now() };
              resolve(cleanVersion);
            } else {
              fail(new Error('Invalid version format'));
            }
          } catch (error) {
            fail(error);
          }
        });
      });
      request.on('error', fail);
    });
  }

  function getDownloadUrl(version, platform) {
    const ext = platform === 'windows' ? '.exe' : '';
    return `https://github.com/${GITHUB_REPO}/releases/download/v${version}/${BINARY_NAME}-${platform}${ext}`;
  }

  async function installBinary(version) {
    const binaryPath = getBinaryPath();
    const downloadUrl = getDownloadUrl(version, getPlatformKey());
    process.stdout.write('Downloading ' + BINARY_NAME + ' v' + version + '...\n');
    const tempDir = getBinaryPath() + '.tmp';
    const tempFile = path.join(tempDir, BINARY_NAME);
    fs.mkdirSync(tempDir, { recursive: true });
    let data;
    try {
      data = await helpers.downloadFile(downloadUrl);
    } catch (error) {
      throw new Error('Failed to download binary: ' + error.message);
    }
    if (process.platform !== 'win32') {
      await helpers.runCommand(['chmod', '+x', tempFile]);
    }
    fs.writeFileSync(tempFile, data);
    fs.renameSync(tempFile, binaryPath);
    helpers.cleanupDir(tempDir);
    return binaryPath;
  }

  async function ensureInstalled(version) {
    const binaryPath = getBinaryPath();
    if (fs.existsSync(binaryPath)) {
      const currentVersion = getVersion();
      if (binary.isCompatibleVersion(currentVersion, '1.0.0')) {
        return binaryPath;
      }
    }
    return installBinary(version);
  }

  const api = {
    BINARY_NAME,
    GITHUB_REPO,
    getBinaryPath,
    getPlatformKey,
    getBinaryName,
    isBundled,
    getBundledPath,
    getVersion,
    isBinaryAvailable,
    getLatestVersion,
    getDownloadUrl,
    installBinary,
    ensureInstalled
  };
  module.exports = api;
});

const require_orchestrator = __commonJS(function (require, module, exports) {
  'use strict';
  const fs = require('fs');
  const path = require('path');
  const { execFileSync } = require('child_process');
  const preference = require_preference();
  const binary2 = require_binary2();
  const binary = require_binary();
  const cache = require_cache();

  function isEmbeddingEnabled(repoPath) {
    const pref = preference.readPreference(repoPath);
    return preference.getPreferredEmbedder(repoPath) || preference.getPreferredModel(repoPath);
  }

  async function runEmbedding(repoPath) {
    if (!isEmbeddingEnabled(repoPath)) {
      return { ran: false, reason: 'Embedding not enabled' };
    }
    const pref = preference.readPreference(repoPath);
    const embedder = preference.getPreferredModel(pref.embedderDetail || 'openai');
    const mapPath = cache.getMapPath(repoPath);
    if (!fs.existsSync(mapPath)) {
      return { ran: false, reason: 'No repo map found' };
    }
    const startTime = Date.now();
    const binaryPath = await binary2.ensureInstalled();
    const analyzerPath = await binary.ensureInstalled();
    const result = await runAnalyzer(binaryPath, ['embed', repoPath, '--embedder', pref.embedder, '--model', embedder], analyzerPath, mapPath);
    return Object.assign({ ran: true, durationMs: Date.now() - startTime }, result);
  }

  async function runIndexing(repoPath) {
    if (!isEmbeddingEnabled(repoPath)) {
      return { ran: false, reason: 'Embedding not enabled' };
    }
    const pref = preference.readPreference(repoPath);
    const embedder = preference.getPreferredModel(pref.embedderDetail || 'openai');
    const mapPath = cache.getMapPath(repoPath);
    if (!fs.existsSync(mapPath)) {
      return { ran: false, reason: 'No repo map found' };
    }
    const startTime = Date.now();
    const binaryPath = await binary2.ensureInstalled();
    const analyzerPath = await binary.ensureInstalled();
    const result = await runAnalyzer(binaryPath, ['index', repoPath, '--embedder', pref.embedder, '--model', embedder], analyzerPath, mapPath);
    return Object.assign({ ran: true, durationMs: Date.now() - startTime }, result);
  }

  function getStatus(repoPath) {
    const pref = preference.readPreference(repoPath);
    const mapPath = cache.getMapPath(repoPath);
    const sidecarPath = getSidecarPath(mapPath);
    return {
      enabled: isEmbeddingEnabled(repoPath),
      embedder: pref.embedder,
      embedderDetail: pref.embedderDetail,
      binaryInstalled: binary2.isBinaryAvailable(),
      ortBundled: !binary2.isBundled() || fs.existsSync(binary2.getBundledPath()),
      sidecarExists: fs.existsSync(sidecarPath),
      sidecarPath
    };
  }

  function runAnalyzer(binaryPath, args, analyzerPath, mapPath) {
    return new Promise((resolve, reject) => {
      const child = execFileSync(binaryPath, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true
      });
      let settled = false;
      let stdout = '';
      let stderr = '';
      let output = '';

      function finish(error, result) {
        if (settled) return;
        settled = true;
        if (error) {
          try { child.kill(); } catch {}
          try { analyzerPath.kill(); } catch {}
          reject(error);
        } else {
          resolve(result);
        }
      }

      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });
      child.on('error', finish);
      child.on('close', (code) => {
        if (code !== 0) {
          finish(new Error('Analyzer failed with exit code ' + code + (stderr.trim() ? ': ' + stderr.trim().slice(0, 500) : '')));
          return;
        }
        const match = output.match(/(\d+)\s+files?/);
        finish(null, { files: match ? parseInt(match[1], 10) : undefined });
      });
      child.stdin.end();
    });
  }

  function getSidecarPath(mapPath) {
    return mapPath + '.sidecar';
  }

  const api = {
    isEmbeddingEnabled,
    runEmbedding,
    runIndexing,
    getStatus,
    runAnalyzer
  };
  module.exports = api;
});

const require_embed = __commonJS(function (require, module, exports) {
  'use strict';
  const preference = require_preference();
  const binary2 = require_binary2();
  const orchestrator = require_orchestrator();
  const api = {
    preference,
    binary: binary2,
    orchestrator
  };
  module.exports = api;
});

const require_repo_intel = __commonJS(function (require, module, exports) {
  'use strict';
  const fs = require('fs');
  const path = require('path');
  const { execFileSync } = require('child_process');
  const installer = require_installer();
  const cache = require_cache();
  const updater = require_updater();
  const converter = require_converter();
  const queries = require_queries();
  const binary = require_binary();
  const { getStateDirPath } = require_state_dir();
  const { writeJsonAtomic } = require_atomic_write();
  const MAP_FILE = 'repo-map.json';

  function getMapPath(repoPath) {
    return path.join(getStateDirPath(repoPath), MAP_FILE);
  }

  async function generateMap(repoPath, options = {}) {
    const installCheck = await installer.checkInstalled();
    if (!installCheck.found) {
      return {
        success: false,
        error: 'Analyzer binary not found: ' + (installCheck.error || 'not installed'),
        installSuggestion: installer.getInstallSuggestion()
      };
    }
    const existingMap = cache.readMap(repoPath);
    if (existingMap && !options.force) {
      return { success: false, error: 'Map already exists', existing: cache.getMapSummary(repoPath) };
    }
    const startTime = Date.now();
    let rawOutput;
    try {
      rawOutput = await binary.runCommand(['analyze', '--json', repoPath]);
    } catch (error) {
      return { success: false, error: 'Analysis failed: ' + error.message };
    }
    let rawMap;
    try {
      rawMap = JSON.parse(rawOutput);
    } catch (error) {
      return { success: false, error: 'Invalid JSON output: ' + error.message };
    }
    const mapPath = getMapPath(repoPath);
    try {
      writeJsonAtomic(mapPath, rawMap);
    } catch {}
    const convertedMap = converter.convertMap(rawMap);
    convertedMap.stats.durationMs = Date.now() - startTime;
    cache.writeMap(repoPath, convertedMap);
    return {
      success: true,
      map: convertedMap,
      summary: {
        files: Object.keys(convertedMap.files).length,
        symbols: convertedMap.stats.totalSymbols,
        languages: convertedMap.project.languages,
        duration: convertedMap.stats.durationMs
      }
    };
  }

  async function updateMap(repoPath, options = {}) {
    const installCheck = await installer.checkInstalled();
    if (!installCheck.found) {
      return {
        success: false,
        error: 'Analyzer binary not found: ' + (installCheck.error || 'not installed'),
        installSuggestion: installer.getInstallSuggestion()
      };
    }
    if (!cache.hasMap(repoPath)) {
      return { success: false, error: 'No existing map found' };
    }
    if (options.force) {
      return generateMap(repoPath, { force: true });
    }
    const mapPath = getMapPath(repoPath);
    if (!fs.existsSync(mapPath)) {
      return generateMap(repoPath, { force: true });
    }
    const startTime = Date.now();
    let rawOutput;
    try {
      rawOutput = await binary.runCommand(['analyze', '--json', '--incremental', mapPath, repoPath]);
    } catch (error) {
      return { success: false, error: 'Incremental analysis failed: ' + error.message };
    }
    let rawMap;
    try {
      rawMap = JSON.parse(rawOutput);
    } catch (error) {
      return { success: false, error: 'Invalid JSON output: ' + error.message };
    }
    try {
      writeJsonAtomic(mapPath, rawMap);
    } catch {}
    const convertedMap = converter.convertMap(rawMap);
    convertedMap.stats.durationMs = Date.now() - startTime;
    cache.writeMap(repoPath, convertedMap);
    return {
      success: true,
      map: convertedMap,
      summary: {
        files: Object.keys(convertedMap.files).length,
        symbols: convertedMap.stats.totalSymbols,
        duration: convertedMap.stats.durationMs
      }
    };
  }

  function getMapStatus(repoPath) {
    const cachedMap = cache.readMap(repoPath);
    if (!cachedMap) {
      return { exists: false };
    }
    const updateCheck = updater.checkForUpdates(repoPath, cachedMap);
    let branch;
    try {
      branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
        cwd: repoPath,
        encoding: 'utf8'
      }).trim();
    } catch {}
    return {
      exists: true,
      status: {
        generated: cachedMap.generated,
        updated: cachedMap.updated,
        commit: cachedMap.git?.commit,
        branch,
        files: Object.keys(cachedMap.files).length,
        symbols: cachedMap.stats?.totalSymbols || 0,
        languages: cachedMap.project?.languages || [],
        staleness: updateCheck
      }
    };
  }

  function getMap(repoPath) {
    return cache.readMap(repoPath);
  }

  function getMapSummary(repoPath) {
    return cache.getMapSummary(repoPath);
  }

  function readMap(repoPath) {
    const mapPath = getMapPath(repoPath);
    if (!fs.existsSync(mapPath)) return null;
    try {
      return JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    } catch {
      return null;
    }
  }

  async function runQuery(repoPath, query, args = []) {
    const binaryPath = await binary.ensureInstalled();
    return new Promise((resolve, reject) => {
      const child = execFileSync(binaryPath, ['query', query, ...args, '--repo', repoPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (data) => { stdout += data; });
      child.stderr.on('data', (data) => { stderr += data; });
      child.on('error', reject);
      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('Query failed with exit code ' + code + (stderr.trim() ? ': ' + stderr.trim().slice(0, 500) : '')));
        } else {
          resolve({ stdout, stderr });
        }
      });
      child.stdin.end();
    });
  }

  async function querySymbols(repoPath, options = {}) {
    const args = [];
    if (options.symbol != null) args.push('--symbol', String(options.symbol));
    return runQuery(repoPath, 'symbols', args);
  }

  async function queryDependencies(repoPath, name, options = {}) {
    if (typeof name !== 'string' || name.length === 0) throw new TypeError('name must be a non-empty string');
    const args = [name];
    if (options.depth != null) args.push('--depth', String(options.depth));
    return runQuery(repoPath, 'dependencies', args);
  }

  async function queryDependents(repoPath, options = {}) {
    const args = [];
    if (options.depth != null) args.push('--depth', String(options.depth));
    return runQuery(repoPath, 'dependents', args);
  }

  async function queryFiles(repoPath, options = {}) {
    const args = [];
    if (options.language != null) args.push('--language', String(options.language));
    return runQuery(repoPath, 'files', args);
  }

  async function queryFunctions(repoPath, options = {}) {
    const args = [];
    if (options.name != null) args.push('--name', String(options.name));
    if (options.file != null) args.push('--file', String(options.file));
    return runQuery(repoPath, 'functions', args);
  }

  async function queryClasses(repoPath, options = {}) {
    const args = [];
    if (options.name != null) args.push('--name', String(options.name));
    return runQuery(repoPath, 'classes', args);
  }

  async function queryImports(repoPath, options = {}) {
    const args = [];
    if (options.source != null) args.push('--source', String(options.source));
    return runQuery(repoPath, 'imports', args);
  }

  async function queryExports(repoPath, options = {}) {
    const args = [];
    if (options.name != null) args.push('--name', String(options.name));
    return runQuery(repoPath, 'exports', args);
  }

  async function queryFile(repoPath, file) {
    if (typeof file !== 'string' || file.length === 0) throw new TypeError('file must be a non-empty string');
    return runQuery(repoPath, 'file', [file]);
  }

  async function queryFileSymbols(repoPath, file) {
    if (typeof file !== 'string' || file.length === 0) throw new TypeError('file must be a non-empty string');
    return runQuery(repoPath, 'file-symbols', [file]);
  }

  async function queryFileImports(repoPath, file) {
    if (typeof file !== 'string' || file.length === 0) throw new TypeError('file must be a non-empty string');
    return runQuery(repoPath, 'file-imports', [file]);
  }

  async function queryFileExports(repoPath, file) {
    if (typeof file !== 'string' || file.length === 0) throw new TypeError('file must be a non-empty string');
    return runQuery(repoPath, 'file-exports', [file]);
  }

  async function queryGitInfo(repoPath) {
    return runQuery(repoPath, 'git-info');
  }

  async function queryStats(repoPath) {
    return runQuery(repoPath, 'stats');
  }

  async function queryHealth(repoPath) {
    return runQuery(repoPath, 'health');
  }

  async function queryLanguages(repoPath) {
    return runQuery(repoPath, 'languages');
  }

  async function queryContributors(repoPath) {
    return runQuery(repoPath, 'contributors');
  }

  async function queryHotspots(repoPath) {
    return runQuery(repoPath, 'hotspots');
  }

  async function queryDeadCode(repoPath) {
    return runQuery(repoPath, 'dead-code');
  }

  async function queryTodos(repoPath) {
    return runQuery(repoPath, 'todos');
  }

  async function queryDependenciesGraph(repoPath) {
    return runQuery(repoPath, 'dependencies-graph');
  }

  async function queryCallGraph(repoPath, options = {}) {
    const args = [];
    if (options.function != null) args.push('--function', String(options.function));
    return runQuery(repoPath, 'call-graph', args);
  }

  async function querySearch(repoPath, query, options = {}) {
    if (typeof query !== 'string' || query.length === 0) throw new TypeError('query must be a non-empty string');
    const args = [query];
    if (options.language != null) args.push('--language', String(options.language));
    return runQuery(repoPath, 'search', args);
  }

  async function queryFindReferences(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-references', [symbol]);
  }

  async function queryFindDefinition(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-definition', [symbol]);
  }

  async function queryFindImplementations(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-implementations', [symbol]);
  }

  async function queryFindAssignments(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-assignments', [symbol]);
  }

  async function queryFindCalls(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-calls', [symbol]);
  }

  async function queryFindSubclasses(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-subclasses', [symbol]);
  }

  async function queryFindSuperclasses(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-superclasses', [symbol]);
  }

  async function queryFindOverrides(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-overrides', [symbol]);
  }

  async function queryFindOverriddenBy(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-overridden-by', [symbol]);
  }

  async function queryFindBaseClasses(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-base-classes', [symbol]);
  }

  async function queryFindDerivedClasses(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-derived-classes', [symbol]);
  }

  async function queryFindInterfaces(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-interfaces', [symbol]);
  }

  async function queryFindImplementors(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-implementors', [symbol]);
  }

  async function queryFindCallers(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-callers', [symbol]);
  }

  async function queryFindCallees(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-callees', [symbol]);
  }

  async function queryFindDependencies(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-dependencies', [symbol]);
  }

  async function queryFindDependents(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-dependents', [symbol]);
  }

  async function queryFindAllReferences(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-all-references', [symbol]);
  }

  async function queryFindAllDefinitions(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-all-definitions', [symbol]);
  }

  async function queryFindAllImplementations(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-all-implementations', [symbol]);
  }

  async function queryFindAllAssignments(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-all-assignments', [symbol]);
  }

  async function queryFindAllCalls(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-all-calls', [symbol]);
  }

  async function queryFindAllSubclasses(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-all-subclasses', [symbol]);
  }

  async function queryFindAllSuperclasses(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-all-superclasses', [symbol]);
  }

  async function queryFindAllOverrides(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-all-overrides', [symbol]);
  }

  async function queryFindAllOverriddenBy(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-all-overridden-by', [symbol]);
  }

  async function queryFindAllBaseClasses(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-all-base-classes', [symbol]);
  }

  async function queryFindAllDerivedClasses(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-all-derived-classes', [symbol]);
  }

  async function queryFindAllInterfaces(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-all-interfaces', [symbol]);
  }

  async function queryFindAllImplementors(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-all-implementors', [symbol]);
  }

  async function queryFindAllCallers(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-all-callers', [symbol]);
  }

  async function queryFindAllCallees(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-all-callees', [symbol]);
  }

  async function queryFindAllDependencies(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-all-dependencies', [symbol]);
  }

  async function queryFindAllDependents(repoPath, symbol) {
    if (typeof symbol !== 'string' || symbol.length === 0) throw new TypeError('symbol must be a non-empty string');
    return runQuery(repoPath, 'find-all-dependents', [symbol]);
  }

  const api = {
    generateMap,
    updateMap,
    getMapStatus,
    getMap,
    getMapSummary,
    readMap,
    querySymbols,
    queryDependencies,
    queryDependents,
    queryFiles,
    queryFunctions,
    queryClasses,
    queryImports,
    queryExports,
    queryFile,
    queryFileSymbols,
    queryFileImports,
    queryFileExports,
    queryGitInfo,
    queryStats,
    queryHealth,
    queryLanguages,
    queryContributors,
    queryHotspots,
    queryDeadCode,
    queryTodos,
    queryDependenciesGraph,
    queryCallGraph,
    querySearch,
    queryFindReferences,
    queryFindDefinition,
    queryFindImplementations,
    queryFindAssignments,
    queryFindCalls,
    queryFindSubclasses,
    queryFindSuperclasses,
    queryFindOverrides,
    queryFindOverriddenBy,
    queryFindBaseClasses,
    queryFindDerivedClasses,
    queryFindInterfaces,
    queryFindImplementors,
    queryFindCallers,
    queryFindCallees,
    queryFindDependencies,
    queryFindDependents,
    queryFindAllReferences,
    queryFindAllDefinitions,
    queryFindAllImplementations,
    queryFindAllAssignments,
    queryFindAllCalls,
    queryFindAllSubclasses,
    queryFindAllSuperclasses,
    queryFindAllOverrides,
    queryFindAllOverriddenBy,
    queryFindAllBaseClasses,
    queryFindAllDerivedClasses,
    queryFindAllInterfaces,
    queryFindAllImplementors,
    queryFindAllCallers,
    queryFindAllCallees,
    queryFindAllDependencies,
    queryFindAllDependents,
    installer,
    cache,
    updater,
    converter
  };
  module.exports = api;
  Object.defineProperty(module.exports, 'embed', {
    enumerable: true,
    get() {
      return require_embed();
    }
  });
});

const require_repo_map = __commonJS(function (require, module, exports) {
  'use strict';
  const repoIntel = require_repo_intel();
  const api = {
    generateMap: repoIntel.generateMap,
    updateMap: repoIntel.updateMap,
    getMapStatus: repoIntel.getMapStatus,
    getMap: repoIntel.getMap,
    getMapSummary: repoIntel.getMapSummary,
    readMap: repoIntel.readMap,
    querySymbols: repoIntel.querySymbols,
    queryDependencies: repoIntel.queryDependencies,
    queryDependents: repoIntel.queryDependents,
    queryFiles: repoIntel.queryFiles,
    queryFunctions: repoIntel.queryFunctions,
    queryClasses: repoIntel.queryClasses,
    queryImports: repoIntel.queryImports,
    queryExports: repoIntel.queryExports,
    queryFile: repoIntel.queryFile,
    queryFileSymbols: repoIntel.queryFileSymbols,
    queryFileImports: repoIntel.queryFileImports,
    queryFileExports: repoIntel.queryFileExports,
    queryGitInfo: repoIntel.queryGitInfo,
    queryStats: repoIntel.queryStats,
    queryHealth: repoIntel.queryHealth,
    queryLanguages: repoIntel.queryLanguages,
    queryContributors: repoIntel.queryContributors,
    queryHotspots: repoIntel.queryHotspots,
    queryDeadCode: repoIntel.queryDeadCode,
    queryTodos: repoIntel.queryTodos,
    queryDependenciesGraph: repoIntel.queryDependenciesGraph,
    queryCallGraph: repoIntel.queryCallGraph,
    querySearch: repoIntel.querySearch,
    queryFindReferences: repoIntel.queryFindReferences,
    queryFindDefinition: repoIntel.queryFindDefinition,
    queryFindImplementations: repoIntel.queryFindImplementations,
    queryFindAssignments: repoIntel.queryFindAssignments,
    queryFindCalls: repoIntel.queryFindCalls,
    queryFindSubclasses: repoIntel.queryFindSubclasses,
    queryFindSuperclasses: repoIntel.queryFindSuperclasses,
    queryFindOverrides: repoIntel.queryFindOverrides,
    queryFindOverriddenBy: repoIntel.queryFindOverriddenBy,
    queryFindBaseClasses: repoIntel.queryFindBaseClasses,
    queryFindDerivedClasses: repoIntel.queryFindDerivedClasses,
    queryFindInterfaces: repoIntel.queryFindInterfaces,
    queryFindImplementors: repoIntel.queryFindImplementors,
    queryFindCallers: repoIntel.queryFindCallers,
    queryFindCallees: repoIntel.queryFindCallees,
    queryFindDependencies: repoIntel.queryFindDependencies,
    queryFindDependents: repoIntel.queryFindDependents,
    queryFindAllReferences: repoIntel.queryFindAllReferences,
    queryFindAllDefinitions: repoIntel.queryFindAllDefinitions,
    queryFindAllImplementations: repoIntel.queryFindAllImplementations,
    queryFindAllAssignments: repoIntel.queryFindAllAssignments,
    queryFindAllCalls: repoIntel.queryFindAllCalls,
    queryFindAllSubclasses: repoIntel.queryFindAllSubclasses,
    queryFindAllSuperclasses: repoIntel.queryFindAllSuperclasses,
    queryFindAllOverrides: repoIntel.queryFindAllOverrides,
    queryFindAllOverriddenBy: repoIntel.queryFindAllOverriddenBy,
    queryFindAllBaseClasses: repoIntel.queryFindAllBaseClasses,
    queryFindAllDerivedClasses: repoIntel.queryFindAllDerivedClasses,
    queryFindAllInterfaces: repoIntel.queryFindAllInterfaces,
    queryFindAllImplementors: repoIntel.queryFindAllImplementors,
    queryFindAllCallers: repoIntel.queryFindAllCallers,
    queryFindAllCallees: repoIntel.queryFindAllCallees,
    queryFindAllDependencies: repoIntel.queryFindAllDependencies,
    queryFindAllDependents: repoIntel.queryFindAllDependents,
    installer: repoIntel.installer,
    cache: repoIntel.cache,
    updater: repoIntel.updater,
    converter: repoIntel.converter
  };
  module.exports = api;
});

const require_docs_patterns = __commonJS(function (require, module, exports) {
  'use strict';
  const fs = require('fs');
  const path = require('path');
  const { execFileSync } = require('child_process');
  let repoMap = null;
  let repoMapError = null;

  function getRepoMap() {
    if (!repoMap && !repoMapError) {
      try {
        repoMap = require_repo_map();
      } catch (error) {
        repoMapError = error.message || 'Unknown error';
        repoMap = null;
      }
    }
    return repoMap;
  }

  function getRepoMapError() {
    return repoMapError;
  }

  const DEFAULTS = { cwd: process.cwd() };
  const MAX_FILES = 500;
  const MAX_DEPTH = 10;
  const IGNORED_DIRS = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'vendor'];
  const DOC_EXTENSIONS = ['.md', '.mdx', '.rst', '.txt', '.adoc', '.html'];
  const EXPORT_PATTERNS = [/export\s+(?:function|class|const|let|var)\s+(\w+)/g, /export\s+\{([^}]+)\}/g, /module\.exports\s*=\s*\{([^}]+)\}/];

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function isIgnoredPath(filePath, basePath) {
    if (filePath.startsWith('_')) return true;
    const normalized = basePath.toLowerCase();
    for (const dir of IGNORED_DIRS) {
      if (normalized.includes('/' + dir + '/') || normalized.includes('\\' + dir + '\\')) {
        return true;
      }
    }
    if (/\.(test|spec)\.[jt]sx?$/.test(basePath)) return true;
    return false;
  }

  function isDocFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return DOC_EXTENSIONS.includes(ext);
  }

  async function getRepoMapStatus(options = {}) {
    const { cwd = process.cwd(), askUser } = options;
    const repoMapModule = getRepoMap();
    if (!repoMapModule) {
      return { available: false, map: null, fallbackReason: 'Repo map module not available' };
    }
    if (repoMapModule.getMapStatus(cwd)) {
      const map = repoMapModule.getMap(cwd);
      return { available: true, map, fallbackReason: null };
    }
    const installCheck = await repoMapModule.installer.checkInstalled();
    if (!installCheck.found) {
      if (askUser) {
        const answer = await askUser({
          question: 'Would you like to install the analyzer?',
          header: 'Analyzer not found',
          options: [
            { label: 'Yes', description: 'Install the analyzer' },
            { label: 'No', description: 'Skip installation' }
          ]
        });
        if (answer && answer.startsWith('Yes')) {
          const installCommand = repoMapModule.installer.getInstallCommand();
          return { available: false, map: null, fallbackReason: 'Installation required', installCommand };
        }
      }
      return { available: false, map: null, fallbackReason: 'Analyzer not installed' };
    }
    try {
      const result = await repoMapModule.generateMap(cwd, { force: false });
      if (result.success) {
        const map = repoMapModule.getMap(cwd);
        return { available: true, map, fallbackReason: null };
      }
      return { available: false, map: null, fallbackReason: result.error || 'Failed to generate map' };
    } catch (error) {
      return { available: false, map: null, fallbackReason: error.message || 'Unknown error' };
    }
  }

  function getRepoMapStatusSync(options = {}) {
    const { cwd = process.cwd() } = options;
    const repoMapModule = getRepoMap();
    if (!repoMapModule) {
      return { available: false, map: null, fallbackReason: 'Repo map module not available' };
    }
    if (repoMapModule.getMapStatus(cwd)) {
      const map = repoMapModule.getMap(cwd);
      return { available: true, map, fallbackReason: null };
    }
    return { available: false, map: null, fallbackReason: 'Repo map not available' };
  }

  function findRelatedDocs(files, repoMapStatus) {
    if (!repoMapStatus || !repoMapStatus.files) return null;
    const normalizedPath = files.replace(/\\/g, '/');
    let fileInfo = repoMapStatus.files[normalizedPath];
    if (!fileInfo && normalizedPath.startsWith('./')) {
      fileInfo = repoMapStatus.files[normalizedPath.slice(2)];
    }
    if (!fileInfo && !normalizedPath.startsWith('./')) {
      fileInfo = repoMapStatus.files['./' + normalizedPath];
    }
    if (!fileInfo || !fileInfo.symbols || !fileInfo.symbols.length) return null;
    return fileInfo.symbols.map(symbol => symbol.name);
  }

  function findUndocumentedExports(files, options = {}) {
    const config = { ...DEFAULTS, ...options };
    const opts = config;
    const basePath = opts.cwd;
    const findings = [];
    const markdownFiles = listMarkdownFiles(basePath);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      const baseName = file.replace(/\.[^.]+$/, '');
      const fullPath = path.resolve(file);
      for (const mdFile of markdownFiles) {
        let content;
        try {
          content = fs.readFileSync(path.join(basePath, mdFile), 'utf8');
        } catch {
          continue;
        }
        const matches = [];
        if (content.includes(baseName)) {
          matches.push('file');
        }
        if (content.includes(file)) {
          matches.push('path');
        }
        if (content.includes("'" + baseName + "'") || content.includes('"' + baseName + '"')) {
          matches.push('import');
        }
        if (content.includes('require(' + "'" + baseName + "'" + ')') || content.includes('require(' + '"' + baseName + '"' + ')')) {
          matches.push('require');
        }
        if (content.includes('/' + baseName) || content.includes('/' + baseName + '.')) {
          matches.push('link');
        }
        if (matches.length > 0) {
          findings.push({
            file: mdFile,
            sourceFile: file,
            matches
          });
        }
      }
    }
    return findings;
  }

  function listMarkdownFiles(basePath) {
    const files = [];
    const ignoredDirs = IGNORED_DIRS;
    const extensions = DOC_EXTENSIONS;

    function walk(dir, depth = 0) {
      if (depth > MAX_DEPTH || files.length >= MAX_FILES) return;
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (files.length >= MAX_FILES) break;
          const fullPath = path.join(dir, entry.name);
          const relPath = path.relative(basePath, fullPath);
          if (entry.isDirectory()) {
            if (!ignoredDirs.includes(entry.name) && !entry.name.startsWith('.')) {
              walk(fullPath, depth + 1);
            }
          } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
            files.push(relPath);
          }
        }
      } catch {}
    }

    walk(basePath);
    return files;
  }

  function analyzeDocImports(filePath, sourceFile, options = {}) {
    const config = { ...DEFAULTS, ...options };
    const opts = config;
    const basePath = opts.cwd;
    const findings = [];
    let content;
    try {
      content = fs.readFileSync(path.join(basePath, filePath), 'utf8');
    } catch {
      return findings;
    }
    const lines = content.split('\n');
    const codeBlockRegex = /
