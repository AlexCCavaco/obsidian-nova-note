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
    typeData: 'resource';
    on: Expression|null;

    constructor(name:string, label:string, resource:Resource, on?:Expression|null, opts?:ResourceColOpts ){
        super(name,label,'resource',opts);
        this.resource = resource;
        this.on = on ?? null;
    }

    getRaw(){
        return `'${this.label}' @${this.resource.name}${this.multi?'+':''}${this.required?'*':''}${this.on?' ON '+this.on.raw:''}`;
    }

}
