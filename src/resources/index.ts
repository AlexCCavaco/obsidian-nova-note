import { type CachedMetadata, type TFile } from "obsidian";
import { parseType } from "./parser";
import Resource, { type ResourceOpts } from "./Resource";
import type NovaNotePlugin from "src/main";
import ResourceListModal from "./modals/ResourceListModal";
import { errorNotice, errorNoticeMessage } from "src/handlers/noticeHandler";
import ResourceEditableModal from "./modals/ResourceEditableModal";
import ResourceCol from "./ResourceCol";
import { parseExpression, type OprType } from "src/parser";
import FileData from "src/data/FileData";
import TypeData from "src/data/TypeData";
import TypeDataElm from "src/data/TypeDataElm";
import TaskResource from "./TaskResource";
import ResourceColString from "./ResourceColString";
import ResourceColValue from "./ResourceColValue";
import ResourceColResource, { type ResourceColResourceType } from "./ResourceColResource";
import type { ResourceColDefTypeType } from "./ResourceColDefType";
import ResourceColDefType from "./ResourceColDefType";
import parse from "./parser";
import { addId, removeId } from "src/data/IdHandler";

export type ResourceList = { [key:string]:{ [key:string]:string } };
export const resources:{ [key:string]:Resource } = {};
export let count = 0;

export function addResource(key:string,resource:Resource){
    resources[key] = resource;
    count++;
}

export function addBaseResources(nova:NovaNotePlugin){
    addResource('task',new TaskResource(nova));
}

export function loadResources(nova:NovaNotePlugin){
    addBaseResources(nova);
    for(const file of nova.app.vault.getMarkdownFiles()) loadFile(nova,file);
    console.info(`Loaded ${count} Resources`);
}
export function loadFile(nova:NovaNotePlugin,file:TFile){
    const meta = nova.app.metadataCache.getFileCache(file);
    if(!meta || !meta.frontmatter) return;
    if(meta.frontmatter['nova-data']) try {
        addResources(nova,meta.frontmatter['nova-data'],file);
    } catch(err){
        errorNotice(err,`${file.path}: `);
    }
    if(meta.frontmatter['id']) addId(meta.frontmatter['id'],file);
}

export function fileChanged(nova:NovaNotePlugin,file:TFile, data:string, meta:CachedMetadata){
    if(!meta || !meta.frontmatter) return;
    if(meta.frontmatter['nova-data']) updateResources(nova,meta.frontmatter['nova-data'],file);
    if(meta.frontmatter['id']) addId(meta.frontmatter['id'],file);
    else removeId(meta.frontmatter['id']);
}

export function fileDeleted(nova:NovaNotePlugin,file:TFile, prevMeta:CachedMetadata|null){
    if(!prevMeta || !prevMeta.frontmatter) return;
    if(prevMeta.frontmatter['nova-data']) deleteResources(prevMeta.frontmatter['nova-data'],file);
    if(prevMeta.frontmatter['id']) removeId(prevMeta.frontmatter['id']);
}

/*/===/*/

export function addResources(nova:NovaNotePlugin,resourcesData:ResourceList,file:TFile){
    const keys = Object.keys(resourcesData);
    for(const key of keys){
        const data = resourcesData[key];
        const { cols,opts } = handleResourceCols(file,data);
        if(!resources[key]) count++;
        else errorNoticeMessage(`Duplicated Resource ${key}, Unexpected Behaviour will occur, please rename one of the Resources`);
        resources[key] = new Resource(nova,key,file,cols,opts);
        console.info(`Loaded Resource "${key}"`);
    }
}

export function updateResources(nova:NovaNotePlugin,resourcesData:ResourceList,file:TFile){
    const keys = Object.keys(resourcesData);
    for(const key of keys){
        const data = resourcesData[key];
        const { cols,opts } = handleResourceCols(file,data);
        if(!resources[key]){
            count++;
            resources[key] = new Resource(nova,key,file,cols,opts);
        } else {
            resources[key].updateOpts(opts);
        }
    }
}

export function deleteResources(resourcesData:ResourceList,file:TFile){
    const keys = Object.keys(resourcesData);
    for(const key of keys){ if(resources[key]) delete resources[key]; }
}

function handleResourceCols(file:TFile,data:{[key:string]:unknown}):{ cols:{[key:string]:ResourceCol},opts:ResourceOpts }{
    const colKeys = Object.keys(data);
    const opts:ResourceOpts = {};
    const cols:{[key:string]:ResourceCol} = {};
    for(const colKey of colKeys){
        const dataElm = data[colKey];
        if(dataElm==null) continue;
        if(colKey[0]!=='$'){
            const col = parseCol(new FileData(this.nova,file),colKey,dataElm.toString());
            if(col) cols[colKey] = col;
            continue;
        }
        const key = colKey.substring(1) as keyof ResourceOpts;
        switch(key){
            case "extend":      opts['extend']   = dataElm.toString(); break;
            case "html":        opts['html']     = dataElm.toString(); break;
            case "filename":    opts['filename'] = parseExpression(dataElm.toString()); break;
            case "location":    opts['location'] = parseExpression(dataElm.toString()); break;
            case "inline":      opts['inline']   = !!dataElm; break;
            case "template":    opts['template'] = dataElm.toString(); break;
        }
    }
    return { cols,opts };
}

export function parseCol(fileData:FileData,name:string,data:string){
    const opts = parse(data);
    switch(opts.type){
        case "number":
        case "text":
        case "check":
        case "link":
        case "date":
        case "time":
        case "datetime":
        case "color":    return new ResourceColString(name, opts.label, opts.type, opts);
        case "resource": return setResourceCol(name, opts.label, opts.resource??'', opts.on, opts);
        case "value":    return new ResourceColValue(name, opts.label, opts.value, opts);
        case "type":     return setResourceType(name, opts.label, opts.value??'', opts, fileData);
    }
}
function setResourceCol(name:string, label:string, resourceVal:string, on:OprType, opts:ResourceColResourceType){
    const resource = getResource(resourceVal);
    return new ResourceColResource(name, label, resource, on, opts);
}
function setResourceType(name:string, label:string, typeVal:string, opts:ResourceColDefTypeType, fileData:FileData){
    const typeData = getType(fileData,typeVal);
    if(!typeData) return null;
    return new ResourceColDefType(name, label, typeData, opts);
}

/*/===/*/

export function getResource(name:string){
    return resources[name]??null;
}
export function getResources(){
    return resources;
}

/*/===/*/

export function getType(data:FileData,type:string):TypeData|null{
    if(!data.meta || !data.meta.frontmatter || !data.meta.frontmatter['nova-type'] || !type || !data.meta.frontmatter['nova-type'][type]) return null;
    const typeData = data.meta.frontmatter['nova-type'][type];
    const typeObj = new TypeData(type);
    for(const dataKey in typeData){
        const parsedTypeData = parseType(typeData[dataKey]);
        typeObj.addElm(new TypeDataElm(dataKey,parsedTypeData.label,parsedTypeData.props));
    }
    return typeObj;
}
export function getTypes(data:FileData):{ [key:string]:TypeData }{
    if(!data.meta || !data.meta.frontmatter || !data.meta.frontmatter['nova-type']) return {};
    const typeElms:{ [key:string]:TypeData } = {};
    for(const type of data.meta.frontmatter['nova-type']){ const res = getType(data,type); if(res) typeElms[type] = res; }
    return typeElms;
}

/*/===/*/

export const createResourceOnFile = (nova:NovaNotePlugin,file:TFile|null)=>{
    //
}
export const createResourceItem = (nova:NovaNotePlugin,file?:TFile|null)=>{
    if(file==null) file = nova.app.workspace.getActiveFile();
    const resourceList = new ResourceListModal(nova.app,(resource)=>{
        const resourceForm = new ResourceEditableModal(nova,resource,file as TFile);
        resourceForm.open();
    });
    resourceList.open();
}
