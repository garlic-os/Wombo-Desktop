<script lang="ts">
	import type { Meme, Maybe } from "../types";

	import { onMount } from "svelte";
	import { generateMeme } from "../client";
	import convert2jpg from "../convert2jpg";

	import { fade } from "svelte/transition";
	import VirtualScroll from "svelte-scroll-infinite-list";
	import DropArea from "./DropArea.svelte";
	import ErrorBanner from "./ErrorBanner.svelte";
	import MemeRadioButton from "./MemeRadioButton.svelte";
	import NextButton from "./NextButton.svelte";
	import BackButton from "./BackButton.svelte";


	// Show errors in an error banner
	onMount( () => {
		window.addEventListener("error", (event: ErrorEvent): void => {
			console.error(event.error);
			new ErrorBanner({
				target: mainElement,
				props: { text: event.message },
			});
		});
	});

	const defaultProgressMessage = "Warming up...";

	let mainElement: HTMLDivElement;
	let image: Maybe<File>;
	let page = "upload";
	let selectedMeme: Maybe<Meme>;
	let progressMessage = defaultProgressMessage;
	let videoURL: Maybe<string>;
	let error: Maybe<Error>;

	const fadeParams = { duration: 250 };

	// Load memes.json
	const memesLoaded = fetch("../fewer-memes.json")
		.then(response => response.json() as Promise<Meme[]> );


	async function submit() {
		// Wombo only accepts JPGs. If the provided image is not a JPG, it must
		// be converted before it can be sent to Wombo.
		if (image.type !== "image/jpeg") {
			progressMessage = "Converting image...";
			image = await convert2jpg(image);
		}

		// Send the request to Wombo and go to the processing page.
		// generateMeme()'s callback will update the progress message in real
		// time.
		const videoURLPromise = generateMeme(image, selectedMeme?.id, (msg) => {
			progressMessage = msg;
		});
		page = "generating";

		// Wait until the video is finished generating (or something goes wrong)
		// and then advance to the page that shows the video to the user.
		try {
			videoURL = await videoURLPromise;
		} catch (err) {
			error = err;
		}
		page = "result";

		// Reset the progress message for next time.
		progressMessage = defaultProgressMessage;
	}
</script>



<main bind:this={mainElement}>
	<header class="logo">Wombon't</header>

	{#if page == "upload"}
	<section transition:fade={fadeParams}>
		<DropArea bind:file={image} />

		{#if image}
			<NextButton on:click={ () => page = "select-meme" }>
				Submit Face
			</NextButton>
		{/if}
	</section>

	{:else if page == "select-meme"}
	<section transition:fade={fadeParams}>
		{#await memesLoaded}
			<p>Loading memes...</p>
		{:then memes}
			<div style="width: unset">
				<VirtualScroll data={memes}
							   rowHeight={200}
							   visibleRows={15}
							   let:item>
					<MemeRadioButton name="meme"
						             meme={item}
						             bind:selectedMeme />
				</VirtualScroll>
			</div>
		{/await}

		{#if selectedMeme}
			<NextButton on:click={submit}>
				Choose Meme
			</NextButton>
		{/if}

		<BackButton icon="undo" on:click={ () => page = "upload" }>
			Retake Photo
		</BackButton>
	</section>

	{:else if page == "generating"}
	<section transition:fade={fadeParams}>
		<p>{progressMessage}</p>

		<BackButton icon="x" on:click={ () => page = "select-meme" }>
			Cancel Wombo
		</BackButton>
	</section>

	{:else if page == "result"}
	<section transition:fade={fadeParams}>
		{#if videoURL}
			<!-- svelte-ignore a11y-media-has-caption -->
			<video src={videoURL} controls />
		{:else}
			<span>{error?.message}</span>
		{/if}

		<p></p>

		<NextButton on:click={submit}>
			Save
		</NextButton>

		<BackButton icon="home" on:click={ () => page = "select-meme" }>
			Back to Memes
		</BackButton>
	</section>
	{/if}
</main>



<style>
	section {
		position: absolute;
		left: 0; top: 0;
		padding-top: 6rem;
		width: 100%;
		height: 100%;
		transition: padding ease-out 500ms;
		overflow: hidden auto;

		display: flex;
		align-items: center;
		flex-direction: column;
	}

	@media only screen and (min-width: 800px) {
		section {
			padding-left: 25%;
			padding-right: 25%;
		}
	}

	header {
		position: fixed;
		left: 0; top: 0;
		background-color: black;
		height: 4rem;
		width: 100vw;
		padding: 1rem 2rem;
		text-align: center;
		z-index: 1;
	}

	.logo {
		display: inline-block;
		font-family: "Yeyey", sans-serif;
		font-size: 1.5rem;
		color: white;
		-webkit-text-stroke: var(--red) 1px;
		text-shadow: 2px 2px 0px var(--red),
			         4px 4px 0px var(--orange),
			         6px 6px 0px var(--yellow),
			         8px 8px 0px var(--green),
					 10px 10px 0px var(--blue);
	}

	video {
		height: calc(100vh - 4rem);
		max-width: 100vw;
		transition: width 500ms, height 500ms;
		border-radius: 30px;
	}

	@media only screen and (min-height: 600px) {
		video {
			height: 80%;
		}
	}
</style>
