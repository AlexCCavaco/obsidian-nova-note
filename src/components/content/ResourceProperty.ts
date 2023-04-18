import {marked} from "marked";
import options = marked.options;

export class ResourceProperty {

	name: string;
	type: string;
	typeOpts: { name:string,value:any }[]|null;

	icon: string|null;
	color: string|null;
	options: {[key:string]:any};

	constructor(name:string,type:string){
		this.name = name;
		this.type = type;
		this.typeOpts = null;
	}

	// static from(format:string){
	// 	let matches = format.match(/^(\w+)[^\S\n]+?(\w+)(?:\((.*?)\))?(?:[^\S\n]+?(.*?))?$/);
	// 	if(!matches) return null;
	// 	let name = matches[1].trim().replace(/\s/,'_');
	// 	let type =
	// 	let opts = (matches[2]??'').split(',');
	// 	//let
	// }

	stringify():string {
		let typeOptsString = this.typeOpts ? '('+ this.typeOpts.map(prop=>prop.value).join(',') +')' : '';
		let options = { ...this.options };
		if(this.icon) options.icon = this.icon;
		if(this.color) options.color = this.color;
		let optionsString = ' ' + Object.keys(this.options).map(key=>(`${key}:${this.options[key]}`)).join(' ');
		return this.name+' ' + this.type + typeOptsString + optionsString;
	}

	validate(value:any):boolean {
		return true;
	}

}
