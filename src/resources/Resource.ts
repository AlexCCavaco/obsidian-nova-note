import type { CachedMetadata, TFile } from "obsidian";
import { parseType } from "./parser";
import type NovaNotePlugin from "src/main";
import { type OprType } from "src/parser";
import type { ResourceColDefTypeType } from "./ResourceColDefType";
import type ResourceCol from "./ResourceCol";
import ResourceColValue from "./ResourceColValue";
import ResourceColResource from "./ResourceColResource";
import ResourceColDefType from "./ResourceColDefType";
import ResourceItem, { ResourceItemFromFileData } from "./ResourceItem";
import FileData from "src/data/FileData";
import type FileDataElm from "src/data/FileDataElm";
import { processOPR } from "src/data/ConditionalData";
import { loadFromResource } from "src/data/DataLoader";

export type ResourceOpts = {
    extend     ?: string,
    html       ?: string,
    inline     ?: boolean,
    filename   ?: OprType,
    location   ?: OprType,
    template   ?: string,
};

export default class Resource {

    nova        : NovaNotePlugin;
    name        : string;
    cols        : {[key:string]:ResourceCol};
    file       ?: TFile;
    
    extend      : string | null;
    html        : string | null;
    inline      : boolean;
    filename    : OprType | null;
    location    : OprType | null;
    template    : string | null;

    items       : ResourceItem[];

    constructor(nova:NovaNotePlugin,name:string,file?:TFile,cols?:Resource['cols'],opts?:ResourceOpts,extendsResource?:Resource){
        this.nova = nova;
        this.name = name;
        this.cols = cols ?? {};
        this.file = file;
        this.items = [];
        if(extendsResource) opts = Object.assign({},extendsResource.getOpts(),opts);
        if(opts) this.updateOpts(opts);
    }

    getOpts():ResourceOpts{
        const opts:ResourceOpts = {};
        if(this.extend!=null) opts.extend = this.extend;
        if(this.html!=null) opts.html = this.html;
        if(this.filename!=null) opts.filename = this.filename;
        if(this.location!=null) opts.location = this.location;
        if(this.template!=null) opts.template = this.template;
        if(this.inline!=null) opts.inline = this.inline;
        return opts;
    }

    updateOpts(opts:ResourceOpts){
        this.extend     = opts.extend   ?? null;
        this.html       = opts.html     ?? null;
        this.filename   = opts.filename ?? null;
        this.location   = opts.location ?? null;
        this.template   = opts.template ?? null;
        this.inline     = opts.inline ? !!opts.inline : false;
    }

    async genPath(data:FileDataElm,curData:FileData){ return this.location ? await processOPR(data,curData,this.location) : curData.file.parent.path; }
    async genFileName(data:FileDataElm,curData:FileData){ return this.filename ? await processOPR(data,curData,this.filename) : this.name; }

    update(cols:Resource['cols']) {
        this.cols = cols;
    }

    assert(nova:NovaNotePlugin,data:FileDataElm,curData:FileData):FileDataElm{
        const bData = data.data;
        const nData:FileDataElm['data'] = {};
        for(const key in this.cols){
            const col = this.cols[key];
            const def = (col.multi?[]:null);
            if(col instanceof ResourceColDefType){
                nData[key] = { lazy:true,get:async ()=>(nData[key]=await this.loadType(data,'type',bData[key])??def) };
            } else if(col.input){
                nData[key] = bData[key]??def;
            } else if(col instanceof ResourceColResource){
                nData[key] = { lazy:true,get:async ()=>(nData[key]=col.resource?await loadFromResource(col.resource,col.on,nData):def) };
            } else if(col instanceof ResourceColValue){
                nData[key] = { lazy:true,get:async ()=>(nData[key]=await processOPR(data,curData,col.value)??def) };
            }
        }
        return Object.assign({},data,{ data:nData });
    }

    private async loadType(data:FileDataElm|FileData,type:ResourceColDefTypeType['value'],value:unknown){
        if(!data.meta || !data.meta.frontmatter || !data.meta.frontmatter['data-type'] || !type || !data.meta.frontmatter['data-type'][type]) return null;
        if(typeof value !== 'string') return null;
        const typeData = data.meta.frontmatter['data-type'][type][value] ?? '';
        return { name:value,...parseType(typeData) };
    }

    async getItem(key:string):Promise<ResourceItem|null>{
        for(const item of this.items) if(await item.getId()===key) return item;
        return null;
    }

    getItems(forceReload=false):ResourceItem[]{
        if(forceReload||this.items.length===0) this.loadItems();
        return Object.values(this.items);
    }

    loadItems():ResourceItem[]{
        const files = this.nova.app.vault.getMarkdownFiles();
        for(const file of files) this.loadItem(file);
        return this.items;
    }

    loadItem(file:TFile,metadata?:CachedMetadata):ResourceItem|null{
        const fileData = new FileData(this.nova,file);
        const data = fileData.getFrontmatter();
        if(!data || !data.use) return null;
        if(typeof data.use === 'string'){
            if(data.use!==this.name) return null;
            const item = ResourceItemFromFileData(this,fileData,data);
            this.items.push(item);
            return item;
        }
        if(Array.isArray(data.use)){
            if(!data.use.includes(this.name)) return null;
            const item = ResourceItemFromFileData(this,fileData,data);
            this.items.push(item);
            return item;
        }
        return null;
    }

    addItem(file:TFile,data:{[key:string]:unknown}){
        this.items.push(new ResourceItem(this.nova,this,file,data));
    }

}
