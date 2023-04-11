import { TFile } from "obsidian";
import { NovaView } from "../NovaView";
import { Nova } from "../Nova";
import NovaNotePlugin from "../main";
import { BasicBlock } from "./blocks/BasicBlock";
import { ContentLine } from "./ContentLine";

export class NovaContent {

	plugin: NovaNotePlugin;
	view: NovaView;
	file: TFile;
	nova: Nova;

	container: HTMLElement;
	titleElm: HTMLElement;
	contentElm: HTMLElement;
	addElm: HTMLElement;

	blocks: BasicBlock[];

	constructor(view:NovaView){
		this.plugin = view.plugin;
		this.view = view;
		this.file = view.file;
		this.nova = view.nova;
		if(!this.file) return;

		this.container = view.contentEl.createEl('div','nova-container');
		this.titleElm = this.container.createEl('div','nova-title inline-title');
		this.titleElm.textContent = this.file.basename;
		this.contentElm = this.container.createEl('div','nova-content');
		this.addElm = this.contentElm.createEl('div','nova-add-block');

		this.blocks = [];

		this.loadPluginSettings();

		/**TODO
		 * Create Context Menu to add Blocks
		 * Create Different Blocks
		 * Create Views and Styling
		 * Handle Blocks Interactions
		 * Allow Blocks to be Moved
		 * Allow Blocks to be moved to sides and create collumns
		 * Allow Blocks to be moves under blocks inside cols
		 */
	}

	loadPluginSettings(){
		let settings = this.plugin.settings;
		this.container.style.width = settings.noteWidth + (settings.noteWidthPercentage?'%':'px');
	}

	load(){}
	save(){}

	addBlock(block:BasicBlock){
		let contentLine = new ContentLine();
		this.contentElm.insertBefore(contentLine.elm, this.addElm);
		contentLine.addBlock(block);
		this.blocks.push(block);
	}

}
