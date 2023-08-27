import type { OprType } from "src/parser";
import ResourceCol, { type ResourceColOpts } from "./ResourceCol";

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

    constructor(name:string, label:string, value:OprType, opts?:ResourceColOpts ){
        super(name,label,opts);
        this.value = value??null;
    }

}
