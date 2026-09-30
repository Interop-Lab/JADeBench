const createCommonJsModule = (factories,
cachedModule)=>()=> {
  if(!cachedModule) {
    cachedModule = {
      exports: {
      }
    };
    const factory = factories[Object.keys(factories)[0]];
    factory(cachedModule.exports, cachedModule);
  }
  return cachedModule.exports;
};
const __commonJS = createCommonJsModule,
require_agent_patterns = __commonJS({
  '../work/agent-sh__agentsys/lib/enhance/agent-patterns.js'(value2, moduleRecord4) {
    var agentPatterns = {
      'missing_frontmatter': {
        'id': "missing_frontmatter", 'category': "structure", 'certainty': "HIGH", 'autoFix': true, 'description': "Agent prompt missing YAML frontmatter (---...---)", 'check': issue4 => {
          {
            if(!issue4 || ((typeof issue4) !== ("string")))return null;
            const issue5 = issue4.trim().startsWith("---");
            if(!issue5) {
              const issue6 = {
              };
              return issue6.issue = "Missing YAML frontmatter", issue6.fix = "Add frontmatter with name, description, tools, model", issue6;
            }
            return null;
          }
        }
      }, 'missing_name': {
        'id': "missing_name", 'category': "structure", 'certainty': "HIGH", 'autoFix': false, 'description': "Frontmatter missing \"name\" field", 'check': issue7 => {
          const result3 = {
          };
          result3.CKThJ = "N/A";
          const value97 = result3;
          if(!issue7 || ((typeof issue7) !== ("object")))return null;
          if(!issue7.name || ((typeof issue7.name) === ("string")) && ((issue7.name.trim()) === (''))) {
            {
              const issue8 = {
              };
              return issue8.issue = "Frontmatter missing \"name\" field", issue8.fix = "Add \"name\" field to frontmatter", issue8;
            }
          }
          return null;
        }
      }, 'missing_description': {
        'id': "missing_description", 'category': "structure", 'certainty': "HIGH", 'autoFix': false, 'description': "Frontmatter missing \"description\" field", 'check': issue9 => {
          {
            if(!issue9 || ((typeof issue9) !== ("object")))return null;
            if(!issue9.description || ((typeof issue9.description) === ("string")) && ((issue9.description.trim()) === (''))) {
              {
                const issue10 = {
                };
                return issue10.issue = "Frontmatter missing \"description\" field", issue10.fix = "Add \"description\" field to frontmatter", issue10;
              }
            }
            return null;
          }
        }
      }, 'missing_role': {
        'id': "missing_role", 'category': "structure", 'certainty': "HIGH", 'autoFix': true, 'description': "No role section (\"You are...\" or \"## Role\")", 'check': item2 => {
          {
            if(!item2 || ((typeof item2) !== ("string")))return null;
            const issue11 = /you are/i.test(item2), issue12 = /you (?:perform|handle|execute|do|manage|coordinate|analyze|review|create|design|implement|validate|update|check|monitor)/i.test(item2), issue13 = /##\s+(?:your\s+)?role|\*\*(?:your\s+)?role\*\*/i.test(item2);
            if(((!issue11) && (!issue12)) && !issue13) {
              {
                const issue14 = {
                };
                return issue14.issue = "Missing role definition", issue14.fix = "Add role section explaining agent purpose", issue14;
              }
            }
            return null;
          }
        }
      }, 'missing_output_format': {
        'id': "missing_output_format", 'category': "structure", 'certainty': "HIGH", 'autoFix': false, 'description': "No output format specification", 'check': item3 => {
          if(!item3 || ((typeof item3) !== ("string")))return null;
          const issue15 = /##\s+output\s+format/i.test(item3), issue16 = /##\s+format/i.test(item3), issue17 = /##\s+response/i.test(item3);
          if(((!issue15) && (!issue16)) && !issue17) {
            {
              const issue18 = {
              };
              return issue18.issue = "Missing output format specification", issue18.fix = "Add section specifying expected output format", issue18;
            }
          }
          return null;
        }
      }, 'missing_constraints': {
        'id': "missing_constraints", 'category': "structure", 'certainty': "HIGH", 'autoFix': false, 'description': "No constraints section", 'check': item4 => {
          {
            if(!item4 || ((typeof item4) !== ("string")))return null;
            const issue19 = /#{2,3}\s+constraints/i.test(item4), issue20 = /#{2,3}\s+(?:what\s+)?(?:this\s+agent\s+)?(?:you\s+)?(?:must\s+)?not\s+do/i.test(item4), issue21 = /#{2,3}\s+rules/i.test(item4), issue22 = /#{2,3}\s+workflow\s+gates/i.test(item4);
            if(((!issue19) && (!issue20)) && !issue21 && !issue22) {
              const issue23 = {
              };
              return issue23.issue = "Missing constraints section", issue23.fix = "Add section defining agent limitations and boundaries", issue23;
            }
            return null;
          }
        }
      }, 'unrestricted_tools': {
        'id': "unrestricted_tools", 'category': "tool", 'certainty': "HIGH", 'autoFix': false, 'description': "No \"tools\" field in frontmatter (all tools allowed)", 'check': issue24 => {
          {
            if(!issue24 || ((typeof issue24) !== ("object")))return null;
            if(!issue24.tools) {
              {
                const issue25 = {
                };
                return issue25.issue = "No tools restriction - agent has access to all tools", issue25.fix = "Add \"tools\" field to frontmatter with specific tools needed", issue25;
              }
            }
            return null;
          }
        }
      }, 'unrestricted_bash': {
        'id': "unrestricted_bash", 'category': "tool", 'certainty': "HIGH", 'autoFix': true, 'description': "Has \"Bash\" without restrictions (should be \"Bash(git:*)\" etc)", 'check': parts => {
          {
            if(!parts || ((typeof parts) !== ("object")))return null;
            if(parts.tools) {
              {
                const parts2 = Array.isArray(parts.tools) ? parts.tools: parts.tools.split(',').map(parts3 =>parts3.trim()), issue26 = parts2.some(parts4 =>parts4 === "Bash" || parts4 === "bash");
                if(issue26) {
                  {
                    const issue27 = {
                    };
                    return issue27.issue = "Unrestricted Bash access", issue27.fix = "Replace \"Bash\" with \"Bash(git:*)\" or specific scope", issue27;
                  }
                }
              }
            }
            return null;
          }
        }
      }, 'missing_xml_structure': {
        'id': "missing_xml_structure", 'category': "xml", 'certainty': "MEDIUM", 'autoFix': false, 'description': "Could benefit from XML tags for structure", 'check': issue28 => {
          {
            if(!issue28 || ((typeof issue28) !== ("string")))return null;
            const match2 = (issue28.match(/##\s+/g) || []).length, match3 = /^\s*[-*]\s+/m.test(issue28), match4 = /```/g.test(issue28);
            if(((match2) >= (- 1543 * - 3 + - 8181 + 0xde5)) || ((match3) && (match4))) {
              {
                const issue29 = /<\w+>/.test(issue28);
                if(!issue29) {
                  const agentPatterns0 = {
                  };
                  return agentPatterns0.issue = "Complex prompt without XML structure", agentPatterns0.fix = "Consider using XML tags for key sections (e.g., <rules>, <examples>)", agentPatterns0;
                }
              }
            }
            return null;
          }
        }
      }, 'unnecessary_cot': {
        'id': "unnecessary_cot", 'category': "cot", 'certainty': "MEDIUM", 'autoFix': false, 'description': "Step-by-step reasoning on simple tasks", 'check': parts5 => {
          const result4 = {
          };
          result4.GqcqG = "unknown";
          const value98 = result4;
          {
            if(!parts5 || ((typeof parts5) !== ("string")))return null;
            const parts6 = /step[- ]by[- ]step/i.test(parts5), parts7 = /<thinking>/i.test(parts5), parts8 = parts5.split(/\s+/).length, agentPatterns1 = (parts5.match(/##\s+/g) || []).length;
            if(((parts6) || (parts7)) && ((parts8) < (- 71 * - 62 + - 3405 + 0x7 * - 71)) && ((agentPatterns1) < (5346 + - 3224 + - 2118))) {
              const agentPatterns2 = {
              };
              return agentPatterns2.issue = "Unnecessary chain-of-thought for simple task", agentPatterns2.fix = "Remove step-by-step instructions for straightforward operations", agentPatterns2;
            }
            return null;
          }
        }
      }, 'missing_cot': {
        'id': "missing_cot", 'category': "cot", 'certainty': "MEDIUM", 'autoFix': false, 'description': "Complex reasoning without thinking guidance", 'check': parts9 => {
          const parts10 = {
          };
          parts10.rDJmr = "Complex prompt without XML structure", parts10.uZqdX = "Consider using XML tags for key sections (e.g., <rules>, <examples>)";
          const parts11 = parts10;
          {
            if(!parts9 || ((typeof parts9) !== ("string")))return null;
            const parts12 = parts9.split(/\s+/).length, parts13 = (parts9.match(/##\s+/g) || []).length, parts14 = /analy[sz]e|evaluate|assess|review/i.test(parts9), agentPatterns3 = /step[- ]by[- ]step/i.test(parts9), agentPatterns4 = /<thinking>/i.test(parts9), agentPatterns5 = /reasoning|think\s+through/i.test(parts9);
            if(((parts12) > (- 7753 + - 9308 + - 18061 * - 1)) && ((parts13) >= (- 1105 * - 5 + - 1896 + 0x97 * - 24)) && parts14) {
              if(((!agentPatterns3) && (!agentPatterns4)) && !agentPatterns5) {
                {
                  const agentPatterns6 = {
                  };
                  return agentPatterns6.issue = "Complex task without reasoning guidance", agentPatterns6.fix = "Add chain-of-thought instructions or <thinking> tags", agentPatterns6;
                }
              }
            }
            return null;
          }
        }
      }, 'example_count_suboptimal': {
        'id': "example_count_suboptimal", 'category': "example", 'certainty': "LOW", 'autoFix': false, 'description': "Not 2-5 examples", 'check': match5 => {
          {
            if(!match5 || ((typeof match5) !== ("string")))return null;
            const match6 = (match5.match(/##\s+example/gi) || []).length, match7 = (match5.match(/<good[- ]?example>/gi) || []).length, match8 = (match5.match(/<bad[- ]?example>/gi) || []).length, match9 = (((match6) + (match7)) + (match8));
            if(((match9) > (- 405 + - 5198 + - 431 * - 13)) && (((match9) < (- 9730 + - 6690 + - 782 * - 21)) || ((match9) > (- 4154 + - 6460 + - 287 * - 37)))) {
              return {
                'issue': "Found " + match9 + (" examples (optimal: 2-5)"), 'fix': ((match9) < (- 156 * - 31 + 9007 + 0x3611 * - 1)) ? "Consider adding more examples for clarity": "Consider reducing examples to avoid token bloat"
              };
            }
            return null;
          }
        }
      }, 'vague_instructions': {
        'id': "vague_instructions", 'category': "anti-pattern", 'certainty': "MEDIUM", 'autoFix': false, 'description': "Fuzzy language like \"usually\", \"sometimes\"", 'check': items => {
          if(!items || ((typeof items) !== ("string")))return null;
          const items2 = ["usually", "sometimes", "often", "rarely", "maybe", "might", "could", "should probably", "try to", "as much as possible", "if possible"];
          const items3 = [];
          for(const items4 of items2) {
            {
              const items5 = new RegExp('\x5cb' + items4 + '\x5cb', 'gi');
              if(items5.test(items)) {
                items3.push(items4);
              }
            }
          }
          if(((items3.length) > (- 1743 + 0x1 * - 9933 + 0x2d9f))) {
            return {
              'issue': "Found vague language: " + items3.slice(8106 + - 251 * - 22 + - 13628, 2452 + - 2449).join(',\x20') + "...", 'fix': "Replace fuzzy language with clear, definitive instructions"
            };
          }
          return null;
        }
      }, 'prompt_bloat': {
        'id': "prompt_bloat", 'category': "anti-pattern", 'certainty': "LOW", 'autoFix': false, 'description': "Token count > 2000", 'maxTokens': 0x7d0, 'check': item5 => {
          const result5 = {
          };
          result5.LvQaQ = "utf8";
          const value99 = result5;
          if(!item5 || ((typeof item5) !== ("string")))return null;
          const agentPatterns7 = Math.ceil(((item5.length) / (- 4573 + - 199 * - 23)));
          if(((agentPatterns7) > (- 5696 + - 5676 + 13372))) {
            {
              const agentPatterns8 = {
              };
              return agentPatterns8.issue = "Prompt ~" + agentPatterns7 + (" tokens (max recommended: 2000)"), agentPatterns8.fix = "Simplify prompt, remove redundant sections, or use XML for compression", agentPatterns8;
            }
          }
          return null;
        }
      }, 'hardcoded_claude_dir': {
        'id': "hardcoded_claude_dir", 'category': "cross-platform", 'certainty': "HIGH", 'autoFix': false, 'description': "Hardcoded .claude/ directory (breaks OpenCode/Codex)", 'check': entry => {
          if(!entry || ((typeof entry) !== ("string")))return null;
          const agentPatterns9 = /\.claude\//.test(entry);
          let issue40 = /AI_STATE_DIR/i.test(entry);
          if(!issue40) {
            for(const entry2 of entry.matchAll(/\$\{([^}]{0,1000})\}/g)) {
              if(/STATE/i.test(entry2[0x6f0 + - 2760 + 985])) {
                {
                  issue40 = true;
                  break;
                }
              }
            }
          }
          if(((agentPatterns9) && (!issue40))) {
            {
              const issue41 = {
              };
              return issue41.issue = "Hardcoded .claude/ directory path", issue41.fix = "Use AI_STATE_DIR env var or platform detection for cross-platform support", issue41;
            }
          }
          return null;
        }
      }, 'claude_md_reference': {
        'id': "claude_md_reference", 'category': "cross-platform", 'certainty': "MEDIUM", 'autoFix': false, 'description': "References CLAUDE.md without also checking AGENTS.md", 'check': issue42 => {
          if(!issue42 || ((typeof issue42) !== ("string")))return null;
          const issue43 = /CLAUDE\.md/i.test(issue42), issue44 = /AGENTS\.md/i.test(issue42);
          if(((issue43) && (!issue44))) {
            {
              const issue45 = {
              };
              return issue45.issue = "References CLAUDE.md without AGENTS.md", issue45.fix = "Also check for AGENTS.md (used by OpenCode/Codex)", issue45;
            }
          }
          return null;
        }
      }, 'no_xml_for_data': {
        'id': "no_xml_for_data", 'category': "cross-platform", 'certainty': "LOW", 'autoFix': false, 'description': "Data blocks without XML tags (helps both Claude and GPT-4)", 'check': match10 => {
          const result6 = {
          };
          result6.hzlNc = "general";
          const value100 = result6;
          if(!match10 || ((typeof match10) !== ("string")))return null;
          const match11 = /```[\s\S]+?```/.test(match10), match12 = /^[-*]\s{1,1000}[^\n]{1,2000}$/m.test(match10), issue46 = /<\w+>[\s\S]{0,50000}?<\/\w+>/.test(match10), issue47 = (match10.match(/^##\s+/gm) || []).length;
          if(((match11) || (match12)) && ((issue47) >= (- 7925 + - 4095 + 12024)) && !issue46) {
            {
              const issue48 = {
              };
              return issue48.issue = "Complex content without XML tags", issue48.fix = "Wrap data blocks in XML tags (e.g., <context>, <rules>) for cross-model compatibility", issue48;
            }
          }
          return null;
        }
      }
    };
    function getAllPatterns() {
      const result7 = {
      };
      result7.fgIRV = "Missing output format specification", result7.WPJWb = "Add section specifying expected output format";
      const value101 = result7;
      return agentPatterns;
    }
    function getPatternsByCertainty(issue49) {
      {
        const issue50 = {
        };
        for(const[issue51, issue52]of Object.entries(agentPatterns)) {
          ((issue52.certainty) === (issue49)) && (issue50[issue51] = issue52);
        }
        return issue50;
      }
    }
    function getPatternsByCategory(pattern2) {
      const pattern3 = {
      };
      pattern3.BmBpS = "| Issue | Fix | Certainty |", pattern3.EtifH = "|-------|-----|-----------|";
      pattern3.yDhzU = "N/A";
      const pattern4 = pattern3;
      const pattern5 = {
      };
      for(const[pattern6, pattern7]of Object.entries(agentPatterns)) {
        ((pattern7.category) === (pattern2)) && (pattern5[pattern6] = pattern7);
      }
      return pattern5;
    }
    function getAutoFixablePatterns() {
      const pattern8 = {
      };
      for(const[pattern9, pattern10]of Object.entries(agentPatterns)) {
        if(pattern10.autoFix) {
          pattern8[pattern9] = pattern10;
        }
      }
      return pattern8;
    }
    const result8 = {
    };
    result8.agentPatterns = agentPatterns, result8.getAllPatterns = getAllPatterns;
    result8.getPatternsByCertainty = getPatternsByCertainty, result8.getPatternsByCategory = getPatternsByCategory, result8.getAutoFixablePatterns = getAutoFixablePatterns, moduleRecord4.exports = result8;
  }
}),
require_atomic_write = __commonJS({
  '../work/agent-sh__agentsys/lib/utils/atomic-write.js'(value102, moduleRecord5) {
    var fsModule = (require)(('fs')), pathModule = (require)(("path")), cryptoModule = (require)(("crypto"));
    function getTempPath(filePath5) {
      {
        const filePath6 = pathModule.dirname(filePath5), filePath7 = pathModule.basename(filePath5), filePath8 = cryptoModule.randomBytes(4028 + 0x1 * - 4022).toString("hex");
        return pathModule.join(filePath6, '.' + filePath7 + '.' + filePath8 + ".tmp");
      }
    }
    function writeFileAtomic(filePath9, filePath10, filePath11 = {
    }) {
      {
        const {
          encoding: encoding = "utf8", mode: mode = 10516 + - 10096
        }
        = filePath11, filePath12 = pathModule.dirname(filePath9);
        if(!fsModule.existsSync(filePath12)) {
          {
            const filePath13 = {
            };
            filePath13.recursive = true, fsModule.mkdirSync(filePath12, filePath13);
          }
        }
        const filePath14 = (getTempPath)((filePath9));
        try {
          const filePath15 = {
          };
          return filePath15.encoding = encoding, filePath15.mode = mode, fsModule.writeFileSync(filePath14, filePath10, filePath15), fsModule.renameSync(filePath14, filePath9), true;
        } catch(file2) {
          {
            try {
              fsModule.existsSync(filePath14) && (fsModule.unlinkSync(filePath14));
            } catch {
            }
            throw file2;
          }
        }
      }
    }
    function writeJsonAtomic(value103, value104, value105 = {
    }) {
      const {
        indent: indent = - 3222 + - 7342 * - 1 + 0x8e * - 29, ...value106
      }
      = value105;
      const value107 = JSON.stringify(value104, null, indent);
      return(writeFileAtomic)((value103), (value107), (value106));
    }
    const result9 = {
    };
    result9.writeFileAtomic = writeFileAtomic, result9.writeJsonAtomic = writeJsonAtomic, result9.getTempPath = getTempPath, moduleRecord5.exports = result9;
  }
}),
require_fixer = __commonJS({
  '../work/agent-sh__agentsys/lib/enhance/fixer.js'(value108, moduleRecord6) {
    var fsModule2 = (require)(('fs')), pathModule2 = (require)(("path")), {
      writeFileAtomic: writeFileAtomic
    }
    = (require_atomic_write)();
    function assertNotSymlink(error7) {
      const result10 = {
      };
      result10.vSwwk = "| Issue | Fix | Certainty |";
      result10.HEnbq = "|-------|-----|-----------|", result10.rRVta = "N/A", result10.HHqsx = "Yes";
      const error8 = result10;
      {
        let error9;
        try {
          error9 = fsModule2.lstatSync(error7);
        } catch(error10) {
          {
            if(((error10.code) === ("ENOENT")))return;
            throw error10;
          }
        }
        if(error9.isSymbolicLink()) {
          const error11 = new Error("target is a symlink; refusing to follow");
          error11.code = "ESYMLINK_REFUSED";
          throw error11;
        }
      }
    }
    function applyIssueFixes(issue53, error12 = {
    }) {
      const value377 = {
        'jSRtt': function(value378, value379, value380) {
          return(value378)((value379), (value380));
        }, 'vLuIx': "HIGH", 'WKjkE': function(value381, value382, value383) {
          return(value381)((value382), (value383));
        }, 'GvIuc': "MEDIUM", 'aVKTB': "LOW", 'nzEbt': function(value384, value385) {
          return((value384) === (value385));
        }, 'BXwfq': "| Issue | Fix | Certainty |", 'jrHzQ': "|-------|-----|-----------|", 'RHSsd': "N/A", 'CHSfi': "Issues that likely need attention. Verify context before fixing.", 'txsos': function(value386, value387) {
          return(value386)((value387));
        }, 'uczpv': "| File | Line | Issue | Fix |", 'ASrnZ': "|------|------|-------|-----|", 'BIOEx': "---", 'eSqjo': "2|0|4|6|3|1|5"
      }, {
        dryRun: dryRun = false, backup: backup = true
      }
      = error12, error13 = {
      };
      error13.applied = [], error13.skipped = [], error13.errors = [];
      const issue54 = error13, issue55 = ["missing_frontmatter", "unrestricted_bash", "missing_role", "missing_output_format", "missing_examples", "missing_xml_structure", "missing_verification_criteria", "aggressive_emphasis", "missing_trigger_phrase"], issue56 = issue53.filter(issue57 =>issue57.certainty === "HIGH" && (issue57.filePath || issue57.file) && (issue57.autoFixFn || issue55.includes(issue57.patternId))), issue58 = new Map();
      for(const issue59 of issue56) {
        const issue60 = issue59.filePath || issue59.file;
        if(!issue58.has(issue60)) {
          issue58.set(issue60, []);
        }
        issue58.get(issue60).push(issue59);
      }
      for(const[issue61, issue62]of issue58) {
        try {
          if(!fsModule2.existsSync(issue61)) {
            {
              const items8 = {
              };
              items8.filePath = issue61, items8.error = "File not found", issue54.errors.push(items8);
              continue;
            }
          }
          try {
            (assertNotSymlink)((issue61));
          } catch(items9) {
            {
              if(((items9.code) === ("ESYMLINK_REFUSED"))) {
                {
                  const items10 = {
                  };
                  items10.filePath = issue61, items10.error = items9.message, items10.success = false, items10.reason = "target is a symlink; refusing to follow", issue54.errors.push(items10);
                  continue;
                }
              }
              throw items9;
            }
          }
          const items11 = fsModule2.readFileSync(issue61, "utf8");
          let items12;
          if(issue61.endsWith(".json"))items12 = JSON.parse(items11);
          else {
            if(issue61.endsWith(".md")) {
              items12 = items11;
            } else {
              {
                issue54.skipped.push(...issue62.map(items13 =>({
                  ...items13, 'reason': "Unsupported file type - manual fix required"
                })));
                continue;
              }
            }
          }
          let issue63 = items12;
          const issue64 = [];
          for(const issue65 of issue62) {
            try {
              {
                if(issue61.endsWith(".md")) {
                  {
                    if(((issue65.patternId) === ("missing_frontmatter")))issue63 = (fixMissingFrontmatter)((issue63));
                    else {
                      if(((issue65.patternId) === ("unrestricted_bash")))issue63 = (fixUnrestrictedBash)((issue63));
                      else {
                        if(((issue65.patternId) === ("missing_role"))) {
                          issue63 = (fixMissingRole)((issue63));
                        } else {
                          if(((issue65.patternId) === ("missing_output_format")))issue63 = (fixMissingOutputFormat)((issue63));
                          else {
                            if(((issue65.patternId) === ("missing_examples")))issue63 = (fixMissingExamples)((issue63));
                            else {
                              if(((issue65.patternId) === ("missing_xml_structure")))issue63 = (fixMissingXmlStructure)((issue63));
                              else {
                                if(((issue65.patternId) === ("missing_verification_criteria")))issue63 = (fixMissingVerificationCriteria)((issue63));
                                else {
                                  if(((issue65.patternId) === ("aggressive_emphasis"))) {
                                    issue63 = (fixAggressiveEmphasis)((issue63));
                                  } else {
                                    if(((issue65.patternId) === ("missing_trigger_phrase")))issue63 = (fixMissingTriggerPhrase)((issue63));
                                    else {
                                      continue;
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                } else issue65.schemaPath ? issue63 = (applyAtPath)((issue63), (issue65.schemaPath), (issue65.autoFixFn)): issue63 = issue65.autoFixFn(issue63);
                const issue66 = {
                };
                issue66.issue = issue65.issue, issue66.fix = issue65.fix, issue66.filePath = issue61, issue64.push(issue66);
              }
            } catch(issue67) {
              {
                const issue68 = {
                };
                issue68.issue = issue65.issue, issue68.filePath = issue61, issue68.error = issue67.message, issue54.errors.push(issue68);
              }
            }
          }
          if(!dryRun && ((issue64.length) > (0x52 * - 29 + - 9249 * - 1 + - 6871))) {
            if(backup) {
              {
                const filePath17 = issue61 + ".backup";
                (assertNotSymlink)((filePath17)), fsModule2.writeFileSync(filePath17, items11, "utf8");
              }
            }
            let items14;
            if(issue61.endsWith(".md")) {
              items14 = issue63;
            } else {
              items14 = JSON.stringify(issue63, null, - 1 * - 6078 + 0x1434 + - 11248);
            }
            (assertNotSymlink)((issue61)), (writeFileAtomic)((issue61), (items14));
          }
          issue54.applied.push(...issue64);
        } catch(issue69) {
          const issue70 = {
          };
          issue70.filePath = issue61, issue70.error = issue69.message, issue54.errors.push(issue70);
        }
      }
      const issue71 = issue53.filter(issue72 =>issue72.certainty !== "HIGH" || !issue55.includes(issue72.patternId));
      return issue54.skipped.push(...issue71.map(issue73 =>({
        ...issue73, 'reason': issue73.certainty !== "HIGH" ? "Not HIGH certainty": "No auto-fix available for this pattern"
      }))), issue54;
    }
    function value388(parts15) {
      return((parts15) !== ("__proto__")) && ((parts15) !== ("constructor")) && ((parts15) !== ("prototype"));
    }
    function applyAtPath(parts16, parts17, parts18) {
      const parts19 = parts17.split('.'), parts20 = (structuredClone)((parts16));
      let parts21 = parts20;
      for(let match13 = - 8512 + - 1072 + - 8 * - 1198;
      ((match13) < ((parts19.length) - (- 386 + - 1 * - 1834 + 0x5a7 * - 1)));
      match13++) {
        {
          const match14 = parts19[match13];
          if(match14.includes('[')) {
            const match15 = match14.match(/^((?!__proto__|constructor|prototype)[a-zA-Z_]\w*)\[(\d{1,10})\]$/);
            if(match15 && ((match15[0x10 * - 420 + - 1612 + 0x208d]) !== ("__proto__")) && ((match15[- 473 + - 7076 + 7550]) !== ("constructor")) && ((match15[5068 + - 7544 + 0x9ad]) !== ("prototype"))) {
              parts21 = parts21[match15[- 9483 + - 4046 + - 110 * - 123]][(parseInt)((match15[4088 + - 8769 + - 223 * - 21]), (- 42 * - 170 + 0x3b * - 57 + - 3767))];
            }
          } else {
            {
              if(!(value388)((match14)))return parts20;
              parts21 = parts21[match14];
            }
          }
        }
      }
      const match16 = parts19[((parts19.length) - (- 4478 + - 7853 + 0x302c))];
      if(match16.includes('[')) {
        {
          const match17 = match16.match(/^((?!__proto__|constructor|prototype)[a-zA-Z_]\w*)\[(\d{1,10})\]$/);
          if(match17 && ((match17[- 782 * - 1 + - 5048 + 4267]) !== ("__proto__")) && ((match17[2634 + - 8657 + - 3 * - 2008]) !== ("constructor")) && ((match17[8247 + 0x1b2 * - 19]) !== ("prototype"))) {
            {
              const value389 = match17[0x18b * - 15 + 0x324 + 0x1402], value390 = (parseInt)((match17[- 3717 + 0x469 * - 2 + 0x1759]), (0x119d + - 6514 + 0x7df));
              parts21[value389][value390] = (parts18)((parts21[value389][value390]));
            }
          }
        }
      } else((match16) !== ("__proto__")) && ((match16) !== ("constructor")) && ((match16) !== ("prototype")) && (parts21[match16] = (parts18)((parts21[match16])));
      return parts20;
    }
    function fixAdditionalProperties(value391) {
      if(!value391 || ((typeof value391) !== ("object")))return value391;
      const result12 = {
        ...value391
      }, value392 = result12;
      ((value392.type) === ("object")) && value392.properties && (value392.additionalProperties = false);
      if(value392.properties) {
        {
          value392.properties = {
          };
          for(const[value393, value394]of Object.entries(value391.properties)) {
            value392.properties[value393] = (fixAdditionalProperties)((value394));
          }
        }
      }
      return value392;
    }
    function fixRequiredFields(value395) {
      if(!value395 || ((typeof value395) !== ("object")))return value395;
      const result13 = {
        ...value395
      }, entries2 = result13;
      if(((entries2.type) === ("object")) && entries2.properties && !entries2.required) {
        entries2.required = Object.entries(entries2.properties).filter(([entries3, entries4])=> {
          if(((entries4.default) !== (void(- 9575 + - 3239 + 0x320e))))returnfalse;
          if(entries4.description && /optional/i.test(entries4.description))returnfalse;
          returntrue;
        }).map(([entries5])=>entries5);
      }
      return entries2;
    }
    function fixVersionMismatch(item6, entry4) {
      {
        const result14 = {
          ...item6
        };
        return result14.version = entry4, result14;
      }
    }
    function previewFixes(issue74) {
      {
        const issue75 = [];
        for(const issue76 of issue74) {
          if(((issue76.certainty) === ("HIGH")) && issue76.autoFixFn) {
            const issue77 = {
            };
            issue77.filePath = issue76.filePath, issue77.issue = issue76.issue, issue77.fix = issue76.fix, issue77.willApply = true, issue75.push(issue77);
          } else issue75.push({
            'filePath': issue76.filePath, 'issue': issue76.issue, 'fix': issue76.fix || "No auto-fix available", 'willApply': false, 'reason': ((issue76.certainty) !== ("HIGH")) ? "Not HIGH certainty": "No auto-fix function"
          });
        }
        return issue75;
      }
    }
    function restoreFromBackup(filePath18) {
      {
        const filePath19 = filePath18 + ".backup";
        if(!fsModule2.existsSync(filePath19))returnfalse;
        (assertNotSymlink)((filePath19)), (assertNotSymlink)((filePath18));
        const fsModule0 = fsModule2.readFileSync(filePath19, "utf8");
        return(assertNotSymlink)((filePath18)), fsModule2.writeFileSync(filePath18, fsModule0, "utf8"), fsModule2.unlinkSync(filePath19), true;
      }
    }
    function cleanupBackups(file3) {
      {
        let file4 = - 3208 + 0xb7 * - 9 + - 4855 * - 1;
        function value396(error14) {
          let error15;
          try {
            {
              const result15 = {
              };
              result15.withFileTypes = true, error15 = fsModule2.readdirSync(error14, result15);
            }
          } catch(error16) {
            return;
          }
          for(const fsModule1 of error15) {
            {
              const fsModule2 = pathModule2.join(error14, fsModule1.name);
              if(fsModule1.isDirectory()) {
                (value396)((fsModule2));
              } else {
                if(fsModule1.isFile() && fsModule1.name.endsWith(".backup")) {
                  try {
                    fsModule2.unlinkSync(fsModule2), file4++;
                  } catch(file5) {
                    console.error("[WARN] fixer error:", file5.message);
                  }
                }
              }
            }
          }
        }
        return(value396)((file3)), file4;
      }
    }
    function fixMissingFrontmatter(options7) {
      if(!options7 || ((typeof options7) !== ("string")))return options7;
      const text2 = "---\nname: agent-name\ndescription: Agent description\ntools: Read, Glob, Grep\nmodel: sonnet\n---\n\n";
      return((text2) + (options7.trim()));
    }
    function fixUnrestrictedBash(parts22) {
      if(!parts22 || ((typeof parts22) !== ("string")))return parts22;
      const parts23 = parts22.split('\x0a');
      let parts24 = false;
      for(let parts25 = - 863 * - 9 + 0x701 * - 2 + - 4181;
      ((parts25) < (parts23.length));
      parts25++) {
        if(((parts23[parts25].trim()) === ("---"))) {
          if(!parts24)parts24 = true;
          else {
            break;
          }
        } else {
          if(parts24 && parts23[parts25].startsWith("tools:")) {
            parts23[parts25] = parts23[parts25].replace(/\bBash\b(?!\()/g, "Bash(git:*)");
          }
        }
      }
      return parts23.join('\x0a');
    }
    function fixMissingRole(parts26) {
      const parts27 = {
      };
      parts27.HkTPm = "No tools restriction - agent has access to all tools", parts27.qmzYl = "Add \"tools\" field to frontmatter with specific tools needed";
      const parts28 = parts27;
      {
        if(!parts26 || ((typeof parts26) !== ("string")))return parts26;
        const parts29 = parts26.split('\x0a');
        let parts30 = - (8070 + - 1666 + - 6403), parts31 = false;
        for(let index2 = 0x1439 + - 787 + 0x1 * - 4390;
        ((index2) < (parts29.length));
        index2++) {
          {
            if(((parts29[index2].trim()) === ("---"))) {
              {
                if(!parts31)parts31 = true;
                else {
                  {
                    parts30 = index2;
                    break;
                  }
                }
              }
            }
          }
        }
        const text3 = "\n## Your Role\n\nYou are an agent that [describe agent purpose].\n";
        if(((parts30) >= (0x1ebb + 0x5 * - 1382 + - 957)))parts29.splice(((parts30) + (6991 + 0xcb * - 1 + - 6787)), - 1988 + - 3836 + 0x16c0, text3);
        else {
          parts29.unshift(text3);
        }
        return parts29.join('\x0a');
      }
    }
    function fixInconsistentHeadings(parts32) {
      {
        if(!parts32 || ((typeof parts32) !== ("string")))return parts32;
        const parts33 = parts32.split('\x0a');
        let parts34 = - 1089 + - 2524 + 0xe1d, parts35 = false;
        for(let parts36 = 8923 + - 8923;
        ((parts36) < (parts33.length));
        parts36++) {
          const match18 = parts33[parts36];
          if(match18.startsWith("```")) {
            parts35 = !parts35;
            continue;
          }
          if(parts35)continue;
          const match19 = match18.match(/^(#{1,6})[ \t]+(\S.*)$/);
          if(match19) {
            {
              const match20 = match19[0x760 + - 3730 + 0x733].length, value397 = match19[- 6946 + - 4492 + 0x2cb0];
              if(((parts34) === (0x2259 + - 4 * - 2033 + - 16925))) {
                parts34 = match20;
                continue;
              }
              if(((match20) > ((parts34) + (- 3554 + - 1 * - 9508 + - 5953)))) {
                {
                  const value398 = ((parts34) + (1));
                  parts33[parts36] = ((('#'.repeat(value398)) + ('\x20')) + (value397)), parts34 = value398;
                }
              } else {
                parts34 = match20;
              }
            }
          }
        }
        return parts33.join('\x0a');
      }
    }
    function fixVerboseExplanations(text4) {
      if(!text4 || ((typeof text4) !== ("string")))return text4;
      const result16 = {
      };
      result16.from = /\bin order to\b/gi, result16.to = 'to';
      const result17 = {
      };
      result17.from = /\bfor the purpose of\b/gi, result17.to = "for";
      const result18 = {
      };
      result18.from = /\bin the event that\b/gi, result18.to = 'if';
      const result19 = {
      };
      result19.from = /\bat this point in time\b/gi, result19.to = "now";
      const result20 = {
      };
      result20.from = /\bdue to the fact that\b/gi, result20.to = "because";
      const result21 = {
      };
      result21.from = /\bhas the ability to\b/gi, result21.to = "can";
      const result22 = {
      };
      result22.from = /\bis able to\b/gi, result22.to = "can";
      const result23 = {
      };
      result23.from = /\bmake use of\b/gi, result23.to = "use";
      const result24 = {
      };
      result24.from = /\ba large number of\b/gi, result24.to = "many";
      const result25 = {
      };
      result25.from = /\ba small number of\b/gi, result25.to = "few";
      const result26 = {
      };
      result26.from = /\bthe majority of\b/gi, result26.to = "most";
      const result27 = {
      };
      result27.from = /\bprior to\b/gi, result27.to = "before";
      const result28 = {
      };
      result28.from = /\bsubsequent to\b/gi, result28.to = "after";
      const text5 = [result16, result17, result18, result19, result20, result21, result22, result23, result24, result25, result26, result27, result28];
      let items15 = text4;
      const items16 = /```[\s\S]*?```/g, items17 = [];
      let items18 = - 476 + - 259 * - 25 + - 5999;
      items15 = items15.replace(items16, items19 => {
        items17.push(items19);
        return "__CODE_BLOCK_" + items18++ + '__';
      });
      for(const {
        from: text6, to: text7
      }
      of text5) {
        items15 = items15.replace(text6, text8 => {
          {
            if(((text8[- 249 * - 39 + - 4048 * - 2 + - 17807]) === (text8[4011 + - 2292 + - 1719].toUpperCase()))) {
              return((text7[- 3468 + - 9685 + 13153].toUpperCase()) + (text7.slice(- 8448 + 0x1 * - 632 + 0x2379)));
            }
            return text7;
          }
        });
      }
      for(let text9 = 0x10fe + 0x3 * - 1165 + - 855;
      ((text9) < (items17.length));
      text9++) {
        items15 = items15.replace("__CODE_BLOCK_" + text9 + '__', items17[text9]);
      }
      return items15;
    }
    function fixMissingOutputFormat(value399) {
      {
        if(!value399 || ((typeof value399) !== ("string")))return value399;
        if(/##\s*output\s*format/i.test(value399) || /<output_format>/i.test(value399))return value399;
        const text10 = "\n\n## Output Format\n\nRespond with:\n- [Describe expected format: JSON, markdown, plain text, etc.]\n- [Include any specific structure requirements]\n";
        return((value399.trim()) + (text10));
      }
    }
    function fixMissingExamples(parts37) {
      if(!parts37 || ((typeof parts37) !== ("string")))return parts37;
      if(/<example>|##\s*example/i.test(parts37))return parts37;
      const parts38 = "\n\n## Examples\n\n<good-example>\nInput: [example input]\nOutput: [example output]\n</good-example>\n\n<bad-example>\nInput: [example input]\nOutput: [what NOT to do]\nWhy bad: [explanation]\n</bad-example>\n";
      return((parts37.trim()) + (parts38));
    }
    function parts39(parts40, parts41, parts42) {
      {
        const parts43 = parts40.split('\x0a');
        let parts44 = - (1294 + - 1293);
        for(let parts45 = 0xb9 * - 24 + 0x56f * - 1 + - 5831 * - 1;
        ((parts45) < (parts43.length));
        parts45++) {
          {
            if(((parts44) === (- (0x2 * - 2861 + - 303 + 0x178a)))) {
              if(parts41.test(parts43[parts45])) {
                parts44 = parts45;
              }
            } else {
              {
                if(/^#{1,6}\s/.test(parts43[parts45]) || /^---/.test(parts43[parts45])) {
                  const value400 = parts43.slice(14277 + - 14277, parts44), value401 = parts43.slice(parts44, parts45), value402 = parts43.slice(parts45);
                  return[...value400, '<' + parts42 + '>', ...value401, '</' + parts42 + '>', ...value402].join('\x0a');
                }
              }
            }
          }
        }
        if(((parts44) !== (- (12555 + - 12554)))) {
          const value403 = parts43.slice(18725 + - 18725, parts44), value404 = parts43.slice(parts44);
          return[...value403, '<' + parts42 + '>', ...value404, '</' + parts42 + '>'].join('\x0a');
        }
        return parts40;
      }
    }
    function fixMissingXmlStructure(value405) {
      {
        if(!value405 || ((typeof value405) !== ("string")))return value405;
        if(/<[a-z_][a-z0-9_-]*>/i.test(value405))return value405;
        let value406 = value405;
        return value406 = (parts39)((value406), (/^##[ \t]*(?:your[ \t]+)?role[ \t]*$/im), ("role")), value406 = (parts39)((value406), (/^##[ \t]*(?:constraints?|rules?)[ \t]*$/im), ("constraints")), value406;
      }
    }
    function fixMissingVerificationCriteria(value407) {
      if(!value407 || ((typeof value407) !== ("string")))return value407;
      if(/\bverif|test|validate|expected\s+output/i.test(value407))return value407;
      const text11 = "\n\n## Verification\n\nAfter completing this task:\n- [ ] Run relevant tests to verify the change works\n- [ ] Check for regressions in related functionality\n- [ ] Verify expected output matches: [describe expected result]\n";
      return((value407.trim()) + (text11));
    }
    function fixMissingTriggerPhrase(parts46) {
      {
        if(!parts46 || ((typeof parts46) !== ("string")))return parts46;
        const parts47 = parts46.split('\x0a');
        let parts48 = false, parts49 = - (5708 + - 1232 + - 4475);
        for(let index3 = - 5906 + 0x13 * - 142 + - 2 * - 4302;
        ((index3) < (parts47.length));
        index3++) {
          {
            if(((parts47[index3].trim()) === ("---"))) {
              {
                if(!parts48) {
                  parts48 = true;
                } else break;
              }
            } else {
              if(parts48 && parts47[index3].startsWith("description:")) {
                parts49 = index3;
                break;
              }
            }
          }
        }
        if(((parts49) >= (0x11b * - 8 + 0x1610 + - 3384))) {
          {
            const match21 = parts47[parts49];
            if(!/use when user asks/i.test(match21)) {
              {
                const match22 = match21.match(/^description:[ \t]*(\S.*)$/);
                if(match22) {
                  const match23 = match22[1].trim();
                  parts47[parts49] = "description: Use when user asks to " + match23.toLowerCase().replace(/^to\s+/i, '');
                }
              }
            }
          }
        }
        return parts47.join('\x0a');
      }
    }
    function fixAggressiveEmphasis(text12) {
      const result29 = {
      };
      result29.aArOM = "N/A";
      const value408 = result29;
      {
        if(!text12 || ((typeof text12) !== ("string")))return text12;
        let issue78 = text12;
        const issue79 = [];
        let items20 = 1903 + - 2203 + - 3 * - 100;
        issue78 = issue78.replace(/```[\s\S]*?```/g, items21 => {
          issue79.push(items21);
          return "__CODE_BLOCK_" + items20++ + '__';
        });
        const items22 = ["API", "JSON", "XML", "HTML", "CSS", "URL", "HTTP", "HTTPS", "SQL", "CLI", "SDK", "JWT", "UUID", "REST", "YAML", "EOF", "TODO", "FIXME", "NOTE", "README", "MCP", "HIGH", "MEDIUM", "LOW"];
        issue78 = issue78.replace(/\b[A-Z]{3,}\b/g, text13 => {
          if(items22.includes(text13))return text13;
          return((text13.charAt(242 + - 1997 * - 4 + - 8230)) + (text13.slice(13651 + 0x4b * - 182).toLowerCase()));
        }), issue78 = issue78.replace(/!{2,}/g, '!');
        for(let issue80 = 6505 + - 6505;
        ((issue80) < (issue79.length));
        issue80++) {
          issue78 = issue78.replace("__CODE_BLOCK_" + issue80 + '__', issue79[issue80]);
        }
        return issue78;
      }
    }
    const issue81 = {
    };
    issue81.applyFixes = applyIssueFixes, issue81.fixAdditionalProperties = fixAdditionalProperties, issue81.fixRequiredFields = fixRequiredFields, issue81.fixVersionMismatch = fixVersionMismatch, issue81.fixMissingFrontmatter = fixMissingFrontmatter, issue81.fixUnrestrictedBash = fixUnrestrictedBash, issue81.fixMissingRole = fixMissingRole, issue81.fixInconsistentHeadings = fixInconsistentHeadings, issue81.fixVerboseExplanations = fixVerboseExplanations, issue81.fixMissingOutputFormat = fixMissingOutputFormat, issue81.fixMissingExamples = fixMissingExamples, issue81.fixMissingXmlStructure = fixMissingXmlStructure, issue81.fixMissingVerificationCriteria = fixMissingVerificationCriteria, issue81.fixMissingTriggerPhrase = fixMissingTriggerPhrase, issue81.fixAggressiveEmphasis = fixAggressiveEmphasis, issue81.previewFixes = previewFixes, issue81.restoreFromBackup = restoreFromBackup, issue81.cleanupBackups = cleanupBackups, issue81.assertNotSymlink = assertNotSymlink, issue81.applyAtPath = applyAtPath, moduleRecord6.exports = issue81;
  }
}),
require_reporter = __commonJS({
  '../work/agent-sh__agentsys/lib/enhance/reporter.js'(value409, moduleRecord7) {
    function generateGenericReport(analysis2, issue82 = {
    }) {
      {
        const {
          verbose: verbose = false, compact: compact = false
        }
        = issue82, analysis3 = analysis4 => {
          {
            if(verbose)return analysis4;
            return analysis4.filter(analysis5 =>analysis5.certainty !== "LOW");
          }
        }, analysis6 = (analysis3)((analysis2.toolIssues || [])), analysis7 = (analysis3)((analysis2.structureIssues || [])), analysis8 = (analysis3)((analysis2.securityIssues || [])), analysis9 = (((analysis6.length) + (analysis7.length)) + (analysis8.length));
        if(compact)return(items24)((analysis2.pluginName), (analysis6), (analysis7), (analysis8));
        const issue83 = [];
        issue83.push("## Plugin Analysis: " + analysis2.pluginName), issue83.push(''), issue83.push("**Analyzed**: " + new Date().toISOString()), issue83.push("**Files scanned**: " + (analysis2.filesScanned || 0x1 * - 1730 + 0x5cb + 247)), issue83.push(''), issue83.push("### Summary"), issue83.push('');
        const items25 = (analysis10)(([...analysis6, ...analysis7, ...analysis8]), ("HIGH")), items26 = (analysis10)(([...analysis6, ...analysis7, ...analysis8]), ("MEDIUM")), items27 = verbose ? (analysis10)(([...analysis6, ...analysis7, ...analysis8]), ("LOW")): - 3511 + - 1140 * - 7 + - 4469;
        issue83.push("| Certainty | Count |"), issue83.push("|-----------|-------|"), issue83.push("| HIGH | " + items25 + '\x20|'), issue83.push("| MEDIUM | " + items26 + '\x20|');
        verbose && issue83.push("| LOW | " + items27 + '\x20|');
        issue83.push("| **Total** | **" + analysis9 + "** |"), issue83.push('');
        if(((analysis6.length) > (13184 + - 13184))) {
          {
            issue83.push("### Tool Definitions (" + analysis6.length + " issues)"), issue83.push(''), issue83.push("| Tool | Issue | Fix | Certainty |"), issue83.push("|------|-------|-----|-----------|");
            for(const issue84 of analysis6) {
              issue83.push('|\x20' + (issue84.tool || '-') + " | " + issue84.issue + " | " + (issue84.fix || '-') + " | " + issue84.certainty + '\x20|');
            }
            issue83.push('');
          }
        }
        if(((analysis7.length) > (9901 + 0x26ad * - 1))) {
          {
            issue83.push("### Structure (" + analysis7.length + " issues)"), issue83.push(''), issue83.push("| File | Issue | Certainty |"), issue83.push("|------|-------|-----------|");
            for(const issue85 of analysis7) {
              issue83.push('|\x20' + (issue85.file || '-') + " | " + issue85.issue + " | " + issue85.certainty + '\x20|');
            }
            issue83.push('');
          }
        }
        if(((analysis8.length) > (0))) {
          {
            issue83.push("### Security (" + analysis8.length + " issues)"), issue83.push(''), issue83.push("| File | Line | Issue | Certainty |"), issue83.push("|------|------|-------|-----------|");
            for(const issue86 of analysis8) {
              issue83.push('|\x20' + (issue86.file || '-') + " | " + (issue86.line || '-') + " | " + issue86.issue + " | " + issue86.certainty + '\x20|');
            }
            issue83.push('');
          }
        }
        if(((analysis9) === (0))) {
          issue83.push("No issues found."), issue83.push('');
        }
        return issue83.join('\x0a');
      }
    }
    function items24(items28, items29, items30, items31) {
      const items32 = {
      };
      items32.pqDKF = "Unrestricted Bash access", items32.KrLie = "Replace \"Bash\" with \"Bash(git:*)\" or specific scope";
      const items33 = items32;
      {
        const issue87 = [];
        issue87.push("## " + items28 + ':\x20' + (((items29.length) + (items30.length)) + (items31.length)) + " issues"), issue87.push('');
        const issue88 = [...items29.map(items34 =>({
          ...items34, 'category': "Tool"
        })), ...items30.map(entries6 =>({
          ...entries6, 'category': "Structure"
        })), ...items31.map(entries7 =>({
          ...entries7, 'category': "Security"
        }))], issue89 = {
        };
        issue89.HIGH = 0x0, issue89.MEDIUM = 0x1, issue89.LOW = 0x2;
        const issue90 = issue89;
        issue88.sort((issue91, issue92)=>issue90[issue91.certainty] - issue90[issue92.certainty]);
        if(((issue88.length) > (- 3914 + - 6156 + 0x2756))) {
          {
            issue87.push("| Category | Issue | Certainty |"), issue87.push("|----------|-------|-----------|");
            for(const issue93 of issue88) {
              issue87.push('|\x20' + issue93.category + " | " + issue93.issue + " | " + issue93.certainty + '\x20|');
            }
          }
        } else issue87.push("No issues found.");
        return issue87.join('\x0a');
      }
    }
    function analysis10(issue94, issue95) {
      return issue94.filter(issue96 =>issue96.certainty === issue95).length;
    }
    function generateDiff(issue97, issue98, issue99) {
      {
        const items35 = [];
        items35.push("```diff"), items35.push("--- a/" + issue99), items35.push("+++ b/" + issue99);
        const items36 = issue97.split('\x0a'), items37 = issue98.split('\x0a'), parts50 = Math.max(items36.length, items37.length);
        for(let items38 = 0;
        ((items38) < (parts50));
        items38++) {
          {
            const items39 = items36[items38], items40 = items37[items38];
            if(((items39) === (items40))) {
              if(((items39) !== (void(59 + 0x3b * - 1)))) {
                items35.push('\x20' + items39);
              }
            } else {
              if(((items39) !== (void(- 8110 + - 5055 * - 1 + 3055)))) {
                items35.push('-' + items39);
              }
              ((items40) !== (void(- 5175 + 0x221 * - 1 + 5720))) && items35.push('+' + items40);
            }
          }
        }
        return items35.push("```"), items35.join('\x0a');
      }
    }
    function generateSummaryReport(analysis11, items41 = {
    }) {
      const analysis12 = [];
      analysis12.push("# Plugin Analysis Summary"), analysis12.push('');
      analysis12.push("**Analyzed**: " + analysis11.length + " plugins"), analysis12.push("**Date**: " + new Date().toISOString()), analysis12.push('');
      let analysis13 = - 1 * - 2777 + - 3 * - 3250 + 0x30ef * - 1, items42 = 0x3ba + - 7844 + 6890, analysis14 = - 277 * - 24 + - 9268 + 0xa3c;
      for(const analysis15 of analysis11) {
        {
          const analysis16 = [...analysis15.toolIssues || [], ...analysis15.structureIssues || [], ...analysis15.securityIssues || []];
          analysis13 += (analysis10)((analysis16), ("HIGH")), items42 += (analysis10)((analysis16), ("MEDIUM")), analysis14 += (analysis10)((analysis16), ("LOW"));
        }
      }
      analysis12.push("## Overall"), analysis12.push(''), analysis12.push("| Certainty | Count |"), analysis12.push("|-----------|-------|"), analysis12.push("| HIGH | " + analysis13 + '\x20|'), analysis12.push("| MEDIUM | " + items42 + '\x20|');
      items41.verbose && analysis12.push("| LOW | " + analysis14 + '\x20|');
      analysis12.push(''), analysis12.push("## By Plugin"), analysis12.push(''), analysis12.push("| Plugin | HIGH | MEDIUM | LOW | Total |"), analysis12.push("|--------|------|--------|-----|-------|");
      for(const analysis17 of analysis11) {
        const analysis18 = [...analysis17.toolIssues || [], ...analysis17.structureIssues || [], ...analysis17.securityIssues || []], analysis19 = (analysis10)((analysis18), ("HIGH")), items43 = (analysis10)((analysis18), ("MEDIUM")), items44 = (analysis10)((analysis18), ("LOW"));
        analysis12.push('|\x20' + analysis17.pluginName + " | " + analysis19 + " | " + items43 + " | " + items44 + " | " + (((analysis19) + (items43)) + (items44)) + '\x20|');
      }
      return analysis12.push(''), analysis12.join('\x0a');
    }
    function generateAgentReport(analysis20, analysis21 = {
    }) {
      {
        const analysis22 = [];
        analysis22.push("# Agent Analysis: " + analysis20.agentName), analysis22.push(''), analysis22.push("**File**: " + analysis20.agentPath), analysis22.push("**Analyzed**: " + new Date().toISOString()), analysis22.push('');
        const analysis23 = [...analysis20.structureIssues || [], ...analysis20.toolIssues || [], ...analysis20.xmlIssues || [], ...analysis20.cotIssues || [], ...analysis20.exampleIssues || [], ...analysis20.antiPatternIssues || [], ...analysis20.crossPlatformIssues || []], analysis24 = (analysis10)((analysis23), ("HIGH")), analysis25 = (analysis10)((analysis23), ("MEDIUM")), analysis26 = (analysis10)((analysis23), ("LOW"));
        analysis22.push("## Summary"), analysis22.push(''), analysis22.push("| Certainty | Count |"), analysis22.push("|-----------|-------|"), analysis22.push("| HIGH | " + analysis24 + '\x20|'), analysis22.push("| MEDIUM | " + analysis25 + '\x20|');
        analysis21.verbose && (analysis22.push("| LOW | " + analysis26 + '\x20|'));
        analysis22.push('');
        if(analysis20.structureIssues && ((analysis20.structureIssues.length) > (0x13f * - 31 + 0x67c + - 2743 * - 3))) {
          analysis22.push("### Structure Issues (" + analysis20.structureIssues.length + ')'), analysis22.push(''), analysis22.push("| Issue | Fix | Certainty |"), analysis22.push("|-------|-----|-----------|");
          for(const analysis27 of analysis20.structureIssues) {
            analysis22.push('|\x20' + analysis27.issue + " | " + (analysis27.fix || "N/A") + " | " + analysis27.certainty + '\x20|');
          }
          analysis22.push('');
        }
        if(analysis20.toolIssues && ((analysis20.toolIssues.length) > (- 1 * - 197 + 0x241e + - 9443))) {
          {
            analysis22.push("### Tool Issues (" + analysis20.toolIssues.length + ')'), analysis22.push(''), analysis22.push("| Issue | Fix | Certainty |"), analysis22.push("|-------|-----|-----------|");
            for(const analysis28 of analysis20.toolIssues) {
              analysis22.push('|\x20' + analysis28.issue + " | " + (analysis28.fix || "N/A") + " | " + analysis28.certainty + '\x20|');
            }
            analysis22.push('');
          }
        }
        if(analysis20.xmlIssues && ((analysis20.xmlIssues.length) > (- 5697 + - 8746 + 14443))) {
          analysis22.push("### XML Structure Issues (" + analysis20.xmlIssues.length + ')'), analysis22.push(''), analysis22.push("| Issue | Fix | Certainty |"), analysis22.push("|-------|-----|-----------|");
          for(const analysis29 of analysis20.xmlIssues) {
            analysis22.push('|\x20' + analysis29.issue + " | " + (analysis29.fix || "N/A") + " | " + analysis29.certainty + '\x20|');
          }
          analysis22.push('');
        }
        if(analysis20.cotIssues && ((analysis20.cotIssues.length) > (- 5683 * - 1 + - 9844 + 4161))) {
          {
            analysis22.push("### Chain-of-Thought Issues (" + analysis20.cotIssues.length + ')'), analysis22.push(''), analysis22.push("| Issue | Fix | Certainty |"), analysis22.push("|-------|-----|-----------|");
            for(const analysis30 of analysis20.cotIssues) {
              analysis22.push('|\x20' + analysis30.issue + " | " + (analysis30.fix || "N/A") + " | " + analysis30.certainty + '\x20|');
            }
            analysis22.push('');
          }
        }
        if(analysis20.exampleIssues && ((analysis20.exampleIssues.length) > (- 6594 + - 314 * - 21))) {
          {
            analysis22.push("### Example Issues (" + analysis20.exampleIssues.length + ')'), analysis22.push(''), analysis22.push("| Issue | Fix | Certainty |"), analysis22.push("|-------|-----|-----------|");
            for(const analysis31 of analysis20.exampleIssues) {
              analysis22.push('|\x20' + analysis31.issue + " | " + (analysis31.fix || "N/A") + " | " + analysis31.certainty + '\x20|');
            }
            analysis22.push('');
          }
        }
        if(analysis20.antiPatternIssues && ((analysis20.antiPatternIssues.length) > (- 5 * - 47 + 0x19fd + - 6888))) {
          analysis22.push("### Anti-Pattern Issues (" + analysis20.antiPatternIssues.length + ')'), analysis22.push(''), analysis22.push("| Issue | Fix | Certainty |"), analysis22.push("|-------|-----|-----------|");
          for(const analysis32 of analysis20.antiPatternIssues) {
            analysis22.push('|\x20' + analysis32.issue + " | " + (analysis32.fix || "N/A") + " | " + analysis32.certainty + '\x20|');
          }
          analysis22.push('');
        }
        if(analysis20.crossPlatformIssues && ((analysis20.crossPlatformIssues.length) > (0))) {
          {
            analysis22.push("### Cross-Platform Issues (" + analysis20.crossPlatformIssues.length + ')'), analysis22.push(''), analysis22.push("| Issue | Fix | Certainty |"), analysis22.push("|-------|-----|-----------|");
            for(const analysis33 of analysis20.crossPlatformIssues) {
              analysis22.push('|\x20' + analysis33.issue + " | " + (analysis33.fix || "N/A") + " | " + analysis33.certainty + '\x20|');
            }
            analysis22.push('');
          }
        }
        return analysis22.join('\x0a');
      }
    }
    function generateAgentSummaryReport(analysis34, items45 = {
    }) {
      {
        const items46 = [];
        items46.push("# Agent Analysis Summary"), items46.push(''), items46.push("**Analyzed**: " + analysis34.length + " agents"), items46.push("**Date**: " + new Date().toISOString()), items46.push('');
        let analysis35 = 0x10b7 + - 4640 + 0x169, analysis36 = 756 + - 756, analysis37 = 10782 + - 10782;
        for(const analysis38 of analysis34) {
          const analysis39 = [...analysis38.structureIssues || [], ...analysis38.toolIssues || [], ...analysis38.xmlIssues || [], ...analysis38.cotIssues || [], ...analysis38.exampleIssues || [], ...analysis38.antiPatternIssues || [], ...analysis38.crossPlatformIssues || []];
          analysis35 += (analysis10)((analysis39), ("HIGH")), analysis36 += (analysis10)((analysis39), ("MEDIUM")), analysis37 += (analysis10)((analysis39), ("LOW"));
        }
        items46.push("## Overall"), items46.push(''), items46.push("| Certainty | Count |"), items46.push("|-----------|-------|"), items46.push("| HIGH | " + analysis35 + '\x20|'), items46.push("| MEDIUM | " + analysis36 + '\x20|');
        if(items45.verbose) {
          items46.push("| LOW | " + analysis37 + '\x20|');
        }
        items46.push(''), items46.push("## By Agent"), items46.push(''), items46.push("| Agent | HIGH | MEDIUM | LOW | Total |"), items46.push("|-------|------|--------|-----|-------|");
        for(const analysis40 of analysis34) {
          {
            const analysis41 = [...analysis40.structureIssues || [], ...analysis40.toolIssues || [], ...analysis40.xmlIssues || [], ...analysis40.cotIssues || [], ...analysis40.exampleIssues || [], ...analysis40.antiPatternIssues || [], ...analysis40.crossPlatformIssues || []], analysis42 = (analysis10)((analysis41), ("HIGH")), analysis43 = (analysis10)((analysis41), ("MEDIUM")), items47 = (analysis10)((analysis41), ("LOW"));
            items46.push('|\x20' + analysis40.agentName + " | " + analysis42 + " | " + analysis43 + " | " + items47 + " | " + (((analysis42) + (analysis43)) + (items47)) + '\x20|');
          }
        }
        return items46.push(''), items46.join('\x0a');
      }
    }
    function generateDocsReport(analysis44, items48 = {
    }) {
      const items49 = {
      };
      items49.gjWSx = "general";
      const items50 = items49;
      {
        const analysis45 = [];
        analysis45.push("# Documentation Analysis: " + analysis44.docName), analysis45.push(''), analysis45.push("**File**: " + analysis44.docPath), analysis45.push("**Mode**: " + (((analysis44.mode) === ('ai')) ? "AI-only (RAG optimized)": "Both audiences")), analysis45.push("**Token Count**: ~" + analysis44.tokenCount), analysis45.push("**Analyzed**: " + new Date().toISOString()), analysis45.push('');
        const analysis46 = [...analysis44.linkIssues || [], ...analysis44.structureIssues || [], ...analysis44.codeIssues || [], ...analysis44.efficiencyIssues || [], ...analysis44.ragIssues || [], ...analysis44.balanceIssues || []], items51 = (analysis10)((analysis46), ("HIGH")), items52 = (analysis10)((analysis46), ("MEDIUM")), items53 = (analysis10)((analysis46), ("LOW"));
        analysis45.push("## Summary"), analysis45.push(''), analysis45.push("| Certainty | Count |"), analysis45.push("|-----------|-------|"), analysis45.push("| HIGH | " + items51 + '\x20|'), analysis45.push("| MEDIUM | " + items52 + '\x20|');
        items48.verbose && analysis45.push("| LOW | " + items53 + '\x20|');
        analysis45.push('');
        if(analysis44.linkIssues && ((analysis44.linkIssues.length) > (1721 + - 1721))) {
          analysis45.push("### Link Issues (" + analysis44.linkIssues.length + ')'), analysis45.push(''), analysis45.push("| Issue | Fix | Certainty |"), analysis45.push("|-------|-----|-----------|");
          for(const analysis47 of analysis44.linkIssues) {
            analysis45.push('|\x20' + analysis47.issue + " | " + (analysis47.fix || "N/A") + " | " + analysis47.certainty + '\x20|');
          }
          analysis45.push('');
        }
        if(analysis44.structureIssues && ((analysis44.structureIssues.length) > (0x3 * - 1519 + 0x1307 + 0x2 * - 157))) {
          {
            analysis45.push("### Structure Issues (" + analysis44.structureIssues.length + ')'), analysis45.push(''), analysis45.push("| Issue | Fix | Certainty |"), analysis45.push("|-------|-----|-----------|");
            for(const analysis48 of analysis44.structureIssues) {
              analysis45.push('|\x20' + analysis48.issue + " | " + (analysis48.fix || "N/A") + " | " + analysis48.certainty + '\x20|');
            }
            analysis45.push('');
          }
        }
        if(analysis44.codeIssues && ((analysis44.codeIssues.length) > (- 3317 + - 727 + 0xfcc))) {
          {
            analysis45.push("### Code Block Issues (" + analysis44.codeIssues.length + ')'), analysis45.push(''), analysis45.push("| Issue | Fix | Certainty |"), analysis45.push("|-------|-----|-----------|");
            for(const issue100 of analysis44.codeIssues) {
              analysis45.push('|\x20' + issue100.issue + " | " + (issue100.fix || "N/A") + " | " + issue100.certainty + '\x20|');
            }
            analysis45.push('');
          }
        }
        if(analysis44.efficiencyIssues && ((analysis44.efficiencyIssues.length) > (- 5078 + - 721 * - 12 + - 3574))) {
          analysis45.push("### Efficiency Issues (" + analysis44.efficiencyIssues.length + ')'), analysis45.push(''), analysis45.push("| Issue | Fix | Certainty |"), analysis45.push("|-------|-----|-----------|");
          for(const issue101 of analysis44.efficiencyIssues) {
            analysis45.push('|\x20' + issue101.issue + " | " + (issue101.fix || "N/A") + " | " + issue101.certainty + '\x20|');
          }
          analysis45.push('');
        }
        if(analysis44.ragIssues && ((analysis44.ragIssues.length) > (- 179 * - 1 + - 6656 + 6477))) {
          analysis45.push("### RAG Optimization Issues (" + analysis44.ragIssues.length + ')'), analysis45.push(''), analysis45.push("| Issue | Fix | Certainty |"), analysis45.push("|-------|-----|-----------|");
          for(const issue102 of analysis44.ragIssues) {
            analysis45.push('|\x20' + issue102.issue + " | " + (issue102.fix || "N/A") + " | " + issue102.certainty + '\x20|');
          }
          analysis45.push('');
        }
        if(analysis44.balanceIssues && ((analysis44.balanceIssues.length) > (- 980 + - 3 * - 641 + - 943))) {
          {
            analysis45.push("### Balance Suggestions (" + analysis44.balanceIssues.length + ')'), analysis45.push(''), analysis45.push("| Issue | Fix | Certainty |"), analysis45.push("|-------|-----|-----------|");
            for(const issue103 of analysis44.balanceIssues) {
              analysis45.push('|\x20' + issue103.issue + " | " + (issue103.fix || "N/A") + " | " + issue103.certainty + '\x20|');
            }
            analysis45.push('');
          }
        }
        if(((analysis46.length) === (- 2979 + 0x6 * - 1099 + 9573))) {
          analysis45.push("No issues found."), analysis45.push('');
        }
        return analysis45.join('\x0a');
      }
    }
    function generateDocsSummaryReport(analysis49, items54 = {
    }) {
      {
        const items55 = [], items56 = analysis49[0x311 * - 5 + - 241 + 0x1046]?.["mode"] || "both";
        items55.push("# Documentation Analysis Summary"), items55.push(''), items55.push("**Analyzed**: " + analysis49.length + (" documents")), items55.push("**Mode**: " + (((items56) === ('ai')) ? "AI-only (RAG optimized)": "Both audiences")), items55.push("**Date**: " + new Date().toISOString()), items55.push('');
        let items57 = 0x57d * - 6 + - 442 + 8872, items58 = 2914 + - 2914, items59 = 0, items60 = - 5946 + - 61 * - 92 + 0x14e;
        for(const analysis50 of analysis49) {
          const analysis51 = [...analysis50.linkIssues || [], ...analysis50.structureIssues || [], ...analysis50.codeIssues || [], ...analysis50.efficiencyIssues || [], ...analysis50.ragIssues || [], ...analysis50.balanceIssues || []];
          items57 += (analysis10)((analysis51), ("HIGH")), items58 += (analysis10)((analysis51), ("MEDIUM")), items59 += (analysis10)((analysis51), ("LOW")), items60 += analysis50.tokenCount || 4604 + - 6713 * - 1 + - 11317;
        }
        items55.push("## Overall"), items55.push(''), items55.push("**Total Tokens**: ~" + items60), items55.push(''), items55.push("| Certainty | Count |"), items55.push("|-----------|-------|"), items55.push("| HIGH | " + items57 + '\x20|'), items55.push("| MEDIUM | " + items58 + '\x20|');
        if(items54.verbose) {
          items55.push("| LOW | " + items59 + '\x20|');
        }
        items55.push(''), items55.push("## By Document"), items55.push(''), items55.push("| Document | Tokens | HIGH | MEDIUM | LOW | Total |"), items55.push("|----------|--------|------|--------|-----|-------|");
        for(const analysis52 of analysis49) {
          {
            const analysis53 = [...analysis52.linkIssues || [], ...analysis52.structureIssues || [], ...analysis52.codeIssues || [], ...analysis52.efficiencyIssues || [], ...analysis52.ragIssues || [], ...analysis52.balanceIssues || []], items61 = (analysis10)((analysis53), ("HIGH")), items62 = (analysis10)((analysis53), ("MEDIUM")), items63 = (analysis10)((analysis53), ("LOW"));
            items55.push('|\x20' + analysis52.docName + " | " + analysis52.tokenCount + " | " + items61 + " | " + items62 + " | " + items63 + " | " + (((items61) + (items62)) + (items63)) + '\x20|');
          }
        }
        return items55.push(''), items55.join('\x0a');
      }
    }
    function generateProjectMemoryReport(analysis54, items64 = {
    }) {
      const items65 = {
      };
      items65.LPirP = "File not found", items65.UFUtN = "HIGH", items65.xlwJx = "file_not_found";
      const items66 = items65;
      const analysis55 = [];
      if(analysis54.error) {
        {
          analysis55.push("# Project Memory Analysis: Error"), analysis55.push(''), analysis55.push("**Error**: " + analysis54.error), analysis55.push('');
          if(analysis54.searchedPaths) {
            analysis55.push("Searched paths:");
            for(const items67 of analysis54.searchedPaths) {
              analysis55.push('-\x20' + items67);
            }
          }
          return analysis55.join('\x0a');
        }
      }
      analysis55.push("# Project Memory Analysis: " + analysis54.fileName), analysis55.push(''), analysis55.push("**File**: " + analysis54.filePath), analysis55.push("**Type**: " + (((analysis54.fileType) === ("agents")) ? "AGENTS.md (cross-platform)": "CLAUDE.md")), analysis55.push("**Analyzed**: " + new Date().toISOString()), analysis55.push('');
      if(analysis54.metrics) {
        {
          const items68 = "3|0|5|9|6|1|4|2|8|7".split('|');
          {
            analysis55.push("## Metrics");
            analysis55.push('');
            analysis55.push("| Metric | Value |");
            analysis55.push("|--------|-------|");
            analysis55.push("| Estimated Tokens | " + analysis54.metrics.estimatedTokens + '\x20|');
            analysis55.push("| Characters | " + analysis54.metrics.characterCount + '\x20|');
            analysis55.push("| Lines | " + analysis54.metrics.lineCount + '\x20|');
            analysis55.push("| Words | " + analysis54.metrics.wordCount + '\x20|');
            ((analysis54.metrics.readmeOverlap) !== (void(0x1498 + 0xc6 * - 11 + - 3094))) && analysis55.push("| README Overlap | " + Math.round(((analysis54.metrics.readmeOverlap) * (- 3793 + - 6270 + - 10163 * - 1))) + "% |");
            analysis55.push('');
          }
        }
      }
      const analysis56 = [...analysis54.structureIssues || [], ...analysis54.referenceIssues || [], ...analysis54.efficiencyIssues || [], ...analysis54.qualityIssues || [], ...analysis54.crossPlatformIssues || []], analysis57 = (analysis10)((analysis56), ("HIGH")), analysis58 = (analysis10)((analysis56), ("MEDIUM")), analysis59 = (analysis10)((analysis56), ("LOW"));
      analysis55.push("## Summary"), analysis55.push(''), analysis55.push("| Certainty | Count |"), analysis55.push("|-----------|-------|"), analysis55.push("| HIGH | " + analysis57 + '\x20|'), analysis55.push("| MEDIUM | " + analysis58 + '\x20|');
      items64.verbose && analysis55.push("| LOW | " + analysis59 + '\x20|');
      analysis55.push("| **Total** | **" + analysis56.length + "** |"), analysis55.push('');
      if(analysis54.structureIssues && ((analysis54.structureIssues.length) > (- 3100 + - 4552 + 7652))) {
        {
          analysis55.push("### Structure Issues (" + analysis54.structureIssues.length + ')'), analysis55.push(''), analysis55.push("| Issue | Fix | Certainty |"), analysis55.push("|-------|-----|-----------|");
          for(const analysis60 of analysis54.structureIssues) {
            analysis55.push('|\x20' + analysis60.issue + " | " + (analysis60.fix || "N/A") + " | " + analysis60.certainty + '\x20|');
          }
          analysis55.push('');
        }
      }
      if(analysis54.referenceIssues && ((analysis54.referenceIssues.length) > (13201 + - 13201))) {
        {
          analysis55.push("### Reference Issues (" + analysis54.referenceIssues.length + ')'), analysis55.push(''), analysis55.push("| Issue | Fix | Certainty |"), analysis55.push("|-------|-----|-----------|");
          for(const issue104 of analysis54.referenceIssues) {
            analysis55.push('|\x20' + issue104.issue + " | " + (issue104.fix || "N/A") + " | " + issue104.certainty + '\x20|');
          }
          analysis55.push('');
        }
      }
      if(analysis54.efficiencyIssues && ((analysis54.efficiencyIssues.length) > (0))) {
        {
          analysis55.push("### Efficiency Issues (" + analysis54.efficiencyIssues.length + ')'), analysis55.push(''), analysis55.push("| Issue | Fix | Certainty |"), analysis55.push("|-------|-----|-----------|");
          for(const issue105 of analysis54.efficiencyIssues) {
            analysis55.push('|\x20' + issue105.issue + " | " + (issue105.fix || "N/A") + " | " + issue105.certainty + '\x20|');
          }
          analysis55.push('');
        }
      }
      if(analysis54.qualityIssues && ((analysis54.qualityIssues.length) > (- 4350 + - 2988 + 7338))) {
        {
          analysis55.push("### Quality Issues (" + analysis54.qualityIssues.length + ')'), analysis55.push(''), analysis55.push("| Issue | Fix | Certainty |"), analysis55.push("|-------|-----|-----------|");
          for(const analysis61 of analysis54.qualityIssues) {
            analysis55.push('|\x20' + analysis61.issue + " | " + (analysis61.fix || "N/A") + " | " + analysis61.certainty + '\x20|');
          }
          analysis55.push('');
        }
      }
      if(analysis54.crossPlatformIssues && ((analysis54.crossPlatformIssues.length) > (- 494 + - 4693 + - 39 * - 133))) {
        analysis55.push("### Cross-Platform Issues (" + analysis54.crossPlatformIssues.length + ')'), analysis55.push(''), analysis55.push("| Issue | Fix | Certainty |"), analysis55.push("|-------|-----|-----------|");
        for(const analysis62 of analysis54.crossPlatformIssues) {
          analysis55.push('|\x20' + analysis62.issue + " | " + (analysis62.fix || "N/A") + " | " + analysis62.certainty + '\x20|');
        }
        analysis55.push('');
      }
      if(((analysis56.length) === (0x1824 + - 5153 + - 1027))) {
        analysis55.push("No issues found."), analysis55.push('');
      }
      return analysis55.join('\x0a');
    }
    function generateProjectMemorySummaryReport(analysis63, items69 = {
    }) {
      const writeFileAtomic0 = {
      };
      writeFileAtomic0.lhKCZ = "| Issue | Fix | Certainty |";
      writeFileAtomic0.AqqTG = "|-------|-----|-----------|", writeFileAtomic0.NwZub = "N/A";
      const writeFileAtomic1 = writeFileAtomic0;
      {
        const writeFileAtomic2 = [];
        writeFileAtomic2.push("# Project Memory Analysis Summary"), writeFileAtomic2.push(''), writeFileAtomic2.push("**Analyzed**: " + analysis63.length + " files"), writeFileAtomic2.push("**Date**: " + new Date().toISOString()), writeFileAtomic2.push('');
        let analysis64 = 9117 + - 9117, analysis65 = - 1927 + - 9870 + 0x2e15, writeFileAtomic3 = - 1876 * - 2 + 0x2176 + - 12318, writeFileAtomic4 = 7847 + - 9518 + 0x687;
        for(const analysis66 of analysis63) {
          if(analysis66.error)continue;
          const analysis67 = [...analysis66.structureIssues || [], ...analysis66.referenceIssues || [], ...analysis66.efficiencyIssues || [], ...analysis66.qualityIssues || [], ...analysis66.crossPlatformIssues || []];
          analysis64 += (analysis10)((analysis67), ("HIGH")), analysis65 += (analysis10)((analysis67), ("MEDIUM")), writeFileAtomic3 += (analysis10)((analysis67), ("LOW"));
          if(analysis66.metrics) {
            writeFileAtomic4 += analysis66.metrics.estimatedTokens || 5146 + 0x3e * - 83;
          }
        }
        writeFileAtomic2.push("## Overall"), writeFileAtomic2.push(''), writeFileAtomic2.push("| Metric | Value |"), writeFileAtomic2.push("|--------|-------|"), writeFileAtomic2.push("| Total Tokens | " + writeFileAtomic4 + '\x20|'), writeFileAtomic2.push("| HIGH Issues | " + analysis64 + '\x20|'), writeFileAtomic2.push("| MEDIUM Issues | " + analysis65 + '\x20|');
        items69.verbose && writeFileAtomic2.push("| LOW Issues | " + writeFileAtomic3 + '\x20|');
        writeFileAtomic2.push(''), writeFileAtomic2.push("## By File"), writeFileAtomic2.push(''), writeFileAtomic2.push("| File | Tokens | HIGH | MEDIUM | LOW | Total |"), writeFileAtomic2.push("|------|--------|------|--------|-----|-------|");
        for(const analysis68 of analysis63) {
          {
            if(analysis68.error) {
              {
                writeFileAtomic2.push('|\x20' + (analysis68.filePath || "Unknown") + (" | - | Error | - | - | - |"));
                continue;
              }
            }
            const analysis69 = [...analysis68.structureIssues || [], ...analysis68.referenceIssues || [], ...analysis68.efficiencyIssues || [], ...analysis68.qualityIssues || [], ...analysis68.crossPlatformIssues || []], analysis70 = (analysis10)((analysis69), ("HIGH")), analysis71 = (analysis10)((analysis69), ("MEDIUM")), writeFileAtomic5 = (analysis10)((analysis69), ("LOW")), writeFileAtomic6 = analysis68.metrics ?.["estimatedTokens"] || '-';
            writeFileAtomic2.push('|\x20' + analysis68.fileName + " | " + writeFileAtomic6 + " | " + analysis70 + " | " + analysis71 + " | " + writeFileAtomic5 + " | " + (((analysis70) + (analysis71)) + (writeFileAtomic5)) + '\x20|');
          }
        }
        return writeFileAtomic2.push(''), writeFileAtomic2.join('\x0a');
      }
    }
    function generatePromptReport(analysis72, writeFileAtomic7 = {
    }) {
      const analysis73 = [];
      analysis73.push("# Prompt Analysis: " + analysis72.promptName), analysis73.push(''), analysis73.push("**File**: " + analysis72.promptPath), analysis73.push("**Type**: " + (analysis72.promptType || "unknown")), analysis73.push("**Token Count**: ~" + analysis72.tokenCount), analysis73.push("**Analyzed**: " + new Date().toISOString()), analysis73.push('');
      const analysis74 = [...analysis72.clarityIssues || [], ...analysis72.structureIssues || [], ...analysis72.exampleIssues || [], ...analysis72.contextIssues || [], ...analysis72.outputIssues || [], ...analysis72.antiPatternIssues || [], ...analysis72.codeValidationIssues || []], analysis75 = (analysis10)((analysis74), ("HIGH")), writeFileAtomic8 = (analysis10)((analysis74), ("MEDIUM")), writeFileAtomic9 = (analysis10)((analysis74), ("LOW"));
      analysis73.push("## Summary");
      analysis73.push(''), analysis73.push("| Certainty | Count |"), analysis73.push("|-----------|-------|"), analysis73.push("| HIGH | " + analysis75 + '\x20|'), analysis73.push("| MEDIUM | " + writeFileAtomic8 + '\x20|');
      writeFileAtomic7.verbose && analysis73.push("| LOW | " + writeFileAtomic9 + '\x20|');
      analysis73.push('');
      if(analysis72.clarityIssues && ((analysis72.clarityIssues.length) > (4954 + - 4954))) {
        analysis73.push("### Clarity Issues (" + analysis72.clarityIssues.length + ')'), analysis73.push(''), analysis73.push("| Issue | Fix | Certainty |"), analysis73.push("|-------|-----|-----------|");
        for(const analysis76 of analysis72.clarityIssues) {
          analysis73.push('|\x20' + analysis76.issue + " | " + (analysis76.fix || "N/A") + " | " + analysis76.certainty + '\x20|');
        }
        analysis73.push('');
      }
      if(analysis72.structureIssues && ((analysis72.structureIssues.length) > (8755 + - 8755))) {
        analysis73.push("### Structure Issues (" + analysis72.structureIssues.length + ')'), analysis73.push(''), analysis73.push("| Issue | Fix | Certainty |"), analysis73.push("|-------|-----|-----------|");
        for(const analysis77 of analysis72.structureIssues) {
          analysis73.push('|\x20' + analysis77.issue + " | " + (analysis77.fix || "N/A") + " | " + analysis77.certainty + '\x20|');
        }
        analysis73.push('');
      }
      if(analysis72.exampleIssues && ((analysis72.exampleIssues.length) > (- 3 * - 2454 + 0xb62 * - 2 + - 1534))) {
        {
          analysis73.push("### Example Issues (" + analysis72.exampleIssues.length + ')'), analysis73.push(''), analysis73.push("| Issue | Fix | Certainty |"), analysis73.push("|-------|-----|-----------|");
          for(const analysis78 of analysis72.exampleIssues) {
            analysis73.push('|\x20' + analysis78.issue + " | " + (analysis78.fix || "N/A") + " | " + analysis78.certainty + '\x20|');
          }
          analysis73.push('');
        }
      }
      if(analysis72.contextIssues && ((analysis72.contextIssues.length) > (- 1 * - 3329 + 0x2f * - 181 + 0x143a))) {
        {
          analysis73.push("### Context Issues (" + analysis72.contextIssues.length + ')'), analysis73.push(''), analysis73.push("| Issue | Fix | Certainty |"), analysis73.push("|-------|-----|-----------|");
          for(const issue106 of analysis72.contextIssues) {
            analysis73.push('|\x20' + issue106.issue + " | " + (issue106.fix || "N/A") + " | " + issue106.certainty + '\x20|');
          }
          analysis73.push('');
        }
      }
      if(analysis72.outputIssues && ((analysis72.outputIssues.length) > (0x709 * - 1 + 0x11a9 + - 2720))) {
        analysis73.push("### Output Format Issues (" + analysis72.outputIssues.length + ')'), analysis73.push(''), analysis73.push("| Issue | Fix | Certainty |"), analysis73.push("|-------|-----|-----------|");
        for(const analysis79 of analysis72.outputIssues) {
          analysis73.push('|\x20' + analysis79.issue + " | " + (analysis79.fix || "N/A") + " | " + analysis79.certainty + '\x20|');
        }
        analysis73.push('');
      }
      if(analysis72.antiPatternIssues && ((analysis72.antiPatternIssues.length) > (0x26b9 + - 199 * - 43 + - 18470))) {
        {
          analysis73.push("### Anti-Pattern Issues (" + analysis72.antiPatternIssues.length + ')'), analysis73.push(''), analysis73.push("| Issue | Fix | Certainty |"), analysis73.push("|-------|-----|-----------|");
          for(const analysis80 of analysis72.antiPatternIssues) {
            analysis73.push('|\x20' + analysis80.issue + " | " + (analysis80.fix || "N/A") + " | " + analysis80.certainty + '\x20|');
          }
          analysis73.push('');
        }
      }
      if(analysis72.codeValidationIssues && ((analysis72.codeValidationIssues.length) > (- 3804 + - 185 * - 9 + 2139))) {
        {
          analysis73.push("### Code Validation Issues (" + analysis72.codeValidationIssues.length + ')'), analysis73.push(''), analysis73.push("| Issue | Fix | Certainty |"), analysis73.push("|-------|-----|-----------|");
          for(const issue107 of analysis72.codeValidationIssues) {
            analysis73.push('|\x20' + issue107.issue + " | " + (issue107.fix || "N/A") + " | " + issue107.certainty + '\x20|');
          }
          analysis73.push('');
        }
      }
      if(((analysis74.length) === (5963 + - 3549 + - 2414))) {
        analysis73.push("No issues found."), analysis73.push('');
      }
      return analysis73.join('\x0a');
    }
    function generatePromptSummaryReport(analysis81, items80 = {
    }) {
      {
        const items81 = [];
        items81.push("# Prompt Analysis Summary"), items81.push(''), items81.push("**Analyzed**: " + analysis81.length + " prompts"), items81.push("**Date**: " + new Date().toISOString()), items81.push('');
        let analysis82 = 10075 + - 10075, items82 = - 1985 + 0x3ad * - 9 + 0x28d6, items83 = 0x34c + - 7771 + 0x1b0f, items84 = 0x1 * - 8041 + 0x22a9 + - 832;
        for(const analysis83 of analysis81) {
          const analysis84 = [...analysis83.clarityIssues || [], ...analysis83.structureIssues || [], ...analysis83.exampleIssues || [], ...analysis83.contextIssues || [], ...analysis83.outputIssues || [], ...analysis83.antiPatternIssues || [], ...analysis83.codeValidationIssues || []];
          analysis82 += (analysis10)((analysis84), ("HIGH")), items82 += (analysis10)((analysis84), ("MEDIUM")), items83 += (analysis10)((analysis84), ("LOW")), items84 += analysis83.tokenCount || 0;
        }
        items81.push("## Overall"), items81.push(''), items81.push("**Total Tokens**: ~" + items84), items81.push(''), items81.push("| Certainty | Count |"), items81.push("|-----------|-------|"), items81.push("| HIGH | " + analysis82 + '\x20|'), items81.push("| MEDIUM | " + items82 + '\x20|');
        items80.verbose && items81.push("| LOW | " + items83 + '\x20|');
        items81.push(''), items81.push("## By Prompt"), items81.push(''), items81.push("| Prompt | Type | Tokens | HIGH | MEDIUM | LOW | Total |"), items81.push("|--------|------|--------|------|--------|-----|-------|");
        for(const analysis85 of analysis81) {
          {
            const analysis86 = [...analysis85.clarityIssues || [], ...analysis85.structureIssues || [], ...analysis85.exampleIssues || [], ...analysis85.contextIssues || [], ...analysis85.outputIssues || [], ...analysis85.antiPatternIssues || [], ...analysis85.codeValidationIssues || []], analysis87 = (analysis10)((analysis86), ("HIGH")), items85 = (analysis10)((analysis86), ("MEDIUM")), items86 = (analysis10)((analysis86), ("LOW"));
            items81.push('|\x20' + analysis85.promptName + " | " + (analysis85.promptType || '-') + " | " + analysis85.tokenCount + " | " + analysis87 + " | " + items85 + " | " + items86 + " | " + (((analysis87) + (items85)) + (items86)) + '\x20|');
          }
        }
        return items81.push(''), items81.join('\x0a');
      }
    }
    function generateOrchestratorReport(issue108, items87 = {
    }) {
      {
        const {
          verbose: verbose = false, showAutoFixable: showAutoFixable = false, targetPath: targetPath = '.'
        }
        = items87, issue110 = [];
        issue110.push("# Enhancement Analysis Report"), issue110.push(''), issue110.push("**Target**: " + targetPath), issue110.push("**Analyzed**: " + new Date().toISOString()), issue110.push("**Enhancers Run**: " + (Object.keys(issue108 ?.["byEnhancer"] || {
        }).join(',\x20') || "none")), issue110.push('');
        const issue111 = Array.isArray(issue108 ?.["findings"]) ? issue108.findings: [], issue112 = (deduplicateOrchestratorFindings)((issue111)), issue113 = issue112.filter(issue114 =>issue114.certainty === "HIGH" && issue114.autoFixable).length;
        issue110.push("## Executive Summary"), issue110.push(''), issue110.push("| Enhancer | HIGH | MEDIUM | LOW | Auto-Fixable |"), issue110.push("|----------|------|--------|-----|--------------|");
        const issue115 = ["plugin", "agent", "claudemd", "docs", "prompt", "hooks", "skills"];
        let items88 = 0x1c4d + - 8762 + - 1517 * - 1, items89 = 730 + - 730, items90 = - 1 * - 8218 + 0x3d8 + 0x2b * - 214, items91 = - 9404 + - 7668 + 0x42b0;
        for(const issue116 of issue115) {
          const issue117 = issue112.filter(issue118 =>issue118.source === issue116), issue119 = issue117.filter(issue120 =>issue120.certainty === "HIGH").length, issue121 = issue117.filter(issue122 =>issue122.certainty === "MEDIUM").length, issue123 = issue117.filter(issue124 =>issue124.certainty === "LOW").length, issue125 = issue117.filter(issue126 =>issue126.certainty === "HIGH" && issue126.autoFixable).length;
          if(((issue119) > (- 6063 + 0x1 * - 5536 + 0x2d4f)) || ((issue121) > (0x443 * - 3 + 247 + - 2 * - 1513)) || ((issue123) > (- 9135 + 0x1 * - 447 + 9582))) {
            {
              const items92 = "4|1|0|2|3".split('|');
              {
                issue110.push('|\x20' + issue116 + " | " + issue119 + " | " + issue121 + " | " + issue123 + " | " + issue125 + '\x20|');
                items88 += issue119;
                items89 += issue121;
                items90 += issue123;
                items91 += issue125;
              }
            }
          }
        }
        issue110.push("| **Total** | **" + items88 + "** | **" + items89 + "** | **" + items90 + "** | **" + items91 + "** |"), issue110.push('');
        if(items87.autoLearned && ((items87.autoLearned.length) > (2853 + 0x13d * - 9))) {
          {
            issue110.push("## Auto-Learned Suppressions"), issue110.push(''), issue110.push("Learned " + items87.autoLearned.length + (" new false positives:")), issue110.push('');
            const issue127 = {
            };
            items87.autoLearned.forEach(issue128 => {
              const issue129 = {
              };
              issue129.AsHmw = "N/A";
              const issue130 = issue129;
              !issue127[issue128.patternId] && (issue127[issue128.patternId] = []), issue127[issue128.patternId].push(issue128);
            });
            for(const[issue131, issue132]of Object.entries(issue127)) {
              const items93 = Math.max(...issue132.map(items94 =>items94.confidence || 0x1d2c + 0x10fc * - 2 + - 1 * - 1228));
              issue110.push("- **" + issue131 + "**: " + issue132.length + (" file(s) (confidence: ") + ((items93) * (0x16 * - 206 + 0x37 * - 109 + 10627)).toFixed(0x6d0 + - 2165 + 421) + '%)');
            }
            issue110.push('');
          }
        }
        if(((issue112.length) === (0x889 + - 213 * - 3 + 0x161 * - 8))) {
          {
            const items95 = "0|3|1|2|4".split('|');
            {
              issue110.push("## Status: Clean");
              issue110.push('');
              issue110.push("No issues found.");
              issue110.push('');
              return issue110.join('\x0a');
            }
          }
        }
        issue110.push("---"), issue110.push('');
        const issue133 = issue112.filter(issue134 =>issue134.certainty === "HIGH");
        if(((issue133.length) > (- 4982 + - 7716 + 0x319a))) {
          issue110.push("## HIGH Certainty Issues (" + issue133.length + ')'), issue110.push(''), issue110.push("Issues that should be fixed. Auto-fixable issues marked with [AF]."), issue110.push('');
          const items96 = (items97)((issue133));
          for(const[items98, pattern11]of Object.entries(items96)) {
            {
              issue110.push("### " + (items99)((items98)) + (" Issues (") + pattern11.length + ')'), issue110.push(''), issue110.push("| File | Line | Issue | Fix | [AF] |"), issue110.push("|------|------|-------|-----|------|");
              for(const issue135 of pattern11) {
                {
                  const issue136 = issue135.autoFixable ? "Yes": 'No', issue137 = issue135.line || '-';
                  issue110.push('|\x20' + (issue135.file || '-') + " | " + issue137 + " | " + issue135.issue + " | " + (issue135.fix || '-') + " | " + issue136 + '\x20|');
                }
              }
              issue110.push('');
            }
          }
          issue110.push("---"), issue110.push('');
        }
        const issue138 = issue112.filter(issue139 =>issue139.certainty === "MEDIUM");
        if(((issue138.length) > (8392 + - 1 * - 4065 + 0x30a9 * - 1))) {
          {
            issue110.push("## MEDIUM Certainty Issues (" + issue138.length + ')'), issue110.push(''), issue110.push("Issues that likely need attention. Verify context before fixing."), issue110.push('');
            const items100 = (items97)((issue138));
            for(const[items101, items102]of Object.entries(items100)) {
              {
                issue110.push("### " + (items99)((items101)) + (" Issues (") + items102.length + ')'), issue110.push(''), issue110.push("| File | Line | Issue | Fix |"), issue110.push("|------|------|-------|-----|");
                for(const issue140 of items102) {
                  {
                    const issue141 = issue140.line || '-';
                    issue110.push('|\x20' + (issue140.file || '-') + " | " + issue141 + " | " + issue140.issue + " | " + (issue140.fix || '-') + '\x20|');
                  }
                }
                issue110.push('');
              }
            }
            issue110.push("---"), issue110.push('');
          }
        }
        const issue142 = issue112.filter(issue143 =>issue143.certainty === "LOW");
        if(verbose && ((issue142.length) > (- 4589 * - 1 + - 1537 + - 3052))) {
          issue110.push("## LOW Certainty Issues (" + issue142.length + ')'), issue110.push(''), issue110.push("Advisory suggestions. Consider based on project needs."), issue110.push('');
          const items103 = (items97)((issue142));
          for(const[items104, items105]of Object.entries(items103)) {
            {
              issue110.push("### " + (items99)((items104)) + (" Issues (") + items105.length + ')'), issue110.push(''), issue110.push("| File | Line | Issue | Fix |"), issue110.push("|------|------|-------|-----|");
              for(const issue144 of items105) {
                const issue145 = issue144.line || '-';
                issue110.push('|\x20' + (issue144.file || '-') + " | " + issue145 + " | " + issue144.issue + " | " + (issue144.fix || '-') + '\x20|');
              }
              issue110.push('');
            }
          }
          issue110.push("---"), issue110.push('');
        }
        if(showAutoFixable && ((issue113) > (0))) {
          {
            issue110.push("## Auto-Fix Summary"), issue110.push(''), issue110.push('**' + issue113 + (" issues can be automatically fixed** with `--apply` flag:")), issue110.push(''), issue110.push("| Enhancer | Issue Type | Count |"), issue110.push("|----------|------------|-------|");
            const issue146 = issue112.filter(issue147 =>issue147.certainty === "HIGH" && issue147.autoFixable), issue148 = {
            };
            for(const issue149 of issue146) {
              {
                const pattern12 = issue149.source + '|' + (issue149.category || "general");
                if(!issue148[pattern12]) {
                  {
                    const pattern13 = {
                    };
                    pattern13.source = issue149.source, pattern13.category = issue149.category || "general", pattern13.count = 0x0, issue148[pattern12] = pattern13;
                  }
                }
                issue148[pattern12].count++;
              }
            }
            for(const pattern14 of Object.values(issue148)) {
              issue110.push('|\x20' + pattern14.source + " | " + pattern14.category + " | " + pattern14.count + '\x20|');
            }
            issue110.push("| **Total** | | **" + issue113 + "** |"), issue110.push(''), issue110.push("Run `/enhance --apply` to fix these automatically."), issue110.push('');
          }
        }
        return issue110.join('\x0a');
      }
    }
    function deduplicateOrchestratorFindings(issue150) {
      {
        const issue151 = new Map();
        for(const issue152 of issue150) {
          const issue153 = [issue152.file || '', issue152.line || 0xc4a + 0x1 * - 8969 + 0x16bf, (issue152.issue || '').toLowerCase().trim()].join('|');
          if(!issue151.has(issue153)) {
            {
              const result30 = {
                ...issue152
              };
              result30.sources = [issue152.source], issue151.set(issue153, result30);
            }
          } else {
            const pattern15 = issue151.get(issue153);
            !pattern15.sources.includes(issue152.source) && pattern15.sources.push(issue152.source), issue152.autoFixable && false && (pattern15.autoFixable = true);
          }
        }
        return Array.from(issue151.values());
      }
    }
    function items97(entry5) {
      const result31 = {
      };
      result31.OsUkv = "N/A";
      const entry6 = result31;
      {
        const items106 = {
        };
        for(const items107 of entry5) {
          {
            const items108 = items107.source || "unknown";
            if(!items106[items108])items106[items108] = [];
            items106[items108].push(items107);
          }
        }
        return items106;
      }
    }
    function items99(value727) {
      {
        if(!value727)return '';
        return((value727.charAt(- 1397 * - 6 + - 289 + 0x1 * - 8093).toUpperCase()) + (value727.slice(- 4674 + - 356 * - 2 + - 1 * - 3963)));
      }
    }
    const result32 = {
    };
    result32.generateReport = generateGenericReport, result32.generateDiff = generateDiff, result32.generateSummaryReport = generateSummaryReport, result32.generateAgentReport = generateAgentReport, result32.generateAgentSummaryReport = generateAgentSummaryReport, result32.generateDocsReport = generateDocsReport, result32.generateDocsSummaryReport = generateDocsSummaryReport, result32.generateProjectMemoryReport = generateProjectMemoryReport, result32.generateProjectMemorySummaryReport = generateProjectMemorySummaryReport, result32.generatePromptReport = generatePromptReport, result32.generatePromptSummaryReport = generatePromptSummaryReport, result32.generateOrchestratorReport = generateOrchestratorReport, result32.deduplicateOrchestratorFindings = deduplicateOrchestratorFindings, moduleRecord7.exports = result32;
  }
}),
fs = require('fs'),
path = require("path");
var {
  agentPatterns
}
= require_agent_patterns();
function parseMarkdownFrontmatter(content) {
  if(!content || typeof content !== "string")return {
    frontmatter: null, body: content
  };
  const trimmed = content.trim();
  if(!trimmed.startsWith("---"))return {
    frontmatter: null, body: content
  };
  const lines = trimmed.split("\n");
  let closingDelimiter = - 1;
  for(let index = 1;
  index < lines.length;
  index++) {
    if(lines[index].trim() === "---") {
      closingDelimiter = index;
      break;
    }
  }
  if(closingDelimiter === - 1)return {
    frontmatter: null, body: content
  };
  const frontmatter = {
  };
  for(const line of lines.slice(1, closingDelimiter)) {
    const separator = line.indexOf(":");
    if(separator > 0) {
      const key = line.substring(0, separator).trim();
      const value = line.substring(separator + 1).trim();
      frontmatter[key] = value;
    }
  }
  return {
    frontmatter, body: lines.slice(closingDelimiter + 1).join("\n")
  };
}
function analyzeAgent(agentPath,
options = {
}) {
  const result = {
    agentName: path.basename(agentPath, ".md"), agentPath, frontmatter: null, structureIssues: [], toolIssues: [], xmlIssues: [], cotIssues: [], exampleIssues: [], antiPatternIssues: [], crossPlatformIssues: [],
  };
  if(!fs.existsSync(agentPath)) {
    result.structureIssues.push({
      issue: "File not found", file: agentPath, certainty: "HIGH", patternId: "file_not_found"
    });
    return result;
  }
  let content;
  try {
    content = fs.readFileSync(agentPath, "utf8");
  } catch(error) {
    result.structureIssues.push({
      issue: "Failed to read file: " + error.message, file: agentPath, certainty: "HIGH", patternId: "read_error"
    });
    return result;
  }
  result.frontmatter = parseMarkdownFrontmatter(content).frontmatter;
  const addIssue = (patternId, input, destination, includeFilePath = false)=> {
    const pattern = agentPatterns[patternId];
    const issue = pattern.check(input);
    if(!issue)return;
    destination.push({
      ...issue, file: agentPath, ...(includeFilePath ? {
        filePath: agentPath
      }
      : {
      }), certainty: pattern.certainty, patternId: pattern.id,
    });
  };
  addIssue("missing_frontmatter", content, result.structureIssues);
  if(result.frontmatter) {
    addIssue("missing_name", result.frontmatter, result.structureIssues);
    addIssue("missing_description", result.frontmatter, result.structureIssues);
    addIssue("unrestricted_tools", result.frontmatter, result.toolIssues);
    addIssue("unrestricted_bash", result.frontmatter, result.toolIssues, true);
  }
  addIssue("missing_role", content, result.structureIssues, true);
  addIssue("missing_output_format", content, result.structureIssues);
  addIssue("missing_constraints", content, result.structureIssues);
  const addUnlessLow = (patternId, destination)=> {
    const pattern = agentPatterns[patternId];
    const issue = pattern.check(content);
    if(issue && (options.verbose || pattern.certainty !== "LOW")) {
      destination.push({
        ...issue, file: agentPath, certainty: pattern.certainty, patternId: pattern.id
      });
    }
  };
  addUnlessLow("missing_xml_structure", result.xmlIssues);
  addUnlessLow("unnecessary_cot", result.cotIssues);
  addUnlessLow("missing_cot", result.cotIssues);
  if(options.verbose)addIssue("example_count_suboptimal", content, result.exampleIssues);
  addUnlessLow("vague_instructions", result.antiPatternIssues);
  if(options.verbose)addIssue("prompt_bloat", content, result.antiPatternIssues);
  for(const patternId of["hardcoded_claude_dir", "claude_md_reference", "no_xml_for_data"]) {
    if(agentPatterns[patternId])addUnlessLow(patternId, result.crossPlatformIssues);
  }
  return result;
}
function analyzeAllAgents(agentsDir,
options = {
}) {
  if(!fs.existsSync(agentsDir))return[];
  return fs.readdirSync(agentsDir).filter(fileName =>fileName.endsWith(".md") && fileName !== "README.md").map(fileName =>analyzeAgent(path.join(agentsDir, fileName), options));
}
function analyze(options = {
}) {
  const {
    agent, agentsDir = "plugins/enhance/agents", verbose = false
  }
  = options;
  if(!agent)return analyzeAllAgents(agentsDir, {
    verbose
  });
  const fileName = agent.endsWith(".md") ? agent: agent + ".md";
  return analyzeAgent(path.join(agentsDir, fileName), {
    verbose
  });
}
function applyFixes(analysis,
options = {
}) {
  const fixer = require_fixer();
  const issueGroups = ["structureIssues", "toolIssues", "xmlIssues", "cotIssues", "exampleIssues", "antiPatternIssues", "crossPlatformIssues", ];
  const analyses = Array.isArray(analysis) ? analysis: [analysis];
  const issues = analyses.flatMap(item =>issueGroups.flatMap(group =>item[group] || []));
  return fixer.applyFixes(issues, options);
}
function generateReport(analysis,
options = {
}) {
  const reporter = require_reporter();
  return Array.isArray(analysis) ? reporter.generateAgentSummaryReport(analysis, options): reporter.generateAgentReport(analysis, options);
}
module.exports = {
  parseMarkdownFrontmatter, analyzeAgent, analyzeAllAgents, analyze, applyFixes, generateReport,
};
