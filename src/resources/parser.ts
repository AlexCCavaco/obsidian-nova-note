import { alt, optWhitespace, regex, seqMap, string, whitespace } from "parsimmon";
import { WORD, SWORD, opt, EXPRESSION, type OPR_TYPE, OPTW_EOF } from "../parser";

export type RESOURCE_COL_STRING = {
    label:string,
    type:'text'|'number'|'check'|'link'|'date'|'time'|'datetime'|'color',
    input:true,
    multi:boolean,
    required:boolean
};
export type RESOURCE_COL_DEFTYPE = {
    label:string,
    type:'type',
    input:true,
    multi:boolean,
    required:boolean,
    value:string|null
};
export type RESOURCE_COL_RESOURCE = {
    label:string,
    type:'resource',
    input:boolean,
    multi:boolean,
    required:boolean,
    resource:string|null,
    on:OPR_TYPE
};
export type RESOURCE_COL_VALUE = {
    label:string,
    type:'value',
    input:false,
    multi:false,
    value:OPR_TYPE
};
export type RESOURCE_COL_TYPE = RESOURCE_COL_RESOURCE | RESOURCE_COL_VALUE | RESOURCE_COL_STRING | RESOURCE_COL_DEFTYPE;
export type RESOURCE_TYPE = { [key:string]:RESOURCE_COL_TYPE };

export const parser = seqMap(
    SWORD,
    alt(
        seqMap(
            string('$').then(WORD),
            opt(string('+')).skip(OPTW_EOF),
            opt(string('*')).skip(OPTW_EOF),
            (value,multi,required)=>({ type:'type',value,input:true,multi:!!multi,required:!!required } as Omit<RESOURCE_COL_DEFTYPE,'label'>)
        ),
        seqMap(
            string('@').then(WORD),
            opt(string('+')).skip(OPTW_EOF),
            regex(/ON/i).skip(whitespace).then(EXPRESSION),
            (resource,multi,on)=>({ type:'resource',resource,on,input:false,multi:!!multi,required:false } as Omit<RESOURCE_COL_RESOURCE,'label'>)
        ),
        seqMap(
            string('@').then(WORD),
            opt(string('+')).skip(OPTW_EOF),
            opt(string('*')).skip(OPTW_EOF),
            (resource,multi,required)=>({ type:'resource',resource,on:null,input:true,multi:!!multi,required:!!required } as Omit<RESOURCE_COL_RESOURCE,'label'>)
        ),
        seqMap(
            string('=>').skip(optWhitespace).then(EXPRESSION),
            (value)=>({ type:'value',value,multi:false } as Omit<RESOURCE_COL_VALUE,'label'>)
        ),
        seqMap(
            regex(/TEXT|NUMBER|CHECK|LINK|DATE|TIME|DATETIME|COLOR/i),
            opt(string('+')).skip(OPTW_EOF),
            opt(string('*')).skip(OPTW_EOF),
            (type,multi,required)=>({ type:type.toLowerCase(),multi:!!multi,input:true,required:!!required } as Omit<RESOURCE_COL_STRING,'label'>)
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

export default (data:string):RESOURCE_COL_TYPE=>parser.tryParse(data);
