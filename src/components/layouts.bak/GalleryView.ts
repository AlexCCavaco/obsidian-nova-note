import {BlockView, ViewDataType} from "./BlockView";
import {BasicBlock} from "../blocks/BasicBlock";

export class GalleryView extends BlockView {

	static viewname = 'gallery';

	constructor(block:BasicBlock,dataType:ViewDataType,id?:string,name?:string,viewname?:string){
		super(block,dataType,id,name,viewname??GalleryView.viewname);
	}

	//

}
