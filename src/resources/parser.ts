import { alt, optWhitespace, regex, seqMap, string, whitespace } from "parsimmon";
import { WORD, SWORD, opt, EXPRESSION, OPTW_EOF } from "../parser";
import type { ResourceColStringType } from "./ResourceColString";
import type { ResourceColDefTypeType } from "./ResourceColDefType";
import type { ResourceColResourceType } from "./ResourceColResource";
import type { ResourceColValueType } from "./ResourceColValue";

export type ResourceColType = ResourceColResourceType | ResourceColValueType | ResourceColStringType | ResourceColDefTypeType;
export type ResourceType = { [key:string]:ResourceColType };

export const parser = seqMap(
    SWORD,
    alt(
        seqMap(
            string('$').then(WORD),
            opt(string('+')).skip(OPTW_EOF),
            opt(string('*')).skip(OPTW_EOF),
            (value,multi,required)=>({ type:'type',value,input:true,multi:!!multi,required:!!required } as Omit<ResourceColDefTypeType,'label'>)
        ),
        seqMap(
            string('@').then(WORD),
            opt(string('+')).skip(OPTW_EOF),
            regex(/ON/i).skip(whitespace).then(EXPRESSION),
            (resource,multi,on)=>({ type:'resource',resource,on,input:false,multi:!!multi,required:false } as Omit<ResourceColResourceType,'label'>)
        ),
        seqMap(
            string('@').then(WORD),
            opt(string('+')).skip(OPTW_EOF),
            opt(string('*')).skip(OPTW_EOF),
            (resource,multi,required)=>({ type:'resource',resource,on:null,input:true,multi:!!multi,required:!!required } as Omit<ResourceColResourceType,'label'>)
        ),
        seqMap(
            string('=>').skip(optWhitespace).then(EXPRESSION),
            (value)=>({ type:'value',value,multi:false,required:false } as Omit<ResourceColValueType,'label'>)
        ),
        seqMap(
            regex(/TEXT|NUMBER|CHECK|LINK|DATE|TIME|DATETIME|COLOR/i),
            opt(string('+')).skip(OPTW_EOF),
            opt(string('*')).skip(OPTW_EOF),
            (type,multi,required)=>({ type:type.toLowerCase(),multi:!!multi,input:true,required:!!required } as Omit<ResourceColStringType,'label'>)
        )
    ),
    (label,data)=>({ label,...data })
);

export type TypeData = { name:string,label:string,props:{[key:string]:any} };

export const typeParser = seqMap(
    SWORD,
    seqMap(WORD,string(':'),SWORD,(key,_,value)=>({ key,value })).many(),
    (label,data)=>{ const props:{[key:string]:any} = {}; for(const elm of data) props[elm.key]=elm.value; return { label,props }; }
);

export const parseType = (data:string):Omit<TypeData,'name'>=>typeParser.tryParse(data);

//TODO — export type ActionData = { name:string,label:string,props:{[key:string]:any} };

//TODO — export const actionParser = seqMap(
//TODO —     SWORD,
//TODO —     seqMap(WORD,string(':'),SWORD,(key,_,value)=>({ key,value })).many(),
//TODO —     (label,data)=>{ const props:{[key:string]:any} = {}; for(const elm of data) props[elm.key]=elm.value; return { label,props }; }
//TODO — );

//TODO — export const parseAction = (data:string):ActionData=>actionParser.tryParse(data);

export default (data:string):ResourceColType=>parser.tryParse(data);
