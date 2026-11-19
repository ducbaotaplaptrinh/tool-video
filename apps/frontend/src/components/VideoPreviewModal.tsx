import React from 'react';
import { X, Download, ShieldCheck, CheckCircle2, AlertTriangle, Film, ExternalLink } from 'lucide-react';
import { QAReport } from '@vietsu/shared';

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  projectTitle: string;
  qaReport?: QAReport | null;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  projectTitle,
  qaReport
}) => {
  if (!isOpen || !videoUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-700/50 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-serif">{projectTitle}</h2>
            <p className="text-xs text-slate-400">Video thành phẩm xuất chuẩn Facebook Reels (1080×1920, 30fps, H.264/AAC)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Video Player 9:16 Column */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative aspect-[9/16] w-full max-w-[280px] bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-600/40">
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>

            <a
              href={videoUrl}
              download={`${projectTitle.replace(/\s+/g, '_')}_1080x1920.mp4`}
              className="mt-4 flex items-center justify-center gap-2 w-full max-w-[280px] py-2.5 rounded-xl bg-gradient-to-r from-suvang-500 to-amber-600 hover:from-suvang-400 hover:to-amber-500 text-sudam-950 font-bold text-xs shadow-lg shadow-amber-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Tải Video MP4 Về Máy</span>
            </a>
          </div>

          {/* QA Report & Specs Column */}
          <div className="md:col-span-7 space-y-4 text-xs">
            {/* QA Score Card */}
            {qaReport && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-white text-sm">Báo Cáo Kiểm Định QA Agent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-emerald-400 font-mono">
                      {qaReport.qaScore}
                    </span>
                    <span className="text-slate-500 text-sm">/ 100</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Độ khớp thời lượng âm thanh/hình ảnh:</span>
                      <strong className="text-emerald-400">{qaReport.timingMatchScore}%</strong>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${qaReport.timingMatchScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Chất lượng văn phong &amp; lời thoại:</span>
                      <strong className="text-emerald-400">{qaReport.spellingQualityScore}%</strong>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${qaReport.spellingQualityScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Chứng thực nguồn sử học:</span>
                      <strong className="text-emerald-400">{qaReport.sourceCitationScore}%</strong>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${qaReport.sourceCitationScore}%` }} />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-slate-300">
                    <span>Vùng an toàn Safe-Zone Facebook Reels:</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Đạt chuẩn
                    </span>
                  </div>
                </div>

                {qaReport.warnings.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-1">
                    <span className="font-semibold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Lưu ý kiểm duyệt:
                    </span>
                    {qaReport.warnings.map((w, idx) => (
                      <p key={idx} className="text-slate-400 text-[11px]">• {w}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Video Specs Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider block">
                Thông số kỹ thuật video
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
                <div>• Độ phân giải: <strong className="text-slate-200">1080 × 1920</strong></div>
                <div>• Tỷ lệ: <strong className="text-slate-200">9:16 (Vertical Reel)</strong></div>
                <div>• Tốc độ khung hình: <strong className="text-slate-200">30 FPS</strong></div>
                <div>• Định dạng: <strong className="text-slate-200">MP4 (H.264 / AAC)</strong></div>
                <div>• Công cụ render: <strong className="text-suvang-400">Remotion 4.0 + FFmpeg</strong></div>
                <div>• Phụ đề: <strong className="text-slate-200">Kinetic Subtitle Burned-in</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
