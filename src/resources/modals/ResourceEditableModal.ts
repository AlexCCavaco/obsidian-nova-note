import { App, Modal, Setting } from "obsidian";
import type Resource from "../Resource";
import type { RESOURCE_COL_RESOURCE, RESOURCE_COL_STRING } from "../parser";

export default class extends Modal {

    data: {[key:string]:any};
    resource: Resource;
    onSubmit: (result: string) => void;

    constructor(app:App,resource:Resource){
        super(app);
        this.resource = resource;
    }

    onOpen(): void {
        const contentEl = this.contentEl;
        contentEl.createEl("h1", { text: `Resource ${this.resource.name}` });
        for(const key in this.resource.cols){
            const col = this.resource.cols[key];
            if(!col.input) continue;
            //col.input/label/multi/type/col.required
            if(col.type!=='resource') this.addInput(key,col as RESOURCE_COL_STRING);
            else this.addResourceInput(key,col as RESOURCE_COL_RESOURCE);
        }

        new Setting(contentEl).addButton(btn=>btn.setButtonText("Save").setCta().onClick(this.save));
    }

    onClose() {
        this.contentEl.empty();
    }

    save(){
        //TODO
    }

    addResourceInput(name:string,col:RESOURCE_COL_RESOURCE){console.log(name,'resource',col);
        //TODO
    }
    addInput(name:string,col:RESOURCE_COL_STRING){console.log(name,col);
        switch(col.type){
            case "number":  this.addNumberInput(name,col); break;
            case "text":    this.addTextInput(name,col); break;
            case "select":
            case "multisel":
            case "list":
            case "check":
            case "link":    this.addTextInput(name,col); break;
            case "date":    this.addTextInput(name,col); break;
            case "time":    this.addTextInput(name,col); break;
            case "datetime":this.addTextInput(name,col); break;
            case "color":   this.addColorInput(name,col); break;
        }
    }
    
    addNumberInput(name:string,col:RESOURCE_COL_STRING){
        new Setting(this.contentEl)
            .setName(col.label)
            .addText((text)=>text.onChange((value)=>{ this.data[name] = parseFloat(value); }));
    }
    addTextInput(name:string,col:RESOURCE_COL_STRING){
        new Setting(this.contentEl)
            .setName(col.label)
            .addText((text)=>text.onChange((value)=>{ this.data[name] = value; }));
    }
    addColorInput(name:string,col:RESOURCE_COL_STRING){
        new Setting(this.contentEl)
            .setName(col.label)
            .addColorPicker((text)=>text.onChange((value)=>{ this.data[name] = value; }));
    }

}

