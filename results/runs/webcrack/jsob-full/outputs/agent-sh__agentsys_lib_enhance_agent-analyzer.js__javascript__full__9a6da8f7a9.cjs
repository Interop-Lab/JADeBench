var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x1cbc3e, _0x53b54a) => function _0x55fcc5() {
  if (!_0x53b54a) {
    (0, _0x1cbc3e[__getOwnPropNames(_0x1cbc3e)[0]])((_0x53b54a = {
      exports: {}
    }).exports, _0x53b54a);
  }
  return _0x53b54a.exports;
};
var require_agent_patterns = __commonJS({
  "../work/agent-sh__agentsys/lib/enhance/agent-patterns.js"(_0xd99536, _0x4a3083) {
    /**
    * Agent Prompt Patterns
    * Detection patterns for agent prompt engineering best practices
    *
    * @author Avi Fenesh
    * @license MIT
    */
    var _0x5bc9e6 = {
      missing_frontmatter: {
        id: "missing_frontmatter",
        category: "structure",
        certainty: "HIGH",
        autoFix: true,
        description: "Agent prompt missing YAML frontmatter (---...---)",
        check: _0x1c8b77 => {
          if (!_0x1c8b77 || typeof _0x1c8b77 !== "string") {
            return null;
          }
          const _0x19c85c = _0x1c8b77.trim().startsWith("---");
          if (!_0x19c85c) {
            return {
              issue: "Missing YAML frontmatter",
              fix: "Add frontmatter with name, description, tools, model"
            };
          }
          return null;
        }
      },
      missing_name: {
        id: "missing_name",
        category: "structure",
        certainty: "HIGH",
        autoFix: false,
        description: "Frontmatter missing \"name\" field",
        check: _0xcc19d8 => {
          if (!_0xcc19d8 || typeof _0xcc19d8 !== "object") {
            return null;
          }
          if (!_0xcc19d8.name || typeof _0xcc19d8.name === "string" && _0xcc19d8.name.trim() === "") {
            return {
              issue: "Frontmatter missing \"name\" field",
              fix: "Add \"name\" field to frontmatter"
            };
          }
          return null;
        }
      },
      missing_description: {
        id: "missing_description",
        category: "structure",
        certainty: "HIGH",
        autoFix: false,
        description: "Frontmatter missing \"description\" field",
        check: _0x18e9ba => {
          if (!_0x18e9ba || typeof _0x18e9ba !== "object") {
            return null;
          }
          if (!_0x18e9ba.description || typeof _0x18e9ba.description === "string" && _0x18e9ba.description.trim() === "") {
            return {
              issue: "Frontmatter missing \"description\" field",
              fix: "Add \"description\" field to frontmatter"
            };
          }
          return null;
        }
      },
      missing_role: {
        id: "missing_role",
        category: "structure",
        certainty: "HIGH",
        autoFix: true,
        description: "No role section (\"You are...\" or \"## Role\")",
        check: _0xda1ec => {
          if (!_0xda1ec || typeof _0xda1ec !== "string") {
            return null;
          }
          const _0x40eecf = /you are/i.test(_0xda1ec);
          const _0x4fa169 = /you (?:perform|handle|execute|do|manage|coordinate|analyze|review|create|design|implement|validate|update|check|monitor)/i.test(_0xda1ec);
          const _0x3579bd = /##\s+(?:your\s+)?role|\*\*(?:your\s+)?role\*\*/i.test(_0xda1ec);
          if (!_0x40eecf && !_0x4fa169 && !_0x3579bd) {
            return {
              issue: "Missing role definition",
              fix: "Add role section explaining agent purpose"
            };
          }
          return null;
        }
      },
      missing_output_format: {
        id: "missing_output_format",
        category: "structure",
        certainty: "HIGH",
        autoFix: false,
        description: "No output format specification",
        check: _0x173b5e => {
          if (!_0x173b5e || typeof _0x173b5e !== "string") {
            return null;
          }
          const _0x27a4fc = /##\s+output\s+format/i.test(_0x173b5e);
          const _0x1f76ff = /##\s+format/i.test(_0x173b5e);
          const _0x426cb4 = /##\s+response/i.test(_0x173b5e);
          if (!_0x27a4fc && !_0x1f76ff && !_0x426cb4) {
            return {
              issue: "Missing output format specification",
              fix: "Add section specifying expected output format"
            };
          }
          return null;
        }
      },
      missing_constraints: {
        id: "missing_constraints",
        category: "structure",
        certainty: "HIGH",
        autoFix: false,
        description: "No constraints section",
        check: _0x2e8b08 => {
          if (!_0x2e8b08 || typeof _0x2e8b08 !== "string") {
            return null;
          }
          const _0x51e6b4 = /#{2,3}\s+constraints/i.test(_0x2e8b08);
          const _0x2ae656 = /#{2,3}\s+(?:what\s+)?(?:this\s+agent\s+)?(?:you\s+)?(?:must\s+)?not\s+do/i.test(_0x2e8b08);
          const _0x3112c1 = /#{2,3}\s+rules/i.test(_0x2e8b08);
          const _0x433c3d = /#{2,3}\s+workflow\s+gates/i.test(_0x2e8b08);
          if (!_0x51e6b4 && !_0x2ae656 && !_0x3112c1 && !_0x433c3d) {
            return {
              issue: "Missing constraints section",
              fix: "Add section defining agent limitations and boundaries"
            };
          }
          return null;
        }
      },
      unrestricted_tools: {
        id: "unrestricted_tools",
        category: "tool",
        certainty: "HIGH",
        autoFix: false,
        description: "No \"tools\" field in frontmatter (all tools allowed)",
        check: _0x5277be => {
          if (!_0x5277be || typeof _0x5277be !== "object") {
            return null;
          }
          if (!_0x5277be.tools) {
            return {
              issue: "No tools restriction - agent has access to all tools",
              fix: "Add \"tools\" field to frontmatter with specific tools needed"
            };
          }
          return null;
        }
      },
      unrestricted_bash: {
        id: "unrestricted_bash",
        category: "tool",
        certainty: "HIGH",
        autoFix: true,
        description: "Has \"Bash\" without restrictions (should be \"Bash(git:*)\" etc)",
        check: _0x59eab6 => {
          if (!_0x59eab6 || typeof _0x59eab6 !== "object") {
            return null;
          }
          if (_0x59eab6.tools) {
            const _0x34e35a = Array.isArray(_0x59eab6.tools) ? _0x59eab6.tools : _0x59eab6.tools.split(",").map(_0x5255ed => _0x5255ed.trim());
            const _0x456fdb = _0x34e35a.some(_0x58c0a8 => _0x58c0a8 === "Bash" || _0x58c0a8 === "bash");
            if (_0x456fdb) {
              return {
                issue: "Unrestricted Bash access",
                fix: "Replace \"Bash\" with \"Bash(git:*)\" or specific scope"
              };
            }
          }
          return null;
        }
      },
      missing_xml_structure: {
        id: "missing_xml_structure",
        category: "xml",
        certainty: "MEDIUM",
        autoFix: false,
        description: "Could benefit from XML tags for structure",
        check: _0xb5dca3 => {
          if (!_0xb5dca3 || typeof _0xb5dca3 !== "string") {
            return null;
          }
          const _0x53e205 = (_0xb5dca3.match(/##\s+/g) || []).length;
          const _0xb399b7 = /^\s*[-*]\s+/m.test(_0xb5dca3);
          const _0x20e6a0 = /```/g.test(_0xb5dca3);
          if (_0x53e205 >= 5 || _0xb399b7 && _0x20e6a0) {
            const _0x1700c1 = /<\w+>/.test(_0xb5dca3);
            if (!_0x1700c1) {
              return {
                issue: "Complex prompt without XML structure",
                fix: "Consider using XML tags for key sections (e.g., <rules>, <examples>)"
              };
            }
          }
          return null;
        }
      },
      unnecessary_cot: {
        id: "unnecessary_cot",
        category: "cot",
        certainty: "MEDIUM",
        autoFix: false,
        description: "Step-by-step reasoning on simple tasks",
        check: _0x5892ee => {
          if (!_0x5892ee || typeof _0x5892ee !== "string") {
            return null;
          }
          const _0x5dc3de = /step[- ]by[- ]step/i.test(_0x5892ee);
          const _0x31cfe2 = /<thinking>/i.test(_0x5892ee);
          const _0x2a165f = _0x5892ee.split(/\s+/).length;
          const _0x3befdc = (_0x5892ee.match(/##\s+/g) || []).length;
          if ((_0x5dc3de || _0x31cfe2) && _0x2a165f < 500 && _0x3befdc < 4) {
            return {
              issue: "Unnecessary chain-of-thought for simple task",
              fix: "Remove step-by-step instructions for straightforward operations"
            };
          }
          return null;
        }
      },
      missing_cot: {
        id: "missing_cot",
        category: "cot",
        certainty: "MEDIUM",
        autoFix: false,
        description: "Complex reasoning without thinking guidance",
        check: _0xd0e571 => {
          if (!_0xd0e571 || typeof _0xd0e571 !== "string") {
            return null;
          }
          const _0x4b2817 = _0xd0e571.split(/\s+/).length;
          const _0x9e16a2 = (_0xd0e571.match(/##\s+/g) || []).length;
          const _0x400358 = /analy[sz]e|evaluate|assess|review/i.test(_0xd0e571);
          const _0x4c7d9e = /step[- ]by[- ]step/i.test(_0xd0e571);
          const _0x3c6314 = /<thinking>/i.test(_0xd0e571);
          const _0x55fe4c = /reasoning|think\s+through/i.test(_0xd0e571);
          if (_0x4b2817 > 1000 && _0x9e16a2 >= 5 && _0x400358) {
            if (!_0x4c7d9e && !_0x3c6314 && !_0x55fe4c) {
              return {
                issue: "Complex task without reasoning guidance",
                fix: "Add chain-of-thought instructions or <thinking> tags"
              };
            }
          }
          return null;
        }
      },
      example_count_suboptimal: {
        id: "example_count_suboptimal",
        category: "example",
        certainty: "LOW",
        autoFix: false,
        description: "Not 2-5 examples",
        check: _0x3599d7 => {
          if (!_0x3599d7 || typeof _0x3599d7 !== "string") {
            return null;
          }
          const _0x397195 = (_0x3599d7.match(/##\s+example/gi) || []).length;
          const _0x533e8e = (_0x3599d7.match(/<good[- ]?example>/gi) || []).length;
          const _0x3b9513 = (_0x3599d7.match(/<bad[- ]?example>/gi) || []).length;
          const _0x20226a = _0x397195 + _0x533e8e + _0x3b9513;
          if (_0x20226a > 0 && (_0x20226a < 2 || _0x20226a > 5)) {
            return {
              issue: "Found " + _0x20226a + " examples (optimal: 2-5)",
              fix: _0x20226a < 2 ? "Consider adding more examples for clarity" : "Consider reducing examples to avoid token bloat"
            };
          }
          return null;
        }
      },
      vague_instructions: {
        id: "vague_instructions",
        category: "anti-pattern",
        certainty: "MEDIUM",
        autoFix: false,
        description: "Fuzzy language like \"usually\", \"sometimes\"",
        check: _0x2ad0b5 => {
          if (!_0x2ad0b5 || typeof _0x2ad0b5 !== "string") {
            return null;
          }
          const _0x2ed189 = ["usually", "sometimes", "often", "rarely", "maybe", "might", "could", "should probably", "try to", "as much as possible", "if possible"];
          const _0x5ba57b = [];
          for (const _0x5a5954 of _0x2ed189) {
            const _0x3dbfec = new RegExp("\\b" + _0x5a5954 + "\\b", "gi");
            if (_0x3dbfec.test(_0x2ad0b5)) {
              _0x5ba57b.push(_0x5a5954);
            }
          }
          if (_0x5ba57b.length > 3) {
            return {
              issue: "Found vague language: " + _0x5ba57b.slice(0, 3).join(", ") + "...",
              fix: "Replace fuzzy language with clear, definitive instructions"
            };
          }
          return null;
        }
      },
      prompt_bloat: {
        id: "prompt_bloat",
        category: "anti-pattern",
        certainty: "LOW",
        autoFix: false,
        description: "Token count > 2000",
        maxTokens: 2000,
        check: _0x514c51 => {
          if (!_0x514c51 || typeof _0x514c51 !== "string") {
            return null;
          }
          const _0x49836d = Math.ceil(_0x514c51.length / 4);
          if (_0x49836d > 2000) {
            const _0x5bde2f = {
              issue: "Prompt ~" + _0x49836d + " tokens (max recommended: 2000)",
              fix: "Simplify prompt, remove redundant sections, or use XML for compression"
            };
            return _0x5bde2f;
          }
          return null;
        }
      },
      hardcoded_claude_dir: {
        id: "hardcoded_claude_dir",
        category: "cross-platform",
        certainty: "HIGH",
        autoFix: false,
        description: "Hardcoded .claude/ directory (breaks OpenCode/Codex)",
        check: _0x59a165 => {
          if (!_0x59a165 || typeof _0x59a165 !== "string") {
            return null;
          }
          const _0x341cb2 = /\.claude\//.test(_0x59a165);
          let _0x2ddd78 = /AI_STATE_DIR/i.test(_0x59a165);
          if (!_0x2ddd78) {
            for (const _0x646179 of _0x59a165.matchAll(/\$\{([^}]{0,1000})\}/g)) {
              if (/STATE/i.test(_0x646179[1])) {
                _0x2ddd78 = true;
                break;
              }
            }
          }
          if (_0x341cb2 && !_0x2ddd78) {
            return {
              issue: "Hardcoded .claude/ directory path",
              fix: "Use AI_STATE_DIR env var or platform detection for cross-platform support"
            };
          }
          return null;
        }
      },
      claude_md_reference: {
        id: "claude_md_reference",
        category: "cross-platform",
        certainty: "MEDIUM",
        autoFix: false,
        description: "References CLAUDE.md without also checking AGENTS.md",
        check: _0x365cb4 => {
          if (!_0x365cb4 || typeof _0x365cb4 !== "string") {
            return null;
          }
          const _0x8e06e = /CLAUDE\.md/i.test(_0x365cb4);
          const _0x511290 = /AGENTS\.md/i.test(_0x365cb4);
          if (_0x8e06e && !_0x511290) {
            return {
              issue: "References CLAUDE.md without AGENTS.md",
              fix: "Also check for AGENTS.md (used by OpenCode/Codex)"
            };
          }
          return null;
        }
      },
      no_xml_for_data: {
        id: "no_xml_for_data",
        category: "cross-platform",
        certainty: "LOW",
        autoFix: false,
        description: "Data blocks without XML tags (helps both Claude and GPT-4)",
        check: _0x570944 => {
          if (!_0x570944 || typeof _0x570944 !== "string") {
            return null;
          }
          const _0x3ecf8f = /```[\s\S]+?```/.test(_0x570944);
          const _0x5d1f2f = /^[-*]\s{1,1000}[^\n]{1,2000}$/m.test(_0x570944);
          const _0x41d327 = /<\w+>[\s\S]{0,50000}?<\/\w+>/.test(_0x570944);
          const _0x196b27 = (_0x570944.match(/^##\s+/gm) || []).length;
          if ((_0x3ecf8f || _0x5d1f2f) && _0x196b27 >= 4 && !_0x41d327) {
            return {
              issue: "Complex content without XML tags",
              fix: "Wrap data blocks in XML tags (e.g., <context>, <rules>) for cross-model compatibility"
            };
          }
          return null;
        }
      }
    };
    function _0x25ba63() {
      return _0x5bc9e6;
    }
    function _0x701512(_0x586d7b) {
      const _0x82f07f = {};
      for (const [_0xa02f70, _0x16961c] of Object.entries(_0x5bc9e6)) {
        if (_0x16961c.certainty === _0x586d7b) {
          _0x82f07f[_0xa02f70] = _0x16961c;
        }
      }
      return _0x82f07f;
    }
    function _0x252ac9(_0x10f7ce) {
      const _0x2b00e8 = {};
      for (const [_0x508c53, _0x4ed0af] of Object.entries(_0x5bc9e6)) {
        if (_0x4ed0af.category === _0x10f7ce) {
          _0x2b00e8[_0x508c53] = _0x4ed0af;
        }
      }
      return _0x2b00e8;
    }
    function _0x32e23c() {
      const _0x3e070c = {};
      for (const [_0x1dcb6d, _0x5de2f8] of Object.entries(_0x5bc9e6)) {
        if (_0x5de2f8.autoFix) {
          _0x3e070c[_0x1dcb6d] = _0x5de2f8;
        }
      }
      return _0x3e070c;
    }
    const _0x1568d1 = {
      agentPatterns: _0x5bc9e6,
      getAllPatterns: _0x25ba63,
      getPatternsByCertainty: _0x701512,
      getPatternsByCategory: _0x252ac9,
      getAutoFixablePatterns: _0x32e23c
    };
    _0x4a3083.exports = _0x1568d1;
  }
});
var require_atomic_write = __commonJS({
  "../work/agent-sh__agentsys/lib/utils/atomic-write.js"(_0x460d9a, _0x2fc1b2) {
    var _0x5d4b37 = require("fs");
    var _0x4371c8 = require("path");
    var _0xe9aeb2 = require("crypto");
    function _0x5d1e1a(_0x56e732) {
      const _0x2869be = _0x4371c8.dirname(_0x56e732);
      const _0x2f0cda = _0x4371c8.basename(_0x56e732);
      const _0x4de5f7 = _0xe9aeb2.randomBytes(6).toString("hex");
      return _0x4371c8.join(_0x2869be, "." + _0x2f0cda + "." + _0x4de5f7 + ".tmp");
    }
    function _0x560e4b(_0x387537, _0x1deca0, _0x4c087e = {}) {
      const {
        encoding = "utf8",
        mode = 420
      } = _0x4c087e;
      const _0x2749d1 = _0x4371c8.dirname(_0x387537);
      if (!_0x5d4b37.existsSync(_0x2749d1)) {
        _0x5d4b37.mkdirSync(_0x2749d1, {
          recursive: true
        });
      }
      const _0x20555c = _0x5d1e1a(_0x387537);
      try {
        const _0x3e2f33 = {
          encoding: encoding,
          mode: mode
        };
        _0x5d4b37.writeFileSync(_0x20555c, _0x1deca0, _0x3e2f33);
        _0x5d4b37.renameSync(_0x20555c, _0x387537);
        return true;
      } catch (_0x67ae5f) {
        try {
          if (_0x5d4b37.existsSync(_0x20555c)) {
            _0x5d4b37.unlinkSync(_0x20555c);
          }
        } catch {}
        throw _0x67ae5f;
      }
    }
    function _0x4480e4(_0x38dc99, _0x4c4e28, _0x178696 = {}) {
      const {
        indent = 2,
        ..._0x3dd5a5
      } = _0x178696;
      const _0x18d684 = JSON.stringify(_0x4c4e28, null, indent);
      return _0x560e4b(_0x38dc99, _0x18d684, _0x3dd5a5);
    }
    const _0x220270 = {
      writeFileAtomic: _0x560e4b,
      writeJsonAtomic: _0x4480e4,
      getTempPath: _0x5d1e1a
    };
    _0x2fc1b2.exports = _0x220270;
  }
});
var require_fixer = __commonJS({
  "../work/agent-sh__agentsys/lib/enhance/fixer.js"(_0x16556f, _0x200493) {
    /**
    * Plugin Analysis Fixer
    * @author Avi Fenesh
    * @license MIT
    */
    var _0x4d77b4 = require("fs");
    var _0xdc9949 = require("path");
    var {
      writeFileAtomic: _0x2b199c
    } = require_atomic_write();
    function _0x5e2623(_0x17608b) {
      let _0x16b912;
      try {
        _0x16b912 = _0x4d77b4.lstatSync(_0x17608b);
      } catch (_0x3575f6) {
        if (_0x3575f6.code === "ENOENT") {
          return;
        }
        throw _0x3575f6;
      }
      if (_0x16b912.isSymbolicLink()) {
        const _0x23a174 = new Error("target is a symlink; refusing to follow");
        _0x23a174.code = "ESYMLINK_REFUSED";
        throw _0x23a174;
      }
    }
    function _0x3d431a(_0x47941c, _0x43eec1 = {}) {
      const {
        dryRun = false,
        backup = true
      } = _0x43eec1;
      const _0x14bc76 = {
        applied: [],
        skipped: [],
        errors: []
      };
      const _0x36d659 = ["missing_frontmatter", "unrestricted_bash", "missing_role", "missing_output_format", "missing_examples", "missing_xml_structure", "missing_verification_criteria", "aggressive_emphasis", "missing_trigger_phrase"];
      const _0x516879 = _0x47941c.filter(_0x5600fb => _0x5600fb.certainty === "HIGH" && (_0x5600fb.filePath || _0x5600fb.file) && (_0x5600fb.autoFixFn || _0x36d659.includes(_0x5600fb.patternId)));
      const _0x2d3a48 = new Map();
      for (const _0x36552f of _0x516879) {
        const _0xbdf5f3 = _0x36552f.filePath || _0x36552f.file;
        if (!_0x2d3a48.has(_0xbdf5f3)) {
          _0x2d3a48.set(_0xbdf5f3, []);
        }
        _0x2d3a48.get(_0xbdf5f3).push(_0x36552f);
      }
      for (const [_0x223cb1, _0x4a7081] of _0x2d3a48) {
        try {
          if (!_0x4d77b4.existsSync(_0x223cb1)) {
            const _0x4b76ee = {
              filePath: _0x223cb1,
              error: "File not found"
            };
            _0x14bc76.errors.push(_0x4b76ee);
            continue;
          }
          try {
            _0x5e2623(_0x223cb1);
          } catch (_0x4f29ea) {
            if (_0x4f29ea.code === "ESYMLINK_REFUSED") {
              const _0x1ac400 = {
                filePath: _0x223cb1,
                error: _0x4f29ea.message,
                success: false,
                reason: "target is a symlink; refusing to follow"
              };
              _0x14bc76.errors.push(_0x1ac400);
              continue;
            }
            throw _0x4f29ea;
          }
          const _0x4396df = _0x4d77b4.readFileSync(_0x223cb1, "utf8");
          let _0x51ccda;
          if (_0x223cb1.endsWith(".json")) {
            _0x51ccda = JSON.parse(_0x4396df);
          } else if (_0x223cb1.endsWith(".md")) {
            _0x51ccda = _0x4396df;
          } else {
            _0x14bc76.skipped.push(..._0x4a7081.map(_0x356c71 => ({
              ..._0x356c71,
              reason: "Unsupported file type - manual fix required"
            })));
            continue;
          }
          let _0x34b287 = _0x51ccda;
          const _0x27e7ff = [];
          for (const _0x26706e of _0x4a7081) {
            try {
              if (_0x223cb1.endsWith(".md")) {
                if (_0x26706e.patternId === "missing_frontmatter") {
                  _0x34b287 = _0x150b4b(_0x34b287);
                } else if (_0x26706e.patternId === "unrestricted_bash") {
                  _0x34b287 = _0x2ed2c7(_0x34b287);
                } else if (_0x26706e.patternId === "missing_role") {
                  _0x34b287 = _0x1ec0a2(_0x34b287);
                } else if (_0x26706e.patternId === "missing_output_format") {
                  _0x34b287 = _0x145b29(_0x34b287);
                } else if (_0x26706e.patternId === "missing_examples") {
                  _0x34b287 = _0x4ebc54(_0x34b287);
                } else if (_0x26706e.patternId === "missing_xml_structure") {
                  _0x34b287 = _0xef51d8(_0x34b287);
                } else if (_0x26706e.patternId === "missing_verification_criteria") {
                  _0x34b287 = _0x48dcef(_0x34b287);
                } else if (_0x26706e.patternId === "aggressive_emphasis") {
                  _0x34b287 = _0x1e141d(_0x34b287);
                } else if (_0x26706e.patternId === "missing_trigger_phrase") {
                  _0x34b287 = _0x1edaef(_0x34b287);
                } else {
                  continue;
                }
              } else if (_0x26706e.schemaPath) {
                _0x34b287 = _0x1f5ea3(_0x34b287, _0x26706e.schemaPath, _0x26706e.autoFixFn);
              } else {
                _0x34b287 = _0x26706e.autoFixFn(_0x34b287);
              }
              const _0x496cc0 = {
                issue: _0x26706e.issue,
                fix: _0x26706e.fix,
                filePath: _0x223cb1
              };
              _0x27e7ff.push(_0x496cc0);
            } catch (_0x925035) {
              const _0x30e62c = {
                issue: _0x26706e.issue,
                filePath: _0x223cb1,
                error: _0x925035.message
              };
              _0x14bc76.errors.push(_0x30e62c);
            }
          }
          if (!dryRun && _0x27e7ff.length > 0) {
            if (backup) {
              const _0x238ee7 = _0x223cb1 + ".backup";
              _0x5e2623(_0x238ee7);
              _0x4d77b4.writeFileSync(_0x238ee7, _0x4396df, "utf8");
            }
            let _0x4f5a55;
            if (_0x223cb1.endsWith(".md")) {
              _0x4f5a55 = _0x34b287;
            } else {
              _0x4f5a55 = JSON.stringify(_0x34b287, null, 2);
            }
            _0x5e2623(_0x223cb1);
            _0x2b199c(_0x223cb1, _0x4f5a55);
          }
          _0x14bc76.applied.push(..._0x27e7ff);
        } catch (_0x30e159) {
          const _0x3ab829 = {
            filePath: _0x223cb1,
            error: _0x30e159.message
          };
          _0x14bc76.errors.push(_0x3ab829);
        }
      }
      const _0xdb784 = _0x47941c.filter(_0x3cdeef => _0x3cdeef.certainty !== "HIGH" || !_0x36d659.includes(_0x3cdeef.patternId));
      _0x14bc76.skipped.push(..._0xdb784.map(_0x2d5c86 => ({
        ..._0x2d5c86,
        reason: _0x2d5c86.certainty !== "HIGH" ? "Not HIGH certainty" : "No auto-fix available for this pattern"
      })));
      return _0x14bc76;
    }
    function _0x39e12c(_0x5d9a6e) {
      return _0x5d9a6e !== "__proto__" && _0x5d9a6e !== "constructor" && _0x5d9a6e !== "prototype";
    }
    function _0x1f5ea3(_0x46e83b, _0x2cb852, _0x7dce7a) {
      const _0x2da6d9 = _0x2cb852.split(".");
      const _0x5d756d = structuredClone(_0x46e83b);
      let _0x14d6f0 = _0x5d756d;
      for (let _0x3de2ca = 0; _0x3de2ca < _0x2da6d9.length - 1; _0x3de2ca++) {
        const _0x371ac3 = _0x2da6d9[_0x3de2ca];
        if (_0x371ac3.includes("[")) {
          const _0x5d8fed = _0x371ac3.match(/^((?!__proto__|constructor|prototype)[a-zA-Z_]\w*)\[(\d{1,10})\]$/);
          if (_0x5d8fed && _0x5d8fed[1] !== "__proto__" && _0x5d8fed[1] !== "constructor" && _0x5d8fed[1] !== "prototype") {
            _0x14d6f0 = _0x14d6f0[_0x5d8fed[1]][parseInt(_0x5d8fed[2], 10)];
          }
        } else {
          if (!_0x39e12c(_0x371ac3)) {
            return _0x5d756d;
          }
          _0x14d6f0 = _0x14d6f0[_0x371ac3];
        }
      }
      const _0x1f96d0 = _0x2da6d9[_0x2da6d9.length - 1];
      if (_0x1f96d0.includes("[")) {
        const _0x4a7b01 = _0x1f96d0.match(/^((?!__proto__|constructor|prototype)[a-zA-Z_]\w*)\[(\d{1,10})\]$/);
        if (_0x4a7b01 && _0x4a7b01[1] !== "__proto__" && _0x4a7b01[1] !== "constructor" && _0x4a7b01[1] !== "prototype") {
          const _0x25a738 = _0x4a7b01[1];
          const _0x4a52e1 = parseInt(_0x4a7b01[2], 10);
          _0x14d6f0[_0x25a738][_0x4a52e1] = _0x7dce7a(_0x14d6f0[_0x25a738][_0x4a52e1]);
        }
      } else if (_0x1f96d0 !== "__proto__" && _0x1f96d0 !== "constructor" && _0x1f96d0 !== "prototype") {
        _0x14d6f0[_0x1f96d0] = _0x7dce7a(_0x14d6f0[_0x1f96d0]);
      }
      return _0x5d756d;
    }
    function _0x273857(_0x180a15) {
      if (!_0x180a15 || typeof _0x180a15 !== "object") {
        return _0x180a15;
      }
      const _0xa6902 = {
        ..._0x180a15
      };
      const _0x39bfd8 = _0xa6902;
      if (_0x39bfd8.type === "object" && _0x39bfd8.properties) {
        _0x39bfd8.additionalProperties = false;
      }
      if (_0x39bfd8.properties) {
        _0x39bfd8.properties = {};
        for (const [_0x422418, _0x3bb67b] of Object.entries(_0x180a15.properties)) {
          _0x39bfd8.properties[_0x422418] = _0x273857(_0x3bb67b);
        }
      }
      return _0x39bfd8;
    }
    function _0x4c8b73(_0x1000d5) {
      if (!_0x1000d5 || typeof _0x1000d5 !== "object") {
        return _0x1000d5;
      }
      const _0x413507 = {
        ..._0x1000d5
      };
      const _0x27b481 = _0x413507;
      if (_0x27b481.type === "object" && _0x27b481.properties && !_0x27b481.required) {
        _0x27b481.required = Object.entries(_0x27b481.properties).filter(([_0x196c2a, _0x18bdc5]) => {
          if (_0x18bdc5.default !== undefined) {
            return false;
          }
          if (_0x18bdc5.description && /optional/i.test(_0x18bdc5.description)) {
            return false;
          }
          return true;
        }).map(([_0x51812d]) => _0x51812d);
      }
      return _0x27b481;
    }
    function _0x58db9d(_0x16a0c5, _0x21b546) {
      const _0x292197 = {
        ..._0x16a0c5
      };
      _0x292197.version = _0x21b546;
      return _0x292197;
    }
    function _0x97047f(_0x48bf65) {
      const _0x21c002 = [];
      for (const _0x3bf7e4 of _0x48bf65) {
        if (_0x3bf7e4.certainty === "HIGH" && _0x3bf7e4.autoFixFn) {
          const _0x595e5b = {
            filePath: _0x3bf7e4.filePath,
            issue: _0x3bf7e4.issue,
            fix: _0x3bf7e4.fix,
            willApply: true
          };
          _0x21c002.push(_0x595e5b);
        } else {
          _0x21c002.push({
            filePath: _0x3bf7e4.filePath,
            issue: _0x3bf7e4.issue,
            fix: _0x3bf7e4.fix || "No auto-fix available",
            willApply: false,
            reason: _0x3bf7e4.certainty !== "HIGH" ? "Not HIGH certainty" : "No auto-fix function"
          });
        }
      }
      return _0x21c002;
    }
    function _0x5d2437(_0x38c78b) {
      const _0x20662e = _0x38c78b + ".backup";
      if (!_0x4d77b4.existsSync(_0x20662e)) {
        return false;
      }
      _0x5e2623(_0x20662e);
      _0x5e2623(_0x38c78b);
      const _0x59015c = _0x4d77b4.readFileSync(_0x20662e, "utf8");
      _0x5e2623(_0x38c78b);
      _0x4d77b4.writeFileSync(_0x38c78b, _0x59015c, "utf8");
      _0x4d77b4.unlinkSync(_0x20662e);
      return true;
    }
    function _0x263145(_0x2cff3a) {
      let _0x146c89 = 0;
      function _0x44e499(_0x2ec941) {
        let _0x436fb5;
        try {
          _0x436fb5 = _0x4d77b4.readdirSync(_0x2ec941, {
            withFileTypes: true
          });
        } catch (_0x419317) {
          return;
        }
        for (const _0x249896 of _0x436fb5) {
          const _0x4232e6 = _0xdc9949.join(_0x2ec941, _0x249896.name);
          if (_0x249896.isDirectory()) {
            _0x44e499(_0x4232e6);
          } else if (_0x249896.isFile() && _0x249896.name.endsWith(".backup")) {
            try {
              _0x4d77b4.unlinkSync(_0x4232e6);
              _0x146c89++;
            } catch (_0x3e4c53) {
              console.error("[WARN] fixer error:", _0x3e4c53.message);
            }
          }
        }
      }
      _0x44e499(_0x2cff3a);
      return _0x146c89;
    }
    function _0x150b4b(_0x577322) {
      if (!_0x577322 || typeof _0x577322 !== "string") {
        return _0x577322;
      }
      const _0x50246d = "---\nname: agent-name\ndescription: Agent description\ntools: Read, Glob, Grep\nmodel: sonnet\n---\n\n";
      return _0x50246d + _0x577322.trim();
    }
    function _0x2ed2c7(_0x59cb78) {
      if (!_0x59cb78 || typeof _0x59cb78 !== "string") {
        return _0x59cb78;
      }
      const _0x2f2896 = _0x59cb78.split("\n");
      let _0x2842f9 = false;
      for (let _0x56b7af = 0; _0x56b7af < _0x2f2896.length; _0x56b7af++) {
        if (_0x2f2896[_0x56b7af].trim() === "---") {
          if (!_0x2842f9) {
            _0x2842f9 = true;
          } else {
            break;
          }
        } else if (_0x2842f9 && _0x2f2896[_0x56b7af].startsWith("tools:")) {
          _0x2f2896[_0x56b7af] = _0x2f2896[_0x56b7af].replace(/\bBash\b(?!\()/g, "Bash(git:*)");
        }
      }
      return _0x2f2896.join("\n");
    }
    function _0x1ec0a2(_0x4b1352) {
      if (!_0x4b1352 || typeof _0x4b1352 !== "string") {
        return _0x4b1352;
      }
      const _0x1dd4ea = _0x4b1352.split("\n");
      let _0x1b7386 = -1;
      let _0x1fbff7 = false;
      for (let _0x5bdcbd = 0; _0x5bdcbd < _0x1dd4ea.length; _0x5bdcbd++) {
        if (_0x1dd4ea[_0x5bdcbd].trim() === "---") {
          if (!_0x1fbff7) {
            _0x1fbff7 = true;
          } else {
            _0x1b7386 = _0x5bdcbd;
            break;
          }
        }
      }
      const _0x1a732c = "\n## Your Role\n\nYou are an agent that [describe agent purpose].\n";
      if (_0x1b7386 >= 0) {
        _0x1dd4ea.splice(_0x1b7386 + 1, 0, _0x1a732c);
      } else {
        _0x1dd4ea.unshift(_0x1a732c);
      }
      return _0x1dd4ea.join("\n");
    }
    function _0x5071f3(_0x10a2b4) {
      if (!_0x10a2b4 || typeof _0x10a2b4 !== "string") {
        return _0x10a2b4;
      }
      const _0x38e344 = _0x10a2b4.split("\n");
      let _0x595091 = 0;
      let _0x3f7ba4 = false;
      for (let _0xda3442 = 0; _0xda3442 < _0x38e344.length; _0xda3442++) {
        const _0x17c7ab = _0x38e344[_0xda3442];
        if (_0x17c7ab.startsWith("```")) {
          _0x3f7ba4 = !_0x3f7ba4;
          continue;
        }
        if (_0x3f7ba4) {
          continue;
        }
        const _0x3d44e5 = _0x17c7ab.match(/^(#{1,6})[ \t]+(\S.*)$/);
        if (_0x3d44e5) {
          const _0x52e4b8 = _0x3d44e5[1].length;
          const _0x31e68c = _0x3d44e5[2];
          if (_0x595091 === 0) {
            _0x595091 = _0x52e4b8;
            continue;
          }
          if (_0x52e4b8 > _0x595091 + 1) {
            const _0xb6364b = _0x595091 + 1;
            _0x38e344[_0xda3442] = "#".repeat(_0xb6364b) + " " + _0x31e68c;
            _0x595091 = _0xb6364b;
          } else {
            _0x595091 = _0x52e4b8;
          }
        }
      }
      return _0x38e344.join("\n");
    }
    function _0x44e486(_0x2bc8e4) {
      if (!_0x2bc8e4 || typeof _0x2bc8e4 !== "string") {
        return _0x2bc8e4;
      }
      const _0x3f3b18 = [{
        from: /\bin order to\b/gi,
        to: "to"
      }, {
        from: /\bfor the purpose of\b/gi,
        to: "for"
      }, {
        from: /\bin the event that\b/gi,
        to: "if"
      }, {
        from: /\bat this point in time\b/gi,
        to: "now"
      }, {
        from: /\bdue to the fact that\b/gi,
        to: "because"
      }, {
        from: /\bhas the ability to\b/gi,
        to: "can"
      }, {
        from: /\bis able to\b/gi,
        to: "can"
      }, {
        from: /\bmake use of\b/gi,
        to: "use"
      }, {
        from: /\ba large number of\b/gi,
        to: "many"
      }, {
        from: /\ba small number of\b/gi,
        to: "few"
      }, {
        from: /\bthe majority of\b/gi,
        to: "most"
      }, {
        from: /\bprior to\b/gi,
        to: "before"
      }, {
        from: /\bsubsequent to\b/gi,
        to: "after"
      }];
      let _0x2e14b2 = _0x2bc8e4;
      const _0x3744bc = /```[\s\S]*?```/g;
      const _0x129059 = [];
      let _0x2c6f0e = 0;
      _0x2e14b2 = _0x2e14b2.replace(_0x3744bc, _0x5beea7 => {
        _0x129059.push(_0x5beea7);
        return "__CODE_BLOCK_" + _0x2c6f0e++ + "__";
      });
      for (const {
        from: _0x1437d2,
        to: _0x6b7653
      } of _0x3f3b18) {
        _0x2e14b2 = _0x2e14b2.replace(_0x1437d2, _0xa528bf => {
          if (_0xa528bf[0] === _0xa528bf[0].toUpperCase()) {
            return _0x6b7653[0].toUpperCase() + _0x6b7653.slice(1);
          }
          return _0x6b7653;
        });
      }
      for (let _0x33971b = 0; _0x33971b < _0x129059.length; _0x33971b++) {
        _0x2e14b2 = _0x2e14b2.replace("__CODE_BLOCK_" + _0x33971b + "__", _0x129059[_0x33971b]);
      }
      return _0x2e14b2;
    }
    function _0x145b29(_0x222b7d) {
      if (!_0x222b7d || typeof _0x222b7d !== "string") {
        return _0x222b7d;
      }
      if (/##\s*output\s*format/i.test(_0x222b7d) || /<output_format>/i.test(_0x222b7d)) {
        return _0x222b7d;
      }
      const _0x5ee227 = "\n\n## Output Format\n\nRespond with:\n- [Describe expected format: JSON, markdown, plain text, etc.]\n- [Include any specific structure requirements]\n";
      return _0x222b7d.trim() + _0x5ee227;
    }
    function _0x4ebc54(_0x491283) {
      if (!_0x491283 || typeof _0x491283 !== "string") {
        return _0x491283;
      }
      if (/<example>|##\s*example/i.test(_0x491283)) {
        return _0x491283;
      }
      const _0x719302 = "\n\n## Examples\n\n<good-example>\nInput: [example input]\nOutput: [example output]\n</good-example>\n\n<bad-example>\nInput: [example input]\nOutput: [what NOT to do]\nWhy bad: [explanation]\n</bad-example>\n";
      return _0x491283.trim() + _0x719302;
    }
    function _0x24abf2(_0x469d35, _0x51337e, _0x4c866f) {
      const _0x292ed8 = _0x469d35.split("\n");
      let _0x279fdd = -1;
      for (let _0x685e11 = 0; _0x685e11 < _0x292ed8.length; _0x685e11++) {
        if (_0x279fdd === -1) {
          if (_0x51337e.test(_0x292ed8[_0x685e11])) {
            _0x279fdd = _0x685e11;
          }
        } else if (/^#{1,6}\s/.test(_0x292ed8[_0x685e11]) || /^---/.test(_0x292ed8[_0x685e11])) {
          const _0x38b80c = _0x292ed8.slice(0, _0x279fdd);
          const _0x12fdb2 = _0x292ed8.slice(_0x279fdd, _0x685e11);
          const _0x2fe02c = _0x292ed8.slice(_0x685e11);
          return [..._0x38b80c, "<" + _0x4c866f + ">", ..._0x12fdb2, "</" + _0x4c866f + ">", ..._0x2fe02c].join("\n");
        }
      }
      if (_0x279fdd !== -1) {
        const _0x1cac4d = _0x292ed8.slice(0, _0x279fdd);
        const _0x999349 = _0x292ed8.slice(_0x279fdd);
        return [..._0x1cac4d, "<" + _0x4c866f + ">", ..._0x999349, "</" + _0x4c866f + ">"].join("\n");
      }
      return _0x469d35;
    }
    function _0xef51d8(_0x51ac1f) {
      if (!_0x51ac1f || typeof _0x51ac1f !== "string") {
        return _0x51ac1f;
      }
      if (/<[a-z_][a-z0-9_-]*>/i.test(_0x51ac1f)) {
        return _0x51ac1f;
      }
      let _0x467e21 = _0x51ac1f;
      _0x467e21 = _0x24abf2(_0x467e21, /^##[ \t]*(?:your[ \t]+)?role[ \t]*$/im, "role");
      _0x467e21 = _0x24abf2(_0x467e21, /^##[ \t]*(?:constraints?|rules?)[ \t]*$/im, "constraints");
      return _0x467e21;
    }
    function _0x48dcef(_0x10c5b2) {
      if (!_0x10c5b2 || typeof _0x10c5b2 !== "string") {
        return _0x10c5b2;
      }
      if (/\bverif|test|validate|expected\s+output/i.test(_0x10c5b2)) {
        return _0x10c5b2;
      }
      const _0x17bc2f = "\n\n## Verification\n\nAfter completing this task:\n- [ ] Run relevant tests to verify the change works\n- [ ] Check for regressions in related functionality\n- [ ] Verify expected output matches: [describe expected result]\n";
      return _0x10c5b2.trim() + _0x17bc2f;
    }
    function _0x1edaef(_0x1d4dfb) {
      if (!_0x1d4dfb || typeof _0x1d4dfb !== "string") {
        return _0x1d4dfb;
      }
      const _0x3a4734 = _0x1d4dfb.split("\n");
      let _0x47d304 = false;
      let _0x3bf18c = -1;
      for (let _0x435d7a = 0; _0x435d7a < _0x3a4734.length; _0x435d7a++) {
        if (_0x3a4734[_0x435d7a].trim() === "---") {
          if (!_0x47d304) {
            _0x47d304 = true;
          } else {
            break;
          }
        } else if (_0x47d304 && _0x3a4734[_0x435d7a].startsWith("description:")) {
          _0x3bf18c = _0x435d7a;
          break;
        }
      }
      if (_0x3bf18c >= 0) {
        const _0x1f00e5 = _0x3a4734[_0x3bf18c];
        if (!/use when user asks/i.test(_0x1f00e5)) {
          const _0x3beee9 = _0x1f00e5.match(/^description:[ \t]*(\S.*)$/);
          if (_0x3beee9) {
            const _0x47b998 = _0x3beee9[1].trim();
            _0x3a4734[_0x3bf18c] = "description: Use when user asks to " + _0x47b998.toLowerCase().replace(/^to\s+/i, "");
          }
        }
      }
      return _0x3a4734.join("\n");
    }
    function _0x1e141d(_0xf01c32) {
      if (!_0xf01c32 || typeof _0xf01c32 !== "string") {
        return _0xf01c32;
      }
      let _0x4d8f21 = _0xf01c32;
      const _0x189670 = [];
      let _0x5006b3 = 0;
      _0x4d8f21 = _0x4d8f21.replace(/```[\s\S]*?```/g, _0x4c8199 => {
        _0x189670.push(_0x4c8199);
        return "__CODE_BLOCK_" + _0x5006b3++ + "__";
      });
      const _0x21582a = ["API", "JSON", "XML", "HTML", "CSS", "URL", "HTTP", "HTTPS", "SQL", "CLI", "SDK", "JWT", "UUID", "REST", "YAML", "EOF", "TODO", "FIXME", "NOTE", "README", "MCP", "HIGH", "MEDIUM", "LOW"];
      _0x4d8f21 = _0x4d8f21.replace(/\b[A-Z]{3,}\b/g, _0x4a6d41 => {
        if (_0x21582a.includes(_0x4a6d41)) {
          return _0x4a6d41;
        }
        return _0x4a6d41.charAt(0) + _0x4a6d41.slice(1).toLowerCase();
      });
      _0x4d8f21 = _0x4d8f21.replace(/!{2,}/g, "!");
      for (let _0x2e36e9 = 0; _0x2e36e9 < _0x189670.length; _0x2e36e9++) {
        _0x4d8f21 = _0x4d8f21.replace("__CODE_BLOCK_" + _0x2e36e9 + "__", _0x189670[_0x2e36e9]);
      }
      return _0x4d8f21;
    }
    const _0x4562e9 = {
      applyFixes: _0x3d431a,
      fixAdditionalProperties: _0x273857,
      fixRequiredFields: _0x4c8b73,
      fixVersionMismatch: _0x58db9d,
      fixMissingFrontmatter: _0x150b4b,
      fixUnrestrictedBash: _0x2ed2c7,
      fixMissingRole: _0x1ec0a2,
      fixInconsistentHeadings: _0x5071f3,
      fixVerboseExplanations: _0x44e486,
      fixMissingOutputFormat: _0x145b29,
      fixMissingExamples: _0x4ebc54,
      fixMissingXmlStructure: _0xef51d8,
      fixMissingVerificationCriteria: _0x48dcef,
      fixMissingTriggerPhrase: _0x1edaef,
      fixAggressiveEmphasis: _0x1e141d,
      previewFixes: _0x97047f,
      restoreFromBackup: _0x5d2437,
      cleanupBackups: _0x263145,
      assertNotSymlink: _0x5e2623,
      applyAtPath: _0x1f5ea3
    };
    _0x200493.exports = _0x4562e9;
  }
});
var require_reporter = __commonJS({
  "../work/agent-sh__agentsys/lib/enhance/reporter.js"(_0xf776ad, _0x1a04e4) {
    function _0x382b2b(_0x3a029c, _0x2c5e66 = {}) {
      const {
        verbose = false,
        compact = false
      } = _0x2c5e66;
      const _0x446f68 = _0x1406bd => {
        if (verbose) {
          return _0x1406bd;
        }
        return _0x1406bd.filter(_0x116c6f => _0x116c6f.certainty !== "LOW");
      };
      const _0x1ae7c1 = _0x446f68(_0x3a029c.toolIssues || []);
      const _0x56e56e = _0x446f68(_0x3a029c.structureIssues || []);
      const _0x37fada = _0x446f68(_0x3a029c.securityIssues || []);
      const _0x2510a6 = _0x1ae7c1.length + _0x56e56e.length + _0x37fada.length;
      if (compact) {
        return _0x55de41(_0x3a029c.pluginName, _0x1ae7c1, _0x56e56e, _0x37fada);
      }
      const _0x1da912 = [];
      _0x1da912.push("## Plugin Analysis: " + _0x3a029c.pluginName);
      _0x1da912.push("");
      _0x1da912.push("**Analyzed**: " + new Date().toISOString());
      _0x1da912.push("**Files scanned**: " + (_0x3a029c.filesScanned || 0));
      _0x1da912.push("");
      _0x1da912.push("### Summary");
      _0x1da912.push("");
      const _0x159f4b = _0x12c45b([..._0x1ae7c1, ..._0x56e56e, ..._0x37fada], "HIGH");
      const _0x152027 = _0x12c45b([..._0x1ae7c1, ..._0x56e56e, ..._0x37fada], "MEDIUM");
      const _0x2cb93b = verbose ? _0x12c45b([..._0x1ae7c1, ..._0x56e56e, ..._0x37fada], "LOW") : 0;
      _0x1da912.push("| Certainty | Count |");
      _0x1da912.push("|-----------|-------|");
      _0x1da912.push("| HIGH | " + _0x159f4b + " |");
      _0x1da912.push("| MEDIUM | " + _0x152027 + " |");
      if (verbose) {
        _0x1da912.push("| LOW | " + _0x2cb93b + " |");
      }
      _0x1da912.push("| **Total** | **" + _0x2510a6 + "** |");
      _0x1da912.push("");
      if (_0x1ae7c1.length > 0) {
        _0x1da912.push("### Tool Definitions (" + _0x1ae7c1.length + " issues)");
        _0x1da912.push("");
        _0x1da912.push("| Tool | Issue | Fix | Certainty |");
        _0x1da912.push("|------|-------|-----|-----------|");
        for (const _0x4d48bf of _0x1ae7c1) {
          _0x1da912.push("| " + (_0x4d48bf.tool || "-") + " | " + _0x4d48bf.issue + " | " + (_0x4d48bf.fix || "-") + " | " + _0x4d48bf.certainty + " |");
        }
        _0x1da912.push("");
      }
      if (_0x56e56e.length > 0) {
        _0x1da912.push("### Structure (" + _0x56e56e.length + " issues)");
        _0x1da912.push("");
        _0x1da912.push("| File | Issue | Certainty |");
        _0x1da912.push("|------|-------|-----------|");
        for (const _0x90ba18 of _0x56e56e) {
          _0x1da912.push("| " + (_0x90ba18.file || "-") + " | " + _0x90ba18.issue + " | " + _0x90ba18.certainty + " |");
        }
        _0x1da912.push("");
      }
      if (_0x37fada.length > 0) {
        _0x1da912.push("### Security (" + _0x37fada.length + " issues)");
        _0x1da912.push("");
        _0x1da912.push("| File | Line | Issue | Certainty |");
        _0x1da912.push("|------|------|-------|-----------|");
        for (const _0x337ce8 of _0x37fada) {
          _0x1da912.push("| " + (_0x337ce8.file || "-") + " | " + (_0x337ce8.line || "-") + " | " + _0x337ce8.issue + " | " + _0x337ce8.certainty + " |");
        }
        _0x1da912.push("");
      }
      if (_0x2510a6 === 0) {
        _0x1da912.push("No issues found.");
        _0x1da912.push("");
      }
      return _0x1da912.join("\n");
    }
    function _0x55de41(_0x547775, _0x2f1185, _0x1125c6, _0x3ba03e) {
      const _0x4e2a01 = [];
      _0x4e2a01.push("## " + _0x547775 + ": " + (_0x2f1185.length + _0x1125c6.length + _0x3ba03e.length) + " issues");
      _0x4e2a01.push("");
      const _0x142e01 = [..._0x2f1185.map(_0xc326fc => ({
        ..._0xc326fc,
        category: "Tool"
      })), ..._0x1125c6.map(_0x4de1d1 => ({
        ..._0x4de1d1,
        category: "Structure"
      })), ..._0x3ba03e.map(_0x36fb98 => ({
        ..._0x36fb98,
        category: "Security"
      }))];
      const _0x557e46 = {
        HIGH: 0,
        MEDIUM: 1,
        LOW: 2
      };
      _0x142e01.sort((_0x2240b1, _0x3981d8) => _0x557e46[_0x2240b1.certainty] - _0x557e46[_0x3981d8.certainty]);
      if (_0x142e01.length > 0) {
        _0x4e2a01.push("| Category | Issue | Certainty |");
        _0x4e2a01.push("|----------|-------|-----------|");
        for (const _0x215132 of _0x142e01) {
          _0x4e2a01.push("| " + _0x215132.category + " | " + _0x215132.issue + " | " + _0x215132.certainty + " |");
        }
      } else {
        _0x4e2a01.push("No issues found.");
      }
      return _0x4e2a01.join("\n");
    }
    function _0x12c45b(_0x3f3566, _0x5e61ee) {
      return _0x3f3566.filter(_0x1ca92e => _0x1ca92e.certainty === _0x5e61ee).length;
    }
    function _0x2942f5(_0x16a4db, _0x3fbcec, _0x1d8356) {
      const _0x531459 = [];
      _0x531459.push("```diff");
      _0x531459.push("--- a/" + _0x1d8356);
      _0x531459.push("+++ b/" + _0x1d8356);
      const _0x288bd5 = _0x16a4db.split("\n");
      const _0x5d1354 = _0x3fbcec.split("\n");
      const _0x541d5c = Math.max(_0x288bd5.length, _0x5d1354.length);
      for (let _0x3e4ff6 = 0; _0x3e4ff6 < _0x541d5c; _0x3e4ff6++) {
        const _0x1f7d74 = _0x288bd5[_0x3e4ff6];
        const _0x39fc3c = _0x5d1354[_0x3e4ff6];
        if (_0x1f7d74 === _0x39fc3c) {
          if (_0x1f7d74 !== undefined) {
            _0x531459.push(" " + _0x1f7d74);
          }
        } else {
          if (_0x1f7d74 !== undefined) {
            _0x531459.push("-" + _0x1f7d74);
          }
          if (_0x39fc3c !== undefined) {
            _0x531459.push("+" + _0x39fc3c);
          }
        }
      }
      _0x531459.push("```");
      return _0x531459.join("\n");
    }
    function _0x52ef17(_0x2f2473, _0xd4a39e = {}) {
      const _0x197ade = [];
      _0x197ade.push("# Plugin Analysis Summary");
      _0x197ade.push("");
      _0x197ade.push("**Analyzed**: " + _0x2f2473.length + " plugins");
      _0x197ade.push("**Date**: " + new Date().toISOString());
      _0x197ade.push("");
      let _0xdc652d = 0;
      let _0x421b00 = 0;
      let _0x52e8b6 = 0;
      for (const _0x160cfe of _0x2f2473) {
        const _0x2d18c6 = [...(_0x160cfe.toolIssues || []), ...(_0x160cfe.structureIssues || []), ...(_0x160cfe.securityIssues || [])];
        _0xdc652d += _0x12c45b(_0x2d18c6, "HIGH");
        _0x421b00 += _0x12c45b(_0x2d18c6, "MEDIUM");
        _0x52e8b6 += _0x12c45b(_0x2d18c6, "LOW");
      }
      _0x197ade.push("## Overall");
      _0x197ade.push("");
      _0x197ade.push("| Certainty | Count |");
      _0x197ade.push("|-----------|-------|");
      _0x197ade.push("| HIGH | " + _0xdc652d + " |");
      _0x197ade.push("| MEDIUM | " + _0x421b00 + " |");
      if (_0xd4a39e.verbose) {
        _0x197ade.push("| LOW | " + _0x52e8b6 + " |");
      }
      _0x197ade.push("");
      _0x197ade.push("## By Plugin");
      _0x197ade.push("");
      _0x197ade.push("| Plugin | HIGH | MEDIUM | LOW | Total |");
      _0x197ade.push("|--------|------|--------|-----|-------|");
      for (const _0x5e648d of _0x2f2473) {
        const _0x399ea2 = [...(_0x5e648d.toolIssues || []), ...(_0x5e648d.structureIssues || []), ...(_0x5e648d.securityIssues || [])];
        const _0x3bfe4d = _0x12c45b(_0x399ea2, "HIGH");
        const _0x1f067a = _0x12c45b(_0x399ea2, "MEDIUM");
        const _0x32ddd7 = _0x12c45b(_0x399ea2, "LOW");
        _0x197ade.push("| " + _0x5e648d.pluginName + " | " + _0x3bfe4d + " | " + _0x1f067a + " | " + _0x32ddd7 + " | " + (_0x3bfe4d + _0x1f067a + _0x32ddd7) + " |");
      }
      _0x197ade.push("");
      return _0x197ade.join("\n");
    }
    function _0x42c35b(_0x2ad73b, _0x4ff028 = {}) {
      const _0x49f27e = [];
      _0x49f27e.push("# Agent Analysis: " + _0x2ad73b.agentName);
      _0x49f27e.push("");
      _0x49f27e.push("**File**: " + _0x2ad73b.agentPath);
      _0x49f27e.push("**Analyzed**: " + new Date().toISOString());
      _0x49f27e.push("");
      const _0x121523 = [...(_0x2ad73b.structureIssues || []), ...(_0x2ad73b.toolIssues || []), ...(_0x2ad73b.xmlIssues || []), ...(_0x2ad73b.cotIssues || []), ...(_0x2ad73b.exampleIssues || []), ...(_0x2ad73b.antiPatternIssues || []), ...(_0x2ad73b.crossPlatformIssues || [])];
      const _0x473d21 = _0x12c45b(_0x121523, "HIGH");
      const _0x12ca38 = _0x12c45b(_0x121523, "MEDIUM");
      const _0x3da3f1 = _0x12c45b(_0x121523, "LOW");
      _0x49f27e.push("## Summary");
      _0x49f27e.push("");
      _0x49f27e.push("| Certainty | Count |");
      _0x49f27e.push("|-----------|-------|");
      _0x49f27e.push("| HIGH | " + _0x473d21 + " |");
      _0x49f27e.push("| MEDIUM | " + _0x12ca38 + " |");
      if (_0x4ff028.verbose) {
        _0x49f27e.push("| LOW | " + _0x3da3f1 + " |");
      }
      _0x49f27e.push("");
      if (_0x2ad73b.structureIssues && _0x2ad73b.structureIssues.length > 0) {
        _0x49f27e.push("### Structure Issues (" + _0x2ad73b.structureIssues.length + ")");
        _0x49f27e.push("");
        _0x49f27e.push("| Issue | Fix | Certainty |");
        _0x49f27e.push("|-------|-----|-----------|");
        for (const _0x264f3b of _0x2ad73b.structureIssues) {
          _0x49f27e.push("| " + _0x264f3b.issue + " | " + (_0x264f3b.fix || "N/A") + " | " + _0x264f3b.certainty + " |");
        }
        _0x49f27e.push("");
      }
      if (_0x2ad73b.toolIssues && _0x2ad73b.toolIssues.length > 0) {
        _0x49f27e.push("### Tool Issues (" + _0x2ad73b.toolIssues.length + ")");
        _0x49f27e.push("");
        _0x49f27e.push("| Issue | Fix | Certainty |");
        _0x49f27e.push("|-------|-----|-----------|");
        for (const _0x3799b1 of _0x2ad73b.toolIssues) {
          _0x49f27e.push("| " + _0x3799b1.issue + " | " + (_0x3799b1.fix || "N/A") + " | " + _0x3799b1.certainty + " |");
        }
        _0x49f27e.push("");
      }
      if (_0x2ad73b.xmlIssues && _0x2ad73b.xmlIssues.length > 0) {
        _0x49f27e.push("### XML Structure Issues (" + _0x2ad73b.xmlIssues.length + ")");
        _0x49f27e.push("");
        _0x49f27e.push("| Issue | Fix | Certainty |");
        _0x49f27e.push("|-------|-----|-----------|");
        for (const _0x569716 of _0x2ad73b.xmlIssues) {
          _0x49f27e.push("| " + _0x569716.issue + " | " + (_0x569716.fix || "N/A") + " | " + _0x569716.certainty + " |");
        }
        _0x49f27e.push("");
      }
      if (_0x2ad73b.cotIssues && _0x2ad73b.cotIssues.length > 0) {
        _0x49f27e.push("### Chain-of-Thought Issues (" + _0x2ad73b.cotIssues.length + ")");
        _0x49f27e.push("");
        _0x49f27e.push("| Issue | Fix | Certainty |");
        _0x49f27e.push("|-------|-----|-----------|");
        for (const _0x2ee8ca of _0x2ad73b.cotIssues) {
          _0x49f27e.push("| " + _0x2ee8ca.issue + " | " + (_0x2ee8ca.fix || "N/A") + " | " + _0x2ee8ca.certainty + " |");
        }
        _0x49f27e.push("");
      }
      if (_0x2ad73b.exampleIssues && _0x2ad73b.exampleIssues.length > 0) {
        _0x49f27e.push("### Example Issues (" + _0x2ad73b.exampleIssues.length + ")");
        _0x49f27e.push("");
        _0x49f27e.push("| Issue | Fix | Certainty |");
        _0x49f27e.push("|-------|-----|-----------|");
        for (const _0x5634e6 of _0x2ad73b.exampleIssues) {
          _0x49f27e.push("| " + _0x5634e6.issue + " | " + (_0x5634e6.fix || "N/A") + " | " + _0x5634e6.certainty + " |");
        }
        _0x49f27e.push("");
      }
      if (_0x2ad73b.antiPatternIssues && _0x2ad73b.antiPatternIssues.length > 0) {
        _0x49f27e.push("### Anti-Pattern Issues (" + _0x2ad73b.antiPatternIssues.length + ")");
        _0x49f27e.push("");
        _0x49f27e.push("| Issue | Fix | Certainty |");
        _0x49f27e.push("|-------|-----|-----------|");
        for (const _0x6a6dc7 of _0x2ad73b.antiPatternIssues) {
          _0x49f27e.push("| " + _0x6a6dc7.issue + " | " + (_0x6a6dc7.fix || "N/A") + " | " + _0x6a6dc7.certainty + " |");
        }
        _0x49f27e.push("");
      }
      if (_0x2ad73b.crossPlatformIssues && _0x2ad73b.crossPlatformIssues.length > 0) {
        _0x49f27e.push("### Cross-Platform Issues (" + _0x2ad73b.crossPlatformIssues.length + ")");
        _0x49f27e.push("");
        _0x49f27e.push("| Issue | Fix | Certainty |");
        _0x49f27e.push("|-------|-----|-----------|");
        for (const _0x109f57 of _0x2ad73b.crossPlatformIssues) {
          _0x49f27e.push("| " + _0x109f57.issue + " | " + (_0x109f57.fix || "N/A") + " | " + _0x109f57.certainty + " |");
        }
        _0x49f27e.push("");
      }
      return _0x49f27e.join("\n");
    }
    function _0x3ba005(_0x165189, _0x37a949 = {}) {
      const _0x3a13fb = [];
      _0x3a13fb.push("# Agent Analysis Summary");
      _0x3a13fb.push("");
      _0x3a13fb.push("**Analyzed**: " + _0x165189.length + " agents");
      _0x3a13fb.push("**Date**: " + new Date().toISOString());
      _0x3a13fb.push("");
      let _0x5ef839 = 0;
      let _0x4cd49f = 0;
      let _0xb00a80 = 0;
      for (const _0xd5610f of _0x165189) {
        const _0x58b03f = [...(_0xd5610f.structureIssues || []), ...(_0xd5610f.toolIssues || []), ...(_0xd5610f.xmlIssues || []), ...(_0xd5610f.cotIssues || []), ...(_0xd5610f.exampleIssues || []), ...(_0xd5610f.antiPatternIssues || []), ...(_0xd5610f.crossPlatformIssues || [])];
        _0x5ef839 += _0x12c45b(_0x58b03f, "HIGH");
        _0x4cd49f += _0x12c45b(_0x58b03f, "MEDIUM");
        _0xb00a80 += _0x12c45b(_0x58b03f, "LOW");
      }
      _0x3a13fb.push("## Overall");
      _0x3a13fb.push("");
      _0x3a13fb.push("| Certainty | Count |");
      _0x3a13fb.push("|-----------|-------|");
      _0x3a13fb.push("| HIGH | " + _0x5ef839 + " |");
      _0x3a13fb.push("| MEDIUM | " + _0x4cd49f + " |");
      if (_0x37a949.verbose) {
        _0x3a13fb.push("| LOW | " + _0xb00a80 + " |");
      }
      _0x3a13fb.push("");
      _0x3a13fb.push("## By Agent");
      _0x3a13fb.push("");
      _0x3a13fb.push("| Agent | HIGH | MEDIUM | LOW | Total |");
      _0x3a13fb.push("|-------|------|--------|-----|-------|");
      for (const _0x185808 of _0x165189) {
        const _0x48829e = [...(_0x185808.structureIssues || []), ...(_0x185808.toolIssues || []), ...(_0x185808.xmlIssues || []), ...(_0x185808.cotIssues || []), ...(_0x185808.exampleIssues || []), ...(_0x185808.antiPatternIssues || []), ...(_0x185808.crossPlatformIssues || [])];
        const _0xf620e1 = _0x12c45b(_0x48829e, "HIGH");
        const _0x4eb594 = _0x12c45b(_0x48829e, "MEDIUM");
        const _0x292be7 = _0x12c45b(_0x48829e, "LOW");
        _0x3a13fb.push("| " + _0x185808.agentName + " | " + _0xf620e1 + " | " + _0x4eb594 + " | " + _0x292be7 + " | " + (_0xf620e1 + _0x4eb594 + _0x292be7) + " |");
      }
      _0x3a13fb.push("");
      return _0x3a13fb.join("\n");
    }
    function _0xa65d90(_0xe53e76, _0x2c10c2 = {}) {
      const _0x4904df = [];
      _0x4904df.push("# Documentation Analysis: " + _0xe53e76.docName);
      _0x4904df.push("");
      _0x4904df.push("**File**: " + _0xe53e76.docPath);
      _0x4904df.push("**Mode**: " + (_0xe53e76.mode === "ai" ? "AI-only (RAG optimized)" : "Both audiences"));
      _0x4904df.push("**Token Count**: ~" + _0xe53e76.tokenCount);
      _0x4904df.push("**Analyzed**: " + new Date().toISOString());
      _0x4904df.push("");
      const _0x115582 = [...(_0xe53e76.linkIssues || []), ...(_0xe53e76.structureIssues || []), ...(_0xe53e76.codeIssues || []), ...(_0xe53e76.efficiencyIssues || []), ...(_0xe53e76.ragIssues || []), ...(_0xe53e76.balanceIssues || [])];
      const _0x23e11d = _0x12c45b(_0x115582, "HIGH");
      const _0x412fa8 = _0x12c45b(_0x115582, "MEDIUM");
      const _0x1e8c9e = _0x12c45b(_0x115582, "LOW");
      _0x4904df.push("## Summary");
      _0x4904df.push("");
      _0x4904df.push("| Certainty | Count |");
      _0x4904df.push("|-----------|-------|");
      _0x4904df.push("| HIGH | " + _0x23e11d + " |");
      _0x4904df.push("| MEDIUM | " + _0x412fa8 + " |");
      if (_0x2c10c2.verbose) {
        _0x4904df.push("| LOW | " + _0x1e8c9e + " |");
      }
      _0x4904df.push("");
      if (_0xe53e76.linkIssues && _0xe53e76.linkIssues.length > 0) {
        _0x4904df.push("### Link Issues (" + _0xe53e76.linkIssues.length + ")");
        _0x4904df.push("");
        _0x4904df.push("| Issue | Fix | Certainty |");
        _0x4904df.push("|-------|-----|-----------|");
        for (const _0x146fa6 of _0xe53e76.linkIssues) {
          _0x4904df.push("| " + _0x146fa6.issue + " | " + (_0x146fa6.fix || "N/A") + " | " + _0x146fa6.certainty + " |");
        }
        _0x4904df.push("");
      }
      if (_0xe53e76.structureIssues && _0xe53e76.structureIssues.length > 0) {
        _0x4904df.push("### Structure Issues (" + _0xe53e76.structureIssues.length + ")");
        _0x4904df.push("");
        _0x4904df.push("| Issue | Fix | Certainty |");
        _0x4904df.push("|-------|-----|-----------|");
        for (const _0x5e1eca of _0xe53e76.structureIssues) {
          _0x4904df.push("| " + _0x5e1eca.issue + " | " + (_0x5e1eca.fix || "N/A") + " | " + _0x5e1eca.certainty + " |");
        }
        _0x4904df.push("");
      }
      if (_0xe53e76.codeIssues && _0xe53e76.codeIssues.length > 0) {
        _0x4904df.push("### Code Block Issues (" + _0xe53e76.codeIssues.length + ")");
        _0x4904df.push("");
        _0x4904df.push("| Issue | Fix | Certainty |");
        _0x4904df.push("|-------|-----|-----------|");
        for (const _0x1ad1f8 of _0xe53e76.codeIssues) {
          _0x4904df.push("| " + _0x1ad1f8.issue + " | " + (_0x1ad1f8.fix || "N/A") + " | " + _0x1ad1f8.certainty + " |");
        }
        _0x4904df.push("");
      }
      if (_0xe53e76.efficiencyIssues && _0xe53e76.efficiencyIssues.length > 0) {
        _0x4904df.push("### Efficiency Issues (" + _0xe53e76.efficiencyIssues.length + ")");
        _0x4904df.push("");
        _0x4904df.push("| Issue | Fix | Certainty |");
        _0x4904df.push("|-------|-----|-----------|");
        for (const _0x4493f5 of _0xe53e76.efficiencyIssues) {
          _0x4904df.push("| " + _0x4493f5.issue + " | " + (_0x4493f5.fix || "N/A") + " | " + _0x4493f5.certainty + " |");
        }
        _0x4904df.push("");
      }
      if (_0xe53e76.ragIssues && _0xe53e76.ragIssues.length > 0) {
        _0x4904df.push("### RAG Optimization Issues (" + _0xe53e76.ragIssues.length + ")");
        _0x4904df.push("");
        _0x4904df.push("| Issue | Fix | Certainty |");
        _0x4904df.push("|-------|-----|-----------|");
        for (const _0x6a6f6 of _0xe53e76.ragIssues) {
          _0x4904df.push("| " + _0x6a6f6.issue + " | " + (_0x6a6f6.fix || "N/A") + " | " + _0x6a6f6.certainty + " |");
        }
        _0x4904df.push("");
      }
      if (_0xe53e76.balanceIssues && _0xe53e76.balanceIssues.length > 0) {
        _0x4904df.push("### Balance Suggestions (" + _0xe53e76.balanceIssues.length + ")");
        _0x4904df.push("");
        _0x4904df.push("| Issue | Fix | Certainty |");
        _0x4904df.push("|-------|-----|-----------|");
        for (const _0x4782c1 of _0xe53e76.balanceIssues) {
          _0x4904df.push("| " + _0x4782c1.issue + " | " + (_0x4782c1.fix || "N/A") + " | " + _0x4782c1.certainty + " |");
        }
        _0x4904df.push("");
      }
      if (_0x115582.length === 0) {
        _0x4904df.push("No issues found.");
        _0x4904df.push("");
      }
      return _0x4904df.join("\n");
    }
    function _0x8fc5a9(_0x2db193, _0x26069d = {}) {
      const _0x253455 = [];
      const _0x5560ab = _0x2db193[0]?.mode || "both";
      _0x253455.push("# Documentation Analysis Summary");
      _0x253455.push("");
      _0x253455.push("**Analyzed**: " + _0x2db193.length + " documents");
      _0x253455.push("**Mode**: " + (_0x5560ab === "ai" ? "AI-only (RAG optimized)" : "Both audiences"));
      _0x253455.push("**Date**: " + new Date().toISOString());
      _0x253455.push("");
      let _0x1ef000 = 0;
      let _0x3a0f1f = 0;
      let _0x316feb = 0;
      let _0x5b940c = 0;
      for (const _0x5a913f of _0x2db193) {
        const _0x38cc1a = [...(_0x5a913f.linkIssues || []), ...(_0x5a913f.structureIssues || []), ...(_0x5a913f.codeIssues || []), ...(_0x5a913f.efficiencyIssues || []), ...(_0x5a913f.ragIssues || []), ...(_0x5a913f.balanceIssues || [])];
        _0x1ef000 += _0x12c45b(_0x38cc1a, "HIGH");
        _0x3a0f1f += _0x12c45b(_0x38cc1a, "MEDIUM");
        _0x316feb += _0x12c45b(_0x38cc1a, "LOW");
        _0x5b940c += _0x5a913f.tokenCount || 0;
      }
      _0x253455.push("## Overall");
      _0x253455.push("");
      _0x253455.push("**Total Tokens**: ~" + _0x5b940c);
      _0x253455.push("");
      _0x253455.push("| Certainty | Count |");
      _0x253455.push("|-----------|-------|");
      _0x253455.push("| HIGH | " + _0x1ef000 + " |");
      _0x253455.push("| MEDIUM | " + _0x3a0f1f + " |");
      if (_0x26069d.verbose) {
        _0x253455.push("| LOW | " + _0x316feb + " |");
      }
      _0x253455.push("");
      _0x253455.push("## By Document");
      _0x253455.push("");
      _0x253455.push("| Document | Tokens | HIGH | MEDIUM | LOW | Total |");
      _0x253455.push("|----------|--------|------|--------|-----|-------|");
      for (const _0x2823fa of _0x2db193) {
        const _0x31043e = [...(_0x2823fa.linkIssues || []), ...(_0x2823fa.structureIssues || []), ...(_0x2823fa.codeIssues || []), ...(_0x2823fa.efficiencyIssues || []), ...(_0x2823fa.ragIssues || []), ...(_0x2823fa.balanceIssues || [])];
        const _0x453511 = _0x12c45b(_0x31043e, "HIGH");
        const _0x3c1850 = _0x12c45b(_0x31043e, "MEDIUM");
        const _0xd08b99 = _0x12c45b(_0x31043e, "LOW");
        _0x253455.push("| " + _0x2823fa.docName + " | " + _0x2823fa.tokenCount + " | " + _0x453511 + " | " + _0x3c1850 + " | " + _0xd08b99 + " | " + (_0x453511 + _0x3c1850 + _0xd08b99) + " |");
      }
      _0x253455.push("");
      return _0x253455.join("\n");
    }
    function _0x3ff5b3(_0x2e406d, _0x2fa539 = {}) {
      const _0x19e8a1 = [];
      if (_0x2e406d.error) {
        _0x19e8a1.push("# Project Memory Analysis: Error");
        _0x19e8a1.push("");
        _0x19e8a1.push("**Error**: " + _0x2e406d.error);
        _0x19e8a1.push("");
        if (_0x2e406d.searchedPaths) {
          _0x19e8a1.push("Searched paths:");
          for (const _0x20afff of _0x2e406d.searchedPaths) {
            _0x19e8a1.push("- " + _0x20afff);
          }
        }
        return _0x19e8a1.join("\n");
      }
      _0x19e8a1.push("# Project Memory Analysis: " + _0x2e406d.fileName);
      _0x19e8a1.push("");
      _0x19e8a1.push("**File**: " + _0x2e406d.filePath);
      _0x19e8a1.push("**Type**: " + (_0x2e406d.fileType === "agents" ? "AGENTS.md (cross-platform)" : "CLAUDE.md"));
      _0x19e8a1.push("**Analyzed**: " + new Date().toISOString());
      _0x19e8a1.push("");
      if (_0x2e406d.metrics) {
        _0x19e8a1.push("## Metrics");
        _0x19e8a1.push("");
        _0x19e8a1.push("| Metric | Value |");
        _0x19e8a1.push("|--------|-------|");
        _0x19e8a1.push("| Estimated Tokens | " + _0x2e406d.metrics.estimatedTokens + " |");
        _0x19e8a1.push("| Characters | " + _0x2e406d.metrics.characterCount + " |");
        _0x19e8a1.push("| Lines | " + _0x2e406d.metrics.lineCount + " |");
        _0x19e8a1.push("| Words | " + _0x2e406d.metrics.wordCount + " |");
        if (_0x2e406d.metrics.readmeOverlap !== undefined) {
          _0x19e8a1.push("| README Overlap | " + Math.round(_0x2e406d.metrics.readmeOverlap * 100) + "% |");
        }
        _0x19e8a1.push("");
      }
      const _0x413958 = [...(_0x2e406d.structureIssues || []), ...(_0x2e406d.referenceIssues || []), ...(_0x2e406d.efficiencyIssues || []), ...(_0x2e406d.qualityIssues || []), ...(_0x2e406d.crossPlatformIssues || [])];
      const _0x2a5077 = _0x12c45b(_0x413958, "HIGH");
      const _0x58f84a = _0x12c45b(_0x413958, "MEDIUM");
      const _0x33af97 = _0x12c45b(_0x413958, "LOW");
      _0x19e8a1.push("## Summary");
      _0x19e8a1.push("");
      _0x19e8a1.push("| Certainty | Count |");
      _0x19e8a1.push("|-----------|-------|");
      _0x19e8a1.push("| HIGH | " + _0x2a5077 + " |");
      _0x19e8a1.push("| MEDIUM | " + _0x58f84a + " |");
      if (_0x2fa539.verbose) {
        _0x19e8a1.push("| LOW | " + _0x33af97 + " |");
      }
      _0x19e8a1.push("| **Total** | **" + _0x413958.length + "** |");
      _0x19e8a1.push("");
      if (_0x2e406d.structureIssues && _0x2e406d.structureIssues.length > 0) {
        _0x19e8a1.push("### Structure Issues (" + _0x2e406d.structureIssues.length + ")");
        _0x19e8a1.push("");
        _0x19e8a1.push("| Issue | Fix | Certainty |");
        _0x19e8a1.push("|-------|-----|-----------|");
        for (const _0x13b29d of _0x2e406d.structureIssues) {
          _0x19e8a1.push("| " + _0x13b29d.issue + " | " + (_0x13b29d.fix || "N/A") + " | " + _0x13b29d.certainty + " |");
        }
        _0x19e8a1.push("");
      }
      if (_0x2e406d.referenceIssues && _0x2e406d.referenceIssues.length > 0) {
        _0x19e8a1.push("### Reference Issues (" + _0x2e406d.referenceIssues.length + ")");
        _0x19e8a1.push("");
        _0x19e8a1.push("| Issue | Fix | Certainty |");
        _0x19e8a1.push("|-------|-----|-----------|");
        for (const _0x5b3c17 of _0x2e406d.referenceIssues) {
          _0x19e8a1.push("| " + _0x5b3c17.issue + " | " + (_0x5b3c17.fix || "N/A") + " | " + _0x5b3c17.certainty + " |");
        }
        _0x19e8a1.push("");
      }
      if (_0x2e406d.efficiencyIssues && _0x2e406d.efficiencyIssues.length > 0) {
        _0x19e8a1.push("### Efficiency Issues (" + _0x2e406d.efficiencyIssues.length + ")");
        _0x19e8a1.push("");
        _0x19e8a1.push("| Issue | Fix | Certainty |");
        _0x19e8a1.push("|-------|-----|-----------|");
        for (const _0xda60f6 of _0x2e406d.efficiencyIssues) {
          _0x19e8a1.push("| " + _0xda60f6.issue + " | " + (_0xda60f6.fix || "N/A") + " | " + _0xda60f6.certainty + " |");
        }
        _0x19e8a1.push("");
      }
      if (_0x2e406d.qualityIssues && _0x2e406d.qualityIssues.length > 0) {
        _0x19e8a1.push("### Quality Issues (" + _0x2e406d.qualityIssues.length + ")");
        _0x19e8a1.push("");
        _0x19e8a1.push("| Issue | Fix | Certainty |");
        _0x19e8a1.push("|-------|-----|-----------|");
        for (const _0x4c7636 of _0x2e406d.qualityIssues) {
          _0x19e8a1.push("| " + _0x4c7636.issue + " | " + (_0x4c7636.fix || "N/A") + " | " + _0x4c7636.certainty + " |");
        }
        _0x19e8a1.push("");
      }
      if (_0x2e406d.crossPlatformIssues && _0x2e406d.crossPlatformIssues.length > 0) {
        _0x19e8a1.push("### Cross-Platform Issues (" + _0x2e406d.crossPlatformIssues.length + ")");
        _0x19e8a1.push("");
        _0x19e8a1.push("| Issue | Fix | Certainty |");
        _0x19e8a1.push("|-------|-----|-----------|");
        for (const _0x26251c of _0x2e406d.crossPlatformIssues) {
          _0x19e8a1.push("| " + _0x26251c.issue + " | " + (_0x26251c.fix || "N/A") + " | " + _0x26251c.certainty + " |");
        }
        _0x19e8a1.push("");
      }
      if (_0x413958.length === 0) {
        _0x19e8a1.push("No issues found.");
        _0x19e8a1.push("");
      }
      return _0x19e8a1.join("\n");
    }
    function _0x11cc6e(_0x434033, _0x192bee = {}) {
      const _0x27b413 = [];
      _0x27b413.push("# Project Memory Analysis Summary");
      _0x27b413.push("");
      _0x27b413.push("**Analyzed**: " + _0x434033.length + " files");
      _0x27b413.push("**Date**: " + new Date().toISOString());
      _0x27b413.push("");
      let _0x36ec96 = 0;
      let _0x319f38 = 0;
      let _0xe0d993 = 0;
      let _0x20259d = 0;
      for (const _0x348fbc of _0x434033) {
        if (_0x348fbc.error) {
          continue;
        }
        const _0x28bded = [...(_0x348fbc.structureIssues || []), ...(_0x348fbc.referenceIssues || []), ...(_0x348fbc.efficiencyIssues || []), ...(_0x348fbc.qualityIssues || []), ...(_0x348fbc.crossPlatformIssues || [])];
        _0x36ec96 += _0x12c45b(_0x28bded, "HIGH");
        _0x319f38 += _0x12c45b(_0x28bded, "MEDIUM");
        _0xe0d993 += _0x12c45b(_0x28bded, "LOW");
        if (_0x348fbc.metrics) {
          _0x20259d += _0x348fbc.metrics.estimatedTokens || 0;
        }
      }
      _0x27b413.push("## Overall");
      _0x27b413.push("");
      _0x27b413.push("| Metric | Value |");
      _0x27b413.push("|--------|-------|");
      _0x27b413.push("| Total Tokens | " + _0x20259d + " |");
      _0x27b413.push("| HIGH Issues | " + _0x36ec96 + " |");
      _0x27b413.push("| MEDIUM Issues | " + _0x319f38 + " |");
      if (_0x192bee.verbose) {
        _0x27b413.push("| LOW Issues | " + _0xe0d993 + " |");
      }
      _0x27b413.push("");
      _0x27b413.push("## By File");
      _0x27b413.push("");
      _0x27b413.push("| File | Tokens | HIGH | MEDIUM | LOW | Total |");
      _0x27b413.push("|------|--------|------|--------|-----|-------|");
      for (const _0x55bbe2 of _0x434033) {
        if (_0x55bbe2.error) {
          _0x27b413.push("| " + (_0x55bbe2.filePath || "Unknown") + " | - | Error | - | - | - |");
          continue;
        }
        const _0x5679ab = [...(_0x55bbe2.structureIssues || []), ...(_0x55bbe2.referenceIssues || []), ...(_0x55bbe2.efficiencyIssues || []), ...(_0x55bbe2.qualityIssues || []), ...(_0x55bbe2.crossPlatformIssues || [])];
        const _0x44d6e0 = _0x12c45b(_0x5679ab, "HIGH");
        const _0x2d6e28 = _0x12c45b(_0x5679ab, "MEDIUM");
        const _0x1d33f3 = _0x12c45b(_0x5679ab, "LOW");
        const _0x366eee = _0x55bbe2.metrics?.estimatedTokens || "-";
        _0x27b413.push("| " + _0x55bbe2.fileName + " | " + _0x366eee + " | " + _0x44d6e0 + " | " + _0x2d6e28 + " | " + _0x1d33f3 + " | " + (_0x44d6e0 + _0x2d6e28 + _0x1d33f3) + " |");
      }
      _0x27b413.push("");
      return _0x27b413.join("\n");
    }
    function _0x24a063(_0x8c576e, _0x527b16 = {}) {
      const _0x8f3839 = [];
      _0x8f3839.push("# Prompt Analysis: " + _0x8c576e.promptName);
      _0x8f3839.push("");
      _0x8f3839.push("**File**: " + _0x8c576e.promptPath);
      _0x8f3839.push("**Type**: " + (_0x8c576e.promptType || "unknown"));
      _0x8f3839.push("**Token Count**: ~" + _0x8c576e.tokenCount);
      _0x8f3839.push("**Analyzed**: " + new Date().toISOString());
      _0x8f3839.push("");
      const _0x2daeac = [...(_0x8c576e.clarityIssues || []), ...(_0x8c576e.structureIssues || []), ...(_0x8c576e.exampleIssues || []), ...(_0x8c576e.contextIssues || []), ...(_0x8c576e.outputIssues || []), ...(_0x8c576e.antiPatternIssues || []), ...(_0x8c576e.codeValidationIssues || [])];
      const _0xb27b29 = _0x12c45b(_0x2daeac, "HIGH");
      const _0x4feec8 = _0x12c45b(_0x2daeac, "MEDIUM");
      const _0x4b2d5a = _0x12c45b(_0x2daeac, "LOW");
      _0x8f3839.push("## Summary");
      _0x8f3839.push("");
      _0x8f3839.push("| Certainty | Count |");
      _0x8f3839.push("|-----------|-------|");
      _0x8f3839.push("| HIGH | " + _0xb27b29 + " |");
      _0x8f3839.push("| MEDIUM | " + _0x4feec8 + " |");
      if (_0x527b16.verbose) {
        _0x8f3839.push("| LOW | " + _0x4b2d5a + " |");
      }
      _0x8f3839.push("");
      if (_0x8c576e.clarityIssues && _0x8c576e.clarityIssues.length > 0) {
        _0x8f3839.push("### Clarity Issues (" + _0x8c576e.clarityIssues.length + ")");
        _0x8f3839.push("");
        _0x8f3839.push("| Issue | Fix | Certainty |");
        _0x8f3839.push("|-------|-----|-----------|");
        for (const _0x25bc93 of _0x8c576e.clarityIssues) {
          _0x8f3839.push("| " + _0x25bc93.issue + " | " + (_0x25bc93.fix || "N/A") + " | " + _0x25bc93.certainty + " |");
        }
        _0x8f3839.push("");
      }
      if (_0x8c576e.structureIssues && _0x8c576e.structureIssues.length > 0) {
        _0x8f3839.push("### Structure Issues (" + _0x8c576e.structureIssues.length + ")");
        _0x8f3839.push("");
        _0x8f3839.push("| Issue | Fix | Certainty |");
        _0x8f3839.push("|-------|-----|-----------|");
        for (const _0x4a7d2e of _0x8c576e.structureIssues) {
          _0x8f3839.push("| " + _0x4a7d2e.issue + " | " + (_0x4a7d2e.fix || "N/A") + " | " + _0x4a7d2e.certainty + " |");
        }
        _0x8f3839.push("");
      }
      if (_0x8c576e.exampleIssues && _0x8c576e.exampleIssues.length > 0) {
        _0x8f3839.push("### Example Issues (" + _0x8c576e.exampleIssues.length + ")");
        _0x8f3839.push("");
        _0x8f3839.push("| Issue | Fix | Certainty |");
        _0x8f3839.push("|-------|-----|-----------|");
        for (const _0x172d2a of _0x8c576e.exampleIssues) {
          _0x8f3839.push("| " + _0x172d2a.issue + " | " + (_0x172d2a.fix || "N/A") + " | " + _0x172d2a.certainty + " |");
        }
        _0x8f3839.push("");
      }
      if (_0x8c576e.contextIssues && _0x8c576e.contextIssues.length > 0) {
        _0x8f3839.push("### Context Issues (" + _0x8c576e.contextIssues.length + ")");
        _0x8f3839.push("");
        _0x8f3839.push("| Issue | Fix | Certainty |");
        _0x8f3839.push("|-------|-----|-----------|");
        for (const _0x1c99b5 of _0x8c576e.contextIssues) {
          _0x8f3839.push("| " + _0x1c99b5.issue + " | " + (_0x1c99b5.fix || "N/A") + " | " + _0x1c99b5.certainty + " |");
        }
        _0x8f3839.push("");
      }
      if (_0x8c576e.outputIssues && _0x8c576e.outputIssues.length > 0) {
        _0x8f3839.push("### Output Format Issues (" + _0x8c576e.outputIssues.length + ")");
        _0x8f3839.push("");
        _0x8f3839.push("| Issue | Fix | Certainty |");
        _0x8f3839.push("|-------|-----|-----------|");
        for (const _0x1d5bd8 of _0x8c576e.outputIssues) {
          _0x8f3839.push("| " + _0x1d5bd8.issue + " | " + (_0x1d5bd8.fix || "N/A") + " | " + _0x1d5bd8.certainty + " |");
        }
        _0x8f3839.push("");
      }
      if (_0x8c576e.antiPatternIssues && _0x8c576e.antiPatternIssues.length > 0) {
        _0x8f3839.push("### Anti-Pattern Issues (" + _0x8c576e.antiPatternIssues.length + ")");
        _0x8f3839.push("");
        _0x8f3839.push("| Issue | Fix | Certainty |");
        _0x8f3839.push("|-------|-----|-----------|");
        for (const _0x1dc77d of _0x8c576e.antiPatternIssues) {
          _0x8f3839.push("| " + _0x1dc77d.issue + " | " + (_0x1dc77d.fix || "N/A") + " | " + _0x1dc77d.certainty + " |");
        }
        _0x8f3839.push("");
      }
      if (_0x8c576e.codeValidationIssues && _0x8c576e.codeValidationIssues.length > 0) {
        _0x8f3839.push("### Code Validation Issues (" + _0x8c576e.codeValidationIssues.length + ")");
        _0x8f3839.push("");
        _0x8f3839.push("| Issue | Fix | Certainty |");
        _0x8f3839.push("|-------|-----|-----------|");
        for (const _0x47ca4e of _0x8c576e.codeValidationIssues) {
          _0x8f3839.push("| " + _0x47ca4e.issue + " | " + (_0x47ca4e.fix || "N/A") + " | " + _0x47ca4e.certainty + " |");
        }
        _0x8f3839.push("");
      }
      if (_0x2daeac.length === 0) {
        _0x8f3839.push("No issues found.");
        _0x8f3839.push("");
      }
      return _0x8f3839.join("\n");
    }
    function _0x42d87f(_0x45620f, _0x115f33 = {}) {
      const _0x1cd1d6 = [];
      _0x1cd1d6.push("# Prompt Analysis Summary");
      _0x1cd1d6.push("");
      _0x1cd1d6.push("**Analyzed**: " + _0x45620f.length + " prompts");
      _0x1cd1d6.push("**Date**: " + new Date().toISOString());
      _0x1cd1d6.push("");
      let _0x126d8 = 0;
      let _0xdc2057 = 0;
      let _0x348427 = 0;
      let _0x59cf85 = 0;
      for (const _0x1d32db of _0x45620f) {
        const _0x5a2bab = [...(_0x1d32db.clarityIssues || []), ...(_0x1d32db.structureIssues || []), ...(_0x1d32db.exampleIssues || []), ...(_0x1d32db.contextIssues || []), ...(_0x1d32db.outputIssues || []), ...(_0x1d32db.antiPatternIssues || []), ...(_0x1d32db.codeValidationIssues || [])];
        _0x126d8 += _0x12c45b(_0x5a2bab, "HIGH");
        _0xdc2057 += _0x12c45b(_0x5a2bab, "MEDIUM");
        _0x348427 += _0x12c45b(_0x5a2bab, "LOW");
        _0x59cf85 += _0x1d32db.tokenCount || 0;
      }
      _0x1cd1d6.push("## Overall");
      _0x1cd1d6.push("");
      _0x1cd1d6.push("**Total Tokens**: ~" + _0x59cf85);
      _0x1cd1d6.push("");
      _0x1cd1d6.push("| Certainty | Count |");
      _0x1cd1d6.push("|-----------|-------|");
      _0x1cd1d6.push("| HIGH | " + _0x126d8 + " |");
      _0x1cd1d6.push("| MEDIUM | " + _0xdc2057 + " |");
      if (_0x115f33.verbose) {
        _0x1cd1d6.push("| LOW | " + _0x348427 + " |");
      }
      _0x1cd1d6.push("");
      _0x1cd1d6.push("## By Prompt");
      _0x1cd1d6.push("");
      _0x1cd1d6.push("| Prompt | Type | Tokens | HIGH | MEDIUM | LOW | Total |");
      _0x1cd1d6.push("|--------|------|--------|------|--------|-----|-------|");
      for (const _0x3f7228 of _0x45620f) {
        const _0x3c996f = [...(_0x3f7228.clarityIssues || []), ...(_0x3f7228.structureIssues || []), ...(_0x3f7228.exampleIssues || []), ...(_0x3f7228.contextIssues || []), ...(_0x3f7228.outputIssues || []), ...(_0x3f7228.antiPatternIssues || []), ...(_0x3f7228.codeValidationIssues || [])];
        const _0x5426e3 = _0x12c45b(_0x3c996f, "HIGH");
        const _0x4770bb = _0x12c45b(_0x3c996f, "MEDIUM");
        const _0x51d23d = _0x12c45b(_0x3c996f, "LOW");
        _0x1cd1d6.push("| " + _0x3f7228.promptName + " | " + (_0x3f7228.promptType || "-") + " | " + _0x3f7228.tokenCount + " | " + _0x5426e3 + " | " + _0x4770bb + " | " + _0x51d23d + " | " + (_0x5426e3 + _0x4770bb + _0x51d23d) + " |");
      }
      _0x1cd1d6.push("");
      return _0x1cd1d6.join("\n");
    }
    function _0x134e04(_0x4c8204, _0x278a5a = {}) {
      const {
        verbose = false,
        showAutoFixable = false,
        targetPath = "."
      } = _0x278a5a;
      const _0x51a5b0 = [];
      _0x51a5b0.push("# Enhancement Analysis Report");
      _0x51a5b0.push("");
      _0x51a5b0.push("**Target**: " + targetPath);
      _0x51a5b0.push("**Analyzed**: " + new Date().toISOString());
      _0x51a5b0.push("**Enhancers Run**: " + (Object.keys(_0x4c8204?.byEnhancer || {}).join(", ") || "none"));
      _0x51a5b0.push("");
      const _0x439b2c = Array.isArray(_0x4c8204?.findings) ? _0x4c8204.findings : [];
      const _0x123acf = _0x4a82a6(_0x439b2c);
      const _0x4d9383 = _0x123acf.filter(_0x557ce0 => _0x557ce0.certainty === "HIGH" && _0x557ce0.autoFixable).length;
      _0x51a5b0.push("## Executive Summary");
      _0x51a5b0.push("");
      _0x51a5b0.push("| Enhancer | HIGH | MEDIUM | LOW | Auto-Fixable |");
      _0x51a5b0.push("|----------|------|--------|-----|--------------|");
      const _0x106115 = ["plugin", "agent", "claudemd", "docs", "prompt", "hooks", "skills"];
      let _0x2a2fec = 0;
      let _0x20aca1 = 0;
      let _0x465fc2 = 0;
      let _0x563bad = 0;
      for (const _0x49bce3 of _0x106115) {
        const _0xe33411 = _0x123acf.filter(_0x477a5a => _0x477a5a.source === _0x49bce3);
        const _0x3b856f = _0xe33411.filter(_0x220d7a => _0x220d7a.certainty === "HIGH").length;
        const _0x16437e = _0xe33411.filter(_0x5a688a => _0x5a688a.certainty === "MEDIUM").length;
        const _0x4aea34 = _0xe33411.filter(_0x5388c1 => _0x5388c1.certainty === "LOW").length;
        const _0x47fa2e = _0xe33411.filter(_0x6b06e5 => _0x6b06e5.certainty === "HIGH" && _0x6b06e5.autoFixable).length;
        if (_0x3b856f > 0 || _0x16437e > 0 || _0x4aea34 > 0) {
          _0x51a5b0.push("| " + _0x49bce3 + " | " + _0x3b856f + " | " + _0x16437e + " | " + _0x4aea34 + " | " + _0x47fa2e + " |");
          _0x2a2fec += _0x3b856f;
          _0x20aca1 += _0x16437e;
          _0x465fc2 += _0x4aea34;
          _0x563bad += _0x47fa2e;
        }
      }
      _0x51a5b0.push("| **Total** | **" + _0x2a2fec + "** | **" + _0x20aca1 + "** | **" + _0x465fc2 + "** | **" + _0x563bad + "** |");
      _0x51a5b0.push("");
      if (_0x278a5a.autoLearned && _0x278a5a.autoLearned.length > 0) {
        _0x51a5b0.push("## Auto-Learned Suppressions");
        _0x51a5b0.push("");
        _0x51a5b0.push("Learned " + _0x278a5a.autoLearned.length + " new false positives:");
        _0x51a5b0.push("");
        const _0x1d37fc = {};
        _0x278a5a.autoLearned.forEach(_0xc568aa => {
          if (!_0x1d37fc[_0xc568aa.patternId]) {
            _0x1d37fc[_0xc568aa.patternId] = [];
          }
          _0x1d37fc[_0xc568aa.patternId].push(_0xc568aa);
        });
        for (const [_0x3c50ba, _0x10b05c] of Object.entries(_0x1d37fc)) {
          const _0x1c8b34 = Math.max(..._0x10b05c.map(_0x4f5b10 => _0x4f5b10.confidence || 0));
          _0x51a5b0.push("- **" + _0x3c50ba + "**: " + _0x10b05c.length + " file(s) (confidence: " + (_0x1c8b34 * 100).toFixed(0) + "%)");
        }
        _0x51a5b0.push("");
      }
      if (_0x123acf.length === 0) {
        _0x51a5b0.push("## Status: Clean");
        _0x51a5b0.push("");
        _0x51a5b0.push("No issues found.");
        _0x51a5b0.push("");
        return _0x51a5b0.join("\n");
      }
      _0x51a5b0.push("---");
      _0x51a5b0.push("");
      const _0x4d848d = _0x123acf.filter(_0x5ddc0a => _0x5ddc0a.certainty === "HIGH");
      if (_0x4d848d.length > 0) {
        _0x51a5b0.push("## HIGH Certainty Issues (" + _0x4d848d.length + ")");
        _0x51a5b0.push("");
        _0x51a5b0.push("Issues that should be fixed. Auto-fixable issues marked with [AF].");
        _0x51a5b0.push("");
        const _0x53280e = _0x3efeb9(_0x4d848d);
        for (const [_0x4f3809, _0x2fd8da] of Object.entries(_0x53280e)) {
          _0x51a5b0.push("### " + _0x2e759f(_0x4f3809) + " Issues (" + _0x2fd8da.length + ")");
          _0x51a5b0.push("");
          _0x51a5b0.push("| File | Line | Issue | Fix | [AF] |");
          _0x51a5b0.push("|------|------|-------|-----|------|");
          for (const _0x32b508 of _0x2fd8da) {
            const _0xec268d = _0x32b508.autoFixable ? "Yes" : "No";
            const _0x4e51f4 = _0x32b508.line || "-";
            _0x51a5b0.push("| " + (_0x32b508.file || "-") + " | " + _0x4e51f4 + " | " + _0x32b508.issue + " | " + (_0x32b508.fix || "-") + " | " + _0xec268d + " |");
          }
          _0x51a5b0.push("");
        }
        _0x51a5b0.push("---");
        _0x51a5b0.push("");
      }
      const _0x182bca = _0x123acf.filter(_0x2a6f65 => _0x2a6f65.certainty === "MEDIUM");
      if (_0x182bca.length > 0) {
        _0x51a5b0.push("## MEDIUM Certainty Issues (" + _0x182bca.length + ")");
        _0x51a5b0.push("");
        _0x51a5b0.push("Issues that likely need attention. Verify context before fixing.");
        _0x51a5b0.push("");
        const _0xf73afe = _0x3efeb9(_0x182bca);
        for (const [_0x13865b, _0x6efac4] of Object.entries(_0xf73afe)) {
          _0x51a5b0.push("### " + _0x2e759f(_0x13865b) + " Issues (" + _0x6efac4.length + ")");
          _0x51a5b0.push("");
          _0x51a5b0.push("| File | Line | Issue | Fix |");
          _0x51a5b0.push("|------|------|-------|-----|");
          for (const _0x3a2187 of _0x6efac4) {
            const _0x38a9a6 = _0x3a2187.line || "-";
            _0x51a5b0.push("| " + (_0x3a2187.file || "-") + " | " + _0x38a9a6 + " | " + _0x3a2187.issue + " | " + (_0x3a2187.fix || "-") + " |");
          }
          _0x51a5b0.push("");
        }
        _0x51a5b0.push("---");
        _0x51a5b0.push("");
      }
      const _0xbb407 = _0x123acf.filter(_0xbdfd07 => _0xbdfd07.certainty === "LOW");
      if (verbose && _0xbb407.length > 0) {
        _0x51a5b0.push("## LOW Certainty Issues (" + _0xbb407.length + ")");
        _0x51a5b0.push("");
        _0x51a5b0.push("Advisory suggestions. Consider based on project needs.");
        _0x51a5b0.push("");
        const _0x139a06 = _0x3efeb9(_0xbb407);
        for (const [_0xf23757, _0xa9ce86] of Object.entries(_0x139a06)) {
          _0x51a5b0.push("### " + _0x2e759f(_0xf23757) + " Issues (" + _0xa9ce86.length + ")");
          _0x51a5b0.push("");
          _0x51a5b0.push("| File | Line | Issue | Fix |");
          _0x51a5b0.push("|------|------|-------|-----|");
          for (const _0x1ba336 of _0xa9ce86) {
            const _0x57ffc9 = _0x1ba336.line || "-";
            _0x51a5b0.push("| " + (_0x1ba336.file || "-") + " | " + _0x57ffc9 + " | " + _0x1ba336.issue + " | " + (_0x1ba336.fix || "-") + " |");
          }
          _0x51a5b0.push("");
        }
        _0x51a5b0.push("---");
        _0x51a5b0.push("");
      }
      if (showAutoFixable && _0x4d9383 > 0) {
        _0x51a5b0.push("## Auto-Fix Summary");
        _0x51a5b0.push("");
        _0x51a5b0.push("**" + _0x4d9383 + " issues can be automatically fixed** with `--apply` flag:");
        _0x51a5b0.push("");
        _0x51a5b0.push("| Enhancer | Issue Type | Count |");
        _0x51a5b0.push("|----------|------------|-------|");
        const _0x32029d = _0x123acf.filter(_0x11c8bd => _0x11c8bd.certainty === "HIGH" && _0x11c8bd.autoFixable);
        const _0x5edb69 = {};
        for (const _0x42e3b9 of _0x32029d) {
          const _0x4dda23 = _0x42e3b9.source + "|" + (_0x42e3b9.category || "general");
          if (!_0x5edb69[_0x4dda23]) {
            const _0x1a29da = {
              source: _0x42e3b9.source,
              category: _0x42e3b9.category || "general",
              count: 0
            };
            _0x5edb69[_0x4dda23] = _0x1a29da;
          }
          _0x5edb69[_0x4dda23].count++;
        }
        for (const _0x30c6e4 of Object.values(_0x5edb69)) {
          _0x51a5b0.push("| " + _0x30c6e4.source + " | " + _0x30c6e4.category + " | " + _0x30c6e4.count + " |");
        }
        _0x51a5b0.push("| **Total** | | **" + _0x4d9383 + "** |");
        _0x51a5b0.push("");
        _0x51a5b0.push("Run `/enhance --apply` to fix these automatically.");
        _0x51a5b0.push("");
      }
      return _0x51a5b0.join("\n");
    }
    function _0x4a82a6(_0x7862ae) {
      const _0x2aaff7 = new Map();
      for (const _0x57693b of _0x7862ae) {
        const _0x41182e = [_0x57693b.file || "", _0x57693b.line || 0, (_0x57693b.issue || "").toLowerCase().trim()].join("|");
        if (!_0x2aaff7.has(_0x41182e)) {
          const _0x4e061f = {
            ..._0x57693b
          };
          _0x4e061f.sources = [_0x57693b.source];
          _0x2aaff7.set(_0x41182e, _0x4e061f);
        } else {
          const _0x1b1221 = _0x2aaff7.get(_0x41182e);
          if (!_0x1b1221.sources.includes(_0x57693b.source)) {
            _0x1b1221.sources.push(_0x57693b.source);
          }
          if (_0x57693b.autoFixable && !_0x1b1221.autoFixable) {
            _0x1b1221.autoFixable = true;
          }
        }
      }
      return Array.from(_0x2aaff7.values());
    }
    function _0x3efeb9(_0x504e3d) {
      const _0x4e4769 = {};
      for (const _0x247008 of _0x504e3d) {
        const _0xd4cd79 = _0x247008.source || "unknown";
        if (!_0x4e4769[_0xd4cd79]) {
          _0x4e4769[_0xd4cd79] = [];
        }
        _0x4e4769[_0xd4cd79].push(_0x247008);
      }
      return _0x4e4769;
    }
    function _0x2e759f(_0x5768ef) {
      if (!_0x5768ef) {
        return "";
      }
      return _0x5768ef.charAt(0).toUpperCase() + _0x5768ef.slice(1);
    }
    const _0x1fe2be = {
      generateReport: _0x382b2b,
      generateDiff: _0x2942f5,
      generateSummaryReport: _0x52ef17,
      generateAgentReport: _0x42c35b,
      generateAgentSummaryReport: _0x3ba005,
      generateDocsReport: _0xa65d90,
      generateDocsSummaryReport: _0x8fc5a9,
      generateProjectMemoryReport: _0x3ff5b3,
      generateProjectMemorySummaryReport: _0x11cc6e,
      generatePromptReport: _0x24a063,
      generatePromptSummaryReport: _0x42d87f,
      generateOrchestratorReport: _0x134e04,
      deduplicateOrchestratorFindings: _0x4a82a6
    };
    _0x1a04e4.exports = _0x1fe2be;
  }
});
var fs = require("fs");
var path = require("path");
var {
  agentPatterns
} = require_agent_patterns();
function parseMarkdownFrontmatter(_0x642250) {
  if (!_0x642250 || typeof _0x642250 !== "string") {
    const _0x15cdaa = {
      frontmatter: null,
      body: _0x642250
    };
    return _0x15cdaa;
  }
  const _0xf30165 = _0x642250.trim();
  if (!_0xf30165.startsWith("---")) {
    const _0x58cf98 = {
      frontmatter: null,
      body: _0x642250
    };
    return _0x58cf98;
  }
  const _0x213e83 = _0xf30165.split("\n");
  let _0x438c21 = -1;
  for (let _0x155e0f = 1; _0x155e0f < _0x213e83.length; _0x155e0f++) {
    if (_0x213e83[_0x155e0f].trim() === "---") {
      _0x438c21 = _0x155e0f;
      break;
    }
  }
  if (_0x438c21 === -1) {
    const _0x3dde10 = {
      frontmatter: null,
      body: _0x642250
    };
    return _0x3dde10;
  }
  const _0x47efc7 = {};
  const _0x35796 = _0x213e83.slice(1, _0x438c21);
  for (const _0x35a993 of _0x35796) {
    const _0x262a50 = _0x35a993.indexOf(":");
    if (_0x262a50 > 0) {
      const _0x3cef12 = _0x35a993.substring(0, _0x262a50).trim();
      const _0x5512d5 = _0x35a993.substring(_0x262a50 + 1).trim();
      _0x47efc7[_0x3cef12] = _0x5512d5;
    }
  }
  const _0x297439 = _0x213e83.slice(_0x438c21 + 1).join("\n");
  const _0x4669c5 = {
    frontmatter: _0x47efc7,
    body: _0x297439
  };
  return _0x4669c5;
}
function analyzeAgent(_0x35f534, _0x47924d = {}) {
  const _0x1a3e9a = {
    agentName: path.basename(_0x35f534, ".md"),
    agentPath: _0x35f534,
    frontmatter: null,
    structureIssues: [],
    toolIssues: [],
    xmlIssues: [],
    cotIssues: [],
    exampleIssues: [],
    antiPatternIssues: [],
    crossPlatformIssues: []
  };
  if (!fs.existsSync(_0x35f534)) {
    const _0xf1dbbf = {
      issue: "File not found",
      file: _0x35f534,
      certainty: "HIGH",
      patternId: "file_not_found"
    };
    _0x1a3e9a.structureIssues.push(_0xf1dbbf);
    return _0x1a3e9a;
  }
  let _0x3e4760;
  try {
    _0x3e4760 = fs.readFileSync(_0x35f534, "utf8");
  } catch (_0x3dd153) {
    const _0xadd99d = {
      issue: "Failed to read file: " + _0x3dd153.message,
      file: _0x35f534,
      certainty: "HIGH",
      patternId: "read_error"
    };
    _0x1a3e9a.structureIssues.push(_0xadd99d);
    return _0x1a3e9a;
  }
  const {
    frontmatter: _0x27c224
  } = parseMarkdownFrontmatter(_0x3e4760);
  _0x1a3e9a.frontmatter = _0x27c224;
  const _0x38f6e9 = agentPatterns.missing_frontmatter;
  const _0x5eaa56 = _0x38f6e9.check(_0x3e4760);
  if (_0x5eaa56) {
    const _0x27d573 = {
      ..._0x5eaa56
    };
    _0x27d573.file = _0x35f534;
    _0x27d573.certainty = _0x38f6e9.certainty;
    _0x27d573.patternId = _0x38f6e9.id;
    _0x1a3e9a.structureIssues.push(_0x27d573);
  }
  if (_0x27c224) {
    const _0x436e3d = agentPatterns.missing_name;
    const _0x58c9b9 = _0x436e3d.check(_0x27c224);
    if (_0x58c9b9) {
      const _0x57e746 = {
        ..._0x58c9b9
      };
      _0x57e746.file = _0x35f534;
      _0x57e746.certainty = _0x436e3d.certainty;
      _0x57e746.patternId = _0x436e3d.id;
      _0x1a3e9a.structureIssues.push(_0x57e746);
    }
    const _0x3fadab = agentPatterns.missing_description;
    const _0x43c382 = _0x3fadab.check(_0x27c224);
    if (_0x43c382) {
      const _0x3338ca = {
        ..._0x43c382
      };
      _0x3338ca.file = _0x35f534;
      _0x3338ca.certainty = _0x3fadab.certainty;
      _0x3338ca.patternId = _0x3fadab.id;
      _0x1a3e9a.structureIssues.push(_0x3338ca);
    }
    const _0x54ab51 = agentPatterns.unrestricted_tools;
    const _0xc59ad0 = _0x54ab51.check(_0x27c224);
    if (_0xc59ad0) {
      const _0xdc2513 = {
        ..._0xc59ad0
      };
      _0xdc2513.file = _0x35f534;
      _0xdc2513.certainty = _0x54ab51.certainty;
      _0xdc2513.patternId = _0x54ab51.id;
      _0x1a3e9a.toolIssues.push(_0xdc2513);
    }
    const _0x3ca3e2 = agentPatterns.unrestricted_bash;
    const _0x586f6c = _0x3ca3e2.check(_0x27c224);
    if (_0x586f6c) {
      const _0x4bf0c7 = {
        ..._0x586f6c
      };
      _0x4bf0c7.file = _0x35f534;
      _0x4bf0c7.filePath = _0x35f534;
      _0x4bf0c7.certainty = _0x3ca3e2.certainty;
      _0x4bf0c7.patternId = _0x3ca3e2.id;
      _0x1a3e9a.toolIssues.push(_0x4bf0c7);
    }
  }
  const _0x193455 = agentPatterns.missing_role;
  const _0x7e972a = _0x193455.check(_0x3e4760);
  if (_0x7e972a) {
    const _0x4c34f8 = {
      ..._0x7e972a
    };
    _0x4c34f8.file = _0x35f534;
    _0x4c34f8.filePath = _0x35f534;
    _0x4c34f8.certainty = _0x193455.certainty;
    _0x4c34f8.patternId = _0x193455.id;
    _0x1a3e9a.structureIssues.push(_0x4c34f8);
  }
  const _0x39c8ef = agentPatterns.missing_output_format;
  const _0x500362 = _0x39c8ef.check(_0x3e4760);
  if (_0x500362) {
    const _0x28baf2 = {
      ..._0x500362
    };
    _0x28baf2.file = _0x35f534;
    _0x28baf2.certainty = _0x39c8ef.certainty;
    _0x28baf2.patternId = _0x39c8ef.id;
    _0x1a3e9a.structureIssues.push(_0x28baf2);
  }
  const _0x5a543f = agentPatterns.missing_constraints;
  const _0x57dd77 = _0x5a543f.check(_0x3e4760);
  if (_0x57dd77) {
    const _0x527a19 = {
      ..._0x57dd77
    };
    _0x527a19.file = _0x35f534;
    _0x527a19.certainty = _0x5a543f.certainty;
    _0x527a19.patternId = _0x5a543f.id;
    _0x1a3e9a.structureIssues.push(_0x527a19);
  }
  const _0x2c7d51 = agentPatterns.missing_xml_structure;
  const _0x442d5d = _0x2c7d51.check(_0x3e4760);
  if (_0x442d5d && (_0x47924d.verbose || _0x2c7d51.certainty !== "LOW")) {
    const _0x3abbef = {
      ..._0x442d5d
    };
    _0x3abbef.file = _0x35f534;
    _0x3abbef.certainty = _0x2c7d51.certainty;
    _0x3abbef.patternId = _0x2c7d51.id;
    _0x1a3e9a.xmlIssues.push(_0x3abbef);
  }
  const _0x2a1849 = agentPatterns.unnecessary_cot;
  const _0xb1652c = _0x2a1849.check(_0x3e4760);
  if (_0xb1652c && (_0x47924d.verbose || _0x2a1849.certainty !== "LOW")) {
    const _0xbe4336 = {
      ..._0xb1652c
    };
    _0xbe4336.file = _0x35f534;
    _0xbe4336.certainty = _0x2a1849.certainty;
    _0xbe4336.patternId = _0x2a1849.id;
    _0x1a3e9a.cotIssues.push(_0xbe4336);
  }
  const _0x5cc31b = agentPatterns.missing_cot;
  const _0x22a0cd = _0x5cc31b.check(_0x3e4760);
  if (_0x22a0cd && (_0x47924d.verbose || _0x5cc31b.certainty !== "LOW")) {
    const _0x2d07d8 = {
      ..._0x22a0cd
    };
    _0x2d07d8.file = _0x35f534;
    _0x2d07d8.certainty = _0x5cc31b.certainty;
    _0x2d07d8.patternId = _0x5cc31b.id;
    _0x1a3e9a.cotIssues.push(_0x2d07d8);
  }
  const _0x3aa001 = agentPatterns.example_count_suboptimal;
  const _0x19a142 = _0x3aa001.check(_0x3e4760);
  if (_0x19a142 && _0x47924d.verbose) {
    const _0x18809a = {
      ..._0x19a142
    };
    _0x18809a.file = _0x35f534;
    _0x18809a.certainty = _0x3aa001.certainty;
    _0x18809a.patternId = _0x3aa001.id;
    _0x1a3e9a.exampleIssues.push(_0x18809a);
  }
  const _0x3089e4 = agentPatterns.vague_instructions;
  const _0x388717 = _0x3089e4.check(_0x3e4760);
  if (_0x388717 && (_0x47924d.verbose || _0x3089e4.certainty !== "LOW")) {
    const _0x1d2cc9 = {
      ..._0x388717
    };
    _0x1d2cc9.file = _0x35f534;
    _0x1d2cc9.certainty = _0x3089e4.certainty;
    _0x1d2cc9.patternId = _0x3089e4.id;
    _0x1a3e9a.antiPatternIssues.push(_0x1d2cc9);
  }
  const _0x168208 = agentPatterns.prompt_bloat;
  const _0x3b777c = _0x168208.check(_0x3e4760);
  if (_0x3b777c && _0x47924d.verbose) {
    const _0x1604b4 = {
      ..._0x3b777c
    };
    _0x1604b4.file = _0x35f534;
    _0x1604b4.certainty = _0x168208.certainty;
    _0x1604b4.patternId = _0x168208.id;
    _0x1a3e9a.antiPatternIssues.push(_0x1604b4);
  }
  const _0xd521b3 = ["hardcoded_claude_dir", "claude_md_reference", "no_xml_for_data"];
  for (const _0x4ffd2f of _0xd521b3) {
    const _0x15b077 = agentPatterns[_0x4ffd2f];
    if (!_0x15b077) {
      continue;
    }
    const _0xa2e62d = _0x15b077.check(_0x3e4760);
    if (_0xa2e62d && (_0x47924d.verbose || _0x15b077.certainty !== "LOW")) {
      const _0x43ccd1 = {
        ..._0xa2e62d
      };
      _0x43ccd1.file = _0x35f534;
      _0x43ccd1.certainty = _0x15b077.certainty;
      _0x43ccd1.patternId = _0x15b077.id;
      _0x1a3e9a.crossPlatformIssues.push(_0x43ccd1);
    }
  }
  return _0x1a3e9a;
}
function analyzeAllAgents(_0x391266, _0x48bed6 = {}) {
  const _0x1fc33c = [];
  if (!fs.existsSync(_0x391266)) {
    return _0x1fc33c;
  }
  const _0x289a46 = fs.readdirSync(_0x391266).filter(_0x29dd4a => _0x29dd4a.endsWith(".md") && _0x29dd4a !== "README.md");
  for (const _0x4936b8 of _0x289a46) {
    const _0x4d9185 = path.join(_0x391266, _0x4936b8);
    const _0xadf56e = analyzeAgent(_0x4d9185, _0x48bed6);
    _0x1fc33c.push(_0xadf56e);
  }
  return _0x1fc33c;
}
function analyze(_0xb293a2 = {}) {
  const {
    agent: _0x531305,
    agentsDir = "plugins/enhance/agents",
    verbose = false
  } = _0xb293a2;
  if (_0x531305) {
    const _0x3cd83e = _0x531305.endsWith(".md") ? path.join(agentsDir, _0x531305) : path.join(agentsDir, _0x531305 + ".md");
    const _0x334e99 = {
      verbose: verbose
    };
    return analyzeAgent(_0x3cd83e, _0x334e99);
  } else {
    const _0x10eb79 = {
      verbose: verbose
    };
    return analyzeAllAgents(agentsDir, _0x10eb79);
  }
}
function applyFixes(_0x89a7c3, _0x25bd3f = {}) {
  const _0x562407 = require_fixer();
  let _0x1ff107 = [];
  if (Array.isArray(_0x89a7c3)) {
    for (const _0x17375d of _0x89a7c3) {
      _0x1ff107.push(...(_0x17375d.structureIssues || []));
      _0x1ff107.push(...(_0x17375d.toolIssues || []));
      _0x1ff107.push(...(_0x17375d.xmlIssues || []));
      _0x1ff107.push(...(_0x17375d.cotIssues || []));
      _0x1ff107.push(...(_0x17375d.exampleIssues || []));
      _0x1ff107.push(...(_0x17375d.antiPatternIssues || []));
      _0x1ff107.push(...(_0x17375d.crossPlatformIssues || []));
    }
  } else {
    _0x1ff107.push(...(_0x89a7c3.structureIssues || []));
    _0x1ff107.push(...(_0x89a7c3.toolIssues || []));
    _0x1ff107.push(...(_0x89a7c3.xmlIssues || []));
    _0x1ff107.push(...(_0x89a7c3.cotIssues || []));
    _0x1ff107.push(...(_0x89a7c3.exampleIssues || []));
    _0x1ff107.push(...(_0x89a7c3.antiPatternIssues || []));
    _0x1ff107.push(...(_0x89a7c3.crossPlatformIssues || []));
  }
  return _0x562407.applyFixes(_0x1ff107, _0x25bd3f);
}
function generateReport(_0x174c3f, _0x5105b2 = {}) {
  const _0x59ee24 = require_reporter();
  if (Array.isArray(_0x174c3f)) {
    return _0x59ee24.generateAgentSummaryReport(_0x174c3f, _0x5105b2);
  } else {
    return _0x59ee24.generateAgentReport(_0x174c3f, _0x5105b2);
  }
}
const _0x40019e = {
  parseMarkdownFrontmatter: parseMarkdownFrontmatter,
  analyzeAgent: analyzeAgent,
  analyzeAllAgents: analyzeAllAgents,
  analyze: analyze,
  applyFixes: applyFixes,
  generateReport: generateReport
};
module.exports = _0x40019e;