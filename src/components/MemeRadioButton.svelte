<script lang="ts">
	import type { Maybe, Meme } from "../types";
	import { generateGradient } from "../ui-gradients";

	export let meme: Meme;
	export let selectedMeme: Maybe<Meme> = undefined;
	export let name = "";

	let previewElement: Maybe<HTMLAudioElement>;
	let mainElement: Maybe<HTMLLabelElement>;
	let playing = false;
	let isSelected = false;
	let updatedRecently = false;

	generateGradient("90deg").then( (gradient) => {
		mainElement.setAttribute("style", `background: ${gradient}`);
	});

	function update(): void {
		// This function inexplicably gets called twice for the component that
		// was selected. I am tired of working on this component, so instead of
		// fixing the problem, I've just bandaged it by not letting this
		// function run twice in quick succession.
		if (updatedRecently) return;
		updatedRecently = true;
		setTimeout( () => updatedRecently = false, 10);

		isSelected = meme.id === selectedMeme.id;

		// Play/pause selected meme;
		// stop any not-selected memes that are currently playing.
		if (previewElement && !previewElement.paused) {
			previewElement.pause();
			previewElement.currentTime = 0;
		} else if (isSelected) {
			previewElement?.play();
		}
	}
	
	// Call update() when selectedMeme changes because of this component OR
	// because a different instance of this component bound to the same value
	// has changed it. Assigning update() to a click handler in the component's
	// HTML will make it miss the events where it's been deselected.
	// The component needs to know both when it's been selected and deselected
	// to keep its CSS "selected" effect up to date and to stop its preview when
	// it's been deselected.
	$: _ = selectedMeme && update();
</script>



<label class="meme-radio-button"
	   class:selected={isSelected}
	   bind:this={mainElement}
	   on:click|preventDefault={ () => selectedMeme = meme }
>
	<input type="radio"
		   value={meme.id}
		   name={name}
	/>
	<!-- svelte-ignore a11y-media-has-caption -->
	<audio src="https://songs.wombo.ai/{meme.id}.mp3"
		   preload="none"
		   bind:this={previewElement}
		   on:play={ () => playing = true }
		   on:pause={ () => playing = false }
	/>
	<!-- !previewElement.paused doesn't work here 🤷‍♂️ -->
	<button class:playing />
	<div>
		<p class="name">{meme.name}</p>
		<p class="artist">{meme.artist}</p>
	</div>

	{#if meme.combo}
		<span class="combo">Combo</span>
	{/if}
</label>



<style>
	label {
		position: relative;
		width: 38rem;
		max-width: 100%;
		background-color: green;
		border-radius: 40px;
		border: 3px solid black;
		cursor: pointer;
		color: white;
		margin-bottom: 1rem;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		filter: saturate(75%);

		display: flex;
		align-items: center;
		transition: all 125ms;
	}

	label.selected {
		border-color: white;
	}

	label:hover, label.selected {
		filter: saturate(200%);
	}

	label:active {
		border-color: #ffffff8f;
	}

	input {
		display: none;
	}

	div {
		width: 100%;
		margin-right: 5rem;
	}

	p {
		text-align: center;
		cursor: text;
	}

	.name {
		font-family: "Yeyey", sans-serif;
		text-transform: uppercase;
		text-shadow: 0 2px 1px black;
		margin-bottom: 0.5rem;
	}

	.artist {
		font-size: 1rem;
		margin-top: 0;
	}

	.combo {
		position: absolute;
		bottom: 0.8rem;
		right: 1.4rem;

		text-transform: uppercase;
		letter-spacing: 0.075rem;
		background-color: #00000047;
		border-radius: 500px;
		padding: 0.25rem 0.45rem;
		font-size: 7.5pt;

		display: flex;
		align-items: center;
	}

	.combo::before {
		content: "";
		background-image: url("../img/microphones.png");
		background-size: 100%;
		background-repeat: no-repeat;
		display: inline-block;
		width: 10px;
		height: 14px;
		margin-right: 0.5em;
	}

	button {
		width: 5rem;
		height: 4rem;
		background-image: url("../img/play.svg");
		background-size: 100%;
		background-repeat: no-repeat;
		background-position: center;
		background-color: transparent;
		border: none;
		margin-left: 1rem;
		margin-bottom: 0;
		filter: opacity(50%);
		cursor: pointer;
		border-radius: 100%;
		transition: all 125ms;
	}

	button:not(.playing) {
		background-position-x: 2px;  /* Another off-center SVG */
	}

	button.playing {
		background-image: url("../img/pause.svg");
		filter: invert(100%);
	}

	button:active {
		filter: opacity(100%);
		background-color: #00000065;
	}
</style>
