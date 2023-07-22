import type { TFile } from "obsidian";
import { parseType, type RESOURCE_COL_DEFTYPE, type RESOURCE_TYPE } from "./parser";
import type { BlockDataElm } from "src/blocks/NovaBlock";
import type NovaNotePlugin from "src/main";
import { loadFromResource, processOPR, type FileData } from "src/handlers/dataLoader";

export default class {

    name : string;
    cols : RESOURCE_TYPE;
    file?: TFile;

    constructor(name:string,cols:RESOURCE_TYPE,file?:TFile){
        this.name = name;
        this.cols = cols;
        this.file = file;
    }

    update(cols:RESOURCE_TYPE) {
        this.cols = cols;
    }

    assert(nova:NovaNotePlugin,data:BlockDataElm,curData:FileData):BlockDataElm{
        const bData = data.data;
        const nData:BlockDataElm['data'] = {};
        for(const key in this.cols){
            const col = this.cols[key];
            const def = (col.multi?[]:null);
            if(col.input) nData[key] = bData[key]??def;
            else if(col.type==='resource') nData[key] = { lazy:true,get:async ()=>(nData[key]=col.resource?await loadFromResource(nova,col.resource,col.on,nData):def) };
            else if(col.type==='value') nData[key] = { lazy:true,get:async ()=>(nData[key]=await processOPR(data,curData,col.value)??def) };
            else if(col.type==='type') nData[key] = { lazy:true,get:async ()=>(nData[key]=await loadType(data,col.type,bData[key])??def) };
        }
        return Object.assign({},data,{ data:nData });
    }

}

async function loadType(data:BlockDataElm,type:RESOURCE_COL_DEFTYPE['value'],value:any){
    if(!data.meta || !data.meta.frontmatter || !data.meta.frontmatter['data-type'] || !type || !data.meta.frontmatter['data-type'][type]) return null;
    if(typeof value !== 'string') return null;
    const typeData = data.meta.frontmatter['data-type'][type][value] ?? '';
    return parseType(typeData);
}
