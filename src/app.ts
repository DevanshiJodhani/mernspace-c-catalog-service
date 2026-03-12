import express, { Request, Response } from "express";
import config from "config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRouter from "./category/category-router";
import productRouter from "./product/product-router";
import toppingRouter from "./topping/topping-router";

const app = express();

const ALLOWED_DOMAINS = [
    config.get("frontend.adminUI"),
    config.get("frontend.clientUI"),
];
app.use(
    cors({
        origin: ALLOWED_DOMAINS as string[],
        credentials: true,
    }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.send({ message: "Hello from catalog service" });
});

// Health check route
app.get("/health", (req, res) => {
    res.status(200).send("Catalog service running perfectly");
});

app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use("/toppings", toppingRouter);

app.use(globalErrorHandler);

export default app;
