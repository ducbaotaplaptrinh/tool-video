import { z } from 'zod';

export type HistoricalFactCategory = 'CONFIRMED_FACT' | 'HISTORICAL_HYPOTHESIS' | 'FOLKLORE_LEGEND';

export interface HistoricalCitation {
  id: string;
  sourceTitle: string;
  author: string;
  volumeOrChapter: string;
  pageOrSection?: string;
  quoteExcerpt: string;
  verificationUrl?: string;
}

export interface ResearchFact {
  id: string;
  category: HistoricalFactCategory;
  factSummary: string;
  yearOrEra: string;
  keyFigures: string[];
  location: string;
  citations: HistoricalCitation[];
}

export interface ResearchDossier {
  topic: string;
  historicalEra: string;
  summary: string;
  facts: ResearchFact[];
  verifiedAt: string;
  isApproved: boolean;
}

export type CameraMotion = 'ZOOM_IN' | 'ZOOM_OUT' | 'PAN_LEFT' | 'PAN_RIGHT' | 'STATIC';

export interface ScriptSceneDraft {
  sceneNumber: number;
  title: string;
  narrativeText: string;
  wordCount: number;
  estimatedDurationSec: number;
  visualPrompt: string;
  cameraMotion: CameraMotion;
  mapSpecs?: {
    center: string;
    markers: string[];
    route?: string;
  };
  factIds: string[];
}

export interface ScriptDocument {
  title: string;
  hook: string;
  context: string;
  climax: string;
  resolutionAndCta: string;
  fullNarrative: string;
  totalWords: number;
  estimatedTotalDurationSec: number;
  scenes: ScriptSceneDraft[];
  isApproved: boolean;
}

export interface WordTimestamp {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
}

export interface SceneAudioTrack {
  sceneNumber: number;
  audioUrl: string;
  localPath: string;
  durationSec: number;
  wordTimestamps: WordTimestamp[];
}

export interface VisualAsset {
  sceneNumber: number;
  assetType: 'IMAGE' | 'VIDEO' | 'MAP';
  url: string;
  localPath: string;
  prompt: string;
  cameraMotion: CameraMotion;
}

export interface RemotionSceneProps {
  sceneNumber: number;
  visualUrl: string;
  audioUrl: string;
  durationInFrames: number;
  cameraMotion: CameraMotion;
  subtitles: WordTimestamp[];
  citationBadge?: string;
}

export interface VietSuReelProps {
  projectId: string;
  title: string;
  historicalEra: string;
  fps: number;
  width: number;
  height: number;
  bgmUrl?: string;
  bgmVolume: number;
  scenes: RemotionSceneProps[];
}

export type ServiceType = 
  | 'LLM_RESEARCH' 
  | 'LLM_SCRIPT' 
  | 'IMAGE_GENERATION' 
  | 'VOICE_TTS' 
  | 'VIDEO_MOTION' 
  | 'QA_CHECK';

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

export type ProjectStatus =
  | 'DRAFT'
  | 'RESEARCHING'
  | 'RESEARCH_PENDING_APPROVAL'
  | 'SCRIPTING'
  | 'SCRIPT_PENDING_APPROVAL'
  | 'GENERATING_ASSETS'
  | 'EDITING'
  | 'QA_CHECKING'
  | 'READY_TO_RENDER'
  | 'RENDERING'
  | 'COMPLETED'
  | 'FAILED';

export interface JobRecord {
  id: string;
  projectId: string;
  step: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progressPercent: number;
  logs: string[];
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface QAReport {
  qaScore: number;
  isPassing: boolean;
  timingMatchScore: number;
  spellingQualityScore: number;
  sourceCitationScore: number;
  safeZoneCheckPassed: boolean;
  warnings: string[];
}

export interface ProjectDetail {
  id: string;
  title: string;
  description?: string;
  historicalEra: string;
  aspectRatio: string;
  targetDurationSec: number;
  status: ProjectStatus;
  researchDossier?: ResearchDossier;
  scriptDocument?: ScriptDocument;
  scenes?: RemotionSceneProps[];
  qaReport?: QAReport;
  renderedVideoUrl?: string;
  createdAt: string;
  updatedAt: string;
  costs: CostRecord[];
  jobs: JobRecord[];
}
