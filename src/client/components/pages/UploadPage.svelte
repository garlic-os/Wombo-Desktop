<script lang="ts">
    import type { Maybe } from "../../types";

    import { createEventDispatcher } from "svelte";
    import PageTemplate from "./PageTemplate.svelte";
    import DropArea from "../DropArea.svelte";
    import NextButton from "../NextButton.svelte";

    let images: Maybe<File>[] = [];

    const dispatch = createEventDispatcher();
</script>



<PageTemplate center>
    <div>
        <DropArea bind:file={images[0]} />
        <DropArea bind:file={images[1]} disabled={!images[0]} />
    </div>

    {#if images[0]}
        <NextButton on:click={ () => dispatch("submit", images) }>
            Submit Face
        </NextButton>
    {/if}
</PageTemplate>



<style>
    div {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-grow: 1;
        gap: 2rem;

        width: 100vw;
        padding: 0 4rem;
    }
</style>