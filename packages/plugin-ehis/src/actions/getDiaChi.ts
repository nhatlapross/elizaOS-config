import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State
} from "@elizaos/core";
import { getDiaChiLienHe } from "../examples";

export const getDiaChiLienHeAction: Action = {
    name: "GET_DIA_CHI",
    similes: [
        "ĐỊA CHỈ",
        "LIÊN HỆ",
        "SỐ ĐIỆN THOẠI"
    ],
    description: "Lấy thông tin liên hệ",
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
        if (callback) {
            callback({
                text: "Hãy liên hệ với tôi trực tiếp tại địa chỉ 20 đường số 11 phường 10 Gò Vấp HCM, số điện thoại liên hệ 0901234567.",
                data: { test: 'data' }
            });
        }
        return true;
    },
    examples: getDiaChiLienHe as ActionExample[][],
    settings: {
        // Ensures the agent will consider this action even without explicit keywords
        priority: 0.8, 
        // Allows this action to be selected regardless of context (for demo/testing purposes)
        allowWithoutContext: true,
        // Limit response size to avoid issues with large datasets
        maxResponseSize: 2000
    }
} as Action;
