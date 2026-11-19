import React from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  FileText, 
  Sparkles, 
  Sliders, 
  ShieldCheck, 
  Film, 
  ArrowRight,
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';

interface PipelineStepperProps {
  status: string;
  onApproveResearch: () => void;
  onApproveScript: () => void;
  onStartRender: () => void;
  onStartPipeline: () => void;
  onRetry?: () => void;
  loading: boolean;
}

const STEPS = [
  { key: 'RESEARCH', label: '1. Nghiên cứu', icon: BookOpen },
  { key: 'GATE_RESEARCH', label: '2. Duyệt sử liệu', icon: CheckCircle, isGate: true },
  { key: 'SCRIPT', label: '3. Kịch bản', icon: FileText },
  { key: 'GATE_SCRIPT', label: '4. Duyệt kịch bản', icon: CheckCircle, isGate: true },
  { key: 'ASSETS', label: '5. Ảnh & Voice', icon: Sparkles },
  { key: 'EDIT', label: '6. Dựng phim', icon: Sliders },
  { key: 'QA', label: '7. Thẩm định QA', icon: ShieldCheck },
  { key: 'RENDER', label: '8. Xuất MP4', icon: Film }
];

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  status,
  onApproveResearch,
  onApproveScript,
  onStartRender,
  onStartPipeline,
  onRetry,
  loading
}) => {
  const getStepState = (index: number) => {
    const statusMap: Record<string, number> = {
      'DRAFT': -1,
      'RESEARCHING': 0,
      'RESEARCH_PENDING_APPROVAL': 1,
      'SCRIPTING': 2,
      'SCRIPT_PENDING_APPROVAL': 3,
      'GENERATING_ASSETS': 4,
      'EDITING': 5,
      'QA_CHECKING': 6,
      'READY_TO_RENDER': 7,
      'RENDERING': 7,
      'COMPLETED': 8,
      'FAILED': -2
    };

    const currentPos = statusMap[status] ?? 0;
    if (currentPos > index) return 'completed';
    if (currentPos === index) return 'active';
    return 'pending';
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
        <div>
          <h3 className="font-bold text-white text-base font-serif flex items-center gap-2">
            <span>Tiến Trình Sản Xuất Tự Động (8 Giai Đoạn)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Mỗi dữ kiện đều được kiểm chứng và có 2 trạm kiểm duyệt trước khi sinh tài nguyên tốn phí.
          </p>
        </div>

        {/* Dynamic Action Trigger Bar */}
        <div className="flex items-center gap-3">
          {status === 'DRAFT' && (
            <button
              onClick={onStartPipeline}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-suvang-500 to-amber-600 text-sudam-950 font-bold text-xs shadow-lg shadow-amber-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Bắt Đầu Nghiên Cứu Sử Liệu</span>
            </button>
          )}

          {status === 'RESEARCH_PENDING_APPROVAL' && (
            <button
              onClick={onApproveResearch}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all animate-pulse"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Duyệt Sử Liệu &amp; Viết Kịch Bản</span>
            </button>
          )}

          {status === 'SCRIPT_PENDING_APPROVAL' && (
            <button
              onClick={onApproveScript}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all animate-pulse"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Duyệt Kịch Bản &amp; Sinh Ảnh/Audio</span>
            </button>
          )}

          {status === 'READY_TO_RENDER' && (
            <button
              onClick={onStartRender}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-600/20 hover:scale-[1.02] transition-all animate-pulse"
            >
              <Film className="w-4 h-4" />
              <span>Xuất Video MP4 (1080×1920)</span>
            </button>
          )}

          {status === 'COMPLETED' && (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>Đã Xuất MP4 Thành Công</span>
            </div>
          )}

          {status === 'FAILED' && onRetry && (
            <button
              onClick={onRetry}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs shadow-lg shadow-rose-600/20 hover:scale-[1.02] transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thử Lại Từ Bước Thất Bại (Retry)</span>
            </button>
          )}
        </div>
      </div>

      {/* Stepper items */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {STEPS.map((step, idx) => {
          const state = getStepState(idx);
          const Icon = step.icon;

          let cardStyle = 'bg-slate-950/60 border-slate-800 text-slate-500';
          let iconStyle = 'bg-slate-800 text-slate-400';

          if (state === 'completed') {
            cardStyle = 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300';
            iconStyle = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
          } else if (state === 'active') {
            cardStyle = 'bg-amber-950/40 border-suvang-500 text-suvang-300 ring-1 ring-suvang-500/50';
            iconStyle = 'bg-suvang-500 text-sudam-950';
          }

          return (
            <div
              key={step.key}
              className={`flex flex-col items-center text-center p-2.5 rounded-xl border transition-all ${cardStyle}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${iconStyle}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold leading-tight">{step.label}</span>
              {step.isGate && (
                <span className="text-[9px] uppercase tracking-wider text-amber-400/80 mt-0.5 font-semibold">
                  Trạm Duyệt
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
