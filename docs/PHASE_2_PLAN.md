# 🚀 VietSu AI Studio - Kế Hoạch Tích Hợp AI Thật (Phase 2 Plan)

> **Mục tiêu:** Nâng cấp từ Mock Engine (0đ thử nghiệm) lên hệ thống tích hợp các AI Provider thương mại thực tế, tối ưu hóa triệt để cho **văn phong lịch sử Việt Nam, hình ảnh cổ phong 9:16 và giọng đọc truyền cảm** với chi phí vận hành thấp nhất có thể (Target: **< 3.500 VNĐ / video 60s**).

---

## 1. Ma trận Đánh giá & Lựa chọn Nhà cung cấp AI (Provider Matrix)

### A. AI Nghiên Cứu & Biên Kịch Lịch Sử (Research & Script Agent)

| Tiêu Chí | Google Gemini 1.5 Flash ⭐ (Đề xuất số 1) | OpenAI GPT-4o-mini | Anthropic Claude 3.5 Haiku |
|---|---|---|---|
| **Hiểu biết văn hóa & Lịch sử VN** | **Rất cao** (Được huấn luyện sâu trên kho tri thức đa ngữ và tài liệu tiếng Việt) | Khá (Cần prompt kiểm soát kỹ để tránh Hán-Việt lai tạp) | Tốt (Văn phong mượt mà) |
| **Độ trễ phản hồi (Latency)** | ~ 1.2s | ~ 1.5s | ~ 1.8s |
| **Chi phí Input Token** | **$0.075 / 1M tokens** (~1.900đ) | $0.150 / 1M tokens | $0.250 / 1M tokens |
| **Chi phí Output Token** | **$0.300 / 1M tokens** (~7.600đ) | $0.600 / 1M tokens | $1.250 / 1M tokens |
| **Gói dùng thử miễn phí** | Có Free Tier (15 RPM) phù hợp phát triển ban đầu | Không có free tier cho API | Không |
| **Khả năng bám sát Schema JSON** | Tuyệt đối (Hỗ trợ native Structured Outputs) | Tuyệt đối (JSON Mode) | Tốt qua tool calling |

👉 **Lựa chọn tối ưu:** **Google Gemini 1.5 Flash** làm Provider chính, fallback sang **GPT-4o-mini**.  
*Ước tính chi phí kịch bản 1 video (1.500 input + 600 output tokens):* **~0.0003 USD (~8 VNĐ)**.

---

### B. AI Tạo Hình Ảnh Minh Họa Cổ Phong & Bản Đồ (Visual Agent)

Đặc thù video lịch sử yêu cầu tỷ lệ dọc 9:16 (1080×1920), trang phục, giáp trụ và chiến thuyền thuần Việt (thời Tiền Ngô, Đinh, Tiền Lê, Lý, Trần, Lê Sơ, Tây Sơn...).

| Tiêu Chí | Flux Schnell (via Together/Replicate) ⭐ | Recraft V3 (Vector/Illustration) | Midjourney API (qua Proxy) |
|---|---|---|---|
| **Chi phí / bức ảnh** | **$0.003 - $0.006 / ảnh** (~75đ - 150đ) | $0.040 / ảnh (~1.000đ) | $0.050 - $0.080 / ảnh |
| **Thời gian tạo ảnh** | **1.2s - 2.5s (4 steps)** | 8s - 12s | 30s - 60s |
| **Hỗ trợ tỷ lệ 9:16** | Native (768×1344 hoặc 1080×1920) | Có (hỗ trợ nhiều preset) | Có (`--ar 9:16`) |
| **Độ chân thực & Cổ phong** | Rất cao với LoRA/Prompt Hào khí Việt | Tuyệt vời cho bản đồ & tranh khắc gỗ | Rất cao nhưng khó kiểm soát chi tiết giáp trụ VN |
| **Bản quyền thương mại** | Giấy phép mở Apache 2.0 / Commercial | Được phép thương mại | Tùy gói đăng ký |

👉 **Lựa chọn tối ưu:** **Flux Schnell** (thông qua Together AI / Replicate API) kết hợp thư viện Prompt kiến trúc & trang phục cổ truyền Việt Nam.  
*Ước tính chi phí hình ảnh cho 1 video 4 cảnh (4 ảnh 9:16):* **~0.016 USD (~400 VNĐ)**.

---

### C. AI Giọng Thuyết Minh Tiếng Việt & Khớp Phụ Đề (Voice Agent)

Yêu cầu: Giọng đọc hào sảng, uy nghiêm, phát âm chuẩn tên danh nhân/địa danh Việt Nam, và **phải cung cấp word-level timestamps** để hiển thị Kinetic Subtitles.

| Tiêu Chí | FPT.AI Voice Maker ⭐ (Đề xuất trong nước) | ElevenLabs Multilingual v2 | Vbee AIVoice |
|---|---|---|---|
| **Chất lượng giọng đọc** | Chuẩn ngữ điệu Bắc/Nam hào hùng (Giọng Ban Mai, Minh Quang) | Tự nhiên, cảm xúc cinematic đỉnh cao | Khá, phù hợp tin tức |
| **Phát âm từ Hán-Việt & Lịch sử** | **Tốt nhất** (Được tối ưu cho ngôn ngữ Việt) | Cần tinh chỉnh SSML phiên âm | Tốt |
| **Word-Level Timestamps** | Hỗ trợ qua Whisper alignment / Speech Marks | Native qua WebSocket / API | Giới hạn |
| **Chi phí** | **~10đ - 15đ / ký tự** (~600đ - 1.200đ / video 60 từ) | ~$0.04 - $0.08 / video (~1.000đ - 2.000đ) | ~20đ / ký tự |
| **Hạ tầng máy chủ** | Đặt tại Việt Nam (Độ trễ thấp < 1s) | Quốc tế | Việt Nam |

👉 **Lựa chọn tối ưu:** 
- Lựa chọn 1 (Chi phí thấp, phát âm chuẩn Việt): **FPT.AI Voice** kết hợp Whisper Timestamp Extractor.
- Lựa chọn 2 (Đỉnh cao điện ảnh): **ElevenLabs** (Giọng nam trầm ấm, hào hùng).
*Ước tính chi phí âm thanh cho 1 video 60s (~120 từ):* **~1.200 VNĐ - 2.500 VNĐ**.

---

## 2. Bảng Dự Toán Chi Phí Sản Xuất 1 Video Reels Hoàn Chỉnh

| Thành Phần Pipeline | Công Nghệ Sử Dụng | Chi Phí Dự Kiến (USD) | Chi Phí Quy Đổi (VNĐ) |
|---|---|---|---|
| **1. Nghiên cứu & Trích dẫn sử liệu** | Gemini 1.5 Flash (1.200 tokens) | $0.00018 | ~ 5 VNĐ |
| **2. Biên kịch kịch bản 3 hồi & Hooks** | Gemini 1.5 Flash (1.800 tokens) | $0.00035 | ~ 9 VNĐ |
| **3. Sinh 4 ảnh cổ phong 9:16** | Flux Schnell (4 ảnh HD) | $0.01600 | ~ 406 VNĐ |
| **4. Giọng đọc thuyết minh 60s** | FPT.AI / ElevenLabs Starter | $0.04000 | ~ 1.016 VNĐ |
| **5. Cắt ghép, Subtitles & Render MP4** | Remotion + FFmpeg (Server CPU) | $0.00000 | 0 VNĐ |
| **TỔNG CỘNG MỖI VIDEO 60S** | **Multi-Agent Stack** | **~$0.056 USD** | **~1.436 VNĐ** |

> [!TIP]
> **Hiệu quả kinh tế:** Với mức chi phí chỉ khoảng **1.500 VNĐ / video**, ngân sách 500.000 VNĐ có thể sản xuất được hơn **330 video lịch sử chất lượng cao**.

---

## 3. Kiến Trúc Tích Hợp Không Khóa Nhà Cung Cấp (Vendor Agnostic Architecture)

Toàn bộ hệ thống tuân thủ nghiêm ngặt mô hình Interface trong package `@vietsu/ai-providers`:

```
               ┌───────────────────────┐
               │   ProviderRegistry    │
               └───────────┬───────────┘
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
 ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
 │ ILLMProvider  │ │IImageProvider │ │ ITTSProvider  │
 └───────┬───────┘ └───────┬───────┘ └───────┬───────┘
    ┌────┴────┐       ┌────┴────┐       ┌────┴────┐
    ▼         ▼       ▼         ▼       ▼         ▼
  Mock    Gemini    Mock     Flux     Mock    FPT.AI
  LLM      Flash    Image   Schnell   Voice   ElevenLabs
```

Cấu hình thông qua biến môi trường tại `.env` mà không sửa đổi core logic:
```env
# AI Provider Selection
LLM_PROVIDER=gemini           # mock | gemini | openai
IMAGE_PROVIDER=flux           # mock | flux | recraft
TTS_PROVIDER=fpt              # mock | fpt | elevenlabs

# Commercial API Keys (Chỉ cấu hình khi được phê duyệt)
GEMINI_API_KEY=
TOGETHER_API_KEY=
FPT_AI_API_KEY=
ELEVENLABS_API_KEY=
```

---

## 4. Cơ Chế Phòng Ngừa Bịa Đặt Sử Liệu Khi Dùng AI Thật

Để đảm bảo nguyên tắc cốt lõi: *"Không bịa đặt sự kiện lịch sử hoặc nguồn tham khảo"*:
1. **Kiểm tra chéo (Cross-verification step)**: Script Agent không được phép tự do sáng tác ngoài các Fact IDs đã được thẩm định trong `ResearchDossier`.
2. **Grounding Prompts**: Sử dụng kỹ thuật Few-shot System Instruction nghiêm ngặt, yêu cầu trích xuất nguyên văn chương/hồi từ các ấn bản điện tử chính sử.
3. **Cổng kiểm duyệt con người (Human-in-the-loop Gate)**: Trước khi Visual Agent và Voice Agent sinh tài nguyên tốn phí, giao diện người dùng hiển thị toàn bộ hồ sơ dữ kiện để bấm **Phê Duyệt**.
4. **Hệ thống theo dõi chi phí thực tế**: Mọi request tới API thương mại đều ghi lại `CostLog` vào cơ sở dữ liệu để cảnh báo nếu vượt ngưỡng ngân sách.

---

## 5. Lộ Trình Triển Khai (Phase 2 Roadmap)

- **Bước 1:** Trình duyệt kế hoạch và xin cấp hạn mức API Gemini & Flux.
- **Bước 2:** Triển khai class `GeminiLLMProvider` và kiểm thử tỷ lệ bám sát sự kiện lịch sử.
- **Bước 3:** Triển khai class `FluxImageProvider` với preset prompt cổ phục Việt Nam.
- **Bước 4:** Triển khai class `FptTtsProvider` và bộ trích xuất word-level timestamps.
- **Bước 5:** Chạy thử nghiệm E2E 3 chủ đề lịch sử kinh điển (Bạch Đằng 938, Lam Sơn Khởi Nghĩa, Chiến thắng Ngọc Hồi - Đống Đa) với người dùng kiểm tra chất lượng hình ảnh & giọng đọc.
