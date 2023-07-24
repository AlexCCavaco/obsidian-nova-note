import { type CachedMetadata, type TFile } from "obsidian";
import parse, { parseType, type TypeData } from "./parser";
import Resource, { type ResourceOpts } from "./Resource";
import type NovaNotePlugin from "src/main";
import TaskResource from "./TaskResource";
import ResourceListModal from "./modals/ResourceListModal";
import { errorNotice, errorNoticeMessage } from "src/handlers/noticeHandler";
import ResourceEditableModal from "./modals/ResourceEditableModal";
import type { FileData } from "src/handlers/dataLoader";

export type ResourceList = { [key:string]:{ [key:string]:string } };
export const resources:{ [key:string]:Resource } = {};
/*/<>/*/ resources['task'] = new TaskResource();
export let count = 0;

export function loadResources(nova:NovaNotePlugin){
    return ()=>{
        for(const file of nova.app.vault.getMarkdownFiles()) loadResourceOfFile(nova,file);
        console.info(`Loaded ${count} Resources`);
    }
}
export function loadResourceOfFile(nova:NovaNotePlugin,file:TFile){
    const meta = nova.app.metadataCache.getFileCache(file);
    if(meta && meta.frontmatter && meta.frontmatter['nova-data']) try {
        addResources(meta.frontmatter['nova-data'],file);
    } catch(err){
        errorNotice(err,`${file.path}: `);
    }
}

export function fileChanged(file:TFile, data:string, meta:CachedMetadata){
    if(meta && meta.frontmatter && meta.frontmatter['nova-data']) updateResources(meta.frontmatter['nova-data'],file);
}

export function fileDeleted(file:TFile, prevMeta:CachedMetadata){
    if(prevMeta && prevMeta.frontmatter && prevMeta.frontmatter['nova-data']) deleteResources(prevMeta.frontmatter['nova-data'],file);
}

/*/===/*/

export function addResources(resourcesData:ResourceList,file:TFile){
    const keys = Object.keys(resourcesData);
    for(const key of keys){
        const data = resourcesData[key];
        const opts = handleResourceCols(data);
        if(!resources[key]) count++;
        else errorNoticeMessage(`Duplicated Resource ${key}, Unexpected Behaviour will occur, please rename one of the Resources`);
        resources[key] = new Resource(key,file,opts);
        console.info(`Loaded Resource "${key}"`);
    }
}

export function updateResources(resourcesData:ResourceList,file:TFile){
    const keys = Object.keys(resourcesData);
    for(const key of keys){
        const data = resourcesData[key];
        const opts = handleResourceCols(data);
        if(!resources[key]){
            count++;
            resources[key] = new Resource(key,file,opts);
        } else {
            resources[key].updateOpts(opts);
        }
    }
}

export function deleteResources(resourcesData:ResourceList,file:TFile){
    const keys = Object.keys(resourcesData);
    for(const key of keys){ if(resources[key]) delete resources[key]; }
}

function handleResourceCols(data:{[key:string]:string}):ResourceOpts{
    const colKeys = Object.keys(data);
    const opts:ResourceOpts = {}; opts.cols = {};
    if(data['$extend']) opts.extend = data['$extend'];
    if(data['$html'])   opts.html = data['$html'];
    for(const colKey of colKeys){ if(colKey[0]!=='$') opts.cols[colKey] = parse(data[colKey]);}
    return opts;
}

/*/===/*/

export function getResource(name:string){
    return resources[name]??null;
}
export function getResources(){
    return resources;
}

/*/===/*/

export function getType(data:FileData,type:string){
    if(!data.meta || !data.meta.frontmatter || !data.meta.frontmatter['nova-type'] || !type || !data.meta.frontmatter['nova-type'][type]) return null;
    const typeData = data.meta.frontmatter['nova-type'][type];
    const elms:TypeData[] = [];
    for(const dataKey in typeData) elms.push({ name:dataKey,...parseType(typeData[dataKey]) });
    return elms;
}
export function getTypes(data:FileData){
    if(!data.meta || !data.meta.frontmatter || !data.meta.frontmatter['nova-type']) return null;
    const typeElms:{ [key:string]:TypeData[] } = {};
    for(const type of data.meta.frontmatter['nova-type']){ const res = getType(data,type); if(res) typeElms[type] = res; }
    return typeElms;
}

/*/===/*/

export const createResourceOnFile = (nova:NovaNotePlugin,file:TFile|null)=>{
    //
}
export const addResourceToFile = (nova:NovaNotePlugin,file?:TFile|null)=>{
    if(file==null) file = nova.app.workspace.getActiveFile();
    const resourceList = new ResourceListModal(nova.app,(resource)=>{
        const resourceForm = new ResourceEditableModal(nova,resource,file as TFile);
        resourceForm.open();
    });
    resourceList.open();
}
