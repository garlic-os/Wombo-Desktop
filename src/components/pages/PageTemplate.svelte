<script>
	import { fade } from "svelte/transition";
    export let center = false;
	const fadeParams = { duration: 250 };
</script>



<section class:center transition:fade={fadeParams}>
    <slot />
</section>



<style>
	section {
		position: absolute;
		left: 0; top: 0;
		width: 100%;
		height: 100%;
		transition: padding ease-out 500ms;
		overflow: hidden auto;
		padding-top: 4.75rem;

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

	section.center {
		justify-content: center;
	}
</style>
