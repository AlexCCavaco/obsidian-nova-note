import { addIcon, Editor, MarkdownView, Plugin, TFile, TFolder } from 'obsidian';
import { SettingsTab, DefaultSettings, type Settings } from "./SettingsTab";
import { addResourceToFile, createResourceOnFile, fileChanged, fileDeleted, loadResourceOfFile } from './resources';
import { codeBlockProcessor } from './blocks';
import { openFileFromEvent } from './handlers/leafHandler';
import { prepareLoader } from './handlers/dataLoader';

export const icon = 'nova';

export default class NovaNotePlugin extends Plugin {

	settings: Settings;

	async onload() {
		console.info('Loading Nova Notes:');
		await this.loadSettings();

		// NOVA ICON AND SETTINGS TAB
		addIcon(icon,'<path fill="currentColor" d="M8.3 25c0-6.9 5.6-12.5 12.5-12.5h58.3c6.9 0 12.5 5.6 12.5 12.5v50c0 6.9-5.6 12.5-12.5 12.5H20.8c-6.9 0-12.5-5.6-12.5-12.5V25zm20.9 4.2c-2.3 0-4.2 1.9-4.2 4.2V50c0 2.3 1.9 4.2 4.2 4.2h16.7c2.3 0 4.2-1.9 4.2-4.2V33.3c0-2.3-1.9-4.2-4.2-4.2H29.2zm4.1 16.6v-8.3h8.3v8.3h-8.3zm29.2-16.6c-2.3 0-4.2 1.9-4.2 4.2 0 2.3 1.9 4.2 4.2 4.2h8.3c2.3 0 4.2-1.9 4.2-4.2 0-2.3-1.9-4.2-4.2-4.2h-8.3zm0 16.6c-2.3 0-4.2 1.9-4.2 4.2s1.9 4.2 4.2 4.2h8.3c2.3 0 4.2-1.9 4.2-4.2s-1.9-4.2-4.2-4.2h-8.3zM29.2 62.5c-2.3 0-4.2 1.9-4.2 4.2s1.9 4.2 4.2 4.2h41.7c2.3 0 4.2-1.9 4.2-4.2s-1.9-4.2-4.2-4.2H29.2z" fill-rule="evenodd" clip-rule="evenodd"/>');
		this.addSettingTab(new SettingsTab(app, this));
		/*/<=>/*/ prepareLoader(this);

		// FOLDER NOTE
		if(this.settings.enableFolderNote){
			this.registerDomEvent(document, 'mouseup', (ev: MouseEvent)=>{
				// ONLY ALLOW LEFT AND MIDDLE CLICK
				if(ev.button>1) return;
				ev.preventDefault(); ev.stopPropagation();
				let target = (ev.target as HTMLElement);
				// ALLOW COLLAPSE ON CHEVRON CLICK
				if(target.classList.contains('tree-item-icon')) return;
				let path = target.getAttribute('data-path');
				// CHECK CLICKED ON ELEMENT AND NOT A CHILD
				if(!path && target.parentElement){
					target = target.parentElement;
					path = target.getAttribute('data-path');
				}
				if(!path) return;
				const folder = this.app.vault.getAbstractFileByPath(path);
				if(!folder || !(folder instanceof TFolder)) return;
				const folderName = folder.name.toLowerCase();
				// FIND FILE OF SAME NAME
				for(const file of folder.children){
					if(!(file instanceof TFile)) continue;
					const fileName = file.basename.toLowerCase();
					if(folderName===fileName){ openFileFromEvent(this,ev,file); return false; }
				}
				target.click();
			});
        }

		// RESOURCES
		if(this.settings.enableResources){
			this.app.metadataCache.on('resolve',(file)=>loadResourceOfFile(this,file));
			this.app.metadataCache.on('changed',fileChanged);
			this.app.metadataCache.on('deleted',fileDeleted);
			
			// ADD RESOURCE COMMANDS
			this.addCommand({
				id: "create-nova-resource-on-file",
				name: "Create Nova Resource",
				editorCallback:(editor:Editor,ctx:MarkdownView)=>createResourceOnFile(this,ctx.file),
			});
			this.addCommand({
				id: "add-nova-resource-to-file",
				name: "Add a Nova Resource to File",
				editorCallback:(editor:Editor,ctx:MarkdownView)=>addResourceToFile(this,ctx.file),
			});
		}

		// NOVA LANGUAGE
		this.app.workspace.onLayoutReady(()=>{
			if(this.settings.handleNovaBlocks){
				this.registerMarkdownCodeBlockProcessor("nova",codeBlockProcessor);
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
