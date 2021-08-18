<script lang="ts">
	import type { Maybe, Meme } from "../../types";

	import { createEventDispatcher } from "svelte";
	import PageTemplate from "./PageTemplate.svelte";
	import NextButton from "../NextButton.svelte";
	import BackButton from "../BackButton.svelte";
	import MemeRadioButton from "../MemeRadioButton.svelte";

	export let memesLoaded: Promise<Meme[]> = undefined;

	let meme: Maybe<Meme>;

	const dispatch = createEventDispatcher();
</script>



<PageTemplate>
	{#await memesLoaded}
		<p class="progress">Loading memes...</p>
	{:then memes}
		<div>
			{#each memes as item}
				<MemeRadioButton name="meme"
								 meme={item}
								 bind:selectedMeme={meme} />
			{/each}
		</div>
	{/await}

	{#if meme}
		<NextButton on:click={ () => dispatch("submit", meme) }>
			Choose Meme
		</NextButton>
	{/if}

	<BackButton icon="undo" on:click={ () => dispatch("back") }>
		Choose new image
	</BackButton>
</PageTemplate>



<style>
	.progress {
		font-family: "Yeyey", sans-serif;
		color: var(--green-2);
		font-size: 24pt;
	}
</style>
