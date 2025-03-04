import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State
 } from "@elizaos/core";
import { validateNasaConfig } from "../environment";
import { getCosmosDataExample } from "../examples";
import { createNASAService } from "../service";

export const getCosmosDataAction: Action = {
    name: "ORACLE_GET_COSMOS_DATA",
    priority:100,
    similes: [
        "COSMOS",
        "ORACLE",
        "GET COSMOS",
        "SHOW COSMOS",
        "FETCH COSMOS",
        "COSMOS DATA",
        "ORACLE DATA"
    ],
    description: "Get cosmos data from oracle.",
    validate: async (runtime: IAgentRuntime) => {
        console.log("GET_COSMOS_DATA validation triggered");
        await validateNasaConfig(runtime);
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        console.log("GET_COSMOS_DATA validation triggered");
        const config = await validateNasaConfig(runtime);
        const nasaService = createNASAService(config.NASA_API_KEY);
        try {
            const cosmosData = await nasaService.getCosmosData();
            elizaLogger.success(`Successfully fetched data from Oracle`);

            if (callback) {
                callback({
                    text: `Your cosmos data: ${JSON.stringify(cosmosData)}`,
                    data: cosmosData
                });
            }
            return true;
        } catch (error: any) {
            elizaLogger.error(`Error connecting to Oracle: ${error.message}`);
            if (callback) {
                callback({
                    text: `Error connecting to Oracle: ${error.message}`
                });
            }
            return false;
        }
    },
    examples: getCosmosDataExample as ActionExample[][]
} as Action;