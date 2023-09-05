import { isObjValType, isOfValType, type OprTypeType, type OprType, type ValType } from "src/parser";
import FileDataElm from "../data/FileDataElm";
import type FileData from "../data/FileData";
import type { BlockDataVal } from "src/blocks/NovaBlock";
import { isAsync } from "src/tools";
import path from "path";
import Expression from "src/data/Expression";

type ConditionalValue = string|boolean|number|unknown[]|null;

export default abstract class {

    static async validate(locationData:FileDataElm,currentData:FileData,condition:OprType|Expression,thisData?:BlockDataVal){
        return !!await this.process(locationData,currentData,condition,thisData);
    }
    
    static async process(locationData:FileDataElm,currentData:FileData,condition:OprType|Expression,thisData?:BlockDataVal){
        if(condition instanceof Expression) condition = condition.value;
        return this.formType(await this.processCondition(locationData,currentData,condition,thisData));
    }

    private static async processCondition(locationData:FileDataElm,currentData:FileData,condition:OprType,thisData?:BlockDataVal):Promise<ValType>{
        if(isOfValType(condition)){
            if(!isObjValType(condition)||(condition.type!=='key'&&condition.type!=='fn'&&condition.type!=='tag')) return condition;
            const meta = locationData.getMetadata();
            if(condition.type==='tag') return (meta && meta.tags && meta.tags.some(t=>t.tag===condition.value))??false;
            const props = (condition.type==='fn' ? condition.value[0] : condition.value).split('.');
            let value = await this.processDataLocation(props,locationData,currentData,thisData);
            for(const prop of props){
                if(value==null||value[prop]==null){ value = null; break; }
                let nVal = value[prop];
                if(nVal.lazy) nVal = await nVal.get();
                value = nVal;
            }
            if(condition.type==='fn'){
                const params = condition.value[1].map(async v=>await this.processCondition(locationData,currentData,v,thisData));
                if(typeof value !== 'function') throw new Error(`Value "${value}" for param "${condition.value}" is not a Function`);
                if(isAsync(value)) value = await value(...params);
                else value = value(...params);
            }
            return this.valSet(value);
        }
        return this.processValue(locationData,currentData,condition,thisData);
    }
    
    private static async handleIf(locationData:FileDataElm,currentData:FileData,lhs:OprType,[the,els]:[OprType,OprType],thisData?:BlockDataVal):Promise<ValType>{
        const check = !!(await this.processCondition(locationData,currentData,lhs,thisData));
        const yaRes = await this.processCondition(locationData,currentData,the,thisData);
        const noRes = await this.processCondition(locationData,currentData,els,thisData);
        return check ? yaRes : noRes;
    }
    private static async processValue(locationData:FileDataElm,currentData:FileData,{ lhs,op,rhs}:OprTypeType,thisData?:BlockDataVal):Promise<ValType>{
        const nLft = lhs===undefined ? null : lhs = await this.processCondition(locationData,currentData,lhs,thisData);
        if(op==='if') return this.handleIf(locationData,currentData,lhs as Extract<OprTypeType,{op:'if'}>['lhs'],rhs,thisData);
        const nRhs = await this.processCondition(locationData,currentData,rhs,thisData);
        switch(op){
            case "!":   return !nRhs;
            case "-":   return this.numberCalc(nLft,nRhs,(v1,v2)=>(this.parseNumber(v1) - this.parseNumber(v2)));
            case "+":   return this.numberCalc(nLft,nRhs,(v1,v2)=>(this.addStringsOrNumbers(v1,v2)));
            case "*":   return this.numberCalc(nLft,nRhs,(v1,v2)=>(this.parseNumber(v1) * this.parseNumber(v2)));
            case "/":   return this.numberCalc(nLft,nRhs,(v1,v2)=>(this.parseNumber(v1) / this.parseNumber(v2)));
            case "=":   return nLft === nRhs;
            case "!=":  return nLft !== nRhs;
            case ">":   return this.nullableOrCalc(nLft,nRhs,(v1,v2)=>((v1??0) >  (v2??0)));
            case ">=":  return this.nullableOrCalc(nLft,nRhs,(v1,v2)=>((v1??0) >= (v2??0)));
            case "<":   return this.nullableOrCalc(nLft,nRhs,(v1,v2)=>((v1??0) <  (v2??0)));
            case "<=":  return this.nullableOrCalc(nLft,nRhs,(v1,v2)=>((v1??0) <= (v2??0)));
            case "and": return (nLft && nRhs) || false;
            case "or":  return nLft || nRhs;
            case "in":  return (Array.isArray(nRhs) || typeof nRhs === 'string') ?  nRhs.includes(nLft) : false;
            case "nin": return (Array.isArray(nRhs) || typeof nRhs === 'string') ? !nRhs.includes(nLft) : false;
        }
        return null;
    }
    
    private static formType(res:ValType){
        return isObjValType(res) ? res.value : res;
    }
    
    private static parseNumber(val:ConditionalValue):number{
        if(typeof val === 'number') return val;
        if(val==null) return 0;
        return parseFloat(val.toString());
    }
    private static parseStringOrNumber(val:ConditionalValue):number|string{
        if(typeof val === 'number') return val;
        if(val==null) return 0;
        return val.toString();
    }
    private static addStringsOrNumbers(val1:ConditionalValue,val2:ConditionalValue):number|string{
        const v1 = this.parseStringOrNumber(val1);
        const v2 = this.parseStringOrNumber(val2);
        if(typeof v1 === 'string' || typeof v2 === 'string') return v1.toString() + v2.toString();
        return v1 + v2;
    }
    
    private static nullableOrCalc(lhs:ValType,rhs:ValType,calc:(lhs:ConditionalValue,rhs:ConditionalValue)=>boolean):boolean{
        const nLhs = isObjValType(lhs) ? lhs.value : lhs;
        const nRhs = isObjValType(rhs) ? rhs.value : rhs;
        return calc(nLhs,nRhs)
    }
    private static numberCalc(lhs:ValType,rhs:ValType,calc:(lhs:ConditionalValue,rhs:ConditionalValue)=>number|string):Extract<ValType,{type:'number'|'string'}>{
        const nLhs = isObjValType(lhs) ? lhs.value : lhs;
        const nRhs = isObjValType(rhs) ? rhs.value : rhs;
        const res = calc(nLhs,nRhs);
        if(typeof res === 'string') return { type:'string',value:res };
        return { type:'number',value:(isNaN(res) ? 0 : res) };
    }
    private static valSet(value:unknown):ValType{
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
    
    private static async processDataLocation(props:string[],blockData:FileDataElm,curData:FileData,thisData?:{[key:string]:unknown}){
        switch(props[0]){
            case '$file': splice(); return blockData.file;
            case '$cur': splice(); return curData.file;
            case '$cmeta': splice(); return curData.assertFrontmatter();
            case '$meta': splice(); return blockData.assertFrontmatter();
            case '$': splice(); return thisData??{};
            case '$this': splice(); return await blockData.nova.files.getIdOrGenerate(curData);
        }
        if(props[0][0]!=='$') return blockData.data;
        return {
            '$count':  async (arr:ValType,on?:OprType)=>{let nArr = []; if(on) nArr = this.formArray(arr).filter(async (val:any)=>await this.process(blockData,curData,on,val)); return nArr.length; },
            '$filter': async (arr:ValType,on:OprType)=>this.formArray(arr).filter(async (val:any)=>await this.process(blockData,curData,on,val)),
            '$some':   async (arr:ValType,on:OprType)=>this.formArray(arr).some(async (val:any)=>await this.validate(blockData,curData,on,val)),
            '$every':  async (arr:ValType,on:OprType)=>this.formArray(arr).every(async (val:any)=>await this.validate(blockData,curData,on,val)),
            '$if':     async (val:OprType,res:OprType,els?:OprType)=>((await this.process(blockData,curData,val))?(await this.process(blockData,curData,res)):(els?await this.process(blockData,curData,els):null)),
            '$path':   async (...paths:OprType[])=>path.join(blockData.file.parent.path,...(await this.handlePaths(blockData,curData,paths))),
        }
    
        function splice(){ props.splice(0,1); }
    }
    
    private static async handlePaths(blockData:FileDataElm,curData:FileData,paths:OprType[]):Promise<string[]>{
        return Promise.all(paths.map(async path=>((await this.process(blockData,curData,path)??'').toString())));
    }
    
    private static formArray(arr:ValType){
        if(Array.isArray(arr)) return arr;
        if(isObjValType(arr)) return Array.isArray(arr.value) ? arr.value : [];
        return [];
    }

}
