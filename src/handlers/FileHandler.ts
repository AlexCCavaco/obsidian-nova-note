import { type CachedMetadata, type TFile } from "obsidian";
import type NovaNotePlugin from "../main";
import ResourceListModal from "../resources/modals/ResourceListModal";
import { errorNotice } from "./NoticeHandler";
import ResourceEditableModal from "../resources/modals/ResourceEditableModal";
import { addId, removeId } from "./IdHandler";
import { addResources, deleteResources, updateResources } from "src/handlers/ResourceHandler";

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

/*/===/*/

export function openFileFromEvent(nova:NovaNotePlugin,ev:MouseEvent,file:TFile){
    // ONLY ALLOW LEFT AND MIDDLE CLICK
    if(ev.button>1) return;

    const workspace = nova.app.workspace;
    const button = ev.button;
    const ctrl = ev.ctrlKey;
    const alt = ev.altKey;

    if(alt){
        // ALT & LEFT CLICK => New Popup File
        if(button===0) workspace.openPopoutLeaf().openFile(file);
        // ALT & MIDDLE CLICK => Split Horizontally
        else workspace.getLeaf('split','horizontal').openFile(file);
        return;
    }
    if(ctrl){
        // CTRL & LEFT CLICK => Open in New Tab
        if(button===0) workspace.openLinkText(file.path,file.path,true);
        // CTRL & MIDDLE CLICK => Split Vertically
        else workspace.getLeaf('split','vertical').openFile(file);
        return;
    }
    // LEFT CLICK => Open on Focused
    if(button===0) workspace.getLeaf().openFile(file);
    // MIDDLE CLICK => Open in New Tab
    else workspace.openLinkText(file.path,file.path,true);
    return;
}
