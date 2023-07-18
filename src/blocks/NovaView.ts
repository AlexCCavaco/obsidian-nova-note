import { isObjValType, isOfValType, type OPR_TYPE } from "src/parser";
import View from "./components/View.svelte";
import type { VIEW_TYPE } from "./definitions";
import { processConditions, type FileData, processOPR } from "./dataLoader";
import type NovaBlock from "./NovaBlock";
import { writable, type Writable } from "svelte/store";
import type { BlockData, BlockDataElm } from "./NovaBlock";

export type BaseOptsType = { [key:string]:unknown };
export type BaseDataType = { [key:string]:{ value:unknown,label:string } };

export type ViewDataElm<OptsT extends BaseOptsType=BaseOptsType,DataT extends BaseDataType=BaseDataType> = { opts:OptsT,data:DataT,block:BlockDataElm,link:string };
export type ViewData<OptsT extends BaseOptsType=BaseOptsType,DataT extends BaseDataType=BaseDataType> = ViewDataElm<OptsT,DataT>[];

export default class {

    elm: HTMLElement;
    type: VIEW_TYPE;
    id: string;
    label: string;
    component: View;

    order: { key:string,desc?:boolean }[];
    group: string[];
    alter: { lhs:string,rhs:OPR_TYPE }[];
    shows: { key:OPR_TYPE,label?:string }[];
    where: OPR_TYPE;

    data:  Writable<ViewData>;
    block: NovaBlock;
    file:  FileData;

    constructor(block:NovaBlock,type:VIEW_TYPE,id:string,label:string){
        this.elm = document.createElement('div');
        this.elm.classList.add('nova-block-view');
        this.type = type;
        this.id = id;
        this.label = label;
        /*/===/*/
        this.order = [];
        this.group = [];
        this.alter = [];
        this.shows = [];
        this.where = true;
        this.data  = writable([]);
        this.block = block;
        this.file = this.block.file;

        block.data.subscribe((data)=>this.loadData(data));
    }

    setOrder(order:this['order']){ this.order = order; }
    setGroup(group:this['group']){ this.group = group; }
    setAlter(alter:this['alter']){ this.alter = alter; }
    setShows(shows:this['shows']){ this.shows = shows; }
    setWhere(where:this['where']){ this.where = where; }

    load(){
        this.component = new View({
            target: this.elm,
            props: {
                view: this
            }
        });
    }

    loadData(blockData:BlockData){
        const nData:ViewData = [];
        let index = 0;
        for(const data of blockData){
            if(!processConditions(data,this.file,this.where)) continue;
            const elm:ViewDataElm = { data:{},opts:{},block:data,link:data.file.path };
            for(const show of this.shows){
                const name = show.key!=null && isOfValType(show.key) ?
                    (isObjValType(show.key) ? show.key.value.toString() : show.key.toString()) : `col:${++index}`;
                elm.data[name] = { value:processOPR(data,this.file,show.key),label:show.label??name };
            }
            for(const altr of this.alter) elm.opts[altr.lhs] = processOPR(data,this.file,altr.rhs);
            nData.push(elm);
        }
        this.data.set(nData);
    }

}
