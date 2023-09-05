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

    constructor(rawData:string, name:string, label:string, type:TypeData, opts?:ResourceColOpts ){
        super(rawData,name,label,opts);
        this.type = type;
    }
    
    static makeRaw(name:string, label:string, type:TypeData, opts?:ResourceColOpts ){
        const raw = `'${label}' @${type.name}${opts&&opts.multi?'+':''}${opts&&opts.required?'*':''}`;
        return new this(raw,name,label,type,opts);
    }

}
