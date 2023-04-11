import { CachedMetadata, MarkdownView, setIcon, TFile, TFolder, WorkspaceLeaf } from "obsidian";
import NovaNotePlugin from "./main";
import { META_KEY, META_DEFAULT_VALUE, VIEW_TYPE, VIEW_NAME, NovaView } from "./NovaView";

interface ContextCol {
	elm: HTMLElement;
	titleElm: HTMLElement;
	listElm: HTMLElement;
	addElm: (title:string,icon:string)=>ContextElm;
}
interface ContextElm {
	elm: HTMLElement;
	iconElm: HTMLElement;
	titleElm: HTMLElement;
	col: ContextCol;
}

export class Nova {

	plugin: NovaNotePlugin;

	file: TFile|null = null;
	leaf: WorkspaceLeaf|null = null;
	container: HTMLElement|null = null;

	contextMenu: HTMLElement;

	constructor(plugin:NovaNotePlugin){
		console.log('Loading Nova Notes');
		this.plugin = plugin;
	}

	createMenu(menu:HTMLElement){
		let createCol = (title:string,call?:(col:ContextCol)=>void):ContextCol=>{
			let elm = menu.createEl('div','nova-context-col');
			let col = {
				elm,
				titleElm: elm.createEl('div','nova-context-col-title'),
				listElm: elm.createEl('div','nova-context-col-list'),
				addElm: (title:string,icon:string)=>{ return createElm(title,icon,col); }
			};
			if(title) col.titleElm.textContent = title;
			if(call) call(col);
			return col;
		};
		let createElm = (title:string,icon:string,col:ContextCol):ContextElm=>{
			let elm = col.listElm.createEl('div','nova-context-elm');
			let row = {
				elm,
				iconElm: elm.createEl('div','nova-context-row-icon nova-icon'),
				titleElm: elm.createEl('div','nova-context-row-title'),
				col
			};
			if(title) row.titleElm.textContent = title;
			if(icon) setIcon(row.iconElm,icon);
			elm.addEventListener('click',()=>{ /*TODO*/ })
			return row;
		};

		createCol('Static',(col:ContextCol)=>{
			col.addElm('List','list');
			col.addElm('Tasks','check-square');
			col.addElm('Table','table');
			col.addElm('Heading','heading');
			col.addElm('Columns','columns');
		});
		createCol('Dynamic',(col:ContextCol)=>{
			col.addElm('Timeline','history');
			col.addElm('Calendar','calendar');
		});
	}

	async loadFile(file:TFile){
		this.file = file;
		await app.workspace.getLeaf().setViewState({ type: VIEW_TYPE, state: { file: file.path }, });
	}
	async createFile(folder?:TFolder):Promise<TFile|null> {
		let leaf = app.workspace.getLeaf(true);
		let file = null;
		let path = folder ? folder.path : app.fileManager.getNewFileParent(app.workspace.getActiveFile()?.path || '').path;
		for(let i = 0; i < 100; i++){
			try {
				file = await app.vault.create(path + '\\Untitled Nova' + (i===0?'':' '+i) + '.md','---\n'+META_KEY+': '+META_DEFAULT_VALUE+'\n---\n');
				break;
			} catch(err){
				//console.warn(err);
			}
		}
		if(file===null) return null;
		await app.workspace.getLeaf().setViewState({ type: VIEW_TYPE, state: { file: file.path }, });
		return file;
	}
	saveFile(file: TFile,data:string){/* TODO */}

	isNovaFile(file:TFile):boolean {
		let meta = this.getMetadata(file);
		return meta && meta.frontmatter && meta.frontmatter[META_KEY];
	}

	async convertToNova(file: TFile,open:boolean=false){
		await app.fileManager.processFrontMatter(file,(meta)=>{ meta[META_KEY] = META_DEFAULT_VALUE; });
		if(open) await this.loadFile(file);
	}
	async revertToMarkdown(file: TFile,open:boolean=false){
		await app.fileManager.processFrontMatter(file,(meta)=>{ if(meta[META_KEY]!==undefined) delete meta[META_KEY]; })
		if(open) await this.loadFile(file);
	}

	async setMarkdownView(leaf:WorkspaceLeaf,focus:boolean=true){
		await leaf.setViewState({ type:'markdown', state:leaf.view.getState(), active:true },{ focus });
	}
	async setNovaView(leaf:WorkspaceLeaf,focus:boolean=true){
		await leaf.setViewState({ type:VIEW_TYPE, state:leaf.view.getState(), active:true },{ focus });
	}
	async toggleNova(){
		let file = app.workspace.getActiveFile();
		if(!file) return;

		const activeView = app.workspace.getActiveViewOfType(NovaView);
		if(activeView){ await this.setMarkdownView(activeView.leaf); return; }
		if(this.isNovaFile(file)){
			let activeView = app.workspace.getActiveViewOfType(MarkdownView);
			if(activeView) await this.setNovaView(activeView.leaf);
		}
	}

	getMetadata(file:TFile):CachedMetadata|null {
		return app.metadataCache.getFileCache(file);
	}

}
