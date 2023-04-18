import { NovaContent } from "../NovaContent";
import { BasicBlock } from "./BasicBlock";

export class BasicDataBlock extends BasicBlock {

	static blockname = 'basic-data'

	constructor(novaContent:NovaContent,blockName?:string){
		super(novaContent,blockName??BasicDataBlock.blockname);
	}

	setData(data:string,override=true){}
	getData():string{ return ''; }
	save(){ /*TODO*/ }

}
