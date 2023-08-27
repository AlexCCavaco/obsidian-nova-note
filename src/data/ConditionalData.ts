import { isObjValType, isOfValType, type OPERATION_TYPE, type OprType, type ValType } from "src/parser";
import type { BlockDataVal } from "../blocks/NovaBlock";
import { getIdOrGenerate } from "./IdHandler";
import { isAsync } from "../handlers/tools";
import FileData from "src/data/FileData";
import FileDataElm from "src/data/FileDataElm";
import type NovaNotePlugin from "src/main";

let nova:NovaNotePlugin;

export function init(novaPlugin:NovaNotePlugin) {
    nova = novaPlugin;
}

export async function processConditions(data:FileDataElm,curData:FileData,conditions:OprType,thisData?:BlockDataVal):Promise<boolean>{
    return !!await processOPR(data,curData,conditions,thisData);
}

export async function processOPR(data:FileDataElm,curData:FileData,conditions:OprType,thisData?:BlockDataVal){
    return formType(await processCondition(conditions));

    async function processCondition(condition:OprType):Promise<ValType>{
        if(isOfValType(condition)){
            if(!isObjValType(condition)||(condition.type!=='key'&&condition.type!=='fn'&&condition.type!=='tag')) return condition;
            const meta = data.getMetadata();
            if(condition.type==='tag') return (meta && meta.tags && meta.tags.some(t=>t.tag===condition.value))??false;
            const props = (condition.type==='fn' ? condition.value[0] : condition.value).split('.');
            let value:any = await processDataLocation(props,data,curData,thisData);
            for(const prop of props){
                if(value==null||value[prop]==null){ value = null; break; }
                let nVal = value[prop];
                if(nVal.lazy) nVal = await nVal.get();
                value = nVal;
            }
            if(condition.type==='fn'){
                const params = condition.value[1].map(async v=>await processCondition(v));
                if(typeof value !== 'function') throw new Error(`Value "${value}" for param "${condition.value}" is not a Function`);
                if(isAsync(value)) value = await value(...params);
                else value = value(...params);
            }
            return valSet(value);
        }
        return processValue(condition);
    }
    async function handleIf(lhs:OprType,[the,els]:[OprType,OprType]):Promise<ValType>{
        const check = !!(await processCondition(lhs));
        const yaRes = await processCondition(the);
        const noRes = await processCondition(els);
        return check ? yaRes : noRes;
    }
    async function processValue({ lhs,op,rhs}:OPERATION_TYPE):Promise<ValType>{
        const nLft = lhs===undefined ? null : lhs = await processCondition(lhs);
        if(op==='if') return handleIf(lhs as Extract<OPERATION_TYPE,{op:'if'}>['lhs'],rhs);
        const nRhs = await processCondition(rhs);
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

function formType(res:ValType){
    return isObjValType(res) ? res.value : res;
}

function nullableOrCalc(lhs:ValType,rhs:ValType,calc:(lhs:any,rhs:any)=>boolean):boolean{
    const nLhs = isObjValType(lhs) ? lhs.value : lhs;
    const nRhs = isObjValType(rhs) ? rhs.value : rhs;
    return calc(nLhs,nRhs)
}
function numberCalc(lhs:ValType,rhs:ValType,calc:(lhs:any,rhs:any)=>number|string):Extract<ValType,{type:'number'|'string'}>{
    const nLhs = isObjValType(lhs) ? lhs.value : lhs;
    const nRhs = isObjValType(rhs) ? rhs.value : rhs;
    const res = calc(nLhs,nRhs);
    if(typeof res === 'string') return { type:'string',value:res };
    return { type:'number',value:(isNaN(res) ? 0 : res) };
}
function valSet(value:unknown):ValType{
    if(value==null) return null;
    if(Array.isArray(value)) return { type:'array',value };
    if(value==null) return value;
    switch(typeof value){
        case "string":      return { type:'string',value };
        case "number":      return { type:'number',value };
        case "boolean":     return value;
        case "object":      return { type:'string',value:value.toString() };
    }
    return { type:'string',value:value.toString() };
}

async function processDataLocation(props:string[],blockData:FileDataElm,curData:FileData,thisData?:{[key:string]:unknown}){
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
        case '$this':
            splice();
            return await getIdOrGenerate(nova,curData);
    }
    if(props[0][0]!=='$') return blockData.data;
    return {
        '$count': async (arr:ValType,on?:OprType)=>{let nArr = []; if(on) nArr = formArray(arr).filter(async (val:any)=>await processOPR(blockData,curData,on,val)); return nArr.length; },
        '$filter':async (arr:ValType,on:OprType)=>formArray(arr).filter(async (val:any)=>await processOPR(blockData,curData,on,val)),
        '$some':  async (arr:ValType,on:OprType)=>formArray(arr).some(async (val:any)=>await processConditions(blockData,curData,on,val)),
        '$every': async (arr:ValType,on:OprType)=>formArray(arr).every(async (val:any)=>await processConditions(blockData,curData,on,val)),
        '$if':    async (val:OprType,res:OprType,els?:OprType)=>((await processOPR(blockData,curData,val))?(await processOPR(blockData,curData,res)):(els?await processOPR(blockData,curData,els):null)),
        '$path':  async (val:OprType)=>(blockData.file.parent.path + '/' + await processOPR(blockData,curData,val)),
    }

    function splice(){ props.splice(0,1); }
}

export function formData(fileData:FileData,data:{[key:string]:unknown}):FileDataElm{
    return FileDataElm.fromFileData(fileData,data);
}


export function assertFrontmatter(fileData:FileData){
    return (fileData.meta ? fileData.meta.frontmatter??{} : {});
}

export function formArray(arr:ValType){
    if(Array.isArray(arr)) return arr;
    if(isObjValType(arr)) return Array.isArray(arr.value) ? arr.value : [];
    return [];
}
