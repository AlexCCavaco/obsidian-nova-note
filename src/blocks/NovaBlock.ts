import type { DISPLAY_TYPE, FROM_TYPE, VIEW_CLAUSE_TYPE, VIEW_TYPE } from "./definitions";
import Block from "./components/Block.svelte";
import type { OPR_TYPE } from "src/parser";
import NovaView from "./NovaView";
import { writable, type Writable } from "svelte/store";
import type NovaNotePlugin from "src/main";
import { loadFromAll, loadFromLocal, loadFromPath, loadFromResource, loadFromTag } from "./dataLoader";

export type BLOCK_DATA = {[key:string]:unknown}[];

export default class {

    elm:  HTMLElement;
    head: HTMLElement;
    body: HTMLElement;
    component:  Block;
    nova: NovaNotePlugin;

    type:   DISPLAY_TYPE;
    from:   FROM_TYPE;
    focus:  Writable<string|null>;
    on:     OPR_TYPE;
    views:  NovaView[];
    data:   Writable<BLOCK_DATA>;

    constructor(nova:NovaNotePlugin){
        this.elm = document.createElement('div');
        this.elm.classList.add('nova-block');
        this.head = document.createElement('div');
        this.head.classList.add('nova-block-head');
        this.elm.appendChild(this.head);
        this.body = document.createElement('div');
        this.body.classList.add('nova-block-body');
        this.elm.appendChild(this.body);
        this.nova = nova;
        /*/===/*/
        this.type   = 'data';
        this.from   = { type:'all' };
        this.focus  = writable(null);
        this.on     = true;
        this.views  = [];
        this.data   = writable([]);
    }

    setType(type?:DISPLAY_TYPE){ this.type = type ?? 'data'; this.setData('type'); }
    setFrom(from:FROM_TYPE){ this.from = from; this.setData(); }
    setFocus(focus:string){ this.focus.set(focus); }
    setOn(on:OPR_TYPE){ this.on = on; this.setData('on'); }

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

    setData(changed?:'type'|'on'){
        let data:BLOCK_DATA = [];
        switch(this.from.type){
            case "tag": data = loadFromTag(this.nova,this.from.value,this.on); break;
            case "resource": data = loadFromResource(this.nova,this.from.value,this.on); break;
            case "all": data = loadFromAll(this.nova,this.on); break;
            case "local": data = loadFromLocal(this.nova,this.from.value,this.on); break;
            case "path": data = loadFromPath(this.nova,this.from.value,this.on); break;
        }console.log('>>',data);
        this.data.set(data);
    }
    onDataChange(){}

}
