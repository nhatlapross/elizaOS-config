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

export const getMarsRoverAction: Action = {
    name: "NASA_GET_MARS_ROVER_PHOTO",
    similes: [
        "MARS",
        "MARTIAN",
        "MARS PHOTO"
    ],
    description:"Get a random Nasa Mars Rover Photo.",
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
            const MarsRoverData = await nasaService.getMarsRoverPhoto();
            elizaLogger.success(`Successfully fetched Mars Rover Photo`);
            if(callback){
                callback({
                    text:`Here is a random Mars Rover Photo: ${MarsRoverData.rover} on day ${MarsRoverData.sol}
                    from the ${MarsRoverData.camera} camera.
                    ${MarsRoverData.photo}
                    `
                });
                return true;
            }
        } catch(error:any){
            elizaLogger.error(`Failed to fetch Mars Rover Photo: ${error.message}`);
            if(callback){
                callback({
                    text:`Failed to fetch Mars Rover Photo: ${error.message}`
                });
                return false;
            }
        }
    },
    examples: getMarsRoverExample as ActionExample[][]
} as Action;