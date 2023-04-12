import {setIcon, TFile} from "obsidian";
import { NovaView } from "../NovaView";
import { Nova } from "../Nova";
import NovaNotePlugin from "../main";
import { BasicBlock } from "./blocks/BasicBlock";
import { ContentLine } from "./ContentLine";
import { ContextMenu } from "./ContextMenu";
import {AddBlock} from "./blocks/AddBlock";

export class NovaContent {

	plugin: NovaNotePlugin;
	view: NovaView;
	file: TFile;
	nova: Nova;

	containerElm: HTMLElement;
	titleElm: HTMLElement;
	contentElm: HTMLElement;

	contextMenu: ContextMenu;
	blocks: BasicBlock[];
	addRow: AddBlock;

	constructor(view:NovaView){
		this.plugin = view.plugin;
		this.view = view;
		this.file = view.file;
		this.nova = view.nova;
		if(!this.file) return;

		this.containerElm = view.contentEl.createEl('div','nova-container');
		this.titleElm = this.containerElm.createEl('div','nova-title inline-title');
		this.titleElm.textContent = this.file.basename;
		this.contentElm = this.containerElm.createEl('div','nova-content');

		this.blocks = [];

		this.createContextMenu();
		this.loadPluginSettings();

		this.addRow = this.createAddBlock();

		/**TODO
		 * Create Context Menu to add Blocks
		 * Create Different Blocks
		 * Create Views and Styling
		 * Handle Blocks Interactions
		 * Allow Blocks to be Moved
		 * Allow Blocks to be moved to sides and create collumns
		 * Allow Blocks to be moves under blocks.old inside cols
		 */
	}

	loadPluginSettings(){
		let settings = this.plugin.settings;
		this.containerElm.style.width = settings.noteWidth + (settings.noteWidthPercentage?'%':'px');
	}

	createContextMenu(){
		this.contextMenu = new ContextMenu(this);
	}

	createAddBlock(location?:HTMLElement):AddBlock {
		if(!location) location = this.contentElm;
		let block = new AddBlock(this);
		location.appendChild(block.containerElm);
		return block;
	}

	load(){}
	save(){}

	addBlock(block:BasicBlock,calledFrom?:BasicBlock,clearAdd:boolean=true){
		let contentLine = new ContentLine();
		//this.contentElm.insertBefore(contentLine.elm, this.addElm);
		contentLine.addBlock(block);
		this.contentElm.insertBefore(contentLine.elm,this.addRow.containerElm);
		this.blocks.push(block);
		if(clearAdd) this.addRow.clear();
	}

}
