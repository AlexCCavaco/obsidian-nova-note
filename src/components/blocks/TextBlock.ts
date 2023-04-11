import { BasicBlock } from "./BasicBlock";
import { NovaTab } from "../NovaTab";

export class TextBlock extends BasicBlock {

	textarea: HTMLTextAreaElement;

	constructor(tab:NovaTab,elm:HTMLElement,newBlock:boolean=false,blockName?:string){
		super(tab,elm,newBlock,blockName??'text');
		this.textarea = this.body.createEl('textarea','nova-text text-input');
		if(this.new) this.textarea.focus();
		this.textarea.placeholder = 'Text Block';
		/*==*/
		// this.addHeaderButton('code',undefined,()=>{/*TODO*/});
		this.setFloatingHeader();
		/* EVENTS */
		this.handleInputs(this.body);
	}

	setData(data:string,override=true){
		if(!this.textarea.value||this.textarea.value==='') override = true;
		this.input(this.textarea, (override?'':this.textarea.value+'\n\n') + data);
	}

	getData():string{
		return this.textarea.value??'';
	}

}
