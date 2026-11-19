export interface ProjectSummary {
  id: string;
  title: string;
  description?: string;
  historicalEra: string;
  status: string;
  targetDurationSec: number;
  renderedVideoUrl?: string;
  totalCostUSD: number;
  totalCostVND: number;
  latestJob?: {
    step: string;
    status: string;
    progressPercent: number;
    startedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  database: string;
  ffmpeg: string;
  storage: string;
  version: string;
}

export const API_BASE = '/api';

export class ApiService {
  static async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/system/health`);
    if (!res.ok) throw new Error('Không thể kiểm tra sức khỏe máy chủ');
    return res.json();
  }

  static async listProjects(): Promise<ProjectSummary[]> {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error('Lỗi tải danh sách dự án');
    return res.json();
  }

  static async getProject(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error('Không tìm thấy dự án');
    return res.json();
  }

  static async createProject(data: {
    title: string;
    description?: string;
    historicalEra: string;
    targetDurationSec: number;
    autoStart?: boolean;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Lỗi tạo dự án mới');
    }
    return res.json();
  }

  static async deleteProject(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Lỗi xóa dự án');
    return res.json();
  }

  static async startPipeline(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${id}/pipeline/start`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Lỗi kích hoạt tiến trình');
    return res.json();
  }

  static async approveResearch(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${id}/pipeline/approve-research`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Lỗi phê duyệt sử liệu');
    return res.json();
  }

  static async approveScript(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${id}/pipeline/approve-script`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Lỗi phê duyệt kịch bản');
    return res.json();
  }

  static async rerunStep(id: string, stepName: string, sceneNumber?: number): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${id}/pipeline/rerun-step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepName, sceneNumber })
    });
    if (!res.ok) throw new Error('Lỗi chạy lại bước');
    return res.json();
  }

  static async renderVideo(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${id}/render`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Lỗi kích hoạt render');
    return res.json();
  }
}
