import { CachedMetadata, MarkdownView, setIcon, TFile, TFolder, WorkspaceLeaf } from "obsidian";
import NovaNotePlugin from "./main";
import { META_KEY, META_DEFAULT_VALUE, VIEW_TYPE, VIEW_NAME, NovaView } from "./NovaView";

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
