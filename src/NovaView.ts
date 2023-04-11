import { Menu, TextFileView, WorkspaceLeaf } from "obsidian";
import { Nova } from "./Nova";
import NovaNotePlugin,{ icon } from "./main";
import { NovaContent } from "./components/NovaContent";

export const VIEW_NAME = "Nova View";
export const VIEW_TYPE = "nova-view";
export const META_KEY = 'nova';
export const META_DEFAULT_VALUE = 'basic';

export class NovaView extends TextFileView {

	plugin: NovaNotePlugin;
	nova: Nova;
	content: NovaContent;
	dataArr: string[];

	constructor(leaf: WorkspaceLeaf, plugin: NovaNotePlugin) {
		super(leaf);
		this.plugin = plugin;
		this.nova = plugin.nova;
		this.icon = icon;
	}

	getViewType(){ return VIEW_TYPE; }
	getDisplayText(){ return this.file?.basename || VIEW_NAME; }
	getIcon(){ return this.icon; }

	getViewData(){ return this.dataArr.join('\n'); }
	async setViewData(data: string, clear: boolean){
		this.dataArr = data.split("\n");

		if(!this.file) return;
		let metadata = this.nova.getMetadata(this.file);
		if(!metadata) return;

		let content = new NovaContent(this);

		// this.contentEl.empty();
		// this.content = this.contentEl.createEl("div");
		//
		// let titleElm = this.content.createEl('h1');
		// /**/titleElm.textContent = this.file.basename.split('#')[0];

		// let lastSection = null;
		// let lastTab = null;
		// let headingCount = 0;
		// let headingsList = metadata.headings??[];
		// if(metadata.sections) for(let sec of metadata.sections){
		// 	let content = this.getContent(sec.type,sec.position);
		// 	switch(sec.type){
		// 		case 'heading':
		// 			let { level,heading } = headingsList[headingCount++];
		// 			lastTab = null;
		// 			if(level===1) lastSection = NoteBlocks.createSection(this.content,heading);
		// 			else if(lastSection&&level===2) lastTab = lastSection.addTab(heading);
		// 			break;
		// 		case 'comment':
		// 			let blockType = content[0].replace('%%','');
		// 			content.shift(); content.pop();
		// 			if(lastSection&&blockType==='sec-opts') lastSection.loadOptions(JSON.parse(content.join('\n')));
		// 			else if(lastTab&&blockType==='tab-opts') lastTab.loadOptions(JSON.parse(content.join('\n')));
		// 			break;
		// 		default:
		// 			if(lastTab) lastTab.addData(content);
		// 			else if(lastSection) lastSection.addData(content);
		// 			break;
		// 	}
		// }
	}
	clear(){ this.dataArr = []; }

	async onOpen() {
		//
	}
	async onClose() {
		this.contentEl.empty();
	}

	onPaneMenu(menu: Menu, source: string, callSuper: boolean = true){
		if(source !== 'more-options'){
			super.onPaneMenu(menu, source);
			return;
		}
		menu.addItem((item) => {
				item.setTitle('Open as markdown')
					.setIcon('lucide-file-text')
					.setSection('pane')
					.onClick(()=>this.nova.setMarkdownView(this.leaf));
			});
		if(callSuper) super.onPaneMenu(menu,source);
	}

	getContent(type:string, { start,end }: {start:{line:number,col:number,offset:number},end:{line:number,col:number,offset:number}}):string[]{
		let contentArr = [];
		for(let i = start.line; i <= end.line; i++){
			let row = this.dataArr[i];
			if(i===start.line){ row = row.substring(start.col); }
			else if(i===end.line){ row = row.substring(0,end.col); }
			contentArr.push(row);
		}
		return contentArr;
	}

}
