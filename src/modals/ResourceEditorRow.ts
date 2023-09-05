import { type ResourceColType } from "src/resources/parser";
import type ResourceEditorModal from "./ResourceEditorModal";
import type Resource from "src/resources/Resource";
import TypeData from "src/data/TypeData";
import ResourceListModal from "./ResourceListModal";
import { setIcon } from "obsidian";
import ResourceBasicInputModal from "./ResourceBasicInputModal";
import FileData from "src/data/FileData";
import TypeListModal from "./TypeListModal";
import Expression from "src/data/Expression";

type ResourceTypeData =
    { type:'resource',resource:Resource,value:string,on?:Expression } |
    { type:'type',value:TypeData } |
    { type:'value',value:Expression } |
    { type:'text'|'number'|'check'|'link'|'date'|'time'|'datetime'|'color' };
type OptionElmCall = (type:ResourceTypeData)=>void;
type OptionElm = { elm:HTMLOptionElement,text:string,value:string,call:(opt:OptionElm,cb:OptionElmCall)=>void };

type ResourceCheckCol = { elm:HTMLElement,input:HTMLInputElement,lock:()=>void,unlock:()=>void,set:(val:boolean,locked:boolean|null)=>void };

export default class {

    modal   :ResourceEditorModal;

    elm     :HTMLElement;
    name    :{ elm:HTMLElement,input:HTMLInputElement };
    type    :{ elm:HTMLElement };
    val     :{ elm:HTMLElement,text:HTMLSpanElement,set:(textValue:string)=>void };
    mult    :ResourceCheckCol;
    req     :ResourceCheckCol;
    del     :HTMLElement;

    onDeleteCB ?:(row:this)=>void;

    data    :{
        name     ?:string,
        type      :ResourceTypeData;
        multiple  :boolean,
        required  :boolean
    }

    constructor(modal:ResourceEditorModal,data?:ResourceColType,locked=false){
        this.modal = modal;
        this.data = {
            type: {type:'text'},
            multiple: false,
            required: false
        };
        
        this.elm = modal.grid.createEl('div');
        /*/*/ this.elm.classList.add('res-grid-row');
        /*/*/ this.name = this.handleName();
        /*/*/ this.type = this.handleType();
        /*/*/ this.val  = this.handleValue();
        /*/*/ this.mult = this.handleCheckCol();
        /*/*/ this.req  = this.handleCheckCol();
        /*/*/ this.del  = this.handleDelete();

        this.name.input.focus();
    }

    handleName():this['name']{
        const elm = this.elm.createEl('div',{ cls:'full-fill' });
        const input = elm.createEl('input',{ type:'text',placeholder:'name' });
        input.addEventListener('input',()=>{
            this.data.name = input.value.trim();
            this.validateName();
        });
        return { elm,input };
    }
    validateName(){
        if(!this.data.name || this.data.name===''){ this.setError("Property must have a name"); return false; }
        if(!this.data.name.match(/[\w_/.\-$]+/)){ this.setError("Property name should only have letters, numbers and the symbols ._-"); return false; }
        this.clearError();
        return true;
    }

    handleType():this['type']{
        const elm = this.elm.createEl('div',{ cls:'full-fill' });
        const input = elm.createEl('select',{ cls:'res-row-sel' });
        const options:{[key:string]:OptionElm} = {};
        const defaultOpt = addOption('Text','text',(opt,cb:OptionElmCall)=>cb({type:'text'}),true);
        /*/===/*/ addOption('Number','number',(opt,cb:OptionElmCall)=>cb({type:'number'}));
        /*/===/*/ addOption('Check','check',(opt,cb:OptionElmCall)=>cb({type:'check'}));
        /*/===/*/ addOption('Link','link',(opt,cb:OptionElmCall)=>cb({type:'link'}));
        /*/===/*/ addOption('Date','date',(opt,cb:OptionElmCall)=>cb({type:'date'}));
        /*/===/*/ addOption('Time','time',(opt,cb:OptionElmCall)=>cb({type:'time'}));
        /*/===/*/ addOption('DateTime','datetime',(opt,cb:OptionElmCall)=>cb({type:'datetime'}));
        /*/===/*/ addOption('Color','color',(opt,cb:OptionElmCall)=>cb({type:'color'}));
        /*/===/*/ addOption('Resource','resource',(opt,cb:OptionElmCall)=>{
            defaultOpt.elm.selected = true;
            const resourceListMod = new ResourceListModal(this.modal.nova,(resource)=>{
                opt.elm.selected = true;
                resourceListMod.close();
                cb.call(this,{type:'resource',resource,value:resource.name});
            });
            resourceListMod.open();
        });
        /*/===/*/ addOption('Type','type',(opt,cb:OptionElmCall)=>{
            //TODO
            const fileData = FileData.getCurrent(this.modal.nova);
            defaultOpt.elm.selected = true;
            const typeListMod = new TypeListModal(this.modal.nova,fileData,(type)=>{
                opt.elm.selected = true;
                typeListMod.close();
                cb.call(this,{type:'type',value:type});
            });
            typeListMod.open();
        });
        /*/===/*/ addOption('Resource Value','rvalue',(opt,cb:OptionElmCall)=>{
            defaultOpt.elm.selected = true;
            const resourceListMod = new ResourceListModal(this.modal.nova,(resource)=>{
                resourceListMod.close();
                const resValueInputModal = new ResourceBasicInputModal(this.modal.nova,'Resource On Value',(value:string)=>{
                    try {
                        const data = Expression.parse(value);
                        opt.elm.selected = true;
                        this.mult.set(false,true);
                        this.req.set(false,true);
                        resValueInputModal.close();
                        cb.call(this,{type:'resource',resource,value:resource.name,on:data});
                    } catch(err){
                        resValueInputModal.setError(err);
                    }
                });
                resValueInputModal.open();
            });
            resourceListMod.open();
        });
        /*/===/*/ addOption('Value','value',(opt,cb:OptionElmCall)=>{
            defaultOpt.elm.selected = true;
            const resValueInputModal = new ResourceBasicInputModal(this.modal.nova,'Property Value',(value:string)=>{
                try {
                    const data = Expression.parse(value);
                    opt.elm.selected = true;
                    this.mult.set(false,true);
                    this.req.set(false,true);
                    resValueInputModal.close();
                    cb.call(this,{type:'value',data});
                } catch(err){
                    resValueInputModal.setError(err);
                }
            });
            resValueInputModal.open();
        });
        input.addEventListener('input',()=>{
            const opt = options[input.value];
            this.mult.unlock();
            this.req.unlock();
            opt.call(opt,(res)=>{
                this.data.type = res;
                if(res.type==='resource') this.val.set(res.resource.name + (res.on?' => '+res.on:''));
                else if(res.type==='type') this.val.set(res.value.name??'');
                else if(res.type==='value') this.val.set(res.value?('=> '+res.value):'');
                else this.val.set('');
            });
        });
        return { elm };

        function addOption(text:string,value:string,call:OptionElm['call'],select=false){
            const opt = input.createEl('option',{ cls:'res-row-opt',value,text });
            if(select) opt.selected = true;
            return options[value] = { elm:opt,text,value,call } as OptionElm;
        }
    }

    handleValue():this['val']{
        const elm = this.elm.createEl('div',{ cls:['res-row-txt','lock'] });
        const text = elm.createEl('span');
        const set = (textValue:string)=>{ text.textContent = textValue; text.title = textValue; };
        return { elm,text,set };
    }

    handleCheckCol():ResourceCheckCol{
        const elm = this.elm.createEl('label');
        const input = elm.createEl('input',{ cls:'res-row-inp',type:'checkbox' });
        let locked = false;
        input.addEventListener('click',()=>{ if(locked) return false; });
        input.addEventListener('input',()=>{ if(locked) return false; this.data.required = input.checked; });
        const lock = ()=>{
            locked=true;
            elm.classList.add('lock');
        }
        const unlock = ()=>{
            locked=false;
            elm.classList.remove('lock');
        }
        const set = (val:boolean,locked:boolean|null=null)=>{
            input.checked = val;
            if(locked===true) lock();
            else if(locked===false) unlock();
        };
        return { elm,input,set,lock,unlock };
    }

    handleDelete(){
        const elm = this.elm.createEl('div',{ cls:['full-fill','col-close'] });
        elm.addEventListener('click',this.delete.bind(this));
        setIcon(elm,'x');
        return elm;
    }

    setError(message:string){
        this.name.elm.classList.add('err');
        this.name.elm.createEl('div',{ cls:'err-msg',text:message });
        return null;
    }
    clearError(){
        this.name.elm.classList.remove('err');
        Array.from(this.name.elm.getElementsByClassName('err-msg')).map(el=>el.remove());
    }

    onDelete(cb:(row:this)=>void){
        this.onDeleteCB = cb;
    }

    delete(){
        this.elm.remove();
        if(this.onDeleteCB) this.onDeleteCB(this);
    }

    getData(){
        if(!this.validateName()) return null;
        return this.data as Required<this['data']>;
    }

}
