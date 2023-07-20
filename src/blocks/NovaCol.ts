import type NovaBlock from "./NovaBlock";

export default class {

    elm: HTMLElement;
    cols: { elm:HTMLElement,width:number }[]

    constructor(width:number){
        this.elm = document.createElement('div');
        this.elm.classList.add('nova-col');
        this.cols = [];
        this.break(width);
    }

    add(block:NovaBlock){
        this.cols[this.cols.length-1].elm.appendChild(block.elm);
    }

    break(width:number){
        const elm = document.createElement('div');
        elm.classList.add('nova-col-split');
        this.cols.push({ width,elm });
        return elm;
    }

}
