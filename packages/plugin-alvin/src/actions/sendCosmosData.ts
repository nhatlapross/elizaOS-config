import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State
} from "@elizaos/core";
import { sendCosmosDataExample } from "../examples";

export const createUserAction: Action = {
    name: "ORACLE_SEND_COSMOS_DATA",
    similes: [
        "CREATE USER",
        "REGISTER USER",
        "ADD USER",
        "NEW USER",
        "SIGN UP"
    ],
    description: "Create a new user with the provided information",
    validate: async () => {
        // No specific validation needed for this action
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
            const text = message.content?.text || "";
            
            // Extract information from the message using regex patterns
            const nameMatch = text.match(/name\s+(\w+)/i);
            const emailMatch = text.match(/email\s+([^\s,]+@[^\s,]+)/i) || text.match(/([^\s,]+@[^\s,]+)/);
            const genderMatch = text.match(/gender\s+(male|female|other)/i);
            const ageMatch = text.match(/age\s+(\d+)/i);
            const weightMatch = text.match(/weight\s+(\d+(?:\.\d+)?)/i);
            const heightMatch = text.match(/height\s+(\d+(?:\.\d+)?)/i);
            const walletMatch = text.match(/wallet\s+(0x[a-fA-F0-9]+)/i);

            // Check if we have at least an email
            if (!emailMatch) {
                if (callback) {
                    callback({
                        text: "I need at least an email address to create a user. Please provide an email address."
                    });
                }
                return false;
            }

            const name = nameMatch ? nameMatch[1] : "";
            const email = emailMatch[1];
            const gender = genderMatch ? genderMatch[1].toLowerCase() : "other";
            const age = ageMatch ? ageMatch[1] : "0";
            const weight = weightMatch ? weightMatch[1] : "0";
            const height = heightMatch ? heightMatch[1] : "0";
            const wallet = walletMatch ? walletMatch[1] : "0x0";

            // Create user object
            const newUser = {
                name: name || "",
                email,
                gender: gender || "other",
                age: age || "0",
                level: "0",
                weight: weight || "0",
                height: height || "0",
                exercise_completed: "0",
                calories_burned: "0",
                point: "0",
                token: "0",
                wallet: wallet || "0x0"
            };

            elizaLogger.info(`Creating new user: ${JSON.stringify(newUser)}`);

            // Call the API to create the user
            const response = await fetch('http://localhost:4000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(`API request failed with status ${response.status}: ${errorData ? JSON.stringify(errorData) : ''}`);
            }

            const userData = await response.json();
            elizaLogger.success(`Successfully created user with ID: ${userData.id || 'unknown'}`);

            if (callback) {
                callback({
                    text: `Successfully created a new user with email ${email}${name ? ` and name ${name}` : ''}. The user has been registered in our system.`,
                    data: userData
                });
            }
            return true;
        } catch (error: any) {
            elizaLogger.error(`Error creating user: ${error.message}`);
            if (callback) {
                callback({
                    text: `Sorry, I couldn't create the user. Error: ${error.message}`
                });
            }
            return false;
        }
    },
    examples: sendCosmosDataExample as ActionExample[][]
} as Action;