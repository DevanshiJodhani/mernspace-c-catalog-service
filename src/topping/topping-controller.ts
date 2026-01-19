import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { FileStorage } from "../common/types/storage";
import { ToppingService } from "./topping-service";
import { CreataeRequestBody, Filter, Topping } from "./topping-types";
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

        const { name, price, tenantId, isPublish } = req.body;

        const toppingToUpdate = {
            name,
            price,
            tenantId,
            isPublish,
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

    // Get all topping data
    getAll = async (req: Request, res: Response) => {
        const { q, tenantId, isPublish } = req.query;

        const filters: Filter = {};

        if (isPublish === "true") {
            filters.isPublish = true;
        }

        if (tenantId) filters.tenantId = tenantId as string;

        const toppings = await this.toppingService.getAllToppings(
            q as string,
            filters,
            {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit
                    ? parseInt(req.query.limit as string)
                    : 10,
            },
        );

        this.logger.info("Fetched toppings list");

        const finalTopping = (toppings.data as Topping[]).map(
            (topping: Topping) => {
                return {
                    ...topping,
                    image: this.storage.getObjectUri(topping.image),
                };
            },
        );

        res.json({
            data: finalTopping,
            total: toppings.total,
            pageSize: toppings.limit,
            currentPage: toppings.page,
        });
    };
}
