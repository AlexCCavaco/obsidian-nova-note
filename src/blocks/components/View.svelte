<script lang="ts">
	import type NovaView from "../NovaView";
	import { BoardsView, GalleryView,TableView,ListView,TimelineView,CalendarView } from "./views";

    export let view:NovaView;
</script>

{#if view.type === 'boards'} <BoardsView />
{:else if view.type === 'gallery'} <GalleryView />
{:else if view.type === 'list'} <ListView />
{:else if view.type === 'table'} <TableView />
{:else if view.type === 'timeline'} <TimelineView />
{:else if view.type === 'calendar'} <CalendarView />
{/if}
