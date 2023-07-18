<script lang="ts">
	import NovaBlock from "../NovaBlock";
	import View from "./View.svelte";
	import * as icon from "../icons";
	import type NovaView from "../NovaView";

    export let block:NovaBlock;
    const icons = {
        'boards':   icon.Boards,
        'gallery':  icon.Gallery,
        'list':     icon.List,
        'table':    icon.Table,
        'timeline': icon.Timeline,
        'calendar': icon.Calendar
    };
    const focus = block.focus;
    const open = (view:NovaView)=>()=>{block.setFocus(view.id)};
</script>

<div class="nova-block-header">
    <div class="nova-tabs">
        {#each block.views as view}
            <button class="nova-tab" class:selected={$focus===view.id} on:click={open(view)}>
                <span class="icon"><svelte:component this={icons[view.type]}/></span>
                <span class="label">{view.label}</span>
            </button>
        {/each}
    </div>
</div>
<div class="nova-block-body">
    {#each block.views as view}
        <div class="nova-view" class:selected={$focus===view.id}>
            <View {view} />
        </div>
    {/each}
</div>

<style>
    .nova-block-header > .nova-tabs {
        display: flex;
        flex-direction: row;
        border-bottom: 2px solid var(--ui1);
        align-items: center;
    }
    .nova-block-header > .nova-tabs > .nova-tab {
        height: 40px;
        padding: 0 10px;
        display: flex;
        flex-direction: row;
        align-items: center;
        column-gap: 5px;
        background-color: transparent;
        border-radius: 0;
        border: none;
        box-shadow: none;
        border-bottom: 2px solid var(--ui1);
        margin-bottom: -2px;

        &.selected {
            border-color: var(--ui3);
        }
        &:hover {
            background-color: var(--bg2);
            cursor: pointer;
        }
        & > .icon {
            height: 18px;

            & > svg {
                height: 100%;
            }
        }
    }
    .nova-block-body > .nova-view {
        display: none;

        &.selected {
            display: block;
        }
    }
</style>
