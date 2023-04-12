import { NovaContent } from "../NovaContent";
import { BasicBlock } from "./BasicBlock";

export class BasicDataBlock extends BasicBlock{

	constructor(novaContent:NovaContent,blockName?:string){
		super(novaContent,blockName??'basic-data');
	}

	setData(data:string,override=true){}
	getData():string{ return ''; }
	save(){ /*TODO*/ }

}
