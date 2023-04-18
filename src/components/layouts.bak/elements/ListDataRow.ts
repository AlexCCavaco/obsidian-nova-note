import { ListRow } from "./ListRow";
import { ListView } from "../ListView";

export class ListDataRow extends ListRow {

	attrsElm: HTMLElement;
	attributes: {};

	constructor(list:ListView){
		super(list);
		this.elm.classList.add('nova-list-data-row');
		this.attrsElm = document.createElement('div');
		this.attrsElm.classList.add('nova-list-row-attrs');
		this.lineElm.insertBefore(this.attrsElm,this.optsElm);
		this.attributes = {};
	}

	setAttributes(attributes:{}){
		this.attributes = attributes;
		/*TODO*/
	}

}
