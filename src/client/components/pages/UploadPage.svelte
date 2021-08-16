<script lang="ts">
    import type { Maybe } from "../../types";

    import { createEventDispatcher } from "svelte";
    import PageTemplate from "./PageTemplate.svelte";
    import DropArea from "../DropArea.svelte";
    import NextButton from "../NextButton.svelte";

    let image: Maybe<File>;

    const dispatch = createEventDispatcher();
</script>



<PageTemplate center>
    <DropArea bind:file={image} />

    {#if image}
        <NextButton on:click={ () => dispatch("submit", image) }>
            Submit Face
        </NextButton>
    {/if}
</PageTemplate>
