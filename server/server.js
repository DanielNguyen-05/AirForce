import "dotenv/config";
import express from "express";
import cors from "cors";
import indexRoutes from "./routes/index.routes.js"
import mongoose from "mongoose";

const app = express();
const port = 3000;

mongoose.connect(process.env.DATABASE);

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use("/", indexRoutes);

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});