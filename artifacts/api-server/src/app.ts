import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", usersRouter);

export default app;
