import {BlockView, ViewDataType} from "./BlockView";
import {BasicBlock} from "../blocks/BasicBlock";

export class TableView extends BlockView {

	static viewname = 'table';

	constructor(block:BasicBlock,dataType:ViewDataType,id?:string,name?:string,viewname?:string){
		super(block,dataType,id,name,viewname??TableView.viewname);
	}

	//

}
