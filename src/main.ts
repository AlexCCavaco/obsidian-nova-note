import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { NovaView, VIEW_TYPE } from "./src/NovaView";
import { NovaFile } from "./src/NovaFile";
import { SettingsTab } from "./src/SettingsTab";

// Remember to rename these classes and interfaces!

interface Settings {
	enableFolderNote: boolean;
	folderFileName: string;
	allowSameFolderName: boolean;
}

const DEFAULT_SETTINGS: Settings = {
	enableFolderNote: true,
	folderFileName: '_main',
	allowSameFolderName: true
}

export default class NovaNotePlugin extends Plugin {
	settings: Settings;

	async onload() {
		await this.loadSettings();

		this.registerView(VIEW_TYPE,(leaf) => new NovaView(leaf,this));
		this.addRibbonIcon("package-plus", "Create Nova File",()=>{ this.createNovaFile(); });
		this.addCommand({ id:"create-nova-file", name:"Create Nova File", callback:()=>{ this.createNovaFile(); } });

		this.addSettingTab(new SettingsTab(this.app, this));

		/**
		 * TODO
		 * - Have a Nova View with blocks
		 * - Have way to had
		 * :blocks:
		 * - Text
		 * - List
		 * - Tasks
		 * - Parent Folder File/Folder Cards
		 * - Table
		 * - Cards that link to specified notes
		 * - Timeline
		 * - Calendar
		 * - Custom md/html
		 * - Board
		 * :features:
		 * - Open File of Same Name or _main when Folder is Clicked
		 * :settings:
		 * - Default Folder File Name [default:_main]
		 */

	}

	async onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE);
	}

	async createNovaFile() {
		let leaf = this.app.workspace.getLeaf(true);
		let file = null;
		for(let i = 0; i < 100; i++){
			try {
				this.app.
				file = await this.app.vault.create(this.app.vault.configDir + '/Untitled Nova' + (i===0?'':' '+i),'');
				break;
			} catch(err){}
		}
		if(file===null) return;
		await leaf.openFile(file);
		//let file = new NovaFile(this);
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE)[0]
		);
	}

	/* SETTINGS */

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
