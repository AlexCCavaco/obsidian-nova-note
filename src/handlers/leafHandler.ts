import type { TFile } from "obsidian";
import type NovaNotePlugin from "src/main";

export function openFileFromEvent(nova:NovaNotePlugin,ev:MouseEvent,file:TFile){
    // ONLY ALLOW LEFT AND MIDDLE CLICK
    if(ev.button>1) return;

    const workspace = nova.app.workspace;
    const button = ev.button;
    const ctrl = ev.ctrlKey;
    const alt = ev.altKey;

    if(alt){
        // ALT & LEFT CLICK => New Popup File
        if(button===0) workspace.openPopoutLeaf().openFile(file);
        // ALT & MIDDLE CLICK => Split Horizontally
        else workspace.getLeaf('split','horizontal').openFile(file);
        return;
    }
    if(ctrl){
        // CTRL & LEFT CLICK => Open in New Tab
        if(button===0) workspace.openLinkText(file.path,file.path,true);
        // CTRL & MIDDLE CLICK => Split Vertically
        else workspace.getLeaf('split','vertical').openFile(file);
        return;
    }
    // LEFT CLICK => Open on Focused
    if(button===0) workspace.getLeaf().openFile(file);
    // MIDDLE CLICK => Open in New Tab
    else workspace.openLinkText(file.path,file.path,true);
    return;
}
