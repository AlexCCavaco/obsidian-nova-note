import { HeadingBlock } from "./blocks/HeadingBlock";
import { TasksBlock } from "./blocks/TasksBlock";
import { ListBlock } from "./blocks/ListBlock";
import { TableBlock } from "./blocks/TableBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { DataBlock } from "./blocks/DataBlock";
import { EmbedBlock } from "./blocks/EmbedBlock";
import { FolderBlock } from "./blocks/FolderBlock";
import { NotesBlock } from "./blocks/NotesBlock";
import { BasicBlock } from "./blocks/BasicBlock";
import { ColumnBlock } from "./blocks/ColumnBlock";

import { NovaContent } from "./NovaContent";
import { BlockData } from "../tools/MDContentHandler";

export {
	HeadingBlock as heading,
	TasksBlock as tasks,
	ListBlock as list,
	TableBlock as table,
	TextBlock as text,
	ImageBlock as image,
	DataBlock as data,
	EmbedBlock as embed,
	FolderBlock as folder,
	NotesBlock as notes,
	ColumnBlock as column,
};

export function getBlock(novaContent:NovaContent,blockData:BlockData):BasicBlock|null {
	let block = null;
	switch(blockData.type){
		case HeadingBlock.blockname: block = HeadingBlock; break;
		case TasksBlock.blockname: block = TasksBlock; break;
		case ListBlock.blockname: block = ListBlock; break;
		case TableBlock.blockname: block = TableBlock; break;
		case TextBlock.blockname: block = TextBlock; break;
		case ImageBlock.blockname: block = ImageBlock; break;
		case DataBlock.blockname: block = DataBlock; break;
		case EmbedBlock.blockname: block = EmbedBlock; break;
		case FolderBlock.blockname: block = FolderBlock; break;
		case NotesBlock.blockname: block = NotesBlock; break;
		case ColumnBlock.blockname: block = ColumnBlock; break;
		default: block = null;
	}
	if(!block) return null;
	let iBlock = new block(novaContent);
	iBlock.setOptions(blockData.opts);
	iBlock.setViews(blockData.views);
	return iBlock;
}
