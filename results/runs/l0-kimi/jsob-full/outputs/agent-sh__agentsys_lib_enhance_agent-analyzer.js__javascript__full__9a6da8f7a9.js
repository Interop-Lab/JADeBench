/.test(content);
          const hasLists = /^[-*]\s+/m.test(content);
          const hasXML = /<\w+>[\s\S]{0,50000}?<\/\w+>/.test(content);
          const sections = (content.match(/^##\s+/gm) || []).length;
          if ((hasCodeBlocks || hasLists) && sections < 3 && !hasXML) {
            return {
              issue: 'no_xml_for_data',
              fix: 'Use XML tags for structured data instead of markdown or bullet lists'
            };
          }
          return null;
        }
      },
      vague_instructions: {
        id: 'vague_instructions',
        category: 'content',
        certainty: 'low',
        autoFix: false,
        description: 'The agent instructions contain vague or generic terms',
        check: (content) => {
          if (!content || typeof content !== 'string') return null;
          const vagueTerms = [
            'etc', 'something', 'whatever', 'just', 'simply', 'basically',
            'kind of', 'sort of', 'more or less', 'roughly'
          ];
          const foundTerms = [];
          for (const term of vagueTerms) {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            if (regex.test(content)) {
              foundTerms.push(term);
            }
          }
          if (foundTerms.length > 0) {
            return {
              issue: 'vague_instructions',
              fix: `Replace vague terms (${foundTerms.join(', ')}) with specific, actionable instructions`
            };
          }
          return null;
        }
      },
      prompt_bloat: {
        id: 'prompt_bloat',
        category: 'optimization',
        certainty: 'medium',
        autoFix: false,
        description: 'The prompt may be excessively long for the task',
        check: (content) => {
          if (!content || typeof content !== 'string') return null;
          const wordCount = content.split(/\s+/).length;
          const maxTokens = 2000;
          if (wordCount > maxTokens / 0.75) {
            return {
              issue: `prompt_bloat_${wordCount}`,
              fix: `Consider condensing prompt (current: ~${wordCount} words, recommended: <${Math.floor(maxTokens/0.75)} words)`
            };
          }
          return null;
        }
      },
      claude_md_reference: {
        id: 'claude_md_reference',
        category: 'maintenance',
        certainty: 'medium',
        autoFix: false,
        description: 'The agent references CLAUDE.md but not AGENTS.md',
        check: (content) => {
          if (!content || typeof content !== 'string') return null;
          const hasClaudeMD = /CLAUDE\.md/i.test(content);
          const hasAgentsMD = /AGENTS\.md/i.test(content);
          if (hasClaudeMD && !hasAgentsMD) {
            return {
              issue: 'claude_md_reference',
              fix: 'Consider referencing AGENTS.md instead of or in addition to CLAUDE.md for multi-agent systems'
            };
          }
          return null;
        }
      }
    };

    const getPattern = (name) => {
      return agentPatterns[name];
    };

    const getAllPatterns = () => {
      return { ...agentPatterns };
    };

    const filterPatterns = (category) => {
      const result = {};
      for (const [key, pattern] of Object.entries(agentPatterns)) {
        if (pattern.category === category) {
          result[key] = pattern;
        }
      }
      return result;
    };

    const getAutoFixablePatterns = () => {
      const result = {};
      for (const [key, pattern] of Object.entries(agentPatterns)) {
        if (pattern.autoFix) {
          result[key] = pattern;
        }
      }
      return result;
    };

    module.exports = {
      agentPatterns,
      getPattern,
      getAllPatterns,
      filterPatterns,
      getAutoFixablePatterns
    };
  }
});

var require_fixer = __commonJS({
  '../work/agent-sh__agentsys/lib/enhance/fixer.js'(_0x16556f, _0x200493) {
    const _0x2e5d52 = {
      _0x1e58d8: 0x1057, _0x172141: 'zqYE', _0x2bd08d: 'n2%h', _0x12feec: 0x187e,
      _0x2bdc6e: 0x101a, _0x39af02: 'Kc*k', _0x9cffb8: 0xf4e, _0x45e316: 'lHN8',
      _0x42b225: 0x750, _0x168923: 0x15cb, _0x271f70: '[t6M', _0x457e95: 0x81,
      _0x4dc86a: 0x814, _0x519529: 'b)ou', _0x25614a: '!2B4', _0x574cfc: 'R7bd',
      _0x1e87fe: 'umwa', _0x5b389c: 0x148d, _0x17d2a3: 0x1071, _0x1711b9: 'PBs#',
      _0x10a13d: 0xadc, _0xe8ad91: 'Fp2K', _0x46a4bb: 'Qc%h', _0x3559f1: 0x1467,
      _0x105c83: 0x12f1, _0x36c18d: 'i[7E', _0x33b39e: 0x110f, _0x489a74: 'GkcA',
      _0x4b23b7: 0x59e, _0x3e2b9a: 'b)ou', _0x3f3b8: 0x1c17, _0x2b299f: 0xecd,
      _0x4198f8: 'ykeR', _0x1c7d19: 0x543, _0x38c67c: 0x1947, _0x4d3e14: 0x861,
      _0x117c52: 'R7bd', _0x2533cd: ')Yu1', _0x12affa: 0x47c, _0x52973b: 0xe78,
      _0x39f1bf: '!2B4', _0x19e78f: 0x9c6, _0xc36219: 'jxUX', _0x4c9744: 0xd5d,
      _0x3ab373: 'nSMW', _0x108c44: 'uyok', _0x3f5f01: 0xa77, _0x2d8dc7: 0x771,
      _0x58c0d9: 'UmP6', _0x251d6c: 0x17ad, _0x3cf9a1: 'Kc*k', _0x387922: 0x11e4,
      _0xee7e08: 0x81d, _0x33709d: 'n2%h', _0x4264d6: 0x16f1, _0x39d63f: 0x1976,
      _0x112e50: 0x1166, _0x2bf91f: 0x5f8, _0x28f9b2: 'b)ou', _0x898dc7: 0x146a,
      _0x3267ed: 0x1620, _0xa75bd8: 0xabf, _0x35dc86: 'JSlm', _0x21140f: 0xa6c,
      _0x26c507: '@3p^', _0x58cdc2: '1^Py', _0x1c1d5f: 'ykeR', _0x4553f9: 0x3ba,
      _0x124fa5: 0x10eb, _0x311742: 'KIY]', _0x41bdd4: ')Yu1', _0x3c986a: 0x11c5,
      _0x1717c0: 0x434, _0x68e577: '7I#C', _0x1fc2ee: 0xbea, _0x1d5142: 0x1624,
      _0x4ff898: '1OVr', _0xebe18d: 0x1584, _0x1b5003: 0x1012, _0x3f43c1: 'bxBe',
      _0x1e9c61: 'Rsx4', _0x1d70dd: 'PBs#', _0x4ed601: 'bxBe', _0x47af94: 0xdd5,
      _0x161da6: 0xc0a, _0x1b18f7: 0x9ef, _0x532325: 0x1b59, _0x8b8ad6: 'Kc*k',
      _0x4edaef: 0x1bd3, _0x4f52d8: 'Fp2K', _0x578392: 0x173c, _0x33e294: 'lHN8',
      _0x5ab464: 0x60f, _0x115f45: ')PW)', _0x5d304e: 0xab1, _0x1a9f68: 0x49f,
      _0xfbfbc0: 0x7d2, _0x3fcca8: 0x1be5, _0x4b4ffa: 0xd9f, _0x20a6d4: 'Qc%h',
      _0x34fe63: 0x1246, _0xadc257: 0xc2e, _0x4be6fd: 0x14d8, _0x44b067: 0x1bad,
      _0x524a42: 0xc34, _0x2ec57a: 0x1365, _0x47c3ec: '1rk7', _0x5f3f9a: 0x1774,
      _0x50dbaa: 0x166f, _0x380fca: 0x10f5, _0x2266e4: 'umwa', _0x112499: 'oojU',
      _0x1c8302: 0xf9e, _0x506ecb: 0xa23, _0x4edeba: 0xdc9, _0x72d9a2: ']wV8',
      _0x99afe9: 0x1ad5, _0x2c6c95: 0xa7f, _0x5ba0e0: 0xc39, _0x16e68b: 'Rsx4',
      _0x1494dd: 0x11b4, _0x37065f: '&RpX', _0x4d823d: 'PBs#', _0x36c8ef: '8dr@',
      _0x135c09: 0x1394, _0x22652a: 'c@sg', _0x22f438: 0x11de, _0x1f1dde: 0x17e4,
      _0x31e605: 'nSMW', _0x4b6951: 0x19cc, _0xe7770b: '1OVr', _0x36bb39: 0xf2f,
      _0x44da35: 0xe9f, _0x4e4a20: 0x14be, _0x5a9a08: ')PW)', _0x4eb5e9: 'oC%O',
      _0xe4d0fe: 'n2%h', _0x54951b: 0x1423, _0x120ac8: '0PUb', _0x235a6c: 0x15b5,
      _0x36d516: 0x90a, _0x1794e9: 'KIY]', _0x47e9fe: 0x6bb, _0x59d33a: 0x13eb,
      _0x1e57bf: 0x10f2, _0x53213f: 0x13c3, _0x11555f: 'oAI!', _0x18a2f6: 0x1939,
      _0x34f150: 'Rsx4', _0xb15459: 0x15b6, _0x1a3902: 'GLnX', _0x12bdf0: 0xd5f,
      _0x28844e: 0x194b, _0x2af792: 0x1496, _0x594ea9: 'n2Co', _0x57f894: 0x117a,
      _0x542d69: 0x613, _0xbd2f31: ']wV8', _0x517304: 0x615, _0x2e59bc: 0x1559,
      _0x320d0d: 0xd47, _0x141c2d: 0x1186, _0x5d81f8: 'i[7E', _0x7c61ad: 0x116c,
      _0x388ed4: '1rk7', _0x4913d6: 0x74e, _0x44ae8b: 0x19f4, _0x49efd3: 'o8%o',
      _0x3b3e23: 0x1663, _0x4e168b: 0x854, _0x2031a5: 0x92f, _0x12f2cc: 0xe75,
      _0x40022c: 0x716, _0x39ded9: 0x1567, _0x1e7d23: 'Fp2K', _0x8f37c7: 0x181b,
      _0x154e4d: 0x1023, _0x367713: 'R7bd', _0x532473: 0x1133, _0x348f30: '^KJQ',
      _0x401f7b: 0x1a20, _0xc84224: 0xa9d, _0x2886fd: 0xd02, _0x576cee: 0x1447,
      _0x4e7ed1: 0x9b4, _0x4288b5: '!2B4', _0x5a1b99: 0x877, _0xfa78c5: 0xc72,
      _0x2bfa4e: '1OVr', _0x32b451: 0x7cb, _0x5d0b43: 0x5bd, _0x1a2992: 0x6f0,
      _0x408bee: 'lHN8', _0x28e791: 0x55a, _0x4140d1: 0x118d, _0x17c3c1: 0x1064,
      _0xbc4f62: 'uUGo', _0x4ed320: 0x1683, _0x21d9c: 0xc33, _0x894252: '[t6M',
      _0xb5f0e3: 0x1a4c, _0x4ffa5c: 0x1b33, _0x4ccca3: 0x18d4, _0x21c8a8: 0x137c,
      _0x1e38c4: 'JSlm', _0x256afc: 0xed5, _0x4cb7d0: 'UmP6', _0xa8c329: 0x150e,
      _0x4f95e0: 0x43d, _0x5a4649: 'R7bd', _0x1b8a63: 0x1857, _0x2ed824: 0x14f8,
      _0x25fd91: '0PUb', _0x66dd8c: 0x4cb, _0x17161e: 0xd4c, _0x586e28: 0x9fd,
      _0xcd6b16: '@3p^', _0x288843: 0x985, _0x314ef7: 0x16b4, _0x52f9b1: 0x1597,
      _0x244c9e: 'UmP6', _0x4113b6: 0x1359, _0x22853e: '^KJQ', _0x129a75: 0xc10,
      _0x5cb7ac: 0xba6, _0x38ac00: 'Pn1$', _0x40933e: 0xb13, _0x2fe101: 0x10f0,
      _0x4c21ac: 0x8e7, _0x5241a3: 0x984, _0x30a5d3: 0x1160, _0x5aadc2: '[K6N',
      _0x561f79: 'o8%o', _0x1e3065: 0x1560, _0x17338f: 'zqYE', _0x2f06e4: 'Pn1$',
      _0x1e9460: 'uyok', _0x4540bf: 0x552, _0x2988b4: 'RB8U', _0x1c21c1: 0xc1b,
      _0x3c5b8c: 0x13e1, _0x47f292: 0x940, _0x2af0c1: ')PW)', _0x495dc8: 'lHN8',
      _0x28acac: 0x1536, _0x2fef98: '&RpX', _0xeeaea0: 0xc1b, _0x20e0e8: 'Fp2K',
      _0x429ad7: 0x1621, _0x145640: 'umwa', _0x16941d: '0PUb', _0x40670f: 0xdc7,
      _0x3a6613: 0xe00, _0x2ebabc: 0x1586, _0x27afde: '@3p^', _0x52fcb6: '1^Py',
      _0x2c1da6: 0x15dd, _0x584843: 0x15a8, _0x12f559: '8dr@', _0x163e1a: 0x1b04,
      _0x5ebec3: 0x1556, _0x5cb9b7: 0x17d6, _0x3b6514: 'uyok', _0x33393f: 0x735,
      _0x28a4bd: 0x1aaf, _0x10e022: 0x14ea, _0xfb1cca: 0xab0, _0x107096: 'nSMW',
      _0x351e26: 0x15cf, _0xc5a5a0: '[K6N', _0x460b54: 0xbaa, _0x116c27: 0x1197,
      _0x2e3c2e: 0x1548, _0x4edc1d: 'ykeR', _0x21aaef: 0x18c2, _0x2be860: 'Fp2K',
      _0x398508: 0x632, _0x39b411: 0x19b8, _0x4164bd: 'b)ou', _0x36edf1: 0x517,
      _0x5f2cb4: 'b)ou', _0x53f25b: 0x1928, _0x4a5455: 0x440, _0x433968: 0x1851,
      _0x36e202: 0x469, _0x50c4cb: 0x1bd6, _0x595663: 0xd83, _0x3b2994: '&RpX',
      _0x2013ba: 'n2%h', _0x4b5150: 0x580, _0x376c86: 0xd6d
    };

    const _0x300044 = {
      'jPHvG': function(a, b) { return a === b; },
      'HDsRF': 'RB8U',
      'XjrCq': 'GLnX',
      'UFcuU': function(a, b) { return a !== b; },
      'gktyc': 'n2%h',
      'FtXIS': 'ykeR',
      'reCYT': 'ki' + 'Y]' + 'c' + 'l' + 'x' + 'UX' + '8d' + 'r@',
      'PtkZZ': 'z' + 'q' + 'YE' + 'c' + '@' + 's' + 'g' + 'P' + 'c' + 'B' + 'o' + '8' + '%' + 'o' + '1' + '^' + 'P' + 'y',
      'DVyvh': 'uyok',
      'lqLlg': 'o' + '8' + '%' + 'o',
      'morLj': function(a, b) { return a === b; },
      'iTKTa': 'n2Co',
      'oldIb': function(a, b) { return a && b; },
      'uqctQ': 'o' + 'A' + 'I' + '!' + 'F' + 'p' + '2' + 'K',
      'cYCXR': 'u' + 'y' + 'o' + 'k' + 'Q' + 'c' + '%' + 'h' + '0' + 'P' + 'U' + 'b',
      'HCbP' + 'Q': 'R' + '7' + 'b' + 'd',
      'REIEO': 'r' + 'v' + 'o' + 'O' + 'A' + '!' + '2' + 'B' + '4' + 'n' + '2' + '%' + 'h',
      'yrbii': 'z' + 'q' + 'Y' + 'E' + 'u' + 'y' + 'o' + 'k',
      'knXrx': 'K' + 'I' + 'Y' + ']' + '[' + 'K' + '6' + 'N' + 'c' + '@' + 's' + 'g' + 'P' + 'c' + 'B' + 'b' + ')' + 'o' + 'u' + ']' + 'w' + 'V' + '8' + '^' + 'K' + 'J' + 'Q',
      'sTuQd': '1' + '^' + 'P' + 'y',
      'PhJrI': function(a, b, c) { return a(b, c); },
      'Soorl': function(a, b) { return a + b; },
      'DQCVb': function(a, b) { return a !== b; },
      'llSJb': 'n2Co',
      'lHnGm': '1^' + 'P' + 'y' + 'n' + 'S' + 'M' + 'W' + 'K' + 'I' + 'Y' + ']',
      'eYsGn': '1' + 'O' + 'V' + 'r' + 'R' + 's' + 'x' + '4' + 'j' + 'X' + 'U' + 'x',
      'DxgkU': '7' + 'I' + '#' + 'C' + '!' + '2' + 'B' + '4' + 'n' + '2' + '%' + 'h',
      'wwcgU': function(a, b) { return a !== b; },
      'iTKTa': 'o' + '8' + '%' + 'o',
      'YqWsi': 'J' + 'S' + 'l' + 'm',
      'VbErt': 'K' + 'c' + '*' + 'k',
      'PviFM': 'n' + '2' + 'C' + 'o' + ')' + 'Y' + 'u' + '1' + 'R' + 'B' + '8' + 'U',
      'kIrVP': 'i' + '[' + '7' + 'E' + ']' + 'w' + 'V' + '8',
      'IBNqQ': '1' + '^' + 'P' + 'y' + 'R' + '7' + 'b' + 'd',
      'qdlpW': '!' + '2' + 'B' + '4',
      'ebTRR': 'b' + 'o' + 'R' + 'K',
      'QAHwg': function(a, b) { return a !== b; },
      'ePfcq': 'F' + 'p' + '2' + 'K',
      'tDDUh': 'j' + 'x' + 'U' + 'X',
      'YScFM': 'y' + 'k' + 'e' + 'R',
      'eqTUW': 'K' + 'I' + 'Y' + ']' + '[' + 'K' + '6' + 'N',
      'moPVq': 'n' + 'S' + 'M' + 'W',
      'HfeoQ': 'R' + '7' + 'b' + 'd',
      'JGGVo': 'R' + 's' + 'x' + '4',
      'JUOAs': 'u' + 'G' + 'o',
      'jvmmp': 'u' + 'y' + 'o' + 'k',
      'ZJWDp': ')' + 'P' + 'W' + ')',
      'nxIzx': ')' + 'Y' + 'u' + '1'
    };

    /**
     * Plugin Analysis Fixer
     * @author Avi Fenesh
     * @license MIT
     */
    var fs = require('fs');
    var path = require('path');
    var { writeFileAtomic } = require_atomic_write();

    function generateTempPath(filepath) {
      const dir = path.dirname(filepath);
      const name = path.basename(filepath);
      const timestamp = new Date().getTime();
      return path.join(dir, '.' + name + '.' + timestamp + '.tmp');
    }

    function writeFileAtomic(filepath, content, options = {}) {
      const { encoding = 'utf8', mode = 0o644 } = options;
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tempPath = generateTempPath(filepath);
      try {
        fs.writeFileSync(tempPath, content, { encoding, mode });
        fs.renameSync(tempPath, filepath);
        return true;
      } catch (err) {
        try {
          fs.unlinkSync(tempPath);
        } catch {}
        throw err;
      }
    }

    function writeJSONAtomic(filepath, data, options = {}) {
      const indent = options.indent || 2;
      const json = JSON.stringify(data, null, indent);
      return writeFileAtomic(filepath, json, options);
    }

    function parseMarkdownFrontmatter(content) {
      if (!content || typeof content !== 'string') {
        return { frontmatter: null, body: content };
      }
      if (!content.trim().startsWith('---')) {
        return { frontmatter: null, body: content };
      }
      const lines = content.split('\n');
      let frontEnd = -1;
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
          frontEnd = i;
          break;
        }
      }
      if (frontEnd === -1) {
        return { frontmatter: null, body: content };
      }
      const frontLines = lines.slice(1, frontEnd);
      const bodyLines = lines.slice(frontEnd + 1);
      const frontmatter = {};
      for (const line of frontLines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          frontmatter[key] = value;
        }
      }
      return {
        frontmatter,
        body: bodyLines.join('\n').trim()
      };
    }

    function analyzeAgent(filepath, options = {}) {
      const { dryRun = false, backup = true } = options;
      const result = {
        agentName: path.basename(filepath, '.md'),
        agentPath: filepath,
        frontmatter: null,
        structureIssues: [],
        toolIssues: [],
        xmlIssues: [],
        cotIssues: [],
        exampleIssues: [],
        antiPatternIssues: [],
        crossPlatformIssues: []
      };
      if (!fs.existsSync(filepath)) {
        result.structureIssues.push({
          issue: 'file_not_found',
          file: filepath,
          severity: 'critical'
        });
        return result;
      }
      let content;
      try {
        content = fs.readFileSync(filepath, 'utf8');
      } catch (err) {
        result.structureIssues.push({
          issue: 'read_error',
          error: err.message,
          severity: 'critical'
        });
        return result;
      }
      const { frontmatter, body } = parseMarkdownFrontmatter(content);
      result.frontmatter = frontmatter;
      const structureCheck = agentPatterns.missing_frontmatter.check(content);
      if (structureCheck) {
        result.structureIssues.push({
          ...structureCheck,
          willApply: dryRun ? false : true,
          fixApplied: !dryRun
        });
        if (!dryRun) {
          // Apply fix logic here
        }
      }
      if (frontmatter) {
        const nameCheck = agentPatterns.missing_name.check(JSON.stringify(frontmatter));
        if (nameCheck) {
          result.structureIssues.push({
            ...nameCheck,
            willApply: false,
            reason: 'Auto-fix not available for missing name'
          });
        }
        const descCheck = agentPatterns.missing_description.check(JSON.stringify(frontmatter));
        if (descCheck) {
          result.structureIssues.push({
            ...descCheck,
            willApply: false,
            reason: 'Auto-fix not available for missing description'
          });
        }
      }
      const toolCheck = agentPatterns.unrestricted_bash.check(body);
      if (toolCheck) {
        result.toolIssues.push({
          ...toolCheck,
          willApply: dryRun ? false : true,
          fixApplied: !dryRun
        });
      }
      const formatCheck = agentPatterns.missing_output_format.check(body);
      if (formatCheck) {
        result.structureIssues.push({
          ...formatCheck,
          willApply: false,
          reason: 'Auto-fix not available for missing output format'
        });
      }
      const xmlCheck = agentPatterns.missing_xml_structure.check(body);
      if (xmlCheck) {
        result.xmlIssues.push({
          ...xmlCheck,
          willApply: false,
          reason: 'Auto-fix not available for missing XML structure'
        });
      }
      const cotCheck = agentPatterns.unnecessary_cot.check(body);
      if (cotCheck) {
        result.cotIssues.push({
          ...cotCheck,
          willApply: false,
          reason: 'Auto-fix not available for unnecessary CoT'
        });
      }
      const missingCOT = agentPatterns.missing_cot.check(body);
      if (missingCOT) {
        result.cotIssues.push({
          ...missingCOT,
          willApply: false,
          reason: 'Auto-fix not available for missing CoT'
        });
      }
      const exampleCheck = agentPatterns.example_count_suboptimal.check(body);
      if (exampleCheck) {
        result.exampleIssues.push({
          ...exampleCheck,
          willApply: false,
          reason: 'Auto-fix not available for suboptimal example count'
        });
      }
      const claudeCheck = agentPatterns.claude_md_reference.check(body);
      if (claudeCheck) {
        result.crossPlatformIssues.push({
          ...claudeCheck,
          willApply: false,
          reason: 'Auto-fix not available for Claude.md reference'
        });
      }
      return result;
    }

    function analyzeAllAgents(agentsDir, options = {}) {
      const results = [];
      if (!fs.existsSync(agentsDir)) return results;
      const entries = fs.readdirSync(agentsDir).filter(e => e.endsWith('.md') && e !== 'README.md');
      for (const entry of entries) {
        const filepath = path.join(agentsDir, entry);
        const result = analyzeAgent(filepath, options);
        results.push(result);
      }
      return results;
    }

    function analyze(options = {}) {
      const { agent, agentsDir = '.claude/', verbose = false } = options;
      if (agent) {
        const filepath = agent.includes('/') ? agent : path.join(agentsDir, agent + '.md');
        return analyzeAgent(filepath, { verbose });
      } else {
        return analyzeAllAgents(agentsDir, { verbose });
      }
    }

    function applyFixes(issues, options = {}) {
      const { dryRun = false, backup = true } = options;
      const fixes = [];
      for (const issue of issues) {
        if (issue.willApply || issue.fixApplied) {
          fixes.push(issue);
        }
      }
      return fixes;
    }

    function generateReport(results, options = {}) {
      const reporter = require_reporter();
      return Array.isArray(results) ?
        reporter.generateMultiReport(results, options) :
        reporter.generateSingleReport(results, options);
    }

    module.exports = {
      analyze,
      analyzeAgent,
      analyzeAllAgents,
      applyFixes,
      generateReport
    };
  }
});
