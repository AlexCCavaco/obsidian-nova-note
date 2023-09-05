import ResourceCol, { type ResourceColOpts } from "./ResourceCol";
import type Resource from "./Resource";
import type Expression from "src/data/Expression";

export type ResourceColResourceType = {
    label: string,
    type: 'resource',
    input: boolean,
    multi: boolean,
    required: boolean,
    resource: string|null,
    on: Expression|null
};

export default class ResourceColResource extends ResourceCol {

    resource: Resource;
    on: Expression|null;

    constructor(name:string, label:string, resource:Resource, on?:Expression|null, opts?:ResourceColOpts ){
        super(name,label,opts);
        this.resource = resource;
        this.on = on ?? null;console.log('COL',name,this.on)
    }

    getRaw(){
        return `'${this.label}' @${this.resource.name}${this.multi?'+':''}${this.required?'*':''} ${this.on?' => '+this.on.raw:''}`;
    }

}
