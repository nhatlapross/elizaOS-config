import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const mongodbEnvSchema = z.object({
    MONGODB_BACKEND_URL: z.string().min(1,"Nasa API key is required")
})

export type mongoConfig = z.infer<typeof mongodbEnvSchema>;

export async function validateMongoConfig(
    runtime: IAgentRuntime
): Promise<mongoConfig> {
    try{
        const config = {
            MONGODB_BACKEND_URL: runtime.getSetting("MONGODB_BACKEND_URL") || process.env.MONGODB_BACKEND_URL
        };
        console.log('config: ',config);
        return mongodbEnvSchema.parse(config);
    } catch (error) {
        console.log("error:::::",error);
        if (error instanceof z.ZodError) {
            const errorMessage = error.errors
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join('\n');
            throw new Error(
                `Mongodb backend url configuration validation failed:\n${errorMessage}`
            );
        }
    }
}