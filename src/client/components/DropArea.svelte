<script lang="ts">
	type Maybe<T> = T | undefined;

	export let file: Maybe<File> = undefined;
	let dropArea: HTMLDivElement;
	let inputElement: HTMLInputElement;

	function handleDragenter(event: DragEvent): void {
		event.preventDefault();
		// event.stopPropagation();
		dropArea.classList.add("dragover");
	}

	function handleDragleave(event: DragEvent): void {
		event.preventDefault();
		// event.stopPropagation();
		dropArea.classList.remove("dragover");
	}

	function handleDragover(event: DragEvent): void {
		// drop event doesn't fire without this ¯\_(ツ)_/¯
		// https://stackoverflow.com/a/21341021
		event.preventDefault();
		// event.stopPropagation();
	}

	function handleDrop(event: DragEvent): void {
		event.stopPropagation();
		event.preventDefault();
		handleFile(event.dataTransfer.files);
		dropArea.classList.remove("dragover");
	}

	function handleFile(files: FileList): void {
		file = files.item(0);
	}

	function clear(event: Event): void {
		// Prevent "choose" dialog from being immediately re-triggered
		event.stopPropagation();
		file = undefined;
	}
</script>



<div class="drop-area" class:empty={!file} bind:this={dropArea}
     on:click={ () => file || inputElement.click() }
	 on:dragenter={handleDragenter}
	 on:dragleave={handleDragleave}
	 on:dragover={handleDragover}
	 on:drop={handleDrop}
>
	{#if file}
		<img alt="Input" src={URL.createObjectURL(file)} />
		<button class="delete icon" on:click={clear} />
	{:else}
		<div class="image icon" />
		<label>Choose or drag and drop an image
			<input type="file" accept="image/*" bind:this={inputElement}
				   on:change={ () => handleFile(inputElement.files) }
			/>
		</label>
	{/if}
</div>



<style>
	.drop-area {
		position: relative;
		border: 2px solid #7d8084;
		border-radius: 40px;
		width: 90%;
		max-width: 100%;
		height: 45%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		transition: all 125ms;
	}

	.drop-area.empty:active {
		transform: scale(99%);
	}

	.drop-area.empty:hover, .drop-area.empty.dragover {
		border-color: white;
	}

	.drop-area.empty {
		cursor: pointer;
		border-style: dashed;
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
		height: 100%;
		max-height: 100%;
		max-width: 100%;
	}
</style>
