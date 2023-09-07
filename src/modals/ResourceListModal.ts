import { SuggestModal, TFile } from "obsidian";
import type Nova from "src/Nova.js";
import type Resource from "src/resources/Resource";

export default class extends SuggestModal<Resource> {

    nova:Nova;
    cb:(resource:Resource)=>void;
    file?:TFile;

    constructor(nova:Nova,cb:(resource:Resource)=>void,fromFile?:TFile){
        super(nova.app);
        this.nova = nova;
        this.cb = cb;
        this.file = fromFile;
    }

    getSuggestions(query: string):Resource[]|Promise<Resource[]>{
        const resources = this.file?this.nova.resources.getResourcesFromFile(this.file):this.nova.resources.getResources();
        return Object.values(resources).filter(res=>(
            !res.hidden && (
                !query || query==='' ||
                (res.name).toLowerCase().includes(query.toLowerCase())
            )
        ));
    }
    
    renderSuggestion(resource: Resource, el: HTMLElement) {
        el.createEl("div", { text: resource.name });
        if(resource.fileData) el.createEl("small", { text: (resource.fileData.file ? resource.fileData.file.path : 'native') });
    }

    onChooseSuggestion(item: Resource, evt: MouseEvent | KeyboardEvent) {
        if(this.cb) this.cb(item);
    }

}
