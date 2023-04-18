import { CachedMetadata, CacheItem, TFile } from "obsidian";
import { NovaView } from "../NovaView";
import { Nova } from "../Nova";
import NovaNotePlugin from "../main";
import { getBlock } from "./Blocks";
import { BasicBlock } from "./blocks/BasicBlock";
import { ContentLine } from "./ContentLine";
import { ContextMenu } from "./ContextMenu";
import { AddBlock } from "./blocks/AddBlock";
import { randomCode } from "../tools/StringManipulator";
import { BlockView } from "./layouts.bak/BlockView";
import { BlockData, ContentData, handleBlockData, processBlockquote, processBreak, processCode, processFootnote, processList, processParagraph } from "../tools/MDContentHandler";
import { ColumnBlock } from "./blocks/ColumnBlock";

export class NovaContent {

	plugin: NovaNotePlugin;
	view: NovaView;
	file: TFile;
	nova: Nova;

	containerElm: HTMLElement;
	titleElm: HTMLElement;
	contentElm: HTMLElement;

	contextMenu: ContextMenu;
	sets: {}[];
	views: { [key:string]:BlockView };
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

		this.sets = [];
		this.views = {};
		this.blocks = [];

		this.createContextMenu();
		this.loadPluginSettings();

		this.addRow = this.createAddBlock();
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

	load(meta:CachedMetadata,data:string[]){
		let lastBlock:BasicBlock|null = null;
		let cols:ColumnBlock[] = [];
		if(meta.sections) for(let sec of meta.sections){
			let secData = getDataAt(data,sec.position);
			let content:ContentData|null = null;
			switch(sec.type){
				case 'paragraph': content = processParagraph(this,secData); break;
				case 'list': content = processList(this,secData); break;
				case 'blockquote': content = processBlockquote(this,secData); break;
				case 'code': content = processCode(this,secData); break;
				case 'thematicBreak': content = processBreak(this,secData); break;
				case 'footnoteDefinition': content = processFootnote(this,secData); break;
				case 'comment':
					let commentBlocks:string[][] = [];
					let lastIndex = 0;
					let inComment = false;
					for(let line of secData){
						if(inComment){
							if(line.includes('%%')){
								line = line.replace('%%','');
								commentBlocks[lastIndex].push(line);
							} else {
								commentBlocks[lastIndex].push(line);
							}
							continue;
						}
						if(line.indexOf('%%')===0){
							inComment = true;
							line = line.replace('%%','');
							commentBlocks.push([]);
							lastIndex = commentBlocks.length - 1;
							commentBlocks[lastIndex].push(line);
						}
					}
					for(let commentData of commentBlocks){
						if(commentData.indexOf('nova-')===0){
							let block = handleBlockData(this,commentData);
							if(!block) continue;
							if(block.type==='cbreak'){
								//
							}
							if(block.type==='cend'){
								//
							}
							lastBlock = getBlock(this,block);
							if(!lastBlock) continue;
							if(cols.length>0) cols[cols.length-1].addBlockToCurrent(lastBlock);
							else this.addBlock(lastBlock);
							if(lastBlock instanceof ColumnBlock){
								cols.push(lastBlock);
							}
						}
					}
					break;
			}
			if(content&&lastBlock){ lastBlock.setContent(content); }
		}
	}
	save(){}

	addBlock(block:BasicBlock,calledFrom?:BasicBlock,clearAdd:boolean=true){
		let contentLine = new ContentLine();
		//this.contentElm.insertBefore(contentLine.elm, this.addElm);
		contentLine.addBlock(block);
		this.contentElm.insertBefore(contentLine.elm,this.addRow.containerElm);
		this.blocks.push(block);
		if(clearAdd) this.addRow.clear();
	}
	addBlockData(blockData:BlockData,contentData:string[]){
		//
	}

	generateViewId(){
		let code = null;
		do{ code = randomCode(5); } while(this.views[code]);
		return code;
	}

}

function getDataAt(data:string[],position:CacheItem['position']):string[]{
	let subData = [];
	for(let i = position.start.line; i <= position.end.line; i++){
		let iData = data[i];
		if(iData.trim()==='') continue;
		subData.push(data[i]);
	}
	return subData;
}
