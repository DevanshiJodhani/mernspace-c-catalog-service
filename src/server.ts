import config from "config";
import app from "./app";
import logger from "./config/logger";
import { initDb } from "./config/db";
import { KafkaProducerBroker } from "./config/kafka";
import { MessageProducerBroker } from "./common/types/broker";

const startServer = async () => {
    const PORT: number = config.get("server.port") || 5502;
    let messageProducerBroker: MessageProducerBroker | null = null;
    try {
        await initDb();
        logger.info("Database connected successfully.");

        // connect to kafka
        messageProducerBroker = new KafkaProducerBroker("clatalog-service", [
            config.get("kafka.broker"),
        ]);

        await messageProducerBroker.connect();

        app.listen(PORT, () => logger.info(`Listening on port ${PORT}`));
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (messageProducerBroker) {
                await messageProducerBroker.disconnect();
            }

            logger.error(err.message);
            logger.on("finish", () => {
                process.exit(1);
            });
        }
    }
};

void startServer();
