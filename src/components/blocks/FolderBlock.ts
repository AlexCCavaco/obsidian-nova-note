import { NovaContent } from "../NovaContent";
import { BasicViewBlock } from "./BasicViewBlock";

export class FolderBlock extends BasicViewBlock {

	static blockname = 'folder';

	constructor(novaContent:NovaContent,blockName?:string){
		super(novaContent,blockName??FolderBlock.blockname);
	}

}
