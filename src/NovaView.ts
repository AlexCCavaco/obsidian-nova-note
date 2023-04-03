import { TextFileView, WorkspaceLeaf } from "obsidian";
import NovaNotePlugin from "../../obsidian-nova-note/main";

export const VIEW_NAME = "Nova View";
export const VIEW_TYPE = "nova-view";

export class NovaView extends TextFileView {
	plugin: NovaNotePlugin;
	content: HTMLElement;

	constructor(leaf: WorkspaceLeaf, plugin: NovaNotePlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(){ return VIEW_TYPE; }
	getDisplayText(){ return VIEW_NAME; }

	getViewData(){ return this.data; }
	setViewData(data: string, clear: boolean){
		this.data = data;
		let dataArr = data.split("\n").map((line) => line.split(","));

		this.contentEl.empty();
		this.contentEl.createDiv({ text: this.data });
	}
	clear(){ this.data = ""; }

	async onOpen() {
		this.content = this.contentEl.createEl("div");
	}
	async onClose() {
		this.contentEl.empty();
	}

}
