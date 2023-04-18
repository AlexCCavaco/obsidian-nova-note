import { NovaContent } from "../NovaContent";
import { BasicViewBlock } from "./BasicViewBlock";

export class DataBlock extends BasicViewBlock {

	static blockname = 'data';

	constructor(novaContent:NovaContent,type:"table"|"list"|"tasks"|"board"|"timeline"|"calendar"|"gallery"="list",blockName?:string){
		super(novaContent,blockName??DataBlock.blockname);
	}

}
