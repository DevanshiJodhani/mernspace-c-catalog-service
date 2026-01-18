import express from "express";
import fileUpload from "express-fileupload";
import { asyncWrapper } from "../common/utils/wrapper";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import { ToppingController } from "./topping-controller";
import { ToppingService } from "./topping-service";
import logger from "../config/logger";
import { S3Storage } from "../common/services/S3Storage";
import createToppingValidator from "./create-topping-validator";
import createHttpError from "http-errors";

const router = express.Router();

const toppingService = new ToppingService();
const s3Storage = new S3Storage();
const toppingController = new ToppingController(
    toppingService,
    s3Storage,
    logger,
);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File size exceeds the limit");
            next(error);
        },
    }),
    createToppingValidator,
    asyncWrapper(toppingController.create),
);

export default router;
