import type { Meme, ProgressCallback, UploadLocation } from "./types";
import convert2jpg from "./convert2jpg";

const dummyCallback = (_: string): void => {};

function delay(ms: number): Promise<void> {
	return new Promise( (resolve) => setTimeout(resolve, ms) );
}

function capitalize(text: string): string {
	return text[0].toUpperCase() + text.substring(1);
}


/**
 * Send a series of requests to Wombo API endpoints to make Wombo lip-sync an
 * image or pair of images to a meme song/quote. This process is far from
 * instant, so an optional progress callback can be used to track the process
 * and keep the user updated.
 * If the number of images in the list is greater than 1, the meme will be
 * processed as a Wombo Combo.
 * Memes are referenced by numerical ID. All memes numbered 1 to 400
 * that are available as of 6/6/2021 are cataloged in /memes.json.
 * (A ton more memes have been added since then. I need to re-scrape the API.)
 */
export async function generateMeme(
	meme: Meme,
	images: File[],
	onProgressUpdate: ProgressCallback=dummyCallback,
): Promise<string> {

	// Wombo only accepts JPGs. If any provided image is not a JPG, it must
	// be converted before it can be sent to Wombo.
	for (let i = 0; i < images.length; ++i) {
		if (images[i].type !== "image/jpeg") {
			onProgressUpdate("Converting images...");
			images[i] = await convert2jpg(images[i]);
		}
	}

	onProgressUpdate("Reserving upload locations...");
	const [ requestID, uploadLocations ] = await reserveUploadLocations(meme.combo);

	onProgressUpdate("Uploading images...");
	await uploadImages(uploadLocations, images);

	onProgressUpdate("Generating Wombo...");
	return await processImages(requestID, meme.id, onProgressUpdate);
}


/**
 * Reserve an S3 object to upload an image to.
 * The received request ID and upload_photo.fields are used in subsequent
 * requests.
 */
export async function reserveUploadLocations(
	combo: boolean=false,
): Promise<[string, UploadLocation[]]> {

	const response = await fetch("/reserve-upload-location", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			numwombo: combo ? 2 : 1,
			premium: false,
			user_id: null,
		}),
	});
	const data = await response.json();
	return [data.id, data.upload_photos];
}


/**
 * Upload the images to their reserved locations.
 * This request sends the "fields" object of each entry in "upload_photos"
 * returned from the previous response along with the files to upload as
 * multipart/form-data to an Amazon AWS S3 endpoint.
 */
export async function uploadImages(
	uploadLocations: UploadLocation[],
	images: File[],
): Promise<void> {

	for (let i = 0; i < uploadLocations.length; ++i) {
		const formData = new FormData();
		const fields = uploadLocations[i].fields;

		for (const key in fields) {
			formData.append(key, fields[key]);
		}
		formData.append("file", images[i], "image.jpg");

		await fetch("/upload-image", {
			method: "POST",
			body: formData,
		});
	}
}


/**
 * Ask Wombo to begin processing the uploaded image, then return the URL to the
 * completed video when finished.
 */
export async function processImages(
	requestID: string,
	memeID: number,
	onProgressUpdate: ProgressCallback=dummyCallback,
): Promise<string> {

	// Telling Wombo to begin lip-syncing your image to the given meme.
	await fetch("/start-processing", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			request_id: requestID,
			request_info: {
				meme_id: memeID,
				premium: false,  // TODO: What happens when you make this true?
			}
		}),
	});

	// Poll Wombo every 2 seconds for the meme's completion status.
	// (Annoying, but this is how the real app does it)
	while (true) {
		const response = await fetch("/get-status", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				request_id: requestID,
			}),
		});
		const data = await response.json();

		switch (data.state) {
			case "completed":
				return data.video_url;
			case "failed":
			case "input":
				throw Error(`Generation failed: ${JSON.stringify(data)}`);
			default:
				onProgressUpdate(capitalize(data.state) + "...");
		}
		await delay(2000);
	}
}
