import Resource from "./Resource";

export default class extends Resource {

    constructor(){
        super('Task', {
            'status': { label:"Status",type:"status",input:true,multi:false },
            'title': { label:"Title",type:"string",input:true,multi:false },
            'start': { label:"Start",type:"date",input:true,multi:false },
            'due': { label:"Due",type:"date",input:true,multi:false },
            'tags': { label:"Tags",type:"text",input:true,multi:true }
        });
    }

}
