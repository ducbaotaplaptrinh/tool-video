import React from 'react';
import { ShieldCheck, BookOpen, ExternalLink, MapPin, Calendar, Users, AlertTriangle } from 'lucide-react';
import { ResearchDossier, ResearchFact, HistoricalCitation } from '@vietsu/shared';

interface ResearchTabProps {
  dossier: ResearchDossier | null;
}

export const ResearchTab: React.FC<ResearchTabProps> = ({ dossier }) => {
  if (!dossier) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
        <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h4 className="font-bold text-slate-300 text-sm">Chưa có dữ liệu nghiên cứu sử liệu</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Nhấn "Bắt đầu Nghiên cứu" ở thanh tiến trình để Research Agent tiến hành đối chiếu và trích xuất nguồn sử học.
        </p>
      </div>
    );
  }

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'CONFIRMED_FACT':
        return {
          label: 'Chính Sử Xác Nhận',
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
        };
      case 'HISTORICAL_HYPOTHESIS':
        return {
          label: 'Giả Thuyết Khảo Cổ / Lịch Sử',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        };
      case 'FOLKLORE_LEGEND':
        return {
          label: 'Truyền Thuyết Dân Gian',
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
        };
      default:
        return {
          label: 'Dữ Kiện Sử Học',
          bg: 'bg-slate-700/50 text-slate-300 border-slate-600'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Dossier Overview */}
      <div className="bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-700/30 rounded-2xl p-6">
        <div className="flex items-center gap-2.5 text-suvang-400 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Hồ Sơ Nghiên Cứu Thẩm Định Sử Học</span>
        </div>
        <h3 className="text-xl font-bold text-white font-serif mb-2">
          {dossier.topic}
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          {dossier.summary}
        </p>
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-amber-900/40 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-suvang-400" />
            Thời kỳ: <strong className="text-slate-200">{dossier.historicalEra}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Thời gian xác thực: <strong className="text-slate-200">{new Date(dossier.verifiedAt).toLocaleString('vi-VN')}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            Tổng số dữ kiện: <strong className="text-suvang-400">{dossier.facts.length} mốc</strong>
          </span>
        </div>
      </div>

      {/* Facts & Citations List */}
      <div className="space-y-4">
        <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-suvang-400" />
          <span>Dữ Kiện Đã Khảo Chứng &amp; Trích Dẫn Sử Liệu Gốc</span>
        </h4>

        {dossier.facts.map((fact, idx) => {
          const cat = getCategoryBadge(fact.category);
          return (
            <div
              key={fact.id || idx}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${cat.bg}`}>
                  {cat.label}
                </span>
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {fact.yearOrEra}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-100 leading-relaxed mb-4">
                {fact.factSummary}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400 mb-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-suvang-400 shrink-0" />
                  <span>Nhân vật: <strong className="text-slate-200">{fact.keyFigures.join(', ')}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Địa danh: <strong className="text-slate-200">{fact.location}</strong></span>
                </div>
              </div>

              {/* Citations Box */}
              <div className="border-t border-slate-800/80 pt-3">
                <div className="text-[11px] uppercase tracking-wider text-suvang-400 font-bold mb-2">
                  Trích Dẫn Nguồn Thẩm Định:
                </div>
                <div className="space-y-2">
                  {fact.citations.map((cite) => (
                    <div
                      key={cite.id}
                      className="bg-slate-950/80 border border-amber-950/50 rounded-xl p-3 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2 font-semibold text-slate-200 mb-1">
                        <span>{cite.sourceTitle} — {cite.author}</span>
                        <span className="text-slate-400 text-[11px] font-normal">{cite.volumeOrChapter}</span>
                      </div>
                      <blockquote className="text-slate-300 italic border-l-2 border-amber-600 pl-2.5 my-1.5">
                        "{cite.quoteExcerpt}"
                      </blockquote>
                      {cite.verificationUrl && (
                        <a
                          href={cite.verificationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-suvang-400 hover:underline mt-1"
                        >
                          <span>Xem đối chiếu nguồn</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
