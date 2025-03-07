import { Plugin } from "@elizaos/core";
import { getAPODAction } from "./actions/getAPOD";
import { getMarsRoverAction } from "./actions/getMarsRoverPhoto";
import { getCosmosDataAction } from "./actions/getCosmosData";
import { createUserAction } from "./actions/sendCosmosData";
export const alvinPlugin: Plugin = {
    name: "alvin",
    description: "Alvin's Plugin for Eliza",
    actions: [getAPODAction, getMarsRoverAction, getCosmosDataAction,createUserAction],
    evaluators: [],
    providers: [],
};

export default alvinPlugin;