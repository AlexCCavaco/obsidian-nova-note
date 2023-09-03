import type { ResourceColType } from "src/resources/parser";
import type ResourceEditorModal from "./ResourceEditorModal";
import type Resource from "src/resources/Resource";
import type TypeData from "src/data/TypeData";
import ResourceListModal from "./ResourceListModal";
import { setIcon } from "obsidian";
import ResourceBasicInputModal from "./ResourceBasicInputModal";

type ResourceTypeData =
    { type:'resource',resource:Resource,value:string,on?:string } |
    { type:'type',value:TypeData } |
    { type:'value',value:string } |
    { type:'text'|'number'|'check'|'link'|'date'|'time'|'datetime'|'color' };
type OptionElmCall = (type:ResourceTypeData)=>void;
type OptionElm = { elm:HTMLOptionElement,text:string,value:string,call:(cb:OptionElmCall)=>void };

export default class {

    modal   :ResourceEditorModal;

    elm     :HTMLElement;
    name    :{ elm:HTMLElement,input:HTMLInputElement };
    type    :{ elm:HTMLElement };
    val     :{ elm:HTMLElement,text:HTMLSpanElement };
    mult    :{ elm:HTMLElement,input:HTMLInputElement };
    req     :{ elm:HTMLElement,input:HTMLInputElement };

    data    :{
        name     ?:string,
        type     ?:ResourceTypeData;
        multiple ?:boolean,
        required ?:boolean
    }

    constructor(modal:ResourceEditorModal,data?:ResourceColType,locked=false){
        this.modal = modal;
        this.data = {};
        
        this.elm = modal.grid.createEl('div');
        /*/*/ this.elm.classList.add('res-grid-row');
        /*/*/ this.name = this.handleName();
        /*/*/ this.type = this.handleType();
        /*/*/ this.val  = this.handleValue();
        /*/*/ this.mult = this.handleMultiple();
        /*/*/ this.req  = this.handleRequired();
        setIcon(this.elm.createEl('div',{ cls:['full-fill','col-close'] }),'x');

        this.name.input.focus();
    }

    handleName():this['name']{
        const elm = this.elm.createEl('div',{ cls:'full-fill' });
        const input = elm.createEl('input',{ type:'text',placeholder:'name' });
        input.addEventListener('input',()=>(this.data.name=input.value));
        return { elm,input };
    }

    handleType():this['type']{
        const elm = this.elm.createEl('div',{ cls:'full-fill' });
        const input = elm.createEl('select',{ cls:'res-row-sel' });
        const options:{[key:string]:OptionElm} = {};
        /*/===/*/ addOption('Text','text',(cb:OptionElmCall)=>cb({type:'text'}),true);
        /*/===/*/ addOption('Number','number',(cb:OptionElmCall)=>cb({type:'number'}));
        /*/===/*/ addOption('Check','check',(cb:OptionElmCall)=>cb({type:'check'}));
        /*/===/*/ addOption('Link','link',(cb:OptionElmCall)=>cb({type:'link'}));
        /*/===/*/ addOption('Date','date',(cb:OptionElmCall)=>cb({type:'date'}));
        /*/===/*/ addOption('Time','time',(cb:OptionElmCall)=>cb({type:'time'}));
        /*/===/*/ addOption('DateTime','datetime',(cb:OptionElmCall)=>cb({type:'datetime'}));
        /*/===/*/ addOption('Color','color',(cb:OptionElmCall)=>cb({type:'color'}));
        /*/===/*/ addOption('Resource','resource',(cb:OptionElmCall)=>{
            const resourceListMod = new ResourceListModal(this.modal.nova,(resource)=>{
                resourceListMod.close();
                cb.call(this,{type:'resource',resource,value:resource.name});
            });
            resourceListMod.open();
        });
        /*/===/*/ addOption('Type','type',(cb:OptionElmCall)=>{
            //TODO
        });
        /*/===/*/ addOption('Resource Value','rvalue',(cb:OptionElmCall)=>{
            const resourceListMod = new ResourceListModal(this.modal.nova,(resource)=>{
                resourceListMod.close();
                const resValueInputModal = new ResourceBasicInputModal(this.modal.nova,'Resource On Value',(value:string)=>{
                    resValueInputModal.close();
                    cb.call(this,{type:'resource',resource,value:resource.name,on:value});
                });
                resValueInputModal.open();
            });
            resourceListMod.open();
        });
        /*/===/*/ addOption('Value','value',(cb:OptionElmCall)=>{
            const resValueInputModal = new ResourceBasicInputModal(this.modal.nova,'Property Value',(value:string)=>{
                resValueInputModal.close();
                cb.call(this,{type:'value',value});
            });
            resValueInputModal.open();
        });
        input.addEventListener('input',()=>{
            const opt = options[input.value];
            opt.call((res)=>{
                this.data.type = res;
                if(res.type==='resource') {this.val.text.textContent = res.resource.name + (res.on?' => '+res.on:'');console.log(res,res.value,res.on);}
                else if(res.type==='type') this.val.text.textContent = res.value.name??'';
                else if(res.type==='value') this.val.text.textContent = res.value?('=> '+res.value):'';
                else this.val.text.textContent = '';
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
        const elm = this.elm.createEl('div',{ cls:'res-row-txt' });
        const text = elm.createEl('span');
        return { elm,text };
    }

    handleMultiple():this['mult']{
        const elm = this.elm.createEl('label');
        const input = elm.createEl('input',{ cls:'res-row-inp',type:'checkbox' });
        input.addEventListener('input',()=>(this.data.multiple=input.checked));
        return { elm,input };
    }

    handleRequired():this['req']{
        const elm = this.elm.createEl('label');
        const input = elm.createEl('input',{ cls:'res-row-inp',type:'checkbox' });
        input.addEventListener('input',()=>(this.data.required=input.checked));
        return { elm,input };
    }


    getData(){
        return this.data;
    }

}
