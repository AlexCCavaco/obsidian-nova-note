import { SuggestModal, TFile } from "obsidian";
import type Nova from "src/Nova.js";

export default class extends SuggestModal<TFile> {

    nova:Nova;
    cb:(file:TFile)=>void;

    constructor(nova:Nova,cb:(file:TFile)=>void){
        super(nova.app);
        this.nova = nova;
        this.cb = cb;
    }

    getSuggestions(query: string):TFile[]|Promise<TFile[]>{
        return Object.values(this.nova.vault.getFiles()).filter(res=>(
            (res.basename).toLowerCase().includes(query.toLowerCase())
        ));
    }
    
    renderSuggestion(file: TFile, el: HTMLElement) {
        el.createEl("div", { text: file.basename });
        el.createEl("small", { text: (file.path ? file.path : 'native') });
    }

    onChooseSuggestion(item: TFile, evt: MouseEvent | KeyboardEvent) {
        if(this.cb) this.cb(item);
    }

}
