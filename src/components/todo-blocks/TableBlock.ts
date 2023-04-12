import { NovaContent } from "../NovaContent";
import { BasicViewBlock } from "../blocks/BasicViewBlock";

export class TableBlock extends BasicViewBlock {

	constructor(novaContent:NovaContent,type:'unordered'|'ordered'='unordered',blockName?:string){
		super(novaContent,blockName??'table');
	}

}
