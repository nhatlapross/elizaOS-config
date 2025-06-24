import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State
} from "@elizaos/core";
import { getChongChiDinhThuoc } from "../examples";

export const getChongChiDinhThuocAction: Action = {
    name: "GET_CHONG_CHI_DINH_THUOC",
    similes: [
        "TƯƠNG TÁC THUỐC",
        "CHỐNG CHỈ ĐỊNH THUỐC",
        "HOẠT CHẤT",
        "KIỂM TRA THUỐC",
        "TƯƠNG TÁC HOẠT CHẤT"
    ],
    description: "Kiểm tra tương tác thuốc giữa các hoạt chất",
    validate: async () => true,
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        try {
            const text = message.content?.text || "";
            elizaLogger.info(`Xử lý yêu cầu: ${text}`);

            let hoatChat1: string | null = null;
            let hoatChat2: string | null = null;

            // New pattern for direct drug interaction queries
            const directPattern = /(?:tương\s*tác|kiểm\s*tra)\s*(?:thuốc|giữa)?\s*([A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)*?)\s+(?:và|với)\s+([A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)*)/i;
            const directMatch = text.match(directPattern);
            
            if (directMatch) {
                hoatChat1 = directMatch[1].trim();
                hoatChat2 = directMatch[2].trim();
                elizaLogger.info(`Tìm thấy cặp thuốc trực tiếp: "${hoatChat1}" và "${hoatChat2}"`);
            } else {
                // Pattern for "hoạt chất" format
                const hc1Pattern = /hoạt\s*chất\s*(?:1|một|thứ\s*nhất|thứ\s*1)?[:\s]+([A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)*?)(?:\s+(?:với|và|cùng|cùng\s+với)\s+|$|\s*[,.])/i;
                const hc2Pattern = /hoạt\s*chất\s*(?:2|hai|thứ\s*hai|thứ\s*2)[:\s]+([A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)*?)(?:\s+|$|\s*[,.])/i;

                const hc1Match = text.match(hc1Pattern);
                const hc2Match = text.match(hc2Pattern);

                if (hc1Match) {
                    hoatChat1 = hc1Match[1].trim();
                    elizaLogger.info(`Tìm thấy hoạt chất 1: "${hoatChat1}"`);
                }
                if (hc2Match) {
                    hoatChat2 = hc2Match[1].trim();
                    elizaLogger.info(`Tìm thấy hoạt chất 2: "${hoatChat2}"`);
                }

                // Pattern for "X với Y" format
                if (!hoatChat1 || !hoatChat2) {
                    const combinedPattern = /(?:hoạt\s*chất\s+)?([A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)*?)\s+(?:với|và|cùng)\s+(?:hoạt\s*chất\s+)?([A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)*)/i;
                    const combinedMatch = text.match(combinedPattern);

                    if (combinedMatch) {
                        if (!hoatChat1) hoatChat1 = combinedMatch[1].trim();
                        if (!hoatChat2) hoatChat2 = combinedMatch[2].trim();
                        elizaLogger.info(`Tìm thấy cặp hoạt chất: "${hoatChat1}" và "${hoatChat2}"`);
                    }
                }
            }

            // Validate extracted drug names
            const validateDrugName = (name: string): boolean => {
                if (!name) return false;
                // Remove common non-drug words and validate
                const cleanName = name.replace(/^(tôi|muốn|tìm|kiếm|thuốc|của|về)\s+/gi, '');
                return cleanName.length >= 3 && /^[A-Za-z0-9]+/i.test(cleanName);
            };

            if (hoatChat1) hoatChat1 = hoatChat1.replace(/^(tôi|muốn|tìm|kiếm|thuốc|của|về)\s+/gi, '');
            if (hoatChat2) hoatChat2 = hoatChat2.replace(/^(tôi|muốn|tìm|kiếm|thuốc|của|về)\s+/gi, '');

            if (!validateDrugName(hoatChat1)) {
                if (callback) {
                    callback({
                        text: "Vui lòng cung cấp tên hoạt chất hợp lệ. Ví dụ: 'Kiểm tra tương tác giữa Paracetamol và Ibuprofen'"
                    });
                }
                return false;
            }

            elizaLogger.info(`Hoạt chất đã xác nhận - hoạt chất 1: "${hoatChat1}", hoạt chất 2: "${hoatChat2 || 'không có'}"`);

            // API call
            const API_BASE_URL = 'http://localhost:6000';
            const apiUrl = `${API_BASE_URL}/api/treatments/ingredients?hoatchat1=${encodeURIComponent(hoatChat1)}${hoatChat2 ? `&hoatchat2=${encodeURIComponent(hoatChat2)}` : ''}`;

            elizaLogger.info(`Gọi API: ${apiUrl}`);

            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const interactionData = await response.json();
                return handleInteractionData(interactionData, hoatChat1, hoatChat2, callback);

            } catch (error: any) {
                elizaLogger.error(`Lỗi khi gọi API: ${error.message}`);
                if (callback) {
                    callback({
                        text: `Xin lỗi, không thể tìm thấy thông tin tương tác thuốc. Vui lòng kiểm tra lại tên hoạt chất hoặc thử lại sau.`
                    });
                }
                return false;
            }
        } catch (error: any) {
            elizaLogger.error(`Lỗi xử lý: ${error.message}`);
            if (callback) {
                callback({
                    text: `Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu: ${error.message}`
                });
            }
            return false;
        }
    },
    examples: getChongChiDinhThuoc as ActionExample[][],
    settings: {
        priority: 0.8,
        allowWithoutContext: true,
        maxResponseSize: 2000
    }
} as Action;

// Helper function to handle interaction data
function handleInteractionData(
    interactionData: any[],
    hoatChat1: string,
    hoatChat2: string | null,
    callback: HandlerCallback | null
): boolean {
    if (!interactionData || interactionData.length === 0) {
        if (callback) {
            callback({
                text: `Không tìm thấy thông tin tương tác thuốc ${hoatChat2 ? `giữa ${hoatChat1} và ${hoatChat2}` : `về ${hoatChat1}`}. Vui lòng kiểm tra lại tên hoạt chất.`
            });
        }
        return false;
    }

    let aiResponse = "";
    if (hoatChat2) {
        const data = interactionData[0];
        aiResponse = `
**Thông tin tương tác thuốc**

**Hoạt chất:** ${hoatChat1} và ${hoatChat2}

**Cơ chế tương tác:** 
${data.COCHE || "Chưa có thông tin chi tiết về cơ chế"}

**Hậu quả:** 
${data.HAUQUA || "Chưa có thông tin chi tiết về hậu quả"}

**Xử trí:** 
${data.XUTRI || "Cần thận trọng khi phối hợp hai hoạt chất này"}

**Mức độ:** ${data.MUC || "Chưa phân loại"}`;
    } else {
        aiResponse = `
**Thông tin về hoạt chất: ${hoatChat1}**

Tìm thấy ${interactionData.length} tương tác liên quan.

**Tương tác đáng chú ý:**`;

        const sortedInteractions = [...interactionData]
            .sort((a, b) => (a.MUC || 999) - (b.MUC || 999))
            .slice(0, 3);

        sortedInteractions.forEach((interaction, index) => {
            const otherHoatChat = interaction.HOATCHAT1?.includes(hoatChat1)
                ? interaction.HOATCHAT2
                : interaction.HOATCHAT1;

            aiResponse += `
${index + 1}. **Tương tác với ${otherHoatChat || "hoạt chất khác"}**
   - Cơ chế: ${interaction.COCHE || "Không có thông tin"}
   - Hậu quả: ${interaction.HAUQUA || "Không có thông tin"}
   - Xử trí: ${interaction.XUTRI || "Thận trọng khi phối hợp"}
   - Mức độ: ${interaction.MUC || "Chưa phân loại"}`;
        });
    }

    if (callback) {
        callback({
            text: aiResponse,
            data: interactionData
        });
    }
    return true;
}
