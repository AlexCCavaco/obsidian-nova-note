import type Nova from "src/Nova";
import type ResourceItem from "src/resources/ResourceItem";
import type { TFile } from "obsidian";
import NovaSuggestModal from "./NovaSuggestModal";
import type Resource from "src/resources/Resource";

export default class extends NovaSuggestModal<ResourceItem> {
    
    getItems:()=>ResourceItem[];

    private constructor(nova:Nova,cb:(data:ResourceItem)=>void,dataGetter:()=>ResourceItem[]){
        super(nova,cb);
        this.getItems = dataGetter;
    }

    static fromFile(nova:Nova,fromFile:TFile,cb:(data:ResourceItem)=>void){
        return new this(nova,cb,()=>nova.resources.getResourceItemsFromFile(fromFile));
    }
    static fromResource(nova:Nova,fromResource:Resource,cb:(data:ResourceItem)=>void){
        return new this(nova,cb,()=>fromResource.getItems());
    }

    async getSuggestions(query: string):Promise<ResourceItem[]>{
        const items = this.getItems();
        return items.filter(res=>((res.resource.name+' '+res.file.path).toLowerCase().includes(query.toLowerCase())));
    }
    
    async renderSuggestion(item: ResourceItem, el: HTMLElement) {
        const hd = el.createEl("div", {});
        /*/*/ hd.createEl("b", { text: item.resource.name + ' ' });
        /*/*/ hd.createEl("small", { text: '<' + await item.getIdOrGenerate() + '>' });
        if(item.file) el.createEl("small", { text: (item.file ? item.file.path : 'native') });
    }

}
