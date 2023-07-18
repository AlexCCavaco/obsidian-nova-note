import { regex, seqMap, string } from "parsimmon";
import { WORD, SWORD, opt, W_EOF } from "../parser";

export type RESOURCE_COL_TYPE = {
    label:string,
    type:'text'|'number'|'select'|'multisel'|'list'|'check'|'file'|'folder'|'url'|'date'|'time'|'datetime'|'status'|string,
    resource?:string|null,
    empty:boolean,
    ref?:{ resource:string,col:string }|null
};
export type RESOURCE_TYPE = { [key:string]:RESOURCE_COL_TYPE };

export const parser = seqMap(
    SWORD,
    regex(/TEXT|NUMBER|SELECT|MULTISEL|LIST|CHECK|FILE|FOLDER|URL|DATE|TIME|DATETIME|STATUS/i).skip(W_EOF).map(type=>([type.toLowerCase()]))
        .or(string('@').then(WORD).map((resource)=>(['resource',resource]))),
    opt(regex(/EMPTY/i).desc('empty').result(true)).skip(W_EOF),
    opt(regex(/REF/i).then(seqMap(WORD,string('@'),WORD,(col,_,resource)=>({ resource,col })))),
    (label,type,empty,ref)=>({ label,type:type[0],resource:type[1]??null,empty:empty??false,ref })
);

export default (data:string):RESOURCE_COL_TYPE=>parser.tryParse(data);
