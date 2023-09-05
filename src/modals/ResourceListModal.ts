import { SuggestModal } from "obsidian";
import type Nova from "src/Nova.js";
import type Resource from "src/resources/Resource";

export default class extends SuggestModal<Resource> {

    nova:Nova;
    cb:(resource:Resource)=>void;

    constructor(nova:Nova,cb:(resource:Resource)=>void){
        super(nova.app);
        this.nova = nova;
        this.cb = cb;
    }

    getSuggestions(query: string):Resource[]|Promise<Resource[]>{
        return Object.values(this.nova.resources.getResources()).filter(res=>(
            !res.isHidden() && (
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
