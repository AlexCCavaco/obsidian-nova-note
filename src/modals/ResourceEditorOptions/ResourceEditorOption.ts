
export default class ResourceEditorOption<OptionType extends HTMLElement=HTMLInputElement,OptionValType=unknown,OptionValResType=OptionValType> {

    elm     :HTMLElement;
    ttl     :HTMLElement;
    inp     :HTMLElement;
    err     :HTMLElement;
    input   :OptionType;

    cb      :(this:ResourceEditorOption<OptionType,OptionValType,OptionValResType>,value:OptionValResType)=>void;
    _value  :OptionValType;

    constructor(parent:HTMLElement,title:string,cb:(this:ResourceEditorOption<OptionType,OptionValType,OptionValResType>,value:OptionValResType)=>void){
        this.elm = parent.createEl('div',{ cls:'res-form-opts-elm' });
        this.ttl = this.elm.createEl('div',{ cls:'title',text:title });
        this.inp = this.elm.createEl('div',{ cls:'input' });
        this.err = parent.createEl('div',{ cls:'res-form-opts-err' });
        this.cb = cb;
    }

    set value(data:OptionValType){
        this._value = data;
        this.cb.call(this,data);
    }

    updateValue(){}

}
