
export type ResourceColOpts = { input?:boolean,multi?:boolean,required?:boolean,[key:string]:unknown };

export default class ResourceCol {

    name    :string;
    label   :string;
    type    :string;
    input   :boolean;
    multi   :boolean;
    required:boolean;

    constructor(name:string,label:string,type:ResourceCol['type'],opts?:ResourceColOpts){
        this.name = name;
        this.label = label;
        this.type = type;
        if(!opts) opts = {};
        this.input = opts.input ?? false;
        this.multi = opts.multi ?? false;
        this.required = opts.required ?? false;
    }

    getRaw(){
        return `'${this.label}' ${this.type.toUpperCase()}${this.multi?'+':''}${this.required?'*':''}`;
    }

}
