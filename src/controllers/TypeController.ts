import type Nova from "src/Nova";
import NovaController from "./NovaController";
import type FileData from "src/data/FileData";
import TypeData from "src/data/TypeData";
import TypeDataElm from "src/data/TypeDataElm";
import { parseType } from "src/resources/parser";
import ErrorNotice from "src/notices/ErrorNotice";

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
            try {
                const parsedTypeData = parseType(typeData[dataKey]);
                typeObj.addElm(new TypeDataElm(dataKey,parsedTypeData.label,parsedTypeData.props));
            } catch(err){
                ErrorNotice.error(err,`Type ${dataKey} has Errors: `);
                continue;
            }
        }
        return typeObj;
    }
    
    getTypes(data:FileData):{ [key:string]:TypeData }{
        const meta = data.getMetadata();
        if(!meta || !meta.frontmatter || !meta.frontmatter['nova-type']) return {};
        const typeElms:{ [key:string]:TypeData } = {};
        const types = meta.frontmatter['nova-type'];
        for(const key in types){ const res = this.getType(data,key); if(res) typeElms[key] = res; }
        return typeElms;
    }

}
