import React from 'react';
import { FileText, Clock, Volume2, Camera, Sparkles, CheckCircle2 } from 'lucide-react';
import { ScriptDocument } from '@vietsu/shared';

interface ScriptTabProps {
  script: ScriptDocument | null;
}

export const ScriptTab: React.FC<ScriptTabProps> = ({ script }) => {
  if (!script) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h4 className="font-bold text-slate-300 text-sm">Chưa có kịch bản chi tiết</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Sau khi duyệt sử liệu, Script Agent sẽ tự động soạn kịch bản 3 hồi chuẩn định dạng Facebook Reels.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Script Header Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-suvang-400 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Kịch Bản Kể Chuyện Định Dạng Reels (30–60s)</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 font-medium bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <Volume2 className="w-3.5 h-3.5 text-suvang-400" />
              Tổng: <strong className="text-slate-200">{script.totalWords} từ</strong>
            </span>
            <span className="flex items-center gap-1 font-medium bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Thời lượng: <strong className="text-slate-200">~{script.estimatedTotalDurationSec}s</strong>
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white font-serif mb-4">{script.title}</h3>

        {/* Narrative Arc 4 Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-900/40">
            <span className="font-bold text-suvang-400 uppercase tracking-wider block mb-1">
              1. Hook Gợi Mở (0-3s)
            </span>
            <p className="text-slate-300 leading-relaxed italic font-serif">"{script.hook}"</p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="font-bold text-slate-300 uppercase tracking-wider block mb-1">
              2. Bối Cảnh Xung Đột
            </span>
            <p className="text-slate-300 leading-relaxed italic">"{script.context}"</p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-rose-950/40">
            <span className="font-bold text-rose-400 uppercase tracking-wider block mb-1">
              3. Cao Trào Chiến Thắng
            </span>
            <p className="text-slate-300 leading-relaxed italic">"{script.climax}"</p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-emerald-950/40">
            <span className="font-bold text-emerald-400 uppercase tracking-wider block mb-1">
              4. Bài Học &amp; CTA
            </span>
            <p className="text-slate-300 leading-relaxed italic">"{script.resolutionAndCta}"</p>
          </div>
        </div>
      </div>

      {/* Storyboard / Scenes list */}
      <div className="space-y-4">
        <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-suvang-400" />
          <span>Phân Cảnh Chi Tiết &amp; Visual Prompts ({script.scenes.length} cảnh)</span>
        </h4>

        <div className="grid grid-cols-1 gap-4">
          {script.scenes.map((scene) => (
            <div
              key={scene.sceneNumber}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-suvang-500/20 text-suvang-400 font-bold text-xs flex items-center justify-center border border-suvang-500/30">
                    {scene.sceneNumber}
                  </span>
                  <span className="font-bold text-sm text-white font-serif">{scene.title}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    {scene.wordCount} từ
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    ~{scene.estimatedDurationSec}s
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-950/50 text-suvang-400 border border-amber-800/40 font-mono">
                    {scene.cameraMotion}
                  </span>
                </div>
              </div>

              {/* Spoken Text */}
              <div className="mb-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Lời Thuyết Minh:
                </div>
                <p className="text-sm font-medium text-amber-100/90 leading-relaxed">
                  "{scene.narrativeText}"
                </p>
              </div>

              {/* Visual Prompt */}
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 text-xs">
                <div className="text-[11px] uppercase tracking-wider text-suvang-400/90 font-semibold mb-1 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Chỉ Dẫn Tạo Hình Ảnh / Visual Prompt (9:16):</span>
                </div>
                <p className="text-slate-400 font-mono text-[11px] leading-relaxed">
                  {scene.visualPrompt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
