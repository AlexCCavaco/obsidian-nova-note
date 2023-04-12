export {};
// import { BasicBlock } from "../blocks/BasicBlock";
// import { setIcon } from "obsidian";
//
// interface ListRow {
// 	elm: HTMLElement,
// 	wrap: HTMLElement,
// 	subs: HTMLElement,
// 	move: HTMLElement,
// 	input: HTMLElement,
// 	controls: HTMLElement,
// 	level: number
// }
//
// export class ListBlock extends BasicBlock {
//
// 	listBody: HTMLElement;
// 	listAdd: HTMLElement;
// 	rows: ListRow[];
//
// 	constructor(blockName?:string){
// 		super(blockName??'list');
// 		this.listBody = this.containerElm.createEl('div','nova-list-body');
// 		this.listAdd = this.containerElm.createEl('div','nova-list-add nova-list-row-block');
// 		setIcon(this.listAdd.createEl('div','nova-list-add-icon nova-icon'),'plus');
// 		this.listAdd.createEl('div','nova-list-add-title').textContent = 'Add Item';
// 		this.rows = [];
// 	}
//
// 	setData(data:string,override=true){
// 		if(override) this.listBody.empty();
// 		let dataArr = data.split('\n').filter(item=>item.trim()!=='');
// 		let lastOfLevel:ListRow[] = [];
// 		for(let itemData of dataArr){
// 			let level = 1;
// 			for(let c of itemData){ if(c==='\t'){ level++; } }
// 			itemData = itemData.trim();
// 			let lineIndex = itemData.indexOf('- ');
// 			if(lineIndex===0) itemData = itemData.replace('- ','');
// 			let addInto = null;
// 			if(level!==1){
// 				for(let i = lastOfLevel.length; i > 1; i--) if(lastOfLevel[i-1].level>=level) lastOfLevel.pop();
// 				if(lastOfLevel.length > 0) addInto = lastOfLevel[lastOfLevel.length-1].subs;
// 			} else lastOfLevel = [];
// 			let row = this.createRow(itemData,level,addInto?{ at:'in',elm:addInto }:undefined);
// 			lastOfLevel.push(row);
// 		}
// 		//TODO
// 	}
//
// 	getData():string{
// 		return '';//TODO
// 	}
//
// 	createRow(title:string,level:number=1,add?:{ at?:'after'|'before'|'in',elm:HTMLElement }):ListRow{
// 		let elm = this.listBody.createEl('div','nova-list-row');
// 		if(add&&add.elm.parentElement){
// 			let addType = add.at??'after';
// 			if(addType==='after') add.elm.parentElement.insertAfter(elm,add.elm);
// 			else if(addType==='before') add.elm.parentElement.insertBefore(elm,add.elm);
// 			else add.elm.appendChild(elm);
// 		}
// 		let wrap = elm.createEl('div','nova-list-row-block');
// 		let subs = elm.createEl('div','nova-list-row-sub');
// 		/*==*/
// 		let move = wrap.createEl('div','move'); setIcon(move,'grip-vertical');
// 		let input = wrap.createEl('input','title');
// 		input.placeholder = 'List Item';
// 		input.value = title;
// 		let controls = wrap.createEl('div','opts');
// 		let row = { elm,wrap,subs,move,input,controls,level };
// 		this.rows.push(row);
// 		return row;
// 	}
//
// }
