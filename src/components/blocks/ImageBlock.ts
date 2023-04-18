import { NovaContent } from "../NovaContent";
import { BasicDataBlock } from "./BasicDataBlock";

export class ImageBlock extends BasicDataBlock {

	static blockname = 'image';

	constructor(novaContent:NovaContent,blockName?:string){
		super(novaContent,blockName??ImageBlock.blockname);
	}

}
