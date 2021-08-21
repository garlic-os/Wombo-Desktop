<script type="ts">
	export let text = "";
	let banner: HTMLDivElement;
</script>



<div class="error-banner" bind:this={banner}>
	<span>{text}</span>
	<button class="close icon" on:click={ () => banner.remove() }></button>
</div>



<style>
	.error-banner {
		position: fixed;
		left: 0; top: 4.75rem;
		width: 100%;
		height: 4rem;
		padding: 1rem;
		background-color: #ff0033;
		color: #ffffffe3;
		border-bottom: 2px solid #c20027;
		font-family: monospace;
		z-index: 9999;
	}

	button {
		cursor: pointer;
	}

	.close {
		--side-length: 2rem;
		float: right;
		width: var(--side-length);
		height: var(--side-length);
		background: none;
		background-size: 100%;
		border: none;
	}

	.icon.close {
		background-image: url("../img/x.svg");
	}
</style>
