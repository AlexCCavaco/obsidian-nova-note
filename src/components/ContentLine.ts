import { BasicBlock } from "./blocks/BasicBlock";

export class ContentLine {

	elm: HTMLElement;

	constructor(){
		this.elm = document.createElement('div');
		this.elm.classList.add('nova-content-line');

		/**TODO
		 * Create drag and drop areas to the bottom and top of the element
		 */
	}

	addBlock(block:BasicBlock){
		this.elm.appendChild(block.containerElm);
	}

}
