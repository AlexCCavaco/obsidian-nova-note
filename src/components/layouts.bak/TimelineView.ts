import {BlockView, ViewDataType} from "./BlockView";
import {BasicBlock} from "../blocks/BasicBlock";

export class TimelineView extends BlockView {

	static viewname = 'timeline';

	constructor(block:BasicBlock,dataType:ViewDataType,id?:string,name?:string,viewname?:string){
		super(block,dataType,id,name,viewname??TimelineView.viewname);
	}

	//

}
