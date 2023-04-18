import { BasicBlock } from "../blocks/BasicBlock";
import { BasicLayout } from "../layouts/BasicLayout";

export class BasicView {

	id: string;
	name: string;
	options: {[key:string]:any};

	viewContainer: HTMLElement;
	block: BasicBlock;

	constructor(block:BasicBlock,id?:string,name?:string,options?:{[key:string]:any}){
		this.id = id??this.block.novaC.generateViewId();
		this.name = name??'Unnamed View';
		this.options = options??{};

		this.block = block;
		this.viewContainer = document.createElement('div');
	}

}
