import { BasicBlock } from "./BasicBlock";
import { NovaTab } from "../NovaTab";
import { setIcon } from "obsidian";
import { TextBlock } from "./TextBlock";
import { parseMarkdown,hyper,HyperEditor } from "../../tools/MarkdownHelper";

export class MarkdownBlock extends BasicBlock {

	textblock: HTMLTextAreaElement;
	editor: HyperEditor;

	constructor(tab:NovaTab,elm:HTMLElement,newBlock:boolean=false,blockName?:string){
		super(tab,elm,newBlock,blockName??'markdown');
		this.textblock = this.body.createEl('textarea','nova-text in');
		this.textblock.contentEditable = 'true';
		this.editor = hyper(this.textblock);
		if(this.new) this.editor.focus();
		/*//==/==/==/*/
		this.setFloatingHeader();
		/* EVENTS */
		this.handleInputs(this.body);
	}

	setData(data:string,override=true){
		if(override) this.textblock.empty();
		this.textblock.innerHTML += parseMarkdown(data);
	}

	getData():string{
		return super.getData();
	}

}
