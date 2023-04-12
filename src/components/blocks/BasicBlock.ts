import { setIcon } from "obsidian";
import {NovaContent} from "../NovaContent";

interface BlockOpts {
	elm: HTMLElement;
	iconElm: HTMLElement;
	click: ()=>void;
}

export class BasicBlock {

	novaC: NovaContent;
	blockname: string;
	savable: boolean;

	containerElm: HTMLElement;
	optsElm: HTMLElement;
	contentElm: HTMLElement;

	constructor(novaContent:NovaContent,blockName?:string,savable:boolean=true){
		this.novaC = novaContent;
		this.blockname = blockName??'basic';
		this.savable = savable;
		this.containerElm = document.createElement('div');
		this.containerElm.classList.add('nova-block');
		this.containerElm.classList.add('nova-' + this.blockname + '-block');

		this.optsElm  = this.containerElm.createEl('div','nova-block-opts');
		this.contentElm  = this.containerElm.createEl('div','nova-block-body');
	}

	addOption(name:string,icon:string,cb:()=>void):BlockOpts {
		let elm = this.optsElm.createEl('div','opts-elm');
		let iconElm = elm.createEl('div','opts-icon nova-icon');
		let click = ()=>cb();
		setIcon(iconElm,icon);
		return { elm,iconElm,click };
	}
	addDragOption(){
		let opts = this.addOption('drag','grip-vertical',()=>{/*TODO*/})
		/*TODO Event Listener for Drag*/
	}
	addAddOption(){
		let opts = this.addOption('add','plus',()=>{/*TODO*/})
		/*TODO Event Listener for Add*/
	}
	addMoreOption(){
		let opts = this.addOption('more','more-vertical',()=>{/*TODO*/})
		/*TODO Event Listener for More*/
	}

}
