import ResourceEditorOption from "./ResourceEditorOption";

export default class ResourceEditorParsedTextOption<ValType> extends ResourceEditorOption<HTMLInputElement,string,ValType|null> {

    parse: (opt:ResourceEditorParsedTextOption<ValType>,val:string)=>ValType|null;

    constructor(parent:HTMLElement,title:string,parser:(opt:ResourceEditorParsedTextOption<ValType>,val:string)=>ValType|null,
                cb:(this:ResourceEditorParsedTextOption<ValType>,value:ValType)=>void){
        super(parent,title,cb);
        this.input = this.inp.createEl('input',{ type:'text' });
        this.input.addEventListener('input',this.updateValue);
        this.parse = parser;
    }

    set value(data:string){
        this.input.value = data;
        this._value = data;
        const res = this.parse(this,data);
        this.cb.call(this,res);
    }

    updateValue(){
        this.value = this.input.value;
    }

}
