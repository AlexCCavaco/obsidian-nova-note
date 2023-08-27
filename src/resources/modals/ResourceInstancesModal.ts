import { SuggestModal } from "obsidian";
import type NovaNotePlugin from "src/main";
import type FileDataElm from "src/data/FileDataElm";
import { loadFromResource } from "src/data/DataLoader";
import type Resource from "../Resource";

type InstanceResourceCreator = { name:string,desc:string };
export const isInstanceResourceCreator = (obj:FileDataElm|InstanceResourceCreator):obj is InstanceResourceCreator=>{ return !obj.hasOwnProperty('file'); }

export default class extends SuggestModal<FileDataElm|InstanceResourceCreator> {

    nova:NovaNotePlugin;
    resource:Resource;
    cb:(resource:FileDataElm|InstanceResourceCreator)=>void;

    constructor(nova:NovaNotePlugin,resource:Resource,cb:(item:FileDataElm|InstanceResourceCreator)=>void){
        super(nova.app);
        this.nova = nova;
        this.cb = cb;
        this.resource = resource;
    }

    async getSuggestions(query: string): Promise<(FileDataElm|InstanceResourceCreator)[]> {
        const data = await loadFromResource(this.resource,true);
        const display = data.filter(res=>(res.file.path).toLowerCase().includes(query.toLowerCase()));
        return [{ name:'➕ Create New '+this.resource,desc:'' },...display];
    }
    
    renderSuggestion(value: FileDataElm|InstanceResourceCreator, el: HTMLElement){
        if(isInstanceResourceCreator(value)){
            el.createEl("div", { text: value.name });
            el.createEl("small", { text: value.desc });
        } else {
            el.createEl("div", { text: value.file.name });
            el.createEl("small", { text: value.file?.path });
        }
    }

    onChooseSuggestion(item: FileDataElm|InstanceResourceCreator, evt: MouseEvent | KeyboardEvent) {
        if(this.cb) this.cb(item);
    }

}
