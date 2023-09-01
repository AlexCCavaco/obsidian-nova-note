import type { TFile } from "obsidian";
import type Resource from "./Resource";
import FileDataElm from "src/data/FileDataElm";
import ResourceColResource from "./ResourceColResource";
import ResourceColDefType from "./ResourceColDefType";
import ResourceColValue from "./ResourceColValue";
import type ResourceColString from "./ResourceColString";
import FileData from "src/data/FileData";
import type Nova from "src/Nova";

export default class ResourceItem extends FileDataElm {

    resource    : Resource;

    constructor(nova:Nova,resource:Resource,file:TFile,data?:FileDataElm['data']){
        super(nova,file);
        this.resource = resource;
        if(data) this.setData(ResourceItem.assertData(nova,resource,this,data??{}));
    }

    static async create(nova:Nova,resource:Resource,fileData:FileData,data:FileDataElm['data']){
        const fileDataElm = FileDataElm.fromFileData(fileData,data);
        data = ResourceItem.assertData(nova,resource,fileDataElm,data);
        const name = resource.getFileName(fileDataElm,fileData);
        const path = resource.getPath(fileDataElm,fileData);
        const file = await nova.app.vault.create(path + '/' + name + '.md','');
        const item = new this(nova,resource,file,data);
        await item.save();
        return item;
    }

    async save(){
        await this.nova.app.fileManager.processFrontMatter(this.file,(fm)=>{
            for(const key in this.data) fm[key] = this.data[key];
        });
    }

    static assertData(nova:Nova,resource:Resource,fileDataElm:FileDataElm,data:FileDataElm['data']){
        const keys = Object.keys(resource.getCols());
        const res:FileDataElm['data'] = {};
        for(const key of keys){
            if(data[key]==null) continue;
            const val = ResourceItem.assertValue(nova,resource,fileDataElm,key,data[key]);
            if(val==null) continue;
            res[key] = val;
        }
        return res;
    }
    static assertValue(nova:Nova,resource:Resource,fileDataElm:FileDataElm,key:string,value:any){
        if(!resource.getCols()[key]) return undefined;
        const col = resource.getCols()[key];
        if(col instanceof ResourceColResource) return col.resource.getItem(value.toString());
        if(col instanceof ResourceColDefType) return col.type.get(value.toString());
        if(col instanceof ResourceColValue) return nova.data.processOPR(fileDataElm,FileData.getCurrent(nova),col.value,value);
        switch((col as ResourceColString).type){
            case "number":   return parseFloat(value);
            case "text":     return value.toString();
            case "check":    return !!value;
            case "link":     return value.toString();
            case "date":     return new Date(value);
            case "time":     return new Date(value);
            case "datetime": return new Date(value);
            case "color":    return value.toString();
        }
    }

    protected assertData(resource:Resource,data:FileDataElm['data']):FileDataElm['data']{
        const keys = Object.keys(resource.getCols());
        const res:FileDataElm['data'] = {};
        for(const key of keys){
            if(data[key]==null) continue;
            const val = this.assertValue(resource,key,data[key]);
            if(val==null) continue;
            res[key] = val;
        }
        return res;
    }

    protected assertValue(resource:Resource,key:string,value:any){
        if(!resource.getCols()[key]) return undefined;
        const col = resource.getCols()[key];
        if(col instanceof ResourceColResource) return col.resource.getItem(value.toString());
        if(col instanceof ResourceColDefType) return col.type.get(value.toString());
        if(col instanceof ResourceColValue) return this.nova.data.processOPR(this,FileData.getCurrent(this.nova),col.value,value);
        switch((col as ResourceColString).type){
            case "number":   return parseFloat(value);
            case "text":     return value.toString();
            case "check":    return !!value;
            case "link":     return value.toString();
            case "date":     return new Date(value);
            case "time":     return new Date(value);
            case "datetime": return new Date(value);
            case "color":    return value.toString();
        }
    }

    setData(data:FileDataElm['data']){
        this.data = this.assertData(this.resource,data);
    }

    setValue(key:string,value:unknown){
        const val = this.assertValue(this.resource,key,value);
        if(val===undefined) return null;
        this.data[key] = val;
    }

    getId(){
        return this.nova.files.getId(new FileData(this.nova,this.file));
    }
    
    async getIdOrGenerate(){
        return await this.nova.files.getIdOrGenerate(new FileData(this.nova,this.file));
    }
    
    async generateId(){
        return await this.nova.files.generateId(new FileData(this.nova,this.file));
    }

}

export function ResourceItemFromResource(resource:Resource,file:TFile,data?:FileDataElm['data']){
    return new ResourceItem(resource.nova, resource, file, data);
}

export function ResourceItemFromFileData(resource:Resource,elm:FileData,data?:FileDataElm['data']){
    return new ResourceItem(elm.nova, resource, elm.file, data);
}
