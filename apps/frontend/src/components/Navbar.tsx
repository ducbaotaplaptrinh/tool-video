import React from 'react';
import { Video, ShieldCheck, Plus, Sparkles, Database, Film } from 'lucide-react';
import { SystemHealth } from '../services/api.js';

interface NavbarProps {
  health: SystemHealth | null;
  onOpenCreateModal: () => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  onOpenCreateModal,
  onGoHome
}) => {
  return (
    <header className="border-b border-amber-900/40 bg-sudam-950/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onGoHome}
          className="flex items-center gap-3.5 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-suvang-400 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-600/20 group-hover:scale-105 transition-transform border border-amber-300/30">
            <span className="font-serif font-extrabold text-sudam-950 text-xl tracking-tight">SỬ</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-xl text-amber-100 tracking-wide">ViệtSử AI Studio</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-suvang-400 border border-amber-500/30">
                Phase 1 Foundation
              </span>
            </div>
            <p className="text-xs text-slate-400">Tự động sản xuất video lịch sử chuẩn Facebook Reels (9:16)</p>
          </div>
        </div>

        {/* Center / Right tools */}
        <div className="flex items-center gap-4">
          {/* Health status */}
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            <div className={`w-2.5 h-2.5 rounded-full ${health?.status === 'HEALTHY' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-500 animate-pulse'}`} />
            <span className="text-slate-300 font-medium">
              {health?.status === 'HEALTHY' ? 'Hệ thống sẵn sàng' : 'Khởi động...'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 flex items-center gap-1">
              <Film className="w-3.5 h-3.5 text-suvang-400" /> Remotion + FFmpeg
            </span>
          </div>

          {/* New Project CTA */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-suvang-500 to-amber-600 hover:from-suvang-400 hover:to-amber-500 text-sudam-950 font-bold text-sm shadow-lg shadow-amber-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tạo Video Mới</span>
          </button>
        </div>
      </div>
    </header>
  );
};
