import { parseExpression, type OprType } from "src/parser";
import Operation from "../controllers/Operation";
import type FileDataElm from "./FileDataElm";
import type FileData from "./FileData";
import type { BlockDataVal } from "src/blocks/NovaBlock";

export default class {

    raw:string;
    value:OprType;

    constructor(rawData:string,value:OprType){
        this.raw = rawData;
        this.value = value;
    }

    async validate(locationData:FileDataElm,currentData:FileData,thisData?:BlockDataVal){
        return await Operation.validate(locationData,currentData,this.value,thisData);
    }

    async process(locationData:FileDataElm,currentData:FileData,thisData?:BlockDataVal){
        return await Operation.process(locationData,currentData,this.value,thisData);
    }

    static parse(data:string){
        const res = parseExpression(data);
        return new this(data,res);
    }

}
