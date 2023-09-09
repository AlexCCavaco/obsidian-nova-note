import type Nova from "src/Nova";
import NovaModal from "./NovaModal";
import type ResourceItem from "src/resources/ResourceItem";

export default class extends NovaModal<ResourceItem> {

    constructor(nova:Nova,cb:(data:ResourceItem)=>void){
        super(nova,cb);
    }

}
