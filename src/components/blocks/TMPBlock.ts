import { setIcon } from "obsidian";
import { BasicBlock } from "./BasicBlock";
import { NovaTab } from "../NovaTab";
import { TextBlock } from "./TextBlock";

export class TMPBlock extends BasicBlock {

	tmp:HTMLElement;

	constructor(tab:NovaTab,elm:HTMLElement,newBlock:boolean=false,blockName?:string){
		super(tab,elm,newBlock,blockName??'tmp');
		// @ts-ignore
		let hasDataview = app.plugins && app.plugins.enabledPlugins['dataview'];
		// @ts-ignore
		let hasTasks = app.plugins && app.plugins.enabledPlugins['obsidian-tasks-plugin'];
		let bStatic = this.createCol('Static');
		bStatic.createCell('type','Text',this.setText.bind(this));
		bStatic.createCell('list','List');
		bStatic.createCell('check-square','Tasks');
		bStatic.createCell('table','Table');
		bStatic.createCell('image','Image');
		bStatic.createCell('file-text','Markdown');
		let bDynamic = this.createCol('Dynamic');
		bDynamic.createCell('history','Timeline');
		bDynamic.createCell('calendar','Calendar');
		bDynamic.createCell('calendar-check','Date Tracker');
		bDynamic.createCell('columns','Boards');
		let bLinks = this.createCol('Links');
		bLinks.createCell('folder-symlink','Folder Cards');
		bLinks.createCell('file-symlink','Note Cards');
		bLinks.createCell('links-coming-in','Backlinks');
		bLinks.createCell('links-going-out','Outgoing');
		let bPlugins = this.createCol('Views');
		bPlugins.createCell('list-checks','Tasks View',undefined,hasDataview&&hasTasks);
		bPlugins.createCell('layout-list','Data List',undefined,hasDataview);
		bPlugins.createCell('table-2','Data Table',undefined,hasDataview);
		bPlugins.createCell('terminal-square','Data View',undefined,hasDataview);
		bPlugins.createCell('database','Database',undefined,hasDataview);
	}

	createCol(title:string){
		let col = this.body.createEl('div','nova-tmp-block-col');
		col.createEl('div','nova-tmp-block-title').textContent = title;
		let createCell = (icon:string,title:string,cb?:Function,disable:boolean=false)=>this.createCell(col,icon,title,cb,disable);
		return { col,createCell };
	}
	createCell(col:HTMLElement,icon:string,title:string,cb?:Function,disable:boolean=false){
		let cell = col.createEl('div','nova-tmp-block-cell');
		setIcon(cell.createEl('div','nova-tmp-block-c-icon').createEl('div','nova-icon'),icon);
		cell.createEl('div','nova-tmp-block-c-title').textContent = title;
		if(disable){ cell.classList.add('disabled'); }
		else if(cb){ cell.addEventListener('click',()=>cb(cell)); }
		return cell;
	}

	setText(){ this.tab.setBlock((tab,elm)=>new TextBlock(tab,elm)); }
	setList(){ /*TODO*/ }
	setTasks(){ /*TODO*/ }
	setTable(){ /*TODO*/ }
	setImage(){ /*TODO*/ }
	setMarkdown(){ /*TODO*/ }

	setTimeline(){ /*TODO*/ }
	setCalendar(){ /*TODO*/ }
	setDateTracker(){ /*TODO*/ }
	setBoards(){ /*TODO*/ }

	setFolderCards(){ /*TODO*/ }
	setNoteCards(){ /*TODO*/ }
	setBacklinks(){ /*TODO*/ }
	setOutgoing(){ /*TODO*/ }

	setTasksView(){ /*TODO*/ }
	setDataList(){ /*TODO*/ }
	setDataTable(){ /*TODO*/ }
	setDataView(){ /*TODO*/ }
	setDatabase(){ /*TODO*/ }

}
