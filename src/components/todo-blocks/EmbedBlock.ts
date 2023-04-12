import { NovaContent } from "../NovaContent";
import { BasicViewBlock } from "../blocks/BasicViewBlock";

export class EmbedBlock extends BasicViewBlock {

	constructor(novaContent:NovaContent,blockName?:string){
		super(novaContent,blockName??'embed');
	}

}
