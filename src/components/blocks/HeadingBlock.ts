import { NovaContent } from "../NovaContent";
import { BasicViewBlock } from "./BasicViewBlock";

export class HeadingBlock extends BasicViewBlock {

	static blockname = 'heading';

	constructor(novaContent:NovaContent,type:1|2|3|4|5=1,blockName?:string){
		super(novaContent,blockName??HeadingBlock.blockname);
	}

}
