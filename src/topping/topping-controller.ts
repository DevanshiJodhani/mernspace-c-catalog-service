import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { FileStorage } from "../common/types/storage";
import { ToppingService } from "./topping-service";
import { CreataeRequestBody, Topping } from "./topping-types";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { AuthRequest } from "../common/types";
import { Roles } from "../common/constants";

export class ToppingController {
    constructor(
        private toppingService: ToppingService,
        private storage: FileStorage,
        private logger: Logger,
    ) {}

    // Create Topping
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

    // Update Topping
    update = async (req: Request, res: Response, next: NextFunction) => {
        // Validation
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { toppingId } = req.params;

        const topping = await this.toppingService.getOneTopping(toppingId);

        if (!topping) {
            return next(createHttpError(404, "Topping not found with this ID"));
        }

        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            const tenant = (req as AuthRequest).auth.tenant;
            if (topping.tenantId !== String(tenant)) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed to access this topping",
                    ),
                );
            }
        }

        let imageName: string | undefined;
        let oldImage: string | undefined;

        if (req.files?.image) {
            oldImage = topping.image;

            const image = req.files.image as UploadedFile;
            imageName = uuidv4();

            await this.storage.upload({
                filename: imageName,
                fileData: image.data.buffer,
            });

            await this.storage.delete(oldImage);
        }

        const { name, price, tenantId } = req.body;

        const toppingToUpdate = {
            name,
            price,
            tenantId,
            image: imageName ? imageName : (oldImage as string),
        };

        await this.toppingService.updateTopping(toppingId, toppingToUpdate);

        this.logger.info("Topping updated", { id: toppingId });

        res.json({
            message: "Topping updated successfully",
            id: toppingId,
        });
    };

    // Get only one topping data
    getOne = async (req: Request, res: Response, next: NextFunction) => {
        const { toppingId } = req.params;

        const topping = await this.toppingService.getOneTopping(toppingId);

        if (!topping) {
            return next(createHttpError(400, "Topping not found"));
        }

        this.logger.info("Fetch one topping data", { id: toppingId });

        res.json({
            ...topping,
            image: this.storage.getObjectUri(topping.image),
        });
    };
}
