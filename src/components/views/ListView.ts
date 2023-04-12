import { BlockView } from "./BlockView";
import { BasicBlock } from "../blocks/BasicBlock";
import { setIcon } from "obsidian";

interface ListRow {
	elm: HTMLElement;
	bulletElm: HTMLElement;
	iconElm: HTMLElement;
	titleElm: HTMLElement;
	tagsElm: HTMLElement;
	optsElm: HTMLElement;
	addOpts: ()=>void;
	focus: ()=>void;
}

export class ListView extends BlockView {

	body: HTMLElement;
	addElm: HTMLElement;

	rows: ListRow[];
	bullet: 'number'|'dash'|'bullet'|'alpha'|'icon';

	constructor(block:BasicBlock) {
		super(block);
		this.bullet = 'dash';
		this.body = this.viewContainer.createEl('div','nova-list-body');
		this.addElm = this.viewContainer.createEl('div','nova-list-row nova-list-add');
		/*/*/ setIcon(this.addElm.createEl('div','nova-list-row-bullet').createEl('div','nova-icon'),'plus');
		/*/*/ this.addElm.createEl('div','nova-list-row-title').textContent = 'Add Row';
		this.rows = [];
		this.addRow('').focus();

		/**TODO
		 * Enter to add row bellow
		 * Shift Enter to add row above
		 * Tab to select next row
		 * Shift Tab to select row before
		 * Drag to move row
		 * Ctrl T (inverse with shift) add title
		 * Add row actually ads row
		 */
	}

	setBullet(bullet:'number'|'dash'|'bullet'|'alpha'|'icon'){
		this.bullet = bullet;
		this.fixOrdering();
	}

	setData(data:(string|{title:string,icon?:string,tags?:string[]})[]){
		for(let dataElm of data){
			if(typeof dataElm === 'object') this.addRow(dataElm.title??dataElm,dataElm.icon,dataElm.tags);
			else this.addRow(dataElm);
		}
	}

	addRow(title:string,icon?:string,tags?:string[]):ListRow {
		let elm = this.body.createEl('div','nova-list-row');
		let bulletElm 	= elm.createEl('div','nova-list-row-bullet');
		let iconElm 	= bulletElm.createEl('div','nova-list-row-icon nova-icon');
		let titleElm 	= elm.createEl('input','nova-list-row-title nova-input');
		let tagsElm 	= elm.createEl('div','nova-list-row-tags');
		let optsElm 	= elm.createEl('div','nova-list-row-opts');
		let addOpts = ()=>{};
		let focus = ()=>{ titleElm.focus(); }

		iconElm.innerHTML = this.nextBullet();
		titleElm.value = title;
		if(tags) tagsElm.innerHTML = tags.map(tag=>"<div class='nova-list-tag'>"+ tag +"</div>").join('');
		if(icon) setIcon(iconElm, icon);

		let row = { elm,bulletElm,iconElm,titleElm,tagsElm,optsElm,addOpts,focus };
		this.rows.push(row);
		return row;
	}

	fixOrdering(){
		for(let row of this.rows){
			let index = Array.from(this.body.children).indexOf(row.elm);
			if(this.bullet!=='icon') row.iconElm.innerHTML = this.nextBullet(index);
		}
	}
	nextBullet(num?:number){
		switch(this.bullet){
			case "bullet": return '<div class="bullet-bullet">•</div>';
			case "alpha": return '<div class="bullet-num">'+getAlphanumericFor(num??this.body.children.length)+'.</div>';
			case "number": return '<div class="bullet-num">'+(num??this.body.children.length).toString()+'.</div>';
			case "dash": default: return '<div class="bullet-dash">-</div>';
		}
	}

}

function getAlphanumericFor(num:number):string {
	let arr = "abcdefghijklmnopqrstuvwxyz";
	let count = 0; let count2 = 0;
	while(num > arr.length-1){ count++; num-= arr.length-1; }
	while(count > arr.length-1){ count2++; count-= arr.length-1; }
	while(count2 > arr.length-1){ count2-= arr.length-1; }
	return (count2?(arr[count2]??'+'):'') + (count?arr[count]:'') + arr[num];
}
