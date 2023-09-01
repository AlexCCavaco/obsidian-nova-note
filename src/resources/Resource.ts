import type { CachedMetadata, TFile } from "obsidian";
import { parseType } from "./parser";
import type Nova from "src/Nova";
import { type OprType } from "src/parser";
import type { ResourceColDefTypeType } from "./ResourceColDefType";
import type ResourceCol from "./ResourceCol";
import ResourceColValue from "./ResourceColValue";
import ResourceColResource from "./ResourceColResource";
import ResourceColDefType from "./ResourceColDefType";
import ResourceItem, { ResourceItemFromFileData } from "./ResourceItem";
import FileData from "src/data/FileData";
import type FileDataElm from "src/data/FileDataElm";

export type ResourceOpts = {
    extend     ?: string,
    html       ?: string,
    inline     ?: boolean,
    hidden     ?: boolean,
    filename   ?: OprType,
    location   ?: OprType,
    template   ?: string,
};

export default class Resource {

    nova    : Nova;
    name    : string;
    cols    : {[key:string]:ResourceCol};
    fileData: FileData|null;

    private extend      : Resource|null;
    private html        : string|null;
    private inline      : boolean;
    private hidden      : boolean;
    private filename    : OprType|null;
    private location    : OprType|null;
    private template    : string|null;

    private items       : ResourceItem[];
    private propGen     : boolean;
    private properties  : {[key:string]:unknown};

    constructor(nova:Nova,name:string,file?:FileData|null,properties?:Resource['properties']){
        this.nova = nova;
        this.name = name;
        this.fileData = file??null;
        this.items = [];
        this.propGen = false;
        this.properties = properties??{};
    }

    private setupProperties(){
        this.propGen = true;
        if(this.properties.$extend){
            this.extend = this.nova.resources.getResource(this.properties.$extend.toString());
            delete this.properties.$extend;
            if(this.extend) this.properties = Object.assign({}, this.extend.properties, this.properties);
        }
        const { cols,opts } = this.nova.resources.handleResourceCols(this.fileData??undefined,this.properties);
        this.cols = cols;
        this.updateOpts(opts);
    }

    getCols():{[key:string]:ResourceCol}{
        if(!this.propGen) this.setupProperties();
        return this.cols;
    }

    updateProperties(properties:Resource['properties']){
        this.properties = properties;
        this.propGen = false;
    }

    private updateOpts(opts:ResourceOpts){
        this.html       = opts.html     ?? null;
        this.filename   = opts.filename ?? null;
        this.location   = opts.location ?? null;
        this.template   = opts.template ?? null;
        this.inline     = opts.inline ? !!opts.inline : false;
        this.hidden     = opts.hidden ? !!opts.hidden : false;
    }

    async getPath(data:FileDataElm,curData:FileData){
        if(!this.propGen) this.setupProperties();
        return this.location ? await this.nova.data.processOPR(data,curData,this.location) : curData.file.parent.path;
    }
    async getFileName(data:FileDataElm,curData:FileData){
        if(!this.propGen) this.setupProperties();
        return this.filename ? await this.nova.data.processOPR(data,curData,this.filename) : this.name;
    }

    getExtends(){
        if(!this.propGen) this.setupProperties();
        return this.extend;
    }
    getHTML(){
        if(!this.propGen) this.setupProperties();
        return this.html;
    }
    getTemplate(){
        if(!this.propGen) this.setupProperties();
        return this.template;
    }

    isInline(){
        if(!this.propGen) this.setupProperties();
        return this.inline;
    }
    isHidden(){
        if(!this.propGen) this.setupProperties();
        return this.hidden;
    }

    update(cols:Resource['cols']) {
        this.cols = cols;
    }

    assert(nova:Nova,data:FileDataElm,curData:FileData):FileDataElm{
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
                nData[key] = { lazy:true,get:async ()=>(nData[key]=col.resource?await this.nova.loader.loadFromResource(col.resource,col.on,nData):def) };
            } else if(col instanceof ResourceColValue){
                nData[key] = { lazy:true,get:async ()=>(nData[key]=await this.nova.data.processOPR(data,curData,col.value)??def) };
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
