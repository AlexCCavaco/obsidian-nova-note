import { ListRow } from "./ListRow";
import { ListView } from "../ListView";
import { setIcon } from "obsidian";

export class ListTitleRow extends ListRow {

	constructor(list:ListView){
		super(list);
		this.elm.classList.add('nova-list-title-row');
		setIcon(this.iconElm,'arrow-right');
	}

	setIcon(icon:string){}
	setBullet(bulletType:string,bulletHTML:string){}

	getData(){
		return this.titleElm.value;
	}

}
