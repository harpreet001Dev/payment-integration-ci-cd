import express from "express";
import 'dotenv/config'
import connectDB from "./src/config/db.js";
import cors from 'cors'
import router from "./src/routes/index.js";
import errorHandler from "./src/middlewares/error.middleware.js";
import authtenticateUser from "./src/middlewares/auth.middleware.js";
const app = express();

app.use(express.json())



app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

connectDB()

app.get("/health", (req, res) => {
  res.send("Health OK");
});

app.use('/api', router)

app.use(errorHandler)
app.use(authtenticateUser)


app.listen(3000, () => {
  console.log("Server running on port 3000");
});