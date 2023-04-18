import { NovaContent } from "../NovaContent";
import { BasicViewBlock } from "./BasicViewBlock";

export class NotesBlock extends BasicViewBlock {

	static blockname = 'note';

	constructor(novaContent:NovaContent,blockName?:string){
		super(novaContent,blockName??NotesBlock.blockname);
	}

}
