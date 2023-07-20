import type { CachedMetadata, MetadataCache, TFile } from "obsidian";
import type NovaNotePlugin from "src/main";
import { isObjValType, isOfValType, type OPERATION_TYPE, type OPR_TYPE, type VAL_TYPE } from "src/parser";
import type { BlockData, BlockDataElm, BlockDataVal } from "./NovaBlock";
import { getResource } from "src/resources";

export type FileData = { file:TFile,meta:CachedMetadata|null };

export function getCurFileData(nova:NovaNotePlugin,meta?:MetadataCache):FileData{
    if(!meta) meta = nova.app.metadataCache;
    const curFile = nova.app.workspace.getActiveFile();
    if(!curFile) throw new Error(`No Opened File Found`);
    const curMeta = meta.getFileCache(curFile);
    return { file:curFile,meta:curMeta };
}

function forEachFile(nova:NovaNotePlugin,cb:(fileData:FileData,curData:FileData)=>BlockDataElm|false):BlockData{
    const files = nova.app.vault.getMarkdownFiles();
    const meta  = nova.app.metadataCache;
    const cur   = getCurFileData(nova,meta);
    const data:BlockData = [];
    for(const file of files){
        const fileMeta:CachedMetadata|null = meta.getFileCache(file);
        const fileData = { file,meta:fileMeta };
        const res = cb(fileData,cur);
        if(res!==false) data.push(res);
    }
    return data;
}

export function loadFromTag(nova:NovaNotePlugin,tag:string,on:OPR_TYPE):BlockData{
    return forEachFile(nova,(fileData,curData)=>{
        const data = formData(fileData,assertFrontmatter(fileData));
        if(!(fileData.meta && fileData.meta.tags && fileData.meta.tags.some(t=>t.tag===tag))) return false;
        return processConditions(data,curData,on) ? data : false;
    });
}

export function loadFromResource(nova:NovaNotePlugin,resourceName:string,on:OPR_TYPE,thisData?:BlockDataVal):BlockData{
    const resource = getResource(resourceName);
    if(!resource) throw new Error(`Resource ${resourceName} not found`);
    return forEachFile(nova,(fileData,curData)=>{
        if(!(fileData.meta && fileData.meta.frontmatter && fileData.meta.frontmatter['nova-use'])) return false;
        const data = formData(fileData,assertFrontmatter(fileData));
        const use:string|string[] = fileData.meta.frontmatter['nova-use'];
        const resources:string[] = Array.isArray(use) ? use : use.split(',').map(u=>u.trim());
        if(!resources.includes(resourceName)) return false;
        const resData = resource.assert(nova,data,curData);
        return processConditions(resData,curData,on,thisData??data.data) ? resData : false;
    });
}

export function loadFromAll(nova:NovaNotePlugin,on:OPR_TYPE):BlockData{
    return forEachFile(nova,(fileData,curData)=>{
        const data = formData(fileData,assertFrontmatter(fileData));
        return processConditions(data,curData,on) ? data : false;
    });
}

export function loadFromLocal(nova:NovaNotePlugin,value:string,on:OPR_TYPE):BlockData{
    //TODO
    return [];
}

export function loadFromPath(nova:NovaNotePlugin,value:string,on:OPR_TYPE):BlockData{
    //TODO
    return [];
}

export const processConditions = (data:BlockDataElm,curData:FileData,conditions:OPR_TYPE,thisData?:BlockDataVal):boolean=>!!processOPR(data,curData,conditions,thisData);
export function processOPR(data:BlockDataElm,curData:FileData,conditions:OPR_TYPE,thisData?:BlockDataVal){
    const res = processCondition(conditions);
    return isObjValType(res) ? res.value : res;

    function processCondition(condition:OPR_TYPE):VAL_TYPE{
        if(isOfValType(condition)){
            if(!isObjValType(condition)||(condition.type!=='key'&&condition.type!=='fn'&&condition.type!=='tag')) return condition;
            if(condition.type==='tag') return (data.meta && data.meta.tags && data.meta.tags.some(t=>t.tag===condition.value))??false;
            const props = (condition.type==='fn' ? condition.value[0] : condition.value).split('.');
            let value:any = processDataLocation(props,data,curData,thisData);
            for(const prop of props){
                if(value==null||value[prop]==null){ value = null; break; }
                let nVal = value[prop];
                if(nVal.lazy) nVal = nVal.get();
                value = nVal;
            }
            if(condition.type==='fn'){
                const params = condition.value[1].map(v=>processCondition(v));
                if(typeof value !== 'function') throw new Error(`Value "${value}" for param "${condition.value}" is not a Function`);
                value = value(...params);
            }
            return valSet(value);
        }
        return processValue(condition);
    }
    function processValue({ lhs,op,rhs}:OPERATION_TYPE):VAL_TYPE{
        const nLft = lhs===undefined ? null : lhs = processCondition(lhs);
        const nRhs = processCondition(rhs);
        switch(op){
            case "!":   return !nRhs;
            case "-":   return numberCalc(nLft,nRhs,(v1,v2)=>(v1 - v2));
            case "+":   return numberCalc(nLft,nRhs,(v1,v2)=>(v1 + v2));
            case "*":   return numberCalc(nLft,nRhs,(v1,v2)=>(v1 * v2));
            case "/":   return numberCalc(nLft,nRhs,(v1,v2)=>(v1 / v2));
            case "=":   return nLft === nRhs;
            case "!=":  return nLft !== nRhs;
            case ">":   return nullableOrCalc(nLft,nRhs,(v1,v2)=>(v1 > v2));
            case ">=":  return nullableOrCalc(nLft,nRhs,(v1,v2)=>(v1 >= v2));
            case "<":   return nullableOrCalc(nLft,nRhs,(v1,v2)=>(v1 < v2));
            case "<=":  return nullableOrCalc(nLft,nRhs,(v1,v2)=>(v1 <= v2));
            case "and": return (nLft && nRhs) || false;
            case "or":  return nLft || nRhs;
            case "in":  return (Array.isArray(nRhs) || typeof nRhs === 'string') ?  nRhs.includes(nLft) : false;
            case "nin": return (Array.isArray(nRhs) || typeof nRhs === 'string') ? !nRhs.includes(nLft) : false;
        }
        return null;
    }
}

function nullableOrCalc(lhs:VAL_TYPE,rhs:VAL_TYPE,calc:(lhs:any,rhs:any)=>boolean):boolean{
    const nLhs = isObjValType(lhs) ? lhs.value : lhs;
    const nRhs = isObjValType(rhs) ? rhs.value : rhs;
    return calc(nLhs,nRhs)
}
function numberCalc(lhs:VAL_TYPE,rhs:VAL_TYPE,calc:(lhs:any,rhs:any)=>number|string):Extract<VAL_TYPE,{type:'number'|'string'}>{
    const nLhs = isObjValType(lhs) ? lhs.value : lhs;
    const nRhs = isObjValType(rhs) ? rhs.value : rhs;
    const res = calc(nLhs,nRhs);
    if(typeof res === 'string') return { type:'string',value:res };
    return { type:'number',value:(isNaN(res) ? 0 : res) };
}
function valSet(value:unknown):VAL_TYPE{
    if(value==null) return null;
    if(Array.isArray(value)) return { type:'array',value };
    switch(typeof value){
        case "string":      return { type:'string',value };
        case "number":      return { type:'number',value };
        case "boolean":     return value;
        case "undefined":   return value;
        case "object":      return { type:'string',value:value.toString() };
    }
    return { type:'string',value:value.toString() };
}

function processDataLocation(props:string[],blockData:BlockDataElm,curData:FileData,thisData?:{[key:string]:unknown}){
    switch(props[0]){
        case '$file':
            splice();
            return blockData.file;
        case '$cur':
            splice();
            return curData.file;
        case '$cmeta':
            splice();
            return assertFrontmatter(curData);
        case '$meta':
            splice();
            return assertFrontmatter(blockData);
        case '$':
            splice();
            return thisData??{};
    }
    if(props[0][0]!=='$') return blockData.data;
    return {
        '$count': (arr:VAL_TYPE,on?:OPR_TYPE)=>{let nArr = []; if(on) nArr = formArray(arr).filter((val:any)=>processOPR(blockData,curData,on,val)); return nArr.length; },
        '$filter':(arr:VAL_TYPE,on:OPR_TYPE)=>formArray(arr).filter((val:any)=>processOPR(blockData,curData,on,val))
    }

    function splice(){ props.splice(0,1); }
}

function formData(fileData:FileData,data:{[key:string]:unknown}):BlockDataElm{
    const blockData = Object.assign({},fileData,{data});
    return blockData;
}
function assertFrontmatter(fileData:FileData){
    return (fileData.meta ? fileData.meta.frontmatter??{} : {});
}

function formArray(arr:VAL_TYPE){
    if(Array.isArray(arr)) return arr;
    if(isObjValType(arr)) return Array.isArray(arr.value) ? arr.value : [];
    return [];
}
