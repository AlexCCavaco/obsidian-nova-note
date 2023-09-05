import type Nova from "src/Nova";
import type Resource from "src/resources/Resource";
import NovaModal from "./NovaModal";
import type { ResourceColType } from "src/resources/parser";
import ResourceEditorRow from "./ResourceEditorRow";
import type { ResourceOpts } from "src/resources/Resource";
import { TFile, setIcon } from "obsidian";
import ResourceListModal from "./ResourceListModal";
import FileListModal from "./FileListModal";
import Expression from "src/data/Expression";

type ResourceEditorRows = Required<ResourceEditorRow['data']>[];
type ResourceEditorOpts = ResourceOpts;
type ResourceEditorCB = (data:{ rows:ResourceEditorRows,opts:ResourceEditorOpts })=>void;

export default class extends NovaModal {
    
    resource   ?:Resource|null;
    name        :string;

    formElm     :HTMLElement;
    errorElm    :HTMLElement;
    createElm   :HTMLElement;
    actionElm   :HTMLElement;

    grid        :HTMLElement;
    head        :HTMLElement;

    rowId       :number;
    rows        :{[key:string]:ResourceEditorRow};
    opts        :ResourceOpts;

    cb          :ResourceEditorCB;

    constructor(nova:Nova,resourceName:string,cb?:ResourceEditorCB){
        super(nova,cb);
        this.name = resourceName;
        this.rowId = 0;
        this.rows = {};
        this.opts = {};
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
        
        this.errorElm = this.formElm.createEl('div',{ cls:'res-form-errs' });

        this.createElm = this.formElm.createEl('div',{ text:'Add Property',cls:'res-form-create' });
        this.createElm.addEventListener('click',ev=>this.addRow());
        
        this.actionElm = this.formElm.createEl('div',{ cls:'res-form-actions' });
        /*/*/ this.actionElm.createEl('div',{ cls:'gap' });

        this.setupOptions();
        this.actionElm.createEl('button',{ text:'Submit',cls:'res-form-but',type:'submit' });

        this.formElm.addEventListener('submit',this.submit.bind(this));
    }

    addRow(data?:ResourceColType,locked=false){
        this.clearError();
        const id = this.rowId++;
        this.rows[id] = new ResourceEditorRow(this,data,locked);
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
            data.push(rowData);
            if(data.some(obj=>(obj.name.toLowerCase()===rowData.name.toLowerCase()))){
                return row.setError("Property name already exists");
            }
        }
        return data;
    }

    getOptions(){
        return this.opts;
    }
    private setupOptions(){
        const wrap = this.formElm.createEl('div',{ cls:'res-form-opts' });
        this.formElm.insertAfter(wrap,this.createElm);
        const show = this.actionElm.createEl('button',{ cls:['res-form-but','fade'],type:'button' });
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
        const body = wrap.createEl('div',{ cls:'res-form-opts-body' });

        createResourceOption.call(this,'Extend Resource',(resource:Resource)=>this.opts.extend=resource);
        createTextOption.call(this,'HTML Display',(html:string)=>this.opts.html=html);
        createCheckOption.call(this,'Display Resource Inline',(inline:boolean)=>this.opts.inline=inline);
        createCheckOption.call(this,'Hide Resource From Search',(hidden:boolean)=>this.opts.hidden=hidden);
        createExpressionOption.call(this,'Filename Expression',(filename:Expression)=>this.opts.filename=filename);
        createExpressionOption.call(this,'Location Expression',(location:Expression)=>this.opts.location=location);
        createFileOption.call(this,'Template for New Elements',(template:TFile)=>this.opts.template=template);

        function createOption(title:string){
            const elm = body.createEl('div',{ cls:'res-form-opts-elm' });
            const ttl =  elm.createEl('div',{ cls:'title',text:title });
            const inp =  elm.createEl('div',{ cls:'input' });
            const err = body.createEl('div',{ cls:'res-form-opts-err' });

            return { elm,ttl,inp,err };
        }
        function createTextOption(title:string,cb:(data:string)=>void){
            const opt = createOption(title);
            const inp = opt.inp.createEl('input',{ type:'text' });
            inp.addEventListener('input',()=>cb(inp.value));
        }
        function createExpressionOption(title:string,cb:(data:Expression|null)=>void){
            const opt = createOption(title);
            const inp = opt.inp.createEl('input',{ type:'text' });
            inp.addEventListener('input',()=>{
                opt.err.empty();
                opt.elm.classList.remove('err');
                try {
                    cb(Expression.parse(inp.value));
                } catch(err){
                    opt.elm.classList.add('err');
                    const el = opt.err.createEl('div',{ cls:'elm' });
                    const ttl = el.createEl('div',{ cls:'title' });
                    ttl.createEl('span',{ cls:'text',text:'Expression is Invalid' });
                    setIcon(ttl.createEl('span',{ cls:'icon' }),'chevron-down');
                    el.createEl('pre',{ cls:'desc',text:err.toString() });
                    el.addEventListener('click',()=>el.classList.toggle('expand'));
                    cb(null);
                }
            });
        }
        function createCheckOption(title:string,cb:(data:boolean)=>void){
            const opt = createOption(title);
            const inp = opt.inp.createEl('input',{ type:'checkbox' });
            inp.addEventListener('input',()=>cb(inp.checked));
        }
        function createResourceOption(title:string,cb:(data:Resource|null)=>void){
            const opt = createOption(title);
            opt.inp.classList.add('twofold');
            const inp = opt.inp.createEl('button',{ type:'button',text:'No Resource' });
            const clear = opt.inp.createEl('button',{ type:'button' });
            setIcon(clear,'x');
            inp.addEventListener('click',()=>{
                const resourceListModal = new ResourceListModal(this.nova,(resource)=>{
                    inp.textContent = resource.name;
                    cb(resource);
                    resourceListModal.close();
                });
                resourceListModal.open();
            });
            clear.addEventListener('click',()=>{
                inp.textContent = 'No Resource';
                cb(null);
            });
        }
        function createFileOption(title:string,cb:(data:TFile|null)=>void){
            const opt = createOption(title);
            opt.inp.classList.add('twofold');
            const inp = opt.inp.createEl('button',{ type:'button',text:'No Template' });
            const clear = opt.inp.createEl('button',{ type:'button' });
            setIcon(clear,'x');
            inp.addEventListener('click',()=>{
                const fileListModal = new FileListModal(this.nova,(file)=>{
                    inp.textContent = file.basename;
                    cb(file);
                    fileListModal.close();
                });
                fileListModal.open();
            });
            clear.addEventListener('click',()=>{
                inp.textContent = 'No Template';
                cb(null);
            });
        }
    }

    onClose() {
        this.contentEl.empty();
    }

}