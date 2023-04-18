import { NovaContent } from "../NovaContent";
import { BasicViewBlock } from "./BasicViewBlock";

export class TasksBlock extends BasicViewBlock {

	static blockname = 'tasks';

	constructor(novaContent:NovaContent,blockName?:string){
		super(novaContent,blockName??TasksBlock.blockname);
	}

}
