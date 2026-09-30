var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (modules, cachedModule) => function requireBundledModule() {
  if (!cachedModule) {
    const module = { exports: {} };
    const initialize = modules[__getOwnPropNames(modules)[0]];
    initialize(module.exports, module);
    cachedModule = module;
  }
  return cachedModule.exports;
};

var require_markdown_cleanup = __commonJS({
  '../work/pchuri__confluence-cli/lib/markdown-cleanup.js'(exports, module) {
    function fenceLength(markdown) {
      const fences = markdown.match(/`+/g);
      let longestFence = 0;
      if (fences) {
        for (const fence of fences) {
          if (fence.length > longestFence) longestFence = fence.length;
        }
      }
      return Math.max(3, longestFence + 1);
    }

    function splitOnFences(markdown) {
      const parts = [];
      const fencedBlock = /^ {0,3}(`{3,})[^\n]*\n[\s\S]*?\n {0,3}\1[\t ]*$/gm;
      let previousEnd = 0;
      let match;
      while ((match = fencedBlock.exec(markdown)) !== null) {
        parts.push(markdown.slice(previousEnd, match.index));
        parts.push(match[0]);
        previousEnd = match.index + match[0].length;
      }
      parts.push(markdown.slice(previousEnd));
      return parts;
    }

    function cleanupOutsideFence(markdown) {
      return markdown
        .replace(/[ \t]+$/gm, '')
        .replace(/^[ \t]+(?!([`>]|[*+-] |\d+[.)] ))/gm, '')
        .replace(/^(#{1,6}[^\n]+)\n(?!\n)/gm, '$1\n\n')
        .replace(/\n\s*\n\s*\n+/g, '\n\n')
        .replace(/[ \t]+/g, ' ');
    }

    function cleanupWithFences(markdown) {
      return splitOnFences(markdown)
        .map((part, index) => index % 2 === 1 ? part : cleanupOutsideFence(part))
        .join('')
        .trim();
    }

    module.exports = {
      fenceLength,
      splitOnFences,
      cleanupOutsideFence,
      cleanupWithFences,
    };
  },
});
require_storage_walker=__commonJS({
  '../work/pchuri__confluence-cli/lib/storage-walker.js'(exports,module){
    var {
      Parser:Parser,DomHandler:DomHandler
    }
    =((require)(("htmlparser2")));
    var {
      decodeHTML:decodeHTML
    }
    =((require)(("entities"))),{
      fenceLength:fenceLength,cleanupWithFences:cleanupWithFences
    }
    =((require_markdown_cleanup)()),DEFAULT_MAX_DEPTH=256;
    const local1={
    }
    ;
    local1.nbsp='\x20',local1.ldquo='\x22';
    local1.rdquo='\x22',local1.lsquo='\x27',local1.rsquo='\x27',local1.hellip="...";
    var NAMED_ENTITY_OVERRIDES=local1;
    function decodeEntities(value) {
      if (!value) return '';
      return value.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (entity, name) => {
        if (name[0] === '#') {
          const codePoint = name[1] === 'x' || name[1] === 'X'
            ? parseInt(name.slice(2), 16)
            : parseInt(name.slice(1), 10);
          if (!Number.isFinite(codePoint)) return entity;
          try {
            return String.fromCodePoint(codePoint);
          } catch {
            return entity;
          }
        }
        if (Object.prototype.hasOwnProperty.call(NAMED_ENTITY_OVERRIDES, name)) {
          return NAMED_ENTITY_OVERRIDES[name];
        }
        return decodeHTML('&' + name + ';');
      });
    }
    var StorageDepthExceededError = class extends Error {
    constructor(maxDepth) {
      super('Storage XML nesting exceeds limit of ' + maxDepth + ' levels');
      this.name = 'StorageDepthExceededError';
      this.maxDepth = maxDepth;
    }
  }, StorageWalker=class{
      constructor({
      attachmentsDir = 'attachments',
      labels = {},
      buildUrl = value => value,
      webUrlPrefix = '',
      maxDepth = DEFAULT_MAX_DEPTH,
    } = {}) {
      this.attachmentsDir = attachmentsDir;
      this.labels = labels;
      this.buildUrl = buildUrl;
      this.webUrlPrefix = webUrlPrefix;
      this.maxDepth = maxDepth;
    }
      walk(storage) {
        this._depth = 0;
        this._markdownLinkLabelDepth = 0;
        this._markdownCodeSpanDepth = 0;
        this.warnings = [];

        const handler = new DomHandler(null, { xmlMode: true });
        const openTagLocations = [];
        const originalOpenTag = handler.onopentag.bind(handler);
        const originalCloseTag = handler.onclosetag.bind(handler);
        let parser;

        handler.onopentag = (...args) => {
          openTagLocations.push({ sIdx: parser.startIndex, eIdx: parser.endIndex });
          originalOpenTag(...args);
        };
        handler.onclosetag = (...args) => {
          const [tag, isImplied] = args;
          const opening = openTagLocations.pop();
          if (isImplied) {
            const sameSourceRange = opening
              && opening.sIdx === parser.startIndex
              && opening.eIdx === parser.endIndex;
            if (!sameSourceRange) {
              const offset = parser.endIndex;
              this.warnings.push({ type: 'implicit-close', tag, offset });
              if (process.env.CONFLUENCE_CLI_VERBOSE) {
                process.stderr.write('StorageWalker: auto-closed <' + tag + '> at offset ' + offset + '\n');
              }
            }
          }
          originalCloseTag(...args);
        };

        parser = new Parser(handler, {
          xmlMode: true,
          recognizeSelfClosing: true,
          decodeEntities: true,
        });
        parser.write(storage);
        parser.end();
        return this.cleanup(this.walkNodes(handler.dom));
      }
      walkNodes(nodes){
          {
          if(!nodes)return'';
          return nodes.map(node=>this.walkNode(node))["join"]('');
        }
      }
      walkNode(node){
         if(!node)return'';
         switch(node.type){
          case "text":return this.renderText(node.data||'');
          case "cdata":return this.walkNodes(node.children);
          case "comment":case "directive":return'';
          case "tag":case "script":case "style":return this.walkElement(node);
          default:return'';
        }
      }
      walkElement(node) {
        this._depth += 1;
        if (this._depth > this.maxDepth) {
          this._depth -= 1;
          throw new StorageDepthExceededError(this.maxDepth);
        }
        try {
          return this._dispatchElement(node);
        } finally {
          this._depth -= 1;
        }
      }
      _dispatchElement(node){
        const local2={
          'rPdrG':function(local3,local4){
             return ((local3)((local4)));
          }
          ,'OCPpP':function(local5,local6){
             return ((local5)===(local6));
          }
          ,'nZtkI':"number",'oqJsR':function(local7,local8,local9){
             return ((local7)((local8),(local9)));
          }
          ,'wwJSi':"ri:value",'gLNAZ':"ac:plain-text-link-body"
        }
        ;
        {
          const local10=node.name;
          switch(local10){
            case'p':return (((('\x0a')+(this.walkNodes(node.children)["trim"]())))+('\x0a'));
            case'h1':case'h2':case'h3':case'h4':case'h5':case'h6':{
              const local11=((parseInt)((local10.charAt(1)),(10)));
              return (((((((('\x0a')+('#'["repeat"](local11))))+('\x20')))+(this.walkNodes(node.children)["trim"]())))+('\x0a'));
            }
            case "strong":case'b':return (((('**')+(this.walkNodes(node.children))))+('**'));
            case'em':case'i':return (((('*')+(this.walkNodes(node.children))))+('*'));
            case's':case "del":return (((('~~')+(this.walkNodes(node.children))))+('~~'));
            case "code":{
              if(false)local12=this.walkNodes(local13.children);
              else{
                this._markdownCodeSpanDepth++;
                try{
                  if(false){
                    const local14=local2.rPdrG(local15,local16.attribs["ri:value"]||''),local17=this.findChildByName(local18,"ac:plain-text-link-body"),local19=local17?this.getRawText(local17):'';
                    if(!local19)return'';
                    return'['+local19+']('+local14+')';
                  }
                  else return this.renderCodeSpan(this.walkNodes(node.children));
                }
                finally{
                  if(true)this._markdownCodeSpanDepth--;
                  else return this.walkNodes(local20.children)["trim"]();
                }
              }
            }
            case'br':return'\x0a';
            case'hr':return "\n---\n";
            case'a':{
              if(false)return "<ac:structured-macro ac:name=\"anchor\"><ac:parameter ac:name=\"\">"+local21['id']+("</ac:parameter></ac:structured-macro>");
              else{
                const local22=((decodeEntities)((node.attribs&&node.attribs.href||'')));
                if(!local22)return this.walkNodes(node.children);
                this._markdownLinkLabelDepth++;
                let local23;
                try{
                  if(false){
                    if(((local24.type)===("text")))local25+=local26.data;
                  }
                  else local23=this.walkNodes(node.children);
                }
                finally{
                  this._markdownLinkLabelDepth--;
                }
                return'['+local23+']('+local22+')';
              }
            }
            case "time":return this.renderText(node.attribs&&node.attribs.datetime||'')||this.walkNodes(node.children);
            case'ul':return this.handleList(node, false );
            case'ol':return this.handleList(node, true );
            case'li':return this.walkNodes(node.children);
            case "table":return this.handleTable(node);
            case "thead":case "tbody":case "tfoot":case'tr':case'th':case'td':return this.walkNodes(node.children);
            case "blockquote":return this.handleBlockquote(node);
            case "details":case "summary":case'u':case "sub":case "sup":case "mark":return (((('<'+local10+'>')+(this.walkNodes(node.children))))+('</'+local10+'>'));
            case "ac:structured-macro":return this.handleMacro(node);
            case "ac:image":return this.handleImage(node);
            case "ac:link":return this.handleAcLink(node);
            case "ac:task-list":return this.handleTaskList(node);
            case "ac:layout":case "ac:layout-section":case "ac:layout-cell":case "ac:rich-text-body":case "ac:link-body":return this.walkNodes(node.children);
            case "ri:url":case "ri:page":case "ri:attachment":case "ac:plain-text-body":case "ac:plain-text-link-body":case "ac:parameter":return'';
            default:return this.walkNodes(node.children);
          }
        }
      }
      handleList(listNode,ordered){
        const local27=(listNode.children||[])["filter"](local28=>local28.type==="tag"&&local28.name==='li');
        let local29=1,local30='';
         for(const local31 of local27){
          if(true){
            const local32=this.walkNodes(local31.children)["replace"](/\s+/g,'\x20')["trim"]();
            if(!local32)continue;
            const local33=ordered?local29++ +'.':'-';
            local30+=local33+'\x20'+local32+'\x0a';
          }
          else return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(local34));
        }
         return local30?(('\x0a')+(local30)):'';
      }
      handleTable(tableNode){
          if(true){
          const local35=[],local36=this.findAllDescendants(tableNode,'tr');
          let local37= true ;
          for(const local38 of local36){
            const local39=(local38.children||[])["filter"](local40=>local40.type==="tag"&&(local40.name==='th'||local40.name==='td'));
            if(((local39.length)===(0)))continue;
            const local41=local39.map(local42=>this.walkNodes(local42.children)["replace"](/\s+/g,'\x20')["trim"]()||'\x20');
            local35.push((((('|\x20')+(local41.join(" | "))))+('\x20|'))),local37&&(local35.push((((('|\x20')+(local41.map(()=>"---")["join"](" | "))))+('\x20|'))),local37= false );
          }
          return ((local35.length)>(0))?(((('\x0a')+(local35.join('\x0a'))))+('\x0a')):'';
        }
        else local43[1]=local44.max(local45[1],local46[1]);
      }
      handleBlockquote(blockquoteNode){
          {
          const local47=this.walkNodes(blockquoteNode.children)["trim"]();
          if(!local47)return'';
          const local48=local47.split('\x0a')["map"](local49=>local49.length===0?'>':'>\x20'+local49)["join"]('\x0a');
          return (((('\x0a')+(local48)))+('\x0a'));
        }
      }
      handleMacro(macroNode){
          {
          const local50=macroNode.attribs&&macroNode.attribs["ac:name"];
          switch(local50){
            case "toc":case "floatmenu":return'';
            case "expand":return this.handleExpand(macroNode);
            case "code":return this.handleCode(macroNode);
            case "info":case "warning":case "note":return this.handleCallout(macroNode,local50);
            case "anchor":return this.handleAnchor(macroNode);
            case "panel":return this.handlePanel(macroNode);
            case "mermaid-macro":return this.handleMermaid(macroNode);
            case "plantuml":return this.handlePlantuml(macroNode);
            case "include":return this.handleInclude(macroNode);
            case "shared-block":case "include-shared-block":return this.handleSharedBlock(macroNode,local50);
            case "view-file":return this.handleViewFile(macroNode);
            default:return'';
          }
        }
      }
      handleExpand(expandNode){
         const local51=this.findParamByName(expandNode,"title");
         const local52=(local51?this.getTextContent(local51):'')["trim"](),local53=this.getMacroBody(expandNode);
        if(local52)return (("MxtQc")===("MxtQc"))?"\n**EXPAND: "+local52+"**\n\n"+this.walkNodes(local53)["trim"]()+("\n\n**EXPAND_END**\n"):(local54.push(local55),local56+'H'+((local57.length)-(1))+local58);
        return "\n<details>\n<summary>"+(this.labels.expandDetails||"Expand Details")+("</summary>\n\n")+this.walkNodes(local53)["trim"]()+("\n\n</details>\n");
      }
      handleCode(codeNode){
         const local59=this.findParamByName(codeNode,"language"),local60=local59?this.getTextContent(local59):'';
         const local61=this.findChildByName(codeNode,"ac:plain-text-body"),local62=local61?this.getRawText(local61):'',local63='`'["repeat"](((fenceLength)((local62))));
        return'\x0a'+local63+local60+'\x0a'+local62+'\x0a'+local63+'\x0a';
      }
      handleCallout(calloutNode,calloutType){
         const local64=this.getMacroBody(calloutNode),local65=this.walkNodes(local64)["trim"]();
         const local66=local65.split('\x0a')["map"](local67=>local67.length===0?'>':'>\x20'+local67)["join"]('\x0a'),local68="> **"+calloutType.toUpperCase()+'**',local69=((local65.length)===(0))?local68:local68+'\x0a'+local66;
        return'\x0a'+local69+'\x0a';
      }
      handleAnchor(anchorNode){
          if(true){
          const local70=this.findParamByName(anchorNode,''),local71=(local70?this.getTextContent(local70):'')["trim"]();
          if(!local71)return'';
          return "\n**ANCHOR: "+local71+"**\n";
        }
        else return local72.push(local73),''+local74+((local75.length)-(1))+local76;
      }
      handlePanel(panelNode){
          if(true){
          const local77=this.findParamByName(panelNode,"title"),local78=(local77?this.getTextContent(local77):'')["trim"](),local79=this.getMacroBody(panelNode),local80=this.walkNodes(local79)["trim"]();
          if(((!local78)&&(!local80)))return'';
          const local81=local80.split('\x0a')["map"](local82=>local82?'>\x20'+local82:'>')["join"]('\x0a');
          if(!local78)return'\x0a'+local81+'\x0a';
          if(!local80)return "\n> **"+local78+"**\n";
          return "\n> **"+local78+"**\n>\n"+local81+'\x0a';
        }
        else local83.push((((('|\x20')+(local84.map(()=>"---")["join"](" | "))))+('\x20|'))),local85= false ;
      }
      handleMermaid(mermaidNode){
          if(false)local86.push([((local87)((local88.map[0]))),((local89)((local90.map[1])))]);
        else{
          const local91=this.findChildByName(mermaidNode,"ac:plain-text-body"),local92=local91?this.getRawText(local91)["trim"]():'',local93='`'["repeat"](((fenceLength)((local92))));
          return'\x0a'+local93+"mermaid\n"+local92+'\x0a'+local93+'\x0a';
        }
      }
      handlePlantuml(plantumlNode){
        const local94={
        }
        ;
         local94.VzEBF="4|2|3|0|1";
         local94.hPQUp="페이지에서",local94.XsVbH="상세 보기",local94.aQNkL="공유 블록",local94.lcEEy="공유 블록 포함",local94.vRYci="페이지 포함";
        const local95=local94;
        {
          const local96=this.findChildByName(plantumlNode,"ac:plain-text-body"),local97=local96?this.getRawText(local96)["trim"]():'',local98='`'["repeat"](((fenceLength)((local97))));
          return'\x0a'+local98+("plantuml\n")+local97+'\x0a'+local98+'\x0a';
        }
      }
      handleInclude(local99){
          {
          const local100=this.findParamByName(local99,'');
          if(!local100)return'';
          const local101=this.findChildByName(local100,"ac:link");
          if(!local101)return'';
          const local102=this.findChildByName(local101,"ri:page");
          if(!local102)return'';
          const local103=((decodeEntities)((local102.attribs["ri:space-key"]||''))),local104=((decodeEntities)((local102.attribs["ri:content-title"]||''))),local105=this.escapeMarkdownText(local104),local106=this.labels.includePage||"Include Page";
          if(local103.startsWith('~')){
            if(true){
              const local107="display/"+local103+'/'+((encodeURIComponent)((local104)));
              return "\n> 📄 **"+local106+"**: ["+local105+']('+this.buildUrl(this.webUrlPrefix+'/'+local107)+')\x0a';
            }
            else local108.onWarnings(local109.warnings);
          }
          return "\n> 📄 **"+local106+"**: ["+local105+']('+this.buildUrl(this.webUrlPrefix+"/spaces/"+local103+("/pages/[PAGE_ID_HERE]"))+(") _(manual link correction required)_\n");
        }
      }
      handleSharedBlock(local110,local111){
         const local112={
          'SfpGF':function(local113,local114){
             return ((local113)((local114)));
          }
          ,'RBYeE':function(local115,local116){
             return ((local115)>(local116));
          }
          ,'AuSxk':function(local117,local118){
             return ((local117)===(local118));
          }
          ,'npHMx':"implicit-close"
        }
        ;
         {
          const local119=this.findParamByName(local110,"shared-block-key"),local120=(local119?this.getTextContent(local119):'')["trim"](),local121=this.findParamByName(local110,"page");
          if(local121&&((local111)===("include-shared-block"))){
            {
              const local122=this.findChildByName(local121,"ac:link");
              if(local122){
                {
                  const local123=this.findChildByName(local122,"ri:page");
                  if(local123){
                    {
                      const local124=this.escapeMarkdownText(((decodeEntities)((local123.attribs["ri:content-title"]||'')))),local125=this.labels.includeSharedBlock||"Include Shared Block",local126=this.labels.fromPage||"from page",local127=local120?':\x20'+local120+'\x20':'\x20';
                      return "\n> 📄 **"+local125+'**'+local127+'('+local126+':\x20'+local124+(" [link needs manual correction])\n");
                    }
                  }
                }
              }
            }
          }
          const local128=this.getMacroBody(local110),local129=this.walkNodes(local128)["trim"](),local130=this.labels.sharedBlock||"Shared Block";
          if(((!local120)&&(!local129)))return'';
          const local131=local120?'**'+local130+':\x20'+local120+'**':'**'+local130+'**';
          if(!local129)return "\n> "+local131+'\x0a';
          const local132=local129.split('\x0a')["map"](local133=>local133?'>\x20'+local133:'>')["join"]('\x0a');
          return "\n> "+local131+"\n>\n"+local132+'\x0a';
        }
      }
      handleViewFile(local134){
        const local135=this.findParamByName(local134,"name");
        if(!local135)return'';
         const local136=this.findChildByName(local135,"ri:attachment");
        if(!local136)return'';
        const local137=((decodeEntities)((local136.attribs["ri:filename"]||'')));
         return "\n📎 ["+local137+']('+this.attachmentsDir+'/'+local137+')\x0a';
      }
      handleImage(local138){
        const local139={
          'TvOpt':function(local140,local141){
             return ((local140)((local141)));
          }
          ,'DlZDz':function(local142,local143){
             return ((local142)===(local143));
          }
          ,'TvAxM':function(local144,local145){
             return ((local144)!==(local145));
          }
          ,'fhMvv':"tag",'rFDFW':function(local146,local147){
             return ((local146)!==(local147));
          }
          ,'oiIMQ':function(local148,local149){
             return ((local148)<(local149));
          }
          ,'jlyUr':function(local150,local151){
             return ((local150)!==(local151));
          }
          ,'ARviA':"strong",'csjfN':function(local152,local153){
             return ((local152)((local153)));
          }
          ,'nNeYl':function(local154,local155){
             return ((local154)!==(local155));
          }
          ,'LVoAF':function(local156,local157){
             return ((local156)!==(local157));
          }
          ,'yFljt':"text",'AfZur':function(local158,local159){
             return ((local158)+(local159));
          }
          ,'eUpwu':function(local160,local161){
             return ((local160)!==(local161));
          }
          ,'gCzFY':"ac:link",'ewCdm':"ri:page",'PxOsn':function(local162,local163){
             return ((local162)((local163)));
          }
          ,'sXIXx':"ri:space-key",'hTGGn':"ri:content-title",'Nhdci':"Include Page"
        }
        ;
        {
          const local164=this.findChildByName(local138,"ri:attachment");
          if(local164){
            const local165=this.renderText(local164.attribs["ri:filename"]||'');
            return'!['+local165+']('+this.attachmentsDir+'/'+local165+')';
          }
          const local166=this.findChildByName(local138,"ri:url");
          if(local166){
            {
              const local167=this.renderText(local166.attribs["ri:value"]||'');
              if(!local167)return'';
              return " false ("+local167+')';
            }
          }
          return'';
        }
      }
      handleAcLink(local168){
          {
          const local169=local168.attribs||{
          }
          ;
          if(local169["ac:anchor"]){
            {
              const local170=this.findChildByName(local168,"ac:plain-text-link-body"),local171=local170?this.getRawText(local170):'';
              if(!local171)return'';
              return'['+local171+"](#"+((decodeEntities)((local169["ac:anchor"])))+')';
            }
          }
          const local172=this.findChildByName(local168,"ri:url");
          if(local172){
            const local173=((decodeEntities)((local172.attribs["ri:value"]||''))),local174=this.findChildByName(local168,"ac:plain-text-link-body"),local175=local174?this.getRawText(local174):'';
            if(!local175)return'';
            return'['+local175+']('+local173+')';
          }
          const local176=this.findChildByName(local168,"ac:link-body");
          if(local176){
            if(true)return this.walkNodes(local176.children)["trim"]();
            else{
              const local177=this.renderText(local178.attribs["ri:filename"]||'');
              return'!['+local177+']('+this.attachmentsDir+'/'+local177+')';
            }
          }
          const local179=this.findChildByName(local168,"ri:page");
          if(local179){
            {
              const local180=this.escapeMarkdownText(((decodeEntities)((local179.attribs["ri:content-title"]||''))));
              return'['+local180+']';
            }
          }
          return'';
        }
      }
      handleTaskList(local181){
        {
          const local182=(local181.children||[])["filter"](local183=>local183.type==="tag"&&local183.name==="ac:task"),local184=[];
          for(const local185 of local182){
            const local186=this.findChildByName(local185,"ac:task-status"),local187=this.findChildByName(local185,"ac:task-body"),local188=local186?this.getTextContent(local186):'',local189=local187?this.walkNodes(local187.children)["replace"](/\s+/g,'\x20')["trim"]():'',local190=((local188)===("complete"))?"[x]":"[ ]";
            if(local189)local184.push('-\x20'+local190+'\x20'+local189);
          }
          return ((local184.length)>(0))?(((('\x0a')+(local184.join('\x0a'))))+('\x0a')):'';
        }
      }
      findParamByName(local191,local192){
         const local193={
          'knSBY':function(local194,local195){
             return ((local194)+(local195));
          }
        }
        ;
         if(false)this._depth--;
        else{
          if(!local191||!local191.children)return null;
          for(const local196 of local191.children){
            {
              if(((local196.type)===("tag"))&&((local196.name)===("ac:parameter"))&&((local196.attribs["ac:name"])===(local192))){
                if(true)return local196;
                else{
                  const local197=new local198("(^|\\n)\\[!"+local199+("\\]\\s*([\\s\\S]*?)(?=\\n\\s*\\n|\\n\\s*\\[!|$)"),'g');
                  local200.src=local201.src.replace(local197,(local202,local203,local204)=>local203+"> **"+local205.toUpperCase()+"**\n> "+local204.trim()["replace"](/\n/g,"\n> "));
                }
              }
            }
          }
          return null;
        }
      }
      findChildByName(local206,local207){
          if(!local206||!local206.children)return null;
        for(const local208 of local206.children){
          if(((local208.type)===("tag"))&&((local208.name)===(local207)))return local208;
        }
        return null;
      }
      findAllDescendants(local209,local210){
        const local211={
          'fZJzp':function(local212,local213){
             return ((local212)!==(local213));
          }
          ,'FQIXr':"HdtrR",'PoloZ':"QFJtF",'tAuoK':function(local214,local215){
             return ((local214)===(local215));
          }
          ,'UfKIa':"tag",'ZQSJH':"ac:plain-text-body",'jsvEa':function(local216,local217){
             return ((local216)((local217)));
          }
        }
        ;
        {
          const local218=[],local219=local220=>{
              if(local211.fZJzp("HdtrR","QFJtF")){
              if(!local220)return;
              if(local211.tAuoK(local220.type,"tag")&&local211.tAuoK(local220.name,local210))local218.push(local220);
              if(local220.children)local220.children.forEach(local219);
            }
            else return(local221.children||[])["filter"](local222=>!local223(local222));
          }
          ;
          if(local209.children)local209.children.forEach(local219);
          return local218;
        }
      }
      getMacroBody(local224){
          {
          const local225=this.findChildByName(local224,"ac:rich-text-body");
          return local225?local225.children:[];
        }
      }
      getTextContent(local226){
          if(false){
          let local227=0;
          const local228=local229.match(/`+/g);
          if(local228){
            for(const local230 of local228)if(HIeAlG.loTnW(local230.length,local227))local227=local230.length;
          }
          return local231.max(3,HIeAlG.ULpFp(local227,1));
        }
        else return ((decodeEntities)((this._collectText(local226))));
      }
      escapeMarkdownText(local232){
        const local233={
          'gQUMu':function(local234,local235,local236,local237){
             return ((local234)((local235),(local236),(local237)));
          }
          ,'uOiCm':"<!--\\s*(?:\\[\\[)?_TOC_(?:\\]\\])?\\s*-->",'Cvtff':"**TOC**",'yEvaT':function(local238,local239,local240,local241){
             return ((local238)((local239),(local240),(local241)));
          }
          ,'sWNSC':"<!--\\s*(?:\\[\\[)?_LISTING_(?:\\]\\])?\\s*-->",'AVVGX':"**LISTING**",'rFOIM':"\\[\\[_TOC_\\]\\]",'VicVJ':"\\[\\[_LISTING_\\]\\]"
        }
        ;
        {
          if(!local232)return'';
          return local232.replace(/([\\`*_[\]()~|<>])/g,"\\$1");
        }
      }
      renderText(local242){
          {
          const local243=((decodeEntities)((local242)));
          return ((this._markdownLinkLabelDepth)>(0))&&((this._markdownCodeSpanDepth)===(0))?this.escapeMarkdownText(local243):local243;
        }
      }
      renderCodeSpan(local244){
        const local245=local244.match(/`+/g)||[];
         const local246=local245.reduce((local247,local248)=>Math.max(local247,local248.length),0);
         const local249='`'["repeat"](((local246)+(1))),local250=local244.startsWith('`')||local244.endsWith('`')?'\x20':'';
        return''+local249+local250+local244+local250+local249;
      }
      _collectText(local251){
          {
          if(!local251)return'';
          if(((local251.type)===("text")))return local251.data||'';
          if(local251.children)return local251.children.map(local252=>this._collectText(local252))["join"]('');
          return'';
        }
      }
      getRawText(local253){
          if(false){
          const local254=this.findParamByName(local255,"title"),local256=(local254?this.getTextContent(local254):'')["trim"](),local257=this.getMacroBody(local258),local259=this.walkNodes(local257)["trim"]();
          if(((!local256)&&(!local259)))return'';
          const local260=local259.split('\x0a')["map"](local261=>local261?'>\x20'+local261:'>')["join"]('\x0a');
          if(!local256)return'\x0a'+local260+'\x0a';
          if(!local259)return "\n> **"+local256+"**\n";
          return "\n> **"+local256+"**\n>\n"+local260+'\x0a';
        }
        else return ((decodeEntities)((this._collectRawText(local253))));
      }
      _collectRawText(local262){
          {
          if(!local262||!local262.children)return'';
          let local263='';
          for(const local264 of local262.children){
            {
              if(((local264.type)===("text")))local263+=local264.data||'';
              else{
                if(((local264.type)===("cdata")))local263+=this._collectRawText(local264);
              }
            }
          }
          return local263;
        }
      }
      cleanup(local265){
          return (("NOkCB")!==("TFdtn"))?((cleanupWithFences)((local265))):this._isCloud;
      }
    }
    ;
    const local266={
    }
    ;
    local266.StorageWalker=StorageWalker,local266.StorageDepthExceededError=StorageDepthExceededError,local266.DEFAULT_MAX_DEPTH=DEFAULT_MAX_DEPTH,module.exports=local266;
  }
}
),require_link_style = __commonJS({
  '../work/pchuri__confluence-cli/lib/link-style.js'(exports, module) {
    const VALID_LINK_STYLES = ['smart', 'plain', 'wiki'];

    function resolveLinkStyle({ isCloud = false, linkStyle = null } = {}) {
      if (VALID_LINK_STYLES.includes(linkStyle)) return linkStyle;
      return isCloud ? 'smart' : 'plain';
    }

    module.exports = { VALID_LINK_STYLES, resolveLinkStyle };
  },
});
require_html_to_storage=__commonJS({
  '../work/pchuri__confluence-cli/lib/html-to-storage.js'(exports,module){
    var {
      parseDocument:parseDocument
    }
    =((require)(("htmlparser2"))),{
      resolveLinkStyle:resolveLinkStyle
    }
    =((require_link_style)()),DEFAULT_HTML_MAX_DEPTH=256,HtmlDepthExceededError=class extends Error{
      constructor(maxDepth) {
      super('HTML nesting exceeds limit of ' + maxDepth + ' levels');
      this.name = 'HtmlDepthExceededError';
      this.maxDepth = maxDepth;
    }
    }
    ,local267=new Set(['hr']),local268=["info","warning","note"],local269=new Set(["svg","div"]),local270=new Set(['a',"strong",'em',"code",'br',"img","span","mark","sub","sup","ins","del",'b','i','u',"small",'s',"abbr","kbd",'q',"var","cite","time","dfn","samp"]);
    function hasOnlyInlineChildren(node) {
      if (!node.children) return true;
      for (const child of node.children) {
        if (child.type === 'text' && child.data.includes('\n')) return false;
        if (child.type === 'tag' && !INLINE_TAGS.has(child.name)) return false;
      }
      return true;
    }
    function isWhitespaceText(node) {
      return node.type === 'text' && /^\s*$/.test(node.data);
    }
    function nonWhitespaceChildren(node) {
      return (node.children || []).filter(child => !isWhitespaceText(child));
    }
    function parsePlaceholder(value, { allowPlain = false } = {}) {
      const marker = (value || '').trim();
      if (marker === '[[_TOC_]]' || marker === '_TOC_' || (allowPlain && marker === 'TOC')) {
        return { kind: 'toc' };
      }
      if (marker === '[[_LISTING_]]' || marker === '_LISTING_' || (allowPlain && marker === 'LISTING')) {
        return { kind: 'children' };
      }
      return null;
    }
    function parsePlaceholderParagraph(local271){
        if(false)return "\n**EXPAND: "+local272+"**\n\n"+this.walkNodes(local273)["trim"]()+("\n\n**EXPAND_END**\n");
      else{
        if(((local271.name)!==('p')))return null;
        const local274=((nonWhitespaceChildren)((local271)));
        if(((local274.length)!==(1)))return null;
        if(((local274[0]["type"])===("text"))){
          if(false){
            const local275={
            }
            ;
            return local275.kind="children",local275;
          }
          else return ((parsePlaceholder)((local274[0]["data"])));
        }
        const local276=local274[0];
        if(((local276.type)!==("tag"))||((local276.name)!==("strong")))return null;
        const local277=((nonWhitespaceChildren)((local276)));
        if(((local277.length)!==(1)))return null;
        const local278=local277[0];
        if(((local278.type)!==("text")))return null;
        const local279={
        }
        ;
        local279.allowPlain= true ;
        const local280=((parsePlaceholder)((local278.data),(local279)));
        if(local280)return local280;
        const local281=local278.data.match(/^ANCHOR: (.+)$/);
        if(local281)return{
          'kind':"anchor",'id':local281[1]
        }
        ;
        return null;
      }
    }
    function isExpandStart(local282){
        if(false)local283.push(local284);
      else{
        if(((local282.type)!==("tag"))||((local282.name)!==('p')))return false ;
        const local285=((nonWhitespaceChildren)((local282)));
        if(((local285.length)!==(1)))return false ;
        const local286=local285[0];
        if(((local286.type)!==("tag"))||((local286.name)!==("strong")))return false ;
        if(!local286.children||((local286.children.length)===(0)))return false ;
        const local287=local286.children[0];
        return ((local287.type)===("text"))&&local287.data.startsWith("EXPAND: ");
      }
    }
    function isExpandEnd(local288){
      if(((local288.type)!==("tag"))||((local288.name)!==('p')))return false ;
      const local289=((nonWhitespaceChildren)((local288)));
      if(((local289.length)!==(1)))return false ;
       const local290=local289[0];
      if(((local290.type)!==("tag"))||((local290.name)!==("strong")))return false ;
      const local291=((nonWhitespaceChildren)((local290)));
       if(((local291.length)!==(1)))return false ;
      const local292=local291[0];
      return ((local292.type)===("text"))&&((local292.data)===("EXPAND_END"));
    }
    function decodeXmlText(value, { preserveDouble = false } = {}) {
      if (preserveDouble) {
        return value.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      }
      return value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    }
    function renderAnchor(local293,local294){
        {
        const local295=local293.attribs||{
        }
        ,local296=local295.href||'',local297=((renderChildren)((local293),(local294)));
        if(local296.startsWith('#')){
          const local298=local296.slice(1),local299=((decodeXmlText)((local297)));
          return "<ac:link ac:anchor=\""+local298+("\"><ac:plain-text-link-body><![CDATA[")+local299+("]]></ac:plain-text-link-body></ac:link>");
        }
        switch(local294.linkStyle){
          case "smart":{
            {
              const local300={
                ...local295
              }
              ;
              local300["data-card-appearance"]="inline";
              const local301=local300;
              return'<a'+((renderAttributes)((local301)))+'>'+local297+"</a>";
            }
          }
          case "wiki":return "<ac:link><ri:url ri:value=\""+local296+("\" /><ac:plain-text-link-body><![CDATA[")+local297+("]]></ac:plain-text-link-body></ac:link>");
          case "plain":default:return'<a'+((renderAttributes)((local295)))+'>'+local297+"</a>";
        }
      }
    }
    function parseCallout(local302){
      const local303=((nonWhitespaceChildren)((local302)));
      if(((local303.length)===(0)))return null;
      const local304=local303[0];
      if(((local304.type)!==("tag"))||((local304.name)!==('p')))return null;
      const local305=local304.children||[],local306=local305.findIndex(local307=>!isWhitespaceText(local307));
      if(((local306)<(0)))return null;
      const local308=local305[local306];
      if(((local308.type)!==("tag"))||((local308.name)!==("strong")))return null;
      const local309=((nonWhitespaceChildren)((local308)));
      if(((local309.length)!==(1))||((local309[0]["type"])!==("text")))return null;
      const local310=local268.find(local311=>local309[0]["data"]===local311.toUpperCase());
      if(!local310)return null;
      const local312=local305.slice(((local306)+(1))),local313=local312.some(local314=>!isWhitespaceText(local314));
       if(local313){
        if(((local312[0]["type"])!==("text"))||!/^\s*\n/["test"](local312[0]["data"]))return null;
      }
      const local315={
      }
      ;
       return local315.marker=local310,local315.sameLine=local313,local315.markerP=local304,local315.tail=local312,local315;
    }
    function renderBlockquote(local316,local317){
       const local318={
      }
      ;
      local318.exxAt="4|3|0|2|1",local318.RCazM="Inclure le bloc partagé",local318.jdMsP="Détails",local318.iMhgm="de la page",local318.BPhxg="Bloc partagé",local318.WndEf="Inclure la page";
       const local319=local318;
      if(true){
        const local320=((parseCallout)((local316)));
        if(!local320)return "<blockquote>"+((renderChildren)((local316),(local317)))+("</blockquote>");
        const {
          marker:local321,sameLine:local322,markerP:local323,tail:local324
        }
        =local320,local325=local316.children||[];
        let local326;
        if(local322){
          {
            const local327=local324.map(local328=>renderNode(local328,local317))["join"]('')["replace"](/^\s*\n/,''),local329=local325.filter(local330=>local330!==local323)["map"](local331=>renderNode(local331,local317))["join"]('');
            local326="<p>"+local327+"</p>"+local329;
          }
        }
        else local326=local325.filter(local332=>local332!==local323)["map"](local333=>renderNode(local333,local317))["join"]('')["replace"](/^\s+/,'');
        return "<ac:structured-macro ac:name=\""+local321+("\">\n          <ac:rich-text-body>")+local326+("</ac:rich-text-body>\n        </ac:structured-macro>");
      }
      else return this.renderCodeSpan(this.walkNodes(local334.children));
    }
    function renderDetails(local335,local336){
       const local337={
        'Twvwy':function(local338,local339,local340){
           return ((local338)((local339),(local340)));
        }
        ,'lEupe':function(local341,local342){
           return ((local341)((local342)));
        }
        ,'LnQJm':function(local343,local344,local345){
           return ((local343)((local344),(local345)));
        }
      }
      ;
       if(false)local346.push(local347.slice(local348,local349.index)),local350.push(local351[0]),local352=IhQyRl.zxgHC(local353.index,local354[0]["length"]);
      else{
        const local355=local335.children||[];
        let local356=null,local357=[];
        for(const local358 of local355){
          if(((local358.type)===("tag"))&&((local358.name)===("summary"))){
            if(true)local356=local358;
            else{
              const local359=[],local360=/^ {0,3}(`{3,})[^\n]*\n[\s\S]*?\n {0,3}\1[\t ]*$/gm;
              let local361=0,local362;
              while(IhQyRl.pGfPd(local362=local360.exec(local363),null)){
                local359.push(local364.slice(local361,local362.index)),local359.push(local362[0]),local361=IhQyRl.zxgHC(local362.index,local362[0]["length"]);
              }
              return local359.push(local365.slice(local361)),local359;
            }
          }
          else{
            if(!((isWhitespaceText)((local358)))){
              if(true)local357.push(local358);
              else return local337.Twvwy(local366,local367,local368);
            }
          }
        }
        if(!local356)return (("KCPgG")!==("KCPgG"))?"<details"+local337.lEupe(local369,local370.attribs)+'>'+local337.LnQJm(local371,local372,local373)+("</details>"):"<details"+((renderAttributes)((local335.attribs)))+'>'+((renderChildren)((local335),(local336)))+("</details>");
        const local374=((renderChildren)((local356),(local336))),local375=local374.replace(/<[^>]+>/g,'')["trim"](),local376=local357.map(local377=>renderNode(local377,local336))["join"]('')["trim"]();
        return "<ac:structured-macro ac:name=\"expand\"><ac:parameter ac:name=\"title\">"+local375+("</ac:parameter><ac:rich-text-body>")+local376+("</ac:rich-text-body></ac:structured-macro>");
      }
    }
    function renderPreformatted(local378,local379){
      const local380=local378.children||[];
        const local381=((local380.length)===(1))&&((local380[0]["type"])===("tag"))&&((local380[0]["name"])===("code"));
      if(!local381){
        if(false)this._markdownCodeSpanDepth--;
        else return "<pre>"+((renderChildren)((local378),(local379)))+"</pre>";
      }
      const local382=local380[0],local383=local382.attribs.class||'',local384=local383.match(/language-(\w+)/),local385=local384?local384[1]:"text";
      let local386='';
      for(const local387 of local382.children||[]){
        if(true){
          if(((local387.type)===("text")))local386+=local387.data;
        }
        else return local388.replace(/&quot;/g,'\x22')["replace"](/&lt;/g,'<')["replace"](/&gt;/g,'>')["replace"](/&amp;/g,'&');
      }
      const local389={
      }
      ;
      local389.preserveDouble= true ,local386=((decodeXmlText)((local386.replace(/\n$/,'')),(local389)))["replace"](/]]>/g,"]]]]><![CDATA[>");
      switch(local385){
        case "plantuml":return "<ac:structured-macro ac:name=\"plantuml\"><ac:plain-text-body><![CDATA["+local386+("]]></ac:plain-text-body></ac:structured-macro>");
        default:return "<ac:structured-macro ac:name=\"code\"><ac:parameter ac:name=\"language\">"+local385+("</ac:parameter><ac:plain-text-body><![CDATA[")+local386+("]]></ac:plain-text-body></ac:structured-macro>");
      }
    }
    function renderPassthrough(local390,local391){
        {
        const {
          randomUUID:local392
        }
        =((require)(("crypto"))),local393=((renderChildren)((local390),(local391))),local394=((renderAttributes)((local390.attribs))),local395='<'+local390.name+local394+'>',local396='</'+local390.name+'>',local397=((((local395)+(local393)))+(local396)),local398=local397.replace(/]]>/g,"]]]]><![CDATA[>"),local399=((local392)());
        return "<ac:structured-macro ac:name=\"html\" ac:schema-version=\"1\" ac:macro-id=\""+local399+("\"><ac:plain-text-body><![CDATA[")+local398+("]]></ac:plain-text-body></ac:structured-macro>");
      }
    }
    function escapeXmlAttribute(local400){
      const local401={
        'DNkVU':function(local402,local403){
           return ((local402)===(local403));
        }
        ,'VcPRz':"code_block",'EEYDT':function(local404,local405){
           return ((local404)===(local405));
        }
        ,'DMPws':"fence",'NrOms':function(local406,local407){
           return ((local406)((local407)));
        }
        ,'yxnzM':function(local408,local409){
           return ((local408)((local409)));
        }
      }
      ;
      if(false)(local401.DNkVU(local410.type,"code_block")||local401.EEYDT(local411.type,"fence"))&&local412.map&&local413.push([local401.NrOms(local414,local415.map[0]),local401.yxnzM(local416,local417.map[1])]);
      else return ((String)((local400)))["replace"](/"/g,"&quot;");
    }
    function renderAttributes(attributes) {
      if (!attributes) return '';
      return Object.keys(attributes)
        .map(name => ' ' + name + '=\"' + escapeXmlAttribute(attributes[name]) + '\"')
        .join('');
    }
    function renderChildren(local418,local419){
        {
        if(!local418.children)return'';
        const local420=local418.children,local421=[];
        let local422=0;
        while(((local422)<(local420.length))){
          const local423=local420[local422];
          if(((isExpandStart)((local423)))){
            if(false)return local424;
            else{
              const local425=local420.findIndex((local426,local427)=>local427>local422&&isExpandEnd(local426));
              if(((local425)!==(-(1)))){
                const local428=local423.children[0],local429=((renderChildren)((local428),(local419)))["replace"](/^EXPAND: /,''),local430=local429.replace(/<[^>]+>/g,'')["trim"](),local431=local420.slice(((local422)+(1)),local425)["map"](local432=>renderNode(local432,local419))["join"]('')["trim"]();
                local421.push("<ac:structured-macro ac:name=\"expand\"><ac:parameter ac:name=\"title\">"+local430+("</ac:parameter><ac:rich-text-body>")+local431+("</ac:rich-text-body></ac:structured-macro>")),local422=((local425)+(1));
                continue;
              }
            }
          }
          local421.push(((renderNode)((local423),(local419)))),local422++;
        }
        return local421.join('');
      }
    }
    function renderNode(local433,local434){
        {
        if(((local433.type)===("text")))return local433.data;
        if(((local433.type)===("comment"))){
          {
            const local435=((parsePlaceholder)((local433.data)));
            if(local435&&((local435.kind)===("toc")))return "<ac:structured-macro ac:name=\"toc\" ac:schema-version=\"1\" />";
            if(local435&&((local435.kind)===("children")))return "<ac:structured-macro ac:name=\"children\" ac:schema-version=\"2\" />";
            return'';
          }
        }
        if(((local433.type)!==("tag")))return'';
        if(((++local434.depth)>(local434.maxDepth))){
          local434.depth--;
          throw new HtmlDepthExceededError(local434.maxDepth);
        }
        try{
          if(true)return ((renderElement)((local433),(local434)));
          else{
            if(!local436)return'';
            return local437.map(local438=>this.walkNode(local438))["join"]('');
          }
        }
        finally{
          local434.depth--;
        }
      }
    }
    function renderElement(local439,local440){
      const local441={
        'WqlJj':function(local442,local443){
           return ((local442)-(local443));
        }
        ,'YduxD':"4|1|2|3|0",'PIkim':"Details",'APuSJ':"Gemeinsamer Block",'ntkNY':"Gemeinsamen Block einbinden",'LaUGj':"von Seite",'ddbHE':"Seite einbinden",'VBCTu':function(local444,local445){
           return ((local444)((local445)));
        }
        ,'cXuaX':function(local446,local447){
           return ((local446)===(local447));
        }
        ,'RDAZl':"toc",'RpNzU':"<ac:structured-macro ac:name=\"toc\" ac:schema-version=\"1\" />",'EaMqK':"children",'zxLYk':"<ac:structured-macro ac:name=\"children\" ac:schema-version=\"2\" />"
      }
      ;
      if(true)switch(local439.name){
        case'p':{
          {
            const local448=((parsePlaceholderParagraph)((local439)));
            if(local448&&((local448.kind)===("toc")))return "<ac:structured-macro ac:name=\"toc\" ac:schema-version=\"1\" />";
            if(local448&&((local448.kind)===("children")))return "<ac:structured-macro ac:name=\"children\" ac:schema-version=\"2\" />";
            if(local448&&((local448.kind)===("anchor"))){
              if(false){
                const local449="display/"+local450+'/'+IhQyRl.MXPJO(local451,local452);
                return "\n> 📄 **"+local453+"**: ["+local454+']('+this.buildUrl(this.webUrlPrefix+'/'+local449)+')\x0a';
              }
              else return "<ac:structured-macro ac:name=\"anchor\"><ac:parameter ac:name=\"\">"+local448['id']+("</ac:parameter></ac:structured-macro>");
            }
            return'<p'+((renderAttributes)((local439.attribs)))+'>'+((renderChildren)((local439),(local440)))+"</p>";
          }
        }
        case'h1':case'h2':case'h3':case'h4':case'h5':case'h6':case "strong":case'em':return'<'+local439.name+((renderAttributes)((local439.attribs)))+'>'+((renderChildren)((local439),(local440)))+'</'+local439.name+'>';
        case'hr':return "<hr />";
        case'br':return "<br />";
        case "img":return "<img"+((renderAttributes)((local439.attribs)))+'>';
        case'ul':case'ol':return'<'+local439.name+((renderAttributes)((local439.attribs)))+'>'+((renderChildren)((local439),(local440)))+'</'+local439.name+'>';
        case'li':{
          const local455=((renderChildren)((local439),(local440))),local456="<li"+((renderAttributes)((local439.attribs)))+'>';
          return ((hasOnlyInlineChildren)((local439)))?local456+"<p>"+local455+("</p></li>"):''+local456+local455+"</li>";
        }
        case "pre":return ((renderPreformatted)((local439),(local440)));
        case "code":return "<code"+((renderAttributes)((local439.attribs)))+'>'+((renderChildren)((local439),(local440)))+"</code>";
        case'a':return ((renderAnchor)((local439),(local440)));
        case "blockquote":return ((renderBlockquote)((local439),(local440)));
        case "details":return ((renderDetails)((local439),(local440)));
        case "table":case "thead":case "tbody":case "tfoot":case'tr':return'<'+local439.name+((renderAttributes)((local439.attribs)))+'>'+((renderChildren)((local439),(local440)))+'</'+local439.name+'>';
        case'th':case'td':{
          const local457=((renderChildren)((local439),(local440))),local458='<'+local439.name+((renderAttributes)((local439.attribs)))+'>';
          return ((hasOnlyInlineChildren)((local439)))?local458+"<p>"+local457+"</p></"+local439.name+'>':''+local458+local457+'</'+local439.name+'>';
        }
        default:if(local267.has(local439.name))return'<'+local439.name+((renderAttributes)((local439.attribs)))+" />";
        if(local269.has(local439.name)){
          if(true)return ((renderPassthrough)((local439),(local440)));
          else{
            const local459="4|1|2|3|0"["split"]('|');
            let local460=0;
            while( true ){
              switch(local459[local460++]){
                case'0':local461.expandDetails="Details";
                continue;
                case'1':local462.sharedBlock="Gemeinsamer Block";
                continue;
                case'2':local463.includeSharedBlock="Gemeinsamen Block einbinden";
                continue;
                case'3':local464.fromPage="von Seite";
                continue;
                case'4':local465.includePage="Seite einbinden";
                continue;
              }
              break;
            }
          }
        }
        return'<'+local439.name+((renderAttributes)((local439.attribs)))+'>'+((renderChildren)((local439),(local440)))+'</'+local439.name+'>';
      }
      else{
        const local466=EIUYxH.VBCTu(local467,local468.data);
        if(local466&&EIUYxH.cXuaX(local466.kind,EIUYxH.RDAZl))return EIUYxH.RpNzU;
        if(local466&&EIUYxH.cXuaX(local466.kind,EIUYxH.EaMqK))return EIUYxH.zxLYk;
        return'';
      }
    }
    function htmlToStorage(html, options = {}) {
      const isCloud = Boolean(options.isCloud);
      const linkStyle = resolveLinkStyle({ isCloud, linkStyle: options.linkStyle });
      const context = {
        linkStyle,
        depth: 0,
        maxDepth: typeof options.maxDepth === 'number' ? options.maxDepth : DEFAULT_HTML_MAX_DEPTH,
      };
      return renderChildren(parseDocument(html, { decodeEntities: false }), context);
    }
    const local469={
    }
    ;
    local469.htmlToStorage=htmlToStorage,local469.HtmlDepthExceededError=HtmlDepthExceededError,module.exports=local469;
  }
}
),MarkdownIt=require("markdown-it"),{
  StorageWalker
}
=require_storage_walker(),{
  htmlToStorage
}
=require_html_to_storage(),{
  VALID_LINK_STYLES,resolveLinkStyle
}
=require_link_style(),CALLOUT_MARKERS=["info","warning","note"],STASH_DELIM='\uE000',PASSTHROUGH_TAG_RE=/<\/?(?:br|u|sub|sup|mark|details|summary)(?=[\s/>])(?:"[^"]*"|'[^']*'|[^>])*>/gi,PASSTHROUGH_BLOCK_RE=/<(svg|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi,INLINE_CODE_RE=/`[^`\n]+`/g;
function escapeXmlAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
var MacroConverter=class{
  constructor({
    isCloud = false,
    webUrlPrefix = '',
    buildUrl = null,
    linkStyle = null,
  } = {}) {
    this._isCloud = isCloud;
    this.webUrlPrefix = webUrlPrefix;
    this.buildUrl = buildUrl || (value => value);
    this.linkStyle = resolveLinkStyle({ isCloud, linkStyle });
    this.markdown = new MarkdownIt();
    this.setupConfluenceMarkdownExtensions();
  }
  isCloud(){
     return this._isCloud;
  }
  setupConfluenceMarkdownExtensions() {
    this.markdown.enable(['table', 'strikethrough', 'linkify']);
    this.markdown.core.ruler.before('normalize', 'confluence_macros', state => {
      const stashedCode = [];
      state.src = state.src.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`/g, value => {
        const index = stashedCode.push(value) - 1;
        return STASH_DELIM + index + STASH_DELIM;
      });

      for (const marker of CALLOUT_MARKERS) {
        const callout = new RegExp(
          '(^|\\n)\\[!' + marker + '\\]\\s*([\\s\\S]*?)(?=\\n\\s*\\n|\\n\\s*\\[!|$)',
          'g',
        );
        state.src = state.src.replace(callout, (match, prefix, body) =>
          prefix + '> **' + marker.toUpperCase() + '**\n> ' + body.trim().replace(/\n/g, '\n> '));
      }

      const stashPattern = new RegExp(STASH_DELIM + '(\\d+)' + STASH_DELIM, 'g');
      state.src = state.src.replace(stashPattern, (match, index) => stashedCode[+index] ?? match);
    });
  }  markdownToStorage(markdown){
      return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(markdown));
  }
  markdownToNativeStorage(markdown){
      return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(markdown));
  }
  _renderMarkdownToHtml(markdown) {
    const codeRanges = this._findCodeRanges(markdown);
    const passthrough = [];

    const replaceLineMarker = (text, markerPattern, replacement) => {
      const pattern = '(^|\\n)([^\\S\\n]*)' + markerPattern + '[^\\S\\n]*(?=\\n|$)';
      return text.replace(new RegExp(pattern, 'gi'), (match, prefix, indent) => prefix + indent + replacement);
    };
    const normalizeMarkers = text => {
      let normalized = replaceLineMarker(text, '<!--\\s*(?:\\[\\[)?_TOC_(?:\\]\\])?\\s*-->', '**TOC**');
      normalized = replaceLineMarker(normalized, '<!--\\s*(?:\\[\\[)?_LISTING_(?:\\]\\])?\\s*-->', '**LISTING**');
      normalized = replaceLineMarker(normalized, '\\[\\[_TOC_\\]\\]', '**TOC**');
      return replaceLineMarker(normalized, '\\[\\[_LISTING_\\]\\]', '**LISTING**');
    };
    const processOutsideCode = text => {
      let processed = normalizeMarkers(text).replace(PASSTHROUGH_BLOCK_RE, value => {
        const index = passthrough.push(value) - 1;
        return STASH_DELIM + 'H' + index + STASH_DELIM;
      });
      return processed.replace(PASSTHROUGH_TAG_RE, value => {
        const index = passthrough.push(value) - 1;
        return STASH_DELIM + 'H' + index + STASH_DELIM;
      });
    };

    let prepared = '';
    let previousEnd = 0;
    for (const [start, end] of codeRanges) {
      prepared += processOutsideCode(markdown.slice(previousEnd, start));
      prepared += markdown.slice(start, end);
      previousEnd = end;
    }
    prepared += processOutsideCode(markdown.slice(previousEnd));

    const html = this.markdown.render(prepared);
    let scanIndex = 0;
    let insideTag = false;
    const placeholder = new RegExp(STASH_DELIM + 'H(\\d+)' + STASH_DELIM, 'g');
    return html.replace(placeholder, (match, index, offset) => {
      for (; scanIndex < offset; scanIndex += 1) {
        if (html[scanIndex] === '<') insideTag = true;
        else if (html[scanIndex] === '>') insideTag = false;
      }
      scanIndex = offset + match.length;
      const value = passthrough[+index];
      if (value == null) return match;
      return insideTag ? escapeXmlAttr(value) : value;
    });
  }
  _findCodeRanges(markdown) {
    const tokens = this.markdown.parse(markdown, {});
    const lineStarts = [0];
    for (let index = 0; index < markdown.length; index += 1) {
      if (markdown[index] === '\n') lineStarts.push(index + 1);
    }
    const offsetForLine = line => line < lineStarts.length ? lineStarts[line] : markdown.length;
    const ranges = [];
    for (const token of tokens) {
      if ((token.type === 'code_block' || token.type === 'fence') && token.map) {
        ranges.push([offsetForLine(token.map[0]), offsetForLine(token.map[1])]);
      }
    }
    INLINE_CODE_RE.lastIndex = 0;
    let match;
    while ((match = INLINE_CODE_RE.exec(markdown)) !== null) {
      ranges.push([match.index, match.index + match[0].length]);
    }
    ranges.sort((left, right) => left[0] - right[0] || left[1] - right[1]);
    const merged = [];
    for (const range of ranges) {
      const previous = merged[merged.length - 1];
      if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]);
      else merged.push([range[0], range[1]]);
    }
    return merged;
  }
  htmlToConfluenceStorage(html) {
    return htmlToStorage(html, {
      isCloud: this._isCloud,
      linkStyle: this.linkStyle,
    });
  }
  detectLanguageLabels(storage) {
    const labels = {
      includePage: 'Include Page',
      sharedBlock: 'Shared Block',
      includeSharedBlock: 'Include Shared Block',
      fromPage: 'from page',
      expandDetails: 'Expand Details',
    };

    if (/[\u4e00-\u9fa5]/.test(storage)) {
      Object.assign(labels, { includePage: '包含页面', sharedBlock: '共享块', includeSharedBlock: '包含共享块', fromPage: '来自页面', expandDetails: '展开详情' });
    } else if (/[\u3040-\u309f\u30a0-\u30ff]/.test(storage)) {
      Object.assign(labels, { includePage: 'ページを含む', sharedBlock: '共有ブロック', includeSharedBlock: '共有ブロックを含む', fromPage: 'ページから', expandDetails: '詳細を表示' });
    } else if (/[\uac00-\ud7af]/.test(storage)) {
      Object.assign(labels, { includePage: '페이지 포함', sharedBlock: '공유 블록', includeSharedBlock: '공유 블록 포함', fromPage: '페이지에서', expandDetails: '상세 보기' });
    } else if (/[\u0400-\u04ff]/.test(storage)) {
      Object.assign(labels, { includePage: 'Включить страницу', sharedBlock: 'Общий блок', includeSharedBlock: 'Включить общий блок', fromPage: 'со страницы', expandDetails: 'Подробнее' });
    } else if ((storage.match(/[àâäéèêëïîôùûüÿœæç]/gi) || []).length >= 2) {
      Object.assign(labels, { includePage: 'Inclure la page', sharedBlock: 'Bloc partagé', includeSharedBlock: 'Inclure le bloc partagé', fromPage: 'de la page', expandDetails: 'Détails' });
    } else if ((storage.match(/[äöüß]/gi) || []).length >= 2) {
      Object.assign(labels, { includePage: 'Seite einbinden', sharedBlock: 'Gemeinsamer Block', includeSharedBlock: 'Gemeinsamen Block einbinden', fromPage: 'von Seite', expandDetails: 'Details' });
    } else if ((storage.match(/[áéíóúñ¿¡]/gi) || []).length >= 2) {
      Object.assign(labels, { includePage: 'Incluir página', sharedBlock: 'Bloque compartido', includeSharedBlock: 'Incluir bloque compartido', fromPage: 'de la página', expandDetails: 'Detalles' });
    }
    return labels;
  }
  storageToMarkdown(storage, options = {}) {
    const walker = new StorageWalker({
      attachmentsDir: options.attachmentsDir || 'attachments',
      labels: this.detectLanguageLabels(storage),
      buildUrl: this.buildUrl,
      webUrlPrefix: this.webUrlPrefix,
    });
    const markdown = walker.walk(storage);
    if (typeof options.onWarnings === 'function' && walker.warnings.length > 0) {
      options.onWarnings(walker.warnings);
    }
    return markdown;
  }
}
;
module.exports=MacroConverter,module.exports.VALID_LINK_STYLES=VALID_LINK_STYLES;
