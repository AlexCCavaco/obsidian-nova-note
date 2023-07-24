import type { TFile } from "obsidian";
import { parseType, type RESOURCE_COL_DEFTYPE, type RESOURCE_TYPE } from "./parser";
import type { BlockDataElm } from "src/blocks/NovaBlock";
import type NovaNotePlugin from "src/main";
import { loadFromResource, processOPR, type FileData } from "src/handlers/dataLoader";
import type { OPR_TYPE } from "src/parser";

export type ResourceOpts = { cols?:RESOURCE_TYPE,extend?:string,html?:string,filename?:OPR_TYPE,location?:OPR_TYPE };

export default class {

    name        : string;
    extend     ?: string;
    html       ?: string;
    filename   ?: OPR_TYPE;
    location   ?: OPR_TYPE;
    cols        : RESOURCE_TYPE;
    file       ?: TFile;

    constructor(name:string,file?:TFile,opts?:ResourceOpts){
        this.name = name;
        this.cols = {};
        if(opts) this.updateOpts(opts);
        this.file = file;
    }

    updateOpts(opts:ResourceOpts){
        if(opts.extend)     this.extend     = opts.extend;
        if(opts.html)       this.html       = opts.html;
        if(opts.cols)       this.cols       = opts.cols;
        if(opts.filename)   this.filename   = opts.filename;
        if(opts.location)   this.location   = opts.location;
    }

    async genPath(data:BlockDataElm,curData:FileData){ return this.location ? await processOPR(data,curData,this.location) : curData.file.parent.path; }
    async genFileName(data:BlockDataElm,curData:FileData){ return this.filename ? await processOPR(data,curData,this.filename) : this.name; }

    update(cols:RESOURCE_TYPE) {
        this.cols = cols;
    }

    assert(nova:NovaNotePlugin,data:BlockDataElm,curData:FileData):BlockDataElm{
        const bData = data.data;
        const nData:BlockDataElm['data'] = {};
        for(const key in this.cols){
            const col = this.cols[key];
            const def = (col.multi?[]:null);
            if(col.type==='type') nData[key] = { lazy:true,get:async ()=>(nData[key]=await loadType(data,col.type,bData[key])??def) };
            else if(col.input) nData[key] = bData[key]??def;
            else if(col.type==='resource') nData[key] = { lazy:true,get:async ()=>(nData[key]=col.resource?await loadFromResource(nova,col.resource,col.on,nData):def) };
            else if(col.type==='value') nData[key] = { lazy:true,get:async ()=>(nData[key]=await processOPR(data,curData,col.value)??def) };
        }
        return Object.assign({},data,{ data:nData });
    }

}

async function loadType(data:BlockDataElm|FileData,type:RESOURCE_COL_DEFTYPE['value'],value:any){
    if(!data.meta || !data.meta.frontmatter || !data.meta.frontmatter['data-type'] || !type || !data.meta.frontmatter['data-type'][type]) return null;
    if(typeof value !== 'string') return null;
    const typeData = data.meta.frontmatter['data-type'][type][value] ?? '';
    return { name:value,...parseType(typeData) };
}
