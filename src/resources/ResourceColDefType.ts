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
    value: string|null;

    constructor(name:string, label:string, value?:string|null, opts?:ResourceColOpts ){
        super(name,label,opts);
        this.value = value??null;
    }

}
