import type { App, Vault } from "obsidian";
import type NovaNotePlugin from "./main";
import ResourceController from "./controllers/ResourceController";
import TypeController from "./controllers/TypeController";
import FileController from "./controllers/FileController";
import DataController from "./controllers/DataController";
import LoaderController from "./controllers/LoaderController";

export type SettingOpts = {
    enableResources?: boolean;
    handleNovaBlocks?: boolean;
}

export default class Nova {

    plugin:     NovaNotePlugin;
    settings:   SettingOpts;
    app:        App;
    vault:      Vault;

    resources:  ResourceController;
    types:      TypeController;
    files:      FileController;
    data:       DataController;
    loader:     LoaderController;

    constructor(plugin:NovaNotePlugin,settings:SettingOpts){
        this.plugin     = plugin;
        this.app        = plugin.app;
        this.vault      = plugin.app.vault;
        this.settings   = settings;
        this.resources  = new ResourceController(this);
        this.types      = new TypeController(this);
        this.files      = new FileController(this);
        this.data       = new DataController(this);
        this.loader     = new LoaderController(this);
    }

}
