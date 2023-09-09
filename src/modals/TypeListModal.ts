import type Nova from "src/Nova.js";
import type FileData from "src/data/FileData";
import type TypeData from "src/data/TypeData";
import NovaSuggestModal from "./NovaSuggestModal";

export default class extends NovaSuggestModal<TypeData> {

    fileData    :FileData;
    types       :{[key:string]:TypeData};

    constructor(nova:Nova,fileData:FileData,cb:(type:TypeData)=>void){
        super(nova,cb);
        this.fileData = fileData;
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

}
