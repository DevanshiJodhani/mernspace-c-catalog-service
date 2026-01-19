import { paginationLabels } from "../config/pagination";
import toppingModel from "./topping-model";
import { Filter, PaginateQuery, Topping } from "./topping-types";

export class ToppingService {
    // Create topping
    async create(topping: Topping) {
        return await toppingModel.create(topping);
    }

    // Get one topping data
    async getOneTopping(toppingId: string) {
        return await toppingModel.findById(toppingId);
    }

    // Update topping
    async updateTopping(toppingId: string, topping: Topping) {
        return (await toppingModel.findByIdAndUpdate(
            { _id: toppingId },
            { $set: topping },
            { new: true },
        )) as Topping;
    }

    // Fetch topping list
    async getAllToppings(
        q: string,
        filters: Filter,
        paginateQuery: PaginateQuery,
    ) {
        const searchQueryRegexp = new RegExp(q, "i");

        const matchQuery = {
            ...filters,
            name: searchQueryRegexp,
        };

        const aggregate = toppingModel.aggregate([
            {
                $match: matchQuery,
            },
        ]);

        return toppingModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        });
    }

    // Delete topping
    async deleteTopping(toppingId: string) {
        return await toppingModel.findByIdAndDelete(toppingId);
    }
}
