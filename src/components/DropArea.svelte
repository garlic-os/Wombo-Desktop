<script lang="ts">
	import type { Maybe } from "../types";

	export let file: Maybe<File> = undefined;
	export let disabled = false;

	let input: HTMLInputElement;

	// FUNNY BUSINESS: This number's truthiness determines the component's
	// .dragover class state.
	// To accomodate for how dragging over a child element triggers a dragenter
	// followed by a dragleave from the parent, we can't just use a boolean
	// otherwise the dragleave will set the class to false even though the
	// user is still dragging over the component.
	// Incrementing and decrementing this value on dragenter and dragleave
	// events and using the number's truthiness as a boolean keeps the
	// .dragover class state accurate.
	let dragover = 0;

	function handleDrop(event: DragEvent): void {
		event.preventDefault();  // Prevent opening image in new tab
		handleFile(event.dataTransfer.files);
		dragover = 0;
	}

	function handleDragover(event: DragEvent): void {
		// Drop event doesn't fire if dragover isn't canceled 🤷‍♂️
		// https://stackoverflow.com/a/21341021
		event.preventDefault();
	}

	function handleFile(files: FileList): void {
		if (!disabled && files.item(0).type.startsWith("image/")) {
			file = files.item(0);
		}
	}

	function clear(event: Event): void {
		event.stopPropagation();  // Prevent "choose" dialog re-trigger
		file = undefined;
	}
</script>



<div class="drop-area"
	 class:empty={!file}
	 class:dragover
	 class:disabled
	 on:click={ () => file || input.click() }
	 on:dragenter={ () => ++dragover }
	 on:dragleave={ () => --dragover }
	 on:dragover={handleDragover}
	 on:drop={handleDrop}
>
	{#if file}
		<img alt="Input" src={URL.createObjectURL(file)} />
		<button class="delete icon" on:click={clear} />
	{:else}
		<div class="image icon" />
		{#if !disabled}
			<label>Choose or drag and drop an image
				<input type="file"
					accept="image/*"
					disabled={disabled}
					bind:this={input}
					on:change={ () => handleFile(input.files) }
				/>
			</label>
		{/if}
	{/if}
</div>



<style>
	.drop-area {
		position: relative;
		border: 2px solid #7d8084;
		border-radius: 50px;
		overflow: hidden;  /* Clip content's borders, too */
		width: 90%;
		max-width: 100%;
		height: 65%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		transition: all 125ms;
	}

	.drop-area.empty:not(.disabled):active {
		transform: scale(99%);
	}

	.drop-area.empty:not(.disabled):hover, .drop-area.empty:not(.disabled).dragover {
		border-color: white;
	}

	.drop-area.empty {
		cursor: pointer;
		border-style: dashed;
	}

	.drop-area.disabled {
		filter: brightness(0.5);
	}

	label {
		cursor: pointer;
	}

	input {
		display: none;
	}

	button {
		cursor: pointer;
		background-color: black;
		transition: all 125ms;
	}

	button:hover {
		border-color: white;
	}

	button:active {
		transform: scale(93%);
	}

	.icon {
		--side-length: clamp(2rem, 12vw, 6rem);
		display: inline-block;
		width: var(--side-length);
		height: var(--side-length);
		background-position: center center;
		background-repeat: no-repeat;
		margin-bottom: 1rem;
	}

	.icon.image {
		background-image: url("../img/image-file.svg");
	}

	.icon.delete {
		background-image: url("../img/trash.svg");
	}

	.delete {
		--side-length: 3.5rem;
		position: absolute;
		right: 1rem; top: 1rem;
		width: var(--side-length);
		height: var(--side-length);
		border-radius: 100%;
		background-size: 80%;
		background-repeat: no-repeat;
		background-position: 7px;  /* This SVG isn't on center 😛 */
	}

	img {
		max-width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>
