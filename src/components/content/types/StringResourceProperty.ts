import { ResourceProperty } from "../ResourceProperty";

export class StringResourceProperty extends ResourceProperty {

	static type = 'string';

	constructor(name:string){
		super(name,StringResourceProperty.type);
	}

}
