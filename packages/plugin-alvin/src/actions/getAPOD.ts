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
import { getAPODExample } from "../examples";
import { createNASAService } from "../service";

export const getAPODAction: Action = {
    name: "NASA_GET_APOD",
    similes: [
        "ASTRONOMY",
        "SPACE",
        "PLANETS"
    ],
    description:"Get the Nasa Astronomy Picture of the Day.",
    validate: async (runtime: IAgentRuntime) => {
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
        const config = await validateNasaConfig(runtime);
        const nasaService = createNASAService(config.NASA_API_KEY);
        try{
            const APODData = await nasaService.getAPOD();
            elizaLogger.success(`Successfully fetched APOD`);
            if(callback){
                callback({
                    text:`Here is the NASA Astronomy Picture of the Day: ${APODData.url}`
                });
                return true;
            }
        } catch(error:any){
            elizaLogger.error(`Error in NASA plugin handler: ${error.message}`);
            if(callback){
                callback({
                    text:`Failed to fetch APOD: ${error.message}`
                });
                return false;
            }
        }
    },
    examples: getAPODExample as ActionExample[][]
} as Action;