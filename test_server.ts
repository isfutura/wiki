import express from "npm:express@^4.18.2";

const app = express();
app.use("/", express.static("./"));

app.listen(3000);
