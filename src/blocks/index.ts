import NovaBlock from "./NovaBlock";
import NovaCol from "./NovaCol";
import type { BLOCK_TYPE } from "./definitions";
import type { MarkdownPostProcessorContext } from "obsidian";
import parse from "./parser";
import type NovaNotePlugin from "src/main";

export function handleBlockData(nova:NovaNotePlugin,parentElm:HTMLElement,data:BLOCK_TYPE[]){
    const cols:NovaCol[] = [];
    for(const bData of data){
        switch(bData.block){
            case 'column': handleColumn(bData); break;
            case 'display': handleDisplay(bData); break;
        }
    }

    function handleColumn(data:Extract<BLOCK_TYPE,{ block:'column' }>){
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
    
    function handleDisplay(data:Extract<BLOCK_TYPE,{ block:'display' }>){
        const block = new NovaBlock(nova);console.log(data);
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

export function codeBlockProcessor(source:string, el:HTMLElement, ctx:MarkdownPostProcessorContext){
    const sec = el.createEl('div','nova-sec');
    try {
        const data = parse(source);
        handleBlockData(this,sec,data);
    } catch(err){
        console.error(err);
        sec.innerHTML = '<pre style="font-size:.85em">' + (err.message ? err.message : err) + '</pre>';
    }
}