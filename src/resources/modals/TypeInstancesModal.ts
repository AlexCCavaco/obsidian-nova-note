import { SuggestModal, TFile } from "obsidian";
import { getFileData } from "src/handlers/dataLoader";
import type NovaNotePlugin from "src/main";
import type { TypeData } from "../parser";
import { getType } from "..";

export default class extends SuggestModal<TypeData> {

    nova:NovaNotePlugin;
    type:string;
    file:TFile;
    cb:(type:TypeData)=>void;

    constructor(nova:NovaNotePlugin,type:string,file:TFile,cb:(item:TypeData)=>void){
        super(nova.app);
        this.nova = nova;
        this.cb = cb;
        this.type = type;
        this.file = file;
    }

    async getSuggestions(query: string): Promise<(TypeData)[]> {
        const block = getFileData(this.nova,this.file);
        const data = await getType(block,this.type);
        return !data ? [] : data.filter(res=>(res.label).toLowerCase().includes(query.toLowerCase()));
    }
    
    renderSuggestion(value: TypeData, el: HTMLElement){
        let propStr = '';
        for(const key in value.props) propStr += (propStr===''?'':', ') + key+': '+value.props.toString();
        el.createEl("div", { text: value.label });
        el.createEl("small", { text: propStr });
    }

    onChooseSuggestion(item: TypeData, evt: MouseEvent | KeyboardEvent) {
        if(this.cb) this.cb(item);
    }

}
