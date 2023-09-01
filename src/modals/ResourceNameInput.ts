import type Nova from "src/Nova";
import NovaModal, { type NovaModalInput } from "./NovaModal";

export default class extends NovaModal {

    cb         ?:(data:string)=>void;

    labelElm    :HTMLParagraphElement;
    inputElm    :NovaModalInput;
    buttonElm   :HTMLButtonElement;

    constructor(nova:Nova,cb?:(data:string)=>void){
        super(nova,cb);
    }

    onOpen(): void {console.log('hello')
        const form = this.contentEl.createEl('form');
        this.labelElm = form.createEl('p',{ text:"Input the Name of the New Resource" });
        /*/*/ this.labelElm.classList.add('res-form-toolheader');
        this.inputElm = this.createInput('text',form);
        /*/*/ this.inputElm.classList.add('res-form-in');console.log(this.inputElm)
        this.buttonElm = form.createEl('button',{ text:'Submit' });
        /*/*/ this.buttonElm.classList.add('res-form-but');
        /*/*/ this.buttonElm.setAttribute('type','submit');

        form.addEventListener('submit',this.submit.bind(this));
    }

    onClose() {
        this.contentEl.empty();
    }

    submit(ev:SubmitEvent){
        ev.preventDefault();console.log(this.inputElm)
        const name = this.inputElm.value;
        if(name.trim()==='') return this.inputError(this.inputElm,"Name can't be Empty");
        if(this.nova.resources.hasResource(name)) return this.inputError(this.inputElm,`Resource ${name} already exists`);
        if(this.cb) this.cb(name);
        this.close();
    }

}