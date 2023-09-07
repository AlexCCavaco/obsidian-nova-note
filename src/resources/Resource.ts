import type { CachedMetadata, TFile } from "obsidian";
import { parseType } from "./parser";
import type Nova from "src/Nova";
import type { ResourceColDefTypeType } from "./ResourceColDefType";
import type ResourceCol from "./ResourceCol";
import ResourceColValue from "./ResourceColValue";
import ResourceColResource from "./ResourceColResource";
import ResourceColDefType from "./ResourceColDefType";
import ResourceItem, { ResourceItemFromFileData } from "./ResourceItem";
import FileData from "src/data/FileData";
import type FileDataElm from "src/data/FileDataElm";
import Operation from "src/controllers/Operation";
import type Expression from "src/data/Expression";

export type ResourceOpts = {
    extend     ?: Resource,
    html       ?: string,
    inline     ?: boolean,
    hidden     ?: boolean,
    filename   ?: Expression,
    location   ?: Expression,
    template   ?: TFile,
};

export default class Resource {

    nova    : Nova;
    name    : string;
    cols    : {[key:string]:ResourceCol};
    fileData: FileData|null;

    private $extend      : Resource|null;
    private $html        : string|null;
    private $inline      : boolean;
    private $hidden      : boolean;
    private $filename    : Expression|null;
    private $location    : Expression|null;
    private $template    : TFile|null;

    private items       : ResourceItem[];
    private propGen     : boolean;
    private properties  : {[key:string]:unknown};

    constructor(nova:Nova,name:string,file?:FileData|null,properties?:Resource['properties']){
        console.log(name,properties);
        this.nova = nova;
        this.name = name;
        this.fileData = file??null;
        this.items = [];
        this.propGen = false;
        this.properties = properties??{};
    }

    save(){
        if(!this.fileData) return;
        this.nova.app.fileManager.processFrontMatter(this.fileData.file,fm=>{
            if(!fm['nova-data']) fm['nova-data'] = {};
            fm['nova-data'][this.name] = {};
            const obj = fm['nova-data'][this.name];
            if(this.$extend!=null) obj['$extend'] = this.$extend.name;
            if(this.$html!=null) obj['$html'] = this.$html;
            if(this.$inline!=null) obj['$inline'] = this.$inline;
            if(this.$hidden!=null) obj['$hidden'] = this.$hidden;
            if(this.$filename!=null) obj['$filename'] = this.$filename;
            if(this.$location!=null) obj['$location'] = this.$location;
            if(this.$template!=null) obj['$template'] = this.$template.path;

            const cols = this.getCols();
            for(const key in cols) obj[key] = cols[key].getRaw();
        });
    }

    getProperties(){
        return this.properties;
    }

    private setupProperties(){
        this.propGen = true;
        if(this.properties.$extend){
            this.$extend = this.nova.resources.getResource(this.properties.$extend.toString());
            delete this.properties.$extend;
            if(this.$extend) this.properties = Object.assign({}, this.$extend.properties, this.properties);
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
        this.$html       = opts.html        ??  null;
        this.$filename   = opts.filename    ??  null;
        this.$location   = opts.location    ??  null;
        this.$template   = opts.template    ??  null;
        this.$inline     = opts.inline      ?? false;
        this.$hidden     = opts.hidden      ?? false;
    }

    getPathname(){}

    async getPath(data:FileDataElm,curData:FileData){
        if(!this.propGen) this.setupProperties();
        return this.$location ? await this.$location.validate(data,curData) : curData.file.parent.path;
    }
    async getFileName(data:FileDataElm,curData:FileData){
        if(!this.propGen) this.setupProperties();
        return this.$filename ? await this.$filename.validate(data,curData) : this.name;
    }

    get filename(){
        if(!this.propGen) this.setupProperties();
        return this.$filename;
    }
    get location(){
        if(!this.propGen) this.setupProperties();
        return this.$location;
    }
    get extends(){
        if(!this.propGen) this.setupProperties();
        return this.$extend;
    }
    get html(){
        if(!this.propGen) this.setupProperties();
        return this.$html;
    }
    get template(){
        if(!this.propGen) this.setupProperties();
        return this.$template;
    }

    get inline(){
        if(!this.propGen) this.setupProperties();
        return this.$inline;
    }
    get hidden(){
        if(!this.propGen) this.setupProperties();
        return this.$hidden;
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
                nData[key] = { lazy:true,get:async ()=>(nData[key]=await Operation.validate(data,curData,col.value)??def) };
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
