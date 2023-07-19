import type { CachedMetadata, TFile } from "obsidian";
import parse, { type RESOURCE_TYPE } from "./parser";
import Resource from "./Resource";
import type NovaNotePlugin from "src/main";
import TaskResource from "./TaskResource";

export type ResourceList = { [key:string]:{ [key:string]:string } };
export const resources:{ [key:string]:Resource } = {};
export let count = 0;

export function loadResources(nova:NovaNotePlugin){
    resources['task'] = new TaskResource();
    for(const file of nova.app.vault.getMarkdownFiles()){
        const meta = nova.app.metadataCache.getFileCache(file);
        if(meta && meta.frontmatter && meta.frontmatter['nova-data']) addResources(meta.frontmatter['nova-data'],file);
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
        const cols:RESOURCE_TYPE = {};
        const colKeys = Object.keys(data);
        for(const colKey of colKeys) cols[colKey] = parse(data[colKey]);
        if(!resources[key]) count++;
        else console.error(`Duplicated Resource ${key}, Unexpected Behaviour will occur, please rename one of the Resources`);
        resources[key] = new Resource(key,cols,file);
        console.info(`Loaded Resource "${key}"`);
    }
}

export function updateResources(resourcesData:ResourceList,file:TFile){
    const keys = Object.keys(resourcesData);
    for(const key of keys){
        const data = resourcesData[key];
        const cols:RESOURCE_TYPE = {};
        const colKeys = Object.keys(data);
        for(const colKey of colKeys) cols[colKey] = parse(data[colKey]);
        if(!resources[key]){
            count++;
            resources[key] = new Resource(key,cols,file);
        } else {
            resources[key].update(cols);
        }
    }
}

export function deleteResources(resourcesData:ResourceList,file:TFile){
    const keys = Object.keys(resourcesData);
    for(const key of keys){ if(resources[key]) delete resources[key]; }
}

/*/===/*/

export function getResource(name:string){
    return resources[name]??null;
}
export function getResources(){
    return resources;
}
