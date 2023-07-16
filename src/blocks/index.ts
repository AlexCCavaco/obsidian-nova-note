import NovaBlock from "./NovaBlock";
import NovaCol from "./NovaCol";
import type { BLOCK_TYPE } from "./definitions";

export function handleBlockData(parentElm:HTMLElement,data:BLOCK_TYPE[]){
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
        const block = new NovaBlock();console.log(data);
        block.setType(data.type??'data');
        for(const clause of data.clauses){
            switch(clause.clause){
                case "from": block.setFrom({ type:clause.source, value:clause.value }); break;
                case "on": block.setOn(clause.on); break;
                case "focus": block.setFocus(clause.focus); break;
                case "view": block.addView(clause.type,clause.id,clause.label,clause.clauses); break;
            }
        }
        if(cols.length>0) cols[cols.length-1].add(block);
        else parentElm.appendChild(block.elm);
        block.load();
    }
}
