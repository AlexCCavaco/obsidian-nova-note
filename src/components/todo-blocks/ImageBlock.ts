import { NovaContent } from "../NovaContent";
import { BasicDataBlock } from "../blocks/BasicDataBlock";

export class ImageBlock extends BasicDataBlock {

	constructor(novaContent:NovaContent,blockName?:string){
		super(novaContent,blockName??'image');
	}

}
