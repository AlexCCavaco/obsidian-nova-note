import type { OprType } from "src/parser";
import ResourceCol, { type ResourceColOpts } from "./ResourceCol";
import type Resource from "./Resource";

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

    constructor(name:string, label:string, resource:Resource, on?:OprType, opts?:ResourceColOpts ){
        super(name,label,opts);
        this.resource = resource;
        this.on = on ?? null;
    }

}
