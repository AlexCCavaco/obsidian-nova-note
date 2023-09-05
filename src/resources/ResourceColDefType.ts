import type TypeData from "src/data/TypeData";
import ResourceCol, { type ResourceColOpts } from "./ResourceCol";

export type ResourceColDefTypeType = {
    label: string,
    type: 'type',
    input: true,
    multi: boolean,
    required: boolean,
    value: string|null
};

export default class ResourceColDefType extends ResourceCol {

    input: true;
    type: TypeData;

    constructor(name:string, label:string, type:TypeData, opts?:ResourceColOpts ){
        super(name,label,opts);
        this.type = type;
    }
    
    getRaw(){
        return `'${this.label}' @${this.type.name}${this.multi?'+':''}${this.required?'*':''}`;
    }

}
