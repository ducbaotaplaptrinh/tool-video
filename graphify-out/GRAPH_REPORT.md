# Graph Report - vietsu-ai-studio  (2026-11-19)

## Corpus Check
- 84 files · ~40,443 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 5, .example 1, .prisma 1)

## Summary
- 663 nodes · 1273 edges · 35 communities (30 shown, 5 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 68 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e818a7fd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- shared/src/index.ts
- ProjectDetail.tsx
- workflow-engine.ts
- backend/package.json
- api.test.ts
- frontend/package.json
- video-renderer/package.json
- WorkflowEngine
- ref_react
- steps
- compilerOptions
- package.json
- 3. Quy trình sản xuất tự động 8 bước (Pipeline)
- ai-providers/package.json
- 2. Phân chia tác vụ chi tiết (Task Breakdown)
- 🇻🇳 VietSu AI Studio
- compilerOptions
- shared/package.json
- schemas/index.ts
- compilerOptions
- compilerOptions
- compilerOptions
- compilerOptions
- VietSu AI Studio - System Architecture (ARCHITECTURE.md)
- 🚀 VietSu AI Studio - Khung Đề Xuất Kỹ Thuật Tích Hợp AI (Phase 2 Framework)
- PipelineController
- runLivePipelineSuite
- VietSu AI Studio — Agent Operating Protocol (AGENTS.md)
- VietSu AI Studio — Blockers & Constraints
- VietSu AI Studio — Project State
- VietSu AI Studio — Test Status Inventory
- handoff.md
- resume-project.md

## God Nodes (most connected - your core abstractions)
1. `ResearchDossier` - 36 edges
2. `ScriptDocument` - 27 edges
3. `ProviderRegistry` - 26 edges
4. `WorkflowEngine` - 24 edges
5. `CostRecord` - 24 edges
6. `StorageService` - 18 edges
7. `ILLMProvider` - 17 edges
8. `compilerOptions` - 16 edges
9. `IImageProvider` - 16 edges
10. `ITTSProvider` - 16 edges

## Surprising Connections (you probably didn't know these)
- `💎 Giá trị cốt lõi` --references--> `JobRecoveryService`  [INFERRED]
  README.md → apps/backend/src/orchestrator/job-recovery.service.ts
- `8.2. Lộ trình Nâng cấp Sang SaaS Production` --references--> `StorageService`  [INFERRED]
  docs/ARCHITECTURE.md → apps/backend/src/storage/storage.service.ts
- `3.3. Visual Agent` --references--> `VisualAsset`  [INFERRED]
  docs/ARCHITECTURE.md → packages/shared/src/types/index.ts
- `2. Mô Hình Hóa Chi Phí Sản Xuất Theo Công Thức Toán Học` --references--> `CostRecord`  [INFERRED]
  docs/PHASE_2_PLAN.md → packages/shared/src/types/index.ts
- `Instructions for Incoming Agent (Step-by-Step)` --references--> `QAAgent`  [INFERRED]
  .agent-memory/HANDOFF.md → apps/backend/src/agents/qa-agent.ts

## Import Cycles
- None detected.

## Communities (35 total, 5 thin omitted)

### Community 0 - "shared/src/index.ts"
Cohesion: 0.08
Nodes (29): Task List & Progress, VietSu AI Studio — Current Task, ADR-006: Hybrid Real AI Provider Stack (Wikipedia + Pollinations + Edge-TTS), 1. Monorepo Architecture Overview, 6. Lớp trừu tượng hóa AI Provider (Provider Abstraction), ADR-003: Provider Plugin Interface & Mock Providers, Task 1.4: AI Provider Interfaces & Mock Implementations, IImageProvider (+21 more)

### Community 1 - "ProjectDetail.tsx"
Cohesion: 0.07
Nodes (33): App(), CreateProjectModal(), CreateProjectModalProps, PRESET_TOPICS, JobsAndCostTab(), JobsAndCostTabProps, Navbar(), NavbarProps (+25 more)

### Community 2 - "workflow-engine.ts"
Cohesion: 0.09
Nodes (19): VisualAgent, VoiceAgent, RenderController, prisma, app, storage, JobRecoveryService, videoRendererDir (+11 more)

### Community 3 - "backend/package.json"
Cohesion: 0.07
Nodes (37): dependencies, cors@^2.8.5, dotenv@^16.4.5, express@^4.19.2, @prisma/client@^5.19.1, @vietsu/ai-providers@*, @vietsu/shared@*, zod@^3.23.8 (+29 more)

### Community 4 - "api.test.ts"
Cohesion: 0.10
Nodes (23): EditorAgent, QAAgent, ScriptAgent, 3.1. Research Agent, 3.2. Script Agent, 3.3. Visual Agent, 3.4. Voice Agent, 3.5. Editor Agent (+15 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.08
Nodes (32): dependencies, lucide-react@^0.441.0, react@^18.3.1, react-dom@^18.3.1, @vietsu/shared@*, devDependencies, autoprefixer@^10.4.20, postcss@^8.4.47 (+24 more)

### Community 6 - "video-renderer/package.json"
Cohesion: 0.09
Nodes (28): dependencies, react@^18.3.1, react-dom@^18.3.1, remotion@^4.0.218, @remotion/cli@^4.0.218, @remotion/renderer@^4.0.218, @vietsu/shared@*, devDependencies (+20 more)

### Community 7 - "WorkflowEngine"
Cohesion: 0.14
Nodes (13): ADR-001: Monorepo Architecture with Strict Package Boundaries, ADR-002: In-Memory Mutex Lock for MVP vs Distributed Redis Lock for SaaS, ADR-003: Epistemic Grounding & Source Verification (`isIndependentlyVerified`), ADR-004: Remotion Subtitle Safe-Zone (Y: 280px from bottom), ADR-005: Graphify for Deterministic Local Code Knowledge Graph, VietSu AI Studio — Architectural Decision Records (ADRs), Instructions for Incoming Agent (Step-by-Step), Session State at Last Handoff (+5 more)

### Community 8 - "ref_react"
Cohesion: 0.15
Nodes (13): HistoricalBadge(), HistoricalBadgeProps, KenBurnsScene(), KenBurnsSceneProps, KineticSubtitles(), KineticSubtitlesProps, defaultReelProps, RemotionRoot() (+5 more)

### Community 9 - "steps"
Cohesion: 0.10
Nodes (19): env, runs-on, steps, DATABASE_URL, NODE_ENV, jobs, build-and-test, name (+11 more)

### Community 10 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 11 - "package.json"
Cohesion: 0.11
Nodes (17): author, description, keywords, license, name, private, scripts, build (+9 more)

### Community 12 - "3. Quy trình sản xuất tự động 8 bước (Pipeline)"
Cohesion: 0.12
Nodes (16): 1. Giới thiệu & Tầm nhìn sản phẩm, 2. Đối tượng người dùng & Chân dung người xem, 3. Quy trình sản xuất tự động 8 bước (Pipeline), 4. Bảng tính năng & Phân loại chi phí API, 5. Giấy phép thương mại và Pháp lý bản quyền, 6. Lộ trình phát triển sản phẩm (Roadmap), Bước 1: Nghiên cứu và Kiểm chứng sự kiện (Research Agent), Bước 2: Tạo kịch bản kể chuyện 30–60 giây (Script Agent) (+8 more)

### Community 13 - "ai-providers/package.json"
Cohesion: 0.15
Nodes (15): dependencies, @vietsu/shared@*, zod@^3.23.8, devDependencies, typescript@^5.5.4, typescript, @vietsu/shared, zod (+7 more)

### Community 14 - "2. Phân chia tác vụ chi tiết (Task Breakdown)"
Cohesion: 0.13
Nodes (14): 1. Kế hoạch triển khai Phase 1: Nền tảng (Foundation), 2. Phân chia tác vụ chi tiết (Task Breakdown), 3. Kiến trúc Quyết định (Architectural Decision Records - ADR), ADR-001: Quản lý Monorepo bằng npm workspaces, ADR-002: Dual Database Strategy với Prisma (PostgreSQL / SQLite), ADR-004: Tích hợp Remotion Rendering trực tiếp, ADR-005: Human-In-The-Loop Approval Gates, Task 1.1: Monorepo Setup & Workspace Configuration (+6 more)

### Community 15 - "🇻🇳 VietSu AI Studio"
Cohesion: 0.13
Nodes (14): 1. Cài đặt dependencies và chuẩn bị database, 1. Giới thiệu tổng quan, 2. Khởi chạy Backend Server (Port 5000), 2. Quy trình 8 bước (Multi-Agent Pipeline), 3. Khởi chạy Frontend Dashboard (Port 3000), 4. Chạy toàn bộ Test Suite (13 bài kiểm thử chuyên sâu), 4. Danh sách tính năng chưa triển khai ở Phase 1 (Chờ Phase 2), 5. Cấu trúc Monorepo (+6 more)

### Community 16 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, jsx, module, moduleResolution, outDir (+5 more)

### Community 17 - "shared/package.json"
Cohesion: 0.16
Nodes (13): dependencies, zod@^3.23.8, devDependencies, typescript@^5.5.4, typescript, zod, main, name (+5 more)

### Community 18 - "schemas/index.ts"
Cohesion: 0.14
Nodes (12): CameraMotionSchema, CreateProjectSchema, HistoricalCitationSchema, HistoricalFactCategorySchema, QAReportSchema, RemotionScenePropsSchema, ResearchDossierSchema, ResearchFactSchema (+4 more)

### Community 19 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir (+4 more)

### Community 20 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir (+4 more)

### Community 21 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir (+4 more)

### Community 22 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, resolveJsonModule (+4 more)

### Community 23 - "VietSu AI Studio - System Architecture (ARCHITECTURE.md)"
Cohesion: 0.18
Nodes (10): 1. Tổng quan hệ thống, 2. Cấu trúc thư mục Monorepo, 4. Máy trạng thái Dự án & Vòng đời Job (Project & Job Lifecycle), 5. Mô hình Dữ liệu (Prisma Database Schema), 7. Kiến trúc Render Video bằng Remotion, 8.1. Đánh giá Cơ chế Khóa Concurrency Hiện tại, 8.2. Lộ trình Nâng cấp Sang SaaS Production, 8. Định hướng Mở rộng SaaS & Xử lý Phân tán (SaaS Architecture & Distributed Workers) (+2 more)

### Community 24 - "🚀 VietSu AI Studio - Khung Đề Xuất Kỹ Thuật Tích Hợp AI (Phase 2 Framework)"
Cohesion: 0.25
Nodes (7): 1. Khung Tiêu Chí Đánh Giá Ứng Viên AI (Candidate Evaluation Framework), 2. Mô Hình Hóa Chi Phí Sản Xuất Theo Công Thức Toán Học, 3. Kiến Trúc Tách Biệt & Cấu Hình Mềm (Vendor-Agnostic Design), 4. Quy Trình Bảo Đảm Độ Tin Cậy Khi Đưa AI Vào Vận Hành, B. AI Tạo Hình Ảnh Minh Họa Cổ Phong & Bản Đồ (Visual Agent), C. AI Giọng Thuyết Minh Tiếng Việt & Khớp Phụ Đề (Voice Agent), 🚀 VietSu AI Studio - Khung Đề Xuất Kỹ Thuật Tích Hợp AI (Phase 2 Framework)

### Community 28 - "runLivePipelineSuite"
Cohesion: 0.33
Nodes (4): execAsync, runLivePipelineSuite(), sleep(), WikipediaHistoricalResearcher

### Community 29 - "VietSu AI Studio — Agent Operating Protocol (AGENTS.md)"
Cohesion: 0.40
Nodes (4): 1. Agent Entry Checkpoint (On Session Start), 2. Agent Exit Checkpoint (Before Turn Completion), 3. Core Development Principles, VietSu AI Studio — Agent Operating Protocol (AGENTS.md)

### Community 30 - "VietSu AI Studio — Blockers & Constraints"
Cohesion: 0.50
Nodes (3): Active Blockers, Constraints & Operating Boundaries, VietSu AI Studio — Blockers & Constraints

### Community 31 - "VietSu AI Studio — Project State"
Cohesion: 0.50
Nodes (3): 2. Active AI Agent Pipeline, 3. Database State & Schemas, VietSu AI Studio — Project State

### Community 32 - "VietSu AI Studio — Test Status Inventory"
Cohesion: 0.50
Nodes (3): Command to Run Test Suite, Test Inventory (All 18 Passing Cases), VietSu AI Studio — Test Status Inventory

## Knowledge Gaps
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `ProjectDetail.tsx` to `frontend/package.json`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `ResearchDossier` (e.g. with `1. Monorepo Architecture Overview` and `3.1. Research Agent`) actually correct?**
  _`ResearchDossier` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `shared/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0807108478341355 - nodes in this community are weakly interconnected._
- **Why does `ResearchDossier` connect `api.test.ts` to `shared/src/index.ts`, `ProjectDetail.tsx`, `workflow-engine.ts`, `WorkflowEngine`, `runLivePipelineSuite`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `ScriptDocument` (e.g. with `1. Monorepo Architecture Overview` and `3.2. Script Agent`) actually correct?**
  _`ScriptDocument` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Should `ProjectDetail.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0715846994535519 - nodes in this community are weakly interconnected._
- **Why does `express` connect `workflow-engine.ts` to `backend/package.json`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._