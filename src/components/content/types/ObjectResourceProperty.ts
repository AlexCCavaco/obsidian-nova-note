import { ResourceProperty } from "../ResourceProperty";

export class ObjectResourceProperty extends ResourceProperty {

	static type = 'object';

	define:{ [key:string]:{ name:string,type:ResourceProperty } };

	constructor(name:string){
		super(name,ObjectResourceProperty.type);
	}

}
