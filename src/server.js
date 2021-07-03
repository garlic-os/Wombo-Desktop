/**
 * A dedicated server is needed to host Wombo Desktop because certain requests
 * bound for Wombo contain an Authorization header. Browsers' CORS policies
 * prevent this header from being sent directly to Wombo.
 * This server proxies the needed requests to Wombo's API so the browser doesn't
 * have to include any Authentication headers in its own requests, thereby
 * circumventing CORS.
 * By the way, Wombo doesn't actually do anything with the Authorization header
 * that it requires from you.
 */
process.on("unhandledRejection", (up) => { throw up; });

import express from "express";
import cors from "cors";
import axios from "axios";
import Formidable from "formidable";
import FormData from "form-data"
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const port = process.env.PORT;
const formidable = new Formidable();

app.use(cors());  // Good manners
app.use(express.json());  // Parse JSON
app.use(express.static("public"));  // Host /public


// This is legitimately the token Wombo uses
const token = Buffer.from("wombo-that-shizz:GetThatBread$1!").toString("base64");
const womboHeader = { "Authorization": `Basic ${token}` };


/**
 * @param {express.Request} req
 * @returns {Promise<FormData>}
 */
function parseMultipartFormData(req) {
	return new Promise( (resolve, reject) => {
		formidable.parse(req, (error, fields, {file}) => {
			if (error) return reject(error);
			const form = new FormData();
			for (const key in fields) {
				form.append(key, fields[key]);
			}
			form.append(
				"file",
				fs.createReadStream(file.path),
				file.name,
			);
			resolve(form);
		});
	});
}


app.post("/reserve-upload-location", async (_, res) => {
	console.debug("Reserving new upload location...");

	const { data } = await axios.post(
		"https://api.wombo.ai/mobile-app/mashups/",
		null,
		{ headers: womboHeader },
	);

	res.json(data);

	console.debug("Reserved upload location for request ID:", data.request_id);
});


app.post("/upload-image", async (req, res) => {
	const form = await parseMultipartFormData(req);
	console.debug("[*] Uploading image to:", form.getHeaders().key);
	form.submit("https://wombo-user-content.s3.amazonaws.com/");
	console.debug("[*] Uploaded image to:", form.getHeaders().key);
	res.sendStatus(200);
});


app.post("/start-processing", async (req, res) => {
	console.debug("Beginning processing for request ID:", req.body.request_id);

	// 😒
	req.body.request_info.meme_id = req.body.request_info.meme_id.toString();

	const { data } = await axios.put(
		`https://api.wombo.ai/mobile-app/mashups/${req.body.request_id}`,
		req.body.request_info,
		{ headers: womboHeader },
	);

	res.json(data);

	console.debug("Begun processing for request ID:", req.body.request_id);
});


app.post("/status", async (req, res) => {
	console.debug("Getting status for request ID:", req.body.request_id);

	const { data } = await axios.get(
		`https://api.wombo.ai/mobile-app/mashups/${req.body.request_id}`,
		{ headers: womboHeader },
	);

	res.json(data);

	console.debug("Got status for request ID:", req.body.request_id, data.state);
});


export default app.listen(port, () => {
	console.log(`Server started at http://localhost:${port}/`);
});
