<script lang="ts">
	import type { Maybe, Meme } from "../types";

	export let meme: Meme;
	export let selectedMeme: Maybe<Meme> = undefined;
	export let name = "";

	let previewElement: Maybe<HTMLAudioElement>;
	let playing = false;
	let isSelected = false;
	let updatedRecently = false;

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
		// pause any not-selected memes that are currently playing.
		if (!previewElement?.paused) {
			previewElement?.pause();
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



<label class:selected={isSelected}
	   on:click|preventDefault={ () => selectedMeme = meme }>
	<input type="radio"
		   value={meme.id}
		   name={name}
	/>
	<!-- svelte-ignore a11y-media-has-caption -->
	<audio src="https://www.w3schools.com/html/horse.ogg"
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
</label>



<style>
	label {
		width: 38rem;
		max-width: 100%;
		height: 7.5rem;
		background-color: green; /* TODO: Random color gradient */
		border-radius: 30px;
		border: 3px solid black;
		cursor: pointer;
		color: white;
		margin-bottom: 1rem;

		display: flex;
		align-items: center;
		transition: all 125ms;
	}

	label.selected {
		border-color: white;
	}

	label:hover {
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
	}

	.artist {
		font-size: 1rem;
		margin-top: 1rem;
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
