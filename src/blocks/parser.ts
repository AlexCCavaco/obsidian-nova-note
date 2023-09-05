import { Parser, regex, seqMap, sepBy, alt, string, optWhitespace, whitespace } from "parsimmon";
import { NUMBER, WORD, STRING, SWORD, EXPRESSION, listed, W_EOF, opt, makeExpression } from "../parser";
import type { BlockType, DisplayClauseType, FROM_TYPE, ViewClauseType } from "src/blocks/definitions";

const clearSpaces = <T>(parser:Parser<T>):Parser<T>=>optWhitespace.then(parser).skip(optWhitespace);
const clearSpacedString = (val:string)=>clearSpaces(string(val));

const key = (reg:RegExp)=>regex(reg).skip(whitespace);

/*/ COLUMN /*/
const columnHandler = (data:string)=>seqMap(
    key(/COLUMN/i),
    alt(
        seqMap(key(/START/i),NUMBER,(_tp,width)=>({ type:'start',width })),
        seqMap(key(/BREAK/i),NUMBER,(_tp,width)=>({ type:'break',width })),
        key(/END/i).skip(W_EOF).map(()=>({ type:'end',width:null }))
    ),
    (_col,{ type,width })=>({ block:'column',type,width } as BlockType)
);

/*/ VIEWS /*/
const viewHandler = (data:string)=>seqMap(
    key(/LIST|TABLE|BOARDS|GALLERY|TIMELINE|CALENDAR/i),
    WORD, STRING, alt(
        seqMap(
            key(/ORDER/i), listed(seqMap(SWORD,opt(key(/DESC|ASC/i)),(key,oType)=>({ key,desc:(oType?(oType.toLowerCase()==='desc'):false) }))),
            (_,order)=>({ clause:'order',order } as ViewClauseType)
        ),
        seqMap(
            key(/GROUP/i), listed(SWORD),
            (_,group)=>({ clause:'group',group } as ViewClauseType)
        ),
        seqMap(
            key(/ALTER/i),
            listed(seqMap(WORD,clearSpacedString('='),makeExpression(data,EXPRESSION),(lhs,_,rhs)=>({ lhs,rhs:rhs }))),
            (_,alter)=>({ clause:'alter',alter } as ViewClauseType)
        ),
        seqMap(
            key(/SHOWS/i),
            listed(seqMap(makeExpression(data,EXPRESSION),opt(regex(/AS/i).skip(whitespace).then(SWORD)),(key,label)=>({ key:key,label }))),
            (_,shows)=>({ clause:'shows',shows } as ViewClauseType)
        ),
        seqMap(
            key(/WHERE/i), makeExpression(data,EXPRESSION),
            (_,where)=>({ clause:'where',where:where } as ViewClauseType)
        )
    ).many(),
    (type,id,label,clauses)=>({ clause:'view',type:type.toLowerCase(),id,label,clauses } as DisplayClauseType)
);

/*/ DISPLAY /*/
const displayHandler = (data:string)=>seqMap(
    key(/DISPLAY/i),
    opt(key(/TASKS|DATA/i).map(v=>v.toLowerCase())),
    alt(
        seqMap(key(/FROM/i),alt(
            seqMap(string('*').skip(W_EOF),()=>({ type:'all' } as FROM_TYPE)),
            seqMap(string('#'),WORD,(_,value)=>({ type:'tag',value } as FROM_TYPE)),
            seqMap(string('@'),WORD,(_,value)=>({ type:'resource',value } as FROM_TYPE)),
            seqMap(string('^'),WORD,(_,value)=>({ type:'local',value } as FROM_TYPE)),
            seqMap(SWORD,(value)=>({ type:'path',value } as FROM_TYPE))
        ),(_f,source)=>({ clause:'from',source } as DisplayClauseType)),
        seqMap(key(/ON/i),makeExpression(data,EXPRESSION),(_,on)=>({ clause:'on',on } as DisplayClauseType)),
        seqMap(key(/FOCUS/i),WORD,(_f,focus)=>({ clause:'focus',focus } as DisplayClauseType)),
        seqMap(key(/VIEW/i),viewHandler(data),(_v,view)=>view)
    ).many(),
    (_dis,type,clauses)=>({ block:'display',type,clauses } as BlockType)
);

/*/ BASE /*/
const handler = (data:string)=>columnHandler(data).or(displayHandler(data));

export const parser = (data:string)=>sepBy(handler(data),optWhitespace);
export default (data:string)=>parser(data).tryParse(data);
