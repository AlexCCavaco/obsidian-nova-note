import type Nova from "src/Nova";
import type ResourceItem from "src/resources/ResourceItem";
import type { TFile } from "obsidian";
import NovaSuggestModal from "./NovaSuggestModal";

export default class extends NovaSuggestModal<ResourceItem> {
    
    file:TFile;

    constructor(nova:Nova,cb:(data:ResourceItem)=>void,fromFile:TFile){
        super(nova,cb);
        this.file = fromFile;
    }

    async getSuggestions(query: string):Promise<ResourceItem[]>{
        const items = this.nova.resources.getResourceItemsFromFile(this.file);
        return items.filter(res=>((res.resource.name+' '+res.file.path).toLowerCase().includes(query.toLowerCase())));
    }
    
    async renderSuggestion(item: ResourceItem, el: HTMLElement) {
        const hd = el.createEl("div", {});
        /*/*/ hd.createEl("b", { text: item.resource.name + ' ' });
        /*/*/ hd.createEl("small", { text: '(' + await item.getIdOrGenerate() + ')' });
        if(item.file) el.createEl("small", { text: (item.file ? item.file.path : 'native') });
    }

}
