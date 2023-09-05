import NovaBlock from "./NovaBlock";
import NovaCol from "./NovaCol";
import type { BlockType } from "./definitions";
import { type MarkdownPostProcessorContext } from "obsidian";
import parse from "./parser";
import type Nova from "src/Nova";

export function handleBlockData(nova:Nova,parentElm:HTMLElement,data:BlockType[]){
    const cols:NovaCol[] = [];
    for(const bData of data){
        switch(bData.block){
            case 'column': handleColumn(bData); break;
            case 'display': handleDisplay(bData); break;
        }
    }

    function handleColumn(data:Extract<BlockType,{ block:'column' }>){
        switch(data.type){
            case 'start':
                cols.push(new NovaCol(data.width));
                break;
            case 'break':
                if(cols.length<=0) throw new Error('Column Break without Column Start');
                cols[cols.length-1].break(data.width);
                break;
            case  "end" :
                if(cols.length<=0) throw new Error('Column End without Column Start');
                cols.pop();
                break;
        }
    }
    
    function handleDisplay(data:Extract<BlockType,{ block:'display' }>){
        const block = new NovaBlock(nova);
        block.setType(data.type??'data');
        for(const clause of data.clauses){
            switch(clause.clause){
                case "from":    block.setFrom(clause.source); break;
                case "on":      block.setOn(clause.on); break;
                case "focus":   block.setFocus(clause.focus); break;
                case "view":    block.addView(clause.type,clause.id,clause.label,clause.clauses); break;
            }
        }
        if(cols.length>0) cols[cols.length-1].add(block);
        else parentElm.appendChild(block.elm);
        block.load();
    }
}

export function codeBlockProcessor(nova:Nova,source:string, el:HTMLElement, ctx:MarkdownPostProcessorContext){
    const sec = el.createEl('div','nova-sec');
    try {
        const data = parse(source);
        handleBlockData(nova,sec,data);
    } catch(err){
        console.error(err);
        sec.innerHTML = '<pre style="font-size:.85em">' + (err.message ? err.message : err) + '</pre>';
    }
}
