const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app.js");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DB_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log("Database connection established"))
  .catch((err) => console.log(err.message));

app.listen(process.env.PORT, function () {
  console.log(`App started on port ${process.env.PORT}`);
});
