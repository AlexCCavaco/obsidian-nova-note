import type { DISPLAY_TYPE, FROM_TYPE, VIEW_CLAUSE_TYPE, VIEW_TYPE } from "./definitions";
import Block from "./components/Block.svelte";
import type { OPR_TYPE } from "src/parser";
import NovaView from "./NovaView";
import { writable, type Writable } from "svelte/store";
import type NovaNotePlugin from "src/main";
import { loadFromAll, loadFromLocal, loadFromPath, loadFromResource, loadFromTag, type FileData, getCurFileData } from "./dataLoader";

export type BlockDataVal = {[key:string]:unknown|{lazy:true,get:()=>unknown}};
export type BlockDataElm = (FileData & { data:BlockDataVal });
export type BlockData = BlockDataElm[];

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
    data:   Writable<BlockData>;
    file:   FileData;

    constructor(nova:NovaNotePlugin){
        this.elm = document.createElement('div');
        this.elm.classList.add('nova-block');
        this.nova = nova;
        /*/===/*/
        this.type   = 'data';
        this.from   = { type:'all' };
        this.focus  = writable(null);
        this.on     = true;
        this.views  = [];
        this.data   = writable([]);
        this.file   = getCurFileData(nova);
    }

    setType(type?:DISPLAY_TYPE){ this.type = type ?? 'data'; }
    setFrom(from:FROM_TYPE){ this.from = from; }
    setFocus(focus:string){ this.focus.set(focus); }
    setOn(on:OPR_TYPE){ this.on = on; }

    addView(type:VIEW_TYPE,code:string,label:string,clauses:VIEW_CLAUSE_TYPE[]){
        const view = new NovaView(this,type,code,label);
        for(const clause of clauses){
            switch(clause.clause){
                case "order": view.setOrder(clause.order); break;
                case "group": view.setGroup(clause.group); break;
                case "alter": view.setAlter(clause.alter); break;
                case "shows": view.setShows(clause.shows); break;
                case "where": view.setWhere(clause.where); break;
            }
        }
        this.elm.appendChild(view.elm);
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
        this.loadData();
    }

    loadData(){
        const data:BlockData = loadData(this.nova,this.from,this.on);
        this.data.set(data);
    }
    onDataChange(){}

}

function loadData(nova:NovaNotePlugin,from:FROM_TYPE,on:OPR_TYPE):BlockData{
    switch(from.type){
        case "tag":      return loadFromTag(nova,from.value,on);
        case "resource": return loadFromResource(nova,from.value,on);
        case "all":      return loadFromAll(nova,on);
        case "local":    return loadFromLocal(nova,from.value,on);
        case "path":     return loadFromPath(nova,from.value,on);
    }
    return [];
}
