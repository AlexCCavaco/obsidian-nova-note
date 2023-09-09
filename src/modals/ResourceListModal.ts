import { TFile } from "obsidian";
import type Nova from "src/Nova.js";
import type Resource from "src/resources/Resource";
import NovaSuggestModal from "./NovaSuggestModal";

export default class extends NovaSuggestModal<Resource> {
    
    file?:TFile;

    constructor(nova:Nova,cb:(resource:Resource)=>void,fromFile?:TFile){
        super(nova,cb);
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

}
