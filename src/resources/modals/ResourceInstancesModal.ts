import { SuggestModal } from "obsidian";
import { loadFromResource } from "src/handlers/dataLoader";
import type NovaNotePlugin from "src/main";
import type { BlockDataElm } from "src/blocks/NovaBlock";

type InstanceResourceCreator = { name:string,desc:string };
export const isInstanceResourceCreator = (obj:BlockDataElm|InstanceResourceCreator):obj is InstanceResourceCreator=>{ return !obj.hasOwnProperty('file'); }

export default class extends SuggestModal<BlockDataElm|InstanceResourceCreator> {

    nova:NovaNotePlugin;
    resource:string;
    cb:(resource:BlockDataElm|InstanceResourceCreator)=>void;

    constructor(nova:NovaNotePlugin,resource:string,cb:(item:BlockDataElm|InstanceResourceCreator)=>void){
        super(nova.app);
        this.nova = nova;
        this.cb = cb;
        this.resource = resource;
    }

    async getSuggestions(query: string): Promise<(BlockDataElm|InstanceResourceCreator)[]> {
        const data = await loadFromResource(this.nova,this.resource,true);
        const display = data.filter(res=>(res.file.path).toLowerCase().includes(query.toLowerCase()));
        return [{ name:'➕ Create New '+this.resource,desc:'' },...display];
    }
    
    renderSuggestion(value: BlockDataElm|InstanceResourceCreator, el: HTMLElement){
        if(isInstanceResourceCreator(value)){
            el.createEl("div", { text: value.name });
            el.createEl("small", { text: value.desc });
        } else {
            el.createEl("div", { text: value.file.name });
            el.createEl("small", { text: value.file?.path });
        }
    }

    onChooseSuggestion(item: BlockDataElm|InstanceResourceCreator, evt: MouseEvent | KeyboardEvent) {
        if(this.cb) this.cb(item);
    }

}
