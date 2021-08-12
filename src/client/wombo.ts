interface S3Fields {
	key: string;
	AWSAccessKeyId: string;
	policy: string;
	signature: string;
};

type ProgressCallback = (message: string) => void;
const dummyCallback = (_: string): void => {};


function delay(ms: number): Promise<void> {
	return new Promise( (resolve) => setTimeout(resolve, ms) );
}


function capitalize(text: string): string {
	return text[0].toUpperCase() + text.substring(1);
}


/**
 * Send a series of requests to Wombo API endpoints to make Wombo lip-sync an
 * image to a meme song/quote. This process takes roughly a minute, so an
 * optional progress callback can be used to track the process and keep the user
 * updated.
 * Memes are referenced by numerical ID. All memes numbered 1 to 400
 * that are available as of 6/6/2021 are cataloged in /memes.json.
 * (A ton more memes have been added since then. I need to re-scrape the API.)
 */
export async function generateMeme(
	image: File,
	memeID: number,
	onProgressUpdate: ProgressCallback=dummyCallback
): Promise<string> {

	onProgressUpdate("Reserving upload location...");
	const [ requestID, s3Fields ] = await reserveUploadLocation();

	onProgressUpdate("Uploading image...");
	await uploadImage(image, s3Fields);

	onProgressUpdate("Generating...");
	return await processImage(requestID, memeID, onProgressUpdate);
}


/**
 * Reserve an S3 object to upload an image to.
 * The received request ID and upload_photo.fields are used in subsequent
 * requests.
 */
export async function reserveUploadLocation(): Promise<[string, S3Fields]> {
	const response = await fetch("/reserve-upload-location", { method: "POST" });
	const data = await response.json();
	return [data.id, data.upload_photo.fields];
}


/**
 * Upload the image to the S3 location.
 * This request sends the "fields" object returned from the previous response
 * along with the file to upload as multipart/form-data to an Amazon AWS S3
 * endpoint.
 */
export async function uploadImage(
	image: File,
	s3Fields: S3Fields
): Promise<void> {

	const formData = new FormData();
	for (const key in s3Fields) {
		formData.append(key, s3Fields[key]);
	}

	formData.append("file", image, "image.jpg");

	await fetch("/upload-image", {
		method: "POST",
		body: formData,
	});
}


/**
 * Ask Wombo to begin processing the uploaded image, then return the URL to the
 * completed video when finished.
 */
export async function processImage(
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
				throw Error(`Generation failed: ${JSON.stringify(data)}`);
			default:
				onProgressUpdate(capitalize(data.state) + "...");
		}
		await delay(2000);
	}
}
