<script lang="ts">
	import { fly } from "svelte/transition";
</script>



<button transition:fly="{{ x: window.innerWidth, duration: 500 }}" on:click>
	<slot></slot>
</button>



<style>
	/* https://css-tricks.com/animating-a-css-gradient-border/ */
	/* Very limited current compatibility; background will not spin in most */
	/* browsers except very recent versions of Chrome. Oh well! */
	@property --bg-angle {
		syntax: "<angle>";
		initial-value: 145deg;
		inherits: false;
	}

	@keyframes bg-spin {
		from {
			--bg-angle: 145deg;
		}
		to {
			--bg-angle: 505deg;
		}
	}

	button:active {
		transform: scale(95%);
	}

	button {
		position: absolute;
		right: 2rem; top: 0.8rem;

		border: none;
		border-radius: 10px;
		/* https://stackoverflow.com/a/51432213 */
		transform-style: preserve-3d;

		background: #000000c7;
		letter-spacing: 0.0625ch;
		font-weight: bold;
		cursor: pointer;
		color: white;
		transition: transform 125ms;
		z-index: 2;
	}

	button::before {
		--bg-angle: 145deg;
		content: "";
		position: absolute;
		top: 0; bottom: 0; left: 0; right: 0;
		margin: -2px;
		border-radius: inherit;
		background: linear-gradient(var(--bg-angle), var(--red) 0%, var(--orange) 25%, var(--yellow) 50%, var(--blue) 75%, var(--green) 100%);
		animation: 20s linear infinite bg-spin;

		/* https://stackoverflow.com/a/51432213 */
		transform: translateZ(-1px);
	}
</style>
