import NovaNotePlugin from "../main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class ExampleSettingTab extends PluginSettingTab {
	plugin: NovaNotePlugin;

	constructor(app: App, plugin: NovaNotePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2','Folder Note')

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
			.setDesc("A consitent name for the Folder Note. This will take precedence over same name Notes.")
			.addText((txt) =>
				txt .setPlaceholder("_main")
					.setValue(this.plugin.settings.folderFileName)
					.onChange(async (value) => {
						this.plugin.settings.folderFileName = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Allow Same Folder Name Note")
			.setDesc("When a folder is clicked if there is not file of the name above, the plugin will check for one of the same name as the folder.")
			.addToggle((tog) =>
				tog .setValue(this.plugin.settings.allowSameFolderName)
					.onChange(async (value) => {
						this.plugin.settings.allowSameFolderName = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
