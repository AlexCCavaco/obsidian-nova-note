import type Nova from "src/Nova";
import type Resource from "src/resources/Resource";
import NovaModal from "./NovaModal";
import ResourceEditorRow from "./ResourceEditorRow";
import type { ResourceOpts } from "src/resources/Resource";
import { TFile, setIcon } from "obsidian";
import ResourceListModal from "./ResourceListModal";
import FileListModal from "./FileListModal";
import Expression from "src/data/Expression";
import type ResourceCol from "src/resources/ResourceCol";
import ResourceEditorTextOption from "./ResourceEditorOptions/ResourceEditorTextOption";
import ResourceEditorCheckOption from "./ResourceEditorOptions/ResourceEditorCheckOption";
import ResourceEditorButtonOption from "./ResourceEditorOptions/ResourceEditorButtonOption";
import ResourceEditorParsedTextOption from "./ResourceEditorOptions/ResourceEditorParsedTextOption";

type ResourceEditorRows = Required<ResourceEditorRow['data']>[];
type ResourceEditorOpts = ResourceOpts;
type ResourceEditorCB = (data:{ rows:ResourceEditorRows,opts:ResourceEditorOpts })=>void;

export default class extends NovaModal {
    
    name        :string;

    formElm     :HTMLElement;
    errorElm    :HTMLElement;
    createElm   :HTMLElement;
    actionElm   :HTMLElement;
    optsElm     :HTMLElement;

    grid        :HTMLElement;
    head        :HTMLElement;

    rowId       :number;
    rows        :{[key:string]:ResourceEditorRow};
    opts        :ResourceOpts;
    resource   ?:Resource;

    cb          :ResourceEditorCB;

    constructor(nova:Nova,resourceName:string,cb:ResourceEditorCB,resource?:Resource){
        super(nova,cb);
        this.name = resourceName;
        this.rowId = 0;
        this.rows = {};
        this.opts = {};
        this.resource = resource;
        this.setExtended();
    }

    static resource(nova:Nova,resource:Resource,cb:ResourceEditorCB){
        return new this(nova,resource.name,cb,resource);
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
        
        this.errorElm = this.formElm.createEl('div',{ cls:'res-form-errs' });

        this.createElm = this.formElm.createEl('div',{ text:'Add Property',cls:'res-form-create' });
        this.createElm.addEventListener('click',ev=>this.addRow());

        if(this.resource){
            const cols = this.resource.getCols();
            for(const key in cols) this.addRow(cols[key]);
        }
        
        this.actionElm = this.formElm.createEl('div',{ cls:'res-form-actions' });
        /*/*/ this.actionElm.createEl('div',{ cls:'gap' });

        this.setupOptions();
        this.actionElm.createEl('button',{ text:'Submit',cls:'res-form-but' }).type = 'submit';

        this.formElm.addEventListener('submit',this.submit.bind(this));
    }

    addRow(col?:ResourceCol){
        this.clearError();
        const id = this.rowId++;
        this.rows[id] = new ResourceEditorRow(this,col);
        this.rows[id].onDelete(()=>(delete this.rows[id]));
    }

    setError(message:string){
        this.errorElm.createEl('div',{ cls:'elm',text:message });
    }
    clearError(){
        this.errorElm.empty();
    }

    submit(ev:SubmitEvent){
        this.clearError();
        ev.preventDefault();
        const rows = this.getData();
        if(!rows) return;
        const opts = this.getOptions();
        if(!opts) return;
        if(this.cb) this.cb({ rows,opts });
    }

    getData(){
        const keys = Object.keys(this.rows);
        const data:Required<ResourceEditorRow['data']>[] = [];
        if(keys.length===0) return this.setError("Resource has no properties");
        for(const key of keys){
            const row = this.rows[key];
            const rowData = row.getData();
            if(rowData===null) return;
            if(data.some(obj=>(obj.name.toLowerCase()===rowData.name.toLowerCase()))){
                return row.setError("Property name already exists");
            }
            data.push(rowData);
        }
        return data;
    }

    getOptions(){
        return this.opts;
    }
    private setupOptions(){
        const wrap = this.formElm.createEl('div',{ cls:'res-form-opts' });
        this.formElm.insertAfter(wrap,this.createElm);
        const show = this.actionElm.createEl('button',{ cls:['res-form-but','fade'] });
        /*/*/ show.type = 'button';
        /*/*/ show.createEl('span',{ text:'Show Advanced Options' });
        /*/*/ setIcon(show.createEl('span'),'chevron-down');
        show.addEventListener('click',()=>{
            wrap.classList.toggle('show');
            show.empty();
            if(wrap.classList.contains('show')){
                show.createEl('span',{ text:'Hide Advanced Options' });
                setIcon(show.createEl('span'),'chevron-up');
            } else {
                show.createEl('span',{ text:'Advanced Options' });
                setIcon(show.createEl('span'),'chevron-down');
            }
        })
        this.optsElm = wrap.createEl('div',{ cls:'res-form-opts-body' });

        const resource = this.resource;
        this.createResourceOption('Extend Resource',resource?resource.extends:null,(resource:Resource)=>this.opts.extend=resource);
        this.createTextOption('HTML Display',resource?resource.html:null,(html:string)=>this.opts.html=html);
        this.createCheckOption('Display Resource Inline',resource?resource.inline:null,(inline:boolean)=>this.opts.inline=inline);
        this.createCheckOption('Hide Resource From Search',resource?resource.hidden:null,(hidden:boolean)=>this.opts.hidden=hidden);
        this.createExpressionOption('Filename Expression',resource&&resource.filename?resource.filename.raw:null,(filename:Expression)=>this.opts.filename=filename);
        this.createExpressionOption('Location Expression',resource&&resource.location?resource.location.raw:null,(location:Expression)=>this.opts.location=location);
        this.createFileOption('Template for New Elements',resource?resource.template:null,(template:TFile)=>this.opts.template=template);
    }

    private createTextOption(title:string,value:string|null,cb:(data:string)=>void){
        const opt = new ResourceEditorTextOption(this.optsElm,title,cb);
        if(value!=null) opt.value = value;
    }
    private createExpressionOption(title:string,value:string|null,cb:(data:Expression|null)=>void){
        const opt = new ResourceEditorParsedTextOption<Expression>(this.optsElm,title,(option,val)=>{
            option.err.empty();
            option.elm.classList.remove('err');
            try {
                return Expression.parse(val);
            } catch(err){
                option.elm.classList.add('err');
                const el = option.err.createEl('div',{ cls:'elm' });
                const ttl = el.createEl('div',{ cls:'title' });
                ttl.createEl('span',{ cls:'text',text:'Expression is Invalid' });
                setIcon(ttl.createEl('span',{ cls:'icon' }),'chevron-down');
                el.createEl('pre',{ cls:'desc',text:err.toString() });
                el.addEventListener('click',()=>el.classList.toggle('expand'));
                return null;
            }
        },cb);
        if(value!=null) opt.value = value;
    }
    private createCheckOption(title:string,value:boolean|null,cb:(data:boolean)=>void){
        const opt = new ResourceEditorCheckOption(this.optsElm,title,cb);
        if(value!=null) opt.value = value;
    }
    private createResourceOption(title:string,value:Resource|null,cb:(data:Resource|null)=>void){
        const opt = new ResourceEditorButtonOption<Resource>(this.optsElm,title,'No Resource',(option)=>{
            const resourceListModal = new ResourceListModal(this.nova,(resource)=>{
                option.textContent = resource.name;
                option.value = resource;
                resourceListModal.close();
            });
            resourceListModal.open();
        },cb);
        if(value!=null) opt.value = value;
    }
    private createFileOption(title:string,value:TFile|null,cb:(data:TFile|null)=>void){
        const opt = new ResourceEditorButtonOption<TFile>(this.optsElm,title,'No Template',(option)=>{
            const fileListModal = new FileListModal(this.nova,(file)=>{
                option.textContent = file.basename;
                option.value = file;
                fileListModal.close();
            });
            fileListModal.open();
        },cb);
        if(value!=null) opt.value = value;
    }

    onClose() {
        this.contentEl.empty();
    }

}