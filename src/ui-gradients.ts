import type { Gradient } from "./types";

// Load gradients JSON file
const gradientsLoaded = fetch("../gradients.json")
	.then(response => response.json() as Promise<Gradient[]> );


export async function generateGradient(rotation: string="0deg"): Promise<string> {
	const gradients = await gradientsLoaded;
	const gradient = gradients[Math.floor(Math.random() * gradients.length)];
	let gradientString = `linear-gradient(${rotation}`;

	for (let i = 0; i < gradient.colors.length; ++i) {
		const color = gradient.colors[i];
		const position = 100 * i / (gradient.colors.length - 1);
		gradientString += `, ${color} ${position}%`;
	}

	return gradientString + ");";
}
