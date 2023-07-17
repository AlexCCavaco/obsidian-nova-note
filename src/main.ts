import { addIcon, Plugin } from 'obsidian';
import { SettingsTab, DefaultSettings, type Settings } from "./SettingsTab";
import { fileChanged, fileDeleted, loadResources, count as resourceCount } from './resources';
import { codeBlockProcessor } from './blocks';

export const icon = 'nova';

export default class NovaNotePlugin extends Plugin {

	settings: Settings;

	async onload() {
		console.info('Loading Nova Notes:');
		await this.loadSettings();

		addIcon(icon,'<path fill="currentColor" d="M8.3 25c0-6.9 5.6-12.5 12.5-12.5h58.3c6.9 0 12.5 5.6 12.5 12.5v50c0 6.9-5.6 12.5-12.5 12.5H20.8c-6.9 0-12.5-5.6-12.5-12.5V25zm20.9 4.2c-2.3 0-4.2 1.9-4.2 4.2V50c0 2.3 1.9 4.2 4.2 4.2h16.7c2.3 0 4.2-1.9 4.2-4.2V33.3c0-2.3-1.9-4.2-4.2-4.2H29.2zm4.1 16.6v-8.3h8.3v8.3h-8.3zm29.2-16.6c-2.3 0-4.2 1.9-4.2 4.2 0 2.3 1.9 4.2 4.2 4.2h8.3c2.3 0 4.2-1.9 4.2-4.2 0-2.3-1.9-4.2-4.2-4.2h-8.3zm0 16.6c-2.3 0-4.2 1.9-4.2 4.2s1.9 4.2 4.2 4.2h8.3c2.3 0 4.2-1.9 4.2-4.2s-1.9-4.2-4.2-4.2h-8.3zM29.2 62.5c-2.3 0-4.2 1.9-4.2 4.2s1.9 4.2 4.2 4.2h41.7c2.3 0 4.2-1.9 4.2-4.2s-1.9-4.2-4.2-4.2H29.2z" fill-rule="evenodd" clip-rule="evenodd"/>');
		this.addSettingTab(new SettingsTab(app, this));

		if(this.settings.handleNovaBlocks){
			this.registerMarkdownCodeBlockProcessor("nova",codeBlockProcessor);
		}
		if(this.settings.enableResources){
			loadResources(this);
			this.app.metadataCache.on('changed',fileChanged);
			this.app.metadataCache.on('deleted',fileDeleted);
			console.info(`Loaded ${resourceCount} Resources`);
		}
	}

	async onunload() {
		super.unload();
	}

	/* SETTINGS */
	async loadSettings(){ this.settings = Object.assign({}, DefaultSettings, await this.loadData()); }
	async saveSettings(){ await this.saveData(this.settings); }

}
