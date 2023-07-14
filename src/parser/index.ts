import NovaBlock from "../NovaBlock";
import { isDisplay } from "./definitions";

export type ParserData = [ string,number ];
export type ParserValue<DataType> = [ DataType,ParserData ];

export default (data:string)=>{
    const lines = data.split('\n');
    const lineLength = lines.length;
    const block = new NovaBlock();
    for(let i = 0; i < lineLength; i++) handleBase(block,lines,i);
}

function handleBase(block:NovaBlock,data:string[],position:number){
    const line = data[position];
    if(!line) return;
    const keyData = getKey([ line, 0 ]);
    switch(keyData[0]){
        case 'display': return display(block,keyData[1]);
        case 'from':
        case 'on':
        case 'focus':
        case 'view':
        default: return;
    }
}

function display(block:NovaBlock,data:ParserData){
    const display = getKey(data);
    block.setDisplay(isDisplay(display[0]) ? display[0] : undefined);
    return display;
}

function handleView(data:string[],position:number){
    //
}

function getKey(data:ParserData):ParserValue<string> {
    let str = '';
    const strLength = str.length;
    for(let i = data[1]; i < strLength; i++){
        const char = str[i];
        if(/\s/.test(char)) return [ str, [ data[0], i+1 ]];
        str+= char;
    }
    return [ str, [ data[0], strLength ]];
}