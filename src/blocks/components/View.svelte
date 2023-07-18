<script lang="ts">
	import type NovaView from "../NovaView";
	import { BoardsView, GalleryView,TableView,ListView,TimelineView,CalendarView } from "./views";

    export let view:NovaView;
</script>

{#if view.type === 'boards'} <BoardsView {view} />
{:else if view.type === 'gallery'} <GalleryView {view} />
{:else if view.type === 'list'} <ListView {view} />
{:else if view.type === 'table'} <TableView {view} />
{:else if view.type === 'timeline'} <TimelineView {view} />
{:else if view.type === 'calendar'} <CalendarView {view} />
{/if}
