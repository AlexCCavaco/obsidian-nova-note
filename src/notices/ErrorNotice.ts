import { Notice } from "obsidian";

export default class ErrorNotice extends Notice {

    constructor(message:string){
        console.error(message);
        super(message,5000);
    }

    static error(err:Error,message?:string){
        return new ErrorNotice((message??'') + err.message);
    }

}
