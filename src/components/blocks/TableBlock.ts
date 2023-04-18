import { NovaContent } from "../NovaContent";
import { BasicViewBlock } from "./BasicViewBlock";

export class TableBlock extends BasicViewBlock {

	static blockname = 'table';

	constructor(novaContent:NovaContent,type:'unordered'|'ordered'='unordered',blockName?:string){
		super(novaContent,blockName??TableBlock.blockname);
	}

}
