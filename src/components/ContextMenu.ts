import { setIcon } from "obsidian";
import { BasicBlock } from "./blocks/BasicBlock";
import { NovaContent } from "./NovaContent";
import * as block from './Blocks';

interface ContextGroup {
	elm: HTMLElement;
	titleElm: HTMLElement;
	listElm: HTMLElement;
	addElm: (title:string,icon:string,callToCreateBlock:()=>BasicBlock,details?:string,searchTags?:string[])=>ContextElm;
}
interface ContextElm {
	elm: HTMLElement;
	iconElm: HTMLElement;
	dataElm: HTMLElement;
	titleElm: HTMLElement;
	detailsElm: HTMLElement;
	searchTags: string[];
	createBlock: ()=>BasicBlock;
	group: ContextGroup;
}

export class ContextMenu {

	elm: HTMLElement;
	parentBlock?: BasicBlock;
	novaC: NovaContent;

	groups: ContextGroup[];
	elms: ContextElm[];

	firstDisplayedElm: number|null;
	lastDisplayedElm: number|null;
	focusedElm: number|null;

	constructor(novaContent:NovaContent){
		this.novaC = novaContent;
		this.elm = document.createElement('div');
		this.elm.classList.add('nova-context');
		this.groups = [];
		this.elms = [];

		this.focusedElm = null;
		this.firstDisplayedElm = null;
		this.lastDisplayedElm = null;

		this.createCol('Static',(col:ContextGroup)=>{
			col.addElm('Heading 1','heading-1',()=>(new block.heading(this.novaC,1)),'Create a Heading 1',['h1','head1','heading1']);
			col.addElm('Heading 2','heading-2',()=>(new block.heading(this.novaC,2)),'Create a Heading 2',['h2','head2','heading2']);
			col.addElm('Heading 3','heading-3',()=>(new block.heading(this.novaC,3)),'Create a Heading 3',['h3','head3','heading3']);
			col.addElm('Heading 4','heading-4',()=>(new block.heading(this.novaC,4)),'Create a Heading 4',['h4','head4','heading4']);
			col.addElm('Heading 5','heading-5',()=>(new block.heading(this.novaC,5)),'Create a Heading 5',['h5','head5','heading5']);
			col.addElm('List','list',()=>(new block.list(this.novaC,'unordered')),'Create a List of Items',['lsts']);
			col.addElm('Ordered List','list-ordered',()=>(new block.list(this.novaC,'ordered')),'Create an Ordered List',['lsts','ordered','order']);
			col.addElm('Tasks','check-square',()=>(new block.tasks(this.novaC)),'Create a List of Tasks',['tsks']);
			col.addElm('Table','table',()=>(new block.table(this.novaC)),'Create a Table',['tbls']);
			col.addElm('Image','image',()=>(new block.image(this.novaC)),'Insert one or more Images',['imgs']);
		});
		this.createCol('Dynamic',(col:ContextGroup)=>{
			col.addElm('Data Table','table-2',()=>(new block.data(this.novaC,'table')),'Table with Data from Various Notes',['tbls']);
			col.addElm('Data List','list-end',()=>(new block.data(this.novaC,'list')),'List with Data from Various Notes',['lsts']);
			col.addElm('Data Tasks','clipboard-check',()=>(new block.data(this.novaC,'tasks')),'List with Data from Various Notes',['tsks']);
			col.addElm('Board','columns',()=>(new block.data(this.novaC,'board')),'Board with Data from Various Notes',['columns']);
			col.addElm('Timeline','calendar-range',()=>(new block.data(this.novaC,'timeline')),'Timeline with Data from Various Notes',['timed']);
			col.addElm('Calendar','calendar',()=>(new block.data(this.novaC,'calendar')),'Calendar with Data from Various Notes',['dates']);
			col.addElm('Gallery','layout-dashboard',()=>(new block.data(this.novaC,'gallery')),'Gallery with Data from Various Notes',['collection']);
		});
		this.createCol('Links',(col:ContextGroup)=>{
			col.addElm('Embed','file-code',()=>(new block.embed(this.novaC)),'Embed into the Page',['links']);
			col.addElm('Folder Contents','folder-search',()=>(new block.folder(this.novaC)),'Display a Folder Contents',['links']);
			col.addElm('Linked Notes','file-symlink',()=>(new block.notes(this.novaC)),'Display Notes',['links']);
		});
	}

	createCol(title:string,call?:(col:ContextGroup)=>void):ContextGroup {
		let elm = this.elm.createEl('div','nova-context-group');
		let grp = {
			elm,
			titleElm: elm.createEl('div','nova-context-group-title'),
			listElm: elm.createEl('div','nova-context-group-list'),
			addElm:(title:string,icon:string,callToCreateBlock:()=>BasicBlock,details?:string,searchTags?:string[]):ContextElm=>this.createElm(title,icon,grp,callToCreateBlock,details,searchTags)
		};
		if(title) grp.titleElm.textContent = title;
		if(call) call(grp);
		this.groups.push(grp);
		return grp;
	}
	createElm(title:string,icon:string,group:ContextGroup,callToCreateBlock:()=>BasicBlock,details?:string,searchTags?:string[]):ContextElm {
		let elm = group.listElm.createEl('div','nova-context-elm');
		let iconElm = elm.createEl('div','nova-context-row-icon nova-icon');
		let dataElm = elm.createEl('div','nova-context-row-data');
		let titleElm = dataElm.createEl('div','nova-context-row-title');
		let detailsElm = dataElm.createEl('div','nova-context-row-details');
		if(!searchTags) searchTags = [];
		searchTags.push(title);
		searchTags = searchTags.map(v=>v.trim().toLowerCase());
		if(title) titleElm.textContent = title;
		if(details) detailsElm.textContent = details;
		if(icon) setIcon(iconElm,icon);
		elm.addEventListener('click',()=>callToCreateBlock());
		let row = { elm,iconElm,dataElm,titleElm,detailsElm,group,searchTags,createBlock:callToCreateBlock };
		this.elms.push(row);
		return row;
	}

	show(){
		this.elm.classList.add('show');
	}
	showIn(block:BasicBlock){
		if(!this.parentBlock||this.parentBlock.containerElm!==block.containerElm) block.containerElm.appendChild(this.elm);
		this.parentBlock = block;
		this.show();
	}
	hide(){
		this.elm.classList.remove('show');
		this.parentBlock = undefined;
		this.elm.remove();
		this.unfocusElement();
	}

	input(command:string){
		this.firstDisplayedElm = null;
		this.focusedElm = null;
		let elmCount = this.elms.length;
		let lastElm = null;
		for(let i = 0; i < elmCount; i++){
			let elm = this.elms[i];
			if(elm.searchTags.some(tag=>tag.indexOf(command)!==-1)){
				elm.elm.classList.remove('hide');
				if(this.firstDisplayedElm===null){ this.focusElement(i); this.firstDisplayedElm = i; }
				lastElm = i;
			} else{
				elm.elm.classList.add('hide');
			}
		}
		this.lastDisplayedElm = lastElm;
		for(let grp of this.groups){
			if(Array.from(grp.listElm.children).some(elm=>!elm.classList.contains('hide'))){
				grp.elm.classList.remove('hide');
			} else {
				grp.elm.classList.add('hide');
			}
		}
	}

	keyDown():boolean{
		if(this.focusedElm===null&&this.firstDisplayedElm!==null){
			this.focusElement(this.firstDisplayedElm);
			return true;
		}
		if(this.focusedElm!==null&&this.firstDisplayedElm!==null){
			this.focusElement(this.focusedElm === this.lastDisplayedElm ? this.firstDisplayedElm : this.focusedElm+1);
			return true;
		}
		return false;
	}
	keyUp():boolean{
		if(this.focusedElm===null&&this.lastDisplayedElm!==null){
			this.focusElement(this.lastDisplayedElm);
			return true;
		}
		if(this.focusedElm!==null&&this.lastDisplayedElm!==null){
			this.focusElement(this.focusedElm === this.firstDisplayedElm ? this.lastDisplayedElm : this.focusedElm-1);
			return true;
		}
		return false;
	}
	keyTab():boolean{
		if(this.focusedElm===null||this.firstDisplayedElm===null) return false;
		let elm = this.elms[this.focusedElm??this.firstDisplayedElm];
		this.novaC.addBlock(elm.createBlock(),this.parentBlock,true);
		this.hide();
		return true;
	}

	focusElement(elmIndex:number){
		this.unfocusElement();
		this.focusedElm = elmIndex;
		let elm = this.elms[elmIndex];
		if(elm){
			elm.elm.classList.add('focused');
			elm.elm.scrollIntoView({ behavior:'auto',block:'nearest' });
		}
	}
	unfocusElement(){
		if(this.focusedElm!==null&&this.elms[this.focusedElm]) this.elms[this.focusedElm].elm.classList.remove('focused');
	}

}
