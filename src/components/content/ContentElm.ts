import { TFile } from "obsidian";

export class ContentElm {

	icon: string|null;
	name: string;
	properties: { [key:string]:any };

	linked: TFile|null;

	constructor(){
		// TODO
	}

	static fromFile(file:TFile){
		// TODO load icon, name and properties from file, set as linked
	}

	isLinked():boolean{ return this.linked!==null; }

	hasProperty(prop:string):boolean { return this.properties!==undefined; }
	checkProperty(prop:string,validator:(value:any)=>boolean):boolean { return false; /*TODO*/ }
	setProperty(prop:string,value:any){ /*TODO Change Property, if a file, change propery value*/ }
	getProperty(prop:string):any|null{ /*TODO return property value or null*/ }

	getIcon():string|null{ return this.icon; }
	setIcon(icon?:string){ /*TODO Change Icon, if a file, change propery icon*/ this.icon = icon??null; }

	getName():string{ return this.name; }
	changeName(name:string){ /*TODO Change Name, if a file change file name*/ this.name = name; }

}
