import type { OPR_TYPE } from "src/parser";
import ResourceCol, { type ResourceColOpts } from "./ResourceCol";

export type ResourceColValueType = {
    label: string,
    type: 'value',
    input: false,
    multi: false,
    value: OPR_TYPE,
    required: false
};

export default class ResourceColValue extends ResourceCol {

    input: false;
    value: OPR_TYPE;
    required: false;
    multi: false;

    constructor(name:string, label:string, value?:OPR_TYPE, opts?:ResourceColOpts ){
        super(name,label,opts);
        this.value = value??null;
    }

}
