<script lang="ts">
    export let value:string;
    export let onRemove:()=>void;
</script>

<div class="data-value">
    <span>{value}</span>
    <button class="close" on:click={onRemove}>X</button>
</div>

<style>
    .data-value {
        display: inline-block;
        margin-right: 7px;
        margin-bottom: 7px;
        border-radius: 5px;
        background-color: var(--interactive-normal);
        padding: 3px 10px;

        & > .close {
            color: rgb(194, 35, 35);
            margin-left: 5px;
            height: 20px;
            width: 20px;
            padding: 0;
            transition: background-color .3s, color .3s;

            &:hover{
                background-color: rgb(194, 35, 35);
                cursor: pointer;
                color: #fafafa;
            }
        }
    }
</style>