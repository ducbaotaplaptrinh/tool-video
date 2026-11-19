import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { Dashboard } from './pages/Dashboard.js';
import { ProjectDetail } from './pages/ProjectDetail.js';
import { CreateProjectModal } from './components/CreateProjectModal.js';
import { ApiService, ProjectSummary, SystemHealth } from './services/api.js';

export function App() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [healthData, projectsData] = await Promise.all([
        ApiService.getHealth().catch(() => null),
        ApiService.listProjects().catch(() => [])
      ]);
      setHealth(healthData);
      setProjects(projectsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (data: {
    title: string;
    description?: string;
    historicalEra: string;
    targetDurationSec: number;
    autoStart: boolean;
  }) => {
    const created = await ApiService.createProject(data);
    await loadData();
    if (created && created.id) {
      setSelectedProjectId(created.id);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa dự án này cùng toàn bộ tài nguyên video?')) {
      await ApiService.deleteProject(id);
      await loadData();
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-sudam-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        health={health}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onGoHome={() => setSelectedProjectId(null)}
      />

      <main className="flex-1">
        {selectedProjectId ? (
          <ProjectDetail
            projectId={selectedProjectId}
            onBack={() => {
              setSelectedProjectId(null);
              loadData();
            }}
          />
        ) : (
          <Dashboard
            projects={projects}
            onSelectProject={(id) => setSelectedProjectId(id)}
            onDeleteProject={handleDeleteProject}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            loading={loading}
          />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-sudam-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-suvang-400">VietSu AI Studio</span>
            <span>• Hệ thống sản xuất video lịch sử đa Agent cho Facebook Reels</span>
          </div>
          <div>
            Remotion 4.0 • FFmpeg 9.0 • 1080×1920 @ 30fps • Không bịa sử liệu
          </div>
        </div>
      </footer>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}

export default App;
