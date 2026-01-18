import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { FileStorage } from "../common/types/storage";
import { ToppingService } from "./topping-service";
import { CreataeRequestBody, Topping } from "./topping-types";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

export class ToppingController {
    constructor(
        private toppingService: ToppingService,
        private storage: FileStorage,
        private logger: Logger,
    ) {}

    create = async (
        req: Request<object, object, CreataeRequestBody>,
        res: Response,
        next: NextFunction,
    ) => {
        // Validation
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const image = req.files!.image as UploadedFile;
        const fileUuid = uuidv4();

        await this.storage.upload({
            filename: fileUuid,
            fileData: image.data.buffer,
        });

        const savedTopping = await this.toppingService.create({
            ...req.body,
            image: fileUuid,
            tenantId: req.body.tenantId,
        } as Topping);

        this.logger.info(`Topping created`, { id: savedTopping._id });

        res.json({
            id: savedTopping._id,
        });
    };
}
