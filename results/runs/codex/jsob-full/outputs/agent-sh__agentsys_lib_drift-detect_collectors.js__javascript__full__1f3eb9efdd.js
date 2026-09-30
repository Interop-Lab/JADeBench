'use strict';
const __getOwnPropNames = Object.getOwnPropertyNames;
const __commonJS = (callback, module) => function requireModule() {
      if (!module) {
            module = {
             exports: {
      }
    };
            callback[__getOwnPropNames(callback)[0]](module.exports, module);
  }
      return module.exports;
};
var requireGithubCollector=__commonJS({
    '../work/agent-sh__agentsys/lib/collectors/github.js'(exports,module){
        'use strict';
        var {
            execFileSync:execFileSync
    }
        =((require)(("child_process"))),DEFAULT_OPTIONS={
            'issueLimit':100,'prLimit':50,'milestoneLimit':100,'timeout':10000,'cwd':process.cwd()
    };
        function execGh(args,options={
    }){
            {
                const execGhValue1=((runGhCommand)((args),(options)));
                return execGhValue1.ok?execGhValue1.data:null;
      }
    }
        function runGhCommand(args,options={
    }){
            {
                try{
                    const commandOutput=((execFileSync)(('gh'),(args),({
                        'encoding':"utf8",'stdio':"pipe",'timeout':options.timeout||DEFAULT_OPTIONS.timeout,'cwd':options.cwd||DEFAULT_OPTIONS.cwd
          })));
                    try{
                        {
                            return{
                                'ok':true,'data':JSON.parse(commandOutput)
              };
            }
          }
                    catch(error){
                        return{
                            'ok':false,'error':{
                                'type':"parse",'message':"Failed to parse gh output as JSON: "+error.message,'raw':commandOutput.slice((0),(500))
              }
            };
          }
        }
                catch(error){
                    {
                        return{
                            'ok':false,'error':{
                                'type':error.killed?"timeout":"process",'message':error.message,'exitCode':error.status??null,'stderr':error.stderr?((String)((error.stderr))).trim():''
              }
            };
          }
        }
      }
    }
        function isGhAvailable(){
            {
                try{
                    {
                        return ((execFileSync)(('gh'),(["auth","status"]),({
                            'encoding':"utf8",'stdio':"pipe",'timeout':5000
            }))),true;
          }
        }
                catch{
                    return false;
        }
      }
    }
        function summarizeIssue(issue){
            return{
                'number':issue.number,'title':issue.title,'labels':(issue.labels||[]).map(summarizeIssueItem1=>summarizeIssueItem1.name||summarizeIssueItem1),'milestone':issue.milestone?.["title"]||issue.milestone||null,'createdAt':issue.createdAt,'updatedAt':issue.updatedAt,'snippet':issue.body?((issue.body.slice((0),(200)).replace(/\n/g,'\x20').trim())+(((issue.body.length)>(200))?"...":'')):''
      };
    }
        function summarizePR(pullRequest){
            return{
                'number':pullRequest.number,'title':pullRequest.title,'labels':(pullRequest.labels||[]).map(summarizePRItem1=>summarizePRItem1.name||summarizePRItem1),'isDraft':pullRequest.isDraft,'createdAt':pullRequest.createdAt,'updatedAt':pullRequest.updatedAt,'files':pullRequest.files||[],'snippet':pullRequest.body?((pullRequest.body.slice((0),(150)).replace(/\n/g,'\x20').trim())+(((pullRequest.body.length)>(150))?"...":'')):''
      };
    }
        function categorizeIssues(summary,issues){
            const categorizeIssuesItem1={
      };
            categorizeIssuesItem1.bug="bugs",categorizeIssuesItem1["type: bug"]="bugs",categorizeIssuesItem1.feature="features",categorizeIssuesItem1["type: feature"]="features",categorizeIssuesItem1.enhancement="enhancements",categorizeIssuesItem1.security="security",categorizeIssuesItem1["type: security"]="security";
            const categorizeIssuesItem2=categorizeIssuesItem1,categorizeIssuesItem3=Object.entries(categorizeIssuesItem2).map(([categorizeIssuesItem4,categorizeIssuesItem5])=>({
                'regex':new RegExp("(^|[^a-z])"+categorizeIssuesItem4.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+("([^a-z]|$)"),'i'),'category':categorizeIssuesItem5
      }));
            for(const categorizeIssuesValue1 of issues){
                {
                    const categorizeIssuesValue2=(categorizeIssuesValue1.labels||[]).map(categorizeIssuesValue3=>(categorizeIssuesValue3.name||categorizeIssuesValue3).toLowerCase());
                    let categorizeIssuesHelper1=false;
                    const categorizeIssuesItem6={
          };
                    categorizeIssuesItem6.number=categorizeIssuesValue1.number,categorizeIssuesItem6.title=categorizeIssuesValue1.title;
                    const categorizeIssuesResult1=categorizeIssuesItem6;
                    for(const {
                        regex:categorizeIssuesValue4,category:categorizeIssuesValue5
          }
                    of categorizeIssuesItem3){
                        {
                            if(categorizeIssuesValue2.some(categorizeIssuesValue6=>categorizeIssuesValue4.test(categorizeIssuesValue6))){
                                {
                                    summary.categorized[categorizeIssuesValue5].push(categorizeIssuesResult1),categorizeIssuesHelper1=true;
                                    break;
                }
              }
            }
          }
                    if(!categorizeIssuesHelper1){
                        {
                            summary.categorized.other.push(categorizeIssuesResult1);
            }
          }
        }
      }
    }
        function findStaleItems(summary,items,staleDays){
            const findStaleItemsResult1=new Date();
            findStaleItemsResult1.setDate(((findStaleItemsResult1.getDate())-(staleDays)));
            for(const findStaleItemsHelper1 of items){
                {
                    const findStaleItemsResult2=new Date(findStaleItemsHelper1.updatedAt);
                    ((findStaleItemsResult2)<(findStaleItemsResult1))&&summary.stale.push({
                        'number':findStaleItemsHelper1.number,'title':findStaleItemsHelper1.title,'lastUpdated':findStaleItemsHelper1.updatedAt,'daysStale':Math.floor(((((Date.now())-(findStaleItemsResult2)))/(((((((1000)*(60)))*(60)))*(24)))))
          });
        }
      }
    }
        function extractThemes(summary,items){
            const extractThemesItem1={
      };
            const extractThemesResult1=new Set(["the",'a','an','is',"are",'to',"for",'in','on','at',"with","and",'or','of']);
            for(const extractThemesCount1 of items){
                const extractThemesValue1=(extractThemesCount1.title||'').toLowerCase().split(/\s+/);
                for(const extractThemesItem2 of extractThemesValue1){
                    if(((extractThemesItem2.length)>(3))&&!extractThemesResult1.has(extractThemesItem2)){
                        {
                            extractThemesItem1[extractThemesItem2]=((extractThemesItem1[extractThemesItem2]||(0))+(1));
            }
          }
        }
      }
            summary.themes=Object.entries(extractThemesItem1).filter(([,extractThemesHelper1])=>extractThemesHelper1>(1)).sort((extractThemesValue2,extractThemesValue3)=>extractThemesValue3[(1)]-extractThemesValue2[(1)]).slice((0),(10)).map(([extractThemesResult2,extractThemesResult3])=>({
                'word':extractThemesResult2,'count':extractThemesResult3
      }));
    }
        function findOverdueMilestones(summary){
            {
                const findOverdueMilestonesValue1=new Date();
                summary.overdueMilestones=summary.milestones.filter(findOverdueMilestonesValue2=>{
                    const findOverdueMilestonesValue3={
          };
                    findOverdueMilestonesValue3.nGeBt="Refusing to extract archive with empty entry name";
                    const findOverdueMilestonesValue4=findOverdueMilestonesValue3;
                    {
                        if(!findOverdueMilestonesValue2.due_on||((((findOverdueMilestonesValue2.state))===(("closed")))))return false;
                        return ((((new Date(findOverdueMilestonesValue2.due_on)))<((findOverdueMilestonesValue1))));
          }
        });
      }
    }
        function scanGitHubState(options={
    }){
            const scanGitHubStateValue1={
      };
            scanGitHubStateValue1.GkpnC="embedder preference is \"none\" or unset";
            const scanGitHubStateValue2=scanGitHubStateValue1,scanGitHubStateValue3={
                ...DEFAULT_OPTIONS,...options
      },scanGitHubStateItem1=scanGitHubStateValue3,scanGitHubStateError1={
      };
            scanGitHubStateError1.issueCount=0,scanGitHubStateError1.prCount=0,scanGitHubStateError1.milestoneCount=0;
            const scanGitHubStateValue4={
      };
            scanGitHubStateValue4.requestedLimit=scanGitHubStateItem1.issueLimit,scanGitHubStateValue4.fetchedCount=0,scanGitHubStateValue4.hasMore=false;
            const scanGitHubStateValue5={
      };
            scanGitHubStateValue5.requestedLimit=scanGitHubStateItem1.prLimit,scanGitHubStateValue5.fetchedCount=0,scanGitHubStateValue5.hasMore=false;
            const scanGitHubStateValue6={
      };
            scanGitHubStateValue6.requestedLimit=scanGitHubStateItem1.milestoneLimit,scanGitHubStateValue6.fetchedCount=0,scanGitHubStateValue6.hasMore=false;
            const scanGitHubStateError2={
      };
            scanGitHubStateError2.issues=scanGitHubStateValue4,scanGitHubStateError2.prs=scanGitHubStateValue5,scanGitHubStateError2.milestones=scanGitHubStateValue6;
            const scanGitHubStateError3={
      };
            scanGitHubStateError3.bugs=[],scanGitHubStateError3.features=[],scanGitHubStateError3.security=[],scanGitHubStateError3.enhancements=[],scanGitHubStateError3.other=[];
            const scanGitHubStateError4={
      };
            scanGitHubStateError4.available=false,scanGitHubStateError4.partial=false,scanGitHubStateError4.errors=[],scanGitHubStateError4.summary=scanGitHubStateError1,scanGitHubStateError4.issues=[],scanGitHubStateError4.prs=[],scanGitHubStateError4.milestones=[],scanGitHubStateError4.overdueMilestones=[],scanGitHubStateError4.pagination=scanGitHubStateError2,scanGitHubStateError4.categorized=scanGitHubStateError3,scanGitHubStateError4.stale=[],scanGitHubStateError4.themes=[];
            const scanGitHubStateItem2=scanGitHubStateError4;
            if(!((isGhAvailable)())){
                {
                    return scanGitHubStateItem2.error="gh CLI not available or not authenticated",scanGitHubStateItem2;
        }
      }
            scanGitHubStateItem2.available=true;
            const scanGitHubStateItem3=((runGhCommand)((["issue","list","--state","open","--json","number,title,labels,milestone,createdAt,updatedAt,body","--limit",((String)((scanGitHubStateItem1.issueLimit)))]),(scanGitHubStateItem1)));
            if(scanGitHubStateItem3.ok&&Array.isArray(scanGitHubStateItem3.data)){
                const scanGitHubStateItem4=scanGitHubStateItem3.data;
                scanGitHubStateItem2.issues=scanGitHubStateItem4.map(summarizeIssue),scanGitHubStateItem2.summary.issueCount=scanGitHubStateItem4.length,scanGitHubStateItem2.pagination.issues.fetchedCount=scanGitHubStateItem4.length,scanGitHubStateItem2.pagination.issues.hasMore=((scanGitHubStateItem1.issueLimit)>(0))&&((scanGitHubStateItem4.length)>=(scanGitHubStateItem1.issueLimit)),((categorizeIssues)((scanGitHubStateItem2),(scanGitHubStateItem4))),((findStaleItems)((scanGitHubStateItem2),(scanGitHubStateItem4),(90))),((extractThemes)((scanGitHubStateItem2),(scanGitHubStateItem4)));
      }
            else{
                if(!scanGitHubStateItem3.ok){
                    {
                        const scanGitHubStateContent1={
                            'source':"issues",...scanGitHubStateItem3.error
            };
                        scanGitHubStateItem2.errors.push(scanGitHubStateContent1);
          }
        }
      }
            const scanGitHubStateItem5=((runGhCommand)((['pr',"list","--state","open","--json","number,title,labels,isDraft,createdAt,updatedAt,body,files","--limit",((String)((scanGitHubStateItem1.prLimit)))]),(scanGitHubStateItem1)));
            if(scanGitHubStateItem5.ok&&Array.isArray(scanGitHubStateItem5.data)){
                const scanGitHubStateItem6=scanGitHubStateItem5.data;
                scanGitHubStateItem2.prs=scanGitHubStateItem6.map(summarizePR),scanGitHubStateItem2.summary.prCount=scanGitHubStateItem6.length,scanGitHubStateItem2.pagination.prs.fetchedCount=scanGitHubStateItem6.length,scanGitHubStateItem2.pagination.prs.hasMore=((scanGitHubStateItem1.prLimit)>(0))&&((scanGitHubStateItem6.length)>=(scanGitHubStateItem1.prLimit));
      }
            else{
                if(!scanGitHubStateItem5.ok){
                    const scanGitHubStateResult1={
                        'source':"prs",...scanGitHubStateItem5.error
          };
                    scanGitHubStateItem2.errors.push(scanGitHubStateResult1);
        }
      }
            const scanGitHubStateItem7=((runGhCommand)((["api","repos/{owner}/{repo}/milestones","--paginate","--slurp"]),(scanGitHubStateItem1)));
            if(scanGitHubStateItem7.ok&&Array.isArray(scanGitHubStateItem7.data)){
                const scanGitHubStateItem8=scanGitHubStateItem7.data,scanGitHubStateItem9=scanGitHubStateItem8.flatMap(scanGitHubStateItem10=>Array.isArray(scanGitHubStateItem10)?scanGitHubStateItem10:[]),scanGitHubStateResult2=scanGitHubStateItem9.map(scanGitHubStateCount1=>({
                    'title':scanGitHubStateCount1.title,'state':scanGitHubStateCount1.state,'due_on':scanGitHubStateCount1.due_on,'open_issues':scanGitHubStateCount1.open_issues,'closed_issues':scanGitHubStateCount1.closed_issues
        }));
                scanGitHubStateItem2.pagination.milestones.fetchedCount=scanGitHubStateResult2.length,scanGitHubStateItem2.pagination.milestones.hasMore=((scanGitHubStateItem1.milestoneLimit)>(0))&&((scanGitHubStateResult2.length)>(scanGitHubStateItem1.milestoneLimit)),scanGitHubStateItem2.milestones=scanGitHubStateResult2.slice((0),scanGitHubStateItem1.milestoneLimit),scanGitHubStateItem2.summary.milestoneCount=scanGitHubStateItem2.milestones.length,((findOverdueMilestones)((scanGitHubStateItem2)));
      }
            else{
                if(!scanGitHubStateItem7.ok){
                    {
                        const scanGitHubStateError5={
                            'source':"milestones",...scanGitHubStateItem7.error
            };
                        scanGitHubStateItem2.errors.push(scanGitHubStateError5);
          }
        }
      }
            return scanGitHubStateItem2.partial=((scanGitHubStateItem2.errors.length)>(0)),scanGitHubStateItem2.partial&&!scanGitHubStateItem2.error&&((scanGitHubStateItem2.error="Partial GitHub data collected")),scanGitHubStateItem2;
    }
        const scanGitHubStateValue7={
    };
        scanGitHubStateValue7.DEFAULT_OPTIONS=DEFAULT_OPTIONS,scanGitHubStateValue7.scanGitHubState=scanGitHubState,scanGitHubStateValue7.isGhAvailable=isGhAvailable;
        scanGitHubStateValue7.execGh=execGh,scanGitHubStateValue7.summarizeIssue=summarizeIssue,scanGitHubStateValue7.summarizePR=summarizePR,scanGitHubStateValue7.categorizeIssues=categorizeIssues,scanGitHubStateValue7.findStaleItems=findStaleItems,scanGitHubStateValue7.extractThemes=extractThemes,scanGitHubStateValue7.findOverdueMilestones=findOverdueMilestones,module.exports=scanGitHubStateValue7;
  }
}),requireDocumentationCollector=__commonJS({
    '../work/agent-sh__agentsys/lib/collectors/documentation.js'(exports,module){
        'use strict';
        var fs=((require)(('fs'))),scanGitHubStateContent2=((require)(("path"))),DEFAULT_OPTIONS={
            'depth':"thorough",'cwd':process.cwd()
    };
        function isPathSafe(candidatePath,basePath){
            const isPathSafeHelper3=scanGitHubStateContent2.resolve(basePath,candidatePath);
            return isPathSafeHelper3.startsWith(scanGitHubStateContent2.resolve(basePath));
    }
        function safeReadFile(filePath,maxBytes){
            const safeReadFileContent1=scanGitHubStateContent2.resolve(maxBytes,filePath);
            if(!((isPathSafe)((filePath),(maxBytes)))){
                {
                    return null;
        }
      }
            try{
                return fs.readFileSync(safeReadFileContent1,"utf8");
      }
            catch{
                return null;
      }
    }
        function analyzeMarkdownFile(filePath,content){
            {
                const analyzeMarkdownFileContent1=filePath.match(/^##\s{1,1000}(.+)$/gm)||[],analyzeMarkdownFileContent2=analyzeMarkdownFileContent1.slice((0),(10)).map(analyzeMarkdownFileContent3=>analyzeMarkdownFileContent3.replace(/^##\s+/,'')),analyzeMarkdownFileHelper1=analyzeMarkdownFileContent2.map(analyzeMarkdownFileContent4=>analyzeMarkdownFileContent4.toLowerCase()).join('\x20');
                return{
                    'path':content,'sectionCount':analyzeMarkdownFileContent1.length,'sections':analyzeMarkdownFileContent2,'hasInstallation':/install|setup|getting.started/i.test(analyzeMarkdownFileHelper1),'hasUsage':/usage|how.to|example/i.test(analyzeMarkdownFileHelper1),'hasApi':/api|reference|methods/i.test(analyzeMarkdownFileHelper1),'hasTesting':/test|spec|coverage/i.test(analyzeMarkdownFileHelper1),'codeBlocks':Math.floor((((filePath.match(/```/g)||[]).length)/(2))),'wordCount':filePath.split(/\s+/).length
        };
      }
    }
        function extractCheckboxes(extractCheckboxesCount1,extractCheckboxesHelper1){
            {
                const extractCheckboxesCount2=(extractCheckboxesHelper1.match(/^[-*]\s+\[x\]/gim)||[]).length,extractCheckboxesValue1=(extractCheckboxesHelper1.match(/^[-*]\s+\[\s\]/gim)||[]).length;
                extractCheckboxesCount1.checkboxes.checked+=extractCheckboxesCount2,extractCheckboxesCount1.checkboxes.unchecked+=extractCheckboxesValue1,extractCheckboxesCount1.checkboxes.total+=((extractCheckboxesCount2)+(extractCheckboxesValue1));
      }
    }
        function extractFeatures(extractFeaturesHelper1,extractFeaturesValue1){
            {
                const extractFeaturesCount1=/^[-*]\s{1,100}\*{0,2}([^\n]{1,2000}?)\*{0,2}(?:\s{0,100}[-–]\s{0,100}([^\n]{1,2000}))?$/gm;
                let extractFeaturesCount2;
                while(((extractFeaturesCount2=extractFeaturesCount1.exec(extractFeaturesValue1))!==(null))&&((extractFeaturesHelper1.features.length)<(20))){
                    const extractFeaturesHelper2=extractFeaturesCount2[(1)].trim();
                    if(((extractFeaturesHelper2.length)>(5))&&((extractFeaturesHelper2.length)<(80))){
                        {
                            extractFeaturesHelper1.features.push(extractFeaturesHelper2);
            }
          }
        }
                extractFeaturesHelper1.features=[...new Set(extractFeaturesHelper1.features)].slice((0),(20));
      }
    }
        function extractPlans(extractPlansHelper1,extractPlansHelper2){
            const extractPlansValue1=[/(?:TODO|FIXME|PLAN):\s*(.+)/gi,/^##\s+(?:Roadmap|Future|Planned|Coming Soon)/gim];
            for(const extractPlansCount1 of extractPlansValue1){
                let extractPlansItems1;
                while(((extractPlansItems1=extractPlansCount1.exec(extractPlansHelper2))!==(null))&&((extractPlansHelper1.plans.length)<(15))){
                    const extractPlansValue2=(extractPlansItems1[(1)]||extractPlansItems1[(0)]).slice((0),(100));
                    extractPlansHelper1.plans.push(extractPlansValue2);
        }
      }
    }
        function identifyDocGaps(identifyDocGapsValue1){
            {
                const identifyDocGapsValue2=identifyDocGapsValue1.files["README.md"];
                if(!identifyDocGapsValue2){
                    {
                        const identifyDocGapsValue3={
            };
                        identifyDocGapsValue3.type="missing",identifyDocGapsValue3.file="README.md",identifyDocGapsValue3.severity="high",identifyDocGapsValue1.gaps.push(identifyDocGapsValue3);
          }
        }
                else{
                    if(!identifyDocGapsValue2.hasInstallation){
                        {
                            const identifyDocGapsValue4={
              };
                            identifyDocGapsValue4.type="missing-section",identifyDocGapsValue4.file="README.md",identifyDocGapsValue4.section="Installation",identifyDocGapsValue4.severity="medium",identifyDocGapsValue1.gaps.push(identifyDocGapsValue4);
            }
          }
                    if(!identifyDocGapsValue2.hasUsage){
                        {
                            const identifyDocGapsItems1={
              };
                            identifyDocGapsItems1.type="missing-section",identifyDocGapsItems1.file="README.md",identifyDocGapsItems1.section="Usage",identifyDocGapsItems1.severity="medium",identifyDocGapsValue1.gaps.push(identifyDocGapsItems1);
            }
          }
        }
                if(!identifyDocGapsValue1.files["CHANGELOG.md"]){
                    const identifyDocGapsPath1={
          };
                    identifyDocGapsPath1.type="missing",identifyDocGapsPath1.file="CHANGELOG.md",identifyDocGapsPath1.severity="low",identifyDocGapsValue1.gaps.push(identifyDocGapsPath1);
        }
      }
    }
        function analyzeDocumentation(options={
    }){
            const analyzeDocumentationValue1={
                ...DEFAULT_OPTIONS,...options
      },analyzeDocumentationValue2=analyzeDocumentationValue1,analyzeDocumentationResult1=analyzeDocumentationValue2.cwd,analyzeDocumentationResult2={
      };
            analyzeDocumentationResult2.fileCount=0;
            analyzeDocumentationResult2.totalWords=0;
            const analyzeDocumentationItem1={
      };
            analyzeDocumentationItem1.total=0,analyzeDocumentationItem1.checked=0,analyzeDocumentationItem1.unchecked=0;
            const analyzeDocumentationValue3={
      };
            analyzeDocumentationValue3.summary=analyzeDocumentationResult2,analyzeDocumentationValue3.files={
      },analyzeDocumentationValue3.features=[],analyzeDocumentationValue3.plans=[],analyzeDocumentationValue3.checkboxes=analyzeDocumentationItem1,analyzeDocumentationValue3.gaps=[];
            const analyzeDocumentationValue4=analyzeDocumentationValue3,analyzeDocumentationValue5=["README.md","PLAN.md","CLAUDE.md","AGENTS.md","CONTRIBUTING.md","CHANGELOG.md","docs/README.md","docs/PLAN.md"];
            for(const analyzeDocumentationResult3 of analyzeDocumentationValue5){
                {
                    const analyzeDocumentationResult4=((safeReadFile)((analyzeDocumentationResult3),(analyzeDocumentationResult1)));
                    if(analyzeDocumentationResult4){
                        const analyzeDocumentationResult5=((analyzeMarkdownFile)((analyzeDocumentationResult4),(analyzeDocumentationResult3)));
                        analyzeDocumentationValue4.files[analyzeDocumentationResult3]=analyzeDocumentationResult5,analyzeDocumentationValue4.summary.totalWords+=analyzeDocumentationResult5.wordCount,((extractCheckboxes)((analyzeDocumentationValue4),(analyzeDocumentationResult4))),((extractFeatures)((analyzeDocumentationValue4),(analyzeDocumentationResult4))),((extractPlans)((analyzeDocumentationValue4),(analyzeDocumentationResult4)));
          }
        }
      }
            if(((analyzeDocumentationValue2.depth)===("thorough"))){
                {
                    const analyzeDocumentationItem2=scanGitHubStateContent2.join(analyzeDocumentationResult1,"docs");
                    if(fs.existsSync(analyzeDocumentationItem2))try{
                        const analyzeDocumentationValue6=fs.readdirSync(analyzeDocumentationItem2).filter(analyzeDocumentationValue7=>analyzeDocumentationValue7.endsWith(".md")&&!analyzeDocumentationValue5.includes("docs/"+analyzeDocumentationValue7));
                        for(const analyzeDocumentationValue8 of analyzeDocumentationValue6.slice((0),(5))){
                            {
                                const analyzeDocumentationValue9="docs/"+analyzeDocumentationValue8,analyzeDocumentationItems1=((safeReadFile)((analyzeDocumentationValue9),(analyzeDocumentationResult1)));
                                if(analyzeDocumentationItems1){
                                    {
                                        const analyzeDocumentationResult6=((analyzeMarkdownFile)((analyzeDocumentationItems1),(analyzeDocumentationValue9)));
                                        analyzeDocumentationValue4.files[analyzeDocumentationValue9]=analyzeDocumentationResult6,analyzeDocumentationValue4.summary.totalWords+=analyzeDocumentationResult6.wordCount;
                  }
                }
              }
            }
          }
                    catch{
          }
        }
      }
            return analyzeDocumentationValue4.summary.fileCount=Object.keys(analyzeDocumentationValue4.files).length,((identifyDocGaps)((analyzeDocumentationValue4))),analyzeDocumentationValue4;
    }
        const analyzeDocumentationPath1={
    };
        analyzeDocumentationPath1.DEFAULT_OPTIONS=DEFAULT_OPTIONS,analyzeDocumentationPath1.analyzeDocumentation=analyzeDocumentation,analyzeDocumentationPath1.analyzeMarkdownFile=analyzeMarkdownFile,analyzeDocumentationPath1.safeReadFile=safeReadFile,analyzeDocumentationPath1.isPathSafe=isPathSafe,analyzeDocumentationPath1.extractCheckboxes=extractCheckboxes,analyzeDocumentationPath1.extractFeatures=extractFeatures;
        analyzeDocumentationPath1.extractPlans=extractPlans,analyzeDocumentationPath1.identifyDocGaps=identifyDocGaps,module.exports=analyzeDocumentationPath1;
  }
}),require_fs_safe=__commonJS({
    '../work/agent-sh__agentsys/lib/utils/fs-safe.js'(exports,module){
        'use strict';
        var fs=((require)(('fs')));
        function readFileWithLimit(readFileWithLimitValue1,readFileWithLimitError1,readFileWithLimitContent1="utf8"){
            {
                const readFileWithLimitContent2=fs.openSync(readFileWithLimitValue1,'r');
                try{
                    {
                        const readFileWithLimitContent3=fs.fstatSync(readFileWithLimitContent2);
                        if(!readFileWithLimitContent3.isFile()){
                            {
                                const readFileWithLimitError2=new Error("Not a regular file: "+readFileWithLimitValue1);
                                readFileWithLimitError2.code="ENOTFILE";
                                throw readFileWithLimitError2;
              }
            }
                        if(((typeof readFileWithLimitError1)===("number"))&&((readFileWithLimitContent3.size)>(readFileWithLimitError1))){
                            {
                                const readFileWithLimitValue2=new Error("File too large: "+readFileWithLimitContent3.size+" > "+readFileWithLimitError1+" bytes");
                                readFileWithLimitValue2.code="EFBIG";
                                throw readFileWithLimitValue2;
              }
            }
                        return fs.readFileSync(readFileWithLimitContent2,readFileWithLimitContent1);
          }
        }
                finally{
                    {
                        fs.closeSync(readFileWithLimitContent2);
          }
        }
      }
    }
        const readFileWithLimitModule1={
    };
        readFileWithLimitModule1.readFileWithLimit=readFileWithLimit,module.exports=readFileWithLimitModule1;
  }
}),requireCodebaseCollector=__commonJS({
    '../work/agent-sh__agentsys/lib/collectors/codebase.js'(exports,module){
        'use strict';
        var fs=((require)(('fs'))),readFileWithLimitContent4=((require)(("path")));
        var {
            readFileWithLimit:readFileWithLimitCount1
    }
        =((require_fs_safe)()),DEFAULT_OPTIONS={
            'depth':"thorough",'cwd':process.cwd()
    };
        var readFileWithLimitCount2=(50000),EXCLUDE_DIRS=["node_modules","vendor","dist","build","out","target",".git",".svn",".hg","__pycache__",".pytest_cache","coverage",".nyc_output",".next",".nuxt",".cache"];
        const readFileWithLimitHelper1={
    };
        readFileWithLimitHelper1.js=[".js",".jsx",".ts",".tsx",".mjs",".cjs"],readFileWithLimitHelper1.rust=[".rs"],readFileWithLimitHelper1.go=[".go"],readFileWithLimitHelper1.python=[".py"],readFileWithLimitHelper1.java=[".java"];
        var SOURCE_EXTENSIONS=readFileWithLimitHelper1;
        function safeReadFile(safeReadFileValue1,safeReadFileValue2){
            const safeReadFileValue3={
      };
            safeReadFileValue3.LHqFm="no repo-intel map found; run `/repo-intel init` first",safeReadFileValue3.KAufP="custom";
            const safeReadFileValue4=safeReadFileValue3;
            const safeReadFilePath1=readFileWithLimitContent4.resolve(safeReadFileValue2,safeReadFileValue1),safeReadFileContent2=readFileWithLimitContent4.resolve(safeReadFileValue2);
            if(!safeReadFilePath1.startsWith(safeReadFileContent2)){
                {
                    return null;
        }
      }
            try{
                {
                    return fs.readFileSync(safeReadFilePath1,"utf8");
        }
      }
            catch{
                return (null);
      }
    }
        function shouldExclude(filePath,shouldExcludeHelper1=EXCLUDE_DIRS){
            {
                const shouldExcludeValue1=filePath.split(/[\\/]/);
                return shouldExcludeValue1.some(shouldExcludeValue2=>shouldExcludeHelper1.includes(shouldExcludeValue2));
      }
    }
        function detectFrameworks(detectFrameworksHelper1,detectFrameworksValue1){
            {
                const detectFrameworksValue2={
                    ...detectFrameworksValue1.dependencies,...detectFrameworksValue1.devDependencies
        },detectFrameworksValue3=detectFrameworksValue2,detectFrameworksValue4={
        };
                detectFrameworksValue4.react="React",detectFrameworksValue4["react-dom"]="React",detectFrameworksValue4.next="Next.js",detectFrameworksValue4.vue="Vue.js",detectFrameworksValue4.nuxt="Nuxt",detectFrameworksValue4.angular="Angular",detectFrameworksValue4.express="Express",detectFrameworksValue4.fastify="Fastify",detectFrameworksValue4.koa="Koa",detectFrameworksValue4.nestjs="NestJS";
                const detectFrameworksValue5=detectFrameworksValue4;
                for(const [detectFrameworksValue6,detectFrameworksValue7]of Object.entries(detectFrameworksValue5)){
                    {
                        if(detectFrameworksValue3[detectFrameworksValue6]){
                            {
                                detectFrameworksHelper1.frameworks.push(detectFrameworksValue7);
              }
            }
          }
        }
                detectFrameworksHelper1.frameworks=[...new Set(detectFrameworksHelper1.frameworks)];
      }
    }
        function detectTestFramework(detectTestFrameworkValue1,detectTestFrameworkItem1){
            const detectTestFrameworkItem2={
                ...detectTestFrameworkItem1.dependencies,...detectTestFrameworkItem1.devDependencies
      };
            const detectTestFrameworkValue2=detectTestFrameworkItem2;
            const detectTestFrameworkHelper1=["jest","mocha","vitest","ava","tap","jasmine"];
            for(const detectTestFrameworkHelper2 of detectTestFrameworkHelper1){
                if(detectTestFrameworkValue2[detectTestFrameworkHelper2]){
                    detectTestFrameworkValue1.testFramework=detectTestFrameworkHelper2,detectTestFrameworkValue1.health.hasTests=true;
                    break;
        }
      }
    }
        function extractSymbols(extractSymbolsValue1){
            {
                const extractSymbolsValue2={
        };
                extractSymbolsValue2.functions=[],extractSymbolsValue2.classes=[],extractSymbolsValue2.exports=[];
                const extractSymbolsValue3=extractSymbolsValue2,extractSymbolsValue4=/(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
                let extractSymbolsValue5;
                while(((extractSymbolsValue5=extractSymbolsValue4.exec(extractSymbolsValue1))!==(null))){
                    (extractSymbolsValue3.functions.push(extractSymbolsValue5[(1)]));
        }
                const extractSymbolsValue6=/(?:const|let)\s{1,1000}([a-zA-Z_$][a-zA-Z0-9_$]*)\s{0,1000}=\s{0,1000}(?:async\s{0,1000})?\([^)]{0,2000}\)\s{0,1000}=>/g;
                while(((extractSymbolsValue5=extractSymbolsValue6.exec(extractSymbolsValue1))!==(null))){
                    extractSymbolsValue3.functions.push(extractSymbolsValue5[(1)]);
        }
                const extractSymbolsValue7=/class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
                while(((extractSymbolsValue5=extractSymbolsValue7.exec(extractSymbolsValue1))!==(null))){
                    (extractSymbolsValue3.classes.push(extractSymbolsValue5[(1)]));
        }
                const extractSymbolsValue8=/export\s+(?:(?:async\s+)?function|class|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
                while(((extractSymbolsValue5=extractSymbolsValue8.exec(extractSymbolsValue1))!==(null))){
                    extractSymbolsValue3.exports.push(extractSymbolsValue5[(1)]);
        }
                const extractSymbolsItem1=/module\.exports\s{0,1000}=\s{0,1000}\{([^}]{1,100000})\}/,extractSymbolsItem2=extractSymbolsValue1.match(extractSymbolsItem1);
                if(extractSymbolsItem2){
                    {
                        const extractSymbolsValue9=extractSymbolsItem2[(1)].split(',').map(extractSymbolsValue10=>extractSymbolsValue10.trim().split(':')[(0)].trim());
                        extractSymbolsValue3.exports.push(...extractSymbolsValue9.filter(extractSymbolsValue11=>extractSymbolsValue11&&/^[a-zA-Z_$]/.test(extractSymbolsValue11)));
          }
        }
                return extractSymbolsValue3.functions=[...new Set(extractSymbolsValue3.functions)],extractSymbolsValue3.classes=[...new Set(extractSymbolsValue3.classes)],extractSymbolsValue3.exports=[...new Set(extractSymbolsValue3.exports)],extractSymbolsValue3;
      }
    }
        function scanFileSymbols(filePath,options){
            {
                const scanFileSymbolsError1={
        },scanFileSymbolsHelper1=["lib","src","app","pages","components","utils","services","api"],scanFileSymbolsHelper2=options.filter(scanFileSymbolsHelper3=>scanFileSymbolsHelper1.includes(scanFileSymbolsHelper3)),scanFileSymbolsValue1=Object.values(SOURCE_EXTENSIONS).flat();
                let scanFileSymbolsHelper4=(0);
                const scanFileSymbolsHelper5=(40);
                function walkSymbolFiles(directoryPath,relativePath,depth=(0)){
                    {
                        if(((scanFileSymbolsHelper4)>=(scanFileSymbolsHelper5))||((depth)>(2)))return;
                        if(!fs.existsSync(directoryPath))return;
                        try{
                            {
                                const helperItem1={
                };
                                helperItem1.withFileTypes=true;
                                const helperValue6=fs.readdirSync(directoryPath,helperItem1);
                                for(const helperValue7 of helperValue6){
                                    {
                                        if(((scanFileSymbolsHelper4)>=(scanFileSymbolsHelper5)))break;
                                        const helperCount1=readFileWithLimitContent4.join(directoryPath,helperValue7.name),helperValue8=relativePath?relativePath+'/'+helperValue7.name:helperValue7.name;
                                        if(helperValue7.isDirectory()){
                                            {
                                                if(["node_modules","__tests__","test","tests","dist","build"].includes(helperValue7.name))continue;
                                                ((walkSymbolFiles)((helperCount1),(helperValue8),(((depth)+(1)))));
                      }
                    }
                                        else{
                                            if(helperValue7.isFile()){
                                                const helperValue9=readFileWithLimitContent4.extname(helperValue7.name);
                                                if(!scanFileSymbolsValue1.includes(helperValue9))continue;
                                                if(helperValue7.name.includes(".test.")||helperValue7.name.includes(".spec."))continue;
                                                try{
                                                    {
                                                        const helperCount2=((readFileWithLimitCount1)((helperCount1),(readFileWithLimitCount2))),helperCount3=((extractSymbols)((helperCount2)));
                                                        if(helperCount3.functions.length||helperCount3.classes.length||helperCount3.exports.length){
                                                            {
                                                                scanFileSymbolsError1[helperValue8]=helperCount3,scanFileSymbolsHelper4++;
                              }
                            }
                          }
                        }
                                                catch{
                        }
                      }
                    }
                  }
                }
              }
            }
                        catch{
            }
          }
        }
                for(const helperValue10 of scanFileSymbolsHelper2){
                    if(((scanFileSymbolsHelper4)>=(scanFileSymbolsHelper5)))break;
                    ((walkSymbolFiles)((readFileWithLimitContent4.join(filePath,helperValue10)),(helperValue10)));
        }
                return scanFileSymbolsError1;
      }
    }
        function scanDirectory(directory,options,result,scanDirectoryHelper1,scanDirectoryHelper2=(0)){
            const scanDirectoryOptions1={
      };
            scanDirectoryOptions1.POWna="missing",scanDirectoryOptions1.buNnM="README.md",scanDirectoryOptions1.VHFzI="high";
            const scanDirectoryValue1=scanDirectoryOptions1;
            {
                if(((scanDirectoryHelper2)>=(scanDirectoryHelper1)))return;
                const scanDirectoryValue2=readFileWithLimitContent4.join(options,result);
                if(!fs.existsSync(scanDirectoryValue2))return;
                try{
                    {
                        const scanDirectoryItem1={
            };
                        scanDirectoryItem1.withFileTypes=true;
                        const scanDirectoryValue3=fs.readdirSync(scanDirectoryValue2,scanDirectoryItem1),scanDirectoryItem2=[],scanDirectoryCount1=[];
                        for(const scanDirectoryPath1 of scanDirectoryValue3){
                            {
                                scanDirectoryPath1.isDirectory()?(!EXCLUDE_DIRS.includes(scanDirectoryPath1.name)&&scanDirectoryItem2.push(scanDirectoryPath1.name)):(scanDirectoryCount1.push(scanDirectoryPath1.name));
              }
            }
                        const scanDirectoryItem3=((result)||('.')),scanDirectoryItem4={
            };
                        scanDirectoryItem4.dirs=scanDirectoryItem2,scanDirectoryItem4.fileCount=scanDirectoryCount1.length,directory.structure[scanDirectoryItem3]=scanDirectoryItem4;
                        for(const scanDirectoryItem5 of scanDirectoryCount1){
                            const scanDirectoryItem6=readFileWithLimitContent4.extname(scanDirectoryItem5).toLowerCase()||"no-ext";
                            directory.fileStats[scanDirectoryItem6]=((directory.fileStats[scanDirectoryItem6]||(0))+(1));
            }
                        for(const scanDirectoryHelper3 of scanDirectoryItem2){
                            {
                                ((scanDirectory)((directory),(options),(readFileWithLimitContent4.join(result,scanDirectoryHelper3)),(scanDirectoryHelper1),(((scanDirectoryHelper2)+(1)))));
              }
            }
          }
        }
                catch{
        }
      }
    }
        function detectHealth(detectHealthOptions1,detectHealthOptions2){
            detectHealthOptions1.health.hasReadme=fs.existsSync(readFileWithLimitContent4.join(detectHealthOptions2,"README.md"));
            const detectHealthValue1=[".eslintrc",".eslintrc.js",".eslintrc.json","eslint.config.js","biome.json"];
            detectHealthOptions1.health.hasLinting=detectHealthValue1.some(detectHealthValue2=>fs.existsSync(readFileWithLimitContent4.join(detectHealthOptions2,detectHealthValue2)));
            const detectHealthValue3=[".github/workflows",".gitlab-ci.yml",".circleci","Jenkinsfile",".travis.yml"];
            detectHealthOptions1.health.hasCi=detectHealthValue3.some(detectHealthValue4=>fs.existsSync(readFileWithLimitContent4.join(detectHealthOptions2,detectHealthValue4)));
            const detectHealthHelper1=["tests","__tests__","test","spec"];
            detectHealthOptions1.health.hasTests=detectHealthOptions1.health.hasTests||detectHealthHelper1.some(detectHealthValue5=>fs.existsSync(readFileWithLimitContent4.join(detectHealthOptions2,detectHealthValue5)));
    }
        function findImplementedFeatures(findImplementedFeaturesOptions1,findImplementedFeaturesValue1){
            const findImplementedFeaturesResult1={
      };
            findImplementedFeaturesResult1.AdSNL="utf8";
            const findImplementedFeaturesResult2=findImplementedFeaturesResult1,findImplementedFeaturesItem1={
      };
            findImplementedFeaturesItem1.authentication=["auth","login","session","jwt","oauth"],findImplementedFeaturesItem1.api=["routes","controllers","handlers","endpoints"],findImplementedFeaturesItem1.database=["models","schemas","migrations","seeds"],findImplementedFeaturesItem1.ui=["components","views","pages","layouts"],findImplementedFeaturesItem1.testing=["__tests__","test","spec",".test.",".spec."],findImplementedFeaturesItem1.docs=["docs","documentation","wiki"];
            const findImplementedFeaturesItem2=findImplementedFeaturesItem1;
            for(const [findImplementedFeaturesItem3,findImplementedFeaturesItem4]of Object.entries(findImplementedFeaturesItem2)){
                {
                    const findImplementedFeaturesOptions2=findImplementedFeaturesItem4.some(findImplementedFeaturesValue2=>{
                        {
                            for(const findImplementedFeaturesValue3 of Object.keys(findImplementedFeaturesOptions1.structure)){
                                {
                                    if(findImplementedFeaturesValue3.toLowerCase().includes(findImplementedFeaturesValue2))return true;
                }
              }
                            return false;
            }
          });
                    findImplementedFeaturesOptions2&&findImplementedFeaturesOptions1.implementedFeatures.push(findImplementedFeaturesItem3);
        }
      }
    }
        function scanCodebase(options={
    }){
            const scanCodebaseValue1={
                ...DEFAULT_OPTIONS,...options
      },scanCodebaseResult1=scanCodebaseValue1,scanCodebaseParsedResult1=scanCodebaseResult1.cwd,scanCodebaseValue2={
      };
            scanCodebaseValue2.totalDirs=0,scanCodebaseValue2.totalFiles=0;
            const scanCodebaseResult2={
      };
            scanCodebaseResult2.hasTests=false,scanCodebaseResult2.hasLinting=false,scanCodebaseResult2.hasCi=false,scanCodebaseResult2.hasReadme=false;
            const scanCodebaseResult3={
      };
            scanCodebaseResult3.summary=scanCodebaseValue2,scanCodebaseResult3.topLevelDirs=[],scanCodebaseResult3.frameworks=[],scanCodebaseResult3.testFramework=null,scanCodebaseResult3.hasTypeScript=false,scanCodebaseResult3.implementedFeatures=[],scanCodebaseResult3.symbols={
      },scanCodebaseResult3.health=scanCodebaseResult2,scanCodebaseResult3.fileStats={
      };
            const scanCodebaseResult4=scanCodebaseResult3;
            const scanCodebaseParsedResult2={
      },scanCodebaseParsedResult3=((safeReadFile)(("package.json"),(scanCodebaseParsedResult1)));
            if(scanCodebaseParsedResult3){
                {
                    try{
                        {
                            const scanCodebaseOptions1=JSON.parse(scanCodebaseParsedResult3);
                            ((detectFrameworks)((scanCodebaseResult4),(scanCodebaseOptions1))),((detectTestFramework)((scanCodebaseResult4),(scanCodebaseOptions1)));
            }
          }
                    catch{
          }
        }
      }
            scanCodebaseResult4.hasTypeScript=fs.existsSync(readFileWithLimitContent4.join(scanCodebaseParsedResult1,"tsconfig.json"));
            const scanCodebaseResult5={
      };
            scanCodebaseResult5.structure=scanCodebaseParsedResult2,scanCodebaseResult5.fileStats=scanCodebaseResult4.fileStats,((scanDirectory)((scanCodebaseResult5),(scanCodebaseParsedResult1),(''),(((scanCodebaseResult1.depth)===("thorough"))?(3):(2)))),scanCodebaseResult4.summary.totalDirs=Object.keys(scanCodebaseParsedResult2).length,scanCodebaseResult4.summary.totalFiles=Object.values(scanCodebaseParsedResult2).reduce((scanCodebaseValue3,scanCodebaseValue4)=>scanCodebaseValue3+(scanCodebaseValue4.fileCount||(0)),(0));
            const scanCodebaseCount1=scanCodebaseParsedResult2['.'];
            if(scanCodebaseCount1){
                {
                    scanCodebaseResult4.topLevelDirs=scanCodebaseCount1.dirs||[];
        }
      }
            ((detectHealth)((scanCodebaseResult4),(scanCodebaseParsedResult1)));
            if(((scanCodebaseResult1.depth)===("thorough"))){
                {
                    const scanCodebaseItems1={
                        ...scanCodebaseResult4
          };
                    scanCodebaseItems1.structure=scanCodebaseParsedResult2,((findImplementedFeatures)((scanCodebaseItems1),(scanCodebaseParsedResult1))),scanCodebaseResult4.symbols=((scanFileSymbols)((scanCodebaseParsedResult1),(scanCodebaseResult4.topLevelDirs)));
        }
      }
            const scanCodebaseValue5=Object.entries(scanCodebaseResult4.fileStats).sort((scanCodebaseValue6,scanCodebaseValue7)=>scanCodebaseValue7[(1)]-scanCodebaseValue6[(1)]).slice((0),(10));
            return scanCodebaseResult4.fileStats=Object.fromEntries(scanCodebaseValue5),scanCodebaseResult4;
    }
        const scanCodebaseValue8={
    };
        scanCodebaseValue8.DEFAULT_OPTIONS=DEFAULT_OPTIONS,scanCodebaseValue8.EXCLUDE_DIRS=EXCLUDE_DIRS,scanCodebaseValue8.SOURCE_EXTENSIONS=SOURCE_EXTENSIONS,scanCodebaseValue8.scanCodebase=scanCodebase,scanCodebaseValue8.detectFrameworks=detectFrameworks,scanCodebaseValue8.detectTestFramework=detectTestFramework,scanCodebaseValue8.detectHealth=detectHealth,scanCodebaseValue8.findImplementedFeatures=findImplementedFeatures,scanCodebaseValue8.extractSymbols=extractSymbols,scanCodebaseValue8.scanFileSymbols=scanFileSymbols,scanCodebaseValue8.scanDirectory=scanDirectory,scanCodebaseValue8.shouldExclude=shouldExclude,scanCodebaseValue8.safeReadFile=safeReadFile,module.exports=scanCodebaseValue8;
  }
}),requireVersionCollector=__commonJS({
    '../work/agent-sh__agentsys/lib/binary/version.js'(exports,module){
        'use strict';
        const scanCodebaseValue9={
    };
        scanCodebaseValue9.pzzGn="2|0|3|4|1";
        scanCodebaseValue9.BJwRX="0.3.0",scanCodebaseValue9.FrWHl="agent-analyzer",scanCodebaseValue9.qhenZ="agent-sh/agent-analyzer";
        const scanCodebaseValue10=scanCodebaseValue9,scanCodebaseValue11=scanCodebaseValue10.pzzGn.split('|');
        let scanCodebaseValue12=(0);
        'use strict';
        var ANALYZER_MIN_VERSION=scanCodebaseValue10.BJwRX;
        var BINARY_NAME=scanCodebaseValue10.FrWHl;
        var GITHUB_REPO=scanCodebaseValue10.qhenZ;
        const scanCodebaseModule1={
    };
        scanCodebaseModule1.ANALYZER_MIN_VERSION=ANALYZER_MIN_VERSION,scanCodebaseModule1.BINARY_NAME=BINARY_NAME,scanCodebaseModule1.GITHUB_REPO=GITHUB_REPO,module.exports=scanCodebaseModule1;
  }
}),requireBinaryCollector=__commonJS({
    '../work/agent-sh__agentsys/lib/binary/index.js'(exports,module){
        'use strict';
        var fs=((require)(('fs'))),scanCodebaseUtilModule1=((require)(("path"))),scanCodebaseUtilModule2=((require)(('os'))),scanCodebaseUtilModule3=((require)(("https"))),scanCodebaseUtilModule4=((require)(("child_process"))),scanCodebaseUtilModule5=((require)(("crypto"))),{
            promisify:scanCodebaseValue13
    }
        =((require)(("util"))),scanCodebaseModule2=((scanCodebaseValue13)((scanCodebaseUtilModule4.execFile))),scanCodebaseValue14=((((256)*(1024)))*(1024)),{
            ANALYZER_MIN_VERSION:scanCodebaseValue15,BINARY_NAME:scanCodebaseError1,GITHUB_REPO:scanCodebaseValue16
    }
        =((requireVersionCollector)());
        const scanCodebaseHelper1={
    };
        scanCodebaseHelper1["darwin-arm64"]="aarch64-apple-darwin",scanCodebaseHelper1["darwin-x64"]="x86_64-apple-darwin",scanCodebaseHelper1["linux-x64"]="x86_64-unknown-linux-gnu",scanCodebaseHelper1["linux-arm64"]="aarch64-unknown-linux-gnu",scanCodebaseHelper1["win32-x64"]="x86_64-pc-windows-msvc";
        var PLATFORM_MAP=scanCodebaseHelper1;
        function getBinaryPath(){
            const getBinaryPathHelper1=((process.platform)===("win32"))?".exe":'';
            return scanCodebaseUtilModule1.join(scanCodebaseUtilModule2.homedir(),".agent-sh","bin",((scanCodebaseError1)+(getBinaryPathHelper1)));
    }
        function getPlatformKey(){
            {
                const getPlatformKeyValue1=((((process.platform)+('-')))+(process.arch));
                return PLATFORM_MAP[getPlatformKeyValue1]||null;
      }
    }
        function meetsMinimumVersion(meetsMinimumVersionItem1,meetsMinimumVersionValue1){
            {
                if(!meetsMinimumVersionItem1)return false;
                const meetsMinimumVersionItem2=meetsMinimumVersionItem1.match(/^(\d+)\.(\d+)\.(\d+)/);
                if(!meetsMinimumVersionItem2)return false;
                const meetsMinimumVersionPath1=meetsMinimumVersionItem2.slice(1).map(Number),meetsMinimumVersionPath2=meetsMinimumVersionValue1.split('.').map(Number);
                if(((meetsMinimumVersionPath1[(0)])>(meetsMinimumVersionPath2[(0)])))return true;
                if(((meetsMinimumVersionPath1[(0)])<(meetsMinimumVersionPath2[(0)])))return false;
                if(((meetsMinimumVersionPath1[(1)])>(meetsMinimumVersionPath2[(1)])))return true;
                if(((meetsMinimumVersionPath1[(1)])<(meetsMinimumVersionPath2[(1)])))return false;
                return ((meetsMinimumVersionPath1[(2)])>=(meetsMinimumVersionPath2[(2)]));
      }
    }
        function getVersion(){
            {
                const getVersionValue1=((getBinaryPath)());
                if(!fs.existsSync(getVersionValue1))return null;
                try{
                    const getVersionValue2=scanCodebaseUtilModule4.execFileSync(getVersionValue1,["--version"],{
                        'timeout':5000,'encoding':"utf8",'stdio':["pipe","pipe","pipe"],'windowsHide':true
          }),getVersionValue3=getVersionValue2.trim().match(/(\d+\.\d+\.\d+)/);
                    return getVersionValue3?getVersionValue3[(1)]:getVersionValue2.trim();
        }
                catch(error){
                    {
                        return null;
          }
        }
      }
    }
        function isAvailable(){
            {
                const isAvailableValue1=((getBinaryPath)());
                if(!fs.existsSync(isAvailableValue1))return false;
                const isAvailableValue2=((getVersion)());
                return ((meetsMinimumVersion)((isAvailableValue2),(scanCodebaseValue15)));
      }
    }
        async function isAvailableAsync(){
            {
                return ((isAvailable)());
      }
    }
        function buildDownloadUrl(buildDownloadUrlValue1,buildDownloadUrlValue2){
            {
                const buildDownloadUrlHelper1=((process.platform)===("win32"))?".zip":".tar.gz";
                return (((((((((((((((("https://github.com/")+(scanCodebaseValue16)))+("/releases/download/v")))+(buildDownloadUrlValue1)))+('/')))+(scanCodebaseError1)))+('-')))+(buildDownloadUrlValue2)))+(buildDownloadUrlHelper1));
      }
    }
        function downloadFile(url){
            return new Promise(function(helperValue11,helperHelper2){
                const helperValue12=process.env.GITHUB_TOKEN||process.env.GH_TOKEN;
                function response(helperError2,helperError3){
                    {
                        if(((((helperError3))>((5))))){
                            ((((helperHelper2))(((new Error((((("Too many redirects fetching from "))+((url))))))))));
                            return;
            }
                        const helperValue13={
            };
                        helperValue13["User-Agent"]="agent-core/binary-resolver",helperValue13.Accept="application/octet-stream";
                        const helperValue14=helperValue13;
                        if(helperValue12)helperValue14.Authorization=(((("Bearer "))+((helperValue12))));
                        const helperValue15={
            };
                        helperValue15.headers=helperValue14,scanCodebaseUtilModule3.get(helperError2,helperValue15,function(helperError4){
                            const helperValue16=helperError4.statusCode;
                            if(((((((helperValue16)))===(((301))))))||((((((helperValue16)))===(((302))))))||((((((helperValue16)))===(((307))))))||((((((helperValue16)))===(((308))))))){
                                {
                                    helperError4.resume(),((((((response)))((((helperError4.headers.location))),(((((((((helperError3)))+(((1)))))))))))));
                                    return;
                }
              }
                            if(((((((helperValue16)))!==(((200))))))){
                                helperError4.resume();
                                const helperError5=((((((helperValue16)))===(((403))))))?" (rate limited - set GITHUB_TOKEN env var)":'';
                                ((((((helperHelper2)))((((new Error((((((((((((((((((((((((("HTTP ")))+(((helperValue16)))))))))+(((helperError5)))))))))+(((" fetching ")))))))))+(((helperError2))))))))))))));
                                return;
              }
                            const helperHelper3=[];
                            helperError4.on("data",function(helperError6){
                                (((((("wLRMJ")))!==((("vWKlw"))))))?helperHelper3.push(helperError6):helperError7.push(helperError8);
              }),helperError4.on("end",function(){
                                ((((((helperValue11)))((((Buffer.concat(helperHelper3))))))));
              });
                            helperError4.on("error",helperHelper2);
            }).on("error",helperHelper2);
          }
        }
                ((response)((url),(0)));
      });
    }
        function parseSha256Sidecar(parseSha256SidecarContent1){
            if(((typeof parseSha256SidecarContent1)!==("string")))parseSha256SidecarContent1=((String)((((parseSha256SidecarContent1)||('')))));
            const parseSha256SidecarHelper1=parseSha256SidecarContent1.trim().match(/^([A-Fa-f0-9]{64})\b/);
            if(!parseSha256SidecarHelper1){
                {
                    throw new Error("Could not parse SHA-256 digest from sidecar body");
        }
      }
            return parseSha256SidecarHelper1[(1)].toLowerCase();
    }
        async function downloadSha256Sidecar(archiveUrl){
            const helperHelper6=((archiveUrl)+(".sha256"));
            const helperHelper7=await ((downloadFile)((helperHelper6)));
            return ((parseSha256Sidecar)((helperHelper7.toString("utf8"))));
    }
        function sha256Hex(sha256HexHelper1){
            return (scanCodebaseUtilModule5.createHash("sha256").update(sha256HexHelper1).digest("hex"));
    }
        function verifySha256(verifySha256Error1,verifySha256Error2,verifySha256Error3){
            const verifySha256Error4=((String)((((verifySha256Error2)||(''))))).toLowerCase(),verifySha256Error5=((sha256Hex)((verifySha256Error1)));
            if(((verifySha256Error4)!==(verifySha256Error5))){
                {
                    throw new Error((((((((((((("SHA-256 verification failed for ")+(verifySha256Error3)))+(": expected ")))+(verifySha256Error4)))+(", got ")))+(verifySha256Error5)))+(". This could indicate a tampered release. Do not extract.")));
        }
      }
    }
        function assertSafeArchiveEntry(assertSafeArchiveEntryValue1){
            {
                if(!assertSafeArchiveEntryValue1||((typeof assertSafeArchiveEntryValue1)!==("string"))){
                    {
                        throw new Error("Refusing to extract archive with empty entry name");
          }
        }
                const assertSafeArchiveEntryError1=assertSafeArchiveEntryValue1.replace(/\\/g,'/').trim();
                if(((assertSafeArchiveEntryError1.length)===(0))){
                    {
                        throw new Error("Refusing to extract archive with empty entry name");
          }
        }
                if(assertSafeArchiveEntryError1.startsWith('//'))throw new Error((("Refusing to extract archive with UNC entry: ")+(assertSafeArchiveEntryValue1)));
                if(assertSafeArchiveEntryError1.startsWith('/')){
                    {
                        throw new Error((("Refusing to extract archive with absolute entry: ")+(assertSafeArchiveEntryValue1)));
          }
        }
                if(/^[A-Za-z]:[\\/]/.test(assertSafeArchiveEntryValue1)){
                    {
                        throw new Error((("Refusing to extract archive with Windows absolute entry: ")+(assertSafeArchiveEntryValue1)));
          }
        }
                const assertSafeArchiveEntryError2=assertSafeArchiveEntryError1.split('/').filter(function(assertSafeArchiveEntryValue2){
                    {
                        return ((((assertSafeArchiveEntryValue2.length))>((0))));
          }
        });
                for(let assertSafeArchiveEntryError3=(0);
                ((assertSafeArchiveEntryError3)<(assertSafeArchiveEntryError2.length));
                assertSafeArchiveEntryError3++){
                    {
                        if(((assertSafeArchiveEntryError2[assertSafeArchiveEntryError3])===('..'))){
                            {
                                throw new Error((("Refusing to extract archive with parent-traversal entry: ")+(assertSafeArchiveEntryValue1)));
              }
            }
          }
        }
      }
    }
        function extractArchiveEntry(entry){
            return new Promise(function(helperHelper8,helperError9){
                const helperValue19={
        };
                helperValue19.lRUYd="repo-intel",helperValue19.MTCpm="init";
                const helperValue20=helperValue19;
                {
                    const helperError10=scanCodebaseUtilModule4.spawn("tar",["-tz"],{
                        'stdio':["pipe","pipe","pipe"]
          });
                    let helperError11='',helperValue21='';
                    helperError10.stdout.on("data",function(helperError12){
                        helperError11+=helperError12;
          }),helperError10.stderr.on("data",function(helperValue22){
                        helperValue21+=helperValue22;
          }),helperError10.on("error",helperError9),helperError10.on("close",function(helperError13){
                        {
                            if(((((helperError13))!==((0))))){
                                {
                                    ((((helperError9))(((new Error((((((((((((("tar -tz listing failed (code "))+((helperError13))))))+(("): "))))))+((helperValue21))))))))));
                                    return;
                }
              }
                            const helperHelper9=helperError11.split(/\r?\n/).filter(function(helperValue23){
                                {
                                    return ((((((helperValue23.length)))>(((0))))));
                }
              });
                            ((((helperHelper8))(((helperHelper9)))));
            }
          }),helperError10.stdin.write(entry),helperError10.stdin.end();
        }
      });
    }
        function assertInsideRoot(assertInsideRootPath1,assertInsideRootHelper1){
            const assertInsideRootPath2=((scanCodebaseUtilModule1.resolve(assertInsideRootPath1))+(scanCodebaseUtilModule1.sep)),assertInsideRootHelper2=scanCodebaseUtilModule1.resolve(assertInsideRootHelper1);
            if(((assertInsideRootHelper2)!==(scanCodebaseUtilModule1.resolve(assertInsideRootPath1)))&&!assertInsideRootHelper2.startsWith(assertInsideRootPath2))throw new Error((("Extracted path escapes extract root: ")+(assertInsideRootHelper1)));
    }
        function extractArchive(archivePath){
            {
                const helperValue26=[],helperError14=[archivePath];
                while(((helperError14.length)>(0))){
                    {
                        const helperError15=helperError14.pop(),helperCount4=fs.lstatSync(helperError15);
                        if(helperCount4.isSymbolicLink())throw new Error((("Refusing to follow symlink produced by extractor: ")+(helperError15)));
                        if(helperCount4.isDirectory()){
                            const helperValue27=fs.readdirSync(helperError15);
                            for(let helperValue28=(0);
                            ((helperValue28)<(helperValue27.length));
                            helperValue28++){
                                {
                                    helperError14.push(scanCodebaseUtilModule1.join(helperError15,helperValue27[helperValue28]));
                }
              }
            }
                        else{
                            if(helperCount4.isFile()){
                                {
                                    helperValue26.push(helperError15);
                }
              }
            }
          }
        }
                return helperValue26;
      }
    }
        function extractZipWithPowerShell(zipPath){
            try{
                {
                    const helperHelper11={
          };
                    helperHelper11.recursive=true,helperHelper11.force=true,fs.rmSync(zipPath,helperHelper11);
        }
      }
            catch(error){
      }
    }
        async function extractTarGzToScratch(extractTarGzToScratchCount1){
            const extractTarGzToScratchValue1=await ((extractArchiveEntry)((extractTarGzToScratchCount1)));
            for(let extractTarGzToScratchValue2=(0);
            ((extractTarGzToScratchValue2)<(extractTarGzToScratchValue1.length));
            extractTarGzToScratchValue2++){
                ((assertSafeArchiveEntry)((extractTarGzToScratchValue1[extractTarGzToScratchValue2])));
      }
            const extractTarGzToScratchError1=fs.mkdtempSync(scanCodebaseUtilModule1.join(scanCodebaseUtilModule2.tmpdir(),"agent-analyzer-tar-"));
            try{
                {
                    await new Promise(function(extractTarGzToScratchValue3,extractTarGzToScratchValue4){
                        {
                            const extractTarGzToScratchError2=scanCodebaseUtilModule4.spawn("tar",['xz','-C',extractTarGzToScratchError1],{
                                'stdio':["pipe","pipe","pipe"]
              });
                            let extractTarGzToScratchError3='';
                            extractTarGzToScratchError2.stderr.on("data",function(extractTarGzToScratchError4){
                                {
                                    extractTarGzToScratchError3+=extractTarGzToScratchError4;
                }
              }),extractTarGzToScratchError2.on("error",extractTarGzToScratchValue4),extractTarGzToScratchError2.on("close",function(extractTarGzToScratchError5){
                                {
                                    if(((((extractTarGzToScratchError5))!==((0))))){
                                        {
                                            ((((extractTarGzToScratchValue4))(((new Error((((((((((((("tar extraction failed (code "))+((extractTarGzToScratchError5))))))+(("): "))))))+((extractTarGzToScratchError3))))))))));
                    }
                  }
                                    else{
                                        {
                                            ((((extractTarGzToScratchValue3))()));
                    }
                  }
                }
              }),extractTarGzToScratchError2.stdin.write(extractTarGzToScratchCount1),extractTarGzToScratchError2.stdin.end();
            }
          });
                    const extractTarGzToScratchValue5=((extractArchive)((extractTarGzToScratchError1)));
                    for(let extractTarGzToScratchError6=(0);
                    ((extractTarGzToScratchError6)<(extractTarGzToScratchValue5.length));
                    extractTarGzToScratchError6++){
                        ((assertInsideRoot)((extractTarGzToScratchError1),(extractTarGzToScratchValue5[extractTarGzToScratchError6])));
          }
        }
      }
            catch(error){
                {
                    ((extractZipWithPowerShell)((extractTarGzToScratchError1)));
                    throw error;
        }
      }
            return extractTarGzToScratchError1;
    }
        var _EXTRACT_ZIP_PS1=["$ErrorActionPreference = \"Stop\"","$src  = $env:SRC_ZIP","$dest = $env:DEST_DIR","if ([string]::IsNullOrEmpty($src) -or [string]::IsNullOrEmpty($dest)) {","  [Console]::Error.WriteLine(\"SRC_ZIP and DEST_DIR must both be set\"); exit 2",'}',"Add-Type -AssemblyName System.IO.Compression.FileSystem","$destFull = [System.IO.Path]::GetFullPath($dest)","if (-not $destFull.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {","  $destFull = $destFull + [System.IO.Path]::DirectorySeparatorChar",'}',"$zip = [System.IO.Compression.ZipFile]::OpenRead($src)","try {","  foreach ($entry in $zip.Entries) {","    $name = $entry.FullName","    if ([string]::IsNullOrEmpty($name)) { continue }","    $norm = $name -replace \"\\\\\",\"/\"","    if ($norm.StartsWith(\"/\") -or $norm.StartsWith(\"//\")) {","      [Console]::Error.WriteLine(\"Refusing absolute/UNC entry: \" + $name); exit 3","    }","    if ($name -match \"^[A-Za-z]:[\\\\/]\") {","      [Console]::Error.WriteLine(\"Refusing Windows-absolute entry: \" + $name); exit 3","    }","    foreach ($part in ($norm -split \"/\")) {","      if ($part -eq \"..\") {","        [Console]::Error.WriteLine(\"Refusing parent-traversal entry: \" + $name); exit 3","      }","    }","    $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($destFull, $norm))","    if (-not $target.StartsWith($destFull, [System.StringComparison]::OrdinalIgnoreCase)) {","      [Console]::Error.WriteLine(\"Entry escapes destination: \" + $name); exit 3","    }","    if ($entry.FullName.EndsWith(\"/\")) {","      [System.IO.Directory]::CreateDirectory($target) | Out-Null","    } else {","      $parent = [System.IO.Path]::GetDirectoryName($target)","      if ($parent) { [System.IO.Directory]::CreateDirectory($parent) | Out-Null }","      [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true)","    }","  }","} finally {","  $zip.Dispose()",'}'].join('\x0d\x0a');
        async function extractZipToScratch(extractZipToScratchValue1){
            {
                const extractZipToScratchError1=fs.mkdtempSync(scanCodebaseUtilModule1.join(scanCodebaseUtilModule2.tmpdir(),"agent-analyzer-zip-")),extractZipToScratchValue2=scanCodebaseUtilModule1.join(extractZipToScratchError1,"__archive.zip"),extractZipToScratchValue3=fs.mkdtempSync(scanCodebaseUtilModule1.join(scanCodebaseUtilModule2.tmpdir(),"agent-analyzer-ps-")),extractZipToScratchValue4=scanCodebaseUtilModule1.join(extractZipToScratchValue3,"extract.ps1");
                try{
                    {
                        fs.writeFileSync(extractZipToScratchValue2,extractZipToScratchValue1),fs.writeFileSync(extractZipToScratchValue4,_EXTRACT_ZIP_PS1,"utf8"),await new Promise(function(extractZipToScratchValue5,extractZipToScratchValue6){
                            {
                                const extractZipToScratchValue7={
                };
                                extractZipToScratchValue7.SRC_ZIP=extractZipToScratchValue2,extractZipToScratchValue7.DEST_DIR=extractZipToScratchError1;
                                const extractZipToScratchValue8=scanCodebaseUtilModule4.execFile("powershell.exe",["-NoProfile","-NonInteractive","-ExecutionPolicy","Bypass","-File",extractZipToScratchValue4],{
                                    'windowsHide':true,'env':Object.assign({
                  },process.env,extractZipToScratchValue7)
                },function(extractZipToScratchValue9,extractZipToScratchError2,extractZipToScratchError3){
                                    {
                                        if(extractZipToScratchValue9){
                                            {
                                                ((((extractZipToScratchValue6))(((new Error((((("zip extraction failed: "))+((extractZipToScratchError3||extractZipToScratchValue9.message))))))))));
                      }
                    }
                                        else ((((extractZipToScratchValue5))()));
                  }
                });
                                if(extractZipToScratchValue8.stdin)extractZipToScratchValue8.stdin.end();
              }
            });
                        try{
                            fs.unlinkSync(extractZipToScratchValue2);
            }
                        catch(error){
            }
                        const extractZipToScratchValue10=((extractArchive)((extractZipToScratchError1)));
                        for(let extractZipToScratchValue11=(0);
                        ((extractZipToScratchValue11)<(extractZipToScratchValue10.length));
                        extractZipToScratchValue11++){
                            {
                                ((assertInsideRoot)((extractZipToScratchError1),(extractZipToScratchValue10[extractZipToScratchValue11])));
              }
            }
          }
        }
                catch(error){
                    {
                        ((extractZipWithPowerShell)((extractZipToScratchError1)));
                        throw error;
          }
        }
                finally{
                    ((extractZipWithPowerShell)((extractZipToScratchValue3)));
        }
                return extractZipToScratchError1;
      }
    }
        function extractArchiveToDirectory(archivePath,destinationPath){
            const helperValue30=((extractArchive)((archivePath)));
            for(let helperHelper13=(0);
            ((helperHelper13)<(helperValue30.length));
            helperHelper13++){
                if(((scanCodebaseUtilModule1.basename(helperValue30[helperHelper13]))===(destinationPath))){
                    {
                        return ((assertInsideRoot)((archivePath),(helperValue30[helperHelper13]))),helperValue30[helperHelper13];
          }
        }
      }
            return null;
    }
        function extractTarGz(archivePath,destinationPath){
            {
                try{
                    {
                        const helperError18=scanCodebaseUtilModule4.execFileSync('gh',["attestation","verify",archivePath,"--repo",destinationPath,"--format","json"],{
                            'encoding':"utf8",'stdio':["ignore","pipe","pipe"],'timeout':60000,'windowsHide':true
            });
                        return{
                            'status':0,'stdout':((helperError18)||('')),'stderr':''
            };
          }
        }
                catch(error){
                    return{
                        'status':((typeof error.status)===("number"))?error.status:null,'stdout':error.stdout?((String)((error.stdout))):'','stderr':error.stderr?((String)((error.stderr))):error.message||''
          };
        }
      }
    }
        function isGhAvailable(isGhAvailableError1){
            {
                if(((typeof isGhAvailableError1)===("function"))){
                    {
                        try{
                            return!!((isGhAvailableError1)());
            }
                        catch(error){
                            return (false);
            }
          }
        }
                try{
                    {
                        return scanCodebaseUtilModule4.execFileSync('gh',["--version"],{
                            'stdio':"ignore",'timeout':5000,'windowsHide':true
            }),true;
          }
        }
                catch(error){
                    return (false);
        }
      }
    }
        function verifySlsaAttestation(verifySlsaAttestationValue1,verifySlsaAttestationValue2){
            {
                const verifySlsaAttestationBooleanModule1=((verifySlsaAttestationValue2)||({
        })),verifySlsaAttestationBooleanModule2=verifySlsaAttestationBooleanModule1.repo||scanCodebaseValue16,verifySlsaAttestationBooleanModule3=((typeof verifySlsaAttestationBooleanModule1.ghRunner)===("function"))?verifySlsaAttestationBooleanModule1.ghRunner:extractTarGz,verifySlsaAttestationValue3=((typeof verifySlsaAttestationBooleanModule1.requireAttestation)===("boolean"))?verifySlsaAttestationBooleanModule1.requireAttestation:((process.env.AGENT_ANALYZER_REQUIRE_ATTESTATION)===('1')),verifySlsaAttestationValue4=((isGhAvailable)((verifySlsaAttestationBooleanModule1.ghProbe)));
                if(!verifySlsaAttestationValue4){
                    const verifySlsaAttestationValue5="`gh` CLI not found on PATH";
                    if(verifySlsaAttestationValue3)return{
                        'status':"failed",'reason':((verifySlsaAttestationValue5)+(" (AGENT_ANALYZER_REQUIRE_ATTESTATION=1)"))
          };
                    const verifySlsaAttestationValue6={
          };
                    return verifySlsaAttestationValue6.status="skipped",verifySlsaAttestationValue6.reason=verifySlsaAttestationValue5,verifySlsaAttestationValue6;
        }
                const verifySlsaAttestationValue7=((verifySlsaAttestationBooleanModule3)((verifySlsaAttestationValue1),(verifySlsaAttestationBooleanModule2)));
                if(verifySlsaAttestationValue7&&((verifySlsaAttestationValue7.status)===(0))){
                    {
                        const verifySlsaAttestationValue8={
            };
                        return verifySlsaAttestationValue8.status="verified",verifySlsaAttestationValue8;
          }
        }
                return{
                    'status':"failed",'reason':(("gh attestation verify exited with status ")+(verifySlsaAttestationValue7&&((verifySlsaAttestationValue7.status)!==(null))?verifySlsaAttestationValue7.status:"unknown")),'stderr':verifySlsaAttestationValue7&&verifySlsaAttestationValue7.stderr||''
        };
      }
    }
        async function downloadBinary(downloadBinaryValue1,downloadBinaryValue2){
            {
                const downloadBinaryError1=((downloadBinaryValue2)||({
        })),downloadBinaryError2=((downloadBinaryError1.skipChecksum)===(true)),downloadBinaryError3=((downloadBinaryError1.skipAttestation)===(true)),downloadBinaryError4=((getPlatformKey)());
                if(!downloadBinaryError4){
                    {
                        throw new Error((((((((((("Unsupported platform: ")+(process.platform)))+('-')))+(process.arch)))+(". Supported platforms: ")))+(Object.keys(PLATFORM_MAP).join(',\x20'))));
          }
        }
                const downloadBinaryPath1=((buildDownloadUrl)((downloadBinaryValue1),(downloadBinaryError4))),downloadBinaryError5=downloadBinaryPath1.substring(((downloadBinaryPath1.lastIndexOf('/'))+(1)));
                process.stderr.write((((((((((((("Downloading ")+(scanCodebaseError1)))+('\x20v')))+(downloadBinaryValue1)))+(" for ")))+(downloadBinaryError4)))+("...\n")));
                const downloadBinaryValue3=((getBinaryPath)()),downloadBinaryError6=scanCodebaseUtilModule1.dirname(downloadBinaryValue3),downloadBinaryError7={
        };
                downloadBinaryError7.recursive=true,fs.mkdirSync(downloadBinaryError6,downloadBinaryError7);
                let downloadBinaryError8;
                try{
                    downloadBinaryError8=await ((downloadFile)((downloadBinaryPath1)));
        }
                catch(error){
                    {
                        throw new Error((((((((((((((((((((((("Failed to download ")+(scanCodebaseError1)))+(":\n  URL: ")))+(downloadBinaryPath1)))+("\n  Error: ")))+(error.message)))+("\n\nTo install manually:\n  1. Download: ")))+(downloadBinaryPath1)))+("\n  2. Extract the binary to: ")))+(downloadBinaryError6)))+("\n  3. Ensure it is named: ")))+(scanCodebaseUtilModule1.basename(downloadBinaryValue3))));
          }
        }
                if(downloadBinaryError2){
                    {
                        process.stderr.write("[WARN] skipChecksum=true - SHA-256 verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n");
          }
        }
                else{
                    let downloadBinaryError9;
                    try{
                        {
                            downloadBinaryError9=await ((downloadSha256Sidecar)((downloadBinaryPath1)));
            }
          }
                    catch(error){
                        {
                            throw new Error((((((((((((("Failed to fetch SHA-256 sidecar for ")+(downloadBinaryError5)))+(":\n  URL: ")))+(downloadBinaryPath1)))+(".sha256\n  Error: ")))+(error.message)))+("\n\nThe release may be missing its checksum file. Refusing to install an unverified binary. If this is a legacy release without sidecars, pass { skipChecksum: true } to downloadBinary() (LOCAL DEV ONLY).")));
            }
          }
                    ((verifySha256)((downloadBinaryError8),(downloadBinaryError9),(downloadBinaryError5)));
        }
                if(downloadBinaryError3){
                    {
                        process.stderr.write("[WARN] skipAttestation=true - SLSA verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n");
          }
        }
                else{
                    {
                        const downloadBinaryValue4=fs.mkdtempSync(scanCodebaseUtilModule1.join(scanCodebaseUtilModule2.tmpdir(),"agent-analyzer-slsa-")),downloadBinaryValue5=scanCodebaseUtilModule1.join(downloadBinaryValue4,downloadBinaryError5);
                        try{
                            {
                                fs.writeFileSync(downloadBinaryValue5,downloadBinaryError8);
                                const downloadBinaryValue6={
                };
                                downloadBinaryValue6.repo=scanCodebaseValue16,downloadBinaryValue6.requireAttestation=downloadBinaryError1.requireAttestation,downloadBinaryValue6.ghRunner=downloadBinaryError1.ghRunner,downloadBinaryValue6.ghProbe=downloadBinaryError1.ghProbe;
                                const downloadBinaryError10=((verifySlsaAttestation)((downloadBinaryValue5),(downloadBinaryValue6)));
                                if(((downloadBinaryError10.status)===("verified")))process.stderr.write((((("[OK] SLSA attestation verified for ")+(downloadBinaryError5)))+('\x0a')));
                                else{
                                    if(((downloadBinaryError10.status)===("skipped")))process.stderr.write((((("[WARN] SLSA attestation check skipped: ")+(downloadBinaryError10.reason)))+(". Install the GitHub CLI (`gh`) to enable provenance verification. Set AGENT_ANALYZER_REQUIRE_ATTESTATION=1 to require it.\n")));
                                    else throw new Error((((((((((("SLSA attestation verification failed for ")+(downloadBinaryError5)))+(':\x20')))+(downloadBinaryError10.reason)))+(". Refusing to execute binary.")))+(downloadBinaryError10.stderr?(("\n--- gh stderr ---\n")+(downloadBinaryError10.stderr)):'')));
                }
              }
            }
                        finally{
                            (((extractZipWithPowerShell)((downloadBinaryValue4))));
            }
          }
        }
                const downloadBinaryError11=scanCodebaseUtilModule1.basename(downloadBinaryValue3);
                let downloadBinaryError12;
                try{
                    {
                        if(((process.platform)===("win32")))(downloadBinaryError12=await ((extractZipToScratch)((downloadBinaryError8))));
                        else{
                            {
                                downloadBinaryError12=await ((extractTarGzToScratch)((downloadBinaryError8)));
              }
            }
                        const downloadBinaryError13=((extractArchiveToDirectory)((downloadBinaryError12),(downloadBinaryError11)));
                        if(!downloadBinaryError13){
                            {
                                throw new Error((((((((("Expected binary \"")+(downloadBinaryError11)))+("\" not found inside archive ")))+(downloadBinaryError5)))+(". Archive layout may have changed.")));
              }
            }
                        fs.copyFileSync(downloadBinaryError13,downloadBinaryValue3);
          }
        }
                finally{
                    {
                        if(downloadBinaryError12)((extractZipWithPowerShell)((downloadBinaryError12)));
          }
        }
                ((process.platform)!==("win32"))&&((fs.chmodSync(downloadBinaryValue3,(493))));
                const downloadBinaryError14=((getVersion)());
                if(!downloadBinaryError14)throw new Error(((((((scanCodebaseError1)+(" was downloaded to ")))+(downloadBinaryValue3)))+(" but could not be executed. Check the file is a valid binary for this platform.")));
                return downloadBinaryValue3;
      }
    }
        async function ensureBinary(ensureBinaryValue1){
            const ensureBinaryHelper1=((ensureBinaryValue1)||({
      })),ensureBinaryValue2=ensureBinaryHelper1.version||scanCodebaseValue15;
            const ensureBinaryValue3=((getBinaryPath)());
            if(fs.existsSync(ensureBinaryValue3)){
                const ensureBinaryValue4=((getVersion)());
                if(((meetsMinimumVersion)((ensureBinaryValue4),(scanCodebaseValue15)))){
                    {
                        return ensureBinaryValue3;
          }
        }
      }
            return ((downloadBinary)((ensureBinaryValue2),({
                'skipChecksum':((ensureBinaryHelper1.skipChecksum)===(true)),'skipAttestation':((ensureBinaryHelper1.skipAttestation)===(true)),'requireAttestation':ensureBinaryHelper1.requireAttestation,'ghRunner':ensureBinaryHelper1.ghRunner,'ghProbe':ensureBinaryHelper1.ghProbe
      })));
    }
        function ensureBinarySync(ensureBinarySyncPath1){
            const ensureBinarySyncHelper1=((getBinaryPath)());
            if(fs.existsSync(ensureBinarySyncHelper1)){
                const ensureBinarySyncValue1=((getVersion)());
                if(((meetsMinimumVersion)((ensureBinarySyncValue1),(scanCodebaseValue15))))return (ensureBinarySyncHelper1);
      }
            const ensureBinarySyncBooleanModule1=ensureBinarySyncPath1&&ensureBinarySyncPath1.version||scanCodebaseValue15,ensureBinarySyncBooleanModule2=!!(ensureBinarySyncPath1&&ensureBinarySyncPath1.skipChecksum),ensureBinarySyncModule1=!!(ensureBinarySyncPath1&&ensureBinarySyncPath1.skipAttestation);
            const ensureBinarySyncModule2=ensureBinarySyncPath1&&((typeof ensureBinarySyncPath1.requireAttestation)===("boolean"))?ensureBinarySyncPath1.requireAttestation:void(0),ensureBinarySyncValue2=__filename,ensureBinarySyncModule3={
      };
            ensureBinarySyncModule3.version=ensureBinarySyncBooleanModule1,ensureBinarySyncModule3.skipChecksum=ensureBinarySyncBooleanModule2,ensureBinarySyncModule3.skipAttestation=ensureBinarySyncModule1;
            const ensureBinarySyncModule4=ensureBinarySyncModule3;
            if(((ensureBinarySyncModule2)!==(void(0)))){
                {
                    ensureBinarySyncModule4.requireAttestation=ensureBinarySyncModule2;
        }
      }
            const ensureBinarySyncJSONstringify0x2d20d1Module1=[(((("var b = require(")+(JSON.stringify(ensureBinarySyncValue2))))+(');')),(((("b.ensureBinary(")+(JSON.stringify(ensureBinarySyncModule4))))+(')')),"  .then(function(p) { process.stdout.write(p); })","  .catch(function(e) { process.stderr.write(e.message); process.exit(1); });"];
            try{
                const ensureBinarySyncPath2={
        };
                ensureBinarySyncPath2.encoding="utf8",ensureBinarySyncPath2.stdio=["pipe","pipe","inherit"],ensureBinarySyncPath2.timeout=120000;
                const ensureBinarySyncHelper2=scanCodebaseUtilModule4.execFileSync(process.execPath,['-e',ensureBinarySyncJSONstringify0x2d20d1Module1.join('\x0a')],ensureBinarySyncPath2);
                return ensureBinarySyncHelper2.trim()||ensureBinarySyncHelper1;
      }
            catch(error){
                {
                    throw new Error((("Failed to ensure binary (sync): ")+(error.message)));
        }
      }
    }
        function runAnalyzer(runAnalyzerHelper1,runAnalyzerValue1){
            const runAnalyzerHelper2=((ensureBinarySync)()),runAnalyzerValue2={
      };
            runAnalyzerValue2.encoding="utf8",runAnalyzerValue2.windowsHide=true,runAnalyzerValue2.maxBuffer=scanCodebaseValue14;
            const runAnalyzerValue3=Object.assign(runAnalyzerValue2,runAnalyzerValue1);
            if(!runAnalyzerValue3.stdio)runAnalyzerValue3.stdio=["pipe","pipe","pipe"];
            const runAnalyzerHelper3=scanCodebaseUtilModule4.execFileSync(runAnalyzerHelper2,runAnalyzerHelper1,runAnalyzerValue3);
            return ((typeof runAnalyzerHelper3)===("string"))?runAnalyzerHelper3:runAnalyzerHelper3.toString("utf8");
    }
        async function runAnalyzerAsync(runAnalyzerAsyncValue1,runAnalyzerAsyncValue2){
            const runAnalyzerAsyncValue3=await ((ensureBinary)()),runAnalyzerAsyncValue4={
      };
            runAnalyzerAsyncValue4.encoding="utf8",runAnalyzerAsyncValue4.windowsHide=true,runAnalyzerAsyncValue4.maxBuffer=scanCodebaseValue14;
            const runAnalyzerAsyncValue5=Object.assign(runAnalyzerAsyncValue4,runAnalyzerAsyncValue2),runAnalyzerAsyncValue6=await ((scanCodebaseModule2)((runAnalyzerAsyncValue3),(runAnalyzerAsyncValue1),(runAnalyzerAsyncValue5)));
            return runAnalyzerAsyncValue6.stdout;
    }
        const runAnalyzerAsyncPath1={
    };
        runAnalyzerAsyncPath1.ensureBinary=ensureBinary,runAnalyzerAsyncPath1.ensureBinarySync=ensureBinarySync,runAnalyzerAsyncPath1.runAnalyzer=runAnalyzer,runAnalyzerAsyncPath1.runAnalyzerAsync=runAnalyzerAsync,runAnalyzerAsyncPath1.getBinaryPath=getBinaryPath,runAnalyzerAsyncPath1.getVersion=getVersion,runAnalyzerAsyncPath1.getPlatformKey=getPlatformKey,runAnalyzerAsyncPath1.isAvailable=isAvailable,runAnalyzerAsyncPath1.isAvailableAsync=isAvailableAsync;
        runAnalyzerAsyncPath1.meetsMinimumVersion=meetsMinimumVersion,runAnalyzerAsyncPath1.buildDownloadUrl=buildDownloadUrl,runAnalyzerAsyncPath1.PLATFORM_MAP=PLATFORM_MAP,runAnalyzerAsyncPath1.parseSha256Sidecar=parseSha256Sidecar,runAnalyzerAsyncPath1.verifySha256=verifySha256,runAnalyzerAsyncPath1.sha256Hex=sha256Hex,runAnalyzerAsyncPath1.assertSafeArchiveEntry=assertSafeArchiveEntry,runAnalyzerAsyncPath1.assertInsideRoot=assertInsideRoot,runAnalyzerAsyncPath1.downloadBinary=downloadBinary,runAnalyzerAsyncPath1.verifySlsaAttestation=verifySlsaAttestation,runAnalyzerAsyncPath1.isGhAvailable=isGhAvailable,runAnalyzerAsyncPath1.extractTarGzToScratch=extractTarGzToScratch,runAnalyzerAsyncPath1.extractZipToScratch=extractZipToScratch,runAnalyzerAsyncPath1._EXTRACT_ZIP_PS1=_EXTRACT_ZIP_PS1,module.exports=runAnalyzerAsyncPath1;
  }
}),requireInstallerCollector=__commonJS({
    '../work/agent-sh__agentsys/lib/repo-intel/installer.js'(exports,module){
        'use strict';
        var runAnalyzerAsyncValue7=((requireBinaryCollector)());
        async function checkInstalled(){
            {
                if(runAnalyzerAsyncValue7.isAvailable())return ({
                    'found':true,'version':runAnalyzerAsyncValue7.getVersion(),'tool':"agent-analyzer"
        });
                try{
                    return ((await runAnalyzerAsyncValue7.ensureBinary(),{
                        'found':true,'version':runAnalyzerAsyncValue7.getVersion(),'tool':"agent-analyzer"
          }));
        }
                catch(error){
                    {
                        const checkInstalledHelper1={
            };
                        return checkInstalledHelper1.found=false,checkInstalledHelper1.error=error.message,checkInstalledHelper1.tool="agent-analyzer",checkInstalledHelper1;
          }
        }
      }
    }
        function checkInstalledSync(){
            {
                if(runAnalyzerAsyncValue7.isAvailable())return{
                    'found':true,'version':runAnalyzerAsyncValue7.getVersion(),'tool':"agent-analyzer"
        };
                try{
                    {
                        return runAnalyzerAsyncValue7.ensureBinarySync(),{
                            'found':true,'version':runAnalyzerAsyncValue7.getVersion(),'tool':"agent-analyzer"
            };
          }
        }
                catch(error){
                    {
                        const checkInstalledSyncHelper1={
            };
                        return checkInstalledSyncHelper1.found=false,checkInstalledSyncHelper1.error=error.message,checkInstalledSyncHelper1.tool="agent-analyzer",checkInstalledSyncHelper1;
          }
        }
      }
    }
        function meetsMinimumVersion(){
            return (true);
    }
        function getInstallInstructions(){
            {
                return "agent-analyzer is downloaded automatically on first use from https://github.com/agent-sh/agent-analyzer/releases";
      }
    }
        function getMinimumVersion(){
            {
                return "0.3.0";
      }
    }
        const getMinimumVersionValue1={
    };
        getMinimumVersionValue1.checkInstalled=checkInstalled,getMinimumVersionValue1.checkInstalledSync=checkInstalledSync,getMinimumVersionValue1.meetsMinimumVersion=meetsMinimumVersion,getMinimumVersionValue1.getInstallInstructions=getInstallInstructions,getMinimumVersionValue1.getMinimumVersion=getMinimumVersion,getMinimumVersionValue1.getCommand=()=>null,module.exports=getMinimumVersionValue1;
  }
}),require_state_dir=__commonJS({
    '../work/agent-sh__agentsys/lib/platform/state-dir.js'(exports,module){
        var fs=((require)(('fs'))),getMinimumVersionValue2=((require)(("path")));
        var getMinimumVersionError1=new Map();
        function runAnalyzerCommand(command){
            {
                try{
                    {
                        return fs.statSync(command).isDirectory();
          }
        }
                catch{
                    {
                        return false;
          }
        }
      }
    }
        function getStateDir(getStateDirValue1=process.cwd()){
            {
                if(process.env.AI_STATE_DIR){
                    {
                        return process.env.AI_STATE_DIR;
          }
        }
                const getStateDirValue2=getMinimumVersionValue2.resolve(getStateDirValue1),getStateDirValue3=getMinimumVersionError1.get(getStateDirValue2);
                if(getStateDirValue3){
                    return getStateDirValue3;
        }
                if(process.env.OPENCODE_CONFIG||process.env.OPENCODE_CONFIG_DIR)return getMinimumVersionError1.set(getStateDirValue2,".opencode"),".opencode";
                try{
                    {
                        const getStateDirValue4=getMinimumVersionValue2.join(getStateDirValue1,".opencode");
                        if(((runAnalyzerCommand)((getStateDirValue4)))){
                            {
                                return getMinimumVersionError1.set(getStateDirValue2,".opencode"),".opencode";
              }
            }
          }
        }
                catch{
        }
                if(process.env.CODEX_HOME)return getMinimumVersionError1.set(getStateDirValue2,".codex"),".codex";
                try{
                    {
                        const getStateDirValue5=getMinimumVersionValue2.join(getStateDirValue1,".codex");
                        if(((runAnalyzerCommand)((getStateDirValue5)))){
                            {
                                return getMinimumVersionError1.set(getStateDirValue2,".codex"),".codex";
              }
            }
          }
        }
                catch{
        }
                return getMinimumVersionError1.set(getStateDirValue2,".claude"),".claude";
      }
    }
        function getStateDirPath(getStateDirPathValue1=process.cwd()){
            {
                return getMinimumVersionValue2.join(getStateDirPathValue1,((getStateDir)((getStateDirPathValue1))));
      }
    }
        function getPlatformName(getPlatformNameValue1=process.cwd()){
            {
                const getPlatformNameValue2=((getStateDir)((getPlatformNameValue1)));
                if(process.env.AI_STATE_DIR){
                    {
                        return "custom";
          }
        }
                switch(getPlatformNameValue2){
                    case ".opencode":return "opencode";
                    case ".codex":return "codex";
                    case ".claude":return "claude";
                    default:return "unknown";
        }
      }
    }
        function clearCache(){
            getMinimumVersionError1.clear();
    }
        const clearCacheModule1={
    };
        clearCacheModule1.getStateDir=getStateDir,clearCacheModule1.getStateDirPath=getStateDirPath,clearCacheModule1.getPlatformName=getPlatformName,clearCacheModule1.clearCache=clearCache,module.exports=clearCacheModule1;
  }
}),require_atomic_write=__commonJS({
    '../work/agent-sh__agentsys/lib/utils/atomic-write.js'(exports,module){
        var fs=((require)(('fs'))),clearCacheHelper1=((require)(("path")));
        var crypto=((require)(("crypto")));
        function getTempPath(getTempPathHelper1){
            const getTempPathValue1=clearCacheHelper1.dirname(getTempPathHelper1);
            const getTempPathHelper2=clearCacheHelper1.basename(getTempPathHelper1),getTempPathValue2=crypto.randomBytes(6).toString("hex");
            return clearCacheHelper1.join(getTempPathValue1,'.'+getTempPathHelper2+'.'+getTempPathValue2+".tmp");
    }
        function writeFileAtomic(writeFileAtomicValue1,writeFileAtomicValue2,writeFileAtomicValue3={
    }){
            const {
                encoding:encoding="utf8",mode:mode=(420)
      }
            =writeFileAtomicValue3,writeFileAtomicPath1=clearCacheHelper1.dirname(writeFileAtomicValue1);
            if(!fs.existsSync(writeFileAtomicPath1)){
                {
                    const writeFileAtomicValue4={
          };
                    writeFileAtomicValue4.recursive=true,fs.mkdirSync(writeFileAtomicPath1,writeFileAtomicValue4);
        }
      }
            const writeFileAtomicHelper1=((getTempPath)((writeFileAtomicValue1)));
            try{
                const writeFileAtomicValue5={
        };
                return writeFileAtomicValue5.encoding=encoding,writeFileAtomicValue5.mode=mode,fs.writeFileSync(writeFileAtomicHelper1,writeFileAtomicValue2,writeFileAtomicValue5),fs.renameSync(writeFileAtomicHelper1,writeFileAtomicValue1),true;
      }
            catch(error){
                {
                    try{
                        {
                            if(fs.existsSync(writeFileAtomicHelper1)){
                                {
                                    fs.unlinkSync(writeFileAtomicHelper1);
                }
              }
            }
          }
                    catch{
          }
                    throw error;
        }
      }
    }
        function writeJsonAtomic(writeJsonAtomicPath1,writeJsonAtomicValue1,writeJsonAtomicValue2={
    }){
            {
                const {
                    indent:indent=(2),...writeJsonAtomicValue3
        }
                =writeJsonAtomicValue2,writeJsonAtomicValue4=JSON.stringify(writeJsonAtomicValue1,null,indent);
                return ((writeFileAtomic)((writeJsonAtomicPath1),(writeJsonAtomicValue4),(writeJsonAtomicValue3)));
      }
    }
        const writeJsonAtomicModule1={
    };
        writeJsonAtomicModule1.writeFileAtomic=writeFileAtomic,writeJsonAtomicModule1.writeJsonAtomic=writeJsonAtomic,writeJsonAtomicModule1.getTempPath=getTempPath;
        module.exports=writeJsonAtomicModule1;
  }
}),requireCacheCollector=__commonJS({
    '../work/agent-sh__agentsys/lib/repo-intel/cache.js'(exports,module){
        'use strict';
        var fs=((require)(('fs'))),writeJsonAtomicHelper1=((require)(("path"))),{
            getStateDirPath:getStateDirPath
    }
        =((require_state_dir)()),{
            writeJsonAtomic:writeJsonAtomicValue5,writeFileAtomic:writeJsonAtomicValue6
    }
        =((require_atomic_write)()),writeJsonAtomicValue7="repo-map.json",writeJsonAtomicHelper2="repo-map.stale",writeJsonAtomicHelper3="repo-intel.json";
        function getMapPath(getMapPathPath1){
            {
                return writeJsonAtomicHelper1.join(((getStateDirPath)((getMapPathPath1))),writeJsonAtomicValue7);
      }
    }
        function getPath(getPathHelper1){
            return writeJsonAtomicHelper1.join(((getStateDirPath)((getPathHelper1))),writeJsonAtomicHelper3);
    }
        function getStaleMarkerPath(cwd){
            {
                return writeJsonAtomicHelper1.join(((getStateDirPath)((cwd))),writeJsonAtomicHelper2);
      }
    }
        function ensureStateDirectory(cwd){
            const helperValue38={
      };
            helperValue38.uszKP="utf8";
            const helperValue39=helperValue38;
            const helperHelper14=((getStateDirPath)((cwd)));
            if(!fs.existsSync(helperHelper14)){
                {
                    const helperHelper15={
          };
                    helperHelper15.recursive=true,fs.mkdirSync(helperHelper14,helperHelper15);
        }
      }
            return helperHelper14;
    }
        function load(loadParsedResult1){
            const loadHelper1=((getMapPath)((loadParsedResult1)));
            if(!fs.existsSync(loadHelper1))return null;
            try{
                const loadPath1=fs.readFileSync(loadHelper1,"utf8");
                return JSON.parse(loadPath1);
      }
            catch{
                return null;
      }
    }
        function save(saveHelper1,saveHelper2){
            {
                ((ensureStateDirectory)((saveHelper1)));
                const saveValue1=((getMapPath)((saveHelper1))),saveHelper3={
                    ...saveHelper2,'updated':new Date().toISOString()
        };
                ((writeJsonAtomicValue5)((saveValue1),(saveHelper3))),((clearStale)((saveHelper1)));
      }
    }
        function exists(existsHelper1){
            return fs.existsSync(((getMapPath)((existsHelper1))));
    }
        function markStale(markStaleValue1){
            {
                ((ensureStateDirectory)((markStaleValue1))),((writeJsonAtomicValue6)((((getStaleMarkerPath)((markStaleValue1)))),(new Date().toISOString())));
      }
    }
        function clearStale(clearStaleHelper1){
            {
                const clearStaleValue1=((getStaleMarkerPath)((clearStaleHelper1)));
                fs.existsSync(clearStaleValue1)&&((fs.unlinkSync(clearStaleValue1)));
      }
    }
        function isMarkedStale(isMarkedStaleValue1){
            return (fs.existsSync(((getStaleMarkerPath)((isMarkedStaleValue1)))));
    }
        function getStatus(getStatusItems1){
            {
                const getStatusItems2=((load)((getStatusItems1)));
                if(!getStatusItems2)return null;
                return{
                    'generated':getStatusItems2.generated,'updated':getStatusItems2.updated,'commit':getStatusItems2.git?.["commit"],'branch':getStatusItems2.git?.["branch"],'files':Object.keys(getStatusItems2.files||{
          }).length,'symbols':getStatusItems2.stats?.["totalSymbols"]||(0),'languages':getStatusItems2.project?.["languages"]||[]
        };
      }
    }
        const getStatusPath1={
    };
        getStatusPath1.load=load,getStatusPath1.save=save,getStatusPath1.exists=exists,getStatusPath1.getStatus=getStatus,getStatusPath1.getMapPath=getMapPath,getStatusPath1.getPath=getPath,getStatusPath1.getStateDirPath=getStateDirPath,getStatusPath1.markStale=markStale,getStatusPath1.clearStale=clearStale,getStatusPath1.isMarkedStale=isMarkedStale,module.exports=getStatusPath1;
  }
}),requireUpdaterCollector=__commonJS({
    '../work/agent-sh__agentsys/lib/repo-intel/updater.js'(exports,module){
        'use strict';
        var {
            execFileSync:getStatusValue1
    }
        =((require)(("child_process"))),getStatusValue2=((requireCacheCollector)());
        function checkStaleness(checkStalenessValue1,checkStalenessValue2){
            const checkStalenessValue3={
      };
            checkStalenessValue3.isStale=false;
            checkStalenessValue3.reason=null,checkStalenessValue3.commitsBehind=0,checkStalenessValue3.suggestFullRebuild=false;
            const checkStalenessValue4=checkStalenessValue3;
            if(!checkStalenessValue2?.["git"]?.["commit"]){
                {
                    return checkStalenessValue4.isStale=true,checkStalenessValue4.reason="Missing base commit in repo-map",checkStalenessValue4.suggestFullRebuild=true,checkStalenessValue4;
        }
      }
            getStatusValue2.isMarkedStale(checkStalenessValue1)&&(checkStalenessValue4.isStale=true,checkStalenessValue4.reason="Marked stale by hook");
            if(!((buildStalenessResult)((checkStalenessValue1),(checkStalenessValue2.git.commit))))return checkStalenessValue4.isStale=true,checkStalenessValue4.reason="Base commit no longer exists (rebased?)",checkStalenessValue4.suggestFullRebuild=true,checkStalenessValue4;
            const checkStalenessValue6=((checkStalenessHelper1)((checkStalenessValue1)));
            checkStalenessValue6&&checkStalenessValue2.git.branch&&((checkStalenessValue6)!==(checkStalenessValue2.git.branch))&&(checkStalenessValue4.isStale=true,checkStalenessValue4.reason="Branch changed from "+checkStalenessValue2.git.branch+" to "+checkStalenessValue6,checkStalenessValue4.suggestFullRebuild=true);
            const checkStalenessHelper2=((checkCacheStaleness)((checkStalenessValue1),(checkStalenessValue2.git.commit)));
            if(((checkStalenessHelper2)>(0))){
                {
                    checkStalenessValue4.isStale=true,checkStalenessValue4.commitsBehind=checkStalenessHelper2;
                    if(!checkStalenessValue4.reason){
                        {
                            checkStalenessValue4.reason=checkStalenessHelper2+(" commits behind HEAD");
            }
          }
        }
      }
            return checkStalenessValue4;
    }
        function isValidCacheKey(key){
            return ((typeof key)===("string"))&&/^[0-9a-fA-F]{4,40}$/.test(key);
    }
        function buildStalenessResult(helperValue41,helperHelper16){
            const helperValue42={
      };
            helperValue42.eUwIb="agent-analyzer";
            const helperValue43=helperValue42;
            {
                if(!((isValidCacheKey)((helperHelper16))))return false;
                try{
                    {
                        return ((getStatusValue1)(("git"),(["cat-file",'-e',helperHelper16]),({
                            'cwd':helperValue41,'stdio':["pipe","pipe","pipe"]
            }))),true;
          }
        }
                catch{
                    return false;
        }
      }
    }
        function checkStalenessHelper1(helperPath5){
            {
                try{
                    return ((getStatusValue1)(("git"),(["rev-parse","--abbrev-ref","HEAD"]),({
                        'cwd':helperPath5,'encoding':"utf8",'stdio':["pipe","pipe","pipe"]
          }))).trim();
        }
                catch{
                    return null;
        }
      }
    }
        function checkCacheStaleness(cacheData,cachePath){
            {
                if(!((isValidCacheKey)((cachePath))))return (0);
                try{
                    const helperValue44=((getStatusValue1)(("git"),(["rev-list",cachePath+"..HEAD","--count"]),({
                        'cwd':cacheData,'encoding':"utf8",'stdio':["pipe","pipe","pipe"]
          }))).trim();
                    return ((Number)((helperValue44)))||(0);
        }
                catch{
                    return-(14002);
        }
      }
    }
        const helperModule1={
    };
        helperModule1.checkStaleness=checkStaleness,module.exports=helperModule1;
  }
}),requireConverterCollector=__commonJS({
    '../work/agent-sh__agentsys/lib/repo-intel/converter.js'(exports,module){
        'use strict';
        var path=((require)(("path")));
        const helperValue45={
    };
        helperValue45[".js"]="javascript",helperValue45[".jsx"]="javascript",helperValue45[".mjs"]="javascript",helperValue45[".cjs"]="javascript",helperValue45[".ts"]="typescript",helperValue45[".tsx"]="typescript",helperValue45[".mts"]="typescript",helperValue45[".cts"]="typescript",helperValue45[".py"]="python",helperValue45[".pyw"]="python",helperValue45[".rs"]="rust",helperValue45[".go"]='go',helperValue45[".java"]="java";
        var helperItem2=helperValue45,helperValue46=new Set(["class","struct","interface","enum","impl"]),helperHelper17=new Set(["trait","type-alias"]),helperHelper18=new Set(["method","arrow","closure"]),helperHelper19=new Set(["constant","variable","const","field","property"]);
        function detectLanguage(detectLanguageItem1){
            return (helperItem2[path.extname(detectLanguageItem1).toLowerCase()]||"unknown");
    }
        function loadCacheMetadata(cachePath){
            {
                const helperValue49=new Set();
                for(const helperHelper20 of cachePath){
                    const helperHelper21=((detectLanguage)((helperHelper20)));
                    if(((helperHelper21)!==("unknown")))helperValue49.add(helperHelper21);
        }
                return Array.from(helperValue49);
      }
    }
        function convertFile(convertFileItem1,convertFileItem2){
            const convertFileItem3={
      };
            convertFileItem3.NigQT=".opencode";
            const convertFileItem4=convertFileItem3;
            {
                const convertFileValue1=new Set((convertFileItem2.exports||[]).map(convertFileValue2=>convertFileValue2.name)),convertFileItem5=(convertFileItem2.exports||[]).map(convertFileItem6=>({
                    'name':convertFileItem6.name,'kind':convertFileItem6.kind,'line':convertFileItem6.line
        })),convertFileValue3=[],convertFileHelper1=[],convertFileValue4=[],convertFileItem7=[];
                for(const convertFileValue5 of convertFileItem2.definitions||[]){
                    const convertFileValue6={
                        'name':convertFileValue5.name,'kind':convertFileValue5.kind,'line':convertFileValue5.line,'exported':convertFileValue1.has(convertFileValue5.name)
          };
                    if(((convertFileValue5.kind)===("function"))||helperHelper18.has(convertFileValue5.kind)){
                        {
                            convertFileValue3.push(convertFileValue6);
            }
          }
                    else{
                        if(helperValue46.has(convertFileValue5.kind)){
                            {
                                convertFileHelper1.push(convertFileValue6);
              }
            }
                        else{
                            if(helperHelper17.has(convertFileValue5.kind)){
                                {
                                    convertFileValue4.push(convertFileValue6);
                }
              }
                            else helperHelper19.has(convertFileValue5.kind)?convertFileItem7.push(convertFileValue6):convertFileItem7.push(convertFileValue6);
            }
          }
        }
                const convertFileItem8=(convertFileItem2.imports||[]).map(convertFileValue7=>({
                    'source':convertFileValue7.from,'kind':"import",'names':convertFileValue7.names||[]
        })),convertFileHelper2={
        };
                return convertFileHelper2.exports=convertFileItem5,convertFileHelper2.functions=convertFileValue3,convertFileHelper2.classes=convertFileHelper1,convertFileHelper2.types=convertFileValue4,convertFileHelper2.constants=convertFileItem7,{
                    'language':((detectLanguage)((convertFileItem1))),'symbols':convertFileHelper2,'imports':convertFileItem8
        };
      }
    }
        function convertIntelToRepoMap(convertIntelToRepoMapValue1){
            {
                const convertIntelToRepoMapContent1={
        };
                let convertIntelToRepoMapValue2=(0),convertIntelToRepoMapContent2=(0);
                for(const [convertIntelToRepoMapContent3,convertIntelToRepoMapCount1]of Object.entries(convertIntelToRepoMapValue1.symbols||{
        })){
                    {
                        convertIntelToRepoMapContent1[convertIntelToRepoMapContent3]=((convertFile)((convertIntelToRepoMapContent3),(convertIntelToRepoMapCount1)));
                        const convertIntelToRepoMapContent4=convertIntelToRepoMapContent1[convertIntelToRepoMapContent3].symbols;
                        convertIntelToRepoMapValue2+=((((((convertIntelToRepoMapContent4.functions.length)+(convertIntelToRepoMapContent4.classes.length)))+(convertIntelToRepoMapContent4.types.length)))+(convertIntelToRepoMapContent4.constants.length)),convertIntelToRepoMapContent2+=convertIntelToRepoMapContent1[convertIntelToRepoMapContent3].imports.length;
          }
        }
                return{
                    'version':"2.0",'generated':convertIntelToRepoMapValue1.generated||new Date().toISOString(),'git':convertIntelToRepoMapValue1.git?{
                        'commit':convertIntelToRepoMapValue1.git.analyzedUpTo
          }
                    :void(0),'project':{
                        'languages':((loadCacheMetadata)((Object.keys(convertIntelToRepoMapContent1))))
          },'stats':{
                        'totalFiles':Object.keys(convertIntelToRepoMapContent1).length,'totalSymbols':convertIntelToRepoMapValue2,'totalImports':convertIntelToRepoMapContent2,'errors':[]
          },'files':convertIntelToRepoMapContent1
        };
      }
    }
        const convertIntelToRepoMapModule1={
    };
        convertIntelToRepoMapModule1.convertIntelToRepoMap=convertIntelToRepoMap,convertIntelToRepoMapModule1.convertFile=convertFile,convertIntelToRepoMapModule1.detectLanguage=detectLanguage,module.exports=convertIntelToRepoMapModule1;
  }
}),requireQueriesCollector=__commonJS({
    '../work/agent-sh__agentsys/lib/repo-intel/queries.js'(exports,module){
        'use strict';
        var fs=((require)(('fs'))),convertIntelToRepoMapValue3=((require)(("path"))),{
            getStateDir:convertIntelToRepoMapValue4
    }
        =((require_state_dir)()),convertIntelToRepoMapError1=((requireBinaryCollector)()),RepoIntelMissingError=class extends Error{
            constructor(convertIntelToRepoMapHelper1){
                {
                    super("repo-intel map not found at "+convertIntelToRepoMapHelper1+(". Run `agentsys repo-intel update` to generate it first.")),this.name="RepoIntelMissingError",this.code="REPO_INTEL_MISSING",this.mapFile=convertIntelToRepoMapHelper1;
        }
      }
    },convertIntelToRepoMapError2="repo-intel.json";
        function buildCacheStatus(cachePath){
            const helperValue50={
      };
            helperValue50.auVpM="agent-analyzer";
            const helperValue51=helperValue50;
            {
                const helperError20=((convertIntelToRepoMapValue4)((cachePath)));
                return convertIntelToRepoMapValue3.join(cachePath,helperError20,convertIntelToRepoMapError2);
      }
    }
        function readCacheFile(cachePath){
            {
                const helperHelper24=((buildCacheStatus)((cachePath)));
                if(!fs.existsSync(helperHelper24))throw new RepoIntelMissingError(helperHelper24);
                return helperHelper24;
      }
    }
        function saveCache(cachePath,cacheData,options){
            const helperValue53=((readCacheFile)((options)));
            const helperValue54=["repo-intel","query",cachePath,...cacheData,"--map-file",helperValue53,options];
            let helperHelper25;
            try{
                {
                    helperHelper25=convertIntelToRepoMapError1.runAnalyzer(helperValue54);
        }
      }
            catch(error){
                {
                    throw new Error("repo-intel query failed ["+cachePath+"]: "+error.message,{
                        'cause':error
          });
        }
      }
            let helperError24;
            try{
                (helperError24=JSON.parse(helperHelper25));
      }
            catch(error){
                {
                    const helperHelper26=helperHelper25.slice((0),(200));
                    throw new Error("repo-intel query ["+cachePath+("] returned non-JSON output: ")+helperHelper26);
        }
      }
            return helperError24;
    }
        function normalizeDetail(detail,fallback){
            if(((typeof detail)!==("string"))||((detail.length)===(0))){
                {
                    throw new TypeError(fallback+(" must be a non-empty string"));
        }
      }
    }
        function hotspots(hotspotsContent1,hotspotsContent2={
    }){
            {
                const hotspotsHelper1=[];
                if(((hotspotsContent2.limit)!=(null)))hotspotsHelper1.push("--top",((String)((hotspotsContent2.limit))));
                return ((saveCache)(("hotspots"),(hotspotsHelper1),(hotspotsContent1)));
      }
    }
        function coupling(couplingContent1,couplingHelper1,couplingContent2={
    }){
            {
                ((normalizeDetail)((couplingHelper1),("coupling: file")));
                const couplingHelper2=[couplingHelper1];
                if(((couplingContent2.limit)!=(null)))couplingHelper2.push("--top",((String)((couplingContent2.limit))));
                return ((saveCache)(("coupling"),(couplingHelper2),(couplingContent1)));
      }
    }
        function busFactor(busFactorContent1,busFactorContent2={
    }){
            {
                const busFactorContent3=[];
                if(busFactorContent2.adjustForAi)busFactorContent3.push("--adjust-for-ai");
                if(((busFactorContent2.limit)!=(null)))busFactorContent3.push("--top",((String)((busFactorContent2.limit))));
                return ((saveCache)(("bus-factor"),(busFactorContent3),(busFactorContent1)));
      }
    }
        function testGaps(testGapsContent1,testGapsHelper1={
    }){
            {
                const testGapsContent2=[];
                if(((testGapsHelper1.limit)!=(null)))testGapsContent2.push("--top",((String)((testGapsHelper1.limit))));
                if(((testGapsHelper1.minChanges)!=(null)))testGapsContent2.push("--min-changes",((String)((testGapsHelper1.minChanges))));
                return ((saveCache)(("test-gaps"),(testGapsContent2),(testGapsContent1)));
      }
    }
        function diffRisk(diffRiskError1,diffRiskError2){
            {
                if(!Array.isArray(diffRiskError2))throw new TypeError("diffRisk: files must be an array of strings");
                if(!diffRiskError2.every(diffRiskError3=>typeof diffRiskError3==="string"))throw new TypeError("diffRisk: all entries in files must be strings");
                const diffRiskHelper1=diffRiskError2.join(',');
                if(((diffRiskHelper1.length)>(30000)))throw new RangeError("diffRisk: files argument exceeds 30000 character limit (got "+diffRiskHelper1.length+')');
                const diffRiskValue1=["--files",diffRiskHelper1];
                return ((saveCache)(("diff-risk"),(diffRiskValue1),(diffRiskError1)));
      }
    }
        function dependents(dependentsContent1,dependentsValue1,dependentsValue2){
            const dependentsValue3={
      };
            dependentsValue3.DSIpt="utf8";
            const dependentsValue4=dependentsValue3;
            {
                ((normalizeDetail)((dependentsValue1),("dependents: symbol")));
                const dependentsContent2=[dependentsValue1];
                if(((dependentsValue2)!=(null))){
                    {
                        ((normalizeDetail)((dependentsValue2),("dependents: file"))),dependentsContent2.push("--file",dependentsValue2);
          }
        }
                return ((saveCache)(("dependents"),(dependentsContent2),(dependentsContent1)));
      }
    }
        function bugspots(bugspotsValue1,bugspotsHelper1={
    }){
            const bugspotsHelper2=[];
            if(((bugspotsHelper1.limit)!=(null)))bugspotsHelper2.push("--top",((String)((bugspotsHelper1.limit))));
            return ((saveCache)(("bugspots"),(bugspotsHelper2),(bugspotsValue1)));
    }
        function health(healthHelper1){
            return (((saveCache)(("health"),([]),(healthHelper1))));
    }
        function communities(communitiesValue1){
            return ((saveCache)(("communities"),([]),(communitiesValue1)));
    }
        function boundaries(boundariesHelper1,boundariesCount1={
    }){
            const boundariesContent1={
      };
            boundariesContent1.caZBn="utf8";
            const boundariesContent2=boundariesContent1;
            {
                const boundariesHelper2=[];
                if(((boundariesCount1.limit)!=(null)))boundariesHelper2.push("--top",((String)((boundariesCount1.limit))));
                return ((saveCache)(("boundaries"),(boundariesHelper2),(boundariesHelper1)));
      }
    }
        function areaOf(areaOfHelper1,areaOfHelper2){
            {
                return ((normalizeDetail)((areaOfHelper2),("areaOf: file"))),((saveCache)(("area-of"),([areaOfHelper2]),(areaOfHelper1)));
      }
    }
        function communityHealth(communityHealthError1,communityHealthContent1){
            if(((typeof communityHealthContent1)!==("number"))||!Number.isInteger(communityHealthContent1)||((communityHealthContent1)<(0))){
                {
                    throw new TypeError("communityHealth: id must be a non-negative integer");
        }
      }
            return ((saveCache)(("community-health"),([((String)((communityHealthContent1)))]),(communityHealthError1)));
    }
        function coldspots(coldspotsCount1,coldspotsCount2={
    }){
            const coldspotsContent1={
      };
            coldspotsContent1.bLqBL="unknown";
            const coldspotsContent2=coldspotsContent1;
            {
                const coldspotsHelper1=[];
                if(((coldspotsCount2.limit)!=(null)))coldspotsHelper1.push("--top",((String)((coldspotsCount2.limit))));
                return ((saveCache)(("coldspots"),(coldspotsHelper1),(coldspotsCount1)));
      }
    }
        function ownership(ownershipHelper1,ownershipHelper2){
            {
                return ((normalizeDetail)((ownershipHelper2),("ownership: file"))),((saveCache)(("ownership"),([ownershipHelper2]),(ownershipHelper1)));
      }
    }
        function norms(normsHelper1){
            return ((saveCache)(("norms"),([]),(normsHelper1)));
    }
        function areas(areasContent1){
            {
                return ((saveCache)(("areas"),([]),(areasContent1)));
      }
    }
        function contributors(contributorsContent1,contributorsHelper1={
    }){
            {
                const contributorsHelper2=[];
                if(((contributorsHelper1.limit)!=(null)))contributorsHelper2.push("--top",((String)((contributorsHelper1.limit))));
                return ((saveCache)(("contributors"),(contributorsHelper2),(contributorsContent1)));
      }
    }
        function releaseInfo(releaseInfoValue1){
            return ((saveCache)(("release-info"),([]),(releaseInfoValue1)));
    }
        function fileHistory(fileHistoryValue1,fileHistoryValue2){
            {
                return ((normalizeDetail)((fileHistoryValue2),("fileHistory: file"))),((saveCache)(("file-history"),([fileHistoryValue2]),(fileHistoryValue1)));
      }
    }
        function conventions(conventionsValue1){
            {
                return ((saveCache)(("conventions"),([]),(conventionsValue1)));
      }
    }
        function docDrift(docDriftValue1,docDriftValue2={
    }){
            const docDriftContent1={
      };
            docDriftContent1.ZOBVq=".claude",docDriftContent1.ZAgSV=".opencode",docDriftContent1.lJNIr=".codex";
            const docDriftContent2=docDriftContent1;
            {
                const docDriftHelper1=[];
                if(((docDriftValue2.limit)!=(null)))docDriftHelper1.push("--top",((String)((docDriftValue2.limit))));
                return ((saveCache)(("doc-drift"),(docDriftHelper1),(docDriftValue1)));
      }
    }
        function onboard(onboardValue1){
            {
                return ((saveCache)(("onboard"),([]),(onboardValue1)));
      }
    }
        function canIHelp(canIHelpContent1){
            {
                return ((saveCache)(("can-i-help"),([]),(canIHelpContent1)));
      }
    }
        function painspots(painspotsItems1,painspotsItems2={
    }){
            const painspotsHelper1=[];
            if(((painspotsItems2.limit)!=(null)))painspotsHelper1.push("--top",((String)((painspotsItems2.limit))));
            return ((saveCache)(("painspots"),(painspotsHelper1),(painspotsItems1)));
    }
        function entryPoints(entryPointsHelper1,entryPointsHelper2={
    }){
            const entryPointsHelper3=[];
            if(entryPointsHelper2.files){
                {
                    const entryPointsValue1=Array.isArray(entryPointsHelper2.files)?entryPointsHelper2.files.join(','):((String)((entryPointsHelper2.files)));
                    entryPointsHelper3.push("--files",entryPointsValue1);
        }
      }
            return ((saveCache)(("entry-points"),(entryPointsHelper3),(entryPointsHelper1)));
    }
        function projectInfo(projectInfoHelper1){
            {
                return ((saveCache)(("project-info"),([]),(projectInfoHelper1)));
      }
    }
        function symbols(symbolsContent1,symbolsContent2){
            return ((((normalizeDetail)((symbolsContent2),("symbols: file"))),((saveCache)(("symbols"),([symbolsContent2]),(symbolsContent1)))));
    }
        function staleDocs(staleDocsContent1,staleDocsContent2={
    }){
            {
                const staleDocsHelper1=[];
                if(((staleDocsContent2.limit)!=(null)))staleDocsHelper1.push("--top",((String)((staleDocsContent2.limit))));
                return ((saveCache)(("stale-docs"),(staleDocsHelper1),(staleDocsContent1)));
      }
    }
        function find(findContent1,findHelper1,findHelper2={
    }){
            ((normalizeDetail)((findHelper1),("find: query")));
            const findHelper3=[findHelper1];
            if(((findHelper2.limit)!=(null)))findHelper3.push("--top",((String)((findHelper2.limit))));
            return ((saveCache)(("find"),(findHelper3),(findContent1)));
    }
        function slopFixes(slopFixesContent1){
            return ((saveCache)(("slop-fixes"),([]),(slopFixesContent1)));
    }
        function slopTargets(slopTargetsContent1,slopTargetsContent2={
    }){
            {
                const slopTargetsHelper1=[];
                if(((slopTargetsContent2.top)!=(null)))slopTargetsHelper1.push("--top",((String)((slopTargetsContent2.top))));
                return ((saveCache)(("slop-targets"),(slopTargetsHelper1),(slopTargetsContent1)));
      }
    }
        function summary(summaryContent1,summaryContent2={
    }){
            const summaryContent3=((readCacheFile)((summaryContent1))),summaryError1=[];
            if(((summaryContent2.depth)!=(null)))summaryError1.push("--depth",((String)((summaryContent2.depth))));
            const summaryValue1=["repo-intel","query","summary",...summaryError1,"--map-file",summaryContent3,summaryContent1];
            let summaryError2;
            try{
                {
                    summaryError2=convertIntelToRepoMapError1.runAnalyzer(summaryValue1).trim();
        }
      }
            catch(error){
                throw new Error("repo-intel query failed [summary]: "+error.message,{
                    'cause':error
        });
      }
            if(((summaryError2)===("null")))return null;
            if(((summaryContent2.depth)!=(null)))return summaryError2;
            try{
                {
                    return JSON.parse(summaryError2);
        }
      }
            catch(error){
                {
                    throw new Error("repo-intel query [summary] returned non-JSON output: "+summaryError2.slice((0),(200)));
        }
      }
    }
        const summaryError3={
    };
        summaryError3.RepoIntelMissingError=RepoIntelMissingError,summaryError3.hotspots=hotspots,summaryError3.coupling=coupling,summaryError3.busFactor=busFactor,summaryError3.testGaps=testGaps,summaryError3.diffRisk=diffRisk,summaryError3.dependents=dependents,summaryError3.bugspots=bugspots,summaryError3.health=health,summaryError3.communities=communities,summaryError3.boundaries=boundaries,summaryError3.areaOf=areaOf,summaryError3.communityHealth=communityHealth,summaryError3.coldspots=coldspots,summaryError3.ownership=ownership,summaryError3.norms=norms,summaryError3.areas=areas,summaryError3.contributors=contributors,summaryError3.releaseInfo=releaseInfo,summaryError3.fileHistory=fileHistory,summaryError3.conventions=conventions,summaryError3.docDrift=docDrift,summaryError3.onboard=onboard,summaryError3.canIHelp=canIHelp,summaryError3.painspots=painspots,summaryError3.entryPoints=entryPoints,summaryError3.projectInfo=projectInfo,summaryError3.symbols=symbols,summaryError3.staleDocs=staleDocs,summaryError3.find=find,summaryError3.slopFixes=slopFixes,summaryError3.slopTargets=slopTargets,summaryError3.summary=summary,module.exports=summaryError3;
  }
}),requirePreferenceCollector=__commonJS({
    '../work/agent-sh__agentsys/lib/repo-intel/embed/preference.js'(exports,module){
        'use strict';
        var fs=((require)(('fs'))),summaryPath1=((require)(("path"))),summaryPath2=((requireCacheCollector)()),VALID_EMBEDDER=["none","small","big"],VALID_DETAIL=["compact","balanced","maximum"];
        function preferencePath(preferencePathValue1){
            {
                return summaryPath1.join(summaryPath2.getStateDirPath(preferencePathValue1),"sources","preference.json");
      }
    }
        function read(readParsedResult1){
            {
                const readHelper1=((preferencePath)((readParsedResult1)));
                if(!fs.existsSync(readHelper1))return{
        };
                try{
                    const readValue1=JSON.parse(fs.readFileSync(readHelper1,"utf8"));
                    return readValue1&&((typeof readValue1)===("object"))?readValue1:{
          };
        }
                catch(error){
                    return{
          };
        }
      }
    }
        function update(updateValue1,updateValue2){
            {
                const updateValue3=((read)((updateValue1))),updateValue4=Object.assign({
        },updateValue3,((updateValue2)||({
        }))),updateValue5=((preferencePath)((updateValue1))),updateHelper1={
        };
                return updateHelper1.recursive=true,fs.mkdirSync(summaryPath1.dirname(updateValue5),updateHelper1),fs.writeFileSync(updateValue5,JSON.stringify(updateValue4,null,(2))),updateValue4;
      }
    }
        function reset(resetHelper1){
            {
                const resetHelper2=((read)((resetHelper1)));
                delete resetHelper2.embedder,delete resetHelper2.embedderDetail;
                const resetValue1=((preferencePath)((resetHelper1))),resetHelper3={
        };
                resetHelper3.recursive=true,fs.mkdirSync(summaryPath1.dirname(resetValue1),resetHelper3),fs.writeFileSync(resetValue1,JSON.stringify(resetHelper2,null,(2)));
      }
    }
        function hasEmbedderChoice(hasEmbedderChoiceValue1){
            const hasEmbedderChoiceValue2=((read)((hasEmbedderChoiceValue1)));
            return VALID_EMBEDDER.includes(hasEmbedderChoiceValue2.embedder);
    }
        function hasDetailChoice(hasDetailChoiceHelper1){
            {
                const hasDetailChoiceValue1=((read)((hasDetailChoiceHelper1)));
                return VALID_DETAIL.includes(hasDetailChoiceValue1.embedderDetail);
      }
    }
        function detailToCliArg(detailToCliArgValue1){
            switch(detailToCliArgValue1){
                case "compact":return "compact";
                case "maximum":return "maximum";
                case "balanced":default:return "balanced";
      }
    }
        const detailToCliArgPath1={
    };
        detailToCliArgPath1.read=read;
        detailToCliArgPath1.update=update,detailToCliArgPath1.reset=reset,detailToCliArgPath1.hasEmbedderChoice=hasEmbedderChoice,detailToCliArgPath1.hasDetailChoice=hasDetailChoice;
        detailToCliArgPath1.detailToCliArg=detailToCliArg,detailToCliArgPath1.preferencePath=preferencePath,detailToCliArgPath1.VALID_EMBEDDER=VALID_EMBEDDER,detailToCliArgPath1.VALID_DETAIL=VALID_DETAIL,module.exports=detailToCliArgPath1;
  }
}),require_shared_helpers=__commonJS({
    '../work/agent-sh__agentsys/lib/binary/shared-helpers.js'(exports,module){
        'use strict';
        var fs=((require)(('fs'))),detailToCliArgFsModule1=((require)(("path"))),detailToCliArgHelper1=((require)(('os'))),detailToCliArgValue2=((require)(("https"))),detailToCliArgResult1=((require)(("child_process"))),DEFAULT_DOWNLOAD_TIMEOUT_MS=(30000),detailToCliArgValue3=(5);
        function downloadToBuffer(downloadToBufferValue1,downloadToBufferValue2){
            const downloadToBufferValue3={
      };
            downloadToBufferValue3.DVyjt="utf8";
            const downloadToBufferValue4=downloadToBufferValue3;
            const downloadToBufferValue5=((downloadToBufferValue2)||({
      })),downloadToBufferValue6=downloadToBufferValue5.userAgent||"agent-sh/binary-resolver",downloadToBufferHelper1=downloadToBufferValue5.timeoutMs||DEFAULT_DOWNLOAD_TIMEOUT_MS;
            return new Promise(function(downloadToBufferHelper2,downloadToBufferError1){
                {
                    const downloadToBufferValue7=process.env.GITHUB_TOKEN||process.env.GH_TOKEN;
                    function downloadToBuffer(url,timeout){
                        if(((((timeout))>((detailToCliArgValue3))))){
                            {
                                ((((downloadToBufferError1))(((new Error((((("Too many redirects fetching from "))+((downloadToBufferValue1))))))))));
                                return;
              }
            }
                        const helperValue56={
            };
                        helperValue56["User-Agent"]=downloadToBufferValue6,helperValue56.Accept="application/octet-stream";
                        const helperValue57=helperValue56;
                        if(downloadToBufferValue7)helperValue57.Authorization=(((("Bearer "))+((downloadToBufferValue7))));
                        const helperValue58={
            };
                        helperValue58.headers=helperValue57,helperValue58.timeout=downloadToBufferHelper1;
                        const helperError28=detailToCliArgValue2.get(url,helperValue58,function(helperError29){
                            const helperValue59=helperError29.statusCode;
                            if(((((((helperValue59)))===(((301))))))||((((((helperValue59)))===(((302))))))||((((((helperValue59)))===(((307))))))||((((((helperValue59)))===(((308))))))){
                                {
                                    helperError29.resume();
                                    var helperError30=helperError29.headers.location;
                                    if(helperError30&&!helperError30.startsWith("https://")){
                                        {
                                            ((((((downloadToBufferError1)))((((new Error((((((("Refusing non-HTTPS redirect to ")))+(((helperError30))))))))))))));
                                            return;
                    }
                  }
                                    ((((((downloadToBuffer)))((((helperError30))),(((((((((timeout)))+(((1)))))))))))));
                                    return;
                }
              }
                            if(((((((helperValue59)))!==(((200))))))){
                                {
                                    helperError29.resume();
                                    const helperError31=((((((helperValue59)))===(((403))))))?" (rate limited - set GITHUB_TOKEN env var)":'';
                                    ((((((downloadToBufferError1)))((((new Error((((((((((((((((((((((((("HTTP ")))+(((helperValue59)))))))))+(((helperError31)))))))))+(((" fetching ")))))))))+(((url))))))))))))));
                                    return;
                }
              }
                            const helperError32=[];
                            helperError29.on("data",function(helperValue60){
                                {
                                    helperError32.push(helperValue60);
                }
              }),helperError29.on("end",function(){
                                (((((((("OfUNO"))))===(((("gvYiC"))))))))?helperError33.frameworks.push(helperError34):((((((((downloadToBufferHelper2))))(((((Buffer.concat(helperError32))))))))));
              });
                            helperError29.on("error",downloadToBufferError1);
            });
                        helperError28.on("error",downloadToBufferError1),helperError28.on("timeout",function(){
                            (((((("TofVD")))!==((("TofVD"))))))?vADYGR.voSXU(helperError35,new helperError36(vADYGR.CEMal(vADYGR.SzXMc,helperValue61||helperValue62.message))):(helperError28.destroy(),((((((downloadToBufferError1)))((((new Error((((((((((((((((((("Timeout (")))+(((downloadToBufferHelper1)))))))))+((("ms) fetching ")))))))))+(((url)))))))))))))));
            });
          }
                    ((downloadToBuffer)((downloadToBufferValue1),(0)));
        }
      });
    }
        function extractTarGz(extractTarGzError1,extractTarGzResult1){
            {
                return new Promise(function(extractTarGzValue1,extractTarGzError2){
                    {
                        const extractTarGzResult2=((((process.platform))===(("win32"))))?extractTarGzResult1.replace(/\\/g,'/'):extractTarGzResult1,extractTarGzError3=detailToCliArgResult1.spawn("tar",['xz','-C',extractTarGzResult2],{
                            'stdio':["pipe","pipe","pipe"]
            });
                        let extractTarGzValue2='';
                        extractTarGzError3.stderr.on("data",function(extractTarGzValue3){
                            extractTarGzValue2+=extractTarGzValue3;
            }),extractTarGzError3.stdin.write(extractTarGzError1),extractTarGzError3.stdin.end(),extractTarGzError3.on("close",function(extractTarGzHelper1){
                            {
                                ((((((extractTarGzHelper1)))!==(((0))))))?((((((extractTarGzError2)))((((new Error((((((((((((((((((("tar extraction failed (code ")))+(((extractTarGzHelper1)))))))))+((("): ")))))))))+(((extractTarGzValue2)))))))))))))):((((((extractTarGzValue1)))())));
              }
            }),extractTarGzError3.on("error",extractTarGzError2);
          }
        });
      }
    }
        function extractZip(extractZipPath1,extractZipValue1,extractZipValue2){
            {
                return new Promise(function(extractZipValue3,extractZipValue4){
                    var extractZipPath2=fs.mkdtempSync(detailToCliArgFsModule1.join(detailToCliArgHelper1.tmpdir(),((((extractZipValue2))+(('-')))))),extractZipPath3=detailToCliArgFsModule1.join(extractZipPath2,"archive.zip");
                    fs.writeFileSync(extractZipPath3,extractZipPath1);
                    var extractZipValue5=detailToCliArgResult1.spawn("powershell",["-NoProfile","-NonInteractive","-Command","Expand-Archive","-Path",extractZipPath3,"-DestinationPath",extractZipValue1,"-Force"],{
                        'stdio':["ignore","pipe","pipe"]
          }),extractZipValue6='';
                    extractZipValue5.stderr.on("data",function(extractZipValue7){
                        {
                            extractZipValue6+=extractZipValue7;
            }
          }),extractZipValue5.on("close",function(extractZipError1){
                        {
                            try{
                                {
                                    const extractZipError2={
                  };
                                    extractZipError2.recursive=true,extractZipError2.force=true,fs.rmSync(extractZipPath2,extractZipError2);
                }
              }
                            catch(error){
              }
                            ((((extractZipError1))!==((0))))?((((extractZipValue4))(((new Error((((((((((((("zip extraction failed (code "))+((extractZipError1))))))+(("): "))))))+((extractZipValue6)))))))))):((((extractZipValue3))()));
            }
          });
                    extractZipValue5.on("error",extractZipValue4);
        });
      }
    }
        const extractZipValue8={
    };
        extractZipValue8.downloadToBuffer=downloadToBuffer,extractZipValue8.extractTarGz=extractTarGz,extractZipValue8.extractZip=extractZip,extractZipValue8.DEFAULT_DOWNLOAD_TIMEOUT_MS=DEFAULT_DOWNLOAD_TIMEOUT_MS,module.exports=extractZipValue8;
  }
}),require_binary2=__commonJS({
    '../work/agent-sh__agentsys/lib/repo-intel/embed/binary.js'(exports,module){
        'use strict';
        var fs=((require)(('fs'))),extractZipFsModule1=((require)(("path"))),extractZipFsModule2=((require)(('os'))),extractZipFsModule3=((require)(("https"))),extractZipFsModule4=((require)(("child_process"))),extractZipFsModule5=((requireBinaryCollector)()),extractZipHelper1=((require_shared_helpers)()),EMBED_BINARY_NAME="agent-analyzer-embed",extractZipError3="agent-sh/agent-analyzer",extractZipValue9=((((60)*(60)))*(1000)),extractZipValue10=extractZipFsModule5.PLATFORM_MAP;
        function getBinaryPath(){
            const getBinaryPathHelper2=((process.platform)===("win32"))?".exe":'';
            return extractZipFsModule1.join(extractZipFsModule2.homedir(),".agent-sh","bin",((EMBED_BINARY_NAME)+(getBinaryPathHelper2)));
    }
        function getBundledOrtName(){
            if(((process.platform)===("win32")))return "onnxruntime.dll";
            if(((process.platform)===("darwin")))return "libonnxruntime.dylib";
            return "libonnxruntime.so";
    }
        function getBundledOrtPath(){
            return extractZipFsModule1.join(extractZipFsModule1.dirname(((getBinaryPath)())),((getBundledOrtName)()));
    }
        function platformBundlesOrt(){
            const platformBundlesOrtHelper1=((getPlatformKey)());
            return!!platformBundlesOrtHelper1&&!platformBundlesOrtHelper1.includes("musl");
    }
        function getPlatformKey(){
            const getPlatformKeyPath1=((((process.platform)+('-')))+(process.arch));
            return extractZipValue10[getPlatformKeyPath1]||null;
    }
        function getVersion(){
            const getVersionValue4=((getBinaryPath)());
            if(!fs.existsSync(getVersionValue4))return null;
            try{
                const getVersionHelper1=extractZipFsModule4.execFileSync(getVersionValue4,["--version"],{
                    'timeout':5000,'encoding':"utf8",'stdio':["pipe","pipe","pipe"],'windowsHide':true
        }),getVersionHelper2=getVersionHelper1.trim().match(/(\d+\.\d+\.\d+)/);
                return getVersionHelper2?getVersionHelper2[(1)]:getVersionHelper1.trim();
      }
            catch(error){
                return null;
      }
    }
        function isAvailable(){
            return fs.existsSync(((getBinaryPath)()));
    }
        var isAvailableValue3=null;
        async function getLatestReleaseVersion(){
            {
                if(isAvailableValue3&&((((Date.now())-(isAvailableValue3.fetchedAt)))<(extractZipValue9))){
                    {
                        return isAvailableValue3.version;
          }
        }
                return new Promise(function(getLatestReleaseVersionError1,getLatestReleaseVersionValue1){
                    const getLatestReleaseVersionValue2=process.env.GITHUB_TOKEN||process.env.GH_TOKEN,getLatestReleaseVersionValue3={
          };
                    getLatestReleaseVersionValue3["User-Agent"]="agent-sh/embed-resolver",getLatestReleaseVersionValue3.Accept="application/vnd.github+json";
                    const getLatestReleaseVersionValue4=getLatestReleaseVersionValue3;
                    if(getLatestReleaseVersionValue2)getLatestReleaseVersionValue4.Authorization=(("Bearer ")+(getLatestReleaseVersionValue2));
                    const getLatestReleaseVersionError2=(((("https://api.github.com/repos/")+(extractZipError3)))+("/releases/latest")),getLatestReleaseVersionError3=function(getLatestReleaseVersionValue5){
                        (((("nvhMP"))===(("HdcrM"))))?getLatestReleaseVersionValue6.chmodSync(getLatestReleaseVersionValue7,(493)):((((getLatestReleaseVersionValue1))(((new Error(((((((((getLatestReleaseVersionValue5))+((" fetching "))))))+((getLatestReleaseVersionError2))))))))));
          },getLatestReleaseVersionValue8={
          };
                    getLatestReleaseVersionValue8.headers=getLatestReleaseVersionValue4;
                    getLatestReleaseVersionValue8.timeout=5000;
                    const getLatestReleaseVersionHelper1=extractZipFsModule3.get(getLatestReleaseVersionError2,getLatestReleaseVersionValue8,function(getLatestReleaseVersionResult1){
                        {
                            if(((((getLatestReleaseVersionResult1.statusCode))!==((200))))){
                                getLatestReleaseVersionResult1.resume(),((((getLatestReleaseVersionError3))((((((("HTTP "))+((getLatestReleaseVersionResult1.statusCode)))))))));
                                return;
              }
                            const getLatestReleaseVersionValue9=[];
                            getLatestReleaseVersionResult1.on("data",function(getLatestReleaseVersionValue10){
                                getLatestReleaseVersionValue9.push(getLatestReleaseVersionValue10);
              }),getLatestReleaseVersionResult1.on("end",function(){
                                {
                                    try{
                                        {
                                            const getLatestReleaseVersionValue11=JSON.parse(Buffer.concat(getLatestReleaseVersionValue9).toString("utf8")),getLatestReleaseVersionValue12=getLatestReleaseVersionValue11&&getLatestReleaseVersionValue11.tag_name||'',getLatestReleaseVersionError4=getLatestReleaseVersionValue12.replace(/^v/,'');
                                            /^\d+\.\d+\.\d+/.test(getLatestReleaseVersionError4)?(isAvailableValue3={
                                                'version':getLatestReleaseVersionError4,'fetchedAt':Date.now()
                      },((((((getLatestReleaseVersionError1)))((((getLatestReleaseVersionError4)))))))):((((((getLatestReleaseVersionError3)))(((("No valid release tag")))))));
                    }
                  }
                                    catch(error){
                                        (((((("wafMl")))!==((("wafMl"))))))?getLatestReleaseVersionError5.unlinkSync(getLatestReleaseVersionValue13):((((((getLatestReleaseVersionError3)))(((((((((("Failed to parse release JSON: ")))+(((error.message)))))))))))));
                  }
                }
              }),getLatestReleaseVersionResult1.on("error",function(getLatestReleaseVersionError6){
                                {
                                    ((((getLatestReleaseVersionError3))(((getLatestReleaseVersionError6.message)))));
                }
              });
            }
          });
                    getLatestReleaseVersionHelper1.on("error",function(getLatestReleaseVersionValue14){
                        (((("qOZTk"))===(("NSkDI"))))?ftVvyK.TLmOm(getLatestReleaseVersionValue15,getLatestReleaseVersionValue16,getLatestReleaseVersionValue17[getLatestReleaseVersionValue18]):((((getLatestReleaseVersionError3))(((getLatestReleaseVersionValue14.message)))));
          }),getLatestReleaseVersionHelper1.on("timeout",function(){
                        {
                            getLatestReleaseVersionHelper1.destroy(),((((getLatestReleaseVersionError3))((("Timeout")))));
            }
          });
        });
      }
    }
        function buildDownloadUrl(buildDownloadUrlValue3,buildDownloadUrlValue4){
            const buildDownloadUrlValue5=((process.platform)===("win32"))?".zip":".tar.gz";
            return (((((((((((((((("https://github.com/")+(extractZipError3)))+("/releases/download/v")))+(buildDownloadUrlValue3)))+('/')))+(EMBED_BINARY_NAME)))+('-')))+(buildDownloadUrlValue4)))+(buildDownloadUrlValue5));
    }
        function resolveBundledBinary(binaryName){
            {
                const helperHelper29={
        };
                return helperHelper29.userAgent="agent-sh/embed-resolver",extractZipHelper1.downloadToBuffer(binaryName,helperHelper29);
      }
    }
        var helperValue64=extractZipHelper1.extractTarGz,helperError38=extractZipHelper1.extractZip;
        async function downloadBinary(destinationPath){
            const helperPath9=((getPlatformKey)());
            if(!helperPath9){
                {
                    throw new Error((((((((((("Unsupported platform: ")+(process.platform)))+('-')))+(process.arch)))+(". Supported: ")))+(Object.keys(extractZipValue10).join(',\x20'))));
        }
      }
            const helperError39=((buildDownloadUrl)((destinationPath),(helperPath9)));
            process.stderr.write((((((((((((("Downloading ")+(EMBED_BINARY_NAME)))+('\x20v')))+(destinationPath)))+(" for ")))+(helperPath9)))+("...\n")));
            const helperHelper30=((getBinaryPath)()),helperError40=extractZipFsModule1.dirname(helperHelper30),helperError41={
      };
            helperError41.recursive=true,fs.mkdirSync(helperError40,helperError41);
            let helperError42;
            try{
                helperError42=await ((resolveBundledBinary)((helperError39)));
      }
            catch(error){
                {
                    throw new Error((((((((((((((((((((((("Failed to download ")+(EMBED_BINARY_NAME)))+(":\n  URL: ")))+(helperError39)))+("\n  Error: ")))+(error.message)))+("\n\nTo install manually:\n  1. Download: ")))+(helperError39)))+("\n  2. Extract the binary to: ")))+(helperError40)))+("\n  3. Ensure it is named: ")))+(extractZipFsModule1.basename(helperHelper30))));
        }
      }
            if(((process.platform)===("win32"))){
                {
                    await ((helperError38)((helperError42),(helperError40),(extractZipFsModule1.basename(helperHelper30))));
        }
      }
            else (await ((helperValue64)((helperError42),(helperError40))));
            return ((process.platform)!==("win32"))&&fs.chmodSync(helperHelper30,(493)),helperHelper30;
    }
        async function ensureBinary(ensureBinaryPath1){
            const ensureBinaryPath2=((ensureBinaryPath1)||({
      })),ensureBinaryPath3=((getBinaryPath)());
            if(fs.existsSync(ensureBinaryPath3)){
                {
                    if(((platformBundlesOrt)())&&!fs.existsSync(((getBundledOrtPath)()))){
                        const ensureBinaryValue5=ensureBinaryPath2.version||await ((getLatestReleaseVersion)());
                        return ((downloadBinary)((ensureBinaryValue5)));
          }
                    return ensureBinaryPath3;
        }
      }
            const ensureBinaryPath4=ensureBinaryPath2.version||await ((getLatestReleaseVersion)());
            return ((downloadBinary)((ensureBinaryPath4)));
    }
        const ensureBinaryPath5={
    };
        ensureBinaryPath5.EMBED_BINARY_NAME=EMBED_BINARY_NAME,ensureBinaryPath5.getBinaryPath=getBinaryPath,ensureBinaryPath5.getBundledOrtName=getBundledOrtName,ensureBinaryPath5.getBundledOrtPath=getBundledOrtPath;
        ensureBinaryPath5.platformBundlesOrt=platformBundlesOrt,ensureBinaryPath5.getVersion=getVersion,ensureBinaryPath5.getPlatformKey=getPlatformKey,ensureBinaryPath5.getLatestReleaseVersion=getLatestReleaseVersion,ensureBinaryPath5.isAvailable=isAvailable;
        ensureBinaryPath5.ensureBinary=ensureBinary,ensureBinaryPath5.buildDownloadUrl=buildDownloadUrl,module.exports=ensureBinaryPath5;
  }
}),requireOrchestratorCollector=__commonJS({
    '../work/agent-sh__agentsys/lib/repo-intel/embed/orchestrator.js'(exports,module){
        'use strict';
        var fs=((require)(('fs')));
        var path=((require)(("path"))),ensureBinaryHelper2=((require)(("child_process"))),ensureBinaryHelper3=((requirePreferenceCollector)()),ensureBinaryHelper4=((require_binary2)()),ensureBinaryValue6=((requireBinaryCollector)()),ensureBinaryValue7=((requireCacheCollector)());
        function isEnabled(isEnabledHelper1){
            const isEnabledValue1=ensureBinaryHelper3.read(isEnabledHelper1);
            return ((isEnabledValue1.embedder)===("small"))||((isEnabledValue1.embedder)===("big"));
    }
        async function runScan(runScanValue1){
            if(!((isEnabled)((runScanValue1)))){
                const runScanPath1={
        };
                return runScanPath1.ran=false,runScanPath1.reason="embedder preference is \"none\" or unset",runScanPath1;
      }
            const runScanHelper1=ensureBinaryHelper3.read(runScanValue1),runScanValue2=ensureBinaryHelper3.detailToCliArg(runScanHelper1.embedderDetail||"balanced");
            const runScanValue3=ensureBinaryValue7.getPath(runScanValue1);
            if(!fs.existsSync(runScanValue3)){
                const runScanValue4={
        };
                return runScanValue4.ran=false,runScanValue4.reason="no repo-intel map found; run `/repo-intel init` first",runScanValue4;
      }
            const runScanValue5=Date.now(),runScanValue6=await ensureBinaryHelper4.ensureBinary(),runScanValue7=await ensureBinaryValue6.ensureBinary();
            const runScanValue8=await ((streamEmbedToSetEmbeddings)((runScanValue6),(["scan",runScanValue1,"--variant",runScanHelper1.embedder,"--detail",runScanValue2]),(runScanValue7),(runScanValue3)));
            return Object.assign({
                'ran':true,'durationMs':((Date.now())-(runScanValue5))
      },runScanValue8);
    }
        async function runUpdate(runUpdateValue1){
            {
                if(!((isEnabled)((runUpdateValue1)))){
                    const runUpdatePath1={
          };
                    return runUpdatePath1.ran=false,runUpdatePath1.reason="embedder preference is \"none\" or unset",runUpdatePath1;
        }
                const runUpdateHelper1=ensureBinaryHelper3.read(runUpdateValue1),runUpdateValue2=ensureBinaryHelper3.detailToCliArg(runUpdateHelper1.embedderDetail||"balanced"),runUpdateValue3=ensureBinaryValue7.getPath(runUpdateValue1);
                if(!fs.existsSync(runUpdateValue3)){
                    {
                        const runUpdateValue4={
            };
                        return runUpdateValue4.ran=false,runUpdateValue4.reason="no repo-intel map; run `/repo-intel init` then `enrich`",runUpdateValue4;
          }
        }
                const runUpdatePath2=Date.now(),runUpdateValue5=await ensureBinaryHelper4.ensureBinary(),runUpdateValue6=await ensureBinaryValue6.ensureBinary(),runUpdateValue7=await ((streamEmbedToSetEmbeddings)((runUpdateValue5),(["update",runUpdateValue1,"--map-file",runUpdateValue3,"--variant",runUpdateHelper1.embedder,"--detail",runUpdateValue2]),(runUpdateValue6),(runUpdateValue3)));
                return Object.assign({
                    'ran':true,'durationMs':((Date.now())-(runUpdatePath2))
        },runUpdateValue7);
      }
    }
        function status(statusPath1){
            {
                const statusPath2=ensureBinaryHelper3.read(statusPath1),statusValue1=ensureBinaryValue7.getPath(statusPath1),statusValue2=((getEmbeddingStatus)((statusValue1)));
                return{
                    'enabled':((isEnabled)((statusPath1))),'embedder':statusPath2.embedder,'embedderDetail':statusPath2.embedderDetail,'binaryInstalled':ensureBinaryHelper4.isAvailable(),'ortBundled':!ensureBinaryHelper4.platformBundlesOrt()||fs.existsSync(ensureBinaryHelper4.getBundledOrtPath()),'sidecarExists':fs.existsSync(statusValue2),'sidecarPath':statusValue2
        };
      }
    }
        function streamEmbedToSetEmbeddings(streamEmbedToSetEmbeddingsValue1,streamEmbedToSetEmbeddingsValue2,streamEmbedToSetEmbeddingsValue3,streamEmbedToSetEmbeddingsValue4){
            {
                return new Promise(function(streamEmbedToSetEmbeddingsValue5,streamEmbedToSetEmbeddingsHelper1){
                    {
                        const streamEmbedToSetEmbeddingsValue6={
            };
                        streamEmbedToSetEmbeddingsValue6.stdio=["ignore","pipe","pipe"],streamEmbedToSetEmbeddingsValue6.windowsHide=true;
                        const streamEmbedToSetEmbeddingsError1=ensureBinaryHelper2.spawn(streamEmbedToSetEmbeddingsValue1,streamEmbedToSetEmbeddingsValue2,streamEmbedToSetEmbeddingsValue6),streamEmbedToSetEmbeddingsError2=ensureBinaryHelper2.spawn(streamEmbedToSetEmbeddingsValue3,["repo-intel","set-embeddings","--map-file",streamEmbedToSetEmbeddingsValue4,"--input",'-'],{
                            'stdio':["pipe","pipe","pipe"],'windowsHide':true
            });
                        let streamEmbedToSetEmbeddingsError3=null,streamEmbedToSetEmbeddingsPath1=null,streamEmbedToSetEmbeddingsError4=false,streamEmbedToSetEmbeddingsValue7='',streamEmbedToSetEmbeddingsError5='',streamEmbedToSetEmbeddingsContent1='';
                        function extractEmbeddedModel(embeddingPath,modelName){
                            {
                                if(streamEmbedToSetEmbeddingsError4)return;
                                streamEmbedToSetEmbeddingsError4=true;
                                if(embeddingPath){
                                    {
                                        try{
                                            {
                                                streamEmbedToSetEmbeddingsError1.kill("SIGTERM");
                      }
                    }
                                        catch(error){
                    }
                                        try{
                                            {
                                                streamEmbedToSetEmbeddingsError2.kill("SIGTERM");
                      }
                    }
                                        catch(error){
                    }
                                        ((((streamEmbedToSetEmbeddingsHelper1))(((embeddingPath)))));
                  }
                }
                                else ((((streamEmbedToSetEmbeddingsValue5))(((modelName)))));
              }
            }
                        function getEmbeddedModelPath(){
                            {
                                if(streamEmbedToSetEmbeddingsError4||((((streamEmbedToSetEmbeddingsError3))===((null))))||((((streamEmbedToSetEmbeddingsPath1))===((null)))))return;
                                if(((((streamEmbedToSetEmbeddingsError3))!==((0)))))return (((("uUSnX"))!==(("uUSnX"))))?false:((((extractEmbeddedModel))(((new Error(((((((((((((ensureBinaryHelper4.EMBED_BINARY_NAME))+((" exited "))))))+((streamEmbedToSetEmbeddingsError3))))))+((streamEmbedToSetEmbeddingsError5.trim()?((((':\x20'))+((streamEmbedToSetEmbeddingsError5.trim().slice((0),(500)))))):''))))))))));
                                if(((((streamEmbedToSetEmbeddingsPath1))!==((0))))){
                                    {
                                        return ((((extractEmbeddedModel))(((new Error((((((((("agent-analyzer set-embeddings exited "))+((streamEmbedToSetEmbeddingsPath1))))))+((streamEmbedToSetEmbeddingsContent1.trim()?((((':\x20'))+((streamEmbedToSetEmbeddingsContent1.trim().slice((0),(500)))))):''))))))))));
                  }
                }
                                const helperValue67=streamEmbedToSetEmbeddingsValue7.match(/(\d+)\s+files?/);
                                ((((extractEmbeddedModel))(((null)),(({
                                    'files':helperValue67?((((parseInt))(((helperValue67[(1)])),((10))))):void(0)
                })))));
              }
            }
                        streamEmbedToSetEmbeddingsError1.stderr.on("data",function(helperValue68){
                            const helperValue69={
              };
                            helperValue69.YEryD="Base commit no longer exists (rebased?)";
                            const helperValue70=helperValue69;
                            {
                                streamEmbedToSetEmbeddingsError5+=helperValue68.toString("utf8");
              }
            }),streamEmbedToSetEmbeddingsError2.stderr.on("data",function(helperError44){
                            {
                                streamEmbedToSetEmbeddingsContent1+=helperError44.toString("utf8");
              }
            }),streamEmbedToSetEmbeddingsError2.stdout.on("data",function(helperValue71){
                            streamEmbedToSetEmbeddingsValue7+=helperValue71.toString("utf8");
            }),streamEmbedToSetEmbeddingsError1.stdout.on("error",function(helperError45){
                            {
                                ((((extractEmbeddedModel))(((helperError45)))));
              }
            }),streamEmbedToSetEmbeddingsError2.stdin.on("error",function(helperError46){
                            if(helperError46&&((((helperError46.code))!==(("EPIPE")))))((((extractEmbeddedModel))(((helperError46)))));
            }),streamEmbedToSetEmbeddingsError1.stdout.pipe(streamEmbedToSetEmbeddingsError2.stdin),streamEmbedToSetEmbeddingsError1.on("error",function(helperError47){
                            (((("ubSon"))!==(("pRLpc"))))?((((extractEmbeddedModel))(((helperError47))))):((((helperValue72))(((helperValue73)),((helperValue74)))));
            }),streamEmbedToSetEmbeddingsError2.on("error",function(helperValue75){
                            const helperValue76={
              };
                            helperValue76.gUJMm=".codex";
                            const helperValue77=helperValue76;
                            {
                                ((((extractEmbeddedModel))(((helperValue75)))));
              }
            }),streamEmbedToSetEmbeddingsError1.on("close",function(helperValue78){
                            (((("jThTR"))!==(("jThTR"))))?helperValue79.ensureBinarySync():(streamEmbedToSetEmbeddingsError3=helperValue78,((((getEmbeddedModelPath))())));
            }),streamEmbedToSetEmbeddingsError2.on("close",function(helperPath11){
                            {
                                streamEmbedToSetEmbeddingsPath1=helperPath11,((((getEmbeddedModelPath))()));
              }
            });
          }
        });
      }
    }
        function getEmbeddingStatus(embeddingPath){
            {
                if(!embeddingPath)return'';
                const helperValue80=path.dirname(embeddingPath),helperValue81=path.basename(embeddingPath,path.extname(embeddingPath));
                return path.join(helperValue80,((helperValue81)+(".embeddings.bin")));
      }
    }
        const helperCount5={
    };
        helperCount5.isEnabled=isEnabled,helperCount5.runScan=runScan,helperCount5.runUpdate=runUpdate,helperCount5.status=status,helperCount5.streamEmbedToSetEmbeddings=streamEmbedToSetEmbeddings,module.exports=helperCount5;
  }
}),requireEmbedCollector=__commonJS({
    '../work/agent-sh__agentsys/lib/repo-intel/embed/index.js'(exports,module){
        'use strict';
        const helperModule2="2|0|1|4|3".split('|');
        let helperValue82=(0);
        'use strict';
        var preference=((requirePreferenceCollector)());
        var binary=((require_binary2)());
        var orchestrator=((requireOrchestratorCollector)());
        const helperValue83={
    };
        helperValue83.preference=preference,helperValue83.binary=binary,helperValue83.orchestrator=orchestrator,helperValue83.isEnabled=orchestrator.isEnabled,helperValue83.runScan=orchestrator.runScan,helperValue83.runUpdate=orchestrator.runUpdate,helperValue83.status=orchestrator.status,module.exports=helperValue83;
  }
}),require_repo_intel=__commonJS({
    '../work/agent-sh__agentsys/lib/repo-intel/index.js'(exports,module){
        'use strict';
        var fs=((require)(('fs'))),helperModule3=((require)(("path"))),helperModule4=((require)(("child_process"))),{
            execFileSync:helperModule5
    }
        =helperModule4,installer=((requireInstallerCollector)()),cache=((requireCacheCollector)());
        var updater=((requireUpdaterCollector)()),converter=((requireConverterCollector)()),queries=((requireQueriesCollector)()),helperRepointeljsonModule1=((requireBinaryCollector)()),{
            getStateDirPath:helperHelper31
    }
        =((require_state_dir)()),{
            writeJsonAtomic:helperHelper32
    }
        =((require_atomic_write)()),helperValue84="repo-intel.json";
        function getOrCreateEmbedding(embeddingPath){
            return helperModule3.join(((helperHelper31)((embeddingPath))),helperValue84);
    }
        async function init(initError1,initError2={
    }){
            {
                const initError3=await installer.checkInstalled();
                if(!initError3.found)return{
                    'success':false,'error':(("agent-analyzer binary unavailable: ")+(initError3.error||"unknown error")),'installSuggestion':installer.getInstallInstructions()
        };
                const initError4=cache.load(initError1);
                if(initError4&&!initError2.force){
                    {
                        return{
                            'success':false,'error':"Repo map already exists. Use --force to rebuild or update to refresh.",'existing':cache.getStatus(initError1)
            };
          }
        }
                const initError5=Date.now();
                let initError6;
                try{
                    {
                        initError6=await helperRepointeljsonModule1.runAnalyzerAsync(["repo-intel","init",initError1]);
          }
        }
                catch(error){
                    {
                        return{
                            'success':false,'error':(("agent-analyzer repo-intel init failed: ")+(error.message))
            };
          }
        }
                let initError7;
                try{
                    initError7=JSON.parse(initError6);
        }
                catch(error){
                    {
                        return{
                            'success':false,'error':(("Failed to parse repo-intel output: ")+(error.message))
            };
          }
        }
                const initValue1=((getOrCreateEmbedding)((initError1)));
                try{
                    (((helperHelper32)((initValue1),(initError7))));
        }
                catch{
        }
                const initHelper1=converter.convertIntelToRepoMap(initError7);
                return initHelper1.stats.scanDurationMs=((Date.now())-(initError5)),cache.save(initError1,initHelper1),{
                    'success':true,'map':initHelper1,'summary':{
                        'files':Object.keys(initHelper1.files).length,'symbols':initHelper1.stats.totalSymbols,'languages':initHelper1.project.languages,'duration':initHelper1.stats.scanDurationMs
          }
        };
      }
    }
        async function update(updateError1,updateError2={
    }){
            {
                const updateError3=await installer.checkInstalled();
                if(!updateError3.found)return{
                    'success':false,'error':(("agent-analyzer binary unavailable: ")+(updateError3.error||"unknown error")),'installSuggestion':installer.getInstallInstructions()
        };
                if(!cache.exists(updateError1)){
                    {
                        const updateValue6={
            };
                        return updateValue6.success=false,updateValue6.error="No repo map found. Run init first.",updateValue6;
          }
        }
                if(updateError2.full){
                    const updateValue7={
          };
                    return updateValue7.force=true,((init)((updateError1),(updateValue7)));
        }
                const updateValue8=((getOrCreateEmbedding)((updateError1)));
                if(!fs.existsSync(updateValue8)){
                    const updateValue9={
          };
                    return updateValue9.force=true,((init)((updateError1),(updateValue9)));
        }
                const updateError4=Date.now();
                let updateError5;
                try{
                    updateError5=await helperRepointeljsonModule1.runAnalyzerAsync(["repo-intel","update","--map-file",updateValue8,updateError1]);
        }
                catch(error){
                    return{
                        'success':false,'error':(("agent-analyzer repo-intel update failed: ")+(error.message))
          };
        }
                let updateError6;
                try{
                    (updateError6=JSON.parse(updateError5));
        }
                catch(error){
                    {
                        return{
                            'success':false,'error':(("Failed to parse repo-intel update output: ")+(error.message))
            };
          }
        }
                try{
                    {
                        ((helperHelper32)((updateValue8),(updateError6)));
          }
        }
                catch{
        }
                const updateHelper2=converter.convertIntelToRepoMap(updateError6);
                return updateHelper2.stats.scanDurationMs=((Date.now())-(updateError4)),cache.save(updateError1,updateHelper2),{
                    'success':true,'map':updateHelper2,'summary':{
                        'files':Object.keys(updateHelper2.files).length,'symbols':updateHelper2.stats.totalSymbols,'duration':updateHelper2.stats.scanDurationMs
          }
        };
      }
    }
        function status(statusPath4){
            {
                const statusPath5=cache.load(statusPath4);
                if(!statusPath5){
                    {
                        const statusValue3={
            };
                        return statusValue3.exists=false,statusValue3;
          }
        }
                const statusValue4=updater.checkStaleness(statusPath4,statusPath5);
                let statusHelper1;
                try{
                    {
                        statusHelper1=((helperModule5)(("git"),(["rev-parse","--abbrev-ref","HEAD"]),({
                            'cwd':statusPath4,'encoding':"utf8"
            }))).trim();
          }
        }
                catch{
        }
                return{
                    'exists':true,'status':{
                        'generated':statusPath5.generated,'updated':statusPath5.updated,'commit':statusPath5.git?.["commit"],'branch':statusHelper1,'files':Object.keys(statusPath5.files).length,'symbols':statusPath5.stats?.["totalSymbols"]||(0),'languages':statusPath5.project?.["languages"]||[],'staleness':statusValue4
          }
        };
      }
    }
        function load(loadHelper2){
            return (cache.load(loadHelper2));
    }
        function exists(existsParsedResult1){
            {
                return cache.exists(existsParsedResult1);
      }
    }
        function loadRaw(loadRawError1){
            const loadRawHelper1=((getOrCreateEmbedding)((loadRawError1)));
            if(!fs.existsSync(loadRawHelper1))return null;
            try{
                return JSON.parse(fs.readFileSync(loadRawHelper1,"utf8"));
      }
            catch{
                return null;
      }
    }
        async function runRepoMapCommand(command,options){
            {
                const helperValue87=await helperRepointeljsonModule1.ensureBinary();
                return new Promise((helperError50,helperValue88)=>{
                    {
                        const helperContent5={
            };
                        helperContent5.stdio=["pipe","pipe","pipe"],helperContent5.windowsHide=true;
                        const helperResult1=helperModule4.spawn(helperValue87,command,helperContent5);
                        let helperHelper33='',helperHelper34='';
                        helperResult1.stdout.on("data",helperContent6=>{
                            {
                                helperHelper33+=helperContent6.toString("utf8");
              }
            }),helperResult1.stderr.on("data",helperValue89=>{
                            helperHelper34+=helperValue89.toString("utf8");
            }),helperResult1.on("error",helperValue88),helperResult1.on("close",helperValue90=>{
                            const helperValue91={
              };
                            helperValue91.XZBqZ="[WARN] skipChecksum=true - SHA-256 verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n";
                            const helperValue92=helperValue91;
                            {
                                if(((((helperValue90))===((0))))){
                                    {
                                        const helperError51={
                    };
                                        helperError51.stdout=helperHelper33,helperError51.stderr=helperHelper34,((((helperError50))(((helperError51)))));
                  }
                }
                                else{
                                    {
                                        ((((helperValue88))(((new Error("agent-analyzer "+command.join('\x20')+" exited "+helperValue90+':\x20'+(helperHelper34.trim()||helperHelper33.trim())))))));
                  }
                }
              }
            }),helperResult1.stdin.write(options),helperResult1.stdin.end();
          }
        });
      }
    }
        async function applyDescriptors(applyDescriptorsHelper1,applyDescriptorsError1){
            {
                if(!applyDescriptorsError1||((typeof applyDescriptorsError1)!==("object")))throw new Error("applyDescriptors requires an object {path: descriptor}");
                const applyDescriptorsError2=((getOrCreateEmbedding)((applyDescriptorsHelper1)));
                if(!fs.existsSync(applyDescriptorsError2))throw new Error((((("No repo-intel artifact for ")+(applyDescriptorsHelper1)))+("; run init first.")));
                await ((runRepoMapCommand)((["repo-intel","set-descriptors","--map-file",applyDescriptorsError2,"--input",'-']),(JSON.stringify(applyDescriptorsError1))));
      }
    }
        async function applySummary(applySummaryHelper1,applySummaryError1){
            {
                if(!applySummaryError1||!applySummaryError1.depth1||!applySummaryError1.depth3||!applySummaryError1.depth10){
                    {
                        throw new Error("applySummary requires {depth1, depth3, depth10, inputHash}");
          }
        }
                const applySummaryHelper2=((getOrCreateEmbedding)((applySummaryHelper1)));
                if(!fs.existsSync(applySummaryHelper2)){
                    {
                        throw new Error((((("No repo-intel artifact for ")+(applySummaryHelper1)))+("; run init first.")));
          }
        }
                await ((runRepoMapCommand)((["repo-intel","set-summary","--map-file",applySummaryHelper2,"--input",'-']),(JSON.stringify(applySummaryError1))));
      }
    }
        async function checkAstGrepInstalled(){
            return installer.checkInstalled();
    }
        function getInstallInstructions(){
            const getInstallInstructionsValue1={
      };
            getInstallInstructionsValue1.eXLUg="--version",getInstallInstructionsValue1.ZuEtq="utf8",getInstallInstructionsValue1.AAgsc="pipe";
            const getInstallInstructionsValue2=getInstallInstructionsValue1;
            {
                return installer.getInstallInstructions();
      }
    }
        const getInstallInstructionsValue3={
    };
        getInstallInstructionsValue3.init=init,getInstallInstructionsValue3.update=update,getInstallInstructionsValue3.status=status,getInstallInstructionsValue3.load=load,getInstallInstructionsValue3.loadRaw=loadRaw,getInstallInstructionsValue3.exists=exists,getInstallInstructionsValue3.applyDescriptors=applyDescriptors,getInstallInstructionsValue3.applySummary=applySummary,getInstallInstructionsValue3.checkAstGrepInstalled=checkAstGrepInstalled;
        getInstallInstructionsValue3.getInstallInstructions=getInstallInstructions,getInstallInstructionsValue3.queries=queries,getInstallInstructionsValue3.installer=installer,getInstallInstructionsValue3.cache=cache,getInstallInstructionsValue3.updater=updater,getInstallInstructionsValue3.converter=converter,module.exports=getInstallInstructionsValue3,Object.defineProperty(module.exports,"embed",{
            'enumerable':true,'get'(){
                return ((requireEmbedCollector)());
      }
    });
  }
}),require_repo_map=__commonJS({
    '../work/agent-sh__agentsys/lib/repo-map/index.js'(exports,module){
        'use strict';
        var init=((require_repo_intel)());
        const getInstallInstructionsValue4={
    };
        getInstallInstructionsValue4.init=init.init,getInstallInstructionsValue4.update=init.update,getInstallInstructionsValue4.status=init.status,getInstallInstructionsValue4.load=init.load,getInstallInstructionsValue4.exists=init.exists,getInstallInstructionsValue4.checkAstGrepInstalled=init.checkAstGrepInstalled,getInstallInstructionsValue4.getInstallInstructions=init.getInstallInstructions;
        getInstallInstructionsValue4.installer=init.installer,getInstallInstructionsValue4.cache=init.cache,getInstallInstructionsValue4.updater=init.updater,module.exports=getInstallInstructionsValue4;
  }
}),requireDocsPatterns=__commonJS({
    '../work/agent-sh__agentsys/lib/collectors/docs-patterns.js'(exports,module){
        'use strict';
        var fs=((require)(('fs'))),getInstallInstructionsItem1=((require)(("path"))),{
            execFileSync:getInstallInstructionsItem2
    }
        =((require)(("child_process"))),getInstallInstructionsModule1=null,getInstallInstructionsError1=null;
        function getInstallInstructions(){
            if(((!getInstallInstructionsModule1)&&(!getInstallInstructionsError1))){
                {
                    try{
                        {
                            getInstallInstructionsModule1=((require_repo_map)());
            }
          }
                    catch(error){
                        ((getInstallInstructionsError1=error.message||"Failed to load repo-map module",getInstallInstructionsModule1=null));
          }
        }
      }
            return getInstallInstructionsModule1;
    }
        function getRepoMapLoadError(){
            {
                return getInstallInstructionsError1;
      }
    }
        var DEFAULT_OPTIONS={
            'cwd':process.cwd()
    },getRepoMapLoadErrorCount1=(5);
        var getRepoMapLoadErrorCount2=(200);
        var getRepoMapLoadErrorCount3=["internal","private","utils","helpers","__tests__","test","tests"],getRepoMapLoadErrorValue1=["index","main","app","server","cli","bin"],getRepoMapLoadErrorValue2=[/export\s+(?:function|class|const|let|var)\s+(\w+)/g,/export\s+\{([^}]+)\}/g,/module\.exports\s*=\s*\{([^}]+)\}/];
        function escapeRegex(escapeRegexItem1){
            {
                return escapeRegexItem1.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
      }
    }
        function isInternalExport(name,isInternalExportItem1){
            if(name.startsWith('_'))return true;
            const isInternalExportHelper1=isInternalExportItem1.toLowerCase();
            for(const isInternalExportHelper2 of getRepoMapLoadErrorCount3){
                if(isInternalExportHelper1.includes('/'+isInternalExportHelper2+'/')||isInternalExportHelper1.includes('\x5c'+isInternalExportHelper2+'\x5c'))return true;
      }
            if(/\.(test|spec)\.[jt]sx?$/.test(isInternalExportItem1))return true;
            return false;
    }
        function isEntryPoint(filePath){
            const isEntryPointHelper1={
      };
            isEntryPointHelper1.GMbaA="Marked stale by hook";
            const isEntryPointValue1=isEntryPointHelper1;
            {
                const isEntryPointPath1=getInstallInstructionsItem1.basename(filePath),isEntryPointValue2=isEntryPointPath1.replace(/\.[^.]+$/,'').toLowerCase();
                return getRepoMapLoadErrorValue1.includes(isEntryPointValue2);
      }
    }
        async function ensureRepoMap(ensureRepoMapValue1={
    }){
            {
                const {
                    cwd:cwd=process.cwd(),askUser:ensureRepoMapOptions1
        }
                =ensureRepoMapValue1,ensureRepoMapValue2=((getInstallInstructions)());
                if(!ensureRepoMapValue2){
                    {
                        const ensureRepoMapPath1={
            };
                        return ensureRepoMapPath1.available=false,ensureRepoMapPath1.map=null,ensureRepoMapPath1.fallbackReason="repo-map-module-not-found",ensureRepoMapPath1;
          }
        }
                if(ensureRepoMapValue2.exists(cwd)){
                    {
                        const ensureRepoMapValue3=ensureRepoMapValue2.load(cwd),ensureRepoMapValue4={
            };
                        return ensureRepoMapValue4.available=true,ensureRepoMapValue4.map=ensureRepoMapValue3,ensureRepoMapValue4.fallbackReason=null,ensureRepoMapValue4;
          }
        }
                const ensureRepoMapValue5=await ensureRepoMapValue2.checkAstGrepInstalled();
                if(!ensureRepoMapValue5.found){
                    if(ensureRepoMapOptions1){
                        {
                            const ensureRepoMapOptions2=await ((ensureRepoMapOptions1)(({
                                'question':"ast-grep not found. Install for better doc sync accuracy?",'header':"ast-grep Required",'options':[{
                                    'label':"Yes, show instructions",'description':"Better accuracy with AST-based symbol detection"
                },{
                                    'label':"No, use regex fallback",'description':"Less accurate but works without additional install"
                }]
              })));
                            if(ensureRepoMapOptions2&&ensureRepoMapOptions2.includes("Yes")){
                                {
                                    const ensureRepoMapValue6=ensureRepoMapValue2.getInstallInstructions(),ensureRepoMapValue7={
                  };
                                    return ensureRepoMapValue7.available=false,ensureRepoMapValue7.map=null,ensureRepoMapValue7.fallbackReason="ast-grep-install-pending",ensureRepoMapValue7.installInstructions=ensureRepoMapValue6,ensureRepoMapValue7;
                }
              }
            }
          }
                    const ensureRepoMapPath2={
          };
                    return ensureRepoMapPath2.available=false,ensureRepoMapPath2.map=null,ensureRepoMapPath2.fallbackReason="ast-grep-not-installed",ensureRepoMapPath2;
        }
                try{
                    {
                        const ensureRepoMapValue8={
            };
                        ensureRepoMapValue8.force=false;
                        const ensureRepoMapPath3=await ensureRepoMapValue2.init(cwd,ensureRepoMapValue8);
                        if(ensureRepoMapPath3.success){
                            const ensureRepoMapPath4={
              };
                            return ensureRepoMapPath4.available=true,ensureRepoMapPath4.map=ensureRepoMapPath3.map,ensureRepoMapPath4.fallbackReason=null,ensureRepoMapPath4;
            }
                        if(ensureRepoMapPath3.error&&ensureRepoMapPath3.error.includes("already exists")){
                            const ensureRepoMapError1=ensureRepoMapValue2.load(cwd),ensureRepoMapError2={
              };
                            return ensureRepoMapError2.available=true,ensureRepoMapError2.map=ensureRepoMapError1,ensureRepoMapError2.fallbackReason=null,ensureRepoMapError2;
            }
                        const ensureRepoMapError3={
            };
                        return ensureRepoMapError3.available=false,ensureRepoMapError3.map=null,ensureRepoMapError3.fallbackReason=ensureRepoMapPath3.error||"init-failed",ensureRepoMapError3;
          }
        }
                catch(error){
                    {
                        const ensureRepoMapHelper1={
            };
                        return ensureRepoMapHelper1.available=false,ensureRepoMapHelper1.map=null,ensureRepoMapHelper1.fallbackReason=error.message||"init-error",ensureRepoMapHelper1;
          }
        }
      }
    }
        function ensureRepoMapSync(ensureRepoMapSyncValue1={
    }){
            {
                const {
                    cwd:cwd=process.cwd()
        }
                =ensureRepoMapSyncValue1,ensureRepoMapSyncValue2=((getInstallInstructions)());
                if(!ensureRepoMapSyncValue2){
                    {
                        const ensureRepoMapSyncPath1={
            };
                        return ensureRepoMapSyncPath1.available=false,ensureRepoMapSyncPath1.map=null,ensureRepoMapSyncPath1.fallbackReason="repo-map-module-not-found",ensureRepoMapSyncPath1;
          }
        }
                if(ensureRepoMapSyncValue2.exists(cwd)){
                    const ensureRepoMapSyncValue3=ensureRepoMapSyncValue2.load(cwd),ensureRepoMapSyncHelper1={
          };
                    return ensureRepoMapSyncHelper1.available=true,ensureRepoMapSyncHelper1.map=ensureRepoMapSyncValue3,ensureRepoMapSyncHelper1.fallbackReason=null,ensureRepoMapSyncHelper1;
        }
                const ensureRepoMapSyncHelper2={
        };
                return ensureRepoMapSyncHelper2.available=false,ensureRepoMapSyncHelper2.map=null,ensureRepoMapSyncHelper2.fallbackReason="repo-map-not-initialized",ensureRepoMapSyncHelper2;
      }
    }
        function getExportsFromRepoMap(getExportsFromRepoMapItems1,getExportsFromRepoMapItems2){
            const getExportsFromRepoMapItems3={
      };
            getExportsFromRepoMapItems3.iwOmQ="removed-export",getExportsFromRepoMapItems3.fCSgt="high",getExportsFromRepoMapItems3.fBDgY="repo-map";
            getExportsFromRepoMapItems3.ZEPTV="regex";
            const getExportsFromRepoMapItems4=getExportsFromRepoMapItems3;
            {
                if(!getExportsFromRepoMapItems2||!getExportsFromRepoMapItems2.files)return null;
                const getExportsFromRepoMapItem1=getExportsFromRepoMapItems1.replace(/\\/g,'/');
                let getExportsFromRepoMapItem2=getExportsFromRepoMapItems2.files[getExportsFromRepoMapItem1];
                !getExportsFromRepoMapItem2&&getExportsFromRepoMapItem1.startsWith('./')&&(getExportsFromRepoMapItem2=getExportsFromRepoMapItems2.files[getExportsFromRepoMapItem1.slice(2)]);
                !getExportsFromRepoMapItem2&&!getExportsFromRepoMapItem1.startsWith('./')&&((getExportsFromRepoMapItem2=getExportsFromRepoMapItems2.files[(('./')+(getExportsFromRepoMapItem1))]));
                if(!getExportsFromRepoMapItem2||!getExportsFromRepoMapItem2.symbols||!getExportsFromRepoMapItem2.symbols.exports)return null;
                return getExportsFromRepoMapItem2.symbols.exports.map(getExportsFromRepoMapValue1=>getExportsFromRepoMapValue1.name);
      }
    }
        function findUndocumentedExports(changedFiles,options={
    }){
            const findUndocumentedExportsValue1={
                ...DEFAULT_OPTIONS,...options
      },findUndocumentedExportsItem1=findUndocumentedExportsValue1;
            const findUndocumentedExportsPath1=findUndocumentedExportsItem1.repoMapStatus||((ensureRepoMapSync)((findUndocumentedExportsItem1)));
            if(!findUndocumentedExportsPath1.available||!findUndocumentedExportsPath1.map)return ([]);
            const findUndocumentedExportsItem2=findUndocumentedExportsPath1.map,findUndocumentedExportsValue2=((findMarkdownFiles)((findUndocumentedExportsItem1.cwd)));
            let findUndocumentedExportsItem3='';
            for(const findUndocumentedExportsItem4 of findUndocumentedExportsValue2){
                {
                    try{
                        {
                            findUndocumentedExportsItem3+=((fs.readFileSync(getInstallInstructionsItem1.join(findUndocumentedExportsItem1.cwd,findUndocumentedExportsItem4),"utf8"))+('\x0a'));
            }
          }
                    catch{
          }
        }
      }
            const findUndocumentedExportsPath2=[];
            for(const findUndocumentedExportsItem5 of changedFiles){
                const findUndocumentedExportsItem6=findUndocumentedExportsItem5.replace(/\\/g,'/'),findUndocumentedExportsItem7=findUndocumentedExportsItem2.files[findUndocumentedExportsItem6]||findUndocumentedExportsItem2.files[findUndocumentedExportsItem6.replace(/^\.\//,'')];
                if(!findUndocumentedExportsItem7||!findUndocumentedExportsItem7.symbols||!findUndocumentedExportsItem7.symbols.exports)continue;
                for(const findUndocumentedExportsPattern1 of findUndocumentedExportsItem7.symbols.exports){
                    {
                        if(((isInternalExport)((findUndocumentedExportsPattern1.name),(findUndocumentedExportsItem6))))continue;
                        if(((isEntryPoint)((findUndocumentedExportsItem6))))continue;
                        const findUndocumentedExportsValue3=new RegExp('\x5cb'+((escapeRegex)((findUndocumentedExportsPattern1.name)))+'\x5cb');
                        if(!findUndocumentedExportsValue3.test(findUndocumentedExportsItem3)){
                            {
                                const findUndocumentedExportsValue4={
                };
                                findUndocumentedExportsValue4.type="undocumented-export",findUndocumentedExportsValue4.severity="low",findUndocumentedExportsValue4.file=findUndocumentedExportsItem6,findUndocumentedExportsValue4.name=findUndocumentedExportsPattern1.name,findUndocumentedExportsValue4.line=findUndocumentedExportsPattern1.line||(0),findUndocumentedExportsValue4.kind=findUndocumentedExportsPattern1.kind||"export",findUndocumentedExportsValue4.certainty="MEDIUM",findUndocumentedExportsValue4.suggestion="Export '"+findUndocumentedExportsPattern1.name+"' in "+findUndocumentedExportsItem6+(" is not mentioned in any documentation"),findUndocumentedExportsPath2.push(findUndocumentedExportsValue4);
              }
            }
          }
        }
      }
            return findUndocumentedExportsPath2;
    }
        function findRelatedDocs(changedFiles,options={
    }){
            const findRelatedDocsItem1={
                ...DEFAULT_OPTIONS,...options
      },findRelatedDocsValue1=findRelatedDocsItem1,findRelatedDocsValue2=findRelatedDocsValue1.cwd;
            const findRelatedDocsHelper1=[],findRelatedDocsContent1=((findMarkdownFiles)((findRelatedDocsValue2)));
            for(const findRelatedDocsValue3 of changedFiles){
                {
                    const findRelatedDocsPath1=getInstallInstructionsItem1.basename(findRelatedDocsValue3).replace(/\.[^.]+$/,''),findRelatedDocsModule1=findRelatedDocsValue3.replace(/\.[^.]+$/,''),findRelatedDocsValue4=getInstallInstructionsItem1.dirname(findRelatedDocsValue3);
                    for(const findRelatedDocsHelper2 of findRelatedDocsContent1){
                        {
                            let findRelatedDocsModule2;
                            try{
                                {
                                    findRelatedDocsModule2=fs.readFileSync(getInstallInstructionsItem1.join(findRelatedDocsValue2,findRelatedDocsHelper2),"utf8");
                }
              }
                            catch{
                                {
                                    continue;
                }
              }
                            const findRelatedDocsModule3=[];
                            findRelatedDocsModule2.includes(findRelatedDocsPath1)&&findRelatedDocsModule3.push("filename");
                            findRelatedDocsModule2.includes(findRelatedDocsValue3)&&findRelatedDocsModule3.push("full-path");
                            (findRelatedDocsModule2.includes("from '"+findRelatedDocsModule1+'\x27')||findRelatedDocsModule2.includes("from \""+findRelatedDocsModule1+'\x22'))&&findRelatedDocsModule3.push("import");
                            if(findRelatedDocsModule2.includes("require('"+findRelatedDocsModule1+'\x27)')||findRelatedDocsModule2.includes("require(\""+findRelatedDocsModule1+'\x22)')){
                                {
                                    findRelatedDocsModule3.push("require");
                }
              }
                            if(findRelatedDocsModule2.includes('/'+findRelatedDocsPath1)||findRelatedDocsModule2.includes('/'+findRelatedDocsPath1+'.')){
                                {
                                    findRelatedDocsModule3.push("url-path");
                }
              }
                            if(((findRelatedDocsModule3.length)>(0))){
                                const findRelatedDocsHelper3={
                };
                                findRelatedDocsHelper3.doc=findRelatedDocsHelper2,findRelatedDocsHelper3.referencedFile=findRelatedDocsValue3,findRelatedDocsHelper3.referenceTypes=findRelatedDocsModule3,findRelatedDocsHelper1.push(findRelatedDocsHelper3);
              }
            }
          }
        }
      }
            return findRelatedDocsHelper1;
    }
        function findMarkdownFiles(findMarkdownFilesHelper1){
            const findMarkdownFilesPath1=[],findMarkdownFilesCount1=["node_modules","dist","build",".git","coverage","vendor"];
            function walkMarkdownFiles(directoryPath,depth=(0)){
                if(((((depth))>((getRepoMapLoadErrorCount1))))||((((findMarkdownFilesPath1.length))>((getRepoMapLoadErrorCount2)))))return;
                try{
                    const helperItem3={
          };
                    helperItem3.withFileTypes=true;
                    const helperValue97=fs.readdirSync(directoryPath,helperItem3);
                    for(const helperValue98 of helperValue97){
                        const helperValue99=getInstallInstructionsItem1.join(directoryPath,helperValue98.name),helperValue100=getInstallInstructionsItem1.relative(findMarkdownFilesHelper1,helperValue99);
                        if(helperValue98.isDirectory()){
                            {
                                if(!findMarkdownFilesCount1.includes(helperValue98.name)&&!helperValue98.name.startsWith('.')){
                                    {
                                        ((((walkMarkdownFiles))(((helperValue99)),((((((depth))+((1)))))))));
                  }
                }
              }
            }
                        else helperValue98.isFile()&&helperValue98.name.endsWith(".md")&&findMarkdownFilesPath1.push(helperValue100);
          }
        }
                catch{
        }
      }
            return ((walkMarkdownFiles)((findMarkdownFilesHelper1))),findMarkdownFilesPath1;
    }
        function analyzeDocIssues(analyzeDocIssuesItem1,analyzeDocIssuesItem2,analyzeDocIssuesValue1={
    }){
            const analyzeDocIssuesContent1={
                ...DEFAULT_OPTIONS,...analyzeDocIssuesValue1
      },analyzeDocIssuesItem3=analyzeDocIssuesContent1,analyzeDocIssuesError1=analyzeDocIssuesItem3.cwd;
            const analyzeDocIssuesItem4=[];
            let analyzeDocIssuesValue2;
            try{
                (analyzeDocIssuesValue2=fs.readFileSync(getInstallInstructionsItem1.join(analyzeDocIssuesError1,analyzeDocIssuesItem1),"utf8"));
      }
            catch{
                return analyzeDocIssuesItem4;
      }
            const analyzeDocIssuesValue3=analyzeDocIssuesValue2.split('\x0a'),analyzeDocIssuesValue4=/```[\s\S]*?```/g,analyzeDocIssuesValue5=analyzeDocIssuesValue2.match(analyzeDocIssuesValue4)||[];
            for(const analyzeDocIssuesValue6 of analyzeDocIssuesValue5){
                const analyzeDocIssuesValue7=/import .* from ['"]([^'"]+)['"]/g;
                let analyzeDocIssuesValue8;
                while(((analyzeDocIssuesValue8=analyzeDocIssuesValue7.exec(analyzeDocIssuesValue6))!==(null))){
                    {
                        const analyzeDocIssuesValue9=analyzeDocIssuesValue8[(1)],analyzeDocIssuesPath1=analyzeDocIssuesItem2.replace(/\.[^.]+$/,'');
                        analyzeDocIssuesValue9.includes(getInstallInstructionsItem1.basename(analyzeDocIssuesPath1))&&((analyzeDocIssuesItem4.push({
                            'type':"code-example",'severity':"medium",'line':((findLineNumber)((analyzeDocIssuesValue2),(analyzeDocIssuesValue8[(0)]))),'current':analyzeDocIssuesValue8[(0)],'suggestion':"Verify import path is still valid"
            })));
          }
        }
      }
            const analyzeDocIssuesValue10=((ensureRepoMapSync)((analyzeDocIssuesItem3)));
            let analyzeDocIssuesValue11,analyzeDocIssuesItem5,analyzeDocIssuesParsedResult1=false;
            if(analyzeDocIssuesValue10.available&&analyzeDocIssuesValue10.map){
                {
                    const analyzeDocIssuesValue12=((getExportsFromRepoMap)((analyzeDocIssuesItem2),(analyzeDocIssuesValue10.map)));
                    analyzeDocIssuesValue12&&(((analyzeDocIssuesItem5=analyzeDocIssuesValue12,analyzeDocIssuesValue11=((getExportsFromGit)((analyzeDocIssuesItem2),("HEAD~1"),(analyzeDocIssuesItem3))),analyzeDocIssuesParsedResult1=true)));
        }
      }
            if(!analyzeDocIssuesParsedResult1){
                {
                    analyzeDocIssuesValue11=((getExportsFromGit)((analyzeDocIssuesItem2),("HEAD~1"),(analyzeDocIssuesItem3))),analyzeDocIssuesItem5=((getExportsFromGit)((analyzeDocIssuesItem2),("HEAD"),(analyzeDocIssuesItem3)));
        }
      }
            const analyzeDocIssuesValue13=analyzeDocIssuesValue11.filter(analyzeDocIssuesValue14=>!analyzeDocIssuesItem5.includes(analyzeDocIssuesValue14));
            for(const analyzeDocIssuesContent2 of analyzeDocIssuesValue13){
                if(analyzeDocIssuesValue2.includes(analyzeDocIssuesContent2)){
                    const analyzeDocIssuesContent3={
          };
                    analyzeDocIssuesContent3.type="removed-export",analyzeDocIssuesContent3.severity="high",analyzeDocIssuesContent3.reference=analyzeDocIssuesContent2,analyzeDocIssuesContent3.suggestion='\x27'+analyzeDocIssuesContent2+("' was removed or renamed"),analyzeDocIssuesContent3.detectionMethod=analyzeDocIssuesParsedResult1?"repo-map":"regex",analyzeDocIssuesItem4.push(analyzeDocIssuesContent3);
        }
      }
            try{
                const analyzeDocIssuesItem6=fs.readFileSync(getInstallInstructionsItem1.join(analyzeDocIssuesError1,"package.json"),"utf8"),analyzeDocIssuesValue15=JSON.parse(analyzeDocIssuesItem6),analyzeDocIssuesHelper1=analyzeDocIssuesValue15.version,analyzeDocIssuesValue16=analyzeDocIssuesValue2.matchAll(/version[:\s]+['"]?(\d+\.\d+\.\d+)/gi);
                for(const analyzeDocIssuesValue17 of analyzeDocIssuesValue16){
                    {
                        const analyzeDocIssuesHelper2=analyzeDocIssuesValue17[(1)];
                        ((analyzeDocIssuesHelper2)!==(analyzeDocIssuesHelper1))&&((((compareVersions)((analyzeDocIssuesHelper2),(analyzeDocIssuesHelper1))))<(0))&&analyzeDocIssuesItem4.push({
                            'type':"outdated-version",'severity':"low",'line':((findLineNumber)((analyzeDocIssuesValue2),(analyzeDocIssuesValue17[(0)]))),'current':analyzeDocIssuesHelper2,'expected':analyzeDocIssuesHelper1,'suggestion':"Update version from "+analyzeDocIssuesHelper2+" to "+analyzeDocIssuesHelper1
            });
          }
        }
      }
            catch{
      }
            return analyzeDocIssuesItem4;
    }
        function findLineNumber(findLineNumberCount1,findLineNumberValue1){
            {
                const findLineNumberHelper1=findLineNumberCount1.indexOf(findLineNumberValue1);
                if(((findLineNumberHelper1)===(-(1))))return-(354);
                return findLineNumberCount1.substring((0),findLineNumberHelper1).split('\x0a').length;
      }
    }
        function parseExports(source){
            {
                if(((typeof source)!==("string"))||!source)return false;
                return/^[a-zA-Z0-9_./-]+(?:[~^][(-9)]+)?$/.test(source);
      }
    }
        function getExportsFromGit(getExportsFromGitValue1,getExportsFromGitPath1,getExportsFromGitPath2={
    }){
            const getExportsFromGitPath3={
                ...DEFAULT_OPTIONS,...getExportsFromGitPath2
      },getExportsFromGitPath4=getExportsFromGitPath3;
            if(!((parseExports)((getExportsFromGitPath1))))return[];
            try{
                const getExportsFromGitItem1=((getInstallInstructionsItem2)(("git"),(["show",getExportsFromGitPath1+':'+getExportsFromGitValue1]),({
                    'cwd':getExportsFromGitPath4.cwd,'encoding':"utf8",'stdio':["pipe","pipe","pipe"]
        }))),getExportsFromGitHelper1=[];
                for(const getExportsFromGitValue2 of getRepoMapLoadErrorValue2){
                    {
                        const getExportsFromGitValue3=new RegExp(getExportsFromGitValue2.source,getExportsFromGitValue2.flags);
                        let getExportsFromGitItem2;
                        while(((getExportsFromGitItem2=getExportsFromGitValue3.exec(getExportsFromGitItem1))!==(null))){
                            {
                                if(getExportsFromGitItem2[(1)].includes(',')){
                                    {
                                        const getExportsFromGitValue4=getExportsFromGitItem2[(1)].split(',').map(getExportsFromGitValue5=>getExportsFromGitValue5.trim().split(/\s+as\s+/)[(0)].trim());
                                        getExportsFromGitHelper1.push(...getExportsFromGitValue4.filter(getExportsFromGitValue6=>getExportsFromGitValue6&&/^\w+$/.test(getExportsFromGitValue6)));
                  }
                }
                                else{
                                    {
                                        getExportsFromGitHelper1.push(getExportsFromGitItem2[(1)]);
                  }
                }
              }
            }
          }
        }
                return[...new Set(getExportsFromGitHelper1)];
      }
            catch{
                {
                    return[];
        }
      }
    }
        function compareVersions(leftVersion,rightVersion){
            const compareVersionsValue1=leftVersion.split('.').map(Number),compareVersionsHelper1=rightVersion.split('.').map(Number);
            for(let compareVersionsHelper2=(0);
            ((compareVersionsHelper2)<(3));
            compareVersionsHelper2++){
                {
                    const compareVersionsValue2=compareVersionsValue1[compareVersionsHelper2]||(0),compareVersionsHelper3=compareVersionsHelper1[compareVersionsHelper2]||(0);
                    if(((compareVersionsValue2)<(compareVersionsHelper3)))return-(1);
                    if(((compareVersionsValue2)>(compareVersionsHelper3)))return (1);
        }
      }
            return-(-9840);
    }
        function checkChangelog(changedFiles,options={
    }){
            {
                const checkChangelogValue1={
                    ...DEFAULT_OPTIONS,...options
        },checkChangelogValue2=checkChangelogValue1,checkChangelogValue3=checkChangelogValue2.cwd,checkChangelogError1=getInstallInstructionsItem1.join(checkChangelogValue3,"CHANGELOG.md");
                if(!fs.existsSync(checkChangelogError1)){
                    {
                        const checkChangelogContent1={
            };
                        return checkChangelogContent1.exists=false,checkChangelogContent1;
          }
        }
                let checkChangelogPath1;
                try{
                    {
                        checkChangelogPath1=fs.readFileSync(checkChangelogError1,"utf8");
          }
        }
                catch{
                    {
                        const checkChangelogValue4={
            };
                        return checkChangelogValue4.exists=false,checkChangelogValue4.error="Could not read CHANGELOG.md",checkChangelogValue4;
          }
        }
                const checkChangelogPath2=checkChangelogPath1.includes("## [Unreleased]");
                let checkChangelogValue5=[];
                try{
                    const checkChangelogValue6=((getInstallInstructionsItem2)(("git"),(["log","--oneline","-10","HEAD"]),({
                        'cwd':checkChangelogValue3,'encoding':"utf8",'stdio':["pipe","pipe","pipe"]
          })));
                    checkChangelogValue5=checkChangelogValue6.trim().split('\x0a');
        }
                catch{
        }
                const checkChangelogValue7=[],checkChangelogCount1=[];
                for(const checkChangelogValue8 of checkChangelogValue5){
                    if(!checkChangelogValue8)continue;
                    const checkChangelogCount2=checkChangelogValue8.substring(8);
                    if(checkChangelogPath1.includes(checkChangelogCount2)||checkChangelogPath1.includes(checkChangelogValue8.substring((0),(7)))){
                        {
                            checkChangelogValue7.push(checkChangelogCount2);
            }
          }
                    else checkChangelogCount2.match(/^(feat|fix|breaking)/i)&&checkChangelogCount1.push(checkChangelogCount2);
        }
                return{
                    'exists':true,'hasUnreleased':checkChangelogPath2,'documented':checkChangelogValue7,'undocumented':checkChangelogCount1,'suggestion':((checkChangelogCount1.length)>(0))?checkChangelogCount1.length+(" commits may need CHANGELOG entries"):null
        };
      }
    }
        function collect(collectValue1={
    }){
            {
                const collectValue2={
                    ...DEFAULT_OPTIONS,...collectValue1
        },collectPath1=collectValue2,collectPath2=collectPath1.changedFiles||[],collectCount1=((ensureRepoMapSync)((collectPath1)));
                return{
                    'relatedDocs':((findRelatedDocs)((collectPath2),(collectPath1))),'changelog':((checkChangelog)((collectPath2),(collectPath1))),'markdownFiles':((findMarkdownFiles)((collectPath1.cwd))),'repoMap':{
                        'available':collectCount1.available,'fallbackReason':collectCount1.fallbackReason,'stats':collectCount1.map?{
                            'files':Object.keys(collectCount1.map.files||{
              }).length,'symbols':collectCount1.map.stats?.["totalSymbols"]||(0)
            }
                        :null
          },'undocumentedExports':collectCount1.available?((findUndocumentedExports)((collectPath2),({
                        ...collectPath1,'repoMapStatus':collectCount1
          }))):[]
        };
      }
    }
        const collectValue3={
    };
        collectValue3.DEFAULT_OPTIONS=DEFAULT_OPTIONS,collectValue3.findRelatedDocs=findRelatedDocs,collectValue3.findMarkdownFiles=findMarkdownFiles,collectValue3.analyzeDocIssues=analyzeDocIssues,collectValue3.checkChangelog=checkChangelog,collectValue3.getExportsFromGit=getExportsFromGit,collectValue3.compareVersions=compareVersions,collectValue3.findLineNumber=findLineNumber,collectValue3.collect=collect,collectValue3.ensureRepoMap=ensureRepoMap,collectValue3.ensureRepoMapSync=ensureRepoMapSync,collectValue3.getExportsFromRepoMap=getExportsFromRepoMap,collectValue3.findUndocumentedExports=findUndocumentedExports,collectValue3.isInternalExport=isInternalExport,collectValue3.isEntryPoint=isEntryPoint,collectValue3.escapeRegex=escapeRegex,collectValue3.getRepoMapLoadError=getRepoMapLoadError,module.exports=collectValue3;
  }
});
var requireGitCollector=__commonJS({
    '../work/agent-sh__agentsys/lib/collectors/git.js'(exports,module){
        'use strict';
        var collectError1=((requireBinaryCollector)()),DEFAULT_OPTIONS={
            'top':20,'adjustForAi':false,'cwd':process.cwd()
    };
        function collectGitData(options={
    }){
            {
                const collectGitDataError1={
                    ...DEFAULT_OPTIONS,...options
        },collectGitDataItem1=collectGitDataError1,collectGitDataValue1=collectGitDataItem1.cwd||process.cwd();
                try{
                    collectError1.ensureBinarySync();
        }
                catch(error){
                    {
                        const collectGitDataValue2={
            };
                        return collectGitDataValue2.available=false,collectGitDataValue2.error="Binary not available: "+error.message,collectGitDataValue2;
          }
        }
                let collectGitDataItem2;
                try{
                    {
                        const collectGitDataError2=collectError1.runAnalyzer(["repo-intel","init",collectGitDataValue1]);
                        collectGitDataItem2=JSON.parse(collectGitDataError2);
          }
        }
                catch(error){
                    {
                        const collectGitDataValue3={
            };
                        return collectGitDataValue3.available=false,collectGitDataValue3.error="Git analysis failed: "+error.message,collectGitDataValue3;
          }
        }
                const collectGitDataItem3=collectGitDataItem2.fileActivity||{
        },collectGitDataItem4=collectGitDataItem2.contributors||{
        },collectGitDataItem5=collectGitDataItem2.aiAttribution||{
        },collectGitDataItem6=collectGitDataItem2.conventions||{
        },collectGitDataItem7=collectGitDataItem2.releases||{
        },collectGitDataItem8=Object.entries(collectGitDataItem3).map(([collectGitDataItem9,collectGitDataItem10])=>({
                    'path':collectGitDataItem9,'changes':collectGitDataItem10.totalChanges||(0),'recentChanges':collectGitDataItem10.recentChanges||(0),'authors':collectGitDataItem10.authors?Object.keys(collectGitDataItem10.authors).length:(0),'lastChanged':collectGitDataItem10.lastChanged||null
        })).sort((collectGitDataItem11,collectGitDataItem12)=>collectGitDataItem12.changes-collectGitDataItem11.changes).slice((0),collectGitDataItem1.top),collectGitDataItem13=collectGitDataItem4.humans||{
        },collectGitDataCount1=Object.entries(collectGitDataItem13).map(([collectGitDataValue4,collectGitDataValue5])=>({
                    'name':collectGitDataValue4,'commits':collectGitDataValue5.commitCount||(0),'firstSeen':collectGitDataValue5.firstSeen||null,'lastSeen':collectGitDataValue5.lastSeen||null
        })).sort((collectGitDataItem14,collectGitDataItem15)=>collectGitDataItem15.commits-collectGitDataItem14.commits),collectGitDataItem16=collectGitDataCount1.reduce((collectGitDataValue6,collectGitDataValue7)=>collectGitDataValue6+collectGitDataValue7.commits,(0));
                let collectGitDataValue8=(0),collectGitDataCount2=(0);
                for(const collectGitDataValue9 of collectGitDataCount1){
                    collectGitDataValue8+=collectGitDataValue9.commits,collectGitDataCount2++;
                    if(((collectGitDataValue8)>=(((collectGitDataItem16)*((0)+0.8)))))break;
        }
                const collectGitDataValue10=((collectGitDataItem5.attributed||(0))+(collectGitDataItem5.heuristic||(0))),collectGitDataValue11=collectGitDataItem2.git?.["totalCommitsAnalyzed"]||collectGitDataItem16,collectGitDataValue12=((collectGitDataValue11)>(0))?((collectGitDataValue10)/(collectGitDataValue11)):(0),collectGitDataCount3={
        };
                return collectGitDataCount3.style=collectGitDataItem6.style||null,collectGitDataCount3.prefixes=collectGitDataItem6.prefixes||{
        },collectGitDataCount3.usesScopes=collectGitDataItem6.usesScopes||false,{
                    'available':true,'health':{
                        'active':((collectGitDataCount1.length)>(0)),'busFactor':collectGitDataCount2,'aiRatio':((Math.round(((collectGitDataValue12)*(100))))/(100)),'totalCommits':collectGitDataValue11,'totalContributors':collectGitDataCount1.length
          },'hotspots':collectGitDataItem8,'contributors':collectGitDataCount1.slice((0),(10)),'aiAttribution':{
                        'ratio':((Math.round(((collectGitDataValue12)*(100))))/(100)),'attributed':collectGitDataItem5.attributed||(0),'heuristic':collectGitDataItem5.heuristic||(0),'none':collectGitDataItem5.none||(0),'confidence':collectGitDataItem5.confidence||"low",'tools':collectGitDataItem5.tools||{
            }
          },'busFactor':collectGitDataCount2,'conventions':collectGitDataCount3,'releaseInfo':{
                        'tagCount':collectGitDataItem7.tags?collectGitDataItem7.tags.length:(0),'lastRelease':collectGitDataItem7.tags&&((collectGitDataItem7.tags.length)>(0))?collectGitDataItem7.tags[((collectGitDataItem7.tags.length)-(1))]:null,'cadence':collectGitDataItem7.cadence||null
          }
        };
      }
    }
        const collectGitDataModule1={
    };
        collectGitDataModule1.collectGitData=collectGitData;
        collectGitDataModule1.DEFAULT_OPTIONS=DEFAULT_OPTIONS;
        module.exports=collectGitDataModule1;
  }
}),requireAnalyzerQueries=__commonJS({
    '../work/agent-sh__agentsys/lib/collectors/analyzer-queries.js'(exports,module){
        'use strict';
        var fs=((require)(('fs'))),collectGitDataHelper1=((require)(("path"))),DEFAULT_OPTIONS={
            'cwd':process.cwd()
    },DEFAULT_DOC_DRIFT_IGNORE=[/(^|\/)versioned_docs\//,/(^|\/)versioned_sidebars\//,/(^|\/)tests\/fixtures\//,/(^|\/)__fixtures__\//,/(^|\/)generated\//,/\.generated\.md$/,/(^|\/)CHANGELOG\.md$/i,/(^|\/)node_modules\//,/(^|\/)target\//,/(^|\/)dist\//,/(^|\/)build\//];
        function resolveStateDir(resolveStateDirValue1){
            for(const resolveStateDirHelper1 of[".claude",".opencode",".codex"]){
                {
                    if(fs.existsSync(collectGitDataHelper1.join(resolveStateDirValue1,resolveStateDirHelper1)))return resolveStateDirHelper1;
        }
      }
            return ".claude";
    }
        function resolveMapFile(resolveMapFileValue1){
            return (collectGitDataHelper1.join(resolveMapFileValue1,((resolveStateDir)((resolveMapFileValue1))),"repo-intel.json"));
    }
        function getRepoMapPath(){
            {
                try{
                    {
                        const {
                            binary:helperValue101
            }
                        =((require)(("../agentsys"))).get();
                        if(helperValue101)return helperValue101;
          }
        }
                catch{
        }
                try{
                    return ((requireBinaryCollector)());
        }
                catch{
                    return null;
        }
      }
    }
        function resolveRepoMapPath(cwd,options){
            {
                try{
                    {
                        const helperHelper38=cwd.runAnalyzer(options);
                        return JSON.parse(helperHelper38);
          }
        }
                catch{
                    return null;
        }
      }
    }
        function normalizeArray(value){
            const helperHelper41={
      };
            helperHelper41.ZvqtE="agent-analyzer";
            const helperValue103=helperHelper41;
            return (((value)||('')).replace(/\\/g,'/'));
    }
        function normalizeFiles(files){
            return (Array.isArray(files)?files:[]);
    }
        function collect(collectError2={
    }){
            const collectError3={
                ...DEFAULT_OPTIONS,...collectError2
      },collectError4=collectError3,collectContent1=collectError4.cwd,collectContent2=((resolveMapFile)((collectContent1))),collectError5={
      };
            collectError5.available=false,collectError5.reason=null,collectError5.queryErrors=[],collectError5.mapFile=collectContent2,collectError5.staleDocs=null,collectError5.staleDocsByKey=null,collectError5.staleDocsByDoc=null,collectError5.docDrift=null,collectError5.docDriftAll=null,collectError5.entryPoints=null,collectError5.entryPointSet=null,collectError5.entryPointSymbols=null,collectError5.slopFixes=null,collectError5.orphanExports=null,collectError5.passthroughWrappers=null,collectError5.alwaysTrueConditions=null,collectError5.commentedOutCode=null,collectError5.staleSuppressions=null;
            const collectValue4=collectError5,collectValue5=((getRepoMapPath)());
            if(!collectValue5){
                const collectValue6={
                    ...collectValue4
        };
                return collectValue6.reason="analyzer-binary-unavailable",collectValue6;
      }
            if(!fs.existsSync(collectContent2)){
                {
                    const collectValue7={
                        ...collectValue4
          };
                    return collectValue7.reason="repo-intel-map-missing",collectValue7;
        }
      }
            const collectContent3=collectError4.staleDocsTop??(500),collectContent4=collectError4.docDriftTop??(50),collectContent5=[];
            const collectContent6=(collectContent7,collectValue8)=>{
                {
                    const collectContent8=((((resolveRepoMapPath))(((collectValue5)),((collectValue8)))));
                    if(((((collectContent8))===((null))))){
                        {
                            collectContent5.push(collectContent7);
            }
          }
                    return collectContent8;
        }
      },collectContent9=((normalizeFiles)((((collectContent6)(("stale-docs"),(["repo-intel","query","stale-docs","--top",((String)((collectContent3))),"--map-file",collectContent2,collectContent1])))))),collectContent10=((normalizeFiles)((((collectContent6)(("doc-drift"),(["repo-intel","query","doc-drift","--top",((String)((collectContent4))),"--map-file",collectContent2,collectContent1])))))),collectContent11=((normalizeFiles)((((collectContent6)(("entry-points"),(["repo-intel","query","entry-points","--map-file",collectContent2,collectContent1])))))),collectContent12=((collectContent6)(("slop-fixes"),(["repo-intel","query","slop-fixes","--map-file",collectContent2,collectContent1]))),collectHelper1=Array.isArray(collectContent12)?collectContent12:((normalizeFiles)((collectContent12?.["fixes"]))),collectItem1=new Map(),collectItem2=new Map();
            for(const collectValue9 of collectContent9){
                {
                    const collectValue10=((normalizeArray)((collectValue9.doc)));
                    collectValue9.doc=collectValue10;
                    const collectItem3=collectValue10+':'+collectValue9.line+':'+collectValue9.reference;
                    collectItem1.set(collectItem3,collectValue9),!collectItem2.has(collectValue10)&&((collectItem2.set(collectValue10,[]))),collectItem2.get(collectValue10).push(collectValue9);
        }
      }
            const collectValue11=new Set(),collectValue12=new Set();
            for(const collectPath3 of collectContent11){
                {
                    const collectPath4=((normalizeArray)((collectPath3.path)));
                    if(collectPath4)collectValue11.add(collectPath4);
                    collectPath3.name&&collectPath4&&collectValue12.add(collectPath4+':'+collectPath3.name);
        }
      }
            const collectPath5=collectError4.docDriftIgnore||DEFAULT_DOC_DRIFT_IGNORE,collectError6=collectContent10.filter(collectValue13=>{
                const collectValue14=((((normalizeArray))(((collectValue13.path)))));
                return!collectPath5.some(collectValue15=>collectValue15.test(collectValue14));
      }),collectValue16={
      };
            collectValue16["orphan-export"]="orphanExports",collectValue16["passthrough-wrapper"]="passthroughWrappers",collectValue16["always-true-condition"]="alwaysTrueConditions",collectValue16["commented-out-code"]="commentedOutCode",collectValue16["stale-suppression"]="staleSuppressions";
            const collectValue17=collectValue16,collectHelper2=[],collectHelper3=[],collectValue18=[],collectValue19=[],collectValue20=[],collectItem4={
      };
            collectItem4.orphanExports=collectHelper2,collectItem4.passthroughWrappers=collectHelper3,collectItem4.alwaysTrueConditions=collectValue18,collectItem4.commentedOutCode=collectValue19,collectItem4.staleSuppressions=collectValue20;
            const collectValue21=collectItem4;
            for(const collectError7 of collectHelper1){
                {
                    const collectError8=collectValue17[collectError7.category];
                    if(collectError8)collectValue21[collectError8].push(collectError7);
        }
      }
            const collectError9=((collectContent5.length)<(4)),collectError10={
      };
            return collectError10.available=collectError9,collectError10.reason=collectError9?null:"all-queries-failed",collectError10.queryErrors=collectContent5,collectError10.mapFile=collectContent2,collectError10.staleDocs=collectContent9,collectError10.staleDocsByKey=collectItem1,collectError10.staleDocsByDoc=collectItem2,collectError10.docDrift=collectError6,collectError10.docDriftAll=collectContent10,collectError10.entryPoints=collectContent11,collectError10.entryPointSet=collectValue11,collectError10.entryPointSymbols=collectValue12,collectError10.slopFixes=collectHelper1,collectError10.orphanExports=collectHelper2,collectError10.passthroughWrappers=collectHelper3,collectError10.alwaysTrueConditions=collectValue18,collectError10.commentedOutCode=collectValue19,collectError10.staleSuppressions=collectValue20,collectError10;
    }
        function isEntryPointSymbol(isEntryPointSymbolValue1,isEntryPointSymbolValue2,isEntryPointSymbolValue3){
            if(!isEntryPointSymbolValue1?.["entryPointSymbols"])return false;
            const isEntryPointSymbolValue4=((normalizeArray)((isEntryPointSymbolValue2)));
            return isEntryPointSymbolValue1.entryPointSymbols.has(isEntryPointSymbolValue4+':'+isEntryPointSymbolValue3)||isEntryPointSymbolValue1.entryPointSet.has(isEntryPointSymbolValue4);
    }
        const isEntryPointSymbolValue5={
    };
        isEntryPointSymbolValue5.DEFAULT_OPTIONS=DEFAULT_OPTIONS,isEntryPointSymbolValue5.DEFAULT_DOC_DRIFT_IGNORE=DEFAULT_DOC_DRIFT_IGNORE,isEntryPointSymbolValue5.collect=collect;
        isEntryPointSymbolValue5.isEntryPointSymbol=isEntryPointSymbol,isEntryPointSymbolValue5.resolveMapFile=resolveMapFile,isEntryPointSymbolValue5.resolveStateDir=resolveStateDir,module.exports=isEntryPointSymbolValue5;
  }
}),requireCollectors=__commonJS({
    '../work/agent-sh__agentsys/lib/collectors/index.js'(exports,module){
        'use strict';
        var githubCollector=((requireGithubCollector)()),documentationCollector=((requireDocumentationCollector)()),codebaseCollector=((requireCodebaseCollector)()),docsPatternsCollector=((requireDocsPatterns)()),gitCollector=((requireGitCollector)()),analyzerQueries=((requireAnalyzerQueries)()),collectorDefaults={
            'collectors':["github","docs","code"],'depth':"thorough",'cwd':process.cwd()
    };
        function collectData(options={
    }){
      const mergedOptions={
        ...collectorDefaults,...options
      },collectionOptions=mergedOptions,enabledCollectors=Array.isArray(collectionOptions.collectors)?collectionOptions.collectors:collectorDefaults.collectors,result={
        'timestamp':new Date().toISOString(),'options':collectionOptions,'github':null,'docs':null,'code':null,'docsPatterns':null,'git':null,'analyzer':null
      };
      enabledCollectors.includes("analyzer")&&(result.analyzer=analyzerQueries.collect(collectionOptions),collectionOptions.analyzer=result.analyzer);
      enabledCollectors.includes("github")&&(result.github=githubCollector.scanGitHubState(collectionOptions));
      return enabledCollectors.includes("docs")&&(result.docs=documentationCollector.analyzeDocumentation(collectionOptions)),enabledCollectors.includes("code")&&(result.code=codebaseCollector.scanCodebase(collectionOptions)),enabledCollectors.includes("docs-patterns")&&(result.docsPatterns=docsPatternsCollector.collect(collectionOptions)),enabledCollectors.includes("git")&&((result.git=gitCollector.collectGitData(collectionOptions))),result;
    }
        function collectAllData(options={
    }){
      let sources=["github","docs","code"];
      if(options.sources)sources=options.sources;
            else{
                if(options.collectors){
                    {
            sources=options.collectors;
          }
        }
      }
      const collectionOptions={
        ...options
      };
      collectionOptions.collectors=sources;
      return collectData(collectionOptions);
    }
        const api={
    };
        api.collect=collectData,api.collectAllData=collectAllData,api.github=githubCollector,api.documentation=documentationCollector,api.codebase=codebaseCollector,api.docsPatterns=docsPatternsCollector,api.git=gitCollector,api.analyzerQueries=analyzerQueries,api.scanGitHubState=githubCollector.scanGitHubState,api.isGhAvailable=githubCollector.isGhAvailable,api.analyzeDocumentation=documentationCollector.analyzeDocumentation,api.scanCodebase=codebaseCollector.scanCodebase,api.findRelatedDocs=docsPatternsCollector.findRelatedDocs,api.analyzeDocIssues=docsPatternsCollector.analyzeDocIssues,api.checkChangelog=docsPatternsCollector.checkChangelog,api.ensureRepoMap=docsPatternsCollector.ensureRepoMap,api.ensureRepoMapSync=docsPatternsCollector.ensureRepoMapSync,api.getExportsFromRepoMap=docsPatternsCollector.getExportsFromRepoMap,api.findUndocumentedExports=docsPatternsCollector.findUndocumentedExports,api.isInternalExport=docsPatternsCollector.isInternalExport,api.isEntryPoint=docsPatternsCollector.isEntryPoint,api.collectGitData=gitCollector.collectGitData;
        api.DEFAULT_OPTIONS=collectorDefaults,module.exports=api;
  }
});
var collectors=requireCollectors();
const defaultOptions={
};
defaultOptions.sources=["github","docs","code"],defaultOptions.depth="thorough",defaultOptions.issueLimit=collectors.github.DEFAULT_OPTIONS.issueLimit,defaultOptions.prLimit=collectors.github.DEFAULT_OPTIONS.prLimit,defaultOptions.timeout=collectors.github.DEFAULT_OPTIONS.timeout;
var DEFAULT_OPTIONS=defaultOptions;
module.exports = {
    DEFAULT_OPTIONS,
    scanGitHubState: collectors.scanGitHubState,
    analyzeDocumentation: collectors.analyzeDocumentation,
    scanCodebase: collectors.scanCodebase,
    collectAllData: collectors.collectAllData,
    isGhAvailable: collectors.isGhAvailable,
    isPathSafe: collectors.documentation.isPathSafe,
};
