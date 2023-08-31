import { string, optWhitespace, regex, alt, Parser, seq, seqMap, lazy, whitespace, eof } from "parsimmon";

export type ValType = { type:string,value:unknown } & (
    { type:'array',value:unknown[] } |
    { type:'fn',value:[string,OprType[]] } |
    { type:'string',value:string } |
    { type:'key',value:string } |
    { type:'number',value:number } |
    { type:'tag',value:string } ) |
    boolean | null;
export function isOfValType(data:OprType):data is ValType{ return !(data!= null && typeof data === 'object' && data.hasOwnProperty('op')); }
export type ObjValType = Exclude<ValType,null|boolean>
export function isObjValType(data:ValType):data is ObjValType{ return !(typeof data === 'boolean' || data == null); }

export type OperandType = '-'|'!'|'+'|'-'|'*'|'/'|'='|'!='|'>'|'>='|'<'|'<='|'and'|'or'|'not'|'in'|'nin';

export const keyed      = <T>(parser:Parser<T>):Parser<T>=>parser.skip(OPTW_EOF);
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
export const NUMERIC    = NUMBER.or(DECIMAL).map((value):ValType=>({ value,type:'number' }));

export const WORD       = keyed(regex(/[\w_/.\-$]+/));
export const UWORD      = keyed(regex(/[\w_/.\-$]+/u));
export const STRING     = regex(/"(.*?)"|'(.*?)'/).map(str=>str.substring(1,str.length-1)).skip(optWhitespace);
export const SWORD      = WORD.or(STRING);
export const STRING_VAL = lazy(():Parser<ValType>=>WORD.map((value):ValType=>({ value,type:'key' })).or(STRING.map((value):ValType=>({ value,type:'string' }))));

export const TAG        = lazy(():Parser<ValType>=>keyed(string('#').then(UWORD)).map(value=>({ type:'tag',value })));

export const PLUS       = keyed(string('+'));
export const MINUS      = keyed(string('-'));
export const MULTIPLY   = keyed(string('*'));
export const DIVIDE     = keyed(string('/'));

export const INTERROG   = keyed(string('?'));
export const COLON      = keyed(string(':'));

export const EQUAL      = keyed(string('='));
export const DIFFERENT  = keyed(string('!='));

export const GREATER    = keyed(string('>'));
export const GREATER_EQ = keyed(string('>='));
export const LESSER     = keyed(string('<'));
export const LESSER_EQ  = keyed(string('<='));
export const COMPARE    = alt(GREATER,GREATER_EQ,LESSER,LESSER_EQ);

export const AND        = keyed(regex(/AND/i).desc('AND').skip(W_EOF)).result('and');
export const OR         = keyed(regex(/OR/i).desc('OR').skip(W_EOF)).result('or');
export const NOT        = keyed(alt(regex(/NOT/i).skip(W_EOF),string('!')).desc('NOT')).result('not');

export const IN         = keyed(regex(/IN/i).desc('IN').skip(W_EOF)).result('in');
export const LOGIC      = AND.or(OR).or(IN).or(NOT.then(IN).result('nin'));

export const TRUE       = keyed(regex(/TRUE/i).desc('true').skip(W_EOF)).result(true);
export const FALSE      = keyed(regex(/FALSE/i).desc('false').skip(W_EOF)).result(false);
export const NULL       = keyed(regex(/NULL/i).desc('null').skip(W_EOF)).result(null);

export const ARRAY      = lazy(():Parser<ValType>=>LBRACK.then(listed(LITERAL)).skip(RBRACK).map((value)=>({ type:'array',value })));
export const FN         = lazy(():Parser<ValType>=>seqMap(WORD,LPAREN.then(listed(EXPRESSION)).skip(RPAREN),(name,params)=>({ type:'fn',value:[name,params] })));
export const LITERAL    = lazy(():Parser<ValType>=>alt(TRUE, FALSE, NULL, TAG, NUMERIC, FN, ARRAY, STRING_VAL));

export type OPERATION_TYPE = { lhs?:OprType,op:OperandType,rhs:OprType } | { lhs:OprType,op:'if',rhs:[OprType,OprType] };
export type OprType = OPERATION_TYPE | ValType;
const mapExpressions = (str:OprType,data:[op:OperandType,rhs:OprType][]):OprType=>{
    if(data.length===0) return str;
    let res:OprType = str;
    for(const [op,value] of data){
        const obj:OprType = { lhs:res,op,rhs:value };
        res = obj;
    }
    return res;
};
const mapTernary = (lhs:OprType,data:[OprType,OprType][]):OprType=>{
    if(data.length===0) return lhs;
    let res:OprType = lhs;
    for(const rhs of data){
        const obj:OprType = { lhs,op:'if',rhs };
        res = obj;
    }
    return res;
};

export const EXPRESSION     = lazy(():Parser<OprType>=>TERNARY);

export const PRIMARY        = lazy(():Parser<OprType>=>LPAREN.then(EXPRESSION).skip(RPAREN)
                                    .or(MINUS.then(PRIMARY).map(rhs=>({ op:'-',rhs } as OprType)))
                                    .or(  NOT.then(PRIMARY).map(rhs=>({ op:'!',rhs } as OprType)))
                                    .or(LITERAL) );
export const MULTIPLICATIVE = lazy(():Parser<OprType>=>seqMap(PRIMARY,         seq(MULTIPLY.or(DIVIDE), PRIMARY).many(),   mapExpressions));
export const ADDITIVE       = lazy(():Parser<OprType>=>seqMap(MULTIPLICATIVE,  seq(PLUS.or(MINUS), MULTIPLICATIVE).many(), mapExpressions));
export const EQUALITY       = lazy(():Parser<OprType>=>seqMap(ADDITIVE,        seq(EQUAL.or(DIFFERENT), ADDITIVE).many(),  mapExpressions));
export const COMPARATIVE    = lazy(():Parser<OprType>=>seqMap(EQUALITY,        seq(COMPARE, EQUALITY).many(),              mapExpressions));
export const LOGICAL        = lazy(():Parser<OprType>=>seqMap(COMPARATIVE,     seq(LOGIC, COMPARATIVE).many(),             mapExpressions));
export const TERNARY        = lazy(():Parser<OprType>=>seqMap(LOGICAL,         seq(INTERROG.then(EXPRESSION), COLON.then(EXPRESSION)).many(),mapTernary));

export const parseExpression = (data:string)=>EXPRESSION.tryParse(data);
