import { optWhitespace, regex, seqMap, string } from "parsimmon"
import { EXPRESSION, WORD, opt, type OprType } from "../../parser";

export type ParsedImageString = { type:'icon',icon:string,props:{ key:string, value:OprType }[] };

export const imageStringParser = seqMap(
    regex(/\$icon/i).then(string(':').then(WORD)).skip(optWhitespace),
    opt(string('&').skip(optWhitespace).then(seqMap(WORD,string(':').skip(optWhitespace),EXPRESSION,(key,_,value)=>({ key,value })).many())),
    (icon,props):ParsedImageString=>({ type:'icon',icon,props:props??[] })
);
export const parseImageString = (data:string):ParsedImageString=>imageStringParser.tryParse(data);