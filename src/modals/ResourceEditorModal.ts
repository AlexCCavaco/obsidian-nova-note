import type Nova from "src/Nova";
import type Resource from "src/resources/Resource";
import NovaModal from "./NovaModal";
import type { ResourceColType } from "src/resources/parser";
import ResourceEditorRow from "./ResourceEditorRow";

export default class extends NovaModal {
    
    resource   ?:Resource|null;
    name        :string;

    formElm     :HTMLElement;
    createElm   :HTMLElement;
    buttonElm   :HTMLElement;

    grid        :HTMLElement;
    head        :HTMLElement;

    rowId       :number;
    rows        :ResourceEditorRow[];

    constructor(nova:Nova,resourceName:string,resource?:Resource|null,cb?:(resource:Resource)=>void){
        super(nova,cb);
        this.name = resourceName;
        this.resource = resource;
        this.rowId = 0;
        this.rows = [];
        this.setExtended();
    }

    onOpen(): void {
        const contentEl = this.contentEl;
        this.setTitle(`Resource ${this.name}`);
        this.formElm = contentEl.createEl("form", { text:'' });

        this.grid = this.formElm.createEl('div');
        /*/*/ this.grid.classList.add('res-grid-table');
        this.head = this.grid.createEl('div');
        /*/*/ this.head.classList.add('res-grid-header');
        /*/*/ this.head.createEl('div',{ text:'Name' });
        /*/*/ this.head.createEl('div',{ text:'Type' });
        /*/*/ this.head.createEl('div',{ text:'Value' });
        /*/*/ this.head.createEl('div',{ text:'Multiple',cls:'header-center' });
        /*/*/ this.head.createEl('div',{ text:'Required',cls:'header-center' });
        /*/*/ this.head.createEl('div',{ text:'',cls:'header-center' });
        
        this.createElm = this.formElm.createEl('div',{ text:'Add Property' });
        /*/*/ this.createElm.classList.add('res-form-create');
        this.createElm.addEventListener('click',ev=>this.addRow());

        //this.addRow({
        //    type: 'text',
        //    input: true,
        //    label: 'id',
        //    multi: false,
        //    required: true
        //},true);

        this.buttonElm = this.formElm.createEl('button',{ text:'Submit' });
        /*/*/ this.buttonElm.classList.add('res-form-but');
        /*/*/ this.buttonElm.setAttribute('type','submit');
    }

    addRow(data?:ResourceColType,locked=false){
        /*const row = */new ResourceEditorRow(this,data,locked);
        //row.onChange()
    }

    onClose() {
        this.contentEl.empty();
    }

}