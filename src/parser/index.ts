import { string, optWhitespace, regex, alt, Parser, seq, seqMap, lazy, whitespace, eof } from "parsimmon";

export type VAL_TYPE = { type:string,value:unknown } & (
    { type:'array',value:unknown[] } |
    { type:'fn',value:[string,OPR_TYPE[]] } |
    { type:'string',value:string } |
    { type:'key',value:string } |
    { type:'number',value:number } |
    { type:'tag',value:string } ) |
    boolean | null;
export function isOfValType(data:OPR_TYPE):data is VAL_TYPE{ return !(data!= null && typeof data === 'object' && data.hasOwnProperty('op')); }
export type OBJ_VAL_TYPE = Exclude<VAL_TYPE,null|boolean>
export function isObjValType(data:VAL_TYPE):data is OBJ_VAL_TYPE{ return !(typeof data === 'boolean' || data == null); }

export type OPERAND = '-'|'!'|'+'|'-'|'*'|'/'|'='|'!='|'>'|'>='|'<'|'<='|'and'|'or'|'not'|'in'|'nin';

export const keyed      = <T>(parser:Parser<T>):Parser<T>=>parser.skip(optWhitespace);
export const listed     = <T>(parser:Parser<T>,seperator=','):Parser<T[]>=>parser.sepBy(string(seperator).skip(optWhitespace));
export const opt = <T>(parser:Parser<T>):Parser<T|null>=>parser.times(0,1).map(res=>(res.length===0 ? null : res[0]));

export const W_EOF      = whitespace.or(eof);
export const OPTW_EOF   = optWhitespace.or(eof);

export const LPAREN     = keyed(string('('));
export const RPAREN     = keyed(string(')'));

export const LBRACK     = keyed(string('['));
export const RBRACK     = keyed(string(']'));

export const SQUOTE     = keyed(string('\''));
export const DQUOTE     = keyed(string('"'));

export const NUMBER     = keyed(regex(/\d+/)).map(parseInt);
export const DECIMAL    = keyed(regex(/\d+\.\d+/)).map(parseFloat);
export const NUMERIC    = NUMBER.or(DECIMAL).map((value):VAL_TYPE=>({ value,type:'number' }));

export const WORD       = keyed(regex(/[\w_/.\-$]+/));
export const UWORD      = keyed(regex(/[\w_/.\-$]+/u));
export const STRING     = regex(/"(.*?)"|'(.*?)'/).map(str=>str.substring(1,str.length-1)).skip(optWhitespace);
export const SWORD      = WORD.or(STRING);
export const STRING_VAL = lazy(():Parser<VAL_TYPE>=>WORD.map((value):VAL_TYPE=>({ value,type:'key' })).or(STRING.map((value):VAL_TYPE=>({ value,type:'string' }))));

export const TAG        = lazy(():Parser<VAL_TYPE>=>keyed(string('#').then(UWORD)).map(value=>({ type:'tag',value })));

export const PLUS       = keyed(string('+'));
export const MINUS      = keyed(string('-'));
export const MULTIPLY   = keyed(string('*'));
export const DIVIDE     = keyed(string('/'));

export const EQUAL      = keyed(string('='));
export const DIFFERENT  = keyed(string('!='));

export const GREATER    = keyed(string('>'));
export const GREATER_EQ = keyed(string('>='));
export const LESSER     = keyed(string('<'));
export const LESSER_EQ  = keyed(string('<='));
export const COMPARE    = alt(GREATER,GREATER_EQ,LESSER,LESSER_EQ);

export const AND        = keyed(regex(/AND/i).desc('AND').skip(W_EOF)).result('and');
export const OR         = keyed(regex(/OR/i).desc('OR').skip(W_EOF)).result('or');
export const NOT        = keyed(regex(/NOT/i).desc('NOT').skip(W_EOF)).result('not');

export const IN         = keyed(regex(/IN/i).desc('IN').skip(W_EOF)).result('in');
export const LOGIC      = AND.or(OR).or(IN).or(NOT.then(IN).result('nin'));

export const TRUE       = keyed(regex(/TRUE/i).desc('true').skip(W_EOF)).result(true);
export const FALSE      = keyed(regex(/FALSE/i).desc('false').skip(W_EOF)).result(false);
export const NULL       = keyed(regex(/NULL/i).desc('null').skip(W_EOF)).result(null);

export const ARRAY      = lazy(():Parser<VAL_TYPE>=>LBRACK.then(listed(LITERAL)).skip(RBRACK).map((value)=>({ type:'array',value })));
export const FN         = lazy(():Parser<VAL_TYPE>=>seqMap(WORD,LPAREN.then(listed(EXPRESSION)).skip(RPAREN),(name,params)=>({ type:'fn',value:[name,params] })));
export const LITERAL    = lazy(():Parser<VAL_TYPE>=>alt(TRUE, FALSE, NULL, TAG, NUMERIC, FN, ARRAY, STRING_VAL));

export type OPERATION_TYPE = { lhs?:OPR_TYPE,op:OPERAND,rhs:OPR_TYPE };
export type OPR_TYPE = OPERATION_TYPE | VAL_TYPE;
const mapExpressions = (str:OPR_TYPE,data:[op:OPERAND,rhs:OPR_TYPE][]):OPR_TYPE=>{
    if(data.length===0) return str;
    let res:OPR_TYPE = str;
    for(const [op,value] of data){
        const obj:OPR_TYPE = { lhs:res,op,rhs:value };
        res = obj;
    }
    return res;
};

export const EXPRESSION     = lazy(():Parser<OPR_TYPE>=>LOGICAL);

export const PRIMARY        = lazy(():Parser<OPR_TYPE>=>LPAREN.then(EXPRESSION).skip(RPAREN)
                                    .or(MINUS.then(PRIMARY).map(rhs=>({ op:'-',rhs } as OPR_TYPE)))
                                    .or(  NOT.then(PRIMARY).map(rhs=>({ op:'!',rhs } as OPR_TYPE)))
                                    .or(LITERAL) );
export const MULTIPLICATIVE = lazy(():Parser<OPR_TYPE>=>seqMap(PRIMARY, seq(MULTIPLY.or(DIVIDE), PRIMARY).many(), mapExpressions));
export const ADDITIVE       = lazy(():Parser<OPR_TYPE>=>seqMap(MULTIPLICATIVE, seq(PLUS.or(MINUS), MULTIPLICATIVE).many(), mapExpressions));
export const EQUALITY       = lazy(():Parser<OPR_TYPE>=>seqMap(ADDITIVE, seq(EQUAL.or(DIFFERENT), ADDITIVE).many(), mapExpressions));
export const COMPARATIVE    = lazy(():Parser<OPR_TYPE>=>seqMap(EQUALITY, seq(COMPARE, EQUALITY).many(), mapExpressions));
export const LOGICAL        = lazy(():Parser<OPR_TYPE>=>seqMap(COMPARATIVE, seq(LOGIC, COMPARATIVE).many(), mapExpressions));
