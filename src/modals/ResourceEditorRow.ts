import type ResourceEditorModal from "./ResourceEditorModal";
import type Resource from "src/resources/Resource";
import TypeData from "src/data/TypeData";
import ResourceListModal from "./ResourceListModal";
import { setIcon } from "obsidian";
import ResourceBasicInputModal from "./ResourceBasicInputModal";
import FileData from "src/data/FileData";
import TypeListModal from "./TypeListModal";
import Expression from "src/data/Expression";
import type ResourceCol from "src/resources/ResourceCol";
import ResourceColResource from "src/resources/ResourceColResource";
import ResourceColDefType from "src/resources/ResourceColDefType";
import ResourceColValue from "src/resources/ResourceColValue";
import type ResourceColString from "src/resources/ResourceColString";

type ResourceTypeData =
    { type:'resource',resource:Resource,value:string,on?:Expression } |
    { type:'type',value:TypeData } |
    { type:'value',value:Expression } |
    { type:'text'|'number'|'check'|'link'|'date'|'time'|'datetime'|'color' };
type OptionElmCall = (type:ResourceTypeData)=>void;
type OptionElm = { elm:HTMLOptionElement,text:string,value:string,call:(opt:OptionElm,cb:OptionElmCall,setResetCall:(resetCall:()=>void)=>void)=>void };

type ResourceCheckCol = { elm:HTMLElement,input:HTMLInputElement,lock:()=>void,unlock:()=>void,set:(val:boolean,locked:boolean|null)=>void };

export default class {

    modal   :ResourceEditorModal;

    elm     :HTMLElement;
    name    :{ elm:HTMLElement,input:HTMLInputElement,call:()=>void };
    type    :{ elm:HTMLElement,call:(col:ResourceTypeData)=>void };
    val     :{ elm:HTMLElement,text:HTMLSpanElement,set:(textValue:string)=>void,clear:()=>void,setReset:(reset:()=>void)=>void };
    mult    :ResourceCheckCol&{ call:()=>void };
    req     :ResourceCheckCol&{ call:()=>void };
    del     :HTMLElement;

    onDeleteCB ?:(row:this)=>void;

    data    :{
        name     ?:string,
        type      :ResourceTypeData;
        multiple  :boolean,
        required  :boolean
    }

    constructor(modal:ResourceEditorModal,col?:ResourceCol){
        this.modal = modal;
        this.data = {
            type: {type:'text'},
            multiple: false,
            required: false
        };
        
        this.elm = modal.grid.createEl('div');
        /*/*/ this.elm.classList.add('res-grid-row');
        /*/*/ this.name = this.handleName(col);
        /*/*/ this.type = this.handleType(col);
        /*/*/ this.val  = this.handleValue();
        /*/*/ this.mult = this.handleCheckCol(col?.multi);
        /*/*/ this.req  = this.handleCheckCol(col?.required);
        /*/*/ this.del  = this.handleDelete();

        if(col){
            /*/*/ this.name.call();
            let typeData:ResourceTypeData;
            if(col instanceof ResourceColResource) typeData = { type:'resource',resource:col.resource,value:col.resource.name,on:col.on??undefined };
            else if(col instanceof ResourceColDefType) typeData = { type:'type',value:col.typeData };
            else if(col instanceof ResourceColValue) typeData = { type:'value',value:col.value };
            else typeData = { type:col.type as ResourceColString['type'] };
            /*/*/ this.type.call(typeData);
            /*/*/ this.mult.call();
            /*/*/ this.req. call();
        }

        this.name.input.focus();
    }

    handleName(col?:ResourceCol):this['name']{
        const elm = this.elm.createEl('div',{ cls:'full-fill' });
        const input = elm.createEl('input',{ type:'text',placeholder:'name',value:col?col.name:'' });
        const call = ()=>{
            this.data.name = input.value.trim();
            this.validateName();
        };
        input.addEventListener('input',call);
        return { elm,input,call };
    }
    validateName(){
        if(!this.data.name || this.data.name===''){ this.setError("Property must have a name"); return false; }
        if(!this.data.name.match(/[\w_/.\-$]+/)){ this.setError("Property name should only have letters, numbers and the symbols ._-"); return false; }
        this.clearError();
        return true;
    }

    handleType(col?:ResourceCol):this['type']{
        const elm = this.elm.createEl('div',{ cls:'full-fill' });
        const input = elm.createEl('select',{ cls:'res-row-sel' });
        const options:{[key:string]:OptionElm} = {};
        const valType = col ? col.type.toLowerCase() : '';
        const defaultOpt = addOption('Text','text',(opt,cb:OptionElmCall)=>cb({type:'text'}),valType=='' || valType==='text');
        /*/===/*/ addOption('Number','number',(opt,cb:OptionElmCall)=>cb({type:'number'}),valType==='number');
        /*/===/*/ addOption('Check','check',(opt,cb:OptionElmCall)=>cb({type:'check'}),valType==='check');
        /*/===/*/ addOption('Link','link',(opt,cb:OptionElmCall)=>cb({type:'link'}),valType==='link');
        /*/===/*/ addOption('Date','date',(opt,cb:OptionElmCall)=>cb({type:'date'}),valType==='date');
        /*/===/*/ addOption('Time','time',(opt,cb:OptionElmCall)=>cb({type:'time'}),valType==='time');
        /*/===/*/ addOption('DateTime','datetime',(opt,cb:OptionElmCall)=>cb({type:'datetime'}),valType==='datetime');
        /*/===/*/ addOption('Color','color',(opt,cb:OptionElmCall)=>cb({type:'color'}),valType==='color');
        /*/===/*/ addOption('Resource','resource',(opt,cb:OptionElmCall,setResetCall)=>{
            defaultOpt.elm.selected = true;
            const reSetVal = (()=>{
                const resourceListMod = new ResourceListModal(this.modal.nova,(resource)=>{
                    opt.elm.selected = true;
                    resourceListMod.close();
                    cb.call(this,{type:'resource',resource,value:resource.name});
                });
                resourceListMod.open();
            }).bind(this);
            reSetVal();
            setResetCall(reSetVal);
        },col && col instanceof ResourceColResource && col.on==null);
        /*/===/*/ addOption('Type','type',(opt,cb:OptionElmCall,setResetCall)=>{
            const fileData = FileData.getCurrent(this.modal.nova);
            defaultOpt.elm.selected = true;
            const reSetVal = (()=>{
                const typeListMod = new TypeListModal(this.modal.nova,fileData,(type)=>{
                    opt.elm.selected = true;
                    typeListMod.close();
                    cb.call(this,{type:'type',value:type});
                });
                typeListMod.open();
            }).bind(this);
            reSetVal();
            setResetCall(reSetVal);
        },valType==='type');
        /*/===/*/ addOption('Resource Value','rvalue',(opt,cb:OptionElmCall,setResetCall)=>{
            defaultOpt.elm.selected = true;
            const reSetVal = (()=>{
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
            }).bind(this);
            reSetVal();
            setResetCall(reSetVal);
        },col && col instanceof ResourceColResource && col.on!=null);
        /*/===/*/ addOption('Value','value',(opt,cb:OptionElmCall,setResetCall)=>{
            defaultOpt.elm.selected = true;
            const reSetVal = (()=>{
                const resValueInputModal = new ResourceBasicInputModal(this.modal.nova,'Property Value',(value:string)=>{
                    try {
                        const data = Expression.parse(value);
                        opt.elm.selected = true;
                        this.mult.set(false,true);
                        this.req.set(false,true);
                        resValueInputModal.close();
                        cb.call(this,{type:'value',value:data});
                    } catch(err){
                        resValueInputModal.setError(err);
                    }
                });
                resValueInputModal.open();
            }).bind(this);
            reSetVal();
            setResetCall(reSetVal);
        },valType==='value');

        const call = (res:ResourceTypeData)=>{
            this.data.type = res;
            if(res.type==='resource') this.val.set(res.resource.name + (res.on?' => '+res.on.raw:''));
            else if(res.type==='type') this.val.set(res.value.name??'');
            else if(res.type==='value') this.val.set(res.value?('=> '+res.value.raw):'');
            else this.val.set('');
        };
        input.addEventListener('input',()=>{
            const opt = options[input.value];
            this.mult.unlock();
            this.req.unlock();
            this.val.clear();
            opt.call(opt,call,(resetCall?:()=>void)=>{ if(resetCall) this.val.setReset(resetCall); });
        });
        return { elm,call };

        function addOption(text:string,value:string,call:OptionElm['call'],select=false){
            const opt = input.createEl('option',{ cls:'res-row-opt',value,text });
            if(select) opt.selected = select;
            return options[value] = { elm:opt,text,value,call } as OptionElm;
        }
    }

    handleValue(col?:ResourceCol):this['val']{
        const elm = this.elm.createEl('div',{ cls:['res-row-txt'] });
        const text = elm.createEl('span');
        const lock = ()=>{ elm.classList.add('lock'); }
        const unlock = ()=>{ elm.classList.remove('lock'); }
        let reset:(()=>void)|null = null; lock();
        const set = (textValue:string)=>{ text.textContent = textValue; text.title = textValue; };
        const clear = ()=>{ lock(); text.textContent = ''; };
        const setReset = (resetCall:()=>void)=>{ unlock(); reset = resetCall; };
        elm.addEventListener('click',()=>{ if(reset) reset(); })
        return { elm,text,set,setReset,clear };
    }

    handleCheckCol(value?:boolean):ResourceCheckCol&{call:()=>void}{
        const elm = this.elm.createEl('label');
        const input = elm.createEl('input',{ cls:'res-row-inp',type:'checkbox' });
        let locked = false;
        const call = ()=>{ if(locked) return false; this.data.required = input.checked; };
        if(value!=null){ input.checked = value; }
        input.addEventListener('click',()=>{ if(locked) return false; });
        input.addEventListener('input',call);
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
        return { elm,input,set,lock,unlock,call };
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
        if(!this.name||!this.name.elm) return;
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
