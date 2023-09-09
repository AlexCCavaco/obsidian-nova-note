import { Modal } from "obsidian";
import type Nova from "src/Nova";

export type NovaModalInput = HTMLInputElement & {
    errorElement: HTMLElement;
    errors: HTMLElement[];
}

export default class<NovaModalVal> extends Modal {

    nova    :Nova;
    cb     ?:(data:NovaModalVal)=>void;

    constructor(nova:Nova,cb?:(data:NovaModalVal)=>void){
        super(nova.app);
        this.nova = nova;
        this.cb = cb??undefined;
    }

    setTitle(title:string){
        this.titleEl.textContent = title;
    }

    setExtended(){
        this.contentEl.parentElement?.classList.add('res-modal-extended');
    }

    createInput(type:string,parent?:HTMLElement):NovaModalInput{
        const input = (parent ? parent.createEl('input') : document.createElement('input')) as NovaModalInput;
        input.setAttribute('type',type);
        input.errorElement = document.createElement('div');
        input.errorElement.classList.add('in-errs');
        if(input.parentElement) input.parentElement.insertAfter(input.errorElement,input);
        input.errors = [];
        input.addEventListener('input',()=>this.clearInputErrors(input));
        return input;
    }

    inputError(input:NovaModalInput,errorMessage:string){
        const errElm = input.errorElement.createEl('div');
        errElm.classList.add('err-elm');
        errElm.textContent = errorMessage;
    }
    clearInputErrors(input:NovaModalInput){
        input.errorElement.empty();
        input.errors = [];
    }

}
