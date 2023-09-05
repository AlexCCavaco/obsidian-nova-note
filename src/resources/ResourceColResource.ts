import ResourceCol, { type ResourceColOpts } from "./ResourceCol";
import type Resource from "./Resource";
import type { OprType } from "src/parser";
import type Expression from "src/data/Expression";

export type ResourceColResourceType = {
    label: string,
    type: 'resource',
    input: boolean,
    multi: boolean,
    required: boolean,
    resource: string|null,
    on: OprType
};

export default class ResourceColResource extends ResourceCol {

    resource: Resource;
    on: OprType;

    constructor(rawData:string, name:string, label:string, resource:Resource, on?:OprType, opts?:ResourceColOpts ){
        super(rawData,name,label,opts);
        this.resource = resource;
        this.on = on ?? null;
    }

    static makeRaw(name:string, label:string, resource:Resource, on?:Expression, opts?:ResourceColOpts ){
        const raw = `'${label}' @${resource.name}${opts&&opts.multi?'+':''}${opts&&opts.required?'*':''} ${on?' => '+on.raw:''}`;
        return new this(raw,name,label,resource,on?.value,opts);
    }

}
