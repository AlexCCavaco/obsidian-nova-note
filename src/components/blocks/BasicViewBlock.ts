import { NovaContent } from "../NovaContent";
import { BlockView } from "../layouts.bak/BlockView";
import { BasicDataBlock } from "./BasicDataBlock";
import { ContentElm } from "../content/ContentElm";
import { BlockData } from "../../tools/MDContentHandler";

export class BasicViewBlock extends BasicDataBlock {

	static blockname = 'basic-view';

	views: BlockView[];
	content: ContentElm[];

	constructor(novaContent:NovaContent,blockName?:string){
		super(novaContent,blockName??BasicViewBlock.blockname);
		this.views = [];
	}

	getViews():BlockView[]{ return this.views; }
	getViewsData():BlockData['views']{
		let data:BlockData['views'] = [];
		for(let view of this.views){
			//
		}
		return data;
	}

}
