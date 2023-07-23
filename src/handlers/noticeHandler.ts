import { Notice } from "obsidian";

export function errorNotice(err:Error,message?:string){
    console.error(err);
    return new Notice((message??'') + err.message,5000);
}

export function errorNoticeMessage(message:string){
    console.error(message);
    return new Notice(message,5000);
}
