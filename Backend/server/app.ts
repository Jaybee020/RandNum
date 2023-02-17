import express, { Router, Request, Response } from "express";
import { json, urlencoded } from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import * as dotenv from "dotenv";
import { lottoRouter } from "./router/lotto";
import { restartGame } from "../workers/gameManager";
import { MODE } from "../scripts/config";

dotenv.config();
const uri =
  MODE == "PRODUCTION"
    ? String(process.env.MONGO_CONNECTION_STRING)
    : "mongodb://localhost:27017/RandNum";
const PORT: number = parseInt(process.env.PORT as string) || 8000;
mongoose
  .connect(uri, {})
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Couldn'to connect to database");
  });
const app = express();
app.use(cors());
app.use(json());
app.use(morgan("dev"));

app.get("/", async function (req: Request, res: Response) {
  res.status(200).send({
    status: "Up and running",
  });
});

app.use("/lottoGame", lottoRouter);

app.listen(PORT, async () => {
  restartGame.start();
  console.log(`Listening on ${PORT}`);
});
