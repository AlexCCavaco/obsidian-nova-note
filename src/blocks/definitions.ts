import type { OPR_TYPE } from "src/parser/keys";

export type DISPLAY_TYPE = 'tasks' | 'data';
export const displayData = ['tasks','data'];
export function isDisplay(data:string): data is DISPLAY_TYPE { return displayData.includes(data.toLowerCase()); }

export type FROM_TYPE = { type:'tag'|'resource'|'all'|'local'|'path', value:string|null };
export function formatFrom(data:string):FROM_TYPE{
    const fChar = data[0]??'';
    switch(fChar){
        case '#': return { type:'tag',value:data.substring(1) };
        case '@': return { type:'resource',value:data.substring(1) };
        case '*': return { type:'all',value:null };
        case '^': return { type:'local',value:data.substring(1) };
        default: return { type:'path',value:data };
    }
}

export type VIEW_TYPE = 'boards'|'gallery'|'list'|'table'|'timeline'|'calendar';
export function formatView(data:string):VIEW_TYPE{
    data = data.toLocaleLowerCase();
    switch(data){
        case 'table': case 'list': case 'gallery': case 'boards':
            case 'timeline': case 'calendar': return data;
        default: return 'list';
    }
}

export type BLOCK_TYPE = { block:string } & (
    ( { block:'column' } & ({ type:'start'|'break',width:number } | { type:'end' }) ) |
    { block:'display',type?:'tasks'|'data',clauses:DISPLAY_CLAUSE_TYPE[] } );

export type DISPLAY_CLAUSE_TYPE =
    { clause:'from',source:FROM_TYPE['type'],value:FROM_TYPE['value'] } |
    { clause:'on',on:OPR_TYPE } |
    { clause:'focus',focus:string } |
    { clause:'view',type:VIEW_TYPE,id:string,label:string,clauses:VIEW_CLAUSE_TYPE[] };

export type VIEW_CLAUSE_TYPE =
    { clause:'order',order:{ key:string,desc?:boolean }[] } |
    { clause:'group',group:string[] } |
    { clause:'alter',alter:{ lhs:string,rhs:string }[] } |
    { clause:'shows',shows:{ key:string,label?:string }[] } |
    { clause:'where',where:OPR_TYPE };
