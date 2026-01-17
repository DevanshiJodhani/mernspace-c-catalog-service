import {
    DeleteObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import config from "config";
import { FileData, FileStorage } from "../types/storage";
import createHttpError from "http-errors";

export class S3Storage implements FileStorage {
    private client: S3Client;

    constructor() {
        this.client = new S3Client({
            region: config.get("s3.region"),
            credentials: {
                accessKeyId: config.get("s3.accessKeyId"),
                secretAccessKey: config.get("s3.secretAccessKey"),
            },
        });
    }

    async upload(data: FileData): Promise<void> {
        const objectParams = {
            Bucket: config.get("s3.bucket"),
            Key: data.filename,
            Body: data.fileData,
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        return await this.client.send(new PutObjectCommand(objectParams));
    }

    async delete(filename: string): Promise<void> {
        const objectParams = {
            Bucket: config.get("s3.bucket"),
            Key: filename,
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        return await this.client.send(new DeleteObjectCommand(objectParams));
    }

    getObjectUri(filename: string): string {
        // https://mernspace-pizza-application-project.s3.eu-north-1.amazonaws.com/3d8039d9-6cba-4076-bdd3-18fde08f47e3

        const bucket = config.get("s3.bucket");
        const region = config.get("s3.region");

        if (typeof bucket === "string" && typeof region === "string") {
            return `https://${bucket}.s3.${region}.amazonaws.com/${filename}`;
        }

        const error = createHttpError(500, "Invalid S3 configuration");
        throw error;
    }
}
