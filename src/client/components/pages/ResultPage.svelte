<script lang="ts">
	import type { Maybe, Meme } from "../../types";

	import { createEventDispatcher } from "svelte";

	import PageTemplate from "./PageTemplate.svelte";
	import NextButton from "../NextButton.svelte";
	import BackButton from "../BackButton.svelte";

	export let meme: Meme;
	export let videoURL: Maybe<string> = "";
	export let error: Maybe<Error> = undefined;

	const dispatch = createEventDispatcher();
</script>



<PageTemplate center>
	{#if videoURL}
		<!-- svelte-ignore a11y-media-has-caption -->
		<video src={videoURL} controls autoplay loop />
	{:else}
		<span>{error?.message}</span>
	{/if}

	<p class="song-name">{meme.artist} - {meme.name}</p>

	<NextButton href={videoURL} target="_blank">
		Save
	</NextButton>

	<BackButton icon="home" on:click={ () => dispatch("back") }>
		Back to Memes
	</BackButton>
</PageTemplate>



<style>
	.song-name {
		font-weight: bold;
		font-size: 3.5vh;
		text-align: center;
	}

	video {
		width: calc(100vh - 4rem);
		height: calc(100vh - 4rem);
		max-width: 90vw;
		transition: width 500ms, height 500ms;
		border-radius: 50px;
	}

	@media only screen and (min-height: 600px) {
		video {
			width: 72vh;
			height: 72vh;
		}
	}
</style>
