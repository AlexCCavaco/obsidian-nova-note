import NovaNotePlugin from "./main";
import {App, PluginSettingTab, Setting, TextComponent} from "obsidian";

export interface Settings {
	/* FOLDER NOTE */
	enableFolderNote: boolean;
	folderFileName: string;
	allowSameFolderName: boolean;
	hideFolderNote: boolean;
	/* BLOCKS */
	handleNovaBlocks: boolean;
	noteWidth: number;
	noteWidthPercentage: boolean;
	/* COMMANDS */
	showCommands: boolean;
	commandCallText: string;
}

export const DefaultSettings: Settings = {
	/* FOLDER NOTE */
	enableFolderNote: true,
	folderFileName: '_main',
	allowSameFolderName: true,
	hideFolderNote: true,
	/* NOVA NOTE */
	handleNovaBlocks: true,
	noteWidth: 80,
	noteWidthPercentage: true,
	/* COMMANDS */
	showCommands: true,
	commandCallText: '/',
}

export class SettingsTab extends PluginSettingTab {
	plugin: NovaNotePlugin;

	constructor(app: App, plugin: NovaNotePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;
		containerEl.empty();

		/* FOLDER NOTE */
		containerEl.createEl('h2','folder-note',(el)=>{ el.textContent = 'Folder Note'; });

		new Setting(containerEl)
			.setName("Enable Folder Note")
			.setDesc("Folder Notes open whenever you click on a folder (if they exist).")
			.addToggle((tog) =>
				tog	.setValue(this.plugin.settings.enableFolderNote)
					.onChange(async (value) => {
						this.plugin.settings.enableFolderNote = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Default Folder Note Name")
			.setDesc("A general name for the Folder Note. This will take precedence over same name Notes.")
			.addText((txt) =>
				txt .setPlaceholder("_main")
					.setValue(this.plugin.settings.folderFileName)
					.onChange(async (value) => {
						this.plugin.settings.folderFileName = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Allow Folder Notes with Folder Name")
			.setDesc("When a folder is clicked if there is not file of the name above, the plugin will check for one of the same name as the folder.")
			.addToggle((tog) =>
				tog .setValue(this.plugin.settings.allowSameFolderName)
					.onChange(async (value) => {
						this.plugin.settings.allowSameFolderName = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Hide Folder Note")
			.setDesc("Hide the note under the folder and only use the folder click to open the note.")
			.addToggle((tog) =>
				tog .setValue(this.plugin.settings.hideFolderNote)
					.onChange(async (value) => {
						this.plugin.settings.hideFolderNote = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl('br');

		/* NOVA NOTE*/
		containerEl.createEl('h2','nova-note',(el)=>{ el.textContent = 'Nova Note'; });

		let prevNoteWidthValue = this.plugin.settings.noteWidth;
		new Setting(containerEl)
			.setName("Note Width")
			.setDesc("The max width for a Nova Note. Both integer and percentages work (300, 1200, 40%, 85%, ...)")
			.addText((txt) =>
				txt .setPlaceholder("_main")
					.setValue(this.plugin.settings.noteWidth.toString() + (this.plugin.settings.noteWidthPercentage?'%':''))
					.onChange(async (value) => {
						let percentageIndex = value.indexOf('%');
						if(percentageIndex>=0&&percentageIndex!==(value.length-1)) return this.clearTextValue(txt,prevNoteWidthValue);
						value = value.replace('%','');
						if(Number.isNaN(value)||Number.isNaN(Number.parseInt(value))) return this.clearTextValue(txt,prevNoteWidthValue);
						let nVal = Number.parseInt(value);
						if(nVal<0) return this.clearTextValue(txt,prevNoteWidthValue);
						prevNoteWidthValue = this.plugin.settings.noteWidth = nVal;
						txt.setValue(this.plugin.settings.noteWidth.toString() + (percentageIndex>0 ? '%' : ''));
						this.plugin.settings.noteWidthPercentage = (percentageIndex>0);
						await this.plugin.saveSettings();
					})
			);
	}

	clearTextValue(component: TextComponent, value: string|number){
		component.setValue(value.toString());
	}

}
