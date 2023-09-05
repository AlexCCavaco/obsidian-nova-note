import type { DISPLAY_TYPE, FROM_TYPE, ViewClauseType, VIEW_TYPE } from "./definitions";
import Block from "./components/Block.svelte";
import NovaView from "./NovaView";
import { writable, type Writable } from "svelte/store";
import FileData from "src/data/FileData";
import type FileDataElm from "src/data/FileDataElm";
import type Nova from "src/Nova";
import Expression from "src/data/Expression";

export type BlockDataVal = {[key:string]:unknown|{lazy:true,get:()=>unknown}};

export default class {

    elm:  HTMLElement;
    head: HTMLElement;
    body: HTMLElement;
    component:  Block;
    nova: Nova;

    type:   DISPLAY_TYPE;
    from:   FROM_TYPE;
    focus:  Writable<string|null>;
    on:     Expression;
    views:  NovaView[];
    data:   Writable<FileDataElm[]>;
    file:   FileData;

    constructor(nova:Nova){
        this.elm = document.createElement('div');
        this.elm.classList.add('nova-block');
        this.nova = nova;
        /*/===/*/
        this.type   = 'data';
        this.from   = { type:'all' };
        this.focus  = writable(null);
        this.on     = Expression.true();
        this.views  = [];
        this.data   = writable([]);
        this.file   = FileData.getCurrent(nova);
    }

    setType(type?:DISPLAY_TYPE){ this.type = type ?? 'data'; }
    setFrom(from:FROM_TYPE){ this.from = from; }
    setFocus(focus:string){ this.focus.set(focus); }
    setOn(on:Expression){ this.on = on; }

    addView(type:VIEW_TYPE,code:string,label:string,clauses:ViewClauseType[]){
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

    async load(){
        this.component = new Block({
            target: this.elm,
            props: {
                block: this
            }
        });
        await this.loadData();
    }

    async loadData(){
        const data:FileDataElm[] = await loadData(this.nova,this.from,this.on);
        this.data.set(data);
    }

    onDataChange(){}

}

async function loadData(nova:Nova,from:FROM_TYPE,on:Expression):Promise<FileDataElm[]>{
    switch(from.type){
        case "tag":      return await nova.loader.loadFromTag(from.value,on);
        case "resource": return await nova.loader.loadFromResource(from.value,on);
        case "all":      return await nova.loader.loadFromAll(on);
        case "local":    return await nova.loader.loadFromLocal(from.value,on);
        case "path":     return await nova.loader.loadFromPath(from.value,on);
    }
    return [];
}
