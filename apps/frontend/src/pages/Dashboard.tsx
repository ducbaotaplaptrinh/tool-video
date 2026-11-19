import React, { useState } from 'react';
import { ProjectCard } from '../components/ProjectCard.js';
import { ProjectSummary } from '../services/api.js';
import { Film, Sparkles, Filter, Plus, DollarSign, Layers } from 'lucide-react';

interface DashboardProps {
  projects: ProjectSummary[];
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string, e: React.MouseEvent) => void;
  onOpenCreateModal: () => void;
  loading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  onSelectProject,
  onDeleteProject,
  onOpenCreateModal,
  loading
}) => {
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'PENDING_APPROVAL'>('ALL');

  const filteredProjects = projects.filter((p) => {
    if (filter === 'COMPLETED') return p.status === 'COMPLETED';
    if (filter === 'IN_PROGRESS') {
      return ['RESEARCHING', 'SCRIPTING', 'GENERATING_ASSETS', 'EDITING', 'QA_CHECKING', 'RENDERING'].includes(p.status);
    }
    if (filter === 'PENDING_APPROVAL') {
      return ['RESEARCH_PENDING_APPROVAL', 'SCRIPT_PENDING_APPROVAL', 'READY_TO_RENDER'].includes(p.status);
    }
    return true;
  });

  const totalCostUSD = projects.reduce((sum, p) => sum + p.totalCostUSD, 0);
  const totalCostVND = projects.reduce((sum, p) => sum + p.totalCostVND, 0);
  const completedCount = projects.filter(p => p.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Studio Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-sudam-950 border border-amber-600/30 p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-suvang-500/20 border border-suvang-500/30 text-suvang-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nền tảng Tự Động Hóa Reels Lịch Sử Việt</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight leading-tight">
            Xưởng Sản Xuất Video Lịch Sử Việt Nam Chuẩn Facebook Reels
          </h1>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            Kết hợp 6 AI Agent chuyên trách: Nghiên cứu sử liệu có trích dẫn nguồn, biên kịch kịch tính 30-60s, tạo hình ảnh bản đồ &amp; thuyết minh tiếng Việt, tự động đồng bộ phụ đề động và render video MP4 1080×1920 với Remotion.
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-amber-900/40 text-xs">
            <div>
              <span className="text-slate-400 block">Tổng dự án video:</span>
              <strong className="text-xl text-white font-serif">{projects.length}</strong>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-slate-400 block">Đã xuất bản MP4:</span>
              <strong className="text-xl text-emerald-400 font-serif">{completedCount} video</strong>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-slate-400 block">Chi phí API tích lũy:</span>
              <strong className="text-xl text-suvang-400 font-serif">
                ${totalCostUSD.toFixed(3)} ({totalCostVND.toLocaleString()} đ)
              </strong>
            </div>
          </div>
        </div>

        {/* Ambient background decorative glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter Tabs & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${filter === 'ALL' ? 'bg-suvang-500 text-sudam-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Tất cả ({projects.length})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${filter === 'COMPLETED' ? 'bg-suvang-500 text-sudam-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Hoàn thành ({completedCount})
          </button>
          <button
            onClick={() => setFilter('PENDING_APPROVAL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${filter === 'PENDING_APPROVAL' ? 'bg-suvang-500 text-sudam-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Chờ người dùng duyệt
          </button>
          <button
            onClick={() => setFilter('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${filter === 'IN_PROGRESS' ? 'bg-suvang-500 text-sudam-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Đang chạy nền
          </button>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-suvang-500/50 text-white font-semibold text-xs transition-all"
        >
          <Plus className="w-4 h-4 text-suvang-400" />
          <span>Tạo dự án video mới</span>
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          Đang tải danh sách dự án...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-16 text-center max-w-lg mx-auto">
          <Film className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-200 font-serif">Chưa có video nào trong danh mục</h3>
          <p className="text-xs text-slate-400 mt-2 mb-6">
            Bắt đầu sản xuất video lịch sử đầu tiên của bạn với các gợi ý chủ đề có sẵn (Bạch Đằng 938, Rạch Gầm 1785...).
          </p>
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-suvang-500 to-amber-600 text-sudam-950 font-bold text-xs shadow-lg shadow-amber-600/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tạo Video Đầu Tiên</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onSelect={onSelectProject}
              onDelete={onDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
};
