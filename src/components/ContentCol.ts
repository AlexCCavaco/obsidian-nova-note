import { BasicBlock } from "./blocks/BasicBlock";

export class ContentCol {

	elm: HTMLElement;

	constructor(){
		this.elm = document.createElement('div');
		this.elm.classList.add('nova-content-col');

		/**TODO
		 * Create drag and drop areas to the bottom and top of the element
		 * Create drag and drop ares to the sides of the element
		 */
	}

	addBlock(block:BasicBlock){
		this.elm.appendChild(block.containerElm);
	}

}
