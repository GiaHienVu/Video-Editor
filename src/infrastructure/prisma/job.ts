import  prisma  from '../prisma/client';
import { Prisma, JobStatus as PrismaJobStatus } from '@prisma/client';
import {
  CreateJobInput,
  Job,
  JobStatus,
  UpdateJobInput,
} from '../../domain/entities/job.entities';
import { IJobRepository } from '../../domain/interfaces/IJobRepository';

const toBigInt = (id: string | number | bigint): bigint =>
  typeof id === 'bigint' ? id : BigInt(id);

const toPrismaStatus = (s: JobStatus): PrismaJobStatus => s as unknown as PrismaJobStatus;

function toEntity(row: Prisma.JobsGetPayload<{}>): Job {
  return {
    jobId: row.job_id.toString(),
    videoId: row.video_id.toString(),
    action: row.action,
    params: (row.params as any) ?? {},
    status: row.status as unknown as JobStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PrismaJobRepository implements IJobRepository {
  async create(data: CreateJobInput): Promise<Job> {
    try {
      const created = await prisma.jobs.create({
        data: {
          video_id: BigInt(data.videoId as any),
          action: data.action,
          params: data.params ?? {},
          status: toPrismaStatus(data.status ?? JobStatus.pending),
        },
      });
      return toEntity(created);
    } catch (e: any) {
      if (e?.code === 'P2003') {
        throw new Error('Invalid videoId: related Video does not exist');
      }
      throw e;
    }
  }

  async findById(jobId: string | number | bigint): Promise<Job | null> {
    const row = await prisma.jobs.findUnique({
      where: { job_id: toBigInt(jobId) },
    });
    return row ? toEntity(row) : null;
  }

  async listByVideo(
    videoId: string | number | bigint,
    page = 1,
    pageSize = 20
  ): Promise<{ items: Job[]; total: number; page: number; pageSize: number }> {
    const where: Prisma.JobsWhereInput = { video_id: toBigInt(videoId) };
    const skip = (page - 1) * pageSize;

    const [rows, total] = await prisma.$transaction([
      prisma.jobs.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.jobs.count({ where }),
    ]);

    return {
      items: rows.map(toEntity),
      total,
      page,
      pageSize,
    };
  }

  async listByStatus(
    status: JobStatus,
    limit = 50,
    offset = 0
  ): Promise<Job[]> {
    const rows = await prisma.jobs.findMany({
      where: { status: toPrismaStatus(status) },
      orderBy: { created_at: 'desc' },
      skip: offset,
      take: limit,
    });
    return rows.map(toEntity);
  }

  async update(
    jobId: string | number | bigint,
    data: UpdateJobInput
  ): Promise<Job> {
    const updated = await prisma.jobs.update({
      where: { job_id: toBigInt(jobId) },
      data: {
        action: data.action,
        params: data.params as any,
        status: data.status ? toPrismaStatus(data.status) : undefined,
      },
    });
    return toEntity(updated);
  }

  async updateStatus(
    jobId: string | number | bigint,
    status: JobStatus
  ): Promise<Job> {
    const updated = await prisma.jobs.update({
      where: { job_id: toBigInt(jobId) },
      data: { status: toPrismaStatus(status) },
    });
    return toEntity(updated);
  }

  async delete(jobId: string | number | bigint): Promise<void> {
    await prisma.jobs.delete({ where: { job_id: toBigInt(jobId) } });
  }
}