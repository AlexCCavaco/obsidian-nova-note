import { Modal, Setting, TFile, TextComponent, ValueComponent } from "obsidian";
import type Resource from "../Resource";
import ResourceInstancesModal, { isInstanceResourceCreator } from "./ResourceInstancesModal";
import type NovaNotePlugin from "src/main";
import DataValue from "./components/DataValue.svelte";
import TypeInstancesModal from "./TypeInstancesModal";
import { getIdOrGenerate } from "src/data/IdHandler";
import ResourceColResource from "../ResourceColResource";
import ResourceColDefType from "../ResourceColDefType";
import ResourceColString from "../ResourceColString";
import type ResourceCol from "../ResourceCol";
import FileDataElm, { FileDataElmFromFileData } from "src/data/FileDataElm";
import FileData from "src/data/FileData";

export default class ResouceEditableModal extends Modal {

    data: {[key:string]:any};
    resource: Resource;
    nova:NovaNotePlugin;
    cb?: (data:FileDataElm)=>void;
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
            if(col instanceof ResourceColResource) this.addResourceInput(key,col);
            else if(col instanceof ResourceColDefType) this.addTypeInput(key,col);
            else this.addInput(key,col as ResourceColString);
        }

        new Setting(contentEl).addButton(btn=>btn.setButtonText("Save").setCta().onClick(this.save.bind(this)));
    }

    onClose() {
        this.contentEl.empty();
    }

    async save(){
        if(!this.file){
            const curBlock = new FileData(this.nova,this.parent);
            const block = !this.resource.file ? FileDataElmFromFileData(curBlock,{}) : new FileDataElm(this.nova,this.resource.file,this.data);
            const path = await this.resource.genPath(block,curBlock);
            const name = await this.resource.genFileName(block,curBlock);
            this.file = await this.nova.app.vault.create(path + '/' + name + '.md','');
        }
        this.nova.app.fileManager.processFrontMatter(this.file,(fm)=>{
            for(const key in this.data) fm[key] = this.data[key];
        });
        const block = new FileDataElm(this.nova, this.file,this.data);
        if(this.cb) this.cb(block);
        this.close();
    }

    addTypeInput(name:string,col:ResourceColDefType){
        const set = new Setting(this.contentEl).setName(col.label).setDesc(describeColumn(col));
        const add = this.multiHandlerBase(name);
        if(col.type==null) return null;
        set.addButton(btn=>btn.setButtonText("Change").setCta().onClick(()=>{
            const modal = new TypeInstancesModal(this.nova,col.type,this.parent,(item)=>{
                if(col.multi) add(item.name);
                else { this.data[name] = item.name; }
            });
            modal.open();
        }));
    }
    addResourceInput(name:string,col:ResourceColResource){
        const set = new Setting(this.contentEl).setName(col.label).setDesc(describeColumn(col));
        const add = this.multiHandlerBase(name);
        if(col.resource==null) return null;
        set.addButton(btn=>btn.setButtonText("Change").setCta().onClick(()=>{
            const modal = new ResourceInstancesModal(this.nova,col.resource,async (item)=>{
                if(isInstanceResourceCreator(item)){
                    new ResouceEditableModal(this.nova,col.resource,this.parent,async (data)=>{
                        const id = await getIdOrGenerate(this.nova,data);
                        if(col.multi) add(id);
                        else this.data[name] = id;
                    });
                } else {
                    const id = await getIdOrGenerate(this.nova,item);
                    if(col.multi) add(id);
                    else this.data[name] = id;
                }
            });
            modal.open();
        }));
    }
    addInput(name:string,col:ResourceColString){
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

    addText(name:string,col:ResourceColString,call?:(value:string)=>any|null){
        const set = new Setting(this.contentEl).setName(col.label).setDesc(describeColumn(col));
        if(col.multi) this.multiHandler(name,col,set,(set,cb)=>set.addText(cb),call);
        else set.addText((text)=>text.onChange((value)=>{ if(call) value=call(value); this.data[name] = value; }));
    }
    addColorInput(name:string,col:ResourceColString){
        const set = new Setting(this.contentEl).setName(col.label).setDesc(describeColumn(col));
        if(col.multi) this.multiHandler(name,col,set,(set,cb)=>set.addColorPicker(cb));
        else set.addColorPicker((text)=>text.onChange((value)=>{ this.data[name] = value; }));
    }
    addToggleInput(name:string,col:ResourceColString){
        const set = new Setting(this.contentEl).setName(col.label).setDesc(describeColumn(col));
        if(col.multi) this.multiHandler(name,col,set,(set,cb)=>set.addToggle(cb),val=>!!val);
        else set.addToggle((text)=>text.onChange((value)=>{ this.data[name] = !!value; }));
    }
    addDateTimeInput(name:string,col:ResourceColString,format:string){
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
    multiHandler<Comp extends ValueComponent<any>>(name:string,col:ResourceColString,set:Setting,addCall:(set:Setting,cb:(comp:Comp)=>any)=>void,formatCall?:(value:string)=>any|null){
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

function describeColumn(col:Exclude<ResourceCol,{input:false}>):string{
    const multi = col.multi ? 'Multiple • ' : '';
    const required = col.required ? ' • Required' : '';
    if(col instanceof ResourceColResource) return multi + "Resource • " + col.resource.name + required;
    if(col instanceof ResourceColDefType) return multi + "Type • " + col.type.name + required;
    if(col instanceof ResourceColString) switch(col.type){
        case "number":  return multi + "Number" + required;
        case "text":    return multi + "Text" + required;
        case "check":   return multi + "Check" + required;
        case "link":    return multi + "Link" + required;
        case "date":    return multi + "Date" + required;
        case "time":    return multi + "Time" + required;
        case "datetime":return multi + "Date and Time" + required;
        case "color":   return multi + "Color" + required;
    }
    return '';
}
