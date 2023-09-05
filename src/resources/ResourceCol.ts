
export type ResourceColOpts = { input?:boolean,multi?:boolean,required?:boolean,[key:string]:unknown };

export default class ResourceCol {

    raw     :string;
    name    :string;
    label   :string;
    input   :boolean;
    multi   :boolean;
    required:boolean;

    constructor(rawData:string,name:string,label:string,opts?:ResourceColOpts){
        this.raw = rawData;
        this.name = name;
        this.label = label;
        if(!opts) opts = {};
        this.input = opts.input ?? false;
        this.multi = opts.multi ?? false;
        this.required = opts.required ?? false;
    }

}
