<script lang="ts">
	import type NovaView from "src/blocks/NovaView";

    export let view:NovaView;
    const data = view.data;
</script>

<div class="nova-boards">
{#each $data as elm}
    <div class="elm">
        BOARD
    </div>
{/each}
</div>