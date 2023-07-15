import type { DISPLAY_TYPE, FROM_TYPE, VIEW_TYPE } from "./definitions";

export default class {

    display: DISPLAY_TYPE;
    from: FROM_TYPE;
    focus: string|null;

    constructor(){
        this.display = 'data';
        this.from = { type:"all",value:null };
        this.focus = null;
    }

    setDisplay(data?:DISPLAY_TYPE){ this.display = data ?? 'data'; }
    setFrom(data:FROM_TYPE){ this.from = data; }
    setFocus(data:string){ this.focus = data; }

    addView(type:VIEW_TYPE,code?:string|null,label?:string|null){
        //
    }

    render(elm:HTMLElement){
        elm.innerHTML = JSON.stringify(this);
        //TODO
    }

}
