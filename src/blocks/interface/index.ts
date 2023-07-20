import { parseImageString, type ParsedImageString } from "./parser";
import type { BlockDataElm } from "../NovaBlock";
import { setIcon } from "obsidian";
import { processOPR, type FileData } from "../dataLoader";

export function makeIcon(iconStr:string, data:BlockDataElm, fileData:FileData){
    iconStr = iconStr.trim();
    const elm = document.createElement('div');
    if(iconStr[0]==='$'){
        const res = parseImageString(iconStr);
        if(res.type==='icon') makeIconImage(elm,res,data,fileData);
        return elm;
    }
    setIcon(elm,iconStr);
    return elm;
}

export function makeImage(name:string,imageStr:string, data:BlockDataElm, fileData:FileData):HTMLElement {
    imageStr = imageStr.trim();
    if(imageStr[0]==='$'){
        const res = parseImageString(imageStr);
        const elm = document.createElement('div');
        if(res.type==='icon') makeIconImage(elm,res,data,fileData);
        return elm;
    }
    const elm = document.createElement('img');
    elm.setAttribute('href',imageStr);
    elm.setAttribute('alt',name);
    return elm;
}

function makeIconImage(elm:HTMLElement,res:ParsedImageString,data:BlockDataElm,fileData:FileData){
    setIcon(elm,res.icon);
    for(const prop of res.props){
        const value = processOPR(data,fileData,prop.value,data.meta?.frontmatter);
        switch(prop.key){
            case 'color': if(value!=null) elm.style.color = value.toString(); break;
        }
    }
}
