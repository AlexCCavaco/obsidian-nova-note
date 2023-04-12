import { NovaContent } from "../NovaContent";
import { BasicViewBlock } from "../blocks/BasicViewBlock";

export class TasksBlock extends BasicViewBlock {

	constructor(novaContent:NovaContent,blockName?:string){
		super(novaContent,blockName??'tasks');
	}

}
