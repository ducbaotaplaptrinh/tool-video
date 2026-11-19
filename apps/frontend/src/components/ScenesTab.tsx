import React from 'react';
import { Film, Play, Image as ImageIcon, Volume2, Clock, Sparkles } from 'lucide-react';

interface SceneItem {
  sceneNumber: number;
  visualUrl: string;
  audioUrl: string;
  durationInFrames: number;
  cameraMotion: string;
  subtitles: { word: string; start: number; end: number }[];
  citationBadge?: string;
}

interface ScenesTabProps {
  scenes: SceneItem[];
}

export const ScenesTab: React.FC<ScenesTabProps> = ({ scenes }) => {
  if (!scenes || scenes.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
        <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h4 className="font-bold text-slate-300 text-sm">Chưa có tài nguyên phân cảnh</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Sau khi duyệt kịch bản, Visual Agent và Voice Agent sẽ tự động sinh hình ảnh 9:16 và âm thanh thuyết minh tương ứng.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-suvang-400" />
          <span>Thư Viện Tài Nguyên Phân Cảnh (Định dạng Reels 9:16)</span>
        </h4>
        <span className="text-xs text-slate-400">
          Tổng cộng: <strong className="text-suvang-400">{scenes.length} cảnh</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {scenes.map((scene) => (
          <div
            key={scene.sceneNumber}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:border-amber-700/50 transition-all shadow-lg group"
          >
            {/* Visual Box (9:16 ratio) */}
            <div className="relative aspect-[9/16] bg-slate-950 overflow-hidden border-b border-slate-800">
              {scene.visualUrl ? (
                <img
                  src={scene.visualUrl}
                  alt={`Phân cảnh ${scene.sceneNumber}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                  <ImageIcon className="w-10 h-10 mb-2" />
                  <span className="text-xs">Đang sinh ảnh...</span>
                </div>
              )}

              {/* Scene Number Badge */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur border border-suvang-500/50 text-suvang-400 font-bold text-xs">
                Cảnh {scene.sceneNumber}
              </div>

              {/* Motion Tag */}
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/70 text-[10px] text-slate-300 font-mono">
                {scene.cameraMotion}
              </div>

              {/* Duration Tag */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{(scene.durationInFrames / 30).toFixed(1)}s</span>
              </div>
            </div>

            {/* Audio & Subtitle Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              {/* Audio player */}
              {scene.audioUrl ? (
                <div className="mb-3">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-suvang-400" />
                    <span>Thuyết minh giọng đọc:</span>
                  </div>
                  <audio
                    src={scene.audioUrl}
                    controls
                    className="w-full h-8 rounded-lg"
                  />
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic mb-3">Chưa có tệp âm thanh</div>
              )}

              {/* Word Timestamps preview */}
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                  Phụ đề đồng bộ ({scene.subtitles?.length || 0} từ):
                </div>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1.5 rounded-lg bg-slate-950 text-[11px]">
                  {scene.subtitles && scene.subtitles.length > 0 ? (
                    scene.subtitles.map((sub, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-suvang-400 hover:bg-slate-700 cursor-default"
                        title={`${sub.start}s - ${sub.end}s`}
                      >
                        {sub.word}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">Không có phụ đề</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
