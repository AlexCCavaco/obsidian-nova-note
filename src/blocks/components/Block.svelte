<script lang="ts">
	import NovaBlock from "../NovaBlock";
	import View from "./View.svelte";

    export let block:NovaBlock;
    //
</script>

<div class="nova-block-header">
    {#each block.views as view}
        view.label
    {/each}
</div>
<div class="nova-block-body">
    {#each block.views as view}
        <View {view} />
    {/each}
</div>
