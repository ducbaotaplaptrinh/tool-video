# 🇻🇳 VietSu AI Studio

> **Xưởng Tự Động Hóa Sản Xuất Video Lịch Sử Việt Nam Chuẩn Facebook Reels (9:16 - 1080×1920)**  
> *Được xây dựng với kiến trúc Multi-Agent, Remotion, Express, React và kiểm chứng sử liệu nghiêm ngặt.*

---

## 1. Giới thiệu tổng quan
**VietSu AI Studio** là nền tảng tự động hóa toàn diện quy trình sản xuất nội dung video ngắn chuyên sâu về Lịch sử Việt Nam. Hệ thống giải quyết bài toán cốt lõi: **Sản xuất video chất lượng cao, giữ chân người xem (High-retention Reels) nhưng tuyệt đối không bịa đặt sử liệu hoặc xuyên tạc lịch sử.**

### 💎 Giá trị cốt lõi
1. **Tuyệt đối trung thực với lịch sử**: Mọi dữ kiện quan trọng đều đối chiếu với chính sử (*Đại Việt Sử Ký Toàn Thư*, *Khâm Định Việt Sử Thông Giám Cương Mục*, *Việt Nam Sử Lược*, *Việt Sử Tiêu Án*...) và phân loại minh bạch (`CONFIRMED_FACT`, `HISTORICAL_HYPOTHESIS`, `FOLKLORE_LEGEND`).
2. **Chuẩn định dạng Facebook Reels**: Tỷ lệ 9:16, độ phân giải 1080×1920, 30 FPS, hiệu ứng camera Ken Burns, phụ đề động nhảy chữ (Kinetic Subtitles) nằm gọn trong vùng an toàn (Safe Zone: lề trên 200px, lề dưới 280px).
3. **Cơ chế Human-In-The-Loop**: Có 2 trạm dừng bắt buộc: Duyệt sử liệu (Research Approval) và Duyệt kịch bản (Script Approval) trước khi kích hoạt sinh tài nguyên hình ảnh/âm thanh tốn phí.
4. **Kiểm soát & Theo dõi chi phí**: Bảng kê chi phí API chi tiết theo từng tác vụ (Tokens, Images, Audio duration) quy đổi USD và VNĐ. Hỗ trợ 100% Mock Provider chạy offline chi phí 0đ.
5. **Độ bền bỉ & Khả năng phục hồi (Resilience)**: Cơ chế khóa chống chạy trùng lặp (Concurrency Lock), tự động phát hiện và phục hồi job treo sau khi server restart (`JobRecoveryService`), và endpoint thử lại (`POST /api/projects/:id/pipeline/retry`).

---

## 2. Quy trình 8 bước (Multi-Agent Pipeline)

```
[Nhập chủ đề] 
     │
     ▼
1. Research Agent (Thẩm định sử liệu & Trích dẫn gốc)
     │
     ▼
[CỔNG 1: Duyệt Sử Liệu - isApproved]
     │
     ▼
2. Script Agent (Biên kịch 3 hồi: Hook, Bối cảnh, Cao trào, CTA)
     │
     ▼
[CỔNG 2: Duyệt Kịch Bản & Phân Cảnh - isApproved]
     │
     ▼
3. Visual Agent (Sinh ảnh 9:16 & Bản đồ cổ)  +  Voice Agent (TTS Tiếng Việt & Word Timestamps)
     │
     ▼
4. Editor Agent (Lắp ráp Remotion Timeline, Frame sync, Kinetic Subtitles)
     │
     ▼
5. QA Agent (Kiểm tra lệch tiếng/hình, Safe-zone, Timestamps, Mock flag, Điểm QA)
     │
     ▼
6. Render Engine (Remotion 4.0 + FFmpeg xuất video MP4 1080×1920 @ 30fps)
```

---

## 3. Phân biệt Mock Provider vs Live Provider

| Tiêu Chí | Mock Provider (Phase 1 Foundation - Hiện tại) | Live Provider (Phase 2 - Kế hoạch mở rộng) |
|---|---|---|
| **Chi phí API** | **0 VNĐ** (Hoàn toàn miễn phí, chạy offline 100%) | Trả phí theo mức sử dụng (Ước tính $0.05 – $0.15 / video) |
| **Research / Scripting** | `MockLLMProvider` với cơ sở dữ liệu mẫu về Bạch Đằng 938, Hai Bà Trưng, Chi Lăng... (*Lưu ý: Dữ liệu mô phỏng, cộp cờ `isMockEngine`*) | Google Gemini 1.5 Flash / OpenAI GPT-4o-mini |
| **Minh họa hình ảnh** | `MockImageProvider` vẽ canvas SVG họa tiết Trống đồng Đông Sơn và chiến thuyền cổ | Recraft V3 / Flux Schnell / Midjourney API |
| **Giọng thuyết minh** | `MockTTSProvider` tổng hợp sóng âm WAV đa âm sắc kèm bảng word timestamps chính xác | FPT.AI TTS (Giọng Ban Mai/Minh Quang) / ElevenLabs Multilingual v2 |
| **Hiệu ứng AI Video** | Chuyển động máy quay Ken Burns (Zoom/Pan) điều khiển bằng Remotion | Higgsfield API / Runway Gen-3 (Tùy chọn) |

> [!WARNING]
> **Lưu ý về Sử liệu Mock Engine:** Toàn bộ dữ liệu trích dẫn nguồn ở chế độ Mock Provider đều mang cờ `isMockSource: true`. QA Agent sẽ tự động gắn cảnh báo `isIndependentlyVerified: false` để phân biệt rõ ràng giữa mô phỏng kỹ thuật và chứng thực học thuật từ các viện sử học.

---

## 4. Danh sách tính năng chưa triển khai ở Phase 1 (Chờ Phase 2)

Các tính năng sau đây **chưa được kích hoạt** trong Phase 1 nhằm đảm bảo tính ổn định của nền tảng và kiểm soát chi phí:
- [ ] **Tự động xuất bản lên Facebook Reels API**: Phase 1 yêu cầu người dùng xem trước và tải video MP4 về để đăng thủ công.
- [ ] **Live Paid AI API Keys**: Chưa đấu nối API thương mại trả phí (chờ phê duyệt hạn mức).
- [ ] **Lưu trữ Cloud (AWS S3 / Cloudflare R2)**: Hiện đang dùng Local Storage filesystem.
- [ ] **Đăng nhập người dùng đa tài khoản (OAuth2 / Facebook Login)**: Dự kiến triển khai ở Phase 3.

---

## 5. Cấu trúc Monorepo

```
vietsu-ai-studio/
├── .github/
│   └── workflows/ci.yml      # CI chạy build, typecheck, prisma push và test trên push/PR
├── apps/
│   ├── backend/              # Node.js + Express REST API, Prisma, Workflow Engine & 6 AI Agents
│   │   ├── prisma/           # schema.prisma & dev.db (SQLite / PostgreSQL)
│   │   ├── src/
│   │   │   ├── agents/       # Research, Script, Visual, Voice, Editor, QA Agents
│   │   │   ├── orchestrator/ # WorkflowEngine, JobRecoveryService
│   │   │   ├── controllers/  # Projects, Pipeline (có kiểm tra trạng thái & lock), Render
│   │   │   ├── routes/       # REST Endpoints
│   │   │   └── storage/      # Local Storage Service
│   │   └── test/             # api.test.ts (13 bài kiểm thử chuyên sâu)
│   ├── frontend/             # React 18, Vite, Tailwind CSS, Lucide Icons
│   │   └── src/
│   │       ├── components/   # Stepper (kèm nút Thử lại), ResearchTab, VideoPreviewModal
│   │       ├── pages/        # Dashboard, ProjectDetail
│   │       └── services/     # ApiService kết nối backend
│   └── video-renderer/       # Remotion React Engine (1080x1920 @ 30fps)
│       └── src/
│           ├── Root.tsx       # Remotion Composition & Metadata Calculator
│           ├── VietSuReel.tsx # Main Reels Video Composition
│           ├── components/   # KenBurnsScene, KineticSubtitles, HistoricalBadge
│           └── render-cli.ts # Programmatic CLI render ra file MP4
├── packages/
│   ├── shared/               # TypeScript Types & Zod Schemas
│   └── ai-providers/         # Provider Abstraction & Mock Providers (Offline 0đ)
├── storage/                  # Thư mục lưu trữ tài nguyên cục bộ
│   ├── assets/               # File ảnh SVG/PNG minh họa phân cảnh
│   ├── audio/                # File âm thanh WAV thuyết minh tiếng Việt
│   └── videos/               # File MP4 thành phẩm đã render
└── docs/
    ├── PRODUCT_SPEC.md       # Đặc tả sản phẩm chi tiết
    ├── ARCHITECTURE.md       # Thiết kế kiến trúc hệ thống
    ├── IMPLEMENTATION_PLAN.md# Kế hoạch triển khai & ADRs
    └── PHASE_2_PLAN.md       # Đề xuất và mô hình chi phí tích hợp AI thật
```

---

## 6. Hướng dẫn cài đặt và Chạy thử nghiệm Local

### Yêu cầu môi trường
- **Node.js**: >= v20 (khuyến nghị v22+)
- **NPM**: >= v10
- **FFmpeg**: Đã cài đặt trên máy trạm (`ffmpeg -version`)

### 1. Cài đặt dependencies và chuẩn bị database
```bash
git clone https://github.com/ducbaotaplaptrinh/tool-video.git
cd tool-video
npm install
npm run build
cd apps/backend && npx prisma db push && cd ../..
```

### 2. Khởi chạy Backend Server (Port 5000)
```bash
npm run dev:backend
```
*Backend API chạy tại `http://localhost:5000` và ánh xạ thư mục tĩnh `/storage`.*

### 3. Khởi chạy Frontend Dashboard (Port 3000)
Mở cửa sổ terminal thứ 2:
```bash
npm run dev:frontend
```
*Giao diện mở tại `http://localhost:3000`.*

### 4. Chạy toàn bộ Test Suite (13 bài kiểm thử chuyên sâu)
```bash
cd apps/backend
npm run test
```

---

## 7. Kết quả kiểm thử thực tế (Phase 1 Verification Suite)

Toàn bộ 13 bài kiểm thử tự động đã chạy thành công 100%:

```
====================================================
  VIETSU AI STUDIO - PHASE 1 VERIFICATION SUITE
====================================================

[Test Server] Running on http://127.0.0.1:61399/api

[TEST] Storage directories initialization ... PASSED ✓
[TEST] Provider Registry loads Mock Providers (0đ local mode) ... PASSED ✓
[TEST] Historical Research & Authenticity (Bạch Đằng 938) ... PASSED ✓
[TEST] POST /api/projects creates project in DRAFT state ... PASSED ✓
[TEST] Approval endpoints reject requests when project status is invalid ... PASSED ✓
[TEST] POST /api/projects/:id/pipeline/start triggers Research Agent ... PASSED ✓
[TEST] Concurrency lock: rejects duplicate job while one is running ... PASSED ✓
[TEST] POST /api/projects/:id/pipeline/approve-research syncs DB isApproved ... PASSED ✓
[TEST] POST /api/projects/:id/pipeline/approve-script syncs DB and runs QA ... PASSED ✓
[TEST] QA Agent: verifies durations, safe-zone, subtitles & mock flag ... PASSED ✓
[TEST] POST /api/projects/:id/render: exports 1080x1920 MP4 video ... PASSED ✓
[TEST] Deep MP4 inspection: H.264/AAC, 1080x1920 30fps, non-silent audio, non-black frames ... 
     [Audio Waveform] Detected max_volume: -15 dB
     [Visual Snapshot] Successfully extracted 1080x1920 PNG frame (598437 bytes)
PASSED ✓
[TEST] Job Recovery Service: heals dangling jobs after server crash & retry restarts ... PASSED ✓

====================================================
  KẾT QUẢ KIỂM THỬ: 13 PASSED, 0 FAILED
====================================================
```

### Chi tiết kiểm tra tệp MP4 bằng mắt và tai (Deep Inspection):
- **Độ phân giải video**: 1080 × 1920 (chuẩn đứng Facebook Reels 9:16).
- **Tốc độ khung hình**: 30 FPS.
- **Bộ mã hóa (Codec)**: H.264 (Video) / AAC (Audio).
- **Kiểm tra âm thanh (Audio Waveform)**: `max_volume = -15.0 dB` (khẳng định có sóng âm thanh thuyết minh thực tế, không bị câm / mute).
- **Kiểm tra hình ảnh (Visual Snapshot)**: Trích xuất frame tại `t=1.0s` ra tệp PNG đạt dung lượng **598 KB** (khẳng định canvas đồ họa và phụ đề chữ được vẽ đầy đủ, không bị màn hình đen).
- **Kiểm tra phụ đề**: Phụ đề nhảy chữ Kinetic Subtitles căn giữa tại tọa độ Y: 1400–1650px (hoàn toàn tránh vùng nút tương tác của Facebook Reels).
