import { NovaContent } from "../NovaContent";
import { BlockView } from "../views/BlockView";
import { ListView } from "../views/ListView";
import { BasicViewBlock } from "../blocks/BasicViewBlock";

export class ListBlock extends BasicViewBlock {

	view: BlockView;
	addRow: HTMLElement;

	constructor(novaContent:NovaContent,type:'unordered'|'ordered'='unordered'){
		super(novaContent,'list');
		this.view = new ListView(this);
		this.contentElm.appendChild(this.view.viewContainer);

		this.addAddOption();
		this.addDragOption();
		this.addMoreOption();
	}

}
