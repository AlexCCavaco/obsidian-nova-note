import type Nova from "src/Nova";
import Resource from "src/resources/Resource";
import TaskResource from "src/resources/TaskResource";
import NovaController from "./NovaController";
import ResourceColDefType, { type ResourceColDefTypeType } from "src/resources/ResourceColDefType";
import ResourceColResource, { type ResourceColResourceType } from "src/resources/ResourceColResource";
import { parseExpression, type OprType } from "src/parser";
import FileData from "src/data/FileData";
import ResourceColValue from "src/resources/ResourceColValue";
import ResourceColString from "src/resources/ResourceColString";
import type { ResourceOpts } from "src/resources/Resource";
import type ResourceCol from "src/resources/ResourceCol";
import ErrorNotice from "src/notices/ErrorNotice";
import parse from "../resources/parser";

export type ResourceList = { [key:string]:{ [key:string]:string } };

export default class extends NovaController {

    resources:  { [key:string]:Resource };

    constructor(nova:Nova){
        super(nova);
        this.resources = {};
    }

    getCount(){
        return Object.keys(this.resources).length;
    }

    hasResource(resourceName:string){
        resourceName = resourceName.toLowerCase();
        return !!this.resources[resourceName];

    }

    addResource(key:string,resource:Resource){
        if(!this.resources[key]) console.info(`Loaded Resource "${key}"`);
        else console.info(`Reloaded Resource "${key}"`);
        this.resources[key] = resource;
    }
    
    addResources(resourcesData:ResourceList,file:FileData){
        const keys = Object.keys(resourcesData);
        for(const key of keys){
            const data = resourcesData[key];
            if(this.resources[key]) new ErrorNotice(`Duplicated Resource ${key}, Unexpected Behaviour will occur, please rename one of the Resources`);
            this.resources[key] = new Resource(this.nova,key,file,data);
        }
    }

    loadResources(){
        this.addResource('task',new TaskResource(this.nova));
        for(const file of this.nova.vault.getMarkdownFiles()) this.nova.files.loadFile(file);
        console.info(`Loaded ${this.getCount()} Resources`);
    }

    updateResources(resourcesData:ResourceList,file:FileData){
        const keys = Object.keys(resourcesData);
        for(const key of keys){
            const data = resourcesData[key];
            if(!this.resources[key]){
                this.resources[key] = new Resource(this.nova,key,file,data);
            } else {
                this.resources[key].updateProperties(data);
            }
        }
    }

    deleteResources(resourcesData:ResourceList,file:FileData){
        const keys = Object.keys(resourcesData);
        for(const key of keys){ if(this.resources[key]) delete this.resources[key]; }
    }

    handleResourceCols(file?:FileData,data?:{[key:string]:unknown}):{ cols:{[key:string]:ResourceCol},opts:ResourceOpts }{
        if(!data) data = {};
        const colKeys = Object.keys(data);
        const opts:ResourceOpts = {};
        const cols:{[key:string]:ResourceCol} = {};
        for(const colKey of colKeys){
            const dataElm = data[colKey];
            if(dataElm==null) continue;
            if(colKey[0]!=='$'){
                const col = this.parseCol(colKey,dataElm.toString(),file??undefined);
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

    parseCol(name:string,data:string,fileData?:FileData){
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
            case "resource": return this.setResourceCol(name, opts.label, opts.resource??'', opts.on, opts);
            case "value":    return new ResourceColValue(name, opts.label, opts.value, opts);
            case "type":     return !fileData ? null : this.setResourceType(name, opts.label, opts.value??'', opts, fileData);
        }
    }

    private setResourceCol(name:string, label:string, resourceVal:string, on:OprType, opts:ResourceColResourceType){
        const resource = this.getResource(resourceVal);
        if(!resource) throw new Error(`Resource ${resourceVal} doesn't exit`);
        return new ResourceColResource(name, label, resource, on, opts);
    }
    private setResourceType(name:string, label:string, typeVal:string, opts:ResourceColDefTypeType, fileData:FileData){
        const typeData = this.nova.types.getType(fileData,typeVal);
        if(!typeData) throw new Error(`Type ${typeVal} doesn't exit`);
        return new ResourceColDefType(name, label, typeData, opts);
    }

    getResource(name:string){
        return this.resources[name]??null;
    }
    getResources(){
        return this.resources;
    }

}
