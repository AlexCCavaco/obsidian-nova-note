import { ResourceProperty } from "../ResourceProperty";

export class ListResourceProperty extends ResourceProperty {

	static type = 'list';

	sub:ResourceProperty;
	values:any[];

	constructor(name:string){
		super(name,ListResourceProperty.type);
	}

}
