const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const connectDb = require("./config/dbConnection");
const dotenv = require("dotenv").config();

connectDb();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use("/v1/contacts", require("./routes/contactRoutes"));
app.use("/v1/users", require("./routes/userRoutes"));
app.use(errorHandler);

app.listen(port, () => {
  console.log(`E dey shake for port ${port}`);
});
