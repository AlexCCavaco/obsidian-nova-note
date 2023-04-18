import { ResourceProperty } from "../ResourceProperty";

export class BooleanResourceProperty extends ResourceProperty {

	static type = 'boolean';

	constructor(name:string){
		super(name,BooleanResourceProperty.type);
	}

}
