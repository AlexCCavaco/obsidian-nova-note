import type { CachedMetadata, TFile } from "obsidian";
import type NovaNotePlugin from "src/main";
import { isObjValType, isOfValType, type OPERATION_TYPE, type OPR_TYPE, type VAL_TYPE } from "src/parser";
import type { BLOCK_DATA } from "./NovaBlock";

export type FileData = TFile & { meta:CachedMetadata|null }

function forEachFile(nova:NovaNotePlugin,cb:(data:FileData,cur:FileData)=>boolean):BLOCK_DATA{
    const files = nova.app.vault.getMarkdownFiles();
    const meta  = nova.app.metadataCache;
    const curFile = nova.app.workspace.getActiveFile();
    if(!curFile) throw new Error(`No Opened File Found`);
    const curMeta = meta.getFileCache(curFile);
    const cur = { ...curFile,meta:curMeta };
    const data:BLOCK_DATA = [];
    for(const file of files){
        const fileMeta:CachedMetadata|null = meta.getFileCache(file);
        const fileData = { ...file,meta:fileMeta };
        const res = cb(fileData,cur);
        if(res) data.push(fileData);
    }
    return data;
}

export function loadFromTag(nova:NovaNotePlugin,value:string,on:OPR_TYPE):BLOCK_DATA{
    //TODO
    return [];
}

export function loadFromResource(nova:NovaNotePlugin,value:string,on:OPR_TYPE):BLOCK_DATA{
    //TODO
    return [];
}

export function loadFromAll(nova:NovaNotePlugin,on:OPR_TYPE):BLOCK_DATA{console.log(nova.app.metadataCache);
    return forEachFile(nova,(data,curData)=>{
        return processConditions(data,curData,on);
    });
}

export function loadFromLocal(nova:NovaNotePlugin,value:string,on:OPR_TYPE):BLOCK_DATA{
    //TODO
    return [];
}

export function loadFromPath(nova:NovaNotePlugin,value:string,on:OPR_TYPE):BLOCK_DATA{
    //TODO
    return [];
}

export function processConditions(data:FileData,curData:FileData,conditions:OPR_TYPE):boolean{
    return !!processCondition(conditions);

    function processCondition(condition:OPR_TYPE):VAL_TYPE{
        if(isOfValType(condition)){
            if(!isObjValType(condition)||(condition.type!=='key'&&condition.type!=='fn'&&condition.type!=='tag')) return condition;
            if(condition.type==='tag') return (data.meta && data.meta.tags && data.meta.tags.some(t=>t.tag===condition.value))??false;
            switch(condition.value){
                case '$cur.basename':   return { type:'string',value:curData.basename };
                case '$cur.name':       return { type:'string',value:curData.name };
                case '$cur.path':       return { type:'string',value:curData.path };
                case '$file.basename':  return { type:'string',value:data.basename };
                case '$file.name':      return { type:'string',value:data.name };
                case '$file.path':      return { type:'string',value:data.path };
            }
            const props = (condition.type==='fn' ? condition.value[0] : condition.value).split('.');
            let value:any = null;
            if(props[0]==='$cur'){
                props.splice(0,1);
                value = curData;
            }
            for(const prop of props){
                if(!value||!value[prop]){ value = null; break; }
                value = value[prop];
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
