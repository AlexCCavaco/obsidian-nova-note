export {};
// import { BasicBlock } from "../blocks/BasicBlock";
// import { setIcon } from "obsidian";
// import { TextBlock } from "./TextBlock";
// import { parseMarkdown,hyper,HyperEditor } from "../../tools/MarkdownHelper";
//
// export class MarkdownBlock extends BasicBlock {
//
// 	textblock: HTMLTextAreaElement;
// 	editor: HyperEditor;
//
// 	constructor(blockName?:string){
// 		super(blockName??'markdown');
// 		this.textblock = this.containerElm.createEl('textarea','nova-text in');
// 		this.textblock.contentEditable = 'true';
// 		this.editor = hyper(this.textblock);
// 	}
//
// 	setData(data:string,override=true){
// 		if(override) this.textblock.empty();
// 		this.textblock.innerHTML += parseMarkdown(data);
// 	}
//
// 	getData():string{
// 		return super.getData();
// 	}
//
// }
