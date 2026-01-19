import toppingModel from "./topping-model";
import { Topping } from "./topping-types";

export class ToppingService {
    // Create topping
    async create(topping: Topping) {
        return await toppingModel.create(topping);
    }

    // Get one topping data
    async getOne(toppingId: string) {
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
}
