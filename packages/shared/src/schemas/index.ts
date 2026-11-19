import { z } from 'zod';

export const HistoricalFactCategorySchema = z.enum([
  'CONFIRMED_FACT',
  'HISTORICAL_HYPOTHESIS',
  'FOLKLORE_LEGEND'
]);

export const HistoricalCitationSchema = z.object({
  id: z.string().min(1),
  sourceTitle: z.string().min(1, 'Tiêu đề nguồn tài liệu không được để trống'),
  author: z.string().min(1, 'Tác giả nguồn không được để trống'),
  volumeOrChapter: z.string().min(1, 'Quyển hoặc chương sử liệu không được để trống'),
  pageOrSection: z.string().optional(),
  quoteExcerpt: z.string().min(5, 'Trích dẫn xác minh phải có ít nhất 5 ký tự'),
  verificationUrl: z.string().url().optional().or(z.literal('')),
  isMockSource: z.boolean().optional().default(false),
  isIndependentlyVerified: z.boolean().optional().default(false),
  verificationEvidence: z.string().optional(),
  verificationLevel: z.enum(['UNVERIFIED', 'WIKIPEDIA_SECONDARY_SOURCE', 'PRIMARY_HISTORICAL_CHRONICLE']).default('WIKIPEDIA_SECONDARY_SOURCE')
});

export const ResearchFactSchema = z.object({
  id: z.string().min(1),
  category: HistoricalFactCategorySchema,
  factSummary: z.string().min(10, 'Tóm tắt sự kiện tối thiểu 10 ký tự'),
  yearOrEra: z.string().min(1),
  keyFigures: z.array(z.string()).min(1, 'Phải có ít nhất một nhân vật liên quan'),
  location: z.string().min(1, 'Địa danh lịch sử không được để trống'),
  citations: z.array(HistoricalCitationSchema).min(1, 'Dữ kiện bắt buộc phải có ít nhất một nguồn trích dẫn kiểm chứng'),
  isApproved: z.boolean().optional().default(false),
  isMockSource: z.boolean().optional().default(false)
});

export const ResearchDossierSchema = z.object({
  topic: z.string().min(3, 'Chủ đề nghiên cứu phải từ 3 ký tự'),
  historicalEra: z.string().min(2, 'Thời kỳ lịch sử không được để trống'),
  summary: z.string().min(20, 'Tóm tắt sự kiện phải từ 20 ký tự'),
  facts: z.array(ResearchFactSchema).min(1, 'Bản nghiên cứu phải có ít nhất một dữ kiện đã kiểm chứng'),
  verifiedAt: z.string(),
  isApproved: z.boolean().default(false),
  isMockEngine: z.boolean().optional().default(false)
});

export const CameraMotionSchema = z.enum([
  'ZOOM_IN',
  'ZOOM_OUT',
  'PAN_LEFT',
  'PAN_RIGHT',
  'STATIC'
]);

export const ScriptSceneDraftSchema = z.object({
  sceneNumber: z.number().int().positive(),
  title: z.string().min(2),
  narrativeText: z.string().min(5, 'Lời thoại phân cảnh tối thiểu 5 ký tự'),
  wordCount: z.number().int().nonnegative(),
  estimatedDurationSec: z.number().positive(),
  visualPrompt: z.string().min(10, 'Prompt trực quan tối thiểu 10 ký tự'),
  cameraMotion: CameraMotionSchema.default('ZOOM_IN'),
  mapSpecs: z.object({
    center: z.string(),
    markers: z.array(z.string()),
    route: z.string().optional()
  }).optional(),
  factIds: z.array(z.string()).default([])
});

export const ScriptDocumentSchema = z.object({
  title: z.string().min(3),
  hook: z.string().min(10, 'Hook mở đầu tối thiểu 10 ký tự'),
  context: z.string().min(15, 'Bối cảnh tối thiểu 15 ký tự'),
  climax: z.string().min(15, 'Cao trào tối thiểu 15 ký tự'),
  resolutionAndCta: z.string().min(10, 'Kết thúc và CTA tối thiểu 10 ký tự'),
  fullNarrative: z.string().min(50, 'Toàn văn kịch bản tối thiểu 50 ký tự'),
  totalWords: z.number().int().positive(),
  estimatedTotalDurationSec: z.number().min(15).max(120),
  scenes: z.array(ScriptSceneDraftSchema).min(2, 'Kịch bản phải có ít nhất 2 phân cảnh'),
  isApproved: z.boolean().default(false)
});

export const WordTimestampSchema = z.object({
  word: z.string(),
  start: z.number().nonnegative(),
  end: z.number().nonnegative()
});

export const SubtitleLayoutSpecsSchema = z.object({
  bottomPx: z.number().default(280),
  maxWordsPerChunk: z.number().default(6),
  maxWidthPx: z.number().default(900)
});

export const VisualShotSchema = z.object({
  visualUrl: z.string().min(1),
  durationInFrames: z.number().int().positive(),
  cameraMotion: CameraMotionSchema.default('ZOOM_IN'),
  transition: z.enum(['cut', 'crossfade']).default('cut')
});

export const RemotionScenePropsSchema = z.object({
  sceneNumber: z.number().int().positive(),
  visualUrl: z.string().min(1),
  audioUrl: z.string().min(1),
  durationInFrames: z.number().int().positive(),
  cameraMotion: CameraMotionSchema,
  subtitles: z.array(WordTimestampSchema),
  citationBadge: z.string().optional(),
  subtitleLayout: SubtitleLayoutSpecsSchema.optional(),
  visualShots: z.array(VisualShotSchema).optional()
});

export const VietSuReelPropsSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1),
  historicalEra: z.string().min(1),
  fps: z.number().int().positive().default(30),
  width: z.number().int().positive().default(1080),
  height: z.number().int().positive().default(1920),
  bgmUrl: z.string().optional(),
  bgmVolume: z.number().min(0).max(1).default(0.25),
  scenes: z.array(RemotionScenePropsSchema).min(1),
  showBranding: z.boolean().default(false),
  showHistoricalBadge: z.boolean().default(false)
});

export const CreateProjectSchema = z.object({
  title: z.string().min(3, 'Tên chủ đề phải từ 3 ký tự trở lên'),
  description: z.string().optional(),
  historicalEra: z.string().min(2, 'Vui lòng chọn hoặc nhập thời kỳ lịch sử'),
  targetDurationSec: z.number().min(30).max(90).default(45),
  useMockProvider: z.boolean().default(true)
});

export const QAReportSchema = z.object({
  qaScore: z.number().min(0).max(100),
  isPassing: z.boolean(),
  timingMatchScore: z.number().min(0).max(100),
  spellingQualityScore: z.number().min(0).max(100),
  sourceCitationScore: z.number().min(0).max(100),
  subtitleSyncScore: z.number().min(0).max(100).default(100),
  safeZoneCheckPassed: z.boolean(),
  isIndependentlyVerified: z.boolean().default(false),
  warnings: z.array(z.string()),
  detailedChecks: z.record(z.boolean()).default({})
});
