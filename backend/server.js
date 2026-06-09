import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import chatRoutes from "./routes/chat.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const app = express();
const port = Number(process.env.BACKEND_PORT || 5050);

app.use(
  cors({
    origin: true,
    credentials: false,
  }),
);
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.use("/api/chat", chatRoutes);

app.listen(port, () => {
  logger.info(`Express backend listening on http://127.0.0.1:${port}`);
});
