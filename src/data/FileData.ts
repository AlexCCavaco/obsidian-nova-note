import { TFile, type CachedMetadata } from "obsidian";
import type Nova from "src/Nova";

export default class FileData {

    nova: Nova;
    file: TFile;
    meta: CachedMetadata|null;

    constructor(nova:Nova,file:TFile,meta?:CachedMetadata){
        this.nova = nova;
        this.file = file;
        this.meta = meta ?? null;
    }

    static getCurrent(nova:Nova){
        const curFile = nova.app.workspace.getActiveFile();
        if(!curFile) throw new Error(`No Opened File Found`);
        return new this(nova,curFile);
    }

    getMetadata(){
        if(!this.meta) this.meta = this.nova.app.metadataCache.getFileCache(this.file) ?? null;
        return this.meta;
    }

    getFrontmatter(){
        return (this.getMetadata()??{}).frontmatter;
    }

    assertFrontmatter(){
        return (this.meta ? this.meta.frontmatter??{} : {});
    }

}
