import type Nova from "src/Nova";
import NovaController from "./NovaController";
import type FileData from "src/data/FileData";
import TypeData from "src/data/TypeData";
import TypeDataElm from "src/data/TypeDataElm";
import { parseType } from "src/resources/parser";

export default class extends NovaController {

    constructor(nova:Nova){
        super(nova);
    }

    getType(data:FileData,type:string):TypeData|null{
        const meta = data.getMetadata();
        if(!meta || !meta.frontmatter || !meta.frontmatter['nova-type'] || !type || !meta.frontmatter['nova-type'][type]) return null;
        const typeData = meta.frontmatter['nova-type'][type];
        const typeObj = new TypeData(type);
        for(const dataKey in typeData){
            const parsedTypeData = parseType(typeData[dataKey]);
            typeObj.addElm(new TypeDataElm(dataKey,parsedTypeData.label,parsedTypeData.props));
        }
        return typeObj;
    }
    
    getTypes(data:FileData):{ [key:string]:TypeData }{
        const meta = data.getMetadata();
        if(!meta || !meta.frontmatter || !meta.frontmatter['nova-type']) return {};
        const typeElms:{ [key:string]:TypeData } = {};
        for(const type of meta.frontmatter['nova-type']){ const res = this.getType(data,type); if(res) typeElms[type] = res; }
        return typeElms;
    }

}
