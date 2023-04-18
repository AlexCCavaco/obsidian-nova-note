import {BlockView, ViewDataType} from "./BlockView";
import {BasicBlock} from "../blocks/BasicBlock";

export class CalendarView extends BlockView {

	static viewname = 'calendar';

	constructor(block:BasicBlock,dataType:ViewDataType,id?:string,name?:string,viewname?:string){
		super(block,dataType,id,name,viewname??CalendarView.viewname);
	}

	//

}
