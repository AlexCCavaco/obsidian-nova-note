import { ListView,RowPositionSetting } from "../ListView";
import { setIcon } from "obsidian";

export class ListRow {

	elm: HTMLElement;
	lineElm: HTMLElement;
	bulletElm: HTMLElement;
	listElm: HTMLElement;
	iconElm: HTMLElement;
	dragElm: HTMLElement;
	titleElm: HTMLInputElement;
	optsElm: HTMLElement;
	ident: number = 1;

	list: ListView;
	icon: string|null;
	keyEvents: ((ev:KeyboardEvent,key:string)=>boolean)[];

	parentRow: ListRow|null;
	nextRow: ListRow|null;
	previousRow: ListRow|null;
	listedRows: ListRow[];
	firstListedRow: ListRow|null;
	lastListedRow: ListRow|null;

	constructor(list:ListView){
		this.list = list;
		this.elm = document.createElement('div');
		this.elm.draggable = true;
		this.elm.classList.add('nova-list-row');
		this.lineElm = this.elm.createEl('div','nova-list-row-line');
		this.listElm = this.elm.createEl('div','nova-list-row-list');

		this.bulletElm = this.lineElm.createEl('div','nova-list-row-bullet');
		this.iconElm = this.bulletElm.createEl('div','nova-list-row-icon nova-icon');
		this.dragElm = this.bulletElm.createEl('div','nova-list-row-drag nova-icon');
		/*/*/ setIcon(this.dragElm,'grip-vertical');
		this.titleElm = this.lineElm.createEl('input','nova-list-row-title nova-input');
		this.optsElm = this.lineElm.createEl('div','nova-list-row-opts');

		this.icon = null;
		this.keyEvents = [];

		this.parentRow = null;
		this.nextRow = null;
		this.previousRow = null;
		this.listedRows = [];
		this.firstListedRow = null;
		this.lastListedRow = null;

		this.titleElm.addEventListener('keydown',(ev)=>{
			let key = ev.key.toLowerCase();
			for(let i = 0; i < this.keyEvents.length; i++) if(!this.keyEvents[i](ev,key)) break;
		});
	}

	setTitle(title:string){
		this.titleElm.value = title;
	}
	setIcon(icon:string){
		this.icon = icon;
		if(this.list.bullet==='icon') setIcon(this.iconElm, icon);
	}
	setBullet(bulletType:string,bulletHTML:string){
		if(bulletType==='icon'){
			if(this.icon) setIcon(this.iconElm, this.icon);
			else this.iconElm.empty();
		} else this.iconElm.innerHTML = bulletHTML; }

	addOpts(){/*TODO*/}

	focus(){
		setTimeout(()=>this.titleElm.focus(),100);
	}

	addRow(row:ListRow,pos?:RowPositionSetting){
		this.list.addRowTo(row,pos??'bottom',this);
	}
	removeRow(row:ListRow){
		this.list.removeRowFrom(row,this);
	}

	/*/==> EVENTS <==/*/

	addAllEvents(){
		this.addKeyboardEvents();
		this.addRemoveOnBlurEvent();
		this.addDragDropEvents();
	}
	addKeyboardEvents(){
		this.addEnterEvent();
		this.addTabEvent();
	}
	addEnterEvent(){
		this.keyEvents.push((ev:KeyboardEvent,key:string)=>{
			if(key!=='enter') return true;
			if(ev.ctrlKey){
				if(ev.shiftKey) this.list.addNewTitle({ row:this,pos:'before' });
				else this.list.addNewTitle({ row:this,pos:'after' });
				return false;
			}
			if(ev.shiftKey) this.list.addNewRow({ row:this,pos:'before' });
			else this.list.addNewRow({ row:this,pos:'after' });
			return false;
		});
	}
	addTabEvent(){
		this.keyEvents.push((ev:KeyboardEvent,key:string)=>{
			if(key!=='tab') return true;
			if(ev.shiftKey) this.list.getPrevRow(this)?.focus(); else this.list.getNextRow(this)?.focus();
			return false;
		});
	}
	addRemoveOnBlurEvent(){
		this.titleElm.addEventListener('blur',()=>{
			if(this.titleElm.value.trim()==='') this.list.removeRow(this);
		});
	}

	addDragDropEvents(){
		this.elm.addEventListener('dragstart',ev=>{
			if(ev.dataTransfer){
				ev.dataTransfer.setData("text/plain", this.titleElm.value);
				ev.dataTransfer.setData("text/html", this.elm.outerHTML);
				ev.dataTransfer.dropEffect = 'copy';
			}
			this.list.draggedRow = this;
		});
		this.elm.addEventListener('dragend',ev=>{
			this.list.draggedRow = null;
			clearDragClasse(...this.list.rows.map(r=>r.elm));
		});
		this.elm.addEventListener('drop',ev=>{
			if(!this.list.draggedRow) return;
			ev.preventDefault(); ev.stopPropagation();
			this.addRow(this.list.draggedRow,dragToLocation(getDragPosition(ev,this.elm)));
			this.list.draggedRow = null;
			clearDragClasse(this.elm);
		});
		this.elm.addEventListener('dragover',ev=>{
			if(!this.list.draggedRow) return;
			ev.preventDefault(); ev.stopPropagation();
			let [pX,pY] = getDragPosition(ev,this.elm);
			clearDragClasse(this.elm);
			if(this.list.maxIdentLevel > this.ident && pX > .5) this.elm.classList.add('drag-over','drag-side');
			else if(pY > .5) this.elm.classList.add('drag-over','drag-bot');
			else this.elm.classList.add('drag-over','drag-top');
		});
		this.elm.addEventListener('dragleave',ev=>{
			if(!this.list.draggedRow) return;
			clearDragClasse(this.elm);
		});
	}

}

function dragToLocation([pX,pY]:[number,number]):RowPositionSetting {
	if(pX < .5){
		if(pY < .5) return 'before';
		return 'top';
	}
	if(pY < .5) return 'after';
	return 'bottom';
}

function clearDragClasse(...elements:HTMLElement[]){
	for(let elm of elements) elm.classList.remove('drag-over','drag-bot','drag-top','drag-side');
}

function getDragPosition(ev:DragEvent,elm:HTMLElement):[number,number] {
	let rect = elm.getBoundingClientRect();
	return [ ev.offsetX / rect.width, ev.offsetY / rect.height ];
}
