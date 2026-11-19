import { prisma } from '../db.js';

export class JobRecoveryService {
  static async recoverDanglingJobs(): Promise<number> {
    const runningJobs = await prisma.job.findMany({
      where: { status: 'RUNNING' }
    });

    if (runningJobs.length === 0) {
      return 0;
    }

    console.log(`[JobRecovery] Phát hiện ${runningJobs.length} tiến trình bị treo sau khi khởi động lại máy chủ. Đang phục hồi...`);

    for (const job of runningJobs) {
      const logs: string[] = JSON.parse(job.logs || '[]');
      logs.push(`[${new Date().toISOString()}] [RECOVERY] Máy chủ khởi động lại trong khi tác vụ đang xử lý. Tiến trình bị hủy an toàn để tránh xung đột.`);

      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          error: 'Tiến trình bị gián đoạn do máy chủ khởi động lại (Server restart recovery).',
          logs: JSON.stringify(logs),
          completedAt: new Date()
        }
      });

      // Revert project status to last stable checkpoint
      const project = await prisma.project.findUnique({ where: { id: job.projectId } });
      if (project) {
        let fallbackStatus = 'FAILED';
        if (job.step === 'RESEARCH') fallbackStatus = 'DRAFT';
        else if (job.step === 'SCRIPTING') fallbackStatus = 'RESEARCH_PENDING_APPROVAL';
        else if (job.step === 'ASSET_GENERATION' || job.step === 'EDITING_AND_QA') fallbackStatus = 'SCRIPT_PENDING_APPROVAL';
        else if (job.step === 'RENDERING') fallbackStatus = 'READY_TO_RENDER';

        await prisma.project.update({
          where: { id: job.projectId },
          data: { status: fallbackStatus }
        });

        console.log(`[JobRecovery] Dự án ${job.projectId} đã được khôi phục về trạng thái an toàn: ${fallbackStatus}`);
      }
    }

    return runningJobs.length;
  }
}
