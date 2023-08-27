import type { TFile } from "obsidian";
import type Resource from "./Resource";
import type NovaNotePlugin from "src/main";
import FileDataElm from "src/data/FileDataElm";
import ResourceColResource from "./ResourceColResource";
import ResourceColDefType from "./ResourceColDefType";
import ResourceColValue from "./ResourceColValue";
import type ResourceColString from "./ResourceColString";
import { generateId, getId } from "src/handlers/idHandler";
import FileData from "src/data/FileData";
import { processOPR } from "src/data/ConditionalData";

export function ResourceItemFromResource(resource:Resource,file:TFile,data?:FileDataElm['data']){
    return new this(resource.nova, resource, file, data);
}

export function ResourceItemFromFileData(resource:Resource,elm:FileData,data?:FileDataElm['data']){
    return new this(elm.nova, resource, elm.file, data);
}

export default class ResourceItem extends FileDataElm {

    resource    : Resource;

    constructor(nova:NovaNotePlugin,resource:Resource,file:TFile,data?:FileDataElm['data']){
        super(nova,file);
        this.resource = resource;
        if(data) this.setData(this.assertData(resource,data??{}));
    }

    protected assertData(resource:Resource,data:FileDataElm['data']):FileDataElm['data']{
        const keys = Object.keys(resource.cols);
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
        if(!resource.cols[key]) return undefined;
        const col = resource.cols[key];
        if(col instanceof ResourceColResource) return col.resource.getItem(value.toString());
        if(col instanceof ResourceColDefType) return col.type.get(value.toString());
        if(col instanceof ResourceColValue) return processOPR(this,FileData.getCurrent(this.nova),col.value,value);
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

    async getId(){
        return await getId(this.nova,new FileData(this.nova,this.file));
    }
    
    async generateId(){
        return await generateId(this.nova,this.file);
    }

}
