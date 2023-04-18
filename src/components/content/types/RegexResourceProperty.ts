import { ResourceProperty } from "../ResourceProperty";

export class RegexResourceProperty extends ResourceProperty {

	static type = 'regex';

	constructor(name:string){
		super(name,RegexResourceProperty.type);
	}

}
