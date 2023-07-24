import { Modal, Setting, TFile, TextComponent, ValueComponent } from "obsidian";
import type Resource from "../Resource";
import type { RESOURCE_COL_DEFTYPE, RESOURCE_COL_RESOURCE, RESOURCE_COL_STRING, RESOURCE_COL_TYPE } from "../parser";
import ResourceInstancesModal, { isInstanceResourceCreator } from "./ResourceInstancesModal";
import type NovaNotePlugin from "src/main";
import DataValue from "./components/DataValue.svelte";
import { getResource } from "..";
import TypeInstancesModal from "./TypeInstancesModal";
import { getId } from "src/handlers/idHandler";
import type { BlockDataElm } from "src/blocks/NovaBlock";
import { getFileData } from "src/handlers/dataLoader";

export default class ResouceEditableModal extends Modal {

    data: {[key:string]:any};
    resource: Resource;
    nova:NovaNotePlugin;
    cb?: (data:BlockDataElm)=>void;
    parent:TFile;
    file?:TFile;

    constructor(nova:NovaNotePlugin,resource:Resource,parent:TFile,cb?:ResouceEditableModal['cb'],file?:TFile){
        super(app);
        this.nova = nova;
        this.resource = resource;
        this.data = {};
        this.cb = cb;
        this.file = file;
        this.parent = parent;
    }

    onOpen(): void {
        const contentEl = this.contentEl;
        contentEl.createEl("h1", { text: `Resource ${this.resource.name}` });
        for(const key in this.resource.cols){
            const col = this.resource.cols[key];
            if(!col.input) continue;
            if(col.type==='resource') this.addResourceInput(key,col as RESOURCE_COL_RESOURCE);
            else if(col.type==='type') this.addTypeInput(key,col as RESOURCE_COL_DEFTYPE);
            else this.addInput(key,col as RESOURCE_COL_STRING);
        }

        new Setting(contentEl).addButton(btn=>btn.setButtonText("Save").setCta().onClick(this.save.bind(this)));
    }

    onClose() {
        this.contentEl.empty();
    }

    async save(){
        if(!this.file){
            const curBlock = { file:this.parent,meta:this.nova.app.metadataCache.getFileCache(this.parent) };
            const block = !this.resource.file ? { ...curBlock,data:{} } : { file:this.resource.file,meta:this.nova.app.metadataCache.getFileCache(this.resource.file),data:this.data };
            const path = await this.resource.genPath(block,curBlock);
            const name = await this.resource.genFileName(block,curBlock);
            this.file = await this.nova.app.vault.create(path + '/' + name + '.md','');
        }
        this.nova.app.fileManager.processFrontMatter(this.file,(fm)=>{
            for(const key in this.data) fm[key] = this.data[key];
        });
        const block = Object.assign({},getFileData(this.nova, this.file),{data:this.data});
        if(this.cb) this.cb(block);
        this.close();
    }

    addTypeInput(name:string,col:RESOURCE_COL_DEFTYPE){
        const set = new Setting(this.contentEl).setName(col.label).setDesc(describeColumn(col));
        const add = this.multiHandlerBase(name);
        if(col.value==null) return null;
        set.addButton(btn=>btn.setButtonText("Change").setCta().onClick(()=>{
            const modal = new TypeInstancesModal(this.nova,col.value as string,this.parent,(item)=>{
                if(col.multi) add(item.name);
                else { this.data[name] = item.name; }
            });
            modal.open();
        }));
    }
    addResourceInput(name:string,col:RESOURCE_COL_RESOURCE){
        const set = new Setting(this.contentEl).setName(col.label).setDesc(describeColumn(col));
        const add = this.multiHandlerBase(name);
        if(col.resource==null) return null;
        set.addButton(btn=>btn.setButtonText("Change").setCta().onClick(()=>{
            const modal = new ResourceInstancesModal(this.nova,col.resource as string,async (item)=>{
                const resource = getResource(col.resource as string);
                if(isInstanceResourceCreator(item)){
                    new ResouceEditableModal(this.nova,resource,this.parent,async (data)=>{
                        const id = await getId(this.nova,data);
                        if(col.multi) add(id);
                        else this.data[name] = id;
                    });
                } else {
                    const id = await getId(this.nova,item);
                    if(col.multi) add(id);
                    else this.data[name] = id;
                }
            });
            modal.open();
        }));
    }
    addInput(name:string,col:RESOURCE_COL_STRING){
        switch(col.type){
            case "number":      this.addText(name,col,value=>parseFloat(value)); break;
            case "text":        this.addText(name,col); break;
            case "check":       this.addToggleInput(name,col); break;
            case "link":        this.addText(name,col); break;
            case "date":        this.addDateTimeInput(name,col,'YYYY-mm-dd'); break;
            case "time":        this.addDateTimeInput(name,col,'HH:ii'); break;
            case "datetime":    this.addDateTimeInput(name,col,'YYYY-mm-dd HH:ii'); break;
            case "color":       this.addColorInput(name,col); break;
        }
    }

    addText(name:string,col:RESOURCE_COL_STRING,call?:(value:string)=>any|null){
        const set = new Setting(this.contentEl).setName(col.label).setDesc(describeColumn(col));
        if(col.multi) this.multiHandler(name,col,set,(set,cb)=>set.addText(cb),call);
        else set.addText((text)=>text.onChange((value)=>{ if(call) value=call(value); this.data[name] = value; }));
    }
    addColorInput(name:string,col:RESOURCE_COL_STRING){
        const set = new Setting(this.contentEl).setName(col.label).setDesc(describeColumn(col));
        if(col.multi) this.multiHandler(name,col,set,(set,cb)=>set.addColorPicker(cb));
        else set.addColorPicker((text)=>text.onChange((value)=>{ this.data[name] = value; }));
    }
    addToggleInput(name:string,col:RESOURCE_COL_STRING){
        const set = new Setting(this.contentEl).setName(col.label).setDesc(describeColumn(col));
        if(col.multi) this.multiHandler(name,col,set,(set,cb)=>set.addToggle(cb),val=>!!val);
        else set.addToggle((text)=>text.onChange((value)=>{ this.data[name] = !!value; }));
    }
    addDateTimeInput(name:string,col:RESOURCE_COL_STRING,format:string){
        const set = new Setting(this.contentEl).setName(col.label).setDesc(describeColumn(col));
        if(col.multi) this.multiHandler(name,col,set,(set,cb)=>set.addColorPicker(cb));
        else set.addMomentFormat((text)=>text.setDefaultFormat(format).onChange((value)=>{ this.data[name] = value; }));
    }
    
    multiHandlerBase(name:string){
        this.data[name] = [];
        const dataEl = this.contentEl.createEl('div');
        return (value:string)=>{
            const el = dataEl.createEl('div'); this.data[name].push(value);
            el.style.display = 'inline-block';
            const onRemove = ()=>{ const i = this.data[name].indexOf(value); if(i) this.data[name].splice(i,1); el.remove(); }
            new DataValue({
                target: el,
                props: { value, onRemove }
            });
        };
    }
    multiHandler<Comp extends ValueComponent<any>>(name:string,col:RESOURCE_COL_STRING,set:Setting,addCall:(set:Setting,cb:(comp:Comp)=>any)=>void,formatCall?:(value:string)=>any|null){
        const add = this.multiHandlerBase(name);
        const addEvent = (ev:KeyboardEvent,text:Comp)=>{
            const key = ev.key.toLowerCase();
            let val = text.getValue();
            if(formatCall) val = formatCall(val);
            if(key==='enter' || key==='tab'){ add(val); text.setValue(''); }
        };
        const submitEvent = (ev:MouseEvent,text:Comp)=>{
            let val = text.getValue();
            if(formatCall) val = formatCall(val);
            add(val); text.setValue('');
        };
        let elm:Comp|null = null;
        addCall(set,text=>{ elm=text; if(text instanceof TextComponent) text.inputEl.addEventListener('keydown',ev=>addEvent(ev,text)); });
        set.addButton((but)=>{ but.setIcon('plus').onClick(ev=>elm?submitEvent(ev,elm):null); });
    }

}

function describeColumn(col:Exclude<RESOURCE_COL_TYPE,{input:false}>){
    const multi = col.multi ? 'Multiple • ' : '';
    const required = col.required ? ' • Required' : '';
    switch(col.type){
        case "number":  return multi + "Number" + required;
        case "resource":return multi + "Resource • " + col.resource + required;
        case "text":    return multi + "Text" + required;
        case "check":   return multi + "Check" + required;
        case "link":    return multi + "Link" + required;
        case "date":    return multi + "Date" + required;
        case "time":    return multi + "Time" + required;
        case "datetime":return multi + "Date and Time" + required;
        case "color":   return multi + "Color" + required;
        case "type":    return multi + "Type • " + col.value + required;
    }
}
