import type { TFile } from "obsidian";
import { parseType } from "./parser";
import type { BlockDataElm } from "src/blocks/NovaBlock";
import type NovaNotePlugin from "src/main";
import { loadFromResource, processOPR, type FileData } from "src/handlers/dataLoader";
import type { OPR_TYPE } from "src/parser";
import ResourceAction from "./ResourceAction";
import type { ResourceColDefTypeType } from "./ResourceColDefType";
import type ResourceCol from "./ResourceCol";
import ResourceColValue from "./ResourceColValue";
import ResourceColResource from "./ResourceColResource";
import ResourceColDefType from "./ResourceColDefType";

export type ResourceOpts = {
    extend     ?: string,
    html       ?: string,
    filename   ?: OPR_TYPE,
    location   ?: OPR_TYPE,
    inline     ?: boolean,
    template   ?: string,
    action     ?: {[key:string]:string}
};

export default class Resource {

    name        : string;
    cols        : {[key:string]:ResourceCol};
    file       ?: TFile;
    
    extend      : string | null;
    html        : string | null;
    inline      : boolean;
    filename    : OPR_TYPE | null;
    location    : OPR_TYPE | null;
    template    : string | null;
    action      : ResourceAction[];

    constructor(name:string, file?:TFile, cols?:Resource['cols'], opts?:ResourceOpts){
        this.name = name;
        this.cols = cols ?? {};
        this.file = file;
        if(opts) this.updateOpts(opts);
    }

    updateOpts(opts:ResourceOpts){
        this.extend     = opts.extend   ?? null;
        this.html       = opts.html     ?? null;
        this.filename   = opts.filename ?? null;
        this.location   = opts.location ?? null;
        this.template   = opts.template ?? null;
        this.inline     = opts.inline ? !!opts.inline : false;
        this.action     = [];
        if(opts.action){
            const keys = Object.keys(opts.action);
            for(const key of keys){
                const action = ResourceAction.parse(key,opts.action[key]);
                this.action.push(action);
            }
        }
    }

    async genPath(data:BlockDataElm,curData:FileData){ return this.location ? await processOPR(data,curData,this.location) : curData.file.parent.path; }
    async genFileName(data:BlockDataElm,curData:FileData){ return this.filename ? await processOPR(data,curData,this.filename) : this.name; }

    update(cols:Resource['cols']) {
        this.cols = cols;
    }

    assert(nova:NovaNotePlugin,data:BlockDataElm,curData:FileData):BlockDataElm{
        const bData = data.data;
        const nData:BlockDataElm['data'] = {};
        for(const key in this.cols){
            const col = this.cols[key];
            const def = (col.multi?[]:null);
            if(col instanceof ResourceColDefType) nData[key] = { lazy:true,get:async ()=>(nData[key]=await loadType(data,'type',bData[key])??def) };
            else if(col.input) nData[key] = bData[key]??def;
            else if(col instanceof ResourceColResource) nData[key] = { lazy:true,get:async ()=>(nData[key]=col.resource?await loadFromResource(nova,col.resource,col.on,nData):def) };
            else if(col instanceof ResourceColValue) nData[key] = { lazy:true,get:async ()=>(nData[key]=await processOPR(data,curData,col.value)??def) };
        }
        return Object.assign({},data,{ data:nData });
    }

}

async function loadType(data:BlockDataElm|FileData,type:ResourceColDefTypeType['value'],value:any){
    if(!data.meta || !data.meta.frontmatter || !data.meta.frontmatter['data-type'] || !type || !data.meta.frontmatter['data-type'][type]) return null;
    if(typeof value !== 'string') return null;
    const typeData = data.meta.frontmatter['data-type'][type][value] ?? '';
    return { name:value,...parseType(typeData) };
}
