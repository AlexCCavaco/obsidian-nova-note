import { SuggestModal } from "obsidian";
import type Nova from "src/Nova.js";
import type FileData from "src/data/FileData";
import type TypeData from "src/data/TypeData";

export default class extends SuggestModal<TypeData> {

    nova        :Nova;
    fileData    :FileData;
    types       :{[key:string]:TypeData};
    cb          :(type:TypeData)=>void;

    constructor(nova:Nova,fileData:FileData,cb:(type:TypeData)=>void){
        super(nova.app);
        this.nova = nova;
        this.fileData = fileData;
        this.cb = cb;
        this.types = nova.types.getTypes(this.fileData);
    }

    getSuggestions(query: string):TypeData[]|Promise<TypeData[]>{
        return Object.values(this.types).filter(res=>(
            (res.name).toLowerCase().includes(query.toLowerCase())
        ));
    }
    
    renderSuggestion(type: TypeData, el: HTMLElement) {
        el.createEl("div", { text: type.name });
        el.createEl("small", { text: this.fileData.file.path });
    }

    onChooseSuggestion(item: TypeData, evt: MouseEvent | KeyboardEvent) {
        if(this.cb) this.cb(item);
    }

}
