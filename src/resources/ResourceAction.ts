import type Resource from "./Resource";

export type ResourceActionOpts = {
    type       ?: 'create',
};

export default class {

    resource: Resource;

    constructor(name:string,opts:{[key:string]:string}){
        //
    }
    
    static parse(name:string,data:string){
        const opts = {};
        //

        const resource = new this(name,opts);
        return resource;
    }

}
