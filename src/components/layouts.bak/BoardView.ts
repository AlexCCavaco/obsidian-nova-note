import {BlockView, ViewDataType} from "./BlockView";
import {BasicBlock} from "../blocks/BasicBlock";

export class BoardView extends BlockView {

	static viewname = 'board';

	constructor(block:BasicBlock,dataType:ViewDataType,id?:string,name?:string,viewname?:string){
		super(block,dataType,id,name,viewname??BoardView.viewname);
	}

	//

}
