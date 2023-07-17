import { Parser, regex, seqMap, sepBy, alt, string, optWhitespace, whitespace } from "parsimmon";
import { NUMBER, WORD, STRING, SWORD, EXPRESSION, listed, W_EOF, opt } from "../parser";
import type { BLOCK_TYPE, DISPLAY_CLAUSE_TYPE, VIEW_CLAUSE_TYPE } from "src/blocks/definitions";

const clearSpaces = <T>(parser:Parser<T>):Parser<T>=>optWhitespace.then(parser).skip(optWhitespace);
const clearSpacedString = (val:string)=>clearSpaces(string(val));

const key = (reg:RegExp)=>regex(reg).skip(whitespace);

/*/ COLUMN /*/
const columnHandler = seqMap(
    key(/COLUMN/i),
    alt(
        seqMap(key(/START/i),NUMBER,(_tp,width)=>({ type:'start',width })),
        seqMap(key(/BREAK/i),NUMBER,(_tp,width)=>({ type:'break',width })),
        key(/END/i).map(()=>({ type:'end',width:null }))
    ),
    (_col,{ type,width })=>({ block:'column',type,width } as BLOCK_TYPE)
);

/*/ VIEWS /*/
const viewHandler = seqMap(
    key(/LIST|TABLE|BOARDS|GALLERY|TIMELINE|CALENDAR/i),
    WORD, STRING, alt(
        seqMap(
            key(/ORDER/i), listed(seqMap(SWORD,opt(key(/DESC|ASC/i)),(key,oType)=>({ key,desc:(oType?(oType.toLowerCase()==='desc'):false) }))),
            (_,order)=>({ clause:'order',order } as VIEW_CLAUSE_TYPE)
        ),
        seqMap(
            key(/GROUP/i), listed(SWORD),
            (_,group)=>({ clause:'group',group } as VIEW_CLAUSE_TYPE)
        ),
        seqMap(
            key(/ALTER/i),
            listed(seqMap(WORD,clearSpacedString('='),SWORD,(lhs,_,rhs)=>({ lhs,rhs }))),
            (_,alter)=>({ clause:'alter',alter } as VIEW_CLAUSE_TYPE)
        ),
        seqMap(
            key(/SHOWS/i),
            listed(seqMap(WORD,opt(regex(/AS/i).skip(whitespace).then(SWORD)),(key,value)=>({ key,value }))),
            (_,shows)=>({ clause:'shows',shows } as VIEW_CLAUSE_TYPE)
        ),
        seqMap(
            key(/WHERE/i), EXPRESSION,
            (_,where)=>({ clause:'where',where } as VIEW_CLAUSE_TYPE)
        )
    ).many(),
    (type,id,label,clauses)=>({ clause:'view',type:type.toLowerCase(),id,label,clauses } as DISPLAY_CLAUSE_TYPE)
);

/*/ DISPLAY /*/
const displayHandler = seqMap(
    key(/DISPLAY/i),
    opt(key(/TASKS|DATA/i).map(v=>v.toLowerCase())),
    alt(
        seqMap(key(/FROM/i),alt(
            seqMap(string('*').skip(W_EOF),()=>({ source:'all',value:null })),
            seqMap(string('#'),WORD,(_,value)=>({ source:'tag',value })),
            seqMap(string('@'),WORD,(_,value)=>({ source:'resource',value })),
            seqMap(string('^'),WORD,(_,value)=>({ source:'local',value })),
            seqMap(SWORD,(value)=>({ source:'path',value }))
        ),(_f,{ source,value })=>({ clause:'from',source,value } as DISPLAY_CLAUSE_TYPE)),
        seqMap(key(/ON/i),EXPRESSION,(_,on)=>({ clause:'on',on } as DISPLAY_CLAUSE_TYPE)),
        seqMap(key(/FOCUS/i),WORD,(_f,focus)=>({ clause:'focus',focus } as DISPLAY_CLAUSE_TYPE)),
        seqMap(key(/VIEW/i),viewHandler,(_v,view)=>view)
    ).many(),
    (_dis,type,clauses)=>({ block:'display',type,clauses } as BLOCK_TYPE)
);

/*/ BASE /*/
const handler = columnHandler.or(displayHandler);

export const parser = sepBy(handler,optWhitespace);
export default (data:string)=>parser.tryParse(data);
