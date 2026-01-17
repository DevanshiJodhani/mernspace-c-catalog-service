import mongoose, { Document } from "mongoose";

export interface Product {
    name: string;
    description: string;
    priceConfiguration: string;
    attributes: string;
    tenantId: string;
    categoryId: string;
    image: string;
}

export interface ProductDocument extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    image: string;
    priceConfiguration: string;
    attributes: string;
    tenantId: string;
    categoryId: mongoose.Types.ObjectId;
    isPublish?: boolean;
}

export interface Filter {
    tenantId?: string;
    categoryId?: mongoose.Types.ObjectId;
    isPublish?: boolean;
}
