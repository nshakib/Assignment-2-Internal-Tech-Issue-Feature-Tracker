import express, { type Application, type Request, type Response } from "express"
import cors from "cors"
import globalErrorHandler from "./middleware/globalErrorHandler";
import config from "./config";
import { authRoute } from "./modules/auth/auth.route";

const app:Application = express();
app.use(express.json());

app.use(
  cors({
    origin: config.client_url || "http://localhost:3000",
  }),
);

app.get("/", (req: Request, res: Response) => {
  //res.send("Hello Developer World!");
  res.status(200).json({
    message: "Express Server",
    author: "Md. Nazmus Shakib",
  });
})

app.use("/api/auth",authRoute);

// Global Error Handling Middleware
app.use(globalErrorHandler);

export default app;