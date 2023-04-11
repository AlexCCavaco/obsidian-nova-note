import { BasicBlock } from "./BasicBlock";
import { NovaTab } from "../NovaTab";
import { setIcon } from "obsidian";

export class TasksBlock extends BasicBlock {

	constructor(tab:NovaTab,elm:HTMLElement,newBlock:boolean=false,blockName?:string){
		super(tab,elm,newBlock,blockName??'tasks');
		//TODO
	}

	setData(data:string,override=true){
		//TODO
	}

	getData():string{
		return '';//TODO
	}

}