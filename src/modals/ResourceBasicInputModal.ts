import type Nova from "src/Nova";
import NovaModal, { type NovaModalInput } from "./NovaModal";

export default class extends NovaModal<string> {

    message     :string
    cb         ?:(data:string)=>void|boolean;

    labelElm    :HTMLParagraphElement;
    inputElm    :NovaModalInput;
    errorElm    :HTMLElement;
    buttonElm   :HTMLButtonElement;

    constructor(nova:Nova,message:string,cb?:(data:string)=>void){
        super(nova,cb);
        this.message = message;
        this.setTitle(message);
    }

    onOpen(): void {
        const form = this.contentEl.createEl('form');
        this.inputElm = this.createInput('text',form);
        /*/*/ this.inputElm.classList.add('res-form-in');
        this.errorElm = form.createEl('div',{ cls:'res-form-errs' });
        this.buttonElm = form.createEl('button',{ text:'Submit' });
        /*/*/ this.buttonElm.classList.add('res-form-but');
        /*/*/ this.buttonElm.setAttribute('type','submit');

        form.addEventListener('submit',this.submit.bind(this));
    }

    onClose() {
        this.contentEl.empty();
    }

    setError(err:Error|string){
        this.errorElm.createEl('pre',{ cls:'elm',text:err.toString() });
    }
    clearError(){
        this.errorElm.empty();
    }

    submit(ev:SubmitEvent){
        ev.preventDefault();
        const name = this.inputElm.value;
        if(name.trim()==='') return this.inputError(this.inputElm,"Name can't be Empty");
        if(this.nova.resources.hasResource(name)) return this.inputError(this.inputElm,`Resource ${name} already exists`);
        if(this.cb){ if(this.cb(name)) this.close(); }
        else this.close();
    }

}