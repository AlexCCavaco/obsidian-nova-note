import { NovaContent } from "../NovaContent";
import { BasicViewBlock } from "./BasicViewBlock";
import {BasicBlock} from "./BasicBlock";

export class ColumnBlock extends BasicViewBlock {

	static blockname = 'cols';

	constructor(novaContent:NovaContent,blockName?:string){
		super(novaContent,blockName??ColumnBlock.blockname);
	}

	addBlockToColumn(block:BasicBlock,column:string){}
	addBlockToCurrent(block:BasicBlock){}

	nextCol(){}
	getCol(){}
	getCols(){}

}
