import type { DISPLAY_TYPE, FROM_TYPE, VIEW_CLAUSE_TYPE, VIEW_TYPE } from "./definitions";
import Block from "./components/Block.svelte";
import type { OPR_TYPE } from "src/parser/keys";
import NovaView from "./NovaView";

export default class {

    elm:  HTMLElement;
    head: HTMLElement;
    body: HTMLElement;
    component: Block;

    type: DISPLAY_TYPE;
    from: FROM_TYPE;
    focus: string|null;
    on: OPR_TYPE;
    views: NovaView[];

    constructor(){
        this.elm = document.createElement('div');
        this.elm.classList.add('nova-block');
        this.head = document.createElement('div');
        this.head.classList.add('nova-block-head');
        this.elm.appendChild(this.head);
        this.body = document.createElement('div');
        this.body.classList.add('nova-block-body');
        this.elm.appendChild(this.body);
        /*/===/*/
        this.type  = 'data';
        this.from  = { type:"all",value:null };
        this.focus = null;
        this.on    = true;
        this.views = [];
    }

    setType(type?:DISPLAY_TYPE){ this.type = type ?? 'data'; }
    setFrom(from:FROM_TYPE){ this.from = from; }
    setFocus(focus:string){ this.focus = focus; }
    setOn(on:OPR_TYPE){ this.on = on; }

    addView(type:VIEW_TYPE,code:string,label:string,clauses:VIEW_CLAUSE_TYPE[]){
        const view = new NovaView(type,code,label);
        for(const clause of clauses){
            switch(clause.clause){
                case "order": view.setOrder(clause.order); break;
                case "group": view.setGroup(clause.group); break;
                case "alter": view.setAlter(clause.alter); break;
                case "shows": view.setShows(clause.shows); break;
                case "where": view.setWhere(clause.where); break;
            }
        }
        this.body.appendChild(view.elm);
        this.views.push(view);
        return view;
    }

    load(){
        this.component = new Block({
            target: this.elm,
            props: {
                block: this
            }
        });
    }

}
