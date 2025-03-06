import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State
} from "@elizaos/core";
import { getCosmosDataExample } from "../examples";

export const getCosmosDataAction: Action = {
    name: "GET_COSMOS_DATA",
    similes: [
        "COSMOS",
        "ORACLE",
        "PATIENT",
        "DATABASE"
    ],
    description: "Get cosmos data from oracle via API.",
    validate: async (runtime: IAgentRuntime) => {
        // Simple validation - no specific config needed since we're using an API
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        try {
            // Extract Gmail address from the message
            // This regex pattern looks for a Gmail address pattern
            const gmailPattern = /([a-zA-Z0-9._-]+@gmail\.com)/i;
            const extractedGmail = message.content?.text?.match(gmailPattern)?.[0];
            
            // You can provide a default Gmail for testing or require one to be provided
            const gmail = extractedGmail || 'nhatlapross@gmail.com';
            
            if (!gmail) {
                throw new Error("No Gmail address found or provided");
            }
            
            elizaLogger.info(`Fetching user data for Gmail: ${gmail}`);
            
            // Call your MongoDB API endpoint
            const response = await fetch(`http://localhost:4000/users/${encodeURIComponent(gmail)}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`User with Gmail ${gmail} not found`);
                }
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const userData = await response.json();
            elizaLogger.success(`Successfully fetched user data for ${gmail}`);

            if (callback) {
                // Format the response with user information
                const userInfo = userData 
                    ? `User: ${userData.name || 'Unknown'}, Level: ${userData.level || '0'}, Weight: ${userData.weight || '0'}kg`
                    : 'No user data found';
                
                callback({
                    text: `User profile: ${userInfo}`,
                    data: userData
                });
            }
            return true;
        } catch (error: any) {
            elizaLogger.error(`Error fetching user data: ${error.message}`);
            if (callback) {
                callback({
                    text: `Error fetching user data: ${error.message}. Make sure the API server is running.`
                });
            }
            return false;
        }
    },
    examples: getCosmosDataExample as ActionExample[][]
} as Action;