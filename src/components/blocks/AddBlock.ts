import { BasicBlock } from "./BasicBlock";
import { NovaContent } from "../NovaContent";

export class AddBlock extends BasicBlock {

	input: HTMLInputElement;

	constructor(novaContent:NovaContent,blockName?:string){
		super(novaContent,'add',false);

		this.input = this.contentElm.createEl('input','nova-input');
		this.input.addEventListener('input',()=>this.handleInputChange.call(this));
		this.input.addEventListener('keydown',(ev)=>this.handleKeys.call(this,ev));
		this.input.placeholder = '/ ...';
		this.input.focus();

		this.addAddOption();
	}

	handleInputChange(){
		let text = this.input.value.trim();
		if(text===''){
			this.novaC.contextMenu.hide();
			return;
		}
		if(text[0]==='/'){
			let command = text.substring(1);
			this.novaC.contextMenu.showIn(this);
			this.novaC.contextMenu.input(command);
		} else {
			this.novaC.contextMenu.hide();
			/**TODO
			 * IF "- " set as a list block
			 * IF "[]" set as a task block
			 * IF "#" set as a header block
			 * IF "|" set as a table block
			 * IF "1." set as a ordered list
			 * IF any other text set as a text block
			 */
		}
	}

	handleKeys(ev:KeyboardEvent){
		let key = ev.key.toLowerCase();
		let preventDefault = false;
		if(key==='tab') preventDefault = this.novaC.contextMenu.keyTab();
		else if(key==='arrowup') preventDefault = this.novaC.contextMenu.keyUp();
		else if(key==='arrowdown') preventDefault = this.novaC.contextMenu.keyDown();
		if(preventDefault){ ev.preventDefault(); ev.stopPropagation(); }
	}

	clear(){
		this.input.value = '';
	}

}
