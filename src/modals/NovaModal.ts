import { Modal } from "obsidian";
import type Nova from "src/Nova";

export type NovaModalInput = HTMLInputElement & {
    errorElement: HTMLElement;
    errors: HTMLElement[];
}

export default class extends Modal {

    nova    :Nova;
    cb     ?:(data:unknown)=>void;

    constructor(nova:Nova,cb?:(data:unknown)=>void){
        super(nova.app);
        this.nova = nova;
        this.cb = cb??undefined;
    }

    createInput(type:string,parent?:HTMLElement):NovaModalInput{
        const input = (parent ? parent.createEl('input') : document.createElement('input')) as NovaModalInput;
        input.setAttribute('type',type);
        input.errorElement = document.createElement('div');
        input.errorElement.classList.add('in-errs');
        input.appendChild(input.errorElement);
        input.errors = [];
        input.addEventListener('input',()=>this.clearInputErrors(input));
        return input;
    }

    inputError(input:NovaModalInput,errorMessage:string){
        const errElm = input.errorElement.createDiv(errorMessage);
        errElm.classList.add('err-elm');
    }
    clearInputErrors(input:NovaModalInput){
        input.errorElement.empty();
        input.errors = [];
    }

}
