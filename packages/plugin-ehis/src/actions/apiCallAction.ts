import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State
} from "@elizaos/core";

export const apiCallAction: Action = {
    name: "API_CALL_WITH_BEARER",
    similes: [
        "API_CALL_WITH_BEARER",
        "GỌI API",
        "CALL API", 
        "FETCH DATA",
        "LẤY THÔNG TIN API",
        "PHÒNG KHÁM ARV",
        "DANH SÁCH PHÒNG KHÁM ARV",
        "MÃ KHOA PHÒNG ARV",
        "GET PHONG KHAM ARV",
        "THÔNG SỐ HỆ THỐNG",
        "API THONG SO",
        "TRUY CẬP API"
    ],
    description: "Gọi API với bearer token để lấy mã khoa phòng từ hệ thống y tế",
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = message.content?.text?.toLowerCase() || "";
        
        const specificApiKeywords = [
            'phòng khám arv',
            'phong kham arv', 
            'danh sách phòng khám arv',
            'danh sach phong kham arv',
            'lấy danh sách pk arv',
            'lay danh sach pk arv',
            'mã khoa phòng arv',
            'ma khoa phong arv',
            'cho tôi mã khoa phòng arv',
            'cho toi ma khoa phong arv',
            'api thongso',
            'api thông số',
            'getphongkhamarv',
            'get phong kham arv'
        ];
        
        const hasSpecificKeyword = specificApiKeywords.some(keyword => text.includes(keyword));
        
        // Check if text is JSON with apiCallRequest
        let hasApiRequestInJson = false;
        try {
            const parsed = JSON.parse(text);
            hasApiRequestInJson = parsed && parsed.apiCallRequest;
        } catch (e) {
            // Not JSON, that's fine
        }
        
        return hasSpecificKeyword || hasApiRequestInJson;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        try {
            const messageText = message.content?.text || "";
            let apiCallRequest = null;
            let originalText = messageText;
            
            // Check if text is JSON containing apiCallRequest
            try {
                const parsed = JSON.parse(messageText);
                if (parsed && parsed.apiCallRequest) {
                    apiCallRequest = parsed.apiCallRequest;
                    originalText = parsed.text || messageText;
                }
            } catch (e) {
                // Text is not JSON, try other methods
            }
            
            // Fallback: try other locations
            if (!apiCallRequest) {
                if (message.content && typeof message.content === 'object' && 'apiCallRequest' in message.content) {
                    apiCallRequest = (message.content as any).apiCallRequest;
                }
                else if (message && 'apiCallRequest' in message) {
                    apiCallRequest = (message as any).apiCallRequest;
                }
            }
            
            // Final fallback: detect from text
            if (!apiCallRequest) {
                apiCallRequest = detectApiRequestFromText(originalText);
                if (apiCallRequest) {
                    if (callback) {
                        callback({
                            text: "Tôi cần thông tin xác thực để truy cập hệ thống. Vui lòng đảm bảo bạn đã đăng nhập."
                        });
                    }
                    return true;
                }
            }
            
            if (!apiCallRequest) {
                if (callback) {
                    callback({
                        text: "Không thể xác định yêu cầu API. Vui lòng thử lại hoặc liên hệ hỗ trợ."
                    });
                }
                return false;
            }

            const { endpoint, method, bearerToken, data, headers } = apiCallRequest;
            
            if (!endpoint || !bearerToken) {
                if (callback) {
                    callback({
                        text: "Thiếu thông tin cần thiết để thực hiện yêu cầu. Vui lòng đăng nhập lại."
                    });
                }
                return false;
            }

            // Prepare headers
            const requestHeaders: { [key: string]: string } = {
                'Authorization': `Bearer ${bearerToken}`,
                'Accept': '*/*',
                'Content-Type': 'application/json',
                ...headers
            };

            const requestOptions: RequestInit = {
                method: method || 'GET',
                headers: requestHeaders
            };

            if ((method === 'POST' || method === 'PUT') && data) {
                requestOptions.body = JSON.stringify(data);
            }

            try {
                const response = await fetch(endpoint, requestOptions);
                
                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }

                const responseText = await response.text();
                const formattedResponse = formatDepartmentCodesResponse(responseText, endpoint);

                if (callback) {
                    callback({
                        text: formattedResponse,
                        data: responseText
                    });
                }
                
                return true;

            } catch (apiError: any) {
                let errorMessage = "Có lỗi xảy ra khi truy cập hệ thống. ";
                
                if (apiError.message.includes('401')) {
                    errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
                } else if (apiError.message.includes('403')) {
                    errorMessage = "Không có quyền truy cập. Vui lòng kiểm tra phân quyền.";
                } else if (apiError.message.includes('404')) {
                    errorMessage = "Không tìm thấy dữ liệu yêu cầu.";
                } else if (apiError.message.includes('fetch')) {
                    errorMessage = "Không thể kết nối đến hệ thống. Vui lòng thử lại sau.";
                }
                
                if (callback) {
                    callback({
                        text: errorMessage
                    });
                }
                return false;
            }

        } catch (error: any) {
            if (callback) {
                callback({
                    text: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau."
                });
            }
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Lấy danh sách phòng khám ARV"
                }
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Tôi sẽ lấy mã khoa phòng ARV từ hệ thống cho bạn.",
                    action: "API_CALL_WITH_BEARER"
                }
            }
        ]
    ] as ActionExample[][],
    settings: {
        priority: 1.0,
        allowWithoutContext: true,
        maxResponseSize: 5000
    }
} as Action;

// Fallback detection
function detectApiRequestFromText(text: string): any | null {
    const lowerText = text.toLowerCase();
    const baseUrl = 'http://localhost:5284';
    
    if (lowerText.includes('phòng khám arv') || lowerText.includes('phong kham arv') ||
        lowerText.includes('mã khoa phòng arv') || lowerText.includes('ma khoa phong arv')) {
        return {
            endpoint: `${baseUrl}/api/ThongSo/GetPhongKhamARV`,
            method: 'GET',
            bearerToken: '',
        };
    }
    
    if (lowerText.includes('thông số') || lowerText.includes('thong so')) {
        return {
            endpoint: `${baseUrl}/api/ThongSo`,
            method: 'GET',
            bearerToken: '',
        };
    }
    
    return null;
}

// Format response
function formatDepartmentCodesResponse(responseText: string, endpoint: string): string {
    if (!responseText || responseText.trim() === '') {
        return "Không có dữ liệu trả về từ hệ thống.";
    }

    const cleanedText = responseText.replace(/"/g, '').trim();
    
    if (endpoint.includes('PhongKhamARV')) {
        return formatPhongKhamARVCodes(cleanedText);
    } else if (endpoint.includes('ThongSo')) {
        return formatThongSoCodes(cleanedText);
    } else {
        return formatGenericCodes(cleanedText, endpoint);
    }
}

function formatPhongKhamARVCodes(codes: string): string {
    if (!codes) {
        return "Không có mã phòng khám ARV nào.";
    }

    const codeArray = codes.split(',')
        .map(code => code.trim())
        .filter(code => code.length > 0);

    if (codeArray.length === 0) {
        return "Không có mã phòng khám ARV hợp lệ.";
    }

    let response = "**Mã các phòng khám ARV:**\n\n";
    
    codeArray.forEach((code, index) => {
        response += `🏥 **Phòng ${index + 1}:** \`${code}\`\n`;
    });
    
    response += `\n📊 **Tổng cộng:** ${codeArray.length} phòng khám ARV`;
    
    return response;
}

function formatThongSoCodes(codes: string): string {
    if (!codes) {
        return "Không có mã thông số nào.";
    }

    const codeArray = codes.split(',')
        .map(code => code.trim())
        .filter(code => code.length > 0);

    if (codeArray.length === 0) {
        return "Không có mã thông số hợp lệ.";
    }

    let response = "**Mã thông số hệ thống:**\n\n";
    
    codeArray.forEach((code, index) => {
        response += `📋 **Thông số ${index + 1}:** \`${code}\`\n`;
    });
    
    response += `\n📊 **Tổng cộng:** ${codeArray.length} thông số`;
    
    return response;
}

function formatGenericCodes(codes: string, endpoint: string): string {
    const endpointName = endpoint.split('/').pop() || 'API';
    
    if (!codes) {
        return `Không có dữ liệu từ ${endpointName}.`;
    }

    const codeArray = codes.split(',')
        .map(code => code.trim())
        .filter(code => code.length > 0);

    if (codeArray.length === 0) {
        return `Không có mã hợp lệ từ ${endpointName}.`;
    }

    if (codeArray.length === 1) {
        return `**Kết quả từ ${endpointName}:** \`${codeArray[0]}\``;
    }

    let response = `**Danh sách mã từ ${endpointName}:**\n\n`;
    
    codeArray.forEach((code, index) => {
        response += `📄 **Mã ${index + 1}:** \`${code}\`\n`;
    });
    
    response += `\n📊 **Tổng cộng:** ${codeArray.length} mã`;
    
    return response;
}