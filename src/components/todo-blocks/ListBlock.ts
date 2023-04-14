import { NovaContent } from "../NovaContent";
import { BlockView } from "../views/BlockView";
import { ListView } from "../views/ListView";
import { BasicViewBlock } from "../blocks/BasicViewBlock";

export class ListBlock extends BasicViewBlock {

	view: ListView;
	addRow: HTMLElement;

	constructor(novaContent:NovaContent,type:'unordered'|'ordered'='unordered'){
		super(novaContent,'list');
		this.view = new ListView(this);
		this.contentElm.appendChild(this.view.viewContainer);

		this.addAddOption();
		this.addDragOption();

		/*TODO TMP*/this.view.setData([
			{ title:"Potato Land" },
			{ title:"Hellow World",type:"title" },
			{ title:"" },
			{ title:"Lorem ipsum dolor sit amet, consectetur adipiscing elit" },
			{ title:"Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
			{ title:"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
			{ title:"Excepteur sint occaecat cupidatat " },
		]);
	}

}
