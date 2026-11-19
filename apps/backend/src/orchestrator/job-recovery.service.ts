import { prisma } from '../db.js';

export class JobRecoveryService {
  /**
   * Recovers any jobs left in RUNNING status following a backend server restart or crash.
   * Ensures state consistency: all dangling jobs and their projects are marked FAILED,
   * enabling safe, idempotent retries without creating duplicate jobs.
   */
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
      logs.push(`[${new Date().toISOString()}] [RECOVERY] Máy chủ khởi động lại trong khi tác vụ "${job.step}" đang xử lý. Tiến trình bị hủy an toàn để tránh xung đột.`);

      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          error: 'Tiến trình bị gián đoạn do máy chủ khởi động lại (Server restart recovery).',
          logs: JSON.stringify(logs),
          completedAt: new Date()
        }
      });

      // Maintain consistent state: mark project as FAILED so user can cleanly trigger retry()
      await prisma.project.update({
        where: { id: job.projectId },
        data: { status: 'FAILED' }
      });

      console.log(`[JobRecovery] Dự án ${job.projectId} đã được đồng bộ trạng thái FAILED an toàn.`);
    }

    return runningJobs.length;
  }
}
