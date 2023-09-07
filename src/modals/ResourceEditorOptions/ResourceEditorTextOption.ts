import ResourceEditorOption from "./ResourceEditorOption";

export default class ResourceEditorTextOption extends ResourceEditorOption<HTMLInputElement,string> {

    constructor(parent:HTMLElement,title:string,cb:(this:ResourceEditorTextOption,value:string)=>void){
        super(parent,title,cb);
        this.input = this.inp.createEl('input',{ type:'text' });
        this.input.addEventListener('input',this.updateValue);
    }

    set value(data:string){
        this.input.value = data;
        super.value = data;
    }

    updateValue(){
        this.value = this.input.value;
    }

}
