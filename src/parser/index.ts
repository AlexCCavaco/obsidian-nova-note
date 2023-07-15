import { Parser, regex, seqMap, sepBy, alt, string, optWhitespace, whitespace } from "parsimmon";
import { NUMBER, WORD, STRING, WORDQ, expression, listed } from "./keys";

const clearSpaces = (parser:Parser<any>)=>optWhitespace.then(parser).skip(optWhitespace);
const clearSpacedString = (val:string)=>clearSpaces(string(val));

const key = (reg:RegExp)=>regex(reg).skip(whitespace);

const opt = (parser:Parser<any>)=>parser.times(0,1).map(res=>(res.length===0 ? null : res[0]));

/*/ COLUMN /*/
const columnHandler = seqMap(
    key(/COLUMN/i),
    alt(
        seqMap(key(/START/i),NUMBER,(_tp,width)=>({ type:'start',width })),
        seqMap(key(/BREAK/i),NUMBER,(_tp,width)=>({ type:'break',width })),
        key(/END/i).map(()=>({ type:'end',width:null }))
    ),
    (_col,{ type,width })=>({ block:'column',type,width })
);

/*/ VIEWS /*/
const viewHandler = seqMap(
    key(/LIST|TABLE|BOARDS|GALLERY|TIMELINE|CALENDAR/i),
    WORD, STRING, alt(
        seqMap(
            key(/ORDER/i), listed(seqMap(WORDQ,opt(key(/DESC|ASC/i)),(key,dsc)=>({ key,desc:(dsc.toLowerCase()==='desc') }))),
            (_,order)=>({ struct:'order',order })
        ),
        seqMap(
            key(/GROUP/i), listed(WORDQ),
            (_,group)=>({ struct:'group',group })
        ),
        seqMap(
            key(/ALTER/i),
            listed(seqMap(WORD,clearSpacedString('='),WORDQ,(lh,_,rh)=>({ lh,rh }))),
            (_,alter)=>({ struct:'alter',alter })
        ),
        seqMap(
            key(/SHOWS/i),
            listed(seqMap(WORD,opt(regex(/AS/i).skip(whitespace).then(WORDQ)),(key,value)=>({ key,value }))),
            (_,shows)=>({ struct:'shows',shows })
        ),
        seqMap(
            key(/WHERE/i),
            expression(),
            (_,where)=>({ struct:'where',where })
        )
    ),
    (type,id,label,structs)=>({ type:type.toLocaleLowerCase(),id,label,structs })
);

/*/ DISPLAY /*/
const displayHandler = seqMap(
    key(/DISPLAY/i),
    opt(key(/TASKS|DATA/i)),
    alt(
        seqMap(key(/FROM/i),alt(
            seqMap(string('*').skip(whitespace),()=>({ source:'all',value:null })),
            seqMap(string('#'),WORD,(_,value)=>({ source:'tag',value })),
            seqMap(string('@'),WORD,(_,value)=>({ source:'resource',value })),
            seqMap(string('^'),WORD,(_,value)=>({ source:'locale',value })),
            seqMap(WORDQ,(value)=>({ source:'path',value }))
        ),(_f,{ source,value })=>({ struct:'from',source,value })),
        seqMap(key(/ON/i),expression(),(_,data)=>({ struct:'on',data })),
        seqMap(key(/FOCUS/i),WORD,(_f,focus)=>({ struct:'focus',focus })),
        seqMap(key(/VIEW/i),viewHandler.many(),(_v,views)=>({ struct:'view',views }))
    ),
    (_dis,type,structs)=>({ block:'display',type,structs })
);

/*/ BASE /*/
const handler = columnHandler.or(displayHandler);

export const parser = sepBy(handler,optWhitespace);
export default (data:string)=>parser.tryParse(data);
