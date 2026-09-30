import _0x5a5339 from'node:path';
import _0x5bfda8 from'fs-extra';
import _0x20457c from'lodash/snakeCase.js';
import _0x2fac4a from'lodash/kebabCase.js';
import _0x5f221c from'lodash/startCase.js';
import _0x1f8a61 from'lodash/trim.js';
import _0x242ff4 from'js-yaml';

var META_REGEX=/^\uFEFF?\/\*([\s\S]*?)\*\//i,META_REGEX_YAML=/^\uFEFF?---([\s\S]*?)---/i;

function cleanString(str, snake=false){
  str=str.replaceAll('/',' ').trim();
  if(snake){
    return _0x20457c(str);
  }
  return _0x1f8a61(_0x2fac4a(str),'-');
}

function cleanObjectStrings(obj){
  const result={};
  for(const key in obj){
    if(Object.prototype.hasOwnProperty.call(obj,key)){
      result[cleanString(key,true)]=(''+obj[key]).trim();
    }
  }
  return result;
}

function slugToTitle(slug){
  return slug=slug.replaceAll('','').trim(),_0x5f221c(_0x5a5339.basename(slug).replaceAll(/[-_]/g,' '));
}

function stripMeta(content){
  if(META_REGEX.test(content)){
    return content.replaceAll(META_REGEX,'').trim();
  }
  if(META_REGEX_YAML.test(content)){
    return content.replaceAll(META_REGEX_YAML,'').trim();
  }
  return content.trim();
}

function processMeta(content){
  if(META_REGEX.test(content)){
    const meta={},match=content.match(META_REGEX),metaText=match?.[1]?.trim()??'';
    if(metaText){
      const lines=metaText.split('\n');
      for(const line of lines){
        const sepIndex=line.indexOf(': ');
        if(sepIndex===-1)continue;
        const key=line.slice(0,sepIndex).trim(),value=line.slice(sepIndex+2).trim();
        if(key&&value){
          meta[cleanString(key,true)]=value;
        }
      }
    }
    return meta;
  }
  if(META_REGEX_YAML.test(content)){
    const match=content.match(META_REGEX_YAML),yamlText=match?.[1]?.trim()??'',parsed=_0x242ff4.load(yamlText);
    return cleanObjectStrings(parsed);
  }
  return{};
}

function processVars(content,vars){
  if(vars.vars&&Array.isArray(vars.vars)){
    vars.vars.forEach(v=>{
      content=content.replaceAll(new RegExp('%'+v.key+'%','g'),v.value);
    });
  }
  if(vars.title!==undefined){
    content=content.replaceAll('%title%',vars.title);
  }
  if(vars.url!==undefined){
    content=content.replaceAll('%url%',vars.url);
  }
  return content;
}

async function extractDocument(basePath,filePath,logErrors){
  try{
    const content=await _0x5bfda8.readFile(filePath,'utf8'),meta=processMeta(content),slug=filePath.replaceAll(basePath,'').trim(),title=meta.title?meta.title:slugToTitle(slug),body=content,result={};
    return result['id']=slug,result['title']=title,result['body']=body,result;
  }catch(error){
    if(logErrors){
      console.error(error);
    }
    return null;
  }
}

const contentProcessors_default={
  cleanString,
  cleanObjectStrings,
  extractDocument,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars
};

export{contentProcessors_default as default};
