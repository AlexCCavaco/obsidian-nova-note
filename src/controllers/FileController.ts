import type Nova from "src/Nova";
import NovaController from "./NovaController";
import { TFile, type CachedMetadata } from "obsidian";
import ErrorNotice from "src/notices/ErrorNotice";
import { nanoid } from "nanoid";
import FileData from "src/data/FileData";
import ResourceBasicInputModal from "src/modals/ResourceBasicInputModal";
import ResourceEditorModal from "src/modals/ResourceEditorModal";
import Resource, { type ResourceOpts } from "src/resources/Resource";
import ResourceColResource from "src/resources/ResourceColResource";
import type ResourceCol from "src/resources/ResourceCol";
import ResourceColDefType from "src/resources/ResourceColDefType";
import ResourceColValue from "src/resources/ResourceColValue";
import ResourceColString from "src/resources/ResourceColString";

export default class extends NovaController {

    identified: {[key:string]:FileData};

    constructor(nova:Nova){
        super(nova);
        this.identified = {};
    }

    getFile(file:string|TFile){
        if(typeof file !== 'string') return file;
        for(const iFile of this.nova.vault.getFiles()){
            if(iFile.path===file) return iFile;
        }
        return null;
    }

    getFileData(file:TFile|FileData){
        return file instanceof FileData ? file : new FileData(this.nova,file);
    }

    loadFile(file:TFile|FileData){
        const fileData = this.getFileData(file);
        const meta = fileData.getMetadata();
        if(!meta || !meta.frontmatter) return;
        if(meta.frontmatter['nova-data']) try {
            this.nova.resources.addResources(meta.frontmatter['nova-data'],fileData);
        } catch(err){
            ErrorNotice.error(err,`${fileData.file.path}: `);
        }
        if(meta.frontmatter['id']) this.addId(meta.frontmatter['id'],fileData);
    }

    fileChanged(file:TFile|FileData, data:string, meta:CachedMetadata){
        const fileData = this.getFileData(file);
        if(!meta || !meta.frontmatter) return;
        if(meta.frontmatter['nova-data']) this.nova.resources.updateResources(meta.frontmatter['nova-data'],fileData);
        if(meta.frontmatter['id']) this.addId(meta.frontmatter['id'],fileData);
        else this.removeId(meta.frontmatter['id']);
    }

    fileDeleted(file:TFile|FileData, prevMeta:CachedMetadata|null){
        const fileData = this.getFileData(file);
        if(!prevMeta || !prevMeta.frontmatter) return;
        if(prevMeta.frontmatter['nova-data']) this.nova.resources.deleteResources(prevMeta.frontmatter['nova-data'],fileData);
        if(prevMeta.frontmatter['id']) this.removeId(prevMeta.frontmatter['id']);
    }

    /*/===/*/

    createValidId(){
        let id:string;
        do {
            id = nanoid(27);
        } while(this.existsId(id));
        return id;
    }
    
    getFileById(id:string){
        return this.identified[id]??null;
    }
    
    existsId(id:string){
        return !!this.identified[id];
    }
    
    addId(id:string,file:FileData){
        this.identified[id] = file;
    }
    
    removeId(id:string){
        if(this.identified[id]) delete this.identified[id];
    }
    
    async getIdOrGenerate(fileData:FileData){
        if(fileData.meta&&fileData.meta.frontmatter&&fileData.meta.frontmatter['nova-id']) return fileData.meta.frontmatter['nova-id'];
        return await this.generateId(fileData);
    }
    
    getId(fileData:FileData){
        if(fileData.meta&&fileData.meta.frontmatter&&fileData.meta.frontmatter['nova-id']) return fileData.meta.frontmatter['nova-id'];
        return null;
    }
    
    async generateId(fileData:FileData){
        const id = this.createValidId();
        let old:string|null|undefined;
        await this.nova.app.fileManager.processFrontMatter(fileData.file,(fm)=>{ old = fm.id; fm.id = id; });
        if(old) this.removeId(old);
        this.addId(id,fileData);
        return id;
    }

    /*/===/*/

    createResourceOnFile(file:TFile|null){
        const nameInputModal = new ResourceBasicInputModal(this.nova,'Input the Name of the New Resource',(resourceName:string)=>{
            nameInputModal.close();
            const resEditorModal = new ResourceEditorModal(this.nova,resourceName,({rows,opts})=>{
                const fileData = file ? new FileData(this.nova,file) : null;
                const properties:Resource['properties'] = {};
                for(const key in opts){ properties['$'+key] = opts[key as keyof ResourceOpts]; }
                for(const key in rows){
                    const row = rows[key];
                    const baseOpts = { multi:row.multiple??false,required:row.required };
                    let col:ResourceCol;
                    switch(row.type.type){
                        case 'resource': col = ResourceColResource.makeRaw(row.name,row.name,row.type.resource,row.type.on,baseOpts); break;
                        case 'type': col = ResourceColDefType.makeRaw(row.name,row.name,row.type.value,baseOpts); break;
                        case 'value': col = ResourceColValue.makeRaw(row.name,row.name,row.type.value,baseOpts); break;
                        default: col = ResourceColString.makeRaw(row.name,row.name,row.type.type,baseOpts); break;
                    }
                    properties[col.name] = col;
                }
                const resource = new Resource(this.nova,resourceName,fileData,properties);
                this.nova.resources.addResource(resource.name,resource);
                resource.save();
            });
            resEditorModal.open();
        });
        nameInputModal.open();
    }
    editResourceOnFile(file:TFile|null){
        //
    }
    createResourceItem(file?:TFile|null){
        //if(file==null) file = this.nova.app.workspace.getActiveFile();
        //const resourceList = new ResourceListModal(this.nova.app,(resource)=>{
        //    const resourceForm = new ResourceEditableModal(this.nova,resource,file as TFile);
        //    resourceForm.open();
        //});
        //resourceList.open();
    }

    /*/===/*/

    openFileFromEvent(nova:Nova,ev:MouseEvent,file:TFile){
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

}
