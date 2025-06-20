const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const authRouter = require("./routes/auth.routes")

const app = express();
dotenv.config();

mongoose.connect(process.env.MONGODB)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.use(cors({ origin: process.env.FRONTEND, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth",authRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(errorHandler);