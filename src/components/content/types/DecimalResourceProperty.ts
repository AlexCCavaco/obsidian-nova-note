import { ResourceProperty } from "../ResourceProperty";

export class DecimalResourceProperty extends ResourceProperty {

	static type = 'decimal';

	constructor(name:string){
		super(name,DecimalResourceProperty.type);
	}

}
