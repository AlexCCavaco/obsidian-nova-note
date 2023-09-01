import type Nova from "src/Nova";
import type Resource from "src/resources/Resource";
import NovaModal from "./NovaModal";

export default class extends NovaModal {
    
    resource   ?:Resource|null;
    name        :string;

    nameElement :HTMLElement;
    formElement :HTMLElement;

    constructor(nova:Nova,resourceName:string,resource?:Resource|null,cb?:(resource:Resource)=>void){
        super(nova,cb);
        this.name = resourceName;
        this.resource = resource;
    }

    onOpen(): void {
        const contentEl = this.contentEl;
        this.nameElement = contentEl.createEl("h1", { text: `Resource ${this.resource?this.resource.name:'New Resource'}` });
        this.formElement = contentEl.createEl("form", { text:'' });





        //contentEl.createEl("h1", { text: `Resource ${this.resource.name}` });
        //for(const key in this.resource.getCols()){
        //    const col = this.resource.getCols()[key];
        //    if(!col.input) continue;
        //    if(col instanceof ResourceColResource) this.addResourceInput(key,col);
        //    else if(col instanceof ResourceColDefType) this.addTypeInput(key,col);
        //    else this.addInput(key,col as ResourceColString);
        //}

        //new Setting(contentEl).addButton(btn=>btn.setButtonText("Save").setCta().onClick(this.save.bind(this)));
    }

    onClose() {
        this.contentEl.empty();
    }

    //

}