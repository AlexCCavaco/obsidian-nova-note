import type Expression from "src/data/Expression";

export type DISPLAY_TYPE = 'tasks' | 'data';
export const displayData = ['tasks','data'];
export function isDisplay(data:string): data is DISPLAY_TYPE { return displayData.includes(data.toLowerCase()); }

export type FROM_TYPE = { type:'tag'|'resource'|'local'|'path',value:string } | { type:'all',value?:null };
export function formatFrom(data:string):FROM_TYPE{
    const fChar = data[0]??'';
    switch(fChar){
        case '#': return { type:'tag',value:data.substring(1) };
        case '@': return { type:'resource',value:data.substring(1) };
        case '*': return { type:'all' };
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

export type BlockType = { block:string } & (
    ( { block:'column' } & ({ type:'start'|'break',width:number } | { type:'end' }) ) |
    { block:'display',type?:'tasks'|'data',clauses:DisplayClauseType[] } );

export type DisplayClauseType =
    { clause:'from',source:FROM_TYPE } |
    { clause:'on',on:Expression } |
    { clause:'focus',focus:string } |
    { clause:'view',type:VIEW_TYPE,id:string,label:string,clauses:ViewClauseType[] };

export type ViewClauseType =
    { clause:'order',order:{ key:string,desc?:boolean }[] } |
    { clause:'group',group:string[] } |
    { clause:'alter',alter:{ lhs:string,rhs:Expression }[] } |
    { clause:'shows',shows:{ key:Expression,label?:string }[] } |
    { clause:'where',where:Expression };
