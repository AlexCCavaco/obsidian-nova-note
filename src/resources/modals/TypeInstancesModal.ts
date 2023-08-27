import { SuggestModal, TFile } from "obsidian";
import type NovaNotePlugin from "src/main";
import type TypeData from "src/data/TypeData";
import type TypeDataElm from "src/data/TypeDataElm";

export default class extends SuggestModal<TypeDataElm> {

    nova: NovaNotePlugin;
    type: TypeData;
    file: TFile;
    cb:(type:TypeDataElm)=>void;

    constructor(nova:NovaNotePlugin,type:TypeData,file:TFile,cb:(item:TypeDataElm)=>void){
        super(nova.app);
        this.nova = nova;
        this.cb = cb;
        this.type = type;
        this.file = file;
    }

    async getSuggestions(query: string): Promise<(TypeDataElm)[]> {
        return this.type.list();
    }
    
    renderSuggestion(value: TypeDataElm, el: HTMLElement){
        let propStr = '';
        for(const key in value.props) propStr += (propStr===''?'':', ') + key+': '+value.props.toString();
        el.createEl("div", { text: value.label });
        el.createEl("small", { text: propStr });
    }

    onChooseSuggestion(item: TypeDataElm, evt: MouseEvent | KeyboardEvent) {
        if(this.cb) this.cb(item);
    }

}
