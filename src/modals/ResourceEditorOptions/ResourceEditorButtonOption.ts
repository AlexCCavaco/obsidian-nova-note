import { setIcon } from "obsidian";
import ResourceEditorOption from "./ResourceEditorOption";

export default class ResourceEditorButtonOption<ValType> extends ResourceEditorOption<HTMLButtonElement,ValType|null> {

    placeholder:string;
    clear:HTMLButtonElement;

    constructor(parent:HTMLElement,title:string,placeholder:string,getData:(opt:ResourceEditorButtonOption<ValType>)=>void,cb:(this:ResourceEditorButtonOption<ValType>,value:ValType)=>void){
        super(parent,title,cb);
        this.placeholder = placeholder;
        this.inp.classList.add('twofold');
        this.input = this.inp.createEl('button',{ type:'button',text:placeholder });
        this.clear = this.inp.createEl('button',{ type:'button' });
        setIcon(this.clear,'x');

        this.inp.addEventListener('click',()=>getData(this));
        this.clear.addEventListener('click',()=>this.value=null);
    }

    set value(data:ValType|null){
        if(!data) this.input.textContent = this.placeholder;
        super.value = data;
    }

    get textContent(){
        return this.input.textContent;
    }
    set textContent(textContent:string|null){
        if(textContent==null) this.input.textContent = this.placeholder;
        else this.input.textContent = textContent;
    }

}
