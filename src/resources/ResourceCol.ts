import ResourceColDefType from "./ResourceColDefType";
import ResourceColResource from "./ResourceColResource";
import ResourceColString from "./ResourceColString";
import ResourceColValue from "./ResourceColValue";
import parse from "./parser";

export type ResourceColOpts = { input?:boolean,multi?:boolean,required?:boolean,[key:string]:unknown };

export default class ResourceCol {

    name: string;
    label: string;
    input: boolean;
    multi: boolean;
    required: boolean;

    constructor(name:string,label:string,opts?:ResourceColOpts){
        this.name = name;
        this.label = label;
        if(!opts) opts = {};
        this.input = opts.input ?? false;
        this.multi = opts.multi ?? false;
        this.required = opts.required ?? false;
    }
    
    static parse(name:string,data:string) {
        const opts = parse(data);
        switch(opts.type){
            case "number":
            case "text":
            case "check":
            case "link":
            case "date":
            case "time":
            case "datetime":
            case "color": return new ResourceColString(name, opts.label, opts.type, opts);
            case "resource": return new ResourceColResource(name, opts.label, opts.resource, opts.on, opts);
            case "value": return new ResourceColValue(name, opts.label, opts.value, opts);
            case "type": return new ResourceColDefType(name, opts.label, opts.value, opts);
        }
    }

}
