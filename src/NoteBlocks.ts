import { NovaSection } from "./components/NovaSection";

export class NoteBlocks {

	static createSection(parent:HTMLElement,title:string): NovaSection{
		return new NovaSection(parent,title);
	}

	/**
	 * TODO
	 * :blocks:
	 * = Static Blocks
	 * - Text
	 * - List
	 * - Tasks
	 * - Table
	 * - Custom md/html
	 * = Dynamic
	 * - Timeline
	 * - Calendar
	 * - Board
	 * = Links
	 * - Parent Folder File/Folder Cards
	 * - Cards that link to specified notes
	 * = Plugins
	 * - Tasks View (with tasks plugin) // from folder, note or tag // order and filter
	 * - Table View (with dataview plugin) // from given notes, folder or tags // order and filter
	 * - Custom Dataview (with dataview plugin)
	 * :features:
	 * - Open File of Same Name or _main when Folder is Clicked
	 */

}
