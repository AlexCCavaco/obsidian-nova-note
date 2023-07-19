import { alt, optWhitespace, regex, seqMap, string, whitespace } from "parsimmon";
import { WORD, SWORD, opt, EXPRESSION, type OPR_TYPE, OPTW_EOF } from "../parser";

export type RESOURCE_COL_STRING = {
    label:string,
    type:'text'|'number'|'select'|'multisel'|'list'|'check'|'file'|'folder'|'link'|'date'|'time'|'datetime'|'status'|string,
    input:true,
    multi:boolean
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
export type RESOURCE_COL_TYPE = RESOURCE_COL_RESOURCE | RESOURCE_COL_VALUE | RESOURCE_COL_STRING;
export type RESOURCE_TYPE = { [key:string]:RESOURCE_COL_TYPE };

export const parser = seqMap(
    SWORD,
    alt(
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

export default (data:string):RESOURCE_COL_TYPE=>parser.tryParse(data);
