import { CreateJobInput, Job, JobStatus, UpdateJobInput } from '../../domain/entities/job.entities';

export interface IJobRepository {
  create(data: CreateJobInput): Promise<Job>;
  findById(jobId: string | number | bigint): Promise<Job | null>;
  listByVideo(
    videoId: string | number | bigint,
    page?: number,
    pageSize?: number
  ): Promise<{ items: Job[]; total: number; page: number; pageSize: number }>;
  listByStatus(
    status: JobStatus,
    limit?: number,
    offset?: number
  ): Promise<Job[]>;
  update(jobId: string | number | bigint, data: UpdateJobInput): Promise<Job>;
  updateStatus(jobId: string | number | bigint, status: JobStatus): Promise<Job>;
  delete(jobId: string | number | bigint): Promise<void>;
}