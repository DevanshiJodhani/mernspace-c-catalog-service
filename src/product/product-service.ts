import productModel from "./product-model";
import { Filter, Product } from "./product-types";

export class ProductService {
    // Create product
    async createProduct(product: Product) {
        return await productModel.create(product);
    }

    // Update product
    async updateProduct(productId: string, product: Product) {
        return await productModel.findOneAndUpdate(
            { _id: productId },
            { $set: product },
            { new: true },
        );
    }

    // Fetch one product data
    async getProduct(productId: string): Promise<Product | null> {
        return await productModel.findOne({ _id: productId });
    }

    // Fetch all products or searched products
    async getProducts(q: string, filters: Filter) {
        const searchQueryRegexp = new RegExp(q, "i");

        const matchQuery = {
            ...filters,
            name: searchQueryRegexp,
        };

        const aggregate = productModel.aggregate([
            {
                $match: matchQuery,
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                attributes: 1,
                                priceConfiguration: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: "$category",
            },
        ]);

        const result = await aggregate.exec();

        return result as Product[];
    }
}
