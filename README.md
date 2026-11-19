# 🇻🇳 VietSu AI Studio

> **Xưởng Tự Động Hóa Sản Xuất Video Lịch Sử Việt Nam Chuẩn Facebook Reels (9:16 - 1080×1920)**  
> *Được xây dựng với kiến trúc Multi-Agent, Remotion, Express, React và kiểm chứng sử liệu nghiêm ngặt.*

---

## 1. Giới thiệu tổng quan
**VietSu AI Studio** là nền tảng tự động hóa toàn diện quy trình sản xuất nội dung video ngắn chuyên sâu về Lịch sử Việt Nam. Hệ thống giải quyết bài toán cốt lõi: **Sản xuất video chất lượng cao, giữ chân người xem (High-retention Reels) nhưng tuyệt đối không bịa đặt sử liệu hoặc xuyên tạc lịch sử.**

### 💎 Giá trị cốt lõi
1. **Tuyệt đối trung thực với lịch sử**: Mọi dữ kiện quan trọng đều đối chiếu với chính sử (*Đại Việt Sử Ký Toàn Thư*, *Khâm Định Việt Sử Thông Giám Cương Mục*, *Việt Nam Sử Lược*, *Việt Sử Tiêu Án*...) và phân loại minh bạch (`CONFIRMED_FACT`, `HISTORICAL_HYPOTHESIS`, `FOLKLORE_LEGEND`).
2. **Chuẩn định dạng Facebook Reels**: Tỷ lệ 9:16, độ phân giải 1080×1920, 30 FPS, hiệu ứng camera Ken Burns, phụ đề động nhảy chữ (Kinetic Subtitles) nằm gọn trong vùng an toàn (Safe Zone).
3. **Cơ chế Human-In-The-Loop**: Có 2 trạm dừng bắt buộc: Duyệt sử liệu (Research Approval) và Duyệt kịch bản (Script Approval) trước khi kích hoạt sinh tài nguyên hình ảnh/âm thanh tốn phí.
4. **Kiểm soát & Theo dõi chi phí**: Bảng kê chi phí API chi tiết theo từng tác vụ (Tokens, Images, Audio duration) quy đổi USD và VNĐ. Hỗ trợ 100% Mock Provider chạy offline chi phí 0đ.

---

## 2. Quy trình 8 bước (Multi-Agent Pipeline)

```
[Nhập chủ đề] 
     │
     ▼
1. Research Agent (Thẩm định sử liệu & Trích dẫn gốc)
     │
     ▼
[CỔNG 1: Duyệt Sử Liệu]
     │
     ▼
2. Script Agent (Biên kịch 3 hồi: Hook, Bối cảnh, Cao trào, CTA)
     │
     ▼
[CỔNG 2: Duyệt Kịch Bản & Phân Cảnh]
     │
     ▼
3. Visual Agent (Sinh ảnh 9:16 & Bản đồ cổ)  +  Voice Agent (TTS Tiếng Việt & Word Timestamps)
     │
     ▼
4. Editor Agent (Lắp ráp Remotion Timeline, Frame sync, Kinetic Subtitles)
     │
     ▼
5. QA Agent (Kiểm tra lệch tiếng/hình, Safe-zone, Chính tả, Điểm QA)
     │
     ▼
6. Render Engine (Remotion 4.0 + FFmpeg xuất video MP4 1080×1920)
```

---

## 3. Cấu trúc Monorepo

```
vietsu-ai-studio/
├── apps/
│   ├── backend/              # Node.js + Express REST API, Prisma, Workflow Engine & 6 AI Agents
│   │   ├── prisma/           # schema.prisma & dev.db (SQLite) / PostgreSQL
│   │   ├── src/
│   │   │   ├── agents/       # Research, Script, Visual, Voice, Editor, QA Agents
│   │   │   ├── orchestrator/ # WorkflowEngine & Job State Machine
│   │   │   ├── controllers/  # Projects, Pipeline, Render
│   │   │   ├── routes/       # REST Endpoints
│   │   │   └── storage/      # Local Storage Service
│   │   └── test/             # api.test.ts (Toàn bộ 9 bài test tự động)
│   ├── frontend/             # React 18, Vite, Tailwind CSS, Lucide Icons
│   │   └── src/
│   │       ├── components/   # Stepper, ProjectCard, VideoPreview, Subtitle preview
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
    └── IMPLEMENTATION_PLAN.md# Kế hoạch triển khai & ADRs
```

---

## 4. Hướng dẫn cài đặt và Chạy thử nghiệm Local

### Yêu cầu môi trường
- **Node.js**: >= v20 (khuyến nghị v22+)
- **NPM**: >= v10
- **FFmpeg**: Đã cài đặt trên máy trạm (`ffmpeg -version`)

### 1. Cài đặt dependencies và sinh Prisma Client
```bash
cd vietsu-ai-studio
npm install
npm run build --workspace=@vietsu/shared
npm run build --workspace=@vietsu/ai-providers
npm run build --workspace=@vietsu/video-renderer
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

### 4. Chạy toàn bộ Test Suite & Render MP4 kiểm chứng
```bash
cd apps/backend
npm run test
```

---

## 5. Kết quả kiểm thử thực tế (Phase 1 Acceptance Criteria)

| Bài Kiểm Thử | Mục Tiêu Xác Minh | Trạng Thái |
|---|---|---|
| **Test 1: Storage Init** | Tạo đầy đủ `storage/assets`, `audio`, `videos`, `temp` | **PASSED ✓** |
| **Test 2: Provider Registry** | Tải đúng bộ Mock Providers, độc lập với API key trả phí | **PASSED ✓** |
| **Test 3: Historical Research** | Dữ liệu chính sử có nguồn trích dẫn (*Đại Việt Sử Ký Toàn Thư*), phân loại rõ `CONFIRMED_FACT` và `HISTORICAL_HYPOTHESIS` | **PASSED ✓** |
| **Test 4: Database CRUD** | Lưu trữ và truy vấn trạng thái dự án qua Prisma ORM | **PASSED ✓** |
| **Test 5: Pipeline Step 1** | Kích hoạt Research Agent, ghi job logs và chuyển sang trạm duyệt `RESEARCH_PENDING_APPROVAL` | **PASSED ✓** |
| **Test 6: Pipeline Step 2** | Duyệt sử liệu, kích hoạt Script Agent tạo cấu trúc 3 hồi và 4 phân cảnh | **PASSED ✓** |
| **Test 7: Pipeline Step 3** | Duyệt kịch bản, sinh song song ảnh 9:16 (SVG) và audio (WAV) kèm bảng word timestamps | **PASSED ✓** |
| **Test 8: Pipeline Step 4** | QA Agent chấm điểm chất lượng (96/100), kiểm tra an toàn Safe-Zone Facebook Reels | **PASSED ✓** |
| **Test 9: MP4 Export** | Remotion và FFmpeg bundle và render video MP4 1080×1920 thành công | **PASSED ✓** |

### Video MP4 đầu ra đã kiểm tra với FFprobe:
- **File**: `storage/videos/verification_test_1795065753713.mp4`
- **Kích thước**: 5,060,873 bytes (5.06 MB)
- **Độ phân giải**: `1080x1920` (chuẩn Reels 9:16)
- **Codec**: `H.264 / AAC`
- **Tốc độ khung hình**: 30 FPS

---

## 6. Lộ trình tiếp theo (Phase 2 & Phase 3)
- **Phase 2**:
  - Tích hợp Live AI Providers (OpenAI GPT-4o / Google Gemini cho kịch bản; Flux / Recraft cho ảnh; ElevenLabs / FPT AI cho giọng đọc tiếng Việt).
  - Tích hợp tương tác bản đồ động chuyển động quân sự.
- **Phase 3**:
  - Tích hợp Higgsfield AI API tạo video chuyển động.
  - Tự động hóa đăng tải lên Facebook Reels qua Graph API sau khi người dùng phê duyệt hoàn thiện.
