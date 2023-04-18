import { setIcon } from "obsidian";
import { NovaContent } from "../NovaContent";
import { BlockData, ContentData } from "../../tools/MDContentHandler";
import { BlockView } from "../layouts.bak/BlockView";
import { ContentElm } from "../content/ContentElm";

interface BlockOpts {
	elm: HTMLElement;
	iconElm: HTMLElement;
	click: ()=>void;
}

export class BasicBlock {

	static blockname = 'basic';

	novaC: NovaContent;
	blockname: string;
	savable: boolean;

	containerElm: HTMLElement;
	optsElm: HTMLElement;
	contentElm: HTMLElement;

	opts: { [key:string]:any };

	constructor(novaContent:NovaContent,blockName?:string,savable:boolean=true){
		this.novaC = novaContent;
		this.blockname = blockName??BasicBlock.blockname;
		this.savable = savable;
		this.containerElm = document.createElement('div');
		this.containerElm.classList.add('nova-block');
		this.containerElm.classList.add('nova-' + this.blockname + '-block');

		this.optsElm  = this.containerElm.createEl('div','nova-block-opts');
		this.contentElm  = this.containerElm.createEl('div','nova-block-body');

		this.opts = {};
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

	setOptions(options:{ [key:string]:any }){ this.opts = options; }
	getOptions():{ [key:string]:any }{ return this.opts; }

	setContent(data:ContentData){}
	getContent():string[]{ return []; }

	setViews(views:BlockData['views']){}

	isEmpty():boolean { return true; }

}
