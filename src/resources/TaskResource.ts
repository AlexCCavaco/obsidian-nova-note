import Resource from "./Resource";

export default class extends Resource {

    constructor(){
        super('Task', undefined, {
            cols:{
                'status': { label:"Status",type:"text",input:true,multi:false,required:false },
                'title': { label:"Title",type:"text",input:true,multi:false,required:true },
                'start': { label:"Start",type:"date",input:true,multi:false,required:false },
                'done': { label:"Done",type:"check",input:true,multi:false,required:false },
                'due': { label:"Due",type:"date",input:true,multi:false,required:false },
                'tags': { label:"Tags",type:"text",input:true,multi:true,required:false }
            }
        });
    }

}
