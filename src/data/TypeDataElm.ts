
export default class TypeDataElm {

    name: string;
    label: string;
    props: {[key:string]:unknown};

    constructor(name:string,label:string,props:TypeDataElm['props']){
        this.name = name;
        this.label = label;
        this.props = props;
    }

}
