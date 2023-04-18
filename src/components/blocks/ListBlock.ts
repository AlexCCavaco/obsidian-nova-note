import { NovaContent } from "../NovaContent";
import { BlockView } from "../layouts.bak/BlockView";
import { ListView } from "../layouts.bak/ListView";
import { BasicViewBlock } from "./BasicViewBlock";

export class ListBlock extends BasicViewBlock {

	static blockname = 'list';

	view: ListView;
	addRow: HTMLElement;

	constructor(novaContent:NovaContent,type:'unordered'|'ordered'='unordered'){
		super(novaContent,ListBlock.blockname);
		this.view = new ListView(this);
		this.contentElm.appendChild(this.view.viewContainer);

		this.addAddOption();
		this.addDragOption();
	}

}
