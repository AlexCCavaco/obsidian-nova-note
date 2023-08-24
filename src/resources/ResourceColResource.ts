import type { OPR_TYPE } from "src/parser";
import ResourceCol, { type ResourceColOpts } from "./ResourceCol";

export type ResourceColResourceType = {
    label: string,
    type: 'resource',
    input: boolean,
    multi: boolean,
    required: boolean,
    resource: string|null,
    on: OPR_TYPE
};

export default class ResourceColResource extends ResourceCol {

    resource: string|null;
    on: OPR_TYPE;

    constructor(name:string, label:string, resource?:string|null, on?:OPR_TYPE, opts?:ResourceColOpts ){
        super(name,label,opts);
        this.resource = resource??null;
        this.on = on ?? null;
    }

}
