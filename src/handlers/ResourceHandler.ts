import { type TFile } from "obsidian";
import Resource, { type ResourceOpts } from "../resources/Resource";
import type NovaNotePlugin from "src/main";
import { errorNoticeMessage } from "./NoticeHandler";
import ResourceCol from "../resources/ResourceCol";
import { parseExpression, type OprType } from "src/parser";
import FileData from "../data/FileData";
import TaskResource from "../resources/TaskResource";
import ResourceColString from "../resources/ResourceColString";
import ResourceColValue from "../resources/ResourceColValue";
import ResourceColResource, { type ResourceColResourceType } from "../resources/ResourceColResource";
import type { ResourceColDefTypeType } from "../resources/ResourceColDefType";
import ResourceColDefType from "../resources/ResourceColDefType";
import parse from "../resources/parser";
import { getType } from "./TypeHandler";
import { loadFile } from "./FileHandler";

export type ResourceList = { [key:string]:{ [key:string]:string } };
export const resources:{ [key:string]:Resource } = {};
export let count = 0;

export function addResource(key:string,resource:Resource){
    if(!resources[key]) console.info(`Loaded Resource "${key}"`);
    else console.info(`Reloaded Resource "${key}"`);
    resources[key] = resource;
    count++;
}

export function loadResources(nova:NovaNotePlugin){
    addResource('task',new TaskResource(nova));
    for(const file of nova.app.vault.getMarkdownFiles()) loadFile(nova,file);
    console.info(`Loaded ${count} Resources`);
}

export function addResources(nova:NovaNotePlugin,resourcesData:ResourceList,file:TFile){
    const keys = Object.keys(resourcesData);
    for(const key of keys){
        const data = resourcesData[key];
        if(!resources[key]) count++;
        else errorNoticeMessage(`Duplicated Resource ${key}, Unexpected Behaviour will occur, please rename one of the Resources`);
        resources[key] = new Resource(nova,key,file,data);
    }
}

export function updateResources(nova:NovaNotePlugin,resourcesData:ResourceList,file:TFile){
    const keys = Object.keys(resourcesData);
    for(const key of keys){
        const data = resourcesData[key];
        if(!resources[key]){
            count++;
            resources[key] = new Resource(nova,key,file,data);
        } else {
            resources[key].updateProperties(data);
        }
    }
}

export function deleteResources(resourcesData:ResourceList,file:TFile){
    const keys = Object.keys(resourcesData);
    for(const key of keys){ if(resources[key]) delete resources[key]; }
}

export function handleResourceCols(file?:TFile,data?:{[key:string]:unknown}):{ cols:{[key:string]:ResourceCol},opts:ResourceOpts }{
    if(!data) data = {};
    const colKeys = Object.keys(data);
    const opts:ResourceOpts = {};
    const cols:{[key:string]:ResourceCol} = {};
    for(const colKey of colKeys){
        const dataElm = data[colKey];
        if(dataElm==null) continue;
        if(colKey[0]!=='$'){
            const col = parseCol(colKey,dataElm.toString(),file?new FileData(this.nova,file):undefined);
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
            case "hidden":      opts['hidden']   = !!dataElm; break;
            case "template":    opts['template'] = dataElm.toString(); break;
        }
    }
    return { cols,opts };
}

export function parseCol(name:string,data:string,fileData?:FileData){
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
        case "type":     return !fileData ? null : setResourceType(name, opts.label, opts.value??'', opts, fileData);
    }
}
function setResourceCol(name:string, label:string, resourceVal:string, on:OprType, opts:ResourceColResourceType){
    const resource = getResource(resourceVal);
    if(!resource) throw new Error(`Resource ${resourceVal} doesn't exit`);
    return new ResourceColResource(name, label, resource, on, opts);
}
function setResourceType(name:string, label:string, typeVal:string, opts:ResourceColDefTypeType, fileData:FileData){
    const typeData = getType(fileData,typeVal);
    if(!typeData) throw new Error(`Type ${typeVal} doesn't exit`);
    return new ResourceColDefType(name, label, typeData, opts);
}

/*/===/*/

export function getResource(name:string){
    return resources[name]??null;
}
export function getResources(){
    return resources;
}
