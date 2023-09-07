import ResourceEditorOption from "./ResourceEditorOption";

export default class ResourceEditorCheckOption extends ResourceEditorOption<HTMLInputElement,boolean> {

    constructor(parent:HTMLElement,title:string,cb:(this:ResourceEditorCheckOption,value:boolean)=>void){
        super(parent,title,cb);
        this.input = this.inp.createEl('input',{ type:'checkbox' });
        this.input.addEventListener('input',this.updateValue);
    }

    set value(data:boolean){
        this.input.checked = data;
        super.value = data;
    }

    updateValue(){
        this.value = this.input.checked;
    }

}
