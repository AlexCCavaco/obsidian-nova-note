import { NovaContent } from "../NovaContent";
import { BasicDataBlock } from "./BasicDataBlock";

export class TextBlock extends BasicDataBlock {

	static blockname = 'text';

	constructor(novaContent:NovaContent,blockName?:string){
		super(novaContent,blockName??TextBlock.blockname);
	}

}
