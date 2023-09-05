import { addIcon, Editor, MarkdownView, Plugin } from 'obsidian';
import { SettingsTab, DefaultSettings, type Settings } from "./SettingsTab";
import { codeBlockProcessor } from './blocks';
import Nova from './Nova';

export const icon = 'nova';

export default class NovaNotePlugin extends Plugin {

	settings: Settings;
	nova: Nova;

	async onload() {
		console.info('Loading Nova Notes:');
		await this.loadSettings();

		this.nova = new Nova(this,this.settings);

		// NOVA ICON AND SETTINGS TAB
		addIcon(icon,'<path fill="currentColor" d="M8.3 25c0-6.9 5.6-12.5 12.5-12.5h58.3c6.9 0 12.5 5.6 12.5 12.5v50c0 6.9-5.6 12.5-12.5 12.5H20.8c-6.9 0-12.5-5.6-12.5-12.5V25zm20.9 4.2c-2.3 0-4.2 1.9-4.2 4.2V50c0 2.3 1.9 4.2 4.2 4.2h16.7c2.3 0 4.2-1.9 4.2-4.2V33.3c0-2.3-1.9-4.2-4.2-4.2H29.2zm4.1 16.6v-8.3h8.3v8.3h-8.3zm29.2-16.6c-2.3 0-4.2 1.9-4.2 4.2 0 2.3 1.9 4.2 4.2 4.2h8.3c2.3 0 4.2-1.9 4.2-4.2 0-2.3-1.9-4.2-4.2-4.2h-8.3zm0 16.6c-2.3 0-4.2 1.9-4.2 4.2s1.9 4.2 4.2 4.2h8.3c2.3 0 4.2-1.9 4.2-4.2s-1.9-4.2-4.2-4.2h-8.3zM29.2 62.5c-2.3 0-4.2 1.9-4.2 4.2s1.9 4.2 4.2 4.2h41.7c2.3 0 4.2-1.9 4.2-4.2s-1.9-4.2-4.2-4.2H29.2z" fill-rule="evenodd" clip-rule="evenodd"/>');
		this.addSettingTab(new SettingsTab(app, this));

		// FOLDER NOTE
		//f(this.settings.enableFolderNote){
		//	this.registerDomEvent(document, 'mouseup', (ev: MouseEvent)=>{
		//		// ONLY ALLOW LEFT AND MIDDLE CLICK
		//		if(ev.button>1) return;
		//		ev.preventDefault(); ev.stopPropagation();
		//		let target = (ev.target as HTMLElement);
		//		// ALLOW COLLAPSE ON CHEVRON CLICK
		//		if(target.classList.contains('tree-item-icon')) return;
		//		let path = target.getAttribute('data-path');
		//		// CHECK CLICKED ON ELEMENT AND NOT A CHILD
		//		if(!path && target.parentElement){
		//			target = target.parentElement;
		//			path = target.getAttribute('data-path');
		//		}
		//		if(!path) return;
		//		const folder = this.app.vault.getAbstractFileByPath(path);
		//		if(!folder || !(folder instanceof TFolder)) return;
		//		const folderName = folder.name.toLowerCase();
		//		// FIND FILE OF SAME NAME
		//		for(const file of folder.children){
		//			if(!(file instanceof TFile)) continue;
		//			const fileName = file.basename.toLowerCase();
		//			if(folderName===fileName){ openFileFromEvent(this,ev,file); return false; }
		//		}
		//		target.click();
		//	});
        //

		// RESOURCES
		if(this.settings.enableResources){
			this.nova.resources.loadResources();
			this.app.metadataCache.on('resolve',(file)=>this.nova.files.loadFile(file));
			this.app.metadataCache.on('changed',(file,data,cache)=>this.nova.files.fileChanged(file,data,cache));
			this.app.metadataCache.on('deleted',(file,cache)=>this.nova.files.fileDeleted(file,cache));
			
			// ADD RESOURCE COMMANDS
			this.addCommand({
				id: "create-nova-resource-on-file",
				name: "Create Resource On This File",
				editorCallback:(editor:Editor,ctx:MarkdownView)=>this.nova.files.createResourceOnFile(ctx.file),
			});
			//this.addCommand({
			//	id: "create-nova-resource-item",
			//	name: "Create Resource Item",
			//	editorCallback:(editor:Editor,ctx:MarkdownView)=>this.nova.files.createResourceItem(ctx.file),
			//});
		}

		// NOVA LANGUAGE
		this.app.workspace.onLayoutReady(()=>{
			if(this.settings.handleNovaBlocks){
				this.registerMarkdownCodeBlockProcessor("nova",(source,el,ctx)=>codeBlockProcessor(this.nova,source,el,ctx));
			}
		});
	}

	async onunload() {
		super.unload();
	}

	/* SETTINGS */
	async loadSettings(){ this.settings = Object.assign({}, DefaultSettings, await this.loadData()); }
	async saveSettings(){ await this.saveData(this.settings); }

}
