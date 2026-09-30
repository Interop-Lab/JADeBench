var __getOwnPropNames=Object["getOwnPropertyNames"], __commonJS=(_0xb642d6, _0x52a843)=>function _0x45fa10() {
  
  function helperFunction(_0x5d0758, _0xa130bd) {
    return _0x543fdb(_0x5d0758, _0xa130bd- -1384);
  }function helperFunction2(_0x1f047d, _0x282c18) {
    return _0x543fdb(_0x1f047d, _0x282c18- -1890);
  }const _0x3c8592= {
  };
  return _0x3c8592["exports"]= {
  },
  (_0x52a843||(0, _0xb642d6[((__getOwnPropNames)((_0xb642d6)))[0]])((_0x52a843=_0x3c8592)["exports"], _0x52a843), _0x52a843["exports"]);
},
require_github=__commonJS({
  '../work/agent-sh__agentsys/lib/collectors/github.js'(_0x71aa0e, _0x1b04ce) {
    'use strict';
    
    var {
      execFileSync:_0x2677dd
    }=require("child_process"), _0x4c3485= {
      'issueLimit':0x64, 'prLimit':0x32, 'milestoneLimit':0x64, 'timeout':0x2710, 'cwd':process["cwd"]()
    };
    function helperFunction5(_0x1fdc1d, _0xaf22dd= {
    }) {
      const _0x25f5bc=((helperFunction8)((_0x1fdc1d), (_0xaf22dd)));
      function helperFunction3(_0x4c51a3, _0x2a7ca5) {
        return _0x1503b6(_0x2a7ca5- -1558, _0x4c51a3);
      }function helperFunction4(_0x1bb97c, _0x50106c) {
        return _0x1503b6(_0x50106c- -627, _0x1bb97c);
      }return _0x25f5bc['ok']?_0x25f5bc["data"]:null;
    }function helperFunction8(_0x5aac7c, _0x3c9ce7= {
    }) {
      
      function helperFunction6(_0x419241, _0x24d456) {
        return _0x5a8eab(_0x24d456-677, _0x419241);
      }function helperFunction7(_0x1517cb, _0x40060b) {
        return _0x5a8eab(_0x1517cb-0x122, _0x40060b);
      }try {
        const _0x50f8e2=((_0x2677dd)(('gh'), (_0x5aac7c), ({
          'encoding':"utf8", 'stdio':"pipe", 'timeout':_0x3c9ce7["timeout"]||10000, 'cwd':_0x3c9ce7["cwd"]||_0x4c3485["cwd"]
        })));
        try {
          return {
            'ok':true, 'data':JSON["parse"](_0x50f8e2)
          };
        } catch(_0x17d9fd) {
          return {
            'ok':false, 'error': {
              'type':"parse", 'message':"Failed to parse gh output as JSON: "+_0x17d9fd["message"], 'raw':_0x50f8e2["slice"](0, 500)
            }
          };
        }
      } catch(_0x41d59d) {
        return {
          'ok':false, 'error': {
            'type':_0x41d59d["killed"]?"timeout":"process", 'message':_0x41d59d["message"], 'exitCode':_0x41d59d["status"]??null, 'stderr':_0x41d59d["stderr"]?((String)((_0x41d59d["stderr"])))["trim"]():''
          }
        };
      }
    }function helperFunction14() {
      
      function helperFunction9(_0x2c05f9, _0x2900fd) {
        return _0x1503b6(_0x2c05f9- -105, _0x2900fd);
      }function helperFunction10(_0x34a0ce, _0x154f15) {
        return _0x1503b6(_0x154f15- -1637, _0x34a0ce);
      }
      try {
        return ((_0x2677dd)(('gh'), (["auth", "status"]), ({
          'encoding':"utf8", 'stdio':"pipe", 'timeout':0x1388
        }))), true;
      } catch {
        return false;
      }
    }function helperFunction17(_0x388671) {
      function helperFunction15(_0x40df85, _0x4942cc) {
        return _0x1503b6(_0x4942cc- -1318, _0x40df85);
      }function helperFunction16(_0x5ba985, _0x475d5b) {
        return _0x1503b6(_0x5ba985- -634, _0x475d5b);
      }return {
        'number':_0x388671["number"], 'title':_0x388671["title"], 'labels':(_0x388671["labels"]||[])["map"](_0x384c17=>_0x384c17["name"]||_0x384c17), 'milestone':_0x388671["milestone"]?.["title"]||_0x388671["milestone"]||null, 'createdAt':_0x388671["createdAt"], 'updatedAt':_0x388671["updatedAt"], 'snippet':_0x388671["body"]?((_0x388671["body"]["slice"](0, 200)["replace"](/\n/g, '\x20')["trim"]())+((_0x388671["body"]["length"]>200)?"...":'')):''
      };
    }function helperFunction20(_0x28f1ca) {
      
      function helperFunction18(_0x4463b2, _0xb099a5) {
        return _0x1503b6(_0xb099a5- -1623, _0x4463b2);
      }function helperFunction19(_0x2a8a37, _0xc0cfb9) {
        return _0x1503b6(_0xc0cfb9- -618, _0x2a8a37);
      }return {
        'number':_0x28f1ca["number"], 'title':_0x28f1ca["title"], 'labels':(_0x28f1ca["labels"]||[])["map"](_0x14b540=>_0x14b540["name"]||_0x14b540), 'isDraft':_0x28f1ca["isDraft"], 'createdAt':_0x28f1ca["createdAt"], 'updatedAt':_0x28f1ca["updatedAt"], 'files':_0x28f1ca["files"]||[], 'snippet':_0x28f1ca["body"]?((_0x28f1ca["body"]["slice"](0, 150)["replace"](/\n/g, '\x20')["trim"]())+(((_0x28f1ca["body"]["length"])>(150))?"...":'')):''
      };
    }function helperFunction23(_0x2111d3, _0x239788) {
      function helperFunction21(_0x2a5e20, _0x1e74e2) {
        return _0x1503b6(_0x2a5e20-0x27, _0x1e74e2);
      }function helperFunction22(_0x1388ec, _0x4a952f) {
        return _0x1503b6(_0x4a952f- -609, _0x1388ec);
      }{
        const _0xcfff0d= {
        };
        _0xcfff0d["bug"]="bugs", _0xcfff0d["type: bug"]="bugs", _0xcfff0d["feature"]="features", _0xcfff0d["type: feature"]="features", _0xcfff0d["enhancement"]="enhancements", _0xcfff0d["security"]="security", _0xcfff0d["type: security"]="security";
        const _0x2d714a=_0xcfff0d, _0x46babe=Object["entries"](_0x2d714a)["map"](([_0x42e6dd, _0x137a27])=>({
          'regex':new RegExp("(^|[^a-z])"+_0x42e6dd["replace"](/[.*+?^${}()|[\]\\]/g, "\\$&")+("([^a-z]|$)"), 'i'), 'category':_0x137a27
        }));
        for(const _0x5767a5 of _0x239788) {
          {
            const _0x556b36=(_0x5767a5["labels"]||[])["map"](_0xa06bcc=>(_0xa06bcc["name"]||_0xa06bcc)["toLowerCase"]());
            let _0x24c824=false;
            const _0x8855c5= {
            };
            _0x8855c5["number"]=_0x5767a5["number"], _0x8855c5["title"]=_0x5767a5["title"];
            const _0x35a595=_0x8855c5;
            for(const {
              regex:_0x38b54b, category:_0x128554
            }of _0x46babe) {
              {
                if(_0x556b36["some"](_0x340560=>_0x38b54b["test"](_0x340560))) {
                  _0x2111d3["categorized"][_0x128554]["push"](_0x35a595), _0x24c824=true;
                  break;
                }
              }
            }!_0x24c824&&(_0x2111d3["categorized"]["other"]["push"](_0x35a595));
          }
        }
      }
    }function helperFunction28(_0x12fc2a, _0x50388d, _0x4fda31) {
      
      function helperFunction24(_0x4ae6e4, _0x11648f) {
        return _0x5a8eab(_0x4ae6e4- -25, _0x11648f);
      }
      function helperFunction27(_0x2d917f, _0x280f97) {
        return _0x5a8eab(_0x2d917f- -29, _0x280f97);
      }{
        const _0x44c1ad=new Date();
        date["setDate"](((date["getDate"]())-(_0x4fda31)));
        for(const _0x3ac95e of _0x50388d) {
          {
            const _0x1f879a=new Date(_0x3ac95e["updatedAt"]);
            if((date2<date)) {
              _0x12fc2a["stale"]["push"]({
                'number':_0x3ac95e["number"], 'title':_0x3ac95e["title"], 'lastUpdated':_0x3ac95e["updatedAt"], 'daysStale':Math["floor"]((((Date["now"]())-(date2))/(86400000)))
              });
            }
          }
        }
      }
    }function helperFunction31(_0x16226e, _0x2f0dcf) {
      function helperFunction29(_0x5340da, _0x3c62f8) {
        return _0x1503b6(_0x5340da- -41, _0x3c62f8);
      }function helperFunction30(_0x42f3d4, _0x3850a6) {
        return _0x1503b6(_0x42f3d4- -718, _0x3850a6);
      }{
        const _0x2b6ed4= {
        },
        _0x827f99=new Set(["the", 'a', 'an', 'is', "are", 'to', "for", 'in', 'on', 'at', "with", "and", 'or', 'of']);
        for(const _0x1058bc of _0x2f0dcf) {
          const _0x487e29=(_0x1058bc["title"]||'')["toLowerCase"]()["split"](/\s+/);
          for(const _0x2c8b7b of _0x487e29) {
            {
              if(((_0x2c8b7b["length"])>(3))&&!items["has"](_0x2c8b7b)) {
                _0x2b6ed4[_0x2c8b7b]=((_0x2b6ed4[_0x2c8b7b]||0)+(1));
              }
            }
          }
        }_0x16226e["themes"]=Object["entries"](_0x2b6ed4)["filter"](([, _0x1fc641])=>_0x1fc641>1)["sort"]((_0x50a0ac, _0x2835d0)=>_0x2835d0[1]-_0x50a0ac[1])["slice"](0, 10)["map"](([_0x1baedb, _0x37ac10])=>({
          'word':_0x1baedb, 'count':_0x37ac10
        }));
      }
    }function helperFunction36(_0x295b1f) {
      
      function helperFunction32(_0x6e340b, _0x567701) {
        return _0x5a8eab(_0x6e340b- -300, _0x567701);
      }function helperFunction33(_0x5e41c0, _0x52d848) {
        return _0x5a8eab(_0x52d848-0x19, _0x5e41c0);
      }const _0x364155=new Date();
      _0x295b1f["overdueMilestones"]=_0x295b1f["milestones"]["filter"](_0x2c8c42=> {
        
        function helperFunction34(_0x90f60a, _0x12e350) {
          return helperFunction32(_0x12e350-0x155, _0x90f60a);
        }function helperFunction35(_0x5882fa, _0x4817c7) {
          return helperFunction32(_0x5882fa-0x669, _0x4817c7);
        }if(!_0x2c8c42["due_on"]||(_0x2c8c42["state"]==="closed"))returnfalse;
        return(new Date(_0x2c8c42["due_on"])<date3);
      });
    }function helperFunction41(_0x4f091d= {
    }) {
      
      function helperFunction37(_0x32360a, _0x27e42b) {
        return _0x1503b6(_0x27e42b- -7, _0x32360a);
      }
      function helperFunction40(_0x395bb6, _0x5f0b47) {
        return _0x1503b6(_0x5f0b47- -620, _0x395bb6);
      }{
        const _0x3fab36= {
          ..._0x4c3485, ..._0x4f091d
        },
        _0x1bbfe9=_0x3fab36, _0x4f1c42= {
        };
        _0x4f1c42["issueCount"]=0x0, _0x4f1c42["prCount"]=0x0, _0x4f1c42["milestoneCount"]=0x0;
        const _0x3b27f8= {
        };
        _0x3b27f8["requestedLimit"]=_0x1bbfe9["issueLimit"], _0x3b27f8["fetchedCount"]=0x0, _0x3b27f8["hasMore"]=false;
        const _0x2d8300= {
        };
        _0x2d8300["requestedLimit"]=_0x1bbfe9["prLimit"], _0x2d8300["fetchedCount"]=0x0, _0x2d8300["hasMore"]=false;
        const _0x484734= {
        };
        _0x484734["requestedLimit"]=_0x1bbfe9["milestoneLimit"], _0x484734["fetchedCount"]=0x0, _0x484734["hasMore"]=false;
        const _0x7fa5= {
        };
        _0x7fa5["issues"]=_0x3b27f8, _0x7fa5["prs"]=_0x2d8300, _0x7fa5["milestones"]=_0x484734;
        const _0x15ea04= {
        };
        _0x15ea04["bugs"]=[], _0x15ea04["features"]=[], _0x15ea04["security"]=[], _0x15ea04["enhancements"]=[], _0x15ea04["other"]=[];
        const _0x442a0f= {
        };
        _0x442a0f["available"]=false, _0x442a0f["partial"]=false, _0x442a0f["errors"]=[], _0x442a0f["summary"]=_0x4f1c42, _0x442a0f["issues"]=[], _0x442a0f["prs"]=[], _0x442a0f["milestones"]=[], _0x442a0f["overdueMilestones"]=[], _0x442a0f["pagination"]=_0x7fa5, _0x442a0f["categorized"]=_0x15ea04, _0x442a0f["stale"]=[], _0x442a0f["themes"]=[];
        const _0x41f8d3=_0x442a0f;
        if(!((helperFunction14)())) {
          return _0x41f8d3["error"]="gh CLI not available or not authenticated", _0x41f8d3;
        }_0x41f8d3["available"]=true;
        const _0x505db4=helperFunction8(["issue", "list", "--state", "open", "--json", "number,title,labels,milestone,createdAt,updatedAt,body", "--limit", String(_0x1bbfe9["issueLimit"])], _0x1bbfe9);
        if(_0x505db4['ok']&&Array["isArray"](_0x505db4["data"])) {
          const _0x446228=_0x505db4["data"];
          _0x41f8d3["issues"]=data["map"](helperFunction17), _0x41f8d3["summary"]["issueCount"]=data["length"], _0x41f8d3["pagination"]["issues"]["fetchedCount"]=data["length"], _0x41f8d3["pagination"]["issues"]["hasMore"]=((_0x1bbfe9["issueLimit"])>(0))&&(data["length"]>=_0x1bbfe9["issueLimit"]), ((helperFunction23)((_0x41f8d3), (data))), helperFunction28(_0x41f8d3, data, 90), ((helperFunction31)((_0x41f8d3), (data)));
        } else {
          if(!_0x505db4['ok']) {
            {
              const _0x419063= {
                'source':"issues", ..._0x505db4["error"]
              };
              _0x41f8d3["errors"]["push"](_0x419063);
            }
          }
        }const _0x13d8f1=((helperFunction8)((['pr', "list", "--state", "open", "--json", "number,title,labels,isDraft,createdAt,updatedAt,body,files", "--limit", ((String)((_0x1bbfe9["prLimit"])))]), (_0x1bbfe9)));
        if(_0x13d8f1['ok']&&Array["isArray"](_0x13d8f1["data"])) {
          {
            const _0x561fb0=_0x13d8f1["data"];
            _0x41f8d3["prs"]=data2["map"](helperFunction20), _0x41f8d3["summary"]["prCount"]=data2["length"], _0x41f8d3["pagination"]["prs"]["fetchedCount"]=data2["length"], _0x41f8d3["pagination"]["prs"]["hasMore"]=((_0x1bbfe9["prLimit"])>(0))&&((data2["length"])>=(_0x1bbfe9["prLimit"]));
          }
        } else {
          if(!_0x13d8f1['ok']) {
            {
              const _0x372c85= {
                'source':"prs", ..._0x13d8f1["error"]
              };
              _0x41f8d3["errors"]["push"](_0x372c85);
            }
          }
        }const _0x7201e4=((helperFunction8)((["api", "repos/{owner}/{repo}/milestones", "--paginate", "--slurp"]), (_0x1bbfe9)));
        if(_0x7201e4['ok']&&Array["isArray"](_0x7201e4["data"])) {
          const _0x2ca485=_0x7201e4["data"], _0xa30f78=data3["flatMap"](_0x2b26fc=>Array["isArray"](_0x2b26fc)?_0x2b26fc:[]), _0x4cb3c5=_0xa30f78["map"](_0x4b7479=>({
            'title':_0x4b7479["title"], 'state':_0x4b7479["state"], 'due_on':_0x4b7479["due_on"], 'open_issues':_0x4b7479["open_issues"], 'closed_issues':_0x4b7479["closed_issues"]
          }));
          _0x41f8d3["pagination"]["milestones"]["fetchedCount"]=_0x4cb3c5["length"], _0x41f8d3["pagination"]["milestones"]["hasMore"]=((_0x1bbfe9["milestoneLimit"])>(0))&&((_0x4cb3c5["length"])>(_0x1bbfe9["milestoneLimit"])), _0x41f8d3["milestones"]=_0x4cb3c5["slice"](0, _0x1bbfe9["milestoneLimit"]), _0x41f8d3["summary"]["milestoneCount"]=_0x41f8d3["milestones"]["length"], ((helperFunction36)((_0x41f8d3)));
        } else {
          if(!_0x7201e4['ok']) {
            {
              const _0x489451= {
                'source':"milestones", ..._0x7201e4["error"]
              };
              _0x41f8d3["errors"]["push"](_0x489451);
            }
          }
        }_0x41f8d3["partial"]=((_0x41f8d3["errors"]["length"])>(0));
        if(_0x41f8d3["partial"]&&false) {
          _0x41f8d3["error"]="Partial GitHub data collected";
        }return _0x41f8d3;
      }
    }const _0x2390e0= {
    };
    _0x2390e0["DEFAULT_OPTIONS"]=_0x4c3485;
    _0x2390e0["scanGitHubState"]=helperFunction41, _0x2390e0["isGhAvailable"]=helperFunction14, _0x2390e0["execGh"]=helperFunction5, _0x2390e0["summarizeIssue"]=helperFunction17, _0x2390e0["summarizePR"]=helperFunction20, _0x2390e0["categorizeIssues"]=helperFunction23, _0x2390e0["findStaleItems"]=helperFunction28, _0x2390e0["extractThemes"]=helperFunction31, _0x2390e0["findOverdueMilestones"]=helperFunction36;
    _0x1b04ce["exports"]=_0x2390e0;
  }
}), require_documentation=__commonJS({
  '../work/agent-sh__agentsys/lib/collectors/documentation.js'(_0x43b1bc, _0x374c1d) {
    'use strict';
    
    var _0x43ad3f=require('fs'), _0x1c1208=((require)(("path"))), _0x474075= {
      'depth':"thorough", 'cwd':process["cwd"]()
    };
    function helperFunction44(_0x103e6a, _0xa8af1f) {
      function helperFunction42(_0x48763e, _0x237763) {
        return helperFunction48(_0x48763e- -231, _0x237763);
      }function helperFunction43(_0x1bc04f, _0xc635e1) {
        return helperFunction48(_0x1bc04f-261, _0xc635e1);
      }const _0x578389=pathModule["resolve"](_0xa8af1f, _0x103e6a);
      return _0x578389["startsWith"](pathModule["resolve"](_0xa8af1f));
    }function helperFunction47(_0x35e75d, _0x5dfb18) {
      const _0xbd9e0f=pathModule["resolve"](_0x5dfb18, _0x35e75d);
      function helperFunction45(_0x21e0a2, _0x5383e3) {
        return helperFunction59(_0x5383e3, _0x21e0a2-0x4d8);
      }function helperFunction46(_0x3927e5, _0x15a6c6) {
        return helperFunction59(_0x3927e5, _0x15a6c6-0x26b);
      }if(!((helperFunction44)((_0x35e75d), (_0x5dfb18))))return null;
      try {
        return fsModule["readFileSync"](_0xbd9e0f, "utf8");
      } catch {
        return null;
      }
    }function helperFunction48(_0x1af8eb, _0x5d6359) {
      return _0x3f8685(_0x1af8eb- -1519, _0x5d6359);
    }function helperFunction51(_0x18270f, _0x23f41c) {
      
      function helperFunction49(_0x4b09c3, _0xefd1d5) {
        return helperFunction59(_0x4b09c3, _0xefd1d5-0x4ce);
      }function helperFunction50(_0x5bd8c0, _0x4dfece) {
        return helperFunction59(_0x4dfece, _0x5bd8c0-716);
      }{
        const _0x5a27db=_0x18270f["match"](/^##\s{1,1000}(.+)$/gm)||[], _0x35c114=_0x5a27db["slice"](0, 10)["map"](_0xbde2fa=>_0xbde2fa["replace"](/^##\s+/, '')), _0x5656b5=_0x35c114["map"](_0x468fd4=>_0x468fd4["toLowerCase"]())["join"]('\x20');
        return {
          'path':_0x23f41c, 'sectionCount':_0x5a27db["length"], 'sections':_0x35c114, 'hasInstallation':/install|setup|getting.started/i["test"](_0x5656b5), 'hasUsage':/usage|how.to|example/i["test"](_0x5656b5), 'hasApi':/api|reference|methods/i["test"](_0x5656b5), 'hasTesting':/test|spec|coverage/i["test"](_0x5656b5), 'codeBlocks':Math["floor"]((((_0x18270f["match"](/```/g)||[])["length"])/(2))), 'wordCount':_0x18270f["split"](/\s+/)["length"]
        };
      }
    }function helperFunction58(_0x152203, _0x2ca78b) {
      
      function helperFunction52(_0x1ce266, _0x199030) {
        return helperFunction59(_0x1ce266, _0x199030-0x30d);
      }function helperFunction53(_0x247dfd, _0x572055) {
        return helperFunction59(_0x572055, _0x247dfd-0x6c8);
      }
      {
        const _0x43d62a=(_0x2ca78b["match"](/^[-*]\s+\[x\]/gim)||[])["length"], _0x1441ad=(_0x2ca78b["match"](/^[-*]\s+\[\s\]/gim)||[])["length"];
        _0x152203["checkboxes"]["checked"]+=length, _0x152203["checkboxes"]["unchecked"]+=length2, _0x152203["checkboxes"]["total"]+=((length)+(length2));
      }
    }function helperFunction59(_0x2f48c6, _0x2a73d3) {
      return _0x3f8685(_0x2a73d3- -1785, _0x2f48c6);
    }function helperFunction62(_0x311e31, _0x4f1317) {
      
      function helperFunction60(_0x557b7f, _0x2d8f32) {
        return helperFunction48(_0x557b7f- -102, _0x2d8f32);
      }function helperFunction61(_0x9f67de, _0x263664) {
        return helperFunction48(_0x9f67de-0x51d, _0x263664);
      }{
        const _0x167417=/^[-*]\s{1,100}\*{0,2}([^\n]{1,2000}?)\*{0,2}(?:\s{0,100}[-–]\s{0,100}([^\n]{1,2000}))?$/gm;
        let _0x388d9b;
        while(((_0x388d9b=_0x167417["exec"](_0x4f1317))!==(null))&&((_0x311e31["features"]["length"])<(20))) {
          {
            const _0x28648e=_0x388d9b[1]["trim"]();
            ((_0x28648e["length"])>(5))&&((_0x28648e["length"])<(80))&&(_0x311e31["features"]["push"](_0x28648e));
          }
        }_0x311e31["features"]=[...new Set(_0x311e31["features"])]["slice"](0, 20);
      }
    }function helperFunction65(_0x5148fc, _0xfdc686) {
      const _0x12a510=[/(?:TODO|FIXME|PLAN):\s*(.+)/gi, /^##\s+(?:Roadmap|Future|Planned|Coming Soon)/gim];
      function helperFunction63(_0x1304f3, _0x6afe01) {
        return helperFunction48(_0x1304f3- -149, _0x6afe01);
      }function helperFunction64(_0x331487, _0x29fdcc) {
        return helperFunction48(_0x29fdcc-775, _0x331487);
      }for(const _0x123dd5 of items2) {
        {
          let _0x2d94d8;
          while((_0x2d94d8=_0x123dd5["exec"](_0xfdc686)!==null)&&((_0x5148fc["plans"]["length"])<(15))) {
            {
              const _0x4e2493=(_0x2d94d8[1]||_0x2d94d8[0])["slice"](0, 100);
              _0x5148fc["plans"]["push"](_0x4e2493);
            }
          }
        }
      }
    }function helperFunction69(_0x471b92) {
      const _0xd16c4d=_0x471b92["files"]["README.md"];
      if(!README.md) {
        {
          const _0x3612ab= {
          };
          _0x3612ab["type"]="missing", _0x3612ab["file"]="README.md", _0x3612ab["severity"]="high", _0x471b92["gaps"]["push"](_0x3612ab);
        }
      } else {
        {
          if(!README.md["hasInstallation"]) {
            {
              const _0x906bd= {
              };
              _0x906bd["type"]="missing-section", _0x906bd["file"]="README.md", _0x906bd["section"]="Installation", _0x906bd["severity"]="medium", _0x471b92["gaps"]["push"](_0x906bd);
            }
          }if(!README.md["hasUsage"]) {
            const _0x4b2790= {
            };
            _0x4b2790["type"]="missing-section", _0x4b2790["file"]="README.md", _0x4b2790["section"]="Usage", _0x4b2790["severity"]="medium", _0x471b92["gaps"]["push"](_0x4b2790);
          }
        }
      }function helperFunction67(_0x117cf8, _0x5ad599) {
        return helperFunction48(_0x5ad599- -75, _0x117cf8);
      }function helperFunction68(_0x4feda5, _0x27b340) {
        return helperFunction48(_0x4feda5-0x282, _0x27b340);
      }if(!_0x471b92["files"]["CHANGELOG.md"]) {
        const _0x217b15= {
        };
        _0x217b15["type"]="missing", _0x217b15["file"]="CHANGELOG.md", _0x217b15["severity"]="low", _0x471b92["gaps"]["push"](_0x217b15);
      }
    }function helperFunction79(_0x532a38= {
    }) {
      
      function helperFunction70(_0x2adf61, _0x5742a0) {
        return helperFunction59(_0x5742a0, _0x2adf61-0x38e);
      }const _0x31c0fe= {
        'pmYqr':function(_0x33d8ef, _0x5e4349) {
          function helperFunction71(_0x3a6ab7, _0x3b8854) {
            return _0x139e(_0x3b8854-0x21, _0x3a6ab7);
          }return ((_0x33d8ef)((_0x5e4349)));
        },
        'TWrVi':function(_0x3a7c6d, _0x471124) {
          function helperFunction72(_0x4264b9, _0x5b7e8f) {
            return _0x139e(_0x4264b9-0x35, _0x5b7e8f);
          }return(_0x3a7c6d+_0x471124);
        },
        'RzyBP':function(_0x1d3424, _0x5a0580) {
          
          function helperFunction73(_0x328113, _0x37bfcd) {
            return _0x139e(_0x37bfcd-0x308, _0x328113);
          }return ((_0x1d3424)+(_0x5a0580));
        },
        'fDByd':"tar -tz listing failed (code ", 'OZtdS':"): ", 'CtufO':function(_0x8b08d5, _0x3107d4) {
          function helperFunction74(_0x1166ea, _0x2e62bc) {
            return helperFunction70(_0x1166ea- -256, _0x2e62bc);
          }return ((_0x8b08d5)||(_0x3107d4));
        }
      };
      function helperFunction75(_0x204152, _0x5f0abe) {
        return helperFunction59(_0x204152, _0x5f0abe-1857);
      }if((true)) {
        const _0x34f166= {
          ..._0x474075, ..._0x532a38
        },
        _0x6314a0=_0x34f166, _0xce7aac=_0x6314a0["cwd"], _0x8ebe59= {
        };
        _0x8ebe59["fileCount"]=0x0, _0x8ebe59["totalWords"]=0x0;
        const _0x12bbfa= {
        };
        _0x12bbfa["total"]=0x0, _0x12bbfa["checked"]=0x0, _0x12bbfa["unchecked"]=0x0;
        const _0x570db5= {
        };
        _0x570db5["summary"]=_0x8ebe59, _0x570db5["files"]= {
        },
        _0x570db5["features"]=[], _0x570db5["plans"]=[], _0x570db5["checkboxes"]=_0x12bbfa, _0x570db5["gaps"]=[];
        const _0x3bcfec=_0x570db5, _0x2644fc=["README.md", "PLAN.md", "CLAUDE.md", "AGENTS.md", "CONTRIBUTING.md", "CHANGELOG.md", "docs/README.md", "docs/PLAN.md"];
        for(const _0x4aff91 of items3) {
          {
            const _0x2cf6f0=((helperFunction47)((_0x4aff91), (_0xce7aac)));
            if(_0x2cf6f0) {
              const _0x138ece=((helperFunction51)((_0x2cf6f0), (_0x4aff91)));
              _0x3bcfec["files"][_0x4aff91]=_0x138ece, _0x3bcfec["summary"]["totalWords"]+=_0x138ece["wordCount"], ((helperFunction58)((_0x3bcfec), (_0x2cf6f0))), ((helperFunction62)((_0x3bcfec), (_0x2cf6f0))), ((helperFunction65)((_0x3bcfec), (_0x2cf6f0)));
            }
          }
        }if(((_0x6314a0["depth"])===("thorough"))) {
          if((true)) {
            const _0x253daf=pathModule["join"](_0xce7aac, "docs");
            if(fsModule["existsSync"](_0x253daf))try {
              {
                const _0x2a357a=fsModule["readdirSync"](_0x253daf)["filter"](_0x156a22=>_0x156a22["endsWith"](".md")&&!items3["includes"]("docs/"+_0x156a22));
                for(const _0x3b339b of _0x2a357a["slice"](0, 5)) {
                  {
                    const _0x2a2520="docs/"+_0x3b339b, _0x5e9864=((helperFunction47)((_0x2a2520), (_0xce7aac)));
                    if(_0x5e9864) {
                      const _0x1620f6=((helperFunction51)((_0x5e9864), (_0x2a2520)));
                      _0x3bcfec["files"][_0x2a2520]=_0x1620f6, _0x3bcfec["summary"]["totalWords"]+=_0x1620f6["wordCount"];
                    }
                  }
                }
              }
            } catch {
            }
          } else {
            const _0x5ee623= {
              'SreYa':function(_0x4dd4ea, _0xe0bd99) {
                function helperFunction76(_0x46bde9, _0x843978) {
                  return helperFunction75(_0x46bde9, _0x843978- -91);
                }return ((_0x4dd4ea)>(_0xe0bd99));
              }
            };
            if(((_0x1030c0)!==(0))) {
              ((_0x3585c7)((new _0x10c78a((((("tar -tz listing failed (code ")+(_0x3929f2))+("): "))+(_0x4e2eb9))))));
              return;
            }const _0xb08361=_0x2a321b["split"](/\r?\n/)["filter"](function(_0x3a6c6d) {
              function helperFunction77(_0x102867, _0x232039) {
                return helperFunction70(_0x232039- -667, _0x102867);
              }function helperFunction78(_0x4d0785, _0x1e65a4) {
                return helperFunction70(_0x1e65a4- -751, _0x4d0785);
              }return _0x5ee623["SreYa"](_0x3a6c6d["length"], 0);
            });
            ((_0x4a6089)((_0xb08361)));
          }
        }return _0x3bcfec["summary"]["fileCount"]=Object["keys"](_0x3bcfec["files"])["length"], ((helperFunction69)((_0x3bcfec))), _0x3bcfec;
      } else  return _0x31c0fe["CtufO"](_0x12b125, '')["replace"](/\\/g, '/');
    }const _0x215707= {
    };
    _0x215707["DEFAULT_OPTIONS"]=_0x474075, _0x215707["analyzeDocumentation"]=helperFunction79, _0x215707["analyzeMarkdownFile"]=helperFunction51, _0x215707["safeReadFile"]=helperFunction47, _0x215707["isPathSafe"]=helperFunction44, _0x215707["extractCheckboxes"]=helperFunction58, _0x215707["extractFeatures"]=helperFunction62, _0x215707["extractPlans"]=helperFunction65, _0x215707["identifyDocGaps"]=helperFunction69, _0x374c1d["exports"]=_0x215707;
  }
}), require_fs_safe=__commonJS({
  '../work/agent-sh__agentsys/lib/utils/fs-safe.js'(_0x31ca98, _0x5bbdd8) {
    'use strict';
    
    function helperFunction80(_0x17bcb7, _0x5c4e3e) {
      return _0x3f8685(_0x5c4e3e- -398, _0x17bcb7);
    }
    function helperFunction81(_0x26bc2b, _0x1b8628) {
      return _0x3f8685(_0x26bc2b-0x23, _0x1b8628);
    }var _0x1bef64=require('fs');
    function helperFunction89(_0x21f0ea, _0x17c8c1, _0x31ee7c="utf8") {
      
      function helperFunction82(_0x2bc2d4, _0x4ffaf8) {
        return helperFunction80(_0x2bc2d4, _0x4ffaf8- -1106);
      }
      function helperFunction88(_0x13c833, _0x2263a8) {
        return helperFunction80(_0x13c833, _0x2263a8- -1257);
      }{
        const _0x4d96f4=fsModule2["openSync"](_0x21f0ea, 'r');
        try {
          {
            const _0x50ea9a=fsModule2["fstatSync"](_0x4d96f4);
            if(!_0x50ea9a["isFile"]()) {
              {
                const _0x3b0396=new Error("Not a regular file: "+_0x21f0ea);
                _0x3b0396["code"]="ENOTFILE";
                throw _0x3b0396;
              }
            }if(((typeof _0x17c8c1)===("number"))&&((_0x50ea9a["size"])>(_0x17c8c1))) {
              const _0x53c8e3=new Error("File too large: "+_0x50ea9a["size"]+" > "+_0x17c8c1+" bytes");
              _0x53c8e3["code"]="EFBIG";
              throw _0x53c8e3;
            }return fsModule2["readFileSync"](_0x4d96f4, _0x31ee7c);
          }
        } finally {
          fsModule2["closeSync"](_0x4d96f4);
        }
      }
    }const _0x34a580= {
    };
    _0x34a580["readFileWithLimit"]=helperFunction89, _0x5bbdd8["exports"]=_0x34a580;
  }
}), require_codebase=__commonJS({
  '../work/agent-sh__agentsys/lib/collectors/codebase.js'(_0x5071e3, _0x107589) {
    'use strict';
    
    var _0x701370=((require)(('fs'))), _0xf9dcf5=((require)(("path"))), {
      readFileWithLimit:_0x16c8ec
    }=((require_fs_safe)()), _0x58c35b= {
      'depth':"thorough", 'cwd':process["cwd"]()
    },
    _0x30af69=50000, _0x381561=["node_modules", "vendor", "dist", "build", "out", "target", ".git", ".svn", ".hg", "__pycache__", ".pytest_cache", "coverage", ".nyc_output", ".next", ".nuxt", ".cache"];
    const _0xf613e6= {
    };
    function helperFunction90(_0x272327, _0x6d0df7) {
      return _0x543fdb(_0x6d0df7, _0x272327- -214);
    }_0xf613e6['js']=[".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"], _0xf613e6["rust"]=[".rs"], _0xf613e6['go']=[".go"], _0xf613e6["python"]=[".py"], _0xf613e6["java"]=[".java"];
    var _0x46be8c=_0xf613e6;
    function helperFunction93(_0x473dca, _0x53e457) {
      function helperFunction91(_0x10a10e, _0x5a649e) {
        return helperFunction154(_0x5a649e- -554, _0x10a10e);
      }function helperFunction92(_0x427eb0, _0x4a6747) {
        return helperFunction154(_0x4a6747- -537, _0x427eb0);
      }{
        const _0x4511b8=pathModule2["resolve"](_0x53e457, _0x473dca), _0x478243=pathModule2["resolve"](_0x53e457);
        if(!_0x4511b8["startsWith"](_0x478243))return null;
        try {
          return fsModule3["readFileSync"](_0x4511b8, "utf8");
        } catch {
          return null;
        }
      }
    }function helperFunction96(_0x4a9b81, _0x1781ad=items4) {
      function helperFunction94(_0x1303da, _0x23f233) {
        return helperFunction90(_0x23f233- -35, _0x1303da);
      }const _0x1fad94=_0x4a9b81["split"](/[\\/]/);
      function helperFunction95(_0x5d2880, _0x474cbf) {
        return helperFunction90(_0x474cbf-0xf5, _0x5d2880);
      }return _0x1fad94["some"](_0x2b476a=>_0x1781ad["includes"](_0x2b476a));
    }function helperFunction100(_0x2f68fc, _0x189f31) {
      
      function helperFunction98(_0x515ad6, _0x218d11) {
        return helperFunction90(_0x218d11- -125, _0x515ad6);
      }function helperFunction99(_0x29aaa2, _0x53b426) {
        return helperFunction90(_0x29aaa2- -710, _0x53b426);
      }{
        const _0x42c0a2= {
          ..._0x189f31["dependencies"], ..._0x189f31["devDependencies"]
        },
        _0x3d7cf5=_0x42c0a2, _0x2fe7ed= {
        };
        _0x2fe7ed["react"]="React", _0x2fe7ed["react-dom"]="React", _0x2fe7ed["next"]="Next.js", _0x2fe7ed["vue"]="Vue.js", _0x2fe7ed["nuxt"]="Nuxt", _0x2fe7ed["angular"]="Angular", _0x2fe7ed["express"]="Express", _0x2fe7ed["fastify"]="Fastify", _0x2fe7ed["koa"]="Koa", _0x2fe7ed["nestjs"]="NestJS";
        const _0x2a16e2=_0x2fe7ed;
        for(const[_0x4057e4, _0x4eddc6]of Object["entries"](_0x2a16e2)) {
          _0x3d7cf5[_0x4057e4]&&_0x2f68fc["frameworks"]["push"](_0x4eddc6);
        }_0x2f68fc["frameworks"]=[...new Set(_0x2f68fc["frameworks"])];
      }
    }function helperFunction103(_0x2a00aa, _0x141197) {
      const _0x3107f5= {
        ..._0x141197["dependencies"], ..._0x141197["devDependencies"]
      },
      _0x36a47d=_0x3107f5;
      function helperFunction101(_0x39f26e, _0x598770) {
        return helperFunction90(_0x39f26e- -923, _0x598770);
      }function helperFunction102(_0x57dd36, _0x1cdf63) {
        return helperFunction90(_0x1cdf63-268, _0x57dd36);
      }const _0x5b884a=["jest", "mocha", "vitest", "ava", "tap", "jasmine"];
      for(const _0x5aa160 of items5) {
        {
          if(_0x36a47d[_0x5aa160]) {
            _0x2a00aa["testFramework"]=_0x5aa160, _0x2a00aa["health"]["hasTests"]=true;
            break;
          }
        }
      }
    }function helperFunction111(_0x351ae0) {
      
      function helperFunction109(_0x289a65, _0x25d3a8) {
        return helperFunction154(_0x25d3a8- -1184, _0x289a65);
      }const _0x392140= {
      };
      _0x392140["functions"]=[], _0x392140["classes"]=[], _0x392140["exports"]=[];
      const _0x2d6036=_0x392140, _0x5b81fe=/(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
      let _0x5077e4;
      while(((_0x5077e4=_0x5b81fe["exec"](_0x351ae0))!==(null))) {
        _0x2d6036["functions"]["push"](_0x5077e4[1]);
      }const _0x3fccc1=/(?:const|let)\s{1,1000}([a-zA-Z_$][a-zA-Z0-9_$]*)\s{0,1000}=\s{0,1000}(?:async\s{0,1000})?\([^)]{0,2000}\)\s{0,1000}=>/g;
      while(((_0x5077e4=_0x3fccc1["exec"](_0x351ae0))!==(null))) {
        _0x2d6036["functions"]["push"](_0x5077e4[1]);
      }const _0x99b528=/class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
      while(((_0x5077e4=_0x99b528["exec"](_0x351ae0))!==(null))) {
        _0x2d6036["classes"]["push"](_0x5077e4[1]);
      }const _0x1e0a1a=/export\s+(?:(?:async\s+)?function|class|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
      while(((_0x5077e4=_0x1e0a1a["exec"](_0x351ae0))!==(null))) {
        _0x2d6036["exports"]["push"](_0x5077e4[1]);
      }function helperFunction110(_0x3400fd, _0x45ddf9) {
        return helperFunction154(_0x45ddf9-11, _0x3400fd);
      }const _0x68b23b=/module\.exports\s{0,1000}=\s{0,1000}\{([^}]{1,100000})\}/, _0x5db059=_0x351ae0["match"](_0x68b23b);
      if(_0x5db059) {
        {
          const _0x2de782=_0x5db059[1]["split"](',')["map"](_0x4fedde=>_0x4fedde["trim"]()["split"](':')[0]["trim"]());
          _0x2d6036["exports"]["push"](..._0x2de782["filter"](_0x3abb8e=>_0x3abb8e&&/^[a-zA-Z_$]/["test"](_0x3abb8e)));
        }
      }return _0x2d6036["functions"]=[...new Set(_0x2d6036["functions"])], _0x2d6036["classes"]=[...new Set(_0x2d6036["classes"])], _0x2d6036["exports"]=[...new Set(_0x2d6036["exports"])], _0x2d6036;
    }function helperFunction137(_0x177a43, _0x822808) {
      
      function helperFunction112(_0x59463c, _0x81cb2b) {
        return helperFunction90(_0x81cb2b- -1117, _0x59463c);
      }const _0xbbb1d4= {
        'tMDRB':function(_0x14711c, _0x20a297) {
          function helperFunction113(_0x11647b, _0x129688) {
            return _0x139e(_0x11647b- -89, _0x129688);
          }return ((_0x14711c)+(_0x20a297));
        },
        'bjmvr':function(_0x2cca84, _0x1410de) {
          function helperFunction114(_0x140b1e, _0x24bde2) {
            return _0x139e(_0x140b1e- -145, _0x24bde2);
          }return ((_0x2cca84)>(_0x1410de));
        },
        'okrzN':"...", 'TeEVb':".opencode", 'Vwwjy':function(_0x31a7ec, _0x242bc6) {
          function helperFunction115(_0x5742ae, _0x335c50) {
            return helperFunction112(_0x335c50, _0x5742ae- -135);
          }return ((_0x31a7ec)((_0x242bc6)));
        },
        'kTNsx':"zip extraction failed: ", 'xhaOx':function(_0x21ddae) {
          
          function helperFunction116(_0x29d128, _0x4cfa19) {
            return helperFunction112(_0x29d128, _0x4cfa19-0x3c);
          }return ((_0x21ddae)());
        },
        'WaWDs':function(_0x1a82a6, _0x40662a) {
          function helperFunction117(_0x25b2fb, _0x32840f) {
            return helperFunction112(_0x32840f, _0x25b2fb-0x229);
          }return ((_0x1a82a6)!==(_0x40662a));
        },
        'vWaWV':"tniBo", 'GWHhY':function(_0x50cee0, _0x21d1a0) {
          
          function helperFunction118(_0x157511, _0x23da9c) {
            return helperFunction128(_0x157511, _0x23da9c-0x318);
          }return ((_0x50cee0)>=(_0x21d1a0));
        },
        'IPimL':function(_0x5051d9, _0x1da25d) {
          function helperFunction119(_0x34cce3, _0x197278) {
            return helperFunction112(_0x197278, _0x34cce3-0x3d4);
          }return ((_0x5051d9)>(_0x1da25d));
        },
        'NPrOw':function(_0x47bea4, _0x570ab1) {
          function helperFunction120(_0x5cd40c, _0xebeb8c) {
            return helperFunction112(_0x5cd40c, _0xebeb8c-0x119);
          }return ((_0x47bea4)!==(_0x570ab1));
        },
        'lAxCT':"bdVIR", 'fGKgw':function(_0x407048, _0x50ea04) {
          function helperFunction121(_0x3bf3d4, _0x530f68) {
            return helperFunction112(_0x3bf3d4, _0x530f68- -86);
          }return ((_0x407048)>=(_0x50ea04));
        },
        'ieaTm':function(_0x1cfb4a, _0x507d05) {
          
          function helperFunction122(_0x32849d, _0x12e0ff) {
            return helperFunction128(_0x12e0ff, _0x32849d-0x547);
          }return ((_0x1cfb4a)!==(_0x507d05));
        },
        'uHIJv':"yiQTH", 'AgbLJ':"node_modules", 'fEgsT':"__tests__", 'iZcLo':"test", 'yjtqJ':"tests", 'rbqJH':"dist", 'JEaHi':"build", 'CdgFn':function(_0x5bbf3c, _0x28f17f, _0x12a473, _0xdcfaf5) {
          function helperFunction123(_0x49014a, _0x536f6a) {
            return helperFunction128(_0x49014a, _0x536f6a-0x11e);
          }return ((_0x5bbf3c)((_0x28f17f), (_0x12a473), (_0xdcfaf5)));
        },
        'dCUMW':function(_0x381e3a, _0x417b7b) {
          function helperFunction124(_0x57e154, _0x50902b) {
            return helperFunction128(_0x57e154, _0x50902b-0xb1);
          }return ((_0x381e3a)===(_0x417b7b));
        },
        'OMQgk':"VqYcG", 'rNjxF':".test.", 'yxUQK':".spec.", 'pkMEs':function(_0x1402b3, _0x2f460d) {
          function helperFunction125(_0x48c1c6, _0x361f6a) {
            return helperFunction128(_0x361f6a, _0x48c1c6-0xf9);
          }return ((_0x1402b3)!==(_0x2f460d));
        },
        'EwMrs':"KgtLs", 'qMMzk':"gXDmE", 'VpShT':function(_0x20777a, _0x35bfba, _0x2132d9) {
          function helperFunction126(_0x33ceef, _0x530a89) {
            return helperFunction128(_0x33ceef, _0x530a89-642);
          }return ((_0x20777a)((_0x35bfba), (_0x2132d9)));
        },
        'uFkNV':function(_0x3bc4dc, _0x1b0fd4) {
          function helperFunction127(_0x58b468, _0x443102) {
            return helperFunction128(_0x58b468, _0x443102-0x590);
          }return ((_0x3bc4dc)((_0x1b0fd4)));
        }
      };
      function helperFunction128(_0x2cf6f3, _0x3caa40) {
        return helperFunction90(_0x3caa40- -1534, _0x2cf6f3);
      }if((false))_0x4d6ee7["closeSync"](_0x1b7cce);
      else {
        const _0x161bb7= {
        },
        _0x3c61b3=["lib", "src", "app", "pages", "components", "utils", "services", "api"], _0x4d1605=_0x822808["filter"](_0x225ed5=>items6["includes"](_0x225ed5)), _0x4b500f=Object["values"](_0x46be8c)["flat"]();
        let _0x14fc9e=0;
        const _0x79e41d=40;
        function helperFunction136(_0xf52107, _0x21ab2b, _0x38b2cb=0) {
          const _0x15c16f= {
            'uXhiT':function(_0x317d90, _0x5aac93) {
              
              function helperFunction129(_0x3376e, _0x273547) {
                return _0x139e(_0x3376e- -903, _0x273547);
              }return _0xbbb1d4["tMDRB"](_0x317d90, _0x5aac93);
            },
            'vVBUf':function(_0x1850fa, _0x46d1bd) {
              
              function helperFunction130(_0x4735ed, _0x425075) {
                return _0x139e(_0x425075- -460, _0x4735ed);
              }return _0xbbb1d4["bjmvr"](_0x1850fa, _0x46d1bd);
            },
            'TjoGF':"...", 'ngBTx':".opencode", 'oaolr':function(_0x50bf5f, _0x3c198a) {
              
              function helperFunction131(_0x1392e4, _0xb3bcd8) {
                return helperFunction134(_0x1392e4- -247, _0xb3bcd8);
              }return _0xbbb1d4["Vwwjy"](_0x50bf5f, _0x3c198a);
            },
            'OFmPD':function(_0x2dfac6, _0xa1df39) {
              function helperFunction132(_0x4cad84, _0x2bed4c) {
                return helperFunction135(_0x2bed4c-0x2d8, _0x4cad84);
              }return _0xbbb1d4["tMDRB"](_0x2dfac6, _0xa1df39);
            },
            'Ghoda':"zip extraction failed: ", 'QPtxI':function(_0x146a6d) {
              function helperFunction133(_0x2649f3, _0x308871) {
                return helperFunction134(_0x2649f3- -1311, _0x308871);
              }return _0xbbb1d4["xhaOx"](_0x146a6d);
            }
          };
          function helperFunction134(_0x2baa13, _0x3bb4df) {
            return helperFunction128(_0x3bb4df, _0x2baa13-1370);
          }function helperFunction135(_0x203a7e, _0x3e4959) {
            return helperFunction128(_0x3e4959, _0x203a7e-0x280);
          }if(_0xbbb1d4["WaWDs"]("tniBo", "tniBo"))return {
            'number':_0x3807d8["number"], 'title':_0x4251fb["title"], 'labels':(_0x5dde27["labels"]||[])["map"](_0x1ae1b8=>_0x1ae1b8["name"]||_0x1ae1b8), 'milestone':_0xaa984d["milestone"]?.["title"]||_0xae110a["milestone"]||null, 'createdAt':_0x254e3c["createdAt"], 'updatedAt':_0x502de0["updatedAt"], 'snippet':_0xef5493["body"]?ZNybrE["uXhiT"](_0x3022fc["body"]["slice"](0, 200)["replace"](/\n/g, '\x20')["trim"](), ZNybrE["vVBUf"](_0x40886e["body"]["length"], 200)?ZNybrE["TjoGF"]:''):''
          };
          else {
            if(_0xbbb1d4["GWHhY"](_0x14fc9e, _0x79e41d)||_0xbbb1d4["IPimL"](_0x38b2cb, 2))return;
            if(!fsModule3["existsSync"](_0xf52107))return;
            try {
              const _0x2dfbb6= {
              };
              _0x2dfbb6["withFileTypes"]=true;
              const _0x4db18e=fsModule3["readdirSync"](_0xf52107, _0x2dfbb6);
              for(const _0x1f04c1 of _0x4db18e) {
                if(_0xbbb1d4["NPrOw"]("bdVIR", "bdVIR"))_0x28f4ba["push"](_0x2b576f[1]);
                else {
                  if(_0xbbb1d4["fGKgw"](_0x14fc9e, _0x79e41d))break;
                  const _0x3955db=pathModule2["join"](_0xf52107, _0x1f04c1["name"]), _0xf818a6=_0x21ab2b?_0x21ab2b+'/'+_0x1f04c1["name"]:_0x1f04c1["name"];
                  if(_0x1f04c1["isDirectory"]()) {
                    if(_0xbbb1d4["ieaTm"]("yiQTH", "yiQTH"))return _0x268413["set"](_0x5850cf, ".opencode"), ".opencode";
                    else {
                      if(["node_modules", "__tests__", "test", "tests", "dist", "build"]["includes"](_0x1f04c1["name"]))continue;
                      _0xbbb1d4["CdgFn"](helperFunction136, _0x3955db, _0xf818a6, _0xbbb1d4["tMDRB"](_0x38b2cb, 1));
                    }
                  } else {
                    if(_0x1f04c1["isFile"]()) {
                      if(_0xbbb1d4["dCUMW"]("VqYcG", "VqYcG")) {
                        const _0x460076=pathModule2["extname"](_0x1f04c1["name"]);
                        if(!_0x4b500f["includes"](_0x460076))continue;
                        if(_0x1f04c1["name"]["includes"](".test.")||_0x1f04c1["name"]["includes"](".spec."))continue;
                        try {
                          if(_0xbbb1d4["pkMEs"]("KgtLs", "gXDmE")) {
                            const _0x7b3a84=_0xbbb1d4["VpShT"](_0x16c8ec, _0x3955db, _0x30af69), _0x388833=_0xbbb1d4["uFkNV"](helperFunction111, _0x7b3a84);
                            (_0x388833["functions"]["length"]||_0x388833["classes"]["length"]||_0x388833["exports"]["length"])&&(_0x161bb7[_0xf818a6]=_0x388833, _0x14fc9e++);
                          } else  _0x54f1b1?_0x15c16f["oaolr"](_0x39c01e, new _0x1104a8(_0x15c16f["OFmPD"]("zip extraction failed: ", _0x2ec5ce||_0x57086a["message"]))):_0x15c16f["QPtxI"](_0x3a6dff);
                        } catch {
                        }
                      } else  return null;
                    }
                  }
                }
              }
            } catch {
            }
          }
        }for(const _0x4921f1 of _0x4d1605) {
          {
            if(((_0x14fc9e)>=(_0x79e41d)))break;
            ((helperFunction136)((pathModule2["join"](_0x177a43, _0x4921f1)), (_0x4921f1)));
          }
        }return _0x161bb7;
      }
    }function helperFunction142(_0x567c7b, _0x446b84, _0x4c68d6, _0x4472f4, _0x298aca=0) {
      
      function helperFunction140(_0x28119d, _0x46f8b5) {
        return helperFunction90(_0x46f8b5- -36, _0x28119d);
      }function helperFunction141(_0x5c213a, _0x47b571) {
        return helperFunction90(_0x5c213a- -978, _0x47b571);
      }{
        if(((_0x298aca)>=(_0x4472f4)))return;
        const _0xb5363e=pathModule2["join"](_0x446b84, _0x4c68d6);
        if(!fsModule3["existsSync"](_0xb5363e))return;
        try {
          {
            const _0x2dc2e0= {
            };
            _0x2dc2e0["withFileTypes"]=true;
            const _0xa81ab1=fsModule3["readdirSync"](_0xb5363e, _0x2dc2e0), _0x40315e=[], _0x44fd42=[];
            for(const _0x1fc698 of _0xa81ab1) {
              {
                if(_0x1fc698["isDirectory"]())!items4["includes"](_0x1fc698["name"])&&items7["push"](_0x1fc698["name"]);
                else {
                  items8["push"](_0x1fc698["name"]);
                }
              }
            }const _0x56bba4=((_0x4c68d6)||('.')), _0x3006bc= {
            };
            _0x3006bc["dirs"]=items7, _0x3006bc["fileCount"]=items8["length"], _0x567c7b["structure"][_0x56bba4]=_0x3006bc;
            for(const _0x3e6cde of items8) {
              const _0x1a50de=pathModule2["extname"](_0x3e6cde)["toLowerCase"]()||"no-ext";
              _0x567c7b["fileStats"][_0x1a50de]=((_0x567c7b["fileStats"][_0x1a50de]||0)+(1));
            }for(const _0xd03663 of items7) {
              ((helperFunction142)((_0x567c7b), (_0x446b84), (pathModule2["join"](_0x4c68d6, _0xd03663)), (_0x4472f4), ((_0x298aca)+(1))));
            }
          }
        } catch {
        }
      }
    }function helperFunction145(_0x43bc5c, _0x4c2b45) {
      function helperFunction143(_0x2aae2c, _0x49154b) {
        return helperFunction154(_0x49154b-0x23, _0x2aae2c);
      }_0x43bc5c["health"]["hasReadme"]=fsModule3["existsSync"](pathModule2["join"](_0x4c2b45, "README.md"));
      const _0x34579b=[".eslintrc", ".eslintrc.js", ".eslintrc.json", "eslint.config.js", "biome.json"];
      _0x43bc5c["health"]["hasLinting"]=items9["some"](_0x41f59a=>fsModule3["existsSync"](pathModule2["join"](_0x4c2b45, _0x41f59a)));
      const _0x3eff1e=[".github/workflows", ".gitlab-ci.yml", ".circleci", "Jenkinsfile", ".travis.yml"];
      function helperFunction144(_0x1d8931, _0x134740) {
        return helperFunction154(_0x1d8931- -414, _0x134740);
      }_0x43bc5c["health"]["hasCi"]=items10["some"](_0x2d920f=>fsModule3["existsSync"](pathModule2["join"](_0x4c2b45, _0x2d920f)));
      const _0x3b15a8=["tests", "__tests__", "test", "spec"];
      _0x43bc5c["health"]["hasTests"]=_0x43bc5c["health"]["hasTests"]||items11["some"](_0x1400fb=>fsModule3["existsSync"](pathModule2["join"](_0x4c2b45, _0x1400fb)));
    }function helperFunction150(_0x628f25, _0x5d1b82) {
      
      function helperFunction146(_0x557682, _0x1da119) {
        return helperFunction154(_0x557682- -1035, _0x1da119);
      }function helperFunction147(_0x5fa53c, _0x4540a2) {
        return helperFunction154(_0x5fa53c-0x1ea, _0x4540a2);
      }if((true)) {
        const _0x11a117= {
        };
        _0x11a117["authentication"]=["auth", "login", "session", "jwt", "oauth"], _0x11a117["api"]=["routes", "controllers", "handlers", "endpoints"], _0x11a117["database"]=["models", "schemas", "migrations", "seeds"], _0x11a117['ui']=["components", "views", "pages", "layouts"], _0x11a117["testing"]=["__tests__", "test", "spec", ".test.", ".spec."], _0x11a117["docs"]=["docs", "documentation", "wiki"];
        const _0x1fa04e=_0x11a117;
        for(const[_0x559075, _0x12dfe8]of Object["entries"](_0x1fa04e)) {
          const _0x1c516d=_0x12dfe8["some"](_0x53b792=> {
            
            function helperFunction148(_0x583bf8, _0x466240) {
              return helperFunction146(_0x466240- -170, _0x583bf8);
            }function helperFunction149(_0x7f1a46, _0x3779c5) {
              return helperFunction146(_0x7f1a46-0x3f3, _0x3779c5);
            }{
              for(const _0x26668a of Object["keys"](_0x628f25["structure"])) {
                if(_0x26668a["toLowerCase"]()["includes"](_0x53b792))returntrue;
              }returnfalse;
            }
          });
          _0x1c516d&&(_0x628f25["implementedFeatures"]["push"](_0x559075));
        }
      } else  _0x348c2f["classes"]["push"](_0x4b0f58[1]);
    }function helperFunction153(_0x3c7e74= {
    }) {
      const _0x4e8e5f= {
      };
      _0x4e8e5f["Gusxh"]=".codex";
      const _0x552dd9= {
        ..._0x58c35b, ..._0x3c7e74
      }, _0x1cd84a=_0x552dd9;
      function helperFunction151(_0x588705, _0x4302fb) {
        return helperFunction90(_0x4302fb-0x2c, _0x588705);
      }const _0x3971c6=_0x1cd84a["cwd"], _0x7356e3= {
      };
      _0x7356e3["totalDirs"]=0x0, _0x7356e3["totalFiles"]=0x0;
      const _0x9a02ac= {
      };
      _0x9a02ac["hasTests"]=false, _0x9a02ac["hasLinting"]=false, _0x9a02ac["hasCi"]=false;
      function helperFunction152(_0x152e0f, _0x118331) {
        return helperFunction90(_0x152e0f-309, _0x118331);
      }_0x9a02ac["hasReadme"]=false;
      const _0x537c94= {
      };
      _0x537c94["summary"]=_0x7356e3, _0x537c94["topLevelDirs"]=[], _0x537c94["frameworks"]=[], _0x537c94["testFramework"]=null, _0x537c94["hasTypeScript"]=false, _0x537c94["implementedFeatures"]=[], _0x537c94["symbols"]= {
      },
      _0x537c94["health"]=_0x9a02ac, _0x537c94["fileStats"]= {
      };
      const _0x5458ee=_0x537c94, _0x396e3b= {
      },
      _0x3a4f68=((helperFunction93)(("package.json"), (cwd2)));
      if(_0x3a4f68)try {
        {
          const _0x406917=JSON["parse"](_0x3a4f68);
          ((helperFunction100)((_0x5458ee), (_0x406917))), ((helperFunction103)((_0x5458ee), (_0x406917)));
        }
      } catch {
      }_0x5458ee["hasTypeScript"]=fsModule3["existsSync"](pathModule2["join"](cwd2, "tsconfig.json"));
      const _0x56ae61= {
      };
      _0x56ae61["structure"]=_0x396e3b, _0x56ae61["fileStats"]=_0x5458ee["fileStats"], ((helperFunction142)((_0x56ae61), (cwd2), (''), (((_0x1cd84a["depth"])===("thorough"))?3:2))), _0x5458ee["summary"]["totalDirs"]=Object["keys"](_0x396e3b)["length"], _0x5458ee["summary"]["totalFiles"]=Object["values"](_0x396e3b)["reduce"]((_0x1db9ad, _0x563b29)=>_0x1db9ad+(_0x563b29["fileCount"]||0), 0);
      const _0x18709f=_0x396e3b['.'];
      if(_0x18709f) {
        _0x5458ee["topLevelDirs"]=_0x18709f["dirs"]||[];
      }((helperFunction145)((_0x5458ee), (cwd2)));
      if(((_0x1cd84a["depth"])===("thorough"))) {
        {
          const _0x307e26= {
            ..._0x5458ee
          };
          _0x307e26["structure"]=_0x396e3b, ((helperFunction150)((_0x307e26), (cwd2))), _0x5458ee["symbols"]=((helperFunction137)((cwd2), (_0x5458ee["topLevelDirs"])));
        }
      }const _0x3196eb=Object["entries"](_0x5458ee["fileStats"])["sort"]((_0x24053c, _0x46be30)=>_0x46be30[1]-_0x24053c[1])["slice"](0, 10);
      return _0x5458ee["fileStats"]=Object["fromEntries"](_0x3196eb), _0x5458ee;
    }const _0x35e079= {
    };
    _0x35e079["DEFAULT_OPTIONS"]=_0x58c35b, _0x35e079["EXCLUDE_DIRS"]=items4, _0x35e079["SOURCE_EXTENSIONS"]=_0x46be8c, _0x35e079["scanCodebase"]=helperFunction153, _0x35e079["detectFrameworks"]=helperFunction100, _0x35e079["detectTestFramework"]=helperFunction103, _0x35e079["detectHealth"]=helperFunction145, _0x35e079["findImplementedFeatures"]=helperFunction150, _0x35e079["extractSymbols"]=helperFunction111;
    function helperFunction154(_0x234087, _0x40c7c5) {
      return _0x543fdb(_0x40c7c5, _0x234087- -576);
    }_0x35e079["scanFileSymbols"]=helperFunction137, _0x35e079["scanDirectory"]=helperFunction142, _0x35e079["shouldExclude"]=helperFunction96, _0x35e079["safeReadFile"]=helperFunction93, _0x107589["exports"]=_0x35e079;
  }
}), require_version=__commonJS({
  '../work/agent-sh__agentsys/lib/binary/version.js'(_0x566902, _0x135b62) {
    'use strict';
    const _0x1f2e68= {
    };
    function helperFunction155(_0x2e1a13, _0x513f6e) {
      return _0x543fdb(_0x513f6e, _0x2e1a13- -1070);
    }_0x1f2e68["PATXP"]="0|3|2|4|1", _0x1f2e68["vqrKB"]="agent-analyzer", _0x1f2e68["vGpTO"]="0.3.0";
    function helperFunction156(_0x26e2ae, _0x532a12) {
      return _0x543fdb(_0x26e2ae, _0x532a12- -1151);
    }_0x1f2e68["ZCFqi"]="agent-sh/agent-analyzer";
    const _0x4fa1a6=_0x1f2e68, _0xac853e=_0x4fa1a6["PATXP"]["split"]('|');
    let _0x335ac4=0;
    while(true) {
      switch(_0xac853e[_0x335ac4++]) {
        case '0':'use strict';
        continue;
        case '1':const _0xaf214c= {
        };
        _0xaf214c["ANALYZER_MIN_VERSION"]=vGpTO, _0xaf214c["BINARY_NAME"]=vqrKB, _0xaf214c["GITHUB_REPO"]=ZCFqi, _0x135b62["exports"]=_0xaf214c;
        continue;
        case '2':var _0x1edcff=_0x4fa1a6["vqrKB"];
        continue;
        case '3':var _0x1b022c=_0x4fa1a6["vGpTO"];
        continue;
        case '4':var _0x4a0d88=_0x4fa1a6["ZCFqi"];
        continue;
      }break;
    }
  }
}), require_binary=__commonJS({
  '../work/agent-sh__agentsys/lib/binary/index.js'(_0x197f67, _0x5783b3) {
    'use strict';
    
    var _0x2985be=((require)(('fs'))), _0x30d82b=((require)(("path"))), _0x2bfd59=((require)(('os'))), _0x572849=require("https"), _0x57a654=((require)(("child_process"))), _0x418160=((require)(("crypto"))), {
      promisify:_0x499bae
    }=((require)(("util"))), _0x2bb30f=_0x499bae(childProcessModule["execFile"]), _0x1b37c8=(268435456), {
      ANALYZER_MIN_VERSION:_0x1c879f, BINARY_NAME:_0x8f30b7, GITHUB_REPO:_0xbb0eb4
    }=((require_version)());
    const _0x26e8bc= {
    };
    _0x26e8bc["darwin-arm64"]="aarch64-apple-darwin", _0x26e8bc["darwin-x64"]="x86_64-apple-darwin", _0x26e8bc["linux-x64"]="x86_64-unknown-linux-gnu", _0x26e8bc["linux-arm64"]="aarch64-unknown-linux-gnu", _0x26e8bc["win32-x64"]="x86_64-pc-windows-msvc";
    var _0xb91a14=_0x26e8bc;
    function helperFunction162() {
      
      function helperFunction157(_0x8ccc27, _0xa6d508) {
        return helperFunction364(_0x8ccc27, _0xa6d508-0x32);
      }function helperFunction158(_0x394f8d, _0x5a1681) {
        return helperFunction364(_0x5a1681, _0x394f8d-0x2c7);
      }
      {
        const _0x248bd7=((process["platform"])===("win32"))?".exe":'';
        return pathModule3["join"](osModule["homedir"](), ".agent-sh", "bin", ((_0x8f30b7)+(_0x248bd7)));
      }
    }function helperFunction165() {
      const _0xac203= {
      };
      function helperFunction163(_0x56049d, _0x382418) {
        return helperFunction364(_0x382418, _0x56049d-646);
      }_0xac203["uXGYH"]="prs";
      function helperFunction164(_0x3ae971, _0x2341ee) {
        return helperFunction364(_0x3ae971, _0x2341ee- -894);
      }
      {
        const _0x37c50c=(((process["platform"])+('-'))+(process["arch"]));
        return _0xb91a14[_0x37c50c]||null;
      }
    }function helperFunction168(_0x3ce9ba, _0x2fa52a) {
      if(!_0x3ce9ba)returnfalse;
      function helperFunction166(_0x40525a, _0xd4684) {
        return helperFunction364(_0x40525a, _0xd4684- -380);
      }const _0x4d0f02=_0x3ce9ba["match"](/^(\d+)\.(\d+)\.(\d+)/);
      if(!_0x4d0f02)returnfalse;
      const _0x555f3d=_0x4d0f02["slice"](1)["map"](Number), _0x2ed283=_0x2fa52a["split"]('.')["map"](Number);
      if(((_0x555f3d[0])>(_0x2ed283[0])))returntrue;
      function helperFunction167(_0x1f11ed, _0x348985) {
        return helperFunction364(_0x348985, _0x1f11ed- -1081);
      }if(((_0x555f3d[0])<(_0x2ed283[0])))returnfalse;
      if(((_0x555f3d[1])>(_0x2ed283[1])))returntrue;
      if(((_0x555f3d[1])<(_0x2ed283[1])))returnfalse;
      return ((_0x555f3d[2])>=(_0x2ed283[2]));
    }function helperFunction171() {
      function helperFunction169(_0x5ebf82, _0x3810ef) {
        return helperFunction364(_0x5ebf82, _0x3810ef- -665);
      }function helperFunction170(_0xb45485, _0x4742ab) {
        return helperFunction364(_0x4742ab, _0xb45485- -1038);
      }const _0x3b2873=helperFunction162();
      if(!fsModule4["existsSync"](_0x3b2873))return null;
      try {
        {
          const _0x2650a3=childProcessModule["execFileSync"](_0x3b2873, ["--version"], {
            'timeout':0x1388, 'encoding':"utf8", 'stdio':["pipe", "pipe", "pipe"], 'windowsHide':true
          }), _0x519ef0=_0x2650a3["trim"]()["match"](/(\d+\.\d+\.\d+)/);
          return _0x519ef0?_0x519ef0[1]:_0x2650a3["trim"]();
        }
      } catch(_0x1c4dda) {
        return null;
      }
    }function helperFunction174() {
      const _0x5278bd=((helperFunction162)());
      if(!fsModule4["existsSync"](_0x5278bd))returnfalse;
      const _0xa61723=((helperFunction171)());
      function helperFunction172(_0x162699, _0x11217a) {
        return helperFunction371(_0x11217a, _0x162699- -790);
      }function helperFunction173(_0x850170, _0x233103) {
        return helperFunction371(_0x850170, _0x233103-0xb8);
      }return ((helperFunction168)((_0xa61723), (_0x1c879f)));
    }async function helperFunction176() {
      function helperFunction175(_0x5328b6, _0x45dc8c) {
        return helperFunction371(_0x45dc8c, _0x5328b6-766);
      }return ((helperFunction174)());
    }function helperFunction179(_0x21debf, _0x26a2a5) {
      
      function helperFunction177(_0x25aa8e, _0xaaed1) {
        return helperFunction364(_0xaaed1, _0x25aa8e-0x2c3);
      }function helperFunction178(_0x43671d, _0x5c580d) {
        return helperFunction364(_0x43671d, _0x5c580d- -908);
      }{
        const _0xaa201d=((process["platform"])===("win32"))?".zip":".tar.gz";
        return(((((((("https://github.com/")+(_0xbb0eb4))+("/releases/download/v"))+(_0x21debf))+('/'))+(_0x8f30b7))+('-'))+_0x26a2a5+_0xaa201d);
      }
    }function helperFunction227(_0x5e994a) {
      
      function helperFunction180(_0x319e94, _0x285fca) {
        return helperFunction364(_0x319e94, _0x285fca- -968);
      }function helperFunction181(_0x33f796, _0x36ab77) {
        return helperFunction364(_0x33f796, _0x36ab77-785);
      }const _0x1c5b27= {
        'NMqIP':function(_0x8ad91a, _0x127864) {
          
          function helperFunction182(_0x5c72a1, _0xc23724) {
            return _0x139e(_0x5c72a1-0x16a, _0xc23724);
          }return ((_0x8ad91a)===(_0x127864));
        },
        'puEfX':function(_0x4ce763, _0x3dec75) {
          
          function helperFunction183(_0x597375, _0x2a0610) {
            return _0x139e(_0x597375-0x393, _0x2a0610);
          }return ((_0x4ce763)+(_0x3dec75));
        },
        'gkWmP':"Refusing to extract archive with parent-traversal entry: ", 'qxciZ':function(_0x4a910c, _0x2fd761) {
          function helperFunction184(_0x169827, _0x39985e) {
            return helperFunction181(_0x39985e, _0x169827- -1783);
          }return ((_0x4a910c)!==(_0x2fd761));
        },
        'KKWGZ':"PkhDG", 'pDuKL':"XanKR", 'RFUGx':function(_0x41ddc0, _0x18127e) {
          function helperFunction185(_0x394901, _0x351b) {
            return helperFunction180(_0x351b, _0x394901-0x490);
          }return _0x41ddc0(_0x18127e);
        },
        'BRsrR':function(_0x4521d6, _0x4cbed4) {
          
          function helperFunction186(_0x33b29c, _0x2db8ac) {
            return helperFunction180(_0x33b29c, _0x2db8ac- -2);
          }return(_0x4521d6>_0x4cbed4);
        },
        'ChUtq':"QhkwE", 'SuLcl':"Too many redirects fetching from ", 'wyWZg':"agent-core/binary-resolver", 'FFmGv':"application/octet-stream", 'mVmFo':"Authorization", 'XiWUL':"Bearer ", 'jzygk':"error", 'vzQMk':function(_0x473f02, _0x3b7c87) {
          function helperFunction187(_0x11dd07, _0x25ecd0) {
            return helperFunction180(_0x11dd07, _0x25ecd0-0x64e);
          }return ((_0x473f02)!=(_0x3b7c87));
        },
        'MlQkT':"--top", 'tiNzC':function(_0x18e4a8, _0x531d01, _0x9a8880, _0x3a8a2f) {
          
          function helperFunction188(_0x13c53d, _0x28f4bf) {
            return helperFunction180(_0x28f4bf, _0x13c53d- -109);
          }return ((_0x18e4a8)((_0x531d01), (_0x9a8880), (_0x3a8a2f)));
        },
        'viDkt':"hotspots", 'gdkam':"zDXjd", 'VEPLJ':function(_0x5d0965, _0x5dbfb6) {
          function helperFunction189(_0x32190d, _0x1c5917) {
            return helperFunction181(_0x32190d, _0x1c5917- -222);
          }return ((_0x5d0965)===(_0x5dbfb6));
        },
        'ugOAI':function(_0x5a2a02, _0xc83fd0) {
          function helperFunction190(_0x23e7df, _0x1af25c) {
            return helperFunction181(_0x1af25c, _0x23e7df- -905);
          }return ((_0x5a2a02)===(_0xc83fd0));
        },
        'JMgiH':function(_0x664d, _0xc9d975, _0x1e36ad) {
          function helperFunction191(_0x11fce5, _0x55bcdf) {
            return helperFunction180(_0x11fce5, _0x55bcdf-883);
          }return ((_0x664d)((_0xc9d975), (_0x1e36ad)));
        },
        'MoEhx':function(_0x32a8a7, _0x11762a) {
          function helperFunction192(_0x33955a, _0x320df9) {
            return helperFunction180(_0x320df9, _0x33955a-0x24f);
          }return ((_0x32a8a7)+(_0x11762a));
        },
        'HpfSS':function(_0x28c06e, _0x2024c9) {
          
          function helperFunction193(_0x3e25e8, _0x5f4a50) {
            return helperFunction180(_0x5f4a50, _0x3e25e8-0x286);
          }return ((_0x28c06e)===(_0x2024c9));
        },
        'aTvET':" (rate limited - set GITHUB_TOKEN env var)", 'AnSKi':"HTTP ", 'lmwkE':" fetching ", 'bRIFx':"data", 'woIhG':"end"
      };
      return new Promise(function(_0x4d0b2d, _0xa4f050) {
        const _0x5d2510= {
          'fBZRZ':function(_0x2dca5f, _0x2cdecb) {
            function helperFunction194(_0x4d07bf, _0x3f43ca) {
              return _0x139e(_0x3f43ca- -599, _0x4d07bf);
            }return _0x1c5b27["vzQMk"](_0x2dca5f, _0x2cdecb);
          },
          'jwylU':"--top", 'EvgRN':function(_0x5b50da, _0x47bd92) {
            function helperFunction195(_0x561eac, _0x1c9775) {
              return helperFunction207(_0x1c9775, _0x561eac- -282);
            }return _0x1c5b27["RFUGx"](_0x5b50da, _0x47bd92);
          },
          'WSJAA':function(_0x4b1bc0, _0x4a2ec8, _0x24e8e5, _0x58d18b) {
            function helperFunction196(_0x345ede, _0x2781f4) {
              return helperFunction207(_0x345ede, _0x2781f4- -112);
            }return _0x1c5b27["tiNzC"](_0x4b1bc0, _0x4a2ec8, _0x24e8e5, _0x58d18b);
          },
          'PofHI':"hotspots", 'cRayW':function(_0x57fdcd, _0x35cdcb) {
            function helperFunction197(_0x17d1ec, _0x4afcc8) {
              return helperFunction207(_0x4afcc8, _0x17d1ec- -695);
            }return _0x1c5b27["qxciZ"](_0x57fdcd, _0x35cdcb);
          },
          'eWNhK':"zDXjd", 'QoUNT':function(_0xf9796b, _0x4a8485) {
            function helperFunction198(_0x25d117, _0x5841a7) {
              return helperFunction207(_0x5841a7, _0x25d117- -162);
            }return _0x1c5b27["VEPLJ"](_0xf9796b, _0x4a8485);
          },
          'mYgba':function(_0x45f3e3, _0x131f6a) {
            function helperFunction199(_0x22c816, _0x5797c6) {
              return helperFunction208(_0x22c816, _0x5797c6- -1669);
            }return _0x1c5b27["ugOAI"](_0x45f3e3, _0x131f6a);
          },
          'rfOdG':function(_0x487022, _0x5d1d74, _0x1b0b17) {
            function helperFunction200(_0x5197bf, _0x262d2a) {
              return helperFunction207(_0x262d2a, _0x5197bf- -887);
            }return _0x1c5b27["JMgiH"](_0x487022, _0x5d1d74, _0x1b0b17);
          },
          'BwnxY':function(_0x48d6aa, _0x2e5aa1) {
            
            function helperFunction201(_0xc9ced0, _0x13b7f0) {
              return helperFunction208(_0x13b7f0, _0xc9ced0- -34);
            }return _0x1c5b27["MoEhx"](_0x48d6aa, _0x2e5aa1);
          },
          'fYqul':function(_0x314ddc, _0x1a8ad7) {
            function helperFunction202(_0x4ba7d8, _0x1bfced) {
              return helperFunction208(_0x4ba7d8, _0x1bfced- -1677);
            }return _0x1c5b27["qxciZ"](_0x314ddc, _0x1a8ad7);
          },
          'fGCCS':function(_0x202401, _0x121bef) {
            
            function helperFunction203(_0x52eb22, _0x4929f8) {
              return helperFunction208(_0x52eb22, _0x4929f8- -1443);
            }return _0x1c5b27["HpfSS"](_0x202401, _0x121bef);
          },
          'ZCNDo':" (rate limited - set GITHUB_TOKEN env var)", 'UnvXD':function(_0x9694a9, _0x44c03b) {
            
            function helperFunction204(_0x42afe8, _0x52ce9d) {
              return helperFunction208(_0x42afe8, _0x52ce9d- -1884);
            }return _0x1c5b27["puEfX"](_0x9694a9, _0x44c03b);
          },
          'eZDBh':function(_0x5ed0b9, _0xaf857a) {
            function helperFunction205(_0x4a92b0, _0x33b9cd) {
              return helperFunction208(_0x33b9cd, _0x4a92b0- -1473);
            }return _0x1c5b27["puEfX"](_0x5ed0b9, _0xaf857a);
          },
          'hNfhM':function(_0x4cda1e, _0x20892b) {
            function helperFunction206(_0x44e4e6, _0x11548c) {
              return helperFunction207(_0x44e4e6, _0x11548c- -480);
            }return _0x1c5b27["MoEhx"](_0x4cda1e, _0x20892b);
          },
          'efLQn':"HTTP ", 'iTcrD':" fetching ", 'GNoqz':"data", 'YStlI':"end", 'PFOPQ':"error"
        };
        function helperFunction207(_0xff1363, _0x1b8150) {
          return helperFunction181(_0xff1363, _0x1b8150- -491);
        }function helperFunction208(_0x12e9f0, _0x2ea2ac) {
          return helperFunction181(_0x12e9f0, _0x2ea2ac-0x5e);
        }const _0x3e4f0c=process.env.GITHUB_TOKEN||process.env.GH_TOKEN;
        function helperFunction226(_0x42274b, _0x3b95ca) {
          const _0x54ca45= {
            'IndsS':function(_0x1edd36, _0x5a9574) {
              function helperFunction209(_0x2e3b99, _0x2de4e5) {
                return _0x139e(_0x2e3b99- -978, _0x2de4e5);
              }return _0x1c5b27["NMqIP"](_0x1edd36, _0x5a9574);
            },
            'PonxU':function(_0x497a39, _0x8be0a) {
              function helperFunction210(_0x1b2fb1, _0x5e3467) {
                return _0x139e(_0x5e3467-0x298, _0x1b2fb1);
              }return _0x1c5b27["puEfX"](_0x497a39, _0x8be0a);
            },
            'liMjv':"Refusing to extract archive with parent-traversal entry: ", 'XzFdL':function(_0x12038b, _0x3b38c8) {
              function helperFunction211(_0x19c5a4, _0x26e530) {
                return helperFunction214(_0x19c5a4, _0x26e530-1822);
              }return _0x1c5b27["qxciZ"](_0x12038b, _0x3b38c8);
            },
            'RhCSm':"PkhDG", 'UbQVW':"XanKR", 'BRsbC':function(_0x5025c8, _0x15646c) {
              function helperFunction212(_0x12e24f, _0x5e361e) {
                return helperFunction213(_0x5e361e-734, _0x12e24f);
              }return _0x1c5b27["RFUGx"](_0x5025c8, _0x15646c);
            }
          };
          if(_0x1c5b27["BRsrR"](_0x3b95ca, 5)) {
            if(_0x1c5b27["qxciZ"]("QhkwE", "QhkwE"))_0xe1e14["implementedFeatures"]["push"](_0x40fd65);
            else {
              _0x1c5b27["RFUGx"](_0xa4f050, new Error(_0x1c5b27["puEfX"]("Too many redirects fetching from ", _0x5e994a)));
              return;
            }
          }const _0x43bc67= {
          };
          function helperFunction213(_0x469217, _0x15e299) {
            return helperFunction208(_0x15e299, _0x469217- -1672);
          }function helperFunction214(_0x4e016a, _0x343e43) {
            return helperFunction208(_0x4e016a, _0x343e43- -1946);
          }_0x43bc67["User-Agent"]="agent-core/binary-resolver", _0x43bc67["Accept"]="application/octet-stream";
          const _0x5722f6=_0x43bc67;
          if(_0x3e4f0c)_0x5722f6["Authorization"]=_0x1c5b27["puEfX"]("Bearer ", _0x3e4f0c);
          const _0x485192= {
          };
          _0x485192["headers"]=_0x5722f6, httpsModule["get"](_0x42274b, _0x485192, function(_0x49df6a) {
            
            function helperFunction215(_0x5145eb, _0xb7b749) {
              return helperFunction214(_0x5145eb, _0xb7b749-420);
            }function helperFunction216(_0x38d8e2, _0x4b3292) {
              return helperFunction214(_0x4b3292, _0x38d8e2-0x2f1);
            }const _0x688f42= {
              'vlHJD':function(_0x53edf0, _0x234bfc) {
                
                function helperFunction217(_0x501e2b, _0xed68ef) {
                  return _0x139e(_0xed68ef- -223, _0x501e2b);
                }return _0x5d2510["fBZRZ"](_0x53edf0, _0x234bfc);
              },
              'NzbWv':"--top", 'iOjRo':function(_0x29be5b, _0x2df6a7) {
                function helperFunction218(_0x4e058e, _0x12624b) {
                  return helperFunction216(_0x12624b- -416, _0x4e058e);
                }return _0x5d2510["EvgRN"](_0x29be5b, _0x2df6a7);
              },
              'yKToG':function(_0x52c580, _0x1b5f16, _0x145d90, _0x222432) {
                function helperFunction219(_0x2076fc, _0xcec67b) {
                  return helperFunction216(_0x2076fc-1180, _0xcec67b);
                }return _0x5d2510["WSJAA"](_0x52c580, _0x1b5f16, _0x145d90, _0x222432);
              },
              'TNgwH':"hotspots"
            };
            if(_0x5d2510["cRayW"]("zDXjd", "zDXjd")) {
              const _0x399596=[];
              if(_0x688f42["vlHJD"](_0x3b05ad["limit"], null))items12["push"]("--top", _0x688f42["iOjRo"](_0x367f7c, _0x492bd0["limit"]));
              return _0x688f42["yKToG"](_0x394813, "hotspots", items12, _0x1b2bf6);
            } else {
              const _0x196ac5=_0x49df6a["statusCode"];
              if(_0x5d2510["QoUNT"](statusCode, 301)||_0x5d2510["mYgba"](statusCode, 302)||_0x5d2510["QoUNT"](statusCode, 307)||_0x5d2510["mYgba"](statusCode, 308)) {
                _0x49df6a["resume"](), _0x5d2510["rfOdG"](helperFunction226, _0x49df6a["headers"]["location"], _0x5d2510["BwnxY"](_0x3b95ca, 1));
                return;
              }if(_0x5d2510["fYqul"](statusCode, 200)) {
                _0x49df6a["resume"]();
                const _0x47169a=_0x5d2510["fGCCS"](statusCode, 403)?" (rate limited - set GITHUB_TOKEN env var)":'';
                _0x5d2510["EvgRN"](_0xa4f050, new Error(_0x5d2510["BwnxY"](_0x5d2510["UnvXD"](_0x5d2510["eZDBh"](_0x5d2510["hNfhM"]("HTTP ", statusCode), _0x47169a), " fetching "), _0x42274b)));
                return;
              }const _0x578e43=[];
              _0x49df6a['on']("data", function(_0x113a10) {
                
                function helperFunction220(_0xb9833d, _0x5da47f) {
                  return helperFunction215(_0x5da47f, _0xb9833d- -9);
                }const _0x4e1126= {
                  'arsIE':function(_0x55e9ff, _0x3386ff) {
                    function helperFunction221(_0x278e4a, _0x41e74f) {
                      return _0x139e(_0x278e4a-0x263, _0x41e74f);
                    }return _0x54ca45["IndsS"](_0x55e9ff, _0x3386ff);
                  },
                  'LBBFf':function(_0x378a74, _0x2bb7eb) {
                    function helperFunction222(_0x43764c, _0x2323a0) {
                      return _0x139e(_0x2323a0- -660, _0x43764c);
                    }return _0x54ca45["PonxU"](_0x378a74, _0x2bb7eb);
                  },
                  'JZOwV':"Refusing to extract archive with parent-traversal entry: "
                };
                function helperFunction223(_0x920cc6, _0x502ae5) {
                  return helperFunction215(_0x920cc6, _0x502ae5-822);
                }if(_0x54ca45["XzFdL"]("PkhDG", "PkhDG")) {
                  if(_0x4e1126["arsIE"](_0x28240e[_0xc8bba5], '..'))throw new _0x3470e6(_0x4e1126["LBBFf"]("Refusing to extract archive with parent-traversal entry: ", _0x2f8508));
                } else  items13["push"](_0x113a10);
              }), _0x49df6a['on']("end", function() {
                function helperFunction224(_0x9eed37, _0x2d6ad7) {
                  return helperFunction215(_0x2d6ad7, _0x9eed37- -346);
                }function helperFunction225(_0x1f3441, _0x11f94d) {
                  return helperFunction215(_0x11f94d, _0x1f3441- -421);
                }if(_0x54ca45["IndsS"]("XanKR", "XanKR"))_0x54ca45["BRsbC"](_0x4d0b2d, Buffer["concat"](items13));
                else  returntrue;
              }), _0x49df6a['on']("error", _0xa4f050);
            }
          })['on']("error", _0xa4f050);
        }_0x1c5b27["JMgiH"](helperFunction226, _0x5e994a, 0);
      });
    }function helperFunction230(_0x45e957) {
      
      function helperFunction228(_0x34d784, _0x1deec2) {
        return helperFunction371(_0x34d784, _0x1deec2- -413);
      }function helperFunction229(_0x450125, _0x254f3a) {
        return helperFunction371(_0x254f3a, _0x450125-355);
      }{
        if(((typeof _0x45e957)!==("string")))_0x45e957=((String)(((_0x45e957)||(''))));
        const _0x55f24a=_0x45e957["trim"]()["match"](/^([A-Fa-f0-9]{64})\b/);
        if(!_0x55f24a) {
          throw new Error("Could not parse SHA-256 digest from sidecar body");
        }return _0x55f24a[1]["toLowerCase"]();
      }
    }async function helperFunction234(_0x38cbcb) {
      
      function helperFunction232(_0x396b9c, _0x47d9a0) {
        return helperFunction371(_0x396b9c, _0x47d9a0-0x209);
      }function helperFunction233(_0x424307, _0x4a130d) {
        return helperFunction371(_0x424307, _0x4a130d-576);
      }{
        const _0x54ee00=((_0x38cbcb)+(".sha256")), _0x96d3c=await ((helperFunction227)((_0x54ee00)));
        return ((helperFunction230)((_0x96d3c["toString"]("utf8"))));
      }
    }function helperFunction237(_0x35bff4) {
      const _0x207060= {
      };
      _0x207060["lmhlT"]="parse";
      
      function helperFunction235(_0x46f104, _0x7de91e) {
        return helperFunction364(_0x46f104, _0x7de91e-0x225);
      }function helperFunction236(_0x26aa9e, _0x593fe8) {
        return helperFunction364(_0x593fe8, _0x26aa9e-0x79);
      }return cryptoModule["createHash"]("sha256")["update"](_0x35bff4)["digest"]("hex");
    }function helperFunction242(_0x588bed, _0x10f665, _0x46ddc5) {
      
      function helperFunction240(_0x9fe56e, _0x8256c9) {
        return helperFunction364(_0x9fe56e, _0x8256c9-565);
      }function helperFunction241(_0x6ef104, _0x59c15b) {
        return helperFunction364(_0x59c15b, _0x6ef104- -983);
      }{
        const _0x341939=((String)(((_0x10f665)||(''))))["toLowerCase"](), _0x1c1a58=((helperFunction237)((_0x588bed)));
        if(((_0x341939)!==(_0x1c1a58)))throw new Error(((((((("SHA-256 verification failed for ")+(_0x46ddc5))+(": expected "))+(_0x341939))+(", got "))+(_0x1c1a58))+(". This could indicate a tampered release. Do not extract.")));
      }
    }function helperFunction261(_0x153da4) {
      const _0x508ab2= {
        'kqGER':function(_0x27beb1) {
          function helperFunction243(_0x4c425b, _0x2e461c) {
            return _0x139e(_0x4c425b-0x2f5, _0x2e461c);
          }return ((_0x27beb1)());
        },
        'WpuGA':function(_0x237fb6, _0x458ee7) {
          function helperFunction244(_0x3075c0, _0x41b933) {
            return _0x139e(_0x41b933- -692, _0x3075c0);
          }return ((_0x237fb6)((_0x458ee7)));
        },
        'zNjJH':function(_0x567212, _0x219650) {
          function helperFunction245(_0x2d3a0f, _0x294cbc) {
            return _0x139e(_0x294cbc-0x6a, _0x2d3a0f);
          }return ((_0x567212)((_0x219650)));
        },
        'kIhJE':function(_0x1c1988, _0x21d40b, _0x268090) {
          function helperFunction246(_0x1bfda9, _0x1e9897) {
            return _0x139e(_0x1bfda9-0x3c, _0x1e9897);
          }return ((_0x1c1988)((_0x21d40b), (_0x268090)));
        },
        'rtiYb':function(_0x4e6d30, _0x509a29) {
          function helperFunction247(_0x320ad0, _0x3c1954) {
            return _0x139e(_0x3c1954- -850, _0x320ad0);
          }return ((_0x4e6d30)((_0x509a29)));
        },
        'yBuVq':function(_0x1e78e2, _0x2a5735) {
          function helperFunction248(_0x1580d4, _0x3804d5) {
            return _0x139e(_0x3804d5- -827, _0x1580d4);
          }return ((_0x1e78e2)>(_0x2a5735));
        },
        'UYJcR':function(_0x3ff361, _0x992860, _0x31c5d6) {
          
          function helperFunction249(_0x454213, _0x1ad157) {
            return _0x139e(_0x454213- -242, _0x1ad157);
          }return ((_0x3ff361)((_0x992860), (_0x31c5d6)));
        },
        'diCft':function(_0x240ade, _0x5337ee) {
          function helperFunction250(_0x2d93d0, _0x2eb3d6) {
            return _0x139e(_0x2d93d0- -373, _0x2eb3d6);
          }return ((_0x240ade)+(_0x5337ee));
        },
        'JmheE':function(_0x579bb7, _0x23f714) {
          function helperFunction251(_0x11c7a8, _0x2dbb05) {
            return _0x139e(_0x11c7a8- -680, _0x2dbb05);
          }return ((_0x579bb7)+(_0x23f714));
        },
        'ayzGN':function(_0x360f26, _0x38f51c) {
          function helperFunction252(_0x4fa36e, _0x517615) {
            return _0x139e(_0x517615- -164, _0x4fa36e);
          }return ((_0x360f26)+(_0x38f51c));
        },
        'Twhib':function(_0xe5ab22, _0x7f0f5d) {
          function helperFunction253(_0x1a3d9a, _0x1fc261) {
            return _0x139e(_0x1a3d9a- -283, _0x1fc261);
          }return ((_0xe5ab22)>(_0x7f0f5d));
        },
        'cSbmZ':function(_0x138671, _0x110a47) {
          function helperFunction254(_0x2a50c4, _0x5c671d) {
            return _0x139e(_0x5c671d-0x2a7, _0x2a50c4);
          }return ((_0x138671)<(_0x110a47));
        },
        'mMVKh':function(_0x2dfeaf, _0x27fddb) {
          
          function helperFunction255(_0x11e2c2, _0x1abd63) {
            return _0x139e(_0x11e2c2- -430, _0x1abd63);
          }return ((_0x2dfeaf)<(_0x27fddb));
        },
        'ycMZE':function(_0x247669, _0x12155a) {
          function helperFunction256(_0x21e6ba, _0x36d6e7) {
            return _0x139e(_0x21e6ba-0xa6, _0x36d6e7);
          }return ((_0x247669)>=(_0x12155a));
        }
      };
      function helperFunction257(_0xf8a089, _0x3b47c3) {
        return helperFunction371(_0xf8a089, _0x3b47c3-95);
      }function helperFunction258(_0x3f3778, _0x9f000b) {
        return helperFunction371(_0x3f3778, _0x9f000b-0x76);
      }if((true)) {
        if(!_0x153da4||((typeof _0x153da4)!==("string")))throw new Error("Refusing to extract archive with empty entry name");
        const _0x1f6cb6=_0x153da4["replace"](/\\/g, '/')["trim"]();
        if(((_0x1f6cb6["length"])===(0))) {
          throw new Error("Refusing to extract archive with empty entry name");
        }if(_0x1f6cb6["startsWith"]('//'))throw new Error((("Refusing to extract archive with UNC entry: ")+(_0x153da4)));
        if(_0x1f6cb6["startsWith"]('/'))throw new Error((("Refusing to extract archive with absolute entry: ")+(_0x153da4)));
        if(/^[A-Za-z]:[\\/]/["test"](_0x153da4)) {
          throw new Error((("Refusing to extract archive with Windows absolute entry: ")+(_0x153da4)));
        }const _0x1c07cc=_0x1f6cb6["split"]('/')["filter"](function(_0x4043e4) {
          
          function helperFunction259(_0x58ccb1, _0x386ee7) {
            return helperFunction258(_0x386ee7, _0x58ccb1- -282);
          }function helperFunction260(_0x2c9a71, _0x5b7444) {
            return helperFunction258(_0x2c9a71, _0x5b7444- -1136);
          }return _0x508ab2["yBuVq"](_0x4043e4["length"], 0);
        });
        for(let _0x229524=0;
        ((_0x229524)<(_0x1c07cc["length"]));
        _0x229524++) {
          {
            if(((_0x1c07cc[_0x229524])===('..'))) {
              throw new Error((("Refusing to extract archive with parent-traversal entry: ")+(_0x153da4)));
            }
          }
        }
      } else {
        if(!_0x115b44)returnfalse;
        const _0x5a10a9=_0x2652c4["match"](/^(\d+)\.(\d+)\.(\d+)/);
        if(!_0x5a10a9)returnfalse;
        const _0x1b11ad=_0x5a10a9["slice"](1)["map"](_0x398ffb), _0x3b2399=_0x115773["split"]('.')["map"](_0xa94b5d);
        if(CxOKkr["Twhib"](_0x1b11ad[0], _0x3b2399[0]))returntrue;
        if(CxOKkr["cSbmZ"](_0x1b11ad[0], _0x3b2399[0]))returnfalse;
        if(CxOKkr["yBuVq"](_0x1b11ad[1], _0x3b2399[1]))returntrue;
        if(CxOKkr["mMVKh"](_0x1b11ad[1], _0x3b2399[1]))returnfalse;
        return CxOKkr["ycMZE"](_0x1b11ad[2], _0x3b2399[2]);
      }
    }function helperFunction294(_0x11f880) {
      const _0x47ca62= {
        'amhYA':function(_0xfac45d, _0x37edad) {
          function helperFunction262(_0x508a0c, _0x20a93b) {
            return _0x139e(_0x20a93b-948, _0x508a0c);
          }return ((_0xfac45d)+(_0x37edad));
        },
        'yMVCB':function(_0x1a0b18, _0x245cb4) {
          function helperFunction263(_0x48e886, _0x4763bd) {
            return _0x139e(_0x4763bd- -185, _0x48e886);
          }return ((_0x1a0b18)+(_0x245cb4));
        },
        'EAIlE':function(_0x1dda40, _0x57275f) {
          function helperFunction264(_0x9be745, _0x1b9afb) {
            return _0x139e(_0x1b9afb-0x396, _0x9be745);
          }return ((_0x1dda40)+(_0x57275f));
        },
        'zlKba':"Failed to fetch SHA-256 sidecar for ", 'FxQyB':":\n  URL: ", 'RQpdh':".sha256\n  Error: ", 'OYaOK':"\n\nThe release may be missing its checksum file. Refusing to install an unverified binary. If this is a legacy release without sidecars, pass { skipChecksum: true } to downloadBinary() (LOCAL DEV ONLY).", 'HGwZz':function(_0x484f24, _0x3d8a93) {
          function helperFunction265(_0x13b79e, _0x5183c7) {
            return helperFunction275(_0x13b79e-0x10a, _0x5183c7);
          }return ((_0x484f24)!==(_0x3d8a93));
        },
        'jSMzq':"WXLHY", 'gKltB':function(_0x59df2a, _0x1d162e) {
          function helperFunction266(_0x3c49bc, _0x4276be) {
            return helperFunction274(_0x4276be-0x3c, _0x3c49bc);
          }return ((_0x59df2a)((_0x1d162e)));
        },
        'KXqPP':" exited ", 'CCFye':function(_0x17559b, _0x37def8) {
          function helperFunction267(_0x890538, _0xf9921e) {
            return helperFunction275(_0xf9921e- -450, _0x890538);
          }return ((_0x17559b)===(_0x37def8));
        },
        'WpNjc':"nAiSg", 'aOQDz':function(_0x229328, _0x292f60) {
          
          function helperFunction268(_0xacf1c7, _0x331984) {
            return helperFunction274(_0x331984- -1224, _0xacf1c7);
          }return ((_0x229328)>(_0x292f60));
        },
        'ymxAG':"DfkCq", 'HqrJD':function(_0xd37847, _0x373793) {
          function helperFunction269(_0x550e6e, _0x3417e0) {
            return helperFunction275(_0x3417e0- -632, _0x550e6e);
          }return ((_0xd37847)!==(_0x373793));
        },
        'WBXLe':function(_0x300a31, _0x43d4d5) {
          function helperFunction270(_0x27cccf, _0x102356) {
            return helperFunction274(_0x102356- -580, _0x27cccf);
          }return ((_0x300a31)===(_0x43d4d5));
        },
        'xwDFr':"llAMv", 'WtEdo':function(_0x35fe62, _0x18668f) {
          function helperFunction271(_0x5dc744, _0x419347) {
            return helperFunction274(_0x419347- -67, _0x5dc744);
          }return _0x35fe62(_0x18668f);
        },
        'nIKSJ':function(_0x1ac578, _0x3517c2) {
          function helperFunction272(_0x28f50e, _0x19b012) {
            return helperFunction274(_0x28f50e- -835, _0x19b012);
          }return ((_0x1ac578)+(_0x3517c2));
        },
        'ZeUVP':"tar -tz listing failed (code ", 'NvvcF':"): ", 'fWEQq':function(_0x47af74, _0x3f9fb2) {
          function helperFunction273(_0x46e92d, _0x50e92d) {
            return helperFunction274(_0x50e92d- -256, _0x46e92d);
          }return ((_0x47af74)((_0x3f9fb2)));
        }
      };
      function helperFunction274(_0x43e8d9, _0x3ce313) {
        return helperFunction364(_0x3ce313, _0x43e8d9-0xc5);
      }function helperFunction275(_0x206733, _0x41a2aa) {
        return helperFunction364(_0x41a2aa, _0x206733-0x1b0);
      }return new Promise(function(_0x130fb2, _0x2819ad) {
        const _0x421e67=childProcessModule["spawn"]("tar", ["-tz"], {
          'stdio':["pipe", "pipe", "pipe"]
        });
        let _0x31d855='';
        function helperFunction276(_0x502c66, _0x2d83d9) {
          return helperFunction274(_0x502c66- -562, _0x2d83d9);
        }let _0x10397e='';
        _0x421e67["stdout"]['on']("data", function(_0x2b5b1a) {
          
          function helperFunction277(_0x34b857, _0x1315e4) {
            return helperFunction293(_0x34b857, _0x1315e4-0x3c6);
          }function helperFunction278(_0x1a5059, _0x5392e9) {
            return helperFunction293(_0x1a5059, _0x5392e9-0x309);
          }const _0x1aadd0= {
            'rYNlB':function(_0x400ec9, _0x1ba08a) {
              function helperFunction279(_0x3aadee, _0x1c13c6) {
                return _0x139e(_0x1c13c6-0xd2, _0x3aadee);
              }return _0x47ca62["amhYA"](_0x400ec9, _0x1ba08a);
            },
            'QZjdd':function(_0x32d12c, _0x260354) {
              
              function helperFunction280(_0xef32f2, _0x38302f) {
                return _0x139e(_0x38302f- -703, _0xef32f2);
              }return _0x47ca62["yMVCB"](_0x32d12c, _0x260354);
            },
            'GAwWS':function(_0x658be6, _0x1a411d) {
              function helperFunction281(_0x2255bb, _0x2dcf13) {
                return _0x139e(_0x2255bb-0xb2, _0x2dcf13);
              }return _0x47ca62["EAIlE"](_0x658be6, _0x1a411d);
            },
            'eTKgg':function(_0xa9270a, _0x578ada) {
              function helperFunction282(_0x3bf1a2, _0x27eff8) {
                return _0x139e(_0x27eff8- -946, _0x3bf1a2);
              }return _0x47ca62["amhYA"](_0xa9270a, _0x578ada);
            },
            'bpAci':function(_0x59870b, _0x14fc0d) {
              function helperFunction283(_0x58485d, _0x58b3f4) {
                return _0x139e(_0x58485d-0x41, _0x58b3f4);
              }return _0x47ca62["EAIlE"](_0x59870b, _0x14fc0d);
            },
            'tJBeu':"Failed to fetch SHA-256 sidecar for ", 'jHJjV':":\n  URL: ", 'UFnwV':".sha256\n  Error: ", 'kPQef':"\n\nThe release may be missing its checksum file. Refusing to install an unverified binary. If this is a legacy release without sidecars, pass { skipChecksum: true } to downloadBinary() (LOCAL DEV ONLY)."
          };
          if(_0x47ca62["HGwZz"]("WXLHY", "WXLHY"))throw new _0x21d751(_0x1aadd0["rYNlB"](_0x1aadd0["QZjdd"](_0x1aadd0["GAwWS"](_0x1aadd0["eTKgg"](_0x1aadd0["bpAci"](_0x1aadd0["QZjdd"]("Failed to fetch SHA-256 sidecar for ", _0x420bc5), ":\n  URL: "), _0x283373), ".sha256\n  Error: "), _0xe9403c["message"]), "\n\nThe release may be missing its checksum file. Refusing to install an unverified binary. If this is a legacy release without sidecars, pass { skipChecksum: true } to downloadBinary() (LOCAL DEV ONLY)."));
          else  _0x31d855+=_0x2b5b1a;
        }), _0x421e67["stderr"]['on']("data", function(_0x516668) {
          _0x10397e+=_0x516668;
        }), _0x421e67['on']("error", _0x2819ad), _0x421e67['on']("close", function(_0x63b0e0) {
          
          function helperFunction284(_0xacf98, _0x253e31) {
            return helperFunction276(_0xacf98-0x15d, _0x253e31);
          }const _0x4fb5e9= {
            'eSlDE':function(_0x5217e2, _0xe693d7) {
              function helperFunction285(_0x210bfd, _0xc121ea) {
                return _0x139e(_0x210bfd-566, _0xc121ea);
              }return _0x47ca62["gKltB"](_0x5217e2, _0xe693d7);
            },
            'JMaKK':function(_0x4fcb44, _0x3d1267) {
              function helperFunction286(_0x4a5f88, _0x41db27) {
                return _0x139e(_0x41db27-0x1a, _0x4a5f88);
              }return _0x47ca62["EAIlE"](_0x4fcb44, _0x3d1267);
            },
            'kJqQP':" exited ", 'ciAZj':function(_0x5d6e1e, _0x2dca51) {
              
              function helperFunction287(_0xb8780a, _0x513f98) {
                return helperFunction284(_0x513f98- -131, _0xb8780a);
              }return _0x47ca62["EAIlE"](_0x5d6e1e, _0x2dca51);
            },
            'meFhy':function(_0x8d8a6f, _0x196fe8) {
              function helperFunction288(_0x18b615, _0x21bf98) {
                return helperFunction284(_0x21bf98- -436, _0x18b615);
              }return _0x47ca62["CCFye"](_0x8d8a6f, _0x196fe8);
            },
            'glIdK':"nAiSg", 'EUMVx':function(_0x49e2d6, _0xafa3) {
              function helperFunction289(_0x24b591, _0x1485dc) {
                return helperFunction284(_0x24b591- -564, _0x1485dc);
              }return _0x47ca62["aOQDz"](_0x49e2d6, _0xafa3);
            }
          };
          function helperFunction290(_0x2fe1d8, _0xb0978c) {
            return helperFunction276(_0x2fe1d8-0x3e2, _0xb0978c);
          }if(_0x47ca62["HGwZz"]("DfkCq", "DfkCq"))_0x400958["docs"]=_0x4c770d["analyzeDocumentation"](_0x12540f);
          else {
            if(_0x47ca62["HqrJD"](_0x63b0e0, 0)) {
              if(_0x47ca62["WBXLe"]("llAMv", "llAMv")) {
                _0x47ca62["WtEdo"](_0x2819ad, new Error(_0x47ca62["amhYA"](_0x47ca62["EAIlE"](_0x47ca62["nIKSJ"]("tar -tz listing failed (code ", _0x63b0e0), "): "), _0x10397e)));
                return;
              } else  return _0x4fb5e9["eSlDE"](_0x447709, new _0x3d6011(_0x4fb5e9["JMaKK"](_0x4fb5e9["JMaKK"](_0x4fb5e9["JMaKK"](_0x3acfd9["EMBED_BINARY_NAME"], " exited "), _0xb413e4), _0x352bb1["trim"]()?_0x4fb5e9["ciAZj"](':\x20', _0x267ff3["trim"]()["slice"](0, 500)):'')));
            }const _0xfdbd9=_0x31d855["split"](/\r?\n/)["filter"](function(_0x1f7299) {
              
              function helperFunction291(_0x41a1a5, _0x200287) {
                return helperFunction290(_0x200287- -18, _0x41a1a5);
              }function helperFunction292(_0x2fe075, _0x59226c) {
                return helperFunction290(_0x59226c- -744, _0x2fe075);
              }if(_0x4fb5e9["meFhy"]("nAiSg", "nAiSg"))return _0x4fb5e9["EUMVx"](_0x1f7299["length"], 0);
              else  try {
                return _0x19e2d4["statSync"](_0x4bd5c4)["isDirectory"]();
              } catch {
                returnfalse;
              }
            });
            _0x47ca62["fWEQq"](_0x130fb2, _0xfdbd9);
          }
        });
        function helperFunction293(_0x5d7db0, _0x3ae946) {
          return helperFunction274(_0x3ae946- -949, _0x5d7db0);
        }_0x421e67["stdin"]["write"](_0x11f880), _0x421e67["stdin"]["end"]();
      });
    }function helperFunction297(_0x334f6d, _0x29400a) {
      const _0x292134= {
      };
      _0x292134["ytFti"]="[WARN] skipChecksum=true - SHA-256 verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n";
      function helperFunction295(_0x391464, _0x3ea557) {
        return helperFunction364(_0x3ea557, _0x391464-68);
      }
      function helperFunction296(_0x5410c1, _0x2ce65f) {
        return helperFunction364(_0x2ce65f, _0x5410c1-206);
      }{
        const _0x1b5ab5=((pathModule3["resolve"](_0x334f6d))+(pathModule3["sep"])), _0x4ed34c=pathModule3["resolve"](_0x29400a);
        if(((_0x4ed34c)!==(pathModule3["resolve"](_0x334f6d)))&&!_0x4ed34c["startsWith"](_0x1b5ab5)) {
          throw new Error((("Extracted path escapes extract root: ")+(_0x29400a)));
        }
      }
    }function helperFunction300(_0x2ffa79) {
      function helperFunction298(_0x34378d, _0x563d02) {
        return helperFunction364(_0x563d02, _0x34378d-430);
      }function helperFunction299(_0xa5a438, _0x12fc81) {
        return helperFunction364(_0xa5a438, _0x12fc81- -147);
      }{
        const _0x2a5f9d=[], _0x4fc831=[_0x2ffa79];
        while(((items15["length"])>(0))) {
          {
            const _0x21b859=items15["pop"](), _0x55e602=fsModule4["lstatSync"](_0x21b859);
            if(_0x55e602["isSymbolicLink"]()) {
              throw new Error((("Refusing to follow symlink produced by extractor: ")+(_0x21b859)));
            }if(_0x55e602["isDirectory"]()) {
              const _0xc8ebda=fsModule4["readdirSync"](_0x21b859);
              for(let _0x4fa940=0;
              (_0x4fa940<_0xc8ebda["length"]);
              _0x4fa940++) {
                items15["push"](pathModule3["join"](_0x21b859, _0xc8ebda[_0x4fa940]));
              }
            } else  _0x55e602["isFile"]()&&items14["push"](_0x21b859);
          }
        }return items14;
      }
    }function helperFunction303(_0x1f22e2) {
      function helperFunction301(_0x513cf9, _0x1ff6d0) {
        return helperFunction371(_0x513cf9, _0x1ff6d0-0x8d);
      }function helperFunction302(_0x270d4a, _0xaa3f46) {
        return helperFunction371(_0xaa3f46, _0x270d4a-0x2d6);
      }try {
        const _0xc03db4= {
        };
        _0xc03db4["recursive"]=true, _0xc03db4["force"]=true, fsModule4["rmSync"](_0x1f22e2, _0xc03db4);
      } catch(_0x5764b7) {
      }
    }async function helperFunction323(_0x27a570) {
      
      function helperFunction304(_0x1ddbec, _0x3f419e) {
        return helperFunction371(_0x1ddbec, _0x3f419e-724);
      }function helperFunction305(_0x37b0bc, _0xb25837) {
        return helperFunction371(_0x37b0bc, _0xb25837-286);
      }const _0x5f14fb= {
        'OJXzH':function(_0x488375, _0x687a73, _0x539b5c, _0x223277) {
          
          function helperFunction306(_0x113bd8, _0x43faf9) {
            return _0x139e(_0x113bd8-0xfa, _0x43faf9);
          }return _0x488375(_0x687a73, _0x539b5c, _0x223277);
        },
        'vtBnN':"git", 'jMODl':"rev-parse", 'GovQl':"--abbrev-ref", 'QIfgM':"HEAD", 'DfkcY':"utf8", 'lImDW':function(_0x507154, _0x40b5fb) {
          function helperFunction307(_0x388ce0, _0x3fe151) {
            return helperFunction304(_0x388ce0, _0x3fe151-0xc);
          }return ((_0x507154)((_0x40b5fb)));
        },
        'YMYvO':"require", 'eFyPD':function(_0x5c6a3f, _0x1264c3) {
          function helperFunction308(_0x34b820, _0x1da492) {
            return helperFunction305(_0x1da492, _0x34b820- -507);
          }return ((_0x5c6a3f)!==(_0x1264c3));
        },
        'CxYVE':function(_0x53cc84, _0x4f0a28) {
          function helperFunction309(_0x1283a8, _0x10cf29) {
            return helperFunction305(_0x1283a8, _0x10cf29-0x3a);
          }return ((_0x53cc84)((_0x4f0a28)));
        },
        'mGyJb':function(_0x421325, _0x5da360) {
          function helperFunction310(_0x159728, _0x2c8410) {
            return helperFunction305(_0x2c8410, _0x159728- -615);
          }return ((_0x421325)+(_0x5da360));
        },
        'IztKV':"tar extraction failed (code ", 'pvdje':"): ", 'gwbkv':"DpmMy", 'YSGeF':"uTutH", 'NaMpI':function(_0x16a373) {
          function helperFunction311(_0x34db39, _0x52e1bf) {
            return helperFunction305(_0x34db39, _0x52e1bf-76);
          }return ((_0x16a373)());
        },
        'QbDDS':function(_0x2c0082, _0x1e0161) {
          function helperFunction312(_0x2d34cd, _0x514591) {
            return helperFunction304(_0x514591, _0x2d34cd- -1092);
          }return ((_0x2c0082)===(_0x1e0161));
        },
        'jjqpg':"Xmlqq", 'JNOuK':"tar", 'zXczo':"pipe", 'LmxJZ':"data", 'VGwSR':"error", 'axuaE':"close", 'gZCjq':"repo-map-module-not-found", 'IzxGx':"attestation", 'QtxBS':"verify", 'JTpHd':"--repo", 'SpTlX':"--format", 'Ulvdf':"json", 'jfETk':"ignore", 'XWLbm':function(_0x38885e, _0x3c2aa6) {
          
          function helperFunction313(_0x527072, _0x440b04) {
            return helperFunction305(_0x527072, _0x440b04- -86);
          }return ((_0x38885e)||(_0x3c2aa6));
        },
        'TIDzy':"number", 'ldKbG':function(_0x69af7b, _0x3f9de4) {
          function helperFunction314(_0x249fee, _0x3ca1e1) {
            return helperFunction304(_0x3ca1e1, _0x249fee- -1584);
          }return ((_0x69af7b)((_0x3f9de4)));
        },
        'iMNUC':function(_0x2f1160, _0x333771) {
          function helperFunction315(_0x32b278, _0x535f29) {
            return helperFunction304(_0x535f29, _0x32b278- -244);
          }return ((_0x2f1160)((_0x333771)));
        }
      };
      if((false))return ((_0x1307ee)());
      else {
        const _0x1c6838=await ((helperFunction294)((_0x27a570)));
        for(let _0x3b8443=0;
        ((_0x3b8443)<(_0x1c6838["length"]));
        _0x3b8443++) {
          (helperFunction261)((_0x1c6838[_0x3b8443]));
        }const _0x579776=fsModule4["mkdtempSync"](pathModule3["join"](osModule["tmpdir"](), "agent-analyzer-tar-"));
        try {
          if((false)) {
            const _0xd7ac2b=_0x5f14fb["lImDW"](_0x3c25d8, _0x545009["path"]);
            if(_0xd7ac2b)_0x4d4c17["add"](_0xd7ac2b);
            _0x52793e["name"]&&_0xd7ac2b&&_0x31bb4b["add"](_0xd7ac2b+':'+_0x494f2c["name"]);
          } else {
            await new Promise(function(_0x4eec08, _0x56428f) {
              
              function helperFunction316(_0x2bacce, _0x1ac9f1) {
                return helperFunction304(_0x2bacce, _0x1ac9f1- -619);
              }const _0x34f38b= {
                'pKVXp':function(_0x4a48c9, _0x2b1738) {
                  function helperFunction317(_0x165e67, _0x3300b1) {
                    return _0x139e(_0x3300b1- -865, _0x165e67);
                  }return _0x5f14fb["QbDDS"](_0x4a48c9, _0x2b1738);
                },
                'MIeyX':"Xmlqq"
              };
              function helperFunction318(_0x5fc7fe, _0x221a3c) {
                return helperFunction304(_0x221a3c, _0x5fc7fe- -146);
              }const _0x4aae81=childProcessModule["spawn"]("tar", ['xz', '-C', _0x579776], {
                'stdio':["pipe", "pipe", "pipe"]
              });
              let _0x46ec8a='';
              _0x4aae81["stderr"]['on']("data", function(_0x272c64) {
                
                function helperFunction319(_0xac3389, _0x4c8a9e) {
                  return helperFunction318(_0xac3389-0xb4, _0x4c8a9e);
                }function helperFunction320(_0x277c27, _0x634afe) {
                  return helperFunction318(_0x634afe- -121, _0x277c27);
                }if(_0x34f38b["pKVXp"]("Xmlqq", "Xmlqq"))_0x46ec8a+=_0x272c64;
                else  return null;
              }), _0x4aae81['on']("error", _0x56428f), _0x4aae81['on']("close", function(_0x596bc2) {
                const _0x3c8de3= {
                };
                _0x3c8de3["PNDFt"]="require";
                function helperFunction321(_0x5a571f, _0x5230f1) {
                  return helperFunction316(_0x5230f1, _0x5a571f-806);
                }const _0xe6258f=_0x3c8de3;
                function helperFunction322(_0x3fea91, _0x102422) {
                  return helperFunction316(_0x102422, _0x3fea91-0x89);
                }_0x5f14fb["eFyPD"](_0x596bc2, 0)?_0x5f14fb["CxYVE"](_0x56428f, new Error(_0x5f14fb["mGyJb"](_0x5f14fb["mGyJb"](_0x5f14fb["mGyJb"]("tar extraction failed (code ", _0x596bc2), "): "), _0x46ec8a))):_0x5f14fb["eFyPD"]("DpmMy", "uTutH")?_0x5f14fb["NaMpI"](_0x4eec08):_0x1460d7["push"](_0xe6258f["PNDFt"]);
              }), _0x4aae81["stdin"]["write"](_0x27a570), _0x4aae81["stdin"]["end"]();
            });
            const _0x42c05b=((helperFunction300)((_0x579776)));
            for(let _0x1e46c4=0;
            ((_0x1e46c4)<(_0x42c05b["length"]));
            _0x1e46c4++) {
              ((helperFunction297)((_0x579776), (_0x42c05b[_0x1e46c4])));
            }
          }
        } catch(_0x4a8f81) {
          {
            ((helperFunction303)((_0x579776)));
            throw _0x4a8f81;
          }
        }return _0x579776;
      }
    }var _0x5efa56=["$ErrorActionPreference = \"Stop\"", "$src  = $env:SRC_ZIP", "$dest = $env:DEST_DIR", "if ([string]::IsNullOrEmpty($src) -or [string]::IsNullOrEmpty($dest)) {", "  [Console]::Error.WriteLine(\"SRC_ZIP and DEST_DIR must both be set\"); exit 2", '}', "Add-Type -AssemblyName System.IO.Compression.FileSystem", "$destFull = [System.IO.Path]::GetFullPath($dest)", "if (-not $destFull.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {", "  $destFull = $destFull + [System.IO.Path]::DirectorySeparatorChar", '}', "$zip = [System.IO.Compression.ZipFile]::OpenRead($src)", "try {", "  foreach ($entry in $zip.Entries) {", "    $name = $entry.FullName", "    if ([string]::IsNullOrEmpty($name)) { continue }", "    $norm = $name -replace \"\\\\\",\"/\"", "    if ($norm.StartsWith(\"/\") -or $norm.StartsWith(\"//\")) {", "      [Console]::Error.WriteLine(\"Refusing absolute/UNC entry: \" + $name); exit 3", "    }", "    if ($name -match \"^[A-Za-z]:[\\\\/]\") {", "      [Console]::Error.WriteLine(\"Refusing Windows-absolute entry: \" + $name); exit 3", "    }", "    foreach ($part in ($norm -split \"/\")) {", "      if ($part -eq \"..\") {", "        [Console]::Error.WriteLine(\"Refusing parent-traversal entry: \" + $name); exit 3", "      }", "    }", "    $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($destFull, $norm))", "    if (-not $target.StartsWith($destFull, [System.StringComparison]::OrdinalIgnoreCase)) {", "      [Console]::Error.WriteLine(\"Entry escapes destination: \" + $name); exit 3", "    }", "    if ($entry.FullName.EndsWith(\"/\")) {", "      [System.IO.Directory]::CreateDirectory($target) | Out-Null", "    } else {", "      $parent = [System.IO.Path]::GetDirectoryName($target)", "      if ($parent) { [System.IO.Directory]::CreateDirectory($parent) | Out-Null }", "      [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true)", "    }", "  }", "} finally {", "  $zip.Dispose()", '}']["join"]('\x0d\x0a');
    async function helperFunction334(_0x4411d1) {
      const _0x4b18e9=fsModule4["mkdtempSync"](pathModule3["join"](osModule["tmpdir"](), "agent-analyzer-zip-")), _0x1d5fed=pathModule3["join"](_0x4b18e9, "__archive.zip");
      function helperFunction324(_0xbf947e, _0x42af07) {
        return helperFunction371(_0xbf947e, _0x42af07-517);
      }const _0x125481=fsModule4["mkdtempSync"](pathModule3["join"](osModule["tmpdir"](), "agent-analyzer-ps-"));
      function helperFunction325(_0x44fce9, _0x27d2f2) {
        return helperFunction371(_0x44fce9, _0x27d2f2- -191);
      }const _0x4ec6e2=pathModule3["join"](_0x125481, "extract.ps1");
      try {
        fsModule4["writeFileSync"](_0x1d5fed, _0x4411d1), fsModule4["writeFileSync"](_0x4ec6e2, _0x5efa56, "utf8"), await new Promise(function(_0x25ce02, _0xfbc23a) {
          
          function helperFunction326(_0x3848f6, _0x24cac4) {
            return helperFunction325(_0x24cac4, _0x3848f6- -447);
          }const _0x594eee= {
            'bjEfS':"agent-analyzer", 'QxAbu':function(_0x4efb34, _0x484732) {
              
              function helperFunction327(_0x22dcea, _0x4aa31f) {
                return helperFunction331(_0x22dcea, _0x4aa31f-0x92);
              }return ((_0x4efb34)===(_0x484732));
            },
            'xwkKh':"jtPPi", 'nDKNN':function(_0x3d2af3, _0x4402a8) {
              function helperFunction328(_0x570e2e, _0x40bec2) {
                return helperFunction326(_0x40bec2-0x82, _0x570e2e);
              }return ((_0x3d2af3)((_0x4402a8)));
            },
            'URaRZ':function(_0x2d1fc9, _0x173190) {
              function helperFunction329(_0x10bc0c, _0x31a3e6) {
                return helperFunction331(_0x10bc0c, _0x31a3e6- -1107);
              }return ((_0x2d1fc9)+(_0x173190));
            },
            'akVUF':"zip extraction failed: ", 'AWXVP':function(_0x1a85e1) {
              function helperFunction330(_0x20f552, _0xced66) {
                return helperFunction326(_0xced66-695, _0x20f552);
              }return ((_0x1a85e1)());
            }
          };
          function helperFunction331(_0x54b9a7, _0x5c55ca) {
            return helperFunction325(_0x54b9a7, _0x5c55ca-601);
          }if((false)) {
            const _0x263e94= {
            };
            return _0x263e94["found"]=false, _0x263e94["error"]=_0x2027b6["message"], _0x263e94["tool"]="agent-analyzer", _0x263e94;
          } else {
            const _0x37462e= {
            };
            _0x37462e["SRC_ZIP"]=_0x1d5fed, _0x37462e["DEST_DIR"]=_0x4b18e9;
            const _0x3ee97e=childProcessModule["execFile"]("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", _0x4ec6e2], {
              'windowsHide':true, 'env':Object["assign"]({
              },
              process.env, _0x37462e)
            },
            function(_0x553a93, _0x21c479, _0xba0ea1) {
              
              function helperFunction332(_0x30ffcf, _0x4c900d) {
                return helperFunction331(_0x4c900d, _0x30ffcf- -465);
              }function helperFunction333(_0x50d127, _0x25d477) {
                return helperFunction331(_0x25d477, _0x50d127- -1033);
              }if(_0x553a93) {
                if(_0x594eee["QxAbu"]("jtPPi", "jtPPi"))_0x594eee["nDKNN"](_0xfbc23a, new Error(_0x594eee["URaRZ"]("zip extraction failed: ", _0xba0ea1||_0x553a93["message"])));
                else  return _0x12764a;
              } else  _0x594eee["AWXVP"](_0x25ce02);
            });
            if(_0x3ee97e["stdin"])_0x3ee97e["stdin"]["end"]();
          }
        });
        try {
          fsModule4["unlinkSync"](_0x1d5fed);
        } catch(_0x557c49) {
        }const _0x1eb850=((helperFunction300)((_0x4b18e9)));
        for(let _0x1dbd36=0;
        ((_0x1dbd36)<(_0x1eb850["length"]));
        _0x1dbd36++) {
          ((helperFunction297)((_0x4b18e9), (_0x1eb850[_0x1dbd36])));
        }
      } catch(_0x549bc4) {
        ((helperFunction303)((_0x4b18e9)));
        throw _0x549bc4;
      } finally {
        ((helperFunction303)((_0x125481)));
      }return _0x4b18e9;
    }function helperFunction338(_0xe142f5, _0x44d95f) {
      
      function helperFunction335(_0x3094ef, _0x3a5629) {
        return helperFunction371(_0x3094ef, _0x3a5629-362);
      }function helperFunction336(_0xe7b70f, _0xcaf2ae) {
        return helperFunction371(_0xe7b70f, _0xcaf2ae-795);
      }
      {
        const _0x598d22=((helperFunction300)((_0xe142f5)));
        for(let _0x36bb74=0;
        ((_0x36bb74)<(_0x598d22["length"]));
        _0x36bb74++) {
          {
            if(((pathModule3["basename"](_0x598d22[_0x36bb74]))===(_0x44d95f))) {
              return ((helperFunction297)((_0xe142f5), (_0x598d22[_0x36bb74]))), _0x598d22[_0x36bb74];
            }
          }
        }return null;
      }
    }function helperFunction342(_0x125106, _0x2e327a) {
      
      function helperFunction339(_0x201518, _0x4fae14) {
        return helperFunction364(_0x4fae14, _0x201518- -597);
      }
      function helperFunction341(_0x160c1a, _0x40aedd) {
        return helperFunction364(_0x160c1a, _0x40aedd-0x299);
      }try {
        const _0x57d29d=childProcessModule["execFileSync"]('gh', ["attestation", "verify", _0x125106, "--repo", _0x2e327a, "--format", "json"], {
          'encoding':"utf8", 'stdio':["ignore", "pipe", "pipe"], 'timeout':0xea60, 'windowsHide':true
        });
        return {
          'status':0x0, 'stdout':((_0x57d29d)||('')), 'stderr':''
        };
      } catch(_0x2be86a) {
        return{
          'status':((typeof _0x2be86a["status"])===("number"))?_0x2be86a["status"]:null, 'stdout':_0x2be86a["stdout"]?((String)((_0x2be86a["stdout"]))):'', 'stderr':_0x2be86a["stderr"]?String(_0x2be86a["stderr"]):_0x2be86a["message"]||''
        };
      }
    }function helperFunction349(_0x2e0b73) {
      
      function helperFunction343(_0x3fa783, _0x561f86) {
        return helperFunction371(_0x561f86, _0x3fa783- -823);
      }function helperFunction344(_0x29c06c, _0x22727a) {
        return helperFunction371(_0x29c06c, _0x22727a-0x0);
      }
      {
        if(((typeof _0x2e0b73)===("function"))) {
          try {
            return !!((_0x2e0b73)());
          } catch(_0x3df2c4) {
            returnfalse;
          }
        }try {
          return childProcessModule["execFileSync"]('gh', ["--version"], {
            'stdio':"ignore", 'timeout':0x1388, 'windowsHide':true
          }), true;
        } catch(_0x267374) {
          returnfalse;
        }
      }
    }function helperFunction352(_0x57ca8e, _0x51ccde) {
      function helperFunction350(_0x21dc45, _0x562cbe) {
        return helperFunction364(_0x21dc45, _0x562cbe- -388);
      }function helperFunction351(_0x1b5ee3, _0x5415ac) {
        return helperFunction364(_0x5415ac, _0x1b5ee3-0x2d6);
      }{
        const _0x43609c=((_0x51ccde)||({
        })), _0x139f1e=_0x43609c["repo"]||_0xbb0eb4, _0x24ee06=((typeof _0x43609c["ghRunner"])===("function"))?_0x43609c["ghRunner"]:helperFunction342, _0x265678=((typeof _0x43609c["requireAttestation"])===("boolean"))?_0x43609c["requireAttestation"]:((process.env.AGENT_ANALYZER_REQUIRE_ATTESTATION)===('1')), _0x218741=((helperFunction349)((_0x43609c["ghProbe"])));
        if(!_0x218741) {
          const _0x3a6c5d="`gh` CLI not found on PATH";
          if(_0x265678) {
            return {
              'status':"failed", 'reason':(_0x3a6c5d+" (AGENT_ANALYZER_REQUIRE_ATTESTATION=1)")
            };
          }const _0x1dc29f= {
          };
          return _0x1dc29f["status"]="skipped", _0x1dc29f["reason"]=_0x3a6c5d, _0x1dc29f;
        }const _0x2f9613=((_0x24ee06)((_0x57ca8e), (_0x139f1e)));
        if(_0x2f9613&&((_0x2f9613["status"])===(0))) {
          {
            const _0x48bdf0= {
            };
            return _0x48bdf0["status"]="verified", _0x48bdf0;
          }
        }return {
          'status':"failed", 'reason':(("gh attestation verify exited with status ")+(_0x2f9613&&(_0x2f9613["status"]!==null)?_0x2f9613["status"]:"unknown")), 'stderr':_0x2f9613&&_0x2f9613["stderr"]||''
        };
      }
    }async function helperFunction357(_0x37be8f, _0x2aea37) {
      const _0x1b3551=((_0x2aea37)||({
      })), _0xa308c8=((_0x1b3551["skipChecksum"])===(true)), _0x2bba3c=((_0x1b3551["skipAttestation"])===(true)), _0x5b1aa8=((helperFunction165)());
      if(!_0x5b1aa8) {
        throw new Error(((((("Unsupported platform: ")+(process["platform"]))+('-'))+(process["arch"]))+". Supported platforms: "+Object["keys"](_0xb91a14)["join"](',\x20')));
      }function helperFunction355(_0x547d54, _0x34f8d3) {
        return helperFunction364(_0x547d54, _0x34f8d3- -1017);
      }const _0x5d965a=((helperFunction179)((_0x37be8f), (_0x5b1aa8))), _0x2395d0=_0x5d965a["substring"](((_0x5d965a["lastIndexOf"]('/'))+(1)));
      process["stderr"]["write"](((((((("Downloading ")+(_0x8f30b7))+('\x20v'))+(_0x37be8f))+(" for "))+(_0x5b1aa8))+("...\n")));
      const _0x4bdab0=((helperFunction162)()), _0x480a29=pathModule3["dirname"](_0x4bdab0), _0x1da3ff= {
      };
      _0x1da3ff["recursive"]=true, fsModule4["mkdirSync"](_0x480a29, _0x1da3ff);
      let _0x245137;
      try {
        _0x245137=await ((helperFunction227)((_0x5d965a)));
      } catch(_0x35461c) {
        throw new Error(((((((((((("Failed to download ")+(_0x8f30b7))+(":\n  URL: "))+(_0x5d965a))+"\n  Error: "+_0x35461c["message"])+("\n\nTo install manually:\n  1. Download: "))+(_0x5d965a))+"\n  2. Extract the binary to: ")+(_0x480a29))+("\n  3. Ensure it is named: "))+(pathModule3["basename"](_0x4bdab0))));
      }if(_0xa308c8) {
        process["stderr"]["write"]("[WARN] skipChecksum=true - SHA-256 verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n");
      } else {
        let _0x513898;
        try {
          _0x513898=await ((helperFunction234)((_0x5d965a)));
        } catch(_0x59ad1f) {
          throw new Error(((((((("Failed to fetch SHA-256 sidecar for ")+(_0x2395d0))+":\n  URL: ")+(_0x5d965a))+(".sha256\n  Error: "))+(_0x59ad1f["message"]))+("\n\nThe release may be missing its checksum file. Refusing to install an unverified binary. If this is a legacy release without sidecars, pass { skipChecksum: true } to downloadBinary() (LOCAL DEV ONLY).")));
        }((helperFunction242)((_0x245137), (_0x513898), (_0x2395d0)));
      }if(_0x2bba3c)process["stderr"]["write"]("[WARN] skipAttestation=true - SLSA verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n");
      else {
        const _0x2248e6=fsModule4["mkdtempSync"](pathModule3["join"](osModule["tmpdir"](), "agent-analyzer-slsa-")), _0x1d0f0b=pathModule3["join"](_0x2248e6, _0x2395d0);
        try {
          fsModule4["writeFileSync"](_0x1d0f0b, _0x245137);
          const _0x1ad983= {
          };
          _0x1ad983["repo"]=_0xbb0eb4, _0x1ad983["requireAttestation"]=_0x1b3551["requireAttestation"], _0x1ad983["ghRunner"]=_0x1b3551["ghRunner"], _0x1ad983["ghProbe"]=_0x1b3551["ghProbe"];
          const _0x4850e4=helperFunction352(_0x1d0f0b, _0x1ad983);
          if((_0x4850e4["status"]==="verified"))process["stderr"]["write"](((("[OK] SLSA attestation verified for ")+(_0x2395d0))+('\x0a')));
          else {
            if((_0x4850e4["status"]==="skipped"))process["stderr"]["write"]((("[WARN] SLSA attestation check skipped: "+_0x4850e4["reason"])+(". Install the GitHub CLI (`gh`) to enable provenance verification. Set AGENT_ANALYZER_REQUIRE_ATTESTATION=1 to require it.\n")));
            else  throw new Error((((((("SLSA attestation verification failed for ")+(_0x2395d0))+(':\x20'))+_0x4850e4["reason"])+(". Refusing to execute binary."))+(_0x4850e4["stderr"]?(("\n--- gh stderr ---\n")+(_0x4850e4["stderr"])):'')));
          }
        } finally {
          ((helperFunction303)((_0x2248e6)));
        }
      }const _0x83a231=pathModule3["basename"](_0x4bdab0);
      let _0xe37aa7;
      function helperFunction356(_0x23afc6, _0x2765dc) {
        return helperFunction364(_0x23afc6, _0x2765dc- -1017);
      }try {
        ((process["platform"])===("win32"))?_0xe37aa7=await ((helperFunction334)((_0x245137))):_0xe37aa7=await ((helperFunction323)((_0x245137)));
        const _0x227f43=((helperFunction338)((_0xe37aa7), (_0x83a231)));
        if(!_0x227f43) {
          throw new Error(((((("Expected binary \"")+(_0x83a231))+("\" not found inside archive "))+(_0x2395d0))+". Archive layout may have changed."));
        }fsModule4["copyFileSync"](_0x227f43, _0x4bdab0);
      } finally {
        if(_0xe37aa7)helperFunction303(_0xe37aa7);
      }if((process["platform"]!=="win32")) {
        fsModule4["chmodSync"](_0x4bdab0, 493);
      }const _0x2b75df=helperFunction171();
      if(!_0x2b75df) {
        throw new Error(((((_0x8f30b7)+(" was downloaded to "))+(_0x4bdab0))+(" but could not be executed. Check the file is a valid binary for this platform.")));
      }return _0x4bdab0;
    }async function helperFunction360(_0x30ed3a) {
      
      function helperFunction358(_0x527c21, _0x48ed4b) {
        return helperFunction364(_0x527c21, _0x48ed4b-0x2f3);
      }function helperFunction359(_0x56d4f2, _0xcaef30) {
        return helperFunction364(_0x56d4f2, _0xcaef30-0x34d);
      }const _0x1b0c14= {
      };
      _0x1b0c14["RBdzQ"]="README.md", _0x1b0c14["snMup"]=".eslintrc", _0x1b0c14["qkPgp"]=".eslintrc.js", _0x1b0c14["viygD"]=".eslintrc.json", _0x1b0c14["vDMGQ"]="eslint.config.js", _0x1b0c14["gNSnR"]="biome.json", _0x1b0c14["uHbhQ"]=".github/workflows", _0x1b0c14["maZIz"]=".gitlab-ci.yml", _0x1b0c14["cttMo"]=".circleci", _0x1b0c14["XkGzS"]="Jenkinsfile", _0x1b0c14["Qnutv"]=".travis.yml", _0x1b0c14["hXIrF"]="tests", _0x1b0c14["QYeBd"]="__tests__", _0x1b0c14["uxIDs"]="test", _0x1b0c14["lkkfH"]="spec";
      const _0x5e0a79=((_0x30ed3a)||({
      })), _0x449546=_0x5e0a79["version"]||_0x1c879f, _0x157055=((helperFunction162)());
      if(fsModule4["existsSync"](_0x157055)) {
        const _0x406087=((helperFunction171)());
        if(helperFunction168(_0x406087, _0x1c879f)) {
          return _0x157055;
        }
      }return ((helperFunction357)((_0x449546), ({
        'skipChecksum':((_0x5e0a79["skipChecksum"])===(true)), 'skipAttestation':((_0x5e0a79["skipAttestation"])===(true)), 'requireAttestation':_0x5e0a79["requireAttestation"], 'ghRunner':_0x5e0a79["ghRunner"], 'ghProbe':_0x5e0a79["ghProbe"]
      })));
    }function helperFunction363(_0x11f07b) {
      const _0x280532=((helperFunction162)());
      if(fsModule4["existsSync"](_0x280532)) {
        const _0x1a28f9=helperFunction171();
        if(((helperFunction168)((_0x1a28f9), (_0x1c879f)))) {
          return _0x280532;
        }
      }const _0x36bb63=_0x11f07b&&_0x11f07b["version"]||_0x1c879f, _0x3a0524=!!(_0x11f07b&&_0x11f07b["skipChecksum"]), _0x3d4309=!!(_0x11f07b&&_0x11f07b["skipAttestation"]), _0x5ec6a7=_0x11f07b&&((typeof _0x11f07b["requireAttestation"])===("boolean"))?_0x11f07b["requireAttestation"]:undefined, _0x2f5d15=__filename, _0x34aba6= {
      };
      _0x34aba6["version"]=_0x36bb63, _0x34aba6["skipChecksum"]=_0x3a0524, _0x34aba6["skipAttestation"]=_0x3d4309;
      function helperFunction361(_0x32d6b0, _0x3880aa) {
        return helperFunction364(_0x3880aa, _0x32d6b0-0x9c);
      }const _0x45b4b4=_0x34aba6;
      if((_0x5ec6a7!==undefined)) {
        _0x45b4b4["requireAttestation"]=_0x5ec6a7;
      }function helperFunction362(_0x4c0d76, _0x1d9ef8) {
        return helperFunction364(_0x4c0d76, _0x1d9ef8- -1011);
      }const _0x2cb6fa=[("var b = require("+JSON["stringify"](_0x2f5d15)+');'), ((("b.ensureBinary(")+(JSON["stringify"](_0x45b4b4)))+(')')), "  .then(function(p) { process.stdout.write(p); })", "  .catch(function(e) { process.stderr.write(e.message); process.exit(1); });"];
      try {
        const _0x464a72= {
        };
        _0x464a72["encoding"]="utf8", _0x464a72["stdio"]=["pipe", "pipe", "inherit"], _0x464a72["timeout"]=0x1d4c0;
        const _0x90d43d=childProcessModule["execFileSync"](process["execPath"], ['-e', items16["join"]('\x0a')], _0x464a72);
        return _0x90d43d["trim"]()||_0x280532;
      } catch(_0x5f1c46) {
        throw new Error(("Failed to ensure binary (sync): "+_0x5f1c46["message"]));
      }
    }function helperFunction364(_0x173167, _0x3df2ec) {
      return _0x543fdb(_0x173167, _0x3df2ec- -815);
    }function helperFunction367(_0x1be808, _0x5538e0) {
      const _0x4c9e4f=((helperFunction363)());
      function helperFunction365(_0x4a5973, _0x1c6e91) {
        return helperFunction364(_0x1c6e91, _0x4a5973-0x116);
      }const _0x310e55= {
      };
      _0x310e55["encoding"]="utf8", _0x310e55["windowsHide"]=true;
      function helperFunction366(_0x5a3712, _0xbfc9f7) {
        return helperFunction364(_0x5a3712, _0xbfc9f7- -605);
      }_0x310e55["maxBuffer"]=_0x1b37c8;
      const _0x47f53b=Object["assign"](_0x310e55, _0x5538e0);
      
      const _0x20cd96=childProcessModule["execFileSync"](_0x4c9e4f, _0x1be808, _0x47f53b);
      return(typeof _0x20cd96==="string")?_0x20cd96:_0x20cd96["toString"]("utf8");
    }async function helperFunction370(_0x314c56, _0x5c7517) {
      const _0x36a0e6=await ((helperFunction360)()), _0x1d77f6= {
      };
      function helperFunction368(_0x4689a8, _0x30db3) {
        return helperFunction371(_0x30db3, _0x4689a8- -1010);
      }_0x1d77f6["encoding"]="utf8";
      function helperFunction369(_0x28a20b, _0xc8acc0) {
        return helperFunction371(_0x28a20b, _0xc8acc0-0x11c);
      }_0x1d77f6["windowsHide"]=true, _0x1d77f6["maxBuffer"]=_0x1b37c8;
      const _0x3a1298=Object["assign"](_0x1d77f6, _0x5c7517), _0x2b3c58=await ((_0x2bb30f)((_0x36a0e6), (_0x314c56), (_0x3a1298)));
      return _0x2b3c58["stdout"];
    }const _0x315e3f= {
    };
    _0x315e3f["ensureBinary"]=helperFunction360, _0x315e3f["ensureBinarySync"]=helperFunction363, _0x315e3f["runAnalyzer"]=helperFunction367, _0x315e3f["runAnalyzerAsync"]=helperFunction370, _0x315e3f["getBinaryPath"]=helperFunction162, _0x315e3f["getVersion"]=helperFunction171, _0x315e3f["getPlatformKey"]=helperFunction165, _0x315e3f["isAvailable"]=helperFunction174, _0x315e3f["isAvailableAsync"]=helperFunction176, _0x315e3f["meetsMinimumVersion"]=helperFunction168, _0x315e3f["buildDownloadUrl"]=helperFunction179, _0x315e3f["PLATFORM_MAP"]=_0xb91a14, _0x315e3f["parseSha256Sidecar"]=helperFunction230, _0x315e3f["verifySha256"]=helperFunction242;
    function helperFunction371(_0x4a9af0, _0x3ffef3) {
      return _0x543fdb(_0x4a9af0, _0x3ffef3- -864);
    }_0x315e3f["sha256Hex"]=helperFunction237, _0x315e3f["assertSafeArchiveEntry"]=helperFunction261, _0x315e3f["assertInsideRoot"]=helperFunction297, _0x315e3f["downloadBinary"]=helperFunction357, _0x315e3f["verifySlsaAttestation"]=helperFunction352, _0x315e3f["isGhAvailable"]=helperFunction349, _0x315e3f["extractTarGzToScratch"]=helperFunction323, _0x315e3f["extractZipToScratch"]=helperFunction334, _0x315e3f["_EXTRACT_ZIP_PS1"]=_0x5efa56, _0x5783b3["exports"]=_0x315e3f;
  }
}), require_installer=__commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/installer.js'(_0x20bd32, _0x71ef88) {
    'use strict';
    
    var binaryModule=require_binary();
    function helperFunction372(_0x16bd0f, _0x4d9417) {
      return _0x3f8685(_0x16bd0f- -815, _0x4d9417);
    }async function helperFunction382() {
      
      function helperFunction380(_0x2b6ce4, _0x5cf62e) {
        return helperFunction395(_0x2b6ce4-0x4db, _0x5cf62e);
      }function helperFunction381(_0x320dcd, _0x3da588) {
        return helperFunction395(_0x320dcd-0x79b, _0x3da588);
      }{
        if(binaryModule["isAvailable"]()) {
          return {
            'found':true, 'version':binaryModule["getVersion"](), 'tool':"agent-analyzer"
          };
        }try {
          return await binaryModule["ensureBinary"](), {
            'found':true, 'version':binaryModule["getVersion"](), 'tool':"agent-analyzer"
          };
        } catch(_0x5f7c5c) {
          const _0x3e8080= {
          };
          return _0x3e8080["found"]=false, _0x3e8080["error"]=_0x5f7c5c["message"], _0x3e8080["tool"]="agent-analyzer", _0x3e8080;
        }
      }
    }function helperFunction385() {
      function helperFunction383(_0x36df31, _0x151442) {
        return helperFunction372(_0x36df31-0x3a1, _0x151442);
      }function helperFunction384(_0x429d1b, _0x1964f2) {
        return helperFunction372(_0x1964f2- -274, _0x429d1b);
      }if(binaryModule["isAvailable"]()) {
        return {
          'found':true, 'version':binaryModule["getVersion"](), 'tool':"agent-analyzer"
        };
      }try {
        return binaryModule["ensureBinarySync"](), {
          'found':true, 'version':binaryModule["getVersion"](), 'tool':"agent-analyzer"
        };
      } catch(_0x507d4b) {
        const _0x21fde8= {
        };
        return _0x21fde8["found"]=false, _0x21fde8["error"]=_0x507d4b["message"], _0x21fde8["tool"]="agent-analyzer", _0x21fde8;
      }
    }function helperFunction389() {
      
      function helperFunction386(_0x230061, _0x61fa91) {
        return helperFunction395(_0x230061-1161, _0x61fa91);
      }
      function helperFunction388(_0x29fce5, _0x618733) {
        return helperFunction395(_0x29fce5-0x17e, _0x618733);
      }return true;
    }function helperFunction391() {
      
      function helperFunction390(_0x1013b9, _0xbdba35) {
        return helperFunction395(_0xbdba35-0x2f0, _0x1013b9);
      }return "agent-analyzer is downloaded automatically on first use from https://github.com/agent-sh/agent-analyzer/releases";
    }function helperFunction394() {
      function helperFunction392(_0x460274, _0x58d4d0) {
        return helperFunction395(_0x58d4d0-44, _0x460274);
      }function helperFunction393(_0x8ac9d8, _0x5df64) {
        return helperFunction395(_0x5df64-0x561, _0x8ac9d8);
      }return "0.3.0";
    }const _0x532fa3= {
    };
    _0x532fa3["checkInstalled"]=helperFunction382;
    function helperFunction395(_0x1d1f17, _0x3a82cb) {
      return _0x3f8685(_0x1d1f17- -1740, _0x3a82cb);
    }_0x532fa3["checkInstalledSync"]=helperFunction385, _0x532fa3["meetsMinimumVersion"]=helperFunction389, _0x532fa3["getInstallInstructions"]=helperFunction391, _0x532fa3["getMinimumVersion"]=helperFunction394, _0x532fa3["getCommand"]=()=>null, _0x71ef88["exports"]=_0x532fa3;
  }
}), require_state_dir=__commonJS({
  '../work/agent-sh__agentsys/lib/platform/state-dir.js'(_0x10e3b1, _0xfbeccc) {
    
    var _0x23ba57=require('fs'), _0x3c4eee=((require)(("path"))), _0x43df7f=new Map();
    function helperFunction396(_0x5a6942, _0x484456) {
      return _0x3f8685(_0x484456- -824, _0x5a6942);
    }function helperFunction400(_0x4974df) {
      
      function helperFunction398(_0x28d18e, _0x2adabd) {
        return helperFunction396(_0x28d18e, _0x2adabd-1030);
      }function helperFunction399(_0x490200, _0x520816) {
        return helperFunction396(_0x520816, _0x490200- -83);
      }try {
        return fsModule5["statSync"](_0x4974df)["isDirectory"]();
      } catch {
        returnfalse;
      }
    }function helperFunction406(_0x1c58d3=process["cwd"]()) {
      
      function helperFunction401(_0x2c4ba4, _0x111cc0) {
        return helperFunction396(_0x2c4ba4, _0x111cc0-0x119);
      }function helperFunction402(_0xdd6c55, _0xc09825) {
        return helperFunction396(_0xc09825, _0xdd6c55- -16);
      }
      {
        if(process.env.AI_STATE_DIR) {
          return process.env.AI_STATE_DIR;
        }const _0x4ca1c3=pathModule4["resolve"](_0x1c58d3), _0x3dcec2=lookup["get"](_0x4ca1c3);
        if(_0x3dcec2)return _0x3dcec2;
        if(process.env.OPENCODE_CONFIG||process.env.OPENCODE_CONFIG_DIR) {
          return lookup["set"](_0x4ca1c3, ".opencode"), ".opencode";
        }try {
          {
            const _0x3c8e9f=pathModule4["join"](_0x1c58d3, ".opencode");
            if(((helperFunction400)((_0x3c8e9f))))return lookup["set"](_0x4ca1c3, ".opencode"), ".opencode";
          }
        } catch {
        }if(process.env.CODEX_HOME)return lookup["set"](_0x4ca1c3, ".codex"), ".codex";
        try {
          const _0x1f9225=pathModule4["join"](_0x1c58d3, ".codex");
          if(((helperFunction400)((_0x1f9225)))) {
            return lookup["set"](_0x4ca1c3, ".codex"), ".codex";
          }
        } catch {
        }return lookup["set"](_0x4ca1c3, ".claude"), ".claude";
      }
    }function helperFunction409(_0x4a581b=process["cwd"]()) {
      function helperFunction407(_0x8aeda0, _0x5b99e7) {
        return helperFunction396(_0x8aeda0, _0x5b99e7-0x246);
      }function helperFunction408(_0x54804f, _0x212d2a) {
        return helperFunction396(_0x54804f, _0x212d2a- -264);
      }return pathModule4["join"](_0x4a581b, ((helperFunction406)((_0x4a581b))));
    }function helperFunction412(_0x502b0a=process["cwd"]()) {
      
      function helperFunction410(_0x212f91, _0x9d9748) {
        return helperFunction413(_0x212f91- -495, _0x9d9748);
      }function helperFunction411(_0x5ed4ad, _0x4035d9) {
        return helperFunction413(_0x4035d9- -198, _0x5ed4ad);
      }{
        const _0x5dc517=((helperFunction406)((_0x502b0a)));
        if(process.env.AI_STATE_DIR)return "custom";
        switch(_0x5dc517) {
          case ".opencode":return "opencode";
          case ".codex":return "codex";
          case ".claude":return "claude";
          default:return "unknown";
        }
      }
    }function helperFunction413(_0x262a86, _0x49af24) {
      return _0x3f8685(_0x262a86-40, _0x49af24);
    }function helperFunction420() {
      
      function helperFunction414(_0x364d8b, _0x2920c5) {
        return helperFunction396(_0x364d8b, _0x2920c5-0x2b6);
      }
      function helperFunction419(_0x5b621c, _0x371e55) {
        return helperFunction396(_0x371e55, _0x5b621c- -757);
      }lookup["clear"]();
    }const _0x2e667b= {
    };
    _0x2e667b["getStateDir"]=helperFunction406, _0x2e667b["getStateDirPath"]=helperFunction409, _0x2e667b["getPlatformName"]=helperFunction412, _0x2e667b["clearCache"]=helperFunction420, _0xfbeccc["exports"]=_0x2e667b;
  }
}), require_atomic_write=__commonJS({
  '../work/agent-sh__agentsys/lib/utils/atomic-write.js'(_0x488c13, _0x1a8cee) {
    
    var _0x38f7b4=((require)(('fs'))), _0x35cef2=((require)(("path"))), _0x1f7374=((require)(("crypto")));
    function helperFunction423(_0x1264cc) {
      
      function helperFunction421(_0x56a512, _0x1516da) {
        return helperFunction440(_0x56a512, _0x1516da-1606);
      }function helperFunction422(_0xf4d858, _0x5aef3b) {
        return helperFunction440(_0xf4d858, _0x5aef3b-0x3cc);
      }{
        const _0xe7acdc=pathModule5["dirname"](_0x1264cc), _0x5e71bc=pathModule5["basename"](_0x1264cc), _0x4592c8=cryptoModule2["randomBytes"](6)["toString"]("hex");
        return pathModule5["join"](_0xe7acdc, '.'+_0x5e71bc+'.'+_0x4592c8+".tmp");
      }
    }function helperFunction434(_0x2fb9f8, _0x28d275, _0x39da3e= {
    }) {
      
      function helperFunction424(_0x21c004, _0x120925) {
        return helperFunction440(_0x120925, _0x21c004- -47);
      }function helperFunction425(_0x4dadce, _0x295ab5) {
        return helperFunction440(_0x4dadce, _0x295ab5-1702);
      }
      {
        const {
          encoding:encoding="utf8", mode:mode=420
        }=_0x39da3e, _0x484bc0=pathModule5["dirname"](_0x2fb9f8);
        if(!fsModule6["existsSync"](_0x484bc0)) {
          {
            const _0x48c99b= {
            };
            _0x48c99b["recursive"]=true, fsModule6["mkdirSync"](_0x484bc0, _0x48c99b);
          }
        }const _0x35c8af=((helperFunction423)((_0x2fb9f8)));
        try {
          const _0x297a4b= {
          };
          return _0x297a4b["encoding"]=encoding, _0x297a4b["mode"]=mode, fsModule6["writeFileSync"](_0x35c8af, _0x28d275, _0x297a4b), fsModule6["renameSync"](_0x35c8af, _0x2fb9f8), true;
        } catch(_0x12e77d) {
          {
            try {
              {
                if(fsModule6["existsSync"](_0x35c8af)) {
                  fsModule6["unlinkSync"](_0x35c8af);
                }
              }
            } catch {
            }throw _0x12e77d;
          }
        }
      }
    }function helperFunction438(_0x26edd9, _0x17a0b2, _0x4fc28a= {
    }) {
      
      function helperFunction436(_0x1e50b6, _0x27ffeb) {
        return helperFunction439(_0x27ffeb-43, _0x1e50b6);
      }function helperFunction437(_0x108b90, _0x2f00be) {
        return helperFunction439(_0x2f00be- -630, _0x108b90);
      }{
        const {
          indent:indent=2, ..._0x267e67
        }=_0x4fc28a, _0x5e849a=JSON["stringify"](_0x17a0b2, null, indent);
        return ((helperFunction434)((_0x26edd9), (_0x5e849a), (_0x267e67)));
      }
    }const _0x161bc1= {
    };
    function helperFunction439(_0x15aa25, _0x25d328) {
      return _0x3f8685(_0x15aa25- -639, _0x25d328);
    }function helperFunction440(_0x535ed, _0x5bff37) {
      return _0x3f8685(_0x5bff37- -1605, _0x535ed);
    }_0x161bc1["writeFileAtomic"]=helperFunction434, _0x161bc1["writeJsonAtomic"]=helperFunction438, _0x161bc1["getTempPath"]=helperFunction423, _0x1a8cee["exports"]=_0x161bc1;
  }
}), require_cache=__commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/cache.js'(_0x2893cc, _0x128e38) {
    'use strict';
    
    function helperFunction441(_0x2d86cc, _0x4187fc) {
      return _0x3f8685(_0x2d86cc- -1483, _0x4187fc);
    }var _0x35cb15=require('fs'), _0x8a4d3d=require("path"), {
      getStateDirPath:_0x473ce7
    }=require_state_dir(), {
      writeJsonAtomic:_0xd01fc8, writeFileAtomic:_0x319b64
    }=require_atomic_write(), _0x10c506="repo-map.json", _0x21da6b="repo-map.stale", _0x21e512="repo-intel.json";
    function helperFunction444(_0xa3e036) {
      
      function helperFunction442(_0x4834d6, _0x3416d2) {
        return helperFunction441(_0x3416d2-1669, _0x4834d6);
      }function helperFunction443(_0x392492, _0x4b6f07) {
        return helperFunction441(_0x392492-0x3f7, _0x4b6f07);
      }return pathModule6["join"](((_0x473ce7)((_0xa3e036))), _0x10c506);
    }function helperFunction447(_0x4df774) {
      function helperFunction445(_0x4f1c14, _0x5137f0) {
        return helperFunction480(_0x4f1c14, _0x5137f0- -70);
      }function helperFunction446(_0x1785ac, _0x37608d) {
        return helperFunction480(_0x37608d, _0x1785ac-0x2ac);
      }return pathModule6["join"](((_0x473ce7)((_0x4df774))), _0x21e512);
    }function helperFunction450(_0x186f9f) {
      
      function helperFunction448(_0x544978, _0x3ef37f) {
        return helperFunction441(_0x544978-0x1e8, _0x3ef37f);
      }function helperFunction449(_0x364ac9, _0x5d0162) {
        return helperFunction441(_0x364ac9-636, _0x5d0162);
      }return pathModule6["join"](((_0x473ce7)((_0x186f9f))), _0x21da6b);
    }function helperFunction453(_0x41e9f9) {
      function helperFunction451(_0x2bc09e, _0x381f56) {
        return helperFunction480(_0x381f56, _0x2bc09e-884);
      }function helperFunction452(_0x145326, _0x1c72ef) {
        return helperFunction480(_0x145326, _0x1c72ef- -490);
      }{
        const _0xe287ba=((_0x473ce7)((_0x41e9f9)));
        if(!fsModule7["existsSync"](_0xe287ba)) {
          const _0x304629= {
          };
          _0x304629["recursive"]=true, fsModule7["mkdirSync"](_0xe287ba, _0x304629);
        }return _0xe287ba;
      }
    }function helperFunction456(_0x25ac12) {
      
      function helperFunction454(_0x414f87, _0x43b3e5) {
        return helperFunction441(_0x43b3e5-0x204, _0x414f87);
      }function helperFunction455(_0x211c4a, _0x10d30a) {
        return helperFunction441(_0x10d30a-0x66c, _0x211c4a);
      }{
        const _0x565f58=((helperFunction444)((_0x25ac12)));
        if(!fsModule7["existsSync"](_0x565f58))return null;
        try {
          const _0x87020b=fsModule7["readFileSync"](_0x565f58, "utf8");
          return JSON["parse"](_0x87020b);
        } catch {
          returnnull;
        }
      }
    }function helperFunction460(_0x1a3c9f, _0x42f8c9) {
      function helperFunction457(_0x1b7e5f, _0x27cb2f) {
        return helperFunction480(_0x1b7e5f, _0x27cb2f-0x277);
      }
      function helperFunction459(_0x1bb655, _0x37ed9e) {
        return helperFunction480(_0x1bb655, _0x37ed9e- -281);
      }{
        ((helperFunction453)((_0x1a3c9f)));
        const _0x414e6b=((helperFunction444)((_0x1a3c9f))), _0x4095a5= {
          ..._0x42f8c9, 'updated':new Date()["toISOString"]()
        };
        _0xd01fc8(_0x414e6b, _0x4095a5), ((helperFunction469)((_0x1a3c9f)));
      }
    }function helperFunction463(_0x1477ec) {
      function helperFunction461(_0x7ef96f, _0x12de0a) {
        return helperFunction441(_0x7ef96f- -182, _0x12de0a);
      }function helperFunction462(_0x7c9751, _0x355be4) {
        return helperFunction441(_0x7c9751-0x1d4, _0x355be4);
      }return fsModule7["existsSync"](((helperFunction444)((_0x1477ec))));
    }function helperFunction466(_0x5b7aad) {
      function helperFunction464(_0x28c5bb, _0x721c4c) {
        return helperFunction441(_0x28c5bb-0x64e, _0x721c4c);
      }function helperFunction465(_0x1d5aef, _0xe40c96) {
        return helperFunction441(_0xe40c96-289, _0x1d5aef);
      }((helperFunction453)((_0x5b7aad))), _0x319b64(((helperFunction450)((_0x5b7aad))), new Date()["toISOString"]());
    }function helperFunction469(_0x112118) {
      function helperFunction467(_0x172faf, _0x1e4435) {
        return helperFunction480(_0x172faf, _0x1e4435-0x222);
      }function helperFunction468(_0x266be6, _0x586bb6) {
        return helperFunction480(_0x266be6, _0x586bb6-0xca);
      }{
        const _0x23c72e=((helperFunction450)((_0x112118)));
        fsModule7["existsSync"](_0x23c72e)&&fsModule7["unlinkSync"](_0x23c72e);
      }
    }function helperFunction474(_0x5dab83) {
      
      function helperFunction472(_0x376b22, _0x2e54b8) {
        return helperFunction480(_0x376b22, _0x2e54b8-0x234);
      }function helperFunction473(_0x41185f, _0x5780d9) {
        return helperFunction480(_0x5780d9, _0x41185f-0x2ae);
      }return fsModule7["existsSync"](((helperFunction450)((_0x5dab83))));
    }function helperFunction479(_0x2e6a5b) {
      
      function helperFunction477(_0x1db7fd, _0x33375a) {
        return helperFunction441(_0x33375a- -295, _0x1db7fd);
      }function helperFunction478(_0x216392, _0x10bfe3) {
        return helperFunction441(_0x216392-0x239, _0x10bfe3);
      }{
        const _0x4a379d=helperFunction456(_0x2e6a5b);
        if(!_0x4a379d)return null;
        return {
          'generated':_0x4a379d["generated"], 'updated':_0x4a379d["updated"], 'commit':_0x4a379d["git"]?.["commit"], 'branch':_0x4a379d["git"]?.["branch"], 'files':Object["keys"](_0x4a379d["files"]|| {
          })["length"], 'symbols':_0x4a379d["stats"]?.["totalSymbols"]||0, 'languages':_0x4a379d["project"]?.["languages"]||[]
        };
      }
    }const _0x47cdb5= {
    };
    _0x47cdb5["load"]=helperFunction456, _0x47cdb5["save"]=helperFunction460, _0x47cdb5["exists"]=helperFunction463;
    function helperFunction480(_0x687b2f, _0x3f0da6) {
      return _0x3f8685(_0x3f0da6- -820, _0x687b2f);
    }_0x47cdb5["getStatus"]=helperFunction479, _0x47cdb5["getMapPath"]=helperFunction444, _0x47cdb5["getPath"]=helperFunction447, _0x47cdb5["getStateDirPath"]=_0x473ce7, _0x47cdb5["markStale"]=helperFunction466, _0x47cdb5["clearStale"]=helperFunction469, _0x47cdb5["isMarkedStale"]=helperFunction474, _0x128e38["exports"]=_0x47cdb5;
  }
}), require_updater=__commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/updater.js'(_0xf4852e, _0x37b686) {
    'use strict';
    
    function helperFunction481(_0x3ab37c, _0x53b748) {
      return _0x543fdb(_0x53b748, _0x3ab37c- -1273);
    }var {
      execFileSync:_0x3daa9e
    }=require("child_process"), cacheModule=require_cache();
    function helperFunction488(_0x174560, _0x5d01d8) {
      
      function helperFunction482(_0x56e460, _0x40f47f) {
        return helperFunction481(_0x40f47f-0x1a5, _0x56e460);
      }function helperFunction483(_0x27957a, _0x40c0e9) {
        return helperFunction481(_0x40c0e9- -550, _0x27957a);
      }
      {
        const _0x5ad37a= {
        };
        _0x5ad37a["isStale"]=false, _0x5ad37a["reason"]=null, _0x5ad37a["commitsBehind"]=0x0, _0x5ad37a["suggestFullRebuild"]=false;
        const _0xc7fee4=_0x5ad37a;
        if(!_0x5d01d8?.["git"]?.["commit"])return _0xc7fee4["isStale"]=true, _0xc7fee4["reason"]="Missing base commit in repo-map", _0xc7fee4["suggestFullRebuild"]=true, _0xc7fee4;
        if(cacheModule["isMarkedStale"](_0x174560)) {
          _0xc7fee4["isStale"]=true, _0xc7fee4["reason"]="Marked stale by hook";
        }if(!((helperFunction496)((_0x174560), (_0x5d01d8["git"]["commit"])))) {
          return _0xc7fee4["isStale"]=true, _0xc7fee4["reason"]="Base commit no longer exists (rebased?)", _0xc7fee4["suggestFullRebuild"]=true, _0xc7fee4;
        }const _0x217757=helperFunction499(_0x174560);
        _0x217757&&_0x5d01d8["git"]["branch"]&&((_0x217757)!==(_0x5d01d8["git"]["branch"]))&&(_0xc7fee4["isStale"]=true, _0xc7fee4["reason"]="Branch changed from "+_0x5d01d8["git"]["branch"]+" to "+_0x217757, _0xc7fee4["suggestFullRebuild"]=true);
        const _0x2ca6c1=((helperFunction504)((_0x174560), (_0x5d01d8["git"]["commit"])));
        return ((_0x2ca6c1)>(0))&&(_0xc7fee4["isStale"]=true, _0xc7fee4["commitsBehind"]=_0x2ca6c1, false), _0xc7fee4;
      }
    }function helperFunction491(_0x2524f6) {
      
      function helperFunction489(_0x5a8f1a, _0x51c7ff) {
        return helperFunction481(_0x51c7ff-1018, _0x5a8f1a);
      }function helperFunction490(_0x2269a4, _0x489ec9) {
        return helperFunction481(_0x489ec9-0xf, _0x2269a4);
      }return ((typeof _0x2524f6)===("string"))&&/^[0-9a-fA-F]{4,40}$/["test"](_0x2524f6);
    }function helperFunction496(_0x26d74b, _0x512012) {
      
      function helperFunction494(_0x333b3e, _0x37c8b2) {
        return helperFunction481(_0x37c8b2- -213, _0x333b3e);
      }function helperFunction495(_0x418670, _0x153797) {
        return helperFunction481(_0x418670-0x3b3, _0x153797);
      }{
        if(!helperFunction491(_0x512012))returnfalse;
        try {
          return ((_0x3daa9e)(("git"), (["cat-file", '-e', _0x512012]), ({
            'cwd':_0x26d74b, 'stdio':["pipe", "pipe", "pipe"]
          }))), true;
        } catch {
          returnfalse;
        }
      }
    }function helperFunction499(_0x2ef13e) {
      function helperFunction497(_0x276516, _0x3a74d6) {
        return helperFunction505(_0x3a74d6-355, _0x276516);
      }function helperFunction498(_0x511c62, _0x4f495e) {
        return helperFunction505(_0x511c62-301, _0x4f495e);
      }try {
        return ((_0x3daa9e)(("git"), (["rev-parse", "--abbrev-ref", "HEAD"]), ({
          'cwd':_0x2ef13e, 'encoding':"utf8", 'stdio':["pipe", "pipe", "pipe"]
        })))["trim"]();
      } catch {
        return null;
      }
    }function helperFunction504(_0x216523, _0x4fa312) {
      
      function helperFunction500(_0x345653, _0x32652d) {
        return helperFunction505(_0x345653- -303, _0x32652d);
      }
      function helperFunction503(_0x3a8220, _0x5e16e8) {
        return helperFunction505(_0x3a8220- -739, _0x5e16e8);
      }{
        if(!((helperFunction491)((_0x4fa312))))return0;
        try {
          {
            const _0x2bd8af=((_0x3daa9e)(("git"), (["rev-list", _0x4fa312+"..HEAD", "--count"]), ({
              'cwd':_0x216523, 'encoding':"utf8", 'stdio':["pipe", "pipe", "pipe"]
            })))["trim"]();
            return ((Number)((_0x2bd8af)))||0;
          }
        } catch {
          return0;
        }
      }
    }function helperFunction505(_0x2b5faf, _0x21ffcb) {
      return _0x543fdb(_0x21ffcb, _0x2b5faf- -1028);
    }const _0x2c00bb= {
    };
    _0x2c00bb["checkStaleness"]=helperFunction488, _0x37b686["exports"]=_0x2c00bb;
  }
}), require_converter=__commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/converter.js'(_0x12c6b3, _0x14aeb1) {
    'use strict';
    
    var _0x872745=((require)(("path")));
    const _0x39085b= {
    };
    _0x39085b[".js"]="javascript", _0x39085b[".jsx"]="javascript";
    function helperFunction506(_0x341536, _0x3ca02a) {
      return _0x543fdb(_0x3ca02a, _0x341536-55);
    }_0x39085b[".mjs"]="javascript", _0x39085b[".cjs"]="javascript", _0x39085b[".ts"]="typescript", _0x39085b[".tsx"]="typescript", _0x39085b[".mts"]="typescript", _0x39085b[".cts"]="typescript", _0x39085b[".py"]="python", _0x39085b[".pyw"]="python", _0x39085b[".rs"]="rust", _0x39085b[".go"]='go', _0x39085b[".java"]="java";
    var _0x1e7ca5=_0x39085b, _0x27c465=new Set(["class", "struct", "interface", "enum", "impl"]), _0x2e2d6f=new Set(["trait", "type-alias"]), _0x1d3eb8=new Set(["method", "arrow", "closure"]), _0x511249=new Set(["constant", "variable", "const", "field", "property"]);
    function helperFunction509(_0x8cd2b9) {
      function helperFunction507(_0x5cfa0b, _0x22c2ce) {
        return helperFunction520(_0x22c2ce-63, _0x5cfa0b);
      }function helperFunction508(_0x5e693a, _0x379301) {
        return helperFunction520(_0x379301- -317, _0x5e693a);
      }return _0x1e7ca5[pathModule7["extname"](_0x8cd2b9)["toLowerCase"]()]||"unknown";
    }function helperFunction512(_0x287018) {
      function helperFunction510(_0x586cf8, _0x366602) {
        return helperFunction520(_0x366602- -329, _0x586cf8);
      }const _0x4a6649=new Set();
      for(const _0x97f1dc of _0x287018) {
        {
          const _0x3c3aa4=((helperFunction509)((_0x97f1dc)));
          if(((_0x3c3aa4)!==("unknown")))items21["add"](_0x3c3aa4);
        }
      }function helperFunction511(_0x6b0265, _0x45bec5) {
        return helperFunction520(_0x6b0265-113, _0x45bec5);
      }return Array["from"](items21);
    }function helperFunction515(_0x16bda8, _0x4affb4) {
      
      function helperFunction513(_0x5750a0, _0x59e082) {
        return helperFunction520(_0x5750a0- -271, _0x59e082);
      }function helperFunction514(_0xae0418, _0x1cce51) {
        return helperFunction520(_0x1cce51- -250, _0xae0418);
      }{
        const _0x43f1d1=new Set((_0x4affb4["exports"]||[])["map"](_0x34138e=>_0x34138e["name"])), _0x7cdcab=(_0x4affb4["exports"]||[])["map"](_0x16759b=>({
          'name':_0x16759b["name"], 'kind':_0x16759b["kind"], 'line':_0x16759b["line"]
        })), _0x4c5066=[], _0x59289d=[], _0x5ad908=[], _0x5589c9=[];
        for(const _0x20c91b of _0x4affb4["definitions"]||[]) {
          const _0x146961= {
            'name':_0x20c91b["name"], 'kind':_0x20c91b["kind"], 'line':_0x20c91b["line"], 'exported':items22["has"](_0x20c91b["name"])
          };
          if(((_0x20c91b["kind"])===("function"))||items19["has"](_0x20c91b["kind"])) {
            items23["push"](_0x146961);
          } else {
            if(items17["has"](_0x20c91b["kind"]))items24["push"](_0x146961);
            else {
              if(items18["has"](_0x20c91b["kind"]))items25["push"](_0x146961);
              else  items20["has"](_0x20c91b["kind"])?items26["push"](_0x146961):items26["push"](_0x146961);
            }
          }
        }const _0x94ff64=(_0x4affb4["imports"]||[])["map"](_0x4bf86d=>({
          'source':_0x4bf86d["from"], 'kind':"import", 'names':_0x4bf86d["names"]||[]
        })), _0x1d7461= {
        };
        return _0x1d7461["exports"]=_0x7cdcab, _0x1d7461["functions"]=items23, _0x1d7461["classes"]=items24, _0x1d7461["types"]=items25, _0x1d7461["constants"]=items26, {
          'language':((helperFunction509)((_0x16bda8))), 'symbols':_0x1d7461, 'imports':_0x94ff64
        };
      }
    }function helperFunction519(_0xfe0b71) {
      function helperFunction516(_0x52a22d, _0x1cd0ef) {
        return helperFunction506(_0x52a22d- -1618, _0x1cd0ef);
      }
      function helperFunction518(_0x2773d6, _0xf705b5) {
        return helperFunction506(_0x2773d6- -631, _0xf705b5);
      }{
        const _0x489f85= {
        };
        let _0x15145f=0, _0x38af3d=0;
        for(const[_0x3e3b58, _0x453455]of Object["entries"](_0xfe0b71["symbols"]|| {
        })) {
          {
            _0x489f85[_0x3e3b58]=((helperFunction515)((_0x3e3b58), (_0x453455)));
            const _0x17d517=_0x489f85[_0x3e3b58]["symbols"];
            _0x15145f+=((((symbols["functions"]["length"])+(symbols["classes"]["length"]))+(symbols["types"]["length"]))+(symbols["constants"]["length"])), _0x38af3d+=_0x489f85[_0x3e3b58]["imports"]["length"];
          }
        }return {
          'version':"2.0", 'generated':_0xfe0b71["generated"]||new Date()["toISOString"](), 'git':_0xfe0b71["git"]? {
            'commit':_0xfe0b71["git"]["analyzedUpTo"]
          }:undefined, 'project': {
            'languages':((helperFunction512)((Object["keys"](_0x489f85))))
          },
          'stats': {
            'totalFiles':Object["keys"](_0x489f85)["length"], 'totalSymbols':_0x15145f, 'totalImports':_0x38af3d, 'errors':[]
          },
          'files':_0x489f85
        };
      }
    }const _0x2a670f= {
    };
    _0x2a670f["convertIntelToRepoMap"]=helperFunction519, _0x2a670f["convertFile"]=helperFunction515;
    function helperFunction520(_0x4ab27b, _0x254e62) {
      return _0x543fdb(_0x254e62, _0x4ab27b- -645);
    }_0x2a670f["detectLanguage"]=helperFunction509, _0x14aeb1["exports"]=_0x2a670f;
  }
}), require_queries=__commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/queries.js'(_0x2577ab, _0x2c749a) {
    'use strict';
    
    var _0xd56cbd=((require)(('fs'))), _0x5ab9ea=require("path"), {
      getStateDir:_0x2b4795
    }=require_state_dir(), binaryModule2=require_binary(), _0x26d5cc=class extends Error {
      constructor(_0x55c9b8) {
        
        super("repo-intel map not found at "+_0x55c9b8+(". Run `agentsys repo-intel update` to generate it first."));
        function helperFunction521(_0xc06e77, _0x4d4394) {
          return helperFunction594(_0x4d4394, _0xc06e77- -742);
        }function helperFunction522(_0x17c035, _0x1fe557) {
          return helperFunction594(_0x17c035, _0x1fe557-0x24f);
        }this["name"]="RepoIntelMissingError", this["code"]="REPO_INTEL_MISSING", this["mapFile"]=_0x55c9b8;
      }
    },
    _0x27c861="repo-intel.json";
    function helperFunction525(_0x417fb7) {
      
      function helperFunction523(_0x343b87, _0x554f75) {
        return helperFunction594(_0x554f75, _0x343b87-1072);
      }const _0x45f473=((_0x2b4795)((_0x417fb7)));
      function helperFunction524(_0x48e462, _0x22029d) {
        return helperFunction594(_0x22029d, _0x48e462-0x42e);
      }return pathModule8["join"](_0x417fb7, _0x45f473, _0x27c861);
    }function helperFunction530(_0x49b819) {
      function helperFunction526(_0x42ef2c, _0x13f9cc) {
        return helperFunction594(_0x13f9cc, _0x42ef2c-0x37d);
      }const _0x2a6670= {
        'BoMEC':function(_0x5ca335, _0x251114) {
          function helperFunction527(_0x55262f, _0xbdafb1) {
            return _0x139e(_0xbdafb1- -779, _0x55262f);
          }return ((_0x5ca335)<(_0x251114));
        },
        'szRlO':function(_0x3b0626, _0x2ecb59) {
          function helperFunction528(_0x1b6020, _0x3c2c41) {
            return _0x139e(_0x1b6020-0x2eb, _0x3c2c41);
          }return ((_0x3b0626)>(_0x2ecb59));
        }
      };
      function helperFunction529(_0x2a04ab, _0x24e26b) {
        return helperFunction594(_0x2a04ab, _0x24e26b-0x6c);
      }if((false)) {
        const _0x449071=_0x163d14[_0x4bd062]||0, _0x3ae845=_0x1b9be3[_0x1ac1ae]||0;
        if(_0x2a6670["BoMEC"](_0x449071, _0x3ae845))return-1;
        if(_0x2a6670["szRlO"](_0x449071, _0x3ae845))return1;
      } else {
        const _0x7de15e=((helperFunction525)((_0x49b819)));
        if(!fsModule8["existsSync"](_0x7de15e))throw new _0x26d5cc(_0x7de15e);
        return _0x7de15e;
      }
    }function helperFunction533(_0x34ff14, _0x442e10, _0x396ea8) {
      const _0x124f74= {
      };
      _0x124f74["HUOKL"]="utf8", _0x124f74["RVDiR"]="pipe";
      function helperFunction531(_0x1b31dd, _0x244ad2) {
        return helperFunction594(_0x1b31dd, _0x244ad2- -592);
      }_0x124f74["FQrOj"]="inherit", _0x124f74["GhMOS"]="missing-section", _0x124f74["fehIm"]="README.md", _0x124f74["qbmJL"]="Installation", _0x124f74["iUIit"]="medium";
      
      function helperFunction532(_0x51d236, _0x2d0da5) {
        return helperFunction594(_0x2d0da5, _0x51d236-0x2c8);
      }{
        const _0x57ccb8=helperFunction530(_0x396ea8), _0x3bad02=["repo-intel", "query", _0x34ff14, ..._0x442e10, "--map-file", _0x57ccb8, _0x396ea8];
        let _0x50110b;
        try {
          _0x50110b=binaryModule2["runAnalyzer"](items27);
        } catch(_0x3aee03) {
          throw new Error("repo-intel query failed ["+_0x34ff14+"]: "+_0x3aee03["message"], {
            'cause':_0x3aee03
          });
        }let _0x2a43cf;
        try {
          _0x2a43cf=JSON["parse"](_0x50110b);
        } catch(_0x5d3cb8) {
          {
            const _0x134b68=_0x50110b["slice"](0, 200);
            throw new Error("repo-intel query ["+_0x34ff14+("] returned non-JSON output: ")+_0x134b68);
          }
        }return _0x2a43cf;
      }
    }function helperFunction536(_0x1f2dfc, _0x1dbd9e) {
      function helperFunction534(_0x2ccc0f, _0x418522) {
        return helperFunction643(_0x2ccc0f, _0x418522-679);
      }function helperFunction535(_0x2871c8, _0x38edea) {
        return helperFunction643(_0x2871c8, _0x38edea-136);
      }if(((typeof _0x1f2dfc)!==("string"))||((_0x1f2dfc["length"])===(0)))throw new TypeError(_0x1dbd9e+(" must be a non-empty string"));
    }function helperFunction539(_0x56f961, _0x13d35b= {
    }) {
      
      function helperFunction537(_0x3d5a49, _0x5ca11f) {
        return helperFunction643(_0x5ca11f, _0x3d5a49-0x1cd);
      }function helperFunction538(_0x5e7865, _0x1136f3) {
        return helperFunction643(_0x5e7865, _0x1136f3-0x24e);
      }{
        const _0x18982a=[];
        if(((_0x13d35b["limit"])!=(null)))items28["push"]("--top", ((String)((_0x13d35b["limit"]))));
        return ((helperFunction533)(("hotspots"), (items28), (_0x56f961)));
      }
    }function helperFunction542(_0x431c2f, _0x96960a, _0x422dce= {
    }) {
      function helperFunction540(_0x362736, _0x363b24) {
        return helperFunction594(_0x362736, _0x363b24-0x244);
      }function helperFunction541(_0x568adc, _0x337c9e) {
        return helperFunction594(_0x337c9e, _0x568adc- -477);
      }{
        ((helperFunction536)((_0x96960a), ("coupling: file")));
        const _0x4cba07=[_0x96960a];
        if(((_0x422dce["limit"])!=(null)))items29["push"]("--top", String(_0x422dce["limit"]));
        return helperFunction533("coupling", items29, _0x431c2f);
      }
    }function helperFunction547(_0x56320c, _0x2e3480= {
    }) {
      
      function helperFunction545(_0x4f229e, _0x53f46f) {
        return helperFunction643(_0x53f46f, _0x4f229e-0x6d2);
      }function helperFunction546(_0x3977ec, _0x37cfc6) {
        return helperFunction643(_0x37cfc6, _0x3977ec-0x6df);
      }{
        const _0xd269d1=[];
        if(_0x2e3480["adjustForAi"])items30["push"]("--adjust-for-ai");
        if(((_0x2e3480["limit"])!=(null)))items30["push"]("--top", ((String)((_0x2e3480["limit"]))));
        return ((helperFunction533)(("bus-factor"), (items30), (_0x56320c)));
      }
    }function helperFunction550(_0x205a0b, _0x476104= {
    }) {
      function helperFunction548(_0x96a438, _0x1753fd) {
        return helperFunction594(_0x1753fd, _0x96a438-0x167);
      }const _0x400541=[];
      if(((_0x476104["limit"])!=(null)))items31["push"]("--top", ((String)((_0x476104["limit"]))));
      if(((_0x476104["minChanges"])!=(null)))items31["push"]("--min-changes", ((String)((_0x476104["minChanges"]))));
      function helperFunction549(_0x4c67ee, _0x34b065) {
        return helperFunction594(_0x4c67ee, _0x34b065- -40);
      }return ((helperFunction533)(("test-gaps"), (items31), (_0x205a0b)));
    }function helperFunction554(_0x4a3250, _0x16b53e) {
      function helperFunction551(_0x1bc1db, _0x10f261) {
        return helperFunction643(_0x1bc1db, _0x10f261-0xe6);
      }function helperFunction552(_0x152234, _0x3f9a6d) {
        return helperFunction643(_0x3f9a6d, _0x152234-0x480);
      }
      {
        if(!Array["isArray"](_0x16b53e)) {
          throw new TypeError("diffRisk: files must be an array of strings");
        }if(!_0x16b53e["every"](_0x5408d1=>typeof _0x5408d1==="string")) {
          throw new TypeError("diffRisk: all entries in files must be strings");
        }const _0x57344b=_0x16b53e["join"](',');
        if(((_0x57344b["length"])>(30000))) {
          throw new RangeError("diffRisk: files argument exceeds 30000 character limit (got "+_0x57344b["length"]+')');
        }const _0x360edc=["--files", _0x57344b];
        return ((helperFunction533)(("diff-risk"), (items32), (_0x4a3250)));
      }
    }function helperFunction558(_0x3fc73b, _0x49324e, _0x1e26e2) {
      
      function helperFunction555(_0x42deb4, _0x34c64d) {
        return helperFunction594(_0x34c64d, _0x42deb4- -525);
      }
      function helperFunction557(_0xdb1914, _0x28daf6) {
        return helperFunction594(_0xdb1914, _0x28daf6-0x3ef);
      }{
        ((helperFunction536)((_0x49324e), ("dependents: symbol")));
        const _0xf2282f=[_0x49324e];
        return ((_0x1e26e2)!=(null))&&(((helperFunction536)((_0x1e26e2), ("dependents: file"))), items33["push"]("--file", _0x1e26e2)), ((helperFunction533)(("dependents"), (items33), (_0x3fc73b)));
      }
    }function helperFunction561(_0x577835, _0x4463c2= {
    }) {
      const _0x408673=[];
      if(((_0x4463c2["limit"])!=(null)))items34["push"]("--top", ((String)((_0x4463c2["limit"]))));
      function helperFunction559(_0xd71994, _0xa4cff6) {
        return helperFunction643(_0xd71994, _0xa4cff6-0x45f);
      }function helperFunction560(_0x26c1c5, _0x3ae268) {
        return helperFunction643(_0x3ae268, _0x26c1c5-0x655);
      }return ((helperFunction533)(("bugspots"), (items34), (_0x577835)));
    }function helperFunction564(_0x2375dd) {
      function helperFunction562(_0x4af53d, _0x4188f4) {
        return helperFunction594(_0x4af53d, _0x4188f4-0x4b6);
      }function helperFunction563(_0x1761b8, _0x8052c2) {
        return helperFunction594(_0x8052c2, _0x1761b8-868);
      }return ((helperFunction533)(("health"), ([]), (_0x2375dd)));
    }function helperFunction567(_0x39b075) {
      const _0x15710c= {
      };
      _0x15710c["nPbOM"]="agent-analyzer is downloaded automatically on first use from https://github.com/agent-sh/agent-analyzer/releases";
      
      function helperFunction565(_0x319912, _0x2c3962) {
        return helperFunction594(_0x2c3962, _0x319912-0x1c6);
      }function helperFunction566(_0x6f4af2, _0x5f5d9d) {
        return helperFunction594(_0x6f4af2, _0x5f5d9d-0x168);
      }return (helperFunction533)(("communities"), ([]), (_0x39b075));
    }function helperFunction570(_0x34ec1d, _0x44211d= {
    }) {
      
      function helperFunction568(_0x20cf2d, _0x37106c) {
        return helperFunction643(_0x37106c, _0x20cf2d-677);
      }function helperFunction569(_0x19c73a, _0x4228c8) {
        return helperFunction643(_0x19c73a, _0x4228c8-0x300);
      }{
        const _0x250c41=[];
        if(((_0x44211d["limit"])!=(null)))items35["push"]("--top", ((String)((_0x44211d["limit"]))));
        return ((helperFunction533)(("boundaries"), (items35), (_0x34ec1d)));
      }
    }function helperFunction573(_0x5f20f1, _0x42d558) {
      
      function helperFunction571(_0x35ade1, _0x2d8ae8) {
        return helperFunction643(_0x35ade1, _0x2d8ae8-233);
      }function helperFunction572(_0x33fd52, _0x1dd71e) {
        return helperFunction643(_0x33fd52, _0x1dd71e-0x3ad);
      }return ((helperFunction536)((_0x42d558), ("areaOf: file"))), ((helperFunction533)(("area-of"), ([_0x42d558]), (_0x5f20f1)));
    }function helperFunction577(_0x5e81c1, _0x1134d1) {
      
      function helperFunction574(_0x1a2054, _0x33ab78) {
        return helperFunction643(_0x33ab78, _0x1a2054-0x1b1);
      }function helperFunction575(_0x57b037, _0x553de0) {
        return helperFunction643(_0x57b037, _0x553de0-0x573);
      }
      {
        if(((typeof _0x1134d1)!==("number"))||!Number["isInteger"](_0x1134d1)||((_0x1134d1)<(0)))throw new TypeError("communityHealth: id must be a non-negative integer");
        return ((helperFunction533)(("community-health"), ([((String)((_0x1134d1)))]), (_0x5e81c1)));
      }
    }function helperFunction580(_0x477e75, _0x3f1afd= {
    }) {
      
      function helperFunction578(_0x187ecf, _0x26ff39) {
        return helperFunction643(_0x187ecf, _0x26ff39-0xce);
      }function helperFunction579(_0x2b6262, _0x53361c) {
        return helperFunction643(_0x53361c, _0x2b6262-0x2d1);
      }{
        const _0x434c1e=[];
        if(((_0x3f1afd["limit"])!=(null)))items36["push"]("--top", ((String)((_0x3f1afd["limit"]))));
        return ((helperFunction533)(("coldspots"), (items36), (_0x477e75)));
      }
    }function helperFunction584(_0xc825e1, _0x4badba) {
      
      function helperFunction581(_0x5ba39a, _0x288a44) {
        return helperFunction594(_0x5ba39a, _0x288a44-496);
      }function helperFunction582(_0x13f0a0, _0x1f6c1f) {
        return helperFunction594(_0x13f0a0, _0x1f6c1f- -105);
      }
      return ((helperFunction536)((_0x4badba), ("ownership: file"))), ((helperFunction533)(("ownership"), ([_0x4badba]), (_0xc825e1)));
    }function helperFunction587(_0x1deeef) {
      
      function helperFunction585(_0x29092d, _0x3fdda0) {
        return helperFunction643(_0x29092d, _0x3fdda0-0xcd);
      }function helperFunction586(_0x4933c5, _0x30d4a8) {
        return helperFunction643(_0x30d4a8, _0x4933c5-0x4af);
      }return ((helperFunction533)(("norms"), ([]), (_0x1deeef)));
    }function helperFunction590(_0x1d4ea5) {
      
      function helperFunction588(_0x2b74be, _0x5ee467) {
        return helperFunction643(_0x2b74be, _0x5ee467-0x614);
      }function helperFunction589(_0xcc371b, _0x3eda2f) {
        return helperFunction643(_0xcc371b, _0x3eda2f-0x274);
      }return ((helperFunction533)(("areas"), ([]), (_0x1d4ea5)));
    }function helperFunction593(_0x31f2d1, _0x22a1ee= {
    }) {
      function helperFunction591(_0x2fde06, _0x31e152) {
        return helperFunction643(_0x2fde06, _0x31e152-0x496);
      }function helperFunction592(_0x796e3e, _0x36f7c0) {
        return helperFunction643(_0x36f7c0, _0x796e3e-0x2f2);
      }{
        const _0x51612f=[];
        if(((_0x22a1ee["limit"])!=(null)))items37["push"]("--top", ((String)((_0x22a1ee["limit"]))));
        return ((helperFunction533)(("contributors"), (items37), (_0x31f2d1)));
      }
    }function helperFunction594(_0x2b8562, _0x161145) {
      return _0x3f8685(_0x161145- -1009, _0x2b8562);
    }function helperFunction597(_0x3bf496) {
      function helperFunction595(_0x3a70b1, _0x16d82c) {
        return helperFunction594(_0x3a70b1, _0x16d82c-0x276);
      }function helperFunction596(_0x40d23b, _0x4cf290) {
        return helperFunction594(_0x4cf290, _0x40d23b-0x25);
      }return ((helperFunction533)(("release-info"), ([]), (_0x3bf496)));
    }function helperFunction600(_0x32a0c3, _0x36e5b8) {
      
      function helperFunction598(_0x5ceaa3, _0x4157ce) {
        return helperFunction643(_0x4157ce, _0x5ceaa3-0x4a3);
      }function helperFunction599(_0x352e02, _0x16d2d2) {
        return helperFunction643(_0x352e02, _0x16d2d2-0x2e0);
      }return ((helperFunction536)((_0x36e5b8), ("fileHistory: file"))), ((helperFunction533)(("file-history"), ([_0x36e5b8]), (_0x32a0c3)));
    }function helperFunction603(_0x42ee82) {
      
      function helperFunction601(_0x3743a6, _0x3ed2a6) {
        return helperFunction643(_0x3ed2a6, _0x3743a6-0x2bf);
      }function helperFunction602(_0x297e23, _0x247a4e) {
        return helperFunction643(_0x297e23, _0x247a4e-0x749);
      }return ((helperFunction533)(("conventions"), ([]), (_0x42ee82)));
    }function helperFunction606(_0x1789d6, _0x422498= {
    }) {
      const _0x16252e=[];
      function helperFunction604(_0x5688a0, _0x5de621) {
        return helperFunction643(_0x5688a0, _0x5de621-0x5dc);
      }function helperFunction605(_0x1a2d52, _0x39b2db) {
        return helperFunction643(_0x39b2db, _0x1a2d52-0x646);
      }if(((_0x422498["limit"])!=(null)))items38["push"]("--top", ((String)((_0x422498["limit"]))));
      return ((helperFunction533)(("doc-drift"), (items38), (_0x1789d6)));
    }function helperFunction609(_0x5d9696) {
      
      function helperFunction607(_0x4b9cd1, _0x5f514e) {
        return helperFunction643(_0x4b9cd1, _0x5f514e- -51);
      }function helperFunction608(_0x2ca7de, _0x212aca) {
        return helperFunction643(_0x2ca7de, _0x212aca-0x114);
      }return ((helperFunction533)(("onboard"), ([]), (_0x5d9696)));
    }function helperFunction612(_0x3aaf0f) {
      
      function helperFunction610(_0x1338e6, _0x4a7d05) {
        return helperFunction594(_0x1338e6, _0x4a7d05-0x38c);
      }const _0x587f7d= {
      };
      _0x587f7d["usqWr"]="missing", _0x587f7d["lHbPl"]="CHANGELOG.md", _0x587f7d["ZbjGQ"]="low";
      
      function helperFunction611(_0x381d8a, _0x3a2f36) {
        return helperFunction594(_0x3a2f36, _0x381d8a-0x4b);
      }return helperFunction533("can-i-help", [], _0x3aaf0f);
    }function helperFunction615(_0x24460f, _0x212ef8= {
    }) {
      function helperFunction613(_0x1d441f, _0x46935f) {
        return helperFunction594(_0x1d441f, _0x46935f-0x3bf);
      }const _0x236d4b=[];
      if(((_0x212ef8["limit"])!=(null)))items39["push"]("--top", ((String)((_0x212ef8["limit"]))));
      function helperFunction614(_0xdfbfbd, _0xe41177) {
        return helperFunction594(_0xdfbfbd, _0xe41177-739);
      }return ((helperFunction533)(("painspots"), (items39), (_0x24460f)));
    }function helperFunction618(_0x24f46d, _0x489e5c= {
    }) {
      const _0x252da5=[];
      function helperFunction616(_0x3990f6, _0x4f5d70) {
        return helperFunction594(_0x3990f6, _0x4f5d70-1027);
      }if(_0x489e5c["files"]) {
        const _0x1353bb=Array["isArray"](_0x489e5c["files"])?_0x489e5c["files"]["join"](','):((String)((_0x489e5c["files"])));
        items40["push"]("--files", _0x1353bb);
      }function helperFunction617(_0x1ca518, _0x47f3a3) {
        return helperFunction594(_0x47f3a3, _0x1ca518-0x33);
      }return ((helperFunction533)(("entry-points"), (items40), (_0x24f46d)));
    }function helperFunction621(_0x4f680a) {
      function helperFunction619(_0x4163da, _0x1a0d06) {
        return helperFunction594(_0x4163da, _0x1a0d06-0x2e0);
      }function helperFunction620(_0x42a3c3, _0x424fed) {
        return helperFunction594(_0x424fed, _0x42a3c3-1104);
      }return ((helperFunction533)(("project-info"), ([]), (_0x4f680a)));
    }function helperFunction624(_0x243dad, _0x2963c6) {
      ((helperFunction536)((_0x2963c6), ("symbols: file")));
      function helperFunction622(_0x1d2731, _0xa7662a) {
        return helperFunction643(_0xa7662a, _0x1d2731-0x72b);
      }function helperFunction623(_0x27f2e1, _0x7c35ec) {
        return helperFunction643(_0x7c35ec, _0x27f2e1-0xf2);
      }return ((helperFunction533)(("symbols"), ([_0x2963c6]), (_0x243dad)));
    }function helperFunction627(_0x48ee02, _0x539d64= {
    }) {
      
      function helperFunction625(_0x5a91af, _0x128ab6) {
        return helperFunction594(_0x5a91af, _0x128ab6-0x434);
      }const _0x37897f= {
      };
      _0x37897f["pOqdN"]="utf8";
      function helperFunction626(_0x4ed315, _0x1674de) {
        return helperFunction594(_0x1674de, _0x4ed315- -13);
      }
      {
        const _0x273132=[];
        if((_0x539d64["limit"]!=null))items41["push"]("--top", String(_0x539d64["limit"]));
        return ((helperFunction533)(("stale-docs"), (items41), (_0x48ee02)));
      }
    }function helperFunction630(_0x4f9573, _0x22862d, _0x1de48e= {
    }) {
      
      function helperFunction628(_0x21ff35, _0x50baa0) {
        return helperFunction643(_0x50baa0, _0x21ff35-0x4e6);
      }function helperFunction629(_0x4fb20c, _0x465036) {
        return helperFunction643(_0x4fb20c, _0x465036-0x27c);
      }{
        ((helperFunction536)((_0x22862d), ("find: query")));
        const _0x35fe51=[_0x22862d];
        if(((_0x1de48e["limit"])!=(null)))items42["push"]("--top", ((String)((_0x1de48e["limit"]))));
        return ((helperFunction533)(("find"), (items42), (_0x4f9573)));
      }
    }function helperFunction634(_0x3ce422) {
      
      function helperFunction631(_0x3c2215, _0x2edddd) {
        return helperFunction594(_0x2edddd, _0x3c2215-0x2b9);
      }
      function helperFunction633(_0x39785d, _0x2ae4ba) {
        return helperFunction594(_0x39785d, _0x2ae4ba-0x359);
      }return ((helperFunction533)(("slop-fixes"), ([]), (_0x3ce422)));
    }function helperFunction637(_0x5f3ab1, _0x5311be= {
    }) {
      function helperFunction635(_0x36840f, _0x4681cb) {
        return helperFunction594(_0x36840f, _0x4681cb-0x259);
      }const _0x412890=[];
      function helperFunction636(_0x4d20c0, _0x2b5953) {
        return helperFunction594(_0x2b5953, _0x4d20c0- -150);
      }if(((_0x5311be["top"])!=(null)))items43["push"]("--top", String(_0x5311be["top"]));
      return ((helperFunction533)(("slop-targets"), (items43), (_0x5f3ab1)));
    }function helperFunction642(_0x57dbca, _0x428bc8= {
    }) {
      
      function helperFunction638(_0x25f59a, _0x1b26ae) {
        return helperFunction643(_0x1b26ae, _0x25f59a-1379);
      }function helperFunction639(_0x48e042, _0x25284b) {
        return helperFunction643(_0x25284b, _0x48e042-1367);
      }
      {
        const _0x49104f=((helperFunction530)((_0x57dbca))), _0x3d08cd=[];
        if(((_0x428bc8["depth"])!=(null)))items44["push"]("--depth", ((String)((_0x428bc8["depth"]))));
        const _0x5aa134=["repo-intel", "query", "summary", ...items44, "--map-file", _0x49104f, _0x57dbca];
        let _0x3e45cc;
        try {
          _0x3e45cc=binaryModule2["runAnalyzer"](items45)["trim"]();
        } catch(_0x9396d) {
          throw new Error("repo-intel query failed [summary]: "+_0x9396d["message"], {
            'cause':_0x9396d
          });
        }if(((_0x3e45cc)===("null")))return null;
        if(((_0x428bc8["depth"])!=(null)))return _0x3e45cc;
        try {
          return JSON["parse"](_0x3e45cc);
        } catch(_0x5dd6cd) {
          throw new Error("repo-intel query [summary] returned non-JSON output: "+_0x3e45cc["slice"](0, 200));
        }
      }
    }const _0x54b640= {
    };
    _0x54b640["RepoIntelMissingError"]=_0x26d5cc, _0x54b640["hotspots"]=helperFunction539, _0x54b640["coupling"]=helperFunction542;
    function helperFunction643(_0x22fb95, _0x33e8d7) {
      return _0x3f8685(_0x33e8d7- -1724, _0x22fb95);
    }_0x54b640["busFactor"]=helperFunction547, _0x54b640["testGaps"]=helperFunction550, _0x54b640["diffRisk"]=helperFunction554, _0x54b640["dependents"]=helperFunction558, _0x54b640["bugspots"]=helperFunction561, _0x54b640["health"]=helperFunction564, _0x54b640["communities"]=helperFunction567, _0x54b640["boundaries"]=helperFunction570, _0x54b640["areaOf"]=helperFunction573, _0x54b640["communityHealth"]=helperFunction577, _0x54b640["coldspots"]=helperFunction580, _0x54b640["ownership"]=helperFunction584, _0x54b640["norms"]=helperFunction587, _0x54b640["areas"]=helperFunction590, _0x54b640["contributors"]=helperFunction593, _0x54b640["releaseInfo"]=helperFunction597, _0x54b640["fileHistory"]=helperFunction600, _0x54b640["conventions"]=helperFunction603, _0x54b640["docDrift"]=helperFunction606, _0x54b640["onboard"]=helperFunction609, _0x54b640["canIHelp"]=helperFunction612, _0x54b640["painspots"]=helperFunction615, _0x54b640["entryPoints"]=helperFunction618, _0x54b640["projectInfo"]=helperFunction621, _0x54b640["symbols"]=helperFunction624, _0x54b640["staleDocs"]=helperFunction627, _0x54b640["find"]=helperFunction630, _0x54b640["slopFixes"]=helperFunction634, _0x54b640["slopTargets"]=helperFunction637, _0x54b640["summary"]=helperFunction642, _0x2c749a["exports"]=_0x54b640;
  }
}), require_preference=__commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/embed/preference.js'(_0x139bc3, _0x2ecc86) {
    'use strict';
    
    var _0x20c0c7=((require)(('fs'))), _0x32a59c=require("path"), cacheModule2=require_cache(), _0x3331ac=["none", "small", "big"], _0x12070b=["compact", "balanced", "maximum"];
    function helperFunction646(_0x4cde51) {
      const _0x4fb38a= {
      };
      _0x4fb38a["phfKZ"]="missing", _0x4fb38a["mEglu"]="README.md";
      function helperFunction644(_0x325468, _0x229800) {
        return helperFunction650(_0x229800, _0x325468-467);
      }_0x4fb38a["ucycL"]="high";
      
      function helperFunction645(_0x3af738, _0x2e3a16) {
        return helperFunction650(_0x3af738, _0x2e3a16-0x78);
      }return pathModule9["join"](cacheModule2["getStateDirPath"](_0x4cde51), "sources", "preference.json");
    }function helperFunction649(_0x26eada) {
      function helperFunction647(_0x4fd272, _0x1c2b34) {
        return helperFunction650(_0x4fd272, _0x1c2b34-0x23b);
      }function helperFunction648(_0xfa6c4d, _0x26e57a) {
        return helperFunction650(_0x26e57a, _0xfa6c4d-0x654);
      }{
        const _0x365809=((helperFunction646)((_0x26eada)));
        if(!fsModule9["existsSync"](_0x365809))return {
        };
        try {
          const _0xead58=JSON["parse"](fsModule9["readFileSync"](_0x365809, "utf8"));
          return _0xead58&&((typeof _0xead58)===("object"))?_0xead58: {
          };
        } catch(_0x20805e) {
          return {
          };
        }
      }
    }function helperFunction650(_0xf601cb, _0x2d1085) {
      return _0x3f8685(_0x2d1085- -1446, _0xf601cb);
    }function helperFunction653(_0x42b0c1, _0x261933) {
      function helperFunction651(_0x560be4, _0x3ae9fa) {
        return helperFunction650(_0x560be4, _0x3ae9fa-13);
      }function helperFunction652(_0x2883d3, _0x5c9c3b) {
        return helperFunction650(_0x2883d3, _0x5c9c3b-1552);
      }{
        const _0x24da1c=((helperFunction649)((_0x42b0c1))), _0x1fa003=Object["assign"]({
        },
        _0x24da1c, ((_0x261933)||({
        }))), _0x4e2c11=((helperFunction646)((_0x42b0c1))), _0x153af6= {
        };
        return _0x153af6["recursive"]=true, fsModule9["mkdirSync"](pathModule9["dirname"](_0x4e2c11), _0x153af6), fsModule9["writeFileSync"](_0x4e2c11, JSON["stringify"](_0x1fa003, null, 2)), _0x1fa003;
      }
    }function helperFunction654(_0x4a2a64, _0x48d6f5) {
      return _0x3f8685(_0x48d6f5- -1233, _0x4a2a64);
    }function helperFunction657(_0x5db1ba) {
      const _0x4751e3=((helperFunction649)((_0x5db1ba)));
      delete _0x4751e3["embedder"], delete _0x4751e3["embedderDetail"];
      function helperFunction655(_0x2a1818, _0x16cf9d) {
        return helperFunction650(_0x2a1818, _0x16cf9d-0x51f);
      }const _0x2baf13=((helperFunction646)((_0x5db1ba))), _0x3dca69= {
      };
      _0x3dca69["recursive"]=true, fsModule9["mkdirSync"](pathModule9["dirname"](_0x2baf13), _0x3dca69);
      function helperFunction656(_0x430caf, _0x40787d) {
        return helperFunction650(_0x40787d, _0x430caf-1151);
      }fsModule9["writeFileSync"](_0x2baf13, JSON["stringify"](_0x4751e3, null, 2));
    }function helperFunction660(_0x83c518) {
      function helperFunction658(_0x3caf51, _0x4fb89a) {
        return helperFunction654(_0x4fb89a, _0x3caf51-0xbd);
      }function helperFunction659(_0x1c3bb6, _0x3d6a56) {
        return helperFunction654(_0x1c3bb6, _0x3d6a56-0x30);
      }{
        const _0x353623=helperFunction649(_0x83c518);
        return items46["includes"](_0x353623["embedder"]);
      }
    }function helperFunction665(_0x1ed776) {
      
      function helperFunction661(_0x3fa629, _0x42ca0c) {
        return helperFunction654(_0x3fa629, _0x42ca0c-761);
      }function helperFunction662(_0x312cd9, _0x361fd3) {
        return helperFunction654(_0x312cd9, _0x361fd3- -322);
      }
      {
        const _0x239a7b=((helperFunction649)((_0x1ed776)));
        return items47["includes"](_0x239a7b["embedderDetail"]);
      }
    }function helperFunction669(_0x5e0a80) {
      function helperFunction666(_0x338312, _0x58faa0) {
        return helperFunction654(_0x338312, _0x58faa0-0x234);
      }
      function helperFunction668(_0x4b6ce8, _0x30cfb6) {
        return helperFunction654(_0x4b6ce8, _0x30cfb6- -478);
      }switch(_0x5e0a80) {
        case "compact":return "compact";
        case "maximum":return "maximum";
        case "balanced":default:return "balanced";
      }
    }const _0x18dcf4= {
    };
    _0x18dcf4["read"]=helperFunction649, _0x18dcf4["update"]=helperFunction653, _0x18dcf4["reset"]=helperFunction657, _0x18dcf4["hasEmbedderChoice"]=helperFunction660, _0x18dcf4["hasDetailChoice"]=helperFunction665, _0x18dcf4["detailToCliArg"]=helperFunction669, _0x18dcf4["preferencePath"]=helperFunction646, _0x18dcf4["VALID_EMBEDDER"]=items46, _0x18dcf4["VALID_DETAIL"]=items47, _0x2ecc86["exports"]=_0x18dcf4;
  }
}), require_shared_helpers=__commonJS({
  '../work/agent-sh__agentsys/lib/binary/shared-helpers.js'(_0x55ac76, _0x24e277) {
    'use strict';
    
    var _0x510398=require('fs'), _0x151590=((require)(("path"))), _0x9d390e=((require)(('os'))), _0x2cf535=((require)(("https"))), _0x273a71=require("child_process");
    function helperFunction670(_0x5b425b, _0x45a417) {
      return _0x543fdb(_0x5b425b, _0x45a417- -1004);
    }var _0x3697b8=30000, _0x7087f2=5;
    function helperFunction727(_0x2cbc45, _0xa2c7a9) {
      const _0x2da290= {
        'uAFTY':"agent-sh/embed-resolver", 'GXfOb':function(_0x5397ac, _0x4e5ff5) {
          
          function helperFunction671(_0x47152f, _0xa09931) {
            return helperFunction683(_0xa09931, _0x47152f- -1368);
          }return ((_0x5397ac)+(_0x4e5ff5));
        },
        'BQrza':function(_0x18856e, _0x1852ca) {
          
          function helperFunction672(_0x33f349, _0x1445ca) {
            return helperFunction683(_0x1445ca, _0x33f349- -1097);
          }return ((_0x18856e)!==(_0x1852ca));
        },
        'iiAfn':"Extracted path escapes extract root: ", 'YUEQf':function(_0x12fe9d, _0x5b60f1) {
          
          function helperFunction673(_0x4bfd36, _0x461609) {
            return helperFunction683(_0x4bfd36, _0x461609-0x17);
          }return ((_0x12fe9d)===(_0x5b60f1));
        },
        'FHzvL':"WnHco", 'vsWAA':function(_0x36197, _0x23f00a) {
          
          function helperFunction674(_0x423074, _0x51f096) {
            return helperFunction682(_0x423074, _0x51f096- -894);
          }return ((_0x36197)!=(_0x23f00a));
        },
        'LtiId':"--top", 'oIAst':function(_0x25d0ef, _0x2369ec) {
          function helperFunction675(_0x22eb14, _0x3550d9) {
            return helperFunction682(_0x3550d9, _0x22eb14- -512);
          }return ((_0x25d0ef)((_0x2369ec)));
        },
        'WDAHW':function(_0x67b88c, _0x59770e, _0x3c40aa, _0x162026) {
          function helperFunction676(_0x1da186, _0x2f2745) {
            return helperFunction683(_0x1da186, _0x2f2745- -373);
          }return ((_0x67b88c)((_0x59770e), (_0x3c40aa), (_0x162026)));
        },
        'XUuUB':"bugspots", 'gklqa':"lCqpL", 'ythen':"hzOvP", 'FCeAR':function(_0x834550, _0x100d9d) {
          function helperFunction677(_0x30c61e, _0x1264f8) {
            return helperFunction683(_0x1264f8, _0x30c61e- -1550);
          }return ((_0x834550)((_0x100d9d)));
        },
        'uXeop':function(_0x469c95, _0x1a7d06, _0x43636f) {
          function helperFunction678(_0x4e1e4e, _0x386a51) {
            return helperFunction683(_0x4e1e4e, _0x386a51- -1145);
          }return ((_0x469c95)((_0x1a7d06), (_0x43636f)));
        },
        'IPUAe':"hNWMh", 'sAMIT':"IkNiB", 'SCfjS':function(_0x5ad5f6, _0x3b8a2c) {
          function helperFunction679(_0x1cfcbb, _0x513b9b) {
            return helperFunction682(_0x513b9b, _0x1cfcbb- -472);
          }return ((_0x5ad5f6)+(_0x3b8a2c));
        },
        'VSiHk':"Timeout (", 'zFQxD':"ms) fetching ", 'YzMgp':function(_0x23519e, _0x5de9a) {
          function helperFunction680(_0x503e42, _0x162f3d) {
            return helperFunction682(_0x503e42, _0x162f3d-393);
          }return ((_0x23519e)>(_0x5de9a));
        },
        'wccbL':"Too many redirects fetching from ", 'xnhjw':"application/octet-stream", 'IbZiJ':"Authorization", 'WkJgl':function(_0x3b696c, _0x4bdc53) {
          
          function helperFunction681(_0x66e01d, _0x531973) {
            return helperFunction683(_0x531973, _0x66e01d- -60);
          }return ((_0x3b696c)+(_0x4bdc53));
        },
        'xjfIt':"Bearer ", 'SgaRT':"error", 'NHkLf':"timeout"
      }, _0x1c8fc5=((_0xa2c7a9)||({
      }));
      function helperFunction682(_0x4f7be3, _0xf32641) {
        return helperFunction670(_0x4f7be3, _0xf32641-7);
      }const _0xe99fe7=_0x1c8fc5["userAgent"]||"agent-sh/binary-resolver", _0x4a3f7d=_0x1c8fc5["timeoutMs"]||_0x3697b8;
      function helperFunction683(_0x5d4a70, _0x2749e7) {
        return helperFunction670(_0x5d4a70, _0x2749e7-894);
      }return new Promise(function(_0xbcc8a4, _0x375621) {
        
        function helperFunction684(_0xd853b2, _0x9740a4) {
          return helperFunction683(_0x9740a4, _0xd853b2-0xb);
        }const _0x553523= {
          'MHFyK':function(_0x57f500) {
            function helperFunction685(_0xf5792d, _0x33ba40) {
              return _0x139e(_0xf5792d- -910, _0x33ba40);
            }return ((_0x57f500)());
          },
          'xGZZB':"applySummary requires {depth1, depth3, depth10, inputHash}", 'eYjgc':function(_0x1d76ae, _0x31abeb) {
            function helperFunction686(_0x58f6f4, _0x35a089) {
              return helperFunction684(_0x35a089- -1194, _0x58f6f4);
            }return ((_0x1d76ae)!==(_0x31abeb));
          },
          'wuffL':"JTLmT", 'yVAwf':function(_0x24cf84, _0x19cbca) {
            function helperFunction687(_0x557bec, _0x302bbb) {
              return helperFunction684(_0x302bbb- -1245, _0x557bec);
            }return ((_0x24cf84)===(_0x19cbca));
          },
          'DFUrh':function(_0x35a5ef, _0x1043df) {
            
            function helperFunction688(_0x3faed5, _0x40bab9) {
              return helperFunction684(_0x3faed5- -1327, _0x40bab9);
            }return ((_0x35a5ef)===(_0x1043df));
          },
          'vrrxO':"RONLV", 'SyviT':"nrybE", 'lhNtr':"https://", 'vlHex':function(_0x5eafcf, _0x2b0b3f) {
            
            function helperFunction689(_0x2e4f5f, _0x548040) {
              return helperFunction684(_0x2e4f5f- -1731, _0x548040);
            }return ((_0x5eafcf)===(_0x2b0b3f));
          },
          'LitkJ':"qNbkl", 'MHopt':"WAxmA", 'ehtpx':function(_0x4f24c4, _0x2ff9f1) {
            function helperFunction690(_0x3d0ba9, _0x3e0baf) {
              return helperFunction684(_0x3d0ba9-0xa2, _0x3e0baf);
            }return ((_0x4f24c4)((_0x2ff9f1)));
          },
          'NmnPD':function(_0x24170f, _0x5cfc7b) {
            function helperFunction691(_0x2444c1, _0x55e11d) {
              return helperFunction684(_0x55e11d- -1173, _0x2444c1);
            }return ((_0x24170f)+(_0x5cfc7b));
          },
          'LbDzT':"Refusing non-HTTPS redirect to ", 'JFmOc':function(_0x25ec34, _0x2f210a, _0x2829f9) {
            
            function helperFunction692(_0x39db24, _0x335545) {
              return helperFunction699(_0x335545, _0x39db24- -505);
            }return ((_0x25ec34)((_0x2f210a), (_0x2829f9)));
          },
          'ENGOS':function(_0x46dd8, _0x93d6dd) {
            function helperFunction693(_0x1d1dc1, _0x2529b8) {
              return helperFunction684(_0x2529b8- -1480, _0x1d1dc1);
            }return ((_0x46dd8)+(_0x93d6dd));
          },
          'ifWUK':function(_0x123d58, _0x114d59) {
            
            function helperFunction694(_0x7bd351, _0x57b3b0) {
              return helperFunction699(_0x7bd351, _0x57b3b0- -601);
            }return ((_0x123d58)===(_0x114d59));
          },
          'LIaxk':"ISGmn", 'oBDCi':"hBKvA", 'tHzwX':" (rate limited - set GITHUB_TOKEN env var)", 'niEhw':function(_0x265c91, _0xe3cbdd) {
            function helperFunction695(_0x30d0b4, _0x1d542a) {
              return helperFunction699(_0x30d0b4, _0x1d542a-0x119);
            }return ((_0x265c91)((_0xe3cbdd)));
          },
          'gofEp':function(_0x22ff0d, _0x1b442e) {
            function helperFunction696(_0x1a08bf, _0x6534b4) {
              return helperFunction699(_0x1a08bf, _0x6534b4-0x2f8);
            }return ((_0x22ff0d)+(_0x1b442e));
          },
          'mAEwW':function(_0x18f87e, _0x12fbfb) {
            function helperFunction697(_0x14014b, _0x1a460a) {
              return helperFunction699(_0x14014b, _0x1a460a- -150);
            }return ((_0x18f87e)+(_0x12fbfb));
          },
          'UKZiy':function(_0x1594f5, _0x5dbf58) {
            function helperFunction698(_0x173757, _0x29b4d7) {
              return helperFunction699(_0x29b4d7, _0x173757-0x11e);
            }return ((_0x1594f5)+(_0x5dbf58));
          },
          'fanxu':"HTTP ", 'gfzix':" fetching ", 'xndTJ':"data", 'fPujG':"end", 'myqMx':"error"
        },
        _0x163194=process.env.GITHUB_TOKEN||process.env.GH_TOKEN;
        function helperFunction699(_0x235a7d, _0x4f365b) {
          return helperFunction683(_0x235a7d, _0x4f365b- -798);
        }function helperFunction726(_0x43649c, _0x5cd584) {
          const _0x14e343= {
            'pYAxl':"agent-sh/embed-resolver", 'DIfYr':function(_0x2a3e4e, _0x1b15a9) {
              function helperFunction700(_0x2da5fc, _0xd21821) {
                return helperFunction712(_0x2da5fc, _0xd21821- -1101);
              }return _0x2da290["GXfOb"](_0x2a3e4e, _0x1b15a9);
            },
            'NyKgS':function(_0x35e531, _0x4e10e8) {
              function helperFunction701(_0x5e1633, _0xd226cc) {
                return helperFunction712(_0x5e1633, _0xd226cc-0x9b);
              }return _0x2da290["BQrza"](_0x35e531, _0x4e10e8);
            },
            'kjqpb':"Extracted path escapes extract root: ", 'XOgqU':function(_0x488339, _0x393112) {
              
              function helperFunction702(_0x3b2b25, _0x65eddf) {
                return helperFunction713(_0x3b2b25- -834, _0x65eddf);
              }return _0x2da290["YUEQf"](_0x488339, _0x393112);
            },
            'gwxWq':"WnHco", 'QwZQn':function(_0x1caae1, _0x16a978) {
              function helperFunction703(_0x5e8eed, _0x4f737b) {
                return helperFunction712(_0x4f737b, _0x5e8eed- -911);
              }return _0x2da290["vsWAA"](_0x1caae1, _0x16a978);
            },
            'fLFHU':"--top", 'DxtXn':function(_0x21763e, _0x17c827) {
              function helperFunction704(_0x5a1fd1, _0x7ecb7b) {
                return helperFunction712(_0x5a1fd1, _0x7ecb7b- -902);
              }return _0x2da290["oIAst"](_0x21763e, _0x17c827);
            },
            'VAMfb':function(_0x5a583a, _0x810663, _0x40aa38, _0x5904df) {
              function helperFunction705(_0x1ab616, _0x6b0cc6) {
                return helperFunction713(_0x6b0cc6-278, _0x1ab616);
              }return _0x2da290["WDAHW"](_0x5a583a, _0x810663, _0x40aa38, _0x5904df);
            },
            'lnRtM':"bugspots", 'cyfRH':function(_0x598dc6, _0xb48038) {
              
              function helperFunction706(_0x57954a, _0x43b305) {
                return helperFunction712(_0x57954a, _0x43b305- -88);
              }return _0x2da290["BQrza"](_0x598dc6, _0xb48038);
            },
            'nVMNS':"lCqpL", 'loHvZ':"hzOvP", 'syBSL':function(_0x42312b, _0x2e97bb) {
              function helperFunction707(_0x3752f8, _0x2c4b3f) {
                return helperFunction713(_0x2c4b3f-0x347, _0x3752f8);
              }return _0x2da290["FCeAR"](_0x42312b, _0x2e97bb);
            },
            'jqZNy':function(_0x22eaa6, _0x4148aa, _0x1008ca) {
              function helperFunction708(_0x350547, _0x296dec) {
                return helperFunction713(_0x350547- -65, _0x296dec);
              }return _0x2da290["uXeop"](_0x22eaa6, _0x4148aa, _0x1008ca);
            },
            'erjXz':function(_0x728da1, _0x3bd118, _0x2ec00e) {
              function helperFunction709(_0x3bdf82, _0x57135c) {
                return helperFunction712(_0x3bdf82, _0x57135c- -558);
              }return _0x2da290["uXeop"](_0x728da1, _0x3bd118, _0x2ec00e);
            },
            'iJuBZ':function(_0x200d34, _0x19cb8) {
              function helperFunction710(_0x37abdf, _0x101f1c) {
                return helperFunction713(_0x37abdf-0x28, _0x101f1c);
              }return _0x2da290["YUEQf"](_0x200d34, _0x19cb8);
            },
            'emaOy':"hNWMh", 'eEHBA':"IkNiB", 'MGFFz':function(_0x49c8c0, _0x2e9d4b) {
              function helperFunction711(_0x32742f, _0x4393c7) {
                return helperFunction712(_0x32742f, _0x4393c7- -111);
              }return _0x2da290["SCfjS"](_0x49c8c0, _0x2e9d4b);
            },
            'duFAM':"Timeout (", 'OUKTO':"ms) fetching "
          };
          if(_0x2da290["YzMgp"](_0x5cd584, _0x7087f2)) {
            _0x2da290["FCeAR"](_0x375621, new Error(_0x2da290["SCfjS"]("Too many redirects fetching from ", _0x2cbc45)));
            return;
          }function helperFunction712(_0x3c409e, _0x3c898c) {
            return helperFunction699(_0x3c409e, _0x3c898c-581);
          }const _0x5c2000= {
          };
          _0x5c2000["User-Agent"]=_0xe99fe7, _0x5c2000["Accept"]="application/octet-stream";
          function helperFunction713(_0x147e88, _0x5617dc) {
            return helperFunction699(_0x5617dc, _0x147e88-165);
          }const _0x4cd4d4=_0x5c2000;
          if(_0x163194)_0x4cd4d4["Authorization"]=_0x2da290["WkJgl"]("Bearer ", _0x163194);
          const _0x1c2faf= {
          };
          _0x1c2faf["headers"]=_0x4cd4d4, _0x1c2faf["timeout"]=_0x4a3f7d;
          const _0x27d95f=httpsModule2["get"](_0x43649c, _0x1c2faf, function(_0x2bb990) {
            
            function helperFunction714(_0x5b86a1, _0x4f1251) {
              return helperFunction713(_0x4f1251- -277, _0x5b86a1);
            }function helperFunction715(_0x29d019, _0x371c60) {
              return helperFunction713(_0x371c60- -281, _0x29d019);
            }const _0x48d15f= {
              'aFneA':function(_0xb42cd9) {
                function helperFunction716(_0x14b636, _0x4aa9fc) {
                  return _0x139e(_0x4aa9fc-0x3c0, _0x14b636);
                }return _0x553523["MHFyK"](_0xb42cd9);
              },
              'SXYMn':"applySummary requires {depth1, depth3, depth10, inputHash}"
            };
            if(_0x553523["eYjgc"]("JTLmT", "JTLmT")) {
              const _0x53d7a4= {
              };
              return _0x53d7a4["userAgent"]="agent-sh/embed-resolver", _0x9bba1d["downloadToBuffer"](_0x52dc95, _0x53d7a4);
            } else {
              const _0x21f4ae=_0x2bb990["statusCode"];
              if(_0x553523["yVAwf"](statusCode2, 301)||_0x553523["yVAwf"](statusCode2, 302)||_0x553523["yVAwf"](statusCode2, 307)||_0x553523["yVAwf"](statusCode2, 308)) {
                if(_0x553523["DFUrh"]("RONLV", "nrybE")) {
                  const _0x2d70a2=RnvYvZ["DIfYr"](_0x27a584["resolve"](_0xaa378c), _0x5bd3a7["sep"]), _0x1d6765=_0x25c13c["resolve"](_0x54edc2);
                  if(RnvYvZ["NyKgS"](_0x1d6765, _0x5e21f8["resolve"](_0x5246cd))&&!_0x1d6765["startsWith"](_0x2d70a2))throw new _0xb0ba92(RnvYvZ["DIfYr"](RnvYvZ["kjqpb"], _0x414ce3));
                } else {
                  _0x2bb990["resume"]();
                  var _0x35d3e7=_0x2bb990["headers"]["location"];
                  if(location&&!location["startsWith"]("https://")) {
                    if(_0x553523["vlHex"]("qNbkl", "WAxmA"))return {
                      'ok':true, 'data':_0x56ceb5["parse"](_0x4e433f)
                    };
                    else {
                      _0x553523["ehtpx"](_0x375621, new Error(_0x553523["NmnPD"]("Refusing non-HTTPS redirect to ", location)));
                      return;
                    }
                  }_0x553523["JFmOc"](helperFunction726, location, _0x553523["ENGOS"](_0x5cd584, 1));
                  return;
                }
              }if(_0x553523["eYjgc"](statusCode2, 200)) {
                if(_0x553523["ifWUK"]("ISGmn", "hBKvA"))return _0x37fa06["existsSync"](_0x48d15f["aFneA"](_0x15d575));
                else {
                  _0x2bb990["resume"]();
                  const _0x467e80=_0x553523["vlHex"](statusCode2, 403)?" (rate limited - set GITHUB_TOKEN env var)":'';
                  _0x553523["niEhw"](_0x375621, new Error(_0x553523["gofEp"](_0x553523["gofEp"](_0x553523["mAEwW"](_0x553523["UKZiy"]("HTTP ", statusCode2), _0x467e80), " fetching "), _0x43649c)));
                  return;
                }
              }const _0x45c582=[];
              _0x2bb990['on']("data", function(_0x1604f2) {
                
                function helperFunction717(_0x472448, _0x129d5b) {
                  return helperFunction714(_0x129d5b, _0x472448-503);
                }function helperFunction718(_0x4fef2f, _0xcee99a) {
                  return helperFunction714(_0xcee99a, _0x4fef2f-0x1ec);
                }if(_0x14e343["XOgqU"]("WnHco", "WnHco"))items48["push"](_0x1604f2);
                else  throw new _0x3203c7("applySummary requires {depth1, depth3, depth10, inputHash}");
              }), _0x2bb990['on']("end", function() {
                
                function helperFunction719(_0x461ee8, _0x24d23f) {
                  return helperFunction714(_0x24d23f, _0x461ee8- -110);
                }
                function helperFunction723(_0x34e6a8, _0x511cec) {
                  return helperFunction714(_0x34e6a8, _0x511cec-0x376);
                }if(_0x14e343["cyfRH"]("lCqpL", "hzOvP"))_0x14e343["syBSL"](_0xbcc8a4, Buffer["concat"](items48));
                else {
                  const _0x37e80f=[];
                  if(YHrxPV["pXhhk"](_0x242b8e["limit"], null))items49["push"](YHrxPV["yzVjT"], YHrxPV["zkugp"](_0x549a16, _0x2d59f3["limit"]));
                  return YHrxPV["egYop"](_0x1321d6, YHrxPV["DucPO"], items49, _0x1c5df0);
                }
              }), _0x2bb990['on']("error", _0x375621);
            }
          });
          _0x27d95f['on']("error", _0x375621), _0x27d95f['on']("timeout", function() {
            function helperFunction724(_0x130bf1, _0xe18e57) {
              return helperFunction712(_0x130bf1, _0xe18e57- -806);
            }function helperFunction725(_0x1e8a53, _0x494ed8) {
              return helperFunction712(_0x1e8a53, _0x494ed8- -1154);
            }if(_0x14e343["iJuBZ"]("hNWMh", "IkNiB")) {
              const _0x1681e9= {
                ..._0x10e977
              };
              _0x1681e9["structure"]=_0x380a29, RnvYvZ["jqZNy"](_0x46f692, _0x1681e9, _0xd79e6d), _0x19c52d["symbols"]=RnvYvZ["erjXz"](_0x53436f, _0x1e445c, _0x2061fa["topLevelDirs"]);
            } else  _0x27d95f["destroy"](), _0x14e343["DxtXn"](_0x375621, new Error(_0x14e343["DIfYr"](_0x14e343["MGFFz"](_0x14e343["MGFFz"]("Timeout (", _0x4a3f7d), "ms) fetching "), _0x43649c)));
          });
        }((helperFunction726)((_0x2cbc45), (0)));
      });
    }function helperFunction756(_0x5407dc, _0x2d9e46) {
      const _0xfee69e= {
        'WtqfK':function(_0x19b679, _0x38e45d, _0x5b9b52) {
          function helperFunction728(_0x524739, _0x4cf75e) {
            return _0x139e(_0x524739- -109, _0x4cf75e);
          }return ((_0x19b679)((_0x38e45d), (_0x5b9b52)));
        },
        'szfOR':"find: query", 'pmFgg':function(_0x4a4b5a, _0x73f7ae) {
          function helperFunction729(_0x140180, _0x242ef3) {
            return helperFunction741(_0x242ef3- -755, _0x140180);
          }return(_0x4a4b5a!=_0x73f7ae);
        },
        'TcbaA':"--top", 'LLuDW':function(_0x2fdfef, _0x390e5d) {
          function helperFunction730(_0x363cf6, _0x243eae) {
            return helperFunction741(_0x243eae- -1155, _0x363cf6);
          }return ((_0x2fdfef)((_0x390e5d)));
        },
        'dPKpX':function(_0x12d129, _0x489e4c, _0x1a4615, _0xb0378) {
          function helperFunction731(_0x19925d, _0xe7f139) {
            return helperFunction741(_0x19925d-312, _0xe7f139);
          }return ((_0x12d129)((_0x489e4c), (_0x1a4615), (_0xb0378)));
        },
        'aQCYF':"find", 'KLIIA':function(_0x231b47, _0x2dcd97) {
          
          function helperFunction732(_0x6953a7, _0x1366d5) {
            return helperFunction741(_0x6953a7-0x2b6, _0x1366d5);
          }return ((_0x231b47)!==(_0x2dcd97));
        },
        'CTVaD':function(_0x58f8c4, _0x2093b3) {
          function helperFunction733(_0x528a2d, _0x54226b) {
            return helperFunction742(_0x54226b, _0x528a2d-0xfd);
          }return ((_0x58f8c4)+(_0x2093b3));
        },
        'bNXWq':function(_0x3360da, _0x175465) {
          function helperFunction734(_0x195c9d, _0x436d23) {
            return helperFunction742(_0x436d23, _0x195c9d- -139);
          }return ((_0x3360da)+(_0x175465));
        },
        'hsUoW':function(_0x2001b7, _0x173056) {
          function helperFunction735(_0x2bd93e, _0x9098fe) {
            return helperFunction742(_0x2bd93e, _0x9098fe-0xcb);
          }return ((_0x2001b7)+(_0x173056));
        },
        'QNuWa':"tar extraction failed (code ", 'NarTh':"): ", 'csbln':function(_0x5f30ef) {
          
          function helperFunction736(_0x179fc1, _0x4370e8) {
            return helperFunction742(_0x179fc1, _0x4370e8- -590);
          }return ((_0x5f30ef)());
        },
        'NyaRg':function(_0x21e0df, _0x5d8f58) {
          
          function helperFunction737(_0x20f33f, _0x3085d7) {
            return helperFunction741(_0x3085d7-0x1a8, _0x20f33f);
          }return ((_0x21e0df)===(_0x5d8f58));
        },
        'tQkPv':"vgoWH", 'XVMcV':"NAnVI", 'CHmxl':"win32", 'iyRlm':"tar", 'Plzeg':"pipe", 'gxdbJ':"data", 'CaKJQ':"close", 'yEtYG':"error", 'mXvXS':"3|2|0|1|4", 'hlobz':"https://", 'gYZEN':function(_0x3b0c55, _0x1cef87) {
          function helperFunction738(_0x1b0b28, _0x14f6fb) {
            return helperFunction742(_0x1b0b28, _0x14f6fb- -404);
          }return ((_0x3b0c55)((_0x1cef87)));
        },
        'fxAAc':"Refusing non-HTTPS redirect to ", 'HstiP':function(_0x4466ce, _0x37aa81, _0x181632) {
          function helperFunction739(_0x1ed3c5, _0x753dcb) {
            return helperFunction741(_0x753dcb-0x1cb, _0x1ed3c5);
          }return ((_0x4466ce)((_0x37aa81), (_0x181632)));
        },
        'FDtDh':function(_0x438fa2, _0x3ff200) {
          function helperFunction740(_0x16caab, _0x5d74a5) {
            return helperFunction741(_0x16caab- -1024, _0x5d74a5);
          }return ((_0x438fa2)+(_0x3ff200));
        }
      };
      function helperFunction741(_0x4eae9e, _0x550374) {
        return helperFunction670(_0x550374, _0x4eae9e-0x11f);
      }function helperFunction742(_0x1f8d6c, _0x232ee5) {
        return helperFunction670(_0x1f8d6c, _0x232ee5- -138);
      }if((true))return new Promise(function(_0x1f9648, _0x35c4fa) {
        
        function helperFunction743(_0x505114, _0x5beeed) {
          return helperFunction741(_0x505114-0x177, _0x5beeed);
        }function helperFunction744(_0x4e93be, _0x35bda2) {
          return helperFunction741(_0x4e93be- -717, _0x35bda2);
        }const _0x4f262c= {
          'FoGtq':function(_0x368597, _0x1c0882, _0x2c3064) {
            
            function helperFunction745(_0x538de8, _0x228e01) {
              return _0x139e(_0x228e01- -57, _0x538de8);
            }return _0xfee69e["WtqfK"](_0x368597, _0x1c0882, _0x2c3064);
          },
          'MBpqp':"find: query", 'drOxQ':function(_0x9b8d20, _0x2ee781) {
            
            function helperFunction746(_0x1aae9c, _0x5d0d90) {
              return helperFunction743(_0x1aae9c- -1153, _0x5d0d90);
            }return _0xfee69e["pmFgg"](_0x9b8d20, _0x2ee781);
          },
          'PiGOn':"--top", 'dFEEF':function(_0x2c75b7, _0x35a3b3) {
            
            function helperFunction747(_0x9d640a, _0x28e7b8) {
              return helperFunction743(_0x9d640a- -318, _0x28e7b8);
            }return _0xfee69e["LLuDW"](_0x2c75b7, _0x35a3b3);
          },
          'owBZN':function(_0x3f22c4, _0x3dc806, _0x12eae7, _0x1a856e) {
            function helperFunction748(_0x18349b, _0x39e6a3) {
              return helperFunction744(_0x39e6a3-0x5e3, _0x18349b);
            }return _0xfee69e["dPKpX"](_0x3f22c4, _0x3dc806, _0x12eae7, _0x1a856e);
          },
          'bEkyr':"find", 'CVcaw':function(_0x7779d7, _0x3a3d60) {
            function helperFunction749(_0x166677, _0x57b7c6) {
              return helperFunction744(_0x57b7c6-1483, _0x166677);
            }return _0xfee69e["KLIIA"](_0x7779d7, _0x3a3d60);
          },
          'jSFfD':function(_0x47f63a, _0x420e1d) {
            function helperFunction750(_0x500381, _0xcc1949) {
              return helperFunction744(_0x500381- -101, _0xcc1949);
            }return _0xfee69e["CTVaD"](_0x47f63a, _0x420e1d);
          },
          'JzwXO':function(_0x44513a, _0x771c0) {
            function helperFunction751(_0x54c02b, _0xf898c5) {
              return helperFunction743(_0x54c02b-380, _0xf898c5);
            }return _0xfee69e["bNXWq"](_0x44513a, _0x771c0);
          },
          'DpmgI':function(_0x7c1a9, _0x279e3e) {
            
            function helperFunction752(_0x40ed3b, _0x486dc7) {
              return helperFunction743(_0x40ed3b- -375, _0x486dc7);
            }return _0xfee69e["hsUoW"](_0x7c1a9, _0x279e3e);
          },
          'MUOuH':"tar extraction failed (code ", 'OOrih':"): ", 'FVDCc':function(_0x304242) {
            function helperFunction753(_0x17f3ae, _0x6bad57) {
              return helperFunction743(_0x17f3ae- -1501, _0x6bad57);
            }return _0xfee69e["csbln"](_0x304242);
          }
        };
        if(_0xfee69e["NyaRg"]("vgoWH", "NAnVI")) {
          yQwjRs["FoGtq"](_0x1e5ab2, _0x2737bd, yQwjRs["MBpqp"]);
          const _0x1856fe=[_0x4caef1];
          if(yQwjRs["drOxQ"](_0x13a349["limit"], null))items50["push"](yQwjRs["PiGOn"], yQwjRs["dFEEF"](_0x111cca, _0x5e69fe["limit"]));
          return yQwjRs["owBZN"](_0x4a880d, yQwjRs["bEkyr"], items50, _0x220c0d);
        } else {
          const _0x2fd288=_0xfee69e["NyaRg"](process["platform"], "win32")?_0x2d9e46["replace"](/\\/g, '/'):_0x2d9e46, _0x219bd2=childProcessModule2["spawn"]("tar", ['xz', '-C', _0x2fd288], {
            'stdio':["pipe", "pipe", "pipe"]
          });
          let _0x1a9b63='';
          _0x219bd2["stderr"]['on']("data", function(_0x4087ed) {
            _0x1a9b63+=_0x4087ed;
          }), _0x219bd2["stdin"]["write"](_0x5407dc), _0x219bd2["stdin"]["end"](), _0x219bd2['on']("close", function(_0x2b65a2) {
            
            function helperFunction754(_0x425971, _0x787696) {
              return helperFunction744(_0x425971-0x1cc, _0x787696);
            }function helperFunction755(_0x353cac, _0x5afd0d) {
              return helperFunction744(_0x353cac-0x12c, _0x5afd0d);
            }_0x4f262c["CVcaw"](_0x2b65a2, 0)?_0x4f262c["dFEEF"](_0x35c4fa, new Error(_0x4f262c["jSFfD"](_0x4f262c["JzwXO"](_0x4f262c["DpmgI"]("tar extraction failed (code ", _0x2b65a2), "): "), _0x1a9b63))):_0x4f262c["FVDCc"](_0x1f9648);
          }), _0x219bd2['on']("error", _0x35c4fa);
        }
      });
      else {
        const _0x2ba24e="3|2|0|1|4"["split"]('|');
        let _0x57961f=0;
        while(true) {
          switch(_0x2ba24e[_0x57961f++]) {
            case '0':if(location2&&!location2["startsWith"](vjraCY["hlobz"])) {
              vjraCY["gYZEN"](_0x30f89, new _0x5d2a3e(vjraCY["hsUoW"](vjraCY["fxAAc"], location2)));
              return;
            }continue;
            case '1':vjraCY["HstiP"](_0x349c60, location2, vjraCY["FDtDh"](_0x3a9e4f, 1));
            continue;
            case '2':var _0x1f69f8=_0x6c0f6["headers"]["location"];
            continue;
            case '3':_0x4eba86["resume"]();
            continue;
            case '4':return;
          }break;
        }
      }
    }function helperFunction777(_0x46b009, _0x2c2c53, _0x40de3b) {
      
      function helperFunction757(_0x4cbc11, _0x411c44) {
        return helperFunction670(_0x4cbc11, _0x411c44-704);
      }const _0x1c08ac= {
        'dhQLq':function(_0x574306, _0x532b4c) {
          
          function helperFunction758(_0x184e48, _0x162411) {
            return _0x139e(_0x162411-0xd4, _0x184e48);
          }return(_0x574306===_0x532b4c);
        },
        'OyGIU':"dFYVP", 'Phsql':function(_0x378a64, _0x411573) {
          function helperFunction759(_0x1b7345, _0xeae76a) {
            return helperFunction768(_0x1b7345- -555, _0xeae76a);
          }return ((_0x378a64)+(_0x411573));
        },
        'BahGQ':function(_0x957414, _0x4797a2) {
          
          function helperFunction760(_0x1e8479, _0x6f4f6e) {
            return helperFunction768(_0x6f4f6e- -366, _0x1e8479);
          }return ((_0x957414)+(_0x4797a2));
        },
        'IdArJ':function(_0x1b04c3, _0x545bd3) {
          
          function helperFunction761(_0x53f8d3, _0x1f8029) {
            return helperFunction768(_0x1f8029- -273, _0x53f8d3);
          }return ((_0x1b04c3)!==(_0x545bd3));
        },
        'fCUQf':"vGTyL", 'TVhOx':"SbofW", 'PPDnn':function(_0x123009, _0x1c2a9b) {
          function helperFunction762(_0x4ab998, _0x2c4f29) {
            return helperFunction768(_0x2c4f29- -213, _0x4ab998);
          }return ((_0x123009)!==(_0x1c2a9b));
        },
        'NwskA':function(_0x59706f, _0x38abf3) {
          function helperFunction763(_0x30e74e, _0x2cd088) {
            return helperFunction757(_0x30e74e, _0x2cd088- -1068);
          }return ((_0x59706f)!==(_0x38abf3));
        },
        'KonOF':"RpDGB", 'hnQkU':function(_0x38691a, _0x20ab95) {
          function helperFunction764(_0x444550, _0x53254d) {
            return helperFunction757(_0x53254d, _0x444550-82);
          }return ((_0x38691a)((_0x20ab95)));
        },
        'vbUHX':function(_0x48ec52, _0x4bcd4b) {
          function helperFunction765(_0x5530d8, _0x57ffca) {
            return helperFunction757(_0x57ffca, _0x5530d8- -416);
          }return ((_0x48ec52)+(_0x4bcd4b));
        },
        'eLUxG':function(_0x3ac57f, _0x2693cb) {
          function helperFunction766(_0x33a2ba, _0x2cfb09) {
            return helperFunction768(_0x2cfb09-310, _0x33a2ba);
          }return ((_0x3ac57f)+(_0x2693cb));
        },
        'SGsqi':"zip extraction failed (code ", 'oEbhR':"): ", 'cdhph':function(_0x329695) {
          function helperFunction767(_0x1a2f46, _0x23c26d) {
            return helperFunction768(_0x23c26d-0x326, _0x1a2f46);
          }return ((_0x329695)());
        }
      };
      function helperFunction768(_0x4eb53a, _0x2c7a6f) {
        return helperFunction670(_0x2c7a6f, _0x4eb53a- -124);
      }return (false)?(_0x1e226f["isStale"]=true, _0x23cd91["reason"]=UrwlTN["xCwZc"], _0x45205a["suggestFullRebuild"]=true, _0xffe33e):new Promise(function(_0x464477, _0x3cd11f) {
        
        function helperFunction769(_0x16fe4e, _0x8dfbb2) {
          return helperFunction757(_0x16fe4e, _0x8dfbb2- -165);
        }function helperFunction770(_0xe1503f, _0x39c998) {
          return helperFunction757(_0x39c998, _0xe1503f- -244);
        }if((true)) {
          var _0x4e2cfa=fsModule10["mkdtempSync"](pathModule10["join"](osModule2["tmpdir"](), ((_0x40de3b)+('-')))), _0x163465=pathModule10["join"](_0x4e2cfa, "archive.zip");
          fsModule10["writeFileSync"](_0x163465, _0x46b009);
          var _0x3e3b96=childProcessModule2["spawn"]("powershell", ["-NoProfile", "-NonInteractive", "-Command", "Expand-Archive", "-Path", _0x163465, "-DestinationPath", _0x2c2c53, "-Force"], {
            'stdio':["ignore", "pipe", "pipe"]
          }), _0x54f919='';
          _0x3e3b96["stderr"]['on']("data", function(_0x2c2849) {
            function helperFunction771(_0xab6505, _0x70393f) {
              return helperFunction770(_0x70393f- -883, _0xab6505);
            }function helperFunction772(_0x52d6d0, _0x307af0) {
              return helperFunction770(_0x52d6d0- -568, _0x307af0);
            }if(_0x1c08ac["dhQLq"]("dFYVP", "dFYVP"))_0x54f919+=_0x2c2849;
            else  throw new _0x464045("diffRisk: files argument exceeds 30000 character limit (got "+_0x1b6d52["length"]+')');
          }), _0x3e3b96['on']("close", function(_0x295eaf) {
            
            function helperFunction775(_0x39ceff, _0x70687b) {
              return helperFunction770(_0x39ceff- -237, _0x70687b);
            }function helperFunction776(_0x25d4eb, _0x3d8c0c) {
              return helperFunction770(_0x3d8c0c-0x54, _0x25d4eb);
            }if(_0x1c08ac["IdArJ"]("vGTyL", "vGTyL")) {
              const _0x1c6211=koewSU["vSuXV"](koewSU["aKkPL"](_0x4fbfeb["platform"], '-'), _0x5db3e5["arch"]);
              return _0xaac8e2[_0x1c6211]||null;
            } else {
              try {
                if(_0x1c08ac["IdArJ"]("SbofW", "SbofW"))_0x1f7596["isStale"]=true, _0x2fb6b6["commitsBehind"]=_0x20f2cd, !_0xbb7291["reason"]&&(_0x239058["reason"]=_0x3c91d3+(" commits behind HEAD"));
                else {
                  const _0x107238= {
                  };
                  _0x107238["recursive"]=true, _0x107238["force"]=true, fsModule10["rmSync"](_0x4e2cfa, _0x107238);
                }
              } catch(_0x43eb62) {
              }_0x1c08ac["PPDnn"](_0x295eaf, 0)?_0x1c08ac["NwskA"]("RpDGB", "RpDGB")?_0x296dca["code"]=_0x2c42a6["scanCodebase"](_0x43acb8):_0x1c08ac["hnQkU"](_0x3cd11f, new Error(_0x1c08ac["vbUHX"](_0x1c08ac["BahGQ"](_0x1c08ac["eLUxG"]("zip extraction failed (code ", _0x295eaf), "): "), _0x54f919))):_0x1c08ac["cdhph"](_0x464477);
            }
          }), _0x3e3b96['on']("error", _0x3cd11f);
        } else  return[];
      });
    }const _0x1e4d8e= {
    };
    _0x1e4d8e["downloadToBuffer"]=helperFunction727;
    function helperFunction778(_0x57d776, _0x356b0a) {
      return _0x543fdb(_0x356b0a, _0x57d776- -1593);
    }_0x1e4d8e["extractTarGz"]=helperFunction756, _0x1e4d8e["extractZip"]=helperFunction777, _0x1e4d8e["DEFAULT_DOWNLOAD_TIMEOUT_MS"]=_0x3697b8, _0x24e277["exports"]=_0x1e4d8e;
  }
}), require_binary2=__commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/embed/binary.js'(_0x277958, _0x18b3b7) {
    'use strict';
    
    var _0x63669=require('fs'), _0x5c9331=require("path"), _0x4d3e4d=((require)(('os')));
    function helperFunction779(_0x407a4a, _0x4c0578) {
      return _0x543fdb(_0x4c0578, _0x407a4a- -391);
    }var _0x4a8997=require("https"), _0x18b7b7=((require)(("child_process"))), binaryModule3=require_binary(), shared_helpersModule=require_shared_helpers(), _0x24500f="agent-analyzer-embed", _0x467c85="agent-sh/agent-analyzer", _0x258112=(3600000), _0x548706=binaryModule3["PLATFORM_MAP"];
    function helperFunction782() {
      function helperFunction780(_0x29153d, _0x4e2105) {
        return helperFunction779(_0x4e2105- -435, _0x29153d);
      }const _0x2b7c67=((process["platform"])===("win32"))?".exe":'';
      function helperFunction781(_0x346a87, _0x511c49) {
        return helperFunction779(_0x511c49- -402, _0x346a87);
      }return pathModule11["join"](osModule3["homedir"](), ".agent-sh", "bin", ((_0x24500f)+(_0x2b7c67)));
    }function helperFunction785() {
      
      if(((process["platform"])===("win32")))return "onnxruntime.dll";
      function helperFunction783(_0x5192c9, _0x1336f7) {
        return helperFunction854(_0x5192c9-0x413, _0x1336f7);
      }if(((process["platform"])===("darwin")))return "libonnxruntime.dylib";
      function helperFunction784(_0x295347, _0x50f6f4) {
        return helperFunction854(_0x295347-0x2ee, _0x50f6f4);
      }return "libonnxruntime.so";
    }function helperFunction788() {
      function helperFunction786(_0x3a7fe6, _0x50352a) {
        return helperFunction854(_0x3a7fe6-0x310, _0x50352a);
      }function helperFunction787(_0x73f2fe, _0x476469) {
        return helperFunction854(_0x73f2fe-0x6d2, _0x476469);
      }return pathModule11["join"](pathModule11["dirname"](((helperFunction782)())), ((helperFunction785)()));
    }function helperFunction791() {
      const _0x1d914b=((helperFunction794)());
      function helperFunction789(_0x574256, _0x223b61) {
        return helperFunction779(_0x574256-0xd6, _0x223b61);
      }function helperFunction790(_0x459a9a, _0x303cd4) {
        return helperFunction779(_0x303cd4- -683, _0x459a9a);
      }return!!_0x1d914b&&!_0x1d914b["includes"]("musl");
    }function helperFunction794() {
      
      function helperFunction792(_0x39aa11, _0x5110a3) {
        return helperFunction779(_0x5110a3- -1251, _0x39aa11);
      }function helperFunction793(_0xffc0b3, _0x178a87) {
        return helperFunction779(_0x178a87- -754, _0xffc0b3);
      }{
        const _0x2dc181=(((process["platform"])+('-'))+(process["arch"]));
        return PLATFORM_MAP[_0x2dc181]||null;
      }
    }function helperFunction797() {
      function helperFunction795(_0xf239ca, _0x52f994) {
        return helperFunction854(_0xf239ca-1224, _0x52f994);
      }function helperFunction796(_0x5d8255, _0x1f04f8) {
        return helperFunction854(_0x1f04f8-0x42f, _0x5d8255);
      }{
        const _0x10023a=((helperFunction782)());
        if(!fsModule11["existsSync"](_0x10023a))return null;
        try {
          {
            const _0x5d9433=childProcessModule3["execFileSync"](_0x10023a, ["--version"], {
              'timeout':0x1388, 'encoding':"utf8", 'stdio':["pipe", "pipe", "pipe"], 'windowsHide':true
            }), _0x444872=_0x5d9433["trim"]()["match"](/(\d+\.\d+\.\d+)/);
            return _0x444872?_0x444872[1]:_0x5d9433["trim"]();
          }
        } catch(_0x43884d) {
          return null;
        }
      }
    }function helperFunction800() {
      function helperFunction798(_0x2c9d9b, _0x5ae3ce) {
        return helperFunction779(_0x2c9d9b- -292, _0x5ae3ce);
      }function helperFunction799(_0x1172f7, _0x1cfa54) {
        return helperFunction779(_0x1172f7- -148, _0x1cfa54);
      }return fsModule11["existsSync"](helperFunction782());
    }var _0x52f179=null;
    async function helperFunction839() {
      
      function helperFunction801(_0x40da5f, _0x1ce5c7) {
        return helperFunction779(_0x1ce5c7-0x17d, _0x40da5f);
      }const _0x3de5d4= {
        'arHXd':function(_0x4098b4, _0x2bbf00) {
          function helperFunction802(_0x1988b9, _0x153b49) {
            return _0x139e(_0x1988b9-0x335, _0x153b49);
          }return(_0x4098b4+_0x2bbf00);
        },
        'ohxqE':"Refusing to extract archive with UNC entry: ", 'wyZOY':function(_0x431007, _0x401903) {
          function helperFunction803(_0x7d8da2, _0x32b574) {
            return helperFunction801(_0x32b574, _0x7d8da2- -1812);
          }return ((_0x431007)/(_0x401903));
        },
        'HyWTC':function(_0x5f33d1, _0x5ab9ec) {
          
          function helperFunction804(_0x3f7c79, _0x97e3c7) {
            return helperFunction801(_0x97e3c7, _0x3f7c79- -1748);
          }return _0x5f33d1(_0x5ab9ec);
        },
        'LyDVs':"Timeout"
      };
      function helperFunction805(_0x1fdc23, _0x35546e) {
        return helperFunction779(_0x35546e-0x113, _0x1fdc23);
      }if((false)) {
        const _0x6f8c60=FFsQIs["AMqOG"](_0x47d9c7, {
        }), _0x5386fc=_0x6f8c60["version"]||_0x34dc4f, _0x1bd238=FFsQIs["ebCCH"](_0x45289b);
        if(_0x148371["existsSync"](_0x1bd238)) {
          const _0xaf636b=FFsQIs["KQmxD"](_0x3dd964);
          if(FFsQIs["snRzE"](_0x46d057, _0xaf636b, _0x4bbf0e))return _0x1bd238;
        }return FFsQIs["snRzE"](_0x42fba3, _0x5386fc, {
          'skipChecksum':FFsQIs["LKfAB"](_0x6f8c60["skipChecksum"], true), 'skipAttestation':FFsQIs["VRnnD"](_0x6f8c60["skipAttestation"], true), 'requireAttestation':_0x6f8c60["requireAttestation"], 'ghRunner':_0x6f8c60["ghRunner"], 'ghProbe':_0x6f8c60["ghProbe"]
        });
      } else {
        if(_0x52f179&&(((Date["now"]())-(_0x52f179["fetchedAt"]))<_0x258112)) {
          return _0x52f179["version"];
        }return new Promise(function(_0x1c533f, _0x4dafa8) {
          
          function helperFunction806(_0x25b4a9, _0x4550be) {
            return helperFunction801(_0x25b4a9, _0x4550be- -1061);
          }function helperFunction807(_0x50b0d2, _0x2ff82a) {
            return helperFunction801(_0x50b0d2, _0x2ff82a- -488);
          }const _0x50f9da= {
            'AmeQS':"No repo map found. Run init first.", 'EcgXQ':function(_0x2c153b, _0x490fcf) {
              function helperFunction808(_0x5c7dd6, _0x499d31) {
                return helperFunction806(_0x499d31, _0x5c7dd6-926);
              }return ((_0x2c153b)!==(_0x490fcf));
            },
            'lJgyP':"fcnKZ", 'IuvLq':"KZTPh", 'XAfnt':function(_0x55fe19, _0x37d405) {
              function helperFunction809(_0x43951c, _0xd00b35) {
                return helperFunction807(_0xd00b35, _0x43951c-457);
              }return ((_0x55fe19)((_0x37d405)));
            },
            'AmxKt':function(_0x3a3b37, _0x44faf6) {
              function helperFunction810(_0x238b01, _0x11cd9a) {
                return helperFunction806(_0x11cd9a, _0x238b01- -512);
              }return ((_0x3a3b37)+(_0x44faf6));
            },
            'wpQIy':function(_0x6d55ff, _0x28945a) {
              
              function helperFunction811(_0x5846c1, _0x1e333d) {
                return helperFunction806(_0x5846c1, _0x1e333d-0x411);
              }return ((_0x6d55ff)+(_0x28945a));
            },
            'mcfvc':" fetching ", 'OLXwL':"utf8", 'IGGEx':function(_0x1408b0, _0x335ce6, _0x16b5a7) {
              function helperFunction812(_0x1e9917, _0x332a2c) {
                return helperFunction807(_0x1e9917, _0x332a2c- -559);
              }return ((_0x1408b0)((_0x335ce6), (_0x16b5a7)));
            },
            'RlILw':function(_0x562fca, _0x486f98) {
              function helperFunction813(_0x5eedd1, _0xd17072) {
                return helperFunction806(_0xd17072, _0x5eedd1-1079);
              }return ((_0x562fca)+(_0x486f98));
            },
            'JqXYA':"ObsAA", 'PvNJF':"ZnxLT", 'ydnAV':function(_0x433a0f, _0x2f2fa7) {
              function helperFunction814(_0x108b87, _0x2ea7b2) {
                return helperFunction806(_0x108b87, _0x2ea7b2- -400);
              }return ((_0x433a0f)!==(_0x2f2fa7));
            },
            'XlHGL':"wRhgT", 'TlzXL':"TYJws", 'lOPTp':"GWLlz", 'saUnW':"pWjon", 'UxPHP':"No valid release tag", 'zwlTC':function(_0x33987a, _0x122a21) {
              function helperFunction815(_0xe073f7, _0x365b93) {
                return helperFunction807(_0xe073f7, _0x365b93- -1081);
              }return ((_0x33987a)===(_0x122a21));
            },
            'ZmaTG':"ZtnmA", 'dEIbf':"eVWcD", 'Shfya':function(_0x414684, _0x5f3bc7) {
              function helperFunction816(_0x39d603, _0x38222e) {
                return helperFunction806(_0x38222e, _0x39d603-0x3af);
              }return ((_0x414684)((_0x5f3bc7)));
            },
            'MQBFh':"Failed to parse release JSON: ", 'qAgKw':function(_0x211b47, _0x2e2ae5, _0x4121af) {
              function helperFunction817(_0x4b1c5a, _0xd429b5) {
                return helperFunction807(_0xd429b5, _0x4b1c5a- -1047);
              }return ((_0x211b47)((_0x2e2ae5), (_0x4121af)));
            },
            'aacgN':"Etdfo", 'pWiMm':"Repo map already exists. Use --force to rebuild or update to refresh.", 'KMINi':function(_0x545db3, _0x55555c) {
              
              function helperFunction818(_0x15d5a4, _0x1cdf5e) {
                return helperFunction806(_0x1cdf5e, _0x15d5a4- -794);
              }return ((_0x545db3)!==(_0x55555c));
            },
            'MrmAC':function(_0x19b866, _0x2f653f) {
              
              function helperFunction819(_0x5e6ac5, _0xa33a58) {
                return helperFunction806(_0x5e6ac5, _0xa33a58-0xa8);
              }return ((_0x19b866)===(_0x2f653f));
            },
            'aNQbt':"SZGDT", 'RfjqV':"zgfUg", 'pJjQg':function(_0x5d124a, _0x5273e5) {
              function helperFunction820(_0x14628d, _0x46cf05) {
                return helperFunction807(_0x14628d, _0x46cf05-0xf1);
              }return ((_0x5d124a)((_0x5273e5)));
            },
            'Hspfh':function(_0x45845e, _0x3321e1) {
              function helperFunction821(_0x483d88, _0x10ff06) {
                return helperFunction807(_0x483d88, _0x10ff06-0x16d);
              }return ((_0x45845e)+(_0x3321e1));
            },
            'bPFSp':"HTTP ", 'guJQj':"data", 'YGciV':"end", 'tflZX':"error"
          };
          if((false)) {
            const _0x4fe557=_0x106dc7["match"](/^##\s{1,1000}(.+)$/gm)||[], _0x4fc56c=_0x4fe557["slice"](0, 10)["map"](_0x122d9c=>_0x122d9c["replace"](/^##\s+/, '')), _0x1f362d=_0x4fc56c["map"](_0xc49be1=>_0xc49be1["toLowerCase"]())["join"]('\x20');
            return {
              'path':_0x348d33, 'sectionCount':_0x4fe557["length"], 'sections':_0x4fc56c, 'hasInstallation':/install|setup|getting.started/i["test"](_0x1f362d), 'hasUsage':/usage|how.to|example/i["test"](_0x1f362d), 'hasApi':/api|reference|methods/i["test"](_0x1f362d), 'hasTesting':/test|spec|coverage/i["test"](_0x1f362d), 'codeBlocks':_0x2b7592["floor"](QxhyWF["wyZOY"]((_0x2b70c4["match"](/```/g)||[])["length"], 2)), 'wordCount':_0x29708e["split"](/\s+/)["length"]
            };
          } else {
            const _0x8b8f76=process.env.GITHUB_TOKEN||process.env.GH_TOKEN, _0xf5cc8e= {
            };
            _0xf5cc8e["User-Agent"]="agent-sh/embed-resolver", _0xf5cc8e["Accept"]="application/vnd.github+json";
            const _0x1ec4f5=_0xf5cc8e;
            if(_0x8b8f76)_0x1ec4f5["Authorization"]=(("Bearer ")+(_0x8b8f76));
            const _0x5aae9a=((("https://api.github.com/repos/")+(_0x467c85))+("/releases/latest")), helperFunction824=function(_0x5d9d3c) {
              const _0x4d3508= {
              };
              function helperFunction822(_0x3d5955, _0x2a25df) {
                return helperFunction807(_0x3d5955, _0x2a25df-0x218);
              }function helperFunction823(_0x18d8e3, _0x18322b) {
                return helperFunction807(_0x18d8e3, _0x18322b- -367);
              }_0x4d3508["UEXph"]="No repo map found. Run init first.";
              const _0x36c8b3=_0x4d3508;
              if(_0x50f9da["EcgXQ"]("fcnKZ", "KZTPh"))_0x50f9da["XAfnt"](_0x4dafa8, new Error(_0x50f9da["AmxKt"](_0x50f9da["wpQIy"](_0x5d9d3c, " fetching "), _0x5aae9a)));
              else {
                const _0x3dce1f= {
                };
                return _0x3dce1f["success"]=false, _0x3dce1f["error"]=_0x36c8b3["UEXph"], _0x3dce1f;
              }
            },
            _0x3f6397= {
            };
            _0x3f6397["headers"]=_0x1ec4f5, _0x3f6397["timeout"]=0x1388;
            const _0x4afe02=httpsModule3["get"](_0x5aae9a, _0x3f6397, function(_0x2f8809) {
              const _0x5ad525= {
              };
              _0x5ad525["RmUMZ"]="Repo map already exists. Use --force to rebuild or update to refresh.";
              const _0x58697c=_0x5ad525;
              if(_0x50f9da["KMINi"](_0x2f8809["statusCode"], 200)) {
                if(_0x50f9da["MrmAC"]("SZGDT", "zgfUg"))return {
                  'success':false, 'error':_0x58697c["RmUMZ"], 'existing':_0x145eb1["getStatus"](_0x173ea9)
                };
                else {
                  _0x2f8809["resume"](), _0x50f9da["pJjQg"](helperFunction824, _0x50f9da["Hspfh"]("HTTP ", _0x2f8809["statusCode"]));
                  return;
                }
              }function helperFunction825(_0x2e729b, _0x617a42) {
                return helperFunction806(_0x617a42, _0x2e729b-0xe5);
              }const _0x433cd8=[];
              _0x2f8809['on']("data", function(_0x15b6e7) {
                function helperFunction826(_0x3e3a88, _0xc7069a) {
                  return helperFunction825(_0xc7069a- -118, _0x3e3a88);
                }items51["push"](_0x15b6e7);
              }), _0x2f8809['on']("end", function() {
                
                function helperFunction827(_0x34bbd8, _0x5b87db) {
                  return helperFunction825(_0x34bbd8-0xae, _0x5b87db);
                }const _0x4e9899= {
                  'LTtZz':"utf8", 'UIaWs':function(_0xb17e04, _0x2aa54b, _0xf7c24d) {
                    function helperFunction828(_0x13fe68, _0x18b88c) {
                      return helperFunction830(_0x18b88c- -671, _0x13fe68);
                    }return _0x50f9da["IGGEx"](_0xb17e04, _0x2aa54b, _0xf7c24d);
                  },
                  'nOzFo':function(_0x52b2d4, _0x449183) {
                    function helperFunction829(_0x4e97d1, _0x390d1e) {
                      return helperFunction830(_0x390d1e- -103, _0x4e97d1);
                    }return _0x50f9da["RlILw"](_0x52b2d4, _0x449183);
                  }
                };
                function helperFunction830(_0x1c33a0, _0x17da4a) {
                  return helperFunction825(_0x1c33a0- -183, _0x17da4a);
                }try {
                  if(_0x50f9da["EcgXQ"]("ObsAA", "ZnxLT")) {
                    const _0x287e00=JSON["parse"](Buffer["concat"](items51)["toString"]("utf8")), _0x3b908f=_0x287e00&&_0x287e00["tag_name"]||'', _0x4b3eac=_0x3b908f["replace"](/^v/, '');
                    /^\d+\.\d+\.\d+/["test"](_0x4b3eac)?_0x50f9da["ydnAV"]("wRhgT", "TYJws")?(_0x52f179= {
                      'version':_0x4b3eac, 'fetchedAt':Date["now"]()
                    },
                    _0x50f9da["XAfnt"](_0x1c533f, _0x4b3eac)):_0x191f18=_0x232332["files"][_0x294f89["slice"](2)]:_0x50f9da["ydnAV"]("GWLlz", "pWjon")?_0x50f9da["XAfnt"](helperFunction824, "No valid release tag"):_0x1e018f+=_0x2909ea["toString"]("utf8");
                  } else  return _0x4f5f81["exists"](_0xab34e6);
                } catch(_0x560a92) {
                  _0x50f9da["zwlTC"]("ZtnmA", "eVWcD")?!_0x4d7960["includes"](_0x303bfd["name"])&&!_0x4dab74["name"]["startsWith"]('.')&&_0x4e9899["UIaWs"](_0x274151, _0x175577, _0x4e9899["nOzFo"](_0x438657, 1)):_0x50f9da["Shfya"](helperFunction824, _0x50f9da["RlILw"]("Failed to parse release JSON: ", _0x560a92["message"]));
                }
              });
              function helperFunction831(_0x4a62ff, _0x2ea9b5) {
                return helperFunction806(_0x4a62ff, _0x2ea9b5- -1);
              }_0x2f8809['on']("error", function(_0x1ab942) {
                
                function helperFunction832(_0x5266f6, _0x25347d) {
                  return helperFunction825(_0x5266f6- -542, _0x25347d);
                }
                function helperFunction834(_0x3a23a8, _0x1d5209) {
                  return helperFunction825(_0x3a23a8- -782, _0x1d5209);
                }_0x50f9da["zwlTC"]("Etdfo", "Etdfo")?_0x50f9da["XAfnt"](helperFunction824, _0x1ab942["message"]):dGZDLE["NRXDI"](_0x551cad, _0x59efa8, _0x270687[_0x300f31]);
              });
            });
            _0x4afe02['on']("error", function(_0x2f844b) {
              function helperFunction835(_0x204fbd, _0x1b58fe) {
                return helperFunction807(_0x1b58fe, _0x204fbd-0x233);
              }function helperFunction836(_0x5aca10, _0x13f81c) {
                return helperFunction807(_0x13f81c, _0x5aca10-0x109);
              }_0x50f9da["Shfya"](helperFunction824, _0x2f844b["message"]);
            }), _0x4afe02['on']("timeout", function() {
              
              function helperFunction837(_0x334d92, _0x41b0de) {
                return helperFunction806(_0x334d92, _0x41b0de-221);
              }function helperFunction838(_0x6d6085, _0x4707eb) {
                return helperFunction806(_0x6d6085, _0x4707eb- -103);
              }_0x4afe02["destroy"](), _0x3de5d4["HyWTC"](helperFunction824, "Timeout");
            });
          }
        });
      }
    }function helperFunction843(_0x5c4781, _0x368e2c) {
      
      function helperFunction841(_0x1d113f, _0x4489ce) {
        return helperFunction779(_0x4489ce- -397, _0x1d113f);
      }function helperFunction842(_0x178a81, _0x22076d) {
        return helperFunction779(_0x178a81- -140, _0x22076d);
      }{
        const _0x4638a8=((process["platform"])===("win32"))?".zip":".tar.gz";
        return(((((((("https://github.com/")+(_0x467c85))+"/releases/download/v"+_0x5c4781)+('/'))+_0x24500f)+('-'))+(_0x368e2c))+_0x4638a8);
      }
    }function helperFunction846(_0x3bcd8e) {
      function helperFunction844(_0x1a3db1, _0x3a779d) {
        return helperFunction854(_0x3a779d-1432, _0x1a3db1);
      }const _0x32d7e7= {
      };
      _0x32d7e7["userAgent"]="agent-sh/embed-resolver";
      function helperFunction845(_0x49d82a, _0x55130c) {
        return helperFunction854(_0x55130c-1705, _0x49d82a);
      }return shared_helpersModule["downloadToBuffer"](_0x3bcd8e, _0x32d7e7);
    }var _0x29f05b=shared_helpersModule["extractTarGz"], _0x4fa8d5=shared_helpersModule["extractZip"];
    async function helperFunction850(_0x4977b8) {
      
      function helperFunction847(_0x49e27b, _0x3d23a9) {
        return helperFunction854(_0x3d23a9-0x2e3, _0x49e27b);
      }function helperFunction848(_0x413d66, _0x47e9e5) {
        return helperFunction854(_0x47e9e5-1183, _0x413d66);
      }
      {
        const _0x339261=((helperFunction794)());
        if(!_0x339261) {
          throw new Error((((((("Unsupported platform: ")+(process["platform"]))+('-'))+(process["arch"]))+(". Supported: "))+(Object["keys"](PLATFORM_MAP)["join"](',\x20'))));
        }const _0x2f57b3=((helperFunction843)((_0x4977b8), (_0x339261)));
        process["stderr"]["write"](((((((("Downloading ")+(_0x24500f))+('\x20v'))+(_0x4977b8))+(" for "))+(_0x339261))+("...\n")));
        const _0x3e1479=((helperFunction782)()), _0x3abc69=pathModule11["dirname"](_0x3e1479), _0x40fcc1= {
        };
        _0x40fcc1["recursive"]=true, fsModule11["mkdirSync"](_0x3abc69, _0x40fcc1);
        let _0x464853;
        try {
          _0x464853=await ((helperFunction846)((_0x2f57b3)));
        } catch(_0x1c8c84) {
          throw new Error((((((((((((("Failed to download ")+(_0x24500f))+(":\n  URL: "))+(_0x2f57b3))+("\n  Error: "))+(_0x1c8c84["message"]))+("\n\nTo install manually:\n  1. Download: "))+(_0x2f57b3))+("\n  2. Extract the binary to: "))+(_0x3abc69))+("\n  3. Ensure it is named: "))+(pathModule11["basename"](_0x3e1479))));
        }if(((process["platform"])===("win32")))await ((extractZip)((_0x464853), (_0x3abc69), (pathModule11["basename"](_0x3e1479))));
        else {
          await ((extractTarGz)((_0x464853), (_0x3abc69)));
        }return ((process["platform"])!==("win32"))&&fsModule11["chmodSync"](_0x3e1479, 493), _0x3e1479;
      }
    }async function helperFunction853(_0x19c2be) {
      const _0x3a39ef= {
      };
      function helperFunction851(_0x242989, _0x476648) {
        return helperFunction779(_0x242989- -619, _0x476648);
      }_0x3a39ef["lJgqH"]="React", _0x3a39ef["OXZez"]="Next.js", _0x3a39ef["bhCue"]="Vue.js", _0x3a39ef["tMHQL"]="Nuxt", _0x3a39ef["UgnmT"]="Angular", _0x3a39ef["GeSjr"]="Express", _0x3a39ef["NPaLv"]="Fastify", _0x3a39ef["kNiEv"]="Koa", _0x3a39ef["BlCqg"]="NestJS";
      
      function helperFunction852(_0x48edb5, _0x47c05d) {
        return helperFunction779(_0x48edb5- -818, _0x47c05d);
      }{
        const _0x1b4740=((_0x19c2be)||({
        })), _0x2c3f9c=((helperFunction782)());
        if(fsModule11["existsSync"](_0x2c3f9c)) {
          {
            if(((helperFunction791)())&&!fsModule11["existsSync"](helperFunction788())) {
              const _0x562c59=_0x1b4740["version"]||await ((helperFunction839)());
              return ((helperFunction850)((_0x562c59)));
            }return _0x2c3f9c;
          }
        }const _0x14ebda=_0x1b4740["version"]||await ((helperFunction839)());
        return helperFunction850(_0x14ebda);
      }
    }const _0x43f451= {
    };
    _0x43f451["EMBED_BINARY_NAME"]=_0x24500f, _0x43f451["getBinaryPath"]=helperFunction782, _0x43f451["getBundledOrtName"]=helperFunction785, _0x43f451["getBundledOrtPath"]=helperFunction788, _0x43f451["platformBundlesOrt"]=helperFunction791, _0x43f451["getVersion"]=helperFunction797;
    function helperFunction854(_0xc8320a, _0x2be4ae) {
      return _0x543fdb(_0x2be4ae, _0xc8320a- -1645);
    }_0x43f451["getPlatformKey"]=helperFunction794, _0x43f451["getLatestReleaseVersion"]=helperFunction839, _0x43f451["isAvailable"]=helperFunction800, _0x43f451["ensureBinary"]=helperFunction853, _0x43f451["buildDownloadUrl"]=helperFunction843, _0x18b3b7["exports"]=_0x43f451;
  }
}), require_orchestrator=__commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/embed/orchestrator.js'(_0x4a962e, _0x56175d) {
    'use strict';
    
    function helperFunction855(_0x66fc7a, _0x4f25c4) {
      return _0x543fdb(_0x66fc7a, _0x4f25c4- -1032);
    }function helperFunction856(_0x4237e1, _0x284978) {
      return _0x543fdb(_0x284978, _0x4237e1- -907);
    }var _0xc21e03=((require)(('fs'))), _0xa18f01=require("path"), _0x10a7ee=require("child_process"), preferenceModule=require_preference(), binary2Module=require_binary2(), binaryModule4=require_binary(), cacheModule3=require_cache();
    function helperFunction859(_0x7c2aae) {
      function helperFunction857(_0x3348eb, _0x17d3c0) {
        return helperFunction855(_0x17d3c0, _0x3348eb-0x8);
      }function helperFunction858(_0x3a961a, _0x5d7cbc) {
        return helperFunction855(_0x5d7cbc, _0x3a961a-0x39c);
      }{
        const _0x3ded34=preferenceModule["read"](_0x7c2aae);
        return ((_0x3ded34["embedder"])===("small"))||((_0x3ded34["embedder"])===("big"));
      }
    }async function helperFunction862(_0x225872) {
      
      function helperFunction860(_0x3d3e53, _0x1167f2) {
        return helperFunction856(_0x3d3e53-751, _0x1167f2);
      }function helperFunction861(_0x49f231, _0x5e3a41) {
        return helperFunction856(_0x5e3a41- -711, _0x49f231);
      }{
        if(!((helperFunction859)((_0x225872)))) {
          const _0x423a6b= {
          };
          return _0x423a6b["ran"]=false, _0x423a6b["reason"]="embedder preference is \"none\" or unset", _0x423a6b;
        }const _0x48f22f=preferenceModule["read"](_0x225872), _0x4905f9=preferenceModule["detailToCliArg"](_0x48f22f["embedderDetail"]||"balanced"), _0x4e098b=cacheModule3["getPath"](_0x225872);
        if(!fsModule12["existsSync"](_0x4e098b)) {
          {
            const _0x1104f0= {
            };
            return _0x1104f0["ran"]=false, _0x1104f0["reason"]="no repo-intel map found; run `/repo-intel init` first", _0x1104f0;
          }
        }const _0x29943a=Date["now"](), _0x16be72=await binary2Module["ensureBinary"](), _0x5484cc=await binaryModule4["ensureBinary"](), _0x1080b4=await ((helperFunction939)((_0x16be72), (["scan", _0x225872, "--variant", _0x48f22f["embedder"], "--detail", _0x4905f9]), (_0x5484cc), (_0x4e098b)));
        return Object["assign"]({
          'ran':true, 'durationMs':((Date["now"]())-(_0x29943a))
        },
        _0x1080b4);
      }
    }async function helperFunction865(_0x607b9d) {
      
      function helperFunction863(_0x26066c, _0xb5cf3b) {
        return helperFunction855(_0xb5cf3b, _0x26066c-0x2ab);
      }function helperFunction864(_0x223722, _0x2258f2) {
        return helperFunction855(_0x223722, _0x2258f2-0x297);
      }{
        if(!((helperFunction859)((_0x607b9d)))) {
          const _0x1c4a28= {
          };
          return _0x1c4a28["ran"]=false, _0x1c4a28["reason"]="embedder preference is \"none\" or unset", _0x1c4a28;
        }const _0x468533=preferenceModule["read"](_0x607b9d), _0x3f633c=preferenceModule["detailToCliArg"](_0x468533["embedderDetail"]||"balanced"), _0x2648f6=cacheModule3["getPath"](_0x607b9d);
        if(!fsModule12["existsSync"](_0x2648f6)) {
          {
            const _0x1190d5= {
            };
            return _0x1190d5["ran"]=false, _0x1190d5["reason"]="no repo-intel map; run `/repo-intel init` then `enrich`", _0x1190d5;
          }
        }const _0x1900e8=Date["now"](), _0x1637f6=await binary2Module["ensureBinary"](), _0x3073d0=await binaryModule4["ensureBinary"](), _0x22ef39=await ((helperFunction939)((_0x1637f6), (["update", _0x607b9d, "--map-file", _0x2648f6, "--variant", _0x468533["embedder"], "--detail", _0x3f633c]), (_0x3073d0), (_0x2648f6)));
        return Object["assign"]({
          'ran':true, 'durationMs':((Date["now"]())-(_0x1900e8))
        },
        _0x22ef39);
      }
    }function helperFunction868(_0x421d65) {
      const _0x2ceda3= {
      };
      _0x2ceda3["MMyxP"]="repo-intel-map-missing";
      function helperFunction866(_0x625521, _0x359774) {
        return helperFunction856(_0x625521-317, _0x359774);
      }
      function helperFunction867(_0xed10b9, _0x2caf23) {
        return helperFunction856(_0xed10b9- -161, _0x2caf23);
      }{
        const _0x55acf4=preferenceModule["read"](_0x421d65), _0x48a18f=cacheModule3["getPath"](_0x421d65), _0x4e7345=((helperFunction942)((_0x48a18f)));
        return {
          'enabled':((helperFunction859)((_0x421d65))), 'embedder':_0x55acf4["embedder"], 'embedderDetail':_0x55acf4["embedderDetail"], 'binaryInstalled':binary2Module["isAvailable"](), 'ortBundled':!binary2Module["platformBundlesOrt"]()||fsModule12["existsSync"](binary2Module["getBundledOrtPath"]()), 'sidecarExists':fsModule12["existsSync"](_0x4e7345), 'sidecarPath':_0x4e7345
        };
      }
    }function helperFunction939(_0x17953f, _0x57460a, _0x21a3e1, _0x12d815) {
      const _0x2fb239= {
        'Mzypq':function(_0x56725d, _0x1c7bdc) {
          function helperFunction869(_0x175e79, _0x33459c) {
            return _0x139e(_0x33459c-0x399, _0x175e79);
          }return ((_0x56725d)!==(_0x1c7bdc));
        },
        'aaCwE':"onXLn", 'vndNN':"pASaf", 'dkyzr':"utf8", 'ecMST':function(_0x439bbc, _0x3b3b6c) {
          function helperFunction870(_0x312d79, _0x1f825d) {
            return helperFunction885(_0x1f825d-0xff, _0x312d79);
          }return ((_0x439bbc)((_0x3b3b6c)));
        },
        'xkpIP':function(_0x2b2a66) {
          function helperFunction871(_0x372615, _0x553d19) {
            return helperFunction886(_0x372615, _0x553d19-0x2e);
          }return ((_0x2b2a66)());
        },
        'eMzKx':"init-error", 'BGIVs':function(_0xf8ed6e, _0x3de506) {
          function helperFunction872(_0x298f73, _0x81fee9) {
            return helperFunction885(_0x81fee9- -324, _0x298f73);
          }return ((_0xf8ed6e)!=(_0x3de506));
        },
        'MtEcV':"--top", 'HFxuu':function(_0x25fac6, _0x588a9c) {
          function helperFunction873(_0x59d6dd, _0x1955f8) {
            return helperFunction885(_0x1955f8-1037, _0x59d6dd);
          }return ((_0x25fac6)((_0x588a9c)));
        },
        'YxgxN':function(_0x1cac8f, _0x251272, _0xfa9d4c, _0x50cd99) {
          function helperFunction874(_0x92a897, _0x2c7e33) {
            return helperFunction885(_0x92a897-0x27b, _0x2c7e33);
          }return ((_0x1cac8f)((_0x251272), (_0xfa9d4c), (_0x50cd99)));
        },
        'DyRVv':"stale-docs", 'BoKGe':function(_0x528e22, _0x1d8f26) {
          function helperFunction875(_0x238af6, _0xfd6966) {
            return helperFunction886(_0xfd6966, _0x238af6- -24);
          }return ((_0x528e22)===(_0x1d8f26));
        },
        'kDAMu':"epBzq", 'jQaIM':"AtYCG", 'cfumr':"raUrz", 'cQgCt':function(_0xc5bbaa, _0x282db8) {
          function helperFunction876(_0x5ddaea, _0x7bfbc3) {
            return helperFunction885(_0x7bfbc3-0x4e2, _0x5ddaea);
          }return ((_0xc5bbaa)===(_0x282db8));
        },
        'DyxBb':"rhHie", 'JQNZk':"dpgvX", 'fMcDO':"SIGTERM", 'xtMGj':function(_0x1ff284, _0x4cf2f5) {
          function helperFunction877(_0x30e434, _0x770bbc) {
            return helperFunction886(_0x770bbc, _0x30e434- -899);
          }return ((_0x1ff284)!==(_0x4cf2f5));
        },
        'HpixJ':"LrySs", 'IhYtt':"ITwRW", 'PFNKB':function(_0xbc4e58, _0x37d331) {
          function helperFunction878(_0x1e60cf, _0x295ba5) {
            return helperFunction886(_0x1e60cf, _0x295ba5-0x198);
          }return ((_0xbc4e58)((_0x37d331)));
        },
        'NOcmJ':function(_0x5bf78c, _0x5df3ae) {
          function helperFunction879(_0x3217dc, _0x34c3ab) {
            return helperFunction886(_0x3217dc, _0x34c3ab-0x20e);
          }return ((_0x5bf78c)+(_0x5df3ae));
        },
        'HBLWG':"Refusing to extract archive with Windows absolute entry: ", 'wmklG':"MKDau", 'UOPfN':"FmaDz", 'WTVjQ':" exited ", 'WidMb':function(_0x22e761, _0xd6eb72) {
          
          function helperFunction880(_0x33003f, _0x45f524) {
            return helperFunction886(_0x33003f, _0x45f524- -309);
          }return(_0x22e761+_0xd6eb72);
        },
        'wcwUS':"agent-analyzer set-embeddings exited ", 'gNOVA':function(_0x41bfa3, _0x51cbdc, _0x1a8cad) {
          function helperFunction881(_0x524f78, _0x5f12c7) {
            return helperFunction886(_0x524f78, _0x5f12c7- -532);
          }return _0x41bfa3(_0x51cbdc, _0x1a8cad);
        },
        'VKmsg':"repo-intel", 'OTcEM':"init", 'Lnoxv':function(_0x124926, _0x5af477, _0x45e408) {
          
          function helperFunction882(_0x3a6979, _0xe4b06f) {
            return helperFunction886(_0xe4b06f, _0x3a6979-0x2f1);
          }return ((_0x124926)((_0x5af477), (_0x45e408)));
        },
        'FQxzW':"dependents: symbol", 'tQXSe':"dependents: file", 'hBKOH':"--file", 'PhQDZ':"dependents", 'QsXze':"GzACj", 'PUdyJ':"communityHealth: id must be a non-negative integer", 'TGLxc':"pNWli", 'vfwnY':"CGZYK", 'yZdOZ':function(_0x4454b3, _0x53ab40) {
          function helperFunction883(_0x59c9d2, _0x27427e) {
            return helperFunction886(_0x27427e, _0x59c9d2- -229);
          }return ((_0x4454b3)!==(_0x53ab40));
        },
        'XChSQ':"EPIPE", 'AiNHi':"KsmmP", 'SOoIg':function(_0x1fb95d, _0x33536d) {
          
          function helperFunction884(_0x46767e, _0x1b9177) {
            return helperFunction886(_0x46767e, _0x1b9177-0x54);
          }return ((_0x1fb95d)((_0x33536d)));
        },
        'TMpyz':"Jcmjt", 'orhJQ':"ignore", 'wrjnt':"pipe", 'VQEph':"set-embeddings", 'ERPYe':"--map-file", 'fknVg':"--input", 'wLOlM':"data", 'RrQUR':"error", 'XqErX':"close"
      };
      function helperFunction885(_0x2cf6b8, _0x40ee9b) {
        return helperFunction856(_0x2cf6b8- -448, _0x40ee9b);
      }function helperFunction886(_0x214df6, _0x549cc1) {
        return helperFunction856(_0x549cc1-0x31, _0x214df6);
      }return (true)?new Promise(function(_0x597c89, _0x3c8ba9) {
        
        function helperFunction887(_0x422911, _0x101ce7) {
          return helperFunction886(_0x422911, _0x101ce7- -823);
        }function helperFunction888(_0x31c2f4, _0x4227ba) {
          return helperFunction886(_0x4227ba, _0x31c2f4- -740);
        }const _0x57da2e= {
          'fCIDB':"init-error", 'uFMdt':function(_0x9afc53, _0x3a1dd4) {
            function helperFunction889(_0x9c886a, _0x906876) {
              return helperFunction888(_0x906876-0x19b, _0x9c886a);
            }return _0x2fb239["BGIVs"](_0x9afc53, _0x3a1dd4);
          },
          'ESDww':"--top", 'MKpoN':function(_0x30b857, _0x18b281) {
            function helperFunction890(_0x20b1cd, _0x593214) {
              return helperFunction887(_0x593214, _0x20b1cd-0xfe);
            }return _0x2fb239["HFxuu"](_0x30b857, _0x18b281);
          },
          'XKyeD':function(_0x10d138, _0x45db70, _0x37bcff, _0x144705) {
            
            function helperFunction891(_0x5c2e90, _0x3de06b) {
              return helperFunction887(_0x3de06b, _0x5c2e90-0x20e);
            }return _0x2fb239["YxgxN"](_0x10d138, _0x45db70, _0x37bcff, _0x144705);
          },
          'PiHSr':"stale-docs", 'BhuNu':function(_0x1858da, _0x307772) {
            function helperFunction892(_0x1b4c6, _0xca4e8f) {
              return helperFunction888(_0x1b4c6-1622, _0xca4e8f);
            }return _0x2fb239["BoKGe"](_0x1858da, _0x307772);
          },
          'taxTz':"epBzq", 'Zkykk':"AtYCG", 'IGwRd':"raUrz", 'OUgjA':function(_0x5998bc, _0x55a5c8) {
            function helperFunction893(_0x4e5618, _0x4c54bf) {
              return helperFunction887(_0x4e5618, _0x4c54bf-0x64c);
            }return _0x2fb239["cQgCt"](_0x5998bc, _0x55a5c8);
          },
          'FDDIF':"rhHie", 'mofVQ':"dpgvX", 'ZLZQg':"SIGTERM", 'wCbxJ':function(_0x2029fe, _0x5a51de) {
            function helperFunction894(_0x465c02, _0x7a042d) {
              return helperFunction887(_0x465c02, _0x7a042d- -45);
            }return _0x2fb239["xtMGj"](_0x2029fe, _0x5a51de);
          },
          'LqLto':"LrySs", 'QTMml':"ITwRW", 'BwKEa':function(_0x2ddafc, _0x189de2) {
            function helperFunction895(_0x5b43f1, _0x7a823f) {
              return helperFunction888(_0x5b43f1-0x1f0, _0x7a823f);
            }return _0x2fb239["ecMST"](_0x2ddafc, _0x189de2);
          },
          'AHOiC':function(_0x34c560, _0x1fe421) {
            function helperFunction896(_0x46c404, _0x66fc20) {
              return helperFunction888(_0x66fc20- -259, _0x46c404);
            }return _0x2fb239["PFNKB"](_0x34c560, _0x1fe421);
          },
          'FxuQL':function(_0x1af8a4, _0x5e6f57) {
            function helperFunction897(_0x460571, _0x2d6700) {
              return helperFunction888(_0x460571-1083, _0x2d6700);
            }return _0x2fb239["NOcmJ"](_0x1af8a4, _0x5e6f57);
          },
          'JgrhT':"Refusing to extract archive with Windows absolute entry: ", 'fGzCN':function(_0x2a47ec, _0x3f2390) {
            function helperFunction898(_0x83e3a0, _0x3ad506) {
              return helperFunction887(_0x3ad506, _0x83e3a0-0x1c5);
            }return _0x2fb239["cQgCt"](_0x2a47ec, _0x3f2390);
          },
          'pGSHv':"MKDau", 'bAEKv':"FmaDz", 'gGUAK':function(_0x318c38, _0x57669f) {
            function helperFunction899(_0x1344ab, _0x2f29ba) {
              return helperFunction887(_0x1344ab, _0x2f29ba-1655);
            }return _0x2fb239["PFNKB"](_0x318c38, _0x57669f);
          },
          'WKLik':function(_0x504cf3, _0x3b09e5) {
            function helperFunction900(_0x1feaed, _0xbd90f7) {
              return helperFunction887(_0xbd90f7, _0x1feaed-1489);
            }return _0x2fb239["NOcmJ"](_0x504cf3, _0x3b09e5);
          },
          'jxTuo':" exited ", 'otDzc':function(_0x369312, _0x5b7e37) {
            function helperFunction901(_0x5a4e95, _0x36d4a9) {
              return helperFunction887(_0x36d4a9, _0x5a4e95-0x26b);
            }return _0x2fb239["xtMGj"](_0x369312, _0x5b7e37);
          },
          'OyzjM':function(_0x487506, _0x417989) {
            function helperFunction902(_0x2bd1c6, _0x1c19b7) {
              return helperFunction887(_0x1c19b7, _0x2bd1c6-0x531);
            }return _0x2fb239["HFxuu"](_0x487506, _0x417989);
          },
          'ytqGr':function(_0x3a14ae, _0x2eac22) {
            function helperFunction903(_0x5cadd4, _0x4554b9) {
              return helperFunction888(_0x4554b9-516, _0x5cadd4);
            }return _0x2fb239["WidMb"](_0x3a14ae, _0x2eac22);
          },
          'uGQkK':function(_0x4d6cc1, _0x2f8a5d) {
            function helperFunction904(_0x5184e3, _0x2be733) {
              return helperFunction888(_0x2be733-0x389, _0x5184e3);
            }return _0x2fb239["WidMb"](_0x4d6cc1, _0x2f8a5d);
          },
          'NxdOu':"agent-analyzer set-embeddings exited ", 'uMTLL':function(_0x15301c, _0x5ef7e1, _0x407c37) {
            function helperFunction905(_0x2670e0, _0x2db8df) {
              return helperFunction887(_0x2db8df, _0x2670e0- -8);
            }return _0x2fb239["gNOVA"](_0x15301c, _0x5ef7e1, _0x407c37);
          },
          'vPTeX':function(_0x23fed1, _0x156bd0, _0x5e4b61) {
            
            function helperFunction906(_0x524365, _0x3a5da2) {
              return helperFunction887(_0x3a5da2, _0x524365-0x67);
            }return _0x2fb239["gNOVA"](_0x23fed1, _0x156bd0, _0x5e4b61);
          },
          'ZZlmT':"repo-intel", 'MYgRH':"init", 'CHlRM':"utf8", 'ycIQQ':function(_0x5997c4, _0x24d4a8, _0x2ac947) {
            function helperFunction907(_0x499c5a, _0x53b2d0) {
              return helperFunction887(_0x53b2d0, _0x499c5a- -166);
            }return _0x2fb239["Lnoxv"](_0x5997c4, _0x24d4a8, _0x2ac947);
          },
          'nELKC':"dependents: symbol", 'bmUAf':function(_0x332426, _0x2b9d2d) {
            function helperFunction908(_0xd0fd23, _0x4bec16) {
              return helperFunction888(_0xd0fd23-0x33e, _0x4bec16);
            }return _0x2fb239["BGIVs"](_0x332426, _0x2b9d2d);
          },
          'mYVUT':function(_0x18a275, _0x3cb25d, _0x4291ce) {
            function helperFunction909(_0x5ef268, _0xa53f73) {
              return helperFunction887(_0x5ef268, _0xa53f73-1710);
            }return _0x2fb239["gNOVA"](_0x18a275, _0x3cb25d, _0x4291ce);
          },
          'EQHNZ':"dependents: file", 'SOseE':"--file", 'sWpwy':"dependents", 'GKKED':"GzACj", 'klXuw':"communityHealth: id must be a non-negative integer", 'auWFf':"pNWli", 'enjou':"CGZYK", 'IWwfV':function(_0x330edf, _0x195cfa) {
            function helperFunction910(_0x43935c, _0x419825) {
              return helperFunction887(_0x419825, _0x43935c-972);
            }return _0x2fb239["yZdOZ"](_0x330edf, _0x195cfa);
          },
          'dAPMd':"EPIPE", 'HVFFm':"KsmmP", 'nYxvj':function(_0x17efd1) {
            function helperFunction911(_0x3927a9, _0x29e2c9) {
              return helperFunction888(_0x29e2c9-0x53f, _0x3927a9);
            }return _0x2fb239["xkpIP"](_0x17efd1);
          },
          'HtwMJ':function(_0x38a388, _0x4afd84) {
            
            function helperFunction912(_0x428157, _0x471d31) {
              return helperFunction887(_0x428157, _0x471d31-0x37e);
            }return _0x2fb239["SOoIg"](_0x38a388, _0x4afd84);
          }
        };
        if(_0x2fb239["cQgCt"]("Jcmjt", "Jcmjt")) {
          const _0x2182f4= {
          };
          _0x2182f4["stdio"]=["ignore", "pipe", "pipe"], _0x2182f4["windowsHide"]=true;
          const _0x2541a7=childProcessModule4["spawn"](_0x17953f, _0x57460a, _0x2182f4), _0x4b6095=childProcessModule4["spawn"](_0x21a3e1, ["repo-intel", "set-embeddings", "--map-file", _0x12d815, "--input", '-'], {
            'stdio':["pipe", "pipe", "pipe"], 'windowsHide':true
          });
          let _0x4f162f=null, _0x2468f0=null, _0xd43d4b=false, _0x24a0bd='', _0xdbbeca='', _0x20672e='';
          function helperFunction915(_0x27164b, _0x734cc2) {
            function helperFunction913(_0x3962ad, _0x38c452) {
              return helperFunction888(_0x3962ad- -209, _0x38c452);
            }function helperFunction914(_0x14382a, _0x58c5f0) {
              return helperFunction888(_0x14382a-0x21b, _0x58c5f0);
            }if(_0x57da2e["BhuNu"]("epBzq", "AtYCG")) {
              const _0x30e505= {
              };
              return _0x30e505["available"]=false, _0x30e505["map"]=null, _0x30e505["fallbackReason"]=_0x32f43f["message"]||"init-error", _0x30e505;
            } else {
              if(_0xd43d4b)return;
              _0xd43d4b=true;
              if(_0x27164b) {
                if(_0x57da2e["BhuNu"]("raUrz", "raUrz")) {
                  try {
                    if(_0x57da2e["OUgjA"]("rhHie", "dpgvX")) {
                      const _0x220d3b= {
                      };
                      _0x220d3b["recursive"]=true, _0x3b7141["mkdirSync"](_0x323e39, _0x220d3b);
                    } else  _0x2541a7["kill"]("SIGTERM");
                  } catch(_0x1b5934) {
                  }try {
                    if(_0x57da2e["wCbxJ"]("LrySs", "ITwRW"))_0x4b6095["kill"]("SIGTERM");
                    else {
                      const _0x300b6c=[];
                      if(qBLxWY["uFMdt"](_0x1f93e1["limit"], null))items52["push"](qBLxWY["ESDww"], qBLxWY["MKpoN"](_0x565a18, _0x3dd3c9["limit"]));
                      return qBLxWY["XKyeD"](_0x589f79, qBLxWY["PiHSr"], items52, _0x56e86e);
                    }
                  } catch(_0x154fcb) {
                  }_0x57da2e["BwKEa"](_0x3c8ba9, _0x27164b);
                } else  _0x2a5e4e["push"](_0x3b027c);
              } else  _0x57da2e["AHOiC"](_0x597c89, _0x734cc2);
            }
          }function helperFunction919() {
            
            function helperFunction916(_0x5c2e68, _0x256a06) {
              return helperFunction888(_0x256a06-697, _0x5c2e68);
            }
            if(_0xd43d4b||_0x57da2e["fGzCN"](_0x4f162f, null)||_0x57da2e["fGzCN"](_0x2468f0, null))return;
            if(_0x57da2e["wCbxJ"](_0x4f162f, 0)) {
              if(_0x57da2e["wCbxJ"]("MKDau", "FmaDz"))return _0x57da2e["gGUAK"](helperFunction915, new Error(_0x57da2e["WKLik"](_0x57da2e["FxuQL"](_0x57da2e["WKLik"](binary2Module["EMBED_BINARY_NAME"], " exited "), _0x4f162f), _0xdbbeca["trim"]()?_0x57da2e["WKLik"](':\x20', _0xdbbeca["trim"]()["slice"](0, 500)):'')));
              else  throw new _0x3fa2eb(MMxAYL["stTHS"](MMxAYL["zyMCW"], _0xedd541));
            }if(_0x57da2e["otDzc"](_0x2468f0, 0))return _0x57da2e["OyzjM"](helperFunction915, new Error(_0x57da2e["ytqGr"](_0x57da2e["uGQkK"]("agent-analyzer set-embeddings exited ", _0x2468f0), _0x20672e["trim"]()?_0x57da2e["WKLik"](':\x20', _0x20672e["trim"]()["slice"](0, 500)):'')));
            const _0x3015c6=_0x24a0bd["match"](/(\d+)\s+files?/);
            function helperFunction918(_0x43bceb, _0x1d5a92) {
              return helperFunction888(_0x1d5a92-0x186, _0x43bceb);
            }_0x57da2e["uMTLL"](helperFunction915, null, {
              'files':_0x3015c6?_0x57da2e["vPTeX"](parseInt, _0x3015c6[1], 10):undefined
            });
          }_0x2541a7["stderr"]['on']("data", function(_0x43b834) {
            
            function helperFunction920(_0x2821e2, _0x55e8c2) {
              return helperFunction888(_0x2821e2- -30, _0x55e8c2);
            }function helperFunction921(_0x283da9, _0x2abb82) {
              return helperFunction888(_0x283da9-0x22a, _0x2abb82);
            }if(_0x2fb239["Mzypq"]("onXLn", "pASaf"))_0xdbbeca+=_0x43b834["toString"]("utf8");
            else {
              const _0x3928ff=_0x408eec["runAnalyzer"](["repo-intel", "init", _0x2237eb]);
              _0x544740=_0x56dd41["parse"](_0x3928ff);
            }
          }), _0x4b6095["stderr"]['on']("data", function(_0x13608a) {
            
            function helperFunction922(_0x1c7226, _0x9b0121) {
              return helperFunction888(_0x9b0121-0x600, _0x1c7226);
            }function helperFunction923(_0x2a5934, _0x20d686) {
              return helperFunction888(_0x2a5934-0x175, _0x20d686);
            }_0x20672e+=_0x13608a["toString"]("utf8");
          }), _0x4b6095["stdout"]['on']("data", function(_0x2f7c5b) {
            
            function helperFunction924(_0x3f4c2a, _0x222081) {
              return helperFunction887(_0x3f4c2a, _0x222081-540);
            }function helperFunction925(_0x2cd838, _0x463e34) {
              return helperFunction887(_0x463e34, _0x2cd838-0x1be);
            }_0x24a0bd+=_0x2f7c5b["toString"]("utf8");
          }), _0x2541a7["stdout"]['on']("error", function(_0x2ff1b6) {
            
            function helperFunction930(_0x365694, _0x501c53) {
              return helperFunction887(_0x365694, _0x501c53-0x61e);
            }function helperFunction931(_0x413c0a, _0x1f096b) {
              return helperFunction887(_0x1f096b, _0x413c0a-0xf0);
            }if(_0x57da2e["fGzCN"]("GzACj", "GzACj"))_0x57da2e["AHOiC"](helperFunction915, _0x2ff1b6);
            else {
              RSptFr["TKgvG"](_0x3e4d27, _0x181781, RSptFr["GSLLM"]);
              const _0xc34853=[_0x4672e4];
              return RSptFr["pnqGF"](_0x48e434, null)&&(RSptFr["aZGWB"](_0x1ee31f, _0x52f674, RSptFr["PJnZA"]), items53["push"](RSptFr["yFNxu"], _0x277d27)), RSptFr["Lsdae"](_0x590402, RSptFr["qlqoc"], items53, _0xd7200);
            }
          }), _0x4b6095["stdin"]['on']("error", function(_0x3d41bf) {
            function helperFunction932(_0x50bf2a, _0x456790) {
              return helperFunction888(_0x50bf2a-0x231, _0x456790);
            }function helperFunction933(_0x2e65d8, _0x23034b) {
              return helperFunction888(_0x2e65d8-204, _0x23034b);
            }if(_0x57da2e["fGzCN"]("pNWli", "CGZYK"))throw new _0x3b5c26(qBLxWY["klXuw"]);
            else {
              if(_0x3d41bf&&_0x57da2e["IWwfV"](_0x3d41bf["code"], "EPIPE"))_0x57da2e["AHOiC"](helperFunction915, _0x3d41bf);
            }
          }), _0x2541a7["stdout"]["pipe"](_0x4b6095["stdin"]), _0x2541a7['on']("error", function(_0x178ddf) {
            function helperFunction934(_0x2d62ac, _0x2d12e5) {
              return helperFunction887(_0x2d62ac, _0x2d12e5-999);
            }_0x2fb239["ecMST"](helperFunction915, _0x178ddf);
          }), _0x4b6095['on']("error", function(_0x182b0d) {
            
            function helperFunction935(_0x57d42b, _0x325581) {
              return helperFunction888(_0x57d42b-0x3d9, _0x325581);
            }function helperFunction936(_0x507626, _0x3a5441) {
              return helperFunction888(_0x507626-0x18c, _0x3a5441);
            }_0x57da2e["OUgjA"]("KsmmP", "KsmmP")?_0x57da2e["gGUAK"](helperFunction915, _0x182b0d):_0x3b3b70=_0x5ab87f["sources"];
          }), _0x2541a7['on']("close", function(_0x140f0b) {
            function helperFunction937(_0x30b98d, _0x44b878) {
              return helperFunction888(_0x30b98d-0xc0, _0x44b878);
            }_0x4f162f=_0x140f0b, _0x2fb239["xkpIP"](helperFunction919);
          }), _0x4b6095['on']("close", function(_0x2ad562) {
            _0x2468f0=_0x2ad562;
            function helperFunction938(_0x244359, _0x8da2c8) {
              return helperFunction887(_0x8da2c8, _0x244359-0x213);
            }_0x57da2e["nYxvj"](helperFunction919);
          });
        } else  return _0x48af03["existsSync"](qBLxWY["HtwMJ"](_0x5d7740, _0xd0757a));
      }):_0x4253cc["join"](pbNrqP["ecMST"](_0x1a6243, _0x12726f), _0x39d4f5);
    }function helperFunction942(_0x16367c) {
      function helperFunction940(_0x386fa4, _0x2f1f49) {
        return helperFunction855(_0x386fa4, _0x2f1f49-0x2eb);
      }function helperFunction941(_0x2bf8b8, _0x3cc9d9) {
        return helperFunction855(_0x2bf8b8, _0x3cc9d9-167);
      }{
        if(!_0x16367c)return '';
        const _0x1d62db=pathModule12["dirname"](_0x16367c), _0x378b78=pathModule12["basename"](_0x16367c, pathModule12["extname"](_0x16367c));
        return pathModule12["join"](_0x1d62db, ((_0x378b78)+(".embeddings.bin")));
      }
    }const _0x52c3f6= {
    };
    _0x52c3f6["isEnabled"]=helperFunction859, _0x52c3f6["runScan"]=helperFunction862, _0x52c3f6["runUpdate"]=helperFunction865, _0x52c3f6["status"]=helperFunction868, _0x52c3f6["streamEmbedToSetEmbeddings"]=helperFunction939, _0x56175d["exports"]=_0x52c3f6;
  }
}), require_embed=__commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/embed/index.js'(_0x918778, _0x12325c) {
    'use strict';
    
    function helperFunction943(_0x45dab7, _0x3ea579) {
      return _0x543fdb(_0x3ea579, _0x45dab7- -1712);
    }
    function helperFunction944(_0x2dfa6e, _0x82b6f1) {
      return _0x543fdb(_0x2dfa6e, _0x82b6f1- -515);
    }const _0x45b592="1|4|3|2|0"["split"]('|');
    let _0x518508=0;
    while(true) {
      switch(_0x45b592[_0x518508++]) {
        case '0':const _0x54501f= {
        };
        _0x54501f["preference"]=preferenceModule2, _0x54501f["binary"]=binary2Module2, _0x54501f["orchestrator"]=orchestratorModule, _0x54501f["isEnabled"]=orchestratorModule["isEnabled"], _0x54501f["runScan"]=orchestratorModule["runScan"], _0x54501f["runUpdate"]=orchestratorModule["runUpdate"], _0x54501f["status"]=orchestratorModule["status"], _0x12325c["exports"]=_0x54501f;
        continue;
        case '1':'use strict';
        continue;
        case '2':var orchestratorModule=require_orchestrator();
        continue;
        case '3':var binary2Module2=require_binary2();
        continue;
        case '4':var preferenceModule2=require_preference();
        continue;
      }break;
    }
  }
}), require_repo_intel=__commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/index.js'(_0x4315f0, _0x48738e) {
    'use strict';
    
    var _0x3344c2=((require)(('fs'))), _0x449dff=require("path"), _0x2fe30e=require("child_process"), {
      execFileSync:_0x2d4178
    }=childProcessModule5, _0x53014c=((require_installer)()), _0x26a751=((require_cache)());
    function helperFunction945(_0x37a8c1, _0xedb491) {
      return _0x543fdb(_0x37a8c1, _0xedb491- -884);
    }function helperFunction946(_0x3610b8, _0x100cb5) {
      return _0x543fdb(_0x3610b8, _0x100cb5- -440);
    }var _0x5e3fbf=((require_updater)()), converterModule=require_converter(), _0x3fba0f=((require_queries)()), binaryModule5=require_binary(), {
      getStateDirPath:_0x37b29e
    }=((require_state_dir)()), {
      writeJsonAtomic:_0x31d4e2
    }=require_atomic_write(), _0x119b35="repo-intel.json";
    function helperFunction949(_0xcfc3f7) {
      
      function helperFunction947(_0x109779, _0x19185c) {
        return helperFunction945(_0x109779, _0x19185c- -576);
      }function helperFunction948(_0x4251f7, _0x115871) {
        return helperFunction945(_0x4251f7, _0x115871- -820);
      }return pathModule13["join"](((_0x37b29e)((_0xcfc3f7))), _0x119b35);
    }async function helperFunction954(_0xb7ec75, _0x259e80= {
    }) {
      const _0xc06487=await installerModule["checkInstalled"]();
      if(!_0xc06487["found"]) {
        return {
          'success':false, 'error':(("agent-analyzer binary unavailable: ")+(_0xc06487["error"]||"unknown error")), 'installSuggestion':installerModule["getInstallInstructions"]()
        };
      }const _0x3f5881=_0x26a751["load"](_0xb7ec75);
      if(_0x3f5881&&!_0x259e80["force"])return {
        'success':false, 'error':"Repo map already exists. Use --force to rebuild or update to refresh.", 'existing':_0x26a751["getStatus"](_0xb7ec75)
      };
      const _0xb17e1c=Date["now"]();
      function helperFunction952(_0x1a0934, _0x57b628) {
        return helperFunction945(_0x1a0934, _0x57b628- -953);
      }let _0x3dc883;
      try {
        _0x3dc883=await binaryModule5["runAnalyzerAsync"](["repo-intel", "init", _0xb7ec75]);
      } catch(_0x3f3dc6) {
        return {
          'success':false, 'error':(("agent-analyzer repo-intel init failed: ")+(_0x3f3dc6["message"]))
        };
      }let _0x33e9c7;
      try {
        _0x33e9c7=JSON["parse"](_0x3dc883);
      } catch(_0x34cf80) {
        return {
          'success':false, 'error':(("Failed to parse repo-intel output: ")+(_0x34cf80["message"]))
        };
      }const _0x11a9e3=((helperFunction949)((_0xb7ec75)));
      try {
        (_0x31d4e2)((_0x11a9e3), (_0x33e9c7));
      } catch {
      }function helperFunction953(_0x5e0a98, _0x4c3d01) {
        return helperFunction945(_0x4c3d01, _0x5e0a98-0x226);
      }const _0x2d105f=converterModule["convertIntelToRepoMap"](_0x33e9c7);
      return _0x2d105f["stats"]["scanDurationMs"]=((Date["now"]())-(_0xb17e1c)), _0x26a751["save"](_0xb7ec75, _0x2d105f), {
        'success':true, 'map':_0x2d105f, 'summary': {
          'files':Object["keys"](_0x2d105f["files"])["length"], 'symbols':_0x2d105f["stats"]["totalSymbols"], 'languages':_0x2d105f["project"]["languages"], 'duration':_0x2d105f["stats"]["scanDurationMs"]
        }
      };
    }async function helperFunction958(_0x1c0153, _0x5e2dd2= {
    }) {
      const _0x3a023a=await installerModule["checkInstalled"]();
      if(!_0x3a023a["found"])return {
        'success':false, 'error':(("agent-analyzer binary unavailable: ")+(_0x3a023a["error"]||"unknown error")), 'installSuggestion':installerModule["getInstallInstructions"]()
      };
      if(!_0x26a751["exists"](_0x1c0153)) {
        {
          const _0x30ac74= {
          };
          return _0x30ac74["success"]=false, _0x30ac74["error"]="No repo map found. Run init first.", _0x30ac74;
        }
      }if(_0x5e2dd2["full"]) {
        const _0x549ace= {
        };
        return _0x549ace["force"]=true, ((helperFunction954)((_0x1c0153), (_0x549ace)));
      }const _0x105628=((helperFunction949)((_0x1c0153)));
      if(!fsModule13["existsSync"](_0x105628)) {
        const _0x1e5ef7= {
        };
        return _0x1e5ef7["force"]=true, ((helperFunction954)((_0x1c0153), (_0x1e5ef7)));
      }const _0x1d1e11=Date["now"]();
      let _0x18a44f;
      function helperFunction956(_0xa22de5, _0x5e3c4e) {
        return helperFunction946(_0x5e3c4e, _0xa22de5- -790);
      }try {
        _0x18a44f=await binaryModule5["runAnalyzerAsync"](["repo-intel", "update", "--map-file", _0x105628, _0x1c0153]);
      } catch(_0x22d61d) {
        return {
          'success':false, 'error':(("agent-analyzer repo-intel update failed: ")+(_0x22d61d["message"]))
        };
      }let _0x43c053;
      try {
        _0x43c053=JSON["parse"](_0x18a44f);
      } catch(_0x202b27) {
        return {
          'success':false, 'error':(("Failed to parse repo-intel update output: ")+(_0x202b27["message"]))
        };
      }try {
        ((_0x31d4e2)((_0x105628), (_0x43c053)));
      } catch {
      }const _0x460f4a=converterModule["convertIntelToRepoMap"](_0x43c053);
      function helperFunction957(_0x48b071, _0x582bd7) {
        return helperFunction946(_0x582bd7, _0x48b071-0x95);
      }return _0x460f4a["stats"]["scanDurationMs"]=((Date["now"]())-(_0x1d1e11)), _0x26a751["save"](_0x1c0153, _0x460f4a), {
        'success':true, 'map':_0x460f4a, 'summary': {
          'files':Object["keys"](_0x460f4a["files"])["length"], 'symbols':_0x460f4a["stats"]["totalSymbols"], 'duration':_0x460f4a["stats"]["scanDurationMs"]
        }
      };
    }function helperFunction961(_0x3b1ffe) {
      const _0x408f24=_0x26a751["load"](_0x3b1ffe);
      function helperFunction959(_0x1c134f, _0x28cf33) {
        return helperFunction945(_0x28cf33, _0x1c134f- -717);
      }if(!_0x408f24) {
        const _0x8ee8cc= {
        };
        return _0x8ee8cc["exists"]=false, _0x8ee8cc;
      }const _0x163c4e=updaterModule["checkStaleness"](_0x3b1ffe, _0x408f24);
      function helperFunction960(_0x3e8ebe, _0x4df82e) {
        return helperFunction945(_0x4df82e, _0x3e8ebe-0x372);
      }let _0xd10da1;
      try {
        _0xd10da1=((_0x2d4178)(("git"), (["rev-parse", "--abbrev-ref", "HEAD"]), ({
          'cwd':_0x3b1ffe, 'encoding':"utf8"
        })))["trim"]();
      } catch {
      }return {
        'exists':true, 'status': {
          'generated':_0x408f24["generated"], 'updated':_0x408f24["updated"], 'commit':_0x408f24["git"]?.["commit"], 'branch':_0xd10da1, 'files':Object["keys"](_0x408f24["files"])["length"], 'symbols':_0x408f24["stats"]?.["totalSymbols"]||0, 'languages':_0x408f24["project"]?.["languages"]||[], 'staleness':_0x163c4e
        }
      };
    }function helperFunction964(_0x213624) {
      
      function helperFunction962(_0x5a96a0, _0x33e4f4) {
        return helperFunction946(_0x5a96a0, _0x33e4f4- -646);
      }function helperFunction963(_0x33c257, _0x3f3a7a) {
        return helperFunction946(_0x3f3a7a, _0x33c257- -1456);
      }return _0x26a751["load"](_0x213624);
    }function helperFunction967(_0x20dc0e) {
      const _0x1efa2a= {
      };
      function helperFunction965(_0x297a2b, _0x5f1534) {
        return helperFunction946(_0x297a2b, _0x5f1534- -1215);
      }_0x1efa2a["BAQCv"]="undocumented-export", _0x1efa2a["UqXMY"]="low", _0x1efa2a["ueNsq"]="export", _0x1efa2a["zqwth"]="MEDIUM";
      
      function helperFunction966(_0x3b4e53, _0x3c53ab) {
        return helperFunction946(_0x3c53ab, _0x3b4e53-0x21);
      }return _0x26a751["exists"](_0x20dc0e);
    }function helperFunction970(_0x484998) {
      const _0x19fbb8= {
      };
      _0x19fbb8["ZCxNm"]="Refusing to extract archive with empty entry name";
      function helperFunction968(_0x2f35ce, _0x12e636) {
        return helperFunction945(_0x12e636, _0x2f35ce- -526);
      }function helperFunction969(_0x158506, _0x39e963) {
        return helperFunction945(_0x158506, _0x39e963-0x12c);
      }const _0x5dc5c4=((helperFunction949)((_0x484998)));
      if(!fsModule13["existsSync"](_0x5dc5c4))return null;
      try {
        return JSON["parse"](fsModule13["readFileSync"](_0x5dc5c4, "utf8"));
      } catch {
        return null;
      }
    }async function helperFunction999(_0x4b0a4c, _0x30829c) {
      
      function helperFunction971(_0x92414d, _0x1367a4) {
        return helperFunction945(_0x1367a4, _0x92414d-853);
      }function helperFunction972(_0x582bc0, _0x158971) {
        return helperFunction945(_0x158971, _0x582bc0- -3);
      }const _0x4f00e0= {
        'wQTFm':function(_0x10bbae, _0x2b9f9f) {
          function helperFunction973(_0x4ad92f, _0x54b5cf) {
            return _0x139e(_0x4ad92f-0x132, _0x54b5cf);
          }return ((_0x10bbae)===(_0x2b9f9f));
        },
        'Ilylq':"VTYAo", 'kIhZd':"OVrGa", 'gYKQW':"qJgin", 'qfHoy':"HaZUf", 'Qgbza':function(_0x220dbc, _0x26f951) {
          function helperFunction974(_0x21ebdd, _0x3d03fd) {
            return helperFunction971(_0x21ebdd- -1765, _0x3d03fd);
          }return ((_0x220dbc)((_0x26f951)));
        },
        'eWGVS':function(_0x38e0c0, _0x16986c) {
          function helperFunction975(_0x3ee366, _0x4113d6) {
            return helperFunction972(_0x4113d6- -901, _0x3ee366);
          }return ((_0x38e0c0)!==(_0x16986c));
        },
        'ophcF':"ispUn", 'ycctw':"WAuRS", 'wmWnK':function(_0x1a8109, _0x1e13c6) {
          function helperFunction976(_0x13433b, _0x70e897) {
            return helperFunction971(_0x70e897- -803, _0x13433b);
          }return ((_0x1a8109)((_0x1e13c6)));
        },
        'wedLa':"dCMyn", 'HdDuT':"utf8", 'dnmOs':function(_0x1fc5c4, _0x69566) {
          
          function helperFunction977(_0x8ebe9c, _0x49cc7a) {
            return helperFunction971(_0x8ebe9c- -124, _0x49cc7a);
          }return ((_0x1fc5c4)!=(_0x69566));
        },
        'lQZkA':"--top", 'faxsa':function(_0x56bcad, _0x1dc7aa) {
          function helperFunction978(_0x4de1f1, _0xc5ec0d) {
            return helperFunction971(_0xc5ec0d- -1373, _0x4de1f1);
          }return ((_0x56bcad)((_0x1dc7aa)));
        },
        'JqYTT':function(_0x21acbd, _0x375a9b, _0x1c1689, _0x58b143) {
          function helperFunction979(_0x3ba99f, _0x1fa0e2) {
            return helperFunction972(_0x1fa0e2-0x32f, _0x3ba99f);
          }return ((_0x21acbd)((_0x375a9b), (_0x1c1689), (_0x58b143)));
        },
        'usAUI':"coldspots", 'eIAtD':"tHWyv", 'wasYZ':"CxuHu", 'WGhtg':"compact", 'tbbzJ':"maximum", 'pMUuq':"balanced", 'LIhIJ':function(_0x56d947, _0x24b548) {
          function helperFunction980(_0x4500ef, _0x2644c2) {
            return helperFunction971(_0x2644c2- -728, _0x4500ef);
          }return ((_0x56d947)+(_0x24b548));
        },
        'UqpWH':"Refusing non-HTTPS redirect to ", 'XLMHX':function(_0x525f5c, _0x15cfa9) {
          function helperFunction981(_0x5ab8f4, _0x51f206) {
            return helperFunction971(_0x5ab8f4- -1828, _0x51f206);
          }return ((_0x525f5c)!==(_0x15cfa9));
        },
        'cMpvf':"NRtxh", 'eBPrB':"PBGog", 'EoHxI':"pipe", 'GAcFl':"data", 'LjmlH':"error", 'Btkvn':"close"
      };
      if((false))_0x1d9abe["requireAttestation"]=_0x12349;
      else {
        const _0x4e706a=await binaryModule5["ensureBinary"]();
        return new Promise((_0x1aeb3d, _0x2ba42f)=> {
          const _0xc8b279= {
            'ERLKu':function(_0x18a6a3, _0x111911) {
              function helperFunction982(_0xce6a00, _0x507693) {
                return _0x139e(_0x507693-0x6e, _0xce6a00);
              }return _0x4f00e0["wQTFm"](_0x18a6a3, _0x111911);
            },
            'eKBOn':"dCMyn", 'HwcSB':"utf8", 'JOpuW':function(_0x172c07, _0x28abf5) {
              function helperFunction983(_0x5c9c04, _0x4e7df1) {
                return helperFunction988(_0x5c9c04-0x2a8, _0x4e7df1);
              }return _0x4f00e0["dnmOs"](_0x172c07, _0x28abf5);
            },
            'nSFbs':"--top", 'HFCWy':function(_0x2d661c, _0x28a644) {
              
              function helperFunction984(_0x5b5e6f, _0x2e1ece) {
                return helperFunction988(_0x5b5e6f- -138, _0x2e1ece);
              }return _0x4f00e0["faxsa"](_0x2d661c, _0x28a644);
            },
            'aVGyI':function(_0xa54edb, _0x86c83a, _0x35fbd6, _0x21220c) {
              function helperFunction985(_0x3b614b, _0x2e0e56) {
                return helperFunction988(_0x3b614b- -365, _0x2e0e56);
              }return _0x4f00e0["JqYTT"](_0xa54edb, _0x86c83a, _0x35fbd6, _0x21220c);
            },
            'FhnxZ':"coldspots", 'sEiCz':"tHWyv", 'MpTlc':"CxuHu", 'zDDiU':"compact", 'xWhKk':"maximum", 'CSHWn':"balanced", 'hibpg':function(_0x1cf1e5, _0x5e20cb) {
              function helperFunction986(_0x3561d8, _0x57aac3) {
                return helperFunction989(_0x57aac3, _0x3561d8- -1670);
              }return _0x4f00e0["wmWnK"](_0x1cf1e5, _0x5e20cb);
            },
            'tfrON':function(_0x8dc3de, _0x3dd86c) {
              function helperFunction987(_0x20295b, _0x3704d7) {
                return helperFunction988(_0x20295b- -59, _0x3704d7);
              }return _0x4f00e0["LIhIJ"](_0x8dc3de, _0x3dd86c);
            },
            'MsULt':"Refusing non-HTTPS redirect to "
          };
          function helperFunction988(_0x1abe9e, _0x3cb36e) {
            return helperFunction972(_0x1abe9e- -398, _0x3cb36e);
          }function helperFunction989(_0x4cd712, _0x12361c) {
            return helperFunction972(_0x12361c-0x2d7, _0x4cd712);
          }if(_0x4f00e0["XLMHX"]("NRtxh", "PBGog")) {
            const _0x46151c= {
            };
            _0x46151c["stdio"]=["pipe", "pipe", "pipe"], _0x46151c["windowsHide"]=true;
            const _0x3ca986=childProcessModule5["spawn"](_0x4e706a, _0x4b0a4c, _0x46151c);
            let _0x4ae000='', _0x5e840b='';
            _0x3ca986["stdout"]['on']("data", _0x1923ee=> {
              
              function helperFunction990(_0x412036, _0x2328c3) {
                return helperFunction989(_0x412036, _0x2328c3-0x77);
              }function helperFunction991(_0x4a8e9e, _0x1a9e0a) {
                return helperFunction989(_0x4a8e9e, _0x1a9e0a- -258);
              }if(_0xc8b279["ERLKu"]("dCMyn", "dCMyn"))_0x4ae000+=_0x1923ee["toString"]("utf8");
              else  return {
              };
            }), _0x3ca986["stderr"]['on']("data", _0x5595be=> {
              
              function helperFunction992(_0x13397f, _0x3c0d77) {
                return helperFunction989(_0x3c0d77, _0x13397f- -46);
              }
              function helperFunction996(_0x13e686, _0x4240bd) {
                return helperFunction989(_0x4240bd, _0x13e686- -1460);
              }if(_0xc8b279["ERLKu"]("tHWyv", "CxuHu")) {
                const _0xa73615=[];
                if(TUHKJM["pxLWj"](_0x2b660d["limit"], null))items54["push"](TUHKJM["dyUva"], TUHKJM["WmzKo"](_0x42f230, _0x982c58["limit"]));
                return TUHKJM["aEDVD"](_0x524985, TUHKJM["LdsCN"], items54, _0x5d1c72);
              } else  _0x5e840b+=_0x5595be["toString"]("utf8");
            }), _0x3ca986['on']("error", _0x2ba42f), _0x3ca986['on']("close", _0x1ef5c0=> {
              function helperFunction997(_0xa2c189, _0xed4f4c) {
                return helperFunction989(_0xed4f4c, _0xa2c189- -1298);
              }function helperFunction998(_0x2fdb6f, _0x5d0ba5) {
                return helperFunction989(_0x2fdb6f, _0x5d0ba5- -153);
              }if(_0x4f00e0["wQTFm"]("VTYAo", "OVrGa"))return _0x526c4a["parse"](_0x5045c);
              else {
                if(_0x4f00e0["wQTFm"](_0x1ef5c0, 0)) {
                  if(_0x4f00e0["wQTFm"]("qJgin", "HaZUf"))_0x437e55=_0x21c151["parse"](_0x5e21a9);
                  else {
                    const _0x488feb= {
                    };
                    _0x488feb["stdout"]=_0x4ae000, _0x488feb["stderr"]=_0x5e840b, _0x4f00e0["Qgbza"](_0x1aeb3d, _0x488feb);
                  }
                } else {
                  if(_0x4f00e0["eWGVS"]("ispUn", "WAuRS"))_0x4f00e0["wmWnK"](_0x2ba42f, new Error("agent-analyzer "+_0x4b0a4c["join"]('\x20')+" exited "+_0x1ef5c0+':\x20'+(_0x5e840b["trim"]()||_0x4ae000["trim"]())));
                  else  switch(_0x4198cd) {
                    case wksVos["zDDiU"]:return wksVos["zDDiU"];
                    case wksVos["xWhKk"]:return wksVos["xWhKk"];
                    case wksVos["CSHWn"]:default:return wksVos["CSHWn"];
                  }
                }
              }
            }), _0x3ca986["stdin"]["write"](_0x30829c), _0x3ca986["stdin"]["end"]();
          } else {
            wksVos["hibpg"](_0xc021e1, new _0x53b2b6(wksVos["tfrON"](wksVos["MsULt"], _0x4b8973)));
            return;
          }
        });
      }
    }async function helperFunction1006(_0x598d91, _0x214294) {
      
      function helperFunction1004(_0x29cbef, _0x1a6513) {
        return helperFunction946(_0x29cbef, _0x1a6513-67);
      }function helperFunction1005(_0x1d7f24, _0x17aa80) {
        return helperFunction946(_0x1d7f24, _0x17aa80- -1086);
      }{
        if(!_0x214294||((typeof _0x214294)!==("object"))) {
          throw new Error("applyDescriptors requires an object {path: descriptor}");
        }const _0x163986=((helperFunction949)((_0x598d91)));
        if(!fsModule13["existsSync"](_0x163986)) {
          throw new Error(((("No repo-intel artifact for ")+(_0x598d91))+"; run init first."));
        }await helperFunction999(["repo-intel", "set-descriptors", "--map-file", _0x163986, "--input", '-'], JSON["stringify"](_0x214294));
      }
    }async function helperFunction1013(_0x5995d5, _0x3d0e6c) {
      
      if(!_0x3d0e6c||!_0x3d0e6c["depth1"]||!_0x3d0e6c["depth3"]||!_0x3d0e6c["depth10"]) {
        throw new Error("applySummary requires {depth1, depth3, depth10, inputHash}");
      }const _0x29360c=((helperFunction949)((_0x5995d5)));
      function helperFunction1011(_0x3c2c5c, _0x17b23a) {
        return helperFunction946(_0x3c2c5c, _0x17b23a-362);
      }if(!fsModule13["existsSync"](_0x29360c))throw new Error(((("No repo-intel artifact for ")+(_0x5995d5))+("; run init first.")));
      function helperFunction1012(_0x5a9972, _0x20de8f) {
        return helperFunction946(_0x20de8f, _0x5a9972- -671);
      }await ((helperFunction999)((["repo-intel", "set-summary", "--map-file", _0x29360c, "--input", '-']), (JSON["stringify"](_0x3d0e6c))));
    }async function helperFunction1016() {
      
      function helperFunction1014(_0x45c128, _0xc66582) {
        return helperFunction946(_0xc66582, _0x45c128-0x1ce);
      }function helperFunction1015(_0x4ac42d, _0xf1228b) {
        return helperFunction946(_0xf1228b, _0x4ac42d- -582);
      }return installerModule["checkInstalled"]();
    }function helperFunction1023() {
      
      function helperFunction1017(_0x395ff2, _0x30f5c8) {
        return helperFunction946(_0x30f5c8, _0x395ff2- -277);
      }
      function helperFunction1022(_0x43fe71, _0x339e3b) {
        return helperFunction946(_0x339e3b, _0x43fe71- -1205);
      }return installerModule["getInstallInstructions"]();
    }const _0x224263= {
    };
    _0x224263["init"]=helperFunction954, _0x224263["update"]=helperFunction958, _0x224263["status"]=helperFunction961, _0x224263["load"]=helperFunction964, _0x224263["loadRaw"]=helperFunction970, _0x224263["exists"]=helperFunction967, _0x224263["applyDescriptors"]=helperFunction1006, _0x224263["applySummary"]=helperFunction1013, _0x224263["checkAstGrepInstalled"]=helperFunction1016, _0x224263["getInstallInstructions"]=helperFunction1023, _0x224263["queries"]=queriesModule, _0x224263["installer"]=installerModule, _0x224263["cache"]=_0x26a751, _0x224263["updater"]=updaterModule, _0x224263["converter"]=converterModule, _0x48738e["exports"]=_0x224263, Object["defineProperty"](_0x48738e["exports"], "embed", {
      'enumerable':true, 'get'() {
        function helperFunction1024(_0x58a596, _0x9becc0) {
          return helperFunction945(_0x9becc0, _0x58a596-0x3b6);
        }return ((require_embed)());
      }
    });
  }
}), require_repo_map=__commonJS({
  '../work/agent-sh__agentsys/lib/repo-map/index.js'(_0x4164cd, _0x356534) {
    'use strict';
    
    var repo_intelModule=require_repo_intel();
    const _0x19e687= {
    };
    _0x19e687["init"]=repo_intelModule["init"], _0x19e687["update"]=repo_intelModule["update"];
    function helperFunction1025(_0x318e16, _0x2caed9) {
      return _0x3f8685(_0x2caed9- -1121, _0x318e16);
    }function helperFunction1026(_0x70dc57, _0xbc5305) {
      return _0x3f8685(_0xbc5305- -1405, _0x70dc57);
    }_0x19e687["status"]=repo_intelModule["status"], _0x19e687["load"]=repo_intelModule["load"], _0x19e687["exists"]=repo_intelModule["exists"], _0x19e687["checkAstGrepInstalled"]=repo_intelModule["checkAstGrepInstalled"], _0x19e687["getInstallInstructions"]=repo_intelModule["getInstallInstructions"], _0x19e687["installer"]=repo_intelModule["installer"], _0x19e687["cache"]=repo_intelModule["cache"], _0x19e687["updater"]=repo_intelModule["updater"], _0x356534["exports"]=_0x19e687;
  }
}), require_docs_patterns=__commonJS({
  '../work/agent-sh__agentsys/lib/collectors/docs-patterns.js'(_0x3a988a, _0x5e87bb) {
    'use strict';
    const _0x5acf9a= {
      'Gwzef':function(_0x53b6c7, _0x155736) {
        return _0x53b6c7&&_0x155736;
      },
      'ZUWnk':function(_0xf7107a) {
        return _0xf7107a();
      },
      'Vuhdb':"Failed to load repo-map module", 'ujtiN':function(_0x3e3236, _0x151a6e) {
        return _0x3e3236+_0x151a6e;
      },
      'TJliI':function(_0x3597bd, _0x44bdc6) {
        return _0x3597bd+_0x44bdc6;
      },
      'tldRT':function(_0x2723cb, _0x299079) {
        return _0x2723cb+_0x299079;
      },
      'JWcEc':function(_0x4c9ad1, _0x262b8f) {
        return _0x4c9ad1+_0x262b8f;
      },
      'vXhAT':function(_0x2f8ea5, _0x217510) {
        return _0x2f8ea5+_0x217510;
      },
      'MpBfa':"Failed to download ", 'kYwYj':":\n  URL: ", 'GnOda':"\n  Error: ", 'JWtdN':"\n\nTo install manually:\n  1. Download: ", 'QzkGh':"\n  2. Extract the binary to: ", 'GzgNA':"\n  3. Ensure it is named: ", 'ccNjJ':function(_0x1ab415, _0x390478) {
        return _0x1ab415!==_0x390478;
      },
      'uwpya':"buCdd", 'VFhkn':"OPAhZ", 'JhcQs':function(_0x37e9f1, _0x331f2f) {
        return _0x37e9f1!==_0x331f2f;
      },
      'TdgzG':"EPIPE", 'znuYR':function(_0x40b130, _0x449042) {
        return _0x40b130(_0x449042);
      },
      'NMuQa':function(_0x54d546, _0x1c4a6f) {
        return _0x54d546!==_0x1c4a6f;
      },
      'aHaRW':"JRKIr", 'hAzfB':"\\$&", 'nOrsR':function(_0x48f1fe, _0x3ef3a4) {
        return _0x48f1fe!==_0x3ef3a4;
      },
      'GeLMU':"unknown", 'xXZeC':function(_0x4ffb06, _0x4b9548) {
        return _0x4ffb06===_0x4b9548;
      },
      'Hfnzt':"XJHPy", 'iOtCq':"eFhVj", 'vbmNu':"dKLNk", 'MglGH':"TQjjc", 'EkjGJ':function(_0x279474, _0x49caec) {
        return _0x279474!==_0x49caec;
      },
      'WyilJ':"bOsxc", 'avIMS':"MYDGC", 'LZDbw':function(_0x85fdef, _0x4f8930) {
        return _0x85fdef+_0x4f8930;
      },
      'gAMeD':"tar extraction failed (code ", 'rWxEp':"): ", 'jzyLL':"lHQGw", 'ndiIJ':"jJwVO", 'aVcDE':function(_0x4ced0b) {
        return _0x4ced0b();
      },
      'WslEb':function(_0x49679f, _0x35f564, _0x97707b, _0xc00765) {
        return _0x49679f(_0x35f564, _0x97707b, _0xc00765);
      },
      'HSvwV':"norms", 'pXEpj':function(_0x1b6370, _0x3e6447, _0x2869d0, _0x418627) {
        return _0x1b6370(_0x3e6447, _0x2869d0, _0x418627);
      },
      'svaOe':"git", 'jaOnV':"cat-file", 'tJPLF':"pipe", 'bouoz':".codex", 'ZsyWZ':function(_0x1911e3, _0x21a4fd) {
        return _0x1911e3!==_0x21a4fd;
      },
      'RRAtj':"string", 'YRScE':function(_0x2f853e, _0x1aecf5) {
        return _0x2f853e!==_0x1aecf5;
      },
      'dFIAA':"AJcZO", 'rimmf':function(_0x51f8d0) {
        return _0x51f8d0();
      },
      'nrACi':function(_0x3587be, _0x112b08) {
        return _0x3587be!==_0x112b08;
      },
      'iknsf':"lIYAU", 'OooOt':"dcpdb", 'WvbWd':"repo-map-module-not-found", 'wkSzW':function(_0x26cb51, _0x2d2436) {
        return _0x26cb51!==_0x2d2436;
      },
      'HJYgR':"fSnXc", 'PDOsM':"zdOPx", 'WVUxI':"TGoxF", 'sPUsB':"ast-grep not found. Install for better doc sync accuracy?", 'aoUAe':"ast-grep Required", 'AqkwY':"Yes, show instructions", 'DwpEO':"Better accuracy with AST-based symbol detection", 'DJzEJ':"No, use regex fallback", 'uLpik':"Less accurate but works without additional install", 'YnLuZ':"Yes", 'nzSMl':function(_0x87070c, _0x386731) {
        return _0x87070c===_0x386731;
      },
      'ZIyfo':"CKfeU", 'mmpAO':"ast-grep-install-pending", 'aIQXF':"ast-grep-not-installed", 'zpWFC':"tAXBx", 'wvLRC':"CrQRU", 'jssxJ':function(_0x34fe5a, _0x1f310b) {
        return _0x34fe5a===_0x1f310b;
      },
      'vRiyi':"EVaHg", 'OLwDl':"already exists", 'CowoS':"init-failed", 'xlclz':"init-error", 'fRNqd':function(_0x5529a7) {
        return _0x5529a7();
      },
      'JctTd':"repo-map-not-initialized", 'XyYQE':"attestation", 'irqLv':"verify", 'vvEhu':"--repo", 'SuVYB':"--format", 'EimSs':"json", 'wXxdE':"utf8", 'azmgZ':"ignore", 'GVaMQ':function(_0x34fd5d, _0x3b079b) {
        return _0x34fd5d||_0x3b079b;
      },
      'FHAgU':"--version", 'GlBrX':"missing-section", 'MZYBg':"README.md", 'Nmizs':"Usage", 'KMyBs':"medium", 'mdKtg':"ZhofK", 'aZBcq':function(_0x1597a5, _0x1d6d68) {
        return _0x1597a5===_0x1d6d68;
      },
      'TyZtM':"ozMdQ", 'CvOCm':"Ruafm", 'TmcpJ':function(_0x1a019a, _0x3e0b7f) {
        return _0x1a019a+_0x3e0b7f;
      },
      'ezYdl':function(_0x31a740, _0x271600) {
        return _0x31a740===_0x271600;
      },
      'jQCfi':"GliuG", 'QScoC':"uYVBp", 'pnDqc':"0|3|2|4|1", 'Nbsko':"agent-analyzer", 'iylTv':"0.3.0", 'lQuGQ':"agent-sh/agent-analyzer", 'hdvhv':function(_0x1061c6, _0xce8b69) {
        return _0x1061c6<_0xce8b69;
      },
      'hcdjZ':function(_0x1c216c, _0x4a2be7) {
        return _0x1c216c>_0x4a2be7;
      },
      'USsVH':function(_0xf9d731, _0xe2f0eb) {
        return _0xf9d731<_0xe2f0eb;
      },
      'VTmuD':"musl", 'sgxOO':"import", 'sEQjh':function(_0x223783, _0x55cc59) {
        return _0x223783(_0x55cc59);
      },
      'FxBjy':function(_0x5ac3bc, _0x125bff) {
        return _0x5ac3bc===_0x125bff;
      },
      'lhRWZ':"ILKuo", 'tamOz':"mlMFC", 'ZInQr':function(_0x4e2a80, _0x28857a) {
        return _0x4e2a80(_0x28857a);
      },
      'ROTsw':function(_0x367e59, _0x561ba9) {
        return _0x367e59!==_0x561ba9;
      },
      'cdJrY':"xoIRY", 'iAClv':function(_0x5a662a, _0x3646b3) {
        return _0x5a662a(_0x3646b3);
      },
      'Gzavd':"WrocT", 'rQQKE':"ojgYY", 'ayNHm':"gSSlg", 'Irlwu':function(_0x3ab70b, _0x5dc2c0) {
        return _0x3ab70b+_0x5dc2c0;
      },
      'lMGMH':function(_0x4d9c42, _0x2870c9) {
        return _0x4d9c42!==_0x2870c9;
      },
      'pxljw':"tmdcB", 'XJehw':function(_0x358be7, _0x5e6153, _0x66836) {
        return _0x358be7(_0x5e6153, _0x66836);
      },
      'YARKz':function(_0x1b0246, _0x10cd85) {
        return _0x1b0246(_0x10cd85);
      },
      'SuWaN':function(_0x4071bd, _0x14f44f) {
        return _0x4071bd(_0x14f44f);
      },
      'gbTwD':"undocumented-export", 'hjUtN':"low", 'qslAG':"export", 'ZoNCc':"MEDIUM", 'lRlwa':"--adjust-for-ai", 'Strkb':function(_0x268e12, _0x87cd03) {
        return _0x268e12!=_0x87cd03;
      },
      'snNmY':"--top", 'DCfFc':"bus-factor", 'AeErQ':"Base commit no longer exists (rebased?)", 'jldgI':function(_0x271592, _0x412baf, _0x4d3aa3) {
        return _0x271592(_0x412baf, _0x4d3aa3);
      },
      'CBYwk':function(_0x119224, _0x1762e7) {
        return _0x119224!==_0x1762e7;
      },
      'TbFot':function(_0x3196bb, _0x492e0d) {
        return _0x3196bb===_0x492e0d;
      },
      'mCzpq':"BtNYP", 'JXyZP':"pxiOp", 'HwfTi':function(_0x38d71e, _0x42e015) {
        return _0x38d71e(_0x42e015);
      },
      'WiNuh':"BWana", 'RXfIT':"wvHzv", 'Jdjwh':"lSPhv", 'vdZTJ':"OssMp", 'WyYni':function(_0x20dc24, _0x378203) {
        return _0x20dc24!==_0x378203;
      },
      'MCxhB':"lOwVz", 'faoUv':"filename", 'aUMhS':"full-path", 'jtayl':"lsTqv", 'WEgzv':"skONc", 'GVKYB':"require", 'OGDla':"zDiKo", 'ZQdUl':"url-path", 'wXUtL':function(_0x1fe6d7, _0x1654da) {
        return _0x1fe6d7>_0x1654da;
      },
      'PXpbi':"sfeeh", 'WGDNM':"pnXnI", 'XimqE':"QfwOn", 'TyxBD':function(_0x4cf87c, _0x1d76c2, _0x1b4172) {
        return _0x4cf87c(_0x1d76c2, _0x1b4172);
      },
      'qKfxC':function(_0x24c580, _0x3bc94a) {
        return _0x24c580+_0x3bc94a;
      },
      'tflcu':".md", 'waUPD':function(_0x155f3d, _0x58e3a8) {
        return _0x155f3d===_0x58e3a8;
      },
      'UNxvs':"wpmYj", 'ifagC':function(_0x1230aa, _0x35d09c) {
        return _0x1230aa===_0x35d09c;
      },
      'tWTjS':"BGbKz", 'tqJnr':"node_modules", 'izKjO':"dist", 'lfmVX':"build", 'sLCTt':".git", 'NHEER':"coverage", 'wwXHW':"vendor", 'bUojw':function(_0x58ebb6, _0x57814d) {
        return _0x58ebb6(_0x57814d);
      },
      'BOWih':"contributors", 'QEvHN':"../agentsys", 'LZqeu':function(_0x69df09, _0x4645d2, _0x302cb5) {
        return _0x69df09(_0x4645d2, _0x302cb5);
      },
      'xIchi':"symbols: file", 'eRUZA':"symbols", 'cujve':function(_0x474ea7, _0x5b0a95) {
        return _0x474ea7(_0x5b0a95);
      },
      'JdUqz':function(_0x48cac3, _0x25e38c, _0xbc803b, _0x174ced) {
        return _0x48cac3(_0x25e38c, _0xbc803b, _0x174ced);
      },
      'lQDhe':"rev-list", 'CXRXb':"--count", 'Nnyer':function(_0xc604e9, _0x32ac95) {
        return _0xc604e9(_0x32ac95);
      },
      'DuWik':"issues", 'SDUsM':function(_0x28265, _0x580591) {
        return _0x28265(_0x580591);
      },
      'pOZmP':"diffRisk: files must be an array of strings", 'qAZmR':"diffRisk: all entries in files must be strings", 'ENDso':function(_0x4200e7, _0x2a9237) {
        return _0x4200e7>_0x2a9237;
      },
      'ikLSZ':"--files", 'RwIZO':function(_0x3af474, _0x5ee840, _0x39eb32, _0x58c6c4) {
        return _0x3af474(_0x5ee840, _0x39eb32, _0x58c6c4);
      },
      'RiACD':"diff-risk", 'LbjbL':"vyxls", 'kUCQb':"ufMsD", 'GYKzX':"Woswg", 'EWEjo':"emMgK", 'sHZkT':function(_0x27d1fa, _0x49c3f4) {
        return _0x27d1fa!==_0x49c3f4;
      },
      'NcGWI':"ryfnI", 'QFyzp':"MfzPv", 'uCeVR':"RIKEU", 'UtICN':"code-example", 'aYUMr':"Verify import path is still valid", 'ptytC':function(_0x228c22, _0x4b5f5b) {
        return _0x228c22(_0x4b5f5b);
      },
      'XJTWu':"oGTmu", 'WoEhD':"LKfQA", 'eiEGK':function(_0x4187e6, _0x459c10, _0x5790fe, _0x79f912) {
        return _0x4187e6(_0x459c10, _0x5790fe, _0x79f912);
      },
      'mSyoC':"HEAD~1", 'FaxWA':function(_0x4a4e77, _0x1098d0, _0xf8953d, _0x56dd3f) {
        return _0x4a4e77(_0x1098d0, _0xf8953d, _0x56dd3f);
      },
      'dspnV':"HEAD", 'PiFol':function(_0x1f69c3, _0x16f5ff) {
        return _0x1f69c3===_0x16f5ff;
      },
      'akFXQ':"eqjTs", 'prFLd':"ZuFSW", 'uqTVA':function(_0x43c42d, _0x3b463f) {
        return _0x43c42d===_0x3b463f;
      },
      'TRoqI':"eWoWB", 'ZeuAG':"removed-export", 'iZMNi':"high", 'sUpht':"repo-map", 'gfMvD':"regex", 'rqGKW':function(_0x43c709, _0x14d2b) {
        return _0x43c709!==_0x14d2b;
      },
      'VEYDH':"FOImO", 'zcvVD':"package.json", 'grlYm':function(_0x46c325, _0x21f7da) {
        return _0x46c325!==_0x21f7da;
      },
      'yEefc':function(_0x52ed99, _0x5b3866, _0x4db7f8) {
        return _0x52ed99(_0x5b3866, _0x4db7f8);
      },
      'LpQdt':"hhHYH", 'RtpnB':"OLBpZ", 'KMfaM':"outdated-version", 'DIOWE':function(_0x1821bc, _0x5a4c0b, _0x38d65a) {
        return _0x1821bc(_0x5a4c0b, _0x38d65a);
      },
      'zsvSF':"tkJhk", 'bggBe':function(_0x103392, _0x3cbb0d) {
        return _0x103392===_0x3cbb0d;
      },
      'AdpzD':function(_0x36460d, _0x4f24b3, _0x2a0fcd, _0x13a71f) {
        return _0x36460d(_0x4f24b3, _0x2a0fcd, _0x13a71f);
      },
      'JleGP':function(_0x4a8e40, _0x4c1828) {
        return _0x4a8e40(_0x4c1828);
      },
      'jmDKL':"LalBd", 'tFoZx':"hZtkA", 'BvjBq':function(_0x39668f, _0x41cf90) {
        return _0x39668f||_0x41cf90;
      },
      'mZbXR':function(_0x455ac5, _0x1427d7) {
        return _0x455ac5===_0x1427d7;
      },
      'rTaqZ':"function", 'cpzqy':"boolean", 'YKlWF':"`gh` CLI not found on PATH", 'MwfwD':"failed", 'cMiUE':function(_0x4f76b4, _0x51b85a) {
        return _0x4f76b4+_0x51b85a;
      },
      'hAFiu':" (AGENT_ANALYZER_REQUIRE_ATTESTATION=1)", 'qwNWw':"skipped", 'INtxI':function(_0x14fd1d, _0x8f7cce, _0x2a9d7e) {
        return _0x14fd1d(_0x8f7cce, _0x2a9d7e);
      },
      'Cndcn':function(_0x21443c, _0x3323a1) {
        return _0x21443c===_0x3323a1;
      },
      'VgzHx':"verified", 'TwvBf':"gh attestation verify exited with status ", 'FDrGa':"agent-analyzer repo-intel update failed: ", 'XaKhS':function(_0x430ddc) {
        return _0x430ddc();
      },
      'hryvN':"WRXUR", 'KHTfA':function(_0x3dbbec, _0x44dcb9, _0x226dde, _0x3d17a3) {
        return _0x3dbbec(_0x44dcb9, _0x226dde, _0x3d17a3);
      },
      'oqkPH':"show", 'xyVFd':"ghVjT", 'hLfSS':"CifuC", 'yqUOl':function(_0x211704, _0x5af308) {
        return _0x211704!==_0x5af308;
      },
      'TzUNi':function(_0x5e2196, _0x3ed476) {
        return _0x5e2196===_0x3ed476;
      },
      'uxdKD':"fKlMc", 'rbUkp':function(_0x3a8cf2, _0x189772) {
        return _0x3a8cf2!==_0x189772;
      },
      'yUJWx':"bltGa", 'AdxAW':"fOaOT", 'QxbdZ':"embedder preference is \"none\" or unset", 'zPBLp':function(_0x25777d, _0x52380b) {
        return _0x25777d===_0x52380b;
      },
      'kdvyl':"VGTdf", 'xgwXZ':function(_0x593e1d) {
        return _0x593e1d();
      },
      'xQWVg':"dependents: file", 'ODAYX':"--file", 'Vtrmv':function(_0x30c6b7) {
        return _0x30c6b7();
      },
      'OtzJG':function(_0x259a61, _0x17102b) {
        return _0x259a61!==_0x17102b;
      },
      'VaxEm':"LgNBY", 'ssvxl':"CHANGELOG.md", 'lvPSO':"PVCID", 'XeqZt':"Could not read CHANGELOG.md", 'BoRan':"## [Unreleased]", 'JIrgb':"log", 'byaYb':"--oneline", 'izCUP':"-10", 'KLnRi':"ScyFq", 'saCUT':"xbCJh", 'iIyQj':"LnNXW", 'qTUCR':function(_0x4775f1, _0x54b929) {
        return _0x4775f1>_0x54b929;
      },
      'AtzXw':function(_0x4a9b63, _0x14acbf) {
        return _0x4a9b63(_0x14acbf);
      },
      'cRPgs':function(_0x99522a, _0x3e813, _0x257e4e) {
        return _0x99522a(_0x3e813, _0x257e4e);
      },
      'nYZuf':function(_0x4798a3, _0x5e3dd3, _0x5d4c49) {
        return _0x4798a3(_0x5e3dd3, _0x5d4c49);
      },
      'EOsqI':function(_0x1a14ce, _0x4b68b1) {
        return _0x1a14ce(_0x4b68b1);
      },
      'rDXks':"path", 'CwrSx':function(_0x16e0eb, _0x5779f4) {
        return _0x16e0eb(_0x5779f4);
      },
      'eDJaW':"child_process", 'MDUxv':"internal", 'pQqgS':"private", 'ucOxS':"utils", 'lmUqv':"helpers", 'LzXpM':"__tests__", 'FNwjW':"test", 'yXfuo':"tests", 'LDryC':"index", 'ZDjfP':"main", 'RDMIn':"app", 'sFAXZ':"server", 'Wymmm':"cli", 'rfeLb':"bin"
    };
    var _0x38b6f9=((require)(('fs'))), _0x10caed=require("path"), {
      execFileSync:_0x2a943a
    }=require("child_process"), _0x5ddbbd=null, _0x456bc2=null;
    function helperFunction1029() {
      function helperFunction1027(_0x5bbeb5, _0x5d0380) {
        return helperFunction1114(_0x5d0380, _0x5bbeb5- -281);
      }function helperFunction1028(_0x4186b9, _0x5d2b3f) {
        return helperFunction1114(_0x5d2b3f, _0x4186b9-0x25d);
      }if(((!_0x5ddbbd)&&(!_0x456bc2)))try {
        _0x5ddbbd=((require_repo_map)());
      } catch(_0x1063b0) {
        _0x456bc2=_0x1063b0["message"]||"Failed to load repo-map module", _0x5ddbbd=null;
      }return _0x5ddbbd;
    }function helperFunction1032() {
      function helperFunction1030(_0x38b49c, _0x1abada) {
        return helperFunction1113(_0x38b49c, _0x1abada- -1048);
      }function helperFunction1031(_0xea3fb5, _0x2eec70) {
        return helperFunction1113(_0xea3fb5, _0x2eec70- -1619);
      }return _0x456bc2;
    }var _0x1319b0= {
      'cwd':process["cwd"]()
    },
    _0x36c0f8=5, _0x4d47b3=200, _0x10b849=["internal", "private", "utils", "helpers", "__tests__", "test", "tests"], _0x7ea6f7=["index", "main", "app", "server", "cli", "bin"], _0x564288=[/export\s+(?:function|class|const|let|var)\s+(\w+)/g, /export\s+\{([^}]+)\}/g, /module\.exports\s*=\s*\{([^}]+)\}/];
    function helperFunction1035(_0x1d152f) {
      
      function helperFunction1033(_0x50c00f, _0x2f44dd) {
        return helperFunction1113(_0x2f44dd, _0x50c00f- -1782);
      }function helperFunction1034(_0x1f6074, _0x5f5d09) {
        return helperFunction1113(_0x1f6074, _0x5f5d09-0x71);
      }return _0x1d152f["replace"](/[.*+?^${}()|[\]\\]/g, "\\$&");
    }function helperFunction1038(_0x2fdf55, _0x49a7bb) {
      
      function helperFunction1036(_0x762a7f, _0x43251e) {
        return helperFunction1113(_0x43251e, _0x762a7f- -455);
      }function helperFunction1037(_0x193659, _0x13dc0d) {
        return helperFunction1113(_0x193659, _0x13dc0d- -1247);
      }{
        if(_0x2fdf55["startsWith"]('_'))returntrue;
        const _0x2ecea1=_0x49a7bb["toLowerCase"]();
        for(const _0x33cae8 of items55) {
          {
            if(_0x2ecea1["includes"]('/'+_0x33cae8+'/')||_0x2ecea1["includes"]('\x5c'+_0x33cae8+'\x5c')) {
              returntrue;
            }
          }
        }if(/\.(test|spec)\.[jt]sx?$/["test"](_0x49a7bb))returntrue;
        returnfalse;
      }
    }function helperFunction1045(_0x4fd947) {
      
      function helperFunction1039(_0x533bfe, _0x294c32) {
        return helperFunction1114(_0x533bfe, _0x294c32- -906);
      }
      function helperFunction1044(_0x52c6e0, _0x4a16a4) {
        return helperFunction1114(_0x52c6e0, _0x4a16a4-0x359);
      }{
        const _0x2e97ec=pathModule14["basename"](_0x4fd947), _0x4d195c=_0x2e97ec["replace"](/\.[^.]+$/, '')["toLowerCase"]();
        return items56["includes"](_0x4d195c);
      }
    }async function helperFunction1051(_0x11a9e8= {
    }) {
      
      function helperFunction1049(_0x2affd0, _0x27a2ca) {
        return helperFunction1113(_0x2affd0, _0x27a2ca- -1393);
      }function helperFunction1050(_0x558c0c, _0x232717) {
        return helperFunction1113(_0x558c0c, _0x232717- -384);
      }{
        const {
          cwd:cwd=process["cwd"](), askUser:_0x2b0f10
        }=_0x11a9e8, _0x399169=helperFunction1029();
        if(!_0x399169) {
          {
            const _0x22fd8d= {
            };
            return _0x22fd8d["available"]=false, _0x22fd8d["map"]=null, _0x22fd8d["fallbackReason"]="repo-map-module-not-found", _0x22fd8d;
          }
        }if(_0x399169["exists"](cwd)) {
          {
            const _0x57a4cf=_0x399169["load"](cwd), _0x471ced= {
            };
            return _0x471ced["available"]=true, _0x471ced["map"]=_0x57a4cf, _0x471ced["fallbackReason"]=null, _0x471ced;
          }
        }const _0x3b63c7=await _0x399169["checkAstGrepInstalled"]();
        if(!_0x3b63c7["found"]) {
          {
            if(_0x2b0f10) {
              {
                const _0x40d849=await ((_0x2b0f10)(({
                  'question':"ast-grep not found. Install for better doc sync accuracy?", 'header':"ast-grep Required", 'options':[{
                    'label':"Yes, show instructions", 'description':"Better accuracy with AST-based symbol detection"
                  },
                  {
                    'label':"No, use regex fallback", 'description':"Less accurate but works without additional install"
                  }]
                })));
                if(_0x40d849&&_0x40d849["includes"]("Yes")) {
                  {
                    const _0x24baca=_0x399169["getInstallInstructions"](), _0x1ae390= {
                    };
                    return _0x1ae390["available"]=false, _0x1ae390["map"]=null, _0x1ae390["fallbackReason"]="ast-grep-install-pending", _0x1ae390["installInstructions"]=_0x24baca, _0x1ae390;
                  }
                }
              }
            }const _0x4e1e67= {
            };
            return _0x4e1e67["available"]=false, _0x4e1e67["map"]=null, _0x4e1e67["fallbackReason"]="ast-grep-not-installed", _0x4e1e67;
          }
        }try {
          {
            const _0x2312b3= {
            };
            _0x2312b3["force"]=false;
            const _0x3b7fcd=await _0x399169["init"](cwd, _0x2312b3);
            if(_0x3b7fcd["success"]) {
              {
                const _0x3e642f= {
                };
                return _0x3e642f["available"]=true, _0x3e642f["map"]=_0x3b7fcd["map"], _0x3e642f["fallbackReason"]=null, _0x3e642f;
              }
            }if(_0x3b7fcd["error"]&&_0x3b7fcd["error"]["includes"]("already exists")) {
              const _0x5932c6=_0x399169["load"](cwd), _0x5be792= {
              };
              return _0x5be792["available"]=true, _0x5be792["map"]=_0x5932c6, _0x5be792["fallbackReason"]=null, _0x5be792;
            }const _0x2c19d0= {
            };
            return _0x2c19d0["available"]=false, _0x2c19d0["map"]=null, _0x2c19d0["fallbackReason"]=_0x3b7fcd["error"]||"init-failed", _0x2c19d0;
          }
        } catch(_0x113d46) {
          const _0x1c37fd= {
          };
          return _0x1c37fd["available"]=false, _0x1c37fd["map"]=null, _0x1c37fd["fallbackReason"]=_0x113d46["message"]||"init-error", _0x1c37fd;
        }
      }
    }function helperFunction1054(_0x5d22a2= {
    }) {
      const {
        cwd:cwd=process["cwd"]()
      }=_0x5d22a2, _0x460051=((helperFunction1029)());
      if(!_0x460051) {
        const _0x1d4fc8= {
        };
        return _0x1d4fc8["available"]=false, _0x1d4fc8["map"]=null, _0x1d4fc8["fallbackReason"]="repo-map-module-not-found", _0x1d4fc8;
      }function helperFunction1052(_0x474184, _0x4f83d5) {
        return helperFunction1114(_0x4f83d5, _0x474184-0x307);
      }if(_0x460051["exists"](cwd)) {
        const _0x1a9906=_0x460051["load"](cwd), _0x232f68= {
        };
        return _0x232f68["available"]=true, _0x232f68["map"]=_0x1a9906, _0x232f68["fallbackReason"]=null, _0x232f68;
      }const _0x96f918= {
      };
      _0x96f918["available"]=false, _0x96f918["map"]=null, _0x96f918["fallbackReason"]="repo-map-not-initialized";
      function helperFunction1053(_0x383165, _0x4048d1) {
        return helperFunction1114(_0x4048d1, _0x383165-0x2e2);
      }return _0x96f918;
    }function helperFunction1057(_0x1f6b2b, _0x41f380) {
      const _0x3b90e7= {
      };
      function helperFunction1055(_0x2c3a47, _0x3f257c) {
        return helperFunction1113(_0x2c3a47, _0x3f257c- -423);
      }_0x3b90e7["dKgwi"]="missing-section", _0x3b90e7["riHjt"]="README.md", _0x3b90e7["dJjFN"]="Usage", _0x3b90e7["JckNh"]="medium";
      
      function helperFunction1056(_0x1f516a, _0x2a2545) {
        return helperFunction1113(_0x1f516a, _0x2a2545- -593);
      }{
        if(!_0x41f380||!_0x41f380["files"])return null;
        const _0xbf511=_0x1f6b2b["replace"](/\\/g, '/');
        let _0x11b0d2=_0x41f380["files"][_0xbf511];
        if(!_0x11b0d2&&_0xbf511["startsWith"]('./')) {
          _0x11b0d2=_0x41f380["files"][_0xbf511["slice"](2)];
        }!_0x11b0d2&&!_0xbf511["startsWith"]('./')&&(_0x11b0d2=_0x41f380["files"][(('./')+(_0xbf511))]);
        if(!_0x11b0d2||!_0x11b0d2["symbols"]||!_0x11b0d2["symbols"]["exports"]) {
          return null;
        }return _0x11b0d2["symbols"]["exports"]["map"](_0x42913f=>_0x42913f["name"]);
      }
    }function helperFunction1062(_0x4404a8, _0xa4d942= {
    }) {
      
      function helperFunction1060(_0x4cf714, _0x470676) {
        return helperFunction1114(_0x4cf714, _0x470676-192);
      }function helperFunction1061(_0x2dacc5, _0x9b545f) {
        return helperFunction1114(_0x9b545f, _0x2dacc5- -676);
      }{
        const _0x5c1054= {
          ..._0x1319b0, ..._0xa4d942
        },
        _0x5ac8c9=_0x5c1054, _0x39c793=_0x5ac8c9["repoMapStatus"]||((helperFunction1054)((_0x5ac8c9)));
        if(!_0x39c793["available"]||!_0x39c793["map"]) {
          return[];
        }const _0x468ce4=_0x39c793["map"], _0x345d38=((helperFunction1074)((_0x5ac8c9["cwd"])));
        let _0xd10fe3='';
        for(const _0x3bbff3 of _0x345d38) {
          try {
            _0xd10fe3+=((fsModule14["readFileSync"](pathModule14["join"](_0x5ac8c9["cwd"], _0x3bbff3), "utf8"))+('\x0a'));
          } catch {
          }
        }const _0x5dac9b=[];
        for(const _0x2dc76a of _0x4404a8) {
          const _0x3c0b61=_0x2dc76a["replace"](/\\/g, '/'), _0x26dbf4=map["files"][_0x3c0b61]||map["files"][_0x3c0b61["replace"](/^\.\//, '')];
          if(!_0x26dbf4||!_0x26dbf4["symbols"]||!_0x26dbf4["symbols"]["exports"])continue;
          for(const _0x4a0475 of _0x26dbf4["symbols"]["exports"]) {
            {
              if(((helperFunction1038)((_0x4a0475["name"]), (_0x3c0b61))))continue;
              if(((helperFunction1045)((_0x3c0b61))))continue;
              const _0x409080=new RegExp('\x5cb'+((helperFunction1035)((_0x4a0475["name"])))+'\x5cb');
              if(!_0x409080["test"](_0xd10fe3)) {
                const _0x1fe8aa= {
                };
                _0x1fe8aa["type"]="undocumented-export", _0x1fe8aa["severity"]="low", _0x1fe8aa["file"]=_0x3c0b61, _0x1fe8aa["name"]=_0x4a0475["name"], _0x1fe8aa["line"]=_0x4a0475["line"]||0, _0x1fe8aa["kind"]=_0x4a0475["kind"]||"export", _0x1fe8aa["certainty"]="MEDIUM", _0x1fe8aa["suggestion"]="Export '"+_0x4a0475["name"]+"' in "+_0x3c0b61+(" is not mentioned in any documentation"), items58["push"](_0x1fe8aa);
              }
            }
          }
        }return items58;
      }
    }function helperFunction1068(_0x93d5f2, _0x52fa1b= {
    }) {
      
      function helperFunction1063(_0x1eb979, _0x496f19) {
        return helperFunction1114(_0x496f19, _0x1eb979-0x362);
      }function helperFunction1064(_0x13ee1c, _0x45f6e4) {
        return helperFunction1114(_0x45f6e4, _0x13ee1c- -860);
      }
      {
        const _0x111841= {
          ..._0x1319b0, ..._0x52fa1b
        },
        _0x534f04=_0x111841, _0x39f014=_0x534f04["cwd"], _0x103f32=[], _0x589de8=((helperFunction1074)((cwd3)));
        for(const _0x319ace of _0x93d5f2) {
          {
            const _0x33f5d1=pathModule14["basename"](_0x319ace)["replace"](/\.[^.]+$/, ''), _0x47bf21=_0x319ace["replace"](/\.[^.]+$/, '');
            for(const _0x430bda of _0x589de8) {
              {
                let _0x212f79;
                try {
                  _0x212f79=fsModule14["readFileSync"](pathModule14["join"](cwd3, _0x430bda), "utf8");
                } catch {
                  continue;
                }const _0x31afec=[];
                if(_0x212f79["includes"](_0x33f5d1)) {
                  items60["push"]("filename");
                }_0x212f79["includes"](_0x319ace)&&items60["push"]("full-path");
                if(_0x212f79["includes"]("from '"+_0x47bf21+'\x27')||_0x212f79["includes"]("from \""+_0x47bf21+'\x22')) {
                  items60["push"]("import");
                }(_0x212f79["includes"]("require('"+_0x47bf21+'\x27)')||_0x212f79["includes"]("require(\""+_0x47bf21+'\x22)'))&&items60["push"]("require");
                (_0x212f79["includes"]('/'+_0x33f5d1)||_0x212f79["includes"]('/'+_0x33f5d1+'.'))&&(items60["push"]("url-path"));
                if(((items60["length"])>(0))) {
                  const _0xbf915e= {
                  };
                  _0xbf915e["doc"]=_0x430bda, _0xbf915e["referencedFile"]=_0x319ace, _0xbf915e["referenceTypes"]=items60, items59["push"](_0xbf915e);
                }
              }
            }
          }
        }return items59;
      }
    }function helperFunction1074(_0x1b18cc) {
      const _0x38cb8b= {
      };
      function helperFunction1069(_0x1e2f8b, _0x4d5078) {
        return helperFunction1114(_0x1e2f8b, _0x4d5078-0x20a);
      }_0x38cb8b["kJEYk"]="\\$&", _0x38cb8b["FcgJj"]="agent-analyzer";
      function helperFunction1070(_0x535d4a, _0xad02d2) {
        return helperFunction1114(_0x535d4a, _0xad02d2- -416);
      }
      {
        const _0x268e08=[], _0x3fa118=["node_modules", "dist", "build", ".git", "coverage", "vendor"];
        function helperFunction1073(_0x14ccc3, _0x109dd4=0) {
          function helperFunction1071(_0x4bd75e, _0x5e0ade) {
            return helperFunction1070(_0x5e0ade, _0x4bd75e-0x4a9);
          }function helperFunction1072(_0x1d2079, _0x49b1c6) {
            return helperFunction1070(_0x49b1c6, _0x1d2079-0xa3);
          }if(((_0x109dd4)>(_0x36c0f8))||((items61["length"])>(_0x4d47b3)))return;
          try {
            const _0x2b203b= {
            };
            _0x2b203b["withFileTypes"]=true;
            const _0x3c2100=fsModule14["readdirSync"](_0x14ccc3, _0x2b203b);
            for(const _0x332a2d of _0x3c2100) {
              {
                const _0x10e2c9=pathModule14["join"](_0x14ccc3, _0x332a2d["name"]), _0x592f98=pathModule14["relative"](_0x1b18cc, _0x10e2c9);
                if(_0x332a2d["isDirectory"]()) {
                  if(!items62["includes"](_0x332a2d["name"])&&!_0x332a2d["name"]["startsWith"]('.')) {
                    ((helperFunction1073)((_0x10e2c9), ((_0x109dd4)+(1))));
                  }
                } else  _0x332a2d["isFile"]()&&_0x332a2d["name"]["endsWith"](".md")&&(items61["push"](_0x592f98));
              }
            }
          } catch {
          }
        }return ((helperFunction1073)((_0x1b18cc))), items61;
      }
    }function helperFunction1080(_0x36329f, _0x58b5a0, _0x511877= {
    }) {
      
      function helperFunction1078(_0x548812, _0x50deec) {
        return helperFunction1114(_0x548812, _0x50deec-0x271);
      }function helperFunction1079(_0x23e641, _0x7dea1c) {
        return helperFunction1114(_0x7dea1c, _0x23e641- -440);
      }{
        const _0x268c2a= {
          ..._0x1319b0, ..._0x511877
        },
        _0x41ef21=_0x268c2a, _0x121d67=_0x41ef21["cwd"], _0x1505b7=[];
        let _0x518be4;
        try {
          _0x518be4=fsModule14["readFileSync"](pathModule14["join"](cwd4, _0x36329f), "utf8");
        } catch {
          return items63;
        }const _0x41f589=/```[\s\S]*?```/g, _0x2a3ca8=_0x518be4["match"](_0x41f589)||[];
        for(const _0x15458c of _0x2a3ca8) {
          const _0x5c3926=/import .* from ['"]([^'"]+)['"]/g;
          let _0x48c526;
          while(((_0x48c526=_0x5c3926["exec"](_0x15458c))!==(null))) {
            {
              const _0x46cc82=_0x48c526[1], _0x12c250=_0x58b5a0["replace"](/\.[^.]+$/, '');
              if(_0x46cc82["includes"](pathModule14["basename"](_0x12c250))) {
                items63["push"]({
                  'type':"code-example", 'severity':"medium", 'line':((helperFunction1083)((_0x518be4), (_0x48c526[0]))), 'current':_0x48c526[0], 'suggestion':"Verify import path is still valid"
                });
              }
            }
          }
        }const _0x5464c4=((helperFunction1054)((_0x41ef21)));
        let _0x170fbb, _0x33bed9, _0x207dde=false;
        if(_0x5464c4["available"]&&_0x5464c4["map"]) {
          const _0x521443=((helperFunction1057)((_0x58b5a0), (_0x5464c4["map"])));
          if(_0x521443) {
            _0x33bed9=_0x521443, _0x170fbb=((helperFunction1101)((_0x58b5a0), ("HEAD~1"), (_0x41ef21))), _0x207dde=true;
          }
        }!_0x207dde&&(_0x170fbb=((helperFunction1101)((_0x58b5a0), ("HEAD~1"), (_0x41ef21))), _0x33bed9=((helperFunction1101)((_0x58b5a0), ("HEAD"), (_0x41ef21))));
        const _0x5028f2=_0x170fbb["filter"](_0x569aff=>!_0x33bed9["includes"](_0x569aff));
        for(const _0x5293c3 of _0x5028f2) {
          {
            if(_0x518be4["includes"](_0x5293c3)) {
              {
                const _0x5bda98= {
                };
                _0x5bda98["type"]="removed-export", _0x5bda98["severity"]="high", _0x5bda98["reference"]=_0x5293c3, _0x5bda98["suggestion"]='\x27'+_0x5293c3+("' was removed or renamed"), _0x5bda98["detectionMethod"]=_0x207dde?"repo-map":"regex", items63["push"](_0x5bda98);
              }
            }
          }
        }try {
          {
            const _0x278922=fsModule14["readFileSync"](pathModule14["join"](cwd4, "package.json"), "utf8"), _0x330295=JSON["parse"](_0x278922), _0x3d22f2=_0x330295["version"], _0x48b2e2=_0x518be4["matchAll"](/version[:\s]+['"]?(\d+\.\d+\.\d+)/gi);
            for(const _0x9d7f60 of _0x48b2e2) {
              const _0x18e2e4=_0x9d7f60[1];
              if(((_0x18e2e4)!==(version))&&(((helperFunction1104)((_0x18e2e4), (version)))<(0))) {
                items63["push"]({
                  'type':"outdated-version", 'severity':"low", 'line':((helperFunction1083)((_0x518be4), (_0x9d7f60[0]))), 'current':_0x18e2e4, 'expected':version, 'suggestion':"Update version from "+_0x18e2e4+" to "+version
                });
              }
            }
          }
        } catch {
        }return items63;
      }
    }function helperFunction1083(_0x5297f7, _0x384dbc) {
      function helperFunction1081(_0x8c1575, _0x487a5b) {
        return helperFunction1113(_0x8c1575, _0x487a5b- -1027);
      }function helperFunction1082(_0x3dbcbb, _0x5aabfb) {
        return helperFunction1113(_0x3dbcbb, _0x5aabfb- -1351);
      }if((true)) {
        const _0x277b06=_0x5297f7["indexOf"](_0x384dbc);
        if(_0x5acf9a["bggBe"](_0x277b06, -1))return0;
        return _0x5297f7["substring"](0, _0x277b06)["split"]('\x0a')["length"];
      } else  return _0x2f9fc4["isArray"](_0x33d7e6)?_0x29a91c:[];
    }function helperFunction1088(_0x531ba3) {
      
      function helperFunction1084(_0x3c3ca4, _0x3ea11a) {
        return helperFunction1113(_0x3ea11a, _0x3c3ca4- -1252);
      }
      function helperFunction1087(_0x5cc5e6, _0x24098e) {
        return helperFunction1113(_0x24098e, _0x5cc5e6- -816);
      }{
        if(((typeof _0x531ba3)!==("string"))||!_0x531ba3)returnfalse;
        return /^[a-zA-Z0-9_./-]+(?:[~^][0-9]+)?$/["test"](_0x531ba3);
      }
    }function helperFunction1101(_0x336ee0, _0x6e8cd, _0x366977= {
    }) {
      
      function helperFunction1089(_0x973b47, _0x19f379) {
        return helperFunction1114(_0x973b47, _0x19f379- -331);
      }const _0x1b8be9= {
        ..._0x1319b0, ..._0x366977
      }, _0x10fdd2=_0x1b8be9;
      function helperFunction1100(_0x5c8f2a, _0x1ff72f) {
        return helperFunction1114(_0x1ff72f, _0x5c8f2a-0x2e0);
      }if(!((helperFunction1088)((_0x6e8cd)))) {
        return[];
      }try {
        const _0x26cfa7=((_0x2a943a)(("git"), (["show", _0x6e8cd+':'+_0x336ee0]), ({
          'cwd':_0x10fdd2["cwd"], 'encoding':"utf8", 'stdio':["pipe", "pipe", "pipe"]
        }))), _0x504f13=[];
        for(const _0x2f7274 of items57) {
          {
            const _0x1d5ac5=new RegExp(_0x2f7274["source"], _0x2f7274["flags"]);
            let _0x22c6fa;
            while(((_0x22c6fa=_0x1d5ac5["exec"](_0x26cfa7))!==(null))) {
              {
                if(_0x22c6fa[1]["includes"](',')) {
                  const _0x52742f=_0x22c6fa[1]["split"](',')["map"](_0x4fb835=>_0x4fb835["trim"]()["split"](/\s+as\s+/)[0]["trim"]());
                  items64["push"](..._0x52742f["filter"](_0x2878dc=>_0x2878dc&&/^\w+$/["test"](_0x2878dc)));
                } else {
                  items64["push"](_0x22c6fa[1]);
                }
              }
            }
          }
        }return[...new Set(items64)];
      } catch {
        return[];
      }
    }function helperFunction1104(_0x2f2dd0, _0xadce63) {
      
      function helperFunction1102(_0x508bc5, _0xff9b4e) {
        return helperFunction1114(_0xff9b4e, _0x508bc5- -775);
      }function helperFunction1103(_0x56044e, _0x49ec14) {
        return helperFunction1114(_0x49ec14, _0x56044e- -498);
      }if((true)) {
        const _0x35d7c9=_0x2f2dd0["split"]('.')["map"](Number), _0x1ea7f2=_0xadce63["split"]('.')["map"](Number);
        for(let _0x19e1c5=0;
        ((_0x19e1c5)<(3));
        _0x19e1c5++) {
          const _0x5ecf44=_0x35d7c9[_0x19e1c5]||0, _0x276337=_0x1ea7f2[_0x19e1c5]||0;
          if(((_0x5ecf44)<(_0x276337)))return-1;
          if(((_0x5ecf44)>(_0x276337)))return 1;
        }return0;
      } else {
        const _0x1c9f92= {
        };
        return _0x1c9f92["ran"]=false, _0x1c9f92["reason"]=ICCKHo["QxbdZ"], _0x1c9f92;
      }
    }function helperFunction1109(_0x11cf2a, _0x3767c9= {
    }) {
      
      function helperFunction1105(_0x4558ac, _0x348f6b) {
        return helperFunction1114(_0x4558ac, _0x348f6b- -457);
      }
      function helperFunction1108(_0x5c1389, _0x3527c1) {
        return helperFunction1114(_0x5c1389, _0x3527c1- -635);
      }{
        const _0x5aca06= {
          ..._0x1319b0, ..._0x3767c9
        },
        _0x17b506=_0x5aca06, _0x5739fa=_0x17b506["cwd"], _0x5e01ab=pathModule14["join"](cwd5, "CHANGELOG.md");
        if(!fsModule14["existsSync"](_0x5e01ab)) {
          const _0x1a05f4= {
          };
          return _0x1a05f4["exists"]=false, _0x1a05f4;
        }let _0x10c90d;
        try {
          _0x10c90d=fsModule14["readFileSync"](_0x5e01ab, "utf8");
        } catch {
          {
            const _0x2aec76= {
            };
            return _0x2aec76["exists"]=false, _0x2aec76["error"]="Could not read CHANGELOG.md", _0x2aec76;
          }
        }const _0x119cc3=_0x10c90d["includes"]("## [Unreleased]");
        let _0xe639d3=[];
        try {
          const _0xc72c2b=((_0x2a943a)(("git"), (["log", "--oneline", "-10", "HEAD"]), ({
            'cwd':cwd5, 'encoding':"utf8", 'stdio':["pipe", "pipe", "pipe"]
          })));
          _0xe639d3=_0xc72c2b["trim"]()["split"]('\x0a');
        } catch {
        }const _0x42a469=[], _0x2711fb=[];
        for(const _0x51069a of items65) {
          {
            if(!_0x51069a)continue;
            const _0x4ba7de=_0x51069a["substring"](8);
            if(_0x10c90d["includes"](_0x4ba7de)||_0x10c90d["includes"](_0x51069a["substring"](0, 7)))items66["push"](_0x4ba7de);
            else  _0x4ba7de["match"](/^(feat|fix|breaking)/i)&&items67["push"](_0x4ba7de);
          }
        }return {
          'exists':true, 'hasUnreleased':_0x119cc3, 'documented':items66, 'undocumented':items67, 'suggestion':((items67["length"])>(0))?items67["length"]+(" commits may need CHANGELOG entries"):null
        };
      }
    }function helperFunction1112(_0x476c52= {
    }) {
      const _0x56df31= {
        ..._0x1319b0, ..._0x476c52
      };
      function helperFunction1110(_0x2906cd, _0x36528a) {
        return helperFunction1113(_0x2906cd, _0x36528a- -1029);
      }const _0x12dce7=_0x56df31;
      function helperFunction1111(_0x3e6da3, _0x34339e) {
        return helperFunction1113(_0x34339e, _0x3e6da3- -327);
      }const _0x77b0d6=_0x12dce7["changedFiles"]||[], _0x2cd840=((helperFunction1054)((_0x12dce7)));
      return {
        'relatedDocs':((helperFunction1068)((_0x77b0d6), (_0x12dce7))), 'changelog':((helperFunction1109)((_0x77b0d6), (_0x12dce7))), 'markdownFiles':((helperFunction1074)((_0x12dce7["cwd"]))), 'repoMap': {
          'available':_0x2cd840["available"], 'fallbackReason':_0x2cd840["fallbackReason"], 'stats':_0x2cd840["map"]? {
            'files':Object["keys"](_0x2cd840["map"]["files"]|| {
            })["length"], 'symbols':_0x2cd840["map"]["stats"]?.["totalSymbols"]||0
          }:null
        },
        'undocumentedExports':_0x2cd840["available"]?((helperFunction1062)((_0x77b0d6), ({
          ..._0x12dce7, 'repoMapStatus':_0x2cd840
        }))):[]
      };
    }const _0x5a2fc7= {
    };
    _0x5a2fc7["DEFAULT_OPTIONS"]=_0x1319b0, _0x5a2fc7["findRelatedDocs"]=helperFunction1068, _0x5a2fc7["findMarkdownFiles"]=helperFunction1074, _0x5a2fc7["analyzeDocIssues"]=helperFunction1080, _0x5a2fc7["checkChangelog"]=helperFunction1109, _0x5a2fc7["getExportsFromGit"]=helperFunction1101, _0x5a2fc7["compareVersions"]=helperFunction1104, _0x5a2fc7["findLineNumber"]=helperFunction1083;
    function helperFunction1113(_0x5c8760, _0x44623f) {
      return _0x3f8685(_0x44623f-0x3c, _0x5c8760);
    }_0x5a2fc7["collect"]=helperFunction1112, _0x5a2fc7["ensureRepoMap"]=helperFunction1051, _0x5a2fc7["ensureRepoMapSync"]=helperFunction1054, _0x5a2fc7["getExportsFromRepoMap"]=helperFunction1057, _0x5a2fc7["findUndocumentedExports"]=helperFunction1062, _0x5a2fc7["isInternalExport"]=helperFunction1038, _0x5a2fc7["isEntryPoint"]=helperFunction1045, _0x5a2fc7["escapeRegex"]=helperFunction1035, _0x5a2fc7["getRepoMapLoadError"]=helperFunction1032;
    function helperFunction1114(_0x58f1db, _0x3a288a) {
      return _0x3f8685(_0x3a288a- -740, _0x58f1db);
    }_0x5e87bb["exports"]=_0x5a2fc7;
  }
}), require_git=__commonJS({
  '../work/agent-sh__agentsys/lib/collectors/git.js'(_0x2c4b55, _0x212c6b) {
    'use strict';
    
    function helperFunction1115(_0x16097e, _0x28e6c9) {
      return _0x3f8685(_0x28e6c9-0x96, _0x16097e);
    }var _0x328312=((require_binary)()), _0x128537= {
      'top':0x14, 'adjustForAi':false, 'cwd':process["cwd"]()
    };
    function helperFunction1118(_0x320aed= {
    }) {
      const _0x43d957= {
        ..._0x128537, ..._0x320aed
      };
      function helperFunction1116(_0xee76dd, _0x280768) {
        return helperFunction1115(_0x280768, _0xee76dd- -1484);
      }const _0x4ddbfa=_0x43d957, _0x4382f8=_0x4ddbfa["cwd"]||process["cwd"]();
      try {
        _0x328312["ensureBinarySync"]();
      } catch(_0x53d8b6) {
        const _0x345f49= {
        };
        return _0x345f49["available"]=false, _0x345f49["error"]="Binary not available: "+_0x53d8b6["message"], _0x345f49;
      }let _0x17b5cc;
      try {
        const _0x438d07=_0x328312["runAnalyzer"](["repo-intel", "init", _0x4382f8]);
        _0x17b5cc=JSON["parse"](_0x438d07);
      } catch(_0x3fb7d2) {
        {
          const _0x35fa88= {
          };
          return _0x35fa88["available"]=false, _0x35fa88["error"]="Git analysis failed: "+_0x3fb7d2["message"], _0x35fa88;
        }
      }const _0x24317b=_0x17b5cc["fileActivity"]|| {
      },
      _0x3a28e6=_0x17b5cc["contributors"]|| {
      },
      _0x3ed2e7=_0x17b5cc["aiAttribution"]|| {
      },
      _0xd7079e=_0x17b5cc["conventions"]|| {
      },
      _0x10069a=_0x17b5cc["releases"]|| {
      },
      _0x8b7dcc=Object["entries"](_0x24317b)["map"](([_0xd9476c, _0x270c95])=>({
        'path':_0xd9476c, 'changes':_0x270c95["totalChanges"]||0, 'recentChanges':_0x270c95["recentChanges"]||0, 'authors':_0x270c95["authors"]?Object["keys"](_0x270c95["authors"])["length"]:0, 'lastChanged':_0x270c95["lastChanged"]||null
      }))["sort"]((_0x41ed9a, _0x2766b0)=>_0x2766b0["changes"]-_0x41ed9a["changes"])["slice"](0, _0x4ddbfa["top"]), _0x227da7=_0x3a28e6["humans"]|| {
      },
      _0x16ad7a=Object["entries"](_0x227da7)["map"](([_0x4865c6, _0x226db4])=>({
        'name':_0x4865c6, 'commits':_0x226db4["commitCount"]||0, 'firstSeen':_0x226db4["firstSeen"]||null, 'lastSeen':_0x226db4["lastSeen"]||null
      }))["sort"]((_0x758958, _0x322938)=>_0x322938["commits"]-_0x758958["commits"]), _0x4d160d=_0x16ad7a["reduce"]((_0x4ac2d7, _0x1b18a2)=>_0x4ac2d7+_0x1b18a2["commits"], 0);
      let _0xb31f6b=0, _0x30667b=0;
      for(const _0x5249e2 of _0x16ad7a) {
        _0xb31f6b+=_0x5249e2["commits"], _0x30667b++;
        if(((_0xb31f6b)>=(_0x4d160d*0.8)))break;
      }const _0x3e1b11=((_0x3ed2e7["attributed"]||0)+(_0x3ed2e7["heuristic"]||0)), _0x468ed2=_0x17b5cc["git"]?.["totalCommitsAnalyzed"]||_0x4d160d, _0x288b3c=((_0x468ed2)>(0))?((_0x3e1b11)/(_0x468ed2)):0;
      function helperFunction1117(_0xd2ba5d, _0x409ee4) {
        return helperFunction1115(_0xd2ba5d, _0x409ee4- -947);
      }const _0x29ab23= {
      };
      return _0x29ab23["style"]=_0xd7079e["style"]||null, _0x29ab23["prefixes"]=_0xd7079e["prefixes"]|| {
      },
      _0x29ab23["usesScopes"]=_0xd7079e["usesScopes"]||false, {
        'available':true, 'health': {
          'active':((_0x16ad7a["length"])>(0)), 'busFactor':_0x30667b, 'aiRatio':((Math["round"](((_0x288b3c)*(100))))/(100)), 'totalCommits':_0x468ed2, 'totalContributors':_0x16ad7a["length"]
        },
        'hotspots':_0x8b7dcc, 'contributors':_0x16ad7a["slice"](0, 10), 'aiAttribution': {
          'ratio':((Math["round"](((_0x288b3c)*(100))))/(100)), 'attributed':_0x3ed2e7["attributed"]||0, 'heuristic':_0x3ed2e7["heuristic"]||0, 'none':_0x3ed2e7["none"]||0, 'confidence':_0x3ed2e7["confidence"]||"low", 'tools':_0x3ed2e7["tools"]|| {
          }
        },
        'busFactor':_0x30667b, 'conventions':_0x29ab23, 'releaseInfo': {
          'tagCount':_0x10069a["tags"]?_0x10069a["tags"]["length"]:0, 'lastRelease':_0x10069a["tags"]&&((_0x10069a["tags"]["length"])>(0))?_0x10069a["tags"][((_0x10069a["tags"]["length"])-(1))]:null, 'cadence':_0x10069a["cadence"]||null
        }
      };
    }const _0x3815c8= {
    };
    _0x3815c8["collectGitData"]=helperFunction1118, _0x3815c8["DEFAULT_OPTIONS"]=_0x128537;
    function helperFunction1119(_0x196ea4, _0x264364) {
      return _0x3f8685(_0x264364- -1017, _0x196ea4);
    }_0x212c6b["exports"]=_0x3815c8;
  }
}), require_analyzer_queries=__commonJS({
  '../work/agent-sh__agentsys/lib/collectors/analyzer-queries.js'(_0x5da6d0, _0x38c73e) {
    'use strict';
    
    var _0x28ed3d=require('fs'), _0x37db40=require("path");
    function helperFunction1120(_0x124b94, _0x5ef607) {
      return _0x3f8685(_0x124b94- -1585, _0x5ef607);
    }function helperFunction1121(_0x1fd484, _0x50bd3d) {
      return _0x3f8685(_0x50bd3d- -1386, _0x1fd484);
    }var _0x5afc50= {
      'cwd':process["cwd"]()
    },
    _0x39b281=[/(^|\/)versioned_docs\//, /(^|\/)versioned_sidebars\//, /(^|\/)tests\/fixtures\//, /(^|\/)__fixtures__\//, /(^|\/)generated\//, /\.generated\.md$/, /(^|\/)CHANGELOG\.md$/i, /(^|\/)node_modules\//, /(^|\/)target\//, /(^|\/)dist\//, /(^|\/)build\//];
    function helperFunction1124(_0x599ced) {
      
      function helperFunction1122(_0x4e1de2, _0x22c7a9) {
        return helperFunction1120(_0x4e1de2- -88, _0x22c7a9);
      }function helperFunction1123(_0x31c4de, _0x301fab) {
        return helperFunction1120(_0x301fab-0x646, _0x31c4de);
      }{
        for(const _0x362b5d of[".claude", ".opencode", ".codex"]) {
          {
            if(fsModule15["existsSync"](pathModule15["join"](_0x599ced, _0x362b5d)))return _0x362b5d;
          }
        }return ".claude";
      }
    }function helperFunction1127(_0x5a03e7) {
      
      function helperFunction1125(_0x3c6092, _0x5b1fdb) {
        return helperFunction1120(_0x5b1fdb- -111, _0x3c6092);
      }function helperFunction1126(_0x2396fd, _0x3188b9) {
        return helperFunction1120(_0x3188b9-0x386, _0x2396fd);
      }if((false)) {
        const _0x462f51=_0x480c29["split"]('.')["map"](_0x488379), _0x2bc54d=_0xc6bab8["split"]('.')["map"](_0x2d046e);
        for(let _0x10d509=0;
        pKwdti["PlEJF"](_0x10d509, 3);
        _0x10d509++) {
          const _0x409909=_0x462f51[_0x10d509]||0, _0x922811=_0x2bc54d[_0x10d509]||0;
          if(pKwdti["PlEJF"](_0x409909, _0x922811))return-1;
          if(pKwdti["ZwcWD"](_0x409909, _0x922811))return1;
        }return7731+-9109+0x562;
      } else  return pathModule15["join"](_0x5a03e7, helperFunction1124(_0x5a03e7), "repo-intel.json");
    }function helperFunction1133() {
      
      function helperFunction1131(_0x4e6b4d, _0x499de1) {
        return helperFunction1120(_0x4e6b4d-1454, _0x499de1);
      }function helperFunction1132(_0x4fcb4d, _0x5b8b70) {
        return helperFunction1120(_0x4fcb4d-0x3c1, _0x5b8b70);
      }{
        try {
          {
            const {
              binary:_0x474011
            }=((require)(("../agentsys")))["get"]();
            if(_0x474011)return _0x474011;
          }
        } catch {
        }try {
          return ((require_binary)());
        } catch {
          return null;
        }
      }
    }function helperFunction1136(_0xf855bc, _0x43bb9b) {
      
      function helperFunction1134(_0x301264, _0x13506f) {
        return helperFunction1120(_0x301264-0x49e, _0x13506f);
      }function helperFunction1135(_0x35c5db, _0x549b22) {
        return helperFunction1120(_0x549b22-0x5f2, _0x35c5db);
      }try {
        {
          const _0x105750=_0xf855bc["runAnalyzer"](_0x43bb9b);
          return JSON["parse"](_0x105750);
        }
      } catch {
        returnnull;
      }
    }function helperFunction1139(_0xd13a75) {
      function helperFunction1137(_0x32f166, _0x5a9316) {
        return helperFunction1120(_0x32f166-0x1b5, _0x5a9316);
      }function helperFunction1138(_0x4be40d, _0x1c4f83) {
        return helperFunction1120(_0x4be40d-0x4c6, _0x1c4f83);
      }return ((_0xd13a75)||(''))["replace"](/\\/g, '/');
    }function helperFunction1141(_0x26b075) {
      function helperFunction1140(_0x54008a, _0x1dba90) {
        return helperFunction1121(_0x54008a, _0x1dba90-37);
      }return Array["isArray"](_0x26b075)?_0x26b075:[];
    }function helperFunction1158(_0x2f634b= {
    }) {
      const _0x1d8724= {
        'jbVRO':"agent-analyzer", 'skakE':function(_0x68ae, _0x56dff3, _0x456f11) {
          function helperFunction1142(_0x6a3e21, _0x216de8) {
            return helperFunction1157(_0x6a3e21, _0x216de8- -548);
          }return ((_0x68ae)((_0x56dff3), (_0x456f11)));
        },
        'QjFzx':function(_0x304164, _0x2b9090) {
          function helperFunction1143(_0x3352c7, _0x48f6b0) {
            return helperFunction1157(_0x3352c7, _0x48f6b0-0xcb);
          }return ((_0x304164)===(_0x2b9090));
        },
        'UnSyP':function(_0x289f6c, _0x59248a) {
          function helperFunction1144(_0x523abf, _0x56ab0e) {
            return helperFunction1157(_0x56ab0e, _0x523abf-0x325);
          }return ((_0x289f6c)!==(_0x59248a));
        },
        'tJVVk':"KpVBj", 'LMQZR':function(_0x17df4f, _0x1843b7) {
          function helperFunction1145(_0x1b90a4, _0x10518e) {
            return helperFunction1157(_0x1b90a4, _0x10518e- -177);
          }return ((_0x17df4f)((_0x1843b7)));
        },
        'GBhNw':function(_0x767ae7, _0x93adbf, _0x94adda) {
          function helperFunction1146(_0x5737bf, _0x4e33a4) {
            return helperFunction1157(_0x4e33a4, _0x5737bf- -570);
          }return ((_0x767ae7)((_0x93adbf), (_0x94adda)));
        },
        'KzucZ':function(_0xccb695) {
          function helperFunction1147(_0x7418e4, _0x5f398a) {
            return helperFunction1156(_0x7418e4, _0x5f398a- -1536);
          }return ((_0xccb695)());
        },
        'aoaIa':"--version", 'dILvQ':"utf8", 'BqJqI':"pipe", 'LtEjO':"EFBIG", 'ITqlH':function(_0x2cea18, _0x16785b) {
          function helperFunction1148(_0xe2594a, _0x14d717) {
            return helperFunction1156(_0x14d717, _0xe2594a- -357);
          }return ((_0x2cea18)===(_0x16785b));
        },
        'rRIRY':"CCShH", 'IBWJQ':function(_0x169d13, _0x411967, _0x5c7fd0) {
          function helperFunction1149(_0x44b92e, _0x272d21) {
            return helperFunction1156(_0x272d21, _0x44b92e-337);
          }return ((_0x169d13)((_0x411967), (_0x5c7fd0)));
        },
        'QUdkI':"areaOf: file", 'POiyz':function(_0x2b0d2b, _0x18f769, _0x5214c5, _0x266497) {
          
          function helperFunction1150(_0x347932, _0x486a00) {
            return helperFunction1156(_0x347932, _0x486a00- -405);
          }return ((_0x2b0d2b)((_0x18f769), (_0x5214c5), (_0x266497)));
        },
        'ZOAQB':"area-of"
      }, _0x3abd4c= {
        ..._0x5afc50, ..._0x2f634b
      }, _0x3bb385=_0x3abd4c, _0x324e1f=_0x3bb385["cwd"], _0x368617=((helperFunction1127)((cwd6))), _0x43b277= {
      };
      _0x43b277["available"]=false, _0x43b277["reason"]=null, _0x43b277["queryErrors"]=[], _0x43b277["mapFile"]=_0x368617, _0x43b277["staleDocs"]=null, _0x43b277["staleDocsByKey"]=null, _0x43b277["staleDocsByDoc"]=null, _0x43b277["docDrift"]=null, _0x43b277["docDriftAll"]=null, _0x43b277["entryPoints"]=null, _0x43b277["entryPointSet"]=null, _0x43b277["entryPointSymbols"]=null, _0x43b277["slopFixes"]=null, _0x43b277["orphanExports"]=null, _0x43b277["passthroughWrappers"]=null, _0x43b277["alwaysTrueConditions"]=null, _0x43b277["commentedOutCode"]=null, _0x43b277["staleSuppressions"]=null;
      const _0x31890d=_0x43b277, _0x28b5e5=((helperFunction1133)());
      if(!_0x28b5e5) {
        {
          const _0x1d7015= {
            ..._0x31890d
          };
          return _0x1d7015["reason"]="analyzer-binary-unavailable", _0x1d7015;
        }
      }if(!fsModule15["existsSync"](_0x368617)) {
        {
          const _0xa6bfbb= {
            ..._0x31890d
          };
          return _0xa6bfbb["reason"]="repo-intel-map-missing", _0xa6bfbb;
        }
      }const _0x143b91=_0x3bb385["staleDocsTop"]??500, _0x5c1763=_0x3bb385["docDriftTop"]??50, _0x1b8b01=[], helperFunction1153=(_0x24f709, _0x2a7439)=> {
        const _0xd61520= {
        };
        function helperFunction1151(_0x441077, _0x48253c) {
          return helperFunction1157(_0x48253c, _0x441077-0xbe);
        }_0xd61520["eGXmf"]="agent-analyzer";
        function helperFunction1152(_0x1eb37b, _0x277a01) {
          return helperFunction1157(_0x277a01, _0x1eb37b-0x1f9);
        }const _0x457aa4=_0x1d8724["skakE"](helperFunction1136, _0x28b5e5, _0x2a7439);
        if(_0x1d8724["QjFzx"](_0x457aa4, null)) {
          if(_0x1d8724["UnSyP"]("KpVBj", "KpVBj")) {
            const _0x288366= {
            };
            return _0x288366["found"]=false, _0x288366["error"]=_0x408fe7["message"], _0x288366["tool"]=EWFdrc["eGXmf"], _0x288366;
          } else  items69["push"](_0x24f709);
        }return _0x457aa4;
      },
      _0x5826b5=((helperFunction1141)(((helperFunction1153)(("stale-docs"), (["repo-intel", "query", "stale-docs", "--top", ((String)((_0x143b91))), "--map-file", _0x368617, cwd6]))))), _0x4c9043=((helperFunction1141)(((helperFunction1153)(("doc-drift"), (["repo-intel", "query", "doc-drift", "--top", ((String)((_0x5c1763))), "--map-file", _0x368617, cwd6]))))), _0x1bd93d=((helperFunction1141)(((helperFunction1153)(("entry-points"), (["repo-intel", "query", "entry-points", "--map-file", _0x368617, cwd6]))))), _0x2a8007=((helperFunction1153)(("slop-fixes"), (["repo-intel", "query", "slop-fixes", "--map-file", _0x368617, cwd6]))), _0x188c6d=Array["isArray"](_0x2a8007)?_0x2a8007:((helperFunction1141)((_0x2a8007?.["fixes"]))), _0x491a6c=new Map(), _0x6f71fb=new Map();
      for(const _0x399101 of _0x5826b5) {
        {
          const _0x4a9872=((helperFunction1139)((_0x399101["doc"])));
          _0x399101["doc"]=_0x4a9872;
          const _0x268dd6=_0x4a9872+':'+_0x399101["line"]+':'+_0x399101["reference"];
          lookup2["set"](_0x268dd6, _0x399101), !lookup3["has"](_0x4a9872)&&(lookup3["set"](_0x4a9872, [])), lookup3["get"](_0x4a9872)["push"](_0x399101);
        }
      }const _0xaeeef5=new Set(), _0x255b9f=new Set();
      for(const _0xe44053 of _0x1bd93d) {
        {
          const _0xbf1fbf=((helperFunction1139)((_0xe44053["path"])));
          if(_0xbf1fbf)items70["add"](_0xbf1fbf);
          _0xe44053["name"]&&_0xbf1fbf&&(items71["add"](_0xbf1fbf+':'+_0xe44053["name"]));
        }
      }const _0x5b0ffe=_0x3bb385["docDriftIgnore"]||items68, _0x457773=_0x4c9043["filter"](_0x14ade5=> {
        function helperFunction1154(_0x1363dc, _0xac0230) {
          return helperFunction1156(_0xac0230, _0x1363dc- -700);
        }function helperFunction1155(_0x11b3d3, _0x188e0d) {
          return helperFunction1156(_0x11b3d3, _0x188e0d-0x124);
        }if(_0x1d8724["ITqlH"]("CCShH", "CCShH")) {
          const _0x555936=_0x1d8724["LMQZR"](helperFunction1139, _0x14ade5["path"]);
          return!_0x5b0ffe["some"](_0x25c746=>_0x25c746["test"](_0x555936));
        } else {
          const _0x4c6317=new _0x50c0fc("File too large: "+_0x100677["size"]+" > "+_0x56ae29+" bytes");
          _0x4c6317["code"]=Ncsudn["LtEjO"];
          throw _0x4c6317;
        }
      }), _0x4f07f5= {
      };
      _0x4f07f5["orphan-export"]="orphanExports", _0x4f07f5["passthrough-wrapper"]="passthroughWrappers", _0x4f07f5["always-true-condition"]="alwaysTrueConditions", _0x4f07f5["commented-out-code"]="commentedOutCode", _0x4f07f5["stale-suppression"]="staleSuppressions";
      const _0x2d2139=_0x4f07f5, _0x1f131e=[], _0x3fdbd0=[], _0x2cbb12=[], _0x58f3fd=[], _0x3610a5=[];
      function helperFunction1156(_0x4128e7, _0x50e5f3) {
        return helperFunction1121(_0x4128e7, _0x50e5f3-0x46e);
      }const _0x55bf8d= {
      };
      _0x55bf8d["orphanExports"]=items72, _0x55bf8d["passthroughWrappers"]=items73, _0x55bf8d["alwaysTrueConditions"]=items74, _0x55bf8d["commentedOutCode"]=items75;
      function helperFunction1157(_0x27c959, _0x5b0e70) {
        return helperFunction1121(_0x27c959, _0x5b0e70-0x173);
      }_0x55bf8d["staleSuppressions"]=items76;
      const _0x2d36b2=_0x55bf8d;
      for(const _0x3d817a of _0x188c6d) {
        {
          const _0x2cb29b=_0x2d2139[_0x3d817a["category"]];
          if(_0x2cb29b)_0x2d36b2[_0x2cb29b]["push"](_0x3d817a);
        }
      }const _0x3a110a=((items69["length"])<(4)), _0x598f39= {
      };
      return _0x598f39["available"]=_0x3a110a, _0x598f39["reason"]=_0x3a110a?null:"all-queries-failed", _0x598f39["queryErrors"]=items69, _0x598f39["mapFile"]=_0x368617, _0x598f39["staleDocs"]=_0x5826b5, _0x598f39["staleDocsByKey"]=lookup2, _0x598f39["staleDocsByDoc"]=lookup3, _0x598f39["docDrift"]=_0x457773, _0x598f39["docDriftAll"]=_0x4c9043, _0x598f39["entryPoints"]=_0x1bd93d, _0x598f39["entryPointSet"]=items70, _0x598f39["entryPointSymbols"]=items71, _0x598f39["slopFixes"]=_0x188c6d, _0x598f39["orphanExports"]=items72, _0x598f39["passthroughWrappers"]=items73, _0x598f39["alwaysTrueConditions"]=items74, _0x598f39["commentedOutCode"]=items75, _0x598f39["staleSuppressions"]=items76, _0x598f39;
    }function helperFunction1161(_0x5228f6, _0x1863fc, _0x365c3e) {
      if(!_0x5228f6?.["entryPointSymbols"])returnfalse;
      const _0x331e0c=((helperFunction1139)((_0x1863fc)));
      function helperFunction1159(_0x308eca, _0x1ef163) {
        return helperFunction1121(_0x308eca, _0x1ef163-0x3fe);
      }function helperFunction1160(_0x5c29fe, _0x598853) {
        return helperFunction1121(_0x5c29fe, _0x598853-0x1f4);
      }return _0x5228f6["entryPointSymbols"]["has"](_0x331e0c+':'+_0x365c3e)||_0x5228f6["entryPointSet"]["has"](_0x331e0c);
    }const _0x5cecd4= {
    };
    _0x5cecd4["DEFAULT_OPTIONS"]=_0x5afc50, _0x5cecd4["DEFAULT_DOC_DRIFT_IGNORE"]=items68, _0x5cecd4["collect"]=helperFunction1158, _0x5cecd4["isEntryPointSymbol"]=helperFunction1161, _0x5cecd4["resolveMapFile"]=helperFunction1127, _0x5cecd4["resolveStateDir"]=helperFunction1124, _0x38c73e["exports"]=_0x5cecd4;
  }
}), github=require_github(), documentation=require_documentation(), codebase=require_codebase(), docsPatterns=require_docs_patterns(), git=require_git(), analyzerQueries=require_analyzer_queries(), DEFAULT_OPTIONS= {
  'collectors':["github", "docs", "code"], 'depth':"thorough", 'cwd':process["cwd"]()
};
function collect(_0x2af305= {
}) {
  const _0x4da5b0= {
    ...DEFAULT_OPTIONS, ..._0x2af305
  }, _0x548b30=_0x4da5b0, _0x1f82b1=Array["isArray"](_0x548b30["collectors"])?_0x548b30["collectors"]:["github","docs","code"], _0x2cddfa= {
    'timestamp':new Date()["toISOString"](), 'options':_0x548b30, 'github':null, 'docs':null, 'code':null, 'docsPatterns':null, 'git':null, 'analyzer':null
  };
  if(_0x1f82b1["includes"]("analyzer")) {
    _0x2cddfa["analyzer"]=analyzerQueries["collect"](_0x548b30), _0x548b30["analyzer"]=null;
  }function helperFunction1162(_0x38d8a2, _0xbbd74a) {
    return _0x543fdb(_0xbbd74a, _0x38d8a2-80);
  }_0x1f82b1["includes"]("github")&&(_0x2cddfa["github"]=github["scanGitHubState"](_0x548b30));
  function helperFunction1163(_0x54f821, _0x128414) {
    return _0x543fdb(_0x128414, _0x54f821- -925);
  }if(_0x1f82b1["includes"]("docs")) {
    _0x2cddfa["docs"]=documentation["analyzeDocumentation"](_0x548b30);
  }return _0x1f82b1["includes"]("code")&&(_0x2cddfa["code"]=codebase["scanCodebase"](_0x548b30)), _0x1f82b1["includes"]("docs-patterns")&&(_0x2cddfa["docsPatterns"]=docsPatterns["collect"](_0x548b30)), _0x1f82b1["includes"]("git")&&(_0x2cddfa["git"]=git["collectGitData"](_0x548b30)), _0x2cddfa;
}function collectAllData(_0x1cf5f7= {
}) {
  
  let _0x483797=["github", "docs", "code"];
  if(_0x1cf5f7["sources"])_0x483797=_0x1cf5f7["sources"];
  else  _0x1cf5f7["collectors"]&&(_0x483797=_0x1cf5f7["collectors"]);
  function helperFunction1164(_0x50f2c0, _0x48be66) {
    return _0x543fdb(_0x48be66, _0x50f2c0- -1662);
  }const _0x70e195= {
    ..._0x1cf5f7
  };
  function helperFunction1165(_0x130897, _0xd96696) {
    return _0x543fdb(_0xd96696, _0x130897- -137);
  }return _0x70e195["collectors"]=items77, ((collect)((_0x70e195)));
}const _0x5aec83= {
};
_0x5aec83["collect"]=collect, _0x5aec83["collectAllData"]=collectAllData, _0x5aec83["github"]=github, _0x5aec83["documentation"]=documentation, _0x5aec83["codebase"]=codebase, _0x5aec83["docsPatterns"]=docsPatterns, _0x5aec83["git"]=git, _0x5aec83["analyzerQueries"]=analyzerQueries, _0x5aec83["scanGitHubState"]=github["scanGitHubState"], _0x5aec83["isGhAvailable"]=github["isGhAvailable"], _0x5aec83["analyzeDocumentation"]=documentation["analyzeDocumentation"], _0x5aec83["scanCodebase"]=codebase["scanCodebase"], _0x5aec83["findRelatedDocs"]=docsPatterns["findRelatedDocs"], _0x5aec83["analyzeDocIssues"]=docsPatterns["analyzeDocIssues"], _0x5aec83["checkChangelog"]=docsPatterns["checkChangelog"];
_0x5aec83["ensureRepoMap"]=docsPatterns["ensureRepoMap"], _0x5aec83["ensureRepoMapSync"]=docsPatterns["ensureRepoMapSync"], _0x5aec83["getExportsFromRepoMap"]=docsPatterns["getExportsFromRepoMap"];
_0x5aec83["findUndocumentedExports"]=docsPatterns["findUndocumentedExports"], _0x5aec83["isInternalExport"]=docsPatterns["isInternalExport"], _0x5aec83["isEntryPoint"]=docsPatterns["isEntryPoint"], _0x5aec83["collectGitData"]=git["collectGitData"], _0x5aec83["DEFAULT_OPTIONS"]=DEFAULT_OPTIONS, module["exports"]=_0x5aec83;
