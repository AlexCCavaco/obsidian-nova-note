import { NovaContent } from "../NovaContent";
import { BasicViewBlock } from "./BasicViewBlock";

export class EmbedBlock extends BasicViewBlock {

	static blockname = 'embed';

	constructor(novaContent:NovaContent,blockName?:string){
		super(novaContent,blockName??EmbedBlock.blockname);
	}

}
