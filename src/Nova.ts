import { type MarkdownPostProcessorContext, TFile } from "obsidian";
import NovaNotePlugin from "./main";
import parse from "./parser";

export class Nova {

	plugin: NovaNotePlugin;

	contextMenu: HTMLElement;

	constructor(plugin:NovaNotePlugin){
		console.log('Loading Nova Notes');
		this.plugin = plugin;
	}

	load(file:TFile){
		if(this.plugin.settings.handleNovaBlocks) this.handleNovaBlocks(file);
		if(this.plugin.settings.showCommands) this.handleContext(file);
	}

	handleNovaBlocks(file:TFile){}
	handleContext(file:TFile){}

	codeBlockProcessor(source:string, el:HTMLElement, ctx:MarkdownPostProcessorContext){
		const elm = el.createEl('div','nova-block');
		const nova = parse(source);
		console.log(nova)
	}

}
