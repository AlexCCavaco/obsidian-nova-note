import type NovaNotePlugin from "src/main";
import FileDataElm from "./FileDataElm";
import FileData from "./FileData";
import type { OprType } from "src/parser";
import type Resource from "src/resources/Resource";
import { errorNoticeMessage } from "src/handlers/NoticeHandler";
import { getResource } from "src/handlers/ResourceHandler";
import { assertFrontmatter, formData, processConditions } from "src/data/ConditionalData";
import type { BlockDataVal } from "src/blocks/NovaBlock";

let nova:NovaNotePlugin;

export function init(novaPlugin:NovaNotePlugin) {
    nova = novaPlugin;
}

async function forEachFile(nova:NovaNotePlugin,cb:(fileData:FileData,curData:FileData)=>Promise<FileDataElm|false>):Promise<FileDataElm[]>{
    const files = nova.app.vault.getMarkdownFiles();
    const cur   = FileData.getCurrent(nova);
    const data:FileDataElm[] = [];
    for(const file of files){
        const fileData = new FileData(nova,file);
        const res = await cb(fileData,cur);
        if(res!==false) data.push(res);
    }
    return data;
}

export async function loadFromTag(tag:string,on:OprType):Promise<FileDataElm[]>{
    return forEachFile(nova,async (fileData,curData)=>{
        const data = formData(fileData,assertFrontmatter(fileData));
        const meta = fileData.getMetadata();
        if(!(meta && meta.tags && meta.tags.some(t=>t.tag===tag))) return false;
        return await processConditions(data,curData,on) ? data : false;
    });
}

export async function loadFromResource(resource:Resource|string,on:OprType,thisData?:BlockDataVal):Promise<FileDataElm[]>{
    let resourceVal = '';
    if(typeof resource === 'string'){
        resourceVal = resource;
        resource = getResource(resourceVal);
    }
    if(!resource){
        errorNoticeMessage(`Resource ${resourceVal} not found`);
        return [];
    }
    return forEachFile(nova,async (fileData,curData)=>{
        const meta = fileData.getMetadata();
        if(!(meta && meta.frontmatter && meta.frontmatter['nova-use'])) return false;
        const data = formData(fileData,assertFrontmatter(fileData));
        const use:string|string[] = meta.frontmatter['nova-use'];
        const resources:string[] = Array.isArray(use) ? use : use.split(',').map(u=>u.trim());
        if(!resources.includes(resourceVal)) return false;
        return await processConditions(data,curData,on,thisData??data.data) ? data : false;
    });
}

export async function loadFromAll(on:OprType):Promise<FileDataElm[]>{
    return forEachFile(nova,async (fileData,curData)=>{
        const data = formData(fileData,assertFrontmatter(fileData));
        return await processConditions(data,curData,on) ? data : false;
    });
}

export async function loadFromLocal(reference:string,on:OprType):Promise<FileDataElm[]>{
    //TODO load local
    return [];
}

export async function loadFromPath(path:string,on:OprType):Promise<FileDataElm[]>{
    //TODO load from path
    return [];
}
