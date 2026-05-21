import express, { type Application, type Request, type Response } from "express"
import cors from "cors"

const app:Application = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.get("/", (req: Request, res: Response) => {
  //res.send("Hello Developer World!");
  res.status(200).json({
    message: "Express Server",
    author: "Md. Nazmus Shakib",
  });
})

export default app;