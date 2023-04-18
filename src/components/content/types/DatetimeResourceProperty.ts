import { ResourceProperty } from "../ResourceProperty";

export class DatetimeResourceProperty extends ResourceProperty {

	static type = 'datetime';

	constructor(name:string){
		super(name,DatetimeResourceProperty.type);
	}

}
