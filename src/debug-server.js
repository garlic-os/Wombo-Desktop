import fastify from "fastify";
import fs from "fs";
import config from "./config.js";


const app = fastify();

// Middleware
import fastifyCors from "fastify-cors";
app.register(fastifyCors);


const raw = express.raw({
	limit: 99999999999999,
});


const handleRequest = (req, reply) => {
	console.debug("Request received");
	fs.appendFileSync("debug.cap", JSON.stringify(req.body) + "\n");
	reply.sendStatus(200);
};


app.get("*", raw, handleRequest);
app.post("*", raw, handleRequest);
app.put("*", raw, handleRequest);


(async () => {
	try {
		await app.listen(config.PORT);
	} catch (error) {
		app.log.error(error);
		process.exit(1);
	}
})();
