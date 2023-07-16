import type { OPR_TYPE } from "src/parser/keys";
import View from "./components/View.svelte";
import type { VIEW_TYPE } from "./definitions";

export default class {

    elm: HTMLElement;
    type: VIEW_TYPE;
    id: string;
    label: string;
    component: View;

    order: { key:string,desc?:boolean }[];
    group: string[];
    alter: { lhs:string,rhs:string }[];
    shows: { key:string,label?:string }[];
    where: OPR_TYPE;

    constructor(type:VIEW_TYPE,id:string,label:string){
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
    }

    setOrder(order:this['order']){ this.order = order; }
    setGroup(group:this['group']){ this.group = group; }
    setAlter(alter:this['alter']){ this.alter = alter; }
    setShows(shows:this['shows']){ this.shows = shows; }
    setWhere(where:OPR_TYPE){ this.where = where; }

    load(){
        this.component = new View({
            target: this.elm,
            props: {
                view: this
            }
        });
    }

}
