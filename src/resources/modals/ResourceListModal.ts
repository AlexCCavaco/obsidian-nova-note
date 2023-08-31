import { App, SuggestModal } from "obsidian";
import { getResources } from "../../handlers/ResourceHandler.js";
import type Resource from "../Resource";

export default class extends SuggestModal<Resource> {

    cb:(resource:Resource)=>void;

    constructor(app:App,cb:(resource:Resource)=>void){
        super(app);
        this.cb = cb;
    }

    getSuggestions(query: string):Resource[]|Promise<Resource[]>{
        return Object.values(getResources()).filter(res=>(
            !res.isHidden() && (
                !query || query==='' ||
                (res.name).toLowerCase().includes(query.toLowerCase())
            )
        ));
    }
    
    renderSuggestion(value: Resource, el: HTMLElement) {
        el.createEl("div", { text: value.name });
        el.createEl("small", { text: (value.file ? value.file.path : 'native') });
    }

    onChooseSuggestion(item: Resource, evt: MouseEvent | KeyboardEvent) {
        if(this.cb) this.cb(item);
    }

}
