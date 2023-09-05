import ResourceCol, { type ResourceColOpts } from "./ResourceCol";
import type Expression from "src/data/Expression";

export type ResourceColValueType = {
    label: string,
    type: 'value',
    input: false,
    multi: false,
    value: Expression,
    required: false
};

export default class ResourceColValue extends ResourceCol {

    input: false;
    value: Expression;
    required: false;
    multi: false;

    constructor(name:string, label:string, value:Expression, opts?:ResourceColOpts ){
        super(name,label,opts);
        this.value = value??null;
    }

    getRaw(){
        return `'${this.label}' => ${this.value.raw}`;
    }

}
