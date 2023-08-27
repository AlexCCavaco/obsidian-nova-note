import type TypeDataElm from "./TypeDataElm";

export default class TypeData {

    name: string;
    data: {[key:string]:TypeDataElm};

    constructor(name:string,elms?:TypeData['data']){
        this.name = name;
        this.data = elms??{};
    }

    addElm(elm:TypeDataElm){
        this.data[elm.name] = elm;
    }

    get(value:string){
        return this.data[value]??null;
    }

    list(){
        return Object.values(this.data);
    }

}
