/**
 * A dedicated server is needed to host Wombo Desktop because certain requests
 * bound for Wombo contain an Authorization header. Browsers' CORS policies
 * prevent this header from being sent directly to Wombo.
 * This server proxies the needed requests to Wombo's API so the browser doesn't
 * have to include any Authentication headers in its own requests, thereby
 * circumventing CORS.
 * All this effort would make you think Wombo does something with this header.
 * It doesn't. But watch your requests fail if you don't have it.
 */

import fastify from "fastify";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import config from "./config.js";

const app = fastify({
	logger: true,
	disableRequestLogging: true,
	ignoreTrailingSlash: true,
	caseSensitive: false,
});

process.on("unhandledRejection", app.log.error);

// Middleware
import fastifyCors from "fastify-cors";
import fastifyStatic from "fastify-static";
import fastifyMultipart from "fastify-multipart";
app.register(fastifyCors);  // Good manners
app.register(fastifyStatic, {  // Host public/
	root: path.join(process.cwd(), "public"),
});
app.register(fastifyMultipart, {  // Parse multipart/form-data
	fields: 4,  // key, AWSAccessKeyId, policy, signature
	files: 1,  // Only one file: the image to Wombo
	fileSize: 10 * 1024 * 1024,  // 10 MB -- it's a JPG, it shouldn't be huge
	fieldNameSize: 14, // Longest Wombo upload field name
	fieldSize: 300, // A little longer than the longest (non-file) field value
});


// This is legitimately the token Wombo uses
// This whole file is to put this into three requests
const token = Buffer.from("wombo-that-shizz:GetThatBread$1!").toString("base64");
const womboHeader = { "Authorization": `Basic ${token}` };


function submitForm(form, url) {
	return new Promise( (resolve, reject) => {
		form.submit(url, (err, res) => {
			if (err) return reject(err);
			resolve(res);
		});
	});
}


app.post("/reserve-upload-location", {
	schema: {
		consumes: ["application/json"],
		body: {
			type: "object",
			required: ["numwombo", "premium", "user_id"],
			properties: {
				numwombo: { type: "number" },
				premium: { type: "boolean" },
				user_id: { type: ["string", "null"] },
			},
		},
	},
}, async (req) => {
	app.log.info("Reserving new upload location...");

	const { data } = await axios.post(
		"https://api.wombo.ai/mobile-app/mashups/",
		req.body,
		{ headers: womboHeader },
	);

	app.log.info(`[${data.id}] Reserved upload location`);
	return data;
});


app.post("/upload-image", {
	schema: {
		consumes: ["multipart/form-data"],
		// body: {
		// 	required: ["key", "AWSAccessKeyId", "policy", "signature"],
		// },
	},
}, async (req, reply) => {
	const form = new FormData();
	let requestID;

	for await (const part of req.parts()) {
		if (part.file) {
			form.append("file", await part.toBuffer(), part.filename);
		} else {
			if (part.fieldname === "key") {
				// Extract the request ID from the key, which is a file path
				// that goes "blah/request-id_asdf.mp4"
				requestID = part.value.substring(part.value.indexOf("/") + 1, part.value.indexOf("_"));
				app.log.info(`[${requestID}] Uploading image...`);
			}
			form.append(part.fieldname, part.value);
		}
	}

	try {
		await submitForm(form, "https://wombo-user-content.s3.amazonaws.com/");
	} catch (error) {
		app.log.error("Upload failed:", error);
		reply.code(500);
		throw Error(error.message ?? "");
	}

	app.log.info(`[${requestID}] Uploaded image`);
	reply.code(204);
});


app.post("/start-processing", {
	schema: {
		consumes: ["application/json"],
		body: {
			type: "object",
			required: ["request_id", "request_info"],
			properties: {
				request_id: { type: "string" },
				request_info: {
					type: "object",
					properties: {
						meme_id: { type: ["number", "string"] },
						premium: { type: "boolean" },
					},
				},
			},
		},
	},
}, async (req) => {
	app.log.info(`[${req.body.request_id}] Beginning processing...`);
	req.body.request_info.meme_id = req.body.request_info.meme_id.toString();

	const { data } = await axios.put(
		`https://api.wombo.ai/mobile-app/mashups/${req.body.request_id}`,
		req.body.request_info,
		{ headers: womboHeader },
	);

	app.log.info(`[${req.body.request_id}] Begun processing`);
	return data;
});


app.post("/get-status", {
	schema: {
		consumes: ["application/json"],
		body: {
			type: "object",
			required: ["request_id"],
			properties: {
				request_id: { type: "string" },
			},
		},
	},
}, async (req) => {
	app.log.info(`[${req.body.request_id}] Getting status...`);

	const { data } = await axios.get(
		`https://api.wombo.ai/mobile-app/mashups/${req.body.request_id}`,
		{ headers: womboHeader },
	);



	app.log.info(`[${req.body.request_id}] Got status: ${data.state}`);
	return data;
});


(async () => {
	try {
		await app.listen(config.PORT);
	} catch (error) {
		try {
			app.log.error(error);
		} catch (errorError) {
			console.error(error);
			console.error("An error occurred while trying to log the above error:", errorError);
		}
		process.exit(1);
	}
})();
