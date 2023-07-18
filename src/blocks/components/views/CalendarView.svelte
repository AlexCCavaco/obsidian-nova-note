<script lang="ts">
	import type NovaView from "src/blocks/NovaView";

    export let view:NovaView;
    const data = view.data;
</script>

<div class="nova-calendar">
{#each $data as elm}
    <div class="elm">
        CALENDAR
    </div>
{/each}
</div>