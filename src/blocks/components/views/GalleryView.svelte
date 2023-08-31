<script lang="ts">
	import { MarkdownRenderer } from "obsidian";
	import type { ViewData, ViewDataElm } from "src/blocks/NovaView";
	import type NovaView from "src/blocks/NovaView";
	import { makeIcon, makeImage } from "src/blocks/interface";
	import { openFileFromEvent } from "../../../handlers/FileHandler";
	import { writable, type Writable } from "svelte/store";

    type GalleryOpts = {
        cover: string,
        title: string,
        icon:  string
    };
    const defaultOpts:GalleryOpts = { cover: '', title: '', icon: '' };

    export let view:NovaView;

    const openElm = (elm:ViewDataElm<GalleryOpts>)=>(ev:MouseEvent)=>{ if(ev.button>1) return; ev.preventDefault(); openFileFromEvent(view.block.nova,ev,elm.block.file) };

    const data:Writable<ViewData<GalleryOpts>> = writable([]);
    view.data.subscribe(nData=>{ data.set(nData.map((iData)=>({ ...iData,opts:{...defaultOpts,...iData.opts} }))); });
</script>

<div class="nova-gallery">
{#each $data as elm}
    <a class="elm" href="{elm.link}" on:mouseup={openElm(elm)}>
        <div class="cover">{#if elm.opts.cover}{#await makeImage(elm.opts.title,elm.opts.cover,elm.block,view.file) then icon}{@html icon.outerHTML}{/await}{/if}</div>
        <div class="details">
            <div class="main">
                {#if elm.opts.cover}<div class="icon">{#await makeIcon(elm.opts.cover,elm.block,view.file) then icon}{@html icon.outerHTML}{/await}</div>{/if}
                <div class="title">{elm.opts.title}</div>
            </div>
            {#each Object.keys(elm.data) as key}<div class="info">{elm.data[key].value}</div>{/each}
        </div>
    </a>
{/each}
</div>

<style>
    .nova-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(10rem, 100%), 1fr));
        align-items: center;
        gap: 15px;
        margin: 15px 0;

        & > .elm {
            display: block;
            border-radius: 5px;
            border: 2px solid var(--ui1);
            background-color: var(--bg2);
            break-inside: avoid-column;
            page-break-inside: avoid;
            color: var(--color);
            text-decoration: none;
            overflow: hidden;
            transition: border-color .3s, scale .3s;

            &:hover {
                border-color: var(--ui3);
                scale: 1.05;
            }

            & > .cover {
                width: 100%;
                aspect-ratio: 12/8;
                background-color: var(--bg3);
                position: relative;

                & svg{
                    position: absolute;
                    width: 70%;
                    top: 0;
                    bottom: 0;
                    right: 0;
                    left: 0;
                    margin: auto;
                    height: 70%;
                    max-width: 90%;
                    max-height: 90%;
                    stroke: currentColor;
                }
            }
            & > .details {
                padding: 10px 15px;

                & > .main {
                    display: flex;
                    flex-direction: row;
                    font-weight: bold;
                    align-items: center;
                    column-gap: 10px;

                    & .icon {
                        flex: 0 0 20px;
                        height: 20px;

                        & svg {
                            width: 20px;
                            height: 20px;
                        }
                    }
                }
            }
        }
    }
</style>