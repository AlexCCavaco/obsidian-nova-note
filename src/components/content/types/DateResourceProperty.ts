import { ResourceProperty } from "../ResourceProperty";

export class DateResourceProperty extends ResourceProperty {

	static type = 'date';

	constructor(name:string){
		super(name,DateResourceProperty.type);
	}

}
