const express = require("express");
const bodyParser = require("body-parser");
const database = require("./src/config/database");
const routes = require("./src/routes/routes");
const cors = require("cors");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.use(cors());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api", routes);
app.use('/uploads', express.static('uploads'));

database();
