import type { TFile } from "obsidian";
import { nanoid } from "nanoid";
import type NovaNotePlugin from "src/main";
import type FileData from "src/data/FileData";

const files:{[key:string]:TFile} = {};

export function createValidId(){
    let id:string;
    do {
        id = nanoid(27);
    } while(existsId(id));
    return id;
}

export function getFileById(id:string){
    return files[id]??null;
}

export function existsId(id:string){
    return !!files[id];
}

export function addId(id:string,file:TFile){
    files[id] = file;
}

export function removeId(id:string){
    if(files[id]) delete files[id];
}

export async function getIdOrGenerate(nova:NovaNotePlugin,fileData:FileData){
    if(fileData.meta&&fileData.meta.frontmatter&&fileData.meta.frontmatter['nova-id']) return fileData.meta.frontmatter['nova-id'];
    return await generateId(nova,fileData.file);
}

export function getId(nova:NovaNotePlugin,fileData:FileData){
    if(fileData.meta&&fileData.meta.frontmatter&&fileData.meta.frontmatter['nova-id']) return fileData.meta.frontmatter['nova-id'];
    return null;
}

export async function generateId(nova:NovaNotePlugin,file:TFile){
    const id = createValidId();
    let old:string|null|undefined;
    await nova.app.fileManager.processFrontMatter(file,(fm)=>{ old = fm.id; fm.id = id; });
    if(old) removeId(old);
    addId(id,file);
    return id;
}
