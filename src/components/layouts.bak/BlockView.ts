import { BasicBlock } from "../blocks/BasicBlock";

export type ViewDataType = 'static'|'linked'|'data';
export type ViewRawOptions = { filter:string,order:string,properties:string,groups:string };

export interface ViewOptions {
	filter: BlockView['filter'];
	order: BlockView['order'];
	properties: BlockView['properties'];
	groups: BlockView['groups'];
}

export class BlockView {

	static viewname = 'block';

	id: string;
	name: string;
	dataType: ViewDataType;
	viewname: string;

	filter: { property:string,value:any,compare:'='|'>'|'<'|'<='|'>='|'!='|((value:any)=>boolean) }[];
	order: string[];
	properties: string[];
	groups: string[][];

	viewContainer: HTMLElement;
	block: BasicBlock;

	constructor(block:BasicBlock,dataType:ViewDataType,id?:string,name?:string,viewname?:string){
		this.viewContainer = document.createElement('div');
		this.block = block;
		this.viewname = viewname??BlockView.viewname;

		this.id = id??block.novaC.generateViewId();
		this.name = name??'Unnamed View';
		this.dataType = dataType??'static';

		this.filter = [];
		this.order = [];
		this.properties = [];
		this.groups = [];
	}

}
