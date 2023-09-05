import ResourceCol, { type ResourceColOpts } from "./ResourceCol";

export type ResourceColStringType = {
    label: string,
    type: ResourceColString['type'],
    input: true,
    multi: boolean,
    required: boolean
};

export default class ResourceColString extends ResourceCol {

    type: 'text'|'number'|'check'|'link'|'date'|'time'|'datetime'|'color';
    input: true;

    constructor(rawData:string, name:string, label:string, type:ResourceColString['type'], opts?:ResourceColOpts ){
        super(rawData,name,label,opts);
        this.type = type;
    }

    static makeRaw(name:string, label:string, type:ResourceColString['type'], opts?:ResourceColOpts ){
        const raw = `'${label}' ${type}${opts&&opts.multi?'+':''}${opts&&opts.required?'*':''}`;
        return new this(raw,name,label,type,opts);
    }

}