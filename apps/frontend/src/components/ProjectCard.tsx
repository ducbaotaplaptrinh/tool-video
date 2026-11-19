import React from 'react';
import { Play, Clock, DollarSign, Calendar, ChevronRight, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProjectSummary } from '../services/api.js';

interface ProjectCardProps {
  project: ProjectSummary;
  onSelect: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onDelete
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { text: 'Hoàn thành (Đã xuất MP4)', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'RENDERING':
        return { text: 'Đang Render MP4...', bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      case 'READY_TO_RENDER':
        return { text: 'Sẵn sàng Render', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'QA_CHECKING':
        return { text: 'Đang kiểm định QA', bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
      case 'EDITING':
        return { text: 'Đang dựng timeline', bg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' };
      case 'GENERATING_ASSETS':
        return { text: 'Đang sinh ảnh & audio', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'SCRIPT_PENDING_APPROVAL':
        return { text: 'Chờ duyệt kịch bản', bg: 'bg-amber-500/30 text-amber-300 border-amber-400/50' };
      case 'SCRIPTING':
        return { text: 'Đang viết kịch bản', bg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      case 'RESEARCH_PENDING_APPROVAL':
        return { text: 'Chờ duyệt sử liệu', bg: 'bg-orange-500/30 text-orange-300 border-orange-400/50' };
      case 'RESEARCHING':
        return { text: 'Đang nghiên cứu', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'FAILED':
        return { text: 'Gặp lỗi', bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
      default:
        return { text: 'Bản nháp (Draft)', bg: 'bg-slate-700/50 text-slate-300 border-slate-600/50' };
    }
  };

  const badge = getStatusBadge(project.status);

  return (
    <div 
      onClick={() => onSelect(project.id)}
      className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-amber-700/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 group relative flex flex-col justify-between shadow-lg hover:shadow-amber-900/10"
    >
      <div>
        {/* Era & Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-950/60 text-suvang-400 border border-amber-800/40">
            {project.historicalEra}
          </span>
          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${badge.bg}`}>
            {badge.text}
          </span>
        </div>

        {/* Project Title */}
        <h3 className="font-bold text-lg text-slate-100 group-hover:text-suvang-400 transition-colors line-clamp-2 mb-2 font-serif">
          {project.title}
        </h3>

        {/* Description or latest job log */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4">
          {project.description || 'Video phân tích sự kiện lịch sử Việt Nam với hình ảnh và âm thanh tái hiện sinh động.'}
        </p>
      </div>

      <div className="border-t border-slate-800/80 pt-3.5 mt-auto">
        {/* Meta metrics */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>~{project.targetDurationSec}s (9:16)</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 font-medium">
            <DollarSign className="w-3.5 h-3.5" />
            <span>${project.totalCostUSD.toFixed(3)} ({project.totalCostVND.toLocaleString()}đ)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(project.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onDelete(project.id, e)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Xóa dự án"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <span className="flex items-center gap-1 text-xs font-semibold text-suvang-400 group-hover:translate-x-0.5 transition-transform">
              Chi tiết <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
