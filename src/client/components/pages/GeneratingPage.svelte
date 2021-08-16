<script lang="ts">
	import { createEventDispatcher } from "svelte";

	import PageTemplate from "./PageTemplate.svelte";
	import ProgressBar from "../ProgressBar.svelte";
	import BackButton from "../BackButton.svelte";

	export let progressMessage = "";
	export let progressPercent = 0;

	const dispatch = createEventDispatcher();
</script>



<PageTemplate center>
	<p class="progress">Your Wombo is<br />being created!</p>
	<ProgressBar bind:progressPercent={progressPercent} />
	<p>{progressMessage}</p>

	<BackButton icon="x" on:click={ () => dispatch("back") }>
		Cancel Wombo
	</BackButton>
</PageTemplate>



<style>
	.progress {
		font-family: "Yeyey", sans-serif;
		color: var(--green-2);
		font-size: 24pt;
	}
</style>
