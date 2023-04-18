import { ResourceProperty } from "../ResourceProperty";

export class TimeResourceProperty extends ResourceProperty {

	static type = 'time';

	constructor(name:string){
		super(name,TimeResourceProperty.type);
	}

}
