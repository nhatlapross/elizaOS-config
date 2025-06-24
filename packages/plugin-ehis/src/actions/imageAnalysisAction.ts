import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State
} from "@elizaos/core";

export const imageAnalysisAction: Action = {
    name: "ANALYZE_MEDICAL_IMAGE",
    similes: [
        "ANALYZE_MEDICAL_IMAGE",
        "PHÂN TÍCH HÌNH ẢNH Y TẾ",
        "ĐỌC HÌNH ẢNH",
        "CHẨN ĐOÁN HÌNH ẢNH",
        "XEM KỀT QUẢ",
        "PHÂN TÍCH X-RAY",
        "PHÂN TÍCH CT SCAN",
        "PHÂN TÍCH MRI",
        "PHÂN TÍCH SIÊU ÂM",
        "IMAGE_ANALYSIS",
        "MEDICAL_IMAGING"
    ],
    description: "Phân tích hình ảnh y tế sử dụng Google Gemini Vision",
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = message.content?.text?.toLowerCase() || "";
        
        // Check for image analysis keywords
        const imageKeywords = [
            'phân tích hình ảnh',
            'phan tich hinh anh',
            'đọc hình ảnh',
            'doc hinh anh',
            'chẩn đoán hình ảnh',
            'chan doan hinh anh',
            'xem kết quả',
            'xem ket qua',
            'phân tích x-ray',
            'phân tích ct',
            'phân tích mri',
            'phân tích siêu âm',
            'hình ảnh y tế',
            'hinh anh y te'
        ];
        
        const hasImageKeyword = imageKeywords.some(keyword => text.includes(keyword));
        
        // Check if message contains images
        let hasImages = false;
        try {
            if (typeof message.content?.text === 'string') {
                const parsed = JSON.parse(message.content.text);
                hasImages = parsed && parsed.images && Array.isArray(parsed.images) && parsed.images.length > 0;
            }
        } catch (e) {
            // Not JSON, check other ways
            if (message.content && typeof message.content === 'object') {
                hasImages = 'images' in message.content && Array.isArray((message.content as any).images);
            }
        }
        
        return hasImageKeyword || hasImages;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        try {
            elizaLogger.info("Starting medical image analysis");
            
            let messageText = "";
            let images: string[] = [];
            let apiCallRequest = null;
            
            // Parse message content
            try {
                if (typeof message.content?.text === 'string') {
                    const parsed = JSON.parse(message.content.text);
                    messageText = parsed.text || "";
                    images = parsed.images || [];
                    apiCallRequest = parsed.apiCallRequest;
                } else {
                    messageText = message.content?.text || "";
                    if (message.content && typeof message.content === 'object' && 'images' in message.content) {
                        images = (message.content as any).images || [];
                    }
                }
            } catch (e) {
                messageText = message.content?.text || "";
            }
            
            if (!images || images.length === 0) {
                if (callback) {
                    callback({
                        text: "Vui lòng tải lên hình ảnh y tế để tôi có thể phân tích. Tôi có thể hỗ trợ phân tích X-quang, CT scan, MRI, siêu âm và các hình ảnh y tế khác."
                    });
                }
                return false;
            }
            
            elizaLogger.info(`Analyzing ${images.length} medical images`);
            
            // Get Google API key
            const googleApiKey = runtime.getSetting("GOOGLE_GENERATIVE_AI_API_KEY") || 
                                process.env.GOOGLE_GENERATIVE_AI_API_KEY;
            
            if (!googleApiKey) {
                elizaLogger.error("Google API key not found");
                if (callback) {
                    callback({
                        text: "Xin lỗi, không thể phân tích hình ảnh do thiếu cấu hình API. Vui lòng liên hệ quản trị viên."
                    });
                }
                return false;
            }
            
            // Prepare images for Gemini
            const processedImages = images.map(image => {
                // Remove data URL prefix if present
                const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
                return {
                    inlineData: {
                        data: base64Data,
                        mimeType: detectMimeType(image)
                    }
                };
            });
            
            // Create analysis prompt
            const analysisPrompt = createMedicalAnalysisPrompt(messageText, images.length);
            
            // Call Gemini Vision API
            const geminiResponse = await callGeminiVisionAPI(googleApiKey, analysisPrompt, processedImages);
            
            if (geminiResponse) {
                elizaLogger.info("Successfully analyzed medical images");
                
                // Format response for medical context
                const formattedResponse = formatMedicalAnalysisResponse(geminiResponse, images.length);
                
                if (callback) {
                    callback({
                        text: formattedResponse,
                        data: {
                            analysis: geminiResponse,
                            imageCount: images.length,
                            timestamp: new Date().toISOString()
                        }
                    });
                }
                return true;
            } else {
                throw new Error("Failed to get response from Gemini API");
            }
            
        } catch (error: any) {
            elizaLogger.error(`Medical image analysis error: ${error.message}`);
            
            let errorMessage = "Xin lỗi, không thể phân tích hình ảnh. ";
            
            if (error.message.includes('API key')) {
                errorMessage = "Lỗi xác thực API. Vui lòng liên hệ quản trị viên.";
            } else if (error.message.includes('quota')) {
                errorMessage = "Đã vượt quá giới hạn sử dụng API. Vui lòng thử lại sau.";
            } else if (error.message.includes('image')) {
                errorMessage = "Hình ảnh không hợp lệ hoặc không thể xử lý. Vui lòng thử với hình ảnh khác.";
            } else {
                errorMessage += "Vui lòng thử lại sau.";
            }
            
            if (callback) {
                callback({
                    text: errorMessage
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
                    text: "Phân tích hình ảnh X-quang này giúp tôi"
                }
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Tôi sẽ phân tích hình ảnh X-quang cho bạn. Vui lòng tải lên hình ảnh để tôi có thể đưa ra nhận xét chuyên môn.",
                    action: "ANALYZE_MEDICAL_IMAGE"
                }
            }
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Đọc kết quả CT scan này"
                }
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Tôi sẽ đọc kết quả CT scan cho bạn và đưa ra nhận xét về những điểm bất thường.",
                    action: "ANALYZE_MEDICAL_IMAGE"
                }
            }
        ]
    ] as ActionExample[][],
    settings: {
        priority: 0.9,
        allowWithoutContext: true,
        maxResponseSize: 3000
    }
} as Action;

// Helper functions
function detectMimeType(imageUrl: string): string {
    if (imageUrl.includes('data:image/')) {
        const mimeMatch = imageUrl.match(/data:image\/([a-z]+);base64/);
        if (mimeMatch) {
            return `image/${mimeMatch[1]}`;
        }
    }
    // Default to JPEG if can't detect
    return 'image/jpeg';
}

function createMedicalAnalysisPrompt(userText: string, imageCount: number): string {
    const basePrompt = `Bạn là một bác sĩ chuyên về chẩn đoán hình ảnh y tế. Hãy phân tích ${imageCount > 1 ? 'những hình ảnh' : 'hình ảnh'} y tế được cung cấp một cách chi tiết và chuyên nghiệp.

Yêu cầu phân tích:
1. Mô tả những gì bạn quan sát được trong hình ảnh
2. Chỉ ra các dấu hiệu bất thường (nếu có)
3. Đưa ra các chẩn đoán khả năng
4. Đề xuất các bước tiếp theo cần thực hiện

Lưu ý quan trọng:
- Chỉ đưa ra nhận xét dựa trên những gì quan sát được
- Không thay thế cho việc khám lâm sàng trực tiếp
- Khuyến cáo bệnh nhân nên tham khảo ý kiến bác sĩ chuyên khoa
- Trả lời bằng tiếng Việt một cách rõ ràng và dễ hiểu

${userText ? `Câu hỏi cụ thể của bệnh nhân: ${userText}` : ''}`;

    return basePrompt;
}

async function callGeminiVisionAPI(apiKey: string, prompt: string, images: any[]): Promise<string | null> {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        ...images
                    ]
                }],
                generationConfig: {
                    temperature: 0.4,
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 2048,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('No response content from Gemini API');
        }
    } catch (error) {
        elizaLogger.error(`Gemini API call failed: ${error}`);
        throw error;
    }
}

function formatMedicalAnalysisResponse(analysis: string, imageCount: number): string {
    const header = `🏥 **Kết quả phân tích hình ảnh y tế**\n📊 *Đã phân tích ${imageCount} hình ảnh*\n\n`;
    
    const disclaimer = `\n\n⚠️ **Lưu ý quan trọng:**\n• Kết quả phân tích này chỉ mang tính chất tham khảo\n• Không thay thế cho việc khám và tư vấn trực tiếp của bác sĩ chuyên khoa\n• Vui lòng liên hệ với bác sĩ để được tư vấn chính xác\n• Địa chỉ liên hệ: 20 đường số 11, phường 10, Gò Vấp, TP.HCM - SĐT: 0901234567`;
    
    return header + analysis + disclaimer;
}