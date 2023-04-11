import { setIcon } from "obsidian";
import { resizeTextarea } from "../../tools/InputHelper";

export class BasicBlock {

	blockname:string;

	container: HTMLElement;

	constructor(blockName?:string){
		this.blockname = blockName??'basic';
		this.container = document.createElement('div');
		this.container.classList.add('nova-tab-block');
	}

	setData(data:string,override=true){}
	getData():string{ return ''; }
	save(){ /*TODO*/ }

}
