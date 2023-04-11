import { BasicBlock } from "./BasicBlock";
import { setIcon } from "obsidian";

export class TasksBlock extends BasicBlock {

	constructor(blockName?:string){
		super(blockName??'tasks');
		//TODO
	}

	setData(data:string,override=true){
		//TODO
	}

	getData():string{
		return '';//TODO
	}

}
