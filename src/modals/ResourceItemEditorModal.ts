import type Nova from "src/Nova";
import NovaModal from "./NovaModal";
import type ResourceItem from "src/resources/ResourceItem";
import type Resource from "src/resources/Resource";
import type ResourceCol from "src/resources/ResourceCol";

type ItemEditorCB = (data:{[key:string]:any})=>void;

export default class extends NovaModal<ResourceItem> {

    resource:Resource;
    item?:ResourceItem;

    formElm     :HTMLElement;
    errorElm    :HTMLElement;
    createElm   :HTMLElement;
    actionElm   :HTMLElement;
    optsElm     :HTMLElement;

    grid        :HTMLElement;
    head        :HTMLElement;

    data        :unknown[];

    constructor(nova:Nova,resource:Resource,cb:ItemEditorCB,item?:ResourceItem){
        super(nova,cb);
        this.resource = resource;
        this.item = item;
        this.setExtended();
    }

    static item(nova:Nova,item:ResourceItem,cb:ItemEditorCB){
        return new this(nova,item.resource,cb,item);
    }

    onOpen(): void {
        const contentEl = this.contentEl;
        this.setTitle(`Resource Item ${this.resource.name}`);
        this.formElm = contentEl.createEl("form", { text:'',cls:'res-item-form' });

        this.grid = this.formElm.createEl('div');
        /*/*/ this.grid.classList.add('res-grid-table');
        this.head = this.grid.createEl('div');
        /*/*/ this.head.classList.add('res-grid-header');
        /*/*/ this.head.createEl('div',{ text:'Property' });
        /*/*/ this.head.createEl('div',{ text:'Value' });
        
        this.errorElm = this.formElm.createEl('div',{ cls:'res-form-errs' });
        
        const cols = this.resource.getCols();
        const data = this.item ? this.item.getData() : {};
        for(const key in cols) this.addProperty(cols[key],data[key]);

        this.actionElm = this.formElm.createEl('div',{ cls:'res-form-actions' });
        /*/*/ this.actionElm.createEl('div',{ cls:'gap' });

        this.actionElm.createEl('button',{ text:'Submit',cls:'res-form-but' }).type = 'submit';

        this.formElm.addEventListener('submit',this.submit.bind(this));
    }

    addProperty(col:ResourceCol,value?:unknown){
        this.clearError();
        const row = this.grid.createEl('div',{ cls:'res-grid-row' });
        const ttl = row.createEl('div',{ cls:'res-grid-row-name' });
        /*/*/ ttl.createEl('div',{ text:col.name });
        /*/*/ ttl.createEl('div',{ text:col.type+(col.required?' • required':'')+(col.multi?' • multi':'') });
        /*/*/ row.createEl('div',{ text:value?value.toString():'' });
        //this.rows[id] = new ResourceEditorRow(this,col);
        //this.rows[id].onDelete(()=>(delete this.rows[id]));
    }

    setError(){
        //
    }
    clearError(){
        this.errorElm.empty();
    }
    
    submit(ev:SubmitEvent){
        this.clearError();
        ev.preventDefault();
        //const rows = this.getData();
        //if(!rows) return;
        //const opts = this.getOptions();
        //if(!opts) return;
        //if(this.cb) this.cb({/*TODO data*/});
    }

}
