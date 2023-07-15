import { string, optWhitespace, regex, alt, Parser, seq, seqMap } from "parsimmon";

export type VAL_TYPE =
    { type:'array',value:Array<unknown> } |
    { type:'fn',name:string,params:Array<unknown> } |
    { type:'string',value:string };

export const keyed = (parser:Parser<any>)=>parser.skip(optWhitespace);

export const literal    = ()=>alt(TRUE, FALSE, NUMBER, DECIMAL, WORD, fn(), array());
export const listed     = (parser:Parser<any>,seperator=',')=>parser.sepBy(string(seperator).skip(optWhitespace));

export const LPAREN     = keyed(string('('));
export const RPAREN     = keyed(string(')'));

export const LBRACK     = keyed(string('['));
export const RBRACK     = keyed(string(']'));

export const SQUOTE     = keyed(string('\''));
export const DQUOTE     = keyed(string('"'));

export const NUMBER     = keyed(regex(/\d+/));
export const DECIMAL    = keyed(regex(/\d+\.\d+/));

export const WORD       = keyed(regex(/\w+/));
export const UWORD      = keyed(regex(/\w+/u));
export const STRING     = regex(/"(.*?)"|'(.*?)'/).skip(optWhitespace).map((value):VAL_TYPE=>({ value,type:'string' }));
export const WORDQ      = WORD.or(STRING);

export const array      = ():Parser<VAL_TYPE>=>LBRACK.then(listed(literal())).skip(RBRACK).map((value)=>({ type:'array',value }));
export const fn         = ():Parser<VAL_TYPE>=>seqMap(WORD,LPAREN.then(listed(literal())).skip(RPAREN),(name,params)=>({ type:'fn',name,params }));

export const PLUS       = keyed(string('+'));
export const MINUS      = keyed(string('-'));
export const MULTIPLY   = keyed(string('*'));
export const DIVIDE     = keyed(string('/'));

export const EQUAL      = keyed(string('='));
export const DIFFERENT  = keyed(string('!='));

export const AND        = keyed(regex(/AND/i)).result('and');
export const OR         = keyed(regex(/OR/i)).result('false');
export const NEGATE     = keyed(regex(/NOT/i)).result('not');

export const TRUE       = keyed(regex(/TRUE/i)).result(true);
export const FALSE      = keyed(regex(/FALSE/i)).result(false);

export type OPR_TYPE = { lhs:unknown,op:string,rhs:unknown };
const mapExpressions = (lhs:unknown,op:string,rhs:unknown):OPR_TYPE=>({ lhs,op,rhs });

export function expression():Parser<OPR_TYPE>{ return expression.equality() }

expression.primary          = ():Parser<unknown>=>seq(LPAREN.then(expression()).skip(RPAREN)).or(literal())
                                    .or( MINUS.then(expression.primary()).map(expr=>({ expr,negative:true })))
                                    .or(NEGATE.then(expression.primary()).map(expr=>({ expr,negate:true })));
expression.multiplicative   = ():Parser<OPR_TYPE>=>seqMap(expression.primary(), MULTIPLY.or(DIVIDE), expression.primary(),mapExpressions);
expression.additive         = ():Parser<OPR_TYPE>=>seqMap(expression.multiplicative(), PLUS.or(MINUS), expression.multiplicative(),mapExpressions);
expression.equality         = ():Parser<OPR_TYPE>=>seqMap(expression.additive(), EQUAL.or(DIFFERENT), expression.additive(),mapExpressions);
