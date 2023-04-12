import { NovaContent } from "../NovaContent";
import { BlockView } from "../views/BlockView";
import { BasicDataBlock } from "./BasicDataBlock";

export class BasicViewBlock extends BasicDataBlock {

	view: BlockView;

	constructor(novaContent:NovaContent,blockName?:string){
		super(novaContent,blockName??'basic-view');
		this.view = new BlockView(this);
	}

}
