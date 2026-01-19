import mongoose from "mongoose";

export interface Topping {
    _id?: mongoose.Types.ObjectId;
    name: string;
    price: number;
    tenantId: string;
    image: string;
    isPublish: boolean;
}

export interface CreataeRequestBody {
    name: string;
    price: number;
    tenantId: string;
}

export interface Filter {
    tenantId?: string;
    isPublish?: boolean;
}

export interface PaginateQuery {
    page: number;
    limit: number;
}
