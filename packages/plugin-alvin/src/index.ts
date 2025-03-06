import { Plugin } from "@elizaos/core";
import { getAPODAction } from "./actions/getAPOD";
import { getMarsRoverAction } from "./actions/getMarsRoverPhoto";
import { getCosmosDataAction } from "./actions/getCosmosData";
import { getCosmosDataSimpleAction } from "./actions/testAction";
export const alvinPlugin: Plugin = {
    name: "alvin",
    description: "Alvin's Plugin for Eliza",
    actions: [getAPODAction, getMarsRoverAction, getCosmosDataAction],
    evaluators: [],
    providers: [],
};

export default alvinPlugin;