import { addIcon, App, CachedMetadata, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, TFolder, WorkspaceLeaf } from 'obsidian';
import { SettingsTab, DefaultSettings, Settings } from "./SettingsTab";
import { Nova } from "./Nova";
import { NovaView, VIEW_TYPE, VIEW_NAME, META_KEY } from "./NovaView";

export const icon = 'nova';

export default class NovaNotePlugin extends Plugin {

	settings: Settings;
	nova: Nova;

	async onload() {
		await this.loadSettings();

		addIcon(icon,'<path fill="currentColor" d="M8.3 25c0-6.9 5.6-12.5 12.5-12.5h58.3c6.9 0 12.5 5.6 12.5 12.5v50c0 6.9-5.6 12.5-12.5 12.5H20.8c-6.9 0-12.5-5.6-12.5-12.5V25zm20.9 4.2c-2.3 0-4.2 1.9-4.2 4.2V50c0 2.3 1.9 4.2 4.2 4.2h16.7c2.3 0 4.2-1.9 4.2-4.2V33.3c0-2.3-1.9-4.2-4.2-4.2H29.2zm4.1 16.6v-8.3h8.3v8.3h-8.3zm29.2-16.6c-2.3 0-4.2 1.9-4.2 4.2 0 2.3 1.9 4.2 4.2 4.2h8.3c2.3 0 4.2-1.9 4.2-4.2 0-2.3-1.9-4.2-4.2-4.2h-8.3zm0 16.6c-2.3 0-4.2 1.9-4.2 4.2s1.9 4.2 4.2 4.2h8.3c2.3 0 4.2-1.9 4.2-4.2s-1.9-4.2-4.2-4.2h-8.3zM29.2 62.5c-2.3 0-4.2 1.9-4.2 4.2s1.9 4.2 4.2 4.2h41.7c2.3 0 4.2-1.9 4.2-4.2s-1.9-4.2-4.2-4.2H29.2z" fill-rule="evenodd" clip-rule="evenodd"/>');
		this.addSettingTab(new SettingsTab(app, this));
		this.nova = new Nova(this);

		this.registerView(VIEW_TYPE,(leaf)=>new NovaView(leaf,this));
		this.registerHoverLinkSource(META_KEY,{ display:'Nova Note',defaultMod:true });

		// this.addRibbonIcon("package-plus", "Create Nova File",()=>{ this.nova.createFile(); });
		this.addCommand({ id:"create-nova-file", name:"Create Nova File", callback:()=>this.nova.createFile() });
		this.addCommand({ id:"toggle-nova-file", name:"Toggle Nova View", callback:()=>this.nova.toggleNova() });

		app.workspace.on("file-open",(file)=>{ if(file && this.nova.isNovaFile(file)) this.nova.loadFile(file); });
		app.workspace.on("file-menu",(menu, file, source, leaf)=>{
			if(file===null) return;
			if(file instanceof TFolder) {
				menu.addItem((item) => {
					item.setTitle('New Nova Note')
						.setIcon(icon)
						.onClick(()=>this.nova.createFile(file));
				});
				return;
			}
			if(file instanceof TFile && !this.nova.isNovaFile(file) && source==='sidebar-context-menu'){
				menu.addItem((item) => {
					item.setTitle('Open as Nova Note')
						.setIcon(icon)
						.onClick(()=>this.nova.convertToNova(file,true));
				});
				return;
			}
		});
		// app.workspace.on("active-leaf-change",(leaf:WorkspaceLeaf|null)=>{ if(leaf) this.nova.loadSpace(leaf); });
	}

	async onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE);
		super.unload();
	}

	/* SETTINGS */
	async loadSettings(){ this.settings = Object.assign({}, DefaultSettings, await this.loadData()); }
	async saveSettings(){ await this.saveData(this.settings); }

}
