# 🚀 VietSu AI Studio - Khung Đề Xuất Kỹ Thuật Tích Hợp AI (Phase 2 Framework)

> [!IMPORTANT]
> **Tuyên bố Phạm vi (Scope Disclaimer):**
> Tài liệu này là đề xuất kiến trúc kỹ thuật và khung đánh giá ứng viên (Candidate Evaluation Framework) cho Phase 2.
> - **Chưa áp dụng vào Phase 1**: Toàn bộ Phase 1 tiếp tục hoạt động độc lập với Mock Provider nội bộ (0đ chi phí, 100% offline).
> - **Không sử dụng số liệu báo giá chưa kiểm chứng**: Mọi thông số mô hình và chi phí thực tế phải được kiểm chứng thông qua bảng báo giá chính thức của nhà cung cấp và sự phê duyệt từ người dùng trước khi triển khai.

---

## 1. Khung Tiêu Chí Đánh Giá Ứng Viên AI (Candidate Evaluation Framework)

Để lựa chọn nhà cung cấp AI khi bước vào Phase 2, hệ thống thiết lập bộ tiêu chuẩn kỹ thuật đa chiều cho từng Agent:

### A. AI Nghiên Cứu & Biên Kịch Lịch Sử (Research & Script Agent)

| Tiêu Chí Đánh Giá | Mục Tiêu Kỹ Thuật | Phương Pháp Kiểm Chứng |
|---|---|---|
| **Độ am hiểu lịch sử & văn hóa Việt Nam** | Không bịa đặt triều đại, niên hiệu, quan chế, địa danh cổ (Đại La, Thăng Long, Hoa Lư...) | Benchmark với bộ đề 50 sự kiện lịch sử kinh điển đối chiếu chính sử |
| **Bám sát cấu trúc dữ liệu JSON Schema** | Xuất đúng định dạng `ResearchDossier` và `ScriptDocument` theo Zod schema | Kiểm thử tỷ lệ parse thành công qua 100 lần sinh liên tục |
| **Khả năng Grounding & Trích dẫn** | Chỉ lập luận dựa trên dữ kiện được cung cấp, không suy diễn vượt quá tư liệu | Cấm tạo fact mới ngoài tài liệu trích dẫn đầu vào |
| **Bản quyền & Giấy phép sử dụng** | Được phép sử dụng thương mại nội dung tạo ra | Rà soát điều khoản dịch vụ (Terms of Service) của nhà cung cấp |

*Các mô hình ứng viên tiềm năng để thẩm định thực tế:* Google Gemini Series (Gemini 1.5 Flash / Pro), OpenAI GPT Series (GPT-4o / GPT-4o-mini), Anthropic Claude Series (Claude 3.5 Sonnet / Haiku).

---

### B. AI Tạo Hình Ảnh Minh Họa Cổ Phong & Bản Đồ (Visual Agent)

Đặc thù video lịch sử dạng Short-form Reels đòi hỏi kiểm soát hình ảnh chặt chẽ:

| Tiêu Chí Đánh Giá | Mục Tiêu Kỹ Thuật | Phương Pháp Kiểm Chứng |
|---|---|---|
| **Tỷ lệ khung hình dọc 9:16** | Độ phân giải mục tiêu 1080×1920 hoặc tỷ lệ 9:16 tương đương không bị méo | Kiểm tra resolution thực tế của ảnh xuất ra |
| **Độ chân thực giáp trụ & trang phục** | Giáp trụ, thuyền chiến, vũ khí (cọc gỗ, nỏ liên châu, đao kiếm) thuần phong cách Việt, tránh lai tạp | Đánh giá trực quan bởi chuyên gia / người am hiểu cổ phục |
| **Tính nhất quán phân cảnh (Consistency)** | Nhân vật và bối cảnh giữ nguyên phong cách qua các phân cảnh liên tiếp | Sử dụng Seed cố định hoặc LoRA đặc thù cho từng thời kỳ |
| **Giấy phép thương mại (Commercial Rights)** | Hình ảnh được cấp quyền thương mại đầy đủ | Sử dụng mô hình có giấy phép mã nguồn mở thương mại hoặc API trả phí chính thức |

*Các mô hình ứng viên tiềm năng để thẩm định thực tế:* Flux Ecosystem (Flux.1 Schnell / Dev via Inference API), Recraft AI, Midjourney API (qua kênh tích hợp chính thức).

---

### C. AI Giọng Thuyết Minh Tiếng Việt & Khớp Phụ Đề (Voice Agent)

Yêu cầu cốt lõi cho Facebook Reels là âm điệu truyền cảm hào hùng và **bắt buộc phải có word-level timestamps**:

| Tiêu Chí Đánh Giá | Mục Tiêu Kỹ Thuật | Phương Pháp Kiểm Chứng |
|---|---|---|
| **Phát âm danh từ lịch sử & Hán-Việt** | Đọc chính xác tên danh nhân (Ngô Quyền, Trần Hưng Đạo, Quang Trung), địa danh, từ cổ | Thử nghiệm danh sách 100 từ vựng lịch sử dễ phát âm sai |
| **Word-Level Timestamps** | Trả về thời điểm bắt đầu (`start`) và kết thúc (`end`) của từng từ chính xác | So sánh waveform âm thanh thực tế với timestamps của từ |
| **Ngữ điệu hào sảng, truyền cảm** | Không đều đều như máy đọc tin tức; phù hợp không khí sử thi | Đánh giá điểm trải nghiệm người nghe qua khảo sát mù (A/B testing) |
| **Độ trễ hạ tầng (Server Latency)** | Thời gian tổng hợp giọng đọc nhanh, băng thông ổn định tại Việt Nam | Đo đạc P95 latency qua 50 requests liên tiếp |

*Các mô hình ứng viên tiềm năng để thẩm định thực tế:* FPT.AI Voice Maker, Vbee AIVoice, ElevenLabs Multilingual Model kết hợp bộ căn chỉnh Whisper Timestamps.

---

## 2. Mô Hình Hóa Chi Phí Sản Xuất Theo Công Thức Toán Học

Thay vì sử dụng các con số báo giá cố định có thể thay đổi theo thời gian, hệ thống áp dụng công thức tính toán chi phí linh hoạt dựa trên đơn vị tiêu thụ thực tế:

$$C_{\text{video}} = C_{\text{LLM}}(T_{\text{in}}, T_{\text{out}}) + \sum_{i=1}^{N_{\text{scenes}}} C_{\text{Image}}(i) + C_{\text{TTS}}(L_{\text{chars}}) + C_{\text{compute}}$$

Trong đó:
- $C_{\text{LLM}}(T_{\text{in}}, T_{\text{out}}) = T_{\text{in}} \times P_{\text{token\_in}} + T_{\text{out}} \times P_{\text{token\_out}}$ (đo bằng Tokens tiêu thụ trong quá trình nghiên cứu và viết kịch bản).
- $C_{\text{Image}}(i)$: Chi phí sinh 1 hình ảnh hoặc frame đồ họa cho phân cảnh thứ $i$.
- $C_{\text{TTS}}(L_{\text{chars}}) = L_{\text{chars}} \times P_{\text{char}}$ hoặc $D_{\text{sec}} \times P_{\text{sec}}$: Chi phí sinh giọng đọc dựa trên số lượng ký tự hoặc thời lượng giây âm thanh.
- $C_{\text{compute}}$: Chi phí CPU/GPU kết xuất video Remotion + FFmpeg cục bộ (bằng 0đ trên máy chủ nội bộ).

Mọi đơn vị tiêu thụ thực tế đều được ghi vết minh bạch vào bảng cơ sở dữ liệu `CostLog` thông qua interface `CostRecord`:
```typescript
export interface CostRecord {
  id: string;
  projectId: string;
  provider: string;
  service: ServiceType;
  unitsUsed: number;
  unitType: 'TOKENS' | 'CHARACTERS' | 'SECONDS' | 'IMAGES';
  estimatedCostUSD: number;
  estimatedCostVND: number;
  createdAt: string;
}
```

---

## 3. Kiến Trúc Tách Biệt & Cấu Hình Mềm (Vendor-Agnostic Design)

Tất cả các kết nối đến AI Provider đều được trừu tượng hóa tuyệt đối phía sau interface trong thư viện `@vietsu/ai-providers`:

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
  Mock     (Live)   Mock     (Live)   Mock     (Live)
```

Không có bất kỳ API Key nào được hardcode. Khi người dùng phê duyệt việc tích hợp trong tương lai, hệ thống chỉ kích hoạt thông qua file cấu hình môi trường `.env`:

```env
# Mặc định Phase 1: Hoạt động 100% Mock không tốn phí
LLM_PROVIDER=mock
IMAGE_PROVIDER=mock
TTS_PROVIDER=mock

# Cấu hình dự phòng cho Phase 2 (Chỉ mở khi có phê duyệt và khóa hợp đồng)
# GEMINI_API_KEY=
# FLUX_API_KEY=
# TTS_API_KEY=
```

---

## 4. Quy Trình Bảo Đảm Độ Tin Cậy Khi Đưa AI Vào Vận Hành

1. **Cổng Phê Duyệt Con Người (Human-in-the-Loop Gate)**: 
   - Sử liệu phải được người dùng bấm duyệt trước khi kịch bản được viết.
   - Kịch bản phải được bấm duyệt trước khi tài nguyên tốn phí (ảnh, âm thanh) được khởi tạo.
2. **Kiểm Định Độc Lập Thực Sự (`isIndependentlyVerified`)**:
   - Cấm gán nhãn "Đã kiểm định" nếu chỉ dựa vào văn bản AI tự sinh mà không có văn bản chứng thực đối chiếu từ nguồn học thuật hoặc tư liệu lịch sử lưu trữ chuẩn.
3. **Cảnh Báo Vùng An Toàn & Lệch Âm Thanh (QA Rigor)**:
   - Tự động phát hiện và cảnh báo mọi hiện tượng phụ đề tràn vùng safe-zone (< 260px từ đáy) hoặc phụ đề lệch pha với âm thanh.
