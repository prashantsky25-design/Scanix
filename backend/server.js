require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/registrations", require("./routes/registrationRoutes"));
app.use("/api/classes", require("./routes/classRoutes"));

app.use((req, res) => res.status(404).json({ message: "Not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`API running on :${PORT}`)))
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });
