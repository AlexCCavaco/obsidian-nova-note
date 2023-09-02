import type { ResourceColType } from "src/resources/parser";
import type ResourceEditorModal from "./ResourceEditorModal";

export default class {

    modal   :ResourceEditorModal;

    elm     :HTMLElement;
    name    :{ elm:HTMLElement,input:HTMLInputElement };
    type    :{ elm:HTMLElement };
    val     :{ elm:HTMLElement };
    req     :{ elm:HTMLElement,input:HTMLInputElement };

    data    :{
        name     ?: string,
        required ?: boolean
    }

    constructor(modal:ResourceEditorModal,data?:ResourceColType,locked=false){
        this.modal = modal;
        this.data = {};
        
        this.elm = modal.grid.createEl('div');
        /*/*/ this.elm.classList.add('res-grid-row');
        /*/*/ this.name = this.handleName();
        /*/*/ this.type = this.handleType();
        /*/*/ this.val  = this.handleValue();
        /*/*/ this.req  = this.handleRequired();

        this.name.input.focus();
    }

    handleName():this['name']{
        const elm = this.elm.createEl('div');
        const input = elm.createEl('input',{ type:'text',placeholder:'name' });
        input.addEventListener('input',()=>(this.data.name=input.value));
        return { elm,input };
    }

    handleType():this['type']{
        const elm = this.elm.createEl('div');
        const input = elm.createEl('select',{ cls:'res-row-sel' });
        /*/===/*/ addOption('Text','text',true);
        /*/===/*/ addOption('Number','number');
        /*/===/*/ addOption('Check','check');
        /*/===/*/ addOption('Link','link');
        /*/===/*/ addOption('Date','date');
        /*/===/*/ addOption('Time','time');
        /*/===/*/ addOption('DateTime','datetime');
        /*/===/*/ addOption('Color','color');
        /*/===/*/ addOption('Resource','resource');
        /*/===/*/ addOption('Type','type');
        return { elm };

        function addOption(text:string,value:string,select=false){
            const opt = input.createEl('option',{ cls:'res-row-opt',value,text });
            if(select) opt.selected = true;
        }
    }

    handleValue():this['val']{
        const elm = this.elm.createEl('div');
        return { elm };
    }

    handleRequired():this['req']{
        const elm = this.elm.createEl('div');
        const input = elm.createEl('input',{ cls:'res-row-inp',type:'checkbox' });
        input.addEventListener('input',()=>(this.data.required=input.checked));
        return { elm,input };
    }


    getData(){
        return this.data;
    }

}
