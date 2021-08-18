<script lang="ts">
	import type { Meme, Maybe, PageName } from "../types";

	import { onMount } from "svelte";
	import { generateMeme } from "../wombo";
	import ErrorBanner from "./ErrorBanner.svelte";

	import UploadPage from "./pages/UploadPage.svelte";
	import SelectMemePage from "./pages/SelectMemePage.svelte";
	import GeneratingPage from "./pages/GeneratingPage.svelte";
	import ResultPage from "./pages/ResultPage.svelte";

	// Show errors in an error banner
	onMount( () => {
		window.addEventListener("error", (event: ErrorEvent): void => {
			if (error.message === "ResizeObserver loop limit exceeded") {
				return;
			}
			console.error(event.error);
			new ErrorBanner({
				target: mainElement,
				props: { text: event.message },
			});
		});
	});

	let mainElement: HTMLDivElement;
	let images: Maybe<File>[];
	let page: PageName = "upload";
	let meme: Maybe<Meme>;
	let videoURL: Maybe<string>;
	let error: Maybe<Error>;

	const defaultProgressMessage = "Warming up...";
	let progressMessage = defaultProgressMessage;
	let progressLevel = 0;
	let maxProgress = 8;
	let canceled = false;
	$: progressPercent = 100 * progressLevel / maxProgress;


	// Load memes.json
	// ABSTRACTION LEAK: The memes list is stored outside of the component
	// it's used in to avoid making the component re-request the list every
	// time it's mounted.
	const memesLoaded = fetch("../memes.json")
		.then(response => response.json() as Promise<Meme[]> );


	async function submitWombo(): Promise<boolean> {
		canceled = false;
		maxProgress = 8;

		// Send the request to Wombo and go to the processing page.
		// generateMeme()'s callback will update the progress message in real
		// time.
		const videoURLPromise = generateMeme(meme, images, (msg) => {
			if (canceled) return;
			if (msg === "Converting images...") maxProgress = 9;
			if (msg !== "Pending...") ++progressLevel;
			progressMessage = msg;
		});
		++progressLevel;

		// Wait until the video is finished generating.
		try {
			videoURL = await videoURLPromise;
		} catch (err) {
			console.error(err);
			error = err;
		}
		if (!canceled) {
			progressLevel = maxProgress;
		}

		// Reset progress for next time.
		progressMessage = defaultProgressMessage;
		progressLevel = 0;

		return !canceled;
	}
</script>



<main bind:this={mainElement}>
	<span class="logo header">Wombon't</span>

	{#if page == "upload"}
		<UploadPage on:submit={ (event) => {
			        	images = event.detail;
			        	page = "select-meme";
			        }}
		/>

	{:else if page == "select-meme"}
		<SelectMemePage memesLoaded={memesLoaded}
			            on:back={ () => page = "upload" }
			            on:submit={ async (event) => {
			            	meme = event.detail;
			            	page = "generating";
			            	if (await submitWombo()) {
			            		page = "result";
			            	}
			            }}
		/>

	{:else if page == "generating"}
		<GeneratingPage progressMessage={progressMessage}
			            progressPercent={progressPercent}
			            on:back={ () => {
			            	page = "select-meme";
			            	canceled = true;
			            }}
		/>

	{:else if page == "result"}
		<ResultPage meme={meme}
			        videoURL={videoURL}
			        error={error}
			        on:back={ () => page = "select-meme" }
		/>

	{/if}
</main>



<style>
	.header {
		position: fixed;
		left: 0; top: 0;
		background-color: black;
		height: 4.75rem;
		padding: 1.5rem 2rem;
		text-align: center;
		z-index: 1;

		/* HACK: Keep the header out of the way of the scroll bar */
		width: calc(100vw - 17px); 
		padding-right: calc(2rem - 17px);
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
</style>
