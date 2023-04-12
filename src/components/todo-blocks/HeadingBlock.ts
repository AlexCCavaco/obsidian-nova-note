import { NovaContent } from "../NovaContent";
import { BasicViewBlock } from "../blocks/BasicViewBlock";

export class HeadingBlock extends BasicViewBlock {

	constructor(novaContent:NovaContent,type:1|2|3|4|5=1,blockName?:string){
		super(novaContent,blockName??'heading');
	}

}
