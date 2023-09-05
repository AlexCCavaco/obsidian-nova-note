import type Nova from "src/Nova";
import Resource from "./Resource";
import ResourceColString from "./ResourceColString";

export default class extends Resource {

    constructor(nova:Nova){
        super(nova,'task', null, {
            'status':   ResourceColString.makeRaw('status',"Status",'text',{ input:true,multi:false,required:false }),
            'title':    ResourceColString.makeRaw('title',"Title",'text',{ input:true,multi:false,required:true }),
            'start':    ResourceColString.makeRaw('start',"Start",'date',{ input:true,multi:false,required:false }),
            'done':     ResourceColString.makeRaw('done',"Done",'check',{ input:true,multi:false,required:false }),
            'due':      ResourceColString.makeRaw('due',"Due",'date',{ input:true,multi:false,required:false }),
            'tags':     ResourceColString.makeRaw('tags',"Tags",'text',{ input:true,multi:true,required:false })
        });
    }

}
