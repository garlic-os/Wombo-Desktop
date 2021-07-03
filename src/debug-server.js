import express from "express";
import cors from "cors";
import fs from "fs";

process.on("unhandledRejection", (up) => { throw up; });


const app = express();
const port = 5001;

app.use(cors());  // Good manners


const raw = (req, _, next) => {
	req.body = "";
	req.on("data", (chunk) => req.body += chunk );
	req.on("end", next);
};

app.post("*", raw, (req, res) => {
    console.log("Request received");
	fs.writeFileSync("debug.cap", req.body);
	res.sendStatus(200);
});

export default app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});
