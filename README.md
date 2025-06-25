# Hướng dẫn chạy Eliza OS và tùy chỉnh Character

## 📋 Mục lục
1. [Giới thiệu về Eliza OS](#giới-thiệu-về-eliza-os)
2. [Cài đặt và chạy Eliza OS](#cài-đặt-và-chạy-eliza-os)
3. [Cấu trúc dự án](#cấu-trúc-dự-án)
4. [Tạo và tùy chỉnh Character](#tạo-và-tùy-chỉnh-character)
5. [Tạo Plugin tùy chỉnh](#tạo-plugin-tùy-chỉnh)
6. [Tích hợp với Frontend Angular](#tích-hợp-với-frontend-angular)
7. [Xử lý lỗi thường gặp](#xử-lý-lỗi-thường-gặp)

---

## 🤖 Giới thiệu về Eliza OS

Eliza OS là một framework mã nguồn mở để xây dựng AI agents thông minh với khả năng:
- Đa nền tảng (Discord, Telegram, Twitter, Web)
- Hỗ trợ nhiều mô hình AI (OpenAI, Anthropic, Google Gemini, v.v.)
- Plugin system mở rộng
- Character system tùy biến

---

## 🚀 Cài đặt và chạy Eliza OS

### 1. Yêu cầu hệ thống
```bash
# Node.js version 18+
node --version  # >= 18.0.0

# pnpm package manager
npm install -g pnpm
```

### 2. Clone và cài đặt
```bash
# Clone repository
git clone https://github.com/nhatlapross/elizaOS-config.git
cd eliza

# Cài đặt dependencies
pnpm install

# Copy file cấu hình
cp .env.example .env
```

### 3. Cấu hình Environment Variables
Chỉnh sửa file `.env`:

```env
# Model Provider (chọn một trong các options sau)
# Google Gemini (khuyên dùng cho tiếng Việt)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Anthropic Claude
ANTHROPIC_API_KEY=your_anthropic_api_key

# Database (optional)
POSTGRES_URL=postgresql://username:password@localhost:5432/eliza
# Hoặc sử dụng SQLite (mặc định)
SQLITE_FILE=./data/db.sqlite

# Cache (optional)
REDIS_URL=redis://localhost:6379
CACHE_STORE=DATABASE  # hoặc REDIS, FILESYSTEM

# Server
SERVER_PORT=3000

# Custom settings cho character Ehis
MONGODB_BACKEND_URL=http://localhost:6000
```

### 4. Chạy ứng dụng

#### Chạy server backend:
```bash
# Với character mặc định
pnpm start

# Với character tùy chỉnh
pnpm start --character="./characters/ehis.character.json"

# Với nhiều characters
pnpm start --characters="./characters/ehis.character.json,./characters/other.character.json"
```

#### Chạy client frontend:
```bash
# Trong terminal khác
pnpm start:client

# Hoặc với port tùy chỉnh
SERVER_PORT=3001 pnpm start:client
```

### 5. Truy cập ứng dụng
- Frontend: http://localhost:5173
- API Backend: http://localhost:3000
- API Docs: http://localhost:3000/api

---

## 📁 Cấu trúc dự án

```
eliza/
├── agent/                      # Main agent code
│   ├── src/
│   │   └── index.ts           # Entry point
│   └── characters/            # Character definitions
├── packages/
│   ├── core/                  # Core framework
│   ├── client-direct/         # Direct client
│   └── plugin-*/             # Various plugins
├── docs/                      # Documentation
├── .env                       # Environment variables
└── package.json
```

---

## 👤 Tạo và tùy chỉnh Character

### 1. Tạo file Character JSON

Tạo file `characters/ehis.character.json`:

```json
{
    "name": "Ehis",
    "clients": ["direct"],
    "modelProvider": "google",
    "settings": {
        "secrets": {},
        "voice": {
            "model": "vi_VN-male-medium"
        }
    },
    "plugins": ["@elizaos/plugin-ehis"],
    "bio": [
        "Bác sĩ đa khoa với nhiều năm kinh nghiệm",
        "Kê đơn thuốc theo triệu chứng bệnh",
        "Cho lời khuyên về sức khỏe",
        "Hỗ trợ thông tin y tế từ hệ thống"
    ],
    "lore": [
        "5 năm kinh nghiệm trong ngành y",
        "Kê đơn thuốc dựa vào kết luận bệnh",
        "Đưa ra lời khuyên trong quá trình chữa bệnh"
    ],
    "knowledge": [
        "Hiểu biết về các loại bệnh dựa vào triệu chứng",
        "Hiểu biết về thuốc đông y và tây y",
        "Biết bảng mã bệnh ICD10",
        "Có khả năng truy cập thông tin hệ thống"
    ],
    "messageExamples": [
        [
            {
                "user": "{{user1}}",
                "content": {
                    "text": "Xin chào, giới thiệu về bạn."
                }
            },
            {
                "user": "Ehis",
                "content": {
                    "text": "Tôi là Ehis, bác sĩ đa khoa có nhiều năm kinh nghiệm."
                }
            }
        ]
    ],
    "style": {
        "all": [
            "Ngôn ngữ chuyên nghiệp nhưng dễ hiểu",
            "Thân thiện và tận tâm",
            "Tư vấn dựa trên triệu chứng"
        ],
        "chat": [
            "Hướng dẫn tận tình",
            "Kiến thức chuyên sâu",
            "Thân thiện",
            "Chuyên nghiệp"
        ]
    },
    "topics": [
        "Y tế",
        "Khám và chữa bệnh",
        "Chẩn đoán bệnh",
        "Sức khỏe"
    ]
}
```

### 2. Các thuộc tính quan trọng

| Thuộc tính | Mô tả | Ví dụ |
|------------|-------|-------|
| `name` | Tên character | "Ehis" |
| `clients` | Nền tảng hỗ trợ | ["direct", "discord", "telegram"] |
| `modelProvider` | Nhà cung cấp AI | "google", "openai", "anthropic" |
| `plugins` | Danh sách plugins | ["@elizaos/plugin-ehis"] |
| `bio` | Tiểu sử ngắn | Mảng các câu mô tả |
| `knowledge` | Kiến thức chuyên môn | Mảng các lĩnh vực |
| `messageExamples` | Ví dụ hội thoại | Cặp câu hỏi-trả lời |
| `style` | Phong cách giao tiếp | Object định nghĩa tone |

---

## 🔌 Tạo Plugin tùy chỉnh

### 1. Cấu trúc Plugin

Tạo thư mục `packages/plugin-ehis/`:

```
packages/plugin-ehis/
├── src/
│   ├── index.ts               # Main plugin file
│   ├── actions/               # Các hành động
│   │   ├── apiCallAction.ts
│   │   ├── getChongChiDinhThuocAction.ts
│   │   └── getDiaChi.ts
│   ├── examples.ts            # Ví dụ hội thoại
│   ├── types.ts              # Type definitions
│   └── service.ts            # Business logic
├── package.json
└── tsconfig.json
```

### 2. Tạo Main Plugin File

`src/index.ts`:
```typescript
import { Plugin } from "@elizaos/core";
import { getChongChiDinhThuocAction } from "./actions/getChongChiDinhThuocAction";
import { getDiaChiLienHeAction } from "./actions/getDiaChi";
import { apiCallAction } from "./actions/apiCallAction";

export const ehisPlugin: Plugin = {
    name: "ehis",
    description: "Ehis's Plugin for medical assistance",
    actions: [
        getChongChiDinhThuocAction,
        getDiaChiLienHeAction,
        apiCallAction
    ],
    evaluators: [],
    providers: [],
};

export default ehisPlugin;
```

### 3. Tạo Action

Ví dụ action lấy địa chỉ liên hệ (`actions/getDiaChi.ts`):

```typescript
import {
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State
} from "@elizaos/core";

export const getDiaChiLienHeAction: Action = {
    name: "GET_DIA_CHI",
    similes: [
        "ĐỊA CHỈ LIÊN HỆ",
        "LIÊN HỆ",
        "THÔNG TIN LIÊN HỆ"
    ],
    description: "Lấy thông tin liên hệ của bác sĩ",
    
    // Kiểm tra xem có kích hoạt action này không
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = message.content?.text?.toLowerCase() || "";
        
        const contactKeywords = [
            'địa chỉ liên hệ',
            'thông tin liên hệ',
            'liên hệ với bạn'
        ];
        
        return contactKeywords.some(keyword => text.includes(keyword));
    },
    
    // Xử lý logic chính
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        if (callback) {
            callback({
                text: "📍 **Thông tin liên hệ bác sĩ Ehis:**\n\n🏠 **Địa chỉ:** 20 đường số 11, phường 10, Gò Vấp, TP.HCM\n📞 **Số điện thoại:** 0901234567",
                data: { 
                    address: "20 đường số 11 phường 10 Gò Vấp HCM",
                    phone: "0901234567"
                }
            });
        }
        return true;
    },
    
    // Ví dụ hội thoại
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Cho tôi địa chỉ liên hệ"
                }
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Địa chỉ liên hệ 20 đường số 11 phường 10 Gò Vấp HCM",
                    action: "GET_DIA_CHI"
                }
            }
        ]
    ] as ActionExample[][],
    
    settings: {
        priority: 0.7,
        allowWithoutContext: true,
        maxResponseSize: 1000
    }
} as Action;
```

### 4. Action gọi API với Bearer Token

`actions/apiCallAction.ts`:
```typescript
export const apiCallAction: Action = {
    name: "API_CALL_WITH_BEARER",
    similes: [
        "PHÒNG KHÁM ARV",
        "DANH SÁCH PHÒNG KHÁM ARV", 
        "GỌI API"
    ],
    description: "Gọi API với bearer token",
    
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = message.content?.text?.toLowerCase() || "";
        
        // Kiểm tra từ khóa API
        const apiKeywords = [
            'phòng khám arv',
            'danh sách phòng khám arv',
            'api thongso'
        ];
        
        return apiKeywords.some(keyword => text.includes(keyword));
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
            
            // Parse JSON nếu có
            try {
                const parsed = JSON.parse(messageText);
                if (parsed && parsed.apiCallRequest) {
                    apiCallRequest = parsed.apiCallRequest;
                }
            } catch (e) {
                // Fallback: detect từ text
                apiCallRequest = detectApiRequestFromText(messageText);
            }
            
            if (!apiCallRequest) {
                callback?.({
                    text: "Không thể xác định yêu cầu API."
                });
                return false;
            }

            const { endpoint, method, bearerToken, headers } = apiCallRequest;
            
            // Gọi API
            const response = await fetch(endpoint, {
                method: method || 'GET',
                headers: {
                    'Authorization': `Bearer ${bearerToken}`,
                    'Content-Type': 'application/json',
                    ...headers
                }
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const responseText = await response.text();
            const formattedResponse = formatResponse(responseText, endpoint);

            callback?.({
                text: formattedResponse,
                data: responseText
            });
            
            return true;

        } catch (error: any) {
            callback?.({
                text: "Có lỗi xảy ra khi truy cập hệ thống."
            });
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
    ] as ActionExample[][]
};
```

### 5. Đăng ký Plugin

Thêm plugin vào `package.json`:
```json
{
    "name": "@elizaos/plugin-ehis",
    "version": "1.0.0",
    "main": "dist/index.js",
    "dependencies": {
        "@elizaos/core": "workspace:*"
    }
}
```

Cập nhật `agent/src/index.ts` để import plugin:
```typescript
import { ehisPlugin } from "@elizaos/plugin-ehis";

// Thêm vào danh sách plugins
plugins: [
    // ... other plugins
    ehisPlugin,
    // ...
]
```

---

## 🌐 Tích hợp với Frontend Angular

### 1. Service Angular

Tạo `chat.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ElizaResponse {
    user?: string;
    text: string;
    action?: string;
    data?: any;
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private baseUrl = 'http://localhost:3000/api';
    private agentId: string | null = null;
    
    constructor(private http: HttpClient) {}

    // Lấy agent ID
    private async getAgentId(): Promise<string> {
        if (this.agentId) return this.agentId;
        
        const response = await this.http.get<{agents: any[]}>(`${this.baseUrl}/agents`).toPromise();
        const ehisAgent = response?.agents.find(agent => agent.name === 'Ehis');
        
        if (!ehisAgent) throw new Error('Ehis agent not found');
        
        this.agentId = ehisAgent.id;
        return this.agentId;
    }

    // Gửi tin nhắn thường
    sendMessage(text: string, userId: string, roomId: string): Observable<ElizaResponse[]> {
        return from(this.getAgentId()).pipe(
            switchMap(agentId => {
                const requestBody = { text, userId, roomId };
                return this.http.post<ElizaResponse[]>(`${this.baseUrl}/${agentId}/message`, requestBody);
            })
        );
    }

    // Gửi tin nhắn với API call
    sendMessageWithApiCall(
        text: string, 
        userId: string, 
        roomId: string, 
        apiCallRequest: any
    ): Observable<ElizaResponse[]> {
        return from(this.getAgentId()).pipe(
            switchMap(agentId => {
                const requestBody = {
                    text: JSON.stringify({
                        text: text,
                        apiCallRequest: apiCallRequest
                    }),
                    userId,
                    roomId
                };
                
                return this.http.post<ElizaResponse[]>(`${this.baseUrl}/${agentId}/message`, requestBody);
            })
        );
    }
}
```

### 2. Component Angular

`tro-ly-ai.component.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChatService } from './chat.service';

interface Message {
    content: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
}

@Component({
    templateUrl: './tro-ly-ai.component.html',
    styleUrls: ['./tro-ly-ai.component.css']
})
export class TroLyAIComponent implements OnInit {
    messages: Message[] = [];
    messageInput = new FormControl('');
    isLoading = false;
    userId: string = 'testUser';
    roomId: string = 'default-room';

    constructor(private chatService: ChatService) {}

    ngOnInit() {
        // Tin nhắn chào mừng
        this.addBotMessage('Xin chào! Tôi là bác sĩ Ehis. Tôi có thể giúp gì cho bạn?');
    }

    async sendMessage() {
        const message = this.messageInput.value?.trim();
        
        if (!message || this.isLoading) return;

        this.isLoading = true;
        this.addUserMessage(message);
        this.messageInput.setValue('');

        try {
            // Phát hiện yêu cầu API
            const apiRequest = this.detectApiRequest(message);
            
            let observable;
            if (apiRequest) {
                observable = this.chatService.sendMessageWithApiCall(
                    message, this.userId, this.roomId, apiRequest
                );
            } else {
                observable = this.chatService.sendMessage(
                    message, this.userId, this.roomId
                );
            }
            
            observable.subscribe({
                next: (responses) => {
                    responses.forEach(response => {
                        if (response.text?.trim()) {
                            this.addBotMessage(response.text);
                        }
                    });
                },
                error: (error) => {
                    this.addBotMessage('Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.');
                },
                complete: () => {
                    this.isLoading = false;
                }
            });
        } catch (error) {
            this.addBotMessage('Đã xảy ra lỗi khi gửi tin nhắn.');
            this.isLoading = false;
        }
    }

    private detectApiRequest(message: string): any | null {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('phòng khám arv')) {
            return {
                endpoint: 'http://localhost:5284/api/ThongSo/GetPhongKhamARV',
                method: 'GET',
                bearerToken: 'your-token-here',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        
        return null;
    }

    private addUserMessage(content: string) {
        this.messages.push({
            content,
            sender: 'user',
            timestamp: new Date()
        });
    }

    private addBotMessage(content: string) {
        this.messages.push({
            content,
            sender: 'assistant',
            timestamp: new Date()
        });
    }
}
```

---

## ❗ Xử lý lỗi thường gặp

### 1. Lỗi API Key không hợp lệ
```bash
Error: API key not found for provider google
```

**Giải pháp:**
- Kiểm tra file `.env` có đúng key không
- Đảm bảo key có quyền truy cập API
- Restart server sau khi thay đổi `.env`

### 2. Lỗi không tìm thấy Character
```bash
Error loading character from ./characters/ehis.character.json: File not found
```

**Giải pháp:**
- Kiểm tra đường dẫn file character
- Đảm bảo file JSON có syntax hợp lệ
- Kiểm tra quyền đọc file

### 3. Lỗi Plugin không load được
```bash
Error: Cannot find module '@elizaos/plugin-ehis'
```

**Giải pháp:**
```bash
# Build lại plugin
cd packages/plugin-ehis
pnpm build

# Install dependencies
pnpm install

# Restart server
pnpm start
```

### 4. Lỗi Database connection
```bash
Error: Database connection failed
```

**Giải pháp:**
- Kiểm tra PostgreSQL đang chạy (nếu dùng Postgres)
- Hoặc đổi sang SQLite: xóa `POSTGRES_URL` trong `.env`
- Tạo thư mục `data/` nếu chưa có

### 5. Lỗi CORS khi gọi từ frontend
```bash
Access to XMLHttpRequest blocked by CORS policy
```

**Giải pháp:**
Thêm CORS middleware trong server hoặc chạy frontend cùng domain.

---

## 📝 Ghi chú quan trọng

1. **Backup dữ liệu**: Luôn backup database và character files
2. **Environment**: Sử dụng file `.env` riêng cho từng môi trường
3. **Security**: Không commit API keys vào Git
4. **Testing**: Test kỹ các actions trước khi deploy
5. **Performance**: Monitor usage API để tránh vượt quota

---

## 🎯 Kết luận

Với hướng dẫn này, bạn có thể:
- ✅ Chạy thành công Eliza OS
- ✅ Tạo character tùy chỉnh
- ✅ Phát triển plugin riêng
- ✅ Tích hợp với frontend Angular
- ✅ Xử lý các lỗi phổ biến

Để tìm hiểu thêm, tham khảo:
- [Eliza OS Documentation](https://elizaos.github.io/eliza/)
- [API Reference](https://elizaos.github.io/eliza/api/)
- [Plugin Development Guide](https://elizaos.github.io/eliza/plugins/)

**Chúc bạn phát triển thành công AI agent của mình! 🚀**