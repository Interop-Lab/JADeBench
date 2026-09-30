'use strict';
var __getOwnPropNames=Object["getOwnPropertyNames"], __commonJS=(input, input2)=>function helper() {
  const record= {
  };
  return record["exports"]= {
  }, (input2||(0, input[((__getOwnPropNames)((input)))[0]])((input2=record)["exports"], input2), input2["exports"]);
}, require_github=__commonJS( {
  '../work/agent-sh__agentsys/lib/collectors/github.js'(input3, input22) {
    'use strict';
    var {
      execFileSync: childProcess
    }
    =((require)(("child_process"))), DEFAULT_OPTIONSExport= {
      'issueLimit': 0x64, 'prLimit': 0x32, 'milestoneLimit': 0x64, 'timeout': 0x2710, 'cwd': process["cwd"]()
    };
    function execGh(args, options= {
    }) {
      const result=((helper2)((args), (options)));
      return result['ok']?result["data"]: null;
    }
    function helper2(input4, options2= {
    }) {
       {
        try {
          const value=((childProcess)(('gh'), (input4), ( {
            'encoding': "utf8", 'stdio': "pipe", 'timeout': options2["timeout"]||10000, 'cwd': options2["cwd"]||DEFAULT_OPTIONSExport["cwd"]
          })));
          try {
            return {
              'ok': true, 'data': JSON["parse"](value)
            };
          }
          catch(error) {
            return {
              'ok': false, 'error':  {
                'type': "parse", 'message': "Failed to parse gh output as JSON: "+error["message"], 'raw': value["slice"](0, 500)
              }
            };
          }
        }
        catch(error2) {
          return {
            'ok': false, 'error':  {
              'type': error2["killed"]?"timeout": "process", 'message': error2["message"], 'exitCode': error2["status"]??null, 'stderr': error2["stderr"]?((String)((error2["stderr"])))["trim"](): ''
            }
          };
        }
      }
    }
    function isGhAvailable() {
       {
        try {
           {
            return((childProcess)(('gh'), (["auth", "status"]), ( {
              'encoding': "utf8", 'stdio': "pipe", 'timeout': 0x1388
            }))), true;
          }
        }
        catch {
          return false;
        }
      }
    }
    function summarizeIssue(issue) {
      return {
        'number': issue["number"], 'title': issue["title"], 'labels': (issue["labels"]||[])["map"](input5=>input5["name"]||input5), 'milestone': issue["milestone"]?.["title"]||issue["milestone"]||null, 'createdAt': issue["createdAt"], 'updatedAt': issue["updatedAt"], 'snippet': issue["body"]?((issue["body"]["slice"](0, 200)["replace"](/\n/g, '\x20')["trim"]())+(((issue["body"]["length"])>(200))?"...": '')): ''
      };
    }
    function summarizePR(pullRequest) {
       {
        return {
          'number': pullRequest["number"], 'title': pullRequest["title"], 'labels': (pullRequest["labels"]||[])["map"](input6=>input6["name"]||input6), 'isDraft': pullRequest["isDraft"], 'createdAt': pullRequest["createdAt"], 'updatedAt': pullRequest["updatedAt"], 'files': pullRequest["files"]||[], 'snippet': pullRequest["body"]?((pullRequest["body"]["slice"](0, 150)["replace"](/\n/g, '\x20')["trim"]())+(((pullRequest["body"]["length"])>(150))?"...": '')): ''
        };
      }
    }
    function categorizeIssues(analysis, issues) {
       {
         {
          const record2= {
          };
          record2["bug"]="bugs", record2["type: bug"]="bugs", record2["feature"]="features", record2["type: feature"]="features", record2["enhancement"]="enhancements", record2["security"]="security", record2["type: security"]="security";
          const value2=record2, value3=Object["entries"](value2)["map"](([input7, input8])=>( {
            'regex': new RegExp("(^|[^a-z])"+input7["replace"](/[.*+?^${}()|[\]\\]/g, "\\$&")+("([^a-z]|$)"), 'i'), 'category': input8
          }));
          for(const item of issues) {
             {
               {
                const value4=(item["labels"]||[])["map"](input9=>(input9["name"]||input9)["toLowerCase"]());
                let value5=false;
                const record3= {
                };
                record3["number"]=item["number"], record3["title"]=item["title"];
                const value6=record3;
                for(const {
                  regex: value7, category: value8
                }
                of value3) {
                   {
                     {
                      if(value4["some"](input10=>value7["test"](input10))) {
                        analysis["categorized"][value8]["push"](value6), value5=true;
                        break;
                      }
                    }
                  }
                }
                !value5&&((true)?analysis["categorized"]["other"]["push"](value6): _0x4b4f1f["push"]("filename"));
              }
            }
          }
        }
      }
    }
    function findStaleItems(analysis2, items, days) {
       {
         {
          const date=new Date();
          date["setDate"](((date["getDate"]())-(days)));
          for(const item2 of items) {
             {
               {
                const date2=new Date(item2["updatedAt"]);
                if(((date2)<(date))) {
                   {
                    analysis2["stale"]["push"]( {
                      'number': item2["number"], 'title': item2["title"], 'lastUpdated': item2["updatedAt"], 'daysStale': Math["floor"]((((Date["now"]())-(date2))/(86400000)))
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
    function extractThemes(analysis3, issues2) {
       {
         {
          const record4= {
          }, set=new Set(["the", 'a', 'an', 'is', "are", 'to', "for", 'in', 'on', 'at', "with", "and", 'or', 'of']);
          for(const item3 of issues2) {
            const value9=(item3["title"]||'')["toLowerCase"]()["split"](/\s+/);
            for(const items2 of value9) {
               {
                 {
                  if(((items2["length"])>(3))&&!set["has"](items2)) {
                     {
                      record4[items2]=((record4[items2]||0)+(1));
                    }
                  }
                }
              }
            }
          }
          analysis3["themes"]=Object["entries"](record4)["filter"](([, input11])=>input11>1)["sort"]((input12, input23)=>input23[1]-input12[1])["slice"](0, 10)["map"](([input13, input14])=>( {
            'word': input13, 'count': input14
          }));
        }
      }
    }
    function findOverdueMilestones(analysis4) {
      const date3=new Date();
      analysis4["overdueMilestones"]=analysis4["milestones"]["filter"](input15=> {
        if(!input15["due_on"]||((input15["state"])===("closed")))return false;
        return((new Date(input15["due_on"]))<(date3));
      });
    }
    function scanGitHubState(options3= {
    }) {
       {
         {
          const record5= {
            ...DEFAULT_OPTIONSExport, ...options3
          }, value10=record5, record6= {
          };
          record6["issueCount"]=0x0, record6["prCount"]=0x0, record6["milestoneCount"]=0x0;
          const record7= {
          };
          record7["requestedLimit"]=value10["issueLimit"], record7["fetchedCount"]=0x0, record7["hasMore"]=false;
          const record8= {
          };
          record8["requestedLimit"]=value10["prLimit"], record8["fetchedCount"]=0x0, record8["hasMore"]=false;
          const record9= {
          };
          record9["requestedLimit"]=value10["milestoneLimit"], record9["fetchedCount"]=0x0, record9["hasMore"]=false;
          const record10= {
          };
          record10["issues"]=record7, record10["prs"]=record8, record10["milestones"]=record9;
          const record11= {
          };
          record11["bugs"]=[], record11["features"]=[], record11["security"]=[], record11["enhancements"]=[], record11["other"]=[];
          const record12= {
          };
          record12["available"]=false, record12["partial"]=false, record12["errors"]=[], record12["summary"]=record6, record12["issues"]=[], record12["prs"]=[], record12["milestones"]=[], record12["overdueMilestones"]=[], record12["pagination"]=record10, record12["categorized"]=record11, record12["stale"]=[], record12["themes"]=[];
          const result2=record12;
          if(!((isGhAvailable)())) {
             {
              return result2["error"]="gh CLI not available or not authenticated", result2;
            }
          }
          result2["available"]=true;
          const result3=((helper2)((["issue", "list", "--state", "open", "--json", "number,title,labels,milestone,createdAt,updatedAt,body", "--limit", ((String)((value10["issueLimit"])))]), (value10)));
          if(result3['ok']&&Array["isArray"](result3["data"])) {
            const items3=result3["data"];
            result2["issues"]=items3["map"](summarizeIssue), result2["summary"]["issueCount"]=items3["length"], result2["pagination"]["issues"]["fetchedCount"]=items3["length"], result2["pagination"]["issues"]["hasMore"]=((value10["issueLimit"])>(0))&&((items3["length"])>=(value10["issueLimit"])), ((categorizeIssues)((result2), (items3))), ((findStaleItems)((result2), (items3), (90))), ((extractThemes)((result2), (items3)));
          }
          else {
            if(!result3['ok']) {
               {
                 {
                  const record13= {
                    'source': "issues", ...result3["error"]
                  };
                  result2["errors"]["push"](record13);
                }
              }
            }
          }
          const result4=((helper2)((['pr', "list", "--state", "open", "--json", "number,title,labels,isDraft,createdAt,updatedAt,body,files", "--limit", ((String)((value10["prLimit"])))]), (value10)));
          if(result4['ok']&&Array["isArray"](result4["data"])) {
             {
               {
                const items4=result4["data"];
                result2["prs"]=items4["map"](summarizePR), result2["summary"]["prCount"]=items4["length"], result2["pagination"]["prs"]["fetchedCount"]=items4["length"], result2["pagination"]["prs"]["hasMore"]=((value10["prLimit"])>(0))&&((items4["length"])>=(value10["prLimit"]));
              }
            }
          }
          else {
            if(!result4['ok']) {
               {
                 {
                  const record14= {
                    'source': "prs", ...result4["error"]
                  };
                  result2["errors"]["push"](record14);
                }
              }
            }
          }
          const result5=((helper2)((["api", "repos/{owner}/{repo}/milestones", "--paginate", "--slurp"]), (value10)));
          if(result5['ok']&&Array["isArray"](result5["data"])) {
            const value11=result5["data"], items5=value11["flatMap"](input16=>Array["isArray"](input16)?input16: []), items6=items5["map"](item4=>( {
              'title': item4["title"], 'state': item4["state"], 'due_on': item4["due_on"], 'open_issues': item4["open_issues"], 'closed_issues': item4["closed_issues"]
            }));
            result2["pagination"]["milestones"]["fetchedCount"]=items6["length"], result2["pagination"]["milestones"]["hasMore"]=((value10["milestoneLimit"])>(0))&&((items6["length"])>(value10["milestoneLimit"])), result2["milestones"]=items6["slice"](0, value10["milestoneLimit"]), result2["summary"]["milestoneCount"]=result2["milestones"]["length"], ((findOverdueMilestones)((result2)));
          }
          else {
            if(!result5['ok']) {
               {
                 {
                  const record15= {
                    'source': "milestones", ...result5["error"]
                  };
                  result2["errors"]["push"](record15);
                }
              }
            }
          }
          result2["partial"]=((result2["errors"]["length"])>(0));
          if(result2["partial"]&&!result2["error"]) {
             {
              result2["error"]="Partial GitHub data collected";
            }
          }
          return result2;
        }
      }
    }
    const record16= {
    };
    record16["DEFAULT_OPTIONS"]=DEFAULT_OPTIONSExport;
    record16["scanGitHubState"]=scanGitHubState, record16["isGhAvailable"]=isGhAvailable, record16["execGh"]=execGh, record16["summarizeIssue"]=summarizeIssue, record16["summarizePR"]=summarizePR, record16["categorizeIssues"]=categorizeIssues, record16["findStaleItems"]=findStaleItems, record16["extractThemes"]=extractThemes, record16["findOverdueMilestones"]=findOverdueMilestones;
    input22["exports"]=record16;
  }
}), require_documentation=__commonJS( {
  '../work/agent-sh__agentsys/lib/collectors/documentation.js'(input17, input24) {
    'use strict';
    var fs=((require)(('fs'))), path=((require)(("path"))), DEFAULT_OPTIONSExport2= {
      'depth': "thorough", 'cwd': process["cwd"]()
    };
    function isPathSafe(filePath, baseDir) {
      const value12=path["resolve"](baseDir, filePath);
      return value12["startsWith"](path["resolve"](baseDir));
    }
    function safeReadFile(filePath2, baseDir2) {
      const value13=path["resolve"](baseDir2, filePath2);
      if(!((isPathSafe)((filePath2), (baseDir2))))return null;
      try {
         {
          return fs["readFileSync"](value13, "utf8");
        }
      }
      catch {
         {
          return null;
        }
      }
    }
    function analyzeMarkdownFile(filePath3, options4) {
       {
         {
          const items7=filePath3["match"](/^##\s{1,1000}(.+)$/gm)||[], items8=items7["slice"](0, 10)["map"](input18=>input18["replace"](/^##\s+/, '')), value14=items8["map"](input19=>input19["toLowerCase"]())["join"]('\x20');
          return {
            'path': options4, 'sectionCount': items7["length"], 'sections': items8, 'hasInstallation': /install|setup|getting.started/i["test"](value14), 'hasUsage': /usage|how.to|example/i["test"](value14), 'hasApi': /api|reference|methods/i["test"](value14), 'hasTesting': /test|spec|coverage/i["test"](value14), 'codeBlocks': Math["floor"]((((filePath3["match"](/```/g)||[])["length"])/(2))), 'wordCount': filePath3["split"](/\s+/)["length"]
          };
        }
      }
    }
    function extractCheckboxes(input20, input25) {
       {
         {
          const value15=(input25["match"](/^[-*]\s+\[x\]/gim)||[])["length"], value16=(input25["match"](/^[-*]\s+\[\s\]/gim)||[])["length"];
          input20["checkboxes"]["checked"]+=value15, input20["checkboxes"]["unchecked"]+=value16, input20["checkboxes"]["total"]+=((value15)+(value16));
        }
      }
    }
    function extractFeatures(input21, input26) {
       {
         {
          const value17=/^[-*]\s{1,100}\*{0,2}([^\n]{1,2000}?)\*{0,2}(?:\s{0,100}[-–]\s{0,100}([^\n]{1,2000}))?$/gm;
          let value18;
          while(((value18=value17["exec"](input26))!==(null))&&((input21["features"]["length"])<(20))) {
             {
               {
                const items9=value18[1]["trim"]();
                ((items9["length"])>(5))&&((items9["length"])<(80))&&((false)?(_0x58a39c["isStale"]=true, _0x375bc["reason"]="Marked stale by hook"): input21["features"]["push"](items9));
              }
            }
          }
          input21["features"]=[...new Set(input21["features"])]["slice"](0, 20);
        }
      }
    }
    function extractPlans(input27, input28) {
      const items10=[/(?:TODO|FIXME|PLAN):\s*(.+)/gi, /^##\s+(?:Roadmap|Future|Planned|Coming Soon)/gim];
      for(const value19 of items10) {
         {
           {
            let value20;
            while(((value20=value19["exec"](input28))!==(null))&&((input27["plans"]["length"])<(15))) {
               {
                 {
                  const value21=(value20[1]||value20[0])["slice"](0, 100);
                  input27["plans"]["push"](value21);
                }
              }
            }
          }
        }
      }
    }
    function identifyDocGaps(input29) {
      const value22=input29["files"]["README.md"];
      if(!value22) {
         {
           {
            const record17= {
            };
            record17["type"]="missing", record17["file"]="README.md", record17["severity"]="high", input29["gaps"]["push"](record17);
          }
        }
      }
      else {
         {
           {
            if(!value22["hasInstallation"]) {
               {
                 {
                  const record18= {
                  };
                  record18["type"]="missing-section", record18["file"]="README.md", record18["section"]="Installation", record18["severity"]="medium", input29["gaps"]["push"](record18);
                }
              }
            }
            if(!value22["hasUsage"]) {
              const record19= {
              };
              record19["type"]="missing-section", record19["file"]="README.md", record19["section"]="Usage", record19["severity"]="medium", input29["gaps"]["push"](record19);
            }
          }
        }
      }
      if(!input29["files"]["CHANGELOG.md"]) {
        const record20= {
        };
        record20["type"]="missing", record20["file"]="CHANGELOG.md", record20["severity"]="low", input29["gaps"]["push"](record20);
      }
    }
    function analyzeDocumentation(options5= {
    }) {
       {
         {
          const record21= {
            ...DEFAULT_OPTIONSExport2, ...options5
          }, options6=record21, value23=options6["cwd"], record22= {
          };
          record22["fileCount"]=0x0, record22["totalWords"]=0x0;
          const record23= {
          };
          record23["total"]=0x0, record23["checked"]=0x0, record23["unchecked"]=0x0;
          const record24= {
          };
          record24["summary"]=record22, record24["files"]= {
          }, record24["features"]=[], record24["plans"]=[], record24["checkboxes"]=record23, record24["gaps"]=[];
          const value24=record24, items11=["README.md", "PLAN.md", "CLAUDE.md", "AGENTS.md", "CONTRIBUTING.md", "CHANGELOG.md", "docs/README.md", "docs/PLAN.md"];
          for(const value25 of items11) {
             {
               {
                const value26=((safeReadFile)((value25), (value23)));
                if(value26) {
                  const value27=((analyzeMarkdownFile)((value26), (value25)));
                  value24["files"][value25]=value27, value24["summary"]["totalWords"]+=value27["wordCount"], ((extractCheckboxes)((value24), (value26))), ((extractFeatures)((value24), (value26))), ((extractPlans)((value24), (value26)));
                }
              }
            }
          }
          if(((options6["depth"])===("thorough"))) {
             {
               {
                const value28=path["join"](value23, "docs");
                if(fs["existsSync"](value28))try {
                   {
                     {
                      const value29=fs["readdirSync"](value28)["filter"](input30=>input30["endsWith"](".md")&&!items11["includes"]("docs/"+input30));
                      for(const value30 of value29["slice"](0, 5)) {
                         {
                           {
                            const value31="docs/"+value30, value32=((safeReadFile)((value31), (value23)));
                            if(value32) {
                              const value33=((analyzeMarkdownFile)((value32), (value31)));
                              value24["files"][value31]=value33, value24["summary"]["totalWords"]+=value33["wordCount"];
                            }
                          }
                        }
                      }
                    }
                  }
                }
                catch {
                }
              }
            }
          }
          return value24["summary"]["fileCount"]=Object["keys"](value24["files"])["length"], ((identifyDocGaps)((value24))), value24;
        }
      }
    }
    const record25= {
    };
    record25["DEFAULT_OPTIONS"]=DEFAULT_OPTIONSExport2, record25["analyzeDocumentation"]=analyzeDocumentation, record25["analyzeMarkdownFile"]=analyzeMarkdownFile, record25["safeReadFile"]=safeReadFile, record25["isPathSafe"]=isPathSafe, record25["extractCheckboxes"]=extractCheckboxes, record25["extractFeatures"]=extractFeatures, record25["extractPlans"]=extractPlans, record25["identifyDocGaps"]=identifyDocGaps, input24["exports"]=record25;
  }
}), require_fs_safe=__commonJS( {
  '../work/agent-sh__agentsys/lib/utils/fs-safe.js'(input31, input210) {
    'use strict';
    var fs2=((require)(('fs')));
    function readFileWithLimit(input32, input211, input33="utf8") {
       {
         {
          const value34=fs2["openSync"](input32, 'r');
          try {
             {
               {
                const value35=fs2["fstatSync"](value34);
                if(!value35["isFile"]()) {
                   {
                     {
                      const error3=new Error("Not a regular file: "+input32);
                      error3["code"]="ENOTFILE";
                      throw error3;
                    }
                  }
                }
                if(((typeof input211)===("number"))&&((value35["size"])>(input211))) {
                  const error4=new Error("File too large: "+value35["size"]+" \u003e "+input211+" bytes");
                  error4["code"]="EFBIG";
                  throw error4;
                }
                return fs2["readFileSync"](value34, input33);
              }
            }
          }
          finally {
            (false)?_0x5ab9fa["push"](_0x2c88be): fs2["closeSync"](value34);
          }
        }
      }
    }
    const record26= {
    };
    record26["readFileWithLimit"]=readFileWithLimit, input210["exports"]=record26;
  }
}), require_codebase=__commonJS( {
  '../work/agent-sh__agentsys/lib/collectors/codebase.js'(input34, input212) {
    'use strict';
    var fs3=((require)(('fs'))), path2=((require)(("path"))),  {
      readFileWithLimit: value36
    }
    =((require_fs_safe)()), DEFAULT_OPTIONSExport3= {
      'depth': "thorough", 'cwd': process["cwd"]()
    }, number=50000, EXCLUDE_DIRS=["node_modules", "vendor", "dist", "build", "out", "target", ".git", ".svn", ".hg", "__pycache__", ".pytest_cache", "coverage", ".nyc_output", ".next", ".nuxt", ".cache"];
    const record27= {
    };
    record27['js']=[".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"], record27["rust"]=[".rs"], record27['go']=[".go"], record27["python"]=[".py"], record27["java"]=[".java"];
    var SOURCE_EXTENSIONS=record27;
    function safeReadFileExport(input35, input213) {
       {
         {
          const value37=path2["resolve"](input213, input35), value38=path2["resolve"](input213);
          if(!value37["startsWith"](value38))return null;
          try {
             {
              return fs3["readFileSync"](value37, "utf8");
            }
          }
          catch {
            return null;
          }
        }
      }
    }
    function shouldExclude(input36, input214=EXCLUDE_DIRS) {
      const value39=input36["split"](/[\\/]/);
      return value39["some"](input37=>input214["includes"](input37));
    }
    function detectFrameworks(input38, input215) {
       {
         {
          const record28= {
            ...input215["dependencies"], ...input215["devDependencies"]
          }, value40=record28, record29= {
          };
          record29["react"]="React", record29["react-dom"]="React", record29["next"]="Next.js", record29["vue"]="Vue.js", record29["nuxt"]="Nuxt", record29["angular"]="Angular", record29["express"]="Express", record29["fastify"]="Fastify", record29["koa"]="Koa", record29["nestjs"]="NestJS";
          const value41=record29;
          for(const[value42, value43]of Object["entries"](value41)) {
            value40[value42]&&input38["frameworks"]["push"](value43);
          }
          input38["frameworks"]=[...new Set(input38["frameworks"])];
        }
      }
    }
    function detectTestFramework(input39, input216) {
      const record30= {
        ...input216["dependencies"], ...input216["devDependencies"]
      }, value44=record30;
      const items12=["jest", "mocha", "vitest", "ava", "tap", "jasmine"];
      for(const value45 of items12) {
         {
           {
            if(value44[value45]) {
              input39["testFramework"]=value45, input39["health"]["hasTests"]=true;
              break;
            }
          }
        }
      }
    }
    function extractSymbols(input40) {
      const record31= {
      };
      record31["functions"]=[], record31["classes"]=[], record31["exports"]=[];
      const value46=record31, value47=/(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
      let value48;
      while(((value48=value47["exec"](input40))!==(null))) {
         {
          value46["functions"]["push"](value48[1]);
        }
      }
      const value49=/(?:const|let)\s{1,1000}([a-zA-Z_$][a-zA-Z0-9_$]*)\s{0,1000}=\s{0,1000}(?:async\s{0,1000})?\([^)]{0,2000}\)\s{0,1000}=>/g;
      while(((value48=value49["exec"](input40))!==(null))) {
        value46["functions"]["push"](value48[1]);
      }
      const value50=/class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
      while(((value48=value50["exec"](input40))!==(null))) {
        value46["classes"]["push"](value48[1]);
      }
      const value51=/export\s+(?:(?:async\s+)?function|class|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
      while(((value48=value51["exec"](input40))!==(null))) {
         {
          value46["exports"]["push"](value48[1]);
        }
      }
      const value52=/module\.exports\s{0,1000}=\s{0,1000}\{([^}]{1,100000})\}/, value53=input40["match"](value52);
      if(value53) {
         {
           {
            const items13=value53[1]["split"](',')["map"](input41=>input41["trim"]()["split"](':')[0]["trim"]());
            value46["exports"]["push"](...items13["filter"](input42=>input42&&/^[a-zA-Z_$]/["test"](input42)));
          }
        }
      }
      return value46["functions"]=[...new Set(value46["functions"])], value46["classes"]=[...new Set(value46["classes"])], value46["exports"]=[...new Set(value46["exports"])], value46;
    }
    function scanFileSymbols(input43, items14) {
       {
         {
          const record32= {
          }, items15=["lib", "src", "app", "pages", "components", "utils", "services", "api"], value54=items14["filter"](input44=>items15["includes"](input44)), value55=Object["values"](SOURCE_EXTENSIONS)["flat"]();
          let number2=0;
          const number3=40;
          function helper3(input45, input217, input310=0) {
             {
               {
                if((((number2))>=((number3)))||(((input310))>((2))))return;
                if(!fs3["existsSync"](input45))return;
                try {
                  const record33= {
                  };
                  record33["withFileTypes"]=true;
                  const value56=fs3["readdirSync"](input45, record33);
                  for(const value57 of value56) {
                     {
                       {
                        if((((number2))>=((number3))))break;
                        const value58=path2["join"](input45, value57["name"]), value59=input217?input217+'/'+value57["name"]: value57["name"];
                        if(value57["isDirectory"]()) {
                           {
                             {
                              if(["node_modules", "__tests__", "test", "tests", "dist", "build"]["includes"](value57["name"]))continue;
                              (((helper3))(((value58)), ((value59)), ((((input310))+((1))))));
                            }
                          }
                        }
                        else {
                          if(value57["isFile"]()) {
                             {
                               {
                                const value60=path2["extname"](value57["name"]);
                                if(!value55["includes"](value60))continue;
                                if(value57["name"]["includes"](".test.")||value57["name"]["includes"](".spec."))continue;
                                try {
                                   {
                                     {
                                      const value61=(((value36))(((value58)), ((number)))), value62=(((extractSymbols))(((value61))));
                                      (value62["functions"]["length"]||value62["classes"]["length"]||value62["exports"]["length"])&&(record32[value59]=value62, number2++);
                                    }
                                  }
                                }
                                catch {
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
                catch {
                }
              }
            }
          }
          for(const value63 of value54) {
             {
               {
                if(((number2)>=(number3)))break;
                ((helper3)((path2["join"](input43, value63)), (value63)));
              }
            }
          }
          return record32;
        }
      }
    }
    function scanDirectory(input47, input218, input311, input48, input52=0) {
       {
         {
          if(((input52)>=(input48)))return;
          const value64=path2["join"](input218, input311);
          if(!fs3["existsSync"](value64))return;
          try {
             {
               {
                const record34= {
                };
                record34["withFileTypes"]=true;
                const value65=fs3["readdirSync"](value64, record34), items16=[], items17=[];
                for(const value66 of value65) {
                   {
                     {
                      if(value66["isDirectory"]())!EXCLUDE_DIRS["includes"](value66["name"])&&items16["push"](value66["name"]);
                      else {
                         {
                          items17["push"](value66["name"]);
                        }
                      }
                    }
                  }
                }
                const value67=((input311)||('.')), record35= {
                };
                record35["dirs"]=items16, record35["fileCount"]=items17["length"], input47["structure"][value67]=record35;
                for(const value68 of items17) {
                  const value69=path2["extname"](value68)["toLowerCase"]()||"no-ext";
                  input47["fileStats"][value69]=((input47["fileStats"][value69]||0)+(1));
                }
                for(const value70 of items16) {
                   {
                    ((scanDirectory)((input47), (input218), (path2["join"](input311, value70)), (input48), ((input52)+(1))));
                  }
                }
              }
            }
          }
          catch {
          }
        }
      }
    }
    function detectHealth(input49, input219) {
      input49["health"]["hasReadme"]=fs3["existsSync"](path2["join"](input219, "README.md"));
      const items18=[".eslintrc", ".eslintrc.js", ".eslintrc.json", "eslint.config.js", "biome.json"];
      input49["health"]["hasLinting"]=items18["some"](input50=>fs3["existsSync"](path2["join"](input219, input50)));
      const items19=[".github/workflows", ".gitlab-ci.yml", ".circleci", "Jenkinsfile", ".travis.yml"];
      input49["health"]["hasCi"]=items19["some"](input51=>fs3["existsSync"](path2["join"](input219, input51)));
      const items20=["tests", "__tests__", "test", "spec"];
      input49["health"]["hasTests"]=input49["health"]["hasTests"]||items20["some"](input53=>fs3["existsSync"](path2["join"](input219, input53)));
    }
    function findImplementedFeatures(input54, input220) {
       {
         {
          const record36= {
          };
          record36["authentication"]=["auth", "login", "session", "jwt", "oauth"], record36["api"]=["routes", "controllers", "handlers", "endpoints"], record36["database"]=["models", "schemas", "migrations", "seeds"], record36['ui']=["components", "views", "pages", "layouts"], record36["testing"]=["__tests__", "test", "spec", ".test.", ".spec."], record36["docs"]=["docs", "documentation", "wiki"];
          const value71=record36;
          for(const[value72, value73]of Object["entries"](value71)) {
            const value74=value73["some"](input55=> {
               {
                 {
                  for(const value75 of Object["keys"](input54["structure"])) {
                    if(value75["toLowerCase"]()["includes"](input55))return true;
                  }
                  return false;
                }
              }
            });
            value74&&((true)?input54["implementedFeatures"]["push"](value72): ((_0x200fd8)((_0x4902ea["message"]))));
          }
        }
      }
    }
    function scanCodebase(options7= {
    }) {
      const record37= {
      };
      record37["Gusxh"]=".codex";
      const record38= {
        ...DEFAULT_OPTIONSExport3, ...options7
      }, options8=record38;
      const value76=options8["cwd"], record39= {
      };
      record39["totalDirs"]=0x0, record39["totalFiles"]=0x0;
      const record40= {
      };
      record40["hasTests"]=false, record40["hasLinting"]=false, record40["hasCi"]=false;
      record40["hasReadme"]=false;
      const record41= {
      };
      record41["summary"]=record39, record41["topLevelDirs"]=[], record41["frameworks"]=[], record41["testFramework"]=null, record41["hasTypeScript"]=false, record41["implementedFeatures"]=[], record41["symbols"]= {
      }, record41["health"]=record40, record41["fileStats"]= {
      };
      const value77=record41, record42= {
      }, value78=((safeReadFileExport)(("package.json"), (value76)));
      if(value78)try {
         {
           {
            const value79=JSON["parse"](value78);
            ((detectFrameworks)((value77), (value79))), ((detectTestFramework)((value77), (value79)));
          }
        }
      }
      catch {
      }
      value77["hasTypeScript"]=fs3["existsSync"](path2["join"](value76, "tsconfig.json"));
      const record43= {
      };
      record43["structure"]=record42, record43["fileStats"]=value77["fileStats"], ((scanDirectory)((record43), (value76), (''), (((options8["depth"])===("thorough"))?3: 2))), value77["summary"]["totalDirs"]=Object["keys"](record42)["length"], value77["summary"]["totalFiles"]=Object["values"](record42)["reduce"]((input56, input221)=>input56+(input221["fileCount"]||0), 0);
      const value80=record42['.'];
      if(value80) {
         {
          value77["topLevelDirs"]=value80["dirs"]||[];
        }
      }
      ((detectHealth)((value77), (value76)));
      if(((options8["depth"])===("thorough"))) {
         {
           {
            const record44= {
              ...value77
            };
            record44["structure"]=record42, ((findImplementedFeatures)((record44), (value76))), value77["symbols"]=((scanFileSymbols)((value76), (value77["topLevelDirs"])));
          }
        }
      }
      const value81=Object["entries"](value77["fileStats"])["sort"]((input57, input222)=>input222[1]-input57[1])["slice"](0, 10);
      return value77["fileStats"]=Object["fromEntries"](value81), value77;
    }
    const record45= {
    };
    record45["DEFAULT_OPTIONS"]=DEFAULT_OPTIONSExport3, record45["EXCLUDE_DIRS"]=EXCLUDE_DIRS, record45["SOURCE_EXTENSIONS"]=SOURCE_EXTENSIONS, record45["scanCodebase"]=scanCodebase, record45["detectFrameworks"]=detectFrameworks, record45["detectTestFramework"]=detectTestFramework, record45["detectHealth"]=detectHealth, record45["findImplementedFeatures"]=findImplementedFeatures, record45["extractSymbols"]=extractSymbols;
    record45["scanFileSymbols"]=scanFileSymbols, record45["scanDirectory"]=scanDirectory, record45["shouldExclude"]=shouldExclude, record45["safeReadFile"]=safeReadFileExport, input212["exports"]=record45;
  }
}), require_version=__commonJS( {
  '../work/agent-sh__agentsys/lib/binary/version.js'(input58, input223) {
    'use strict';
    const record46= {
    };
    record46["PATXP"]="0|3|2|4|1", record46["vqrKB"]="agent-analyzer", record46["vGpTO"]="0.3.0";
    record46["ZCFqi"]="agent-sh/agent-analyzer";
    const value82=record46, value83=value82["PATXP"]["split"]('|');
    let number4=0;
    while(true) {
      switch(value83[number4++]) {
        case'0': 'use strict';
        continue;
        case'1': const record47= {
        };
        record47["ANALYZER_MIN_VERSION"]=ANALYZER_MIN_VERSION, record47["BINARY_NAME"]=BINARY_NAME, record47["GITHUB_REPO"]=GITHUB_REPO, input223["exports"]=record47;
        continue;
        case'2': var BINARY_NAME=value82["vqrKB"];
        continue;
        case'3': var ANALYZER_MIN_VERSION=value82["vGpTO"];
        continue;
        case'4': var GITHUB_REPO=value82["ZCFqi"];
        continue;
      }
      break;
    }
  }
}), require_binary=__commonJS( {
  '../work/agent-sh__agentsys/lib/binary/index.js'(input59, input224) {
    'use strict';
    var fs4=((require)(('fs'))), path3=((require)(("path"))), os=((require)(('os'))), https=((require)(("https"))), childProcess2=((require)(("child_process"))), crypto=((require)(("crypto"))),  {
      promisify: util
    }
    =((require)(("util"))), value84=((util)((childProcess2["execFile"]))), number5=(268435456),  {
      ANALYZER_MIN_VERSION: value85, BINARY_NAME: value86, GITHUB_REPO: value87
    }
    =((require_version)());
    const record48= {
    };
    record48["darwin-arm64"]="aarch64-apple-darwin", record48["darwin-x64"]="x86_64-apple-darwin", record48["linux-x64"]="x86_64-unknown-linux-gnu", record48["linux-arm64"]="aarch64-unknown-linux-gnu", record48["win32-x64"]="x86_64-pc-windows-msvc";
    var PLATFORM_MAP=record48;
    function getBinaryPath() {
       {
         {
          const value88=((process["platform"])===("win32"))?".exe": '';
          return path3["join"](os["homedir"](), ".agent-sh", "bin", ((value86)+(value88)));
        }
      }
    }
    function getPlatformKey() {
      const record49= {
      };
      record49["uXGYH"]="prs";
       {
         {
          const value89=(((process["platform"])+('-'))+(process["arch"]));
          return PLATFORM_MAP[value89]||null;
        }
      }
    }
    function meetsMinimumVersion(input60, input225) {
      if(!input60)return false;
      const value90=input60["match"](/^(\d+)\.(\d+)\.(\d+)/);
      if(!value90)return false;
      const value91=value90["slice"](1)["map"](Number), value92=input225["split"]('.')["map"](Number);
      if(((value91[0])>(value92[0])))return true;
      if(((value91[0])<(value92[0])))return false;
      if(((value91[1])>(value92[1])))return true;
      if(((value91[1])<(value92[1])))return false;
      return((value91[2])>=(value92[2]));
    }
    function getVersion() {
      const value93=((getBinaryPath)());
      if(!fs4["existsSync"](value93))return null;
      try {
         {
           {
            const value94=childProcess2["execFileSync"](value93, ["--version"],  {
              'timeout': 0x1388, 'encoding': "utf8", 'stdio': ["pipe", "pipe", "pipe"], 'windowsHide': true
            }), value95=value94["trim"]()["match"](/(\d+\.\d+\.\d+)/);
            return value95?value95[1]: value94["trim"]();
          }
        }
      }
      catch(error5) {
        return null;
      }
    }
    function isAvailable() {
      const value96=((getBinaryPath)());
      if(!fs4["existsSync"](value96))return false;
      const value97=((getVersion)());
      return((meetsMinimumVersion)((value97), (value85)));
    }
    async function isAvailableAsync() {
      return((isAvailable)());
    }
    function buildDownloadUrl(input61, input226) {
       {
         {
          const value98=((process["platform"])===("win32"))?".zip": ".tar.gz";
          return((((((((("https://github.com/")+(value87))+("/releases/download/v"))+(input61))+('/'))+(value86))+('-'))+(input226))+(value98));
        }
      }
    }
    function helper4(input62) {
      return new Promise(function(input63, input227) {
        const value99=process.env.GITHUB_TOKEN||process.env.GH_TOKEN;
        function helper5(input64, input228) {
          if((((input228))>((5)))) {
             {
               {
                (((input227))(((new Error(((("Too many redirects fetching from "))+((input62))))))));
                return;
              }
            }
          }
          const record50= {
          };
          record50["User-Agent"]="agent-core/binary-resolver", record50["Accept"]="application/octet-stream";
          const value100=record50;
          if(value99)value100["Authorization"]=((("Bearer "))+((value99)));
          const record51= {
          };
          record51["headers"]=value100, https["get"](input64, record51, function(input65) {
             {
               {
                const value101=input65["statusCode"];
                if(((((value101))===((301))))||((((value101))===((302))))||((((value101))===((307))))||((((value101))===((308))))) {
                  input65["resume"](), ((((helper5)))((((input65["headers"]["location"]))), (((((input228))+((1)))))));
                  return;
                }
                if(((((value101))!==((200))))) {
                  input65["resume"]();
                  const value102=((((value101))===((403))))?" (rate limited - set GITHUB_TOKEN env var)": '';
                  ((((input227)))((((new Error((((((((((((("HTTP "))+((value101)))))+(((value102))))))+(((" fetching "))))))+(((input64))))))))));
                  return;
                }
                const items22=[];
                input65['on']("data", function(input66) {
                   {
                    items22["push"](input66);
                  }
                }), input65['on']("end", function() {
                   {
                    ((((input63))(((Buffer["concat"](items22))))));
                  }
                }), input65['on']("error", input227);
              }
            }
          })['on']("error", input227);
        }
        (((helper5))(((input62)), ((0))));
      });
    }
    function parseSha256Sidecar(input67) {
       {
         {
          if(((typeof input67)!==("string")))input67=((String)(((input67)||(''))));
          const value103=input67["trim"]()["match"](/^([A-Fa-f0-9]{64})\b/);
          if(!value103) {
             {
              throw new Error("Could not parse SHA-256 digest from sidecar body");
            }
          }
          return value103[1]["toLowerCase"]();
        }
      }
    }
    async function helper6(input68) {
       {
         {
          const value104=((input68)+(".sha256")), value105=await((helper4)((value104)));
          return((parseSha256Sidecar)((value105["toString"]("utf8"))));
        }
      }
    }
    function sha256Hex(input69) {
      const record52= {
      };
      record52["lmhlT"]="parse";
      return(true)?crypto["createHash"]("sha256")["update"](input69)["digest"]("hex"):  {
        'ok': false, 'error':  {
          'type': oEsoaC["lmhlT"], 'message': "Failed to parse gh output as JSON: "+_0x16a509["message"], 'raw': _0x5c8bbb["slice"](0, 500)
        }
      };
    }
    function verifySha256(input70, input229, input312) {
       {
         {
          const value106=((String)(((input229)||(''))))["toLowerCase"](), value107=((sha256Hex)((input70)));
          if(((value106)!==(value107)))throw new Error(((((((("SHA-256 verification failed for ")+(input312))+(": expected "))+(value106))+(", got "))+(value107))+(". This could indicate a tampered release. Do not extract.")));
        }
      }
    }
    function assertSafeArchiveEntry(input71) {
       {
         {
          if(!input71||((typeof input71)!==("string")))throw new Error("Refusing to extract archive with empty entry name");
          const items23=input71["replace"](/\\/g, '/')["trim"]();
          if(((items23["length"])===(0))) {
             {
              throw new Error("Refusing to extract archive with empty entry name");
            }
          }
          if(items23["startsWith"]('//'))throw new Error((("Refusing to extract archive with UNC entry: ")+(input71)));
          if(items23["startsWith"]('/'))throw new Error((("Refusing to extract archive with absolute entry: ")+(input71)));
          if(/^[A-Za-z]:[\\/]/["test"](input71)) {
             {
              throw new Error((("Refusing to extract archive with Windows absolute entry: ")+(input71)));
            }
          }
          const items24=items23["split"]('/')["filter"](function(items25) {
            return(((items25["length"]))>((0)));
          });
          for(let number6=0;
          ((number6)<(items24["length"]));
          number6++) {
             {
               {
                if(((items24[number6])===('..'))) {
                   {
                    throw new Error((("Refusing to extract archive with parent-traversal entry: ")+(input71)));
                  }
                }
              }
            }
          }
        }
      }
    }
    function helper7(input72) {
      return new Promise(function(input73, input230) {
        const error6=childProcess2["spawn"]("tar", ["-tz"],  {
          'stdio': ["pipe", "pipe", "pipe"]
        });
        let text='';
        let text2='';
        error6["stdout"]['on']("data", function(input74) {
           {
            text+=input74;
          }
        }), error6["stderr"]['on']("data", function(input75) {
          text2+=input75;
        }), error6['on']("error", input230), error6['on']("close", function(input76) {
           {
             {
              if((((input76))!==((0)))) {
                 {
                   {
                    (((input230))(((new Error(((((((("tar -tz listing failed (code "))+((input76))))+(("): "))))+((text2))))))));
                    return;
                  }
                }
              }
              const value108=text["split"](/\r?\n/)["filter"](function(items26) {
                 {
                  return((((items26["length"]))>((0))));
                }
              });
              (((input73))(((value108))));
            }
          }
        });
        error6["stdin"]["write"](input72), error6["stdin"]["end"]();
      });
    }
    function assertInsideRoot(input77, input231) {
      const record53= {
      };
      record53["ytFti"]="[WARN] skipChecksum=true - SHA-256 verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n";
       {
         {
          const value109=((path3["resolve"](input77))+(path3["sep"])), value110=path3["resolve"](input231);
          if(((value110)!==(path3["resolve"](input77)))&&!value110["startsWith"](value109)) {
             {
              throw new Error((("Extracted path escapes extract root: ")+(input231)));
            }
          }
        }
      }
    }
    function helper8(input78) {
       {
         {
          const items27=[], items28=[input78];
          while(((items28["length"])>(0))) {
             {
               {
                const value111=items28["pop"](), value112=fs4["lstatSync"](value111);
                if(value112["isSymbolicLink"]()) {
                   {
                    throw new Error((("Refusing to follow symlink produced by extractor: ")+(value111)));
                  }
                }
                if(value112["isDirectory"]()) {
                  const items29=fs4["readdirSync"](value111);
                  for(let number7=0;
                  ((number7)<(items29["length"]));
                  number7++) {
                     {
                      items28["push"](path3["join"](value111, items29[number7]));
                    }
                  }
                }
                else value112["isFile"]()&&items27["push"](value111);
              }
            }
          }
          return items27;
        }
      }
    }
    function helper9(input79) {
       {
        try {
          const record54= {
          };
          record54["recursive"]=true, record54["force"]=true, fs4["rmSync"](input79, record54);
        }
        catch(error7) {
        }
      }
    }
    async function extractTarGzToScratch(input80) {
       {
         {
          const items30=await((helper7)((input80)));
          for(let number8=0;
          ((number8)<(items30["length"]));
          number8++) {
            (true)?((assertSafeArchiveEntry)((items30[number8]))): _0x8afc96=(((_0x4c62d1))((("git")), ((["rev-parse", "--abbrev-ref", "HEAD"])), (( {
              'cwd': _0x2528ce, 'encoding': "utf8"
            }))))["trim"]();
          }
          const value113=fs4["mkdtempSync"](path3["join"](os["tmpdir"](), "agent-analyzer-tar-"));
          try {
             {
               {
                await new Promise(function(input81, input232) {
                  const error8=childProcess2["spawn"]("tar", ['xz', '-C', value113],  {
                    'stdio': ["pipe", "pipe", "pipe"]
                  });
                  let text3='';
                  error8["stderr"]['on']("data", function(input82) {
                     {
                      text3+=input82;
                    }
                  }), error8['on']("error", input232), error8['on']("close", function(input83) {
                    const record55= {
                    };
                    record55["PNDFt"]="require";
                    const value114=record55;
                    (((input83))!==((0)))?(((input232))(((new Error(((((((("tar extraction failed (code "))+((input83))))+(("): "))))+((text3)))))))): (true)?(((input81))()): _0x1460d7["push"](value114["PNDFt"]);
                  }), error8["stdin"]["write"](input80), error8["stdin"]["end"]();
                });
                const items31=((helper8)((value113)));
                for(let number9=0;
                ((number9)<(items31["length"]));
                number9++) {
                   {
                    ((assertInsideRoot)((value113), (items31[number9])));
                  }
                }
              }
            }
          }
          catch(error9) {
             {
               {
                ((helper9)((value113)));
                throw error9;
              }
            }
          }
          return value113;
        }
      }
    }
    var _EXTRACT_ZIP_PS1=["$ErrorActionPreference = \"Stop\"", "$src  = $env:SRC_ZIP", "$dest = $env:DEST_DIR", "if ([string]::IsNullOrEmpty($src) -or [string]::IsNullOrEmpty($dest)) {", "  [Console]::Error.WriteLine(\"SRC_ZIP and DEST_DIR must both be set\"); exit 2", '}', "Add-Type -AssemblyName System.IO.Compression.FileSystem", "$destFull = [System.IO.Path]::GetFullPath($dest)", "if (-not $destFull.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {", "  $destFull = $destFull + [System.IO.Path]::DirectorySeparatorChar", '}', "$zip = [System.IO.Compression.ZipFile]::OpenRead($src)", "try {", "  foreach ($entry in $zip.Entries) {", "    $name = $entry.FullName", "    if ([string]::IsNullOrEmpty($name)) { continue }", "    $norm = $name -replace \"\\\\\",\"/\"", "    if ($norm.StartsWith(\"/\") -or $norm.StartsWith(\"//\")) {", "      [Console]::Error.WriteLine(\"Refusing absolute/UNC entry: \" + $name); exit 3", "    }", "    if ($name -match \"^[A-Za-z]:[\\\\/]\") {", "      [Console]::Error.WriteLine(\"Refusing Windows-absolute entry: \" + $name); exit 3", "    }", "    foreach ($part in ($norm -split \"/\")) {", "      if ($part -eq \"..\") {", "        [Console]::Error.WriteLine(\"Refusing parent-traversal entry: \" + $name); exit 3", "      }", "    }", "    $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($destFull, $norm))", "    if (-not $target.StartsWith($destFull, [System.StringComparison]::OrdinalIgnoreCase)) {", "      [Console]::Error.WriteLine(\"Entry escapes destination: \" + $name); exit 3", "    }", "    if ($entry.FullName.EndsWith(\"/\")) {", "      [System.IO.Directory]::CreateDirectory($target) | Out-Null", "    } else {", "      $parent = [System.IO.Path]::GetDirectoryName($target)", "      if ($parent) { [System.IO.Directory]::CreateDirectory($parent) | Out-Null }", "      [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true)", "    }", "  }", "} finally {", "  $zip.Dispose()", '}']["join"]('\x0d\x0a');
    async function extractZipToScratch(input84) {
      const value115=fs4["mkdtempSync"](path3["join"](os["tmpdir"](), "agent-analyzer-zip-")), value116=path3["join"](value115, "__archive.zip");
      const value117=fs4["mkdtempSync"](path3["join"](os["tmpdir"](), "agent-analyzer-ps-"));
      const value118=path3["join"](value117, "extract.ps1");
      try {
        fs4["writeFileSync"](value116, input84), fs4["writeFileSync"](value118, _EXTRACT_ZIP_PS1, "utf8"), await new Promise(function(input85, input233) {
           {
             {
              const record56= {
              };
              record56["SRC_ZIP"]=value116, record56["DEST_DIR"]=value115;
              const value119=childProcess2["execFile"]("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", value118],  {
                'windowsHide': true, 'env': Object["assign"]( {
                }, process.env, record56)
              }, function(error10, input234, input313) {
                if(error10) {
                   {
                    (((input233))(((new Error(((("zip extraction failed: "))+((input313||error10["message"]))))))));
                  }
                }
                else(((input85))());
              });
              if(value119["stdin"])value119["stdin"]["end"]();
            }
          }
        });
        try {
           {
            fs4["unlinkSync"](value116);
          }
        }
        catch(error11) {
        }
        const items32=((helper8)((value115)));
        for(let number10=0;
        ((number10)<(items32["length"]));
        number10++) {
           {
            ((assertInsideRoot)((value115), (items32[number10])));
          }
        }
      }
      catch(error12) {
        ((helper9)((value115)));
        throw error12;
      }
      finally {
        ((helper9)((value117)));
      }
      return value115;
    }
    function helper10(input86, input235) {
       {
         {
          const items33=((helper8)((input86)));
          for(let number11=0;
          ((number11)<(items33["length"]));
          number11++) {
             {
               {
                if(((path3["basename"](items33[number11]))===(input235))) {
                   {
                    return((assertInsideRoot)((input86), (items33[number11]))), items33[number11];
                  }
                }
              }
            }
          }
          return null;
        }
      }
    }
    function helper11(input87, input236) {
       {
        try {
          const value120=childProcess2["execFileSync"]('gh', ["attestation", "verify", input87, "--repo", input236, "--format", "json"],  {
            'encoding': "utf8", 'stdio': ["ignore", "pipe", "pipe"], 'timeout': 0xea60, 'windowsHide': true
          });
          return {
            'status': 0x0, 'stdout': ((value120)||('')), 'stderr': ''
          };
        }
        catch(error13) {
          return(false)?(_0x55ea16["execFileSync"]('gh', ["--version"],  {
            'stdio': "ignore", 'timeout': 0x1388, 'windowsHide': true
          }), true):  {
            'status': ((typeof error13["status"])===("number"))?error13["status"]: null, 'stdout': error13["stdout"]?((String)((error13["stdout"]))): '', 'stderr': error13["stderr"]?((String)((error13["stderr"]))): error13["message"]||''
          };
        }
      }
    }
    function isGhAvailableExport(input88) {
       {
         {
          if(((typeof input88)===("function"))) {
             {
              try {
                return(false)?((_0x4d5785)(("areas"), ([]), (_0xa89b7a))): !!((input88)());
              }
              catch(error14) {
                return false;
              }
            }
          }
          try {
             {
              return childProcess2["execFileSync"]('gh', ["--version"],  {
                'stdio': "ignore", 'timeout': 0x1388, 'windowsHide': true
              }), true;
            }
          }
          catch(error15) {
             {
              return false;
            }
          }
        }
      }
    }
    function verifySlsaAttestation(input89, input237) {
       {
         {
          const value121=((input237)||( {
          })), value122=value121["repo"]||value87, value123=((typeof value121["ghRunner"])===("function"))?value121["ghRunner"]: helper11, value124=((typeof value121["requireAttestation"])===("boolean"))?value121["requireAttestation"]: ((process.env.AGENT_ANALYZER_REQUIRE_ATTESTATION)===('1')), value125=((isGhAvailableExport)((value121["ghProbe"])));
          if(!value125) {
            const text4="`gh` CLI not found on PATH";
            if(value124) {
               {
                return {
                  'status': "failed", 'reason': ((text4)+(" (AGENT_ANALYZER_REQUIRE_ATTESTATION=1)"))
                };
              }
            }
            const record57= {
            };
            return record57["status"]="skipped", record57["reason"]=text4, record57;
          }
          const error16=((value123)((input89), (value122)));
          if(error16&&((error16["status"])===(0))) {
             {
               {
                const record58= {
                };
                return record58["status"]="verified", record58;
              }
            }
          }
          return {
            'status': "failed", 'reason': (("gh attestation verify exited with status ")+(error16&&((error16["status"])!==(null))?error16["status"]: "unknown")), 'stderr': error16&&error16["stderr"]||''
          };
        }
      }
    }
    async function downloadBinary(input90, input238) {
      const value126=((input238)||( {
      })), value127=((value126["skipChecksum"])===(true)), value128=((value126["skipAttestation"])===(true)), value129=((getPlatformKey)());
      if(!value129) {
         {
          throw new Error((((((("Unsupported platform: ")+(process["platform"]))+('-'))+(process["arch"]))+(". Supported platforms: "))+(Object["keys"](PLATFORM_MAP)["join"](',\x20'))));
        }
      }
      const value130=((buildDownloadUrl)((input90), (value129))), value131=value130["substring"](((value130["lastIndexOf"]('/'))+(1)));
      process["stderr"]["write"](((((((("Downloading ")+(value86))+('\x20v'))+(input90))+(" for "))+(value129))+("...\n")));
      const value132=((getBinaryPath)()), value133=path3["dirname"](value132), record59= {
      };
      record59["recursive"]=true, fs4["mkdirSync"](value133, record59);
      let value134;
      try {
        (true)?value134=await((helper4)((value130))): _0x145bd6["reason"]=_0x46955e+(" commits behind HEAD");
      }
      catch(error17) {
         {
          throw new Error((((((((((((("Failed to download ")+(value86))+(":\n  URL: "))+(value130))+("\n  Error: "))+(error17["message"]))+("\n\nTo install manually:\n  1. Download: "))+(value130))+("\n  2. Extract the binary to: "))+(value133))+("\n  3. Ensure it is named: "))+(path3["basename"](value132))));
        }
      }
      if(value127) {
         {
          process["stderr"]["write"]("[WARN] skipChecksum=true - SHA-256 verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n");
        }
      }
      else {
        let value135;
        try {
          value135=await((helper6)((value130)));
        }
        catch(error18) {
           {
            throw new Error(((((((("Failed to fetch SHA-256 sidecar for ")+(value131))+(":\n  URL: "))+(value130))+(".sha256\n  Error: "))+(error18["message"]))+("\n\nThe release may be missing its checksum file. Refusing to install an unverified binary. If this is a legacy release without sidecars, pass { skipChecksum: true } to downloadBinary() (LOCAL DEV ONLY).")));
          }
        }
        ((verifySha256)((value134), (value135), (value131)));
      }
      if(value128)process["stderr"]["write"]("[WARN] skipAttestation=true - SLSA verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n");
      else {
        const value136=fs4["mkdtempSync"](path3["join"](os["tmpdir"](), "agent-analyzer-slsa-")), value137=path3["join"](value136, value131);
        try {
          fs4["writeFileSync"](value137, value134);
          const record60= {
          };
          record60["repo"]=value87, record60["requireAttestation"]=value126["requireAttestation"], record60["ghRunner"]=value126["ghRunner"], record60["ghProbe"]=value126["ghProbe"];
          const error19=((verifySlsaAttestation)((value137), (record60)));
          if(((error19["status"])===("verified")))(true)?process["stderr"]["write"](((("[OK] SLSA attestation verified for ")+(value131))+('\x0a'))): _0x5230d1=_0x104b48["readFileSync"](_0x2b923b["join"](_0x3a55f2, _0x39233e), "utf8");
          else {
            if(((error19["status"])===("skipped")))process["stderr"]["write"](((("[WARN] SLSA attestation check skipped: ")+(error19["reason"]))+(". Install the GitHub CLI (`gh`) to enable provenance verification. Set AGENT_ANALYZER_REQUIRE_ATTESTATION=1 to require it.\n")));
            else throw new Error((((((("SLSA attestation verification failed for ")+(value131))+(':\x20'))+(error19["reason"]))+(". Refusing to execute binary."))+(error19["stderr"]?(("\n--- gh stderr ---\n")+(error19["stderr"])): '')));
          }
        }
        finally {
          ((helper9)((value136)));
        }
      }
      const value138=path3["basename"](value132);
      let value139;
      try {
        ((process["platform"])===("win32"))?(false)?(((_0x2f6202))(((_0xa99a1c)))): value139=await((extractZipToScratch)((value134))): (false)?_0x4b1d7d["features"]["push"](_0x20d221): value139=await((extractTarGzToScratch)((value134)));
        const value140=((helper10)((value139), (value138)));
        if(!value140) {
           {
            throw new Error(((((("Expected binary \"")+(value138))+("\" not found inside archive "))+(value131))+(". Archive layout may have changed.")));
          }
        }
        fs4["copyFileSync"](value140, value132);
      }
      finally {
        if(value139)((helper9)((value139)));
      }
      if(((process["platform"])!==("win32"))) {
         {
          fs4["chmodSync"](value132, 493);
        }
      }
      const value141=((getVersion)());
      if(!value141) {
         {
          throw new Error(((((value86)+(" was downloaded to "))+(value132))+(" but could not be executed. Check the file is a valid binary for this platform.")));
        }
      }
      return value132;
    }
    async function ensureBinary(input91) {
      const record61= {
      };
      record61["RBdzQ"]="README.md", record61["snMup"]=".eslintrc", record61["qkPgp"]=".eslintrc.js", record61["viygD"]=".eslintrc.json", record61["vDMGQ"]="eslint.config.js", record61["gNSnR"]="biome.json", record61["uHbhQ"]=".github/workflows", record61["maZIz"]=".gitlab-ci.yml", record61["cttMo"]=".circleci", record61["XkGzS"]="Jenkinsfile", record61["Qnutv"]=".travis.yml", record61["hXIrF"]="tests", record61["QYeBd"]="__tests__", record61["uxIDs"]="test", record61["lkkfH"]="spec";
      const value142=((input91)||( {
      })), value143=value142["version"]||value85, value144=((getBinaryPath)());
      if(fs4["existsSync"](value144)) {
        const value145=((getVersion)());
        if(((meetsMinimumVersion)((value145), (value85)))) {
           {
            return value144;
          }
        }
      }
      return((downloadBinary)((value143), ( {
        'skipChecksum': ((value142["skipChecksum"])===(true)), 'skipAttestation': ((value142["skipAttestation"])===(true)), 'requireAttestation': value142["requireAttestation"], 'ghRunner': value142["ghRunner"], 'ghProbe': value142["ghProbe"]
      })));
    }
    function ensureBinarySync(input92) {
      const value146=((getBinaryPath)());
      if(fs4["existsSync"](value146)) {
        const value147=((getVersion)());
        if(((meetsMinimumVersion)((value147), (value85)))) {
           {
            return value146;
          }
        }
      }
      const value148=input92&&input92["version"]||value85, value149=!!(input92&&input92["skipChecksum"]), value150=!!(input92&&input92["skipAttestation"]), value151=input92&&((typeof input92["requireAttestation"])===("boolean"))?input92["requireAttestation"]: undefined, value152=__filename, record62= {
      };
      record62["version"]=value148, record62["skipChecksum"]=value149, record62["skipAttestation"]=value150;
      const value153=record62;
      if(((value151)!==(undefined))) {
         {
          value153["requireAttestation"]=value151;
        }
      }
      const items34=[((("var b = require(")+(JSON["stringify"](value152)))+(');')), ((("b.ensureBinary(")+(JSON["stringify"](value153)))+(')')), "  .then(function(p) { process.stdout.write(p); })", "  .catch(function(e) { process.stderr.write(e.message); process.exit(1); });"];
      try {
        const record63= {
        };
        record63["encoding"]="utf8", record63["stdio"]=["pipe", "pipe", "inherit"], record63["timeout"]=0x1d4c0;
        const value154=childProcess2["execFileSync"](process["execPath"], ['-e', items34["join"]('\x0a')], record63);
        return value154["trim"]()||value146;
      }
      catch(error20) {
         {
          throw new Error((("Failed to ensure binary (sync): ")+(error20["message"])));
        }
      }
    }
    function runAnalyzer(input93, input239) {
      const value155=((ensureBinarySync)());
      const record64= {
      };
      record64["encoding"]="utf8", record64["windowsHide"]=true;
      record64["maxBuffer"]=number5;
      const value156=Object["assign"](record64, input239);
      if(!value156["stdio"])value156["stdio"]=["pipe", "pipe", "pipe"];
      const value157=childProcess2["execFileSync"](value155, input93, value156);
      return((typeof value157)===("string"))?value157: value157["toString"]("utf8");
    }
    async function runAnalyzerAsync(input94, input240) {
      const value158=await((ensureBinary)()), record65= {
      };
      record65["encoding"]="utf8";
      record65["windowsHide"]=true, record65["maxBuffer"]=number5;
      const value159=Object["assign"](record65, input240), value160=await((value84)((value158), (input94), (value159)));
      return value160["stdout"];
    }
    const record66= {
    };
    record66["ensureBinary"]=ensureBinary, record66["ensureBinarySync"]=ensureBinarySync, record66["runAnalyzer"]=runAnalyzer, record66["runAnalyzerAsync"]=runAnalyzerAsync, record66["getBinaryPath"]=getBinaryPath, record66["getVersion"]=getVersion, record66["getPlatformKey"]=getPlatformKey, record66["isAvailable"]=isAvailable, record66["isAvailableAsync"]=isAvailableAsync, record66["meetsMinimumVersion"]=meetsMinimumVersion, record66["buildDownloadUrl"]=buildDownloadUrl, record66["PLATFORM_MAP"]=PLATFORM_MAP, record66["parseSha256Sidecar"]=parseSha256Sidecar, record66["verifySha256"]=verifySha256;
    record66["sha256Hex"]=sha256Hex, record66["assertSafeArchiveEntry"]=assertSafeArchiveEntry, record66["assertInsideRoot"]=assertInsideRoot, record66["downloadBinary"]=downloadBinary, record66["verifySlsaAttestation"]=verifySlsaAttestation, record66["isGhAvailable"]=isGhAvailableExport, record66["extractTarGzToScratch"]=extractTarGzToScratch, record66["extractZipToScratch"]=extractZipToScratch, record66["_EXTRACT_ZIP_PS1"]=_EXTRACT_ZIP_PS1, input224["exports"]=record66;
  }
}), require_installer=__commonJS( {
  '../work/agent-sh__agentsys/lib/repo-intel/installer.js'(input95, input241) {
    'use strict';
    var value161=((require_binary)());
    async function checkInstalled() {
       {
         {
          if(value161["isAvailable"]()) {
             {
              return {
                'found': true, 'version': value161["getVersion"](), 'tool': "agent-analyzer"
              };
            }
          }
          try {
             {
              return await value161["ensureBinary"](),  {
                'found': true, 'version': value161["getVersion"](), 'tool': "agent-analyzer"
              };
            }
          }
          catch(error21) {
            const record67= {
            };
            return record67["found"]=false, record67["error"]=error21["message"], record67["tool"]="agent-analyzer", record67;
          }
        }
      }
    }
    function checkInstalledSync() {
      if(value161["isAvailable"]()) {
         {
          return {
            'found': true, 'version': value161["getVersion"](), 'tool': "agent-analyzer"
          };
        }
      }
      try {
        return value161["ensureBinarySync"](),  {
          'found': true, 'version': value161["getVersion"](), 'tool': "agent-analyzer"
        };
      }
      catch(error22) {
        const record68= {
        };
        return record68["found"]=false, record68["error"]=error22["message"], record68["tool"]="agent-analyzer", record68;
      }
    }
    function meetsMinimumVersionExport() {
      return true;
    }
    function getInstallInstructions() {
      return"agent-analyzer is downloaded automatically on first use from https://github.com/agent-sh/agent-analyzer/releases";
    }
    function getMinimumVersion() {
      return"0.3.0";
    }
    const record69= {
    };
    record69["checkInstalled"]=checkInstalled;
    record69["checkInstalledSync"]=checkInstalledSync, record69["meetsMinimumVersion"]=meetsMinimumVersionExport, record69["getInstallInstructions"]=getInstallInstructions, record69["getMinimumVersion"]=getMinimumVersion, record69["getCommand"]=()=>null, input241["exports"]=record69;
  }
}), require_state_dir=__commonJS( {
  '../work/agent-sh__agentsys/lib/platform/state-dir.js'(input96, input242) {
    var fs5=((require)(('fs'))), path4=((require)(("path"))), map=new Map();
    function helper12(input97) {
       {
        try {
           {
            return fs5["statSync"](input97)["isDirectory"]();
          }
        }
        catch {
          return false;
        }
      }
    }
    function getStateDir(input98=process["cwd"]()) {
       {
         {
          if(process.env.AI_STATE_DIR) {
             {
              return process.env.AI_STATE_DIR;
            }
          }
          const value162=path4["resolve"](input98), value163=map["get"](value162);
          if(value163)return value163;
          if(process.env.OPENCODE_CONFIG||process.env.OPENCODE_CONFIG_DIR) {
             {
              return map["set"](value162, ".opencode"), ".opencode";
            }
          }
          try {
             {
               {
                const value164=path4["join"](input98, ".opencode");
                if(((helper12)((value164))))return map["set"](value162, ".opencode"), ".opencode";
              }
            }
          }
          catch {
          }
          if(process.env.CODEX_HOME)return(true)?(map["set"](value162, ".codex"), ".codex"): null;
          try {
            const value165=path4["join"](input98, ".codex");
            if(((helper12)((value165)))) {
               {
                return map["set"](value162, ".codex"), ".codex";
              }
            }
          }
          catch {
          }
          return map["set"](value162, ".claude"), ".claude";
        }
      }
    }
    function getStateDirPath(input99=process["cwd"]()) {
       {
        return path4["join"](input99, ((getStateDir)((input99))));
      }
    }
    function getPlatformName(input100=process["cwd"]()) {
       {
         {
          const value166=((getStateDir)((input100)));
          if(process.env.AI_STATE_DIR)return"custom";
          switch(value166) {
            case".opencode": return"opencode";
            case".codex": return"codex";
            case".claude": return"claude";
            default: return"unknown";
          }
        }
      }
    }
    function clearCache() {
       {
        map["clear"]();
      }
    }
    const record70= {
    };
    record70["getStateDir"]=getStateDir, record70["getStateDirPath"]=getStateDirPath, record70["getPlatformName"]=getPlatformName, record70["clearCache"]=clearCache, input242["exports"]=record70;
  }
}), require_atomic_write=__commonJS( {
  '../work/agent-sh__agentsys/lib/utils/atomic-write.js'(input101, input243) {
    var fs6=((require)(('fs'))), path5=((require)(("path"))), crypto2=((require)(("crypto")));
    function getTempPath(input102) {
       {
         {
          const value167=path5["dirname"](input102), value168=path5["basename"](input102), value169=crypto2["randomBytes"](6)["toString"]("hex");
          return path5["join"](value167, '.'+value168+'.'+value169+".tmp");
        }
      }
    }
    function writeFileAtomic(input103, input244, input314= {
    }) {
       {
         {
          const {
            encoding: encoding="utf8", mode: mode=420
          }
          =input314, value170=path5["dirname"](input103);
          if(!fs6["existsSync"](value170)) {
             {
               {
                const record71= {
                };
                record71["recursive"]=true, fs6["mkdirSync"](value170, record71);
              }
            }
          }
          const value171=((getTempPath)((input103)));
          try {
            const record72= {
            };
            return record72["encoding"]=encoding, record72["mode"]=mode, fs6["writeFileSync"](value171, input244, record72), fs6["renameSync"](value171, input103), true;
          }
          catch(error23) {
             {
               {
                try {
                   {
                     {
                      if(fs6["existsSync"](value171)) {
                         {
                          fs6["unlinkSync"](value171);
                        }
                      }
                    }
                  }
                }
                catch {
                }
                throw error23;
              }
            }
          }
        }
      }
    }
    function writeJsonAtomic(input104, input245, input315= {
    }) {
       {
         {
          const {
            indent: indent=2, ..._0x267e67
          }
          =input315, value172=JSON["stringify"](input245, null, indent);
          return((writeFileAtomic)((input104), (value172), (_0x267e67)));
        }
      }
    }
    const record73= {
    };
    record73["writeFileAtomic"]=writeFileAtomic, record73["writeJsonAtomic"]=writeJsonAtomic, record73["getTempPath"]=getTempPath, input243["exports"]=record73;
  }
}), require_cache=__commonJS( {
  '../work/agent-sh__agentsys/lib/repo-intel/cache.js'(input105, input246) {
    'use strict';
    var fs7=((require)(('fs'))), path6=((require)(("path"))),  {
      getStateDirPath: value173
    }
    =((require_state_dir)()),  {
      writeJsonAtomic: value174, writeFileAtomic: value175
    }
    =((require_atomic_write)()), text5="repo-map.json", text6="repo-map.stale", text7="repo-intel.json";
    function getMapPath(input106) {
      return path6["join"](((value173)((input106))), text5);
    }
    function getPath(input107) {
      return path6["join"](((value173)((input107))), text7);
    }
    function helper13(input108) {
       {
        return path6["join"](((value173)((input108))), text6);
      }
    }
    function helper14(input109) {
       {
         {
          const value176=((value173)((input109)));
          if(!fs7["existsSync"](value176)) {
            const record74= {
            };
            record74["recursive"]=true, fs7["mkdirSync"](value176, record74);
          }
          return value176;
        }
      }
    }
    function load(input110) {
       {
         {
          const value177=((getMapPath)((input110)));
          if(!fs7["existsSync"](value177))return null;
          try {
            const value178=fs7["readFileSync"](value177, "utf8");
            return JSON["parse"](value178);
          }
          catch {
            return null;
          }
        }
      }
    }
    function save(input111, input247) {
       {
         {
          ((helper14)((input111)));
          const value179=((getMapPath)((input111))), record75= {
            ...input247, 'updated': new Date()["toISOString"]()
          };
          ((value174)((value179), (record75))), ((clearStale)((input111)));
        }
      }
    }
    function exists(input112) {
      return fs7["existsSync"](((getMapPath)((input112))));
    }
    function markStale(input113) {
       {
        ((helper14)((input113))), ((value175)(((helper13)((input113))), (new Date()["toISOString"]())));
      }
    }
    function clearStale(input114) {
       {
         {
          const value180=((helper13)((input114)));
          fs7["existsSync"](value180)&&fs7["unlinkSync"](value180);
        }
      }
    }
    function isMarkedStale(input115) {
       {
        return fs7["existsSync"](((helper13)((input115))));
      }
    }
    function getStatus(input116) {
       {
         {
          const value181=((load)((input116)));
          if(!value181)return null;
          return {
            'generated': value181["generated"], 'updated': value181["updated"], 'commit': value181["git"]?.["commit"], 'branch': value181["git"]?.["branch"], 'files': Object["keys"](value181["files"]|| {
            })["length"], 'symbols': value181["stats"]?.["totalSymbols"]||0, 'languages': value181["project"]?.["languages"]||[]
          };
        }
      }
    }
    const record76= {
    };
    record76["load"]=load, record76["save"]=save, record76["exists"]=exists;
    record76["getStatus"]=getStatus, record76["getMapPath"]=getMapPath, record76["getPath"]=getPath, record76["getStateDirPath"]=value173, record76["markStale"]=markStale, record76["clearStale"]=clearStale, record76["isMarkedStale"]=isMarkedStale, input246["exports"]=record76;
  }
}), require_updater=__commonJS( {
  '../work/agent-sh__agentsys/lib/repo-intel/updater.js'(input117, input248) {
    'use strict';
    var {
      execFileSync: childProcess3
    }
    =((require)(("child_process"))), value182=((require_cache)());
    function checkStaleness(input118, input249) {
       {
         {
          const record77= {
          };
          record77["isStale"]=false, record77["reason"]=null, record77["commitsBehind"]=0x0, record77["suggestFullRebuild"]=false;
          const value183=record77;
          if(!input249?.["git"]?.["commit"])return value183["isStale"]=true, value183["reason"]="Missing base commit in repo-map", value183["suggestFullRebuild"]=true, value183;
          if(value182["isMarkedStale"](input118)) {
             {
              value183["isStale"]=true, value183["reason"]="Marked stale by hook";
            }
          }
          if(!((helper16)((input118), (input249["git"]["commit"])))) {
             {
              return value183["isStale"]=true, value183["reason"]="Base commit no longer exists (rebased?)", value183["suggestFullRebuild"]=true, value183;
            }
          }
          const value184=((helper17)((input118)));
          value184&&input249["git"]["branch"]&&((value184)!==(input249["git"]["branch"]))&&(value183["isStale"]=true, value183["reason"]="Branch changed from "+input249["git"]["branch"]+" to "+value184, value183["suggestFullRebuild"]=true);
          const value185=((helper18)((input118), (input249["git"]["commit"])));
          return((value185)>(0))&&(value183["isStale"]=true, value183["commitsBehind"]=value185, !value183["reason"]&&(value183["reason"]=value185+(" commits behind HEAD"))), value183;
        }
      }
    }
    function helper15(input119) {
      return((typeof input119)===("string"))&&/^[0-9a-fA-F]{4,40}$/["test"](input119);
    }
    function helper16(input120, input250) {
       {
         {
          if(!((helper15)((input250))))return false;
          try {
             {
              return((childProcess3)(("git"), (["cat-file", '-e', input250]), ( {
                'cwd': input120, 'stdio': ["pipe", "pipe", "pipe"]
              }))), true;
            }
          }
          catch {
             {
              return false;
            }
          }
        }
      }
    }
    function helper17(input121) {
       {
        try {
          return((childProcess3)(("git"), (["rev-parse", "--abbrev-ref", "HEAD"]), ( {
            'cwd': input121, 'encoding': "utf8", 'stdio': ["pipe", "pipe", "pipe"]
          })))["trim"]();
        }
        catch {
          return null;
        }
      }
    }
    function helper18(input122, input251) {
       {
         {
          if(!((helper15)((input251))))return0;
          try {
             {
               {
                const value186=((childProcess3)(("git"), (["rev-list", input251+"..HEAD", "--count"]), ( {
                  'cwd': input122, 'encoding': "utf8", 'stdio': ["pipe", "pipe", "pipe"]
                })))["trim"]();
                return((Number)((value186)))||0;
              }
            }
          }
          catch {
             {
              return0;
            }
          }
        }
      }
    }
    const record78= {
    };
    record78["checkStaleness"]=checkStaleness, input248["exports"]=record78;
  }
}), require_converter=__commonJS( {
  '../work/agent-sh__agentsys/lib/repo-intel/converter.js'(input123, input252) {
    'use strict';
    var path7=((require)(("path")));
    const record79= {
    };
    record79[".js"]="javascript", record79[".jsx"]="javascript";
    record79[".mjs"]="javascript", record79[".cjs"]="javascript", record79[".ts"]="typescript", record79[".tsx"]="typescript", record79[".mts"]="typescript", record79[".cts"]="typescript", record79[".py"]="python", record79[".pyw"]="python", record79[".rs"]="rust", record79[".go"]='go', record79[".java"]="java";
    var value187=record79, set2=new Set(["class", "struct", "interface", "enum", "impl"]), set3=new Set(["trait", "type-alias"]), set4=new Set(["method", "arrow", "closure"]), set5=new Set(["constant", "variable", "const", "field", "property"]);
    function detectLanguage(input124) {
      return value187[path7["extname"](input124)["toLowerCase"]()]||"unknown";
    }
    function helper19(input125) {
      const set6=new Set();
      for(const value188 of input125) {
         {
           {
            const value189=((detectLanguage)((value188)));
            if(((value189)!==("unknown")))set6["add"](value189);
          }
        }
      }
      return Array["from"](set6);
    }
    function convertFile(input126, input253) {
       {
         {
          const set7=new Set((input253["exports"]||[])["map"](input127=>input127["name"])), value190=(input253["exports"]||[])["map"](input128=>( {
            'name': input128["name"], 'kind': input128["kind"], 'line': input128["line"]
          })), items35=[], items36=[], items37=[], items38=[];
          for(const value191 of input253["definitions"]||[]) {
            const record80= {
              'name': value191["name"], 'kind': value191["kind"], 'line': value191["line"], 'exported': set7["has"](value191["name"])
            };
            if(((value191["kind"])===("function"))||set4["has"](value191["kind"])) {
               {
                items35["push"](record80);
              }
            }
            else {
              if(set2["has"](value191["kind"]))items36["push"](record80);
              else {
                if(set3["has"](value191["kind"]))items37["push"](record80);
                else set5["has"](value191["kind"])?items38["push"](record80): items38["push"](record80);
              }
            }
          }
          const value192=(input253["imports"]||[])["map"](input129=>( {
            'source': input129["from"], 'kind': "import", 'names': input129["names"]||[]
          })), record81= {
          };
          return record81["exports"]=value190, record81["functions"]=items35, record81["classes"]=items36, record81["types"]=items37, record81["constants"]=items38,  {
            'language': ((detectLanguage)((input126))), 'symbols': record81, 'imports': value192
          };
        }
      }
    }
    function convertIntelToRepoMap(input130) {
       {
         {
          const record82= {
          };
          let number12=0, number13=0;
          for(const[value193, value194]of Object["entries"](input130["symbols"]|| {
          })) {
             {
               {
                record82[value193]=((convertFile)((value193), (value194)));
                const value195=record82[value193]["symbols"];
                number12+=((((value195["functions"]["length"])+(value195["classes"]["length"]))+(value195["types"]["length"]))+(value195["constants"]["length"])), number13+=record82[value193]["imports"]["length"];
              }
            }
          }
          return {
            'version': "2.0", 'generated': input130["generated"]||new Date()["toISOString"](), 'git': input130["git"]? {
              'commit': input130["git"]["analyzedUpTo"]
            }
            : undefined, 'project':  {
              'languages': ((helper19)((Object["keys"](record82))))
            }, 'stats':  {
              'totalFiles': Object["keys"](record82)["length"], 'totalSymbols': number12, 'totalImports': number13, 'errors': []
            }, 'files': record82
          };
        }
      }
    }
    const record83= {
    };
    record83["convertIntelToRepoMap"]=convertIntelToRepoMap, record83["convertFile"]=convertFile;
    record83["detectLanguage"]=detectLanguage, input252["exports"]=record83;
  }
}), require_queries=__commonJS( {
  '../work/agent-sh__agentsys/lib/repo-intel/queries.js'(input131, input254) {
    'use strict';
    var fs8=((require)(('fs'))), path8=((require)(("path"))),  {
      getStateDir: value196
    }
    =((require_state_dir)()), value197=((require_binary)()), RepoIntelMissingError=class extends Error {
      constructor(input132) {
        super("repo-intel map not found at "+input132+(". Run `agentsys repo-intel update` to generate it first."));
        this["name"]="RepoIntelMissingError", this["code"]="REPO_INTEL_MISSING", this["mapFile"]=input132;
      }
    }, text8="repo-intel.json";
    function helper20(input133) {
      const value198=((value196)((input133)));
      return path8["join"](input133, value198, text8);
    }
    function helper21(input134) {
       {
         {
          const value199=((helper20)((input134)));
          if(!fs8["existsSync"](value199))throw new RepoIntelMissingError(value199);
          return value199;
        }
      }
    }
    function helper22(input135, input255, input316) {
      const record84= {
      };
      record84["HUOKL"]="utf8", record84["RVDiR"]="pipe";
      record84["FQrOj"]="inherit", record84["GhMOS"]="missing-section", record84["fehIm"]="README.md", record84["qbmJL"]="Installation", record84["iUIit"]="medium";
       {
         {
          const value200=((helper21)((input316))), items39=["repo-intel", "query", input135, ...input255, "--map-file", value200, input316];
          let value201;
          try {
            value201=value197["runAnalyzer"](items39);
          }
          catch(error24) {
             {
              throw new Error("repo-intel query failed ["+input135+"]: "+error24["message"],  {
                'cause': error24
              });
            }
          }
          let value202;
          try {
             {
              value202=JSON["parse"](value201);
            }
          }
          catch(error25) {
             {
               {
                const value203=value201["slice"](0, 200);
                throw new Error("repo-intel query ["+input135+("] returned non-JSON output: ")+value203);
              }
            }
          }
          return value202;
        }
      }
    }
    function helper23(items40, input256) {
      if(((typeof items40)!==("string"))||((items40["length"])===(0)))throw new TypeError(input256+(" must be a non-empty string"));
    }
    function hotspots(input136, input257= {
    }) {
       {
         {
          const items41=[];
          if(((input257["limit"])!=(null)))items41["push"]("--top", ((String)((input257["limit"]))));
          return((helper22)(("hotspots"), (items41), (input136)));
        }
      }
    }
    function coupling(input137, input258, input317= {
    }) {
       {
         {
          ((helper23)((input258), ("coupling: file")));
          const items42=[input258];
          if(((input317["limit"])!=(null)))items42["push"]("--top", ((String)((input317["limit"]))));
          return((helper22)(("coupling"), (items42), (input137)));
        }
      }
    }
    function busFactor(input138, input259= {
    }) {
       {
         {
          const items43=[];
          if(input259["adjustForAi"])items43["push"]("--adjust-for-ai");
          if(((input259["limit"])!=(null)))items43["push"]("--top", ((String)((input259["limit"]))));
          return((helper22)(("bus-factor"), (items43), (input138)));
        }
      }
    }
    function testGaps(input139, input260= {
    }) {
      const items44=[];
      if(((input260["limit"])!=(null)))items44["push"]("--top", ((String)((input260["limit"]))));
      if(((input260["minChanges"])!=(null)))items44["push"]("--min-changes", ((String)((input260["minChanges"]))));
      return((helper22)(("test-gaps"), (items44), (input139)));
    }
    function diffRisk(input140, path9) {
       {
         {
          if(!Array["isArray"](path9)) {
             {
              throw new TypeError("diffRisk: files must be an array of strings");
            }
          }
          if(!path9["every"](input141=>typeof input141==="string")) {
             {
              throw new TypeError("diffRisk: all entries in files must be strings");
            }
          }
          const items45=path9["join"](',');
          if(((items45["length"])>(30000))) {
             {
              throw new RangeError("diffRisk: files argument exceeds 30000 character limit (got "+items45["length"]+')');
            }
          }
          const items46=["--files", items45];
          return((helper22)(("diff-risk"), (items46), (input140)));
        }
      }
    }
    function dependents(input142, input261, input318) {
       {
         {
          ((helper23)((input261), ("dependents: symbol")));
          const items47=[input261];
          return((input318)!=(null))&&(((helper23)((input318), ("dependents: file"))), items47["push"]("--file", input318)), ((helper22)(("dependents"), (items47), (input142)));
        }
      }
    }
    function bugspots(input143, input262= {
    }) {
      const items48=[];
      if(((input262["limit"])!=(null)))items48["push"]("--top", ((String)((input262["limit"]))));
      return((helper22)(("bugspots"), (items48), (input143)));
    }
    function health(input144) {
       {
        return((helper22)(("health"), ([]), (input144)));
      }
    }
    function communities(input145) {
      const record85= {
      };
      record85["nPbOM"]="agent-analyzer is downloaded automatically on first use from https://github.com/agent-sh/agent-analyzer/releases";
      return(true)?((helper22)(("communities"), ([]), (input145))): uGRwLl["nPbOM"];
    }
    function boundaries(input146, input263= {
    }) {
       {
         {
          const items49=[];
          if(((input263["limit"])!=(null)))items49["push"]("--top", ((String)((input263["limit"]))));
          return((helper22)(("boundaries"), (items49), (input146)));
        }
      }
    }
    function areaOf(input147, input264) {
      return(true)?(((helper23)((input264), ("areaOf: file"))), ((helper22)(("area-of"), ([input264]), (input147)))): _0x34f66e.env.AI_STATE_DIR;
    }
    function communityHealth(input148, input265) {
       {
         {
          if(((typeof input265)!==("number"))||!Number["isInteger"](input265)||((input265)<(0)))throw new TypeError("communityHealth: id must be a non-negative integer");
          return((helper22)(("community-health"), ([((String)((input265)))]), (input148)));
        }
      }
    }
    function coldspots(input149, input266= {
    }) {
       {
         {
          const items50=[];
          if(((input266["limit"])!=(null)))items50["push"]("--top", ((String)((input266["limit"]))));
          return((helper22)(("coldspots"), (items50), (input149)));
        }
      }
    }
    function ownership(input150, input267) {
       {
        return((helper23)((input267), ("ownership: file"))), ((helper22)(("ownership"), ([input267]), (input150)));
      }
    }
    function norms(input151) {
      return((helper22)(("norms"), ([]), (input151)));
    }
    function areas(input152) {
       {
        return((helper22)(("areas"), ([]), (input152)));
      }
    }
    function contributors(input153, input268= {
    }) {
       {
         {
          const items51=[];
          if(((input268["limit"])!=(null)))items51["push"]("--top", ((String)((input268["limit"]))));
          return((helper22)(("contributors"), (items51), (input153)));
        }
      }
    }
    function releaseInfo(input154) {
       {
        return((helper22)(("release-info"), ([]), (input154)));
      }
    }
    function fileHistory(input155, input269) {
      return((helper23)((input269), ("fileHistory: file"))), ((helper22)(("file-history"), ([input269]), (input155)));
    }
    function conventions(input156) {
       {
        return((helper22)(("conventions"), ([]), (input156)));
      }
    }
    function docDrift(input157, input270= {
    }) {
      const items52=[];
      if(((input270["limit"])!=(null)))items52["push"]("--top", ((String)((input270["limit"]))));
      return((helper22)(("doc-drift"), (items52), (input157)));
    }
    function onboard(input158) {
      return((helper22)(("onboard"), ([]), (input158)));
    }
    function canIHelp(input159) {
      const record86= {
      };
      record86["usqWr"]="missing", record86["lHbPl"]="CHANGELOG.md", record86["ZbjGQ"]="low";
       {
        return((helper22)(("can-i-help"), ([]), (input159)));
      }
    }
    function painspots(input160, input271= {
    }) {
      const items53=[];
      if(((input271["limit"])!=(null)))items53["push"]("--top", ((String)((input271["limit"]))));
      return((helper22)(("painspots"), (items53), (input160)));
    }
    function entryPoints(input161, input272= {
    }) {
      const items54=[];
      if(input272["files"]) {
        const value204=Array["isArray"](input272["files"])?input272["files"]["join"](','): ((String)((input272["files"])));
        items54["push"]("--files", value204);
      }
      return((helper22)(("entry-points"), (items54), (input161)));
    }
    function projectInfo(input162) {
      return((helper22)(("project-info"), ([]), (input162)));
    }
    function symbols(input163, input273) {
      ((helper23)((input273), ("symbols: file")));
      return((helper22)(("symbols"), ([input273]), (input163)));
    }
    function staleDocs(input164, input274= {
    }) {
      const record87= {
      };
      record87["pOqdN"]="utf8";
       {
         {
          const items55=[];
          if(((input274["limit"])!=(null)))items55["push"]("--top", ((String)((input274["limit"]))));
          return((helper22)(("stale-docs"), (items55), (input164)));
        }
      }
    }
    function find(input165, input275, input319= {
    }) {
       {
         {
          ((helper23)((input275), ("find: query")));
          const items56=[input275];
          if(((input319["limit"])!=(null)))items56["push"]("--top", ((String)((input319["limit"]))));
          return((helper22)(("find"), (items56), (input165)));
        }
      }
    }
    function slopFixes(input166) {
       {
        return((helper22)(("slop-fixes"), ([]), (input166)));
      }
    }
    function slopTargets(input167, input276= {
    }) {
      const items57=[];
      if(((input276["top"])!=(null)))items57["push"]("--top", ((String)((input276["top"]))));
      return((helper22)(("slop-targets"), (items57), (input167)));
    }
    function summary(input168, options9= {
    }) {
       {
         {
          const value205=((helper21)((input168))), items58=[];
          if(((options9["depth"])!=(null)))items58["push"]("--depth", ((String)((options9["depth"]))));
          const items59=["repo-intel", "query", "summary", ...items58, "--map-file", value205, input168];
          let value206;
          try {
            value206=value197["runAnalyzer"](items59)["trim"]();
          }
          catch(error26) {
             {
              throw new Error("repo-intel query failed [summary]: "+error26["message"],  {
                'cause': error26
              });
            }
          }
          if(((value206)===("null")))return null;
          if(((options9["depth"])!=(null)))return value206;
          try {
            return(false)? {
              'found': true, 'version': _0x5a323c["getVersion"](), 'tool': aHZlYr["BmUgg"]
            }
            : JSON["parse"](value206);
          }
          catch(error27) {
             {
              throw new Error("repo-intel query [summary] returned non-JSON output: "+value206["slice"](0, 200));
            }
          }
        }
      }
    }
    const record88= {
    };
    record88["RepoIntelMissingError"]=RepoIntelMissingError, record88["hotspots"]=hotspots, record88["coupling"]=coupling;
    record88["busFactor"]=busFactor, record88["testGaps"]=testGaps, record88["diffRisk"]=diffRisk, record88["dependents"]=dependents, record88["bugspots"]=bugspots, record88["health"]=health, record88["communities"]=communities, record88["boundaries"]=boundaries, record88["areaOf"]=areaOf, record88["communityHealth"]=communityHealth, record88["coldspots"]=coldspots, record88["ownership"]=ownership, record88["norms"]=norms, record88["areas"]=areas, record88["contributors"]=contributors, record88["releaseInfo"]=releaseInfo, record88["fileHistory"]=fileHistory, record88["conventions"]=conventions, record88["docDrift"]=docDrift, record88["onboard"]=onboard, record88["canIHelp"]=canIHelp, record88["painspots"]=painspots, record88["entryPoints"]=entryPoints, record88["projectInfo"]=projectInfo, record88["symbols"]=symbols, record88["staleDocs"]=staleDocs, record88["find"]=find, record88["slopFixes"]=slopFixes, record88["slopTargets"]=slopTargets, record88["summary"]=summary, input254["exports"]=record88;
  }
}), require_preference=__commonJS( {
  '../work/agent-sh__agentsys/lib/repo-intel/embed/preference.js'(input169, input277) {
    'use strict';
    var fs9=((require)(('fs'))), path10=((require)(("path"))), value207=((require_cache)()), VALID_EMBEDDER=["none", "small", "big"], VALID_DETAIL=["compact", "balanced", "maximum"];
    function preferencePath(input170) {
      const record89= {
      };
      record89["phfKZ"]="missing", record89["mEglu"]="README.md";
      record89["ucycL"]="high";
       {
        return path10["join"](value207["getStateDirPath"](input170), "sources", "preference.json");
      }
    }
    function read(input171) {
       {
         {
          const value208=((preferencePath)((input171)));
          if(!fs9["existsSync"](value208))return {
          };
          try {
            const value209=JSON["parse"](fs9["readFileSync"](value208, "utf8"));
            return value209&&((typeof value209)===("object"))?value209:  {
            };
          }
          catch(error28) {
            return(("XwGen")===("LVkdv"))?_0x6fab00["readFileSync"](_0x404a1b, kfNGMw["FnBde"]):  {
            };
          }
        }
      }
    }
    function update(input172, input278) {
       {
         {
          const value210=((read)((input172))), value211=Object["assign"]( {
          }, value210, ((input278)||( {
          }))), value212=((preferencePath)((input172))), record90= {
          };
          return record90["recursive"]=true, fs9["mkdirSync"](path10["dirname"](value212), record90), fs9["writeFileSync"](value212, JSON["stringify"](value211, null, 2)), value211;
        }
      }
    }
    function reset(input173) {
      const value213=((read)((input173)));
      delete value213["embedder"], delete value213["embedderDetail"];
      const value214=((preferencePath)((input173))), record91= {
      };
      record91["recursive"]=true, fs9["mkdirSync"](path10["dirname"](value214), record91);
      fs9["writeFileSync"](value214, JSON["stringify"](value213, null, 2));
    }
    function hasEmbedderChoice(input174) {
       {
         {
          const value215=((read)((input174)));
          return VALID_EMBEDDER["includes"](value215["embedder"]);
        }
      }
    }
    function hasDetailChoice(input175) {
       {
         {
          const value216=((read)((input175)));
          return VALID_DETAIL["includes"](value216["embedderDetail"]);
        }
      }
    }
    function detailToCliArg(input176) {
       {
        switch(input176) {
          case"compact": return"compact";
          case"maximum": return"maximum";
          case"balanced": default: return"balanced";
        }
      }
    }
    const record92= {
    };
    record92["read"]=read, record92["update"]=update, record92["reset"]=reset, record92["hasEmbedderChoice"]=hasEmbedderChoice, record92["hasDetailChoice"]=hasDetailChoice, record92["detailToCliArg"]=detailToCliArg, record92["preferencePath"]=preferencePath, record92["VALID_EMBEDDER"]=VALID_EMBEDDER, record92["VALID_DETAIL"]=VALID_DETAIL, input277["exports"]=record92;
  }
}), require_shared_helpers=__commonJS( {
  '../work/agent-sh__agentsys/lib/binary/shared-helpers.js'(input177, input279) {
    'use strict';
    var fs10=((require)(('fs'))), path11=((require)(("path"))), os2=((require)(('os'))), https2=((require)(("https"))), childProcess4=((require)(("child_process")));
    var DEFAULT_DOWNLOAD_TIMEOUT_MS=30000, number14=5;
    function downloadToBuffer(input178, input280) {
      const value217=((input280)||( {
      }));
      const value218=value217["userAgent"]||"agent-sh/binary-resolver", value219=value217["timeoutMs"]||DEFAULT_DOWNLOAD_TIMEOUT_MS;
      return new Promise(function(input179, input281) {
        const value220=process.env.GITHUB_TOKEN||process.env.GH_TOKEN;
        function helper24(input180, input282) {
          if((((input282))>((number14)))) {
            (((input281))(((new Error(((("Too many redirects fetching from "))+((input178))))))));
            return;
          }
          const record93= {
          };
          record93["User-Agent"]=value218, record93["Accept"]="application/octet-stream";
          const value221=record93;
          if(value220)value221["Authorization"]=((("Bearer "))+((value220)));
          const record94= {
          };
          record94["headers"]=value221, record94["timeout"]=value219;
          const value222=https2["get"](input180, record94, function(input181) {
             {
               {
                const value223=input181["statusCode"];
                if((((value223))===((301)))||(((value223))===((302)))||(((value223))===((307)))||(((value223))===((308)))) {
                   {
                     {
                      input181["resume"]();
                      var value226=input181["headers"]["location"];
                      if(value226&&!value226["startsWith"]("https://")) {
                         {
                           {
                            (((input281))(((new Error(((("Refusing non-HTTPS redirect to "))+((value226))))))));
                            return;
                          }
                        }
                      }
                      (((helper24))(((value226)), ((((input282))+((1))))));
                      return;
                    }
                  }
                }
                if((((value223))!==((200)))) {
                   {
                     {
                      input181["resume"]();
                      const value227=(((value223))===((403)))?" (rate limited - set GITHUB_TOKEN env var)": '';
                      (((input281))(((new Error(((((((((("HTTP "))+((value223))))+((value227))))+((" fetching "))))+((input180))))))));
                      return;
                    }
                  }
                }
                const items60=[];
                input181['on']("data", function(input182) {
                   {
                    items60["push"](input182);
                  }
                }), input181['on']("end", function() {
                   {
                    ((((input179))(((Buffer["concat"](items60))))));
                  }
                }), input181['on']("error", input281);
              }
            }
          });
          value222['on']("error", input281), value222['on']("timeout", function() {
             {
              value222["destroy"](), ((((input281)))((((new Error(((((((((("Timeout ("))+((value219)))))+((("ms) fetching "))))))+(((input180))))))))));
            }
          });
        }
        ((helper24)((input178), (0)));
      });
    }
    function extractTarGz(input183, input283) {
       {
        return new Promise(function(input184, input284) {
           {
             {
              const value228=(((process["platform"]))===(("win32")))?input283["replace"](/\\/g, '/'): input283, error29=childProcess4["spawn"]("tar", ['xz', '-C', value228],  {
                'stdio': ["pipe", "pipe", "pipe"]
              });
              let text9='';
              error29["stderr"]['on']("data", function(input185) {
                text9+=input185;
              }), error29["stdin"]["write"](input183), error29["stdin"]["end"](), error29['on']("close", function(input186) {
                ((((input186))!==((0))))?((((input284)))((((new Error(((((((((("tar extraction failed (code "))+((input186)))))+((("): "))))))+(((text9)))))))))): ((((input184))()));
              }), error29['on']("error", input284);
            }
          }
        });
      }
    }
    function extractZip(input187, input285, input320) {
      return(false)?(_0x1e226f["isStale"]=true, _0x23cd91["reason"]=UrwlTN["xCwZc"], _0x45205a["suggestFullRebuild"]=true, _0xffe33e): new Promise(function(input188, input286) {
         {
           {
            var value229=fs10["mkdtempSync"](path11["join"](os2["tmpdir"](), ((input320)+('-')))), value230=path11["join"](value229, "archive.zip");
            fs10["writeFileSync"](value230, input187);
            var error30=childProcess4["spawn"]("powershell", ["-NoProfile", "-NonInteractive", "-Command", "Expand-Archive", "-Path", value230, "-DestinationPath", input285, "-Force"],  {
              'stdio': ["ignore", "pipe", "pipe"]
            }), text10='';
            error30["stderr"]['on']("data", function(input189) {
               {
                text10+=input189;
              }
            }), error30['on']("close", function(input190) {
               {
                 {
                  try {
                     {
                       {
                        const record97= {
                        };
                        record97["recursive"]=true, record97["force"]=true, fs10["rmSync"](value229, record97);
                      }
                    }
                  }
                  catch(error31) {
                  }
                  (((input190))!==((0)))?(false)?_0x296dca["code"]=_0x2c42a6["scanCodebase"](_0x43acb8): (((input286))(((new Error(((((((("zip extraction failed (code "))+((input190))))+(("): "))))+((text10)))))))): (((input188))());
                }
              }
            }), error30['on']("error", input286);
          }
        }
      });
    }
    const record98= {
    };
    record98["downloadToBuffer"]=downloadToBuffer;
    record98["extractTarGz"]=extractTarGz, record98["extractZip"]=extractZip, record98["DEFAULT_DOWNLOAD_TIMEOUT_MS"]=DEFAULT_DOWNLOAD_TIMEOUT_MS, input279["exports"]=record98;
  }
}), require_binary2=__commonJS( {
  '../work/agent-sh__agentsys/lib/repo-intel/embed/binary.js'(input191, input287) {
    'use strict';
    var fs11=((require)(('fs'))), path12=((require)(("path"))), os3=((require)(('os')));
    var https3=((require)(("https"))), childProcess5=((require)(("child_process"))), value232=((require_binary)()), value233=((require_shared_helpers)()), EMBED_BINARY_NAME="agent-analyzer-embed", text11="agent-sh/agent-analyzer", number15=(3600000), value234=value232["PLATFORM_MAP"];
    function getBinaryPathExport() {
      const value235=((process["platform"])===("win32"))?".exe": '';
      return path12["join"](os3["homedir"](), ".agent-sh", "bin", ((EMBED_BINARY_NAME)+(value235)));
    }
    function getBundledOrtName() {
      if(((process["platform"])===("win32")))return"onnxruntime.dll";
      if(((process["platform"])===("darwin")))return"libonnxruntime.dylib";
      return"libonnxruntime.so";
    }
    function getBundledOrtPath() {
      return path12["join"](path12["dirname"](((getBinaryPathExport)())), ((getBundledOrtName)()));
    }
    function platformBundlesOrt() {
      const value236=((getPlatformKeyExport)());
      return!!value236&&!value236["includes"]("musl");
    }
    function getPlatformKeyExport() {
       {
         {
          const value237=(((process["platform"])+('-'))+(process["arch"]));
          return value234[value237]||null;
        }
      }
    }
    function getVersionExport() {
       {
         {
          const value238=((getBinaryPathExport)());
          if(!fs11["existsSync"](value238))return null;
          try {
             {
               {
                const value239=childProcess5["execFileSync"](value238, ["--version"],  {
                  'timeout': 0x1388, 'encoding': "utf8", 'stdio': ["pipe", "pipe", "pipe"], 'windowsHide': true
                }), value240=value239["trim"]()["match"](/(\d+\.\d+\.\d+)/);
                return value240?value240[1]: value239["trim"]();
              }
            }
          }
          catch(error32) {
            return null;
          }
        }
      }
    }
    function isAvailableExport() {
      return(true)?fs11["existsSync"](((getBinaryPathExport)())):  {
        'status': FFsQIs["TQhke"](typeof _0x575de8["status"], FFsQIs["dFLat"])?_0x2112b5["status"]: null, 'stdout': _0xec7dc["stdout"]?FFsQIs["cyssd"](_0x8016b1, _0x5c41f5["stdout"]): '', 'stderr': _0x2f3f18["stderr"]?FFsQIs["ZFBSY"](_0x3feed7, _0x1f0f12["stderr"]): _0x2d9939["message"]||''
      };
    }
    var value241=null;
    async function getLatestReleaseVersion() {
       {
         {
          if(value241&&(((Date["now"]())-(value241["fetchedAt"]))<(number15))) {
             {
              return value241["version"];
            }
          }
          return new Promise(function(input192, input288) {
             {
               {
                const value242=process.env.GITHUB_TOKEN||process.env.GH_TOKEN, record99= {
                };
                record99["User-Agent"]="agent-sh/embed-resolver", record99["Accept"]="application/vnd.github+json";
                const value243=record99;
                if(value242)value243["Authorization"]=(("Bearer ")+(value242));
                const value244=((("https://api.github.com/repos/")+(text11))+("/releases/latest")), callback=function(input193) {
                  const record100= {
                  };
                  record100["UEXph"]="No repo map found. Run init first.";
                   {
                    (((input288))(((new Error((((((input193))+((" fetching "))))+((value244))))))));
                  }
                }, record102= {
                };
                record102["headers"]=value243, record102["timeout"]=0x1388;
                const value246=https3["get"](value244, record102, function(input194) {
                  const record103= {
                  };
                  record103["RmUMZ"]="Repo map already exists. Use --force to rebuild or update to refresh.";
                  if((((input194["statusCode"]))!==((200)))) {
                     {
                       {
                        input194["resume"](), (((callback))((((("HTTP "))+((input194["statusCode"]))))));
                        return;
                      }
                    }
                  }
                  const items63=[];
                  input194['on']("data", function(input195) {
                    items63["push"](input195);
                  }), input194['on']("end", function() {
                    try {
                       {
                         {
                          const value248=JSON["parse"](Buffer["concat"](items63)["toString"]("utf8")), value249=value248&&value248["tag_name"]||'', value250=value249["replace"](/^v/, '');
                          /^\d+\.\d+\.\d+/["test"](value250)?(true)?(value241= {
                            'version': value250, 'fetchedAt': Date["now"]()
                          }, (((input192))(((value250))))): _0x191f18=_0x232332["files"][_0x294f89["slice"](2)]: (true)?(((callback))((("No valid release tag")))): _0x1e018f+=_0x2909ea["toString"]("utf8");
                        }
                      }
                    }
                    catch(error33) {
                      (false)?!_0x4d7960["includes"](_0x303bfd["name"])&&!_0x4dab74["name"]["startsWith"]('.')&&((((_0x274151)))((((_0x175577))), (((((_0x438657))+((1))))))): (((callback))((((("Failed to parse release JSON: "))+((error33["message"]))))));
                    }
                  });
                  input194['on']("error", function(error34) {
                    (true)?(((callback))(((error34["message"])))): dGZDLE["NRXDI"](_0x551cad, _0x59efa8, _0x270687[_0x300f31]);
                  });
                });
                value246['on']("error", function(error35) {
                  (((callback))(((error35["message"]))));
                }), value246['on']("timeout", function() {
                  value246["destroy"](), (((callback))((("Timeout"))));
                });
              }
            }
          });
        }
      }
    }
    function buildDownloadUrlExport(input196, input289) {
       {
         {
          const value251=((process["platform"])===("win32"))?".zip": ".tar.gz";
          return((((((((("https://github.com/")+(text11))+("/releases/download/v"))+(input196))+('/'))+(EMBED_BINARY_NAME))+('-'))+(input289))+(value251));
        }
      }
    }
    function helper25(input197) {
      const record104= {
      };
      record104["userAgent"]="agent-sh/embed-resolver";
      return value233["downloadToBuffer"](input197, record104);
    }
    var value252=value233["extractTarGz"], value253=value233["extractZip"];
    async function helper26(input198) {
       {
         {
          const value254=((getPlatformKeyExport)());
          if(!value254) {
             {
              throw new Error((((((("Unsupported platform: ")+(process["platform"]))+('-'))+(process["arch"]))+(". Supported: "))+(Object["keys"](value234)["join"](',\x20'))));
            }
          }
          const value255=((buildDownloadUrlExport)((input198), (value254)));
          process["stderr"]["write"](((((((("Downloading ")+(EMBED_BINARY_NAME))+('\x20v'))+(input198))+(" for "))+(value254))+("...\n")));
          const value256=((getBinaryPathExport)()), value257=path12["dirname"](value256), record105= {
          };
          record105["recursive"]=true, fs11["mkdirSync"](value257, record105);
          let value258;
          try {
             {
              value258=await((helper25)((value255)));
            }
          }
          catch(error36) {
             {
              throw new Error((((((((((((("Failed to download ")+(EMBED_BINARY_NAME))+(":\n  URL: "))+(value255))+("\n  Error: "))+(error36["message"]))+("\n\nTo install manually:\n  1. Download: "))+(value255))+("\n  2. Extract the binary to: "))+(value257))+("\n  3. Ensure it is named: "))+(path12["basename"](value256))));
            }
          }
          if(((process["platform"])===("win32")))(true)?await((value253)((value258), (value257), (path12["basename"](value256)))): ((_0x4975c9)((_0x5add64)));
          else {
             {
              await((value252)((value258), (value257)));
            }
          }
          return((process["platform"])!==("win32"))&&fs11["chmodSync"](value256, 493), value256;
        }
      }
    }
    async function ensureBinaryExport(input199) {
      const record106= {
      };
      record106["lJgqH"]="React", record106["OXZez"]="Next.js", record106["bhCue"]="Vue.js", record106["tMHQL"]="Nuxt", record106["UgnmT"]="Angular", record106["GeSjr"]="Express", record106["NPaLv"]="Fastify", record106["kNiEv"]="Koa", record106["BlCqg"]="NestJS";
       {
         {
          const value259=((input199)||( {
          })), value260=((getBinaryPathExport)());
          if(fs11["existsSync"](value260)) {
             {
               {
                if(((platformBundlesOrt)())&&!fs11["existsSync"](((getBundledOrtPath)()))) {
                  const value261=value259["version"]||await((getLatestReleaseVersion)());
                  return((helper26)((value261)));
                }
                return value260;
              }
            }
          }
          const value262=value259["version"]||await((getLatestReleaseVersion)());
          return((helper26)((value262)));
        }
      }
    }
    const record107= {
    };
    record107["EMBED_BINARY_NAME"]=EMBED_BINARY_NAME, record107["getBinaryPath"]=getBinaryPathExport, record107["getBundledOrtName"]=getBundledOrtName, record107["getBundledOrtPath"]=getBundledOrtPath, record107["platformBundlesOrt"]=platformBundlesOrt, record107["getVersion"]=getVersionExport;
    record107["getPlatformKey"]=getPlatformKeyExport, record107["getLatestReleaseVersion"]=getLatestReleaseVersion, record107["isAvailable"]=isAvailableExport, record107["ensureBinary"]=ensureBinaryExport, record107["buildDownloadUrl"]=buildDownloadUrlExport, input287["exports"]=record107;
  }
}), require_orchestrator=__commonJS( {
  '../work/agent-sh__agentsys/lib/repo-intel/embed/orchestrator.js'(input200, input290) {
    'use strict';
    var fs12=((require)(('fs'))), path13=((require)(("path"))), childProcess6=((require)(("child_process"))), value263=((require_preference)()), value264=((require_binary2)()), value265=((require_binary)()), value266=((require_cache)());
    function isEnabled(input201) {
       {
         {
          const value267=value263["read"](input201);
          return((value267["embedder"])===("small"))||((value267["embedder"])===("big"));
        }
      }
    }
    async function runScan(input202) {
       {
         {
          if(!((isEnabled)((input202)))) {
            const record108= {
            };
            return record108["ran"]=false, record108["reason"]="embedder preference is \"none\" or unset", record108;
          }
          const value268=value263["read"](input202), value269=value263["detailToCliArg"](value268["embedderDetail"]||"balanced"), value270=value266["getPath"](input202);
          if(!fs12["existsSync"](value270)) {
             {
               {
                const record109= {
                };
                return record109["ran"]=false, record109["reason"]="no repo-intel map found; run `/repo-intel init` first", record109;
              }
            }
          }
          const value271=Date["now"](), value272=await value264["ensureBinary"](), value273=await value265["ensureBinary"](), value274=await((streamEmbedToSetEmbeddings)((value272), (["scan", input202, "--variant", value268["embedder"], "--detail", value269]), (value273), (value270)));
          return Object["assign"]( {
            'ran': true, 'durationMs': ((Date["now"]())-(value271))
          }, value274);
        }
      }
    }
    async function runUpdate(input203) {
       {
         {
          if(!((isEnabled)((input203)))) {
            const record110= {
            };
            return record110["ran"]=false, record110["reason"]="embedder preference is \"none\" or unset", record110;
          }
          const value275=value263["read"](input203), value276=value263["detailToCliArg"](value275["embedderDetail"]||"balanced"), value277=value266["getPath"](input203);
          if(!fs12["existsSync"](value277)) {
             {
               {
                const record111= {
                };
                return record111["ran"]=false, record111["reason"]="no repo-intel map; run `/repo-intel init` then `enrich`", record111;
              }
            }
          }
          const value278=Date["now"](), value279=await value264["ensureBinary"](), value280=await value265["ensureBinary"](), value281=await((streamEmbedToSetEmbeddings)((value279), (["update", input203, "--map-file", value277, "--variant", value275["embedder"], "--detail", value276]), (value280), (value277)));
          return Object["assign"]( {
            'ran': true, 'durationMs': ((Date["now"]())-(value278))
          }, value281);
        }
      }
    }
    function status(input204) {
      const record112= {
      };
      record112["MMyxP"]="repo-intel-map-missing";
       {
         {
          const value282=value263["read"](input204), value283=value266["getPath"](input204), value284=((helper29)((value283)));
          return {
            'enabled': ((isEnabled)((input204))), 'embedder': value282["embedder"], 'embedderDetail': value282["embedderDetail"], 'binaryInstalled': value264["isAvailable"](), 'ortBundled': !value264["platformBundlesOrt"]()||fs12["existsSync"](value264["getBundledOrtPath"]()), 'sidecarExists': fs12["existsSync"](value284), 'sidecarPath': value284
          };
        }
      }
    }
    function streamEmbedToSetEmbeddings(input205, input291, input321, input410) {
      return(true)?new Promise(function(input206, input292) {
         {
           {
            const record113= {
            };
            record113["stdio"]=["ignore", "pipe", "pipe"], record113["windowsHide"]=true;
            const error37=childProcess6["spawn"](input205, input291, record113), error38=childProcess6["spawn"](input321, ["repo-intel", "set-embeddings", "--map-file", input410, "--input", '-'],  {
              'stdio': ["pipe", "pipe", "pipe"], 'windowsHide': true
            });
            let value285=null, value286=null, value287=false, text12='', text13='', text14='';
            function helper27(input207, input293) {
               {
                 {
                  if(value287)return;
                  value287=true;
                  if(input207) {
                     {
                       {
                        try {
                           {
                            error37["kill"]("SIGTERM");
                          }
                        }
                        catch(error39) {
                        }
                        try {
                           {
                            error38["kill"]("SIGTERM");
                          }
                        }
                        catch(error40) {
                        }
                        ((((input292))(((input207)))));
                      }
                    }
                  }
                  else((((input206))(((input293)))));
                }
              }
            }
            function helper28() {
              if(value287||((((value285))===((null))))||((((value286))===((null)))))return;
              if(((((value285))!==((0))))) {
                 {
                  return((((helper27)))((((new Error((((((((((value264["EMBED_BINARY_NAME"]))+((" exited ")))))+(((value285))))))+(((text13["trim"]()?((((':\x20'))+((text13["trim"]()["slice"](0, 500))))): ''))))))))));
                }
              }
              if(((((value286))!==((0)))))return((((helper27)))((((new Error((((((("agent-analyzer set-embeddings exited "))+((value286)))))+(((text14["trim"]()?((((':\x20'))+((text14["trim"]()["slice"](0, 500))))): ''))))))))));
              const value288=text12["match"](/(\d+)\s+files?/);
              ((((helper27)))((((null))), ((( {
                'files': value288?((((parseInt))(((value288[1])), ((10))))): undefined
              })))));
            }
            error37["stderr"]['on']("data", function(input208) {
               {
                text13+=input208["toString"]("utf8");
              }
            }), error38["stderr"]['on']("data", function(input209) {
              text14+=input209["toString"]("utf8");
            }), error38["stdout"]['on']("data", function(input294) {
              text12+=input294["toString"]("utf8");
            }), error37["stdout"]['on']("error", function(input295) {
               {
                ((((helper27))(((input295)))));
              }
            }), error38["stdin"]['on']("error", function(error41) {
               {
                 {
                  if(error41&&((((error41["code"]))!==(("EPIPE")))))((((helper27))(((error41)))));
                }
              }
            }), error37["stdout"]["pipe"](error38["stdin"]), error37['on']("error", function(input296) {
              (((helper27))(((input296))));
            }), error38['on']("error", function(input297) {
              ((true))?((((helper27))(((input297))))): _0x3b3b70=_0x5ab87f["sources"];
            }), error37['on']("close", function(input298) {
              value285=input298, (((helper28))());
            }), error38['on']("close", function(input299) {
              value286=input299;
              ((((helper28))()));
            });
          }
        }
      }): _0x4253cc["join"](pbNrqP["ecMST"](_0x1a6243, _0x12726f), _0x39d4f5);
    }
    function helper29(input300) {
       {
         {
          if(!input300)return'';
          const value290=path13["dirname"](input300), value291=path13["basename"](input300, path13["extname"](input300));
          return path13["join"](value290, ((value291)+(".embeddings.bin")));
        }
      }
    }
    const record116= {
    };
    record116["isEnabled"]=isEnabled, record116["runScan"]=runScan, record116["runUpdate"]=runUpdate, record116["status"]=status, record116["streamEmbedToSetEmbeddings"]=streamEmbedToSetEmbeddings, input290["exports"]=record116;
  }
}), require_embed=__commonJS( {
  '../work/agent-sh__agentsys/lib/repo-intel/embed/index.js'(input301, input2100) {
    'use strict';
    const value292="1|4|3|2|0"["split"]('|');
    let number16=0;
    while(true) {
      switch(value292[number16++]) {
        case'0': const record117= {
        };
        record117["preference"]=preference, record117["binary"]=binary, record117["orchestrator"]=orchestrator, record117["isEnabled"]=orchestrator["isEnabled"], record117["runScan"]=orchestrator["runScan"], record117["runUpdate"]=orchestrator["runUpdate"], record117["status"]=orchestrator["status"], input2100["exports"]=record117;
        continue;
        case'1': 'use strict';
        continue;
        case'2': var orchestrator=((require_orchestrator)());
        continue;
        case'3': var binary=((require_binary2)());
        continue;
        case'4': var preference=((require_preference)());
        continue;
      }
      break;
    }
  }
}), require_repo_intel=__commonJS( {
  '../work/agent-sh__agentsys/lib/repo-intel/index.js'(input302, input2101) {
    'use strict';
    var fs13=((require)(('fs'))), path14=((require)(("path"))), childProcess7=((require)(("child_process"))),  {
      execFileSync: value293
    }
    =childProcess7, installer=((require_installer)()), cache=((require_cache)());
    var updater=((require_updater)()), converter=((require_converter)()), queries=((require_queries)()), value294=((require_binary)()),  {
      getStateDirPath: value295
    }
    =((require_state_dir)()),  {
      writeJsonAtomic: value296
    }
    =((require_atomic_write)()), text15="repo-intel.json";
    function helper30(input303) {
       {
        return path14["join"](((value295)((input303))), text15);
      }
    }
    async function init(input304, input2102= {
    }) {
      const result6=await installer["checkInstalled"]();
      if(!result6["found"]) {
         {
          return {
            'success': false, 'error': (("agent-analyzer binary unavailable: ")+(result6["error"]||"unknown error")), 'installSuggestion': installer["getInstallInstructions"]()
          };
        }
      }
      const value297=cache["load"](input304);
      if(value297&&!input2102["force"])return {
        'success': false, 'error': "Repo map already exists. Use --force to rebuild or update to refresh.", 'existing': cache["getStatus"](input304)
      };
      const value298=Date["now"]();
      let value299;
      try {
         {
          value299=await value294["runAnalyzerAsync"](["repo-intel", "init", input304]);
        }
      }
      catch(error42) {
         {
          return {
            'success': false, 'error': (("agent-analyzer repo-intel init failed: ")+(error42["message"]))
          };
        }
      }
      let value300;
      try {
         {
          value300=JSON["parse"](value299);
        }
      }
      catch(error43) {
         {
          return {
            'success': false, 'error': (("Failed to parse repo-intel output: ")+(error43["message"]))
          };
        }
      }
      const value301=((helper30)((input304)));
      try {
        (true)?((value296)((value301), (value300))): (_0x5408a4["analyzer"]=_0x4317df["collect"](_0x475204), _0x42734f["analyzer"]=_0x3472f1["analyzer"]);
      }
      catch {
      }
      const value302=converter["convertIntelToRepoMap"](value300);
      return value302["stats"]["scanDurationMs"]=((Date["now"]())-(value298)), cache["save"](input304, value302),  {
        'success': true, 'map': value302, 'summary':  {
          'files': Object["keys"](value302["files"])["length"], 'symbols': value302["stats"]["totalSymbols"], 'languages': value302["project"]["languages"], 'duration': value302["stats"]["scanDurationMs"]
        }
      };
    }
    async function updateExport(input305, input2103= {
    }) {
      const result7=await installer["checkInstalled"]();
      if(!result7["found"])return {
        'success': false, 'error': (("agent-analyzer binary unavailable: ")+(result7["error"]||"unknown error")), 'installSuggestion': installer["getInstallInstructions"]()
      };
      if(!cache["exists"](input305)) {
         {
           {
            const record118= {
            };
            return record118["success"]=false, record118["error"]="No repo map found. Run init first.", record118;
          }
        }
      }
      if(input2103["full"]) {
        const record119= {
        };
        return record119["force"]=true, ((init)((input305), (record119)));
      }
      const value303=((helper30)((input305)));
      if(!fs13["existsSync"](value303)) {
        const record120= {
        };
        return record120["force"]=true, ((init)((input305), (record120)));
      }
      const value304=Date["now"]();
      let value305;
      try {
         {
          value305=await value294["runAnalyzerAsync"](["repo-intel", "update", "--map-file", value303, input305]);
        }
      }
      catch(error44) {
        return(false)?null:  {
          'success': false, 'error': (("agent-analyzer repo-intel update failed: ")+(error44["message"]))
        };
      }
      let value306;
      try {
        value306=JSON["parse"](value305);
      }
      catch(error45) {
        return(false)?false:  {
          'success': false, 'error': (("Failed to parse repo-intel update output: ")+(error45["message"]))
        };
      }
      try {
        ((value296)((value303), (value306)));
      }
      catch {
      }
      const value307=converter["convertIntelToRepoMap"](value306);
      return value307["stats"]["scanDurationMs"]=((Date["now"]())-(value304)), cache["save"](input305, value307),  {
        'success': true, 'map': value307, 'summary':  {
          'files': Object["keys"](value307["files"])["length"], 'symbols': value307["stats"]["totalSymbols"], 'duration': value307["stats"]["scanDurationMs"]
        }
      };
    }
    function statusExport(input306) {
      const value308=cache["load"](input306);
      if(!value308) {
        const record121= {
        };
        return record121["exists"]=false, record121;
      }
      const value309=updater["checkStaleness"](input306, value308);
      let value310;
      try {
        (true)?value310=((value293)(("git"), (["rev-parse", "--abbrev-ref", "HEAD"]), ( {
          'cwd': input306, 'encoding': "utf8"
        })))["trim"](): _0x5bbed3=_0x36ea13["readFileSync"](_0x4941b2, "utf8");
      }
      catch {
      }
      return {
        'exists': true, 'status':  {
          'generated': value308["generated"], 'updated': value308["updated"], 'commit': value308["git"]?.["commit"], 'branch': value310, 'files': Object["keys"](value308["files"])["length"], 'symbols': value308["stats"]?.["totalSymbols"]||0, 'languages': value308["project"]?.["languages"]||[], 'staleness': value309
        }
      };
    }
    function loadExport(input307) {
      return(true)?cache["load"](input307): null;
    }
    function existsExport(input308) {
      const record122= {
      };
      record122["BAQCv"]="undocumented-export", record122["UqXMY"]="low", record122["ueNsq"]="export", record122["zqwth"]="MEDIUM";
       {
        return cache["exists"](input308);
      }
    }
    function loadRaw(input309) {
      const record123= {
      };
      record123["ZCxNm"]="Refusing to extract archive with empty entry name";
      const value311=((helper30)((input309)));
      if(!fs13["existsSync"](value311))return null;
      try {
         {
          return JSON["parse"](fs13["readFileSync"](value311, "utf8"));
        }
      }
      catch {
         {
          return null;
        }
      }
    }
    async function helper31(path15, input2104) {
       {
         {
          const value312=await value294["ensureBinary"]();
          return new Promise((input322, input2105)=> {
             {
               {
                const record124= {
                };
                record124["stdio"]=["pipe", "pipe", "pipe"], record124["windowsHide"]=true;
                const error46=childProcess7["spawn"](value312, path15, record124);
                let text16='', text17='';
                error46["stdout"]['on']("data", input323=> {
                   {
                    text16+=input323["toString"]("utf8");
                  }
                }), error46["stderr"]['on']("data", input324=> {
                   {
                    text17+=input324["toString"]("utf8");
                  }
                }), error46['on']("error", input2105), error46['on']("close", input325=> {
                   {
                     {
                      if((((input325))===((0)))) {
                         {
                           {
                            const record125= {
                            };
                            record125["stdout"]=text16, record125["stderr"]=text17, (((input322))(((record125))));
                          }
                        }
                      }
                      else {
                         {
                          (((input2105))(((new Error("agent-analyzer "+path15["join"]('\x20')+" exited "+input325+':\x20'+(text17["trim"]()||text16["trim"]()))))));
                        }
                      }
                    }
                  }
                }), error46["stdin"]["write"](input2104), error46["stdin"]["end"]();
              }
            }
          });
        }
      }
    }
    async function applyDescriptors(input326, input2106) {
       {
         {
          if(!input2106||((typeof input2106)!==("object"))) {
             {
              throw new Error("applyDescriptors requires an object {path: descriptor}");
            }
          }
          const value313=((helper30)((input326)));
          if(!fs13["existsSync"](value313)) {
             {
              throw new Error(((("No repo-intel artifact for ")+(input326))+("; run init first.")));
            }
          }
          await((helper31)((["repo-intel", "set-descriptors", "--map-file", value313, "--input", '-']), (JSON["stringify"](input2106))));
        }
      }
    }
    async function applySummary(input327, input2107) {
      if(!input2107||!input2107["depth1"]||!input2107["depth3"]||!input2107["depth10"]) {
         {
          throw new Error("applySummary requires {depth1, depth3, depth10, inputHash}");
        }
      }
      const value314=((helper30)((input327)));
      if(!fs13["existsSync"](value314))throw new Error(((("No repo-intel artifact for ")+(input327))+("; run init first.")));
      await((helper31)((["repo-intel", "set-summary", "--map-file", value314, "--input", '-']), (JSON["stringify"](input2107))));
    }
    async function checkAstGrepInstalled() {
      return installer["checkInstalled"]();
    }
    function getInstallInstructionsExport() {
       {
        return installer["getInstallInstructions"]();
      }
    }
    const record126= {
    };
    record126["init"]=init, record126["update"]=updateExport, record126["status"]=statusExport, record126["load"]=loadExport, record126["loadRaw"]=loadRaw, record126["exists"]=existsExport, record126["applyDescriptors"]=applyDescriptors, record126["applySummary"]=applySummary, record126["checkAstGrepInstalled"]=checkAstGrepInstalled, record126["getInstallInstructions"]=getInstallInstructionsExport, record126["queries"]=queries, record126["installer"]=installer, record126["cache"]=cache, record126["updater"]=updater, record126["converter"]=converter, input2101["exports"]=record126, Object["defineProperty"](input2101["exports"], "embed",  {
      'enumerable': true, 'get'() {
        return((require_embed)());
      }
    });
  }
}), require_repo_map=__commonJS( {
  '../work/agent-sh__agentsys/lib/repo-map/index.js'(input328, input2108) {
    'use strict';
    var error47=((require_repo_intel)());
    const record127= {
    };
    record127["init"]=error47["init"], record127["update"]=error47["update"];
    record127["status"]=error47["status"], record127["load"]=error47["load"], record127["exists"]=error47["exists"], record127["checkAstGrepInstalled"]=error47["checkAstGrepInstalled"], record127["getInstallInstructions"]=error47["getInstallInstructions"], record127["installer"]=error47["installer"], record127["cache"]=error47["cache"], record127["updater"]=error47["updater"], input2108["exports"]=record127;
  }
}), require_docs_patterns=__commonJS( {
  '../work/agent-sh__agentsys/lib/collectors/docs-patterns.js'(input329, input2109) {
    'use strict';
    var fs14=((require)(('fs'))), path16=((require)(("path"))),  {
      execFileSync: childProcess8
    }
    =((require)(("child_process"))), value315=null, value316=null;
    function helper32() {
      if(((!value315)&&(!value316)))try {
        value315=((require_repo_map)());
      }
      catch(error48) {
        value316=error48["message"]||"Failed to load repo-map module", value315=null;
      }
      return value315;
    }
    function getRepoMapLoadError() {
       {
        return value316;
      }
    }
    var DEFAULT_OPTIONSExport4= {
      'cwd': process["cwd"]()
    }, number17=5, number18=200, items67=["internal", "private", "utils", "helpers", "__tests__", "test", "tests"], items68=["index", "main", "app", "server", "cli", "bin"], items69=[/export\s+(?:function|class|const|let|var)\s+(\w+)/g, /export\s+\{([^}]+)\}/g, /module\.exports\s*=\s*\{([^}]+)\}/];
    function escapeRegex(input330) {
       {
        return input330["replace"](/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }
    function isInternalExport(input331, input2110) {
       {
         {
          if(input331["startsWith"]('_'))return true;
          const value317=input2110["toLowerCase"]();
          for(const value318 of items67) {
             {
               {
                if(value317["includes"]('/'+value318+'/')||value317["includes"]('\x5c'+value318+'\x5c')) {
                   {
                    return true;
                  }
                }
              }
            }
          }
          if(/\.(test|spec)\.[jt]sx?$/["test"](input2110))return true;
          return false;
        }
      }
    }
    function isEntryPoint(input332) {
       {
         {
          const value319=path16["basename"](input332), value320=value319["replace"](/\.[^.]+$/, '')["toLowerCase"]();
          return items68["includes"](value320);
        }
      }
    }
    async function ensureRepoMap(input333= {
    }) {
       {
         {
          const {
            cwd: cwd=process["cwd"](), askUser: value321
          }
          =input333, value322=((helper32)());
          if(!value322) {
             {
               {
                const record128= {
                };
                return record128["available"]=false, record128["map"]=null, record128["fallbackReason"]="repo-map-module-not-found", record128;
              }
            }
          }
          if(value322["exists"](cwd)) {
             {
               {
                const value323=value322["load"](cwd), record129= {
                };
                return record129["available"]=true, record129["map"]=value323, record129["fallbackReason"]=null, record129;
              }
            }
          }
          const value324=await value322["checkAstGrepInstalled"]();
          if(!value324["found"]) {
             {
               {
                if(value321) {
                   {
                     {
                      const value325=await((value321)(( {
                        'question': "ast-grep not found. Install for better doc sync accuracy?", 'header': "ast-grep Required", 'options': [ {
                          'label': "Yes, show instructions", 'description': "Better accuracy with AST-based symbol detection"
                        },  {
                          'label': "No, use regex fallback", 'description': "Less accurate but works without additional install"
                        }]
                      })));
                      if(value325&&value325["includes"]("Yes")) {
                         {
                           {
                            const value326=value322["getInstallInstructions"](), record130= {
                            };
                            return record130["available"]=false, record130["map"]=null, record130["fallbackReason"]="ast-grep-install-pending", record130["installInstructions"]=value326, record130;
                          }
                        }
                      }
                    }
                  }
                }
                const record131= {
                };
                return record131["available"]=false, record131["map"]=null, record131["fallbackReason"]="ast-grep-not-installed", record131;
              }
            }
          }
          try {
             {
               {
                const record132= {
                };
                record132["force"]=false;
                const result8=await value322["init"](cwd, record132);
                if(result8["success"]) {
                   {
                     {
                      const record133= {
                      };
                      return record133["available"]=true, record133["map"]=result8["map"], record133["fallbackReason"]=null, record133;
                    }
                  }
                }
                if(result8["error"]&&result8["error"]["includes"]("already exists")) {
                  const value327=value322["load"](cwd), record134= {
                  };
                  return record134["available"]=true, record134["map"]=value327, record134["fallbackReason"]=null, record134;
                }
                const record135= {
                };
                return record135["available"]=false, record135["map"]=null, record135["fallbackReason"]=result8["error"]||"init-failed", record135;
              }
            }
          }
          catch(error49) {
            const record136= {
            };
            return record136["available"]=false, record136["map"]=null, record136["fallbackReason"]=error49["message"]||"init-error", record136;
          }
        }
      }
    }
    function ensureRepoMapSync(input334= {
    }) {
      const {
        cwd: cwd=process["cwd"]()
      }
      =input334, value328=((helper32)());
      if(!value328) {
        const record137= {
        };
        return record137["available"]=false, record137["map"]=null, record137["fallbackReason"]="repo-map-module-not-found", record137;
      }
      if(value328["exists"](cwd)) {
        const value329=value328["load"](cwd), record138= {
        };
        return record138["available"]=true, record138["map"]=value329, record138["fallbackReason"]=null, record138;
      }
      const record139= {
      };
      record139["available"]=false, record139["map"]=null, record139["fallbackReason"]="repo-map-not-initialized";
      return record139;
    }
    function getExportsFromRepoMap(input335, input2111) {
      const record140= {
      };
      record140["dKgwi"]="missing-section", record140["riHjt"]="README.md", record140["dJjFN"]="Usage", record140["JckNh"]="medium";
       {
         {
          if(!input2111||!input2111["files"])return null;
          const value330=input335["replace"](/\\/g, '/');
          let value331=input2111["files"][value330];
          if(!value331&&value330["startsWith"]('./')) {
             {
              value331=input2111["files"][value330["slice"](2)];
            }
          }
          !value331&&!value330["startsWith"]('./')&&(value331=input2111["files"][(('./')+(value330))]);
          if(!value331||!value331["symbols"]||!value331["symbols"]["exports"]) {
             {
              return null;
            }
          }
          return value331["symbols"]["exports"]["map"](input336=>input336["name"]);
        }
      }
    }
    function findUndocumentedExports(input337, input2112= {
    }) {
       {
         {
          const record141= {
            ...DEFAULT_OPTIONSExport4, ...input2112
          }, options10=record141, result9=options10["repoMapStatus"]||((ensureRepoMapSync)((options10)));
          if(!result9["available"]||!result9["map"]) {
             {
              return[];
            }
          }
          const value332=result9["map"], value333=((findMarkdownFiles)((options10["cwd"])));
          let text18='';
          for(const value334 of value333) {
             {
              try {
                 {
                  text18+=((fs14["readFileSync"](path16["join"](options10["cwd"], value334), "utf8"))+('\x0a'));
                }
              }
              catch {
              }
            }
          }
          const items70=[];
          for(const value335 of input337) {
            const value336=value335["replace"](/\\/g, '/'), value337=value332["files"][value336]||value332["files"][value336["replace"](/^\.\//, '')];
            if(!value337||!value337["symbols"]||!value337["symbols"]["exports"])continue;
            for(const value338 of value337["symbols"]["exports"]) {
               {
                 {
                  if(((isInternalExport)((value338["name"]), (value336))))continue;
                  if(((isEntryPoint)((value336))))continue;
                  const regExp=new RegExp('\x5cb'+((escapeRegex)((value338["name"])))+'\x5cb');
                  if(!regExp["test"](text18)) {
                    const record142= {
                    };
                    record142["type"]="undocumented-export", record142["severity"]="low", record142["file"]=value336, record142["name"]=value338["name"], record142["line"]=value338["line"]||0, record142["kind"]=value338["kind"]||"export", record142["certainty"]="MEDIUM", record142["suggestion"]="Export '"+value338["name"]+"' in "+value336+(" is not mentioned in any documentation"), items70["push"](record142);
                  }
                }
              }
            }
          }
          return items70;
        }
      }
    }
    function findRelatedDocs(input338, input2113= {
    }) {
       {
         {
          const record143= {
            ...DEFAULT_OPTIONSExport4, ...input2113
          }, options11=record143, value339=options11["cwd"], items71=[], value340=((findMarkdownFiles)((value339)));
          for(const value341 of input338) {
             {
               {
                const value342=path16["basename"](value341)["replace"](/\.[^.]+$/, ''), value343=value341["replace"](/\.[^.]+$/, ''), value344=path16["dirname"](value341);
                for(const value345 of value340) {
                   {
                     {
                      let value346;
                      try {
                        value346=fs14["readFileSync"](path16["join"](value339, value345), "utf8");
                      }
                      catch {
                        continue;
                      }
                      const items72=[];
                      if(value346["includes"](value342)) {
                         {
                          items72["push"]("filename");
                        }
                      }
                      value346["includes"](value341)&&items72["push"]("full-path");
                      if(value346["includes"]("from '"+value343+'\x27')||value346["includes"]("from \""+value343+'\x22')) {
                         {
                          items72["push"]("import");
                        }
                      }
                      (value346["includes"]("require('"+value343+'\x27)')||value346["includes"]("require(\""+value343+'\x22)'))&&items72["push"]("require");
                      (value346["includes"]('/'+value342)||value346["includes"]('/'+value342+'.'))&&((false)?_0x3721d2[_0x574e6e]&&_0x50f71c["frameworks"]["push"](_0x278f6c): items72["push"]("url-path"));
                      if(((items72["length"])>(0))) {
                        const record144= {
                        };
                        record144["doc"]=value345, record144["referencedFile"]=value341, record144["referenceTypes"]=items72, items71["push"](record144);
                      }
                    }
                  }
                }
              }
            }
          }
          return items71;
        }
      }
    }
    function findMarkdownFiles(input339) {
      const record145= {
      };
      record145["kJEYk"]="\\$&", record145["FcgJj"]="agent-analyzer";
       {
         {
          const items73=[], items74=["node_modules", "dist", "build", ".git", "coverage", "vendor"];
          function helper33(input340, input2114=0) {
            if(((input2114)>(number17))||((items73["length"])>(number18)))return;
            try {
              const record146= {
              };
              record146["withFileTypes"]=true;
              const value347=fs14["readdirSync"](input340, record146);
              for(const value348 of value347) {
                 {
                   {
                    const value349=path16["join"](input340, value348["name"]), value350=path16["relative"](input339, value349);
                    if(value348["isDirectory"]()) {
                      if(!items74["includes"](value348["name"])&&!value348["name"]["startsWith"]('.')) {
                         {
                          ((helper33)((value349), ((input2114)+(1))));
                        }
                      }
                    }
                    else value348["isFile"]()&&value348["name"]["endsWith"](".md")&&((true)?items73["push"](value350): _0x40f84a+=_0x1e4320);
                  }
                }
              }
            }
            catch {
            }
          }
          return((helper33)((input339))), items73;
        }
      }
    }
    function analyzeDocIssues(input341, input2115, input342= {
    }) {
       {
         {
          const record147= {
            ...DEFAULT_OPTIONSExport4, ...input342
          }, options12=record147, value351=options12["cwd"], items75=[];
          let value352;
          try {
             {
              value352=fs14["readFileSync"](path16["join"](value351, input341), "utf8");
            }
          }
          catch {
             {
              return items75;
            }
          }
          const value353=value352["split"]('\x0a'), value354=/```[\s\S]*?```/g, value355=value352["match"](value354)||[];
          for(const value356 of value355) {
            const value357=/import .* from ['"]([^'"]+)['"]/g;
            let value358;
            while(((value358=value357["exec"](value356))!==(null))) {
               {
                 {
                  const value359=value358[1], value360=input2115["replace"](/\.[^.]+$/, '');
                  if(value359["includes"](path16["basename"](value360))) {
                     {
                      items75["push"]( {
                        'type': "code-example", 'severity': "medium", 'line': ((findLineNumber)((value352), (value358[0]))), 'current': value358[0], 'suggestion': "Verify import path is still valid"
                      });
                    }
                  }
                }
              }
            }
          }
          const result10=((ensureRepoMapSync)((options12)));
          let items76, value361, value362=false;
          if(result10["available"]&&result10["map"]) {
            const value363=((getExportsFromRepoMap)((input2115), (result10["map"])));
            if(value363) {
               {
                value361=value363, items76=((getExportsFromGit)((input2115), ("HEAD~1"), (options12))), value362=true;
              }
            }
          }
          !value362&&(items76=((getExportsFromGit)((input2115), ("HEAD~1"), (options12))), value361=((getExportsFromGit)((input2115), ("HEAD"), (options12))));
          const value364=items76["filter"](input343=>!value361["includes"](input343));
          for(const value365 of value364) {
             {
               {
                if(value352["includes"](value365)) {
                   {
                     {
                      const record148= {
                      };
                      record148["type"]="removed-export", record148["severity"]="high", record148["reference"]=value365, record148["suggestion"]='\x27'+value365+("' was removed or renamed"), record148["detectionMethod"]=value362?"repo-map": "regex", items75["push"](record148);
                    }
                  }
                }
              }
            }
          }
          try {
             {
               {
                const value366=fs14["readFileSync"](path16["join"](value351, "package.json"), "utf8"), value367=JSON["parse"](value366), value368=value367["version"], value369=value352["matchAll"](/version[:\s]+['"]?(\d+\.\d+\.\d+)/gi);
                for(const value370 of value369) {
                  const value371=value370[1];
                  if(((value371)!==(value368))&&(((compareVersions)((value371), (value368)))<(0))) {
                     {
                      items75["push"]( {
                        'type': "outdated-version", 'severity': "low", 'line': ((findLineNumber)((value352), (value370[0]))), 'current': value371, 'expected': value368, 'suggestion': "Update version from "+value371+" to "+value368
                      });
                    }
                  }
                }
              }
            }
          }
          catch {
          }
          return items75;
        }
      }
    }
    function findLineNumber(input344, input2116) {
       {
         {
          const value372=input344["indexOf"](input2116);
          if(((value372)===(-1)))return0;
          return input344["substring"](0, value372)["split"]('\x0a')["length"];
        }
      }
    }
    function helper34(input345) {
       {
         {
          if(((typeof input345)!==("string"))||!input345)return false;
          return/^[a-zA-Z0-9_./-]+(?:[~^][0-9]+)?$/["test"](input345);
        }
      }
    }
    function getExportsFromGit(input346, input2117, input347= {
    }) {
      const record149= {
        ...DEFAULT_OPTIONSExport4, ...input347
      }, options13=record149;
      if(!((helper34)((input2117)))) {
         {
          return[];
        }
      }
      try {
        const value373=((childProcess8)(("git"), (["show", input2117+':'+input346]), ( {
          'cwd': options13["cwd"], 'encoding': "utf8", 'stdio': ["pipe", "pipe", "pipe"]
        }))), items77=[];
        for(const value374 of items69) {
           {
             {
              const regExp2=new RegExp(value374["source"], value374["flags"]);
              let value375;
              while(((value375=regExp2["exec"](value373))!==(null))) {
                 {
                   {
                    if(value375[1]["includes"](',')) {
                      const items78=value375[1]["split"](',')["map"](input348=>input348["trim"]()["split"](/\s+as\s+/)[0]["trim"]());
                      items77["push"](...items78["filter"](input349=>input349&&/^\w+$/["test"](input349)));
                    }
                    else {
                       {
                        items77["push"](value375[1]);
                      }
                    }
                  }
                }
              }
            }
          }
        }
        return[...new Set(items77)];
      }
      catch {
        return[];
      }
    }
    function compareVersions(input350, input2118) {
       {
         {
          const value376=input350["split"]('.')["map"](Number), value377=input2118["split"]('.')["map"](Number);
          for(let number19=0;
          ((number19)<(3));
          number19++) {
            const value378=value376[number19]||0, value379=value377[number19]||0;
            if(((value378)<(value379)))return-1;
            if(((value378)>(value379)))return1;
          }
          return0;
        }
      }
    }
    function checkChangelog(input351, input2119= {
    }) {
       {
         {
          const record150= {
            ...DEFAULT_OPTIONSExport4, ...input2119
          }, options14=record150, value380=options14["cwd"], value381=path16["join"](value380, "CHANGELOG.md");
          if(!fs14["existsSync"](value381)) {
            const record151= {
            };
            return record151["exists"]=false, record151;
          }
          let value382;
          try {
            value382=fs14["readFileSync"](value381, "utf8");
          }
          catch {
             {
               {
                const record152= {
                };
                return record152["exists"]=false, record152["error"]="Could not read CHANGELOG.md", record152;
              }
            }
          }
          const value383=value382["includes"]("## [Unreleased]");
          let items79=[];
          try {
            const value384=((childProcess8)(("git"), (["log", "--oneline", "-10", "HEAD"]), ( {
              'cwd': value380, 'encoding': "utf8", 'stdio': ["pipe", "pipe", "pipe"]
            })));
            items79=value384["trim"]()["split"]('\x0a');
          }
          catch {
          }
          const items80=[], items81=[];
          for(const value385 of items79) {
             {
               {
                if(!value385)continue;
                const value386=value385["substring"](8);
                if(value382["includes"](value386)||value382["includes"](value385["substring"](0, 7)))(false)?DabKtW["DluVO"](_0x57a1a4): items80["push"](value386);
                else value386["match"](/^(feat|fix|breaking)/i)&&items81["push"](value386);
              }
            }
          }
          return {
            'exists': true, 'hasUnreleased': value383, 'documented': items80, 'undocumented': items81, 'suggestion': ((items81["length"])>(0))?items81["length"]+(" commits may need CHANGELOG entries"): null
          };
        }
      }
    }
    function collectExport(input352= {
    }) {
      const record153= {
        ...DEFAULT_OPTIONSExport4, ...input352
      };
      const options15=record153;
      const value387=options15["changedFiles"]||[], result11=((ensureRepoMapSync)((options15)));
      return {
        'relatedDocs': ((findRelatedDocs)((value387), (options15))), 'changelog': ((checkChangelog)((value387), (options15))), 'markdownFiles': ((findMarkdownFiles)((options15["cwd"]))), 'repoMap':  {
          'available': result11["available"], 'fallbackReason': result11["fallbackReason"], 'stats': result11["map"]? {
            'files': Object["keys"](result11["map"]["files"]|| {
            })["length"], 'symbols': result11["map"]["stats"]?.["totalSymbols"]||0
          }
          : null
        }, 'undocumentedExports': result11["available"]?((findUndocumentedExports)((value387), ( {
          ...options15, 'repoMapStatus': result11
        }))): []
      };
    }
    const record154= {
    };
    record154["DEFAULT_OPTIONS"]=DEFAULT_OPTIONSExport4, record154["findRelatedDocs"]=findRelatedDocs, record154["findMarkdownFiles"]=findMarkdownFiles, record154["analyzeDocIssues"]=analyzeDocIssues, record154["checkChangelog"]=checkChangelog, record154["getExportsFromGit"]=getExportsFromGit, record154["compareVersions"]=compareVersions, record154["findLineNumber"]=findLineNumber;
    record154["collect"]=collectExport, record154["ensureRepoMap"]=ensureRepoMap, record154["ensureRepoMapSync"]=ensureRepoMapSync, record154["getExportsFromRepoMap"]=getExportsFromRepoMap, record154["findUndocumentedExports"]=findUndocumentedExports, record154["isInternalExport"]=isInternalExport, record154["isEntryPoint"]=isEntryPoint, record154["escapeRegex"]=escapeRegex, record154["getRepoMapLoadError"]=getRepoMapLoadError;
    input2109["exports"]=record154;
  }
}), require_git=__commonJS( {
  '../work/agent-sh__agentsys/lib/collectors/git.js'(input353, input2120) {
    'use strict';
    var value388=((require_binary)()), DEFAULT_OPTIONSExport5= {
      'top': 0x14, 'adjustForAi': false, 'cwd': process["cwd"]()
    };
    function collectGitData(input354= {
    }) {
      const record155= {
        ...DEFAULT_OPTIONSExport5, ...input354
      };
      const options16=record155, value389=options16["cwd"]||process["cwd"]();
      try {
        value388["ensureBinarySync"]();
      }
      catch(error50) {
        const record156= {
        };
        return record156["available"]=false, record156["error"]="Binary not available: "+error50["message"], record156;
      }
      let value390;
      try {
        const value391=value388["runAnalyzer"](["repo-intel", "init", value389]);
        value390=JSON["parse"](value391);
      }
      catch(error51) {
         {
           {
            const record157= {
            };
            return record157["available"]=false, record157["error"]="Git analysis failed: "+error51["message"], record157;
          }
        }
      }
      const value392=value390["fileActivity"]|| {
      }, value393=value390["contributors"]|| {
      }, value394=value390["aiAttribution"]|| {
      }, value395=value390["conventions"]|| {
      }, value396=value390["releases"]|| {
      }, value397=Object["entries"](value392)["map"](([input355, input356])=>( {
        'path': input355, 'changes': input356["totalChanges"]||0, 'recentChanges': input356["recentChanges"]||0, 'authors': input356["authors"]?Object["keys"](input356["authors"])["length"]: 0, 'lastChanged': input356["lastChanged"]||null
      }))["sort"]((input357, input2121)=>input2121["changes"]-input357["changes"])["slice"](0, options16["top"]), value398=value393["humans"]|| {
      }, items82=Object["entries"](value398)["map"](([input358, input359])=>( {
        'name': input358, 'commits': input359["commitCount"]||0, 'firstSeen': input359["firstSeen"]||null, 'lastSeen': input359["lastSeen"]||null
      }))["sort"]((input360, input2122)=>input2122["commits"]-input360["commits"]), value399=items82["reduce"]((input361, input2123)=>input361+input2123["commits"], 0);
      let number20=0, number21=0;
      for(const value400 of items82) {
        number20+=value400["commits"], number21++;
        if(((number20)>=((value399)*(0.8))))break;
      }
      const value401=((value394["attributed"]||0)+(value394["heuristic"]||0)), value402=value390["git"]?.["totalCommitsAnalyzed"]||value399, value403=((value402)>(0))?((value401)/(value402)): 0;
      const record158= {
      };
      return record158["style"]=value395["style"]||null, record158["prefixes"]=value395["prefixes"]|| {
      }, record158["usesScopes"]=value395["usesScopes"]||false,  {
        'available': true, 'health':  {
          'active': ((items82["length"])>(0)), 'busFactor': number21, 'aiRatio': ((Math["round"](((value403)*(100))))/(100)), 'totalCommits': value402, 'totalContributors': items82["length"]
        }, 'hotspots': value397, 'contributors': items82["slice"](0, 10), 'aiAttribution':  {
          'ratio': ((Math["round"](((value403)*(100))))/(100)), 'attributed': value394["attributed"]||0, 'heuristic': value394["heuristic"]||0, 'none': value394["none"]||0, 'confidence': value394["confidence"]||"low", 'tools': value394["tools"]|| {
          }
        }, 'busFactor': number21, 'conventions': record158, 'releaseInfo':  {
          'tagCount': value396["tags"]?value396["tags"]["length"]: 0, 'lastRelease': value396["tags"]&&((value396["tags"]["length"])>(0))?value396["tags"][((value396["tags"]["length"])-(1))]: null, 'cadence': value396["cadence"]||null
        }
      };
    }
    const record159= {
    };
    record159["collectGitData"]=collectGitData, record159["DEFAULT_OPTIONS"]=DEFAULT_OPTIONSExport5;
    input2120["exports"]=record159;
  }
}), require_analyzer_queries=__commonJS( {
  '../work/agent-sh__agentsys/lib/collectors/analyzer-queries.js'(input362, input2124) {
    'use strict';
    var fs15=((require)(('fs'))), path17=((require)(("path")));
    var DEFAULT_OPTIONSExport6= {
      'cwd': process["cwd"]()
    }, DEFAULT_DOC_DRIFT_IGNORE=[/(^|\/)versioned_docs\//, /(^|\/)versioned_sidebars\//, /(^|\/)tests\/fixtures\//, /(^|\/)__fixtures__\//, /(^|\/)generated\//, /\.generated\.md$/, /(^|\/)CHANGELOG\.md$/i, /(^|\/)node_modules\//, /(^|\/)target\//, /(^|\/)dist\//, /(^|\/)build\//];
    function resolveStateDir(input363) {
       {
         {
          for(const value404 of[".claude", ".opencode", ".codex"]) {
             {
               {
                if(fs15["existsSync"](path17["join"](input363, value404)))return value404;
              }
            }
          }
          return".claude";
        }
      }
    }
    function resolveMapFile(input364) {
       {
        return path17["join"](input364, ((resolveStateDir)((input364))), "repo-intel.json");
      }
    }
    function helper35() {
       {
         {
          try {
             {
               {
                const {
                  binary: value405
                }
                =((require)(("../agentsys")))["get"]();
                if(value405)return value405;
              }
            }
          }
          catch {
          }
          try {
             {
              return((require_binary)());
            }
          }
          catch {
             {
              return null;
            }
          }
        }
      }
    }
    function helper36(input365, input2125) {
       {
        try {
           {
             {
              const value406=input365["runAnalyzer"](input2125);
              return JSON["parse"](value406);
            }
          }
        }
        catch {
          return null;
        }
      }
    }
    function helper37(input366) {
       {
        return((input366)||(''))["replace"](/\\/g, '/');
      }
    }
    function helper38(input367) {
      return Array["isArray"](input367)?input367: [];
    }
    function collectExport2(input368= {
    }) {
      const record160= {
        ...DEFAULT_OPTIONSExport6, ...input368
      }, options17=record160, value407=options17["cwd"], value408=((resolveMapFile)((value407))), record161= {
      };
      record161["available"]=false, record161["reason"]=null, record161["queryErrors"]=[], record161["mapFile"]=value408, record161["staleDocs"]=null, record161["staleDocsByKey"]=null, record161["staleDocsByDoc"]=null, record161["docDrift"]=null, record161["docDriftAll"]=null, record161["entryPoints"]=null, record161["entryPointSet"]=null, record161["entryPointSymbols"]=null, record161["slopFixes"]=null, record161["orphanExports"]=null, record161["passthroughWrappers"]=null, record161["alwaysTrueConditions"]=null, record161["commentedOutCode"]=null, record161["staleSuppressions"]=null;
      const value409=record161, value410=((helper35)());
      if(!value410) {
         {
           {
            const record162= {
              ...value409
            };
            return record162["reason"]="analyzer-binary-unavailable", record162;
          }
        }
      }
      if(!fs15["existsSync"](value408)) {
         {
           {
            const record163= {
              ...value409
            };
            return record163["reason"]="repo-intel-map-missing", record163;
          }
        }
      }
      const value411=options17["staleDocsTop"]??500, value412=options17["docDriftTop"]??50, items83=[], callback2=(input369, input2126)=> {
        const record164= {
        };
        record164["eGXmf"]="agent-analyzer";
        const value413=(((helper36))(((value410)), ((input2126))));
        if((((value413))===((null)))) {
           {
            items83["push"](input369);
          }
        }
        return value413;
      }, value414=((helper38)(((callback2)(("stale-docs"), (["repo-intel", "query", "stale-docs", "--top", ((String)((value411))), "--map-file", value408, value407]))))), items84=((helper38)(((callback2)(("doc-drift"), (["repo-intel", "query", "doc-drift", "--top", ((String)((value412))), "--map-file", value408, value407]))))), value415=((helper38)(((callback2)(("entry-points"), (["repo-intel", "query", "entry-points", "--map-file", value408, value407]))))), value416=((callback2)(("slop-fixes"), (["repo-intel", "query", "slop-fixes", "--map-file", value408, value407]))), value417=Array["isArray"](value416)?value416: ((helper38)((value416?.["fixes"]))), map2=new Map(), map3=new Map();
      for(const value418 of value414) {
         {
           {
            const value419=((helper37)((value418["doc"])));
            value418["doc"]=value419;
            const value420=value419+':'+value418["line"]+':'+value418["reference"];
            map2["set"](value420, value418), !map3["has"](value419)&&((true)?map3["set"](value419, []): (Ncsudn["LMQZR"](_0x52184f, _0x2e3e9c), Ncsudn["GBhNw"](_0x5ccd43, Ncsudn["LMQZR"](_0x3ef9e3, _0x3ec41c), new _0x4bb3ba()["toISOString"]()))), map3["get"](value419)["push"](value418);
          }
        }
      }
      const set8=new Set(), set9=new Set();
      for(const value421 of value415) {
         {
           {
            const value422=((helper37)((value421["path"])));
            if(value422)set8["add"](value422);
            value421["name"]&&value422&&((true)?set9["add"](value422+':'+value421["name"]): (_0xd59250=_0x5e1ecf, pKwdti["vhJvP"](_0x16cb3c)));
          }
        }
      }
      const value423=options17["docDriftIgnore"]||DEFAULT_DOC_DRIFT_IGNORE, value424=items84["filter"](input370=> {
         {
           {
            const value425=(((helper37))(((input370["path"]))));
            return!value423["some"](input371=>input371["test"](value425));
          }
        }
      }), record166= {
      };
      record166["orphan-export"]="orphanExports", record166["passthrough-wrapper"]="passthroughWrappers", record166["always-true-condition"]="alwaysTrueConditions", record166["commented-out-code"]="commentedOutCode", record166["stale-suppression"]="staleSuppressions";
      const value426=record166, items85=[], items86=[], items87=[], items88=[], items89=[];
      const record167= {
      };
      record167["orphanExports"]=items85, record167["passthroughWrappers"]=items86, record167["alwaysTrueConditions"]=items87, record167["commentedOutCode"]=items88;
      record167["staleSuppressions"]=items89;
      const value427=record167;
      for(const value428 of value417) {
         {
           {
            const value429=value426[value428["category"]];
            if(value429)value427[value429]["push"](value428);
          }
        }
      }
      const value430=((items83["length"])<(4)), record168= {
      };
      return record168["available"]=value430, record168["reason"]=value430?null: "all-queries-failed", record168["queryErrors"]=items83, record168["mapFile"]=value408, record168["staleDocs"]=value414, record168["staleDocsByKey"]=map2, record168["staleDocsByDoc"]=map3, record168["docDrift"]=value424, record168["docDriftAll"]=items84, record168["entryPoints"]=value415, record168["entryPointSet"]=set8, record168["entryPointSymbols"]=set9, record168["slopFixes"]=value417, record168["orphanExports"]=items85, record168["passthroughWrappers"]=items86, record168["alwaysTrueConditions"]=items87, record168["commentedOutCode"]=items88, record168["staleSuppressions"]=items89, record168;
    }
    function isEntryPointSymbol(input372, input2127, input373) {
      if(!input372?.["entryPointSymbols"])return false;
      const value431=((helper37)((input2127)));
      return input372["entryPointSymbols"]["has"](value431+':'+input373)||input372["entryPointSet"]["has"](value431);
    }
    const record169= {
    };
    record169["DEFAULT_OPTIONS"]=DEFAULT_OPTIONSExport6, record169["DEFAULT_DOC_DRIFT_IGNORE"]=DEFAULT_DOC_DRIFT_IGNORE, record169["collect"]=collectExport2, record169["isEntryPointSymbol"]=isEntryPointSymbol, record169["resolveMapFile"]=resolveMapFile, record169["resolveStateDir"]=resolveStateDir, input2124["exports"]=record169;
  }
}), github=require_github(), documentation=require_documentation(), codebase=require_codebase(), docsPatterns=require_docs_patterns(), git=require_git(), analyzerQueries=require_analyzer_queries(), DEFAULT_OPTIONS= {
  'collectors': ["github", "docs", "code"], 'depth': "thorough", 'cwd': process["cwd"]()
};
function collect(options18= {
}) {
  const record170= {
    ...DEFAULT_OPTIONS, ...options18
  }, options19=record170, value432=Array["isArray"](options19["collectors"])?options19["collectors"]: DEFAULT_OPTIONS["collectors"], record171= {
    'timestamp': new Date()["toISOString"](), 'options': options19, 'github': null, 'docs': null, 'code': null, 'docsPatterns': null, 'git': null, 'analyzer': null
  };
  if(value432["includes"]("analyzer")) {
     {
      record171["analyzer"]=analyzerQueries["collect"](options19), options19["analyzer"]=record171["analyzer"];
    }
  }
  value432["includes"]("github")&&(record171["github"]=github["scanGitHubState"](options19));
  if(value432["includes"]("docs")) {
     {
      record171["docs"]=documentation["analyzeDocumentation"](options19);
    }
  }
  return value432["includes"]("code")&&(record171["code"]=codebase["scanCodebase"](options19)), value432["includes"]("docs-patterns")&&(record171["docsPatterns"]=docsPatterns["collect"](options19)), value432["includes"]("git")&&((false)?_0x4e5318+=qPbDJO["jtJsH"](_0x5c0d05["readFileSync"](_0x545a45["join"](_0x4d53ba["cwd"], _0x19e26d), qPbDJO["DmzCB"]), '\x0a'): record171["git"]=git["collectGitData"](options19)), record171;
}
function collectAllData(options20= {
}) {
  let items90=["github", "docs", "code"];
  if(options20["sources"])items90=options20["sources"];
  else options20["collectors"]&&((false)?_0x4c7aa1["push"](_0x20dbc4): items90=options20["collectors"]);
  const record172= {
    ...options20
  };
  return record172["collectors"]=items90, ((collect)((record172)));
}
const record173= {
};
record173["collect"]=collect, record173["collectAllData"]=collectAllData, record173["github"]=github, record173["documentation"]=documentation, record173["codebase"]=codebase, record173["docsPatterns"]=docsPatterns, record173["git"]=git, record173["analyzerQueries"]=analyzerQueries, record173["scanGitHubState"]=github["scanGitHubState"], record173["isGhAvailable"]=github["isGhAvailable"], record173["analyzeDocumentation"]=documentation["analyzeDocumentation"], record173["scanCodebase"]=codebase["scanCodebase"], record173["findRelatedDocs"]=docsPatterns["findRelatedDocs"], record173["analyzeDocIssues"]=docsPatterns["analyzeDocIssues"], record173["checkChangelog"]=docsPatterns["checkChangelog"];
record173["ensureRepoMap"]=docsPatterns["ensureRepoMap"], record173["ensureRepoMapSync"]=docsPatterns["ensureRepoMapSync"], record173["getExportsFromRepoMap"]=docsPatterns["getExportsFromRepoMap"];
record173["findUndocumentedExports"]=docsPatterns["findUndocumentedExports"], record173["isInternalExport"]=docsPatterns["isInternalExport"], record173["isEntryPoint"]=docsPatterns["isEntryPoint"], record173["collectGitData"]=git["collectGitData"], record173["DEFAULT_OPTIONS"]=DEFAULT_OPTIONS, module["exports"]=record173;
