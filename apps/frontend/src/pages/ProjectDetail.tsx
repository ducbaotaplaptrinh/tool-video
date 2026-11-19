import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Film, 
  BookOpen, 
  FileText, 
  Layers, 
  Activity, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle, 
  Trash2, 
  ExternalLink 
} from 'lucide-react';
import { ApiService } from '../services/api.js';
import { PipelineStepper } from '../components/PipelineStepper.js';
import { ResearchTab } from '../components/ResearchTab.js';
import { ScriptTab } from '../components/ScriptTab.js';
import { ScenesTab } from '../components/ScenesTab.js';
import { JobsAndCostTab } from '../components/JobsAndCostTab.js';
import { VideoPreviewModal } from '../components/VideoPreviewModal.js';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'research' | 'script' | 'scenes' | 'jobs'>('research');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const loadProject = async () => {
    try {
      const data = await ApiService.getProject(projectId);
      setProject(data);
    } catch (err: any) {
      console.error('Lỗi tải thông tin dự án:', err);
    }
  };

  useEffect(() => {
    loadProject();

    // Auto-polling when project is actively processing
    const interval = setInterval(() => {
      if (
        project && 
        ['RESEARCHING', 'SCRIPTING', 'GENERATING_ASSETS', 'EDITING', 'QA_CHECKING', 'RENDERING'].includes(project.status)
      ) {
        loadProject();
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [projectId, project?.status]);

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        Đang tải thông tin chi tiết dự án...
      </div>
    );
  }

  const handleStartPipeline = async () => {
    setActionLoading(true);
    try {
      await ApiService.startPipeline(projectId);
      await loadProject();
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveResearch = async () => {
    setActionLoading(true);
    try {
      await ApiService.approveResearch(projectId);
      await loadProject();
      setActiveTab('script');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveScript = async () => {
    setActionLoading(true);
    try {
      await ApiService.approveScript(projectId);
      await loadProject();
      setActiveTab('scenes');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartRender = async () => {
    setActionLoading(true);
    try {
      await ApiService.renderVideo(projectId);
      await loadProject();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header / Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-suvang-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh sách Dự án</span>
        </button>

        {project.renderedVideoUrl && (
          <button
            onClick={() => setShowVideoModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all"
          >
            <Film className="w-4 h-4" />
            <span>Xem Video MP4 (1080×1920)</span>
          </button>
        )}
      </div>

      {/* Project Title Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-md bg-amber-950/80 text-suvang-400 border border-amber-800/40">
              {project.historicalEra}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Khung hình 9:16 • ~{project.targetDurationSec}s
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif leading-tight">
            {project.title}
          </h1>

          <p className="text-xs text-slate-400 mt-2 max-w-2xl">
            {project.description || 'Quy trình sản xuất tự động sử học Việt Nam dành cho Facebook Reels.'}
          </p>
        </div>

        {/* Quick Refresh */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadProject}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Làm mới trạng thái"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 8-Stage Pipeline Stepper */}
      <PipelineStepper
        status={project.status}
        onStartPipeline={handleStartPipeline}
        onApproveResearch={handleApproveResearch}
        onApproveScript={handleApproveScript}
        onStartRender={handleStartRender}
        loading={actionLoading}
      />

      {/* Tabs Navigation */}
      <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('research')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'research'
              ? 'border-suvang-400 text-suvang-400 font-bold bg-amber-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>1. Thẩm Định Sử Liệu &amp; Nguồn ({project.researchDossier?.facts?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('script')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'script'
              ? 'border-suvang-400 text-suvang-400 font-bold bg-amber-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>2. Kịch Bản &amp; Storyboard ({project.scriptDocument?.scenes?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('scenes')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'scenes'
              ? 'border-suvang-400 text-suvang-400 font-bold bg-amber-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. Tài Nguyên Phân Cảnh (9:16)</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'jobs'
              ? 'border-suvang-400 text-suvang-400 font-bold bg-amber-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>4. Logs Tiến Trình &amp; Chi Phí API</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'research' && (
          <ResearchTab dossier={project.researchDossier} />
        )}

        {activeTab === 'script' && (
          <ScriptTab script={project.scriptDocument} />
        )}

        {activeTab === 'scenes' && (
          <ScenesTab scenes={project.scenes || []} />
        )}

        {activeTab === 'jobs' && (
          <JobsAndCostTab jobs={project.jobs || []} costs={project.costs || []} />
        )}
      </div>

      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoUrl={project.renderedVideoUrl}
        projectTitle={project.title}
        qaReport={project.qaReport}
      />
    </div>
  );
};
