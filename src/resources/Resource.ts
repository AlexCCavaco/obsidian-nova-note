import type { TFile } from "obsidian";
import type { RESOURCE_TYPE } from "./parser";

export default class {

    name : string;
    cols : RESOURCE_TYPE;
    file?: TFile;

    constructor(name:string,cols:RESOURCE_TYPE,file?:TFile){
        this.name = name;
        this.cols = cols;
        this.file = file;
    }

    update(cols:RESOURCE_TYPE) {
        this.cols = cols;
    }

}
