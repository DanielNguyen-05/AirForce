import express from "express";
import cors from "cors";
import 'dotenv/config'
import indexRoutes from "./routes/index.routes.js"

const app = express();
const port = 3000;

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
