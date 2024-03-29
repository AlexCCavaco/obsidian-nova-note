import type Nova from "src/Nova";
import NovaController from "./NovaController";
import FileData from "src/data/FileData";
import FileDataElm from "src/data/FileDataElm";
import type Resource from "src/resources/Resource";
import type { BlockDataVal } from "src/blocks/NovaBlock";
import ErrorNotice from "src/notices/ErrorNotice";
import type { OprType } from "src/parser";
import Operation from "src/controllers/Operation";
import type Expression from "src/data/Expression";

export default class extends NovaController {

    constructor(nova:Nova){
        super(nova);
    }

    private async forEachFile(cb:(fileData:FileData,curData:FileData)=>Promise<FileDataElm|false>):Promise<FileDataElm[]>{
        const files = this.nova.app.vault.getMarkdownFiles();
        const cur   = FileData.getCurrent(this.nova);
        const data:FileDataElm[] = [];
        for(const file of files){
            const fileData = new FileData(this.nova,file);
            const res = await cb(fileData,cur);
            if(res!==false) data.push(res);
        }
        return data;
    }
    
    async loadFromTag(tag:string,on:OprType|Expression):Promise<FileDataElm[]>{
        return this.forEachFile(async (fileData,curData)=>{
            const data = FileDataElm.fromFileData(fileData,fileData.assertFrontmatter());
            const meta = fileData.getMetadata();
            if(!(meta && meta.tags && meta.tags.some(t=>t.tag===tag))) return false;
            return await Operation.validate(data,curData,on) ? data : false;
        });
    }
    
    async loadFromResource(resource:Resource|string,on:OprType|Expression,thisData?:BlockDataVal):Promise<FileDataElm[]>{
        let resourceVal = '';
        if(typeof resource === 'string'){
            resourceVal = resource;
            resource = this.nova.resources.getResource(resourceVal);
        }
        if(!resource){
            new ErrorNotice(`Resource ${resourceVal} not found`);
            return [];
        }
        return this.forEachFile(async (fileData,curData)=>{
            const meta = fileData.getMetadata();
            if(!(meta && meta.frontmatter && meta.frontmatter['nova-use'])) return false;
            const data = FileDataElm.fromFileData(fileData,fileData.assertFrontmatter());
            const use:string|string[] = meta.frontmatter['nova-use'];
            const resources:string[] = Array.isArray(use) ? use : use.split(',').map(u=>u.trim());
            if(!resources.includes(resourceVal)) return false;
            return await Operation.validate(data,curData,on,thisData??data.data) ? data : false;
        });
    }
    
    async loadFromAll(on:OprType|Expression):Promise<FileDataElm[]>{
        return this.forEachFile(async (fileData,curData)=>{
            const data = FileDataElm.fromFileData(fileData,fileData.assertFrontmatter());
            return await Operation.validate(data,curData,on) ? data : false;
        });
    }
    
    async loadFromLocal(reference:string,on:OprType|Expression):Promise<FileDataElm[]>{
        //TODO load local
        return [];
    }
    
    async loadFromPath(path:string,on:OprType|Expression):Promise<FileDataElm[]>{
        //TODO load from path
        return [];
    }

}
