/**
 * A dedicated server is needed to host Wombo Desktop because certain requests
 * bound for Wombo contain an Authorization header. Browsers' CORS policies
 * prevent this header from being sent directly to Wombo.
 * This server proxies the needed requests to Wombo's API so the browser doesn't
 * have to include any Authentication headers in its own requests, thereby
 * circumventing CORS.
 * All this effort and Wombo doesn't actually do anything with the
 * Authorization header. But if you try to make a request without one, it won't
 * accept it.
 */

import fastify from "fastify";
import path from "path";
import axios from "axios";
import Formidable from "formidable";
import FormData from "form-data";
import fs from "fs";
import config from "./config.js";

const app = fastify({ logger: true });
const formidable = Formidable();

// Middleware
import fastifyCors from "fastify-cors";
import fastifyStatic from "fastify-static";
app.register(fastifyCors);  // Good manners
app.register(fastifyStatic, {  // Host public/
	root: path.join(process.cwd(), "public"),
});


// This is legitimately the token Wombo uses
// This whole file is to put this into three of the requests
const token = Buffer.from("wombo-that-shizz:GetThatBread$1!").toString("base64");
const womboHeader = { "Authorization": `Basic ${token}` };


app.post("/reserve-upload-location", async (_, reply) => {
	app.log.info("Reserving new upload location...");

	const { data } = await axios.post(
		"https://api.wombo.ai/mobile-app/mashups/",
		null,
		{ headers: womboHeader },
	);

	if (config.DEBUG) {
		axios.post(
			"http://localhost:5001",
			null,
			{ headers: womboHeader },
		);
	}

	reply.send(data);

	app.log.info("Reserved upload location for request ID:", data.id);
});


app.post("/upload-image", async (req, reply) => {
	formidable.parse(req, (error, fields, {file}) => {
		if (error) {
			app.log.error("Upload failed:", error);
			return reply.status(500).send(error.message);
		}

		app.log.info("Uploading image to:", fields.key);

		if (Array.isArray(file)) file = file[0];

		const form = new FormData();
		for (const key in fields) {
			form.append(key, fields[key]);
		}

		fs.readFile(file.path, (error, data) => {
			if (error) {
				app.log.error("Upload failed:", error);
				return reply.status(500).send(error.message);
			}
			form.append("file", data, file.name);

			form.submit("https://wombo-user-content.s3.amazonaws.com/", (error) => {
				if (error) {
					app.log.error("Upload failed:", error);
					return reply.status(500).send(error.message);
				}
			});
	
			app.log.info("Uploaded image to:", fields.key);
			reply.sendStatus(200);
		});
	});
});


app.post("/start-processing", async (req, reply) => {
	app.log.info("Beginning processing for request ID:", req.body.request_id);

	// 😔
	req.body.request_info.meme_id = req.body.request_info.meme_id.toString();

	const { data } = await axios.put(
		`https://api.wombo.ai/mobile-app/mashups/${req.body.request_id}`,
		req.body.request_info,
		{ headers: womboHeader },
	);

	if (config.DEBUG) {
		axios.put(
			`http://localhost:5001/${req.body.request_id}`,
			null,
			{ headers: womboHeader },
		);
	}

	reply.send(data);

	app.log.info("Begun processing for request ID:", req.body.request_id);
});


app.post("/status", async (req, reply) => {
	app.log.info("Getting status for request ID:", req.body.request_id);

	const { data } = await axios.get(
		`https://api.wombo.ai/mobile-app/mashups/${req.body.request_id}`,
		{ headers: womboHeader },
	);

	if (config.DEBUG) {
		axios.get(
			`http://localhost:5001/${req.body.request_id}`,
			null,
			{ headers: womboHeader },
		);
	}

	reply.send(data);
	app.log.info("Got status for request ID:", req.body.request_id, data.state);
});


(async () => {
	try {
		if (config.DEBUG) {
			app.log.warn("Debug enabled");
		}
		await app.listen(config.PORT);
	} catch (error) {
		app.log.error(error);
		process.exit(1);
	}
})();
