require("dotenv").config();

const express = require("express");
const adviceHandler = require("./api/advice");

const app = express();
const port = process.env.API_PORT || 3001;

app.get("/api/advice", adviceHandler);

app.listen(port, () => {
  console.log(`Advice API listening on http://localhost:${port}`);
});
