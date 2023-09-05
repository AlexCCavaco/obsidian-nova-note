import type { OprType } from "src/parser";
import ResourceCol, { type ResourceColOpts } from "./ResourceCol";
import type Expression from "src/data/Expression";

export type ResourceColValueType = {
    label: string,
    type: 'value',
    input: false,
    multi: false,
    value: OprType,
    required: false
};

export default class ResourceColValue extends ResourceCol {

    input: false;
    value: OprType;
    required: false;
    multi: false;

    constructor(rawData:string, name:string, label:string, value:OprType, opts?:ResourceColOpts ){
        super(rawData,name,label,opts);
        this.value = value??null;
    }

    static makeRaw(name:string, label:string, value:Expression, opts?:ResourceColOpts ){
        const raw = `'${label}' => ${value.raw}`;
        return new this(raw,name,label,value.value,opts);
    }

}
