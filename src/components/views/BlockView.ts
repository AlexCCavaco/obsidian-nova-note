import { BasicBlock } from "../blocks/BasicBlock";

export class BlockView {

	viewContainer: HTMLElement;
	block: BasicBlock;

	constructor(block:BasicBlock){
		this.viewContainer = document.createElement('div');
		this.block = block;
	}

	load(){}

}
