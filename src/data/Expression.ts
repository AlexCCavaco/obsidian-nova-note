import { parseExpression, type OprType } from "src/parser";
import Operation from "../controllers/Operation";
import type FileDataElm from "./FileDataElm";
import type FileData from "./FileData";
import type { BlockDataVal } from "src/blocks/NovaBlock";
import type Parsimmon from "parsimmon";

export default class Expression<ExpressionType extends OprType = OprType> {

    raw:string;
    value:ExpressionType;

    constructor(rawData:string,value:ExpressionType){
        this.raw = rawData;
        this.value = value;
    }

    static null(){ return new this('null',null); }
    static true(){ return new this('true',true); }
    static false(){ return new this('false',false); }

    async validate(locationData:FileDataElm,currentData:FileData,thisData?:BlockDataVal){
        return await Operation.validate(locationData,currentData,this.value,thisData);
    }

    async process(locationData:FileDataElm,currentData:FileData,thisData?:BlockDataVal){
        return await Operation.process(locationData,currentData,this.value,thisData);
    }

    static parse(data:string){
        const rawExpr = parseExpression(data);
        return this.parsed(data,rawExpr);
    }

    static parsed(data:string,{value,start,end}:{value:OprType,start:Parsimmon.Index,end:Parsimmon.Index}){
        return new this(data.substring(start.offset,end.offset).trim(),value);
    }

}
