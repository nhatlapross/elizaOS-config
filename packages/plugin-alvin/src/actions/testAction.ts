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
import { getMarsRoverExample } from "../examples";
import { createNASAService } from "../service";

export const getCosmosDataSimpleAction: Action = {
    name: "NASA_GET_COSMOS_DATA",
    similes: ["COSMOS SIMPLE"],
    description: "Get cosmos data directly.",
    validate: async () => true,
    handler: async (runtime, message, state, options, callback) => {
        if (callback) {
            callback({
                text: "Simple cosmos data: { test: 'data' }",
                data: { test: 'data' }
            });
        }
        return true;
    },
    examples: [[
        {
            user: "{{user1}}",
            content: { text: "get simple cosmos" }
        },
        {
            user: "Astro",
            content: {
                text: "Here's simple cosmos data.",
                action: "NASA_GET_COSMOS_DATA"
            }
        }
    ]]
};