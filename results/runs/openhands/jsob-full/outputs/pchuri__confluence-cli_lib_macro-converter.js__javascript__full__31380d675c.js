const __commonJS = (moduleDefinitions, cachedModule) => function loadModule() {
  if (!cachedModule) {
    cachedModule = { exports: {} };
    const initialize = moduleDefinitions[Object.getOwnPropertyNames(moduleDefinitions)[0]];
    initialize(cachedModule.exports, cachedModule);
  }
  return cachedModule.exports;
};

const require_markdown_cleanup = __commonJS({
  '../work/pchuri__confluence-cli/lib/markdown-cleanup.js'(unusedModule, markdownCleanupModule) {
  function fenceLength(markdown) {
    const fences = markdown.match(/`+/g) || [];
    const longestFence = fences.reduce((longest, fence) => Math.max(longest, fence.length), 0);
    return Math.max(3, longestFence + 1);
  }

  function splitOnFences(markdown) {
    const segments = [];
    const fencedBlockPattern = /^ {0,3}(`{3,})[^\n]*\n[\s\S]*?\n {0,3}\1[\t ]*$/gm;
    let lastIndex = 0;
    let match;
    while ((match = fencedBlockPattern.exec(markdown)) !== null) {
      segments.push(markdown.slice(lastIndex, match.index), match[0]);
      lastIndex = match.index + match[0].length;
    }
    segments.push(markdown.slice(lastIndex));
    return segments;
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
      .map((segment, index) => index % 2 === 1 ? segment : cleanupOutsideFence(segment))
      .join('')
      .trim();
  }

  markdownCleanupModule.exports = {
    fenceLength,
    splitOnFences,
    cleanupOutsideFence,
    cleanupWithFences,
  };
}
});

const require_storage_walker = __commonJS({
  '../work/pchuri__confluence-cli/lib/storage-walker.js'(unusedStorageModule, storageWalkerModule) {
    const { Parser: HtmlParser, DomHandler } = require('htmlparser2');
    const { decodeHTML: decodeHtml } = require('entities');
    const { fenceLength, cleanupWithFences } = require_markdown_cleanup();
    const DEFAULT_MAX_DEPTH = 256;
    const namedEntityMap = {
      nbsp: ' ',
      ldquo: '"',
      rdquo: '"',
      lsquo: "'",
      rsquo: "'",
      hellip: '...',
    };

    function decodeStorageEntities(text) {
      if (!text) return '';
      return text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (entity, entityName) => {
        if (entityName[0] === '#') {
          const isHex = entityName[1] === 'x' || entityName[1] === 'X';
          const codePoint = parseInt(entityName.slice(isHex ? 2 : 1), isHex ? 16 : 10);
          if (!Number.isFinite(codePoint)) return entity;
          try {
            return String.fromCodePoint(codePoint);
          } catch {
            return entity;
          }
        }
        if (Object.prototype.hasOwnProperty.call(namedEntityMap, entityName)) {
          return namedEntityMap[entityName];
        }
        return decodeHtml(`&${entityName};`);
      });
    }

    class StorageDepthExceededError extends Error {
      constructor(maxDepth) {
        super(`Storage XML nesting exceeds limit of ${maxDepth} levels`);
        this.name = 'StorageDepthExceededError';
        this.maxDepth = maxDepth;
      }
    }

    class StorageWalker {
      constructor({
        attachmentsDir = 'attachments',
        labels = {},
        buildUrl = url => url,
        webUrlPrefix = '',
        maxDepth = DEFAULT_MAX_DEPTH,
      } = {}) {
        this.attachmentsDir = attachmentsDir;
        this.labels = labels;
        this.buildUrl = buildUrl;
        this.webUrlPrefix = webUrlPrefix;
        this.maxDepth = maxDepth;
      }
      walk(storageXml) {
        this._depth = (0), this._markdownLinkLabelDepth = (0), this._markdownCodeSpanDepth = (0), this.warnings = []; const options3 = {
        }; options3.xmlMode = (true); const handler1 = new DomHandler(null, options3), items1 = []; const result1 = (handler1.onopentag).bind(handler1), result2 = (handler1.onclosetag).bind(handler1); handler1.onopentag = (...value2) => {
          const options4 = {
          }; options4.sIdx = parser1.startIndex, options4.eIdx = parser1.endIndex, items1.push(options4); (result1(...value2));
        }, handler1.onclosetag = (...value3) => {
          {
            const [value4, value5] = value3, item1 = items1.pop(); if (value5) {
              const value6 = item1 && (((item1.sIdx)) === ((parser1.startIndex))) && (((item1.eIdx)) === ((parser1.endIndex))); if (!value6) {
                {
                  const value7 = parser1.endIndex, options1 = {
                  }; options1.type = ("implicit-close"), options1.tag = value4, options1.offset = value7, (this.warnings).push(options1); if (process.env.CONFLUENCE_CLI_VERBOSE) {
                    (process.stderr).write(("StorageWalker: auto-closed <") + value4 + (("> at offset ")) + value7 + '\x0a');
                  }
                }
              }
            }
            (result2(...value3));
          }
        }; const options5 = {
        }; options5.xmlMode = (true), options5.recognizeSelfClosing = (true), options5.decodeEntities = (true); const parser1 = new HtmlParser(handler1, options5); parser1.write(storageXml), parser1.end(); return this.cleanup(this.walkNodes(handler1.dom));
      }
      walkNodes(nodes) {
        {
          if (!nodes) return ''; return (nodes.map(item2 => this.walkNode(item2))).join('');
        }
      }
      walkNode(node) {
        if (!node) return ''; switch (node.type) {
          case ("text"): return this.renderText(node.data || ''); case ("cdata"): return this.walkNodes(node.children); case ("comment"): case ("directive"): return ''; case ("tag"): case ("script"): case ("style"): return this.walkElement(node); default: return '';
        }
      }
      walkElement(element) {
        if (((++this._depth) > (this.maxDepth))) {
          {
            this._depth--; throw new StorageDepthExceededError(this.maxDepth);
          }
        }
        try {
          return this._dispatchElement(element);
        }finally {
          this._depth--;
        }
      }
      _dispatchElement(element) {
        {
          const name1 = element.name; switch (name1) {
            case 'p': return (((('\x0a') + ((this.walkNodes(element.children)).trim()))) + ('\x0a')); case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
              const result4 = (parseInt((name1.charAt((1))), ((10)))); return (((((((('\x0a') + (('#').repeat(result4)))) + ('\x20'))) + ((this.walkNodes(element.children)).trim()))) + ('\x0a'));
            }
            case ("strong"): case 'b': return (((('**') + (this.walkNodes(element.children)))) + ('**')); case 'em': case 'i': return (((('*') + (this.walkNodes(element.children)))) + ('*')); case 's': case ("del"): return (((('~~') + (this.walkNodes(element.children)))) + ('~~')); case ("code"): {
              {
                this._markdownCodeSpanDepth++; try {
                  return this.renderCodeSpan(this.walkNodes(element.children));
                }finally {
                  this._markdownCodeSpanDepth--;
                }
              }
            }
            case 'br': return '\x0a'; case 'hr': return ("\n---\n"); case 'a': {
              {
                const text10 = (decodeStorageEntities((element.attribs && (element.attribs).href || ''))); if (!text10) return this.walkNodes(element.children); this._markdownLinkLabelDepth++; let value10; try {
                  value10 = this.walkNodes(element.children);
                }finally {
                  this._markdownLinkLabelDepth--;
                }
                return '[' + value10 + '](' + text10 + ')';
              }
            }
            case ("time"): return this.renderText(element.attribs && (element.attribs).datetime || '') || this.walkNodes(element.children); case 'ul': return this.handleList(element, (false)); case 'ol': return this.handleList(element, (true)); case 'li': return this.walkNodes(element.children); case ("table"): return this.handleTable(element); case ("thead"): case ("tbody"): case ("tfoot"): case 'tr': case 'th': case 'td': return this.walkNodes(element.children); case ("blockquote"): return this.handleBlockquote(element); case ("details"): case ("summary"): case 'u': case ("sub"): case ("sup"): case ("mark"): return (((('<' + name1 + '>') + (this.walkNodes(element.children)))) + ('</' + name1 + '>')); case ("ac:structured-macro"): return this.handleMacro(element); case ("ac:image"): return this.handleImage(element); case ("ac:link"): return this.handleAcLink(element); case ("ac:task-list"): return this.handleTaskList(element); case ("ac:layout"): case ("ac:layout-section"): case ("ac:layout-cell"): case ("ac:rich-text-body"): case ("ac:link-body"): return this.walkNodes(element.children); case ("ri:url"): case ("ri:page"): case ("ri:attachment"): case ("ac:plain-text-body"): case ("ac:plain-text-link-body"): case ("ac:parameter"): return ''; default: return this.walkNodes(element.children);
          }
        }
      }
      handleList(listElement, ordered) {
        const items13 = (listElement.children || []).filter(item3 => item3.type === "tag" && item3.name === 'li'); let count1 = (1), text1 = ''; for (const node3 of items13) {
          {
            const text11 = ((this.walkNodes(node3.children)).replace(/\s+/g, '\x20')).trim(); if (!text11) continue; const value11 = ordered ? count1++ + '.': '-'; text1 += value11 + '\x20' + text11 + '\x0a';
          }
        }
        return text1 ? (('\x0a') + (text1)): '';
      }
      handleTable(tableElement) {
        {
          const items2 = [], result8 = this.findAllDescendants(tableElement, 'tr'); let value12 = (true); for (const node4 of result8) {
            const items3 = (node4.children || []).filter(item4 => item4.type === "tag" && (item4.name === 'th' || item4.name === 'td')); if (((items3.length) === ((0)))) continue; const items4 = items3.map(item5 => ((this.walkNodes(item5.children)).replace(/\s+/g, '\x20')).trim() || '\x20'); items2.push((((('|\x20') + (items4.join((" | "))))) + ('\x20|'))), value12 && (items2.push((((('|\x20') + ((items4.map(() => "---")).join((" | "))))) + ('\x20|'))), value12 = (false));
          }
          return ((items2.length) > ((0))) ? (((('\x0a') + (items2.join('\x0a')))) + ('\x0a')): '';
        }
      }
      handleBlockquote(blockquoteElement) {
        {
          const text12 = (this.walkNodes(blockquoteElement.children)).trim(); if (!text12) return ''; const text13 = ((text12.split('\x0a')).map(item6 => item6.length === (0) ? '>': '>\x20' + item6)).join('\x0a'); return (((('\x0a') + (text13))) + ('\x0a'));
        }
      }
      handleMacro(macroElement) {
        {
          const value14 = macroElement.attribs && macroElement.attribs[("ac:name")]; switch (value14) {
            case ("toc"): case ("floatmenu"): return ''; case ("expand"): return this.handleExpand(macroElement); case ("code"): return this.handleCode(macroElement); case ("info"): case ("warning"): case ("note"): return this.handleCallout(macroElement, value14); case ("anchor"): return this.handleAnchor(macroElement); case ("panel"): return this.handlePanel(macroElement); case ("mermaid-macro"): return this.handleMermaid(macroElement); case ("plantuml"): return this.handlePlantuml(macroElement); case ("include"): return this.handleInclude(macroElement); case ("shared-block"): case ("include-shared-block"): return this.handleSharedBlock(macroElement, value14); case ("view-file"): return this.handleViewFile(macroElement); default: return '';
          }
        }
      }
      handleExpand(expandMacro) {
        const parameter1 = this.findParamByName(expandMacro, ("title")); const text14 = (parameter1 ? this.getTextContent(parameter1): '').trim(), body1 = this.getMacroBody(expandMacro); if (text14) return ("\n**EXPAND: ") + text14 + "**\n\n" + (this.walkNodes(body1)).trim() + (("\n\n**EXPAND_END**\n")); return ("\n<details>\n<summary>") + ((this.labels).expandDetails || ("Expand Details")) + (("</summary>\n\n")) + (this.walkNodes(body1)).trim() + (("\n\n</details>\n"));
      }
      handleCode(codeMacro) {
        const parameter2 = this.findParamByName(codeMacro, ("language")), value15 = parameter2 ? this.getTextContent(parameter2): ''; const child1 = this.findChildByName(codeMacro, ("ac:plain-text-body")), value16 = child1 ? this.getRawText(child1): '', result16 = ('`').repeat((fenceLength((value16)))); return '\x0a' + result16 + value15 + '\x0a' + value16 + '\x0a' + result16 + '\x0a';
      }
      handleCallout(calloutMacro, calloutType) {
        const body2 = this.getMacroBody(calloutMacro), text15 = (this.walkNodes(body2)).trim(); const text16 = ((text15.split('\x0a')).map(item7 => item7.length === (0) ? '>': '>\x20' + item7)).join('\x0a'), text17 = "> **" + calloutType.toUpperCase() + '**', value19 = ((text15.length) === ((0))) ? text17: text17 + '\x0a' + text16; return '\x0a' + value19 + '\x0a';
      }
      handleAnchor(anchorMacro) {
        {
          const parameter3 = this.findParamByName(anchorMacro, ''), text18 = (parameter3 ? this.getTextContent(parameter3): '').trim(); if (!text18) return ''; return ("\n**ANCHOR: ") + text18 + "**\n";
        }
      }
      handlePanel(panelMacro) {
        {
          const parameter4 = this.findParamByName(panelMacro, ("title")), text19 = (parameter4 ? this.getTextContent(parameter4): '').trim(), body3 = this.getMacroBody(panelMacro), text20 = (this.walkNodes(body3)).trim(); if (((!text19) && (!text20))) return ''; const text21 = ((text20.split('\x0a')).map(item8 => item8 ? '>\x20' + item8: '>')).join('\x0a'); if (!text19) return '\x0a' + text21 + '\x0a'; if (!text20) return "\n> **" + text19 + "**\n"; return "\n> **" + text19 + "**\n>\n" + text21 + '\x0a';
        }
      }
      handleMermaid(mermaidMacro) {
        {
          const child2 = this.findChildByName(mermaidMacro, ("ac:plain-text-body")), value21 = child2 ? (this.getRawText(child2)).trim(): '', result28 = ('`').repeat((fenceLength((value21)))); return '\x0a' + result28 + "mermaid\n" + value21 + '\x0a' + result28 + '\x0a';
        }
      }
      handlePlantuml(plantUmlMacro) { {
          const child3 = this.findChildByName(plantUmlMacro, ("ac:plain-text-body")), value22 = child3 ? (this.getRawText(child3)).trim(): '', result30 = ('`').repeat((fenceLength((value22)))); return '\x0a' + result30 + (("plantuml\n")) + value22 + '\x0a' + result30 + '\x0a';
        }
      }
      handleInclude(includeMacro) {
        {
          const parameter5 = this.findParamByName(includeMacro, ''); if (!parameter5) return ''; const child4 = this.findChildByName(parameter5, ("ac:link")); if (!child4) return ''; const child5 = this.findChildByName(child4, ("ri:page")); if (!child5) return ''; const text2 = (decodeStorageEntities((child5.attribs[("ri:space-key")] || ''))), text22 = (decodeStorageEntities((child5.attribs[("ri:content-title")] || ''))), result34 = this.escapeMarkdownText(text22), value23 = (this.labels).includePage || ("Include Page"); if (text2.startsWith('~')) {
            {
              const text23 = "display/" + text2 + '/' + (encodeURIComponent((text22))); return "\n> 📄 **" + value23 + "**: [" + result34 + '](' + this.buildUrl(this.webUrlPrefix + '/' + text23) + ')\x0a';
            }
          }
          return "\n> 📄 **" + value23 + "**: [" + result34 + '](' + this.buildUrl(this.webUrlPrefix + "/spaces/" + text2 + (("/pages/[PAGE_ID_HERE]"))) + ((") _(manual link correction required)_\n"));
        }
      }
      handleSharedBlock(sharedBlockMacro, includeMode) {
        {
          const parameter6 = this.findParamByName(sharedBlockMacro, ("shared-block-key")), text24 = (parameter6 ? this.getTextContent(parameter6): '').trim(), parameter7 = this.findParamByName(sharedBlockMacro, ("page")); if (parameter7 && ((includeMode) === (("include-shared-block")))) {
            {
              const child6 = this.findChildByName(parameter7, ("ac:link")); if (child6) {
                {
                  const child7 = this.findChildByName(child6, ("ri:page")); if (child7) {
                    {
                      const result39 = this.escapeMarkdownText((decodeStorageEntities((child7.attribs[("ri:content-title")] || '')))), value25 = (this.labels).includeSharedBlock || ("Include Shared Block"), value26 = (this.labels).fromPage || ("from page"), value27 = text24 ? ':\x20' + text24 + '\x20': '\x20'; return "\n> 📄 **" + value25 + '**' + value27 + '(' + value26 + ':\x20' + result39 + ((" [link needs manual correction])\n"));
                    }
                  }
                }
              }
            }
          }
          const body4 = this.getMacroBody(sharedBlockMacro), text25 = (this.walkNodes(body4)).trim(), value28 = (this.labels).sharedBlock || ("Shared Block"); if (((!text24) && (!text25))) return ''; const value29 = text24 ? '**' + value28 + ':\x20' + text24 + '**': '**' + value28 + '**'; if (!text25) return "\n> " + value29 + '\x0a'; const text26 = ((text25.split('\x0a')).map(item9 => item9 ? '>\x20' + item9: '>')).join('\x0a'); return "\n> " + value29 + "\n>\n" + text26 + '\x0a';
        }
      }
      handleViewFile(viewFileMacro) {
        const parameter8 = this.findParamByName(viewFileMacro, ("name")); if (!parameter8) return ''; const child8 = this.findChildByName(parameter8, ("ri:attachment")); if (!child8) return ''; const text27 = (decodeStorageEntities((child8.attribs[("ri:filename")] || ''))); return "\n📎 [" + text27 + '](' + this.attachmentsDir + '/' + text27 + ')\x0a';
      }
      handleImage(imageElement) {
        {
          const child9 = this.findChildByName(imageElement, ("ri:attachment")); if (child9) {
            const text28 = this.renderText(child9.attribs[("ri:filename")] || ''); return '![' + text28 + '](' + this.attachmentsDir + '/' + text28 + ')';
          }
          const child10 = this.findChildByName(imageElement, ("ri:url")); if (child10) {
            {
              const text29 = this.renderText(child10.attribs[("ri:value")] || ''); if (!text29) return ''; return "![](" + text29 + ')';
            }
          }
          return '';
        }
      }
      handleAcLink(linkElement) {
        {
          const value31 = linkElement.attribs || {
          }; if (value31[("ac:anchor")]) {
            {
              const child11 = this.findChildByName(linkElement, ("ac:plain-text-link-body")), value32 = child11 ? this.getRawText(child11): ''; if (!value32) return ''; return '[' + value32 + "](#" + (decodeStorageEntities((value31[("ac:anchor")]))) + ')';
            }
          }
          const child12 = this.findChildByName(linkElement, ("ri:url")); if (child12) {
            const text30 = (decodeStorageEntities((child12.attribs[("ri:value")] || ''))), child13 = this.findChildByName(linkElement, ("ac:plain-text-link-body")), value33 = child13 ? this.getRawText(child13): ''; if (!value33) return ''; return '[' + value33 + '](' + text30 + ')';
          }
          const child14 = this.findChildByName(linkElement, ("ac:link-body")); if (child14) {
            return (this.walkNodes(child14.children)).trim();
          }
          const child15 = this.findChildByName(linkElement, ("ri:page")); if (child15) {
            {
              const result50 = this.escapeMarkdownText((decodeStorageEntities((child15.attribs[("ri:content-title")] || '')))); return '[' + result50 + ']';
            }
          }
          return '';
        }
      }
      handleTaskList(taskListElement) {
        {
          const items14 = (taskListElement.children || []).filter(item10 => item10.type === "tag" && item10.name === "ac:task"), items5 = []; for (const value34 of items14) {
            const child16 = this.findChildByName(value34, ("ac:task-status")), child17 = this.findChildByName(value34, ("ac:task-body")), value35 = child16 ? this.getTextContent(child16): '', value36 = child17 ? ((this.walkNodes(child17.children)).replace(/\s+/g, '\x20')).trim(): '', value37 = ((value35) === (("complete"))) ? ("[x]"): ("[ ]"); if (value36)items5.push('-\x20' + value37 + '\x20' + value36);
          }
          return ((items5.length) > ((0))) ? (((('\x0a') + (items5.join('\x0a')))) + ('\x0a')): '';
        }
      }
      findParamByName(element, parameterName) {
        {
          if (!element || !element.children) return null; for (const node17 of element.children) {
            {
              if (((node17.type) === (("tag"))) && ((node17.name) === (("ac:parameter"))) && ((node17.attribs[("ac:name")]) === (parameterName))) {
                return node17;
              }
            }
          }
          return null;
        }
      }
      findChildByName(element, childName) {
        if (!element || !element.children) return null; for (const node18 of element.children) {
          if (((node18.type) === (("tag"))) && ((node18.name) === (childName))) return node18;
        }
        return null;
      }
      findAllDescendants(element, descendantName) {
        {
          const items6 = [], callback1 = node19 => {
            {
              if (!node19) return ; if ((((node19.type)) === (("tag"))) && (((node19.name)) === ((descendantName))))items6.push(node19); if (node19.children)(node19.children).forEach(callback1);
            }
          }; if (element.children)(element.children).forEach(callback1); return items6;
        }
      }
      getMacroBody(macroElement2) {
        {
          const child18 = this.findChildByName(macroElement2, ("ac:rich-text-body")); return child18 ? child18.children: [];
        }
      }
      getTextContent(node) {
        return (decodeStorageEntities((this._collectText(node))));
      }
      escapeMarkdownText(text) {
        {
          if (!text) return ''; return text.replace(/([\\`*_[\]()~|<>])/g, ("\\$1"));
        }
      }
      renderText(text) {
        {
          const text31 = (decodeStorageEntities((text))); return ((this._markdownLinkLabelDepth) > ((0))) && ((this._markdownCodeSpanDepth) === ((0))) ? this.escapeMarkdownText(text31): text31;
        }
      }
      renderCodeSpan(code) {
        const value38 = code.match(/`+/g) || []; const result54 = value38.reduce((value39, value40) => Math.max(value39, value40.length), (0)); const result55 = ('`').repeat(((result54) + ((1)))), value41 = code.startsWith('`') || code.endsWith('`') ? '\x20': ''; return '' + result55 + value41 + code + value41 + result55;
      }
      _collectText(node) {
        {
          if (!node) return ''; if (((node.type) === (("text")))) return node.data || ''; if (node.children) return ((node.children).map(item11 => this._collectText(item11))).join(''); return '';
        }
      }
      getRawText(node) {
        return (decodeStorageEntities((this._collectRawText(node))));
      }
      _collectRawText(node) {
        {
          if (!node || !node.children) return ''; let text32 = ''; for (const node212 of node.children) {
            {
              if (((node212.type) === (("text")))) text32 += node212.data || ''; else {
                if (((node212.type) === (("cdata")))) text32 += this._collectRawText(node212);
              }
            }
          }
          return text32;
        }
      }
      cleanup(markdown) {
        return cleanupWithFences(markdown);
      }
    }

    storageWalkerModule.exports = {
      StorageWalker,
      StorageDepthExceededError,
      DEFAULT_MAX_DEPTH,
    };
  }
});

const require_link_style = __commonJS({
  '../work/pchuri__confluence-cli/lib/link-style.js'(unusedModule, linkStyleModule) {
  const VALID_LINK_STYLES = ['smart', 'plain', 'wiki'];

  function resolveLinkStyle({ isCloud = false, linkStyle = null } = {}) {
    if (VALID_LINK_STYLES.includes(linkStyle)) return linkStyle;
    return isCloud ? 'smart' : 'plain';
  }

  linkStyleModule.exports = { VALID_LINK_STYLES, resolveLinkStyle };
}
});

const require_html_to_storage = __commonJS({
  '../work/pchuri__confluence-cli/lib/html-to-storage.js'(unusedHtmlModule, htmlToStorageModule) {
    const { parseDocument } = require('htmlparser2');
    const { resolveLinkStyle } = require_link_style();
    const DEFAULT_HTML_MAX_DEPTH = 256;

    class HtmlDepthExceededError extends Error {
      constructor(maxDepth) {
        super(`HTML nesting exceeds limit of ${maxDepth} levels`);
        this.name = 'HtmlDepthExceededError';
        this.maxDepth = maxDepth;
      }
    }

    const VOID_ELEMENTS = new Set(['hr']);
    const HTML_CALLOUT_TYPES = ['info', 'warning', 'note'];
    const PASSTHROUGH_BLOCK_ELEMENTS = new Set(['svg', 'div']);
    const INLINE_ELEMENTS = new Set([
      'a', 'strong', 'em', 'code', 'br', 'img', 'span', 'mark', 'sub', 'sup', 'ins', 'del',
      'b', 'i', 'u', 'small', 's', 'abbr', 'kbd', 'q', 'var', 'cite', 'time', 'dfn', 'samp',
    ]);

    function isInlineContainer(element) {
      if (!element.children) return (true); for (const node222 of element.children) {
        if (((node222.type) === (("text"))) && (node222.data).includes('\x0a')) return (false); if (((node222.type) === (("tag"))) && !INLINE_ELEMENTS.has(node222.name)) return (false);
      }
      return (true);
    }
    function isWhitespaceNode(node) {
      return ((node.type) === (("text"))) && (/^\s*$/).test(node.data);
    }
    function meaningfulChildren(node) {
      return (node.children || []).filter(item12 => !isWhitespaceNode(item12));
    }
    function parseMacroMarker(text, {
      allowPlain: allowPlain = (false)
    }
    = {
    }) {
      {
        const text33 = ((text) || ('')).trim(); if (((text33) === (("[[_TOC_]]"))) || ((text33) === (("_TOC_"))) || allowPlain && ((text33) === (("TOC")))) {
          const options7 = {
          }; return options7.kind = ("toc"), options7;
        }
        if (((text33) === (("[[_LISTING_]]"))) || ((text33) === (("_LISTING_"))) || allowPlain && ((text33) === (("LISTING")))) {
          {
            const options8 = {
            }; return options8.kind = ("children"), options8;
          }
        }
        return null;
      }
    }
    function parseParagraphMarker(paragraph) {
      {
        if (((paragraph.name) !== ('p'))) return null; const children1 = (meaningfulChildren((paragraph))); if (((children1.length) !== ((1)))) return null; if ((((children1[0]).type) === (("text")))) {
          return (parseMacroMarker(((children1[0]).data)));
        }
        const node232 = children1[0]; if (((node232.type) !== (("tag"))) || ((node232.name) !== (("strong")))) return null; const children2 = (meaningfulChildren((node232))); if (((children2.length) !== ((1)))) return null; const node242 = children2[0]; if (((node242.type) !== (("text")))) return null; const options9 = {
        }; options9.allowPlain = (true); const marker1 = (parseMacroMarker((node242.data), (options9))); if (marker1) return marker1; const match1 = (node242.data).match(/^ANCHOR: (.+)$/); if (match1) return {
          'kind': ("anchor"), 'id': match1[1]
        }; return null;
      }
    }
    function isExpandStart(node) {
      {
        if (((node.type) !== (("tag"))) || ((node.name) !== ('p'))) return (false); const children3 = (meaningfulChildren((node))); if (((children3.length) !== ((1)))) return (false); const node252 = children3[0]; if (((node252.type) !== (("tag"))) || ((node252.name) !== (("strong")))) return (false); if (!node252.children || (((node252.children).length) === ((0)))) return (false); const node262 = node252.children[0]; return ((node262.type) === (("text"))) && (node262.data).startsWith(("EXPAND: "));
      }
    }
    function isExpandEnd(node) {
      if (((node.type) !== (("tag"))) || ((node.name) !== ('p'))) return (false); const children4 = (meaningfulChildren((node))); if (((children4.length) !== ((1)))) return (false); const node272 = children4[0]; if (((node272.type) !== (("tag"))) || ((node272.name) !== (("strong")))) return (false); const children5 = (meaningfulChildren((node272))); if (((children5.length) !== ((1)))) return (false); const node282 = children5[0]; return ((node282.type) === (("text"))) && ((node282.data) === (("EXPAND_END")));
    }
    function decodeXmlEntities(text, {
      preserveDouble: preserveDouble = (false)
    }
    = {
    }) {
      {
        if (preserveDouble) {
          return (((text.replace(/&quot;/g, '\x22')).replace(/&lt;/g, '<')).replace(/&gt;/g, '>')).replace(/&amp;/g, '&');
        }
        return ((((text.replace(/&amp;/g, '&')).replace(/&lt;/g, '<')).replace(/&gt;/g, '>')).replace(/&quot;/g, '\x22')).replace(/&#39;/g, '\x27');
      }
    }
    function renderLink(element, context) {
      {
        const attributes1 = element.attribs || {
        }, text42 = attributes1.href || '', html1 = (renderChildren((element), (context))); if (text42.startsWith('#')) {
          const slice1 = text42.slice((1)), text34 = (decodeXmlEntities((html1))); return ("<ac:link ac:anchor=\"") + slice1 + (("\"><ac:plain-text-link-body><![CDATA[")) + text34 + (("]]></ac:plain-text-link-body></ac:link>"));
        }
        switch (context.linkStyle) {
          case ("smart"): {
            {
              const options10 = {
                ...attributes1
              }; options10[("data-card-appearance")] = ("inline"); const value44 = options10; return '<a' + (renderAttributes((value44))) + '>' + html1 + "</a>";
            }
          }
          case ("wiki"): return ("<ac:link><ri:url ri:value=\"") + text42 + (("\" /><ac:plain-text-link-body><![CDATA[")) + html1 + (("]]></ac:plain-text-link-body></ac:link>")); case ("plain"): default: return '<a' + (renderAttributes((attributes1))) + '>' + html1 + "</a>";
        }
      }
    }
    function parseCallout(element) {
      const children6 = (meaningfulChildren((element))); if (((children6.length) === ((0)))) return null; const node29 = children6[0]; if (((node29.type) !== (("tag"))) || ((node29.name) !== ('p'))) return null; const items7 = node29.children || [], index1 = items7.findIndex(item13 => !isWhitespaceNode(item13)); if (((index1) < ((0)))) return null; const node30 = items7[index1]; if (((node30.type) !== (("tag"))) || ((node30.name) !== (("strong")))) return null; const children7 = (meaningfulChildren((node30))); if (((children7.length) !== ((1))) || (((children7[0]).type) !== (("text")))) return null; const item14 = HTML_CALLOUT_TYPES.find(item15 => (children7[0]).data === item15.toUpperCase()); if (!item14) return null; const slice2 = items7.slice(((index1) + ((1)))), result72 = slice2.some(item16 => !isWhitespaceNode(item16)); if (result72) {
        if ((((slice2[0]).type) !== (("text"))) || !(/^\s*\n/).test((slice2[0]).data)) return null;
      }
      const options11 = {
      }; return options11.marker = item14, options11.sameLine = result72, options11.markerP = node29, options11.tail = slice2, options11;
    }
    function renderBlockquote(element, context) { {
        const callout1 = (parseCallout((element))); if (!callout1) return ("<blockquote>") + (renderChildren((element), (context))) + (("</blockquote>")); const {
          marker: value48, sameLine: value49, markerP: value50, tail: items8
        }
        = callout1, items9 = element.children || []; let value51; if (value49) {
          {
            const text35 = ((items8.map(item17 => renderNode(item17, context))).join('')).replace(/^\s*\n/, ''), text36 = ((items9.filter(item18 => item18 !== value50)).map(item19 => renderNode(item19, context))).join(''); value51 = "<p>" + text35 + "</p>" + text36;
          }
        }else value51 = (((items9.filter(item20 => item20 !== value50)).map(item21 => renderNode(item21, context))).join('')).replace(/^\s+/, ''); return ("<ac:structured-macro ac:name=\"") + value48 + (("\">\n          <ac:rich-text-body>")) + value51 + (("</ac:rich-text-body>\n        </ac:structured-macro>"));
      }
    }
    function renderDetails(element, context) {
      {
        const value57 = element.children || []; let value58 = null, items10 = []; for (const node31 of value57) {
          if (((node31.type) === (("tag"))) && ((node31.name) === (("summary")))) {
            value58 = node31;
          }else {
            if (!(isWhitespaceNode((node31)))) {
              items10.push(node31);
            }
          }
        }
        if (!value58) return "<details" + (renderAttributes((element.attribs))) + '>' + (renderChildren((element), (context))) + (("</details>")); const html2 = (renderChildren((value58), (context))), text37 = (html2.replace(/<[^>]+>/g, '')).trim(), text38 = ((items10.map(item22 => renderNode(item22, context))).join('')).trim(); return ("<ac:structured-macro ac:name=\"expand\"><ac:parameter ac:name=\"title\">") + text37 + (("</ac:parameter><ac:rich-text-body>")) + text38 + (("</ac:rich-text-body></ac:structured-macro>"));
      }
    }
    function renderPreformatted(element, context) {
      const value60 = element.children || []; const value61 = ((value60.length) === ((1))) && (((value60[0]).type) === (("tag"))) && (((value60[0]).name) === (("code"))); if (!value61) {
        return "<pre>" + (renderChildren((element), (context))) + "</pre>";
      }
      const node32 = value60[0], text62 = (node32.attribs).class || '', match2 = text62.match(/language-(\w+)/), value62 = match2 ? match2[1]: ("text"); let text7 = ''; for (const node33 of node32.children || []) {
        {
          if (((node33.type) === (("text")))) text7 += node33.data;
        }
      }
      const options13 = {
      }; options13.preserveDouble = (true), text7 = (decodeXmlEntities((text7.replace(/\n$/, '')), (options13))).replace(/]]>/g, ("]]]]><![CDATA[>")); switch (value62) {
        case ("plantuml"): return ("<ac:structured-macro ac:name=\"plantuml\"><ac:plain-text-body><![CDATA[") + text7 + (("]]></ac:plain-text-body></ac:structured-macro>")); default: return ("<ac:structured-macro ac:name=\"code\"><ac:parameter ac:name=\"language\">") + value62 + (("</ac:parameter><ac:plain-text-body><![CDATA[")) + text7 + (("]]></ac:plain-text-body></ac:structured-macro>"));
      }
    }
    function renderPassthroughBlock(element, context) {
      {
        const {
          randomUUID: result79
        }
        = (require((("crypto")))), html3 = (renderChildren((element), (context))), attributesHtml1 = (renderAttributes((element.attribs))), text39 = '<' + element.name + attributesHtml1 + '>', text40 = '</' + element.name + '>', text8 = ((((text39) + (html3))) + (text40)), text41 = text8.replace(/]]>/g, ("]]]]><![CDATA[>")), result83 = (result79()); return ("<ac:structured-macro ac:name=\"html\" ac:schema-version=\"1\" ac:macro-id=\"") + result83 + (("\"><ac:plain-text-body><![CDATA[")) + text41 + (("]]></ac:plain-text-body></ac:structured-macro>"));
      }
    }
    function escapeHtmlAttribute(value) {
      return (String((value))).replace(/"/g, ("&quot;"));
    }
    function renderAttributes(attributes) {
      if (!attributes) return '';
      return Object.keys(attributes)
        .map(name => ` ${name}="${escapeHtmlAttribute(attributes[name])}"`)
        .join('');
    }
    function renderChildren(element, context) {
      {
        if (!element.children) return ''; const children8 = element.children, items12 = []; let count2 = (0); while (((count2) < (children8.length))) {
          const node34 = children8[count2]; if ((isExpandStart((node34)))) {
            {
              const index2 = children8.findIndex((item23, index3) => index3 > count2 && isExpandEnd(item23)); if (((index2) !== (( - 1)))) {
                const value68 = node34.children[0], text9 = (renderChildren((value68), (context))).replace(/^EXPAND: /, ''), text43 = (text9.replace(/<[^>]+>/g, '')).trim(), text44 = (((children8.slice(((count2) + ((1))), index2)).map(item24 => renderNode(item24, context))).join('')).trim(); items12.push(("<ac:structured-macro ac:name=\"expand\"><ac:parameter ac:name=\"title\">") + text43 + (("</ac:parameter><ac:rich-text-body>")) + text44 + (("</ac:rich-text-body></ac:structured-macro>"))), count2 = ((index2) + ((1))); continue;
              }
            }
          }
          items12.push((renderNode((node34), (context)))), count2++;
        }
        return items12.join('');
      }
    }
    function renderNode(node, context) {
      {
        if (((node.type) === (("text")))) return node.data; if (((node.type) === (("comment")))) {
          {
            const marker2 = (parseMacroMarker((node.data))); if (marker2 && ((marker2.kind) === (("toc")))) return ("<ac:structured-macro ac:name=\"toc\" ac:schema-version=\"1\" />"); if (marker2 && ((marker2.kind) === (("children")))) return ("<ac:structured-macro ac:name=\"children\" ac:schema-version=\"2\" />"); return '';
          }
        }
        if (((node.type) !== (("tag")))) return ''; if (((++context.depth) > (context.maxDepth))) {
          context.depth--; throw new HtmlDepthExceededError(context.maxDepth);
        }
        try {
          return (renderElement((node), (context)));
        }finally {
          context.depth--;
        }
      }
    }
    function renderElement(element, context) {
      switch (element.name) {
        case 'p': {
          {
            const marker3 = (parseParagraphMarker((element))); if (marker3 && ((marker3.kind) === (("toc")))) return ("<ac:structured-macro ac:name=\"toc\" ac:schema-version=\"1\" />"); if (marker3 && ((marker3.kind) === (("children")))) return ("<ac:structured-macro ac:name=\"children\" ac:schema-version=\"2\" />"); if (marker3 && ((marker3.kind) === (("anchor")))) {
              return ("<ac:structured-macro ac:name=\"anchor\"><ac:parameter ac:name=\"\">") + marker3.id + (("</ac:parameter></ac:structured-macro>"));
            }
            return '<p' + (renderAttributes((element.attribs))) + '>' + (renderChildren((element), (context))) + "</p>";
          }
        }
        case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': case ("strong"): case 'em': return '<' + element.name + (renderAttributes((element.attribs))) + '>' + (renderChildren((element), (context))) + '</' + element.name + '>'; case 'hr': return ("<hr />"); case 'br': return ("<br />"); case ("img"): return "<img" + (renderAttributes((element.attribs))) + '>'; case 'ul': case 'ol': return '<' + element.name + (renderAttributes((element.attribs))) + '>' + (renderChildren((element), (context))) + '</' + element.name + '>'; case 'li': {
          const html4 = (renderChildren((element), (context))), text45 = "<li" + (renderAttributes((element.attribs))) + '>'; return (isInlineContainer((element))) ? text45 + "<p>" + html4 + (("</p></li>")): '' + text45 + html4 + "</li>";
        }
        case ("pre"): return (renderPreformatted((element), (context))); case ("code"): return "<code" + (renderAttributes((element.attribs))) + '>' + (renderChildren((element), (context))) + "</code>"; case 'a': return (renderLink((element), (context))); case ("blockquote"): return (renderBlockquote((element), (context))); case ("details"): return (renderDetails((element), (context))); case ("table"): case ("thead"): case ("tbody"): case ("tfoot"): case 'tr': return '<' + element.name + (renderAttributes((element.attribs))) + '>' + (renderChildren((element), (context))) + '</' + element.name + '>'; case 'th': case 'td': {
          const html5 = (renderChildren((element), (context))), text46 = '<' + element.name + (renderAttributes((element.attribs))) + '>'; return (isInlineContainer((element))) ? text46 + "<p>" + html5 + "</p></" + element.name + '>': '' + text46 + html5 + '</' + element.name + '>';
        }
        default: if (VOID_ELEMENTS.has(element.name)) return '<' + element.name + (renderAttributes((element.attribs))) + " />"; if (PASSTHROUGH_BLOCK_ELEMENTS.has(element.name)) {
          return (renderPassthroughBlock((element), (context)));
        }
        return '<' + element.name + (renderAttributes((element.attribs))) + '>' + (renderChildren((element), (context))) + '</' + element.name + '>';
      }
    }
    function htmlToStorage(html, options = {}) {
      const context = {
        linkStyle: resolveLinkStyle({ isCloud: !!options.isCloud, linkStyle: options.linkStyle }),
        depth: 0,
        maxDepth: typeof options.maxDepth === 'number' ? options.maxDepth : DEFAULT_HTML_MAX_DEPTH,
      };
      return renderChildren(parseDocument(html, { decodeEntities: false }), context);
    }

    htmlToStorageModule.exports = { htmlToStorage, HtmlDepthExceededError };
  }
});

const MarkdownIt = require('markdown-it');
const { StorageWalker } = require_storage_walker();
const { htmlToStorage } = require_html_to_storage();
const { VALID_LINK_STYLES, resolveLinkStyle } = require_link_style();

const CALLOUT_MARKERS = ['info', 'warning', 'note'];

const STASH_DELIM = '\uE000';

const PASSTHROUGH_TAG_RE = /<\/?(?:br|u|sub|sup|mark|details|summary)(?=[\s/>])(?:"[^"]*"|'[^']*'|[^>])*>/gi;

const PASSTHROUGH_BLOCK_RE = /<(svg|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi;

const INLINE_CODE_RE = /`[^`\n]+`/g;
function escapeXmlAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

class MacroConverter {
  constructor({ isCloud = false, webUrlPrefix = '', buildUrl = null, linkStyle = null } = {}) {
    this._isCloud = isCloud;
    this.webUrlPrefix = webUrlPrefix;
    this.buildUrl = buildUrl || (url => url);
    this.linkStyle = resolveLinkStyle({ isCloud, linkStyle });
    this.markdown = new MarkdownIt();
    this.setupConfluenceMarkdownExtensions();
  }

  isCloud() {
    return this._isCloud;
  }

  setupConfluenceMarkdownExtensions() {
    this.markdown.enable(['table', 'strikethrough', 'linkify']);
    this.markdown.core.ruler.before('normalize', 'confluence_macros', state => {
      const stashedCode = [];
      state.src = state.src.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`/g, codeBlock => {
        stashedCode.push(codeBlock);
        return `${STASH_DELIM}${stashedCode.length - 1}${STASH_DELIM}`;
      });

      for (const calloutType of CALLOUT_MARKERS) {
        const calloutPattern = new RegExp(
          `(^|\\n)\\[!${calloutType}\\]\\s*([\\s\\S]*?)(?=\\n\\s*\\n|\\n\\s*\\[!|$)`,
          'g',
        );
        state.src = state.src.replace(calloutPattern, (match, prefix, body) =>
          `${prefix}> **${calloutType.toUpperCase()}**\n> ${body.trim().replace(/\n/g, '\n> ')}`,
        );
      }

      const stashPattern = new RegExp(`${STASH_DELIM}(\\d+)${STASH_DELIM}`, 'g');
      state.src = state.src.replace(stashPattern, (match, index) => stashedCode[Number(index)] ?? match);
    });
  }
  markdownToStorage(markdown) {
    return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(markdown));
  }
  markdownToNativeStorage(markdown) {
    return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(markdown));
  }
  _renderMarkdownToHtml(markdown) {
    const codeRanges = this._findCodeRanges(markdown);
    const stashedHtml = [];

    const replaceStandaloneMarker = (text, markerPattern, replacement) => {
      const linePattern = `(^|\\n)([^\\S\\n]*)` + markerPattern + `[^\\S\\n]*(?=\\n|$)`;
      return text.replace(new RegExp(linePattern, 'gi'), (match, prefix, indentation) =>
        prefix + indentation + replacement,
      );
    };

    const normalizeMacroMarkers = text => {
      let normalized = replaceStandaloneMarker(
        text,
        '<!--\\s*(?:\\[\\[)?_TOC_(?:\\]\\])?\\s*-->',
        '**TOC**',
      );
      normalized = replaceStandaloneMarker(
        normalized,
        '<!--\\s*(?:\\[\\[)?_LISTING_(?:\\]\\])?\\s*-->',
        '**LISTING**',
      );
      normalized = replaceStandaloneMarker(normalized, '\\[\\[_TOC_\\]\\]', '**TOC**');
      return replaceStandaloneMarker(normalized, '\\[\\[_LISTING_\\]\\]', '**LISTING**');
    };

    const stash = html => {
      stashedHtml.push(html);
      return `${STASH_DELIM}H${stashedHtml.length - 1}${STASH_DELIM}`;
    };
    const stashPassthroughHtml = segment =>
      normalizeMacroMarkers(segment)
        .replace(PASSTHROUGH_BLOCK_RE, stash)
        .replace(PASSTHROUGH_TAG_RE, stash);

    let protectedMarkdown = '';
    let lastIndex = 0;
    for (const [rangeStart, rangeEnd] of codeRanges) {
      protectedMarkdown += stashPassthroughHtml(markdown.slice(lastIndex, rangeStart));
      protectedMarkdown += markdown.slice(rangeStart, rangeEnd);
      lastIndex = rangeEnd;
    }
    protectedMarkdown += stashPassthroughHtml(markdown.slice(lastIndex));

    const renderedHtml = this.markdown.render(protectedMarkdown);
    let scanIndex = 0;
    let insideTag = false;
    const stashPattern = new RegExp(STASH_DELIM + 'H(\\d+)' + STASH_DELIM, 'g');
    return renderedHtml.replace(stashPattern, (placeholder, stashIndex, offset) => {
      for (; scanIndex < offset; scanIndex += 1) {
        if (renderedHtml[scanIndex] === '<') insideTag = true;
        else if (renderedHtml[scanIndex] === '>') insideTag = false;
      }
      scanIndex = offset + placeholder.length;
      const htmlFragment = stashedHtml[Number(stashIndex)];
      if (htmlFragment == null) return placeholder;
      return insideTag ? escapeXmlAttr(htmlFragment) : htmlFragment;
    });
  }
  _findCodeRanges(markdown) {
    const tokens = this.markdown.parse(markdown, {});
    const lineOffsets = [0];
    for (let index = 0; index < markdown.length; index += 1) {
      if (markdown[index] === '\n') lineOffsets.push(index + 1);
    }

    const offsetForLine = line => line < lineOffsets.length ? lineOffsets[line] : markdown.length;
    const codeRanges = [];
    for (const token of tokens) {
      if ((token.type === 'code_block' || token.type === 'fence') && token.map) {
        codeRanges.push([offsetForLine(token.map[0]), offsetForLine(token.map[1])]);
      }
    }

    INLINE_CODE_RE.lastIndex = 0;
    let match;
    while ((match = INLINE_CODE_RE.exec(markdown)) !== null) {
      codeRanges.push([match.index, match.index + match[0].length]);
    }
    codeRanges.sort((left, right) => left[0] - right[0] || left[1] - right[1]);

    const mergedRanges = [];
    for (const range of codeRanges) {
      const previous = mergedRanges[mergedRanges.length - 1];
      if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]);
      else mergedRanges.push([range[0], range[1]]);
    }
    return mergedRanges;
  }
  htmlToConfluenceStorage(html) {
    return htmlToStorage(html, { isCloud: this._isCloud, linkStyle: this.linkStyle });
  }
  detectLanguageLabels(content) {
    const labels = {
      includePage: 'Include Page',
      sharedBlock: 'Shared Block',
      includeSharedBlock: 'Include Shared Block',
      fromPage: 'from page',
      expandDetails: 'Expand Details',
    };

    if (/[\u4e00-\u9fa5]/.test(content)) {
      Object.assign(labels, {
        includePage: '包含页面', sharedBlock: '共享块', includeSharedBlock: '包含共享块',
        fromPage: '来自页面', expandDetails: '展开详情',
      });
    } else if (/[\u3040-\u309f\u30a0-\u30ff]/.test(content)) {
      Object.assign(labels, {
        includePage: 'ページを含む', sharedBlock: '共有ブロック', includeSharedBlock: '共有ブロックを含む',
        fromPage: 'ページから', expandDetails: '詳細を表示',
      });
    } else if (/[\uac00-\ud7af]/.test(content)) {
      Object.assign(labels, {
        includePage: '페이지 포함', sharedBlock: '공유 블록', includeSharedBlock: '공유 블록 포함',
        fromPage: '페이지에서', expandDetails: '상세 보기',
      });
    } else if (/[\u0400-\u04ff]/.test(content)) {
      Object.assign(labels, {
        includePage: 'Включить страницу', sharedBlock: 'Общий блок', includeSharedBlock: 'Включить общий блок',
        fromPage: 'со страницы', expandDetails: 'Подробнее',
      });
    } else if ((content.match(/[àâäéèêëïîôùûüÿœæç]/gi) || []).length >= 2) {
      Object.assign(labels, {
        includePage: 'Inclure la page', sharedBlock: 'Bloc partagé', includeSharedBlock: 'Inclure le bloc partagé',
        fromPage: 'de la page', expandDetails: 'Détails',
      });
    } else if ((content.match(/[äöüß]/gi) || []).length >= 2) {
      Object.assign(labels, {
        includePage: 'Seite einbinden', sharedBlock: 'Gemeinsamer Block',
        includeSharedBlock: 'Gemeinsamen Block einbinden', fromPage: 'von Seite', expandDetails: 'Details',
      });
    } else if ((content.match(/[áéíóúñ¿¡]/gi) || []).length >= 2) {
      Object.assign(labels, {
        includePage: 'Incluir página', sharedBlock: 'Bloque compartido',
        includeSharedBlock: 'Incluir bloque compartido', fromPage: 'de la página', expandDetails: 'Detalles',
      });
    }
    return labels;
  }
  storageToMarkdown(storageXml, options = {}) {
    const walker = new StorageWalker({
      attachmentsDir: options.attachmentsDir || 'attachments',
      labels: this.detectLanguageLabels(storageXml),
      buildUrl: this.buildUrl,
      webUrlPrefix: this.webUrlPrefix,
    });
    const markdown = walker.walk(storageXml);
    if (typeof options.onWarnings === 'function' && walker.warnings.length > 0) {
      options.onWarnings(walker.warnings);
    }
    return markdown;
  }
};
module.exports = MacroConverter;
module.exports.VALID_LINK_STYLES = VALID_LINK_STYLES;
