<script lang="ts">
	import type { Maybe } from "../types";
	import { fly } from "svelte/transition";

	type iconName = "home" | "image-file" | "pause" | "play" | "trash" | "undo"
		          | "x";

	export let icon: Maybe<iconName>;
</script>



<button class="back-button"
	    transition:fly="{{ x: -300, duration: 500 }}"
	    on:click
>
	{#if icon}
		<span style="background-image: url('../img/{icon}.svg');" />
	{/if}
	<slot />
</button>



<style>
	button {
		position: fixed;
		left: 1.6rem; top: 0.8rem;
		background: none;
		display: flex;
		align-items: center;
		border: none;
		cursor: pointer;
		color: white;
		transition: transform 125ms;
		z-index: 2;
	}

	button:active {
		transform: scale(95%);
	}

	span {
		--side-length: 2rem;
		display: inline-block;
		width: var(--side-length);
		height: var(--side-length);
		background-position: center;
		background-repeat: no-repeat;
		background-size: 100%;
		margin-right: 1ch;
	}
</style>
