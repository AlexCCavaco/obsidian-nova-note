import { BasicView } from "./BasicView";
import { BasicBlock } from "../blocks/BasicBlock";
import {BasicLayout} from "../layouts/BasicLayout";

export type ViewDataType = 'static'|'linked'|'data';
export type ViewRawOptions = { filter:string,order:string,properties:string,groups:string };

export interface ViewOptions {
	filter: LayoutView['filter'];
	order: LayoutView['order'];
	properties: LayoutView['properties'];
	groups: LayoutView['groups'];
}

export class LayoutView extends BasicView {

	layout: BasicLayout;

	filter: { property:string,value:any,compare:'='|'>'|'<'|'<='|'>='|'!='|((value:any)=>boolean) }[];
	order: string[];
	properties: string[];
	groups: string[][];

	constructor(block:BasicBlock,layout:BasicLayout,id?:string,name?:string,options?:{[key:string]:any}){
		super(block,id,name,options);
		this.layout = layout;

		this.filter = [];
		this.order = [];
		this.properties = [];
		this.groups = [];
	}

	parseOptions(options:ViewRawOptions){
		this.filter = JSON.parse(options.filter);
		this.order = JSON.parse(options.order);
		this.properties = JSON.parse(options.properties);
		this.groups = JSON.parse(options.groups);
		this.layout.reload();
	}
	setOptions(options:ViewOptions){
		if(options.filter) this.filter = options.filter;
		if(options.order) this.order = options.order;
		if(options.properties) this.properties = options.properties;
		if(options.groups) this.groups = options.groups;
		this.layout.reload();
	}
	getOptions():ViewOptions {
		return {
			filter: this.filter,
			order: this.order,
			properties: this.properties,
			groups: this.groups
		};
	}

	setFilter(){
		// TODO
		this.layout.reorder();
	}
	setOrder(){
		// TODO
		this.layout.reorder();
	}

	showProperties(properties:string[]){
		let changed = false;
		for(let prop of properties){
			if(!this.properties.contains(prop)){ this.properties.push(prop); changed = true; }
		}
		if(changed) this.layout.reloadProperties();
	}
	hideProperties(properties:string[]){
		let changed = false;
		let propC = this.properties.length;
		for(let i = propC; i >= 0; i--){
			let prop = this.properties[i];
			if(this.properties.contains(prop)){ this.properties.splice(i,1); changed = true; }
		}
		if(changed) this.layout.reloadProperties();
	}
	setProperties(properties:string[]){
		this.properties = properties;
		this.layout.reloadProperties();
	}

	setGroups(){
		// TODO
		this.layout.reorder();
	}

	stringify():string {
		return `${this.id}::${this.name}::${this.layout.type}::' +
			'order:${JSON.stringify(this.order)},filter:${JSON.stringify(this.filter)},properties:${JSON.stringify(this.properties)},groups:${JSON.stringify(this.groups)}`;
	}

}
