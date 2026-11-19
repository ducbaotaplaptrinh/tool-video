import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Clock, Loader2 } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    historicalEra: string;
    targetDurationSec: number;
    autoStart: boolean;
  }) => Promise<void>;
}

const PRESET_TOPICS = [
  {
    title: 'Chiến thắng Bạch Đằng 938: Bãi cọc ngầm chấm dứt nghìn năm Bắc thuộc',
    era: 'Thời kỳ Tự chủ & Tiền Ngô',
    duration: 30,
    desc: 'Trận thủy chiến lịch sử trên sông Bạch Đằng năm 938 của Ngô Quyền tiêu diệt quân Nam Hán.'
  },
  {
    title: 'Sấm sét Rạch Gầm - Xoài Mút 1785: 5 vạn quân Xiêm khiếp đảm Tây Sơn',
    era: 'Thời kỳ Tây Sơn (1778 - 1802)',
    duration: 30,
    desc: 'Nguyễn Huệ chỉ huy hỏa công tiêu diệt 5 vạn quân Xiêm La trên sông Tiền.'
  },
  {
    title: 'Hội nghị Diên Hồng 1284: Tiếng hô "ĐÁNH!" rung chuyển trời Nam',
    era: 'Nhà Trần (1225 - 1400)',
    duration: 45,
    desc: 'Ý chí triệu người như một của các bô lão trước họa xâm lăng của đế quốc Nguyên Mông.'
  },
  {
    title: 'Tiếng trống Mê Linh: Khởi nghĩa Hai Bà Trưng năm 40',
    era: 'Thời kỳ Bắc thuộc lần 1',
    duration: 45,
    desc: 'Trưng Trắc và Trưng Nhị phất cờ khởi nghĩa quét sạch thái thú Tô Định.'
  }
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [historicalEra, setHistoricalEra] = useState('Thời kỳ Tự chủ & Tiền Ngô');
  const [targetDurationSec, setTargetDurationSec] = useState(30);
  const [autoStart, setAutoStart] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_TOPICS[0]) => {
    setTitle(preset.title);
    setHistoricalEra(preset.era);
    setTargetDurationSec(preset.duration);
    setDescription(preset.desc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập chủ đề video');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        title,
        description,
        historicalEra,
        targetDurationSec,
        autoStart
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi tạo dự án');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-700/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-suvang-500/20 text-suvang-400 flex items-center justify-center border border-suvang-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-serif">Tạo Dự Án Video Lịch Sử</h2>
            <p className="text-xs text-slate-400">Định dạng chuẩn 9:16 (1080×1920) dành riêng cho Facebook Reels</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Quick Suggestion Presets */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-suvang-400" />
            <span>Gợi ý chủ đề hào hùng đã được xác thực sử liệu:</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_TOPICS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-amber-950/40 border border-slate-700 hover:border-suvang-500/50 transition-all text-xs"
              >
                <div className="font-semibold text-slate-200 line-clamp-1">{preset.title}</div>
                <div className="text-[11px] text-suvang-400/80 mt-0.5">{preset.era} • {preset.duration}s</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Chủ đề sự kiện lịch sử <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Trận Bạch Đằng năm 938 của Ngô Quyền..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-suvang-500 focus:ring-1 focus:ring-suvang-500 text-white text-sm outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Thời kỳ / Triều đại
              </label>
              <input
                type="text"
                value={historicalEra}
                onChange={(e) => setHistoricalEra(e.target.value)}
                placeholder="VD: Nhà Trần, Tây Sơn..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-suvang-500 text-white text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-suvang-400" />
                <span>Thời lượng mục tiêu Reels</span>
              </label>
              <select
                value={targetDurationSec}
                onChange={(e) => setTargetDurationSec(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-suvang-500 text-white text-sm outline-none"
              >
                <option value={30}>30 giây (Nhịp nhanh, 4 cảnh - Khuyên dùng)</option>
                <option value={45}>45 giây (Chi tiết, 5-6 cảnh)</option>
                <option value={60}>60 giây (Đầy đủ hồi kết, 6-8 cảnh)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ghi chú thêm về góc nhìn (Tùy chọn)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Nhấn mạnh vào kỹ thuật đóng cọc, góc nhìn thủy triều, trích dẫn Đại Việt Sử Ký Toàn Thư..."
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-suvang-500 text-white text-sm outline-none resize-none"
            />
          </div>

          {/* Auto Start checkbox */}
          <div className="pt-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="autoStart"
              checked={autoStart}
              onChange={(e) => setAutoStart(e.target.checked)}
              className="w-4 h-4 rounded text-suvang-500 focus:ring-suvang-500 bg-slate-950 border-slate-700"
            />
            <label htmlFor="autoStart" className="text-xs text-slate-300 cursor-pointer">
              Tự động bắt đầu <strong className="text-suvang-400">Research Agent</strong> ngay sau khi tạo
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-suvang-500 to-amber-600 hover:from-suvang-400 hover:to-amber-500 text-sudam-950 font-bold text-sm shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang khởi tạo...</span>
                </>
              ) : (
                <span>Tạo và Bắt đầu</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
