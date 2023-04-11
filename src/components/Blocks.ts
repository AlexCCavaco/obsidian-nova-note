import { NovaTab } from "./NovaTab";
import { BasicBlock } from "./blocks/BasicBlock";
import { TMPBlock } from "./blocks/TMPBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ListBlock } from "./blocks/ListBlock";
import { TasksBlock } from "./blocks/TasksBlock";
import { TableBlock } from "./blocks/TableBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { MarkdownBlock } from "./blocks/MarkdownBlock";

export const TMP = TMPBlock;

export const TEXT = TextBlock;
export const LIST = ListBlock;
export const TASKS = TasksBlock;
export const TABLE = TableBlock;
export const IMAGE = ImageBlock;
export const MARKDOWN = MarkdownBlock;

//export const TIMELINE = TimelineBlock;
//export const CALENDAR = CalendarBlock;
//export const TRACKER = TrackerBlock;
//export const BOARDS = BoardsBlock;

//export const FOLDER_CARDS = FolderCardsBlock;
//export const NOTE_CARDS = NoteCardsBlock;
//export const BACKLINKS = BacklinksBlock;
//export const OUTGOING = OutgoingBlock;

//export const TASKS_VIEW = TasksViewBlock;
//export const DATA_LIST = DataListBlock;
//export const DATA_TABLE = DataTableBlock;
//export const DATA_VIEW = DataViewBlock;
//export const DATABASE = DatabaseBlock;

export function createBlockType(type:string,tab:NovaTab,elm:HTMLElement,newBlock:boolean=false):BasicBlock {
	switch(type){
		case 'text': return new TEXT(tab,elm,newBlock);
		case 'list': return new LIST(tab,elm,newBlock);
		case 'tasks': return new TASKS(tab,elm,newBlock);
		case 'table': return new TABLE(tab,elm,newBlock);
		case 'image': return new IMAGE(tab,elm,newBlock);
		case 'markdown': return new MARKDOWN(tab,elm,newBlock);
		/*/==/==/==/*/
		default: return new TMP(tab,elm,newBlock);
	}
}
