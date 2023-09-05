import type Nova from "src/Nova";
import Resource from "./Resource";
import ResourceColString from "./ResourceColString";

export default class extends Resource {

    constructor(nova:Nova){
        super(nova,'task', null, {
            'status':   new ResourceColString('status',"Status",'text',{ input:true,multi:false,required:false }),
            'title':    new ResourceColString('title',"Title",'text',{ input:true,multi:false,required:true }),
            'start':    new ResourceColString('start',"Start",'date',{ input:true,multi:false,required:false }),
            'done':     new ResourceColString('done',"Done",'check',{ input:true,multi:false,required:false }),
            'due':      new ResourceColString('due',"Due",'date',{ input:true,multi:false,required:false }),
            'tags':     new ResourceColString('tags',"Tags",'text',{ input:true,multi:true,required:false })
        });
    }

}
