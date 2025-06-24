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
        "GET_DIA_CHI",
        "ĐỊA CHỈ LIÊN HỆ",
        "LIÊN HỆ",
        "SỐ ĐIỆN THOẠI LIÊN HỆ",
        "THÔNG TIN LIÊN HỆ",
        "CONTACT INFO",
        "PHONE NUMBER",
        "ADDRESS"
    ],
    description: "Lấy thông tin liên hệ của bác sĩ",
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = message.content?.text?.toLowerCase() || "";
        
        elizaLogger.info(`DIA_CHI Action validation for: "${text}"`);
        
        // Very specific keywords for contact info only
        const contactKeywords = [
            'địa chỉ liên hệ',
            'dia chi lien he',
            'thông tin liên hệ',
            'thong tin lien he',
            'số điện thoại liên hệ',
            'so dien thoai lien he',
            'liên hệ với bạn',
            'lien he voi ban',
            'cho tôi địa chỉ',
            'cho toi dia chi',
            'contact',
            'phone number'
        ];
        
        // MUST NOT match if it contains ARV keywords
        const arvKeywords = [
            'phòng khám arv',
            'phong kham arv',
            'arv',
            'danh sách'
        ];
        
        const hasContactKeyword = contactKeywords.some(keyword => text.includes(keyword));
        const hasArvKeyword = arvKeywords.some(keyword => text.includes(keyword));
        
        // Only match if has contact keyword AND no ARV keyword
        const shouldMatch = hasContactKeyword && !hasArvKeyword;
        
        elizaLogger.info(`DIA_CHI validation: hasContact=${hasContactKeyword}, hasArv=${hasArvKeyword}, shouldMatch=${shouldMatch}`);
        
        return shouldMatch;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        elizaLogger.info('GET_DIA_CHI: Starting handler');
        
        if (callback) {
            callback({
                text: "📍 **Thông tin liên hệ bác sĩ Ehis:**\n\n🏠 **Địa chỉ:** 20 đường số 11, phường 10, Gò Vấp, TP.HCM\n📞 **Số điện thoại:** 0901234567\n\n💡 Bạn có thể liên hệ trực tiếp theo thông tin trên để được tư vấn y tế.",
                data: { 
                    address: "20 đường số 11 phường 10 Gò Vấp HCM",
                    phone: "0901234567"
                }
            });
        }
        return true;
    },
    examples: getDiaChiLienHe as ActionExample[][],
    settings: {
        priority: 0.7, // Lower priority than API action
        allowWithoutContext: true,
        maxResponseSize: 1000
    }
} as Action;