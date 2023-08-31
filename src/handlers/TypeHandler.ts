import { parseType } from "../resources/parser";
import FileData from "../data/FileData";
import TypeData from "../data/TypeData";
import TypeDataElm from "../data/TypeDataElm";

export function getType(data:FileData,type:string):TypeData|null{console.log(type,data);
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
export function getTypes(data:FileData):{ [key:string]:TypeData }{
    const meta = data.getMetadata();
    if(!meta || !meta.frontmatter || !meta.frontmatter['nova-type']) return {};
    const typeElms:{ [key:string]:TypeData } = {};
    for(const type of meta.frontmatter['nova-type']){ const res = getType(data,type); if(res) typeElms[type] = res; }
    return typeElms;
}
