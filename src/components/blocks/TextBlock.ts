import { BasicBlock } from "./BasicBlock";

export class TextBlock extends BasicBlock {

	textarea: HTMLTextAreaElement;

	constructor(blockName?:string){
		super(blockName??'text');
		this.textarea = this.container.createEl('textarea','nova-text text-input');
		this.textarea.placeholder = 'Text Block';
	}

	setData(data:string,override=true){
		if(!this.textarea.value||this.textarea.value==='') override = true;
		//this.input(this.textarea, (override?'':this.textarea.value+'\n\n') + data);
	}

	getData():string{
		return this.textarea.value??'';
	}

}
