import { ResourceProperty } from "../ResourceProperty";

export class IntegerResourceProperty extends ResourceProperty {

	static type = 'integer';

	constructor(name:string){
		super(name,IntegerResourceProperty.type);
	}

}
