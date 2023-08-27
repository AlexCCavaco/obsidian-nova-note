import type { TFile } from "obsidian";
import FileData from "src/data/FileData";
import type NovaNotePlugin from "src/main";

export function FileDataElmFromFileData(fileData:FileData,data:FileDataElm['data']){
    return new this(fileData.nova,fileData.file,data);
}

export default class FileDataElm extends FileData {

    data        : {[key:string]:unknown};

    constructor(nova:NovaNotePlugin,file:TFile,data?:FileDataElm['data']){
        super(nova,file);
        this.setData(data??{});
    }

    static fromFileData(fileData:FileData,data:FileDataElm['data']){
        return new this(fileData.nova,fileData.file,data);
    }

    setData(data:FileDataElm['data']){
        this.data = data;
    }

    getData(){
        return this.data;
    }

    getValue(key:string){
        return this.data[key] ?? null;
    }

    setValue(key:string,value:unknown){
        if(value===undefined) return null;
        this.data[key] = value;
    }

}
