import CategoryModel from "./category-model";
import { Category } from "./category-types";

export class CategoryService {
    // Create category
    async create(category: Category) {
        const newCategory = new CategoryModel(category);
        return newCategory.save();
    }

    // Get one category data by ID
    async getOne(categoryId: string) {
        return await CategoryModel.findOne({ _id: categoryId });
    }

    // Update category
    async update(
        categoryId: string,
        updateData: Partial<Category>,
    ): Promise<({ _id: string } & Category) | null> {
        return await CategoryModel.findByIdAndUpdate(
            categoryId,
            { $set: updateData },
            { new: true },
        );
    }

    // Get all Category data
    async getAll() {
        return await CategoryModel.find();
    }

    // Delete category
    async delete(categoryId: string) {
        return await CategoryModel.findByIdAndDelete(categoryId);
    }
}
