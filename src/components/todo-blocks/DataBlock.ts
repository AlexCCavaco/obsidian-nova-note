import { NovaContent } from "../NovaContent";
import { BasicViewBlock } from "../blocks/BasicViewBlock";

export class DataBlock extends BasicViewBlock {

	constructor(novaContent:NovaContent,type:"table"|"list"|"tasks"|"board"|"timeline"|"calendar"|"gallery"="list",blockName?:string){
		super(novaContent,blockName??'data');
	}

}
