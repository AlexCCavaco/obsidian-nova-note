import { parseImageString, type ParsedImageString } from "./parser";
import { setIcon } from "obsidian";
import type FileData from "src/data/FileData";
import type FileDataElm from "src/data/FileDataElm";
import Operation from "src/controllers/Operation";

export async function makeIcon(iconStr:string, data:FileDataElm, fileData:FileData){
    iconStr = iconStr.trim();
    const elm = document.createElement('div');
    if(iconStr[0]==='$'){
        const res = parseImageString(iconStr);
        if(res.type==='icon') await makeIconImage(elm,res,data,fileData);
        return elm;
    }
    setIcon(elm,iconStr);
    return elm;
}

export async function makeImage(name:string,imageStr:string, data:FileDataElm, fileData:FileData):Promise<HTMLElement> {
    imageStr = imageStr.trim();
    if(imageStr[0]==='$'){
        const res = parseImageString(imageStr);
        const elm = document.createElement('div');
        if(res.type==='icon') await makeIconImage(elm,res,data,fileData);
        return elm;
    }
    const elm = document.createElement('img');
    elm.setAttribute('href',imageStr);
    elm.setAttribute('alt',name);
    return elm;
}

async function makeIconImage(elm:HTMLElement,res:ParsedImageString,data:FileDataElm,fileData:FileData){
    setIcon(elm,res.icon);
    for(const prop of res.props){
        const operation = prop.value;
        const value = await Operation.process(data,fileData,operation,data.meta?.frontmatter);
        switch(prop.key){
            case 'color': if(value!=null) elm.style.color = value.toString(); break;
        }
    }
}

//function makeExternalLink(text:string,url:string,parentElm?:HTMLElement):HTMLElement{
//    const elm = document.createElement("a");
//    elm.textContent = text;
//    elm.rel = "noopener";
//    elm.target = "_blank";
//    elm.classList.add("external-link");
//    elm.href = url;
//    if(parentElm) parentElm.appendChild(elm);
//    return elm;
//}
