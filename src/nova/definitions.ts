
export type DISPLAY_TYPE = 'tasks' | 'data';
export const displayData = ['tasks','data'];
export function isDisplay(data:string): data is DISPLAY_TYPE { return displayData.includes(data.toLowerCase()); }

export type FROM_TYPE = { type: 'tag'|'resource'|'all'|'local'|'path', value:unknown };
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
