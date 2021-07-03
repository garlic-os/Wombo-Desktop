<script lang="ts">
	import type { Meme, Maybe } from "../types";

	export let meme: Meme;
	
	let selectedID: Maybe<string> = undefined;
	export let selectedMeme: Maybe<Meme>;

	let input: HTMLInputElement;
	let preview: Maybe<HTMLAudioElement>;

	let playing = false;

	function handleChange(): boolean {
		input.checked ? preview?.play() : preview?.pause();
		selectedMeme = meme;
		return input.checked;
	}

	// Hack: I can't get Svelte to notice when the radio button has been
	// deselected any other way.
	// When this compoment's radio button is selected, `selected` becomes true,
	// the audio plays, and selectedMeme is updated so the parent element can
	// bind to it know what meme is currently selected.
	$: selected = selectedID && handleChange();
</script>



<label class:selected on:click={ () => input.click() }>
	<input type="radio"
		   value={meme.id}
		   bind:group={selectedID}
		   bind:this={input}
	/>
	<!-- svelte-ignore a11y-media-has-caption -->
	<audio src="https://www.w3schools.com/html/horse.ogg"
		   preload="none"
		   bind:this={preview}
		   on:play={ () => playing = true }
		   on:pause={ () => playing = false }
	/>
	<button class:playing
		    on:click={ () => preview.paused ? preview.play() : preview.pause() }
	/>
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
		background-color: green;
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
