import {BlockView, ViewDataType} from "./BlockView";
import { BasicBlock } from "../blocks/BasicBlock";
import { setIcon } from "obsidian";
import { ListRow } from "./elements/ListRow";
import { ListDataRow } from "./elements/ListDataRow";
import { ListTitleRow } from "./elements/ListTitleRow";
import {getAlphanumericFor} from "../../tools/StringManipulator";

export type RowPositionSetting = 'after'|'before'|'top'|'bottom';
export type RowLocationSetting = { row:ListRow,pos:RowPositionSetting };

export class ListView extends BlockView {

	static viewname = 'list';

	body: HTMLElement;
	addElm: HTMLElement;
	maxIdentLevel: number = 7;

	rows: ListRow[];
	draggedRow: ListRow|null;
	bullet: 'number'|'dash'|'bullet'|'alpha'|'icon';

	listedRows: ListRow[];
	firstListedRow: ListRow|null;
	lastListedRow: ListRow|null;

	constructor(block:BasicBlock,dataType:ViewDataType,id?:string,name?:string,viewname?:string) {
		super(block,dataType,id,name,viewname??ListView.viewname);
		this.bullet = 'dash';
		this.body = this.viewContainer.createEl('div','nova-list-body');
		this.addElm = this.viewContainer.createEl('div','nova-list-row-line nova-list-add');
		/*/*/ setIcon(this.addElm.createEl('div','nova-list-row-bullet').createEl('div','nova-icon'),'plus');
		/*/*/ this.addElm.createEl('div','nova-list-row-title').textContent = 'Add Row';
		/*/*/ this.addElm.addEventListener('click',()=>this.addNewRow.call(this));

		this.firstListedRow = null;
		this.lastListedRow = null;
		this.listedRows = [];

		this.rows = [];
		this.draggedRow = null;
		this.addRow('').focus();
	}

	setBullet(bullet:'number'|'dash'|'bullet'|'alpha'|'icon'){
		this.bullet = bullet;
		this.fixOrdering();
	}

	clear(){
		this.body.empty();
		this.rows = [];
		this.draggedRow = null;
		this.listedRows = [];
		this.firstListedRow = null;
		this.lastListedRow = null;
	}

	addRowTo(row:ListRow,pos?:RowPositionSetting,refRow?:ListRow){
		let destination:ListRow|ListView = refRow??this;
		let destInnerElm:HTMLElement = refRow ? refRow.listElm : this.body;
		this.removeRowFrom(row,row.parentRow);
		if(!pos) pos = 'after';
		if(pos==='top'||(!refRow&&pos==='before')){
			destInnerElm.insertBefore(row.elm,destination.firstListedRow ? destination.firstListedRow.elm : null);
			if(destination.firstListedRow) destination.firstListedRow.previousRow = row;
			destination.firstListedRow = row;
			row.nextRow = destination.firstListedRow;
		} else if(pos==='bottom'||(!refRow&&pos==='after')){
			destInnerElm.insertAfter(row.elm,destination.lastListedRow ? destination.lastListedRow.elm : null);
			if(destination.lastListedRow) destination.lastListedRow.nextRow = row;
			destination.lastListedRow = row;
			row.previousRow = destination.lastListedRow;
		} else if(refRow){
			let parent:ListRow|ListView = row.parentRow??this;
			let parentInnerElm:HTMLElement = row.parentRow ? row.parentRow.listElm : this.body;
			if(pos==='before'){
				parentInnerElm.insertBefore(row.elm,refRow.elm);
				row.nextRow = refRow;
				row.previousRow = refRow.previousRow;
				if(row.previousRow) row.previousRow.nextRow = row;
				else parent.firstListedRow = row;
				refRow.previousRow = row;
			} else if(pos==='after'){
				parentInnerElm.insertAfter(row.elm,refRow.elm);
				row.previousRow = refRow;
				row.nextRow = refRow.nextRow;
				if(row.nextRow) row.nextRow.previousRow = row;
				else parent.lastListedRow = row;
				refRow.nextRow = row;
			}
		}
	}
	removeRowFrom(row:ListRow,parentRow?:ListRow|null){
		let origin:ListRow|ListView = parentRow??row.parentRow??this;
		let pRow = row.previousRow;
		let nRow = row.nextRow;
		if(nRow) nRow.previousRow = pRow??null;
		else origin.lastListedRow = pRow;
		if(pRow) pRow.nextRow = nRow??null;
		else origin.firstListedRow = nRow;
		for(let i = 0; i < origin.listedRows.length; i++){
			let irow = origin.listedRows[i];
			if(irow.elm.isSameNode(row.elm)){ origin.listedRows.splice(i,1); }
		}
		if(origin.listedRows.length===0){
			origin.firstListedRow = null;
			origin.lastListedRow = null;
		}
	}

	removeRow(row:ListRow){
		for(let i = 0; i < this.rows.length; i++){
			let irow = this.rows[i];
			if(irow.elm.isSameNode(row.elm)){
				this.rows.splice(i,1);
				row.elm.remove();
			}
		}
	}

	addNewRow(location?:RowLocationSetting):ListDataRow {
		let row = this.addRow('',undefined,undefined,location);
		row.focus();
		return row;
	}
	addRow(title:string,icon?:string,attributes?:{},location?:RowLocationSetting):ListDataRow {
		let row = new ListDataRow(this);
		row.setTitle(title);
		if(icon) row.setIcon(icon);
		if(attributes) row.setAttributes(attributes);
		this.appendRowToList(row,location);
		return row;
	}

	addNewTitle(location?:RowLocationSetting):ListTitleRow {
		let row = this.addTitle('',location);
		row.focus();
		return row;
	}
	addTitle(title:string,location?:RowLocationSetting):ListTitleRow {
		let row = new ListTitleRow(this);
		row.setTitle(title);
		this.appendRowToList(row,location);
		return row;
	}

	appendRowToList(row:ListRow,location?:RowLocationSetting){
		if(location){
			if(location.pos==='before') this.body.insertBefore(row.elm,location.row.elm);
			else this.body.insertAfter(row.elm,location.row.elm);
		} else {
			this.body.appendChild(row.elm);
		}
		this.rows.push(row);
		row.setBullet(this.bullet,this.nextBullet());
		row.addAllEvents();
		return row;
	}

	getNextRow(row:ListRow):ListRow|null {
		let elm = row.elm;
		let nextElement = elm.nextElementSibling;
		let nextRow = null;
		for(let irow of this.rows){ if(irow.elm.isSameNode(nextElement)) nextRow = irow; }
		return nextRow;
	}
	getPrevRow(row:ListRow):ListRow|null {
		let elm = row.elm;
		let prevElement = elm.previousElementSibling;
		let prevRow = null;
		for(let irow of this.rows){ if(irow.elm.isSameNode(prevElement)) prevRow = irow; }
		return prevRow;
	}

	fixOrdering(){
		for(let row of this.rows){
			let index = Array.from(this.body.children).indexOf(row.elm);
			row.setBullet(this.bullet,this.nextBullet(index));
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

function handleListLine(){
	// (.*?)(?:\:\:|$)(?:(.*?)(?:--|$)(.*?))
}
