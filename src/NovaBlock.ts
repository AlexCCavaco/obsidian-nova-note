import type { DISPLAY_TYPES } from "./parser/definitions";

export default class {

    display: DISPLAY_TYPES;

    constructor(){
        this.display = 'data';
    }

    setDisplay(data?:DISPLAY_TYPES){
        this.display = data ?? 'data';
    }

}
