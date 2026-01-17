import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { CategoryService } from "./category-service";
import { Category, PriceConfiguration } from "./category-types";
import { Logger } from "winston";

export class CategoryController {
    constructor(
        private categoryService: CategoryService,
        private logger: Logger,
    ) {
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.getOne = this.getOne.bind(this);
    }

    // Create category
    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { name, priceConfiguration, attributes } = req.body as Category;

        const category = await this.categoryService.create({
            name,
            priceConfiguration,
            attributes,
        });

        this.logger.info(`Created category`, { id: category._id });

        res.json({ id: category._id });
    }

    // Update category
    async update(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const categoryId = req.params.id;
        const updateData = req.body as Partial<Category>;

        // Check if category exists
        const existingCategory = await this.categoryService.getOne(categoryId);

        if (!existingCategory) {
            return next(createHttpError(404, "Category with this IDnot found"));
        }

        if (updateData.priceConfiguration) {
            // Converting exsiting Map to object if it's a Map
            let existingConfig: PriceConfiguration;

            if (existingCategory.priceConfiguration instanceof Map) {
                existingConfig = Object.fromEntries(
                    existingCategory.priceConfiguration.entries(),
                ) as PriceConfiguration;
            } else {
                existingConfig = existingCategory.priceConfiguration;
            }

            const mergedConfig: PriceConfiguration = {
                ...existingConfig,
                ...updateData.priceConfiguration,
            };

            updateData.priceConfiguration = mergedConfig;
        }

        const updateCategory = await this.categoryService.update(
            categoryId,
            updateData,
        );

        this.logger.info(`Updated category`, { id: categoryId });

        res.json({
            message: "Updated Category",
            id: updateCategory?._id,
        });
    }

    // Fetch one category data by ID
    async getOne(req: Request, res: Response, next: NextFunction) {
        const { categoryId } = req.params;

        const category = await this.categoryService.getOne(categoryId);

        if (!category) {
            return next(createHttpError(404, "Category not found"));
        }

        this.logger.info(`Fetched Category data of ID: `, { id: category._id });

        res.json({
            category,
        });
    }
}
