var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x3ba733, _0x34a341) => function _0x76cd5b() {
  if (!_0x34a341) {
    (0, _0x3ba733[__getOwnPropNames(_0x3ba733)[0]])((_0x34a341 = {
      exports: {}
    }).exports, _0x34a341);
  }
  return _0x34a341.exports;
};
var require_fs_safe = __commonJS({
  "../work/agent-sh__agentsys/lib/utils/fs-safe.js"(_0x1e3bb5, _0x2e6edd) {
    'use strict';

    var _0x31db1a = require("fs");
    function _0x104169(_0x2062ec, _0x41f096, _0x16a208 = "utf8") {
      const _0x48d0d7 = _0x31db1a.openSync(_0x2062ec, "r");
      try {
        const _0x45beed = _0x31db1a.fstatSync(_0x48d0d7);
        if (!_0x45beed.isFile()) {
          const _0x103ab9 = new Error("Not a regular file: " + _0x2062ec);
          _0x103ab9.code = "ENOTFILE";
          throw _0x103ab9;
        }
        if (typeof _0x41f096 === "number" && _0x45beed.size > _0x41f096) {
          const _0x25e61f = new Error("File too large: " + _0x45beed.size + " > " + _0x41f096 + " bytes");
          _0x25e61f.code = "EFBIG";
          throw _0x25e61f;
        }
        return _0x31db1a.readFileSync(_0x48d0d7, _0x16a208);
      } finally {
        _0x31db1a.closeSync(_0x48d0d7);
      }
    }
    const _0x521b7c = {
      readFileWithLimit: _0x104169
    };
    _0x2e6edd.exports = _0x521b7c;
  }
});
var require_atomic_write = __commonJS({
  "../work/agent-sh__agentsys/lib/utils/atomic-write.js"(_0x5aa3ba, _0x57a727) {
    var _0xd679d4 = require("fs");
    var _0x501d6c = require("path");
    var _0x212894 = require("crypto");
    function _0x1024b1(_0x44043f) {
      const _0x5acdbb = _0x501d6c.dirname(_0x44043f);
      const _0x23ff97 = _0x501d6c.basename(_0x44043f);
      const _0x2a15b4 = _0x212894.randomBytes(6).toString("hex");
      return _0x501d6c.join(_0x5acdbb, "." + _0x23ff97 + "." + _0x2a15b4 + ".tmp");
    }
    function _0x4a43e0(_0xc9b1a3, _0x5efb91, _0x44d9ad = {}) {
      const {
        encoding = "utf8",
        mode = 420
      } = _0x44d9ad;
      const _0x1ab81a = _0x501d6c.dirname(_0xc9b1a3);
      if (!_0xd679d4.existsSync(_0x1ab81a)) {
        _0xd679d4.mkdirSync(_0x1ab81a, {
          recursive: true
        });
      }
      const _0x24790b = _0x1024b1(_0xc9b1a3);
      try {
        const _0x57a1c7 = {
          encoding: encoding,
          mode: mode
        };
        _0xd679d4.writeFileSync(_0x24790b, _0x5efb91, _0x57a1c7);
        _0xd679d4.renameSync(_0x24790b, _0xc9b1a3);
        return true;
      } catch (_0x2fae2b) {
        try {
          if (_0xd679d4.existsSync(_0x24790b)) {
            _0xd679d4.unlinkSync(_0x24790b);
          }
        } catch {}
        throw _0x2fae2b;
      }
    }
    function _0x9ee0bc(_0x409445, _0x5bb82d, _0x35b864 = {}) {
      const {
        indent = 2,
        ..._0x48ed21
      } = _0x35b864;
      const _0x3e4823 = JSON.stringify(_0x5bb82d, null, indent);
      return _0x4a43e0(_0x409445, _0x3e4823, _0x48ed21);
    }
    const _0x3c7056 = {
      writeFileAtomic: _0x4a43e0,
      writeJsonAtomic: _0x9ee0bc,
      getTempPath: _0x1024b1
    };
    _0x57a727.exports = _0x3c7056;
  }
});
var require_cross_platform = __commonJS({
  "../work/agent-sh__agentsys/lib/cross-platform/index.js"(_0x2cda50, _0x3092b8) {
    var _0x453352 = require("path");
    var _0x2e0b00 = require("fs");
    var _0x2d3949 = require("os");
    function _0x22ccac(_0x1f2e3c, _0x11f188) {
      const _0x3470e5 = _0x1f2e3c.split(".").map(_0x41bec7 => parseInt(_0x41bec7, 10) || 0);
      const _0x1c63c9 = _0x11f188.split(".").map(_0x38628c => parseInt(_0x38628c, 10) || 0);
      for (let _0x59d48c = 0; _0x59d48c < Math.max(_0x3470e5.length, _0x1c63c9.length); _0x59d48c++) {
        const _0x3c8087 = _0x3470e5[_0x59d48c] || 0;
        const _0x13e006 = _0x1c63c9[_0x59d48c] || 0;
        if (_0x3c8087 < _0x13e006) {
          return -1;
        }
        if (_0x3c8087 > _0x13e006) {
          return 1;
        }
      }
      return 0;
    }
    var _0x37150e = {
      CLAUDE_CODE: "claude-code",
      OPENCODE: "opencode",
      CODEX_CLI: "codex-cli"
    };
    const _0x18ab99 = {
      [_0x37150e.CLAUDE_CODE]: ".claude",
      [_0x37150e.OPENCODE]: ".opencode",
      [_0x37150e.CODEX_CLI]: ".codex"
    };
    var _0x267d89 = _0x18ab99;
    function _0x107d83() {
      return process.env.AI_STATE_DIR || _0x267d89[_0x37150e.CLAUDE_CODE];
    }
    function _0x1352c4() {
      const _0x1922ad = process.env.AI_STATE_DIR;
      if (_0x1922ad === ".opencode") {
        return _0x37150e.OPENCODE;
      }
      if (_0x1922ad === ".codex") {
        return _0x37150e.CODEX_CLI;
      }
      return _0x37150e.CLAUDE_CODE;
    }
    function _0x483f8a(_0x12d5d9 = "enhance") {
      if (process.env.PLUGIN_ROOT) {
        return process.env.PLUGIN_ROOT;
      }
      const _0x55654f = _0x107d83();
      const _0x2d5e61 = _0x2d3949.homedir();
      const _0x28caa5 = [_0x453352.join(_0x2d5e61, _0x55654f, "plugins", "cache", "agentsys", _0x12d5d9), _0x453352.join(_0x2d5e61, _0x55654f, "plugins", "agentsys", _0x12d5d9)];
      for (const _0x52a19d of _0x28caa5) {
        if (_0x2e0b00.existsSync(_0x52a19d)) {
          const _0x357324 = _0x2e0b00.readdirSync(_0x52a19d).filter(_0x4cfed2 => {
            return _0x2e0b00.statSync(_0x453352.join(_0x52a19d, _0x4cfed2)).isDirectory();
          });
          if (_0x357324.length > 0) {
            const _0x275857 = _0x357324.sort(_0x22ccac).reverse()[0];
            return _0x453352.join(_0x52a19d, _0x275857);
          }
        }
      }
      return null;
    }
    function _0x17b720() {
      const _0x3e34e0 = _0x107d83();
      const _0x22911f = _0x2d3949.homedir();
      return _0x453352.join(_0x22911f, _0x3e34e0, "enhance", "suppressions.json");
    }
    var _0x2d041e = {
      maxDescriptionLength: 100,
      namingPattern: /^[a-z][a-z0-9_]*$/,
      preferFlatStructures: true,
      useEnumsForConstraints: true,
      documentDefaults: true
    };
    function _0x265381(_0x3f12cf, _0x4330b6, _0x45ff8e = {}, _0x33e1ae = []) {
      if (!_0x2d041e.namingPattern.test(_0x3f12cf)) {
        console.warn("Tool name \"" + _0x3f12cf + "\" should be snake_case");
      }
      if (_0x4330b6.length > _0x2d041e.maxDescriptionLength) {
        console.warn("Tool \"" + _0x3f12cf + "\" description exceeds " + _0x2d041e.maxDescriptionLength + " chars");
      }
      const _0x3c815d = {
        type: "object",
        properties: _0x45ff8e,
        required: _0x33e1ae
      };
      const _0x54c25c = {
        name: _0x3f12cf,
        description: _0x4330b6,
        inputSchema: _0x3c815d
      };
      return _0x54c25c;
    }
    function _0x27cde8(_0x799a1f) {
      const _0x5634c0 = typeof _0x799a1f === "object" ? JSON.stringify(_0x799a1f, null, 2) : String(_0x799a1f);
      const _0x1777dc = {
        type: "text",
        text: _0x5634c0
      };
      const _0x5aa8f8 = {
        content: [_0x1777dc]
      };
      return _0x5aa8f8;
    }
    function _0x4297c9(_0x28745f, _0xddc375 = null) {
      let _0x508d80 = "Error: " + _0x28745f;
      if (_0xddc375) {
        _0x508d80 += "\nDetails: " + JSON.stringify(_0xddc375);
      }
      const _0x4125e7 = {
        type: "text",
        text: _0x508d80
      };
      const _0x2845a0 = {
        content: [_0x4125e7],
        isError: true
      };
      return _0x2845a0;
    }
    function _0x58e3e6(_0x62c6f3, _0x5595f5 = []) {
      let _0x205558 = "Error: Unknown tool \"" + _0x62c6f3 + "\"";
      if (_0x5595f5.length > 0) {
        _0x205558 += "\nAvailable tools: " + _0x5595f5.join(", ");
      }
      const _0x57c492 = {
        type: "text",
        text: _0x205558
      };
      const _0x3be99c = {
        content: [_0x57c492],
        isError: true
      };
      return _0x3be99c;
    }
    function _0x173263(_0x11682d, _0x809d3) {
      return "<" + _0x11682d + ">\n" + _0x809d3 + "\n</" + _0x11682d + ">";
    }
    function _0x5ac629(_0x244de4, _0x4d10b9 = false) {
      return _0x244de4.map((_0x1acb40, _0x29f35c) => {
        const _0x3b8171 = _0x4d10b9 ? _0x29f35c + 1 + "." : "-";
        return _0x3b8171 + " " + _0x1acb40;
      }).join("\n");
    }
    function _0x5ccd8b(_0x260c98, _0x3ef153) {
      return "## " + _0x260c98 + "\n\n" + _0x3ef153 + "\n";
    }
    function _0x4300b7(_0x984357, _0x1d0da3) {
      if (_0x1d0da3 <= 0) {
        return _0x984357;
      }
      const _0x308b14 = [..._0x984357];
      if (_0x308b14.length <= _0x1d0da3) {
        return _0x984357;
      }
      return _0x308b14.slice(0, _0x1d0da3 - 3).join("") + "...";
    }
    function _0x41b2af(_0x3b73a4, _0x5b6b34, _0x3b973c = 10) {
      const _0x5ee6e0 = _0x3b73a4.slice(0, _0x3b973c);
      const _0x22bf5e = _0x3b73a4.length > _0x3b973c;
      const _0x16a0b0 = {};
      for (const _0x20da62 of _0x5ee6e0) {
        const _0xff358b = _0x5b6b34(_0x20da62);
        _0x16a0b0[_0xff358b] = (_0x16a0b0[_0xff358b] || 0) + 1;
      }
      const _0x193ff5 = {
        total: _0x3b73a4.length,
        showing: _0x5ee6e0.length,
        truncated: _0x22bf5e,
        byKey: _0x16a0b0
      };
      return _0x193ff5;
    }
    var _0x2bd9dc = "# Agent: {name}\n\n## Role\n{role}\n\n## Instructions\n{instructions}\n\n## Tools Available\n{tools}\nIf a tool is not listed above, respond with: \"Tool not available\"\n\n## Output Format\n{outputFormat}\n\n## Critical Constraints\n{constraints}";
    function _0xd7f42c(_0x3d15a4) {
      const {
        name: _0x3cd116,
        role: _0x1d94db,
        instructions = [],
        tools = [],
        outputFormat = "Respond with structured JSON",
        constraints = []
      } = _0x3d15a4;
      const _0x307a8d = instructions.map((_0x27ea90, _0x46c69e) => _0x46c69e + 1 + ". " + _0x27ea90).join("\n");
      const _0x2236b6 = tools.map(_0x452364 => "- " + _0x452364.name + ": " + _0x452364.description).join("\n");
      const _0x338230 = constraints.map(_0xc299ab => "- **" + _0xc299ab + "**").join("\n");
      return _0x2bd9dc.replace("{name}", _0x3cd116).replace("{role}", _0x1d94db).replace("{instructions}", _0x307a8d).replace("{tools}", _0x2236b6).replace("{outputFormat}", outputFormat).replace("{constraints}", _0x338230);
    }
    function _0x25e18c(_0x491c49) {
      return _0x491c49.replace(/\\/g, "/");
    }
    function _0x179d69(_0x2e6238, _0x599af3 = {}) {
      return {
        mcp: {
          agentsys: {
            type: "local",
            command: ["node", _0x2e6238],
            environment: {
              PLUGIN_ROOT: _0x453352.dirname(_0x453352.dirname(_0x2e6238)),
              AI_STATE_DIR: ".opencode",
              ..._0x599af3
            },
            timeout: 10000,
            enabled: true
          }
        }
      };
    }
    function _0x502713(_0x3ae615, _0x652788 = {}) {
      const _0xdef7bd = Object.entries({
        PLUGIN_ROOT: _0x453352.dirname(_0x453352.dirname(_0x3ae615)),
        AI_STATE_DIR: ".codex",
        ..._0x652788
      }).map(([_0x2316a4, _0x58f8e9]) => _0x2316a4 + " = \"" + _0x58f8e9 + "\"").join(", ");
      return ("\n[mcp_servers.agentsys]\ncommand = \"node\"\nargs = [\"" + _0x3ae615 + "\"]\nenv = { " + _0xdef7bd + " }\nenabled = true\n").trim();
    }
    const _0x2f4edd = {
      [_0x37150e.CLAUDE_CODE]: ["CLAUDE.md", ".claude/CLAUDE.md"],
      [_0x37150e.OPENCODE]: ["AGENTS.md", "CLAUDE.md"],
      [_0x37150e.CODEX_CLI]: ["AGENTS.md", "AGENTS.override.md"]
    };
    var _0x3b744e = _0x2f4edd;
    function _0x2188d3(_0xbed6f8 = null) {
      const _0x3abc3a = _0xbed6f8 || _0x1352c4();
      return _0x3b744e[_0x3abc3a] || _0x3b744e[_0x37150e.CLAUDE_CODE];
    }
    const _0x2646e6 = {
      PLATFORMS: _0x37150e,
      STATE_DIRS: _0x267d89,
      getStateDir: _0x107d83,
      detectPlatform: _0x1352c4,
      getPluginRoot: _0x483f8a,
      getSuppressionPath: _0x17b720,
      TOOL_SCHEMA_GUIDELINES: _0x2d041e,
      createToolDefinition: _0x265381,
      successResponse: _0x27cde8,
      errorResponse: _0x4297c9,
      unknownToolResponse: _0x58e3e6,
      formatBlock: _0x173263,
      formatList: _0x5ac629,
      formatSection: _0x5ccd8b,
      truncate: _0x4300b7,
      compactSummary: _0x41b2af,
      AGENT_TEMPLATE: _0x2bd9dc,
      createAgentPrompt: _0xd7f42c,
      getOpenCodeConfig: _0x179d69,
      getCodexConfig: _0x502713,
      getInstructionFiles: _0x2188d3,
      INSTRUCTION_FILES: _0x3b744e,
      normalizePathForRequire: _0x25e18c
    };
    _0x3092b8.exports = _0x2646e6;
  }
});
var fs = require("fs");
var path = require("path");
var {
  execFileSync
} = require("child_process");
var {
  readFileWithLimit
} = require_fs_safe();
var {
  writeJsonAtomic
} = require_atomic_write();
var getSuppressionPath;
try {
  const crossPlatform = require_cross_platform();
  getSuppressionPath = crossPlatform.getSuppressionPath;
} catch {
  const os = require("os");
  getSuppressionPath = () => path.join(os.homedir(), ".claude", "enhance", "suppressions.json");
}
var CONFIDENCE_THRESHOLD = 0.9;
var MAX_SUPPRESSIONS_PER_PROJECT = 100;
var SUPPRESSION_EXPIRY_MS = 15552000000;
var PATTERN_HEURISTICS = {
  vague_instructions: (_0x587986, _0xfb9bbd, _0xcfa807) => {
    const _0x52f2da = _0xfb9bbd.toLowerCase();
    const _0x14de4f = /pattern[^\n]{0,500}detect[^\n]{0,500}usually|example[^\n]{0,500}vague|fuzzy[^\n]{0,500}language[^\n]{0,500}like/i.test(_0xfb9bbd) || /vague[^\n]{0,500}terms[^\n]{0,500}like|"usually"[^\n]{0,500}"sometimes"/i.test(_0xfb9bbd);
    if (_0x14de4f) {
      return {
        reason: "Pattern documentation self-reference (describes vague language detection)",
        confidence: 0.98
      };
    }
    const _0x48287c = _0x587986.line || 0;
    const _0x577238 = _0xfb9bbd.split("\n");
    const _0x2332b9 = _0x577238.slice(Math.max(0, _0x48287c - 5), _0x48287c + 5).join("\n");
    if (/\|.*vague.*\||\|.*usually.*sometimes.*\|/i.test(_0x2332b9)) {
      return {
        reason: "Pattern table documentation",
        confidence: 0.95
      };
    }
    return null;
  },
  aggressive_emphasis: (_0x4eb04c, _0x4a1001, _0x6418f) => {
    const _0x5a4693 = _0x4eb04c.line || 0;
    const _0xbf8f4f = _0x4a1001.split("\n");
    const _0x5a4785 = _0xbf8f4f.slice(Math.max(0, _0x5a4693 - 20), _0x5a4693 + 20).join("\n");
    const _0x1c2d3a = /WORKFLOW\s+GATES?/i.test(_0x5a4785) || /\[CRITICAL\]\s*NO\s+AGENT\s+may/i.test(_0x5a4785) || /MUST\s+NOT\s+DO|NEVER\s+skip|DO\s+NOT\s+proceed/i.test(_0x5a4785) || /SubagentStop\s+hook|phase\s+9\s+review/i.test(_0x5a4785);
    if (_0x1c2d3a) {
      return {
        reason: "Workflow enforcement requires emphasis for gates",
        confidence: 0.95
      };
    }
    const _0x5d29cf = /critical-rules|Critical\s+Rules.*Priority/i.test(_0x5a4785) || /<critical-rules>/i.test(_0x5a4785);
    if (_0x5d29cf) {
      return {
        reason: "Critical rules section requires emphasis",
        confidence: 0.93
      };
    }
    return null;
  },
  missing_examples: (_0x4d1054, _0x307ae8, _0xa67808) => {
    const _0x52cf01 = _0x4d1054.file || _0xa67808?.file || "";
    const _0x22316a = path.basename(_0x52cf01).toLowerCase();
    const _0x201e63 = _0x22316a.includes("orchestrator") || _0x22316a.includes("coordinator") || /Task\s{0,100}\(\s{0,100}\{[\s\S]{0,50000}subagent_type/i.test(_0x307ae8);
    if (_0x201e63) {
      return {
        reason: "Orchestrator file delegates to subagents (examples in subagents)",
        confidence: 0.92
      };
    }
    const _0x15cb31 = /spawn[^\n]{0,500}agent|invoke[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(_0x307ae8) && _0x22316a.endsWith(".md");
    if (_0x15cb31) {
      return {
        reason: "Workflow command invokes agents with examples",
        confidence: 0.9
      };
    }
    return null;
  },
  missing_output_format: (_0x200c67, _0x1eb192, _0x3ac9bb) => {
    const _0x538938 = /subagent_type|spawn[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(_0x1eb192) || /enhance:[^\n]{0,500}-enhancer|enhance:[^\n]{0,500}-reporter/i.test(_0x1eb192);
    if (_0x538938) {
      return {
        reason: "Delegates output to subagent (subagent defines format)",
        confidence: 0.91
      };
    }
    return null;
  },
  missing_constraints: (_0x35a917, _0x752dde, _0x1e4a4c) => {
    const _0x4b8619 = /##\s{0,100}What\s{1,100}[^\n]{0,500}MUST\s{1,100}NOT\s{1,100}Do/i.test(_0x752dde) || /##\s*Constraints/i.test(_0x752dde) || /<constraints>/i.test(_0x752dde) || /##\s*Critical\s+Constraints/i.test(_0x752dde) || /WORKFLOW\s+GATES/i.test(_0x752dde);
    if (_0x4b8619) {
      return {
        reason: "File has constraint section (different heading format)",
        confidence: 0.94
      };
    }
    return null;
  },
  redundant_cot: (_0x875a4c, _0x184cf4, _0x47212f) => {
    const _0x55caa3 = /Phase\s+\d+:|Step\s+\d+:|###\s+Phase/i.test(_0x184cf4) && /Phase\s+[2-9]:|Step\s+[2-9]:/i.test(_0x184cf4);
    if (_0x55caa3) {
      return {
        reason: "Multi-phase workflow requires step guidance",
        confidence: 0.91
      };
    }
    return null;
  }
};
function isLikelyFalsePositive(_0x4240b2, _0x5e35b0, _0x15b392 = {}) {
  const _0x4295a9 = (_0x4240b2.patternId || _0x4240b2.id || "").toLowerCase();
  if (!_0x5e35b0 || typeof _0x5e35b0 !== "string") {
    return null;
  }
  const _0x41bd57 = PATTERN_HEURISTICS[_0x4295a9];
  if (_0x41bd57) {
    const _0x74bb84 = _0x41bd57(_0x4240b2, _0x5e35b0, _0x15b392);
    if (_0x74bb84 && _0x74bb84.confidence >= CONFIDENCE_THRESHOLD) {
      return _0x74bb84;
    }
  }
  if (_0x4240b2.file && isPatternDocumentation(_0x4240b2.file, _0x5e35b0, _0x4295a9)) {
    return {
      reason: "Pattern self-reference in documentation",
      confidence: 0.96
    };
  }
  return null;
}
function isPatternDocumentation(_0x338bdf, _0x146e92, _0x576c94) {
  const _0x1dde1e = path.basename(_0x338bdf).toLowerCase();
  const _0x26302d = _0x1dde1e.includes("pattern") || _0x1dde1e.includes("enhance.md") || _0x1dde1e.includes("enhancer");
  if (!_0x26302d) {
    return false;
  }
  const _0x5352e7 = _0x576c94.replace(/_/g, " ");
  const _0x4d37ba = new RegExp("\\|[^|]*" + _0x576c94 + "[^|]*\\|", "i").test(_0x146e92) || new RegExp("\\|[^|]*" + _0x5352e7 + "[^|]*\\|", "i").test(_0x146e92);
  return _0x4d37ba;
}
function getProjectId(_0x5b88ca = process.cwd()) {
  try {
    const _0x559e3c = execFileSync("git", ["remote", "get-url", "origin"], {
      cwd: _0x5b88ca,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    }).trim();
    if (_0x559e3c) {
      return _0x559e3c.replace(/^https?:\/\//, "").replace(/^git@/, "").replace(/\.git$/, "").replace(":", "/");
    }
  } catch {}
  const _0x309e64 = path.resolve(_0x5b88ca);
  return "local:" + path.basename(_0x309e64);
}
function loadAutoSuppressions(_0x233c1a, _0x320560) {
  const _0x406d6c = {
    patterns: {},
    stats: {
      totalSuppressed: 0
    }
  };
  try {
    if (!fs.existsSync(_0x233c1a)) {
      return _0x406d6c;
    }
    const _0x22832b = JSON.parse(fs.readFileSync(_0x233c1a, "utf8"));
    const _0x5aa807 = _0x22832b.projects?.[_0x320560];
    if (!_0x5aa807?.auto_learned) {
      return _0x406d6c;
    }
    const _0x225729 = _0x5aa807.auto_learned;
    const _0x1cb51b = Date.now();
    const _0x2eb5f4 = {};
    for (const [_0x530692, _0x452420] of Object.entries(_0x225729.patterns || {})) {
      const _0x12d38a = new Date(_0x452420.learnedAt).getTime();
      if (_0x1cb51b - _0x12d38a < SUPPRESSION_EXPIRY_MS) {
        _0x2eb5f4[_0x530692] = _0x452420;
      }
    }
    const _0x56da20 = {
      patterns: _0x2eb5f4,
      stats: _0x225729.stats || {
        totalSuppressed: 0
      }
    };
    return _0x56da20;
  } catch {
    return _0x406d6c;
  }
}
function saveAutoSuppressions(_0x200764, _0x57a316, _0x4dab37) {
  if (!_0x4dab37 || _0x4dab37.length === 0) {
    return;
  }
  const _0x905035 = path.dirname(_0x200764);
  if (!fs.existsSync(_0x905035)) {
    fs.mkdirSync(_0x905035, {
      recursive: true
    });
  }
  let _0x21f1c4 = {
    version: "2.0",
    projects: {}
  };
  try {
    if (fs.existsSync(_0x200764)) {
      _0x21f1c4 = JSON.parse(fs.readFileSync(_0x200764, "utf8"));
    }
  } catch {}
  if (!_0x21f1c4.projects) {
    _0x21f1c4.projects = {};
  }
  if (!_0x21f1c4.projects[_0x57a316]) {
    _0x21f1c4.projects[_0x57a316] = {};
  }
  if (!_0x21f1c4.projects[_0x57a316].auto_learned) {
    _0x21f1c4.projects[_0x57a316].auto_learned = {
      patterns: {},
      stats: {
        totalSuppressed: 0,
        lastAnalysis: null
      }
    };
  }
  const _0x4ebaa8 = _0x21f1c4.projects[_0x57a316].auto_learned;
  const _0x455b5a = new Date().toISOString();
  const _0x341a8f = {};
  for (const _0x326519 of _0x4dab37) {
    const _0x81f291 = (_0x326519.patternId || _0x326519.id || "").toLowerCase();
    if (!_0x81f291) {
      continue;
    }
    if (!_0x341a8f[_0x81f291]) {
      const _0x3cef06 = {
        files: [],
        reason: _0x326519.suppressionReason || "Auto-detected false positive",
        confidence: _0x326519.confidence || CONFIDENCE_THRESHOLD,
        learnedAt: _0x455b5a,
        occurrences: 0
      };
      _0x341a8f[_0x81f291] = _0x3cef06;
    }
    if (_0x326519.file && !_0x341a8f[_0x81f291].files.includes(_0x326519.file)) {
      _0x341a8f[_0x81f291].files.push(_0x326519.file);
    }
    _0x341a8f[_0x81f291].occurrences++;
    if (_0x326519.confidence > _0x341a8f[_0x81f291].confidence) {
      _0x341a8f[_0x81f291].confidence = _0x326519.confidence;
      _0x341a8f[_0x81f291].reason = _0x326519.suppressionReason;
    }
  }
  for (const [_0x1df925, _0x32fbd1] of Object.entries(_0x341a8f)) {
    const _0x2fe1fa = _0x4ebaa8.patterns[_0x1df925];
    if (_0x2fe1fa) {
      const _0xdf30f2 = [...new Set([..._0x2fe1fa.files, ..._0x32fbd1.files])];
      _0x2fe1fa.files = _0xdf30f2.slice(0, 50);
      _0x2fe1fa.occurrences = (_0x2fe1fa.occurrences || 0) + _0x32fbd1.occurrences;
      _0x2fe1fa.lastSeen = _0x455b5a;
      if (_0x32fbd1.confidence > _0x2fe1fa.confidence) {
        _0x2fe1fa.confidence = _0x32fbd1.confidence;
        _0x2fe1fa.reason = _0x32fbd1.reason;
      }
    } else {
      _0x4ebaa8.patterns[_0x1df925] = _0x32fbd1;
    }
  }
  const _0x363a7c = Object.keys(_0x4ebaa8.patterns);
  if (_0x363a7c.length > MAX_SUPPRESSIONS_PER_PROJECT) {
    const _0x19522a = _0x363a7c.sort((_0x1f804d, _0x64d64a) => {
      const _0x7c105b = new Date(_0x4ebaa8.patterns[_0x1f804d].learnedAt);
      const _0x16bec9 = new Date(_0x4ebaa8.patterns[_0x64d64a].learnedAt);
      return _0x7c105b - _0x16bec9;
    });
    const _0xecb198 = _0x19522a.slice(0, _0x363a7c.length - MAX_SUPPRESSIONS_PER_PROJECT);
    for (const _0x17776 of _0xecb198) {
      delete _0x4ebaa8.patterns[_0x17776];
    }
  }
  _0x4ebaa8.stats.totalSuppressed = Object.keys(_0x4ebaa8.patterns).length;
  _0x4ebaa8.stats.lastAnalysis = _0x455b5a;
  fs.writeFileSync(_0x200764, JSON.stringify(_0x21f1c4, null, 2));
}
function clearAutoSuppressions(_0x18c80a, _0x19bf9d) {
  try {
    const _0x2d40f7 = JSON.parse(readFileWithLimit(_0x18c80a));
    if (_0x2d40f7.projects?.[_0x19bf9d]?.auto_learned) {
      _0x2d40f7.projects[_0x19bf9d].auto_learned = {
        patterns: {},
        stats: {
          totalSuppressed: 0,
          lastAnalysis: new Date().toISOString()
        }
      };
      writeJsonAtomic(_0x18c80a, _0x2d40f7);
    }
  } catch {}
}
function mergeSuppressions(_0x4d72ba, _0x7a02e8) {
  const _0x5e7814 = {
    patterns: [...(_0x7a02e8.ignore?.patterns || [])],
    files: [...(_0x7a02e8.ignore?.files || [])],
    rules: {
      ...(_0x7a02e8.ignore?.rules || {})
    }
  };
  const _0x3eb8d5 = {
    ...(_0x7a02e8.severity || {})
  };
  const _0x1a6492 = {
    ignore: _0x5e7814,
    severity: _0x3eb8d5,
    auto_learned: _0x4d72ba
  };
  return _0x1a6492;
}
function exportAutoSuppressions(_0x4633ba, _0xa0f177) {
  const _0x252f1f = loadAutoSuppressions(_0x4633ba, _0xa0f177);
  return {
    exportedAt: new Date().toISOString(),
    projectId: _0xa0f177,
    suppressions: _0x252f1f.patterns,
    stats: _0x252f1f.stats
  };
}
function importAutoSuppressions(_0xb848df, _0x3f97b9, _0x349bf3) {
  if (!_0x349bf3?.suppressions) {
    return;
  }
  const _0x5cbb9d = [];
  for (const [_0x36241a, _0x278b8b] of Object.entries(_0x349bf3.suppressions)) {
    for (const _0x27af7c of _0x278b8b.files || []) {
      const _0x59770a = {
        patternId: _0x36241a,
        file: _0x27af7c,
        suppressionReason: _0x278b8b.reason,
        confidence: _0x278b8b.confidence
      };
      _0x5cbb9d.push(_0x59770a);
    }
  }
  saveAutoSuppressions(_0xb848df, _0x3f97b9, _0x5cbb9d);
}
function analyzeForAutoSuppression(_0x372f9d, _0x259460, _0x3f2c3b = {}) {
  if (_0x3f2c3b.noLearn) {
    return [];
  }
  const _0x340b60 = [];
  for (const _0x1311f6 of _0x372f9d) {
    const _0x2b2fa4 = _0x1311f6.file || _0x1311f6.filePath;
    const _0x186f9f = _0x259460.get(_0x2b2fa4);
    if (!_0x186f9f) {
      continue;
    }
    const _0x3b5a39 = {
      file: _0x2b2fa4,
      projectRoot: _0x3f2c3b.projectRoot
    };
    const _0x3777da = isLikelyFalsePositive(_0x1311f6, _0x186f9f, _0x3b5a39);
    if (_0x3777da) {
      const _0x42337e = {
        ..._0x1311f6
      };
      _0x42337e.suppressed = true;
      _0x42337e.suppressionReason = _0x3777da.reason;
      _0x42337e.confidence = _0x3777da.confidence;
      _0x340b60.push(_0x42337e);
    }
  }
  return _0x340b60;
}
const _0xddc49d = {
  CONFIDENCE_THRESHOLD: CONFIDENCE_THRESHOLD,
  MAX_SUPPRESSIONS_PER_PROJECT: MAX_SUPPRESSIONS_PER_PROJECT,
  SUPPRESSION_EXPIRY_MS: SUPPRESSION_EXPIRY_MS,
  isLikelyFalsePositive: isLikelyFalsePositive,
  getProjectId: getProjectId,
  loadAutoSuppressions: loadAutoSuppressions,
  saveAutoSuppressions: saveAutoSuppressions,
  clearAutoSuppressions: clearAutoSuppressions,
  mergeSuppressions: mergeSuppressions,
  exportAutoSuppressions: exportAutoSuppressions,
  importAutoSuppressions: importAutoSuppressions,
  analyzeForAutoSuppression: analyzeForAutoSuppression,
  PATTERN_HEURISTICS: PATTERN_HEURISTICS,
  isPatternDocumentation: isPatternDocumentation
};
module.exports = _0xddc49d;