import type { TFile } from "obsidian";

export default class {

    name: string;
    cols: { [key:string]:unknown };
    file: TFile;

    constructor(name:string,cols:{ [key:string]:unknown },file:TFile){
        this.name = name;
        this.cols = cols;
        this.file = file;
    }

    update(cols:{ [key:string]:unknown }) {
        this.cols = cols;
    }

}
