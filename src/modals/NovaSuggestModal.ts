import { SuggestModal } from "obsidian";
import type Nova from "src/Nova";

export type NovaModalInput = HTMLInputElement & {
    errorElement: HTMLElement;
    errors: HTMLElement[];
}

export default abstract class<NovaModalVal> extends SuggestModal<NovaModalVal> {

    nova    :Nova;
    cb     ?:(data:NovaModalVal)=>void;

    constructor(nova:Nova,cb?:(data:NovaModalVal)=>void){
        super(nova.app);
        this.nova = nova;
        this.cb = cb??undefined;
    }

    setTitle(title:string){
        this.titleEl.textContent = title;
    }

    setExtended(){
        this.contentEl.parentElement?.classList.add('res-modal-extended');
    }
    
    onChooseSuggestion(item: NovaModalVal, evt: MouseEvent | KeyboardEvent) {
        if(this.cb) this.cb(item);
    }

}
