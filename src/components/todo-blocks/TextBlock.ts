import { NovaContent } from "../NovaContent";
import { BasicDataBlock } from "../blocks/BasicDataBlock";

export class TextBlock extends BasicDataBlock {

	constructor(novaContent:NovaContent,blockName?:string){
		super(novaContent,blockName??'text');
	}

}
