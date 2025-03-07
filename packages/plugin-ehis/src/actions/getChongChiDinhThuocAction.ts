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
            elizaLogger.info(`Xử lý yêu cầu: ${text}`);
            
            // Cải thiện cách trích xuất hoạt chất
            let hoatChat1: string | null = null;
            let hoatChat2: string | null = null;
            
            // PHƯƠNG PHÁP CẢI TIẾN: Sử dụng regex chính xác hơn
            // Pattern cho hoạt chất 1 - lấy chính xác chỉ tên hoạt chất, không lấy phần "với hoạt chất 2"
            const hc1Pattern = /hoạt\s*chất\s*(?:1|một|thứ\s*nhất|thứ\s*1)[:\s]+([^,\s]+(?:\s+[^,\s]+)*?)(?:\s+(?:với|và|cùng|cùng\s+với)\s+hoạt\s*chất|$|\s*[,.])/i;
            const hc2Pattern = /hoạt\s*chất\s*(?:2|hai|thứ\s*hai|thứ\s*2)[:\s]+([^,\s]+(?:\s+[^,\s]+)*?)(?:\s+|$|\s*[,.])/i;
            
            const hc1Match = text.match(hc1Pattern);
            const hc2Match = text.match(hc2Pattern);
            
            // Log kết quả match để debug
            if (hc1Match) {
                elizaLogger.info(`Match hoạt chất 1: "${hc1Match[1]}"`);
                hoatChat1 = hc1Match[1].trim();
            }
            
            if (hc2Match) {
                elizaLogger.info(`Match hoạt chất 2: "${hc2Match[1]}"`);
                hoatChat2 = hc2Match[1].trim();
            }
            
            // Phương pháp 2: Tìm kiếm theo cấu trúc "X với Y" hoặc "X và Y"
            if (!hoatChat1 || !hoatChat2) {
                // Pattern cải tiến, lấy chính xác X và Y trong "X với Y"
                const combinedPattern = /(?:hoạt\s*chất\s+)?([^,\s]+(?:\s+[^,\s]+)*?)\s+(?:với|và|cùng|cùng\s+với)\s+(?:hoạt\s*chất\s+)?([^,\s]+(?:\s+[^,\s]+)*?)(?:\s+|$|\s*[,.])/i;
                const combinedMatch = text.match(combinedPattern);
                
                if (combinedMatch) {
                    elizaLogger.info(`Match cặp hoạt chất: "${combinedMatch[1]}" và "${combinedMatch[2]}"`);
                    if (!hoatChat1) hoatChat1 = combinedMatch[1].trim();
                    if (!hoatChat2) hoatChat2 = combinedMatch[2].trim();
                }
            }
            
            // Phương pháp 3: Tìm bất kỳ hoạt chất nào được đề cập
            if (!hoatChat1) {
                const anyHcPattern = /hoạt\s*chất\s+([^,\s]+(?:\s+[^,\s]+)*?)(?:\s+|$|\s*[,.])/i;
                const anyHcMatch = text.match(anyHcPattern);
                
                if (anyHcMatch) {
                    elizaLogger.info(`Match hoạt chất bất kỳ: "${anyHcMatch[1]}"`);
                    hoatChat1 = anyHcMatch[1].trim();
                }
            }
            
            // Phương pháp 4: Chỉ tìm tên thuốc nếu không có từ "hoạt chất"
            if (!hoatChat1 && !text.toLowerCase().includes("hoạt chất")) {
                // Giả định rằng có thể là tên thuốc trực tiếp
                const words = text.split(/\s+/);
                
                // Tìm các từ có thể là tên thuốc (viết hoa hoặc có ít nhất 5 ký tự)
                const potentialDrugs = words.filter(word => 
                    word.length >= 5 && 
                    !/^(kiểm|tra|tương|tác|thuốc|của|với|và|cùng|làm|sao|bệnh|thông|tin|về|gì|như|thế|nào)$/i.test(word)
                );
                
                if (potentialDrugs.length >= 2) {
                    hoatChat1 = potentialDrugs[0].replace(/[,.?!;:]/g, '');
                    hoatChat2 = potentialDrugs[1].replace(/[,.?!;:]/g, '');
                    elizaLogger.info(`Tìm thấy các thuốc tiềm năng: "${hoatChat1}" và "${hoatChat2}"`);
                } else if (potentialDrugs.length === 1) {
                    hoatChat1 = potentialDrugs[0].replace(/[,.?!;:]/g, '');
                    elizaLogger.info(`Tìm thấy thuốc tiềm năng: "${hoatChat1}"`);
                }
            }
            
            // Kiểm tra lại tên hoạt chất (tránh trích xuất sai)
            if (hoatChat1 && (hoatChat1.includes("với") || hoatChat1.includes("và") || hoatChat1.includes("cùng"))) {
                const cleanedPattern = /^(.*?)(?:\s+(?:với|và|cùng))/i;
                const cleanedMatch = hoatChat1.match(cleanedPattern);
                if (cleanedMatch) {
                    elizaLogger.info(`Làm sạch hoạt chất 1 từ "${hoatChat1}" thành "${cleanedMatch[1]}"`);
                    hoatChat1 = cleanedMatch[1].trim();
                }
            }
            
            // Kiểm tra nếu chúng ta đã tìm được ít nhất một hoạt chất
            if (!hoatChat1) {
                if (callback) {
                    callback({
                        text: "Vui lòng cung cấp ít nhất một hoạt chất để kiểm tra tương tác thuốc. Ví dụ: 'Kiểm tra tương tác của hoạt chất Domperidon' hoặc 'Tương tác giữa Domperidon và Methadon'"
                    });
                }
                return false;
            }

            elizaLogger.info(`Kiểm tra tương tác thuốc: hoạt chất 1 = ${hoatChat1}${hoatChat2 ? `, hoạt chất 2 = ${hoatChat2}` : ''}`);

            // Cập nhật cổng API để khớp với server của bạn
            const API_BASE_URL = 'http://localhost:6000';

            // Sử dụng phương thức tìm kiếm phù hợp dựa trên số lượng hoạt chất
            let apiUrl: string;
            
            if (hoatChat1 && hoatChat2) {
                // Tìm kiếm với cả hai hoạt chất
                apiUrl = `${API_BASE_URL}/api/treatments/ingredients?hoatchat1=${encodeURIComponent(hoatChat1)}&hoatchat2=${encodeURIComponent(hoatChat2)}`;
            } else {
                // Tìm kiếm với một hoạt chất
                apiUrl = `${API_BASE_URL}/api/treatments/ingredients?hoatchat1=${encodeURIComponent(hoatChat1)}`;
            }
            
            elizaLogger.info(`Gọi API: ${apiUrl}`);
            
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                // Kiểm tra phản hồi
                if (!response.ok) {
                    let errorMessage: string;
                    try {
                        const errorData = await response.json();
                        errorMessage = JSON.stringify(errorData);
                    } catch (e) {
                        errorMessage = `Status ${response.status}`;
                    }
                    
                    elizaLogger.warn(`API đầu tiên thất bại: ${errorMessage}. Thử phương pháp khác.`);
                    
                    // Thử phương pháp tìm kiếm khác nếu phương pháp đầu tiên thất bại
                    if (hoatChat1 && hoatChat2) {
                        const fallbackUrl = `${API_BASE_URL}/api/search?hoatchat1=${encodeURIComponent(hoatChat1)}&hoatchat2=${encodeURIComponent(hoatChat2)}`;
                        elizaLogger.info(`Gọi API dự phòng: ${fallbackUrl}`);
                        
                        const fallbackResponse = await fetch(fallbackUrl, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        });
                        
                        if (!fallbackResponse.ok) {
                            throw new Error(`Không thể tìm thấy thông tin tương tác thuốc (${fallbackResponse.status})`);
                        }
                        
                        const interactionData = await fallbackResponse.json();
                        return handleInteractionData(interactionData, hoatChat1, hoatChat2, callback);
                    } else {
                        // Thử tìm kiếm tổng quát với hoạt chất 1
                        const generalSearchUrl = `${API_BASE_URL}/api/search?hoatchat1=${encodeURIComponent(hoatChat1)}`;
                        elizaLogger.info(`Gọi API tìm kiếm tổng quát: ${generalSearchUrl}`);
                        
                        const generalResponse = await fetch(generalSearchUrl, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        });
                        
                        if (!generalResponse.ok) {
                            throw new Error(`Không thể tìm thấy thông tin về hoạt chất (${generalResponse.status})`);
                        }
                        
                        const interactionData = await generalResponse.json();
                        return handleInteractionData(interactionData, hoatChat1, null, callback);
                    }
                }

                const interactionData = await response.json();
                return handleInteractionData(interactionData, hoatChat1, hoatChat2, callback);
                
            } catch (error: any) {
                elizaLogger.error(`Lỗi khi gọi API: ${error.message}`);
                if (callback) {
                    callback({
                        text: `Xin lỗi, tôi không thể lấy thông tin tương tác thuốc. Lỗi kết nối: ${error.message}`
                    });
                }
                return false;
            }
        } catch (error: any) {
            elizaLogger.error(`Lỗi tổng thể khi kiểm tra tương tác thuốc: ${error.message}`);
            if (callback) {
                callback({
                    text: `Xin lỗi, đã xảy ra lỗi khi kiểm tra tương tác thuốc: ${error.message}`
                });
            }
            return false;
        }
    },
    examples: getChongChiDinhThuoc as ActionExample[][],
    settings: {
        // Ensures the agent will consider this action even without explicit keywords
        priority: 0.8, 
        // Allows this action to be selected regardless of context (for demo/testing purposes)
        allowWithoutContext: true,
        // Limit response size to avoid issues with large datasets
        maxResponseSize: 2000
    }
} as Action;

// Hàm xử lý dữ liệu tương tác và tạo phản hồi
function handleInteractionData(
    interactionData: any[], 
    hoatChat1: string, 
    hoatChat2: string | null,
    callback: HandlerCallback | null
): boolean {
    if (!interactionData || interactionData.length === 0) {
        if (callback) {
            callback({
                text: `Không tìm thấy thông tin tương tác thuốc ${hoatChat2 ? `giữa ${hoatChat1} và ${hoatChat2}` : `về ${hoatChat1}`}. Vui lòng kiểm tra lại tên hoạt chất hoặc thử với hoạt chất khác.`
            });
        }
        return false;
    }
    
    // Format the AI response
    let aiResponse = "";
    
    if (hoatChat2) {
        // Response for interaction between two active ingredients
        const data = interactionData[0]; // Take first interaction found
        
        aiResponse = `
**Thông tin tương tác thuốc**

**Hoạt chất:** ${hoatChat1} và ${hoatChat2}

**Cơ chế tương tác:** 
${data.COCHE || "Chưa có thông tin chi tiết về cơ chế"}

**Hậu quả:** 
${data.HAUQUA || "Chưa có thông tin chi tiết về hậu quả"}

**Xử trí:** 
${data.XUTRI || "Cần thận trọng khi phối hợp hai hoạt chất này. Tham khảo ý kiến dược sĩ hoặc bác sĩ trước khi sử dụng."}

**Mức độ:** ${data.MUC || "Chưa phân loại"}
`;
    } else {
        // Response for single active ingredient
        aiResponse = `
**Thông tin về hoạt chất: ${hoatChat1}**

Tìm thấy ${interactionData.length} tương tác liên quan đến ${hoatChat1}.

**Tương tác đáng chú ý:**
`;
        
        // Get up to 3 most important interactions (lowest MUC value indicates higher importance)
        const sortedInteractions = [...interactionData].sort((a, b) => {
            return (a.MUC || 999) - (b.MUC || 999);
        }).slice(0, 3);
        
        sortedInteractions.forEach((interaction, index) => {
            const otherHoatChat = 
                interaction.HOATCHAT1 && interaction.HOATCHAT1.includes(hoatChat1) 
                    ? interaction.HOATCHAT2 
                    : interaction.HOATCHAT1;
            
            aiResponse += `
${index + 1}. **Tương tác với ${otherHoatChat || "hoạt chất khác"}**
   - Cơ chế: ${interaction.COCHE || "Không có thông tin"}
   - Hậu quả: ${interaction.HAUQUA || "Không có thông tin"}
   - Xử trí: ${interaction.XUTRI || "Thận trọng khi phối hợp"}
   - Mức độ: ${interaction.MUC || "Chưa phân loại"}
`;
        });
        
        aiResponse += `
Để biết thêm chi tiết về một tương tác cụ thể, vui lòng hỏi về tương tác giữa ${hoatChat1} và một hoạt chất cụ thể khác.
`;
    }
    
    elizaLogger.success(`Đã tìm thấy thông tin tương tác thuốc.`);

    if (callback) {
        callback({
            text: aiResponse,
            data: interactionData
        });
    }
    return true;
}