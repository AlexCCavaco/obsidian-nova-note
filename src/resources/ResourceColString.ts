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

    constructor(name:string, label:string, type:ResourceColString['type'], opts?:ResourceColOpts ){
        super(name,label,opts);
        this.type = type;
    }

}