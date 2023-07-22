import { alt, optWhitespace, regex, seqMap, string, whitespace } from "parsimmon";
import { WORD, SWORD, opt, EXPRESSION, type OPR_TYPE, OPTW_EOF } from "../parser";

export type RESOURCE_COL_STRING = {
    label:string,
    type:'text'|'number'|'select'|'multisel'|'list'|'check'|'file'|'folder'|'link'|'date'|'time'|'datetime'|'status'|string,
    input:true,
    multi:boolean
};
export type RESOURCE_COL_DEFTYPE = {
    label:string,
    type:'type',
    input:false,
    multi:boolean,
    value:string|null
};
export type RESOURCE_COL_RESOURCE = {
    label:string,
    type:'resource',
    input:boolean,
    multi:boolean,
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
            (value,multi)=>({ type:'type',value,input:false,multi:!!multi } as Omit<RESOURCE_COL_DEFTYPE,'label'>)
        ),
        seqMap(
            string('@').then(WORD),
            opt(string('+')).skip(OPTW_EOF),
            opt(regex(/ON/i).skip(whitespace).then(EXPRESSION)),
            (resource,multi,on)=>({ type:'resource',resource,on,input:!!on,multi:!!multi } as Omit<RESOURCE_COL_RESOURCE,'label'>)
        ),
        seqMap(
            string('=>').skip(optWhitespace).then(EXPRESSION),
            (value)=>({ type:'value',value,multi:false } as Omit<RESOURCE_COL_VALUE,'label'>)
        ),
        seqMap(
            regex(/TEXT|NUMBER|SELECT|MULTISEL|LIST|CHECK|FILE|FOLDER|LINK|DATE|TIME|DATETIME|STATUS/i),
            opt(string('+')).skip(OPTW_EOF),
            (type,multi)=>({ type:type.toLowerCase(),multi:!!multi,input:true } as Omit<RESOURCE_COL_STRING,'label'>)
        )
    ),
    (label,data)=>({ label,...data })
);

export const processedParser = seqMap(
    SWORD,
    alt(
        string('=>').skip(optWhitespace).then(EXPRESSION).map((value)=>([value])),
        seqMap(string('@').then(WORD),string('::').skip(optWhitespace).then(EXPRESSION),(resource,value)=>([value,resource]))
    ),
    //
    (label,data)=>({ label,resource:data[1]??null,value:data[0] })
);

export const typeParser = seqMap(
    SWORD,
    seqMap(WORD,string(':'),SWORD,(key,_,value)=>({ key,value })).many(),
    (label,data)=>{ const props:{[key:string]:any} = {}; for(const elm of data) props[elm.key]=elm.value;  return { label,props }; }
)

export const parseType = (data:string)=>typeParser.tryParse(data);

export default (data:string):RESOURCE_COL_TYPE=>parser.tryParse(data);
