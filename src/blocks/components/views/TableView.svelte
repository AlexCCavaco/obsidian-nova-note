<script lang="ts">
	import type NovaView from "src/blocks/NovaView";

    export let view:NovaView;
    const data = view.data;
</script>

<div class="nova-table">
{#each $data as elm}
    <div class="elm">
        TABLE
    </div>
{/each}
</div>