import { BasicView } from "./BasicView";
import { BasicBlock } from "../blocks/BasicBlock";

export class TextView extends BasicView {

	constructor(block:BasicBlock,id?:string,name?:string,options?:{[key:string]:any}){
		super(block,id,name,options);
	}

}
