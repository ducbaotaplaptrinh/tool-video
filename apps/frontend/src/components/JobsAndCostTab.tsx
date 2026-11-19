import React from 'react';
import { DollarSign, Activity, Clock, CheckCircle2, AlertCircle, Terminal } from 'lucide-react';
import { CostRecord, JobRecord } from '@vietsu/shared';

interface JobsAndCostTabProps {
  jobs: JobRecord[];
  costs: CostRecord[];
}

export const JobsAndCostTab: React.FC<JobsAndCostTabProps> = ({ jobs, costs }) => {
  const totalCostUSD = costs.reduce((sum, c) => sum + c.estimatedCostUSD, 0);
  const totalCostVND = costs.reduce((sum, c) => sum + c.estimatedCostVND, 0);

  return (
    <div className="space-y-6">
      {/* Cost Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Tổng Chi Phí Ước Tính (USD)</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            ${totalCostUSD.toFixed(4)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Chế độ Mock Provider: <strong className="text-emerald-300">0đ thực tế</strong>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-suvang-400" />
            <span>Quy Đổi Sang VNĐ (Tỷ giá 25.400)</span>
          </div>
          <div className="text-2xl font-bold text-suvang-400 font-mono">
            {totalCostVND.toLocaleString()} đ
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Bao gồm toàn bộ chu kỳ 8 bước
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Tổng Tác Vụ Đã Thực Thi</span>
          </div>
          <div className="text-2xl font-bold text-purple-400 font-mono">
            {jobs.length} jobs
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Ghi nhận chi tiết trong bảng log
          </div>
        </div>
      </div>

      {/* Cost Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h4 className="font-bold text-sm text-slate-200 mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-suvang-400" />
          <span>Bảng Kê Chi Tiết Chi Phí API Từng Tác Vụ</span>
        </h4>

        {costs.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">Chưa có bản ghi chi phí nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Nhà Cung Cấp</th>
                  <th className="py-2.5 px-3">Dịch Vụ AI</th>
                  <th className="py-2.5 px-3">Đơn Vị Tiêu Thụ</th>
                  <th className="py-2.5 px-3">Chi Phí (USD)</th>
                  <th className="py-2.5 px-3">Chi Phí (VNĐ)</th>
                  <th className="py-2.5 px-3">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {costs.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-sans text-slate-200">{c.provider}</td>
                    <td className="py-2.5 px-3 text-suvang-400">{c.service}</td>
                    <td className="py-2.5 px-3">{c.unitsUsed} {c.unitType}</td>
                    <td className="py-2.5 px-3 text-emerald-400">${c.estimatedCostUSD.toFixed(4)}</td>
                    <td className="py-2.5 px-3">{c.estimatedCostVND.toLocaleString()} đ</td>
                    <td className="py-2.5 px-3 text-slate-500 font-sans">
                      {new Date(c.createdAt).toLocaleTimeString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Jobs & Live Logs Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h4 className="font-bold text-sm text-slate-200 mb-4 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-suvang-400" />
          <span>Nhật Ký Thực Thi (Job Execution &amp; State Logs)</span>
        </h4>

        {jobs.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">Chưa có tiến trình nền nào được ghi nhận</div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 font-mono text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 font-sans font-bold text-slate-200">
                    <span className="text-suvang-400">[{job.step}]</span>
                    <span>Tiến trình xử lý</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      job.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      job.status === 'RUNNING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      job.status === 'FAILED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {job.status} ({job.progressPercent}%)
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {job.startedAt ? new Date(job.startedAt).toLocaleTimeString('vi-VN') : ''}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      job.status === 'FAILED' ? 'bg-rose-500' : 'bg-gradient-to-r from-suvang-500 to-amber-600'
                    }`}
                    style={{ width: `${job.progressPercent}%` }}
                  />
                </div>

                {/* Logs list */}
                <div className="bg-black/60 rounded-lg p-2.5 text-[11px] text-slate-400 space-y-1 max-h-40 overflow-y-auto">
                  {job.logs.map((log, lIdx) => (
                    <div key={lIdx} className="leading-relaxed">
                      <span className="text-slate-600 mr-2">&gt;</span>
                      <span className={log.includes('LỖI') ? 'text-rose-400' : 'text-slate-300'}>{log}</span>
                    </div>
                  ))}
                  {job.error && (
                    <div className="text-rose-400 font-bold mt-1">
                      ! ERROR: {job.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
